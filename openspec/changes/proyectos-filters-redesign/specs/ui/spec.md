# Delta for UI — Proyectos Filters Redesign

## Purpose

Redesign the `/proyectos` filter area so every filter dimension (search, source, technologies) is always visible without a toggle panel, de-gray the unselected chip state, promote the source facet to a segmented control, and cap the visible tech chips at a deterministic top-N with the remainder reachable through a searchable, keyboard-navigable dropdown. All existing filtering semantics, URL contract, results region, grid, and empty state are preserved.

## ADDED Requirements

### Requirement: Always-visible projects filter layout

The `/proyectos` filter area MUST render the search field, the source segmented control, and the technology chip bar on initial render, in both locales and at both mobile and desktop widths, without requiring any user action to reveal them. The "Filtros" toggle button, its active-filter count badge, the collapsible filter panel, and the `showFilters` state MUST be removed entirely. The "Clear" ghost button MUST remain, rendered only when at least one filter is active. (Previously: source and technology facets were hidden behind a "Filtros" toggle that opened a collapsible panel.)

#### Scenario: Filters visible on initial render

- GIVEN a visitor loads `/proyectos` (either locale, any viewport)
- WHEN the page finishes rendering
- THEN the search input, the source segmented control, and the technology chip bar are all visible
- AND no "Filtros" toggle button exists in the document
- AND no collapsible filter panel container exists in the document

#### Scenario: Clear button still gated on active filters

- GIVEN `/proyectos` is rendered with no active filters
- WHEN the filter area is inspected
- THEN no clear/reset button is rendered
- WHEN the visitor activates any filter (search text, non-default source, or a tech chip)
- THEN the clear button appears and activating it resets all filters and the URL

### Requirement: Shared FilterChip semantics and touch target

A shared `FilterChip` component MUST encapsulate the toggle-chip behavior. Each chip MUST be a native button exposing `role="checkbox"` and `aria-checked` reflecting its selection state, MUST render a bare check icon (`data-testid="filter-check"`, `aria-hidden="true"`, no surrounding circle) only when selected, and MUST have a rendered bounding box of at least 44px by 44px. Selection MUST NOT be communicated by color alone.

#### Scenario: Selected chip exposes checked checkbox semantics

- GIVEN a tech or category chip whose value is currently selected
- WHEN the chip is inspected
- THEN it has `role="checkbox"` and `aria-checked="true"`
- AND it contains a bare check icon marked `aria-hidden="true"` with `data-testid="filter-check"`
- AND its bounding box is at least 44px by 44px

#### Scenario: Unselected chip exposes unchecked semantics without check icon

- GIVEN a chip whose value is not selected
- WHEN the chip is inspected
- THEN it has `role="checkbox"` and `aria-checked="false"`
- AND it contains no check icon
- AND its bounding box is at least 44px by 44px

#### Scenario: Chip toggles with keyboard

- GIVEN a chip has keyboard focus
- WHEN the user presses Enter or Space
- THEN the chip's selection state toggles
- AND `aria-checked` updates to match

### Requirement: De-grayed unselected chip state

Unselected chips MUST use foreground-toned text on a card/background surface and MUST NOT render `text-muted-foreground` on a muted (`bg-muted` or equivalent) background. The unselected chip label MUST meet a computed contrast ratio of at least 4.5:1 against its background in both light and dark themes. The selected chip state MUST retain the primary-toned treatment (border, tinted background, primary text).

#### Scenario: Unselected chip passes contrast in light theme

- GIVEN an unselected chip rendered in the light theme
- WHEN its computed label foreground and background colors are measured
- THEN the contrast ratio is at least 4.5:1
- AND the chip's class list contains no `text-muted-foreground` applied over a muted background

#### Scenario: Unselected chip passes contrast in dark theme

- GIVEN an unselected chip rendered in the dark theme
- WHEN its computed label foreground and background colors are measured
- THEN the contrast ratio is at least 4.5:1

#### Scenario: Axe reports no contrast violations in the filter region

- GIVEN the `/proyectos` page is loaded in an available browser
- WHEN an axe scan runs over the filter region in either theme
- THEN no color-contrast violations are reported

### Requirement: SourceSegmentedControl promotes the source facet

The source facet MUST be rendered as an always-visible segmented control adjacent to the search input, exposing `role="radiogroup"` with a localized `aria-label`, and exactly three options — All, Curated, GitHub — each exposing `role="radio"` with `aria-checked` on the active option. Selection MUST be single-select: activating an option deselects the previous one. The control MUST support arrow-key navigation between options (roving tabindex), and every segment MUST have a bounding box of at least 44px in height. Below the `sm` breakpoint the control MUST remain fully visible and usable (full-width, equally-shared segments).

