import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { gameCatalog } from "./catalog.js?v=11";

const expectedRoutes = {
  "dress-princess": "./games/dress-princess/index.html",
  "memory-pairs": "./games/memory-pairs/themes.html",
  "image-interpretation": "./games/image-interpretation/themes.html",
  emotions: "./games/emotions/levels.html",
  "what-do-i-say": "./games/what-do-i-say/index.html",
  "put-in-order": "./games/put-in-order/levels.html",
};

test("the six implemented games have short labels and existing routes and icons", async () => {
  assert.deepEqual(Object.fromEntries(gameCatalog.map(({ id, href }) => [id, href])), expectedRoutes);
  assert.equal(gameCatalog.find(({ id }) => id === "dress-princess").hidden, true);
  for (const game of gameCatalog) {
    assert.equal(game.available, true);
    if (game.id !== "dress-princess") assert.notEqual(game.hidden, true);
    assert.ok(game.title);
    assert.match(game.color, /^var\(--color-[a-z-]+\)$/);
    assert.ok(game.label.trim().split(/\s+/).length <= 3);
    await access(new URL(`../../${game.href}`, import.meta.url));
    await access(new URL(`../../${game.icon}`, import.meta.url));
  }
});

test("home renders configured links, hidden entries and unavailable games", async () => {
  class Element {
    constructor(tag) {
      this.tag = tag;
      this.children = [];
      this.attributes = {};
      this.style = { setProperty: (name, value) => { this.style[name] = value; } };
      this.classList = { add: (value) => { this.className += ` ${value}`; } };
    }
    setAttribute(name, value) { this.attributes[name] = value; }
    append(...children) { this.children.push(...children); }
  }

  const catalog = new Element("div");
  const stored = new Map();
  globalThis.document = {
    documentElement: { dataset: {} },
    querySelector: () => catalog,
    createElement: (tag) => new Element(tag),
  };
  globalThis.window = {
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    },
  };
  const future = { id: "future", title: "Novo Jogo", label: "Novo", color: "var(--color-surface-soft)", icon: "future.svg", available: false };
  gameCatalog.push({ ...future, hidden: true }, future);
  try {
    await import("./home.js");
    assert.equal(catalog.children.length, 6);
    const visibleGames = gameCatalog.slice(0, 6).filter((game) => !game.hidden);
    assert.equal(visibleGames.length, 5);
    for (const [index, game] of visibleGames.entries()) {
      const tile = catalog.children[index];
      assert.equal(tile.tag, "a");
      assert.equal(tile.href, game.href);
      assert.equal(tile.attributes["aria-label"], undefined);
      assert.equal(tile.children[1].textContent, game.label);
      assert.equal(tile.children[0].children[0].src, game.icon);
      assert.equal(tile.children.length, 2);
    }
    const disabled = catalog.children[5];
    assert.equal(disabled.tag, "button");
    assert.equal(disabled.disabled, true);
    assert.equal(disabled.attributes["aria-label"], undefined);
    assert.equal(disabled.children[2].textContent, "Em breve");
    assert.equal(document.documentElement.dataset.animations, "on");
  } finally {
    gameCatalog.splice(-2);
    delete globalThis.window;
    delete globalThis.document;
  }
});

test("each menu entry retains a route back to the home page", async () => {
  for (const href of Object.values(expectedRoutes)) {
    const html = await readFile(new URL(`../../${href}`, import.meta.url), "utf8");
    assert.match(html, /href=["']\.\.\/\.\.\/index\.html(?:[?#][^"']*)?["']/);
  }
});
