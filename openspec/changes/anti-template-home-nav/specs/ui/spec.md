# Delta for UI

**Change**: `anti-template-home-nav` (PR1 of 2)  
**Scope**: Homepage composition, primary navigation light, footer Services removal, ScrollIndicator target, newsletter demotion, bilingual copy parity.  
**Out of scope (PR2)**: Absorb full `/sobre-mi` into home; 301 redirect of `/sobre-mi`; projects filter restyle; rate-limit/newsletter backend; HeroTerminal/APiGen caption contract changes.

---

## ADDED Requirements

### Requirement: Homepage section composition order

The homepage MUST render sections in this top-to-bottom order:

1. Hero
2. Featured Projects (first below-fold block when featured content is available)
3. At most one gradient section divider (or none if spacing alone separates sections)
4. About preview
5. Newsletter (demoted framing)

The homepage MUST NOT render a Quick Stats / KPI strip between the hero and Featured Projects (or anywhere else on the page). The homepage MUST NOT render more than one gradient `SectionDivider`. Social profile links in the hero MAY remain. Featured Projects MUST remain a curated subset; the full searchable projects grid MUST continue to live only at `/proyectos`.

#### Scenario: Post-change homepage order without stats

- GIVEN either locale homepage is rendered with at least one featured project available
- WHEN major homepage sections are inspected in document order
- THEN the order is Hero → Featured Projects → (optional single gradient divider) → About preview → Newsletter
- AND no Quick Stats / KPI grid or four-stat strip is present
- AND gradient section dividers number at most one

#### Scenario: Quick Stats is fully removed

- GIVEN either locale homepage is rendered
- WHEN the page tree and Home message consumers used only by stats are inspected
- THEN no KPI/stat cards for years, systems, certifications, or technologies appear on home
- AND no home-only stats grid section remains between hero and featured content

#### Scenario: Featured Projects remains the curated home surface

- GIVEN featured projects data is available for the active locale
- WHEN the homepage is rendered
- THEN a Featured Projects section is present below the hero
- AND it remains a curated subset distinct from the full `/proyectos` grid

---

### Requirement: Hero primary CTA density

The homepage hero MUST expose at most two primary call-to-action controls aimed at conversion: **CV** (split download/view control) and **Projects**. The hero MUST NOT render a third primary/ghost Contact CTA button or link in the hero action row. Existing social profile links (GitHub, LinkedIn) and the APiGen caption link contract MUST remain unchanged by this requirement. Contact discovery MUST occur via primary navigation (and footer nav), not via a hero Contact button.

#### Scenario: Hero actions are CV and Projects only

- GIVEN either locale homepage hero is rendered
- WHEN hero primary action controls are queried (excluding social icons and the APiGen caption link)
- THEN the CV split control (download and view) is present
- AND a Projects CTA is present
- AND no Contact / Contactar hero CTA control is present

#### Scenario: Social and APiGen surfaces are preserved

- GIVEN the homepage hero is rendered
- WHEN non-primary-CTA interactive elements are inspected
- THEN existing social profile links remain available
- AND the localized APiGen caption-link contract from prior specs remains satisfied

---

### Requirement: About preview concrete voice and lighter chrome

The homepage about preview MUST present concrete, backend-developer voice aligned with the About journey tone (stacks, ownership, production constraints) rather than generic agency marketing bullets. Approach content MUST be rewritten toward that voice or shortened; the section MUST NOT remain a hollow list of four generic template bullets. About sidebar chrome MUST reduce identical stacked glass-card surfaces (prefer a single card surface or plain bordered cards, not two stacked glass cards with the same hover treatment). The about preview MUST retain a stable section id usable by skip-links and tests (existing `content` MAY be kept). The full `/sobre-mi` route and page content MUST remain a real, independent page in PR1.

#### Scenario: Approach copy is concrete, not agency-template

