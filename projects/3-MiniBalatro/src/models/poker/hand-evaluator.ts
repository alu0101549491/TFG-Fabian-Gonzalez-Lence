// ============================================
// FILE: src/models/poker/hand-evaluator.ts
// ============================================

import { Card } from '../core/card';
import { CardValue } from '../core/card-value.enum';
import { HandType, getBaseHandValues } from './hand-type.enum';
import { HandResult } from './hand-result';
import { HandUpgradeManager } from './hand-upgrade-manager';

/**
 * Evaluates sets of cards to determine poker hand types.
 * Applies recognition hierarchy and supports 1-5 card hands.
 */
export class HandEvaluator {
  private readonly handRankings: HandType[];

  /**
   * Initializes hand evaluator with proper hand ranking order.
   */
  constructor() {
    this.handRankings = [
      HandType.STRAIGHT_FLUSH,
      HandType.FOUR_OF_A_KIND,
      HandType.FULL_HOUSE,
      HandType.FLUSH,
      HandType.STRAIGHT,
      HandType.THREE_OF_A_KIND,
      HandType.TWO_PAIR,
      HandType.PAIR,
      HandType.HIGH_CARD
    ];
  }

  /**
   * Evaluates cards and returns best possible hand with upgraded base values.
   * @param cards - Array of cards to evaluate (1-5 cards)
   * @param upgradeManager - Manager for hand upgrade bonuses
   * @returns HandResult with best hand detected and upgraded base values
   * @throws Error if cards array is empty, has more than 5 cards, or upgradeManager is null
   */
  public evaluateHand(cards: Card[], upgradeManager: HandUpgradeManager): HandResult {
    if (!cards || cards.length === 0 || cards.length > 5) {
      throw new Error('Cards array must contain between 1 and 5 cards');
    }
    if (!upgradeManager) {
      throw new Error('Upgrade manager cannot be null');
    }

    // Get the hand type using the shared detection logic
    const handType = this.getHandType(cards);

    // Sort cards by value for the result
    const sortedCards = [...cards].sort((a, b) => {
      return b.value.localeCompare(a.value);
    });

    const baseValues = getBaseHandValues(handType);
    const upgrade = upgradeManager.getUpgradedValues(handType);

    const result = new HandResult(
      handType,
      sortedCards,
      baseValues.baseChips + upgrade.additionalChips,
      baseValues.baseMult + upgrade.additionalMult
    );

    console.log(`Hand evaluated as ${handType} with ${result.baseChips} chips and ${result.baseMult}x mult`);
    return result;
  }

  /**
   * Determines hand type without returning full result.
   * @param cards - Array of cards to evaluate (1-5 cards)
   * @returns Best HandType detected
   * @throws Error if cards array is empty or has more than 5 cards
   */
  public getHandType(cards: Card[]): HandType {
    if (!cards || cards.length === 0 || cards.length > 5) {
      throw new Error('Cards array must contain between 1 and 5 cards');
    }

    // Sort cards by value for easier evaluation
    const sortedCards = [...cards].sort((a, b) => {
      return b.value.localeCompare(a.value);
    });

    // Check each hand type in priority order
    return this.detectHandType(sortedCards);
  }

  /**
   * Core hand detection logic used by both evaluateHand and getHandType.
   * @param sortedCards - Pre-sorted array of cards
   * @returns Best HandType detected
   */
  private detectHandType(sortedCards: Card[]): HandType {
    for (const handType of this.handRankings) {
      let isMatch = false;

      switch (handType) {
        case HandType.STRAIGHT_FLUSH:
          isMatch = this.checkStraightFlush(sortedCards);
          break;
        case HandType.FOUR_OF_A_KIND:
          isMatch = this.checkFourOfAKind(sortedCards);
          break;
        case HandType.FULL_HOUSE:
          isMatch = this.checkFullHouse(sortedCards);
          break;
        case HandType.FLUSH:
          isMatch = this.checkFlush(sortedCards);
          break;
        case HandType.STRAIGHT:
          isMatch = this.checkStraight(sortedCards);
          break;
        case HandType.THREE_OF_A_KIND:
          isMatch = this.checkThreeOfAKind(sortedCards);
          break;
        case HandType.TWO_PAIR:
          isMatch = this.checkTwoPair(sortedCards);
          break;
        case HandType.PAIR:
          isMatch = this.checkPair(sortedCards);
          break;
        case HandType.HIGH_CARD:
          isMatch = true; // Always matches if no other hand detected
          break;
      }

      if (isMatch) {
        return handType;
      }
    }

    // This should never happen due to HIGH_CARD always matching
    throw new Error('Failed to determine hand type');
  }

  /**
   * Checks if cards form a straight flush.
   * @param cards - Sorted array of cards
   * @returns True if all cards same suit and sequential values
   */
  private checkStraightFlush(cards: Card[]): boolean {
    if (cards.length < 5) return false;

    // All cards must be same suit
    const firstSuit = cards[0].suit;
    if (!cards.every(card => card.suit === firstSuit)) {
      return false;
    }

    // Must also be a straight
    return this.checkStraight(cards);
  }

