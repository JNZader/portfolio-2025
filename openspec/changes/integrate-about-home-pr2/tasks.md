# Tasks: Integrate the Full About Profile into Home (PR2)

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 892 actual |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | One PR2 slice retained under approved size exception |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: Yes — size exception approved by maintainer
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: High

The implementation reached 892 changed lines. The maintainer approved a single-PR size exception; no split is required for this PR2.

## Phase 1: RED Tests First

- [x] 1.1 Update `__tests__/integration/app/HomePage.test.tsx` to fail on the complete ES/EN profile contract: one `section#sobre-mi`, localized intro/story, seven areas, four skill groups, five education items, availability/contact, two CV semantics, order, fallback target, and absence of old Home preview keys/duplicate copy.
- [x] 1.2 Add redirect-builder unit coverage in `__tests__/unit/lib/about-redirect.test.ts` for ES/EN, empty/scalar/repeated/encoded query values, exact `#sobre-mi`, and trailing-slash route expectations; add route coverage for 308 invocation and no JSX/metadata.
- [x] 1.3 Update navigation tests (`__tests__/integration/components/MobileMenu.test.tsx`, `VisualBatch5QuickWins.test.tsx`) to require exactly Projects, Blog, Contact, locale-aware logo Home, and no About link.
- [x] 1.4 Add/update sitemap/Home metadata tests for absent About URLs, alternates, and fragments while retaining `/` or `/en` canonical and `es`/`en`/`x-default` alternates; add out-of-scope route assertions.
- [x] 1.5 Extend `e2e/tests/navigation.spec.ts`, `accessibility-interactions.spec.ts`, and `accessibility.spec.ts` for 308 `Location`/query/hash, slash variants, Back/no-loop, sticky-safe keyboard fragment landing, axe/heading/list/alt/focus contracts, 320px/200% reflow, overflow, image dimensions/lazy behavior, and usable CV/contact targets. (Focused browser tests added; execution blocked.)

## Phase 2: GREEN — Profile and Route

- [x] 2.1 Create `components/sections/AboutProfile.tsx` as one server component using `About`, full `SKILLS_DATA`, `CVButton`, `ObfuscatedEmail`, profile image, semantic lists/timeline, `aria-labelledby`, `id="sobre-mi"`, `scroll-mt-24`, intrinsic 220×220 lazy/non-priority media, and the required mobile DOM order.
- [x] 2.2 Modify `app/[locale]/page.tsx` to remove preview markup/`SKILLS_DATA_HOME`, render `AboutProfile` once below the divider, and change the empty-feature hero fallback to `sobre-mi` without changing Home metadata or project loading.
- [x] 2.3 Modify `app/[locale]/(pages)/sobre-mi/page.tsx` into a server-only `permanentRedirect` route. Export/use a pure builder that awaits locale/search params, appends every repeated value safely, emits `/` or `/en` plus `#sobre-mi`, and relies on existing slash normalization (no proxy/client redirect).

## Phase 3: GREEN — Data, Navigation, SEO

- [x] 3.1 Update `messages/es.json` and `messages/en.json`: add parity-matched `About.work3`, remove `Nav.about`, and remove only consumer-proven duplicate Home journey/approach/reduced-skill/experience keys.
- [x] 3.2 Change `lib/constants/navigation.ts` to the exact ordered three-item set; verify Header/MobileMenu/Footer inherit it without unrelated layout edits.
- [x] 3.3 Remove the About record/alternates from `app/sitemap.ts`; remove redirect-page metadata and verify `lib/seo/alternates.ts`/Home metadata remain unchanged.

## Phase 4: Cleanup, Rollback, Verification

- [x] 4.1 Update stale source assertions only for the new contract; preserve Projects, Blog, APiGen, Contact backend, CV, Sanity, skip-link, and visual-token behavior.
- [x] 4.2 Check the diff for accidental catalog/formatting churn and document rollback order: route/metadata, nav/sitemap, then Home integration.
- [x] 4.3 Run `npm run test:run`, `npm run type-check`, and `npm run check`; run E2E/browser checks when available, otherwise report typed `blocked` reasons exactly (never convert failures to blocked).
