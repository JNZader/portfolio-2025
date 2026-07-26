# Design: Fix Confirmed Accessibility Follow-ups

## Technical Approach

Make three isolated fixes in the existing React 19/Next.js 16 boundaries. `SkipLinks`
uses `useTranslations('SkipLinks')` while retaining its typed target list. `MobileMenu`
keeps native `<dialog>` and `aria-labelledby="mobile-menu-title"`, replacing only the
label `h2` with an `sr-only` non-heading. `SkillBadge` keeps its public API and uses
existing semantic Tailwind tokens whose browser-computed colors pass the contrast gate.
No new package, route, client boundary, global token, footer change, or blog/Sanity
configuration change is permitted.

The authoritative delta is
`openspec/changes/fix-accessibility-followups/specs/ui/spec.md`; the canonical UI
spec is `openspec/specs/ui/spec.md`. The expected delta artifact already exists at
the former path; no separate root-level `spec.md` is created.

## Architecture Decisions

| Decision | Choice | Rationale / rejected alternative |
|---|---|---|
| Skip-link copy | Parallel `SkipLinks` keys in both catalogs; client lookup in the existing provider | Avoids prop plumbing and locale branching; targets remain unchanged. |
| Dialog semantics | Non-heading labelled node; native lifecycle remains | Preserves accessible name without polluting the page outline; generic `div` dialog and custom trap are out of scope. |
| Dialog focus | Capture the opener when opening; focus the dialog close button after `showModal()`. On close or Escape, restore the captured opener. Navigation closes the dialog and the destination `main#main-content` is the asserted focus target after route completion. | Defines one deterministic target instead of relying on browser-dependent native restoration. No `MobileMenuButton` API change is needed. |
| Badge contrast | Choose existing semantic classes only after measurement; preserve hover transform and icon color independently | Avoids global-token blast radius, arbitrary colors, and treating icon color as text contrast. |

## Data Flow and Contracts

`[locale]/layout.tsx:61-80` provides messages and renders `SkipLinks`, `Header`,
`main#main-content`, and `Footer`. `MobileMenuButton` retains `aria-expanded` and
`aria-controls`; `MobileMenu` owns dialog refs and focus capture. `SkillBadge`'s
name remains text and its Lucide icon remains decorative.

The focus tests MUST assert: opener focused before open; close button focused after
open; close button click and Escape both close the dialog and focus the original
opener; navigation closes the dialog, reaches the expected locale URL, and focuses
the destination `main#main-content`. The same assertions run at 320px for ES and EN.

Contrast tests MUST use `getComputedStyle` for light and dark themes, both normal and
`:hover` states. The helper first parses CSSOM `rgb()/rgba()` and `oklch()` values;
OKLCH is converted through OKLab to linear/sRGB channels. Alpha is composited over
the actual computed background before relative luminance and `(Lmax+.05)/(Lmin+.05)`.
If CSSOM returns another supported syntax, a hidden probe assigns that value and reads
the browser's canonical computed RGB conversion; unresolved colors fail the test,
never skip it. Every state MUST be at least 4.5:1.

Sanity route tests MUST call the existing preflight before navigation. Missing
variables, failed representative fetches, or a route response proving Sanity is
unavailable are converted to `EnvironmentBlockedStatus` by annotating the test with
`type: 'environment'` and the exact reason; the existing reporter maps that annotation
to `EnvironmentResult.status === 'blocked'`. The route guard MUST return before normal
assertions. Unexpected responses and assertion errors remain ordinary `failed` results.
Reports retain separate passed, failed, skipped, and blocked counts; blocked results
never satisfy coverage. Modify `environment-status.ts` only if the existing typed
factory cannot carry the route/test metadata.

## File Changes

| File | Action |
|---|---|
| `components/a11y/SkipLinks.tsx`, `messages/{es,en}.json` | Localized three-key labels; preserve targets and focus styles. |
| `components/layout/MobileMenu.tsx` | Non-heading label plus deterministic open/close/navigation focus handling. |
| `components/ui/SkillBadge.tsx` | Measured semantic light/dark normal/hover pairing. |
| `__tests__/` existing component/message suites | Key parity, names, dialog outline/focus contract, icon semantics. |
| `e2e/tests/navigation.spec.ts` | ES/EN skip-link names, targets, focus, keyboard activation. |
| `e2e/tests/accessibility-interactions.spec.ts` | 320px dialog role/name, heading order, open/close/Escape/navigation focus. |
| `e2e/tests/accessibility.spec.ts` | Supplemental Axe plus computed badge contrast in both themes/states. |
| `e2e/fixtures/environment-status.ts` | Modify only if route-level typed blocked annotation needs a helper. |

Consumers, layout, footer, blog routes, and Sanity configuration are inspection-only.

## Testing and Rollout

Run `npm run type-check`, `npm run check`, `npm run test:run`, then focused Playwright
tests. Static tests run even when browsers or Sanity are blocked. No migration or
feature flag is required; revert the source/test commits to roll back. Keep the
feature-branch slices within the configured 800-line review budget.

## Open Questions

None. Implementation must record measured ratios and any exact blocked reasons.
