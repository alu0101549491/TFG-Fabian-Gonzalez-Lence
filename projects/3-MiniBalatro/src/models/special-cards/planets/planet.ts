import {HandType} from '../../poker/hand-type.enum';
import {HandUpgradeManager} from '../../poker/hand-upgrade-manager';

/**
 * Represents a planet card that permanently upgrades poker hand types.
 * Each planet targets a specific hand type and adds chips and mult.
 */
export class Planet {
  private targetHandType: HandType;
  private chipsBonus: number;
  private multBonus: number;

  /**
   * Creates a new Planet instance.
   * @param {HandType} handType - Hand type to upgrade
   * @param {number} chips - Chips to add
   * @param {number} mult - Mult to add
   */
  constructor(handType: HandType, chips: number, mult: number) {
    this.targetHandType = handType;
    this.chipsBonus = chips;
    this.multBonus = mult;
  }

  /**
   * Applies this planet's upgrade to the hand upgrade manager.
   * @param {HandUpgradeManager} upgradeManager - Manager to update
   */
  public apply(upgradeManager: HandUpgradeManager): void {
    // TODO: Implement planet application
  }

  // Getters
  public getTargetHandType(): HandType {
    return this.targetHandType;
  }

  public getChipsBonus(): number {
    return this.chipsBonus;
  }

  public getMultBonus(): number {
    return this.multBonus;
  }
}