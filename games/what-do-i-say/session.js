import { getSettings } from "../../shared/js/settings.js?v=2";
import { celebrateCompletion, playMismatchSound, speakCardName } from "../../shared/js/audio.js?v=8";
import { chooseAnswer, createSession, currentQuestion, nextRound, validateContent } from "./game.js?v=2";
import { createGameUI } from "./ui.js?v=4";

const loadError = document.querySelector("#load-error");
let completionId = 0;
let questionSpeechId = 0;

async function loadContent() {
  const response = await fetch("./content.json", { cache: "no-cache" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function speak(text, onSpeechError) {
  if (!text) return false;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  return speakCardName(text, getSettings(), undefined, onSpeechError);
}

function stopSpeech() {
  questionSpeechId += 1;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function start(content) {
  const problems = validateContent(content);
  if (problems.length > 0) {
    console.warn("O conteúdo de O que eu digo? precisa de ajustes:", problems);
  }

  document.title = `${content.title} — Lulu Games`;
  document.querySelector("#game-title").textContent = content.heading ?? content.title;
  document.querySelector("#game-eyebrow").textContent = content.eyebrow ?? content.title;

  let state = createSession(content);
  const ui = createGameUI({
    content,
    rounds: state.rounds,
    isActive: () => state.phase === "playing" || state.phase === "correct",
    onAnswer(optionId) {
      if (state.phase !== "playing") return;
      stopSpeech();
      state = chooseAnswer(state, optionId);
      ui.render(state);
      if (state.phase === "correct") {
        ui.focusAfterAnswer();
      } else {
        void playMismatchSound(getSettings());
      }
    },
    onNext() {
      const wasComplete = state.phase === "complete";
      stopSpeech();
      state = nextRound(state);
      ui.render(state);
      if (state.phase === "playing") ui.focusQuestion();
      if (state.phase === "complete" && !wasComplete) {
        const currentCompletionId = ++completionId;
        void celebrateCompletion(getSettings(), () => currentCompletionId === completionId);
      }
    },
    onListenQuestion() {
      if (state.phase !== "playing") return false;
      const question = currentQuestion(state);
      const speechId = ++questionSpeechId;
      return speak(question.question, () => {
        if (speechId === questionSpeechId
          && state.phase === "playing"
          && currentQuestion(state).id === question.id) {
          ui.showListenUnavailable();
        }
      });
    },
    onLeavePrompt() {
      stopSpeech();
    },
    onPracticePhrase() {
      if (state.phase !== "correct") return;
      speak(currentQuestion(state).practicePhrase);
    },
    onRestart() {
      completionId += 1;
      stopSpeech();
      state = createSession(content);
      ui.resetRenderedQuestion();
      ui.render(state);
      ui.focusQuestion();
    },
  });

  ui.render(state);
  ui.focusQuestion();
}

loadContent()
  .then(start)
  .catch((error) => {
    console.error("Não consegui abrir as perguntas de O que eu digo?.", error);
    loadError.hidden = false;
  });
