"""Export the chunks `buildPublishedSnapshot` produces."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from portfolio_ft.bridge import dump_corpus
from portfolio_ft.config import CORPUS_PATH
from portfolio_ft.textutil import corpus_sha


def load_corpus(path=CORPUS_PATH) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    chunks = payload["chunks"]
    if not isinstance(chunks, list) or not chunks:
        raise RuntimeError(f"{path} no tiene chunks")
    return chunks


def main() -> None:
    parser = argparse.ArgumentParser(description="Vuelca el corpus de retrieval de producción")
    parser.add_argument("--out", type=str, default=str(CORPUS_PATH))
    args = parser.parse_args()
    out = Path(args.out)
    dump_corpus(out)
    chunks = load_corpus(out)
    print(f"corpus {len(chunks)} chunks sha256={corpus_sha(chunks)} -> {out}")


if __name__ == "__main__":
    main()
