---
description: Save durable context and write .ai/handoff.md before starting a new session
---

Run the handoff procedure for this repository. Load the `handoff` skill (`.opencode/skills/handoff/SKILL.md`) and follow it.

Working tree right now:

!`git status --short`
!`git diff --stat`

Constraints:

- Overwrite `.ai/handoff.md`; never append or keep history.
- Persist only durable decisions into `docs/`, and only when they would change a future decision.
- Work from the working-tree lists above. Do not re-read the project or the files it mentions.
- Keep the file under about 60 lines and set `Updated` to today.

Finish with exactly one line: `Handoff pronto — pode dar /new.`
