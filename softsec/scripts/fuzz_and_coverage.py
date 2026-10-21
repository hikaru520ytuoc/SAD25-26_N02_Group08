"""Chapter 4: seeded black-box CSV mutations vs white-box Z3-driven branch input.
White-box here solves a manually extracted branch predicate; NOT full concolic execution.
"""
from pathlib import Path
import random,subprocess,tempfile,time,json
r=Path(__file__).resolve().parents[1];bin=str(r/'build/parser_v1')
s=json.loads((r/'config/spec.json').read_text())
seed=20261011;n=300; rng=random.Random(seed)
rows=['SV001','Nguyen Van A','DA001','8.5','8.0','9.0']
choices=['','A'*130,'SV001','9','-1','11','nan','inf','3.14159','%s'*25,'0','10','x'*600,'8.3,9']
counts={'accepted':0,'rejected':0,'unexpected_exit':0,'timeouts':0}
t0=time.perf_counter()
with tempfile.TemporaryDirectory() as d:
 for i in range(n):
  record=rows.copy();idx=rng.randrange(6);record[idx]=rng.choice(choices)
  path=Path(d)/f'{i:04d}.csv'
  path.write_text(s['csv_header']+'\n'+','.join(record)+'\n',encoding='utf-8')
  try:
   p=subprocess.run([bin,str(path)],capture_output=True,text=True,timeout=2)
   key='accepted' if p.returncode==0 else 'rejected' if p.returncode==2 else 'unexpected_exit'
  except subprocess.TimeoutExpired:key='timeouts'
  counts[key]+=1
elapsed=time.perf_counter()-t0
print('BLACK BOX: seed=',seed,'tests=',n,'seconds=',round(elapsed,3),counts)
assert counts['unexpected_exit']==0 and counts['timeouts']==0
print('WHITE BOX: derived predicate if(record_count>=100) reject, solver witness idx=100 => 101 CSV rows')
for fname,expected in [('records_99.csv',0),('records_100.csv',0),('records_101.csv',2)]:
 t=time.perf_counter();p=subprocess.run([bin,str(r/'tests'/fname)],capture_output=True,text=True)
 print(fname,'exit',p.returncode,'expected',expected,'seconds',round(time.perf_counter()-t,5),'output',(p.stdout+p.stderr).strip())
 assert p.returncode==expected
