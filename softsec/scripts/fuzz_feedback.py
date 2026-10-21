"""Reproducible feedback-style fuzzing of the SAME thesis_grade_parser_v1.c.

Feedback is output-class/state novelty, NOT edge instrumentation or symbolic
execution. gcov measures aggregate branch/line coverage of round inputs.
A new class adds the input to saved corpus for the next round. Crashes/hangs
are saved individually, and their logs retained. 3x80 inputs; deterministic.
"""
from pathlib import Path
import hashlib, json, random, re, shutil, subprocess, time
ROOT=Path(__file__).resolve().parents[1]
CORPUS=ROOT/'fuzz_feedback'/'corpus'
LOGDIR=ROOT/'results'/'feedback'
CORPUS.mkdir(parents=True,exist_ok=True)
LOGDIR.mkdir(parents=True,exist_ok=True)
RUNNER=ROOT/'build'/'parser_feedback_cov'
# Reset prior corpus between full sessions; seed novelty is tracked across rounds.
for old in CORPUS.glob('*.csv'): old.unlink()
SEED=20261018
HEADER=(ROOT/'config'/'spec.json')
SPEC=json.loads(HEADER.read_text(encoding='utf8'))
HEADER_TXT=SPEC['csv_header']
BASE='SV001,Nguyen Van A,DA001,8.5,8,9'
UNITS=[
    HEADER_TXT+'\n'+BASE+'\n',
    HEADER_TXT+'\n'+BASE.replace('Nguyen Van A','N'*66)+'\n',
    HEADER_TXT+'\n'+BASE.replace('8.5','nan')+'\n',
    'wrong,header\n'+BASE+'\n',
    '',
    HEADER_TXT+'\n'+BASE.replace('DA001','')+'\n',
    HEADER_TXT+'\n'+BASE.replace('8.5','11')+'\n',
    HEADER_TXT+'\n'+BASE.replace('Nguyen Van A','Z'*600)+'\n',
]
# Replay corpus seen in previous rounds and deterministically explore new cases.
rng=random.Random(SEED)
for i,s in enumerate(UNITS): (CORPUS/f'initial_{i:02d}.csv').write_bytes(s.encode())

def output_class(ret,out):
    if ret==-999:return 'HANG'
    if ret not in (0,2) or 'AddressSanitizer' in out or 'runtime error:' in out:return 'CRASH'
    if ret==0:return 'ACCEPT'
    msg=out.lower()
    patterns=[('EMPTY','empty file'),('HEADER','csv header'),('LONG_LINE','line too long'),
              ('LIMIT','>100 records'),('INVALID_RECORD','invalid record'),('FOPEN','fopen')]
    return next((name for name,part in patterns if part in msg),'OTHER_REJECT')

def run_input(raw,filename):
    filename.write_bytes(raw)
    try:
        cp=subprocess.run([str(RUNNER),str(filename)],capture_output=True,timeout=1.5)
        out=(cp.stdout+cp.stderr).decode('utf-8','replace')
        return cp.returncode,out
    except subprocess.TimeoutExpired as ex:
        return -999,((ex.stdout or b'')+(ex.stderr or b'')).decode('utf-8','replace')

def coverage(round_no):
    # gcov total counters since build: round N = aggregate feedback corpus so far
    cp=subprocess.run(['gcov','-b','-o','build','build/parser_feedback_cov-thesis_grade_parser_v1.gcno'],
                      cwd=ROOT,capture_output=True,text=True)
    data=cp.stdout+cp.stderr
    (LOGDIR/f'gcov_round_{round_no:02d}.log').write_text(data,encoding='utf-8')
    a=re.search(r'Lines executed:([\d.]+)% of (\d+)',data)
    b=re.search(r'Taken at least once:([\d.]+)% of (\d+)',data)
    return {'line_coverage_pct':float(a.group(1)) if a else None,
            'branch_direction_coverage_pct':float(b.group(1)) if b else None}

