# Exploration — css-scroll-driven-animations

Date: 2026-11-05. Repo state: `main` @ 7a378e4, clean (untracked: `.atl/`, `AGENTS.md`, `docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md`, `odd/`). Stack verified from `package.json`: next ^16.4.2, react ^19.3.1, tailwindcss ^4.3.2 + `@tailwindcss/postcss` ^4.3.2, next-intl ^4.14.9.

All line numbers below were read from the working tree on this date.

## 1. Current motion inventory (`app/globals.css`, 765 lines)

### Motion tokens (`@theme`, lines 62–69)

| Token | Value | Line |
| --- | --- | --- |
| `--transition-fast` | 150ms | 63 |
| `--transition-base` | 200ms | 64 |
| `--transition-slow` | 300ms | 65 |
| `--transition-slower` | 500ms | 66 |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 67 |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | 68 |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 69 |

These are plain `@theme` vars consumed via `var()` at call sites (e.g. `RevealOnScroll.tsx:86`, `.card-hover` at 443–444). `--ease-spring` was a dead token until `RevealOnScroll.tsx:83–86` wired it in (comment in that file says so).

### Named animation classes (all in `@layer components` unless noted)

| Class | Definition | Keyframe |
| --- | --- | --- |
| `.animate-fade-in-up` | globals.css:349–351 (0.6s ease-out forwards) | `fadeInUp` 483–492 (opacity 0→1, translateY 30px→0) |
| `.animate-slide-in-left` | 353–355 | `slideInLeft` 494–503 |
| `.animate-slide-in-right` | 357–359 | `slideInRight` 505–514 |
| `.animate-scale-in` | 361–363 | `scaleIn` 516–525 |
| `.animate-float` | 365–367 (3s infinite) | `float` 527–535 |
| `.animate-glow-pulse` | 369–371 (2s infinite) | `glowPulse` 537–545 |
| `.animate-hero-reveal` (base) | 374–377 — 0.8s `var(--ease-out)` forwards, **`opacity: 0` on the class** | `heroReveal` 548–557 (opacity 0, y 40px, scale .95 → 1) |
| `.animate-hero-reveal-1..6` | 379–413 — same animation, delays 0/100/200/300/400/500ms, **`opacity: 0` on each class** | `heroReveal` |
| `.card-hover` | 441–458 — hover lift, `var(--transition-base)` + `var(--ease-out)` | (transition, no keyframe) |
| `.btn-ripple` | 416–438 (`:active` runs `ripple` 560–569) | `ripple` |
| `.shine-effect` | 461–479 | (transition) |
| `.animate-scroll-cue` | **`@layer utilities`** 648–652 — 1.8s infinite bounce | `scrollCueBounce` 638–646 |

Other keyframes at top level (not in a layer): `pulseDot` 572–582, `shimmer` 585–592, `slideInUp` 595–604, `slideOutRight` 606–615, `fadeOut` 617–623, `slideOut` 628–635 (driven by unregistered `--slide-offset`), `heroMeshParallax` 660–669.

Hero stagger usage: `components/sections/hero-section.tsx` applies `animate-hero-reveal-1..6` at lines 69, 80, 86, 97, 102, 122, 174, 193 — pure CSS, server component, no JS.

### The existing scroll-driven precedent — `hero-mesh-parallax` (globals.css:654–680)

```css
@keyframes heroMeshParallax { from { transform: translateY(0); opacity: 1; }
                              to   { transform: translateY(48px); opacity: 0.7; } }   /* 660–669 */

@supports (animation-timeline: view()) {                                             /* 671 */
  @media (prefers-reduced-motion: no-preference) {                                   /* 672 */
    .hero-mesh-parallax {                                                            /* 673 */
      animation: heroMeshParallax linear both;
      animation-timeline: view();
      animation-range: cover;
      will-change: transform;
    }
  }
}
```

- Consumed by `components/ui/HeroBackground.tsx:39` (`hero-mesh-parallax absolute inset-0 -z-10`). Server component, no JS.
- Pattern facts: keyframe + class at **top level** (outside `@layer`), `@supports` gate OUTSIDE, `prefers-reduced-motion: no-preference` gate INSIDE. Non-supporting browsers and reduced-motion users get the un-animated base styles (mesh stays static, fully opaque). This block is the only `@supports` in the repo and the only `animation-timeline` usage (rg verified).

