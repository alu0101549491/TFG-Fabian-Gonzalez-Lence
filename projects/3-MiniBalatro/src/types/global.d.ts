/**
 * Global type definitions for the Mini Balatro application.
 * Provides shared types used across multiple modules.
 */

/**
 * Represents a unique identifier for game entities
 */
export type EntityId = string;

/**
 * Coordinate position on the game board
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Animation state for UI elements
 */
export interface AnimationState {
  isAnimating: boolean;
  duration: number;
  delay?: number;
}

/**
 * Selection state for interactive elements
 */
export interface Selectable {
  isSelected: boolean;
  isSelectable: boolean;
}

/**
 * Common props for all game components
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onHover?: () => void;
}

/**
 * Game phase enumeration
 */
export enum GamePhase {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
}

/**
 * Player action types
 */
export enum PlayerAction {
  SELECT_CARD = 'SELECT_CARD',
  PLAY_HAND = 'PLAY_HAND',
  DISCARD = 'DISCARD',
  USE_CONSUMABLE = 'USE_CONSUMABLE',
  PURCHASE_ITEM = 'PURCHASE_ITEM',
  REROLL_SHOP = 'REROLL_SHOP',
  EXIT_SHOP = 'EXIT_SHOP',
}

/**
 * Notification types for user feedback
 */
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

/**
 * Notification message structure
 */
export interface Notification {
  id: EntityId;
  type: NotificationType;
  message: string;
  duration?: number;
}

/**
 * Statistics tracking structure
 */
export interface GameStatistics {
  totalGamesPlayed: number;
  totalGamesWon: number;
  highestScore: number;
  highestRound: number;
  totalHandsPlayed: number;
  favoriteHandType: string | null;
  totalMoneyEarned: number;
  totalMoneySpent: number;
}

/**
 * Settings structure
 */
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  showTutorial: boolean;
  cardStyle: 'classic' | 'modern';
}

/**
 * Serializable game save data
 */
export interface SaveData {
  version: string;
  timestamp: number;
  gameState: Record<string, unknown>;
  statistics: GameStatistics;
}

/**
 * Event callback types
 */
export type CardEventHandler = (cardId: EntityId) => void;
export type ScoreEventHandler = (score: number) => void;
export type ShopEventHandler = (itemId: EntityId) => void;
export type GameEventHandler = () => void;

/**
 * Utility type for readonly arrays
 */
export type ReadonlyArray<T> = readonly T[];

/**
 * Utility type for partial deep objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type for making specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Color theme type
 */
export interface ColorTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

/**
 * Filter function type
 */
export type FilterFunction<T> = (item: T) => boolean;

/**
 * Comparator function type
 */
export type ComparatorFunction<T> = (a: T, b: T) => number;

/**
 * Extend Window interface for custom properties
 */
declare global {
  interface Window {
    gameDebug?: {
      getGameState: () => unknown;
      setMoney: (amount: number) => void;
      skipToRound: (round: number) => void;
    };
  }
}