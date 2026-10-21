import json
from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=json.loads((r/'config/spec.json').read_text())
o=r/'tests';o.mkdir(exist_ok=True)
h=s['csv_header']+'\n'
def row(i,name='Nguyen Van A',sup='8.5',review='8.0',council='9.0'):
 return f'SV{i:03d},{name},DA{i:03d},{sup},{review},{council}\n'
data={
 'valid.csv':h+row(1)+row(2,'Tran Thi B','0','10','5'),
 'long_name.csv':h+row(1,'A'*120),
 'invalid_score.csv':h+row(1,sup='nan'),
 'invalid_inf.csv':h+row(1,sup='inf'),
 'score_negative.csv':h+row(1,sup='-0.1'),
 'score_above.csv':h+row(1,sup='10.1'),
 'records_99.csv':h+''.join(row(i) for i in range(99)),
 'records_100.csv':h+''.join(row(i) for i in range(100)),
 'records_101.csv':h+''.join(row(i) for i in range(101)),
 'wrong_header.csv':'wrong,header\n'+row(1),
 'missing_field.csv':h+'SV001,Nguyen Van A,DA001,8.5,8.0\n',
 'empty.csv':'',
 'id_16.csv':h+f'{"S"*16},A,DA001,8,8,8\n',
 'name_63.csv':h+row(1,'A'*63),
 'name_64.csv':h+row(1,'A'*64),
 'quoted_csv.csv':h+'SV001,"Nguyen, Van A",DA001,8.5,8,9\n'
}
for n,t in data.items(): (o/n).write_text(t,encoding='utf-8')
print('Generated',len(data),'cases')
