# Design — css-scroll-driven-animations

Date: 2026-11-05. Built on `proposal.md` (D1–D5), `specs/ui/spec.md` (the requirements this design implements exactly), and `exploration.md` (evidence, repo `main` @ 7a378e4). Line numbers verified against the working tree on this date.

---

## Context

Two JavaScript scroll-effect systems are replaced by pure CSS scroll-driven animations, following the repo's one sanctioned precedent (`.hero-mesh-parallax`, globals.css:654–680):

| Today | Becomes |
| --- | --- |
| `components/ui/ScrollProgress.tsx` — `'use client'`, passive `scroll` listener + `setState` per scroll event, animates `width`% (layout), mounted via `next/dynamic ssr:false` through `ClientComponents.tsx` | Server component + `@keyframes scrollProgress` on a `scroll(root)` timeline (transform-only) |
| `components/animations/RevealOnScroll.tsx` + `hooks/useScrollReveal.ts` — IntersectionObserver + client state + inline hidden styles (SSR ships `opacity: 0`) | Thin server `<div class="reveal">` + `@keyframes revealUp` on a `view()` timeline, `entry`-based range, structurally reduce-gated |

Load-bearing constraints (from exploration / spec, all verified in source this session):

1. **The global reduce clamp (globals.css:755–765) is a provable no-op for timeline animations** (`animation-duration`/`animation-delay` are ignored once `animation-timeline` is set). Reduce safety MUST be structural: the `no-preference` inner gate, hero-mesh style.
2. **`animation-delay` is ignored under scroll timelines** — the `delay={0.2}` staggers (2 call sites) become `animation-range` start offsets via unregistered custom properties.
3. **13 JSX usages across 4 server-component consumers pass only `className`/`delay`** — the wrapper's public API must not churn. The module path `@/components/animations` must survive (two vitest `vi.mock` factories resolve it: `HomePage.test.tsx:37–40`, `AboutProfile.test.tsx:25`).
4. **Base state of every reveal subject is fully visible** — hidden state lives only inside keyframes applied under `@supports` + `no-preference`. No `opacity: 0` on any base class.
5. **happy-dom runs neither scroll timelines nor media-condition animation application** — vitest can only assert component markup and stylesheet STRUCTURE; engine behavior is e2e + documented manual checks.
6. `npm run build` is gated: apply phase validates with `npm run test:run` (+ `npx tsc --noEmit`, biome) only; build/manifest evidence belongs to the verify phase (config.yaml `verify.build_command`).

Design-skill rules applied: Critical Rule 5 (sanctioned `--primary`→`--tertiary` gradient family), Critical Rule 7 (reduce-safe, no stuck-invisible reveals), Critical Rule 8 (`cn()` merge + `data-slot` + `className` passthrough), motion tokens (`var(--ease-spring)` reused; no new tokens; 600ms retired into scroll distance), register (no percentage counter on the bar — salesy).

---

## Architecture Decisions

### AD-1 — Two-var stagger emission: ratify the spec — emit BOTH custom properties together whenever `delay > 0`; no `tall` prop; `reveal-tall` is added at call sites by the measurement protocol

**Decision:** `RevealOnScroll` translates `delay` (seconds, unchanged prop) into two unregistered custom properties emitted together on the same inline style — `--reveal-range-start` (consumed by the standard `entry` range) and `--reveal-tall-start` (consumed by the `cover`-based tall range). Whichever range the subject's classes select consumes its own variable; the other is inert. Emission only when `delay > 0`; no inline style otherwise. Tallness is NOT a component prop: the spec's measurement protocol adds the `reveal-tall` class at ≤3 call sites post-hoc, and that is the only consumer edit permitted.

**Rationale:** (a) The wrapper cannot know which range a call site will use — tallness is a geometric fact measured at apply time against real viewports (390×844, 1440×900). Conditional emission would couple the stagger API to a measurement outcome the wrapper can't see. (b) A `tall` prop would duplicate the class mechanism (`tall` → `reveal-tall` class) AND force prop churn at the measured call sites, violating the spec's "no props other than the class string changed at any consumer". (c) The extra variable costs nothing: an unconsumed custom property on an element has zero effect. (d) It keeps the wrapper API exactly `children | className | delay` — the surface all 13 usages already use.

**Value derivation (ratifies the spec formula, computed not hardcoded):** the retired stagger was `transitionDelay: delay×1000ms` on a `600ms` transition (`RevealOnScroll.tsx:81–82`), i.e. the delayed subject starts when the undelayed one is `delay/0.6` through its reveal:

- Standard: `start = 10% + (delay / 0.6) × (100% − 10%)` → `delay={0.2}` ⇒ **40%**
- Tall: `start = 10% + (delay / 0.6) × (40% − 10%)` → `delay={0.2}` ⇒ **20%**

The component computes these from named constants (§ Complete component sources) rather than hardcoding `'40%'`/`'20%'`: identical output for the repo's only value, but honest for any future `delay`. A source-guard test pins the constants to the CSS fallback percentages (test 24, § Test design) so apply-time tuning cannot desync the two files.

**Rejected:** a `tall` boolean prop (new API surface + duplicates the class mechanism + prop churn — see (b) above); emitting only `--reveal-range-start` and letting tall call sites hardcode their own offset (splits the stagger contract across two places); runtime tallness measurement (client JS — banned by the zero-JS requirement); `nth-child` stagger (D2 — wrong shape for heterogeneous sibling columns).

