# TESTING CONTEXT
Project: Mini Balatro
Components under test: Planet (class)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/models/special-cards/planets/planet.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/planets/planet.ts
 * @desc Planet card that permanently upgrades a poker hand type.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { HandType } from '../../poker/hand-type.enum';
import { HandUpgradeManager } from '../../poker/hand-upgrade-manager';

/**
 * Represents a planet card that permanently upgrades a poker hand type.
 * Planet effects are cumulative and persist for the entire game.
 */
export class Planet {
  /**
   * Creates a planet card with specified upgrades.
   * @param name - Planet name
   * @param targetHandType - Which hand type this upgrades
   * @param chipsBonus - Additional chips to add
   * @param multBonus - Additional mult to add
   * @param description - Description of the planet's effect (optional)
   * @throws Error if negative bonuses provided
   */
  constructor(
    public readonly name: string,
    public readonly targetHandType: HandType,
    public readonly chipsBonus: number,
    public readonly multBonus: number,
    public readonly description?: string
  ) {
    if (chipsBonus < 0 || multBonus < 0) {
      throw new Error('Planet bonuses cannot be negative');
    }
  }

  /**
   * Applies this planet's bonuses to the upgrade manager.
   * @param upgradeManager - The hand upgrade manager
   * @throws Error if upgradeManager is null
   */
  public apply(upgradeManager: HandUpgradeManager): void {
    if (!upgradeManager) {
      throw new Error('Upgrade manager cannot be null');
    }

    upgradeManager.applyPlanetUpgrade(
      this.targetHandType,
      this.chipsBonus,
      this.multBonus
    );

    console.log(`[${this.name}] Applied upgrade to ${this.targetHandType}: +${this.chipsBonus} chips, +${this.multBonus} mult`);
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

## Planet Class Requirements:
- Properties: id (string), name (string), description (string), handType (HandType), bonusChips (number), bonusMult (number)
- Constructor validates all properties
- getId() returns unique identifier
- getName() returns planet name
- getDescription() returns description
- getHandType() returns associated hand type
- getBonusChips() returns chip bonus
- getBonusMult() returns mult bonus
- applyUpgrade(upgradeManager) applies permanent cumulative upgrade to HandUpgradeManager
- Validates handType not null
- Validates bonusChips > 0
- Validates bonusMult > 0
- Single-use card (purchased and immediately applied)
- Does not go into inventory

## 9 Planet Specifications:

| Planet | Hand Type | Bonus Chips | Bonus Mult |
|--------|-----------|-------------|------------|
| Pluto | High Card | +10 | +1 |
| Mercury | Pair | +15 | +1 |
| Uranus | Two Pair | +20 | +1 |
| Venus | Three of a Kind | +20 | +2 |
| Saturn | Straight | +30 | +3 |
| Jupiter | Flush | +15 | +2 |
| Earth | Full House | +25 | +2 |
| Mars | Four of a Kind | +30 | +3 |
| Neptune | Straight Flush | +40 | +4 |

## HandUpgradeManager Integration:
- Planet.applyUpgrade(manager) calls manager.applyPlanetUpgrade(handType, bonusChips, bonusMult)
- Upgrades are permanent and cumulative
- Multiple purchases of same planet stack
- Example: 2 Pluto purchases → High Card gets +20 chips, +2 mult total

## Edge Cases:
- Null upgradeManager (throw error)
- Negative or zero bonuses (throw error)
- Invalid hand type (throw error)
- Null/empty name (throw error)
- Multiple applications of same planet (should accumulate)
- Planet with very large bonuses (handle correctly)

# TASK

Generate a complete unit test suite for Planet System that covers:

## 1. Planet Class Tests

### Constructor:
- [ ] Creates planet with valid inputs
- [ ] Stores id correctly (UUID format)
- [ ] Stores name correctly
- [ ] Stores description correctly
- [ ] Stores handType correctly
- [ ] Stores bonusChips correctly
- [ ] Stores bonusMult correctly
- [ ] Throws error on null handType
- [ ] Throws error on bonusChips ≤ 0
- [ ] Throws error on bonusMult ≤ 0
- [ ] Throws error on null/empty name
- [ ] Throws error on null/empty description
- [ ] Generates unique ID for each instance

### Getters:
- [ ] getId() returns id
- [ ] getName() returns name
- [ ] getDescription() returns description
- [ ] getHandType() returns handType
- [ ] getBonusChips() returns bonusChips
- [ ] getBonusMult() returns bonusMult

### applyUpgrade():
- [ ] Calls upgradeManager.applyPlanetUpgrade with correct parameters
- [ ] Passes handType as first argument
- [ ] Passes bonusChips as second argument
- [ ] Passes bonusMult as third argument
- [ ] Throws error on null upgradeManager
- [ ] Logs upgrade application
- [ ] Does not modify planet properties after application

## 2. All 9 Planets Specification Tests

### Pluto (High Card):
- [ ] Name is "Pluto"
- [ ] HandType is HIGH_CARD
- [ ] BonusChips is 10
- [ ] BonusMult is 1
- [ ] Description mentions High Card upgrade

### Mercury (Pair):
- [ ] Name is "Mercury"
- [ ] HandType is PAIR
- [ ] BonusChips is 15
- [ ] BonusMult is 1
- [ ] Description mentions Pair upgrade

### Uranus (Two Pair):
- [ ] Name is "Uranus"
- [ ] HandType is TWO_PAIR
- [ ] BonusChips is 20
- [ ] BonusMult is 1
- [ ] Description mentions Two Pair upgrade

### Venus (Three of a Kind):
- [ ] Name is "Venus"
- [ ] HandType is THREE_OF_A_KIND
- [ ] BonusChips is 20
- [ ] BonusMult is 2
- [ ] Description mentions Three of a Kind upgrade

### Saturn (Straight):
- [ ] Name is "Saturn"
- [ ] HandType is STRAIGHT
- [ ] BonusChips is 30
- [ ] BonusMult is 3
- [ ] Description mentions Straight upgrade

### Jupiter (Flush):
- [ ] Name is "Jupiter"
- [ ] HandType is FLUSH
- [ ] BonusChips is 15
- [ ] BonusMult is 2
- [ ] Description mentions Flush upgrade

### Earth (Full House):
- [ ] Name is "Earth"
- [ ] HandType is FULL_HOUSE
- [ ] BonusChips is 25
- [ ] BonusMult is 2
- [ ] Description mentions Full House upgrade

### Mars (Four of a Kind):
- [ ] Name is "Mars"
- [ ] HandType is FOUR_OF_A_KIND
- [ ] BonusChips is 30
- [ ] BonusMult is 3
- [ ] Description mentions Four of a Kind upgrade

### Neptune (Straight Flush):
- [ ] Name is "Neptune"
- [ ] HandType is STRAIGHT_FLUSH
- [ ] BonusChips is 40
- [ ] BonusMult is 4
- [ ] Description mentions Straight Flush upgrade

## 3. HandUpgradeManager Integration Tests

### Single Planet Application:
- [ ] Planet upgrades correct hand type
- [ ] Upgrade values match planet bonuses
- [ ] Other hand types remain unaffected
- [ ] Example: Pluto upgrades HIGH_CARD from (5, 1) to (15, 2)

### Multiple Same Planet:
- [ ] Two Pluto purchases accumulate
- [ ] Example: HIGH_CARD goes from (5, 1) → (15, 2) → (25, 3)
- [ ] Upgrades are cumulative, not replaced

### Multiple Different Planets:
- [ ] Each planet upgrades its respective hand type
- [ ] Example: Pluto upgrades HIGH_CARD, Mercury upgrades PAIR
- [ ] No interference between different hand types

### All Planets Applied:
- [ ] Apply all 9 planets
- [ ] Each hand type upgraded correctly
- [ ] Verify final values for all 9 hand types

## 4. Edge Cases

### Invalid Inputs:
- [ ] Null upgradeManager throws error
- [ ] Zero bonusChips throws error
- [ ] Negative bonusChips throws error
- [ ] Zero bonusMult throws error
- [ ] Negative bonusMult throws error

### Boundary Values:
- [ ] BonusChips = 1 (minimum valid)
- [ ] BonusMult = 1 (minimum valid)
- [ ] Very large bonuses (e.g., 1000 chips) handled correctly

### ID Uniqueness:
- [ ] Two planets with same properties have different IDs
- [ ] ID is UUID format

## 5. Shop Integration Scenarios

### Purchase and Immediate Application:
- [ ] Simulate shop purchase
- [ ] Planet applied immediately (not stored in inventory)
- [ ] Upgrade reflected in next hand calculation
- [ ] Planet not available for re-use

### Economic Flow:
- [ ] Purchase Pluto for $3
- [ ] Apply to HandUpgradeManager
- [ ] Next HIGH_CARD hand uses upgraded values
- [ ] Verify score calculation includes upgrade

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Planet } from '@/models/special-cards/planets';
import { HandType } from '@/models/poker';
import { HandUpgradeManager } from '@/models/poker';

describe('Planet System', () => {
  describe('Planet Class', () => {
    describe('constructor', () => {
      it('should create planet with valid inputs', () => {
        // ACT
        const planet = new Planet(
          'pluto',
          'Pluto',
          'Upgrade High Card: +10 chips, +1 mult',
          HandType.HIGH_CARD,
          10,
          1
        );
        
        // ASSERT
        expect(planet.getName()).toBe('Pluto');
        expect(planet.getDescription()).toBe('Upgrade High Card: +10 chips, +1 mult');
        expect(planet.getHandType()).toBe(HandType.HIGH_CARD);
        expect(planet.getBonusChips()).toBe(10);
        expect(planet.getBonusMult()).toBe(1);
        expect(planet.getId()).toBeDefined();
      });

      it('should generate unique UUID for id', () => {
        // ARRANGE & ACT
        const planet1 = new Planet('pluto', 'Pluto', 'Desc', HandType.HIGH_CARD, 10, 1);
        const planet2 = new Planet('pluto', 'Pluto', 'Desc', HandType.HIGH_CARD, 10, 1);
        
        // ASSERT
        expect(planet1.getId()).not.toBe(planet2.getId());
        expect(planet1.getId()).toMatch(/^[0-9a-f-]{36}$/i); // UUID format
        expect(planet2.getId()).toMatch(/^[0-9a-f-]{36}$/i);
      });

      it('should throw error on null handType', () => {
        // ACT & ASSERT
        expect(() => new Planet('test', 'Test', 'Desc', null as any, 10, 1))
          .toThrow('HandType cannot be null');
      });

      it('should throw error on bonusChips ≤ 0', () => {
        // ACT & ASSERT
        expect(() => new Planet('test', 'Test', 'Desc', HandType.HIGH_CARD, 0, 1))
          .toThrow('Bonus chips must be positive');
      });

      it('should throw error on negative bonusChips', () => {
        // ACT & ASSERT
        expect(() => new Planet('test', 'Test', 'Desc', HandType.HIGH_CARD, -10, 1))
          .toThrow('Bonus chips must be positive');
      });

      it('should throw error on bonusMult ≤ 0', () => {
        // ACT & ASSERT
        expect(() => new Planet('test', 'Test', 'Desc', HandType.HIGH_CARD, 10, 0))
          .toThrow('Bonus mult must be positive');
      });

      it('should throw error on negative bonusMult', () => {
        // ACT & ASSERT
        expect(() => new Planet('test', 'Test', 'Desc', HandType.HIGH_CARD, 10, -1))
          .toThrow('Bonus mult must be positive');
      });

      it('should throw error on null or empty name', () => {
        // ACT & ASSERT
        expect(() => new Planet('test', '', 'Desc', HandType.HIGH_CARD, 10, 1))
          .toThrow('Name cannot be empty');
        
        expect(() => new Planet('test', null as any, 'Desc', HandType.HIGH_CARD, 10, 1))
          .toThrow('Name cannot be null');
      });

      it('should throw error on null or empty description', () => {
        // ACT & ASSERT
        expect(() => new Planet('test', 'Test', '', HandType.HIGH_CARD, 10, 1))
          .toThrow('Description cannot be empty');
        
        expect(() => new Planet('test', 'Test', null as any, HandType.HIGH_CARD, 10, 1))
          .toThrow('Description cannot be null');
      });
    });

    describe('Getters', () => {
      let planet: Planet;

      beforeEach(() => {
        planet = new Planet(
          'pluto',
          'Pluto',
          'Upgrade High Card: +10 chips, +1 mult',
          HandType.HIGH_CARD,
          10,
          1
        );
      });

      it('should return id', () => {
        // ACT
        const id = planet.getId();
        
        // ASSERT
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
      });

      it('should return name', () => {
        // ACT
        const name = planet.getName();
        
        // ASSERT
        expect(name).toBe('Pluto');
      });

      it('should return description', () => {
        // ACT
        const description = planet.getDescription();
        
        // ASSERT
        expect(description).toBe('Upgrade High Card: +10 chips, +1 mult');
      });

      it('should return handType', () => {
        // ACT
        const handType = planet.getHandType();
        
        // ASSERT
        expect(handType).toBe(HandType.HIGH_CARD);
      });

      it('should return bonusChips', () => {
        // ACT
        const chips = planet.getBonusChips();
        
        // ASSERT
        expect(chips).toBe(10);
      });

      it('should return bonusMult', () => {
        // ACT
        const mult = planet.getBonusMult();
        
        // ASSERT
        expect(mult).toBe(1);
      });
    });

    describe('applyUpgrade', () => {
      it('should call upgradeManager.applyPlanetUpgrade with correct parameters', () => {
        // ARRANGE
        const planet = new Planet(
          'pluto',
          'Pluto',
          'Upgrade High Card',
          HandType.HIGH_CARD,
          10,
          1
        );
        const upgradeManager = new HandUpgradeManager();
        const spy = jest.spyOn(upgradeManager, 'applyPlanetUpgrade');
        
        // ACT
        planet.applyUpgrade(upgradeManager);
        
        // ASSERT
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(HandType.HIGH_CARD, 10, 1);
      });

      it('should throw error on null upgradeManager', () => {
        // ARRANGE
        const planet = new Planet(
          'pluto',
          'Pluto',
          'Upgrade High Card',
          HandType.HIGH_CARD,
          10,
          1
        );
        
        // ACT & ASSERT
        expect(() => planet.applyUpgrade(null as any))
          .toThrow('HandUpgradeManager cannot be null');
      });

      it('should not modify planet properties after application', () => {
        // ARRANGE
        const planet = new Planet(
          'pluto',
          'Pluto',
          'Upgrade High Card',
          HandType.HIGH_CARD,
          10,
          1
        );
        const upgradeManager = new HandUpgradeManager();
        
        // ACT
        planet.applyUpgrade(upgradeManager);
        
        // ASSERT - Planet unchanged
        expect(planet.getBonusChips()).toBe(10);
        expect(planet.getBonusMult()).toBe(1);
        expect(planet.getHandType()).toBe(HandType.HIGH_CARD);
      });
    });
  });

  describe('All 9 Planets Specification', () => {
    describe('Pluto (High Card)', () => {
      let pluto: Planet;

      beforeEach(() => {
        pluto = new Planet(
          'pluto',
          'Pluto',
          'Level up High Card: +10 chips, +1 mult',
          HandType.HIGH_CARD,
          10,
          1
        );
      });

      it('should have correct name', () => {
        expect(pluto.getName()).toBe('Pluto');
      });

      it('should target HIGH_CARD', () => {
        expect(pluto.getHandType()).toBe(HandType.HIGH_CARD);
      });

      it('should provide +10 bonus chips', () => {
        expect(pluto.getBonusChips()).toBe(10);
      });

      it('should provide +1 bonus mult', () => {
        expect(pluto.getBonusMult()).toBe(1);
      });
    });

    describe('Mercury (Pair)', () => {
      let mercury: Planet;

      beforeEach(() => {
        mercury = new Planet(
          'mercury',
          'Mercury',
          'Level up Pair: +15 chips, +1 mult',
          HandType.PAIR,
          15,
          1
        );
      });

      it('should have correct name', () => {
        expect(mercury.getName()).toBe('Mercury');
      });

      it('should target PAIR', () => {
        expect(mercury.getHandType()).toBe(HandType.PAIR);
      });

      it('should provide +15 bonus chips', () => {
        expect(mercury.getBonusChips()).toBe(15);
      });

      it('should provide +1 bonus mult', () => {
        expect(mercury.getBonusMult()).toBe(1);
      });
    });

    describe('Uranus (Two Pair)', () => {
      let uranus: Planet;

      beforeEach(() => {
        uranus = new Planet(
          'uranus',
          'Uranus',
          'Level up Two Pair: +20 chips, +1 mult',
          HandType.TWO_PAIR,
          20,
          1
        );
      });

      it('should have correct name', () => {
        expect(uranus.getName()).toBe('Uranus');
      });

      it('should target TWO_PAIR', () => {
        expect(uranus.getHandType()).toBe(HandType.TWO_PAIR);
      });

      it('should provide +20 bonus chips', () => {
        expect(uranus.getBonusChips()).toBe(20);
      });

      it('should provide +1 bonus mult', () => {
        expect(uranus.getBonusMult()).toBe(1);
      });
    });

    describe('Venus (Three of a Kind)', () => {
      let venus: Planet;

      beforeEach(() => {
        venus = new Planet(
          'venus',
          'Venus',
          'Level up Three of a Kind: +20 chips, +2 mult',
          HandType.THREE_OF_A_KIND,
          20,
          2
        );
      });

      it('should have correct name', () => {
        expect(venus.getName()).toBe('Venus');
      });

      it('should target THREE_OF_A_KIND', () => {
        expect(venus.getHandType()).toBe(HandType.THREE_OF_A_KIND);
      });

      it('should provide +20 bonus chips', () => {
        expect(venus.getBonusChips()).toBe(20);
      });

      it('should provide +2 bonus mult', () => {
        expect(venus.getBonusMult()).toBe(2);
      });
    });

    describe('Saturn (Straight)', () => {
      let saturn: Planet;

      beforeEach(() => {
        saturn = new Planet(
          'saturn',
          'Saturn',
          'Level up Straight: +30 chips, +3 mult',
          HandType.STRAIGHT,
          30,
          3
        );
      });

      it('should have correct name', () => {
        expect(saturn.getName()).toBe('Saturn');
      });

      it('should target STRAIGHT', () => {
        expect(saturn.getHandType()).toBe(HandType.STRAIGHT);
      });

      it('should provide +30 bonus chips', () => {
        expect(saturn.getBonusChips()).toBe(30);
      });

      it('should provide +3 bonus mult', () => {
        expect(saturn.getBonusMult()).toBe(3);
      });
    });

    describe('Jupiter (Flush)', () => {
      let jupiter: Planet;

      beforeEach(() => {
        jupiter = new Planet(
          'jupiter',
          'Jupiter',
          'Level up Flush: +15 chips, +2 mult',
          HandType.FLUSH,
          15,
          2
        );
      });

      it('should have correct name', () => {
        expect(jupiter.getName()).toBe('Jupiter');
      });

      it('should target FLUSH', () => {
        expect(jupiter.getHandType()).toBe(HandType.FLUSH);
      });

      it('should provide +15 bonus chips', () => {
        expect(jupiter.getBonusChips()).toBe(15);
      });

      it('should provide +2 bonus mult', () => {
        expect(jupiter.getBonusMult()).toBe(2);
      });
    });

    describe('Earth (Full House)', () => {
      let earth: Planet;

      beforeEach(() => {
        earth = new Planet(
          'earth',
          'Earth',
          'Level up Full House: +25 chips, +2 mult',
          HandType.FULL_HOUSE,
          25,
          2
        );
      });

      it('should have correct name', () => {
        expect(earth.getName()).toBe('Earth');
      });

      it('should target FULL_HOUSE', () => {
        expect(earth.getHandType()).toBe(HandType.FULL_HOUSE);
      });

      it('should provide +25 bonus chips', () => {
        expect(earth.getBonusChips()).toBe(25);
      });

      it('should provide +2 bonus mult', () => {
        expect(earth.getBonusMult()).toBe(2);
      });
    });

    describe('Mars (Four of a Kind)', () => {
      let mars: Planet;

      beforeEach(() => {
        mars = new Planet(
          'mars',
          'Mars',
          'Level up Four of a Kind: +30 chips, +3 mult',
          HandType.FOUR_OF_A_KIND,
          30,
          3
        );
      });

      it('should have correct name', () => {
        expect(mars.getName()).toBe('Mars');
      });

      it('should target FOUR_OF_A_KIND', () => {
        expect(mars.getHandType()).toBe(HandType.FOUR_OF_A_KIND);
      });

      it('should provide +30 bonus chips', () => {
        expect(mars.getBonusChips()).toBe(30);
      });

      it('should provide +3 bonus mult', () => {
        expect(mars.getBonusMult()).toBe(3);
      });
    });

    describe('Neptune (Straight Flush)', () => {
      let neptune: Planet;

      beforeEach(() => {
        neptune = new Planet(
          'neptune',
          'Neptune',
          'Level up Straight Flush: +40 chips, +4 mult',
          HandType.STRAIGHT_FLUSH,
          40,
          4
        );
      });

      it('should have correct name', () => {
        expect(neptune.getName()).toBe('Neptune');
      });

      it('should target STRAIGHT_FLUSH', () => {
        expect(neptune.getHandType()).toBe(HandType.STRAIGHT_FLUSH);
      });

      it('should provide +40 bonus chips', () => {
        expect(neptune.getBonusChips()).toBe(40);
      });

      it('should provide +4 bonus mult', () => {
        expect(neptune.getBonusMult()).toBe(4);
      });
    });
  });

  describe('HandUpgradeManager Integration', () => {
    let upgradeManager: HandUpgradeManager;

    beforeEach(() => {
      upgradeManager = new HandUpgradeManager();
    });

    describe('Single Planet Application', () => {
      it('should upgrade correct hand type only', () => {
        // ARRANGE
        const pluto = new Planet(
          'pluto',
          'Pluto',
          'Upgrade High Card',
          HandType.HIGH_CARD,
          10,
          1
        );
        
        // ACT
        pluto.applyUpgrade(upgradeManager);
        
        // ASSERT
        const highCardUpgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        const pairUpgrade = upgradeManager.getUpgradedValues(HandType.PAIR);
        
        expect(highCardUpgrade.additionalChips).toBe(10);
        expect(highCardUpgrade.additionalMult).toBe(1);
        expect(pairUpgrade.additionalChips).toBe(0); // Unaffected
        expect(pairUpgrade.additionalMult).toBe(0);
      });

      it('should upgrade HIGH_CARD from (5,1) to (15,2)', () => {
        // ARRANGE
        const pluto = new Planet(
          'pluto',
          'Pluto',
          'Upgrade High Card',
          HandType.HIGH_CARD,
          10,
          1
        );
        const baseValues = HandType.HIGH_CARD.getBaseValues();
        
        // ACT
        pluto.applyUpgrade(upgradeManager);
        const upgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        
        // ASSERT
        expect(baseValues.chips + upgrade.additionalChips).toBe(15); // 5 + 10
        expect(baseValues.mult + upgrade.additionalMult).toBe(2);    // 1 + 1
      });
    });

    describe('Multiple Same Planet', () => {
      it('should accumulate multiple Pluto purchases', () => {
        // ARRANGE
        const pluto1 = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        const pluto2 = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        
        // ACT
        pluto1.applyUpgrade(upgradeManager);
        pluto2.applyUpgrade(upgradeManager);
        
        // ASSERT
        const upgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        expect(upgrade.additionalChips).toBe(20); // 10 + 10
        expect(upgrade.additionalMult).toBe(2);   // 1 + 1
      });

      it('should upgrade HIGH_CARD from (5,1) to (15,2) to (25,3)', () => {
        // ARRANGE
        const pluto1 = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        const pluto2 = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        const baseValues = HandType.HIGH_CARD.getBaseValues();
        
        // ACT & ASSERT - First application
        pluto1.applyUpgrade(upgradeManager);
        let upgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        expect(baseValues.chips + upgrade.additionalChips).toBe(15);
        expect(baseValues.mult + upgrade.additionalMult).toBe(2);
        
        // ACT & ASSERT - Second application
        pluto2.applyUpgrade(upgradeManager);
        upgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        expect(baseValues.chips + upgrade.additionalChips).toBe(25);
        expect(baseValues.mult + upgrade.additionalMult).toBe(3);
      });

      it('should accumulate three applications', () => {
        // ARRANGE
        const pluto1 = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        const pluto2 = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        const pluto3 = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        
        // ACT
        pluto1.applyUpgrade(upgradeManager);
        pluto2.applyUpgrade(upgradeManager);
        pluto3.applyUpgrade(upgradeManager);
        
        // ASSERT
        const upgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        expect(upgrade.additionalChips).toBe(30); // 10 × 3
        expect(upgrade.additionalMult).toBe(3);   // 1 × 3
      });
    });

    describe('Multiple Different Planets', () => {
      it('should upgrade different hand types independently', () => {
        // ARRANGE
        const pluto = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        const mercury = new Planet('mercury', 'Mercury', 'Upgrade', HandType.PAIR, 15, 1);
        
        // ACT
        pluto.applyUpgrade(upgradeManager);
        mercury.applyUpgrade(upgradeManager);
        
        // ASSERT
        const highCardUpgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        const pairUpgrade = upgradeManager.getUpgradedValues(HandType.PAIR);
        
        expect(highCardUpgrade.additionalChips).toBe(10);
        expect(highCardUpgrade.additionalMult).toBe(1);
        expect(pairUpgrade.additionalChips).toBe(15);
        expect(pairUpgrade.additionalMult).toBe(1);
      });

      it('should not interfere between different hand types', () => {
        // ARRANGE
        const pluto = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
        const neptune = new Planet('neptune', 'Neptune', 'Upgrade', HandType.STRAIGHT_FLUSH, 40, 4);
        
        // ACT
        pluto.applyUpgrade(upgradeManager);
        neptune.applyUpgrade(upgradeManager);
        
        // ASSERT
        const highCardUpgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        const straightFlushUpgrade = upgradeManager.getUpgradedValues(HandType.STRAIGHT_FLUSH);
        const pairUpgrade = upgradeManager.getUpgradedValues(HandType.PAIR);
        
        expect(highCardUpgrade.additionalChips).toBe(10);
        expect(straightFlushUpgrade.additionalChips).toBe(40);
        expect(pairUpgrade.additionalChips).toBe(0); // Unaffected
      });
    });

    describe('All Planets Applied', () => {
      it('should upgrade all 9 hand types correctly', () => {
        // ARRANGE - Create all 9 planets
        const planets = [
          new Planet('pluto', 'Pluto', 'Desc', HandType.HIGH_CARD, 10, 1),
          new Planet('mercury', 'Mercury', 'Desc', HandType.PAIR, 15, 1),
          new Planet('uranus', 'Uranus', 'Desc', HandType.TWO_PAIR, 20, 1),
          new Planet('venus', 'Venus', 'Desc', HandType.THREE_OF_A_KIND, 20, 2),
          new Planet('saturn', 'Saturn', 'Desc', HandType.STRAIGHT, 30, 3),
          new Planet('jupiter', 'Jupiter', 'Desc', HandType.FLUSH, 15, 2),
          new Planet('earth', 'Earth', 'Desc', HandType.FULL_HOUSE, 25, 2),
          new Planet('mars', 'Mars', 'Desc', HandType.FOUR_OF_A_KIND, 30, 3),
          new Planet('neptune', 'Neptune', 'Desc', HandType.STRAIGHT_FLUSH, 40, 4)
        ];
        
        // ACT - Apply all planets
        planets.forEach(planet => planet.applyUpgrade(upgradeManager));
        
        // ASSERT - Verify all upgrades
        expect(upgradeManager.getUpgradedValues(HandType.HIGH_CARD).additionalChips).toBe(10);
        expect(upgradeManager.getUpgradedValues(HandType.PAIR).additionalChips).toBe(15);
        expect(upgradeManager.getUpgradedValues(HandType.TWO_PAIR).additionalChips).toBe(20);
        expect(upgradeManager.getUpgradedValues(HandType.THREE_OF_A_KIND).additionalChips).toBe(20);
        expect(upgradeManager.getUpgradedValues(HandType.STRAIGHT).additionalChips).toBe(30);
        expect(upgradeManager.getUpgradedValues(HandType.FLUSH).additionalChips).toBe(15);
        expect(upgradeManager.getUpgradedValues(HandType.FULL_HOUSE).additionalChips).toBe(25);
        expect(upgradeManager.getUpgradedValues(HandType.FOUR_OF_A_KIND).additionalChips).toBe(30);
        expect(upgradeManager.getUpgradedValues(HandType.STRAIGHT_FLUSH).additionalChips).toBe(40);
      });
    });
  });

  describe('Edge Cases', () => {
    describe('Boundary Values', () => {
      it('should accept minimum valid bonuses (1,1)', () => {
        // ACT
        const planet = new Planet(
          'test',
          'Test',
          'Minimal upgrade',
          HandType.HIGH_CARD,
          1,
          1
        );
        
        // ASSERT
        expect(planet.getBonusChips()).toBe(1);
        expect(planet.getBonusMult()).toBe(1);
      });

      it('should handle large bonuses correctly', () => {
        // ACT
        const planet = new Planet(
          'super-planet',
          'Super Planet',
          'Massive upgrade',
          HandType.HIGH_CARD,
          1000,
          100
        );
        const upgradeManager = new HandUpgradeManager();
        
        // ACT
        planet.applyUpgrade(upgradeManager);
        
        // ASSERT
        const upgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
        expect(upgrade.additionalChips).toBe(1000);
        expect(upgrade.additionalMult).toBe(100);
      });
    });

    describe('ID Uniqueness', () => {
      it('should generate different IDs for planets with same properties', () => {
        // ARRANGE & ACT
        const planet1 = new Planet('pluto', 'Pluto', 'Desc', HandType.HIGH_CARD, 10, 1);
        const planet2 = new Planet('pluto', 'Pluto', 'Desc', HandType.HIGH_CARD, 10, 1);
        
        // ASSERT
        expect(planet1.getId()).not.toBe(planet2.getId());
      });

      it('should maintain ID format across all planets', () => {
        // ARRANGE
        const planets = [
          new Planet('pluto', 'Pluto', 'Desc', HandType.HIGH_CARD, 10, 1),
          new Planet('mercury', 'Mercury', 'Desc', HandType.PAIR, 15, 1),
          new Planet('neptune', 'Neptune', 'Desc', HandType.STRAIGHT_FLUSH, 40, 4)
        ];
        
        // ASSERT
        planets.forEach(planet => {
          expect(planet.getId()).toMatch(/^[0-9a-f-]{36}$/i);
        });
      });
    });
  });

  describe('Shop Integration Scenarios', () => {
    it('should simulate purchase and immediate application', () => {
      // ARRANGE - Simulate shop state
      const upgradeManager = new HandUpgradeManager();
      const pluto = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
      
      // ACT - Simulate purchase
      const cost = 3; // $3 for planets
      const playerMoney = 10;
      const canAfford = playerMoney >= cost;
      
      if (canAfford) {
        pluto.applyUpgrade(upgradeManager);
      }
      
      // ASSERT
      expect(canAfford).toBe(true);
      const upgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
      expect(upgrade.additionalChips).toBe(10);
    });

    it('should reflect upgrade in next hand calculation', () => {
      // ARRANGE
      const upgradeManager = new HandUpgradeManager();
      const pluto = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
      
      // Get base values before upgrade
      const baseBefore = HandType.HIGH_CARD.getBaseValues();
      expect(baseBefore.chips).toBe(5);
      expect(baseBefore.mult).toBe(1);
      
      // ACT - Apply planet
      pluto.applyUpgrade(upgradeManager);
      
      // Get upgraded values
      const upgrade = upgradeManager.getUpgradedValues(HandType.HIGH_CARD);
      const upgradedChips = baseBefore.chips + upgrade.additionalChips;
      const upgradedMult = baseBefore.mult + upgrade.additionalMult;
      
      // ASSERT
      expect(upgradedChips).toBe(15); // 5 + 10
      expect(upgradedMult).toBe(2);   // 1 + 1
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for Planet class
- All 9 planets specification verified
- HandUpgradeManager integration tested
- Edge cases and boundary values covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| Planet | constructor | 1 | 0 | 7 | 8 |
| Planet | getId | 1 | 0 | 0 | 1 |
| Planet | getName | 1 | 0 | 0 | 1 |
| Planet | getDescription | 1 | 0 | 0 | 1 |
| Planet | getHandType | 1 | 0 | 0 | 1 |
| Planet | getBonusChips | 1 | 0 | 0 | 1 |
| Planet | getBonusMult | 1 | 0 | 0 | 1 |
| Planet | applyUpgrade | 1 | 0 | 1 | 2 |
| Planet | ID uniqueness | 0 | 2 | 0 | 2 |
| Pluto | Specification | 4 | 0 | 0 | 4 |
| Mercury | Specification | 4 | 0 | 0 | 4 |
| Uranus | Specification | 4 | 0 | 0 | 4 |
| Venus | Specification | 4 | 0 | 0 | 4 |
| Saturn | Specification | 4 | 0 | 0 | 4 |
| Jupiter | Specification | 4 | 0 | 0 | 4 |
| Earth | Specification | 4 | 0 | 0 | 4 |
| Mars | Specification | 4 | 0 | 0 | 4 |
| Neptune | Specification | 4 | 0 | 0 | 4 |
| Integration | Single planet | 2 | 0 | 0 | 2 |
| Integration | Multiple same | 3 | 0 | 0 | 3 |
| Integration | Multiple different | 2 | 0 | 0 | 2 |
| Integration | All planets | 1 | 0 | 0 | 1 |
| Edge Cases | Boundary values | 2 | 0 | 0 | 2 |
| Shop Integration | Purchase flow | 2 | 0 | 0 | 2 |
| **TOTAL** | | | | | **67** |

## 3. Expected Coverage
- Estimated line coverage: **98%**
- Estimated branch coverage: **95%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios: 
  - Some internal UUID generation logic (library code)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/models/planets.test.ts

# Run with coverage
npm test -- --coverage tests/unit/models/planets.test.ts

# Run in watch mode
npm test -- --watch tests/unit/models/planets.test.ts

# Run specific planet tests
npm test -- -t "Pluto" tests/unit/models/planets.test.ts
npm test -- -t "HandUpgradeManager Integration" tests/unit/models/planets.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Cumulative upgrades:** Multiple planet purchases must stack, not replace
- **Permanent effect:** Upgrades persist across all future hands until game reset
- **Immediate application:** Planets applied when purchased, not stored in inventory
- **Single-use:** Planet consumed on purchase, cannot be used again
- **Independence:** Each planet affects only its associated hand type
- **ID uniqueness:** Essential for shop and transaction tracking
- **Large bonus handling:** System must handle edge cases with very large bonuses

# ADDITIONAL TEST DATA HELPERS

```typescript
// Factory function for all 9 planets
const PLANET_LIBRARY = {
  pluto: () => new Planet('pluto', 'Pluto', 'Level up High Card: +10 chips, +1 mult', HandType.HIGH_CARD, 10, 1),
  mercury: () => new Planet('mercury', 'Mercury', 'Level up Pair: +15 chips, +1 mult', HandType.PAIR, 15, 1),
  uranus: () => new Planet('uranus', 'Uranus', 'Level up Two Pair: +20 chips, +1 mult', HandType.TWO_PAIR, 20, 1),
  venus: () => new Planet('venus', 'Venus', 'Level up Three of a Kind: +20 chips, +2 mult', HandType.THREE_OF_A_KIND, 20, 2),
  saturn: () => new Planet('saturn', 'Saturn', 'Level up Straight: +30 chips, +3 mult', HandType.STRAIGHT, 30, 3),
  jupiter: () => new Planet('jupiter', 'Jupiter', 'Level up Flush: +15 chips, +2 mult', HandType.FLUSH, 15, 2),
  earth: () => new Planet('earth', 'Earth', 'Level up Full House: +25 chips, +2 mult', HandType.FULL_HOUSE, 25, 2),
  mars: () => new Planet('mars', 'Mars', 'Level up Four of a Kind: +30 chips, +3 mult', HandType.FOUR_OF_A_KIND, 30, 3),
  neptune: () => new Planet('neptune', 'Neptune', 'Level up Straight Flush: +40 chips, +4 mult', HandType.STRAIGHT_FLUSH, 40, 4)
};

// Helper to apply all planets
function applyAllPlanets(upgradeManager: HandUpgradeManager): void {
  Object.values(PLANET_LIBRARY).forEach(factory => {
    const planet = factory();
    planet.applyUpgrade(upgradeManager);
  });
}

// Helper to verify planet specifications
function verifyPlanetSpec(
  planet: Planet,
  expectedName: string,
  expectedHandType: HandType,
  expectedChips: number,
  expectedMult: number
): void {
  expect(planet.getName()).toBe(expectedName);
  expect(planet.getHandType()).toBe(expectedHandType);
  expect(planet.getBonusChips()).toBe(expectedChips);
  expect(planet.getBonusMult()).toBe(expectedMult);
}
```