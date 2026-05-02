# TESTING CONTEXT
Project: Mini Balatro
Components under test: Blind (abstract), SmallBlind, BigBlind, BossBlind, BlindGenerator, BlindModifier, BossType (enum)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/models/blinds/boss-type.enum.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/boss-type.enum.ts
 * @desc BossType enumeration for all boss blind variants.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enum defining all boss blind types.
 * Each boss has unique rule modifications.
 */
export enum BossType {
  THE_WALL = 'THE_WALL',
  THE_WATER = 'THE_WATER',
  THE_MOUTH = 'THE_MOUTH',
  THE_NEEDLE = 'THE_NEEDLE',
  THE_FLINT = 'THE_FLINT'
}

/**
 * Returns the display name for a boss type.
 * @param bossType - The boss type to get display name for
 * @returns The display name (e.g., "The Wall")
 */
export function getBossDisplayName(bossType: BossType): string {
  switch (bossType) {
    case BossType.THE_WALL: return 'The Wall';
    case BossType.THE_WATER: return 'The Water';
    case BossType.THE_MOUTH: return 'The Mouth';
    case BossType.THE_NEEDLE: return 'The Needle';
    case BossType.THE_FLINT: return 'The Flint';
    default: return 'Unknown Boss';
  }
}

/**
 * Returns the effect description for a boss type.
 * @param bossType - The boss type to get description for
 * @returns The effect description for UI
 */
export function getBossDescription(bossType: BossType): string {
  switch (bossType) {
    case BossType.THE_WALL: return 'Scoring goal increases to 4× round base';
    case BossType.THE_WATER: return 'Level starts with 0 available discards';
    case BossType.THE_MOUTH: return 'The first hand you play will define the only specific type of poker hand that is allowed to be played.';
    case BossType.THE_NEEDLE: return 'Only 1 hand can be played (goal reduced to 1× base)';
    case BossType.THE_FLINT: return 'Base chips and mult of all hands are halved';
    default: return 'Unknown boss effect';
  }
}
```

## File 2: src/models/blinds/blind-modifier.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/blind-modifier.ts
 * @desc Rule modifications applied by boss blinds to game mechanics.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { HandType } from '../poker/hand-type.enum';
import { BossType } from './boss-type.enum';

/**
 * Encapsulates rule modifications applied by boss blinds.
 * Contains overrides for goals, hands, discards, and base values.
 */
export class BlindModifier {
  /**
   * Creates a blind modifier with specified overrides.
   * @param goalMultiplier - Multiplier for score goal (default: 1.0)
   * @param maxHands - Override for max hands available (null = no override)
   * @param maxDiscards - Override for max discards available (null = no override)
   * @param allowedHandTypes - Restricted hand types (null = all allowed)
   * @param chipsDivisor - Divisor for base chips (default: 1.0)
   * @param multDivisor - Divisor for base mult (default: 1.0)
   * @throws Error if multipliers/divisors < 0
   */
  constructor(
    public readonly goalMultiplier: number = 1.0,
    public readonly maxHands: number | null = null,
    public readonly maxDiscards: number | null = null,
    public readonly allowedHandTypes: HandType[] | null = null,
    public readonly chipsDivisor: number = 1.0,
    public readonly multDivisor: number = 1.0
  ) {
    if (goalMultiplier < 0 || chipsDivisor < 0 || multDivisor < 0) {
      throw new Error('Multipliers and divisors cannot be negative');
    }
  }

  /**
   * Factory method to create appropriate modifier for each boss type.
   * @param bossType - The boss type to create modifier for
   * @returns BlindModifier configured for that boss
   * @throws Error if invalid BossType
   */
  public static createForBoss(bossType: BossType): BlindModifier {
    switch (bossType) {
      case BossType.THE_WALL:
        return new BlindModifier(4.0);
      case BossType.THE_WATER:
        return new BlindModifier(1.0, null, 0);
      case BossType.THE_MOUTH:
        // Start with empty allowedHandTypes - will be set after first successful hand
        return new BlindModifier(1.0, null, null, null);
      case BossType.THE_NEEDLE:
        return new BlindModifier(0.5, 1, null);
      case BossType.THE_FLINT:
        return new BlindModifier(1.0, null, null, null, 2.0, 2.0);
      default:
        throw new Error(`Unknown boss type: ${bossType}`);
    }
  }
}
```

## File 3: src/models/blinds/blind.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/blind.ts
 * @desc Abstract base class for all blind types in the game.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { BlindModifier } from './blind-modifier';

/**
 * Abstract base class for all blind types.
 * Defines common interface for level progression.
 */
export abstract class Blind {
  /**
   * Creates a blind with specified properties.
   * @param level - The level/blind number (1, 2, 3, ...)
   * @param scoreGoal - Points needed to pass this blind
   * @param moneyReward - Money earned for passing
   * @throws Error if level <= 0, scoreGoal <= 0, or moneyReward < 0
   */
  constructor(
    public readonly level: number,
    public readonly scoreGoal: number,
    public readonly moneyReward: number
  ) {
    if (level <= 0) {
      throw new Error('Level must be positive');
    }
    if (scoreGoal <= 0) {
      throw new Error('Score goal must be positive');
    }
    if (moneyReward < 0) {
      throw new Error('Money reward cannot be negative');
    }
  }

  /**
   * Returns the score required to pass this blind.
   * @returns Positive number
   */
  public getScoreGoal(): number {
    return this.scoreGoal;
  }

  /**
   * Returns money earned for passing this blind.
   * @returns Non-negative number
   */
  public getReward(): number {
    return this.moneyReward;
  }

  /**
   * Returns modifier if this blind has special rules.
   * @returns BlindModifier for boss blinds, null for normal blinds
   */
  public abstract getModifier(): BlindModifier | undefined;

  /**
   * Returns the blind type as a stable string identifier.
   * This is used for serialization and won't be affected by minification.
   * @returns String identifier for the blind type
   */
  public abstract getBlindType(): string;

  /**
   * Returns the level number of this blind.
   * @returns Positive integer
   */
  public getLevel(): number {
    return this.level;
  }

  /**
   * Calculates base score goal for a round using Balatro's values.
   * Returns the small blind value for the given round.
   * @param roundNumber - The round number (1, 2, 3, ...)
   * @returns Positive number
   */
  protected static calculateBaseGoal(roundNumber: number): number {
    if (roundNumber <= 0) {
      throw new Error('Round number must be positive');
    }
    
    // Balatro base values for each round
    const roundBaseValues = [300, 800, 2000, 5000, 11000, 20000, 35000, 50000];
    
    // For rounds beyond 8, use round 8's value
    const index = Math.min(roundNumber - 1, roundBaseValues.length - 1);
    return roundBaseValues[index];
  }
}
```

## File 4: src/models/blinds/small-blind.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/small-blind.ts
 * @desc First blind in each round with base difficulty.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Blind } from './blind';
import { BlindModifier } from './blind-modifier';
import { GameConfig } from '../../services/config/game-config';

/**
 * First blind in each round (easiest difficulty).
 * Goal = base × 1.0, Reward = $2.
 */
export class SmallBlind extends Blind {
  /**
   * Creates a small blind for the specified round.
   * @param level - The level number
   * @param roundNumber - The round number
   * @throws Error if level or roundNumber <= 0
   */
  constructor(level: number, roundNumber: number) {
    const baseGoal = SmallBlind.calculateBaseGoal(roundNumber);
    super(level, baseGoal, GameConfig.SMALL_BLIND_REWARD);
  }

  /**
   * Returns null (small blinds have no modifiers).
   * @returns null
   */
  public getModifier(): BlindModifier | undefined {
    return undefined;
  }

  /**
   * Returns the blind type identifier.
   * @returns 'SmallBlind'
   */
  public getBlindType(): string {
    return 'SmallBlind';
  }
}
```

