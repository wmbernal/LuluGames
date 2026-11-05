import test from "node:test";
import assert from "node:assert/strict";
import {
  createDeck,
  createGameState,
  endPeek,
  flipCard,
  getHintCardId,
  isGameFinished,
  resolveMismatch,
  shuffleCards,
} from "./game.js";

const pairs = [
  { pairId: "crown", cards: [{ image: "crown.svg", label: "Coroa" }] },
  { pairId: "rose", cards: [{ image: "rose.svg", label: "Rosa" }] },
];
const predictableRandom = () => 0.999;

test("shuffling preserves every card exactly once", () => {
  const original = ["a", "b", "c", "d", "e"];
  const shuffled = shuffleCards(original, predictableRandom);

  assert.deepEqual([...shuffled].sort(), [...original].sort());
  assert.notEqual(shuffled, original);
});

test("a matching pair stays visible and completes the game", () => {
  const deck = createDeck({ pairs }, 1, predictableRandom);
  let state = createGameState(deck);
  state = flipCard(state, "crown-1");
  state = flipCard(state, "crown-2");

  assert.equal(state.matchedPairs, 1);
  assert.equal(isGameFinished(state), true);
  assert.equal(state.cards.every((card) => card.matched && card.faceUp), true);
});

test("different faces with a shared pair id match in relationship mode", () => {
  const relationshipMode = {
    pairs: [{
      pairId: "gown-slipper",
      cards: [
        { image: "gown.svg", label: "Vestido de baile" },
        { image: "slipper.svg", label: "Sapato de cristal" },
      ],
    }],
  };
  const deck = createDeck(relationshipMode, 1, predictableRandom);
  let state = createGameState(deck);
  state = flipCard(state, deck[0].id);
  state = flipCard(state, deck[1].id);

  assert.equal(state.matchedPairs, 1);
  assert.equal(isGameFinished(state), true);
  assert.notEqual(deck[0].label, deck[1].label);
});

test("the peek ends with hidden cards and hints select unmatched cards", () => {
  const deck = createDeck({ pairs }, 2, predictableRandom);
  let state = createGameState(deck, true);

  assert.equal(state.phase, "peeking");
  assert.equal(state.cards.every((card) => card.faceUp), true);
  state = endPeek(state);
  assert.equal(state.cards.every((card) => !card.faceUp), true);

  const firstHint = getHintCardId(state);
  state = flipCard(state, firstHint);
  const nextHint = getHintCardId(state);
  assert.notEqual(nextHint, firstHint);
});

test("a non-matching pair waits to be resolved, then turns back down", () => {
  const deck = createDeck({ pairs }, 2, predictableRandom);
  let state = createGameState(deck);
  state = flipCard(state, "crown-1");
  state = flipCard(state, "rose-1");

  assert.equal(state.phase, "checking");
  assert.equal(state.cards.filter((card) => card.faceUp).length, 2);
  state = resolveMismatch(state);

  assert.equal(state.phase, "ready");
  assert.equal(state.cards.every((card) => !card.faceUp), true);
});

test("additional flips are blocked while a mismatch is being checked", () => {
  const deck = createDeck({ pairs }, 2, predictableRandom);
  let state = createGameState(deck);
  state = flipCard(state, "crown-1");
  state = flipCard(state, "rose-1");
  const blockedState = flipCard(state, "rose-2");

  assert.equal(blockedState, state);
  assert.equal(blockedState.cards.filter((card) => card.faceUp).length, 2);
});

test("the finished state is reached only after all pairs are found", () => {
  const deck = createDeck({ pairs }, 2, predictableRandom);
  let state = createGameState(deck);
  state = flipCard(state, "crown-1");
  state = flipCard(state, "crown-2");
  assert.equal(isGameFinished(state), false);

  state = flipCard(state, "rose-1");
  state = flipCard(state, "rose-2");
  assert.equal(isGameFinished(state), true);
});
