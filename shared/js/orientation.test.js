import test from "node:test";
import assert from "node:assert/strict";
import {
  PORTRAIT_SCREEN_QUERY,
  markOrientationSuggested,
  markSelectionLink,
  consumeOrientationSuggestion,
  setupOrientationSuggestion,
  suggestLandscapeOnEntry,
} from "./orientation.js";

function createFixture(matches) {
  const media = new EventTarget();
  media.matches = matches;
  const dialog = new EventTarget();
  dialog.open = false;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => {
    dialog.open = false;
    dialog.dispatchEvent(new Event("close"));
  };
  const change = (nextMatches) => {
    media.matches = nextMatches;
    const event = new Event("change");
    event.matches = nextMatches;
    media.dispatchEvent(event);
  };
  return { media, dialog, change };
}

test("portrait entry suggests landscape and closes on rotation without reopening", () => {
  const { media, dialog, change } = createFixture(true);
  assert.equal(suggestLandscapeOnEntry(dialog, media), true);
  assert.equal(dialog.open, true);
  change(false);
  assert.equal(dialog.open, false);
  change(true);
  assert.equal(dialog.open, false);
});

test("continuing in portrait dismisses the suggestion for this entry", () => {
  const { media, dialog, change } = createFixture(true);
  suggestLandscapeOnEntry(dialog, media);
  dialog.close();
  change(false);
  change(true);
  assert.equal(dialog.open, false);
});

test("landscape or non-target entry does not show a later suggestion", () => {
  const { media, dialog, change } = createFixture(false);
  assert.equal(suggestLandscapeOnEntry(dialog, media), false);
  change(true);
  assert.equal(dialog.open, false);
});

test("the small-portrait query does not require a touch or coarse pointer", () => {
  assert.equal(PORTRAIT_SCREEN_QUERY, "(orientation: portrait) and (max-width: 1024px)");
});

test("the theme navigation signal is consumed without changing the selected theme", () => {
  const url = new URL("https://example.test/games/memory-pairs/index.html?theme=animais#board");
  markOrientationSuggested(url);
  assert.equal(consumeOrientationSuggestion(url), true);
  assert.equal(url.searchParams.get("theme"), "animais");
  assert.equal(url.hash, "#board");
  assert.equal(consumeOrientationSuggestion(url), false);
  assert.equal(url.searchParams.has("orientationSuggested"), false);
});

test("a direct game entry is not treated as an already shown suggestion", () => {
  const url = new URL("https://example.test/games/memory-pairs/index.html?theme=casa");
  assert.equal(consumeOrientationSuggestion(url), false);
  assert.equal(url.searchParams.get("theme"), "casa");
});

test("selection links carry the signal only when the suggestion was shown", () => {
  const link = { href: "https://example.test/games/emotions/index.html?level=match" };
  markSelectionLink(link, false);
  assert.equal(new URL(link.href).searchParams.has("orientationSuggested"), false);
  markSelectionLink(link, true);
  const url = new URL(link.href);
  assert.equal(url.searchParams.get("level"), "match");
  assert.equal(consumeOrientationSuggestion(url), true);
});

test("entry setup shows a dialog and consumes a selection signal without losing the level", () => {
  const media = new EventTarget();
  media.matches = true;
  const dialogs = [];
  const body = { append: (dialog) => dialogs.push(dialog) };
  const main = { setAttribute() {}, focus() {} };
  globalThis.document = {
    body,
    activeElement: body,
    querySelector: () => main,
    createElement() {
      const dialog = new EventTarget();
      dialog.open = false;
      dialog.setAttribute = () => {};
      dialog.showModal = () => { dialog.open = true; };
      dialog.close = () => {
        dialog.open = false;
        dialog.dispatchEvent(new Event("close"));
      };
      dialog.remove = () => {};
      return dialog;
    },
  };
  globalThis.window = {
    location: { href: "https://example.test/games/emotions/index.html?level=match" },
    history: { state: null, replaceState(_state, _title, url) { window.location.href = url; } },
    matchMedia: () => media,
  };
  try {
    assert.equal(setupOrientationSuggestion(), true);
    assert.equal(dialogs[0].open, true);
    dialogs[0].close();
    window.location.href += "&orientationSuggested=1";
    assert.equal(setupOrientationSuggestion(), false);
    assert.equal(dialogs.length, 1);
    assert.equal(new URL(window.location.href).searchParams.get("level"), "match");
    assert.equal(new URL(window.location.href).searchParams.has("orientationSuggested"), false);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});
