"""Fixed eval questions and questions about chunks that changed."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from portfolio_ft.textutil import chunk_digest, normalize

FIXED_PATH = Path(__file__).with_name("fixed_questions.json")
WORD = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{6,}")
NUMBER = re.compile(r"\d[\d.,]*")
AUTO_CAP = 24


def load_fixed_questions(path: Path | None = None) -> list[dict[str, Any]]:
    source = path or FIXED_PATH
    payload = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(payload, list) or len(payload) != 12:
        raise ValueError(f"{source} must contain 12 questions")
    return payload


def held_out_queries(questions: list[dict[str, Any]]) -> set[str]:
    return {normalize(str(item["query"])) for item in questions}


def changed_chunks(
    previous: list[dict[str, Any]] | None,
    current: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if not previous:
        return []
    old = {str(chunk["id"]): chunk_digest(chunk) for chunk in previous}
    changed: list[dict[str, Any]] = []
    for chunk in current:
        if old.get(str(chunk["id"])) != chunk_digest(chunk):
            changed.append(chunk)
    return changed


def key_facts_for(chunk: dict[str, Any]) -> list[str]:
    facts: list[str] = []
    for number in NUMBER.findall(str(chunk.get("text") or "")):
        if number not in facts:
            facts.append(number)
        if len(facts) == 3:
            return facts
    if facts:
        return facts
    words = WORD.findall(str(chunk.get("text") or ""))
    if words:
        return words[:2]
    title = str(chunk.get("title") or "").strip()
    return [title] if title else ["portfolio"]


def auto_questions(chunks: list[dict[str, Any]], *, cap: int = AUTO_CAP) -> list[dict[str, Any]]:
    ordered = sorted(chunks, key=lambda chunk: str(chunk["id"]))[:cap]
    questions: list[dict[str, Any]] = []
    for chunk in ordered:
        locale = str(chunk["locale"])
        title = str(chunk["title"])
        if locale == "en":
            query = f"What does the portfolio say about {title}?"
            path = f"/en/proyectos/{chunk['slug']}"
        else:
            query = f"¿Qué dice el portfolio sobre {title}?"
            path = f"/proyectos/{chunk['slug']}"
        questions.append(
            {
                "id": f"auto:{chunk['id']}",
                "locale": locale,
                "path": path,
                "expect": "answer",
                "query": query,
                "keyFacts": key_facts_for(chunk),
                "group": "auto",
            }
        )
    return questions
