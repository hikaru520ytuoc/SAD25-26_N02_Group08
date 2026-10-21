"""Generate simple C configuration constants from the thesis CSV specification.
The parser algorithm itself is handwritten C; this tool only generates its config header.
"""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
config_path = root / 'config/spec.json'
s = json.loads(config_path.read_text(encoding='utf-8'))
fields = ('max_records', 'student_id_bytes', 'student_name_bytes', 'project_id_bytes', 'max_line_bytes')
assert all(type(s[k]) == int and s[k] > 0 for k in fields)
header = '#ifndef PARSER_CONFIG_H\n#define PARSER_CONFIG_H\n'
header += f'#define MAX_RECORDS {s["max_records"]}\n'
header += f'#define STUDENT_ID_BYTES {s["student_id_bytes"]}\n'
header += f'#define STUDENT_NAME_BYTES {s["student_name_bytes"]}\n'
header += f'#define PROJECT_ID_BYTES {s["project_id_bytes"]}\n'
header += f'#define MAX_LINE_BYTES {s["max_line_bytes"]}\n'
header += f'#define SCORE_MIN {s["score_min"]}\n#define SCORE_MAX {s["score_max"]}\n'
header += '#define CSV_HEADER "' + s['csv_header'] + '"\n#endif\n'
(root / 'src/parser_config.h').write_text(header, encoding='utf-8')
print('Generated parser_config.h from spec.json')
