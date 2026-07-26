# Design: Clarify Project Conversion

## Technical Approach

Add one required semantic conversion block to the existing homepage hero, immediately after the decorative `HeroTerminal` in the same right-column wrapper. The terminal remains a client-side visual with `aria-hidden="true"`; its scrollable body loses `tabIndex={-1}` because ref-driven `scrollTop` does not require focus. The block exposes a required, visibly labeled APiGen case-study link and an optional visibly labeled GitHub link. The APiGen case-study action is always rendered; GitHub is rendered only when `featuredProject.githubHref` exists.

`HomePage` owns a literal APiGen contract and MUST pass it to `HeroSection`. `HeroSectionProps.featuredProject` is required, so omission at the homepage call site is a TypeScript error rather than a silent missing CTA. Labels are catalog-driven and exact: Spanish `Ver caso de estudio de APiGen` / `Código fuente de APiGen en GitHub`; English `View APiGen case study` / `View APiGen source on GitHub`. The CV split interaction remains unchanged except for the localized view label.

No Sanity fetch, schema field, modal, anchor redesign, blog/footer work, or card redesign is introduced.

## Architecture Decisions

### Decision: Remove the terminal tab index rather than weaken the ARIA boundary

**Choice**: Remove `tabIndex={-1}` from `HeroTerminal`’s scroll body, retain the root `aria-hidden="true"`, and add a regression assertion that the hidden subtree has no `tabindex`, focusable descendants, or interactive controls.

**Alternatives considered**: Keep `tabIndex={-1}` and rely on the fact that it is not in normal Tab order; add a programmatic-focus exception; make the terminal visible to assistive technology.

**Rationale**: The strict spec requires no focusable/programmatically focusable descendant. Removing the smallest conflicting attribute satisfies that boundary. `useTypingSequence()` still assigns `bodyRef.current.scrollTop = bodyRef.current.scrollHeight` while replaying, so keyboard focus is not needed and scroll behavior is preserved. No code may call `.focus()` on the terminal.

### Decision: Make the internal featured project contract required and GitHub optional

**Choice**: Define `FeaturedProject` with required literal `detailHref` and optional `githubHref`; make `HeroSectionProps.featuredProject` required; pass the object unconditionally from `app/[locale]/page.tsx`.

**Alternatives considered**: Make the prop optional; add a runtime warning; make GitHub required; derive the route from a title or CMS record.

**Rationale**: A required prop prevents silent CTA omission at compile time. The case-study path is the required conversion path. GitHub is a secondary action and must remain truly optional across proposal, spec, interface, data flow, rendering, and tests. Explicit literals prevent display-title/locale drift and avoid broad Sanity scope.

### Decision: Use visible catalog labels, not accessible-only labels

**Choice**: Render the exact localized APiGen labels as visible text inside native links. Use semantic role/name assertions for interactive elements and no icon-only APiGen action.

**Alternatives considered**: Icon-only links with `aria-label`; visible icon plus screen-reader-only text; labels derived from project title.

**Rationale**: Recruiters and non-screen-reader users must understand the next action. Visible text is robust at mobile widths, 200% reflow, keyboard navigation, and automated role/name testing. The catalogs remain the single source of user-facing copy.

### Decision: Keep the CTA as a local presentation boundary

**Choice**: Add a `FeaturedProjectActions` local component in `components/sections/hero-section.tsx`. It receives the required `FeaturedProject`, `t`, and renders the semantic `data-testid="apigen-featured-actions"` wrapper, required case-study link (`data-testid="apigen-case-study-cta"`), and conditional GitHub link.

**Alternatives considered**: Put all links inline in `HeroSection`; create a new shared CTA package; put actions inside `HeroTerminal`.

**Rationale**: A local boundary is task-ready and isolates the conversion contract without inventing a reusable abstraction. The sibling wrapper makes the `aria-hidden` boundary structurally testable. Interactive tests use exact role/name; test IDs are reserved for structural containment only.

### Decision: Preserve existing CV and ProjectCard interaction models

**Choice**: Change only CV view copy if needed; preserve the two anchors, download attribute, and localized `/cv` link. Preserve `ProjectCard` geometry, title overlay, bottom action layer, featured badge, and detail link unless representative evidence proves a defect.

**Alternatives considered**: Replace the split control, add a modal, normalize all card heights, or add another project-content path.

**Rationale**: These changes are outside the conversion gap and risk removing intentional hierarchy. Existing components already provide the correct interaction primitives and card layering.

## Data Flow

