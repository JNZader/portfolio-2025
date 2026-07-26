# Apply Progress — cleanup-footer-layout

## Work unit

PR2 corrective rerun plus Phase 4 verification: focused footer semantics,
keyboard validation, and environment reporting layered on the completed PR1
footer alignment work. Footer implementation remains unchanged in this rerun.

## Completed

- [x] 1.1 Footer geometry test matrix and tagged regions
- [x] 1.2 Containment, reachability, target-size, alignment, and disjoint-region helpers
- [x] 2.1 Shared left-aligned Footer layout while preserving content and behavior
- [x] 2.2 Stable `data-footer-*` hooks and safe wrapping/target sizing
- [x] 3.1 Localized footer semantics, destinations, external target/rel, and newsletter preservation checks
- [x] 3.2 Per-track alignment, bottom-bar edge, separate copyright/legal groups, containment, and non-overlap checks
- [x] 3.3 Role-specific keyboard checks: link Enter plus newsletter button Enter/Space, with accessible-name and focus assertions
- [x] 3.4 Typed environment reporting keeps blocked projects separate from passes and failures
- [x] 3.5 Corrective rerun: document overflow, descendant/text reachability and clipping checks at 320px; Tab and Enter across every footer link in ES/EN; independent newsletter Space interaction; exact preflight reason propagation; asserted theme state
- [x] 4.1 Full unit, coverage, type-check, Biome check, and build verification recorded with separate environment blocks
- [x] 4.2 Changed-file scope and focused Chromium report reviewed; helpers tightened without weakening assertions; unrelated content scope excluded
- [x] 4.3 Rollback boundary clarified to retain PR1 Footer alignment/hooks and geometry work when reverting PR2
- [x] 4.4 Final corrective pass: deterministic ancestor-chain clipping/overflow detection added to the footer geometry helper; intentional footer/container boundaries are excluded. The generic report-path race was not reproduced inside the existing reporter infrastructure and remains an environment warning.

## Verification

- `npm run test:run`: 38 files, 246 tests passed
- `npm run test:coverage`: 38 files, 246 tests passed; 40.22% statements / 40.77% lines, above the configured 35% threshold
- `npm run type-check`: passed
- `npm run check`: passed with seven pre-existing warnings
- `npm run build`: blocked during page-data collection by missing `NEXT_PUBLIC_SANITY_DATASET` (the preflight report records the exact build block)
- Focused Chromium footer matrix with corrective checks: 16/16 geometry tests passed; corrective keyboard/newsletter rerun: 3/3 passed against `http://localhost:3001`
- Focused environment report: Chromium and mobile-chrome passed; Firefox and WebKit/mobile-safari were blocked with exact missing executable reasons; Sanity was blocked by missing `NEXT_PUBLIC_SANITY_PROJECT_ID`; build was blocked by missing `NEXT_PUBLIC_SANITY_DATASET`; no server block occurred against localhost:3001
- `npm run check` retained seven pre-existing warnings; no new implementation error
- Final corrective pass: `expectNoFooterAncestorClipping()` walks every text-bearing footer descendant to `#footer`, checks ancestor overflow rules and scroll extents, and excludes the intentional footer/container boundaries. No product component was changed.
- Generic report-path race: not reproduced in the existing reporter/unit-test infrastructure; retained as an environment warning rather than broadening scope.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 3.1 | `e2e/tests/navigation.spec.ts` | E2E | N/A (test-only) | ✅ Written | ✅ Chromium passed | ✅ ES + EN | ✅ Clean |
| 3.2 | `e2e/tests/navigation.spec.ts` | E2E | N/A (existing PR1 helper) | ✅ Existing focused assertions | ✅ Chromium passed | ✅ 16-case ES/EN/theme/viewport matrix | ✅ Clean |
| 3.3 | `e2e/tests/navigation.spec.ts`, `e2e/tests/newsletter.spec.ts` | E2E | N/A (test-only) | ✅ Written | ✅ Chromium passed | ✅ Link Enter + button Enter/Space | ✅ Clean |
| 3.4 | `__tests__/unit/e2e/environment-reporter.test.ts` | Unit | ✅ 245/245 baseline | ✅ New blocked-project-pass case failed | ✅ 5/5 passed | ✅ Existing skip/failure/count cases | ✅ Clean |
| 3.5 | `e2e/tests/navigation.spec.ts`, `e2e/tests/newsletter.spec.ts`, `e2e/reporters/environment-reporter.ts` | E2E/reporting | ✅ Existing PR2 coverage | ✅ Corrective assertions added | ✅ Chromium passed | ✅ ES + EN, light + dark, 320px + full matrix | ✅ Clean |
| 4.4 | `e2e/tests/navigation.spec.ts` | E2E helper | ✅ Existing geometry matrix | ✅ Ancestor-clipping assertion added | ✅ Chromium 16/16 passed | ✅ Deterministic boundary exclusions | ✅ Clean |

### Test Summary
- Total tests written: 4 focused E2E cases plus 1 reporter unit case, with corrective assertions in the existing footer matrix/keyboard cases
- Total passing: `npm run test:run` — 38 files, 246 tests; focused Chromium corrective runs — 16 geometry plus 3 keyboard/newsletter tests
- Layers used: Unit (1), E2E (21 focused executions across the final focused runs)
- Approval tests: None — no refactoring tasks
- `Footer.tsx` was not modified in PR2.

## Boundary

PR2 changes are limited to `e2e/tests/navigation.spec.ts`,
`e2e/tests/newsletter.spec.ts`, `e2e/reporters/environment-reporter.ts`, and
`__tests__/unit/e2e/environment-reporter.test.ts`. `Footer.tsx` remains an
ambient PR1 change and was not modified in PR2. `navigation.spec.ts` also
contains ambient history from earlier accessibility/E2E work; only the footer
hunks belong to this change. Do not include `.gitignore`, audit docs, OpenSpec
archives, or unrelated product changes.

The final corrective pass modifies only the existing footer geometry helper in
`e2e/tests/navigation.spec.ts` and this change's task/progress artifacts. The
generic report-path race remains an environment warning because it was not
reproduced in the reporter test infrastructure.

## Rollback

PR2 rollback boundary: revert only the PR2 semantic/keyboard test additions and
the environment reporter guard plus its unit test; retain PR1 Footer
alignment/hooks and geometry work. PR2 rollback MUST NOT remove or restore the
PR1 Footer implementation. If reverting the whole feature, revert PR1 Footer
alignment/hooks and all footer-specific tests together. No data, route,
translation, CMS, configuration, `.gitignore`, audit documentation, OpenSpec
archive, or unrelated ambient-history restoration is required.
