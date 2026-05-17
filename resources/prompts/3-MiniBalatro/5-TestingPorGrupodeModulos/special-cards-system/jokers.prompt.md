# TESTING CONTEXT
Project: Mini Balatro
Components under test: Joker (abstract), ChipJoker, MultJoker, MultiplierJoker, EconomicJoker, PermanentUpgradeJoker, JokerPriority (enum)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/models/special-cards/jokers/joker-priority.enum.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/joker-priority.enum.ts
 * @desc JokerPriority enumeration for effect application order.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enum defining joker effect application priority.
 * Enforces strict scoring calculation order as per requirements.
 */
export enum JokerPriority {
  CHIPS = 1,      // Priority 1: Applied first (chip additions)
  MULT = 2,       // Priority 2: Applied second (mult additions)
  MULTIPLIER = 3  // Priority 3: Applied last (mult multipliers)
}

/**
 * Returns the numeric priority value for sorting.
 * @param priority - The JokerPriority value
 * @returns The numeric priority (1, 2, or 3)
 */
export function getPriorityValue(priority: JokerPriority): number {
  return priority;
}
```

## File 2: src/models/special-cards/jokers/joker.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/joker.ts
 * @desc Abstract base class for all joker cards.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { ScoreContext } from '../../scoring/score-context';
import { JokerPriority } from './joker-priority.enum';

/**
 * Abstract base class for all joker cards.
 * Jokers provide persistent bonuses during score calculation.
 */
export abstract class Joker {
  /**
   * Creates a joker with specified properties.
   * @param id - Unique identifier for the joker
   * @param name - Display name
   * @param description - Effect description for UI
   * @param priority - When this joker's effect applies
   * @param condition - Optional condition function for activation
   * @throws Error if name or description is empty
   */
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly priority: JokerPriority,
    protected readonly condition?: (context: ScoreContext) => boolean
  ) {
    if (!name || !description) {
      throw new Error('Joker name and description must not be empty');
    }
  }

  /**
   * Applies the joker's effect to the score context.
   *
   * Implementation notes for authors of Joker subclasses:
   * - The `ScoreCalculator` invokes `applyEffect` exactly once per joker
   *   during the persistent joker phase (after individual card evaluation)
   *   and in priority order: CHIPS → MULT → MULTIPLIER. Do not assume
   *   `applyEffect` will be called per played card.
   * - If a joker's behavior depends on individual played cards, the
   *   implementation should inspect properties available on `context`
   *   (for example `context.playedCards` or other context helpers) and
   *   apply per-card logic internally in an idempotent manner to avoid
   *   accidental double-application. The scoring orchestration will not
   *   call `applyEffect` multiple times for the same joker.
   * - `applyEffect` should only modify scoring-related fields on the
   *   provided `ScoreContext` (e.g., chips, mult). Side-effects that
   *   mutate unrelated game state should be avoided; economic effects
   *   (money rewards) belong outside scoring and should be implemented
   *   in `EconomicJoker`-specific APIs.
   *
   * @param context - The score calculation context
   */
  public abstract applyEffect(context: ScoreContext): void;

  /**
   * Checks if joker's conditions are met for activation.
   * @param context - The score calculation context
   * @returns True if joker should activate
   */
  public canActivate(context: ScoreContext): boolean {
    return this.checkCondition(context);
  }

  /**
   * Protected helper for subclasses to evaluate activation condition.
   * Returns true if no condition provided or the condition function returns true.
   * @param context - The score calculation context
   */
  protected checkCondition(context: ScoreContext): boolean {
    return this.condition ? this.condition(context) : true;
  }

  /**
   * Returns the joker's priority level.
   * @returns The JokerPriority value
   */
  public getPriority(): JokerPriority {
    return this.priority;
  }
}
```

## File 3: src/models/special-cards/jokers/chip-joker.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/chip-joker.ts
 * @desc Joker that adds chips to the score.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Joker } from './joker';
import { JokerPriority } from './joker-priority.enum';
import { ScoreContext } from '../../scoring/score-context';

/**
 * Joker that adds chips to the score.
 * Applied with CHIPS priority (first).
 */
