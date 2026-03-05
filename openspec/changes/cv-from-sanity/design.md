# Design: CV Data from Sanity CMS

## Architecture Decision

### AD-1: Singleton Document Pattern
**Decision**: Use Sanity's singleton document pattern for the resume (only one CV).
**Rationale**: There's exactly one resume. A singleton prevents accidental creation of multiple documents and simplifies the GROQ query (no need for ordering/filtering).
**Implementation**: Filter by `_type == "resume"` and take `[0]`. In Sanity Studio, use `S.documentTypeListItems()` filtering to present it as a single editable document.

### AD-2: Skills Schema — Array of Objects vs Map
**Decision**: Store skills as `skills[]: { category: string, items: string[] }` in Sanity, transform to `Record<string, string[]>` at fetch time.
**Rationale**: Sanity doesn't natively support `Record<K,V>` / Map types. An array of objects with `category` and `items` fields is the idiomatic way to model this. The transformation is trivial and keeps the PDF renderer untouched.

### AD-3: Fallback Strategy — Full JSON, Not Partial Merge
**Decision**: If Sanity returns null, empty, or throws, use the full `resume.json` file. Never merge Sanity partial data with JSON.
**Rationale**: Partial merges create unpredictable state. If the resume is in Sanity, it should be complete. If not, fall back entirely to the known-good JSON.

### AD-4: Types Extraction
**Decision**: Extract `ResumeDataRaw` and `ResumeData` from `route.ts` to `lib/types/resume.ts`.
**Rationale**: The Sanity fetch layer needs these same types. Keeping them in the API route creates a circular dependency. A shared types file is the standard pattern.

### AD-5: Sanity Fetch Location
**Decision**: Create `fetchResumeData()` alongside existing queries in `sanity/lib/queries.ts` rather than a separate file.
**Rationale**: All GROQ queries and Sanity data-access functions are already in `queries.ts`. Adding a function there follows the existing project convention. A separate `lib/sanity/resume.ts` would fragment the data access layer unnecessarily.

## Data Flow

```
GET /api/resume
    │
    ├─ Rate limit check (Upstash Redis)
    │   └─ 429 if exceeded
    │
    ├─ fetchResumeData()
    │   ├─ sanityFetch({ query: resumeQuery })
    │   │   ├─ Success + non-null → transform skills → return ResumeDataRaw
    │   │   └─ Null or error → log warning → return resume.json
    │   │
    │   └─ Returns: ResumeDataRaw
    │
    ├─ Decode email from base64
    │
    ├─ jsPDF render (unchanged)
    │
    └─ Return PDF response
```

## File Changes

### New Files

**`sanity/schemas/resume.ts`**
```
defineType('resume') with fields:
  - personalInfo (object): name, title, email_encoded, phone, location, website, linkedin, github
  - summary (text)
  - experience (array of object): company, position, location, startDate, endDate, highlights[]
  - projects (array of object): name, description, highlights[]
  - education (array of object): institution, degree, location, startDate, endDate, details[]
  - skills (array of object): category, items[]
  - softSkills (array of string)
  - languages (array of object): name, level
```

**`lib/types/resume.ts`**
```
export interface ResumeDataRaw { ... }  // extracted from route.ts
export interface ResumeData { ... }      // extracted from route.ts
export interface SanityResumeData { ... } // Sanity response shape (skills as array)
```

### Modified Files

**`sanity/schemas/index.ts`** — add `resume` import to `schemaTypes`

**`sanity/lib/queries.ts`** — add:
  - `resumeQuery` GROQ constant
  - `fetchResumeData()` async function

**`app/api/resume/route.ts`** — change:
  - Remove static `import resumeDataRaw from '@/lib/data/resume.json'`
  - Remove `ResumeDataRaw` and `ResumeData` interfaces (moved to types file)
  - Import types from `@/lib/types/resume`
  - Import `fetchResumeData` from `@/sanity/lib/queries`
  - Make the data fetch async at the top of the GET handler

### Unchanged
- `lib/data/resume.json` — kept as fallback
- All `render*()` PDF functions — zero changes
- Rate limiting logic — unchanged
- jsPDF lazy import — unchanged

## Testing Strategy

**Unit: `__tests__/unit/resume-fetch.test.ts`**
- Mock `sanityFetch` to return valid data → verify transform + return
- Mock `sanityFetch` to return null → verify fallback to JSON
- Mock `sanityFetch` to throw → verify fallback to JSON + warning logged
- Verify skills transformation from array → Record

**No changes to existing tests** — PDF rendering tests (if any) use the same types.
