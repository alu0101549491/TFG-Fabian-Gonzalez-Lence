# TESTING CONTEXT
Project: Mini Balatro
Components under test: Shop, ShopItem, ShopItemGenerator, ShopItemType (enum)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/services/shop/shop-item-type.enum.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/services/shop/shop-item-type.enum.ts
 * @desc Shop item type enumeration and utility functions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { GameConfig } from '../config/game-config';

/**
 * Enum defining purchasable item types in shop.
 */
export enum ShopItemType {
  JOKER = 'JOKER',
  PLANET = 'PLANET',
  TAROT = 'TAROT'
}

/**
 * Returns the display name for an item type.
 * @param type - The item type
 * @returns Display name
 */
export function getItemTypeDisplayName(type: ShopItemType): string {
  switch (type) {
    case ShopItemType.JOKER: return 'Joker';
    case ShopItemType.PLANET: return 'Planet Card';
    case ShopItemType.TAROT: return 'Tarot Card';
    default: return 'Unknown Item';
  }
}

/**
 * Returns the default cost for an item type.
 * @param type - The item type
 * @returns Default cost
 */
export function getDefaultCost(type: ShopItemType): number {
  switch (type) {
    case ShopItemType.JOKER: return GameConfig.JOKER_COST;
    case ShopItemType.PLANET: return GameConfig.PLANET_COST;
    case ShopItemType.TAROT: return GameConfig.TAROT_COST;
    default: return 0;
  }
}
```

## File 2: src/services/shop/shop-item.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/services/shop/shop-item.ts
 * @desc Shop item model wrapping joker/planet/tarot cards with purchase cost.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { v4 as uuidv4 } from 'uuid';
import { ShopItemType } from './shop-item-type.enum';
import { Joker } from '../../models/special-cards/jokers/joker';
import { Planet } from '../../models/special-cards/planets/planet';
import { Tarot } from '../../models/special-cards/tarots/tarot';

/**
 * Represents a single purchasable item in the shop.
 * Contains the special card and its cost.
 */
export class ShopItem {
  private readonly id: string;

  /**
   * Creates a shop item with specified properties.
   * @param type - Type of item (Joker/Planet/Tarot)
   * @param item - The actual special card object
   * @param cost - Purchase price
   * @throws Error if item null or cost <= 0
   */
  constructor(
    public readonly type: ShopItemType,
    public readonly item: Joker | Planet | Tarot,
    public readonly cost: number
  ) {
    if (!item) {
      throw new Error('Item cannot be null');
    }
    if (cost <= 0) {
      throw new Error('Cost must be positive');
    }

    this.id = uuidv4();
  }

  /**
   * Returns the item's unique ID.
   * @returns The item ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Returns the item type.
   * @returns The ShopItemType enum
   */
  public getType(): ShopItemType {
    return this.type;
  }

  /**
   * Returns the special card object.
   * @returns Joker, Planet, or Tarot
   */
  public getItem(): Joker | Planet | Tarot {
    return this.item;
  }

  /**
   * Returns the purchase cost.
   * @returns Positive number
   */
  public getCost(): number {
    return this.cost;
  }

  /**
   * Restores the item ID during deserialization.
   * Used by GamePersistence to maintain shop item IDs across saves.
   * @param id - The ID to restore
   */
  public restoreId(id: string): void {
    (this as any).id = id;
  }
}
```

## File 3: src/services/shop/shop-item-generator.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/services/shop/shop-item-generator.ts
 * @desc Shop item factory generating random jokers, planets, and tarots using weighted distribution.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { ShopItem } from './shop-item';
import { ShopItemType, getDefaultCost } from './shop-item-type.enum';
import { Joker } from '../../models/special-cards/jokers/joker';
import { Planet } from '../../models/special-cards/planets/planet';
import { Tarot } from '../../models/special-cards/tarots/tarot';
import { BalancingConfig } from '../config/balancing-config';
import { GameConfig } from '../config/game-config';
import { JokerDefinition } from '../config/types';
import { HandType } from '../../models/poker/hand-type.enum';
import { ChipJoker } from '../../models/special-cards/jokers/chip-joker';
import { MultJoker } from '../../models/special-cards/jokers/mult-joker';
import { MultiplierJoker } from '../../models/special-cards/jokers/multiplier-joker';
import { EconomicJoker } from '../../models/special-cards/jokers/economic-joker';
import { PermanentUpgradeJoker } from '../../models/special-cards/jokers/permanent-upgrade-joker';
import { InstantTarot } from '../../models/special-cards/tarots/instant-tarot';
import { TargetedTarot } from '../../models/special-cards/tarots/targeted-tarot';
import { TarotEffect } from '../../models/special-cards/tarots/tarot-effect.enum';
import { ScoreContext } from '../../models/scoring/score-context';
import { TAROT_CONFIG } from '../../utils/constants';
import { Suit } from '../../models/core/suit.enum';
import { Card } from '../../models/core/card';
import { CardValue } from '../../models/core/card-value.enum';

/**
 * Generates random jokers, planets, and tarot cards for shop.
 * Creates diverse shop inventories with appropriate distribution.
 */
export class ShopItemGenerator {
  private balancingConfig: BalancingConfig;
  private initPromise: Promise<void>;
  private readonly jokerFactories: Record<string, (jokerId: string, jokerDef: JokerDefinition, conditionFn?: (context: ScoreContext) => boolean, multiplierFn?: (context: ScoreContext) => number) => Joker>;