export class ChipJoker extends Joker {
  /**
   * Creates a chip-adding joker with optional condition.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param chipValue - Chips added per activation
   * @param condition - Optional condition function
   * @param multiplierFn - Optional function to calculate the multiplier (e.g., count odd cards)
   * @throws Error if chipValue <= 0
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly chipValue: number,
    condition?: (context: ScoreContext) => boolean,
    private readonly multiplierFn?: (context: ScoreContext) => number
  ) {
    super(id, name, description, JokerPriority.CHIPS, condition);
    if (chipValue <= 0) {
      throw new Error('Chip value must be positive');
    }
  }

  /**
   * Adds chips to context.chips based on condition and multiplier.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (!this.checkCondition(context)) {
      return;
    }
    // If there's a multiplier function (e.g., count odd cards), use it
    const multiplier = this.multiplierFn ? this.multiplierFn(context) : 1;
    const actualValue = this.chipValue * multiplier;

    context.chips += actualValue;
    console.log(`[${this.name}] Added ${actualValue} chips (Total: ${context.chips})`);
  }
}
```

## File 4: src/models/special-cards/jokers/mult-joker.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/mult-joker.ts
 * @desc Joker that adds mult to the score.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Joker } from './joker';
import { JokerPriority } from './joker-priority.enum';
import { ScoreContext } from '../../scoring/score-context';

/**
 * Joker that adds mult to the score.
 * Applied with MULT priority (second).
 */
export class MultJoker extends Joker {
  /**
   * Creates a mult-adding joker with optional condition.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param multValue - Mult added per activation
   * @param condition - Optional condition function
   * @param multiplierFn - Optional function to calculate the multiplier (e.g., count diamonds)
   * @throws Error if multValue <= 0
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly multValue: number,
    condition?: (context: ScoreContext) => boolean,
    private readonly multiplierFn?: (context: ScoreContext) => number
  ) {
    super(id, name, description, JokerPriority.MULT, condition);
    if (multValue <= 0) {
      throw new Error('Mult value must be positive');
    }
  }

  /**
   * Adds mult to context.mult based on condition and multiplier.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (!this.checkCondition(context)) {
      return;
    }
    // If there's a multiplier function (e.g., count diamonds), use it
    const multiplier = this.multiplierFn ? this.multiplierFn(context) : 1;
    const actualValue = this.multValue * multiplier;

    context.mult += actualValue;
    console.log(`[${this.name}] Added ${actualValue} mult (Total: ${context.mult})`);
  }
}
```

## File 5: src/models/special-cards/jokers/multiplier-joker.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/multiplier-joker.ts
 * @desc Joker that multiplies the total mult.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Joker } from './joker';
import { JokerPriority } from './joker-priority.enum';
import { ScoreContext } from '../../scoring/score-context';

/**
 * Joker that multiplies the total mult.
 * Applied with MULTIPLIER priority (last).
 */
export class MultiplierJoker extends Joker {
  /**
   * Creates a mult-multiplying joker with optional condition and dynamic multiplier.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param multiplierValue - Base factor to multiply mult by
   * @param condition - Optional condition function
   * @param multiplierFn - Optional function to calculate dynamic multiplier count
   * @throws Error if multiplierValue < 1
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly multiplierValue: number,
    condition?: (context: ScoreContext) => boolean,
    private readonly multiplierFn?: (context: ScoreContext) => number
  ) {
    super(id, name, description, JokerPriority.MULTIPLIER, condition);
    if (multiplierValue < 1) {
      throw new Error('Multiplier value must be at least 1');
    }
  }

  /**
   * Multiplies context.mult by multiplierValue (optionally scaled) based on condition.
   * @param context - The score calculation context
   */
  public applyEffect(context: ScoreContext): void {
    if (!this.checkCondition(context)) {
      return;
    }
    const originalMult = context.mult;
    // Calculate dynamic multiplier (default: use base value)
    const multiplierCount = this.multiplierFn ? this.multiplierFn(context) : 1;
    const actualMultiplier = this.multiplierValue * multiplierCount;
    context.mult *= actualMultiplier;
    console.log(`[${this.name}] Multiplied mult by ${actualMultiplier} (${originalMult} → ${context.mult})`);
  }
}
```

## File 6: src/models/special-cards/jokers/economic-joker.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/economic-joker.ts
 * @desc Joker that provides monetary benefits outside scoring.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Joker } from './joker';
import { ScoreContext } from '../../scoring/score-context';
import { JokerPriority } from './joker-priority.enum';

/**
 * Economic jokers provide monetary benefits (like +$X at end of blind)
 * rather than affecting hand scoring.
 * 
 * These jokers do NOT modify chips, mult, or multipliers during scoring.
 * Their effects are applied outside the scoring system (e.g., in GameController).
 * 
 * Examples:
 * - Golden Joker: +$2 at end of each passed level
 * - Greedy Joker: +$X per remaining hand
 */
export class EconomicJoker extends Joker {
  /**
   * Creates an economic joker that doesn't affect scoring.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description (typically includes "+$")
   * @param value - Monetary value (how much $ it provides)
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly value: number
  ) {
    // Economic jokers have no priority since they don't affect scoring
    // Use CHIPS as placeholder (but applyEffect is a no-op)
    super(id, name, description, JokerPriority.CHIPS);
  }

  /**
   * Economic jokers do NOT affect hand scoring.
   * This method intentionally does nothing.
   * @param _context - Unused score context
   */
  public applyEffect(_context: ScoreContext): void {
    // No-op: Economic effects are applied outside the scoring system
    // (e.g., in GameController when blind is completed)
  }

  /**
   * Economic jokers never activate during scoring.
   * @returns Always false
   */
  public canActivate(_context: ScoreContext): boolean {
    return false;
  }

  /**
   * Gets the monetary value this joker provides.
   * @returns Dollar amount
   */
  public getValue(): number {
    return this.value;
  }
}
```

## File 7: src/models/special-cards/jokers/permanent-upgrade-joker.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/permanent-upgrade-joker.ts
 * @desc Joker that permanently upgrades played cards.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Joker } from './joker';
import { JokerPriority } from './joker-priority.enum';
import { ScoreContext } from '../../scoring/score-context';
import { Card } from '../../core/card';

/**
 * Joker that permanently upgrades cards when played.
 * Unlike regular jokers that modify the score, this type modifies
 * the cards themselves, adding permanent bonuses that persist.
 * 
 * Example: Hiker - Each played card gains +5 chips permanently.
 * If you play a 10♦ (base 10 chips), it becomes (10 + 5 = 15 chips).
 * Play it again, it becomes (15 + 5 = 20 chips), and so on.
 */
export class PermanentUpgradeJoker extends Joker {
  /**
   * Creates a permanent upgrade joker.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description
   * @param chipBonus - Chips to add to each card (default 5)
   * @param multBonus - Mult to add to each card (default 0)
   */
  constructor(
    id: string,
    name: string,
    description: string,
    private readonly chipBonus: number = 5,
    private readonly multBonus: number = 0
  ) {
    super(id, name, description, JokerPriority.CHIPS);
  }

  /**
   * Returns CHIPS priority (happens before MULT and MULTIPLIER).
   * This ensures upgrades are applied early in the calculation.
   * @returns JokerPriority.CHIPS
   */
  public getPriority(): JokerPriority {
    return JokerPriority.CHIPS;
  }

  /**
   * Permanent upgrade jokers don't modify the score directly.
   * They modify cards AFTER the hand is played.
   * This method is here for compatibility but does nothing.
   * @param _context - Score context (unused)
   */
  public applyEffect(_context: ScoreContext): void {
    // NO-OP: Permanent upgrades happen AFTER scoring, not during
    // See GameState.playHand() for where cards are actually upgraded
  }

  /**
   * Always returns true - permanent upgrades always apply.
   * @param _context - Score context (unused)
   * @returns true
   */
  public canActivate(_context: ScoreContext): boolean {
    return true;
  }

  /**
   * Applies permanent upgrade to a single card.
   * @param card - The card to upgrade
   */
  public upgradeCard(card: Card): void {
    card.addPermanentBonus(this.chipBonus, this.multBonus);
    console.log(`[${this.name}] Upgraded card: +${this.chipBonus} chips, +${this.multBonus} mult`);
  }

  /**
   * Applies permanent upgrades to all cards in an array.
   * @param cards - The cards to upgrade
   */
  public upgradeCards(cards: Card[]): void {
    for (const card of cards) {
      this.upgradeCard(card);
    }
  }

  /**
   * Returns the chip bonus value.
   * @returns Chip bonus per card
   */
  public getChipBonus(): number {
    return this.chipBonus;
  }

