# Hotfix: frontend Docker build cannot find Next.js binary

## Problem

Docker build failed at the frontend build step:

```text
RUN npm run build
sh: next: not found
```

This means the build container could not resolve the `next` CLI from `node_modules/.bin` when running the npm script.

## Fix

- Changed `frontend/Dockerfile` from `npm install` to `npm ci --include=dev` so Docker installs dependencies deterministically from `package-lock.json`.
- Changed frontend npm scripts to call the Next.js CLI directly through `node ./node_modules/next/dist/bin/next` instead of relying on the shell to find the `next` binary.
- No business logic, route, RBAC rule, workflow rule, or database schema was changed.

## Rebuild commands

```bash
docker compose down
docker compose build --no-cache frontend
docker compose build --no-cache backend
docker compose up -d postgres redis minio
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npm run prisma:seed
docker compose up -d --build
```

## Check

```bash
docker compose ps
curl http://localhost:8080/api/health
```
