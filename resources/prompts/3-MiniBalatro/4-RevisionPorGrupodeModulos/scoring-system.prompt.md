# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Scoring System

**Components under review:**
- `ScoreContext` (class) - `src/models/scoring/score-context.ts`
- `ScoreBreakdown` (class) - `src/models/scoring/score-breakdown.ts`
- `ScoreResult` (class) - `src/models/scoring/score-result.ts`
- `ScoreCalculator` (class) - `src/models/scoring/score-calculator.ts`

**Component objective:** 
Implement the complete scoring calculation system that orchestrates the strict order of score computation: base hand values → individual card bonuses → joker effects by priority → final multiplication. The system must generate detailed breakdowns for UI display and correctly apply all game mechanics including blind modifiers.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR7:** Score calculation according to formula: chips × mult
- Acceptance: Final score = totalChips × totalMult
- Acceptance: All intermediate calculations tracked

**FR8:** Strict scoring calculation order
- Acceptance: Steps applied in exact sequence
- Acceptance: Jokers applied by priority (CHIPS → MULT → MULTIPLIER)

**FR16:** Detection and application of synergies
- Acceptance: Multiple jokers trigger on same card
- Acceptance: All applicable effects stack correctly

**FR30:** Score preview (showing chips, mult, total before playing hand)
- Acceptance: Preview calculation matches actual calculation
- Acceptance: Preview available before committing hand

**Section 8.3: Score Calculation Order (Detailed)**

**Complete scoring algorithm:**

**Step 1: Poker hand base values**
- Base chips and mult are identified according to the played hand type
- Apply planet upgrades to base values

**Step 2: Individual card evaluation**
- For each played card (left to right):
  - Individual card chips are added (card.getBaseChips())
  - Jokers acting "per played card" are evaluated (e.g., Greedy Joker +3 mult if Diamond)
  - Tarot improvement effects on the card are applied (e.g., The Empress +4 mult)

**Step 3: Persistent joker effects**
- **Priority 1 (CHIPS):** Jokers that increase total chips (e.g., Blue Joker, Odd Todd)
- **Priority 2 (MULT):** Jokers that increase total mult (e.g., Joker, Half Joker, Mystic Summit)
- **Priority 3 (MULTIPLIER):** Jokers that multiply total mult (e.g., Triboulet, Joker Stencil)
- **Priority 4:** Other special effects (if any)

**Step 4: Final calculation**
- Score = Total Chips × Total Mult

**Synergy Example: K♠ with Triboulet + Wrathful Joker**
- Played cards: K♠ (in a Pair hand)
- Calculation:
  1. Base: Pair = 10 chips × 2 mult
  2. Individual card: K♠ = +10 chips
  3. Wrathful Joker synergy: K is Spades → +3 mult
  4. Triboulet: K played → total mult ×2
  5. Result: (10 + 10) chips × (2 + 3) mult = 20 × 5 = 100 points
  6. Apply Triboulet: 100 × 2 = **200 final points**

**Section 8.7: Boss Blinds and Restrictions**

