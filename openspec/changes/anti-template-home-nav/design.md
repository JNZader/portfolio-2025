# Design: Anti-Template Home + Nav Light (PR1)

## Technical Approach

Make PR1 a server-driven home composition cleanup: remove template-like chrome from the homepage, simplify the shared navigation source, and keep copy changes localized to next-intl catalogs. The page will own the home section order and scroll target, while reusable components stay presentational and route-safe.

This keeps the change surgical:
- no route merge for `/sobre-mi`
- no backend/newsletter changes
- no APiGen caption contract changes
- no client state added for home layout decisions

## Current State Summary

- **Home**: Hero has CV + Projects + Contact CTAs, then Quick Stats, three gradient dividers, Featured Projects, About preview, and a hero-like Newsletter block.
- **Nav**: `MAIN_NAVIGATION` still includes Home/Inicio; Header also adds a separate Contact CTA; MobileMenu special-cases Contact as a primary-looking row.
- **Footer**: Uses the shared nav plus a fake Services column.
- **About preview**: Uses generic agency-style bullets and two stacked glass cards.
- **Newsletter**: Visually strong, reads like a general marketing signup rather than opt-in updates.
- **ScrollIndicator**: Defaults to `#content`, even when Featured Projects is the first useful below-fold block.

## Architecture Decisions

### Decision: Make `MAIN_NAVIGATION` the single canonical nav list

**Choice**: Remove `home` from `lib/constants/navigation.ts`; keep `about`, `projects`, `blog`, `contact` in that order.
**Alternatives considered**: Keep Home in the list and hide it in specific renderers.
**Rationale**: One shared source keeps Header, MobileMenu, and Footer aligned and avoids locale-specific drift.

### Decision: Remove the dedicated header Contact CTA

**Choice**: Header desktop uses the nav list only; Contact remains a normal nav item in the header chrome and mobile drawer.
**Alternatives considered**: Keep the filled Contact button and drop nav Contact.
**Rationale**: This satisfies the single-Contact rule with the smallest DOM change and preserves keyboard order.

### Decision: Move home scroll-target selection to the server page

**Choice**: `app/[locale]/page.tsx` resolves whether Featured Projects exist and passes the resolved `scrollTargetId` to `HeroSection`.
**Alternatives considered**: Leave `ScrollIndicator` defaulted to `content`; duplicate the featured-project fetch inside the page.
**Rationale**: The target depends on rendered content, so the page should decide it once and avoid duplicated Sanity work.

### Decision: Make `FeaturedProjects` data-in, not self-fetching

**Choice**: Extract home featured-project loading into a shared server helper and pass the filtered projects into `FeaturedProjects`.
**Alternatives considered**: Keep the internal fetch and add a second loader for the page.
**Rationale**: One loader gives the page the data needed for scroll fallback and keeps fetch logic centralized.

### Decision: Reduce About chrome by collapsing repeated glass surfaces

**Choice**: Keep the About preview content, but lighten the sidebar with a single surface or plain bordered blocks instead of two identical glass cards.
**Alternatives considered**: Keep the existing stacked card pattern and only rewrite copy.
**Rationale**: The visual complaint is partly structural, not just textual.

### Decision: Demote newsletter visually without changing the route

**Choice**: Keep the home newsletter section, but reduce its hero-like weight and reframe copy as blog/engineering updates opt-in.
**Alternatives considered**: Remove newsletter from home or alter `/newsletter` behavior.
**Rationale**: PR1 should only quiet the homepage surface; the dedicated newsletter route stays intact.

## Data Flow