  /**
   * Creates a shop item generator with balancing configuration.
   */
  constructor() {
    this.balancingConfig = new BalancingConfig();
    // Store the initialization promise so we can await it
    this.initPromise = this.balancingConfig.initializeAsync();
    // Initialize factory map for joker creation by type
    this.jokerFactories = {
      chips: (jokerId: string, jokerDef: JokerDefinition, conditionFn?: (context: ScoreContext) => boolean, multiplierFn?: (context: ScoreContext) => number) =>
        new ChipJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Increases chips',
          jokerDef.value || 5,
          conditionFn,
          multiplierFn
        ),
      mult: (jokerId: string, jokerDef: JokerDefinition, conditionFn?: (context: ScoreContext) => boolean, multiplierFn?: (context: ScoreContext) => number) =>
        new MultJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Increases mult',
          jokerDef.value || 4,
          conditionFn,
          multiplierFn
        ),
      multiplier: (jokerId: string, jokerDef: JokerDefinition, conditionFn?: (context: ScoreContext) => boolean, multiplierFn?: (context: ScoreContext) => number) =>
        new MultiplierJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Multiplies mult',
          jokerDef.value || 2,
          conditionFn,
          multiplierFn
        ),
      economic: (jokerId: string, jokerDef: JokerDefinition) =>
        new EconomicJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Provides economic benefit',
          jokerDef.value || 0
        ),
      permanentUpgrade: (jokerId: string, jokerDef: JokerDefinition) =>
        new PermanentUpgradeJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Permanently upgrades played cards',
          jokerDef.value || 5,
          0
        )
    };
  }

  /**
   * Ensures configuration is loaded before generating items.
   * @returns Promise that resolves when config is loaded
   */
  public async ensureInitialized(): Promise<void> {
    await this.initPromise;
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
    
    return this.generateJokerById(jokerId);
  }

  /**
   * Creates a specific planet by ID.
   * @param planetId - ID of the planet to create
   * @returns Planet instance
   * @throws Error if planet ID not found
   */
  public generatePlanetById(planetId: string): Planet {
    const planetDef = this.balancingConfig.getPlanetDefinition(planetId);
    if (!planetDef) {
      throw new Error(`Planet ${planetId} not found in balancing config`);
    }

    const handType = planetDef.targetHandType as HandType;
    return new Planet(
      planetDef.name,
      handType,
      planetDef.chipsBonus || 10,
      planetDef.multBonus || 1,
      planetDef.description
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

    // targetHandType is already a HandType enum (converted by BalancingConfig)
    const handType = planetDef.targetHandType as HandType;

    // Create a planet with the correct hand type from definition
    return new Planet(
      planetDef.name,
      handType,
      planetDef.chipsBonus || 10,
      planetDef.multBonus || 1,
      planetDef.description
    );
  }

  /**
   * Creates a specific joker by ID.
   * @param jokerId - ID of the joker to create
   * @returns Joker instance
   * @throws Error if joker ID not found
   */
  

  /**
   * Builds condition and multiplier functions based on the condition string from JSON.
   * @param condition - Condition string from joker definition
   * @returns Object with conditionFn and multiplierFn
   */
  private buildJokerConditionAndMultiplier(condition?: string): {
    conditionFn?: (context: ScoreContext) => boolean;
    multiplierFn?: (context: ScoreContext) => number;
  } {
    if (!condition || condition === 'always') {
      return {}; // Always active, no special conditions
    }

    // Handle per-suit conditions (these need multiplier functions)
    switch (condition) {
      case 'perDiamond':
        return {
          // Only activate if there are diamonds
          conditionFn: (context: ScoreContext) => 
            context.playedCards.some((card: Card) => card.suit === Suit.DIAMONDS),
          // Count diamonds
          multiplierFn: (context: ScoreContext) => 
            context.playedCards.filter((card: Card) => card.suit === Suit.DIAMONDS).length
        };
      
      case 'perHeart':
        return {
          conditionFn: (context: ScoreContext) => 
            context.playedCards.some((card: Card) => card.suit === Suit.HEARTS),
          multiplierFn: (context: ScoreContext) => 
            context.playedCards.filter((card: Card) => card.suit === Suit.HEARTS).length
        };
      
      case 'perSpade':
        return {
          conditionFn: (context: ScoreContext) => 
            context.playedCards.some((card: Card) => card.suit === Suit.SPADES),
          multiplierFn: (context: ScoreContext) => 
            context.playedCards.filter((card: Card) => card.suit === Suit.SPADES).length
        };
      
      case 'perClub':
        return {
          conditionFn: (context: ScoreContext) => 
            context.playedCards.some((card: Card) => card.suit === Suit.CLUBS),
          multiplierFn: (context: ScoreContext) => 
            context.playedCards.filter((card: Card) => card.suit === Suit.CLUBS).length
        };
      
      case 'perFibonacciCard':
        return {
          conditionFn: (context: ScoreContext) => {
            const fibValues = [CardValue.ACE, CardValue.TWO, CardValue.THREE, CardValue.FIVE, CardValue.EIGHT];
            return context.playedCards.some((card: Card) => fibValues.includes(card.value));
          },
          multiplierFn: (context: ScoreContext) => {
            const fibValues = [CardValue.ACE, CardValue.TWO, CardValue.THREE, CardValue.FIVE, CardValue.EIGHT];
            return context.playedCards.filter((card: Card) => fibValues.includes(card.value)).length;
          }
        };
      
      case 'perEvenCard':
        return {
          conditionFn: (context: ScoreContext) => {
            const evenValues = [CardValue.TWO, CardValue.FOUR, CardValue.SIX, CardValue.EIGHT, CardValue.TEN];
            return context.playedCards.some((card: Card) => evenValues.includes(card.value));
          },
          multiplierFn: (context: ScoreContext) => {
            const evenValues = [CardValue.TWO, CardValue.FOUR, CardValue.SIX, CardValue.EIGHT, CardValue.TEN];
            return context.playedCards.filter((card: Card) => evenValues.includes(card.value)).length;
          }
        };
      
      case 'perOddCard':
        return {
          conditionFn: (context: ScoreContext) => {
            const oddValues = [CardValue.ACE, CardValue.THREE, CardValue.FIVE, CardValue.SEVEN, CardValue.NINE];
            return context.playedCards.some((card: Card) => oddValues.includes(card.value));
          },
          multiplierFn: (context: ScoreContext) => {
            const oddValues = [CardValue.ACE, CardValue.THREE, CardValue.FIVE, CardValue.SEVEN, CardValue.NINE];
            return context.playedCards.filter((card: Card) => oddValues.includes(card.value)).length;
          }
        };
      
      case 'perKingOrQueen':
        return {
          conditionFn: (context: ScoreContext) => {
            const royalValues = [CardValue.QUEEN, CardValue.KING];
            return context.playedCards.some((card: Card) => royalValues.includes(card.value));
          },
          multiplierFn: (context: ScoreContext) => {
            const royalValues = [CardValue.QUEEN, CardValue.KING];
            return context.playedCards.filter((card: Card) => royalValues.includes(card.value)).length;
          }
        };
      
      // Handle boolean conditions (no multiplier needed)
      case 'handSizeLessThanOrEqual3':
        return {
          conditionFn: (context: ScoreContext) => context.playedCards.length <= 3
        };
      
      case 'perEmptyJokerSlot':
        return {
          conditionFn: () => true, // Always active (always has at least ×1)
          multiplierFn: (context: ScoreContext) => context.emptyJokerSlots + 1
        };
      
      case 'noDiscardsRemaining':
        return {
          conditionFn: (context: ScoreContext) => context.discardsRemaining === 0
        };
      
      case 'perRemainingCard':
        return {
          conditionFn: (context: ScoreContext) => context.remainingDeckSize > 0,
          multiplierFn: (context: ScoreContext) => context.remainingDeckSize
        };
      
      default:
        console.warn(`Unknown condition "${condition}", defaulting to always active`);
        return {};
    }
  }

  /**
   * Selects a ShopItemType using configured weights.
   */
  private selectItemType(): ShopItemType {
    const r = Math.random();
    if (r < GameConfig.JOKER_WEIGHT) return ShopItemType.JOKER;
    if (r < GameConfig.JOKER_WEIGHT + GameConfig.PLANET_WEIGHT) return ShopItemType.PLANET;
    return ShopItemType.TAROT;
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

    // Check if this is an instant or targeted tarot based on definition
    const isInstant = tarotDef.effectType === 'instant' || !tarotDef.targetRequired;

    if (isInstant) {
      // Create an instant tarot (e.g., The Hermit)
      return new InstantTarot(
        tarotId,
        tarotDef.name,
        tarotDef.description || 'Instant effect',
        (gameState) => {
          // Handle instant effects
          if (tarotId === 'theHermit') {
            // The Hermit: Doubles player's current money, capped at $20 bonus
            const currentMoney = gameState.getMoney();
            const moneyToAdd = Math.min(currentMoney, TAROT_CONFIG.HERMIT_MAX_MONEY_BONUS);
            gameState.addMoney(moneyToAdd);
          }
          // Add more instant tarot effects here as needed
        }
      );
    } else {
      // Create a targeted tarot (e.g., The Empress, The Emperor, suit changers)
      return new TargetedTarot(
        tarotId,
        tarotDef.name,
        tarotDef.description || 'Targeted effect',
        tarotDef.effectType || TarotEffect.ADD_MULT,
        tarotDef.effectValue
      );
    }
  }

  /**
   * Creates a specific tarot by ID.
   * @param tarotId - ID of the tarot to create
   * @returns Tarot instance
   * @throws Error if tarot ID not found
   */
  public generateTarotById(tarotId: string): Tarot {
    const tarotDef = this.balancingConfig.getTarotDefinition(tarotId);
    if (!tarotDef) {
      throw new Error(`Tarot definition not found for ID: ${tarotId}`);
    }

    const isInstant = tarotDef.effectType === 'instant' || !tarotDef.targetRequired;

    if (isInstant) {
      return new InstantTarot(
        tarotId,
        tarotDef.name,
        tarotDef.description || 'Instant effect',
        (gameState) => {
          if (tarotId === 'theHermit') {
            const currentMoney = gameState.getMoney();
            const moneyToAdd = Math.min(currentMoney, TAROT_CONFIG.HERMIT_MAX_MONEY_BONUS);
            gameState.addMoney(moneyToAdd);
          }
        }
      );
    } else {
      return new TargetedTarot(
        tarotId,
        tarotDef.name,
        tarotDef.description || 'Targeted effect',
        tarotDef.effectType || TarotEffect.ADD_MULT,
        tarotDef.effectValue
      );
    }
  }

  /**
   * Generates specified number of random shop items with costs.
   * Waits for configuration to load before generating items.
   * Ensures no duplicate jokers appear in shop (both in current shop and owned by player).
   * @param count - Number of items to generate
   * @param ownedJokerIds - Array of joker IDs already owned by player
   * @returns Promise resolving to array of ShopItems with diverse types
   * @throws Error if count <= 0
   */
  public async generateShopItems(count: number, ownedJokerIds: string[] = []): Promise<ShopItem[]> {
    if (count <= 0) {
      throw new Error('Count must be positive');
    }

    // Wait for configuration to load
    await this.ensureInitialized();

    const items: ShopItem[] = [];
    const usedJokerIds = new Set<string>(ownedJokerIds); // Track owned + already generated jokers

    for (let i = 0; i < count; i++) {
      // Select item type using configurable weights
      const type = this.selectItemType();
      let item: Joker | Planet | Tarot;

      if (type === ShopItemType.JOKER) {
        item = this.generateUniqueJoker(usedJokerIds);
      } else if (type === ShopItemType.PLANET) {
        item = this.generateRandomPlanet();
      } else {
        item = this.generateRandomTarot();
      }

      // Create shop item with default cost
      const cost = getDefaultCost(type);
      items.push(new ShopItem(type, item, cost));
    }

    return items;
  }

  /**
   * Generates a unique joker that hasn't been used yet.
   * @param usedJokerIds - Set of joker IDs already owned or in current shop
   * @returns Unique Joker not in the usedJokerIds set
   */
  private generateUniqueJoker(usedJokerIds: Set<string>): Joker {
    const allJokerIds = this.balancingConfig.getAllJokerIds();
    const availableJokerIds = allJokerIds.filter(id => !usedJokerIds.has(id));

    // If all jokers are owned/used, allow duplicates (fallback)
    if (availableJokerIds.length === 0) {
      console.warn('All jokers owned/in shop, allowing duplicate');
      const randomIndex = Math.floor(Math.random() * allJokerIds.length);
      return this.generateJokerById(allJokerIds[randomIndex]);
    }

    // Select a random available joker
    const randomIndex = Math.floor(Math.random() * availableJokerIds.length);
    const selectedJokerId = availableJokerIds[randomIndex];
    
    // Mark this joker as used for this shop generation
    usedJokerIds.add(selectedJokerId);

    return this.generateJokerById(selectedJokerId);
  }

  /**
   * Generates a specific joker by ID using factory map.
   */
  public generateJokerById(jokerId: string): Joker {
    const jokerDef = this.balancingConfig.getJokerDefinition(jokerId);
    if (!jokerDef) {
      throw new Error(`Joker definition not found for ID: ${jokerId}`);
    }

    // Build condition and multiplier functions based on the condition string
    const { conditionFn, multiplierFn } = this.buildJokerConditionAndMultiplier(jokerDef.condition);

    const factory = this.jokerFactories[jokerDef.type];
    if (factory) {
      return factory(jokerId, jokerDef, conditionFn, multiplierFn);
    }

    // Default fallback
    console.warn(`Unknown joker type "${jokerDef.type}" for ${jokerId}, defaulting to ChipJoker`);
    return new ChipJoker(
      jokerId,
      jokerDef.name,
      jokerDef.description || 'Increases your score',
      jokerDef.value || 5,
      conditionFn,
      multiplierFn
    );
  }
}
```

## File 4: src/services/shop/shop.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/services/shop/shop.ts
 * @desc Shop service managing inventory, purchases, and reroll operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { ShopItem } from './shop-item';
import { ShopItemGenerator } from './shop-item-generator';
import { GameConfig } from '../config/game-config';

/**
 * Manages shop inventory and transactions.
 * Handles item generation, purchases, and rerolls.
 */
export class Shop {
  private availableItems: ShopItem[];
  private rerollCost: number;

  /**
   * Creates a shop with specified reroll cost.
   * @param rerollCost - Cost to regenerate shop items
   * @throws Error if rerollCost <= 0
   */
  constructor(rerollCost: number = GameConfig.SHOP_REROLL_COST) {
    if (rerollCost <= 0) {
      throw new Error('Reroll cost must be positive');
    }

    this.availableItems = [];
    this.rerollCost = rerollCost;
  }

  /**
   * Generates new shop items.
   * @param count - Number of items to generate (default 4)
   * @param ownedJokerIds - Array of joker IDs already owned by player (prevents duplicates)
   * @returns Promise that resolves when items are generated
   * @throws Error if count <= 0
   */
  public async generateItems(count: number = 4, ownedJokerIds: string[] = []): Promise<void> {
    if (count <= 0) {
      throw new Error('Count must be positive');
    }

    const generator = new ShopItemGenerator();
    this.availableItems = await generator.generateShopItems(count, ownedJokerIds);

    console.log(`Generated ${this.availableItems.length} shop items (excluding ${ownedJokerIds.length} owned jokers)`);
  }

  /**
   * Attempts to purchase item if affordable.
   * @param itemId - ID of item to purchase
   * @param playerMoney - Player's current money
   * @returns ShopItem if successful, null if not affordable
   * @throws Error if itemId not found
   */
  public purchaseItem(itemId: string, playerMoney: number): ShopItem | null {
    const itemIndex = this.availableItems.findIndex(item => item.getId() === itemId);
    if (itemIndex === -1) {
      throw new Error(`Item with ID ${itemId} not found`);
    }

    const item = this.availableItems[itemIndex];
    if (playerMoney >= item.getCost()) {
      // Remove item from shop
      this.availableItems.splice(itemIndex, 1);
      console.log(`Purchased item ${item.getId()} for $${item.getCost()}`);
      return item;
    }

    return null;
  }

  /**
   * Regenerates shop items if player can afford reroll cost.
   * @param playerMoney - Player's current money
   * @param ownedJokerIds - Array of joker IDs already owned by player (prevents duplicates)
   * @returns Promise resolving to true if successful, false if not affordable
   */
  public async reroll(playerMoney: number, ownedJokerIds: string[] = []): Promise<boolean> {
    if (playerMoney >= this.rerollCost) {
      await this.generateItems(GameConfig.ITEMS_PER_SHOP, ownedJokerIds);
      console.log(`Shop rerolled for $${this.rerollCost}`);
      return true;
    }
    return false;
  }

  /**
   * Returns copy of available items.
   * @returns Array of ShopItems
   */
  public getAvailableItems(): ShopItem[] {
    return [...this.availableItems];
  }

  /**
   * Returns cost to reroll shop.
   * @returns Positive number
   */
  public getRerollCost(): number {
    return this.rerollCost;
  }

  /**
   * Returns number of items in shop.
   * @returns Integer 0-4
   */
  public getItemCount(): number {
    return this.availableItems.length;
  }

  /**
   * Gets an item by ID.
   * @param itemId - ID of item to get
   * @returns ShopItem if found, undefined otherwise
   */
  public getItem(itemId: string): ShopItem | undefined {
    return this.availableItems.find(item => item.getId() === itemId);
  }

  /**
   * Removes an item by ID.
   * @param itemId - ID of item to remove
   */
  public removeItem(itemId: string): void {
    this.availableItems = this.availableItems.filter(item => item.getId() !== itemId);
  }

  /**
   * Sets shop items directly (used for restoring from save).
   * @param items - Array of ShopItems to set
   */
  public setItems(items: ShopItem[]): void {
    this.availableItems = items;
    console.log(`Shop items restored: ${items.length} items`);
  }
}
```

