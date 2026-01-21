// ============================================
// FILE: src/models/poker/hand-upgrade.ts
// ============================================

/**
 * Represents permanent bonuses applied to a poker hand type.
 * Used for tracking planet card upgrades.
 */
export class HandUpgrade {
  public level: number;

  /**
   * Creates a hand upgrade with specified bonuses.
   * @param additionalChips - Bonus chips to add to base chips
   * @param additionalMult - Bonus mult to add to base mult
   * @throws Error if negative values are provided
   */
  constructor(
    public additionalChips: number = 0,
    public additionalMult: number = 0
  ) {
    if (additionalChips < 0 || additionalMult < 0) {
      throw new Error('Upgrade values cannot be negative');
    }
    this.level = 1; // All hands start at level 1
  }

  /**
   * Adds more bonuses to existing upgrade.
   * @param chips - Additional chips to add
   * @param mult - Additional mult to add
   * @throws Error if negative values are provided
   */
  public addUpgrade(chips: number, mult: number): void {
    if (chips < 0 || mult < 0) {
      throw new Error('Upgrade values cannot be negative');
    }
    this.additionalChips += chips;
    this.additionalMult += mult;
    this.level++; // Each planet card increases level by 1
  }
}