```text
app/[locale]/page.tsx
  ├─ getTranslations('Home' | 'Nav' | 'Newsletter')
  ├─ load featured projects via shared server helper
  ├─ derive scrollTargetId = featured-projects | content
  ├─ pass props to HeroSection / FeaturedProjects / NewsletterHero
  └─ render About preview from next-intl message keys

lib/constants/navigation.ts
  └─ MAIN_NAVIGATION → Header / MobileMenu / Footer

components/sections/hero-section.tsx
  └─ ScrollIndicator(targetId)

components/sections/FeaturedProjects.tsx
  └─ receives prefiltered featured projects + stable section id

messages/es.json + messages/en.json
  └─ Home/Nav/Footer/Newsletter labels stay locale-owned and in parity
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/page.tsx` | Modify | Remove Quick Stats, reduce dividers, pass scroll target, simplify About preview, demote newsletter |
| `components/sections/hero-section.tsx` | Modify | Accept a scroll-target prop for `ScrollIndicator` |
| `components/sections/FeaturedProjects.tsx` | Modify | Add stable `id`, accept preloaded featured projects instead of fetching internally |
| `lib/data/home.ts` | Create | Shared cached loader for home featured projects / presence |
| `lib/constants/navigation.ts` | Modify | Remove Home from `MAIN_NAVIGATION` |
| `components/layout/Header.tsx` | Modify | Remove the separate Contact CTA button |
| `components/layout/MobileMenu.tsx` | Modify | Render Contact as a normal nav item; drop CTA-style special casing |
| `components/layout/Footer.tsx` | Modify | Remove Services column; rebalance footer grid |
| `components/newsletter/NewsletterHero.tsx` | Modify | Reduce home visual weight and update framing to opt-in updates |
| `messages/es.json` / `messages/en.json` | Modify | Rewrite home/about/newsletter/footer copy; remove unused keys |
| `__tests__/integration/components/HeroSection.test.tsx` | Modify | Assert hero CTA density and scroll target contract |
| `__tests__/integration/components/FeaturedProjects.test.tsx` | Modify | Assert stable section id and empty-state behavior |
| `__tests__/integration/components/MobileMenu.test.tsx` | Modify | Assert nav order and no Contact CTA duplication |
| `__tests__/integration/components/VisualBatch5QuickWins.test.tsx` | Modify | Remove stats/services source guards that are no longer valid |
| `e2e/tests/navigation.spec.ts` | Modify | Update desktop/mobile/footer nav expectations |
| `e2e/tests/quick-stats.spec.ts` | Modify or retire | Replace positive stats assertions with a regression check for absence |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Nav constants, message parity, loader behavior | Assert `MAIN_NAVIGATION` shape and locale key parity in isolated tests |
| Integration | Home composition, hero CTA count, Featured Projects id, MobileMenu/Header/Footer semantics | Render server components with mocks and assert roles, order, and absence of removed chrome |
| E2E | Desktop/mobile nav, footer links, scroll target, home section order | Update Playwright to use semantic role/name assertions; keep browser-dependent checks explicit |

Focused assertions to add/update:
- no Quick Stats grid anywhere on home
- hero actions limited to CV + Projects
- Contact appears once in header chrome and is not duplicated as a mobile CTA
- footer has no Services column
- ScrollIndicator targets Featured Projects when present, otherwise `#content`
- newsletter copy keys read as updates/opt-in, not contact substitute

## Risks and Mitigations

1. **Duplicate featured-project fetch**
   - *Mitigation*: centralize loading in a cached shared helper and pass the result down once.
2. **Contact placement confusion across header and footer**
   - *Mitigation*: keep PR1 scoped to header chrome; do not add new Contact surfaces.
3. **Locale drift while deleting Home/Stats/Services keys**
   - *Mitigation*: update both catalogs in the same change and add parity assertions.
4. **Scroll target regression when Featured Projects is empty**
   - *Mitigation*: resolve the target on the server from actual data and cover both states in tests.
5. **Layout regression after removing the stats/divider/footer columns**
   - *Mitigation*: keep visual changes localized and update geometry-focused E2E only where semantics changed.

## PR1 vs PR2 Boundary

**PR1** ships only home chrome/voice cleanup and light nav/footer adjustments:
- remove Quick Stats
- remove footer Services
- reduce hero CTA density
- remove Home from `MAIN_NAVIGATION`
- keep Blog
- keep `/sobre-mi` as a real route
- keep APiGen caption contract intact
- demote newsletter visually

**PR2** is excluded here:
- absorb full `/sobre-mi` into home
- 301 `/sobre-mi` to home
- any route consolidation or About/nav removal

## Implementation Sequencing

1. Update `MAIN_NAVIGATION`, Header, MobileMenu, and Footer first so the shared nav contract is stable.
2. Move home data/scroll-target resolution onto the server page and wire `HeroSection` + `FeaturedProjects` to it.
3. Remove Quick Stats and simplify the About preview chrome/copy.
4. Demote the newsletter section visually and update message catalogs in both locales.
5. Refresh integration/E2E assertions last, then run `npm run test:run`.

## Open Questions

None.