# JEST CONFIGURATION
```json
/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@views/(.*)$': '<rootDir>/src/views/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/main.tsx',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
```

# TYPESCRIPT CONFIGURATION
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@models/*": ["src/models/*"],
      "@controllers/*": ["src/controllers/*"],
      "@services/*": ["src/services/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    },

    /* Additional options */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

# REQUIREMENTS SPECIFICATION

## ShopItemType Enum Requirements:
- Must define exactly 3 types: JOKER, PLANET, TAROT
- Used to categorize shop items
- Must provide type checking

## ShopItem Class Requirements:

### Properties:
- **id**: string (UUID)
- **type**: ShopItemType
- **item**: Joker | Planet | Tarot
- **cost**: number

### Constructor:
- Validates item not null
- Validates cost > 0
- Generates unique UUID for id
- Stores type, item, cost

### Getters:
- getId(): string
- getType(): ShopItemType
- getItem(): Joker | Planet | Tarot
- getCost(): number

### Validation:
- Throws error on null item
- Throws error on cost ≤ 0
- Each instance has unique ID

## ShopItemGenerator Class Requirements:

### Item Generation Methods:

**generateRandomJoker(): ShopItem**
- Returns ShopItem with type JOKER
- Joker is one of 15 defined types
- Cost = $5
- Random selection from:
  1. Joker (+4 mult)
  2. Greedy Joker (+3 mult per Diamond)
  3. Lusty Joker (+3 mult per Heart)
  4. Wrathful Joker (+3 mult per Spade)
  5. Gluttonous Joker (+3 mult per Club)
  6. Half Joker (+20 mult if ≤3 cards)
  7. Mystic Summit (+15 mult if 0 discards)
  8. Odd Todd (+31 chips per odd card)
  9. Even Steven (+30 chips per even card)
  10. Blue Joker (+2 chips per deck card)
  11. Triboulet (×2 mult per K/Q)
  12. Fibonacci (×8 mult if A,2,3,5,8)
  13. Joker Stencil (×2 mult if 1 card)
  14. Golden Joker (+$2 per level) [Economic]
  15. Hiker (+5 chips to each card) [Permanent Upgrade]