#### Scenario: Radiogroup semantics on initial render

- GIVEN `/proyectos` is rendered
- WHEN the source control is inspected
- THEN one element has `role="radiogroup"` with a localized accessible name
- AND exactly three `role="radio"` options exist
- AND the "All" option has `aria-checked="true"` when no source filter is active

#### Scenario: Single-select behavior

- GIVEN the "GitHub" option is selected
- WHEN the user activates the "Curated" option
- THEN "Curated" has `aria-checked="true"` and "GitHub" has `aria-checked="false"`
- AND the project list shows only curated-source projects
- AND the URL `source` param reflects the new selection

#### Scenario: Arrow-key navigation

- GIVEN focus is on the selected source segment
- WHEN the user presses ArrowRight or ArrowLeft
- THEN focus moves to the adjacent segment in the pressed direction (wrapping at the ends)
- AND the focused segment becomes the selected one per roving-tabindex radio-group convention

#### Scenario: Mobile layout keeps all segments visible

- GIVEN the page is rendered at a 320px viewport
- WHEN the source control is measured
- THEN all three segments have non-zero, non-overlapping bounding boxes within the viewport
- AND each segment is at least 44px tall

### Requirement: TechFilterBar renders a deterministic top-N plus pinned selections

The technology facet MUST be rendered as an always-visible wrapping chip bar. The visible chips MUST consist of the top 8 technologies by frequency across the project list, ordered deterministically (frequency descending, ties broken by `localeCompare`), UNION any currently selected technologies not in the top 8, which MUST be pinned into the visible bar so a dropdown-only selection never becomes invisible. When more technologies exist than the visible set, a trailing "More" trigger chip MUST display the localized count of remaining technologies and open the `TechDropdown`.

#### Scenario: Top 8 by frequency rendered deterministically

- GIVEN a project list where more than 8 distinct technologies exist
- WHEN the tech bar is rendered
- THEN exactly the 8 most frequent technologies appear as chips, ordered by frequency descending with `localeCompare` tie-breaking
- AND re-rendering with the same data produces the identical order

#### Scenario: Dropdown-selected tech is pinned visible

- GIVEN a technology that is not in the top 8 by frequency
- WHEN the user selects it from the dropdown
- THEN that technology appears as a selected chip in the visible bar
- AND it remains visible in the bar while selected

#### Scenario: More trigger shows the correct remaining count

- GIVEN N total distinct technologies, of which V are visible in the bar (top 8 plus pinned selections not in the top 8)
- WHEN the "More" trigger is rendered
- THEN its label communicates `+(N - V)` remaining technologies in the active locale
- AND the trigger exposes `aria-haspopup="listbox"` and `aria-expanded="false"` while closed

#### Scenario: No More trigger when all techs fit

- GIVEN a project list with 8 or fewer distinct technologies
- WHEN the tech bar is rendered
- THEN no "More" trigger is rendered

### Requirement: TechDropdown is searchable, keyboard-navigable, and focus-managed

The technology overflow dropdown MUST be built on an accessible popover primitive (`@radix-ui/react-popover`) anchored to the "More" trigger, bounded in width (`w-72` max) and height (`max-h-80`, scrollable), and positioned to remain within the viewport on mobile. It MUST contain a filter input that typeahead-filters the remaining (non-visible) technologies, and a `role="listbox"` with `aria-multiselectable="true"` whose options expose `role="option"` and `aria-selected`. On open, focus MUST move to the filter input; options MUST be navigable with Up/Down arrows and toggled with Enter/Space; pressing Escape MUST close the dropdown and return focus to the trigger. When the typeahead matches nothing, a localized no-results message MUST be shown.

#### Scenario: Open moves focus to the filter input

- GIVEN the "More" trigger has focus and the dropdown is closed
- WHEN the user activates the trigger with Enter, Space, or click
- THEN the dropdown opens, the trigger's `aria-expanded` becomes `"true"`
- AND focus is inside the dropdown on the filter input

#### Scenario: Typeahead filters remaining techs

- GIVEN the dropdown is open
- WHEN the user types a substring matching some remaining technologies
- THEN only matching technologies are listed as options
- AND each option exposes `role="option"` with the correct `aria-selected`

#### Scenario: Typeahead with no matches shows localized empty message

- GIVEN the dropdown is open
- WHEN the user types a string matching no remaining technology
- THEN a localized "no technologies match" message is rendered
- AND no option elements are listed

#### Scenario: Toggling an option updates selection without closing

