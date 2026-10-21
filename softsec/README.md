# SOFTSEC — Graduation thesis grade CSV parser (coursework)

This directory is an **independent Software Security course project** added alongside the original Graduation Project Management System (SAD). It does **not** modify NestJS, Next.js, the database, Docker services, existing API routes or upload UI. **CSV bulk import is not wired into the website.**

## Target

One C CSV parser: `src/thesis_grade_parser_v0.c` and `src/thesis_grade_parser_v1.c` are **two variants of the same C program**, derived from `src/source_original.c`. The deliberately vulnerable v0 is ONLY for isolated classroom/security testing, never production.

Six CSV columns: `student_id,student_name,project_id,supervisor_score,reviewer_score,council_score`.

Rules: scores finite and 0–10; 100 records maximum; `student_id` and `project_id` up to 15 bytes, `student_name` up to 63 bytes.

## Prerequisites on Ubuntu

```bash
sudo apt update
sudo apt install -y clang gcc python3 libz3-4
```

The runner requires `gcov` (provided with GCC) and Z3 shared library (`libz3-4`). Linux tools are required; do not execute the vulnerable binary on a public server.

## Run end to end (CH1-CH4)

```bash
cd softsec
bash scripts/run_pipeline.sh
```

Reads inputs from `tests/`, compiles `build/parser_v0` and `build/parser_v1`, runs a Kripke reachability/BMC demonstration, static pattern scanner, ASan/UBSan/LSan, Z3 through its shared library, deterministic black-box fuzzing and white-box **branch-directed** boundary tests, `gcov` and regression checks. Fresh results appear in `results/` and are intentionally git-ignored; archived examples are in `evidence/reference-logs/`.

### Important boundaries of verification

- The Kripke BMC demonstration is **not CBMC proof of the C binary**.
- The Z3 examples are on **manually extracted arithmetic constraints**.
- The branch-directed boundary test is **not a full concolic execution engine**.
- Recorded fuzz runs and sanitizer results are experimental evidence for tested inputs, **not proof of 100% safety**.
- The lightweight CSV parser rejects quoted commas/newlines. It is not production-ready for untrusted CSV uploads from users.

## Documentation and traceability

- `docs/Spec_thesis_grade_parser_10_sheets.xlsx` — course Excel specification.
- `docs/Giai_thich_spec.docx` — explanation of the Excel sheets.
- `docs/Bao_cao_An_toan_phan_mem.docx`, `.pdf` — report.
- `evidence/` — saved logs and log-based images; see provenance notes there.
- `README_ky_thuat_chi_tiet.md` — original technical guide.

### Source and academic integrity

The two files `toolkit/kripke.py` and `toolkit/pattern_scanner.py` are adapted/copied from the educational `softsec-toolkit` previously supplied by the instructor for this course. Check course permission before sharing those educational sources in a **public** GitHub repository. AI assisted in code, tests and report drafting; the team must disclose its use per their course rules.

## Repository integration

To assemble the *whole* repo locally, use the root-level `tao_toan_bo_du_an.sh` from the extension ZIP. That script clones the existing GitHub repo and places this folder as `softsec/`. It DOES NOT deploy the parser in the NestJS web application.
