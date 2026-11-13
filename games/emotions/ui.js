const playing = document.querySelector("#playing-panel");
const complete = document.querySelector("#complete-panel");
const gameFooter = document.querySelector("#game-footer");
const roundCount = document.querySelector("#round-count");
const image = document.querySelector("#scene-image");
const questionText = document.querySelector("#question-text");
const answers = document.querySelector("#answer-list");
const feedback = document.querySelector("#feedback");
const hint = document.querySelector("#hint");
const explanation = document.querySelector("#explanation");
const explanationText = document.querySelector("#explanation-text");
const listenButton = document.querySelector("#listen-button");
const nextButton = document.querySelector("#next-button");
const completeMessage = document.querySelector("#complete-message");
const completeTitle = document.querySelector("#complete-title");
const againButton = document.querySelector("#again-button");
const leaveDialog = document.querySelector("#leave-dialog");
const levelsUrl = "./levels.html";
const HINT_AFTER_MISTAKES = 3;
let renderedQuestionId = null;
let pendingHref = null;

function createAnswer(level, option, onAnswer) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button answer";
  button.dataset.optionId = option.id;

  const mark = document.createElement("span");
  mark.className = "answer__mark";
  mark.setAttribute("aria-hidden", "true");

  if (level.optionKind === "image") {
    button.classList.add("answer--image");
    button.setAttribute("aria-label", option.alt);
    const picture = document.createElement("img");
    picture.src = option.image;
    picture.alt = "";
    picture.width = 480;
    picture.height = 360;
    button.append(picture, mark);
  } else {
    const label = document.createElement("span");
    label.className = "answer__text";
    label.textContent = option.text;
    button.append(mark);
    if (option.emoji) {
      const emoji = document.createElement("span");
      emoji.className = "answer__emoji";
      emoji.setAttribute("aria-hidden", "true");
      emoji.textContent = option.emoji;
      button.append(emoji);
    }
    button.append(label);
  }

  button.addEventListener("click", () => onAnswer(option.id));
  return button;
}

export function createGameUI(callbacks) {
  const { level } = callbacks;
  questionText.textContent = level.question;
  completeMessage.textContent =
    `Você completou as ${callbacks.rounds} perguntas de ${level.label}. Muito bem!`;
  answers.classList.toggle("answer-list--images", level.optionKind === "image");
  nextButton.addEventListener("click", callbacks.onNext);
  listenButton.addEventListener("click", callbacks.onReplayExplanation);
  againButton.addEventListener("click", callbacks.onRestart);

  document.querySelector("#back-button").addEventListener("click", () => {
    if (callbacks.isActive()) {
      pendingHref = levelsUrl;
      leaveDialog.showModal();
    } else {
      window.location.href = levelsUrl;
    }
  });
  for (const link of document.querySelectorAll("[data-home-link]")) {
    link.addEventListener("click", (event) => {
      if (callbacks.isActive()) {
        event.preventDefault();
        pendingHref = link.href;
        leaveDialog.showModal();
      }
    });
  }
  leaveDialog.addEventListener("close", () => {
    if (leaveDialog.returnValue === "leave") {
      window.location.href = pendingHref ?? levelsUrl;
    }
    pendingHref = null;
  });

  return {
    render(state) {
      playing.hidden = !["playing", "correct"].includes(state.phase);
      complete.hidden = state.phase !== "complete";
      gameFooter.hidden = state.phase === "complete";
      if (state.phase === "complete") {
        completeTitle.focus();
        return;
      }

      const question = state.questions[state.roundIndex];
      roundCount.textContent = `${level.label} · Pergunta ${state.roundIndex + 1} de ${state.rounds}`;

      if (renderedQuestionId !== question.id) {
        renderedQuestionId = question.id;
        image.src = question.image;
        image.alt = question.alt;
        answers.replaceChildren();
        for (const option of question.options) {
          answers.append(createAnswer(level, option, callbacks.onAnswer));
        }
        explanation.hidden = true;
        explanationText.textContent = "";
      }

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
      hint.textContent = showHint ? (question.hint ?? level.hint ?? "") : "";
      hint.hidden = !hint.textContent;

      const showExplanation = state.phase === "correct";
      explanation.hidden = !showExplanation;
      if (showExplanation) explanationText.textContent = question.explanation;
      nextButton.hidden = !showExplanation;
      nextButton.textContent = state.roundIndex + 1 === state.rounds ? "Ver o fim" : "Próxima";
    },
    focusNext() {
      nextButton.focus();
    },
    focusFirstAnswer() {
      answers.querySelector("button")?.focus();
    },
    resetRenderedQuestion() {
      renderedQuestionId = null;
    },
  };
}
