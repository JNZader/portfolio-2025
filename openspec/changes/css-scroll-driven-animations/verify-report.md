# Verify Report — css-scroll-driven-animations

Date: 2026-11-05. Verify phase (task 7.1) against the uncommitted working tree
(`main` @ 7a378e4 + batches 1–3 + batch 3.1 F1 fix, per `apply-progress.md`).
Tree state at verify start: 9 modified, 2 deleted, 1 new test file, 4 new
chromium-linux snapshots (`git status` / `git diff --numstat` reproduced below).

```
 0	1  __tests__/integration/app/HomePage.test.tsx
 4	0  app/[locale]/layout.tsx
128	0  app/globals.css            (design Insertions A+B = +111; F1-fix amendment = +17)
 0	35 components/animations/AnimationProvider.tsx   (DELETED)
44	130 components/animations/RevealOnScroll.tsx
 1	10 components/animations/index.ts
 0	11 components/layout/ClientComponents.tsx
 2	2  components/sections/AboutProfile.tsx
18	38 components/ui/ScrollProgress.tsx
13	0  e2e/tests/accessibility-interactions.spec.ts
 0	83 hooks/useScrollReveal.ts                      (DELETED)
```

Verifying agent wrote NO code. Only this report was written. Build gate honored:
`npm run build` ran ONLY in this phase (see V-003 for the env nuance).

---

## 1. Command evidence (config.yaml `verify`)

### 1.1 `npm run test:run` — PASS

```
Test Files  80 passed (80)
     Tests  694 passed (694)
  Duration  6.16s
```

Exactly the expected counts (80 files / 694 tests; baseline 79/670 + 1 file + 24
tests). Includes the full `ScrollDrivenAnimations.test.tsx` suite (24/24) and the
mock-resolution gate (`HomePage.test.tsx`, `AboutProfile.test.tsx` green through
the surviving `@/components/animations` path).

### 1.2 `npx tsc --noEmit` — PASS

Exit code 0. Zero diagnostics.

### 1.3 `npm run test:coverage` — PASS

Configured floors (`vitest.config.ts:29-34`): lines 35 / functions 30 /
branches 25 / statements 35 (config.yaml `coverage_threshold: 35` global).

```
All files | statements 62.88 | branches 56.51 | functions 60.51 | lines 63.73
```

All four floors cleared; command exit 0 (vitest enforces thresholds).

### 1.4 `npm run build` — PASS (with one environmental finding, V-003)

Two runs, root-caused per debugging discipline:

1. **Bare `npm run build` → exit 1.** Compiled successfully (2.4 min cold) and
   passed the TypeScript step, then failed at "Collecting page data":
   `Error: Failed to collect page data for /api/admin/health — [cause]
   DATABASE_URL environment variable is not set (lib/db/prisma.ts:18)`.
   Root cause: environmental, NOT change-caused — `lib/db/prisma.ts`, the
   failing API routes, and everything under `lib/` + `app/api/` are untouched
   by this change (empty `git status --porcelain -- lib/ app/api/`), and this
   machine's `.env.local` contains only `GOOGLE_GENERATIVE_AI_API_KEY`.
   The repo's own CI (`ci.yml:93-98`, `release.yml:29-32`) runs
   `npm run build` with `DATABASE_URL=file:./prisma/dev.db`,
   `DIRECT_URL=file:./prisma/dev.db`, `SKIP_ENV_VALIDATION=true` and no
   migrations and no dev.db — i.e. client construction only, no build-time
   queries.
2. **`npm run build` with the repo's CI-declared env → exit 0.**

```
env DATABASE_URL='file:./prisma/dev.db' DIRECT_URL='file:./prisma/dev.db' \
  SKIP_ENV_VALIDATION=true npm run build

✓ Compiled successfully in 28.0s        (warm; cold compile in run 1 was 2.4 min)
  Finished TypeScript in 3.7s
✓ Generating static pages (50/50) in 2.7s
Elapsed (wall clock): 54.26s   ·   exit 0
```

Build duration of record: **54.3 s wall (successful run; warm compile)**; cold
compile measured at 2.4 min in run 1. No stray artifacts (`prisma/dev.db` not
created; no new tracked-file changes after the build).

### 1.5 AD-6 zero-client-JS evidence (offline, against the build output) — ALL PASS

