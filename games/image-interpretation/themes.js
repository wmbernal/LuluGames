import { THEMES } from "./data.js?v=7";
import { markSelectionLink, setupOrientationSuggestion } from "../../shared/js/orientation.js?v=1";
import { decorateSelectionTile } from "../../shared/js/selection.js?v=2";

const themeList = document.querySelector("#theme-list");
const orientationSuggested = setupOrientationSuggestion({ selection: true });

THEMES.forEach((theme, index) => {
  const link = document.createElement("a");
  link.className = "selection-tile";
  link.href = `./index.html?theme=${encodeURIComponent(theme.id)}`;
  markSelectionLink(link, orientationSuggested);

  decorateSelectionTile(link, {
    icon: theme.icon,
    label: theme.label,
    description: theme.description,
    count: `${theme.scenes.length} exercícios`,
    index,
  });

  themeList.append(link);
});
