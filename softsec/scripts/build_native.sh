#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mkdir -p "$ROOT/backend/softsec-bin"
CC="${CC:-cc}"
"$CC" -std=c11 -Wall -Wextra -Wpedantic -Werror -O2 -D_FORTIFY_SOURCE=2 -fstack-protector-strong \
  "$ROOT/backend/softsec-native/grade_parser.c" -o "$ROOT/backend/softsec-bin/grade_parser"
echo "Built $ROOT/backend/softsec-bin/grade_parser"
"$ROOT/backend/softsec-bin/grade_parser" < "$ROOT/softsec/tests/valid.csv"
