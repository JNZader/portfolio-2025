# Apply Progress — css-scroll-driven-animations (Batch 1: Phases 1–3 + Batch 2: Phases 4–5 + Batch 3: Phase 6)

Date: 2026-11-05. Strict TDD mode (RED → GREEN → REFACTOR). Working tree at repo
`main` @ 7a378e4. No commits made — all changes left in the working tree. Build gate
respected: no `npm run build` at any point (batch 1 also ran no dev server; batch 2's
e2e tasks ran one on port 3000 under the orchestrator's explicit apply-time
authorization, which supersedes the tasks.md "no apply-phase dev server" line for this
batch only).

## Phase 1 — RED

### Task 1.1 — Test file + HomePage mock factory — **done**

- [x] New `__tests__/integration/components/ScrollDrivenAnimations.test.tsx`: three
  describes, exactly the 24 assertions of design § Test design (one `it` per numbered
  assertion). `readSource` + brace-matching `extractBlock` + `stripComments` +
  `declarationLines` helpers per the VisualBatch5QuickWins precedent; component tests
  render via `@/__tests__/test-utils`.
- [x] `__tests__/integration/app/HomePage.test.tsx`: deleted the stale `StaggeredReveal`
  key from the `vi.mock('@/components/animations')` factory; kept the `RevealOnScroll`
  passthrough.
- [x] RED evidence — `npm run test:run`: `Test Files 1 failed | 79 passed (80)`,
  `Tests 23 failed | 671 passed (694)`. Focused run
  `npx vitest run __tests__/integration/components/ScrollDrivenAnimations.test.tsx`:
  `23 failed | 1 passed (24)`. Inspected failure messages — all for the right reasons
  (className lacks `reveal`, style carries the old inline `opacity: 0; transform: …`
  state, `'use client'` present, index.ts exports the old surface, files still exist,
  no CSS blocks).
- [x] Pre-existing suites green, in particular `HomePage.test.tsx` (2 tests) and
  `AboutProfile.test.tsx` (2 tests) after the factory edit. `AboutProfile.test.tsx`
  got NO edit (its factory already mocks only `RevealOnScroll` — AD-7 verified).
- [x] `__tests__/setup.ts` untouched (IO/matchMedia mocks intact).
- [x] No computed-animation assertions (honesty clause).

Files changed: `__tests__/integration/components/ScrollDrivenAnimations.test.tsx` (NEW,
~330 lines), `__tests__/integration/app/HomePage.test.tsx` (−1 line).

### Task 1.2 — Typecheck — **done**

- [x] `npx tsc --noEmit` exit 0.

Note: the first run flagged 5 TS errors in the NEW test file (TS18048/TS2345 —
`revealBlock` possibly `undefined` from `.find()`), exactly the case task 1.2
anticipates ("fix TS errors in the new test file if typecheck flags any"). Fixed with a
throwing `revealSupportsBlock(): string` helper; RED state preserved after the fix
(focused run still `23 failed | 1 passed`).

## Phase 2 — GREEN, CSS

### Task 2.1 — Insertion A (base rules at end of `@layer components`) — **done**

- [x] `.reveal` base rule body sets no `opacity`/`transform`/`visibility`/`animation`
  (assertion 22 partial).
- [x] `.reveal` comment block contains `content-visibility` (disjointness rule).
- [x] `.scroll-progress-bar` base rule declares exactly `transform: scaleX(0)` +
  `transform-origin: left`.
