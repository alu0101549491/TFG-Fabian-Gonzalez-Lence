// ============================================
// FILE: src/utils/constants.ts
// ============================================

/**
 * Game constants and configuration values.
 * All magic numbers and strings are centralized here for easy balancing.
 */

/**
 * Game configuration constants.
 */
export const GAME_CONFIG = {
  INITIAL_MONEY: 5,
  MAX_JOKERS: 5,
  MAX_CONSUMABLES: 2,
  HAND_SIZE: 8,
  MAX_CARDS_TO_PLAY: 5,  // Maximum cards that can be played in one hand
  MAX_HANDS_PER_BLIND: 3,
  MAX_DISCARDS_PER_BLIND: 3,
  VICTORY_ROUNDS: 8,
  LEVELS_PER_ROUND: 3,  // Number of blinds (small, big, boss) per round
};

/**
 * Shop configuration constants.
 */
export const SHOP_CONFIG = {
  JOKER_COST: 5,
  PLANET_COST: 3,
  TAROT_COST: 3,
  REROLL_COST: 3,
  ITEMS_PER_SHOP: 4,
};

/**
 * Tarot card effect constants.
 */
export const TAROT_CONFIG = {
  HERMIT_MAX_MONEY_BONUS: 20,  // Maximum money The Hermit can give
};

/**
 * Blind reward constants.
 */
export const BLIND_REWARDS = {
  SMALL_BLIND: 2,
  BIG_BLIND: 5,
  BOSS_BLIND: 10,
};

/**
 * Color palette constants.
 * 
 * IMPORTANT: These colors are the single source of truth for the application.
 * They are automatically applied to CSS custom properties via apply-theme.ts.
 * 
 * To change colors across the entire application:
 * 1. Modify the values in this COLORS object
 * 2. Refresh the page - changes will be applied automatically
 * 
 * No need to edit CSS files directly!
 */
export const COLORS = {
  // Theme Colors - Main backgrounds and UI elements
  BG_PRIMARY: '#1a1a2e',      // Main app background (dark navy)
  BG_PANEL: '#16213e',        // Panel/card container background (darker navy)
  BORDER: '#0f3460',          // Border color for panels and cards (blue-navy)
  ACCENT: '#e94560',          // Primary accent color (red-pink)

  // Text Colors - For readable text on dark backgrounds
  TEXT_PRIMARY: '#f1f1f1',    // Primary text color (light gray)
  TEXT_SECONDARY: '#a8a8a8',  // Secondary/muted text color (medium gray)
  TEXT_TERTIARY: '#4f4f4fff', // Tertiary/more muted text color (dark gray)

  // Suit Colors - For card suits (diamonds, hearts, spades, clubs)
  SUIT_DIAMONDS: '#e89230',   // Orange for diamonds ♦
  SUIT_HEARTS: '#d62d46',     // Red for hearts ♥
  SUIT_SPADES: '#061413',     // Black for spades ♠
  SUIT_CLUBS: '#3cc264',      // Green for clubs ♣

  // Indicator Colors - For chips, mult, money displays
  CHIPS: '#f9ca24',           // Yellow/gold for chip count
  MULT: '#6c5ce7',            // Purple for multiplier
  MONEY: '#00d2d3',           // Cyan for money/currency
  SUCCESS: '#2ecc71',         // Green for success states
  WARNING: '#95a5a6',         // Gray for warning states
  ERROR: '#e74c3c',           // Red for error states

  // Victory Modal Colors - Green theme for blind completion
  VICTORY_BG_START: '#1a472a',    // Dark green gradient start
  VICTORY_BG_END: '#2d5a3d',      // Dark green gradient end
  VICTORY_BORDER: '#4ade80',      // Bright green border/glow
  VICTORY_TEXT: '#86efac',        // Light green text
  VICTORY_TITLE: '#4ade80',       // Bright green title
  VICTORY_BTN_START: '#22c55e',   // Green button gradient start
  VICTORY_BTN_END: '#16a34a',     // Green button gradient end
  VICTORY_BTN_HOVER_START: '#16a34a',  // Green button hover start
  VICTORY_BTN_HOVER_END: '#15803d',    // Green button hover end

  // Defeat Modal Colors - Red theme for blind failure
  DEFEAT_BG_START: '#4a1a1a',     // Dark red gradient start
  DEFEAT_BG_END: '#5a2d2d',       // Dark red gradient end
  DEFEAT_BORDER: '#ef4444',       // Bright red border/glow
  DEFEAT_TEXT: '#fca5a5',         // Light red text
  DEFEAT_TITLE: '#ef4444',        // Bright red title
  DEFEAT_BTN_START: '#dc2626',    // Red button gradient start
  DEFEAT_BTN_END: '#b91c1c',      // Red button gradient end
  DEFEAT_BTN_HOVER_START: '#b91c1c',   // Red button hover start
  DEFEAT_BTN_HOVER_END: '#991b1b',     // Red button hover end
};

/**
 * Suit symbols constants.
 */
export const SUIT_SYMBOLS = {
  DIAMONDS: '♦',
  HEARTS: '♥',
  SPADES: '♠',
  CLUBS: '♣',
};

/**
 * Card value display constants.
 */
export const CARD_VALUE_DISPLAY = {
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
};

/**
 * Base card values (chips).
 */
export const BASE_CARD_VALUES = {
  ACE: 11,
  KING: 10,
  QUEEN: 10,
  JACK: 10,
  TEN: 10,
  NINE: 9,
  EIGHT: 8,
  SEVEN: 7,
  SIX: 6,
  FIVE: 5,
  FOUR: 4,
  THREE: 3,
  TWO: 2,
};

