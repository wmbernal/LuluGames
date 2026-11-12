---
name: Handoff
description: Use when finishing a game theme or a game, or before starting a different unit of work, to persist durable decisions and write a compact handoff file so the next session starts clean.
---

# Handoff

Close a unit of work and leave a small, durable footprint for the next session.

## When to run

- A theme set is finished and the next theme begins.
- A game is finished and a new game begins.
- The conversation has grown long and the next step is a different unit of work.

## Steps

1. **Persist what is durable.** Write decisions, vocabulary, difficulty parameters, and rejected ideas into the owning document under `docs/` (`ARCHITECTURE.md`, `learning-goals.md`, or the game's guide). Update in place instead of appending a running log.
2. **Write `.ai/handoff.md`** from the template below. Overwrite the previous file; never accumulate history. Keep it under about 60 lines.
3. **Drop what only served the finished work:** scratch reasoning, superseded options, temporary paths, and credentials.
4. **Report one line:** the handoff path, the next step, and the reminder to start a new session and load that file.

## Template

```markdown
# Handoff

Status: active | done
Updated: YYYY-MM-DD

## Goal
One or two sentences.

## Scope
- games/<game>/...
- assets/images/<game>/...

## Decisions
- Decision — reason.

## Verified
- `npm test`: pass/fail, counts.
- Screens and viewports actually checked.

## Next step
The single next action.

## Open questions
- [ ] Question — who can answer it.
```

## Rules

- No code blocks, diffs, logs, or screenshots in the handoff. Reference paths and line ranges instead.
- Record only what changes the next decision. If an item would not change anything, leave it out.
- Never write secrets, API keys, or personal data.
- `Verified` must state what actually ran. Never claim a check that did not happen.
- Keep user-facing copy in Brazilian Portuguese; keep the handoff itself in English.

## In the new session

Read `.ai/handoff.md` first, then open only the files it names. Set `Status: done` or clear the file once the work is accepted.
