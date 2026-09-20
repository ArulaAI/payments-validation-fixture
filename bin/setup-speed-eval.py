#!/usr/bin/env python3
"""Prepare the local payments evaluation fixture without changing task schemas."""
import argparse
import json
from pathlib import Path
import shutil


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reset", action="store_true", help="Replace the payments feature state and its old eval outputs")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    feature = root / ".speed/features/payments"
    for path in (root / ".speed", root / ".speed/features", feature):
        if path.is_symlink():
            parser.error(f"Refusing a symlinked runtime path: {path}")
    if (feature / "speed.lock").exists() or (root / ".speed/local/locks/payments.lock").exists():
        parser.error("A payments lock exists; finish the running command before resetting its state")
    tasks = json.loads((root / "specs/tests/speed-eval-tasks.json").read_text())["tasks"]
    if {task["id"] for task in tasks} != {"1", "2"} or len(tasks) != 2:
        parser.error("Expected the two evaluation fixture tasks")
    if feature.exists():
        if not args.reset:
            parser.error("Payments state already exists; use --reset for a fresh evaluation fixture")
        shutil.rmtree(feature)
    (feature / "tasks").mkdir(parents=True)
    (feature / "logs").mkdir()
    for task in tasks:
        (feature / "tasks" / f"{task['id']}.json").write_text(json.dumps(task, indent=2) + "\n")
    state = {"status": "idle", "agents": [], "started_at": None}
    (feature / "state.json").write_text(json.dumps(state, indent=2) + "\n")
    (feature / "test_spec_path").write_text(str(root / "specs/tests/payments.md") + "\n")
    (root / ".speed/active_feature").write_text("payments\n")
    print(f"Prepared two done fixture tasks in {feature}")
    print("Run speed eval to generate the plan, report, and YAML from the current checkout.")


if __name__ == "__main__":
    main()
