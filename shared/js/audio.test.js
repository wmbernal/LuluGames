import test from "node:test";
import assert from "node:assert/strict";
import { playMismatchSound } from "./audio.js";

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
