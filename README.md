# Lulu Games

Lulu Games is a small, welcoming collection of educational games for children. It is built with HTML5, CSS, and vanilla JavaScript: no framework, build step, or external dependency is required. The interface is in Brazilian Portuguese.

## Run locally

Open the folder in VS Code and use the **Live Server** extension, or serve the repository with a static HTTP server. ES modules may be blocked when opening files directly with `file://`.

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`. No package installation or build step is required.

## Project structure

```text
.editorconfig
.gitignore
index.html
games/
  dress-princess/
    index.html
    game.js
    ui.js
    data.js
    game.css
  memory-pairs/
    index.html
    session.js
    game.js
    ui.js
    data.js
    game.css
    game.test.js
shared/
  css/
    tokens.css
    base.css
    components.css
  js/
    settings.js
    storage.js
    audio.js
    catalog.js
    home.js
assets/
  images/
    memory/                 # temporary memory game SVGs
  audio/
docs/
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module responsibilities and conventions. The visual tokens used by the interface are specified in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md); UX and accessibility requirements are in [docs/UX_PRINCIPLES.md](docs/UX_PRINCIPLES.md) and [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

## Add a game

1. Create a folder under `games/` with an `index.html` entry point and game-specific files.
2. Keep game data separate from rendering and game rules. Use ES modules and shared CSS tokens/components.
3. Add a catalog entry in `shared/js/catalog.js`, including a Portuguese title, short description, URL, and availability state.
4. Follow [docs/UX_PRINCIPLES.md](docs/UX_PRINCIPLES.md), [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md), and [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
5. Test keyboard navigation, pointer/touch interactions, small screens, reduced motion, and the complete session flow before publishing.

To add clothing or a scenario to **Vestir a Princesa**, add an SVG item with the shared `viewBox` to `assets/images/`, then add its category, image path, and context tags in `games/dress-princess/data.js`. Add the scenario's required tag and an option matching every category. See [docs/GAME_VESTIR_PRINCESA.md](docs/GAME_VESTIR_PRINCESA.md) for the matching rule.

To add matching or relationship pairs to **Memória das Princesas**, add an entry with a unique `pairId` and one or two labeled image faces to `games/memory-pairs/data.js`. Both modes use the same pair model; a future mode can be added there without changing the matching engine. Run the game logic tests with `npm test` or `node --test`.

## Publish on GitHub Pages

1. Push the repository to GitHub.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select the branch and `/ (root)` folder, then save.
4. Wait for the deployment and open the Pages URL. Keep all links relative so the site works when hosted from a project subpath.

No build or deployment workflow is needed for this static site.
