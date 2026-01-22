// ============================================
// FILE: src/models/blinds/blind-modifier.ts
// ============================================

import { HandType } from '../poker/hand-type.enum';
import { BossType } from './boss-type.enum';

/**
 * Encapsulates rule modifications applied by boss blinds.
 * Contains overrides for goals, hands, discards, and base values.
 */
export class BlindModifier {
  /**
   * Creates a blind modifier with specified overrides.
   * @param goalMultiplier - Multiplier for score goal (default: 1.0)
   * @param maxHands - Override for max hands available (null = no override)
   * @param maxDiscards - Override for max discards available (null = no override)
   * @param allowedHandTypes - Restricted hand types (null = all allowed)
   * @param chipsDivisor - Divisor for base chips (default: 1.0)
   * @param multDivisor - Divisor for base mult (default: 1.0)
   * @throws Error if multipliers/divisors < 0
   */
  constructor(
    public readonly goalMultiplier: number = 1.0,
    public readonly maxHands: number | null = null,
    public readonly maxDiscards: number | null = null,
    public readonly allowedHandTypes: HandType[] | null = null,
    public readonly chipsDivisor: number = 1.0,
    public readonly multDivisor: number = 1.0
  ) {
    if (goalMultiplier < 0 || chipsDivisor < 0 || multDivisor < 0) {
      throw new Error('Multipliers and divisors cannot be negative');
    }
  }

  /**
   * Factory method to create appropriate modifier for each boss type.
   * @param bossType - The boss type to create modifier for
   * @returns BlindModifier configured for that boss
   * @throws Error if invalid BossType
   */
  public static createForBoss(bossType: BossType): BlindModifier {
    switch (bossType) {
      case BossType.THE_WALL:
        return new BlindModifier(4.0);
      case BossType.THE_WATER:
        return new BlindModifier(1.0, null, 0);
      case BossType.THE_MOUTH:
        // Start with empty allowedHandTypes - will be set after first successful hand
        return new BlindModifier(1.0, null, null, null);
      case BossType.THE_NEEDLE:
        return new BlindModifier(0.5, 1, null);
      case BossType.THE_FLINT:
        return new BlindModifier(1.0, null, null, null, 2.0, 2.0);
      default:
        throw new Error(`Unknown boss type: ${bossType}`);
    }
  }
}