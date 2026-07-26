# Exploration: Clarify project conversion

## Status

**Ready for proposal, with one scope clarification required.** This is a read-only investigation. No application code, tests, configuration, or existing documentation was modified.

## Executive summary

The proposed conversion improvement is supported by the current code, but the evidence maps to two different UI surfaces:

1. The homepage's featured project is the interactive `HeroTerminal` for APiGen. It currently has a translated caption but no link to `/proyectos/apigen` or GitHub. This is a confirmed conversion discontinuity and the clearest high-value change.
2. The only current eye-icon “Ver” action is the CV split control in `CVButton`, not a project-card action and not a modal trigger. Project cards expose an explicit `Ver detalles`/`View details` link to a project detail route and have no modal. The transcript's ambiguity observation therefore applies directly to the CV control, while the proposed “project-card Ver action/modal” wording does not describe the current implementation. The proposal must decide whether to clarify the CV control, the project-card detail CTA, or both.

The card hierarchy concern is only partially reproducible from the current source. `ProjectCard` uses a shared `h-full` layout, fixed `h-48` media, line-clamped descriptions, and a bottom-aligned action row. Featured state currently adds a badge rather than a larger card. External evidence reports a visually oversized featured card, so the implementation should preserve intentional featured emphasis while verifying the production Sanity data and avoiding a blanket flattening of hierarchy.

## Evidence and applicability

### Current audit

- `V-02` confirms deterministic local ordering and a Sanity/GitHub merge, but the final remote list and badges are not verifiable without Sanity variables (`docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md:27-30`).
- `V-03` confirms the detail route and its final contact/CV conversion CTA by code, while local runtime opening was blocked by missing Sanity configuration (`docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md:29,52-55`).
- `V-04` says local projects have no `mainImage`, so generated `ProjectVisual` fallbacks are expected; production image presence and quality remain unknown (`docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md:30,108`).
- `V-05` confirms project, CV, contact, and detail conversion surfaces exist, but the actual project path was not executable in the local checkout (`docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md:31,65-71`).
- The external run shows 11 projects and confirms the project list exists in another configured environment, but it does not identify the commit, dataset, or exact markup (`docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md:141-170`).

### Current transcript

The relevant feedback is:

- The APiGen highlight is valued because it is interactive rather than a static screenshot, but it should lead to more information, a detail page, or at least GitHub (`/tmp/opencode/portfolio-review-84-90-transcript-medium.txt:12-20`; audit interpretation at `docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md:186-199`).
- “Ver” is interpreted as possibly opening a modal; the reviewer could not identify how to close it and did not understand the eye icon (`...transcript-medium.txt:21-24`).
- Cards are preferred to screenshots, but one card appears much larger than the others (`...transcript-medium.txt:25-30`).

The transcript is useful external UX evidence, not a source of exact selectors or current code behavior. Its audio transcription has medium word-level confidence and the video may represent a different deployment/configuration.

## Current architecture and exact affected areas

### Homepage featured project

- `app/[locale]/page.tsx:82-103` renders `HeroSection`; it passes translated CTAs for projects and contact, but no featured-project link.
- `components/sections/hero-section.tsx:183-195` renders the right-hand `HeroTerminal` and a translated APiGen caption. The caption is text only.
- `components/sections/HeroTerminal.tsx:61-179` is a client component with a replaying terminal. The entire terminal is currently `aria-hidden="true"`; it has no anchor, button, or project identifier prop.
- `messages/es.json:75` and `messages/en.json:75` contain the APiGen caption. `Home` has the homepage CTAs but no dedicated featured-project CTA copy.
- The canonical local APiGen case study is `lib/data/case-studies/apigen.ts:4-29`, with id/slug `apigen`, `featured: true`, and GitHub URL `https://github.com/JNZader-Vault/apigen`.
- The detail route is `app/[locale]/(pages)/proyectos/[id]/page.tsx:147-235`; for the local fallback it resolves `/proyectos/apigen` and renders the detail CTA and repository actions through `components/projects/ProjectDetail.tsx:107-127,242-259`.

