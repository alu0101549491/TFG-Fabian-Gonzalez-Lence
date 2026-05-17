# TESTING CONTEXT
Project: Mini Balatro
Components under test: GamePersistence (local storage save/load system)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/services/persistence/game-persistence.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/services/persistence/game-persistence.ts
 * @desc Game state persistence service managing save/load operations via browser localStorage.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { GameState } from '../../models/game/game-state';
import { Card } from '../../models/core/card';
import { BalancingConfig } from '../config/balancing-config';
import { ShopItemGenerator } from '../shop/shop-item-generator';
import { ShopItem } from '../shop/shop-item';
import { ShopItemType } from '../shop/shop-item-type.enum';
import { SmallBlind } from '../../models/blinds/small-blind';
import { BigBlind } from '../../models/blinds/big-blind';
import { BossBlind } from '../../models/blinds/boss-blind';
import { BossType } from '../../models/blinds/boss-type.enum';

/**
 * Handles game state persistence to browser localStorage.
 * Manages save, load, and clear operations with error handling.
 */
export class GamePersistence {
  private readonly storageKey: string;
  private readonly controllerStateKey: string;
  private itemGenerator: ShopItemGenerator;
  private balancingConfig: BalancingConfig;

  /**
   * Creates persistence manager with specified storage key.
   * @param storageKey - Key for localStorage
   */
  constructor(storageKey: string = 'miniBalatro_save') {
    if (!storageKey) {
      throw new Error('Storage key cannot be empty');
    }
    this.storageKey = storageKey;
    this.controllerStateKey = `${storageKey}_controller`;
    this.itemGenerator = new ShopItemGenerator();
    this.balancingConfig = new BalancingConfig();
    // Initialize async loading
    this.balancingConfig.initializeAsync().catch(error => {
      console.error('Failed to load balancing config for persistence:', error);
    });
  }

  /**
   * Serializes and saves game state to localStorage.
   * @param gameState - GameState to save
   */
  public saveGame(gameState: GameState): void {
    try {
      if (!gameState) {
        throw new Error('Game state cannot be null');
      }

      const serialized = this.serializeGameState(gameState);
      localStorage.setItem(this.storageKey, serialized);
      console.log('Game state saved successfully');
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  /**
   * Loads and deserializes game state from localStorage.
   * @returns GameState if save exists, null otherwise
   */
  public loadGame(): GameState | null {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        return null;
      }

      const gameState = this.deserializeGameState(serialized);
      console.log('Game state loaded successfully');
      return gameState;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  /**
   * Checks if a saved game exists.
   * @returns true if save exists, false otherwise
   */
  public hasSavedGame(): boolean {
    try {
      return localStorage.getItem(this.storageKey) !== null;
    } catch (error) {
      console.error('Failed to check for saved game:', error);
      return false;
    }
  }

  /**
   * Removes saved game from localStorage.
   */
  public clearSavedGame(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.controllerStateKey);
      console.log('Saved game cleared');
    } catch (error) {
      console.error('Failed to clear saved game:', error);
    }
  }

  /**
   * Serializes shop items for persistence.
   * @param shopItems - Array of ShopItems to serialize
   * @returns Serialized shop items data
   */
  public serializeShopItems(shopItems: ShopItem[]): any[] {
    return shopItems.map(shopItem => {
      // Handle different item types
      let itemId: string;
      if (shopItem.type === ShopItemType.PLANET) {
        // For planets, find the ID by name from balancing config
        const planetIds = this.balancingConfig.getAllPlanetIds();
        const planetDef = planetIds
          .map(id => ({ id, def: this.balancingConfig.getPlanetDefinition(id) }))
          .find(p => p.def.name === shopItem.item.name);
        itemId = planetDef?.id || shopItem.item.name; // Fallback to name if not found
      } else {
        // For jokers and tarots, use the id field
        itemId = (shopItem.item as any).id;
      }
      
      return {
        id: shopItem.getId(),
        type: shopItem.type,
        cost: shopItem.cost,
        itemId: itemId,
        itemName: shopItem.item.name,
        itemDescription: shopItem.item.description
      };
    });
  }

  /**
   * Deserializes shop items from persistence data.
   * @param serializedItems - Serialized shop items data
   * @returns Promise resolving to array of ShopItems
   */
  public async deserializeShopItems(serializedItems: any[]): Promise<ShopItem[]> {
    if (!serializedItems || serializedItems.length === 0) {
      return [];
    }

    await this.itemGenerator.ensureInitialized();

    const shopItems: ShopItem[] = [];
    for (const serialized of serializedItems) {
      try {
        let item: any;
        
        if (serialized.type === ShopItemType.JOKER) {
          item = this.itemGenerator.generateJokerById(serialized.itemId);
        } else if (serialized.type === ShopItemType.PLANET) {
          item = this.itemGenerator.generatePlanetById(serialized.itemId);
        } else if (serialized.type === ShopItemType.TAROT) {
          item = this.itemGenerator.generateTarotById(serialized.itemId);
        } else {
          console.warn(`Unknown shop item type: ${serialized.type}`);
          continue;
        }

        const shopItem = new ShopItem(serialized.type, item, serialized.cost);
        // Restore the original UUID using the restoreId method
        shopItem.restoreId(serialized.id);
        shopItems.push(shopItem);
      } catch (error) {
        console.error(`Failed to deserialize shop item ${serialized.itemId}:`, error);
      }
    }

    return shopItems;
  }

  /**
   * Saves controller state (isInShop flag, blind victory state, and shop items).
   * @param isInShop - Whether player is currently in shop
   * @param victoryState - Optional victory state information
   * @param shopItems - Optional shop items to save (serialized shop state)
   */
  public saveControllerState(
    isInShop: boolean,
    victoryState?: {
      isPending: boolean;
      score: number;
      reward: number;
      blindLevel: number;
    },
    shopItems?: any[]
  ): void {
    try {
      const controllerState = {
        isInShop,
        victoryState: victoryState || { isPending: false, score: 0, reward: 0, blindLevel: 0 },
        shopItems: shopItems || []
      };
      localStorage.setItem(this.controllerStateKey, JSON.stringify(controllerState));
      console.log(`Controller state saved: isInShop=${isInShop}, pendingVictory=${victoryState?.isPending || false}, shopItems=${shopItems?.length || 0}`);
    } catch (error) {
      console.error('Failed to save controller state:', error);
    }
  }

