# Game: Jogo dos Pares

## Goal and session flow

The player first chooses one of six themes: Princesas, Casa, Animais, Transportes, Comidas, or Jardim. Each theme has five different rounds of six related picture pairs. The board has six cards on each side. The player can drag a card to its related picture from either side. Keyboard and other click-based users can select a card and then select a card on the opposite side.

Matched cards stay visible and receive a check mark. Card positions are shuffled. The selected theme stays the same during a session, and each next round has a different set of pairs. The global session setting controls the number of short boards in a session (3, 4, or 5). After a board, show **Você encontrou todos os pares!** and the option to continue. After the last board, show **Terminamos por hoje!** and offer **Jogar de novo** or **Início**. No clock, attempt count, score, or ranking is displayed.

Each correct pair receives specific text feedback, a brief, non-flashing visual cue, and a gentle two-note bell chime. Completing a round adds a distinct four-note bell flourish and highlights the completion illustration. Sound is enabled by default, can be turned off or adjusted in the home-page settings, and the previous default-off preference is migrated once to enabled. Visual cues follow the animation setting and are disabled when the device requests reduced motion.

## Match rules

Every theme in `THEMES` in `games/memory-pairs/data.js` defines five rounds with six pairs per round. Each pair has two different pictures and labels, such as **Cachorro → Casinha de cachorro** or **Cenoura → Bolo de cenoura**. A match is correct only when the two cards share a `pairId` and are on opposite sides. Cards on each side are shuffled independently. Incorrect matches remain available for another try with calm, neutral feedback.

The pure `game.js` module creates the two-column board for the selected round and applies matches. The UI supports native drag-and-drop as well as selecting one card per side, so matching does not depend on a mouse. The theme selector is the entry screen for the game; the selected theme is carried to the board in the URL query string and is not saved.

## Data model

Each pair defines two related pictures with labels:

```js
{
  pairId: "dog-doghouse",
  cards: [
    { icon: "🐶", label: "Cachorro" },
    { icon: "🏠", label: "Casinha de cachorro" }
  ]
}
```

Each round contains exactly six pairs. The game uses the round matching the current session-round number, so up to five rounds can be played without repeating a board. Each side of a round should contain distinct pictures; avoid repeating an animal or object on one side, which could make it unclear which related item is intended. To add a theme, provide an id, Portuguese label, icon, short literal description, and five rounds in `data.js`.

## Accessibility

Each card is a labeled button. Dragging is optional: keyboard users can focus and activate one card, then activate a card on the other side. Selected cards expose their pressed state, matched cards remain visibly marked with a check, and a polite live region announces match feedback. Theme choices are labeled links and can be opened with a keyboard. The profile does not list the child’s known objects, so the parent should check whether any labels or relationships are unfamiliar.
