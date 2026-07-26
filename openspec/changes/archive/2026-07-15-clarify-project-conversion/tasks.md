# Tasks: Clarify Project Conversion

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 480–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: UI contract + focused tests → PR 2: E2E/preflight/reporting |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Required APiGen contract, terminal/CV behavior, localization, card regression | PR 1 | Base = feature branch; behavior and unit/integration tests stay together |
| 2 | Browser acceptance and environment-block reporting | PR 2 | Base = PR 1 branch; E2E/preflight/reporting only |

## Phase 1: Contracts and RED tests

- [x] 1.1 Add failing ES/EN unit/catalog parity coverage under `__tests__/unit/` plus integration coverage in `__tests__/integration/components/HeroSection.test.tsx` (create if absent) for required `featuredProject`, exact visible labels, optional GitHub, locale routes, and sibling containment; type-check must reject omission.
- [x] 1.2 Add failing terminal boundary/reduced-motion assertions in `__tests__/integration/components/HeroTerminal.test.tsx`; add CV visible-label/link assertions and preserve `__tests__/integration/components/ProjectCardVisualUx.test.tsx` detail-route coverage.

## Phase 2: Core UI implementation

- [x] 2.1 In `app/[locale]/page.tsx:83-104` pass literal required `{ detailHref: '/proyectos/apigen', githubHref: 'https://github.com/JNZader-Vault/apigen' }`; update `HeroSectionProps` and a local sibling `FeaturedProjectActions` in `components/sections/hero-section.tsx:23-195` with visible catalog labels, semantic links, and allowed test IDs.
- [x] 2.2 In `components/sections/HeroTerminal.tsx:70-103` add `data-testid="hero-terminal"`, remove only `tabIndex={-1}`, and preserve `aria-hidden`, ref-driven scrolling, replay, and reduced motion.
- [x] 2.3 Update parallel keys in `messages/es.json` and `messages/en.json`; make `components/ui/CVButton.tsx:24-95` visibly identify the eye link as “view CV” while preserving separate PDF download, `/cv`, title, and accessible names.
- [x] 2.4 Inspect representative fixtures/Sanity-shaped data and existing card tests before touching `components/projects/ProjectCard.tsx:100-227`; preserve detail action, title overlay, featured badge, and geometry unless a focused invariant proves a narrow fix. Report missing Sanity variables/data as blocked; do not fix environment.

## Phase 3: E2E, preflight, and reporting

- [x] 3.1 Extend `e2e/tests/accessibility-interactions.spec.ts` and `e2e/tests/navigation.spec.ts` for ES/EN role/name, keyboard order/focus exclusion, reduced motion, destinations, GitHub safety, 320px no-overflow, and 200% reflow; assert CTA visibility after scroll/focus, not initial full-viewport placement.
- [x] 3.2 Add concrete typed environment status `{ type: 'environment', status: 'blocked', reason, project? }` plus Sanity-variable/fetch and every Playwright-project executable preflight in `e2e/fixtures/test-data.ts` (or dedicated helper); emit separate passed/failed/skipped/blocked JSON counts and never convert blocks to passes.

### PR 2 corrective pass

- [x] Re-run the PR 2 fix diff twice and finally: validate usable Sanity project data (not only HTTP 2xx), cache one run ID per process, assert every visible 320px action (case study, optional GitHub, CV view/download), represent the known `npm run build` dataset block in the environment report, and preserve browser blocks/retry counts/focus-visible/200% geometry without changing PR 1 UI or Sanity configuration.

## Phase 4: Verification and rollback

- [x] 4.1 Run `npm run test:run`, `npm run type-check`, `npm run check`; run focused Chromium E2E and configured-browser probes, recording unavailable browsers, Sanity, and production-build limitations explicitly.
- [x] 4.2 Verify exclusions (no modal, blog/footer/anchors/Sanity/schema fixes) and rollback boundary: revert only PR 2 E2E/reporting plus checklist/progress files; PR 1 UI and unrelated audit/config files remain untouched.
