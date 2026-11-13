import { validateContent } from "./game.js?v=1";

const levelList = document.querySelector("#level-list");
const loadError = document.querySelector("#load-error");

function createLevelChoice(level) {
  const link = document.createElement("a");
  link.className = "level-choice";
  link.href = `./index.html?level=${encodeURIComponent(level.id)}`;

  const icon = document.createElement("span");
  icon.className = "level-choice__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = level.icon;

  const title = document.createElement("span");
  title.className = "level-choice__title";
  title.textContent = level.label;

  const description = document.createElement("span");
  description.className = "level-choice__description";
  description.textContent = level.description;

  const count = document.createElement("span");
  count.className = "level-choice__count";
  count.textContent = `${level.questions.length} perguntas`;

  link.append(icon, title, description, count);
  return link;
}

async function showLevels() {
  try {
    const response = await fetch("./content.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const content = await response.json();
    const problems = validateContent(content);
    if (problems.length > 0) {
      console.warn("O conteúdo de Coloque em Ordem precisa de ajustes:", problems);
    }
    levelList.replaceChildren(...content.levels.map(createLevelChoice));
  } catch (error) {
    console.error("Não consegui abrir os níveis de Coloque em Ordem.", error);
    loadError.hidden = false;
  }
}

showLevels();
