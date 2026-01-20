// ============================================
// FILE: src/models/scoring/score-context.ts
// ============================================

import { Card } from '../core/card';
import { HandType } from '../poker/hand-type.enum';

/**
 * Holds intermediate state during score calculation.
 * Tracks accumulating chips and mult as effects are applied.
 */
export class ScoreContext {
  /**
   * Creates a score context with initial values.
   * @param chips - Initial chip value
   * @param mult - Initial mult value
   * @param playedCards - Cards that contribute to scoring (not all played cards)
   * @param handType - Detected poker hand type
   * @param remainingDeckSize - Cards remaining in deck
   * @param emptyJokerSlots - Number of empty joker slots (5 - active jokers)
   * @param discardsRemaining - Number of discards remaining this round
   * @throws Error if chips or mult negative, or playedCards empty
   */
  constructor(
    public chips: number,
    public mult: number,
    public readonly playedCards: Card[],
    public readonly handType: HandType,
    public readonly remainingDeckSize: number,
    public readonly emptyJokerSlots: number,
    public readonly discardsRemaining: number,
  ) {
    if (chips < 0 || mult < 0) {
      throw new Error('Chips and mult must be non-negative');
    }
    if (!playedCards || playedCards.length === 0) {
      throw new Error('Played cards array cannot be empty');
    }
    if (remainingDeckSize < 0) {
      throw new Error('Remaining deck size cannot be negative');
    }
    if (emptyJokerSlots < 0 || emptyJokerSlots > 5) {
      throw new Error('Empty joker slots must be between 0 and 5');
    }
    if (discardsRemaining < 0) {
      throw new Error('Discards remaining cannot be negative');
    }
  }

  /**
   * Adds chips to the current total.
   * @param amount - Amount to add
   * @throws Error if amount is negative
   */
  public addChips(amount: number): void {
    if (amount < 0) {
      throw new Error('Chip amount cannot be negative');
    }
    this.chips += amount;
  }

  /**
   * Adds mult to the current total.
   * @param amount - Amount to add
   * @throws Error if amount is negative
   */
  public addMult(amount: number): void {
    if (amount < 0) {
      throw new Error('Mult amount cannot be negative');
    }
    this.mult += amount;
  }

  /**
   * Multiplies current mult by a multiplier.
   * @param multiplier - Factor to multiply by
   * @throws Error if multiplier < 1
   */
  public multiplyMult(multiplier: number): void {
    if (multiplier < 1) {
      throw new Error('Multiplier must be at least 1');
    }
    this.mult *= multiplier;
  }
}
