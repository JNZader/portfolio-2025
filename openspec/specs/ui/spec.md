# Project Conversion Specification

## Purpose

Define the observable homepage, CV, and project-card behavior that closes the APiGen conversion gap without introducing a second project-content flow. This specification is written in English for implementation and review; user-facing text remains localized in `messages/es.json` and `messages/en.json`.

## Requirements

### Requirement: Localized APiGen featured-project CTA

The homepage MUST render exactly one APiGen link: a locale-aware link whose visible content and accessible name are the complete localized `apigenCaption`. It MUST preserve bold APiGen text, route Spanish to `/proyectos/apigen` and English to `/en/proyectos/apigen`, and be outside and adjacent to `aria-hidden="true"` `HeroTerminal`. No separate APiGen homepage case-study/repository action, obsolete key, or action wrapper MAY remain. Existing homepage social-profile links are unrelated and remain unchanged. (Previously: named case-study and optional repository actions were separate.)

#### Scenario: Whole-caption localized link
- GIVEN either locale homepage is rendered
- WHEN links are queried by role and the caption is inspected
- THEN exactly one APiGen link has the complete caption as visible name and locale-aware href
- AND its bold APiGen fragment is preserved and it is outside `HeroTerminal`

#### Scenario: Homepage actions are simplified
- GIVEN the APiGen highlight is rendered
- WHEN interactive elements and message consumers are inspected
- THEN no APiGen homepage button, APiGen repository link, `featuredProject` contract, or obsolete key exists

### Requirement: Case-study GitHub discoverability

The APiGen case-study page MUST retain its named, canonical, safe external GitHub link. This change MUST NOT alter `ProjectDetail` or repository data.

#### Scenario: Repository access remains available
- GIVEN the user follows the localized whole-caption link to the APiGen case study
- WHEN case-study actions are inspected
- THEN a named GitHub link remains discoverable with its destination and safe `target`/`rel`

### Requirement: Caption accessibility and layout contract

The caption link MUST be keyboard-operable in logical order, have a visible non-color focus cue, remain outside the terminal, and remain readable and in-viewport at 320px and 200% reflow without horizontal scrolling. `HeroTerminal` MUST retain `aria-hidden="true"`, replay/scroll behavior, and no focusable descendants; reduced-motion users MUST receive stable output and the usable link.

#### Scenario: Focus and reduced motion
- GIVEN a keyboard user or `prefers-reduced-motion: reduce` user reaches the hero
- WHEN the user tabs or the page loads before timers advance
- THEN the link is visible/focusable with a visible indicator, stable terminal output is available, and no terminal descendant receives focus

#### Scenario: 320px and 200% reflow
- GIVEN either locale is tested at 320px and the established 200% effective-width procedure
- WHEN the hero is inspected
- THEN `scrollWidth <= clientWidth`, the complete link has a non-zero in-viewport box, and its text is not clipped or overlapped

### Requirement: Focused validation and environment reporting

Component and Playwright coverage MUST assert localized names, both destinations, rich bold text, sole-link semantics, terminal exclusion, keyboard activation, reduced motion, layout, and obsolete-key absence. Unavailable browsers or Sanity prerequisites MUST be `blocked` with the exact reason, distinct from passed/failed/skipped and excluded from coverage; available static tests still run.

#### Scenario: Validation is honest
- GIVEN a configured browser executable or required Sanity variable/data is unavailable
- WHEN the focused suite runs
- THEN the check is `blocked` with browser/fetch or variable reason and claims no coverage

### Requirement: Decorative HeroTerminal boundary and motion behavior

`HeroTerminal` MUST retain an `aria-hidden="true"` root boundary. No focusable or interactive descendant MAY be added to it. The existing scroll behavior MUST be preserved by its ref-driven `scrollTop` updates; removal of `tabIndex={-1}` is the selected resolution of the focus-boundary conflict because scrolling does not require keyboard focus or a `tabindex` attribute. No implementation MAY call `.focus()` on the terminal or any descendant.

