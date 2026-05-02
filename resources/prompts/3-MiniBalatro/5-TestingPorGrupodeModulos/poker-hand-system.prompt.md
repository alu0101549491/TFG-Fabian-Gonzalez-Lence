# TESTING CONTEXT
Project: Mini Balatro
Components under test: HandEvaluator, HandUpgradeManager, HandResult, HandUpgrade, HandType (enum)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/models/poker/hand-type.enum.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/poker/hand-type.enum.ts
 * @desc Hand type enumeration for poker hands in priority order.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enum representing all poker hand types in priority order.
 * Higher priority hands are checked first during evaluation.
 */
export enum HandType {
  STRAIGHT_FLUSH = 'STRAIGHT_FLUSH',
  FOUR_OF_A_KIND = 'FOUR_OF_A_KIND',
  FULL_HOUSE = 'FULL_HOUSE',
  FLUSH = 'FLUSH',
  STRAIGHT = 'STRAIGHT',
  THREE_OF_A_KIND = 'THREE_OF_A_KIND',
  TWO_PAIR = 'TWO_PAIR',
  PAIR = 'PAIR',
  HIGH_CARD = 'HIGH_CARD'
}

/**
 * Returns the display name for a hand type.
 * @param handType - The hand type to get display name for
 * @returns The display name (e.g., "Straight Flush")
 */
export function getHandTypeDisplayName(handType: HandType): string {
  switch (handType) {
    case HandType.STRAIGHT_FLUSH: return 'Straight Flush';
    case HandType.FOUR_OF_A_KIND: return 'Four of a Kind';
    case HandType.FULL_HOUSE: return 'Full House';
    case HandType.FLUSH: return 'Flush';
    case HandType.STRAIGHT: return 'Straight';
    case HandType.THREE_OF_A_KIND: return 'Three of a Kind';
    case HandType.TWO_PAIR: return 'Two Pair';
    case HandType.PAIR: return 'Pair';
    case HandType.HIGH_CARD: return 'High Card';
    default: return 'Unknown Hand';
  }
}

/**
 * Returns the base chips and mult values for a hand type.
 * @param handType - The hand type to get base values for
 * @returns Object with baseChips and baseMult properties
 */
export function getBaseHandValues(handType: HandType): { baseChips: number; baseMult: number } {
  const handValues: Record<HandType, { baseChips: number; baseMult: number }> = {
    [HandType.STRAIGHT_FLUSH]: { baseChips: 100, baseMult: 8 },
    [HandType.FOUR_OF_A_KIND]: { baseChips: 60, baseMult: 7 },
    [HandType.FULL_HOUSE]: { baseChips: 40, baseMult: 4 },
    [HandType.FLUSH]: { baseChips: 35, baseMult: 4 },
    [HandType.STRAIGHT]: { baseChips: 30, baseMult: 4 },
    [HandType.THREE_OF_A_KIND]: { baseChips: 30, baseMult: 3 },
    [HandType.TWO_PAIR]: { baseChips: 20, baseMult: 2 },
    [HandType.PAIR]: { baseChips: 10, baseMult: 2 },
    [HandType.HIGH_CARD]: { baseChips: 5, baseMult: 1 }
  };
  return handValues[handType];
}
```

## File 2: src/models/poker/hand-upgrade.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/poker/hand-upgrade.ts
 * @desc Permanent bonuses applied to a poker hand type from planet cards.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Represents permanent bonuses applied to a poker hand type.
 * Used for tracking planet card upgrades.
 */
export class HandUpgrade {
  public level: number;

  /**
   * Creates a hand upgrade with specified bonuses.
   * @param additionalChips - Bonus chips to add to base chips
   * @param additionalMult - Bonus mult to add to base mult
   * @throws Error if negative values are provided
   */
  constructor(
    public additionalChips: number = 0,
    public additionalMult: number = 0
  ) {
    if (additionalChips < 0 || additionalMult < 0) {
      throw new Error('Upgrade values cannot be negative');
    }
    this.level = 1; // All hands start at level 1
  }

  /**
   * Adds more bonuses to existing upgrade.
   * @param chips - Additional chips to add
   * @param mult - Additional mult to add
   * @throws Error if negative values are provided
   */
  public addUpgrade(chips: number, mult: number): void {
    if (chips < 0 || mult < 0) {
      throw new Error('Upgrade values cannot be negative');
    }
    this.additionalChips += chips;
    this.additionalMult += mult;
    this.level++; // Each planet card increases level by 1
  }
}
```

