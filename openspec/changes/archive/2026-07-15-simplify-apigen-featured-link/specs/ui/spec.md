# Delta for UI

## MODIFIED Requirements

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

### Requirement: Bilingual message parity

Spanish and English MUST retain parallel `apigenCaption` values with equivalent intent. The rich caption, including bold APiGen, MUST be the link name and copy MUST NOT be hardcoded in TSX. Obsolete homepage APiGen action labels MUST be removed. (Previously: separate CTA and optional GitHub labels were catalog requirements.)

#### Scenario: Catalogs provide the caption
- GIVEN both catalogs are loaded
- WHEN each locale homepage is rendered
- THEN the exact caption resolves without a missing message, preserves rich emphasis, and no obsolete APiGen key resolves

## REMOVED Requirements

### Requirement: Optional named APiGen GitHub action

(Reason: The APiGen homepage repository action is intentionally removed, not relocated to another homepage surface; unrelated homepage social-profile links are out of scope.)
(Migration: Repository access remains on the APiGen case study; do not edit the archive or add a homepage fallback.)

## ADDED Requirements

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

## Scope Constraints

CV, ProjectCard, blog/footer, Sanity schemas/data flow, routes, and terminal internals are out of scope. The archive MUST remain immutable. Work SHOULD stay within 800 changed lines and use feature-branch-chain delivery.