Reduced-motion users MUST receive the complete stable terminal content without requiring replay animation, and the adjacent APiGen caption link MUST remain visible, focusable, and operable regardless of motion preference.

#### Scenario: Reduced-motion user sees usable featured content

- GIVEN the user agent reports `prefers-reduced-motion: reduce`
- WHEN the homepage loads before any timer is advanced
- THEN the terminal contains the stable completion marker `Generation complete — 199 files`
- AND the terminal contains the final stable output
- AND `getByRole('link', { name: 'Ver caso de estudio de APiGen' })` (or the English equivalent) is visible and focusable
- AND the terminal has no descendant matching `a,button,input,select,textarea,[tabindex]`

#### Scenario: Motion-enabled user receives the existing replay

- GIVEN the user agent does not request reduced motion
- WHEN the homepage loads
- THEN the existing terminal replay may animate as before
- AND the adjacent CTA is available without waiting for replay completion or entering the terminal boundary
- AND the ref-driven auto-scroll still updates while the replay runs

### Requirement: Explicit CV eye action means CV navigation

The eye segment of the split CV control MUST be a localized navigation link to the CV page, not a project preview, modal trigger, or download action. Its accessible and visible-or-assistive name MUST clearly communicate “view CV” in Spanish and English without relying on hover or the icon alone. The existing PDF download segment MUST remain separate.

#### Scenario: Spanish user identifies and opens the CV page

- GIVEN the Spanish homepage renders the split CV control
- WHEN a user queries links by accessible name
- THEN the eye segment is named as viewing the CV in Spanish
- AND activating it navigates to `/cv`
- AND it does not open a modal or download the PDF

#### Scenario: English user identifies and opens the CV page

- GIVEN the English homepage renders the split CV control
- WHEN a user queries links by accessible name
- THEN the eye segment is named as viewing the CV in English
- AND activating it navigates to `/en/cv`
- AND it does not open a modal or download the PDF

#### Scenario: CV download and view remain distinct

- GIVEN both halves of the split CV control are rendered
- WHEN the user inspects their roles, names, and destinations
- THEN the download action remains separately named and downloadable
- AND the view action remains separately named and routed to the CV page

### Requirement: Existing ProjectCard detail navigation is preserved

Each `ProjectCard` MUST retain its localized detail link to `/{locale}/proyectos/{id}` with the existing localized “View details” intent. The detail link MUST remain distinct from CV navigation and optional external repository/demo actions. The card MUST NOT introduce a modal, duplicate detail-content flow, or nested interactive elements caused by the full-card title hit area and bottom action row.

#### Scenario: Project card opens its existing detail route

- GIVEN a project card is rendered for a project with identifier `apigen`
- WHEN the user activates its localized detail link
- THEN the browser navigates through the locale-aware route to `/{locale}/proyectos/apigen`
- AND the link name communicates project details rather than CV viewing

#### Scenario: Card actions remain independently operable

- GIVEN a project card has a title link, detail action, and optional repository/demo actions
- WHEN the card is inspected for interactive descendants
- THEN each action has one clear interactive target
- AND the title hit area does not wrap or contain the bottom action row
- AND no modal trigger or duplicate project content is present

### Requirement: Evidence-gated project-card geometry

Project-card media, content, action sizing, spacing, or normalization MUST NOT be changed as a blanket visual adjustment. Before any geometry change is accepted, evidence MUST include representative local and/or Sanity-shaped project data plus a focused regression assertion demonstrating the defect and corrected invariant. Any geometry change MUST preserve the featured badge and other intentional hierarchy. Missing Sanity credentials or unavailable remote data MUST be reported as a validation limitation, not remedied by expanding this change into environment or schema work.

#### Scenario: Evidence supports a narrow geometry correction

- GIVEN representative fixtures reproduce a card-height, overflow, or action-alignment defect
- WHEN a narrowly scoped geometry change is applied
- THEN a focused regression test demonstrates the relevant invariant
- AND featured cards retain their featured emphasis
- AND unrelated card/page surfaces are unchanged

