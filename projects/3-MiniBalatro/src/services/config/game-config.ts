// ============================================
// FILE: src/services/config/game-config.ts
// ============================================

import { CardValue } from '../../models/core/card-value.enum';
import { HandType } from '../../models/poker/hand-type.enum';

/**
 * Global game configuration constants.
 * Centralizes all configurable values for easy balancing.
 */
export class GameConfig {
  // Game mechanics
  public static readonly INITIAL_MONEY: number = 5;
  public static readonly MAX_JOKERS: number = 5;
  public static readonly MAX_CONSUMABLES: number = 2;
  public static readonly HAND_SIZE: number = 8;
  public static readonly MAX_HANDS_PER_BLIND: number = 3;
  public static readonly MAX_DISCARDS_PER_BLIND: number = 3;

  // Shop costs
  public static readonly JOKER_COST: number = 5;
  public static readonly PLANET_COST: number = 3;
  public static readonly TAROT_COST: number = 3;
  public static readonly SHOP_REROLL_COST: number = 2;

  // Blind rewards
  public static readonly SMALL_BLIND_REWARD: number = 2;
  public static readonly BIG_BLIND_REWARD: number = 5;
  public static readonly BOSS_BLIND_REWARD: number = 10;

  // Victory condition
  public static readonly VICTORY_ROUNDS: number = 8; // 24 levels total

  // Base goal formula: 300 × (1.5)^(roundNumber-1)
  public static readonly BASE_GOAL: number = 300;
  public static readonly GOAL_MULTIPLIER: number = 1.5;

  /**
   * Returns base chip value for card value.
   * @param value - CardValue enum
   * @returns Base chip value
   * @throws Error if invalid CardValue
   */
  public static getCardValue(value: CardValue): number {
    const values: Record<CardValue, number> = {
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

    if (!values[value]) {
      throw new Error(`Invalid card value: ${value}`);
    }

    return values[value];
  }

  /**
   * Returns base chips and mult for hand type.
   * @param handType - HandType enum
   * @returns Object with chips and mult
   * @throws Error if invalid HandType
   */
  public static getHandBaseValues(handType: HandType): { chips: number; mult: number } {
    const values: Record<HandType, { chips: number; mult: number }> = {
      [HandType.HIGH_CARD]: { chips: 5, mult: 1 },
      [HandType.PAIR]: { chips: 10, mult: 2 },
      [HandType.TWO_PAIR]: { chips: 20, mult: 2 },
      [HandType.THREE_OF_A_KIND]: { chips: 30, mult: 3 },
      [HandType.STRAIGHT]: { chips: 30, mult: 4 },
      [HandType.FLUSH]: { chips: 35, mult: 4 },
      [HandType.FULL_HOUSE]: { chips: 40, mult: 4 },
      [HandType.FOUR_OF_A_KIND]: { chips: 60, mult: 7 },
      [HandType.STRAIGHT_FLUSH]: { chips: 100, mult: 8 }
    };

    if (!values[handType]) {
      throw new Error(`Invalid hand type: ${handType}`);
    }

    return values[handType];
  }

  /**
   * Calculates score goal for blind.
   * @param roundNumber - Current round number
   * @param blindType - Type of blind ('small', 'big', or 'boss')
   * @returns Score goal
   * @throws Error if invalid inputs
   */
  public static getBlindGoal(roundNumber: number, blindType: 'small' | 'big' | 'boss'): number {
    if (roundNumber <= 0) {
      throw new Error('Round number must be positive');
    }

    const baseGoal = this.BASE_GOAL * Math.pow(this.GOAL_MULTIPLIER, roundNumber - 1);

    switch (blindType) {
      case 'small': return Math.floor(baseGoal * 1);
      case 'big': return Math.floor(baseGoal * 1.5);
      case 'boss': return Math.floor(baseGoal * 2);
      default: throw new Error(`Invalid blind type: ${blindType}`);
    }
  }
}