Important constraint: adding an interactive control inside the existing `aria-hidden` terminal would be an accessibility error. The likely safe boundary is a visible, translated CTA/caption adjacent to the decorative terminal, or changing the terminal's semantics deliberately and testing its keyboard behavior.

### Project list and card

- `app/[locale]/(pages)/proyectos/page.tsx:32-103` loads Sanity and GitHub in parallel, merges/deduplicates projects, and passes the result to `ProjectsClient`.
- `components/projects/ProjectsClient.tsx:20-121,267-287` owns filtering, URL synchronization, live result count, and the responsive card grid. It passes `priority` to the first three filtered cards, so “featured” and “first in the current filtered result” are separate concepts.
- `components/projects/ProjectCard.tsx:13-16,100-228` is the current card contract. It has a fixed `h-48` visual, `h-full` card, clamped title/description, optional featured/source/private/stars content, explicit detail link, and optional GitHub/demo icon links.
- The card detail action is `t('viewDetails')` at `ProjectCard.tsx:191-197`, currently “Ver detalles” / “View details”; it is a normal localized link to `/proyectos/${project.id}`.
- The card's title link uses a full-card pseudo-element overlay (`ProjectCard.tsx:153-156`), while the bottom actions use `z-10` (`ProjectCard.tsx:191-224`). Any new CTA/modal trigger must preserve this stacking model and must not create nested interactive elements.
- `lib/github/types.ts:55-73` has no explicit slug or case-study URL. The unified `id` is the current route key; Sanity conversion uses `_id` in `lib/utils/project.ts:12-36`, while local case studies use their slug-like `_id`.
- `lib/data/projects.ts:6-58` keeps three local case studies, merges Sanity fields with local body content, and sorts curated projects by `displayOrder`. Local order is Biogas Platform, APiGen, APiGen Studio.

### The “Ver” ambiguity

- `components/ui/CVButton.tsx:24-36,80-95` is the only current eye-icon control. It is a split action: the visible `CV` half downloads a PDF and the eye-only half links to `/cv`; it is server-rendered and localized through `Common.cvDownload` / `Common.cvView`.
- `app/[locale]/page.tsx:88-91` places `CVButton` in the hero, and `e2e/tests/accessibility-interactions.spec.ts:59-66` asserts `Ver CV` / `View CV` in both locales.
- There is a reusable native `Modal` at `components/ui/Modal.tsx:64-213` with a close button, backdrop close, Escape/native close handling, and body-scroll handling. It is covered by `__tests__/integration/components/Modal.test.tsx`, but no project card imports it.
- Therefore, a project-card modal is not an existing behavior to repair. Introducing one would add interaction state and a second content path; linking to the existing detail route is the lower-risk interpretation unless the user explicitly wants a preview modal.

## Localization requirements

- All new visible copy MUST be added in parallel to `messages/es.json` and `messages/en.json`; no hardcoded “Private Case Study” should be copied into new card UI (`ProjectCard.tsx:161-164` is an existing localization gap to decide whether to include in this change).
- Existing project detail paths are locale-aware through `@/i18n/navigation` and `localePrefix: 'as-needed'` (`i18n/routing.ts:8-15`): Spanish remains prefixless and English uses `/en/*`.
- New accessible names must be translated, including CTA labels, external-link labels, modal titles/descriptions, and close instructions.
- If the featured CTA uses a data-provided project rather than the fixed APiGen case study, the data contract must expose a stable route key/URL; do not derive a route from a display title.

## Accessibility and interaction requirements

- Keep project detail and external links as semantic anchors with `getByRole('link')`-compatible accessible names. External links already use `target="_blank"` and `rel="noopener noreferrer"` (`ProjectCard.tsx:200-221`, `ProjectDetail.tsx:110-124,214-234`).
- Preserve minimum comfortable targets: the shared button icon size is `size-11` (`components/ui/button.tsx:28-34`), and existing card tests assert that size (`__tests__/integration/components/ProjectCardVisualUx.test.tsx:29-37`).
- If a modal is selected, it must be keyboard operable, close via an explicit translated close button and Escape, restore focus to the trigger, prevent background interaction, expose `aria-labelledby`/`aria-describedby`, and be tested in both locales. The existing `Modal` covers some of these behaviors, but its current tests do not prove trigger focus restoration or full background inertness.
- Do not place a focusable CTA inside the current `HeroTerminal` without revisiting its `aria-hidden` boundary.
- Any card action must account for the title's absolute overlay, keyboard focus order, reduced motion, zoom/reflow, and external-link naming. Existing `aria-live` filter count and `aria-pressed` filter controls are unrelated but should remain intact.

