# Tasks — css-scroll-driven-animations

Built from `design.md` (AD-1..AD-8, Complete CSS, Complete component sources, Test design, Migration & sequencing) and `specs/ui/spec.md`. Line references verified against the working tree on 2026-11-05.

**Test command (every phase):** `npm run test:run`. **Typecheck:** `npx tsc --noEmit` (no repo script exists — open question 4). **Lint:** `npm run lint` (biome).

**BUILD GATE:** `npm run build` is a verify-phase-only command (config.yaml `verify.build_command`). NO task before 7.1 runs it, and no apply-phase task starts a dev/preview server. Evidence commands in 7.1 run against build output only.

**TDD mode:** strict RED-GREEN-REFACTOR. Phase 1 establishes the RED state (task 1.1); tasks 2.1–3.2 are the GREEN steps, each naming the assertions (numbered 1–24 per design § Test design) it turns green. The suite stays partially red between GREEN tasks — that is expected; full green first happens in 3.2.

---

## Phase 1 — RED (tests first)

### 1.1 Create the source-guard/component test file + fix the HomePage mock factory [M]

**Files touched:**
- `__tests__/integration/components/ScrollDrivenAnimations.test.tsx` (NEW)
- `__tests__/integration/app/HomePage.test.tsx` (edit: delete the stale `StaggeredReveal` key at line 39 of the `vi.mock('@/components/animations')` factory, lines 37–40; keep the `RevealOnScroll` passthrough)

**Task:** One vitest file (AD-5), three describes, exactly the 24 assertions of design § Test design. Structure per the `VisualBatch5QuickWins.test.tsx` precedent: `readSource = (path) => readFileSync(resolve(process.cwd(), path), 'utf8')` + a brace-matching `extractBlock(source, startIndex)` helper (counts `{`/`}` from the first `{` at/after the index) to extract `@supports` / `@media` / `@keyframes` / `@layer components` blocks — structural assertions, NO CSS parser dependency, NO computed-style-in-happy-dom lies. Component tests render via `@/__tests__/test-utils`.

**Assertions to implement (exact list):**

describe('RevealOnScroll server wrapper') — happy-dom component tests + file guards:
- [ ] 1. renders a `div` whose class contains both `reveal` and a passed `className` (`'space-y-6'`) — the `cn()` merge contract
- [ ] 2. sets `data-slot="reveal"`
- [ ] 3. with `delay={0.2}`: the element's `style` attribute contains `--reveal-range-start: 40%` AND `--reveal-tall-start: 20%` (string assertion on the attribute)
- [ ] 4. with `delay={0.3}`: style contains `--reveal-range-start: 55%` and `--reveal-tall-start: 25%` — pins the FORMULA, defeats hardcoding
- [ ] 5. without `delay`: no `style` attribute at all
- [ ] 6. with `delay={0}`: no `style` attribute
- [ ] 7. whenever a style attribute exists it contains none of `opacity:`, `transform:`, `transition`
- [ ] 8. source guard on `components/animations/RevealOnScroll.tsx`: no `'use client'`, no `useEffect`/`useState`/`useRef`, no `IntersectionObserver`, no `useScrollReveal` import, imports `cn` from `@/lib/utils`, contains no `Variants`/`StaggeredReveal`
- [ ] 9. `components/animations/index.ts` source equals the single re-export (`export { RevealOnScroll } from './RevealOnScroll';`) — module path survives, trimmed
- [ ] 10. deleted surface: `existsSync` false for `hooks/useScrollReveal.ts` and `components/animations/AnimationProvider.tsx`

