# Architecture

The project is a static site: HTML entry points, CSS, and browser-native JavaScript ES modules. There is no bundler, framework, or dependency installation.

## Structure and responsibilities

- `index.html`: game selection home.
- `shared/js/home.js`: renders catalog data and opens/saves the home-page preferences panel.
- `games/dress-princess/index.html`: game entry point and accessible page structure.
- `games/dress-princess/game.js`: session state, category-based outfit validation, rounds, reward unlock, and orchestration.
- `games/dress-princess/ui.js`: DOM rendering, item tray, layered outfit, pointer/keyboard interactions, and settings.
- `games/dress-princess/data.js`: categories, scenario requirements, tagged clothing items, and optional audio paths.
- `games/dress-princess/game.css`: game-specific layout, using shared tokens.
- `games/memory-pairs/index.html`: memory game page and accessible selection, board, and completion regions.
- `games/memory-pairs/game.js`: pure card-deck and game-state logic, independent of the DOM.
- `games/memory-pairs/session.js`: browser session orchestration, timers, storage, and audio integration for the memory game.
- `games/memory-pairs/ui.js`: DOM controls, board rendering, keyboard navigation, and saved selection preferences.
- `games/memory-pairs/data.js`: pair faces, game modes, supported board sizes, and storage keys.
- `games/memory-pairs/game.css`: memory game styling built from shared design tokens.
- `games/memory-pairs/game.test.js`: native Node tests for the pure game logic.
- `shared/css/tokens.css`: canonical design tokens.
- `shared/css/base.css`: document reset and global typography/layout defaults.
- `shared/css/components.css`: reusable buttons, cards, and form controls.
- `shared/js/settings.js`: validated settings API and defaults.
- `shared/js/storage.js`: guarded `localStorage` read/write wrapper.
- `shared/js/audio.js`: optional short audio feedback, initialized only after user interaction.
- `shared/js/catalog.js`: data for games shown on the home page.
- `assets/images/`: temporary SVG clothing layers with a shared `viewBox` of `0 0 240 320`; replace the art by swapping files and updating item paths in `data.js`.
- `assets/audio/`: optional local scenario instructions. The listen control stays hidden when a scenario has no audio file.
- `assets/images/memory/`: temporary memory-game SVG faces sharing a `0 0 128 128` viewBox.
- `docs/`: product, design, accessibility, and contribution specifications.

## Naming and module conventions

Use kebab-case for file and folder names, camelCase for JavaScript variables/functions, and UPPER_SNAKE_CASE for immutable module constants. Use ES module imports/exports; avoid globals and inline event handlers. Keep UI text in Brazilian Portuguese, while code identifiers and comments are in English.

## Data organization

Keep game content as plain JavaScript data exports in each game's `data.js`. In Vestir a Princesa, every scenario defines `requiredTags`, each clothing item defines its category and `tags`, and an outfit is suitable only when it has one selected item in every category and every selected item shares at least one required scenario tag. Multiple items may share a tag, so more than one outfit can be accepted. In Memória das Princesas, modes define pairs with one or two image faces; the pure engine duplicates one-face pairs for identical matching and uses two-face pairs for category relationships. A shared `pairId` identifies matching faces, which also supports a future emotion-and-situation mode. The game logic consumes that data and should not hard-code presentation markup. Persistent user preferences and game rewards use `settings.js`/`storage.js`; a storage failure must not prevent the game from running. The memory game stores its own themed card-back reward instead of coupling to the dress game's clothing reward.

## Add a catalog game

Create a new `games/<game-name>/` entry point and modules, then add a catalog object in `shared/js/catalog.js` with a stable `id`, Portuguese `title`, short `description`, `icon`, relative `href`, and `available` boolean. The home page renders catalog data rather than hard-coding individual game cards. Keep unavailable entries clearly marked and non-interactive until their page is ready.
