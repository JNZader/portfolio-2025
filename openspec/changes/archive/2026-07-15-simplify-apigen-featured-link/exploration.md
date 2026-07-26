# Exploration: Simplify APiGen Featured Link

## Status

**Ready for proposal.** This is a read-only investigation. No application code, existing tests, archived artifacts, or main specifications were modified.

## Executive summary

The archived `clarify-project-conversion` change added two homepage APiGen actions below the decorative terminal: a case-study link and an optional GitHub link. The follow-up can simplify that contract by removing the `FeaturedProject`/`FeaturedProjectActions` layer and making the existing translated APiGen caption itself one locale-aware semantic link to `/proyectos/apigen`. GitHub remains available on the case-study page through the existing project-detail links.

The recommended interaction is to make the **whole caption** clickable, while preserving the bold APiGen name inside it. This gives users a larger, predictable target and makes the complete explanatory sentence the link's accessible name; clicking either the product name or its explanation has the same unambiguous case-study destination. Making only the name clickable is visually lighter, but makes the action less discoverable and creates a small link target around a word that currently reads as a label.

## Current state

### Homepage implementation

- `app/[locale]/page.tsx:83-108` passes a hard-coded `featuredProject` object with `detailHref: '/proyectos/apigen'` and `githubHref: 'https://github.com/JNZader-Vault/apigen'` into `HeroSection`.
- `components/sections/hero-section.tsx:23-52` requires `HeroSectionProps.featuredProject` and exports `FeaturedProject` with literal APiGen route/repository types.
- `components/sections/hero-section.tsx:54-84` defines `FeaturedProjectActions`. It renders `[data-testid="apigen-featured-actions"]`, a locale-aware `Link` with `[data-testid="apigen-case-study-cta"]`, and an optional `ExternalLink` GitHub button.
- `components/sections/hero-section.tsx:222-235` currently renders `HeroTerminal`, the two action links, and then a text-only caption. The caption uses `t.rich('apigenCaption', { b: ... })`, so the catalog's `<b>` tag currently becomes a styled `<span>` around `apigen`.
- `components/sections/HeroTerminal.tsx:69-101` remains a decorative `aria-hidden="true"` subtree. It has no interactive descendants or `tabindex`; the ref-driven scroll body does not need to change for this follow-up.

### Messages and destination data

- `messages/es.json:75-77` and `messages/en.json:75-77` contain the caption plus the now-redundant `apigenCaseStudy` and `apigenGithub` labels. The existing captions are:
  - ES: `<b>apigen</b> — una herramienta que construí: de un schema SQL a una API Spring Boot completa y corriendo.`
  - EN: `<b>apigen</b> — a tool I built that turns a SQL schema into a complete, running Spring Boot API.`
- `i18n/navigation.ts:1-8` exports the repository's `Link` from `next-intl/navigation`; `i18n/routing.ts:8-14` uses `localePrefix: 'as-needed'`. Therefore `/proyectos/apigen` renders as `/proyectos/apigen` in Spanish and `/en/proyectos/apigen` in English when the caption link is activated.
- `lib/data/case-studies/apigen.ts:4-29` is the canonical local case study (`_id: 'apigen'`, slug `apigen`, `githubUrl` pointing to the APiGen repository).
- `components/projects/ProjectDetail.tsx:107-127,209-237` already exposes the project's GitHub URL as named external links, with `target="_blank"` and `rel="noopener noreferrer"`, when the merged project has a repository. This is the required post-click location for GitHub; no detail-page change is indicated.
- `components/ui/ExternalLink.tsx:17-31` confirms the homepage GitHub action is an external tracked link, but it should no longer be used by the featured caption change.

### Accessible names and styling

