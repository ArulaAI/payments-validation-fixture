# 301.2E course assets

These files help you check and record your work. They do not build anything, and they do
not approve anything on an owner's behalf.

| Asset | Purpose |
| --- | --- |
| `handoff-301-1e.json` | The 301.1E handoff: baseline commit, file digests, admitted scope and blockers |
| `inspect-handoff.py` | Read-only check of the handoff against your clone; it does not accept anything for you |
| `run-and-record.py` | Runs a command and keeps its output and exit code in a new folder |
| `capture-evidence.py` | Copies task state, code and Git evidence into a new folder, never overwriting |
| `preview-learning-context.sh` | Shows the context a developer agent would get, without starting one |
| `verify-assets.py` | Self-test for these utilities; no model calls |
| `templates/` | Execution ledger, integration admission, learning review, scoring and 301.3E handoff |

Run against the snapshot, `inspect-handoff.py` passes 97 checks and reports two true
errors: task 10 declares no files, and Verify did not pass. The lab guide explains both.

Keep evidence folders outside the repository. Start with the
[lab guide](../lab-action-guide.md).
