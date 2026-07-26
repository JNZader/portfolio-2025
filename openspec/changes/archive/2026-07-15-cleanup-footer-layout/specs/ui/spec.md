# Delta for UI

## ADDED Requirements

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

## Scope Constraints

This delta MUST NOT change blog pages, posts, CMS behavior, blog navigation, or content strategy; footer copy or information architecture; CV, header, interior-page, contact, global typography, or unrelated accessibility behavior; link destinations, labels, CTA semantics, newsletter behavior, or the shared `Container` abstraction; or introduce pixel-perfect snapshots as the sole acceptance contract. Any browser limitation MUST be reported as an environment block rather than hidden by changing product scope.
