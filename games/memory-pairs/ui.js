import { MODES, PAIR_COUNTS, SESSION_CONFIG_KEY } from "./data.js";
import { readStorage, writeStorage } from "../../shared/js/storage.js";

const setupPanel = document.querySelector("#setup-panel");
const playingPanel = document.querySelector("#playing-panel");
const completePanel = document.querySelector("#complete-panel");
const setupForm = document.querySelector("#setup-form");
const boardElement = document.querySelector("#memory-board");
const roundCountElement = document.querySelector("#round-count");
const instructionsElement = document.querySelector("#round-instructions");
const feedbackElement = document.querySelector("#memory-feedback");
const hintButton = document.querySelector("#hint-button");
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const homeLinks = document.querySelectorAll("[data-home-link]");
const leaveDialog = document.querySelector("#leave-dialog");
const sessionNote = document.querySelector("#session-note");

function readSavedConfig() {
  const savedValue = readStorage(SESSION_CONFIG_KEY);
  if (!savedValue) {
    return { mode: "identical", pairCount: 3, peekEnabled: false, peekSeconds: 3 };
  }
  try {
    const config = JSON.parse(savedValue);
    if (
      Object.hasOwn(MODES, config.mode)
      && PAIR_COUNTS.includes(config.pairCount)
      && typeof config.peekEnabled === "boolean"
      && [3, 5].includes(config.peekSeconds)
    ) {
      return config;
    }
    console.warn("Saved memory game settings are invalid. Default settings will be used.");
  } catch (error) {
    console.warn("Saved memory game settings could not be parsed.", error);
  }
  return { mode: "identical", pairCount: 3, peekEnabled: false, peekSeconds: 3 };
}

function getConfig() {
  const formData = new FormData(setupForm);
  return {
    mode: formData.get("mode"),
    pairCount: Number(formData.get("pairCount")),
    peekEnabled: formData.get("peekEnabled") === "on",
    peekSeconds: Number(formData.get("peekSeconds")),
  };
}

function saveConfig() {
  const config = getConfig();
  const isSaved = writeStorage(SESSION_CONFIG_KEY, JSON.stringify(config));
  document.querySelector("#setup-status").textContent = isSaved
    ? "Sua escolha foi guardada."
    : "Sua escolha vale nesta visita, mas não pode ser guardada neste navegador.";
  return config;
}

function applyConfig(config) {
  setupForm.elements.mode.value = config.mode;
  setupForm.elements.pairCount.value = String(config.pairCount);
  setupForm.elements.peekEnabled.checked = config.peekEnabled;
  setupForm.elements.peekSeconds.value = String(config.peekSeconds);
}

function focusAdjacentCard(cards, currentIndex, columnCount, key) {
  const directions = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
  };
  const [rowDelta, columnDelta] = directions[key];
  const rowCount = Math.ceil(cards.length / columnCount);
  let row = Math.floor(currentIndex / columnCount) + rowDelta;
  let column = (currentIndex % columnCount) + columnDelta;

  while (row >= 0 && row < rowCount && column >= 0 && column < columnCount) {
    const target = cards[row * columnCount + column];
    if (target && !target.disabled) {
      target.focus();
      return;
    }
    row += rowDelta;
    column += columnDelta;
  }
}

function renderCards(state) {
  const currentCardId = document.activeElement?.dataset.cardId;
  const cardCount = state.cards.length;
  const columnCount = cardCount === 6 ? 3 : 4;
  boardElement.dataset.columns = String(columnCount);
  boardElement.classList.toggle("memory-board--starlight", state.starlightBackUnlocked);
  boardElement.replaceChildren();

  for (const [index, card] of state.cards.entries()) {
    const button = document.createElement("button");
    const isRevealed = card.faceUp || card.matched;
    const isHinted = state.hintCardId === card.id;
    button.className = "memory-card";
    button.type = "button";
    button.dataset.cardId = card.id;
    button.disabled = state.phase === "checking" || state.phase === "peeking" || card.matched;
    button.setAttribute("aria-label", isRevealed ? card.label : "Carta virada para baixo");
    button.setAttribute("aria-pressed", String(isRevealed));
    button.classList.toggle("memory-card--face-up", isRevealed);
    button.classList.toggle("memory-card--matched", card.matched);
    button.classList.toggle("memory-card--hinted", isHinted);
    button.addEventListener("click", () => state.onFlip(card.id));
    button.addEventListener("keydown", (event) => {
      if (!event.key.startsWith("Arrow")) {
        return;
      }
      event.preventDefault();
      const cards = Array.from(boardElement.querySelectorAll(".memory-card"));
      focusAdjacentCard(cards, index, columnCount, event.key);
    });

    const inner = document.createElement("span");
    inner.className = "memory-card__inner";
    const back = document.createElement("span");
    back.className = "memory-card__face memory-card__back";
    back.setAttribute("aria-hidden", "true");
    back.textContent = "✦";
    const front = document.createElement("span");
    front.className = "memory-card__face memory-card__front";
    const image = document.createElement("img");
    image.src = card.image;
    image.alt = "";
    image.width = 64;
    image.height = 64;
    const label = document.createElement("span");
    label.className = "memory-card__label";
    label.textContent = card.label;
    front.append(image, label);
    const matchMark = document.createElement("span");
    matchMark.className = "memory-card__match-mark";
    matchMark.setAttribute("aria-hidden", "true");
    matchMark.textContent = "✓";
    inner.append(back, front);
    button.append(inner, matchMark);
    boardElement.append(button);
  }

  if (currentCardId) {
    const nextFocus = boardElement.querySelector(`[data-card-id="${currentCardId}"]:not(:disabled)`)
      ?? boardElement.querySelector(".memory-card:not(:disabled)");
    nextFocus?.focus();
  }
}

