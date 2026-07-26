# Proposal: Integrate the Full About Profile into Home

Move the complete `/sobre-mi` profile into the localized home page and turn the
old route into a permanent compatibility redirect. Visitors get one coherent
home narrative—profile, proof, skills, education, availability, contact, and CV
actions—while existing bookmarks and search referrals continue to land at the
equivalent `#sobre-mi` section.

## Quick path

1. Replace the current compact/duplicated home About preview with the full About
   profile and the stable `sobre-mi` anchor.
2. Remove About from shared primary navigation and the sitemap; keep the old
   localized routes as server-side 308 redirects with query preservation.
3. Update localized catalogs and focused component, SEO, redirect, and Playwright
   coverage; verify the section at mobile widths and with the sticky header.

## Intent and user outcome

The current home preview and `/sobre-mi` are two overlapping versions of the
same personal story. This makes the home feel generic while forcing a visitor
to change routes to see the evidence needed to evaluate Javier: his background,
technical range, education, availability, and resume. The change makes Home the
canonical profile surface. A visitor can understand the person and decide
whether to inspect Projects, read the Blog, contact Javier, or view/download
the CV without discovering a second About page.

## Scope

### In scope

- Integrate the full About profile into `app/[locale]/page.tsx`, including:
  - profile photo and localized profile introduction/context;
  - both complete story paragraphs (20+ years in technology, support/hardware,
    farming, and return to software);
  - the complete current technical context and all seven technical areas;
  - work principles, including explicit problem understanding, tradeoffs, and
    tests/observability proof;
  - the full extended skills treatment from `SKILLS_DATA`;
  - the five-item education/certification timeline;
  - Córdoba/location, availability, obfuscated email/contact action, and both
    CV download/view action locations.
- Deduplicate the existing Home `journey*`, `approach*`, reduced skills, and
  experience preview markup/copy rather than appending a second profile.
- Make the home profile section `id="sobre-mi"`, associate it with a meaningful
  heading, and apply sticky-header scroll offset behavior.
- Change shared primary navigation to exactly `Projects · Blog · Contact` in
  both locales. Home remains available through the logo and is not added as a
  nav item.
- Replace the localized `/sobre-mi` page body with a locale-aware permanent
  redirect:
  - `/sobre-mi` → `/#sobre-mi`
  - `/en/sobre-mi` → `/en#sobre-mi`
  - preserve every incoming query parameter, including repeated parameters.
- Remove About URLs and their alternates from the sitemap and remove the About
  page's independent metadata/canonical surface. Home remains the canonical,
  bilingual SEO surface.
- Add/update localized unit/integration and E2E coverage for content, nav,
  redirect status/query/hash, accessibility, responsive behavior, and SEO.

### Out of scope / non-goals

- No change to `/proyectos` information architecture or project data.
- No change to the Spanish-only blog/content strategy.
- No APiGen privacy or featured-project behavior changes.
- No contact backend, form validation, rate-limit, newsletter, CV generation,
  Sanity schema/data-model, or unrelated visual-token changes.
- No client-side redirect, middleware redirect branch, or literal 301 policy.
  This proposal accepts Next.js `permanentRedirect`'s permanent 308 semantics.
- No redesign of the header/footer beyond consuming the exact shared nav list.
- No cross-locale fragment-preservation feature for the language switcher unless
  existing switcher behavior requires a narrowly scoped regression fix.

## Exact content migration and deduplication

| Existing source | Home result | Deduplication rule |
|---|---|---|
| About `InteriorHero` title/subtitle, profile photo, and `CVButton` | Profile intro block in the Home About section, with the profile image and localized CV split action | Do not retain an independent About hero or duplicate generic About preview heading/copy |
| About `storyP1/P2` | Full story/context block | Use this as the canonical long-form story; remove Home `journeyP1/P2` paraphrases |
| About `work1/work2` plus the useful Home approach proof about tests/observability | Three concise, evidence-based work principles | Remove Home `approach1/2/3/4` as separate duplicate keys; omit the product-voice “less chrome” bullet |
| About `area1..area7` | Complete technical-areas list | Do not replace the list with the reduced Home stack summary |
| About `SKILLS_DATA` consumer | Full Backend, Frontend, Databases, and DevOps & Tools groups | Remove the Home-only reduced skills sidebar and its duplicate labels |
| About education timeline | Full five-item education/certification timeline | Preserve localized labels and existing dates/institutions; no second experience card |
| About contact card | Location, availability, obfuscated email, Contact route/action, and CV actions | Contact remains the conversion route; do not duplicate the contact form on Home |
| About second CV action | Quiet lower profile action | Keep the two intentional CV entry points, not additional generic CTAs |

