export enum GameType {
  EMOBILE = 'EMOBILE',
  ECONSOLE = 'ECONSOLE',
  ROCKET_LEAGUE = 'ROCKET_LEAGUE'
}

export interface GameTheme {
  id: GameType;
  label: string;
  gradientFrom: string;
  gradientTo: string;
  previewColor: string;
}

export interface MessageData {
  id: string | number;
  message: string;
  fan_name?: string;
  timestamp?: string;
  // We add these for internal positioning logic
  x?: number;
  y?: number;
}

export interface AppConfig {
  game: GameType;
  apiUrl: string;
  isAnimating: boolean;
  lastResetTimestamp: number;
}

export const DEFAULT_API_URL = "https://events.tinytoolkit.io/api/well-wishes/messages/live?team=barcelona";
