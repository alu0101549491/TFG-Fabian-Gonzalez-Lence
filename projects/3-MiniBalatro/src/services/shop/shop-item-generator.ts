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
import { ChipJoker } from '../../models/special-cards/jokers/chip-joker';
import { MultJoker } from '../../models/special-cards/jokers/mult-joker';
import { MultiplierJoker } from '../../models/special-cards/jokers/multiplier-joker';
import { EconomicJoker } from '../../models/special-cards/jokers/economic-joker';
import { PermanentUpgradeJoker } from '../../models/special-cards/jokers/permanent-upgrade-joker';
import { InstantTarot } from '../../models/special-cards/tarots/instant-tarot';
import { TargetedTarot } from '../../models/special-cards/tarots/targeted-tarot';
import { TarotEffect } from '../../models/special-cards/tarots/tarot-effect.enum';
import { ScoreContext } from '../../models/scoring/score-context';
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

  /**
   * Creates a shop item generator with balancing configuration.
   */
  constructor() {
    this.balancingConfig = new BalancingConfig();
    // Store the initialization promise so we can await it
    this.initPromise = this.balancingConfig.initializeAsync();
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
      planetDef.multBonus || 1
    );
  }

  /**
   * Creates a specific joker by ID.
   * @param jokerId - ID of the joker to create
   * @returns Joker instance
   * @throws Error if joker ID not found
   */
  public generateJokerById(jokerId: string): Joker {
    const jokerDef = this.balancingConfig.getJokerDefinition(jokerId);
    if (!jokerDef) {
      throw new Error(`Joker definition not found for ID: ${jokerId}`);
    }

    // Build condition and multiplier functions based on the condition string
    const { conditionFn, multiplierFn } = this.buildJokerConditionAndMultiplier(jokerDef.condition);

    // Create the appropriate joker type based on the "type" field
    switch (jokerDef.type) {
      case 'chips':
        return new ChipJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Increases chips',
          jokerDef.value || 5,
          conditionFn,
          multiplierFn  // Pass multiplier function for per-card conditions
        );
      
      case 'mult':
        return new MultJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Increases mult',
          jokerDef.value || 4,
          conditionFn,
          multiplierFn  // Pass multiplier function for per-card conditions
        );
      
      case 'multiplier':
        return new MultiplierJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Multiplies mult',
          jokerDef.value || 2,
          conditionFn,
          multiplierFn  // Pass multiplier function for dynamic multipliers
        );
      
      case 'economic':
        // Economic jokers provide monetary benefits, not scoring effects
        return new EconomicJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Provides economic benefit',
          jokerDef.value || 0
        );
      
      case 'permanentUpgrade':
        // Permanent upgrade jokers modify cards after they're played
        return new PermanentUpgradeJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Permanently upgrades played cards',
          jokerDef.value || 5,  // chipBonus
          0  // multBonus (could be made configurable later)
        );
      
      default:
        // Default to ChipJoker if type is unknown
        console.warn(`Unknown joker type "${jokerDef.type}" for ${jokerId}, defaulting to ChipJoker`);
        return new ChipJoker(
          jokerId,
          jokerDef.name,
          jokerDef.description || 'Increases your score',
          jokerDef.value || 5,
          conditionFn
        );
    }
  }

  /**
   * Builds condition and multiplier functions based on the condition string from JSON.
   * @param condition - Condition string from joker definition
   * @returns Object with conditionFn and multiplierFn
   */
  private buildJokerConditionAndMultiplier(condition: string): {
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
            // The Hermit: Doubles player's current money
            gameState.addMoney(gameState.getMoney());
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
            gameState.addMoney(gameState.getMoney());
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
      // Randomly select item type with weighted distribution
      // 40% Joker, 30% Planet, 30% Tarot
      const random = Math.random();
      let type: ShopItemType;
      let item: Joker | Planet | Tarot;

      if (random < 0.4) {
        type = ShopItemType.JOKER;
        item = this.generateUniqueJoker(usedJokerIds);
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
}