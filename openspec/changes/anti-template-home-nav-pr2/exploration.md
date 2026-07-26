## Exploration: Integrate About content into home and redirect `/sobre-mi`

### Current State

- `app/[locale]/page.tsx` already renders Hero → featured projects → divider → an About section (`id="content"`) → newsletter. The section contains a two-paragraph journey, four approach bullets, reduced Backend/Frontend/DevOps skills, and a small experience/certifications card.
- `app/[locale]/(pages)/sobre-mi/page.tsx` is a complete page: localized `InteriorHero` with profile photo and CV split button; story (two paragraphs), work principles (two rich bullets), seven areas/stack bullets, full skills, five-item education timeline, contact details, and a second CV button.
- The home copy is already a partial duplicate of About: `Home.journeyP1/P2` paraphrases `About.storyP1/P2`, and `Home.approach1/2` overlaps `About.work1/2`. Home skills and experience also overlap the About sidebar. The About page is therefore the remaining long-form version, not a separate information architecture.
- `MAIN_NAVIGATION` is shared by `Header`, `MobileMenu`, and `Footer`; it currently contains About, Projects, Blog, Contact. `next-intl` uses prefix-less Spanish and `/en/*` English (`localePrefix: 'as-needed'`, locale detection disabled).
- Metadata uses per-locale self-canonical URLs via `localeAlternates()`. The sitemap emits `/sobre-mi` plus `/en/sobre-mi` as alternates. There is no existing redirect convention for public pages; only admin/API redirects exist.
- There is no About-page route, metadata, redirect, sitemap, or status E2E coverage. Existing tests assert About remains in navigation and assert the old home composition, so they must be intentionally replaced.

### Recommended Target IA/content

1. Keep the home About section, rename its stable anchor to `sobre-mi` (with `scroll-mt` for the sticky header), and make it a compact personal proof section rather than a copied resume.
2. Lead with the distinctive human context from About: Software Development Technician (2025), Córdoba, 20+ years around technology, IT support/hardware → several years farming → software. Keep the farming line because it is the strongest non-template differentiator.
3. Add a short second paragraph describing the current span: Java/Spring, Go/Rust, React, edge ML, and developer tooling/AI. Keep it concrete but do not enumerate all seven technical areas.
4. Retain a compact three-item “how I work” proof row: understand the problem first; make tradeoffs explicit; ship with tests/observability. The existing fourth “less chrome” bullet is site/product voice, not biography, and should be removed from the personal content.
5. Keep at most a small stack/proof treatment already present on home; do not move the full About skills, education timeline, contact card, profile-photo hero, or seven area bullets. CV remains the canonical detailed resume and Contact remains the conversion route.
6. The home section should offer direct links to Projects and CV/Contact if needed, but must not link to `/sobre-mi` after the redirect. A compact section is likely a replacement of most current home markup, not an additive full-page copy.

### Redirect/SEO options

1. **Locale-aware page `permanentRedirect` (recommended)** — replace the About page body with a server redirect based on `params.locale`, targeting `/` + `#sobre-mi` for Spanish and `/en#sobre-mi` for English.
   - Pros: locale is already resolved by the `[locale]` segment; redirect is explicit and easy to test; permanent redirect is emitted server-side; no middleware ordering risk.
   - Cons: `permanentRedirect` emits 308 (not literal 301); query parameters must be copied deliberately if preservation is required; the fragment is only acted on by the browser after the redirect.
   - Effort: Low/Medium.

2. **`next.config.ts` redirects** — configure both `/sobre-mi` → `/#sobre-mi` and `/en/sobre-mi` → `/en#sobre-mi` as permanent redirects.
   - Pros: early static redirect and no rendered route; Next destination handling supports hash fragments and can preserve unmatched query strings when the destination does not specify a replacement query.
   - Cons: duplicates locale knowledge outside `next-intl`; interaction with the `proxy.ts`/next-intl pipeline is less local and harder to unit-test; still normally produces 308 for `permanent: true`.
   - Effort: Medium.

3. **Proxy redirect** — add a path match before locale routing and return `NextResponse.redirect(url, 301|308)`.
   - Pros: exact status code can be chosen; can preserve query strings explicitly.
   - Cons: adds branching to a security/rate-limit proxy, must handle `/en`, slash normalization, and ordering correctly; fragments are not sent by clients and must be placed in the `Location` URL manually.
   - Effort: Medium/High.

4. **Client navigation (`useEffect`/router replace)** — redirect after hydration.
   - Pros: easy fragment manipulation.
   - Cons: no permanent HTTP signal, flash/late navigation, poor crawler behavior, and unnecessary client code. Reject.

#### Redirect recommendation

Use the server page redirect with `permanentRedirect` and document that 308 is the framework’s permanent status equivalent. Build the destination from locale plus the incoming `searchParams` so campaign/query parameters survive, then append `#sobre-mi`. If product/SEO explicitly mandates literal 301 rather than 308, use a narrowly scoped proxy rule or a dedicated route handler instead; do not use a client redirect. Add an E2E assertion that the final URL contains the locale, preserved query, and hash, and that the section is present and visible/focusable.

### SEO and navigation changes

- Remove the `/sobre-mi` static sitemap record and its bilingual alternates; a redirecting URL should not remain a sitemap content URL. Keep the home sitemap entry and its existing `es`/`en` alternates.
- Remove About page metadata generation because the page no longer serves indexable content. Enrich `Home.metaDescription`/OG copy with the selected personal differentiator if desired; home `localeAlternates('/')` already provides canonical and hreflang.
- Remove `about` from `MAIN_NAVIGATION`; the exact shared set becomes Projects → Blog → Contact in Header, mobile menu, and Footer. Keep direct `/sobre-mi` compatibility for old bookmarks/external links, but do not advertise a redirecting route.
- Update all internal/test assumptions of About-in-nav and old `content` anchor. Search found navigation tests, `MobileMenu.test.tsx`, `VisualBatch5QuickWins.test.tsx`, `HomePage.test.tsx`, and the About visual-token source test.
- Keep `SkipLinks` targeting `#main-content`; the new `#sobre-mi` section is an in-page content target, not a replacement for the accessibility skip target. Add `scroll-mt-*` to avoid the sticky header covering the redirected destination.

