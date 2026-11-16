import test from "node:test";
import assert from "node:assert/strict";
import { alignBoardOnLandscape } from "./landscape.js";

test("turning to a small landscape screen aligns the status and board once", () => {
  const media = new EventTarget();
  media.matches = false;
  const frames = [];
  const scrolls = [];
  const portrait = { matches: false };
  let dialog = null;
  const window = {
    scrollY: 100,
    document: { querySelector() { return dialog; } },
    matchMedia(query) { return query.includes("orientation: landscape") ? media : portrait; },
    requestAnimationFrame(callback) { frames.push(callback); },
    scrollTo(options) { scrolls.push(options); },
  };
  let allowed = true;
  alignBoardOnLandscape(window, { getBoundingClientRect: () => ({ top: 50 }) }, () => allowed);
  assert.equal(scrolls.length, 0);
  const change = (matches) => {
    media.matches = matches;
    const event = new Event("change");
    event.matches = matches;
    media.dispatchEvent(event);
    while (frames.length) frames.shift()();
  };
  change(true);
  assert.deepEqual(scrolls, [{ top: 142, behavior: "instant" }]);
  change(false);
  allowed = false;
  change(true);
  assert.equal(scrolls.length, 1);
  change(false);
  allowed = true;
  dialog = new EventTarget();
  change(true);
  assert.equal(scrolls.length, 1);
  const openDialog = dialog;
  dialog = null;
  openDialog.dispatchEvent(new Event("close"));
  while (frames.length) frames.shift()();
  assert.equal(scrolls.length, 2);
});
