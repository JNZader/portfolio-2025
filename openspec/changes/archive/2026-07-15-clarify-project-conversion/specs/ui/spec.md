# Project Conversion Specification

## Purpose

Define the observable homepage, CV, and project-card behavior that closes the APiGen conversion gap without introducing a second project-content flow. This specification is written in English for implementation and review; user-facing text remains localized in `messages/es.json` and `messages/en.json`.

## Requirements

### Requirement: Localized APiGen featured-project CTA

The homepage APiGen highlight MUST provide one required, semantic, keyboard-accessible internal link to the existing localized APiGen case study. The link MUST be rendered in semantic content adjacent to `HeroTerminal`, not as a descendant of it, and MUST use the stable project identifier `apigen` through the existing locale-aware route (`/{locale}/proyectos/apigen`). It MUST NOT derive a destination from translated display text.

The internal CTA MUST have a visible text label (not only `aria-label`, visually hidden text, title, or an icon). The exact accepted visible labels are:

- Spanish: `Ver caso de estudio de APiGen`
- English: `View APiGen case study`

Equivalent whitespace or typographic rendering is allowed, but the visible text MUST contain the locale-appropriate APiGen and case-study intent; an accessible-only label does not satisfy this requirement.

#### Scenario: Spanish visitor reaches the APiGen case study

- GIVEN the homepage is rendered in the default Spanish locale
- WHEN the visitor activates the link named `Ver caso de estudio de APiGen`
- THEN the browser navigates to `/proyectos/apigen`
- AND the exact accepted Spanish label is visibly rendered in the CTA

#### Scenario: English visitor preserves locale while opening APiGen

- GIVEN the homepage is rendered in the English locale
- WHEN the visitor activates the link named `View APiGen case study`
- THEN the browser navigates to `/en/proyectos/apigen`
- AND the exact accepted English label is visibly rendered in the CTA

#### Scenario: CTA is adjacent to the decorative terminal

- GIVEN the homepage contains the APiGen terminal demonstration
- WHEN the rendered DOM and accessibility tree are inspected
- THEN `[data-testid="apigen-featured-actions"]` is outside `[data-testid="hero-terminal"]`
- AND the CTA is discoverable outside the element with `aria-hidden="true"`
- AND the terminal contains no focusable descendant, `tabindex` attribute, or interactive control

### Requirement: Optional named APiGen GitHub action

The secondary APiGen GitHub action is OPTIONAL. The internal case-study CTA above is REQUIRED whether or not GitHub is supplied. If GitHub is supplied, it MUST use `https://github.com/JNZader-Vault/apigen`, be a real external link, use the existing safe target/relationship behavior, and have visible text. The exact accepted visible labels are:

- Spanish: `Código fuente de APiGen en GitHub`
- English: `View APiGen source on GitHub`

An icon-only or accessible-only GitHub action MUST NOT satisfy this requirement. The GitHub action MUST remain distinct from the internal case-study destination.

#### Scenario: GitHub action is present

- GIVEN the featured-project contract includes `githubHref`
- WHEN the active locale homepage is inspected
- THEN the visible label is the exact locale-appropriate label above
- AND its href is `https://github.com/JNZader-Vault/apigen`
- AND it has `target="_blank"` and `rel="noopener noreferrer"`
- AND the internal case-study CTA remains present as a separate link

#### Scenario: GitHub action is omitted

- GIVEN the featured-project contract omits `githubHref`
- WHEN the APiGen featured content is rendered
- THEN the required internal case-study CTA remains visible and operable
- AND no GitHub link or unlabeled GitHub affordance is rendered

### Requirement: Decorative HeroTerminal boundary and motion behavior

`HeroTerminal` MUST retain an `aria-hidden="true"` root boundary. No focusable or interactive descendant MAY be added to it. The existing scroll behavior MUST be preserved by its ref-driven `scrollTop` updates; removal of `tabIndex={-1}` is the selected resolution of the focus-boundary conflict because scrolling does not require keyboard focus or a `tabindex` attribute. No implementation MAY call `.focus()` on the terminal or any descendant.

Reduced-motion users MUST receive the complete stable terminal content without requiring replay animation, and the adjacent internal CTA MUST remain visible, focusable, and operable regardless of motion preference.

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

All new user-facing or assistive copy for APiGen actions and the clarified CV action MUST use parallel keys in `messages/es.json` and `messages/en.json`. The exact visible APiGen labels specified above MUST be catalog values, not hardcoded TSX. Spanish and English MUST preserve equivalent intent, destination, and action distinction.

#### Scenario: Both catalogs expose the required action names

- GIVEN the Spanish and English message catalogs are loaded
- WHEN the homepage and CV control are rendered for each locale
- THEN each required label resolves without a missing-message error
- AND the APiGen internal CTA renders the exact accepted visible label for that locale
- AND optional GitHub labels, when used, render the exact accepted visible label for that locale
- AND internal case study, GitHub/source code, CV view, and CV download remain distinct

### Requirement: Keyboard access and visible focus

All new and clarified links MUST be reachable in logical keyboard order, operable with keyboard activation, and visibly indicate focus using existing focus-visible treatment. Focus MUST NOT enter the `aria-hidden` terminal. Interactive targets MUST retain existing usable pointer/touch sizing.

#### Scenario: Keyboard traversal reaches featured actions

- GIVEN a keyboard-only user starts before the homepage hero actions
- WHEN the user presses Tab through the hero
- THEN focus reaches the CV actions, existing hero actions, and the visible APiGen internal CTA in logical visual order
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
- AND both the exact internal CTA label and its link bounding box are visible, within the viewport, and non-zero
- AND the visible label is not clipped (`scrollWidth <= clientWidth` for the CTA)
- AND the CTA remains outside `[data-testid="hero-terminal"]`

#### Scenario: 200% zoom/reflow acceptance procedure

- GIVEN the page is loaded at a 320 CSS-pixel effective width with browser zoom set to 200% (the Playwright fallback is `document.documentElement.style.zoom = '2'` with the equivalent reduced viewport)
- WHEN the hero is inspected in both locales
- THEN `scrollWidth <= clientWidth`
- AND the full visible internal CTA label, CV view label, and optional GitHub label remain readable and reachable
- AND no action bounding boxes overlap or fall outside the viewport
- AND the case-study action remains a distinct semantic link

### Requirement: Regression and acceptance coverage

The change MUST add/update focused component/integration and Playwright coverage for APiGen destinations, exact bilingual visible names, CV semantics, terminal boundaries, reduced motion, and preserved project-card detail navigation. Browser tests SHOULD use semantic role/name assertions; stable structural selectors are limited to the following test IDs: `hero-terminal`, `apigen-featured-actions`, and (if needed for the CTA) `apigen-case-study-cta`. CSS classes and icon markup MUST NOT be selectors.

#### Scenario: Focused automated suite verifies the contract

- GIVEN the implementation is complete
- WHEN the focused component/integration suite runs
- THEN it asserts exact ES/EN visible labels, stable hrefs, required `featuredProject` rendering, optional GitHub omission/presence, no `tabindex` or focusable descendant under the terminal, and the existing ProjectCard detail link
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
