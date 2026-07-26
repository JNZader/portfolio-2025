# Proposal: Align Blog Loading Skeleton

## Result Contract

```yaml
status: ready_for_spec
change: align-blog-loading-skeleton
artifact_store: hybrid
execution_mode: auto
delivery_strategy: auto-forecast
branch_strategy: feature-branch-chain
review_budget_changed_lines: 800
technical_language: English
implementation_scope: app/[locale]/(pages)/blog/loading.tsx
```

## Intent

Improve the transient localized blog loading state so its geometry communicates the
resolved blog page instead of presenting a different page structure. The current
loading UI uses a muted block for the hero and five category-like pills, while the
resolved page uses the shared two-column `InteriorHero` composition and an always-visible
search input, Filters control, and result count. This is a focused loading-UX correction;
the blog/content strategy remains unchanged.

The prior focused audit established that the six-card placeholder count should be kept
and must not be tuned to the currently observed one-post Sanity dataset. It also found
that local route validation is blocked before rendering when
`NEXT_PUBLIC_SANITY_DATASET` is absent, which is an environment limitation rather than
evidence that the skeleton or blog visibility is broken.

## Scope

### In Scope

- Modify only the production loading implementation at
  `app/[locale]/(pages)/blog/loading.tsx`.
- Make the hero placeholder approximate the resolved `InteriorHero` geometry:
  accent/title/description blocks in the left column, a bordered decorative motif
  placeholder in the right column, matching responsive stacking, spacing, border, and
  theme-aware surface treatment.
- Make the filter placeholder represent the initial resolved `BlogFilters` layout:
  search-field geometry, Filters button geometry, and result-count row. The collapsed
  category panel MUST NOT be represented as visible initial content.
- Preserve exactly six post-card placeholders and their existing responsive three-column
  behavior, image ratio, content structure, and author area unless a focused test needs
  a non-visual stable assertion.
- Add focused tests for the loading component's structural contract, including hero
  layout markers, search/filter/result-count structure, and six-card count.
- Add or update a Playwright blog route-transition smoke check where the configured
  environment permits it; validate loading-to-resolved geometry without changing the
  existing blog behavior tests.
- Report Sanity-dependent route/browser validation as `blocked` with the exact missing
  variable, fetch, or browser-launch reason; continue running static/component checks
  that do not require Sanity.

### Out of Scope

- Blog content, article copy, categories, metadata, visibility, publication strategy, or
  the number of articles/posts returned by Sanity.
- Changing the six-card placeholder count based on current CMS data.
- Sanity schemas, queries, client behavior, environment variables, CMS configuration, or
  local fallback data.
- Article detail loading UI at
  `app/[locale]/(pages)/blog/[slug]/loading.tsx`, article content, related-post loading,
  or article error behavior.
- `InteriorHero`, `BlogFilters`, `PostGrid`, shared `Container`/`Section`, global CSS,
  translations, or design-token changes.
- Footer, header/navigation, other interior pages, unrelated UI, or broad accessibility
  and responsive-layout refactors.
- Changing the blog route's Suspense/loading boundary, error handling, retry behavior,
  or Sanity failure semantics.
- Pixel-perfect snapshots as the sole acceptance mechanism.

## Approach

1. Use the current resolved page as the geometry source: `InteriorHero` at
   `components/ui/InteriorHero.tsx:156-181` and `BlogFilters` at
   `components/blog/BlogFilters.tsx:97-220`.
2. Keep `BlogLoading` a pure server-compatible component with deterministic arrays and
   no data fetching, client hooks, translations, or CMS dependencies.
3. Rebuild only the hero skeleton in the target file around the same responsive two-column
   proportions and vertical rhythm as `InteriorHero`; use neutral skeleton blocks for
   text and decorative motif details rather than importing or executing the real hero.
4. Rebuild only the filter skeleton around the visible initial controls in `BlogFilters`:
   a full-width responsive search field, a Filters control beside it where space allows,
   and a result-count line below. Do not render category options because they are hidden
   until the user opens the panel.
5. Leave the six-card map and card dimensions intact. Avoid content-dependent branching,
   changes to Sanity behavior, or changes to the resolved page.
6. Verify static structure with Testing Library/Vitest. Use semantic or stable structural
   assertions rather than CSS implementation details where possible; if the skeleton has
   no user-facing semantics, use narrowly scoped `data-testid` hooks only if needed.