describe('ScrollProgress server component') — happy-dom component tests + file guards:
- [ ] 11. renders the outer wrapper with `aria-hidden="true"` and classes `fixed`, `top-0`, `z-50`, `h-1`, `bg-border/30`, `print:hidden`
- [ ] 12. renders exactly one inner child with classes `scroll-progress-bar`, `h-full`, `bg-gradient-to-r`, `from-primary`, `via-primary/80`, `to-tertiary` (sanctioned gradient family)
- [ ] 13. no `style` attribute anywhere in the rendered output (no inline `width`%)
- [ ] 14. source guard on `components/ui/ScrollProgress.tsx`: no `'use client'`, no `addEventListener`, no `useState`/`useEffect`, no `next/dynamic`
- [ ] 15. source guard on `components/layout/ClientComponents.tsx`: no `ScrollProgress` reference at all; still references `PublishedQaForm`, `EasterEggs`, `MatrixRain`, `AnalyticsDebugPanel`

describe('globals.css scroll-driven structure') — brace-matched structural guards:
- [ ] 16. exactly one `@supports (animation-timeline: scroll())` block; contains `.scroll-progress-bar`, `animation: scrollProgress linear both`, `animation-timeline: scroll(root)`; contains NO `prefers-reduced-motion` (D5b negative)
- [ ] 17. `@keyframes scrollProgress`: after comment-stripping every declaration line starts with `transform:` (no `width`/`left`/`right`); `@keyframes revealUp`: every declaration starts with `opacity:` or `transform:`
- [ ] 18. exactly two `@supports (animation-timeline: view())` blocks: one containing `.hero-mesh-parallax` (untouched precedent, never merged) and one containing `.reveal` (new reveal block)
- [ ] 19. inside the reveal `@supports` block: `@media (prefers-reduced-motion: no-preference)` appears BEFORE `@media print`; the print sub-block contains `animation: none` targeting `.reveal`
- [ ] 20. inside the `no-preference` sub-block: a `.reveal` rule declaring `animation: revealUp var(--ease-spring) both`, `animation-timeline: view()`, `animation-range: entry var(--reveal-range-start, 10%) entry 100%`; a `.reveal-tall` rule AFTER the `.reveal` rule whose body contains ONLY `animation-range: cover var(--reveal-tall-start, 10%) cover 40%` (no `animation`/`animation-timeline` in its body)
- [ ] 21. `revealUp` appears exactly twice in the whole file (keyframes definition + the single gated application)
- [ ] 22. inside `@layer components`: base `.reveal` rule declares none of `opacity`/`transform`/`visibility`/`animation` and its extracted block contains the string `content-visibility` (disjointness comment); `.scroll-progress-bar` base rule declares exactly `transform: scaleX(0)` and `transform-origin: left`
- [ ] 23. `@property` appears nowhere in the file (count 0)
- [ ] 24. lockstep guard: `RevealOnScroll.tsx` declares `RANGE_START_DEFAULT_PCT = 10`, `STANDARD_RANGE_END_PCT = 100`, `TALL_RANGE_END_PCT = 40`, and the globals.css `animation-range` lines contain the matching fallbacks `10%`, `100%`, `40%`

**Acceptance criteria (RED state):**
- [ ] RED: `npm run test:run` shows `ScrollDrivenAnimations.test.tsx` failing on the unchanged tree (assertions 1–24 fail for the right reasons: no CSS blocks, components still client-side, files still exist)
- [ ] Pre-existing suites green — in particular `HomePage.test.tsx` and `AboutProfile.test.tsx` still pass after the factory edit (module path `@/components/animations` still resolves; `AboutProfile.test.tsx` gets NO edit — its factory already mocks only `RevealOnScroll`)
- [ ] `__tests__/setup.ts` IntersectionObserver/matchMedia mocks untouched (lines 35–62)
- [ ] No test asserts computed animation behavior happy-dom cannot run (honesty clause, AD-5)

**Depends on:** —

### 1.2 Typecheck green after test authoring [S]

**Files touched:** none (validation only; fix TS errors in the new test file if typecheck flags any)