#### Scenario: Evidence does not support geometry changes

- GIVEN representative data and existing tests do not demonstrate a card-geometry defect
- WHEN the change is implemented
- THEN existing card geometry, detail link, and featured hierarchy are preserved

#### Scenario: Sanity environment is unavailable

- GIVEN either `NEXT_PUBLIC_SANITY_PROJECT_ID` or `NEXT_PUBLIC_SANITY_DATASET` is missing, or remote Sanity data cannot be fetched
- WHEN Sanity-dependent geometry validation is attempted
- THEN the test result is reported as `blocked` with the missing variable/fetch reason
- AND it is not counted as passed coverage or as an implementation regression
- AND no Sanity environment, schema, or data-model modification is introduced

### Requirement: Bilingual message parity

Spanish and English MUST retain parallel `apigenCaption` values with equivalent intent. The rich caption, including bold APiGen, MUST be the link name and copy MUST NOT be hardcoded in TSX. Obsolete homepage APiGen action labels MUST be removed. (Previously: separate CTA and optional GitHub labels were catalog requirements.)

#### Scenario: Catalogs provide the caption
- GIVEN both catalogs are loaded
- WHEN each locale homepage is rendered
- THEN the exact caption resolves without a missing message, preserves rich emphasis, and no obsolete APiGen key resolves

### Requirement: Keyboard access and visible focus

All new and clarified links MUST be reachable in logical keyboard order, operable with keyboard activation, and visibly indicate focus using existing focus-visible treatment. Focus MUST NOT enter the `aria-hidden` terminal. Interactive targets MUST retain existing usable pointer/touch sizing.

#### Scenario: Keyboard traversal reaches featured actions

- GIVEN a keyboard-only user starts before the homepage hero actions
- WHEN the user presses Tab through the hero
- THEN focus reaches the CV actions, existing hero actions, and the visible APiGen caption link in logical visual order
- AND focus never lands inside `[data-testid="hero-terminal"]`

#### Scenario: Focus state remains visible

- GIVEN the APiGen CTA or CV view link has keyboard focus
- WHEN the element is focused without pointer interaction
- THEN a visible focus indicator is rendered with sufficient contrast
- AND focus is not communicated by color or hover alone

### Requirement: Responsive layout and zoom resilience

The featured CTA content, CV control, and preserved project-card actions MUST remain usable at narrow mobile widths and at 200% zoom/reflow. Text MUST remain readable without clipping, change-caused horizontal scrolling, or loss of the accessible name. The internal CTA MUST remain adjacent semantic content when hero columns stack.

#### Scenario: 320px acceptance procedure

- GIVEN a Playwright page is set to viewport `{ width: 320, height: 720 }`
- WHEN the Spanish and English homepages are loaded and cookie consent is dismissed
- THEN `document.documentElement.scrollWidth` is no greater than `document.documentElement.clientWidth`
- AND the complete localized APiGen caption link and its bounding box are visible, within the viewport, and non-zero
- AND the visible label is not clipped (`scrollWidth <= clientWidth` for the CTA)
- AND the CTA remains outside `[data-testid="hero-terminal"]`

#### Scenario: 200% zoom/reflow acceptance procedure

- GIVEN the page is loaded at a 320 CSS-pixel effective width with browser zoom set to 200% (the Playwright fallback is `document.documentElement.style.zoom = '2'` with the equivalent reduced viewport)
- WHEN the hero is inspected in both locales
- THEN `scrollWidth <= clientWidth`
- AND the full visible APiGen caption link, CV view label, and preserved project actions remain readable and reachable
- AND no action bounding boxes overlap or fall outside the viewport
- AND the APiGen caption link remains a distinct semantic link

### Requirement: Regression and acceptance coverage

