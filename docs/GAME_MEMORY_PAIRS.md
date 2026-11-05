# Game: Memória das Princesas

## Goal and session flow

Turn over cards to find two-card pairs. The player chooses a matching mode and a board size before starting. The board remains fixed during a round; the child advances to another round only by pressing **Próxima rodada**.

The global session setting controls the number of short boards in a session (3, 4, or 5). After a board, show **Você encontrou todos os pares!** and the option to continue. After the last board, show **Terminamos por hoje!**, save the starry card-back reward, and offer **Jogar de novo** or **Início**. No clock, attempt count, score, or ranking is displayed.

## Modes and board sizes

- **Iguais:** matching cards use the same picture twice.
- **Combinam:** matching cards use different pictures that belong together, such as a ball gown and glass slipper.
- **Emoções (future):** not implemented yet. The data model already allows a pair ID to identify a face and situation as a matching pair.

Choose 3, 4, 6, or 8 pairs (6, 8, 12, or 16 cards). Three pairs is the initial choice. The selected mode, size, and optional peek preference are saved in `memory-pairs-last-config` using the shared storage wrapper.

## Turn and match rules

1. Optionally show all cards face-up for 3 or 5 seconds at the start; this feature is off by default. Then turn every card face-down.
2. The player flips one card, then a second card.
3. If both cards have the same `pairId`, keep them face-up, mark the pair with a check as well as a soft border, and optionally play the shared gentle positive sound.
4. If the `pairId`s differ, keep both visible briefly, then turn them face-down. Lock the board while they are being checked so no additional card can be flipped during that interval.
5. **Ajuda** highlights one still-hidden card from an unmatched pair. It has no penalty and does not reveal the answer.
6. When every pair is found, celebrate briefly and show the board-completion screen. The next board starts only after the player selects **Próxima rodada**.

Animation is removed when the global animation setting is off or `prefers-reduced-motion` is active. The sound is optional and follows the global sound and volume settings. No sound or negative message is used for a mismatch.

## Data model

Pairs are plain data in `games/memory-pairs/data.js`. Every pair has a unique `pairId` and one or two faces. A face has a relative SVG `image` path and a localized `label`.

```js
{
  pairId: "crown",
  cards: [{ image: "../../assets/images/memory/crown.svg", label: "Coroa" }]
}
```

In **Iguais**, the engine duplicates the one provided face. In **Combinam**, define two different faces under the same `pairId`:

```js
{
  pairId: "gown-slipper",
  cards: [
    { image: "../../assets/images/memory/ball-gown.svg", label: "Vestido de baile" },
    { image: "../../assets/images/memory/glass-slipper.svg", label: "Sapato de cristal" }
  ]
}
```

The pure `game.js` module turns a chosen subset of pairs into individually identified cards and shuffles them with Fisher–Yates. Cards match only when their `pairId`s are equal. The same model can represent a future emotion/situation mode by defining two faces under one pair ID; that mode is intentionally not exposed yet.

To add a pair, create a temporary or final SVG under `assets/images/memory/` using the shared `viewBox="0 0 128 128"`, then add its face data. Each mode must contain at least as many pairs as the largest board size (eight). To add a mode, add a localized label/description and pair list to `MODES`; the pair engine does not need mode-specific logic.

## Rewards

Completing the last board saves `memory-pairs-starlight-card-back` through `shared/js/storage.js`. The unlocked starry card-back design is then used on future boards. This reward is independent from the clothing reward in **Vestir a Princesa**; the games share only the storage wrapper, avoiding cross-game coupling. If browser storage is unavailable, the completed game remains playable and the completion screen explains that the collectible could not be saved.

## Accessibility and interaction

Each card is a button with a descriptive accessible name and `aria-pressed` state. Tab moves between cards, Enter/Space flips a card, and arrow keys move focus through the grid. A polite live region announces found pairs. The matching check is also shown with a check mark and border, not color alone. All primary choices and controls meet the shared minimum target size.