- GIVEN the dropdown is open and an option is highlighted
- WHEN the user presses Enter or Space
- THEN that technology's `aria-selected` toggles
- AND the global tech selection and URL `tech` param update accordingly
- AND the dropdown remains open

#### Scenario: Escape closes and returns focus

- GIVEN the dropdown is open
- WHEN the user presses Escape
- THEN the dropdown closes, the trigger's `aria-expanded` becomes `"false"`
- AND focus returns to the "More" trigger

#### Scenario: Selected-from-dropdown techs persist in the visible bar

- GIVEN a technology selected via the dropdown
- WHEN the dropdown closes
- THEN that technology appears as a selected chip in the visible tech bar

### Requirement: Loading skeleton mirrors the new filter layout

The `/proyectos` loading state MUST mirror the always-visible filter layout: the filter region MUST expose placeholders for the search field, the source segmented control, and the technology chip bar (rather than the old single filter-toggle placeholder), preserving the established `data-region` conventions (`filter`, `search`, `control`, plus a tech-bar region), the single `role="status"` wrapper, and `aria-hidden="true"` on decorative descendants. Card grid, result-count placeholder, and hero regions MUST remain unchanged.

#### Scenario: Skeleton exposes the new filter regions

- GIVEN the proyectos loading component is rendered
- WHEN its filter region is inspected
- THEN placeholders exist for search, a segmented-control-shaped control, and a technology chip bar
- AND no placeholder represents a "Filtros" toggle button or a collapsible panel

#### Scenario: Skeleton remains a single non-interactive status region

- GIVEN the loading component is rendered
- WHEN its tree is inspected
- THEN exactly one `role="status"` wrapper with `aria-busy="true"` and an accessible label exists
- AND all placeholder descendants are `aria-hidden="true"` and non-focusable

#### Scenario: Skeleton parity check passes

- GIVEN the implemented `/proyectos` page and its loading skeleton
- WHEN the structural parity test compares their filter regions
- THEN the same `data-region` hooks (search, control, tech bar) exist in both

### Requirement: URL persistence round-trips all filter dimensions

The URL contract MUST remain `q` (search text), `tech` (comma-joined, OR semantics), and `source` (omitted when `all`), synced via `router.replace(…, { scroll: false })` with the existing debounce behavior for `q`. Initial state MUST hydrate from `useSearchParams`, so a refreshed or shared URL restores the identical filter state — including technologies that live only in the dropdown, which MUST surface as pinned visible chips after hydration.

#### Scenario: Refresh restores full filter state

- GIVEN the user has set a search query, selected "GitHub" as source, and selected two technologies (one from the visible bar, one from the dropdown)
- WHEN the page URL is copied and loaded in a fresh navigation
- THEN the search input shows the query, "GitHub" is the checked radio
- AND both technologies appear as selected chips in the visible bar
- AND the project list and results count match the pre-refresh state

#### Scenario: Source param omitted for default

- GIVEN the source selection is "All"
- WHEN the URL is inspected
- THEN no `source` param is present

#### Scenario: Clearing filters empties the URL

- GIVEN active filters are applied
- WHEN the user activates the clear button
- THEN all filter state resets to defaults and the URL has no `q`, `tech`, or `source` params

### Requirement: Bilingual i18n parity for new filter strings

All new user-facing strings (segmented-control label, tech-bar label, "More" trigger label and aria label, dropdown search placeholder, dropdown no-results message) MUST resolve from the `Projects.*` message namespace with parallel keys in both `messages/es.json` and `messages/en.json`, with equivalent intent and working interpolation of the remaining-count value. No user-facing string MAY be hardcoded in TSX.

#### Scenario: Both catalogs resolve all new keys

- GIVEN both message catalogs are loaded
- WHEN the new `Projects.*` keys are inspected
- THEN every new key exists in both catalogs with non-empty copy
- AND the count placeholder interpolates correctly in both locales

#### Scenario: Rendered UI uses localized strings

- GIVEN the Spanish `/proyectos` page is rendered
- WHEN the source control aria-label, "More" trigger, and dropdown placeholder are inspected
- THEN they expose the Spanish copy
- AND the English page exposes the English copy for the same controls

#### Scenario: Pruned keys are verified unused first

- GIVEN the redesign removes the toggle/panel that referenced the `filters`, `sourceHeading`, `techHeading`, and `techHint` keys
- WHEN any key is deleted from the catalogs
- THEN a usage check (including blog components and message-usage tests) has confirmed no remaining reference
- AND keys still referenced elsewhere are retained

### Requirement: Existing filtering behavior does not regress

