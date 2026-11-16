#!/usr/bin/env python3
"""Run a command, stream its output, and retain its actual exit in a new directory."""
import codecs,json,os,subprocess,sys
from pathlib import Path

if len(sys.argv)<4 or sys.argv[2]!='--':
    raise SystemExit('Usage: run-and-record.py NEW_EVIDENCE_DIR -- COMMAND [ARG ...]')
out=Path(sys.argv[1]).expanduser().resolve()
if out.exists():raise SystemExit('Evidence destination exists; choose a new attempt directory.')
out.mkdir(parents=True)
command=sys.argv[3:]
(out/'command.json').write_text(json.dumps({'cwd':str(Path.cwd()),'argv':command},indent=2)+'\n')
with (out/'console.txt').open('w') as log:
    try:
        proc=subprocess.Popen(command,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    except OSError as error:
        message=f'Command could not start: {error}\n'
        log.write(message);print(message,end='',file=sys.stderr)
        (out/'result.json').write_text(json.dumps({'exit_code':127,'stage':'command startup','error':str(error)},indent=2)+'\n')
        raise SystemExit(127)
    decoder=codecs.getincrementaldecoder('utf-8')(errors='replace')
    try:
        while True:
            chunk=os.read(proc.stdout.fileno(),4096)
            if not chunk:break
            text=decoder.decode(chunk)
            log.write(text);log.flush();sys.stdout.write(text);sys.stdout.flush()
        tail=decoder.decode(b'',final=True)
        if tail:log.write(tail);sys.stdout.write(tail);sys.stdout.flush()
        rc=proc.wait()
    except KeyboardInterrupt:
        proc.send_signal(2);rc=proc.wait()
(out/'result.json').write_text(json.dumps({'exit_code':rc,'scope':'Process exit only; inspect checks, task states and Git results separately.'},indent=2)+'\n')
raise SystemExit(rc if rc>=0 else 128-rc)
