"""Write the published revision into the staged config. Does not switch the live engine."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from portfolio_ft.config import EVAL_REPORT, SMALL_MODEL_JSON


def bump(revision: str, report_path: Path, config_path: Path = SMALL_MODEL_JSON) -> None:
    config = json.loads(config_path.read_text(encoding="utf-8"))
    report = json.loads(report_path.read_text(encoding="utf-8"))
    config["revision"] = revision
    config["publishedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    config["usefulScore"] = report["fixed"]["useful"]
    config["fixedTotal"] = report["fixed"]["total"]
    config_path.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Actualiza small-model.json con la revisión publicada")
    parser.add_argument("--revision", required=True)
    parser.add_argument("--report", default=str(EVAL_REPORT))
    args = parser.parse_args()
    bump(args.revision, Path(args.report))
    print(SMALL_MODEL_JSON)


if __name__ == "__main__":
    main()
