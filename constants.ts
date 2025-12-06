import { GameTheme, GameType } from "./types";

export const GAMES: Record<GameType, GameTheme> = {
  [GameType.EMOBILE]: {
    id: GameType.EMOBILE,
    label: "eMobile",
    gradientFrom: "#BCA400",
    gradientTo: "#D9D838",
    previewColor: "bg-yellow-500"
  },
  [GameType.ECONSOLE]: {
    id: GameType.ECONSOLE,
    label: "eConsole",
    gradientFrom: "#019C2E",
    gradientTo: "#9DDC03",
    previewColor: "bg-green-500"
  },
  [GameType.ROCKET_LEAGUE]: {
    id: GameType.ROCKET_LEAGUE,
    label: "Rocket League",
    gradientFrom: "#CF0605",
    gradientTo: "#FEB50B",
    previewColor: "bg-red-500"
  }
};

export const STORAGE_KEY = "live_message_wall_config";
