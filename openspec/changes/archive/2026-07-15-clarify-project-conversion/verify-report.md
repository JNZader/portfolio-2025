# Verification Report

**Change**: `clarify-project-conversion`
**Spec**: `openspec/changes/clarify-project-conversion/specs/ui/spec.md`
**Mode**: hybrid (OpenSpec + Engram)
**Verification date**: 2026-07-15
**Runner**: strict TDD mode; `npm run test:run`

## Result Contract

```yaml
status: pass_with_warnings
implementation_failures: 0
environment_blocks: 5
unrelated_preexisting_failures: 3
warnings: 5
suggestions: 2
next_recommended: archive
```

The changed UI contract is implemented and its focused component tests plus all APiGen-focused Chromium checks passed. Archive is conditionally ready because the orchestrator explicitly accepts the declared limitations: both Sanity variables are missing, the production build stops on the missing dataset, and Firefox/WebKit/mobile Safari executables are unavailable. These are `blocked`, never `passed`. Three Chromium failures are unrelated existing checks (language switcher target, skip-link geometry, and desktop Blog navigation). This verdict does not claim full production or cross-browser verification.

## Completeness / Task Checklist

| Metric | Result |
|---|---:|
| Numbered tasks | 11 |
| Numbered tasks complete | 11 |
| Numbered tasks incomplete | 0 |
| PR 2 corrective pass | complete per merged Engram apply-progress |

Completed: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.1, 4.2, plus the final PR 2 corrective pass. The filesystem checklist and merged apply-progress agree that no implementation task remains.

## Changed-File Scope

### In-scope implementation/test files verified

- `app/[locale]/page.tsx`
- `components/sections/hero-section.tsx`
- `components/sections/HeroTerminal.tsx`
- `components/ui/CVButton.tsx`
- `messages/es.json`, `messages/en.json`
- Focused integration/unit tests under `__tests__/integration/components/` and `__tests__/unit/{messages,e2e}/`
- `e2e/tests/accessibility-interactions.spec.ts`
- `e2e/tests/navigation.spec.ts`
- `e2e/fixtures/environment-status.ts`, `e2e/fixtures/global-setup.ts`
- `e2e/reporters/environment-reporter.ts`
- `playwright.config.ts`

### Explicitly excluded / not part of the implementation

- `ProjectCard.tsx` was not modified; representative fixture coverage preserves its detail action, action layer, and hierarchy.
- No modal, modal trigger, anchor redesign, projects information-architecture redesign, blog behavior, footer/contact redesign, CV PDF generation, GitHub rate-limit handling, Sanity schema/data-model/configuration, or route change was added.
- The working tree separately contains `.gitignore` and `docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md` changes. They are unrelated audit/SDD-local changes and are not included in the implementation scope; do not bundle them into the change.
- `openspec/` is the SDD artifact area, not application implementation.

`git diff --check`: passed. The application diff is within the configured 800-line budget (256 tracked insertions/deletions before untracked test/helper files; no broad UI redesign detected).

## Verification Commands

| Command | Outcome | Evidence / classification |
|---|---|---|
| `npm run test:run` | **PASS** | 33 files, 220 tests passed, 0 failed. Focused HeroSection, HeroTerminal, CVButton, ProjectCard, message parity, and environment-status tests passed. |
| `npm run type-check` | **PASS** | `tsc --noEmit` exit 0. |
| `npm run check` | **PASS WITH WARNINGS** | Exit 0; 7 pre-existing warnings in `app/globals.css`, `components/admin/UptimeStatus.tsx`, and `lib/analytics/debug.tsx`; none touch this change. |
| `npm run test:run -- --coverage` | **PASS** | 33 files / 220 tests; lines 39.35%, statements 38.82%, above configured 35% threshold. |
| Focused Chromium E2E | **PASS for changed contract; incomplete overall** | APiGen ES/EN routes, semantic actions, reduced motion, 320px, and 200% tests passed. Overall selected run: 22 tests, 18 passed, 3 unrelated failed, 1 product-condition skipped; environment report: passed 20, failed 3, skipped 1, blocked 2. |
| `npm run build` | **BLOCKED** | Prisma generation, compile, and TypeScript completed; page-data collection stopped at missing `NEXT_PUBLIC_SANITY_DATASET`. This is not a pass and no fake value/workaround was used. |

