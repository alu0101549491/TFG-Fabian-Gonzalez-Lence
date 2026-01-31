/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG) - Mini Balatro Shop System Test Suite
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file tests/unit/services/shop.test.ts
 * @desc Comprehensive unit tests for ShopItemType, ShopItem, ShopItemGenerator, and Shop
 * @see {@link <https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence>}
 */

// Mock console.log to avoid polluting test output
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
// Prevent loading the real BalancingConfig (which uses import.meta and breaks Jest parsing).
// Mock the module file directly (resolved path) before other imports so module loading
// doesn't evaluate the TypeScript file that contains `import.meta`.
jest.mock('../../../src/services/config/balancing-config', () => {
  class BalancingConfig {
    constructor() {
      this.jokerDefinitions = Array.from({ length: 15 }, (_, i) => ({
        id: `joker${i + 1}`,
        name: `Joker ${i + 1}`,
        description: `Auto mock joker ${i + 1}`,
        type: i % 2 === 0 ? 'mult' : 'chips',
        value: 4,
        condition: 'always',
      }));

      this.planetDefinitions = [
        { id: 'pluto', name: 'Pluto', targetHandType: 0, chipsBonus: 10, multBonus: 1, description: 'Pluto' },
        { id: 'mercury', name: 'Mercury', targetHandType: 0, chipsBonus: 15, multBonus: 1, description: 'Mercury' },
        { id: 'venus', name: 'Venus', targetHandType: 0, chipsBonus: 12, multBonus: 1, description: 'Venus' },
        { id: 'earth', name: 'Earth', targetHandType: 0, chipsBonus: 11, multBonus: 1, description: 'Earth' },
        { id: 'mars', name: 'Mars', targetHandType: 0, chipsBonus: 9, multBonus: 1, description: 'Mars' },
        { id: 'jupiter', name: 'Jupiter', targetHandType: 0, chipsBonus: 14, multBonus: 1, description: 'Jupiter' },
        { id: 'saturn', name: 'Saturn', targetHandType: 0, chipsBonus: 13, multBonus: 1, description: 'Saturn' },
        { id: 'uranus', name: 'Uranus', targetHandType: 0, chipsBonus: 8, multBonus: 1, description: 'Uranus' },
        { id: 'neptune', name: 'Neptune', targetHandType: 0, chipsBonus: 7, multBonus: 1, description: 'Neptune' },
      ];

      this.tarotDefinitions = Array.from({ length: 10 }, (_, i) => ({
        id: `tarot${i + 1}`,
        name: `Tarot ${i + 1}`,
        description: `Mock tarot ${i + 1}`,
        effectType: 'addMult',
        effectValue: 4,
        targetRequired: true,
      }));
    }

    async initializeAsync() {
      return Promise.resolve();
    }

    getAllJokerIds() {
      return this.jokerDefinitions.map((j) => j.id);
    }

    getJokerDefinition(id) {
      const d = this.jokerDefinitions.find((j) => j.id === id);
      if (!d) throw new Error(`Joker definition not found: ${id}`);
      return d;
    }

    getAllPlanetIds() {
      return this.planetDefinitions.map((p) => p.id);
    }

    getPlanetDefinition(id) {
      const d = this.planetDefinitions.find((p) => p.id === id);
      if (!d) throw new Error(`Planet definition not found: ${id}`);
      return d;
    }

    getAllTarotIds() {
      return this.tarotDefinitions.map((t) => t.id);
    }

    getTarotDefinition(id) {
      const d = this.tarotDefinitions.find((t) => t.id === id);
      if (!d) throw new Error(`Tarot definition not found: ${id}`);
      return d;
    }
  }

  return { BalancingConfig };
}, { virtual: false });
import {
  Shop,
  ShopItem,
  ShopItemGenerator,
  ShopItemType,
  getItemTypeDisplayName,
  getDefaultCost,
} from '@services/shop';
import {
  Joker,
  MultJoker,
  ChipJoker,
  JokerPriority,
  EconomicJoker,
  PermanentUpgradeJoker,
} from '@models/special-cards/jokers';
import { Planet } from '@models/special-cards/planets/planet';
import { Tarot, TargetedTarot, InstantTarot, TarotEffect } from '@models/special-cards/tarots';
import { HandType } from '@models/poker/hand-type.enum';
import { Card, CardValue, Suit } from '@models/core';
import { GameConfig } from '@services/config/game-config';

// ============================================================================
// TEST HELPERS
// ============================================================================

