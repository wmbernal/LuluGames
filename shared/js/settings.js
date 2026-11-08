import { readStorage, writeStorage } from "./storage.js";

const STORAGE_KEY = "lulu-games-settings";
const SETTINGS_VERSION = 2;
const DEFAULT_SETTINGS = Object.freeze({
  soundEnabled: true,
  soundVolume: 0.1,
  animationsEnabled: true,
  roundsPerSession: 3,
  settingsVersion: SETTINGS_VERSION,
});
const ALLOWED_ROUNDS = [3, 4, 5];

function isValidSettings(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.soundEnabled === "boolean"
    && Number.isFinite(value.soundVolume)
    && value.soundVolume >= 0
    && value.soundVolume <= 0.25
    && typeof value.animationsEnabled === "boolean"
    && ALLOWED_ROUNDS.includes(value.roundsPerSession);
}

function loadSettings() {
  const savedValue = readStorage(STORAGE_KEY);
  if (savedValue === null) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const parsedValue = JSON.parse(savedValue);
    if (isValidSettings(parsedValue)) {
      return {
        ...DEFAULT_SETTINGS,
        ...parsedValue,
        soundEnabled: parsedValue.settingsVersion === SETTINGS_VERSION
          ? parsedValue.soundEnabled
          : true,
        settingsVersion: SETTINGS_VERSION,
      };
    }
    console.warn("Saved game settings are invalid. Default settings will be used.");
  } catch (error) {
    console.warn("Saved game settings could not be parsed. Default settings will be used.", error);
  }

  return { ...DEFAULT_SETTINGS };
}

let currentSettings = loadSettings();

function persistSettings() {
  document.documentElement.dataset.animations = currentSettings.animationsEnabled ? "on" : "off";
  return writeStorage(STORAGE_KEY, JSON.stringify(currentSettings));
}

persistSettings();

export function getSettings() {
  return { ...currentSettings };
}

export function updateSettings(changes) {
  const nextSettings = { ...currentSettings, ...changes };
  if (!isValidSettings(nextSettings)) {
    throw new TypeError("Invalid game settings.");
  }
  currentSettings = nextSettings;
  if (!persistSettings()) {
    throw new Error("Settings were applied for this page but could not be saved.");
  }
  return getSettings();
}
