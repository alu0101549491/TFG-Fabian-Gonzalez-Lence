// ============================================
// FILE: src/services/config/game-config.ts
// ============================================

import { GAME_CONFIG, SHOP_CONFIG, BLIND_REWARDS, DIFFICULTY_CONFIG } from '../../utils/constants';

/**
 * Global game configuration constants.
 * Re-exports values from constants.ts for backward compatibility.
 * All configuration should be defined in constants.ts for centralized management.
 * 
 * Note: Card values and hand base values are now managed by BalancingConfig
 * which loads from JSON files for better data-driven design.
 */
export class GameConfig {
  // Game mechanics (imported from constants)
  public static readonly INITIAL_MONEY: number = GAME_CONFIG.INITIAL_MONEY;
  public static readonly MAX_JOKERS: number = GAME_CONFIG.MAX_JOKERS;
  public static readonly MAX_CONSUMABLES: number = GAME_CONFIG.MAX_CONSUMABLES;
  public static readonly HAND_SIZE: number = GAME_CONFIG.HAND_SIZE;
  public static readonly MAX_CARDS_TO_PLAY: number = GAME_CONFIG.MAX_CARDS_TO_PLAY;
  public static readonly MAX_HANDS_PER_BLIND: number = GAME_CONFIG.MAX_HANDS_PER_BLIND;
  public static readonly MAX_DISCARDS_PER_BLIND: number = GAME_CONFIG.MAX_DISCARDS_PER_BLIND;
  public static readonly VICTORY_ROUNDS: number = GAME_CONFIG.VICTORY_ROUNDS;
  public static readonly LEVELS_PER_ROUND: number = GAME_CONFIG.LEVELS_PER_ROUND;

  // Shop costs (imported from constants)
  public static readonly JOKER_COST: number = SHOP_CONFIG.JOKER_COST;
  public static readonly PLANET_COST: number = SHOP_CONFIG.PLANET_COST;
  public static readonly TAROT_COST: number = SHOP_CONFIG.TAROT_COST;
  public static readonly SHOP_REROLL_COST: number = SHOP_CONFIG.REROLL_COST;
  public static readonly ITEMS_PER_SHOP: number = SHOP_CONFIG.ITEMS_PER_SHOP;

  // Blind rewards (imported from constants)
  public static readonly SMALL_BLIND_REWARD: number = BLIND_REWARDS.SMALL_BLIND;
  public static readonly BIG_BLIND_REWARD: number = BLIND_REWARDS.BIG_BLIND;
  public static readonly BOSS_BLIND_REWARD: number = BLIND_REWARDS.BOSS_BLIND;

  // Difficulty config (imported from constants)
  public static readonly ROUND_BASE_VALUES: number[] = DIFFICULTY_CONFIG.ROUND_BASE_VALUES;
  public static readonly SMALL_BLIND_MULTIPLIER: number = DIFFICULTY_CONFIG.SMALL_BLIND_MULTIPLIER;
  public static readonly BIG_BLIND_MULTIPLIER: number = DIFFICULTY_CONFIG.BIG_BLIND_MULTIPLIER;
  public static readonly BOSS_BLIND_MULTIPLIER: number = DIFFICULTY_CONFIG.BOSS_BLIND_MULTIPLIER;

  /**
   * Calculates score goal for blind using Balatro's difficulty values.
   * @param roundNumber - Current round number
   * @param blindType - Type of blind ('small', 'big', or 'boss')
   * @returns Score goal
   * @throws Error if invalid inputs
   */
  public static getBlindGoal(roundNumber: number, blindType: 'small' | 'big' | 'boss'): number {
    if (roundNumber <= 0) {
      throw new Error('Round number must be positive');
    }

    // Get base value for the round (rounds beyond 8 use round 8's value)
    const baseIndex = Math.min(roundNumber - 1, this.ROUND_BASE_VALUES.length - 1);
    const baseGoal = this.ROUND_BASE_VALUES[baseIndex];

    switch (blindType) {
      case 'small': return Math.floor(baseGoal * DIFFICULTY_CONFIG.SMALL_BLIND_MULTIPLIER);
      case 'big': return Math.floor(baseGoal * DIFFICULTY_CONFIG.BIG_BLIND_MULTIPLIER);
      case 'boss': return Math.floor(baseGoal * DIFFICULTY_CONFIG.BOSS_BLIND_MULTIPLIER);
      default: throw new Error(`Invalid blind type: ${blindType}`);
    }
  }
}