The redesign MUST NOT change client-side filtering logic, tech OR semantics, the search matching rules, the results-count `aria-live="polite"` region, the active-filter badges, the project grid behavior, the empty state (title, hint, clear-all action), `SearchInput`, or `ProjectCard` internals. No new facets, sort controls, or data-flow changes MAY be introduced.

#### Scenario: Results count and badges keep working

- GIVEN active filters are applied through the new controls
- WHEN the results region is inspected
- THEN the `aria-live="polite"` count reflects the filtered/total numbers
- AND active-filter badges render for the query, non-default source, and each selected tech

#### Scenario: OR semantics preserved across multiple tech selections

- GIVEN two technologies are selected (via bar, dropdown, or one of each)
- WHEN the project list is evaluated
- THEN projects matching at least one of the selected technologies are shown
- AND the results count matches that OR-filtered set

#### Scenario: Empty state unchanged

- GIVEN a filter combination matching zero projects
- WHEN the page is rendered
- THEN the existing empty state (icon, localized title, hint, and clear-all button) is shown
- AND activating clear-all resets all filters

#### Scenario: Grid behavior unchanged

- GIVEN a non-empty filtered result set
- WHEN the grid is inspected
- THEN it renders the same responsive card layout as before with `ProjectCard` items in order

### Requirement: Blog parity when FilterChip is extracted

If the shared `FilterChip` component is extracted, `components/blog/BlogFilters.tsx` SHOULD adopt it in place of its duplicated chip-class logic, so blog chips inherit the checkbox semantics, bare check icon, de-grayed unselected state, and ≥44px target. Blog behavior, URL contract, panel visibility, and copy MUST NOT otherwise change. If adoption is not natural within this change's scope, blog chips MAY remain as-is and this requirement is satisfied by a documented decision. (Previously: blog chips duplicated the projects chip-class helper and used `aria-pressed` on plain buttons.)

#### Scenario: Blog chips use the shared chip

- GIVEN the shared `FilterChip` exists and blog adoption is in scope
- WHEN the blog category chips are inspected
- THEN they expose `role="checkbox"` with correct `aria-checked`, the bare check icon on selection, and ≥44px targets
- AND the blog filter behavior (category selection, search, clear) is unchanged

#### Scenario: Blog behavior unchanged by the adoption

- GIVEN blog chips adopt `FilterChip`
- WHEN a user selects a category and searches
- THEN the same URL params and filtered results occur as before the adoption

## MODIFIED Requirements

### Requirement: Skeleton semantics are accessible and non-interactive

The proyectos loading state MUST retain exactly one discoverable outer loading wrapper using `role="status"`, `aria-busy="true"`, and `aria-label`, with decorative descendants `aria-hidden` and non-focusable. This contract now extends to the new filter-region placeholders (search, segmented control, tech bar): they MUST be decorative, `aria-hidden`, and non-interactive.
(Previously: the filter region contained only a search placeholder and a single filter-toggle control placeholder.)

#### Scenario: New filter placeholders are decorative

- GIVEN the updated loading component is rendered
- WHEN the segmented-control and tech-bar placeholders are inspected
- THEN they are `aria-hidden="true"`, contain no focusable or interactive elements, and expose the stable `data-region` hooks

### Requirement: Keyboard access and visible focus

All new filter controls — chips, source segments, the "More" trigger, the dropdown filter input, and dropdown options — MUST be reachable in logical keyboard order, operable with the keyboard, and visibly indicate focus using the existing focus-visible treatment. Focus MUST move into the dropdown on open and return to the trigger on close.
(Previously: the contract covered homepage hero and featured actions; it now extends to the proyectos filter controls.)

#### Scenario: Tab order traverses the filter area logically

- GIVEN a keyboard-only user starts before the filter area
- WHEN the user presses Tab
- THEN focus reaches the search input, the source segmented control, each visible tech chip, the "More" trigger, and the clear button (when present) in visual order

#### Scenario: Focus remains visible on every new control

- GIVEN any chip, segment, trigger, or dropdown option has keyboard focus
- WHEN the element is focused without pointer interaction
- THEN a visible focus indicator is rendered
- AND selection/focus state is not communicated by color alone

## REMOVED Requirements

None. No existing cataloged requirement is removed by this delta. The collapsible "Filtros" toggle/panel behavior being deleted from `ProjectsClient.tsx` was never captured as a standalone spec requirement, so its removal is expressed as the MODIFIED/ADDED layout requirements above rather than a REMOVED entry. The blog loading skeleton contract ("Blog filter loading matches the initial BlogFilters layout") is explicitly out of scope and remains in force unchanged.
