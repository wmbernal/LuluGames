import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import {
  CATEGORIES,
  chooseAnswer,
  createSession,
  currentQuestion,
  nextRound,
  pickQuestions,
  shuffleQuestionOptions,
  validateContent,
} from "./game.js";

const content = JSON.parse(
  await readFile(new URL("./content.json", import.meta.url), "utf8"),
);

function seededRandom(seed = 1) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

test("content.json passes validation and has the five planned questions", () => {
  assert.deepEqual(validateContent(content), []);
  assert.equal(content.questions.length, 5);
  assert.equal(content.questionsPerRound, 5);
  assert.equal(content.optionCount, 3);
  assert.equal(content.shuffleOptions, true);
  assert.equal(content.imageQueryRequired, true);
  assert.equal("speakExplanation" in content, false);
  const categories = [...new Set(content.questions.map((question) => question.category))];
  assert.deepEqual(categories.sort(), [...CATEGORIES].sort());
});

test("every question has one correct option, a practice phrase and a local image", async () => {
  const ids = new Set();
  for (const question of content.questions) {
    assert.ok(!ids.has(question.id), `id repetido: ${question.id}`);
    ids.add(question.id);
    assert.equal(question.options.length, 3);
    assert.equal(question.options.filter((option) => option.id === question.answer).length, 1);
    assert.equal("explanation" in question, false);
    assert.ok(question.imageQuery.length > 0);
    assert.ok(question.practicePhrase.length > 0);
    const correct = question.options.find((option) => option.id === question.answer);
    assert.ok(correct.text.includes(question.practicePhrase));
    await access(new URL(question.image, import.meta.url));
  }
});

test("a round uses every question once in a random order", () => {
  const first = createSession(content, seededRandom(7));
  const second = createSession(content, seededRandom(99));
  assert.equal(first.rounds, 5);
  assert.deepEqual(
    new Set(first.questions.map((question) => question.id)),
    new Set(content.questions.map((question) => question.id)),
  );
  assert.notDeepEqual(
    first.questions.map((question) => question.id),
    second.questions.map((question) => question.id),
  );
  for (const question of first.questions) {
    assert.equal(question.options.length, 3);
    assert.ok(question.options.some((option) => option.id === question.answer));
  }
});

test("shuffling options keeps every option and the correct answer", () => {
  const question = content.questions[0];
  const shuffled = shuffleQuestionOptions(question, seededRandom(3));
  assert.notEqual(shuffled, question);
  assert.deepEqual(
    new Set(shuffled.options.map((option) => option.id)),
    new Set(question.options.map((option) => option.id)),
  );
  assert.ok(shuffled.options.some((option) => option.id === shuffled.answer));
});

test("wrong answers keep the round going and correct answers advance it", () => {
  const state = createSession(content, seededRandom(5));
  const question = currentQuestion(state);
  const wrong = question.options.find((option) => option.id !== question.answer).id;

  const afterWrong = chooseAnswer(state, wrong);
  assert.equal(afterWrong.phase, "playing");
  assert.equal(afterWrong.mistakes, 1);
  assert.ok(afterWrong.feedback.length > 0);

  const afterCorrect = chooseAnswer(afterWrong, question.answer);
  assert.equal(afterCorrect.phase, "correct");
  assert.equal(afterCorrect.selectedId, question.answer);

  const advanced = nextRound(afterCorrect);
  assert.equal(advanced.phase, "playing");
  assert.equal(advanced.roundIndex, 1);
  assert.equal(advanced.mistakes, 0);
  assert.equal(advanced.selectedId, null);
});

test("the last correct answer completes the round", () => {
  let state = createSession(content, seededRandom(11));
  while (state.phase !== "complete") {
    const question = currentQuestion(state);
    state = chooseAnswer(state, question.answer);
    state = nextRound(state);
  }
  assert.equal(state.phase, "complete");
  assert.equal(state.roundIndex, 4);
});

test("validation warns about a missing answer and practice phrase", () => {
  const broken = structuredClone(content);
  broken.questions[1].answer = "nao-existe";
  broken.questions[2].practicePhrase = "Uma frase que não está na opção";
  const problems = validateContent(broken);
  assert.ok(problems.some((problem) => problem.includes("não está entre as opções")));
  assert.ok(problems.some((problem) => problem.includes("frase de treino")));
});

test("validation warns about an English query, a missing query, a wrong option count and an unknown category", () => {
  const broken = structuredClone(content);
  broken.questions[0].imageQuery = "child opening cookie package";
  broken.questions[1].options.pop();
  delete broken.questions[2].imageQuery;
  broken.questions[3].category = "conversar";
  const problems = validateContent(broken);
  assert.ok(problems.some((problem) => problem.includes("inglês")));
  assert.ok(problems.some((problem) => problem.includes("sem imageQuery")));
  assert.ok(problems.some((problem) => problem.includes("precisa de 3 opções")));
  assert.ok(problems.some((problem) => problem.includes("categoria desconhecida")));
});

test("invalid content and unknown options are rejected", () => {
  assert.throws(() => createSession({ ...content, questions: [] }), TypeError);
  const state = createSession(content, seededRandom(1));
  assert.throws(() => chooseAnswer(state, "nao-existe"), RangeError);
});

test("pickQuestions refuses to pick more questions than exist", () => {
  assert.throws(() => pickQuestions(content.questions, 6), RangeError);
  assert.equal(pickQuestions(content.questions, 5).length, 5);
});