The `About` message namespace may remain as the localized content source after
the route is removed; its keys are no longer page metadata. Unused `Home`
preview keys should be removed only after consumer search confirms that the
new Home implementation no longer reads them. This avoids dead translation
drift while minimizing unrelated catalog churn.

## Home structure and responsive behavior

The order remains:

1. Home hero and existing hero actions.
2. Featured projects (when available).
3. Existing divider.
4. Full About profile at `#sobre-mi`.
5. Newsletter.

The full profile should use a semantic profile heading and a responsive
single-column-first composition. At desktop widths it may use the existing
two-column pattern: story/work/areas in the primary column and skills,
education, and contact in the secondary column. At mobile widths it MUST stack
in reading order: profile intro/photo/CV, story, work principles, technical
areas, skills, education, contact/availability, and the lower CV action. Cards
must wrap naturally, retain readable text, avoid fixed-height clipping, and
avoid horizontal overflow at 320px and 200% reflow.

The profile image must retain explicit dimensions and use non-priority/lazy
loading when placed below the hero so integrating the profile does not claim
the LCP slot. Existing section/content-visibility behavior may be retained only
if it does not prevent fragment landing or delay the redirected target's
heading/content from becoming visible.

## Redirect and query strategy

Implement the redirect in the existing localized server page, using the
resolved `[locale]` and `searchParams` rather than adding logic to the security
proxy. Build the destination path from the locale (`/` or `/en`), serialize
all query entries safely (including duplicate keys), append `#sobre-mi`, then
call `permanentRedirect(destination)`.

Next.js documents `permanentRedirect` as a server-side permanent redirect that
returns HTTP **308** (it throws the internal redirect signal and terminates
rendering; its default navigation type is replace). A 308 is intentionally used
instead of treating the old product shorthand “301” as a literal status. The
redirect is still permanent for clients and crawlers while preserving the
request method semantics defined by 308. If a literal 301 becomes a hard
requirement later, that is a separate infrastructure decision and must not be
silently implemented through client navigation.

Fragments are not sent to the server, so the source route cannot read an
incoming fragment. The target fragment is explicitly appended to the
`Location`; the browser applies it after following the 308. Query parameters
are sent to the server and therefore must be copied deliberately. The default
redirect replacement behavior should avoid adding an unnecessary history entry;
E2E coverage must confirm that browser Back does not loop between the old route
and Home.

Trailing-slash compatibility (`/sobre-mi/` and `/en/sobre-mi/`) must resolve to
the same localized redirect under the repository's existing routing/normalizing
behavior and be tested explicitly.

## Navigation, sitemap, metadata, and SEO

- `MAIN_NAVIGATION` becomes exactly `projects`, `blog`, `contact`; Header,
  MobileMenu, and Footer inherit the same set. No visible nav item links to the
  redirecting About route.
- The logo remains the Home entry point. The profile is discoverable through
  the Home document and direct legacy links, not a fourth primary nav item.
- Delete the `/sobre-mi` sitemap record and its `es`/`en` alternates. Do not add
  a sitemap URL containing `#sobre-mi`; fragments are not sitemap URLs.
- Remove `generateMetadata` from the redirecting page. It must not emit the old
  About title, description, canonical, or hreflang as if it were indexable
  content.
- Keep Home's `localeAlternates('/')` self-canonical behavior: `/` for Spanish,
  `/en` for English, with the existing bilingual `es`, `en`, and `x-default`
  alternates. If the migrated profile differentiator is selected for search
  copy, update Home metadata in both catalogs only; do not create About SEO
  metadata.
- Search and update tests/source assumptions for `id="content"`, About nav
  links, About sitemap entries, and old Home preview keys. Preserve the
  `#main-content` skip-link target; `#sobre-mi` is an in-page destination, not
  a replacement skip target.

