import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import {
  chooseAnswer,
  createSession,
  nextRound,
  pickQuestions,
  validateContent,
} from "./game.js";

const content = JSON.parse(
  await readFile(new URL("./content.json", import.meta.url), "utf8"),
);
const levelById = (id) => content.levels.find((level) => level.id === id);

test("content.json passes validation and has the four planned levels", () => {
  assert.deepEqual(validateContent(content), []);
  assert.deepEqual(content.levels.map((level) => level.id), ["match", "name", "situation", "gesture"]);
  assert.ok(levelById("match").questions.length >= 12);
  assert.ok(levelById("name").questions.length >= 12);
  assert.ok(levelById("situation").questions.length >= 10);
  assert.equal(levelById("gesture").questions.length, 5);
  for (const level of content.levels) {
    assert.equal(level.questionsPerRound, 5);
    assert.ok(level.label && level.icon && level.description && level.question);
    assert.ok(level.hint);
  }
});

test("every question has one correct option, an explanation and a local image", async () => {
  const ids = new Set();
  for (const level of content.levels) {
    for (const question of level.questions) {
      assert.ok(!ids.has(question.id), `id repetido: ${question.id}`);
      ids.add(question.id);
      assert.equal(question.options.length, level.optionCount);
      assert.equal(question.options.filter((option) => option.id === question.answer).length, 1);
      assert.ok(question.explanation.length > 20);
      await access(new URL(question.image, import.meta.url));
      for (const option of question.options) {
        if (level.optionKind === "image") {
          await access(new URL(option.image, import.meta.url));
          assert.ok(option.alt.length > 0);
        } else {
          assert.ok(option.text.length > 0);
        }
      }
    }
  }
});

test("level 1 only pairs faces of the same emotion with a contrasting face", () => {
  const level = levelById("match");
  assert.equal(level.optionKind, "image");
  assert.equal(level.optionCount, 2);
  for (const question of level.questions) {
    const correct = question.options.find((option) => option.id === question.answer);
    const wrong = question.options.find((option) => option.id !== question.answer);
    assert.equal(correct.emotion, question.emotion);
    assert.notEqual(wrong.emotion, question.emotion);
  }
});

test("level 2 and level 3 offer three written options with an emoji", () => {
  for (const id of ["name", "situation"]) {
    const level = levelById(id);
    assert.equal(level.optionKind, "text");
    assert.equal(level.optionCount, 3);
    for (const question of level.questions) {
      for (const option of question.options) assert.ok(option.emoji);
    }
  }
});

test("level 4 asks what a gesture means with three written options", () => {
  const level = levelById("gesture");
  assert.equal(level.optionKind, "text");
  assert.equal(level.optionCount, 3);
  assert.equal(level.questionsPerRound, 5);
  assert.equal(level.shuffleOptions, true);
  assert.equal(level.imageQueryRequired, true);
  const ambiguous = level.questions.filter((question) => question.ambiguous === true);
  assert.equal(ambiguous.length, 1);
  assert.equal(ambiguous[0].id, "gesture-bracos-cruzados");
  for (const question of level.questions) {
    assert.equal(question.level, "gesture");
    assert.ok(question.imageQuery.length > 0);
    assert.ok(question.question.length > 0);
    assert.equal(question.options.length, 3);
    assert.equal(question.options.filter((option) => option.id === question.answer).length, 1);
    for (const option of question.options) assert.ok(option.text && option.emoji);
  }
});

test("levels with shuffleOptions present the same options in a different order", () => {
  const level = levelById("gesture");
  const session = createSession(level, () => 0.1);
  assert.equal(session.questions.length, 5);
  for (const question of session.questions) {
    const source = level.questions.find((item) => item.id === question.id);
    assert.deepEqual(
      question.options.map((option) => option.id).sort(),
      source.options.map((option) => option.id).sort(),
    );
  }
  const changed = session.questions.some((question) => {
    const source = level.questions.find((item) => item.id === question.id);
    return question.options.map((option) => option.id).join()
      !== source.options.map((option) => option.id).join();
  });
  assert.ok(changed, "pelo menos uma pergunta deve ter opções embaralhadas");
  const fixed = createSession(levelById("name"), () => 0.1);
  for (const question of fixed.questions) {
    const source = levelById("name").questions.find((item) => item.id === question.id);
    assert.deepEqual(question.options, source.options);
  }
});

