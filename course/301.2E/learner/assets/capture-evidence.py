#!/usr/bin/env python3
"""Snapshot a lab's task state, code and Git evidence into a new external directory."""
import argparse,json,shutil,subprocess,hashlib
from pathlib import Path

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('project',type=Path);p.add_argument('destination',type=Path);p.add_argument('--feature',default='adaptive-auth')
a=p.parse_args();root=a.project.resolve();out=a.destination.expanduser().resolve()
if out.exists():p.error('Evidence destination exists. Use a new path to retain every attempt.')
if out==root or root in out.parents:p.error('Evidence must be outside the project and its worktrees.')
out.mkdir(parents=True)
commands=[('head',['rev-parse','HEAD']),('status',['status','--short']),('branches',['show-ref','--heads']),('history',['log','--all','--graph','--oneline','-35']),('worktrees',['worktree','list','--porcelain']),('diff',['diff','--binary','HEAD'])]
for name,args in commands:
    r=subprocess.run(['git','-C',str(root),*args],text=True,capture_output=True)
    (out/f'git-{name}.txt').write_text(r.stdout+r.stderr)
for rel in [f'.speed/features/{a.feature}',f'.speed/context', '.speed/memory', 'src','test','specs']:
    src=root/rel
    if src.is_dir():shutil.copytree(src,out/rel)
manifest={str(f.relative_to(out)):hashlib.sha256(f.read_bytes()).hexdigest() for f in out.rglob('*') if f.is_file()}
(out/'manifest.json').write_text(json.dumps({'project':str(root),'feature':a.feature,'files':manifest,'notice':'Raw local evidence may contain source, prompts and provider responses. Review before sharing.'},indent=2)+'\n')
print(str(out))
