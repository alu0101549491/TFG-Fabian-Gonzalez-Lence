# TESTING CONTEXT
Project: Mini Balatro
Components under test: GameConfig (configuration management service)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/services/config/game-config.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/services/config/game-config.ts
 * @desc Global game configuration class exposing constants for mechanics, shop, and difficulty.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { GAME_CONFIG, SHOP_CONFIG, BLIND_REWARDS, DIFFICULTY_CONFIG } from '../../utils/constants';

/**
 * Global game configuration constants.
 * Re-exports values from constants.ts for backward compatibility.
 * All configuration should be defined in constants.ts for centralized management.
 * 
 * Note: Card values and hand base values are now managed by BalancingConfig
 * which loads from JSON files for better data-driven design.
 */
export class GameConfig {
  // Game mechanics (imported from constants)
  public static readonly INITIAL_MONEY: number = GAME_CONFIG.INITIAL_MONEY;
  public static readonly MAX_JOKERS: number = GAME_CONFIG.MAX_JOKERS;
  public static readonly MAX_CONSUMABLES: number = GAME_CONFIG.MAX_CONSUMABLES;
  public static readonly HAND_SIZE: number = GAME_CONFIG.HAND_SIZE;
  public static readonly MAX_CARDS_TO_PLAY: number = GAME_CONFIG.MAX_CARDS_TO_PLAY;
  public static readonly MAX_HANDS_PER_BLIND: number = GAME_CONFIG.MAX_HANDS_PER_BLIND;
  public static readonly MAX_DISCARDS_PER_BLIND: number = GAME_CONFIG.MAX_DISCARDS_PER_BLIND;
  public static readonly VICTORY_ROUNDS: number = GAME_CONFIG.VICTORY_ROUNDS;
  public static readonly LEVELS_PER_ROUND: number = GAME_CONFIG.LEVELS_PER_ROUND;

  // Shop costs (imported from constants)
  public static readonly JOKER_COST: number = SHOP_CONFIG.JOKER_COST;
  public static readonly PLANET_COST: number = SHOP_CONFIG.PLANET_COST;
  public static readonly TAROT_COST: number = SHOP_CONFIG.TAROT_COST;
  public static readonly SHOP_REROLL_COST: number = SHOP_CONFIG.REROLL_COST;
  public static readonly ITEMS_PER_SHOP: number = SHOP_CONFIG.ITEMS_PER_SHOP;
  // Distribution weights for shop item generation
  public static readonly JOKER_WEIGHT: number = SHOP_CONFIG.JOKER_WEIGHT;
  public static readonly PLANET_WEIGHT: number = SHOP_CONFIG.PLANET_WEIGHT;
  public static readonly TAROT_WEIGHT: number = SHOP_CONFIG.TAROT_WEIGHT;

  // Blind rewards (imported from constants)
  public static readonly SMALL_BLIND_REWARD: number = BLIND_REWARDS.SMALL_BLIND;
  public static readonly BIG_BLIND_REWARD: number = BLIND_REWARDS.BIG_BLIND;
  public static readonly BOSS_BLIND_REWARD: number = BLIND_REWARDS.BOSS_BLIND;

  // Difficulty config (imported from constants)
  public static readonly ROUND_BASE_VALUES: number[] = DIFFICULTY_CONFIG.ROUND_BASE_VALUES;
  public static readonly SMALL_BLIND_MULTIPLIER: number = DIFFICULTY_CONFIG.SMALL_BLIND_MULTIPLIER;
  public static readonly BIG_BLIND_MULTIPLIER: number = DIFFICULTY_CONFIG.BIG_BLIND_MULTIPLIER;
  public static readonly BOSS_BLIND_MULTIPLIER: number = DIFFICULTY_CONFIG.BOSS_BLIND_MULTIPLIER;

