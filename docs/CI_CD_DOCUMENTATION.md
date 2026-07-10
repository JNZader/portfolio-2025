# CI/CD pipeline

Every pull request runs the quality workflows relevant to its target branch. Workflows intentionally have no path filters, so changes to tests, messages, configuration, workflows, or documentation cannot bypass a relevant gate. CI and Tests cover `main` and `develop`; E2E and Lighthouse cover `main`; Security runs on `main` plus its weekly schedule.

Pull requests targeting `develop` therefore do not run E2E, Lighthouse, or pull-request Security jobs.

## Pull-request gates

| Workflow | Required work | Artifacts |
| --- | --- | --- |
| CI | Biome, TypeScript, production build | — |
| Tests | Vitest with explicit first-party coverage surface | `coverage-report` (7 days), Codecov |
| E2E | Production build and Playwright browser matrix | `playwright-report`, `test-results` (30 days) |
| Lighthouse | `lighthouserc.js` via the checked-in `@lhci/cli` | `lighthouse-results` (30 days) |
| Security | Dependency review, CodeQL, npm audit | GitHub security results |

CI uses dummy service credentials only to build and exercise non-networked paths. Redis is required in production because it stores the single-use GDPR export/deletion confirmation tokens as well as rate-limit state.

## Release

A push to `main` first runs the release quality gate (`verify`, unit tests, and production build). Only then may `commit-and-tag-version` update the version/changelog, push the tag, and publish a GitHub Release. Release commits do not recursively release.

## Local verification

```bash
npm ci
npx prisma generate
npm run verify
npm run test:coverage
npm run build
npm run e2e
npm run lighthouse
```

`lighthouserc.js` is the only Lighthouse configuration. Playwright and Lighthouse reports are uploaded even when their workflow fails.

## Coverage contract

Vitest includes first-party `app/actions`, `app/api`, `components`, `hooks`, and `lib` files (excluding generated/data/template-only code). The current rounded floors are 35% lines, 35% statements, 30% functions, and 25% branches; they reflect the measured baseline while preventing regressions from hiding behind import-only coverage. Raise these floors as the uncovered surface gains tests.