### Focused Chromium failures distinguished

1. `language option provides a comfortable pointer target`: cannot find `/ver en inglés/i`; unrelated language-switcher baseline.
2. `focused skip link remains fully inside the viewport`: skip-link box y=`-60`; unrelated existing skip-link geometry.
3. `should navigate between pages`: desktop Blog navigation link timeout; unrelated Blog navigation.

The failing tests do not exercise the APiGen conversion contract and are not implementation regressions for this change. They remain recorded failures, not silently converted to skips or passes.

## Environment Blocks

| Environment | Status | Reason |
|---|---|---|
| Sanity | **BLOCKED** | `NEXT_PUBLIC_SANITY_PROJECT_ID` missing and `NEXT_PUBLIC_SANITY_DATASET` missing. No remote-data/geometry coverage is claimed. |
| Production build | **BLOCKED** | `npm run build` fails during page-data collection because `NEXT_PUBLIC_SANITY_DATASET` is missing. |
| Firefox | **BLOCKED** | Playwright executable missing: `firefox-1532/firefox/firefox`. |
| WebKit | **BLOCKED** | Playwright executable missing: `webkit-2311/pw_run.sh`. |
| Mobile Safari | **BLOCKED** | Uses unavailable WebKit executable (`webkit-2311/pw_run.sh`). |

The environment reporter emits separate `passed`, `failed`, `skipped`, and `blocked` counts and attaches browser blocks to affected tests. Chromium success is not generalized to Firefox/WebKit/mobile Safari.

## Spec Compliance Matrix

| Requirement / scenario | Runtime evidence | Result |
|---|---|---|
| Localized CTA — Spanish route and exact visible label | `navigation.spec.ts` APiGen ES; `accessibility-interactions.spec.ts`; integration CTA test | ✅ COMPLIANT |
| Localized CTA — English route and exact visible label | `navigation.spec.ts` APiGen EN; Chromium accessibility test | ✅ COMPLIANT |
| CTA sibling outside hidden terminal; terminal has no interactive/tabindex descendants | `HeroSection.test.tsx`, `HeroTerminal.test.tsx`, Chromium semantic test | ✅ COMPLIANT |
| Optional GitHub present: exact label, URL, target, rel, distinct CTA | `HeroSection.test.tsx`; Chromium semantic test | ✅ COMPLIANT |
| Optional GitHub omitted: internal CTA remains and GitHub absent | `HeroSection.test.tsx` omission case | ✅ COMPLIANT |
| Reduced motion: complete terminal output and usable CTA | `HeroTerminal.test.tsx`; ES/EN Chromium reduced-motion tests | ✅ COMPLIANT |
| Motion-enabled replay and ref-driven scrolling preserved | `HeroTerminal.test.tsx` timer cascade; source inspection of `useTypingSequence` | ⚠️ PARTIAL — runtime test proves replay output, not browser scrollTop geometry |
| Spanish CV view action means `/cv`, distinct from download | `CVButton.test.tsx`; Chromium CV-copy test; existing navigation coverage | ✅ COMPLIANT |
| English CV view action means `/en/cv`, distinct from download | Chromium CV-copy test and English navigation coverage | ⚠️ PARTIAL — exact focused route assertion is present in broader navigation coverage, not the new focused test |
| CV download and view remain separate named actions | `CVButton.test.tsx`; Chromium CV-copy test | ✅ COMPLIANT |
| ProjectCard localized detail route/name for APiGen | ProjectCard integration regression proves existing route/name contract on representative fixture | ⚠️ PARTIAL — fixture identifier is `api-platform`, not `apigen` |
| ProjectCard actions have independent targets/no modal/nested action row | ProjectCard integration test and unchanged source | ⚠️ PARTIAL — runtime fixture covers representative card, not every optional-data combination |
| Evidence-gated geometry: no unsupported geometry change | `ProjectCard.tsx` unchanged; fixture tests pass; apply-progress records no defect | ✅ COMPLIANT |
| Sanity unavailable is blocked, not passed | environment-status unit tests; global preflight; build output | ✅ COMPLIANT (blocked limitation) |
| Bilingual catalog parity and exact labels | `project-conversion.test.ts` plus ES/EN Chromium rendering | ✅ COMPLIANT |
| Keyboard order reaches actions and excludes terminal | Chromium ES/EN semantic keyboard tests | ✅ COMPLIANT |
| Focus-visible treatment | Chromium case-study focus style assertion; source classes | ⚠️ PARTIAL — focused runtime assertion is strongest for case-study CTA, not every clarified link |
| 320px no overflow, visible/non-clipped actions | ES/EN Chromium 320px tests, including all visible actions | ✅ COMPLIANT |
| 200% zoom/reflow no clipping/overlap | ES/EN Chromium 200% tests | ✅ COMPLIANT |
| Focused component/integration regression suite | `npm run test:run`: 220/220 | ✅ COMPLIANT |
| Browser acceptance suite: role/name/routes/reflow/reduced motion | Changed-contract Chromium tests passed | ✅ COMPLIANT for Chromium; cross-browser incomplete |
| Environment report has explicit blocked status and separate counts | environment unit tests and reporter output | ✅ COMPLIANT |
| Firefox/WebKit/mobile Safari configured probes | Explicit probes attempted; executables unavailable | ⚠️ BLOCKED — no cross-browser coverage claim |
| Sanity-shaped geometry validation | Variables and remote data unavailable | ⚠️ BLOCKED — no Sanity coverage claim |

