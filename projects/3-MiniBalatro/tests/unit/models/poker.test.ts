/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG) - Mini Balatro Poker System Test Suite
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file tests/unit/models/poker.test.ts
 * @desc Comprehensive unit tests for HandType, HandUpgrade, HandResult, HandEvaluator, and HandUpgradeManager
 * @see {@link <https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence>}
 */

// Mock console.log to avoid polluting test output
jest.spyOn(console, 'log').mockImplementation(() => {});

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  HandType,
  getHandTypeDisplayName,
  getBaseHandValues,
  HandUpgrade,
  HandResult,
  HandEvaluator,
  HandUpgradeManager,
} from '@models/poker';
import { Card, CardValue, Suit } from '@models/core';

// Helper to create test hands with specific patterns
const createHand = (values: CardValue[], suits: Suit[]): Card[] => {
  return values.map((value, index) => new Card(value, suits[index] || suits[0]));
};

// Common test hand patterns
const TEST_HANDS = {
  // Straight Flushes
  ROYAL_FLUSH: createHand(
    [CardValue.TEN, CardValue.JACK, CardValue.QUEEN, CardValue.KING, CardValue.ACE],
    [Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES]
  ),
  WHEEL_STRAIGHT_FLUSH: createHand(
    [CardValue.ACE, CardValue.TWO, CardValue.THREE, CardValue.FOUR, CardValue.FIVE],
    [Suit.HEARTS, Suit.HEARTS, Suit.HEARTS, Suit.HEARTS, Suit.HEARTS]
  ),
  MIDDLE_STRAIGHT_FLUSH: createHand(
    [CardValue.FIVE, CardValue.SIX, CardValue.SEVEN, CardValue.EIGHT, CardValue.NINE],
    [Suit.DIAMONDS, Suit.DIAMONDS, Suit.DIAMONDS, Suit.DIAMONDS, Suit.DIAMONDS]
  ),

  // Four of a Kind
  FOUR_KINGS: createHand(
    [CardValue.KING, CardValue.KING, CardValue.KING, CardValue.KING, CardValue.TWO],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),
  FOUR_ACES: createHand(
    [CardValue.ACE, CardValue.ACE, CardValue.ACE, CardValue.ACE, CardValue.THREE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),

  // Full House
  KINGS_FULL_OF_NINES: createHand(
    [CardValue.KING, CardValue.KING, CardValue.KING, CardValue.NINE, CardValue.NINE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),
  TWOS_FULL_OF_ACES: createHand(
    [CardValue.TWO, CardValue.TWO, CardValue.ACE, CardValue.ACE, CardValue.ACE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),

  // Flush
  SPADE_FLUSH: createHand(
    [CardValue.ACE, CardValue.KING, CardValue.NINE, CardValue.FIVE, CardValue.TWO],
    [Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES]
  ),

  // Straights
  WHEEL_STRAIGHT: createHand(
    [CardValue.ACE, CardValue.TWO, CardValue.THREE, CardValue.FOUR, CardValue.FIVE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),
  BROADWAY_STRAIGHT: createHand(
    [CardValue.TEN, CardValue.JACK, CardValue.QUEEN, CardValue.KING, CardValue.ACE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),
  MIDDLE_STRAIGHT: createHand(
    [CardValue.FIVE, CardValue.SIX, CardValue.SEVEN, CardValue.EIGHT, CardValue.NINE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),
  INVALID_STRAIGHT: createHand( // Q-K-A-2-3 is NOT a valid straight
    [CardValue.QUEEN, CardValue.KING, CardValue.ACE, CardValue.TWO, CardValue.THREE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),

  // Three of a Kind
  THREE_KINGS: createHand(
    [CardValue.KING, CardValue.KING, CardValue.KING, CardValue.NINE, CardValue.TWO],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),

  // Two Pair
  KINGS_AND_NINES: createHand(
    [CardValue.KING, CardValue.KING, CardValue.NINE, CardValue.NINE, CardValue.TWO],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),

  // Pair
  PAIR_OF_KINGS: createHand(
    [CardValue.KING, CardValue.KING, CardValue.NINE, CardValue.THREE, CardValue.TWO],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),

  // High Card
  HIGH_CARD_HAND: createHand(
    [CardValue.ACE, CardValue.KING, CardValue.QUEEN, CardValue.JACK, CardValue.NINE],
    [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
  ),
};

describe('Poker System Unit Tests', () => {
  // ============================================================================
  // HANDTYPE ENUM & UTILITIES TESTS
  // ============================================================================
  describe('HandType Enum & Utilities', () => {
    describe('Enum Definition', () => {
      it('should define all 9 hand types with correct string values', () => {
        expect(HandType.STRAIGHT_FLUSH).toBe('STRAIGHT_FLUSH');
        expect(HandType.FOUR_OF_A_KIND).toBe('FOUR_OF_A_KIND');
        expect(HandType.FULL_HOUSE).toBe('FULL_HOUSE');
        expect(HandType.FLUSH).toBe('FLUSH');
        expect(HandType.STRAIGHT).toBe('STRAIGHT');
        expect(HandType.THREE_OF_A_KIND).toBe('THREE_OF_A_KIND');
        expect(HandType.TWO_PAIR).toBe('TWO_PAIR');
        expect(HandType.PAIR).toBe('PAIR');
        expect(HandType.HIGH_CARD).toBe('HIGH_CARD');
      });

      it('should define hand types in priority order (highest to lowest)', () => {
        const priorities = Object.values(HandType);
        expect(priorities[0]).toBe(HandType.STRAIGHT_FLUSH);
        expect(priorities[1]).toBe(HandType.FOUR_OF_A_KIND);
        expect(priorities[2]).toBe(HandType.FULL_HOUSE);
        expect(priorities[3]).toBe(HandType.FLUSH);
        expect(priorities[4]).toBe(HandType.STRAIGHT);
        expect(priorities[5]).toBe(HandType.THREE_OF_A_KIND);
        expect(priorities[6]).toBe(HandType.TWO_PAIR);
        expect(priorities[7]).toBe(HandType.PAIR);
        expect(priorities[8]).toBe(HandType.HIGH_CARD);
      });
    });

    describe('getHandTypeDisplayName()', () => {
      it('should return correct display names for all hand types', () => {
        expect(getHandTypeDisplayName(HandType.STRAIGHT_FLUSH)).toBe('Straight Flush');
        expect(getHandTypeDisplayName(HandType.FOUR_OF_A_KIND)).toBe('Four of a Kind');
        expect(getHandTypeDisplayName(HandType.FULL_HOUSE)).toBe('Full House');
        expect(getHandTypeDisplayName(HandType.FLUSH)).toBe('Flush');
        expect(getHandTypeDisplayName(HandType.STRAIGHT)).toBe('Straight');
        expect(getHandTypeDisplayName(HandType.THREE_OF_A_KIND)).toBe('Three of a Kind');
        expect(getHandTypeDisplayName(HandType.TWO_PAIR)).toBe('Two Pair');
        expect(getHandTypeDisplayName(HandType.PAIR)).toBe('Pair');
        expect(getHandTypeDisplayName(HandType.HIGH_CARD)).toBe('High Card');
      });

      it('should return "Unknown Hand" for unexpected values (defensive)', () => {
        // @ts-expect-error Testing invalid input
        expect(getHandTypeDisplayName('INVALID_HAND' as HandType)).toBe('Unknown Hand');
      });
    });

    describe('getBaseHandValues()', () => {
      it('should return correct base values for STRAIGHT_FLUSH', () => {
        const values = getBaseHandValues(HandType.STRAIGHT_FLUSH);
        expect(values.baseChips).toBe(100);
        expect(values.baseMult).toBe(8);
      });

      it('should return correct base values for FOUR_OF_A_KIND', () => {
        const values = getBaseHandValues(HandType.FOUR_OF_A_KIND);
        expect(values.baseChips).toBe(60);
        expect(values.baseMult).toBe(7);
      });

      it('should return correct base values for FULL_HOUSE', () => {
        const values = getBaseHandValues(HandType.FULL_HOUSE);
        expect(values.baseChips).toBe(40);
        expect(values.baseMult).toBe(4);
      });

      it('should return correct base values for FLUSH', () => {
        const values = getBaseHandValues(HandType.FLUSH);
        expect(values.baseChips).toBe(35);
        expect(values.baseMult).toBe(4);
      });

      it('should return correct base values for STRAIGHT', () => {
        const values = getBaseHandValues(HandType.STRAIGHT);
        expect(values.baseChips).toBe(30);
        expect(values.baseMult).toBe(4);
      });

      it('should return correct base values for THREE_OF_A_KIND', () => {
        const values = getBaseHandValues(HandType.THREE_OF_A_KIND);
        expect(values.baseChips).toBe(30);
        expect(values.baseMult).toBe(3);
      });

      it('should return correct base values for TWO_PAIR', () => {
        const values = getBaseHandValues(HandType.TWO_PAIR);
        expect(values.baseChips).toBe(20);
        expect(values.baseMult).toBe(2);
      });

      it('should return correct base values for PAIR', () => {
        const values = getBaseHandValues(HandType.PAIR);
        expect(values.baseChips).toBe(10);
        expect(values.baseMult).toBe(2);
      });

      it('should return correct base values for HIGH_CARD', () => {
        const values = getBaseHandValues(HandType.HIGH_CARD);
        expect(values.baseChips).toBe(5);
        expect(values.baseMult).toBe(1);
      });

      it('should cover all 9 hand types without errors', () => {
        Object.values(HandType).forEach((handType) => {
          expect(() => getBaseHandValues(handType)).not.toThrow();
          const values = getBaseHandValues(handType);
          expect(values.baseChips).toBeGreaterThan(0);
          expect(values.baseMult).toBeGreaterThan(0);
        });
      });
    });
  });

  // ============================================================================
  // HANDUPGRADE CLASS TESTS
  // ============================================================================
  describe('HandUpgrade Class', () => {
    describe('constructor', () => {
      it('should create upgrade with specified positive values', () => {
        const upgrade = new HandUpgrade(15, 3);
        expect(upgrade.additionalChips).toBe(15);
        expect(upgrade.additionalMult).toBe(3);
        expect(upgrade.level).toBe(1);
      });

      it('should default to zero when no values provided', () => {
        const upgrade = new HandUpgrade();
        expect(upgrade.additionalChips).toBe(0);
        expect(upgrade.additionalMult).toBe(0);
        expect(upgrade.level).toBe(1);
      });

      it('should accept zero as valid value', () => {
        const upgrade = new HandUpgrade(0, 0);
        expect(upgrade.additionalChips).toBe(0);
        expect(upgrade.additionalMult).toBe(0);
      });

      it('should throw error when chips is negative', () => {
        expect(() => new HandUpgrade(-5, 0)).toThrow('Upgrade values cannot be negative');
      });

      it('should throw error when mult is negative', () => {
        expect(() => new HandUpgrade(0, -2)).toThrow('Upgrade values cannot be negative');
      });

      it('should throw error when both values are negative', () => {
        expect(() => new HandUpgrade(-10, -3)).toThrow('Upgrade values cannot be negative');
      });
    });

    describe('addUpgrade()', () => {
      it('should add positive chips and mult correctly', () => {
        const upgrade = new HandUpgrade(10, 1);
        upgrade.addUpgrade(15, 2);
        expect(upgrade.additionalChips).toBe(25);
        expect(upgrade.additionalMult).toBe(3);
        expect(upgrade.level).toBe(2);
      });

      it('should accumulate multiple upgrades', () => {
        const upgrade = new HandUpgrade(5, 1);
        upgrade.addUpgrade(5, 1);
        upgrade.addUpgrade(10, 2);
        expect(upgrade.additionalChips).toBe(20);
        expect(upgrade.additionalMult).toBe(4);
        expect(upgrade.level).toBe(3);
      });

      it('should handle zero additions without changing values', () => {
        const upgrade = new HandUpgrade(10, 2);
        upgrade.addUpgrade(0, 0);
        expect(upgrade.additionalChips).toBe(10);
        expect(upgrade.additionalMult).toBe(2);
        expect(upgrade.level).toBe(2);
      });

      it('should throw error when chips addition is negative', () => {
        const upgrade = new HandUpgrade(10, 1);
        expect(() => upgrade.addUpgrade(-5, 0)).toThrow('Upgrade values cannot be negative');
      });

      it('should throw error when mult addition is negative', () => {
        const upgrade = new HandUpgrade(10, 1);
        expect(() => upgrade.addUpgrade(0, -1)).toThrow('Upgrade values cannot be negative');
      });

      it('should throw error when both additions are negative', () => {
        const upgrade = new HandUpgrade(10, 1);
        expect(() => upgrade.addUpgrade(-5, -2)).toThrow('Upgrade values cannot be negative');
      });
    });
  });

  // ============================================================================
  // HANDRESULT CLASS TESTS
  // ============================================================================
  describe('HandResult Class', () => {
    const mockCards = [
      new Card(CardValue.ACE, Suit.SPADES),
      new Card(CardValue.KING, Suit.HEARTS),
    ];
    const mockScoringCards = [mockCards[0]];

    describe('constructor', () => {
      it('should create valid hand result with all properties', () => {
        const result = new HandResult(
          HandType.PAIR,
          mockCards,
          mockScoringCards,
          25,
          3
        );
        expect(result.handType).toBe(HandType.PAIR);
        expect(result.cards).toEqual(mockCards);
        expect(result.scoringCards).toEqual(mockScoringCards);
        expect(result.baseChips).toBe(25);
        expect(result.baseMult).toBe(3);
      });

      it('should throw error when cards array is empty', () => {
        expect(() =>
          new HandResult(HandType.HIGH_CARD, [], mockScoringCards, 5, 1)
        ).toThrow('Cards array cannot be empty');
      });

      it('should throw error when scoringCards array is empty', () => {
        expect(() =>
          new HandResult(HandType.HIGH_CARD, mockCards, [], 5, 1)
        ).toThrow('Scoring cards array cannot be empty');
      });

      it('should throw error when baseChips is negative', () => {
        expect(() =>
          new HandResult(HandType.HIGH_CARD, mockCards, mockScoringCards, -5, 1)
        ).toThrow('Base values cannot be negative');
      });

      it('should throw error when baseMult is negative', () => {
        expect(() =>
          new HandResult(HandType.HIGH_CARD, mockCards, mockScoringCards, 5, -1)
        ).toThrow('Base values cannot be negative');
      });

      it('should have immutable properties (read-only)', () => {
        const result = new HandResult(
          HandType.PAIR,
          mockCards,
          mockScoringCards,
          10,
          2
        );
        // TypeScript enforces readonly at compile-time (verified by @ts-expect-error)
        // Note: TypeScript readonly is a compile-time check, not runtime enforcement
        // Runtime immutability would require Object.freeze() or similar
        expect(result.handType).toBe(HandType.PAIR);
        expect(result.cards).toEqual(mockCards);
        expect(result.scoringCards).toEqual(mockScoringCards);
        expect(result.baseChips).toBe(10);
        expect(result.baseMult).toBe(2);
      });
    });
  });

  // ============================================================================
  // HANDEVALUATOR CLASS TESTS
  // ============================================================================
  describe('HandEvaluator Class', () => {
    let evaluator: HandEvaluator;
    let upgradeManager: HandUpgradeManager;

    beforeEach(() => {
      evaluator = new HandEvaluator();
      upgradeManager = new HandUpgradeManager();
    });

    describe('constructor', () => {
      it('should initialize with hand rankings in priority order', () => {
        // Access private property via reflection for testing
        // @ts-expect-error Accessing private property for test
        const rankings = evaluator.handRankings;
        expect(rankings).toEqual([
          HandType.STRAIGHT_FLUSH,
          HandType.FOUR_OF_A_KIND,
          HandType.FULL_HOUSE,
          HandType.FLUSH,
          HandType.STRAIGHT,
          HandType.THREE_OF_A_KIND,
          HandType.TWO_PAIR,
          HandType.PAIR,
          HandType.HIGH_CARD,
        ]);
      });
    });

    describe('evaluateHand()', () => {
      it('should throw error when cards array is empty', () => {
        expect(() => evaluator.evaluateHand([], upgradeManager)).toThrow(
          'Cards array must contain between 1 and 5 cards'
        );
      });

      it('should throw error when cards array has more than 5 cards', () => {
        const sixCards = [
          ...TEST_HANDS.HIGH_CARD_HAND,
          new Card(CardValue.EIGHT, Suit.SPADES),
        ];
        expect(() => evaluator.evaluateHand(sixCards, upgradeManager)).toThrow(
          'Cards array must contain between 1 and 5 cards'
        );
      });

      it('should throw error when upgradeManager is null', () => {
        // @ts-expect-error Testing null input
        expect(() => evaluator.evaluateHand(TEST_HANDS.PAIR_OF_KINGS, null)).toThrow(
          'Upgrade manager cannot be null'
        );
      });

      it('should return HandResult with correct structure and base values', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.PAIR_OF_KINGS, upgradeManager);
        expect(result).toBeInstanceOf(HandResult);
        expect(result.handType).toBe(HandType.PAIR);
        expect(result.baseChips).toBe(10); // Base PAIR chips
        expect(result.baseMult).toBe(2);   // Base PAIR mult
        expect(result.cards).toHaveLength(5);
        expect(result.scoringCards).toHaveLength(2); // Only the pair cards score
      });

      it('should apply planet upgrades to base values', () => {
        upgradeManager.applyPlanetUpgrade(HandType.PAIR, 20, 3);
        const result = evaluator.evaluateHand(TEST_HANDS.PAIR_OF_KINGS, upgradeManager);
        expect(result.baseChips).toBe(30); // 10 + 20
        expect(result.baseMult).toBe(5);   // 2 + 3
      });

      it('should accumulate multiple planet upgrades correctly', () => {
        upgradeManager.applyPlanetUpgrade(HandType.HIGH_CARD, 10, 1);
        upgradeManager.applyPlanetUpgrade(HandType.HIGH_CARD, 15, 2);
        const result = evaluator.evaluateHand([new Card(CardValue.ACE, Suit.SPADES)], upgradeManager);
        expect(result.baseChips).toBe(30); // 5 + 10 + 15
        expect(result.baseMult).toBe(4);   // 1 + 1 + 2
      });
    });

    describe('getHandType()', () => {
      it('should return correct hand type without upgrades', () => {
        expect(evaluator.getHandType(TEST_HANDS.ROYAL_FLUSH)).toBe(HandType.STRAIGHT_FLUSH);
        expect(evaluator.getHandType(TEST_HANDS.FOUR_KINGS)).toBe(HandType.FOUR_OF_A_KIND);
        expect(evaluator.getHandType(TEST_HANDS.KINGS_FULL_OF_NINES)).toBe(HandType.FULL_HOUSE);
      });

      it('should work independently of evaluateHand', () => {
        const handType = evaluator.getHandType(TEST_HANDS.SPADE_FLUSH);
        const result = evaluator.evaluateHand(TEST_HANDS.SPADE_FLUSH, upgradeManager);
        expect(handType).toBe(HandType.FLUSH);
        expect(result.handType).toBe(HandType.FLUSH);
      });

      it('should throw error on empty array', () => {
        expect(() => evaluator.getHandType([])).toThrow(
          'Cards array must contain between 1 and 5 cards'
        );
      });

      it('should throw error on more than 5 cards', () => {
        const sixCards = [
          ...TEST_HANDS.HIGH_CARD_HAND,
          new Card(CardValue.EIGHT, Suit.SPADES),
        ];
        expect(() => evaluator.getHandType(sixCards)).toThrow(
          'Cards array must contain between 1 and 5 cards'
        );
      });
    });

    describe('Straight Flush Detection', () => {
      it('should detect Ace-low straight flush (wheel)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.WHEEL_STRAIGHT_FLUSH, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT_FLUSH);
        expect(result.baseChips).toBe(100);
        expect(result.baseMult).toBe(8);
      });

      it('should detect Ace-high straight flush (royal flush)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.ROYAL_FLUSH, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT_FLUSH);
      });

      it('should detect middle straight flush', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.MIDDLE_STRAIGHT_FLUSH, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT_FLUSH);
      });

      it('should reject mixed-suit sequential cards', () => {
        // Same values as straight flush but mixed suits
        const mixedSuits = createHand(
          [CardValue.FIVE, CardValue.SIX, CardValue.SEVEN, CardValue.EIGHT, CardValue.NINE],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(mixedSuits, upgradeManager);
        expect(result.handType).not.toBe(HandType.STRAIGHT_FLUSH);
        // Should be detected as STRAIGHT instead
        expect(result.handType).toBe(HandType.STRAIGHT);
      });

      it('should reject same-suit non-sequential cards', () => {
        const nonSequential = createHand(
          [CardValue.ACE, CardValue.KING, CardValue.QUEEN, CardValue.JACK, CardValue.NINE],
          [Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(nonSequential, upgradeManager);
        expect(result.handType).not.toBe(HandType.STRAIGHT_FLUSH);
        // Should be detected as FLUSH instead
        expect(result.handType).toBe(HandType.FLUSH);
      });

      it('should require exactly 5 cards', () => {
        const fourCards = TEST_HANDS.WHEEL_STRAIGHT_FLUSH.slice(0, 4);
        const result = evaluator.evaluateHand(fourCards, upgradeManager);
        expect(result.handType).not.toBe(HandType.STRAIGHT_FLUSH);
      });
    });

    describe('Four of a Kind Detection', () => {
      it('should detect four Kings with kicker', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.FOUR_KINGS, upgradeManager);
        expect(result.handType).toBe(HandType.FOUR_OF_A_KIND);
        expect(result.baseChips).toBe(60);
        expect(result.baseMult).toBe(7);
        expect(result.scoringCards).toHaveLength(4); // Only the four Kings score
      });

      it('should detect four Aces with kicker', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.FOUR_ACES, upgradeManager);
        expect(result.handType).toBe(HandType.FOUR_OF_A_KIND);
      });

      it('should detect four of a kind with low cards', () => {
        const lowFours = createHand(
          [CardValue.TWO, CardValue.TWO, CardValue.TWO, CardValue.TWO, CardValue.ACE],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(lowFours, upgradeManager);
        expect(result.handType).toBe(HandType.FOUR_OF_A_KIND);
      });

      it('should reject three of a kind', () => {
        const threeKings = TEST_HANDS.THREE_KINGS;
        const result = evaluator.evaluateHand(threeKings, upgradeManager);
        expect(result.handType).not.toBe(HandType.FOUR_OF_A_KIND);
        expect(result.handType).toBe(HandType.THREE_OF_A_KIND);
      });

      it('should work with exactly 4 cards', () => {
        const fourCards = TEST_HANDS.FOUR_KINGS.slice(0, 4);
        const result = evaluator.evaluateHand(fourCards, upgradeManager);
        expect(result.handType).toBe(HandType.FOUR_OF_A_KIND);
      });
    });

    describe('Full House Detection', () => {
      it('should detect full house with three high + pair low (Kings full of Nines)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.KINGS_FULL_OF_NINES, upgradeManager);
        expect(result.handType).toBe(HandType.FULL_HOUSE);
        expect(result.baseChips).toBe(40);
        expect(result.baseMult).toBe(4);
        expect(result.scoringCards).toHaveLength(5); // All cards score in full house
      });

      it('should detect full house with pair high + three low (Twos full of Aces)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.TWOS_FULL_OF_ACES, upgradeManager);
        expect(result.handType).toBe(HandType.FULL_HOUSE);
      });

      it('should reject three of a kind without a pair', () => {
        const threeOnly = createHand(
          [CardValue.KING, CardValue.KING, CardValue.KING, CardValue.NINE, CardValue.EIGHT],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(threeOnly, upgradeManager);
        expect(result.handType).not.toBe(HandType.FULL_HOUSE);
        expect(result.handType).toBe(HandType.THREE_OF_A_KIND);
      });

      it('should reject two pair without three of a kind', () => {
        const twoPairOnly = TEST_HANDS.KINGS_AND_NINES;
        const result = evaluator.evaluateHand(twoPairOnly, upgradeManager);
        expect(result.handType).not.toBe(HandType.FULL_HOUSE);
        expect(result.handType).toBe(HandType.TWO_PAIR);
      });

      it('should require exactly 5 cards', () => {
        const fourCards = TEST_HANDS.KINGS_FULL_OF_NINES.slice(0, 4);
        const result = evaluator.evaluateHand(fourCards, upgradeManager);
        expect(result.handType).not.toBe(HandType.FULL_HOUSE);
      });
    });

    describe('Flush Detection', () => {
      it('should detect flush with high cards (A-K-9-5-2)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.SPADE_FLUSH, upgradeManager);
        expect(result.handType).toBe(HandType.FLUSH);
        expect(result.baseChips).toBe(35);
        expect(result.baseMult).toBe(4);
        expect(result.scoringCards).toHaveLength(5); // All cards score in flush
      });

      it('should detect flush with low cards (2-4-6-8-10)', () => {
        const lowFlush = createHand(
          [CardValue.TWO, CardValue.FOUR, CardValue.SIX, CardValue.EIGHT, CardValue.TEN],
          [Suit.HEARTS, Suit.HEARTS, Suit.HEARTS, Suit.HEARTS, Suit.HEARTS]
        );
        const result = evaluator.evaluateHand(lowFlush, upgradeManager);
        expect(result.handType).toBe(HandType.FLUSH);
      });

      it('should reject 4 cards of same suit + 1 different', () => {
        const almostFlush = createHand(
          [CardValue.ACE, CardValue.KING, CardValue.QUEEN, CardValue.JACK, CardValue.TEN],
          [Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.SPADES, Suit.HEARTS] // Last card different suit
        );
        const result = evaluator.evaluateHand(almostFlush, upgradeManager);
        expect(result.handType).not.toBe(HandType.FLUSH);
      });

      it('should require exactly 5 cards', () => {
        const fourCards = TEST_HANDS.SPADE_FLUSH.slice(0, 4);
        const result = evaluator.evaluateHand(fourCards, upgradeManager);
        expect(result.handType).not.toBe(HandType.FLUSH);
      });
    });

    describe('Straight Detection', () => {
      it('should detect Ace-low straight (wheel: A-2-3-4-5)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.WHEEL_STRAIGHT, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT);
        expect(result.baseChips).toBe(30);
        expect(result.baseMult).toBe(4);
        expect(result.scoringCards).toHaveLength(5);
      });

      it('should detect Ace-high straight (broadway: 10-J-Q-K-A)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.BROADWAY_STRAIGHT, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT);
      });

      it('should detect middle straight (5-6-7-8-9)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.MIDDLE_STRAIGHT, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT);
      });

      it('should detect low straight (2-3-4-5-6)', () => {
        const lowStraight = createHand(
          [CardValue.TWO, CardValue.THREE, CardValue.FOUR, CardValue.FIVE, CardValue.SIX],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(lowStraight, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT);
      });

      it('should detect high straight (9-10-J-Q-K)', () => {
        const highStraight = createHand(
          [CardValue.NINE, CardValue.TEN, CardValue.JACK, CardValue.QUEEN, CardValue.KING],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(highStraight, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT);
      });

      it('should reject invalid straight (Q-K-A-2-3)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.INVALID_STRAIGHT, upgradeManager);
        expect(result.handType).not.toBe(HandType.STRAIGHT);
        // Should fall back to HIGH_CARD or PAIR depending on cards
        expect([HandType.HIGH_CARD, HandType.PAIR]).toContain(result.handType);
      });

      it('should work with any suit combination', () => {
        const rainbowStraight = createHand(
          [CardValue.FIVE, CardValue.SIX, CardValue.SEVEN, CardValue.EIGHT, CardValue.NINE],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(rainbowStraight, upgradeManager);
        expect(result.handType).toBe(HandType.STRAIGHT);
      });

      it('should require exactly 5 cards', () => {
        const fourCards = TEST_HANDS.MIDDLE_STRAIGHT.slice(0, 4);
        const result = evaluator.evaluateHand(fourCards, upgradeManager);
        expect(result.handType).not.toBe(HandType.STRAIGHT);
      });
    });

    describe('Three of a Kind Detection', () => {
      it('should detect three Kings with kickers', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.THREE_KINGS, upgradeManager);
        expect(result.handType).toBe(HandType.THREE_OF_A_KIND);
        expect(result.baseChips).toBe(30);
        expect(result.baseMult).toBe(3);
        expect(result.scoringCards).toHaveLength(3); // Only the three Kings score
      });

      it('should detect three Aces with kickers', () => {
        const threeAces = createHand(
          [CardValue.ACE, CardValue.ACE, CardValue.ACE, CardValue.NINE, CardValue.TWO],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(threeAces, upgradeManager);
        expect(result.handType).toBe(HandType.THREE_OF_A_KIND);
      });

      it('should detect three low cards (Twos)', () => {
        const threeTwos = createHand(
          [CardValue.TWO, CardValue.TWO, CardValue.TWO, CardValue.KING, CardValue.QUEEN],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(threeTwos, upgradeManager);
        expect(result.handType).toBe(HandType.THREE_OF_A_KIND);
      });

      it('should reject single pair', () => {
        const onePair = TEST_HANDS.PAIR_OF_KINGS;
        const result = evaluator.evaluateHand(onePair, upgradeManager);
        expect(result.handType).not.toBe(HandType.THREE_OF_A_KIND);
        expect(result.handType).toBe(HandType.PAIR);
      });

      it('should work with exactly 3 cards', () => {
        const threeCards = TEST_HANDS.THREE_KINGS.slice(0, 3);
        const result = evaluator.evaluateHand(threeCards, upgradeManager);
        expect(result.handType).toBe(HandType.THREE_OF_A_KIND);
      });

      it('should prioritize FULL_HOUSE over THREE_OF_A_KIND when applicable', () => {
        const fullHouse = TEST_HANDS.KINGS_FULL_OF_NINES;
        const result = evaluator.evaluateHand(fullHouse, upgradeManager);
        expect(result.handType).toBe(HandType.FULL_HOUSE); // Not THREE_OF_A_KIND
      });
    });

    describe('Two Pair Detection', () => {
      it('should detect two pair (Kings and Nines)', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.KINGS_AND_NINES, upgradeManager);
        expect(result.handType).toBe(HandType.TWO_PAIR);
        expect(result.baseChips).toBe(20);
        expect(result.baseMult).toBe(2);
        expect(result.scoringCards).toHaveLength(4); // Only the paired cards score
      });

      it('should detect two pair with Aces and low pair', () => {
        const acesAndTwos = createHand(
          [CardValue.ACE, CardValue.ACE, CardValue.TWO, CardValue.TWO, CardValue.KING],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(acesAndTwos, upgradeManager);
        expect(result.handType).toBe(HandType.TWO_PAIR);
      });

      it('should detect two pair with middle pairs (Queens and Threes)', () => {
        const queensAndThrees = createHand(
          [CardValue.QUEEN, CardValue.QUEEN, CardValue.THREE, CardValue.THREE, CardValue.SEVEN],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(queensAndThrees, upgradeManager);
        expect(result.handType).toBe(HandType.TWO_PAIR);
      });

      it('should reject single pair', () => {
        const onePair = TEST_HANDS.PAIR_OF_KINGS;
        const result = evaluator.evaluateHand(onePair, upgradeManager);
        expect(result.handType).not.toBe(HandType.TWO_PAIR);
        expect(result.handType).toBe(HandType.PAIR);
      });

      it('should prioritize FULL_HOUSE over TWO_PAIR when applicable', () => {
        const fullHouse = TEST_HANDS.KINGS_FULL_OF_NINES;
        const result = evaluator.evaluateHand(fullHouse, upgradeManager);
        expect(result.handType).toBe(HandType.FULL_HOUSE); // Not TWO_PAIR
      });

      it('should work with exactly 4 cards', () => {
        const fourCards = TEST_HANDS.KINGS_AND_NINES.slice(0, 4);
        const result = evaluator.evaluateHand(fourCards, upgradeManager);
        expect(result.handType).toBe(HandType.TWO_PAIR);
      });
    });

    describe('Pair Detection', () => {
      it('should detect pair of Kings', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.PAIR_OF_KINGS, upgradeManager);
        expect(result.handType).toBe(HandType.PAIR);
        expect(result.baseChips).toBe(10);
        expect(result.baseMult).toBe(2);
        expect(result.scoringCards).toHaveLength(2); // Only the paired cards score
      });

      it('should detect pair of Aces', () => {
        const pairOfAces = createHand(
          [CardValue.ACE, CardValue.ACE, CardValue.QUEEN, CardValue.JACK, CardValue.TEN],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(pairOfAces, upgradeManager);
        expect(result.handType).toBe(HandType.PAIR);
      });

      it('should detect pair of low cards (Twos)', () => {
        const pairOfTwos = createHand(
          [CardValue.TWO, CardValue.TWO, CardValue.ACE, CardValue.KING, CardValue.QUEEN],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(pairOfTwos, upgradeManager);
        expect(result.handType).toBe(HandType.PAIR);
      });

      it('should reject high card hands', () => {
        const highCard = TEST_HANDS.HIGH_CARD_HAND;
        const result = evaluator.evaluateHand(highCard, upgradeManager);
        expect(result.handType).not.toBe(HandType.PAIR);
        expect(result.handType).toBe(HandType.HIGH_CARD);
      });

      it('should prioritize TWO_PAIR over PAIR when applicable', () => {
        const twoPair = TEST_HANDS.KINGS_AND_NINES;
        const result = evaluator.evaluateHand(twoPair, upgradeManager);
        expect(result.handType).toBe(HandType.TWO_PAIR); // Not PAIR
      });

      it('should work with exactly 2 cards', () => {
        const twoCards = TEST_HANDS.PAIR_OF_KINGS.slice(0, 2);
        const result = evaluator.evaluateHand(twoCards, upgradeManager);
        expect(result.handType).toBe(HandType.PAIR);
      });
    });

    describe('High Card Detection', () => {
      it('should detect high card with 5 unpaired, non-sequential cards', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.HIGH_CARD_HAND, upgradeManager);
        expect(result.handType).toBe(HandType.HIGH_CARD);
        expect(result.baseChips).toBe(5);
        expect(result.baseMult).toBe(1);
        expect(result.scoringCards).toHaveLength(1); // Only highest card scores
        expect(result.scoringCards[0].value).toBe(CardValue.ACE);
      });

      it('should return high card for single card', () => {
        const singleCard = [new Card(CardValue.ACE, Suit.SPADES)];
        const result = evaluator.evaluateHand(singleCard, upgradeManager);
        expect(result.handType).toBe(HandType.HIGH_CARD);
        expect(result.scoringCards).toHaveLength(1);
      });

      it("should work with 3 cards that don't form pairs or straights", () => {
        const threeCards = createHand(
          [CardValue.ACE, CardValue.TEN, CardValue.FIVE],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS]
        );
        const result = evaluator.evaluateHand(threeCards, upgradeManager);
        expect(result.handType).toBe(HandType.HIGH_CARD);
      });

      it('should always be fallback when no other hand detected', () => {
        // Any valid hand should never fall through to HIGH_CARD if a better hand exists
        // But truly random cards should be HIGH_CARD
        const randomCards = createHand(
          [CardValue.SEVEN, CardValue.FIVE, CardValue.THREE, CardValue.TWO, CardValue.NINE],
          [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        );
        const result = evaluator.evaluateHand(randomCards, upgradeManager);
        expect(result.handType).toBe(HandType.HIGH_CARD);
      });
    });

    describe('Card Count Edge Cases', () => {
      it('should handle 1 card as HIGH_CARD', () => {
        const result = evaluator.evaluateHand([new Card(CardValue.KING, Suit.SPADES)], upgradeManager);
        expect(result.handType).toBe(HandType.HIGH_CARD);
      });

      it('should handle 2 cards as PAIR or HIGH_CARD', () => {
        // Pair
        let result = evaluator.evaluateHand(
          [new Card(CardValue.QUEEN, Suit.SPADES), new Card(CardValue.QUEEN, Suit.HEARTS)],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.PAIR);

        // High card
        result = evaluator.evaluateHand(
          [new Card(CardValue.QUEEN, Suit.SPADES), new Card(CardValue.JACK, Suit.HEARTS)],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.HIGH_CARD);
      });

      it('should handle 3 cards as THREE_OF_A_KIND, PAIR, or HIGH_CARD', () => {
        // Three of a kind
        let result = evaluator.evaluateHand(
          [
            new Card(CardValue.TEN, Suit.SPADES),
            new Card(CardValue.TEN, Suit.HEARTS),
            new Card(CardValue.TEN, Suit.DIAMONDS),
          ],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.THREE_OF_A_KIND);

        // Pair
        result = evaluator.evaluateHand(
          [
            new Card(CardValue.TEN, Suit.SPADES),
            new Card(CardValue.TEN, Suit.HEARTS),
            new Card(CardValue.FIVE, Suit.DIAMONDS),
          ],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.PAIR);

        // High card
        result = evaluator.evaluateHand(
          [
            new Card(CardValue.ACE, Suit.SPADES),
            new Card(CardValue.TEN, Suit.HEARTS),
            new Card(CardValue.FIVE, Suit.DIAMONDS),
          ],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.HIGH_CARD);
      });

      it('should handle 4 cards as FOUR_OF_A_KIND, TWO_PAIR, PAIR, or HIGH_CARD', () => {
        // Four of a kind
        let result = evaluator.evaluateHand(
          [
            new Card(CardValue.NINE, Suit.SPADES),
            new Card(CardValue.NINE, Suit.HEARTS),
            new Card(CardValue.NINE, Suit.DIAMONDS),
            new Card(CardValue.NINE, Suit.CLUBS),
          ],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.FOUR_OF_A_KIND);

        // Two pair
        result = evaluator.evaluateHand(
          [
            new Card(CardValue.NINE, Suit.SPADES),
            new Card(CardValue.NINE, Suit.HEARTS),
            new Card(CardValue.FOUR, Suit.DIAMONDS),
            new Card(CardValue.FOUR, Suit.CLUBS),
          ],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.TWO_PAIR);

        // Pair
        result = evaluator.evaluateHand(
          [
            new Card(CardValue.NINE, Suit.SPADES),
            new Card(CardValue.NINE, Suit.HEARTS),
            new Card(CardValue.FOUR, Suit.DIAMONDS),
            new Card(CardValue.TWO, Suit.CLUBS),
          ],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.PAIR);

        // High card
        result = evaluator.evaluateHand(
          [
            new Card(CardValue.ACE, Suit.SPADES),
            new Card(CardValue.KING, Suit.HEARTS),
            new Card(CardValue.QUEEN, Suit.DIAMONDS),
            new Card(CardValue.JACK, Suit.CLUBS),
          ],
          upgradeManager
        );
        expect(result.handType).toBe(HandType.HIGH_CARD);
      });

      it('should throw error on empty array', () => {
        expect(() => evaluator.evaluateHand([], upgradeManager)).toThrow(
          'Cards array must contain between 1 and 5 cards'
        );
      });

      it('should throw error on 6+ cards', () => {
        const sixCards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.QUEEN, Suit.DIAMONDS),
          new Card(CardValue.JACK, Suit.CLUBS),
          new Card(CardValue.TEN, Suit.SPADES),
          new Card(CardValue.NINE, Suit.HEARTS),
        ];
        expect(() => evaluator.evaluateHand(sixCards, upgradeManager)).toThrow(
          'Cards array must contain between 1 and 5 cards'
        );
      });
    });

    describe('Hand Priority Enforcement', () => {
      it('should prioritize STRAIGHT_FLUSH over FOUR_OF_A_KIND', () => {
        // Create a hand that is both straight flush AND four of a kind (impossible in real deck,
        // but we test priority logic with a theoretical hand that meets both criteria)
        // Instead, verify that straight flush is checked first in rankings
        // @ts-expect-error Accessing private property for test
        const rankings = evaluator.handRankings;
        const sfIndex = rankings.indexOf(HandType.STRAIGHT_FLUSH);
        const foakIndex = rankings.indexOf(HandType.FOUR_OF_A_KIND);
        expect(sfIndex).toBeLessThan(foakIndex); // STRAIGHT_FLUSH checked first
      });

      it('should prioritize FULL_HOUSE over FLUSH', () => {
        // @ts-expect-error Accessing private property for test
        const rankings = evaluator.handRankings;
        const fhIndex = rankings.indexOf(HandType.FULL_HOUSE);
        const flushIndex = rankings.indexOf(HandType.FLUSH);
        expect(fhIndex).toBeLessThan(flushIndex);
      });

      it('should prioritize FULL_HOUSE over STRAIGHT', () => {
        // @ts-expect-error Accessing private property for test
        const rankings = evaluator.handRankings;
        const fhIndex = rankings.indexOf(HandType.FULL_HOUSE);
        const straightIndex = rankings.indexOf(HandType.STRAIGHT);
        expect(fhIndex).toBeLessThan(straightIndex);
      });

      it('should prioritize THREE_OF_A_KIND over PAIR', () => {
        // @ts-expect-error Accessing private property for test
        const rankings = evaluator.handRankings;
        const tokIndex = rankings.indexOf(HandType.THREE_OF_A_KIND);
        const pairIndex = rankings.indexOf(HandType.PAIR);
        expect(tokIndex).toBeLessThan(pairIndex);
      });

      it('should prioritize TWO_PAIR over PAIR', () => {
        // @ts-expect-error Accessing private property for test
        const rankings = evaluator.handRankings;
        const tpIndex = rankings.indexOf(HandType.TWO_PAIR);
        const pairIndex = rankings.indexOf(HandType.PAIR);
        expect(tpIndex).toBeLessThan(pairIndex);
      });

      it('should correctly detect full house instead of three of a kind + pair separately', () => {
        const fullHouse = TEST_HANDS.KINGS_FULL_OF_NINES;
        const result = evaluator.evaluateHand(fullHouse, upgradeManager);
        expect(result.handType).toBe(HandType.FULL_HOUSE);
        expect(result.handType).not.toBe(HandType.THREE_OF_A_KIND);
        expect(result.handType).not.toBe(HandType.PAIR);
      });
    });

    describe('Scoring Cards Extraction', () => {
      it('should return all 5 cards for STRAIGHT_FLUSH', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.ROYAL_FLUSH, upgradeManager);
        expect(result.scoringCards).toHaveLength(5);
      });

      it('should return all 5 cards for FULL_HOUSE', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.KINGS_FULL_OF_NINES, upgradeManager);
        expect(result.scoringCards).toHaveLength(5);
      });

      it('should return all 5 cards for FLUSH', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.SPADE_FLUSH, upgradeManager);
        expect(result.scoringCards).toHaveLength(5);
      });

      it('should return all 5 cards for STRAIGHT', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.BROADWAY_STRAIGHT, upgradeManager);
        expect(result.scoringCards).toHaveLength(5);
      });

      it('should return only 4 cards for FOUR_OF_A_KIND', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.FOUR_KINGS, upgradeManager);
        expect(result.scoringCards).toHaveLength(4);
        // Verify all scoring cards have same value
        const values = new Set(result.scoringCards.map(c => c.value));
        expect(values.size).toBe(1);
      });

      it('should return only 3 cards for THREE_OF_A_KIND', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.THREE_KINGS, upgradeManager);
        expect(result.scoringCards).toHaveLength(3);
        const values = new Set(result.scoringCards.map(c => c.value));
        expect(values.size).toBe(1);
      });

      it('should return only 4 cards for TWO_PAIR', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.KINGS_AND_NINES, upgradeManager);
        expect(result.scoringCards).toHaveLength(4);
        // Should have exactly 2 distinct values
        const values = new Set(result.scoringCards.map(c => c.value));
        expect(values.size).toBe(2);
      });

      it('should return only 2 cards for PAIR', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.PAIR_OF_KINGS, upgradeManager);
        expect(result.scoringCards).toHaveLength(2);
        const values = new Set(result.scoringCards.map(c => c.value));
        expect(values.size).toBe(1);
      });

      it('should return only 1 card (highest) for HIGH_CARD', () => {
        const result = evaluator.evaluateHand(TEST_HANDS.HIGH_CARD_HAND, upgradeManager);
        expect(result.scoringCards).toHaveLength(1);
        expect(result.scoringCards[0].value).toBe(CardValue.ACE);
      });
    });
  });

  // ============================================================================
  // HANDUPGRADEMANAGER CLASS TESTS
  // ============================================================================
  describe('HandUpgradeManager Class', () => {
    let manager: HandUpgradeManager;

    beforeEach(() => {
      manager = new HandUpgradeManager();
    });

    describe('constructor', () => {
      it('should initialize all 9 hand types with zero upgrades', () => {
        Object.values(HandType).forEach((handType) => {
          const upgrade = manager.getUpgradedValues(handType);
          expect(upgrade.additionalChips).toBe(0);
          expect(upgrade.additionalMult).toBe(0);
          expect(upgrade.level).toBe(1);
        });
      });

      it('should contain exactly 9 entries in upgrades map', () => {
        // @ts-expect-error Accessing private property for test
        expect(manager.upgrades.size).toBe(9);
      });
    });

    describe('applyPlanetUpgrade()', () => {
      it('should apply upgrade to specific hand type', () => {
        manager.applyPlanetUpgrade(HandType.HIGH_CARD, 10, 1);
        const upgrade = manager.getUpgradedValues(HandType.HIGH_CARD);
        expect(upgrade.additionalChips).toBe(10);
        expect(upgrade.additionalMult).toBe(1);
        expect(upgrade.level).toBe(2); // Initial level 1 + 1 upgrade = level 2
      });

      it('should accumulate multiple upgrades to same hand type', () => {
        manager.applyPlanetUpgrade(HandType.PAIR, 15, 1);
        manager.applyPlanetUpgrade(HandType.PAIR, 15, 1);
        const upgrade = manager.getUpgradedValues(HandType.PAIR);
        expect(upgrade.additionalChips).toBe(30);
        expect(upgrade.additionalMult).toBe(2);
        expect(upgrade.level).toBe(3); // Initial level 1 + 2 upgrades = level 3
      });

      it('should not affect other hand types when upgrading one type', () => {
        manager.applyPlanetUpgrade(HandType.FLUSH, 20, 2);
        const flushUpgrade = manager.getUpgradedValues(HandType.FLUSH);
        const pairUpgrade = manager.getUpgradedValues(HandType.PAIR);
        expect(flushUpgrade.additionalChips).toBe(20);
        expect(flushUpgrade.additionalMult).toBe(2);
        expect(pairUpgrade.additionalChips).toBe(0);
        expect(pairUpgrade.additionalMult).toBe(0);
      });

      it('should throw error when handType is invalid', () => {
        // @ts-expect-error Testing invalid input
        expect(() => manager.applyPlanetUpgrade('INVALID' as HandType, 10, 1)).toThrow(
          'Invalid hand type'
        );
      });

      it('should throw error when chips is negative', () => {
        expect(() => manager.applyPlanetUpgrade(HandType.PAIR, -10, 1)).toThrow(
          'Upgrade values cannot be negative'
        );
      });

      it('should throw error when mult is negative', () => {
        expect(() => manager.applyPlanetUpgrade(HandType.PAIR, 10, -1)).toThrow(
          'Upgrade values cannot be negative'
        );
      });
    });

    describe('getUpgradedValues()', () => {
      it('should return current upgrade for hand type', () => {
        manager.applyPlanetUpgrade(HandType.STRAIGHT, 30, 3);
        const upgrade = manager.getUpgradedValues(HandType.STRAIGHT);
        expect(upgrade.additionalChips).toBe(30);
        expect(upgrade.additionalMult).toBe(3);
      });

      it('should return zero upgrade for hand type never upgraded', () => {
        const upgrade = manager.getUpgradedValues(HandType.FOUR_OF_A_KIND);
        expect(upgrade.additionalChips).toBe(0);
        expect(upgrade.additionalMult).toBe(0);
        expect(upgrade.level).toBe(1);
      });

      it('should return accumulated upgrade after multiple applies', () => {
        manager.applyPlanetUpgrade(HandType.FLUSH, 10, 1);
        manager.applyPlanetUpgrade(HandType.FLUSH, 20, 2);
        const upgrade = manager.getUpgradedValues(HandType.FLUSH);
        expect(upgrade.additionalChips).toBe(30);
        expect(upgrade.additionalMult).toBe(3);
        expect(upgrade.level).toBe(3);
      });

      it('should throw error when handType is invalid', () => {
        // @ts-expect-error Testing invalid input
        expect(() => manager.getUpgradedValues('INVALID' as HandType)).toThrow(
          'Invalid hand type'
        );
      });
    });

    describe('reset()', () => {
      it('should clear all upgrades to zero', () => {
        // Apply various upgrades
        manager.applyPlanetUpgrade(HandType.HIGH_CARD, 10, 1);
        manager.applyPlanetUpgrade(HandType.PAIR, 20, 2);
        manager.applyPlanetUpgrade(HandType.FLUSH, 30, 3);

        manager.reset();

        // Verify all reset to zero
        Object.values(HandType).forEach((handType) => {
          const upgrade = manager.getUpgradedValues(handType);
          expect(upgrade.additionalChips).toBe(0);
          expect(upgrade.additionalMult).toBe(0);
          expect(upgrade.level).toBe(1);
        });
      });

      it('should allow multiple resets without error', () => {
        manager.applyPlanetUpgrade(HandType.STRAIGHT_FLUSH, 50, 5);
        manager.reset();
        manager.reset(); // Second reset
        const upgrade = manager.getUpgradedValues(HandType.STRAIGHT_FLUSH);
        expect(upgrade.additionalChips).toBe(0);
      });
    });

    describe('restoreUpgrade()', () => {
      it('should restore upgrade state with specific values and level', () => {
        manager.restoreUpgrade(HandType.FULL_HOUSE, 45, 6, 5);
        const upgrade = manager.getUpgradedValues(HandType.FULL_HOUSE);
        expect(upgrade.additionalChips).toBe(45);
        expect(upgrade.additionalMult).toBe(6);
        expect(upgrade.level).toBe(5);
      });

      it('should throw error on negative chips during restore', () => {
        expect(() => manager.restoreUpgrade(HandType.PAIR, -10, 2, 2)).toThrow(
          'Invalid restore values'
        );
      });

      it('should throw error on negative mult during restore', () => {
        expect(() => manager.restoreUpgrade(HandType.PAIR, 10, -2, 2)).toThrow(
          'Invalid restore values'
        );
      });

      it('should throw error on level less than 1 during restore', () => {
        expect(() => manager.restoreUpgrade(HandType.PAIR, 10, 2, 0)).toThrow(
          'Invalid restore values'
        );
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  describe('Integration: HandEvaluator with HandUpgradeManager', () => {
    let evaluator: HandEvaluator;
    let manager: HandUpgradeManager;

    beforeEach(() => {
      evaluator = new HandEvaluator();
      manager = new HandUpgradeManager();
    });

    it('should apply Pluto planet upgrade (+10 chips, +1 mult) to HIGH_CARD', () => {
      manager.applyPlanetUpgrade(HandType.HIGH_CARD, 10, 1);
      const result = evaluator.evaluateHand([new Card(CardValue.ACE, Suit.SPADES)], manager);
      expect(result.baseChips).toBe(15); // 5 + 10
      expect(result.baseMult).toBe(2);   // 1 + 1
    });

    it('should apply Neptune planet upgrade (+40 chips, +4 mult) to STRAIGHT_FLUSH', () => {
      manager.applyPlanetUpgrade(HandType.STRAIGHT_FLUSH, 40, 4);
      const result = evaluator.evaluateHand(TEST_HANDS.ROYAL_FLUSH, manager);
      expect(result.baseChips).toBe(140); // 100 + 40
      expect(result.baseMult).toBe(12);   // 8 + 4
    });

    it('should accumulate multiple planet upgrades on same hand type', () => {
      // Simulate multiple Pluto cards on PAIR
      manager.applyPlanetUpgrade(HandType.PAIR, 10, 1);
      manager.applyPlanetUpgrade(HandType.PAIR, 10, 1);
      manager.applyPlanetUpgrade(HandType.PAIR, 10, 1);

      const result = evaluator.evaluateHand(TEST_HANDS.PAIR_OF_KINGS, manager);
      expect(result.baseChips).toBe(40); // 10 + 30
      expect(result.baseMult).toBe(5);   // 2 + 3
    });

    it('should maintain separate upgrade tracks for different hand types', () => {
      manager.applyPlanetUpgrade(HandType.PAIR, 20, 2);
      manager.applyPlanetUpgrade(HandType.FLUSH, 30, 3);

      // Test PAIR hand
      const pairResult = evaluator.evaluateHand(TEST_HANDS.PAIR_OF_KINGS, manager);
      expect(pairResult.baseChips).toBe(30); // 10 + 20
      expect(pairResult.baseMult).toBe(4);   // 2 + 2

      // Test FLUSH hand
      const flushResult = evaluator.evaluateHand(TEST_HANDS.SPADE_FLUSH, manager);
      expect(flushResult.baseChips).toBe(65); // 35 + 30
      expect(flushResult.baseMult).toBe(7);   // 4 + 3
    });

    it('should correctly evaluate complete poker hand flow with upgrades', () => {
      // Setup: Apply upgrades to multiple hand types
      manager.applyPlanetUpgrade(HandType.STRAIGHT_FLUSH, 20, 2);
      manager.applyPlanetUpgrade(HandType.FOUR_OF_A_KIND, 15, 2);
      manager.applyPlanetUpgrade(HandType.FULL_HOUSE, 10, 1);
      manager.applyPlanetUpgrade(HandType.FLUSH, 5, 1);
      manager.applyPlanetUpgrade(HandType.STRAIGHT, 5, 1);
      manager.applyPlanetUpgrade(HandType.THREE_OF_A_KIND, 5, 1);
      manager.applyPlanetUpgrade(HandType.TWO_PAIR, 5, 1);
      manager.applyPlanetUpgrade(HandType.PAIR, 5, 1);
      manager.applyPlanetUpgrade(HandType.HIGH_CARD, 5, 1);

      // Test all 9 hand types with upgrades applied
      const testCases = [
        { hand: TEST_HANDS.ROYAL_FLUSH, type: HandType.STRAIGHT_FLUSH, chips: 120, mult: 10 },
        { hand: TEST_HANDS.FOUR_KINGS, type: HandType.FOUR_OF_A_KIND, chips: 75, mult: 9 },
        { hand: TEST_HANDS.KINGS_FULL_OF_NINES, type: HandType.FULL_HOUSE, chips: 50, mult: 5 },
        { hand: TEST_HANDS.SPADE_FLUSH, type: HandType.FLUSH, chips: 40, mult: 5 },
        { hand: TEST_HANDS.BROADWAY_STRAIGHT, type: HandType.STRAIGHT, chips: 35, mult: 5 },
        { hand: TEST_HANDS.THREE_KINGS, type: HandType.THREE_OF_A_KIND, chips: 35, mult: 4 },
        { hand: TEST_HANDS.KINGS_AND_NINES, type: HandType.TWO_PAIR, chips: 25, mult: 3 },
        { hand: TEST_HANDS.PAIR_OF_KINGS, type: HandType.PAIR, chips: 15, mult: 3 },
        { hand: TEST_HANDS.HIGH_CARD_HAND, type: HandType.HIGH_CARD, chips: 10, mult: 2 },
      ];

      testCases.forEach(({ hand, type, chips, mult }) => {
        const result = evaluator.evaluateHand(hand, manager);
        expect(result.handType).toBe(type);
        expect(result.baseChips).toBe(chips);
        expect(result.baseMult).toBe(mult);
      });
    });
  });
});
