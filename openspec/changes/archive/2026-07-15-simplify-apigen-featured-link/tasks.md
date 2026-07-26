# Tasks: Simplify APiGen Featured Link

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 420–560 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: UI/messages + unit/integration tests → PR 2: E2E/layout/reporting verification |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |
| 800-line configured budget | Expected to remain below 800 |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Boundary / rollback |
|---|---|---|---|
| 1 | Simplified caption-link contract and focused tests | PR 1 | Base = feature/tracker; revert only UI, messages, unit/integration tests |
| 2 | Browser behavior, layout, and environment evidence | PR 2 | Base = PR 1 branch; revert only E2E/reporting changes |

## Phase 1: Contract RED tests and cleanup inventory

- [x] 1.1 Audit `featuredProject`, `FeaturedProjectActions`, obsolete keys, and test IDs; record only consumers in the listed files and leave archive/unrelated surfaces untouched.
- [x] 1.2 Update `__tests__/integration/components/HeroSection.test.tsx` RED coverage for ES/EN full-caption role/name, exact locale href, semantic bold child, exactly one APiGen link, paragraph-after-terminal sibling boundary, unchanged `aria-hidden` terminal, and no homepage GitHub action.
- [x] 1.3 Update `__tests__/unit/messages/project-conversion.test.ts` RED coverage for parallel `apigenCaption` values and absence of `apigenCaseStudy`/`apigenGithub`; add `__tests__/integration/components/ProjectDetail.test.tsx` coverage for APiGen GitHub href, named link, `target="_blank"`, and `rel="noopener noreferrer"` without changing `ProjectDetail.tsx`.

## Phase 2: Core UI and catalog implementation

- [x] 2.1 Remove `featuredProject` from `app/[locale]/page.tsx` and `HeroSectionProps`; delete `FeaturedProject`/`FeaturedProjectActions` and unused `ExternalLink` dependency only if no remaining consumer exists.
- [x] 2.2 In `components/sections/hero-section.tsx`, make the existing caption paragraph’s immediate post-terminal content one locale-aware `Link href="/proyectos/apigen"`; preserve `t.rich`, render APiGen as `<strong>` (or the existing semantic-compatible rich equivalent), and add persistent underline/equivalent cue plus `focus-visible` styling without color-only discovery or overflow.
- [x] 2.3 Remove only `apigenCaseStudy` and `apigenGithub` from `messages/es.json` and `messages/en.json`; retain exact captions and all unrelated copy.

## Phase 3: E2E, responsive, and honest environment validation

- [x] 3.1 Update `e2e/tests/navigation.spec.ts` and `e2e/tests/accessibility-interactions.spec.ts` to use exact full-caption names, both locale destinations, keyboard order/focus cue, terminal exclusion, reduced motion, and no homepage GitHub link.
- [x] 3.2 At 320px and established 200% reflow (640 CSS px plus `zoom: 2`), assert the caption link specifically: `scrollWidth <= clientWidth`, non-zero box, `x >= 0`, right edge within viewport, link `scrollWidth <= clientWidth`, and no caption text clipping/overlap; do not rely on a global-only overflow assertion.
- [x] 3.3 Preserve `e2e/fixtures/environment-status.ts`, `global-setup.ts`, and `e2e/reporters/environment-reporter.ts` semantics; report unavailable browser/Sanity/build prerequisites as typed `blocked` with reason, never pass/skip or count as coverage.

## Phase 4: Verification and delivery boundaries

- [ ] 4.1 Run `npm run test:run`, `npm run type-check`, `npm run check`, then focused Chromium E2E (`npm run e2e -- --project=chromium`); record blocked prerequisites separately.
- [ ] 4.2 Verify exclusions (`HeroTerminal`, `ProjectDetail.tsx` implementation, routes, Sanity, CV/cards/blog/footer, terminal internals, archive) and clean chain diffs; PR 1 must stand without PR 2, and each PR must include its tests and rollback scope.
