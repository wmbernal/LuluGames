# Game: Jogo dos Pares

## Goal and session flow

The player first chooses one of seven themes: Princesas, Casa, Animais, Transportes, Comidas, Jardim, or Palavras que rimam. Each theme has five different rounds of six pairs. Every card has an image; the rhymes theme also shows the word and pairs words that rhyme. The board has six cards on each side. The player can drag a card to its pair from either side. Keyboard and other click-based users can select a card and then select a card on the opposite side.

Matched cards stay visible and receive a check mark. Card positions are shuffled. The selected theme stays the same during a session, and each next round has a different set of pairs. The global session setting controls the number of short boards in a session (3, 4, or 5). After a board, show **Você encontrou todos os pares!** and the option to continue. After the last board, show **Terminamos por hoje!** and offer **Jogar de novo** or **Início**. No clock, attempt count, score, or ranking is displayed.

Each selected card is spoken in Brazilian Portuguese. Correct pairs receive specific text feedback, a brief, non-flashing visual cue, and a gentle two-note bell chime. Incorrect pairs clear the selection and receive neutral text feedback and a distinct descending two-note bell. Completing a round adds a distinct four-note bell flourish and highlights the completion illustration. Sound and speech follow the sound setting in the home-page settings. Visual cues follow the animation setting and are disabled when the device requests reduced motion.

## Match rules

Every theme in `THEMES` in `games/memory-pairs/data.js` defines five rounds with six pairs per round. Picture pairs have different pictures and labels, such as **Cachorro → Casinha de cachorro** or **Cenoura → Bolo de cenoura**. The word theme has illustrated labels such as **Gato → Pato**; each round uses six distinct rhyme families so every match has one clear answer. A match is correct only when the two cards share a `pairId` and are on opposite sides. Cards on each side are shuffled independently. Incorrect matches remain available for another try with calm, neutral feedback.

The pure `game.js` module creates the two-column board for the selected round and applies matches. The UI supports native drag-and-drop as well as selecting one card per side, so matching does not depend on a mouse. The theme selector is the entry screen for the game; the selected theme is carried to the board in the URL query string and is not saved.

## Data model

Each pair defines two cards with labels. Picture themes include an icon for each card:

```js
{
  pairId: "dog-doghouse",
  cards: [
    { icon: "🐶", label: "Cachorro" },
    { icon: "🏠", label: "Casinha de cachorro" }
  ]
}
```

Each round contains exactly six pairs. The game uses the round matching the current session-round number, so up to five rounds can be played without repeating a board. Each side of a round should contain distinct labels and pictures. Word themes set `cardType: "words"` and provide a distinct `rhymeGroup` for each pair in each round. To add a theme, provide an id, Portuguese label, icon, short literal description, and five rounds in `data.js`.

## Accessibility

Each card is a labeled button. Dragging is optional: keyboard users can focus and activate one card, then activate a card on the other side. Selecting a card speaks its name when sound is enabled and browser speech is available. Selected cards expose their pressed state, matched cards remain visibly marked with a check, and a polite live region announces match feedback. Theme choices are labeled links and can be opened with a keyboard. The profile does not list the child’s known objects, so the parent should check whether any labels or relationships are unfamiliar.
