# Proposal: Migrate CV/Resume Data from Static JSON to Sanity CMS

## Intent

The CV/resume data is currently hardcoded in `lib/data/resume.json`, which means every content update (new project, certification, job) requires a code change, a PR, a deploy. Moving this data to Sanity CMS allows updating the CV from the Sanity Studio dashboard — the same way blog posts and projects are already managed — without touching the codebase. This also enables non-technical editors (or yourself from a phone) to update the CV instantly.

## Scope

### In Scope
- Sanity schema for resume data (single document type `resume`)
- GROQ query to fetch resume data with TypeScript types
- Modify `app/api/resume/route.ts` to fetch from Sanity instead of JSON import
- Graceful fallback to static JSON if Sanity is unreachable (resilience)
- ISR caching (60s revalidation, matching existing `sanityFetch` pattern)
- Seed script or documentation for initial data population in Sanity Studio

### Out of Scope
- Replacing jsPDF with a different PDF library (separate concern, own change)
- Removing the `dompurify` vulnerability chain (dependent on jsPDF decision)
- Multi-language CV support (future enhancement)
- PDF template redesign / layout changes (keep identical output)
- Sanity Studio custom input components or preview panes for the resume

## Approach

1. **Schema Design**: Create a single `resume` Sanity document type with structure mirroring the current JSON (personalInfo, summary, experience[], projects[], education[], skills, softSkills[], languages[]). Use Sanity's singleton document pattern since there's only one CV.

2. **GROQ Query**: Write a query that fetches the full resume document, keeping the same shape as the current `ResumeDataRaw` TypeScript interface so the PDF renderer functions require zero changes.

3. **Data Layer**: Create a `fetchResumeData()` function in `sanity/lib/queries.ts` that:
   - Fetches from Sanity with 60s ISR revalidation
   - Falls back to static JSON on failure (network, Sanity outage)
   - Returns the same `ResumeDataRaw` shape

4. **API Route Update**: Replace the static `import resumeDataRaw` with the new async `fetchResumeData()`. All PDF rendering functions stay untouched.

5. **Testing**: Add unit tests for the fetch function, covering Sanity success and fallback scenarios.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `sanity/schemas/resume.ts` | **New** | Sanity document type definition for CV data |
| `sanity/schemas/index.ts` | Modified | Register the new `resume` schema |
| `sanity/lib/queries.ts` | Modified | Add `resumeQuery` GROQ query |
| `lib/types/resume.ts` | **New** | Shared TypeScript interfaces for resume data |
| `lib/sanity/resume.ts` | **New** | `fetchResumeData()` with Sanity + fallback |
| `app/api/resume/route.ts` | Modified | Switch from static import to async fetch |
| `lib/data/resume.json` | Kept | Stays as fallback data source |
| `__tests__/unit/resume-fetch.test.ts` | **New** | Tests for fetch + fallback logic |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Sanity API outage → no CV download | Low | JSON fallback ensures PDF always generates |
| Schema mismatch between Sanity and TypeScript types | Medium | Use same interface for both, test with Zod or type assertions |
| Base64 email encoding needs special handling in Sanity | Low | Store as plain `email_encoded` string field in Sanity, decode in API route as today |
| Sanity cold start adds latency to first PDF request | Low | ISR revalidation caches the response; 60s window is acceptable |
| Empty Sanity document (not yet populated) | Medium | Fallback to JSON detects empty/null response |

## Rollback Plan

1. Revert the single commit that changes `app/api/resume/route.ts` back to the static import
2. The schema files and queries can stay (they're additive, no breaking changes)
3. `resume.json` is never deleted, so rollback is instant with a one-line change

## Dependencies

- Sanity project must be accessible (env vars `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` already configured)
- After deploy, the resume document must be created in Sanity Studio and populated with the same data currently in `resume.json`

## Success Criteria

- [ ] PDF output from `/api/resume` is byte-identical when Sanity data matches JSON data
- [ ] Updating resume data in Sanity Studio reflects in next PDF download (after ISR window)
- [ ] If Sanity is unreachable, PDF still generates from fallback JSON
- [ ] All existing tests pass, new tests cover Sanity fetch + fallback
- [ ] No changes to PDF rendering logic (render functions untouched)
- [ ] Pre-commit and pre-push hooks pass (biome, tsc, vitest)
