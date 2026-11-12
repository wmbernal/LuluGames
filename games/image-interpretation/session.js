import { getSettings } from "../../shared/js/settings.js?v=2";
import { celebrateCompletion, playMismatchSound, speakCardName } from "../../shared/js/audio.js?v=6";
import { THEMES } from "./data.js?v=7";
import { chooseAnswer, createSession, nextRound } from "./game.js?v=4";
import { createGameUI } from "./ui.js?v=6";

const requestedTheme = new URLSearchParams(window.location.search).get("theme");
const theme = THEMES.find((item) => item.id === requestedTheme) ?? THEMES[0];
const rounds = theme.scenes.length;

let state = { phase: "intro" };
const ui = createGameUI({
  theme,
  rounds,
  isActive: () => state.phase === "playing" || state.phase === "correct",
  onStart() {
    state = createSession(theme.scenes, rounds);
    ui.reset();
    ui.render(state);
    ui.focusFirstAnswer();
  },
  onAnswer(optionId) {
    if (state.phase !== "playing") return;
    state = chooseAnswer(state, optionId);
    ui.render(state);
    if (state.phase === "correct") {
      const answer = state.scenes[state.roundIndex].options.find((option) => option.id === optionId);
      speakCardName(answer.text, getSettings());
      ui.focusNext();
    } else {
      void playMismatchSound(getSettings());
    }
  },
  onNext() {
    const wasComplete = state.phase === "complete";
    state = nextRound(state);
    ui.render(state);
    if (state.phase === "playing") ui.focusFirstAnswer();
    if (state.phase === "complete" && !wasComplete) void celebrateCompletion(getSettings());
  },
});

ui.render(state);