## File 3: src/models/poker/hand-result.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/poker/hand-result.ts
 * @desc Result of evaluating a poker hand with scoring values.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

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
```

## File 4: src/models/poker/hand-evaluator.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/poker/hand-evaluator.ts
 * @desc Evaluates sets of cards to determine poker hand types.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

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

    // Sort cards by value for the result (highest to lowest)
    const valueOrder: Record<CardValue, number> = {
      [CardValue.ACE]: 14,
      [CardValue.KING]: 13,
      [CardValue.QUEEN]: 12,
      [CardValue.JACK]: 11,
      [CardValue.TEN]: 10,
      [CardValue.NINE]: 9,
      [CardValue.EIGHT]: 8,
      [CardValue.SEVEN]: 7,
      [CardValue.SIX]: 6,
      [CardValue.FIVE]: 5,
      [CardValue.FOUR]: 4,
      [CardValue.THREE]: 3,
      [CardValue.TWO]: 2
    };

    const sortedCards = [...cards].sort((a, b) => {
      return valueOrder[b.value] - valueOrder[a.value];
    });

    const baseValues = getBaseHandValues(handType);
    const upgrade = upgradeManager.getUpgradedValues(handType);

    // Get the cards that actually contribute to scoring
    const scoringCards = this.getScoringCards(sortedCards, handType);

    const result = new HandResult(
      handType,
      sortedCards,
      scoringCards,
      baseValues.baseChips + upgrade.additionalChips,
      baseValues.baseMult + upgrade.additionalMult
    );

    console.log(`Hand evaluated as ${handType} with ${result.baseChips} chips and ${result.baseMult}x mult`);
    console.log(`Scoring cards: ${scoringCards.length}/${sortedCards.length} cards`);
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

    // Sort cards by value for easier evaluation (highest to lowest)
    const valueOrder: Record<CardValue, number> = {
      [CardValue.ACE]: 14,
      [CardValue.KING]: 13,
      [CardValue.QUEEN]: 12,
      [CardValue.JACK]: 11,
      [CardValue.TEN]: 10,
      [CardValue.NINE]: 9,
      [CardValue.EIGHT]: 8,
      [CardValue.SEVEN]: 7,
      [CardValue.SIX]: 6,
      [CardValue.FIVE]: 5,
      [CardValue.FOUR]: 4,
      [CardValue.THREE]: 3,
      [CardValue.TWO]: 2
    };

    const sortedCards = [...cards].sort((a, b) => {
      return valueOrder[b.value] - valueOrder[a.value];
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

    // Check last four cards (only if we have 5 cards)
    if (cards.length >= 5 &&
        cards[1].value === cards[2].value &&
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

    // Check middle three cards (only if we have at least 4 cards)
    if (cards.length >= 4 && cards[1].value === cards[2].value && cards[2].value === cards[3].value) {
      return true;
    }

    // Check last three cards (only if we have 5 cards)
    if (cards.length >= 5 && cards[2].value === cards[3].value && cards[3].value === cards[4].value) {
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

  /**
   * Gets the cards that contribute chips to the score for a given hand type.
   * @param cards - Sorted array of cards
   * @param handType - The detected hand type
   * @returns Array of cards that should contribute chips
   */
  private getScoringCards(cards: Card[], handType: HandType): Card[] {
    switch (handType) {
      case HandType.STRAIGHT_FLUSH:
      case HandType.FULL_HOUSE:
      case HandType.FLUSH:
      case HandType.STRAIGHT:
        // All 5 cards score
        return [...cards];

      case HandType.FOUR_OF_A_KIND:
        // Only the 4 matching cards score
        return this.extractFourOfAKind(cards);

      case HandType.THREE_OF_A_KIND:
        // Only the 3 matching cards score
        return this.extractThreeOfAKind(cards);

      case HandType.TWO_PAIR:
        // Only the 4 cards forming the two pairs score
        return this.extractTwoPair(cards);

      case HandType.PAIR:
        // Only the 2 matching cards score
        return this.extractPair(cards);

      case HandType.HIGH_CARD:
        // Only the highest card scores
        return [cards[0]]; // Already sorted highest to lowest

      default:
        // Fallback: all cards score
        return [...cards];
    }
  }

  /**
   * Extracts the four cards that form a four of a kind.
   * @param cards - Sorted array of cards
   * @returns Array of 4 matching cards
   */
  private extractFourOfAKind(cards: Card[]): Card[] {
    // Check first four cards
    if (cards[0].value === cards[1].value &&
        cards[1].value === cards[2].value &&
        cards[2].value === cards[3].value) {
      return [cards[0], cards[1], cards[2], cards[3]];
    }

    // Check last four cards
    if (cards.length >= 5 &&
        cards[1].value === cards[2].value &&
        cards[2].value === cards[3].value &&
        cards[3].value === cards[4].value) {
      return [cards[1], cards[2], cards[3], cards[4]];
    }

    // Fallback (shouldn't happen)
    return [...cards];
  }

  /**
   * Extracts the three cards that form a three of a kind.
   * @param cards - Sorted array of cards
   * @returns Array of 3 matching cards
   */
  private extractThreeOfAKind(cards: Card[]): Card[] {
    // Check first three cards
    if (cards[0].value === cards[1].value && cards[1].value === cards[2].value) {
      return [cards[0], cards[1], cards[2]];
    }

    // Check middle three cards
    if (cards.length >= 4 &&
        cards[1].value === cards[2].value &&
        cards[2].value === cards[3].value) {
      return [cards[1], cards[2], cards[3]];
    }

    // Check last three cards
    if (cards.length >= 5 &&
        cards[2].value === cards[3].value &&
        cards[3].value === cards[4].value) {
      return [cards[2], cards[3], cards[4]];
    }

    // Fallback
    return [...cards];
  }

  /**
   * Extracts the four cards that form two pairs.
   * @param cards - Sorted array of cards
   * @returns Array of 4 cards forming two pairs
   */
  private extractTwoPair(cards: Card[]): Card[] {
    const pairCards: Card[] = [];

    for (let i = 0; i < cards.length - 1; i++) {
      if (cards[i].value === cards[i + 1].value) {
        pairCards.push(cards[i], cards[i + 1]);
        i++; // Skip next card to avoid counting same pair twice
      }
    }

    return pairCards;
  }

  /**
   * Extracts the two cards that form a pair.
   * @param cards - Sorted array of cards
   * @returns Array of 2 matching cards
   */
  private extractPair(cards: Card[]): Card[] {
    for (let i = 0; i < cards.length - 1; i++) {
      if (cards[i].value === cards[i + 1].value) {
        return [cards[i], cards[i + 1]];
      }
    }

    // Fallback (shouldn't happen)
    return [cards[0], cards[1]];
  }
}
```

