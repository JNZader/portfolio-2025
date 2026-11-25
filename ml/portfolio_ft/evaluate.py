"""Score the merged model with production retrieval and the production prompt.

Generation is greedy so the rubric does not move between runs. The browser
still samples at temperature 0.2; that gap is documented in ml/README.md.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from portfolio_ft.bridge import prepare_turns
from portfolio_ft.config import (
    CORPUS_PATH,
    DATA_DIR,
    DEFAULT_BASE_MODEL,
    EVAL_REPORT,
    MERGED_DIR,
    SMALL_MODEL_JSON,
)
from portfolio_ft.corpus import load_corpus
from portfolio_ft.gate import invented_count, refusals_broken, useful_count
from portfolio_ft.questions import auto_questions, changed_chunks, held_out_queries, load_fixed_questions
from portfolio_ft.score import score_answer
from portfolio_ft.textutil import corpus_sha, normalize, strip_thinking

Generate = Callable[[str, str], str]


def score_prepared(
    question: dict[str, Any],
    prepared: dict[str, Any],
    generate: Generate | None,
) -> dict[str, Any]:
    if prepared["kind"] == "canned":
        answer = str(prepared["text"])
        chunks: list[dict[str, Any]] = []
        canned = True
    else:
        if generate is None:
            raise RuntimeError(f"{question['id']} necesita el modelo y no hay generador")
        answer = strip_thinking(generate(str(prepared["system"]), str(prepared["question"])))
        chunks = list(prepared.get("chunks") or [])
        canned = False
    scored = score_answer(
        expect=question["expect"],
        answer=answer,
        chunks=chunks,
        key_facts=list(question.get("keyFacts") or []),
    )
    return {
        "id": question["id"],
        "expect": question["expect"],
        "label": scored.label,
        "query": question["query"],
        "locale": question["locale"],
        "matchedFacts": scored.matched_facts,
        "factCount": scored.fact_count,
        "canned": canned,
        "sourceIds": [chunk["id"] for chunk in chunks],
        "answer": answer,
    }


def _missing(exc: BaseException) -> bool:
    if type(exc).__name__ in {"RepositoryNotFoundError", "EntryNotFoundError", "RevisionNotFoundError"}:
        return True
    response = getattr(exc, "response", None)
    return getattr(response, "status_code", None) == 404


def previous_corpus(repo: str, revision: str) -> list[dict[str, Any]] | None:
    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("huggingface_hub no está instalado; no hay corpus previo")
        return None
    try:
        path = hf_hub_download(repo_id=repo, filename="corpus.json", revision=revision)
    except Exception as exc:
        if _missing(exc):
            print(f"sin corpus previo en {repo}@{revision}")
            return None
        raise
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    chunks = payload.get("chunks") if isinstance(payload, dict) else None
    return chunks if isinstance(chunks, list) else None


def _generate_from(merged: Path) -> Generate:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(merged)
    model = AutoModelForCausalLM.from_pretrained(
        merged,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )
    model.eval()

    def generate(system: str, question: str) -> str:
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ]
        try:
            encoded = tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt",
                return_dict=True,
                enable_thinking=False,
            )
        except TypeError:
            encoded = tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt",
                return_dict=True,
            )
        encoded = {key: value.to(model.device) for key, value in encoded.items()}
        prompt_len = encoded["input_ids"].shape[-1]
        output = model.generate(
            **encoded,
            max_new_tokens=320,
            do_sample=False,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.eos_token_id,
        )
        return tokenizer.decode(output[0][prompt_len:], skip_special_tokens=True)

    return generate


def _summarize(items: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "total": len(items),
        "useful": useful_count(items),
        "invented": invented_count(items),
        "refusalsBroken": refusals_broken(items),
        "items": items,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Eval grounded del modelo fusionado")
    parser.add_argument("--merged", default=str(MERGED_DIR))
    parser.add_argument("--corpus", default=str(CORPUS_PATH))
    parser.add_argument("--report", default=str(EVAL_REPORT))
    parser.add_argument("--base", default=DEFAULT_BASE_MODEL)
    args = parser.parse_args()

    fixed = load_fixed_questions()
    for item in fixed:
        item["group"] = "fixed"
    chunks = load_corpus(Path(args.corpus))
    staged = json.loads(SMALL_MODEL_JSON.read_text(encoding="utf-8"))
    repo = staged["id"]
    revision = staged["revision"]
    blocked = held_out_queries(fixed)
    auto = [
        question
        for question in auto_questions(changed_chunks(previous_corpus(repo, revision), chunks))
        if normalize(question["query"]) not in blocked
    ]
    questions = [*fixed, *auto]
    prepared = prepare_turns(
        [
            {
                "id": question["id"],
                "query": question["query"],
                "locale": question["locale"],
                "path": question.get("path") or "/",
                "priorQuery": None,
            }
            for question in questions
        ],
        DATA_DIR / "prepared.json",
    )
    by_id = {str(item["id"]): item for item in prepared}
    needs_model = any(by_id[question["id"]]["kind"] == "generate" for question in questions)
    generate = _generate_from(Path(args.merged)) if needs_model else None
    fixed_items = []
    auto_items = []
    for question in questions:
        scored = score_prepared(question, by_id[question["id"]], generate)
        if question.get("group") == "auto":
            auto_items.append(scored)
        else:
            fixed_items.append(scored)
    report = {
        "version": 1,
        "createdAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "baseModel": args.base,
        "repoId": repo,
        "previousRevision": revision,
        "corpusSha256": corpus_sha(chunks),
        "decoding": "greedy",
        "fixed": _summarize(fixed_items),
        "auto": _summarize(auto_items),
        "gate": None,
    }
    path = Path(args.report)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"útil {report['fixed']['useful']}/{report['fixed']['total']} "
        f"inventadas {report['fixed']['invented']} "
        f"rechazos_rotos {report['fixed']['refusalsBroken']} "
        f"auto {report['auto']['total']}"
    )


if __name__ == "__main__":
    main()
