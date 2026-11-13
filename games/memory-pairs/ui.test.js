import test from "node:test";
import assert from "node:assert/strict";
import { THEMES } from "./data.js";
import { createMatchBoard, matchCards } from "./game.js";

class Element {
  constructor() {
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.classes = new Set();
    this.classList = {
      toggle: (name, enabled) => {
        if (enabled) this.classes.add(name);
        else this.classes.delete(name);
      },
      contains: (name) => this.classes.has(name),
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name),
    };
  }

  set className(value) {
    this.classes = new Set(value.split(/\s+/));
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  addEventListener(name, callback) {
    this.listeners[name] = callback;
  }

  append(...children) {
    this.children.push(...children);
  }

  replaceChildren(...children) {
    this.children = children;
  }

  querySelectorAll(selector) {
    return this.children.flatMap((child) => [
      ...(selector === ".match-card" && child.classes.has("match-card") ? [child] : []),
      ...child.querySelectorAll(selector),
    ]);
  }

  dispatch(name, event = {}) {
    this.listeners[name](event);
  }
}

test("incorrect click and drag matches clear selection; same-side selection still switches", async () => {
  const elements = new Map();
  globalThis.document = {
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, new Element());
      return elements.get(selector);
    },
    querySelectorAll() { return []; },
    createElement() { return new Element(); },
  };
  const { createGameUI } = await import("./ui.js");
  let game = createMatchBoard(THEMES[0], 0, () => 0.999);
  let ui;
  const render = () => ui.render({ phase: "playing", game, sessionRound: 1, sessionRounds: 3 });
  ui = createGameUI({
    theme: THEMES[0],
    onCardSelected() {},
    onNext() {},
    shouldConfirmLeave() { return true; },
    onMatch(first, second) {
      game = matchCards(game, first, second);
      render();
      return game.feedbackType === "positive" ? "matched" : game.feedbackType;
    },
  });
  assert.equal(elements.get("#back-button").textContent, "Temas");
  render();
  assert.equal(
    elements.get("#round-count").textContent,
    `Tema ${THEMES[0].label} · Partida 1 de 3 · 0 de 6 pares`,
  );
  const board = elements.get("#memory-board");
  const card = (id) => board.querySelectorAll(".match-card").find((button) => button.dataset.cardId === id);
  const selected = () => board.querySelectorAll(".match-card").filter(
    (button) => button.classList.contains("match-card--selected"),
  );
  const first = game.leftCards[0];
  const sameSide = game.leftCards[1];
  const wrong = game.rightCards.find((candidate) => candidate.pairId !== first.pairId);
  const correct = game.rightCards.find((candidate) => candidate.pairId === first.pairId);

  card(first.id).dispatch("click");
  card(sameSide.id).dispatch("click");
  assert.equal(selected()[0].dataset.cardId, sameSide.id);
  card(sameSide.id).dispatch("click");
  card(first.id).dispatch("click");
  card(wrong.id).dispatch("click");
  assert.equal(game.feedbackType, "incorrect");
  assert.equal(selected().length, 0);
  assert.equal(card(first.id).attributes["aria-pressed"], "false");
  assert.equal(card(wrong.id).attributes["aria-pressed"], "false");

  card(first.id).dispatch("click");
  card(wrong.id).dispatch("drop", {
    preventDefault() {},
    dataTransfer: { getData() { return first.id; } },
  });
  assert.equal(selected().length, 0);
  assert.equal(game.feedbackType, "incorrect");

  card(first.id).dispatch("click");
  card(correct.id).dispatch("click");
  assert.equal(game.feedbackType, "positive");
  assert.equal(game.matchedPairs, 1);
  assert.equal(selected().length, 0);
});