### Reduced-motion rules (three separate blocks)

1. **View-transition reduce clamp** — globals.css:743–750: `::view-transition-old/new/group(*)` → `animation-duration/delay: 0.01ms !important`. Exists because the global `*` clamp (below) does not reach `::view-transition-*` pseudos.
2. **Global clamp** — globals.css:755–765:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-delay: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
   **Critical fact for this change:** when an animation is driven by `animation-timeline`, `animation-duration` and `animation-delay` are ignored (the timeline replaces time). This clamp therefore does NOT neutralize a timeline-driven animation — a scroll-driven reveal would keep animating (and keep content hidden at the 0% keyframe) under reduce. The hero-mesh block is reduce-safe only because it structurally never applies the animation (`no-preference` wrapper). Any new timeline animation must use the same structural gating (or an explicit `animation: none` override inside a reduce block); clamping durations is provably insufficient.
3. `html { scroll-behavior: smooth }` — globals.css:195–197 (neutralized to `auto` by the clamp under reduce).

### View Transitions (context, out of scope)

globals.css:682–750: `.page-fade` / `.nav-forward` / `.nav-back` / `.morph` pseudo rules under `prefers-reduced-motion: no-preference`, driven by `components/page-transition.tsx` (React `<ViewTransition>` boundary, canary API with passthrough guard).

### Related rendering primitive

`.content-auto` — globals.css:248–251: `content-visibility: auto; contain-intrinsic-size: auto 500px`. Used at `components/sections/FeaturedProjects.tsx:30` (the `#featured-projects` section on the home page). Current RevealOnScroll consumers do NOT overlap it, but any future reveal inside a `content-visibility: auto` subtree interacts with `view()` sizing (placeholder box).

## 2. ScrollProgress + ScrollIndicator (two components, verified)

### `components/ui/ScrollProgress.tsx` (44 lines) — the scroll-listener bar

- `'use client'` (line 1). `useState` + `useEffect` (11–34): passive `scroll` listener on `globalThis`, `setState(progress%)` on **every scroll event**; computes `(scrollY / (scrollHeight - innerHeight)) * 100`.
- Render (36–43): outer `div.fixed top-0 left-0 right-0 h-1 bg-border/30 z-50` + `aria-hidden="true"`; inner bar `bg-gradient-to-r from-primary via-primary/80 to-tertiary transition-all duration-150 ease-out` with inline `style={{ width: `${progress}%` }}` (line 40). Animates `width` (layout property, main-thread) + a 150ms transition.
- **Mounting:** only via `components/layout/ClientComponents.tsx:14–17` — `next/dynamic` import with `ssr: false`, rendered at line 37 inside `<Suspense>`. `ClientComponents` is mounted in `app/[locale]/layout.tsx:81–83` → the bar is present on **every locale page** (it is the only ScrollProgress mount in the repo; rg verified).
- **Tests:** zero unit/integration/e2e tests reference ScrollProgress (rg over `__tests__/`, `e2e/` verified — only `docs/GIT_COMMIT_GUIDE.md` mentions the filename).
- No `print:` rule; today it prints as a gradient line at the last-scrolled width.
- Reduced motion today: harmless — bar just jumps instead of sliding (transition clamped).

### `components/ui/ScrollIndicator.tsx` (43 lines) — the hero "Explorar" button

- `'use client'` (line 1). A `<button>` (26–40) with `onClick` → `document.getElementById(targetId).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })` (17–23; checks `matchMedia('(prefers-reduced-motion: reduce)')` at 20). Uses `useTranslations('Common')` for `explore`/`exploreAria`.
- Chevron cue: `.animate-scroll-cue` + `motion-reduce:animate-none` (line 36) — already pure CSS, already reduce-safe.
- **Mounting:** `components/sections/hero-section.tsx:14–17` (dynamic, `ssr: true`), rendered at 192–196 when `showScrollIndicator` (default `true`, line 55). `hero-section.tsx` is an **async server component**; its only consumer is the home page `app/[locale]/page.tsx:9,63`. `scrollTargetId` is `'featured-projects'` or `'sobre-mi'` (page.tsx:58).
- **Tests:** `__tests__/integration/components/HeroSection.test.tsx` mocks it twice — `next/dynamic` mock (37–40) and direct module mock (76–80).
- Scope note: ScrollIndicator is a click affordance, not a scroll effect. Its cue animation is already CSS. It must remain a client component (onClick + next-intl hook). Nothing in the goal requires touching it beyond not breaking it.

