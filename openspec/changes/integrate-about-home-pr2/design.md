# Design: Integrate the Full About Profile into Home

Home becomes the only rendered profile surface. The existing About markup is
extracted into a server-rendered `AboutProfile` section and composed by the
localized home page; the old localized route becomes a query-preserving server
308 compatibility redirect. This keeps the PR2 boundary narrow while making the
content, navigation, SEO, and legacy URL behavior reviewable as one unit.

## Quick path

1. Extract the current complete About composition into `AboutProfile` and reuse
   it once below the Home divider.
2. Replace the About page body/metadata with a pure locale-aware redirect and
   preserve query entries with a small pure URL builder.
3. Remove About from shared navigation and sitemap, prune only proven-dead Home
   preview messages, then add strict unit/integration and E2E coverage.

## Current-state architecture

```text
Locale layout
  ├─ Header ── MAIN_NAVIGATION (About, Projects, Blog, Contact)
  ├─ main
  │   ├─ /[locale]                 Home preview (duplicated story/skills)
  │   └─ /[locale]/(pages)/sobre-mi  Full About page + metadata
  └─ Footer ── MAIN_NAVIGATION

Home ── getTranslations(Home) + getSanityProjects(locale)
About ── getTranslations(About) + local SKILLS_DATA + profile image
Sitemap ── / + /sobre-mi + /proyectos + other static/dynamic URLs
```

The two pages do not fetch the same remote data, but they render overlapping
copy and skill/profile information. The About route also owns an independent
canonical/alternate metadata surface and is advertised by the shared
navigation and sitemap.

## Target-state architecture

```text
Locale layout
  ├─ Header ── MAIN_NAVIGATION (Projects, Blog, Contact)
  ├─ main
  │   ├─ /[locale] ── Home metadata + Hero + FeaturedProjects + AboutProfile + Newsletter
  │   └─ /[locale]/(pages)/sobre-mi ── permanentRedirect(308)
  └─ Footer ── MAIN_NAVIGATION

Home ── getTranslations(Home) + getSanityProjects(locale)
        └─ AboutProfile ── getTranslations(About) + static SKILLS_DATA
Sitemap ── Home + Projects + retained public routes (no About URL/alternate)
```

`AboutProfile` is a server component, not a client boundary and not a new data
source. It owns the complete profile presentation and reuses `Section`,
`SkillsList`, `CVButton`, `ObfuscatedEmail`, `RevealOnScroll`, and `next/image`.
There is one `AboutProfile` instance on Home; the redirecting route never
renders it. No Sanity or database request is introduced by this change, and
`getSanityProjects(locale)` remains the sole Home project request.

## Architecture decisions

### Decision: Extract a server-rendered `AboutProfile` component

**Choice**: Create `components/sections/AboutProfile.tsx`, move the complete
About composition there, and render it once from `app/[locale]/page.tsx`.

**Alternatives considered**: Inline all 150+ lines into Home; retain the old
About page component and import it from Home; create a client component.

**Rationale**: The profile is a cohesive section with its own translation
namespace, content inventory, responsive order, and accessibility contract.
Extraction prevents `page.tsx` from becoming an unreviewable monolith and keeps
the existing reusable UI pieces intact. Importing the route page would couple
redirect behavior to presentation and metadata. A client component would add a
hydration boundary without interactive profile requirements.

### Decision: Keep profile content in the existing `About` catalog

**Choice**: `AboutProfile` reads `getTranslations('About')`; Home preview keys
are removed only after consumer search proves they are unused. Existing About
keys, dates, institutions, and locale-specific copy remain the source of truth.

**Alternatives considered**: Duplicate all About strings into `Home`; migrate
the profile into a new namespace; hardcode static labels in the component.

**Rationale**: The About catalog already contains the complete Spanish/English
content and preserves locale parity. Reusing it avoids translation drift and
unrelated catalog churn. User-facing strings remain message-driven per repo
convention.

### Decision: Use `permanentRedirect` with a pure query serializer

**Choice**: The existing localized page receives `params` and `searchParams`,
builds a relative localized target, and calls Next.js
`permanentRedirect(destination)`. This is intentionally HTTP 308, not a literal
301, client navigation, middleware branch, or security-proxy change.

**Alternatives considered**: `redirect` with a permanent flag, a client-side
router push, middleware/proxy logic, or a `next.config` redirect rule.

**Rationale**: The App Router's server API gives the required permanent 308
semantics and replacement navigation behavior while keeping locale knowledge in
the localized route. A pure builder is independently testable for repeated and
encoded query values. Keeping it out of middleware avoids affecting unrelated
paths and preserves the route's existing locale validation.