- GIVEN either locale homepage about preview is rendered
- WHEN approach list items (or replacement concrete lines) are read
- THEN copy communicates concrete engineering practice rather than four generic agency slogans
- AND Spanish and English catalogs expose equivalent intent for the rewritten keys

#### Scenario: About sidebar reduces dual glass-card stack

- GIVEN the homepage about preview sidebar is rendered
- WHEN skills and experience surfaces are inspected
- THEN they do not present two identical stacked glass-card hover surfaces as the primary chrome pattern
- AND content for skills and experience remains available

#### Scenario: About preview keeps a stable section id

- GIVEN the homepage is rendered
- WHEN the about preview region is inspected
- THEN it exposes a stable element id suitable for skip-links and tests
- AND activating existing content skip-link behavior still reaches meaningful main content

#### Scenario: /sobre-mi remains a real route in PR1

- GIVEN either locale
- WHEN the user navigates to the About href from primary nav (`/sobre-mi` or `/en/sobre-mi`)
- THEN a full About page is served (not a homepage-only absorb)
- AND no 301 redirect from `/sobre-mi` to home is introduced in this change

---

### Requirement: Primary navigation item set without Home

Site-wide `MAIN_NAVIGATION` (Header desktop list, MobileMenu drawer, and Footer nav links derived from it) MUST contain exactly these destinations in order: **About**, **Projects**, **Blog**, **Contact**. Home/Inicio MUST NOT appear as a main-nav list item. The site logo (Header, MobileMenu brand control, and Footer brand) MUST continue to navigate to the locale home route. Blog MUST ALWAYS remain in primary navigation for both locales (desktop and mobile).

#### Scenario: Desktop nav items exclude Home and include Blog

- GIVEN either locale page is rendered at a desktop viewport
- WHEN primary header navigation links are queried by role and accessible name
- THEN the ordered destinations are About, Projects, Blog, Contact
- AND no Home/Inicio nav list item is present
- AND Blog is present

#### Scenario: Mobile drawer matches desktop nav item set

- GIVEN either locale page is rendered at a mobile viewport and the menu is opened
- WHEN drawer navigation links are queried
- THEN the ordered destinations are About, Projects, Blog, Contact
- AND no Home/Inicio nav list item is present
- AND Blog is present
- AND Contact is not duplicated as both a normal nav row and a separate primary CTA button

#### Scenario: Logo still reaches home

- GIVEN either locale
- WHEN the user activates the Header logo (or Footer brand home control)
- THEN navigation goes to the locale home route
- AND Home need not appear in the text nav list for that path to remain reachable

#### Scenario: Footer nav consumes the same item set

- GIVEN either locale footer is rendered
- WHEN footer navigation links derived from main navigation are inspected
- THEN they match About, Projects, Blog, Contact
- AND Home/Inicio is not listed as a footer nav item solely because it was removed from `MAIN_NAVIGATION`

---

### Requirement: Single Contact entry in header chrome

Contact MUST appear exactly once in header chrome across desktop and mobile:

- Contact MUST remain an item in `MAIN_NAVIGATION`.
- The Header desktop filled Contact CTA button MUST be removed.
- Mobile drawer MUST NOT special-case a second Contact primary button when Contact already appears as a normal nav item.

Contact MAY still appear in the footer navigation list (same `MAIN_NAVIGATION` source). The hero MUST NOT add a compensating Contact CTA (see Hero primary CTA density).

#### Scenario: Desktop header has Contact in nav only

- GIVEN either locale page is rendered at a desktop viewport
- WHEN header chrome is inspected for Contact destinations
- THEN exactly one Contact control is present in the primary nav list
- AND no separate filled Header Contact button/CTA appears beside the nav list

#### Scenario: Mobile header chrome has Contact once

- GIVEN either locale page is rendered at a mobile viewport and the menu is open
- WHEN Contact-related controls inside the drawer/header chrome are counted
- THEN Contact appears once
- AND it is not both a standard nav row and a distinct filled primary CTA

#### Scenario: Contact remains reachable site-wide