## 3. RevealOnScroll blast radius (rg-verified, full list)

Importers of `@/components/animations` — exactly **4 files, 13 JSX usages**:

| Consumer | Type today | Usages | Details |
| --- | --- | --- | --- |
| `app/[locale]/(pages)/contacto/page.tsx` | async **server** component | 2 (lines 40–50, 53–117) | 2nd usage `delay={0.2}` `className="space-y-6"`; wraps ContactForm Card + sidebar Cards |
| `app/[locale]/(pages)/design-system/page.tsx` | sync **server** component (dev-only: `notFound()` in production, lines 43–45) | 8 (lines 51, 65, 88, 105, 151, 183, 214, 297) | no delay, no variants; wraps section headers/blocks |
| `app/[locale]/(pages)/blog/page.tsx` | async **server** component | 1 (lines 103–105) | wraps `<BlogFilters>` |
| `components/sections/AboutProfile.tsx` | async **server** component (line 11) | 2 (lines 21–65, 66–129) | 1st `className="space-y-8 lg:col-span-2"`, 2nd `delay={0.2}` `className="space-y-8"`; mounted on home `app/[locale]/page.tsx:78` |

Facts:
- Every consumer is already a server component passing only serializable props (`className: string`, `delay: number`). No consumer passes `variants`, `once`, or `staggerDelay`; no consumer uses `slideLeft/slideRight/scale/fade` variants (only defaults). `sobre-mi/page.tsx` is a permanent redirect to the home anchor (verified) — AboutProfile renders on `/` only.
- Replacing the client wrapper with a plain server-rendered `<div>` removes the last client boundary from these pages entirely (they stay server components; nothing else in them forces `'use client'`).
- **Dead exports (rg-verified zero source consumers):** `StaggeredReveal` (exported `RevealOnScroll.tsx:103–121`; referenced only by the mock in `HomePage.test.tsx:39`), `slideUpVariants`/`slideLeftVariants`/`slideRightVariants`/`scaleVariants`/`fadeVariants` (124–147), `AnimationProvider` + `useAnimation` (`components/animations/AnimationProvider.tsx` — the provider is not mounted anywhere; `index.ts:1` re-exports it).
- `useScrollReveal` has exactly one consumer: `RevealOnScroll.tsx:4`.

## 4. `hooks/useScrollReveal.ts` — exact behavior (83 lines)

Defaults (line 33): `threshold: 0.1`, `rootMargin: '0px 0px -100px 0px'`, `once: true`.

- **Reduced motion** (40–47): `matchMedia('(prefers-reduced-motion: reduce)')` + change listener. When true, `isVisible` is set `true` immediately and the observer is never installed (51–55) → content renders in final state, no wrapper animation.
- **IntersectionObserver** (50–80): on `entry.isIntersecting` → `isVisible = true`; if `once`, `observer.unobserve(element)` (64–66) → **sticky reveal**. If `!once`, exiting re-hides (67–69) — but no source consumer passes `once: false`, so production behavior is always sticky.
- **RevealOnScroll rendering** (`RevealOnScroll.tsx`): reduced-motion branch renders a plain `<div>` (47–53). Otherwise inline style: `opacity` + `transform` derived from `variants` (defaults `hidden {opacity:0, y:40}` → `visible {opacity:1, y:0}`, lines 27–30), `transitionDelay: ${delay*1000}ms` (81), `transitionDuration: '600ms'` (82), `transitionTimingFunction: 'var(--ease-spring)'` (86), class `transition-all duration-600 ease-out` (77).

### UX/CSS deltas the proposal must decide on (facts, not recommendations)

