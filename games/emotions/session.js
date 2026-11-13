import { getSettings } from "../../shared/js/settings.js?v=2";
import { celebrateCompletion, playMismatchSound, speakCardName } from "../../shared/js/audio.js?v=6";
import { chooseAnswer, createSession, nextRound, validateContent } from "./game.js?v=2";
import { createGameUI } from "./ui.js?v=2";

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
    console.warn("O conteúdo do Jogo das Emoções precisa de ajustes:", problems);
  }

  const level = content.levels.find((item) => item.id === requestedLevel) ?? content.levels[0];
  document.title = `${content.title} — ${level.label}`;
  document.querySelector("#game-title").textContent = level.heading ?? content.title;
  document.querySelector("#game-eyebrow").textContent = content.title;

  let state = createSession(level);
  const ui = createGameUI({
    level,
    rounds: state.rounds,
    isActive: () => state.phase === "playing" || state.phase === "correct",
    onAnswer(optionId) {
      if (state.phase !== "playing") return;
      state = chooseAnswer(state, optionId);
      ui.render(state);
      if (state.phase === "correct") {
        speakCardName(state.questions[state.roundIndex].explanation, getSettings());
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
    onReplayExplanation() {
      if (state.phase !== "correct") return;
      speakCardName(state.questions[state.roundIndex].explanation, getSettings());
    },
    onRestart() {
      state = createSession(level);
      ui.resetRenderedQuestion();
      ui.render(state);
      ui.focusFirstAnswer();
    },
  });

  ui.render(state);
  ui.focusFirstAnswer();
}

loadContent()
  .then(start)
  .catch((error) => {
    console.error("Não consegui abrir as perguntas do Jogo das Emoções.", error);
    loadError.hidden = false;
  });
