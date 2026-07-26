# Proposal: Clarify Project Conversion

## Intent

Close the conversion gap around the homepage's APiGen highlight and remove ambiguity from the existing “Ver” interaction without adding a second project-content flow. The current decorative `HeroTerminal` demonstrates an interactive project but offers no destination, while the eye icon belongs to the CV split control and can be misread as a project preview. The change will preserve the existing localized project-detail navigation, bilingual ES/EN behavior, accessibility semantics, and deliberate featured-project hierarchy.

This proposal uses the repository audit and review transcript as external UX evidence. The transcript is directional evidence from another execution, not proof of the current production dataset, environment, selectors, or exact markup.

## Scope

### In Scope

- Add a localized, semantic APiGen featured-project CTA in content adjacent to the decorative `aria-hidden` `HeroTerminal`, linking to the existing localized case study (`/proyectos/apigen`).
- Optionally add a secondary, clearly named localized GitHub action for APiGen using the existing repository URL; it MUST remain an explicit external link, not an unlabeled icon-only action.
- Clarify the current CV eye-icon split action as navigation to the CV page (`/cv`), with translated accessible and visible/assistive naming as appropriate. Do not reinterpret it as a project action or modal trigger.
- Retain `ProjectCard`’s existing localized `Ver detalles` / `View details` link to `/proyectos/{id}`. Do not replace it with a modal or rename it as CV navigation.
- Validate representative project data and existing tests before changing card geometry. Make only evidence-driven adjustments to media/content/action sizing or spacing, preserving featured emphasis when it communicates hierarchy.
- Add or update focused unit/integration, accessibility, localization, and Playwright coverage for the selected CTA and clarified navigation. Tests MUST use semantic role/name assertions where browser coverage is appropriate.

### Out of Scope

- A new project preview modal, modal trigger, or duplicate project-detail content path.
- Route-to-anchor redesign, changes to the projects information architecture, or replacement of existing detail routes.
- Blog strategy or single-post behavior changes.
- Footer redesign, contact redesign, CV PDF generation changes, GitHub rate-limit work, or a broad Sanity schema/data-model change.
- Fixing the local Sanity environment or claiming that the externally observed dataset is the current production dataset.
- Replacing generated project visuals with screenshots, flattening all featured hierarchy, or making blanket card-size changes without representative evidence.

## Approach

