# Proposal — css-scroll-driven-animations

Date: 2026-11-05. Built on `exploration.md` (repo `main` @ 7a378e4). All file:line references are from that artifact.

## Why

The portfolio runs two JavaScript scroll-effect systems that pure CSS now covers (scroll-driven animations reached Baseline Oct 2026):

1. **`components/ui/ScrollProgress.tsx`** (44 lines, `'use client'`) installs a passive `scroll` listener on `globalThis` and calls `setState` on **every scroll event** (lines 11–34), then animates `width`% — a layout property — through a 150ms transition (line 40). It is mounted on every locale page via `next/dynamic` with `ssr: false` (`components/layout/ClientComponents.tsx:14–17, 37` → `app/[locale]/layout.tsx:81–83`). Cost: a client chunk, a re-render per scroll frame, and layout-triggering width animation for a bar whose entire behavior is `scaleX(scroll-progress)`.
2. **`components/animations/RevealOnScroll.tsx` + `hooks/useScrollReveal.ts`** (83 lines) implement an IntersectionObserver reveal with client state and inline transition styles. Server HTML ships `opacity: 0` inline styles (exploration §9 SSR note): no-JS visitors and non-JS crawlers see hidden content on `/`, `/blog`, `/contacto`, and printing a fresh page prints invisible sections (exploration §9 print note). All 4 consumers are already server components passing only serializable props (`className`, `delay`) — the client boundary buys nothing.

The repo already ships the target pattern: `.hero-mesh-parallax` (globals.css:654–680) uses a top-level keyframe + `@supports (animation-timeline: view())` + inner `prefers-reduced-motion: no-preference`, consumed by a server component with zero JS. This change replaces both JS systems with that pattern — one reveal mechanism, zero client JS, better no-JS/crawler/print behavior, and reduced-motion safety that is structural rather than clamped.

Hard constraint discovered by exploration (§1, fact 4): the global reduce clamp (globals.css:755–765) is a **provably no-op** for timeline-driven animations (`animation-duration`/`animation-delay` are ignored once `animation-timeline` is set). Every new timeline animation MUST be gated structurally, exactly like the hero-mesh block.

## What Changes

### Area 1 — ScrollProgress → `scroll(root)` timeline

**`app/globals.css`** — new top-level block beside the hero-mesh block (~line 680), following its structure exactly:

```css
@keyframes scrollProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }

@supports (animation-timeline: scroll()) {
  .scroll-progress-bar {
    animation: scrollProgress linear both;
    animation-timeline: scroll(root);
  }
}
```

- Base (non-`@supports`) state: `transform: scaleX(0)` on the bar class in `@layer components` → no bar in non-supporting browsers. This matches today's degradation: the current `ssr: false` mount means no-JS users get no bar either.
- Gradient stays `from-primary via-primary/80 to-tertiary` — the sanctioned `--primary`→`--tertiary` family (skill Critical Rule 5). `transform-origin: left`. Animates transform only (main-thread-free, theme-independent).
- Reduce: the bar is **not** gated by `no-preference` (see Decisions D5b) — it is scroll-linked UI feedback that only moves when the user moves; the global clamp cannot and need not touch it.

**`components/ui/ScrollProgress.tsx`** — rewritten as a server component (no `'use client'`, no state, no listener): outer `div` (fixed, `top-0`, `z-50`, `h-1`, `bg-border/30`, `aria-hidden="true"`, `print:hidden`) + inner `.scroll-progress-bar` with the token gradient. Keeps the exported name and file path.

**`components/layout/ClientComponents.tsx`** — delete the ScrollProgress dynamic import (lines 13–17) and its render (lines 36–38). The file survives: it also mounts `PublishedQaForm`, `EasterEggs`, `MatrixRain`, and the dev analytics panel (verified in working tree).

**`app/[locale]/layout.tsx`** — render `<ScrollProgress />` directly (server) at the same tree position `ClientComponents` occupies, preserving DOM order of the fixed overlay. The layout introduces no inner scroller or transformed ancestor for `scroll(root)` (exploration §6).

### Area 2 — RevealOnScroll/useScrollReveal → `view()` timeline reveals

