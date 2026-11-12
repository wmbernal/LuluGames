# Handoff

Status: active
Updated: 2026-11-12

## Goal

Lulu Games is a static, dependency-free educational game collection for a 10-year-old autistic child. "O que está acontecendo?" has a theme chooser; the **Animais** theme is complete with final photographs.

## Scope

- `games/image-interpretation/`: `data.js`, `themes.html`, `themes.js`, `index.html`, `session.js`, `ui.js`, `game.css`, `game.test.js`
- `assets/images/image-interpretation/`: `dog-ball.jpg`, `animals-cat-drinking.jpg`, `animals-bird-nest.jpg`, `animals-rabbit-carrot.jpg`, `animals-duck-pond.jpg`
- `docs/GAME_IMAGE_INTERPRETATION.md`, `docs/IMAGE_LIST.md`, `docs/IMAGE_SOURCING.md`, `docs/learning-goals.md`, `docs/ARCHITECTURE.md`, `README.md`
- `tools/fetch-pexels.mjs`, `tools/pexels-queries.json`, `tools/crop-4x3.ps1`
- `shared/js/catalog.js`, `shared/js/home.js`, `index.html`

## Decisions

- Theme selection is free: no locked order, no score. Five exercises per theme; the next appears only after the previous is correct.
- Completion plays the celebration feedback: the three-note melody from `playCompletionSound`, then `speechSynthesis` speaks "Parabéns!" (pt-BR) via `celebrateCompletion`. It shows "Parabéns!" with the theme name and offers "Escolher outro tema" plus "Início".
- No game screen exposes sound settings. `shared/js/audio.js` still honours the global `soundEnabled`/`soundVolume`; only the home settings menu changes them.
- The 3/4/5 round setting no longer applies to this game; rounds equal the theme's scene count.
- Only Animais is in `THEMES`. The other five themes stay out of the chooser until their photographs arrive, because the tests assert every scene image exists.
- The 25 exercises for Casa, Escola, Comidas, Parque and Transportes are designed and TEA-reviewed; their final wording and photo briefs live in `docs/IMAGE_LIST.md`. Do not add them to `data.js` before the images exist.
- TEA fixes applied to the drafts: hints now point at the separating detail (toothbrush inside the mouth, water stream, feet on pedals), same-subject distractors were reworded where a photo could satisfy both (soup: "provando" instead of "servindo"; bread: spreading vs eating staged with the bread on a plate), and scene briefs forbid background actors, tools or props that would make a distractor true.
- Casa "regando a planta no vaso" and Parque "regando as flores no canteiro" repeat the verb across themes. Kept on purpose: same verb in two contexts supports generalization.
- Scene images are photographs supplied by the user in `OneDrive\Desktop\Images\O que esta acontecendo`, cropped to 4:3 and re-encoded as JPEG quality 85. The 8:5 frame keeps `object-fit: contain`, so 4:3 images show thin side bars in the stage color.
- Photo sourcing uses the official Pexels API, not HTML scraping: `tools/fetch-pexels.mjs` reads `tools/pexels-queries.json` (25 pt-BR queries plus English fallbacks), downloads 3 candidates per scene into the gitignored `assets/images/image-interpretation/candidates/`, and writes a contact sheet there. `--pick` copies the chosen candidate and records the credit; `tools/crop-4x3.ps1` crops it to 4:3 / 1200 px / JPEG q85 in place. Needs a free `PEXELS_API_KEY`.
- Pexels credits are written to `docs/IMAGE_CREDITS.md` by `--pick`, per the API guidelines.
- Bird scene: the adult has spread wings, so the "flying" distractor was replaced by "Um pássaro bebendo água." to remove the ambiguity.
- Cache busting: bump the `?v=` query whenever a shared module or CSS changes; `http.server` serves stale modules when a version number is reused.

## Verified

- `npm test`: 19 tests, 19 pass, 0 fail.
- Browser: all five images load (500x375, 500x333), five exercises complete in order, completion screen and buttons correct, no console errors.
- Browser: neither the game screen nor the completion screen has sound controls; the completion screen shows only "Escolher outro tema" and "Início". The home settings menu still has sound toggle and volume.
- Browser: dress-princess settings form keeps only animations and rounds, saves without errors.
- Tools: `npm run images:check` validates 25 unique scenes; `fetch-pexels` without a key fails with instructions; `crop-4x3.ps1` turned a 500x333 test copy into 444x333 and left a 4:3 file untouched.
- Not tested: a real Pexels search and download (no API key available in this environment).
- Not verified: mobile widths, audio actually heard, keyboard-only traversal of the theme chooser.

## Next step

Get the 25 photographs — either the user's own photos or `npm run images:fetch` with a free `PEXELS_API_KEY` (see `docs/IMAGE_SOURCING.md`), then pick, crop and add the themes. When they arrive: crop to 4:3, re-encode JPEG q85 into `assets/images/image-interpretation/`, add the five themes to `data.js`, bump `?v=` on `data.js`/`session.js`/`index.html`, and run `npm test`.

## Open questions

- [ ] Reuse the orphaned SVGs (`bicycle`, `reading`, `watering`, `rain`)? They are now superseded by the photo strategy; delete or keep as archive — user.
- [ ] Mirror the Copilot agents as native OpenCode agents under `.opencode/agent/`? — user.
- [ ] "Espremedor de mesa" vs "espremedor de laranja" in the food-orange-juice scene: confirm the child's familiar word — user.
