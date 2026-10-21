# Secure CSV grade import — deployment and limitations

## Implemented

- **Safe C parser** `backend/softsec-native/grade_parser.c`: reads CSV bytes from `stdin`, returns JSON to `stdout`; no DB writes. Binary has memory length guards; 100-record cap, 512-byte line buffer, UTF-8 validation for names, ASCII ID checks, duplicate-ID rejection, score constraints (`finite,0..10`), strict six-column header. Lab vulnerability code is isolated under `softsec/src/thesis_grade_parser_v0.c` and is **never linked into backend**.
- **NestJS** `/api/softsec-import/preview`: secured by JWT and RBAC; calls C parser using `spawn` with no shell, max input 51,712 bytes, timeout and output cap; maps CSV `student_id` to `Student.studentCode`, and user-supplied `project_id` alias to existing `Topic.id` UUID. Returns row-by-row status, checksum and short-lived signed confirmation token. Preview does not write DB.
- **NestJS** `/api/softsec-import/confirm`: supervisor or reviewer with actual matching lecturer ID can write only their own column. Revalidates C input and token, checks matching registration, existing grade, publication, lock, and role. Performs all inserts and audit entries in a **serializable Prisma transaction**; an error rolls back the batch.
- **Next.js** `/softsec-import`: CSV chooser, score-type picker, manual project aliases, view results, confirm where permitted. Existing website remains untouched outside app.module & Dockerfile.
- **Lab** `softsec/`: original coursework target v0/v1, Kripke, static scanner, ASan/UBSan, Z3, fuzzing, gcov, regression tests and original Excel spec. Old rendered screenshots and stale historical logs were removed from this integration overlay; regenerate real evidence before submitting the report.

## Important business decision: why projectMappings is mandatory

`Topic` uses UUID `id` and has **no short projectCode column**. Your CSV has `project_id` length 1–15, usually `DA001`. An arbitrary 15-byte abbreviation cannot reliably identify the UUID. Enter aliases explicitly, for example:

```json
{"DA001":"00000000-0000-4000-8000-000000000001"}
```

Use the *actual* UUID in your database, not this illustrative one. Missing mappings show `NEEDS_TOPIC_MAPPING`; failed matches remain read-only.

## No council-score bulk write

`CouncilScore` is **per council member**. `council_score` in the six-column lab CSV lacks `councilMemberId` and cannot replace per-member scores or council average. Therefore COUNCIL mode is **preview only**. The existing manual council score workflow remains the source of truth. Supervisor/reviewer imports cannot be performed by an admin or a different lecturer merely because they can view the preview.

## Install into existing repository

1. Check `git status` clean. Switch to an isolated branch: `git switch -c feat/softsec-grade-import` (unless already there).
2. Extract ZIP OUTSIDE repository, e.g. `~/Downloads/SoftSec_Patch/`.
3. Run `python3 ~/Downloads/SoftSec_Patch/install_to_repo.py ~/Dev/projects/SAD25-26_N02_Group08` (use real unpack folder path).
4. `cd ~/Dev/projects/SAD25-26_N02_Group08 && bash softsec/scripts/build_native.sh`.
5. Set a **nondefault strong** `JWT_SECRET` in your own private environment. Current GitHub `docker-compose.yml` has insecure demo value `change-me-in-production`; preview confirmation is intentionally disabled while this remains. Do not commit secrets. Set `GRADE_PARSER_BIN` for non-standard local backend workdir, otherwise fallback is `backend/softsec-bin/grade_parser` when starting from `backend/`.
6. `cd backend && npm install && npx prisma generate && npm run build`.
7. `cd ../frontend && npm install && npm run typecheck && npm run build`.
8. From repo root run `docker compose build backend frontend && docker compose up -d`. It **does not require or perform** a migration; never run `docker compose down -v` on real data.
9. Visit `http://localhost:3000/softsec-import` while logged in. Use test DB records and actual Topic UUID aliases. Confirm grades only after preview status is READY and actor matches role.
10. Check `git diff --check`, `git status` then commit/push your feature branch after verification.

## Independent coursework runs

```bash
bash softsec/scripts/run_pipeline.sh
python3 softsec/scripts/fuzz_feedback.py
bash softsec/scripts/build_native.sh
./backend/softsec-bin/grade_parser < softsec/tests/valid.csv
./backend/softsec-bin/grade_parser < softsec/tests/records_101.csv  # exit 2
```

## Explicit limitations, not simulated claims

- The files in this ZIP are **an overlay**, not a checkout of all original repo files. This environment cannot `git clone` the repository directly; installer applies the patch to your actual local checkout without overwriting it.
- The C program was compiled and tested standalone. End-to-end NestJS+Next.js+Postgres+Docker deployment must be tested on your Ubuntu machine with the existing DB, credentials and modules. Do not claim it is fully verified until those tests pass.
- The parser accepts a **strict simple CSV subset** only: exact six fields without quoted commas; ASCII student/project IDs, UTF-8 names, dot decimal. It does not automatically normalize names or treat `student_name` as a trusted identifier. Mismatched name is a warning. Input scores are parsed as floats; existing summary weights and rounding are unchanged.
- New integration is a Sprint-9 code-freeze change request; production use requires your group's approval and further business workflow validation. Existing one-by-one score endpoints remain unchanged.
- If you need to remove the feature: revert edits to `backend/src/app.module.ts`, `backend/Dockerfile`, delete overlay files (or reset feature branch before merge). No database migration is introduced.

### Important Docker Compose JWT secret note
The unmodified `docker-compose.yml` contains a literal `JWT_SECRET: change-me-in-production`. Setting a shell environment variable alone does **not** override that literal. Before testing CSV confirm in Docker, replace the compose line with `JWT_SECRET: ${JWT_SECRET:?Set a strong JWT_SECRET}` and add a strong secret to your **untracked** `.env` in the repository root. Recreate the backend container after changing environment. The patch installer does not touch compose to avoid unexpectedly changing the group's existing deploy configuration.