## File 5: src/models/poker/hand-upgrade-manager.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/poker/hand-upgrade-manager.ts
 * @desc Manages permanent upgrades for all poker hand types.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { HandType } from './hand-type.enum';
import { HandUpgrade } from './hand-upgrade';

/**
 * Manages permanent upgrades for all poker hand types.
 * Tracks cumulative bonuses from planet cards.
 */
export class HandUpgradeManager {
  private upgrades: Map<HandType, HandUpgrade>;

  /**
   * Initializes upgrade manager with zero upgrades for all hand types.
   */
  constructor() {
    this.upgrades = new Map<HandType, HandUpgrade>();

    // Initialize all hand types with zero upgrades
    const allHandTypes = Object.values(HandType);
    for (const handType of allHandTypes) {
      this.upgrades.set(handType, new HandUpgrade());
    }
  }

  /**
   * Applies permanent upgrade from planet card to specified hand type.
   * @param handType - The hand type to upgrade
   * @param chips - Additional chips to add
   * @param mult - Additional mult to add
   * @throws Error if handType is invalid or negative values are provided
   */
  public applyPlanetUpgrade(handType: HandType, chips: number, mult: number): void {
    if (!Object.values(HandType).includes(handType)) {
      throw new Error('Invalid hand type');
    }
    if (chips < 0 || mult < 0) {
      throw new Error('Upgrade values cannot be negative');
    }

    const upgrade = this.upgrades.get(handType);
    if (!upgrade) {
      throw new Error(`No upgrade record for hand type ${handType}`);
    }

    upgrade.addUpgrade(chips, mult);
    console.log(`Applied upgrade to ${handType}: +${chips} chips, +${mult} mult`);
  }

  /**
   * Returns current upgrade bonuses for a hand type.
   * @param handType - The hand type to get upgrades for
   * @returns HandUpgrade with current bonuses
   * @throws Error if handType is invalid
   */
  public getUpgradedValues(handType: HandType): HandUpgrade {
    if (!Object.values(HandType).includes(handType)) {
      throw new Error('Invalid hand type');
    }

    const upgrade = this.upgrades.get(handType);
    if (!upgrade) {
      throw new Error(`No upgrade record for hand type ${handType}`);
    }

    return upgrade;
  }

  /**
   * Resets all upgrades to zero (for new game).
   */
  public reset(): void {
    for (const handType of this.upgrades.keys()) {
      this.upgrades.set(handType, new HandUpgrade());
    }
    console.log('All hand upgrades reset');
  }
  
