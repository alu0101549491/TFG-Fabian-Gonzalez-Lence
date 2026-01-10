import {HandType} from '../poker/hand-type.enum';

/**
 * Represents modifications applied by boss blinds.
 * Affects scoring, hand limits, and allowed hand types.
 */
export class BlindModifier {
  public goalMultiplier: number;
  public maxHands: number;
  public maxDiscards: number;
  public allowedHandTypes: HandType[] | null;
  public chipsDivisor: number;
  public multDivisor: number;

  /**
   * Creates a new BlindModifier instance.
   * @param {number} goalMultiplier - Multiplier for score goal
   * @param {number} maxHands - Maximum hands allowed
   * @param {number} maxDiscards - Maximum discards allowed
   * @param {HandType[] | null} allowedHandTypes - Allowed hand types (null = all)
   * @param {number} chipsDivisor - Divisor for chip values
   * @param {number} multDivisor - Divisor for mult values
   */
  constructor(
      goalMultiplier: number = 1,
      maxHands: number = 4,
      maxDiscards: number = 3,
      allowedHandTypes: HandType[] | null = null,
      chipsDivisor: number = 1,
      multDivisor: number = 1
  ) {
    this.goalMultiplier = goalMultiplier;
    this.maxHands = maxHands;
    this.maxDiscards = maxDiscards;
    this.allowedHandTypes = allowedHandTypes;
    this.chipsDivisor = chipsDivisor;
    this.multDivisor = multDivisor;
  }
}