"""Paths and constants shared by the fine-tune steps."""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
ML_ROOT = REPO_ROOT / "ml"
DATA_DIR = ML_ROOT / "data"
VENDOR_DIR = ML_ROOT / "vendor"

CORPUS_PATH = DATA_DIR / "corpus.json"
DATASET_TRAIN = DATA_DIR / "train.jsonl"
DATASET_HELDOUT = DATA_DIR / "heldout.jsonl"
MERGED_DIR = DATA_DIR / "merged"
EVAL_REPORT = DATA_DIR / "eval-report.json"
EXPORT_DIR = DATA_DIR / "onnx"
REVISION_FILE = DATA_DIR / "revision.txt"
SMALL_MODEL_JSON = REPO_ROOT / "lib" / "qa" / "local" / "small-model.json"

DEFAULT_BASE_MODEL = "LiquidAI/LFM2.5-350M"
DEFAULT_REPO = "JNZader/portfolio-chat-lfm2.5-350m-ONNX"
DEFAULT_DTYPE = "q4f16"

REFUSAL_TEXT = "No tengo una cita publicada sobre eso."
NO_EVIDENCE = "NO_PUBLISHED_QUOTE"
GREETING_SENTINEL = "PUBLISHED_QA_GREETING"

GREETING_REPLY = {
    "es": "Hola. Preguntame por un proyecto publicado o por la formación.",
    "en": "Hi. Ask about a published project or the training.",
}

SEED = 42
REFUSAL_RATIO = 0.25
LORA_RANK = 16
MAX_SEQ_LENGTH = 2048
EPOCHS = 3
MIN_USEFUL = 8
FIXED_TOTAL = 12

# LiquidONNX commit whose `lfm2-export` still writes a Transformers.js graph
# (past_conv / past_key_values, GatherBlockQuantized, symmetric MatMulNBits,
# block size 32). Later commits write onnxruntime-genai folders, which
# transformers.js 4.3.2 cannot load. optimum cannot trace the hybrid conv.
LIQUID_ONNX_EXPORT_REV = "5ae758991464f2acd77c4ba5b654a9f32dbd60ea"
LIQUID_ONNX_EXPORT_REPO = "https://github.com/Liquid4All/onnx-export.git"
# That revision's text CLI has no q4f16 precision. q4f16 is converted from
# the q4 graph with onnxruntime>=1.30 (onnxruntime.transformers.float16),
# the runtime pin in that exporter's pyproject.toml.
ONNXRUNTIME_FLOAT16_MIN = "1.30.0"

# Paths that feed buildPublishedSnapshot, the prompt, or the retrieval gate.
# .github/workflows/retrain-chat-model.yml must list every entry.
CORPUS_WORKFLOW_PATHS = (
    "lib/data/**",
    "lib/qa/chunk.ts",
    "lib/qa/snapshot.ts",
    "lib/qa/retrieve.ts",
    "lib/qa/prompt.ts",
    "lib/qa/text.ts",
    "lib/qa/types.ts",
    "lib/qa/path.ts",
    "lib/qa/local/prepare.ts",
    "lib/seo/locale-url.ts",
)

REFUSAL_REASONS = (
    "price",
    "email",
    "off_topic",
    "prompt_injection",
    "cross_project",
)