test("a round picks five different questions and leaves the level untouched", () => {
  const level = levelById("name");
  const picked = pickQuestions(level.questions, 5, () => 0.5);
  assert.equal(picked.length, 5);
  assert.equal(new Set(picked.map((question) => question.id)).size, 5);
  assert.equal(level.questions.length, levelById("name").questions.length);
  assert.throws(() => pickQuestions(level.questions, level.questions.length + 1), RangeError);
});

test("two sessions can start from different questions", () => {
  const level = levelById("situation");
  const first = createSession(level, () => 0.1);
  const second = createSession(level, () => 0.9);
  assert.equal(first.rounds, 5);
  assert.equal(new Set(first.questions.map((question) => question.id)).size, 5);
  assert.notDeepEqual(
    first.questions.map((question) => question.id),
    second.questions.map((question) => question.id),
  );
});

test("incorrect answers stay retryable, reset each round and give a gentle hint", () => {
  const level = levelById("name");
  let state = createSession(level, () => 0.42);
  const question = state.questions[0];
  const wrong = question.options.find((option) => option.id !== question.answer).id;
  for (let count = 1; count <= 3; count += 1) {
    state = chooseAnswer(state, wrong);
    assert.equal(state.phase, "playing");
    assert.equal(state.mistakes, count);
    assert.equal(state.feedback, count % 2 === 1
      ? "Vamos olhar a imagem de novo?"
      : "Vamos tentar outra opção?");
  }
  state = chooseAnswer(state, question.answer);
  assert.equal(state.phase, "correct");
  assert.equal(state.selectedId, question.answer);
  assert.equal(chooseAnswer(state, wrong), state);
  state = nextRound(state);
  assert.equal(state.roundIndex, 1);
  assert.equal(state.mistakes, 0);
  assert.equal(state.selectedId, null);
});

test("a session finishes after five questions and never advances early", () => {
  const level = levelById("match");
  let state = createSession(level, () => 0.3);
  for (let index = 0; index < 5; index += 1) {
    assert.equal(state.roundIndex, index);
    assert.equal(nextRound(state), state);
    const question = state.questions[index];
    const wrong = question.options.find((option) => option.id !== question.answer).id;
    state = chooseAnswer(state, wrong);
    assert.equal(nextRound(state), state);
    state = chooseAnswer(state, question.answer);
    state = nextRound(state);
  }
  assert.equal(state.phase, "complete");
  assert.equal(state.roundIndex, 4);
});

test("validation warns about a missing answer and a missing explanation", () => {
  const level = structuredClone(levelById("name"));
  delete level.questions[0].explanation;
  level.questions[1].answer = "nao-existe";
  const problems = validateContent({ levels: [level] });
  assert.ok(problems.some((problem) => problem.includes("sem explicação")));
  assert.ok(problems.some((problem) => problem.includes("não está entre as opções")));
});

test("validation warns about an English image query, a missing query and a wrong option count", () => {
  const level = structuredClone(levelById("gesture"));
  level.questions[0].imageQuery = "finger on lips";
  level.questions[1].options.pop();
  delete level.questions[2].imageQuery;
  const problems = validateContent({ levels: [level] });
  assert.ok(problems.some((problem) => problem.includes("inglês")));
  assert.ok(problems.some((problem) => problem.includes("sem imageQuery")));
  assert.ok(problems.some((problem) => problem.includes("precisa de 3 opções")));
});

test("invalid sessions and unknown options are rejected", () => {
  const level = levelById("match");
  assert.throws(() => createSession({ ...level, optionCount: 1 }), TypeError);
  const state = createSession(level, () => 0.5);
  assert.throws(() => chooseAnswer(state, "nao-existe"), RangeError);
});