**`app/globals.css`** — new top-level keyframe + `@supports` block, hero-mesh structure:

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
  }
  @media print {
    .reveal { animation: none; }
  }
}
```

- Geometry parity with the hook (`threshold: 0.1`, `rootMargin '0px 0px -100px 0px'`): start at `entry 10%` (≈ 10% visible near the viewport bottom edge; the start offset absorbs the 100px inset), complete at `entry 100%` (fully in view). Exact percentages are tuned at apply time against the visual-parity checklist (exploration §4 deltas 4–5).
- Keyframe values are the hook's exact defaults: `opacity 0→1`, `translateY 40px→0`, `var(--ease-spring)` (timing functions still apply under scroll timelines — exploration fact 5). Duration disappears (scroll distance is the duration), so **no new motion tokens are added**; the hard-coded 600ms is simply retired.
- Base state of every `.reveal` element is fully visible: the hidden state exists only inside the keyframe, which only applies under `@supports` + `no-preference`. Non-supporting browsers, reduce users, and no-JS clients all see content. **No `opacity: 0` on any base class** (the `.animate-hero-reveal-*` mistake — exploration §9 risk 1).
- Print guard `@media print { animation: none }` sits inside `@supports` so killing the animation restores the visible base (see Decisions D5a).

**`components/animations/RevealOnScroll.tsx`** — becomes a thin **server component** (keeps name/path/API; see Decisions D3): renders `<div className={cn('reveal', className)} data-slot="reveal" style={delay ? { '--reveal-range-start': '40%' } : undefined}>`. The `delay={0.2}` prop maps to a later range start (mechanism in Decisions D2; the concrete offset percentage is tuned at apply time — 0.2s of a 600ms transition ≈ one-third of the range). `cn()` merge + `className` passthrough per skill Critical Rule 8. `variants`/`once`/`staggerDelay` props are deleted (zero source consumers — exploration fact 1).

**Deleted (dead code, rg-verified zero source consumers — exploration §3, fact 2):**

- `hooks/useScrollReveal.ts` (only consumer was `RevealOnScroll.tsx:4`)
- `components/animations/AnimationProvider.tsx` (`AnimationProvider` + `useAnimation` never mounted)
- `components/animations/index.ts` trimmed to re-export `RevealOnScroll` only; `StaggeredReveal` and all `*Variants` exports removed.

### Area 3 — Tests

- **`__tests__/integration/app/HomePage.test.tsx:37–40`** and **`__tests__/integration/components/AboutProfile.test.tsx:25`**: the `vi.mock('@/components/animations')` factories keep resolving because the module path survives (Decisions D3); the stale `StaggeredReveal` key is removed from the factories. The module-level `IntersectionObserver`/`matchMedia` setup mocks (`__tests__/setup.ts:35–62`) become unused for reveals but stay (other consumers may rely on them; cleanup is out of scope).
- **`e2e/tests/accessibility-interactions.spec.ts:140–150`** (reduce tripwire): must stay green unchanged — under emulated reduce no `.reveal` animation applies and content is visible by construction. This is the automated guard for the worst failure mode.
- **`e2e/tests/visual.spec.ts`**: one manual verification of Playwright `animations: 'disable'` × scroll-timeline interaction, then regenerate snapshots for `/`, `/blog`, `/contacto`, and dark home (local-only, skipped on CI — exploration fact 11).
- **`e2e/tests/featured-projects.spec.ts` / HeroSection mocks**: untouched — `toBeVisible` ignores opacity and neither ScrollIndicator nor hero-section changes.

## Decisions

### D1 — Reveals ship **reversible** (re-hide on scroll-up); the hook's `once: true` stickiness is retired

**Choice:** accept `view()`'s native reversibility.

**Rationale:** (a) It is the behavior of the repo's only scroll-driven precedent — `.hero-mesh-parallax` runs `animation-range: cover` and reverses; shipping a second, different scroll semantic would be the "third parallel system" the design skill bans. (b) There is no honest pure-CSS `once`; stickiness would require re-introducing JS, which is the thing being deleted. (c) The register is "restrained, engineer-to-peer": progress-mapped motion tied 1:1 to the user's scroll is the *less* theatrical behavior — content animating on its own schedule (time-based, sticky) is the salesier pattern. (d) The re-hide is confined to exit: with the range completing at `entry 100%`, an element stays fully revealed for the entire time it is in view; the animation only plays backwards as the element actually leaves the viewport upward. Perceptually it reads as "going away", not "flickering". (e) Anchor jumps (`#featured-projects`, `#sobre-mi` via ScrollIndicator) land at or past full entry, so jump targets arrive revealed — verified in QA, not assumed.

