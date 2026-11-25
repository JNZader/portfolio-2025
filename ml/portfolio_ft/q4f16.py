"""Transformers.js cache contract and the q4 → q4f16 graph step.

`lfm2-export` at the pinned LiquidONNX revision writes `model_q4.onnx` and
does not write `model_q4f16.onnx`. q4f16 is that graph with fp16 activations
and fp16 conv/KV caches, and fp32 logits. The activation pass is
`onnxruntime.transformers.float16` from onnxruntime>=1.30. optimum is not
used: it does not trace LFM2's hybrid conv cache.
"""

from __future__ import annotations

from pathlib import Path

import onnx
from onnx import TensorProto, helper


class ContractError(ValueError):
    """The ONNX graph is not a transformers.js LFM2 decoder."""


def cache_input_names(layer_types: list[str]) -> list[str]:
    names: list[str] = []
    for index, kind in enumerate(layer_types):
        if kind == "full_attention":
            names.append(f"past_key_values.{index}.key")
            names.append(f"past_key_values.{index}.value")
        elif kind == "conv":
            names.append(f"past_conv.{index}")
        else:
            raise ContractError(f"capa no soportada: {kind}")
    return names


def cache_output_names(layer_types: list[str]) -> list[str]:
    names: list[str] = []
    for index, kind in enumerate(layer_types):
        if kind == "full_attention":
            names.append(f"present.{index}.key")
            names.append(f"present.{index}.value")
        elif kind == "conv":
            names.append(f"present_conv.{index}")
        else:
            raise ContractError(f"capa no soportada: {kind}")
    return names


def _is_cache_input(name: str) -> bool:
    return name.startswith("past_key_values.") or name.startswith("past_conv.")


def _is_cache_output(name: str) -> bool:
    return name.startswith("present.") or name.startswith("present_conv.")


def _elem(value: onnx.ValueInfoProto) -> int:
    return int(value.type.tensor_type.elem_type)


def rewrite_cache_io_to_fp16(model: onnx.ModelProto) -> int:
    """Move cache inputs and outputs to fp16 and cast at the graph boundary."""
    graph = model.graph
    changed = 0
    for value in graph.input:
        if not _is_cache_input(value.name) or _elem(value) != TensorProto.FLOAT:
            continue
        fp32_name = f"{value.name}__fp32"
        _rename_inputs(graph, value.name, fp32_name)
        value.type.tensor_type.elem_type = TensorProto.FLOAT16
        cast = helper.make_node(
            "Cast",
            inputs=[value.name],
            outputs=[fp32_name],
            to=TensorProto.FLOAT,
            name="cast_in_" + value.name.replace(".", "_"),
        )
        graph.node.insert(0, cast)
        changed += 1

    for value in graph.output:
        if not _is_cache_output(value.name) or _elem(value) != TensorProto.FLOAT:
            continue
        fp32_name = f"{value.name}__fp32"
        _rename_outputs(graph, value.name, fp32_name)
        value.type.tensor_type.elem_type = TensorProto.FLOAT16
        cast = helper.make_node(
            "Cast",
            inputs=[fp32_name],
            outputs=[value.name],
            to=TensorProto.FLOAT16,
            name="cast_out_" + value.name.replace(".", "_"),
        )
        graph.node.append(cast)
        changed += 1
    return changed


def _rename_inputs(graph: onnx.GraphProto, old: str, new: str) -> None:
    for node in graph.node:
        for index, name in enumerate(node.input):
            if name == old:
                node.input[index] = new


def _rename_outputs(graph: onnx.GraphProto, old: str, new: str) -> None:
    for node in graph.node:
        for index, name in enumerate(node.output):
            if name == old:
                node.output[index] = new


def assert_transformersjs_contract(
    model: onnx.ModelProto,
    layer_types: list[str],
    *,
    cache_dtype: int,
) -> None:
    inputs = {value.name: value for value in model.graph.input}
    outputs = {value.name: value for value in model.graph.output}
    for name in ("input_ids", "attention_mask"):
        if name not in inputs:
            raise ContractError(f"falta la entrada {name}")
    if "logits" not in outputs:
        raise ContractError("falta la salida logits")
    if _elem(outputs["logits"]) != TensorProto.FLOAT:
        raise ContractError("logits tiene que quedar en fp32")
    for name in cache_input_names(layer_types):
        if name not in inputs:
            raise ContractError(f"falta la caché de entrada {name}")
        if _elem(inputs[name]) != cache_dtype:
            raise ContractError(f"dtype inesperado en {name}")
    for name in cache_output_names(layer_types):
        if name not in outputs:
            raise ContractError(f"falta la caché de salida {name}")
        if _elem(outputs[name]) != cache_dtype:
            raise ContractError(f"dtype inesperado en {name}")


def convert_activations_to_fp16(model: onnx.ModelProto) -> tuple[onnx.ModelProto, str]:
    """fp16 activations. Cache IO stays put until rewrite_cache_io_to_fp16."""
    try:
        from onnxruntime.transformers.float16 import convert_float_to_float16
    except ImportError as exc:
        raise SystemExit(
            "q4f16 necesita onnxruntime>=1.30 con onnxruntime.transformers.float16. "
            "Es el pin de LiquidONNX en 5ae7589. No uses optimum para esta arquitectura."
        ) from exc
    try:
        converted = convert_float_to_float16(
            model,
            keep_io_types=True,
            disable_shape_infer=True,
            force_fp16_initializers=True,
            op_block_list=["GatherBlockQuantized", "MatMulNBits"],
        )
    except TypeError:
        converted = convert_float_to_float16(model, keep_io_types=True)
    return converted, "onnxruntime.transformers.float16"


def convert_q4_file_to_q4f16(source: Path, dest: Path, layer_types: list[str]) -> str:
    loaded = onnx.load(str(source), load_external_data=True)
    model, method = convert_activations_to_fp16(loaded)
    rewrite_cache_io_to_fp16(model)
    assert_transformersjs_contract(model, layer_types, cache_dtype=TensorProto.FLOAT16)
    dest.parent.mkdir(parents=True, exist_ok=True)
    data_name = f"{dest.stem}.onnx_data"
    onnx.save_model(
        model,
        str(dest),
        save_as_external_data=True,
        all_tensors_to_one_file=True,
        location=data_name,
    )
    return method