1. **Sticky vs reversible.** `once: true` keeps content visible after reveal. A CSS `view()` timeline is inherently progress-mapped and **reversible**: scrolling back up re-hides content (plays the reveal backwards). There is no pure-CSS `once` semantics; the proposal must either accept re-hiding or approximate stickiness (e.g. `animation-range` that completes early still reverses when the element leaves the range — only `animation-fill-mode` does not change reversibility).
2. **`animation-delay` is ignored** for timeline-driven animations. The current `delay={0.2}` stagger (2 call sites) must be expressed as an `animation-range` start offset (e.g. via a custom property used inside `animation-range`), not as a delay.
3. **Timing function still applies** — `animation-timing-function` shapes progress within the range, so `var(--ease-spring)` can be kept; note spring overshoot extrapolates past the end keyframe (y slightly past 0) just like the current transition.
4. **Geometry mapping.** Hook fires at ~10% visibility with the viewport's bottom edge inset 100px. Closest `view()` equivalent is an `animation-range` over `entry` (e.g. `entry 10% entry 90%`); exact values are a design decision.
5. **Timing duration mapping.** 600ms time-based transition has no `view()` equivalent — the "duration" becomes scroll distance (the chosen `animation-range` length). 

## 5. Tests touching motion (complete list, rg-verified)

### Unit / integration (Vitest + happy-dom)

| Test | Motion reference | Break risk for this change |
| --- | --- | --- |
| `__tests__/integration/app/HomePage.test.tsx:37–40` | `vi.mock('@/components/animations')` mocking `RevealOnScroll` + `StaggeredReveal` | **Breaks if the module path is deleted** (vi.mock of an unresolvable module fails). Keeps passing if the module survives as a server wrapper. |
| `__tests__/integration/components/AboutProfile.test.tsx:25` | same module mock (`RevealOnScroll` passthrough) | Same as above. |
| `__tests__/integration/components/HeroSection.test.tsx:37–40, 76–80` | mocks `next/dynamic` and `@/components/ui/ScrollIndicator` | Only if ScrollIndicator/hero-section changes; reveal work shouldn't touch them. |
| `__tests__/setup.ts:35–47` | global `matchMedia` mock (`matches: false`) | Context: in happy-dom, reduced-motion is always false. |
| `__tests__/setup.ts:50–62` | global no-op `IntersectionObserver` | Context: reveals never fire in unit tests — why consumers mock the module instead. A pure-CSS reveal needs no test mock at all. |
| `__tests__/integration/components/FeaturedProjectsRail.test.tsx:284–288` | reduced-motion + programmatic-scroll guard for the rail | Unaffected (own scroll logic), listed for completeness. |
| `VisualBatch2Primitives.test.tsx:73` | `Skeleton` has `animate-pulse` class | Unrelated (Tailwind built-in on Skeleton). |
| `VisualBatch5QuickWins.test.tsx:43–45` | `proyectos/loading.tsx` must NOT contain `animate-pulse` | Unrelated source guard. |
| `VisualBatch1Critical / VisualBatch3Consistency / VisualBatch4ColorTokens / VisualBatch7TokenCleanup` | **zero** motion/reveal/animation assertions (rg verified empty) | Not affected. (No VisualBatch6 exists in the repo.) |
| `CookieConsent.test.tsx`, `HeroTerminal.test.tsx` | timer-based animations | Unrelated. |

### E2E (Playwright)

| Spec | Motion reference | Break risk |
| --- | --- | --- |
| `e2e/tests/accessibility-interactions.spec.ts:140–150` | **the tripwire**: `page.emulateMedia({ reducedMotion: 'reduce' })`, goto home, asserts terminal text + case-study link `toBeVisible()` after `scrollIntoViewIfNeeded()` | **Fails if any reveal leaves content at `opacity: 0` under reduce.** Note: Playwright `toBeVisible` checks bounding box + `display`/`visibility`, NOT `opacity` — but this test runs with reduce, where the new CSS must show everything. |
| `e2e/tests/visual.spec.ts:8–61` | `toHaveScreenshot` fullPage on `/` (17–21), `/blog` (29–33), `/contacto` (41–43), dark home (56–60); `maxDiffPixelRatio: 0.05`; 500ms settle; skipped on CI (line 6) | All three pages contain RevealOnScroll content. FullPage screenshots scroll/stitch the page, advancing `view()` timelines at different points; `toHaveScreenshot` default `animations: 'disable'` fast-forwards finite CSS animations but its interaction with scroll-driven timelines is **unverified** — needs one manual verification run; snapshots may need regeneration. |
| `e2e/tests/featured-projects.spec.ts:53, 137` | `scrollIntoViewIfNeeded()` + visibility asserts | `toBeVisible` ignores opacity → robust to reveal states. |
| `e2e/tests/navigation.spec.ts:332` | 300ms menu timeout | Unrelated. |
| `e2e/tests/interior-pages-visual.spec.ts` | overflow checks only | Not affected. |
| `e2e/tests/project-cards-visual.spec.ts` | pointer targets / visuals | Not affected. |

