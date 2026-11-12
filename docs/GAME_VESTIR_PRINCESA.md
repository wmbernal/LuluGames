# Game: Vestir a Princesa

## Goal

Practice connecting everyday contexts to clothing choices, following a short sequence, and recognizing that different situations call for different items. The activity has no score, timer, or penalty.

## Fixed screen layout

- **Top:** scenario icon and short description; show **Ouvir** only when the scenario has a local audio file.
- **Center:** princess artwork built from the aligned body, dress, shoes, accessory, and crown SVG layers.
- **Side/below:** a category tray in a consistent order: clothes, shoes, accessories, and crowns.
- **Footer:** the primary action (**Pronto**, then **Próximo**) and **Início**. **Voltar** remains visible in the header.

Items are buttons, so Tab, Enter, and Space work without dragging. Tapping an item equips it; tapping it again removes it, while selecting another item from the same category replaces it. Pointer Events support dragging an item onto the princess with mouse, pen, or touch.

## Session flow

1. The player reads a short, concrete context.
2. The player chooses one item from every category. They may change or remove choices freely.
3. **Pronto** checks the outfit. An incomplete or mismatched outfit receives a gentle hint and highlights the first category to revisit without removing chosen items. The current implementation does not yet play an error sound.
4. A suitable outfit receives soft positive feedback. **Próximo** advances to the next context.
5. Session length is configurable to 3, 4, or 5 rounds (3 by default). The four contexts are shown in order; a fifth round repeats the first context.
6. After the last round, show **Terminamos por hoje!**, unlock a flower crown in the collection, and offer replay or **Início**.

## Initial scenarios and categories

The four contexts are rain (`rain`), beach (`beach`), school (`school`), and snow (`snow`). Categories are `dress`, `shoes`, `accessory`, and `crown`; the initial catalogue has around three items per category. A flower crown is unlocked after completing a session.

Temporary item illustrations are local SVG files under `assets/images/`, all with `viewBox="0 0 240 320"`. Their positions align as overlays. Replace the SVG files with final artwork using the same viewBox, or update each `image` path in `data.js`.

## Matching rule

Each scenario exports one or more `requiredTags`, and each item exports a `category` and one or more `tags`. An outfit is suitable only when it contains exactly one selected item for every category and **each selected item's tags shares at least one tag with the current scenario's `requiredTags`**. Items may carry multiple tags, so different complete combinations can be correct. Missing categories or non-matching item tags identify the gentle hint category.

## Audio and navigation

Scenario instructions may specify a relative local audio file in `data.js`. If the path is absent, the listen button is hidden. Playback is optional, respects the sound setting and volume, and only starts after the player presses **Ouvir**. Positive feedback sound is also opt-in.

Keep **Voltar** and **Início** visible. **Voltar** returns to the game introduction without losing the current outfit; leaving through **Início** asks for confirmation during an unfinished session. Animation can be disabled, and `prefers-reduced-motion` is respected.