  /**
   * Loads controller state.
   * @returns Object with isInShop flag, victory state, and shop items, or null if not found
   */
  public loadControllerState(): {
    isInShop: boolean;
    victoryState: {
      isPending: boolean;
      score: number;
      reward: number;
      blindLevel: number;
    };
    shopItems: any[];
  } | null {
    try {
      const serialized = localStorage.getItem(this.controllerStateKey);
      if (!serialized) {
        return null;
      }
      const parsed = JSON.parse(serialized);
      const result = {
        isInShop: parsed.isInShop || false,
        victoryState: parsed.victoryState || { isPending: false, score: 0, reward: 0, blindLevel: 0 },
        shopItems: parsed.shopItems || []
      };
      console.log(`Controller state loaded: isInShop=${result.isInShop}, pendingVictory=${result.victoryState.isPending}, shopItems=${result.shopItems.length}`);
      return result;
    } catch (error) {
      console.error('Failed to load controller state:', error);
      return null;
    }
  }

  /**
   * Converts GameState to JSON string.
   * @param gameState - GameState to serialize
   * @returns JSON string
   * @throws Error if serialization fails
   */
  private serializeGameState(gameState: GameState): string {
    // Create a simplified representation of the game state
    // that can be safely serialized to JSON
    const deck = gameState.getDeck();
    
    const simplified = {
      // Basic game info
      levelNumber: gameState.getLevelNumber(),
      roundNumber: gameState.getRoundNumber(),
      money: gameState.getMoney(),
      accumulatedScore: gameState.getAccumulatedScore(),
      handsRemaining: gameState.getHandsRemaining(),
      discardsRemaining: gameState.getDiscardsRemaining(),

      // Deck state
      deckCards: deck.getCards().map(card => ({
        value: card.value,
        suit: card.suit,
        chips: card.getBaseChips(),
        multBonus: card.getMultBonus()
      })),
      discardPile: deck.getDiscardPile().map(card => ({
        value: card.value,
        suit: card.suit,
        chips: card.getBaseChips(),
        multBonus: card.getMultBonus()
      })),
      maxDeckSize: deck.getMaxDeckSize(),  // Save maximum deck size

      // Current hand (simplified)
      currentHand: gameState.getCurrentHand().map(card => ({
        id: card.getId(),
        value: card.value,
        suit: card.suit,
        chips: card.getBaseChips(),
        multBonus: card.getMultBonus()
      })),

      // Jokers
      jokers: gameState.getJokers().map(joker => ({
        id: joker.id,
        name: joker.name,
        type: joker.constructor.name
      })),

      // Consumables
      consumables: gameState.getConsumables().map(tarot => ({
        id: tarot.id,
        name: tarot.name,
        description: tarot.description,
        type: tarot.constructor.name
      })),

      // Current blind
      currentBlind: {
        level: gameState.getCurrentBlind().getLevel(),
        roundNumber: gameState.getRoundNumber(),
        type: gameState.getCurrentBlind().getBlindType(),
        scoreGoal: gameState.getCurrentBlind().getScoreGoal(),
        // Save boss type if this is a boss blind
        bossType: gameState.getCurrentBlind() instanceof BossBlind 
          ? (gameState.getCurrentBlind() as BossBlind).getBossType() 
          : undefined,
        // Save The Mouth's locked hand type if it has been set
        lockedHandType: gameState.getCurrentBlind() instanceof BossBlind 
          ? (gameState.getCurrentBlind() as BossBlind).getModifier().allowedHandTypes?.[0]
          : undefined
      },

      // Upgrade manager state
      upgrades: Array.from(gameState.getUpgradeManager()['upgrades']).map(([handType, upgrade]) => ({
        handType,
        chips: upgrade.additionalChips,
        mult: upgrade.additionalMult,
        level: upgrade.level
      }))
    };

    return JSON.stringify(simplified);
  }

