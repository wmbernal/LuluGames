import test from "node:test";
import assert from "node:assert/strict";
import {
  PORTRAIT_SCREEN_QUERY,
  markOrientationSuggested,
  consumeOrientationSuggestion,
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
