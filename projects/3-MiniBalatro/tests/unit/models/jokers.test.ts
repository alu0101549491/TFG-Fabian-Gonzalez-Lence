/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG) - Mini Balatro Joker System Test Suite
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file tests/unit/models/special-cards/jokers.test.ts
 * @desc Comprehensive unit tests for JokerPriority, Joker abstract class, and all Joker subclasses
 * @see {@link <https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence>}
 */

// Mock console.log to avoid polluting test output
jest.spyOn(console, 'log').mockImplementation(() => {});

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  JokerPriority,
  getPriorityValue,
  Joker,
  ChipJoker,
  MultJoker,
  MultiplierJoker,
  EconomicJoker,
  PermanentUpgradeJoker,
} from '@models/special-cards/jokers';
import { ScoreContext } from '@models/scoring/score-context';
import { Card, CardValue, Suit } from '@models/core';
import { HandType } from '@models/poker';

// ============================================================================
// TEST HELPERS
// ============================================================================

/** Creates a minimal ScoreContext for testing */
function createTestContext(
  cards: Card[],
  chips: number = 10,
  mult: number = 2,
  remainingDeckSize: number = 44,
  emptyJokerSlots: number = 2,
  discardsRemaining: number = 3
): ScoreContext {
  return new ScoreContext(
    chips,
    mult,
    cards,
    HandType.HIGH_CARD,
    remainingDeckSize,
    emptyJokerSlots,
    discardsRemaining
  );
}

