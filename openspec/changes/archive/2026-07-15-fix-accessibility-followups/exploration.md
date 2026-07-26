# Exploration: Confirmed accessibility follow-ups

## Status

**Ready for proposal.** This was a fresh, read-only investigation. No application code, tests, configuration, or existing specifications were modified.

## Executive summary

Three accessibility findings remain confirmed in the current checkout and should be handled as one focused change named `fix-accessibility-followups`:

1. `SkipLinks` hard-codes Spanish labels, so `/en/` exposes Spanish skip-link names.
2. When the mobile dialog opens, its `h2` appears before the page `h1` in document order (`h2 Navigation menu` → `h1 Javier Zader`), producing an invalid heading sequence for the visible page context.
3. `SkillBadge` uses `text-primary` on `bg-primary/10`; the prior fresh audit measured 4.49:1 for the 12px badge text across 21 nodes, just below WCAG AA's 4.5:1 threshold. The current live DOM still uses the same classes.

The blog loading experience was inspected only. It remains intentionally out of scope: `/es/blog` and `/en/blog` currently return 500 locally because Sanity variables are absent, and the audit's single-post skeleton concern is a content/readiness question. Do not change blog visibility, content strategy, or loading design in this accessibility change.

## Current state and evidence

### English skip links — P2, high confidence

- `components/a11y/SkipLinks.tsx:5-9` defines all three labels as Spanish literals.
- `app/[locale]/layout.tsx:74-80` renders the component for both locales.
- Live `http://localhost:3001/en/` returned 200 but its extracted text included `Saltar al contenido principal`, `Saltar a navegación`, and `Saltar al pie de página`.
- A live role query found zero links matching `/skip to/i` on `/en/`.
- The fix should use the existing locale/message system rather than branching on hard-coded pathname text.

### Mobile-menu heading order — P2, high confidence

- `components/layout/MobileMenu.tsx:46-50` labels the dialog with `aria-labelledby="mobile-menu-title"`.
- `components/layout/MobileMenu.tsx:64-72` renders `h2#mobile-menu-title` inside the header dialog.
- On `/en/` at 320px, after opening the menu, the visible heading sequence begins `H2 Navigation menu`, then `H1 Javier Zader`, then the page headings. This is caused by the menu being mounted from `Header` before `main` in `app/[locale]/layout.tsx:76-79`.
- The safest direction is to preserve the dialog's accessible name while removing the heading-level contribution from the global page outline (for example, a non-heading labelled element or an explicit dialog label strategy). The implementation must be validated with keyboard focus and a screen-reader-oriented accessibility scan.

### Skill-badge contrast — P2, high confidence

- `components/ui/SkillBadge.tsx:25-35` applies `bg-primary/10` and `text-primary` to 12px text, with optional icon colors.
- `app/[locale]/(pages)/sobre-mi/page.tsx:90-103` renders the badge lists; the same shared component is also used from the homepage skills sections.
- Live computed styles on the homepage confirm the production classes remain `bg-primary/10 ... text-primary`.
- The prior fresh audit measured 4.49:1 on 21 About-page badge nodes. This is a narrow but real AA failure for normal/small text; Axe did not reproduce it in this environment because its color-contrast evaluation did not flag the current OKLCH/alpha combination, so retain the measured audit as evidence and add a deterministic regression check.

## Affected areas

- `components/a11y/SkipLinks.tsx:5-31` — localized labels and accessible focus behavior.
- `messages/es.json` and `messages/en.json` — new/relocated skip-link message keys, keeping technical artifacts English and UI copy localized.
- `components/layout/MobileMenu.tsx:46-72` — dialog labelling without adding an out-of-order page heading.
- `components/ui/SkillBadge.tsx:23-35` — contrast-safe foreground/background pairing, including dark mode and optional icon color handling.
- `app/[locale]/(pages)/sobre-mi/page.tsx:90-103` and `app/[locale]/page.tsx:177-183` — affected consumers to verify, not necessarily modify.
- `e2e/tests/navigation.spec.ts:70-100` — current Spanish-only skip-link assertions should gain an English case.
- `e2e/tests/accessibility-interactions.spec.ts:186-211` — existing focused mobile and viewport interaction coverage can host menu assertions.
- `e2e/tests/accessibility.spec.ts:7-53` — existing Axe harness; add explicit `/en/sobre-mi` and opened-mobile-menu coverage if stable.