| # | Command (design AD-6) | Required | Actual | Verdict |
|---|---|---|---|---|
| 2 | `rg -l "ScrollProgress\|RevealOnScroll\|useScrollReveal" .next/static/` | nothing | nothing (exit 1) | **PASS** |
| 3 | `rg -l "scroll-progress-bar" .next/server/app/` | hits | hits on every prerendered route HTML+RSC of both locales (`es.html`, `en.html`, `es|en/{contacto,cv,privacy,proyectos,newsletter,data-request,secret-achievements,admin/*}`) | **PASS** |
| 4 | `rg -n 'style="[^"]*opacity' .next/server/app/ --glob '*.html'` | nothing | nothing (exit 1) | **PASS** |

Corroborating markup reads from the prerendered HTML:

- Bar markup in `es.html` (identical across routes):
  `<div class="fixed top-0 left-0 right-0 h-1 bg-border/30 z-50 print:hidden" aria-hidden="true"><div class="scroll-progress-bar h-full bg-gradient-to-r from-primary via-primary/80 to-tertiary">`
  — no `style` attribute anywhere on either element (no inline width%).
- Reveal wrappers carry class + custom properties only, e.g. homepage:
  `<div class="reveal space-y-8 lg:col-span-2 reveal-tall" data-slot="reveal">`
  (undelayed, no style) and
  `<div class="reveal space-y-8 reveal-tall" data-slot="reveal" style="--reveal-range-start:40%;--reveal-tall-start:20%">`
  (delayed — exactly the two custom properties, no opacity/transform).
  Same shape on `es|en/contacto.html`. Zero hidden inline styles on any
  prerendered page.
- Client manifest (`rg -c "ScrollProgress|RevealOnScroll" .next/build-manifest.json`)
  → nothing. Informational per-route client-JS counts: no baseline build exists
  on this machine, so a size DELTA cannot be computed — the AD-6 rg proofs
  above are the gating evidence.

`/blog` note (not a defect): the blog route has no prerendered HTML because it
renders per-request (Sanity-dependent; absent from static output, present in
`app-path-routes-manifest`). The bar and reveals ride the shared locale layout
— proven present in every static route's HTML that does exist, and the batch-2/3
dev-server probes exercised `/blog` live. The spec scenario's evidence intent
("initial HTML carries the bar") is met by construction of the layout mount.

---

## 2. Spec conformance sweep — 10/10 ADDED requirements PASS

