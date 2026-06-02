# Sprint 2 Runtime Hotfix

## Problem

Docker build, Prisma migrations and seed can complete successfully, but `gpm_backend` may still restart.

Typical symptom:

```bash
docker compose ps
# gpm_backend Restarting (1)

curl http://localhost:8080/api/health
# Failed to connect to localhost port 8080
```

## Root cause

Sprint 2 controllers use `JwtAuthGuard`. The guard depends on `JwtService`.
The new Sprint 2 modules also need access to `JwtModule` so NestJS can resolve the `JwtService` dependency for guarded controllers.

## Fix

The following modules now import `JwtModule`:

- `ProjectPeriodsModule`
- `StudentEligibilitiesModule`
- `TopicsModule`

## Run commands

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build

docker compose ps
curl http://localhost:8080/api/health
```

If the backend still restarts, inspect logs:

```bash
docker logs gpm_backend --tail=200
```