The change MUST add/update focused component/integration and Playwright coverage for APiGen destinations, exact bilingual visible names, CV semantics, terminal boundaries, reduced motion, and preserved project-card detail navigation. Browser tests SHOULD use semantic role/name assertions; stable structural selectors are limited to the following test ID: `hero-terminal`. CSS classes and icon markup MUST NOT be selectors.

#### Scenario: Focused automated suite verifies the contract

- GIVEN the implementation is complete
- WHEN the focused component/integration suite runs
- THEN it asserts exact ES/EN caption names, stable hrefs, sole-link semantics, no obsolete homepage action contract, no `tabindex` or focusable descendant under the terminal, and the existing ProjectCard detail link
- AND when Playwright runs, it asserts role/name, locale-aware routes, keyboard order, 320px, 200% reflow, and reduced-motion availability

#### Scenario: Environment limitations are explicit

- GIVEN Sanity variables/data or a configured Playwright browser is unavailable
- WHEN the test command executes
- THEN the affected test is recorded with status `blocked` and an explicit reason in the test report/verification output
- AND `blocked` is distinct from `passed`, `failed`, and `skipped`
- AND the final verification summary reports `passed`, `failed`, and `blocked` counts separately; no blocked check may satisfy a coverage claim
- AND static component tests that do not require Sanity or that browser continue to run

## Environment skip/report contract

1. **Sanity:** Before Sanity-dependent tests, check both `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`. If either is absent or the fetch is unavailable, annotate the test with `environment: blocked` and the exact reason, emit it in the JSON/verification report, and exclude it from pass/coverage denominators. Do not silently fall back to local data for a test claiming Sanity coverage.
2. **Firefox/WebKit:** The Playwright preflight MUST attempt each configured browser project. A missing executable or launch failure is `environment: blocked` for that project, with browser and error recorded. Chromium results MUST remain visible, but cannot be generalized to Firefox/WebKit coverage. A test skipped solely because a browser is unavailable MUST carry the same blocked annotation; an ordinary product-condition skip remains `skipped`.
3. **Exit/reporting:** Environment blocks MUST not be converted to passes. Verification MAY finish with a zero implementation-failure exit code when only declared environment blocks exist, but the result is incomplete and the final report MUST say so; any unannotated skip, missing report entry, or claimed full cross-browser/Sanity coverage is a verification failure.

## Scope constraints

This change MUST NOT add or modify a project preview modal, modal trigger, route-to-anchor redesign, projects information-architecture redesign, blog behavior, footer redesign, contact redesign, CV PDF generation, GitHub rate-limit handling, broad Sanity schema/data-model behavior, or Sanity environment configuration. The implementation SHOULD remain within the configured 800 changed-line review budget.

### Requirement: Bilingual SkipLinks labels preserve navigation and focus behavior

The shared skip links MUST expose equivalent, localized labels from the active
locale's message catalog. The three existing targets MUST remain unchanged, and
each link MUST remain keyboard-operable, visibly focused, and associated with
its existing destination. Skip-link copy MUST NOT be hardcoded in the component.

#### Scenario: Spanish skip links expose Spanish names

- GIVEN the Spanish homepage is rendered
- WHEN skip links are queried by link role and accessible name
- THEN the three links expose the localized Spanish labels
- AND their href values target the existing content, navigation, and footer anchors

#### Scenario: English skip links expose English names

- GIVEN the English homepage is rendered
- WHEN skip links are queried by link role and accessible name
- THEN the three links expose the localized English labels rather than Spanish labels
- AND their href values target the existing content, navigation, and footer anchors

#### Scenario: Skip-link keyboard focus and activation remain usable

- GIVEN a user starts keyboard navigation before the first skip link
- WHEN the user tabs to a skip link and activates it with the keyboard
- THEN the link becomes visibly focused using the existing focus treatment
- AND focus moves to its existing target without changing the target contract

#### Scenario: Message catalogs retain bilingual key parity

- GIVEN the Spanish and English message catalogs are loaded
- WHEN the skip-link message namespace is inspected
- THEN both catalogs contain the same three skip-link keys
- AND each key has non-empty copy with equivalent intent