  /**
   * Checks if cards contain four of the same value.
   * @param cards - Sorted array of cards
   * @returns True if 4 cards have same value
   */
  private checkFourOfAKind(cards: Card[]): boolean {
    if (cards.length < 4) return false;

    // Check first four cards
    if (cards[0].value === cards[1].value &&
        cards[1].value === cards[2].value &&
        cards[2].value === cards[3].value) {
      return true;
    }

    // Check last four cards
    if (cards[1].value === cards[2].value &&
        cards[2].value === cards[3].value &&
        cards[3].value === cards[4].value) {
      return true;
    }

    return false;
  }

  /**
   * Checks if cards form full house (3 of a kind + pair).
   * @param cards - Sorted array of cards
   * @returns True if contains three of one value and two of another
   */
  private checkFullHouse(cards: Card[]): boolean {
    if (cards.length < 5) return false;

    // Pattern: 3 same + 2 same
    // Check for three of first value and two of fourth value
    if (cards[0].value === cards[1].value &&
        cards[1].value === cards[2].value &&
        cards[3].value === cards[4].value) {
      return true;
    }

    // Check for two of first value and three of fourth value
    if (cards[0].value === cards[1].value &&
        cards[2].value === cards[3].value &&
        cards[3].value === cards[4].value) {
      return true;
    }

    return false;
  }

  /**
   * Checks if all cards have same suit.
   * @param cards - Array of cards
   * @returns True if all cards same suit
   */
  private checkFlush(cards: Card[]): boolean {
    if (cards.length < 5) return false;

    const firstSuit = cards[0].suit;
    return cards.every(card => card.suit === firstSuit);
  }

  /**
   * Checks if cards have sequential values (including Ace low/high).
   * @param cards - Sorted array of cards
   * @returns True if values are sequential
   */
  private checkStraight(cards: Card[]): boolean {
    if (cards.length < 5) return false;

    // Handle Ace-low straight (A-2-3-4-5)
    if (cards[0].value === CardValue.ACE &&
        cards[1].value === CardValue.FIVE &&
        cards[2].value === CardValue.FOUR &&
        cards[3].value === CardValue.THREE &&
        cards[4].value === CardValue.TWO) {
      return true;
    }

    // Handle normal straight
    for (let i = 0; i < cards.length - 1; i++) {
      const currentValue = cards[i].value;
      const nextValue = cards[i + 1].value;

      // Get the expected next value in sequence
      let expectedNextValue: CardValue;

      // Special case for Ace-King (Ace is high)
      if (currentValue === CardValue.ACE && nextValue === CardValue.KING) {
        continue;
      }

      // Get the next value in sequence
      expectedNextValue = this.getNextValueInSequence(currentValue);

      if (nextValue !== expectedNextValue) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the next value in sequence for straight detection.
   * @param currentValue - The current card value
   * @returns The next value in sequence
   */
  private getNextValueInSequence(currentValue: CardValue): CardValue {
    switch (currentValue) {
      case CardValue.ACE: return CardValue.KING;
      case CardValue.KING: return CardValue.QUEEN;
      case CardValue.QUEEN: return CardValue.JACK;
      case CardValue.JACK: return CardValue.TEN;
      case CardValue.TEN: return CardValue.NINE;
      case CardValue.NINE: return CardValue.EIGHT;
      case CardValue.EIGHT: return CardValue.SEVEN;
      case CardValue.SEVEN: return CardValue.SIX;
      case CardValue.SIX: return CardValue.FIVE;
      case CardValue.FIVE: return CardValue.FOUR;
      case CardValue.FOUR: return CardValue.THREE;
      case CardValue.THREE: return CardValue.TWO;
      case CardValue.TWO: return CardValue.ACE; // Shouldn't happen in sorted array
      default: return currentValue;
    }
  }

  /**
   * Checks if cards contain three of the same value.
   * @param cards - Sorted array of cards
   * @returns True if 3 cards have same value
   */
  private checkThreeOfAKind(cards: Card[]): boolean {
    if (cards.length < 3) return false;

    // Check first three cards
    if (cards[0].value === cards[1].value && cards[1].value === cards[2].value) {
      return true;
    }

    // Check middle three cards
    if (cards[1].value === cards[2].value && cards[2].value === cards[3].value) {
      return true;
    }

    // Check last three cards
    if (cards[2].value === cards[3].value && cards[3].value === cards[4].value) {
      return true;
    }

    return false;
  }

  /**
   * Checks if cards contain two different pairs.
   * @param cards - Sorted array of cards
   * @returns True if two different values each appear twice
   */
  private checkTwoPair(cards: Card[]): boolean {
    if (cards.length < 4) return false;

    // Find all pairs
    const pairs: CardValue[] = [];

    for (let i = 0; i < cards.length - 1; i++) {
      if (cards[i].value === cards[i + 1].value) {
        // Skip the next card to avoid counting the same pair twice
        pairs.push(cards[i].value);
        i++;
      }
    }

    // Need at least two different pairs
    return pairs.length >= 2;
  }

  /**
   * Checks if cards contain at least one pair.
   * @param cards - Sorted array of cards
   * @returns True if 2 cards have same value
   */
  private checkPair(cards: Card[]): boolean {
    if (cards.length < 2) return false;

    for (let i = 0; i < cards.length - 1; i++) {
      if (cards[i].value === cards[i + 1].value) {
        return true;
      }
    }

    return false;
  }
}