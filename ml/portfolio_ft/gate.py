"""Publish gate. A failure leaves the previous Hugging Face revision in place."""

from __future__ import annotations

from dataclasses import dataclass

from portfolio_ft.config import MIN_USEFUL

USEFUL_LABELS = {"faithful", "refusal-correct"}


@dataclass(frozen=True)
class GateDecision:
    passed: bool
    reasons: tuple[str, ...]
    useful: int
    invented: int
    refusals_broken: bool


def useful_count(items: list[dict[str, object]]) -> int:
    return sum(1 for item in items if item.get("label") in USEFUL_LABELS)


def invented_count(items: list[dict[str, object]]) -> int:
    return sum(1 for item in items if item.get("label") == "invented")


def refusals_broken(items: list[dict[str, object]]) -> bool:
    for item in items:
        if item.get("expect") == "refusal" and item.get("label") != "refusal-correct":
            return True
    return False


def decide(
    *,
    fixed_items: list[dict[str, object]],
    auto_items: list[dict[str, object]],
    previous_invented: int | None,
    min_useful: int = MIN_USEFUL,
) -> GateDecision:
    useful = useful_count(fixed_items)
    invented = invented_count(fixed_items)
    broken = refusals_broken(fixed_items)
    auto_invented = invented_count(auto_items)
    reasons: list[str] = []
    if useful < min_useful:
        reasons.append(f"puntaje útil {useful} < {min_useful}")
    if broken:
        reasons.append("las rechazos esperados no salieron refusal-correct")
    if previous_invented is not None and invented > previous_invented:
        reasons.append(f"inventadas {invented} > {previous_invented} del modelo anterior")
    if auto_invented > 0:
        reasons.append(f"preguntas de contenido nuevo con URL inventada: {auto_invented}")
    return GateDecision(
        passed=not reasons,
        reasons=tuple(reasons),
        useful=useful,
        invented=invented,
        refusals_broken=broken,
    )
