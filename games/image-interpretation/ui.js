const intro = document.querySelector("#intro-panel");
const playing = document.querySelector("#playing-panel");
const complete = document.querySelector("#complete-panel");
const roundCount = document.querySelector("#round-count");
const image = document.querySelector("#scene-image");
const answers = document.querySelector("#answer-list");
const feedback = document.querySelector("#feedback");
const hint = document.querySelector("#hint");
const nextButton = document.querySelector("#next-button");
const leaveDialog = document.querySelector("#leave-dialog");
const themesUrl = "./themes.html";
let renderedSceneId = null;
let pendingHref = null;

export function createGameUI(callbacks) {
  document.querySelector("#intro-round-count").textContent = String(callbacks.rounds);
  document.querySelector("#intro-theme").textContent = callbacks.theme.label;
  document.querySelector("#complete-message").textContent =
    `Você completou o tema ${callbacks.theme.label}. Muito bem!`;
  document.querySelector("#start-button").addEventListener("click", callbacks.onStart);
  nextButton.addEventListener("click", callbacks.onNext);
  document.querySelector("#back-button").addEventListener("click", () => {
    if (callbacks.isActive()) {
      pendingHref = themesUrl;
      leaveDialog.showModal();
    } else {
      window.location.href = themesUrl;
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
      window.location.href = pendingHref ?? themesUrl;
    }
    pendingHref = null;
  });

  return {
    render(state) {
      intro.hidden = state.phase !== "intro";
      playing.hidden = !["playing", "correct"].includes(state.phase);
      complete.hidden = state.phase !== "complete";
      document.querySelector("#game-footer").hidden = state.phase === "complete";
      if (state.phase === "intro") return;
      if (state.phase === "complete") {
        document.querySelector("#complete-title").focus();
        return;
      }
      const scene = state.scenes[state.roundIndex];
      roundCount.textContent = `Tema ${callbacks.theme.label} · Exercício ${state.roundIndex + 1} de ${state.rounds}`;
      if (renderedSceneId !== scene.id || !answers.children.length) {
        renderedSceneId = scene.id;
        image.src = scene.image;
        image.alt = scene.alt;
        answers.replaceChildren();
        for (const option of scene.options) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "button answer";
          button.dataset.optionId = option.id;
          const mark = document.createElement("span");
          mark.className = "answer__mark";
          mark.setAttribute("aria-hidden", "true");
          const label = document.createElement("span");
          label.textContent = option.text;
          button.append(mark, label);
          button.addEventListener("click", () => callbacks.onAnswer(option.id));
          answers.append(button);
        }
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
      hint.textContent = state.mistakes >= 3 && state.phase === "playing" ? scene.hint : "";
      hint.hidden = !hint.textContent;
      nextButton.hidden = state.phase !== "correct";
    },
    focusNext() { nextButton.focus(); },
    focusFirstAnswer() { answers.querySelector("button")?.focus(); },
    reset() { renderedSceneId = null; },
  };
}