### Decision: Use a stable non-localized `sobre-mi` fragment

**Choice**: Both locales render exactly one `section#sobre-mi`; redirect targets
are `/#sobre-mi` and `/en#sobre-mi`.

**Alternatives considered**: Localized IDs (`#about-me`), a route-specific
fragment, or retaining `#content`.

**Rationale**: Existing links and the product contract require a stable anchor
across locales. A meaningful `h2` is associated with the section using
`aria-labelledby`; `#main-content` remains the global skip target.

### Decision: Do not apply content-visibility to the fragment section

**Choice**: The migrated profile may retain normal reveal animation markup but
the target section itself is not hidden behind `content-visibility-auto`.
Apply the established `scroll-mt-24` offset to the section/heading target.

**Alternatives considered**: Keep Home's `content-auto` class unchanged or add
JavaScript scroll correction after redirect.

**Rationale**: Native fragments must land on a real, immediately discoverable
heading below the sticky 4rem header. CSS offset is deterministic and works
without JavaScript; avoiding content visibility prevents delayed fragment
geometry. The existing blog heading convention uses `scroll-mt-24`, which is
the repository's validated offset convention.

## Data flow and request behavior

### Home render

```text
/[locale]
  ├─ setRequestLocale(locale)
  ├─ Promise.all(getTranslations(Home), getSanityProjects(locale))
  ├─ selectFeaturedProjects(projects)
  ├─ Hero scroll target = featured-projects || sobre-mi
  └─ <AboutProfile />
       ├─ getTranslations(About) [server/request scoped; no network fetch]
       ├─ SKILLS_DATA (static module constant)
       ├─ CVButton → locale-specific resume/API and /cv links
       └─ ObfuscatedEmail → existing email behavior
```

`AboutProfile` does not call Sanity, Prisma, or an API. Home calls the project
loader once and passes its selected projects to `FeaturedProjects`; it does not
reload profile data. The two translation namespace lookups are request-scoped
server work, not duplicated content fetches. If a future CMS-backed profile is
introduced, the component boundary should accept the already-loaded profile
model rather than fetch it from both Home and a route.

### Legacy redirect

```text
GET /sobre-mi?tag=a&tag=b&empty=
        │ params.locale=es, searchParams resolved
        ▼
buildAboutRedirect('es', params)
        │ URLSearchParams.append for every string/string[] value
        ▼
permanentRedirect('/?tag=a&tag=b&empty=#sobre-mi')  ── HTTP 308

GET /en/sobre-mi?...  ──► permanentRedirect('/en?...#sobre-mi')  ── HTTP 308
```

Fragments are never sent to the server, so an incoming fragment cannot be
preserved; the destination fragment is deliberately fixed to `sobre-mi`.
`searchParams` values are appended individually, including repeated keys and
empty strings. `URLSearchParams` performs safe encoding and preserves semantic
values/multiplicity. A missing value is omitted only when Next represents it as
`undefined`.

### Exact redirect contract

The redirect route should expose a testable helper with this contract (the
implementation may use a type alias local to the route or a nearby utility):

