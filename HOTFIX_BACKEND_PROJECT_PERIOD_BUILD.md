# Hotfix — Backend project period status build

## Root cause

TypeScript inferred the inline array passed to `Array.includes()` as the narrow union `DRAFT | CLOSED`. The value `current.status` is typed as the complete `ProjectPeriodStatus` enum, so NestJS compilation rejected it because the enum also contains values such as `OPEN` and `ARCHIVED`.

## Changes

- Declared `reopenableStatuses` explicitly as `ProjectPeriodStatus[]` before calling `includes()`.
- Preserved the existing workflow: only `DRAFT` and `CLOSED` project periods can be opened.
- Synchronized `backend/package-lock.json` with `backend/package.json` so Prisma CLI and Client consistently use version `6.0.1`.

## Validation

- Isolated strict TypeScript status check: passed.
- Backend policy tests: 7/7 passed.
- `npm ci --dry-run`: passed after lockfile synchronization.
- Full Prisma generation could not be rerun in the sandbox because DNS access to `binaries.prisma.sh` is unavailable. The provided Docker build environment previously completed `prisma generate`, so rebuilding there will compile the patched source.

## Suggested commit

```text
fix(build): resolve project period status type error and sync Prisma lockfile
```
