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
- `games/memory-pairs/themes.html`: theme selector that links to a game board with the selected theme.
- `games/memory-pairs/themes.js`: renders theme choices from game data.
- `games/memory-pairs/index.html`: matching game page, board, and completion regions.
- `games/memory-pairs/game.js`: pure two-column board generation and match-state logic, independent of the DOM.
- `games/memory-pairs/session.js`: session-round orchestration and optional audio integration for the matching game.
- `games/memory-pairs/ui.js`: DOM rendering, drag-and-drop, and accessible selection-based matching.
- `games/memory-pairs/data.js`: five rounds of six pairs for each game theme, including related-picture and rhyming-word pairs.
- `games/memory-pairs/game.css`: matching-board styling built from shared design tokens.
- `games/memory-pairs/game.test.js`: native Node tests for the pure game logic.
- `games/image-interpretation/`: image-to-text game; `themes.html` and `themes.js` render the theme chooser, `data.js` defines themes and their scenes, `game.js` provides pure rules, `session.js` resolves the selected theme and orchestrates settings and audio, and `ui.js` renders choices and completion.
- `games/emotions/`: emotion-recognition game; `levels.html` and `levels.js` render level choices, `content.json` stores level questions and answer options, `game.js` provides pure rules and content validation, `session.js` orchestrates the selected level and shared audio, and `ui.js` renders questions and completion.
- `shared/css/tokens.css`: canonical design tokens.
- `shared/css/base.css`: document reset, local Nunito/Fredoka faces, and global typography/layout defaults.
- `shared/css/components.css`: reusable buttons, cards, and form controls.
- `shared/css/home.css`: full-screen home backdrop, floating menu card, and settings dialog.
- `shared/css/scene.css`: shared photo backdrop, glass header/cards, and hover treatment for theme and game pages.
- `shared/js/settings.js`: validated settings API and defaults.
- `shared/js/storage.js`: guarded `localStorage` read/write wrapper.
- `shared/js/audio.js`: optional short audio feedback, initialized only after user interaction.
- `shared/js/catalog.js`: data for games shown on the home page.
- `assets/images/`: temporary SVG clothing layers with a shared `viewBox` of `0 0 240 320`; replace the art by swapping files and updating item paths in `data.js`.
- `assets/images/ui/home-bg.jpg`: shared Pexels photo used by the home and inner-page backdrops.
- `assets/fonts/`: local Nunito and Fredoka variable fonts with their licenses.
- `assets/audio/`: optional local scenario instructions. The listen control stays hidden when a scenario has no audio file.
- `assets/images/memory/`: retained SVG memory artwork; Jogo dos Pares currently uses labeled Unicode picture symbols.
- `docs/`: product, design, accessibility, and contribution specifications.

## Naming and module conventions

Use kebab-case for file and folder names, camelCase for JavaScript variables/functions, and UPPER_SNAKE_CASE for immutable module constants. Use ES module imports/exports; avoid globals and inline event handlers. Keep UI text in Brazilian Portuguese, while code identifiers and comments are in English.

## Data organization

Keep game content separate from presentation markup. In Vestir a Princesa, every scenario defines `requiredTags`, each clothing item defines its category and `tags`, and an outfit is suitable only when it has one selected item in every category and every selected item shares at least one required scenario tag. Multiple items may share a tag, so more than one outfit can be accepted. In Jogo dos Pares, each theme defines five rounds of six pairs, which may be related pictures or rhyming words. The pure game logic chooses the set for the current round and checks that matching cards come from opposite columns. In Jogo das Emoções, `content.json` is the source of truth for levels and questions. Questions reference local Pexels images, define their answer among the options, include an explanation and difficulty tag, and are validated before play; the pure game logic samples five questions without repeats for each round.

## Add a catalog game

Create a new `games/<game-name>/` entry point and modules, then add a catalog object in `shared/js/catalog.js` with a stable `id`, Portuguese `title`, short `description`, `icon`, relative `href`, and `available` boolean. The home page renders catalog data rather than hard-coding individual game cards. Keep unavailable entries clearly marked and non-interactive until their page is ready.
