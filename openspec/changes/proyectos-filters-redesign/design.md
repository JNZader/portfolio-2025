# Design: Proyectos Filters Redesign

## Technical Approach

Decompose the filter area of `ProjectsClient.tsx` into three new, single-responsibility components — a shared `FilterChip`, a `SourceSegmentedControl` (radiogroup), and a `TechFilterBar` + `TechDropdown` pair (Radix popover) — while leaving all state, filtering, and URL-sync logic exactly where it is today. The "Filtros" toggle, count badge, collapsible panel, and `showFilters` state are deleted; the search + segmented control + chip bar render unconditionally. `ProjectsClient` shrinks to a composition root. The loading skeleton is restructured to mirror the new always-visible layout, and the shared chip is adopted by `BlogFilters.tsx` (in-scope per spec: adoption is natural since the blog duplicates the exact `chipClassName` helper being extracted).

No data-flow, filtering-semantics, or URL-contract changes. One new dependency: `@radix-ui/react-popover`.

## Architecture Decisions

### Decision: Extract a shared `FilterChip` into `components/ui/`

**Choice**: New `components/ui/FilterChip.tsx`, consumed by `TechFilterBar` (projects) and `BlogFilters.tsx` (blog parity).
**Alternatives considered**: (a) Keep two local `chipClassName` helpers and only restyle — rejected: the spec requires checkbox semantics (`role="checkbox"` + `aria-checked`) and the bare check icon in both places; duplicating ARIA logic across files is how the current `aria-pressed`-vs-checkbox drift happened. (b) Put the chip under `components/projects/` — rejected: blog is a different feature area; `components/ui/` is the established shared-primitive location (`SearchInput`, `Badge`, `Button`).
**Rationale**: One component owns the semantics (role, `aria-checked`, check icon, 44px target, de-grayed palette) so both features inherit fixes and the classes can't diverge again.

### Decision: `SourceSegmentedControl` as a radiogroup with roving tabindex

**Choice**: `role="radiogroup"` wrapper + three `role="radio"` buttons; exactly one `tabIndex={0}` (the checked option), others `-1`; Arrow keys move focus *and* select (standard radio-group convention); Home/End jump to first/last.
**Alternatives considered**: (a) Three toggle buttons with `aria-pressed` — rejected: single-select facets are radio semantics; the spec mandates `radiogroup`/`radio`. (b) Radix `RadioGroup` or `ToggleGroup` — rejected: adds a second new dependency for behavior that is ~40 lines of keyboard handling on native buttons; we only need popover from Radix.
**Rationale**: Correct AT semantics with minimal dependency surface; focus-follows-selection matches the spec scenario "the focused segment becomes the selected one".

### Decision: `TechDropdown` on `@radix-ui/react-popover` with `aria-activedescendant`

**Choice**: Radix Popover (trigger = "More" chip, `asChild`), content contains a filter input + `role="listbox"`; **focus stays in the input** while ↑/↓ move an active option via `aria-activedescendant`; Enter/Space toggles the active option; Esc/outside-click close via Radix (which returns focus to the trigger).
**Alternatives considered**: (a) Hand-rolled popover — rejected: focus containment, outside-click, Esc, and viewport collision are exactly the bugs the proposal's risk table flags; Radix solves them. (b) Roving tabindex into the listbox options — rejected: combined with a typeahead input it forces focus juggling between input and list on every keystroke; `aria-activedescendant` keeps typing uninterrupted and is the canonical combobox-listbox pattern. (c) Radix `Select`/`DropdownMenu` — rejected: wrong semantics (single-select / menu, not a multiselect listbox that stays open).
**Rationale**: Accessibility correctness with the least custom focus code; project already ships Radix primitives (`react-slot`, `react-visually-hidden`) so the dependency pattern is established.

### Decision: Deterministic top-N computed in `TechFilterBar`, pinned-selection union

