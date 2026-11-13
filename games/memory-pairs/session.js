import { getSettings } from "../../shared/js/settings.js?v=2";
import {
  playMatchBellSound,
  playMatchCompletionBellSound,
  playMismatchSound,
  speakCardName,
} from "../../shared/js/audio.js?v=5";
import { createMatchBoard, isGameFinished, matchCards } from "./game.js?v=5";
import { getTheme } from "./data.js?v=4";
import { createGameUI } from "./ui.js?v=7";

const COMPLETION_DELAY_MS = 350;
const selectedTheme = getTheme(new URLSearchParams(window.location.search).get("theme"));

let state = {
  phase: "playing",
  game: null,
  sessionRound: 1,
  sessionRounds: getSettings().roundsPerSession,
  sessionActive: true,
};
let timeoutId = null;

const ui = createGameUI({
  onMatch: handleMatch,
  onCardSelected: (label) => speakCardName(label, getSettings()),
  onNext: advanceSession,
  shouldConfirmLeave: () => state.sessionActive,
  theme: selectedTheme,
});

function render() {
  ui.render(state);
}

function startBoard() {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId);
    timeoutId = null;
  }
  state.game = createMatchBoard(selectedTheme, state.sessionRound - 1);
  state.phase = "playing";
  render();
  ui.focusFirstCard();
}

function finishRound() {
  if (state.phase !== "playing" || !isGameFinished(state.game)) {
    return;
  }
  void playMatchCompletionBellSound(getSettings());
  state.phase = state.sessionRound === state.sessionRounds ? "sessionComplete" : "roundComplete";
  if (state.phase === "sessionComplete") {
    state.sessionActive = false;
  }
  render();
}

function handleMatch(firstCardId, secondCardId) {
  if (state.phase !== "playing") {
    return "ignored";
  }
  const previousMatchedPairs = state.game.matchedPairs;
  state.game = matchCards(state.game, firstCardId, secondCardId);
  render();

  if (state.game.matchedPairs > previousMatchedPairs) {
    void playMatchBellSound(getSettings());
    if (isGameFinished(state.game)) {
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        finishRound();
      }, COMPLETION_DELAY_MS);
    }
    return "matched";
  }
  if (state.game.feedbackType === "incorrect") {
    void playMismatchSound(getSettings());
  }
  return state.game.feedbackType;
}

function advanceSession() {
  if (state.phase === "sessionComplete") {
    state.sessionRound = 1;
    state.sessionRounds = getSettings().roundsPerSession;
    state.sessionActive = true;
  } else if (state.phase === "roundComplete") {
    state.sessionRound += 1;
  } else {
    return;
  }
  startBoard();
}

startBoard();
