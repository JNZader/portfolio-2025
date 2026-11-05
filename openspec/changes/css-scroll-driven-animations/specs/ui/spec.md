# Delta for UI

**Change**: `css-scroll-driven-animations`
**Scope**: Replace both JavaScript scroll-effect systems — the `ScrollProgress` scroll-listener bar (`setState` per scroll event, animates `width`%) and the `RevealOnScroll`/`useScrollReveal` IntersectionObserver reveals (client state, inline hidden styles) — with pure CSS scroll-driven animations: a `scroll(root)` progress bar and `view()` reveals, following the repo's established `.hero-mesh-parallax` pattern (top-level keyframes + `@supports (animation-timeline: …)` gate + inner `prefers-reduced-motion: no-preference` gate). Server-rendered markup, zero client JS for scroll effects, structural reduced-motion safety, print-safe reveals.
**Out of scope**: see Scope Constraints / Non-Goals at the end (restated from the proposal).

This delta conforms to proposal decisions D1–D5 (`../proposal.md`). Every concrete value below is the sanctioned default; bounded apply-time tuning latitude is defined in the "Reveal scroll geometry" requirement. Key evidence anchors: `components/animations/RevealOnScroll.tsx:27-30,81-86` (hook-parity values), `hooks/useScrollReveal.ts:33` (IO geometry), `app/globals.css:654-680` (hero-mesh pattern), `app/globals.css:755-765` (reduce clamp — cannot remove a timeline animation, but corrupts its range mapping; see the Reduced-motion requirement for the verified mechanics).

Naming resolution (spec-time item): the new classes follow the repo's scroll-driven precedent `.hero-mesh-parallax` (semantic kebab-case, NOT the `.animate-*` prefix — that prefix is reserved for time-based named animation classes like `.animate-fade-in-up`). Chosen names: `.reveal`, `.reveal-tall`, `.scroll-progress-bar`, custom properties `--reveal-range-start` and `--reveal-tall-start` (unregistered custom properties, same class of mechanism as the existing `--slide-offset`/`--ripple-x`; no `@property`), keyframes `revealUp` and `scrollProgress`.

---

## ADDED Requirements

### Requirement: Server-rendered scroll progress bar on the scroll(root) timeline

The scroll progress bar SHALL be a server component at the same export name and path (`components/ui/ScrollProgress.tsx`, no `'use client'`, no hooks, no state, no event listeners), rendered directly by `app/[locale]/layout.tsx` on every locale page (D4). It SHALL consist of:

- an outer wrapper: `fixed top-0` overlay, `z-50`, `h-1`, `bg-border/30`, `aria-hidden="true"`, `print:hidden`;
- an inner element with class `.scroll-progress-bar`, `h-full`, carrying the sanctioned gradient utilities `bg-gradient-to-r from-primary via-primary/80 to-tertiary` (the one sanctioned `--primary` → `--tertiary` gradient family; no hardcoded colors — design-skill Critical Rule 5).

In `app/globals.css`:

- The base `.scroll-progress-bar` rule (in `@layer components`) MUST set `transform: scaleX(0)` and `transform-origin: left`, and MUST NOT set any other visible state. This is the no-support base state: non-supporting browsers render no bar (D4 — parity with today's `ssr: false` mount, which also gave no-JS users no bar).
- A top-level `@keyframes scrollProgress` MUST animate `transform: scaleX(0)` → `transform: scaleX(1)` and nothing else.
- A top-level `@supports (animation-timeline: scroll())` block MUST apply to `.scroll-progress-bar`: `animation: scrollProgress linear both;` and `animation-timeline: scroll(root);`.

The bar MUST animate `transform` only; `width` percentages or any layout property MUST NOT be animated. The bar MUST NOT be wrapped in `@media (prefers-reduced-motion: no-preference)` (D5b: it is user-linked scroll feedback — it only moves when the user moves — and it hides no content). `components/layout/ClientComponents.tsx` MUST NOT import or render ScrollProgress; that file MUST survive with its four other mounts (PublishedQaForm, EasterEggs, MatrixRain, dev analytics panel).

#### Scenario: Bar ships in server HTML on every locale page

- GIVEN any locale page is server-rendered (`/`, `/blog`, `/contacto`, or any interior route)
- WHEN the SSR HTML is inspected
- THEN the fixed `aria-hidden="true"` wrapper and its `.scroll-progress-bar` child are present in the initial HTML
- AND the bar carries no inline `width` percentage style
- AND no dynamic-import chunk for ScrollProgress exists in the client manifest
- Verification: verify-phase `curl` of `/`, `/blog`, `/contacto` after `npm run build` + client-manifest inspection; vitest source guards (ScrollProgress.tsx has no `'use client'`/`addEventListener`; ClientComponents.tsx has no ScrollProgress import).

#### Scenario: Bar progress maps to document scroll via transform

- GIVEN a browser with scroll-timeline support, any motion preference
- WHEN the user scrolls the document to approximately 50% of the total scroll range
- THEN the rendered transform of `.scroll-progress-bar` is `scaleX(0.5)` (with `transform-origin: left`)
- AND no layout property (`width`, `left`, `right`) is animated
- Verification: manual DevTools inspection of computed `transform` while scrolling; MAY additionally be automated as a Playwright computed-style assertion.

#### Scenario: Non-supporting browsers show no bar

- GIVEN a browser without `animation-timeline: scroll()` support (or with the feature disabled)
- WHEN any page loads and is scrolled
- THEN the bar remains at its base `scaleX(0)` and is not visible
- AND no fallback script, error, or layout shift is introduced
- Verification: documented manual check in a non-supporting engine (proposal risk 1 — no automated tripwire exists for the non-supporting path; this check is a required apply-time task).

#### Scenario: Bar stays active under reduced motion and never prints

- GIVEN `prefers-reduced-motion: reduce` is active
- WHEN the user scrolls
- THEN the bar still reflects scroll progress (it is NOT gated by `no-preference` and NOT clamped away)
- AND when the page is printed from any scroll position, the wrapper is hidden via `print:hidden` and no gradient line appears in the output (today's bar prints a gradient line at last-scrolled width)
- Verification: manual DevTools reduce emulation + print preview; existing Playwright suite must remain green.

---

### Requirement: Reveal base-state visibility (no-JS, no-support, SSR parity)

The base state of every reveal subject MUST be fully visible content. Specifically:

- The `.reveal` rule in `@layer components` MUST NOT set `opacity`, `transform`, `visibility`, or any hidden state. Its rule body exists to host the `.content-auto` disjointness comment (see the geometry requirement); an empty rule is acceptable.
- The hidden state (`opacity: 0; transform: translateY(40px)`) MUST exist ONLY inside the `@keyframes revealUp` definition, and that keyframe MUST be applied to `.reveal` only inside `@supports (animation-timeline: view())` AND `@media (prefers-reduced-motion: no-preference)`.
- The reveal wrapper MUST render no inline `opacity`/`transform` styles (the current system ships `opacity: 0` inline in SSR HTML — `RevealOnScroll.tsx:79-80` — hiding content from no-JS crawlers).

This is the contract that makes non-supporting browsers, reduced-motion users, and no-JS clients all see full content without any JavaScript (proposal exploration §9 risk 1; design-skill Critical Rule 7 bans reveals that leave content stuck at `opacity: 0`).

#### Scenario: SSR HTML carries no hidden inline styles on reveal wrappers

- GIVEN `/`, `/blog`, or `/contacto` is server-rendered
- WHEN the raw SSR HTML is inspected
- THEN reveal-wrapped content is present and readable
- AND no `opacity: 0` or `transform: translateY` inline style appears on any reveal wrapper
- Verification: verify-phase `curl` of the three routes (proposal success criterion 2); no automated unit assertion possible for raw SSR output in happy-dom — the curl check is the documented gate.

#### Scenario: Non-supporting browsers and no-JS clients see all reveal content

- GIVEN a browser without `animation-timeline: view()` support, or any browser with JavaScript disabled
- WHEN `/`, `/blog`, or `/contacto` is loaded and scrolled
- THEN every reveal-wrapped section is fully visible with no hidden or partially-transparent state
- Verification: documented manual check in a non-supporting engine (required apply-time task — no automated tripwire exists); no-JS check in any browser with JS disabled.

#### Scenario: Source guard — no hidden state on base classes

- GIVEN `app/globals.css` after the change
- WHEN the stylesheet source is parsed by the source-guard test (repo precedent: `VisualBatch5QuickWins.test.tsx` reads source files as text)
- THEN no rule that applies `animation` to `.reveal` or `.reveal-tall` exists outside a `prefers-reduced-motion: no-preference` block nested inside `@supports (animation-timeline: view())`
- AND no `.reveal` rule outside the gated blocks sets `opacity: 0` or a hidden transform
- Verification: vitest source-guard test on the globals.css text (structural assertion — see "Validation and honest testability limits").

---

### Requirement: Reveal scroll geometry and reversibility (view() timeline, entry range)

The reveal system SHALL be a single CSS mechanism in `app/globals.css`, structurally identical to the hero-mesh block (top-level keyframes; class application inside `@supports`; inner `no-preference` media gate):

```css
@keyframes revealUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1;  transform: translateY(0); }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: revealUp var(--ease-spring) both;
      animation-timeline: view();
      animation-range: entry var(--reveal-range-start, 10%) entry 100%;
    }
    .reveal-tall { /* after .reveal; overrides the range only */
      animation-range: cover var(--reveal-tall-start, 10%) cover 40%;
    }
  }
  @media print {
    .reveal { animation: none; }
  }
}
```

Geometry and motion values (hook parity from `RevealOnScroll.tsx:27-30` and `useScrollReveal.ts:33`):

- Keyframe values MUST be exactly `opacity 0 → 1` and `translateY 40px → 0` (the wrapper's existing default variants).
- The timing function MUST be `var(--ease-spring)` (timing functions still apply under scroll timelines; no new motion tokens are introduced — the 600ms duration is retired into scroll distance).
- Fill mode MUST be `both`, so before the range the 0% keyframe applies (subject below the viewport, hidden while off-screen only) and after the range the 100% keyframe holds.
- The default range MUST be `entry 10% → entry 100%`: start when ~10% of the subject has crossed the scrollport's end (bottom) edge (parity with the hook's `threshold: 0.1`); complete when the subject is fully entered (the entry start offset approximately absorbs the hook's `-100px` bottom rootMargin — see tuning latitude below).

Reversibility (D1): reveals MUST ship reversible. Because the range is confined to `entry`, the semantics are exactly: a subject plays the reveal while entering from the bottom, HOLDS fully revealed for the entire time it is in view (fill `both` past the range end), and plays the reveal backwards (re-hides) only as the subject actually exits back through the bottom edge on upward scroll. The animation MUST NOT run during exit-through-the-top. A reveal subject that straddles the viewport at page load MAY render its mid-range progress state at load; this is accepted progress-mapped behavior (it resolves with the first scroll tick and matches the hero-mesh precedent).

Containment disjointness: a reveal subject MUST NOT be placed inside any `content-visibility: auto` subtree (`.content-auto`, `FeaturedProjects.tsx:30`) — `view()` geometry inside such a subtree uses the placeholder box. The `.reveal` base rule in `@layer components` MUST carry a code comment stating this disjointness rule (current consumers do not overlap it; the comment enforces it for future edits).

#### Scenario: Standard reveal plays on entry and holds while in view

- GIVEN a supporting browser with `prefers-reduced-motion: no-preference`
- WHEN the user scrolls a `.reveal` subject into view
- THEN it animates `opacity 0→1` + `translateY 40px→0` with spring easing as it enters, starting around 10% visibility and completing when fully entered
- AND once fully entered it stays fully revealed for the entire time it remains in view
- Verification: manual QA checklist (both directions, both themes) on `/`, `/blog`, `/contacto`; visual snapshots regenerated after the `animations: 'disable'` verification (proposal risk 3).

#### Scenario: Reveal reverses only on exit through the bottom

- GIVEN a supporting browser with `no-preference` and a fully revealed subject in the middle of the viewport
- WHEN the user scrolls back up so the subject exits downward through the viewport bottom
- THEN the reveal plays backwards progressively (re-hide) as it exits
- AND when the user scrolls down again it re-reveals
- AND while any part of the subject remains well inside the viewport it never re-hides
- Verification: manual QA checklist step (D1 acceptance); MAY be automated as a Playwright computed-`opacity` check at scripted scroll positions.

#### Scenario: Anchor-jump targets land revealed

- GIVEN `/` is loaded and the ScrollIndicator (or a raw anchor link) jumps to `#featured-projects` or `#sobre-mi`
- WHEN the jump completes (fresh load and mid-scroll, smooth and reduce/auto behavior)
- THEN the jump target content is fully revealed (entry-based ranges complete at full entry, so in-viewport targets sit past their range end)
- Verification: manual QA step for both anchors from fresh load and mid-scroll (proposal risk 6); the existing ScrollIndicator e2e paths must stay green.

#### Scenario: Reveals stay disjoint from content-visibility containment

- GIVEN the changed tree
- WHEN reveal subjects are located (rg `RevealOnScroll|reveal`)
- THEN none sits inside a `content-visibility: auto` / `.content-auto` subtree
- AND the `.reveal` base rule in `app/globals.css` carries the disjointness comment
- Verification: vitest source-guard (globals.css comment present; `FeaturedProjects.tsx` contains no reveal usage).

**Tuning latitude (bounded):** apply time MAY tune the standard range start within `entry 10% … entry 35%` (values toward 35% restore stricter parity with the hook's `-100px` bottom inset, which fires later in screen terms than a bare `entry 10%`), and MAY tune the end within `entry 85% … entry 100%`, guided by the proposal's visual-parity checklist (exploration §4 deltas 4–5). Values outside these bounds, or any change to the keyframe/easing/gating structure, require a spec amendment.

---

### Requirement: Scroll stagger via animation-range start offsets

The `delay` prop stagger MUST be expressed as an `animation-range` start offset, not as `animation-delay` (ignored under scroll timelines — exploration fact 5) and not as `nth-child` selectors (D2: the two delayed call sites are heterogeneous sibling columns, not list items).

Mapping contract (D2): the wrapper component MUST translate `delay` (seconds, the existing prop) into the unregistered custom property `--reveal-range-start` consumed by the standard entry range, AND into `--reveal-tall-start` consumed by the tall cover range (both emitted together; the applied class decides which one takes effect). The offset MUST be derived proportionally from the retired time-based transition — `transitionDelay: delay×1000ms` of a `600ms` duration (`RevealOnScroll.tsx:81-82`), i.e. the delayed subject starts when the undelayed one is `delay/0.6` through its reveal:

- Standard: `start = 10% + (delay / 0.6s) × (100% − 10%)`. For the repo's only value `delay={0.2}` → `10% + ⅓ × 90% = 40%`. Sanctioned value: `--reveal-range-start: 40%` (range `entry 40% → entry 100%`).
- Tall: `start = 10% + (delay / 0.6s) × (40% − 10%)`. For `delay={0.2}` → `20%`. Sanctioned value: `--reveal-tall-start: 20%` (range `cover 20% → cover 40%`).

Both columns of a staggered pair complete together (same range end), preserving the "delayed onset, shared completion" perceptual contract of the JS stagger while keeping the D1 invariant that every subject is fully revealed by full entry / by the tall range end. Same-length shifted ranges (e.g. `entry 40% → entry 130%`) MUST NOT be used: percentage points beyond a named range's end extrapolate into the timeline and are neither needed nor sanctioned. The wrapper MUST emit the custom properties only when `delay > 0`; no inline style when `delay` is absent/0.

#### Scenario: delay prop maps to the range-start custom property

- GIVEN `RevealOnScroll` is rendered with `delay={0.2}` and a `className`
- WHEN the server-rendered wrapper element is inspected
- THEN its inline style declares `--reveal-range-start: 40%` and `--reveal-tall-start: 20%`
- AND the class attribute contains `reveal` merged with the passed `className` via `cn()`
- AND no `opacity`, `transform`, `transition-*` inline styles exist
- Verification: vitest component test (happy-dom renders inline custom properties as style attributes — no scroll-timeline support needed).

#### Scenario: Undelayed wrappers carry no stagger style

- GIVEN `RevealOnScroll` is rendered without `delay` (11 of 13 usages)
- WHEN the wrapper element is inspected
- THEN no `--reveal-range-start` / `--reveal-tall-start` inline style is present
- AND the CSS fallback (`10%`) governs the range
- Verification: vitest component test.

#### Scenario: Stagger is visible as scroll separation, not a timer

- GIVEN a supporting browser with `no-preference` on `/contacto` or `/` (AboutProfile)
- WHEN the delayed column and its undelayed sibling enter the viewport together
- THEN the delayed column begins revealing at a later scroll position (when the sibling is ~⅓ through its reveal) and both complete at their shared range end
- Verification: manual QA checklist on the two delayed call sites (contacto sidebar, AboutProfile right column); the vitest custom-property assertions above pin the mechanism.

---

### Requirement: Tall reveal subjects — range selection rule

`entry`-based ranges are correct ONLY for subjects not taller than the scrollport: for a subject of height `H ≤ V` (scrollport height), `entry 100%` coincides with "fully inside the viewport", and the subject is fully opaque no later than full entry. For `H > V`, `entry 100%` arrives only when the subject exactly fills the scrollport, after a span in which the subject already fills the screen at partial opacity — readable-but-transparent content (exploration §1 / proposal risk 7). Therefore:

- **Selection rule:** a reveal subject whose height can exceed the scrollport height at any supported viewport MUST use the cover-based tall range via the additional class `reveal-tall` (composed with `reveal`, which the wrapper always emits; `reveal-tall` MUST be declared after `.reveal` inside the gated block and MUST override `animation-range` only). Subjects with `H ≤ V` at all supported viewports MUST use the default entry range (no extra class).
- **Sanctioned tall range:** `animation-range: cover var(--reveal-tall-start, 10%) cover 40%`. Derivation of the end: viewport saturation occurs at `cover V/(H+V)` (H = 1.5V → 40%, H = 2V → 33%, H = 2.5V → 29%), so ending at `cover 40%` guarantees full opacity no later than saturation for `H ≤ 1.5V` exactly, and bounds the partially-transparent-while-saturated span to ≤ ~0.55V of scrolling at opacity ≥ ~0.7 for `H ≤ 2.5V`.
- **Hard bound:** a subject taller than ~2.5× the scrollport MUST NOT be a single reveal subject — it must be split or left un-revealed. No current consumer approaches this bound.
- **Measurement protocol (required apply-time task):** the three flagged subjects — the contacto sidebar (`contacto/page.tsx` second usage, `delay={0.2}`) and both AboutProfile columns (`AboutProfile.tsx:21-65` and `66-129`, second with `delay={0.2}`) — MUST be measured in Chrome at 390×844 and 1440×900. Each gets `reveal-tall` added to its `className` if and only if it exceeds the scrollport at either viewport. These `className` additions (≤ 3 call sites) are the only permitted consumer edits; all props stay unchanged (D3).

Cover-based ranges for tall subjects follow the proposal's sanctioned fallback shape (risk 7). A `cover` range for SHORT subjects, or a single fixed range for all subjects, MUST NOT be used (a static cover percentage cannot guarantee the saturation contract across heights, and entry semantics match the hook for the standard case).

#### Scenario: Tall subject is fully opaque by viewport saturation

- GIVEN a supporting browser with `no-preference` and a `reveal reveal-tall` subject taller than the viewport
- WHEN the user scrolls until the subject fills the viewport
- THEN the subject is at (or within a short bounded span of) full opacity — it never fills the screen at a heavily transparent mid-reveal state for a sustained scroll span
- Verification: the required apply-time Chrome measurement on `/contacto` and `/` at 390×844 and 1440×900 (documented manual check with recorded heights in the task notes).

#### Scenario: Class application follows the measured rule

- GIVEN the measurement protocol has been executed
- WHEN the flagged call sites are inspected
- THEN exactly the subjects measured taller than the scrollport carry `reveal-tall` in their `className`
- AND no props other than the class string changed at any consumer
- Verification: diff review of the 4 consumer files (13 usages otherwise untouched) + vitest source guard if the classes are added.

---

### Requirement: Reduced-motion safety is structural, not clamped

The global reduce clamp (`globals.css:755-765`) cannot REMOVE a timeline animation, but it is NOT inert: with both `animation-duration` and `animation-delay` nonzero, Chromium maps the animation to a sub-range of the scroll timeline (pixel-verified `[50%,100%]` for the clamp's equal duration/delay; general mapping: start = delay/(delay+duration)). Reduce safety for reveals MUST therefore be STRUCTURAL: the `animation` declarations for `.reveal` / `.reveal-tall` MUST exist only inside `@media (prefers-reduced-motion: no-preference)` nested inside the `@supports (animation-timeline: view())` block — the hero-mesh structure. No duration-based or delay-based mitigation MAY be introduced for the REVEAL animations (a time duration on a `view()` timeline shifts the mapped sub-range and can strand content mid-opacity instead of shortening the reveal). The ONE sanctioned exception is the scroll progress bar's reduce counter-override (`animation-duration: auto !important; animation-delay: 0s !important`): the bar is user-linked feedback that hides no content, stays active under reduce by design, and needs the clamp's sub-range mapping neutralized — `auto` restores full-range tracking (pixel-verified 1:1). Under `reduce`, no reveal animation exists at all, so revealed content is visible by construction (base state), not by clamping.

The progress bar is deliberately NOT reduce-gated (D5b — user-linked feedback; see its requirement). This requirement's scenarios cover reveals only.

#### Scenario: Under reduce, reveal content is visible with no animation running

- GIVEN a supporting browser with `prefers-reduced-motion: reduce`
- WHEN `/` is loaded and scrolled through every reveal section
- THEN all reveal-wrapped content is fully visible at all times
- AND the computed `animation-name` on `.reveal` elements is `none` (no animation applied at all — not a clamped duration)
- Verification: e2e tripwire `e2e/tests/accessibility-interactions.spec.ts:140-150` (emulated reduce + `toBeVisible` assertions) MUST stay green unchanged; computed-`animation-name` check is a manual DevTools verification.

#### Scenario: The gating structure is source-guarded

- GIVEN `app/globals.css` after the change
- WHEN the source-guard test parses the stylesheet text
- THEN every `animation:` declaration targeting `.reveal`/`.reveal-tall` appears inside a `prefers-reduced-motion: no-preference` block nested inside `@supports (animation-timeline: view())`
- AND no reduce mitigation for reveals exists in the form of duration/delay overrides
- Verification: vitest source-guard test. **Honest limit:** happy-dom implements neither scroll timelines nor print/reduce media-dependent animation application, so engine behavior cannot be asserted in vitest — this test asserts stylesheet STRUCTURE; engine behavior is covered by the e2e reduce tripwire and the manual DevTools check above.

---

### Requirement: Print shows all revealed content

A `@media print { .reveal { animation: none; } }` guard MUST exist INSIDE the reveal `@supports` block, declared AFTER the `no-preference` block (equal-specificity cascade: later wins when both media conditions match). Killing the animation under print restores the visible base state. Because `reveal-tall` never appears without `reveal` and only overrides `animation-range`, the single `.reveal` print rule covers both. The guard MUST live inside `@supports`: outside it the base state is already visible, so an outer print rule would be redundant (D5a).

This fixes an existing latent defect: today's JS reveal ships inline `opacity: 0` and printing a fresh (unscrolled) page prints hidden sections (exploration §9 print note).

#### Scenario: Printing an unscrolled page shows all content

- GIVEN a supporting browser with `no-preference` and `/`, `/blog`, or `/contacto` loaded at scroll position 0
- WHEN the page is printed (or print preview is opened)
- THEN every reveal-wrapped section prints fully visible — no section prints at partial opacity or hidden
- AND the progress bar does not print (`print:hidden` wrapper)
- Verification: manual print-preview check on the three routes (documented QA step); vitest source-guard asserts the print rule exists inside the `@supports` block after the `no-preference` block.

---

### Requirement: RevealOnScroll server wrapper and animations module survival

`components/animations/RevealOnScroll.tsx` MUST become a thin server component (D3) preserving its named export, file path, and public API surface in use: `children`, `className`, `delay`. It MUST render:

```tsx
<div
  className={cn('reveal', className)}
  data-slot="reveal"
  style={delay ? { '--reveal-range-start': '40%', '--reveal-tall-start': '20%' } : undefined}
>
```

(with the custom-property values derived per the stagger formula; the literal `40%`/`20%` correspond to `delay={0.2}`, the repo's only value). The wrapper MUST keep `cn()` merge and `className` passthrough (design-skill Critical Rule 8) so all 13 JSX usages across the 4 consumers keep working with zero prop churn.

Deleted surface (all rg-verified zero source consumers — exploration §3):

- `hooks/useScrollReveal.ts` MUST be deleted (its only consumer was `RevealOnScroll.tsx:4`).
- `components/animations/AnimationProvider.tsx` MUST be deleted (`AnimationProvider` + `useAnimation` never mounted).
- `StaggeredReveal`, `slideUpVariants`, `slideLeftVariants`, `slideRightVariants`, `scaleVariants`, `fadeVariants`, and the `Variants` type MUST be removed from `RevealOnScroll.tsx`.
- `components/animations/index.ts` MUST survive, trimmed to re-export `RevealOnScroll` only. **The module path `@/components/animations` MUST NOT disappear** — `__tests__/integration/app/HomePage.test.tsx:37-40` and `__tests__/integration/components/AboutProfile.test.tsx:25` call `vi.mock('@/components/animations')` and break at mock-resolution time if the path is deleted.

The two vitest mock factories MUST drop their stale `StaggeredReveal` key and keep mocking `RevealOnScroll` (as a passthrough or stub). The module-level `IntersectionObserver`/`matchMedia` setup mocks in `__tests__/setup.ts:35-62` stay untouched (other consumers may rely on them; cleanup is out of scope).

#### Scenario: Wrapper renders as a server element with reveal semantics

- GIVEN `RevealOnScroll` is rendered with `className="space-y-6"` and no delay
- WHEN the rendered output is inspected
- THEN the element is a `div` with `class` containing both `reveal` and `space-y-6`, and `data-slot="reveal"`
- AND the component source contains no `'use client'`, no hooks, no `IntersectionObserver`
- Verification: vitest component test + source guard on the file.

#### Scenario: Deleted surface is gone and the module path survives

- GIVEN the change is applied
- WHEN the tree is inspected (rg / fd / tsc)
- THEN `hooks/useScrollReveal.ts` and `components/animations/AnimationProvider.tsx` do not exist
- AND `rg 'StaggeredReveal|Variants' components/ app/` returns no source hits
- AND `components/animations/index.ts` re-exports only `RevealOnScroll`
- Verification: `npm run test:run` green (both module mocks resolve — the mock-resolution gate) + `tsc`/biome clean.

#### Scenario: The 13 usages are untouched except sanctioned class additions

- GIVEN the change is applied
- WHEN the 4 consumer files (`contacto/page.tsx`, `design-system/page.tsx`, `blog/page.tsx`, `AboutProfile.tsx`) are diffed
- THEN no prop changes appear on any `RevealOnScroll` usage
- AND the only permitted edits are `reveal-tall` class additions at call sites the measurement protocol flagged
- Verification: diff review at apply/verify.

---

### Requirement: Zero client JS and exactly one scroll-effect mechanism

After the change there MUST be zero client JavaScript for scroll effects and exactly ONE reveal mechanism and ONE progress mechanism in the repo:

- `ScrollProgress.tsx` and `RevealOnScroll.tsx` MUST contain no `'use client'`, no hooks, no event listeners, no state.
- No IntersectionObserver-based reveal may remain in source (`rg 'IntersectionObserver' components/ hooks/ app/` — only test setup mocks remain).
- No scroll-event-listener progress bar may remain (`rg "addEventListener\('scroll'"` returns nothing in components/app).
- Exactly one `@supports (animation-timeline: view())` reveal block (plus the untouched hero-mesh block, which is the sanctioned precedent, not a parallel reveal mechanism for content) and one `@supports (animation-timeline: scroll())` bar block in `app/globals.css`. The hero-mesh block and the new blocks MUST NOT be merged or restructured (out of scope).

#### Scenario: No client runtime for scroll effects

- GIVEN the change is applied and `npm run build` runs (verify phase)
- WHEN the client manifest and bundles are inspected
- THEN no chunk for ScrollProgress exists, and the reveal path contributes no client JS
- AND `rg "'use client'" components/ui/ScrollProgress.tsx components/animations/RevealOnScroll.tsx` returns nothing
- Verification: build manifest inspection (verify phase) + rg source guards (may run as vitest source-guard tests).

#### Scenario: Exactly one reveal mechanism remains

- GIVEN the change is applied
- WHEN the repo is searched for reveal implementations
- THEN the only content-reveal mechanism is the `view()` CSS block consumed via `RevealOnScroll`/`.reveal`
- AND no IntersectionObserver reveal, no JS stickiness wrapper, and no second `@supports` reveal variant exists
- Verification: rg checks above; proposal success criterion 6.

---

### Requirement: Validation and honest testability limits

The change MUST be validated by the following layered suite, with explicit honesty about what each layer can prove (happy-dom implements neither scroll timelines nor media-condition animation application):

1. **vitest component tests (happy-dom):** `RevealOnScroll` class merge, `data-slot`, delay → `--reveal-range-start`/`--reveal-tall-start` inline custom properties (style-attribute assertions work without timeline support), absence of inline opacity/transform, absence of `'use client'`; `ScrollProgress` markup (wrapper `aria-hidden`, `print:hidden`, `.scroll-progress-bar` child, no inline width).
2. **vitest source-guard tests** (repo precedent `VisualBatch5QuickWins.test.tsx`): globals.css gating structure (reveal animations only inside `@supports` + `no-preference`; print rule inside `@supports` after the gate; no hidden base state on `.reveal`); disjointness comment present; deleted-surface absence (`useScrollReveal.ts`, `AnimationProvider.tsx`); `ClientComponents.tsx` free of ScrollProgress. These assert STRUCTURE, not engine behavior.
3. **Existing suite:** `npm run test:run` green with the two updated mock factories (module-path survival gate).
4. **Playwright e2e:** the reduce tripwire (`accessibility-interactions.spec.ts:140-150`) green unchanged — the automated guard for the worst failure mode (content invisible under reduce). `featured-projects.spec.ts` and HeroSection mocks untouched and green (`toBeVisible` ignores opacity).
5. **Visual snapshots:** one manual verification of Playwright `animations: 'disable'` × scroll-timeline behavior BEFORE trusting screenshots; then regenerate `/`, `/blog`, `/contacto`, dark-home snapshots (local-only, skipped on CI; `maxDiffPixelRatio: 0.05` may absorb residual state differences).
6. **Documented manual checks (no automated tripwire exists — they are required apply-time tasks, not optional):** non-supporting browser (or feature-disabled engine) shows content and no bar; print preview on the three routes; tall-subject measurement at 390×844 and 1440×900; anchor-jump targets revealed; reduce DevTools computed `animation-name: none`.

Environment-limited checks MUST report `blocked` with an exact reason rather than silently passing (repo convention).

#### Scenario: The layered suite executes and passes

- GIVEN the implementation is complete
- WHEN `npm run test:run` and the Playwright suite (with browsers available) execute
- THEN all vitest component/source-guard tests pass, including the mock-resolution gate for `@/components/animations`
- AND the reduce tripwire passes unchanged
- AND visual snapshots are regenerated only after the documented `animations: 'disable'` verification
- Verification: CI/test commands; the manual-check list is tracked as apply-time tasks with recorded outcomes.

#### Scenario: Test limits are documented, not papered over

- GIVEN happy-dom's lack of scroll-timeline and media-animation support
- WHEN the reduce/no-preference gating and print behavior need engine-level proof
- THEN the spec relies on the e2e reduce tripwire plus the documented manual checks (items 4 and 6 above)
- AND no vitest test claims to verify timeline animation behavior it cannot run
- Verification: review of the test files against this requirement at verify time.

---

## MODIFIED Requirements

None. No prior UI spec requirements are modified by this delta; this change adds a motion/behavior capability and deletes un-spec'd JS systems.

## REMOVED Requirements

None. The deleted code surface (`hooks/useScrollReveal.ts`, `AnimationProvider`, `StaggeredReveal`, `*Variants`) was never governed by a prior spec requirement; its removal is expressed as the prohibitions in "Zero client JS and exactly one scroll-effect mechanism" and the deleted-surface clauses of the wrapper requirement (following the repo convention of expressing product removals as ADDED prohibitions).

---

## Scope Constraints (this delta)

This change MUST NOT:

- Touch `components/ui/ScrollIndicator.tsx` (client click affordance; its cue is already CSS with `motion-reduce:animate-none`) or `components/sections/hero-section.tsx` including `animate-hero-reveal-1..6` (explicitly untouched, base-`opacity: 0` and all).
- Touch `.card-hover`, the View Transitions rules (`globals.css:682-750`, `page-transition.tsx`), or the `.content-auto` subtree in `FeaturedProjects.tsx`.
- Introduce new motion tokens (the 600ms duration disappears into scroll distance; `--ease-spring` is reused) or any `@property` registration.
- Add a percentage counter to the progress bar (rejected on register grounds — salesy).
- Pursue the Space Grotesk variable-font `wght` axis spike (facts captured in exploration §7 for a future change).
- Add any reveal inside a `content-visibility: auto` subtree.
- Re-introduce JavaScript for scroll effects (no stickiness wrapper, no listener bar, no IO reveal).

Rollback MUST be a pure code revert with no data repair (no DB/schema/Sanity migrations — proposal rollback plan). Smallest hotfix surface: deleting the reveal `@supports` block alone restores every `.reveal` element to its visible base state.