**generateRandomPlanet(): ShopItem**
- Returns ShopItem with type PLANET
- Planet is one of 9 types
- Cost = $3
- Random selection from:
  1. Pluto (High Card: +10 chips, +1 mult)
  2. Mercury (Pair: +15 chips, +1 mult)
  3. Uranus (Two Pair: +20 chips, +1 mult)
  4. Venus (Three of a Kind: +20 chips, +2 mult)
  5. Saturn (Straight: +30 chips, +3 mult)
  6. Jupiter (Flush: +15 chips, +2 mult)
  7. Earth (Full House: +25 chips, +2 mult)
  8. Mars (Four of a Kind: +30 chips, +3 mult)
  9. Neptune (Straight Flush: +40 chips, +4 mult)

**generateRandomTarot(): ShopItem**
- Returns ShopItem with type TAROT
- Tarot is one of 10 types
- Cost = $3
- Random selection from:
  1. The Hermit (double money) [Instant]
  2. The Empress (+4 mult to card) [Targeted]
  3. The Emperor (+20 chips to card) [Targeted]
  4. Strength (upgrade card value) [Targeted]
  5. The Hanged Man (destroy card) [Targeted]
  6. Death (duplicate card) [Targeted]
  7. The Star (change to Diamonds) [Targeted]
  8. The Moon (change to Hearts) [Targeted]
  9. The Sun (change to Spades) [Targeted]
  10. The World (change to Clubs) [Targeted]

**generateShopItems(count: number): ShopItem[]**
- Generates array of shop items
- Default count = 4
- Distribution: ~40% Jokers, ~30% Planets, ~30% Tarots
- Randomized order
- Each item is unique instance
- Validates count > 0

## Shop Class Requirements:

### Properties:
- **availableItems**: ShopItem[] (max 4 items)
- **rerollCost**: number (default $3)

### Constructor:
- Accepts optional reroll cost (default $3)
- Initializes empty availableItems array

### generateItems(count: number = 4): void**
- Calls ShopItemGenerator.generateShopItems(count)
- Replaces availableItems with new items
- Default count = 4

### purchaseItem(itemId: string, playerMoney: number): boolean**
- Finds item by ID
- Checks if playerMoney >= item.cost
- If affordable:
  - Removes item from availableItems
  - Returns true
- If not affordable:
  - Returns false, no change
- Throws error if item not found

### reroll(playerMoney: number): boolean**
- Checks if playerMoney >= rerollCost
- If affordable:
  - Calls generateItems(4)
  - Returns true
- If not affordable:
  - Returns false, no change

### getAvailableItems(): ShopItem[]**
- Returns copy of availableItems array
- Prevents external mutation

### getRerollCost(): number**
- Returns rerollCost value

## Distribution Requirements (generateShopItems):
- With 100 items generated:
  - ~35-45 Jokers (40% target)
  - ~25-35 Planets (30% target)
  - ~25-35 Tarots (30% target)
- Random but statistically balanced

## Edge Cases:
- Generate 0 items (throw error)
- Generate negative count (throw error)
- Purchase non-existent item (throw error)
- Purchase with exact cost (succeed)
- Purchase with $0 (fail)
- Reroll with exact cost (succeed)
- Reroll with insufficient funds (fail)
- Multiple rerolls generate different items
- All 15 jokers can be generated
- All 9 planets can be generated
- All 10 tarots can be generated
- Item costs correct ($5 jokers, $3 planets/tarots)

# TASK

Generate a complete unit test suite for Shop System that covers:

## 1. ShopItemType Enum Tests

- [ ] JOKER type defined
- [ ] PLANET type defined
- [ ] TAROT type defined
- [ ] All 3 types distinct

## 2. ShopItem Class Tests

### Constructor:
- [ ] Creates item with valid inputs
- [ ] Generates unique UUID for id
- [ ] Stores type correctly
- [ ] Stores item correctly
- [ ] Stores cost correctly
- [ ] Throws error on null item
- [ ] Throws error on cost ≤ 0
- [ ] Throws error on negative cost

### Getters:
- [ ] getId() returns id
- [ ] getType() returns type
- [ ] getItem() returns item
- [ ] getCost() returns cost

### ID Uniqueness:
- [ ] Two items with same data have different IDs
- [ ] ID is UUID format

## 3. ShopItemGenerator Class Tests

### generateRandomJoker():
- [ ] Returns ShopItem instance
- [ ] Type is JOKER
- [ ] Cost is $5
- [ ] Item is Joker instance
- [ ] Joker has valid name and description
- [ ] Can generate all 15 joker types (statistical test)
- [ ] Multiple calls generate different jokers (likely)