| # | Requirement (specs/ui/spec.md) | Evidence (working tree + commands above) | Verdict |
|---|---|---|---|
| 1 | Server-rendered scroll progress bar on the scroll(root) timeline | `components/ui/ScrollProgress.tsx` (no `'use client'`/hooks/listeners/state; wrapper utilities + `aria-hidden` + `print:hidden`; inner `.scroll-progress-bar` + sanctioned gradient family — tests 11–14 green); base rule `transform: scaleX(0); transform-origin: left` in `@layer components` (globals.css:504–507, test 22); `@keyframes scrollProgress` transform-only (globals.css:723–730, test 17); exactly one `@supports (animation-timeline: scroll())` block with `animation: scrollProgress linear both; animation-timeline: scroll(root)` and NO `no-preference` wrapper (globals.css:732–736, test 16); NOT in ClientComponents (test 15); layout mounts it inside `<AnnouncerProvider>` before the ClientComponents Suspense (`app/[locale]/layout.tsx` diff); bar in every prerendered HTML, no inline width (§1.5). Reduce scenario: F1 fix (globals.css:738–753) pixel-verified 1:1 scroll mapping under reduce — see V-001 | **PASS** |
| 2 | Reveal base-state visibility (no-JS, no-support, SSR parity) | `.reveal` base rule sets no opacity/transform/visibility/animation (globals.css:494–496, test 22); hidden state only inside `@keyframes revealUp` applied under `@supports`+`no-preference` (tests 19–21); prerendered HTML has zero inline `opacity` (§1.5 cmd 4) and wrappers carry only the custom properties (§1.5 markup); non-supporting behavior pinned by base state + source guards and batch-3 emulation probe | **PASS** |
| 3 | Reveal scroll geometry and reversibility (view(), entry range) | Keyframes exactly `opacity 0→1`, `translateY 40px→0` (globals.css:774–783, test 17); `animation: revealUp var(--ease-spring) both; animation-timeline: view(); animation-range: entry var(--reveal-range-start, 10%) entry 100%` (globals.css:787–791, test 20); fill `both`; hero-mesh-identical structure (test 18); defaults stand, inside tuning latitude (batch 2, task 4.2); reversibility engine-proven (batch 3: hold-while-in-view, re-hide only on bottom exit, no exit-top animation, no stranding); disjointness comment on the base rule (globals.css:490–492, test 22) + zero reveal usage in `components/sections/FeaturedProjects.tsx` (rg clean) | **PASS** (F2 caveat — see V-002) |
| 4 | Scroll stagger via animation-range start offsets | `RevealOnScroll.tsx:40–54`: `delayToRangeStart` from named constants, emits `--reveal-range-start` + `--reveal-tall-start` together only when `delay > 0`; `delay={0.2}` → 40%/20% and `delay={0.3}` → 55%/25% (tests 3–4; prerendered HTML shows exactly `--reveal-range-start:40%;--reveal-tall-start:20%`); no inline opacity/transform/transition (test 7); undelayed → no style attribute (tests 5–6); engine-proven scroll separation with shared completion (batch 3 computed ranges: `cover 10% cover 40%` vs `cover 20% cover 40%`, `entry 10%` vs `entry 40%`) | **PASS** |
| 5 | Tall reveal subjects — range selection rule | `.reveal-tall` declared after `.reveal` inside the gate, overrides `animation-range` ONLY (globals.css:793–795, test 20 tall-body equality); measurement protocol executed at 390×844 and 1440×900 with recorded heights (apply-progress batch 2: contacto sidebar 508/756 → NO; AboutProfile left 1660/1468 → YES; right 1348/1468 → YES); exactly the 2 measured-taller subjects carry `reveal-tall` (git diff: 2 className strings in AboutProfile, contacto untouched); hard bound respected (max 1.97× < 2.5×); zero prop churn (diff shows class strings only); 13 JSX usages total confirmed (`<RevealOnScroll` counts: AboutProfile 2, blog 1, contacto 2, design-system 8) | **PASS** |
| 6 | Reduced-motion safety is structural, not clamped | Reveal `animation` declarations exist only inside `no-preference` nested inside `@supports (animation-timeline: view())` (tests 19/20/21); no duration/delay mitigation introduced for reveals anywhere; e2e reduce tripwire (lines 140–150) untouched (git diff: insertion after line 150 only) and the appended computed-style test asserts `animationName === 'none'` + `opacity === '1'` in a real engine (chromium, both locales — batch 2) with a proven gate-drop negative probe | **PASS** (F1-fix scope note — see V-001) |
| 7 | Print shows all revealed content | `@media print { .reveal { animation: none; } }` inside the reveal `@supports` block, AFTER the gate (globals.css:803–807, test 19); bar wrapper `print:hidden` computes `display: none` and every `.reveal` computes `animation-name: none` + `opacity: 1` under print emulation on `/`, `/contacto`, `/blog` (batch 3, incl. the latent-defect end-to-end proof: below-fold columns at screen `opacity: 0` flip to visible under print) | **PASS** |
| 8 | RevealOnScroll server wrapper and animations module survival | Named export + path + API `children\|className\|delay` preserved; `cn('reveal', className)` + `data-slot="reveal"` (source, tests 1–2, 8); `hooks/useScrollReveal.ts` and `components/animations/AnimationProvider.tsx` deleted (`git status` D, test 10, `existsSync` false); `StaggeredReveal`/`*Variants`/`Variants` gone from `components/animations/` (rg; pre-existing cva `*Variants` elsewhere are unrelated — D4(a)); `index.ts` = single re-export (test 9); both vitest mock factories resolve (694/694 includes HomePage + AboutProfile); consumers diff = only the 2 sanctioned `reveal-tall` strings | **PASS** |
| 9 | Zero client JS and exactly one scroll-effect mechanism | `rg "'use client'"` on both components → nothing; `rg 'IntersectionObserver' components/ hooks/ app/` → 2 hits, both outside the change (history comment in globals.css:758 + pre-existing `components/blog/TableOfContents.tsx` TOC observer — not a reveal mechanism; untouched by this change); `rg "addEventListener\('scroll'"` → 2 pre-existing hits (BackToTop, FeaturedProjectsRail — not progress bars; untouched); exactly one `view()` reveal block + the untouched hero-mesh precedent + one `scroll()` bar block (tests 16/18); `.next/static/` and build manifest carry no ScrollProgress/RevealOnScroll/useScrollReveal (§1.5) | **PASS** |
| 10 | Validation and honest testability limits | Layer 1 component tests + layer 2 source guards: the 24-assertion suite, green in §1.1; layer 3: full suite green; layer 4: e2e reduce tripwire + appended computed-style test green on chromium, full e2e run with baseline-diff classification — zero change-caused failures, blocked projects (firefox/webkit/mobile-safari: binaries missing) reported `blocked` with exact reason, never silently skipped (batch 2, task 5.3); layer 5: determinism probe decision-table branch (a), one regeneration, 4 chromium-linux snapshots in tree, below-fold visibility pixel-proven; layer 6: manual checks automated where possible with documented outcomes + honest human remainder list (batch 3); no vitest test claims engine behavior happy-dom cannot run | **PASS** |

