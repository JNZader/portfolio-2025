# Delta for UI, navigation, and legacy About compatibility

This delta makes the localized home document the only rendered About profile
surface. It does not change the information architecture or project data of
`/proyectos`; the legacy About paths remain compatibility entry points only.

## ADDED Requirements

### Requirement: Home renders one complete localized About profile

The localized home page MUST render the complete About profile once, in Spanish
and English, including the profile photo and introduction, the complete story
and context, work principles, all seven technical areas, the full Backend,
Frontend, Databases, and DevOps & Tools skill groups, the five-item education
and certification timeline, Córdoba/location, availability, obfuscated email,
contact action, and the two intentional CV action locations (download/view
semantics). The implementation MUST use localized catalog content and MUST NOT
append the old compact preview beside the migrated profile.

#### Scenario: Spanish home exposes the complete profile contract

- GIVEN the Spanish home page is rendered with its normal data dependencies
- WHEN the home profile is inspected by semantic headings, image, lists, links,
  and localized text
- THEN the complete Spanish profile is present exactly once
- AND the photo, story, seven areas, extended skills, education, availability,
  contact action, and both CV action locations are discoverable

#### Scenario: English home exposes equivalent profile content

- GIVEN the English home page is rendered
- WHEN the profile content and accessible names are inspected
- THEN the English profile has the same content categories and item counts as
  Spanish
- AND its visible copy, CV labels, contact labels, and profile introduction are
  English rather than missing-message keys or hardcoded Spanish

#### Scenario: Old compact preview is deduplicated

- GIVEN the integrated profile has been rendered
- WHEN the document text and profile headings are counted
- THEN the old `journey*`, `approach*`, reduced Home skills, and compact
  experience preview are not rendered as a second profile
- AND canonical story/context copy is not duplicated elsewhere on Home

### Requirement: Stable About fragment and accessible sticky-header landing

The full profile MUST be a semantic `section` with stable `id="sobre-mi"` and
a meaningful associated heading, using the repository's sticky-header offset
convention. The existing `#main-content` skip-link target MUST remain unchanged;
`#sobre-mi` is an in-page destination and MUST NOT replace the skip target. The
fragment target MUST be reachable through native keyboard-operable links, and
the profile section MAY be programmatically focusable for fragment testing only
without becoming an unintended tab stop.

#### Scenario: Home exposes the stable profile target

- GIVEN either localized home page is loaded
- WHEN a native link or URL targets `#sobre-mi`
- THEN exactly one profile section with that ID exists
- AND its meaningful heading identifies the About/profile content
- AND the section's scroll position leaves the heading visible below the sticky
  header

#### Scenario: Skip links preserve their existing contract

- GIVEN Spanish or English skip links are rendered
- WHEN the user queries their localized names and activates the main-content
  link with the keyboard
- THEN the existing localized skip-link labels and `#main-content` destination
  remain available
- AND no skip link is silently redirected to `#sobre-mi`

#### Scenario: Fragment landing remains accessible

- GIVEN a user follows a native `#sobre-mi` link with keyboard navigation
- WHEN focus and the target section are inspected after navigation
- THEN the profile heading and section are visible and discoverable
- AND no decorative image, animation, or hidden content prevents access to the
  target

### Requirement: Responsive profile composition and action behavior

The profile MUST preserve a readable single-column-first order on narrow
screens: introduction/photo/CV, story, work principles, technical areas,
skills, education, contact/availability, and the lower CV action. At wider
screens it MAY use the existing two-column composition, but cards MUST wrap
naturally, MUST NOT use fixed-height clipping, and MUST NOT introduce horizontal
overflow at 320px or 200% reflow. The below-hero profile image MUST have
explicit dimensions and MUST NOT be promoted to the page's LCP candidate. CV
download and view actions MUST remain distinct, visible, keyboard-operable, and
localized; contact MUST remain a route/action rather than an embedded duplicate
contact form.

#### Scenario: Mobile reading order is preserved

- GIVEN either locale home is rendered at 320px wide
- WHEN the profile regions and action rectangles are measured
- THEN the regions appear in the specified reading order
- AND text wraps without clipping, overlap, or horizontal scrolling
- AND both CV semantics and the contact action have non-zero usable targets

#### Scenario: Two-hundred-percent reflow remains usable

- GIVEN either locale home is rendered using the repository's 200% effective
  width procedure
- WHEN document overflow, text descendants, and interactive rectangles are
  inspected
- THEN the document has no change-caused horizontal overflow
- AND profile text, CV actions, and contact action remain readable, reachable,
  and non-overlapping