**Choice**: `TechFilterBar` receives `projects` + `selectedTechs` and computes: frequency map → top 8 (freq desc, `localeCompare` tie-break) → `visible = top8 ∪ pinned` where `pinned = selectedTechs \ top8` (sorted `localeCompare`, appended after the top 8) → `remaining = allTechs \ visible`. "More" label count = `allTechs.length - visible.length`.
**Alternatives considered**: (a) Compute in `ProjectsClient` and pass down — rejected: it's purely presentational derivation; keeping it in the bar keeps `ProjectsClient` a thin composition root. (b) Interleave pinned techs by frequency rank — rejected: appended-at-end is simpler, deterministic, and visually groups "your extra selections".
**Rationale**: Spec-mandated formula, referentially transparent, trivially unit-testable. Note: frequency depends only on the `projects` prop, which is stable per page load (ISR), so chips don't reorder during a session.

### Decision: No manual memoization in new components (React Compiler)

**Choice**: New components (`FilterChip`, `SourceSegmentedControl`, `TechFilterBar`, `TechDropdown`) are written as plain functions without `useMemo`/`useCallback` — the project ships `babel-plugin-react-compiler` (React 19). The existing `useMemo` blocks in `ProjectsClient` (tech extraction, filtering) are **not touched** — filtering logic is explicitly out of scope.
**Rationale**: Follows the project's React 19 + Compiler convention; touching the existing memos would be churn outside the change's scope.

### Decision: Blog parity is in scope

**Choice**: `BlogFilters.tsx` adopts `FilterChip` for the "All" + category chips, dropping its local `chipClassName`. Blog toggle panel, URL contract, counts, and copy are untouched.
**Alternatives considered**: Leave blog as-is (spec allows deferral with a documented decision) — rejected: the blog helper is a line-for-line duplicate of the one being deleted; not adopting it recreates the exact drift this change fixes, and the diff is small (~40 lines).
**Rationale**: Semantic change for blog chips is `aria-pressed` → `role="checkbox"` + `aria-checked`, which the spec explicitly blesses ("blog chips inherit the checkbox semantics").

## Component Tree

```
app/[locale]/(pages)/proyectos/page.tsx          (unchanged — server, fetches projects)
└── ProjectsClient.tsx                            (MODIFIED — state + URL sync + composition)
    ├── SearchInput                               (unchanged — components/ui/SearchInput.tsx)
    ├── SourceSegmentedControl.tsx                (NEW — components/projects/)
    ├── TechFilterBar.tsx                         (NEW — components/projects/)
    │   ├── FilterChip  (× visible techs)         (NEW — components/ui/)
    │   └── TechDropdown.tsx                      (NEW — components/projects/)
    │       └── FilterChip-styled trigger + Radix Popover (input + listbox)
    ├── Button (ghost "Clear")                    (unchanged pattern)
    ├── results row (aria-live count + badges)    (unchanged)
    └── grid / empty state                        (unchanged)

components/blog/BlogFilters.tsx                   (MODIFIED — adopts FilterChip)
└── FilterChip  (× "All" + categories)
```

## Interfaces / Contracts