  /**
   * Converts JSON string to GameState.
   * @param data - JSON string
   * @returns Reconstructed GameState
   * @throws Error if deserialization fails
   */
  private deserializeGameState(data: string): GameState {
    const parsed = JSON.parse(data);

    // Create a new game state
    const gameState = new GameState();

    // Restore basic properties
    gameState['levelNumber'] = parsed.levelNumber;
    gameState['roundNumber'] = parsed.roundNumber;
    gameState['money'] = parsed.money;
    gameState['accumulatedScore'] = parsed.accumulatedScore;
    gameState['handsRemaining'] = parsed.handsRemaining;
    gameState['discardsRemaining'] = parsed.discardsRemaining;

    // Restore deck state
    if (parsed.deckCards && Array.isArray(parsed.deckCards) && parsed.discardPile && Array.isArray(parsed.discardPile)) {
      const deckCards = parsed.deckCards.map((cardData: any) => {
        const card = new Card(cardData.value, cardData.suit);
        if (cardData.chips || cardData.multBonus) {
          const baseChips = card.getBaseChips();
          const chipBonus = (cardData.chips || 0) - baseChips;
          if (chipBonus > 0 || cardData.multBonus > 0) {
            card.addPermanentBonus(Math.max(0, chipBonus), cardData.multBonus || 0);
          }
        }
        return card;
      });

      const discardPileCards = parsed.discardPile.map((cardData: any) => {
        const card = new Card(cardData.value, cardData.suit);
        if (cardData.chips || cardData.multBonus) {
          const baseChips = card.getBaseChips();
          const chipBonus = (cardData.chips || 0) - baseChips;
          if (chipBonus > 0 || cardData.multBonus > 0) {
            card.addPermanentBonus(Math.max(0, chipBonus), cardData.multBonus || 0);
          }
        }
        return card;
      });

      const deck = gameState.getDeck();
      deck.setState(deckCards, discardPileCards, parsed.maxDeckSize);
      console.log(`Restored deck: ${deckCards.length} cards in deck, ${discardPileCards.length} in discard pile, max: ${parsed.maxDeckSize || 'not saved (defaulting to current total)'}`);
    }

    // Restore current hand by reconstructing Card objects
    if (parsed.currentHand && Array.isArray(parsed.currentHand)) {
      const restoredHand = parsed.currentHand.map((cardData: any) => {
        const card = new Card(cardData.value, cardData.suit);
        // Note: Card IDs will be regenerated (UUID), but value/suit are preserved
        // Restore bonuses if they exist
        if (cardData.chips || cardData.multBonus) {
          const baseChips = card.getBaseChips();
          const chipBonus = (cardData.chips || 0) - baseChips;
          if (chipBonus > 0 || cardData.multBonus > 0) {
            card.addPermanentBonus(Math.max(0, chipBonus), cardData.multBonus || 0);
          }
        }
        return card;
      });
      gameState['currentHand'] = restoredHand;
      console.log(`Restored hand with ${restoredHand.length} cards`);
    }

    // Restore upgrade manager state
    if (parsed.upgrades && Array.isArray(parsed.upgrades)) {
      const upgradeManager = gameState.getUpgradeManager();
      parsed.upgrades.forEach((upgradeData: any) => {
        if (upgradeData.chips > 0 || upgradeData.mult > 0 || upgradeData.level > 1) {
          // Use restoreUpgrade to properly set level without incrementing
          upgradeManager.restoreUpgrade(
            upgradeData.handType,
            upgradeData.chips,
            upgradeData.mult,
            upgradeData.level || 1 // Default to 1 for old saves without level
          );
        }
      });
      console.log(`Restored ${parsed.upgrades.length} hand upgrades`);
    }

    // Restore jokers
    if (parsed.jokers && Array.isArray(parsed.jokers)) {
      parsed.jokers.forEach((jokerData: any) => {
        try {
          // Recreate the specific joker by ID
          const joker = this.itemGenerator.generateJokerById(jokerData.id);
          gameState.addJoker(joker);
        } catch (error) {
          console.error(`Failed to restore joker: ${jokerData.name} (${jokerData.id})`, error);
        }
      });
      console.log(`Restored ${parsed.jokers.length} jokers`);
    }

    // Restore consumables (tarots)
    if (parsed.consumables && Array.isArray(parsed.consumables)) {
      parsed.consumables.forEach((tarotData: any) => {
        try {
          // Recreate the specific tarot by ID
          const tarot = this.itemGenerator.generateTarotById(tarotData.id);
          gameState.addConsumable(tarot);
        } catch (error) {
          console.error(`Failed to restore consumable: ${tarotData.name} (${tarotData.id})`, error);
        }
      });
      console.log(`Restored ${parsed.consumables.length} consumables`);
    }

    // Restore current blind
    if (parsed.currentBlind) {
      try {
        const blindLevel = parsed.currentBlind.level;
        const roundNumber = parsed.currentBlind.roundNumber || parsed.roundNumber;
        let blindType = parsed.currentBlind.type;
        const savedScoreGoal = parsed.currentBlind.scoreGoal;
        
        // Handle legacy save data with minified class names
        // Infer blind type from level number if type is not recognized
        if (blindType !== 'SmallBlind' && blindType !== 'BigBlind' && blindType !== 'BossBlind') {
          console.warn(`Unknown blind type "${blindType}", inferring from level ${blindLevel}`);
          const positionInRound = (blindLevel - 1) % 3;
          if (positionInRound === 0) {
            blindType = 'SmallBlind';
          } else if (positionInRound === 1) {
            blindType = 'BigBlind';
          } else {
            blindType = 'BossBlind';
          }
          console.log(`Inferred blind type as: ${blindType}`);
        }
        
        // Create the appropriate blind type based on the class name
        if (blindType === 'SmallBlind') {
          const blind = new SmallBlind(blindLevel, roundNumber);
          // Restore the exact score goal that was saved
          if (savedScoreGoal !== undefined) {
            (blind as any).scoreGoal = savedScoreGoal;
          }
          gameState['currentBlind'] = blind;
        } else if (blindType === 'BigBlind') {
          const blind = new BigBlind(blindLevel, roundNumber);
          // Restore the exact score goal that was saved
          if (savedScoreGoal !== undefined) {
            (blind as any).scoreGoal = savedScoreGoal;
          }
          gameState['currentBlind'] = blind;
        } else if (blindType === 'BossBlind') {
          // Restore the actual boss type (default to THE_WALL if not saved)
          const bossType = parsed.currentBlind.bossType || BossType.THE_WALL;
          const bossBlind = new BossBlind(blindLevel, roundNumber, bossType);
          
          // Restore the exact score goal that was saved
          if (savedScoreGoal !== undefined) {
            (bossBlind as any).scoreGoal = savedScoreGoal;
          }
          
          // If The Mouth boss has a locked hand type, restore it
          if (bossType === BossType.THE_MOUTH && parsed.currentBlind.lockedHandType) {
            bossBlind.setAllowedHandType(parsed.currentBlind.lockedHandType);
            console.log(`Restored The Mouth with locked hand type: ${parsed.currentBlind.lockedHandType}`);
          }
          
          gameState['currentBlind'] = bossBlind;
          console.log(`Restored boss blind: ${bossType} at level ${blindLevel} with goal ${savedScoreGoal}`);
        }
        
        if (blindType !== 'BossBlind') {
          console.log(`Restored blind: ${blindType} at level ${blindLevel} with goal ${savedScoreGoal}`);
        }
      } catch (error) {
        console.error('Failed to restore blind', error);
      }
    }

    console.log('Game state deserialized');
    return gameState;
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

## GamePersistence Class Requirements:

### Storage Key:
- Uses single localStorage key: `'mini-balatro-save'`
- All game data stored as JSON string

### Properties:
- **storageKey**: string (constant: 'mini-balatro-save')

### Save Data Structure:
```typescript
interface SaveData {
  // GameState serialization
  levelNumber: number;
  money: number;
  accumulatedScore: number;
  handsRemaining: number;
  discardsRemaining: number;
  
  // Arrays (serialized)
  currentHand: SerializedCard[];
  selectedCards: string[]; // Card IDs
  jokers: SerializedJoker[];
  consumables: SerializedTarot[];
  
  // Nested objects
  currentBlind: SerializedBlind;
  upgradeManager: SerializedUpgradeManager;
  deck: SerializedDeck;
  
  // Metadata
  savedAt: string; // ISO timestamp
  version: string; // Save format version (e.g., "1.0.0")
}
```

### Serialization Requirements:

**Card Serialization:**
```typescript
interface SerializedCard {
  id: string;
  value: string; // CardValue enum name
  suit: string;  // Suit enum name
  chipBonus: number;
  multBonus: number;
}
```

**Joker Serialization:**
```typescript
interface SerializedJoker {
  id: string;
  name: string;
  type: string; // Joker type identifier
  // Additional properties based on type
}
```

**Tarot Serialization:**
```typescript
interface SerializedTarot {
  id: string;
  name: string;
  effect: string; // TarotEffect enum name
}
```

**Blind Serialization:**
```typescript
interface SerializedBlind {
  roundNumber: number;
  type: 'small' | 'big' | 'boss';
  bossType?: string; // BossType enum name if boss
}
```

**Deck Serialization:**
```typescript
interface SerializedDeck {
  cards: SerializedCard[];
  remaining: number;
}
```

**UpgradeManager Serialization:**
```typescript
interface SerializedUpgradeManager {
  upgrades: {
    [handType: string]: {
      additionalChips: number;
      additionalMult: number;
    }
  }
}
```

### Core Methods:

**saveGame(gameState: GameState): void**
- Serializes entire GameState to SaveData
- Converts all complex objects to plain objects
- Stores as JSON string in localStorage
- Sets savedAt timestamp
- Sets version number
- Throws error if serialization fails
- Throws error if localStorage unavailable
- Overwrites previous save (no multiple saves)

**loadGame(): GameState | null**
- Reads from localStorage
- Returns null if no save exists
- Parses JSON string to SaveData
- Deserializes all nested objects
- Reconstructs GameState instance
- Validates save data structure
- Throws error if save corrupted
- Throws error if version incompatible

**hasSavedGame(): boolean**
- Returns true if save exists in localStorage
- Returns false if no save or localStorage unavailable
- Does not throw errors (graceful check)

**clearSave(): void**
- Removes save from localStorage
- Does nothing if no save exists
- Does not throw errors (idempotent)

**getSaveMetadata(): { savedAt: Date, version: string } | null**
- Returns save metadata without loading full game
- Parses only metadata fields
- Returns null if no save
- Does not throw errors

### Validation Requirements:

**Save Data Validation:**
- Check all required fields present
- Validate types (numbers are numbers, arrays are arrays)
- Validate ranges (money ≥ 0, level > 0, hands 0-3, discards 0-3)
- Validate card values/suits match enums
- Validate joker types exist
- Validate hand types in upgrades exist

**Version Compatibility:**
- Current version: "1.0.0"
- Load fails if major version differs
- Load succeeds if minor/patch versions differ (forward compatible)
- Example: Save v1.0.0 loads in v1.1.0 (OK)
- Example: Save v1.0.0 fails in v2.0.0 (incompatible)

### Error Handling:

**localStorage Unavailable:**
- Detect if localStorage is undefined (server-side rendering)
- Throw descriptive error
- Don't crash silently

**Corrupted Save:**
- JSON parse fails: throw error with details
- Missing required fields: throw error listing missing fields
- Invalid data types: throw error with field name
- Don't attempt to partially load corrupted save

**Quota Exceeded:**
- localStorage full: throw error
- Provide helpful error message

### Browser Compatibility:
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses localStorage API (not sessionStorage or IndexedDB)
- Handles private browsing mode (localStorage may be unavailable)

## Edge Cases:
- Save then immediately load (round-trip)
- Load non-existent save (returns null)
- Clear non-existent save (no error)
- Save with large deck (50+ cards)
- Save with 5 jokers, 2 tarots (full inventory)
- Save at level 24 (final level)
- Save with boss blind + modifiers
- Save with all planet upgrades applied
- Corrupted JSON in localStorage
- Malformed save data (missing fields)
- Version mismatch (major version)
- localStorage disabled (private browsing)
- Multiple rapid saves (last one wins)

# TASK

Generate a complete unit test suite for GamePersistence that covers:

## 1. Constructor Tests

- [ ] Initializes with correct storage key
- [ ] Does not throw errors
- [ ] Can create multiple instances

## 2. saveGame() Tests

### Basic Save:
- [ ] Saves game state to localStorage
- [ ] Creates valid JSON string
- [ ] Save can be retrieved from localStorage
- [ ] Overwrites previous save
- [ ] Sets savedAt timestamp
- [ ] Sets version to "1.0.0"

### Serialization:
- [ ] Serializes levelNumber correctly
- [ ] Serializes money correctly
- [ ] Serializes accumulatedScore correctly
- [ ] Serializes handsRemaining correctly
- [ ] Serializes discardsRemaining correctly
- [ ] Serializes currentHand (array of cards)
- [ ] Serializes selectedCards (array of IDs)
- [ ] Serializes jokers array
- [ ] Serializes consumables array
- [ ] Serializes currentBlind
- [ ] Serializes upgradeManager
- [ ] Serializes deck

### Card Serialization:
- [ ] Saves card id, value, suit
- [ ] Saves card chipBonus, multBonus
- [ ] Handles card with no bonuses (0, 0)
- [ ] Handles card with bonuses

### Complex State:
- [ ] Saves with 5 jokers
- [ ] Saves with 2 tarots
- [ ] Saves with boss blind
- [ ] Saves with planet upgrades applied
- [ ] Saves with modified deck (cards removed/added)

### Error Handling:
- [ ] Throws error on null gameState
- [ ] Throws error if localStorage unavailable
- [ ] Handles quota exceeded gracefully

## 3. loadGame() Tests

### Basic Load:
- [ ] Returns null if no save exists
- [ ] Loads saved game correctly
- [ ] Returns GameState instance
- [ ] Restores all primitive properties
- [ ] Restores all arrays
- [ ] Restores all nested objects

### Deserialization:
- [ ] Restores levelNumber
- [ ] Restores money
- [ ] Restores accumulatedScore
- [ ] Restores handsRemaining
- [ ] Restores discardsRemaining
- [ ] Restores currentHand with Card instances
- [ ] Restores selectedCards IDs
- [ ] Restores jokers with correct types
- [ ] Restores consumables with correct types
- [ ] Restores currentBlind (correct type)
- [ ] Restores upgradeManager
- [ ] Restores deck with cards

### Card Deserialization:
- [ ] Creates Card instances (not plain objects)
- [ ] Restores card value enum correctly
- [ ] Restores card suit enum correctly
- [ ] Restores card bonuses

### Round-Trip:
- [ ] Save then load returns equivalent state
- [ ] levelNumber preserved
- [ ] money preserved
- [ ] currentHand same cards
- [ ] jokers same types and count
- [ ] consumables same types and count

### Validation:
- [ ] Throws error on corrupted JSON
- [ ] Throws error on missing required fields
- [ ] Throws error on invalid data types
- [ ] Throws error on version incompatibility (major)
- [ ] Succeeds on minor version difference

### Error Handling:
- [ ] Handles empty localStorage gracefully
- [ ] Handles malformed JSON
- [ ] Provides helpful error messages

## 4. hasSavedGame() Tests

- [ ] Returns false initially (no save)
- [ ] Returns true after saving
- [ ] Returns false after clearing
- [ ] Returns false if localStorage unavailable
- [ ] Does not throw errors

## 5. clearSave() Tests

- [ ] Removes save from localStorage
- [ ] hasSavedGame returns false after clear
- [ ] Can clear multiple times (idempotent)
- [ ] Does not throw error if no save exists
- [ ] Subsequent load returns null

## 6. getSaveMetadata() Tests

- [ ] Returns null if no save exists
- [ ] Returns savedAt timestamp
- [ ] Returns version string
- [ ] savedAt is valid Date
- [ ] Does not load full game
- [ ] Does not throw errors

## 7. Version Compatibility Tests

### Version Matching:
- [ ] Loads save with same version (1.0.0)
- [ ] Loads save with same major, higher minor (1.1.0)
- [ ] Loads save with same major, higher patch (1.0.1)
- [ ] Throws error on different major version (2.0.0)

### Version Parsing:
- [ ] Parses version correctly (major.minor.patch)
- [ ] Compares versions correctly

## 8. localStorage Integration Tests

### Storage API:
- [ ] Uses localStorage.setItem()
- [ ] Uses localStorage.getItem()
- [ ] Uses localStorage.removeItem()
- [ ] Uses single key 'mini-balatro-save'

### Persistence:
- [ ] Save persists across persistence instances
- [ ] Multiple GamePersistence instances share same save
- [ ] Last save wins on conflict

## 9. Complete Save/Load Cycle Tests

### Minimal State:
- [ ] Save game at level 1, start of game
- [ ] Load and verify state matches

### Complex State:
- [ ] Save game at level 10
- [ ] With 3 jokers, 1 tarot
- [ ] With planet upgrades
- [ ] With boss blind
- [ ] Load and verify all state preserved

### Full Inventory:
- [ ] Save with 5 jokers
- [ ] Save with 2 tarots
- [ ] Save with 8 cards in hand
- [ ] Load and verify counts match

### Mid-Level State:
- [ ] Save after playing 1 hand (2 hands remaining)
- [ ] Save after 1 discard (2 discards remaining)
- [ ] Save with accumulated score
- [ ] Load and verify state

## 10. Edge Cases

### Empty Collections:
- [ ] Save with 0 jokers
- [ ] Save with 0 tarots
- [ ] Save with empty selected cards
- [ ] Load and verify empty arrays

### Boundary Values:
- [ ] Save with money = 0
- [ ] Save with money = 1000
- [ ] Save with level = 1
- [ ] Save with level = 24
- [ ] Save with hands = 0
- [ ] Save with hands = 3

### Special States:
- [ ] Save immediately after game start
- [ ] Save after level completion (before shop)
- [ ] Save during boss blind
- [ ] Save with The Water boss (0 discards)
- [ ] Save with The Needle boss (1 hand)

### Data Integrity:
- [ ] Large save (many cards, jokers, upgrades)
- [ ] Save with special characters in names
- [ ] Save with Unicode in descriptions

## 11. Error Recovery Tests

### Corrupted Data:
- [ ] Invalid JSON throws clear error
- [ ] Missing levelNumber throws error
- [ ] Negative money throws error
- [ ] Invalid card value throws error
- [ ] Invalid hand type throws error

### localStorage Errors:
- [ ] Mock localStorage unavailable
- [ ] Mock quota exceeded
- [ ] Mock getItem throws error
- [ ] Verify error messages helpful

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { GamePersistence } from '@/services/persistence';
import { GameState } from '@/models/game';
import { MultJoker } from '@/models/special-cards/jokers';
import { TargetedTarot, TarotEffect } from '@/models/special-cards/tarots';
import { Planet } from '@/models/special-cards/planets';
import { HandType } from '@/models/poker';

describe('GamePersistence', () => {
  let persistence: GamePersistence;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    
    global.localStorage = {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
      clear: () => {
        mockLocalStorage = {};
      },
      length: 0,
      key: () => null
    } as Storage;

    persistence = new GamePersistence();
  });

  afterEach(() => {
    // Clean up
    persistence.clearSave();
  });

  describe('Constructor', () => {
    it('should initialize with correct storage key', () => {
      // ASSERT
      expect(persistence['storageKey']).toBe('mini-balatro-save');
    });

    it('should not throw errors', () => {
      // ACT & ASSERT
      expect(() => new GamePersistence()).not.toThrow();
    });

    it('should allow multiple instances', () => {
      // ACT
      const persistence1 = new GamePersistence();
      const persistence2 = new GamePersistence();
      
      // ASSERT
      expect(persistence1).toBeDefined();
      expect(persistence2).toBeDefined();
    });
  });

  describe('saveGame', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = new GameState();
      gameState.dealHand();
    });

