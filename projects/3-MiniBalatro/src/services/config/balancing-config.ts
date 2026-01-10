import {HandType} from '../../models/poker/hand-type.enum';
import {CardValue} from '../../models/core/card-value.enum';
import {HandUpgrade} from '../../models/poker/hand-upgrade';

/**
 * Configuration loaded from JSON for game balancing.
 * Singleton pattern - allows easy balancing without code changes.
 */
export class BalancingConfig {
  private static instance: BalancingConfig;

  public handValues: Map<HandType, HandUpgrade>;
  public cardValues: Map<CardValue, number>;

  private constructor() {
    // TODO: Initialize empty configurations
  }

  /**
   * Gets the singleton instance.
   * @return {BalancingConfig} Config instance
   */
  public static getInstance(): BalancingConfig {
    if (!BalancingConfig.instance) {
      BalancingConfig.instance = new BalancingConfig();
    }
    return BalancingConfig.instance;
  }

  /**
   * Loads configuration from JSON file.
   */
  public loadFromJSON(): void {
    // TODO: Implement JSON loading
  }
}