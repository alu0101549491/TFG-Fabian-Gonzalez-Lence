// ============================================
// FILE: src/services/config/balancing-config.ts
// ============================================

import { CardValue } from '../../models/core/card-value.enum';
import { HandType } from '../../models/poker/hand-type.enum';
import { BossType } from '../../models/blinds/boss-type.enum';
import { TarotEffect } from '../../models/special-cards/tarots/tarot-effect.enum';

/**
 * Loads and manages balancing data from JSON configuration.
 * Provides access to all card, hand, and item definitions.
 */
export class BalancingConfig {
  private handValues: Map<HandType, { chips: number; mult: number }>;
  private cardValues: Map<CardValue, number>;
  private jokerDefinitions: any[];
  private planetDefinitions: any[];
  private tarotDefinitions: any[];
  private blindTargets: any[];

  /**
   * Initializes balancing config and loads data.
   */
  constructor() {
    this.handValues = new Map();
    this.cardValues = new Map();
    this.jokerDefinitions = [];
    this.planetDefinitions = [];
    this.tarotDefinitions = [];
    this.blindTargets = [];

    this.loadFromJSON();
  }

  /**
   * Loads all configuration from JSON data.
   */
  public loadFromJSON(): void {
    // In a real implementation, this would load from actual JSON files
    // For now, we'll use hardcoded data that matches the requirements

    // Load hand values
    this.handValues.set(HandType.HIGH_CARD, { chips: 5, mult: 1 });
    this.handValues.set(HandType.PAIR, { chips: 10, mult: 2 });
    this.handValues.set(HandType.TWO_PAIR, { chips: 20, mult: 2 });
    this.handValues.set(HandType.THREE_OF_A_KIND, { chips: 30, mult: 3 });
    this.handValues.set(HandType.STRAIGHT, { chips: 30, mult: 4 });
    this.handValues.set(HandType.FLUSH, { chips: 35, mult: 4 });
    this.handValues.set(HandType.FULL_HOUSE, { chips: 40, mult: 4 });
    this.handValues.set(HandType.FOUR_OF_A_KIND, { chips: 60, mult: 7 });
    this.handValues.set(HandType.STRAIGHT_FLUSH, { chips: 100, mult: 8 });

    // Load card values
    this.cardValues.set(CardValue.ACE, 11);
    this.cardValues.set(CardValue.KING, 10);
    this.cardValues.set(CardValue.QUEEN, 10);
    this.cardValues.set(CardValue.JACK, 10);
    this.cardValues.set(CardValue.TEN, 10);
    this.cardValues.set(CardValue.NINE, 9);
    this.cardValues.set(CardValue.EIGHT, 8);
    this.cardValues.set(CardValue.SEVEN, 7);
    this.cardValues.set(CardValue.SIX, 6);
    this.cardValues.set(CardValue.FIVE, 5);
    this.cardValues.set(CardValue.FOUR, 4);
    this.cardValues.set(CardValue.THREE, 3);
    this.cardValues.set(CardValue.TWO, 2);

    // Load joker definitions
    this.jokerDefinitions = [
      {
        id: 'joker',
        name: 'Joker',
        description: '+4 mult',
        type: 'mult',
        value: 4,
        condition: 'always'
      },
      {
        id: 'greedyJoker',
        name: 'Greedy Joker',
        description: '+3 mult per Diamond card played',
        type: 'mult',
        value: 3,
        condition: 'perDiamond'
      },
      // Add more joker definitions here...
    ];

    // Load planet definitions
    this.planetDefinitions = [
      {
        id: 'pluto',
        name: 'Pluto',
        description: '+10 chips, +1 mult for High Card',
        targetHandType: HandType.HIGH_CARD,
        chipsBonus: 10,
        multBonus: 1
      },
      {
        id: 'mercury',
        name: 'Mercury',
        description: '+15 chips, +1 mult for Pair',
        targetHandType: HandType.PAIR,
        chipsBonus: 15,
        multBonus: 1
      },
      // Add more planet definitions here...
    ];

    // Load tarot definitions
    this.tarotDefinitions = [
      {
        id: 'theEmpress',
        name: 'The Empress',
        description: 'Choose a card to grant +4 mult when played',
        effectType: TarotEffect.ADD_MULT,
        effectValue: 4
      },
      {
        id: 'theEmperor',
        name: 'The Emperor',
        description: 'Choose a card to grant +20 chips when played',
        effectType: TarotEffect.ADD_CHIPS,
        effectValue: 20
      },
      // Add more tarot definitions here...
    ];

    // Load blind targets
    this.blindTargets = [
      {
        round: 1,
        small: 300,
        big: 450,
        boss: 600
      },
      {
        round: 2,
        small: 450,
        big: 675,
        boss: 900
      },
      // Add more rounds here...
    ];
  }

  /**
   * Returns base values for hand type.
   * @param handType - HandType enum
   * @returns Object with chips and mult
   * @throws Error if handType not found
   */
  public getHandValue(handType: HandType): { chips: number; mult: number } {
    const value = this.handValues.get(handType);
    if (!value) {
      throw new Error(`Hand type not found: ${handType}`);
    }
    return value;
  }

  /**
   * Returns chip value for card value.
   * @param cardValue - CardValue enum
   * @returns Chip value
   * @throws Error if cardValue not found
   */
  public getCardValue(cardValue: CardValue): number {
    const value = this.cardValues.get(cardValue);
    if (value === undefined) {
      throw new Error(`Card value not found: ${cardValue}`);
    }
    return value;
  }

  /**
   * Returns complete definition for joker.
   * @param jokerId - Joker ID
   * @returns Joker definition object
   * @throws Error if jokerId not found
   */
  public getJokerDefinition(jokerId: string): any {
    const definition = this.jokerDefinitions.find(j => j.id === jokerId);
    if (!definition) {
      throw new Error(`Joker definition not found: ${jokerId}`);
    }
    return definition;
  }

  /**
   * Returns complete definition for planet.
   * @param planetId - Planet ID
   * @returns Planet definition object
   * @throws Error if planetId not found
   */
  public getPlanetDefinition(planetId: string): any {
    const definition = this.planetDefinitions.find(p => p.id === planetId);
    if (!definition) {
      throw new Error(`Planet definition not found: ${planetId}`);
    }
    return definition;
  }

  /**
   * Returns complete definition for tarot.
   * @param tarotId - Tarot ID
   * @returns Tarot definition object
   * @throws Error if tarotId not found
   */
  public getTarotDefinition(tarotId: string): any {
    const definition = this.tarotDefinitions.find(t => t.id === tarotId);
    if (!definition) {
      throw new Error(`Tarot definition not found: ${tarotId}`);
    }
    return definition;
  }

  /**
   * Returns list of all joker IDs.
   * @returns Array of joker IDs
   */
  public getAllJokerIds(): string[] {
    return this.jokerDefinitions.map(j => j.id);
  }

  /**
   * Returns list of all planet IDs.
   * @returns Array of planet IDs
   */
  public getAllPlanetIds(): string[] {
    return this.planetDefinitions.map(p => p.id);
  }

  /**
   * Returns list of all tarot IDs.
   * @returns Array of tarot IDs
   */
  public getAllTarotIds(): string[] {
    return this.tarotDefinitions.map(t => t.id);
  }
}