**Boss modifications affecting score:**
- **The Flint:** Base chips and mult of all hands are halved (applied in Step 1)
- **The Wall:** Goal ×4 (doesn't affect score calculation directly)
- **The Needle:** Goal ×0.5 (doesn't affect score calculation directly)
- **The Water:** No score impact (0 discards)
- **The Mouth:** No score impact (hand type restriction)

## Key Acceptance Criteria:

**ScoreContext Class:**
- Must hold intermediate state during calculation
- Must track chips and mult as they accumulate
- Must store playedCards array for reference
- Must store handType for joker conditions
- Must store remainingDeckSize for jokers like Blue Joker
- Must provide addChips, addMult, multiplyMult methods
- Must validate non-negative values
- Must throw error on negative amounts

**ScoreBreakdown Class:**
- Must record individual contributions to score
- Must store source name (e.g., "Base Hand", "Greedy Joker", "K♠")
- Must store chipsAdded and multAdded separately
- Must provide human-readable description
- Must support UI display of breakdown

**ScoreResult Class:**
- Must encapsulate complete calculation result
- Must store totalScore (final chips × mult)
- Must store final chips and mult values
- Must store array of ScoreBreakdown entries
- Must validate non-negative values
- Must provide method to add breakdown entries

**ScoreCalculator Class:**
- Must orchestrate complete scoring process
- Must use HandEvaluator to determine hand type
- Must use HandUpgradeManager to get upgraded base values
- Must enforce strict calculation order
- Must apply blind modifiers when present
- Must generate detailed breakdown for each step
- Must handle empty jokers array (no joker effects)
- Must handle synergies (multiple jokers on same card)
- Must log all significant operations
- Must throw errors for invalid inputs

## Edge Cases to Handle:

**ScoreCalculator:**
- Calculating with 0 jokers (only base values and cards)
- Calculating with only multiplier jokers (no additions first)
- Calculating with mult = 0 (results in 0 score)
- Card with multiple bonuses (Emperor + Empress on same card)
- Multiple jokers triggering on same card (synergy)
- Joker condition never met (not activated, no breakdown entry)
- Boss blind modifier (The Flint halves base values)
- Empty cards array (throw error)
- More than 5 cards (throw error)
- Negative remainingDeckSize (throw error)
- Null HandEvaluator or HandUpgradeManager (throw error)

**ScoreContext:**
- addChips with negative value (throw error)
- addMult with negative value (throw error)
- multiplyMult with value < 1 (throw error)
- multiplyMult with 0 (results in 0 mult, valid but warn)

**ScoreBreakdown:**
- Source or description empty (throw error)
- Both chips and mult = 0 (valid, no contribution)

**ScoreResult:**
- totalScore calculation overflow (unlikely but handle)
- Empty breakdown array (valid for simple calculations)

---

# CLASS DIAGRAM

```
class ScoreCalculator {
    -evaluator: HandEvaluator
    -upgradeManager: HandUpgradeManager
    
    +constructor(evaluator: HandEvaluator, upgradeManager: HandUpgradeManager)
    +calculateScore(cards: Card[], jokers: Joker[], remainingDeckSize: number, blindModifier?: BlindModifier): ScoreResult
    -applyBaseValues(handResult: HandResult, blindModifier?: BlindModifier): ScoreContext
    -applyCardBonuses(context: ScoreContext, cards: Card[], jokers: Joker[]): void
    -applyJokerEffects(context: ScoreContext, jokers: Joker[]): void
    -calculateFinalScore(context: ScoreContext): number
}

class ScoreContext {
    +chips: number
    +mult: number
    +playedCards: Card[]
    +handType: HandType
    +remainingDeckSize: number
    
    +constructor(chips: number, mult: number, playedCards: Card[], handType: HandType, remainingDeckSize: number)
    +addChips(amount: number): void
    +addMult(amount: number): void
    +multiplyMult(multiplier: number): void
}

class ScoreResult {
    +totalScore: number
    +chips: number
    +mult: number
    +breakdown: ScoreBreakdown[]
    
    +constructor(totalScore: number, chips: number, mult: number, breakdown: ScoreBreakdown[])
    +addBreakdown(breakdown: ScoreBreakdown): void
}

class ScoreBreakdown {
    +source: string
    +chipsAdded: number
    +multAdded: number
    +description: string
    
    +constructor(source: string, chipsAdded: number, multAdded: number, description: string)
}

ScoreCalculator --> HandEvaluator : uses
ScoreCalculator --> HandUpgradeManager : uses
ScoreCalculator --> ScoreResult : returns
ScoreCalculator --> ScoreContext : uses
ScoreCalculator --> Joker : processes
ScoreCalculator --> BlindModifier : applies
ScoreResult --> ScoreBreakdown : contains
ScoreContext --> Card : references
ScoreContext --> HandType : has
```

---

# CODE TO REVIEW

- `score-context.ts` - ScoreContext class
- `score-breakdown.ts` - ScoreBreakdown class
- `score-result.ts` - ScoreResult class
- `score-calculator.ts` - ScoreCalculator class

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation respect the class diagram structure?
- [ ] ScoreCalculator has evaluator and upgradeManager dependencies
- [ ] ScoreContext has all required properties (chips, mult, playedCards, handType, remainingDeckSize)
- [ ] ScoreResult contains breakdown array
- [ ] ScoreBreakdown has all 4 properties (source, chipsAdded, multAdded, description)
- [ ] All methods from diagram are implemented
- [ ] Private methods are actually private
- [ ] Dependencies injected via constructor
- [ ] No circular dependencies

**Specific checks for this module:**
- [ ] ScoreCalculator has 4 private helper methods
- [ ] applyBaseValues creates initial ScoreContext
- [ ] applyCardBonuses modifies context by reference
- [ ] applyJokerEffects modifies context by reference
- [ ] calculateFinalScore returns final computed score
- [ ] ScoreContext methods modify internal state
- [ ] ScoreResult is immutable after creation
- [ ] ScoreBreakdown is immutable after creation

**Calculation flow integrity:**
- [ ] Steps executed in correct order
- [ ] Each step properly isolated
- [ ] Context passed between steps correctly
- [ ] Breakdown entries added at each step

**Score:** __/10

**Observations:**
[Document any deviations from the class diagram]

---

## 2. CODE QUALITY (Weight: 25%)

### Complexity Analysis:

**Check each method for cyclomatic complexity (target: ≤10):**

**ScoreCalculator:**
- [ ] constructor
- [ ] calculateScore (orchestration method - may be complex)
- [ ] applyBaseValues
- [ ] applyCardBonuses (watch for nested loops)
- [ ] applyJokerEffects (watch for priority sorting and loops)
- [ ] calculateFinalScore

**ScoreContext:**
- [ ] constructor
- [ ] addChips
- [ ] addMult
- [ ] multiplyMult

**ScoreResult:**
- [ ] constructor
- [ ] addBreakdown

**ScoreBreakdown:**
- [ ] constructor

**Methods exceeding complexity threshold:**
[List any methods with complexity >10, especially applyCardBonuses and applyJokerEffects]

### Coupling Analysis:

**Fan-out (dependencies):**
- ScoreCalculator depends on: HandEvaluator, HandUpgradeManager, Joker, Card, BlindModifier, ScoreContext, ScoreResult, ScoreBreakdown, HandType
- ScoreContext depends on: Card, HandType
- ScoreResult depends on: ScoreBreakdown
- ScoreBreakdown depends on: None
- **Expected fan-out:** High for ScoreCalculator (central orchestrator), low for others

**Fan-in (dependents):**
- ScoreCalculator used by: GameController, GameState
- ScoreContext used by: ScoreCalculator, Joker subclasses
- ScoreResult used by: GameController, GameState, UI components
- ScoreBreakdown used by: ScoreResult, UI components
- **Expected fan-in:** Moderate-High

**Coupling issues:**
[Document any unexpected dependencies or tight coupling]

### Cohesion Analysis:

**ScoreCalculator cohesion:**
- [ ] All methods relate to score calculation
- [ ] No game state management
- [ ] No UI logic
- [ ] Single responsibility: Calculate scores

**ScoreContext cohesion:**
- [ ] All methods relate to tracking intermediate state
- [ ] No calculation logic
- [ ] Single responsibility: Hold context

**Cohesion issues:**
[Document any methods that don't belong to their class]

### Code Smells Detection:

**Long Method (>50 lines):**
- [ ] Check calculateScore orchestration
- [ ] Check applyCardBonuses implementation
- [ ] Check applyJokerEffects implementation

**Large Class (>200 lines or >10 methods):**
- [ ] ScoreCalculator size (expected to be large, ~150-250 lines)

**Feature Envy:**
- [ ] ScoreCalculator accessing too much Joker internals?
- [ ] Context methods using too much external data?

**Code Duplication:**
- [ ] Repeated validation logic
- [ ] Repeated breakdown creation pattern
- [ ] Repeated error messages

**Magic Numbers:**
- [ ] Hard-coded priority values (should use JokerPriority enum)
- [ ] Hard-coded multipliers (should be documented)

**Long Parameter List:**
- [ ] calculateScore has 4 parameters (acceptable, last is optional)
- [ ] Consider parameter object if more added

**Primitive Obsession:**
- [ ] Using proper classes (ScoreContext, not raw object)
- [ ] Using enums (JokerPriority, HandType)

**Score:** __/10

**Detected code smells:**
[List specific code smells with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**ScoreContext Class:**
- [ ] Constructor accepts chips, mult, playedCards, handType, remainingDeckSize
- [ ] Validates chips >= 0
- [ ] Validates mult >= 0
- [ ] Validates playedCards non-empty
- [ ] Validates remainingDeckSize >= 0
- [ ] addChips increases chips by amount
- [ ] addChips throws error on negative amount
- [ ] addMult increases mult by amount
- [ ] addMult throws error on negative amount
- [ ] multiplyMult multiplies mult by multiplier
- [ ] multiplyMult throws error on multiplier < 1
- [ ] All properties publicly accessible

**ScoreBreakdown Class:**
- [ ] Constructor accepts source, chipsAdded, multAdded, description
- [ ] Validates source non-empty
- [ ] Validates description non-empty
- [ ] Allows chipsAdded = 0 (valid)
- [ ] Allows multAdded = 0 (valid)
- [ ] Properties are readable
- [ ] Immutable after creation

**ScoreResult Class:**
- [ ] Constructor accepts totalScore, chips, mult, breakdown
- [ ] Validates totalScore >= 0
- [ ] Validates chips >= 0
- [ ] Validates mult >= 0
- [ ] Validates breakdown is array
- [ ] addBreakdown appends to breakdown array
- [ ] addBreakdown validates non-null breakdown
- [ ] Properties are readable

**ScoreCalculator Class:**
- [ ] Constructor accepts HandEvaluator and HandUpgradeManager
- [ ] Validates evaluator non-null
- [ ] Validates upgradeManager non-null
- [ ] calculateScore validates cards array (1-5 cards)
- [ ] calculateScore validates jokers array (not null)
- [ ] calculateScore validates remainingDeckSize >= 0
- [ ] calculateScore accepts optional BlindModifier

### Scoring Algorithm Verification:

**Step 1: Base values**
- [ ] Evaluates hand type using HandEvaluator
- [ ] Gets upgraded values from HandUpgradeManager
- [ ] Applies blind modifier if present (e.g., The Flint ÷ 2)
- [ ] Creates initial ScoreContext
- [ ] Adds breakdown entry for base hand

**Step 2: Card bonuses**
- [ ] Iterates through played cards left to right
- [ ] Adds card.getBaseChips() to context.chips
- [ ] Adds card.multBonus to context.mult
- [ ] Checks each joker for per-card conditions
- [ ] Adds breakdown entry for each card
- [ ] Handles cards with no bonuses (no error)
- [ ] Handles multiple jokers triggering on same card (synergy)

**Step 3: Joker effects**
- [ ] Sorts jokers by priority (CHIPS → MULT → MULTIPLIER)
- [ ] Priority 1 (CHIPS): Calls applyEffect, joker adds chips
- [ ] Priority 2 (MULT): Calls applyEffect, joker adds mult
- [ ] Priority 3 (MULTIPLIER): Calls applyEffect, joker multiplies mult
- [ ] Only activates jokers where canActivate returns true
- [ ] Adds breakdown entry for each activated joker
- [ ] Skips jokers that don't activate (no breakdown entry)
- [ ] Preserves order within same priority

**Step 4: Final calculation**
- [ ] Calculates totalScore = context.chips × context.mult
- [ ] Creates ScoreResult with totalScore, chips, mult, breakdown
- [ ] Returns ScoreResult

### Specific Test Cases:

**Basic calculation (no jokers):**
- Input: Pair (K♠, K♦), no jokers, no bonuses
- Expected: Base (10 chips × 2 mult) + cards (10 + 10 chips) = 30 × 2 = 60 points
- [ ] Verified

**With joker (fixed mult):**
- Input: Pair (K♠, K♦), Joker (+4 mult)
- Expected: (10 + 10 + 10) × (2 + 4) = 30 × 6 = 180 points
- [ ] Verified

**With synergy (multiple jokers on same card):**
- Input: Pair (K♠, K♦), Wrathful Joker (+3 mult per Spade), Triboulet (×2 mult per K/Q)
- Expected: (10 + 10 + 10) × (2 + 3) × 2 = 30 × 5 × 2 = 300 points
- [ ] Verified

**With boss modifier (The Flint):**
- Input: Pair, The Flint (÷ 2 base values)
- Expected: Base (5 chips × 1 mult) + cards = different result
- [ ] Verified

**With permanent bonuses:**
- Input: Card with +20 chips (Emperor) and +4 mult (Empress)
- Expected: Bonuses properly added in Step 2
- [ ] Verified

### Edge Cases Handling:

- [ ] 0 jokers (only base and card bonuses)
- [ ] Only multiplier jokers (no additions)
- [ ] Mult = 0 scenario (score = 0, valid)
- [ ] Card with Emperor + Empress (both bonuses applied)
- [ ] Multiple jokers same card (all trigger, breakdown shows all)
- [ ] Joker condition never met (not activated, no breakdown)
- [ ] Boss blind modifier applied correctly
- [ ] Empty cards array (throws descriptive error)
- [ ] More than 5 cards (throws descriptive error)
- [ ] Negative remainingDeckSize (throws descriptive error)
- [ ] Null evaluator or manager (throws descriptive error)

### Exception Management:

- [ ] Clear error messages
- [ ] Errors include context (card count, chips/mult values)
- [ ] No silent failures
- [ ] Validation errors thrown before calculation starts

**Score:** __/10

**Unmet requirements:**
[List any requirements not properly implemented, especially calculation order violations]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Naming Analysis:

**Descriptive names:**
- [ ] Class names clear (ScoreCalculator, ScoreContext, ScoreResult)
- [ ] Method names descriptive (calculateScore, applyBaseValues, applyCardBonuses)
- [ ] Variable names meaningful (totalScore, breakdown, not x, result)
- [ ] Helper method names clear (applyJokerEffects, calculateFinalScore)

**Consistency:**
- [ ] All apply methods follow same pattern
- [ ] Context modification methods use add/multiply verbs
- [ ] Breakdown properties consistently named
- [ ] Error message format consistent

### Documentation Analysis:

**TSDoc comments:**
- [ ] All public classes documented
- [ ] All public methods documented
- [ ] Complex algorithm steps documented
- [ ] Parameters documented with types and purpose
- [ ] Return values documented
- [ ] Exceptions documented with conditions

**Algorithm documentation:**
- [ ] Strict calculation order explained
- [ ] Priority system documented
- [ ] Synergy behavior documented
- [ ] Blind modifier application explained
- [ ] Each step in calculation explained

**Code comments:**
- [ ] Complex loops explained (card iteration, joker sorting)
- [ ] Priority sorting logic commented
- [ ] Breakdown creation pattern documented
- [ ] Edge case handling noted
- [ ] No obvious/redundant comments

**Self-documenting code:**
- [ ] Method names explain calculation steps
- [ ] Variable names explain intermediate values
- [ ] Clear separation between steps

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### SOLID Principles:

**Single Responsibility:**
- [ ] ScoreCalculator: Only calculates scores
- [ ] ScoreContext: Only holds intermediate state
- [ ] ScoreResult: Only encapsulates result
- [ ] ScoreBreakdown: Only records contribution
- [ ] No UI logic in scoring classes
- [ ] No game state management

**Open/Closed:**
- [ ] Can add new joker priorities without modifying calculator
- [ ] Can extend breakdown information without breaking existing code
- [ ] Private methods protect calculation logic

**Liskov Substitution:** N/A (no inheritance)

**Interface Segregation:** N/A (concrete classes)

**Dependency Inversion:**
- [ ] Depends on HandEvaluator abstraction
- [ ] Depends on Joker interface, not concrete types
- [ ] Uses JokerPriority enum, not hard-coded values

### DRY Principle:

- [ ] No duplicate validation logic
- [ ] Breakdown creation pattern consistent
- [ ] Context modification methods reused
- [ ] Error message format standardized

### KISS Principle:

- [ ] Calculation flow straightforward
- [ ] Each step does one thing
- [ ] No over-complicated logic
- [ ] Clear method responsibilities

### Input Validation:

- [ ] All constructor parameters validated
- [ ] Card array length validated (1-5)
- [ ] Numeric values validated (non-negative)
- [ ] Null checks for objects
- [ ] Array validity checked

### Logging:

- [ ] Critical operations logged (score calculation start/end)
- [ ] Each step logged with intermediate values
- [ ] Joker activations logged
- [ ] Final score logged
- [ ] Errors logged with context

**Score:** __/10

---

# DELIVERABLES

## Review Report:

**Total Score:** __/10 (weighted average)

**Calculation:**
- Design Adherence (30%): [score] × 0.30 = __
- Code Quality (25%): [score] × 0.25 = __
- Requirements Compliance (25%): [score] × 0.25 = __
- Maintainability (10%): [score] × 0.10 = __
- Best Practices (10%): [score] × 0.10 = __
- **TOTAL: __/10**

---

## Executive Summary:

[Provide 2-3 lines about the general state of the Scoring System. Example: "The scoring system correctly implements the strict calculation order with proper priority enforcement. ScoreContext effectively tracks intermediate state, and ScoreBreakdown provides detailed UI information. Minor improvements needed in edge case validation and algorithm documentation."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Joker Priority Not Sorted"]
- **Location:** Lines [X-Y] in score-calculator.ts
- **Impact:** Jokers applied in wrong order, breaking game mechanics
- **Proposed solution:** Sort jokers by getPriority() before applying in applyJokerEffects

### Issue 2: [Title - e.g., "Synergy Not Detected"]
- **Location:** Lines [X-Y] in score-calculator.ts
- **Impact:** Multiple jokers on same card don't stack correctly
- **Proposed solution:** Ensure all jokers checked for each card in applyCardBonuses

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Insufficient Logging"]
- **Location:** Throughout score-calculator.ts
- **Suggestion:** Add log statements for each calculation step with intermediate values

### Issue 2: [Title - e.g., "Breakdown Description Generic"]
- **Location:** Lines [X-Y] in score-calculator.ts
- **Suggestion:** Make breakdown descriptions more descriptive (e.g., "K♠ +10 chips" instead of "Card bonus")

---

## Positive Aspects:

- [e.g., "Clean separation of concerns across 4 classes"]
- [e.g., "ScoreContext provides clear interface for state modification"]
- [e.g., "Breakdown system enables detailed UI feedback"]
- [e.g., "Calculation order strictly enforced"]
- [e.g., "Proper validation prevents invalid calculations"]
- [e.g., "Joker priority system correctly implemented"]

---

## Recommended Refactorings:

### Refactoring 1: Extract Breakdown Creation

**BEFORE:**
```typescript
// Repeated pattern throughout calculateScore
const breakdown = new ScoreBreakdown(
  'source',
  chipsAdded,
  multAdded,
  'description'
);
result.addBreakdown(breakdown);
```

**AFTER (proposal):**
```typescript
private createAndAddBreakdown(
  result: ScoreResult,
  source: string,
  chipsAdded: number,
  multAdded: number,
  description: string
): void {
  const breakdown = new ScoreBreakdown(source, chipsAdded, multAdded, description);
  result.addBreakdown(breakdown);
}

// Usage
this.createAndAddBreakdown(result, 'Base Hand', baseChips, baseMult, `${handType} base values`);
```

**Rationale:** Reduces duplication and centralizes breakdown creation pattern

---

### Refactoring 2: Extract Priority Grouping

**BEFORE:**
```typescript
// Complex joker sorting and grouping logic inline
const sortedJokers = jokers.sort((a, b) => a.getPriority() - b.getPriority());
for (const joker of sortedJokers) {
  // ... apply logic
}
```

**AFTER (proposal):**
```typescript
private groupJokersByPriority(jokers: Joker[]): Map<JokerPriority, Joker[]> {
  const grouped = new Map<JokerPriority, Joker[]>();
  for (const joker of jokers) {
    const priority = joker.getPriority();
    if (!grouped.has(priority)) {
      grouped.set(priority, []);
    }
    grouped.get(priority)!.push(joker);
  }
  return grouped;
}

// Usage in applyJokerEffects
const jokerGroups = this.groupJokersByPriority(jokers);
for (const priority of [JokerPriority.CHIPS, JokerPriority.MULT, JokerPriority.MULTIPLIER]) {
  const jokersAtPriority = jokerGroups.get(priority) || [];
  for (const joker of jokersAtPriority) {
    // ... apply logic
  }
}
```

**Rationale:** Makes priority application more explicit and easier to extend

---

### Refactoring 3: [Title]

**BEFORE:**
```typescript
// [problematic code snippet]
```

**AFTER (proposal):**
```typescript
// [improved code snippet]
```

**Rationale:** [Why this improves the code]

---

## Decision:

Select one:

- [ ] ✅ **APPROVED** - Ready for integration
  - Calculation order correct
  - All steps implemented properly
  - Breakdown system works
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core calculation works
  - Minor edge cases need attention
  - Documentation improvements needed
  - Technical debt tracked

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Calculation order broken
  - Priority system not enforced
  - Synergies not working
  - Must fix before game integration
