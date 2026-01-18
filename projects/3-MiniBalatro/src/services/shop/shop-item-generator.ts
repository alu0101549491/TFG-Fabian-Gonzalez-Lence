// ============================================
// FILE: src/services/shop/shop-item-generator.ts
// ============================================

import { ShopItem } from './shop-item';
import { ShopItemType, getDefaultCost } from './shop-item-type.enum';
import { Joker } from '../../models/special-cards/jokers/joker';
import { Planet } from '../../models/special-cards/planets/planet';
import { Tarot } from '../../models/special-cards/tarots/tarot';
import { BalancingConfig } from '../config/balancing-config';
import { HandType } from '../../models/poker/hand-type.enum';
import { BossType } from '../../models/blinds/boss-type.enum';
import { CardValue } from '../../models/core/card-value.enum';
import { Suit } from '../../models/core/suit.enum';
import { ChipJoker } from '../../models/special-cards/jokers/chip-joker';
import { MultJoker } from '../../models/special-cards/jokers/mult-joker';
import { MultiplierJoker } from '../../models/special-cards/jokers/multiplier-joker';
import { InstantTarot } from '../../models/special-cards/tarots/instant-tarot';
import { TargetedTarot } from '../../models/special-cards/tarots/targeted-tarot';
import { TarotEffect } from '../../models/special-cards/tarots/tarot-effect.enum';

/**
 * Generates random jokers, planets, and tarot cards for shop.
 * Creates diverse shop inventories with appropriate distribution.
 */
export class ShopItemGenerator {
  private balancingConfig: BalancingConfig;

  /**
   * Creates a shop item generator with balancing configuration.
   */
  constructor() {
    this.balancingConfig = new BalancingConfig();
  }

  /**
   * Creates a random joker from the available types.
   * @returns Random Joker
   */
  public generateRandomJoker(): Joker {
    // Get all joker IDs from balancing config
    const jokerIds = this.balancingConfig.getAllJokerIds();
    if (jokerIds.length === 0) {
      throw new Error('No joker definitions available');
    }

    // Select a random joker ID
    const randomIndex = Math.floor(Math.random() * jokerIds.length);
    const jokerId = jokerIds[randomIndex];
    const jokerDef = this.balancingConfig.getJokerDefinition(jokerId);

    // Create a joker based on the definition
    // This is a simplified implementation - in a real app, we'd have a factory
    // For now, we'll create a basic joker with the name from the definition
    return new ChipJoker(
      jokerId,
      jokerDef.name,
      jokerDef.description || 'Increases your score',
      jokerDef.value || 5,
      jokerDef.condition ? () => true : undefined
    );
  }

  /**
   * Creates a random planet from the available types.
   * @returns Random Planet
   */
  public generateRandomPlanet(): Planet {
    // Get all planet IDs from balancing config
    const planetIds = this.balancingConfig.getAllPlanetIds();
    if (planetIds.length === 0) {
      throw new Error('No planet definitions available');
    }

    // Select a random planet ID
    const randomIndex = Math.floor(Math.random() * planetIds.length);
    const planetId = planetIds[randomIndex];
    const planetDef = this.balancingConfig.getPlanetDefinition(planetId);

    // Select a random hand type to upgrade
    const handTypes = Object.values(HandType);
    const randomHandType = handTypes[Math.floor(Math.random() * handTypes.length)];

    // Create a planet with the selected hand type
    return new Planet(
      planetDef.name,
      randomHandType,
      planetDef.chipsBonus || 10,
      planetDef.multBonus || 1
    );
  }

  /**
   * Creates a random tarot from the available types.
   * @returns Random Tarot
   */
  public generateRandomTarot(): Tarot {
    // Get all tarot IDs from balancing config
    const tarotIds = this.balancingConfig.getAllTarotIds();
    if (tarotIds.length === 0) {
      throw new Error('No tarot definitions available');
    }

    // Select a random tarot ID
    const randomIndex = Math.floor(Math.random() * tarotIds.length);
    const tarotId = tarotIds[randomIndex];
    const tarotDef = this.balancingConfig.getTarotDefinition(tarotId);

    // Determine if this is an instant or targeted tarot
    const isInstant = Math.random() < 0.5; // 50% chance for each type

    if (isInstant) {
      // Create an instant tarot (e.g., The Hermit)
      return new InstantTarot(
        tarotDef.name,
        tarotDef.description || 'Instant effect',
        (gameState) => {
          // Example effect: double money
          gameState.addMoney(gameState.getMoney());
        }
      );
    } else {
      // Create a targeted tarot (e.g., The Empress)
      return new TargetedTarot(
        tarotDef.name,
        tarotDef.description || 'Targeted effect',
        tarotDef.effectType || TarotEffect.ADD_MULT,
        tarotDef.effectValue || 4
      );
    }
  }

  /**
   * Generates specified number of random shop items with costs.
   * @param count - Number of items to generate
   * @returns Array of ShopItems with diverse types
   * @throws Error if count <= 0
   */
  public generateShopItems(count: number): ShopItem[] {
    if (count <= 0) {
      throw new Error('Count must be positive');
    }

    const items: ShopItem[] = [];

    for (let i = 0; i < count; i++) {
      // Randomly select item type with weighted distribution
      // 40% Joker, 30% Planet, 30% Tarot
      const random = Math.random();
      let type: ShopItemType;
      let item: Joker | Planet | Tarot;

      if (random < 0.4) {
        type = ShopItemType.JOKER;
        item = this.generateRandomJoker();
      } else if (random < 0.7) {
        type = ShopItemType.PLANET;
        item = this.generateRandomPlanet();
      } else {
        type = ShopItemType.TAROT;
        item = this.generateRandomTarot();
      }

      // Create shop item with default cost
      const cost = getDefaultCost(type);
      items.push(new ShopItem(type, item, cost));
    }

    return items;
  }
}