```ts
type AboutRedirectParams = Record<string, string | string[] | undefined>;

function buildAboutRedirect(locale: string, params: AboutRedirectParams): string {
  const path = locale === 'en' ? '/en' : '/';
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    for (const entry of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(key, entry);
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return `${path}${suffix}#sobre-mi`;
}
```

The page awaits both `params` and `searchParams`, calls the helper with the
resolved locale, and immediately calls `permanentRedirect`. The path uses no
trailing slash because the repository leaves `trailingSlash` at Next's default
(`false`). `/sobre-mi/` and `/en/sobre-mi/` must be exercised through the
repository's normal route normalization; if Next emits a preliminary slash
normalization response, the final application redirect must still be the
localized 308 target above, with no loop and no rendered About document.

## Profile composition and responsive contract

`AboutProfile` keeps this DOM reading order at every width:

1. Profile intro/photo and filled CV split action.
2. Full story/context (the two `About.story*` paragraphs).
3. Work principles (the complete `About.work1`, `About.work2`, and new
   localized `About.work3` tests/observability proof; do not reintroduce the
   old “less chrome” bullet).
4. Seven technical areas.
5. Backend, Frontend, Databases, and DevOps & Tools from `SKILLS_DATA`.
6. Five-item education/certification timeline.
7. Location, availability, obfuscated email, Contact route/action, and outline
   CV split action.

Use the existing desktop `lg:grid-cols-3` composition with the complete profile
on the primary column and skills/education/contact on the secondary column, but
keep the source/DOM order above so mobile is naturally single-column. Cards use
wrapping content and no fixed heights. The profile image keeps explicit
`220x220` intrinsic dimensions, `loading="lazy"`/non-priority behavior, and the
existing rounded styling; it is below the hero and must not compete for LCP.
`CVButton` remains the source of the distinct download (`<a download>`) and view
(`/cv`) actions, resolving the active locale through its existing server logic.

## File-by-file changes

| File | Action | Design responsibility |
|---|---|---|
| `components/sections/AboutProfile.tsx` | Create | Server-only profile section; extract current About content, use `About` translations, full `SKILLS_DATA`, `CVButton`, `ObfuscatedEmail`, profile image, semantic lists/timeline, `id="sobre-mi"`, `aria-labelledby`, `scroll-mt-24`, and responsive order. |
| `app/[locale]/page.tsx` | Modify | Remove Home preview markup and `SKILLS_DATA_HOME`; import/render one `AboutProfile`; change no-feature fallback from `content` to `sobre-mi`; retain Home metadata, hero, featured projects, divider, and newsletter order. |
| `app/[locale]/(pages)/sobre-mi/page.tsx` | Modify | Remove About JSX and `generateMetadata`; resolve locale/search params and invoke the pure builder plus `permanentRedirect` for localized 308 compatibility. |
| `lib/constants/navigation.ts` | Modify | Change `MAIN_NAVIGATION` to exactly `projects`, `blog`, `contact`, in that order. |
| `messages/es.json` | Modify | Remove `Nav.about` and obsolete Home preview keys only after consumer search; add the localized `About.work3` tests/observability principle and preserve the complete profile labels. |
| `messages/en.json` | Modify | Mirror Spanish catalog shape/removals; add the equivalent English `About.work3` value and preserve locale parity. |
| `app/sitemap.ts` | Modify | Delete the `/sobre-mi` static entry and its bilingual alternates; do not emit a fragment URL. Keep Home, Projects, blog, Contact, CV, privacy, data request, newsletter, and dynamic records unchanged. |
| `__tests__/integration/app/HomePage.test.tsx` | Modify | Assert one complete profile, stable anchor/order/fallback, locale content, and absence of obsolete compact preview. |
| `__tests__/integration/components/MobileMenu.test.tsx` | Modify | Assert exact three-item shared navigation and preserve dialog focus behavior. Update its fixture navigation to the final set. |
| `__tests__/unit/lib/about-redirect.test.ts` (or repository-equivalent focused test path) | Create | Test pure redirect builder for ES/EN, no query, scalar/repeated/encoded/empty values, and exact hash/path serialization. |
| `__tests__/integration/app/SobreMiRedirect.test.tsx` (or repository-equivalent route test) | Create | Assert route invokes the redirect contract and does not render metadata/profile markup. |
| `__tests__/integration/app/Sitemap.test.ts` (or existing sitemap test location) | Create/modify | Assert About URLs/alternates/fragments are absent while Home canonical surface and retained routes remain. |
| `e2e/tests/navigation.spec.ts` | Modify | Remove About as a primary nav step; assert exact nav/footer sets, logo Home behavior, legacy redirects, 308 Location/query/hash, slash variants, and Back behavior in ES/EN. |
| `e2e/tests/accessibility-interactions.spec.ts` | Modify | Add fragment landing, sticky-header geometry, keyboard target, profile action minimum targets, and 320px/200% profile overflow/reflow checks in both locales. |
| `e2e/tests/accessibility.spec.ts` | Modify | Include the integrated profile in axe/heading/image/link semantics where the existing suite owns those checks. |
| `e2e/tests/quick-stats.spec.ts` and stale source assertions | Modify/remove as applicable | Remove obsolete Quick Stats/About-preview assumptions only where they assert the pre-PR2 contract; do not broaden the product change. |
| `components/layout/Header.tsx`, `MobileMenu.tsx`, `Footer.tsx` | Verify, likely unchanged | All already consume `MAIN_NAVIGATION`; update only if tests reveal a consumer-specific About assumption. |
| `lib/seo/alternates.ts` and Home metadata | Verify, likely unchanged | Preserve `/` and `/en` self-canonical and `es`, `en`, `x-default` alternates; do not add a fragment or About metadata. |

No changes are planned to Projects, Blog, APiGen privacy/featured behavior,
Contact server actions/form validation/rate limits, CV generation, Sanity
schemas/data, middleware/security proxy, or visual tokens.

## SEO and internal-link contract

- Home remains the canonical bilingual profile document: Spanish canonical `/`,
  English canonical `/en`, and existing `es`, `en`, `x-default` alternates from
  `localeAlternates('/')`.
- The redirecting About page emits no `generateMetadata`, About title,
  description, canonical, or hreflang. The 308 response must not be treated as a
  second indexable document.
- Sitemap retains Home and `/proyectos` plus existing non-About routes and
  dynamic records; it removes `/sobre-mi`, `/en/sobre-mi`, their alternates, and
  any `#sobre-mi` URL.
