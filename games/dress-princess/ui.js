import { CATEGORIES } from "./data.js";
import { getSettings } from "../../shared/js/settings.js?v=2";

const introPanel = document.querySelector("#intro-panel");
const playingPanel = document.querySelector("#playing-panel");
const completePanel = document.querySelector("#complete-panel");
const itemTray = document.querySelector("#item-tray");
const feedbackElement = document.querySelector("#feedback");
const primaryAction = document.querySelector("#primary-action");
const backButton = document.querySelector("#back-button");
const listenButton = document.querySelector("#listen-button");
const princessStage = document.querySelector("#princess-stage");
const homeLinks = document.querySelectorAll("[data-home-link]");
const leaveDialog = document.querySelector("#leave-dialog");
const settingsForm = document.querySelector("#settings-form");
const settingsStatus = document.querySelector("#settings-status");
let dragCandidate = null;
let suppressNextClick = false;

function renderSettings(settings) {
  settingsForm.elements.soundEnabled.checked = settings.soundEnabled;
  settingsForm.elements.soundVolume.value = String(settings.soundVolume);
  settingsForm.elements.soundVolume.disabled = !settings.soundEnabled;
  settingsForm.elements.animationsEnabled.checked = settings.animationsEnabled;
  settingsForm.elements.roundsPerSession.value = String(settings.roundsPerSession);
}

function equipOnDrop(item, event, onEquip) {
  const bounds = princessStage.getBoundingClientRect();
  const isOverStage = event.clientX >= bounds.left
    && event.clientX <= bounds.right
    && event.clientY >= bounds.top
    && event.clientY <= bounds.bottom;
  if (isOverStage) {
    onEquip(item.id);
  }
}

function addPointerHandlers(button, item) {
  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    dragCandidate = {
      itemId: item.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      button,
      item,
    };
  });
}

function renderTray(items, selectedItems, highlightedCategory, isDisabled, onEquip) {
  itemTray.replaceChildren();
  for (const category of CATEGORIES) {
    const group = document.createElement("section");
    group.className = "category-tray";
    group.dataset.category = category.id;
    group.classList.toggle("category-tray--hint", category.id === highlightedCategory);

    const heading = document.createElement("h3");
    heading.textContent = category.label;
    const choices = document.createElement("div");
    choices.className = "item-choices";
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-label", category.label);

    for (const item of items.filter((entry) => entry.category === category.id)) {
      const button = document.createElement("button");
      button.className = "item-choice";
      button.type = "button";
      button.dataset.itemId = item.id;
      button.disabled = isDisabled;
      button.setAttribute("aria-pressed", String(selectedItems[category.id] === item.id));
      button.setAttribute("aria-label", `${item.label}${selectedItems[category.id] === item.id ? ", vestido" : ""}`);
      button.addEventListener("click", () => {
        if (suppressNextClick) {
          suppressNextClick = false;
          return;
        }
        onEquip(item.id);
      });
      addPointerHandlers(button, item);

      const image = document.createElement("img");
      image.src = item.image;
      image.alt = "";
      image.width = 64;
      image.height = 64;
      const label = document.createElement("span");
      label.textContent = item.label;
      button.append(image, label);
      choices.append(button);
    }
    group.append(heading, choices);
    itemTray.append(group);
  }
}

function renderOutfit(selectedItems, items) {
  const labels = [];
  for (const category of CATEGORIES) {
    const layer = princessStage.querySelector(`[data-layer="${category.id}"]`);
    const item = items.find((entry) => entry.id === selectedItems[category.id]);
    layer.hidden = !item;
    if (item) {
      layer.src = item.image;
      labels.push(item.label);
    }
  }
  princessStage.setAttribute(
    "aria-label",
    labels.length ? `Princesa vestida com ${labels.join(", ")}` : "Princesa sem roupas escolhidas",
  );
}

