# TESTING CONTEXT
Project: Mini Balatro
Components under test: ScoreCalculator, ScoreContext, ScoreResult, ScoreBreakdown
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/models/scoring/score-context.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/scoring/score-context.ts
 * @desc Intermediate state during score calculation.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Card } from '../core/card';
import { HandType } from '../poker/hand-type.enum';

/**
 * Holds intermediate state during score calculation.
 * Tracks accumulating chips and mult as effects are applied.
 */
export class ScoreContext {
  /**
   * Creates a score context with initial values.
   * @param chips - Initial chip value
   * @param mult - Initial mult value
   * @param playedCards - Cards that contribute to scoring (not all played cards)
   * @param handType - Detected poker hand type
   * @param remainingDeckSize - Cards remaining in deck
   * @param emptyJokerSlots - Number of empty joker slots (5 - active jokers)
   * @param discardsRemaining - Number of discards remaining this round
   * @throws Error if chips or mult negative, or playedCards empty
   */
  constructor(
    public chips: number,
    public mult: number,
    public readonly playedCards: Card[],
    public readonly handType: HandType,
    public readonly remainingDeckSize: number,
    public readonly emptyJokerSlots: number,
    public readonly discardsRemaining: number,
  ) {
    if (chips < 0 || mult < 0) {
      throw new Error('Chips and mult must be non-negative');
    }
    if (!playedCards || playedCards.length === 0) {
      throw new Error('Played cards array cannot be empty');
    }
    if (remainingDeckSize < 0) {
      throw new Error('Remaining deck size cannot be negative');
    }
    if (emptyJokerSlots < 0 || emptyJokerSlots > 5) {
      throw new Error('Empty joker slots must be between 0 and 5');
    }
    if (discardsRemaining < 0) {
      throw new Error('Discards remaining cannot be negative');
    }
  }

  /**
   * Adds chips to the current total.
   * @param amount - Amount to add
   * @throws Error if amount is negative
   */
  public addChips(amount: number): void {
    if (amount < 0) {
      throw new Error('Chip amount cannot be negative');
    }
    this.chips += amount;
  }

  /**
   * Adds mult to the current total.
   * @param amount - Amount to add
   * @throws Error if amount is negative
   */
  public addMult(amount: number): void {
    if (amount < 0) {
      throw new Error('Mult amount cannot be negative');
    }
    this.mult += amount;
  }

  /**
   * Multiplies current mult by a multiplier.
   * @param multiplier - Factor to multiply by
   * @throws Error if multiplier < 1
   */
  public multiplyMult(multiplier: number): void {
    if (multiplier < 1) {
      throw new Error('Multiplier must be at least 1');
    }
    this.mult *= multiplier;
  }
}
```

## File 2: src/models/scoring/score-breakdown.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/scoring/score-breakdown.ts
 * @desc Individual contribution to score calculation for tracing.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Records individual contribution to score calculation.
 * Enables detailed tracing and UI display of score sources.
 */
export class ScoreBreakdown {
  /**
   * Creates a breakdown entry for score tracing.
   * @param source - Name of the source
   * @param chipsAdded - Chips contributed by this source
   * @param multAdded - Mult contributed by this source
   * @param description - Human-readable description of effect
   * @throws Error if source or description is empty
   */
  constructor(
    public readonly source: string,
    public readonly chipsAdded: number,
    public readonly multAdded: number,
    public readonly description: string
  ) {
    if (!source || !description) {
      throw new Error('Source and description must not be empty');
    }
    if (chipsAdded < 0 || multAdded < 0) {
      throw new Error('Added values cannot be negative');
    }
  }
}
```

## File 3: src/models/scoring/score-result.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/scoring/score-result.ts
 * @desc Complete score calculation result with breakdown.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { ScoreBreakdown } from './score-breakdown';
import { HandType } from '../poker/hand-type.enum';

/**
 * Encapsulates complete score calculation result.
 * Contains final score, components, and detailed breakdown.
 */
export class ScoreResult {
  /**
   * Creates a score result with all calculation details.
   * @param totalScore - Final calculated score (chips × mult)
   * @param chips - Final total chips after all additions
   * @param mult - Final total mult after all additions and multiplications
   * @param breakdown - Detailed list of all score contributions
   * @param handType - The type of poker hand played
   * @throws Error if any numeric value is negative
   */
  constructor(
    public readonly totalScore: number,
    public readonly chips: number,
    public readonly mult: number,
    public readonly breakdown: ScoreBreakdown[],
    public readonly handType?: HandType
  ) {
    if (totalScore < 0 || chips < 0 || mult < 0) {
      throw new Error('Score values cannot be negative');
    }
    if (!breakdown) {
      throw new Error('Breakdown array cannot be null');
    }
  }

