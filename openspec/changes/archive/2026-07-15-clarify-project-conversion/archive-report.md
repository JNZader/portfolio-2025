# Archive Report: `clarify-project-conversion`

**Status:** `archived — pass with warnings`  
**Archived:** 2026-07-15  
**Backends:** OpenSpec + Engram

## Executive summary

The change is conditionally archive-ready and has been archived. All 11 numbered tasks are complete; 220 tests passed, type-check passed, and `npm run check` exited 0 with seven pre-existing warnings. No implementation CRITICAL findings remain. This archive does not claim full production, Sanity, or cross-browser verification.

## Scope and rollback boundary

The synced specification covers the localized APiGen case-study CTA, optional GitHub action, decorative terminal accessibility boundary, CV view navigation, preserved ProjectCard behavior, bilingual copy, responsive/focus contracts, and typed environment-block reporting.

Rollback is implementation-only: revert the APiGen UI/localization/test changes and the PR 2 E2E/reporting files listed in `apply-progress`; no route, Sanity schema/data, migration, or persisted application data requires repair. Do not include `.gitignore` or `docs/AUDIT_VISUAL_EXHAUSTIVA_2026-07.md`; both remain unrelated working-tree changes.

## Verification

| Check | Result |
|---|---|
| Numbered tasks | 11/11 complete |
| `npm run test:run` | 220 passed, 0 failed |
| `npm run type-check` | Passed, exit 0 |
| `npm run check` | Exit 0; 7 pre-existing warnings |
| Coverage run | 220 passed; lines 39.35%, above 35% threshold |
| Changed-contract Chromium E2E | Passed; overall run retains 3 unrelated failures and 1 product skip |

## Explicit limitations (warnings, not passes)

Five environment blocks are preserved: missing Sanity variables/data, missing production-build prerequisite (`NEXT_PUBLIC_SANITY_DATASET`), unavailable Firefox, unavailable WebKit, and unavailable mobile Safari (WebKit executable). The production build is **blocked**, not passed. Three unrelated Chromium baseline failures remain recorded failures: language-switcher target, skip-link geometry, and desktop Blog navigation. `npm run check` warnings are pre-existing and outside this change.

## Follow-up suggestions

1. Re-run Sanity-dependent geometry and `npm run build` with valid environment/data, then probe Firefox/WebKit/mobile Safari binaries.
2. If exact traceability is required, add a focused English CV route assertion and APiGen-specific ProjectCard fixture in a follow-up change.

## Engram lineage

- Proposal: observation `#8831`
- Spec: observation `#8832`
- Design: observation `#8834`
- Tasks: observation `#8843`
- Apply progress: observation `#8848`
- Verify report: observation `#8852`