```typescript
// components/ui/FilterChip.tsx
interface FilterChipProps {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;          // label (+ optional count badge, used by blog)
  className?: string;           // merged via cn(); blog passes nothing extra
}
// Renders: <button type="button" role="checkbox" aria-checked={selected}
//   className={cn(base, selected ? selectedClasses : unselectedClasses, className)}>
//   {selected && <Check data-testid="filter-check" className="h-3.5 w-3.5" aria-hidden="true" />}
//   {children}
// </button>

// components/projects/SourceSegmentedControl.tsx
export type ProjectSource = 'all' | 'sanity' | 'github';  // moved here from ProjectsClient

interface SourceSegmentedControlProps {
  value: ProjectSource;
  onChange: (source: ProjectSource) => void;
}
// Internal: options = [{ value: 'all', label: t('sourceAll') },
//                      { value: 'sanity', label: t('sourceCurated') },
//                      { value: 'github', label: t('sourceGithub') }] as const
// Wrapper: role="radiogroup" aria-label={t('sourceLabel')}
// Segments: role="radio" aria-checked tabIndex={checked ? 0 : -1}
// onKeyDown: ArrowRight/ArrowDown → next (wrap), ArrowLeft/ArrowUp → prev (wrap),
//            Home → first, End → last; moving focus calls onChange (focus-follows-selection)

// components/projects/TechFilterBar.tsx
interface TechFilterBarProps {
  projects: Project[];
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
}
// Computes topN(8)/pinned/remaining; wrapper: <div role="group"
//   aria-label={t('techBarLabel')} className="flex flex-wrap gap-2">
// Renders FilterChip per visible tech + TechDropdown when remaining.length > 0

// components/projects/TechDropdown.tsx
interface TechDropdownProps {
  remainingTechs: string[];      // non-visible techs (already sorted localeCompare)
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
}
// Owns: popover open state, typeahead query, active-descendant id.
// Trigger: <button aria-haspopup="listbox" aria-expanded aria-controls={listboxId}>
//   {t('techMore', { count: remainingTechs.length })} + ChevronDown
// Content: input (aria-label={t('techSearchPlaceholder')}, placeholder same key)
//   + <ul role="listbox" aria-multiselectable="true" aria-activedescendant={activeId}>
//   + <li role="option" aria-selected id={optionId(tech)} className="min-h-11 ...">
//   + no-match → <p>{t('techNoResults')}</p>
```

`ProjectsClient` keeps: `searchQuery`/`debouncedSearchQuery`, `selectedTechs`, `selectedSource` (type now imported from `SourceSegmentedControl`), `updateURL`, the debounce `useEffect`, `toggleTech`, `handleSourceChange`, `clearFilters` (minus `setShowFilters`), `hasActiveFilters`, filtered-projects memo, results row, grid, empty state. Deleted: `showFilters`, `activeFiltersCount`, `chipClassName`, the Filter `Button` + `Badge`, the entire `#project-filters` panel, and the `Filter`/`Check` lucide imports (Check moves into `FilterChip`).

## Data Flow

State and URL sync are unchanged; only the render tree changes.

```
useSearchParams ──hydrate──► ProjectsClient state (q / tech[] / source)
                                     │
        ┌──────────────┬─────────────┼──────────────┐
        ▼              ▼             ▼              ▼
   SearchInput   SourceSegmented  TechFilterBar   clearFilters
   (q, debounced) Control(source)  ├─ FilterChip × visible
        │              │           └─ TechDropdown (remaining, typeahead)
        └──────┬───────┴─────────────┘
               ▼  onChange / onToggleTech / onChange
        updateURL → router.replace(pathname?params, { scroll: false })
               ▼
   filteredProjects (useMemo — untouched) → count (aria-live) + badges + grid/empty
```

Dropdown-toggle sequence (focus management):

```
User: Enter on "More" trigger
  → Radix Popover open → onOpenAutoFocus: focus filter input, aria-expanded=true
User: types "ru"
  → local query state → filtered remainingTechs → listbox re-renders, active = first match
User: ArrowDown
  → activeId = next option (aria-activedescendant; focus stays in input)
User: Space
  → onToggleTech(tech) → ProjectsClient state + URL; option aria-selected flips;
    popover STAYS OPEN (multiselect); tech is now pinned → will render in bar on close
User: Esc
  → Radix closes popover → focus returns to trigger, aria-expanded=false
```

## De-gray: Exact Class Changes

| Element | Before | After |
|---|---|---|
| Filter panel container | `p-4 border border-border rounded-lg bg-muted/30` | **deleted** (no panel) |
| Unselected chip | `text-muted-foreground hover:text-foreground` (on `bg-muted/30` panel, `border-input` from `Button variant="outline"`) | `border-border bg-card text-foreground/80 hover:text-foreground hover:border-foreground/30` (on page background) |
| Selected chip | `border-primary/50 bg-primary/10 text-primary hover:bg-primary/15` | unchanged |
| Chip size | `Button size="sm"` (`h-11 px-3`), tech chips + `text-xs` | `min-h-11 min-w-11 px-4 text-sm font-medium` on `FilterChip` (`min-w-11` guarantees the ≥44×44 bounding box for short labels like "Go") |
| Source chips | outline buttons inside panel, `aria-pressed` | segmented control on page background, `role="radio"` (see below) |
| Blog unselected chips | `text-muted-foreground hover:text-foreground` | same `FilterChip` unselected classes (blog panel `bg-muted/30` is out of scope and stays — chip sits on `bg-card`, contrast comes from the chip surface) |

