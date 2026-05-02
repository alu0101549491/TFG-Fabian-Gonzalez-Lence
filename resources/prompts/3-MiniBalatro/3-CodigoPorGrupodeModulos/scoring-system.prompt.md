# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Domain Layer - Scoring System

**Project File Structure:**
```
3-MiniBalatro/
├── src/
│   ├── models/
│   │   ├── index.ts
│   │   ├── core/
│   │   │   ├── card.ts
│   │   │   ├── card-value.enum.ts
│   │   │   ├── suit.enum.ts
│   │   │   └── deck.ts
│   │   ├── poker/
│   │   │   ├── hand-evaluator.ts
│   │   │   ├── hand-result.ts
│   │   │   ├── hand-type.enum.ts
│   │   │   ├── hand-upgrade-manager.ts
│   │   │   └── hand-upgrade.ts
│   │   ├── special-cards/
│   │   │   ├── jokers/
│   │   │   │   ├── joker.ts
│   │   │   │   ├── joker-priority.enum.ts
│   │   │   │   ├── chip-joker.ts
│   │   │   │   ├── mult-joker.ts
│   │   │   │   └── multiplier-joker.ts
│   │   │   ├── planets/
│   │   │   │   └── planet.ts
│   │   │   └── tarots/
│   │   │       ├── tarot.ts
│   │   │       ├── tarot-effect.enum.ts
│   │   │       ├── instant-tarot.ts
│   │   │       └── targeted-tarot.ts
│   │   ├── scoring/
│   │   │   ├── index.ts
│   │   │   ├── score-calculator.ts      ← IMPLEMENT
│   │   │   ├── score-context.ts         ← IMPLEMENT
│   │   │   ├── score-result.ts          ← IMPLEMENT
│   │   │   └── score-breakdown.ts       ← IMPLEMENT
│   │   ├── blinds/
│   │   └── game/
│   ├── controllers/
│   ├── services/
│   ├── views/
│   ├── utils/
│   └── types/
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant sections:**

### Section 3: Definitions
- **Chips:** Base scoring component that is added
- **Mult (Multiplier):** Multiplicative scoring component
- **Synergy:** Simultaneous activation of multiple joker effects by the same played card

### Section 4: Functional Requirements
- **FR7:** Score calculation according to formula: chips × mult
- **FR8:** Strict scoring calculation order
- **FR16:** Detection and application of synergies
- **FR30:** Score preview (showing chips, mult, total before playing hand)

### Section 8.3: Score Calculation Order (Detailed)

**Step 1: Poker hand base values**
- Base chips and mult are identified according to the played hand type

**Step 2: Individual card evaluation**
- For each played card (left to right):
  - Individual card chips are added
  - Jokers acting "per played card" are evaluated (e.g., Greedy Joker +3 mult if Diamond)
  - Tarot improvement effects on the card are applied (e.g., The Empress +4 mult)

**Step 3: Persistent joker effects**
- **Priority 1:** Jokers that increase total chips (e.g., Blue Joker, Odd Todd)
- **Priority 2:** Jokers that increase total mult (e.g., Joker, Half Joker, Mystic Summit)
- **Priority 3:** Jokers that multiply total mult (e.g., Triboulet, Joker Stencil)
- **Priority 4:** Other special effects

**Step 4: Final calculation**
- Score = Total Chips × Total Mult

### Section 8.6: Complete Joker Catalog (Examples for synergies)

**Synergy Example 1: K of Spades with Triboulet + Wrathful Joker**
- Played cards: K of Spades (in a Pair hand)
- Calculation:
  1. Base: Pair = 10 chips × 2 mult
  2. Individual card: K of Spades = +10 chips
  3. Wrathful Joker synergy: K is Spades → +3 mult
  4. Triboulet: K played → total mult ×2
  5. Result: (10 + 10) chips × (2 + 3) mult = 20 × 5 = 100 points
  6. Apply Triboulet: 100 × 2 = **200 final points**

### Section 13.1: Required Unit Tests

**test_scoring.js:**
- Correct base score calculation without jokers
- Correct sum of individual card values
- Correct application of effect order (chips → mult → multipliers)
- Correct calculation with multiple active jokers
- Correct application of simultaneous synergies
- Tarot improvement effects on specific cards

### Section 16: Score Calculation Algorithm (Pseudocode)

```
FUNCTION calculateScore(playedCards, jokers, handType):
    // Step 1: Initialize with base values
    chips = handType.baseChips
    mult = handType.baseMult

    // Step 2: Evaluate individual cards
    FOR EACH card IN playedCards:
        chips += card.baseValue

        // Apply tarot improvements on card
        IF card.hasEmpress:
            mult += 4
        IF card.hasEmperor:
            chips += 20

        // Apply "per card" jokers
        FOR EACH joker IN jokers:
            IF joker.triggerCondition(card):
                IF joker.effectType == "mult":
                    mult += joker.value
                ELSE IF joker.effectType == "chips":
                    chips += joker.value
                ELSE IF joker.effectType == "multiplier":
                    mult *= joker.value

    // Step 3: Apply persistent jokers
    // Priority 1: Jokers that add chips
    FOR EACH joker IN jokers WHERE joker.priority == "chips":
        IF joker.globalCondition():
            chips += joker.calculateChips()

    // Priority 2: Jokers that add mult
    FOR EACH joker IN jokers WHERE joker.priority == "mult":
        IF joker.globalCondition():
            mult += joker.calculateMult()

    // Priority 3: Multiplier jokers
    FOR EACH joker IN jokers WHERE joker.priority == "multiplier":
        IF joker.globalCondition():
            mult *= joker.multiplier

    // Step 4: Final calculation
    finalScore = chips × mult

    RETURN finalScore
