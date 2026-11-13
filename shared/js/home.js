import { gameCatalog } from "./catalog.js?v=6";
import "./settings.js?v=2";

const catalogElement = document.querySelector("#game-catalog");

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

renderCatalog();
