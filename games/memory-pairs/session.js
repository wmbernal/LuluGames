import { getSettings } from "../../shared/js/settings.js";
import { readStorage, writeStorage } from "../../shared/js/storage.js";
import { playPositiveSound } from "../../shared/js/audio.js";
import {
  createDeck,
  createGameState,
  endPeek,
  flipCard,
  getHintCardId,
  isGameFinished,
  resolveMismatch,
} from "./game.js";
import { MODES, REWARD_KEY } from "./data.js";
import { createGameUI } from "./ui.js";

const MISMATCH_DELAY_MS = 850;
const COMPLETION_DELAY_MS = 350;

let state = {
  phase: "setup",
  config: null,
  game: null,
  sessionRound: 1,
  sessionRounds: getSettings().roundsPerSession,
  sessionActive: false,
  rewardUnlocked: false,
  rewardAlreadyUnlocked: false,
  starlightBackUnlocked: readStorage(REWARD_KEY) === "true",
};
let timeoutId = null;

const ui = createGameUI({
  onStart: startSession,
  onFlip: handleCardFlip,
  onHint: showHint,
  onNext: advanceSession,
  shouldConfirmLeave: () => state.sessionActive,
}, state.sessionRounds);

function render() {
  ui.render(state);
}

function clearPendingTimeout() {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function startBoard() {
  clearPendingTimeout();
  const deck = createDeck(MODES[state.config.mode], state.config.pairCount);
  state.game = createGameState(deck, state.config.peekEnabled);
  state.phase = "playing";
  render();
  ui.focusFirstCard();

  if (state.game.phase === "peeking") {
    timeoutId = window.setTimeout(() => {
      state.game = endPeek(state.game);
      state.game = { ...state.game, feedback: "" };
      timeoutId = null;
      render();
      ui.focusFirstCard();
    }, state.config.peekSeconds * 1000);
  }
}

function startSession(config) {
  const starlightBackUnlocked = state.starlightBackUnlocked;
  state = {
    phase: "playing",
    config,
    game: null,
    sessionRound: 1,
    sessionRounds: getSettings().roundsPerSession,
    sessionActive: true,
    rewardUnlocked: false,
    rewardAlreadyUnlocked: false,
    starlightBackUnlocked,
  };
  startBoard();
}

function finishRound() {
  if (state.phase !== "playing" || !isGameFinished(state.game)) {
    return;
  }

  if (state.sessionRound === state.sessionRounds) {
    state.phase = "sessionComplete";
    state.sessionActive = false;
    state.rewardAlreadyUnlocked = readStorage(REWARD_KEY) === "true";
    state.rewardUnlocked = state.rewardAlreadyUnlocked || writeStorage(REWARD_KEY, "true");
    state.starlightBackUnlocked = state.rewardUnlocked;
    if (!state.rewardUnlocked) {
      console.error("Could not save the memory game card-back reward.");
    }
  } else {
    state.phase = "roundComplete";
  }
  render();
}

function handleCardFlip(cardId) {
  if (state.phase !== "playing") {
    return;
  }

  const previousMatchedPairs = state.game.matchedPairs;
  const nextGame = flipCard(state.game, cardId);
  if (nextGame === state.game) {
    return;
  }
  state.game = nextGame;
  render();

  if (state.game.matchedPairs > previousMatchedPairs) {
    void playPositiveSound(getSettings());
  }
  if (state.game.phase === "checking") {
    timeoutId = window.setTimeout(() => {
      state.game = resolveMismatch(state.game);
      timeoutId = null;
      render();
    }, MISMATCH_DELAY_MS);
  } else if (isGameFinished(state.game)) {
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      finishRound();
    }, COMPLETION_DELAY_MS);
  }
}

function showHint() {
  if (state.phase !== "playing" || ["checking", "peeking", "finished"].includes(state.game.phase)) {
    return;
  }
  state.game = {
    ...state.game,
    hintCardId: getHintCardId(state.game),
    feedback: "Uma carta de um par que ainda está escondido foi destacada.",
  };
  render();
}

function advanceSession() {
  if (state.phase === "sessionComplete") {
    startSession(state.config);
    return;
  }
  if (state.phase !== "roundComplete") {
    return;
  }
  state.sessionRound += 1;
  startBoard();
}

render();
