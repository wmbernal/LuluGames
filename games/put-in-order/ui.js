import { currentQuestion, findNextEmptySlot } from "./game.js?v=2";

const playing = document.querySelector("#playing-panel");
const gamePage = document.querySelector(".game-page");
const complete = document.querySelector("#complete-panel");
const gameFooter = document.querySelector("#game-footer");
const roundCount = document.querySelector("#round-count");
const image = document.querySelector("#scene-image");
const slots = document.querySelector("#sequence-slots");
const wordBank = document.querySelector("#word-bank");
const sentenceResult = document.querySelector("#sentence-result");
const feedback = document.querySelector("#feedback");
const sentenceComplete = document.querySelector("#sentence-complete");
const listenButton = document.querySelector("#listen-button");
const nextButton = document.querySelector("#next-button");
const completeMessage = document.querySelector("#complete-message");
const completeTitle = document.querySelector("#complete-title");
const againButton = document.querySelector("#again-button");
const leaveDialog = document.querySelector("#leave-dialog");
const levelsUrl = "./levels.html";
let renderedQuestionId = null;
let pendingHref = null;
let pointerDrag = null;
let dragPreview = null;
let suppressWordBankClick = false;

function clearPointerDrag() {
  pointerDrag?.button.classList.remove("word-bank__item--dragging");
  dragPreview?.remove();
  dragPreview = null;
  pointerDrag = null;
}

function createWordButton(word, wordIndex, state, onPlace) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button word-bank__item";
  button.dataset.wordIndex = String(wordIndex);
  button.textContent = word;
  button.setAttribute("aria-label", word);
  button.setAttribute("aria-description", "Ative para colocar no próximo espaço vazio.");
  button.classList.toggle(
    "word-bank__item--incorrect",
    state.feedbackKind === "error" && state.lastAttempt?.wordIndex === wordIndex,
  );
  button.addEventListener("click", (event) => {
    if (suppressWordBankClick && event.detail > 0) {
      suppressWordBankClick = false;
      event.preventDefault();
      return;
    }
    const slotIndex = findNextEmptySlot(state.placements);
    if (slotIndex >= 0) onPlace(wordIndex, slotIndex);
  });
  button.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || state.phase !== "playing") return;
    suppressWordBankClick = false;
    pointerDrag = {
      button,
      pointerId: event.pointerId,
      wordIndex,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener("pointermove", (event) => {
    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - pointerDrag.startX, event.clientY - pointerDrag.startY);
    if (distance < 8 && !pointerDrag.moved) return;
    pointerDrag.moved = true;
    button.classList.add("word-bank__item--dragging");
    if (!dragPreview) {
      dragPreview = document.createElement("span");
      dragPreview.className = "drag-preview";
      dragPreview.setAttribute("aria-hidden", "true");
      document.body.append(dragPreview);
    }
    dragPreview.textContent = word;
    dragPreview.style.left = `${event.clientX + 12}px`;
    dragPreview.style.top = `${event.clientY + 12}px`;
    event.preventDefault();
  });
  button.addEventListener("pointerup", (event) => {
    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
    const completedDrag = pointerDrag;
    if (completedDrag.moved) {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const slot = target?.closest(".sequence-slot");
      if (slot && !slot.classList.contains("sequence-slot--filled")) {
        onPlace(completedDrag.wordIndex, Number(slot.dataset.slotIndex));
      }
      suppressWordBankClick = true;
    }
    clearPointerDrag();
  });
  button.addEventListener("pointercancel", clearPointerDrag);
  button.addEventListener("lostpointercapture", clearPointerDrag);
  return button;
}

function createSlot(question, state, slotIndex) {
  const slot = document.createElement("div");
  slot.className = "sequence-slot";
  slot.dataset.slotIndex = String(slotIndex);
  const wordIndex = state.placements[slotIndex];
  const number = document.createElement("span");
  number.className = "sequence-slot__number";
  number.textContent = String(slotIndex + 1);
  slot.append(number);

  if (wordIndex === null) {
    slot.classList.add("sequence-slot--empty");
    if (state.feedbackKind === "error" && state.lastAttempt?.slotIndex === slotIndex) {
      slot.classList.add("sequence-slot--incorrect");
    }
    const placeholder = document.createElement("span");
    placeholder.className = "sequence-slot__placeholder";
    placeholder.textContent = "Vazio";
    slot.append(placeholder);
    slot.setAttribute("role", "group");
    slot.setAttribute("aria-label", `Posição ${slotIndex + 1}, vazia.`);
  } else {
    slot.classList.add("sequence-slot--filled");
    const label = document.createElement("span");
    label.className = "sequence-slot__word";
    label.textContent = question.words[wordIndex];
    const mark = document.createElement("span");
    mark.className = "sequence-slot__mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "✓";
    slot.append(label, mark);
    slot.setAttribute("role", "group");
    slot.setAttribute("aria-label", `Posição ${slotIndex + 1}: ${question.words[wordIndex]}, correta.`);
  }
  return slot;
}

export function createGameUI(callbacks) {
  const { level } = callbacks;
  completeMessage.textContent =
    `Você organizou as ${callbacks.rounds} sequências do ${level.label}. Muito bem!`;
  nextButton.addEventListener("click", callbacks.onNext);
  listenButton.addEventListener("click", callbacks.onReplaySentence);
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
      playing.classList.toggle("playing-panel--correct", state.phase === "correct");
      gamePage.classList.toggle("game-page--correct", state.phase === "correct");
      complete.hidden = state.phase !== "complete";
      gameFooter.hidden = state.phase === "complete";
      if (state.phase === "complete") {
        completeTitle.focus();
        return;
      }

      const question = currentQuestion(state);
      roundCount.textContent = `${level.label} · Pergunta ${state.roundIndex + 1} de ${state.rounds}`;
      if (renderedQuestionId !== question.id) {
        renderedQuestionId = question.id;
        image.src = question.image;
        image.alt = question.alt;
      }

      const focusedWordIndex = wordBank.contains(document.activeElement)
        ? document.activeElement.dataset.wordIndex
        : null;
      slots.replaceChildren(...question.words.map((_, index) => createSlot(question, state, index)));
      slots.style.setProperty("--slot-count", String(question.words.length));
      wordBank.replaceChildren();
      state.bankOrder.forEach((wordIndex) => {
        const word = question.words[wordIndex];
        if (!state.placements.includes(wordIndex)) {
          wordBank.append(createWordButton(word, wordIndex, state, callbacks.onPlace));
        }
      });

      feedback.textContent = state.phase === "correct" ? "" : state.feedback;
      feedback.classList.toggle("feedback--error", state.feedbackKind === "error");
      feedback.classList.toggle("feedback--success", state.feedbackKind === "success");
      sentenceComplete.hidden = state.phase !== "correct";
      if (state.phase === "correct") {
        sentenceResult.textContent = question.sentence;
      }
      nextButton.hidden = state.phase !== "correct";
      nextButton.textContent = state.roundIndex + 1 === state.rounds ? "Ver o fim" : "Próxima";
      if (focusedWordIndex !== null) {
        const focusTarget = [...wordBank.querySelectorAll("button")]
          .find((button) => button.dataset.wordIndex === focusedWordIndex)
          ?? wordBank.querySelector("button");
        focusTarget?.focus();
      }
    },
    focusNext() {
      nextButton.focus();
    },
    focusFirstWord() {
      wordBank.querySelector("button")?.focus();
    },
  };
}