export function createGameUI(callbacks) {
  document.addEventListener("pointermove", (event) => {
    if (!dragCandidate || dragCandidate.pointerId !== event.pointerId) {
      return;
    }
    const distance = Math.hypot(
      event.clientX - dragCandidate.startX,
      event.clientY - dragCandidate.startY,
    );
    if (distance > 10) {
      dragCandidate.moved = true;
      dragCandidate.button.classList.add("item-choice--dragging");
    }
  });
  document.addEventListener("pointerup", (event) => {
    if (!dragCandidate || dragCandidate.pointerId !== event.pointerId) {
      return;
    }
    if (dragCandidate.moved) {
      equipOnDrop(dragCandidate.item, event, callbacks.onEquip);
      suppressNextClick = true;
      window.setTimeout(() => {
        suppressNextClick = false;
      }, 0);
    }
    dragCandidate.button.classList.remove("item-choice--dragging");
    dragCandidate = null;
  });
  document.addEventListener("pointercancel", (event) => {
    if (dragCandidate?.pointerId === event.pointerId) {
      dragCandidate.button.classList.remove("item-choice--dragging");
      dragCandidate = null;
    }
  });

  primaryAction.addEventListener("click", callbacks.onPrimaryAction);
  backButton.addEventListener("click", () => {
    if (callbacks.isAtIntro()) {
      if (callbacks.shouldConfirmLeave()) {
        leaveDialog.showModal();
      } else {
        window.location.href = "../../index.html";
      }
      return;
    }
    callbacks.onBack();
  });
  listenButton.addEventListener("click", callbacks.onListen);

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

  settingsForm.addEventListener("change", (event) => {
    const control = event.target;
    if (!control.name) {
      return;
    }
    const value = control.type === "checkbox" ? control.checked : Number(control.value);
    try {
      callbacks.onSettingsChange({ [control.name]: value });
      renderSettings(getSettings());
      settingsStatus.textContent = "Preferência salva.";
    } catch (error) {
      console.error("Could not update game settings.", error);
      settingsStatus.textContent = "Não foi possível salvar. Tente novamente.";
      renderSettings(getSettings());
    }
  });

  renderSettings(getSettings());

  return {
    render(state) {
      const activeItemId = document.activeElement?.dataset.itemId;
      introPanel.hidden = state.phase !== "intro";
      playingPanel.hidden = state.phase !== "playing";
      completePanel.hidden = state.phase !== "complete";
      primaryAction.textContent = state.phase === "intro"
        ? state.active ? "Continuar jogo" : "Começar jogo"
        : state.phase === "complete"
          ? "Jogar de novo"
          : state.evaluationPassed ? "Próximo" : "Pronto";
      feedbackElement.textContent = state.feedback;
      feedbackElement.classList.toggle("feedback-area--success", state.evaluationPassed);
      feedbackElement.classList.toggle("feedback-area--gentle-hint", Boolean(state.highlightedCategory));
      document.querySelector("#reward-feedback").textContent = state.rewardUnlocked
        ? state.rewardAlreadyUnlocked
          ? "A coroa de flores já faz parte da coleção da princesa!"
          : "Você desbloqueou uma coroa de flores para a coleção da princesa!"
        : state.phase === "complete"
          ? "As rodadas foram concluídas. Não foi possível salvar a peça da coleção desta vez."
          : "";

      if (state.phase === "intro") {
        document.querySelector("#intro-round-count").textContent = String(state.rounds);
        return;
      }
      if (state.phase === "complete") {
        return;
      }

      const scenario = state.scenario;
      document.querySelector("#round-count").textContent =
        `Rodada ${state.roundIndex + 1} de ${state.rounds} · faltam ${state.rounds - state.roundIndex}`;
      document.querySelector("#round-progress-fill").style.width =
        `${((state.roundIndex + 1) / state.rounds) * 100}%`;
      document.querySelector("#scenario-icon").textContent = scenario.icon;
      document.querySelector("#scenario-title").textContent = scenario.title;
      document.querySelector("#scenario-prompt").textContent = scenario.prompt;
      listenButton.hidden = !scenario.audio;
      const settings = getSettings();
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      princessStage.classList.toggle(
        "princess-stage--celebrate",
        state.evaluationPassed && settings.animationsEnabled && !prefersReducedMotion,
      );
      renderOutfit(state.selectedItems, state.items);
      renderTray(
        state.items,
        state.selectedItems,
        state.highlightedCategory,
        state.evaluationPassed,
        callbacks.onEquip,
      );
      if (activeItemId) {
        const activeChoice = Array.from(itemTray.querySelectorAll(".item-choice"))
          .find((button) => button.dataset.itemId === activeItemId);
        activeChoice?.focus();
      }
    },
  };
}