  /**
   * Calculates score goal for blind using Balatro's difficulty values.
   * @param roundNumber - Current round number
   * @param blindType - Type of blind ('small', 'big', or 'boss')
   * @returns Score goal
   * @throws Error if invalid inputs
   */
  public static getBlindGoal(roundNumber: number, blindType: 'small' | 'big' | 'boss'): number {
    if (roundNumber <= 0) {
      throw new Error('Round number must be positive');
    }

    // Get base value for the round (rounds beyond 8 use round 8's value)
    const baseIndex = Math.min(roundNumber - 1, this.ROUND_BASE_VALUES.length - 1);
    const baseGoal = this.ROUND_BASE_VALUES[baseIndex];

    switch (blindType) {
      case 'small': return Math.floor(baseGoal * DIFFICULTY_CONFIG.SMALL_BLIND_MULTIPLIER);
      case 'big': return Math.floor(baseGoal * DIFFICULTY_CONFIG.BIG_BLIND_MULTIPLIER);
      case 'boss': return Math.floor(baseGoal * DIFFICULTY_CONFIG.BOSS_BLIND_MULTIPLIER);
      default: throw new Error(`Invalid blind type: ${blindType}`);
    }
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

## GameConfig Class Requirements:

### Purpose:
- Centralized configuration for game constants
- Single source of truth for game balance
- Easy to modify for playtesting/balancing
- Type-safe access to configuration values

### Configuration Categories:

#### 1. Game Rules:
```typescript
INITIAL_MONEY: number = 5;
INITIAL_HANDS_PER_LEVEL: number = 3;
INITIAL_DISCARDS_PER_LEVEL: number = 3;
CARDS_IN_HAND: number = 8;
MAX_SELECTED_CARDS: number = 5;
VICTORY_LEVEL: number = 24;
```

#### 2. Inventory Limits:
```typescript
MAX_JOKERS: number = 5;
MAX_CONSUMABLES: number = 2;
```

#### 3. Shop Configuration:
```typescript
SHOP_ITEMS_COUNT: number = 4;
SHOP_REROLL_COST: number = 3;
JOKER_COST: number = 5;
PLANET_COST: number = 3;
TAROT_COST: number = 3;
```

#### 4. Blind Progression:
```typescript
BASE_BLIND_SCORE: number = 300;
BLIND_SCORE_MULTIPLIER: number = 1.5; // Exponential growth per round
SMALL_BLIND_MULTIPLIER: number = 1.0;
BIG_BLIND_MULTIPLIER: number = 1.5;
BOSS_BLIND_MULTIPLIER: number = 2.0;
```

#### 5. Blind Rewards:
```typescript
SMALL_BLIND_REWARD: number = 2;
BIG_BLIND_REWARD: number = 5;
BOSS_BLIND_REWARD: number = 10;
```

#### 6. Deck Configuration:
```typescript
DECK_SIZE: number = 52;
CARDS_PER_SUIT: number = 13;
```

### Implementation Approach:

**Option 1: Static Class (Singleton Pattern)**
```typescript
export class GameConfig {
  private constructor() {} // Prevent instantiation
  
  // Game Rules
  public static readonly INITIAL_MONEY = 5;
  public static readonly INITIAL_HANDS_PER_LEVEL = 3;
  // ... etc
  
  // Optional: Getters for computed values
  public static getBlindGoal(round: number, blindType: 'small' | 'big' | 'boss'): number {
    const base = this.BASE_BLIND_SCORE * Math.pow(this.BLIND_SCORE_MULTIPLIER, round - 1);
    const multipliers = {
      small: this.SMALL_BLIND_MULTIPLIER,
      big: this.BIG_BLIND_MULTIPLIER,
      boss: this.BOSS_BLIND_MULTIPLIER
    };
    return Math.floor(base * multipliers[blindType]);
  }
}
```

**Option 2: Constant Object Export**
```typescript
export const GameConfig = {
  INITIAL_MONEY: 5,
  INITIAL_HANDS_PER_LEVEL: 3,
  // ... etc
} as const;
```

### Helper Methods (if implemented):

**getBlindGoal(round: number, blindType: string): number**
- Calculates blind goal score for given round and type
- Formula: BASE_BLIND_SCORE × BLIND_SCORE_MULTIPLIER^(round-1) × blindType multiplier
- Example: Round 1 Small = 300 × 1.5^0 × 1.0 = 300
- Example: Round 2 Big = 300 × 1.5^1 × 1.5 = 675

**getBlindReward(blindType: string): number**
- Returns reward money for blind type
- Small: $2, Big: $5, Boss: $10

**getShopItemCost(itemType: string): number**
- Returns cost for shop item type
- Joker: $5, Planet: $3, Tarot: $3

**isValidLevel(level: number): boolean**
- Returns true if level is in valid range (1-24)
- Used for input validation

### Validation Requirements:
- All numeric values > 0
- CARDS_IN_HAND >= MAX_SELECTED_CARDS
- VICTORY_LEVEL >= 1
- MAX_JOKERS >= 1
- MAX_CONSUMABLES >= 1
- Multipliers > 0

### Edge Cases:
- Access non-existent config property (compile-time error in TypeScript)
- Modify config at runtime (should be readonly/const)
- Division by zero (shouldn't happen with positive values)
- Very large round numbers (exponential growth)
- Negative inputs to helper methods
- Invalid blind types to helper methods

# TASK

Generate a complete unit test suite for GameConfig that covers:

## 1. Configuration Values Tests

### Game Rules:
- [ ] INITIAL_MONEY = 5
- [ ] INITIAL_HANDS_PER_LEVEL = 3
- [ ] INITIAL_DISCARDS_PER_LEVEL = 3
- [ ] CARDS_IN_HAND = 8
- [ ] MAX_SELECTED_CARDS = 5
- [ ] VICTORY_LEVEL = 24

### Inventory Limits:
- [ ] MAX_JOKERS = 5
- [ ] MAX_CONSUMABLES = 2

### Shop Configuration:
- [ ] SHOP_ITEMS_COUNT = 4
- [ ] SHOP_REROLL_COST = 3
- [ ] JOKER_COST = 5
- [ ] PLANET_COST = 3
- [ ] TAROT_COST = 3

### Blind Progression:
- [ ] BASE_BLIND_SCORE = 300
- [ ] BLIND_SCORE_MULTIPLIER = 1.5
- [ ] SMALL_BLIND_MULTIPLIER = 1.0
- [ ] BIG_BLIND_MULTIPLIER = 1.5
- [ ] BOSS_BLIND_MULTIPLIER = 2.0

### Blind Rewards:
- [ ] SMALL_BLIND_REWARD = 2
- [ ] BIG_BLIND_REWARD = 5
- [ ] BOSS_BLIND_REWARD = 10

### Deck Configuration:
- [ ] DECK_SIZE = 52
- [ ] CARDS_PER_SUIT = 13

## 2. Value Type Tests

- [ ] All numeric values are numbers
- [ ] All values are positive (> 0)
- [ ] All values are integers (no decimals except multiplier)
- [ ] BLIND_SCORE_MULTIPLIER is decimal (1.5)

## 3. Logical Consistency Tests

- [ ] CARDS_IN_HAND (8) >= MAX_SELECTED_CARDS (5)
- [ ] DECK_SIZE (52) = CARDS_PER_SUIT (13) × 4 suits
- [ ] VICTORY_LEVEL (24) = 8 rounds × 3 levels
- [ ] MAX_JOKERS >= 1 (can have at least one)
- [ ] MAX_CONSUMABLES >= 1 (can have at least one)

## 4. Helper Method Tests (if implemented)

### getBlindGoal():
- [ ] Round 1 Small = 300
- [ ] Round 1 Big = 450
- [ ] Round 1 Boss = 600
- [ ] Round 2 Small = 450
- [ ] Round 2 Big = 675
- [ ] Round 2 Boss = 900
- [ ] Round 3 Small = 675
- [ ] Round 5 Small = 1,519
- [ ] Round 10 Small ≈ 38,443
- [ ] Handles large round numbers
- [ ] Throws error on round ≤ 0
- [ ] Throws error on invalid blind type

### getBlindReward():
- [ ] Small blind returns 2
- [ ] Big blind returns 5
- [ ] Boss blind returns 10
- [ ] Throws error on invalid blind type

### getShopItemCost():
- [ ] Joker returns 5
- [ ] Planet returns 3
- [ ] Tarot returns 3
- [ ] Throws error on invalid item type

### isValidLevel() (if implemented):
- [ ] Returns true for level 1
- [ ] Returns true for level 24
- [ ] Returns true for level 12 (middle)
- [ ] Returns false for level 0
- [ ] Returns false for level 25
- [ ] Returns false for negative levels

## 5. Immutability Tests (if applicable)

- [ ] Config values cannot be modified at runtime
- [ ] Attempting to assign throws error or fails silently
- [ ] Config remains constant across tests

## 6. Integration Tests

### With Blind System:
- [ ] SmallBlind uses SMALL_BLIND_REWARD
- [ ] BigBlind uses BIG_BLIND_REWARD
- [ ] BossBlind uses BOSS_BLIND_REWARD
- [ ] Blind goal formula matches config values

### With GameState:
- [ ] Initial money matches INITIAL_MONEY
- [ ] Initial hands matches INITIAL_HANDS_PER_LEVEL
- [ ] Initial discards matches INITIAL_DISCARDS_PER_LEVEL
- [ ] Hand size matches CARDS_IN_HAND
- [ ] Max jokers enforced by MAX_JOKERS
- [ ] Max consumables enforced by MAX_CONSUMABLES

### With Shop:
- [ ] Shop items count matches SHOP_ITEMS_COUNT
- [ ] Reroll cost matches SHOP_REROLL_COST
- [ ] Joker cost matches JOKER_COST
- [ ] Planet cost matches PLANET_COST
- [ ] Tarot cost matches TAROT_COST

## 7. Edge Cases

- [ ] BLIND_SCORE_MULTIPLIER exponentiation for round 100
- [ ] MAX_SELECTED_CARDS boundary (can select exactly 5)
- [ ] VICTORY_LEVEL boundary (level 24 is victory)
- [ ] Division operations (no divide by zero)

## 8. Documentation Tests

- [ ] All config values have clear names
- [ ] Config is properly exported
- [ ] TypeScript types correct

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect } from '@jest/globals';
import { GameConfig } from '@/services/config';

describe('GameConfig', () => {
  describe('Game Rules Configuration', () => {
    it('should have INITIAL_MONEY = 5', () => {
      // ASSERT
      expect(GameConfig.INITIAL_MONEY).toBe(5);
    });

    it('should have INITIAL_HANDS_PER_LEVEL = 3', () => {
      // ASSERT
      expect(GameConfig.INITIAL_HANDS_PER_LEVEL).toBe(3);
    });

    it('should have INITIAL_DISCARDS_PER_LEVEL = 3', () => {
      // ASSERT
      expect(GameConfig.INITIAL_DISCARDS_PER_LEVEL).toBe(3);
    });

    it('should have CARDS_IN_HAND = 8', () => {
      // ASSERT
      expect(GameConfig.CARDS_IN_HAND).toBe(8);
    });

    it('should have MAX_SELECTED_CARDS = 5', () => {
      // ASSERT
      expect(GameConfig.MAX_SELECTED_CARDS).toBe(5);
    });

    it('should have VICTORY_LEVEL = 24', () => {
      // ASSERT
      expect(GameConfig.VICTORY_LEVEL).toBe(24);
    });
  });

  describe('Inventory Limits Configuration', () => {
    it('should have MAX_JOKERS = 5', () => {
      // ASSERT
      expect(GameConfig.MAX_JOKERS).toBe(5);
    });

    it('should have MAX_CONSUMABLES = 2', () => {
      // ASSERT
      expect(GameConfig.MAX_CONSUMABLES).toBe(2);
    });
  });

  describe('Shop Configuration', () => {
    it('should have SHOP_ITEMS_COUNT = 4', () => {
      // ASSERT
      expect(GameConfig.SHOP_ITEMS_COUNT).toBe(4);
    });

    it('should have SHOP_REROLL_COST = 3', () => {
      // ASSERT
      expect(GameConfig.SHOP_REROLL_COST).toBe(3);
    });

    it('should have JOKER_COST = 5', () => {
      // ASSERT
      expect(GameConfig.JOKER_COST).toBe(5);
    });

    it('should have PLANET_COST = 3', () => {
      // ASSERT
      expect(GameConfig.PLANET_COST).toBe(3);
    });

    it('should have TAROT_COST = 3', () => {
      // ASSERT
      expect(GameConfig.TAROT_COST).toBe(3);
    });
  });

  describe('Blind Progression Configuration', () => {
    it('should have BASE_BLIND_SCORE = 300', () => {
      // ASSERT
      expect(GameConfig.BASE_BLIND_SCORE).toBe(300);
    });

    it('should have BLIND_SCORE_MULTIPLIER = 1.5', () => {
      // ASSERT
      expect(GameConfig.BLIND_SCORE_MULTIPLIER).toBe(1.5);
    });

    it('should have SMALL_BLIND_MULTIPLIER = 1.0', () => {
      // ASSERT
      expect(GameConfig.SMALL_BLIND_MULTIPLIER).toBe(1.0);
    });

    it('should have BIG_BLIND_MULTIPLIER = 1.5', () => {
      // ASSERT
      expect(GameConfig.BIG_BLIND_MULTIPLIER).toBe(1.5);
    });

    it('should have BOSS_BLIND_MULTIPLIER = 2.0', () => {
      // ASSERT
      expect(GameConfig.BOSS_BLIND_MULTIPLIER).toBe(2.0);
    });
  });

  describe('Blind Rewards Configuration', () => {
    it('should have SMALL_BLIND_REWARD = 2', () => {
      // ASSERT
      expect(GameConfig.SMALL_BLIND_REWARD).toBe(2);
    });

    it('should have BIG_BLIND_REWARD = 5', () => {
      // ASSERT
      expect(GameConfig.BIG_BLIND_REWARD).toBe(5);
    });

    it('should have BOSS_BLIND_REWARD = 10', () => {
      // ASSERT
      expect(GameConfig.BOSS_BLIND_REWARD).toBe(10);
    });
  });

  describe('Deck Configuration', () => {
    it('should have DECK_SIZE = 52', () => {
      // ASSERT
      expect(GameConfig.DECK_SIZE).toBe(52);
    });

    it('should have CARDS_PER_SUIT = 13', () => {
      // ASSERT
      expect(GameConfig.CARDS_PER_SUIT).toBe(13);
    });
  });

  describe('Value Type Validation', () => {
    it('should have all numeric values as numbers', () => {
      // ASSERT
      expect(typeof GameConfig.INITIAL_MONEY).toBe('number');
      expect(typeof GameConfig.INITIAL_HANDS_PER_LEVEL).toBe('number');
      expect(typeof GameConfig.CARDS_IN_HAND).toBe('number');
      expect(typeof GameConfig.MAX_JOKERS).toBe('number');
      expect(typeof GameConfig.SHOP_ITEMS_COUNT).toBe('number');
      expect(typeof GameConfig.BASE_BLIND_SCORE).toBe('number');
      expect(typeof GameConfig.SMALL_BLIND_REWARD).toBe('number');
    });

    it('should have all values positive (> 0)', () => {
      // ASSERT
      expect(GameConfig.INITIAL_MONEY).toBeGreaterThan(0);
      expect(GameConfig.INITIAL_HANDS_PER_LEVEL).toBeGreaterThan(0);
      expect(GameConfig.INITIAL_DISCARDS_PER_LEVEL).toBeGreaterThan(0);
      expect(GameConfig.CARDS_IN_HAND).toBeGreaterThan(0);
      expect(GameConfig.MAX_SELECTED_CARDS).toBeGreaterThan(0);
      expect(GameConfig.VICTORY_LEVEL).toBeGreaterThan(0);
      expect(GameConfig.MAX_JOKERS).toBeGreaterThan(0);
      expect(GameConfig.MAX_CONSUMABLES).toBeGreaterThan(0);
      expect(GameConfig.SHOP_ITEMS_COUNT).toBeGreaterThan(0);
      expect(GameConfig.BASE_BLIND_SCORE).toBeGreaterThan(0);
      expect(GameConfig.BLIND_SCORE_MULTIPLIER).toBeGreaterThan(0);
    });

    it('should have integer values for counts (no decimals)', () => {
      // ASSERT
      expect(Number.isInteger(GameConfig.INITIAL_MONEY)).toBe(true);
      expect(Number.isInteger(GameConfig.CARDS_IN_HAND)).toBe(true);
      expect(Number.isInteger(GameConfig.MAX_JOKERS)).toBe(true);
      expect(Number.isInteger(GameConfig.SHOP_ITEMS_COUNT)).toBe(true);
      expect(Number.isInteger(GameConfig.DECK_SIZE)).toBe(true);
    });

    it('should have decimal value for BLIND_SCORE_MULTIPLIER', () => {
      // ASSERT
      expect(GameConfig.BLIND_SCORE_MULTIPLIER).toBe(1.5);
      expect(Number.isInteger(GameConfig.BLIND_SCORE_MULTIPLIER)).toBe(false);
    });
  });

  describe('Logical Consistency', () => {
    it('should have CARDS_IN_HAND >= MAX_SELECTED_CARDS', () => {
      // ASSERT
      expect(GameConfig.CARDS_IN_HAND).toBeGreaterThanOrEqual(GameConfig.MAX_SELECTED_CARDS);
    });

    it('should have DECK_SIZE = CARDS_PER_SUIT × 4', () => {
      // ASSERT
      expect(GameConfig.DECK_SIZE).toBe(GameConfig.CARDS_PER_SUIT * 4);
    });

    it('should have VICTORY_LEVEL = 8 rounds × 3 levels', () => {
      // ASSERT
      expect(GameConfig.VICTORY_LEVEL).toBe(24); // 8 × 3
    });

    it('should have MAX_JOKERS >= 1', () => {
      // ASSERT
      expect(GameConfig.MAX_JOKERS).toBeGreaterThanOrEqual(1);
    });

    it('should have MAX_CONSUMABLES >= 1', () => {
      // ASSERT
      expect(GameConfig.MAX_CONSUMABLES).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Helper Methods', () => {
    // Only include if helper methods are implemented
    describe('getBlindGoal', () => {
      it('should calculate round 1 small blind = 300', () => {
        // ACT
        const goal = GameConfig.getBlindGoal(1, 'small');
        
        // ASSERT
        expect(goal).toBe(300);
      });

      it('should calculate round 1 big blind = 450', () => {
        // ACT
        const goal = GameConfig.getBlindGoal(1, 'big');
        
        // ASSERT
        expect(goal).toBe(450);
      });

      it('should calculate round 1 boss blind = 600', () => {
        // ACT
        const goal = GameConfig.getBlindGoal(1, 'boss');
        
        // ASSERT
        expect(goal).toBe(600);
      });

      it('should calculate round 2 small blind = 450', () => {
        // ACT
        const goal = GameConfig.getBlindGoal(2, 'small');
        
        // ASSERT
        expect(goal).toBe(450);
      });

      it('should calculate round 2 big blind = 675', () => {
        // ACT
        const goal = GameConfig.getBlindGoal(2, 'big');
        
        // ASSERT
        expect(goal).toBeCloseTo(675, 0);
      });

      it('should calculate round 5 small blind ≈ 1,519', () => {
        // ACT
        const goal = GameConfig.getBlindGoal(5, 'small');
        
        // ASSERT
        expect(goal).toBeCloseTo(1519, 0);
      });

      it('should handle large round numbers', () => {
        // ACT
        const goal = GameConfig.getBlindGoal(10, 'small');
        
        // ASSERT
        expect(goal).toBeGreaterThan(30000);
        expect(Number.isFinite(goal)).toBe(true);
      });

      it('should throw error on round ≤ 0', () => {
        // ACT & ASSERT
        expect(() => GameConfig.getBlindGoal(0, 'small'))
          .toThrow();
      });

      it('should throw error on invalid blind type', () => {
        // ACT & ASSERT
        expect(() => GameConfig.getBlindGoal(1, 'invalid' as any))
          .toThrow();
      });
    });

    describe('getBlindReward', () => {
      it('should return 2 for small blind', () => {
        // ACT
        const reward = GameConfig.getBlindReward('small');
        
        // ASSERT
        expect(reward).toBe(2);
      });

      it('should return 5 for big blind', () => {
        // ACT
        const reward = GameConfig.getBlindReward('big');
        
        // ASSERT
        expect(reward).toBe(5);
      });

      it('should return 10 for boss blind', () => {
        // ACT
        const reward = GameConfig.getBlindReward('boss');
        
        // ASSERT
        expect(reward).toBe(10);
      });

      it('should throw error on invalid blind type', () => {
        // ACT & ASSERT
        expect(() => GameConfig.getBlindReward('invalid' as any))
          .toThrow();
      });
    });

    describe('getShopItemCost', () => {
      it('should return 5 for joker', () => {
        // ACT
        const cost = GameConfig.getShopItemCost('joker');
        
        // ASSERT
        expect(cost).toBe(5);
      });

      it('should return 3 for planet', () => {
        // ACT
        const cost = GameConfig.getShopItemCost('planet');
        
        // ASSERT
        expect(cost).toBe(3);
      });

      it('should return 3 for tarot', () => {
        // ACT
        const cost = GameConfig.getShopItemCost('tarot');
        
        // ASSERT
        expect(cost).toBe(3);
      });

      it('should throw error on invalid item type', () => {
        // ACT & ASSERT
        expect(() => GameConfig.getShopItemCost('invalid' as any))
          .toThrow();
      });
    });

    describe('isValidLevel', () => {
      it('should return true for level 1', () => {
        // ACT
        const result = GameConfig.isValidLevel(1);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return true for level 24', () => {
        // ACT
        const result = GameConfig.isValidLevel(24);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return true for level 12', () => {
        // ACT
        const result = GameConfig.isValidLevel(12);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return false for level 0', () => {
        // ACT
        const result = GameConfig.isValidLevel(0);
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should return false for level 25', () => {
        // ACT
        const result = GameConfig.isValidLevel(25);
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should return false for negative levels', () => {
        // ACT
        const result = GameConfig.isValidLevel(-5);
        
        // ASSERT
        expect(result).toBe(false);
      });
    });
  });

  describe('Immutability', () => {
    it('should not allow modification of INITIAL_MONEY', () => {
      // ARRANGE
      const originalValue = GameConfig.INITIAL_MONEY;
      
      // ACT - Attempt to modify (should fail silently or throw)
      try {
        (GameConfig as any).INITIAL_MONEY = 100;
      } catch (e) {
        // Expected in strict mode
      }
      
      // ASSERT
      expect(GameConfig.INITIAL_MONEY).toBe(originalValue);
    });

    it('should maintain consistent values across tests', () => {
      // ASSERT - Values should be same as in first tests
      expect(GameConfig.INITIAL_MONEY).toBe(5);
      expect(GameConfig.CARDS_IN_HAND).toBe(8);
      expect(GameConfig.MAX_JOKERS).toBe(5);
    });
  });

  describe('Integration with Game Systems', () => {
    describe('Blind System Integration', () => {
      it('should provide correct reward values for blind calculation', () => {
        // ARRANGE - Simulate blind reward calculation
        const smallReward = GameConfig.SMALL_BLIND_REWARD;
        const bigReward = GameConfig.BIG_BLIND_REWARD;
        const bossReward = GameConfig.BOSS_BLIND_REWARD;
        
        // ASSERT
        expect(smallReward).toBeLessThan(bigReward);
        expect(bigReward).toBeLessThan(bossReward);
      });

      it('should provide progression formula components', () => {
        // ARRANGE - Simulate blind goal calculation
        const base = GameConfig.BASE_BLIND_SCORE;
        const multiplier = GameConfig.BLIND_SCORE_MULTIPLIER;
        const round = 2;
        
        // ACT
        const calculated = base * Math.pow(multiplier, round - 1);
        
        // ASSERT
        expect(calculated).toBe(450); // Round 2 base
      });
    });

    describe('GameState Integration', () => {
      it('should provide initial game state values', () => {
        // ARRANGE
        const initialMoney = GameConfig.INITIAL_MONEY;
        const initialHands = GameConfig.INITIAL_HANDS_PER_LEVEL;
        const initialDiscards = GameConfig.INITIAL_DISCARDS_PER_LEVEL;
        
        // ASSERT
        expect(initialMoney).toBe(5);
        expect(initialHands).toBe(3);
        expect(initialDiscards).toBe(3);
      });

      it('should enforce inventory limits', () => {
        // ARRANGE
        const maxJokers = GameConfig.MAX_JOKERS;
        const maxConsumables = GameConfig.MAX_CONSUMABLES;
        
        // ASSERT
        expect(maxJokers).toBe(5);
        expect(maxConsumables).toBe(2);
      });
    });

    describe('Shop Integration', () => {
      it('should provide shop configuration', () => {
        // ARRANGE
        const itemsCount = GameConfig.SHOP_ITEMS_COUNT;
        const rerollCost = GameConfig.SHOP_REROLL_COST;
        
        // ASSERT
        expect(itemsCount).toBe(4);
        expect(rerollCost).toBe(3);
      });

      it('should provide item costs', () => {
        // ARRANGE
        const jokerCost = GameConfig.JOKER_COST;
        const planetCost = GameConfig.PLANET_COST;
        const tarotCost = GameConfig.TAROT_COST;
        
        // ASSERT
        expect(jokerCost).toBe(5);
        expect(planetCost).toBe(3);
        expect(tarotCost).toBe(3);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle exponentiation for very large rounds', () => {
      // ACT - If helper method exists
      if (typeof GameConfig.getBlindGoal === 'function') {
        const goal = GameConfig.getBlindGoal(100, 'small');
        
        // ASSERT
        expect(Number.isFinite(goal)).toBe(true);
        expect(goal).toBeGreaterThan(0);
      }
    });

    it('should have MAX_SELECTED_CARDS as exact boundary', () => {
      // ASSERT
      expect(GameConfig.MAX_SELECTED_CARDS).toBe(5);
      expect(GameConfig.CARDS_IN_HAND).toBeGreaterThanOrEqual(5);
    });

    it('should have VICTORY_LEVEL as exact boundary', () => {
      // ASSERT
      expect(GameConfig.VICTORY_LEVEL).toBe(24);
    });
  });

  describe('Configuration Export', () => {
    it('should be properly exported', () => {
      // ASSERT
      expect(GameConfig).toBeDefined();
      expect(typeof GameConfig).toBe('object');
    });

    it('should have all expected properties', () => {
      // ASSERT
      expect(GameConfig).toHaveProperty('INITIAL_MONEY');
      expect(GameConfig).toHaveProperty('INITIAL_HANDS_PER_LEVEL');
      expect(GameConfig).toHaveProperty('CARDS_IN_HAND');
      expect(GameConfig).toHaveProperty('MAX_JOKERS');
      expect(GameConfig).toHaveProperty('SHOP_ITEMS_COUNT');
      expect(GameConfig).toHaveProperty('BASE_BLIND_SCORE');
      expect(GameConfig).toHaveProperty('DECK_SIZE');
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for GameConfig
- All configuration values verified
- Type validation tests
- Logical consistency tests
- Helper methods tested (if implemented)
- Immutability verified
- Integration with other systems verified

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| Game Rules | Value verification | 6 | 0 | 0 | 6 |
| Inventory | Value verification | 2 | 0 | 0 | 2 |
| Shop Config | Value verification | 5 | 0 | 0 | 5 |
| Blind Progression | Value verification | 5 | 0 | 0 | 5 |
| Blind Rewards | Value verification | 3 | 0 | 0 | 3 |
| Deck Config | Value verification | 2 | 0 | 0 | 2 |
| Type Validation | Type checks | 4 | 0 | 0 | 4 |
| Logical Consistency | Relationships | 5 | 0 | 0 | 5 |
| getBlindGoal | Calculations | 7 | 1 | 2 | 10 |
| getBlindReward | Returns | 3 | 0 | 1 | 4 |
| getShopItemCost | Returns | 3 | 0 | 1 | 4 |
| isValidLevel | Validation | 6 | 0 | 0 | 6 |
| Immutability | Modification | 2 | 0 | 0 | 2 |
| Integration | System checks | 6 | 0 | 0 | 6 |
| Edge Cases | Boundaries | 3 | 0 | 0 | 3 |
| Export | Module | 2 | 0 | 0 | 2 |
| **TOTAL** | | | | | **69** |

## 3. Expected Coverage
- Estimated line coverage: **100%** (simple config class)
- Estimated branch coverage: **100%** (if helper methods minimal)
- Methods covered: **All public methods/properties** (100%)
- Uncovered scenarios: None expected

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/services/config.test.ts

# Run with coverage
npm test -- --coverage tests/unit/services/config.test.ts

# Run in watch mode
npm test -- --watch tests/unit/services/config.test.ts

# Run specific sections
npm test -- -t "Game Rules" tests/unit/services/config.test.ts
npm test -- -t "Helper Methods" tests/unit/services/config.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Immutability:** Config should be read-only (TypeScript readonly or Object.freeze)
- **Type safety:** All values should be typed correctly
- **Logical consistency:** Related values should make sense together
- **Helper methods:** Only test if implemented; skip section if not
- **Integration:** Config values used throughout entire codebase
- **Balancing:** These are the core game balance values
- **Documentation:** Config serves as documentation for game rules

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to verify all numeric configs are positive
function verifyAllPositive(config: typeof GameConfig): void {
  Object.keys(config).forEach(key => {
    const value = (config as any)[key];
    if (typeof value === 'number') {
      expect(value).toBeGreaterThan(0);
    }
  });
}

// Helper to verify config structure
function verifyConfigStructure(config: typeof GameConfig): void {
  const expectedProperties = [
    'INITIAL_MONEY',
    'INITIAL_HANDS_PER_LEVEL',
    'INITIAL_DISCARDS_PER_LEVEL',
    'CARDS_IN_HAND',
    'MAX_SELECTED_CARDS',
    'VICTORY_LEVEL',
    'MAX_JOKERS',
    'MAX_CONSUMABLES',
    'SHOP_ITEMS_COUNT',
    'SHOP_REROLL_COST',
    'JOKER_COST',
    'PLANET_COST',
    'TAROT_COST',
    'BASE_BLIND_SCORE',
    'BLIND_SCORE_MULTIPLIER',
    'SMALL_BLIND_MULTIPLIER',
    'BIG_BLIND_MULTIPLIER',
    'BOSS_BLIND_MULTIPLIER',
    'SMALL_BLIND_REWARD',
    'BIG_BLIND_REWARD',
    'BOSS_BLIND_REWARD',
    'DECK_SIZE',
    'CARDS_PER_SUIT'
  ];
  
  expectedProperties.forEach(prop => {
    expect(config).toHaveProperty(prop);
  });
}

// Helper to calculate blind goal manually
function calculateBlindGoal(
  round: number,
  blindType: 'small' | 'big' | 'boss'
): number {
  const base = 300 * Math.pow(1.5, round - 1);
  const multipliers = { small: 1.0, big: 1.5, boss: 2.0 };
  return Math.floor(base * multipliers[blindType]);
}
```