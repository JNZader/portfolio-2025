# CI/CD quick reference

## Before review

```bash
npm run verify        # Biome + TypeScript
npm run test:coverage # unit tests and honest first-party coverage baseline
npm run build         # production compilation
npm run e2e           # Playwright; starts local dev server outside CI
npm run lighthouse    # requires a completed production build
```

## Workflow map

- `ci.yml`: quality and build on every PR to `main` or `develop`.
- `test.yml`: unit coverage on every PR to `main` or `develop`.
- `e2e.yml`: Playwright on every PR to `main`.
- `lighthouse.yml`: canonical `lighthouserc.js` audit on every PR to `main`.
- `security.yml`: PR dependency/CodeQL/audit checks plus weekly schedule.
- `release.yml`: quality-gated release on pushes to `main`.

Artifacts: coverage is retained 7 days; Playwright and Lighthouse results are retained 30 days. CI dummy variables are not production secrets and must never be copied into a deployment.
