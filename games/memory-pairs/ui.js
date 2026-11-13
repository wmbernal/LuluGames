const playingPanel = document.querySelector("#playing-panel");
const completePanel = document.querySelector("#complete-panel");
const boardElement = document.querySelector("#memory-board");
const roundCountElement = document.querySelector("#round-count");
const feedbackElement = document.querySelector("#memory-feedback");
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const homeLinks = document.querySelectorAll("[data-home-link]");
const themeLinks = document.querySelectorAll("[data-theme-link]");
const leaveDialog = document.querySelector("#leave-dialog");
const leaveTitle = document.querySelector("#leave-title");
const leaveMessage = document.querySelector("#leave-message");
const leaveConfirmButton = document.querySelector("#leave-confirm-button");

let selectedCardId = null;
let leaveDestination = "home";
let renderedMatchedCardIds = new Set();

function updateSelectedCardUI() {
  for (const button of boardElement.querySelectorAll(".match-card")) {
    const selected = button.dataset.cardId === selectedCardId;
    button.classList.toggle("match-card--selected", selected);
    button.setAttribute("aria-pressed", String(selected || button.classList.contains("match-card--matched")));
  }
}

function createCard(card, side, callbacks, newlyMatchedCardIds) {
  const button = document.createElement("button");
  button.className = "match-card";
  button.type = "button";
  button.draggable = !card.matched;
  button.classList.toggle("match-card--word", card.cardType === "words");
  button.dataset.cardId = card.id;
  button.dataset.side = side;
  button.disabled = card.matched;
  button.setAttribute("aria-label", `${card.label}${card.matched ? ", par encontrado" : ""}`);
  button.setAttribute("aria-pressed", String(card.matched || selectedCardId === card.id));
  button.classList.toggle("match-card--matched", card.matched);
  button.classList.toggle("match-card--just-matched", newlyMatchedCardIds.has(card.id));
  button.classList.toggle("match-card--selected", selectedCardId === card.id);

  const label = document.createElement("span");
  label.className = "match-card__label";
  label.textContent = card.label;
  const mark = document.createElement("span");
  mark.className = "match-card__mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "✓";
  if (card.icon) {
    const icon = document.createElement("span");
    icon.className = "match-card__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = card.icon;
    button.append(icon);
  }
  button.append(label, mark);

  button.addEventListener("click", () => {
    if (card.matched) {
      return;
    }
    callbacks.onCardSelected(card.label);
    if (!selectedCardId) {
      selectedCardId = card.id;
      callbacks.onSelectionChange();
      return;
    }
    if (selectedCardId === card.id) {
      selectedCardId = null;
      callbacks.onSelectionChange();
      return;
    }
    const previousCardId = selectedCardId;
    const outcome = callbacks.onMatch(previousCardId, card.id);
    selectedCardId = outcome === "neutral" ? card.id : null;
    callbacks.onSelectionChange();
  });
  button.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", card.id);
    event.dataTransfer.effectAllowed = "move";
    button.classList.add("match-card--dragging");
  });
  button.addEventListener("dragend", () => {
    button.classList.remove("match-card--dragging");
  });
  button.addEventListener("dragover", (event) => {
    if (!card.matched) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  });
  button.addEventListener("drop", (event) => {
    event.preventDefault();
    const draggedCardId = event.dataTransfer.getData("text/plain");
    if (!draggedCardId || draggedCardId === card.id || card.matched) {
      return;
    }
    if (callbacks.onMatch(draggedCardId, card.id) !== "neutral") {
      selectedCardId = null;
    }
    callbacks.onSelectionChange();
  });

  return button;
}

