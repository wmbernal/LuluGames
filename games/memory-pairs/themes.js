import { THEMES } from "./data.js?v=4";
import { markSelectionLink, setupOrientationSuggestion } from "../../shared/js/orientation.js?v=1";
import { decorateSelectionTile } from "../../shared/js/selection.js?v=2";
import "../../shared/js/settings.js?v=2";

const themeList = document.querySelector("#theme-list");
const orientationSuggested = setupOrientationSuggestion({ selection: true });

THEMES.forEach((theme, index) => {
  const link = document.createElement("a");
  link.className = "selection-tile";
  link.dataset.theme = theme.id;
  link.href = `./index.html?theme=${encodeURIComponent(theme.id)}`;
  markSelectionLink(link, orientationSuggested);

  decorateSelectionTile(link, {
    icon: theme.icon,
    label: theme.label,
    description: theme.description,
    index,
  });

  themeList.append(link);
});
