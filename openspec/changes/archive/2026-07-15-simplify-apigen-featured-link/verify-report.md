# Verification Report

**Change**: `simplify-apigen-featured-link`
**Verification phase**: Phase 4 final verification
**Date**: 2026-07-15
**Mode**: hybrid (OpenSpec + Engram)
**Runner**: strict TDD

## Result Contract

```yaml
status: pass_with_warnings
change: simplify-apigen-featured-link
phase: 4
strict_tdd: true
artifact_store: hybrid
implementation_critical: 0
implementation_blockers: 0
environment_blocks:
  - production build: blocked; missing NEXT_PUBLIC_SANITY_DATASET
  - Sanity preflight: blocked; missing NEXT_PUBLIC_SANITY_PROJECT_ID
next_recommended: archive
```

## Executive Summary

The implemented UI and PR boundaries match the active delta and design. All 11 numbered tasks were reviewed; 9 are complete and 4.1/4.2 remain verification-pending because the focused browser run exposes test defects and the production build/Sanity prerequisites are unavailable. Unit tests, type-check, and Biome checks pass. The focused Chromium run was executed against the already-running portfolio server using `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001`; browser execution was available, but geometry assertions fail due a 1px adjacent-line rectangle overlap in the test helper, not demonstrated application clipping. No application code was changed by verification.

## Completeness: all 11 tasks

| Task | Status | Evidence |
|---|---|---|
| 1.1 | ✅ Complete | Consumer inventory and obsolete contract cleanup are present in the scoped files; archive/unrelated surfaces are untouched. |
| 1.2 | ✅ Complete | `HeroSection.test.tsx` covers ES/EN whole-caption role/name, href, strong child, sibling boundary, terminal boundary, and no homepage GitHub action. |
| 1.3 | ✅ Complete | Message parity/obsolete-key test and direct `ProjectDetail` GitHub safety test pass. |
| 2.1 | ✅ Complete | `page.tsx` no longer passes `featuredProject`; `HeroSection` has no featured-project action contract. |
| 2.2 | ✅ Complete | Caption is a locale-aware `/proyectos/apigen` link after unchanged `HeroTerminal`, with rich `<strong>`, underline, and focus-visible treatment. |
| 2.3 | ✅ Complete | Both catalogs retain only the localized `apigenCaption` for this feature; obsolete action keys are absent. |
| 3.1 | ✅ Complete | Navigation and accessibility specs use exact localized caption names and locale destinations; semantic/focus/reduced-motion checks pass in focused subsets. |
| 3.2 | ⚠️ Implemented, runtime assertion defective | 320px/200% caption-local geometry checks exist, but all four geometry cases fail at the pairwise text-rectangle overlap assertion because adjacent line rectangles overlap by 1 CSS pixel. |
| 3.3 | ✅ Complete | Typed `blocked` environment status, preflight, and reporter semantics are preserved. |
| 4.1 | ⚠️ Partial | Required commands ran. Unit/type/check passed; Chromium ran against port 3001; build and Sanity remain blocked; focused E2E has test-level failures. |
| 4.2 | ⚠️ Partial | Static exclusions and PR scopes are coherent, but there are no committed PR1/PR2 branch boundaries in the current checkout and the working tree contains ambient changes. |

## Build and Test Execution

| Command | Result | Evidence |
|---|---|---|
| `npm run test:run` | ✅ PASS | 34 files, 221 tests passed. Existing React/HTML and `act()` warnings were non-fatal. |
| `npm run type-check` | ✅ PASS | `tsc --noEmit`, exit 0. |
| `npm run check` | ✅ PASS WITH WARNINGS | Biome checked 202 files, exit 0; 7 existing warnings, no fixes applied. |
| `npm run build` | ⛔ BLOCKED | Compilation and TypeScript completed; sitemap page-data collection failed because `NEXT_PUBLIC_SANITY_DATASET` is missing. This is not passed coverage. |
| `CI=1 PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npm run e2e -- --project=chromium` | ⚠️ Incomplete run | Broader suite exceeded the 120s command timeout. It was not used as the focused result. |
| Focused two-spec Chromium run against `http://localhost:3001` | ⚠️ 14 passed, 7 failed, 1 skipped | `accessibility-interactions.spec.ts` + `navigation.spec.ts`, 2 retries. Semantic/focus/reduced-motion subset: 4/4 passed. Locale caption navigation: 2/2 passed. Four geometry cases fail at the test overlap assertion; remaining failures are unrelated existing language-target, skip-link, and broad-navigation checks. |

Environment reporter output for the focused run: `passed: 16`, `failed: 7`, `skipped: 1`, `blocked: 2`, `incomplete: true`. Chromium and mobile-chrome preflight were available for the selected run. Sanity and build entries remain typed `blocked`; blocked checks are excluded from coverage. Because only Chromium was selected, other configured browser projects were not claimed as covered.

Coverage: not configured.

## Spec Compliance Matrix

