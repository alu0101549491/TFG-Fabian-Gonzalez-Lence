/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG) - Mini Balatro Constants Test Suite
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file tests/unit/utils/constants.test.ts
 * @desc Comprehensive unit tests for application constants with exact implementation alignment
 * @see {@link <https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence>}
 */

import { describe, it, expect } from '@jest/globals';
import {
  GAME_CONFIG,
  SHOP_CONFIG,
  TAROT_CONFIG,
  BLIND_REWARDS,
  COLORS,
  SUIT_SYMBOLS,
  CARD_VALUE_DISPLAY,
  BASE_CARD_VALUES,
  BASE_HAND_VALUES,
  PLANET_UPGRADES,
  DIFFICULTY_CONFIG,
  ANIMATION_TIMING,
  STORAGE_KEYS,
  UI_CONFIG
} from '@utils/constants';
import { HandType } from '@models/poker/hand-type.enum';
import { CardValue } from '@models/core/card-value.enum';
import { Suit } from '@models/core/suit.enum';

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Constants Unit Tests', () => {
  // ============================================================================
  // GAME_CONFIG TESTS
  // ============================================================================
  describe('GAME_CONFIG', () => {
    it('should have INITIAL_MONEY = 5', () => {
      expect(GAME_CONFIG.INITIAL_MONEY).toBe(5);
    });

    it('should have MAX_JOKERS = 5', () => {
      expect(GAME_CONFIG.MAX_JOKERS).toBe(5);
    });

    it('should have MAX_CONSUMABLES = 2', () => {
      expect(GAME_CONFIG.MAX_CONSUMABLES).toBe(2);
    });

    it('should have HAND_SIZE = 8', () => {
      expect(GAME_CONFIG.HAND_SIZE).toBe(8);
    });

    it('should have MAX_CARDS_TO_PLAY = 5', () => {
      expect(GAME_CONFIG.MAX_CARDS_TO_PLAY).toBe(5);
    });

    it('should have MAX_HANDS_PER_BLIND = 3', () => {
      expect(GAME_CONFIG.MAX_HANDS_PER_BLIND).toBe(3);
    });

    it('should have MAX_DISCARDS_PER_BLIND = 3', () => {
      expect(GAME_CONFIG.MAX_DISCARDS_PER_BLIND).toBe(3);
    });

    it('should have VICTORY_ROUNDS = 8', () => {
      expect(GAME_CONFIG.VICTORY_ROUNDS).toBe(8);
    });

    it('should have LEVELS_PER_ROUND = 3', () => {
      expect(GAME_CONFIG.LEVELS_PER_ROUND).toBe(3);
    });

    it('should have all numeric values positive', () => {
      expect(GAME_CONFIG.INITIAL_MONEY).toBeGreaterThan(0);
      expect(GAME_CONFIG.MAX_JOKERS).toBeGreaterThan(0);
      expect(GAME_CONFIG.HAND_SIZE).toBeGreaterThan(0);
      expect(GAME_CONFIG.VICTORY_ROUNDS).toBeGreaterThan(0);
    });

    it('should have integer values for discrete counts', () => {
      expect(Number.isInteger(GAME_CONFIG.INITIAL_MONEY)).toBe(true);
      expect(Number.isInteger(GAME_CONFIG.MAX_JOKERS)).toBe(true);
      expect(Number.isInteger(GAME_CONFIG.HAND_SIZE)).toBe(true);
    });
  });

  // ============================================================================
  // SHOP_CONFIG TESTS
  // ============================================================================
  describe('SHOP_CONFIG', () => {
    it('should have JOKER_COST = 5', () => {
      expect(SHOP_CONFIG.JOKER_COST).toBe(5);
    });

    it('should have PLANET_COST = 3', () => {
      expect(SHOP_CONFIG.PLANET_COST).toBe(3);
    });

    it('should have TAROT_COST = 3', () => {
      expect(SHOP_CONFIG.TAROT_COST).toBe(3);
    });

    it('should have REROLL_COST = 3', () => {
      expect(SHOP_CONFIG.REROLL_COST).toBe(3);
    });

    it('should have ITEMS_PER_SHOP = 4', () => {
      expect(SHOP_CONFIG.ITEMS_PER_SHOP).toBe(4);
    });

    it('should have JOKER_WEIGHT = 0.4', () => {
      expect(SHOP_CONFIG.JOKER_WEIGHT).toBe(0.4);
    });

    it('should have PLANET_WEIGHT = 0.3', () => {
      expect(SHOP_CONFIG.PLANET_WEIGHT).toBe(0.3);
    });

    it('should have TAROT_WEIGHT = 0.3', () => {
      expect(SHOP_CONFIG.TAROT_WEIGHT).toBe(0.3);
    });

    it('should have weights summing to 1.0', () => {
      const totalWeight = SHOP_CONFIG.JOKER_WEIGHT +
                         SHOP_CONFIG.PLANET_WEIGHT +
                         SHOP_CONFIG.TAROT_WEIGHT;
      expect(totalWeight).toBeCloseTo(1.0, 0.001);
    });
  });

  // ============================================================================
  // TAROT_CONFIG TESTS
  // ============================================================================
  describe('TAROT_CONFIG', () => {
    it('should have HERMIT_MAX_MONEY_BONUS = 20', () => {
      expect(TAROT_CONFIG.HERMIT_MAX_MONEY_BONUS).toBe(20);
    });

    it('should have positive numeric value', () => {
      expect(TAROT_CONFIG.HERMIT_MAX_MONEY_BONUS).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // BLIND_REWARDS TESTS
  // ============================================================================
  describe('BLIND_REWARDS', () => {
    it('should have SMALL_BLIND = 2', () => {
      expect(BLIND_REWARDS.SMALL_BLIND).toBe(2);
    });

    it('should have BIG_BLIND = 5', () => {
      expect(BLIND_REWARDS.BIG_BLIND).toBe(5);
    });

    it('should have BOSS_BLIND = 10', () => {
      expect(BLIND_REWARDS.BOSS_BLIND).toBe(10);
    });

    it('should have rewards in correct order: SMALL < BIG < BOSS', () => {
      expect(BLIND_REWARDS.SMALL_BLIND).toBeLessThan(BLIND_REWARDS.BIG_BLIND);
      expect(BLIND_REWARDS.BIG_BLIND).toBeLessThan(BLIND_REWARDS.BOSS_BLIND);
    });
  });

  // ============================================================================
  // COLORS TESTS
  // ============================================================================
  describe('COLORS', () => {
    // Helper to validate hex color format
    const isValidHexColor = (color: string): boolean => {
      return /^#[0-9A-Fa-f]{6}$/.test(color);
    };

    describe('Theme Colors', () => {
      it('should have BG_PRIMARY as valid hex color', () => {
        expect(isValidHexColor(COLORS.BG_PRIMARY)).toBe(true);
      });

      it('should have BG_PANEL as valid hex color', () => {
        expect(isValidHexColor(COLORS.BG_PANEL)).toBe(true);
      });

      it('should have BORDER as valid hex color', () => {
        expect(isValidHexColor(COLORS.BORDER)).toBe(true);
      });

      it('should have ACCENT as valid hex color', () => {
        expect(isValidHexColor(COLORS.ACCENT)).toBe(true);
      });
    });

    describe('Text Colors', () => {
      it('should have TEXT_PRIMARY as valid hex color', () => {
        expect(isValidHexColor(COLORS.TEXT_PRIMARY)).toBe(true);
      });

      it('should have TEXT_SECONDARY as valid hex color', () => {
        expect(isValidHexColor(COLORS.TEXT_SECONDARY)).toBe(true);
      });

      it('should have TEXT_TERTIARY as valid hex color', () => {
        expect(isValidHexColor(COLORS.TEXT_TERTIARY)).toBe(true);
      });
    });

    describe('Suit Colors', () => {
      it('should have SUIT_DIAMONDS as valid hex color', () => {
        expect(isValidHexColor(COLORS.SUIT_DIAMONDS)).toBe(true);
      });

      it('should have SUIT_HEARTS as valid hex color', () => {
        expect(isValidHexColor(COLORS.SUIT_HEARTS)).toBe(true);
      });

      it('should have SUIT_SPADES as valid hex color', () => {
        expect(isValidHexColor(COLORS.SUIT_SPADES)).toBe(true);
      });

      it('should have SUIT_CLUBS as valid hex color', () => {
        expect(isValidHexColor(COLORS.SUIT_CLUBS)).toBe(true);
      });

      it('should have distinct suit colors', () => {
        expect(COLORS.SUIT_DIAMONDS).not.toBe(COLORS.SUIT_HEARTS);
        expect(COLORS.SUIT_HEARTS).not.toBe(COLORS.SUIT_SPADES);
        expect(COLORS.SUIT_SPADES).not.toBe(COLORS.SUIT_CLUBS);
      });
    });

    describe('Indicator Colors', () => {
      it('should have CHIPS as valid hex color', () => {
        expect(isValidHexColor(COLORS.CHIPS)).toBe(true);
      });

      it('should have MULT as valid hex color', () => {
        expect(isValidHexColor(COLORS.MULT)).toBe(true);
      });

      it('should have MONEY as valid hex color', () => {
        expect(isValidHexColor(COLORS.MONEY)).toBe(true);
      });

      it('should have SUCCESS as valid hex color', () => {
        expect(isValidHexColor(COLORS.SUCCESS)).toBe(true);
      });

      it('should have WARNING as valid hex color', () => {
        expect(isValidHexColor(COLORS.WARNING)).toBe(true);
      });

      it('should have ERROR as valid hex color', () => {
        expect(isValidHexColor(COLORS.ERROR)).toBe(true);
      });
    });

    describe('Victory Modal Colors', () => {
      it('should have VICTORY_BG_START as valid hex color', () => {
        expect(isValidHexColor(COLORS.VICTORY_BG_START)).toBe(true);
      });

      it('should have VICTORY_BG_END as valid hex color', () => {
        expect(isValidHexColor(COLORS.VICTORY_BG_END)).toBe(true);
      });

      it('should have VICTORY_BORDER as valid hex color', () => {
        expect(isValidHexColor(COLORS.VICTORY_BORDER)).toBe(true);
      });

      it('should have VICTORY_TEXT as valid hex color', () => {
        expect(isValidHexColor(COLORS.VICTORY_TEXT)).toBe(true);
      });

      it('should have VICTORY_TITLE as valid hex color', () => {
        expect(isValidHexColor(COLORS.VICTORY_TITLE)).toBe(true);
      });

      it('should have VICTORY_BTN_START as valid hex color', () => {
        expect(isValidHexColor(COLORS.VICTORY_BTN_START)).toBe(true);
      });

      it('should have VICTORY_BTN_END as valid hex color', () => {
        expect(isValidHexColor(COLORS.VICTORY_BTN_END)).toBe(true);
      });
    });

    describe('Defeat Modal Colors', () => {
      it('should have DEFEAT_BG_START as valid hex color', () => {
        expect(isValidHexColor(COLORS.DEFEAT_BG_START)).toBe(true);
      });

      it('should have DEFEAT_BG_END as valid hex color', () => {
        expect(isValidHexColor(COLORS.DEFEAT_BG_END)).toBe(true);
      });

      it('should have DEFEAT_BORDER as valid hex color', () => {
        expect(isValidHexColor(COLORS.DEFEAT_BORDER)).toBe(true);
      });

      it('should have DEFEAT_TEXT as valid hex color', () => {
        expect(isValidHexColor(COLORS.DEFEAT_TEXT)).toBe(true);
      });

      it('should have DEFEAT_TITLE as valid hex color', () => {
        expect(isValidHexColor(COLORS.DEFEAT_TITLE)).toBe(true);
      });

      it('should have DEFEAT_BTN_START as valid hex color', () => {
        expect(isValidHexColor(COLORS.DEFEAT_BTN_START)).toBe(true);
      });

      it('should have DEFEAT_BTN_END as valid hex color', () => {
        expect(isValidHexColor(COLORS.DEFEAT_BTN_END)).toBe(true);
      });
    });

    describe('Color Format Validation', () => {
      it('should have all colors start with #', () => {
        Object.values(COLORS).forEach(color => {
          expect(color.startsWith('#')).toBe(true);
        });
      });

      it('should have all colors as 7 characters (#RRGGBB)', () => {
        Object.values(COLORS).forEach(color => {
          expect(color.length).toBe(7);
        });
      });

      it('should have all colors contain only hex characters', () => {
        Object.values(COLORS).forEach(color => {
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
      });
    });
  });

  // ============================================================================
  // SUIT_SYMBOLS TESTS
  // ============================================================================
  describe('SUIT_SYMBOLS', () => {
    it('should have DIAMONDS = ♦', () => {
      expect(SUIT_SYMBOLS.DIAMONDS).toBe('♦');
    });

    it('should have HEARTS = ♥', () => {
      expect(SUIT_SYMBOLS.HEARTS).toBe('♥');
    });

    it('should have SPADES = ♠', () => {
      expect(SUIT_SYMBOLS.SPADES).toBe('♠');
    });

    it('should have CLUBS = ♣', () => {
      expect(SUIT_SYMBOLS.CLUBS).toBe('♣');
    });

    it('should have all symbols as single characters', () => {
      expect(SUIT_SYMBOLS.DIAMONDS.length).toBe(1);
      expect(SUIT_SYMBOLS.HEARTS.length).toBe(1);
      expect(SUIT_SYMBOLS.SPADES.length).toBe(1);
      expect(SUIT_SYMBOLS.CLUBS.length).toBe(1);
    });
  });

  // ============================================================================
  // CARD_VALUE_DISPLAY TESTS
  // ============================================================================
  describe('CARD_VALUE_DISPLAY', () => {
    it('should have ACE = "A"', () => {
      expect(CARD_VALUE_DISPLAY.ACE).toBe('A');
    });

    it('should have KING = "K"', () => {
      expect(CARD_VALUE_DISPLAY.KING).toBe('K');
    });

    it('should have QUEEN = "Q"', () => {
      expect(CARD_VALUE_DISPLAY.QUEEN).toBe('Q');
    });

    it('should have JACK = "J"', () => {
      expect(CARD_VALUE_DISPLAY.JACK).toBe('J');
    });

    it('should have TEN = "10"', () => {
      expect(CARD_VALUE_DISPLAY.TEN).toBe('10');
    });

    it('should have NINE = "9"', () => {
      expect(CARD_VALUE_DISPLAY.NINE).toBe('9');
    });

    it('should have EIGHT = "8"', () => {
      expect(CARD_VALUE_DISPLAY.EIGHT).toBe('8');
    });

    it('should have SEVEN = "7"', () => {
      expect(CARD_VALUE_DISPLAY.SEVEN).toBe('7');
    });

    it('should have SIX = "6"', () => {
      expect(CARD_VALUE_DISPLAY.SIX).toBe('6');
    });

    it('should have FIVE = "5"', () => {
      expect(CARD_VALUE_DISPLAY.FIVE).toBe('5');
    });

    it('should have FOUR = "4"', () => {
      expect(CARD_VALUE_DISPLAY.FOUR).toBe('4');
    });

    it('should have THREE = "3"', () => {
      expect(CARD_VALUE_DISPLAY.THREE).toBe('3');
    });

    it('should have TWO = "2"', () => {
      expect(CARD_VALUE_DISPLAY.TWO).toBe('2');
    });

    it('should have all values as strings', () => {
      Object.values(CARD_VALUE_DISPLAY).forEach(value => {
        expect(typeof value).toBe('string');
      });
    });
  });

  // ============================================================================
  // BASE_CARD_VALUES TESTS
  // ============================================================================
  describe('BASE_CARD_VALUES', () => {
    it('should have ACE = 11', () => {
      expect(BASE_CARD_VALUES.ACE).toBe(11);
    });

    it('should have KING = 10', () => {
      expect(BASE_CARD_VALUES.KING).toBe(10);
    });

    it('should have QUEEN = 10', () => {
      expect(BASE_CARD_VALUES.QUEEN).toBe(10);
    });

    it('should have JACK = 10', () => {
      expect(BASE_CARD_VALUES.JACK).toBe(10);
    });

    it('should have TEN = 10', () => {
      expect(BASE_CARD_VALUES.TEN).toBe(10);
    });

    it('should have NINE = 9', () => {
      expect(BASE_CARD_VALUES.NINE).toBe(9);
    });

    it('should have EIGHT = 8', () => {
      expect(BASE_CARD_VALUES.EIGHT).toBe(8);
    });

    it('should have SEVEN = 7', () => {
      expect(BASE_CARD_VALUES.SEVEN).toBe(7);
    });

    it('should have SIX = 6', () => {
      expect(BASE_CARD_VALUES.SIX).toBe(6);
    });

    it('should have FIVE = 5', () => {
      expect(BASE_CARD_VALUES.FIVE).toBe(5);
    });

    it('should have FOUR = 4', () => {
      expect(BASE_CARD_VALUES.FOUR).toBe(4);
    });

    it('should have THREE = 3', () => {
      expect(BASE_CARD_VALUES.THREE).toBe(3);
    });

    it('should have TWO = 2', () => {
      expect(BASE_CARD_VALUES.TWO).toBe(2);
    });

    it('should have all values as positive numbers', () => {
      Object.values(BASE_CARD_VALUES).forEach(value => {
        expect(value).toBeGreaterThan(0);
        expect(typeof value).toBe('number');
      });
    });

    it('should have face cards (K/Q/J/10) all equal to 10', () => {
      expect(BASE_CARD_VALUES.KING).toBe(10);
      expect(BASE_CARD_VALUES.QUEEN).toBe(10);
      expect(BASE_CARD_VALUES.JACK).toBe(10);
      expect(BASE_CARD_VALUES.TEN).toBe(10);
    });

    it('should have numeric cards matching their face value', () => {
      expect(BASE_CARD_VALUES.NINE).toBe(9);
      expect(BASE_CARD_VALUES.EIGHT).toBe(8);
      expect(BASE_CARD_VALUES.SEVEN).toBe(7);
      expect(BASE_CARD_VALUES.SIX).toBe(6);
      expect(BASE_CARD_VALUES.FIVE).toBe(5);
      expect(BASE_CARD_VALUES.FOUR).toBe(4);
      expect(BASE_CARD_VALUES.THREE).toBe(3);
      expect(BASE_CARD_VALUES.TWO).toBe(2);
    });
  });

  // ============================================================================
  // BASE_HAND_VALUES TESTS
  // ============================================================================
  describe('BASE_HAND_VALUES', () => {
    it('should have HIGH_CARD = { chips: 5, mult: 1 }', () => {
      expect(BASE_HAND_VALUES.HIGH_CARD).toEqual({ chips: 5, mult: 1 });
    });

    it('should have PAIR = { chips: 10, mult: 2 }', () => {
      expect(BASE_HAND_VALUES.PAIR).toEqual({ chips: 10, mult: 2 });
    });

    it('should have TWO_PAIR = { chips: 20, mult: 2 }', () => {
      expect(BASE_HAND_VALUES.TWO_PAIR).toEqual({ chips: 20, mult: 2 });
    });

    it('should have THREE_OF_A_KIND = { chips: 30, mult: 3 }', () => {
      expect(BASE_HAND_VALUES.THREE_OF_A_KIND).toEqual({ chips: 30, mult: 3 });
    });

    it('should have STRAIGHT = { chips: 30, mult: 4 }', () => {
      expect(BASE_HAND_VALUES.STRAIGHT).toEqual({ chips: 30, mult: 4 });
    });

    it('should have FLUSH = { chips: 35, mult: 4 }', () => {
      expect(BASE_HAND_VALUES.FLUSH).toEqual({ chips: 35, mult: 4 });
    });

    it('should have FULL_HOUSE = { chips: 40, mult: 4 }', () => {
      expect(BASE_HAND_VALUES.FULL_HOUSE).toEqual({ chips: 40, mult: 4 });
    });

    it('should have FOUR_OF_A_KIND = { chips: 60, mult: 7 }', () => {
      expect(BASE_HAND_VALUES.FOUR_OF_A_KIND).toEqual({ chips: 60, mult: 7 });
    });

    it('should have STRAIGHT_FLUSH = { chips: 100, mult: 8 }', () => {
      expect(BASE_HAND_VALUES.STRAIGHT_FLUSH).toEqual({ chips: 100, mult: 8 });
    });

    it('should have all values as objects with chips and mult properties', () => {
      Object.values(BASE_HAND_VALUES).forEach(value => {
        expect(value).toHaveProperty('chips');
        expect(value).toHaveProperty('mult');
        expect(typeof value.chips).toBe('number');
        expect(typeof value.mult).toBe('number');
      });
    });

    it('should have chips values in ascending order by hand strength', () => {
      // Define explicit hand strength order from weakest to strongest
      const handOrder: HandType[] = [
        HandType.HIGH_CARD,
        HandType.PAIR,
        HandType.TWO_PAIR,
        HandType.THREE_OF_A_KIND,
        HandType.STRAIGHT,
        HandType.FLUSH,
        HandType.FULL_HOUSE,
        HandType.FOUR_OF_A_KIND,
        HandType.STRAIGHT_FLUSH
      ];
      const values = handOrder.map(hand => BASE_HAND_VALUES[hand].chips);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
      }
    });

    it('should have mult values in ascending order by hand strength', () => {
      const handOrder: HandType[] = [
        HandType.HIGH_CARD,
        HandType.PAIR,
        HandType.TWO_PAIR,
        HandType.THREE_OF_A_KIND,
        HandType.STRAIGHT,
        HandType.FLUSH,
        HandType.FULL_HOUSE,
        HandType.FOUR_OF_A_KIND,
        HandType.STRAIGHT_FLUSH
      ];
      const values = handOrder.map(hand => BASE_HAND_VALUES[hand].mult);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
      }
    });
  });

  // ============================================================================
  // PLANET_UPGRADES TESTS
  // ============================================================================
  describe('PLANET_UPGRADES', () => {
    it('should have PLUTO for HIGH_CARD with +10 chips, +1 mult', () => {
      expect(PLANET_UPGRADES.PLUTO).toEqual({
        handType: HandType.HIGH_CARD,
        chips: 10,
        mult: 1
      });
    });

    it('should have MERCURY for PAIR with +15 chips, +1 mult', () => {
      expect(PLANET_UPGRADES.MERCURY).toEqual({
        handType: HandType.PAIR,
        chips: 15,
        mult: 1
      });
    });

    it('should have URANUS for TWO_PAIR with +20 chips, +1 mult', () => {
      expect(PLANET_UPGRADES.URANUS).toEqual({
        handType: HandType.TWO_PAIR,
        chips: 20,
        mult: 1
      });
    });

    it('should have VENUS for THREE_OF_A_KIND with +20 chips, +2 mult', () => {
      expect(PLANET_UPGRADES.VENUS).toEqual({
        handType: HandType.THREE_OF_A_KIND,
        chips: 20,
        mult: 2
      });
    });

    it('should have SATURN for STRAIGHT with +30 chips, +3 mult', () => {
      expect(PLANET_UPGRADES.SATURN).toEqual({
        handType: HandType.STRAIGHT,
        chips: 30,
        mult: 3
      });
    });

    it('should have JUPITER for FLUSH with +15 chips, +2 mult', () => {
      expect(PLANET_UPGRADES.JUPITER).toEqual({
        handType: HandType.FLUSH,
        chips: 15,
        mult: 2
      });
    });

    it('should have EARTH for FULL_HOUSE with +25 chips, +2 mult', () => {
      expect(PLANET_UPGRADES.EARTH).toEqual({
        handType: HandType.FULL_HOUSE,
        chips: 25,
        mult: 2
      });
    });

    it('should have MARS for FOUR_OF_A_KIND with +30 chips, +3 mult', () => {
      expect(PLANET_UPGRADES.MARS).toEqual({
        handType: HandType.FOUR_OF_A_KIND,
        chips: 30,
        mult: 3
      });
    });

    it('should have NEPTUNE for STRAIGHT_FLUSH with +40 chips, +4 mult', () => {
      expect(PLANET_UPGRADES.NEPTUNE).toEqual({
        handType: HandType.STRAIGHT_FLUSH,
        chips: 40,
        mult: 4
      });
    });

    it('should have all planet upgrades with correct hand types', () => {
      expect(PLANET_UPGRADES.PLUTO.handType).toBe(HandType.HIGH_CARD);
      expect(PLANET_UPGRADES.MERCURY.handType).toBe(HandType.PAIR);
      expect(PLANET_UPGRADES.URANUS.handType).toBe(HandType.TWO_PAIR);
      expect(PLANET_UPGRADES.VENUS.handType).toBe(HandType.THREE_OF_A_KIND);
      expect(PLANET_UPGRADES.SATURN.handType).toBe(HandType.STRAIGHT);
      expect(PLANET_UPGRADES.JUPITER.handType).toBe(HandType.FLUSH);
      expect(PLANET_UPGRADES.EARTH.handType).toBe(HandType.FULL_HOUSE);
      expect(PLANET_UPGRADES.MARS.handType).toBe(HandType.FOUR_OF_A_KIND);
      expect(PLANET_UPGRADES.NEPTUNE.handType).toBe(HandType.STRAIGHT_FLUSH);
    });

    it('should have all planet upgrades with positive values', () => {
      Object.values(PLANET_UPGRADES).forEach(upgrade => {
        expect(upgrade.chips).toBeGreaterThan(0);
        expect(upgrade.mult).toBeGreaterThan(0);
      });
    });
  });

  // ============================================================================
  // DIFFICULTY_CONFIG TESTS
  // ============================================================================
  describe('DIFFICULTY_CONFIG', () => {
    it('should have BASE_GOAL = 300', () => {
      expect(DIFFICULTY_CONFIG.BASE_GOAL).toBe(300);
    });

    it('should have GROWTH_RATE = 1.5', () => {
      expect(DIFFICULTY_CONFIG.GROWTH_RATE).toBe(1.5);
    });

    it('should have ROUND_BASE_VALUES array with 8 elements', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES).toHaveLength(8);
    });

    it('should have ROUND_BASE_VALUES[0] = 300 (round 1)', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[0]).toBe(300);
    });

    it('should have ROUND_BASE_VALUES[1] = 800 (round 2)', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[1]).toBe(800);
    });

    it('should have ROUND_BASE_VALUES[2] = 2000 (round 3)', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[2]).toBe(2000);
    });

    it('should have ROUND_BASE_VALUES[3] = 5000 (round 4)', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[3]).toBe(5000);
    });

    it('should have ROUND_BASE_VALUES[4] = 11000 (round 5)', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[4]).toBe(11000);
    });

    it('should have ROUND_BASE_VALUES[5] = 20000 (round 6)', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[5]).toBe(20000);
    });

    it('should have ROUND_BASE_VALUES[6] = 35000 (round 7)', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[6]).toBe(35000);
    });

    it('should have ROUND_BASE_VALUES[7] = 50000 (round 8)', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[7]).toBe(50000);
    });

    it('should have exact Balatro progression values', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES).toEqual([
        300,    // Round 1
        800,    // Round 2
        2000,   // Round 3
        5000,   // Round 4
        11000,  // Round 5
        20000,  // Round 6
        35000,  // Round 7
        50000   // Round 8
      ]);
    });

    it('should have SMALL_BLIND_MULTIPLIER = 1.0', () => {
      expect(DIFFICULTY_CONFIG.SMALL_BLIND_MULTIPLIER).toBe(1.0);
    });

    it('should have BIG_BLIND_MULTIPLIER = 1.5', () => {
      expect(DIFFICULTY_CONFIG.BIG_BLIND_MULTIPLIER).toBe(1.5);
    });

    it('should have BOSS_BLIND_MULTIPLIER = 2.0', () => {
      expect(DIFFICULTY_CONFIG.BOSS_BLIND_MULTIPLIER).toBe(2.0);
    });

    it('should have strictly increasing ROUND_BASE_VALUES', () => {
      const values = DIFFICULTY_CONFIG.ROUND_BASE_VALUES;
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  // ============================================================================
  // ANIMATION_TIMING TESTS
  // ============================================================================
  describe('ANIMATION_TIMING', () => {
    it('should have CARD_DEAL_DELAY = 50', () => {
      expect(ANIMATION_TIMING.CARD_DEAL_DELAY).toBe(50);
    });

    it('should have CARD_TRANSITION = 200', () => {
      expect(ANIMATION_TIMING.CARD_TRANSITION).toBe(200);
    });

    it('should have SCORE_INCREMENT = 400', () => {
      expect(ANIMATION_TIMING.SCORE_INCREMENT).toBe(400);
    });

    it('should have SHOP_TRANSITION = 300', () => {
      expect(ANIMATION_TIMING.SHOP_TRANSITION).toBe(300);
    });

    it('should have all values as positive numbers', () => {
      expect(ANIMATION_TIMING.CARD_DEAL_DELAY).toBeGreaterThan(0);
      expect(ANIMATION_TIMING.CARD_TRANSITION).toBeGreaterThan(0);
      expect(ANIMATION_TIMING.SCORE_INCREMENT).toBeGreaterThan(0);
      expect(ANIMATION_TIMING.SHOP_TRANSITION).toBeGreaterThan(0);
    });

    it('should have reasonable animation durations (< 1000ms)', () => {
      expect(ANIMATION_TIMING.CARD_DEAL_DELAY).toBeLessThan(1000);
      expect(ANIMATION_TIMING.CARD_TRANSITION).toBeLessThan(1000);
      expect(ANIMATION_TIMING.SCORE_INCREMENT).toBeLessThan(1000);
      expect(ANIMATION_TIMING.SHOP_TRANSITION).toBeLessThan(1000);
    });
  });

  // ============================================================================
  // STORAGE_KEYS TESTS
  // ============================================================================
  describe('STORAGE_KEYS', () => {
    it('should have GAME_SAVE = "miniBalatro_save"', () => {
      expect(STORAGE_KEYS.GAME_SAVE).toBe('miniBalatro_save');
    });

    it('should have SETTINGS = "miniBalatro_settings"', () => {
      expect(STORAGE_KEYS.SETTINGS).toBe('miniBalatro_settings');
    });

    it('should have STATISTICS = "miniBalatro_stats"', () => {
      expect(STORAGE_KEYS.STATISTICS).toBe('miniBalatro_stats');
    });

    it('should have all keys as non-empty strings', () => {
      expect(STORAGE_KEYS.GAME_SAVE).toBeDefined();
      expect(STORAGE_KEYS.GAME_SAVE.length).toBeGreaterThan(0);
      expect(STORAGE_KEYS.SETTINGS).toBeDefined();
      expect(STORAGE_KEYS.SETTINGS.length).toBeGreaterThan(0);
      expect(STORAGE_KEYS.STATISTICS).toBeDefined();
      expect(STORAGE_KEYS.STATISTICS.length).toBeGreaterThan(0);
    });

    it('should have all keys as unique strings', () => {
      const keys = [
        STORAGE_KEYS.GAME_SAVE,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.STATISTICS
      ];
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  // ============================================================================
  // UI_CONFIG TESTS
  // ============================================================================
  describe('UI_CONFIG', () => {
    it('should have MIN_SCREEN_WIDTH = 1024', () => {
      expect(UI_CONFIG.MIN_SCREEN_WIDTH).toBe(1024);
    });

    it('should have MIN_SCREEN_HEIGHT = 768', () => {
      expect(UI_CONFIG.MIN_SCREEN_HEIGHT).toBe(768);
    });

    it('should have CARD_WIDTH = 100', () => {
      expect(UI_CONFIG.CARD_WIDTH).toBe(100);
    });

    it('should have CARD_HEIGHT = 140', () => {
      expect(UI_CONFIG.CARD_HEIGHT).toBe(140);
    });

    it('should have CARD_BORDER_RADIUS = 8', () => {
      expect(UI_CONFIG.CARD_BORDER_RADIUS).toBe(8);
    });

    it('should have all pixel values as positive numbers', () => {
      expect(UI_CONFIG.MIN_SCREEN_WIDTH).toBeGreaterThan(0);
      expect(UI_CONFIG.MIN_SCREEN_HEIGHT).toBeGreaterThan(0);
      expect(UI_CONFIG.CARD_WIDTH).toBeGreaterThan(0);
      expect(UI_CONFIG.CARD_HEIGHT).toBeGreaterThan(0);
      expect(UI_CONFIG.CARD_BORDER_RADIUS).toBeGreaterThan(0);
    });

    it('should have CARD_HEIGHT / CARD_WIDTH ≈ 1.4 (aspect ratio)', () => {
      const aspectRatio = UI_CONFIG.CARD_HEIGHT / UI_CONFIG.CARD_WIDTH;
      expect(aspectRatio).toBeCloseTo(1.4, 0.1);
    });
  });

  // ============================================================================
  // LOGICAL CONSISTENCY TESTS
  // ============================================================================
  describe('Logical Consistency', () => {
    it('should have card aspect ratio matching height/width', () => {
      const calculatedRatio = UI_CONFIG.CARD_HEIGHT / UI_CONFIG.CARD_WIDTH;
      // Expected ratio is approximately 1.4 (140/100)
      expect(calculatedRatio).toBeCloseTo(1.4, 0.01);
    });

    it('should have base hand values matching Balatro specification', () => {
      // Verify HIGH_CARD base values
      expect(BASE_HAND_VALUES.HIGH_CARD.chips).toBe(5);
      expect(BASE_HAND_VALUES.HIGH_CARD.mult).toBe(1);

      // Verify PAIR base values
      expect(BASE_HAND_VALUES.PAIR.chips).toBe(10);
      expect(BASE_HAND_VALUES.PAIR.mult).toBe(2);

      // Verify STRAIGHT_FLUSH base values
      expect(BASE_HAND_VALUES.STRAIGHT_FLUSH.chips).toBe(100);
      expect(BASE_HAND_VALUES.STRAIGHT_FLUSH.mult).toBe(8);
    });

    it('should have planet upgrades matching specification table', () => {
      // Verify Pluto (High Card)
      expect(PLANET_UPGRADES.PLUTO.handType).toBe(HandType.HIGH_CARD);
      expect(PLANET_UPGRADES.PLUTO.chips).toBe(10);
      expect(PLANET_UPGRADES.PLUTO.mult).toBe(1);

      // Verify Neptune (Straight Flush)
      expect(PLANET_UPGRADES.NEPTUNE.handType).toBe(HandType.STRAIGHT_FLUSH);
      expect(PLANET_UPGRADES.NEPTUNE.chips).toBe(40);
      expect(PLANET_UPGRADES.NEPTUNE.mult).toBe(4);
    });

    it('should have difficulty progression matching Balatro official values', () => {
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES).toEqual([
        300, 800, 2000, 5000, 11000, 20000, 35000, 50000
      ]);
    });

    it('should have shop distribution weights summing to 1.0', () => {
      const total = SHOP_CONFIG.JOKER_WEIGHT +
                   SHOP_CONFIG.PLANET_WEIGHT +
                   SHOP_CONFIG.TAROT_WEIGHT;
      expect(total).toBeCloseTo(1.0, 0.001);
    });

    it('should have blind rewards in correct progression', () => {
      expect(BLIND_REWARDS.SMALL_BLIND).toBe(2);
      expect(BLIND_REWARDS.BIG_BLIND).toBe(5);
      expect(BLIND_REWARDS.BOSS_BLIND).toBe(10);
      expect(BLIND_REWARDS.SMALL_BLIND * 2.5).toBe(BLIND_REWARDS.BIG_BLIND);
      expect(BLIND_REWARDS.BIG_BLIND * 2).toBe(BLIND_REWARDS.BOSS_BLIND);
    });
  });

  // ============================================================================
  // IMMUTABILITY TESTS
  // ============================================================================
  describe('Immutability', () => {
    it('should not allow modification of GAME_CONFIG', () => {
      const originalValue = GAME_CONFIG.INITIAL_MONEY;
      try {
        // @ts-expect-error Testing immutability
        GAME_CONFIG.INITIAL_MONEY = 100;
      } catch (e) {
        // Expected in strict mode
      }
      expect(GAME_CONFIG.INITIAL_MONEY).toBe(originalValue);
    });

    it('should not allow modification of COLORS', () => {
      const originalColor = COLORS.ACCENT;
      try {
        // @ts-expect-error Testing immutability
        COLORS.ACCENT = '#000000';
      } catch (e) {
        // Expected in strict mode
      }
      expect(COLORS.ACCENT).toBe(originalColor);
    });

    it('should maintain consistent values across imports', () => {
      // Verify values remain consistent with initial tests
      expect(GAME_CONFIG.INITIAL_MONEY).toBe(5);
      expect(COLORS.ACCENT).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(DIFFICULTY_CONFIG.ROUND_BASE_VALUES[0]).toBe(300);
    });
  });

  // ============================================================================
  // MODULE EXPORT TESTS
  // ============================================================================
  describe('Module Export', () => {
    it('should export all expected constant objects', () => {
      expect(GAME_CONFIG).toBeDefined();
      expect(SHOP_CONFIG).toBeDefined();
      expect(TAROT_CONFIG).toBeDefined();
      expect(BLIND_REWARDS).toBeDefined();
      expect(COLORS).toBeDefined();
      expect(SUIT_SYMBOLS).toBeDefined();
      expect(CARD_VALUE_DISPLAY).toBeDefined();
      expect(BASE_CARD_VALUES).toBeDefined();
      expect(BASE_HAND_VALUES).toBeDefined();
      expect(PLANET_UPGRADES).toBeDefined();
      expect(DIFFICULTY_CONFIG).toBeDefined();
      expect(ANIMATION_TIMING).toBeDefined();
      expect(STORAGE_KEYS).toBeDefined();
      expect(UI_CONFIG).toBeDefined();
    });

    it('should have all constant objects as plain objects', () => {
      expect(typeof GAME_CONFIG).toBe('object');
      expect(typeof COLORS).toBe('object');
      expect(typeof BASE_HAND_VALUES).toBe('object');
    });
  });
});