# Proposal: Proyectos Filters Redesign

## Intent

The `/proyectos` filter UI hides the source facet behind a "Filtros" toggle panel, renders unselected chips as all-gray (`text-muted-foreground` on a muted panel) which reads as disabled/skeleton, and its chips fall below the 44px minimum touch target. Batch 6 (commit `156b736`) already fixed Goncy's core ask (bare check, no circle). This change finishes the job: an always-visible, de-grayed, accessible filter layout with the source facet promoted to a segmented control and techs rendered as a persistent chip bar with overflow into a dropdown.

**User outcome**: a visitor lands on `/proyectos` and immediately sees every available filter dimension (search, source, technologies) without clicking anything, can clearly distinguish selected vs. unselected state at a glance, and every interactive element is comfortably tappable on mobile.

## Scope

### In Scope
- Redesign `components/projects/ProjectsClient.tsx` filter area: remove the "Filtros" toggle button and collapsible panel; filters become always visible.
- Extract a shared `FilterChip` component (`role="checkbox"`, `aria-checked`, bare check indicator, ≥44px target, de-grayed unselected state).
- New `SourceSegmentedControl`: Todos / Curados / GitHub, always visible next to search (single-select, `radiogroup`/`radio` semantics).
- New `TechFilterBar` + `TechDropdown`: top 6–8 techs by project frequency as visible chips + a "More" chip opening an accessible dropdown with the remaining techs (searchable via a filter input inside the dropdown). Techs selected from the dropdown surface as visible chips in the bar.
- De-gray: unselected chips use foreground tones on card/background surface — no `text-muted-foreground` on `bg-muted` panel.
- All interactive chips/controls ≥44px (`min-h-11`).
- Update `app/[locale]/(pages)/proyectos/loading.tsx` skeleton to mirror the new always-visible layout (search + segmented control + chip bar), keeping `data-region` parity conventions.
- i18n: new `Projects.*` keys in `messages/en.json` and `messages/es.json`.
- Tests: integration (Vitest/RTL) + e2e (Playwright/axe) coverage for the new controls.
- Blog parity (low priority, only if natural): reuse the extracted `FilterChip` in `components/blog/BlogFilters.tsx` to remove the duplicated `chipClassName`.

### Out of Scope
- No new facets (stars, language, date), no sort control.
- No changes to data flow (Sanity/GitHub fetch, ISR, dedup, merge).
- No changes to `/proyectos/[id]` detail pages or the home featured rail.
- No changes to filtering semantics: client-side `useMemo` filtering, tech OR semantics, URL params `q`/`tech`/`source`, empty state, results-count live region, active-filter badges, grid behavior, `SearchInput`, `ProjectCard` internals all stay.
- Blog layout/behavior changes beyond the optional shared-chip extraction.

## Approach

### New layout (always visible, no toggle)

```
┌──────────────────────────────────────────────────────────┐
│ [ SearchInput (flex-1)        ] [ Todos|Curados|GitHub ] │  row 1
│ [ Next.js ] [ TypeScript ] [ Go ] [ Rust ] … [ +N more ▾]│  row 2 (tech bar)
│ 12 of 30 projects (filtered)        [badge][badge]       │  row 3 (unchanged)
│ [ project grid — unchanged ]                             │
└──────────────────────────────────────────────────────────┘
```

- **Row 1**: `SearchInput` (unchanged) + `SourceSegmentedControl`. The "Filtros" toggle button, its count badge, and the `showFilters` state are deleted. The "Clear" ghost button stays, rendered when `hasActiveFilters`.
- **Row 2**: `TechFilterBar` — always visible, `flex-wrap gap-2`. Visible techs = top N by frequency across `projects` (N=8, frequency desc then `localeCompare` for a stable order), **plus any selected techs not in the top N** so a selection made from the dropdown never becomes invisible. Trailing "More" chip shows `+{remaining} more` and opens `TechDropdown`.
- **Responsive**: `flex-col` below `sm` — search full width, segmented control full width below it (segments share width equally). Tech bar wraps naturally. Dropdown is anchored to the "More" chip, `w-72` max, `max-h-80` scrollable, positioned to stay in viewport on mobile.

### Component architecture

