# Design: Clean Up Footer Layout Alignment

## Technical Approach

Keep `Footer` a React 19/Next.js server component with its existing DOM order,
translations, links, icons, themes, `Container`, and newsletter behavior. Make
the smallest Tailwind-only change in `components/layout/Footer.tsx`: remove
desktop center/right text alignment, preserve stacked mobile layout, and add
only wrapping-safe utilities or test hooks. Do not touch blog files, copy,
destinations, information architecture, or `Container`.

## Architecture Decisions

| Decision | Alternatives | Rationale |
|---|---|---|
| Retain `grid grid-cols-1 md:grid-cols-3 gap-8`. | New footer abstraction or asymmetric grid. | Preserves order, responsive stacking, and rollback scope. |
| Define alignment per desktop track: each column’s content starts at the start edge of its own grid track. | Assert every column shares one x-coordinate. | A grid’s tracks are distinct; this removes competing text alignment without falsely requiring coincident columns. |
| Align the bottom bar to the shared `Container` content edge. | Align it to a column or use distributed justification. | Gives the footer one outer edge while keeping primary tracks independent. |
| Use semantic `data-footer-*` hooks and measured geometry. | Tailwind-class or pixel snapshot assertions. | Stable tests without coupling acceptance to implementation classes or platform rendering. |

## DOM/Class Boundaries

Add `data-footer-grid="primary"`, `data-footer-column="brand|navigation|services"`,
`data-footer-bottom-bar`, and `data-footer-bottom-group="copyright|legal"` to
the existing direct regions. Remove `md:text-center`, `md:text-right`, and
distributed bottom-bar alignment; retain responsive stacking and wrapping.
`min-w-0` may be added to grid tracks when required by localized wrapping.

Every rendered text or icon link/CTA—including JZ, GitHub, LinkedIn, contact,
navigation, privacy/GDPR, and any existing newsletter link—MUST expose a
rendered target of at least `44px × 44px`; visible text may use padding to meet
the target, while icon links retain their `size-11` box. The newsletter form
and its submit/activation behavior remain unchanged; no newsletter link or copy
is introduced merely for this layout change.

## Data Flow

`Footer()` → `getTranslations()`/`MAIN_NAVIGATION` → existing semantic links and
text → shared `Container` → Tailwind grid/flex geometry → Playwright assertions.

## File Changes

| File | Action | Description |
|---|---|---|
| `components/layout/Footer.tsx` | Modify | Alignment, safe wrapping, and stable region hooks only. |
| `e2e/tests/navigation.spec.ts` | Modify | Footer matrix, semantics, target, keyboard, and geometry checks. |
| `e2e/tests/newsletter.spec.ts` | Inspect/extend only if needed | Prove existing newsletter behavior remains unchanged. |
| `components/ui/Container.tsx` | Inspect only | Reuse unchanged. |

## Testing Strategy

Run the deterministic matrix `/` (ES) and `/en/` (EN) × light/dark ×
`320×720`, `390×844`, `768×900` (narrow desktop), and `1440×900` (16 cases).
At each case, assert horizontal containment, visible content reachability, and
that each column’s start edge is aligned to its own grid track; assert the
bottom bar start edge equals the shared `Container` edge. Non-overlap applies
only to disjoint top-level regions (primary grid tracks and bottom-bar groups);
nested text/link boxes are not compared as siblings. Check every link/CTA has a
non-zero `44×44` target, expected `href` and `target`/`rel` for external links,
keyboard Tab focus, and Enter/Space activation. Verify localized names and
privacy, data-request, contact, GitHub, LinkedIn, navigation, JZ, and existing
newsletter form behavior. Do not change theme behavior; snapshots are
supplementary.

Verification commands must follow `openspec/config.yaml`: `npm run test:run`
(configured test command), `npm run build` (configured build command), and
`npm run test:coverage` against the configured 35% threshold, plus the
proposal’s `npm run type-check` and `npm run check`. Build or coverage that
cannot run because of a documented environment prerequisite is `blocked` with
the exact reason, never counted as pass or silently skipped.

## Migration / Rollout

No migration, flag, package, route, translation, data, or blog change. Revert
the footer and focused-test work unit to roll back.

## Open Questions

None.
