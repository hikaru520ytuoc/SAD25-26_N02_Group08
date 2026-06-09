# Sprint 4 Hotfix - Prisma Topic Relation Validation

## Problem

Backend build stopped at `npx prisma generate` with Prisma P1012:

- `Topic.outlines` is missing an opposite relation field on `Outline`.
- `Topic.projectProgresses` is missing an opposite relation field on `ProjectProgress`.

## Root cause

`Outline` and `ProjectProgress` in Sprint 4 are linked through `TopicRegistration` and `SupervisorAssignment`; they do not store a direct `topicId`. Therefore, declaring direct relation arrays on `Topic` is invalid unless the opposite side is also modeled.

## Fix

Removed these invalid direct relation fields from `Topic`:

```prisma
outlines          Outline[]
projectProgresses ProjectProgress[]
```

The Sprint 4 database design remains unchanged:

- `Outline` links to `TopicRegistration` and `SupervisorAssignment`.
- `ProjectProgress` links to `SupervisorAssignment`.
- Topic information can still be reached through the registration/assignment workflow.

## Verify

Run:

```bash
docker compose down -v
docker compose build --no-cache backend frontend
docker compose up -d postgres redis minio
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend npm run prisma:seed
docker compose up -d --build
```
