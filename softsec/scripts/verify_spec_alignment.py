"""Checks intended input spec and C-generated header agree; Excel JSON equivalence not claimed."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
s=json.loads((root/'config/spec.json').read_text())
h=(root/'src/parser_config.h').read_text()
for field,symbol in [('max_records','MAX_RECORDS'),('student_id_bytes','STUDENT_ID_BYTES'),('student_name_bytes','STUDENT_NAME_BYTES'),('project_id_bytes','PROJECT_ID_BYTES'),('max_line_bytes','MAX_LINE_BYTES')]:
 value=int(re.search(rf'#define {symbol} (\d+)',h).group(1))
 assert value==s[field]
 print(f'{field:23} JSON={s[field]} C={value} OK')
assert ('#define CSV_HEADER "'+s['csv_header']+'"') in h
print('CSV_HEADER consistent OK')