## File 5: src/models/blinds/big-blind.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/big-blind.ts
 * @desc Second blind in each round with medium difficulty.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Blind } from './blind';
import { BlindModifier } from './blind-modifier';
import { GameConfig } from '../../services/config/game-config';

/**
 * Second blind in each round (medium difficulty).
 * Goal = base × 1.5, Reward = $5.
 */
export class BigBlind extends Blind {
  /**
   * Creates a big blind for the specified round.
   * @param level - The level number
   * @param roundNumber - The round number
   * @throws Error if level or roundNumber <= 0
   */
  constructor(level: number, roundNumber: number) {
    const baseGoal = BigBlind.calculateBaseGoal(roundNumber);
    const multiplier = GameConfig.BIG_BLIND_MULTIPLIER;
    super(level, Math.floor(baseGoal * multiplier), GameConfig.BIG_BLIND_REWARD);
  }

  /**
   * Returns null (big blinds have no modifiers).
   * @returns null
   */
  public getModifier(): BlindModifier | undefined {
    return undefined;
  }

  /**
   * Returns the blind type identifier.
   * @returns 'BigBlind'
   */
  public getBlindType(): string {
    return 'BigBlind';
  }
}
```

## File 6: src/models/blinds/boss-blind.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/boss-blind.ts
 * @desc Boss blind implementation with special rule modifiers.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Blind } from './blind';
import { BlindModifier } from './blind-modifier';
import { BossType } from './boss-type.enum';
import { GameConfig } from '../../services/config/game-config';
import { HandType } from '../poker/hand-type.enum';

/**
 * Third blind in each round (boss encounter).
 * Goal = base × 2.0 (modified by boss), Reward = $10.
 */
export class BossBlind extends Blind {
  private modifier: BlindModifier;

  /**
   * Creates a boss blind with specified boss type.
   * @param level - The level number
   * @param roundNumber - The round number
   * @param bossType - Which boss this blind represents
   * @throws Error if level or roundNumber <= 0 or invalid BossType
   */
  constructor(level: number, roundNumber: number, public readonly bossType: BossType) {
    const baseGoal = BossBlind.calculateBaseGoal(roundNumber);
    const multiplier = GameConfig.BOSS_BLIND_MULTIPLIER;
    super(level, baseGoal * multiplier, GameConfig.BOSS_BLIND_REWARD);
    this.modifier = BlindModifier.createForBoss(this.bossType);
  }

  /**
   * Returns boss-specific modifier.
   * @returns BlindModifier configured for this boss
   */
  public getModifier(): BlindModifier {
    return this.modifier;
  }

  /**
   * Sets the allowed hand types for The Mouth boss.
   * This is called after the first hand is played to lock in that hand type.
   * @param handType - The hand type to allow
   * @throws Error if not The Mouth boss or handType is null
   */
  public setAllowedHandType(handType: HandType): void {
    if (this.bossType !== BossType.THE_MOUTH) {
      throw new Error('setAllowedHandType can only be called on The Mouth boss');
    }
    if (!handType) {
      throw new Error('Hand type cannot be null');
    }

    // Create a new modifier with the locked-in hand type
    this.modifier = new BlindModifier(1.0, null, null, [handType]);
    console.log(`The Mouth: Locked in hand type ${handType}`);
  }

  /**
   * Returns the type of boss for this blind.
   * @returns BossType enum value
   */
  public getBossType(): BossType {
    return this.bossType;
  }

  /**
   * Returns score goal modified by boss (if boss affects goal).
   * @returns Modified goal
   */
  public getScoreGoal(): number {
    const modifier = this.getModifier();
    return Math.floor(super.getScoreGoal() * modifier.goalMultiplier);
  }

  /**
   * Returns the blind type identifier.
   * @returns 'BossBlind'
   */
  public getBlindType(): string {
    return 'BossBlind';
  }
}
```

## File 7: src/models/blinds/blind-generator.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/blinds/blind-generator.ts
 * @desc Generates appropriate blinds based on level progression.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Blind } from './blind';
import { SmallBlind } from './small-blind';
import { BigBlind } from './big-blind';
import { BossBlind } from './boss-blind';
import { BossType } from './boss-type.enum';
import { GameConfig } from '../../services/config/game-config';

/**
 * Generates appropriate blinds based on level progression.
 * Handles Small → Big → Boss pattern and boss selection.
 */
export class BlindGenerator {
  /**
   * History of recently used bosses to avoid repetition.
   * Keeps track of the last 2 bosses used.
   */
  private bossHistory: BossType[] = [];

  /**
   * Generates the appropriate blind for the given level number.
   * @param level - The level number
   * @returns SmallBlind, BigBlind, or BossBlind based on level
   * @throws Error if level <= 0
   */
  public generateBlind(level: number): Blind {
    if (level <= 0) {
      throw new Error('Level must be positive');
    }

    const roundNumber = BlindGenerator.calculateRoundNumber(level);
    const positionInRound = (level - 1) % GameConfig.LEVELS_PER_ROUND;

    console.log(`Generating blind for level ${level} (round ${roundNumber}, position ${positionInRound})`);

    switch (positionInRound) {
      case 0:
        return new SmallBlind(level, roundNumber);
      case 1:
        return new BigBlind(level, roundNumber);
      case 2:
        return new BossBlind(level, roundNumber, this.selectRandomBoss());
      default:
        throw new Error('Invalid position in round');
    }
  }

  /**
   * Randomly selects one of the 5 boss types with variety tracking.
   * Avoids selecting the same boss as the last 2 bosses used.
   * @returns One of the 5 BossType values with improved variety
   */
  private selectRandomBoss(): BossType {
    const allBossTypes = Object.values(BossType);
    
    // Filter out bosses that were recently used
    const availableBosses = allBossTypes.filter(
      boss => !this.bossHistory.includes(boss)
    );
    
    // If all bosses are in history (shouldn't happen with 5 bosses and history of 2),
    // or if this is first/second boss, use available bosses or all
    const selectFrom = availableBosses.length > 0 ? availableBosses : allBossTypes;
    
    const randomIndex = Math.floor(Math.random() * selectFrom.length);
    const selectedBoss = selectFrom[randomIndex];
    
    // Update history: keep last 2 bosses
    this.bossHistory.push(selectedBoss);
    if (this.bossHistory.length > 2) {
      this.bossHistory.shift();
    }
    
    console.log(`Selected boss: ${selectedBoss} (history: ${this.bossHistory.join(', ')})`);
    return selectedBoss;
  }