### Requirement: Mobile dialog naming does not alter the page heading outline

The mobile navigation dialog MUST retain a localized accessible name and its
existing native dialog interaction contract without exposing a dialog label as
an `h2` that precedes the page's primary `h1`. Opening the dialog MUST preserve
focus handling, close controls, Escape behavior, navigation, and visible mobile
layout.

#### Scenario: Open dialog has a localized accessible name without a preceding h2

- GIVEN a localized page is rendered at a mobile viewport and the menu is closed
- WHEN the mobile menu is opened
- THEN the dialog has the localized accessible name expected for that locale
- AND the opened-menu DOM contains no dialog `h2` preceding the page `h1`
- AND the page's primary `h1` remains the first page heading in document order

#### Scenario: Opening the dialog preserves focus management

- GIVEN the mobile menu trigger has keyboard focus
- WHEN the user opens the mobile menu
- THEN focus is moved to the existing intended menu control or dialog focus target
- AND the dialog remains discoverable by semantic role and accessible name

#### Scenario: Dialog close, Escape, and navigation remain operable

- GIVEN the mobile dialog is open
- WHEN the user activates the close control, presses Escape, or activates a navigation link
- THEN the dialog closes or navigation proceeds according to the activated action
- AND focus returns or transfers according to the existing interaction contract
- AND no unrelated page navigation semantics are changed

#### Scenario: Dialog remains usable at the narrow mobile viewport

- GIVEN the mobile dialog is opened at a 320px viewport
- WHEN its controls and localized title are inspected
- THEN the visible layout remains usable without clipping or unintended horizontal overflow
- AND the dialog accessible name remains available independently of visual heading semantics

### Requirement: SkillBadge label contrast meets WCAG AA in both themes

The visible `SkillBadge` skill name MUST use a foreground/background pairing with
computed contrast of at least 4.5:1 in both light and dark themes. Skill names,
existing consumers, hover behavior, and optional icon semantics MUST remain
unchanged. Icon color MUST NOT be used as a substitute for the label's text
contrast requirement.

#### Scenario: Light-theme badge label meets the contrast threshold

- GIVEN a representative `SkillBadge` is rendered in the light theme
- WHEN the computed label foreground and background colors are measured
- THEN the label contrast ratio is at least 4.5:1
- AND the skill name remains exposed as text

#### Scenario: Dark-theme badge label meets the contrast threshold

- GIVEN a representative `SkillBadge` is rendered in the dark theme
- WHEN the computed label foreground and background colors are measured
- THEN the label contrast ratio is at least 4.5:1
- AND the skill name remains exposed as text

#### Scenario: Optional icon semantics remain independent

- GIVEN a `SkillBadge` has an optional icon and optional icon color
- WHEN the badge is rendered and inspected
- THEN the skill name remains the semantic label regardless of icon color
- AND the icon's existing decorative or accessible semantics are preserved
- AND hover behavior remains available without reducing label contrast below 4.5:1

#### Scenario: Existing homepage and About consumers remain compatible

- GIVEN badges are rendered by the homepage and About page consumers
- WHEN representative skills are inspected in both themes
- THEN each consumer preserves the existing skill name and badge interaction/visual contract
- AND no `SkillBadge` API change or unrelated color-token redesign is required

### Requirement: Focused accessibility validation reports environment blocks explicitly

The change MUST add focused component/integration and Playwright coverage for
localized skip-link names and targets, dialog role/name and heading order,
keyboard interactions, and deterministic badge contrast in both themes. Tests
MUST prefer semantic role/name and label assertions over CSS classes or
incidental icon markup. Unavailable browser executables and Sanity-dependent
routes MUST be reported as `blocked` with an explicit reason, not as passed or
ordinary skipped coverage.

#### Scenario: Focused static tests cover the three regressions

