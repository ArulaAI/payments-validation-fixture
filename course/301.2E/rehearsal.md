# 301.2E source delta and rehearsal record

Current inspected SPEED source: `95a00d7`. Earlier course source: `c4583ef`.
The [manifest](assets/speed-source-manifest.json) retains exact hashes;
the [summary](assets/rehearsal-summary.json) records actual checks and limits.
The course now requires the same 301.1E payments fixture, includes Learn and totals
120 minutes. The standalone receipt project has been retired from delivery.

## Verified source changes and their course consequences

| Area | Delta from the earlier source | Required lesson |
| --- | --- | --- |
| Run target | Run records its starting branch in the feature's base_branch; valid recorded base is reused; MAIN_BRANCH wins | Inspect environment, current branch and record together before mutation |
| Syntax gate | Compares against git_main_branch rather than hardcoded main | Use the actual run target when interpreting scoped changes |
| Tasks/dependencies | Invalid task JSON is named; unknown dependency IDs are distinct from explicit cycle paths | Diagnose the actual graph problem before retrying |
| CLI | Missing option values and invalid max-parallel receive explicit errors | Treat malformed invocation as configuration failure, preserving its output |
| Guardian | Human verdicts use stderr; stdout verdict JSON requires --json; ad-hoc report paths are concrete | Retain both streams and inspect the real verdict/report |
| Guardian severity | Verified conflicts and interpretive warnings/owner decisions are distinguished | Read quoted source, severity and accountable owner before accepting a blocker |
| Plan admission | Feature planning, full existing-task details, broader cache keys and coverage/repair handling were improved | Inspect what this actual cohort planned; return scope corrections through 301.1E |
| Verify repairs | Explicit verdict required; pass with critical failures fails; repair includes source/contract, restores invalid edits and allows Edit | Preserve real repair/verdict history and inspect scope before execution |
| Learn | No source change in this pull; the course previously omitted its existing pipeline | Required extraction, synthesis, review and future-context inspection now occupy 20 minutes |

These are source findings, not proof that the cohort has produced the required handoff.
The 301.1E documents were not rewritten as part of this update.

## Actual native technical check

A fresh disposable instance of the prior technical smoke project exercised current
Run, Review, Coherence and Integrate. Run completed three tasks; Review approved all
three with seven retained nits, input gaps and denied test attempts; Coherence passed
by static reconstruction. Integrate merged the remaining branch and ran its configured
regression. Its output reported 18 passing tests and 25 passing probe assertions. These
results apply to that retired project only, not to the F2 fixture or the course outcomes.

Native Learn then ran preview, extraction, summary and synthesis. Extraction wrote
52 observations and automatically discovered four conventions. Synthesis retained six
entries (one developer and five reviewer), rejected 67 routed/reframed entries and
reported zero conflicts. Different counts reflect different pipeline stages.

The actual installed developer context bridge emitted a Learned Patterns section and
Project Conventions. No new agent was started for this preview. This verifies that the
observed advice can enter the context; it does not verify its correctness or benefit.

## Important observed limits

Nine extracted gate_failure observations came from passing test logs. The source's
log heuristic treats most nonempty log content as failure signals. Raw observation types
therefore require comparison with actual command results. They were retained, not edited
to manufacture a clean extraction.

An automatically discovered co-change convention was based on sparse bootstrap history
and appeared in the actual context. It is not an accepted project rule. The task-scope
bridge used fields absent from the supplied teaching plan and fell back to weighted
learning selection. Spec text in the actual preview still said not found despite the
file existing. These limits remain visible in the Learn exercise and source reference.

## Same-fixture course readiness

The actual authoring checkout has RFC drafts and no populated adaptive-auth task set.
No complete native F2 Run/Integrate/Learn rehearsal or accepted 301.1E handoff is claimed.
Before live delivery, the trainer must supply that exact reviewed packet and rehearse
its source-matched live/recorded checkpoints. The old technical smoke is not a substitute.

Ten utility safeguard checks passed using clearly synthetic structural input: consistent
packet inspection, blocked readiness, changed spec digest, missing plan, cycle, conflicting
recorded base, actual nonzero command exit, failed startup, learning-memory capture and
snapshot overwrite refusal. These checks neither grant semantic acceptance nor validate
F2 behavior.

The fixed 120-minute teaching design includes waiting, transitions, assessment and wrap-up.
A real cohort rehearsal, assessor calibration and native same-fixture checkpoints remain
necessary before commercial delivery claims. Live and recorded participation must be
reported separately.