- [x] Insertion sits inside `@layer components` (anchored on
  `.shine-effect:hover::before` … before the layer's closing `}`).

Evidence: focused run after 2.1 → assertion 22 turned green (only change vs RED).
Pasted verbatim from design § Complete CSS / Insertion A.

Files changed: `app/globals.css` (Insertion A only).

### Task 2.2 — Insertion B (top-level scroll-driven section) — **done**

- [x] Assertions 16, 17, 18, 19, 20, 21, 22, 23 pass (verified: CSS describe fully
  green; assertion 24 stayed red on the TS side only until 3.1 — expected).
- [x] Component describes (1–15) still red at this checkpoint — expected.
- [x] Hero-mesh block untouched; two separate `@supports (animation-timeline: view())`
  blocks (assertion 18 green).
- [x] No `@property`; `var(--ease-spring)` reused; no duration in the shorthand.
- [x] Nothing else in globals.css changed: `git diff --numstat app/globals.css` →
  `111  0` (pure insertions; the two designed blocks verbatim).

Evidence: focused run after 2.2 → `8 passed | 16 failed (24)` with 16–23 all green.

Files changed: `app/globals.css` (Insertion B only; cumulative +111/−0).

## Phase 3 — GREEN, components

### Task 3.1 — RevealOnScroll server wrapper; index trim; deletions — **done**

- [x] Assertions 1–10 pass (class merge, `data-slot`, 40%/20% literals, 55%/25%
  formula pin, no style attribute undelayed/`delay={0}`, no inline hidden state,
  source guards, single re-export, both files gone).
- [x] Assertion 24 passes fully — constants 10/100/40 match CSS fallbacks
  `10%`/`100%`/`40%`.
- [x] `HomePage.test.tsx` + `AboutProfile.test.tsx` green (mock-resolution gate):
  focused run of both → `2 files / 4 tests passed`.
- [x] Source residue (see Deviation D4 for the literal-command nuances):
  `rg 'StaggeredReveal' components/ app/` → 0 hits;
  `rg 'Variants|IntersectionObserver' components/animations/ hooks/` → 0 hits;
  `components/animations/index.ts` = single re-export (assertion 9 green).
- [x] `npx tsc --noEmit` exit 0; `npm run lint` — 9 warnings + 1 info, IDENTICAL to
  the pre-change baseline (verified via `git stash` round-trip): zero new issues.

Files changed: `components/animations/RevealOnScroll.tsx` (147 → 62 lines, design
source verbatim), `components/animations/index.ts` (single re-export),
`hooks/useScrollReveal.ts` (DELETED), `components/animations/AnimationProvider.tsx`
(DELETED). Zero-consumer claims re-verified before deletion (only consumer of
`useScrollReveal` was the old `RevealOnScroll.tsx:4`; `AnimationProvider`/`useAnimation`
never imported outside the module).

### Task 3.2 — ScrollProgress server component; unmount; layout mount — **done**

- [x] Assertions 11–15 pass; FULL `npm run test:run` green — FIRST full-green run of
  the change: `Test Files 80 passed (80)`, `Tests 694 passed (694)` (baseline was
  79 files / 670 tests; +1 file, +24 tests).
- [x] `npx tsc --noEmit` exit 0; `npm run lint` identical to baseline (no new issues).
- [x] Layout renders `<ScrollProgress />` as first child inside `<AnnouncerProvider>`,
  immediately before the `<Suspense><ClientComponents /></Suspense>`; import placed
  alphabetically after `RippleListener`.
- [x] `rg "'use client'" components/ui/ScrollProgress.tsx
  components/animations/RevealOnScroll.tsx` → no hits.
  `rg "addEventListener\('scroll'" components/ app/` → 2 hits, BOTH pre-existing and
  untouched by this change (`components/ui/BackToTop.tsx`,
  `components/projects/FeaturedProjectsRail.tsx`; empty `git diff` on both). See D4.
- [x] No build run in this phase.

Files changed: `components/ui/ScrollProgress.tsx` (44 → 23 lines, design source
verbatim), `components/layout/ClientComponents.tsx` (−11 lines: dynamic import + render
block removed; PublishedQaForm/EasterEggs/MatrixRain/AnalyticsDebugPanel kept),
`app/[locale]/layout.tsx` (+4: import + mount with comment).

## Deviations from design

None to the designed CSS/component bytes — both insertions and all three component
sources are verbatim from design § Complete CSS / § Complete component sources. Four
documented nuances, all in test mechanics or acceptance-command precision:

- **D1 — Assertions 17/21 vs the designed CSS comment (design-internal collision,
  resolved in the test, CSS untouched).** The designed Insertion A comment states
  "the hidden state exists only inside @keyframes revealUp" — a third textual
  `revealUp` occurrence and the first `indexOf('@keyframes revealUp')` hit. A raw
  count (assertion 21: "exactly twice") would see 3, and 17's block extraction would
  grab the comment-following `.reveal` rule instead of the keyframes. Fix: 17 anchors
  on the selector form `@keyframes revealUp {` (the comment's form is
  `revealUp, applied`); 21 counts on the comment-stripped source. Both preserve the
  designed semantics ("keyframes definition + the single gated application") against
  the designed CSS bytes.
- **D2 — Assertion 23 cannot be red on a clean tree.** `@property` never existed in
  globals.css, so the negative guard passes trivially in the RED state. RED evidence
  is therefore `23 failed | 1 passed`, not 24/24 — inherent to a negative guard, not a
  test defect.
- **D3 — Assertion 24 implemented as lockstep extraction, not hardcoded literals.**
  The test extracts `RANGE_START_DEFAULT_PCT` / `STANDARD_RANGE_END_PCT` /
  `TALL_RANGE_END_PCT` from the TS source and asserts the CSS `animation-range`
  fallbacks match those values. At the shipped defaults this verifies exactly the
  designed literals (10/100/40 ↔ `10%`/`100%`/`40%`); it is also the only reading
  under which task 4.2's acceptance ("assertion 24 proves TS constants and CSS
  fallbacks moved in lockstep", with only globals.css + RevealOnScroll.tsx as
  permitted edit targets) is satisfiable without editing the test.
