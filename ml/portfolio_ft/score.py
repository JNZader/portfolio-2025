"""Deterministic grounded-QA rubric.

Invented means a markdown href or a bare URL is not the chunk href and does
not appear in the chunk text. The refusal phrase and key-fact overlap decide
the other labels. There is no teacher model in the score.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

from portfolio_ft.config import GREETING_SENTINEL, NO_EVIDENCE, REFUSAL_TEXT
from portfolio_ft.textutil import BARE_URL, LINK, normalize

Expect = Literal["answer", "refusal", "greeting"]
Label = Literal["faithful", "partial", "invented", "refusal-correct", "refusal-wrong"]

GREETING_TOKENS = {"hola", "hello", "hi", "hey", "buenas"}


@dataclass(frozen=True)
class Score:
    label: Label
    matched_facts: int
    fact_count: int


def _link_sub(answer: str) -> tuple[str, list[str]]:
    found: list[str] = []

    def keep(match: Any) -> str:
        found.append(str(match.group(2)))
        return " "

    without = LINK.sub(keep, answer)
    for url in BARE_URL.findall(without):
        found.append(url.rstrip(".,;:!?"))
    return without, found


def _grounded(href: str, chunks: list[dict[str, Any]]) -> bool:
    raw = href.strip()
    norm = raw[:-1] if len(raw) > 1 and raw.endswith("/") else raw
    for chunk in chunks:
        target = str(chunk.get("href") or "")
        target_norm = target[:-1] if len(target) > 1 and target.endswith("/") else target
        if norm == target_norm:
            return True
        blob = "\n".join(
            [
                str(chunk.get("text") or ""),
                str(chunk.get("citation") or ""),
                str(chunk.get("title") or ""),
                str(chunk.get("heading") or ""),
            ]
        )
        if raw and (raw in blob or norm in blob):
            return True
    return False


def has_invented_url(answer: str, chunks: list[dict[str, Any]]) -> bool:
    _, found = _link_sub(answer)
    return any(href and not _grounded(href, chunks) for href in found)


def is_refusal(answer: str) -> bool:
    stripped = answer.strip()
    if stripped == NO_EVIDENCE:
        return True
    return REFUSAL_TEXT in answer


def is_greeting_answer(answer: str) -> bool:
    stripped = answer.strip()
    if stripped == GREETING_SENTINEL:
        return True
    if len(stripped) > 180 or is_refusal(stripped):
        return False
    tokens = set(normalize(stripped).split())
    return bool(tokens & GREETING_TOKENS)


def fact_overlap(answer: str, key_facts: list[str]) -> tuple[int, int]:
    haystack = normalize(answer)
    usable = [fact for fact in key_facts if normalize(fact)]
    matched = sum(1 for fact in usable if normalize(fact) in haystack)
    return matched, len(usable)


def score_answer(
    *,
    expect: Expect,
    answer: str,
    chunks: list[dict[str, Any]],
    key_facts: list[str],
) -> Score:
    if has_invented_url(answer, chunks):
        matched, total = fact_overlap(answer, key_facts)
        return Score("invented", matched, total)

    if is_refusal(answer):
        label: Label = "refusal-correct" if expect == "refusal" else "refusal-wrong"
        return Score(label, 0, len(key_facts))

    if expect == "refusal":
        return Score("refusal-wrong", 0, len(key_facts))

    if expect == "greeting":
        label = "faithful" if is_greeting_answer(answer) else "partial"
        return Score(label, 0, 0)

    matched, total = fact_overlap(answer, key_facts)
    label = "faithful" if matched == total else "partial"
    return Score(label, matched, total)