| Component | Location | Notes |
|---|---|---|
| `FilterChip` | `components/ui/FilterChip.tsx` (new) | Shared toggle chip: `role="checkbox"`, `aria-checked`, bare `Check` icon (`data-testid="filter-check"`), selected = `border-primary/50 bg-primary/10 text-primary`, unselected = `border-border bg-card text-foreground/80 hover:text-foreground hover:border-foreground/30` (de-grayed), `min-h-11 px-4` (44px). Encapsulates the current `chipClassName` logic. |
| `SourceSegmentedControl` | `components/projects/SourceSegmentedControl.tsx` (new) | `role="radiogroup"` with `aria-label`; three options as `role="radio"` + `aria-checked` (single-select → radio semantics, not checkbox). Same visual language as `FilterChip`; ≥44px; joined segmented styling (`rounded-none` middles, borders collapsed) on `sm+`, equal-width stacked/wrapped on mobile. |
| `TechFilterBar` | `components/projects/TechFilterBar.tsx` (new) | Computes top-N by frequency, renders `FilterChip`s + "More" trigger; owns dropdown open state. |
| `TechDropdown` | `components/projects/TechDropdown.tsx` (new) | Popover built on `@radix-ui/react-popover` (new dep — project already uses Radix slot/visually-hidden). Contains a filter input (typeahead search of remaining techs) + `role="listbox"` with `aria-multiselectable="true"`, options `role="option"` + `aria-selected`. |

`ProjectsClient.tsx` shrinks to: state + URL sync + composition of `SearchInput`, `SourceSegmentedControl`, `TechFilterBar`, results row, grid, empty state. Filtering `useMemo`, `updateURL`, debounce wiring, `clearFilters` (minus `setShowFilters`) unchanged.

### URL persistence

Unchanged contract: `q` (debounced via `SearchInput`), `tech` (comma-joined, OR), `source` (omitted when `all`); `router.replace(…, { scroll: false })`. Initial state still hydrates from `useSearchParams`, so shared/refreshed URLs restore the full filter state — including techs that live only in the dropdown (they surface as visible chips, see above).

### Accessibility

- Tech chips: `role="checkbox"`, `aria-checked`, keyboard `Enter`/`Space` toggle (native `<button>` behavior), visible focus ring (`focus-visible:ring`).
- Source control: `role="radiogroup"` + `role="radio"`, arrow-key navigation between segments (roving tabindex), `aria-checked` on the active segment.
- Dropdown: trigger has `aria-haspopup="listbox"` + `aria-expanded`; on open, focus moves to the filter input; listbox options navigable with `↑`/`↓`, toggled with `Enter`/`Space`; `Esc` closes and returns focus to the trigger; Radix popover handles outside-click/focus containment. Selected options keep the bare check indicator.
- All targets ≥44px; selection never communicated by color alone (check icon + `aria-checked`).
- Existing `aria-live="polite"` results count and active-filter badges untouched.

### i18n key additions (`Projects.*`, both `en`/`es`)

| Key | EN | ES |
|---|---|---|
| `sourceLabel` | "Filter by source" | "Filtrar por fuente" |
| `techBarLabel` | "Filter by technology" | "Filtrar por tecnología" |
| `techMore` | "+{count} more" | "+{count} más" |
| `techMoreAria` | "Show {count} more technologies" | "Mostrar {count} tecnologías más" |
| `techSearchPlaceholder` | "Filter technologies…" | "Filtrar tecnologías…" |
| `techNoResults` | "No technologies match" | "Ninguna tecnología coincide" |

Existing keys reused: `sourceAll`, `sourceCurated`, `sourceGithub`, `count`, `filteredSuffix`, `searchBadge`, `clear`, `clearAll`, `empty*`. Candidates for removal if unused after redesign: `filters`, `sourceHeading`, `techHeading`, `techHint` (verify with a messages-usage test before deleting; keep if blog or tests still reference).

### Test strategy

**Integration (Vitest + Testing Library)** — update/extend `__tests__/integration/components/ProjectsFilterChips.test.tsx` and add sibling files:
- Chips expose `role="checkbox"` + correct `aria-checked`; check icon only on selected.
- Unselected chip classes contain no `text-muted-foreground`; all chips have `min-h-11` (44px) class.
- Source segmented control: `radiogroup`/`radio` semantics, single-select behavior, arrow-key navigation, URL `source` param sync.
- Tech bar: top-N by frequency rendered, selected-but-not-top-N techs visible, "More" count correct.
- Dropdown: opens via keyboard, typeahead filters options, `aria-selected` toggling, `Esc` closes and returns focus, selection syncs `tech` URL param.
- `clearFilters` resets all state + URL.

