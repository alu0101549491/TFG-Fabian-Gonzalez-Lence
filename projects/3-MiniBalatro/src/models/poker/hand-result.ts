// ============================================
// FILE: src/models/poker/hand-result.ts
// ============================================

import { HandType } from './hand-type.enum';
import { Card } from '../core/card';

/**
 * Encapsulates the result of evaluating a poker hand.
 * Contains hand type, cards, scoring cards, and base scoring values.
 */
export class HandResult {
  /**
   * Creates a hand result with evaluated hand data.
   * @param handType - The detected poker hand type
   * @param cards - All cards that were played
   * @param scoringCards - Cards that contribute chips to the score
   * @param baseChips - Base chips for this hand type (including upgrades)
   * @param baseMult - Base mult for this hand type (including upgrades)
   * @throws Error if cards array is empty or base values are negative
   */
  constructor(
    public readonly handType: HandType,
    public readonly cards: Card[],
    public readonly scoringCards: Card[],
    public readonly baseChips: number,
    public readonly baseMult: number
  ) {
    if (cards.length === 0) {
      throw new Error('Cards array cannot be empty');
    }
    if (scoringCards.length === 0) {
      throw new Error('Scoring cards array cannot be empty');
    }
    if (baseChips < 0 || baseMult < 0) {
      throw new Error('Base values cannot be negative');
    }
  }
}