| Requirement/scenario | Evidence | Result |
|---|---|---|
| Whole-caption localized link | Vitest `HeroSection.test.tsx`; focused Chromium ES/EN navigation 2/2 | ✅ Compliant |
| Simplified homepage actions | Vitest plus paragraph-local E2E assertions; no obsolete runtime consumers | ✅ Compliant |
| Bilingual catalog parity | `project-conversion.test.ts`, passed | ✅ Compliant |
| Case-study GitHub discoverability/safety | `ProjectDetail.test.tsx`, passed; `ProjectDetail.tsx` unchanged | ✅ Compliant |
| Keyboard order, focus cue, terminal exclusion | Focused Chromium semantic tests ES/EN 2/2 passed; terminal is `aria-hidden` with no focusable descendants | ✅ Compliant, with missing direct Enter activation noted below |
| Reduced-motion stable output | Focused Chromium reduced-motion tests ES/EN 2/2 passed | ✅ Compliant |
| 320px geometry | Caption-local assertions run, but four cases fail in pairwise rectangle-overlap check | ⚠️ Partial / test assertion issue |
| 200% reflow geometry | Caption-local assertions run, but four cases fail in pairwise rectangle-overlap check | ⚠️ Partial / test assertion issue |
| Honest environment reporting | `environment-status.ts`, global setup, reporter, and observed JSON retain typed `blocked` and incomplete state | ✅ Compliant; browser reporting scope is limited to selected Chromium |
| Preservation of terminal/CV/cards/blog/footer/Sanity | Static diff/symbol review; no change-scoped edits to terminal internals, CV, cards, blog, footer, or Sanity flow | ✅ Compliant structurally; Sanity runtime validation is blocked |

## Design and Boundary Verification

- **PR 1 boundary**: UI/messages plus focused unit/integration coverage is independently coherent. `HeroSection`, catalogs, and `ProjectDetail` safety test match the design; `ProjectDetail.tsx` itself is unchanged.
- **PR 2 boundary**: changed E2E files are limited to `e2e/tests/accessibility-interactions.spec.ts` and `e2e/tests/navigation.spec.ts`, plus checklist/report artifacts. No PR2 application implementation, terminal, environment fixture, reporter, route, Sanity, CV, card, blog, footer, or archive changes were observed.
- **Rollback scopes**: PR1 rollback is UI/messages/focused tests; PR2 rollback is E2E/checklist/reporting verification. No route, schema, data, or environment repair is implied.
- **Active delta**: `openspec/changes/simplify-apigen-featured-link/specs/ui/spec.md` explicitly modifies the whole-caption contract, removes the homepage repository action, adds case-study GitHub safety, retains terminal/layout/environment requirements, and leaves the archive immutable.
- **Whole-caption semantics**: `HeroSection` renders `t.rich('apigenCaption')` inside one locale-aware link, preserving `<strong>apigen</strong>` and a persistent underline/focus cue.
- **ProjectDetail safety**: named repository link retains `target="_blank"` and `rel="noopener noreferrer"`.
- **Preservation**: `HeroTerminal` retains `aria-hidden="true"`, replay/ref scrolling, and no focusable descendant contract. CV, ProjectCard, blog, footer, routes, Sanity data flow, and archive are out of the change scope.

## Issues

### CRITICAL / BLOCKER

None that are demonstrated as implementation failures. The build and Sanity limitations are environment `blocked`, not passes and not application regressions.

### WARNING

1. The inline-link `scrollWidth <= clientWidth` assertion is vacuous: an inline anchor reports `scrollWidth === clientWidth === 0`; it does not prove caption width or overflow.
2. The four 320px/200% geometry failures are caused by the test's pairwise `Range.getClientRects()` overlap rule treating adjacent wrapped line boxes with a 1px boundary overlap as collision. They should be corrected or explicitly accepted before treating layout evidence as green; no implementation clipping was demonstrated.
3. Focused E2E does not activate the caption link with `Enter`; it verifies tab traversal/focus and click navigation only.
4. Blocked-browser reporting is incomplete for a Chromium-only run: selected Chromium preflight is reported, while unselected Firefox/WebKit/mobile-safari are not evidence of coverage. Sanity/build blocks are correctly explicit.
5. Current checkout is `main` with uncommitted ambient changes and no feature-chain commits/PR refs, so clean PR1-vs-PR2 diff provenance cannot be independently proven from Git history.

### SUGGESTION

- Replace the inline width check with a block/inline-block measurement or a meaningful client-rect/content-width invariant, tolerate line-box boundary rounding, add explicit `Enter` activation, and run the full configured browser matrix when prerequisites are available.

## Verdict

**PASS WITH WARNINGS** — implementation scope and static/spec compliance are aligned; unit/type/check and focused semantic/navigation browser evidence pass. Geometry evidence needs test assertion cleanup, direct Enter activation is absent, and build/Sanity remain honestly blocked. No implementation CRITICAL/BLOCKER was found; next recommended action is `archive`.
