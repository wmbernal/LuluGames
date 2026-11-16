# Contributing

- Use browser-native ES modules and vanilla JavaScript; do not add frameworks, build tools, or external dependencies.
- Keep modules focused: data, game rules, UI, and shared behavior belong in their documented modules.
- Follow `.editorconfig` for indentation, line endings, and UTF-8 files.
- Use clear camelCase identifiers and English code/comments. Keep all player-facing text in Brazilian Portuguese.
- Avoid global variables, inline event handlers, and unnecessary comments.
- Reuse design tokens and components from `shared/css/`; do not introduce harsh colors, motion, or undersized targets.
- For a new home tile, add its catalog entry and consistent local SVG as described in `ARCHITECTURE.md`; use a recognizable large icon and a one-to-three-word Portuguese label, without a description.
- Treat user settings as optional preferences. Validate persisted values and continue gracefully if browser storage is unavailable.
- Preserve keyboard access, visible focus, meaningful labels, text alternatives, and reduced-motion behavior.
- Any drag-and-drop interaction must also work with keyboard and direct item selection.
- Keep feedback supportive and non-punitive. Essential instructions and results must not rely on audio or animation.
- Add the shared orientation suggestion to every new game's entry screens, following the integration instructions in `ARCHITECTURE.md`; preserve optional portrait play and avoid repeating it between selection and play.
- Before submitting, manually test each page, all game outcomes, keyboard navigation, narrow layouts, sound/animation settings, and reduced-motion mode.
