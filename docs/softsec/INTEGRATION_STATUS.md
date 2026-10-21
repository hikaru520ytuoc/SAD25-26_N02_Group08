# Verification matrix for this ZIP (2026-10-21)

| Check | Status | Evidence / limitation |
|---|---|---|
| C parser compile with GCC C11 `-Werror` | PASS | `grade_parser.c` built on packager Linux; no warnings |
| C parser test matrix (11 cases) | PASS | `docs/softsec/NATIVE_TEST_RESULTS.txt` |
| Educational lab pipeline 4 techniques | PASS | `softsec/evidence/run_in_packaging_environment/*.log` (run in packager, not user's Ubuntu) |
| Previous lab regression 20 functional + 6 sanitizer asserts | PASS | `softsec/evidence/run_in_packaging_environment/09_regression.log` |
| 6 TS/TSX file syntax parsing via TypeScript transpiler | PASS | Syntax only; no project deps/types linked |
| Overlay installer on isolated mock Git checkout | PASS | File copy/patch tested, no GitHub push |
| Actual repo NestJS typecheck/build | NOT RUN | Full source/deps not available locally in packaging environment |
| Actual repo Next.js typecheck/build | NOT RUN | Full source/deps not available locally in packaging environment |
| DB-backed preview/confirm tests | NOT RUN | No real PostgreSQL migrations/seed/test DB in sandbox |
| Docker Compose build/start | NOT RUN | No project checkout and Docker Compose setup in sandbox |
| Browser UX with JWT roles | NOT RUN | Requires live application on user's Ubuntu |
| Git push | NOT RUN | User must review and push own feature branch |

Do not report production-ready until all NOT RUN items are verified on the actual checkout.
