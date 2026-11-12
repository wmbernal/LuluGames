import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { SCENES, THEMES } from "./data.js";
import { chooseAnswer, createSession, nextRound } from "./game.js";

const scenes = THEMES[0].scenes;

test("each theme has five scenes with three options and exactly one correct answer", () => {
  assert.deepEqual(THEMES.map((theme) => theme.id), [
    "animals", "house", "school", "food", "park", "transport",
  ]);
  assert.equal(new Set(THEMES.map((theme) => theme.id)).size, THEMES.length);
  for (const theme of THEMES) {
    assert.ok(theme.id && theme.label && theme.icon && theme.description);
    assert.equal(theme.scenes.length, 5);
    for (const scene of theme.scenes) {
      assert.equal(scene.options.length, 3);
      assert.equal(scene.options.filter((option) => option.id === scene.answer).length, 1);
      assert.ok(scene.image && scene.alt && scene.hint);
    }
    assert.doesNotThrow(() => createSession(theme.scenes, 5));
  }
  assert.equal(new Set(SCENES.map((scene) => scene.id)).size, SCENES.length);
});

test("each scene image is available locally", async () => {
  for (const scene of SCENES) {
    await access(new URL(scene.image, import.meta.url));
  }
});

test("incorrect answers remain retryable and hint threshold resets each round", () => {
  let state = createSession(scenes, 3);
  const scene = scenes[0];
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

test("a theme session finishes after its five exercises and does not advance early", () => {
  for (const theme of THEMES) {
    let state = createSession(theme.scenes, theme.scenes.length);
    for (let index = 0; index < theme.scenes.length; index += 1) {
      assert.equal(state.roundIndex, index);
      assert.equal(nextRound(state), state);
      const scene = theme.scenes[index];
      const wrong = scene.options.find((option) => option.id !== scene.answer).id;
      state = chooseAnswer(state, wrong);
      assert.equal(state.phase, "playing");
      assert.equal(nextRound(state), state);
      state = chooseAnswer(state, scene.answer);
      assert.equal(state.phase, "correct");
      state = nextRound(state);
    }
    assert.equal(state.phase, "complete");
    assert.equal(state.roundIndex, theme.scenes.length - 1);
  }
});

test("invalid sessions and answer IDs are rejected", () => {
  assert.throws(() => createSession(scenes, 6), RangeError);
  assert.throws(() => createSession([{ ...scenes[0], answer: "missing" }], 1), TypeError);
  assert.throws(() => chooseAnswer(createSession(scenes, 3), "missing"), RangeError);
});