- **D4 — Three acceptance rg commands are literally non-empty on the baseline tree;
  designed intent verified instead.** (a) `rg 'StaggeredReveal|Variants' components/
  app/`: `StaggeredReveal` → 0 hits; `Variants` hits only pre-existing cva symbols
  (`buttonVariants`, `cardVariants`, `badgeVariants`, `sectionVariants`,
  `VariantProps`) and design-system page JSX text — never part of the deleted
  animations surface; `components/animations/` + `hooks/` have zero residue. (b)
  `rg 'IntersectionObserver' components/ hooks/ app/`: 2 hits — the designed
  Insertion B history comment itself ("replacing the former IntersectionObserver
  system…", pasted verbatim) and pre-existing `components/blog/TableOfContents.tsx`
  (untouched, last commit 81b571c). (c) `rg "addEventListener\('scroll'"`: hits
  pre-existing BackToTop/FeaturedProjectsRail only; `ScrollProgress.tsx` has no
  listener (assertion 14 green). In all three cases the command was already non-empty
  before the change; the change's own surface is clean.

## Blockers

None. No task stopped, no designed line found impossible.

## Overall batch status

**COMPLETE — all six tasks (1.1, 1.2, 2.1, 2.2, 3.1, 3.2) done.** Final evidence:

- `npm run test:run` → `Test Files 80 passed (80)`, `Tests 694 passed (694)` — fully
  green, first full-green run of the change.
- `npx tsc --noEmit` → exit 0.
- `npm run lint` → 9 warnings + 1 info, byte-identical to the pre-change baseline
  (zero new issues).
- `git status` (tracked): 7 modified, 2 deleted, 1 new test file; diff totals
  178 insertions / 308 deletions on tracked files (+ ~330-line untracked test file) —
  consistent with the design's Phase 1–3 forecast. Nothing committed.

## Next batch recommendation

**Phase 4** (apply-time protocol): 4.1 tall-subject measurement at 390×844 and
1440×900 (contacto sidebar + both AboutProfile columns; ≤3 `reveal-tall` className
additions, heights recorded in the task notes), then 4.2 visual-parity tuning within
the bounded latitude (`entry 10–35%` start / `entry 85–100%` end), constants and CSS
in lockstep under assertion 24. Phases 5–7 (e2e, manual QA, verify/build) follow.

---

# Batch 2 — Phases 4–5 (measurement, tuning decision, e2e)

Date: 2026-11-05 (same tree as batch 1: uncommitted, `main` @ 7a378e4 + batch-1
changes). Orchestrator authorized a dev server on port 3000 for this batch's e2e
tasks (started detached, killed at batch end). Build gate respected: no
`npm run build` at any point.

**Environment facts (this machine, all e2e evidence below):**

- Playwright browser binaries installed: **chromium only**
  (`~/.cache/ms-playwright`: `chromium-1248`, `chromium_headless_shell-1248`,
  `ffmpeg-1013`). firefox/webkit binaries absent → the `firefox`, `webkit`, and
  `mobile-safari` projects are entirely environment-blocked (per the repo's
  environment-status fixture: recorded `blocked` with the launch error, never
  silently skipped).
- `.env.local` contains only `GOOGLE_GENERATIVE_AI_API_KEY`. No Sanity env in the
  test process → Sanity preflight records `blocked` (same as every past local run,
  e.g. `test-results/local-apply-1`); the app itself degrades to local fallbacks
  (sanity/lib V-01), so pages render.
- `PLAYWRIGHT_RUN_ID` MUST be set for local runs: the default run id is
  `${Date.now()}-${process.pid}`, and globalSetup (writer) vs test workers
  (readers) have different PIDs — without a shared id every test skips with
  "Environment preflight report was not generated". All runs below set it.

## Phase 4 — measurement + bounded tuning

### Task 4.1 — Tall-subject measurement protocol — **done**

Method: throwaway Playwright chromium script (`/tmp/sdd-measure.cjs`, not in the
repo) against `next dev` on :3000; `networkidle` + `document.fonts.ready` + 400 ms
before measuring; heights are layout heights (animations never affect layout).

Measured (H = `element.scrollHeight`, V = `window.innerHeight`):

| Subject (flagged) | 390×844 (V=844) | 1440×900 (V=900) | H>V either? | `reveal-tall` |
| --- | --- | --- | --- | --- |
| /contacto sidebar (`contacto/page.tsx:53`, `delay={0.2}`) | H=508 (0.60×) | H=756 (0.84×) | NO | **not added** |
| / AboutProfile left col (`AboutProfile.tsx:21`, undelayed) | H=1660 (**1.97×**) | H=1468 (**1.63×**) | YES | **added** |
| / AboutProfile right col (`AboutProfile.tsx:66`, `delay={0.2}`) | H=1348 (**1.60×**) | H=1468 (**1.63×**) | YES | **added** |

Also measured (unflagged, for the record): /contacto form card H=796/844=0.94×
(mobile) and 756/900=0.84× (desktop) — standard at both, consistent with not being
flagged. No other `.reveal` elements exist on the two measured pages.

- **Hard bound (2.5× scrollport): respected — max observed ratio 1.97×.** No
  subject approached the bound; nothing STOPped, no layout restructure needed.
- Exactly 2 className additions (≤3 per AD-1): `space-y-8 lg:col-span-2
  reveal-tall` (line 21) and `space-y-8 reveal-tall` (line 66) in
  `components/sections/AboutProfile.tsx`. Zero prop churn; contacto page and the
  other 11 usages untouched.
- Engine verification (`/tmp/sdd-tall-verify.cjs`, chromium, CSS.supports
  `animation-timeline: view()` = true): computed `animation-range` on `/` — left
  column `cover 10% cover 40%` (fallbacks govern), right column
  `cover 20% cover 40%` (inline `--reveal-tall-start:20%` IS consumed by the cover
  range); `animation-name: revealUp` on both. The stagger contract works in a real
  engine.
- `npm run test:run` still 694/694 after the additions (className-only change).

Files changed: `components/sections/AboutProfile.tsx` (+2 className strings).

### Task 4.2 — Bounded tuning — **done: NO tuning applied (defaults stand)**

Evidence for the no-op decision (throwaway firing probe, /contacto first `.reveal`
— standard, undelayed — at 1440×900): computed opacity is a pure function of
scroll position and matches the sanctioned `entry 10% → entry 100%` geometry —
subject (top=580, H=756, V=900) sits at scrolled-in fraction 0.423 at scrollY=0
with computed opacity 0.989 (spring easing is fast early; progress
(0.423−0.10)/0.90≈0.36), reaching ≥0.99 by fraction 0.456. No firing-late/early
anomaly vs the spec's parity anchor (the default IS the hook-parity value; moving
toward 35% would be *stricter*-than-hook parity, a Phase 6 checklist judgment, not
warranted by any measurement here).

- Final values = sanctioned defaults: start `entry 10%` (fallback
  `--reveal-range-start, 10%` ↔ `RANGE_START_DEFAULT_PCT = 10`), end `entry 100%`
  (↔ `STANDARD_RANGE_END_PCT = 100`), tall end `cover 40%` (fixed by derivation).
  All inside the latitude; assertion 24 lockstep trivially intact (nothing moved).
- `app/globals.css` and `components/animations/RevealOnScroll.tsx` untouched in
  this batch.

## Phase 5 — e2e

### Task 5.1 — Reduce computed-style test appended — **done**

- Appended ONE test to `e2e/tests/accessibility-interactions.spec.ts` immediately
  after the existing reduce test (inserted between old lines 150/151 — lines
  140–150 byte-untouched, verified by the insertion point), inside the same
  locale loop: `page.emulateMedia({ reducedMotion: 'reduce' })` → goto →
  `dismissCookieConsent` → first `[data-slot="reveal"]` computed
  `animationName === 'none'` AND `opacity === '1'`. Verbatim design AD-7 block.
- Positive: both locale cases PASS on chromium (focused run, 2 passed).
- Negative probe (`/tmp/sdd-reduce-negative.cjs`, throwaway): injecting an
  ungated copy of the reveal animation under reduce emulation flips computed
  state to `animationName: 'revealUp', opacity: 0` — i.e. the test fails on
  exactly the regression it exists to catch (gate dropped). Corroboration: the
  same test run against the PRE-CHANGE app (baseline worktree, task 5.3) fails —
  `[data-slot="reveal"]` does not exist there.

