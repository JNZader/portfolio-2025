"""Text helpers shared by the dataset builder and the scorer."""

from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from typing import Any

LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BARE_URL = re.compile(r"https?://[^\s<>)\]]+")
SENTENCE = re.compile(r"(?<=[.!?])\s+")
THINKING = re.compile(r"<think>[\s\S]*?</think>", re.IGNORECASE)


def normalize(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value)
    stripped = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    lowered = stripped.lower()
    return " ".join(re.sub(r"[^a-z0-9]+", " ", lowered).split())


def strip_thinking(text: str) -> str:
    without = THINKING.sub("", text)
    without = re.sub(r"^\s*<think>\s*", "", without, flags=re.IGNORECASE)
    return without.strip()


def strip_links(text: str) -> str:
    without_markdown = LINK.sub(lambda match: match.group(1), text)
    return BARE_URL.sub("", without_markdown)


def first_sentences(text: str, *, limit: int = 420) -> str:
    flat = " ".join(strip_links(text).split())
    if not flat:
        return ""
    chosen: list[str] = []
    total = 0
    for part in SENTENCE.split(flat):
        piece = part.strip()
        if not piece:
            continue
        if chosen and total + len(piece) > limit:
            break
        chosen.append(piece)
        total += len(piece)
        if len(chosen) == 2:
            break
    return " ".join(chosen).strip() if chosen else flat[:limit].strip()


def corpus_sha(chunks: list[dict[str, Any]]) -> str:
    payload = json.dumps(chunks, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode()).hexdigest()


def chunk_digest(chunk: dict[str, Any]) -> str:
    payload = {
        "heading": chunk.get("heading"),
        "href": chunk.get("href"),
        "text": chunk.get("text"),
        "title": chunk.get("title"),
    }
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(encoded.encode()).hexdigest()
