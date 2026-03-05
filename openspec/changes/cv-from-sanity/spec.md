# Spec: CV Data from Sanity CMS

## Requirements

### REQ-1: Sanity Resume Schema
The system must define a Sanity document type `resume` with fields matching the current `resume.json` structure:
- `personalInfo`: object with name, title, email_encoded, phone, location, website, linkedin, github
- `summary`: text field
- `experience[]`: array of objects (company, position, location, startDate, endDate, highlights[])
- `projects[]`: array of objects (name, description, highlights[])
- `education[]`: array of objects (institution, degree, location, startDate, endDate, details[])
- `skills[]`: array of objects (category, items[]) — flattened from Record<string, string[]>
- `softSkills[]`: array of strings
- `languages[]`: array of objects (name, level)

The schema must use Sanity's `defineType`/`defineField` API with proper validation rules.

### REQ-2: GROQ Query
The system must provide a GROQ query `resumeQuery` that fetches the complete resume document. The query must return data compatible with the existing `ResumeDataRaw` TypeScript interface (after transformation if needed).

### REQ-3: Data Fetching with Fallback
The system must provide an async `fetchResumeData()` function that:
1. Attempts to fetch resume data from Sanity using `sanityFetch()` with 60s ISR revalidation
2. If Sanity returns null/empty or throws, falls back to `lib/data/resume.json`
3. Returns a `ResumeDataRaw`-compatible object in all cases
4. Logs warnings when falling back (using existing `logger`)

### REQ-4: API Route Integration
The `GET /api/resume` endpoint must:
1. Call `fetchResumeData()` instead of importing static JSON
2. Continue to decode email from base64
3. Continue to apply rate limiting
4. Generate identical PDF output when data matches
5. All existing PDF render functions remain unchanged

### REQ-5: Type Safety
Shared TypeScript interfaces must be extracted to a common location so both the Sanity layer and API route use the same types. The interfaces already defined in `route.ts` (`ResumeDataRaw`, `ResumeData`) should be moved to `lib/types/resume.ts`.

## Scenarios

### SC-1: Happy Path — Sanity data available
**Given** the resume document exists in Sanity with valid data
**When** a user requests `GET /api/resume`
**Then** the system fetches from Sanity, generates PDF, returns 200 with PDF

### SC-2: Fallback — Sanity unreachable
**Given** the Sanity API is unreachable (network error, timeout)
**When** a user requests `GET /api/resume`
**Then** the system falls back to `resume.json`, generates PDF, returns 200
**And** a warning is logged

### SC-3: Fallback — Empty Sanity document
**Given** the resume document doesn't exist in Sanity (null response)
**When** a user requests `GET /api/resume`
**Then** the system falls back to `resume.json`, generates PDF, returns 200
**And** a warning is logged

### SC-4: Skills field transformation
**Given** Sanity stores skills as `[{category: "Lenguajes", items: ["Java", "Python"]}]`
**When** `fetchResumeData()` processes the response
**Then** it transforms skills to `Record<string, string[]>` format: `{"Lenguajes": ["Java", "Python"]}`
**And** the result matches the existing `ResumeDataRaw.skills` shape

### SC-5: Rate limiting still applies
**Given** a user has exceeded 10 requests/hour
**When** they request `GET /api/resume`
**Then** the system returns 429 before attempting Sanity fetch

### SC-6: Sanity Studio editing flow
**Given** an editor updates the resume in Sanity Studio
**When** a user requests `GET /api/resume` after 60s ISR window
**Then** the PDF reflects the updated data

## Acceptance Criteria

- [ ] Sanity schema `resume` is registered and visible in Sanity Studio
- [ ] GROQ query returns complete resume data
- [ ] `fetchResumeData()` handles Sanity success, null, and error cases
- [ ] PDF output is identical when Sanity data matches JSON data
- [ ] Rate limiting runs before Sanity fetch (no wasted API calls)
- [ ] All existing tests pass
- [ ] New tests cover fetch success, null fallback, and error fallback
- [ ] TypeScript compiles with no errors
- [ ] Biome linting passes

## Edge Cases

- **Missing optional fields**: `projects`, `softSkills`, `details` may be empty/undefined — handle gracefully (already handled in current PDF renderer with `?.` and `length > 0` checks)
- **Sanity returns partial data**: If some fields are missing, fallback to JSON entirely (don't merge partial)
- **Base64 email decoding**: `email_encoded` must be stored as-is in Sanity; decoding happens in the API route
