# AGENTS.md — Simplify APiGen Featured Link

## Context

Next.js 16 App Router, React 19, strict TypeScript, Tailwind 4, next-intl, Vitest/Testing Library, and Playwright. The existing `HeroTerminal` is decorative and `aria-hidden`; the existing `ProjectDetail` owns safe named GitHub links. Do not edit the archive or unrelated CV/cards/blog/footer/Sanity/terminal internals.

## Tasks

### Task 1: Simplified UI contract
**Files**: `app/[locale]/page.tsx`, `components/sections/hero-section.tsx`, `messages/es.json`, `messages/en.json`
**What**: Remove `featuredProject`, `FeaturedProjectActions`, obsolete keys, and make the complete `t.rich('apigenCaption')` output one locale-aware link to `/proyectos/apigen`.
**Acceptance**: ES/EN full caption is the exact link name; APiGen remains semantic bold; persistent non-color cue and focus-visible styling exist; link is the paragraph sibling after the unchanged terminal.
**Dependencies**: none

### Task 2: Focused regression tests
**Files**: `__tests__/integration/components/HeroSection.test.tsx`, `__tests__/unit/messages/project-conversion.test.ts`, `__tests__/integration/components/ProjectDetail.test.tsx`
**What**: Test full-caption semantics, parity, obsolete-key absence, terminal exclusion, and direct APiGen GitHub safety.
**Acceptance**: Exact hrefs and `target="_blank"`/`rel="noopener noreferrer"` are asserted without changing `ProjectDetail.tsx`.
**Dependencies**: Task 1

### Task 3: Browser and environment verification
**Files**: `e2e/tests/accessibility-interactions.spec.ts`, `e2e/tests/navigation.spec.ts`
**What**: Cover locale navigation, focus, reduced motion, terminal keyboard exclusion, and caption-local 320px/200% geometry; preserve typed blocked reporting.
**Acceptance**: Caption-specific clipping/overflow checks pass; browser/Sanity/build blocks remain explicit and excluded from coverage.
**Dependencies**: Tasks 1–2

### Task 4: Delivery verification
**Commands**: `npm run test:run`; `npm run type-check`; `npm run check`; `npm run e2e -- --project=chromium`
**What**: Verify feature-branch-chain boundaries, exclusions, and rollback scopes.
**Acceptance**: PR 1 (UI + focused tests) is independently coherent; PR 2 contains only browser/reporting verification and targets PR 1.
**Dependencies**: Tasks 1–3
