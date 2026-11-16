import test from "node:test";
import assert from "node:assert/strict";
import { focusGameOnEntry } from "./initial-focus.js";

test("short landscape starts at the status; other layouts focus the first control", () => {
  let matches = true;
  let statusFocused = 0;
  let controlFocused = 0;
  globalThis.window = { matchMedia: () => ({ matches }) };
  globalThis.document = {
    querySelector: (selector) => selector === "#round-count"
      ? { focus() { statusFocused += 1; } }
      : null,
  };
  try {
    focusGameOnEntry(() => { controlFocused += 1; });
    matches = false;
    focusGameOnEntry(() => { controlFocused += 1; });
    assert.equal(statusFocused, 1);
    assert.equal(controlFocused, 1);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});

test("initial focus waits for the orientation dialog to close", () => {
  const dialog = new EventTarget();
  let open = true;
  let focused = 0;
  globalThis.window = { matchMedia: () => ({ matches: false }) };
  globalThis.document = { querySelector: () => open ? dialog : null };
  try {
    focusGameOnEntry(() => { focused += 1; });
    assert.equal(focused, 0);
    open = false;
    dialog.dispatchEvent(new Event("close"));
    assert.equal(focused, 1);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});
