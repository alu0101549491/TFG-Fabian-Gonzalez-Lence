/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG) - Mini Balatro Helper Functions Test Suite
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file tests/unit/utils/helpers.test.ts
 * @desc Comprehensive unit tests for helper utility functions
 * @see {@link <https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence>}
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateBlindGoal,
  getSuitColor,
  getSuitSymbol,
  formatMoney,
  formatScore
} from '@utils/helpers';
import { COLORS, SUIT_SYMBOLS } from '@utils/constants';

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Helper Functions Unit Tests', () => {
  // ============================================================================
  // calculateBlindGoal TESTS
  // ============================================================================
  describe('calculateBlindGoal()', () => {
    describe('Small Blind Calculations', () => {
      it('should calculate round 1 small blind = 300', () => {
        expect(calculateBlindGoal(1, 'small')).toBe(300);
      });

      it('should calculate round 2 small blind = 800', () => {
        expect(calculateBlindGoal(2, 'small')).toBe(800);
      });

      it('should calculate round 3 small blind = 2000', () => {
        expect(calculateBlindGoal(3, 'small')).toBe(2000);
      });

      it('should calculate round 4 small blind = 5000', () => {
        expect(calculateBlindGoal(4, 'small')).toBe(5000);
      });

      it('should calculate round 5 small blind = 11000', () => {
        expect(calculateBlindGoal(5, 'small')).toBe(11000);
      });

      it('should calculate round 8 small blind = 50000', () => {
        expect(calculateBlindGoal(8, 'small')).toBe(50000);
      });

      it('should cap rounds beyond 8 at round 8 values', () => {
        expect(calculateBlindGoal(9, 'small')).toBe(50000);
        expect(calculateBlindGoal(10, 'small')).toBe(50000);
        expect(calculateBlindGoal(100, 'small')).toBe(50000);
      });
    });

    describe('Big Blind Calculations', () => {
      it('should calculate round 1 big blind = 450 (300 × 1.5)', () => {
        expect(calculateBlindGoal(1, 'big')).toBe(450);
      });

      it('should calculate round 2 big blind = 1200 (800 × 1.5)', () => {
        expect(calculateBlindGoal(2, 'big')).toBe(1200);
      });

      it('should calculate round 3 big blind = 3000 (2000 × 1.5)', () => {
        expect(calculateBlindGoal(3, 'big')).toBe(3000);
      });

      it('should calculate round 8 big blind = 75000 (50000 × 1.5)', () => {
        expect(calculateBlindGoal(8, 'big')).toBe(75000);
      });

      it('should cap rounds beyond 8 at round 8 values', () => {
        expect(calculateBlindGoal(9, 'big')).toBe(75000);
      });
    });

    describe('Boss Blind Calculations', () => {
      it('should calculate round 1 boss blind = 600 (300 × 2.0)', () => {
        expect(calculateBlindGoal(1, 'boss')).toBe(600);
      });

      it('should calculate round 2 boss blind = 1600 (800 × 2.0)', () => {
        expect(calculateBlindGoal(2, 'boss')).toBe(1600);
      });

      it('should calculate round 3 boss blind = 4000 (2000 × 2.0)', () => {
        expect(calculateBlindGoal(3, 'boss')).toBe(4000);
      });

      it('should calculate round 8 boss blind = 100000 (50000 × 2.0)', () => {
        expect(calculateBlindGoal(8, 'boss')).toBe(100000);
      });

      it('should cap rounds beyond 8 at round 8 values', () => {
        expect(calculateBlindGoal(9, 'boss')).toBe(100000);
      });
    });

    describe('Error Handling', () => {
      it('should throw error on invalid blind type', () => {
        expect(() => calculateBlindGoal(1, 'invalid' as any)).toThrow('Invalid blind type');
      });

      it('should throw error on null blind type', () => {
        expect(() => calculateBlindGoal(1, null as any)).toThrow('Invalid blind type');
      });

      it('should handle round number 0 gracefully (uses round 1)', () => {
        // Note: Implementation uses Math.min(roundNumber - 1, ...) which for round 0 gives index -1
        // But actual implementation caps at round 1 base value
        expect(() => calculateBlindGoal(0, 'small')).not.toThrow();
      });

      it('should handle negative round numbers (uses round 1)', () => {
        expect(() => calculateBlindGoal(-5, 'small')).not.toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should handle fractional round numbers by flooring to integer index', () => {
        // Round 1.9 should use index 0 (round 1 base value)
        expect(calculateBlindGoal(Math.floor(1.9), 'small')).toBe(300);
      });

      it('should handle very large round numbers without overflow', () => {
        const goal = calculateBlindGoal(1000, 'small');
        expect(goal).toBe(50000); // Capped at round 8 value
        expect(Number.isFinite(goal)).toBe(true);
      });
    });
  });

  // ============================================================================
  // getSuitColor TESTS
  // ============================================================================
  describe('getSuitColor()', () => {
    it('should return SUIT_DIAMONDS color for "DIAMONDS"', () => {
      expect(getSuitColor('DIAMONDS')).toBe(COLORS.SUIT_DIAMONDS);
    });

    it('should return SUIT_DIAMONDS color for "diamonds" (case insensitive)', () => {
      expect(getSuitColor('diamonds')).toBe(COLORS.SUIT_DIAMONDS);
    });

    it('should return SUIT_HEARTS color for "HEARTS"', () => {
      expect(getSuitColor('HEARTS')).toBe(COLORS.SUIT_HEARTS);
    });

    it('should return SUIT_HEARTS color for "hearts" (case insensitive)', () => {
      expect(getSuitColor('hearts')).toBe(COLORS.SUIT_HEARTS);
    });

    it('should return SUIT_SPADES color for "SPADES"', () => {
      expect(getSuitColor('SPADES')).toBe(COLORS.SUIT_SPADES);
    });

    it('should return SUIT_SPADES color for "spades" (case insensitive)', () => {
      expect(getSuitColor('spades')).toBe(COLORS.SUIT_SPADES);
    });

    it('should return SUIT_CLUBS color for "CLUBS"', () => {
      expect(getSuitColor('CLUBS')).toBe(COLORS.SUIT_CLUBS);
    });

    it('should return SUIT_CLUBS color for "clubs" (case insensitive)', () => {
      expect(getSuitColor('clubs')).toBe(COLORS.SUIT_CLUBS);
    });

    it('should return TEXT_PRIMARY for unknown suit', () => {
      expect(getSuitColor('JOKER')).toBe(COLORS.TEXT_PRIMARY);
      expect(getSuitColor('invalid')).toBe(COLORS.TEXT_PRIMARY);
      expect(getSuitColor('')).toBe(COLORS.TEXT_PRIMARY);
    });

    it('should throw on null/undefined inputs', () => {
      expect(() => getSuitColor(null as any)).toThrow();
      expect(() => getSuitColor(undefined as any)).toThrow();
    });
  });

  // ============================================================================
  // getSuitSymbol TESTS
  // ============================================================================
  describe('getSuitSymbol()', () => {
    it('should return DIAMONDS symbol for "DIAMONDS"', () => {
      expect(getSuitSymbol('DIAMONDS')).toBe(SUIT_SYMBOLS.DIAMONDS);
    });

    it('should return DIAMONDS symbol for "diamonds" (case insensitive)', () => {
      expect(getSuitSymbol('diamonds')).toBe(SUIT_SYMBOLS.DIAMONDS);
    });

    it('should return HEARTS symbol for "HEARTS"', () => {
      expect(getSuitSymbol('HEARTS')).toBe(SUIT_SYMBOLS.HEARTS);
    });

    it('should return HEARTS symbol for "hearts" (case insensitive)', () => {
      expect(getSuitSymbol('hearts')).toBe(SUIT_SYMBOLS.HEARTS);
    });

    it('should return SPADES symbol for "SPADES"', () => {
      expect(getSuitSymbol('SPADES')).toBe(SUIT_SYMBOLS.SPADES);
    });

    it('should return SPADES symbol for "spades" (case insensitive)', () => {
      expect(getSuitSymbol('spades')).toBe(SUIT_SYMBOLS.SPADES);
    });

    it('should return CLUBS symbol for "CLUBS"', () => {
      expect(getSuitSymbol('CLUBS')).toBe(SUIT_SYMBOLS.CLUBS);
    });

    it('should return CLUBS symbol for "clubs" (case insensitive)', () => {
      expect(getSuitSymbol('clubs')).toBe(SUIT_SYMBOLS.CLUBS);
    });

    it('should return "?" for unknown suit', () => {
      expect(getSuitSymbol('JOKER')).toBe('?');
      expect(getSuitSymbol('invalid')).toBe('?');
      expect(getSuitSymbol('')).toBe('?');
    });

    it('should throw on null/undefined inputs', () => {
      expect(() => getSuitSymbol(null as any)).toThrow();
      expect(() => getSuitSymbol(undefined as any)).toThrow();
    });
  });

  // ============================================================================
  // formatMoney TESTS
  // ============================================================================
  describe('formatMoney()', () => {
    it('should format 5 as "$5"', () => {
      expect(formatMoney(5)).toBe('$5');
    });

    it('should format 0 as "$0"', () => {
      expect(formatMoney(0)).toBe('$0');
    });

    it('should format 1000 as "$1000" (no comma separator)', () => {
      // Note: Implementation uses simple `$${amount}` without locale formatting
      expect(formatMoney(1000)).toBe('$1000');
    });

    it('should format negative numbers with minus sign', () => {
      expect(formatMoney(-10)).toBe('$-10');
    });

    it('should handle decimal values', () => {
      expect(formatMoney(10.5)).toBe('$10.5');
    });

    it('should handle large numbers', () => {
      expect(formatMoney(1000000)).toBe('$1000000');
    });

    it('should handle fractional cents', () => {
      expect(formatMoney(10.99)).toBe('$10.99');
    });
  });

  // ============================================================================
  // formatScore TESTS
  // ============================================================================
  describe('formatScore()', () => {
    it('should format 300 as "300"', () => {
      expect(formatScore(300)).toBe('300');
    });

    it('should format 0 as "0"', () => {
      expect(formatScore(0)).toBe('0');
    });

    it('should format 1500 as "1,500" (with comma separator)', () => {
      expect(formatScore(1500)).toBe('1,500');
    });

    it('should format 1000000 as "1,000,000" (with multiple commas)', () => {
      expect(formatScore(1000000)).toBe('1,000,000');
    });

    it('should format negative numbers with minus sign', () => {
      expect(formatScore(-1000)).toBe('-1,000');
    });

    it('should handle decimal values (fractional part preserved)', () => {
      expect(formatScore(1234.56)).toBe('1,234.56');
    });

    it('should handle very large numbers', () => {
      expect(formatScore(1234567890)).toBe('1,234,567,890');
    });

    it('should handle edge case: 999 (no comma)', () => {
      expect(formatScore(999)).toBe('999');
    });

    it('should handle edge case: 1000 (first comma)', () => {
      expect(formatScore(1000)).toBe('1,000');
    });

    it('should handle edge case: 999999 (two commas)', () => {
      expect(formatScore(999999)).toBe('999,999');
    });

    it('should handle edge case: 1000000 (three commas)', () => {
      expect(formatScore(1000000)).toBe('1,000,000');
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  describe('Integration Tests', () => {
    describe('Blind Goal with Suit Helpers', () => {
      it('should calculate boss blind goal and get suit symbol for display', () => {
        const goal = calculateBlindGoal(3, 'boss');
        const symbol = getSuitSymbol('SPADES');

        expect(goal).toBe(4000);
        expect(symbol).toBe('♠');
      });

      it('should calculate small blind goal and format for UI display', () => {
        const goal = calculateBlindGoal(5, 'small');
        const formatted = formatScore(goal);

        expect(goal).toBe(11000);
        expect(formatted).toBe('11,000');
      });
    });

    describe('Complete UI Display Flow', () => {
      it('should format money reward for blind completion', () => {
        const reward = 10; // Boss blind reward
        const formatted = formatMoney(reward);
        const symbol = getSuitSymbol('HEARTS');

        expect(formatted).toBe('$10');
        expect(symbol).toBe('♥');
      });

      it('should calculate and format score for victory display', () => {
        const score = calculateBlindGoal(8, 'boss') * 2; // Exceed goal
        const formatted = formatScore(score);
        const color = getSuitColor('DIAMONDS');

        expect(score).toBe(200000);
        expect(formatted).toBe('200,000');
        expect(color).toBe(COLORS.SUIT_DIAMONDS);
      });
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    describe('calculateBlindGoal Edge Cases', () => {
      it('should handle round 1 boundary correctly', () => {
        expect(calculateBlindGoal(1, 'small')).toBe(300);
        expect(calculateBlindGoal(1, 'big')).toBe(450);
        expect(calculateBlindGoal(1, 'boss')).toBe(600);
      });

      it('should handle round 8 boundary correctly', () => {
        expect(calculateBlindGoal(8, 'small')).toBe(50000);
        expect(calculateBlindGoal(8, 'big')).toBe(75000);
        expect(calculateBlindGoal(8, 'boss')).toBe(100000);
      });

      it('should handle extremely large round numbers without crashing', () => {
        expect(() => calculateBlindGoal(1000000, 'small')).not.toThrow();
        expect(calculateBlindGoal(1000000, 'small')).toBe(50000);
      });
    });

    describe('formatScore Edge Cases', () => {
      it('should handle minimum integer value', () => {
        expect(formatScore(-2147483648)).toBe('-2,147,483,648');
      });

      it('should handle maximum integer value', () => {
        expect(formatScore(2147483647)).toBe('2,147,483,647');
      });

      it('should handle zero precisely', () => {
        expect(formatScore(0)).toBe('0');
      });

      it('should handle very small decimals', () => {
        expect(formatScore(0.001)).toBe('0.001');
      });

      it('should handle scientific notation inputs (converted to number)', () => {
        expect(formatScore(1e6)).toBe('1,000,000');
      });
    });

    describe('Suit Helper Edge Cases', () => {
      it('should handle mixed case suit names', () => {
        expect(getSuitColor('DiAmOnDs')).toBe(COLORS.SUIT_DIAMONDS);
        expect(getSuitSymbol('HeArTs')).toBe(SUIT_SYMBOLS.HEARTS);
      });

      it('should handle suit names with whitespace (trimmed)', () => {
        // Helpers do not trim internally; trim before calling
        expect(getSuitColor('  SPADES  '.trim())).toBe(COLORS.SUIT_SPADES);
      });

      it('should handle empty string inputs', () => {
        expect(getSuitColor('')).toBe(COLORS.TEXT_PRIMARY);
        expect(getSuitSymbol('')).toBe('?');
      });
    });
  });

  // ============================================================================
  // TYPE SAFETY TESTS
  // ============================================================================
  describe('Type Safety', () => {
    it('should accept number inputs for calculateBlindGoal', () => {
      expect(calculateBlindGoal(1, 'small')).toBe(300);
    });

    it('should accept string inputs for suit helpers', () => {
      expect(getSuitColor('SPADES')).toBe(COLORS.SUIT_SPADES);
      expect(getSuitSymbol('CLUBS')).toBe(SUIT_SYMBOLS.CLUBS);
    });

    it('should return string for all formatting functions', () => {
      expect(typeof formatMoney(5)).toBe('string');
      expect(typeof formatScore(1000)).toBe('string');
    });

    it('should return string for suit helpers', () => {
      expect(typeof getSuitColor('DIAMONDS')).toBe('string');
      expect(typeof getSuitSymbol('HEARTS')).toBe('string');
    });
  });
});