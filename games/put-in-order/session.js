import { getSettings } from "../../shared/js/settings.js?v=2";
import {
  celebrateCompletion,
  playMismatchSound,
  speakCardName,
} from "../../shared/js/audio.js?v=7";
import {
  createSession,
  nextRound,
  placeWord,
  validateContent,
} from "./game.js?v=2";
import { createGameUI } from "./ui.js?v=3";

const requestedLevel = new URLSearchParams(window.location.search).get("level");
const loadError = document.querySelector("#load-error");

async function loadContent() {
  const response = await fetch("./content.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function start(content) {
  const problems = validateContent(content);
  if (problems.length > 0) {
    console.warn("O conteúdo de Coloque em Ordem precisa de ajustes:", problems);
  }

  const level = content.levels.find((item) => item.id === requestedLevel) ?? content.levels[0];
  document.title = `${content.title} — ${level.label}`;
  document.querySelector("#game-title").textContent = level.label;
  document.querySelector("#game-eyebrow").textContent = content.title;

  let state = createSession(level);
  const ui = createGameUI({
    level,
    rounds: state.rounds,
    isActive: () => state.phase === "playing" || state.phase === "correct",
    onPlace(wordIndex, slotIndex) {
      if (state.phase !== "playing") return;
      const question = state.questions[state.roundIndex];
      const settings = getSettings();
      state = placeWord(state, wordIndex, slotIndex);
      const feedbackKind = state.feedbackKind;
      const speechStarted = speakCardName(question.words[wordIndex], settings, () => {
        if (feedbackKind === "error") void playMismatchSound(settings);
      });
      ui.render(state);
      if (feedbackKind === "error" && !speechStarted) {
        void playMismatchSound(settings);
      } else if (state.phase === "correct") {
        speakCardName(question.sentence, settings);
        ui.focusNext();
      }
    },
    onNext() {
      const wasComplete = state.phase === "complete";
      state = nextRound(state);
      ui.render(state);
      if (state.phase === "playing") ui.focusFirstWord();
      if (state.phase === "complete" && !wasComplete) void celebrateCompletion(getSettings());
    },
    onReplaySentence() {
      if (state.phase !== "correct") return;
      speakCardName(state.questions[state.roundIndex].sentence, getSettings());
    },
    onRestart() {
      state = createSession(level);
      ui.render(state);
      ui.focusFirstWord();
    },
  });

  ui.render(state);
  ui.focusFirstWord();
}

loadContent()
  .then(start)
  .catch((error) => {
    console.error("Não consegui abrir as perguntas de Coloque em Ordem.", error);
    loadError.hidden = false;
  });
