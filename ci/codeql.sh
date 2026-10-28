#!/bin/sh
# CodeQL security and quality queries for TypeScript. Prints SARIF on stdout; progress goes to stderr.
set -e
work="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/speed-ci-codeql-payments"
mkdir -p "$work"
codeql database create "$work/db" --language=javascript-typescript --source-root=. --overwrite --quiet >&2
codeql database analyze "$work/db" codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls \
    --download --format=sarif-latest --output="$work/results.sarif" --quiet >&2
cat "$work/results.sarif"