### AD-2 — CSS architecture: both blocks top-level after the hero-mesh block; base rules at the end of `@layer components`; print guard inside `@supports`, after the `no-preference` gate — verified nothing later in the file undoes it

**Decision (placement map of `app/globals.css`):**

1. **`@layer components` (append at the end, after `.shine-effect:hover::before` at line 479, before the layer's closing `}` at 480):** the `.reveal` base rule (comment-only body — disjointness rule + "never hide here" contract) and the `.scroll-progress-bar` base rule (`transform: scaleX(0); transform-origin: left;` and nothing else). Layer membership matches every other component class in the file.
2. **Top-level scroll-driven section (insert after the hero-mesh `@supports` block, line 680, before the View Transitions comment at 682):** in order — `@keyframes scrollProgress` + `@supports (animation-timeline: scroll())` block (progress bar), then `@keyframes revealUp` + `@supports (animation-timeline: view())` reveal block. This keeps ALL scroll-driven CSS contiguous in the file's existing "scroll-driven depth" section, each keyframe immediately above its `@supports` block (the hero-mesh convention: keyframe 660–669, block 671–680), and puts the reveal block last = the single-block hotfix-delete surface from the rollback plan.

**Print cascade verification (the settle point):** the `@media print { .reveal { animation: none; } }` guard lives INSIDE the reveal `@supports` block, declared AFTER the `no-preference` block. Equal specificity (0,1,0) within the same unlayered `@supports` — later source order wins when both media conditions match (print + no-preference), so the animation is killed under print and the visible base state applies. Everything later in the file was checked declaration-by-declaration:

- View-transition rules (682–741): target `::view-transition-old/new/group(...)` pseudo-elements only — never match `.reveal` or `.scroll-progress-bar`.
- `::view-transition` reduce clamp (743–750): pseudo-element selectors only.
- Global reduce clamp (755–765): sets `animation-duration/delay/iteration-count`, `transition-duration`, `scroll-behavior` — never `animation` or `animation-name`, so it cannot resurrect an animation removed by `animation: none`; and it only matches under `reduce`, where the `no-preference` block never applied anyway. (For timeline animations those duration/delay overrides are ignored regardless.)

No later rule in the file declares `animation` on either new class. Additionally, the new `@supports` blocks are **unlayered**, so they outrank every `@layer` rule regardless of position; the only ordering that matters is *within* the reveal block, which is why the print-after-gate order is structural and source-guarded (test 19).

**Other ratified structure points:**

- `revealUp` keyframe contains ONLY `opacity`/`transform` declarations; `scrollProgress` contains ONLY `transform` (`scaleX`). No layout property anywhere. Source-guarded (test 17).
- `.reveal-tall` is declared AFTER `.reveal` inside the same `no-preference` gate, same specificity, and overrides `animation-range` ONLY (its body contains no `animation`/`animation-timeline` key). It never appears without `.reveal` (wrapper always emits `reveal`), so the single print rule covers both. Source-guarded (test 20).
- The progress-bar block has NO `prefers-reduced-motion` wrapper (D5b: user-linked scroll feedback, hides no content). Source-guarded as a negative (test 16).
- No `@property` anywhere (scope constraint); `animation-range` consumes plain unregistered custom properties with `var()` fallbacks — same mechanism class as `--slide-offset`/`--ripple-x`.
- The hero-mesh block is untouched (never merged with the new view() block — spec's one-mechanism wording counts hero-mesh as the sanctioned precedent, and the source guard pins its continued separate existence, test 18).
- Comments in English (globals.css's scroll-driven section is English; artifact-language default).

**Rejected:** putting the base rules at top level instead of `@layer components` (spec requires the layer; every sibling class lives there); merging the reveal block into the hero-mesh `@supports` (explicitly out of scope, and merging couples the hotfix-delete surfaces); placing the print guard outside `@supports` (redundant — outside it the base state is already visible; D5a); an `animation: none !important` print rule (unnecessary — no competing `!important` ever targets `animation` on `.reveal`, verified above); `@keyframes` inside `@layer` (all 15 existing keyframes are top-level; convention).

### AD-3 — `RevealOnScroll` becomes a thin server component; stagger values computed from named constants that mirror the CSS fallbacks

**Decision:** exact new source in § Complete component sources. Key points: no `'use client'`, no hooks, no refs, no IO; `cn('reveal', className)` merge + `data-slot="reveal"`; `delay > 0` ⇒ inline style `{ '--reveal-range-start': …, '--reveal-tall-start': … } as CSSProperties`, else `undefined`; props are exactly `children | className | delay`. `variants`/`once`/`staggerDelay`, `StaggeredReveal`, all `*Variants`, and the `Variants` type are deleted; `index.ts` is trimmed to a single re-export; `hooks/useScrollReveal.ts` and `components/animations/AnimationProvider.tsx` are deleted (D3 — all rg-verified zero source consumers).

**Rationale for the `as CSSProperties` cast:** React's `CSSProperties` has no custom-property index signature; the inline-object-with-cast is the standard typing for custom properties. The repo's only other inline-custom-property mechanism (`RippleListener.tsx:23–24`) uses the DOM `style.setProperty` API — unavailable in a server component (no effect, no element). The cast is a 1-token, zero-runtime cost.

**Rationale for computing vs hardcoding the spec's literals:** the spec's sketch shows `'40%'`/`'20%'` "(derived per the stagger formula)". Computing from constants (10 / 100 / 40) yields exactly those literals for `delay={0.2}` (`Math.round` gives `'40%'`/`'20%'`), stays correct for any future delay value, and puts the tuning-latitude coupling in ONE auditable place — the test suite pins TS constants to CSS fallbacks (test 24).

**Rejected:** hardcoding `'40%'`/`'20%'` (silently wrong stagger for any other delay); keeping the module as a client wrapper (buys nothing — all consumers are server components); deleting the module and rewriting 13 usages to bare `div.reveal` (larger diff, breaks both vitest mock factories at resolution time, loses the named seam that keeps "one reveal mechanism" enforceable).

### AD-4 — `ScrollProgress` becomes a server component rendered directly by the locale layout at the `ClientComponents` tree position; `ClientComponents.tsx` keeps everything else

**Decision:** exact new source + diffs in § Complete component sources. The layout renders `<ScrollProgress />` as the first child inside `<AnnouncerProvider>`, immediately before the `<Suspense><ClientComponents /></Suspense>` it accompanies today — preserving the fixed overlay's DOM order (it was the first element inside `ClientComponents`, which is the first child today). No Suspense wrapper needed: it is a static server element. `ClientComponents.tsx` loses only the dynamic import (lines 13–17) and the render (lines 36–38); `PublishedQaForm`, `EasterEggs`, `MatrixRain`, and the dev analytics panel remain.

**Rationale:** a `scroll(root)` bar needs no client mount, no Suspense, no dynamic import — every page gets it in the server HTML at `scaleX(0)` (visual no-op at scroll top, identical on screen to today's absent-until-hydration bar). The wrapper gains `print:hidden` (D5b: today's bar prints a gradient line at last-scrolled width). The outer wrapper keeps today's exact utilities (`fixed top-0 left-0 right-0 h-1 bg-border/30 z-50`) plus `print:hidden`; the inner bar drops the `transition-all duration-150 ease-out` (nothing to transition — the timeline maps scroll directly) and the inline `width` (banned: layout property), keeping the sanctioned gradient utilities.

**Rejected:** keep mounting it through `ClientComponents` (misclassifies a server element into a file whose purpose is client-only lazy mounts); per-page rendering (changes today's every-page behavior); wrapping in Suspense (nothing async).

### AD-5 — Source-guard strategy: ONE vitest file, brace-matching structural extraction of globals.css, ~24 assertions across three describes (component markup, deleted surface, CSS structure)

**Decision:** single new file `__tests__/integration/components/ScrollDrivenAnimations.test.tsx`, following the `VisualBatch5QuickWins.test.tsx` precedent (`readFileSync(resolve(process.cwd(), path))` + string/structural assertions; no CSS parser dependency). A tiny brace-matching helper extracts `@supports` / `@media` / `@keyframes` / `@layer` blocks so assertions are structural ("this declaration lives inside that block") rather than fragile whole-file regexes. Full assertion list in § Test design.

**Rationale for one file:** the invariants are a CROSS-FILE contract — the wrapper emits `--reveal-range-start`, the CSS fallback `10%` consumes it, the constants must match, the deleted surface must stay deleted while the module path survives, `ClientComponents` must stay clean. One file keeps the whole "one mechanism" contract reviewable in one place, and mirrors the repo's existing source-guard-batch pattern. Component tests use the repo's `render` from `@/__tests__/test-utils` (same as `AboutProfile.test.tsx`).

**What vitest can and cannot prove (honesty clause):** happy-dom renders inline custom properties into the `style` attribute (assertable) but implements neither scroll timelines nor print/reduce media animation application. The CSS describe asserts STRUCTURE only (block nesting, declaration placement, declaration allow-lists); engine behavior is covered by the e2e reduce tripwire (+ the new computed-style test, AD-7) and the documented manual checks.

**Rejected:** a real CSS parser dependency (postcss is in `node_modules`, but brace matching is ~10 lines and adds no dependency surface to the test); splitting into per-component files (fragments the cross-file contract); Playwright-only guards for structure (slower, and structure is static text — vitest is the right layer); asserting computed styles in happy-dom (would be a lie about engine behavior).

### AD-6 — Zero-client-JS verification belongs to the VERIFY phase: `npm run build` + offline manifest/prerendered-HTML `rg` evidence

**Decision:** apply phase NEVER builds (AGENTS.md gate; config.yaml puts `build_command` under `verify`). The verify phase runs, in order:

1. `npm run build` (the config-declared verify build).
2. **No client chunk:** `rg -l "ScrollProgress" .next/static/` → must return nothing (no client bundle references the component — with the dynamic import gone, nothing pulls it client-side).
3. **Server HTML carries the bar:** `rg -l "scroll-progress-bar" .next/server/app/` → must return the prerendered route HTML files (the bar is in the initial output for every static page).
4. **No inline hidden styles:** `rg -n 'style="[^"]*opacity' .next/server/app/` over the prerendered `.html` files for `/`, `/blog`, `/contacto` → must return nothing (the old system shipped `style="opacity: 0; …"` inline; the new wrapper emits either no style or only the two custom properties).
5. Informational (not gating): client chunk count/size delta per route from `.next/app-build-manifest.json` before vs after.

Prerendered-HTML inspection is the primary evidence — it is offline (no server process to authorize) and is the same bytes `curl` would return for static routes. A live `curl` check after `next start` is optional theater on top, not required.

**Rationale:** the spec's "no dynamic-import chunk … in the client manifest" scenario is a build-output fact; only the verify phase is allowed to produce build output. Commands are exact and re-runnable by verify.

**Rejected:** running the build in apply (violates the repo's build gate); asserting zero-JS only via `rg "'use client'"` source guards (necessary but not sufficient — they don't prove bundle composition); starting a dev server in tests (flaky, unauthorized surface, proves less than the prerendered files).

### AD-7 — Test migration: only `HomePage`'s factory edits (a proposal correction); e2e reduce tripwire gains ONE appended computed-style test; visual snapshots are REGENERATED once, behind a determinism probe with a decision table

**Decision, vitest:** `AboutProfile.test.tsx:25` needs **no change** — its factory already mocks only `RevealOnScroll` (verified this session; the proposal's "factories" plural overstates it). `HomePage.test.tsx:37–40` drops the stale `StaggeredReveal` key (line 39). Both keep resolving because the module path survives (D3). The `IntersectionObserver`/`matchMedia` setup mocks in `__tests__/setup.ts:35–62` stay untouched (other consumers; out of scope).

**Decision, e2e reduce tripwire:** `accessibility-interactions.spec.ts:140–150` stays green UNCHANGED (spec MUST). Appended next to it, one new test in the same locale loop — the structural reduce guarantee automated in a real engine:

```ts
test(`${localeCase.name} reveal wrappers run no animation under reduced motion`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(localeCase.path);
  await dismissCookieConsent(page);

  const state = await page.locator('[data-slot="reveal"]').first().evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return { animationName: cs.animationName, opacity: cs.opacity };
  });
  expect(state.animationName).toBe('none'); // structural: no animation applied at all, not clamped
  expect(state.opacity).toBe('1'); // base state visible by construction
});
```

(This is the spec-sanctioned "MAY additionally be automated" automation of the reduce requirement; it catches any future refactor that drops the `no-preference` gate — exactly the class of bug the clamp cannot catch.)

**Decision, visual snapshots (`visual.spec.ts`):** regenerate all four (`homepage.png`, `blog.png`, `contact.png`, `homepage-dark.png`) — regeneration is mandatory regardless (DOM changed: inline hidden styles gone from reveal wrappers; SSR bar wrapper now in every page's HTML), local-only (CI-skipped at line 6), gated behind a determinism probe because Playwright's `animations: 'disabled'` × scroll-timeline interaction is genuinely unverified (exploration fact 11):

- **Probe procedure (apply-time task):** on the changed tree, run `npx playwright test e2e/tests/visual.spec.ts --update-snapshots`, then run it AGAIN without `--update-snapshots` (must pass — proves capture determinism), then MANUALLY inspect the regenerated PNGs for below-fold reveal sections: they must be VISIBLE (not `opacity: 0` ghosting — fullPage capture uses CDP capture-beyond-viewport rather than scrolling, and whether `view()` timelines evaluate against the expanded capture viewport is the unknown).
- **Decision table:** (a) second run green AND below-fold content visible → done, snapshots trusted. (b) second run flaky on reveal regions OR below-fold ghosting → pin capture determinism by disabling reveal animations for capture only: `await page.addStyleTag({ content: '.reveal, .scroll-progress-bar { animation: none !important; }' })` before `toHaveScreenshot` in the four tests (deterministic, content-visible, screenshots the static layout — the same thing the old snapshots effectively showed), then regenerate once. Either branch terminates in one regeneration.
- The e2e `featured-projects.spec.ts` / HeroSection paths are untouched (`toBeVisible` ignores opacity; nothing in scope changes those components).

**Rejected:** keeping old snapshots and hoping 5% `maxDiffPixelRatio` absorbs it (the DOM changed — below-threshold luck is not a strategy); regenerating without the probe (would bake in nondeterministic mid-animation states); permanently disabling reveal animations in the visual spec as the primary approach (only the fallback — default first preserves the snapshots' incidental value as motion-structure witnesses); touching the 140–150 test (spec says unchanged).

### AD-8 — Sequence diagrams: not needed, and here is why (config rule discharged explicitly)

There is no complex flow to diagram. The entire runtime behavior is declarative CSS evaluated by the browser's compositor: no component-to-component messages, no state transitions, no branching, no async orchestration. The only runtime code paths are two static server renders (`layout.tsx → ScrollProgress → HTML`; `consumer → RevealOnScroll → HTML`) — a single synchronous function call each, no sequence. The interesting complexity of this change is structural (cascade nesting, gating, file placement), which prose + the paste-ready CSS artifact express better than a diagram. Forcing a sequence diagram here would be ceremony, not documentation.

---

## Complete CSS (final, paste-ready)

> **AMENDMENT (post-review, F1):** the shipped bar block adds a reduce
> counter-override inside its @supports — @media (prefers-reduced-motion:
> reduce) { .scroll-progress-bar { animation-duration: auto !important;
> animation-delay: 0s !important; } } — because the global 0.01ms clamp
> maps the timeline to a [50%,100%] sub-range (pixel-verified). Test 16
> pins it. See apply-progress.md Batch 3.1 + review ledger RD-001/RD-002.

Everything below is the exact final state of the changed regions of `app/globals.css`. Two insertions; nothing else in the file changes.

### Insertion A — end of `@layer components` (after `.shine-effect:hover::before { left: 150%; }` — current line 479 — before the layer's closing `}` at line 480)

```css
  /*
   * Scroll-driven reveal subjects (applied by RevealOnScroll; the timeline
   * animation lives in the top-level @supports block near the hero-mesh
   * block below). Base state is DELIBERATELY empty: every reveal subject is
   * fully visible by default — no-JS clients, crawlers, reduced-motion users
   * and non-supporting browsers all see the content. Never set
   * opacity/transform/visibility here; the hidden state exists only inside
   * @keyframes revealUp, applied under @supports + no-preference.
   *
   * DISJOINTNESS RULE: never place a reveal subject inside a
   * `content-visibility: auto` subtree (.content-auto) — view() geometry
   * inside such containment uses the placeholder box.
   */
  .reveal {
    /* intentionally empty — the comment above is the contract */
  }

  /*
   * Scroll progress bar inner element (components/ui/ScrollProgress.tsx).
   * Base state = no bar in browsers without scroll-timeline support (parity
   * with the previous ssr:false mount, which also showed no bar without JS).
   * The scroll(root) animation lives in the top-level @supports block below.
   */
  .scroll-progress-bar {
    transform: scaleX(0);
    transform-origin: left;
  }
```

### Insertion B — top-level scroll-driven section (after the hero-mesh `@supports` block's closing `}` — current line 680 — before the View Transitions comment at line 682)

```css
/*
 * Scroll progress bar — progress mapped to the document scroll via a
 * scroll(root) timeline. Compositor-only (transform: scaleX), replaces the
 * former JS scroll listener that setState'd on every scroll event and
 * animated `width` (a layout property). The server-rendered wrapper lives in
 * components/ui/ScrollProgress.tsx.
 *
 * Deliberately NOT wrapped in prefers-reduced-motion: no-preference: the bar
 * only moves while the user is scrolling — user-linked feedback, not
 * autonomous motion — and it hides no content. (The global reduce clamp
 * cannot gate timeline animations anyway: animation-duration/delay are
 * ignored once animation-timeline is set.)
 */
@keyframes scrollProgress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@supports (animation-timeline: scroll()) {
  .scroll-progress-bar {
    animation: scrollProgress linear both;
    animation-timeline: scroll(root);
  }
}

/*
 * Scroll-driven reveals — the single content-reveal mechanism, replacing the
 * former IntersectionObserver system (RevealOnScroll + useScrollReveal).
 * Structure follows the hero-mesh block above: top-level keyframes; class
 * application inside @supports; prefers-reduced-motion: no-preference gate
 * INSIDE (structural reduce safety — the global duration clamp is a no-op
 * for timeline-driven animations).
 *
 * Stagger: RevealOnScroll maps its `delay` prop to a later range START via
 * the unregistered custom properties --reveal-range-start /
 * --reveal-tall-start (animation-delay is ignored under scroll timelines);
 * the 10% fallbacks below govern undelayed subjects.
 *
 * .reveal-tall (added at call sites for subjects taller than the scrollport,
 * per the measurement protocol): cover-based range so the subject is fully
 * opaque no later than viewport saturation. Declared after .reveal, same
 * specificity — overrides animation-range ONLY.
 */
@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: revealUp var(--ease-spring) both;
      animation-timeline: view();
      animation-range: entry var(--reveal-range-start, 10%) entry 100%;
    }

    .reveal-tall {
      animation-range: cover var(--reveal-tall-start, 10%) cover 40%;
    }
  }

  /* Printing an unscrolled page must show everything: killing the animation
     restores the visible base state. Must stay INSIDE @supports and AFTER
     the no-preference block (equal specificity — later wins when both media
     conditions match). Covers .reveal-tall too (never appears without
     .reveal). */
  @media print {
    .reveal {
      animation: none;
    }
  }
}
```

Notes on the artifact: `animation: revealUp var(--ease-spring) both` with no duration mirrors the hero-mesh shorthand (`linear both`) — the omitted duration is `0s` and is ignored once `animation-timeline` is set; `var()` in the shorthand's easing slot is standard substitution (no new token introduced — `--ease-spring` is the existing `@theme` token). The tuning latitude (standard start `entry 10%…35%`, end `entry 85%…100%`) applies to the two `10%`/`100%` literals in the `.reveal` rule AND the `RANGE_START_DEFAULT_PCT`/`STANDARD_RANGE_END_PCT` constants in lockstep (test 24); the tall range end (`cover 40%`) is fixed by the saturation derivation and is not tuning latitude.

---

## Complete component sources

### `components/animations/RevealOnScroll.tsx` — full replacement

```tsx
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/*
 * Scroll-driven reveal wrapper — pure CSS, server component.
 *
 * The reveal itself lives in app/globals.css: `.reveal` runs the `revealUp`
 * keyframe on a view() scroll timeline inside
 * `@supports (animation-timeline: view())` +
 * `@media (prefers-reduced-motion: no-preference)`. The base state is fully
 * visible content, so no-JS clients, crawlers, reduced-motion users and
 * non-supporting browsers all see everything — this wrapper renders NO
 * inline opacity/transform.
 *
 * Stagger: `delay` (seconds) maps to a later animation-range start via the
 * `--reveal-range-start` / `--reveal-tall-start` inline custom properties
 * (animation-delay is ignored under scroll timelines). Both are emitted
 * together; whichever range the subject's classes select consumes its own
 * variable. Derived proportionally from the retired 600ms transition: a
 * delayed subject starts when the undelayed one is `delay / 0.6` through
 * its reveal. Keep these constants in lockstep with the fallback
 * percentages in globals.css (a source-guard test pins them).
 */

/** Retired transition duration (s) the delay mapping derives from. */
const RETIRED_TRANSITION_S = 0.6;
/** Default range start (%) — must match the `10%` fallbacks in globals.css. */
const RANGE_START_DEFAULT_PCT = 10;
/** Standard range end: `entry 100%`. Tall range end: `cover 40%`. */
const STANDARD_RANGE_END_PCT = 100;
const TALL_RANGE_END_PCT = 40;

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds (former transition delay). */
  delay?: number;
}

function delayToRangeStart(delay: number, rangeEndPct: number): string {
  const start =
    RANGE_START_DEFAULT_PCT +
    (delay / RETIRED_TRANSITION_S) * (rangeEndPct - RANGE_START_DEFAULT_PCT);
  return `${Math.round(start)}%`;
}

export function RevealOnScroll({ children, className, delay = 0 }: Readonly<RevealOnScrollProps>) {
  const staggerStyle =
    delay > 0
      ? ({
          '--reveal-range-start': delayToRangeStart(delay, STANDARD_RANGE_END_PCT),
          '--reveal-tall-start': delayToRangeStart(delay, TALL_RANGE_END_PCT),
        } as CSSProperties)
      : undefined;

  return (
    <div className={cn('reveal', className)} data-slot="reveal" style={staggerStyle}>
      {children}
    </div>
  );
}
```

Sanity: `delay={0.2}` → `10 + (0.2/0.6)×90 = 40` and `10 + (0.2/0.6)×30 = 20` → `'40%'`/`'20%'` (spec literals). `delay={0.3}` → `55%`/`25%` (formula test).

### `components/animations/index.ts` — full replacement

```ts
export { RevealOnScroll } from './RevealOnScroll';
```

### Deleted files (git rm)

- `hooks/useScrollReveal.ts` (only consumer was the old `RevealOnScroll.tsx:4`)
- `components/animations/AnimationProvider.tsx` (never mounted; `useAnimation` never called)

### `components/ui/ScrollProgress.tsx` — full replacement

```tsx
/*
 * Scroll progress bar — pure CSS, server component.
 *
 * Progress is driven by the `scroll(root)` timeline in app/globals.css
 * (`.scroll-progress-bar`: transform-only scaleX). No client JS, no scroll
 * listener, no state, no dynamic import. Browsers without scroll-timeline
 * support render no bar (base `scaleX(0)`) — parity with the previous
 * `ssr: false` mount, which also showed no bar without JS.
 *
 * Deliberately NOT gated by prefers-reduced-motion: the bar only moves
 * while the user scrolls — user-linked feedback, not autonomous motion —
 * and it hides no content. `print:hidden` keeps the gradient line out of
 * printed output (the old bar printed at its last-scrolled width).
 */
export function ScrollProgress() {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-border/30 z-50 print:hidden"
      aria-hidden="true"
    >
      <div className="scroll-progress-bar h-full bg-gradient-to-r from-primary via-primary/80 to-tertiary" />
    </div>
  );
}
```

### `components/layout/ClientComponents.tsx` — diff

Remove the dynamic import (current lines 13–17) and the render block (current lines 35–38). Nothing else. Resulting file:

```tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { EasterEggs } from '@/components/features/EasterEggs';
import { PublishedQaForm } from '@/components/projects/PublishedQaForm';

const MatrixRain = dynamic(
  () => import('@/components/features/MatrixRain').then((m) => m.MatrixRain),
  { ssr: false }
);

// Analytics Debug Panel - Only in development
const AnalyticsDebugPanel =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('@/lib/analytics/debug').then((m) => m.AnalyticsDebugPanel), {
        ssr: false,
      })
    : () => null;

/**
 * Client Components Wrapper
 * Contains all lazy-loaded client-only components
 * Extracted from layout.tsx to allow Server Component optimization
 */
export function ClientComponents() {
  return (
    <>
      <PublishedQaForm />

      {/* Easter Eggs */}
      <EasterEggs />
      <Suspense fallback={null}>
        <MatrixRain />
      </Suspense>

      {/* Debug Panel - Dev only */}
      <AnalyticsDebugPanel />
    </>
  );
}
```

### `app/[locale]/layout.tsx` — diff

Two edits:

1. Import (alphabetical position after `RippleListener`):

```tsx
import { ScrollProgress } from '@/components/ui/ScrollProgress';
```

2. Render — `<ScrollProgress />` as the first child inside `<AnnouncerProvider>`, immediately before the `ClientComponents` Suspense (preserves the fixed overlay's DOM order — the bar was the first element inside `ClientComponents`, which is the first child today):

```tsx
            <AnnouncerProvider>
              {/* Fixed scroll-progress overlay — pure CSS scroll(root) timeline, server-rendered */}
              <ScrollProgress />

              {/* Client-only components (lazy loaded) */}
              <Suspense fallback={null}>
                <ClientComponents />
              </Suspense>
```

### Consumer edits (the ONLY permitted ones — measurement protocol output, ≤3 sites)

`reveal-tall` appended to the `className` of exactly the subjects measured taller than the scrollport at 390×844 or 1440×900, among the three flagged: contacto sidebar (`app/[locale]/(pages)/contacto/page.tsx:53`, the `delay={0.2}` usage) and both AboutProfile columns (`components/sections/AboutProfile.tsx:21` and `:66`). Example shape: `className="space-y-6 reveal-tall"`. No props change anywhere; the other 10 usages untouched.

---

## Test design

### New file: `__tests__/integration/components/ScrollDrivenAnimations.test.tsx`

Structure: `readFileSync`-based `readSource` helper (VisualBatch5 precedent, `resolve(process.cwd(), path)`) + a brace-matching `extractBlock(source, startIndex)` helper (counts `{`/`}` from the first `{` at/after the index; used to extract `@supports` / `@media` / `@keyframes` / `@layer components` blocks). Component tests render via `@/__tests__/test-utils`.

**describe('RevealOnScroll server wrapper')** — happy-dom component tests + file guards:

1. renders a `div` whose class contains both `reveal` and a passed `className` (`'space-y-6'`) — the `cn()` merge contract.
2. sets `data-slot="reveal"`.
3. with `delay={0.2}`: the element's `style` attribute contains `--reveal-range-start: 40%` AND `--reveal-tall-start: 20%` (string assertion on the attribute — deterministic in happy-dom).
4. with `delay={0.3}`: style contains `--reveal-range-start: 55%` and `--reveal-tall-start: 25%` — pins the FORMULA, defeats hardcoding.
5. without `delay`: no `style` attribute at all.
6. with `delay={0}`: no `style` attribute.
7. whenever a style attribute exists it contains none of `opacity:`, `transform:`, `transition` — the no-inline-hidden-state contract.
8. source guard on `components/animations/RevealOnScroll.tsx`: no `'use client'`, no `useEffect`/`useState`/`useRef`, no `IntersectionObserver`, no `useScrollReveal` import, imports `cn` from `@/lib/utils`, contains no `Variants`/`StaggeredReveal`.
9. `components/animations/index.ts` source equals the single re-export (`export { RevealOnScroll } from './RevealOnScroll';`) — module path survives, trimmed.
10. deleted surface: `existsSync` false for `hooks/useScrollReveal.ts` and `components/animations/AnimationProvider.tsx`.

**describe('ScrollProgress server component')** — happy-dom component tests + file guards:

11. renders the outer wrapper with `aria-hidden="true"` and classes `fixed`, `top-0`, `z-50`, `h-1`, `bg-border/30`, `print:hidden`.
12. renders exactly one inner child with classes `scroll-progress-bar`, `h-full`, `bg-gradient-to-r`, `from-primary`, `via-primary/80`, `to-tertiary` (the sanctioned gradient family).
13. no `style` attribute anywhere in the rendered output (no inline `width`%).
14. source guard on `components/ui/ScrollProgress.tsx`: no `'use client'`, no `addEventListener`, no `useState`/`useEffect`, no `next/dynamic`.
15. source guard on `components/layout/ClientComponents.tsx`: no `ScrollProgress` reference at all; still references `PublishedQaForm`, `EasterEggs`, `MatrixRain`, and `AnalyticsDebugPanel`.

**describe('globals.css scroll-driven structure')** — brace-matched structural guards:

16. exactly one `@supports (animation-timeline: scroll())` in the file; its block contains `.scroll-progress-bar`, `animation: scrollProgress linear both`, and `animation-timeline: scroll(root)`; the block contains NO `prefers-reduced-motion` (the D5b negative — bar not reduce-gated).
17. `@keyframes scrollProgress` block: after comment-stripping, every declaration line starts with `transform:` (i.e. only `transform: scaleX(…)` — no `width`/`left`/`right`); `@keyframes revealUp` block: every declaration starts with `opacity:` or `transform:`.
18. exactly two `@supports (animation-timeline: view())` blocks: one containing `.hero-mesh-parallax` (still `animation-range: cover` — the precedent untouched, never merged) and one containing `.reveal` (the new reveal block).
19. inside the reveal `@supports` block: the `@media (prefers-reduced-motion: no-preference)` sub-block appears BEFORE the `@media print` sub-block; the print sub-block contains `animation: none` targeting `.reveal`.
20. inside the `no-preference` sub-block: a `.reveal` rule declaring `animation: revealUp var(--ease-spring) both`, `animation-timeline: view()`, `animation-range: entry var(--reveal-range-start, 10%) entry 100%`; a `.reveal-tall` rule appearing AFTER the `.reveal` rule whose body contains ONLY `animation-range: cover var(--reveal-tall-start, 10%) cover 40%` (no `animation`/`animation-timeline` declaration in its body).
21. `revealUp` appears exactly twice in the whole file (the `@keyframes revealUp` definition + the single gated application) — no ungated or second application anywhere.
22. inside `@layer components`: the base `.reveal` rule declares none of `opacity`/`transform`/`visibility`/`animation` and its extracted block contains the string `content-visibility` (disjointness comment lives on the rule); the `.scroll-progress-bar` base rule declares exactly `transform: scaleX(0)` and `transform-origin: left`.
23. `@property` appears nowhere in the file (count 0).
24. lockstep guard: `components/animations/RevealOnScroll.tsx` declares `RANGE_START_DEFAULT_PCT = 10`, `STANDARD_RANGE_END_PCT = 100`, `TALL_RANGE_END_PCT = 40`, and the globals.css `animation-range` lines contain the matching fallbacks `10%`, `100%`, `40%` — the TS constants and CSS percentages cannot drift apart through tuning.

### Existing-test edits

- `__tests__/integration/app/HomePage.test.tsx` — mock factory (lines 37–40): delete the `StaggeredReveal` key; keep the `RevealOnScroll` passthrough.
- `__tests__/integration/components/AboutProfile.test.tsx` — NO edit (factory at line 25 already mocks only `RevealOnScroll`; proposal correction, see AD-7).
- `e2e/tests/accessibility-interactions.spec.ts` — append the one reduce computed-style test (AD-7 code block) in the existing locale loop; lines 140–150 untouched.
- `e2e/tests/visual.spec.ts` — no code change in the primary branch; the fallback branch adds `page.addStyleTag` disabling reveal animations before the four `toHaveScreenshot` calls (AD-7 decision table).

---

## Migration & sequencing (task-shaped hint for sdd-tasks)

Ordered for strict RED→GREEN; each numbered item is one session-sized task.

**Phase 1 — RED (tests first)**
1.1 Create `__tests__/integration/components/ScrollDrivenAnimations.test.tsx` (all three describes, assertions 1–24). Edit `HomePage.test.tsx` factory (drop `StaggeredReveal` key). Run `npm run test:run` → new suite red on the unchanged tree (guards fail), pre-existing suites green.
1.2 `npx tsc --noEmit` green (no repo typecheck script exists — use npx).

**Phase 2 — GREEN, CSS (globals.css only)**
2.1 Insertion A: `.reveal` + `.scroll-progress-bar` base rules at end of `@layer components`.
2.2 Insertion B: `scrollProgress` keyframe + `scroll()` block; `revealUp` keyframe + `view()` block (gate, `.reveal-tall` override, print guard). CSS structure guards (16–24) turn green; component tests still red.

**Phase 3 — GREEN, components**
3.1 Rewrite `RevealOnScroll.tsx` (server wrapper); trim `index.ts`; delete `hooks/useScrollReveal.ts` + `components/animations/AnimationProvider.tsx`. RevealOnScroll tests + `HomePage`/`AboutProfile` suites green (mock-resolution gate).
3.2 Rewrite `ScrollProgress.tsx`; remove it from `ClientComponents.tsx`; mount in `app/[locale]/layout.tsx`. Full `npm run test:run` green; `npx tsc --noEmit`; `npm run lint` (biome — formatter is CSS-aware: single quotes, 2-space).

**Phase 4 — measurement + bounded tuning (apply-time protocol tasks)**
4.1 Chrome, 390×844 and 1440×900: measure the three flagged subjects (contacto sidebar; both AboutProfile columns). Append `reveal-tall` to exactly those measured taller than the scrollport (≤3 className edits). Record heights in task notes.
4.2 Visual-parity tuning within the bounded latitude (standard start `entry 10–35%`, end `entry 85–100%`), constants + CSS in lockstep (test 24 enforces). Out-of-bounds ⇒ spec amendment, not a silent change.

**Phase 5 — e2e**
5.1 Append the reduce computed-style test to `accessibility-interactions.spec.ts`; confirm 140–150 untouched and green.
5.2 Determinism probe + snapshot regeneration per the AD-7 decision table (`--update-snapshots` → verify run → PNG inspection → fallback style pin if needed).
5.3 `npm run e2e` (browsers available; otherwise report `blocked` with exact reason — repo convention).

**Phase 6 — manual QA (required, documented outcomes)**
6.1 Non-supporting engine (or feature-disabled): content visible, no bar, no errors.
6.2 Print preview on `/`, `/blog`, `/contacto`: all sections visible, no bar.
6.3 Anchor jumps `#featured-projects` / `#sobre-mi`: targets revealed, fresh load + mid-scroll.
6.4 DevTools reduce emulation: computed `animation-name: none` on `.reveal`; bar still tracks scroll.
6.5 Both themes, three reveal pages, both scroll directions.

**Phase 7 — verify (owns the build)**
7.1 `npm run build` + the AD-6 evidence commands (`.next/static` rg empty; `.next/server/app` rg hits; no inline `opacity` in prerendered HTML). `npm run test:coverage` (thresholds 35/30/25/35).

---

## Open questions for tasks

1. **Measurement outcomes (task 4.1):** which of the three flagged subjects exceed the scrollport — resolved by the protocol; the className additions are data-driven, not pre-decidable.
2. **Snapshot probe outcome (task 5.2):** primary regeneration vs fallback style-pinned capture — resolved by the decision table; both branches end in one regeneration.
3. **Final tuning values (task 4.2):** within the spec's bounded latitude only; anything outside is a spec amendment.
4. **Typecheck command:** no `typecheck` script exists in `package.json` — tasks use `npx tsc --noEmit` (verify may also rely on `npm run build`'s type pass).

No other open questions: all eight settle points are decided above; the design introduces no unresolved architectural risk.
