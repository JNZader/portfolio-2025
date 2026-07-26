# Tasks: Clean Up Footer Layout Alignment

## Result Contract

```yaml
status: ready_for_apply
change: cleanup-footer-layout
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
| Estimated changed lines | 430-560 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 Footer alignment; PR 2 focused E2E/reporting |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No  
Chained PRs recommended: Yes  
Chain strategy: feature-branch-chain  
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Boundary |
|---|---|---|
| 1 | Footer alignment and stable region hooks | PR #1 base = feature/tracker branch; verify type/check |
| 2 | Matrix E2E, keyboard, semantics, and environment report | PR #2 base = PR #1 branch; verify focused suite |

Dependency: `tracker → PR #1 📍 → PR #2`; only the tracker merges to main. Keep blog files, `Container.tsx`, messages, and newsletter implementation untouched.

## Phase 1: Foundation / RED Tests

- [x] 1.1 In `e2e/tests/navigation.spec.ts`, add failing tagged footer checks using semantic roles and `data-footer-*` regions; cover ES `/` and EN `/en`, light/dark, and 320/390/768/1440 viewports (16 cases).
- [x] 1.2 Define geometry helpers that assert viewport containment, non-zero reachability, and ≥44px × 44px targets; compare only disjoint primary tracks and bottom-bar groups, not nested text/link boxes.

## Phase 2: Footer Implementation / GREEN

- [x] 2.1 Modify only `components/layout/Footer.tsx:25-129`: remove `md:text-center`, `md:text-right`, and distributed bottom-bar alignment; retain `grid-cols-1 md:grid-cols-3`, order, stacking, themes, wrapping, labels, links, destinations, and newsletter semantics.
- [x] 2.2 Add `data-footer-grid`, per-column `data-footer-column`, `data-footer-bottom-bar`, and separate copyright/legal `data-footer-bottom-group` hooks; use `min-w-0` only if required for safe bilingual wrapping and keep every target ≥44px × 44px.

## Phase 3: E2E Semantics and Keyboard

- [x] 3.1 Assert localized labels/destinations for JZ, navigation, contact, GitHub, LinkedIn, privacy/GDPR, and existing newsletter behavior; verify external `target`/`rel` without changing semantics.
- [x] 3.2 Assert each column starts at its own track edge, bottom bar matches the shared `Container` edge, and disjoint regions do not overlap or overflow; assert copyright and legal groups individually, not only the bottom container.
- [x] 3.3 Verify keyboard behavior by role: links activate with Enter; buttons activate with Enter and Space; verify Tab reachability and preserve accessible names.
- [x] 3.4 Extend the existing environment-status/reporting path so unavailable browser projects are `blocked` with exact reason, excluded from pass/coverage counts, and never silently skipped; snapshots remain supplementary.

## Phase 4: Verification / REFACTOR / Rollback

- [x] 4.1 Run `npm run test:run`, `npm run test:coverage` (35%), `npm run type-check`, `npm run check`, and `npm run build`; record exact environment blocks separately from failures.
- [x] 4.2 Review changed-file scope and focused E2E report, then refactor test helpers without weakening assertions; confirm no blog/CMS/content-strategy files changed.
- [x] 4.3 Roll back by reverting the Footer alignment and focused-test work units together; no data, route, translation, package, or configuration restoration is required.
- [x] 4.4 Final corrective pass: walk each relevant footer text region's ancestor chain for clipping/overflow rules while excluding the intentional viewport/container boundaries; leave the generic report-path race as an environment warning unless reproduced in the reporter infrastructure.
