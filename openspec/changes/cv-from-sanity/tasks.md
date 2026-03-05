# Tasks: CV Data from Sanity CMS

## Phase 1: Foundation (Types + Schema)

- [ ] **T1**: Extract `ResumeDataRaw` and `ResumeData` interfaces from `app/api/resume/route.ts` to `lib/types/resume.ts`. Add `SanityResumeData` interface (with skills as array). Update imports in route.ts.
- [ ] **T2**: Create `sanity/schemas/resume.ts` — define `resume` document type with all fields matching the JSON structure. Use `defineType`/`defineField` with appropriate validations.
- [ ] **T3**: Register resume schema in `sanity/schemas/index.ts`.

## Phase 2: Data Layer (Query + Fetch)

- [ ] **T4**: Add `resumeQuery` GROQ constant in `sanity/lib/queries.ts` — fetch the singleton resume document with all fields.
- [ ] **T5**: Add `fetchResumeData()` function in `sanity/lib/queries.ts` — Sanity fetch + skills transform + JSON fallback + error logging.

## Phase 3: Integration (API Route)

- [ ] **T6**: Update `app/api/resume/route.ts` — replace static import with `fetchResumeData()`, make GET handler async-aware for the new data source. Import types from `@/lib/types/resume`.

## Phase 4: Testing

- [ ] **T7**: Create `__tests__/unit/resume-fetch.test.ts` — test Sanity success, null fallback, error fallback, and skills transformation.

## Phase 5: Validation

- [ ] **T8**: Run full test suite (`vitest`), TypeScript check (`tsc`), and linter (`biome check`). Verify pre-push hook passes.
- [ ] **T9**: Commit, push, and verify CI passes.

## Dependencies

```
T1 ──→ T2 (types needed for schema design validation)
T1 ──→ T6 (route uses new import paths)
T2 ──→ T3 (schema must exist before registering)
T1 + T3 ──→ T4 (types + schema needed for query)
T4 ──→ T5 (query needed for fetch function)
T5 ──→ T6 (fetch function needed for route)
T5 ──→ T7 (fetch function needed for tests)
T6 + T7 ──→ T8 (all code needed for validation)
T8 ──→ T9 (must pass before commit)
```

## Estimated Effort

| Task | Effort | Complexity |
|------|--------|------------|
| T1 | 5 min | Low — move interfaces, update imports |
| T2 | 15 min | Medium — Sanity schema with nested objects/arrays |
| T3 | 1 min | Low — one import + array entry |
| T4 | 5 min | Low — GROQ query |
| T5 | 10 min | Medium — transform + fallback + error handling |
| T6 | 5 min | Low — replace import, add await |
| T7 | 15 min | Medium — mocking sanityFetch, testing fallback |
| T8 | 5 min | Low — run commands |
| T9 | 2 min | Low — git commands |
| **Total** | **~60 min** | |