  /**
   * Calculates which round a level belongs to.
   * @param level - The level number
   * @returns Positive integer (round 1, 2, 3, ...)
   */
  public static calculateRoundNumber(level: number): number {
    if (level <= 0) {
      throw new Error('Level must be positive');
    }
    return Math.floor((level - 1) / GameConfig.LEVELS_PER_ROUND) + 1;
  }

  /**
   * Returns blind type name for a level ("Small", "Big", "Boss").
   * @param level - The level number
   * @returns "Small", "Big", or "Boss"
   */
  public static getBlindTypeForLevel(level: number): string {
    const positionInRound = (level - 1) % 3;
    switch (positionInRound) {
      case 0: return 'Small';
      case 1: return 'Big';
      case 2: return 'Boss';
      default: return 'Unknown';
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

## BossType Enum Requirements:
- Must define exactly 5 boss types:
  - THE_WALL: 4× goal multiplier (total 8× base)
  - THE_WATER: 0 discards allowed
  - THE_MOUTH: Only 1 random hand type allowed
  - THE_NEEDLE: Only 1 hand allowed, 0.5× goal (total 1× base)
  - THE_FLINT: Base chips/mult divided by 2
- Must provide getName() method returning boss name
- Must provide getDescription() method describing boss mechanic

## BlindModifier Class Requirements:
- Properties (all optional with defaults):
  - goalMultiplier (number, default 1.0)
  - maxHands (number | null, default null)
  - maxDiscards (number | null, default null)
  - allowedHandTypes (HandType[] | null, default null)
  - chipsDivisor (number, default 1.0)
  - multDivisor (number, default 1.0)
- Constructor accepts partial properties
- All properties have getters
- Used by BossBlind to modify game rules
- Applied by ScoreCalculator (chipsDivisor, multDivisor)
- Applied by GameState (maxHands, maxDiscards, allowedHandTypes)

## Blind Abstract Class Requirements:
- Properties: roundNumber (number), name (string), description (string)
- Constructor validates roundNumber > 0
- getName() returns name
- getDescription() returns description
- getRoundNumber() returns roundNumber
- **getScoreGoal(): number** - Abstract method, returns required score
- **getReward(): number** - Abstract method, returns money reward
- **getModifier(): BlindModifier | null** - Abstract method, returns modifier (null for Small/Big)

## SmallBlind Class Requirements:
- Extends Blind
- Formula: baseGoal = 300 × (1.5)^(roundNumber - 1)
- getScoreGoal() returns baseGoal × 1.0
- getReward() returns $2
- getModifier() returns null (no modifier)
- Name: "Small Blind"
- Description: "Standard blind"

## BigBlind Class Requirements:
- Extends Blind
- Formula: baseGoal = 300 × (1.5)^(roundNumber - 1)
- getScoreGoal() returns baseGoal × 1.5
- getReward() returns $5
- getModifier() returns null (no modifier)
- Name: "Big Blind"
- Description: "Higher stakes"

## BossBlind Class Requirements:
- Extends Blind
- Properties: bossType (BossType), modifier (BlindModifier)
- Formula: baseGoal = 300 × (1.5)^(roundNumber - 1)
- getScoreGoal() returns baseGoal × 2.0 × modifier.goalMultiplier
- getReward() returns $10
- getModifier() returns modifier object
- getBossType() returns bossType
- Name: Boss type name (e.g., "The Wall")
- Description: Boss type description

## 5 Boss Type Specifications:

### The Wall:
- goalMultiplier = 4 (combined with base 2× = 8× total)
- No other restrictions
- Description: "Score requirement ×4"

### The Water:
- maxDiscards = 0
- Description: "No discards allowed"

### The Mouth:
- allowedHandTypes = [random single HandType]
- Description: "Only [hand type] hands allowed"

### The Needle:
- maxHands = 1
- goalMultiplier = 0.5 (combined with base 2× = 1× total)
- Description: "Only 1 hand, half score requirement"

### The Flint:
- chipsDivisor = 2
- multDivisor = 2
- Description: "Base hand values divided by 2"

## BlindGenerator Class Requirements:
- generateBlindForLevel(level) returns Blind instance
- Level pattern (repeating): Small (1) → Big (2) → Boss (3)
- roundNumber = Math.floor((level - 1) / 3) + 1
- Level 1, 4, 7, 10, ... → SmallBlind
- Level 2, 5, 8, 11, ... → BigBlind
- Level 3, 6, 9, 12, ... → BossBlind
- Boss selection: Random from 5 boss types with equal probability
- Validates level > 0
- Throws error on invalid level

## Difficulty Progression Examples:

| Round | Level | Blind Type | Base Goal | Final Goal (Small/Big/Boss) |
|-------|-------|------------|-----------|------------------------------|
| 1 | 1 | Small | 300 | 300 (×1.0) |
| 1 | 2 | Big | 300 | 450 (×1.5) |
| 1 | 3 | Boss | 300 | 600 (×2.0, no modifier) |
| 2 | 4 | Small | 450 | 450 |
| 2 | 5 | Big | 450 | 675 |
| 2 | 6 | Boss | 450 | 900 |
| 3 | 7 | Small | 675 | 675 |
| 5 | 13 | Small | 1,519 | 1,519 |

**Note:** Boss goals shown without boss modifier. Actual boss goals vary (The Wall = 4× more, The Needle = 0.5× less)

## Edge Cases:
- Level 0 or negative (throw error)
- Level 1 (round 1, SmallBlind)
- Level 100+ (large exponents, handle correctly)
- Boss modifier combinations (goalMultiplier with base 2×)
- The Mouth selecting random hand type (any of 9 types valid)
- Floating point precision in progression formula
- BlindModifier with null values (defaults apply)
- BlindModifier with conflicting values (shouldn't happen, validate)

# TASK

Generate a complete unit test suite for Blinds System that covers:

## 1. BossType Enum Tests
- [ ] All 5 boss types defined
- [ ] THE_WALL defined
- [ ] THE_WATER defined
- [ ] THE_MOUTH defined
- [ ] THE_NEEDLE defined
- [ ] THE_FLINT defined
- [ ] getName() returns readable names
- [ ] getDescription() returns descriptions

## 2. BlindModifier Class Tests

### Constructor:
- [ ] Creates modifier with default values
- [ ] goalMultiplier defaults to 1.0
- [ ] maxHands defaults to null
- [ ] maxDiscards defaults to null
- [ ] allowedHandTypes defaults to null
- [ ] chipsDivisor defaults to 1.0
- [ ] multDivisor defaults to 1.0
- [ ] Accepts partial properties
- [ ] Stores custom values correctly

### Getters:
- [ ] getGoalMultiplier() returns value
- [ ] getMaxHands() returns value or null
- [ ] getMaxDiscards() returns value or null
- [ ] getAllowedHandTypes() returns array or null
- [ ] getChipsDivisor() returns value
- [ ] getMultDivisor() returns value

### Boss-Specific Modifiers:
- [ ] The Wall modifier: goalMultiplier = 4
- [ ] The Water modifier: maxDiscards = 0
- [ ] The Mouth modifier: allowedHandTypes = [1 hand type]
- [ ] The Needle modifier: maxHands = 1, goalMultiplier = 0.5
- [ ] The Flint modifier: chipsDivisor = 2, multDivisor = 2

## 3. SmallBlind Class Tests

### Constructor:
- [ ] Creates small blind with round number
- [ ] Stores round number correctly
- [ ] Name is "Small Blind"
- [ ] Description is set
- [ ] Throws error on roundNumber ≤ 0

### getScoreGoal():
- [ ] Round 1: Returns 300
- [ ] Round 2: Returns 450
- [ ] Round 3: Returns 675
- [ ] Round 5: Returns 1,519
- [ ] Round 10: Returns ~38,443
- [ ] Formula: 300 × (1.5)^(n-1)

### getReward():
- [ ] Returns $2 for all rounds

### getModifier():
- [ ] Returns null (no modifier)

## 4. BigBlind Class Tests

### Constructor:
- [ ] Creates big blind with round number
- [ ] Stores round number correctly
- [ ] Name is "Big Blind"
- [ ] Throws error on roundNumber ≤ 0

### getScoreGoal():
- [ ] Round 1: Returns 450 (300 × 1.5)
- [ ] Round 2: Returns 675 (450 × 1.5)
- [ ] Round 3: Returns 1,013 (675 × 1.5)
- [ ] Round 5: Returns 2,279
- [ ] Formula: 300 × (1.5)^(n-1) × 1.5

### getReward():
- [ ] Returns $5 for all rounds

### getModifier():
- [ ] Returns null (no modifier)

## 5. BossBlind Class Tests

### Constructor:
- [ ] Creates boss blind with round and boss type
- [ ] Stores round number correctly
- [ ] Stores boss type correctly
- [ ] Name matches boss type name
- [ ] Description matches boss type
- [ ] Creates modifier based on boss type
- [ ] Throws error on roundNumber ≤ 0
- [ ] Throws error on null bossType

### getScoreGoal() - Base Calculation:
- [ ] Round 1: Base = 600 (300 × 2.0)
- [ ] Round 2: Base = 900 (450 × 2.0)
- [ ] Round 3: Base = 1,350 (675 × 2.0)
- [ ] Formula: 300 × (1.5)^(n-1) × 2.0 × modifier.goalMultiplier

### getScoreGoal() - Boss-Specific:
- [ ] The Wall Round 1: 2,400 (300 × 2.0 × 4)
- [ ] The Water Round 1: 600 (300 × 2.0 × 1)
- [ ] The Mouth Round 1: 600 (300 × 2.0 × 1)
- [ ] The Needle Round 1: 300 (300 × 2.0 × 0.5)
- [ ] The Flint Round 1: 600 (300 × 2.0 × 1)

### getReward():
- [ ] Returns $10 for all boss types and rounds

### getModifier():
- [ ] Returns BlindModifier object
- [ ] The Wall: goalMultiplier = 4
- [ ] The Water: maxDiscards = 0
- [ ] The Needle: maxHands = 1, goalMultiplier = 0.5
- [ ] The Flint: chipsDivisor = 2, multDivisor = 2

### getBossType():
- [ ] Returns boss type
- [ ] Can identify specific boss

## 6. BlindGenerator Class Tests

### generateBlindForLevel():
- [ ] Level 1 → SmallBlind, Round 1
- [ ] Level 2 → BigBlind, Round 1
- [ ] Level 3 → BossBlind, Round 1
- [ ] Level 4 → SmallBlind, Round 2
- [ ] Level 5 → BigBlind, Round 2
- [ ] Level 6 → BossBlind, Round 2
- [ ] Level 7 → SmallBlind, Round 3
- [ ] Level 10 → SmallBlind, Round 4
- [ ] Level 24 → BossBlind, Round 8

### Pattern Verification:
- [ ] (level - 1) % 3 === 0 → SmallBlind
- [ ] (level - 1) % 3 === 1 → BigBlind
- [ ] (level - 1) % 3 === 2 → BossBlind

### Round Number Calculation:
- [ ] Levels 1-3 → Round 1
- [ ] Levels 4-6 → Round 2
- [ ] Levels 7-9 → Round 3
- [ ] Formula: Math.floor((level - 1) / 3) + 1

### Boss Selection:
- [ ] Boss blind has one of 5 boss types
- [ ] Boss type is randomly selected
- [ ] All 5 boss types possible
- [ ] (Statistical test: generate 100 bosses, verify distribution)

### Validation:
- [ ] Throws error on level ≤ 0
- [ ] Throws error on negative level
- [ ] Handles level 1 (edge case)
- [ ] Handles large levels (100+)

## 7. Integration Tests

### Complete Progression (Levels 1-24):
- [ ] Level 1: Small, Round 1, Goal 300, Reward $2
- [ ] Level 2: Big, Round 1, Goal 450, Reward $5
- [ ] Level 3: Boss, Round 1, Goal 600+, Reward $10
- [ ] ... through Level 24
- [ ] Verify correct blind type pattern
- [ ] Verify correct round increments
- [ ] Verify goal progression formula

### Boss Modifier Application:
- [ ] The Wall blind generated
- [ ] Verify modifier.goalMultiplier = 4
- [ ] Verify goal is 4× higher than normal boss
- [ ] The Water blind generated
- [ ] Verify modifier.maxDiscards = 0

### Blind Comparison:
- [ ] Same round: Small < Big < Boss (goal comparison)
- [ ] Example Round 1: 300 < 450 < 600
- [ ] Example Round 2: 450 < 675 < 900

## 8. Edge Cases

### Level Boundaries:
- [ ] Level 1 (first small)
- [ ] Level 3 (first boss)
- [ ] Level 100 (very large exponents)

### Floating Point Precision:
- [ ] Goals are whole numbers (or properly rounded)
- [ ] No precision errors in exponentiation

### The Mouth Random Selection:
- [ ] allowedHandTypes contains exactly 1 hand type
- [ ] Hand type is one of 9 valid types
- [ ] Different bosses may have different allowed types

### Modifier Edge Cases:
- [ ] Modifier with all null values (defaults work)
- [ ] Modifier with zero divisors (should not happen, validate)
- [ ] Modifier with negative multipliers (should not happen, validate)

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  Blind,
  SmallBlind,
  BigBlind,
  BossBlind,
  BlindGenerator,
  BlindModifier,
  BossType
} from '@/models/blinds';
import { HandType } from '@/models/poker';

describe('Blinds System', () => {
  describe('BossType Enum', () => {
    it('should define THE_WALL', () => {
      // ASSERT
      expect(BossType.THE_WALL).toBeDefined();
    });

    it('should define THE_WATER', () => {
      // ASSERT
      expect(BossType.THE_WATER).toBeDefined();
    });

    it('should define THE_MOUTH', () => {
      // ASSERT
      expect(BossType.THE_MOUTH).toBeDefined();
    });

    it('should define THE_NEEDLE', () => {
      // ASSERT
      expect(BossType.THE_NEEDLE).toBeDefined();
    });

    it('should define THE_FLINT', () => {
      // ASSERT
      expect(BossType.THE_FLINT).toBeDefined();
    });

    it('should provide readable names for all boss types', () => {
      // ACT & ASSERT
      expect(BossType.THE_WALL.getName()).toBe('The Wall');
      expect(BossType.THE_WATER.getName()).toBe('The Water');
      expect(BossType.THE_MOUTH.getName()).toBe('The Mouth');
      expect(BossType.THE_NEEDLE.getName()).toBe('The Needle');
      expect(BossType.THE_FLINT.getName()).toBe('The Flint');
    });

    it('should provide descriptions for all boss types', () => {
      // ACT & ASSERT
      expect(BossType.THE_WALL.getDescription()).toContain('4');
      expect(BossType.THE_WATER.getDescription()).toContain('discard');
      expect(BossType.THE_MOUTH.getDescription()).toContain('hand');
      expect(BossType.THE_NEEDLE.getDescription()).toContain('1');
      expect(BossType.THE_FLINT.getDescription()).toContain('divid');
    });
  });

  describe('BlindModifier', () => {
    describe('constructor', () => {
      it('should create modifier with default values', () => {
        // ACT
        const modifier = new BlindModifier();
        
        // ASSERT
        expect(modifier.goalMultiplier).toBe(1.0);
        expect(modifier.maxHands).toBeNull();
        expect(modifier.maxDiscards).toBeNull();
        expect(modifier.allowedHandTypes).toBeNull();
        expect(modifier.chipsDivisor).toBe(1.0);
        expect(modifier.multDivisor).toBe(1.0);
      });

      it('should accept and store custom values', () => {
        // ACT
        const modifier = new BlindModifier({
          goalMultiplier: 4,
          maxHands: 1,
          maxDiscards: 0,
          chipsDivisor: 2,
          multDivisor: 2
        });
        
        // ASSERT
        expect(modifier.goalMultiplier).toBe(4);
        expect(modifier.maxHands).toBe(1);
        expect(modifier.maxDiscards).toBe(0);
        expect(modifier.chipsDivisor).toBe(2);
        expect(modifier.multDivisor).toBe(2);
      });

      it('should accept partial properties', () => {
        // ACT
        const modifier = new BlindModifier({
          goalMultiplier: 2
        });
        
        // ASSERT
        expect(modifier.goalMultiplier).toBe(2);
        expect(modifier.maxHands).toBeNull(); // Default
        expect(modifier.chipsDivisor).toBe(1.0); // Default
      });
    });

    describe('Boss-Specific Modifiers', () => {
      it('should create The Wall modifier', () => {
        // ACT
        const modifier = new BlindModifier({ goalMultiplier: 4 });
        
        // ASSERT
        expect(modifier.goalMultiplier).toBe(4);
        expect(modifier.maxHands).toBeNull();
        expect(modifier.maxDiscards).toBeNull();
      });

      it('should create The Water modifier', () => {
        // ACT
        const modifier = new BlindModifier({ maxDiscards: 0 });
        
        // ASSERT
        expect(modifier.maxDiscards).toBe(0);
        expect(modifier.goalMultiplier).toBe(1.0);
      });

      it('should create The Mouth modifier', () => {
        // ACT
        const allowedType = HandType.FLUSH;
        const modifier = new BlindModifier({ 
          allowedHandTypes: [allowedType] 
        });
        
        // ASSERT
        expect(modifier.allowedHandTypes).toHaveLength(1);
        expect(modifier.allowedHandTypes![0]).toBe(allowedType);
      });

      it('should create The Needle modifier', () => {
        // ACT
        const modifier = new BlindModifier({ 
          maxHands: 1, 
          goalMultiplier: 0.5 
        });
        
        // ASSERT
        expect(modifier.maxHands).toBe(1);
        expect(modifier.goalMultiplier).toBe(0.5);
      });

      it('should create The Flint modifier', () => {
        // ACT
        const modifier = new BlindModifier({ 
          chipsDivisor: 2, 
          multDivisor: 2 
        });
        
        // ASSERT
        expect(modifier.chipsDivisor).toBe(2);
        expect(modifier.multDivisor).toBe(2);
      });
    });
  });

  describe('SmallBlind', () => {
    describe('constructor', () => {
      it('should create small blind with round number', () => {
        // ACT
        const blind = new SmallBlind(1);
        
        // ASSERT
        expect(blind.getRoundNumber()).toBe(1);
        expect(blind.getName()).toBe('Small Blind');
        expect(blind.getDescription()).toBeDefined();
      });

      it('should throw error on roundNumber ≤ 0', () => {
        // ACT & ASSERT
        expect(() => new SmallBlind(0))
          .toThrow('Round number must be positive');
        expect(() => new SmallBlind(-1))
          .toThrow('Round number must be positive');
      });
    });

    describe('getScoreGoal', () => {
      it('should return 300 for round 1', () => {
        // ARRANGE
        const blind = new SmallBlind(1);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBe(300);
      });

      it('should return 450 for round 2', () => {
        // ARRANGE
        const blind = new SmallBlind(2);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBe(450);
      });

      it('should return 675 for round 3', () => {
        // ARRANGE
        const blind = new SmallBlind(3);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBe(675);
      });

      it('should return 1,519 for round 5', () => {
        // ARRANGE
        const blind = new SmallBlind(5);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBeCloseTo(1519, 0);
      });

      it('should calculate correctly for round 10', () => {
        // ARRANGE
        const blind = new SmallBlind(10);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT - 300 × (1.5)^9 ≈ 38,443
        expect(goal).toBeCloseTo(38443, 0);
      });

      it('should follow formula: 300 × (1.5)^(n-1)', () => {
        // ARRANGE
        const round = 4;
        const blind = new SmallBlind(round);
        const expected = 300 * Math.pow(1.5, round - 1);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBeCloseTo(expected, 0);
      });
    });

    describe('getReward', () => {
      it('should return $2 for all rounds', () => {
        // ARRANGE
        const blind1 = new SmallBlind(1);
        const blind5 = new SmallBlind(5);
        const blind10 = new SmallBlind(10);
        
        // ACT & ASSERT
        expect(blind1.getReward()).toBe(2);
        expect(blind5.getReward()).toBe(2);
        expect(blind10.getReward()).toBe(2);
      });
    });

    describe('getModifier', () => {
      it('should return null (no modifier)', () => {
        // ARRANGE
        const blind = new SmallBlind(1);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier).toBeNull();
      });
    });
  });

  describe('BigBlind', () => {
    describe('constructor', () => {
      it('should create big blind with round number', () => {
        // ACT
        const blind = new BigBlind(1);
        
        // ASSERT
        expect(blind.getRoundNumber()).toBe(1);
        expect(blind.getName()).toBe('Big Blind');
      });

      it('should throw error on roundNumber ≤ 0', () => {
        // ACT & ASSERT
        expect(() => new BigBlind(0))
          .toThrow('Round number must be positive');
      });
    });

    describe('getScoreGoal', () => {
      it('should return 450 for round 1 (300 × 1.5)', () => {
        // ARRANGE
        const blind = new BigBlind(1);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBe(450);
      });

      it('should return 675 for round 2 (450 × 1.5)', () => {
        // ARRANGE
        const blind = new BigBlind(2);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBeCloseTo(675, 0);
      });

      it('should return 1,013 for round 3', () => {
        // ARRANGE
        const blind = new BigBlind(3);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBeCloseTo(1013, 0);
      });

      it('should return 2,279 for round 5', () => {
        // ARRANGE
        const blind = new BigBlind(5);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBeCloseTo(2279, 0);
      });

      it('should follow formula: 300 × (1.5)^(n-1) × 1.5', () => {
        // ARRANGE
        const round = 4;
        const blind = new BigBlind(round);
        const expected = 300 * Math.pow(1.5, round - 1) * 1.5;
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT
        expect(goal).toBeCloseTo(expected, 0);
      });
    });

    describe('getReward', () => {
      it('should return $5 for all rounds', () => {
        // ARRANGE
        const blind1 = new BigBlind(1);
        const blind5 = new BigBlind(5);
        
        // ACT & ASSERT
        expect(blind1.getReward()).toBe(5);
        expect(blind5.getReward()).toBe(5);
      });
    });

    describe('getModifier', () => {
      it('should return null (no modifier)', () => {
        // ARRANGE
        const blind = new BigBlind(1);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier).toBeNull();
      });
    });
  });

  describe('BossBlind', () => {
    describe('constructor', () => {
      it('should create boss blind with round and boss type', () => {
        // ACT
        const blind = new BossBlind(1, BossType.THE_WALL);
        
        // ASSERT
        expect(blind.getRoundNumber()).toBe(1);
        expect(blind.getBossType()).toBe(BossType.THE_WALL);
        expect(blind.getName()).toBe('The Wall');
      });

      it('should throw error on roundNumber ≤ 0', () => {
        // ACT & ASSERT
        expect(() => new BossBlind(0, BossType.THE_WALL))
          .toThrow('Round number must be positive');
      });

      it('should throw error on null bossType', () => {
        // ACT & ASSERT
        expect(() => new BossBlind(1, null as any))
          .toThrow('Boss type cannot be null');
      });
    });

    describe('getScoreGoal - Base Calculation', () => {
      it('should return 600 for round 1 (no boss modifier)', () => {
        // ARRANGE - The Water has no goal modifier
        const blind = new BossBlind(1, BossType.THE_WATER);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT - 300 × 2.0 = 600
        expect(goal).toBe(600);
      });

      it('should return 900 for round 2 (no boss modifier)', () => {
        // ARRANGE
        const blind = new BossBlind(2, BossType.THE_WATER);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT - 450 × 2.0 = 900
        expect(goal).toBeCloseTo(900, 0);
      });

      it('should return 1,350 for round 3 (no boss modifier)', () => {
        // ARRANGE
        const blind = new BossBlind(3, BossType.THE_WATER);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT - 675 × 2.0 = 1,350
        expect(goal).toBeCloseTo(1350, 0);
      });
    });

    describe('getScoreGoal - Boss-Specific', () => {
      it('should return 2,400 for The Wall round 1 (×4 modifier)', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_WALL);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT - 300 × 2.0 × 4 = 2,400
        expect(goal).toBe(2400);
      });

      it('should return 300 for The Needle round 1 (×0.5 modifier)', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_NEEDLE);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT - 300 × 2.0 × 0.5 = 300
        expect(goal).toBe(300);
      });

      it('should return 600 for The Mouth round 1 (no goal modifier)', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_MOUTH);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT - 300 × 2.0 = 600
        expect(goal).toBe(600);
      });

