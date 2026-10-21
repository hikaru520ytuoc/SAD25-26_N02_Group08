import subprocess,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
cases={'valid.csv':0,'records_99.csv':0,'records_100.csv':0,'records_101.csv':2,
 'invalid_score.csv':2,'invalid_inf.csv':2,'score_negative.csv':2,'score_above.csv':2,
 'long_name.csv':2,'wrong_header.csv':2,'missing_field.csv':2,'empty.csv':2,
 'id_16.csv':2,'name_63.csv':0,'name_64.csv':2,'quoted_csv.csv':2}
for f,expected in cases.items():
 p=subprocess.run([str(root/'build/parser_v1'),str(root/'tests'/f)],text=True,capture_output=True)
 assert p.returncode==expected,(f,p.returncode,p.stdout,p.stderr)
 print(f'{f:25} expected={expected} actual={p.returncode} PASS')
for arg,expected in [('0',0),('100',0),('4294967295',2),('not_number',2)]:
 p=subprocess.run([str(root/'build/parser_v1'),'--estimate',arg],text=True,capture_output=True)
 assert p.returncode==expected,(arg,p.returncode)
 print(f'--estimate {arg:12} expected={expected} actual={p.returncode} PASS')
for name,expected in [('long_name','heap-buffer-overflow'),('records_101','global-buffer-overflow'),('invalid_score','LeakSanitizer')]:
 txt=(root/f'results/05_v0_{name}.log').read_text()
 assert expected in txt,(name,expected,txt[:250])
 print(f'v0 {name:18} {expected} FOUND')
for name in ['long_name','records_101','invalid_score']:
 txt=(root/f'results/05_v1_{name}.log').read_text()
 assert 'ERROR: AddressSanitizer' not in txt and 'LeakSanitizer' not in txt,(name,txt)
 print(f'v1 {name:18} sanitizer finding NONE in this reproduction')
print('REGRESSION SUMMARY: 20 v1 functional checks + 6 v0/v1 sanitizer assertions PASS')