```text
HomePage (server)
  ├─ resolves Home/Common translations
  └─ passes required featuredProject
       { detailHref: '/proyectos/apigen',
         githubHref?: 'https://github.com/JNZader-Vault/apigen' }
       ↓
HeroSection (server)
  ├─ HeroTerminal (client, aria-hidden, no tabindex/focusable descendants)
  └─ FeaturedProjectActions (semantic sibling)
       ├─ required Link → /proyectos/apigen
       │                 → locale-aware /en/proyectos/apigen when English
       └─ optional ExternalLink → GitHub URL → target=_blank + safe rel

CVButton (server)
  ├─ download anchor → locale-specific resume endpoint
  └─ locale Link → /cv, explicit localized web-CV name

ProjectCard (client)
  └─ existing detail Link → /proyectos/{project.id}; no geometry change by default
```

The internal href is a literal stable route value, not a translated title. The optional GitHub value flows only when present; omission renders no GitHub anchor while never suppressing the required internal link.

## Component Boundaries and Selectors

| Boundary | Responsibility | Stable test contract |
|----------|----------------|----------------------|
| `app/[locale]/page.tsx` | Owns the fixed APiGen identity and passes `featuredProject` on every homepage render. | TypeScript requires `featuredProject`; integration test asserts the homepage contract is present. |
| `HeroSection` in `components/sections/hero-section.tsx` | Owns layout, translations, sibling ordering, and calls `FeaturedProjectActions`. | No CTA is rendered inside `[data-testid="hero-terminal"]`. |
| `FeaturedProjectActions` local component | Owns required internal link and conditional optional GitHub link. | Wrapper: `[data-testid="apigen-featured-actions"]`; internal link: `[data-testid="apigen-case-study-cta"]`; links otherwise selected by exact `getByRole('link', { name })`. |
| `HeroTerminal` in `components/sections/HeroTerminal.tsx` | Owns decorative replay and ref-driven scroll only. | Root: `[data-testid="hero-terminal"]`; assert `aria-hidden="true"`, no descendant `a,button,input,select,textarea,[tabindex]`, and no `.focus()` contract. |
| `CVButton` | Owns separate download/view anchors and localized names. | Select by `getByRole('link', { name: exactLocaleLabel })`; do not select the eye icon. |
| `ProjectCard` | Preserves existing title/detail/external action layers. | Select detail by localized `getByRole('link', { name: /view details|ver detalles/i })`; do not use CSS classes/icon markup. |

## Interfaces / Contracts

```ts
interface FeaturedProject {
  detailHref: '/proyectos/apigen';
  githubHref?: 'https://github.com/JNZader-Vault/apigen';
}

interface HeroSectionProps {
  // existing props...
  featuredProject: FeaturedProject;
}
```

The homepage passes:

```ts
featuredProject={{
  detailHref: '/proyectos/apigen',
  githubHref: 'https://github.com/JNZader-Vault/apigen',
}}
```

The implementation MAY omit `githubHref` without changing the required internal path. No `title` or CMS field may substitute for `detailHref`. New message keys are parallel in `Home` (APiGen labels) and `Common` (CV view label); no user-facing copy is hardcoded in TSX.

## Accessibility, Motion, and Responsive Behavior

