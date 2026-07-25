# Proposal: Anti-Template Home + Nav Light (PR1)

**Change**: `anti-template-home-nav`  
**PR boundary**: **PR1 of 2** — home chrome / voice / CTA density + light nav fixes only.  
**PR2 (follow-up, out of scope here)**: absorb full `/sobre-mi` into home + 301 `/sobre-mi`.  
**Base**: `main` @ `0d98b84` (v2.25.0, featured projects already merged).  
**Delivery**: auto-forecast 2-PR chain; review budget ~800 changed lines for this PR.

---

## Intent

After featured projects landed on home, Round-4 UX audit + Goncy “template portfolio” feedback still flag the homepage as agency-template: generic approach bullets, KPI strip, fake Services column, triple gradient dividers, glass-card stacking, and Contact duplicated in nav list + header CTA. ScrollIndicator also jumps past Featured Projects to a distant `#content` about block.

**Goal of PR1**: make home read as a concrete backend developer’s site (same voice as About journey copy), cut chrome noise, and lighten primary navigation — without restructuring routes or merging About.

**Why now**: highest anti-template ROI is chrome + copy, not IA surgery. PR2 can later collapse About into home once home is already non-generic.

---

## Scope

### In Scope (PR1 — Full P0 + nav light)

| ID | Deliverable |
|----|-------------|
| **T-01** | Kill/rewrite generic `approach1`–`approach4` bullets toward concrete About-style voice (or remove the approach list if rewrite is weaker than journey-only). |
| **T-02** | **Remove Quick Stats KPI strip entirely** from home (`STATS` grid + related Home message keys that become unused). |
| **T-03** | **Remove Footer “Services” fake product column** (non-link agency list); keep brand + nav + legal. Adjust footer grid to 2 columns (or brand/nav balanced layout). |
| **T-04** | **Reduce CTA density** — Hero max 2 primary actions: **CV** (split download/view) + **Projects**. Remove hero Contact ghost CTA. Contact remains once in nav **or** header CTA, not both (see R-01). |
| **T-05** | **Unify voice** on home about preview toward concrete About tone (journey already good; align subtitle/approach/experience chrome so home does not feel like a second marketing journey vs `/sobre-mi`). |
| **T-06** | **Reduce chrome rhythm** — gradient `SectionDivider` count **3 → ≤1**; reduce identical `glass-card` stacking in about sidebar (prefer one card surface or plain `bg-card`/border, not two stacked glass cards with same hover). |
| **R-01** | **Dedupe Contact**: either keep Contact in `MAIN_NAVIGATION` and remove Header filled CTA, **or** keep Header CTA and drop Contact from the nav list. Prefer **one** clear Contact entry site-wide in header chrome. Mobile drawer must match the same rule (no double Contact). |
| **R-02** | **Remove Home/Inicio from `MAIN_NAVIGATION`** — logo already goes home (Header + MobileMenu + Footer). |
| **R-06** | **Fix ScrollIndicator target** to first useful below-fold block after hero (after T-02: **Featured Projects** section id, e.g. `featured-projects`), not distant about `#content`. |
| **Newsletter demote** | Keep home Newsletter section and `/newsletter` page. Demote visually (less hero-like gradient/size) and reframe copy so it is clearly **not Contact** (blog/updates opt-in, not hiring outreach). |

**Locked product constraints (do not reopen):**

- Blog **ALWAYS** stays in primary nav (**R-05 cancelled**).
- `/proyectos` stays full searchable grid; home Featured remains curated subset.
- APiGen stays private (existing case-study path only; no public-repo advertising change).
- Blog content Spanish-only; no advertising `/en/blog`.
- All UI strings via next-intl keys in **both** `messages/es.json` and `messages/en.json`.

### Out of Scope (PR2 and later)

- Absorbing full `/sobre-mi` into home (education timeline, photo, areas deep merge).
- 301 redirect `/sobre-mi` (or removing About from primary nav for that reason).
- Filter control restyle on `/proyectos` (U-01) unless a trivial drive-by appears during PR1.
- Rate-limit / newsletter backend changes.
- HeroTerminal / APiGen caption conversion contract changes (preserve existing specs).
- Theme system, InteriorHero global restyle, or new section types beyond demotion/removal above.

