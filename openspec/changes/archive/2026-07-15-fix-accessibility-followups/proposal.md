# Proposal: Fix Confirmed Accessibility Follow-ups

## Result Contract

```yaml
status: ready_for_spec
change: fix-accessibility-followups
artifact_store: hybrid
execution_mode: auto
delivery_strategy: auto-forecast
branch_strategy: feature-branch-chain
review_budget_changed_lines: 800
technical_artifact_language: English
```

## Intent

Resolve three confirmed, narrowly scoped accessibility defects in the current
portfolio: English pages expose Spanish skip-link names, the open mobile dialog
contributes an `h2` before the page `h1`, and small `SkillBadge` text is measured
at 4.49:1 against its background. The change will preserve bilingual behavior,
keyboard operation, screen-reader semantics, and light/dark theme support while
adding focused regression coverage.

The blog loading/content observation remains a product/content-strategy matter
and is intentionally unchanged.

## Scope

### In Scope

- Localize the three `SkipLinks` labels through the existing `next-intl`
  message system in `messages/es.json` and `messages/en.json`; preserve anchor
  targets, focus visibility, keyboard activation, and the existing skip-link
  interaction contract.
- Keep the mobile dialog correctly named for assistive technology while
  removing its `h2` contribution from the global page heading outline. Preserve
  native dialog behavior, focus handling, close/ESC behavior, navigation, and
  the visible mobile layout.
- Replace the `SkillBadge` foreground/background pairing with a semantic
  Tailwind/theme pairing that meets WCAG AA for the small label in both light
  and dark themes. Preserve skill names, optional icon colors, hover behavior,
  and all existing homepage/About consumers.
- Add focused component/integration and Playwright coverage for both locales,
  semantic role/name and focus behavior, mobile heading order/dialog naming,
  Axe coverage where reliable, and deterministic badge contrast in both themes.
- Run `npm run type-check`, `npm run check`, `npm run test:run`, and focused
  Playwright tests; report unavailable browsers or Sanity-dependent routes as
  blocked rather than passed.

### Out of Scope

- Any footer redesign, alignment work, or footer content changes.
- Blog visibility, blog loading skeletons, Sanity data/configuration, post
  content, editorial strategy, or changing the number of blog skeleton cards.
- A broad accessibility refactor, unrelated color-token redesign, global
  typography changes, or changes to unrelated components and routes.
- Removing skill names, relying on icon color to satisfy contrast, or changing
  the `SkillBadge` API unless implementation evidence makes it unavoidable.
- New client boundaries, manual React memoization, new packages, route
  changes, or changes to unrelated navigation semantics.

## Approach

Implement one focused remediation change with three independently testable
requirements. In `components/a11y/SkipLinks.tsx:5-31`, keep the current static
link definitions and focus classes but source labels from locale messages
using the existing client translation boundary. Add parallel keys with
equivalent intent to both catalogs and test key parity plus rendered names.

In `components/layout/MobileMenu.tsx:46-80`, retain
`aria-labelledby="mobile-menu-title"` and the localized title, but represent
the label with a non-heading element or equivalent explicit dialog-label
strategy so opening the dialog does not prepend an `h2` to the page outline.
Validate the actual open-menu DOM at 320px, keyboard focus, close/ESC, and
navigation behavior rather than accepting a purely visual fix.

In `components/ui/SkillBadge.tsx:23-35`, select existing semantic Tailwind
classes or theme tokens whose computed text/background contrast is at least
4.5:1 in light and dark modes. Keep the component's optional icon color
separate from the label contrast contract. Use deterministic computed-color
contrast assertions for a representative rendered badge because the current
axe setup did not reproduce the measured 4.49:1 failure.