    it('should save game state to localStorage', () => {
      // ACT
      persistence.saveGame(gameState);
      
      // ASSERT
      const saved = localStorage.getItem('mini-balatro-save');
      expect(saved).not.toBeNull();
      expect(saved).toBeDefined();
    });

    it('should create valid JSON string', () => {
      // ACT
      persistence.saveGame(gameState);
      
      // ASSERT
      const saved = localStorage.getItem('mini-balatro-save')!;
      expect(() => JSON.parse(saved)).not.toThrow();
    });

    it('should set savedAt timestamp', () => {
      // ACT
      persistence.saveGame(gameState);
      
      // ASSERT
      const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
      expect(saved.savedAt).toBeDefined();
      expect(new Date(saved.savedAt)).toBeInstanceOf(Date);
    });

    it('should set version to 1.0.0', () => {
      // ACT
      persistence.saveGame(gameState);
      
      // ASSERT
      const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
      expect(saved.version).toBe('1.0.0');
    });

    it('should overwrite previous save', () => {
      // ARRANGE
      persistence.saveGame(gameState);
      const firstSave = localStorage.getItem('mini-balatro-save');
      
      // ACT - Modify state and save again
      gameState.addMoney(100);
      persistence.saveGame(gameState);
      
      // ASSERT
      const secondSave = localStorage.getItem('mini-balatro-save');
      expect(secondSave).not.toBe(firstSave);
    });

