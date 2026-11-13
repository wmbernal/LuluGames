import { gameCatalog } from "./catalog.js?v=6";
import { getSettings, updateSettings } from "./settings.js?v=2";

const catalogElement = document.querySelector("#game-catalog");
const settingsForm = document.querySelector("#settings-form");
const settingsStatus = document.querySelector("#settings-status");
const settingsToggle = document.querySelector("#settings-toggle");
const settingsBackdrop = document.querySelector("#settings-backdrop");
const settingsClose = document.querySelector("#settings-close");
let lastFocused = null;

function createGameItem(game) {
  const item = document.createElement(game.available ? "a" : "button");
  item.className = "menu-game";
  if (game.available) {
    item.href = game.href;
  } else {
    item.type = "button";
    item.disabled = true;
    item.classList.add("menu-game--soon");
  }

  const icon = document.createElement("span");
  icon.className = "menu-game__icon";
  icon.setAttribute("aria-hidden", "true");
  const iconImage = document.createElement("img");
  iconImage.src = game.icon;
  iconImage.alt = "";
  icon.append(iconImage);

  const text = document.createElement("span");
  text.className = "menu-game__text";
  const title = document.createElement("span");
  title.className = "menu-game__title";
  title.textContent = game.title;
  const description = document.createElement("span");
  description.className = "menu-game__desc";
  description.textContent = game.description;
  text.append(title, description);

  item.append(icon, text);

  if (game.available) {
    const go = document.createElement("span");
    go.className = "menu-game__go";
    go.setAttribute("aria-hidden", "true");
    go.textContent = "›";
    item.append(go);
  } else {
    const badge = document.createElement("span");
    badge.className = "menu-game__badge";
    badge.textContent = "Em breve";
    item.append(badge);
  }

  return item;
}

function renderCatalog() {
  for (const game of gameCatalog) {
    if (game.hidden) continue;
    catalogElement.append(createGameItem(game));
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

function setSettingsOpen(open) {
  settingsBackdrop.hidden = !open;
  settingsToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("is-locked", open);

  if (open) {
    lastFocused = document.activeElement;
    renderSettings(getSettings());
    const firstControl = settingsForm.querySelector("input, select");
    (firstControl ?? settingsClose).focus();
  } else {
    if (lastFocused instanceof HTMLElement) {
      lastFocused.focus();
    }
  }
}

renderCatalog();
renderSettings(getSettings());
settingsForm.addEventListener("change", saveSettings);
settingsToggle.addEventListener("click", () => setSettingsOpen(settingsBackdrop.hidden));
settingsClose.addEventListener("click", () => setSettingsOpen(false));
settingsBackdrop.addEventListener("click", (event) => {
  if (event.target === settingsBackdrop) {
    setSettingsOpen(false);
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settingsBackdrop.hidden) {
    setSettingsOpen(false);
  }
});