      it('should return 600 for The Flint round 1 (no goal modifier)', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_FLINT);
        
        // ACT
        const goal = blind.getScoreGoal();
        
        // ASSERT - 300 × 2.0 = 600
        expect(goal).toBe(600);
      });
    });

    describe('getReward', () => {
      it('should return $10 for all boss types and rounds', () => {
        // ARRANGE
        const wall = new BossBlind(1, BossType.THE_WALL);
        const water = new BossBlind(5, BossType.THE_WATER);
        const needle = new BossBlind(10, BossType.THE_NEEDLE);
        
        // ACT & ASSERT
        expect(wall.getReward()).toBe(10);
        expect(water.getReward()).toBe(10);
        expect(needle.getReward()).toBe(10);
      });
    });

    describe('getModifier', () => {
      it('should return BlindModifier object', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_WALL);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier).not.toBeNull();
        expect(modifier).toBeInstanceOf(BlindModifier);
      });

      it('should return The Wall modifier with goalMultiplier = 4', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_WALL);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier!.goalMultiplier).toBe(4);
      });

      it('should return The Water modifier with maxDiscards = 0', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_WATER);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier!.maxDiscards).toBe(0);
      });

      it('should return The Needle modifier with maxHands = 1 and goalMultiplier = 0.5', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_NEEDLE);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier!.maxHands).toBe(1);
        expect(modifier!.goalMultiplier).toBe(0.5);
      });

      it('should return The Flint modifier with chipsDivisor = 2 and multDivisor = 2', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_FLINT);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier!.chipsDivisor).toBe(2);
        expect(modifier!.multDivisor).toBe(2);
      });

      it('should return The Mouth modifier with exactly 1 allowed hand type', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_MOUTH);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier!.allowedHandTypes).toHaveLength(1);
        // Verify it's a valid hand type
        const allowedType = modifier!.allowedHandTypes![0];
        const validTypes = Object.values(HandType);
        expect(validTypes).toContain(allowedType);
      });
    });

    describe('getBossType', () => {
      it('should return boss type', () => {
        // ARRANGE
        const wall = new BossBlind(1, BossType.THE_WALL);
        const water = new BossBlind(1, BossType.THE_WATER);
        
        // ACT & ASSERT
        expect(wall.getBossType()).toBe(BossType.THE_WALL);
        expect(water.getBossType()).toBe(BossType.THE_WATER);
      });
    });
  });

  describe('BlindGenerator', () => {
    let generator: BlindGenerator;

    beforeEach(() => {
      generator = new BlindGenerator();
    });

    describe('generateBlindForLevel - Pattern', () => {
      it('should generate SmallBlind for level 1', () => {
        // ACT
        const blind = generator.generateBlindForLevel(1);
        
        // ASSERT
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getRoundNumber()).toBe(1);
      });

      it('should generate BigBlind for level 2', () => {
        // ACT
        const blind = generator.generateBlindForLevel(2);
        
        // ASSERT
        expect(blind).toBeInstanceOf(BigBlind);
        expect(blind.getRoundNumber()).toBe(1);
      });

      it('should generate BossBlind for level 3', () => {
        // ACT
        const blind = generator.generateBlindForLevel(3);
        
        // ASSERT
        expect(blind).toBeInstanceOf(BossBlind);
        expect(blind.getRoundNumber()).toBe(1);
      });

      it('should generate SmallBlind for level 4', () => {
        // ACT
        const blind = generator.generateBlindForLevel(4);
        
        // ASSERT
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getRoundNumber()).toBe(2);
      });

      it('should generate BigBlind for level 5', () => {
        // ACT
        const blind = generator.generateBlindForLevel(5);
        
        // ASSERT
        expect(blind).toBeInstanceOf(BigBlind);
        expect(blind.getRoundNumber()).toBe(2);
      });

      it('should generate BossBlind for level 6', () => {
        // ACT
        const blind = generator.generateBlindForLevel(6);
        
        // ASSERT
        expect(blind).toBeInstanceOf(BossBlind);
        expect(blind.getRoundNumber()).toBe(2);
      });

      it('should generate SmallBlind for level 7', () => {
        // ACT
        const blind = generator.generateBlindForLevel(7);
        
        // ASSERT
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getRoundNumber()).toBe(3);
      });

      it('should generate SmallBlind for level 10', () => {
        // ACT
        const blind = generator.generateBlindForLevel(10);
        
        // ASSERT
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getRoundNumber()).toBe(4);
      });

      it('should generate BossBlind for level 24 (victory level)', () => {
        // ACT
        const blind = generator.generateBlindForLevel(24);
        
        // ASSERT
        expect(blind).toBeInstanceOf(BossBlind);
        expect(blind.getRoundNumber()).toBe(8);
      });
    });

    describe('Pattern Verification', () => {
      it('should follow pattern: (level-1) % 3 === 0 → SmallBlind', () => {
        // ACT & ASSERT
        for (let level = 1; level <= 24; level += 3) {
          const blind = generator.generateBlindForLevel(level);
          expect(blind).toBeInstanceOf(SmallBlind);
        }
      });

      it('should follow pattern: (level-1) % 3 === 1 → BigBlind', () => {
        // ACT & ASSERT
        for (let level = 2; level <= 24; level += 3) {
          const blind = generator.generateBlindForLevel(level);
          expect(blind).toBeInstanceOf(BigBlind);
        }
      });

      it('should follow pattern: (level-1) % 3 === 2 → BossBlind', () => {
        // ACT & ASSERT
        for (let level = 3; level <= 24; level += 3) {
          const blind = generator.generateBlindForLevel(level);
          expect(blind).toBeInstanceOf(BossBlind);
        }
      });
    });

    describe('Round Number Calculation', () => {
      it('should assign round 1 for levels 1-3', () => {
        // ACT
        const blind1 = generator.generateBlindForLevel(1);
        const blind2 = generator.generateBlindForLevel(2);
        const blind3 = generator.generateBlindForLevel(3);
        
        // ASSERT
        expect(blind1.getRoundNumber()).toBe(1);
        expect(blind2.getRoundNumber()).toBe(1);
        expect(blind3.getRoundNumber()).toBe(1);
      });

      it('should assign round 2 for levels 4-6', () => {
        // ACT
        const blind4 = generator.generateBlindForLevel(4);
        const blind5 = generator.generateBlindForLevel(5);
        const blind6 = generator.generateBlindForLevel(6);
        
        // ASSERT
        expect(blind4.getRoundNumber()).toBe(2);
        expect(blind5.getRoundNumber()).toBe(2);
        expect(blind6.getRoundNumber()).toBe(2);
      });

      it('should assign round 3 for levels 7-9', () => {
        // ACT
        const blind7 = generator.generateBlindForLevel(7);
        const blind9 = generator.generateBlindForLevel(9);
        
        // ASSERT
        expect(blind7.getRoundNumber()).toBe(3);
        expect(blind9.getRoundNumber()).toBe(3);
      });

      it('should follow formula: Math.floor((level - 1) / 3) + 1', () => {
        // ARRANGE & ACT
        for (let level = 1; level <= 30; level++) {
          const blind = generator.generateBlindForLevel(level);
          const expectedRound = Math.floor((level - 1) / 3) + 1;
          
          // ASSERT
          expect(blind.getRoundNumber()).toBe(expectedRound);
        }
      });
    });

    describe('Boss Selection', () => {
      it('should generate boss blind with one of 5 boss types', () => {
        // ACT
        const blind = generator.generateBlindForLevel(3) as BossBlind;
        
        // ASSERT
        const validBossTypes = [
          BossType.THE_WALL,
          BossType.THE_WATER,
          BossType.THE_MOUTH,
          BossType.THE_NEEDLE,
          BossType.THE_FLINT
        ];
        expect(validBossTypes).toContain(blind.getBossType());
      });

      it('should randomly select boss types (statistical test)', () => {
        // ARRANGE - Generate 100 bosses
        const bosses: BossBlind[] = [];
        for (let i = 0; i < 100; i++) {
          const blind = generator.generateBlindForLevel(3) as BossBlind;
          bosses.push(blind);
        }
        
        // ACT - Count occurrences
        const counts = new Map<BossType, number>();
        bosses.forEach(boss => {
          const type = boss.getBossType();
          counts.set(type, (counts.get(type) || 0) + 1);
        });
        
        // ASSERT - At least 3 different boss types should appear
        // (With 100 samples and 5 types, extremely unlikely to only see 1-2 types)
        expect(counts.size).toBeGreaterThanOrEqual(3);
        
        // Each type that appears should have some reasonable count
        counts.forEach(count => {
          expect(count).toBeGreaterThan(0);
        });
      });
    });

    describe('Validation', () => {
      it('should throw error on level ≤ 0', () => {
        // ACT & ASSERT
        expect(() => generator.generateBlindForLevel(0))
          .toThrow('Level must be positive');
      });

      it('should throw error on negative level', () => {
        // ACT & ASSERT
        expect(() => generator.generateBlindForLevel(-5))
          .toThrow('Level must be positive');
      });

      it('should handle level 1 (edge case)', () => {
        // ACT
        const blind = generator.generateBlindForLevel(1);
        
        // ASSERT
        expect(blind).toBeInstanceOf(SmallBlind);
        expect(blind.getRoundNumber()).toBe(1);
      });

      it('should handle large levels (100+)', () => {
        // ACT
        const blind = generator.generateBlindForLevel(100);
        
        // ASSERT
        expect(blind).toBeDefined();
        const expectedRound = Math.floor((100 - 1) / 3) + 1;
        expect(blind.getRoundNumber()).toBe(expectedRound);
      });
    });
  });

  describe('Integration Tests', () => {
    let generator: BlindGenerator;

    beforeEach(() => {
      generator = new BlindGenerator();
    });

    describe('Complete Progression (Levels 1-24)', () => {
      it('should generate correct sequence for first 9 levels', () => {
        // ACT & ASSERT
        const level1 = generator.generateBlindForLevel(1);
        expect(level1).toBeInstanceOf(SmallBlind);
        expect(level1.getScoreGoal()).toBe(300);
        expect(level1.getReward()).toBe(2);

        const level2 = generator.generateBlindForLevel(2);
        expect(level2).toBeInstanceOf(BigBlind);
        expect(level2.getScoreGoal()).toBe(450);
        expect(level2.getReward()).toBe(5);

        const level3 = generator.generateBlindForLevel(3);
        expect(level3).toBeInstanceOf(BossBlind);
        expect(level3.getScoreGoal()).toBeGreaterThanOrEqual(300); // Depends on boss type
        expect(level3.getReward()).toBe(10);

        const level7 = generator.generateBlindForLevel(7);
        expect(level7).toBeInstanceOf(SmallBlind);
        expect(level7.getRoundNumber()).toBe(3);
        expect(level7.getScoreGoal()).toBe(675);
      });
    });

    describe('Blind Comparison', () => {
      it('should satisfy: Small < Big < Boss (for same round, base goals)', () => {
        // ARRANGE - Round 1
        const small = new SmallBlind(1);
        const big = new BigBlind(1);
        const boss = new BossBlind(1, BossType.THE_WATER); // No goal modifier
        
        // ACT
        const smallGoal = small.getScoreGoal();
        const bigGoal = big.getScoreGoal();
        const bossGoal = boss.getScoreGoal();
        
        // ASSERT
        expect(smallGoal).toBe(300);
        expect(bigGoal).toBe(450);
        expect(bossGoal).toBe(600);
        expect(smallGoal).toBeLessThan(bigGoal);
        expect(bigGoal).toBeLessThan(bossGoal);
      });

      it('should satisfy: Round 2 goals > Round 1 goals', () => {
        // ARRANGE
        const smallR1 = new SmallBlind(1);
        const smallR2 = new SmallBlind(2);
        
        // ACT & ASSERT
        expect(smallR2.getScoreGoal()).toBeGreaterThan(smallR1.getScoreGoal());
      });
    });

    describe('Boss Modifier Application', () => {
      it('should apply The Wall modifier correctly', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_WALL);
        
        // ACT
        const goal = blind.getScoreGoal();
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(goal).toBe(2400); // 300 × 2 × 4
        expect(modifier!.goalMultiplier).toBe(4);
      });

      it('should apply The Water modifier correctly', () => {
        // ARRANGE
        const blind = new BossBlind(1, BossType.THE_WATER);
        
        // ACT
        const modifier = blind.getModifier();
        
        // ASSERT
        expect(modifier!.maxDiscards).toBe(0);
        expect(modifier!.goalMultiplier).toBe(1.0);
      });
    });

    describe('Floating Point Precision', () => {
      it('should return integer goals (or properly rounded)', () => {
        // ARRANGE & ACT
        for (let level = 1; level <= 24; level++) {
          const blind = generator.generateBlindForLevel(level);
          const goal = blind.getScoreGoal();
          
          // ASSERT - Goal should be close to an integer
          expect(Math.abs(goal - Math.round(goal))).toBeLessThan(1);
        }
      });
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for all blind types
- All 5 boss types tested
- BlindGenerator pattern verification
- Progression formula tested
- Edge cases covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| BossType | Enum values | 5 | 0 | 0 | 5 |
| BossType | getName | 1 | 0 | 0 | 1 |
| BossType | getDescription | 1 | 0 | 0 | 1 |
| BlindModifier | constructor | 3 | 0 | 0 | 3 |
| BlindModifier | Boss modifiers | 5 | 0 | 0 | 5 |
| SmallBlind | constructor | 1 | 0 | 2 | 3 |
| SmallBlind | getScoreGoal | 6 | 0 | 0 | 6 |
| SmallBlind | getReward | 1 | 0 | 0 | 1 |
| SmallBlind | getModifier | 1 | 0 | 0 | 1 |
| BigBlind | constructor | 1 | 0 | 1 | 2 |
| BigBlind | getScoreGoal | 5 | 0 | 0 | 5 |
| BigBlind | getReward | 1 | 0 | 0 | 1 |
| BigBlind | getModifier | 1 | 0 | 0 | 1 |
| BossBlind | constructor | 1 | 0 | 2 | 3 |
| BossBlind | getScoreGoal Base | 3 | 0 | 0 | 3 |
| BossBlind | getScoreGoal Boss | 4 | 0 | 0 | 4 |
| BossBlind | getReward | 1 | 0 | 0 | 1 |
| BossBlind | getModifier | 5 | 0 | 0 | 5 |
| BossBlind | getBossType | 1 | 0 | 0 | 1 |
| BlindGenerator | Pattern | 9 | 0 | 0 | 9 |
| BlindGenerator | Pattern Verification | 3 | 0 | 0 | 3 |
| BlindGenerator | Round Calculation | 4 | 0 | 0 | 4 |
| BlindGenerator | Boss Selection | 2 | 0 | 0 | 2 |
| BlindGenerator | Validation | 2 | 2 | 2 | 6 |
| Integration | Progression | 1 | 0 | 0 | 1 |
| Integration | Comparison | 2 | 0 | 0 | 2 |
| Integration | Boss Modifiers | 2 | 0 | 0 | 2 |
| Integration | Floating Point | 1 | 0 | 0 | 1 |
| **TOTAL** | | | | | **82** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **92%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios:
  - Internal random selection logic (tested via statistical test)
  - Some boss modifier edge cases (tested indirectly)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/models/blinds.test.ts

# Run with coverage
npm test -- --coverage tests/unit/models/blinds.test.ts

# Run in watch mode
npm test -- --watch tests/unit/models/blinds.test.ts

# Run specific describe blocks
npm test -- -t "BossBlind" tests/unit/models/blinds.test.ts
npm test -- -t "BlindGenerator" tests/unit/models/blinds.test.ts
npm test -- -t "Integration" tests/unit/models/blinds.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Progression formula:** Exponential growth requires careful floating point handling
- **Boss modifier combinations:** Goal multiplier combines with base 2× multiplier
- **The Mouth randomness:** Each boss instance gets different allowed hand type
- **Pattern consistency:** Small → Big → Boss must repeat perfectly
- **Round calculation:** Off-by-one errors common with floor division
- **Level 24 significance:** Final boss (round 8) for victory condition
- **Modifier application:** Some modifiers affect goal, others affect gameplay
- **The Needle paradox:** Easier goal (0.5×) but only 1 hand makes it harder

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to create all 5 boss types
function createAllBossTypes(round: number): BossBlind[] {
  return [
    new BossBlind(round, BossType.THE_WALL),
    new BossBlind(round, BossType.THE_WATER),
    new BossBlind(round, BossType.THE_MOUTH),
    new BossBlind(round, BossType.THE_NEEDLE),
    new BossBlind(round, BossType.THE_FLINT)
  ];
}

// Helper to verify progression formula
function calculateExpectedGoal(
  round: number,
  blindType: 'small' | 'big' | 'boss',
  bossModifier: number = 1.0
): number {
  const base = 300 * Math.pow(1.5, round - 1);
  const multipliers = {
    small: 1.0,
    big: 1.5,
    boss: 2.0 * bossModifier
  };
  return Math.floor(base * multipliers[blindType]);
}

// Helper to generate complete level sequence
function generateLevelSequence(maxLevel: number): Blind[] {
  const generator = new BlindGenerator();
  const blinds: Blind[] = [];
  for (let level = 1; level <= maxLevel; level++) {
    blinds.push(generator.generateBlindForLevel(level));
  }
  return blinds;
}
```
