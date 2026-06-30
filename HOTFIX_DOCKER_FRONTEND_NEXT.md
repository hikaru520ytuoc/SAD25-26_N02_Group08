# Hotfix: frontend Docker build cannot find Next.js

## Problem

Docker build failed at frontend step:

```text
RUN npm run build
sh: next: not found
```

or:

```text
Error: Cannot find module '/app/node_modules/next/dist/bin/next'
```

## Root cause

The frontend Docker build was relying on `package-lock.json` / `npm ci` behavior. In some environments, the lock file or npm cache can be stale/registry-specific, so the Next.js package is not actually present in `node_modules` even though the build reaches `npm run build`.

## Fix

`frontend/Dockerfile` now copies only `package.json`, installs dependencies from npm registry, verifies that Next.js exists, and runs the local Next.js binary directly:

```dockerfile
COPY package.json ./
RUN npm install --include=dev --no-audit --no-fund --registry=https://registry.npmjs.org/   && if [ ! -f ./node_modules/next/dist/bin/next ]; then        npm install --include=dev --no-audit --no-fund --registry=https://registry.npmjs.org/ next@15.1.2 react@19.0.0 react-dom@19.0.0;      fi   && node -e "console.log('Next.js installed at:', require.resolve('next/package.json'))"
RUN ./node_modules/.bin/next build
```

## Recommended rebuild commands

```bash
docker compose down

docker builder prune -f

docker compose build --no-cache frontend

docker compose build --no-cache backend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build
```

If Docker still reuses a stale frontend layer, also run:

```bash
docker compose build --no-cache --pull frontend
```