## Existing tests and likely regression surface

### Unit/integration

- `__tests__/integration/components/ProjectCardVisualUx.test.tsx:29-37` verifies generated visuals and icon-link target sizing; it does not verify featured emphasis, the detail CTA destination, localized card copy, or keyboard order.
- `__tests__/integration/components/Modal.test.tsx:6-168` covers visibility, ARIA attributes, close button/backdrop/Escape, focus-related presence, size classes, and body scroll.
- `__tests__/unit/data/projects-merge.test.ts:27-59` covers local/Sanity field merging and local-only inclusion, but not featured ordering or route identity.
- `vitest.config.ts:7-34` uses happy-dom and currently enforces 35% lines/statements coverage, so component behavior can be covered without a browser when DOM semantics are sufficient.

### End-to-end

- `e2e/tests/project-cards-visual.spec.ts:5-27` checks search target size, repository target size when present, and generated visuals. It assumes `/proyectos` can load with project data.
- `e2e/tests/accessibility-interactions.spec.ts:5-67` checks target sizing, cookie overlap, skip link, mobile navigation, and CV copy in Spanish/English. The CV assertion is the existing regression point for the “Ver” interpretation.
- `e2e/tests/accessibility.spec.ts:7-99` runs axe on home/blog/contact and checks keyboard navigation/images; it does not cover project cards/details because the current local audit could not load Sanity-backed routes.
- `playwright.config.ts:10-121` defines Chromium, Firefox, WebKit, and mobile projects, but the audit reports Firefox/WebKit binaries unavailable in the current environment. New project-flow tests should be runnable against a safe fixture or configured Sanity environment, not depend silently on missing credentials.

## Scope boundaries

### In scope

- Make the APiGen featured terminal's next action unambiguous and connect it to its case study and/or GitHub, preserving the interactive terminal and reduced-motion behavior.
- Resolve the “Ver” terminology/icon ambiguity after explicitly choosing whether the target is `CVButton`, `ProjectCard`’s `viewDetails`, or both.
- Normalize card content/action geometry and emphasis only where current data demonstrates inconsistency, while retaining a deliberate featured badge or other bounded emphasis.
- Add or update localized copy and focused unit/E2E/accessibility coverage for the selected interaction path.

### Out of scope

- Fixing the local Sanity environment or asserting production availability; the missing-env `500` is an audit limitation, not proof of a production incident.
- Redesigning the whole projects information architecture, changing routes to anchors, or changing the blog's one-post strategy. Those are separate transcript recommendations.
- Replacing generated visuals with screenshots/captures without production data validation.
- Reworking the footer, contact page, CV PDF generation, GitHub rate limiting, or Sanity schema unless the selected CTA requires a narrowly scoped data-field change.
- Removing featured emphasis or making all cards visually identical at the cost of scan hierarchy.

## Approaches

### 1. Detail-first CTA (recommended baseline)

Add a localized CTA adjacent to the featured APiGen terminal linking to `/proyectos/apigen`, optionally paired with a clearly labeled GitHub link. Keep the terminal decorative and `aria-hidden`.

- Pros: directly answers the reviewer, reuses the existing case-study route, preserves the current visual asset, low interaction risk, easy to test.
- Cons: APiGen is currently hard-coded in the hero; a future featured-project data model would need a separate evolution.
- Effort: Low/Medium.

### 2. Reusable featured-project data contract

Pass a featured project object or explicit route/repository props into the hero/terminal and render actions from that contract.

- Pros: avoids route/title drift and supports future CMS-driven highlights.
- Cons: requires deciding how Sanity/GitHub data reaches the static home, may add remote failure/caching complexity, and exceeds the evidence needed for this first conversion fix.
- Effort: Medium/High.