### generateRandomPlanet():
- [ ] Returns ShopItem instance
- [ ] Type is PLANET
- [ ] Cost is $3
- [ ] Item is Planet instance
- [ ] Planet has valid name and hand type
- [ ] Can generate all 9 planet types (statistical test)
- [ ] Multiple calls generate different planets (likely)

### generateRandomTarot():
- [ ] Returns ShopItem instance
- [ ] Type is TAROT
- [ ] Cost is $3
- [ ] Item is Tarot instance
- [ ] Tarot has valid name and effect
- [ ] Can generate all 10 tarot types (statistical test)
- [ ] Multiple calls generate different tarots (likely)

### generateShopItems():
- [ ] Generates correct count of items
- [ ] Default count is 4
- [ ] All items are unique instances
- [ ] All items have unique IDs
- [ ] Distribution: ~40% Jokers (statistical test)
- [ ] Distribution: ~30% Planets (statistical test)
- [ ] Distribution: ~30% Tarots (statistical test)
- [ ] Throws error on count ≤ 0
- [ ] Throws error on negative count
- [ ] Can generate 1 item
- [ ] Can generate 10 items

### Distribution Statistical Tests:
- [ ] Generate 100 items, verify ~40 jokers
- [ ] Generate 100 items, verify ~30 planets
- [ ] Generate 100 items, verify ~30 tarots
- [ ] All joker types appear in 500 generations
- [ ] All planet types appear in 300 generations
- [ ] All tarot types appear in 300 generations

## 4. Shop Class Tests

### Constructor:
- [ ] Initializes with empty availableItems
- [ ] Sets rerollCost to $3 by default
- [ ] Accepts custom reroll cost
- [ ] Stores reroll cost correctly

### generateItems():
- [ ] Generates 4 items by default
- [ ] Replaces existing items
- [ ] All items are ShopItem instances
- [ ] Items have correct types (JOKER, PLANET, TAROT)
- [ ] Items have correct costs
- [ ] Can generate custom count
- [ ] Throws error on count ≤ 0

### purchaseItem() - Success Cases:
- [ ] Returns true when affordable
- [ ] Removes item from availableItems
- [ ] availableItems length decreases by 1
- [ ] Works with exact cost
- [ ] Can purchase all items one by one

### purchaseItem() - Failure Cases:
- [ ] Returns false when insufficient funds
- [ ] Item remains in availableItems on failure
- [ ] No change to availableItems on failure
- [ ] Throws error on non-existent itemId
- [ ] Throws error on null/empty itemId

### reroll() - Success Cases:
- [ ] Returns true when affordable
- [ ] Generates new items
- [ ] Items are different from before (likely)
- [ ] availableItems length remains 4
- [ ] Works with exact cost ($3)

### reroll() - Failure Cases:
- [ ] Returns false when insufficient funds
- [ ] Items unchanged on failure
- [ ] availableItems same on failure

### getAvailableItems():
- [ ] Returns copy of items array
- [ ] Modifications to returned array don't affect shop
- [ ] Returns empty array initially
- [ ] Returns correct items after generation

### getRerollCost():
- [ ] Returns default $3
- [ ] Returns custom cost if provided

## 5. Integration Tests

### Complete Shop Lifecycle:
- [ ] Create shop
- [ ] Generate items
- [ ] Purchase item (success)
- [ ] Item removed
- [ ] Reroll shop
- [ ] New items generated
- [ ] Purchase another item
- [ ] Purchase with insufficient funds (failure)

### Item Type Verification:
- [ ] All generated jokers have correct cost ($5)
- [ ] All generated planets have correct cost ($3)
- [ ] All generated tarots have correct cost ($3)
- [ ] Joker items are Joker instances
- [ ] Planet items are Planet instances
- [ ] Tarot items are Tarot instances

### Multiple Shops:
- [ ] Two shops have different items
- [ ] Purchasing from one doesn't affect other
- [ ] Each shop maintains own state

## 6. Edge Cases

### Item Generation:
- [ ] Generate 1 item (minimum)
- [ ] Generate 10 items (more than typical)
- [ ] Generate 100 items for statistics

### Cost Boundaries:
- [ ] Purchase with money = cost (exact match)
- [ ] Purchase with money = cost - 1 (fail)
- [ ] Purchase with money = cost + 1 (succeed)
- [ ] Reroll with $3 exactly (succeed)
- [ ] Reroll with $2 (fail)

### Empty Shop:
- [ ] Purchase from empty shop throws error
- [ ] getAvailableItems on empty shop returns []
- [ ] Reroll empty shop generates items

### ID Collisions:
- [ ] 1000 items generated all have unique IDs
- [ ] No duplicate IDs within same shop

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  Shop, 
  ShopItem, 
  ShopItemGenerator, 
  ShopItemType 
} from '@/services/shop';
import { MultJoker } from '@/models/special-cards/jokers';
import { Planet } from '@/models/special-cards/planets';
import { TargetedTarot } from '@/models/special-cards/tarots';
import { HandType } from '@/models/poker';