**Rejected:** keep a JS stickiness wrapper (defeats the zero-client-JS goal and violates one-reveal-mechanism); `animation-fill-mode` tricks (do not affect reversibility — exploration §4 delta 1).

### D2 — The `delay={0.2}` staggers become **`animation-range` start offsets**, not `nth-child`

**Choice:** the surviving `delay` prop maps to an inline `--reveal-range-start` custom property consumed by `animation-range: entry var(--reveal-range-start, 10%) entry 100%`.

**Rationale:** the two delayed call sites (contacto sidebar, AboutProfile right column — exploration §3) are heterogeneous sibling *columns*, not uniform list items; `nth-child` stagger is shaped for repeated children and would couple the stagger to DOM order rather than stated intent, plus need per-parent selectors for exactly two call sites. `animation-delay` is ignored under scroll timelines (exploration fact 5), so the offset must live in the range; a custom property set from the prop keeps the component API (`delay`) stable and the CSS single-source. `animation-range` accepts `<length-percentage>` including `calc()`/`var()` substitution — plain CSS, no `@property` registration needed (exploration §6).

**Rejected:** `nth-child` stagger (wrong shape, DOM-order coupling); `@property`-registered delay variable (adds machinery the two call sites don't need).

### D3 — **Keep `RevealOnScroll` as a thin server component**; delete the dead exports and the hook

**Choice:** the module `@/components/animations` survives with one export: `RevealOnScroll`, now a server `<div className={cn('reveal', className)}>` (+ optional `--reveal-range-start` inline style). `useScrollReveal`, `AnimationProvider`, `StaggeredReveal`, and all `*Variants` are deleted.

**Rationale:** 13 JSX usages across 4 consumers keep working with zero churn (they pass only `className`/`delay` — exploration fact 1); the two vitest mocks that resolve `@/components/animations` (`HomePage.test.tsx:37–40`, `AboutProfile.test.tsx:25`) keep resolving — deleting the path breaks both at mock-resolution time (exploration §9). The wrapper also gives the `delay`→range mapping a home and preserves a named seam so "exactly ONE reveal mechanism" (skill rule) stays enforceable in one file. Cost: ~25 lines of server code.

**Rejected:** delete the module and rewrite 13 usages to bare `div.reveal` + patch 2 test files — larger diff, test churn, and no user-visible gain; the consumers' intent ("this block reveals") deserves to stay declarative.

### D4 — CSS ScrollProgress renders **directly in `app/[locale]/layout.tsx`**, server-side

**Choice:** `ScrollProgress.tsx` is rewritten as a server component and rendered in the locale layout at the current `ClientComponents` tree position; the dynamic `ssr: false` mount is removed from `ClientComponents.tsx` (which survives for its four other mounts).

**Rationale:** a `scroll(root)` bar needs no client mount, no Suspense, and no dynamic import — every page gets it in the server HTML (a `scaleX(0)` visual no-op at scroll top, identical on screen to today's absent-until-hydration bar). The layout is where page chrome lives, and the fixed overlay's DOM position is preserved (exploration §6 confirms no transformed ancestor breaks `position: fixed` there).

**Rejected:** keep rendering it through `ClientComponents` (misclassifies a server element into a file whose purpose is client-only lazy mounts); render per-page instead of per-layout (changes today's every-page behavior for no reason).

### D5 — Print and reduce safety is **added explicitly** (it is in scope, and one part fixes an existing bug)

**D5a — Print guard for reveals: YES.** `@media print { animation: none }` inside the reveal `@supports` block. Without it, printing an unscrolled page reproduces today's latent bug — the current JS reveal ships inline `opacity: 0` and prints hidden sections (exploration §9 print note); with `animation-fill-mode: both` the CSS version would print the 0% keyframe from scroll position 0. Two lines fix a real defect; the repo already treats print as a designed state (`PublishedQaForm.tsx:262` `print:hidden`, `cv/page.tsx` print variants).

**D5b — Progress bar under reduce: stays active**, with `print:hidden` on its wrapper. The bar only moves when the user scrolls — it is user-linked feedback, not autonomous motion, and hiding it from reduce users removes functional information to no vestibular benefit. (Note: the global clamp's duration/delay overrides are ignored under timelines, so the clamp neither helps nor breaks this.) The wrapper gets `print:hidden` per the QA-widget precedent — today's bar prints a gradient line at last-scrolled width, which is noise.

**Rejected:** gate the bar inside `no-preference` (hides functional scroll feedback; the reveals must be gated because they hide *content* — the bar hides nothing); add a `@media print` block for reveals outside `@supports` (redundant — reduce/no-support users already have the visible base state).

## Affected Modules

| Module | Change |
| --- | --- |
| `app/globals.css` | + `scrollProgress` keyframe + `@supports (animation-timeline: scroll())` block; + `revealUp` keyframe + `@supports (animation-timeline: view())` block (with `no-preference` gate + print guard); + `.scroll-progress-bar` base (`scaleX(0)`, `transform-origin: left`) and `.reveal` base class in `@layer components`. Hero-mesh block untouched. |
| `components/ui/ScrollProgress.tsx` | rewrite: client listener component → server component (same export name/path) |
| `components/layout/ClientComponents.tsx` | remove ScrollProgress dynamic import + render (file kept) |
| `app/[locale]/layout.tsx` | render `<ScrollProgress />` server-side |
| `components/animations/RevealOnScroll.tsx` | rewrite: client IO wrapper → thin server `<div>` (`cn()` + `data-slot` + `delay`→`--reveal-range-start`) |
| `components/animations/index.ts` | trim to `RevealOnScroll` re-export |
| `hooks/useScrollReveal.ts` | **delete** |
| `components/animations/AnimationProvider.tsx` | **delete** |
| `__tests__/integration/app/HomePage.test.tsx` | mock factory: drop stale `StaggeredReveal` key |
| `__tests__/integration/components/AboutProfile.test.tsx` | mock factory: same |
| `e2e/tests/visual.spec.ts` | regenerate snapshots (`/`, `/blog`, `/contacto`, dark home) after manual `animations: 'disable'` verification |

Untouched by design: `components/ui/ScrollIndicator.tsx`, `components/sections/hero-section.tsx` (incl. `animate-hero-reveal-1..6`), `.card-hover`, view-transition rules, `.content-auto` subtree (`FeaturedProjects.tsx`), motion tokens.

## Risks + Mitigations

1. **Sections stuck invisible** (worst failure — non-supporting browser, or a future refactor drops the gate): the hidden state exists ONLY inside the keyframe under `@supports` + `no-preference`; base `.reveal` is fully visible; no `opacity: 0` on any base class. Automated tripwire: `accessibility-interactions.spec.ts:140–150` (emulated reduce). Gap: no automated non-supporting-browser tripwire exists — one manual check in a non-supporting engine (or feature-flagged support off) is a required apply-time verification, explicitly listed in tasks.
2. **Reduce clamp is a no-op for timelines** (globals.css:755–765 ignores duration/delay once `animation-timeline` is set): reduce-safety is structural only — the `no-preference` inner gate, hero-mesh style. The spec's reduce scenario MUST assert this structurally (animation absent, not clamped); no duration-based mitigation is permitted anywhere in this change.
3. **Playwright `animations: 'disable'` × scroll-timeline behavior unverified**: fullPage screenshots on the three reveal pages may change state mid-stitch. Mitigation: one manual verification run before trusting or regenerating snapshots; snapshots are local-only (skipped on CI) so churn is contained; 5% `maxDiffPixelRatio` may absorb residual state differences.
4. **Vitest mock module-path breakage**: `HomePage.test.tsx:37–40` and `AboutProfile.test.tsx:25` break if `@/components/animations` disappears. Mitigated by D3 (path survives); the factories only need their stale `StaggeredReveal` key dropped. `npm run test:run` gates this.
5. **`.content-auto` interplay** (`content-visibility: auto`, FeaturedProjects.tsx:30): `view()` geometry inside a containment subtree uses the placeholder box. Mitigation: no reveal is added inside any `content-visibility: auto` subtree (current consumers don't overlap it — exploration §9); a code comment on `.reveal` in globals.css states the disjointness rule.
6. **Anchor jumps land mid-range** (ScrollIndicator → `#featured-projects`/`#sobre-mi`): with reversible reveals a jump target could land partially revealed. Mitigation: range completes at `entry 100%` so in-viewport targets are fully revealed; manual QA step on `/` anchor jumps both from fresh load and mid-scroll.
7. **Tall elements vs `entry` range semantics**: the contacto sidebar and AboutProfile columns may exceed viewport height, where `entry` percentage semantics are less intuitive. Mitigation: apply-time check in Chrome on those two pages; fallback is a `cover`-based range for tall blocks. This is a tuning risk, not an architecture risk.

## Rollback Plan

The change is CSS-additive plus component swaps — **no data, no schema, no migrations, no persisted state of any kind**. Rollback = `git revert` of the change's commits; the reverted tree is exactly the pre-change behavior (JS listener bar returns via `ClientComponents`, IO reveals return with `useScrollReveal`), and the test updates live in the same commits so the suite stays consistent after revert. The two work areas are independently revertible: they touch disjoint files except `globals.css`, where they are two separate `@supports` blocks that can be removed individually. Smallest risky surface if a hotfix is needed in production: delete the `@supports (animation-timeline: view())` reveal block from `globals.css` only — every `.reveal` element instantly falls back to its visible base state (the wrapper div is harmless chrome), zero other code paths involved.

## Success Criteria

1. **Zero client JS for reveals and the progress bar**: `hooks/useScrollReveal.ts` and `AnimationProvider.tsx` deleted; `RevealOnScroll.tsx` and `ScrollProgress.tsx` contain no `'use client'`, no hooks, no event listeners; `ClientComponents.tsx` has no ScrollProgress import. Verified by rg + `npm run build` (no dynamic chunk for ScrollProgress in the client manifest; client bundle shrinks by the removed chunk).
2. **SSR HTML carries no inline `opacity`/`transform` on reveal wrappers** — crawler/no-JS parity: `curl` of `/`, `/blog`, `/contacto` shows revealed content without `opacity: 0` inline styles.
3. `npm run test:run` green (updated mocks included).
4. Playwright e2e green, including the reduce tripwire `accessibility-interactions.spec.ts` (content visible under emulated reduce).
5. Visual parity confirmed on the three reveal pages (`/`, `/blog`, `/contacto`) + dark home, both motion preferences, print preview (reveals visible, no bar), and anchor-jump targets revealed — manual QA checklist; `visual.spec.ts` snapshots regenerated after the `animations: 'disable'` verification.
6. Exactly one reveal mechanism remains in the repo (rg: no IntersectionObserver-based reveal, no second `@supports` variant pattern).

## Non-Goals

- **Variable-font morph spike** (Space Grotesk `wght` axis): facts captured in exploration §7 for a future change — next/font serves static 500/700 instances; axis behavior must be verified against the served file first. Nothing here touches fonts.
- **ScrollIndicator**: already CSS-safe (`motion-reduce:animate-none` cue); stays a client component for `onClick` + next-intl. Must not break.
- **Percentage counter on the progress bar** (`@property` + `counter`): rejected on register grounds — a numeric flex counter is salesy, and `@property` machinery for it is unjustified.
- **`hero-reveal-1..6` and `.card-hover`**: explicitly untouched.
- **View Transitions** (globals.css:682–750, `page-transition.tsx`): out of scope.
- **New motion tokens**: none; the 600ms duration disappears into scroll distance, `--ease-spring` is reused as-is.
