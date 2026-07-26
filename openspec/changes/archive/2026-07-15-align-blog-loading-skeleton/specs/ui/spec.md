# Delta for UI

This delta changes only the localized blog list loading presentation in
`app/[locale]/(pages)/blog/loading.tsx`. The resolved blog page, shared components,
content source, and route behavior remain outside this delta. The canonical delta
path is `openspec/changes/align-blog-loading-skeleton/specs/ui/spec.md`.

## ADDED Requirements

### Requirement: Blog loading hero matches the InteriorHero composition

The loading state MUST expose one outer loading status with `role="status"`,
`aria-busy="true"`, and an accessible `aria-label`. Only decorative hero, filter,
and card placeholder descendants MAY be `aria-hidden="true"`. The hero MUST
communicate the resolved `InteriorHero` composition: left accent/title/description
placeholders and a right decorative motif/surface region. Desktop MUST use the
resolved two-column intent; mobile MUST stack in the resolved visual order. The
loading state MUST NOT render or execute `InteriorHero`.

#### Scenario: Desktop hero preserves resolved composition

- GIVEN the blog loading component is rendered at a desktop viewport
- WHEN its hero region is inspected
- THEN a left placeholder region contains accent, title, and description markers
- AND a distinct right placeholder region represents the decorative motif
- AND the regions are contained in responsive columns with spacing and a bottom boundary

#### Scenario: Mobile hero follows responsive stacking

- GIVEN the blog loading component is rendered at a supported mobile viewport
- WHEN the hero region is inspected
- THEN the left content region precedes the right motif region in document order
- AND the regions fit without horizontal scrolling, clipping, or overlap

#### Scenario: Loading hero is independent of the resolved hero

- GIVEN the component is rendered without route data or CMS access
- WHEN its module and tree are inspected
- THEN it contains deterministic placeholder markup only
- AND it does not import, invoke, or duplicate `InteriorHero` behavior

### Requirement: Blog filter loading matches the initial BlogFilters layout

The filter loading state MUST represent one search-field placeholder, one
Filters-control placeholder, and one result-count placeholder below the control row.
The search and Filters placeholders MUST follow the resolved responsive relationship.
The collapsed category panel MUST NOT be represented by placeholder nodes. The
filter region MUST expose explicit stable hooks/attributes for `filter`, `search`,
`control`, and `result-count` regions; no category region or category placeholder
attribute may be emitted.

#### Scenario: Initial controls have one placeholder each

- GIVEN the loading component is rendered before filters are opened
- WHEN the filter region is inspected structurally
- THEN exactly one search, one Filters-control, and one result-count hook is present
- AND the result-count region follows the control row

#### Scenario: Categories are absent

- GIVEN the initial loading state has no filter interaction
- WHEN nodes and explicit region attributes are enumerated
- THEN no category pill, category option, category panel, or category placeholder node exists
- AND only the initial search, Filters-control, and result-count regions are represented

#### Scenario: Filter geometry remains usable on mobile

- GIVEN the loading state is rendered at the narrowest supported mobile viewport
- WHEN browser geometry is measured
- THEN search, Filters, and result-count rectangles are contained and non-overlapping
- AND search and Filters remain distinguishable without horizontal scrolling

### Requirement: Six post-card placeholders remain stable

The loading state MUST retain exactly six post-card placeholders with deterministic
one-, two-, and three-column responsive intent, image ratio, content, and author
regions. The count MUST NOT depend on Sanity data.

#### Scenario: Loading grid contains six cards

- GIVEN the component is rendered without CMS data
- WHEN card hooks are counted
- THEN exactly six cards are present
- AND every card has image, content, and author regions

#### Scenario: Card grid is contained

- GIVEN the six-card state is rendered at mobile and desktop widths
- WHEN browser geometry is measured
- THEN no card is clipped, overlapped, or outside the viewport
- AND document `scrollWidth` is no greater than `clientWidth`

### Requirement: Loading surfaces remain distinguishable across themes and widths

The loading state MUST use the existing theme contract: the application theme is
controlled by `next-themes` and represented by `html.dark`; browser checks MUST set
the class deterministically to light (no `dark`) or dark (`dark`) before inspection.
At both themes and mobile/desktop viewports, visible placeholder surfaces and their
containing borders MUST have non-zero in-viewport rectangles, no change-caused
overflow, and distinguishable computed surface/border values from their surrounding
surface. Component tests MUST NOT claim layout or theme coverage; those are browser
checks, or `blocked` when the browser runtime is unavailable.

#### Scenario: Theme and viewport containment

- GIVEN the loading state is rendered with `html.dark` absent and present at mobile and desktop sizes
- WHEN the browser checks inspect document and explicit loading-region rectangles
- THEN `scrollWidth <= clientWidth`
- AND no region clips or overlaps another unrelated region
- AND hero, filter, and card surfaces have non-zero dimensions and distinguishable computed colors/borders
- AND the same structural hooks and six-card count exist in both themes

