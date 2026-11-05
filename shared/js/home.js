import { gameCatalog } from "./catalog.js";
import { getSettings, updateSettings } from "./settings.js";

const catalogElement = document.querySelector("#game-catalog");
const settingsForm = document.querySelector("#settings-form");
const settingsStatus = document.querySelector("#settings-status");
const settingsToggle = document.querySelector("#settings-toggle");
const settingsPanel = document.querySelector("#settings-panel");

function renderCatalog() {
  for (const game of gameCatalog) {
    const card = document.createElement("article");
    card.className = "game-card";

    const icon = document.createElement("span");
    icon.className = "game-card__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = game.icon;

    const title = document.createElement("h3");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.textContent = game.description;

    card.append(icon, title, description);
    if (game.available) {
      const link = document.createElement("a");
      link.className = "button button--primary";
      link.href = game.href;
      link.textContent = "Jogar";
      card.append(link);
    } else {
      const button = document.createElement("button");
      button.className = "button button--secondary";
      button.type = "button";
      button.disabled = true;
      button.textContent = "Em breve";
      card.append(button);
    }
    catalogElement.append(card);
  }
}

function renderSettings(settings) {
  settingsForm.elements.soundEnabled.checked = settings.soundEnabled;
  settingsForm.elements.soundVolume.value = String(settings.soundVolume);
  settingsForm.elements.soundVolume.disabled = !settings.soundEnabled;
  settingsForm.elements.animationsEnabled.checked = settings.animationsEnabled;
  settingsForm.elements.roundsPerSession.value = String(settings.roundsPerSession);
}

function saveSettings(event) {
  const control = event.target;
  const settingName = control.name;
  if (!settingName) {
    return;
  }

  const value = control.type === "checkbox"
    ? control.checked
    : control.type === "range"
      ? Number(control.value)
      : Number(control.value);

  try {
    const settings = updateSettings({ [settingName]: value });
    renderSettings(settings);
    settingsStatus.textContent = "Preferência salva.";
  } catch (error) {
    console.error("Could not update game settings.", error);
    settingsStatus.textContent = "Não foi possível salvar. Tente novamente.";
    renderSettings(getSettings());
  }
}

renderCatalog();
renderSettings(getSettings());
settingsForm.addEventListener("change", saveSettings);
settingsToggle.addEventListener("click", () => {
  const isExpanded = settingsToggle.getAttribute("aria-expanded") === "true";
  settingsToggle.setAttribute("aria-expanded", String(!isExpanded));
  settingsPanel.hidden = isExpanded;
  if (!isExpanded) {
    settingsPanel.querySelector("input").focus();
  }
});
