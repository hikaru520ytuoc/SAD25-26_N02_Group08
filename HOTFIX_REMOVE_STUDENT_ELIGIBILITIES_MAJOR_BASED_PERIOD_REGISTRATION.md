# Hotfix: remove student_eligibilities and use major-based live eligibility

## Decision

The `student_eligibilities` table and its NestJS/frontend module are removed. Eligibility is no longer a stored per-period decision and no user can manually set an `ELIGIBLE` status.

Eligibility is calculated live from the current student academic profile:

- accumulated credits >= `ceil(major.totalCredits * 0.8)`
- GPA/CPA >= 2.5
- internship is `COMPLETED` or `WAIVED`
- academic status is `ACTIVE`
- no prerequisite-course debt
- no tuition debt
- no disciplinary action
- user account is `ACTIVE`

Current fixed majors are inserted directly by the database migration and also upserted by the seed:

| Code | Name | Total credits | 80% threshold |
| --- | --- | ---: | ---: |
| KTPM | Kỹ thuật phần mềm | 134 | 108 |
| CNTT | Công nghệ thông tin | 136 | 109 |

There is no major-management module, CRUD API, or administration page. `GET /api/lookups/majors` is read-only and exists only so the user form can select one of the database rows instead of sending a handwritten ID.

## New period-selection workflow

1. ADMIN creates/edits a student account and enters the current academic profile. No project period is selected.
2. The backend calculates eligibility live.
3. An eligible STUDENT sees OPEN project periods inside their registration window.
4. The STUDENT chooses a period themselves.
5. The backend rechecks eligibility and creates `project_period_registrations`.
6. Topic registration derives `projectPeriodId` from the active period registration. The student no longer submits or types it.

## Database migration

Migration:

`backend/prisma/migrations/20260702160000_remove_student_eligibilities_add_majors_period_registration/migration.sql`

It:

- creates `majors` and directly inserts KTPM/CNTT;
- migrates recognized legacy KTPM/CNTT text values and accumulated-credit data into the new student fields;
- stops instead of silently assigning an unknown legacy major to the wrong programme;
- copies the latest academic values from `student_eligibilities` into `students` before the table is removed;
- creates `project_period_registrations`;
- backfills a period registration only when a student already has a topic registration in that period;
- drops `student_eligibilities` and `EligibilityStatus`.

`requiredCredits` is intentionally not migrated. It is now always calculated from the major total credits.

## Important backup warning

This migration permanently drops `student_eligibilities`. Back up PostgreSQL before deploying it to an environment that contains important data.

Example:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U postgres graduation_project_db > backups/before-major-eligibility-refactor.sql
```

## Main API changes

Removed:

- all `/api/student-eligibilities` endpoints;
- `StudentEligibilitiesModule`;
- public DTO fields for manual eligibility and manual project-period assignment during account creation.

Added:

- `GET /api/students/academic-eligibility` — ADMIN/FACULTY_MANAGER live overview;
- `GET /api/students/me/academic-eligibility` — current STUDENT result;
- `GET /api/project-period-registrations/available`;
- `GET /api/project-period-registrations/me`;
- `POST /api/project-period-registrations`;
- `PATCH /api/project-period-registrations/:id/cancel`;
- `GET /api/lookups/majors` — read-only lookup only.

## Validation status in the provided environment

- Frontend `npx tsc --noEmit`: passed.
- Frontend Next.js production build: compilation and TypeScript/lint validation passed; sandbox stopped during static-page generation with an environment `EPIPE`.
- Backend TypeScript syntax transpilation: passed for all source files.
- Prisma CLI validation/generation could not finish because the sandbox could not resolve `binaries.prisma.sh`. The schema was previously parsed successfully through Prisma DMMF after the refactor.
- Docker runtime was not available in the sandbox.
