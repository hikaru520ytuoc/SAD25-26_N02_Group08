# Sprint 2 Hotfix: TopicStatus TypeScript Build Error

## Problem

Docker build failed at backend `npm run build` with TypeScript error TS2345 in:

`backend/src/modules/topics/topics.service.ts`

The failing pattern was:

```ts
[TopicStatus.DRAFT, TopicStatus.SUBMITTED, TopicStatus.REJECTED].includes(topic.status)
```

TypeScript inferred the array as a narrow union such as `"DRAFT" | "SUBMITTED" | "REJECTED"`, while `topic.status` has the full Prisma enum type `TopicStatus`. Because `TopicStatus` also contains values such as `CLOSED`, TypeScript rejected the call.

## Fix

Explicitly type each status list as `TopicStatus[]` before calling `includes()`:

```ts
const editableStatuses: TopicStatus[] = [
  TopicStatus.DRAFT,
  TopicStatus.SUBMITTED,
  TopicStatus.REJECTED,
];

if (!editableStatuses.includes(topic.status)) {
  // throw workflow error
}
```

The same fix was applied to:

- editable topic statuses
- submittable topic statuses
- rejectable topic statuses

## Run commands after applying fix

```bash
docker compose down -v

docker compose build --no-cache backend frontend

docker compose up -d postgres redis minio

docker compose run --rm backend npx prisma migrate deploy

docker compose run --rm backend npm run prisma:seed

docker compose up -d --build

curl http://localhost:8080/api/health
```

## Expected result

The backend image should build successfully and `gpm_backend` should be `Up`, not missing from `docker compose ps`.
