# Proposal: Clean Up Footer Layout Alignment

## Result Contract

```yaml
status: ready_for_spec
change: cleanup-footer-layout
artifact_store: hybrid
execution_mode: auto
delivery_strategy: auto-forecast
branch_strategy: feature-branch-chain
review_budget_changed_lines: 800
technical_artifact_language: English
```

## Intent

Correct the footer's mixed desktop alignment model. The current three-column footer uses left-, center-, and right-aligned content, which makes the section feel fragmented and weakens scanability even though its links and functionality are complete. The change will establish one predictable alignment system while preserving the existing footer content, destinations, calls to action, and responsive behavior.

Blog content strategy and blog behavior remain unchanged.

## Scope

### In Scope

- Align the existing footer columns to a shared, left-aligned grid/container edge at desktop and mobile breakpoints.
- Tune spacing and readable measures only as needed to prevent overlap, clipping, or awkward wrapping in Spanish and English.
- Preserve all existing localized labels, navigation links, contact/social CTAs, privacy/GDPR destinations, external-link behavior, and 44px interactive targets.
- Verify footer layout at narrow mobile and desktop widths, including light and dark themes.
- Add focused browser assertions for viewport containment, non-overlap/reachability, alignment invariants, and preserved semantic links.
- Run focused tests plus the repository's type-check and Biome checks, reporting unavailable browser projects as blocked rather than passed.

### Out of Scope

- Rewriting footer copy, changing content strategy, or changing footer information architecture.
- Any blog page, post, CMS, blog navigation, or blog content-strategy work.
- CV, header, interior-page, contact, global typography, or unrelated accessibility changes.
- Changing link destinations, labels, CTA semantics, newsletter behavior, or the shared `Container` abstraction unless implementation evidence proves it is required.
- Pixel-perfect snapshot acceptance as the sole layout contract.

## Approach

Keep the existing three-column structure in `Footer.tsx` and remove the mixed `text-center`/`text-right` desktop alignment in favor of a single left-aligned system anchored to the existing `Container`. Use Tailwind responsive utilities and conservative gap/measure adjustments, with no new layout abstraction or content changes. Preserve mobile stacking and bottom-bar wrapping while validating both locales at 320px and 1440px (plus a narrow desktop checkpoint if needed).

Tests should extend the existing footer smoke coverage in `e2e/tests/navigation.spec.ts` with semantic link checks and stable geometry/computed-style invariants, rather than selecting styling classes. Existing visual snapshots may be run as supplementary evidence; semantic geometry assertions remain the acceptance gate because snapshots are platform-specific.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `components/layout/Footer.tsx:25-129` | Modified | Unify column and bottom-bar alignment while preserving content, links, CTAs, themes, and touch sizing. |
| `e2e/tests/navigation.spec.ts:133-147` | Modified | Add focused footer reachability, preserved-link, responsive geometry, and alignment coverage. |
| `e2e/tests/visual.spec.ts` and snapshots | Test-only/optional | Run or update only if the focused footer change produces an intentional, reviewable snapshot delta; not the sole acceptance mechanism. |
| `components/ui/Container.tsx:9-10` | Inspected only | Reuse the existing container; no change expected. |
| `messages/es.json`, `messages/en.json` | Preserved | No copy or blog/content-strategy changes. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Removing desktop symmetry makes the footer visually less intentional. | Medium | Review 1440px and narrow-desktop rendering; keep the change limited to alignment and spacing. |
| Long Spanish labels wrap or create collisions at 320px. | Medium | Test both locales at 320px, assert viewport containment/non-overlap, and preserve wrapping rather than truncating text. |
| Theme-specific contrast or background effects obscure layout regressions. | Low | Exercise light and dark states with the same semantic and geometry checks. |
| Firefox/WebKit executables are unavailable locally. | Medium | Use the repository environment-reporting convention and mark unavailable projects blocked with the exact reason. |
| Unrelated content or blog work enters the change. | Low | Keep implementation and tests limited to footer paths and explicitly preserve blog behavior. |

## Rollback Plan

Revert the footer class/alignment changes and focused test additions as one feature-branch commit or revert the feature branch before merge. No data, route, translation, CMS, or shared-container migration is planned, so rollback requires no database or configuration restoration.

## Dependencies

- Existing `Container`, localized navigation/translation messages, and footer link components.
- Existing Playwright local server, browser projects, cookie-consent fixture, and environment-status reporting.
- No new package, route, CMS data, or configuration dependency.

## Success Criteria

- [ ] Desktop footer columns use one predictable left-aligned system anchored to the shared container; mixed center/right column alignment is removed.
- [ ] Mobile footer remains stacked, readable, in-viewport, and free of overlap or unintended horizontal scrolling at 320px.
- [ ] Spanish and English footer labels, links, destinations, external behavior, CTAs, and 44px targets are unchanged.
- [ ] Footer renders correctly in light and dark themes without changing theme behavior.
- [ ] Focused Playwright coverage verifies alignment/geometry and preserved semantic links at 320px and 1440px; browser limitations are reported honestly.
- [ ] `npm run type-check` and `npm run check` pass, with only pre-existing warnings or explicitly documented environment blocks.
- [ ] No blog, CV, content rewrite, or unrelated accessibility changes are included.