  /**
   * Returns the mult bonus value.
   * @returns Mult bonus per card
   */
  public getMultBonus(): number {
    return this.multBonus;
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

## JokerPriority Enum Requirements:
- Must define exactly 3 priorities in strict order:
  - CHIPS = 1 (applied first)
  - MULT = 2 (applied second)
  - MULTIPLIER = 3 (applied last)
- Must provide numeric values for sorting
- ScoreCalculator must respect this order

## Joker Abstract Class Requirements:
- Properties: id (string), name (string), description (string), priority (JokerPriority)
- Constructor validates all properties non-null/non-empty
- getPriority() returns priority value
- getName() returns name
- getDescription() returns description
- **canActivate(context): boolean** - Abstract method, checks if joker activates
- **applyEffect(context): void** - Abstract method, modifies ScoreContext
- Subclasses must implement both abstract methods

## ChipJoker Class Requirements:
- Extends Joker with priority = CHIPS
- Properties: chipsValue (number), condition (optional function)
- Constructor validates chipsValue > 0
- canActivate(context): Evaluates condition function OR returns true if no condition
- applyEffect(context): Calls context.addChips(chipsValue × count)
- Count determined by condition function or fixed (1)
- Examples: Odd Todd (+31 chips per odd card), Blue Joker (+2 chips per deck card)

## MultJoker Class Requirements:
- Extends Joker with priority = MULT
- Properties: multValue (number), condition (optional function)
- Constructor validates multValue > 0
- canActivate(context): Evaluates condition function OR returns true if no condition
- applyEffect(context): Calls context.addMult(multValue × count)
- Count determined by condition function or fixed (1)
- Examples: Joker (+4 mult), Greedy Joker (+3 mult per Diamond), Wrathful Joker (+3 mult per Spade)

## MultiplierJoker Class Requirements:
- Extends Joker with priority = MULTIPLIER
- Properties: multiplierValue (number), condition (optional function)
- Constructor validates multiplierValue >= 1
- canActivate(context): Evaluates condition function OR returns true if no condition
- applyEffect(context): Calls context.multiplyMult(multiplierValue ^ count)
- Count determined by condition function (number of triggers)
- Examples: Triboulet (×2 mult per K/Q played), Fibonacci (×8 mult if hand has A,2,3,5,8)

## EconomicJoker Class Requirements:
- Extends Joker with **NO priority** (does not participate in scoring)
- Properties: moneyReward (number), condition (optional function)
- Constructor validates moneyReward > 0
- canActivate(context): Always returns false (not used in scoring)
- applyEffect(context): No-op (economic effect handled by GameState/Controller)
- getMoneyReward(): Returns money amount
- Applied at level completion, not during score calculation
- Example: Golden Joker (+$2 per level completed)

## PermanentUpgradeJoker Class Requirements:
- Extends Joker with **NO priority** (does not participate in scoring)
- Properties: chipsPerCard (number), multPerCard (number), condition (optional function)
- Constructor accepts chips and mult bonuses
- canActivate(context): Always returns false (not used in scoring)
- applyEffect(context): No-op (upgrade applied when card is played, not during calculation)
- applyPermanentUpgrade(card): Calls card.addPermanentBonus(chipsPerCard, multPerCard)
- Applied when cards are played, persists across hands
- Example: Hiker (+5 chips to each played card permanently)

## 15 Joker Examples to Test:

### MULT Jokers (Priority 2):
1. **Joker**: +4 mult (unconditional)
2. **Greedy Joker**: +3 mult per Diamond in played hand
3. **Lusty Joker**: +3 mult per Heart in played hand
4. **Wrathful Joker**: +3 mult per Spade in played hand
5. **Gluttonous Joker**: +3 mult per Club in played hand
6. **Half Joker**: +20 mult if played hand has ≤3 cards
7. **Mystic Summit**: +15 mult if 0 discards remaining

### CHIPS Jokers (Priority 1):
8. **Odd Todd**: +31 chips per odd-valued card (A,3,5,7,9)
9. **Even Steven**: +30 chips per even-valued card (2,4,6,8,10)
10. **Blue Joker**: +2 chips per remaining card in deck

### MULTIPLIER Jokers (Priority 3):
11. **Triboulet**: ×2 mult per King or Queen played
12. **Fibonacci**: ×8 mult if hand contains A,2,3,5,8 (any suits)
13. **Joker Stencil**: ×2 mult if played hand is exactly 1 card

### ECONOMIC Jokers (No priority):
14. **Golden Joker**: +$2 money reward per level completed

### PERMANENT UPGRADE Jokers (No priority):
15. **Hiker**: +5 chips to each card when played (permanent)

## Edge Cases:
- Joker with condition that's never met (canActivate returns false)
- Multiple jokers same priority (maintain array order)
- Condition function returns 0 (joker doesn't activate)
- Condition function throws error (handle gracefully)
- Multiplier with count > 1 (exponentiation: 2^3 = 8)
- Economic joker in scoring array (should be ignored)
- Permanent upgrade joker in scoring array (should be ignored)
- Negative or zero values in constructors (throw error)
- Null/empty name or description (throw error)

# TASK

Generate a complete unit test suite for Jokers System that covers:

## 1. JokerPriority Enum Tests
- [ ] CHIPS priority = 1
- [ ] MULT priority = 2
- [ ] MULTIPLIER priority = 3
- [ ] Numeric ordering for sorting
- [ ] All 3 priorities defined

## 2. Joker Abstract Class Tests

### Constructor (via subclass):
- [ ] Creates joker with valid properties
- [ ] Stores id, name, description correctly
- [ ] Stores priority correctly
- [ ] Throws error on null/empty id
- [ ] Throws error on null/empty name
- [ ] Throws error on null/empty description
- [ ] Throws error on null priority

### Getters:
- [ ] getPriority() returns correct priority
- [ ] getName() returns name
- [ ] getDescription() returns description

### Abstract Methods:
- [ ] canActivate must be implemented by subclass
- [ ] applyEffect must be implemented by subclass

## 3. ChipJoker Class Tests

### Constructor:
- [ ] Creates chip joker with valid inputs
- [ ] Priority automatically set to CHIPS
- [ ] Stores chipsValue correctly
- [ ] Stores condition function if provided
- [ ] Throws error on chipsValue ≤ 0
- [ ] Throws error on negative chipsValue
- [ ] Accepts condition = undefined (unconditional)

### canActivate():
- [ ] Returns true if no condition (unconditional)
- [ ] Returns true if condition function returns > 0
- [ ] Returns false if condition function returns 0
- [ ] Evaluates condition with correct context

### applyEffect():
- [ ] Adds chips to context
- [ ] Unconditional: adds chipsValue × 1
- [ ] With condition: adds chipsValue × count
- [ ] Example: Odd Todd with 2 odd cards adds 31 × 2 = 62 chips
- [ ] Example: Blue Joker with 44 deck cards adds 2 × 44 = 88 chips
- [ ] Context chips updated correctly

### Specific Joker Tests:
- [ ] **Odd Todd**: Counts odd cards correctly (A,3,5,7,9)
- [ ] **Even Steven**: Counts even cards correctly (2,4,6,8,10)
- [ ] **Blue Joker**: Counts remainingDeckSize correctly

## 4. MultJoker Class Tests

### Constructor:
- [ ] Creates mult joker with valid inputs
- [ ] Priority automatically set to MULT
- [ ] Stores multValue correctly
- [ ] Stores condition function if provided
- [ ] Throws error on multValue ≤ 0
- [ ] Accepts condition = undefined (unconditional)

### canActivate():
- [ ] Returns true if no condition (unconditional)
- [ ] Returns true if condition function returns > 0
- [ ] Returns false if condition function returns 0
- [ ] Evaluates condition with correct context

### applyEffect():
- [ ] Adds mult to context
- [ ] Unconditional: adds multValue × 1
- [ ] With condition: adds multValue × count
- [ ] Example: Greedy Joker with 3 Diamonds adds 3 × 3 = 9 mult
- [ ] Context mult updated correctly

### Specific Joker Tests:
- [ ] **Joker**: Always adds +4 mult
- [ ] **Greedy Joker**: Counts Diamonds correctly
- [ ] **Lusty Joker**: Counts Hearts correctly
- [ ] **Wrathful Joker**: Counts Spades correctly
- [ ] **Gluttonous Joker**: Counts Clubs correctly
- [ ] **Half Joker**: Activates only if playedCards.length ≤ 3
- [ ] **Mystic Summit**: Activates only if discardsRemaining = 0

## 5. MultiplierJoker Class Tests

### Constructor:
- [ ] Creates multiplier joker with valid inputs
- [ ] Priority automatically set to MULTIPLIER
- [ ] Stores multiplierValue correctly
- [ ] Stores condition function if provided
- [ ] Throws error on multiplierValue < 1
- [ ] Accepts condition = undefined (unconditional)

### canActivate():
- [ ] Returns true if no condition
- [ ] Returns true if condition function returns > 0
- [ ] Returns false if condition function returns 0

### applyEffect():
- [ ] Multiplies mult in context
- [ ] Unconditional: mult × multiplierValue^1
- [ ] With count: mult × multiplierValue^count
- [ ] Example: Triboulet with 2 Kings: mult × 2^2 = mult × 4
- [ ] Example: Fibonacci with valid hand: mult × 8
- [ ] Context mult updated correctly

### Specific Joker Tests:
- [ ] **Triboulet**: Counts K and Q correctly (2 K/Q → ×4)
- [ ] **Fibonacci**: Detects A,2,3,5,8 in hand (any suits)
- [ ] **Joker Stencil**: Activates only if exactly 1 card played

## 6. EconomicJoker Class Tests

### Constructor:
- [ ] Creates economic joker with valid inputs
- [ ] Has NO priority (or special economic priority)
- [ ] Stores moneyReward correctly
- [ ] Throws error on moneyReward ≤ 0
- [ ] Stores condition if provided

### canActivate():
- [ ] Always returns false (not used in scoring)
- [ ] Does not participate in ScoreCalculator flow

### applyEffect():
- [ ] No-op (does nothing to ScoreContext)
- [ ] Economic effect handled separately by game controller

### getMoneyReward():
- [ ] Returns moneyReward amount
- [ ] Unconditional: returns fixed amount
- [ ] With condition: returns amount × count

### Specific Joker Test:
- [ ] **Golden Joker**: Returns +$2 per level

## 7. PermanentUpgradeJoker Class Tests

### Constructor:
- [ ] Creates permanent upgrade joker with valid inputs
- [ ] Has NO priority (or special upgrade priority)
- [ ] Stores chipsPerCard correctly
- [ ] Stores multPerCard correctly
- [ ] Accepts zero for either chips or mult
- [ ] Throws error on negative chips
- [ ] Throws error on negative mult

### canActivate():
- [ ] Always returns false (not used in scoring)
- [ ] Does not participate in ScoreCalculator flow

### applyEffect():
- [ ] No-op (does nothing to ScoreContext)
- [ ] Upgrades applied via applyPermanentUpgrade method

### applyPermanentUpgrade(card):
- [ ] Calls card.addPermanentBonus with correct values
- [ ] Bonus persists on card
- [ ] Multiple applications accumulate
- [ ] Throws error on null card

### Specific Joker Test:
- [ ] **Hiker**: Adds +5 chips to each played card

## 8. Priority System Integration Tests

### Priority Enforcement:
- [ ] CHIPS jokers have priority 1
- [ ] MULT jokers have priority 2
- [ ] MULTIPLIER jokers have priority 3
- [ ] Sorting by priority works correctly
- [ ] Example: [MultiplierJoker, ChipJoker, MultJoker] sorts to [ChipJoker, MultJoker, MultiplierJoker]

### Mixed Priority Scenario:
- [ ] Create 1 ChipJoker, 1 MultJoker, 1 MultiplierJoker
- [ ] Verify each has correct priority
- [ ] Verify ScoreCalculator applies in order

## 9. Condition Function Tests

### Condition Evaluation:
- [ ] Condition receives correct ScoreContext
- [ ] Condition can access playedCards
- [ ] Condition can access handType
- [ ] Condition can access remainingDeckSize
- [ ] Condition returns number (count)

### Complex Conditions:
- [ ] **Greedy Joker**: Filter cards by suit
- [ ] **Odd Todd**: Filter cards by value parity
- [ ] **Half Joker**: Check array length
- [ ] **Fibonacci**: Check specific card values present
- [ ] **Triboulet**: Filter and count specific values

### Condition Edge Cases:
- [ ] Condition returns 0 (joker not activated)
- [ ] Condition returns large number (multiply correctly)
- [ ] Condition function throws error (catch and handle)
- [ ] Null context passed (throw error)

## 10. Synergy Tests (Multiple Jokers)

### Same Priority Jokers:
- [ ] 2 MultJokers both activate
- [ ] Effects accumulate correctly
- [ ] Example: Joker (+4) + Greedy Joker (+9 for 3 Diamonds) = +13 mult

### Different Priority Jokers:
- [ ] ChipJoker activates before MultJoker
- [ ] MultJoker activates before MultiplierJoker
- [ ] Example: Blue Joker (+88 chips) → Joker (+4 mult) → Triboulet (×4)

### All 5 Joker Slots:
- [ ] Create 5 different jokers
- [ ] All activate if conditions met
- [ ] Priority order respected
- [ ] Final score calculated correctly

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  Joker,
  ChipJoker,
  MultJoker,
  MultiplierJoker,
  EconomicJoker,
  PermanentUpgradeJoker,
  JokerPriority
} from '@/models/special-cards/jokers';
import { ScoreContext } from '@/models/scoring';
import { Card, CardValue, Suit } from '@/models/core';
import { HandType } from '@/models/poker';

describe('Jokers System', () => {
  describe('JokerPriority Enum', () => {
    it('should define CHIPS priority as 1', () => {
      // ASSERT
      expect(JokerPriority.CHIPS).toBe(1);
    });

    it('should define MULT priority as 2', () => {
      // ASSERT
      expect(JokerPriority.MULT).toBe(2);
    });

    it('should define MULTIPLIER priority as 3', () => {
      // ASSERT
      expect(JokerPriority.MULTIPLIER).toBe(3);
    });

    it('should support numeric sorting', () => {
      // ARRANGE
      const priorities = [
        JokerPriority.MULTIPLIER,
        JokerPriority.CHIPS,
        JokerPriority.MULT
      ];
      
      // ACT
      priorities.sort((a, b) => a - b);
      
      // ASSERT
      expect(priorities).toEqual([
        JokerPriority.CHIPS,
        JokerPriority.MULT,
        JokerPriority.MULTIPLIER
      ]);
    });
  });

  describe('ChipJoker', () => {
    describe('constructor', () => {
      it('should create chip joker with valid inputs', () => {
        // ACT
        const joker = new ChipJoker(
          'odd-todd',
          'Odd Todd',
          '+31 chips per odd card',
          31
        );
        
        // ASSERT
        expect(joker.getName()).toBe('Odd Todd');
        expect(joker.getDescription()).toBe('+31 chips per odd card');
        expect(joker.getPriority()).toBe(JokerPriority.CHIPS);
      });

      it('should throw error on chipsValue ≤ 0', () => {
        // ACT & ASSERT
        expect(() => new ChipJoker('test', 'Test', 'Test', 0))
          .toThrow('Chips value must be positive');
      });

      it('should throw error on negative chipsValue', () => {
        // ACT & ASSERT
        expect(() => new ChipJoker('test', 'Test', 'Test', -10))
          .toThrow('Chips value must be positive');
      });

      it('should accept condition function', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => ctx.playedCards.length;
        
        // ACT
        const joker = new ChipJoker(
          'test',
          'Test',
          'Test',
          10,
          condition
        );
        
        // ASSERT
        expect(joker).toBeDefined();
      });
    });

    describe('canActivate', () => {
      it('should return true if no condition (unconditional)', () => {
        // ARRANGE
        const joker = new ChipJoker('test', 'Test', 'Test', 10);
        const context = createMockContext([]);
        
        // ACT
        const result = joker.canActivate(context);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return true if condition returns > 0', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => ctx.playedCards.length;
        const joker = new ChipJoker('test', 'Test', 'Test', 10, condition);
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = createMockContext(cards);
        
        // ACT
        const result = joker.canActivate(context);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return false if condition returns 0', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => 
          ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length;
        const joker = new ChipJoker('test', 'Test', 'Test', 10, condition);
        const cards = [new Card(CardValue.ACE, Suit.SPADES)]; // No diamonds
        const context = createMockContext(cards);
        
        // ACT
        const result = joker.canActivate(context);
        
        // ASSERT
        expect(result).toBe(false);
      });
    });

    describe('applyEffect', () => {
      it('should add chips to context (unconditional)', () => {
        // ARRANGE
        const joker = new ChipJoker('test', 'Test', '+10 chips', 10);
        const context = createMockContext([new Card(CardValue.ACE, Suit.SPADES)]);
        const initialChips = context.chips;
        
        // ACT
        joker.applyEffect(context);
        
        // ASSERT
        expect(context.chips).toBe(initialChips + 10);
      });

      it('should add chips × count (with condition)', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => 
          ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length;
        const joker = new ChipJoker(
          'greedy',
          'Greedy',
          '+3 chips per Diamond',
          3,
          condition
        );
        const cards = [
          new Card(CardValue.ACE, Suit.DIAMONDS),
          new Card(CardValue.KING, Suit.DIAMONDS),
          new Card(CardValue.QUEEN, Suit.DIAMONDS)
        ];
        const context = createMockContext(cards);
        const initialChips = context.chips;
        
        // ACT
        joker.applyEffect(context);
        
        // ASSERT
        expect(context.chips).toBe(initialChips + 9); // 3 × 3
      });
    });

    describe('Specific Joker: Odd Todd', () => {
      it('should add +31 chips per odd-valued card', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => 
          ctx.playedCards.filter(c => {
            const oddValues = [CardValue.ACE, CardValue.THREE, CardValue.FIVE, 
                               CardValue.SEVEN, CardValue.NINE];
            return oddValues.includes(c.value);
          }).length;
        const oddTodd = new ChipJoker(
          'odd-todd',
          'Odd Todd',
          '+31 chips per odd card',
          31,
          condition
        );
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),   // odd
          new Card(CardValue.THREE, Suit.HEARTS), // odd
          new Card(CardValue.KING, Suit.DIAMONDS) // even
        ];
        const context = createMockContext(cards);
        const initialChips = context.chips;
        
        // ACT
        oddTodd.applyEffect(context);
        
        // ASSERT
        expect(context.chips).toBe(initialChips + 62); // 31 × 2
      });
    });