- GIVEN the implementation and focused tests are present
- WHEN the focused component/integration suite runs
- THEN it verifies message-key parity and rendered bilingual skip-link names
- AND it verifies dialog accessible naming and heading order
- AND it verifies light/dark computed badge contrast and preserved skill names

#### Scenario: Available browser tests cover semantic interactions

- GIVEN a configured Playwright browser is available
- WHEN focused browser tests run for both locales and the mobile menu
- THEN they verify skip-link role/name, target, focus, and keyboard activation
- AND they verify dialog role/name, open/close, Escape, navigation, and heading order
- AND they run stable Axe checks where the existing setup can reliably evaluate the surface

#### Scenario: Missing browser is explicitly blocked

- GIVEN a configured Playwright browser executable is unavailable or cannot launch
- WHEN the focused browser suite runs
- THEN that browser result is recorded as `blocked` with the browser and exact launch reason
- AND it is excluded from passed and coverage counts
- AND results from available browsers remain separately reported without claiming full cross-browser coverage

#### Scenario: Missing Sanity environment is explicitly blocked

- GIVEN a focused route requires Sanity and its required project/dataset variables or fetch are unavailable
- WHEN the route validation is attempted
- THEN the result is recorded as `blocked` with the exact missing-variable or fetch reason
- AND it is excluded from passed and coverage counts
- AND static/component checks that do not require Sanity still run

#### Scenario: Repository gates distinguish implementation failures from environment limits

- GIVEN `npm run type-check`, `npm run check`, or `npm run test:run` is executed with focused browser checks
- WHEN the validation summary is produced
- THEN passed, failed, skipped, and blocked results are reported distinctly
- AND an environment block is never converted into a pass or a coverage claim
  - AND any implementation failure remains a failure even when environment blocks are also present

### Requirement: Blog loading hero matches the InteriorHero composition

The loading state MUST expose one outer loading status with `role="status"`,
`aria-busy="true"`, and an accessible `aria-label`. Only decorative hero, filter,
and card placeholder descendants MAY be `aria-hidden="true"`. The hero MUST
communicate the resolved `InteriorHero` composition with left accent/title/description
placeholders and a right decorative motif/surface region. Desktop MUST use the resolved
two-column intent; mobile MUST stack in the resolved visual order. The loading state
MUST NOT render or execute `InteriorHero`.

#### Scenario: Desktop and mobile hero composition

- GIVEN the blog loading component is rendered at desktop or mobile width
- WHEN its hero region is inspected
- THEN the left content region precedes the right motif region and responsive columns/stacking, spacing, and boundary are represented

#### Scenario: Loading hero is independent of the resolved hero

- GIVEN the component is rendered without route data or CMS access
- WHEN its module and tree are inspected
- THEN it contains deterministic placeholder markup only and does not import or invoke `InteriorHero`

### Requirement: Blog filter loading matches the initial BlogFilters layout

The filter loading state MUST represent exactly one search-field placeholder, one
Filters-control placeholder, and one result-count placeholder below the control row.
The collapsed category panel MUST NOT be represented by placeholder nodes. Stable
`filter`, `search`, `control`, and `result-count` region hooks MUST be emitted; no
category hook or category placeholder attribute MAY be emitted.

### Requirement: Six post-card placeholders remain stable

The loading state MUST retain exactly six post-card placeholders with deterministic
one-, two-, and three-column responsive intent, image ratio, content, and author
regions. The count MUST NOT depend on Sanity data.

### Requirement: Loading surfaces remain distinguishable across themes and widths

The loading state MUST use the existing `next-themes` `html.dark` contract. Browser
checks MUST set light and dark classes deterministically and inspect containment,
non-overlap, non-zero rectangles, and distinguishable surface/border values. Component
tests MUST NOT claim layout or theme coverage; those checks are browser checks or typed
`blocked` results when runtime prerequisites are unavailable.

### Requirement: Skeleton semantics are accessible and non-interactive