# gcc-gcov instrumentation, distinct output executable
RUNNER.parent.mkdir(parents=True,exist_ok=True)
for old in RUNNER.parent.glob('parser_feedback_cov*.gcda'): old.unlink()
for old in RUNNER.parent.glob('parser_feedback_cov*.gcno'): old.unlink()
subprocess.run(['gcc','-std=c11','-O0','-g','--coverage','src/thesis_grade_parser_v1.c',
                '-o',str(RUNNER)],cwd=ROOT,check=True)
seen=set();total={'accepted':0,'rejected':0,'crash':0,'hang':0}
result=[];path=LOGDIR/'inputs.jsonl'
path.write_text('',encoding='utf8')
with path.open('a',encoding='utf8') as log:
    for rnd in range(1,4):
        candidates=sorted(CORPUS.glob('*.csv'))
        new=0; tested=0
        for i in range(80):
            text=candidates[rng.randrange(len(candidates))].read_text(encoding='utf8',errors='replace')
            if i >= len(UNITS) or rnd>1:
                parts=text.splitlines()
                if not parts:parts=[HEADER_TXT,BASE]
                mode=rng.randrange(8)
                if mode==0:parts[0]='bad,header'
                elif mode==1:parts[-1]=BASE.replace('8.5',str(rng.choice(['-1','11','nan','8.7','9e999'])))
                elif mode==2:parts[-1]=BASE.replace('Nguyen Van A','A'*rng.choice([63,64,130,600]))
                elif mode==3:parts[-1]=BASE.replace('SV001','')
                elif mode==4:parts.append(BASE)
                elif mode==5:parts=[HEADER_TXT]+[BASE]*rng.choice([99,100,101,103])
                elif mode==6:parts[-1]=BASE.replace('DA001','A'*rng.choice([15,16,18]))
                else:parts[-1]=BASE.replace('8.5','abc')
                text='\n'.join(parts)+'\n'
            else:text=UNITS[i]
            raw=text.encode('utf8')
            case=LOGDIR/'last_input.csv'
            ret,out=run_input(raw,case)
            cls=output_class(ret,out)
            hash8=hashlib.sha256(raw).hexdigest()[:12]
            discovered=cls not in seen
            if discovered:
                seen.add(cls);new+=1
                (CORPUS/f'discovered_{cls.lower()}_{hash8}.csv').write_bytes(raw)
            if cls in ('CRASH','HANG'):
                subdir=LOGDIR/('crashes' if cls=='CRASH' else 'hangs');subdir.mkdir(exist_ok=True)
                (subdir/f'{hash8}.csv').write_bytes(raw)
                (subdir/f'{hash8}.log').write_text(out[:5000],encoding='utf8')
            total['accepted' if cls=='ACCEPT' else 'crash' if cls=='CRASH' else 'hang' if cls=='HANG' else 'rejected']+=1
            log.write(json.dumps({'round':rnd,'i':i,'sha12':hash8,'class':cls,'returncode':ret,'new_state':discovered},ensure_ascii=False)+'\n')
            tested+=1
        c=coverage(rnd)
        s={'round':rnd,'n_tests':tested,'new_behaviour_classes':new,'total_behaviour_classes':len(seen),
           'classes':sorted(seen),'saved_seed_count':len(list(CORPUS.glob('*.csv'))),
           **c,'total_crash':total['crash'],'total_hang':total['hang']}
        result.append(s)
        print(json.dumps(s,ensure_ascii=False))
summary={'seed':SEED,'method':'output-class feedback, not edge-guided instrumentation',
         'rounds':result,'overall_counts':total,'known_limitations':['No auto symbolic execution','No coverage-guided mutation scheduling','gcov coverage accumulates across rounds']}
(LOGDIR/'summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf8')
print('SUMMARY',json.dumps(summary,ensure_ascii=False))
