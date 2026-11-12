import { getSettings } from "../../shared/js/settings.js?v=2";
import { playMismatchSound, speakCardName } from "../../shared/js/audio.js?v=5";
import { SCENES } from "./data.js?v=2";
import { chooseAnswer, createSession, nextRound } from "./game.js?v=2";
import { createGameUI } from "./ui.js?v=3";

let state = { phase: "intro" };
const ui = createGameUI({
  rounds: getSettings().roundsPerSession,
  isActive: () => state.phase === "playing" || state.phase === "correct",
  onStart() {
    state = createSession(SCENES, getSettings().roundsPerSession);
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
    state = nextRound(state);
    ui.render(state);
    if (state.phase === "playing") ui.focusFirstAnswer();
  },
});

ui.render(state);