  /**
   * Restores upgrade state from saved data (used for game loading).
   * @param handType - The hand type to restore
   * @param chips - Total accumulated chips
   * @param mult - Total accumulated mult
   * @param level - The hand level
   * @throws Error if handType is invalid or negative values are provided
   */
  public restoreUpgrade(handType: HandType, chips: number, mult: number, level: number): void {
    if (!Object.values(HandType).includes(handType)) {
      throw new Error('Invalid hand type');
    }
    if (chips < 0 || mult < 0 || level < 1) {
      throw new Error('Invalid restore values');
    }

    const upgrade = new HandUpgrade(chips, mult);
    upgrade.level = level;
    this.upgrades.set(handType, upgrade);
  }
}
```

# JEST CONFIGURATION
```json
/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@views/(.*)$': '<rootDir>/src/views/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/main.tsx',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
```

# TYPESCRIPT CONFIGURATION
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@models/*": ["src/models/*"],
      "@controllers/*": ["src/controllers/*"],
      "@services/*": ["src/services/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    },

    /* Additional options */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

# REQUIREMENTS SPECIFICATION

## HandType Enum Requirements:
- Must define 9 hand types in priority order: STRAIGHT_FLUSH, FOUR_OF_A_KIND, FULL_HOUSE, FLUSH, STRAIGHT, THREE_OF_A_KIND, TWO_PAIR, PAIR, HIGH_CARD
- Must provide getDisplayName() returning user-friendly names
- Must provide getBaseValues() returning { chips, mult } from specification:
  - STRAIGHT_FLUSH: 100 chips, 8 mult
  - FOUR_OF_A_KIND: 60 chips, 7 mult
  - FULL_HOUSE: 40 chips, 4 mult
  - FLUSH: 35 chips, 4 mult
  - STRAIGHT: 30 chips, 4 mult
  - THREE_OF_A_KIND: 30 chips, 3 mult
  - TWO_PAIR: 20 chips, 2 mult
  - PAIR: 10 chips, 2 mult
  - HIGH_CARD: 5 chips, 1 mult

## HandUpgrade Class Requirements:
- Properties: additionalChips (number), additionalMult (number)
- Constructor accepts chips and mult, defaults to 0
- addUpgrade(chips, mult) accumulates bonuses
- Validates non-negative values
- Throws error on negative bonuses

## HandResult Class Requirements:
- Properties: handType (HandType), cards (Card[]), baseChips (number), baseMult (number)
- Constructor validates all properties
- Validates cards array non-empty
- Validates base values non-negative
- Immutable after creation

## HandEvaluator Class Requirements:
- evaluateHand(cards, upgradeManager) returns HandResult with upgraded base values
- getHandType(cards) returns HandType for preview (no upgrades)
- Detects all 9 poker hands correctly
- Prioritizes highest hand (checks in order from best to worst)
- Works with 1-5 cards:
  - 1 card: Always HIGH_CARD
  - 2 cards: PAIR or HIGH_CARD
  - 3 cards: THREE_OF_A_KIND, PAIR, or HIGH_CARD
  - 4 cards: FOUR_OF_A_KIND, TWO_PAIR, PAIR, or HIGH_CARD
  - 5 cards: All hands possible
- Handles Ace-low straight (A-2-3-4-5)
- Handles Ace-high straight (10-J-Q-K-A)
- Throws error on empty array or >5 cards

**Private check methods:**
- checkStraightFlush(cards): 5 cards, same suit, sequential
- checkFourOfAKind(cards): 4 cards same value
- checkFullHouse(cards): 3 of one value + 2 of another
- checkFlush(cards): 5 cards same suit
- checkStraight(cards): 5 cards sequential (Ace can be low or high)
- checkThreeOfAKind(cards): 3 cards same value
- checkTwoPair(cards): 2 pairs of different values
- checkPair(cards): 2 cards same value

## HandUpgradeManager Class Requirements:
- Properties: upgrades (Map<HandType, HandUpgrade>)
- Constructor initializes all 9 hand types with zero upgrades
- applyPlanetUpgrade(handType, chips, mult) adds bonuses
- getUpgradedValues(handType) returns current upgrade
- reset() clears all upgrades back to zero
- Validates handType exists
- Validates non-negative bonuses
- Supports cumulative upgrades (multiple planets)

## Edge Cases:
- 1 card evaluation (always HIGH_CARD)
- Ace-low straight (A-2-3-4-5)
- Ace-high straight (10-J-Q-K-A)
- Multiple hands possible (return highest priority)
- Cards in random order (must detect patterns)
- Empty card array (throw error)
- More than 5 cards (throw error)
- Multiple planet upgrades (accumulate)
- Invalid HandType (throw error)

# TASK

Generate a complete unit test suite for Poker System that covers:

## 1. HandType Enum Tests
- [ ] All 9 hand types defined in priority order
- [ ] getDisplayName() returns correct names
- [ ] getBaseValues() returns correct chips for all types
- [ ] getBaseValues() returns correct mult for all types
- [ ] Values match specification exactly

## 2. HandUpgrade Class Tests

### Constructor:
- [ ] Creates upgrade with positive chips and mult
- [ ] Defaults to 0 if not provided
- [ ] Accepts zero as valid value
- [ ] Throws error on negative chips
- [ ] Throws error on negative mult

### addUpgrade():
- [ ] Adds chips correctly
- [ ] Adds mult correctly
- [ ] Accumulates multiple upgrades
- [ ] Handles zero additions
- [ ] Throws error on negative chips
- [ ] Throws error on negative mult

## 3. HandResult Class Tests

### Constructor:
- [ ] Creates result with valid inputs
- [ ] Stores handType correctly
- [ ] Stores cards array correctly
- [ ] Stores baseChips correctly
- [ ] Stores baseMult correctly
- [ ] Throws error on empty cards array
- [ ] Throws error on negative baseChips
- [ ] Throws error on negative baseMult
- [ ] Properties are read-only/immutable

## 4. HandEvaluator Class Tests

### Constructor:
- [ ] Initializes correctly
- [ ] Has hand rankings in priority order

### evaluateHand() - Integration with HandUpgradeManager:
- [ ] Returns HandResult with correct structure
- [ ] Applies planet upgrades to base values
- [ ] Returns unmodified base if no upgrades
- [ ] Multiple upgrades accumulate correctly
- [ ] Throws error on null upgradeManager

### getHandType() - Preview functionality:
- [ ] Returns correct hand type without upgrades
- [ ] Works independently of evaluateHand

### Straight Flush Detection:
- [ ] Detects A♠-2♠-3♠-4♠-5♠ (Ace-low)
- [ ] Detects 10♥-J♥-Q♥-K♥-A♥ (Ace-high)
- [ ] Detects 5♦-6♦-7♦-8♦-9♦ (middle range)
- [ ] Rejects 5 sequential cards of different suits
- [ ] Rejects 5 same-suit non-sequential cards
- [ ] Requires exactly 5 cards

### Four of a Kind Detection:
- [ ] Detects K♠-K♥-K♦-K♣-2♠
- [ ] Detects A♠-A♥-A♦-A♣-3♣
- [ ] Detects 2♠-2♥-2♦-2♣-A♠
- [ ] Rejects three of a kind
- [ ] Works with 4 or 5 cards

### Full House Detection:
- [ ] Detects K♠-K♥-K♦-9♣-9♠ (3+2)
- [ ] Detects A♠-A♥-2♦-2♣-2♠ (2+3)
- [ ] Rejects three of a kind only
- [ ] Rejects two pair
- [ ] Requires exactly 5 cards

### Flush Detection:
- [ ] Detects A♠-K♠-9♠-5♠-2♠ (all spades)
- [ ] Detects 2♥-4♥-6♥-8♥-10♥ (all hearts)
- [ ] Detects any 5 cards of same suit
- [ ] Rejects 4 cards same suit + 1 different
- [ ] Rejects sequential cards of different suits
- [ ] Requires exactly 5 cards

### Straight Detection:
- [ ] Detects A-2-3-4-5 (Ace-low, wheel)
- [ ] Detects 10-J-Q-K-A (Ace-high, broadway)
- [ ] Detects 5-6-7-8-9 (middle straight)
- [ ] Detects 2-3-4-5-6 (low straight)
- [ ] Detects 9-10-J-Q-K (high straight)
- [ ] Works with any suit combination
- [ ] Rejects non-sequential cards
- [ ] Ace cannot be in middle (Q-K-A-2-3 invalid)
- [ ] Requires exactly 5 cards

### Three of a Kind Detection:
- [ ] Detects K♠-K♥-K♦-9♣-2♠
- [ ] Detects A♠-A♥-A♦-3♣-5♠
- [ ] Detects 2♠-2♥-2♦-A♣-K♠
- [ ] Rejects pair
- [ ] Rejects full house (returns FULL_HOUSE instead)
- [ ] Works with 3, 4, or 5 cards

### Two Pair Detection:
- [ ] Detects K♠-K♥-9♦-9♣-2♠
- [ ] Detects A♠-A♥-2♦-2♣-5♠
- [ ] Detects Q♠-Q♥-3♦-3♣-7♠
- [ ] Rejects single pair
- [ ] Rejects full house (returns FULL_HOUSE instead)
- [ ] Requires exactly 4 or 5 cards

### Pair Detection:
- [ ] Detects K♠-K♥-9♦-3♣-2♠
- [ ] Detects A♠-A♥-Q♦-J♣-10♠
- [ ] Detects 2♠-2♥-A♦-K♣-Q♠
- [ ] Rejects two pair (returns TWO_PAIR instead)
- [ ] Works with 2, 3, 4, or 5 cards

### High Card Detection:
- [ ] Detects A♠-K♥-Q♦-J♣-9♠
- [ ] Detects when no other hand exists
- [ ] Works with 1 card
- [ ] Returns HIGH_CARD as fallback

### Card Count Edge Cases:
- [ ] 1 card always returns HIGH_CARD
- [ ] 2 cards returns PAIR or HIGH_CARD
- [ ] 3 cards returns THREE_OF_A_KIND, PAIR, or HIGH_CARD
- [ ] 4 cards returns FOUR_OF_A_KIND, TWO_PAIR, PAIR, or HIGH_CARD
- [ ] 5 cards can return any hand type
- [ ] Empty array throws error
- [ ] 6+ cards throws error

### Priority Testing:
- [ ] Straight Flush chosen over Four of a Kind (if both possible)
- [ ] Full House chosen over Flush (if both possible)
- [ ] Full House chosen over Straight (if both possible)
- [ ] Three of a Kind chosen over Pair (if both possible)
- [ ] Two Pair chosen over Pair (if both possible)

## 5. HandUpgradeManager Class Tests

### Constructor:
- [ ] Initializes all 9 hand types
- [ ] All upgrades start at 0 chips
- [ ] All upgrades start at 0 mult
- [ ] Map contains all HandType values

### applyPlanetUpgrade():
- [ ] Applies upgrade to correct hand type
- [ ] Accumulates multiple upgrades to same hand
- [ ] Preserves other hand type upgrades
- [ ] Validates non-negative chips
- [ ] Validates non-negative mult
- [ ] Throws error on invalid HandType
- [ ] Throws error on negative chips
- [ ] Throws error on negative mult

### getUpgradedValues():
- [ ] Returns current upgrade for hand type
- [ ] Returns zero upgrade if never upgraded
- [ ] Returns accumulated upgrade after multiple applies
- [ ] Throws error on invalid HandType

### reset():
- [ ] Clears all upgrades to zero
- [ ] Resets all 9 hand types
- [ ] Can reset multiple times
- [ ] Upgrades persist until reset

## 6. Integration Tests

### HandEvaluator with HandUpgradeManager:
- [ ] Base values applied without upgrades
- [ ] Planet upgrade increases base values
- [ ] Multiple planets accumulate correctly
- [ ] Example: Pluto (+10 chips, +1 mult) on HIGH_CARD
- [ ] Example: Neptune (+40 chips, +4 mult) on STRAIGHT_FLUSH
- [ ] Upgraded values reflected in HandResult

### Complete Poker Hand Flow:
- [ ] Deal 5 cards → Evaluate → Get correct hand type
- [ ] Apply planet upgrades → Re-evaluate → See increased base values
- [ ] Test with all 9 hand types
- [ ] Verify base values match specification + upgrades

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  HandEvaluator, 
  HandUpgradeManager, 
  HandResult, 
  HandUpgrade, 
  HandType 
} from '@/models/poker';
import { Card, CardValue, Suit } from '@/models/core';

describe('Poker System', () => {
  describe('HandType Enum', () => {
    describe('getBaseValues', () => {
      it('should return 100 chips and 8 mult for STRAIGHT_FLUSH', () => {
        // ARRANGE
        const handType = HandType.STRAIGHT_FLUSH;
        
        // ACT
        const { chips, mult } = handType.getBaseValues();
        
        // ASSERT
        expect(chips).toBe(100);
        expect(mult).toBe(8);
      });

      it('should return 10 chips and 2 mult for PAIR', () => {
        // ARRANGE
        const handType = HandType.PAIR;
        
        // ACT
        const { chips, mult } = handType.getBaseValues();
        
        // ASSERT
        expect(chips).toBe(10);
        expect(mult).toBe(2);
      });

      it('should return 5 chips and 1 mult for HIGH_CARD', () => {
        // ARRANGE
        const handType = HandType.HIGH_CARD;
        
        // ACT
        const { chips, mult } = handType.getBaseValues();
        
        // ASSERT
        expect(chips).toBe(5);
        expect(mult).toBe(1);
      });
    });

    describe('getDisplayName', () => {
      it('should return "Straight Flush" for STRAIGHT_FLUSH', () => {
        // ARRANGE & ACT
        const name = HandType.STRAIGHT_FLUSH.getDisplayName();
        
        // ASSERT
        expect(name).toBe('Straight Flush');
      });

      it('should return "High Card" for HIGH_CARD', () => {
        // ARRANGE & ACT
        const name = HandType.HIGH_CARD.getDisplayName();
        
        // ASSERT
        expect(name).toBe('High Card');
      });
    });
  });

  describe('HandUpgrade', () => {
    describe('constructor', () => {
      it('should create upgrade with specified values', () => {
        // ARRANGE & ACT
        const upgrade = new HandUpgrade(10, 5);
        
        // ASSERT
        expect(upgrade.additionalChips).toBe(10);
        expect(upgrade.additionalMult).toBe(5);
      });

      it('should default to zero if not provided', () => {
        // ARRANGE & ACT
        const upgrade = new HandUpgrade();
        
        // ASSERT
        expect(upgrade.additionalChips).toBe(0);
        expect(upgrade.additionalMult).toBe(0);
      });

      it('should throw error on negative chips', () => {
        // ARRANGE & ACT & ASSERT
        expect(() => new HandUpgrade(-10, 5))
          .toThrow('Bonus values cannot be negative');
      });

      it('should throw error on negative mult', () => {
        // ARRANGE & ACT & ASSERT
        expect(() => new HandUpgrade(10, -5))
          .toThrow('Bonus values cannot be negative');
      });
    });

    describe('addUpgrade', () => {
      it('should accumulate chips correctly', () => {
        // ARRANGE
        const upgrade = new HandUpgrade(10, 1);
        
        // ACT
        upgrade.addUpgrade(10, 1);
        
        // ASSERT
        expect(upgrade.additionalChips).toBe(20);
        expect(upgrade.additionalMult).toBe(2);
      });

      it('should throw error on negative chips', () => {
        // ARRANGE
        const upgrade = new HandUpgrade(10, 1);
        
        // ACT & ASSERT
        expect(() => upgrade.addUpgrade(-5, 0))
          .toThrow('Bonus values cannot be negative');
      });
    });
  });

  describe('HandResult', () => {
    describe('constructor', () => {
      it('should create result with valid inputs', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.KING, Suit.SPADES)
        ];
        
        // ACT
        const result = new HandResult(
          HandType.PAIR,
          cards,
          10,
          2
        );
        
        // ASSERT
        expect(result.handType).toBe(HandType.PAIR);
        expect(result.cards).toEqual(cards);
        expect(result.baseChips).toBe(10);
        expect(result.baseMult).toBe(2);
      });

      it('should throw error on empty cards array', () => {
        // ARRANGE & ACT & ASSERT
        expect(() => new HandResult(HandType.PAIR, [], 10, 2))
          .toThrow('Cards array cannot be empty');
      });

      it('should throw error on negative baseChips', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        
        // ACT & ASSERT
        expect(() => new HandResult(HandType.HIGH_CARD, cards, -10, 1))
          .toThrow('Base values cannot be negative');
      });
    });
  });

  describe('HandEvaluator', () => {
    let evaluator: HandEvaluator;
    let upgradeManager: HandUpgradeManager;

    beforeEach(() => {
      evaluator = new HandEvaluator();
      upgradeManager = new HandUpgradeManager();
    });

    describe('Straight Flush Detection', () => {
      it('should detect Ace-low straight flush (A-2-3-4-5)', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.TWO, Suit.SPADES),
          new Card(CardValue.THREE, Suit.SPADES),
          new Card(CardValue.FOUR, Suit.SPADES),
          new Card(CardValue.FIVE, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.STRAIGHT_FLUSH);
        expect(result.baseChips).toBe(100);
        expect(result.baseMult).toBe(8);
      });

      it('should detect Ace-high straight flush (10-J-Q-K-A)', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.TEN, Suit.HEARTS),
          new Card(CardValue.JACK, Suit.HEARTS),
          new Card(CardValue.QUEEN, Suit.HEARTS),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.ACE, Suit.HEARTS)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.STRAIGHT_FLUSH);
      });

      it('should not detect straight flush with mixed suits', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.FIVE, Suit.SPADES),
          new Card(CardValue.SIX, Suit.HEARTS),
          new Card(CardValue.SEVEN, Suit.SPADES),
          new Card(CardValue.EIGHT, Suit.SPADES),
          new Card(CardValue.NINE, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).not.toBe(HandType.STRAIGHT_FLUSH);
      });
    });

    describe('Four of a Kind Detection', () => {
      it('should detect four of a kind', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.KING, Suit.DIAMONDS),
          new Card(CardValue.KING, Suit.CLUBS),
          new Card(CardValue.TWO, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.FOUR_OF_A_KIND);
        expect(result.baseChips).toBe(60);
        expect(result.baseMult).toBe(7);
      });
    });

    describe('Full House Detection', () => {
      it('should detect full house (3+2)', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.KING, Suit.DIAMONDS),
          new Card(CardValue.NINE, Suit.CLUBS),
          new Card(CardValue.NINE, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.FULL_HOUSE);
        expect(result.baseChips).toBe(40);
        expect(result.baseMult).toBe(4);
      });
    });

    describe('Flush Detection', () => {
      it('should detect flush (5 cards same suit)', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.NINE, Suit.SPADES),
          new Card(CardValue.FIVE, Suit.SPADES),
          new Card(CardValue.TWO, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.FLUSH);
        expect(result.baseChips).toBe(35);
        expect(result.baseMult).toBe(4);
      });
    });

    describe('Straight Detection', () => {
      it('should detect Ace-low straight (A-2-3-4-5)', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.TWO, Suit.HEARTS),
          new Card(CardValue.THREE, Suit.DIAMONDS),
          new Card(CardValue.FOUR, Suit.CLUBS),
          new Card(CardValue.FIVE, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.STRAIGHT);
        expect(result.baseChips).toBe(30);
        expect(result.baseMult).toBe(4);
      });

      it('should detect Ace-high straight (10-J-Q-K-A)', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.TEN, Suit.SPADES),
          new Card(CardValue.JACK, Suit.HEARTS),
          new Card(CardValue.QUEEN, Suit.DIAMONDS),
          new Card(CardValue.KING, Suit.CLUBS),
          new Card(CardValue.ACE, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.STRAIGHT);
      });

      it('should not detect Q-K-A-2-3 as straight', () => {
        // ARRANGE - Ace in middle is invalid
        const cards = [
          new Card(CardValue.QUEEN, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.ACE, Suit.DIAMONDS),
          new Card(CardValue.TWO, Suit.CLUBS),
          new Card(CardValue.THREE, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).not.toBe(HandType.STRAIGHT);
      });
    });

    describe('Three of a Kind Detection', () => {
      it('should detect three of a kind', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.KING, Suit.DIAMONDS),
          new Card(CardValue.NINE, Suit.CLUBS),
          new Card(CardValue.TWO, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.THREE_OF_A_KIND);
        expect(result.baseChips).toBe(30);
        expect(result.baseMult).toBe(3);
      });
    });

    describe('Two Pair Detection', () => {
      it('should detect two pair', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.NINE, Suit.DIAMONDS),
          new Card(CardValue.NINE, Suit.CLUBS),
          new Card(CardValue.TWO, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.TWO_PAIR);
        expect(result.baseChips).toBe(20);
        expect(result.baseMult).toBe(2);
      });
    });

    describe('Pair Detection', () => {
      it('should detect pair', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.NINE, Suit.DIAMONDS),
          new Card(CardValue.THREE, Suit.CLUBS),
          new Card(CardValue.TWO, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.PAIR);
        expect(result.baseChips).toBe(10);
        expect(result.baseMult).toBe(2);
      });
    });

    describe('High Card Detection', () => {
      it('should detect high card with 5 cards', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.QUEEN, Suit.DIAMONDS),
          new Card(CardValue.JACK, Suit.CLUBS),
          new Card(CardValue.NINE, Suit.SPADES)
        ];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.HIGH_CARD);
        expect(result.baseChips).toBe(5);
        expect(result.baseMult).toBe(1);
      });

      it('should return high card for single card', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        
        // ACT
        const result = evaluator.evaluateHand(cards, upgradeManager);
        
        // ASSERT
        expect(result.handType).toBe(HandType.HIGH_CARD);
      });
    });

    describe('Card Count Edge Cases', () => {
      it('should throw error on empty array', () => {
        // ARRANGE
        const cards: Card[] = [];
        
        // ACT & ASSERT
        expect(() => evaluator.evaluateHand(cards, upgradeManager))
          .toThrow('Cards array cannot be empty');
      });

      it('should throw error on more than 5 cards', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.QUEEN, Suit.DIAMONDS),
          new Card(CardValue.JACK, Suit.CLUBS),
          new Card(CardValue.TEN, Suit.SPADES),
          new Card(CardValue.NINE, Suit.HEARTS)
        ];
        
        // ACT & ASSERT
        expect(() => evaluator.evaluateHand(cards, upgradeManager))
          .toThrow('Cannot evaluate more than 5 cards');
      });
    });
  });

  describe('HandUpgradeManager', () => {
    let manager: HandUpgradeManager;

    beforeEach(() => {
      manager = new HandUpgradeManager();
    });

    describe('constructor', () => {
      it('should initialize all 9 hand types with zero upgrades', () => {
        // ACT
        const highCardUpgrade = manager.getUpgradedValues(HandType.HIGH_CARD);
        const straightFlushUpgrade = manager.getUpgradedValues(HandType.STRAIGHT_FLUSH);
        
        // ASSERT
        expect(highCardUpgrade.additionalChips).toBe(0);
        expect(highCardUpgrade.additionalMult).toBe(0);
        expect(straightFlushUpgrade.additionalChips).toBe(0);
        expect(straightFlushUpgrade.additionalMult).toBe(0);
      });
    });

    describe('applyPlanetUpgrade', () => {
      it('should apply planet upgrade to specific hand type', () => {
        // ARRANGE & ACT
        manager.applyPlanetUpgrade(HandType.HIGH_CARD, 10, 1);
        
        // ASSERT
        const upgrade = manager.getUpgradedValues(HandType.HIGH_CARD);
        expect(upgrade.additionalChips).toBe(10);
        expect(upgrade.additionalMult).toBe(1);
      });

      it('should accumulate multiple upgrades to same hand type', () => {
        // ARRANGE & ACT
        manager.applyPlanetUpgrade(HandType.PAIR, 15, 1);
        manager.applyPlanetUpgrade(HandType.PAIR, 15, 1);
        
        // ASSERT
        const upgrade = manager.getUpgradedValues(HandType.PAIR);
        expect(upgrade.additionalChips).toBe(30);
        expect(upgrade.additionalMult).toBe(2);
      });

      it('should not affect other hand types', () => {
        // ARRANGE & ACT
        manager.applyPlanetUpgrade(HandType.FLUSH, 15, 2);
        
        // ASSERT
        const flushUpgrade = manager.getUpgradedValues(HandType.FLUSH);
        const pairUpgrade = manager.getUpgradedValues(HandType.PAIR);
        
        expect(flushUpgrade.additionalChips).toBe(15);
        expect(flushUpgrade.additionalMult).toBe(2);
        expect(pairUpgrade.additionalChips).toBe(0);
        expect(pairUpgrade.additionalMult).toBe(0);
      });

      it('should throw error on negative chips', () => {
        // ACT & ASSERT
        expect(() => manager.applyPlanetUpgrade(HandType.PAIR, -10, 1))
          .toThrow('Bonus values cannot be negative');
      });
    });

    describe('reset', () => {
      it('should clear all upgrades', () => {
        // ARRANGE
        manager.applyPlanetUpgrade(HandType.HIGH_CARD, 10, 1);
        manager.applyPlanetUpgrade(HandType.PAIR, 15, 1);
        manager.applyPlanetUpgrade(HandType.FLUSH, 15, 2);
        
        // ACT
        manager.reset();
        
        // ASSERT
        const highCardUpgrade = manager.getUpgradedValues(HandType.HIGH_CARD);
        const pairUpgrade = manager.getUpgradedValues(HandType.PAIR);
        const flushUpgrade = manager.getUpgradedValues(HandType.FLUSH);
        
        expect(highCardUpgrade.additionalChips).toBe(0);
        expect(pairUpgrade.additionalChips).toBe(0);
        expect(flushUpgrade.additionalChips).toBe(0);
      });
    });
  });

  describe('Integration: HandEvaluator with HandUpgradeManager', () => {
    let evaluator: HandEvaluator;
    let manager: HandUpgradeManager;

    beforeEach(() => {
      evaluator = new HandEvaluator();
      manager = new HandUpgradeManager();
    });

    it('should apply planet upgrades to base values', () => {
      // ARRANGE
      const cards = [new Card(CardValue.ACE, Suit.SPADES)];
      manager.applyPlanetUpgrade(HandType.HIGH_CARD, 10, 1);
      
      // ACT
      const result = evaluator.evaluateHand(cards, manager);
      
      // ASSERT
      expect(result.baseChips).toBe(15); // 5 + 10
      expect(result.baseMult).toBe(2);    // 1 + 1
    });

    it('should accumulate multiple planet upgrades', () => {
      // ARRANGE
      const cards = [
        new Card(CardValue.KING, Suit.SPADES),
        new Card(CardValue.KING, Suit.HEARTS)
      ];
      manager.applyPlanetUpgrade(HandType.PAIR, 15, 1);
      manager.applyPlanetUpgrade(HandType.PAIR, 15, 1);
      
      // ACT
      const result = evaluator.evaluateHand(cards, manager);
      
      // ASSERT
      expect(result.baseChips).toBe(40); // 10 + 30
      expect(result.baseMult).toBe(4);    // 2 + 2
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full implementation for all 5 poker components
- All 9 poker hands tested with multiple scenarios
- Planet upgrade integration tested
- Edge cases and error conditions covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| HandType | getBaseValues | 9 | 0 | 0 | 9 |
| HandType | getDisplayName | 9 | 0 | 0 | 9 |
| HandUpgrade | constructor | 3 | 1 | 2 | 6 |
| HandUpgrade | addUpgrade | 4 | 1 | 2 | 7 |
| HandResult | constructor | 1 | 0 | 3 | 4 |
| HandEvaluator | Straight Flush | 3 | 1 | 0 | 4 |
| HandEvaluator | Four of a Kind | 3 | 0 | 0 | 3 |
| HandEvaluator | Full House | 2 | 0 | 0 | 2 |
| HandEvaluator | Flush | 2 | 1 | 0 | 3 |
| HandEvaluator | Straight | 6 | 3 | 0 | 9 |
| HandEvaluator | Three of a Kind | 3 | 0 | 0 | 3 |
| HandEvaluator | Two Pair | 3 | 0 | 0 | 3 |
| HandEvaluator | Pair | 3 | 0 | 0 | 3 |
| HandEvaluator | High Card | 2 | 1 | 0 | 3 |
| HandEvaluator | Card Count | 0 | 2 | 2 | 4 |
| HandUpgradeManager | constructor | 1 | 0 | 0 | 1 |
| HandUpgradeManager | applyPlanetUpgrade | 3 | 0 | 1 | 4 |
| HandUpgradeManager | getUpgradedValues | 3 | 0 | 1 | 4 |
| HandUpgradeManager | reset | 1 | 0 | 0 | 1 |
| **Integration** | - | 2 | 0 | 0 | 2 |
| **TOTAL** | | | | | **84** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **92%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios: 
  - Internal shuffle logic for hand rankings (not critical)
  - Some private helper method branches (covered indirectly)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/models/poker.test.ts

# Run with coverage
npm test -- --coverage tests/unit/models/poker.test.ts

# Run in watch mode
npm test -- --watch tests/unit/models/poker.test.ts

# Run specific describe block
npm test -- -t "Straight Flush Detection" tests/unit/models/poker.test.ts
```

# SPECIAL CASES TO CONSIDER
- Ace duality (can be low or high in straights, but not both)
- Card order independence (hands must be detected regardless of card order)
- Priority enforcement (higher hands chosen when multiple possible)
- Planet upgrade accumulation (multiple same planets)
- Wraparound sequences (K→A but NOT Q-K-A-2-3)
- Card count requirements per hand type (flush needs exactly 5, pair works with 2-5)

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper function to create test cards quickly
function createTestHand(values: CardValue[], suits: Suit[]): Card[] {
  return values.map((value, i) => new Card(value, suits[i] || Suit.SPADES));
}

// Common test hands
const TEST_HANDS = {
  ROYAL_FLUSH: createTestHand(
    [CardValue.TEN, CardValue.JACK, CardValue.QUEEN, CardValue.KING, CardValue.ACE],
    [Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES]
  ),
  WHEEL_STRAIGHT: createTestHand(
    [CardValue.ACE, CardValue.TWO, CardValue.THREE, CardValue.FOUR, CardValue.FIVE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),
  // ... more helpers
};
```
