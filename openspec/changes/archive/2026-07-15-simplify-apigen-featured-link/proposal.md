# Proposal: Simplify the APiGen Featured Link

## Result Contract

```yaml
status: ready_for_spec
change: simplify-apigen-featured-link
artifact_store: hybrid
execution_mode: auto
delivery_strategy: auto-forecast
branch_strategy: feature-branch-chain
review_budget_changed_lines: 800
technical_artifact_language: English
application_code_modified: false
```

## Intent

Simplify the homepage APiGen conversion path by replacing the separate case-study and GitHub buttons with one semantic link covering the entire localized APiGen caption. The link will open the existing locale-aware APiGen case study. GitHub access remains available from the case-study page, which already owns the canonical repository action.

The change removes a redundant homepage action layer introduced by the archived `clarify-project-conversion` change while preserving the decorative terminal boundary, bilingual copy, locale-aware routing, keyboard access, responsive behavior, and the existing case-study implementation.

## Scope

### In Scope

- Make the complete translated `apigenCaption` output one native locale-aware link to the stable `/proyectos/apigen` route.
- Preserve the bold APiGen fragment produced by `t.rich` inside the link.
- Remove the homepage APiGen case-study button and homepage GitHub button, including their obsolete featured-project prop/type, action wrapper, message keys, and test IDs when no consumer remains.
- Keep the link as semantic content adjacent to, and outside, the decorative `HeroTerminal` subtree.
- Preserve clear link styling and `focus-visible` treatment without relying on color alone; retain narrow-width and 200% reflow usability.
- Retain the existing bilingual caption values and verify the Spanish and English accessible names and locale-aware destinations.
- Update the active UI specification through a delta that replaces the former two-action homepage contract and records GitHub availability on the case-study page.
- Update focused Vitest/Testing Library and Playwright coverage for caption-link semantics, destinations, localization, terminal exclusion, reduced motion, focus, 320px layout, and 200% reflow.
- Keep validation within the configured 800 changed-line review budget and use the repository's existing environment-block reporting for unavailable Sanity data or browsers.

### Out of Scope / Non-Goals

- Do not edit the archived `clarify-project-conversion` artifacts; they remain immutable historical context.
- Do not change `HeroTerminal` replay, scrolling, reduced-motion implementation, or its `aria-hidden="true"` boundary.
- Do not change `ProjectDetail`, the APiGen case-study content, the canonical GitHub URL, project routes, Sanity schemas, or Sanity data flow.
- Do not add a homepage GitHub fallback, modal, second project-content path, CMS featured-project abstraction, or icon-only affordance.
- Do not alter CV controls, project-card geometry, project-card navigation, blog, footer, contact, or unrelated accessibility behavior.
- Do not repair missing Sanity credentials or install unavailable Playwright browsers as part of this change.
- Do not modify application code during proposal creation; implementation belongs to later SDD phases.

## Approach

1. Remove the `featuredProject` data contract from the homepage call site and `HeroSection`.
2. Remove `FeaturedProjectActions` and its separate internal/external links.
3. Wrap the existing `t.rich('apigenCaption', ...)` content in the repository's `next-intl` `Link` with the explicit stable route `/proyectos/apigen`. Keep the caption paragraph and rich bold APiGen fragment intact, and render the link as a semantic sibling of `HeroTerminal`.
4. Remove only the obsolete homepage action labels from both message catalogs. The existing Spanish and English caption strings remain parallel and user-facing.
5. Update focused tests to query the full localized caption as the link name, assert `/proyectos/apigen` and `/en/proyectos/apigen`, assert no homepage GitHub link, and preserve the terminal's inaccessible/focus-free boundary.
6. Update the active UI spec with a delta. The delta MUST supersede the current CTA and optional GitHub requirements, retain applicable terminal/localization/keyboard/responsive requirements, and explicitly state that repository access is provided inside the APiGen case study.

The recommended presentation keeps the current caption typography and adds a visible hover/focus treatment, with an underline or equivalent non-color cue if needed. The full caption is intentionally the accessible name: it identifies APiGen and explains the destination context without restoring a second hidden or visible action.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `app/[locale]/page.tsx:83-108` | Modified | Stop passing the obsolete `featuredProject` object. |
| `components/sections/hero-section.tsx:23-98,222-235` | Modified | Remove featured-action types/components and make the localized caption the sole APiGen link. |
| `messages/es.json:75-77` | Modified | Retain `apigenCaption`; remove obsolete homepage case-study/GitHub labels. |
| `messages/en.json:75-77` | Modified | Retain `apigenCaption`; remove obsolete homepage case-study/GitHub labels. |
| `__tests__/integration/components/HeroSection.test.tsx` | Modified | Replace button/action assertions with full-caption link and boundary assertions. |
| `__tests__/unit/messages/project-conversion.test.ts` | Modified | Verify bilingual caption parity and obsolete-key removal. |
| `e2e/tests/accessibility-interactions.spec.ts` | Modified | Verify semantic focus, keyboard exclusion, reduced motion, 320px, and 200% reflow using the caption link. |
| `e2e/tests/navigation.spec.ts` | Modified | Verify both locale-aware case-study destinations through the full-caption link. |
| `openspec/specs/ui/spec.md` | Delta required | Replace the archived/current homepage two-action contract with the simplified link contract. |
| `components/projects/ProjectDetail.tsx` | Preserved | Existing named GitHub links remain the supported repository path; no implementation change is proposed. |
| `openspec/changes/archive/2026-07-15-clarify-project-conversion/` | Preserved | Historical artifacts must not be edited. |