    describe('Serialization', () => {
      it('should serialize levelNumber correctly', () => {
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        expect(saved.levelNumber).toBe(1);
      });

      it('should serialize money correctly', () => {
        // ARRANGE
        gameState.addMoney(50);
        
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        expect(saved.money).toBe(55); // Initial $5 + $50
      });

      it('should serialize accumulatedScore correctly', () => {
        // ARRANGE
        const hand = gameState.getCurrentHand();
        gameState.selectCard(hand[0].id);
        gameState.playHand();
        
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        expect(saved.accumulatedScore).toBeGreaterThan(0);
      });

      it('should serialize currentHand array', () => {
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        expect(saved.currentHand).toBeInstanceOf(Array);
        expect(saved.currentHand).toHaveLength(8);
      });

      it('should serialize card with bonuses', () => {
        // ARRANGE
        const hand = gameState.getCurrentHand();
        hand[0].addPermanentBonus(20, 4);
        
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        const firstCard = saved.currentHand[0];
        expect(firstCard.chipBonus).toBe(20);
        expect(firstCard.multBonus).toBe(4);
      });

      it('should serialize jokers array', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        gameState.addJoker(joker);
        
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        expect(saved.jokers).toBeInstanceOf(Array);
        expect(saved.jokers).toHaveLength(1);
      });

      it('should serialize consumables array', () => {
        // ARRANGE
        const tarot = new TargetedTarot(
          'empress',
          'Empress',
          'Add mult',
          TarotEffect.ADD_MULT,
          (card) => card.addPermanentBonus(0, 4)
        );
        gameState.addConsumable(tarot);
        
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        expect(saved.consumables).toBeInstanceOf(Array);
        expect(saved.consumables).toHaveLength(1);
      });
    });

    describe('Complex State', () => {
      it('should save with 5 jokers', () => {
        // ARRANGE
        for (let i = 0; i < 5; i++) {
          const joker = new MultJoker(`joker${i}`, 'Joker', '+4 mult', 4);
          gameState.addJoker(joker);
        }
        
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        expect(saved.jokers).toHaveLength(5);
      });

      it('should save with planet upgrades applied', () => {
        // ARRANGE
        const pluto = new Planet(
          'pluto',
          'Pluto',
          'Upgrade High Card',
          HandType.HIGH_CARD,
          10,
          1
        );
        gameState.applyPlanetCard(pluto);
        
        // ACT
        persistence.saveGame(gameState);
        
        // ASSERT
        const saved = JSON.parse(localStorage.getItem('mini-balatro-save')!);
        expect(saved.upgradeManager).toBeDefined();
        expect(saved.upgradeManager.upgrades).toBeDefined();
      });
    });

    describe('Error Handling', () => {
      it('should throw error on null gameState', () => {
        // ACT & ASSERT
        expect(() => persistence.saveGame(null as any))
          .toThrow('GameState cannot be null');
      });

      it('should throw error if localStorage unavailable', () => {
        // ARRANGE
        delete (global as any).localStorage;
        
        // ACT & ASSERT
        expect(() => persistence.saveGame(gameState))
          .toThrow('localStorage is not available');
        
        // Restore
        beforeEach();
      });
    });
  });

  describe('loadGame', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = new GameState();
      gameState.dealHand();
    });

    it('should return null if no save exists', () => {
      // ACT
      const loaded = persistence.loadGame();
      
      // ASSERT
      expect(loaded).toBeNull();
    });

    it('should load saved game correctly', () => {
      // ARRANGE
      persistence.saveGame(gameState);
      
      // ACT
      const loaded = persistence.loadGame();
      
      // ASSERT
      expect(loaded).not.toBeNull();
      expect(loaded).toBeInstanceOf(GameState);
    });

    describe('Deserialization', () => {
      it('should restore levelNumber', () => {
        // ARRANGE
        persistence.saveGame(gameState);
        
        // ACT
        const loaded = persistence.loadGame()!;
        
        // ASSERT
        expect(loaded.getLevelNumber()).toBe(1);
      });

      it('should restore money', () => {
        // ARRANGE
        gameState.addMoney(50);
        persistence.saveGame(gameState);
        
        // ACT
        const loaded = persistence.loadGame()!;
        
        // ASSERT
        expect(loaded.getMoney()).toBe(55);
      });

      it('should restore currentHand with Card instances', () => {
        // ARRANGE
        persistence.saveGame(gameState);
        
        // ACT
        const loaded = persistence.loadGame()!;
        
        // ASSERT
        const hand = loaded.getCurrentHand();
        expect(hand).toHaveLength(8);
        hand.forEach(card => {
          expect(card.value).toBeDefined();
          expect(card.suit).toBeDefined();
        });
      });

      it('should restore card bonuses', () => {
        // ARRANGE
        const hand = gameState.getCurrentHand();
        hand[0].addPermanentBonus(20, 4);
        persistence.saveGame(gameState);
        
        // ACT
        const loaded = persistence.loadGame()!;
        
        // ASSERT
        const loadedHand = loaded.getCurrentHand();
        expect(loadedHand[0].chipBonus).toBe(20);
        expect(loadedHand[0].multBonus).toBe(4);
      });

      it('should restore jokers with correct count', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        gameState.addJoker(joker);
        persistence.saveGame(gameState);
        
        // ACT
        const loaded = persistence.loadGame()!;
        
        // ASSERT
        expect(loaded.getJokers()).toHaveLength(1);
      });
    });

    describe('Round-Trip', () => {
      it('should preserve levelNumber through save/load', () => {
        // ARRANGE
        const originalLevel = gameState.getLevelNumber();
        persistence.saveGame(gameState);
        
        // ACT
        const loaded = persistence.loadGame()!;
        
        // ASSERT
        expect(loaded.getLevelNumber()).toBe(originalLevel);
      });

      it('should preserve money through save/load', () => {
        // ARRANGE
        gameState.addMoney(100);
        const originalMoney = gameState.getMoney();
        persistence.saveGame(gameState);
        
        // ACT
        const loaded = persistence.loadGame()!;
        
        // ASSERT
        expect(loaded.getMoney()).toBe(originalMoney);
      });

      it('should preserve hand count through save/load', () => {
        // ARRANGE
        const originalHandCount = gameState.getCurrentHand().length;
        persistence.saveGame(gameState);
        
        // ACT
        const loaded = persistence.loadGame()!;
        
        // ASSERT
        expect(loaded.getCurrentHand()).toHaveLength(originalHandCount);
      });
    });

    describe('Validation', () => {
      it('should throw error on corrupted JSON', () => {
        // ARRANGE
        localStorage.setItem('mini-balatro-save', 'invalid json {');
        
        // ACT & ASSERT
        expect(() => persistence.loadGame())
          .toThrow();
      });

      it('should throw error on missing required fields', () => {
        // ARRANGE
        localStorage.setItem('mini-balatro-save', JSON.stringify({
          version: '1.0.0',
          savedAt: new Date().toISOString()
          // Missing levelNumber, money, etc.
        }));
        
        // ACT & ASSERT
        expect(() => persistence.loadGame())
          .toThrow();
      });
    });
  });

  describe('hasSavedGame', () => {
    it('should return false initially', () => {
      // ACT
      const result = persistence.hasSavedGame();
      
      // ASSERT
      expect(result).toBe(false);
    });

    it('should return true after saving', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      const result = persistence.hasSavedGame();
      
      // ASSERT
      expect(result).toBe(true);
    });

    it('should return false after clearing', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      persistence.clearSave();
      
      // ACT
      const result = persistence.hasSavedGame();
      
      // ASSERT
      expect(result).toBe(false);
    });

    it('should not throw errors', () => {
      // ACT & ASSERT
      expect(() => persistence.hasSavedGame()).not.toThrow();
    });
  });

  describe('clearSave', () => {
    it('should remove save from localStorage', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      persistence.clearSave();
      
      // ASSERT
      const saved = localStorage.getItem('mini-balatro-save');
      expect(saved).toBeNull();
    });

    it('should make hasSavedGame return false', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      persistence.clearSave();
      
      // ASSERT
      expect(persistence.hasSavedGame()).toBe(false);
    });

    it('should be idempotent (can clear multiple times)', () => {
      // ACT & ASSERT
      expect(() => {
        persistence.clearSave();
        persistence.clearSave();
        persistence.clearSave();
      }).not.toThrow();
    });

    it('should not throw error if no save exists', () => {
      // ACT & ASSERT
      expect(() => persistence.clearSave()).not.toThrow();
    });
  });

  describe('getSaveMetadata', () => {
    it('should return null if no save exists', () => {
      // ACT
      const metadata = persistence.getSaveMetadata();
      
      // ASSERT
      expect(metadata).toBeNull();
    });

    it('should return savedAt timestamp', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      const metadata = persistence.getSaveMetadata();
      
      // ASSERT
      expect(metadata).not.toBeNull();
      expect(metadata!.savedAt).toBeInstanceOf(Date);
    });

    it('should return version string', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      const metadata = persistence.getSaveMetadata();
      
      // ASSERT
      expect(metadata).not.toBeNull();
      expect(metadata!.version).toBe('1.0.0');
    });

    it('should not throw errors', () => {
      // ACT & ASSERT
      expect(() => persistence.getSaveMetadata()).not.toThrow();
    });
  });

  describe('Version Compatibility', () => {
    it('should load save with same version', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      const loaded = persistence.loadGame();
      
      // ASSERT
      expect(loaded).not.toBeNull();
    });

    it('should load save with higher minor version', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // Modify save version to 1.1.0
      const saveData = JSON.parse(localStorage.getItem('mini-balatro-save')!);
      saveData.version = '1.1.0';
      localStorage.setItem('mini-balatro-save', JSON.stringify(saveData));
      
      // ACT & ASSERT
      // Should load successfully (forward compatible within major version)
      expect(() => persistence.loadGame()).not.toThrow();
    });

    it('should throw error on different major version', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // Modify save version to 2.0.0
      const saveData = JSON.parse(localStorage.getItem('mini-balatro-save')!);
      saveData.version = '2.0.0';
      localStorage.setItem('mini-balatro-save', JSON.stringify(saveData));
      
      // ACT & ASSERT
      expect(() => persistence.loadGame())
        .toThrow('Incompatible save version');
    });
  });

  describe('Complete Save/Load Cycles', () => {
    it('should handle minimal state (game start)', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      const loaded = persistence.loadGame()!;
      
      // ASSERT
      expect(loaded.getLevelNumber()).toBe(1);
      expect(loaded.getMoney()).toBe(5);
      expect(loaded.getCurrentHand()).toHaveLength(8);
    });

    it('should handle complex state', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      
      // Add complexity
      gameState.addMoney(100);
      const joker1 = new MultJoker('joker1', 'Joker 1', '+4 mult', 4);
      const joker2 = new MultJoker('joker2', 'Joker 2', '+5 mult', 5);
      gameState.addJoker(joker1);
      gameState.addJoker(joker2);
      
      const tarot = new TargetedTarot(
        'empress',
        'Empress',
        'Add mult',
        TarotEffect.ADD_MULT,
        (card) => card.addPermanentBonus(0, 4)
      );
      gameState.addConsumable(tarot);
      
      persistence.saveGame(gameState);
      
      // ACT
      const loaded = persistence.loadGame()!;
      
      // ASSERT
      expect(loaded.getMoney()).toBe(105);
      expect(loaded.getJokers()).toHaveLength(2);
      expect(loaded.getConsumables()).toHaveLength(1);
    });

    it('should handle mid-level state', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      
      // Play a hand
      const hand = gameState.getCurrentHand();
      gameState.selectCard(hand[0].id);
      gameState.playHand();
      
      persistence.saveGame(gameState);
      
      // ACT
      const loaded = persistence.loadGame()!;
      
      // ASSERT
      expect(loaded.getHandsRemaining()).toBe(2);
      expect(loaded.getAccumulatedScore()).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty jokers array', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      const loaded = persistence.loadGame()!;
      
      // ASSERT
      expect(loaded.getJokers()).toHaveLength(0);
    });

    it('should handle money = 0', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      gameState.spendMoney(5); // Spend all initial money
      persistence.saveGame(gameState);
      
      // ACT
      const loaded = persistence.loadGame()!;
      
      // ASSERT
      expect(loaded.getMoney()).toBe(0);
    });

    it('should handle level 24 (final level)', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      gameState['levelNumber'] = 24;
      persistence.saveGame(gameState);
      
      // ACT
      const loaded = persistence.loadGame()!;
      
      // ASSERT
      expect(loaded.getLevelNumber()).toBe(24);
    });
  });

  describe('localStorage Integration', () => {
    it('should use correct storage key', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      
      // ACT
      persistence.saveGame(gameState);
      
      // ASSERT
      expect(localStorage.getItem('mini-balatro-save')).not.toBeNull();
    });

    it('should persist across GamePersistence instances', () => {
      // ARRANGE
      const gameState = new GameState();
      gameState.dealHand();
      persistence.saveGame(gameState);
      
      // ACT
      const newPersistence = new GamePersistence();
      const loaded = newPersistence.loadGame();
      
      // ASSERT
      expect(loaded).not.toBeNull();
    });

    it('should have last save win on conflict', () => {
      // ARRANGE
      const gameState1 = new GameState();
      gameState1.dealHand();
      gameState1.addMoney(100);
      
      const gameState2 = new GameState();
      gameState2.dealHand();
      gameState2.addMoney(200);
      
      // ACT
      persistence.saveGame(gameState1);
      persistence.saveGame(gameState2);
      
      const loaded = persistence.loadGame()!;
      
      // ASSERT
      expect(loaded.getMoney()).toBe(205); // $5 initial + $200
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for GamePersistence
- All public methods tested
- Serialization/deserialization verified
- Version compatibility tested
- Error handling covered
- Round-trip save/load cycles verified

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| Constructor | Initialization | 3 | 0 | 0 | 3 |
| saveGame | Basic save | 5 | 1 | 0 | 6 |
| saveGame | Serialization | 8 | 0 | 0 | 8 |
| saveGame | Card serialization | 2 | 0 | 0 | 2 |
| saveGame | Complex state | 3 | 0 | 0 | 3 |
| saveGame | Error handling | 0 | 0 | 2 | 2 |
| loadGame | Basic load | 3 | 0 | 0 | 3 |
| loadGame | Deserialization | 6 | 0 | 0 | 6 |
| loadGame | Round-trip | 3 | 0 | 0 | 3 |
| loadGame | Validation | 0 | 0 | 2 | 2 |
| hasSavedGame | Check existence | 4 | 0 | 0 | 4 |
| clearSave | Remove save | 4 | 0 | 0 | 4 |
| getSaveMetadata | Metadata | 4 | 0 | 0 | 4 |
| Version | Compatibility | 3 | 0 | 1 | 4 |
| Integration | Full cycles | 3 | 0 | 0 | 3 |
| Edge Cases | Boundaries | 3 | 0 | 0 | 3 |
| localStorage | API usage | 3 | 0 | 0 | 3 |
| **TOTAL** | | | | | **63** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **90%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios:
  - Some internal serialization helpers
  - Quota exceeded handling (platform-specific)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/services/persistence.test.ts

# Run with coverage
npm test -- --coverage tests/unit/services/persistence.test.ts

# Run in watch mode
npm test -- --watch tests/unit/services/persistence.test.ts

# Run specific sections
npm test -- -t "saveGame" tests/unit/services/persistence.test.ts
npm test -- -t "Round-Trip" tests/unit/services/persistence.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Mock localStorage:** Tests must mock localStorage for Node.js environment
- **JSON round-trip:** Save/load must preserve all game state
- **Version compatibility:** Forward compatible within major version
- **Error recovery:** Corrupted saves should throw clear errors, not crash
- **Idempotency:** clearSave can be called multiple times safely
- **Persistence:** Multiple instances share same save in localStorage
- **Last write wins:** Concurrent saves (rare) should not corrupt data
- **Complex objects:** Cards, Jokers, Tarots must deserialize to proper instances
- **Empty collections:** Empty arrays must serialize/deserialize correctly
- **Boundary values:** $0, level 1, 0 hands all valid and testable

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to create complex game state
function createComplexGameState(): GameState {
  const gameState = new GameState();
  gameState.dealHand();
  
  // Add money
  gameState.addMoney(100);
  
  // Add jokers
  const joker1 = new MultJoker('joker1', 'Joker 1', '+4 mult', 4);
  const joker2 = new MultJoker('joker2', 'Joker 2', '+5 mult', 5);
  gameState.addJoker(joker1);
  gameState.addJoker(joker2);
  
  // Add tarot
  const tarot = new TargetedTarot(
    'empress',
    'Empress',
    'Add mult',
    TarotEffect.ADD_MULT,
    (card) => card.addPermanentBonus(0, 4)
  );
  gameState.addConsumable(tarot);
  
  // Add bonuses to cards
  const hand = gameState.getCurrentHand();
  hand[0].addPermanentBonus(20, 4);
  
  return gameState;
}

// Helper to verify save data structure
function verifySaveDataStructure(saveData: any): void {
  expect(saveData).toHaveProperty('version');
  expect(saveData).toHaveProperty('savedAt');
  expect(saveData).toHaveProperty('levelNumber');
  expect(saveData).toHaveProperty('money');
  expect(saveData).toHaveProperty('accumulatedScore');
  expect(saveData).toHaveProperty('handsRemaining');
  expect(saveData).toHaveProperty('discardsRemaining');
  expect(saveData).toHaveProperty('currentHand');
  expect(saveData).toHaveProperty('jokers');
  expect(saveData).toHaveProperty('consumables');
}

// Helper to compare game states
function compareGameStates(
  state1: GameState,
  state2: GameState,
  fieldsToCompare: string[]
): void {
  fieldsToCompare.forEach(field => {
    const getter = `get${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (typeof (state1 as any)[getter] === 'function') {
      expect((state1 as any)[getter]()).toEqual((state2 as any)[getter]());
    }
  });
}
```