## 6. Tailwind 4 + globals.css structure (where new CSS goes)

- **Pipeline:** `postcss.config.mjs` = only `@tailwindcss/postcss` (no autoprefixer, no Lightning CSS config, no browserslist anywhere — fd/rg verified). Tailwind 4 emits modern CSS unprefixed; `animation-timeline`/`animation-range` are unprefixed in all supporting engines.
- **Layer layout of globals.css:** `@theme` 3–70 → `@layer base` 72–244 → `@layer components` 246–480 (ALL custom `animate-*`, `.card-hover`, `.glass*`) → top-level `@keyframes` 482–646 → `@layer utilities` 648–652 (`.animate-scroll-cue` only) → top-level scroll-driven block 654–680 → view-transition rules 682–750 → reduce clamp 752–765.
- **The established home for scroll-driven CSS** is the top-level `@supports (animation-timeline: view())` + inner `prefers-reduced-motion: no-preference` block (671–680), with its keyframe at top level (660–669). A new `scroll(root)` block for the progress bar and a `view()` reveal block belong beside it (same structural pattern), keeping all keyframes top-level per the existing convention. `@layer components` classes cannot carry Tailwind variants (`motion-reduce:` etc.) — the hero-mesh pattern avoids needing them.
- **`@property`: not needed for anything in scope.** No `@property` registrations exist in the repo (`--ripple-x/--ripple-y`, `--slide-offset` are all unregistered custom properties). `transform: scaleX()` and `opacity` are real animatable properties. `@property` would only be required to interpolate a custom property (e.g. registering `--reveal-offset` as `<length-percentage>` with a syntax so it can be used in `animation-range` per element — this is an implementation option, not a requirement; plain per-class `animation-range` values or inline `style={{ '--reveal-range-start': ... }}` also work).
- **Skill mapping (platform-mapping.md §5):** durations via `var(--transition-*)`, easing via `var(--ease-*)`, reuse named animation classes instead of adding parallel keyframes; tokens.md §8 requires every animation to survive the reduce clamp.
- `scroll(root)` scroller note: the bar animates against the document root scroller; the `[locale]` layout does not alter scrolling structure (no inner scroll containers; `PageTransition` renders pseudo-elements, not transformed ancestors). `html { scroll-behavior: smooth }` (195–197) does not conflict with scroll timelines.

## 7. Space Grotesk variable axis — facts only (data for a LATER spike, out of scope)

`lib/fonts.ts:28–36`: `Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-display', weight: ['500', '700'], preload: true, adjustFontFallback: true })`.

- next/font was given an explicit `weight` array for a family that ships as a variable font → Google Fonts serves **static instances of 500 and 700**, not the open `wght` axis. `font-variation-settings: 'wght' X` for X outside {500, 700} has no loaded instance data; behavior between/beyond those points is unreliable and must be verified against the actually-served file before any axis animation spike (check the `@font-face`/unicode-range output in `.next/static`).
- Consumers of the face: `.text-display` / `.text-display-lg` (globals.css:281–293) hard-set `font-weight: 700`. Inter and JetBrains Mono are loaded without `weight` (full variable axis, lines 9–24, 39–46). The `--font-display` var is applied on `<html>` via `fontVariables` (lib/fonts.ts:49) in `app/[locale]/layout.tsx:64–68` and the Studio layout.
- Relevant only because a font-axis scroll animation was floated as a future spike; this change touches none of it.

## 8. Design-system conformance constraints (portfolio-design-standards SKILL.md)

Rules that bind this change:

