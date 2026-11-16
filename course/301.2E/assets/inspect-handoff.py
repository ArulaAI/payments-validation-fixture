#!/usr/bin/env python3
"""Read-only structural inspection of an actual 301.1E continuation handoff."""
import argparse,hashlib,json,os,subprocess,sys
from pathlib import Path

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('project',type=Path);p.add_argument('--handoff',type=Path,required=True)
a=p.parse_args();root=a.project.expanduser().resolve();errors=[];checks=[]
def check(ok,message):(checks if ok else errors).append(message)
def git(*args):return subprocess.check_output(['git','-C',str(root),*args],text=True,stderr=subprocess.DEVNULL).strip()
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def local(rel):
    candidate=(root/rel).resolve()
    if not rel or Path(rel).is_absolute() or root not in candidate.parents:raise ValueError('Artifact path must remain inside the fixture: '+str(rel))
    return candidate
try:
 h=json.loads(a.handoff.read_text());check(h.get('readiness')=='ready','301.1E handoff explicitly records readiness for the stated scope')
 check(h.get('feature')=='adaptive-auth','Feature is the same adaptive-auth continuation')
 check(git('rev-parse','--show-toplevel')==str(root),'Independent repository root')
 check(not git('status','--porcelain'),'Initial continuation working tree is clean')
 check(git('rev-parse','HEAD')==h.get('baseline'),'Code baseline matches the frozen handoff')
 target=h.get('target','');check(bool(target),'Target is declared')
 if target:
  git('rev-parse','--verify','refs/heads/'+target)
  check(git('branch','--show-current')==target,'Current branch matches admitted target')
  check(not os.environ.get('MAIN_BRANCH') or os.environ['MAIN_BRANCH']==target,'MAIN_BRANCH agrees with admitted target')
  base=root/'.speed/features/adaptive-auth/base_branch'
  if not os.environ.get('MAIN_BRANCH') and base.exists():
   recorded=base.read_text().strip()
   if subprocess.run(['git','-C',str(root),'rev-parse','--verify','refs/heads/'+recorded],capture_output=True).returncode==0:check(recorded==target,'Recorded feature base agrees with admitted target')
 required=['specs/product/adaptive-auth/1-high-value-traveller.md','specs/product/adaptive-auth/2-card-testing.md','specs/architecture/adaptive-auth.md','specs/design/adaptive-auth/1-checkout-challenge.md','specs/design/adaptive-auth/2-risk-review-queue.md','specs/tech/adaptive-auth/1-high-value-traveller.md','specs/tech/adaptive-auth/2-card-testing.md']
 specs=h.get('spec_sha256',{})
 check(set(required)<=set(specs),'Both F2 RFCs and their original upstream feature specifications are identified')
 for rel,expected in specs.items():
  path=local(rel);check(path.is_file() and digest(path)==expected,'Specification digest: '+rel)
 scope=h.get('scope',{});check(bool(scope.get('in_scope')),'Accepted scope is stated')
 check('excluded_or_blocked' in scope,'Excluded or blocked scope is recorded')
 task_dir=root/'.speed/features/adaptive-auth/tasks'
 tasks={f.name:json.loads(f.read_text()) for f in task_dir.glob('*.json')}
 check(bool(tasks),'Actual saved task set exists')
 ids={str(t['id']) for t in tasks.values()}
 check(set(map(str,scope.get('task_ids',[])))==ids,'Admitted task IDs match the saved execution namespace; no silent task filtering')
 declared=h.get('task_sha256',{})
 check(set(declared)==set(tasks),'Every saved task file is identified in the handoff')
 for name,t in tasks.items():
  check(name==str(t['id'])+'.json','Task filename agrees with ID: '+name)
  check(digest(task_dir/name)==declared.get(name),'Task digest: '+name)
  check(set(map(str,t.get('depends_on',[])))<=ids,'Dependency IDs exist: '+name)
  check(t.get('status')=='pending','Initial task is pending: '+name)
  check(bool(t.get('files_touched')),'Declared files exist in task intent: '+name)
  check(bool(t.get('agent_model')),'Actual per-task model declared: '+name)
  refs=t.get('spec_references',[])
  check(bool(refs) and all(isinstance(ref,dict) and ref.get('spec') and local(ref['spec']).is_file() and ref.get('requirement') for ref in refs),'Resolvable spec/requirement references: '+name)
 seen=set()
 while len(seen)<len(ids):
  ready={str(t['id']) for t in tasks.values() if str(t['id']) not in seen and set(map(str,t.get('depends_on',[])))<=seen}
  if not ready:errors.append('Task graph has a cycle');break
  seen|=ready
 for label in ['contract','verify_report']:
  record=h.get(label,{})
  if record.get('path'):
   path=local(record['path']);check(path.is_file() and digest(path)==record.get('sha256'),label+' artifact matches handoff digest')
  else:errors.append(label+' artifact is not identified')
 verify=h.get('verify_report',{})
 check(verify.get('status')=='pass' and bool(verify.get('checked_scope')),'Explicit Verify pass and actual checked scope are recorded for human review')
 check(bool(h.get('decision_records')),'Accepted decision and owner-blocker records are identified')
 for rel in h.get('decision_records',[]):check(local(rel).is_file(),'Decision record exists: '+rel)
 check(bool(h.get('target_checks')),'Exact target check commands are declared')
 check(bool(h.get('gate_configuration_review')),'Actual gate configuration has a recorded review')
except (OSError,ValueError,KeyError,TypeError,subprocess.CalledProcessError) as e:errors.append(str(e))
print(json.dumps({'project':str(root),'checks':checks,'errors':errors,'scope':'Read-only structural consistency; no semantic acceptance, provider call or configuration change.','manual_review':['Original specifications and decisions actually authorize the stated scope.','Verify report contains an explicit parsed verdict and covers this plan.','Gate commands and models are available in the actual execution environment.','Recorded checkpoints use the same source/spec scope and accurate provenance.']},indent=2))
sys.exit(1 if errors else 0)
