import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import {
  createSession,
  currentQuestion,
  findNextEmptySlot,
  nextRound,
  pickQuestions,
  placeWord,
  validateContent,
} from "./game.js";
import { speakCardName } from "../../shared/js/audio.js";

const content = JSON.parse(
  await readFile(new URL("./content.json", import.meta.url), "utf8"),
);
const levelById = (id) => content.levels.find((level) => level.id === id);

test("content has the three requested levels and enough questions per level", () => {
  assert.deepEqual(validateContent(content), []);
  assert.deepEqual(content.levels.map((level) => level.wordCount), [3, 4, 5]);
  assert.deepEqual(content.levels.map((level) => level.questions.length), [12, 12, 10]);
  for (const level of content.levels) assert.equal(level.questionsPerRound, 5);
});

test("sentence text matches its exact word tokens and requested level length", () => {
  for (const level of content.levels) {
    for (const question of level.questions) {
      assert.equal(question.sentence.split(/\s+/).length, level.wordCount, question.id);
      assert.equal(question.words.join(" "), question.sentence, question.id);
    }
  }
});

test("every question has a matching word count and local Pexels image", async () => {
  const ids = new Set();
  for (const level of content.levels) {
    for (const question of level.questions) {
      assert.ok(!ids.has(question.id), `id repetido: ${question.id}`);
      ids.add(question.id);
      assert.equal(question.level, level.id);
      assert.equal(question.words.length, level.wordCount);
      assert.equal("explanation" in question, false);
      assert.ok(question.imageQuery.length > 0);
      assert.ok(question.imageId.length > 0);
      await access(new URL(question.image, import.meta.url));
    }
  }
});

test("every image identifier and query is registered in the existing Pexels manifests", async () => {
  const imageQueries = new Map();
  for (const file of [
    new URL("../../tools/pexels-queries.json", import.meta.url),
    new URL("../../tools/emotions-queries.json", import.meta.url),
  ]) {
    const manifest = JSON.parse(await readFile(file, "utf8"));
    for (const entry of manifest.scenes) imageQueries.set(entry.scene, entry.query);
  }
  for (const level of content.levels) {
    for (const question of level.questions) {
      assert.equal(imageQueries.get(question.imageId), question.imageQuery, question.id);
    }
  }
});

test("a round selects five unique questions without changing the level", () => {
  const level = levelById("level-1");
  const picked = pickQuestions(level.questions, 5, () => 0.5);
  assert.equal(picked.length, 5);
  assert.equal(new Set(picked.map((question) => question.id)).size, 5);
  assert.equal(level.questions.length, 12);
  assert.throws(() => pickQuestions(level.questions, 13), RangeError);
});

test("the word bank is shuffled independently from the correct sentence", () => {
  const state = createSession(levelById("level-1"), () => 0.5);
  assert.deepEqual([...state.bankOrder].sort(), [0, 1, 2]);
  assert.notDeepEqual(state.bankOrder, [0, 1, 2]);
  assert.deepEqual(state.placements, [null, null, null]);
});

test("wrong words return to the bank and can be retried without losing progress", () => {
  const state = createSession(levelById("level-1"), () => 0.42);
  const question = currentQuestion(state);
  const firstWrong = placeWord(state, 1, 0);
  const wrong = placeWord(firstWrong, 2, 0);
  assert.equal(wrong.phase, "playing");
  assert.equal(wrong.mistakes, 2);
  assert.equal(wrong.feedbackKind, "error");
  assert.equal(wrong.lastAttempt.wordIndex, 2);
  assert.deepEqual(wrong.placements, Array(3).fill(null));
  assert.equal(findNextEmptySlot(wrong.placements), 0);

  const right = placeWord(wrong, 0, 0);
  assert.equal(right.feedbackKind, "success");
  assert.equal(right.placements[0], 0);
  assert.ok(question.words.includes(question.words[right.placements[0]]));
  assert.equal(findNextEmptySlot(right.placements), 1);
});

