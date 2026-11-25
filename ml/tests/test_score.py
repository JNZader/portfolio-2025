from portfolio_ft.config import GREETING_SENTINEL, NO_EVIDENCE, REFUSAL_TEXT
from portfolio_ft.score import score_answer

CHUNK = {
    "id": "es:case-study:apigen:0",
    "href": "/proyectos/apigen",
    "text": "Una plataforma de generación de código con OpenAPI.",
    "title": "APiGen",
    "heading": None,
    "citation": "APiGen",
}


def test_grounded_facts_are_faithful_and_a_missing_fact_is_partial():
    answer = "Generación de código con OpenAPI. [APiGen](/proyectos/apigen)"
    full = score_answer(
        expect="answer",
        answer=answer,
        chunks=[CHUNK],
        key_facts=["generación de código", "OpenAPI"],
    )
    assert full.label == "faithful"
    partial = score_answer(
        expect="answer",
        answer=answer,
        chunks=[CHUNK],
        key_facts=["generación de código", "8406 tests"],
    )
    assert partial.label == "partial"
    assert partial.matched_facts == 1


def test_url_outside_the_sources_is_invented_even_with_the_facts():
    answer = "OpenAPI y generación de código. [nota](https://evil.example/secret)"
    scored = score_answer(
        expect="answer",
        answer=answer,
        chunks=[CHUNK],
        key_facts=["OpenAPI"],
    )
    assert scored.label == "invented"


def test_refusal_phrase_and_the_production_sentinel():
    phrase = score_answer(expect="refusal", answer=REFUSAL_TEXT, chunks=[CHUNK], key_facts=[])
    assert phrase.label == "refusal-correct"
    sentinel = score_answer(expect="refusal", answer=NO_EVIDENCE, chunks=[], key_facts=[])
    assert sentinel.label == "refusal-correct"
    leaked = score_answer(
        expect="answer",
        answer=REFUSAL_TEXT,
        chunks=[CHUNK],
        key_facts=["OpenAPI"],
    )
    assert leaked.label == "refusal-wrong"
    missed = score_answer(expect="refusal", answer="Son 20 dólares.", chunks=[CHUNK], key_facts=[])
    assert missed.label == "refusal-wrong"


def test_invented_url_beats_a_refusal_phrase():
    answer = f"{REFUSAL_TEXT} [mail](https://evil.example/a)"
    scored = score_answer(expect="refusal", answer=answer, chunks=[CHUNK], key_facts=[])
    assert scored.label == "invented"


def test_greeting_sentinel_is_faithful_and_a_bare_url_is_not():
    ok = score_answer(expect="greeting", answer=GREETING_SENTINEL, chunks=[], key_facts=[])
    assert ok.label == "faithful"
    invented = score_answer(
        expect="greeting",
        answer="hello https://evil.example",
        chunks=[],
        key_facts=[],
    )
    assert invented.label == "invented"
