// ============================================
// FILE: src/services/config/game-config.ts
// ============================================

/**
 * Global game configuration constants.
 * Centralizes all configurable values for easy balancing.
 * 
 * Note: Card values and hand base values are now managed by BalancingConfig
 * which loads from JSON files for better data-driven design.
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