`text-foreground/80` on `bg-card`: both tokens are theme-aware foreground/surface pairs; `/80` opacity foreground on card holds ≥4.5:1 in light and dark themes (verified by the axe contrast e2e — spec scenario).

## SourceSegmentedControl Styling (segmented geometry)

- Wrapper: `role="radiogroup"`, `className="flex w-full sm:w-auto"`.
- Each segment: `FilterChip`-aligned palette but joined: `min-h-11 flex-1 sm:flex-initial px-4`, first `rounded-l-md`, last `rounded-r-md`, middles `rounded-none`, adjacent segments collapse borders via `-ml-px` (except first). Checked segment gets the primary treatment + bare `Check` icon (same `data-testid="filter-check"`).
- Below `sm`: `flex-1` makes the three segments share the full row width equally — all visible, each ≥44px tall, at 320px (spec scenario).

## TechFilterBar: Top-N Computation

```typescript
const TOP_N = 8;
// 1. frequency: Map<string, number> over projects.flatMap(p => p.tech)
// 2. sorted = [...freq].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
// 3. topN = sorted.slice(0, TOP_N).map(([tech]) => tech)
// 4. pinned = selectedTechs.filter(t => !topN.includes(t)).sort((a, b) => a.localeCompare(b))
// 5. visible = [...topN, ...pinned]
// 6. remaining = allDistinctTechs (localeCompare) minus visible
// More label: t('techMore', { count: remaining.length })   // = N_total - V
// More trigger rendered iff remaining.length > 0
```

Hydration edge case: a shared URL with a dropdown-only tech → `selectedTechs` hydrates from `useSearchParams` → pinned union makes it visible on first render (spec round-trip scenario). No extra code needed.

## TechDropdown: Radix Configuration