```

---

## 2. Class Diagram

```
class ScoreCalculator {
    -evaluator: HandEvaluator
    -upgradeManager: HandUpgradeManager
    
    +constructor(evaluator: HandEvaluator, upgradeManager: HandUpgradeManager)
    +calculateScore(cards: Card[], jokers: Joker[], blindModifier?: BlindModifier): ScoreResult
    -applyBaseValues(handResult: HandResult): ScoreContext
    -applyCardBonuses(context: ScoreContext, cards: Card[]): void
    -applyJokerEffects(context: ScoreContext, jokers: Joker[]): void
    -calculateFinalScore(context: ScoreContext): number
}

class ScoreContext {
    +chips: number
    +mult: number
    +playedCards: Card[]
    +handType: HandType
    +remainingDeckSize: number
}

class ScoreResult {
    +totalScore: number
    +chips: number
    +mult: number
    +breakdown: ScoreBreakdown[]
}

class ScoreBreakdown {
    +source: string
    +chipsAdded: number
    +multAdded: number
    +description: string
}

ScoreCalculator --> HandEvaluator : uses
ScoreCalculator --> HandUpgradeManager : uses
ScoreCalculator --> ScoreResult : returns
ScoreCalculator --> ScoreContext : uses
ScoreResult --> ScoreBreakdown : contains
ScoreContext --> Card : references
ScoreContext --> HandType : has
```

---

## 3. Use Case Diagram

**Relevant use cases:**

**Player interactions:**
- **Play Hand:** Player plays selected cards, triggering score calculation
- **Preview Score:** Player views potential score before playing

**System operations:**
- **Calculate Score:** System computes final score using strict order
- **Apply Base Score:** System retrieves base chips/mult for hand type
- **Apply Multipliers:** System applies all modifiers in correct priority
- **Process Synergies:** System detects multiple joker effects on same card
- **Calculate Final Score:** System multiplies chips by mult for final result

**Relationships:**
- PlayHand includes CalculateScore
- CalculateScore includes ApplyBaseScore
- CalculateScore includes ApplyMultipliers
- ApplyMultipliers includes ProcessSynergies
- CalculateScore includes CalculateFinalScore
- PreviewScore includes CalculateScore (without consuming hand)

---

# SPECIFIC TASK

Implement the **Scoring System** module consisting of 4 classes:

1. **ScoreContext** (class) - `src/models/scoring/score-context.ts`
2. **ScoreBreakdown** (class) - `src/models/scoring/score-breakdown.ts`
3. **ScoreResult** (class) - `src/models/scoring/score-result.ts`
4. **ScoreCalculator** (class) - `src/models/scoring/score-calculator.ts`

---

## MODULE 1: ScoreContext (Class)

### Responsibilities:
- Hold intermediate state during score calculation
- Track chips and mult as they accumulate
- Provide context for joker condition checking
- Store reference to played cards and hand type

### Properties:
- `chips: number` - Current total chips (accumulated)
- `mult: number` - Current total mult (accumulated)
- `playedCards: Card[]` - Cards that were played this hand
- `handType: HandType` - Detected poker hand type
- `remainingDeckSize: number` - Cards remaining in deck (for Blue Joker, etc.)

### Methods to implement:

#### 1. **constructor**(chips: number, mult: number, playedCards: Card[], handType: HandType, remainingDeckSize: number)
- **Description:** Creates a score context with initial values
- **Preconditions:** chips >= 0, mult >= 0, playedCards non-empty
- **Postconditions:** ScoreContext object initialized
- **Exceptions to handle:** 
  - Throw error if chips or mult negative
  - Throw error if playedCards empty

#### 2. **addChips**(amount: number): void
- **Description:** Adds chips to the current total
- **Preconditions:** amount >= 0
- **Postconditions:** chips increased by amount
- **Exceptions to handle:** Throw error if amount negative

#### 3. **addMult**(amount: number): void
- **Description:** Adds mult to the current total
- **Preconditions:** amount >= 0
- **Postconditions:** mult increased by amount
- **Exceptions to handle:** Throw error if amount negative

#### 4. **multiplyMult**(multiplier: number): void
- **Description:** Multiplies current mult by a multiplier
- **Preconditions:** multiplier >= 1
- **Postconditions:** mult multiplied by multiplier
- **Exceptions to handle:** Throw error if multiplier < 1

---

## MODULE 2: ScoreBreakdown (Class)

### Responsibilities:
- Record individual contributions to the score
- Enable detailed score calculation tracing
- Support UI display of score breakdown

### Properties:
- `source: string` - Name of the source (e.g., "Base Hand", "Greedy Joker", "K♠")
- `chipsAdded: number` - Chips contributed by this source
- `multAdded: number` - Mult contributed by this source
- `description: string` - Human-readable description of effect

### Methods to implement:

#### 1. **constructor**(source: string, chipsAdded: number, multAdded: number, description: string)
- **Description:** Creates a breakdown entry for score tracing
- **Preconditions:** source and description non-empty
- **Postconditions:** ScoreBreakdown object created
- **Exceptions to handle:** Throw error if source/description empty

---

## MODULE 3: ScoreResult (Class)

### Responsibilities:
- Encapsulate the complete result of score calculation
- Store final score and intermediate values
- Provide detailed breakdown for UI display

### Properties:
- `totalScore: number` - Final calculated score (chips × mult)
- `chips: number` - Final total chips after all additions
- `mult: number` - Final total mult after all additions and multiplications
- `breakdown: ScoreBreakdown[]` - Detailed list of all score contributions

### Methods to implement:

#### 1. **constructor**(totalScore: number, chips: number, mult: number, breakdown: ScoreBreakdown[])
- **Description:** Creates a score result with all calculation details
- **Preconditions:** totalScore >= 0, chips >= 0, mult >= 0
- **Postconditions:** ScoreResult object created
- **Exceptions to handle:** Throw error if negative values

#### 2. **addBreakdown**(breakdown: ScoreBreakdown): void
- **Description:** Adds a breakdown entry to the result
- **Preconditions:** breakdown is valid ScoreBreakdown object
- **Postconditions:** breakdown array includes new entry
- **Exceptions to handle:** Throw error if breakdown null

---

## MODULE 4: ScoreCalculator (Class)

### Responsibilities:
- Orchestrate the complete score calculation process
- Enforce strict calculation order (base → cards → jokers by priority → final)
- Apply joker effects in correct priority sequence
- Handle synergies (multiple jokers triggering on same card)
- Generate detailed score breakdown
- Support blind modifiers (boss effects)

### Properties:
- `evaluator: HandEvaluator` - For determining hand type
- `upgradeManager: HandUpgradeManager` - For getting upgraded base values

### Methods to implement:

#### 1. **constructor**(evaluator: HandEvaluator, upgradeManager: HandUpgradeManager)
- **Description:** Creates a score calculator with required dependencies
- **Preconditions:** evaluator and upgradeManager not null
- **Postconditions:** ScoreCalculator initialized with dependencies
- **Exceptions to handle:** Throw error if either parameter null

#### 2. **calculateScore**(cards: Card[], jokers: Joker[], remainingDeckSize: number, blindModifier?: BlindModifier): ScoreResult
- **Description:** Calculates complete score following strict order, returns detailed result
- **Preconditions:** cards.length 1-5, jokers array valid, remainingDeckSize >= 0
- **Postconditions:** Returns ScoreResult with totalScore = chips × mult
- **Exceptions to handle:** 
  - Throw error if cards empty or > 5
  - Throw error if remainingDeckSize negative
- **Algorithm:**
  1. Evaluate hand type using HandEvaluator
  2. Get upgraded base values from HandUpgradeManager
  3. Apply blind modifier to base values (if present)
  4. Create initial ScoreContext with base values
  5. Apply individual card bonuses (Step 2)
  6. Apply joker effects by priority (Step 3)
  7. Calculate final score (chips × mult)
  8. Return ScoreResult with breakdown

#### 3. **applyBaseValues**(handResult: HandResult, blindModifier?: BlindModifier) [PRIVATE]: ScoreContext
- **Description:** Creates initial context with base chips and mult from hand type
- **Preconditions:** handResult valid, optional blindModifier
- **Postconditions:** Returns ScoreContext with base values (potentially modified by blind)
- **Exceptions to handle:** None
- **Note:** Apply blind modifier chip/mult divisors here (e.g., The Flint halves values)

#### 4. **applyCardBonuses**(context: ScoreContext, cards: Card[], jokers: Joker[]) [PRIVATE]: void
- **Description:** Applies individual card chips and per-card joker effects
- **Preconditions:** context valid, cards non-empty, jokers array valid
- **Postconditions:** context.chips and context.mult updated with card contributions
- **Exceptions to handle:** None
- **Algorithm:**
  - For each card (left to right):
    - Add card.getBaseChips() to context.chips
    - Add card.multBonus to context.mult (from Empress tarot)
    - Check each joker for per-card triggers (e.g., Greedy Joker on Diamond)
    - Record breakdown entries for each contribution

#### 5. **applyJokerEffects**(context: ScoreContext, jokers: Joker[]) [PRIVATE]: void
- **Description:** Applies persistent joker effects in strict priority order
- **Preconditions:** context valid, jokers array valid
- **Postconditions:** context.chips and context.mult updated by joker effects
- **Exceptions to handle:** None
- **Algorithm:**
  1. Sort jokers by priority (CHIPS → MULT → MULTIPLIER)
  2. For each priority level:
     - Filter jokers with that priority
     - For each joker, if canActivate(context):
       - Call joker.applyEffect(context)
       - Record breakdown entry
  3. Ensure multipliers are applied last

#### 6. **calculateFinalScore**(context: ScoreContext) [PRIVATE]: number
- **Description:** Computes final score as chips × mult
- **Preconditions:** context valid with final chips and mult values
- **Postconditions:** Returns non-negative integer score
- **Exceptions to handle:** None
- **Note:** May apply blind modifier to final score (e.g., The Wall multiplies goal, not score)

---

## Dependencies:

### Classes it must use:
- **ScoreCalculator** uses **HandEvaluator** from `src/models/poker/hand-evaluator.ts`
- **ScoreCalculator** uses **HandUpgradeManager** from `src/models/poker/hand-upgrade-manager.ts`
- **ScoreCalculator** uses **Joker** from `src/models/special-cards/jokers/joker.ts`
- **ScoreCalculator** uses **JokerPriority** from `src/models/special-cards/jokers/joker-priority.enum.ts`
- **ScoreCalculator** uses **Card** from `src/models/core/card.ts`
- **ScoreContext** uses **Card** from `src/models/core/card.ts`
- **ScoreContext** uses **HandType** from `src/models/poker/hand-type.enum.ts`
- **ScoreCalculator** may use **BlindModifier** from `src/models/blinds/blind-modifier.ts` (optional parameter)

### Interfaces it implements:
- None (concrete classes)

### External services it consumes:
- None (pure domain logic)

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
  - Use camelCase for variables and methods
  - Use PascalCase for classes and enums
  - 2-space indentation
  - Single quotes for strings
  - Semicolons required
- **Maximum cyclomatic complexity:** 10 per method
- **Maximum method length:** 50 lines

## Mandatory best practices:
- **SOLID principles:**
  - Single Responsibility: Each class has one clear purpose
  - Open/Closed: Calculator extensible for new effect types
  - Liskov Substitution: N/A
  - Interface Segregation: N/A
  - Dependency Inversion: Depend on abstractions (Joker interface)
- **Input parameter validation:**
  - Validate card array length (1-5)
  - Validate non-null objects
  - Validate non-negative numeric values
- **Robust exception handling:**
  - Throw errors with descriptive messages
  - Document exceptions in TSDoc
- **Logging at critical points:**
  - Log each step of score calculation with values
  - Log joker activations and their effects
  - Log final score computation
- **Comments for complex logic:**
  - Comment the strict ordering enforcement
  - Comment synergy detection and application
  - Explain priority-based joker sorting

## Security:
- **Input sanitization and validation:**
  - Validate array lengths before iteration
  - Validate numeric values are non-negative
  - Protect against division by zero (if mult could be 0)

---

# DELIVERABLES

## 1. Complete source code of all 4 modules with:

### File: `src/models/scoring/score-context.ts`
```typescript
/**
 * Holds intermediate state during score calculation.
 * Tracks accumulating chips and mult as effects are applied.
 */
