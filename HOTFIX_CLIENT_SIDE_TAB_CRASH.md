# Hotfix — Client-side tab crash

## Symptom

Opening some workflow tabs, including `/faculty/supervisor-assignments`, could terminate the current route with Next.js' generic `Application error: a client-side exception has occurred` screen.

## Root causes addressed

1. The supervisor-assignment UI assumed every API item always contained complete nested relations (`projectPeriod`, `student.user`, `student.major`, `supervisor.user`). A partial or stale response therefore caused an uncaught render exception.
2. The backend supervisor-assignment include did not return the student's `major` relation although the detail drawer rendered it.
3. The assignment service trusted the response to always be a plain array and did not tolerate wrapped or malformed payloads.
4. There was no application route error boundary, so one render exception replaced the whole page with Next.js' generic production error screen.
5. The frontend package lock was not synchronized with `package.json`, which made clean `npm ci` installations fail.

## Changes

- Added `student.major`, `student.faculty`, and `supervisor.faculty` to the supervisor-assignment backend response.
- Normalized supervisor-assignment API payloads and returned an empty array for unsupported shapes.
- Filtered incomplete assignment records before calculating summary cards and period filters.
- Added null-safe rendering for assignment cards and detail drawers.
- Added safe date formatting for missing or invalid timestamps.
- Added `frontend/src/app/error.tsx` with a recoverable retry action instead of a blank generic error screen.
- Synchronized `frontend/package-lock.json` with the declared Next.js, React, and React DOM versions.
- Added guardrail tests for assignment payload handling and the route error boundary.

## Verification

- Frontend TypeScript: passed.
- Frontend tests: 11/11 passed.
- Backend policy tests: 7/7 passed.
- Frontend dependency lock validation using `npm ci --dry-run`: passed.
- Frontend production build compiled and completed lint/type validation; the sandbox timed out later at `Collecting page data`.
- Backend Docker build must be rerun in an environment that can download the Prisma engine.