test("correct words lock in order and the round completes only after all slots are filled", () => {
  const level = levelById("level-2");
  let state = createSession(level, () => 0.25);
  const question = currentQuestion(state);
  assert.equal(nextRound(state), state);

  for (let index = 0; index < level.wordCount; index += 1) {
    state = placeWord(state, index, index);
    if (index < level.wordCount - 1) assert.equal(state.phase, "playing");
  }
  assert.equal(state.phase, "correct");
  assert.deepEqual(state.placements, [0, 1, 2, 3]);
  assert.equal(state.feedbackKind, "success");
  assert.equal(placeWord(state, 0, 0), state);
  assert.equal(nextRound(state).roundIndex, 1);
  assert.equal(nextRound(state).mistakes, 0);
  assert.equal(question.words.length, 4);
});

test("a round completes after all five unique questions", () => {
  const level = levelById("level-3");
  let state = createSession(level, () => 0.5);
  const completedQuestionIds = new Set();

  while (state.phase !== "complete") {
    const question = currentQuestion(state);
    completedQuestionIds.add(question.id);
    for (let index = 0; index < level.wordCount; index += 1) {
      state = placeWord(state, index, index);
    }
    assert.equal(state.phase, "correct");
    state = nextRound(state);
  }

  assert.equal(state.rounds, 5);
  assert.equal(completedQuestionIds.size, 5);
});

test("alternative orders remain valid as correct words are locked", () => {
  const level = {
    id: "test",
    label: "Nível de teste",
    description: "Teste",
    wordCount: 3,
    questionsPerRound: 1,
    questions: [{
      id: "test-question",
      level: "test",
      imageId: "test-image",
      image: "../../assets/images/image-interpretation/house-brushing-teeth.jpg",
      imageQuery: "criança escovando os dentes",
      alt: "Uma criança escova os dentes.",
      sentence: "Hoje João corre.",
      words: ["Hoje", "João", "corre."],
      alternativeOrders: [["João", "hoje", "corre."]],
      difficulty: "fácil",
    }],
  };
  let state = createSession(level);
  state = placeWord(state, 1, 0);
  state = placeWord(state, 0, 1);
  state = placeWord(state, 2, 2);
  assert.equal(state.phase, "correct");
});

test("validation reports word-count and duplicate-word problems", () => {
  const invalid = structuredClone(content);
  const question = invalid.levels[0].questions[0];
  question.words = ["Pegar a escova", "Pegar a escova"];
  const problems = validateContent(invalid);
  assert.ok(problems.some((problem) => problem.includes("precisa de 3 palavras")));
  assert.ok(problems.some((problem) => problem.includes("palavras repetidas")));
});

test("invalid alternative orders are reported instead of throwing", () => {
  const invalid = structuredClone(content);
  invalid.levels[0].questions[0].alternativeOrders = [["palavra que não existe"]];
  assert.ok(validateContent(invalid).some((problem) => problem.includes("ordem alternativa")));
});

test("spoken word completion callbacks run once after speech ends", () => {
  const previousWindow = globalThis.window;
  let spokenUtterance;
  class FakeUtterance {
    constructor(text) {
      this.text = text;
      this.listeners = new Map();
    }
    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    }
    dispatch(type) {
      this.listeners.get(type)?.();
    }
  }
  globalThis.window = {
    SpeechSynthesisUtterance: FakeUtterance,
    speechSynthesis: {
      speak(utterance) {
        spokenUtterance = utterance;
      },
    },
  };
  try {
    let completed = 0;
    assert.equal(
      speakCardName("menino", { soundEnabled: true, soundVolume: 0.1 }, () => completed++),
      true,
    );
    assert.equal(spokenUtterance.text, "menino");
    assert.equal(completed, 0);
    spokenUtterance.dispatch("end");
    spokenUtterance.dispatch("error");
    assert.equal(completed, 1);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("a level with too few questions or an unknown word is rejected", () => {
  const level = levelById("level-1");
  assert.throws(() => createSession({ ...level, questionsPerRound: 13 }), TypeError);
  const state = createSession(level);
  assert.throws(() => placeWord(state, 10, 0), RangeError);
  assert.throws(() => placeWord(state, 0, 10), RangeError);
});
