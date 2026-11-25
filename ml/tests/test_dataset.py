import json
from collections import Counter

import pytest

from portfolio_ft.config import REFUSAL_REASONS, REFUSAL_TEXT
from portfolio_ft.dataset import TeacherDisabled, build_dataset
from portfolio_ft.questions import changed_chunks, load_fixed_questions
from portfolio_ft.score import score_answer
from portfolio_ft.textutil import normalize


def chunk(slug: str, locale: str, text: str = "Genera servicios. 8406 tests.") -> dict:
    return {
        "id": f"{locale}:case-study:{slug}:0",
        "locale": locale,
        "kind": "case-study",
        "slug": slug,
        "title": slug,
        "heading": "De un vistazo",
        "text": text,
        "href": f"/proyectos/{slug}" if locale == "es" else f"/en/proyectos/{slug}",
        "citation": slug,
    }


def corpus() -> list[dict]:
    slugs = ("apigen", "biogas", "canalero", "ghagga")
    return [chunk(slug, locale) for slug in slugs for locale in ("es", "en")]


def render(items: list[dict]) -> dict[str, tuple[str, str]]:
    return {
        item["id"]: (
            f"sys:{item['preferSlug']}:{len(item['chunks'])}",
            f'QUESTION:\n"""\n{item["query"]}\n"""',
        )
        for item in items
    }


def test_refusal_ratio_covers_every_reason_and_stays_near_a_quarter():
    split = build_dataset(corpus(), render=render, fixed_questions=[], seed=42)
    assert 0.20 <= split.refusal_ratio <= 0.30
    reasons = {example.reason for example in split.train if example.kind == "refusal"}
    assert reasons == set(REFUSAL_REASONS)
    assert all(example.answer == REFUSAL_TEXT for example in split.train if example.kind == "refusal")
    assert split.heldout
    assert {example.id for example in split.train}.isdisjoint(example.id for example in split.heldout)


def test_same_seed_builds_the_same_rows():
    first = build_dataset(corpus(), render=render, fixed_questions=[], seed=42)
    second = build_dataset(corpus(), render=render, fixed_questions=[], seed=42)
    assert [example.row() for example in first.train] == [example.row() for example in second.train]


def test_answers_cite_only_the_chunk_href_and_score_faithful():
    split = build_dataset(corpus(), render=render, fixed_questions=[], seed=42)
    answer = next(example for example in split.train if example.kind == "answer")
    assert answer.chunks[0]["href"] in answer.answer
    assert 'QUESTION:\n"""\n' in answer.question
    scored = score_answer(
        expect="answer",
        answer=answer.answer,
        chunks=list(answer.chunks),
        key_facts=["8406"],
    )
    assert scored.label == "faithful"


def test_held_out_question_is_absent():
    blocked = "¿Qué dice el portfolio sobre Widget?"
    rows = build_dataset(
        [chunk("Widget", "es"), chunk("Widget", "en")],
        render=render,
        fixed_questions=[{"id": "held", "query": blocked, "locale": "es", "expect": "answer"}],
        seed=1,
    )
    queries = {normalize(example.query) for example in [*rows.train, *rows.heldout]}
    assert normalize(blocked) not in queries


def test_teacher_flag_does_not_call_a_model():
    with pytest.raises(TeacherDisabled):
        build_dataset(corpus(), render=render, fixed_questions=[], teacher=True)


def test_fixed_set_has_twelve_questions():
    questions = load_fixed_questions()
    counts = Counter(question["expect"] for question in questions)
    assert counts["answer"] == 6
    assert counts["refusal"] == 5
    assert counts["greeting"] == 1
    assert json.loads(
        (__import__("pathlib").Path(__file__).resolve().parents[2] / "lib/qa/local/small-model.json").read_text()
    )["id"]


def test_changed_chunks_follow_text_edits():
    original = chunk("apigen", "es", text="uno")
    assert changed_chunks([original], [original]) == []
    edited = chunk("apigen", "es", text="dos")
    added = chunk("otro", "es", text="tres")
    assert [item["id"] for item in changed_chunks([original], [edited, added])] == [
        edited["id"],
        added["id"],
    ]
