// ============================================
// FILE: src/utils/helpers.ts
// ============================================

import { COLORS, SUIT_SYMBOLS, DIFFICULTY_CONFIG } from './constants';

/**
 * Calculates the score goal for a blind using Balatro's difficulty curve.
 * Uses predefined base values for each round with multipliers for blind types.
 * @param roundNumber - Current round number (1-8)
 * @param blindType - Type of blind ('small', 'big', or 'boss')
 * @returns Calculated score goal
 */
export function calculateBlindGoal(
  roundNumber: number,
  blindType: 'small' | 'big' | 'boss'
): number {
  // Get base value for the round (rounds beyond 8 use round 8's value)
  const baseIndex = Math.min(roundNumber - 1, DIFFICULTY_CONFIG.ROUND_BASE_VALUES.length - 1);
  const base = DIFFICULTY_CONFIG.ROUND_BASE_VALUES[baseIndex];

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

  return Math.floor(base * multiplier);
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