- GIVEN either locale
- WHEN the user follows the single header Contact entry
- THEN navigation reaches the locale contact route (`/contacto` or `/en/contacto`)
- AND footer may still list Contact via shared navigation without violating the single header-chrome rule

---

### Requirement: Footer without Services column

The footer MUST NOT render a Services column, fake product list, or `data-footer-column="services"` block. The footer MUST retain brand and navigation columns (and existing legal/bottom-bar content). Desktop footer layout MUST use a balanced two-column (or brand | nav) arrangement rather than a three-column brand | nav | services grid. Existing footer alignment, 44px target, containment, and theme geometry requirements from the main UI spec remain in force for the remaining columns.

#### Scenario: Services column is absent

- GIVEN either locale footer is rendered
- WHEN footer columns and headings are inspected
- THEN no Services heading or non-link agency services list is present
- AND no `data-footer-column="services"` region exists

#### Scenario: Brand and navigation remain

- GIVEN either locale footer is rendered
- WHEN footer structure is inspected
- THEN brand content remains available
- AND navigation links remain available
- AND legal/bottom-bar content remains available

#### Scenario: Desktop grid is not three service columns

- GIVEN the footer is rendered at a desktop viewport
- WHEN primary footer columns are counted
- THEN the layout does not allocate a third column to Services
- AND brand and nav share a balanced two-column (or equivalent brand | nav) layout

---

### Requirement: ScrollIndicator targets Featured Projects with about fallback

The homepage hero ScrollIndicator MUST target the first useful below-fold block after the hero. When Featured Projects content is present, the target id MUST be the Featured Projects section stable id (e.g. `featured-projects`). When Featured Projects renders nothing (empty Sanity / no featured selection), the ScrollIndicator MUST fall back to the about preview section id (e.g. `content`). The indicator MUST NOT default to a distant about `#content` target while Featured Projects is present above it. Reduced-motion scroll behavior MUST remain respected.

#### Scenario: Featured present — indicator targets featured section

- GIVEN the homepage renders a Featured Projects section with stable id `featured-projects` (or the chosen stable id)
- WHEN the hero ScrollIndicator is activated
- THEN the page scrolls to that Featured Projects section
- AND the scroll target is not the about preview while featured content is present

#### Scenario: Featured absent — indicator falls back to about

- GIVEN Featured Projects returns no content (null / empty featured set)
- WHEN the hero ScrollIndicator target is resolved
- THEN the target id is the about preview stable id
- AND activating the indicator still scrolls to meaningful below-fold content

#### Scenario: Featured section exposes a stable id when present

- GIVEN featured projects are available
- WHEN the Featured Projects root section is inspected
- THEN it exposes a stable `id` suitable for `document.getElementById` scroll targeting
- AND that id matches the ScrollIndicator primary target used on home

---

### Requirement: Newsletter demotion and non-contact framing

The homepage Newsletter section and the `/newsletter` route MUST remain available. On the homepage, Newsletter MUST be visually demoted relative to a hero-like treatment (reduced visual weight / less hero-like gradient or size emphasis). Newsletter copy (heading, description, and benefits) MUST frame the section as blog/engineering updates opt-in and MUST NOT read as a hiring Contact or outreach substitute. Contact for hiring MUST remain the contact route via nav, not newsletter copy.

#### Scenario: Newsletter section remains on home and route exists

- GIVEN either locale
- WHEN the homepage and `/newsletter` (locale-aware) are loaded
- THEN the homepage still includes a newsletter subscription section
- AND the dedicated newsletter route remains reachable

#### Scenario: Newsletter copy is non-contact updates framing

- GIVEN either locale homepage newsletter section is rendered
- WHEN heading, description, and benefit strings are read
- THEN copy communicates blog/engineering updates opt-in
- AND copy does not present newsletter as the primary hiring Contact path

#### Scenario: Newsletter visual weight is demoted on home

- GIVEN the homepage newsletter section is compared to a hero-level treatment
- WHEN visual hierarchy cues are inspected (size emphasis, hero-like gradient dominance)
- THEN the section is quieter than a primary hero CTA block
- AND it remains usable and readable