1. **Critical Rule 7** (SKILL.md:27) + tokens.md §8: motion must respect `prefers-reduced-motion: reduce`; never ship a reveal that leaves content stuck at `opacity: 0` when motion is disabled. The anti-pattern "Animations that ignore reduced-motion or leave content invisible when motion is clamped" is banned (SKILL.md:41). The global clamp provably cannot gate timeline animations (§1 above) → structural gating is mandatory.
2. **Reuse, don't reinvent** (SKILL.md:49 workflow step 3, platform-mapping §5): the repo already has `heroMeshParallax` as the scroll-driven pattern and named reveal keyframes (`fadeInUp`, `heroReveal`); the change should replace the JS system with the CSS system following those precedents, not add a third parallel one. After the change there must be exactly ONE reveal mechanism.
3. **Tokens-only color** (Critical Rule 2 / platform-mapping §0): the progress bar keeps `from-primary via-primary/80 to-tertiary` semantic utilities — the `--primary`→`--tertiary` pair is the sanctioned gradient family (tokens.md §9); no hardcoded oklch/hex.
4. **Motion tokens** (tokens.md §8): easing/durations reference `--ease-*`/`--transition-*` by name; today's `RevealOnScroll` uses `var(--ease-spring)` (keep parity) and a hard-coded 600ms (no token exists for 600ms — `--transition-slower` 500ms is the nearest; the proposal decides whether to token-ize or keep scroll-distance-based timing which needs no duration).
5. **Component conventions** (Critical Rule 8): if a wrapper component survives, `cn()`-merge + `data-slot` shadcn-style; `className` passthrough must keep working (all 4 consumers pass `className`).
6. Both themes: the bar and reveals animate transform/opacity only — theme-independent; nothing new needs `dark:` variants.

## 9. Rollback / risk notes

- **Sections stuck invisible** (worst failure): the base (non-`@supports`, reduce, and no-JS) state of every revealed element MUST be fully visible. The hidden state may exist only inside keyframes applied under `@supports` + `no-preference`. Writing `opacity: 0` on a base class (the `.animate-hero-reveal-*` style, globals.css:374–413) would be invisible content for non-supporting browsers and reduce users. The e2e reduce test (accessibility-interactions.spec.ts:140) is the tripwire; browsers without support have NO automated tripwire — only manual/Canary checks.
- **The reduce clamp is a no-op for timelines** (globals.css:755–765 vs a scroll-driven animation): duration/delay are ignored once `animation-timeline` is set. Any mitigation must be structural (`no-preference` gate) or an explicit `animation: none` override — never a duration clamp. This is the single most important technical constraint.
- **Print:** no `@media print` rules exist in globals.css; print handling is per-element Tailwind `print:*` variants (only `app/[locale]/(pages)/cv/page.tsx`, rg-verified) and `PublishedQaForm.tsx:262` (`print:hidden` on the QA widget — it is NOT inside any reveal). Today's JS reveal ships inline `opacity: 0` in SSR HTML, so printing a fresh (unscrolled) page already prints hidden content — the CSS version with `animation-fill-mode: both` would reproduce this at scroll 0 unless an explicit `@media print { animation: none }` guard sits inside the new `@supports` block (base state is visible, so killing the animation restores content). For the progress bar: `scaleX(0)` at print simply prints nothing (today it prints a line at last-scrolled width — arguable improvement).
- **SSR/hydration:** today's RevealOnScroll renders hidden inline styles on the server (content present but `opacity: 0` pre-hydration, and for crawlers that don't run JS the IntersectionObserver never fires). The CSS version has zero inline styles, zero client state → no hydration surface at all, and no-JS/crawler users see full content. ScrollProgress today is `ssr: false` (absent from SSR HTML); a server-rendered bar at `scaleX(0)` is a visual no-op but appears in HTML — the `fixed top z-50` wrapper overlays the top 4px of the page exactly as today (no `pointer-events` today either; parity, not regression).
- **`scroll(root)` + i18n layout:** root scroller is the document; `[locale]` layout and View Transitions introduce no inner scroller or transformed ancestor for the fixed bar (mounted at `app/[locale]/layout.tsx:82`, above `<main>`). Anchor navigation (ScrollIndicator → `#featured-projects`/`#sobre-mi`, home page.tsx:58) jumps down the page; with reversible `view()` reveals, jump targets land mid-range (partially revealed) — a UX fact to accept or design around.
- **`.content-auto` interplay** (`content-visibility: auto`, FeaturedProjects.tsx:30): current reveal consumers don't overlap it; adding reveals inside `content-visibility: auto` subtrees later changes `view()` geometry (containment). Keep them disjoint.
- **Snapshot churn:** visual.spec.ts fullPage screenshots on `/`, `/blog`, `/contacto` + dark home will change (reveal states across the stitched page). 5% pixel tolerance may or may not absorb it; snapshots are local-only (skipped on CI) and will need regeneration. `animations: 'disable'` × scroll-timeline behavior in Playwright is unverified — test manually before trusting screenshots.
- **Dead module mocks:** deleting `@/components/animations` (or `hooks/useScrollReveal.ts` while tests reference it) breaks `HomePage.test.tsx:37–40` and `AboutProfile.test.tsx:25` at mock-resolution time. Keeping the module path as a server wrapper, or updating both test files, is required either way.
- **Rollback:** the whole change is CSS + component swaps with no data/schema coupling; rollback = revert the commits (bar returns to JS listener, reveals to IO). No persistence, no migrations. Smallest risky surface: the `@supports` block in globals.css (one file governs all reveals).