### 3. Project preview modal

Add a modal to `ProjectCard` or the featured terminal with summary and links, using the shared native `Modal`.

- Pros: keeps users on the list/home and could make “Ver” explicit with a real close affordance.
- Cons: introduces duplicate detail content, focus/inertness/state complexity, risks nested interactive elements with the current card overlay, and conflicts with the transcript's request for an unambiguous destination unless the trigger is renamed.
- Effort: High.

### 4. Card-only hierarchy normalization

Retain `ProjectCard`’s detail route and adjust only fixed media/content/action geometry after verifying representative Sanity data.

- Pros: small surface area and preserves established navigation/accessibility.
- Cons: cannot explain a mismatch caused by remote content or a different deployment; over-normalization could erase useful featured emphasis.
- Effort: Low/Medium.

## Recommendation

Use Approach 1 plus a narrowly scoped version of Approach 4. First define the featured destination as the existing APiGen case study (`/proyectos/apigen`) and expose GitHub as a secondary, explicitly named external action if desired. Keep the terminal non-interactive/decorative and place the CTA in adjacent semantic content. For cards, preserve `ProjectCard`’s fixed media and flex layout, then verify whether the reported oversized card is caused by Sanity content, a featured-only variant, or a deployment mismatch before changing markup. Do not introduce a modal in this first change unless the requested product decision explicitly changes from “clarify action” to “preview content in place.”

The proposal must explicitly record the “Ver” decision: the current eye control is CV navigation, while the project-card label is “Ver detalles.” A safe first change may clarify both independently, but should not rename one as if it were the other.

## Risks

- **Scope ambiguity:** implementing a project-card modal when the observed eye control is actually `CVButton` could solve the wrong problem.
- **Environment mismatch:** the audit's external 11-project list and the local three-case-study fallback cannot establish identical production markup or card heights.
- **Accessibility regression:** adding a link inside `aria-hidden` `HeroTerminal`, or inside the card's full-card pseudo-link region, can create unreachable or nested interactive content.
- **Route/data drift:** Sanity project `_id`, local case-study IDs, and display titles are not interchangeable; route keys must remain stable.
- **Localization drift:** adding only Spanish or English copy, or retaining hardcoded card labels, will fail the project's bilingual contract.
- **Modal complexity:** a new modal would need focus restoration and background isolation beyond the current shared tests.
- **Review budget:** the 800 changed-line budget is ample for a detail-first CTA plus focused tests, but a reusable CMS contract and modal could consume it without addressing the core conversion issue.

## Ready for proposal

**Yes, after the proposal names the exact “Ver” surface.** The recommended proposal should target the homepage APiGen featured CTA, the chosen CV/card wording surface, and card geometry/tests only. It should carry forward the Sanity-runtime limitation and require representative data validation before changing featured card proportions.

## Result Contract

- `status`: `ready_for_proposal_with_scope_clarification`
- `executive_summary`: The featured APiGen terminal lacks a route/repository CTA; the current eye-icon “Ver” belongs to CVButton rather than ProjectCard; card sizing is structurally normalized in source but remains uncertain with remote data. Recommend a detail-first CTA and evidence-driven card normalization, with no modal by default.
- `artifacts`: `openspec/changes/clarify-project-conversion/exploration.md`; Engram topic `sdd/clarify-project-conversion/explore` under project `portfolio-2025`.
- `next_recommended`: Create a proposal that decides whether “Ver” means CVButton, ProjectCard detail, or both; then specify the APiGen case-study CTA, optional GitHub action, localized labels, accessibility behavior, representative-data validation, and focused regression tests.
- `risks`: Scope ambiguity, Sanity/deployment mismatch, `aria-hidden`/nested-interactive regressions, route-key drift, bilingual copy drift, and modal complexity.
- `skill_resolution`: Resolved generic skills used: `sdd-explore`, `sdd-enhanced`, `react-19`, `nextjs-15`, `tailwind-4`, `typescript`, and `playwright`. No project-specific skill registry exists. Relevant constraints applied: server components by default, no new manual memoization, strict TypeScript, semantic localized links, Tailwind semantic classes, and role-first Playwright selectors.
