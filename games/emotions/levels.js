import { markSelectionLink, setupOrientationSuggestion } from "../../shared/js/orientation.js?v=1";
import { decorateSelectionTile } from "../../shared/js/selection.js?v=2";

const levelList = document.querySelector("#level-list");
const loadError = document.querySelector("#load-error");
const orientationSuggested = setupOrientationSuggestion({ selection: true });

function createLevelChoice(level, index) {
  const link = document.createElement("a");
  link.className = "selection-tile";
  link.href = `./index.html?level=${encodeURIComponent(level.id)}`;
  markSelectionLink(link, orientationSuggested);

  decorateSelectionTile(link, {
    icon: level.icon,
    label: level.label,
    description: level.description,
    count: `${level.questions.length} perguntas`,
    index,
  });

  return link;
}

async function showLevels() {
  try {
    const response = await fetch("./content.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const content = await response.json();
    levelList.replaceChildren(...content.levels.map(createLevelChoice));
  } catch (error) {
    console.error("Não consegui abrir os níveis do Jogo das Emoções.", error);
    loadError.hidden = false;
  }
}

showLevels();
