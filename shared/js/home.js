import { gameCatalog } from "./catalog.js?v=11";
import "./settings.js?v=2";

const catalogElement = document.querySelector("#game-catalog");

function createGameItem(game) {
  const item = document.createElement(game.available ? "a" : "button");
  item.className = "menu-game";
  item.style.setProperty("--tile-color", game.color);
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

  const title = document.createElement("span");
  title.className = "menu-game__title";
  title.textContent = game.label;

  item.append(icon, title);

  if (!game.available) {
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
