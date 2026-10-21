# Production C parser (separate from vulnerable laboratory example)
`backend/softsec-native/grade_parser.c` is the source copied into the backend Docker build context. Identical mirror lives here for review.
Compile: `cc -std=c11 -Wall -Wextra -Wpedantic -O2 backend/softsec-native/grade_parser.c -o backend/softsec-bin/grade_parser`.
Run: `./backend/softsec-bin/grade_parser < softsec/tests/valid.csv` (prints a single JSON object). Exit 2 for rejection. No shell execution or database writes.
Only a six-column **unquoted** CSV subset is implemented; ASCII identifiers and UTF-8 names (max 63 bytes); score parser uses C numeric locale. Production deployment must also apply authorization, record matching and transaction policy in backend.