describe('Shop System', () => {
  describe('ShopItemType Enum', () => {
    it('should define JOKER type', () => {
      // ASSERT
      expect(ShopItemType.JOKER).toBeDefined();
    });

    it('should define PLANET type', () => {
      // ASSERT
      expect(ShopItemType.PLANET).toBeDefined();
    });

    it('should define TAROT type', () => {
      // ASSERT
      expect(ShopItemType.TAROT).toBeDefined();
    });

    it('should have all types distinct', () => {
      // ASSERT
      expect(ShopItemType.JOKER).not.toBe(ShopItemType.PLANET);
      expect(ShopItemType.PLANET).not.toBe(ShopItemType.TAROT);
      expect(ShopItemType.TAROT).not.toBe(ShopItemType.JOKER);
    });
  });

  describe('ShopItem', () => {
    describe('constructor', () => {
      it('should create item with valid inputs', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        
        // ACT
        const item = new ShopItem(ShopItemType.JOKER, joker, 5);
        
        // ASSERT
        expect(item.getId()).toBeDefined();
        expect(item.getType()).toBe(ShopItemType.JOKER);
        expect(item.getItem()).toBe(joker);
        expect(item.getCost()).toBe(5);
      });

      it('should generate unique UUID for id', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        
        // ACT
        const item = new ShopItem(ShopItemType.JOKER, joker, 5);
        
        // ASSERT
        expect(item.getId()).toMatch(/^[0-9a-f-]{36}$/i);
      });

      it('should throw error on null item', () => {
        // ACT & ASSERT
        expect(() => new ShopItem(ShopItemType.JOKER, null as any, 5))
          .toThrow('Item cannot be null');
      });

      it('should throw error on cost ≤ 0', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        
        // ACT & ASSERT
        expect(() => new ShopItem(ShopItemType.JOKER, joker, 0))
          .toThrow('Cost must be positive');
      });

      it('should throw error on negative cost', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        
        // ACT & ASSERT
        expect(() => new ShopItem(ShopItemType.JOKER, joker, -5))
          .toThrow('Cost must be positive');
      });
    });

    describe('Getters', () => {
      let item: ShopItem;
      let joker: MultJoker;

      beforeEach(() => {
        joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        item = new ShopItem(ShopItemType.JOKER, joker, 5);
      });

      it('should return id', () => {
        // ACT
        const id = item.getId();
        
        // ASSERT
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
      });

      it('should return type', () => {
        // ACT
        const type = item.getType();
        
        // ASSERT
        expect(type).toBe(ShopItemType.JOKER);
      });

      it('should return item', () => {
        // ACT
        const retrievedItem = item.getItem();
        
        // ASSERT
        expect(retrievedItem).toBe(joker);
      });

      it('should return cost', () => {
        // ACT
        const cost = item.getCost();
        
        // ASSERT
        expect(cost).toBe(5);
      });
    });

    describe('ID Uniqueness', () => {
      it('should generate different IDs for items with same data', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        
        // ACT
        const item1 = new ShopItem(ShopItemType.JOKER, joker, 5);
        const item2 = new ShopItem(ShopItemType.JOKER, joker, 5);
        
        // ASSERT
        expect(item1.getId()).not.toBe(item2.getId());
      });
    });
  });

  describe('ShopItemGenerator', () => {
    let generator: ShopItemGenerator;

    beforeEach(() => {
      generator = new ShopItemGenerator();
    });

    describe('generateRandomJoker', () => {
      it('should return ShopItem instance', () => {
        // ACT
        const item = generator.generateRandomJoker();
        
        // ASSERT
        expect(item).toBeInstanceOf(ShopItem);
      });

      it('should have type JOKER', () => {
        // ACT
        const item = generator.generateRandomJoker();
        
        // ASSERT
        expect(item.getType()).toBe(ShopItemType.JOKER);
      });

      it('should have cost $5', () => {
        // ACT
        const item = generator.generateRandomJoker();
        
        // ASSERT
        expect(item.getCost()).toBe(5);
      });

      it('should contain Joker instance', () => {
        // ACT
        const item = generator.generateRandomJoker();
        const joker = item.getItem();
        
        // ASSERT
        expect(joker).toBeDefined();
        expect(joker.getName).toBeDefined();
        expect(joker.getDescription).toBeDefined();
      });

      it('should generate different jokers (statistical test)', () => {
        // ACT - Generate 50 jokers
        const jokers = new Set<string>();
        for (let i = 0; i < 50; i++) {
          const item = generator.generateRandomJoker();
          const joker = item.getItem() as any;
          jokers.add(joker.getName());
        }
        
        // ASSERT - Should have at least 5 different types
        expect(jokers.size).toBeGreaterThanOrEqual(5);
      });

      it('should generate all 15 joker types eventually (statistical test)', () => {
        // ACT - Generate 500 jokers
        const jokerTypes = new Set<string>();
        for (let i = 0; i < 500; i++) {
          const item = generator.generateRandomJoker();
          const joker = item.getItem() as any;
          jokerTypes.add(joker.getName());
        }
        
        // ASSERT - Should have seen most/all 15 types
        expect(jokerTypes.size).toBeGreaterThanOrEqual(12);
      });
    });

    describe('generateRandomPlanet', () => {
      it('should return ShopItem instance', () => {
        // ACT
        const item = generator.generateRandomPlanet();
        
        // ASSERT
        expect(item).toBeInstanceOf(ShopItem);
      });

      it('should have type PLANET', () => {
        // ACT
        const item = generator.generateRandomPlanet();
        
        // ASSERT
        expect(item.getType()).toBe(ShopItemType.PLANET);
      });

      it('should have cost $3', () => {
        // ACT
        const item = generator.generateRandomPlanet();
        
        // ASSERT
        expect(item.getCost()).toBe(3);
      });

      it('should contain Planet instance', () => {
        // ACT
        const item = generator.generateRandomPlanet();
        const planet = item.getItem() as Planet;
        
        // ASSERT
        expect(planet).toBeDefined();
        expect(planet.getName).toBeDefined();
        expect(planet.getHandType).toBeDefined();
      });

      it('should generate all 9 planet types eventually (statistical test)', () => {
        // ACT - Generate 300 planets
        const planetTypes = new Set<string>();
        for (let i = 0; i < 300; i++) {
          const item = generator.generateRandomPlanet();
          const planet = item.getItem() as Planet;
          planetTypes.add(planet.getName());
        }
        
        // ASSERT - Should have all 9 types
        expect(planetTypes.size).toBe(9);
      });
    });

    describe('generateRandomTarot', () => {
      it('should return ShopItem instance', () => {
        // ACT
        const item = generator.generateRandomTarot();
        
        // ASSERT
        expect(item).toBeInstanceOf(ShopItem);
      });

      it('should have type TAROT', () => {
        // ACT
        const item = generator.generateRandomTarot();
        
        // ASSERT
        expect(item.getType()).toBe(ShopItemType.TAROT);
      });

      it('should have cost $3', () => {
        // ACT
        const item = generator.generateRandomTarot();
        
        // ASSERT
        expect(item.getCost()).toBe(3);
      });

      it('should contain Tarot instance', () => {
        // ACT
        const item = generator.generateRandomTarot();
        const tarot = item.getItem() as any;
        
        // ASSERT
        expect(tarot).toBeDefined();
        expect(tarot.getName).toBeDefined();
        expect(tarot.requiresTarget).toBeDefined();
      });

      it('should generate all 10 tarot types eventually (statistical test)', () => {
        // ACT - Generate 300 tarots
        const tarotTypes = new Set<string>();
        for (let i = 0; i < 300; i++) {
          const item = generator.generateRandomTarot();
          const tarot = item.getItem() as any;
          tarotTypes.add(tarot.getName());
        }
        
        // ASSERT - Should have all 10 types
        expect(tarotTypes.size).toBe(10);
      });
    });

    describe('generateShopItems', () => {
      it('should generate correct count of items', () => {
        // ACT
        const items = generator.generateShopItems(4);
        
        // ASSERT
        expect(items).toHaveLength(4);
      });

      it('should use default count of 4', () => {
        // ACT
        const items = generator.generateShopItems();
        
        // ASSERT
        expect(items).toHaveLength(4);
      });

      it('should generate all unique item instances', () => {
        // ACT
        const items = generator.generateShopItems(10);
        
        // ASSERT
        const ids = items.map(item => item.getId());
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(10);
      });

      it('should have distribution of ~40% jokers (statistical test)', () => {
        // ACT - Generate 100 items
        const items = generator.generateShopItems(100);
        
        // ASSERT
        const jokerCount = items.filter(i => i.getType() === ShopItemType.JOKER).length;
        expect(jokerCount).toBeGreaterThan(30); // At least 30%
        expect(jokerCount).toBeLessThan(50);     // At most 50%
      });

      it('should have distribution of ~30% planets (statistical test)', () => {
        // ACT - Generate 100 items
        const items = generator.generateShopItems(100);
        
        // ASSERT
        const planetCount = items.filter(i => i.getType() === ShopItemType.PLANET).length;
        expect(planetCount).toBeGreaterThan(20); // At least 20%
        expect(planetCount).toBeLessThan(40);     // At most 40%
      });

      it('should have distribution of ~30% tarots (statistical test)', () => {
        // ACT - Generate 100 items
        const items = generator.generateShopItems(100);
        
        // ASSERT
        const tarotCount = items.filter(i => i.getType() === ShopItemType.TAROT).length;
        expect(tarotCount).toBeGreaterThan(20); // At least 20%
        expect(tarotCount).toBeLessThan(40);     // At most 40%
      });

      it('should throw error on count ≤ 0', () => {
        // ACT & ASSERT
        expect(() => generator.generateShopItems(0))
          .toThrow('Count must be positive');
      });

      it('should throw error on negative count', () => {
        // ACT & ASSERT
        expect(() => generator.generateShopItems(-5))
          .toThrow('Count must be positive');
      });

      it('should generate 1 item minimum', () => {
        // ACT
        const items = generator.generateShopItems(1);
        
        // ASSERT
        expect(items).toHaveLength(1);
      });

      it('should generate large counts correctly', () => {
        // ACT
        const items = generator.generateShopItems(20);
        
        // ASSERT
        expect(items).toHaveLength(20);
      });
    });
  });

  describe('Shop', () => {
    let shop: Shop;

    beforeEach(() => {
      shop = new Shop();
    });

    describe('constructor', () => {
      it('should initialize with empty availableItems', () => {
        // ASSERT
        expect(shop.getAvailableItems()).toHaveLength(0);
      });

      it('should set default reroll cost to $3', () => {
        // ASSERT
        expect(shop.getRerollCost()).toBe(3);
      });

      it('should accept custom reroll cost', () => {
        // ACT
        const customShop = new Shop(5);
        
        // ASSERT
        expect(customShop.getRerollCost()).toBe(5);
      });
    });

    describe('generateItems', () => {
      it('should generate 4 items by default', () => {
        // ACT
        shop.generateItems();
        
        // ASSERT
        expect(shop.getAvailableItems()).toHaveLength(4);
      });

      it('should replace existing items', () => {
        // ARRANGE
        shop.generateItems();
        const firstItems = shop.getAvailableItems().map(i => i.getId());
        
        // ACT
        shop.generateItems();
        const secondItems = shop.getAvailableItems().map(i => i.getId());
        
        // ASSERT
        expect(secondItems).not.toEqual(firstItems);
      });

      it('should generate all ShopItem instances', () => {
        // ACT
        shop.generateItems();
        
        // ASSERT
        shop.getAvailableItems().forEach(item => {
          expect(item).toBeInstanceOf(ShopItem);
        });
      });

      it('should generate items with correct costs', () => {
        // ACT
        shop.generateItems();
        
        // ASSERT
        shop.getAvailableItems().forEach(item => {
          if (item.getType() === ShopItemType.JOKER) {
            expect(item.getCost()).toBe(5);
          } else {
            expect(item.getCost()).toBe(3);
          }
        });
      });

      it('should accept custom count', () => {
        // ACT
        shop.generateItems(10);
        
        // ASSERT
        expect(shop.getAvailableItems()).toHaveLength(10);
      });
    });

    describe('purchaseItem', () => {
      beforeEach(() => {
        shop.generateItems();
      });

      it('should return true when affordable', () => {
        // ARRANGE
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const playerMoney = 10; // Enough for any item
        
        // ACT
        const result = shop.purchaseItem(itemId, playerMoney);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should remove item from availableItems', () => {
        // ARRANGE
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const initialLength = items.length;
        
        // ACT
        shop.purchaseItem(itemId, 10);
        
        // ASSERT
        expect(shop.getAvailableItems()).toHaveLength(initialLength - 1);
        expect(shop.getAvailableItems().find(i => i.getId() === itemId)).toBeUndefined();
      });

      it('should work with exact cost', () => {
        // ARRANGE
        const items = shop.getAvailableItems();
        const item = items.find(i => i.getType() === ShopItemType.PLANET)!; // $3
        const exactCost = item.getCost();
        
        // ACT
        const result = shop.purchaseItem(item.getId(), exactCost);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return false when insufficient funds', () => {
        // ARRANGE
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const insufficientMoney = 0;
        
        // ACT
        const result = shop.purchaseItem(itemId, insufficientMoney);
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should not remove item on failure', () => {
        // ARRANGE
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const initialLength = items.length;
        
        // ACT
        shop.purchaseItem(itemId, 0); // Insufficient funds
        
        // ASSERT
        expect(shop.getAvailableItems()).toHaveLength(initialLength);
      });

      it('should throw error on non-existent itemId', () => {
        // ACT & ASSERT
        expect(() => shop.purchaseItem('invalid-id', 10))
          .toThrow('Item not found');
      });

      it('should throw error on null itemId', () => {
        // ACT & ASSERT
        expect(() => shop.purchaseItem(null as any, 10))
          .toThrow('Item ID cannot be null');
      });

      it('should allow purchasing all items one by one', () => {
        // ARRANGE
        const items = [...shop.getAvailableItems()];
        
        // ACT & ASSERT
        items.forEach(item => {
          const result = shop.purchaseItem(item.getId(), 10);
          expect(result).toBe(true);
        });
        
        expect(shop.getAvailableItems()).toHaveLength(0);
      });
    });

    describe('reroll', () => {
      beforeEach(() => {
        shop.generateItems();
      });

      it('should return true when affordable', () => {
        // ARRANGE
        const playerMoney = 5; // More than $3
        
        // ACT
        const result = shop.reroll(playerMoney);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should generate new items', () => {
        // ARRANGE
        const itemsBefore = shop.getAvailableItems().map(i => i.getId());
        
        // ACT
        shop.reroll(5);
        
        // ASSERT
        const itemsAfter = shop.getAvailableItems().map(i => i.getId());
        expect(itemsAfter).not.toEqual(itemsBefore);
      });

      it('should maintain 4 items after reroll', () => {
        // ACT
        shop.reroll(5);
        
        // ASSERT
        expect(shop.getAvailableItems()).toHaveLength(4);
      });

      it('should work with exact cost', () => {
        // ARRANGE
        const exactCost = shop.getRerollCost(); // $3
        
        // ACT
        const result = shop.reroll(exactCost);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return false when insufficient funds', () => {
        // ARRANGE
        const insufficientMoney = 2; // Less than $3
        
        // ACT
        const result = shop.reroll(insufficientMoney);
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should not change items on failure', () => {
        // ARRANGE
        const itemsBefore = shop.getAvailableItems().map(i => i.getId());
        
        // ACT
        shop.reroll(0); // Insufficient funds
        
        // ASSERT
        const itemsAfter = shop.getAvailableItems().map(i => i.getId());
        expect(itemsAfter).toEqual(itemsBefore);
      });
    });

    describe('getAvailableItems', () => {
      it('should return copy of items array', () => {
        // ARRANGE
        shop.generateItems();
        
        // ACT
        const items1 = shop.getAvailableItems();
        const items2 = shop.getAvailableItems();
        
        // Modify one copy
        items1.pop();
        
        // ASSERT
        expect(items1.length).not.toBe(items2.length);
      });

      it('should return empty array initially', () => {
        // ACT
        const items = shop.getAvailableItems();
        
        // ASSERT
        expect(items).toHaveLength(0);
      });

      it('should return correct items after generation', () => {
        // ACT
        shop.generateItems();
        const items = shop.getAvailableItems();
        
        // ASSERT
        expect(items).toHaveLength(4);
        items.forEach(item => {
          expect(item).toBeInstanceOf(ShopItem);
        });
      });
    });

    describe('getRerollCost', () => {
      it('should return default $3', () => {
        // ACT
        const cost = shop.getRerollCost();
        
        // ASSERT
        expect(cost).toBe(3);
      });

      it('should return custom cost', () => {
        // ARRANGE
        const customShop = new Shop(7);
        
        // ACT
        const cost = customShop.getRerollCost();
        
        // ASSERT
        expect(cost).toBe(7);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should complete full shop lifecycle', () => {
      // ARRANGE
      const shop = new Shop();
      
      // ACT & ASSERT - Generate items
      shop.generateItems();
      expect(shop.getAvailableItems()).toHaveLength(4);
      
      // Purchase first item
      const items = shop.getAvailableItems();
      const firstItemId = items[0].getId();
      const purchased = shop.purchaseItem(firstItemId, 10);
      expect(purchased).toBe(true);
      expect(shop.getAvailableItems()).toHaveLength(3);
      
      // Reroll shop
      const rerolled = shop.reroll(5);
      expect(rerolled).toBe(true);
      expect(shop.getAvailableItems()).toHaveLength(4);
      
      // Purchase with insufficient funds
      const newItems = shop.getAvailableItems();
      const failedPurchase = shop.purchaseItem(newItems[0].getId(), 0);
      expect(failedPurchase).toBe(false);
      expect(shop.getAvailableItems()).toHaveLength(4); // No change
    });

    it('should verify all item types have correct costs', () => {
      // ARRANGE
      const generator = new ShopItemGenerator();
      
      // ACT
      const items = generator.generateShopItems(20);
      
      // ASSERT
      items.forEach(item => {
        if (item.getType() === ShopItemType.JOKER) {
          expect(item.getCost()).toBe(5);
        } else if (item.getType() === ShopItemType.PLANET) {
          expect(item.getCost()).toBe(3);
        } else if (item.getType() === ShopItemType.TAROT) {
          expect(item.getCost()).toBe(3);
        }
      });
    });

    it('should maintain independence between multiple shops', () => {
      // ARRANGE
      const shop1 = new Shop();
      const shop2 = new Shop();
      
      // ACT
      shop1.generateItems();
      shop2.generateItems();
      
      const items1 = shop1.getAvailableItems();
      const items2 = shop2.getAvailableItems();
      
      shop1.purchaseItem(items1[0].getId(), 10);
      
      // ASSERT
      expect(shop1.getAvailableItems()).toHaveLength(3);
      expect(shop2.getAvailableItems()).toHaveLength(4); // Unaffected
    });
  });

  describe('Edge Cases', () => {
    it('should handle purchase with exact cost', () => {
      // ARRANGE
      const shop = new Shop();
      shop.generateItems();
      const items = shop.getAvailableItems();
      const planetItem = items.find(i => i.getType() === ShopItemType.PLANET)!;
      
      // ACT
      const result = shop.purchaseItem(planetItem.getId(), 3); // Exact cost
      
      // ASSERT
      expect(result).toBe(true);
    });

    it('should handle reroll with exact cost', () => {
      // ARRANGE
      const shop = new Shop();
      shop.generateItems();
      
      // ACT
      const result = shop.reroll(3); // Exact cost
      
      // ASSERT
      expect(result).toBe(true);
    });

    it('should generate 1000 items with unique IDs', () => {
      // ARRANGE
      const generator = new ShopItemGenerator();
      
      // ACT
      const items = generator.generateShopItems(1000);
      
      // ASSERT
      const ids = items.map(i => i.getId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(1000);
    });

    it('should handle empty shop purchase attempt', () => {
      // ARRANGE
      const shop = new Shop();
      // Don't generate items
      
      // ACT & ASSERT
      expect(() => shop.purchaseItem('any-id', 10))
        .toThrow('Item not found');
    });

    it('should reroll empty shop successfully', () => {
      // ARRANGE
      const shop = new Shop();
      // Don't generate items initially
      
      // ACT
      const result = shop.reroll(5);
      
      // ASSERT
      expect(result).toBe(true);
      expect(shop.getAvailableItems()).toHaveLength(4);
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for all shop components
- ShopItemType enum tested
- ShopItem class fully covered
- ShopItemGenerator with statistical distribution tests
- Shop class with complete lifecycle
- Integration tests for full shop flow

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| ShopItemType | Enum values | 3 | 1 | 0 | 4 |
| ShopItem | constructor | 1 | 1 | 3 | 5 |
| ShopItem | Getters | 4 | 0 | 0 | 4 |
| ShopItem | ID uniqueness | 1 | 0 | 0 | 1 |
| ShopItemGenerator | generateRandomJoker | 4 | 2 | 0 | 6 |
| ShopItemGenerator | generateRandomPlanet | 4 | 1 | 0 | 5 |
| ShopItemGenerator | generateRandomTarot | 4 | 1 | 0 | 5 |
| ShopItemGenerator | generateShopItems | 5 | 4 | 2 | 11 |
| Shop | constructor | 3 | 0 | 0 | 3 |
| Shop | generateItems | 5 | 1 | 0 | 6 |
| Shop | purchaseItem | 6 | 0 | 2 | 8 |
| Shop | reroll | 6 | 0 | 0 | 6 |
| Shop | getAvailableItems | 3 | 0 | 0 | 3 |
| Shop | getRerollCost | 2 | 0 | 0 | 2 |
| Integration | Full lifecycle | 3 | 0 | 0 | 3 |
| Edge Cases | Boundaries | 5 | 0 | 0 | 5 |
| **TOTAL** | | | | | **77** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **90%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios:
  - Some randomization internals (covered via statistical tests)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/services/shop.test.ts

# Run with coverage
npm test -- --coverage tests/unit/services/shop.test.ts

# Run in watch mode
npm test -- --watch tests/unit/services/shop.test.ts

# Run specific sections
npm test -- -t "ShopItemGenerator" tests/unit/services/shop.test.ts
npm test -- -t "Distribution" tests/unit/services/shop.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Distribution randomness:** Statistical tests verify ~40% jokers, ~30% planets, ~30% tarots
- **Cost consistency:** All jokers $5, all planets/tarots $3
- **ID uniqueness:** Every shop item has unique UUID
- **Immutability:** getAvailableItems returns copy to prevent external mutation
- **Reroll mechanics:** Generates completely new items, doesn't just shuffle
- **Purchase validation:** Item must exist and be affordable
- **All item types:** Over many generations, all 15 jokers, 9 planets, 10 tarots appear
- **Empty shop:** Can reroll empty shop to generate initial items

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to count item types in array
function countItemTypes(items: ShopItem[]): {
  jokers: number;
  planets: number;
  tarots: number;
} {
  return {
    jokers: items.filter(i => i.getType() === ShopItemType.JOKER).length,
    planets: items.filter(i => i.getType() === ShopItemType.PLANET).length,
    tarots: items.filter(i => i.getType() === ShopItemType.TAROT).length
  };
}

// Helper to verify distribution is within expected range
function verifyDistribution(
  items: ShopItem[],
  expectedJokerPercent: number = 40,
  tolerance: number = 10
): void {
  const counts = countItemTypes(items);
  const total = items.length;
  
  const jokerPercent = (counts.jokers / total) * 100;
  const planetPercent = (counts.planets / total) * 100;
  const tarotPercent = (counts.tarots / total) * 100;
  
  expect(jokerPercent).toBeGreaterThan(expectedJokerPercent - tolerance);
  expect(jokerPercent).toBeLessThan(expectedJokerPercent + tolerance);
  expect(planetPercent).toBeGreaterThan(30 - tolerance);
  expect(planetPercent).toBeLessThan(30 + tolerance);
  expect(tarotPercent).toBeGreaterThan(30 - tolerance);
  expect(tarotPercent).toBeLessThan(30 + tolerance);
}

// Helper to collect unique item names
function collectUniqueNames(items: ShopItem[]): Set<string> {
  return new Set(items.map(item => {
    const actualItem = item.getItem() as any;
    return actualItem.getName();
  }));
}
```
```

---

**This is Test Prompt 10 of 16. Shop system is complete!**

**Progress: 10/16 prompts complete (62.5%!)**

**Completed:**
1. ✅ models/core.test.ts
2. ✅ models/poker.test.ts
3. ✅ models/scoring.test.ts
4. ✅ models/jokers.test.ts
5. ✅ models/planets.test.ts
6. ✅ models/tarots.test.ts
7. ✅ models/blinds.test.ts
8. ✅ models/game-state.test.ts
9. ✅ controllers/game-controller.test.ts
10. ✅ services/shop.test.ts ← **Just completed!**

**Next up (Services & Utils):**
11. ❌ services/persistence.test.ts
12. ❌ services/config.test.ts
13. ❌ utils/constants.test.ts
14. ❌ utils/helpers.test.ts
15. ❌ utils/apply-theme.test.ts
16. ❌ integration/game-flow.test.ts

**Should I continue with Prompt 11: services/persistence.test.ts?**