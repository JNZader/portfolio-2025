# Tasks: Align Blog Loading Skeleton

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450–650 (implementation plus focused tests) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 on the feature/tracker branch |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Loading markup and static contract | PR 1 | Base = feature/tracker branch; include component tests; rollback is one production file plus focused test |
| 2 | Conditional browser verification and regression gate | PR 2 | Base = PR 1 branch; keep E2E additions and existing blog behavior checks together |

## Phase 1: Baseline and Contract (PR 1)

- [x] 1.1 Record deterministic pre-change `git status`/diff and existing loading-test baseline; confirm only `loading.tsx`, the focused component test, and conditional `blog.spec.ts` may change.
- [x] 1.2 RED: create `__tests__/integration/components/BlogLoading.test.tsx` for one named busy status, decorative `aria-hidden` regions, non-interactive descendants, exact hero/filter/category/card hooks, and six cards; omit Sanity variables and browser geometry.

## Phase 2: Loading Implementation (PR 1)

- [x] 2.1 Modify only `app/[locale]/(pages)/blog/loading.tsx`: replace old hero/filter geometry with local responsive `InteriorHero`-aligned placeholders and semantic theme classes; retain deterministic six-card mapping and no CMS/content/route/error/shared-component changes.
- [x] 2.2 Add exactly one outer `role="status"`/`aria-busy="true"`/named wrapper; mark only hero, filters, and cards decorative, with no nested status/live region or focusable fake control.
- [x] 2.3 Emit exact stable hooks for hero columns, filter/search/control/result-count, cards/image/content/author; emit no category node or category attribute. GREEN: run the focused component suite, then type-check and Biome checks. The control hook is authoritative as `data-region="control"`; static tests also lock the filter and card responsive class contracts and the absence of Sanity/CMS/data-fetching dependencies.

## Phase 3: Runtime and Resolved-Page Verification (PR 2)

- [x] 3.1 Add one conditional smoke in `e2e/tests/blog.spec.ts` using existing preflight/reporter semantics: explicitly guard Sanity variables before navigation, exercise configured desktop/mobile viewports and light/dark `html.dark` states, and assert containment, non-overlap, non-zero inner rectangles, surface/border distinction, and six-card structure.
- [x] 3.2 In the same smoke, observe a reliable loading hold only when available; assert loading hooks disappear, the level-one blog heading and labeled search appear, and existing route/filter/content behavior remains unchanged. Missing `NEXT_PUBLIC_SANITY_PROJECT_ID`/`NEXT_PUBLIC_SANITY_DATASET` is typed blocked with its exact reason; otherwise emit typed `blocked: no reliable route hold available`.
- [x] 3.3 Preserve exact existing Sanity block reasons (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, fetch/server, or browser launch reason); blocked is not pass/coverage, while assertion failures remain failures. Include per-card image/content/author assertions.

## Phase 4: Verification and Rollback

- [x] 4.1 Run `npm run test:run`, `npm run type-check`, `npm run check`, and available Playwright checks; report static results separately from typed runtime blocks.
- [x] 4.2 Verify rollback from the recorded baseline: remove only the loading hunk and focused test/E2E additions, confirm no shared/route/CMS/config/content files changed, rerun focused tests and existing `e2e/tests/blog.spec.ts`, and distinguish genuine failures from unavailable runtime.

## Final Corrective Pass

- [x] C1: Consume the unscoped Sanity preflight before blog navigation, preserving exact missing-variable and safe fetch/network reasons as typed `blocked` results; navigation-time Sanity fetch failures use the same safe reason and never become generic failures or passes.
- [x] C2: Strengthen the blog loading geometry helper with ancestor-chain clipping and per-region overflow checks for hero, filter, search, control, result-count, and cards, excluding only intentional Container (`max-w-7xl`) and viewport (`html`/`body`) boundaries.
- [x] C3: Update focused static coverage for the typed-block and geometry-helper contracts; production remains limited to `loading.tsx` and no content, CMS, route, or page files change.

Out of scope: blog content/CMS, route or loading-boundary behavior, error handling, translations, shared components, fixtures/reporters/configuration, and article-detail loading.