Exactly one discoverable outer loading wrapper MUST use `role="status"`,
`aria-busy="true"`, and `aria-label`. Decorative descendants MUST be `aria-hidden`,
with no nested live region, interactive element, or focusable placeholder. The
component MUST be server-compatible and require no hooks, timers, translations, or CMS data.

### Requirement: Resolved blog behavior does not regress

The delta MUST NOT change blog content, visibility, metadata, Sanity behavior, route
boundaries, Suspense/loading behavior, error behavior, or resolved filter semantics.
When a reliable route hold exists, a transition smoke MUST assert loading-hook removal,
the level-one heading, and labeled search control. If no hold or runtime prerequisite
exists, the exact reason MUST be reported as typed `blocked`, not as pass or coverage.

### Requirement: Validation distinguishes executed, failed, skipped, and blocked checks

Static tests MUST validate the deterministic loading contract without layout claims.
Browser checks MUST validate geometry, theme, and transition behavior when prerequisites
exist. Missing Sanity variables, fetch/server, browser, build, or route-hold prerequisites
MUST produce exact typed `blocked` results; genuine assertion failures MUST remain failures.

### Requirement: Rollback is verifiable and scoped

Rollback MUST revert only `loading.tsx` production changes and focused test/E2E additions;
shared components, routes, CMS, configuration, translations, content, errors, and footer
behavior MUST remain untouched.

## Footer Layout Requirements

### Requirement: Shared left-aligned footer grid

The footer MUST present its existing columns and bottom-bar content through one predictable left-aligned grid anchored to the shared footer content edge. At desktop widths, no footer column MAY use a competing center- or right-aligned column model. At mobile widths, the footer MUST retain a readable stacked arrangement while using the same left alignment principle.

#### Scenario: Desktop columns share one alignment edge

- GIVEN the footer is rendered at a desktop viewport of 1440px
- WHEN the primary footer columns and their headings/content blocks are inspected
- THEN each column's content begins on the shared left-alignment grid
- AND no column relies on center or right alignment to establish its layout

#### Scenario: Mobile footer preserves the alignment system

- GIVEN the footer is rendered at a 320px viewport
- WHEN the stacked columns and bottom bar are inspected
- THEN each footer content block remains left-aligned to the shared content edge
- AND the footer remains readable without requiring a horizontal scroll

### Requirement: Existing footer content and semantics are preserved

The change MUST preserve every existing footer label, navigation and privacy/GDPR destination, contact/social CTA, external-link behavior, newsletter behavior, and accessible semantic role. No footer copy, information architecture, destination, or CTA meaning MAY change.

#### Scenario: Localized footer links remain equivalent

- GIVEN the Spanish or English footer is rendered
- WHEN links and CTA controls are queried by semantic role and accessible name
- THEN all existing labels and destinations remain available in that locale
- AND external links retain their existing external behavior

#### Scenario: Footer content is not rewritten

- GIVEN the footer is compared before and after the layout change
- WHEN localized labels, headings, CTA text, and link destinations are inspected
- THEN their user-facing content and semantics are unchanged
- AND no blog or content-strategy content is introduced into the footer

### Requirement: Interactive targets remain usable

Every existing footer interactive target MUST retain a minimum 44px by 44px usable pointer/touch target, remain keyboard reachable, and retain its accessible name and activation behavior.

#### Scenario: Footer controls retain target size

- GIVEN all footer links and interactive CTAs are rendered in either locale
- WHEN their rendered target rectangles are measured
- THEN each target is at least 44px wide and 44px high
- AND each target remains reachable and operable by keyboard

### Requirement: Responsive footer geometry is contained

The footer MUST remain within the viewport and its interactive and content regions MUST NOT overlap, clip, or become unreachable at the required 320px and 1440px widths in both supported locales. Text MAY wrap, but it MUST NOT be truncated as a layout workaround.

#### Scenario: Narrow Spanish footer has no overflow or collision

- GIVEN the Spanish footer is loaded at `{ width: 320, height: 720 }`
- WHEN the footer and all visible content/interactive rectangles are measured
- THEN document horizontal `scrollWidth` is no greater than `clientWidth`
- AND visible footer rectangles remain within the viewport
- AND no two distinct footer content or interactive regions overlap

