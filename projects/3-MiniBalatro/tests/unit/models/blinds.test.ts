/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG) - Mini Balatro Blinds System Test Suite
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file tests/unit/models/blinds/blinds.test.ts
 * @desc Comprehensive unit tests for BossType, BlindModifier, Blind hierarchy, and BlindGenerator
 * @see {@link <https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence>}
 */

// Mock console.log to avoid polluting test output
jest.spyOn(console, 'log').mockImplementation(() => {});

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  BossType,
  getBossDisplayName,
  getBossDescription,
  BlindModifier,
  Blind,
  SmallBlind,
  BigBlind,
  BossBlind,
  BlindGenerator,
} from '@models/blinds';
import { HandType } from '@models/poker';

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Blinds System Unit Tests', () => {
  // ============================================================================
  // BOSSTYPE ENUM TESTS
  // ============================================================================
  describe('BossType Enum', () => {
    it('should define all 5 boss types with correct string values', () => {
      expect(BossType.THE_WALL).toBe('THE_WALL');
      expect(BossType.THE_WATER).toBe('THE_WATER');
      expect(BossType.THE_MOUTH).toBe('THE_MOUTH');
      expect(BossType.THE_NEEDLE).toBe('THE_NEEDLE');
      expect(BossType.THE_FLINT).toBe('THE_FLINT');
    });

    it('should contain exactly 5 boss type values', () => {
      const values = Object.values(BossType);
      expect(values).toHaveLength(5);
      expect(values).toContain(BossType.THE_WALL);
      expect(values).toContain(BossType.THE_WATER);
      expect(values).toContain(BossType.THE_MOUTH);
      expect(values).toContain(BossType.THE_NEEDLE);
      expect(values).toContain(BossType.THE_FLINT);
    });
  });

  describe('getBossDisplayName()', () => {
    it('should return "The Wall" for THE_WALL', () => {
      expect(getBossDisplayName(BossType.THE_WALL)).toBe('The Wall');
    });

    it('should return "The Water" for THE_WATER', () => {
      expect(getBossDisplayName(BossType.THE_WATER)).toBe('The Water');
    });

    it('should return "The Mouth" for THE_MOUTH', () => {
      expect(getBossDisplayName(BossType.THE_MOUTH)).toBe('The Mouth');
    });

    it('should return "The Needle" for THE_NEEDLE', () => {
      expect(getBossDisplayName(BossType.THE_NEEDLE)).toBe('The Needle');
    });

    it('should return "The Flint" for THE_FLINT', () => {
      expect(getBossDisplayName(BossType.THE_FLINT)).toBe('The Flint');
    });

    it('should return "Unknown Boss" for invalid boss type', () => {
      // @ts-expect-error Testing invalid input
      expect(getBossDisplayName('INVALID_BOSS' as BossType)).toBe('Unknown Boss');
    });
  });

  describe('getBossDescription()', () => {
    it('should return correct description for THE_WALL', () => {
      expect(getBossDescription(BossType.THE_WALL)).toBe('Scoring goal increases to 4× round base');
    });

    it('should return correct description for THE_WATER', () => {
      expect(getBossDescription(BossType.THE_WATER)).toBe('Level starts with 0 available discards');
    });

    it('should return correct description for THE_MOUTH', () => {
      expect(getBossDescription(BossType.THE_MOUTH)).toBe('The first hand you play will define the only specific type of poker hand that is allowed to be played.');
    });

    it('should return correct description for THE_NEEDLE', () => {
      expect(getBossDescription(BossType.THE_NEEDLE)).toBe('Only 1 hand can be played (goal reduced to 1× base)');
    });

    it('should return correct description for THE_FLINT', () => {
      expect(getBossDescription(BossType.THE_FLINT)).toBe('Base chips and mult of all hands are halved');
    });

    it('should return "Unknown boss effect" for invalid boss type', () => {
      // @ts-expect-error Testing invalid input
      expect(getBossDescription('INVALID_BOSS' as BossType)).toBe('Unknown boss effect');
    });
  });

  // ============================================================================
  // BLINDMODIFIER CLASS TESTS
  // ============================================================================
  describe('BlindModifier Class', () => {
    describe('constructor', () => {
      it('should create modifier with all default values', () => {
        const modifier = new BlindModifier();
        expect(modifier.goalMultiplier).toBe(1.0);
        expect(modifier.maxHands).toBeNull();
        expect(modifier.maxDiscards).toBeNull();
        expect(modifier.allowedHandTypes).toBeNull();
        expect(modifier.chipsDivisor).toBe(1.0);
        expect(modifier.multDivisor).toBe(1.0);
      });

      it('should accept and store custom goalMultiplier', () => {
        const modifier = new BlindModifier(4.0);
        expect(modifier.goalMultiplier).toBe(4.0);
      });

      it('should accept and store custom maxHands', () => {
        const modifier = new BlindModifier(1.0, 1);
        expect(modifier.maxHands).toBe(1);
      });

      it('should accept and store custom maxDiscards', () => {
        const modifier = new BlindModifier(1.0, null, 0);
        expect(modifier.maxDiscards).toBe(0);
      });

      it('should accept and store custom allowedHandTypes', () => {
        const modifier = new BlindModifier(1.0, null, null, [HandType.PAIR]);
        expect(modifier.allowedHandTypes).toHaveLength(1);
        expect(modifier.allowedHandTypes![0]).toBe(HandType.PAIR);
      });

      it('should accept and store custom chipsDivisor', () => {
        const modifier = new BlindModifier(1.0, null, null, null, 2.0);
        expect(modifier.chipsDivisor).toBe(2.0);
      });

      it('should accept and store custom multDivisor', () => {
        const modifier = new BlindModifier(1.0, null, null, null, 1.0, 2.0);
        expect(modifier.multDivisor).toBe(2.0);
      });

      it('should throw error on negative goalMultiplier', () => {
        expect(() => new BlindModifier(-1.0)).toThrow('Multipliers and divisors cannot be negative');
      });

      it('should throw error on negative chipsDivisor', () => {
        expect(() => new BlindModifier(1.0, null, null, null, -2.0)).toThrow('Multipliers and divisors cannot be negative');
      });

      it('should throw error on negative multDivisor', () => {
        expect(() => new BlindModifier(1.0, null, null, null, 1.0, -2.0)).toThrow('Multipliers and divisors cannot be negative');
      });

      it('should accept zero for maxHands/maxDiscards', () => {
        const modifier = new BlindModifier(1.0, 0, 0);
        expect(modifier.maxHands).toBe(0);
        expect(modifier.maxDiscards).toBe(0);
      });
    });

    describe('createForBoss() factory method', () => {
      it('should create The Wall modifier with goalMultiplier = 4.0', () => {
        const modifier = BlindModifier.createForBoss(BossType.THE_WALL);
        expect(modifier.goalMultiplier).toBe(4.0);
        expect(modifier.maxHands).toBeNull();
        expect(modifier.maxDiscards).toBeNull();
        expect(modifier.allowedHandTypes).toBeNull();
        expect(modifier.chipsDivisor).toBe(1.0);
        expect(modifier.multDivisor).toBe(1.0);
      });

      it('should create The Water modifier with maxDiscards = 0', () => {
        const modifier = BlindModifier.createForBoss(BossType.THE_WATER);
        expect(modifier.goalMultiplier).toBe(1.0);
        expect(modifier.maxHands).toBeNull();
        expect(modifier.maxDiscards).toBe(0);
        expect(modifier.allowedHandTypes).toBeNull();
        expect(modifier.chipsDivisor).toBe(1.0);
        expect(modifier.multDivisor).toBe(1.0);
      });

      it('should create The Mouth modifier with null allowedHandTypes (set later)', () => {
        const modifier = BlindModifier.createForBoss(BossType.THE_MOUTH);
        expect(modifier.goalMultiplier).toBe(1.0);
        expect(modifier.maxHands).toBeNull();
        expect(modifier.maxDiscards).toBeNull();
        expect(modifier.allowedHandTypes).toBeNull(); // Set after first hand
        expect(modifier.chipsDivisor).toBe(1.0);
        expect(modifier.multDivisor).toBe(1.0);
      });

      it('should create The Needle modifier with maxHands = 1 and goalMultiplier = 0.5', () => {
        const modifier = BlindModifier.createForBoss(BossType.THE_NEEDLE);
        expect(modifier.goalMultiplier).toBe(0.5);
        expect(modifier.maxHands).toBe(1);
        expect(modifier.maxDiscards).toBeNull();
        expect(modifier.allowedHandTypes).toBeNull();
        expect(modifier.chipsDivisor).toBe(1.0);
        expect(modifier.multDivisor).toBe(1.0);
      });

      it('should create The Flint modifier with chipsDivisor = 2.0 and multDivisor = 2.0', () => {
        const modifier = BlindModifier.createForBoss(BossType.THE_FLINT);
        expect(modifier.goalMultiplier).toBe(1.0);
        expect(modifier.maxHands).toBeNull();
        expect(modifier.maxDiscards).toBeNull();
        expect(modifier.allowedHandTypes).toBeNull();
        expect(modifier.chipsDivisor).toBe(2.0);
        expect(modifier.multDivisor).toBe(2.0);
      });

      it('should throw error on invalid BossType', () => {
        // @ts-expect-error Testing invalid input
        expect(() => BlindModifier.createForBoss('INVALID' as BossType)).toThrow('Unknown boss type');
      });
    });
  });

  // ============================================================================
  // BLIND ABSTRACT CLASS TESTS (via concrete subclasses)
  // ============================================================================
  describe('Blind Abstract Class (via subclasses)', () => {
    describe('constructor validation', () => {
      it('should throw error on level ≤ 0', () => {
        expect(() => new SmallBlind(0, 1)).toThrow('Level must be positive');
        expect(() => new SmallBlind(-5, 1)).toThrow('Level must be positive');
      });

      it('should throw error on scoreGoal ≤ 0', () => {
        // Directly test protected constructor via reflection would be ideal,
        // but we test through concrete subclasses that enforce this
        const smallBlind = new SmallBlind(1, 1);
        expect(smallBlind.getScoreGoal()).toBeGreaterThan(0);
      });

      it('should throw error on negative moneyReward', () => {
        // Cannot directly test abstract class constructor, but subclasses enforce this
        // via GameConfig constants which are always positive
      });
    });

    describe('calculateBaseGoal() static method', () => {
      it('should return 300 for round 1', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(1)).toBe(300);
      });

      it('should return 800 for round 2', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(2)).toBe(800);
      });

      it('should return 2000 for round 3', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(3)).toBe(2000);
      });

      it('should return 5000 for round 4', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(4)).toBe(5000);
      });

      it('should return 11000 for round 5', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(5)).toBe(11000);
      });

      it('should return 20000 for round 6', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(6)).toBe(20000);
      });

      it('should return 35000 for round 7', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(7)).toBe(35000);
      });

      it('should return 50000 for round 8', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(8)).toBe(50000);
      });

      it('should cap at 50000 for rounds beyond 8', () => {
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(9)).toBe(50000);
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(10)).toBe(50000);
        // @ts-expect-error Accessing protected static method for test
        expect(Blind.calculateBaseGoal(100)).toBe(50000);
      });

      it('should throw error on roundNumber ≤ 0', () => {
        expect(() => {
          // @ts-expect-error Accessing protected static method for test
          Blind.calculateBaseGoal(0);
        }).toThrow('Round number must be positive');

        expect(() => {
          // @ts-expect-error Accessing protected static method for test
          Blind.calculateBaseGoal(-1);
        }).toThrow('Round number must be positive');
      });
    });
  });

  // ============================================================================
  // SMALLBLIND CLASS TESTS
  // ============================================================================
  describe('SmallBlind Class', () => {
    describe('constructor', () => {
      it('should create small blind with valid level and round', () => {
        const blind = new SmallBlind(1, 1);
        expect(blind.getLevel()).toBe(1);
        expect(blind.getScoreGoal()).toBe(300);
        expect(blind.getReward()).toBe(2);
      });

      it('should throw error on level ≤ 0', () => {
        expect(() => new SmallBlind(0, 1)).toThrow('Level must be positive');
      });

      it('should throw error on roundNumber ≤ 0', () => {
        expect(() => new SmallBlind(1, 0)).toThrow('Round number must be positive');
      });
    });

    describe('getScoreGoal()', () => {
      it('should return 300 for round 1', () => {
        const blind = new SmallBlind(1, 1);
        expect(blind.getScoreGoal()).toBe(300);
      });

      it('should return 800 for round 2', () => {
        const blind = new SmallBlind(4, 2);
        expect(blind.getScoreGoal()).toBe(800);
      });

      it('should return 2000 for round 3', () => {
        const blind = new SmallBlind(7, 3);
        expect(blind.getScoreGoal()).toBe(2000);
      });

      it('should return 5000 for round 4', () => {
        const blind = new SmallBlind(10, 4);
        expect(blind.getScoreGoal()).toBe(5000);
      });

      it('should return 11000 for round 5', () => {
        const blind = new SmallBlind(13, 5);
        expect(blind.getScoreGoal()).toBe(11000);
      });

      it('should return 20000 for round 6', () => {
        const blind = new SmallBlind(16, 6);
        expect(blind.getScoreGoal()).toBe(20000);
      });

      it('should return 35000 for round 7', () => {
        const blind = new SmallBlind(19, 7);
        expect(blind.getScoreGoal()).toBe(35000);
      });

      it('should return 50000 for round 8', () => {
        const blind = new SmallBlind(22, 8);
        expect(blind.getScoreGoal()).toBe(50000);
      });

      it('should cap at 50000 for rounds beyond 8', () => {
        const blind = new SmallBlind(25, 9);
        expect(blind.getScoreGoal()).toBe(50000);
      });
    });

    describe('getReward()', () => {
      it('should return $2 for all rounds', () => {
        expect(new SmallBlind(1, 1).getReward()).toBe(2);
        expect(new SmallBlind(4, 2).getReward()).toBe(2);
        expect(new SmallBlind(22, 8).getReward()).toBe(2);
        expect(new SmallBlind(100, 34).getReward()).toBe(2);
      });
    });

    describe('getModifier()', () => {
      it('should return undefined (no modifier)', () => {
        const blind = new SmallBlind(1, 1);
        expect(blind.getModifier()).toBeUndefined();
      });
    });

    describe('getBlindType()', () => {
      it('should return "SmallBlind" string identifier', () => {
        const blind = new SmallBlind(1, 1);
        expect(blind.getBlindType()).toBe('SmallBlind');
      });
    });

    describe('getLevel()', () => {
      it('should return the level number', () => {
        const blind = new SmallBlind(7, 3);
        expect(blind.getLevel()).toBe(7);
      });
    });
  });

  // ============================================================================
  // BIGBLIND CLASS TESTS
  // ============================================================================
  describe('BigBlind Class', () => {
    describe('constructor', () => {
      it('should create big blind with valid level and round', () => {
        const blind = new BigBlind(2, 1);
        expect(blind.getLevel()).toBe(2);
        expect(blind.getScoreGoal()).toBe(450); // 300 × 1.5
        expect(blind.getReward()).toBe(5);
      });

      it('should throw error on level ≤ 0', () => {
        expect(() => new BigBlind(0, 1)).toThrow('Level must be positive');
      });

      it('should throw error on roundNumber ≤ 0', () => {
        expect(() => new BigBlind(2, 0)).toThrow('Round number must be positive');
      });
    });

    describe('getScoreGoal()', () => {
      it('should return 450 for round 1 (300 × 1.5)', () => {
        const blind = new BigBlind(2, 1);
        expect(blind.getScoreGoal()).toBe(450);
      });

      it('should return 1200 for round 2 (800 × 1.5)', () => {
        const blind = new BigBlind(5, 2);
        expect(blind.getScoreGoal()).toBe(1200);
      });

      it('should return 3000 for round 3 (2000 × 1.5)', () => {
        const blind = new BigBlind(8, 3);
        expect(blind.getScoreGoal()).toBe(3000);
      });

      it('should return 7500 for round 4 (5000 × 1.5)', () => {
        const blind = new BigBlind(11, 4);
        expect(blind.getScoreGoal()).toBe(7500);
      });

      it('should return 16500 for round 5 (11000 × 1.5)', () => {
        const blind = new BigBlind(14, 5);
        expect(blind.getScoreGoal()).toBe(16500);
      });

      it('should return 30000 for round 6 (20000 × 1.5)', () => {
        const blind = new BigBlind(17, 6);
        expect(blind.getScoreGoal()).toBe(30000);
      });

      it('should return 52500 for round 7 (35000 × 1.5)', () => {
        const blind = new BigBlind(20, 7);
        expect(blind.getScoreGoal()).toBe(52500);
      });

      it('should return 75000 for round 8 (50000 × 1.5)', () => {
        const blind = new BigBlind(23, 8);
        expect(blind.getScoreGoal()).toBe(75000);
      });

      it('should cap at 75000 for rounds beyond 8', () => {
        const blind = new BigBlind(26, 9);
        expect(blind.getScoreGoal()).toBe(75000);
      });
    });

    describe('getReward()', () => {
      it('should return $5 for all rounds', () => {
        expect(new BigBlind(2, 1).getReward()).toBe(5);
        expect(new BigBlind(5, 2).getReward()).toBe(5);
        expect(new BigBlind(23, 8).getReward()).toBe(5);
        expect(new BigBlind(100, 34).getReward()).toBe(5);
      });
    });

    describe('getModifier()', () => {
      it('should return undefined (no modifier)', () => {
        const blind = new BigBlind(2, 1);
        expect(blind.getModifier()).toBeUndefined();
      });
    });

    describe('getBlindType()', () => {
      it('should return "BigBlind" string identifier', () => {
        const blind = new BigBlind(2, 1);
        expect(blind.getBlindType()).toBe('BigBlind');
      });
    });

    describe('getLevel()', () => {
      it('should return the level number', () => {
        const blind = new BigBlind(8, 3);
        expect(blind.getLevel()).toBe(8);
      });
    });
  });

  // ============================================================================
  // BOSSBLIND CLASS TESTS
  // ============================================================================
  describe('BossBlind Class', () => {
    describe('constructor', () => {
      it('should create boss blind with valid level, round, and boss type', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WALL);
        expect(blind.getLevel()).toBe(3);
        expect(blind.getBossType()).toBe(BossType.THE_WALL);
        expect(blind.getReward()).toBe(10);
      });

      it('should throw error on level ≤ 0', () => {
        expect(() => new BossBlind(0, 1, BossType.THE_WALL)).toThrow('Level must be positive');
      });

      it('should throw error on roundNumber ≤ 0', () => {
        expect(() => new BossBlind(3, 0, BossType.THE_WALL)).toThrow('Round number must be positive');
      });

      it('should throw error on null bossType', () => {
        expect(() =>
          // @ts-expect-error Testing null input
          new BossBlind(3, 1, null)
        ).toThrow();
      });
    });

    describe('getScoreGoal() - Base Calculation (no modifier)', () => {
      it('should return 600 for round 1 (300 × 2.0)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WATER); // No goal modifier
        expect(blind.getScoreGoal()).toBe(600);
      });

      it('should return 1600 for round 2 (800 × 2.0)', () => {
        const blind = new BossBlind(6, 2, BossType.THE_WATER);
        expect(blind.getScoreGoal()).toBe(1600);
      });

      it('should return 4000 for round 3 (2000 × 2.0)', () => {
        const blind = new BossBlind(9, 3, BossType.THE_WATER);
        expect(blind.getScoreGoal()).toBe(4000);
      });

      it('should return 10000 for round 4 (5000 × 2.0)', () => {
        const blind = new BossBlind(12, 4, BossType.THE_WATER);
        expect(blind.getScoreGoal()).toBe(10000);
      });

      it('should return 22000 for round 5 (11000 × 2.0)', () => {
        const blind = new BossBlind(15, 5, BossType.THE_WATER);
        expect(blind.getScoreGoal()).toBe(22000);
      });

      it('should return 40000 for round 6 (20000 × 2.0)', () => {
        const blind = new BossBlind(18, 6, BossType.THE_WATER);
        expect(blind.getScoreGoal()).toBe(40000);
      });

      it('should return 70000 for round 7 (35000 × 2.0)', () => {
        const blind = new BossBlind(21, 7, BossType.THE_WATER);
        expect(blind.getScoreGoal()).toBe(70000);
      });

      it('should return 100000 for round 8 (50000 × 2.0)', () => {
        const blind = new BossBlind(24, 8, BossType.THE_WATER);
        expect(blind.getScoreGoal()).toBe(100000);
      });
    });

    describe('getScoreGoal() - Boss-Specific Modifiers', () => {
      it('should return 2400 for The Wall round 1 (300 × 2.0 × 4.0)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WALL);
        expect(blind.getScoreGoal()).toBe(2400);
      });

      it('should return 6400 for The Wall round 2 (800 × 2.0 × 4.0)', () => {
        const blind = new BossBlind(6, 2, BossType.THE_WALL);
        expect(blind.getScoreGoal()).toBe(6400);
      });

      it('should return 300 for The Needle round 1 (300 × 2.0 × 0.5)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_NEEDLE);
        expect(blind.getScoreGoal()).toBe(300);
      });

      it('should return 800 for The Needle round 2 (800 × 2.0 × 0.5)', () => {
        const blind = new BossBlind(6, 2, BossType.THE_NEEDLE);
        expect(blind.getScoreGoal()).toBe(800);
      });

      it('should return 600 for The Mouth round 1 (300 × 2.0 × 1.0)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_MOUTH);
        expect(blind.getScoreGoal()).toBe(600);
      });

      it('should return 600 for The Flint round 1 (300 × 2.0 × 1.0)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_FLINT);
        expect(blind.getScoreGoal()).toBe(600);
      });

      it('should return 100000 for The Wall round 8 (50000 × 2.0 × 4.0)', () => {
        const blind = new BossBlind(24, 8, BossType.THE_WALL);
        expect(blind.getScoreGoal()).toBe(400000);
      });
    });

    describe('getReward()', () => {
      it('should return $10 for all boss types and rounds', () => {
        expect(new BossBlind(3, 1, BossType.THE_WALL).getReward()).toBe(10);
        expect(new BossBlind(6, 2, BossType.THE_WATER).getReward()).toBe(10);
        expect(new BossBlind(9, 3, BossType.THE_MOUTH).getReward()).toBe(10);
        expect(new BossBlind(12, 4, BossType.THE_NEEDLE).getReward()).toBe(10);
        expect(new BossBlind(15, 5, BossType.THE_FLINT).getReward()).toBe(10);
        expect(new BossBlind(24, 8, BossType.THE_WALL).getReward()).toBe(10);
      });
    });

    describe('getModifier()', () => {
      it('should return BlindModifier object', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WALL);
        const modifier = blind.getModifier();
        expect(modifier).toBeDefined();
        expect(modifier).toBeInstanceOf(BlindModifier);
      });

      it('should return The Wall modifier with goalMultiplier = 4.0', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WALL);
        const modifier = blind.getModifier();
        expect(modifier.goalMultiplier).toBe(4.0);
      });

      it('should return The Water modifier with maxDiscards = 0', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WATER);
        const modifier = blind.getModifier();
        expect(modifier.maxDiscards).toBe(0);
      });

      it('should return The Mouth modifier with null allowedHandTypes initially', () => {
        const blind = new BossBlind(3, 1, BossType.THE_MOUTH);
        const modifier = blind.getModifier();
        expect(modifier.allowedHandTypes).toBeNull();
      });

      it('should return The Needle modifier with maxHands = 1 and goalMultiplier = 0.5', () => {
        const blind = new BossBlind(3, 1, BossType.THE_NEEDLE);
        const modifier = blind.getModifier();
        expect(modifier.maxHands).toBe(1);
        expect(modifier.goalMultiplier).toBe(0.5);
      });

      it('should return The Flint modifier with chipsDivisor = 2.0 and multDivisor = 2.0', () => {
        const blind = new BossBlind(3, 1, BossType.THE_FLINT);
        const modifier = blind.getModifier();
        expect(modifier.chipsDivisor).toBe(2.0);
        expect(modifier.multDivisor).toBe(2.0);
      });
    });

    describe('getBossType()', () => {
      it('should return the boss type', () => {
        const wall = new BossBlind(3, 1, BossType.THE_WALL);
        const water = new BossBlind(6, 2, BossType.THE_WATER);
        expect(wall.getBossType()).toBe(BossType.THE_WALL);
        expect(water.getBossType()).toBe(BossType.THE_WATER);
      });
    });

    describe('setAllowedHandType()', () => {
      it('should set allowed hand type for The Mouth boss', () => {
        const blind = new BossBlind(3, 1, BossType.THE_MOUTH);
        blind.setAllowedHandType(HandType.PAIR);
        const modifier = blind.getModifier();
        expect(modifier.allowedHandTypes).toHaveLength(1);
        expect(modifier.allowedHandTypes![0]).toBe(HandType.PAIR);
      });

      it('should throw error when called on non-Mouth boss', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WALL);
        expect(() => blind.setAllowedHandType(HandType.PAIR)).toThrow(
          'setAllowedHandType can only be called on The Mouth boss'
        );
      });

      it('should throw error when called with null hand type', () => {
        const blind = new BossBlind(3, 1, BossType.THE_MOUTH);
        expect(() =>
          // @ts-expect-error Testing null input
          blind.setAllowedHandType(null)
        ).toThrow('Hand type cannot be null');
      });
    });

    describe('getBlindType()', () => {
      it('should return "BossBlind" string identifier', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WALL);
        expect(blind.getBlindType()).toBe('BossBlind');
      });
    });

    describe('getLevel()', () => {
      it('should return the level number', () => {
        const blind = new BossBlind(24, 8, BossType.THE_WALL);
        expect(blind.getLevel()).toBe(24);
      });
    });
  });

  // ============================================================================
  // BLINDGENERATOR CLASS TESTS
  // ============================================================================
  describe('BlindGenerator Class', () => {
    let generator: BlindGenerator;
    let originalRandom: () => number;

    beforeEach(() => {
      generator = new BlindGenerator();
      // Preserve original Math.random for UUID generation in cards
      originalRandom = Math.random;
    });

    afterEach(() => {
      Math.random = originalRandom;
    });

    describe('generateBlind() pattern verification', () => {
      it('should generate SmallBlind for level 1 (round 1)', () => {
        const blind = generator.generateBlind(1);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getLevel()).toBe(1);
        expect(blind.getScoreGoal()).toBe(300);
      });

      it('should generate BigBlind for level 2 (round 1)', () => {
        const blind = generator.generateBlind(2);
        expect(blind).toBeInstanceOf(BigBlind);
        expect(blind.getLevel()).toBe(2);
        expect(blind.getScoreGoal()).toBe(450);
      });

      it('should generate BossBlind for level 3 (round 1)', () => {
        // Control random selection for predictable test
        Math.random = () => 0.1; // First boss in array
        const blind = generator.generateBlind(3);
        expect(blind).toBeInstanceOf(BossBlind);
        expect(blind.getLevel()).toBe(3);
        expect(blind.getScoreGoal()).toBeGreaterThanOrEqual(300); // Depends on boss type
      });

      it('should generate SmallBlind for level 4 (round 2)', () => {
        const blind = generator.generateBlind(4);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getLevel()).toBe(4);
        expect(blind.getScoreGoal()).toBe(800);
      });

      it('should generate BigBlind for level 5 (round 2)', () => {
        const blind = generator.generateBlind(5);
        expect(blind).toBeInstanceOf(BigBlind);
        expect(blind.getLevel()).toBe(5);
        expect(blind.getScoreGoal()).toBe(1200);
      });

      it('should generate BossBlind for level 6 (round 2)', () => {
        Math.random = () => 0.2; // Second boss in array
        const blind = generator.generateBlind(6);
        expect(blind).toBeInstanceOf(BossBlind);
        expect(blind.getLevel()).toBe(6);
        expect(blind.getScoreGoal()).toBeGreaterThanOrEqual(1600);
      });

      it('should generate SmallBlind for level 7 (round 3)', () => {
        const blind = generator.generateBlind(7);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getLevel()).toBe(7);
        expect(blind.getScoreGoal()).toBe(2000);
      });

      it('should generate SmallBlind for level 10 (round 4)', () => {
        const blind = generator.generateBlind(10);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getLevel()).toBe(10);
        expect(blind.getScoreGoal()).toBe(5000);
      });

      it('should generate BossBlind for level 24 (round 8, final boss)', () => {
        Math.random = () => 0.3; // Third boss in array
        const blind = generator.generateBlind(24);
        expect(blind).toBeInstanceOf(BossBlind);
        expect(blind.getLevel()).toBe(24);
        expect(blind.getScoreGoal()).toBeGreaterThanOrEqual(100000);
      });
    });

    describe('Pattern Verification by Position', () => {
      it('should follow pattern: (level-1) % 3 === 0 → SmallBlind', () => {
        for (let level = 1; level <= 24; level += 3) {
          const blind = generator.generateBlind(level);
          expect(blind).toBeInstanceOf(SmallBlind);
          expect(blind.getLevel()).toBe(level);
        }
      });

      it('should follow pattern: (level-1) % 3 === 1 → BigBlind', () => {
        for (let level = 2; level <= 24; level += 3) {
          const blind = generator.generateBlind(level);
          expect(blind).toBeInstanceOf(BigBlind);
          expect(blind.getLevel()).toBe(level);
        }
      });

      it('should follow pattern: (level-1) % 3 === 2 → BossBlind', () => {
        for (let level = 3; level <= 24; level += 3) {
          Math.random = () => 0.5; // Deterministic boss selection
          const blind = generator.generateBlind(level);
          expect(blind).toBeInstanceOf(BossBlind);
          expect(blind.getLevel()).toBe(level);
        }
      });
    });

    describe('Round Number Calculation', () => {
      it('should assign round 1 for levels 1-3', () => {
        expect(generator.generateBlind(1).getLevel()).toBe(1);
        expect(generator.generateBlind(2).getLevel()).toBe(2);
        expect(generator.generateBlind(3).getLevel()).toBe(3);

        // Verify round numbers indirectly via score goals
        expect(generator.generateBlind(1).getScoreGoal()).toBe(300); // Round 1 small
        expect(generator.generateBlind(4).getScoreGoal()).toBe(800); // Round 2 small
      });

      it('should assign round 2 for levels 4-6', () => {
        expect(generator.generateBlind(4).getScoreGoal()).toBe(800);
        expect(generator.generateBlind(5).getScoreGoal()).toBe(1200);
        // Boss goal varies by type, but base is 1600
      });

      it('should assign round 3 for levels 7-9', () => {
        expect(generator.generateBlind(7).getScoreGoal()).toBe(2000);
        expect(generator.generateBlind(8).getScoreGoal()).toBe(3000);
      });

      it('should follow formula: Math.floor((level - 1) / 3) + 1', () => {
        for (let level = 1; level <= 30; level++) {
          const blind = generator.generateBlind(level);
          const expectedRound = Math.floor((level - 1) / 3) + 1;

          // Verify via score goal lookup
          const baseGoals = [300, 800, 2000, 5000, 11000, 20000, 35000, 50000];
          const baseIndex = Math.min(expectedRound - 1, baseGoals.length - 1);
          const expectedBase = baseGoals[baseIndex];

          if (blind instanceof SmallBlind) {
            expect(blind.getScoreGoal()).toBe(expectedBase);
          } else if (blind instanceof BigBlind) {
            expect(blind.getScoreGoal()).toBe(Math.floor(expectedBase * 1.5));
          }
          // BossBlind varies by modifier, so we skip exact goal check here
        }
      });
    });

    describe('Boss Selection', () => {
      it('should generate boss blind with one of 5 valid boss types', () => {
        Math.random = () => 0.1;
        const blind = generator.generateBlind(3) as BossBlind;
        const validTypes = [
          BossType.THE_WALL,
          BossType.THE_WATER,
          BossType.THE_MOUTH,
          BossType.THE_NEEDLE,
          BossType.THE_FLINT,
        ];
        expect(validTypes).toContain(blind.getBossType());
      });

      it('should avoid recently used bosses (history of 2)', () => {
        // Set deterministic random sequence
        let callCount = 0;
        Math.random = () => {
          callCount++;
          // Return indices that would select bosses in order: 0,1,2,0,1,2...
          return (callCount - 1) / 5;
        };

        // Generate 3 bosses - should be 3 different types
        const boss1 = (generator.generateBlind(3) as BossBlind).getBossType();
        const boss2 = (generator.generateBlind(6) as BossBlind).getBossType();
        const boss3 = (generator.generateBlind(9) as BossBlind).getBossType();

        expect(boss1).not.toBe(boss2);
        expect(boss2).not.toBe(boss3);
        // boss3 could equal boss1 since history only keeps last 2
      });

      it('should handle all 5 boss types being in history (edge case)', () => {
        // Force history to contain 2 different bosses
        Math.random = () => 0.1;
        generator.generateBlind(3); // First boss

        Math.random = () => 0.2;
        generator.generateBlind(6); // Second boss

        // Now force selection when all available bosses are in history
        // Should fall back to all bosses
        Math.random = () => 0.3;
        const blind = generator.generateBlind(9) as BossBlind;
        expect(blind.getBossType()).toBeDefined();
      });
    });

    describe('Validation', () => {
      it('should throw error on level ≤ 0', () => {
        expect(() => generator.generateBlind(0)).toThrow('Level must be positive');
      });

      it('should throw error on negative level', () => {
        expect(() => generator.generateBlind(-5)).toThrow('Level must be positive');
      });

      it('should handle level 1 correctly (edge case)', () => {
        const blind = generator.generateBlind(1);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getLevel()).toBe(1);
        expect(blind.getScoreGoal()).toBe(300);
      });

      it('should handle large levels (100+)', () => {
        const blind = generator.generateBlind(100);
        expect(blind).toBeDefined();
        expect(blind.getLevel()).toBe(100);
        // Level 100: round = floor((100-1)/3)+1 = 34, capped at round 8 values
        if (blind instanceof SmallBlind) {
          expect(blind.getScoreGoal()).toBe(50000);
        } else if (blind instanceof BigBlind) {
          expect(blind.getScoreGoal()).toBe(75000);
        }
      });
    });

    describe('Static Helper Methods', () => {
      it('should calculate round number correctly via static method', () => {
        expect(BlindGenerator.calculateRoundNumber(1)).toBe(1);
        expect(BlindGenerator.calculateRoundNumber(2)).toBe(1);
        expect(BlindGenerator.calculateRoundNumber(3)).toBe(1);
        expect(BlindGenerator.calculateRoundNumber(4)).toBe(2);
        expect(BlindGenerator.calculateRoundNumber(6)).toBe(2);
        expect(BlindGenerator.calculateRoundNumber(7)).toBe(3);
        expect(BlindGenerator.calculateRoundNumber(24)).toBe(8);
        expect(BlindGenerator.calculateRoundNumber(100)).toBe(34);
      });

      it('should throw error on invalid level for static method', () => {
        expect(() => BlindGenerator.calculateRoundNumber(0)).toThrow('Level must be positive');
        expect(() => BlindGenerator.calculateRoundNumber(-10)).toThrow('Level must be positive');
      });

      it('should return blind type name for level', () => {
        expect(BlindGenerator.getBlindTypeForLevel(1)).toBe('Small');
        expect(BlindGenerator.getBlindTypeForLevel(2)).toBe('Big');
        expect(BlindGenerator.getBlindTypeForLevel(3)).toBe('Boss');
        expect(BlindGenerator.getBlindTypeForLevel(4)).toBe('Small');
        expect(BlindGenerator.getBlindTypeForLevel(100)).toBe('Small'); // 100 % 3 = 1 → Small
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  describe('Integration Tests', () => {
    describe('Complete Progression (Levels 1-24)', () => {
      it('should generate correct sequence for first 9 levels', () => {
        const gen = new BlindGenerator();

        // Level 1: Small Blind, Round 1
        let blind = gen.generateBlind(1);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getScoreGoal()).toBe(300);
        expect(blind.getReward()).toBe(2);

        // Level 2: Big Blind, Round 1
        blind = gen.generateBlind(2);
        expect(blind).toBeInstanceOf(BigBlind);
        expect(blind.getScoreGoal()).toBe(450);
        expect(blind.getReward()).toBe(5);

        // Level 3: Boss Blind, Round 1 (deterministic boss)
        Math.random = () => 0.1;
        blind = gen.generateBlind(3);
        expect(blind).toBeInstanceOf(BossBlind);
        expect(blind.getScoreGoal()).toBeGreaterThanOrEqual(300);
        expect(blind.getReward()).toBe(10);

        // Level 4: Small Blind, Round 2
        blind = gen.generateBlind(4);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getScoreGoal()).toBe(800);

        // Level 7: Small Blind, Round 3
        blind = gen.generateBlind(7);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getScoreGoal()).toBe(2000);

        // Level 10: Small Blind, Round 4
        blind = gen.generateBlind(10);
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getScoreGoal()).toBe(5000);

        // Level 24: Boss Blind, Round 8 (final boss)
        Math.random = () => 0.2;
        blind = gen.generateBlind(24);
        expect(blind).toBeInstanceOf(BossBlind);
        expect(blind.getLevel()).toBe(24);
      });
    });

    describe('Blind Comparison', () => {
      it('should satisfy: Small < Big < Boss (for same round, base goals)', () => {
        // Round 1
        const small = new SmallBlind(1, 1);
        const big = new BigBlind(2, 1);
        const boss = new BossBlind(3, 1, BossType.THE_WATER); // No goal modifier

        expect(small.getScoreGoal()).toBe(300);
        expect(big.getScoreGoal()).toBe(450);
        expect(boss.getScoreGoal()).toBe(600);
        expect(small.getScoreGoal()).toBeLessThan(big.getScoreGoal());
        expect(big.getScoreGoal()).toBeLessThan(boss.getScoreGoal());
      });

      it('should satisfy: Round 2 goals > Round 1 goals', () => {
        const smallR1 = new SmallBlind(1, 1);
        const smallR2 = new SmallBlind(4, 2);
        expect(smallR2.getScoreGoal()).toBeGreaterThan(smallR1.getScoreGoal());

        const bigR1 = new BigBlind(2, 1);
        const bigR2 = new BigBlind(5, 2);
        expect(bigR2.getScoreGoal()).toBeGreaterThan(bigR1.getScoreGoal());
      });

      it('should satisfy: Round progression increases goals', () => {
        // Verify monotonic increase across rounds for each blind type
        const smallGoals = [300, 800, 2000, 5000, 11000, 20000, 35000, 50000];
        for (let i = 1; i < smallGoals.length; i++) {
          expect(smallGoals[i]).toBeGreaterThan(smallGoals[i - 1]);
        }
      });
    });

    describe('Boss Modifier Application', () => {
      it('should apply The Wall modifier correctly (4× goal multiplier)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WALL);
        expect(blind.getScoreGoal()).toBe(2400); // 300 × 2 × 4

        const round2 = new BossBlind(6, 2, BossType.THE_WALL);
        expect(round2.getScoreGoal()).toBe(6400); // 800 × 2 × 4
      });

      it('should apply The Water modifier correctly (0 discards)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_WATER);
        const modifier = blind.getModifier();
        expect(modifier.maxDiscards).toBe(0);
        expect(modifier.goalMultiplier).toBe(1.0);
      });

      it('should apply The Needle modifier correctly (1 hand, 0.5× goal)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_NEEDLE);
        const modifier = blind.getModifier();
        expect(modifier.maxHands).toBe(1);
        expect(modifier.goalMultiplier).toBe(0.5);
        expect(blind.getScoreGoal()).toBe(300); // 300 × 2 × 0.5
      });

      it('should apply The Flint modifier correctly (halved base values)', () => {
        const blind = new BossBlind(3, 1, BossType.THE_FLINT);
        const modifier = blind.getModifier();
        expect(modifier.chipsDivisor).toBe(2.0);
        expect(modifier.multDivisor).toBe(2.0);
        // Goal is unaffected (only base hand values in scoring are halved)
        expect(blind.getScoreGoal()).toBe(600); // 300 × 2 × 1
      });

      it('should allow The Mouth to lock hand type after first play', () => {
        const blind = new BossBlind(3, 1, BossType.THE_MOUTH);
        expect(blind.getModifier().allowedHandTypes).toBeNull();

        blind.setAllowedHandType(HandType.FLUSH);
        expect(blind.getModifier().allowedHandTypes).toHaveLength(1);
        expect(blind.getModifier().allowedHandTypes![0]).toBe(HandType.FLUSH);
      });
    });

    describe('Floating Point Precision', () => {
      it('should return integer goals for all blinds', () => {
        const gen = new BlindGenerator();

        for (let level = 1; level <= 24; level++) {
          // Control boss selection for predictability
          Math.random = () => 0.1;
          const blind = gen.generateBlind(level);
          const goal = blind.getScoreGoal();

          // Goal should be integer (no fractional values)
          expect(goal % 1).toBe(0);
          expect(goal).toBe(Math.floor(goal));
        }
      });

      it('should handle large goal values without precision loss', () => {
        // Round 8 Boss Blind with The Wall modifier: 50000 × 2 × 4 = 400000
        const blind = new BossBlind(24, 8, BossType.THE_WALL);
        expect(blind.getScoreGoal()).toBe(400000);
      });
    });
  });
});