## Facts the proposal must respect

1. Exactly 4 server-component consumers use `RevealOnScroll` (13 JSX usages): contacto (2, one `delay={0.2}`), design-system (8, dev-only page), blog (1), AboutProfile on `/` (2, one `delay={0.2}`). Only `className` and `delay` props are used — never `variants`/`once`.
2. `StaggeredReveal`, all `*Variants` exports, `AnimationProvider`/`useAnimation`, and `useScrollReveal` (outside RevealOnScroll) have ZERO source consumers — candidates for deletion, but `HomePage.test.tsx:37–40` and `AboutProfile.test.tsx:25` mock the module path and break if it disappears.
3. The repo's established scroll-driven pattern is `hero-mesh-parallax` (globals.css:660–680): top-level keyframe + class, `@supports (animation-timeline: view())` outer gate, `@media (prefers-reduced-motion: no-preference)` inner gate, static visible fallback.
4. The global reduce clamp (globals.css:755–765) CANNOT neutralize timeline-driven animations (duration/delay ignored under `animation-timeline`); reduce-safety must be structural (no-preference gate and/or explicit `animation: none`), and the base state of revealed content must be visible so reduce/no-support/no-JS all show content.
5. `animation-delay` is ignored for scroll-driven animations — the existing `delay={0.2}` staggers must become `animation-range` offsets; `animation-timing-function` (e.g. `var(--ease-spring)`) still applies.
6. `view()` timelines are reversible; the hook's `once: true` sticky reveal has no pure-CSS equivalent — accepting re-hide-on-scroll-up is a UX decision the proposal must state.
7. Current reveal geometry: threshold 0.1, `rootMargin '0px 0px -100px 0px'`, opacity 0→1 + translateY 40px→0, 600ms, `var(--ease-spring)`.
8. `ScrollProgress` (client, scroll listener + setState per event, animates `width`%) is mounted only via `ClientComponents` (dynamic `ssr: false`) in the `[locale]` layout → all pages; zero tests reference it; replacement animates `transform: scaleX()` with `transform-origin` left, gradient stays `from-primary … to-tertiary`.
9. `ScrollIndicator` is a click-to-scroll client button (onClick + next-intl); its cue is already CSS with `motion-reduce:animate-none` — out of replacement scope, must not break.
10. e2e tripwire: `accessibility-interactions.spec.ts:140–150` asserts home content visible under emulated reduce; Playwright `toBeVisible` ignores opacity, so only the reduce path and screenshots are at risk, not ordinary visibility asserts.
11. `visual.spec.ts` fullPage screenshots cover `/`, `/blog`, `/contacto` + dark (all reveal pages), local-only (skipped on CI), 5% tolerance; scroll-timeline × Playwright `animations: 'disable'` behavior is unverified — plan a manual check and snapshot regeneration.
12. Print: add `@media print { animation: none }` inside the new `@supports` block or revealed content prints at the 0% keyframe from an unscrolled print; the QA widget (`PublishedQaForm.tsx:262` `print:hidden`) lives outside reveals.
13. No `@property` registration exists or is needed in scope (transform/opacity are native properties); `postcss.config.mjs` is bare `@tailwindcss/postcss` — no autoprefixer/browserslist concerns.
14. Design-system: tokens-only color (sanctioned `--primary`→`--tertiary` gradient), easing via `--ease-*` tokens, exactly ONE reveal system after the change (replace, don't parallel), `cn()`/`className` passthrough preserved.
15. Keep reveals disjoint from `.content-auto` (`content-visibility: auto`, FeaturedProjects.tsx:30) — no current overlap; preserve that.
