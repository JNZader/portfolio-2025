# Contributing

This is a personal portfolio project. Contributions (bug reports, small fixes,
suggestions) are welcome, but the roadmap is opinionated and driven by the
author.

## Getting started

```bash
npm ci
cp .env.example .env.local   # fill in the values you need
npm run dev
```

Requirements: Node 22+ and npm 11.

## Before you open a PR

Run the local checks — they mirror CI:

```bash
npm run type-check     # tsc --noEmit
npm run check          # biome lint + format
npm run test:run       # vitest
```

For a full local CI simulation (build + tests in a container), see
`ci-local/`.

## Conventions

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `chore:`, `test:`, `docs:`…). Commitlint + Husky enforce this
  on commit. Subjects are lowercase (no sentence-case).
- **Formatting/linting**: Biome (`npm run check:fix` to auto-fix). Do not add
  a separate ESLint/Prettier.
- **TypeScript**: strict mode, no new `any` (`noExplicitAny` is an error; use a
  justified `// biome-ignore` only when a third-party type forces it).
- **Tests**: add or update tests for the code you touch. Component/route tests
  live under `__tests__/`; e2e under `e2e/`.
- **i18n**: user-facing copy goes through `next-intl` message keys
  (`messages/{es,en}.json`), never hardcoded strings. ES is the default locale.

## Reporting security issues

See [SECURITY.md](SECURITY.md) — please report privately, not via public issues.