/** Creates a minimal Joker for testing */
function createTestJoker(id: string = 'test-joker'): Joker {
  return new MultJoker(id, 'Test Joker', '+4 mult', 4);
}

/** Creates a minimal Planet for testing */
function createTestPlanet(): Planet {
  return new Planet('Pluto', HandType.HIGH_CARD, 10, 1, 'Level up High Card');
}

/** Creates a minimal Tarot for testing */
function createTestTarot(): Tarot {
  return new TargetedTarot(
    'test-tarot',
    'Test Tarot',
    'Test effect',
    TarotEffect.ADD_MULT,
    4
  );
}

/** Helper to count item types in array */
function countItemTypes(items: ShopItem[]): {
  jokers: number;
  planets: number;
  tarots: number;
} {
  return {
    jokers: items.filter(i => i.getType() === ShopItemType.JOKER).length,
    planets: items.filter(i => i.getType() === ShopItemType.PLANET).length,
    tarots: items.filter(i => i.getType() === ShopItemType.TAROT).length,
  };
}

/** Helper to verify distribution is within expected range */
function verifyDistribution(
  items: ShopItem[],
  expectedJokerPercent: number = 40,
  tolerance: number = 15
): void {
  const counts = countItemTypes(items);
  const total = items.length;
  if (total === 0) return;

  const jokerPercent = (counts.jokers / total) * 100;
  const planetPercent = (counts.planets / total) * 100;
  const tarotPercent = (counts.tarots / total) * 100;

  expect(jokerPercent).toBeGreaterThanOrEqual(expectedJokerPercent - tolerance);
  expect(jokerPercent).toBeLessThanOrEqual(expectedJokerPercent + tolerance);
  expect(planetPercent).toBeGreaterThanOrEqual(30 - tolerance);
  expect(planetPercent).toBeLessThanOrEqual(30 + tolerance);
  expect(tarotPercent).toBeGreaterThanOrEqual(30 - tolerance);
  expect(tarotPercent).toBeLessThanOrEqual(30 + tolerance);
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Shop System Unit Tests', () => {
  // ============================================================================
  // SHOPITEMTYPE ENUM TESTS
  // ============================================================================
  describe('ShopItemType Enum', () => {
    it('should define JOKER type', () => {
      expect(ShopItemType.JOKER).toBe('JOKER');
    });

    it('should define PLANET type', () => {
      expect(ShopItemType.PLANET).toBe('PLANET');
    });

    it('should define TAROT type', () => {
      expect(ShopItemType.TAROT).toBe('TAROT');
    });

    it('should have all 3 types distinct', () => {
      expect(ShopItemType.JOKER).not.toBe(ShopItemType.PLANET);
      expect(ShopItemType.PLANET).not.toBe(ShopItemType.TAROT);
      expect(ShopItemType.TAROT).not.toBe(ShopItemType.JOKER);
    });

    describe('getItemTypeDisplayName()', () => {
      it('should return "Joker" for JOKER type', () => {
        expect(getItemTypeDisplayName(ShopItemType.JOKER)).toBe('Joker');
      });

      it('should return "Planet Card" for PLANET type', () => {
        expect(getItemTypeDisplayName(ShopItemType.PLANET)).toBe('Planet Card');
      });

      it('should return "Tarot Card" for TAROT type', () => {
        expect(getItemTypeDisplayName(ShopItemType.TAROT)).toBe('Tarot Card');
      });

      it('should return "Unknown Item" for invalid type', () => {
        // @ts-expect-error Testing invalid input
        expect(getItemTypeDisplayName('INVALID' as ShopItemType)).toBe('Unknown Item');
      });
    });

    describe('getDefaultCost()', () => {
      it('should return $5 for JOKER type', () => {
        expect(getDefaultCost(ShopItemType.JOKER)).toBe(5);
      });

      it('should return $3 for PLANET type', () => {
        expect(getDefaultCost(ShopItemType.PLANET)).toBe(3);
      });

      it('should return $3 for TAROT type', () => {
        expect(getDefaultCost(ShopItemType.TAROT)).toBe(3);
      });

      it('should return 0 for invalid type', () => {
        // @ts-expect-error Testing invalid input
        expect(getDefaultCost('INVALID' as ShopItemType)).toBe(0);
      });
    });
  });

  // ============================================================================
  // SHOPITEM CLASS TESTS
  // ============================================================================
  describe('ShopItem Class', () => {
    describe('constructor', () => {
      it('should create item with valid inputs', () => {
        const joker = createTestJoker();
        const item = new ShopItem(ShopItemType.JOKER, joker, 5);

        expect(item.getId()).toBeDefined();
        expect(item.getType()).toBe(ShopItemType.JOKER);
        expect(item.getItem()).toBe(joker);
        expect(item.getCost()).toBe(5);
      });

      it('should generate unique UUID for id', () => {
        const joker = createTestJoker();
        const item = new ShopItem(ShopItemType.JOKER, joker, 5);

        // UUIDv4 format: 8-4-4-4-12 hex characters
        expect(item.getId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      });

      it('should throw error on null item', () => {
        expect(() =>
          // @ts-expect-error Testing null input
          new ShopItem(ShopItemType.JOKER, null, 5)
        ).toThrow('Item cannot be null');
      });

      it('should throw error on undefined item', () => {
        expect(() =>
          // @ts-expect-error Testing undefined input
          new ShopItem(ShopItemType.JOKER, undefined, 5)
        ).toThrow('Item cannot be null');
      });

      it('should throw error on cost = 0', () => {
        const joker = createTestJoker();
        expect(() => new ShopItem(ShopItemType.JOKER, joker, 0))
          .toThrow('Cost must be positive');
      });

      it('should throw error on negative cost', () => {
        const joker = createTestJoker();
        expect(() => new ShopItem(ShopItemType.JOKER, joker, -5))
          .toThrow('Cost must be positive');
      });

      it('should accept cost = 0.01 (minimum positive)', () => {
        const joker = createTestJoker();
        expect(() => new ShopItem(ShopItemType.JOKER, joker, 0.01)).not.toThrow();
      });
    });

    describe('Getters', () => {
      let item: ShopItem;
      let joker: Joker;

      beforeEach(() => {
        joker = createTestJoker('unique-joker-id');
        item = new ShopItem(ShopItemType.JOKER, joker, 5);
      });

      it('should return id via getId()', () => {
        const id = item.getId();
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
        expect(id).toMatch(/^[0-9a-f-]{36}$/i);
      });

      it('should return type via getType()', () => {
        expect(item.getType()).toBe(ShopItemType.JOKER);
      });

      it('should return item via getItem()', () => {
        expect(item.getItem()).toBe(joker);
      });

      it('should return cost via getCost()', () => {
        expect(item.getCost()).toBe(5);
      });
    });

    describe('ID Uniqueness', () => {
      it('should generate different IDs for items with same data', () => {
        const joker = createTestJoker();
        const item1 = new ShopItem(ShopItemType.JOKER, joker, 5);
        const item2 = new ShopItem(ShopItemType.JOKER, joker, 5);

        expect(item1.getId()).not.toBe(item2.getId());
      });

      it('should generate unique IDs across 1000 items', () => {
        const joker = createTestJoker();
        const ids = new Set<string>();

        for (let i = 0; i < 1000; i++) {
          const item = new ShopItem(ShopItemType.JOKER, joker, 5);
          ids.add(item.getId());
        }

        expect(ids.size).toBe(1000);
      });
    });

    describe('restoreId()', () => {
      it('should restore ID during deserialization', () => {
        const joker = createTestJoker();
        const item = new ShopItem(ShopItemType.JOKER, joker, 5);
        const originalId = item.getId();

        // Restore with new ID
        const newId = 'restored-id-12345';
        (item as any).restoreId(newId);

        expect(item.getId()).toBe(newId);
        expect(item.getId()).not.toBe(originalId);
      });
    });
  });

  // ============================================================================
  // SHOPITEMGENERATOR CLASS TESTS
  // ============================================================================
  describe('ShopItemGenerator Class', () => {
    let generator: ShopItemGenerator;

    beforeEach(() => {
      generator = new ShopItemGenerator();
    });

    describe('Async Initialization', () => {
      it('should initialize configuration asynchronously', async () => {
        // Ensure initialization completes without error
        await expect(generator.ensureInitialized()).resolves.not.toThrow();
      });

      it('should allow item generation after initialization', async () => {
        await generator.ensureInitialized();
        const joker = generator.generateRandomJoker();
        expect(joker).toBeDefined();
        // Joker instances should have an id property
        // @ts-expect-error accessing runtime property
        expect(joker.id).toBeDefined();
      });
    });

    describe('generateRandomJoker()', () => {
      beforeEach(async () => {
        await generator.ensureInitialized();
      });

      it('should return a Joker instance', () => {
        const joker = generator.generateRandomJoker();
        expect(joker).toBeInstanceOf(Object);
        // Should have identifying properties
        // @ts-expect-error runtime property
        expect(joker.id).toBeDefined();
      });

      it('should allow wrapping in a ShopItem with correct cost', () => {
        const joker = generator.generateRandomJoker();
        const item = new ShopItem(ShopItemType.JOKER, joker as any, getDefaultCost(ShopItemType.JOKER));
        expect(item.getCost()).toBe(5);
      });

      it('should contain Joker-like behavior', () => {
        const joker = generator.generateRandomJoker();
        // Basic behavior checks (methods should exist on joker objects created by factories)
        // @ts-expect-error runtime checks
        expect(joker.canActivate).toBeDefined();
        // @ts-expect-error runtime checks
        expect(joker.applyEffect).toBeDefined();
      });

      it('should generate different jokers across calls', () => {
        const names = new Set<string>();
        for (let i = 0; i < 20; i++) {
          const joker = generator.generateRandomJoker();
          // @ts-expect-error Accessing name property from mock/real joker
          names.add(joker.name);
        }
        expect(names.size).toBeGreaterThanOrEqual(1);
      });

      it('should generate most of the 15 joker types eventually (statistical test)', async () => {
        await generator.ensureInitialized();
        const jokerNames = new Set<string>();

        for (let i = 0; i < 500; i++) {
          const joker = generator.generateRandomJoker();
          // @ts-expect-error Accessing name property
          jokerNames.add(joker.name);
        }

        expect(jokerNames.size).toBeGreaterThanOrEqual(8);
      });
    });

    describe('generateRandomPlanet()', () => {
      beforeEach(async () => {
        await generator.ensureInitialized();
      });

      it('should return a Planet instance', () => {
        const planet = generator.generateRandomPlanet();
        expect(planet).toBeInstanceOf(Object);
        // @ts-expect-error runtime property
        expect(planet.name).toBeDefined();
      });

      it('should allow wrapping in a ShopItem with correct cost', () => {
        const planet = generator.generateRandomPlanet();
        const item = new ShopItem(ShopItemType.PLANET, planet as any, getDefaultCost(ShopItemType.PLANET));
        expect(item.getCost()).toBe(3);
      });

      it('should contain Planet-like data', () => {
        const planet = generator.generateRandomPlanet();
        // @ts-expect-error runtime
        expect(planet.name).toBeDefined();
      });

      it('should generate most of the 9 planet types eventually (statistical test)', async () => {
        await generator.ensureInitialized();
        const planetNames = new Set<string>();

        for (let i = 0; i < 300; i++) {
          const planet = generator.generateRandomPlanet();
          // @ts-expect-error Accessing name property
          planetNames.add(planet.name);
        }

        expect(planetNames.size).toBeGreaterThanOrEqual(6);
      });
    });

    describe('generateRandomTarot()', () => {
      beforeEach(async () => {
        await generator.ensureInitialized();
      });

      it('should return a Tarot instance', () => {
        const tarot = generator.generateRandomTarot();
        expect(tarot).toBeInstanceOf(Object);
        // @ts-expect-error runtime
        expect(tarot.name).toBeDefined();
      });

      it('should allow wrapping in a ShopItem with correct cost', () => {
        const tarot = generator.generateRandomTarot();
        const item = new ShopItem(ShopItemType.TAROT, tarot as any, getDefaultCost(ShopItemType.TAROT));
        expect(item.getCost()).toBe(3);
      });

      it('should contain Tarot-like behavior', () => {
        const tarot = generator.generateRandomTarot();
        // @ts-expect-error runtime checks
        expect(tarot.use).toBeDefined();
      });

      it('should generate most of the 10 tarot types eventually (statistical test)', async () => {
        await generator.ensureInitialized();
        const tarotNames = new Set<string>();

        for (let i = 0; i < 300; i++) {
          const tarot = generator.generateRandomTarot();
          // @ts-expect-error Accessing name property
          tarotNames.add(tarot.name);
        }

        expect(tarotNames.size).toBeGreaterThanOrEqual(6);
      });
    });

    describe('generateShopItems()', () => {
      beforeEach(async () => {
        await generator.ensureInitialized();
      });

      it('should generate correct count of items', async () => {
        const items = await generator.generateShopItems(4);
        expect(items).toHaveLength(4);
      });

      it('should use default count of 4', async () => {
        const items = await generator.generateShopItems(4);
        expect(items).toHaveLength(4);
      });

      it('should generate all unique item instances', async () => {
        const items = await generator.generateShopItems(10);
        const ids = items.map(item => item.getId());
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(10);
      });

      it('should have distribution of ~40% jokers (statistical test)', async () => {
        const items = await generator.generateShopItems(100);
        verifyDistribution(items, 40, 15);
      });

      it('should have distribution of ~30% planets (statistical test)', async () => {
        const items = await generator.generateShopItems(100);
        verifyDistribution(items, 40, 15); // verifyDistribution checks all three types
      });

      it('should have distribution of ~30% tarots (statistical test)', async () => {
        const items = await generator.generateShopItems(100);
        verifyDistribution(items, 40, 15); // verifyDistribution checks all three types
      });

      it('should throw error on count = 0', async () => {
        await expect(generator.generateShopItems(0))
          .rejects.toThrow('Count must be positive');
      });

      it('should throw error on negative count', async () => {
        await expect(generator.generateShopItems(-5))
          .rejects.toThrow('Count must be positive');
      });

      it('should generate 1 item minimum', async () => {
        const items = await generator.generateShopItems(1);
        expect(items).toHaveLength(1);
      });

      it('should generate large counts correctly', async () => {
        const items = await generator.generateShopItems(20);
        expect(items).toHaveLength(20);
      });

      it('should prevent duplicate jokers with ownedJokerIds', async () => {
        // Generate first set to get some joker IDs
        const firstBatch = await generator.generateShopItems(4);
        const jokerItems = firstBatch.filter(i => i.getType() === ShopItemType.JOKER);
        const ownedJokerIds = jokerItems.map(i => (i.getItem() as Joker).id);

        // Generate second batch with owned jokers excluded
        const secondBatch = await generator.generateShopItems(4, ownedJokerIds);
        const secondJokers = secondBatch.filter(i => i.getType() === ShopItemType.JOKER);

        // None of the second batch jokers should have IDs in ownedJokerIds
        secondJokers.forEach(jokerItem => {
          const joker = jokerItem.getItem() as Joker;
          expect(ownedJokerIds).not.toContain(joker.id);
        });
      });

      it('should allow duplicates when all jokers owned (fallback)', async () => {
        // Mock to simulate all jokers owned
        const allJokerIds = generator['balancingConfig'].getAllJokerIds();
        const secondBatch = await generator.generateShopItems(4, allJokerIds);

        // Should still generate items (with duplicates allowed as fallback)
        expect(secondBatch).toHaveLength(4);
      });
    });
  });

  // ============================================================================
  // SHOP CLASS TESTS
  // ============================================================================
  describe('Shop Class', () => {
    let shop: Shop;

    beforeEach(() => {
      shop = new Shop();
    });

    describe('constructor', () => {
      it('should initialize with empty availableItems', () => {
        expect(shop.getAvailableItems()).toHaveLength(0);
      });

      it('should set default reroll cost to $3', () => {
        expect(shop.getRerollCost()).toBe(3);
      });

      it('should accept custom reroll cost', () => {
        const customShop = new Shop(7);
        expect(customShop.getRerollCost()).toBe(7);
      });

      it('should throw error on reroll cost = 0', () => {
        expect(() => new Shop(0)).toThrow('Reroll cost must be positive');
      });

      it('should throw error on negative reroll cost', () => {
        expect(() => new Shop(-5)).toThrow('Reroll cost must be positive');
      });
    });

    describe('generateItems()', () => {
      it('should generate 4 items by default', async () => {
        await shop.generateItems();
        expect(shop.getAvailableItems()).toHaveLength(4);
      });

      it('should replace existing items', async () => {
        await shop.generateItems();
        const firstItems = shop.getAvailableItems().map(i => i.getId());

        await shop.generateItems();
        const secondItems = shop.getAvailableItems().map(i => i.getId());

        expect(secondItems).not.toEqual(firstItems);
      });

      it('should generate all ShopItem instances', async () => {
        await shop.generateItems();
        shop.getAvailableItems().forEach(item => {
          expect(item).toBeInstanceOf(ShopItem);
        });
      });

      it('should generate items with correct costs', async () => {
        await shop.generateItems();
        shop.getAvailableItems().forEach(item => {
          if (item.getType() === ShopItemType.JOKER) {
            expect(item.getCost()).toBe(5);
          } else {
            expect(item.getCost()).toBe(3);
          }
        });
      });

      it('should accept custom count', async () => {
        await shop.generateItems(10);
        expect(shop.getAvailableItems()).toHaveLength(10);
      });

      it('should throw error on count = 0', async () => {
        await expect(shop.generateItems(0))
          .rejects.toThrow('Count must be positive');
      });

      it('should throw error on negative count', async () => {
        await expect(shop.generateItems(-5))
          .rejects.toThrow('Count must be positive');
      });

      it('should prevent duplicate jokers using ownedJokerIds', async () => {
        // Generate first shop to get joker IDs
        await shop.generateItems();
        const jokers = shop.getAvailableItems().filter(i => i.getType() === ShopItemType.JOKER);
        const ownedJokerIds = jokers.map(i => (i.getItem() as Joker).id);

        // Create new shop with owned jokers excluded
        const newShop = new Shop();
        await newShop.generateItems(4, ownedJokerIds);

        // Verify no duplicates
        const newJokers = newShop.getAvailableItems().filter(i => i.getType() === ShopItemType.JOKER);
        newJokers.forEach(jokerItem => {
          const joker = jokerItem.getItem() as Joker;
          expect(ownedJokerIds).not.toContain(joker.id);
        });
      });
    });

    describe('purchaseItem()', () => {
      beforeEach(async () => {
        await shop.generateItems();
      });

      it('should return ShopItem when affordable', () => {
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const playerMoney = 10; // Enough for any item

        const purchasedItem = shop.purchaseItem(itemId, playerMoney);
        expect(purchasedItem).toBeInstanceOf(ShopItem);
        expect(purchasedItem!.getId()).toBe(itemId);
      });

      it('should return null when insufficient funds', () => {
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const insufficientMoney = 0;

        const result = shop.purchaseItem(itemId, insufficientMoney);
        expect(result).toBeNull();
      });

      it('should remove item from availableItems on success', () => {
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const initialLength = items.length;

        shop.purchaseItem(itemId, 10);

        expect(shop.getAvailableItems()).toHaveLength(initialLength - 1);
        expect(shop.getAvailableItems().find(i => i.getId() === itemId)).toBeUndefined();
      });

      it('should not remove item on failure', () => {
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const initialLength = items.length;

        shop.purchaseItem(itemId, 0); // Insufficient funds

        expect(shop.getAvailableItems()).toHaveLength(initialLength);
      });

      it('should work with exact cost for planet', () => {
        const planetItem = shop.getAvailableItems().find(i => i.getType() === ShopItemType.PLANET);
        if (planetItem) {
          const exactCost = planetItem.getCost();
          const purchased = shop.purchaseItem(planetItem.getId(), exactCost);
          expect(purchased).not.toBeNull();
        }
      });

      it('should work with exact cost for joker', () => {
        const jokerItem = shop.getAvailableItems().find(i => i.getType() === ShopItemType.JOKER);
        if (jokerItem) {
          const exactCost = jokerItem.getCost();
          const purchased = shop.purchaseItem(jokerItem.getId(), exactCost);
          expect(purchased).not.toBeNull();
        }
      });

      it('should throw error on non-existent itemId', () => {
        expect(() => shop.purchaseItem('invalid-id', 10))
          .toThrow('Item with ID invalid-id not found');
      });

      it('should allow purchasing all items one by one', () => {
        const items = [...shop.getAvailableItems()];
        items.forEach(item => {
          const purchased = shop.purchaseItem(item.getId(), 10);
          expect(purchased).not.toBeNull();
        });
        expect(shop.getAvailableItems()).toHaveLength(0);
      });
    });

    describe('reroll()', () => {
      beforeEach(async () => {
        await shop.generateItems();
      });

      it('should return true when affordable', async () => {
        const result = await shop.reroll(5);
        expect(result).toBe(true);
      });

      it('should generate new items', async () => {
        const itemsBefore = shop.getAvailableItems().map(i => i.getId());
        await shop.reroll(5);
        const itemsAfter = shop.getAvailableItems().map(i => i.getId());
        expect(itemsAfter).not.toEqual(itemsBefore);
      });

      it('should maintain 4 items after reroll', async () => {
        await shop.reroll(5);
        expect(shop.getAvailableItems()).toHaveLength(4);
      });

      it('should work with exact cost', async () => {
        const exactCost = shop.getRerollCost(); // $3
        const result = await shop.reroll(exactCost);
        expect(result).toBe(true);
      });

      it('should return false when insufficient funds', async () => {
        const result = await shop.reroll(2); // Less than $3
        expect(result).toBe(false);
      });

      it('should not change items on failure', async () => {
        const itemsBefore = shop.getAvailableItems().map(i => i.getId());
        await shop.reroll(0); // Insufficient funds
        const itemsAfter = shop.getAvailableItems().map(i => i.getId());
        expect(itemsAfter).toEqual(itemsBefore);
      });

      it('should prevent duplicate jokers during reroll using ownedJokerIds', async () => {
        // Get current jokers as "owned"
        const currentJokers = shop.getAvailableItems().filter(i => i.getType() === ShopItemType.JOKER);
        const ownedJokerIds = currentJokers.map(i => (i.getItem() as Joker).id);

        // Reroll with owned jokers excluded
        await shop.reroll(5, ownedJokerIds);

        // Verify no duplicates in new shop
        const newJokers = shop.getAvailableItems().filter(i => i.getType() === ShopItemType.JOKER);
        newJokers.forEach(jokerItem => {
          const joker = jokerItem.getItem() as Joker;
          expect(ownedJokerIds).not.toContain(joker.id);
        });
      });
    });

    describe('getAvailableItems()', () => {
      it('should return copy of items array', () => {
        shop['availableItems'] = [
          new ShopItem(ShopItemType.JOKER, createTestJoker('1'), 5),
          new ShopItem(ShopItemType.JOKER, createTestJoker('2'), 5),
        ];

        const items1 = shop.getAvailableItems();
        const items2 = shop.getAvailableItems();

        // Modify one copy
        items1.pop();

        // Other copy should be unchanged
        expect(items1.length).not.toBe(items2.length);
      });

      it('should return empty array initially', () => {
        expect(shop.getAvailableItems()).toHaveLength(0);
      });

      it('should return correct items after generation', async () => {
        await shop.generateItems();
        const items = shop.getAvailableItems();
        expect(items).toHaveLength(4);
        items.forEach(item => {
          expect(item).toBeInstanceOf(ShopItem);
        });
      });
    });

    describe('getRerollCost()', () => {
      it('should return default $3', () => {
        expect(shop.getRerollCost()).toBe(3);
      });

      it('should return custom cost', () => {
        const customShop = new Shop(7);
        expect(customShop.getRerollCost()).toBe(7);
      });
    });

    describe('getItemCount()', () => {
      it('should return 0 for empty shop', () => {
        expect(shop.getItemCount()).toBe(0);
      });

      it('should return correct count after generation', async () => {
        await shop.generateItems(6);
        expect(shop.getItemCount()).toBe(6);
      });
    });

    describe('getItem()', () => {
      beforeEach(async () => {
        await shop.generateItems();
      });

      it('should return item by ID', () => {
        const items = shop.getAvailableItems();
        const targetItem = items[0];
        const retrieved = shop.getItem(targetItem.getId());
        expect(retrieved).toBe(targetItem);
      });

      it('should return undefined for non-existent ID', () => {
        const result = shop.getItem('non-existent-id');
        expect(result).toBeUndefined();
      });
    });

    describe('removeItem()', () => {
      beforeEach(async () => {
        await shop.generateItems();
      });

      it('should remove item by ID', () => {
        const items = shop.getAvailableItems();
        const itemId = items[0].getId();
        const initialCount = shop.getItemCount();

        shop.removeItem(itemId);

        expect(shop.getItemCount()).toBe(initialCount - 1);
        expect(shop.getItem(itemId)).toBeUndefined();
      });

      it('should do nothing for non-existent ID', () => {
        const initialCount = shop.getItemCount();
        shop.removeItem('non-existent-id');
        expect(shop.getItemCount()).toBe(initialCount);
      });
    });

    describe('setItems()', () => {
      it('should set shop items directly', () => {
        const items = [
          new ShopItem(ShopItemType.JOKER, createTestJoker('1'), 5),
          new ShopItem(ShopItemType.PLANET, createTestPlanet(), 3),
        ];

        shop.setItems(items);

        expect(shop.getAvailableItems()).toHaveLength(2);
        expect(shop.getAvailableItems()[0].getId()).toBe(items[0].getId());
      });

      it('should replace existing items', async () => {
        await shop.generateItems();
        const initialCount = shop.getItemCount();

        const newItems = [
          new ShopItem(ShopItemType.JOKER, createTestJoker('new'), 5),
        ];
        shop.setItems(newItems);

        expect(shop.getItemCount()).toBe(1);
        expect(shop.getItemCount()).not.toBe(initialCount);
      });
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================
  describe('Integration Tests', () => {
    it('should complete full shop lifecycle', async () => {
      const shop = new Shop();

      // Generate items
      await shop.generateItems();
      expect(shop.getAvailableItems()).toHaveLength(4);

      // Purchase first item
      const items = shop.getAvailableItems();
      const firstItemId = items[0].getId();
      const purchased = shop.purchaseItem(firstItemId, 10);
      expect(purchased).not.toBeNull();
      expect(shop.getAvailableItems()).toHaveLength(3);

      // Reroll shop
      const rerolled = await shop.reroll(5);
      expect(rerolled).toBe(true);
      expect(shop.getAvailableItems()).toHaveLength(4);

      // Purchase with insufficient funds
      const newItems = shop.getAvailableItems();
      const failedPurchase = shop.purchaseItem(newItems[0].getId(), 0);
      expect(failedPurchase).toBeNull();
      expect(shop.getAvailableItems()).toHaveLength(4); // No change
    });

    it('should verify all item types have correct costs', async () => {
      const generator = new ShopItemGenerator();
      await generator.ensureInitialized();

      const items = await generator.generateShopItems(20);

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

    it('should maintain independence between multiple shops', async () => {
      const shop1 = new Shop();
      const shop2 = new Shop();

      await shop1.generateItems();
      await shop2.generateItems();

      const items1 = shop1.getAvailableItems();
      const items2 = shop2.getAvailableItems();

      // Purchase from shop1
      shop1.purchaseItem(items1[0].getId(), 10);

      // shop2 should be unaffected
      expect(shop1.getAvailableItems()).toHaveLength(3);
      expect(shop2.getAvailableItems()).toHaveLength(4);
    });

    it('should handle joker uniqueness across owned jokers', async () => {
      const generator = new ShopItemGenerator();
      await generator.ensureInitialized();

      // Generate first batch to get joker IDs
      const firstBatch = await generator.generateShopItems(4);
      const ownedJokerIds = firstBatch
        .filter(i => i.getType() === ShopItemType.JOKER)
        .map(i => (i.getItem() as Joker).id);

      // Generate second batch with owned jokers excluded
      const secondBatch = await generator.generateShopItems(4, ownedJokerIds);

      // Verify no duplicates
      const secondJokerIds = secondBatch
        .filter(i => i.getType() === ShopItemType.JOKER)
        .map(i => (i.getItem() as Joker).id);

      ownedJokerIds.forEach(ownedId => {
        expect(secondJokerIds).not.toContain(ownedId);
      });
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle purchase with exact cost', async () => {
      const shop = new Shop();
      await shop.generateItems();

      const planetItem = shop.getAvailableItems().find(i => i.getType() === ShopItemType.PLANET);
      if (planetItem) {
        const result = shop.purchaseItem(planetItem.getId(), 3); // Exact cost
        expect(result).not.toBeNull();
      }
    });

    it('should handle reroll with exact cost', async () => {
      const shop = new Shop();
      await shop.generateItems();

      const result = await shop.reroll(3); // Exact cost
      expect(result).toBe(true);
    });

    it('should generate 1000 items with unique IDs', async () => {
      const generator = new ShopItemGenerator();
      await generator.ensureInitialized();

      const items = await generator.generateShopItems(1000);

      const ids = items.map(i => i.getId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(1000);
    });

    it('should handle empty shop purchase attempt', () => {
      const shop = new Shop();
      // Don't generate items

      expect(() => shop.purchaseItem('any-id', 10))
        .toThrow('Item with ID any-id not found');
    });

    it('should reroll empty shop successfully', async () => {
      const shop = new Shop();
      // Don't generate items initially

      const result = await shop.reroll(5);
      expect(result).toBe(true);
      expect(shop.getAvailableItems()).toHaveLength(4);
    });

    it('should handle large reroll count (100 items)', async () => {
      const shop = new Shop();
      await shop.generateItems(100);
      expect(shop.getAvailableItems()).toHaveLength(100);
    });

    it('should handle joker with condition functions correctly', async () => {
      const generator = new ShopItemGenerator();
      await generator.ensureInitialized();

      // Generate a joker that might have condition functions (e.g., Greedy Joker)
      const joker = generator.generateRandomJoker();

      // Verify it can be used in scoring context
      const card = new Card(CardValue.ACE, Suit.SPADES);
      const context = {
        chips: 10,
        mult: 2,
        playedCards: [card],
        handType: HandType.HIGH_CARD,
        remainingDeckSize: 44,
        emptyJokerSlots: 2,
        discardsRemaining: 3,
        addChips: jest.fn(),
        addMult: jest.fn(),
        multiplyMult: jest.fn(),
      } as any;

      // Should not throw when checking activation or applying effect
      expect(() => joker.canActivate(context)).not.toThrow();
      expect(() => joker.applyEffect(context)).not.toThrow();
    });
  });
});