MODIFIED/REMOVED: none in the delta — nothing to sweep.

---

## 3. Tasks sweep (phases 1–6)

| Phase | Task | State | Basis |
|---|---|---|---|
| 1 | 1.1 test file + HomePage factory | done | 24-assertion file verified in tree; factory diff verified; RED evidence recorded (apply-progress) |
| 1 | 1.2 typecheck | done | re-verified this session: exit 0 |
| 2 | 2.1 Insertion A | done | globals.css:481–507 verified |
| 2 | 2.2 Insertion B | done | globals.css:710–808 verified (+ F1-fix amendment, V-001) |
| 3 | 3.1 RevealOnScroll rewrite + deletions | done | source verified design-verbatim; files gone; rg sweeps clean |
| 3 | 3.2 ScrollProgress + unmount + layout mount | done | source + layout diff verified; 694/694 |
| 4 | 4.1 measurement protocol | done | heights recorded (apply-progress batch 2); exactly 2 sanctioned `reveal-tall` additions in diff |
| 4 | 4.2 bounded tuning | done | NO tuning — sanctioned defaults stand (CSS literals `10%`/`100%`/`40%` in tree; test 24 lockstep green) |
| 5 | 5.1 reduce computed-style e2e test | done | appended block verified in diff; chromium green both locales; negative probe proves gate-drop detection |
| 5 | 5.2 determinism probe + snapshots | done | branch (a); 4 `*-chromium-linux.png` in tree; second run green; below-fold visible (pixel-proven) |
| 5 | 5.3 full e2e | done (environment-mixed, honest) | 136 passed / 370 skipped / 59 failed on changed vs baseline 127/369/69 — zero change-caused failures after classification; blocked projects documented with exact reasons |
| 6 | 6.1 non-supporting engine | done-automated (emulation) + **human remainder OPEN by design** | genuine non-supporting engine cannot be run on this machine (chromium supports the feature); exact steps for the owner in apply-progress "Manual QA for Javier" |
| 6 | 6.2 print preview | done-automated (print media, PASS) + recommended real-print-UI eyeball OPEN by design | computed-style proof complete; paper feel listed for owner |
| 6 | 6.3 anchor jumps | done-automated; **F2 decision OPEN** (owner) | `#featured-projects` trivially revealed (no reveal subjects inside); `#sobre-mi` lands delayed column at ~0.68 opacity until one scroll gesture — V-002 |
| 6 | 6.4 reduce emulation | done-automated; F1 **fixed + pixel-verified** (batch 3.1); real-OS reduce check listed for owner | computed `animation-name: none` on `.reveal`; bar maps 1:1 under reduce post-fix |
| 6 | 6.5 both themes/directions/stagger | done-automated (engine-level) + human feel remainder OPEN by design | stagger separation, reversibility, dark theme all computed-style/pixel-proven (batch 3) |

**Nothing outside the documented human remainders is left unchecked.** Phase 7.1
is this report. tasks.md checkboxes were not edited (verify writes no code; the
apply-progress + this report are the record).

---

## 4. Findings ledger (verify phase)

