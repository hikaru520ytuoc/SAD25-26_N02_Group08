# Hotfix: Backend Prisma CLI install in Docker

## Problem

Backend Docker build failed at:

```bash
RUN ./node_modules/.bin/prisma generate
/bin/sh: ./node_modules/.bin/prisma: not found
```

This means the builder image installed backend packages, but the Prisma CLI binary was still missing from `node_modules/.bin`.

## Fix

- Pin Prisma to the stable Prisma 6 line used by the current schema.
- Install backend dependencies from `package.json` only in Docker builder stage to avoid stale lockfile behavior.
- Explicitly install `prisma@6.0.1` and `@prisma/client@6.0.1` before running `prisma generate`.
- Add `test -x ./node_modules/.bin/prisma` so the build fails early with the real install issue if Prisma CLI is missing.
- Keep the existing Prisma schema and migrations unchanged.

## Files changed

- `backend/Dockerfile`
- `backend/package.json`

## Commit

```bash
git add backend/Dockerfile backend/package.json HOTFIX_BACKEND_PRISMA_CLI_INSTALL.md

git commit -m "fix(docker): install Prisma CLI explicitly in backend build" \
  -m "- Fix backend Docker build failure where node_modules/.bin/prisma was missing
- Pin Prisma CLI and Prisma Client to 6.0.1 for the current schema format
- Install backend dependencies from package.json in Docker builder stage
- Explicitly install prisma and @prisma/client before prisma generate
- Keep existing schema, migrations, RBAC and business workflow unchanged"
```