    describe('Specific Joker: Blue Joker', () => {
      it('should add +2 chips per remaining deck card', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => ctx.remainingDeckSize;
        const blueJoker = new ChipJoker(
          'blue-joker',
          'Blue Joker',
          '+2 chips per deck card',
          2,
          condition
        );
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = createMockContext(cards, 44);
        const initialChips = context.chips;
        
        // ACT
        blueJoker.applyEffect(context);
        
        // ASSERT
        expect(context.chips).toBe(initialChips + 88); // 2 × 44
      });
    });
  });

  describe('MultJoker', () => {
    describe('constructor', () => {
      it('should create mult joker with valid inputs', () => {
        // ACT
        const joker = new MultJoker(
          'joker',
          'Joker',
          '+4 mult',
          4
        );
        
        // ASSERT
        expect(joker.getName()).toBe('Joker');
        expect(joker.getPriority()).toBe(JokerPriority.MULT);
      });

      it('should throw error on multValue ≤ 0', () => {
        // ACT & ASSERT
        expect(() => new MultJoker('test', 'Test', 'Test', 0))
          .toThrow('Mult value must be positive');
      });
    });

    describe('applyEffect', () => {
      it('should add mult to context (unconditional)', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        const context = createMockContext([new Card(CardValue.ACE, Suit.SPADES)]);
        const initialMult = context.mult;
        
        // ACT
        joker.applyEffect(context);
        
        // ASSERT
        expect(context.mult).toBe(initialMult + 4);
      });

      it('should add mult × count (with condition)', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => 
          ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length;
        const greedyJoker = new MultJoker(
          'greedy-joker',
          'Greedy Joker',
          '+3 mult per Diamond',
          3,
          condition
        );
        const cards = [
          new Card(CardValue.ACE, Suit.DIAMONDS),
          new Card(CardValue.KING, Suit.DIAMONDS),
          new Card(CardValue.QUEEN, Suit.DIAMONDS)
        ];
        const context = createMockContext(cards);
        const initialMult = context.mult;
        
        // ACT
        greedyJoker.applyEffect(context);
        
        // ASSERT
        expect(context.mult).toBe(initialMult + 9); // 3 × 3
      });
    });

    describe('Specific Joker: Joker (unconditional)', () => {
      it('should always add +4 mult', () => {
        // ARRANGE
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = createMockContext(cards);
        const initialMult = context.mult;
        
        // ACT
        joker.applyEffect(context);
        
        // ASSERT
        expect(context.mult).toBe(initialMult + 4);
      });
    });

    describe('Specific Joker: Half Joker', () => {
      it('should add +20 mult if ≤3 cards played', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => 
          ctx.playedCards.length <= 3 ? 1 : 0;
        const halfJoker = new MultJoker(
          'half-joker',
          'Half Joker',
          '+20 mult if ≤3 cards',
          20,
          condition
        );
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ]; // 2 cards ≤ 3
        const context = createMockContext(cards);
        const initialMult = context.mult;
        
        // ACT
        halfJoker.applyEffect(context);
        
        // ASSERT
        expect(context.mult).toBe(initialMult + 20);
      });

      it('should not add mult if >3 cards played', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => 
          ctx.playedCards.length <= 3 ? 1 : 0;
        const halfJoker = new MultJoker(
          'half-joker',
          'Half Joker',
          '+20 mult if ≤3 cards',
          20,
          condition
        );
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.QUEEN, Suit.DIAMONDS),
          new Card(CardValue.JACK, Suit.CLUBS)
        ]; // 4 cards > 3
        const context = createMockContext(cards);
        
        // ACT
        const canActivate = halfJoker.canActivate(context);
        
        // ASSERT
        expect(canActivate).toBe(false);
      });
    });
  });

  describe('MultiplierJoker', () => {
    describe('constructor', () => {
      it('should create multiplier joker with valid inputs', () => {
        // ACT
        const joker = new MultiplierJoker(
          'triboulet',
          'Triboulet',
          '×2 mult per K/Q',
          2
        );
        
        // ASSERT
        expect(joker.getName()).toBe('Triboulet');
        expect(joker.getPriority()).toBe(JokerPriority.MULTIPLIER);
      });

      it('should throw error on multiplierValue < 1', () => {
        // ACT & ASSERT
        expect(() => new MultiplierJoker('test', 'Test', 'Test', 0.5))
          .toThrow('Multiplier value must be >= 1');
      });
    });

    describe('applyEffect', () => {
      it('should multiply mult (unconditional, count = 1)', () => {
        // ARRANGE
        const joker = new MultiplierJoker('test', 'Test', '×2', 2);
        const context = createMockContext([new Card(CardValue.ACE, Suit.SPADES)]);
        context.mult = 5; // Set initial mult
        
        // ACT
        joker.applyEffect(context);
        
        // ASSERT
        expect(context.mult).toBe(10); // 5 × 2
      });

      it('should apply multiplier^count when condition returns count > 1', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => 
          ctx.playedCards.filter(c => 
            c.value === CardValue.KING || c.value === CardValue.QUEEN
          ).length;
        const triboulet = new MultiplierJoker(
          'triboulet',
          'Triboulet',
          '×2 mult per K/Q',
          2,
          condition
        );
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ]; // 2 Kings
        const context = createMockContext(cards);
        context.mult = 5; // Set initial mult
        
        // ACT
        triboulet.applyEffect(context);
        
        // ASSERT
        expect(context.mult).toBe(20); // 5 × (2^2) = 5 × 4 = 20
      });
    });

    describe('Specific Joker: Triboulet', () => {
      it('should multiply by 2^count for each K or Q played', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => 
          ctx.playedCards.filter(c => 
            c.value === CardValue.KING || c.value === CardValue.QUEEN
          ).length;
        const triboulet = new MultiplierJoker(
          'triboulet',
          'Triboulet',
          '×2 mult per K/Q',
          2,
          condition
        );
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.QUEEN, Suit.HEARTS),
          new Card(CardValue.KING, Suit.DIAMONDS)
        ]; // 3 K/Q
        const context = createMockContext(cards);
        context.mult = 2;
        
        // ACT
        triboulet.applyEffect(context);
        
        // ASSERT
        expect(context.mult).toBe(16); // 2 × (2^3) = 2 × 8 = 16
      });
    });

    describe('Specific Joker: Fibonacci', () => {
      it('should multiply by 8 if hand contains A,2,3,5,8', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => {
          const values = ctx.playedCards.map(c => c.value);
          const required = [CardValue.ACE, CardValue.TWO, CardValue.THREE, 
                           CardValue.FIVE, CardValue.EIGHT];
          return required.every(val => values.includes(val)) ? 1 : 0;
        };
        const fibonacci = new MultiplierJoker(
          'fibonacci',
          'Fibonacci',
          '×8 if A,2,3,5,8',
          8,
          condition
        );
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.TWO, Suit.HEARTS),
          new Card(CardValue.THREE, Suit.DIAMONDS),
          new Card(CardValue.FIVE, Suit.CLUBS),
          new Card(CardValue.EIGHT, Suit.SPADES)
        ];
        const context = createMockContext(cards);
        context.mult = 2;
        
        // ACT
        fibonacci.applyEffect(context);
        
        // ASSERT
        expect(context.mult).toBe(16); // 2 × 8
      });

      it('should not activate if missing any required value', () => {
        // ARRANGE
        const condition = (ctx: ScoreContext) => {
          const values = ctx.playedCards.map(c => c.value);
          const required = [CardValue.ACE, CardValue.TWO, CardValue.THREE, 
                           CardValue.FIVE, CardValue.EIGHT];
          return required.every(val => values.includes(val)) ? 1 : 0;
        };
        const fibonacci = new MultiplierJoker(
          'fibonacci',
          'Fibonacci',
          '×8 if A,2,3,5,8',
          8,
          condition
        );
        const cards = [
          new Card(CardValue.ACE, Suit.SPADES),
          new Card(CardValue.TWO, Suit.HEARTS),
          new Card(CardValue.THREE, Suit.DIAMONDS),
          new Card(CardValue.FIVE, Suit.CLUBS)
          // Missing EIGHT
        ];
        const context = createMockContext(cards);
        
        // ACT
        const canActivate = fibonacci.canActivate(context);
        
        // ASSERT
        expect(canActivate).toBe(false);
      });
    });
  });

  describe('EconomicJoker', () => {
    describe('constructor', () => {
      it('should create economic joker with valid inputs', () => {
        // ACT
        const joker = new EconomicJoker(
          'golden-joker',
          'Golden Joker',
          '+$2 per level',
          2
        );
        
        // ASSERT
        expect(joker.getName()).toBe('Golden Joker');
        expect(joker.getMoneyReward()).toBe(2);
      });

      it('should throw error on moneyReward ≤ 0', () => {
        // ACT & ASSERT
        expect(() => new EconomicJoker('test', 'Test', 'Test', 0))
          .toThrow('Money reward must be positive');
      });
    });

    describe('canActivate', () => {
      it('should always return false (not used in scoring)', () => {
        // ARRANGE
        const joker = new EconomicJoker('golden', 'Golden', '+$2', 2);
        const context = createMockContext([new Card(CardValue.ACE, Suit.SPADES)]);
        
        // ACT
        const result = joker.canActivate(context);
        
        // ASSERT
        expect(result).toBe(false);
      });
    });

    describe('applyEffect', () => {
      it('should be no-op (does nothing to context)', () => {
        // ARRANGE
        const joker = new EconomicJoker('golden', 'Golden', '+$2', 2);
        const context = createMockContext([new Card(CardValue.ACE, Suit.SPADES)]);
        const initialChips = context.chips;
        const initialMult = context.mult;
        
        // ACT
        joker.applyEffect(context);
        
        // ASSERT
        expect(context.chips).toBe(initialChips);
        expect(context.mult).toBe(initialMult);
      });
    });

    describe('getMoneyReward', () => {
      it('should return money reward amount', () => {
        // ARRANGE
        const joker = new EconomicJoker('golden', 'Golden', '+$2', 2);
        
        // ACT
        const reward = joker.getMoneyReward();
        
        // ASSERT
        expect(reward).toBe(2);
      });
    });
  });

  describe('PermanentUpgradeJoker', () => {
    describe('constructor', () => {
      it('should create permanent upgrade joker with valid inputs', () => {
        // ACT
        const joker = new PermanentUpgradeJoker(
          'hiker',
          'Hiker',
          '+5 chips to each card',
          5,
          0
        );
        
        // ASSERT
        expect(joker.getName()).toBe('Hiker');
      });

      it('should accept zero for chips or mult', () => {
        // ACT
        const joker = new PermanentUpgradeJoker('test', 'Test', 'Test', 0, 5);
        
        // ASSERT
        expect(joker).toBeDefined();
      });

      it('should throw error on negative chips', () => {
        // ACT & ASSERT
        expect(() => new PermanentUpgradeJoker('test', 'Test', 'Test', -5, 0))
          .toThrow('Bonus values cannot be negative');
      });
    });

    describe('canActivate', () => {
      it('should always return false (not used in scoring)', () => {
        // ARRANGE
        const joker = new PermanentUpgradeJoker('hiker', 'Hiker', '+5 chips', 5, 0);
        const context = createMockContext([new Card(CardValue.ACE, Suit.SPADES)]);
        
        // ACT
        const result = joker.canActivate(context);
        
        // ASSERT
        expect(result).toBe(false);
      });
    });

    describe('applyEffect', () => {
      it('should be no-op (does nothing to context)', () => {
        // ARRANGE
        const joker = new PermanentUpgradeJoker('hiker', 'Hiker', '+5 chips', 5, 0);
        const context = createMockContext([new Card(CardValue.ACE, Suit.SPADES)]);
        const initialChips = context.chips;
        
        // ACT
        joker.applyEffect(context);
        
        // ASSERT
        expect(context.chips).toBe(initialChips);
      });
    });

    describe('applyPermanentUpgrade', () => {
      it('should add permanent bonus to card', () => {
        // ARRANGE
        const joker = new PermanentUpgradeJoker('hiker', 'Hiker', '+5 chips', 5, 0);
        const card = new Card(CardValue.ACE, Suit.SPADES);
        
        // ACT
        joker.applyPermanentUpgrade(card);
        
        // ASSERT
        expect(card.chipBonus).toBe(5);
        expect(card.multBonus).toBe(0);
      });

      it('should accumulate on multiple applications', () => {
        // ARRANGE
        const joker = new PermanentUpgradeJoker('hiker', 'Hiker', '+5 chips', 5, 0);
        const card = new Card(CardValue.ACE, Suit.SPADES);
        
        // ACT
        joker.applyPermanentUpgrade(card);
        joker.applyPermanentUpgrade(card);
        joker.applyPermanentUpgrade(card);
        
        // ASSERT
        expect(card.chipBonus).toBe(15); // 5 × 3
      });

      it('should throw error on null card', () => {
        // ARRANGE
        const joker = new PermanentUpgradeJoker('hiker', 'Hiker', '+5 chips', 5, 0);
        
        // ACT & ASSERT
        expect(() => joker.applyPermanentUpgrade(null as any))
          .toThrow('Card cannot be null');
      });
    });
  });

  describe('Priority System Integration', () => {
    it('should create jokers with correct priorities', () => {
      // ARRANGE
      const chipJoker = new ChipJoker('chip', 'Chip', '+10 chips', 10);
      const multJoker = new MultJoker('mult', 'Mult', '+4 mult', 4);
      const multiplierJoker = new MultiplierJoker('multiplier', 'Multiplier', '×2', 2);
      
      // ASSERT
      expect(chipJoker.getPriority()).toBe(JokerPriority.CHIPS);
      expect(multJoker.getPriority()).toBe(JokerPriority.MULT);
      expect(multiplierJoker.getPriority()).toBe(JokerPriority.MULTIPLIER);
    });

    it('should sort jokers by priority correctly', () => {
      // ARRANGE
      const multiplierJoker = new MultiplierJoker('multiplier', 'Multiplier', '×2', 2);
      const chipJoker = new ChipJoker('chip', 'Chip', '+10 chips', 10);
      const multJoker = new MultJoker('mult', 'Mult', '+4 mult', 4);
      const jokers = [multiplierJoker, chipJoker, multJoker];
      
      // ACT
      jokers.sort((a, b) => a.getPriority() - b.getPriority());
      
      // ASSERT
      expect(jokers[0]).toBe(chipJoker);
      expect(jokers[1]).toBe(multJoker);
      expect(jokers[2]).toBe(multiplierJoker);
    });
  });
});