- Current homepage accessible names are the exact action labels `Ver caso de estudio de APiGen` / `View APiGen case study` and `Código fuente de APiGen en GitHub` / `View APiGen source on GitHub`. After simplification, the caption link's accessible name will be the complete localized caption, including the APiGen name and explanatory sentence; tests should query the exact rendered caption rather than the removed CTA names.
- `t.rich` is already the correct mechanism for retaining the bold `apigen` fragment. A link can wrap the rich output without changing the message format: `<Link href="/proyectos/apigen" ...>{t.rich(...)}</Link>`.
- Recommended presentation: keep the current caption typography (`mt-3 text-center text-xs text-muted-foreground lg:text-left`) on the paragraph, and apply link-level `text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` (optionally `underline decoration-primary/50 underline-offset-2` if the visual design wants a consistently recognizable link). Preserve the existing bold product-name span (`font-medium text-foreground`). Do not use an icon-only affordance or make the terminal interactive.
- The whole-caption link should use a comfortable inline/block-compatible hit area without causing 320px or 200% reflow overflow. A paragraph containing a link is preferable to turning the entire paragraph into a non-semantic wrapper; the link remains discoverable by `getByRole('link')` and keyboard focus remains outside the hidden terminal.

## Affected areas

- `app/[locale]/page.tsx:83-108` — remove the obsolete `featuredProject` prop from the homepage call site.
- `components/sections/hero-section.tsx:23-98,222-235` — remove `FeaturedProject`, `FeaturedProjectActions`, and their prop; wrap the existing rich caption in the locale-aware `Link` with the stable literal route.
- `messages/es.json:75-77`, `messages/en.json:75-77` — remove only `apigenCaseStudy` and `apigenGithub`; retain the bilingual `apigenCaption` values.
- `__tests__/integration/components/HeroSection.test.tsx:47-90` — replace two action-contract tests with caption-link tests: exact ES/EN rich caption name/text, stable internal href, sibling placement outside `hero-terminal`, no homepage GitHub link, and preservation of the terminal boundary.
- `__tests__/unit/messages/project-conversion.test.ts:5-13` — assert caption parity/content and assert the obsolete homepage action keys are no longer part of the intended contract (without changing unrelated message tests).
- `e2e/tests/accessibility-interactions.spec.ts:6-161` — remove GitHub/action-wrapper assumptions; test the exact localized caption link, focus visibility, keyboard exclusion from the terminal, reduced motion, 320px layout, and 200% reflow using the caption link.
- `e2e/tests/navigation.spec.ts:5-17` — navigate through the caption link and assert the same locale-aware case-study URLs, using the full localized caption as the accessible name.
- `openspec/specs/ui/spec.md:9-65,175-232` — the active main UI spec currently describes the two-action contract and must receive a delta/spec update in the follow-up proposal/spec phase.
- `openspec/changes/archive/2026-07-15-clarify-project-conversion/` — historical archive only. Its files describe the behavior that was implemented at that time and must not be edited; the new change should explicitly supersede the relevant requirements in its own delta and explain that GitHub moves to the detail page rather than disappearing.

## Approaches

### 1. Whole-caption locale-aware link (recommended)

Wrap the existing `t.rich('apigenCaption')` output in the repository `Link` to `/proyectos/apigen`, remove the separate action row, and remove the homepage GitHub contract.

- Pros: one clear conversion path; larger and more forgiving target; the accessible name explains what APiGen does; preserves the existing caption and bold emphasis; lowest structural complexity; GitHub remains discoverable in the case study.
- Cons: the full explanatory sentence receives link styling; a long accessible name must be kept exact in both locale tests; users may expect only the product name to be linked if visual styling is too subtle.
- Effort: Low.

### 2. APiGen-name-only link

Keep the caption sentence as text and render only the rich `b`/APiGen name as the locale-aware link.

- Pros: minimal visual change; the product name is the shortest link label; the sentence remains ordinary descriptive text.
- Cons: small target and lower discoverability; the name alone does not communicate “case study”; screen-reader users receive only `apigen` as the link name; clicking the explanation is unexpectedly inert; requires more careful focus/hover treatment to make the action apparent.
- Effort: Low.