---

### Requirement: Anti-template home bilingual message parity

All user-facing strings introduced or rewritten by this change (home approach/about subtitle, newsletter framing, nav labels already via `Nav`, footer keys after Services removal, hero CTA labels still used) MUST resolve from next-intl catalogs in **both** `messages/es.json` and `messages/en.json` with parallel keys and equivalent intent. UI copy MUST NOT be hardcoded in TSX. Keys made unused by removals (stats, services list, hero Contact CTA if unused) MUST be removed only after consumers and tests no longer reference them, without leaving one locale orphaned.

#### Scenario: ES and EN catalogs keep key parity for changed namespaces

- GIVEN Spanish and English message catalogs are loaded
- WHEN Home, Nav, Footer, and Newsletter keys touched by this change are compared
- THEN both locales define the same key set for those touched keys
- AND each key has non-empty copy with equivalent intent

#### Scenario: No hardcoded rewritten UI strings in components

- GIVEN components changed for home composition, nav, footer, or newsletter framing
- WHEN user-visible string literals are inspected
- THEN rewritten labels resolve through next-intl message keys
- AND no new hardcoded ES/EN marketing sentences are embedded in TSX

#### Scenario: Removed-only keys do not leave locale drift

- GIVEN stats and footer services keys are deleted after consumers are gone
- WHEN both catalogs are inspected
- THEN neither locale retains orphan keys the other deleted for the same feature
- AND neither locale still requires a deleted key at runtime

---

### Requirement: Non-regression for projects and about surfaces in PR1

This change MUST NOT alter the full `/proyectos` searchable grid behavior, MUST NOT remove or merge away the Featured Projects home section capability when data exists, MUST NOT absorb full About content into home, and MUST NOT introduce a 301 from `/sobre-mi` to home. APiGen privacy and case-study-only public path, blog Spanish-only content strategy, and contact form backend MUST remain unchanged.

#### Scenario: /proyectos full grid untouched

- GIVEN either locale projects index route
- WHEN the page is loaded
- THEN the full searchable projects grid behavior remains available
- AND home Featured Projects remains a curated subset only

#### Scenario: Featured Projects section still present when data exists

- GIVEN featured project data is available
- WHEN the homepage is rendered
- THEN the Featured Projects section is rendered below the hero
- AND users can still navigate to the full projects index from that section’s existing CTA pattern

#### Scenario: PR2 About merge is not performed

- GIVEN this PR1 change is complete
- WHEN routes and About nav presence are inspected
- THEN `/sobre-mi` remains a real independent route
- AND About remains in primary navigation
- AND no About→home content absorb or `/sobre-mi` 301 is shipped

---

### Requirement: Anti-template home focused validation

The change MUST add or update focused unit/integration and relevant E2E coverage for: nav item set (no Home; Blog present; Contact once), absence of Quick Stats, absence of footer Services, hero CTA count (no Contact ghost), ScrollIndicator target id (featured with about fallback), newsletter non-contact copy keys, and i18n key parity. `npm run test:run` is the required static/component gate. Tests MUST prefer semantic role/name assertions; CSS classes MUST NOT be the sole selectors. Environment-limited browser checks MUST report `blocked` with an exact reason rather than silent pass.

#### Scenario: Static suite covers structural contracts

- GIVEN the implementation is complete
- WHEN `npm run test:run` executes
- THEN tests assert nav item set and Contact-once rules
- AND tests assert Quick Stats absence and footer Services absence
- AND tests assert hero CTA density and ScrollIndicator target behavior (including featured-empty fallback)
- AND tests assert bilingual key presence/parity for rewritten strings

#### Scenario: Navigation E2E expectations are updated

- GIVEN Playwright navigation coverage runs with an available browser
- WHEN desktop and mobile nav assertions execute
- THEN they expect About, Projects, Blog, Contact without Home/Inicio
- AND they do not require a dual Contact header CTA