### Affected Areas

- `app/[locale]/page.tsx` — compact personal section, stable `sobre-mi` anchor, likely CTA/scroll target updates.
- `app/[locale]/(pages)/sobre-mi/page.tsx` — server-side permanent redirect; preserve locale and query parameters; remove page rendering/imports.
- `messages/es.json`, `messages/en.json` — Home copy and any new section labels; remove only About keys that become unused after confirming no other consumer.
- `lib/constants/navigation.ts` — exact nav set becomes Projects, Blog, Contact.
- `components/layout/Header.tsx`, `components/layout/MobileMenu.tsx`, `components/layout/Footer.tsx` — behavior is shared already; likely no production edits beyond consuming the changed constant, but verify locale-aware links and footer expectations.
- `app/sitemap.ts` — remove the redirecting About URL and alternates.
- `app/[locale]/layout.tsx` / `components/ui/Section.tsx` — inspect only; likely no changes, but anchor scroll offset belongs on the target section.
- `app/layout.tsx`, `lib/seo/alternates.ts`, `Home.generateMetadata` — home metadata remains canonical; update copy only if the chosen personal message changes SEO text.
- `__tests__/integration/app/HomePage.test.tsx` — assert compact content, `id="sobre-mi"`, no duplicated/removed content, and both locales.
- `__tests__/integration/components/MobileMenu.test.tsx`, `VisualBatch5QuickWins.test.tsx` — update canonical nav expectations.
- `__tests__/integration/components/VisualBatch4ColorTokens.test.tsx` — replace or remove source assertions tied exclusively to deleted About-page timeline markup.
- `e2e/tests/navigation.spec.ts`, `e2e/tests/accessibility-interactions.spec.ts`, `e2e/tests/accessibility.spec.ts` — remove About-nav navigation assertions; add Spanish/English redirect, query, slash, hash, and accessibility checks.
- New focused redirect/sitemap unit coverage may be warranted if the redirect logic is extracted into a pure helper; otherwise status/hash behavior belongs in Playwright.

### Tests required

- Home integration: render ES and EN, verify the personal section has the new stable `sobre-mi` id, distinctive copy, compact structure, and no old duplicate keys/sections that were intentionally removed.
- Navigation unit/integration: `MAIN_NAVIGATION` exactly equals `projects`, `blog`, `contact`; Header/mobile/footer do not expose About and preserve localized hrefs.
- Redirect E2E: `/sobre-mi` → `/#sobre-mi` and `/en/sobre-mi` → `/en#sobre-mi`, verify permanent status (308 unless literal 301 is selected), query preservation, and final hash. Test `/sobre-mi/` and `/en/sobre-mi/` as well.
- Redirect UX/accessibility E2E: direct redirected landing scrolls to the target without the sticky header obscuring its heading; target has a meaningful heading and remains keyboard/reader discoverable. Check browser back does not loop.
- SEO: sitemap no longer contains About URLs; home metadata contains canonical `/` or `/en` and correct hreflang. If metadata helpers are tested indirectly, add a focused assertion rather than snapshotting the whole document.
- Run existing axe scans for home and both localized home states; About no longer needs an accessibility page scan because it is not a content page.

### Risks and unresolved product decisions

- Decide whether “301” in the product request means literal 301 or any permanent redirect. Next.js `permanentRedirect` and `next.config` permanent redirects conventionally return 308.
- Decide whether all query parameters must survive. Recommendation: yes, to avoid losing campaign/referral data; explicitly test it.
- Decide whether the anchor is `sobre-mi` for both locales (recommended, stable and language-neutral) or localized. A stable id simplifies external links and tests.
- Existing `Home.about*`, `Home.journey*`, and `Home.approach*` keys can be pruned only after the final compact copy is chosen; deleting them increases catalog churn but prevents dead translation drift.
- Language switching from `/#sobre-mi` may drop the fragment because the current switcher is path-oriented. Preserve it only if cross-language switching at the in-page destination is a stated requirement.
- A redirecting route will still appear in browser history for direct visits only according to browser/server navigation semantics; use replace/default redirect behavior and test back navigation.

### Scope and review forecast

Estimated production changes: 80–180 lines changed; tests/catalog updates: 120–220 lines changed; total likely 220–400 changed lines. Keep PR2 as one slice under the 800-line session ceiling and near the 400-line review budget. If full translation pruning plus new redirect infrastructure exceeds ~400 changed lines, defer catalog cleanup or split redirect/SEO from content, but do not split the user-visible home integration from its tests.

### Recommendation

Collapse the current home About preview into a short, first-person “context + way of working” section using the farming/support-to-software story and a concrete current-stack paragraph; retain only three operating principles and omit the full skills/education/contact inventory. Remove About from the shared navigation and sitemap, keep `/sobre-mi` as a locale-aware server-side 308 redirect to `/#sobre-mi` or `/en#sobre-mi`, preserve query parameters, and test both localized routes, slash variants, status, hash, back behavior, anchor accessibility, and SEO metadata.

### Ready for Proposal

Yes. Proposal should explicitly lock: compact content boundaries, nav set `Projects | Blog | Contact`, stable `#sobre-mi`, 308 versus literal 301 policy, query preservation, and whether obsolete About translation keys are pruned in PR2.