7. Use Playwright only for the route transition and responsive/light-dark smoke coverage
   when the app can reach the route. Run the existing environment preflight first. Missing
   `NEXT_PUBLIC_SANITY_PROJECT_ID` or `NEXT_PUBLIC_SANITY_DATASET`, an unavailable fetch,
   or an unavailable browser MUST produce a typed `blocked` result and MUST NOT be counted
   as passed coverage.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/[locale]/(pages)/blog/loading.tsx:1-72` | Modified | Align the hero and initial filter placeholders with the resolved blog geometry while preserving six cards. |
| `__tests__/integration/components/` (focused loading test) | Test-only | Assert the loading skeleton's structural contract without Sanity. Exact test path to be selected during spec/design. |
| `e2e/tests/blog.spec.ts` or focused blog E2E coverage | Test-only, conditional | Smoke-test loading-to-resolved behavior only when Sanity/browser prerequisites are available; preserve existing blog scenarios. |

No other production module is a planned change target.

## Tests and Validation

### Static/component checks

- Render `BlogLoading` and assert the hero contains the left text skeleton region and a
  right motif/surface region, with responsive two-column intent represented.
- Assert the filter skeleton contains one search-field placeholder, one Filters-control
  placeholder, and one result-count placeholder, and does not expose five visible
  category pills.
- Assert exactly six post-card placeholders remain, including their image/content shape.
- Assert the component remains renderable without Sanity environment variables and does not
  import or call CMS code.
- Run `npm run test:run`, `npm run type-check`, and `npm run check` according to repository
  convention.

### Browser checks

- With valid Sanity configuration and a launchable browser, exercise the localized blog
  route at desktop and mobile widths, and in light/dark themes where the existing fixture
  supports it. Confirm the loading state can transition to the resolved blog page without
  changing page visibility, filter behavior, or post content.
- If Sanity configuration is missing, record `blocked: Missing environment variable:
  NEXT_PUBLIC_SANITY_DATASET` (and/or the exact project-id reason) rather than treating the
  route's HTTP 500/module-evaluation failure as a product regression.
- If a configured Playwright browser cannot launch, record `blocked` with the browser name
  and exact launch reason. Available browser/static results remain separate.
- Do not claim full Sanity or cross-browser coverage when any required prerequisite is
  blocked.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Skeleton spacing drifts from `InteriorHero` on narrow screens | Medium | Reuse the resolved component's responsive column/stacking intent and validate desktop/mobile geometry. |
| Placeholder suggests category controls that are not initially visible | Low | Model only the search, Filters button, and result-count row; keep category panel collapsed in the skeleton. |
| Visual change is mistaken for a CMS/content change | Low | Keep all data fetching and resolved blog files untouched; explicitly preserve six placeholders and blog visibility. |
| Sanity-blocked runtime prevents transition verification | High in current local environment | Run component tests independently and report exact Sanity/browser blocks without fallback data or false pass claims. |
| Skeleton-only selectors become brittle | Low | Prefer structural/semantic assertions and keep any test hooks narrowly scoped to the loading component. |

## Rollback Plan

Revert the single production-file change in
`app/[locale]/(pages)/blog/loading.tsx` and remove only the focused test additions if the
new geometry causes regressions. No CMS, route, content, configuration, or shared-component
rollback is required because those areas are explicitly unchanged.

## Dependencies

- Existing `InteriorHero` and `BlogFilters` geometry are the source of truth; this proposal
  does not alter either component.
- Existing Vitest/Testing Library and Playwright infrastructure, including typed environment
  reporting, must remain available.
- Sanity project/dataset configuration and reachable data are required only for runtime
  loading-to-resolved browser validation, not for the static loading-component tests.

## Success Criteria

- [ ] `blog/loading.tsx` is the only planned production implementation change.
- [ ] Hero skeleton geometry visibly approximates the resolved `InteriorHero` composition at
      mobile and desktop widths without importing or rendering the actual hero.
- [ ] Filter skeleton visibly represents search, Filters control, and result-count layout;
      no visible initial category-pill row is introduced.
- [ ] Exactly six card placeholders remain.
- [ ] Blog content, article count, Sanity behavior, loading boundary, error behavior, and
      blog visibility are unchanged.
- [ ] Focused static tests pass without Sanity credentials.
- [ ] Browser validation is either completed with truthful prerequisites or reported as
      explicitly `blocked` with exact reasons; no block is counted as coverage.
- [ ] Repository checks (`npm run test:run`, `npm run type-check`, `npm run check`) pass or
      clearly distinguish pre-existing/environment warnings from change failures.
- [ ] The change remains within the configured 800 changed-line review budget.

### Next Step

Ready for delta specifications and technical design.
