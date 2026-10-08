# Audit evidence

| Field | Value |
|-------|-------|
| Input | `specs/tech/authorisation-risk.md` at tag `301.1-audit-start` |
| SPEED revision | `ea72f5f`, branch `feat/301-latest` |
| Command | `CLAUDE_BIN="$PWD/bin/claude-no-mcp" speed audit specs/tech/authorisation-risk.md` |
| Model | `claude-sonnet-4-6` |
| Duration | 140 seconds |
| Result | WARN: sizing only, about 13 tasks. Deliberate defects M1 to M3 not reported |

`audit.json` is the report SPEED saved, with its Markdown wrapper removed. `audit.log` is the
terminal output with local paths removed.