## Active-Spec Delta Relationship

The current active UI spec describes a required case-study CTA plus an optional homepage GitHub action. This proposal intentionally supersedes those APiGen homepage requirements in a new change delta:

- The former named CTA requirement is **modified** to require one whole-caption semantic link whose accessible name is the complete localized `apigenCaption`.
- The former optional homepage GitHub requirement is **removed** because GitHub is not removed from the product; its supported location is the existing APiGen case-study page. The delta must include that migration rationale.
- Terminal boundary, bilingual parity, keyboard/focus, responsive/reflow, and environment-reporting requirements are retained where applicable, with scenarios updated from old CTA/action selectors to the caption link.
- The archived change is not rewritten. The delta is the forward-facing source of truth for the simplified behavior and must explain the intentional follow-up relationship.

## Bilingual and Accessibility Behavior

- Spanish retains the caption: `<b>apigen</b> — una herramienta que construí: de un schema SQL a una API Spring Boot completa y corriendo.` and navigates to `/proyectos/apigen`.
- English retains the caption: `<b>apigen</b> — a tool I built that turns a SQL schema into a complete, running Spring Boot API.` and navigates to `/en/proyectos/apigen`.
- The complete rendered caption, including the bold APiGen name, is the visible text and accessible name of one link in each locale.
- The link MUST be keyboard reachable, have a visible focus indicator, remain outside `[data-testid="hero-terminal"]`, and never introduce focus into the `aria-hidden` terminal.
- The caption link MUST remain readable and operable at 320px and 200% reflow without clipping or change-caused horizontal scrolling.
- GitHub remains discoverable through the existing named external links on the APiGen case-study page; no homepage repository link is required or rendered.

## Focused Test Plan

1. **Component/integration:** render ES and EN `HeroSection`; assert exactly one APiGen caption link with the full localized name, stable locale-aware href, preserved rich bold fragment, sibling placement outside the terminal, and no homepage GitHub/action wrapper.
2. **Message parity:** assert both catalogs retain equivalent `apigenCaption` content and no longer expose the obsolete homepage action keys.
3. **Navigation E2E:** activate the caption link in each locale and assert `/proyectos/apigen` and `/en/proyectos/apigen`.
4. **Accessibility interaction E2E:** assert role/name semantics, visible focus, logical keyboard access, no focusable terminal descendants, and reduced-motion availability without waiting for terminal replay.
5. **Responsive E2E:** assert no overflow, clipping, or out-of-viewport caption link at 320px and under the established 200% zoom/reflow procedure.
6. **Regression/environment:** retain existing project-card and terminal checks; report unavailable Sanity/browser prerequisites as explicitly blocked rather than passed or silently skipped.

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| The full caption is a longer accessible name than the removed CTA label. | Medium | Use exact localized role/name assertions and verify readability at 320px and 200% reflow. |
| Muted caption styling makes the link difficult to discover. | Medium | Preserve hover and visible focus treatment and add a non-color cue such as a subtle underline when consistent with the design system. |
| Existing tests or consumers still reference removed action IDs/props. | Medium | Audit references before implementation and update only focused affected tests; do not remove unrelated contracts. |
| The link is accidentally nested in the decorative terminal or loses keyboard semantics. | Low | Assert DOM sibling placement, `aria-hidden` boundary, no terminal focusables, and keyboard traversal. |
| Browser/Sanity limitations obscure validation coverage. | Medium | Preserve typed blocked reporting and distinguish blocked results from passed, failed, and skipped results. |

## Rollback Plan

Revert the implementation and test/spec delta commits as one feature branch chain. This restores the previous homepage action layer, message keys, and test contracts without database repair, route migration, Sanity changes, or content restoration. If only the styling causes a regression, first revert the link-style portion while retaining the semantic contract; if the simplified interaction itself is unacceptable, revert the complete change and reopen the proposal with explicit product direction.

## Dependencies and Delivery

- Existing `next-intl/navigation` locale-aware `Link` and `/proyectos/apigen` route.
- Existing APiGen local case-study data and `ProjectDetail` repository links.
- Existing ES/EN message catalogs, Vitest/Testing Library, Playwright, and environment-block reporting.
- No new package, schema, route, migration, or environment variable.
- Delivery uses `feature-branch-chain` under the configured `auto` execution and `auto-forecast` delivery strategy. The expected implementation remains below the 800 changed-line review budget; if forecasted scope exceeds it, split the chain before implementation rather than broadening this proposal.

## Success Criteria

- [ ] The homepage has exactly one APiGen semantic link: the complete localized caption, routed through the existing locale-aware navigation component.
- [ ] The homepage has no APiGen case-study button, GitHub button, featured-action wrapper, or obsolete action message contract.
- [ ] The APiGen case-study page continues to expose the named GitHub action with existing safe external-link behavior.
- [ ] ES and EN caption text, accessible names, destinations, bold emphasis, focus behavior, and keyboard behavior are covered by focused tests.
- [ ] The link remains outside the decorative terminal and passes reduced-motion, 320px, and 200% reflow checks.
- [ ] The active UI delta explicitly supersedes the prior homepage two-action contract without editing the archive.
- [ ] No application code is changed in this proposal phase.
- [ ] Implementation/test work stays within the 800-line review budget, with environment limitations reported honestly.

## Next Step

Proceed to the UI delta specification phase, using this proposal and both exploration artifacts as dependencies. Implementation is not authorized by this proposal phase.
