# Game: Jogo dos Pares

## Goal and session flow

The player first chooses one of twelve themes: Princesas, Casa, Animais, Transportes, Comidas, Jardim, Palavras que rimam, Escola, Praia, Música, Cidade, or Espaço. Each theme choice reuses the Home tile pattern: a big icon, the theme name and its own pastel tint, with a matching darker border on hover and focus. The shared Lulu Games logo and the single **Escolha um tema** heading share a compact header row inside the panel, above the tiles, so the grid gets more vertical room; the Início link also remains available in the footer. Each theme has five different rounds of six pairs. Every card has an image; the rhymes theme also shows the word and pairs words that rhyme. The board has six cards on each side. The player can drag a card to its pair from either side. Keyboard and other click-based users can select a card and then select a card on the opposite side.

Matched cards stay visible and receive a check mark. Card positions are shuffled. The selected theme stays the same during a session, and each next round has a different set of pairs. The global session setting controls the number of short boards in a session (3, 4, or 5). After a board, show **Você encontrou todos os pares!** and the option to continue. After the last board, show **Terminamos por hoje!** and offer **Jogar de novo** or **Início**. No clock, attempt count, score, or ranking is displayed.

Each selected card is spoken in Brazilian Portuguese. Correct pairs receive specific text feedback, a brief, non-flashing visual cue, and a gentle two-note bell chime. Incorrect pairs clear the selection and receive neutral text feedback and a distinct descending two-note bell. Completing a round adds a distinct four-note bell flourish and highlights the completion illustration. Sound and speech follow the sound setting in the home-page settings. Visual cues follow the animation setting and are disabled when the device requests reduced motion.

The playing header uses a live status pill with the game name, theme, current round, and matched-pair count. The separate large heading and introductory drag/select instruction are omitted to save space at the user's request; the cards remain keyboard-operable. In landscape, the compact shared logo sits in the panel's empty top-left corner and links home without moving the status pill or the board. When a small screen turns to landscape during play, the page aligns the status and the two card columns in view without moving keyboard focus. If a dialog is open, alignment waits until it closes; when returning to portrait, a clipped status is brought back into view.

On entering the theme picker or directly entering the playing screen with a portrait viewport up to 1024 CSS pixels wide, a dialog suggests **Vire na horizontal**, regardless of pointer type. It closes when the viewport no longer matches that condition, or the player may choose **Continuar assim**. When the suggestion was shown on the theme picker, it is not repeated when a theme is selected. It appears only on entry, not again when the device is turned during the same page visit.

## Match rules

Every theme in `THEMES` in `games/memory-pairs/data.js` defines five rounds with six pairs per round. The five added themes are stored in `games/memory-pairs/additional-themes.json` and converted to the same runtime shape by `data.js`. Picture pairs have different pictures and labels, such as **Cachorro → Casinha de cachorro** or **Cenoura → Bolo de cenoura**. The word theme has illustrated labels such as **Gato → Pato**; each round uses six distinct rhyme families so every match has one clear answer. A match is correct only when the two cards share a `pairId` and are on opposite sides. Cards on each side are shuffled independently. Incorrect matches remain available for another try with calm, neutral feedback.

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

Each round contains exactly six pairs. The game uses the round matching the current session-round number, so up to five rounds can be played without repeating a board. Each side of a round should contain distinct labels and pictures. Word themes set `cardType: "words"` and provide a distinct `rhymeGroup` for each pair in each round. To add a theme through `additional-themes.json`, provide `id`, `name`, `icon`, `description`, `cardType`, and five rounds; each round contains six pairs with `pairId`, `left`, and `right` cards, each with an `emoji` and `label`. Word pairs also provide `rhymeGroup`.

## Accessibility

Each card is a labeled button. Dragging is optional: keyboard users can focus and activate one card, then activate a card on the other side. Selecting a card speaks its name when sound is enabled and browser speech is available. Selected cards expose their pressed state, matched cards remain visibly marked with a check, and a polite live region announces match feedback. Theme choices are labeled links and can be opened with a keyboard; their accessible name keeps the full theme label and description even though the visible tile shows only the short label. The profile does not list the child’s known objects, so the parent should check whether any labels or relationships are unfamiliar.
