# Design: Align Blog Loading Skeleton

## Technical Approach

Modify only `app/[locale]/(pages)/blog/loading.tsx` in production. Keep the default
`BlogLoading` export deterministic, server-compatible, and free of props, hooks,
translations, Sanity imports, browser APIs, and data-dependent branches. Use the
resolved geometry at `components/ui/InteriorHero.tsx:156-181` and
`components/blog/BlogFilters.tsx:97-220` as local class-boundary references, not as
imports. Preserve the existing six-card subtree and route loading boundary.

The complete placeholder tree is wrapped once:

```text
div role=status aria-busy=true aria-label="Loading blog page"
├── hero region aria-hidden=true
├── filter region aria-hidden=true
└── card grid aria-hidden=true
```

Only decorative descendants are hidden. The outer status remains discoverable; no
child status/live region or focusable fake control is emitted.

## Architecture Decisions

### Decision: Use one discoverable status and decorative descendants

**Choice**: Put `role="status"`, `aria-busy="true"`, and a stable `aria-label` on
one outer wrapper. Mark only hero, filter, and card placeholder regions
`aria-hidden="true"`.

**Alternatives considered**: Hide the entire tree with `aria-hidden`, expose each
region as a status, or render fake inputs/buttons.

**Rationale**: This resolves the accessibility contradiction: assistive technology
gets one loading announcement while decorative geometry cannot produce duplicate
content. No loading descendant is interactive or focusable.

### Decision: Copy geometry locally and retain the resolved page contract

**Choice**: Reproduce the resolved hero two-column breakpoint, stacking order,
surface treatment, and initial filter row locally. Keep `Section` and `Container`
APIs unchanged and retain six cards.

**Alternatives considered**: Render shared components with dummy props, preserve the
old full-width hero/five pills, or create a shared skeleton component.

**Rationale**: Shared components require content/state and would widen production
scope. Local deterministic markup aligns geometry without changing content, CMS,
routes, or shared behavior.

### Decision: Explicit region hooks encode the test contract

**Choice**: Add narrowly scoped `data-testid`/`data-region` hooks for the status,
hero, hero columns, filter, search, Filters control, result count, card grid, and
card/image/content/author regions. Emit no category hook or category node.

**Alternatives considered**: Assert Tailwind classes for every element, infer
categories from counts, or use fake semantic controls.

**Rationale**: Stable region attributes make absence and count deterministic while
avoiding coupling to every utility class. Classes are asserted only for responsive
intent; layout is verified only in a browser.

### Decision: Make validation deterministic and truthful

**Choice**: Component tests prove the static DOM/accessibility contract and class
intent only. They do not measure geometry, theme rendering, or transitions. A
single optional Playwright transition smoke runs only if the existing preflight
provides a reliable route hold; otherwise it emits a typed blocked result.

**Alternatives considered**: Use timing sleeps, treat fixture skips as passes, add
production route controls, or claim full theme/layout coverage from happy-dom.

**Rationale**: A loading boundary may resolve before a test can observe it. Timing
does not make that deterministic, and adding route hooks violates scope. Static and
runtime evidence must remain separate, with blocked not equal to passed.

### Decision: Use the existing next-themes class contract

**Choice**: Browser checks set `document.documentElement.classList` deterministically:
remove `dark` for light and add `dark` for dark, matching `next-themes` in
`lib/design/theme-provider.tsx:1-16`. At each theme and viewport, assert
`scrollWidth <= clientWidth`, non-zero in-viewport rectangles, no overlap/clipping,
and distinguishable computed placeholder surface/border values.

**Alternatives considered**: Add a test-only theme provider, mutate storage without
checking the applied class, or claim theme coverage from component markup.

**Rationale**: The application already uses `next-themes`; deterministic class setup
is independent of system preference and does not change production code. Geometry
and computed-style assertions require a real browser and are blocked when it cannot
run.

## Data Flow and State Transition

```text
Next.js loading boundary
        │
        ▼
BlogLoading() ── deterministic arrays ──► one status + decorative DOM
        │                                  (no CMS/client/runtime data)
        └──────────── route resolves ───────────► existing BlogPage
                                                 (loading hooks absent)
```

The component does not fetch, filter, handle errors, or participate in resolution.
The transition smoke observes the existing route only; it does not modify Sanity,
route behavior, or content fixtures.

## Exact DOM and Class Boundaries

### Production file

`app/[locale]/(pages)/blog/loading.tsx` is the only production implementation target.

