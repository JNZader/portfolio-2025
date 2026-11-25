"""Call the TypeScript retrieval and prompt. Python does not reimplement them."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from typing import Any

from portfolio_ft.config import REPO_ROOT


def run_bridge(args: list[str]) -> None:
    env = os.environ.copy()
    env["QA_BRIDGE_ARGS"] = json.dumps(args)
    env["VITE_CONFIG_NATIVE_IGNORE_WARNING"] = "true"
    subprocess.run(
        ["npm", "run", "qa:bridge", "--", "--reporter=dot"],
        cwd=REPO_ROOT,
        env=env,
        check=True,
    )


def dump_corpus(out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    run_bridge(["dump", "--out", str(out)])


def render_prompts(requests: list[dict[str, Any]], out: Path) -> dict[str, tuple[str, str]]:
    request_path = out.with_suffix(".requests.json")
    request_path.parent.mkdir(parents=True, exist_ok=True)
    request_path.write_text(json.dumps({"items": requests}), encoding="utf-8")
    run_bridge(["render", "--requests", str(request_path), "--out", str(out)])
    payload = json.loads(out.read_text(encoding="utf-8"))
    rendered: dict[str, tuple[str, str]] = {}
    for item in payload["items"]:
        rendered[str(item["id"])] = (str(item["system"]), str(item["question"]))
    return rendered


def prepare_turns(requests: list[dict[str, Any]], out: Path) -> list[dict[str, Any]]:
    request_path = out.with_suffix(".requests.json")
    request_path.parent.mkdir(parents=True, exist_ok=True)
    request_path.write_text(json.dumps({"items": requests}), encoding="utf-8")
    run_bridge(["prepare", "--requests", str(request_path), "--out", str(out)])
    payload = json.loads(out.read_text(encoding="utf-8"))
    items = payload["items"]
    if not isinstance(items, list):
        raise RuntimeError("prepare no devolvió una lista")
    return items
