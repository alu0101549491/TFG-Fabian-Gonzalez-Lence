# TESTING CONTEXT
Project: Mini Balatro
Components under test: Tarot (abstract), TarotEffect (enum), InstantTarot, TargetedTarot
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/models/special-cards/tarots/tarot-effect.enum.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/tarots/tarot-effect.enum.ts
 * @desc TarotEffect enumeration for all tarot card effect types.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enum defining all tarot card effect types.
 */
export enum TarotEffect {
  ADD_CHIPS = 'ADD_CHIPS',         // The Emperor
  ADD_MULT = 'ADD_MULT',           // The Empress
  CHANGE_SUIT = 'CHANGE_SUIT',     // The Star, Moon, Sun, World
  UPGRADE_VALUE = 'UPGRADE_VALUE', // Strength
  DUPLICATE = 'DUPLICATE',         // Death
  DESTROY = 'DESTROY'              // The Hanged Man
}
```

## File 2: src/models/special-cards/tarots/tarot.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/tarots/tarot.ts
 * @desc Abstract base class for all tarot cards.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Card } from '../../core/card';
import { GameState } from '../../game/game-state';

/**
 * Abstract base class for all tarot cards.
 * Tarots are single-use consumable cards with various effects.
 */
export abstract class Tarot {
  /**
   * Creates a tarot card with specified properties.
   * @param id - Unique identifier for the tarot
   * @param name - Tarot card name
   * @param description - Effect description for UI
   * @throws Error if name or description is empty
   */
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string
  ) {
    if (!name || !description) {
      throw new Error('Tarot name and description must not be empty');
    }
  }

  /**
   * Uses the tarot card.
   * @param target - Optional target card or game state
   */
  public abstract use(target?: Card | GameState): void;

  /**
   * Returns whether this tarot needs a target card.
   * @returns True if targeted tarot, false if instant
   */
  public abstract requiresTarget(): boolean;
}
```

## File 3: src/models/special-cards/tarots/instant-tarot.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/tarots/instant-tarot.ts
 * @desc Tarot card with instant effect that doesn't require a target.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Tarot } from './tarot';
import { GameState } from '../../game/game-state';

/**
 * Tarot card with instant effect that doesn't require a target.
 * Example: The Hermit (doubles money).
 */
export class InstantTarot extends Tarot {
  /**
   * Creates an instant tarot with specified effect function.
   * @param id - Unique identifier for the tarot
   * @param name - Tarot card name
   * @param description - Effect description
   * @param effect - Effect function to execute
   * @throws Error if effect is null
   */
  constructor(
    id: string,
    name: string,
    description: string,
    private readonly effect: (gameState: GameState) => void
  ) {
    super(id, name, description);
    if (!effect) {
      throw new Error('Effect function cannot be null');
    }
  }

  /**
   * Executes the instant effect on game state.
   * @param gameState - The game state to modify
   * @throws Error if gameState is null
   */
  public use(gameState: GameState): void {
    if (!gameState) {
      throw new Error('Game state cannot be null');
    }

    this.effect(gameState);
    console.log(`[${this.name}] Instant effect applied`);
  }