### 3. Keep a visually linked caption plus hidden/secondary action

Leave the action row or add an additional accessible-only case-study action while linking the caption.

- Pros: preserves existing test/interaction contracts temporarily.
- Cons: duplicates destinations, contradicts the requested simplification, increases keyboard stops, and keeps the homepage GitHub affordance the user explicitly wants removed.
- Effort: Medium; not recommended.

## Recommendation

Use **Approach 1**. Render one native locale-aware link around the complete translated caption, with the current bold APiGen fragment preserved by `t.rich`. Remove the homepage case-study/GitHub action row and the now-unused `featuredProject` type/prop. Keep `/proyectos/apigen` as an explicit stable route literal rather than deriving it from localized text or CMS data.

The new link's accessible name should be the full locale-specific caption, not the old “View case study” label. The case-study page already owns the repository action, so no `ProjectDetail`, Sanity, route, or GitHub data change is needed. Keep `HeroTerminal` decorative and `aria-hidden`; the new link must remain its semantic sibling.

## Scope boundaries

### In scope

- Replace the two homepage APiGen buttons with one semantic caption link.
- Remove obsolete homepage action messages, featured-project prop/type, wrapper, and test IDs if no other consumer remains.
- Update focused integration, message-parity, and Playwright tests for full-caption accessible names, locale-aware routes, keyboard behavior, reduced motion, and narrow/reflow layouts.
- Update the active UI spec through a new delta; document that repository access is provided by the APiGen case-study page.

### Out of scope

- Editing the archived `clarify-project-conversion` artifacts.
- Changing `HeroTerminal` replay, reduced-motion behavior, `aria-hidden`, or scroll implementation.
- Changing `ProjectDetail`, APiGen case-study content, GitHub URLs, Sanity schemas/data flow, or project routes.
- Adding a modal, a second project-content path, a homepage GitHub fallback, or a new CMS featured-project abstraction.
- Altering CV controls, project-card geometry, blog/footer/contact behavior, or unrelated accessibility failures.
- Fixing missing Sanity credentials or unavailable Playwright browser binaries; preserve the existing blocked-environment reporting contract.

## Risks and validation notes

- A full-caption accessible name is intentionally longer than the removed CTA label; use exact localized strings in role/name assertions and verify it remains readable at 320px and 200% zoom.
- Removing the action wrapper/test IDs requires updating all current E2E selectors; the grep audit found no other application consumers.
- If the link is styled only as muted text, users may not perceive it as interactive. Preserve a clear hover and focus-visible state, and consider a subtle underline rather than relying on color alone.
- Keep the link outside `[data-testid="hero-terminal"]`; the terminal's `aria-hidden` boundary must remain unchanged.
- The archived verification was conditional: Sanity/build and non-Chromium browser environments were blocked, while the changed Chromium contract passed. This follow-up should retain that classification rather than claiming broader coverage.

## Ready for proposal

**Yes.** The proposal should state that the whole localized APiGen caption is the single homepage link to the case study, that GitHub is intentionally available inside the case study, and that the archived change remains immutable historical context. The spec delta should replace the old two-action requirements and update exact accessible-name, route, keyboard, responsive, and regression scenarios.

## Result contract

- `status`: `ready_for_proposal`
- `executive_summary`: Replace homepage APiGen case-study/GitHub buttons with one whole-caption locale-aware link; keep GitHub on the case-study page.
- `artifacts`: `openspec/changes/simplify-apigen-featured-link/exploration.md`; Engram topic `sdd/simplify-apigen-featured-link/explore` under project `portfolio-2025`.
- `next_recommended`: Create the proposal and UI delta spec, explicitly superseding the archived two-action homepage contract without editing the archive.
- `risks`: Long accessible names, subtle link styling, stale action selectors, and environment-limited browser/Sanity verification.
