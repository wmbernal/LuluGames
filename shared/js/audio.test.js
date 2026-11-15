import test from "node:test";
import assert from "node:assert/strict";
import { celebrateCompletion, playMismatchSound, speakCardName } from "./audio.js";

test("mismatch sound plays a distinct descending bell and respects sound settings", async () => {
  const frequencies = [];
  const gains = [];
  globalThis.window = {
    AudioContext: class {
      constructor() {
        this.state = "running";
        this.currentTime = 0;
        this.destination = {};
      }

      createOscillator() {
        return {
          frequency: { setValueAtTime(value) { frequencies.push(value); } },
          connect() {},
          start() {},
          stop() {},
        };
      }

      createGain() {
        return {
          gain: {
            setValueAtTime(value) { gains.push(value); },
            exponentialRampToValueAtTime() {},
          },
          connect() {},
        };
      }
    },
  };

  await playMismatchSound({ soundEnabled: false, soundVolume: 0.1 });
  await playMismatchSound({ soundEnabled: true, soundVolume: 0 });
  assert.equal(frequencies.length, 0);

  await playMismatchSound({ soundEnabled: true, soundVolume: 0.1 });
  assert.equal(frequencies.length, 6);
  assert.equal(frequencies[0], 587);
  assert.equal(frequencies[3], 392);
  assert.ok(gains.every((gain) => gain > 0));
});

test("completion speech is skipped when the completion is no longer current", async () => {
  const originalSetTimeout = globalThis.setTimeout;
  const originalWindow = globalThis.window;
  globalThis.setTimeout = (callback) => {
    callback();
    return 0;
  };
  globalThis.window = {
    AudioContext: class {
      constructor() {
        this.state = "running";
        this.currentTime = 0;
        this.destination = {};
      }

      createOscillator() {
        return {
          frequency: { setValueAtTime() {} },
          connect() {},
          start() {},
          stop() {},
        };
      }

      createGain() {
        return {
          gain: {
            setValueAtTime() {},
            exponentialRampToValueAtTime() {},
          },
          connect() {},
        };
      }
    },
  };

  try {
    const result = await celebrateCompletion(
      { soundEnabled: true, soundVolume: 0.1 },
      () => false,
    );
    assert.equal(result, false);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.window = originalWindow;
  }
});

test("speech errors invoke the optional error callback once", () => {
  const originalWindow = globalThis.window;
  const listeners = new Map();
  globalThis.window = {
    SpeechSynthesisUtterance: class {
      addEventListener(event, callback) {
        listeners.set(event, callback);
      }
    },
    speechSynthesis: { speak() {} },
  };
  let completed = 0;
  let errors = 0;

  try {
    assert.equal(
      speakCardName(
        "Pergunta",
        { soundEnabled: true, soundVolume: 0.1 },
        () => { completed += 1; },
        () => { errors += 1; },
      ),
      true,
    );
    listeners.get("error")();
    listeners.get("end")();
    assert.equal(completed, 1);
    assert.equal(errors, 1);
  } finally {
    globalThis.window = originalWindow;
  }
});
