// ============================================
// FILE: src/models/blinds/blind-generator.ts
// ============================================

import { Blind } from './blind';
import { SmallBlind } from './small-blind';
import { BigBlind } from './big-blind';
import { BossBlind } from './boss-blind';
import { BossType } from './boss-type.enum';
import { GameConfig } from '../../services/config/game-config';

/**
 * Generates appropriate blinds based on level progression.
 * Handles Small → Big → Boss pattern and boss selection.
 */
export class BlindGenerator {
  /**
   * History of recently used bosses to avoid repetition.
   * Keeps track of the last 2 bosses used.
   */
  private bossHistory: BossType[] = [];

  /**
   * Generates the appropriate blind for the given level number.
   * @param level - The level number
   * @returns SmallBlind, BigBlind, or BossBlind based on level
   * @throws Error if level <= 0
   */
  public generateBlind(level: number): Blind {
    if (level <= 0) {
      throw new Error('Level must be positive');
    }

    const roundNumber = BlindGenerator.calculateRoundNumber(level);
    const positionInRound = (level - 1) % GameConfig.LEVELS_PER_ROUND;

    console.log(`Generating blind for level ${level} (round ${roundNumber}, position ${positionInRound})`);

    switch (positionInRound) {
      case 0:
        return new SmallBlind(level, roundNumber);
      case 1:
        return new BigBlind(level, roundNumber);
      case 2:
        return new BossBlind(level, roundNumber, this.selectRandomBoss());
      default:
        throw new Error('Invalid position in round');
    }
  }

  /**
   * Randomly selects one of the 5 boss types with variety tracking.
   * Avoids selecting the same boss as the last 2 bosses used.
   * @returns One of the 5 BossType values with improved variety
   */
  private selectRandomBoss(): BossType {
    const allBossTypes = Object.values(BossType);
    
    // Filter out bosses that were recently used
    const availableBosses = allBossTypes.filter(
      boss => !this.bossHistory.includes(boss)
    );
    
    // If all bosses are in history (shouldn't happen with 5 bosses and history of 2),
    // or if this is first/second boss, use available bosses or all
    const selectFrom = availableBosses.length > 0 ? availableBosses : allBossTypes;
    
    const randomIndex = Math.floor(Math.random() * selectFrom.length);
    const selectedBoss = selectFrom[randomIndex];
    
    // Update history: keep last 2 bosses
    this.bossHistory.push(selectedBoss);
    if (this.bossHistory.length > 2) {
      this.bossHistory.shift();
    }
    
    console.log(`Selected boss: ${selectedBoss} (history: ${this.bossHistory.join(', ')})`);
    return selectedBoss;
  }

  /**
   * Calculates which round a level belongs to.
   * @param level - The level number
   * @returns Positive integer (round 1, 2, 3, ...)
   */
  public static calculateRoundNumber(level: number): number {
    if (level <= 0) {
      throw new Error('Level must be positive');
    }
    return Math.floor((level - 1) / GameConfig.LEVELS_PER_ROUND) + 1;
  }

  /**
   * Returns blind type name for a level ("Small", "Big", "Boss").
   * @param level - The level number
   * @returns "Small", "Big", or "Boss"
   */
  public static getBlindTypeForLevel(level: number): string {
    const positionInRound = (level - 1) % 3;
    switch (positionInRound) {
      case 0: return 'Small';
      case 1: return 'Big';
      case 2: return 'Boss';
      default: return 'Unknown';
    }
  }
}