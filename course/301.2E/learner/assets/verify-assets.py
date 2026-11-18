#!/usr/bin/env python3
"""Test course evidence and handoff safeguards, without agents or product validation."""
import hashlib,json,os,subprocess,sys,tempfile
from pathlib import Path
assets=Path(__file__).resolve().parent
passed=[]
def run(*args,env=None):return subprocess.run([sys.executable,*map(str,args)],capture_output=True,text=True,env=env)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='arula-3012-utility-') as t:
 base=Path(t);project=base/'synthetic-structural-fixture';project.mkdir()
 subprocess.run(['git','init','-q','-b','main',str(project)],check=True)
 def git(*args):return subprocess.run(['git','-C',str(project),*args],check=True,capture_output=True,text=True).stdout.strip()
 git('config','user.name','Structural utility check');git('config','user.email','course-test@example.invalid')
 (project/'.gitignore').write_text('.speed/\n')
 handoff=json.loads((assets/'handoff-301-1e.json').read_text())
 for rel in handoff['spec_sha256']:
  p=project/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('Synthetic path/hash fixture for utility checks only.\n')
  handoff['spec_sha256'][rel]=sha(p)
 decision=project/'decision.md';decision.write_text('Synthetic structural test only; no semantic acceptance claim.\n')
 git('add','-A');git('commit','-qm','Synthetic structural utility baseline')
 feature=project/'.speed/features/adaptive-auth';tasks=feature/'tasks';tasks.mkdir(parents=True)
 task={'id':'1','status':'pending','depends_on':[],'files_touched':['src/example.ts'],'agent_model':'example','spec_references':[{'spec':'specs/tech/adaptive-auth/1-high-value-traveller.md','requirement':'synthetic utility reference'}]}
 task_path=tasks/'1.json';task_path.write_text(json.dumps(task))
 contract=feature/'contract.json';contract.write_text('{}\n');report=feature/'logs/plan-verification.log';report.parent.mkdir();report.write_text('Synthetic utility report: not product evidence.\n')
 handoff.update(readiness='ready',baseline=git('rev-parse','HEAD'),target='main',scope={'in_scope':['synthetic utility check'],'excluded_or_blocked':[],'task_ids':['1']},task_sha256={'1.json':sha(task_path)},contract={'path':str(contract.relative_to(project)),'sha256':sha(contract)},verify_report={'path':str(report.relative_to(project)),'sha256':sha(report),'status':'pass','checked_scope':'synthetic utility check'},decision_records=['decision.md'],gate_configuration_review='synthetic structural check')
 hpath=base/'handoff.json'
 env=dict(os.environ);env.pop('MAIN_BRANCH',None)
 def inspect(h=handoff):
  hpath.write_text(json.dumps(h));r=run(assets/'inspect-handoff.py',project,'--handoff',hpath,env=env);return r,json.loads(r.stdout)
 result,data=inspect();assert result.returncode==0,data
 passed.append('Consistent synthetic structural packet is readable without mutating repository state')
 bad=dict(handoff,readiness='blocked');result,data=inspect(bad);assert result.returncode!=0 and any('readiness' in e for e in data['errors']);passed.append('Blocked handoff is rejected')
 original=(project/'specs/tech/adaptive-auth/1-high-value-traveller.md').read_text();(project/'specs/tech/adaptive-auth/1-high-value-traveller.md').write_text('Changed input\n')
 result,data=inspect();assert any('Specification digest' in e for e in data['errors']);(project/'specs/tech/adaptive-auth/1-high-value-traveller.md').write_text(original);passed.append('Changed specification digest is rejected')
 task_path.unlink();result,data=inspect();assert any('saved task set' in e for e in data['errors']);task_path.write_text(json.dumps(task));passed.append('Missing saved execution plan is rejected')
 badtask=dict(task,depends_on=['1']);task_path.write_text(json.dumps(badtask));result,data=inspect();assert 'Task graph has a cycle' in data['errors'];task_path.write_text(json.dumps(task));passed.append('Dependency cycle is rejected')
 git('branch','different');(feature/'base_branch').write_text('different\n');result,data=inspect();assert any('Recorded feature base' in e for e in data['errors']);(feature/'base_branch').unlink();passed.append('Recorded base conflicting with admitted target is rejected')
 result=run(assets/'run-and-record.py',base/'exit7','--',sys.executable,'-c',"print('original failure');raise SystemExit(7)");assert result.returncode==7 and json.loads((base/'exit7/result.json').read_text())['exit_code']==7;passed.append('Actual nonzero command exit and output are preserved')
 result=run(assets/'run-and-record.py',base/'startup','--',str(base/'missing-executable'));assert result.returncode==127 and json.loads((base/'startup/result.json').read_text())['stage']=='command startup';passed.append('Failed command startup is recorded')
 memory=project/'.speed/memory/observations';memory.mkdir(parents=True);(memory/'source.jsonl').write_text('{"id":"retained"}\n')
 result=run(assets/'capture-evidence.py',project,base/'capture');assert result.returncode==0,result.stderr
 assert (base/'capture/.speed/memory/observations/source.jsonl').read_bytes()==(memory/'source.jsonl').read_bytes();passed.append('Snapshot preserves learning memory')
 before=(base/'capture/manifest.json').read_bytes();result=run(assets/'capture-evidence.py',project,base/'capture');assert result.returncode!=0 and (base/'capture/manifest.json').read_bytes()==before;passed.append('Snapshot overwrite is refused')
print(json.dumps({'checks':len(passed),'passed':passed,'scope':'Synthetic utility safeguards only; no native F2 execution, provider calls or semantic acceptance.'},indent=2))