function renderCards(game, callbacks, newlyMatchedCardIds) {
  boardElement.replaceChildren();
  for (const [side, title, cards] of [
    ["left", "Cartas da esquerda", game.leftCards],
    ["right", "Cartas da direita", game.rightCards],
  ]) {
    const column = document.createElement("section");
    column.className = "match-column";
    column.setAttribute("aria-label", title);
    const heading = document.createElement("h3");
    heading.textContent = title;
    const list = document.createElement("div");
    list.className = "match-column__cards";
    for (const card of cards) {
      list.append(createCard(card, side, callbacks, newlyMatchedCardIds));
    }
    column.append(heading, list);
    boardElement.append(column);
  }
}

function renderCompletion(state) {
  const isSessionComplete = state.phase === "sessionComplete";
  document.querySelector("#completion-eyebrow").textContent =
    isSessionComplete ? "Terminamos por hoje!" : "Muito bem!";
  document.querySelector("#completion-title").textContent = "Você encontrou todos os pares!";
  document.querySelector("#completion-message").textContent = isSessionComplete
    ? "Todas as rodadas desta sessão terminaram. Você pode voltar quando quiser."
    : `Rodada ${state.sessionRound} de ${state.sessionRounds} concluída. A próxima rodada terá outras combinações.`;
  nextButton.textContent = isSessionComplete ? "Jogar de novo" : "Próxima rodada";
  document.querySelector("#completion-title").focus();
}

export function createGameUI(callbacks) {
  document.querySelector("#game-title").textContent = `Jogo dos Pares: ${callbacks.theme.label}`;
  const cardCallbacks = {
    onMatch: callbacks.onMatch,
    onCardSelected: callbacks.onCardSelected,
    onSelectionChange: updateSelectedCardUI,
  };
  function confirmNavigation(destination) {
    if (!callbacks.shouldConfirmLeave()) {
      window.location.href = destination === "themes" ? "./themes.html" : "../../index.html";
      return;
    }

    leaveDestination = destination;
    leaveTitle.textContent = destination === "themes"
      ? "Quer escolher outro tema?"
      : "Quer voltar ao início?";
    leaveMessage.textContent = destination === "themes"
      ? "Esta partida vai terminar. Você poderá começar outra quando quiser."
      : "Esta partida vai terminar. Você poderá jogar de novo quando quiser.";
    leaveConfirmButton.textContent = destination === "themes"
      ? "Escolher tema"
      : "Voltar ao início";
    leaveDialog.showModal();
  }

  nextButton.addEventListener("click", callbacks.onNext);
  backButton.textContent = "Temas";
  backButton.addEventListener("click", () => confirmNavigation("themes"));

  for (const link of homeLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      confirmNavigation("home");
    });
  }
  for (const link of themeLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      confirmNavigation("themes");
    });
  }

  leaveDialog.addEventListener("close", () => {
    if (leaveDialog.returnValue === "leave") {
      window.location.href = leaveDestination === "themes" ? "./themes.html" : "../../index.html";
    }
  });

  return {
    focusFirstCard() {
      boardElement.querySelector(".match-card:not(:disabled)")?.focus();
    },
    render(state) {
      playingPanel.hidden = state.phase !== "playing";
      completePanel.hidden = !["roundComplete", "sessionComplete"].includes(state.phase);
      if (state.phase === "roundComplete" || state.phase === "sessionComplete") {
        renderCompletion(state);
        return;
      }

      roundCountElement.textContent =
        `Tema ${state.game.themeLabel} · Partida ${state.sessionRound} de ${state.sessionRounds} · ${state.game.matchedPairs} de ${state.game.totalPairs} pares`;
      feedbackElement.textContent = state.game.feedback;
      feedbackElement.classList.toggle("memory-feedback--positive", state.game.feedbackType === "positive");
      const matchedCardIds = new Set(
        [...state.game.leftCards, ...state.game.rightCards]
          .filter((card) => card.matched)
          .map((card) => card.id),
      );
      const newlyMatchedCardIds = new Set(
        [...matchedCardIds].filter((cardId) => !renderedMatchedCardIds.has(cardId)),
      );
      renderCards(state.game, cardCallbacks, newlyMatchedCardIds);
      renderedMatchedCardIds = matchedCardIds;
    },
  };
}
