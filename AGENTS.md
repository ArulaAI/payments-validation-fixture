# Payments validation fixture

## Quality Gates

- lint: `npm run verify`
- typecheck: `node workbench/run.ts --check=typecheck`
- test: `npm test`
- e2e: `PATH="$PWD/bin:$PATH" workbench validate`