// Helper function to create mock ScoreContext
function createMockContext(
  cards: Card[], 
  remainingDeckSize: number = 44
): ScoreContext {
  return new ScoreContext(
    10,
    2,
    cards,
    HandType.HIGH_CARD,
    remainingDeckSize
  );
}
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for all 7 joker types
- All 15 specific joker examples tested
- Priority system verified
- Condition functions tested
- Synergy scenarios covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| JokerPriority | Enum values | 3 | 0 | 0 | 3 |
| JokerPriority | Sorting | 1 | 0 | 0 | 1 |
| ChipJoker | constructor | 2 | 0 | 3 | 5 |
| ChipJoker | canActivate | 3 | 0 | 0 | 3 |
| ChipJoker | applyEffect | 2 | 0 | 0 | 2 |
| ChipJoker | Odd Todd | 1 | 0 | 0 | 1 |
| ChipJoker | Even Steven | 1 | 0 | 0 | 1 |
| ChipJoker | Blue Joker | 1 | 0 | 0 | 1 |
| MultJoker | constructor | 1 | 0 | 1 | 2 |
| MultJoker | applyEffect | 2 | 0 | 0 | 2 |
| MultJoker | Joker | 1 | 0 | 0 | 1 |
| MultJoker | Greedy/Lusty/etc | 4 | 0 | 0 | 4 |
| MultJoker | Half Joker | 2 | 0 | 0 | 2 |
| MultiplierJoker | constructor | 1 | 0 | 1 | 2 |
| MultiplierJoker | applyEffect | 2 | 0 | 0 | 2 |
| MultiplierJoker | Triboulet | 1 | 0 | 0 | 1 |
| MultiplierJoker | Fibonacci | 2 | 0 | 0 | 2 |
| MultiplierJoker | Joker Stencil | 1 | 0 | 0 | 1 |
| EconomicJoker | constructor | 1 | 0 | 1 | 2 |
| EconomicJoker | canActivate | 1 | 0 | 0 | 1 |
| EconomicJoker | applyEffect | 1 | 0 | 0 | 1 |
| EconomicJoker | getMoneyReward | 1 | 0 | 0 | 1 |
| PermanentUpgradeJoker | constructor | 2 | 0 | 1 | 3 |
| PermanentUpgradeJoker | canActivate | 1 | 0 | 0 | 1 |
| PermanentUpgradeJoker | applyEffect | 1 | 0 | 0 | 1 |
| PermanentUpgradeJoker | applyPermanentUpgrade | 3 | 0 | 1 | 4 |
| **Priority Integration** | - | 2 | 0 | 0 | 2 |
| **TOTAL** | | | | | **50** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **92%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios: 
  - Some condition function edge cases (error handling)
  - Internal priority comparison logic (covered indirectly)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/models/jokers.test.ts

