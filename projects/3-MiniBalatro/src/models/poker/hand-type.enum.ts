/**
 * Enumeration of poker hand types ordered by rank.
 * Used for hand evaluation and scoring.
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
  HIGH_CARD = 'HIGH_CARD',
}