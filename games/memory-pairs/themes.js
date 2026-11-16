import { THEMES } from "./data.js?v=4";
import { markSelectionLink, setupOrientationSuggestion } from "../../shared/js/orientation.js?v=1";
import "../../shared/js/settings.js?v=2";

const themeList = document.querySelector("#theme-list");
const orientationSuggested = setupOrientationSuggestion({ selection: true });

for (const theme of THEMES) {
  const link = document.createElement("a");
  link.className = "theme-choice";
  link.dataset.theme = theme.id;
  link.href = `./index.html?theme=${encodeURIComponent(theme.id)}`;
  markSelectionLink(link, orientationSuggested);

  const icon = document.createElement("span");
  icon.className = "theme-choice__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = theme.icon;

  const title = document.createElement("span");
  title.className = "theme-choice__title";
  title.textContent = theme.label;

  link.append(icon, title);
  themeList.append(link);
}
