import json
from pathlib import Path
r = Path(__file__).resolve().parent
spec = json.loads((r/'spec.json').read_text(encoding='utf-8'))
out = r/'inputs';out.mkdir(exist_ok=True)
h = spec['csv_header']+'\n'
def row(idx,name='Nguyen Van A',score='8.5'):
    return f'SV{idx:03d},{name},DA{idx:03d},{score},8.0,9.0\n'
(out/'valid.csv').write_text(h + row(1), encoding='utf-8')
(out/'long_name.csv').write_text(h + row(1,'A'*120),encoding='utf-8')
(out/'invalid_score.csv').write_text(h + row(1,score='nan'),encoding='utf-8')
(out/'records_100.csv').write_text(h + ''.join(row(i) for i in range(100)),encoding='utf-8')
(out/'records_101.csv').write_text(h + ''.join(row(i) for i in range(101)),encoding='utf-8')
(out/'wrong_header.csv').write_text('incorrect,header\n'+row(1),encoding='utf-8')
(out/'missing_field.csv').write_text(h + 'SV001,Nguyen Van A,DA001,8.0,8.0\n',encoding='utf-8')
print('Generated 7 CSV cases in inputs/')
