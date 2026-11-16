import test from "node:test";
import assert from "node:assert/strict";
import { suggestLandscapeOnEntry } from "./orientation.js";

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
  suggestLandscapeOnEntry(dialog, media);
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
  suggestLandscapeOnEntry(dialog, media);
  change(true);
  assert.equal(dialog.open, false);
});
