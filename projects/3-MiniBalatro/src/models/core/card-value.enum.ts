// ============================================
// FILE: src/models/core/card-value.enum.ts
// ============================================

/**
 * Enum representing the 13 values in a French deck.
 * Values ordered from highest (ACE) to lowest (TWO) for poker hand comparison.
 */
export enum CardValue {
  ACE = 'A',
  KING = 'K',
  QUEEN = 'Q',
  JACK = 'J',
  TEN = '10',
  NINE = '9',
  EIGHT = '8',
  SEVEN = '7',
  SIX = '6',
  FIVE = '5',
  FOUR = '4',
  THREE = '3',
  TWO = '2'
}

/**
 * Returns the base chip value for a given card value.
 * @param value The card value to get the base chips for
 * @returns The base chip value
 */
export function getBaseChipsForValue(value: CardValue): number {
  const chipValues: Record<CardValue, number> = {
    [CardValue.ACE]: 11,
    [CardValue.KING]: 10,
    [CardValue.QUEEN]: 10,
    [CardValue.JACK]: 10,
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
  return chipValues[value];
}

/**
 * Returns the next card value in sequence (A→2, 2→3, ..., K→A).
 * @param value The current card value
 * @returns The next card value in sequence
 */
export function getNextValue(value: CardValue): CardValue {
  switch (value) {
    case CardValue.ACE: return CardValue.TWO;
    case CardValue.TWO: return CardValue.THREE;
    case CardValue.THREE: return CardValue.FOUR;
    case CardValue.FOUR: return CardValue.FIVE;
    case CardValue.FIVE: return CardValue.SIX;
    case CardValue.SIX: return CardValue.SEVEN;
    case CardValue.SEVEN: return CardValue.EIGHT;
    case CardValue.EIGHT: return CardValue.NINE;
    case CardValue.NINE: return CardValue.TEN;
    case CardValue.TEN: return CardValue.JACK;
    case CardValue.JACK: return CardValue.QUEEN;
    case CardValue.QUEEN: return CardValue.KING;
    case CardValue.KING: return CardValue.ACE;
    default:
      // This should never happen as we're using a complete enum
      throw new Error(`Unknown card value: ${value}`);
  }
}

/**
 * Returns the display string for a card value.
 * @param value The card value to display
 * @returns The display string
 */
export function getValueDisplay(value: CardValue): string {
  return value;
}