export class ScoreContext {
  // Properties and methods
}
```

### File: `src/models/scoring/score-breakdown.ts`
```typescript
/**
 * Records individual contribution to score calculation.
 * Enables detailed tracing and UI display of score sources.
 */
export class ScoreBreakdown {
  // Properties and methods
}
```

### File: `src/models/scoring/score-result.ts`
```typescript
/**
 * Encapsulates complete score calculation result.
 * Contains final score, components, and detailed breakdown.
 */
export class ScoreResult {
  // Properties and methods
}
```

### File: `src/models/scoring/score-calculator.ts`
```typescript
/**
 * Orchestrates score calculation with strict ordering.
 * Enforces: base values → card bonuses → joker effects (by priority) → final calculation.
 */
export class ScoreCalculator {
  // Properties and methods
}
```

## 2. Inline documentation:
- TSDoc comments on all public classes and methods
- Detailed algorithm documentation in calculateScore
- Priority ordering explanation in applyJokerEffects
- Edge case handling documentation

## 3. New dependencies:
- None (uses existing models from core, poker, and special-cards)

## 4. Edge cases considered:
- Calculating score with no jokers (only base values)
- Calculating score with only multiplier jokers (no additions first)
- Card with multiple bonuses (Emperor + Empress tarot applied)
- Multiple jokers triggering on same card (synergy)
- Joker with condition that's never met (not activated)
- Mult = 0 scenario (score would be 0)
- Blind modifier dividing values (The Flint)
- Empty jokers array (valid, only card bonuses apply)
- Maximum synergies (all 5 jokers trigger on one card)

---

# OUTPUT FORMAT

Provide separate code blocks for each file:

```typescript
// ============================================
// FILE: src/models/scoring/score-context.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/scoring/score-breakdown.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/scoring/score-result.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/scoring/score-calculator.ts
// ============================================

[Complete implementation with TSDoc comments]
```

---

**Design decisions made:**
- [Decision 1 and its justification]
- [Decision 2 and its justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
```