#### Scenario: Profile media does not displace hero performance

- GIVEN the profile image is below the existing hero
- WHEN its rendered image attributes and layout behavior are inspected
- THEN explicit intrinsic dimensions are present
- AND the image is non-priority/lazy according to the existing image contract
- AND fragment landing still reveals the profile heading without waiting for a
  hidden or content-visibility-delayed section

### Requirement: Locale parity and route path semantics

The profile and all in-page actions MUST preserve the existing locale model:
Spanish is prefix-less and English uses `/en`. Localized Home, profile links,
CV actions, contact actions, and legacy redirect destinations MUST use the
active locale. The Spanish-only blog strategy MUST remain unchanged.

#### Scenario: Spanish paths remain prefix-less

- GIVEN a user is on the Spanish home page
- WHEN profile CV, contact, project, and blog links are inspected
- THEN localized destinations use the existing prefix-less Spanish paths
- AND no English `/en` prefix is introduced

#### Scenario: English paths retain the locale prefix

- GIVEN a user is on `/en`
- WHEN profile CV, contact, project, blog, and in-page links are inspected
- THEN route destinations retain `/en` where the existing locale convention
  requires it
- AND the profile's stable fragment remains `#sobre-mi` rather than becoming a
  second localized fragment identifier

### Requirement: Legacy About routes permanently redirect with query fidelity

`/sobre-mi` and `/en/sobre-mi` MUST no longer render independent page content.
Each MUST perform a server-side permanent HTTP **308** redirect to the localized
home profile target: `/#sobre-mi` for Spanish and `/en#sobre-mi` for English.
Every incoming query entry MUST be preserved safely, including repeated keys,
encoded names/values, and empty values. The redirect MUST use replacement
navigation semantics compatible with browser Back behavior; it MUST NOT be a
client-only redirect or a new security-proxy branch. Trailing-slash variants
MUST resolve to the same locale-correct redirect under the repository's route
normalization.

#### Scenario: Spanish legacy route redirects permanently

- GIVEN a request is made to `/sobre-mi` without a query string
- WHEN the response headers are inspected without hiding the redirect
- THEN the response status is 308
- AND `Location` targets `/#sobre-mi`
- AND the response does not contain an independently rendered About document or
  About metadata surface

#### Scenario: English legacy route redirects permanently

- GIVEN a request is made to `/en/sobre-mi`
- WHEN the redirect response is inspected
- THEN the response status is 308
- AND `Location` targets `/en#sobre-mi`
- AND the locale is not downgraded to Spanish

#### Scenario: Repeated and encoded queries are preserved

- GIVEN `/sobre-mi` or `/en/sobre-mi` is requested with scalar, repeated,
  encoded, and empty query parameters
- WHEN the `Location` header is parsed as a URL
- THEN all query entries and their values are preserved in their original
  multiplicity and meaning
- AND the final fragment is exactly `sobre-mi`

#### Scenario: Slash variants and browser Back are stable

- GIVEN a browser opens `/sobre-mi/` or `/en/sobre-mi/`, follows the redirect,
  and then invokes Back
- WHEN the navigation history and response chain are inspected
- THEN the slash variant reaches the corresponding localized Home fragment
  without a redirect loop
- AND Back does not loop between the legacy path and Home or expose an
  independently rendered About page

### Requirement: Primary navigation has the exact final set and logo Home behavior

The shared `MAIN_NAVIGATION` contract MUST contain exactly, and in order,
Projects, Blog, and Contact. Header, mobile menu, and footer consumers MUST
inherit this set in both locales. No visible primary-navigation item MAY link
to `/sobre-mi` or `/en/sobre-mi`. The logo MUST remain a locale-aware link to
Home and Home MUST NOT be added as a fourth navigation item.

#### Scenario: Desktop navigation exposes exactly three items

- GIVEN either localized desktop page is rendered
- WHEN the primary navigation links are queried by role and order
- THEN the exact set is Projects, Blog, Contact
- AND there is no About link or extra Home/Inicio item

#### Scenario: Mobile menu and footer share the same set

- GIVEN the mobile menu or footer is opened/rendered in either locale
- WHEN their navigation links are inspected
- THEN the shared visible primary set remains Projects, Blog, Contact
- AND the logo activates the locale-correct Home route

### Requirement: Sitemap and metadata make Home the canonical profile surface

The sitemap MUST omit `/sobre-mi`, `/en/sobre-mi`, and any About alternate; it
MUST NOT add a URL containing a fragment. The redirecting legacy page MUST NOT
emit independent About title, description, canonical, or hreflang metadata. Home
MUST retain its locale-aware self-canonical metadata and existing `es`, `en`,
and `x-default` alternates. No SEO change MAY make `/proyectos` or the blog
strategy appear to be part of the About migration.