## Accessibility and anchor behavior

- Use a real `section` with `id="sobre-mi"`, a meaningful `h2`, and an
  `aria-labelledby` relationship where appropriate.
- Apply the existing sticky-header offset convention (for example the
  project's validated `scroll-mt-*` value) directly to the target section.
  Do not depend on JavaScript scroll correction.
- Keep the target reachable through a native fragment and keyboard-operable
  links. The section may use `tabIndex={-1}` only to support explicit focus in
  tests/assistive navigation; it must not become an accidental tab-stop.
- Preserve alt text for the profile image, semantic lists/headings for areas and
  education, visible focus states for CV/contact links, and the existing
  obfuscated-email behavior.
- Verify the redirected landing does not leave the profile heading behind the
  sticky header and that the target is visible, discoverable, and focusable by
  keyboard/assistive technology.

## Tests and E2E coverage

### Component/integration

- Render Home in Spanish and English and assert the full profile contract:
  `id="sobre-mi"`, profile image, story, all technical areas, extended skills,
  education, availability/contact, and both CV action semantics.
- Assert the old compact Home journey/approach/experience duplicate is absent,
  and the profile copy is not rendered twice.
- Assert Home order and hero fallback target (`featured-projects` or
  `sobre-mi`) remain correct.
- Assert `MAIN_NAVIGATION` is exactly Projects, Blog, Contact and that localized
  Header/MobileMenu/Footer links do not expose About.
- Add focused tests for the pure redirect URL builder if extracted: both
  locales, no query, scalar query, repeated query keys, encoded values, and
  the final hash.
- Assert sitemap output has Home but neither About URL/alternate and that Home
  metadata retains localized canonical/hreflang behavior.

### Playwright/E2E

- Request `/sobre-mi` and `/en/sobre-mi` and assert the final response chain
  includes status 308, the correct localized `Location`, preserved query
  parameters, and `#sobre-mi`.
- Repeat for trailing-slash variants and assert no redirect loop.
- After following each redirect, assert the profile section and heading are
  visible, the URL has the expected locale/query/hash, and browser Back does
  not loop.
- Exercise fragment landing with the sticky header at desktop and mobile;
  assert the heading is not obscured and the target remains keyboard-focusable.
- Run Home accessibility checks in both locales: heading structure, image alt,
  list semantics, focus visibility, meaningful link names, and axe coverage.
- Run 320px and 200% reflow checks for no horizontal overflow, readable wrapped
  content, non-zero in-viewport CV/contact targets, and no overlap/clipping.
- Update existing navigation/footer expectations and remove tests that navigate
  About as an independent page. Browser/Sanity limitations must retain the
  repository's explicit `blocked` reporting contract rather than being marked
  as passed or silently skipped.

## Affected areas

| Area | Impact | Description |
|---|---|---|
| `app/[locale]/page.tsx` | Modified | Full profile composition, localized content consumers, stable anchor, responsive order, and profile image/CV/contact actions |
| `app/[locale]/(pages)/sobre-mi/page.tsx` | Modified | Server-side locale-aware 308 redirect with query preservation; remove page markup and metadata |
| `messages/es.json`, `messages/en.json` | Modified | Remove obsolete Home preview keys and update/add only keys required by the integrated profile; preserve About content keys if reused |
| `lib/constants/navigation.ts` | Modified | Remove `about`; retain exact Projects, Blog, Contact order |
| `app/sitemap.ts` | Modified | Remove redirecting About record and bilingual alternates |
| `lib/seo/alternates.ts`, Home metadata | Verified/possibly modified | Preserve Home canonical/hreflang; no About metadata surface |
| `components/layout/Header.tsx`, `MobileMenu.tsx`, `Footer.tsx` | Verified/likely unchanged | Shared consumers inherit the changed navigation constant and localized hrefs |
| `components/ui/Section.tsx`, `components/ui/CVButton.tsx`, `ObfuscatedEmail` | Verified/likely unchanged | Reuse existing anchor, CTA, image/contact, and focus patterns; change only if a focused invariant requires it |
| `__tests__/integration/app/HomePage.test.tsx` | Modified | Full profile, deduplication, anchor, order, locale assertions |
| `__tests__/integration/components/MobileMenu.test.tsx` and nav tests | Modified | Canonical three-item navigation |
| `e2e/tests/navigation.spec.ts`, `accessibility-interactions.spec.ts`, `accessibility.spec.ts` | Modified | Redirect, hash/query, back behavior, anchor accessibility, responsive/profile checks |
| `openspec/changes/integrate-about-home-pr2/proposal.md` | New | This proposal |

## Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Home becomes excessively long and review becomes difficult | High | Use one profile section with a clear desktop/mobile order; remove duplicate preview markup; keep tests adjacent to changed behavior and review the diff by content, redirect, SEO, and tests |
| LCP/CLS regression from profile media or long below-fold markup | Medium | Keep hero as the LCP candidate, set image dimensions, avoid `priority` below the fold, preserve safe lazy/content-visibility behavior, and run mobile performance/layout checks |
| Fragment lands beneath the sticky header | Medium | Apply measured `scroll-mt-*` to `#sobre-mi`; assert target heading geometry in Playwright |
| Query parameters are dropped or duplicate keys collapse | Medium | Build with repeated `URLSearchParams.append` entries and test encoded/repeated parameters |
| Redirect status is incorrectly asserted as 301 | Medium | Lock the contract to Next.js `permanentRedirect` → 308 and document the literal-301 alternative as separate scope |
| Locale routing or slash normalization breaks English/legacy links | Medium | Derive target from `[locale]`, test ES/EN and slash variants, and keep redirect outside the security proxy |
| Browser Back returns to the redirecting URL or loops | Low/Medium | Use default replace semantics and test direct navigation, followed redirect, and Back behavior |
| Home translation catalogs retain dead or duplicated keys | Medium | Search consumers before pruning; remove only obsolete Home preview keys and require ES/EN parity for new keys |
| Full profile increases visual and test review workload beyond budget | Medium | Forecast 450–650 changed lines; keep this as one PR2 slice under the 800-line budget. Split only if implementation exceeds the budget after removing nonessential catalog churn |

## Rollback plan

Revert the PR2 commit as one unit, restoring the prior Home preview, About page
rendering/metadata, About nav item, and sitemap entry. If an emergency partial
rollback is required, first restore the About route and its metadata, then
restore the shared nav/sitemap and finally the old Home section; do not leave
legacy links pointing at a missing route. The redirect helper and new E2E tests
can be removed with the route rollback. No database, CMS, API, or persisted
content migration is involved.

## Estimate and delivery shape

- **Production:** approximately 180–300 changed lines, mainly the Home profile
  composition and redirect route.
- **Tests/catalog/SEO:** approximately 220–350 changed lines.
- **Total forecast:** approximately **450–650 changed lines**.
- **Chain/split:** **No split recommended.** The behavior, redirect, SEO
  contract, and tests should ship as one PR2 slice so the migrated profile and
  its compatibility path are reviewed together. Re-forecast and split only if
  the actual diff threatens the 800-line ceiling; do not split tests away from
  the behavior they verify.

## Success criteria

- [ ] Home contains the complete localized About profile once, with photo,
  story/context, technical areas, extended skills, education, availability/
  contact, and CV download/view actions.
- [ ] Home profile is the only advertised About surface and uses stable,
  accessible `#sobre-mi` fragment behavior with sticky-header offset.
- [ ] `/sobre-mi` and `/en/sobre-mi` (including slash variants) return a
  locale-correct permanent 308 redirect, preserve query parameters, and land
  at the expected hash without a Back loop.
- [ ] Primary navigation is exactly Projects, Blog, Contact; Home remains on
  the logo; About URLs are absent from sitemap and independent metadata.
- [ ] Existing Projects, Blog, APiGen, Contact backend, privacy, and unrelated
  visual-token behavior are unchanged.
- [ ] Component and E2E suites cover both locales, redirect semantics, SEO,
  accessibility, sticky-anchor landing, and 320px/200% responsive behavior.
- [ ] `npm run test:run` and `npm run build` pass, with any unavailable browser
  or external environment reported as an explicit blocked limitation.

## Next step

Proceed to the delta specification phase. The spec should turn the locked
content inventory, redirect URL/status contract, navigation/SEO removals, and
responsive/accessibility checks above into Given/When/Then requirements.