  /**
   * Returns false (instant tarots don't need targets).
   * @returns False
   */
  public requiresTarget(): boolean {
    return false;
  }
}
```

## File 4: src/models/special-cards/tarots/targeted-tarot.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/tarots/targeted-tarot.ts
 * @desc Tarot card that requires selecting a target card.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Tarot } from './tarot';
import { TarotEffect } from './tarot-effect.enum';
import { Card } from '../../core/card';
import { Suit } from '../../core/suit.enum';

/**
 * Tarot card that requires selecting a target card.
 * Examples: The Empress, The Emperor, Strength, suit changes.
 */
export class TargetedTarot extends Tarot {
  /**
   * NOTE: `TargetedTarot` initializes a strategy map at construction time
   * which captures `this.effectValue`. If `effectValue` is changed after
   * construction, the strategies will still use the originally captured
   * value. To change behavior dynamically, create a new `TargetedTarot`
   * or call `initializeStrategies()` again.
   */
  private effectStrategies: Map<TarotEffect, (target: Card) => void> = new Map();

  /**
   * Creates a targeted tarot with specified effect.
   * @param id - Unique identifier for the tarot
   * @param name - Tarot card name
   * @param description - Effect description
   * @param effectType - Type of effect this tarot applies
   * @param effectValue - Optional value for effect
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly effectType: TarotEffect,
    public readonly effectValue?: any
  ) {
    super(id, name, description);
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.effectStrategies.set(TarotEffect.ADD_CHIPS, (target: Card) => {
      if (typeof this.effectValue !== 'number') {
        throw new Error('Effect value must be a number for ADD_CHIPS');
      }
      target.addPermanentBonus(this.effectValue, 0);
      console.log(`[${this.name}] Added ${this.effectValue} chips to ${target.getDisplayString()}`);
    });

    this.effectStrategies.set(TarotEffect.ADD_MULT, (target: Card) => {
      if (typeof this.effectValue !== 'number') {
        throw new Error('Effect value must be a number for ADD_MULT');
      }
      target.addPermanentBonus(0, this.effectValue);
      console.log(`[${this.name}] Added ${this.effectValue} mult to ${target.getDisplayString()}`);
    });

    this.effectStrategies.set(TarotEffect.CHANGE_SUIT, (target: Card) => {
      if (!Object.values(Suit).includes(this.effectValue)) {
        throw new Error('Effect value must be a valid Suit for CHANGE_SUIT');
      }
      target.changeSuit(this.effectValue);
      console.log(`[${this.name}] Changed suit of ${target.getDisplayString()} to ${this.effectValue}`);
    });

    this.effectStrategies.set(TarotEffect.UPGRADE_VALUE, (target: Card) => {
      target.upgradeValue();
      console.log(`[${this.name}] Upgraded value of ${target.getDisplayString()}`);
    });

    this.effectStrategies.set(TarotEffect.DUPLICATE, (target: Card) => {
      // Note: Actual duplication is handled by Deck; here we mark or log intent
      console.log(`[${this.name}] Marked ${target.getDisplayString()} for duplication`);
    });

    this.effectStrategies.set(TarotEffect.DESTROY, (target: Card) => {
      // Note: Actual destruction is handled by Deck; here we mark or log intent
      console.log(`[${this.name}] Marked ${target.getDisplayString()} for destruction`);
    });
  }

  /**
   * Applies effect to the target card.
   * @param target - The target card to modify
   * @throws Error if target is null or invalid effectValue for effectType
   */
  public use(target: Card): void {
    if (!target) {
      throw new Error('Target card cannot be null');
    }

    const strategy = this.effectStrategies.get(this.effectType);
    if (!strategy) {
      throw new Error(`Unknown tarot effect type: ${this.effectType}`);
    }
    strategy(target);
  }

  /**
   * Returns true (targeted tarots need card selection).
   * @returns True
   */
  public requiresTarget(): boolean {
    return true;
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

## TarotEffect Enum Requirements:
- Must define 6 effect types:
  - ADD_CHIPS: Adds permanent chip bonus to target card
  - ADD_MULT: Adds permanent mult bonus to target card
  - CHANGE_SUIT: Changes suit of target card
  - UPGRADE_VALUE: Upgrades card value (K→A wrap)
  - DUPLICATE: Clones target card
  - DESTROY: Removes target card from hand
- Must provide getDescription() method for each effect
- Used to categorize tarot effects

## Tarot Abstract Class Requirements:
- Properties: id (string UUID), name (string), description (string), effect (TarotEffect)
- Constructor validates all properties non-null/non-empty
- getId() returns unique identifier
- getName() returns tarot name
- getDescription() returns description
- getEffect() returns TarotEffect type
- **requiresTarget(): boolean** - Abstract method, returns true if card target needed
- **use(target): void** - Abstract method, applies tarot effect
- Subclasses: InstantTarot (no target), TargetedTarot (requires card target)

## InstantTarot Class Requirements:
- Extends Tarot
- requiresTarget() returns false
- use(gameState) accepts GameState parameter
- Effects applied to game state directly
- Example: The Hermit (doubles player money)
- No target card needed
- Single-use consumable

## TargetedTarot Class Requirements:
- Extends Tarot
- requiresTarget() returns true
- use(card) accepts Card parameter
- Effects applied to specific card
- Validates card parameter not null
- Examples: The Empress (+4 mult), The Emperor (+20 chips), Strength (upgrade value)
- Single-use consumable

## 10 Tarot Card Specifications:

### Instant Tarots (1):
1. **The Hermit**: Doubles player money
   - Effect: N/A (economic effect)
   - Target: GameState
   - Behavior: money = money × 2

### Targeted Tarots (9):
2. **The Empress**: Add +4 mult to a card
   - Effect: ADD_MULT
   - Target: Card
   - Behavior: card.addPermanentBonus(0, 4)

3. **The Emperor**: Add +20 chips to a card
   - Effect: ADD_CHIPS
   - Target: Card
   - Behavior: card.addPermanentBonus(20, 0)

4. **Strength**: Upgrade card value (K→A, A→2 wraparound)
   - Effect: UPGRADE_VALUE
   - Target: Card
   - Behavior: card.upgradeValue()

5. **The Hanged Man**: Destroy up to 2 selected cards
   - Effect: DESTROY
   - Target: Card
   - Behavior: Remove card from deck/hand

6. **Death**: Duplicate a selected card
   - Effect: DUPLICATE
   - Target: Card
   - Behavior: Clone card with bonuses, new ID

7. **The Star**: Change card suit to Diamonds
   - Effect: CHANGE_SUIT
   - Target: Card
   - Behavior: card.changeSuit(Suit.DIAMONDS)

8. **The Moon**: Change card suit to Hearts
   - Effect: CHANGE_SUIT
   - Target: Card
   - Behavior: card.changeSuit(Suit.HEARTS)

9. **The Sun**: Change card suit to Spades
   - Effect: CHANGE_SUIT
   - Target: Card
   - Behavior: card.changeSuit(Suit.SPADES)

10. **The World**: Change card suit to Clubs
    - Effect: CHANGE_SUIT
    - Target: Card
    - Behavior: card.changeSuit(Suit.CLUBS)

## Edge Cases:
- Using targeted tarot without providing target card (throw error)
- Using instant tarot with null game state (throw error)
- The Hermit with $0 (results in $0, handled gracefully)
- Strength on King (wraps to Ace correctly)
- Death duplicating card with bonuses (preserves bonuses, new ID)
- The Hanged Man removing card from empty hand (throw error)
- Null/empty name or description (throw error)
- Invalid TarotEffect (throw error)

# TASK

Generate a complete unit test suite for Tarots System that covers:

## 1. TarotEffect Enum Tests
- [ ] All 6 effects defined correctly
- [ ] ADD_CHIPS defined
- [ ] ADD_MULT defined
- [ ] CHANGE_SUIT defined
- [ ] UPGRADE_VALUE defined
- [ ] DUPLICATE defined
- [ ] DESTROY defined
- [ ] getDescription() returns readable descriptions

## 2. Tarot Abstract Class Tests (via subclasses)

### Constructor (via InstantTarot/TargetedTarot):
- [ ] Creates tarot with valid properties
- [ ] Stores id correctly (UUID format)
- [ ] Stores name correctly
- [ ] Stores description correctly
- [ ] Stores effect correctly
- [ ] Throws error on null/empty name
- [ ] Throws error on null/empty description
- [ ] Throws error on null effect
- [ ] Generates unique ID for each instance

### Getters:
- [ ] getId() returns id
- [ ] getName() returns name
- [ ] getDescription() returns description
- [ ] getEffect() returns effect type

### Abstract Methods:
- [ ] requiresTarget() must be implemented by subclass
- [ ] use() must be implemented by subclass

## 3. InstantTarot Class Tests

### Constructor:
- [ ] Creates instant tarot with valid inputs
- [ ] Stores all properties correctly
- [ ] Throws error on invalid inputs

### requiresTarget():
- [ ] Returns false (instant tarots don't need targets)

### use(gameState):
- [ ] Accepts GameState parameter
- [ ] Applies effect to game state
- [ ] Throws error on null gameState
- [ ] Effect is immediate and permanent

### Specific Tarot: The Hermit:
- [ ] Doubles player money correctly
- [ ] Example: $10 → $20
- [ ] Example: $5 → $10
- [ ] Edge case: $0 → $0
- [ ] Edge case: $1 → $2
- [ ] Effect persists in game state

## 4. TargetedTarot Class Tests

### Constructor:
- [ ] Creates targeted tarot with valid inputs
- [ ] Stores all properties correctly
- [ ] Throws error on invalid inputs

### requiresTarget():
- [ ] Returns true (targeted tarots need card targets)

### use(card):
- [ ] Accepts Card parameter
- [ ] Applies effect to target card
- [ ] Throws error on null card
- [ ] Effect is immediate and permanent

### Specific Tarot: The Empress:
- [ ] Adds +4 mult to target card
- [ ] Card multBonus increases by 4
- [ ] Other card properties unchanged
- [ ] Effect persists on card

### Specific Tarot: The Emperor:
- [ ] Adds +20 chips to target card
- [ ] Card chipBonus increases by 20
- [ ] Other card properties unchanged
- [ ] Effect persists on card

### Specific Tarot: Strength:
- [ ] Upgrades card value correctly
- [ ] TWO → THREE
- [ ] QUEEN → KING
- [ ] KING → ACE (wraparound)
- [ ] ACE → TWO (wraparound)
- [ ] Preserves suit
- [ ] Preserves bonuses

### Specific Tarot: Death (Duplicate):
- [ ] Creates clone of target card
- [ ] Clone has same value
- [ ] Clone has same suit
- [ ] Clone has same bonuses (if any)
- [ ] Clone has DIFFERENT id (new UUID)
- [ ] Original card unchanged

### Specific Tarot: The Hanged Man (Destroy):
- [ ] Marks card for destruction
- [ ] Card can be identified for removal
- [ ] Does not modify card properties
- [ ] Effect handled by game state/controller

### Specific Tarot: The Star (Change to Diamonds):
- [ ] Changes card suit to DIAMONDS
- [ ] Preserves card value
- [ ] Preserves card bonuses
- [ ] Suit change is permanent

### Specific Tarot: The Moon (Change to Hearts):
- [ ] Changes card suit to HEARTS
- [ ] Preserves card value
- [ ] Preserves card bonuses

### Specific Tarot: The Sun (Change to Spades):
- [ ] Changes card suit to SPADES
- [ ] Preserves card value
- [ ] Preserves card bonuses

### Specific Tarot: The World (Change to Clubs):
- [ ] Changes card suit to CLUBS
- [ ] Preserves card value
- [ ] Preserves card bonuses

## 5. Integration Tests

### Card Modification Stack:
- [ ] Apply The Emperor (+20 chips)
- [ ] Apply The Empress (+4 mult)
- [ ] Apply Strength (upgrade value)
- [ ] Verify all effects accumulate correctly

### Suit Change Chain:
- [ ] Start with A♠
- [ ] Apply The Star (change to Diamonds)
- [ ] Card is now A♦
- [ ] Apply The Moon (change to Hearts)
- [ ] Card is now A♥

### Clone with Bonuses:
- [ ] Create card with Emperor (+20 chips) and Empress (+4 mult)
- [ ] Apply Death (duplicate)
- [ ] Clone has same bonuses
- [ ] Clone has different ID
- [ ] Both cards functional

## 6. Edge Cases

### The Hermit Edge Cases:
- [ ] Doubling $0 returns $0
- [ ] Doubling $1 returns $2
- [ ] Doubling large amounts (e.g., $1000 → $2000)
- [ ] Null game state throws error

### Strength Edge Cases:
- [ ] Upgrading KING wraps to ACE
- [ ] Upgrading ACE wraps to TWO
- [ ] Preserves chipBonus
- [ ] Preserves multBonus

### Death Edge Cases:
- [ ] Cloning card with no bonuses works
- [ ] Cloning card with both bonuses works
- [ ] Clone is independent (modifying clone doesn't affect original)

### Targeted Tarot Validation:
- [ ] Using with null card throws error
- [ ] Using with undefined throws error

### Instant Tarot Validation:
- [ ] Using with null gameState throws error

## 7. Type Safety Tests

### TarotEffect Usage:
- [ ] Tarots correctly tagged with effect type
- [ ] Effect type accessible via getEffect()
- [ ] Can filter tarots by effect type

### requiresTarget() Contract:
- [ ] All InstantTarots return false
- [ ] All TargetedTarots return true
- [ ] UI can check before prompting for target

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  Tarot,
  TarotEffect,
  InstantTarot,
  TargetedTarot
} from '@/models/special-cards/tarots';
import { Card, CardValue, Suit } from '@/models/core';

// Mock GameState interface for testing
interface MockGameState {
  money: number;
  addMoney: (amount: number) => void;
  getMoney: () => number;
}

describe('Tarots System', () => {
  describe('TarotEffect Enum', () => {
    it('should define ADD_CHIPS effect', () => {
      // ASSERT
      expect(TarotEffect.ADD_CHIPS).toBeDefined();
    });

    it('should define ADD_MULT effect', () => {
      // ASSERT
      expect(TarotEffect.ADD_MULT).toBeDefined();
    });

    it('should define CHANGE_SUIT effect', () => {
      // ASSERT
      expect(TarotEffect.CHANGE_SUIT).toBeDefined();
    });

    it('should define UPGRADE_VALUE effect', () => {
      // ASSERT
      expect(TarotEffect.UPGRADE_VALUE).toBeDefined();
    });

    it('should define DUPLICATE effect', () => {
      // ASSERT
      expect(TarotEffect.DUPLICATE).toBeDefined();
    });

    it('should define DESTROY effect', () => {
      // ASSERT
      expect(TarotEffect.DESTROY).toBeDefined();
    });

    it('should provide readable descriptions for each effect', () => {
      // ACT & ASSERT
      expect(TarotEffect.ADD_CHIPS.getDescription()).toContain('chips');
      expect(TarotEffect.ADD_MULT.getDescription()).toContain('mult');
      expect(TarotEffect.CHANGE_SUIT.getDescription()).toContain('suit');
      expect(TarotEffect.UPGRADE_VALUE.getDescription()).toContain('upgrade');
      expect(TarotEffect.DUPLICATE.getDescription()).toContain('duplicate');
      expect(TarotEffect.DESTROY.getDescription()).toContain('destroy');
    });
  });

  describe('InstantTarot', () => {
    describe('constructor', () => {
      it('should create instant tarot with valid inputs', () => {
        // ACT
        const tarot = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS, // Effect type (not actually used for instant)
          (gameState: any) => {
            gameState.money = gameState.money * 2;
          }
        );
        
        // ASSERT
        expect(tarot.getName()).toBe('The Hermit');
        expect(tarot.getDescription()).toBe('Double your money');
        expect(tarot.getId()).toBeDefined();
        expect(tarot.getId()).toMatch(/^[0-9a-f-]{36}$/i); // UUID format
      });

      it('should throw error on null or empty name', () => {
        // ACT & ASSERT
        expect(() => new InstantTarot(
          'test',
          '',
          'Description',
          TarotEffect.ADD_CHIPS,
          () => {}
        )).toThrow('Name cannot be empty');
        
        expect(() => new InstantTarot(
          'test',
          null as any,
          'Description',
          TarotEffect.ADD_CHIPS,
          () => {}
        )).toThrow('Name cannot be null');
      });

      it('should throw error on null or empty description', () => {
        // ACT & ASSERT
        expect(() => new InstantTarot(
          'test',
          'Test',
          '',
          TarotEffect.ADD_CHIPS,
          () => {}
        )).toThrow('Description cannot be empty');
      });

      it('should generate unique IDs', () => {
        // ARRANGE & ACT
        const tarot1 = new InstantTarot('test', 'Test', 'Desc', TarotEffect.ADD_CHIPS, () => {});
        const tarot2 = new InstantTarot('test', 'Test', 'Desc', TarotEffect.ADD_CHIPS, () => {});
        
        // ASSERT
        expect(tarot1.getId()).not.toBe(tarot2.getId());
      });
    });

    describe('requiresTarget', () => {
      it('should return false for instant tarots', () => {
        // ARRANGE
        const tarot = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS,
          (gameState: any) => {}
        );
        
        // ACT
        const result = tarot.requiresTarget();
        
        // ASSERT
        expect(result).toBe(false);
      });
    });

    describe('use', () => {
      it('should apply effect to game state', () => {
        // ARRANGE
        const gameState: MockGameState = {
          money: 10,
          addMoney: function(amount: number) { this.money += amount; },
          getMoney: function() { return this.money; }
        };
        
        const tarot = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS,
          (state: any) => {
            state.money = state.money * 2;
          }
        );
        
        // ACT
        tarot.use(gameState);
        
        // ASSERT
        expect(gameState.money).toBe(20);
      });

      it('should throw error on null gameState', () => {
        // ARRANGE
        const tarot = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS,
          (state: any) => {}
        );
        
        // ACT & ASSERT
        expect(() => tarot.use(null as any))
          .toThrow('GameState cannot be null');
      });
    });

    describe('Specific Tarot: The Hermit', () => {
      it('should double player money from $10 to $20', () => {
        // ARRANGE
        const gameState: MockGameState = { 
          money: 10,
          addMoney: function(amount) { this.money += amount; },
          getMoney: function() { return this.money; }
        };
        
        const hermit = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS,
          (state: any) => {
            state.money = state.money * 2;
          }
        );
        
        // ACT
        hermit.use(gameState);
        
        // ASSERT
        expect(gameState.money).toBe(20);
      });

      it('should double player money from $5 to $10', () => {
        // ARRANGE
        const gameState: MockGameState = { 
          money: 5,
          addMoney: function(amount) { this.money += amount; },
          getMoney: function() { return this.money; }
        };
        
        const hermit = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS,
          (state: any) => {
            state.money = state.money * 2;
          }
        );
        
        // ACT
        hermit.use(gameState);
        
        // ASSERT
        expect(gameState.money).toBe(10);
      });

      it('should handle edge case: $0 → $0', () => {
        // ARRANGE
        const gameState: MockGameState = { 
          money: 0,
          addMoney: function(amount) { this.money += amount; },
          getMoney: function() { return this.money; }
        };
        
        const hermit = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS,
          (state: any) => {
            state.money = state.money * 2;
          }
        );
        
        // ACT
        hermit.use(gameState);
        
        // ASSERT
        expect(gameState.money).toBe(0);
      });

      it('should handle edge case: $1 → $2', () => {
        // ARRANGE
        const gameState: MockGameState = { 
          money: 1,
          addMoney: function(amount) { this.money += amount; },
          getMoney: function() { return this.money; }
        };
        
        const hermit = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS,
          (state: any) => {
            state.money = state.money * 2;
          }
        );
        
        // ACT
        hermit.use(gameState);
        
        // ASSERT
        expect(gameState.money).toBe(2);
      });

      it('should handle large amounts: $1000 → $2000', () => {
        // ARRANGE
        const gameState: MockGameState = { 
          money: 1000,
          addMoney: function(amount) { this.money += amount; },
          getMoney: function() { return this.money; }
        };
        
        const hermit = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double your money',
          TarotEffect.ADD_CHIPS,
          (state: any) => {
            state.money = state.money * 2;
          }
        );
        
        // ACT
        hermit.use(gameState);
        
        // ASSERT
        expect(gameState.money).toBe(2000);
      });
    });
  });

  describe('TargetedTarot', () => {
    describe('constructor', () => {
      it('should create targeted tarot with valid inputs', () => {
        // ACT
        const tarot = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add +4 mult to a card',
          TarotEffect.ADD_MULT,
          (card: Card) => {
            card.addPermanentBonus(0, 4);
          }
        );
        
        // ASSERT
        expect(tarot.getName()).toBe('The Empress');
        expect(tarot.getDescription()).toBe('Add +4 mult to a card');
        expect(tarot.getEffect()).toBe(TarotEffect.ADD_MULT);
      });

      it('should throw error on invalid inputs', () => {
        // ACT & ASSERT
        expect(() => new TargetedTarot(
          'test',
          '',
          'Desc',
          TarotEffect.ADD_MULT,
          () => {}
        )).toThrow('Name cannot be empty');
      });
    });

    describe('requiresTarget', () => {
      it('should return true for targeted tarots', () => {
        // ARRANGE
        const tarot = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add +4 mult to a card',
          TarotEffect.ADD_MULT,
          (card: Card) => {}
        );
        
        // ACT
        const result = tarot.requiresTarget();
        
        // ASSERT
        expect(result).toBe(true);
      });
    });

    describe('use', () => {
      it('should apply effect to target card', () => {
        // ARRANGE
        const card = new Card(CardValue.ACE, Suit.SPADES);
        const tarot = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add +4 mult to a card',
          TarotEffect.ADD_MULT,
          (targetCard: Card) => {
            targetCard.addPermanentBonus(0, 4);
          }
        );
        
        // ACT
        tarot.use(card);
        
        // ASSERT
        expect(card.multBonus).toBe(4);
      });

      it('should throw error on null card', () => {
        // ARRANGE
        const tarot = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add +4 mult to a card',
          TarotEffect.ADD_MULT,
          (card: Card) => {}
        );
        
        // ACT & ASSERT
        expect(() => tarot.use(null as any))
          .toThrow('Target card cannot be null');
      });
    });

    describe('Specific Tarot: The Empress', () => {
      it('should add +4 mult to target card', () => {
        // ARRANGE
        const card = new Card(CardValue.KING, Suit.SPADES);
        const empress = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add +4 mult to a card',
          TarotEffect.ADD_MULT,
          (targetCard: Card) => {
            targetCard.addPermanentBonus(0, 4);
          }
        );
        
        // ACT
        empress.use(card);
        
        // ASSERT
        expect(card.multBonus).toBe(4);
        expect(card.chipBonus).toBe(0); // Unchanged
        expect(card.value).toBe(CardValue.KING); // Unchanged
        expect(card.suit).toBe(Suit.SPADES); // Unchanged
      });

      it('should accumulate with existing bonuses', () => {
        // ARRANGE
        const card = new Card(CardValue.KING, Suit.SPADES);
        card.addPermanentBonus(0, 2); // Already has +2 mult
        
        const empress = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add +4 mult to a card',
          TarotEffect.ADD_MULT,
          (targetCard: Card) => {
            targetCard.addPermanentBonus(0, 4);
          }
        );
        
        // ACT
        empress.use(card);
        
        // ASSERT
        expect(card.multBonus).toBe(6); // 2 + 4
      });
    });

    describe('Specific Tarot: The Emperor', () => {
      it('should add +20 chips to target card', () => {
        // ARRANGE
        const card = new Card(CardValue.QUEEN, Suit.HEARTS);
        const emperor = new TargetedTarot(
          'the-emperor',
          'The Emperor',
          'Add +20 chips to a card',
          TarotEffect.ADD_CHIPS,
          (targetCard: Card) => {
            targetCard.addPermanentBonus(20, 0);
          }
        );
        
        // ACT
        emperor.use(card);
        
        // ASSERT
        expect(card.chipBonus).toBe(20);
        expect(card.multBonus).toBe(0); // Unchanged
        expect(card.value).toBe(CardValue.QUEEN); // Unchanged
        expect(card.suit).toBe(Suit.HEARTS); // Unchanged
      });
    });

    describe('Specific Tarot: Strength', () => {
      it('should upgrade TWO to THREE', () => {
        // ARRANGE
        const card = new Card(CardValue.TWO, Suit.DIAMONDS);
        const strength = new TargetedTarot(
          'strength',
          'Strength',
          'Upgrade card value',
          TarotEffect.UPGRADE_VALUE,
          (targetCard: Card) => {
            targetCard.upgradeValue();
          }
        );
        
        // ACT
        strength.use(card);
        
        // ASSERT
        expect(card.value).toBe(CardValue.THREE);
        expect(card.suit).toBe(Suit.DIAMONDS); // Preserved
      });

      it('should upgrade QUEEN to KING', () => {
        // ARRANGE
        const card = new Card(CardValue.QUEEN, Suit.CLUBS);
        const strength = new TargetedTarot(
          'strength',
          'Strength',
          'Upgrade card value',
          TarotEffect.UPGRADE_VALUE,
          (targetCard: Card) => {
            targetCard.upgradeValue();
          }
        );
        
        // ACT
        strength.use(card);
        
        // ASSERT
        expect(card.value).toBe(CardValue.KING);
      });

      it('should wrap KING to ACE', () => {
        // ARRANGE
        const card = new Card(CardValue.KING, Suit.SPADES);
        const strength = new TargetedTarot(
          'strength',
          'Strength',
          'Upgrade card value',
          TarotEffect.UPGRADE_VALUE,
          (targetCard: Card) => {
            targetCard.upgradeValue();
          }
        );
        
        // ACT
        strength.use(card);
        
        // ASSERT
        expect(card.value).toBe(CardValue.ACE);
      });

      it('should wrap ACE to TWO', () => {
        // ARRANGE
        const card = new Card(CardValue.ACE, Suit.HEARTS);
        const strength = new TargetedTarot(
          'strength',
          'Strength',
          'Upgrade card value',
          TarotEffect.UPGRADE_VALUE,
          (targetCard: Card) => {
            targetCard.upgradeValue();
          }
        );
        
        // ACT
        strength.use(card);
        
        // ASSERT
        expect(card.value).toBe(CardValue.TWO);
      });

      it('should preserve bonuses when upgrading', () => {
        // ARRANGE
        const card = new Card(CardValue.KING, Suit.DIAMONDS);
        card.addPermanentBonus(20, 4);
        
        const strength = new TargetedTarot(
          'strength',
          'Strength',
          'Upgrade card value',
          TarotEffect.UPGRADE_VALUE,
          (targetCard: Card) => {
            targetCard.upgradeValue();
          }
        );
        
        // ACT
        strength.use(card);
        
        // ASSERT
        expect(card.value).toBe(CardValue.ACE);
        expect(card.chipBonus).toBe(20); // Preserved
        expect(card.multBonus).toBe(4);  // Preserved
      });
    });

    describe('Specific Tarot: Death (Duplicate)', () => {
      it('should create clone with same value and suit', () => {
        // ARRANGE
        const original = new Card(CardValue.QUEEN, Suit.HEARTS);
        let clone: Card | null = null;
        
        const death = new TargetedTarot(
          'death',
          'Death',
          'Duplicate a card',
          TarotEffect.DUPLICATE,
          (targetCard: Card) => {
            clone = targetCard.clone();
          }
        );
        
        // ACT
        death.use(original);
        
        // ASSERT
        expect(clone).not.toBeNull();
        expect(clone!.value).toBe(CardValue.QUEEN);
        expect(clone!.suit).toBe(Suit.HEARTS);
      });

      it('should create clone with same bonuses', () => {
        // ARRANGE
        const original = new Card(CardValue.KING, Suit.SPADES);
        original.addPermanentBonus(20, 4);
        let clone: Card | null = null;
        
        const death = new TargetedTarot(
          'death',
          'Death',
          'Duplicate a card',
          TarotEffect.DUPLICATE,
          (targetCard: Card) => {
            clone = targetCard.clone();
          }
        );
        
        // ACT
        death.use(original);
        
        // ASSERT
        expect(clone!.chipBonus).toBe(20);
        expect(clone!.multBonus).toBe(4);
      });

      it('should create clone with different ID', () => {
        // ARRANGE
        const original = new Card(CardValue.ACE, Suit.DIAMONDS);
        let clone: Card | null = null;
        
        const death = new TargetedTarot(
          'death',
          'Death',
          'Duplicate a card',
          TarotEffect.DUPLICATE,
          (targetCard: Card) => {
            clone = targetCard.clone();
          }
        );
        
        // ACT
        death.use(original);
        
        // ASSERT
        expect(clone!.id).not.toBe(original.id);
      });

      it('should not modify original card', () => {
        // ARRANGE
        const original = new Card(CardValue.JACK, Suit.CLUBS);
        const originalId = original.id;
        const originalValue = original.value;
        
        const death = new TargetedTarot(
          'death',
          'Death',
          'Duplicate a card',
          TarotEffect.DUPLICATE,
          (targetCard: Card) => {
            const clone = targetCard.clone();
            // Clone created, original should be unchanged
          }
        );
        
        // ACT
        death.use(original);
        
        // ASSERT
        expect(original.id).toBe(originalId);
        expect(original.value).toBe(originalValue);
      });
    });

    describe('Specific Tarot: The Star (Change to Diamonds)', () => {
      it('should change card suit to DIAMONDS', () => {
        // ARRANGE
        const card = new Card(CardValue.ACE, Suit.SPADES);
        const star = new TargetedTarot(
          'the-star',
          'The Star',
          'Change card to Diamonds',
          TarotEffect.CHANGE_SUIT,
          (targetCard: Card) => {
            targetCard.changeSuit(Suit.DIAMONDS);
          }
        );
        
        // ACT
        star.use(card);
        
        // ASSERT
        expect(card.suit).toBe(Suit.DIAMONDS);
        expect(card.value).toBe(CardValue.ACE); // Preserved
      });

      it('should preserve bonuses when changing suit', () => {
        // ARRANGE
        const card = new Card(CardValue.KING, Suit.HEARTS);
        card.addPermanentBonus(20, 4);
        
        const star = new TargetedTarot(
          'the-star',
          'The Star',
          'Change card to Diamonds',
          TarotEffect.CHANGE_SUIT,
          (targetCard: Card) => {
            targetCard.changeSuit(Suit.DIAMONDS);
          }
        );
        
        // ACT
        star.use(card);
        
        // ASSERT
        expect(card.suit).toBe(Suit.DIAMONDS);
        expect(card.chipBonus).toBe(20); // Preserved
        expect(card.multBonus).toBe(4);  // Preserved
      });
    });

    describe('Specific Tarot: The Moon (Change to Hearts)', () => {
      it('should change card suit to HEARTS', () => {
        // ARRANGE
        const card = new Card(CardValue.QUEEN, Suit.CLUBS);
        const moon = new TargetedTarot(
          'the-moon',
          'The Moon',
          'Change card to Hearts',
          TarotEffect.CHANGE_SUIT,
          (targetCard: Card) => {
            targetCard.changeSuit(Suit.HEARTS);
          }
        );
        
        // ACT
        moon.use(card);
        
        // ASSERT
        expect(card.suit).toBe(Suit.HEARTS);
        expect(card.value).toBe(CardValue.QUEEN); // Preserved
      });
    });

    describe('Specific Tarot: The Sun (Change to Spades)', () => {
      it('should change card suit to SPADES', () => {
        // ARRANGE
        const card = new Card(CardValue.JACK, Suit.DIAMONDS);
        const sun = new TargetedTarot(
          'the-sun',
          'The Sun',
          'Change card to Spades',
          TarotEffect.CHANGE_SUIT,
          (targetCard: Card) => {
            targetCard.changeSuit(Suit.SPADES);
          }
        );
        
        // ACT
        sun.use(card);
        
        // ASSERT
        expect(card.suit).toBe(Suit.SPADES);
        expect(card.value).toBe(CardValue.JACK); // Preserved
      });
    });

    describe('Specific Tarot: The World (Change to Clubs)', () => {
      it('should change card suit to CLUBS', () => {
        // ARRANGE
        const card = new Card(CardValue.TEN, Suit.HEARTS);
        const world = new TargetedTarot(
          'the-world',
          'The World',
          'Change card to Clubs',
          TarotEffect.CHANGE_SUIT,
          (targetCard: Card) => {
            targetCard.changeSuit(Suit.CLUBS);
          }
        );
        
        // ACT
        world.use(card);
        
        // ASSERT
        expect(card.suit).toBe(Suit.CLUBS);
        expect(card.value).toBe(CardValue.TEN); // Preserved
      });
    });
  });

  describe('Integration Tests', () => {
    describe('Card Modification Stack', () => {
      it('should apply multiple tarots to same card', () => {
        // ARRANGE
        const card = new Card(CardValue.JACK, Suit.SPADES);
        
        const emperor = new TargetedTarot(
          'the-emperor',
          'The Emperor',
          'Add +20 chips',
          TarotEffect.ADD_CHIPS,
          (c: Card) => c.addPermanentBonus(20, 0)
        );
        
        const empress = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add +4 mult',
          TarotEffect.ADD_MULT,
          (c: Card) => c.addPermanentBonus(0, 4)
        );
        
        const strength = new TargetedTarot(
          'strength',
          'Strength',
          'Upgrade value',
          TarotEffect.UPGRADE_VALUE,
          (c: Card) => c.upgradeValue()
        );
        
        // ACT
        emperor.use(card);
        empress.use(card);
        strength.use(card);
        
        // ASSERT
        expect(card.chipBonus).toBe(20);
        expect(card.multBonus).toBe(4);
        expect(card.value).toBe(CardValue.QUEEN); // J upgraded to Q
        expect(card.suit).toBe(Suit.SPADES); // Unchanged
      });
    });

    describe('Suit Change Chain', () => {
      it('should change suit multiple times', () => {
        // ARRANGE
        const card = new Card(CardValue.ACE, Suit.SPADES);
        
        const star = new TargetedTarot(
          'the-star',
          'The Star',
          'Change to Diamonds',
          TarotEffect.CHANGE_SUIT,
          (c: Card) => c.changeSuit(Suit.DIAMONDS)
        );
        
        const moon = new TargetedTarot(
          'the-moon',
          'The Moon',
          'Change to Hearts',
          TarotEffect.CHANGE_SUIT,
          (c: Card) => c.changeSuit(Suit.HEARTS)
        );
        
        // ACT & ASSERT
        expect(card.suit).toBe(Suit.SPADES);
        
        star.use(card);
        expect(card.suit).toBe(Suit.DIAMONDS);
        
        moon.use(card);
        expect(card.suit).toBe(Suit.HEARTS);
      });
    });

    describe('Clone with Bonuses', () => {
      it('should duplicate card with all modifications', () => {
        // ARRANGE
        const card = new Card(CardValue.KING, Suit.CLUBS);
        
        const emperor = new TargetedTarot(
          'the-emperor',
          'The Emperor',
          'Add +20 chips',
          TarotEffect.ADD_CHIPS,
          (c: Card) => c.addPermanentBonus(20, 0)
        );
        
        const empress = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add +4 mult',
          TarotEffect.ADD_MULT,
          (c: Card) => c.addPermanentBonus(0, 4)
        );
        
        let clone: Card | null = null;
        const death = new TargetedTarot(
          'death',
          'Death',
          'Duplicate card',
          TarotEffect.DUPLICATE,
          (c: Card) => {
            clone = c.clone();
          }
        );
        
        // ACT - Apply bonuses then duplicate
        emperor.use(card);
        empress.use(card);
        death.use(card);
        
        // ASSERT
        expect(clone).not.toBeNull();
        expect(clone!.chipBonus).toBe(20);
        expect(clone!.multBonus).toBe(4);
        expect(clone!.value).toBe(CardValue.KING);
        expect(clone!.suit).toBe(Suit.CLUBS);
        expect(clone!.id).not.toBe(card.id);
      });

      it('should create independent clone (modifying clone does not affect original)', () => {
        // ARRANGE
        const original = new Card(CardValue.ACE, Suit.HEARTS);
        let clone: Card | null = null;
        
        const death = new TargetedTarot(
          'death',
          'Death',
          'Duplicate card',
          TarotEffect.DUPLICATE,
          (c: Card) => {
            clone = c.clone();
          }
        );
        
        const emperor = new TargetedTarot(
          'the-emperor',
          'The Emperor',
          'Add +20 chips',
          TarotEffect.ADD_CHIPS,
          (c: Card) => c.addPermanentBonus(20, 0)
        );
        
        // ACT
        death.use(original);
        emperor.use(clone!); // Modify clone only
        
        // ASSERT
        expect(clone!.chipBonus).toBe(20);
        expect(original.chipBonus).toBe(0); // Original unchanged
      });
    });
  });

  describe('Type Safety and Contracts', () => {
    describe('requiresTarget Contract', () => {
      it('should return false for all InstantTarots', () => {
        // ARRANGE
        const hermit = new InstantTarot(
          'the-hermit',
          'The Hermit',
          'Double money',
          TarotEffect.ADD_CHIPS,
          () => {}
        );
        
        // ACT & ASSERT
        expect(hermit.requiresTarget()).toBe(false);
      });

      it('should return true for all TargetedTarots', () => {
        // ARRANGE
        const empress = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add mult',
          TarotEffect.ADD_MULT,
          () => {}
        );
        
        const emperor = new TargetedTarot(
          'the-emperor',
          'The Emperor',
          'Add chips',
          TarotEffect.ADD_CHIPS,
          () => {}
        );
        
        // ACT & ASSERT
        expect(empress.requiresTarget()).toBe(true);
        expect(emperor.requiresTarget()).toBe(true);
      });
    });

    describe('Effect Type Tagging', () => {
      it('should correctly tag tarots with effect types', () => {
        // ARRANGE
        const empress = new TargetedTarot(
          'the-empress',
          'The Empress',
          'Add mult',
          TarotEffect.ADD_MULT,
          () => {}
        );
        
        const emperor = new TargetedTarot(
          'the-emperor',
          'The Emperor',
          'Add chips',
          TarotEffect.ADD_CHIPS,
          () => {}
        );
        
        const star = new TargetedTarot(
          'the-star',
          'The Star',
          'Change suit',
          TarotEffect.CHANGE_SUIT,
          () => {}
        );
        
        // ACT & ASSERT
        expect(empress.getEffect()).toBe(TarotEffect.ADD_MULT);
        expect(emperor.getEffect()).toBe(TarotEffect.ADD_CHIPS);
        expect(star.getEffect()).toBe(TarotEffect.CHANGE_SUIT);
      });

      it('should allow filtering by effect type', () => {
        // ARRANGE
        const tarots = [
          new TargetedTarot('empress', 'Empress', 'Desc', TarotEffect.ADD_MULT, () => {}),
          new TargetedTarot('emperor', 'Emperor', 'Desc', TarotEffect.ADD_CHIPS, () => {}),
          new TargetedTarot('star', 'Star', 'Desc', TarotEffect.CHANGE_SUIT, () => {}),
          new TargetedTarot('strength', 'Strength', 'Desc', TarotEffect.UPGRADE_VALUE, () => {})
        ];
        
        // ACT
        const suitChangeTarots = tarots.filter(t => t.getEffect() === TarotEffect.CHANGE_SUIT);
        
        // ASSERT
        expect(suitChangeTarots).toHaveLength(1);
        expect(suitChangeTarots[0].getName()).toBe('Star');
      });
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for all tarot types
- All 10 specific tarot cards tested
- Instant vs Targeted distinction verified
- Edge cases and integration covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| TarotEffect | Enum values | 6 | 0 | 0 | 6 |
| TarotEffect | getDescription | 1 | 0 | 0 | 1 |
| InstantTarot | constructor | 1 | 1 | 3 | 5 |
| InstantTarot | requiresTarget | 1 | 0 | 0 | 1 |
| InstantTarot | use | 1 | 0 | 1 | 2 |
| The Hermit | Functionality | 3 | 3 | 0 | 6 |
| TargetedTarot | constructor | 1 | 0 | 1 | 2 |
| TargetedTarot | requiresTarget | 1 | 0 | 0 | 1 |
| TargetedTarot | use | 1 | 0 | 1 | 2 |
| The Empress | Functionality | 2 | 0 | 0 | 2 |
| The Emperor | Functionality | 1 | 0 | 0 | 1 |
| Strength | Functionality | 5 | 0 | 0 | 5 |
| Death | Functionality | 4 | 0 | 0 | 4 |
| The Star | Functionality | 2 | 0 | 0 | 2 |
| The Moon | Functionality | 1 | 0 | 0 | 1 |
| The Sun | Functionality | 1 | 0 | 0 | 1 |
| The World | Functionality | 1 | 0 | 0 | 1 |
| Integration | Stacking | 1 | 0 | 0 | 1 |
| Integration | Suit Changes | 1 | 0 | 0 | 1 |
| Integration | Clone with Bonuses | 2 | 0 | 0 | 2 |
| Type Safety | Contracts | 2 | 0 | 0 | 2 |
| Type Safety | Effect Filtering | 2 | 0 | 0 | 2 |
| **TOTAL** | | | | | **51** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **90%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios: 
  - Some internal effect function implementations (tested via integration)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/models/tarots.test.ts

# Run with coverage
npm test -- --coverage tests/unit/models/tarots.test.ts

# Run in watch mode
npm test -- --watch tests/unit/models/tarots.test.ts

# Run specific tarot tests
npm test -- -t "The Hermit" tests/unit/models/tarots.test.ts
npm test -- -t "Strength" tests/unit/models/tarots.test.ts
npm test -- -t "Integration" tests/unit/models/tarots.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Instant vs Targeted distinction:** requiresTarget() contract must be honored
- **Effect stacking:** Multiple tarots can be applied to same card
- **Wraparound behavior:** Strength wraps K→A and A→2
- **Clone independence:** Cloned cards are separate entities
- **Preservation of state:** Suit changes, value upgrades preserve bonuses
- **Single-use nature:** Tarots consumed after use (enforced by GameState/Controller)
- **UI implications:** requiresTarget() used to determine if card selection needed

# ADDITIONAL TEST DATA HELPERS

```typescript
// Factory for all 10 tarots
const TAROT_LIBRARY = {
  theHermit: () => new InstantTarot(
    'the-hermit',
    'The Hermit',
    'Double your money',
    TarotEffect.ADD_CHIPS,
    (state: any) => { state.money *= 2; }
  ),
  
  theEmpress: () => new TargetedTarot(
    'the-empress',
    'The Empress',
    'Add +4 mult to a card',
    TarotEffect.ADD_MULT,
    (card: Card) => card.addPermanentBonus(0, 4)
  ),
  
  theEmperor: () => new TargetedTarot(
    'the-emperor',
    'The Emperor',
    'Add +20 chips to a card',
    TarotEffect.ADD_CHIPS,
    (card: Card) => card.addPermanentBonus(20, 0)
  ),
  
  strength: () => new TargetedTarot(
    'strength',
    'Strength',
    'Upgrade card value',
    TarotEffect.UPGRADE_VALUE,
    (card: Card) => card.upgradeValue()
  ),
  
  death: () => new TargetedTarot(
    'death',
    'Death',
    'Duplicate a card',
    TarotEffect.DUPLICATE,
    (card: Card) => card.clone()
  ),
  
  theStar: () => new TargetedTarot(
    'the-star',
    'The Star',
    'Change card to Diamonds',
    TarotEffect.CHANGE_SUIT,
    (card: Card) => card.changeSuit(Suit.DIAMONDS)
  ),
  
  theMoon: () => new TargetedTarot(
    'the-moon',
    'The Moon',
    'Change card to Hearts',
    TarotEffect.CHANGE_SUIT,
    (card: Card) => card.changeSuit(Suit.HEARTS)
  ),
  
  theSun: () => new TargetedTarot(
    'the-sun',
    'The Sun',
    'Change card to Spades',
    TarotEffect.CHANGE_SUIT,
    (card: Card) => card.changeSuit(Suit.SPADES)
  ),
  
  theWorld: () => new TargetedTarot(
    'the-world',
    'The World',
    'Change card to Clubs',
    TarotEffect.CHANGE_SUIT,
    (card: Card) => card.changeSuit(Suit.CLUBS)
  )
};

// Helper to get all suit change tarots
function getSuitChangeTarots(): TargetedTarot[] {
  return [
    TAROT_LIBRARY.theStar(),
    TAROT_LIBRARY.theMoon(),
    TAROT_LIBRARY.theSun(),
    TAROT_LIBRARY.theWorld()
  ];
}
```