---

## Approach

### 1. Home composition (post-change target)

Current (`app/[locale]/page.tsx`):

1. Hero (CV + Projects + Contact + social + terminal)  
2. Quick Stats (4 KPI cards)  
3. Gradient divider  
4. FeaturedProjects  
5. Gradient divider  
6. About preview (`id="content"`)  
7. Gradient divider  
8. NewsletterHero  

**Target PR1 order:**

1. Hero (CV + Projects only as primary actions; social retained)  
2. FeaturedProjects (**first below-fold**; stable `id` for ScrollIndicator)  
3. At most **one** divider (or none if spacing alone is enough)  
4. About preview (concrete voice; lighter sidebar chrome; keep a stable id if skip-links/tests need it — may remain `content` or rename carefully with test updates)  
5. Newsletter (demoted framing + visual weight)

### 2. Navigation light

- `MAIN_NAVIGATION` becomes: **About, Projects, Blog, Contact** — **or** About, Projects, Blog if Contact is header-CTA-only.  
  **Decision for implementation (locked preference):**  
  - Remove `home` from list (R-02).  
  - **Contact once**: keep Contact in `MAIN_NAVIGATION`; **remove** Header desktop filled Contact button. Mobile: stop special-casing Contact as a second primary button style if it already appears as a normal nav item **or** if Header CTA is removed, keep one clear Contact row without duplicating a separate CTA.  
  - Blog stays.
- Footer nav consumes the same `MAIN_NAVIGATION` (no Home link; no Services column).
- Update E2E/nav tests that hardcode `['Inicio', …]` / `['Home', …]`.

### 3. Copy / i18n

- Rewrite or remove `Home.approach*` toward About `work*` concreteness (stacks, ownership, production constraints) — bilingual parity.
- Soften `Home.aboutSubtitle` if it still reads generic agency.
- Newsletter: rewrite `heading` / `description` / benefits toward “updates from the blog / engineering notes” and explicit non-contact framing; optionally smaller size prop / quieter section classes in `NewsletterHero`.
- Delete unused keys only after tests/consumers are updated (stats, services, heroCtaContact if unused).

### 4. Chrome

- Delete Quick Stats block + `STATS` constant + lucide imports used only there.
- Footer: drop `data-footer-column="services"` block; grid `md:grid-cols-3` → `md:grid-cols-2` (or brand | nav).
- About sidebar: reduce dual `glass-card` stack (T-06) — e.g. single surface or non-glass cards.
- ScrollIndicator: pass `targetId` for Featured Projects section id from `HeroSection` / page.

### 5. Testing (strict TDD)

- `npm run test:run` is the gate.
- Prefer RED tests first for: nav item set, no stats section, no footer services, hero CTA count, ScrollIndicator target, newsletter non-contact copy keys, i18n key presence.
- Update existing integration/E2E that assert old nav labels or home structure (`e2e/tests/navigation.spec.ts`, HeroSection tests, footer layout tests if any).

### 6. PR size discipline

Stay within ~800 review lines: copy + structural JSX + tests co-located. No drive-by InteriorHero/token refactors.