Extend the existing semantic browser suites instead of introducing a new test
framework: `e2e/tests/navigation.spec.ts:70-124` for Spanish/English skip
links, `e2e/tests/accessibility-interactions.spec.ts:186-211` for focused
mobile interactions, and `e2e/tests/accessibility.spec.ts:7-53` for localized
interior-page and opened-menu accessibility scans where stable. Add focused
unit/integration coverage under the existing `__tests__/` conventions for
message/component contracts. Use Playwright role/name and label assertions;
avoid CSS classes and incidental icon markup as semantic selectors.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `components/a11y/SkipLinks.tsx:5-31` | Modified | Read localized labels while preserving targets, focus styles, and keyboard behavior. |
| `messages/es.json:1-20`, `messages/en.json:1-20` | Modified | Add parallel skip-link message keys with Spanish and English UI copy. |
| `components/layout/MobileMenu.tsx:46-80` | Modified | Preserve dialog naming and controls without an out-of-order heading. |
| `components/ui/SkillBadge.tsx:23-35` | Modified | Apply contrast-safe label styling in both themes while preserving icons and consumers. |
| `app/[locale]/layout.tsx:74-80` | Inspected/verified | Confirm shared SkipLinks placement and page outline context; no structural change expected. |
| `app/[locale]/(pages)/sobre-mi/page.tsx:90-103`, `app/[locale]/page.tsx:177-183` | Inspected/verified | Confirm badge consumers remain visually and semantically intact. |
| `e2e/tests/navigation.spec.ts:70-124` | Modified | Add bilingual skip-link names and retain focus/click assertions. |
| `e2e/tests/accessibility-interactions.spec.ts:186-211` | Modified | Add mobile dialog heading/focus/close regression coverage. |
| `e2e/tests/accessibility.spec.ts:7-53` | Modified | Add focused locale/theme/menu scans and explicit contrast evidence where stable. |
| `__tests__/` existing component/message suites | Modified or added | Cover localized labels, dialog labelling, and the badge styling contract without incidental markup assertions. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Replacing the menu heading removes its accessible name or weakens screen-reader discoverability. | Medium | Retain `aria-labelledby`, test the dialog accessible name, keyboard focus, ESC/close, and opened-menu Axe results. |
| A badge color adjustment fails in one theme or affects optional icon colors. | Medium | Measure computed foreground/background contrast in light and dark modes and test label text separately from icons. |
| Translation keys diverge between catalogs or the client component receives an invalid namespace. | Low | Add parity/rendered-name assertions for ES and EN and keep all UI copy in message catalogs. |
| Existing browser or Sanity environment limitations obscure coverage. | Medium | Use the repository's explicit blocked status/reporting contract; never count unavailable environments as passes. |
| Unrelated footer/blog work enters the diff. | Low | Keep implementation paths and acceptance criteria limited to the three findings and explicitly preserve blog behavior. |

## Rollback Plan

Revert the feature-branch commits containing the SkipLinks translation wiring,
mobile dialog label/outline adjustment, badge classes, and focused tests. The
change introduces no data migration, route, package, CMS, or environment
configuration changes, so rollback requires only source, message, and test
reversion.

## Dependencies

- Existing `next-intl` locale/message setup, localized App Router layout, and
  current React 19 client-component boundaries.
- Existing Tailwind CSS 4 semantic theme classes and the shared `cn()` helper.
- Existing Vitest/Testing Library, Playwright, axe-core, cookie-consent
  fixture, and environment-status reporting utilities.
- No new external dependency or Sanity data is required. Blog routes may remain
  locally blocked when Sanity variables are absent and are not part of this
  change's acceptance.

## Success Criteria

- [ ] Spanish and English homepages expose three correctly localized skip-link
  names; each remains focusable, visible on focus, keyboard-operable, and
  targets the existing content/navigation/footer anchors.
- [ ] Opening the mobile dialog preserves its localized accessible name and
  native keyboard/ESC/close/navigation behavior without exposing a dialog
  heading before the page `h1`.
- [ ] `SkillBadge` label text meets at least 4.5:1 computed contrast in light
  and dark themes across homepage/About consumers, without changing skill
  names or optional icon semantics.
- [ ] Focused component/integration and Playwright tests cover bilingual
  labels, dialog naming/heading order, keyboard behavior, theme contrast, and
  regression-safe consumers using semantic selectors.
- [ ] `npm run type-check`, `npm run check`, and `npm run test:run` pass, with
  browser/Sanity limitations reported as explicit blocked results when
  applicable.
- [ ] No footer redesign, blog/content-strategy change, Sanity configuration
  change, or broad accessibility refactor is included.