#### Scenario: Sitemap excludes redirecting About URLs

- GIVEN sitemap generation completes, including available dynamic data
- WHEN static URLs and alternates are inspected
- THEN Home and `/proyectos` remain represented
- AND neither About path nor an About alternate or fragment URL is present

#### Scenario: Home metadata remains bilingual and self-canonical

- GIVEN Spanish and English Home metadata are generated
- WHEN canonical and language alternate fields are inspected
- THEN Spanish canonicalizes to `/`, English to `/en`, and existing `es`, `en`,
  and `x-default` alternates remain
- AND no independent About metadata is generated by the redirecting route

### Requirement: Out-of-scope surfaces do not regress

This change MUST NOT alter `/proyectos` information architecture or project
data, the Spanish-only blog/content strategy, APiGen privacy or featured-project
behavior, the contact backend/form validation/rate limits, CV generation, or
Sanity schema/data behavior. Any shared navigation consumption MUST preserve
the existing destinations and semantics of those surfaces.

#### Scenario: Projects, blog, APiGen, and contact remain available

- GIVEN the PR2 Home and navigation changes are deployed
- WHEN a user visits Projects, the blog, APiGen privacy/featured-project
  surfaces, and Contact
- THEN each surface retains its existing route, content strategy, and relevant
  action behavior
- AND `/proyectos` information architecture is unchanged

#### Scenario: Contact backend remains unchanged

- GIVEN a valid or invalid contact submission is made through the existing
  contact route
- WHEN server validation, rate limiting, and action behavior are exercised
- THEN the existing backend contract remains unchanged
- AND Home contains no second contact form or new persistence/API behavior

### Requirement: Focused automated validation reports real coverage honestly

The implementation MUST add or update unit/integration coverage for both
locales, complete profile content and deduplication, anchor/skip-link behavior,
exact navigation, redirect URL construction, 308/query/hash semantics, sitemap,
metadata, and non-regressions. Playwright MUST cover redirect response chains,
trailing slashes, browser Back, sticky-header-safe fragment landing, keyboard
focus, accessibility semantics, 320px, and 200% reflow. Tests MUST prefer
semantic role/name and stable structural assertions over incidental CSS or icon
markup. Missing browser executables, unavailable portfolio server, or required
Sanity prerequisites MUST be reported as typed `blocked` results with exact
reasons, excluded from pass and coverage counts; genuine implementation
failures MUST remain failures. `npm run test:run` is the strict TDD test gate.

#### Scenario: Static and integration suite verifies both locales

- GIVEN the focused unit/integration suite runs
- WHEN Home, navigation, redirect builder/route, sitemap, metadata, and message
  catalogs are tested
- THEN Spanish and English profile contracts, exact nav order, query multiplicity,
  308 destination semantics, SEO removals, and non-regressions are asserted
- AND obsolete independent About-page assumptions are removed or updated

#### Scenario: Browser suite verifies interaction and responsive behavior

- GIVEN a configured browser and portfolio server are available
- WHEN Playwright runs the Home and legacy-route scenarios in both locales
- THEN it verifies response status/Location, final hash/query, no Back loop,
  sticky-header-safe visibility, keyboard focus, accessibility, no overflow at
  320px, and usable 200% reflow targets

#### Scenario: Browser limitation is explicitly blocked

- GIVEN a browser executable, portfolio server, or required external test
  prerequisite is unavailable
- WHEN the focused browser test attempts the affected scenario
- THEN the result is recorded as `blocked` with the exact browser/server or
  prerequisite reason
- AND it is excluded from passed coverage while available static tests still run
- AND an actual assertion or implementation failure is not relabeled as blocked

## REMOVED Requirements

### Requirement: Independent rendered About page

(Reason: The full About profile is now rendered on Home, while legacy `/sobre-mi`
and `/en/sobre-mi` are compatibility redirects. The old page body, independent
metadata, canonical, hreflang, and sitemap surfaces MUST be removed; the route
MUST NOT become a second rendered profile.)

### Requirement: About as a primary navigation destination

(Reason: The final primary navigation is intentionally limited to Projects, Blog,
and Contact. Home is reached through the logo and the profile through the
`#sobre-mi` in-page target or legacy compatibility links.)

## Scope boundary

The delta changes the profile surface and legacy compatibility behavior only.
It is explicitly **not** a change to `/proyectos` information architecture,
project data, blog localization strategy, APiGen privacy, or contact backend
behavior.
