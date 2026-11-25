"""Apply the gate, then export and publish. A rejection does not upload."""

from __future__ import annotations

import json
import os
from pathlib import Path

from portfolio_ft.config import EVAL_REPORT, MERGED_DIR, MIN_USEFUL, REVISION_FILE, SMALL_MODEL_JSON
from portfolio_ft.gate import decide
from portfolio_ft.publish import previous_eval_report, publish_folder


def main() -> None:
    report_path = Path(os.environ.get("FT_REPORT", str(EVAL_REPORT)))
    report = json.loads(report_path.read_text(encoding="utf-8"))
    staged = json.loads(SMALL_MODEL_JSON.read_text(encoding="utf-8"))
    repo = os.environ.get("FT_REPO") or str(report.get("repoId") or staged["id"])
    min_useful = int(os.environ.get("FT_MIN_USEFUL", str(MIN_USEFUL)))
    previous_revision = str(report.get("previousRevision") or staged["revision"])
    previous = previous_eval_report(repo, previous_revision)
    previous_invented = None
    if previous is not None:
        fixed = previous.get("fixed")
        if isinstance(fixed, dict) and isinstance(fixed.get("invented"), int):
            previous_invented = fixed["invented"]
    decision = decide(
        fixed_items=list(report["fixed"]["items"]),
        auto_items=list(report["auto"]["items"]),
        previous_invented=previous_invented,
        min_useful=min_useful,
    )
    report["gate"] = {
        "passed": decision.passed,
        "reasons": list(decision.reasons),
        "previousInvented": previous_invented,
        "minUseful": min_useful,
        "useful": decision.useful,
        "invented": decision.invented,
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not decision.passed:
        raise SystemExit("gate rechazado: " + "; ".join(decision.reasons))

    from portfolio_ft.export_onnx import export_merged

    model_dir = export_merged(Path(os.environ.get("FT_MERGED", str(MERGED_DIR))))
    revision = publish_folder(model_dir, report, repo)
    REVISION_FILE.parent.mkdir(parents=True, exist_ok=True)
    REVISION_FILE.write_text(revision + "\n", encoding="utf-8")
    print(revision)


if __name__ == "__main__":
    main()