- Outer wrapper: one `role="status"`, `aria-busy="true"`, and
  `aria-label="Loading blog page"`; no `aria-hidden` on this wrapper.
- Hero region: `data-region="hero"`, `aria-hidden="true"`, responsive grid intent
  matching `InteriorHero`; content precedes motif in DOM order.
- Filter region: `data-region="filters"`, `aria-hidden="true"`, with exactly one
  `search`, `filter-control`, and `result-count` region. No category elements or
  category attributes.
- Card grid: `data-region="cards"`, `aria-hidden="true"`, existing
  `grid gap-8 sm:grid-cols-2 lg:grid-cols-3` intent and six cards.
- Decorative descendants use `div`/`span` only; no `a`, `button`, `input`, `select`,
  `textarea`, `form`, `tabIndex`, nested `role="status"`, or `aria-live`.
- Theme classes use existing semantic tokens (`bg-background`, `bg-card/55`,
  `border-border`, `bg-muted`, `bg-muted-foreground/20`); no `var()` or hex in
  Tailwind class strings.

### Test-only files

- `__tests__/integration/components/BlogLoading.test.tsx`: focused static contract.
- `e2e/tests/blog.spec.ts`: one conditional transition/geometry smoke only if the
  established fixture can hold loading; existing blog behavior tests remain intact.
- Use existing `e2e/fixtures/environment-status.ts` and reporter semantics. A
  missing `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, unavailable
  fetch/server/browser, or absent route hold is `blocked` with the exact reason,
  never a passing or coverage-counted skip.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/(pages)/blog/loading.tsx` | Modify | Align hero/filter geometry, add one status wrapper and explicit decorative region hooks, preserve six cards. |
| `__tests__/integration/components/BlogLoading.test.tsx` | Create | Deterministically test static status, hiding, non-interactivity, region counts, category absence, and responsive class intent. |
| `e2e/tests/blog.spec.ts` | Conditional modify | Add one transition/geometry smoke only when a reliable hold exists; report unavailable runtime as blocked. |

No other production file, fixture, reporter, route, shared component, CMS module,
configuration, translation, or content file is in scope.

## Interfaces / Contracts

```typescript
export default function BlogLoading(): JSX.Element;
```

There are no new public props or TypeScript interfaces. The stable DOM contract is:

- one outer `role=status[aria-busy="true"]` with a non-empty `aria-label`;
- decorative `data-region` values for hero, filters, cards, and their subregions;
- exactly one each of search, filter-control, and result-count;
- zero category nodes/attributes;
- exactly six card regions;
- no focusable or interactive descendants.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Component/integration | Static loading contract | Testing Library/Vitest in happy-dom with Sanity variables absent; assert one named busy status, decorative `aria-hidden` regions, hooks/counts, category absence, six cards, no interactive descendants, and responsive class markers. |
| Component/integration | Runtime independence | Import/render without browser APIs, translations, mocks for CMS, or CMS fixtures; do not assert rectangles or computed colors. |
| E2E | Theme and geometry | For light/dark class setup and mobile/desktop viewports, assert overflow, clipping, overlap, non-zero rectangles, and computed surface/border distinction for explicit regions. |
| E2E | Loading-to-resolved smoke | Only with a reliable existing route hold; wait for hooks, then assert hooks disappear plus level-one blog heading and labeled search control. No sleeps, Sanity-data assertions, or semantic changes. |
| Repository | Regression | Run configured test/type/check commands; separate static results from typed runtime blocks. |

## Migration / Rollout

No migration, feature flag, route rollout, data change, or configuration change is
required. Roll out the isolated loading markup after static tests, type/check
validation, and available browser checks. Do not claim full theme or responsive
coverage when runtime prerequisites are blocked.

### Rollback and post-rollback verification

1. Revert only the `loading.tsx` change and remove the focused component/E2E additions.
2. Confirm `git diff` contains no shared, route, CMS, fixture, reporter, or config changes.
3. Run the repository component suite and existing `e2e/tests/blog.spec.ts` tests.
4. If the conditional smoke was added, remove it without leaving selectors, hooks,
   route holds, or fixture/reporting changes behind.
5. Report any unavailable Sanity/browser runtime as `blocked`; report actual
   post-rollback assertion failures as failures.

## Open Questions

- [ ] None blocking. If the existing Playwright setup cannot reliably hold loading,
  omit the transition smoke and record `blocked: no reliable route hold available`;
  do not alter production route/Sanity behavior to create one.
