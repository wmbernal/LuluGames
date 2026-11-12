import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { SCENES } from "./data.js";
import { chooseAnswer, createSession, nextRound } from "./game.js";

test("each scene has three options and exactly one correct answer", () => {
  assert.equal(SCENES.length, 5);
  assert.equal(new Set(SCENES.map((scene) => scene.id)).size, 5);
  for (const scene of SCENES) {
    assert.equal(scene.options.length, 3);
    assert.equal(scene.options.filter((option) => option.id === scene.answer).length, 1);
    assert.ok(scene.image && scene.alt && scene.hint);
  }
  assert.doesNotThrow(() => createSession(SCENES, 5));
});

test("each scene image is available locally", async () => {
  for (const scene of SCENES) {
    await access(new URL(scene.image, import.meta.url));
  }
});

test("incorrect answers remain retryable and hint threshold resets each round", () => {
  let state = createSession(SCENES, 3);
  const scene = SCENES[0];
  const wrong = scene.options.find((option) => option.id !== scene.answer).id;
  for (let count = 1; count <= 4; count += 1) {
    state = chooseAnswer(state, wrong);
    assert.equal(state.mistakes, count);
    assert.equal(state.phase, "playing");
    assert.equal(state.feedback, count % 2 === 1
      ? "Vamos olhar a imagem de novo?"
      : "Vamos tentar outra frase?");
  }
  state = chooseAnswer(state, scene.answer);
  assert.equal(state.phase, "correct");
  assert.equal(chooseAnswer(state, wrong), state);
  state = nextRound(state);
  assert.equal(state.roundIndex, 1);
  assert.equal(state.mistakes, 0);
  assert.equal(state.selectedId, null);
});

test("sessions finish after the configured number of rounds and do not advance early", () => {
  for (const rounds of [3, 4, 5]) {
    let state = createSession(SCENES, rounds);
    assert.equal(nextRound(state), state);
    for (let index = 0; index < rounds; index += 1) {
      state = chooseAnswer(state, SCENES[index].answer);
      state = nextRound(state);
    }
    assert.equal(state.phase, "complete");
    assert.equal(state.roundIndex, rounds - 1);
  }
});

test("invalid sessions and answer IDs are rejected", () => {
  assert.throws(() => createSession(SCENES, 6), RangeError);
  assert.throws(() => createSession([{ ...SCENES[0], answer: "missing" }], 1), TypeError);
  assert.throws(() => chooseAnswer(createSession(SCENES, 3), "missing"), RangeError);
});
