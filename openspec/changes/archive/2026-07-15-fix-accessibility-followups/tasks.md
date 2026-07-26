# Tasks: Fix Confirmed Accessibility Follow-ups

## Result Contract

```yaml
status: ready_for_apply
change: fix-accessibility-followups
artifact_store: hybrid
execution_mode: auto
delivery_strategy: auto-forecast
branch_strategy: feature-branch-chain
review_budget_changed_lines: 800
technical_artifact_language: English
```

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 650–800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Base boundary |
|---|---|---|
| PR 1 | Localized SkipLinks plus unit/integration coverage | feature/tracker |
| PR 2 | Dialog semantics/focus plus tests | PR 1 branch |
| PR 3 | Badge contrast, browser coverage, reporting, gates | PR 2 branch |

### PR 1 Rollback Boundary

PR 1 is independently reversible by reverting only its localized SkipLinks
component/message/test changes and the checklist updates below. It does not
include the mobile dialog, `SkillBadge`, footer, blog, audit, Sanity, or other
accessibility work; those remain in PR 2 or PR 3 and must not be reverted with
this slice.

## Phase 1: Contracts and localized SkipLinks (PR 1)

- [x] 1.1 **RED:** Add parity/rendered-name tests for `messages/es.json`, `messages/en.json`, and `components/a11y/SkipLinks.tsx`; assert unchanged hrefs and non-empty equivalent keys.
- [x] 1.2 Add the three parallel `SkipLinks` message keys to both catalogs and use `useTranslations('SkipLinks')` in `components/a11y/SkipLinks.tsx`; preserve typed targets, focus classes, and keyboard activation.
- [x] 1.3 **GREEN/REFACTOR:** Make the focused static suite pass; keep copy out of the component and avoid manual React memoization or new client boundaries.
- [x] 1.4 **Gate correction:** Add deterministic tab/Enter unit-contract coverage with the happy-dom fragment-focus limitation documented, plus localized Playwright coverage that asserts focus transfer to `#main-content`.

## Phase 2: Dialog semantics and deterministic focus (PR 2)

- [x] 2.1 **RED:** Extend component/integration coverage for `components/layout/MobileMenu.tsx`: localized name, no dialog `h2` before `h1`, 320px usability, opener capture, close-button focus, close/ESC restoration, and navigation focus.
- [x] 2.2 Replace only the `h2` label with an `sr-only` non-heading; retain native `<dialog>`, `aria-labelledby="mobile-menu-title"`, controls, layout, and navigation.
- [x] 2.3 Capture the opener before `showModal()`, focus close after open, restore the opener on close/ESC, and close before navigation; assert destination `main#main-content` focus.
- [x] 2.4 **GREEN/REFACTOR:** Run dialog tests at ES/EN and preserve existing `MobileMenuButton` API and semantics.
- [x] 2.5 **Corrective follow-up:** Mark logo navigation as cross-route navigation and explicitly restore the opener for same-route navigation; cover both paths with focused integration tests.

## Phase 3: Badge contrast and browser validation (PR 3)

- [x] 3.1 **RED:** Add `SkillBadge` tests covering names, decorative icons, unchanged API/consumers, and computed light/dark normal/hover contrast ≥4.5:1.
- [x] 3.2 Select measured semantic Tailwind/theme classes in `components/ui/SkillBadge.tsx`; keep hover and icon color independent. Parse CSSOM `rgb/rgba/oklch`, convert OKLCH via OKLab, composite alpha over computed background, and fail unresolved colors.
- [x] 3.3 Extend `e2e/tests/navigation.spec.ts`, `accessibility-interactions.spec.ts`, and `accessibility.spec.ts` with role/name, focus, heading, Axe, theme, and 320px assertions; use existing helpers.
- [x] 3.4 Call Sanity preflight before dependent routes and annotate browser/Sanity limits as typed `EnvironmentBlockedStatus`; update `e2e/fixtures/environment-status.ts` only if required. Keep blocked separate from passed/failed/skipped.
- [x] 3.5 Run `npm run type-check`, `npm run check`, `npm run test:run`, then focused `npx playwright test`; report unavailable browsers/Sanity as blocked, not skipped or passed.

## Phase 4: Scope and rollback gate

- [x] 4.1 Review diff and consumers; reject footer/blog/content-strategy, Sanity config/data, global typography/token, route, package, and unrelated accessibility changes.
- [x] 4.2 Record measured ratios and exact blocked reasons; rollback by reverting PR 3, PR 2, then PR 1 (no migration or feature flag).

## PR 3 Final-Gate Rerun (2026-07-15)

- [x] Classify the configured base server before focused SkipLinks/mobile-dialog checks; a non-portfolio server or unavailable server is a typed `blocked` result with its exact URL/reason and is excluded from failed counts.
- [x] Keep real portfolio-app failures as failures; the SkipLinks browser check now focuses the actual link before keyboard activation because the fixture/browser startup focus is not a stable Tab origin.
- [x] Block Sanity-dependent mobile destination assertions with the existing typed environment reporting when `NEXT_PUBLIC_SANITY_DATASET` is absent; no fake configuration or silent skip was added.
- [x] Revalidate SkillBadge API/names/decorative icon semantics and light/dark normal/hover contrast; measured ratios remain 6.09:1, 6.09:1, 5.96:1, and 7.75:1.

Final-gate status: static gates pass; focused Chromium SkipLinks pass (2/2); focused mobile dialog checks are blocked by `Missing NEXT_PUBLIC_SANITY_DATASET`; build is blocked by the same missing variable; browser/Sanity blocks remain separate from pass/fail/skipped counts.