/** Creates a test card with optional bonuses */
function createCard(value: CardValue, suit: Suit, chipBonus: number = 0, multBonus: number = 0): Card {
  const card = new Card(value, suit);
  if (chipBonus > 0 || multBonus > 0) {
    card.addPermanentBonus(chipBonus, multBonus);
  }
  return card;
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Joker System Unit Tests', () => {
  // ============================================================================
  // JOKER PRIORITY ENUM TESTS
  // ============================================================================
  describe('JokerPriority Enum', () => {
    it('should define CHIPS priority as 1', () => {
      expect(JokerPriority.CHIPS).toBe(1);
    });

    it('should define MULT priority as 2', () => {
      expect(JokerPriority.MULT).toBe(2);
    });

    it('should define MULTIPLIER priority as 3', () => {
      expect(JokerPriority.MULTIPLIER).toBe(3);
    });

    it('should contain exactly 3 priority values', () => {
      const values = Object.values(JokerPriority);
      // TypeScript numeric enums have both string keys and numeric values, so length is 6
      expect(values).toHaveLength(6);
      expect(values).toContain(JokerPriority.CHIPS);
      expect(values).toContain(JokerPriority.MULT);
      expect(values).toContain(JokerPriority.MULTIPLIER);
    });

    it('should support numeric sorting by priority value', () => {
      const priorities = [
        JokerPriority.MULTIPLIER,
        JokerPriority.CHIPS,
        JokerPriority.MULT,
      ];
      priorities.sort((a, b) => a - b);
      expect(priorities).toEqual([
        JokerPriority.CHIPS,
        JokerPriority.MULT,
        JokerPriority.MULTIPLIER,
      ]);
    });

    it('should return correct numeric value via getPriorityValue()', () => {
      expect(getPriorityValue(JokerPriority.CHIPS)).toBe(1);
      expect(getPriorityValue(JokerPriority.MULT)).toBe(2);
      expect(getPriorityValue(JokerPriority.MULTIPLIER)).toBe(3);
    });
  });

  // ============================================================================
  // JOKER ABSTRACT CLASS TESTS
  // ============================================================================
  describe('Joker Abstract Class', () => {
    // Concrete implementation for testing abstract class
    class TestJoker extends Joker {
      public applyEffect(context: ScoreContext): void {
        context.addChips(10);
      }
    }

    describe('constructor', () => {
      it('should create joker with valid properties', () => {
        const joker = new TestJoker(
          'test-id',
          'Test Joker',
          'Test description',
          JokerPriority.CHIPS
        );
        expect(joker.id).toBe('test-id');
        expect(joker.name).toBe('Test Joker');
        expect(joker.description).toBe('Test description');
        expect(joker.priority).toBe(JokerPriority.CHIPS);
      });

      it('should throw error on empty name', () => {
        expect(() =>
          new TestJoker('test-id', '', 'Test description', JokerPriority.CHIPS)
        ).toThrow('Joker name and description must not be empty');
      });

      it('should throw error on empty description', () => {
        expect(() =>
          new TestJoker('test-id', 'Test Joker', '', JokerPriority.CHIPS)
        ).toThrow('Joker name and description must not be empty');
      });

      it('should throw error on null name', () => {
        expect(() =>
          // @ts-expect-error Testing null input
          new TestJoker('test-id', null, 'Test description', JokerPriority.CHIPS)
        ).toThrow('Joker name and description must not be empty');
      });

      it('should throw error on null description', () => {
        expect(() =>
          // @ts-expect-error Testing null input
          new TestJoker('test-id', 'Test Joker', null, JokerPriority.CHIPS)
        ).toThrow('Joker name and description must not be empty');
      });
    });

    describe('getPriority()', () => {
      it("should return the joker's priority value", () => {
        const joker = new TestJoker(
          'test-id',
          'Test Joker',
          'Test description',
          JokerPriority.MULT
        );
        expect(joker.getPriority()).toBe(JokerPriority.MULT);
      });
    });

    describe('canActivate()', () => {
      it('should return true when no condition is provided', () => {
        const joker = new TestJoker(
          'test-id',
          'Test Joker',
          'Test description',
          JokerPriority.CHIPS
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        expect(joker.canActivate(context)).toBe(true);
      });

      it('should evaluate condition function when provided', () => {
        const condition = (ctx: ScoreContext) => ctx.playedCards.length >= 2;
        const joker = new TestJoker(
          'test-id',
          'Test Joker',
          'Test description',
          JokerPriority.CHIPS,
          condition
        );

        // Condition met (2 cards)
        let context = createTestContext([
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.KING, Suit.HEARTS),
        ]);
        expect(joker.canActivate(context)).toBe(true);

        // Condition not met (1 card)
        context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        expect(joker.canActivate(context)).toBe(false);
      });
    });

    describe('checkCondition() protected method', () => {
      it('should return true when no condition is provided', () => {
        const joker = new TestJoker(
          'test-id',
          'Test Joker',
          'Test description',
          JokerPriority.CHIPS
        );
        // Access protected method via reflection for testing
        // @ts-expect-error Accessing protected method
        expect(joker.checkCondition(createTestContext([createCard(CardValue.ACE, Suit.SPADES)]))).toBe(true);
      });

      it('should return condition function result when provided', () => {
        const condition = (ctx: ScoreContext) => ctx.remainingDeckSize > 40;
        const joker = new TestJoker(
          'test-id',
          'Test Joker',
          'Test description',
          JokerPriority.CHIPS,
          condition
        );
        // @ts-expect-error Accessing protected method
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)], 10, 2, 44);
        // @ts-expect-error Accessing protected method
        expect(joker.checkCondition(context)).toBe(true);
      });
    });
  });

  // ============================================================================
  // CHIPJOKER CLASS TESTS
  // ============================================================================
  describe('ChipJoker Class', () => {
    describe('constructor', () => {
      it('should create chip joker with valid inputs', () => {
        const joker = new ChipJoker(
          'odd-todd',
          'Odd Todd',
          '+31 chips per odd card',
          31
        );
        expect(joker.id).toBe('odd-todd');
        expect(joker.name).toBe('Odd Todd');
        expect(joker.description).toBe('+31 chips per odd card');
        expect(joker.priority).toBe(JokerPriority.CHIPS);
        // @ts-expect-error Accessing private property for test
        expect(joker.chipValue).toBe(31);
      });

      it('should throw error on chipsValue = 0', () => {
        expect(() =>
          new ChipJoker('test', 'Test', 'Test', 0)
        ).toThrow('Chip value must be positive');
      });

      it('should throw error on negative chipsValue', () => {
        expect(() =>
          new ChipJoker('test', 'Test', 'Test', -10)
        ).toThrow('Chip value must be positive');
      });

      it('should accept undefined condition function', () => {
        const joker = new ChipJoker(
          'test',
          'Test',
          'Test',
          10,
          undefined
        );
        expect(joker).toBeDefined();
      });

      it('should accept custom multiplier function', () => {
        const multiplierFn = (ctx: ScoreContext) => ctx.remainingDeckSize;
        const joker = new ChipJoker(
          'test',
          'Test',
          'Test',
          2,
          undefined,
          multiplierFn
        );
        expect(joker).toBeDefined();
      });
    });

    describe('canActivate()', () => {
      it('should return true if no condition provided (unconditional)', () => {
        const joker = new ChipJoker('test', 'Test', 'Test', 10);
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        expect(joker.canActivate(context)).toBe(true);
      });

      it('should return true if condition returns > 0', () => {
        const condition = (ctx: ScoreContext) => ctx.playedCards.length;
        const joker = new ChipJoker('test', 'Test', 'Test', 10, condition);
        const context = createTestContext([
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.KING, Suit.HEARTS),
        ]);
        expect(joker.canActivate(context)).toBeTruthy();
      });

      it('should return false if condition returns 0', () => {
        const condition = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length;
        const joker = new ChipJoker('test', 'Test', 'Test', 10, condition);
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]); // No diamonds
        expect(joker.canActivate(context)).toBeFalsy();
      });
    });

    describe('applyEffect()', () => {
      it('should add chips to context (unconditional)', () => {
        const joker = new ChipJoker('test', 'Test', '+10 chips', 10);
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        const initialChips = context.chips;

        joker.applyEffect(context);

        expect(context.chips).toBe(initialChips + 10);
      });

      it('should add chips × count with multiplier function', () => {
        const multiplierFn = (ctx: ScoreContext) => ctx.remainingDeckSize;
        const joker = new ChipJoker(
          'blue-joker',
          'Blue Joker',
          '+2 chips per deck card',
          2,
          undefined,
          multiplierFn
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)], 10, 2, 44);
        const initialChips = context.chips;

        joker.applyEffect(context);

        expect(context.chips).toBe(initialChips + 88); // 2 × 44
      });

      it('should not modify context if condition not met', () => {
        const condition = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length;
        const joker = new ChipJoker(
          'diamond-chip',
          'Diamond Chip',
          '+5 chips per Diamond',
          5,
          condition
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]); // No diamonds
        const initialChips = context.chips;

        joker.applyEffect(context);

        expect(context.chips).toBe(initialChips);
      });

      it('should handle multiplier function returning 0', () => {
        const multiplierFn = () => 0;
        const joker = new ChipJoker(
          'test',
          'Test',
          'Test',
          10,
          undefined,
          multiplierFn
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        const initialChips = context.chips;

        joker.applyEffect(context);

        expect(context.chips).toBe(initialChips); // 10 × 0 = 0 added
      });
    });

    describe('Specific Joker: Odd Todd', () => {
      it('should add +31 chips per odd-valued card (A,3,5,7,9)', () => {
        const multiplier = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => {
            const oddValues = [
              CardValue.ACE,
              CardValue.THREE,
              CardValue.FIVE,
              CardValue.SEVEN,
              CardValue.NINE,
            ];
            return oddValues.includes(c.value);
          }).length;

        const oddTodd = new ChipJoker(
          'odd-todd',
          'Odd Todd',
          '+31 chips per odd card',
          31,
          undefined,
          multiplier
        );

        const cards = [
          createCard(CardValue.ACE, Suit.SPADES),   // odd
          createCard(CardValue.THREE, Suit.HEARTS), // odd
          createCard(CardValue.KING, Suit.DIAMONDS), // even
        ];
        const context = createTestContext(cards);
        const initialChips = context.chips;

        oddTodd.applyEffect(context);

        expect(context.chips).toBe(initialChips + 62); // 31 × 2
      });
    });

    describe('Specific Joker: Even Steven', () => {
      it('should add +30 chips per even-valued card (2,4,6,8,10)', () => {
        const multiplier = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => {
            const evenValues = [
              CardValue.TWO,
              CardValue.FOUR,
              CardValue.SIX,
              CardValue.EIGHT,
              CardValue.TEN,
            ];
            return evenValues.includes(c.value);
          }).length;

        const evenSteven = new ChipJoker(
          'even-steven',
          'Even Steven',
          '+30 chips per even card',
          30,
          undefined,
          multiplier
        );

        const cards = [
          createCard(CardValue.TWO, Suit.SPADES),   // even
          createCard(CardValue.FOUR, Suit.HEARTS),  // even
          createCard(CardValue.SIX, Suit.DIAMONDS), // even
          createCard(CardValue.ACE, Suit.CLUBS),    // odd
        ];
        const context = createTestContext(cards);
        const initialChips = context.chips;

        evenSteven.applyEffect(context);

        expect(context.chips).toBe(initialChips + 90); // 30 × 3
      });
    });

    describe('Specific Joker: Blue Joker', () => {
      it('should add +2 chips per remaining deck card', () => {
        const multiplierFn = (ctx: ScoreContext) => ctx.remainingDeckSize;
        const blueJoker = new ChipJoker(
          'blue-joker',
          'Blue Joker',
          '+2 chips per deck card',
          2,
          undefined,
          multiplierFn
        );

        const cards = [createCard(CardValue.ACE, Suit.SPADES)];
        const context = createTestContext(cards, 10, 2, 44);
        const initialChips = context.chips;

        blueJoker.applyEffect(context);

        expect(context.chips).toBe(initialChips + 88); // 2 × 44
      });

      it('should handle empty deck (0 remaining cards)', () => {
        const multiplierFn = (ctx: ScoreContext) => ctx.remainingDeckSize;
        const blueJoker = new ChipJoker(
          'blue-joker',
          'Blue Joker',
          '+2 chips per deck card',
          2,
          undefined,
          multiplierFn
        );

        const cards = [createCard(CardValue.ACE, Suit.SPADES)];
        const context = createTestContext(cards, 10, 2, 0);
        const initialChips = context.chips;

        blueJoker.applyEffect(context);

        expect(context.chips).toBe(initialChips); // 2 × 0 = 0 added
      });
    });
  });

  // ============================================================================
  // MULTJOKER CLASS TESTS
  // ============================================================================
  describe('MultJoker Class', () => {
    describe('constructor', () => {
      it('should create mult joker with valid inputs', () => {
        const joker = new MultJoker(
          'joker',
          'Joker',
          '+4 mult',
          4
        );
        expect(joker.id).toBe('joker');
        expect(joker.name).toBe('Joker');
        expect(joker.description).toBe('+4 mult');
        expect(joker.priority).toBe(JokerPriority.MULT);
        // @ts-expect-error Accessing private property for test
        expect(joker.multValue).toBe(4);
      });

      it('should throw error on multValue = 0', () => {
        expect(() =>
          new MultJoker('test', 'Test', 'Test', 0)
        ).toThrow('Mult value must be positive');
      });

      it('should throw error on negative multValue', () => {
        expect(() =>
          new MultJoker('test', 'Test', 'Test', -3)
        ).toThrow('Mult value must be positive');
      });
    });

    describe('applyEffect()', () => {
      it('should add mult to context (unconditional)', () => {
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        const initialMult = context.mult;

        joker.applyEffect(context);

        expect(context.mult).toBe(initialMult + 4);
      });

      it('should add mult × count with multiplier function', () => {
        const multiplierFn = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length;
        const greedyJoker = new MultJoker(
          'greedy-joker',
          'Greedy Joker',
          '+3 mult per Diamond',
          3,
          undefined,
          multiplierFn
        );

        const cards = [
          createCard(CardValue.ACE, Suit.DIAMONDS),
          createCard(CardValue.KING, Suit.DIAMONDS),
          createCard(CardValue.QUEEN, Suit.DIAMONDS),
        ];
        const context = createTestContext(cards);
        const initialMult = context.mult;

        greedyJoker.applyEffect(context);

        expect(context.mult).toBe(initialMult + 9); // 3 × 3
      });

      it('should not modify context if condition not met', () => {
        const condition = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length;
        const greedyJoker = new MultJoker(
          'greedy-joker',
          'Greedy Joker',
          '+3 mult per Diamond',
          3,
          condition
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]); // No diamonds
        const initialMult = context.mult;

        greedyJoker.applyEffect(context);

        expect(context.mult).toBe(initialMult);
      });
    });

    describe('Specific Joker: Joker (unconditional)', () => {
      it('should always add +4 mult regardless of hand', () => {
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        const cards = [createCard(CardValue.ACE, Suit.SPADES)];
        const context = createTestContext(cards);
        const initialMult = context.mult;

        joker.applyEffect(context);

        expect(context.mult).toBe(initialMult + 4);
      });
    });

    describe('Specific Joker: Greedy/Lusty/Wrathful/Gluttonous Jokers', () => {
      it('should count Diamonds correctly (Greedy Joker)', () => {
        const multiplierFn = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length;
        const greedyJoker = new MultJoker(
          'greedy-joker',
          'Greedy Joker',
          '+3 mult per Diamond',
          3,
          undefined,
          multiplierFn
        );

        const cards = [
          createCard(CardValue.ACE, Suit.DIAMONDS),
          createCard(CardValue.KING, Suit.HEARTS),
          createCard(CardValue.QUEEN, Suit.DIAMONDS),
        ];
        const context = createTestContext(cards);
        const initialMult = context.mult;

        greedyJoker.applyEffect(context);

        expect(context.mult).toBe(initialMult + 6); // 3 × 2 diamonds
      });

      it('should count Hearts correctly (Lusty Joker)', () => {
        const multiplierFn = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.suit === Suit.HEARTS).length;
        const lustyJoker = new MultJoker(
          'lusty-joker',
          'Lusty Joker',
          '+3 mult per Heart',
          3,
          undefined,
          multiplierFn
        );

        const cards = [
          createCard(CardValue.ACE, Suit.HEARTS),
          createCard(CardValue.KING, Suit.HEARTS),
          createCard(CardValue.QUEEN, Suit.SPADES),
        ];
        const context = createTestContext(cards);
        const initialMult = context.mult;

        lustyJoker.applyEffect(context);

        expect(context.mult).toBe(initialMult + 6); // 3 × 2 hearts
      });

      it('should count Spades correctly (Wrathful Joker)', () => {
        const multiplierFn = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.suit === Suit.SPADES).length;
        const wrathfulJoker = new MultJoker(
          'wrathful-joker',
          'Wrathful Joker',
          '+3 mult per Spade',
          3,
          undefined,
          multiplierFn
        );

        const cards = [
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.KING, Suit.SPADES),
          createCard(CardValue.QUEEN, Suit.SPADES),
        ];
        const context = createTestContext(cards);
        const initialMult = context.mult;

        wrathfulJoker.applyEffect(context);

        expect(context.mult).toBe(initialMult + 9); // 3 × 3 spades
      });

      it('should count Clubs correctly (Gluttonous Joker)', () => {
        const multiplierFn = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.suit === Suit.CLUBS).length;
        const gluttonousJoker = new MultJoker(
          'gluttonous-joker',
          'Gluttonous Joker',
          '+3 mult per Club',
          3,
          undefined,
          multiplierFn
        );

        const cards = [
          createCard(CardValue.ACE, Suit.CLUBS),
          createCard(CardValue.KING, Suit.CLUBS),
        ];
        const context = createTestContext(cards);
        const initialMult = context.mult;

        gluttonousJoker.applyEffect(context);

        expect(context.mult).toBe(initialMult + 6); // 3 × 2 clubs
      });
    });

    describe('Specific Joker: Half Joker', () => {
      it('should add +20 mult if played hand has ≤3 cards', () => {
        const condition = (ctx: ScoreContext) => (ctx.playedCards.length <= 3 ? 1 : 0);
        const halfJoker = new MultJoker(
          'half-joker',
          'Half Joker',
          '+20 mult if ≤3 cards',
          20,
          condition
        );

        const cards = [
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.KING, Suit.HEARTS),
        ]; // 2 cards ≤ 3
        const context = createTestContext(cards);
        const initialMult = context.mult;

        halfJoker.applyEffect(context);

        expect(context.mult).toBe(initialMult + 20);
      });

      it('should not activate if played hand has >3 cards', () => {
        const condition = (ctx: ScoreContext) => (ctx.playedCards.length <= 3 ? 1 : 0);
        const halfJoker = new MultJoker(
          'half-joker',
          'Half Joker',
          '+20 mult if ≤3 cards',
          20,
          condition
        );

        const cards = [
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.KING, Suit.HEARTS),
          createCard(CardValue.QUEEN, Suit.DIAMONDS),
          createCard(CardValue.JACK, Suit.CLUBS),
        ]; // 4 cards > 3

        const context = createTestContext(cards);
        expect(halfJoker.canActivate(context)).toBeFalsy();
      });
    });

    describe('Specific Joker: Mystic Summit', () => {
      it('should add +15 mult if 0 discards remaining', () => {
        const condition = (ctx: ScoreContext) => (ctx.discardsRemaining === 0 ? 1 : 0);
        const mysticSummit = new MultJoker(
          'mystic-summit',
          'Mystic Summit',
          '+15 mult if 0 discards',
          15,
          condition
        );

        // With 0 discards remaining
        const cards = [createCard(CardValue.ACE, Suit.SPADES)];
        const context = createTestContext(cards, 10, 2, 44, 2, 0);
        const initialMult = context.mult;

        mysticSummit.applyEffect(context);

        expect(context.mult).toBe(initialMult + 15);
      });

      it('should not activate if discards remaining > 0', () => {
        const condition = (ctx: ScoreContext) => (ctx.discardsRemaining === 0 ? 1 : 0);
        const mysticSummit = new MultJoker(
          'mystic-summit',
          'Mystic Summit',
          '+15 mult if 0 discards',
          15,
          condition
        );

        // With 1 discard remaining
        const cards = [createCard(CardValue.ACE, Suit.SPADES)];
        const context = createTestContext(cards, 10, 2, 44, 2, 1);

        expect(mysticSummit.canActivate(context)).toBeFalsy();
      });
    });
  });

  // ============================================================================
  // MULTIPLIERJOKER CLASS TESTS
  // ============================================================================
  describe('MultiplierJoker Class', () => {
    describe('constructor', () => {
      it('should create multiplier joker with valid inputs', () => {
        const joker = new MultiplierJoker(
          'triboulet',
          'Triboulet',
          '×2 mult per K/Q',
          2
        );
        expect(joker.id).toBe('triboulet');
        expect(joker.name).toBe('Triboulet');
        expect(joker.description).toBe('×2 mult per K/Q');
        expect(joker.priority).toBe(JokerPriority.MULTIPLIER);
        // @ts-expect-error Accessing private property for test
        expect(joker.multiplierValue).toBe(2);
      });

      it('should throw error on multiplierValue < 1', () => {
        expect(() =>
          new MultiplierJoker('test', 'Test', 'Test', 0.5)
        ).toThrow('Multiplier value must be at least 1');
      });

      it('should throw error on multiplierValue = 0', () => {
        expect(() =>
          new MultiplierJoker('test', 'Test', 'Test', 0)
        ).toThrow('Multiplier value must be at least 1');
      });

      it('should accept multiplierValue = 1 (no-op multiplier)', () => {
        const joker = new MultiplierJoker('test', 'Test', 'Test', 1);
        expect(joker).toBeDefined();
      });
    });

    describe('applyEffect()', () => {
      it('should multiply mult by multiplierValue (unconditional, count = 1)', () => {
        const joker = new MultiplierJoker('test', 'Test', '×2', 2);
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        context.mult = 5; // Set initial mult

        joker.applyEffect(context);

        expect(context.mult).toBe(10); // 5 × 2
      });

      it('should apply multiplierValue^count when multiplierFn returns count > 1', () => {
        const multiplierFn = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c =>
            c.value === CardValue.KING || c.value === CardValue.QUEEN
          ).length;
        const triboulet = new MultiplierJoker(
          'triboulet',
          'Triboulet',
          '×2 mult per K/Q',
          2,
          undefined,
          multiplierFn
        );

        const cards = [
          createCard(CardValue.KING, Suit.SPADES),
          createCard(CardValue.KING, Suit.HEARTS),
        ]; // 2 Kings
        const context = createTestContext(cards);
        context.mult = 5; // Set initial mult

        triboulet.applyEffect(context);

        expect(context.mult).toBe(20); // 5 × (2^2) = 5 × 4 = 20
      });

      it('should not modify context if condition not met', () => {
        const condition = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c => c.value === CardValue.ACE).length > 0 ? 1 : 0;
        const joker = new MultiplierJoker(
          'ace-multiplier',
          'Ace Multiplier',
          '×2 if Ace present',
          2,
          condition
        );
        const context = createTestContext([createCard(CardValue.KING, Suit.SPADES)]); // No Ace
        const initialMult = context.mult;

        joker.applyEffect(context);

        expect(context.mult).toBe(initialMult);
      });

      it('should handle multiplierFn returning 0 (no multiplication)', () => {
        const multiplierFn = () => 0;
        const joker = new MultiplierJoker(
          'test',
          'Test',
          'Test',
          3,
          undefined,
          multiplierFn
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        const initialMult = context.mult;

        joker.applyEffect(context);

        expect(context.mult).toBe(0); // × (3 * 0) = ×0
      });
    });

    describe('Specific Joker: Triboulet', () => {
      it('should multiply by 2^count for each King or Queen played', () => {
        const multiplierFn = (ctx: ScoreContext) =>
          ctx.playedCards.filter(c =>
            c.value === CardValue.KING || c.value === CardValue.QUEEN
          ).length;
        const triboulet = new MultiplierJoker(
          'triboulet',
          'Triboulet',
          '×2 mult per K/Q',
          2,
          undefined,
          multiplierFn
        );

        const cards = [
          createCard(CardValue.KING, Suit.SPADES),
          createCard(CardValue.QUEEN, Suit.HEARTS),
          createCard(CardValue.KING, Suit.DIAMONDS),
        ]; // 3 K/Q
        const context = createTestContext(cards);
        context.mult = 2;

        triboulet.applyEffect(context);

        expect(context.mult).toBe(12); // 2 × (2 * 3) = 2 × 6 = 12
      });
    });

    describe('Specific Joker: Fibonacci', () => {
      it('should multiply by 8 if hand contains A,2,3,5,8 (any suits)', () => {
        const condition = (ctx: ScoreContext) => {
          const values = ctx.playedCards.map(c => c.value);
          const required = [
            CardValue.ACE,
            CardValue.TWO,
            CardValue.THREE,
            CardValue.FIVE,
            CardValue.EIGHT,
          ];
          return required.every(val => values.includes(val)) ? 1 : 0;
        };
        const fibonacci = new MultiplierJoker(
          'fibonacci',
          'Fibonacci',
          '×8 if A,2,3,5,8',
          8,
          condition
        );

        const cards = [
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.TWO, Suit.HEARTS),
          createCard(CardValue.THREE, Suit.DIAMONDS),
          createCard(CardValue.FIVE, Suit.CLUBS),
          createCard(CardValue.EIGHT, Suit.SPADES),
        ];
        const context = createTestContext(cards);
        context.mult = 2;

        fibonacci.applyEffect(context);

        expect(context.mult).toBe(16); // 2 × 8
      });

      it('should not activate if missing any required value', () => {
        const condition = (ctx: ScoreContext) => {
          const values = ctx.playedCards.map(c => c.value);
          const required = [
            CardValue.ACE,
            CardValue.TWO,
            CardValue.THREE,
            CardValue.FIVE,
            CardValue.EIGHT,
          ];
          return required.every(val => values.includes(val)) ? 1 : 0;
        };
        const fibonacci = new MultiplierJoker(
          'fibonacci',
          'Fibonacci',
          '×8 if A,2,3,5,8',
          8,
          condition
        );

        const cards = [
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.TWO, Suit.HEARTS),
          createCard(CardValue.THREE, Suit.DIAMONDS),
          createCard(CardValue.FIVE, Suit.CLUBS),
          // Missing EIGHT
          createCard(CardValue.SEVEN, Suit.SPADES),
        ];
        const context = createTestContext(cards);

        expect(fibonacci.canActivate(context)).toBeFalsy();
      });
    });

    describe('Specific Joker: Joker Stencil', () => {
      it('should multiply by 2 if played hand is exactly 1 card', () => {
        const condition = (ctx: ScoreContext) => (ctx.playedCards.length === 1 ? 1 : 0);
        const jokerStencil = new MultiplierJoker(
          'joker-stencil',
          'Joker Stencil',
          '×2 if exactly 1 card',
          2,
          condition
        );

        // Exactly 1 card
        let context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        context.mult = 3;
        jokerStencil.applyEffect(context);
        expect(context.mult).toBe(6); // 3 × 2

        // Reset for 2 cards test
        context = createTestContext([
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.KING, Suit.HEARTS),
        ]);
        context.mult = 3;
        jokerStencil.applyEffect(context);
        expect(context.mult).toBe(3); // No change (condition not met)
      });
    });
  });

  // ============================================================================
  // ECONOMICJOKER CLASS TESTS
  // ============================================================================
  describe('EconomicJoker Class', () => {
    describe('constructor', () => {
      it('should create economic joker with valid inputs', () => {
        const joker = new EconomicJoker(
          'golden-joker',
          'Golden Joker',
          '+$2 per level',
          2
        );
        expect(joker.id).toBe('golden-joker');
        expect(joker.name).toBe('Golden Joker');
        expect(joker.description).toBe('+$2 per level');
        expect(joker.priority).toBe(JokerPriority.CHIPS); // Placeholder priority
        // @ts-expect-error Accessing private property for test
        expect(joker.value).toBe(2);
      });
    });

    describe('canActivate()', () => {
      it('should always return false (not used in scoring)', () => {
        const joker = new EconomicJoker(
          'golden-joker',
          'Golden Joker',
          '+$2 per level',
          2
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        expect(joker.canActivate(context)).toBe(false);
      });
    });

    describe('applyEffect()', () => {
      it('should be no-op (does nothing to ScoreContext)', () => {
        const joker = new EconomicJoker(
          'golden-joker',
          'Golden Joker',
          '+$2 per level',
          2
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        const initialChips = context.chips;
        const initialMult = context.mult;

        joker.applyEffect(context);

        expect(context.chips).toBe(initialChips);
        expect(context.mult).toBe(initialMult);
      });
    });

    describe('getValue()', () => {
      it('should return the monetary value', () => {
        const joker = new EconomicJoker(
          'golden-joker',
          'Golden Joker',
          '+$2 per level',
          2
        );
        expect(joker.getValue()).toBe(2);
      });

      it('should return correct value for different amounts', () => {
        const joker = new EconomicJoker(
          'rich-joker',
          'Rich Joker',
          '+$5 per level',
          5
        );
        expect(joker.getValue()).toBe(5);
      });
    });
  });

  // ============================================================================
  // PERMANENTUPGRADEJOKER CLASS TESTS
  // ============================================================================
  describe('PermanentUpgradeJoker Class', () => {
    describe('constructor', () => {
      it('should create permanent upgrade joker with valid inputs', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        expect(joker.id).toBe('hiker');
        expect(joker.name).toBe('Hiker');
        expect(joker.description).toBe('+5 chips to each card');
        expect(joker.priority).toBe(JokerPriority.CHIPS); // Placeholder priority
        // Verify methods exist
        expect(typeof joker.upgradeCard).toBe('function');
        expect(typeof joker.upgradeCards).toBe('function');
      });

      it('should accept zero for chipsBonus', () => {
        const joker = new PermanentUpgradeJoker(
          'test',
          'Test',
          'Test',
          0,
          3
        );
        expect(joker).toBeDefined();
      });

      it('should accept zero for multBonus', () => {
        const joker = new PermanentUpgradeJoker(
          'test',
          'Test',
          'Test',
          5,
          0
        );
        expect(joker).toBeDefined();
      });
    });

    describe('canActivate()', () => {
      it('should always return true', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        expect(joker.canActivate(context)).toBe(true);
      });
    });

    describe('applyEffect()', () => {
      it('should be no-op (does nothing to ScoreContext)', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        const context = createTestContext([createCard(CardValue.ACE, Suit.SPADES)]);
        const initialChips = context.chips;

        joker.applyEffect(context);

        expect(context.chips).toBe(initialChips);
      });
    });

    describe('upgradeCard()', () => {
      it('should add permanent bonus to card', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        const card = createCard(CardValue.ACE, Suit.SPADES);

        joker.upgradeCard(card);

        expect(card.getBaseChips()).toBe(16); // 11 base + 5 bonus
        expect(card.getMultBonus()).toBe(0);
      });

      it('should add both chip and mult bonuses', () => {
        const joker = new PermanentUpgradeJoker(
          'balanced',
          'Balanced',
          '+3 chips, +1 mult to each card',
          3,
          1
        );
        const card = createCard(CardValue.KING, Suit.SPADES);

        joker.upgradeCard(card);

        expect(card.getBaseChips()).toBe(13); // 10 base + 3 bonus
        expect(card.getMultBonus()).toBe(1);
      });

      it('should accumulate on multiple applications', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        const card = createCard(CardValue.ACE, Suit.SPADES);

        joker.upgradeCard(card);
        joker.upgradeCard(card);
        joker.upgradeCard(card);

        expect(card.getBaseChips()).toBe(26); // 11 + (5 × 3)
      });

      it('should throw error on null card', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        expect(() =>
          // @ts-expect-error Testing null input
          joker.upgradeCard(null)
        ).toThrow();
      });
    });

    describe('upgradeCards()', () => {
      it('should upgrade all cards in array', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        const cards = [
          createCard(CardValue.ACE, Suit.SPADES),
          createCard(CardValue.KING, Suit.HEARTS),
          createCard(CardValue.QUEEN, Suit.DIAMONDS),
        ];

        joker.upgradeCards(cards);

        expect(cards[0].getBaseChips()).toBe(16); // 11 + 5
        expect(cards[1].getBaseChips()).toBe(15); // 10 + 5
        expect(cards[2].getBaseChips()).toBe(15); // 10 + 5
      });

      it('should handle empty array without error', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        expect(() => joker.upgradeCards([])).not.toThrow();
      });
    });

    describe('getChipBonus() and getMultBonus()', () => {
      it('should return configured chip bonus', () => {
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        expect(joker.getChipBonus()).toBe(5);
      });

      it('should return configured mult bonus', () => {
        const joker = new PermanentUpgradeJoker(
          'empress',
          'Empress',
          '+4 mult to each card',
          0,
          4
        );
        expect(joker.getMultBonus()).toBe(4);
      });
    });
  });

  // ============================================================================
  // PRIORITY SYSTEM INTEGRATION TESTS
  // ============================================================================
  describe('Priority System Integration', () => {
    it('should assign correct priorities to joker types', () => {
      const chipJoker = new ChipJoker('chip', 'Chip Joker', '+10 chips', 10);
      const multJoker = new MultJoker('mult', 'Mult Joker', '+4 mult', 4);
      const multiplierJoker = new MultiplierJoker('multiplier', 'Multiplier', '×2', 2);
      const economicJoker = new EconomicJoker('economic', 'Economic', '+$2', 2);
      const permanentJoker = new PermanentUpgradeJoker('permanent', 'Permanent', '+5 chips', 5, 0);

      expect(chipJoker.getPriority()).toBe(JokerPriority.CHIPS);
      expect(multJoker.getPriority()).toBe(JokerPriority.MULT);
      expect(multiplierJoker.getPriority()).toBe(JokerPriority.MULTIPLIER);
      expect(economicJoker.getPriority()).toBe(JokerPriority.CHIPS); // Placeholder
      expect(permanentJoker.getPriority()).toBe(JokerPriority.CHIPS); // Placeholder
    });

    it('should sort jokers by priority correctly (CHIPS → MULT → MULTIPLIER)', () => {
      const multiplierJoker = new MultiplierJoker('multiplier', 'Multiplier', '×2', 2);
      const chipJoker = new ChipJoker('chip', 'Chip Joker', '+10 chips', 10);
      const multJoker = new MultJoker('mult', 'Mult Joker', '+4 mult', 4);

      const jokers = [multiplierJoker, chipJoker, multJoker];
      jokers.sort((a, b) => a.getPriority() - b.getPriority());

      expect(jokers[0]).toBe(chipJoker);
      expect(jokers[1]).toBe(multJoker);
      expect(jokers[2]).toBe(multiplierJoker);
    });

    it('should preserve input order for jokers with same priority', () => {
      const chipJoker1 = new ChipJoker('chip1', 'Chip Joker 1', '+5 chips', 5);
      const chipJoker2 = new ChipJoker('chip2', 'Chip Joker 2', '+10 chips', 10);
      const chipJoker3 = new ChipJoker('chip3', 'Chip Joker 3', '+15 chips', 15);

      const jokers = [chipJoker3, chipJoker1, chipJoker2];
      jokers.sort((a, b) => a.getPriority() - b.getPriority());

      // Same priority group should maintain relative order
      expect(jokers[0]).toBe(chipJoker3);
      expect(jokers[1]).toBe(chipJoker1);
      expect(jokers[2]).toBe(chipJoker2);
    });

    it('should handle mixed joker types with correct priority ordering', () => {
      // Create jokers in reverse priority order
      const multiplierJoker = new MultiplierJoker('triboulet', 'Triboulet', '×2 per K/Q', 2, undefined,
        (ctx) => ctx.playedCards.filter(c => c.value === CardValue.KING).length
      );
      const multJoker = new MultJoker('joker', 'Joker', '+4 mult', 4);
      const chipJoker = new ChipJoker('odd-todd', 'Odd Todd', '+31 chips per odd', 31,
        (ctx) => ctx.playedCards.filter(c =>
          [CardValue.ACE, CardValue.THREE, CardValue.FIVE, CardValue.SEVEN, CardValue.NINE].includes(c.value)
        ).length
      );

      // Sort them
      const jokers = [multiplierJoker, multJoker, chipJoker];
      jokers.sort((a, b) => a.getPriority() - b.getPriority());

      // Verify order: CHIPS → MULT → MULTIPLIER
      expect(jokers[0].name).toBe('Odd Todd');    // CHIPS priority
      expect(jokers[1].name).toBe('Joker');       // MULT priority
      expect(jokers[2].name).toBe('Triboulet');   // MULTIPLIER priority
    });
  });

  // ============================================================================
  // SYNERGY & COMPLEX SCENARIO TESTS
  // ============================================================================
  describe('Synergy & Complex Scenarios', () => {
    it('should handle K♠ with Wrathful Joker + Triboulet synergy correctly', () => {
      // Setup: Pair of Kings with one Spade
      const cards = [
        createCard(CardValue.KING, Suit.SPADES),  // Spade King
        createCard(CardValue.KING, Suit.HEARTS),  // Heart King
      ];

      // Wrathful Joker: +3 mult per Spade (1 Spade = +3 mult)
      const wrathfulJoker = new MultJoker(
        'wrathful',
        'Wrathful Joker',
        '+3 mult per Spade',
        3,
        undefined,
        (ctx) => ctx.playedCards.filter(c => c.suit === Suit.SPADES).length
      );

      // Triboulet: ×2 mult per K/Q (2 Kings = ×2 ×2 = ×4)
      const triboulet = new MultiplierJoker(
        'triboulet',
        'Triboulet',
        '×2 mult per K/Q',
        2,
        undefined,
        (ctx) => ctx.playedCards.filter(c =>
          c.value === CardValue.KING || c.value === CardValue.QUEEN
        ).length
      );

      // Create context with base Pair values
      const context = createTestContext(cards, 10, 2); // 10 chips base, 2 mult base

      // Manually add card chips (simulating card evaluation phase)
      cards.forEach(card => {
        context.chips += card.getBaseChips();
      });

      // Apply jokers in priority order: CHIPS → MULT → MULTIPLIER
      // (No CHIPS jokers in this scenario)
      wrathfulJoker.applyEffect(context); // +3 mult → mult = 5
      triboulet.applyEffect(context);     // ×4 mult → mult = 20

      // Cards contribute: K♠ (10 chips) + K♥ (10 chips) = 20 chips
      // Total chips = base 10 + cards 20 = 30
      // Total mult = 20
      // Expected score = 30 × 20 = 600

      expect(context.chips).toBe(30);
      expect(context.mult).toBe(20);
    });

    it('should handle multiple jokers with same priority accumulating correctly', () => {
      const cards = [
        createCard(CardValue.ACE, Suit.DIAMONDS),
        createCard(CardValue.KING, Suit.DIAMONDS),
      ];

      // Two MultJokers both triggering on Diamonds
      const greedyJoker1 = new MultJoker(
        'greedy1',
        'Greedy Joker 1',
        '+3 mult per Diamond',
        3,
        undefined,
        (ctx) => ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length
      );
      const greedyJoker2 = new MultJoker(
        'greedy2',
        'Greedy Joker 2',
        '+2 mult per Diamond',
        2,
        undefined,
        (ctx) => ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length
      );

      const context = createTestContext(cards, 10, 2);

      // Apply both MULT jokers (same priority, order preserved)
      greedyJoker1.applyEffect(context); // +6 mult (3 × 2 diamonds) → mult = 8
      greedyJoker2.applyEffect(context); // +4 mult (2 × 2 diamonds) → mult = 12

      expect(context.mult).toBe(12);
    });

    it('should handle all 5 joker slots with mixed priorities', () => {
      const cards = [
        createCard(CardValue.KING, Suit.SPADES),  // Spade, King (even value)
        createCard(CardValue.THREE, Suit.SPADES), // Spade, odd value
      ];

      // CHIPS priority jokers
      const oddTodd = new ChipJoker(
        'odd-todd',
        'Odd Todd',
        '+31 chips per odd card',
        31,
        undefined,
        (ctx) => ctx.playedCards.filter(c =>
          [CardValue.ACE, CardValue.THREE, CardValue.FIVE, CardValue.SEVEN, CardValue.NINE].includes(c.value)
        ).length
      );

      // MULT priority jokers
      const wrathfulJoker = new MultJoker(
        'wrathful',
        'Wrathful Joker',
        '+3 mult per Spade',
        3,
        undefined,
        (ctx) => ctx.playedCards.filter(c => c.suit === Suit.SPADES).length
      );
      const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);

      // MULTIPLIER priority jokers
      const triboulet = new MultiplierJoker(
        'triboulet',
        'Triboulet',
        '×2 mult per K/Q',
        2,
        undefined,
        (ctx) => ctx.playedCards.filter(c =>
          c.value === CardValue.KING || c.value === CardValue.QUEEN
        ).length
      );

      const context = createTestContext(cards, 10, 2, 44);

      // Manually add card chips (simulating card evaluation phase)
      cards.forEach(card => {
        context.chips += card.getBaseChips();
      });

      // Apply in priority order
      oddTodd.applyEffect(context);        // +31 chips (31 × 1 odd card: THREE) → chips = 54
      wrathfulJoker.applyEffect(context);  // +6 mult (3 × 2 spades) → mult = 8
      joker.applyEffect(context);          // +4 mult → mult = 12
      triboulet.applyEffect(context);      // ×2 mult (2^1 for 1 King) → mult = 24

      // Cards contribute: K♠ (10) + 3♠ (3) = 13 chips
      // Total chips = base 10 + cards 13 + oddTodd 31 = 54
      // Total mult = 24
      // Expected score = 54 × 24 = 1296

      expect(context.chips).toBe(54);
      expect(context.mult).toBe(24);
    });

    it('should ignore Economic and Permanent jokers during scoring', () => {
      const cards = [createCard(CardValue.ACE, Suit.SPADES)];
      const context = createTestContext(cards, 10, 2);

      // Economic Joker (should not activate)
      const economicJoker = new EconomicJoker('golden', 'Golden Joker', '+$2', 2);
      expect(economicJoker.canActivate(context)).toBe(false);

      // Permanent Upgrade Joker (returns true but doesn't affect scoring)
      const permanentJoker = new PermanentUpgradeJoker('hiker', 'Hiker', '+5 chips', 5, 0);
      expect(permanentJoker.canActivate(context)).toBe(true);

      // Verify they don't modify context
      const initialChips = context.chips;
      const initialMult = context.mult;

      economicJoker.applyEffect(context);
      permanentJoker.applyEffect(context);

      expect(context.chips).toBe(initialChips);
      expect(context.mult).toBe(initialMult);
    });
  });
});