**Acceptance criteria:**
- [ ] `npx tsc --noEmit` exits 0 (resolves design open question 4: there is no `typecheck` script; `npx tsc --noEmit` is the sanctioned command, re-run in 3.2 and relied on by verify's build type pass)

**Depends on:** 1.1

---

## Phase 2 — GREEN, CSS (`app/globals.css` only)

### 2.1 Insertion A: base rules at the end of `@layer components` [S]

**Files touched:** `app/globals.css`

**Task:** Paste design § Complete CSS / Insertion A verbatim after `.shine-effect:hover::before` (current line 479), before the layer's closing `}` (current line 480): the `.reveal` base rule (intentionally empty body; the comment block carries the "never hide here" contract AND the `content-visibility: auto` / `.content-auto` disjointness rule) and the `.scroll-progress-bar` base rule (`transform: scaleX(0); transform-origin: left;` and nothing else).

**Acceptance criteria:**
- [ ] `.reveal` rule body sets NO `opacity`/`transform`/`visibility`/`animation` (assertion 22 partial)
- [ ] `.reveal` comment block contains `content-visibility` (assertion 22 partial)
- [ ] `.scroll-progress-bar` base rule declares exactly `transform: scaleX(0)` + `transform-origin: left`
- [ ] Insertion sits INSIDE `@layer components` (layer membership matches sibling classes)

**Depends on:** 1.1, 1.2

### 2.2 Insertion B: top-level scroll-driven section [M]

**Files touched:** `app/globals.css`

**Task:** Paste design § Complete CSS / Insertion B verbatim after the hero-mesh `@supports` block's closing `}` (current line 680), before the View Transitions comment (current line 682), in this order: `@keyframes scrollProgress` (`transform: scaleX(0)` → `scaleX(1)`, nothing else) + `@supports (animation-timeline: scroll())` block (`.scroll-progress-bar { animation: scrollProgress linear both; animation-timeline: scroll(root); }` — NO reduce gate, D5b); then `@keyframes revealUp` (`opacity: 0; transform: translateY(40px)` → `opacity: 1; transform: translateY(0)`) + `@supports (animation-timeline: view())` block containing, in order: `@media (prefers-reduced-motion: no-preference)` with the `.reveal` rule (`animation: revealUp var(--ease-spring) both; animation-timeline: view(); animation-range: entry var(--reveal-range-start, 10%) entry 100%;`) and after it the `.reveal-tall` override (`animation-range: cover var(--reveal-tall-start, 10%) cover 40%;` ONLY), then `@media print { .reveal { animation: none; } }` AFTER the gate. Comments in English.

**RED/GREEN framing:** RED was established in 1.1; this task + 2.1 are the GREEN step for the CSS-structure describe.

**Acceptance criteria (GREEN for assertions 16–24, except the TS half of 24):**
- [ ] Assertions 16, 17, 18, 19, 20, 21, 22, 23 of `ScrollDrivenAnimations.test.tsx` now pass (CSS side of 24 passes once constants exist in 3.1; until then 24 stays red on the TS side — expected)
- [ ] Component describes (1–15) still red — expected at this point
- [ ] Hero-mesh block (globals.css:654–680) untouched; the two `@supports (animation-timeline: view())` blocks are separate (assertion 18)
- [ ] No `@property` anywhere; no new motion token — `var(--ease-spring)` reused; no duration in the shorthand (mirrors hero-mesh `linear both`)
- [ ] Nothing else in globals.css changed (two insertions only)

**Depends on:** 2.1

---

## Phase 3 — GREEN, components

### 3.1 Rewrite `RevealOnScroll` as a server wrapper; trim `index.ts`; delete dead surface [M]

**Files touched:**
- `components/animations/RevealOnScroll.tsx` (full replacement, 147 lines → design § Complete component sources)
- `components/animations/index.ts` (full replacement: `export { RevealOnScroll } from './RevealOnScroll';`)
- `hooks/useScrollReveal.ts` (DELETE)
- `components/animations/AnimationProvider.tsx` (DELETE)

**Task:** Replace `RevealOnScroll.tsx` with the exact design source: no `'use client'`, no hooks, no IO; `cn('reveal', className)` merge + `data-slot="reveal"`; props exactly `children | className | delay`; stagger computed from named constants (`RETIRED_TRANSITION_S = 0.6`, `RANGE_START_DEFAULT_PCT = 10`, `STANDARD_RANGE_END_PCT = 100`, `TALL_RANGE_END_PCT = 40`) via `delayToRangeStart` (`Math.round`), emitted as `{ '--reveal-range-start': …, '--reveal-tall-start': … } as CSSProperties` ONLY when `delay > 0`, else `undefined`. `delay={0.2}` → `'40%'`/`'20%'` (spec literals); `delay={0.3}` → `'55%'`/`'25%'`.

**RED/GREEN framing:** GREEN step for assertions 1–10.

**Acceptance criteria:**
- [ ] Assertions 1–10 pass (class merge, `data-slot`, 40%/20% literals, 55%/25% formula pin, no style attribute undelayed/`delay={0}`, no inline `opacity:`/`transform:`/`transition`, source guards, single re-export, both files gone)
- [ ] Assertion 24 (lockstep TS↔CSS) now passes fully — constants 10/100/40 match the CSS fallbacks `10%`/`100%`/`40%`
- [ ] `HomePage.test.tsx` + `AboutProfile.test.tsx` green — the mock-resolution gate: both `vi.mock('@/components/animations')` factories resolve because the module path survives
- [ ] `rg 'StaggeredReveal|Variants' components/ app/` returns no source hits; `rg 'IntersectionObserver' components/ hooks/ app/` returns nothing (setup mocks in `__tests__/` don't match this scope)
- [ ] `npx tsc --noEmit` green; `npm run lint` green

**Depends on:** 2.2 (test 24 reads the CSS fallback literals)

### 3.2 Rewrite `ScrollProgress`; unmount from `ClientComponents`; mount in the locale layout [M]

**Files touched:**
- `components/ui/ScrollProgress.tsx` (full replacement, 44 lines → design source)
- `components/layout/ClientComponents.tsx` (remove dynamic import lines 13–17 + render block lines 35–38; keep PublishedQaForm, EasterEggs, MatrixRain, analytics panel)
- `app/[locale]/layout.tsx` (import after `RippleListener` alphabetically; render `<ScrollProgress />` as first child inside `<AnnouncerProvider>`, immediately before the `<Suspense><ClientComponents /></Suspense>`)

**Task:** `ScrollProgress.tsx` becomes the exact design source: server component, outer `div` with `fixed top-0 left-0 right-0 h-1 bg-border/30 z-50 print:hidden` + `aria-hidden="true"`, inner `div` with `scroll-progress-bar h-full bg-gradient-to-r from-primary via-primary/80 to-tertiary` (sanctioned gradient family, no hardcoded colors), no inline width, no transition classes.

**RED/GREEN framing:** GREEN step for assertions 11–15 — this task completes the suite.

**Acceptance criteria:**
- [ ] Assertions 11–15 pass; FULL `npm run test:run` green (first full-green run of the change)
- [ ] `npx tsc --noEmit` green; `npm run lint` green (biome, CSS-aware formatter: single quotes, 2-space)
- [ ] Layout renders `<ScrollProgress />` before the ClientComponents Suspense inside `<AnnouncerProvider>` (DOM order of the fixed overlay preserved)
- [ ] `rg "'use client'" components/ui/ScrollProgress.tsx components/animations/RevealOnScroll.tsx` → no hits; `rg "addEventListener\('scroll'" components/ app/` → no hits
- [ ] No build run in this phase (build gate — 7.1 owns it)

**Depends on:** 3.1

---

## Phase 4 — Measurement + bounded tuning (apply-time protocol)

### 4.1 Tall-subject measurement protocol at 390×844 and 1440×900 [M]

**Files touched (conditional, only where measured taller):**
- `app/[locale]/(pages)/contacto/page.tsx` (line 53 sidebar usage, `delay={0.2}`)
- `components/sections/AboutProfile.tsx` (lines 21 and 66 columns; line 66 has `delay={0.2}`)

**Task (required, not optional):** In Chrome, at BOTH 390×844 and 1440×900, measure the three flagged subjects against the scrollport height. Append `reveal-tall` to the `className` of exactly those measured taller than the scrollport at EITHER viewport (≤ 3 className edits, e.g. `className="space-y-6 reveal-tall"`). Record subject heights + viewport heights in the apply notes. No props change anywhere; the other 10 usages untouched.

**Acceptance criteria:**
- [ ] Recorded measurements (heights at both viewports) for all three subjects exist in the task notes
- [ ] Exactly the subjects with `H > V` at either viewport carry `reveal-tall`; none others do
- [ ] Diff of the 4 consumer files shows ONLY className string additions at flagged sites — zero prop churn (13 usages otherwise untouched)
- [ ] Hard bound respected: no subject taller than ~2.5× scrollport becomes/is kept as a single reveal subject (none is expected to approach it)
- [ ] `npm run test:run` still green (className additions don't affect the suite); if a `reveal-tall` class lands, assertion set remains green

**Depends on:** 3.2

### 4.2 Visual-parity tuning within the bounded latitude [S]

**Files touched (only if tuning is warranted by the visual-parity checklist):**
- `app/globals.css` (the `10%`/`100%` literals of the `.reveal` `animation-range`)
- `components/animations/RevealOnScroll.tsx` (`RANGE_START_DEFAULT_PCT` / `STANDARD_RANGE_END_PCT` in lockstep)

**Task:** Tune the standard range ONLY within the spec's latitude: start `entry 10% … entry 35%`, end `entry 85% … entry 100%` (toward 35% restores stricter parity with the hook's `-100px` bottom inset). Test 24 enforces lockstep. The tall range end (`cover 40%`) is fixed by the saturation derivation — NOT tuning latitude.

**Acceptance criteria:**
- [ ] Final values are inside the latitude bounds (or, if the checklist demands otherwise: STOP and flag a spec amendment — do not silently change)
- [ ] `npm run test:run` green — assertion 24 proves TS constants and CSS fallbacks moved in lockstep
- [ ] Keyframe values (`opacity 0→1`, `translateY 40px→0`), easing (`var(--ease-spring)`), fill (`both`), and the gating structure unchanged

**Depends on:** 4.1

---

## Phase 5 — e2e

### 5.1 Append the reduce computed-style test to the accessibility spec [S]

**Files touched:** `e2e/tests/accessibility-interactions.spec.ts` (append ONE test inside the existing locale loop; lines 140–150 byte-untouched)

**Task:** Append the exact AD-7 test block: `page.emulateMedia({ reducedMotion: 'reduce' })` → `goto(localeCase.path)` → `dismissCookieConsent(page)` → evaluate first `[data-slot="reveal"]`: `expect(state.animationName).toBe('none')` (structural: no animation applied at all, not clamped) AND `expect(state.opacity).toBe('1')` (base state visible by construction).

**Acceptance criteria:**
- [ ] The existing reduce tripwire (lines 140–150) is unchanged and green
- [ ] New test passes in a real engine for every locale case
- [ ] The new test fails if the `no-preference` gate is dropped (that is its purpose — catches what the clamp cannot)

**Depends on:** 3.2

### 5.2 Determinism probe + snapshot regeneration (AD-7 decision table) [M]

**Files touched:**
- `e2e/tests/visual.spec.ts` (NO change in the primary branch; fallback branch adds `await page.addStyleTag({ content: '.reveal, .scroll-progress-bar { animation: none !important; }' })` before the four `toHaveScreenshot` calls)
- `e2e/tests/visual.spec.ts-snapshots/` (regenerate `homepage.png`, `blog.png`, `contact.png`, `homepage-dark.png` — local-only, CI-skipped)

**Task:** Probe procedure on the changed tree: (1) `npx playwright test e2e/tests/visual.spec.ts --update-snapshots`; (2) run again WITHOUT the flag — must pass (capture determinism); (3) manually inspect the PNGs: below-fold reveal sections must be VISIBLE, not `opacity: 0` ghosting (fullPage capture uses CDP capture-beyond-viewport; whether `view()` timelines evaluate against the expanded viewport is the unknown — exploration fact 11). Decision table: (a) second run green AND below-fold visible → done; (b) flaky on reveal regions OR ghosting → apply the fallback style pin, regenerate ONCE. Either branch ends in exactly one trusted regeneration.

**Acceptance criteria:**
- [ ] Determinism probe executed with recorded outcome (branch a or b of the decision table — resolves design open question 2)
- [ ] Exactly one final regeneration; second (verification) run green
- [ ] Regenerated PNGs inspected: below-fold reveal content visible on all four snapshots
- [ ] If fallback branch taken: `addStyleTag` pin is capture-only, `!important`-scoped to the two classes, with a comment stating why
- [ ] Old snapshots NOT kept hoping `maxDiffPixelRatio: 0.05` absorbs the DOM change

**Depends on:** 5.1 (e2e file stable before snapshot work)

### 5.3 Full e2e run [S]

**Files touched:** none (validation only)

**Acceptance criteria:**
- [ ] `npm run e2e` green — including `featured-projects.spec.ts` and the ScrollIndicator paths (untouched, `toBeVisible` ignores opacity)
- [ ] If Playwright browsers are unavailable in the environment: report `blocked` with the exact reason (repo convention) — do NOT silently skip

**Depends on:** 5.1, 5.2

---

## Phase 6 — Manual QA (required apply-time tasks, documented outcomes — no automated tripwire exists)

### 6.1 Non-supporting engine check [S]

- [ ] A browser without `animation-timeline` support (or with the feature disabled): all reveal content fully visible on `/`, `/blog`, `/contacto`; no bar; no errors; no layout shift. Outcome documented.

**Depends on:** 3.2

### 6.2 Print preview check [S]

- [ ] Print preview on `/`, `/blog`, `/contacto` at scroll 0: every reveal section prints fully visible; no gradient bar line (`print:hidden` wrapper). Outcome documented (fixes the latent defect where today's fresh page prints hidden sections).

**Depends on:** 3.2

### 6.3 Anchor-jump targets revealed [S]

- [ ] `#featured-projects` and `#sobre-mi` jumps land fully revealed — from fresh load AND mid-scroll, smooth and reduce/auto behavior. Outcome documented.

**Depends on:** 3.2

### 6.4 Reduce-emulation DevTools check [S]

- [ ] DevTools reduce emulation: computed `animation-name` is `none` on `.reveal` elements (not a clamped duration); the progress bar still tracks scroll. Outcome documented.

**Depends on:** 3.2

### 6.5 Both themes, both directions, three pages [S]

- [ ] Light + dark themes on `/`, `/blog`, `/contacto`: reveals play on downward entry, hold while in view, reverse only on exit-through-bottom; staggered pairs (contacto sidebar, AboutProfile right column) separate by scroll position and complete together; bar tracks scroll in both directions. Outcome documented against the proposal's visual-parity checklist.

**Depends on:** 4.2 (QA the final tuned tree)

---

## Phase 7 — Verify (owns the build — GATED)

### 7.1 Build + zero-client-JS evidence + coverage [M]

**Files touched:** none (evidence collection only; this is the ONLY task authorized to run `npm run build`)

**Task (AD-6, in order):**
1. `npm run build` (config-declared verify build).
2. No client chunk: `rg -l "ScrollProgress" .next/static/` → must return NOTHING.
3. Server HTML carries the bar: `rg -l "scroll-progress-bar" .next/server/app/` → must hit the prerendered route HTML files.
4. No inline hidden styles: `rg -n 'style="[^"]*opacity' .next/server/app/` over the prerendered `/`, `/blog`, `/contacto` HTML → must return NOTHING.
5. Informational (not gating): client chunk count/size delta per route from `.next/app-build-manifest.json`.
6. `npm run test:run` green; `npm run test:coverage` meets thresholds (35 global).

**Acceptance criteria:**
- [ ] Build succeeds; type pass included
- [ ] Evidence commands 2–4 produce exactly the required results (empty / hits / empty)
- [ ] Coverage thresholds met
- [ ] Manual-check outcomes from Phase 6 all recorded (none left pending)
- [ ] No live `curl`/`next start` theater required — prerendered HTML is the primary evidence

**Depends on:** 4.2, 5.3, 6.1–6.5

---

## Review Workload Forecast (for the orchestrator's delivery gate)

Per-phase changed-line estimates (additions + deletions both count; binary PNGs excluded):

| Phase | Files | Changed lines |
| --- | --- | --- |
| 1 — RED tests | new test file (~260, precedent file is 224 with fewer assertions) + HomePage factory (−1) | ~260 |
| 2 — CSS | Insertion A (~28) + Insertion B (~83) | ~110 |
| 3 — components | RevealOnScroll 147→~62 (~209), index.ts 10→1 (~11), deleted useScrollReveal.ts (83) + AnimationProvider.tsx (35), ScrollProgress 44→~25 (~69), ClientComponents (−8/~16), layout.tsx (+7) | ~430 |
| 4 — measurement/tuning | ≤3 className additions + possible 2-constant/2-literal tuning | ~5 |
| 5 — e2e | appended reduce test (~16) + possible fallback style pin (~4) | ~20 |
| 6 — manual QA | none (documented outcomes) | 0 |
| 7 — verify | none (evidence only) | 0 |
| **Total** | | **~825 (±60)** |

**400-line budget risk vs this project's 800-line budget:** **AT/SLIGHTLY OVER BUDGET — flagged**. Realistic landing zone is 765–885; central estimate ~825 is ~103% of the 800-line `review_budget_changed_lines`. Two structural mitigations keep true review load well under the number: (a) ~118 lines are pure deletions of rg-verified zero-consumer files (`useScrollReveal.ts`, `AnimationProvider.tsx`) — mechanical verification, not design review; (b) ~260 lines are one mechanical test file following an existing 224-line precedent. Review-bearing lines (new CSS + component rewrites + layout/mount edits) are ~230. Regardless: total > 400 changed lines means the pre-pr gate fires the FULL 4R fan-out (`review-risk`, `review-resilience`, `review-readability`, `review-reliability`) under both the generic trigger table and Javier's over-review bias — that is already the plan of record, so the overage costs nothing in lens count, only signals the orchestrator should not split review effort per-phase.

**Chained PRs recommended: No.** The phases are strict RED→GREEN interdependent: the Phase 1 suite is red until 3.2 completes, and test 24 pins a cross-file TS↔CSS contract — any mid-chain split ships a red suite or a desynced contract. One PR, one review pack, full 4R.

**Decision needed before apply: No.** All eight settle points are decided in design AD-1..AD-8. The four open questions below are data-collection outcomes that resolve themselves at apply time (design: "self-resolving"), each with a pre-agreed decision table and no user input required. Out-of-latitude tuning is the only path to a decision, and it terminates in a spec amendment request, not an apply-time choice.

## Open questions (design § Open questions — all self-resolving at apply time)

1. **Measurement outcomes** — which of the three flagged subjects exceed the scrollport → resolved by the protocol in **task 4.1** (data-driven `reveal-tall` additions; not pre-decidable).
2. **Snapshot probe outcome** — primary regeneration vs fallback style-pinned capture → resolved by the AD-7 decision table in **task 5.2** (both branches end in one regeneration).
3. **Final tuning values** — within `entry 10–35%` / `entry 85–100%` latitude only → resolved in **task 4.2** (lockstep enforced by assertion 24; anything outside is a spec amendment).
4. **Typecheck command** — no `typecheck` script in `package.json` → resolved in **task 1.2**: `npx tsc --noEmit` is the sanctioned command (re-verified in 3.2; verify's `npm run build` re-runs the type pass).