#### Scenario: Wide English footer has stable geometry

- GIVEN the English footer is loaded at `{ width: 1440, height: 900 }`
- WHEN the footer grid, columns, bottom bar, and interactive targets are measured
- THEN the grid is contained within the viewport
- AND columns and bottom-bar regions do not overlap
- AND all preserved links and CTAs have non-zero, reachable boxes

#### Scenario: Long bilingual labels wrap safely

- GIVEN either locale contains its longest existing footer labels
- WHEN the footer is rendered at 320px
- THEN labels wrap within their assigned content regions
- AND no label is clipped, visually obscured, or replaced with new copy

### Requirement: Theme-independent layout behavior

The footer MUST preserve its existing light and dark theme behavior while applying the same alignment, containment, reachability, and non-overlap contract in both themes.

#### Scenario: Light theme retains footer geometry

- GIVEN the footer is rendered in the light theme at 320px and 1440px
- WHEN alignment and geometry invariants are evaluated
- THEN the shared left-aligned grid and all responsive invariants pass
- AND existing light-theme content and link semantics remain available

#### Scenario: Dark theme retains footer geometry

- GIVEN the footer is rendered in the dark theme at 320px and 1440px
- WHEN alignment and geometry invariants are evaluated
- THEN the shared left-aligned grid and all responsive invariants pass
- AND existing dark-theme content and link semantics remain available

### Requirement: Focused browser validation reports environment blocks honestly

Focused browser coverage MUST verify the shared alignment edge, preserved semantic links and labels, 44px targets, viewport containment, and non-overlap at 320px and 1440px for Spanish and English, in light and dark themes. If a configured browser project cannot launch because its executable or another required environment prerequisite is unavailable, the result MUST be reported as `blocked` with the exact reason, excluded from pass and coverage counts, and MUST NOT be represented as passed or silently skipped.

#### Scenario: Available browser validates the footer contract

- GIVEN a configured browser project launches successfully
- WHEN the focused footer suite runs for the required locales, themes, and viewports
- THEN it reports alignment, preserved semantic content, target-size, containment, and non-overlap results separately
- AND passing checks are counted only for the cases actually executed

#### Scenario: Unavailable browser is blocked

- GIVEN a configured browser project cannot launch or its executable is unavailable
- WHEN the focused footer suite attempts that project
- THEN the project is recorded as `blocked` with the browser name and exact launch/environment reason
- AND the blocked project contributes neither passing coverage nor a failure claim about footer behavior
- AND available browser results remain visible separately

### Footer scope constraints

This footer change MUST NOT change blog pages, posts, CMS behavior, blog navigation, or content strategy; footer copy or information architecture; CV, header, interior-page, contact, global typography, or unrelated accessibility behavior; link destinations, labels, CTA semantics, newsletter behavior, or the shared `Container` abstraction; or introduce pixel-perfect snapshots as the sole acceptance contract. Any browser limitation MUST be reported as an environment block rather than hidden by changing product scope.

### Requirement: Accessibility follow-up scope remains narrow

This change MUST remain limited to the three confirmed UI accessibility defects
and their focused regression coverage. It MUST NOT modify footer design or
content, blog behavior or content strategy, Sanity configuration/data, global
typography, unrelated color tokens, unrelated components/routes, or broad
accessibility behavior.

#### Scenario: Unrelated product surfaces remain unchanged

- GIVEN the accessibility follow-up implementation is reviewed
- WHEN changed files and behavior are compared with the proposal scope
- THEN footer and blog/content strategy behavior remain unchanged
- AND no broad accessibility refactor or unrelated component change is included

#### Scenario: Sanity limitations do not expand scope

- GIVEN Sanity-dependent validation is blocked
- WHEN the change is completed
- THEN the limitation is reported explicitly
- AND no Sanity configuration, schema, content, or environment workaround is added
