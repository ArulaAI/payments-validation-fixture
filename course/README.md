# Engineering 301

Three 120-minute courses that follow one change, adaptive authorisation, from definition
to delivery on this payments fixture. Each course hands the next something a person can
check, and each starts from a tagged commit on this branch.

| Course | Starts from | Hands on | Folder |
| --- | --- | --- | --- |
| 301.1E Define, Audit, Plan | Upstream requirements and code (`301.1E-start`) | A reviewed spec and an agent-ready plan | [`301.1E/`](301.1E/) |
| 301.2E Execute, Integrate, Learn | The reviewed plan (`301.2E-start`) | Candidate code and evidence | [`301.2E/`](301.2E/) |
| 301.3E Payments Change Validation | The finished change (`301.3E-start`) | Accept, repair or escalate | [`301.3E/`](301.3E/) |

The feature is all of F2 adaptive authorisation: a genuine traveller declined abroad
(F2.1) and a card-testing attack approved across merchants (F2.2), sharing one bank
step-up challenge. Its upstream documents are in [`../specs/`](../specs/).

## What each folder holds

Every course folder follows the same shape, so a trainer picking up any course finds the
same things in the same places.

| File | Who reads it |
| --- | --- |
| `lab-action-guide.md` | Learners, during the session. Every step has What's happening, Run and Look for |
| `speaker-script.md` | The facilitator. Say and Do, commands, checkpoints and recovery |
| `trainer-brief.md` | Whoever picks the course up. Starting files, environment, what remains to rehearse |
| `overview.html` and `overview.pdf` | Anyone deciding whether to run the course. Rendered from the HTML |
| `diagrams/`, `assets/` | Figures the guide embeds, templates and inspection scripts |

[`assets/arula/`](assets/arula/) holds the shared fonts and design tokens the overview
pages use.

## Status

| Course | Material | Start state |
| --- | --- | --- |
| 301.1E | Complete. Matches the overview | To tag once rehearsed fresh from this branch |
| 301.2E | Complete course design. Needs the reviewed 301.1E packet in git | Blocked on the packet |
| 301.3E | Overview only. The session material is being rewritten onto the adaptive-auth candidate | Blocked on the 301.2E candidate and its planted problems |