- Keep `aria-hidden="true"` on the terminal root and place both APiGen actions in its sibling semantic wrapper.
- Remove only `tabIndex={-1}` from the scroll body. Preserve `ref`, `overflow-y-auto`, max height, and `useTypingSequence` `scrollTop` behavior. Do not add programmatic focus.
- Render native links with visible labels. The internal link uses `Link`; optional GitHub uses `ExternalLink`, which supplies `target="_blank"` and `rel="noopener noreferrer"`.
- Keep decorative icons `aria-hidden`; no APiGen action is icon-only. Existing focus-visible styles and Button sizing remain in use.
- Use a vertical/wrapping action layout that fits the right column at 320px and after 200% zoom/reflow; no new horizontal overflow.
- With `prefers-reduced-motion: reduce`, the terminal completes immediately and the CTA is available before any timer. Motion-enabled replay does not gate CTA availability.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/[locale]/page.tsx` | Modify | Pass required literal `featuredProject`; compile-time omission is invalid. |
| `components/sections/hero-section.tsx` | Modify | Require the prop, add local `FeaturedProjectActions`, exact visible labels, sibling test IDs, and responsive layout. |
| `components/sections/HeroTerminal.tsx` | Modify | Remove `tabIndex={-1}`, add `data-testid="hero-terminal"`, preserve replay/ref scroll and `aria-hidden`. |
| `components/ui/CVButton.tsx` | Modify if needed | Consume clarified localized CV-view wording without structural redesign. |
| `messages/es.json` | Modify | Add exact Spanish APiGen visible labels and clarified CV-view key. |
| `messages/en.json` | Modify | Add exact English APiGen visible labels and clarified CV-view key. |
| `__tests__/integration/components/HeroSection.test.tsx` | Create/modify | Assert required prop rendering, exact labels, stable hrefs, optional GitHub presence/omission, sibling containment, and focus boundary. |
| `__tests__/integration/components/HeroTerminal.test.tsx` | Modify | Assert `aria-hidden`, no `tabindex`/interactive descendants, reduced-motion complete output, and preserve stable replay assertions. |
| `__tests__/integration/components/ProjectCardVisualUx.test.tsx` | Modify only if card code is touched | Preserve localized details link and layering; no geometry assertion without evidence. |
| `e2e/tests/accessibility-interactions.spec.ts` | Modify | Assert exact ES/EN visible CTA names, keyboard order, target sizing, 320px overflow, 200% reflow, reduced motion, and terminal boundary. |
| `e2e/tests/navigation.spec.ts` | Modify | Assert locale-aware APiGen case-study routes and optional GitHub href/target/rel without following remote GitHub. |
| `e2e/fixtures/test-data.ts` or test helper | Modify if needed | Add explicit environment preflight/report annotation helpers; do not hide blocks as passes. |

No route, Sanity schema, modal, or persisted-data file is required.

## Testing Strategy and Acceptance Procedures

| Layer | What to test | Concrete assertion/procedure |
|-------|--------------|------------------------------|
| Integration | CTA contract | Render each locale; `getByRole('link', { name: exact })`, exact visible `textContent`, href `/proyectos/apigen` or `/en/proyectos/apigen`, and wrapper outside `hero-terminal`. |
| Integration | Required/optional data flow | Render with `featuredProject` and without `githubHref`; internal link remains; GitHub is absent. Type-check proves the prop cannot be omitted at the homepage call site. |
| Integration | Terminal boundary | Query `[data-testid="hero-terminal"]`; assert `aria-hidden="true"`, `querySelectorAll('a,button,input,select,textarea,[tabindex]').length === 0`, and body has no `tabindex`. |
| Integration | Motion | Mock reduced motion; assert completion/final output immediately and CTA visible/focusable. Advance timers for normal replay and assert ref-driven behavior remains covered. |
| E2E | 320px | `page.setViewportSize({ width: 320, height: 720 })`; dismiss consent; assert `scrollWidth <= clientWidth`, exact visible labels, non-zero/in-viewport CTA box, and no overlap. Run ES and EN. |
| E2E | 200% zoom/reflow | Execute the repository’s 200% browser-zoom procedure; fallback is `document.documentElement.style.zoom = '2'` with equivalent effective 320px width. Assert no overflow, clipping, overlap, or offscreen action; assert full visible labels. |
| E2E | Reduced motion | `page.emulateMedia({ reducedMotion: 'reduce' })`; load homepage; assert full terminal marker and exact CTA visibility/focusability without waiting for replay. |
| E2E | Keyboard/selectors | Tab from the hero precondition; assert focus reaches named links and never enters `[data-testid="hero-terminal"]`. Use role/name for actions and only the three structural test IDs above. |
| ProjectCard | Regression | Use the existing representative fixture; assert localized details href/name and no nested interactive target. Change geometry only if a fixture reproduces the defect and the regression records the invariant. |

### Environment skip/report contract

Sanity-dependent tests preflight both `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`. Missing variables or unavailable remote data produce a report annotation `{ type: 'environment', status: 'blocked', reason: '...' }`, are excluded from pass/coverage denominators, and do not prevent unrelated static tests. They are not ordinary `skipped` tests.

Each Playwright project (`chromium`, `firefox`, `webkit`, and configured mobile projects) is preflighted. Missing Firefox/WebKit executables or launch failures produce the same `blocked` annotation containing project name and error. Chromium success cannot claim Firefox/WebKit coverage. The final verification output MUST print separate `passed`, `failed`, `skipped`, and `blocked` counts; only product-condition skips are `skipped`. A run with only declared environment blocks may exit without an implementation-failure code, but MUST be reported as incomplete and MUST NOT claim full coverage.

## Evidence-Gated Card Geometry

Compare local fixtures and representative Sanity-shaped data before touching `ProjectCard`. If no reproducible outlier exists, make no card geometry change. If one exists, change only the shared class causing it, retain the featured badge and separate title/action layers, and add a dimension/layout invariant. Missing Sanity configuration is an environment block, not evidence for a redesign.

## Migration / Rollout and Rollback

No migration, feature flag, route migration, Sanity schema change, or persisted-data update is required. Roll back the implementation commit as a unit: remove the sibling CTA/message keys, restore prior CV copy if changed, and revert any evidence-backed card class change. Existing routes and records require no data repair.

## Review Budget

The design targets a small implementation below the configured 800 changed-line budget. A modal, CMS contract, broad card redesign, environment fix, or unrelated copy cleanup is explicitly excluded.

## Open Questions

None blocking.
