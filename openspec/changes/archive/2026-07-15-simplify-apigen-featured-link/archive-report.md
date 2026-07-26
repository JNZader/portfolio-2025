# Archive Report: `simplify-apigen-featured-link`

## Result Contract

```yaml
status: archived_with_warnings
change: simplify-apigen-featured-link
archived: 2026-07-15
artifact_store: hybrid
verification: pass_with_warnings
implementation_critical: 0
implementation_blockers: 0
next_recommended: sdd-compound
```

## Executive Summary

The completed APiGen homepage-link change is archived after syncing its UI delta into the main OpenSpec UI specification. The implementation and static scope comply with the proposal, design, and delta. The final verification is `pass_with_warnings`: no implementation CRITICAL/BLOCKER was demonstrated, while geometry-test defects, incomplete direct keyboard evidence, unavailable build/Sanity prerequisites, pre-existing check warnings, and absent committed chain provenance remain explicit.

## Source Lineage

| Artifact | OpenSpec path before archive | Engram observation |
|---|---|---:|
| Proposal | `openspec/changes/simplify-apigen-featured-link/proposal.md` | `#8871` |
| Delta spec | `openspec/changes/simplify-apigen-featured-link/specs/ui/spec.md` | `#8874` |
| Design | `openspec/changes/simplify-apigen-featured-link/design.md` | `#8877` |
| Tasks | `openspec/changes/simplify-apigen-featured-link/tasks.md` | `#8881` |
| Apply progress | no filesystem artifact; persisted in Engram | `#8885` |
| Final verification | `openspec/changes/simplify-apigen-featured-link/verify-report.md` | `#8890` |

## OpenSpec Sync

Updated `openspec/specs/ui/spec.md` before moving the change folder:

- Replaced the old named APiGen CTA contract with one locale-aware whole-caption link, preserving the rich bold APiGen fragment and terminal boundary.
- Removed the optional homepage APiGen GitHub requirement.
- Added the case-study GitHub discoverability/safety requirement.
- Added caption accessibility/layout and focused validation/environment-reporting requirements.
- Updated retained bilingual, keyboard, responsive, and regression wording so it no longer requires obsolete homepage action selectors or contracts.
- Preserved all unrelated CV, ProjectCard, blog/footer, terminal, Sanity, and environment requirements.

## Exact Implementation Scope

The completed change scope is limited to the following application/test files:

- `app/[locale]/page.tsx` — removed the obsolete `featuredProject` homepage prop.
- `components/sections/hero-section.tsx` — replaced homepage APiGen action controls with the localized whole-caption link; preserved `HeroTerminal`.
- `messages/es.json`, `messages/en.json` — retained `apigenCaption`; removed obsolete homepage action keys.
- `__tests__/integration/components/HeroSection.test.tsx` — whole-caption, locale, rich-text, sibling, and terminal-boundary assertions.
- `__tests__/unit/messages/project-conversion.test.ts` — bilingual caption parity and obsolete-key assertions.
- `__tests__/integration/components/ProjectDetail.test.tsx` — existing case-study GitHub destination and safe external-link assertions; `ProjectDetail.tsx` was not changed.
- `e2e/tests/navigation.spec.ts` — localized caption navigation and homepage action exclusion.
- `e2e/tests/accessibility-interactions.spec.ts` — semantic/focus/reduced-motion, terminal exclusion, 320px, and 200% checks.

The change did not modify application code during verification, environment fixtures/reporters, `HeroTerminal` internals, `ProjectDetail.tsx`, routes, Sanity flow, CV/cards/blog/footer, audit documents, `.gitignore`, or the archived `clarify-project-conversion` change.

## Tasks and Verification Evidence

- Tasks 1.1–3.1 and 3.3 are complete.
- Task 3.2 is implemented, but its geometry assertion is defective.
- Tasks 4.1 and 4.2 remain partial verification items because of test-level failures, unavailable prerequisites, ambient working-tree changes, and missing chain provenance.
- `npm run test:run`: PASS — 34 files, 221 tests.
- `npm run type-check`: PASS — exit 0.
- `npm run check`: PASS WITH WARNINGS — exit 0; exactly 7 pre-existing warnings, no fixes applied.
- Focused Chromium semantic/focus/reduced-motion subset: 4/4 passed.
- Focused Chromium locale caption navigation: 2/2 passed.
- Focused two-spec run against `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001`: 14 passed, 7 failed, 1 skipped; environment report recorded 16 passed, 7 failed, 1 skipped, 2 blocked, incomplete.

## Explicit Warnings and Environment Blocks

1. The focused Chromium semantic/navigation evidence passed against the already-running portfolio server at `http://localhost:3001`.
2. Four 320px/200% geometry cases failed because the test helper treats adjacent wrapped `Range.getClientRects()` line boxes as overlapping by 1px. This is a test assertion defect, not evidence of application clipping.
3. The inline-link `scrollWidth <= clientWidth` assertion is vacuous: an inline anchor reports `scrollWidth === clientWidth === 0`, so it does not prove caption width or overflow.
4. There is no direct `Enter` activation assertion; keyboard evidence covers tab traversal/focus and click navigation.
5. The production build is blocked after compilation/type-check at sitemap page-data collection because `NEXT_PUBLIC_SANITY_DATASET` is missing.
6. Sanity preflight is blocked because `NEXT_PUBLIC_SANITY_PROJECT_ID` is missing. These blocked checks are not passed coverage.
7. Browser reporting is limited to the selected Chromium run; unselected Firefox/WebKit/mobile projects are not evidence of coverage.
8. `npm run check` retained 7 pre-existing warnings.
9. The checkout is `main` with uncommitted ambient changes and no committed feature-chain provenance or PR references; clean PR1/PR2 history cannot be independently proven.
10. The broader E2E failures include unrelated existing language-target, skip-link, and broad-navigation checks; they are not implementation CRITICAL/BLOCKER findings for this change.

## Rollback

Rollback is a feature-chain revert of the implementation/test delta, restoring the previous homepage action layer, message keys, and test contracts. If only presentation regresses, revert the link styling while retaining the semantic contract. If the simplified interaction is rejected, revert the complete change and reopen the proposal. No route, schema, Sanity-data, database, or environment repair is required. The OpenSpec main-spec sync is the source-of-truth update and should be reverted together with the feature if the behavior is rolled back.

## Archive Contents

The complete active change folder is archived at:

`openspec/changes/archive/2026-07-15-simplify-apigen-featured-link/`

It contains the proposal, exploration, delta spec, design, tasks, generated `AGENTS.md`, verification report, and this archive report. No active change folder remains for `simplify-apigen-featured-link`.
