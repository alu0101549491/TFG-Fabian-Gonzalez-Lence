/**
 * Application-wide constants and magic numbers.
 * Centralizes values used across multiple modules.
 */

/**
 * Game timing constants (in milliseconds)
 */
export const ANIMATION_DURATION = {
  CARD_FLIP: 300,
  CARD_DEAL: 150,
  CARD_DISCARD: 200,
  SCORE_COUNT_UP: 1000,
  TRANSITION: 500,
} as const;

/**
 * UI dimension constants (in pixels)
 */
export const UI_DIMENSIONS = {
  CARD_WIDTH: 80,
  CARD_HEIGHT: 112,
  CARD_SPACING: 10,
  JOKER_SIZE: 60,
  HAND_MAX_WIDTH: 800,
} as const;

/**
 * Scoring multiplier tiers for visual feedback
 */
export const SCORE_TIERS = {
  LOW: 1000,
  MEDIUM: 5000,
  HIGH: 10000,
  EXTREME: 50000,
} as const;

/**
 * Color scheme for card suits
 */
export const SUIT_COLORS = {
  DIAMONDS: '#e74c3c',
  HEARTS: '#e74c3c',
  SPADES: '#2c3e50',
  CLUBS: '#2c3e50',
} as const;

/**
 * Z-index layers for proper element stacking
 */
export const Z_INDEX = {
  BACKGROUND: 0,
  CARDS: 10,
  SELECTED_CARD: 20,
  JOKERS: 30,
  MODALS: 100,
  TOOLTIPS: 200,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  GAME_SAVE: 'mini-balatro-save',
  SETTINGS: 'mini-balatro-settings',
  HIGH_SCORES: 'mini-balatro-high-scores',
} as const;

/**
 * Game progression constants
 */
export const PROGRESSION = {
  MAX_ROUNDS: 24,
  ROUNDS_PER_ANTE: 3,
  VICTORY_ROUND: 24,
} as const;

/**
 * Shop configuration
 */
export const SHOP_CONFIG = {
  BASE_REROLL_COST: 5,
  REROLL_COST_INCREMENT: 2,
  MAX_ITEMS: 6,
  JOKER_SLOTS: 2,
  CONSUMABLE_SLOTS: 2,
} as const;

/**
 * Debug flags
 */
export const DEBUG = {
  SHOW_CARD_IDS: false,
  SKIP_ANIMATIONS: false,
  INFINITE_MONEY: false,
  UNLOCK_ALL_JOKERS: false,
} as const;

/**
 * Mathematical constants used in calculations
 */
export const MATH_CONSTANTS = {
  SCORE_SCALING_BASE: 1.5,
  BLIND_DIFFICULTY_EXPONENT: 1.6,
  BOSS_MULTIPLIER: 2.0,
} as const;

/**
 * Card value display names
 */
export const CARD_VALUE_NAMES: Record<string, string> = {
  ACE: 'A',
  KING: 'K',
  QUEEN: 'Q',
  JACK: 'J',
  TEN: '10',
  NINE: '9',
  EIGHT: '8',
  SEVEN: '7',
  SIX: '6',
  FIVE: '5',
  FOUR: '4',
  THREE: '3',
  TWO: '2',
} as const;

/**
 * Suit display symbols
 */
export const SUIT_SYMBOLS: Record<string, string> = {
  DIAMONDS: '♦',
  HEARTS: '♥',
  SPADES: '♠',
  CLUBS: '♣',
} as const;

/**
 * Hand type display names
 */
export const HAND_TYPE_NAMES: Record<string, string> = {
  STRAIGHT_FLUSH: 'Straight Flush',
  FOUR_OF_A_KIND: 'Four of a Kind',
  FULL_HOUSE: 'Full House',
  FLUSH: 'Flush',
  STRAIGHT: 'Straight',
  THREE_OF_A_KIND: 'Three of a Kind',
  TWO_PAIR: 'Two Pair',
  PAIR: 'Pair',
  HIGH_CARD: 'High Card',
} as const;