**Core scenario summary**: 18 compliant, 4 partial, 2 blocked; no changed-contract scenario is failing. The partials are coverage-strength limitations, not observed implementation failures.

## Correctness (Static)

| Area | Status | Evidence |
|---|---|---|
| Required literal `FeaturedProject` contract | ✅ Implemented | Required prop and literal APiGen routes in `page.tsx` / `hero-section.tsx`; type-check passes. |
| Semantic sibling CTA and optional safe GitHub link | ✅ Implemented | Native locale `Link`, `ExternalLink`, visible catalog labels, allowed test IDs. |
| Decorative terminal boundary | ✅ Implemented | `aria-hidden="true"`; only `tabIndex={-1}` removed; no focus call; ref scrolling retained. |
| CV semantics | ✅ Implemented | Visible localized `Ver CV` / `View CV`; separate `download` anchor retained. |
| ProjectCard preservation / geometry gate | ✅ Implemented | No card source change; regression fixture passes. |
| Typed environment-block reporting | ✅ Implemented | Sanity data validation, browser preflight, build block, isolated reports, separate counts. |

## Coherence (Design)

All design decisions are followed: required internal contract, optional GitHub, visible catalog labels, local `FeaturedProjectActions`, preserved terminal ARIA boundary, preserved CV split interaction, and untouched ProjectCard geometry. No rejected modal, anchor, CMS, or broad redesign alternative was implemented. The only operational deviation is intentional: build preflight records the static prerequisite block without recursively invoking `npm run build` from Playwright setup.

## Findings

### CRITICAL

None for the changed implementation. Environment blocks are explicitly classified as blocked, not passed; unrelated Chromium failures remain recorded above.

### WARNING

1. Verification is incomplete until Sanity credentials/data and the production build prerequisite are available.
2. Firefox, WebKit, and mobile Safari coverage is blocked by missing Playwright executables.
3. Three unrelated Chromium baseline tests fail and should be handled separately; they must not be bundled into this change.
4. Four compliance scenarios are partial because runtime assertions use representative/broader coverage rather than exact APiGen/all-link permutations.
5. `npm run check` reports seven pre-existing warnings outside the change.

### SUGGESTION

1. Add a focused English CV route assertion and an APiGen-specific ProjectCard fixture if exact per-scenario traceability is required before archive.
2. Keep `.gitignore` and `docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md` out of the change commit.

## Verdict

**PASS WITH WARNINGS — archive-ready conditional on explicit acceptance of the five environment blocks and three unrelated baseline Chromium failures.**

The APiGen conversion behavior is green in component tests and focused Chromium acceptance. There is no real implementation blocker: all 11 tasks are complete, changed-contract failures and CRITICAL findings are absent, and scope exclusions are preserved. Archive is appropriate with the limitations explicitly recorded and accepted; do not describe this as full production or cross-browser verification.
