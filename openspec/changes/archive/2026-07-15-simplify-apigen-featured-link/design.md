# Design: Simplify APiGen Featured Link

## Result Contract

```yaml
status: ready_for_tasks
change: simplify-apigen-featured-link
artifact_store: hybrid
execution_mode: auto
delivery_strategy: auto-forecast
branch_strategy: feature-branch-chain
review_budget_changed_lines: 800
technical_artifact_language: English
application_code_modified: false
```

## Technical Approach

Remove the homepage-only `FeaturedProject` data contract and `FeaturedProjectActions` presentation boundary. In the existing right-column wrapper, keep `HeroTerminal` unchanged and render the existing `t.rich('apigenCaption', ...)` output inside the repository `Link` to the literal `/proyectos/apigen` route. The paragraph/link remains a semantic sibling after the terminal; `next-intl` supplies `/en/proyectos/apigen` for English. Remove only the obsolete Home message keys. GitHub remains exclusively under the existing `ProjectDetail` contract.

## Architecture Decisions

| Decision | Alternatives considered | Rationale |
|---|---|---|
| Caption is the sole APiGen homepage link | New CTA component; link only around bold name; homepage GitHub fallback | Reuses existing localized rich content, gives one complete accessible name, and removes redundant action state. |
| Use an explicit `/proyectos/apigen` `Link` | CMS/title-derived route; raw `<a>`; translated href | Stable route is already the product contract; locale-aware navigation must preserve the English prefix. |
| Preserve the paragraph and terminal boundary | Move caption into terminal; add a wrapper/test ID; edit `HeroTerminal` | Keeps layout and `aria-hidden` isolation intact while avoiding new structural API. |
| Treat repository access as a case-study invariant | Duplicate homepage link; change `ProjectDetail` | The existing detail page already owns canonical GitHub URL, safe attributes, and localized action text. |

## Data Flow and Boundaries

```text
HomePage (server) ── translations/ordinary hero props ──→ HeroSection (server)
                                                              ├─ HeroTerminal (unchanged, aria-hidden)
                                                              └─ <p> ── Link(/proyectos/apigen)
                                                                        └─ t.rich(apigenCaption)
                                                                            └─ bold APiGen span
Case-study route ──→ existing ProjectDetail ──→ existing named GitHub link
```

`HomePage` no longer passes `featuredProject`. `HeroSectionProps` no longer exposes `FeaturedProject`; no new interface is needed. The caption link owns only route, presentation, and rich translation rendering. It must be the immediate sibling following `HeroTerminal`, outside `[data-testid="hero-terminal"]`. Do not alter `HeroTerminal`, `ProjectDetail`, route files, Sanity, CV, ProjectCard, blog, or footer.

## File Changes

| File | Action | Description |
|---|---|---|
| `app/[locale]/page.tsx:83-108` | Modify | Remove the obsolete `featuredProject` prop. |
| `components/sections/hero-section.tsx:23-84,86-98,222-235` | Modify | Remove type/action component/prop; wrap `t.rich` caption in locale-aware `Link` with stable focus-visible and responsive classes. |
| `messages/es.json:75-77` | Modify | Retain `apigenCaption`; delete `apigenCaseStudy` and `apigenGithub`. |
| `messages/en.json:75-77` | Modify | Retain `apigenCaption`; delete the matching obsolete keys. |
| `__tests__/integration/components/HeroSection.test.tsx` | Modify | Assert ES/EN caption link, rich bold fragment, sibling boundary, sole APiGen action, and terminal exclusion. |
| `__tests__/unit/messages/project-conversion.test.ts` | Modify | Assert caption parity and obsolete-key absence. |
| `e2e/tests/accessibility-interactions.spec.ts` | Modify | Replace action selectors with exact caption-link role/name checks for focus, reduced motion, 320px, and 200% reflow. |
| `e2e/tests/navigation.spec.ts` | Modify | Activate the caption link and assert both locale-aware destinations. |
| `openspec/changes/simplify-apigen-featured-link/specs/ui/spec.md` | Modify | Clarify that removal applies to the APiGen homepage repository action, not the unrelated social profile link. |

## Interfaces, Selectors, and Assertions

No new runtime interface or test ID is introduced. Tests use `getByRole('link', { name: exactCaption, exact: true })`; structural checks use only existing `hero-terminal`. Integration assertions require exactly one link whose `textContent` is the complete localized caption, `href` is `/proyectos/apigen` or `/en/proyectos/apigen`, and whose rendered rich child preserves the APiGen bold span. Assert the link's parent is the caption paragraph, the paragraph is a sibling after the terminal, and the terminal has `aria-hidden="true"` with no `a,button,input,select,textarea,[tabindex]` descendants. Assert no APiGen action wrapper or obsolete message key; do not count the existing homepage social GitHub profile link as an APiGen action.

E2E assertions use exact role/name selectors, visible focus (`outline` or `box-shadow`), keyboard reachability without focus entering the terminal, stable reduced-motion output, non-zero in-viewport caption box, `scrollWidth <= clientWidth`, and no clipping/overlap at 320px and established 200% reflow. Existing environment reporter/preflight remains authoritative: missing Sanity data or browser executable is an explicit `blocked` result with reason, excluded from coverage, never silently skipped or passed.

## Testing and Rollout

Run focused Vitest first, then `npm run type-check`, `npm run check`, and the focused Chromium Playwright suite. No migration, flag, package, route, Sanity, or environment-variable change is required. Auto-forecast should keep the chain below 800 changed lines; if forecast exceeds it, split implementation and browser-test work into feature-branch-chain slices before apply.

Rollback is a single feature-chain revert restoring the previous action component, prop, message keys, and tests. No data or route repair is needed. If only styling regresses, revert styling while retaining the semantic link; if the interaction is rejected, revert the complete chain and reopen the proposal.

## Open Questions

None blocking.
