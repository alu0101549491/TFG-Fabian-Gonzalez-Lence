// ============================================
// FILE: src/models/poker/hand-type.enum.ts
// ============================================

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
