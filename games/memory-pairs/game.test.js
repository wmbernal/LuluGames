import test from "node:test";
import assert from "node:assert/strict";
import { THEMES } from "./data.js";
import {
  createMatchBoard,
  isGameFinished,
  matchCards,
  shuffleCards,
} from "./game.js";

const theme = THEMES[0];
const predictableRandom = () => 0.999;

test("shuffling preserves every card exactly once", () => {
  const original = ["a", "b", "c", "d", "e"];
  const shuffled = shuffleCards(original, predictableRandom);

  assert.deepEqual([...shuffled].sort(), [...original].sort());
  assert.notEqual(shuffled, original);
});

test("every theme has five rounds of six distinct and complete pairings", () => {
  assert.equal(THEMES.length, 7);
  for (const entry of THEMES) {
    assert.equal(entry.rounds.length, 5, entry.label);
    const roundCombinations = new Set();
    for (const round of entry.rounds) {
      assert.equal(round.length, 6, entry.label);
      assert.equal(new Set(round.map((pair) => pair.pairId)).size, 6, entry.label);
      assert.equal(
        round.every((pair) => pair.cards.length === 2
          && pair.cards.every((card) => card.icon && card.label)
          && pair.cards[0].icon !== pair.cards[1].icon
          && pair.cards[0].label !== pair.cards[1].label),
        true,
        entry.label,
      );
      assert.equal(
        new Set(round.map((pair) => pair.cards[0].label)).size,
        6,
        `${entry.label}: duplicate left-side card`,
      );
      assert.equal(
        new Set(round.map((pair) => pair.cards[1].label)).size,
        6,
        `${entry.label}: duplicate right-side card`,
      );
      assert.equal(
        new Set(round.map((pair) => pair.cards[0].icon)).size,
        6,
        `${entry.label}: duplicate left-side picture`,
      );
      assert.equal(
        new Set(round.map((pair) => pair.cards[1].icon)).size,
        6,
        `${entry.label}: duplicate right-side picture`,
      );
      roundCombinations.add(round.map((pair) => pair.pairId).sort().join("|"));
    }
    assert.equal(roundCombinations.size, 5, `${entry.label}: rounds must vary`);
  }
});

test("the rhymes theme has five boards of six illustrated word pairs", () => {
  const rhymes = THEMES.find((entry) => entry.id === "rhymes");

  assert.equal(rhymes.cardType, "words");
  assert.equal(rhymes.rounds.length, 5);
  assert.equal(rhymes.rounds.flat().length, 30);
  assert.equal(
    rhymes.rounds.every((round) => new Set(round.map((pair) => pair.rhymeGroup)).size === 6),
    true,
    "each board must use distinct rhyme families to avoid ambiguous matches",
  );
  assert.equal(
    rhymes.rounds.flat().every((pair) => pair.rhymeGroup
      && pair.cards.every((card) => card.icon)),
    true,
  );
  assert.equal(
    rhymes.rounds.flat().every((pair) => pair.cards[0].icon !== pair.cards[1].icon),
    true,
  );
  assert.equal(rhymes.rounds[0].some((pair) => pair.pairId === "gato-pato"), true);
});

test("animal homes and food recipes use the requested related-object pairs", () => {
  const animals = THEMES.find((entry) => entry.id === "animals");
  const food = THEMES.find((entry) => entry.id === "food");
  const animalPairs = new Set(animals.rounds[0].map((pair) => pair.pairId));
  const firstFoodRound = new Set(food.rounds[0].map((pair) => pair.pairId));

  for (const pairId of ["dog-doghouse", "rabbit-burrow", "bird-tree-nest", "fish-cave"]) {
    assert.equal(animalPairs.has(pairId), true);
  }
  for (const pairId of ["carrot-cake", "bread-sandwich", "strawberry-jam", "banana-split"]) {
    assert.equal(firstFoodRound.has(pairId), true);
  }
});

test("a board has six related pairs with six cards on each side", () => {
  const state = createMatchBoard(theme, 0, predictableRandom);

  assert.equal(state.leftCards.length, 6);
  assert.equal(state.rightCards.length, 6);
  assert.equal(state.leftCards.every((card) => !card.matched), true);
  assert.equal(state.rightCards.every((card) => !card.matched), true);
  for (const leftCard of state.leftCards) {
    const rightCard = state.rightCards.find((card) => card.pairId === leftCard.pairId);
    assert.notEqual(rightCard.icon, leftCard.icon);
    assert.notEqual(rightCard.label, leftCard.label);
  }
});

test("a correct match marks both cards and finishes after the last pair", () => {
  let state = createMatchBoard(theme, 0, predictableRandom);
  for (const leftCard of state.leftCards) {
    const rightCard = state.rightCards.find((card) => card.pairId === leftCard.pairId);
    state = matchCards(state, leftCard.id, rightCard.id);
  }

  assert.equal(state.matchedPairs, 6);
  assert.equal(state.leftCards.every((card) => card.matched), true);
  assert.equal(state.rightCards.every((card) => card.matched), true);
  assert.equal(isGameFinished(state), true);
});

test("word matches announce the rhyme", () => {
  const state = createMatchBoard(THEMES.find((entry) => entry.id === "rhymes"), 0, predictableRandom);
  const leftCard = state.leftCards.find((card) => card.pairId === "gato-pato");
  const rightCard = state.rightCards.find((card) => card.pairId === "gato-pato");
  const nextState = matchCards(state, leftCard.id, rightCard.id);

  assert.equal(nextState.feedback, "Gato rima com Pato!");
});

test("incorrect matches do not mark cards as found", () => {
  const state = createMatchBoard(theme, 0, predictableRandom);
  const firstCard = state.leftCards[0];
  const wrongCard = state.rightCards.find((card) => card.pairId !== firstCard.pairId);
  const nextState = matchCards(state, firstCard.id, wrongCard.id);

  assert.equal(nextState.matchedPairs, 0);
  assert.equal(nextState.leftCards.every((card) => !card.matched), true);
  assert.equal(nextState.rightCards.every((card) => !card.matched), true);
  assert.match(nextState.feedback, /combinação não corresponde/i);
  assert.equal(nextState.feedbackType, "incorrect");
});

test("cards on the same side cannot be matched", () => {
  const state = createMatchBoard(theme, 0, predictableRandom);
  const nextState = matchCards(state, state.leftCards[0].id, state.leftCards[1].id);

  assert.equal(nextState.matchedPairs, 0);
  assert.equal(nextState.leftCards.every((card) => !card.matched), true);
});

test("playing the next round selects a different set of pairs", () => {
  const firstRound = createMatchBoard(theme, 0, predictableRandom);
  const secondRound = createMatchBoard(theme, 1, predictableRandom);

  assert.notDeepEqual(
    firstRound.leftCards.map((card) => card.pairId).sort(),
    secondRound.leftCards.map((card) => card.pairId).sort(),
  );
});

test("invalid random values are rejected", () => {
  assert.throws(() => shuffleCards([1, 2], () => 1), RangeError);
});

test("a theme rejects a round that is outside its configured rounds", () => {
  assert.throws(() => createMatchBoard(theme, 5), RangeError);
});
