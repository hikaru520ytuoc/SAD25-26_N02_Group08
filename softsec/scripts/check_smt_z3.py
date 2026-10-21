"""Chapter 3: run a real SMT-LIB2 solver using locally installed libz3 C API.
No python z3-solver package required. All checks on simplified arithmetic constraints
from store_record(), NOT an automatic whole-C verification.
"""
import ctypes,ctypes.util,re,subprocess
from pathlib import Path
r=Path(__file__).resolve().parents[1]
lib=ctypes.util.find_library('z3')
if not lib:raise SystemExit('Z3 unavailable: no libz3 shared library')
z=ctypes.CDLL(lib)
z.Z3_mk_config.restype=ctypes.c_void_p
z.Z3_mk_context.argtypes=[ctypes.c_void_p];z.Z3_mk_context.restype=ctypes.c_void_p
z.Z3_eval_smtlib2_string.argtypes=[ctypes.c_void_p,ctypes.c_char_p];z.Z3_eval_smtlib2_string.restype=ctypes.c_char_p
z.Z3_del_context.argtypes=[ctypes.c_void_p];z.Z3_del_config.argtypes=[ctypes.c_void_p]
def solve(label,body,expected):
 config=z.Z3_mk_config();ctx=z.Z3_mk_context(config)
 try:
  code='(set-option :produce-models true)\n'+body+'\n(check-sat)\n'
  result=z.Z3_eval_smtlib2_string(ctx,code.encode()).decode().strip()
  status=result.splitlines()[-1].strip()
  model=z.Z3_eval_smtlib2_string(ctx,b'(get-model)').decode() if status=='sat' else ''
  print(label,':',status,'\n',model.strip().replace('\n',' '))
  assert status==expected,(label,status,expected)
  return result+'\n'+model
 finally:
  z.Z3_del_context(ctx);z.Z3_del_config(config)

try:
 r1=solve('v0 can write record at index=100', '''(declare-const idx Int)
(assert (>= idx 0)) (assert (<= idx 100))
(assert (>= idx 100))''','sat')
 solve('v1 valid bound vs out of bounds', '''(declare-const idx Int)
(assert (>= idx 0)) (assert (< idx 100))
(assert (>= idx 100))''','unsat')
 solve('v0 uint32 allocation multiply overflow possibility', '''(declare-const n Int)
(assert (>= n 0)) (assert (<= n 4294967295))
(assert (> (* n 108) 4294967295))''','sat')
 solve('v1 count guard excludes unsigned32 overflow', '''(declare-const n Int)
(assert (>= n 0)) (assert (<= n 39768215))
(assert (> (* n 108) 4294967295))''','unsat')
 # Real model-generated boundary to black-box C input. It should provide idx 100.
 model=re.search(r'\(define-fun idx \(\) Int\s+(\d+)\)',r1)
 if not model:raise RuntimeError('Z3 model missing idx')
 idx=int(model.group(1)); print('Z3 witness idx:',idx,'=> test CSV rows:',idx+1)
 assert idx==100
 path=r/'tests/records_101.csv'
 p=subprocess.run([str(r/'build/parser_v1'),str(path)],capture_output=True,text=True)
 print('Concrete replay v1:',p.returncode,(p.stdout+p.stderr).strip())
 assert p.returncode==2
finally:
 pass
