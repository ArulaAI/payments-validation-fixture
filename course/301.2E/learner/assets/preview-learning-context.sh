#!/usr/bin/env bash
# Assemble actual single-player developer context without starting a provider agent.
set -euo pipefail
if [[ $# -ne 4 ]]; then
  printf 'Usage: bash preview-learning-context.sh SPEED_ROOT PROJECT FEATURE TASK_ID\n' >&2
  exit 2
fi
course_speed_root=$(cd "$1" && pwd -P)
course_project_root=$(cd "$2" && pwd -P)
course_feature_name="$3"
course_task_id="$4"
if [[ ! "$course_feature_name" =~ ^[A-Za-z0-9_-]+$ || ! "$course_task_id" =~ ^[A-Za-z0-9_-]+$ ]]; then
  printf 'Use a single feature name and task ID without path separators.\n' >&2
  exit 2
fi
course_task_file="$course_project_root/.speed/features/$course_feature_name/tasks/$course_task_id.json"
[[ -f "$course_speed_root/lib/context_bridge.sh" && -f "$course_task_file" ]]
export PROJECT_ROOT="$course_project_root"
export SPEED_DIR="$course_speed_root"
export SCRIPT_DIR="$course_speed_root"
export STATE_DIR="$course_project_root/.speed"
source "$course_speed_root/lib/context_bridge.sh"
course_branch=$(jq -r '.branch // empty' "$course_task_file")
printf 'Read-only context preview. No branch, worktree or agent is created; branch/worktree statements below come from retained task metadata.\n' >&2
context_assemble_developer "$course_task_file" "$course_branch" "$course_project_root" "$course_feature_name"
