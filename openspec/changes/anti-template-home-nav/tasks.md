# Tasks: Anti-Template Home + Nav Light (PR1)

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 300-450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | PR1 only; PR2 stays separate |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Lock the home/nav contracts with failing tests | PR1 | RED tests for page order, nav, footer, hero, i18n |
| 2 | Ship the PR1 UI/copy changes | PR1 | App/layout/messages wiring only |
| 3 | Final regression pass | PR1 | Keep `/proyectos` and `/sobre-mi` intact |

## Phase 1: RED tests

- [x] 1.1 Add `__tests__/integration/app/HomePage.test.tsx` for Hero → Featured → divider ≤1 → About → Newsletter, no Quick Stats, and ScrollIndicator featured/about fallback.
- [x] 1.2 Update `__tests__/integration/components/HeroSection.test.tsx` to assert only CV + Projects primary CTAs and no hero Contact CTA.
- [x] 1.3 Update `__tests__/integration/components/FeaturedProjects.test.tsx` to assert a stable section id and empty-state scroll fallback support.
- [x] 1.4 Update `__tests__/integration/components/MobileMenu.test.tsx` and `VisualBatch5QuickWins.test.tsx` for Home removal, Contact-once, footer Services removal, and ES/EN key parity.
- [x] 1.5 Update `e2e/tests/navigation.spec.ts` plus `e2e/tests/quick-stats.spec.ts` to preserve `/proyectos` and `/sobre-mi` and to regress Quick Stats absence.

## Phase 2: Implementation

- [x] 2.1 Refactor `app/[locale]/page.tsx` to remove `STATS`, reorder sections, pass `scrollTargetId`, simplify About chrome/copy, and demote Newsletter.
- [x] 2.2 Update `components/sections/hero-section.tsx` to use the resolved scroll target and drop the hero Contact CTA path.
- [x] 2.3 Update `components/sections/FeaturedProjects.tsx` (and the shared home loader if needed) to expose a stable id and support the target contract.
- [x] 2.4 Change `lib/constants/navigation.ts`, `components/layout/Header.tsx`, `components/layout/MobileMenu.tsx`, and `components/layout/Footer.tsx` to remove Home, keep Blog, and show Contact once with no Services column.
- [x] 2.5 Update `components/newsletter/NewsletterHero.tsx` so the home variant is quieter and reads as opt-in updates, not contact.
- [x] 2.6 Rewrite `messages/es.json` and `messages/en.json` for Home/Nav/Footer/Newsletter parity; delete orphaned stats/services/heroContact keys after consumers move.

## Phase 3: Cleanup

- [x] 3.1 Remove dead imports, unused `home`/stats/service references, and any now-redundant test helpers or snapshots.
- [x] 3.2 Keep APiGen caption, blog ES-only strategy, `/newsletter`, `/proyectos`, and `/sobre-mi` unchanged.

## Phase 4: Verify

- [x] 4.1 Run `npm run test:run`.
- [x] 4.2 Run `e2e/tests/navigation.spec.ts` and confirm desktop/mobile nav, footer, and route regressions pass.
- [x] 4.3 Sanity-check both locales with featured and empty-featured home states.

## Dependency notes

- RED tests must land before implementation.
- Update `MAIN_NAVIGATION` before Header/MobileMenu/Footer assertions.
- Update message catalogs after component consumers are switched.
