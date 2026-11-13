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

- Home keeps Pexels photo 8709295 by Polina behind a translucent menu card that is horizontally centered at every width (bottom-anchored on desktop, centered on both axes on phones with compact variants below 820px/560px/430px height so nothing scrolls). The home backdrop is a top crop, `assets/images/ui/home-bg-top.jpg`, so the paper-letter word stays fully above the card; the brand sits in a translucent cream pill. Inner pages reuse `home-bg.jpg` with `blur(4px)` and a cream veil; `scene.css` owns the glass cards, dashed inner border, hover lift and 4:3 stage. Game screens have no top header — the brand lives only on home/theme chooser, and every game keeps Voltar/Temas + Início in the footer (the footer `#back-button` reuses the same confirm-leave logic).
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
- Browser: home, theme chooser and Casa game checked at 1381×886 and 430×900; no horizontal overflow at 430, footer pills wrap, card fits, 2-column theme grid, 4:3 image with readable answers.
- Not verified: audio actually heard; hover appearance was only seen once through the live pointer.

## Next step

Commit the visual system and the direct-start flow. A later unit of work can replace the temporary SVG clothing art in Vestir a Princesa.

## Open questions

- [ ] Keep the same Pexels backdrop on all inner pages, or give each game its own photo? — user.
- [ ] Mirror the Copilot agents as native OpenCode agents? — user.