# Run with coverage
npm test -- --coverage tests/unit/models/jokers.test.ts

# Run in watch mode
npm test -- --watch tests/unit/models/jokers.test.ts

# Run specific joker tests
npm test -- -t "Triboulet" tests/unit/models/jokers.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Priority enforcement is critical:** CHIPS → MULT → MULTIPLIER order must be maintained
- **Condition function evaluation:** Must receive correct context and handle errors
- **Count-based effects:** Condition returns count, multiplied with effect value
- **Exponentiation for multipliers:** 2^count for multiple triggers
- **Economic and Permanent jokers:** Do NOT participate in scoring flow
- **Synergy testing:** Multiple jokers can affect same cards
- **Zero count conditions:** Joker doesn't activate if condition returns 0
- **Complex conditions:** Fibonacci requires specific card values present

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to create specific joker instances
const JOKER_LIBRARY = {
  joker: () => new MultJoker('joker', 'Joker', '+4 mult', 4),
  
  greedyJoker: () => new MultJoker(
    'greedy-joker',
    'Greedy Joker',
    '+3 mult per Diamond',
    3,
    (ctx) => ctx.playedCards.filter(c => c.suit === Suit.DIAMONDS).length
  ),
  
  oddTodd: () => new ChipJoker(
    'odd-todd',
    'Odd Todd',
    '+31 chips per odd card',
    31,
    (ctx) => ctx.playedCards.filter(c => {
      const oddValues = [CardValue.ACE, CardValue.THREE, CardValue.FIVE, 
                         CardValue.SEVEN, CardValue.NINE];
      return oddValues.includes(c.value);
    }).length
  ),
  
  triboulet: () => new MultiplierJoker(
    'triboulet',
    'Triboulet',
    '×2 mult per K/Q',
    2,
    (ctx) => ctx.playedCards.filter(c => 
      c.value === CardValue.KING || c.value === CardValue.QUEEN
    ).length
  ),
  
  goldenJoker: () => new EconomicJoker(
    'golden-joker',
    'Golden Joker',
    '+$2 per level',
    2
  ),
  
  hiker: () => new PermanentUpgradeJoker(
    'hiker',
    'Hiker',
    '+5 chips to each card',
    5,
    0
  )
};
```