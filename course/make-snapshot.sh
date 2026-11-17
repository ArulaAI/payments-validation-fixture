#!/usr/bin/env bash
# Freeze a course start state into course/<id>/snapshot/fixture.bundle.
#
#   course/make-snapshot.sh 301.1E            one commit of this branch's fixture (no course/)
#   course/make-snapshot.sh 301.2E <repo>     every branch and tag of a repo a course run produced
#
# A bundle keeps commits and branches, which 301.2E and 301.3E inspect. Learners clone it:
#   git clone course/<id>/snapshot/fixture.bundle <dir>
set -euo pipefail

id=${1:?usage: make-snapshot.sh <course-id> [source-repo]}
src=${2:-}
here=$(cd "$(dirname "$0")/.." && pwd)
out="$here/course/$id/snapshot/fixture.bundle"
[[ -d "$here/course/$id" ]] || { echo "no course folder course/$id" >&2; exit 1; }

if [[ -z "$src" ]]; then
    # Squash the fixture at HEAD into a fresh one-commit repo. Course material stays out.
    work=$(mktemp -d)
    trap 'rm -rf "$work"' EXIT
    git -C "$here" archive HEAD | tar -x -C "$work"
    rm -rf "$work/course"
    # The README's pointers into course/ go with it: its layout line and the
    # <!-- snapshot:drop --> ... <!-- /snapshot:drop --> block. An unclosed block fails
    # rather than dropping the rest of the README.
    awk '/^<!-- snapshot:drop -->$/ {if (drop) exit 1; drop=1; next}
         /^<!-- \/snapshot:drop -->$/ {if (!drop) exit 1; drop=0; next}
         !drop && !/^course\/ /
         END {if (drop) exit 1}' "$work/README.md" > "$work/README.md.new" \
        || { echo "README.md: unbalanced snapshot:drop markers" >&2; exit 1; }
    mv "$work/README.md.new" "$work/README.md"
    # A fixed identity, date and config, so the commit does not depend on whoever runs this.
    export GIT_AUTHOR_NAME="Arula Academy" GIT_AUTHOR_EMAIL="academy@arula.invalid"
    export GIT_COMMITTER_NAME=$GIT_AUTHOR_NAME GIT_COMMITTER_EMAIL=$GIT_AUTHOR_EMAIL
    export GIT_AUTHOR_DATE=$(git -C "$here" log -1 --format=%cI HEAD)
    export GIT_COMMITTER_DATE=$GIT_AUTHOR_DATE
    git -C "$work" init -q -b main
    git -C "$work" add -A
    git -C "$work" -c commit.gpgsign=false -c core.hooksPath=/dev/null \
        commit -q -m "$id start state"
    src=$work
fi

# HEAD, branches and tags only: a course run's remotes and stash stay out.
git -C "$src" bundle create "$out" HEAD --branches --tags
check=$(git -C "$here" bundle verify "$out" 2>&1) || { echo "$check" >&2; exit 1; }
echo "wrote ${out#"$here/"} ($(git -C "$src" rev-list --branches --tags --count) commits)"