function renderCompletion(state) {
  const isSessionComplete = state.phase === "sessionComplete";
  document.querySelector("#completion-eyebrow").textContent =
    isSessionComplete ? "Terminamos por hoje!" : "Muito bem!";
  document.querySelector("#completion-title").textContent = isSessionComplete
    ? "Você encontrou todas as princesas e tesouros!"
    : "Você encontrou todos os pares!";
  document.querySelector("#completion-message").textContent = isSessionComplete
    ? "Todas as partidas desta sessão terminaram. Você pode voltar quando quiser."
    : `Partida ${state.sessionRound} de ${state.sessionRounds} concluída. Pronta para mais uma?`;
  document.querySelector("#reward-message").hidden = !isSessionComplete;
  document.querySelector("#reward-message").textContent = !state.rewardUnlocked
    ? "A partida foi concluída, mas não foi possível guardar a carta especial neste navegador."
    : state.rewardAlreadyUnlocked
      ? "O verso especial de estrelas já está na sua coleção!"
      : "Você desbloqueou um novo verso de carta com estrelas para a sua coleção!";
  nextButton.hidden = false;
  nextButton.textContent = isSessionComplete ? "Jogar de novo" : "Próxima rodada";
  document.querySelector("#completion-title").focus();
}

export function createGameUI(callbacks, roundsPerSession) {
  applyConfig(readSavedConfig());
  sessionNote.textContent =
    `A sessão tem ${roundsPerSession} partidas curtas. Não há pressa e você pode pedir uma ajuda.`;

  setupForm.addEventListener("change", saveConfig);
  setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    callbacks.onStart(saveConfig());
  });
  hintButton.addEventListener("click", callbacks.onHint);
  nextButton.addEventListener("click", callbacks.onNext);
  backButton.addEventListener("click", () => {
    if (callbacks.shouldConfirmLeave()) {
      leaveDialog.showModal();
    } else {
      window.location.href = "../../index.html";
    }
  });

  for (const link of homeLinks) {
    link.addEventListener("click", (event) => {
      if (!callbacks.shouldConfirmLeave()) {
        return;
      }
      event.preventDefault();
      leaveDialog.showModal();
    });
  }

  leaveDialog.addEventListener("close", () => {
    if (leaveDialog.returnValue === "leave") {
      window.location.href = "../../index.html";
    }
  });

  return {
    focusFirstCard() {
      const firstCard = boardElement.querySelector(".memory-card:not(:disabled)");
      if (firstCard) {
        firstCard.focus();
      } else {
        instructionsElement.focus();
      }
    },
    render(state) {
      setupPanel.hidden = state.phase !== "setup";
      playingPanel.hidden = state.phase !== "playing";
      completePanel.hidden = !["roundComplete", "sessionComplete"].includes(state.phase);

      if (state.phase === "setup") {
        return;
      }
      if (state.phase === "roundComplete" || state.phase === "sessionComplete") {
        renderCompletion(state);
        return;
      }

      roundCountElement.textContent =
        `Partida ${state.sessionRound} de ${state.sessionRounds} · ${state.game.matchedPairs} de ${state.config.pairCount} pares encontrados`;
      instructionsElement.textContent = state.game.phase === "peeking"
        ? "Espiadinha! Observe as cartas."
        : "Vire duas cartas para encontrar um par.";
      feedbackElement.textContent = state.game.feedback ?? "";
      hintButton.disabled = ["checking", "peeking", "finished"].includes(state.game.phase);
      renderCards({
        ...state.game,
        cards: state.game.cards,
        starlightBackUnlocked: state.starlightBackUnlocked,
        onFlip: callbacks.onFlip,
      });
    },
  };
}