**E2E (Playwright + axe)** — extend `e2e/tests/accessibility-interactions.spec.ts` (and/or a new `proyectos-filters.spec.ts`):
- Full flow: search → select source → toggle tech from bar → toggle tech from dropdown → clear; assert filtered counts and URL params.
- axe scan of the new filter region (no violations).
- Touch-target check: all chips/segments/dropdown options ≥44px bounding box.
- Skeleton parity: `loading.tsx` filter region exposes the same `data-region` structure (search, source control, tech bar) as the real layout.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/projects/ProjectsClient.tsx` | Modified | Remove toggle/panel; compose new controls; keep filtering/URL logic |
| `components/ui/FilterChip.tsx` | New | Shared accessible toggle chip (de-grayed, ≥44px) |
| `components/projects/SourceSegmentedControl.tsx` | New | Promoted source facet, radiogroup semantics |
| `components/projects/TechFilterBar.tsx` | New | Top-N chip bar + overflow trigger |
| `components/projects/TechDropdown.tsx` | New | Searchable listbox popover for remaining techs |
| `components/blog/BlogFilters.tsx` | Modified (optional) | Adopt shared `FilterChip`, drop duplicated `chipClassName` |
| `app/[locale]/(pages)/proyectos/loading.tsx` | Modified | Skeleton mirrors always-visible filter layout |
| `messages/en.json`, `messages/es.json` | Modified | New `Projects.*` keys; prune unused ones |
| `package.json` | Modified | Add `@radix-ui/react-popover` |
| `__tests__/integration/components/ProjectsFilterChips.test.tsx` (+ new) | Modified/New | Coverage above |
| `e2e/tests/accessibility-interactions.spec.ts` (+ maybe `proyectos-filters.spec.ts`) | Modified/New | Coverage above |

**Estimated changed lines: ~300–450** (within the 800-line review budget).

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| New dependency (`@radix-ui/react-popover`) — bundle + React 19 compat | Low | Project already ships Radix primitives; popover is small and React 19-compatible. Alternative (hand-rolled popover) is riskier for a11y. |
| Dropdown keyboard/focus bugs (focus trap, typeahead, Esc) | Med | Radix handles containment/outside-click; dedicated integration tests for open/typeahead/toggle/Esc/focus-return; axe e2e scan. |
| Top-N ordering shifts as project data changes (chips "move") | Low | Deterministic order: frequency desc, then `localeCompare`; selected techs always pinned visible regardless of rank. |
| Skeleton drifts from real layout over time | Med | Skeleton parity e2e test asserting `data-region` structure matches. |
| Removing the "Filtros" toggle breaks existing tests/snapshots | Med | Update tests in the same PR; visual snapshots regenerated deliberately. |
| Unused i18n keys left behind or deleted while still referenced | Low | Verify references (incl. blog + messages-usage tests) before pruning. |
| De-grayed unselected chips reduce contrast vs. muted style | Low | Foreground tones on card surface keep ≥4.5:1 text contrast; verify in axe/contrast e2e. |

## Rollback Plan

Single PR (or PR chain) fully revertible via `git revert`. All new UI lives in new component files; `ProjectsClient.tsx`, `loading.tsx`, and message files are restored by the revert. The `@radix-ui/react-popover` dependency can remain harmlessly or be removed in the same revert. No data-model, API, or ISR changes — zero production-data risk.

## Dependencies

- `@radix-ui/react-popover` (new npm dependency).
- No other external prerequisites; builds on the batch-6 chip alignment (`156b736`).

## Success Criteria

- [ ] No "Filtros" toggle: search, source segmented control, and tech chip bar are visible on initial render (desktop + mobile).
- [ ] Source facet selectable without opening any panel; single-select with radiogroup semantics.
- [ ] Top 6–8 techs visible as chips; remaining techs reachable via a searchable, keyboard-navigable dropdown.
- [ ] Unselected chips use foreground tones (no `text-muted-foreground` on muted panel); axe reports no contrast violations.
- [ ] Every interactive chip/segment/option has a ≥44px bounding box (verified in e2e).
- [ ] URL params (`q`/`tech`/`source`) round-trip: refresh/share restores identical filter state, including dropdown-only techs.
- [ ] `loading.tsx` skeleton mirrors the new filter layout; parity test passes.
- [ ] All integration + e2e tests green in both `es` and `en`.