1. Keep `HeroTerminal` decorative and `aria-hidden`; do not place a focusable descendant inside it. Extend the adjacent semantic caption/content in `components/sections/hero-section.tsx` with localized links to the stable APiGen case-study route and, if retained, the existing GitHub repository. Use the existing localized navigation component for the case-study link and external-link conventions for GitHub.
2. Add the required ES and EN message keys in parallel. The APiGen destination is an explicit stable route key, not a URL derived from display text. Accessible names for both internal and external actions must be translated.
3. Update `CVButton` copy, accessible names, and/or supporting affordance only as needed to make the eye segment clearly mean “view CV.” Preserve the split download/navigation behavior and the existing `/cv` route. Keep current CV assertions in both locales as regression coverage.
4. Preserve the project-card detail anchor and its current stacking model: the title’s full-card pseudo-element and bottom action row must not create nested interactive elements. First compare representative local/Sanity-shaped project data and rendered test fixtures. If the extra label/content causes an avoidable height outlier, adjust shared geometry or localized content only with a focused regression test; retain the featured badge/emphasis unless evidence shows the emphasis itself is the defect.
5. Verify keyboard order, focus-visible states, reduced-motion behavior, responsive reflow/zoom, link destinations, external-link naming, and ES/EN rendering. Treat the missing Sanity variables and unavailable browser binaries as validation limitations, not as reasons to broaden this change.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/sections/hero-section.tsx` | Modified | Add adjacent semantic APiGen CTA content without changing `HeroTerminal`’s decorative boundary. |
| `app/[locale]/page.tsx` | Possibly modified | Pass explicit localized featured-project CTA data only if the existing hero API requires it; avoid a new CMS contract. |
| `components/sections/HeroTerminal.tsx` | Verify only / possibly unchanged | Preserve `aria-hidden`, replay, and reduced-motion behavior; no interactive descendants. |
| `components/ui/CVButton.tsx` | Modified | Clarify the eye segment as CV navigation while retaining the download/view split. |
| `components/projects/ProjectCard.tsx` | Modified only if evidence supports it | Retain the detail route and apply narrowly scoped, shared geometry fixes if representative data/tests justify them. |
| `messages/es.json`, `messages/en.json` | Modified | Add parallel localized CTA and accessible-label keys; no hardcoded new user-facing copy. |
| `__tests__/integration/**`, `__tests__/unit/**`, `e2e/tests/**` | Modified | Cover destinations, bilingual names, accessibility semantics, and any evidence-driven card geometry change. |

Relevant current references include `hero-section.tsx:183-195`, `CVButton.tsx:24-95`, `ProjectCard.tsx:100-227`, the APiGen case study in `lib/data/case-studies/apigen.ts:4-29`, and the localized detail route in `app/[locale]/(pages)/proyectos/[id]/page.tsx:147-235`.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| A CTA is accidentally placed inside the `aria-hidden` terminal or card overlay | Medium | Render actions in adjacent semantic content; preserve the card `z-10` action row; test keyboard and role semantics. |
| The external review reflects a different deployment or dataset | High | Use the audit/transcript only as UX evidence; validate against representative fixtures/data and document Sanity limitations. |
| “Ver” remains ambiguous across CV and project surfaces | Medium | Name the CV eye action as CV navigation and retain the distinct localized project-detail label. Test both surfaces independently. |
| Localization or locale-aware routing drifts | Medium | Add ES/EN keys together and assert `/proyectos/apigen` resolves through the existing locale-aware navigation. |
| Card normalization erases intentional featured hierarchy or fixes the wrong cause | Medium | Make geometry changes conditional on representative evidence and retain the featured badge/emphasis by default. |
| Scope expands into a modal or broader redesign | Low | Treat modal, anchors, blog, footer, Sanity environment, and data-model work as explicit exclusions. |

## Rollback Plan

Revert the proposal’s implementation commit(s) as a unit. The rollback removes the adjacent APiGen CTA and any copy/test changes, restores the prior CV labels if changed, and restores the prior card geometry if an evidence-driven adjustment regresses layout. No database migration, Sanity schema change, route removal, or persisted content migration is planned, so rollback does not require data repair.

## Dependencies

- Existing localized navigation and `/proyectos/apigen` case-study resolution.
- Existing APiGen repository URL in `lib/data/case-studies/apigen.ts` if the optional GitHub action is included.
- Existing ES/EN message namespaces and test infrastructure (`Vitest`, Testing Library, Playwright, axe-core).
- Representative project fixtures or a configured Sanity environment for card-geometry validation; missing local Sanity variables MUST be reported as a limitation rather than fixed in this change.

## Success Criteria

- [ ] In both ES and EN, the APiGen highlight has a semantic, keyboard-accessible CTA adjacent to (not inside) the decorative `aria-hidden` terminal, and the CTA reaches the existing localized case study.
- [ ] If included, the GitHub action is visibly/assistively named as GitHub/source-code navigation and opens with the existing safe external-link behavior.
- [ ] The CV eye segment is clearly announced as CV-page navigation in both locales and continues to link to `/cv`; no modal is introduced.
- [ ] Project cards retain their existing localized detail link and route; any geometry change is backed by representative data/tests and does not remove intentional featured emphasis.
- [ ] Focus order, target sizing, responsive reflow, reduced motion, and accessibility checks remain valid; no focusable content is hidden by `aria-hidden`.
- [ ] `npm run test:run`, `npm run type-check`, and `npm run check` pass, subject to documenting any pre-existing warnings or environment-limited browser/Sanity checks.
- [ ] The implementation remains within the configured 800 changed-line review budget and does not include the explicitly excluded modal, anchor, blog, footer, or Sanity-environment work.