- Shared Header/mobile/footer navigation has no About route. The logo remains
  the locale-aware Home link. In-page profile links, if existing consumers need
  one, use `#sobre-mi` on the active Home route rather than a legacy URL.
- The language switcher remains unchanged; preserving a fragment across locale
  switching is explicitly outside PR2 unless an existing test exposes a
  regression that can be fixed without changing product behavior.

## Accessibility, anchor, image, and sticky-header handling

- Render one real `<section id="sobre-mi" aria-labelledby="about-profile-heading">`
  with a meaningful `h2`/`SectionTitle` carrying that ID. `#main-content` and
  all localized skip-link labels remain unchanged.
- Apply `scroll-mt-24` to the fragment section (or its associated heading if
  needed by the final DOM) and verify the heading's bounding rectangle is below
  the sticky 4rem Header after native fragment navigation.
- Do not add `tabIndex` unless the implementation needs `-1` for explicit
  fragment-focus testing; never turn the whole section into a normal tab stop.
- Preserve meaningful profile-image alt text, semantic `ul`/timeline structure,
  visible focus states, keyboard-operable CV/contact links, and the current
  obfuscated email behavior.
- Keep the profile image dimensions explicit and lazy/non-priority. Do not add
  a client-side scroll handler. The profile section is not content-visibility
  delayed, so a redirected browser can locate the heading immediately.

## Interfaces / contracts

```ts
// Route input supplied by the Next.js 16 App Router.
type LegacyAboutPageProps = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

// Pure, side-effect-free contract used by route and unit tests.
type AboutRedirectParams = Record<string, string | string[] | undefined>;
declare function buildAboutRedirect(locale: string, params: AboutRedirectParams): string;

// Observable examples:
buildAboutRedirect('es', {});
// "/#sobre-mi"
buildAboutRedirect('en', { tag: ['a', 'b'], empty: '' });
// "/en?tag=a&tag=b&empty=#sobre-mi"
```

`AboutProfile` has no client props and no remote-data props in this change; its
server component contract is `async function AboutProfile(): Promise<ReactNode>`
(or equivalent JSX-returning server component). If a test-friendly translation
injection is necessary, inject only a typed translation interface; do not add a
second profile data loader.

## Testing strategy (strict TDD)

Implement in RED-GREEN-REFACTOR order and run `npm run test:run` as the strict
gate. Tests must use semantic roles/names and stable IDs/contracts rather than
incidental icon or class markup.

| Layer | What to test | Approach |
|---|---|---|
| Unit | Redirect URL construction | Pure helper tests for `/` vs `/en`, no query, scalar values, repeated keys, encoded names/values, empty values, and exact final `#sobre-mi`; assert no accidental slash or fragment in query. |
| Integration | Home composition | Render ES and EN Home with mocked project data; assert one `section#sobre-mi`, profile image, two story paragraphs, 3 work principles (including the new localized `About.work3` proof), 7 areas, 4 skill groups, 5 education items, availability/email/contact, and both CV semantics. Assert old Home journey/approach/reduced-skill/experience text is not duplicated. |
| Integration | Locale parity | Compare category/item counts and assert English output has no Spanish fallback/missing keys; verify Spanish paths remain prefix-less and English paths retain `/en`. |
| Integration | Navigation | Assert `MAIN_NAVIGATION` exactly equals `['projects', 'blog', 'contact']`; update Header/MobileMenu/Footer consumer expectations and preserve logo/skip-link behavior. |
| Integration | Redirect route | Mock/inspect `permanentRedirect` and assert resolved ES/EN targets, no rendered JSX/metadata, and all query entries are passed to the builder. |
| Integration | SEO | Invoke sitemap with isolated fetch mocks and assert no About URL, alternate, or fragment; assert Home metadata keeps canonical/alternate behavior. |
| E2E | HTTP redirect | Use Playwright `request` with redirect following disabled to assert status 308 and exact `Location` for both locales, repeated/encoded/empty queries, and final hash. Test `/sobre-mi/` and `/en/sobre-mi/` through the normal redirect chain with no loop. |
| E2E | Landing/history | Follow each redirect in a browser, assert final locale/query/hash, visible profile heading below sticky header, native/keyboard fragment access, and browser Back does not loop or expose an independent About page. |
| E2E | Responsive/accessibility | ES/EN at 320px and the existing 200% effective-width procedure: no horizontal overflow, specified reading order, no clipping/overlap, usable CV/contact targets, image alt, heading/list semantics, visible focus, and axe results. |
| Regression | Out-of-scope routes | Run focused Projects, blog, APiGen privacy/featured, Contact, CV, and existing navigation suites; do not alter contact backend assertions. |