### Requirement: Skeleton semantics are accessible and non-interactive

Exactly one discoverable outer loading wrapper MUST use `role="status"`,
`aria-busy="true"`, and `aria-label`. Decorative hero/filter/card descendants
MUST be `aria-hidden="true"`, with no nested status/live region. No placeholder may
be a link, button, input, form control, or focusable element. The component MUST be
server-compatible and require no hooks, timers, translations, or CMS data.

#### Scenario: Assistive technology receives one loading status

- GIVEN assistive technology inspects the loading tree
- WHEN status roles and busy attributes are queried
- THEN exactly one status is discoverable, busy, and named
- AND decorative descendants do not create duplicate announcements

#### Scenario: Keyboard focus cannot enter placeholders

- GIVEN a keyboard user tabs through the loading page
- WHEN loading descendants are inspected
- THEN no descendant is interactive or tabindex-bearing
- AND focus order is not altered by placeholders

#### Scenario: Static rendering needs no runtime dependencies

- GIVEN Sanity variables are absent
- WHEN the component test imports and renders the component
- THEN it completes without browser-only APIs, client hooks, or CMS calls
- AND the single loading status and decorative structure are present

### Requirement: Resolved blog behavior does not regress

The delta MUST NOT change content, article visibility, post count, copy, categories,
metadata, Sanity queries/clients, environment configuration, route boundaries,
Suspense behavior, error behavior, or resolved filter semantics. A route-transition
smoke, when a reliable route hold exists, MUST assert that loading hooks disappear,
the resolved level-one blog heading and labeled search control appear, and resolved
content/filter behavior remains the existing behavior. It MUST NOT assert or tune
Sanity article data beyond existing tests.

#### Scenario: Loading nodes are removed on resolution

- GIVEN a reliable loading hold permits the route transition smoke to observe both states
- WHEN the blog route resolves
- THEN hero, filter, and card loading hooks are absent
- AND the resolved blog level-one heading and labeled search control are visible

#### Scenario: Resolved semantics remain unchanged

- GIVEN the blog route resolves with the configured existing data
- WHEN the smoke checks the page
- THEN the route, heading, search presence, and existing filter/content semantics remain unchanged
- AND no loading-only node remains

#### Scenario: No reliable route hold is an explicit block

- GIVEN the test environment cannot hold the route before resolution without changing production route or Sanity behavior
- WHEN the transition smoke is selected
- THEN it is reported as `blocked: no reliable route hold available`
- AND it is not reported as passed, skipped coverage, or a product failure
- AND static component assertions still execute

### Requirement: Validation distinguishes executed, failed, skipped, and blocked checks

Component tests MUST deterministically validate the static contract: one status,
busy/name attributes, decorative hiding, non-interactivity, explicit region hooks,
category absence, six cards, and class-level responsive intent. They MUST NOT measure
layout. Browser checks MUST perform geometry, theme, and transition assertions when
prerequisites exist. Missing Sanity variables, unavailable fetch/server, unavailable
browser, or absent reliable route hold MUST produce typed `blocked` results with
exact reasons. Blocked results MUST be excluded from passed coverage; genuine
assertion failures remain failures.

#### Scenario: Static contract passes without Sanity or browser

- GIVEN the component runner is available but Sanity or a browser is unavailable
- WHEN focused component tests execute
- THEN all static assertions run and are reported independently
- AND no component test claims layout measurement or full theme coverage

#### Scenario: Runtime prerequisite is blocked truthfully

- GIVEN `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, the Sanity fetch/server, browser launch, or route hold is unavailable
- WHEN the corresponding browser check is attempted
- THEN the report records `blocked` with the exact missing variable or runtime reason
- AND the result contributes neither passed coverage nor a false success

#### Scenario: Available assertion failure remains a failure

- GIVEN a static or executable browser assertion fails while another check is blocked
- WHEN results are summarized
- THEN that assertion is `failed`, not `blocked` or `passed`
- AND passed, failed, skipped, and blocked counts remain distinct

### Requirement: Rollback is verifiable and scoped

Rollback MUST revert only the `loading.tsx` production hunk and remove only focused
test/E2E additions introduced by this change. After rollback, focused tests MUST
confirm the prior loading component contract (or the pre-change baseline), existing
blog E2E tests MUST run, and no shared component, route, CMS, configuration, or
content file may be altered. Conditional E2E additions MUST be safely removable
without leaving fixtures, reporters, hooks, or production selectors behind.

## Scope Constraints

Production scope is limited to `app/[locale]/(pages)/blog/loading.tsx`; focused
component tests and conditional E2E coverage are test-only additions. No blog
content strategy, CMS, routes, shared components, global styles, translations,
error behavior, fallback data, or pixel snapshot-only acceptance may be added.
