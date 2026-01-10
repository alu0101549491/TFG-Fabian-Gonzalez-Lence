import {Card} from '../core/card';
import {HandType} from '../poker/hand-type.enum';

/**
 * Represents the current state during score calculation.
 * Tracks chips, mult, and contextual information for joker effects.
 */
export class ScoreContext {
  public chips: number;
  public mult: number;
  public playedCards: Card[];
  public handType: HandType;
  public remainingDeckSize: number;

  /**
   * Creates a new ScoreContext instance.
   * @param {number} chips - Initial chips
   * @param {number} mult - Initial multiplier
   * @param {Card[]} playedCards - Cards in the played hand
   * @param {HandType} handType - Type of poker hand
   * @param {number} remainingDeckSize - Cards left in deck
   */
  constructor(
      chips: number,
      mult: number,
      playedCards: Card[],
      handType: HandType,
      remainingDeckSize: number
  ) {
    this.chips = chips;
    this.mult = mult;
    this.playedCards = playedCards;
    this.handType = handType;
    this.remainingDeckSize = remainingDeckSize;
  }
}