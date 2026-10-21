#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build results
python3 scripts/generate_config.py | tee results/00_generated_header.log
python3 scripts/prepare_sources.py | tee results/01_generate_sources.log
python3 scripts/gen_cases.py | tee results/02_gen_cases.log
CC=${CC:-clang}
$CC -std=c11 -O0 -g -Wall -Wextra -Wpedantic -fsanitize=address,undefined -fno-omit-frame-pointer src/thesis_grade_parser_v0.c -o build/parser_v0
$CC -std=c11 -O0 -g -Wall -Wextra -Wpedantic -fsanitize=address,undefined -fno-omit-frame-pointer src/thesis_grade_parser_v1.c -o build/parser_v1
python3 scripts/check_kripke.py | tee results/03_kripke_bmc.log
python3 toolkit/pattern_scanner.py src/thesis_grade_parser_v0.c src/thesis_grade_parser_v1.c | tee results/04_static_scan.log
for target in v0 v1; do
 for testcase in long_name records_101 invalid_score; do
   ASAN_OPTIONS=detect_leaks=1:symbolize=0:halt_on_error=1 UBSAN_OPTIONS=print_stacktrace=1 ./build/parser_${target} "tests/${testcase}.csv" > "results/05_${target}_${testcase}.log" 2>&1 || true
 done
 done
python3 scripts/check_smt_z3.py | tee results/06_smt_z3.log
python3 scripts/fuzz_and_coverage.py | tee results/07_fuzz.log
# Corpus coverage on the patched version (build without sanitizers for gcov).
gcc -std=c11 -O0 -g --coverage src/thesis_grade_parser_v1.c -o build/parser_cov
for t in valid records_99 records_100 records_101 long_name invalid_score invalid_inf score_negative score_above wrong_header missing_field empty id_16 name_63 name_64 quoted_csv; do
 ./build/parser_cov "tests/${t}.csv" >/dev/null 2>&1 || true
done
./build/parser_cov --estimate 4294967295 >/dev/null 2>&1 || true
gcov -b build/parser_cov-thesis_grade_parser_v1.gcno > results/08_gcov.log
cat results/08_gcov.log
python3 scripts/verify_regression.py | tee results/09_regression.log
python3 scripts/verify_spec_alignment.py | tee results/10_spec_integrity.log
echo 'DONE - see results/*.log. Do not report crash percentages as formal proof.'