Files changed: `e2e/tests/accessibility-interactions.spec.ts` (+16 lines).

### Task 5.2 — Snapshot determinism probe + regeneration — **done, decision-table branch (a)**

Config fact: `playwright.config.ts` sets NO `animations` option (neither in
`use:` nor per-test), so `toHaveScreenshot` runs at its **default
`animations: 'disabled'`** — the condition AD-7 probes.

Probe (chromium project, viewport 1920×1080, dev server):

1. `--update-snapshots` → wrote 4 NEW files `*-chromium-linux.png` (homepage,
   blog, contact, homepage-dark). They did not exist before: the repo's entire
   snapshot baseline is `-win32` (snapshots are platform-specific; the spec skips
   on CI). 4 passed.
2. Verification run WITHOUT the flag → 4 passed (capture determinism).
3. Second verification run → 4 passed again.

Below-fold visibility inspection (all four PNGs):

- Pixel-level evidence (`/tmp/sdd-ghost-probe.cjs` + repo's `sharp`): capture A
  (exact test conditions) vs capture B (fallback pin `.reveal,
  .scroll-progress-bar { animation: none !important }`) are pixel-identical in
  the `#sobre-mi` region (channel mean 243.6/244.2/246.9 both; stdev 34.5 vs
  34.4 — full text contrast present in both). At scroll 0 the natural computed
  state of both tall subjects IS `opacity: 0, translateY(40px)` (fill both,
  before range) — so Playwright's `animations: 'disabled'` neutralizes
  scroll-driven animations during capture exactly like the pin would. **Design
  open question 2 / exploration fact 11 resolved: fullPage capture does NOT
  ghost below-fold reveal content.**
- Visual inspection of the regenerated PNGs (downscaled via sharp): homepage —
  sobre-mí photo/paragraphs/all three right cards fully rendered; homepage-dark —
  same, light-on-dark, fully legible; contact — form + sidebar cards visible
  (viewport crop, no ghosting); blog — clean render, note it shows the explicit
  "No hay posts disponibles" empty state because this machine has no Sanity env
  (V-01 fallback) — environment-faithful, not a capture defect. An initial
  vision-model pass over the full homepage PNG claimed "ghosting" — refuted by
  the pixel stats + crop inspection (it mistook the site's designed
  `text-muted-foreground` palette for animation ghosting).

**Decision table: branch (a)** — second run green AND below-fold visible → done.
NO `addStyleTag` pin; `e2e/tests/visual.spec.ts` unchanged; exactly one
deliberate regeneration.

Snapshot scope decisions:

- **mobile-chrome**: the full 5.3 run's first mobile-chrome visual encounter
  auto-wrote 4 accidental `*-mobile-chrome-linux.png` actuals (missing-snapshot
  failures at 16:15); the later baseline run then "passed" against them only via
  `maxDiffPixelRatio: 0.05` absorbing the old-vs-new DOM — exactly the
  anti-pattern AD-7 bans. Those 4 accidental files were DELETED. mobile-chrome
  linux snapshots remain unregenerated (out of this batch's chromium-only scope;
  its binary exists, so a future `--project=mobile-chrome --update-snapshots`
  can create them deliberately).
- **firefox / webkit / mobile-safari**: binaries missing → `-linux` snapshots
  cannot be regenerated on this machine. Documented, skipped.
- **All `-win32` snapshots (every browser incl. chromium)**: untouched and now
  STALE against the new DOM (no inline hidden styles; SSR bar wrapper). They
  belong to the Windows workstation and must be regenerated there after merge.

### Task 5.3 — Full e2e run — **done, honestly mixed environment; ZERO change-caused failures**

Run A (changed tree, :3000, 10 workers, 5.4 min): **136 passed / 370 skipped /
59 failed.** Skips: 226 webkit-launch + 113 firefox-launch blocked (binaries
missing, fanned out via environmentGuard), 8+2 Sanity-blocked, 4 Gemini-key
blocked, 13 no-annotation, 4 transient server-unavailable.

Run B (baseline comparison — clean pre-change tree @ 7a378e4 in a throwaway
worktree, own dev server :3001, same tests/machine/load, 6.8 min):
**127 passed / 369 skipped / 69 failed.**

Failure-set diff (per project):

- **54 identical failures on BOTH trees** — pre-existing/environment, not this
  change: axe `heading-order` on SkillsList `<h4>Backend</h4>` (pre-existing
  markup), contact-spec strict-mode `button /enviar/i` matching 2 buttons
  (ObfuscatedEmail `aria-label="Enviar email"` — pre-existing), Sanity-dependent
  navigation failures (`/proyectos/apigen` routes 404 without Sanity),
  published-qa Gemini/timeout failures, 320px-overflow/skip-link geometry tests,
  SkillBadge hover timeouts. Same classes fail in past local run dirs
  (`local-apply-1`: 15 failed) — this machine's local e2e baseline is red
  without Sanity/Gemini env regardless of tree.
- **5 only-on-changed**: 4× mobile-chrome visual "snapshot doesn't exist" (the
  accidental-actual story above — machine/scope artifact, files deleted) +
  1× `following the legacy redirect preserves history without an About
  back-loop` (chromium) — **passes 4/4 in isolated reruns on the changed tree**
  (832 ms–1.7 s each) → full-run load flakiness (10 workers vs `next dev`
  compile; the same run had 4 server-unavailable skips), not a regression. Its
  sibling legacy-redirect tests failed on BOTH trees.
- **15 only-on-baseline**: 4× the NEW reduce test (correctly fails on the old
  app — no `data-slot="reveal"`; this is the test doing its job) + 11
  load-flaky environment tests (footer geometry ×5, blog empty-state,
  interior-page overflow, WCAG mobile-chrome, footer tab order, published-qa ×2)
  that PASSED on the changed tree — run-to-run noise, further proof the failure
  mass is environmental.

Per-project summary: **chromium — executed (all failures classified above);
mobile-chrome — executed (same classification); firefox, webkit, mobile-safari —
environment-blocked, binaries missing, recorded per repo convention.**

## Batch 2 validation

- `npm run test:run` → `Test Files 80 passed (80)`, `Tests 694 passed (694)`
  (unchanged count — batch 2 adds no vitest tests; className additions and the
  appended e2e test don't touch the vitest surface).
- `npx tsc --noEmit` → exit 0.
- `npx biome check` on the two files edited this batch (AboutProfile.tsx,
  accessibility-interactions.spec.ts) → clean.
- `git status` delta vs batch 1: + `components/sections/AboutProfile.tsx`
  (modified, +2 className strings), + `e2e/tests/accessibility-interactions.spec.ts`
  (modified, +16 lines), + 4 NEW untracked `*-chromium-linux.png` snapshots.
  Nothing else in the repo changed. No commits made.

## Batch 2 deviations

- **B2-D1 — dev server in apply phase.** tasks.md says "no apply-phase task
  starts a dev/preview server"; the orchestrator's batch-2 brief explicitly
  authorized port 3000 (`npm run dev` detached) for tasks 4.1/5.1/5.2/5.3 and
  required its use. Documented here so verify sees it was deliberate, scoped,
  and the server was killed at batch end.
- **B2-D2 — `PLAYWRIGHT_RUN_ID` required for local e2e.** Without it, workers
  read a preflight path that globalSetup (different PID) never wrote → every
  test skips as blocked. All runs set it; future local runs should too.
- **B2-D3 — accidental mobile-chrome actuals deleted.** Playwright's
  missing-snapshot failure auto-writes the actual; left in place they would have
  been a tolerance-absorbed fake baseline. Deleted; deliberate regeneration
  deferred (out of chromium-only scope).
- **B2-D4 — blog snapshot content is environment-faithful.** The regenerated
  `blog-chromium-linux.png` shows the no-Sanity empty state. On a provisioned
  machine the same file would show real posts — platform- AND env-specific, same
  class as the existing win32/linux split.
- **B2-D5 — baseline worktree bootstrap.** The pre-change baseline needed a
  hardlink-copied `node_modules` (Turbopack refuses symlinked deps outside the
  workspace root) and `npx prisma generate` before `next dev` served 200. No
  repo files were touched; the worktree was removed after run B.

## Batch 2 blockers

None for the batch's own scope. Environment blockers (documented, not silently
skipped): firefox/webkit/mobile-safari browser binaries missing; Sanity env
absent from the test process; Gemini key absent from the test process;
`PLAYWRIGHT_BUILD_RESULT` unset (build check reports blocked by design — build
belongs to phase 7).

## Overall batch status (1 + 2)

**COMPLETE — tasks 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 5.3 done.**
Final evidence: vitest 694/694, tsc exit 0, new e2e reduce test green (chromium,
both locales) with proven gate-drop detection, chromium-linux visual snapshots
regenerated once + deterministic + inspected, and a baseline-diff e2e comparison
showing zero change-caused failures.

## Next batch recommendation

**Phase 6** (manual QA, required apply-time documentation): 6.1 non-supporting
engine, 6.2 print preview, 6.3 anchor jumps, 6.4 DevTools reduce emulation
(bar tracking), 6.5 both themes/directions/stagger pairs on the final tree. Then
**Phase 7.1** verify: `npm run build` + AD-6 evidence commands + coverage.
Carry-overs for the orchestrator: decide whether to deliberately regenerate
mobile-chrome-linux snapshots (one command, binary present), and flag that all
`-win32` snapshots are stale for the Windows workstation post-merge.

---

# Batch 3 — Phase 6 QA (tasks 6.1–6.5: automate what Playwright can, document the manual remainder)

Date: 2026-11-05 (same uncommitted tree as batches 1+2: `main` @ 7a378e4 + all
batch 1+2 changes). Dev server authorized and used: `npm run dev` detached on
:3000 (`/tmp/sdd-dev6.log`), killed at batch end. Build gate respected: no
`npm run build`. No repo files changed in this batch — all probes are throwaway
scripts in /tmp (`/tmp/sdd6-*.cjs`, chromium via the repo's playwright, viewport
1440×900 unless noted). PLAYWRIGHT_RUN_ID not needed (library-direct scripts,
not the repo e2e harness).

Method note (applies to every computed-style read below): scroll-driven
animation values update on produced frames, not in the same JS task as the
scroll. All probes either settle smooth scrolls to stability or pump rAF for
~400 ms after instant scrolls before reading. Instant programmatic scrolls set
`document.documentElement.style.scrollBehavior = 'auto'` first (html has
`scroll-behavior: smooth`, which makes even `window.scrollTo` animate).

### Task 6.2 — Print preview — **done-automated, PASS**

Probe: `page.emulateMedia({ media: 'print' })` on `/`, `/contacto`, `/blog` at
scroll 0 (chromium 1440×900), every `.reveal` element asserted.

- **PASS — every `.reveal` on all three routes: computed `animation-name` is
  `none` AND computed `opacity` is `1` under print media** (5 elements total:
  2 on `/`, 2 on `/contacto`, 1 on `/blog`; zero failures).
- **PASS — bar wrapper computes `display: none`** under print (`print:hidden`
  works; no gradient line can print) on all three routes.
- **Latent-defect fix proven end-to-end**: on `/` at scroll 0 under SCREEN
  media the below-fold AboutProfile columns compute `opacity: 0` (`fill both`,
  before range — exactly the state that printed hidden sections under the old
  inline-style system); flipping to print media yields `animation: none` +
  `opacity: 1`. The print rule inside `@supports` after the gate wins the
  cascade exactly as designed.
- Screenshot for the record: `/tmp/sdd6-2-print-home.png` (full page, print
  emulation).

### Task 6.3 — Anchor-jump targets revealed — **done-automated, MIXED: one finding (F2)**

Real anchors verified on `/`: `#featured-projects` (FeaturedProjects section)
and `#sobre-mi` (AboutProfile section, `scroll-mt-24`) — the two targets the
spec scenario names. The homepage ScrollIndicator jumps to `#featured-projects`
when Sanity has projects, else `#sobre-mi` (this machine: no Sanity env →
`sobre-mi`). `/sobre-mi` the ROUTE is a permanent redirect (to the homepage
section), so the homepage is the only real anchor surface.

- **PASS — `#featured-projects`**: fresh-load `/#featured-projects` lands the
  section visible at the top; it contains ZERO `.reveal` elements (the
  `content-auto` disjointness rule keeps reveals out of it) → jump target
  trivially fully revealed.
- **PASS — reduce**: under reduce emulation, `/#sobre-mi` → both columns
  `animation-name: none`, `opacity: 1` (trivially fully revealed; gate works).
- **PASS — no stranding (fallback simulation protocol)**: at the exact landing
  geometry the delayed column reads `0.871`; ONE +120px scroll gesture →
  `opacity 1.000` (cover 30.8%, spring overshoot clamps early); past range end
  (cover 40.3%) both columns `1.000`; scrolling back up to the landing position
  returns the delayed column to `0.689`. Every state is a pure function of
  scroll position; nothing is ever stuck.
- **FINDING F2 — `#sobre-mi` jump does not land the delayed column fully
  revealed** (spec scenario's literal THEN not met on desktop): fresh load,
  mid-scroll `scrollIntoView({behavior:'auto'})` and `{behavior:'smooth'}` all
  land identically (scrollY 1920, columns' tops at 334/349 of 900):
  left column `opacity 1.000`, RIGHT (delayed, `cover 20%→40%`) column
  `opacity 0.678` at cover 23.3% — mid-range at the landing position, held
  until the user scrolls further. Mobile 390×844: left `0.916`, right column
  entirely below the fold (`opacity 0` — identical to the old IO system's
  behavior, which only fired on intersection). Root cause: the scenario's
  parenthetical reasoning ("entry-based ranges complete at full entry, so
  in-viewport targets sit past their range end") was invalidated by task 4.1's
  measurement outcome — both `#sobre-mi` subjects became `reveal-tall`
  (cover-based, completing at cover 40% ≈ subject top ~47px ABOVE the viewport
  top, not at full entry). The implemented CSS is design-verbatim; this is a
  spec-scenario vs apply-outcome tension, not an implementation defect.
  Severity: cosmetic parity delta vs the old JS system (old: IO fired on the
  jump → full reveal; new: 68% opacity until one scroll gesture). Escalated
  for accept-as-progress-mapped vs spec-amendment decision — NOT patched here.

### Task 6.4 — Reduce-emulation: bar still active — **done-automated, MIXED: one finding (F1, the significant one)**

- **PASS — structural D5b**: under `reducedMotion: 'reduce'` the
  `.scroll-progress-bar` computed `animation-name` is `scrollProgress` (the
  bar is NOT reduce-gated, NOT `none`, NOT clamped away).
- **PASS — default mapping**: at 50% of the scroll range (scrollY 1866 of
  3731) the bar's computed transform is `matrix(0.500134, …)` = scaleX 0.500;
  pixel truth 49.9% of viewport width painted (`/tmp/sdd6-4-px-default-50.png`).
  At scroll 0, scaleX 0.
- **FINDING F1 — under reduce the bar's scroll mapping is halved/shifted by the
  pre-existing global reduce clamp.** Pixel-proven (page content hidden, only
  the bar screenshotted): at 25% and 50% scroll NO bar is painted; at 75% scroll
  the bar paints at 49.9% width (`/tmp/sdd6-4-px-reduce-{25,50,75}.png`).
  Computed values agree (`scaleX 0` at 25%/50%, `0.4999` at 75%). Mechanism
  (Web Animations API dump): the clamp
  (`animation-duration: 0.01ms !important; animation-delay: 0.01ms !important`,
  globals.css:755–765, PRE-EXISTING) gives the bar nonzero duration+delay under
  reduce → Chromium maps the animation's active interval onto a PROPORTIONAL
  SUB-RANGE of the scroll timeline: `getComputedTiming()` reports
  `duration: "50%"`, active interval `[50%, 100%]` (delay/(delay+duration) =
  50%). So a reduce user sees no bar for the first half of the page, then a
  2×-fast bar. The design comment (globals.css:719–721, and the spec's
  "provably a no-op for timeline-driven animations" premise) is FALSIFIED for
  current Chromium when BOTH duration and delay are nonzero. Regression vs the
  old JS bar (under reduce it tracked instantly and correctly). Only the bar is
  affected — reveals are `animation-name: none` under reduce (gate), and
  hero-mesh is gated too. Evidence-backed fix candidate (NOT applied — designed
  CSS bytes, orchestrator/design decision): neutralize the clamp for the bar
  inside its `@supports` block, e.g.
  `@media (prefers-reduced-motion: reduce) { .scroll-progress-bar { animation-duration: 0s; animation-delay: 0s; } }`
  — the default (0s/0s, from the shorthand) demonstrably maps to the FULL
  [0%,100%] range (every no-reduce reading). Alternative: pin
  `animation-range: 0% 100%;` on the bar.
- Screenshot: `/tmp/sdd6-4-bar-50pct.png` (default, bar at half width) and
  `/tmp/sdd6-4-bar-50pct-reduce.png`.

### Task 6.1 — Non-supporting engine — **done-automated (emulation, honest limits) + manual remainder**

Chromium supports `animation-timeline` (`CSS.supports` = true for both `view()`
and `scroll(root)`), so a genuinely non-supporting engine CANNOT be run here.
What was automated:

- **PASS — outcome emulation** (probe `/tmp/sdd6-nosupport.cjs`): a style tag
  forcibly applying what a non-supporting engine computes (both animations
  `none`) on `/`, `/blog`, `/contacto` → every `.reveal` has
  `animation-name: none`, `opacity: 1`, `transform: none` (zero failures), and
  the bar sits at its base `matrix(0, 0, 0, 1, 0, 0)` with
  `getBoundingClientRect().width === 0` — dimensionally collapsed, i.e. NO bar.
  This re-proves the base state + gate consequence; it does NOT prove a real
  engine (the honest limit — same class of evidence the spec's source guards
  provide).
- **Structural guarantee pinned by tests**: source-guard assertions 16/19/22
  (reveal `animation` exists only inside `@supports` + `no-preference`; print
  rule inside `@supports`; no hidden base state) — green in the 694/694 run
  below.
- Console: only the documented environmental errors (no Sanity env fetch
  failures, dev CSP/eval noise) — nothing change-caused.
- **Remainder is human**: exact steps in "Manual QA for Javier" below.

### Task 6.5 — Both themes, both directions, stagger pairs — **done-automated (engine-level) + feel/manual remainder**

- **PASS — stagger offset, AboutProfile (`/`)**: computed `animation-range` —
  left column `cover 10% cover 40%` (CSS fallbacks govern), right (delayed)
  column `cover 20% cover 40%` (inline `--reveal-tall-start: 20%` consumed);
  both `animation-name: revealUp`. Past both range ends (cover 42.2%): both
  columns `opacity 1.000`. Screenshots: `/tmp/sdd6-5-stagger-revealed-light.png`
  and `/tmp/sdd6-5-stagger-revealed-dark.png` (bottom-half pixel stdev ~38–41
  in both themes — content present, not blank/ghosted).
- **PASS — stagger offset, contacto pair**: form card (undelayed) computed
  `entry 10%` (fallback, no inline props) vs sidebar (`delay={0.2}`) computed
  `entry 40%` (inline `--reveal-range-start: 40%` consumed). Live separation at
  one shared scroll position: form `0.989` vs sidebar `0.170` — stagger is
  scroll-position separation, not a timer, in a real engine.
- **PASS — reversibility (D1 semantics)**, standard subject (/contacto) +
  tall subject (/): fully in view → `1` and HOLDS; scrolled past (exit through
  TOP, subject top −352px) → HOLDS `1` (no exit animation — the
  "MUST NOT run during exit-through-the-top" clause); scrolled back up
  (subject exits through the bottom) → re-hides progressively
  (`1 → 0.689 → 0` across the range); scrolled down again → re-reveals to `1`.
  Two probe-point artifacts, not defects: /contacto's page is too short to push
  its first reveal fully below the fold (scroll clamps with the subject still
  straddling at `0.989`), and the "mid re-entry" sample sat at 55% entry where
  the spring overshoot already clamps opacity to 1 — mid-range partials are
  proven by the tall-column reads (0.170/0.678/0.689/0.871) instead.
- **PASS — dark theme**: `localStorage.theme = 'dark'` → `html.dark`; same
  ranges, same full reveal past range end.
- Remainder (feel, three pages, both directions by hand): in the manual list.

## Findings ledger (batch 3)

| id | severity | status | summary |
| --- | --- | --- | --- |
| F1 | WARNING (reduce-UX regression, change-caused via interaction with pre-existing clamp) | open — escalated | Under `prefers-reduced-motion: reduce` the global clamp's nonzero duration+delay maps the bar to the [50%,100%] sub-range of the scroll timeline: no bar for the first half of the page, 2×-fast after. Pixel-proven. Design premise "clamp is a no-op for timeline animations" falsified for the bar in current Chromium. Fix candidate documented in 6.4 (bar-local 0s/0s override or `animation-range: 0% 100%`). |
| F2 | SUGGESTION (cosmetic parity delta, spec-scenario tension) | open — escalated | `/#sobre-mi` jump lands the delayed tall column at opacity ~0.68 (desktop) / left column 0.916 (mobile) until one further scroll gesture; nothing strands (progress completes and reverses with scroll). Spec scenario's "fully revealed" reasoning predates the reveal-tall outcome of 4.1. Accept as progress-mapped behavior or amend the spec/design (e.g. sanctioned acceptance note). |

Both findings are engine-behavior outcomes of DESIGN-VERBATIM CSS — no code
defect was found in the applied change itself; both need an orchestrator/design
decision (fix-forward F1 in a follow-up task or waive to verify with eyes open).

## Manual QA for Javier (only what needs your eyes)

1. **REQUIRED — 6.1 remainder: genuine non-supporting engine** (no automated
   tripwire can exist: chromium supports the feature; emulation only re-proves
   base state — done above).
   - Find an engine WITHOUT scroll-timeline support. Don't trust version
     numbers — verify in that browser's DevTools console:
     `CSS.supports('animation-timeline', 'view()')` must print `false`.
     Known candidates: any Chrome/Chromium before 115 (scroll-driven animations
     shipped in Chrome 115, Jul 2023), or an old Firefox ESR (roughly < 128 —
     the console line is the definitive check).
   - Open `/`, `/blog`, `/contacto` (dev server or deployed), scroll fully in
     both directions.
   - EXPECT: every reveal section fully visible at ALL times; NO progress bar
     at the top; no console errors; no layout shift.
2. **RECOMMENDED (30 s) — 6.2 residual: real print-preview UI.** Chrome →
   `/` → Ctrl+P: all sections print fully visible (incl. below-fold Sobre Mí
   photo/story/cards), no gradient line at top. Repeat on `/blog`, `/contacto`.
   (Computed-style print behavior is proven above; this eyeballs paper
   rendering/pagination.)
3. **QUICK — 6.3 feel + F2 decision.** On `/` click the hero scroll chevron
   and/or open `/#sobre-mi` directly. Feel the smooth jump, then decide F2:
   is the right column landing at ~68% opacity (desktop) acceptable
   progress-mapped behavior, or do you want a follow-up change?
4. **QUICK — 6.4 real-OS reduce + F1 decision.** Enable OS-level reduced
   motion (GNOME: Settings → Accessibility → Reduced motion) → open `/` →
   scroll the whole page. You will SEE F1: no bar for the first half, then a
   fast bar. Decide: apply the bar-local clamp exemption (fix candidate in
   6.4) as a follow-up, or ship as-is.

Screenshots (evidence, /tmp): `sdd6-2-print-home.png`,
`sdd6-3-anchor-sobremi-endstate.png`, `sdd6-4-bar-50pct.png`,
`sdd6-4-bar-50pct-reduce.png`, `sdd6-4-px-default-50.png`,
`sdd6-4-px-reduce-25/50/75.png`, `sdd6-5-stagger-revealed-light.png`,
`sdd6-5-stagger-revealed-dark.png`. Probe scripts: `/tmp/sdd6-*.cjs`.

## Batch 3 deviations

- **B3-D1 — dev server in apply phase (same authorization class as batch 2):**
  the batch brief explicitly authorized a detached `npm run dev` on :3000 for
  these QA probes; killed with `pkill -f "[n]ext dev"` at batch end.
- **B3-D2 — 6.3/6.5 partially exceed the tasks.md "no automated tripwire
  exists" framing:** the brief itself redefined Phase 6 as "automate what
  Playwright can, document the genuinely-manual remainder". Automated: print
  media, anchor landings (settled states + geometry), reduce bar computed
  state + pixel truth, stagger ranges + separation + reversibility + dark
  theme. Still human: non-supporting engine, print UI feel, smooth-scroll
  feel, F1/F2 decisions (list above).
- **B3-D3 — measurement-method discovery (recorded for future probes):**
  scroll-driven computed values update on produced frames, not in the scroll's
  JS task; and under reduce the values lag differently. All probes pump rAF
  ~400 ms after instant scrolls before reading, and pixel screenshots are the
  ground truth for what a user sees (used to confirm F1).

## Batch 3 blockers

None for the batch's scope. Environment facts unchanged from batch 2
(chromium-only playwright binaries; no Sanity/Gemini env — pages render local
fallbacks).

## Overall batch status (1 + 2 + 3)

**COMPLETE — tasks 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 5.3,
6.1, 6.2, 6.3, 6.4, 6.5 done** (Phase 6: 6.2/6.3/6.4/6.5 done-automated with
two escalated findings F1/F2; 6.1 done-automated-emulation + manual remainder
documented). Validation below. NO repo files changed by batch 3 (apply-progress
only). Nothing committed.

## Next batch recommendation

**Phase 7.1 verify** — `npm run build` + AD-6 evidence commands (no ScrollProgress
client chunk; server HTML carries the bar; no inline opacity) + coverage, plus
the recorded Phase 6 outcomes (all five documented above — 7.1's gate
"none left pending" is met: every task has a recorded outcome; F1/F2 are
decision items, not pending checks). Orchestrator carry-overs: F1/F2
decisions, mobile-chrome-linux snapshot regeneration, stale `-win32` snapshots
post-merge.

## Batch 3.1 — F1 fix-forward (orchestrator, inline)

- **F1 status: fixed + verified (pixel)**. Root cause chain: the global reduce clamp (`*,::before,::after` + `!important`, globals.css:878-889) carves a [50%,100%] sub-range out of the scroll timeline for the bar. Fix attempt 1 (plain `0s`, no !important) lost the cascade to the clamp's !important. Fix attempt 2 (`0s !important`) took effect but pinned the bar full-width instantly (0s = instantly-complete + fill both). Winning fix (attempt 3, empirically probed BEFORE applying): `animation-duration: auto !important; animation-delay: 0s !important;` — `auto` maps the animation to the entire timeline. Pixel evidence under `reducedMotion: 'reduce'`: 0%→scaleX(0), 25%→0.250067, 50%→0.500134, 75%→0.749933. Source-guard assertion 16 amended to pin the winning values. 694/694 vitest, tsc 0.
- **F2 status: info (open, cosmetic)** — `/#sobre-mi` lands the delayed tall column at ~0.68 opacity; self-completes on any scroll gesture. Decision deferred to owner; no fix per severity floor.

## Review 4R + refutación — ledger final

**Lenses**: risk (RISK-001 info), reliability (REL-001/002 info), resilience (RES-001..005 info), readability (RD-001..005).
**Refutación 3/3 unánime**: RD-001 STANDS, RD-002 STANDS (severidad recalibrada a WARNING por refuter #2 — documentación que miente, sin ruptura user-visible hoy; fixes baratos aplicados igualmente).

**Fix round 1 (cerrada):**
- RD-001 FIXED: 4 comentarios falseados corregidos (globals.css:719-721, 761-764, 766-768; RevealOnScroll.tsx:15-22) — ahora documentan la mecánica real (sub-range = delay/(delay+duration), clamp no remueve pero corrompe el mapeo).
- RD-002 FIXED: spec.md:7 y :241 enmendados — premisa falsa reemplazada por mecánica verificada + excepción sancionada del counter-override de la barra.
- RD-003 FIXED: design.md §Complete CSS lleva nota de enmienda F1.
- RD-004 FIXED: test 20 deriva literales de las constantes TS (helper revealConstant compartido con test 24) — tuning sancionado ya no rompe el test.
- RD-005 FIXED: README.md:77/355/387 actualizados (sin tombstones de useScrollReveal/AnimationProvider).
- RES-005 FIXED: comentario de contrato anti-nesting en RevealOnScroll.
- Quedan info (nunca bloquean): RES-001 (Firefox ESR sin barra hasta 159), REL-001 (/contacto sidebar 0.17 al cargar — familia F2, decisión del owner), RES-003/004, F2.

**Validación post-fix**: 694/694 vitest, tsc 0, biome 0 errores (11 warnings = baseline 9 + 2 !important justificados del F1).
