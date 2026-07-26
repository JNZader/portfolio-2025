# Exploration: Footer layout and alignment cleanup

## Status

**Ready for proposal.** This was a fresh, read-only investigation. No application code, tests, configuration, or existing specifications were modified.

## Executive summary

The footer is functionally complete, but its desktop alignment intentionally mixes left, center, and right text alignment across three equal grid columns. This reproduces the reviewer concern that the footer feels visually centered/fragmented rather than using one controlled alignment system. At 1440px the live app confirms three 384px columns at x=112, 528, and 944; the first is left-aligned, the second centered, and the third right-aligned. At mobile all three columns become left-aligned, so the responsive transition is also inconsistent.

This is a **P3 visual consistency/scanability issue**, not a conversion or accessibility blocker. It should be a separate, small SDD change from the confirmed accessibility fixes because the acceptance criteria and visual regression surface differ.

## Current state

- `components/layout/Footer.tsx:25-99` uses a three-column `md:grid-cols-3` layout.
- The brand column is left-aligned (`:30`), the navigation column uses `md:text-center` (`:65`), and services uses `md:text-right` (`:82`).
- The bottom bar uses `justify-between` at desktop and `justify-center` for its link group (`:103-127`), creating a second alignment model.
- `components/ui/Container.tsx:9-10` provides the shared `max-w-7xl`/responsive horizontal padding; no new container abstraction is indicated.
- Live verification at `http://localhost:3001/` and `/en/` returned 200. At 1440px the measured column boxes were x=112/528/944 with width 384 each. At 320px every footer column was x=16 and width 288, with left text alignment.
- The existing visual audit records the same reviewer recommendation: avoid centered footer text and use more controlled width/alignment (`docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md:190-201`).

## Affected areas

- `components/layout/Footer.tsx:25-129` — likely sole implementation surface for column and bottom-bar alignment.
- `e2e/tests/navigation.spec.ts:133-147` — existing footer-link smoke coverage; can host focused structural/alignment assertions if the project wants a browser invariant.
- `e2e/tests/visual.spec.ts` and its snapshots — possible visual regression coverage, but snapshots are platform-specific and should not be the only acceptance gate.
- `components/ui/Container.tsx:9-10` — inspect only; no change currently justified.

## Scope boundary

In scope: consistent footer alignment, controlled readable measure, responsive wrapping, preserved link names/hrefs, touch targets, and light/dark rendering.

Out of scope: footer copy/content strategy, navigation information architecture, newsletter behavior, global typography, unrelated header/interior-page alignment, and blog changes.

## Approaches

1. **Single left-aligned grid system (recommended)** — keep the three-column structure and align all columns to the shared container edge; use spacing/measure constraints rather than center/right text alignment.
   - Pros: smallest diff, predictable scan path, preserves content and responsive structure.
   - Cons: loses the intentional symmetric desktop composition; long service labels need wrapping checks.
   - Effort: Low.

2. **Asymmetric content-width grid** — retain a stronger brand column and allocate narrower navigation/services columns with explicit column widths and left alignment.
   - Pros: better horizontal use and clearer reading measure without a centered middle column.
   - Cons: more responsive tuning and higher visual regression risk; may overfit one viewport.
   - Effort: Medium.

3. **Keep current alignment and only tune the bottom bar** — change the lower row while preserving left/center/right columns.
   - Pros: smallest visual change.
   - Cons: does not address the main mixed-alignment concern confirmed in the live DOM.
   - Effort: Low; not recommended.

## Recommendation

Create a separate change named `cleanup-footer-layout` and prefer Approach 1 unless a screenshot review demonstrates that the footer needs an asymmetric measure. Define acceptance around alignment invariants at desktop and mobile rather than a pixel-perfect screenshot. Preserve all existing localized labels, routes, external-link behavior, and 44px interactive targets.

## Suggested tests

- Playwright at 320px and 1440px for `/` and `/en/`: footer remains within the viewport, columns do not overlap, and all footer links remain visible and reachable.
- Assert preserved semantic links by role/name and existing privacy/GDPR destinations.
- If alignment is contractual, inspect computed bounding boxes/text alignment at stable breakpoints; do not select by styling classes.
- Run `npm run type-check`, `npm run check`, focused Playwright tests, and the existing visual suite as available. Treat missing Firefox/WebKit executables as blocked, per repository reporting conventions.

## Risks

- A global left-alignment decision may reduce the deliberate desktop visual hierarchy; validate at 1440px and a narrow desktop width.
- Changing widths or gaps can expose long localized labels, especially Spanish footer copy, at 320px.
- Snapshot churn may be platform-specific; semantic geometry assertions should carry the core contract.

## Artifacts

- `openspec/changes/cleanup-footer-layout/exploration.md`
- Engram artifact: `sdd/cleanup-footer-layout/explore`

## Next recommended

Proceed to proposal for `cleanup-footer-layout` as an independent low-risk visual change. Do not bundle it with the accessibility fixes unless review capacity requires one PR and the proposal explicitly keeps the two acceptance contracts separate.

## Ready for proposal

**Yes.** The issue is reproducible in current code and runtime, the likely implementation surface is narrow, and the main decision is alignment policy rather than missing requirements.
