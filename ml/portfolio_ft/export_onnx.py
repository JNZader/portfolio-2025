"""Export the merged checkpoint to the Transformers.js q4 and q4f16 graphs."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

import onnx
from onnx import TensorProto

from portfolio_ft.config import (
    DATA_DIR,
    LIQUID_ONNX_EXPORT_REPO,
    LIQUID_ONNX_EXPORT_REV,
    VENDOR_DIR,
)
from portfolio_ft.q4f16 import (
    ContractError,
    assert_transformersjs_contract,
    convert_q4_file_to_q4f16,
)


def ensure_exporter() -> Path:
    vendor = VENDOR_DIR / "onnx-export"
    if not (vendor / ".git").exists():
        vendor.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "clone", LIQUID_ONNX_EXPORT_REPO, str(vendor)], check=True)
    subprocess.run(["git", "checkout", LIQUID_ONNX_EXPORT_REV], cwd=vendor, check=True)
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=vendor, text=True).strip()
    if head != LIQUID_ONNX_EXPORT_REV:
        raise SystemExit(
            f"onnx-export está en {head}, no en {LIQUID_ONNX_EXPORT_REV}. "
            "Un commit más nuevo escribe carpetas onnxruntime-genai que transformers.js no carga."
        )
    subprocess.run(["uv", "sync"], cwd=vendor, check=True)
    return vendor


def _layer_types(model_dir: Path) -> list[str]:
    config = json.loads((model_dir / "config.json").read_text(encoding="utf-8"))
    layer_types = config.get("layer_types")
    if not isinstance(layer_types, list) or not layer_types:
        raise SystemExit("config.json no trae layer_types de LFM2")
    return [str(kind) for kind in layer_types]


def _patch_config(model_dir: Path) -> None:
    path = model_dir / "config.json"
    config = json.loads(path.read_text(encoding="utf-8"))
    js = config.get("transformers.js_config")
    if not isinstance(js, dict):
        js = {}
    js["use_external_data_format"] = True
    cache = js.get("kv_cache_dtype")
    if not isinstance(cache, dict):
        cache = {}
    cache["q4f16"] = "float16"
    cache["fp16"] = "float16"
    js["kv_cache_dtype"] = cache
    config["transformers.js_config"] = js
    path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")


def _drop_fp32(onnx_dir: Path) -> None:
    for name in (
        "model.onnx",
        "model.onnx_data",
        "model_fp16.onnx",
        "model_fp16.onnx_data",
        "model_q4_intermediate.onnx",
        "model_q4_intermediate.onnx_data",
    ):
        path = onnx_dir / name
        if path.exists():
            path.unlink()


def export_merged(merged: Path, work: Path | None = None) -> Path:
    """Return the folder ready to upload (tokenizer, config, q4, q4f16)."""
    exporter = ensure_exporter()
    root = work or (DATA_DIR / "liquid-out")
    if root.exists():
        shutil.rmtree(root)
    root.mkdir(parents=True)
    env = os.environ.copy()
    env["CUDA_VISIBLE_DEVICES"] = ""
    subprocess.run(
        [
            "uv",
            "run",
            "lfm2-export",
            str(merged),
            "--output-dir",
            str(root),
            "--output-name",
            "portfolio-chat",
            "--precision",
            "q4",
            "--block-size",
            "32",
        ],
        cwd=exporter,
        env=env,
        check=True,
    )
    model_dir = root / "exports" / "portfolio-chat"
    onnx_dir = model_dir / "onnx"
    q4 = onnx_dir / "model_q4.onnx"
    if not q4.exists():
        raise SystemExit(f"no apareció {q4}")
    layer_types = _layer_types(model_dir)
    try:
        assert_transformersjs_contract(
            onnx.load(str(q4), load_external_data=False),
            layer_types,
            cache_dtype=TensorProto.FLOAT,
        )
    except ContractError as exc:
        raise SystemExit(
            f"el grafo q4 no cumple el contrato de transformers.js ({exc}). "
            f"Dejá el exporter en {LIQUID_ONNX_EXPORT_REV}."
        ) from exc
    method = convert_q4_file_to_q4f16(q4, onnx_dir / "model_q4f16.onnx", layer_types)
    _patch_config(model_dir)
    _drop_fp32(onnx_dir)
    manifest = {
        "exporter": LIQUID_ONNX_EXPORT_REPO,
        "exporterRevision": LIQUID_ONNX_EXPORT_REV,
        "precision": ["q4", "q4f16"],
        "blockSize": 32,
        "symmetric": True,
        "q4f16Method": method,
        "runtime": "transformers.js 4.3.2",
    }
    (model_dir / "export-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"onnx listo en {model_dir} ({method})")
    return model_dir


def main() -> None:
    import argparse

    from portfolio_ft.config import MERGED_DIR

    parser = argparse.ArgumentParser(description="Exporta q4 y q4f16 para transformers.js")
    parser.add_argument("--merged", default=str(MERGED_DIR))
    args = parser.parse_args()
    export_merged(Path(args.merged))


if __name__ == "__main__":
    main()
