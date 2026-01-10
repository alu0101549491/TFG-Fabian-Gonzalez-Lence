/**
 * Represents upgrades to a poker hand type from planet cards.
 * Stores additional chips and multiplier bonuses.
 */
export class HandUpgrade {
  public additionalChips: number;
  public additionalMult: number;

  /**
   * Creates a new HandUpgrade instance.
   * @param {number} additionalChips - Chip bonus from upgrades
   * @param {number} additionalMult - Multiplier bonus from upgrades
   */
  constructor(additionalChips: number = 0, additionalMult: number = 0) {
    this.additionalChips = additionalChips;
    this.additionalMult = additionalMult;
  }
}