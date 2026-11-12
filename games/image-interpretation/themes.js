import { THEMES } from "./data.js?v=7";

const themeList = document.querySelector("#theme-list");

for (const theme of THEMES) {
  const link = document.createElement("a");
  link.className = "theme-choice";
  link.href = `./index.html?theme=${encodeURIComponent(theme.id)}`;

  const icon = document.createElement("span");
  icon.className = "theme-choice__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = theme.icon;

  const title = document.createElement("span");
  title.className = "theme-choice__title";
  title.textContent = theme.label;

  const description = document.createElement("span");
  description.className = "theme-choice__description";
  description.textContent = theme.description;

  const count = document.createElement("span");
  count.className = "theme-choice__count";
  count.textContent = `${theme.scenes.length} exercícios`;

  link.append(icon, title, description, count);
  themeList.append(link);
}
