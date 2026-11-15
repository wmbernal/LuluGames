const playing = document.querySelector("#playing-panel");
const complete = document.querySelector("#complete-panel");
const gameFooter = document.querySelector("#game-footer");
const roundCount = document.querySelector("#round-count");
const image = document.querySelector("#scene-image");
const questionText = document.querySelector("#question-text");
const listenQuestionButton = document.querySelector("#listen-question-button");
const listenStatus = document.querySelector("#listen-status");
const answers = document.querySelector("#answer-list");
const feedback = document.querySelector("#feedback");
const hint = document.querySelector("#hint");
const practiceButton = document.querySelector("#practice-button");
const nextButton = document.querySelector("#next-button");
const completeMessage = document.querySelector("#complete-message");
const completeTitle = document.querySelector("#complete-title");
const againButton = document.querySelector("#again-button");
const leaveDialog = document.querySelector("#leave-dialog");
const menuUrl = "../../index.html";
const HINT_AFTER_MISTAKES = 3;
let renderedQuestionId = null;
let pendingHref = null;

export function createGameUI(callbacks) {
  completeMessage.textContent =
    `Você completou as ${callbacks.rounds} perguntas. Muito bem!`;
  nextButton.addEventListener("click", callbacks.onNext);
  listenQuestionButton.addEventListener("click", () => {
    listenStatus.hidden = callbacks.onListenQuestion();
  });
  practiceButton.addEventListener("click", callbacks.onPracticePhrase);
  againButton.addEventListener("click", callbacks.onRestart);

  for (const link of document.querySelectorAll("[data-home-link], [data-back-link]")) {
    link.addEventListener("click", (event) => {
      if (callbacks.isActive()) {
        event.preventDefault();
        pendingHref = link.href;
        callbacks.onLeavePrompt();
        leaveDialog.showModal();
      }
    });
  }
  leaveDialog.addEventListener("close", () => {
    if (leaveDialog.returnValue === "leave") {
      window.location.href = pendingHref ?? menuUrl;
    }
    pendingHref = null;
  });

  return {
    render(state) {
      listenStatus.hidden = true;
      playing.hidden = !["playing", "correct"].includes(state.phase);
      complete.hidden = state.phase !== "complete";
      gameFooter.hidden = state.phase === "complete";
      if (state.phase === "complete") {
        completeTitle.focus();
        return;
      }

      const question = state.questions[state.roundIndex];
      roundCount.textContent = `Pergunta ${state.roundIndex + 1} de ${state.rounds}`;
      questionText.textContent = question.question;

      if (renderedQuestionId !== question.id) {
        renderedQuestionId = question.id;
        image.src = question.image;
        image.alt = question.alt;
        answers.replaceChildren();
        for (const option of question.options) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "button answer";
          button.dataset.optionId = option.id;
          const mark = document.createElement("span");
          mark.className = "answer__mark";
          mark.setAttribute("aria-hidden", "true");
          const label = document.createElement("span");
          label.className = "answer__text";
          label.textContent = option.text;
          button.append(mark, label);
          button.addEventListener("click", () => callbacks.onAnswer(option.id));
          answers.append(button);
        }
      }

      listenQuestionButton.hidden = state.phase !== "playing";
      for (const button of answers.children) {
        const selected = button.dataset.optionId === state.selectedId;
        const correct = selected && state.phase === "correct";
        const incorrect = selected && state.phase === "playing";
        button.classList.toggle("answer--correct", correct);
        button.classList.toggle("answer--incorrect", incorrect);
        button.querySelector(".answer__mark").textContent = correct ? "✓" : incorrect ? "↻" : "";
        button.disabled = state.phase === "correct";
      }

      feedback.textContent = state.feedback;
      const showHint = state.mistakes >= HINT_AFTER_MISTAKES && state.phase === "playing";
      hint.textContent = showHint ? (question.hint ?? "") : "";
      hint.hidden = !hint.textContent;

      const showPractice = state.phase === "correct"
        && typeof question.practicePhrase === "string"
        && question.practicePhrase.trim().length > 0;
      practiceButton.hidden = !showPractice;
      nextButton.hidden = state.phase !== "correct";
      nextButton.textContent = state.roundIndex + 1 === state.rounds ? "Ver o fim" : "Próxima";
    },
    focusAfterAnswer() {
      (practiceButton.hidden ? nextButton : practiceButton).focus();
    },
    focusQuestion() {
      listenQuestionButton.focus();
    },
    showListenUnavailable() {
      listenStatus.hidden = false;
    },
    resetRenderedQuestion() {
      renderedQuestionId = null;
    },
  };
}