| id | lens | severity | status | location | evidence |
|---|---|---|---|---|---|
| V-001 | reliability | WARNING | fixed + verified (amendment, needs review eyes) | `app/globals.css:738-753`, test 16 | **F1 fix-forward amendment** beyond design-verbatim CSS: the pre-existing global reduce clamp (`0.01ms !important` duration+delay) maps the bar's scroll timeline to a [50%,100%] sub-range in Chromium — bar invisible for the first half of the page under reduce, 2× fast after (pixel-proven, batch 3). The spec's own R1 scenario ("bar still reflects scroll progress… NOT clamped away") was violated pre-fix; the fix (`animation-duration: auto !important; animation-delay: 0s !important` under `@media (prefers-reduced-motion: reduce)` inside the bar's `@supports`) restores 1:1 mapping (pixel-verified: 0/25/50/75% scroll → scaleX 0/0.250/0.500/0.750). Source-guard assertion 16 amended accordingly. Scope note vs R6 ("no duration-based mitigation for timeline animations"): R6's text scopes itself to reveals ("This requirement's scenarios cover reveals only"); the bar rule is an un-clamp REQUIRED by R1's reduce scenario, not a reveal-hiding mitigation. Reveals remain purely structurally gated. The pre-fix design comment "clamp is a no-op for timeline animations" (globals.css:719–721) is now known false when duration AND delay are both nonzero — the comment still states it; cosmetic follow-up candidate only. |
| V-002 | reliability | SUGGESTION | open (info) — owner decision | spec R3 anchor-jump scenario; `/#sobre-mi` | F2: the anchor-jump scenario's THEN ("jump target fully revealed") is not literally met on desktop for the DELAYED tall column (lands at ~0.68 opacity until one scroll gesture; mobile left column 0.916, right below fold). Root cause is spec-internal: the scenario's parenthetical ("entry-based ranges complete at full entry") predates task 4.1's measurement making both `#sobre-mi` subjects `reveal-tall` (cover-based). The requirement BODY explicitly accepts progress-mapped mid-range states; nothing strands (proven: completes on any scroll, reverses with scroll). Non-blocking per severity floor; decision (accept as progress-mapped vs spec amendment) deferred to owner. |
| V-003 | resilience | WARNING | resolved (environmental, not a defect) | build step | Bare `npm run build` exits 1 on this machine: `DATABASE_URL` unset, throws at `lib/db/prisma.ts:18` during page-data collection on `/api/admin/health` + `/api/data-deletion/confirm` — all outside the change surface (git-verified untouched). Resolved by running the exact CI-declared env (ci.yml:93-98). CI green implies production builds unaffected. Follow-up candidate (out of scope): document local build env or provide `prisma generate`-time guard. |
| V-004 | reliability | SUGGESTION | open (info) — carry-overs | snapshots | (a) mobile-chrome-linux visual snapshots not regenerated (binary present; one deliberate `--project=mobile-chrome --update-snapshots` run pending); (b) ALL `-win32` snapshots are stale against the new DOM and must be regenerated on the Windows workstation post-merge. Both already documented in apply-progress batch 2; restated here so review/PR sees them. |
| V-005 | reliability | SUGGESTION | open (info) — by design | Phase 6 human remainder | Genuine non-supporting-engine check, real print-preview UI, smooth-scroll feel, real-OS reduce walkthrough: listed with exact steps in apply-progress "Manual QA for Javier". Automated proxies cover the computed-state guarantees; these four are irreducibly human on this machine. |

Blockers: **none.** No FAIL in the conformance table; V-001 is fixed and
verified, V-002/V-004/V-005 are info-level decisions/checklists for the owner.

---

## 5. Overall verdict

**PASS.** 10/10 spec requirements demonstrably met; every configured gate green
(tests 694/694, tsc 0, coverage floors cleared by ≥20 points, build exit 0 with
50/50 static pages); AD-6 zero-client-JS evidence exact (empty / hits / empty);
tasks phases 1–6 complete with only the documented human remainders open.

Next: review (full 4R fan-out fires — diff is ~825 lines forecast, over the
400-line pre-pr threshold), then PR. Owner decision items to carry into review:
F2 accept-vs-amend (V-002), snapshot carry-overs (V-004), manual QA remainder
(V-005).