/**
 * Base hand values (chips and mult).
 */
export const BASE_HAND_VALUES = {
  HIGH_CARD: { chips: 5, mult: 1 },
  PAIR: { chips: 10, mult: 2 },
  TWO_PAIR: { chips: 20, mult: 2 },
  THREE_OF_A_KIND: { chips: 30, mult: 3 },
  STRAIGHT: { chips: 30, mult: 4 },
  FLUSH: { chips: 35, mult: 4 },
  FULL_HOUSE: { chips: 40, mult: 4 },
  FOUR_OF_A_KIND: { chips: 60, mult: 7 },
  STRAIGHT_FLUSH: { chips: 100, mult: 8 },
};

/**
 * Planet upgrades constants.
 */
export const PLANET_UPGRADES = {
  PLUTO: { handType: 'HIGH_CARD', chips: 10, mult: 1 },
  MERCURY: { handType: 'PAIR', chips: 15, mult: 1 },
  URANUS: { handType: 'TWO_PAIR', chips: 20, mult: 1 },
  VENUS: { handType: 'THREE_OF_A_KIND', chips: 20, mult: 2 },
  SATURN: { handType: 'STRAIGHT', chips: 30, mult: 3 },
  JUPITER: { handType: 'FLUSH', chips: 15, mult: 2 },
  EARTH: { handType: 'FULL_HOUSE', chips: 25, mult: 2 },
  MARS: { handType: 'FOUR_OF_A_KIND', chips: 30, mult: 3 },
  NEPTUNE: { handType: 'STRAIGHT_FLUSH', chips: 40, mult: 4 },
};

/**
 * Difficulty progression constants.
 */
export const DIFFICULTY_CONFIG = {
  BASE_GOAL: 300,
  GROWTH_RATE: 1.5,
  SMALL_BLIND_MULTIPLIER: 1.0,
  BIG_BLIND_MULTIPLIER: 1.5,
  BOSS_BLIND_MULTIPLIER: 2.0,
};

/**
 * Animation timing constants.
 */
export const ANIMATION_TIMING = {
  CARD_DEAL_DELAY: 50, // ms between cards
  CARD_TRANSITION: 200, // ms for card animations
  SCORE_INCREMENT: 400, // ms for score counting
  SHOP_TRANSITION: 300, // ms for shop opening
};

/**
 * Storage keys.
 */
export const STORAGE_KEYS = {
  GAME_SAVE: 'miniBalatro_save',
  SETTINGS: 'miniBalatro_settings',
  STATISTICS: 'miniBalatro_stats',
};

/**
 * UI configuration constants.
 */
export const UI_CONFIG = {
  MIN_SCREEN_WIDTH: 1024,
  MIN_SCREEN_HEIGHT: 768,
  CARD_WIDTH: 100,
  CARD_HEIGHT: 140,
  CARD_BORDER_RADIUS: 8,
};

/**
 * Calculates the score goal for a blind.
 * Formula: base × (growthRate)^(round-1) × blindMultiplier
 * @param roundNumber - Current round number
 * @param blindType - Type of blind ('small', 'big', or 'boss')
 * @returns Calculated score goal
 */
export function calculateBlindGoal(
  roundNumber: number,
  blindType: 'small' | 'big' | 'boss'
): number {
  const base = DIFFICULTY_CONFIG.BASE_GOAL;
  const growth = Math.pow(DIFFICULTY_CONFIG.GROWTH_RATE, roundNumber - 1);

  let multiplier: number;
  switch (blindType) {
    case 'small':
      multiplier = DIFFICULTY_CONFIG.SMALL_BLIND_MULTIPLIER;
      break;
    case 'big':
      multiplier = DIFFICULTY_CONFIG.BIG_BLIND_MULTIPLIER;
      break;
    case 'boss':
      multiplier = DIFFICULTY_CONFIG.BOSS_BLIND_MULTIPLIER;
      break;
    default:
      throw new Error(`Invalid blind type: ${blindType}`);
  }

  return Math.floor(base * growth * multiplier);
}

/**
 * Returns the CSS color for a suit.
 * @param suit - Suit name
 * @returns CSS color string
 */
export function getSuitColor(suit: string): string {
  switch (suit.toUpperCase()) {
    case 'DIAMONDS':
      return COLORS.SUIT_DIAMONDS;
    case 'HEARTS':
      return COLORS.SUIT_HEARTS;
    case 'SPADES':
      return COLORS.SUIT_SPADES;
    case 'CLUBS':
      return COLORS.SUIT_CLUBS;
    default:
      return COLORS.TEXT_PRIMARY;
  }
}

/**
 * Returns the Unicode symbol for a suit.
 * @param suit - Suit name
 * @returns Unicode symbol
 */
export function getSuitSymbol(suit: string): string {
  switch (suit.toUpperCase()) {
    case 'DIAMONDS':
      return SUIT_SYMBOLS.DIAMONDS;
    case 'HEARTS':
      return SUIT_SYMBOLS.HEARTS;
    case 'SPADES':
      return SUIT_SYMBOLS.SPADES;
    case 'CLUBS':
      return SUIT_SYMBOLS.CLUBS;
    default:
      return '?';
  }
}

/**
 * Formats money amount with dollar sign.
 * @param amount - Money amount
 * @returns Formatted string
 */
export function formatMoney(amount: number): string {
  return `$${amount}`;
}

/**
 * Formats score with thousands separator.
 * @param score - Score value
 * @returns Formatted string
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}