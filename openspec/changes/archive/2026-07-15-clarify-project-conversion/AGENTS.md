# AGENTS.md — Clarify Project Conversion

## Context

Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, next-intl, Vitest/Testing Library, and Playwright. Existing locale-aware `Link` and `ExternalLink` helpers must be reused. `HeroTerminal` is decorative and `aria-hidden`; `ProjectCard` already has a title overlay and separate bottom actions.

## Tasks

### Task 1: UI contract
**Files**: `app/[locale]/page.tsx`, `components/sections/hero-section.tsx`, `components/sections/HeroTerminal.tsx`, `messages/es.json`, `messages/en.json`, `components/ui/CVButton.tsx`
**What**: Require the APiGen contract, render visible ES/EN case-study/GitHub actions beside the terminal, remove terminal `tabIndex`, and visibly label CV navigation.
**Acceptance**: Exact labels, locale routes, safe external link, no focusable terminal descendants, reduced-motion output intact.

### Task 2: Regression tests
**Files**: `__tests__/integration/components/*.test.tsx`, `components/projects/ProjectCard.tsx`
**What**: Add unit catalog-parity and integration contract/boundary tests; change card geometry only when representative evidence and a focused invariant justify it.
**Acceptance**: Detail action and featured hierarchy remain; no nested interactive targets.

### Task 3: Browser/reporting coverage
**Files**: `e2e/tests/accessibility-interactions.spec.ts`, `e2e/tests/navigation.spec.ts`, `e2e/fixtures/test-data.ts`
**What**: Test both locales, keyboard/focus, reduced motion, 320px and 200% reflow after scroll/focus; implement typed Sanity/browser blocked reporting.
**Acceptance**: No overflow/clipping; separate passed/failed/skipped/blocked counts; blocked checks never count as coverage.

**Dependencies**: Task 1 → Task 2 → Task 3.
**Commands**: `npm run test:run`; `npm run type-check`; `npm run check`; `npm run e2e -- --project=chromium`.
