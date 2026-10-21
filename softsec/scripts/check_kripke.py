"""Chapter 1: exact reachability model using teacher's softsec-toolkit/ch1_models/kripke.py.
The state machine abstracts the concrete C parser; model proof is NOT a whole-program proof.
"""
import sys
from pathlib import Path
r=Path(__file__).resolve().parents[1];sys.path.insert(0,str(r/'toolkit'))
from kripke import KripkeStructure

def model(vulnerable):
 k=KripkeStructure()
 for name,labels in [('init',['init']),('read_header',['header']),('parsing',['parsing']),('validated',['validated']),('stored',['stored','validated']),('success',['success','validated']),('error',['error'])]:
  k.add_state(name,labels,initial=(name=='init'))
 for x,y in [('init','read_header'),('read_header','parsing'),('read_header','error'),('parsing','validated'),('parsing','error'),('validated','stored'),('stored','parsing'),('stored','success'),('success','success'),('error','error')]:
  k.add_transition(x,y)
 if vulnerable:k.add_state('unsafe_store',['stored','violation']);k.add_transition('parsing','unsafe_store');k.add_transition('unsafe_store','error')
 return k

def bmc_bad(k,bound):
 from collections import deque
 q=deque([(s,[s]) for s in k.initial]);vis=set()
 while q:
  s,path=q.popleft()
  if ('stored' in k.labels[s] and 'validated' not in k.labels[s]):return path
  if len(path)-1>=bound:continue
  if (s,len(path)) in vis:continue
  vis.add((s,len(path)))
  for nxt in sorted(k.transitions.get(s,())):q.append((nxt,path+[nxt]))
 return None

for version in ('v0','v1'):
 k=model(version=='v0')
 print(version, 'states',len(k.states),'reachable',len(k.reachable_states()), 'EF_success',k.satisfies_EF('success'))
 for depth in [2,3,4,6,10]:
  p=bmc_bad(k,depth)
  print(f'  BMC bound k={depth}:', 'COUNTEREXAMPLE '+ ' -> '.join(p) if p else 'NO violation within bound')
 print('  terminal_states_without_outgoing_edges=',[s for s in k.states if not k.transitions[s]])
