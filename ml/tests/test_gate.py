from pathlib import Path

from portfolio_ft.config import CORPUS_WORKFLOW_PATHS, DEFAULT_BASE_MODEL, DEFAULT_REPO, MIN_USEFUL
from portfolio_ft.gate import decide

ROOT = Path(__file__).resolve().parents[2]


def items(label: str, count: int, expect: str = "answer") -> list[dict]:
    return [{"expect": expect, "label": label} for _ in range(count)]


def test_gate_passes_at_the_default_floor_without_a_previous_model():
    fixed = items("faithful", 8) + items("refusal-correct", 0)
    decision = decide(fixed_items=fixed, auto_items=[], previous_invented=None, min_useful=MIN_USEFUL)
    assert decision.passed
    assert decision.useful == 8


def test_gate_rejects_a_low_score_a_regression_and_a_broken_refusal():
    low = decide(
        fixed_items=items("faithful", 7),
        auto_items=[],
        previous_invented=0,
        min_useful=8,
    )
    assert not low.passed
    regression = decide(
        fixed_items=items("faithful", 8) + items("invented", 2),
        auto_items=[],
        previous_invented=1,
        min_useful=8,
    )
    assert not regression.passed
    broken = decide(
        fixed_items=items("faithful", 8) + items("refusal-wrong", 1, expect="refusal"),
        auto_items=[],
        previous_invented=0,
        min_useful=8,
    )
    assert not broken.passed
    assert broken.refusals_broken


def test_new_content_with_an_invented_url_blocks_publish():
    decision = decide(
        fixed_items=items("faithful", 12),
        auto_items=items("invented", 1),
        previous_invented=0,
        min_useful=8,
    )
    assert not decision.passed


def test_site_config_and_workflow_stay_aligned():
    staged = __import__("json").loads((ROOT / "lib/qa/local/small-model.json").read_text())
    assert staged["id"] == DEFAULT_REPO
    assert staged["baseModel"] == DEFAULT_BASE_MODEL
    assert staged["dtype"] == "q4f16"
    workflow = (ROOT / ".github/workflows/retrain-chat-model.yml").read_text()
    for path in CORPUS_WORKFLOW_PATHS:
        assert path in workflow
    assert "pull_request:" not in workflow
    assert "self-hosted" in workflow
    assert "HF_TOKEN" in workflow
    cpu = (ROOT / ".github/workflows/ml-tests.yml").read_text()
    assert "ubuntu-latest" in cpu
    assert "self-hosted" not in cpu
