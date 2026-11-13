# Game: O que está acontecendo?

## Goal and flow

Practice visual interpretation, image-to-text association, reading, and everyday vocabulary. The player chooses a **theme**, then completes that theme's five illustrated situations in sequence.

1. The theme chooser (`themes.html`) lists the available themes as large cards. Choosing one opens `index.html?theme=<id>` directly on the first exercise; there is no separate game introduction screen.
2. Each exercise shows one illustrated situation, the fixed question, and three text choices in a fixed order.
3. **Próxima** only appears after a correct answer, so the next exercise always follows a completed one.
4. After the fifth exercise the completion screen plays the celebration feedback — the completion melody followed by a spoken "Parabéns!" — and shows **Parabéns!**, a message naming the theme, and the options **Escolher outro tema** and **Início**. No sound controls appear on this screen or anywhere inside the game. Audio follows saved global preferences, but general sound and volume controls are not currently exposed from the home page.

Themes are chosen freely; there is no locked order and no accumulated score. Leaving an unfinished theme asks for confirmation.

## Themes and data

`games/image-interpretation/data.js` exports `THEMES`, an array of `{ id, label, icon, description, scenes }`. Each theme has exactly five scenes; `SCENES` is a flat view of every scene. A scene defines its image, alternative text, hint, three labeled choices, and one correct option ID.

Scene IDs are unique across the whole game. Option IDs only need to be unique inside their scene. Scene images are local files; prefer a 4:3 photograph or illustration, because the stage uses a 4:3 frame and displays them contained with no cropping. Keep every scene's action unambiguous, its distractors clearly excludable, and its clue pointed at one visible detail.

## Answer feedback

A correct answer is marked with a check and a soft success color, read aloud when sound and browser speech are available, and followed by **Próxima**. An incorrect answer receives a gentle message, a red outline and retry icon, and the optional error bell; the player may try as often as needed. After three incorrect attempts in an exercise a scene-specific textual clue appears. No attempt count is shown. The clue resets on the next exercise.

## Accessibility

The scene image has alternative text, the answer controls are keyboard-operable buttons, and feedback and hints use polite live regions. Error and success use icons and text as well as color. Sound is optional and follows saved global preferences; the game itself has no sound controls, and general sound and volume controls are not currently exposed from the home page.

## Current state

The six themes — **Animais**, **Casa**, **Escola**, **Comidas**, **Parque**, and **Transportes** — each have five local photographs in `assets/images/image-interpretation/`, displayed with `object-fit: contain` inside a 4:3 frame. The five newer themes use 4:3 Pexels photographs. Scene wording and photo briefs are in [IMAGE_LIST.md](IMAGE_LIST.md), and photo sources are in [IMAGE_CREDITS.md](IMAGE_CREDITS.md).

The explicit request for red incorrect-answer highlighting differs from the soft shared palette; this game uses a restrained local red with readable text instead of changing shared tokens or existing games.
