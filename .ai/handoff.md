# Handoff

Status: active
Updated: 2026-11-12

## Goal

Lulu Games is a static, dependency-free educational game collection for a 10-year-old autistic child. All six "O que está acontecendo?" themes are complete with local photographs, and the home plus every game/theme page share a friendly photo-and-glass visual system.

## Scope

- `games/image-interpretation/`: `data.js`, `themes.html`, `index.html`, `session.js`, `ui.js`, `game.js`, `game.css`, `game.test.js`
- `games/memory-pairs/`, `games/dress-princess/`: HTML entry points and game CSS
- `shared/css/home.css`, `scene.css`, `base.css`, `components.css`, `tokens.css`
- `shared/js/home.js`, `catalog.js`, `settings.js`, `audio.js`
- `index.html`, `assets/images/ui/home-bg.jpg`, `assets/fonts/fredoka/`
- `tools/build-images.mjs`, `pexels-results.json`, `docs/IMAGE_*.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`

## Decisions

- Home keeps Pexels photo 8709295 by Polina sharp behind a floating translucent menu card. Inner pages reuse the same photo with `blur(4px)` and a cream veil; `scene.css` owns the glass sticky header, translucent cards, dashed inner border, hover lift and 4:3 stage.
- Fredoka is the display font for headings, buttons and brand; Nunito remains body text. Both fonts are local.
- Theme selection is free, five exercises per theme, next only after a correct answer. Clicking a theme now opens the first exercise directly; the "Vamos olhar e descobrir?" intro screen was removed.
- Completion plays the melody plus spoken "Parabéns!", names the theme, and offers "Escolher outro tema" and "Início". Sound settings exist only in the home settings dialog.
- Photos were selected in a real browser because Pexels API key issuance was paused: first landscape result ≥1000 px, no visual triage. `tools/build-images.mjs` requests a 1200×900 CDN crop, validates results and writes credits.
- All 25 scene images exist and are referenced by six themes; `game.test.js` asserts unique IDs and existing files.

## Verified

- `npm test`: 19 tests, 19 pass, 0 fail.
- Browser: home loads without console errors; settings modal opens, saves, closes on Escape and restores focus; both game links work.
- Browser: opening `index.html?theme=house` lands on exercise 1 directly, with no intro/start button, first answer focused, image 1200×900 and three options.
- Browser: Casa completed all five exercises; completion title "Parabéns!", message names Casa, actions "Escolher outro tema"/"Início", footer hidden, no console errors.
- Browser: Escola, Comidas, Parque and Transportes first scenes load with 1200×900 images and three options; Animais first scene loads.
- Browser: both theme choosers render; memory board renders 12 cards; dress-princess page loads. No console errors.
- Browser: "Temas" opens the leave confirmation now that the game starts active.
- Not verified: phone widths, audio actually heard, hover appearance (desktop window was not visible for screenshots).

## Next step

Open `http://127.0.0.1:8000/` and review the new backdrop, cards and direct-start flow at desktop and phone widths; then commit.

## Open questions

- [ ] Keep the same Pexels backdrop on all inner pages, or give each game its own photo? — user.
- [ ] The home backdrop shows part of the "AUTISM" lettering beside the menu card; keep, blur more, or reposition? — user.
- [ ] Mirror the Copilot agents as native OpenCode agents? — user.