  /**
   * Adds a breakdown entry to the result.
   * @param breakdown - Breakdown entry to add
   * @throws Error if breakdown is null
   */
  public addBreakdown(breakdown: ScoreBreakdown): void {
    if (!breakdown) {
      throw new Error('Breakdown cannot be null');
    }
    this.breakdown.push(breakdown);
  }
}
```

## File 4: src/models/scoring/score-calculator.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/scoring/score-calculator.ts
 * @desc Orchestrates score calculation with strict ordering.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Card } from '../core/card';
import { HandEvaluator } from '../poker/hand-evaluator';
import { HandUpgradeManager } from '../poker/hand-upgrade-manager';
import { HandResult } from '../poker/hand-result';
import { Joker } from '../special-cards/jokers/joker';
import { JokerPriority } from '../special-cards/jokers/joker-priority.enum';
import { ScoreContext } from './score-context';
import { ScoreResult } from './score-result';
import { ScoreBreakdown } from './score-breakdown';
import { BlindModifier } from '../blinds/blind-modifier';

/**
 * Orchestrates score calculation with strict ordering.
 * Enforces: base values → card bonuses → joker effects (by priority) → final calculation.
 */
export class ScoreCalculator {
  /**
   * Creates a score calculator with required dependencies.
   * @param evaluator - Hand evaluator for determining hand type
   * @param upgradeManager - Manager for hand upgrade values
   * @throws Error if either parameter is null
   */
  constructor(
    private readonly evaluator: HandEvaluator,
    private readonly upgradeManager: HandUpgradeManager
  ) {
    if (!evaluator || !upgradeManager) {
      throw new Error('Evaluator and upgrade manager cannot be null');
    }
  }

  /**
   * Calculates complete score following strict order, returns detailed result.
   * @param cards - Cards played in this hand (1-5)
   * @param jokers - Active jokers to apply
   * @param remainingDeckSize - Cards remaining in deck
   * @param blindModifier - Optional blind modifier (boss effects)
   * @param discardsRemaining - Number of discards remaining this round
   * @param totalJokerCount - Total number of ALL jokers (including economic ones) for empty slot calculation
   * @returns ScoreResult with totalScore = chips × mult
   * @throws Error if cards empty or > 5, or remainingDeckSize negative
   */
  public calculateScore(
    cards: Card[],
    jokers: Joker[],
    remainingDeckSize: number,
    blindModifier?: BlindModifier,
    discardsRemaining: number = 0,
    totalJokerCount?: number
  ): ScoreResult {
    if (!cards || cards.length === 0 || cards.length > 5) {
      throw new Error('Cards array must contain between 1 and 5 cards');
    }
    if (remainingDeckSize < 0) {
      throw new Error('Remaining deck size cannot be negative');
    }

    console.log('Starting score calculation...');

    // Step 1: Evaluate hand type and get base values
    const handResult = this.evaluator.evaluateHand(cards, this.upgradeManager);
    
    // Check if this hand type is allowed by blind modifier (e.g., The Mouth boss)
    if (blindModifier && blindModifier.allowedHandTypes && blindModifier.allowedHandTypes.length > 0) {
      if (!blindModifier.allowedHandTypes.includes(handResult.handType)) {
        console.log(`Hand type ${handResult.handType} is not allowed! Only ${blindModifier.allowedHandTypes.join(', ')} allowed. Returning 0 score.`);
        // Return a result with 0 score and a special warning breakdown
        const warningBreakdown = new ScoreBreakdown(
          'Hand Not Allowed',
          0,
          0,
          `Only ${blindModifier.allowedHandTypes.join(', ')} hands count for score!`
        );
        return new ScoreResult(0, 0, 0, [warningBreakdown], handResult.handType);
      }
    }
    
    // Calculate empty joker slots (5 max slots - active jokers)
    // Use totalJokerCount if provided (to account for economic jokers that don't score)
    // Otherwise use the length of scoring jokers passed in
    const activeJokerCount = totalJokerCount !== undefined ? totalJokerCount : jokers.length;
    const emptyJokerSlots = Math.max(0, 5 - activeJokerCount);
    
    const context = this.applyBaseValues(
      handResult, 
      blindModifier, 
      emptyJokerSlots, 
      discardsRemaining,
      remainingDeckSize
    );

    // Create breakdown entries for base values (we keep breakdown separate from ScoreContext)
    const breakdown: ScoreBreakdown[] = [
      new ScoreBreakdown(
        'Base Hand',
        handResult.baseChips,
        handResult.baseMult,
        `${handResult.handType} base values`
      )
    ];

    // Step 2: Apply individual card bonuses (only for scoring cards)
    this.applyCardBonuses(context, handResult.scoringCards, breakdown);

    // Step 3: Apply joker effects by priority
    this.applyJokerEffects(context, jokers, breakdown);

    // Step 4: Calculate final score
    const totalScore = this.calculateFinalScore(context);

    const result = new ScoreResult(totalScore, context.chips, context.mult, breakdown, handResult.handType);

    console.log(`Score calculation complete: ${totalScore} = ${context.chips} × ${context.mult}`);
    return result;
  }

  /**
   * Creates initial context with base chips and mult from hand type.
   * @param handResult - Hand evaluation result
   * @param blindModifier - Optional blind modifier
   * @param emptyJokerSlots - Number of empty joker slots
   * @param discardsRemaining - Number of discards remaining
   * @param remainingDeckSize - Cards remaining in deck
   * @returns ScoreContext with base values
   */
  private applyBaseValues(
    handResult: HandResult,
    blindModifier?: BlindModifier,
    emptyJokerSlots: number = 0,
    discardsRemaining: number = 0,
    remainingDeckSize: number = 0
  ): ScoreContext {
    let baseChips = handResult.baseChips;
    let baseMult = handResult.baseMult;

    // Apply blind modifier if present
    if (blindModifier) {
      if (blindModifier.chipsDivisor) {
        baseChips = Math.floor(baseChips / blindModifier.chipsDivisor);
      }
      if (blindModifier.multDivisor) {
        baseMult = Math.floor(baseMult / blindModifier.multDivisor);
        // Ensure base mult never goes below 1 (prevents unplayable hands like High Card becoming 2x0)
        baseMult = Math.max(1, baseMult);
      }
    }

    const context = new ScoreContext(
      baseChips,
      baseMult,
      handResult.scoringCards,  // Only cards that contribute to score
      handResult.handType,
      remainingDeckSize, // Use actual remaining deck size
      emptyJokerSlots,
      discardsRemaining
    );

    console.log(`Base values: ${baseChips} chips, ${baseMult} mult (${handResult.handType})`);
    return context;
  }

  /**
   * Applies individual card chips and per-card tarot bonuses.
   * @param context - Current score context
   * @param cards - Played cards
   * @param breakdown - Score breakdown array to append entries to
   */
  private applyCardBonuses(
    context: ScoreContext,
    cards: Card[],
    breakdown: ScoreBreakdown[]
  ): void {
    console.log('Applying card bonuses...');

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardDisplay = card.getDisplayString();

      // Add card's base chips
      const cardChips = card.getBaseChips();
      context.addChips(cardChips);
      breakdown.push(
        new ScoreBreakdown(
          cardDisplay,
          cardChips,
          0,
          `Base chips from ${cardDisplay}`
        )
      );

      // Add card's mult bonus (from tarot effects)
      if (card.getMultBonus() > 0) {
        context.addMult(card.getMultBonus());
        breakdown.push(
          new ScoreBreakdown(
            cardDisplay,
            0,
            card.getMultBonus(),
            `Mult bonus from ${cardDisplay}`
          )
        );
      }
    }

    console.log(`After card bonuses: ${context.chips} chips, ${context.mult} mult`);
  }

  /**
   * Applies persistent joker effects in strict priority order.
   * @param context - Current score context
   * @param jokers - Active jokers
   * @param breakdown - Score breakdown array to append entries to
   */
  private applyJokerEffects(context: ScoreContext, jokers: Joker[], breakdown: ScoreBreakdown[]): void {
    console.log('Applying joker effects by priority...');

    // Sort jokers by priority (CHIPS → MULT → MULTIPLIER)
    const sortedJokers = [...jokers].sort((a, b) => {
      return a.getPriority() - b.getPriority();
    });

    // Group jokers by priority
    const priorityGroups = {
      [JokerPriority.CHIPS]: [] as Joker[],
      [JokerPriority.MULT]: [] as Joker[],
      [JokerPriority.MULTIPLIER]: [] as Joker[]
    };

    for (const joker of sortedJokers) {
      priorityGroups[joker.getPriority()].push(joker);
    }

    // Apply effects in priority order
    this.applyPriorityGroup(context, priorityGroups[JokerPriority.CHIPS], 'chips', breakdown);
    this.applyPriorityGroup(context, priorityGroups[JokerPriority.MULT], 'mult', breakdown);
    this.applyPriorityGroup(context, priorityGroups[JokerPriority.MULTIPLIER], 'multiplier', breakdown);

    console.log(`After joker effects: ${context.chips} chips, ${context.mult} mult`);
  }

  /**
   * Applies a group of jokers with the same priority.
   * @param context - Current score context
   * @param jokers - Jokers to apply
   * @param priorityType - Type of priority (for logging)
   * @param breakdown - Score breakdown array to append entries to
   */
  private applyPriorityGroup(
    context: ScoreContext,
    jokers: Joker[],
    priorityType: string,
    breakdown: ScoreBreakdown[]
  ): void {
    for (const joker of jokers) {
      if (joker.canActivate(context)) {
        // Create a temporary context to capture the effect
        const beforeChips = context.chips;
        const beforeMult = context.mult;

        // Apply the joker's effect
        joker.applyEffect(context);

        // Record the breakdown
        const chipsAdded = context.chips - beforeChips;
        const multAdded = context.mult - beforeMult;

        breakdown.push(
          new ScoreBreakdown(
            joker.name,
            chipsAdded,
            multAdded,
            `${joker.name} (${priorityType} priority)`
          )
        );
      }
    }
  }

  /**
   * Computes final score as chips × mult.
   * @param context - Final score context
   * @returns Non-negative integer score
   */
  private calculateFinalScore(context: ScoreContext): number {
    const finalScore = Math.floor(context.chips * context.mult);
    console.log(`Final score: ${finalScore} = ${context.chips} × ${context.mult}`);
    return finalScore;
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

## ScoreContext Class Requirements:
- Properties: chips (number), mult (number), playedCards (Card[]), handType (HandType), remainingDeckSize (number)
- Constructor validates all properties
- addChips(amount) increases chips by amount
- addMult(amount) increases mult by amount
- multiplyMult(multiplier) multiplies mult by multiplier
- Validates non-negative values for chips and mult
- Throws error on negative amounts
- Validates multiplier >= 1

## ScoreBreakdown Class Requirements:
- Properties: source (string), chipsAdded (number), multAdded (number), description (string)
- Constructor validates all properties non-null
- Immutable after creation
- Allows zero for chipsAdded and multAdded
- Provides readable format for UI display

## ScoreResult Class Requirements:
- Properties: totalScore (number), chips (number), mult (number), breakdown (ScoreBreakdown[])
- Constructor validates non-negative values
- addBreakdown(breakdown) appends to breakdown array
- Validates breakdown not null
- totalScore must equal chips × mult
- breakdown array should be complete record of calculation

## ScoreCalculator Class Requirements:
- Dependencies: HandEvaluator, HandUpgradeManager
- Constructor validates dependencies not null
- calculateScore(cards, jokers, remainingDeckSize, blindModifier?) returns ScoreResult
- **Strict calculation order:**
  1. Base hand values (from HandEvaluator with upgrades)
  2. Individual card bonuses (left to right)
  3. Joker effects by priority (CHIPS → MULT → MULTIPLIER)
  4. Final calculation: score = chips × mult

**Step 1: Base Hand Values**
- Evaluate hand type using HandEvaluator
- Get upgraded base values from HandUpgradeManager
- Apply blind modifier if present (e.g., The Flint divides by 2)
- Create breakdown entry for base hand

**Step 2: Individual Card Bonuses**
- Iterate cards left to right
- Add card.getBaseChips() to chips
- Add card.multBonus to mult (if card has permanent bonuses)
- Create breakdown entry for each card with bonuses

**Step 3: Joker Effects (by priority)**
- Sort jokers by priority: CHIPS (1) → MULT (2) → MULTIPLIER (3)
- For each priority level:
  - Check if joker.canActivate(context)
  - If active: call joker.applyEffect(context)
  - Create breakdown entry for each activated joker
- Jokers modify context in place

**Step 4: Final Calculation**
- Calculate totalScore = context.chips × context.mult
- Return ScoreResult with totalScore, chips, mult, breakdown

## Blind Modifier Requirements:
- The Flint: Divides base chips and mult by 2
- Applied in Step 1 before any other calculations
- Optional parameter (null if no boss blind active)

## Edge Cases:
- No jokers (only base + cards)
- Only multiplier jokers (no additions first)
- Mult = 0 (results in 0 score)
- Empty jokers array
- Card with multiple bonuses (Emperor + Empress)
- Multiple jokers triggering on same card (synergy)
- Joker condition never met (not activated)
- Boss blind modifier applied correctly
- Negative values validation
- Null checks for all dependencies

# TASK

Generate a complete unit test suite for Scoring System that covers:

## 1. ScoreContext Class Tests

### Constructor:
- [ ] Creates context with valid inputs
- [ ] Stores all properties correctly
- [ ] Throws error on negative chips
- [ ] Throws error on negative mult
- [ ] Throws error on negative remainingDeckSize
- [ ] Throws error on empty playedCards
- [ ] Accepts zero as valid for chips and mult

### addChips():
- [ ] Increases chips by positive amount
- [ ] Handles zero addition (no change)
- [ ] Accumulates multiple additions
- [ ] Throws error on negative amount
- [ ] Updates chips property correctly

### addMult():
- [ ] Increases mult by positive amount
- [ ] Handles zero addition (no change)
- [ ] Accumulates multiple additions
- [ ] Throws error on negative amount
- [ ] Updates mult property correctly

### multiplyMult():
- [ ] Multiplies mult by 2
- [ ] Multiplies mult by larger values
- [ ] Handles multiplier of 1 (no change)
- [ ] Throws error on multiplier < 1
- [ ] Throws error on multiplier = 0
- [ ] Updates mult property correctly

## 2. ScoreBreakdown Class Tests

### Constructor:
- [ ] Creates breakdown with valid inputs
- [ ] Stores all properties correctly
- [ ] Accepts zero for chipsAdded
- [ ] Accepts zero for multAdded
- [ ] Throws error on empty source
- [ ] Throws error on empty description
- [ ] Properties are immutable

### Display Formatting:
- [ ] Provides readable format
- [ ] Shows source clearly
- [ ] Shows chips added
- [ ] Shows mult added
- [ ] Description explains contribution

## 3. ScoreResult Class Tests

### Constructor:
- [ ] Creates result with valid inputs
- [ ] Stores totalScore correctly
- [ ] Stores chips correctly
- [ ] Stores mult correctly
- [ ] Stores breakdown array
- [ ] Throws error on negative totalScore
- [ ] Throws error on negative chips
- [ ] Throws error on negative mult
- [ ] Validates totalScore = chips × mult

### addBreakdown():
- [ ] Appends breakdown to array
- [ ] Maintains order of additions
- [ ] Allows multiple breakdowns
- [ ] Throws error on null breakdown
- [ ] Breakdown array accessible

## 4. ScoreCalculator Class Tests

### Constructor:
- [ ] Creates calculator with valid dependencies
- [ ] Stores HandEvaluator reference
- [ ] Stores HandUpgradeManager reference
- [ ] Throws error on null evaluator
- [ ] Throws error on null upgradeManager

### calculateScore() - Basic Scenarios:

#### No Jokers, No Bonuses:
- [ ] Calculates score with only base hand values
- [ ] Example: Pair (10 chips × 2 mult) + 2 Kings (10+10 chips) = 30 × 2 = 60
- [ ] Breakdown includes base hand entry
- [ ] Breakdown includes card entries
- [ ] Total score matches calculation

#### With Card Bonuses:
- [ ] Adds card chipBonus correctly
- [ ] Adds card multBonus correctly
- [ ] Example: Card with +20 chips (Emperor tarot)
- [ ] Example: Card with +4 mult (Empress tarot)
- [ ] Breakdown shows card bonus contributions

#### With Fixed Mult Joker:
- [ ] Applies joker mult bonus
- [ ] Example: Joker (+4 mult) on Pair
- [ ] Calculation: (10 + 10 + 10) × (2 + 4) = 30 × 6 = 180
- [ ] Breakdown includes joker entry

#### With Chip Joker:
- [ ] Applies joker chip bonus
- [ ] Example: Odd Todd (+31 chips per odd card)
- [ ] Example: Blue Joker (+2 chips per remaining deck card)
- [ ] Breakdown includes joker entry

#### With Multiplier Joker:
- [ ] Applies multiplier to mult
- [ ] Example: Triboulet (×2 mult per K/Q played)
- [ ] Multiplier applied after all additions
- [ ] Breakdown includes joker entry

### calculateScore() - Strict Order Verification:

#### Order Test 1: Base → Cards → Jokers:
- [ ] Base hand values applied first
- [ ] Card bonuses applied second
- [ ] Joker effects applied last
- [ ] Breakdown entries in correct order

#### Order Test 2: Joker Priority (CHIPS → MULT → MULTIPLIER):
- [ ] CHIPS priority jokers applied first
- [ ] MULT priority jokers applied second
- [ ] MULTIPLIER priority jokers applied last
- [ ] Multiple jokers same priority: order preserved
- [ ] Breakdown reflects priority order

### calculateScore() - Complex Scenarios:

#### Synergy Test: Multiple Jokers on Same Card:
- [ ] K♠ with Wrathful Joker (+3 mult per Spade) + Triboulet (×2 mult per K)
- [ ] Expected: Base Pair (10 × 2) + K♠ card (10 chips) + Wrathful (+3 mult) + Triboulet (mult ×2)
- [ ] Calculation: (10 + 10 + 10) × (2 + 3) × 2 = 30 × 5 × 2 = 300
- [ ] Breakdown shows all contributions
- [ ] Order respected: additions before multipliers

#### Multiple Cards with Bonuses:
- [ ] 2 cards with Emperor bonus (+20 chips each)
- [ ] 1 card with Empress bonus (+4 mult)
- [ ] All bonuses accumulated correctly
- [ ] Breakdown shows each card

#### Conditional Jokers:
- [ ] Joker with condition met: applies effect
- [ ] Joker with condition not met: skipped
- [ ] Example: Half Joker (+20 mult if ≤3 cards)
- [ ] Example: Mystic Summit (+15 mult if 0 discards)
- [ ] Breakdown only includes activated jokers

#### Boss Blind Modifier (The Flint):
- [ ] Base chips divided by 2
- [ ] Base mult divided by 2
- [ ] Example: Pair (10 chips, 2 mult) → (5 chips, 1 mult)
- [ ] Applied before any other calculations
- [ ] Breakdown shows modified base values

### calculateScore() - Edge Cases:

#### Empty Jokers Array:
- [ ] Works with no jokers
- [ ] Only base and card bonuses
- [ ] No joker breakdown entries

#### Mult = 0 Scenario:
- [ ] If mult becomes 0, score = 0
- [ ] Calculation still valid
- [ ] No division by zero errors

#### All Jokers Inactive:
- [ ] All conditions fail
- [ ] No joker effects applied
- [ ] Only base and card bonuses
- [ ] Breakdown shows no joker entries

#### Maximum Synergy:
- [ ] 5 jokers all active
- [ ] Multiple card bonuses
- [ ] Planet upgrades applied
- [ ] Large score calculated correctly
- [ ] Complete breakdown generated

### calculateScore() - Validation:

#### Input Validation:
- [ ] Throws error on empty cards array
- [ ] Throws error on null jokers array
- [ ] Throws error on negative remainingDeckSize
- [ ] Accepts null blindModifier (optional)

#### Dependency Validation:
- [ ] Calls HandEvaluator.evaluateHand
- [ ] Uses HandUpgradeManager for base values
- [ ] Calls joker.canActivate for each joker
- [ ] Calls joker.applyEffect for active jokers

## 5. Integration Tests

### Complete Calculation Flow:
- [ ] Full game scenario: base + cards + 3 jokers
- [ ] Verify each step updates context correctly
- [ ] Verify breakdown has all entries
- [ ] Verify final score matches manual calculation

### Planet Upgrades Integration:
- [ ] Calculate score with planet upgrades
- [ ] Base values increased correctly
- [ ] Breakdown shows upgraded base

### Boss Blind Integration:
- [ ] Calculate score with The Flint modifier
- [ ] Base values halved
- [ ] Remaining calculation normal

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  ScoreCalculator, 
  ScoreContext, 
  ScoreResult, 
  ScoreBreakdown 
} from '@/models/scoring';
import { HandEvaluator, HandUpgradeManager, HandType } from '@/models/poker';
import { Card, CardValue, Suit } from '@/models/core';
import { Joker, MultJoker, ChipJoker, MultiplierJoker, JokerPriority } from '@/models/special-cards/jokers';
import { BlindModifier } from '@/models/blinds';

describe('Scoring System', () => {
  describe('ScoreContext', () => {
    describe('constructor', () => {
      it('should create context with valid inputs', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        
        // ACT
        const context = new ScoreContext(
          10,
          2,
          cards,
          HandType.HIGH_CARD,
          44
        );
        
        // ASSERT
        expect(context.chips).toBe(10);
        expect(context.mult).toBe(2);
        expect(context.playedCards).toEqual(cards);
        expect(context.handType).toBe(HandType.HIGH_CARD);
        expect(context.remainingDeckSize).toBe(44);
      });

      it('should throw error on negative chips', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        
        // ACT & ASSERT
        expect(() => new ScoreContext(-10, 2, cards, HandType.HIGH_CARD, 44))
          .toThrow('Chips cannot be negative');
      });

      it('should throw error on negative mult', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        
        // ACT & ASSERT
        expect(() => new ScoreContext(10, -2, cards, HandType.HIGH_CARD, 44))
          .toThrow('Mult cannot be negative');
      });

      it('should throw error on empty playedCards', () => {
        // ACT & ASSERT
        expect(() => new ScoreContext(10, 2, [], HandType.HIGH_CARD, 44))
          .toThrow('Played cards cannot be empty');
      });
    });

    describe('addChips', () => {
      it('should increase chips by amount', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT
        context.addChips(5);
        
        // ASSERT
        expect(context.chips).toBe(15);
      });

      it('should accumulate multiple additions', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT
        context.addChips(5);
        context.addChips(10);
        context.addChips(3);
        
        // ASSERT
        expect(context.chips).toBe(28);
      });

      it('should throw error on negative amount', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT & ASSERT
        expect(() => context.addChips(-5))
          .toThrow('Cannot add negative chips');
      });

      it('should handle zero addition', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT
        context.addChips(0);
        
        // ASSERT
        expect(context.chips).toBe(10);
      });
    });

    describe('addMult', () => {
      it('should increase mult by amount', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT
        context.addMult(3);
        
        // ASSERT
        expect(context.mult).toBe(5);
      });

      it('should throw error on negative amount', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT & ASSERT
        expect(() => context.addMult(-3))
          .toThrow('Cannot add negative mult');
      });
    });

    describe('multiplyMult', () => {
      it('should multiply mult by multiplier', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT
        context.multiplyMult(3);
        
        // ASSERT
        expect(context.mult).toBe(6);
      });

      it('should handle multiplier of 1', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT
        context.multiplyMult(1);
        
        // ASSERT
        expect(context.mult).toBe(2);
      });

      it('should throw error on multiplier < 1', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT & ASSERT
        expect(() => context.multiplyMult(0.5))
          .toThrow('Multiplier must be >= 1');
      });

      it('should throw error on multiplier = 0', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const context = new ScoreContext(10, 2, cards, HandType.HIGH_CARD, 44);
        
        // ACT & ASSERT
        expect(() => context.multiplyMult(0))
          .toThrow('Multiplier must be >= 1');
      });
    });
  });

  describe('ScoreBreakdown', () => {
    describe('constructor', () => {
      it('should create breakdown with valid inputs', () => {
        // ACT
        const breakdown = new ScoreBreakdown(
          'Base Hand',
          10,
          2,
          'Pair base values'
        );
        
        // ASSERT
        expect(breakdown.source).toBe('Base Hand');
        expect(breakdown.chipsAdded).toBe(10);
        expect(breakdown.multAdded).toBe(2);
        expect(breakdown.description).toBe('Pair base values');
      });

      it('should accept zero for chipsAdded', () => {
        // ACT
        const breakdown = new ScoreBreakdown(
          'Joker',
          0,
          4,
          'Mult only joker'
        );
        
        // ASSERT
        expect(breakdown.chipsAdded).toBe(0);
        expect(breakdown.multAdded).toBe(4);
      });

      it('should accept zero for multAdded', () => {
        // ACT
        const breakdown = new ScoreBreakdown(
          'Joker',
          20,
          0,
          'Chips only joker'
        );
        
        // ASSERT
        expect(breakdown.chipsAdded).toBe(20);
        expect(breakdown.multAdded).toBe(0);
      });

      it('should throw error on empty source', () => {
        // ACT & ASSERT
        expect(() => new ScoreBreakdown('', 10, 2, 'Description'))
          .toThrow('Source cannot be empty');
      });

      it('should throw error on empty description', () => {
        // ACT & ASSERT
        expect(() => new ScoreBreakdown('Source', 10, 2, ''))
          .toThrow('Description cannot be empty');
      });
    });
  });

  describe('ScoreResult', () => {
    describe('constructor', () => {
      it('should create result with valid inputs', () => {
        // ARRANGE
        const breakdown = [
          new ScoreBreakdown('Base', 10, 2, 'Pair base')
        ];
        
        // ACT
        const result = new ScoreResult(20, 10, 2, breakdown);
        
        // ASSERT
        expect(result.totalScore).toBe(20);
        expect(result.chips).toBe(10);
        expect(result.mult).toBe(2);
        expect(result.breakdown).toEqual(breakdown);
      });

      it('should throw error on negative totalScore', () => {
        // ACT & ASSERT
        expect(() => new ScoreResult(-20, 10, 2, []))
          .toThrow('Total score cannot be negative');
      });

      it('should throw error on negative chips', () => {
        // ACT & ASSERT
        expect(() => new ScoreResult(20, -10, 2, []))
          .toThrow('Chips cannot be negative');
      });

      it('should throw error on negative mult', () => {
        // ACT & ASSERT
        expect(() => new ScoreResult(20, 10, -2, []))
          .toThrow('Mult cannot be negative');
      });
    });

    describe('addBreakdown', () => {
      it('should append breakdown to array', () => {
        // ARRANGE
        const result = new ScoreResult(20, 10, 2, []);
        const breakdown = new ScoreBreakdown('Card', 5, 0, 'K♠');
        
        // ACT
        result.addBreakdown(breakdown);
        
        // ASSERT
        expect(result.breakdown).toHaveLength(1);
        expect(result.breakdown[0]).toBe(breakdown);
      });

      it('should maintain order of additions', () => {
        // ARRANGE
        const result = new ScoreResult(20, 10, 2, []);
        const bd1 = new ScoreBreakdown('Base', 10, 2, 'Base');
        const bd2 = new ScoreBreakdown('Card', 5, 0, 'Card');
        const bd3 = new ScoreBreakdown('Joker', 0, 4, 'Joker');
        
        // ACT
        result.addBreakdown(bd1);
        result.addBreakdown(bd2);
        result.addBreakdown(bd3);
        
        // ASSERT
        expect(result.breakdown).toHaveLength(3);
        expect(result.breakdown[0]).toBe(bd1);
        expect(result.breakdown[1]).toBe(bd2);
        expect(result.breakdown[2]).toBe(bd3);
      });

      it('should throw error on null breakdown', () => {
        // ARRANGE
        const result = new ScoreResult(20, 10, 2, []);
        
        // ACT & ASSERT
        expect(() => result.addBreakdown(null as any))
          .toThrow('Breakdown cannot be null');
      });
    });
  });

  describe('ScoreCalculator', () => {
    let calculator: ScoreCalculator;
    let evaluator: HandEvaluator;
    let upgradeManager: HandUpgradeManager;

    beforeEach(() => {
      evaluator = new HandEvaluator();
      upgradeManager = new HandUpgradeManager();
      calculator = new ScoreCalculator(evaluator, upgradeManager);
    });

    describe('constructor', () => {
      it('should create calculator with valid dependencies', () => {
        // ACT
        const calc = new ScoreCalculator(evaluator, upgradeManager);
        
        // ASSERT
        expect(calc).toBeDefined();
      });

      it('should throw error on null evaluator', () => {
        // ACT & ASSERT
        expect(() => new ScoreCalculator(null as any, upgradeManager))
          .toThrow('HandEvaluator cannot be null');
      });

      it('should throw error on null upgradeManager', () => {
        // ACT & ASSERT
        expect(() => new ScoreCalculator(evaluator, null as any))
          .toThrow('HandUpgradeManager cannot be null');
      });
    });

    describe('calculateScore - Basic Scenarios', () => {
      it('should calculate score with only base hand values (no jokers, no bonuses)', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44);
        
        // ASSERT
        // Base: Pair = 10 chips × 2 mult
        // Cards: K♠ (10 chips) + K♥ (10 chips) = 20 chips
        // Total: (10 + 20) × 2 = 60
        expect(result.totalScore).toBe(60);
        expect(result.chips).toBe(30);
        expect(result.mult).toBe(2);
        expect(result.breakdown.length).toBeGreaterThan(0);
      });

      it('should add card chipBonus correctly', () => {
        // ARRANGE
        const cardWithBonus = new Card(CardValue.KING, Suit.SPADES);
        cardWithBonus.addPermanentBonus(20, 0); // Emperor tarot
        const cards = [
          cardWithBonus,
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44);
        
        // ASSERT
        // Base: Pair = 10 chips × 2 mult
        // Cards: K♠ with bonus (10+20 chips) + K♥ (10 chips) = 40 chips
        // Total: (10 + 40) × 2 = 100
        expect(result.totalScore).toBe(100);
        expect(result.chips).toBe(50);
      });

      it('should add card multBonus correctly', () => {
        // ARRANGE
        const cardWithBonus = new Card(CardValue.KING, Suit.SPADES);
        cardWithBonus.addPermanentBonus(0, 4); // Empress tarot
        const cards = [
          cardWithBonus,
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44);
        
        // ASSERT
        // Base: Pair = 10 chips × 2 mult
        // Cards: K♠ with bonus (10 chips) + K♥ (10 chips) = 20 chips
        // Mult: base 2 + card bonus 4 = 6
        // Total: (10 + 20) × (2 + 4) = 180
        expect(result.totalScore).toBe(180);
        expect(result.mult).toBe(6);
      });
    });

    describe('calculateScore - With Jokers', () => {
      it('should apply fixed mult joker correctly', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        const joker = new MultJoker(
          'joker',
          'Joker',
          '+4 mult',
          4
        );
        
        // ACT
        const result = calculator.calculateScore(cards, [joker], 44);
        
        // ASSERT
        // Base: Pair = 10 chips × 2 mult
        // Cards: 20 chips
        // Joker: +4 mult
        // Total: 30 × (2 + 4) = 180
        expect(result.totalScore).toBe(180);
        expect(result.mult).toBe(6);
      });

      it('should apply chip joker correctly', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        // Blue Joker: +2 chips per remaining deck card (44 cards = +88 chips)
        const joker = new ChipJoker(
          'blue-joker',
          'Blue Joker',
          '+2 chips per deck card',
          2,
          (ctx) => ctx.remainingDeckSize
        );
        
        // ACT
        const result = calculator.calculateScore(cards, [joker], 44);
        
        // ASSERT
        // Base: 10 chips × 2 mult
        // Cards: 20 chips
        // Joker: 2 × 44 = 88 chips
        // Total: (10 + 20 + 88) × 2 = 236
        expect(result.totalScore).toBe(236);
        expect(result.chips).toBe(118);
      });

      it('should apply multiplier joker correctly', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        // Triboulet: ×2 mult per K or Q played
        const joker = new MultiplierJoker(
          'triboulet',
          'Triboulet',
          '×2 mult per K or Q',
          2,
          (ctx) => ctx.playedCards.filter(c => 
            c.value === CardValue.KING || c.value === CardValue.QUEEN
          ).length
        );
        
        // ACT
        const result = calculator.calculateScore(cards, [joker], 44);
        
        // ASSERT
        // Base: 10 chips × 2 mult
        // Cards: 20 chips
        // Joker: mult × 2 (for 1 K) × 2 (for another K) = mult × 4
        // Total: 30 × (2 × 2 × 2) = 30 × 8 = 240
        expect(result.totalScore).toBe(240);
        expect(result.mult).toBe(8);
      });
    });

    describe('calculateScore - Strict Order Verification', () => {
      it('should apply calculations in correct order: base → cards → jokers', () => {
        // ARRANGE
        const cardWithBonus = new Card(CardValue.KING, Suit.SPADES);
        cardWithBonus.addPermanentBonus(10, 2);
        const cards = [cardWithBonus];
        const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
        
        // ACT
        const result = calculator.calculateScore(cards, [joker], 44);
        
        // ASSERT
        // Order: Base (5×1) → Card (11 chips, 2 mult) → Joker (4 mult)
        // Breakdown should reflect this order
        expect(result.breakdown[0].source).toContain('Base');
        expect(result.breakdown[1].source).toContain('Card');
        expect(result.breakdown[2].source).toContain('Joker');
      });

      it('should apply jokers by priority: CHIPS → MULT → MULTIPLIER', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        const chipJoker = new ChipJoker('chip', 'Chip Joker', '+20 chips', 20);
        const multJoker = new MultJoker('mult', 'Mult Joker', '+4 mult', 4);
        const multiplierJoker = new MultiplierJoker('mult-joker', 'Multiplier', '×2', 2);
        
        // ACT
        const result = calculator.calculateScore(
          cards,
          [multiplierJoker, chipJoker, multJoker], // Intentionally wrong order
          44
        );
        
        // ASSERT
        // Should apply in priority order regardless of input order
        // Find joker entries in breakdown
        const jokerEntries = result.breakdown.filter(b => b.source.includes('Joker'));
        expect(jokerEntries[0].source).toContain('Chip'); // CHIPS first
        expect(jokerEntries[1].source).toContain('Mult'); // MULT second
        expect(jokerEntries[2].source).toContain('Multiplier'); // MULTIPLIER last
      });
    });

    describe('calculateScore - Complex Synergy', () => {
      it('should handle K♠ with Wrathful Joker + Triboulet synergy', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        // Wrathful Joker: +3 mult per Spade
        const wrathfulJoker = new MultJoker(
          'wrathful',
          'Wrathful Joker',
          '+3 mult per Spade',
          3,
          (ctx) => ctx.playedCards.filter(c => c.suit === Suit.SPADES).length
        );
        // Triboulet: ×2 mult per K or Q
        const triboulet = new MultiplierJoker(
          'triboulet',
          'Triboulet',
          '×2 mult per K/Q',
          2,
          (ctx) => ctx.playedCards.filter(c => 
            c.value === CardValue.KING || c.value === CardValue.QUEEN
          ).length
        );
        
        // ACT
        const result = calculator.calculateScore(cards, [wrathfulJoker, triboulet], 44);
        
        // ASSERT
        // Base: Pair = 10 chips × 2 mult
        // Cards: K♠ (10) + K♥ (10) = 20 chips
        // Wrathful: +3 mult (1 Spade)
        // Triboulet: mult × 2 (1 K) × 2 (another K) = ×4
        // Calculation: (10 + 20) × (2 + 3) × 4 = 30 × 5 × 4 = 600
        expect(result.totalScore).toBe(600);
        expect(result.chips).toBe(30);
        expect(result.mult).toBe(20); // (2 + 3) × 4
      });

      it('should handle multiple cards with bonuses', () => {
        // ARRANGE
        const card1 = new Card(CardValue.KING, Suit.SPADES);
        card1.addPermanentBonus(20, 0); // Emperor
        const card2 = new Card(CardValue.KING, Suit.HEARTS);
        card2.addPermanentBonus(0, 4); // Empress
        const cards = [card1, card2];
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44);
        
        // ASSERT
        // Base: 10 × 2
        // Cards: (10+20) + 10 = 40 chips, +4 mult
        // Total: (10 + 40) × (2 + 4) = 300
        expect(result.totalScore).toBe(300);
      });
    });

    describe('calculateScore - Conditional Jokers', () => {
      it('should activate joker when condition is met', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        // Half Joker: +20 mult if ≤3 cards played
        const halfJoker = new MultJoker(
          'half-joker',
          'Half Joker',
          '+20 mult if ≤3 cards',
          20,
          (ctx) => ctx.playedCards.length <= 3 ? 1 : 0
        );
        
        // ACT
        const result = calculator.calculateScore(cards, [halfJoker], 44);
        
        // ASSERT
        // Condition met (2 cards ≤ 3)
        expect(result.mult).toBeGreaterThan(2); // Base + joker bonus
        expect(result.breakdown.some(b => b.source.includes('Half Joker'))).toBe(true);
      });

      it('should skip joker when condition is not met', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS),
          new Card(CardValue.NINE, Suit.DIAMONDS),
          new Card(CardValue.NINE, Suit.CLUBS)
        ];
        // Half Joker: +20 mult if ≤3 cards played
        const halfJoker = new MultJoker(
          'half-joker',
          'Half Joker',
          '+20 mult if ≤3 cards',
          20,
          (ctx) => ctx.playedCards.length <= 3 ? 1 : 0
        );
        
        // ACT
        const result = calculator.calculateScore(cards, [halfJoker], 44);
        
        // ASSERT
        // Condition not met (4 cards > 3)
        expect(result.mult).toBe(2); // Only base mult, no joker bonus
        expect(result.breakdown.some(b => b.source.includes('Half Joker'))).toBe(false);
      });
    });

    describe('calculateScore - Boss Blind Modifier', () => {
      it('should apply The Flint modifier (divide base by 2)', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.KING, Suit.SPADES),
          new Card(CardValue.KING, Suit.HEARTS)
        ];
        const flintModifier = new BlindModifier();
        flintModifier.chipsDivisor = 2;
        flintModifier.multDivisor = 2;
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44, flintModifier);
        
        // ASSERT
        // Base: Pair = 10 chips ÷ 2 = 5 chips, 2 mult ÷ 2 = 1 mult
        // Cards: 20 chips (not affected by modifier)
        // Total: (5 + 20) × 1 = 25
        expect(result.totalScore).toBe(25);
        expect(result.breakdown[0].chipsAdded).toBe(5); // Modified base
        expect(result.breakdown[0].multAdded).toBe(1);
      });
    });

    describe('calculateScore - Edge Cases', () => {
      it('should work with empty jokers array', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44);
        
        // ASSERT
        expect(result).toBeDefined();
        expect(result.breakdown.every(b => !b.source.includes('Joker'))).toBe(true);
      });

      it('should throw error on empty cards array', () => {
        // ACT & ASSERT
        expect(() => calculator.calculateScore([], [], 44))
          .toThrow('Cards array cannot be empty');
      });

      it('should throw error on negative remainingDeckSize', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        
        // ACT & ASSERT
        expect(() => calculator.calculateScore(cards, [], -1))
          .toThrow('Remaining deck size cannot be negative');
      });

      it('should accept null blindModifier', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44, null);
        
        // ASSERT
        expect(result).toBeDefined();
      });
    });

    describe('Integration with Other Systems', () => {
      it('should use HandEvaluator to determine hand type', () => {
        // ARRANGE
        const cards = [
          new Card(CardValue.FIVE, Suit.SPADES),
          new Card(CardValue.FOUR, Suit.HEARTS),
          new Card(CardValue.THREE, Suit.DIAMONDS),
          new Card(CardValue.TWO, Suit.CLUBS),
          new Card(CardValue.ACE, Suit.SPADES)
        ];
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44);
        
        // ASSERT
        // Should detect Ace-low straight
        expect(result.breakdown[0].description).toContain('Straight');
      });

      it('should apply planet upgrades via HandUpgradeManager', () => {
        // ARRANGE
        const cards = [new Card(CardValue.ACE, Suit.SPADES)];
        upgradeManager.applyPlanetUpgrade(HandType.HIGH_CARD, 10, 1);
        
        // ACT
        const result = calculator.calculateScore(cards, [], 44);
        
        // ASSERT
        // Base should be upgraded: (5+10) × (1+1) = 15 × 2
        expect(result.breakdown[0].chipsAdded).toBe(15);
        expect(result.breakdown[0].multAdded).toBe(2);
      });
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for all 4 scoring components
- Comprehensive coverage of calculation order
- All joker priority scenarios tested
- Synergy and edge cases covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| ScoreContext | constructor | 1 | 1 | 4 | 6 |
| ScoreContext | addChips | 3 | 1 | 1 | 5 |
| ScoreContext | addMult | 2 | 1 | 1 | 4 |
| ScoreContext | multiplyMult | 3 | 1 | 2 | 6 |
| ScoreBreakdown | constructor | 3 | 0 | 2 | 5 |
| ScoreResult | constructor | 1 | 0 | 3 | 4 |
| ScoreResult | addBreakdown | 2 | 0 | 1 | 3 |
| ScoreCalculator | constructor | 1 | 0 | 2 | 3 |
| ScoreCalculator | Basic Scenarios | 3 | 0 | 0 | 3 |
| ScoreCalculator | With Jokers | 3 | 0 | 0 | 3 |
| ScoreCalculator | Strict Order | 2 | 0 | 0 | 2 |
| ScoreCalculator | Complex Synergy | 2 | 0 | 0 | 2 |
| ScoreCalculator | Conditional Jokers | 2 | 0 | 0 | 2 |
| ScoreCalculator | Boss Modifier | 1 | 0 | 0 | 1 |
| ScoreCalculator | Edge Cases | 1 | 2 | 2 | 5 |
| **Integration** | - | 2 | 0 | 0 | 2 |
| **TOTAL** | | | | | **56** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **90%**
- Methods covered: **All public methods** (100%)
- Uncovered scenarios: 
  - Some private helper method edge cases (covered indirectly)
  - Internal logging statements

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/models/scoring.test.ts

# Run with coverage
npm test -- --coverage tests/unit/models/scoring.test.ts

# Run in watch mode
npm test -- --watch tests/unit/models/scoring.test.ts

# Run specific describe block
npm test -- -t "calculateScore - Complex Synergy" tests/unit/models/scoring.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Calculation order is critical:** Base → Cards → Jokers (CHIPS → MULT → MULTIPLIER) → Final
- **Synergy testing:** Multiple jokers affecting same cards must be verified
- **Multiplier timing:** Must be applied AFTER all additions
- **Boss modifiers:** Applied to base values BEFORE any other calculations
- **Zero mult scenario:** Results in zero score but should not crash
- **Floating point precision:** Score calculations should handle large numbers
- **Breakdown completeness:** Every contribution must have a breakdown entry

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to create joker mocks
function createMockJoker(
  priority: JokerPriority,
  chipsAdded: number = 0,
  multAdded: number = 0,
  multiplier: number = 1
): jest.Mocked<Joker> {
  return {
    getPriority: jest.fn().mockReturnValue(priority),
    canActivate: jest.fn().mockReturnValue(true),
    applyEffect: jest.fn().mockImplementation((ctx: ScoreContext) => {
      if (chipsAdded) ctx.addChips(chipsAdded);
      if (multAdded) ctx.addMult(multAdded);
      if (multiplier > 1) ctx.multiplyMult(multiplier);
    })
  } as any;
}

// Helper to verify breakdown order
function verifyBreakdownOrder(result: ScoreResult): void {
  const sources = result.breakdown.map(b => b.source);
  expect(sources[0]).toContain('Base'); // Base always first
  // ... more assertions
}
```
