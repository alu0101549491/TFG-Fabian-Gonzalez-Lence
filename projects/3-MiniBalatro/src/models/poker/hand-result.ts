import {HandType} from './hand-type.enum';
import {Card} from '../core/card';

/**
 * Represents the result of evaluating a poker hand.
 * Contains the hand type and base scoring values.
 */
export class HandResult {
  public handType: HandType;
  public cards: Card[];
  public baseChips: number;
  public baseMult: number;

  /**
   * Creates a new HandResult instance.
   * @param {HandType} handType - Type of poker hand detected
   * @param {Card[]} cards - Cards that form the hand
   * @param {number} baseChips - Base chip value for this hand type
   * @param {number} baseMult - Base multiplier value for this hand type
   */
  constructor(
      handType: HandType,
      cards: Card[],
      baseChips: number,
      baseMult: number
  ) {
    this.handType = handType;
    this.cards = cards;
    this.baseChips = baseChips;
    this.baseMult = baseMult;
  }
}