## Scope boundary

In scope: bilingual skip-link names, heading outline while the mobile dialog is open, contrast-safe skill badges in light/dark themes, and focused regression tests.

Out of scope: general accessibility refactoring, footer alignment, project/blog data or Sanity configuration, content strategy, hiding the blog, changing the blog skeleton's number of cards, and unrelated color-token redesign.

## Approaches

1. **One focused remediation change (recommended)** — fix the three confirmed defects together because they share the accessibility audit/test contract, while keeping each requirement independently testable.
   - Pros: coherent WCAG-focused review, small affected surface, one regression pass across locales/themes/mobile.
   - Cons: three different components require careful test isolation.
   - Effort: Medium.

2. **Split locale/structure and contrast into two changes** — one change for skip links/menu heading semantics, one for visual contrast.
   - Pros: smaller individual diffs and independently reversible visual styling.
   - Cons: duplicates audit setup and delays the simple bilingual fix; no strong dependency boundary exists.
   - Effort: Medium overall; not necessary unless review ownership differs.

## Recommendation

Create one SDD change, `fix-accessibility-followups`, with three requirements and separate scenarios. Use translated message keys for skip-link text. For the menu, preserve the dialog accessible name without exposing an `h2` before the page `h1`. For badges, choose a semantic Tailwind/token pairing and verify actual computed contrast in both themes; do not solve it by removing skill names or relying on icon color. Follow React 19 server/client boundaries and existing Next.js App Router patterns; no manual memoization or new client boundary is indicated.

## Blog skeleton/loading-only observation

- `app/[locale]/(pages)/blog/loading.tsx:4-71` renders five filter skeletons and six post cards, using `bg-[var(--color-gray-300)]`/`bg-[var(--color-muted)]` arbitrary token references.
- `app/[locale]/(pages)/blog/[slug]/loading.tsx:3-51` renders a full article hero/excerpt/content/sidebar skeleton.
- `app/[locale]/(pages)/blog/page.tsx:63-84` depends on parallel Sanity category/post queries. Current `/es/blog` and `/en/blog` requests return 500 because the local environment lacks the required Sanity variables, matching `docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md:27,57-63`.
- The audit/video feedback says the list skeleton feels disproportionate when only one article exists. That is a product/content strategy decision, not a confirmed loading bug in this checkout. Record it as a future observation and leave the skeleton and editorial visibility unchanged until more articles exist or the user requests a content decision.

## Suggested tests

- Playwright: assert Spanish and English skip-link role/name sets and focus/click behavior; do not use CSS selectors for the semantic contract.
- Playwright + Axe: open the mobile menu at 320px and assert no heading-order violation or out-of-order visible heading; verify close/ESC and navigation remain usable.
- Playwright: scan `/sobre-mi` and `/en/sobre-mi` in light and dark mode; add a deterministic contrast assertion for a representative badge or a testable token pairing because Axe currently misses the 4.49:1 case.
- Component/integration tests: verify localized labels, dialog labelling, and badge class/token contract without asserting incidental icon markup.
- Run `npm run type-check`, `npm run check`, `npm run test:run`, and focused Playwright tests. Report missing browsers and missing Sanity data as blocked, not passed.

## Risks

- Replacing the menu `h2` incorrectly could remove the dialog's accessible name or make the menu harder to identify for screen-reader users.
- A global badge color change affects homepage and About consumers, both themes, and optional per-icon colors; verify all combinations.
- Moving skip-link strings into messages can expose missing-key failures in either locale if parity is not tested.
- Blog routes remain locally blocked by Sanity environment, so blog loading visual conclusions must not be generalized to production.

## Artifacts

- `openspec/changes/fix-accessibility-followups/exploration.md`
- Engram artifact: `sdd/fix-accessibility-followups/explore`

## Next recommended

Proceed to proposal for `fix-accessibility-followups`. Keep the blog observation in the proposal's explicit non-goals; do not create a third SDD change for blog loading yet.

## Ready for proposal

**Yes.** All three accessibility issues are confirmed against current code/runtime or prior measured evidence, the affected modules are bounded, and focused regression coverage is available.
