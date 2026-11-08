import { playInstructionAudio, playPositiveSound } from "../../shared/js/audio.js?v=2";
import { getSettings, updateSettings } from "../../shared/js/settings.js?v=2";
import { readStorage, writeStorage } from "../../shared/js/storage.js";
import { CATEGORIES, ITEMS, REWARD_ITEM_ID, SCENARIOS } from "./data.js";
import { createGameUI } from "./ui.js";

const REWARD_STORAGE_KEY = ITEMS.find((item) => item.id === REWARD_ITEM_ID).unlockKey;
const initialSettings = getSettings();
let state = {
  phase: "intro",
  active: false,
  roundIndex: 0,
  rounds: initialSettings.roundsPerSession,
  selectedItems: {},
  feedback: "",
  evaluationPassed: false,
  highlightedCategory: null,
  rewardUnlocked: false,
  rewardAlreadyUnlocked: false,
};

const ui = createGameUI({
  onPrimaryAction: handlePrimaryAction,
  onEquip: equipItem,
  onBack: returnToIntro,
  onListen: listenToScenario,
  onSettingsChange: handleSettingsChange,
  shouldConfirmLeave: () => state.active,
  isAtIntro: () => state.phase === "intro",
});

function getCurrentScenario() {
  return SCENARIOS[state.roundIndex % SCENARIOS.length];
}

function getAvailableItems() {
  return ITEMS.filter((item) => !item.unlockKey || readStorage(item.unlockKey) === "true");
}

function render() {
  ui.render({
    ...state,
    scenario: getCurrentScenario(),
    items: getAvailableItems(),
  });
}

function startOrResumeSession() {
  if (!state.active) {
    state = {
      phase: "playing",
      active: true,
      roundIndex: 0,
      rounds: getSettings().roundsPerSession,
      selectedItems: {},
      feedback: "",
      evaluationPassed: false,
      highlightedCategory: null,
      rewardUnlocked: false,
      rewardAlreadyUnlocked: false,
    };
  } else {
    state.phase = "playing";
  }
  render();
}

function evaluateOutfit() {
  const scenario = getCurrentScenario();
  const availableItems = getAvailableItems();
  for (const category of CATEGORIES) {
    const selectedItemId = state.selectedItems[category.id];
    if (!selectedItemId) {
      return { isAdequate: false, category: category.id, isMissing: true };
    }

    const item = availableItems.find((entry) => entry.id === selectedItemId);
    if (!item || !item.tags.some((tag) => scenario.requiredTags.includes(tag))) {
      return { isAdequate: false, category: category.id, isMissing: false };
    }
  }
  return { isAdequate: true, category: null, isMissing: false };
}

function handleReady() {
  const result = evaluateOutfit();
  if (!result.isAdequate) {
    state.evaluationPassed = false;
    state.highlightedCategory = result.category;
    state.feedback = result.isMissing
      ? `Ainda falta escolher uma peça em ${CATEGORIES.find((entry) => entry.id === result.category).label.toLowerCase()}.`
      : `Vamos tentar outra opção? A categoria ${CATEGORIES.find((entry) => entry.id === result.category).label.toLowerCase()} pode combinar com esta situação.`;
    render();
    return;
  }

  state.evaluationPassed = true;
  state.highlightedCategory = null;
  state.feedback = "Esse look combina com a situação. Ficou muito bonito!";
  void playPositiveSound(getSettings());
  render();
}

function equipItem(itemId) {
  if (state.phase !== "playing" || state.evaluationPassed) {
    return;
  }
  const item = getAvailableItems().find((entry) => entry.id === itemId);
  if (!item) {
    console.error(`Cannot equip unavailable item "${itemId}".`);
    return;
  }

  if (state.selectedItems[item.category] === item.id) {
    delete state.selectedItems[item.category];
  } else {
    state.selectedItems[item.category] = item.id;
  }
  state.feedback = "";
  state.highlightedCategory = null;
  render();
}

function completeSession() {
  state.phase = "complete";
  state.active = false;
  state.rewardAlreadyUnlocked = readStorage(REWARD_STORAGE_KEY) === "true";
  state.rewardUnlocked = state.rewardAlreadyUnlocked
    || writeStorage(REWARD_STORAGE_KEY, "true");
  render();
}

function moveToNextScenario() {
  if (state.roundIndex + 1 >= state.rounds) {
    completeSession();
    return;
  }
  state.roundIndex += 1;
  state.selectedItems = {};
  state.feedback = "";
  state.evaluationPassed = false;
  state.highlightedCategory = null;
  render();
}

function handlePrimaryAction() {
  if (state.phase === "intro") {
    startOrResumeSession();
    return;
  }
  if (state.phase === "complete") {
    startOrResumeSession();
    return;
  }
  if (state.evaluationPassed) {
    moveToNextScenario();
    return;
  }
  handleReady();
}

function returnToIntro() {
  if (state.phase === "playing") {
    state.phase = "intro";
    render();
    return;
  }
  window.location.href = "../../index.html";
}

function listenToScenario() {
  const audioFile = getCurrentScenario().audio;
  if (audioFile) {
    void playInstructionAudio(audioFile, getSettings());
  }
}

function handleSettingsChange(changes) {
  const settings = updateSettings(changes);
  if (state.phase === "intro" && !state.active) {
    state.rounds = settings.roundsPerSession;
    render();
  }
}

render();