---

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/[locale]/page.tsx` | Modified | Remove stats; CTA props; divider count; about chrome; section order/ids |
| `components/sections/hero-section.tsx` | Modified | Drop secondary Contact CTA usage path; ScrollIndicator `targetId` |
| `components/sections/FeaturedProjects.tsx` | Modified | Add stable section `id` for scroll target |
| `components/layout/Header.tsx` | Modified | R-01 Contact dedupe (remove filled CTA if Contact stays in nav) |
| `components/layout/MobileMenu.tsx` | Modified | Align Contact styling with single-Contact rule |
| `components/layout/Footer.tsx` | Modified | Remove Services column; grid adjust |
| `lib/constants/navigation.ts` | Modified | Remove `home`; keep blog; Contact policy per R-01 |
| `components/newsletter/NewsletterHero.tsx` | Modified | Visual demotion |
| `messages/es.json`, `messages/en.json` | Modified | Home/Footer/Nav/Newsletter keys |
| `__tests__/**`, `e2e/tests/navigation.spec.ts` | Modified | Assertions for nav, home, footer |
| `openspec/specs/ui/spec.md` | Delta later | Spec phase will add home/nav anti-template requirements (not this file) |

**Unchanged by design:** `/proyectos` grid, `/sobre-mi` page content, `/newsletter` route existence, APiGen privacy, blog locale strategy, contact form backend.

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| E2E/nav tests hardcode Home + dual Contact | High | Update navigation E2E and MobileMenu tests in same PR; run full `test:run` + targeted Playwright nav suite |
| Removing hero Contact reduces conversion | Med | Contact remains in primary nav (and footer link); CV + Projects stay highest-friction-reducing actions for recruiters |
| Scroll target missing when Featured returns `null` (empty Sanity) | Med | Fallback target: about section id if featured absent; or always render a lightweight featured wrapper with id |
| i18n key drift ES/EN | Med | Parallel key edits; fail tests on missing messages; no hardcoded UI strings in TSX |
| Footer layout regression (2-col) | Low | Keep brand + nav; existing footer a11y min targets; visual smoke |
| Scope creep into PR2 About merge | Med | Explicit non-goals; do not remove About from nav in PR1 |
| Review budget overrun | Med | No InteriorHero/global token work; tests only for changed behavior |

---

## Rollback Plan

1. Revert the PR commit(s) / merge revert on `main`.  
2. No DB/schema/migrations; no Sanity schema changes; newsletter data untouched.  
3. i18n keys removed in PR can be restored from git history.  
4. Feature is pure UI/IA chrome — rollback restores previous home/nav immediately with zero data repair.

---

## Dependencies

- **Prerequisite**: featured projects already on `main` (satisfied @ `0d98b84`).
- **Does not block / is not blocked by** rate-limit or projects filter work.
- **PR2** depends on this PR only for a cleaner home canvas; PR1 must ship independently.

---

## Success Criteria

- [ ] Quick Stats section is gone from home (both locales).
- [ ] Footer has no Services column / fake product list.
- [ ] Hero primary actions are at most CV + Projects (no third Contact ghost).
- [ ] Contact appears once in header chrome (nav **or** CTA, not both); Blog remains in primary nav.
- [ ] Home/Inicio is not a main-nav item; logo still reaches home.
- [ ] ScrollIndicator scrolls to first useful below-fold block (Featured Projects when present).
- [ ] Gradient dividers on home ≤ 1; about sidebar less “identical glass stack”.
- [ ] Approach/about preview copy reads concrete (About-like), not four generic agency bullets.
- [ ] Newsletter remains but is visually quieter and framed as non-contact updates (ES + EN keys).
- [ ] `/proyectos`, `/sobre-mi`, `/newsletter` routes still work; no About→home merge; no 301.
- [ ] `npm run test:run` green; relevant nav E2E updated and passing when run.
- [ ] Changed-line budget roughly ≤ 800 for reviewable PR1.

---

## Work Item Traceability

| Item | Proposal coverage |
|------|-------------------|
| T-01 | Approach §3 + Success (approach rewrite) |
| T-02 | Scope + Approach §1/§4 |
| T-03 | Scope + Footer affected area |
| T-04 | Scope + Hero CTA |
| T-05 | Scope + copy unify |
| T-06 | Scope + chrome rhythm |
| R-01 | Scope + nav approach |
| R-02 | Scope + MAIN_NAVIGATION |
| R-06 | Scope + ScrollIndicator / Featured id |
| Newsletter demote | Scope + NewsletterHero / messages |
| R-05 | Explicitly cancelled — Blog stays |
| PR2 About absorb + 301 | Out of Scope |

---

## Open Implementation Choices (non-blocking; resolve in design/tasks)

1. **Contact placement**: Prefer Contact **in** `MAIN_NAVIGATION` + remove Header button (cleaner mobile parity). Alternative: header CTA only — only if design wants Contact more prominent than About/Blog.  
2. **Approach list**: rewrite four bullets vs replace with 2 About-style `work*` lines vs remove list and keep journey only. Prefer rewrite/shorten over empty section.  
3. **Featured empty fallback** for ScrollIndicator when Sanity returns no featured projects.

These do not reopen locked product decisions; they are implementation details for `sdd-design` / `sdd-tasks`.
