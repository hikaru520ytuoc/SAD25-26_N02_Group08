# Hotfix: Backend Prisma Docker Build

## Problem

Backend Docker build failed at:

```bash
RUN npx prisma generate
```

The build log showed that `npx` could not find a local Prisma CLI and downloaded Prisma 7.x. Prisma 7 rejects the existing Prisma 6 datasource format:

```text
The datasource property `url` is no longer supported in schema files
Prisma CLI Version : 7.8.0
```

## Fix

- Pin `prisma` and `@prisma/client` to Prisma 6.19.3.
- Install backend dev dependencies during Docker builder stage.
- Replace bare `npx prisma generate` with the local binary:

```bash
./node_modules/.bin/prisma generate
```

This prevents Docker from downloading Prisma 7 during build and keeps the project on Prisma 6, which matches the current schema and migrations.

## Scope

This hotfix only changes Docker dependency installation and Prisma CLI resolution. It does not change database schema, migrations, RBAC, API routes, or business workflow.
