# ci-local

Run this repo's CI gates inside a clean Docker container **before pushing**, so
you catch failures locally instead of burning GitHub Actions minutes.

It mirrors `.github/workflows`: `npm ci` → `prisma generate` → `biome check` →
`tsc --noEmit` → `vitest run` → `next build`.

## Setup (once)

```bash
cp ci-local/ci.env.example ci-local/ci.env
```

`ci.env` holds dummy build-time vars (same ones CI uses — no real secrets) so
`next build` doesn't fail on missing `NEXT_PUBLIC_*` / `DATABASE_URL`. It's
git-ignored.

## Usage

```bash
./ci-local/ci-local.sh          # full: lint + type-check + tests + build
./ci-local/ci-local.sh quick    # lint + type-check only (fast pre-commit)
./ci-local/ci-local.sh detect   # print the detected stack + commands
./ci-local/ci-local.sh shell    # interactive shell in the CI image
```

Per-step timeout: `CI_LOCAL_TIMEOUT=1200 ./ci-local/ci-local.sh` (default 900s).

If [`ghagga`](https://github.com/JNZader/ghagga) is on your PATH, `full` also
runs `ghagga review --plain --exit-on-issues` as a final gate.

## Notes

- The Docker image is cached and only rebuilt when the generated Dockerfile
  changes (tracked by a content hash label).
- The stack is auto-detected, so the same script works across the ecosystem
  (Java/Gradle, Maven, Node, Python, Go, Rust) — only the Node path is tuned to
  this repo's exact gates.
- Generated files (`ci-local/docker/`, `ci-local/ci.env`) are git-ignored.
