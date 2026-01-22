// ============================================
// FILE: src/services/config/balancing-config.ts
// ============================================

import { CardValue } from '../../models/core/card-value.enum';
import { HandType } from '../../models/poker/hand-type.enum';
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
  // Note: blindTargets is reserved for future use if manual score targets are needed
  // Currently blinds calculate their own targets using formulas
  // private blindTargets: any[];

  // Mapping from JSON hand type names to HandType enum
  private static handTypeMapping: Record<string, HandType> = {
    'highCard': HandType.HIGH_CARD,
    'pair': HandType.PAIR,
    'twoPair': HandType.TWO_PAIR,
    'threeOfAKind': HandType.THREE_OF_A_KIND,
    'straight': HandType.STRAIGHT,
    'flush': HandType.FLUSH,
    'fullHouse': HandType.FULL_HOUSE,
    'fourOfAKind': HandType.FOUR_OF_A_KIND,
    'straightFlush': HandType.STRAIGHT_FLUSH
  };

  // Mapping from JSON effect types to TarotEffect enum
  private static tarotEffectMapping: Record<string, TarotEffect> = {
    'addMult': TarotEffect.ADD_MULT,
    'addChips': TarotEffect.ADD_CHIPS,
    'changeSuit': TarotEffect.CHANGE_SUIT,
    'upgradeValue': TarotEffect.UPGRADE_VALUE,
    'duplicate': TarotEffect.DUPLICATE,
    'destroy': TarotEffect.DESTROY
  };

  /**
   * Initializes balancing config with fallback data.
   * Call initializeAsync() to load from JSON files.
   */
  constructor() {
    this.handValues = new Map();
    this.cardValues = new Map();
    this.jokerDefinitions = [];
    this.planetDefinitions = [];
    this.tarotDefinitions = [];

    // Load fallback data immediately
    this.loadFallbackData();
  }

  /**
   * Asynchronously loads configuration from JSON files.
   * Should be called after construction to override fallback data.
   * @returns Promise that resolves when loading is complete
   */
  public async initializeAsync(): Promise<void> {
    try {
      // Load hand values
      await this.loadHandValues();
      
      // Load jokers
      await this.loadJokers();
      
      // Load planets
      await this.loadPlanets();
      
      // Load tarots
      await this.loadTarots();
      
      console.log('Balancing configuration loaded successfully from JSON');
    } catch (error) {
      console.error('Failed to load balancing configuration from JSON, using fallback data:', error);
    }
  }

  /**
   * Loads all configuration from JSON data.
   * @deprecated Use initializeAsync() instead
   */
  public async loadFromJSON(): Promise<void> {
    return this.initializeAsync();
  }

  /**
   * Loads hand values from JSON file.
   */
  private async loadHandValues(): Promise<void> {
    try {
      const response = await fetch('/data/hand-values.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Map JSON hand type names to HandType enum
      for (const [key, value] of Object.entries(data)) {
        const handType = BalancingConfig.handTypeMapping[key];
        if (handType) {
          this.handValues.set(handType, value as { chips: number; mult: number });
        }
      }
    } catch (error) {
      console.warn('Failed to load hand values from JSON, using defaults:', error);
      this.loadDefaultHandValues();
    }
  }

  /**
   * Loads joker definitions from JSON file.
   */
  private async loadJokers(): Promise<void> {
    try {
      const response = await fetch('/data/jokers.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.jokerDefinitions = data.jokers || [];
    } catch (error) {
      console.warn('Failed to load jokers from JSON, using defaults:', error);
      this.loadDefaultJokers();
    }
  }

  /**
   * Loads planet definitions from JSON file.
   */
  private async loadPlanets(): Promise<void> {
    try {
      const response = await fetch('/data/planets.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Map JSON hand type names to HandType enum in planet definitions
      this.planetDefinitions = (data.planets || []).map((planet: any) => ({
        ...planet,
        targetHandType: BalancingConfig.handTypeMapping[planet.targetHandType] || planet.targetHandType
      }));
    } catch (error) {
      console.warn('Failed to load planets from JSON, using defaults:', error);
      this.loadDefaultPlanets();
    }
  }

  /**
   * Loads tarot definitions from JSON file.
   */
  private async loadTarots(): Promise<void> {
    try {
      const response = await fetch('/data/tarots.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Map JSON effect types to TarotEffect enum
      this.tarotDefinitions = (data.tarots || []).map((tarot: any) => ({
        ...tarot,
        effectType: tarot.effectType === 'instant' 
          ? 'instant' 
          : BalancingConfig.tarotEffectMapping[tarot.effectType] || tarot.effectType
      }));
    } catch (error) {
      console.warn('Failed to load tarots from JSON, using defaults:', error);
      this.loadDefaultTarots();
    }
  }

  /**
   * Loads card values (standard poker values).
   */
  private loadCardValues(): void {
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
  }

  /**
   * Loads default hand values as fallback.
   */
  private loadDefaultHandValues(): void {
    this.handValues.set(HandType.HIGH_CARD, { chips: 5, mult: 1 });
    this.handValues.set(HandType.PAIR, { chips: 10, mult: 2 });
    this.handValues.set(HandType.TWO_PAIR, { chips: 20, mult: 2 });
    this.handValues.set(HandType.THREE_OF_A_KIND, { chips: 30, mult: 3 });
    this.handValues.set(HandType.STRAIGHT, { chips: 30, mult: 4 });
    this.handValues.set(HandType.FLUSH, { chips: 35, mult: 4 });
    this.handValues.set(HandType.FULL_HOUSE, { chips: 40, mult: 4 });
    this.handValues.set(HandType.FOUR_OF_A_KIND, { chips: 60, mult: 7 });
    this.handValues.set(HandType.STRAIGHT_FLUSH, { chips: 100, mult: 8 });
  }

  /**
   * Loads default joker definitions as fallback.
   */
  private loadDefaultJokers(): void {
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
      }
    ];
  }

  /**
   * Loads default planet definitions as fallback.
   */
  private loadDefaultPlanets(): void {
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
      }
    ];
  }

  /**
   * Loads default tarot definitions as fallback.
   */
  private loadDefaultTarots(): void {
    this.tarotDefinitions = [
      {
        id: 'theEmpress',
        name: 'The Empress',
        description: 'Choose a card to grant +4 mult when played',
        effectType: TarotEffect.ADD_MULT,
        effectValue: 4,
        targetRequired: true
      },
      {
        id: 'theEmperor',
        name: 'The Emperor',
        description: 'Choose a card to grant +20 chips when played',
        effectType: TarotEffect.ADD_CHIPS,
        effectValue: 20,
        targetRequired: true
      }
    ];
  }

  /**
   * Loads all fallback data if JSON loading completely fails.
   */
  private loadFallbackData(): void {
    this.loadDefaultHandValues();
    this.loadCardValues();
    this.loadDefaultJokers();
    this.loadDefaultPlanets();
    this.loadDefaultTarots();
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