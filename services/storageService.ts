import { AppConfig, GameType, DEFAULT_API_URL } from "../types";
import { STORAGE_KEY } from "../constants";

const defaultConfig: AppConfig = {
  game: GameType.EMOBILE,
  apiUrl: DEFAULT_API_URL,
  isAnimating: false,
  lastResetTimestamp: 0,
};

export const getConfig = (): AppConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
  } catch (e) {
    console.error("Failed to parse config", e);
    return defaultConfig;
  }
};

export const saveConfig = (config: AppConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Dispatch a custom event for the same window to react
  window.dispatchEvent(new Event("storage"));
};
