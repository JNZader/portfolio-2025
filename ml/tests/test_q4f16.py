import onnx
from onnx import TensorProto, helper

from portfolio_ft.q4f16 import (
    ContractError,
    assert_transformersjs_contract,
    rewrite_cache_io_to_fp16,
)


def toy() -> onnx.ModelProto:
    nodes = [
        helper.make_node("Identity", ["past_conv.0"], ["present_conv.0"]),
        helper.make_node("Identity", ["logits_in"], ["logits"]),
    ]
    graph = helper.make_graph(
        nodes,
        "toy-lfm2",
        [
            helper.make_tensor_value_info("input_ids", TensorProto.INT64, [1, 2]),
            helper.make_tensor_value_info("attention_mask", TensorProto.INT64, [1, 2]),
            helper.make_tensor_value_info("past_conv.0", TensorProto.FLOAT, [1, 4, 3]),
            helper.make_tensor_value_info("logits_in", TensorProto.FLOAT, [1, 4]),
        ],
        [
            helper.make_tensor_value_info("logits", TensorProto.FLOAT, [1, 4]),
            helper.make_tensor_value_info("present_conv.0", TensorProto.FLOAT, [1, 4, 3]),
        ],
    )
    return helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])


def test_cache_io_becomes_fp16_and_logits_stay_fp32():
    model = toy()
    changed = rewrite_cache_io_to_fp16(model)
    assert changed == 2
    onnx.checker.check_model(model)
    assert_transformersjs_contract(model, ["conv"], cache_dtype=TensorProto.FLOAT16)
    outputs = {value.name: value for value in model.graph.output}
    assert outputs["logits"].type.tensor_type.elem_type == TensorProto.FLOAT


def test_contract_rejects_a_graph_without_the_conv_cache():
    model = toy()
    try:
        assert_transformersjs_contract(model, ["conv", "full_attention"], cache_dtype=TensorProto.FLOAT)
    except ContractError as exc:
        assert "past_key_values" in str(exc)
    else:
        raise AssertionError("el contrato tenía que fallar")
