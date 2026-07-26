# Delta for UI

## ADDED Requirements

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
