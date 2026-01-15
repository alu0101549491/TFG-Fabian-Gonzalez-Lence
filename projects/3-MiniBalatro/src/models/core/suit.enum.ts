// ============================================
// FILE: src/models/core/suit.enum.ts
// ============================================

/**
 * Enum representing the 4 suits in a French deck.
 */
export enum Suit {
  DIAMONDS = 'DIAMONDS',
  HEARTS = 'HEARTS',
  SPADES = 'SPADES',
  CLUBS = 'CLUBS'
}

/**
 * Returns the symbol for a given suit.
 * @param suit The suit to get the symbol for
 * @returns The suit symbol
 */
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case Suit.DIAMONDS: return '♦';
    case Suit.HEARTS: return '♥';
    case Suit.SPADES: return '♠';
    case Suit.CLUBS: return '♣';
    default:
      // This should never happen as we're using a complete enum
      throw new Error(`Unknown suit: ${suit}`);
  }
}

/**
 * Returns the color for a given suit (for UI purposes).
 * @param suit The suit to get the color for
 * @returns The hex color code
 */
export function getSuitColor(suit: Suit): string {
  switch (suit) {
    case Suit.DIAMONDS: return '#ff6b6b'; // Red
    case Suit.HEARTS: return '#ee5a6f';  // Pink-Red
    case Suit.SPADES: return '#4ecdc4';  // Turquoise
    case Suit.CLUBS: return '#95e1d3';   // Aqua Green
    default:
      // This should never happen as we're using a complete enum
      throw new Error(`Unknown suit: ${suit}`);
  }
}
