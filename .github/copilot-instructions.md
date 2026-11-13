# Lulu Games Copilot guidance

Lulu Games is a static HTML, CSS, and JavaScript application. Follow the project documentation in `docs/`, especially `UX_PRINCIPLES.md`, `ACCESSIBILITY.md`, `DESIGN_SYSTEM.md`, and the relevant game guide. Run `npm test` for game logic and interaction changes.

## Specialist routing

- For gameplay, usability, player flow, instructions, learning value, or missing or confusing audio/visual feedback, use **Game UX Reviewer** (`.github/agents/game-ux-reviewer.agent.md`).
- For visual design, page layout, responsive presentation, sensory profile, or consistency between screens, use **Game Visual Designer** (`.github/agents/game-visual-designer.agent.md`).
- For creating, improving, replacing, or reviewing SVG artwork, illustrations, scenes, or layered character assets, use **SVG Illustrator** (`.github/agents/svg-illustrator.agent.md`). The illustrator owns the artwork; Game Visual Designer owns its integration and consistency across screens.
- For new or revised scenes, situations, answer phrases, alt text, or clues in **O que está acontecendo?**, use **Image Interpretation Theme Designer** (`.github/agents/image-interpretation-theme-designer.agent.md`). It owns the scene concept and wording, and delegates the illustration brief to SVG Illustrator; it does not draw the artwork itself.
- For learning difficulty, theme relevance, vocabulary level, or teaching methodology, especially for autistic and other atypical learners, use **Atypical Education Specialist** (`.github/agents/atypical-education-specialist.agent.md`). It advises on content and learning design but does not diagnose or change game mechanics.
- For creating or expanding exercises, curating Pexels images, or coordinating work specific to **Coloque em Ordem**, use **Coloque em Ordem Game Specialist** (`.github/agents/put-in-order-game-specialist.agent.md`).
- For all Pexels photo searches, use the existing workflow with a Brazilian Portuguese query and `pt-BR` locale only; do not fall back to another language.
- Changes affecting both interaction and presentation should be reviewed by both specialists, with separate scopes and no concurrent edits to the same files. UX owns behavior and feedback requirements; visual design owns presentation. The main agent integrates their results and verifies the complete flow.
- For artwork that changes a game screen, coordinate the SVG Illustrator and Game Visual Designer; involve Game UX Reviewer when the image conveys gameplay or learning meaning. Keep scopes separate and avoid concurrent edits to the same files.
- Apply this routing after relevant changes and when adding a game or screen; for review-only requests, specialists should report findings rather than change files unless fixes are requested.
- Specialist invocation depends on the active environment and available tools. If delegation is unavailable, perform the relevant review directly and report the limitation; do not claim a specialist was invoked.
- Honor explicit user requests while identifying any conflicts with project guidance. In particular, keep error feedback gentle, optional where appropriate, and never punitive.

## Context and token hygiene

Treat a **theme** and a **game** as separate units of work. Start a fresh session when the unit changes.

- **Hand off at boundaries.** Before switching theme or game, run `/handoff`: durable decisions go to `docs/`, a compact state goes to `.ai/handoff.md` (procedure in `.opencode/skills/handoff/SKILL.md`), then start a fresh session.
- **Rehydrate from the file.** In a new session, read `.ai/handoff.md` first and open only what it names. Never carry file dumps, diffs, logs, screenshots of verified screens, or design discussion across sessions.
- **Keep each turn small.** Prefer targeted reads and `grep` over whole files, reference paths instead of quoting, run targeted tests before the full suite, batch independent calls, make surgical edits, and do not re-verify what already passed.
- **Stay in scope.** One unit of work per session; no speculative refactors or unrelated changes. If the handoff is missing a detail, ask for it instead of reloading the project.

## Behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