#### Scenario: Unavailable browser is blocked not passed

- GIVEN a configured Playwright browser cannot launch
- WHEN nav or home browser checks for this change are attempted
- THEN the result is `blocked` with the browser and exact reason
- AND it is excluded from pass/coverage claims

---

## MODIFIED Requirements

### Requirement: Existing footer content and semantics are preserved

(Previously: every existing footer label, navigation and privacy/GDPR destination, contact/social CTA, external-link behavior, newsletter behavior, and accessible semantic role had to be preserved with no footer copy or information-architecture change.)

The footer MUST preserve brand content, navigation links derived from `MAIN_NAVIGATION`, privacy/GDPR and legal/bottom-bar destinations, contact/social behaviors that remain in scope, external-link safety, and accessible semantic roles for retained controls. The footer MUST remove the Services column and its fake product list as an intentional information-architecture reduction. Footer navigation MUST follow the updated main-nav item set (no Home list item; Blog and Contact retained). Newsletter behavior outside the homepage demotion framing MUST remain available. No blog content-strategy content MAY be introduced into the footer.

#### Scenario: Localized footer links remain equivalent for retained columns

- GIVEN the Spanish or English footer is rendered
- WHEN brand, navigation, legal, and retained CTA controls are queried by semantic role and accessible name
- THEN retained labels and destinations remain available in that locale
- AND external links retain their existing external behavior
- AND Services column content is absent by design

#### Scenario: Footer IA drops Services only

- GIVEN the footer is compared before and after this change
- WHEN columns and navigation are inspected
- THEN Services / fake product list content is removed
- AND brand, nav, and legal/bottom-bar semantics remain
- AND no unrelated blog or content-strategy dump is introduced into the footer

---

### Requirement: Keyboard access and visible focus

(Previously: keyboard traversal through the hero reached CV actions, existing hero actions, and the APiGen caption link.)

All new and clarified links MUST be reachable in logical keyboard order, operable with keyboard activation, and visibly indicate focus using existing focus-visible treatment. Focus MUST NOT enter the `aria-hidden` terminal. Interactive targets MUST retain existing usable pointer/touch sizing. On the homepage hero, keyboard order MUST reach the CV actions, the Projects CTA, social links as applicable, and the visible APiGen caption link — without a hero Contact CTA in that sequence.

#### Scenario: Keyboard traversal reaches featured actions without hero Contact

- GIVEN a keyboard-only user starts before the homepage hero actions
- WHEN the user presses Tab through the hero
- THEN focus reaches the CV actions, Projects CTA, and the visible APiGen caption link in logical visual order
- AND focus never lands inside `[data-testid="hero-terminal"]`
- AND no hero Contact CTA is required in the tab order

#### Scenario: Focus state remains visible

- GIVEN the APiGen CTA, CV view link, or Projects CTA has keyboard focus
- WHEN the element is focused without pointer interaction
- THEN a visible focus indicator is rendered with sufficient contrast
- AND focus is not communicated by color or hover alone

---

## REMOVED Requirements

None. Prior conversion, accessibility, blog-loading, and footer geometry requirements remain in force except where explicitly MODIFIED above. Intentional product removals (Quick Stats, footer Services, hero Contact CTA, Home nav item) are expressed as ADDED prohibitions rather than deletion of unrelated historical requirements.

---

## Scope Constraints (this delta)

This PR1 change MUST NOT:

- Absorb full `/sobre-mi` content into home or 301-redirect `/sobre-mi`
- Remove Blog from primary navigation
- Redesign `/proyectos` filter controls or full grid IA
- Change rate-limit or newsletter backend behavior
- Alter HeroTerminal / APiGen caption conversion contracts
- Perform theme-system, InteriorHero global restyle, or unrelated token refactors
- Expand beyond roughly the configured 800 changed-line review budget without explicit re-scope

Rollback MUST be a pure UI/IA revert with no data repair (no DB/schema/Sanity migrations).
