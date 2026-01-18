// ============================================
// FILE: src/types/global.d.ts
// ============================================

/**
 * Global type definitions for Mini Balatro.
 */

/**
 * Represents the current screen/view state.
 */
export type AppScreen = 'menu' | 'game' | 'shop' | 'victory' | 'defeat';

/**
 * Represents a blind type identifier.
 */
export type BlindType = 'small' | 'big' | 'boss';

/**
 * Represents suit color as hex string.
 */
export type SuitColor = string;

/**
 * Callback function type for game state changes.
 */
export type StateChangeCallback = (gameState: any) => void;

/**
 * Callback function type for shop events.
 */
export type ShopCallback = (shop?: any) => void;

/**
 * Callback function type for game end events.
 */
export type GameEndCallback = () => void;

/**
 * Configuration object for hand values.
 */
export interface HandValueConfig {
  chips: number;
  mult: number;
}

/**
 * Configuration object for planet upgrades.
 */
export interface PlanetUpgradeConfig {
  handType: string;
  chips: number;
  mult: number;
}

/**
 * Shop item data structure.
 */
export interface ShopItemData {
  id: string;
  type: 'joker' | 'planet' | 'tarot';
  name: string;
  description: string;
  cost: number;
}

/**
 * Score calculation breakdown entry.
 */
export interface ScoreBreakdownEntry {
  source: string;
  chipsAdded: number;
  multAdded: number;
  description: string;
}

/**
 * Game statistics data.
 */
export interface GameStatistics {
  levelsCompleted: number;
  totalScore: number;
  moneyRemaining: number;
  roundsCompleted: number;
  handsPlayed: number;
  jokersUsed: string[];
  planetsCollected: string[];
}

/**
 * Persisted game state data.
 */
export interface PersistedGameData {
  levelNumber: number;
  roundNumber: number;
  money: number;
  accumulatedScore: number;
  handsRemaining: number;
  discardsRemaining: number;
  deckState: any;
  jokers: any[];
  consumables: any[];
  upgrades: any;
  timestamp: number;
}

/**
 * UI component props base interface.
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Error types for game operations.
 */
export enum GameErrorType {
  INVALID_ACTION = 'INVALID_ACTION',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVENTORY_FULL = 'INVENTORY_FULL',
  NO_SAVED_GAME = 'NO_SAVED_GAME',
  PERSISTENCE_ERROR = 'PERSISTENCE_ERROR',
}

/**
 * Game error with type and message.
 */
export interface GameError {
  type: GameErrorType;
  message: string;
}

/**
 * Extends Window interface for custom properties.
 */
declare global {
  interface Window {
    gameController?: any;
    debugMode?: boolean;
  }
}

/**
 * Module declarations for CSS imports.
 */
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

/**
 * Module declarations for image imports.
 */
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

/**
 * Utility type for making all properties optional recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type for readonly array.
 */
export type ReadonlyArray<T> = readonly T[];

/**
 * Utility type for non-nullable.
 */
export type NonNullable<T> = T extends null | undefined ? never : T;