```tsx
<Popover.Root open={open} onOpenChange={setOpen}>
  <Popover.Trigger asChild>{/* More chip button */}</Popover.Trigger>
  <Popover.Portal>
    <Popover.Content
      side="bottom" align="end" sideOffset={4} collisionPadding={8}
      onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus(); }}
      className="w-72 max-h-80 overflow-y-auto rounded-md border border-border bg-popover p-2 shadow-md z-50"
    >
      {/* filter input + listbox */}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

- `collisionPadding={8}` + Radix's default flipping keeps the popover in-viewport on mobile; `w-72` ≤ 320px viewport width.
- Typeahead: case-insensitive `includes` on `remainingTechs`; query is local state, cleared on close.
- Active descendant: `activeId` state reset to first match on query change; `aria-activedescendant` on the listbox, `id={\`tech-option-${tech}\`}` per option; active option gets a visual `bg-accent` ring (not color-only selection — selection itself is check + `aria-selected`).
- Esc and outside-click: Radix built-ins — close + focus return to trigger. Option toggle deliberately does **not** close (no `Popover.Close` around options).
- Selected-from-dropdown rendering inside the listbox: option shows bare `Check data-testid="filter-check"` when `aria-selected="true"`, same icon as chips.

## Responsive Strategy

| Viewport | Row 1 | Row 2 (tech bar) | Dropdown |
|---|---|---|---|
| `<sm` (<640px) | `flex-col gap-4`: SearchInput full width; segmented control full width below it, 3 equal `flex-1` segments | `flex flex-wrap gap-2`, chips wrap; "More" chip wraps with them | `align="end"`, `w-72`, collision flip keeps in viewport |
| `sm+` | `flex-row`: SearchInput `flex-1`, segmented control intrinsic width, joined segmented look | same wrap | same, anchored to trigger |
| Clear button | stays in row 1 trailing group (rendered iff `hasActiveFilters`), `min-h-11` via `Button size="sm"` | — | — |

## Skeleton Parity (`loading.tsx`)

Exact structural mirror of the new filter region (all decorative, `aria-hidden="true"`, inside the existing single `role="status"` wrapper):

```
<div data-testid="proyectos-loading-filters" data-region="filter" aria-hidden
     className="flex flex-col gap-4">
  <div className="flex flex-col gap-4 sm:flex-row">           {/* row 1 */}
    <Skeleton data-region="search"  className="h-12 min-w-0 flex-1 border border-input bg-background" />
    <Skeleton data-region="control" className="h-11 w-full sm:w-64 rounded-md border border-border" />
  </div>
  <div data-region="tech-bar" className="flex flex-wrap gap-2">  {/* row 2 */}
    <Skeleton className="h-11 w-20 rounded-md" />  ×8
    <Skeleton className="h-11 w-24 rounded-md" />  {/* More trigger */}
  </div>
</div>
```

Changes vs. today: the `control` skeleton changes from `h-12 w-28` (toggle-button shape) to `h-11 w-full sm:w-64` (segmented-control shape), and the `tech-bar` region is new. `data-region` hooks `filter`, `search`, `control` are preserved (existing tests/consumers keep working); `tech-bar` is added. Result-count, hero, and card regions untouched. Parity test asserts the real page exposes matching hooks (`data-region` attributes are added to the live filter markup: `filter` on the filter container, `search` handled by SearchInput region, `control` on the radiogroup, `tech-bar` on the group wrapper).

## i18n Changes (`Projects.*`, both catalogs)

**Added:**

| Key | EN | ES |
|---|---|---|
| `sourceLabel` | "Filter by source" | "Filtrar por fuente" |
| `techBarLabel` | "Filter by technology" | "Filtrar por tecnología" |
| `techMore` | "+{count} more" | "+{count} más" |
| `techMoreAria` | "Show {count} more technologies" | "Mostrar {count} tecnologías más" |
| `techSearchPlaceholder` | "Filter technologies…" | "Filtrar tecnologías…" |
| `techNoResults` | "No technologies match" | "Ninguna tecnología coincide" |

**Removed (verified unused after refactor):** `filters`, `sourceHeading`, `techHeading`, `techHint`. Verified by repo-wide search: all four are referenced only from the deleted `ProjectsClient` panel code (`Blog.filters` is a separate namespace and stays). A messages-usage/parity check runs before deletion per spec; if any reference surfaces, the key is kept.

**Reused unchanged:** `searchPlaceholder`, `searchAria`, `clearSearchAria`, `sourceAll`, `sourceCurated`, `sourceGithub`, `clear`, `clearAll`, `count`, `filteredSuffix`, `searchBadge`, `emptyTitle`, `emptyHint`.

## Testing Strategy

| Layer | File | What it covers |
|---|---|---|
| Integration (Vitest + RTL) | `__tests__/integration/components/ProjectsFilterChips.test.tsx` (**rewritten**) | No toggle/panel in document; chips visible on initial render; `role="checkbox"` + `aria-checked`; bare check only when selected; unselected chip class list has no `text-muted-foreground`; chips carry `min-h-11`/`min-w-11`; clear button gated on `hasActiveFilters` and resets state + URL |
| Integration | `__tests__/integration/components/SourceSegmentedControl.test.tsx` (**new**) | `radiogroup` + localized `aria-label`; exactly 3 `role="radio"`; single-select (`aria-checked` flips); roving tabindex (only checked is tabbable); ArrowRight/Left wrap + focus-follows-selection; Home/End; `source` URL param set/omitted-for-`all` |
| Integration | `__tests__/integration/components/TechFilterBar.test.tsx` (**new**) | Fixture with >8 techs: exactly top 8 by frequency, deterministic order (freq desc → `localeCompare`), stable re-render; selected-non-top-8 tech pinned visible; More count = `N - V`; no More trigger when ≤8 techs |
| Integration | `__tests__/integration/components/TechDropdown.test.tsx` (**new**) | Open via keyboard/click → `aria-expanded`, focus in filter input; typeahead filters options; no-match → localized `techNoResults`; Enter/Space toggles `aria-selected` + `tech` URL param, popover stays open; Esc closes + focus returns to trigger; selected tech appears pinned in bar after close |
| Integration | `__tests__/integration/components/BlogFilterChips.test.tsx` (**updated**) | Blog chips now expose `role="checkbox"`/`aria-checked` + bare check via shared `FilterChip`; category/search/clear behavior unchanged |
| Integration | loading skeleton test (extend existing skeleton parity tests) | `data-region` hooks `filter`/`search`/`control`/`tech-bar` present; single `role="status"`; descendants `aria-hidden` and non-focusable; no toggle-shaped placeholder |
| Integration | messages parity test (existing convention) | New keys exist in both catalogs, non-empty, `{count}` interpolates; pruned keys unreferenced |
| E2E (Playwright + axe) | `e2e/tests/proyectos-filters.spec.ts` (**new**) | Full flow: search → source → bar chip → dropdown chip → clear; filtered counts + URL round-trip (refresh restores state incl. dropdown-only tech pinned); axe scan of filter region both themes (no contrast violations); bounding-box check ≥44×44 for chips/segments/options; skeleton `data-region` parity vs. live page; 320px viewport: all segments visible |
| E2E | `e2e/tests/accessibility-interactions.spec.ts` (**updated**) | Replace any toggle-panel interactions with always-visible flow |

## Migration / Rollout

No migration required. No feature flag — the change is atomic per page. Rollout = single PR (optionally chained: PR1 = FilterChip + SourceSegmentedControl + TechFilterBar/Dropdown + ProjectsClient, PR2 = skeleton + blog parity + tests) within the 800-line review budget.

## Rollback Plan

Fully revertible via `git revert` of the PR (or each chained PR independently, PR2 first). All new UI lives in four new files; `ProjectsClient.tsx`, `loading.tsx`, `BlogFilters.tsx`, and message catalogs are restored by the revert. `@radix-ui/react-popover` can remain installed harmlessly or be dropped in the same revert. No data-model, API, ISR, or URL-contract changes — old and new URLs (`q`/`tech`/`source`) are interpreted identically by both versions, so a rollback never strands a shared link. Zero production-data risk.

## Changed-Line Estimate

| File | +/- (est.) |
|---|---|
| `components/ui/FilterChip.tsx` (new) | +60 |
| `components/projects/SourceSegmentedControl.tsx` (new) | +115 |
| `components/projects/TechFilterBar.tsx` (new) | +90 |
| `components/projects/TechDropdown.tsx` (new) | +160 |
| `components/projects/ProjectsClient.tsx` | −130 / +45 |
| `components/blog/BlogFilters.tsx` | −25 / +20 |
| `app/[locale]/(pages)/proyectos/loading.tsx` | −10 / +25 |
| `messages/en.json` + `messages/es.json` | −8 / +12 |
| `package.json` (+ lockfile) | +2 |
| Integration tests (1 rewritten, 3 new, 2 updated) | +420 / −80 |
| E2E (1 new, 1 updated) | +140 / −20 |
| **Total changed lines** | **≈ 950 raw / ≈ 640 net non-test** |

Raw estimate slightly exceeds the 800-line review budget **if tests count toward it**; mitigation: ship as a 2-PR chain (UI + behavior tests first, skeleton/blog/e2e second) so each PR stays well under budget. Production (non-test) code is ~490 changed lines.

## Open Questions

- [ ] Does the 800-line review budget count test files? (Determines single-PR vs. 2-PR chain — flagged above either way.)
- [ ] `techMore` visible label "+8 more" vs. icon-only + aria-label — design keeps the localized text label per proposal; confirm no visual-design objection.