Unavailable browsers, portfolio server, or required Sanity prerequisites must
use the repository's typed `blocked` reporting contract with the exact reason.
They do not count as passes or coverage, while genuine assertion failures stay
failures.

## Review workload forecast

| Area | Estimated changed lines |
|---|---:|
| Profile extraction/Home composition | 180–260 |
| Redirect helper/route and navigation/SEO | 70–120 |
| Message catalog cleanup | 20–60 |
| Unit/integration/E2E updates | 220–330 |
| **Total forecast** | **490–770** |

The **800-line ceiling is feasible but close**; the **400-line review burden is
exceeded** if tests and behavior are counted together. No split is recommended:
the redirect, canonical Home surface, and compatibility tests must be reviewed
together to prove no legacy SEO/navigation gap. Keep the profile extraction and
its tests in the same PR2 slice, avoid unrelated formatting/catalog churn, and
re-forecast before implementation if the diff exceeds 700 lines. Split only if
the actual diff threatens 800 lines, with the first slice preserving the full
profile/anchor and the second slice adding only nonessential browser coverage;
never split tests away from the behavior they verify as the default plan.

## Migration, rollout, and rollback

No database, CMS, API, or persisted-content migration is required. Roll out as
one PR2 deployment after strict tests, type-check, build, and available E2E
checks pass. Monitor redirect responses, Home error rates, and image/layout
regressions after deployment.

Rollback is a single revert restoring the previous Home preview, About page body
and metadata, About nav item, and sitemap record. If a partial emergency rollback
is unavoidable, restore the About page and metadata first, then restore shared
navigation/sitemap, and finally remove the Home integration; never leave visible
legacy links pointing at an absent or incompatible target. No data rollback is
needed.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Home becomes too long or review exceeds budget | One extracted profile section, explicit mobile order, deduplicate rather than append, and keep the 800-line forecast gate. |
| Duplicate translations or profile data drift | Keep complete content in `About`, remove only searched-unused Home keys, and make one `AboutProfile` consumer with no remote loader. |
| Query multiplicity/encoding is lost | Append every `string[]` entry to `URLSearchParams`; test repeated, encoded, and empty values against the `Location` header. |
| Slash normalization causes two redirects or a loop | Do not add middleware/config branches; test both slash variants and assert final localized destination/history behavior. |
| 308 is mistaken for 301 | Document and test `permanentRedirect`'s 308 contract; literal 301 remains separate infrastructure scope. |
| Fragment lands under sticky Header | Use `scroll-mt-24`, no delayed content visibility, and assert heading geometry in both locales/viewport classes. |
| Profile image affects LCP/CLS | Preserve intrinsic dimensions, remove `priority`, use lazy loading below Hero, and run responsive/performance checks. |
| Existing route regressions are hidden by blocked E2E prerequisites | Preserve typed blocked reporting and run all available strict/static tests independently. |

## PR2 boundary and acceptance checklist

This design covers **only PR2 of Option A**: full About integration into Home,
the exact three-item primary navigation, legacy About 308 compatibility,
sitemap/metadata cleanup, and their validation. It does not introduce further
product changes, redesign Projects/Blog/Contact, change APiGen privacy, alter
the contact backend, or add a new localization strategy.

- [ ] Home renders the complete localized profile exactly once.
- [ ] `section#sobre-mi` is accessible, sticky-header-safe, and not the skip-link target.
- [ ] `/sobre-mi` and `/en/sobre-mi`, including slash variants, end in localized 308 redirects with query fidelity and `#sobre-mi`.
- [ ] Navigation is exactly Projects, Blog, Contact; logo remains Home.
- [ ] About sitemap/metadata surfaces are removed; Home canonical/hreflang remains bilingual.
- [ ] Projects, Blog, APiGen, Contact backend, CV, and Sanity behavior are unchanged.
- [ ] Strict TDD, integration, E2E, accessibility, responsive, redirect, and blocked-report contracts are covered.

## Open questions

None. The product decisions and the 308/query/trailing-slash behavior are
locked by the proposal and delta specification.
