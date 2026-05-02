# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Poker Hand System

**Components under review:**
- `HandType` (enum) - `src/models/poker/hand-type.enum.ts`
- `HandUpgrade` (class) - `src/models/poker/hand-upgrade.ts`
- `HandResult` (class) - `src/models/poker/hand-result.ts`
- `HandEvaluator` (class) - `src/models/poker/hand-evaluator.ts`
- `HandUpgradeManager` (class) - `src/models/poker/hand-upgrade-manager.ts`

**Component objective:** 
Implement poker hand recognition and evaluation system. This includes detecting the best possible poker hand from 1-5 cards, managing permanent upgrades from planet cards, and providing base chips/mult values for scoring. The system must correctly implement poker hand hierarchy and support cumulative upgrades.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR3:** Automatic recognition of poker hand type
- Acceptance: System correctly identifies all 9 hand types from selected cards
- Acceptance: Prioritizes highest-ranking hand when multiple possible

**FR13:** Application of planet card effects (permanent hand upgrades)
- Acceptance: Planet bonuses permanently increase base chips/mult for specific hand types
- Acceptance: Multiple planets of same type accumulate bonuses

**Section 8.1: Poker Hands System**

**Recognized hand types and base values:**

| Poker Hand | Base Chips | Base Mult |
|------------|------------|-----------|
| High Card | 5 | 1 |
| Pair | 10 | 2 |
| Two Pair | 20 | 2 |
| Three of a Kind | 30 | 3 |
| Straight | 30 | 4 |
| Flush | 35 | 4 |
| Full House | 40 | 4 |
| Four of a Kind | 60 | 7 |
| Straight Flush | 100 | 8 |

**Recognition hierarchy:** 
The system detects the best possible hand with selected cards, prioritizing from highest to lowest: 
Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > Pair > High Card

**Section 8.4: Planet Cards and Permanent Upgrades**

| Planet Card | Improved Hand Type | Additional Chips | Additional Mult |
|-------------|-------------------|------------------|-----------------|
| Pluto | High Card | +10 | +1 |
| Mercury | Pair | +15 | +1 |
| Uranus | Two Pair | +20 | +1 |
| Venus | Three of a Kind | +20 | +2 |
| Saturn | Straight | +30 | +3 |
| Jupiter | Flush | +15 | +2 |
| Earth | Full House | +25 | +2 |
| Mars | Four of a Kind | +30 | +3 |
| Neptune | Straight Flush | +40 | +4 |

**Operation:** When buying a planet card, the increment to that hand type's base values is immediately and permanently applied for the rest of the game.

## Key Acceptance Criteria:

**HandType Enum:**
- Must define all 9 hand types in priority order
- Must provide display name method ("Straight Flush", "Four of a Kind", etc.)
- Must provide base chips/mult values lookup

**HandUpgrade Class:**
- Must store additional chips and mult bonuses
- Must support cumulative upgrades (multiple planets)
- Must validate non-negative bonuses
- Must provide method to add more upgrades

**HandResult Class:**
- Must encapsulate hand type, cards, base chips, and base mult
- Must validate non-empty cards array
- Must validate positive base values
- Must provide read-only access to properties

**HandEvaluator Class:**
- Must correctly detect all 9 poker hand types
- Must prioritize hands correctly (highest first)
- Must work with 1-5 cards
- Must handle Ace as both high (K-A) and low (A-2-3-4-5) for straights
- Must apply HandUpgradeManager bonuses to base values
- Must not modify input card array

**HandUpgradeManager Class:**
- Must track upgrades for all 9 hand types
- Must initialize with zero upgrades
- Must apply planet bonuses cumulatively
- Must support game reset
- Must never return null upgrades

## Edge Cases to Handle:

**HandEvaluator:**
- Evaluating 1 card (always High Card)
- Evaluating 5 cards (all hands possible)
- Ace-low straight (A-2-3-4-5)
- Ace-high straight (10-J-Q-K-A)
- Multiple possible hands (return highest)
- Cards in random order (must detect patterns)
- Empty card array (throw error)
- More than 5 cards (throw error)

**HandUpgradeManager:**
- Multiple planets of same type (bonuses accumulate)
- Zero upgrades applied (return base values)
- Invalid hand type (throw error)
- Negative bonuses (throw error)

**HandUpgrade:**
- Adding negative upgrades (throw error)
- Zero upgrades (valid)
- Large accumulated bonuses (handle correctly)

---

# CLASS DIAGRAM

```
class HandEvaluator {
    -handRankings: HandType[]
    
    +evaluateHand(cards: Card[], upgradeManager: HandUpgradeManager): HandResult
    +getHandType(cards: Card[]): HandType
    -checkStraightFlush(cards: Card[]): boolean
    -checkFourOfAKind(cards: Card[]): boolean
    -checkFullHouse(cards: Card[]): boolean
    -checkFlush(cards: Card[]): boolean
    -checkStraight(cards: Card[]): boolean
    -checkThreeOfAKind(cards: Card[]): boolean
    -checkTwoPair(cards: Card[]): boolean
    -checkPair(cards: Card[]): boolean
}

class HandResult {
    +handType: HandType
    +cards: Card[]
    +baseChips: number
    +baseMult: number
}

class HandType {
    <<enumeration>>
    STRAIGHT_FLUSH
    FOUR_OF_A_KIND
    FULL_HOUSE
    FLUSH
    STRAIGHT
    THREE_OF_A_KIND
    TWO_PAIR
    PAIR
    HIGH_CARD
}

class HandUpgradeManager {
    -upgrades: Map<HandType, HandUpgrade>
    
    +applyPlanetUpgrade(handType: HandType, chips: number, mult: number): void
    +getUpgradedValues(handType: HandType): HandUpgrade
    +reset(): void
}

class HandUpgrade {
    +additionalChips: number
    +additionalMult: number
    
    +addUpgrade(chips: number, mult: number): void
}

HandEvaluator --> HandResult : returns
HandEvaluator --> HandType : evaluates
HandResult --> HandType : has
HandResult --> Card : references
HandUpgradeManager --> HandUpgrade : manages
HandUpgradeManager --> HandType : keys by
```

---

# CODE TO REVIEW

- `hand-type.enum.ts` - Enum with 9 poker hand types
- `hand-upgrade.ts` - HandUpgrade class for permanent bonuses
- `hand-result.ts` - HandResult class encapsulating evaluation results
- `hand-evaluator.ts` - HandEvaluator class for poker hand detection
- `hand-upgrade-manager.ts` - HandUpgradeManager class for planet

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation respect the class diagram structure?
- [ ] Are all properties defined as specified (private/public)?
- [ ] Are all methods from the diagram implemented?
- [ ] HandEvaluator has handRankings array
- [ ] HandUpgradeManager uses Map<HandType, HandUpgrade>
- [ ] HandResult properties are public/readonly as specified
- [ ] All check methods in HandEvaluator are private
- [ ] Dependency direction correct (HandEvaluator → HandResult → HandType)

**Specific checks for this module:**
- [ ] HandType enum has exactly 9 values in priority order
- [ ] HandEvaluator has 8 private check methods (one per non-high-card hand)
- [ ] HandUpgradeManager initializes upgrades for all 9 hand types
- [ ] HandResult constructor validates inputs
- [ ] HandUpgrade has public additionalChips and additionalMult
- [ ] No circular dependencies

**Poker hand detection algorithms:**
- [ ] Each check method correctly identifies its hand type
- [ ] Algorithms are efficient (no unnecessary iterations)
- [ ] Methods check card count requirements

**Score:** __/10

**Observations:**
[Document any deviations from the class diagram]

---

## 2. CODE QUALITY (Weight: 25%)

### Complexity Analysis:

**Check each method for cyclomatic complexity (target: ≤10):**

**HandEvaluator:**
- [ ] constructor
- [ ] evaluateHand
- [ ] getHandType
- [ ] checkStraightFlush
- [ ] checkFourOfAKind
- [ ] checkFullHouse
- [ ] checkFlush
- [ ] checkStraight (watch for Ace-low/high logic)
- [ ] checkThreeOfAKind
- [ ] checkTwoPair
- [ ] checkPair

**HandUpgradeManager:**
- [ ] constructor
- [ ] applyPlanetUpgrade
- [ ] getUpgradedValues
- [ ] reset

**HandUpgrade:**
- [ ] constructor
- [ ] addUpgrade

**HandResult:**
- [ ] constructor

**Methods exceeding complexity threshold:**
[List any methods with complexity >10, especially checkStraight]

### Coupling Analysis:

**Fan-out (dependencies):**
- HandEvaluator depends on: Card, CardValue, Suit, HandType, HandResult, HandUpgradeManager, HandUpgrade
- HandUpgradeManager depends on: HandType, HandUpgrade
- HandResult depends on: HandType, Card
- HandUpgrade depends on: None
- **Expected fan-out:** Moderate (HandEvaluator has highest)

**Fan-in (dependents):**
- HandType used by: All classes in this module, ScoreCalculator (later), GameState (later)
- HandEvaluator used by: ScoreCalculator (later), GameController (later)
- HandUpgradeManager used by: GameState (later), ScoreCalculator (later)
- **Expected fan-in:** Moderate-High

**Coupling issues:**
[Document any unexpected dependencies or tight coupling]

### Cohesion Analysis:

**HandEvaluator cohesion:**
- [ ] All methods relate to poker hand detection
- [ ] No scoring logic (delegated to ScoreCalculator)
- [ ] No game state management
- [ ] Single responsibility: Identify poker hands

**HandUpgradeManager cohesion:**
- [ ] All methods relate to upgrade tracking
- [ ] No hand detection logic
- [ ] Single responsibility: Manage planet upgrades

**Cohesion issues:**
[Document any methods that don't belong to their class]

### Code Smells Detection:

**Long Method (>50 lines):**
- [ ] Check HandEvaluator.evaluateHand
- [ ] Check HandEvaluator.checkStraight (complex Ace logic)
- [ ] Check HandEvaluator.checkFullHouse

**Large Class (>200 lines or >10 methods):**
- [ ] HandEvaluator size (expected to be large, ~150-200 lines)

**Feature Envy:**
- [ ] HandEvaluator accessing too much Card internal data?
- [ ] Check methods properly using Card public interface

**Code Duplication:**
- [ ] Repeated value counting logic across check methods
- [ ] Repeated card sorting logic
- [ ] Repeated validation patterns

**Magic Numbers:**
- [ ] Hard-coded hand counts (4 for four of a kind, 3 for three of a kind)
- [ ] Base chips/mult values should be in constants or config
- [ ] Card count requirements (5 for flush, straight, etc.)

**Data Clumps:**
- [ ] chips and mult always passed together (HandUpgrade handles this well)

**Score:** __/10

**Detected code smells:**
[List specific code smells with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**HandType Enum:**
- [ ] All 9 hand types defined
- [ ] Ordered from highest to lowest priority
- [ ] Helper function to get display name
- [ ] Helper function to get base chips/mult values
- [ ] Values match specification exactly

**HandUpgrade Class:**
- [ ] Constructor accepts chips and mult (default 0)
- [ ] additionalChips and additionalMult properties
- [ ] addUpgrade method validates non-negative
- [ ] addUpgrade throws error on negative values
- [ ] addUpgrade correctly accumulates bonuses

**HandResult Class:**
- [ ] Constructor accepts handType, cards, baseChips, baseMult
- [ ] Validates cards array non-empty
- [ ] Validates base values non-negative
- [ ] Properties are accessible (public or readonly)
- [ ] Immutable after creation

**HandEvaluator Class:**
- [ ] evaluateHand returns HandResult with correct type
- [ ] evaluateHand applies upgrade bonuses from manager
- [ ] getHandType returns correct HandType
- [ ] Works with 1 card (returns HIGH_CARD)
- [ ] Works with 2-5 cards
- [ ] checkStraightFlush detects 5 same-suit sequential cards
- [ ] checkFourOfAKind detects 4 same-value cards
- [ ] checkFullHouse detects 3 of one value + 2 of another
- [ ] checkFlush detects 5 same-suit cards
- [ ] checkStraight detects 5 sequential values
- [ ] checkStraight handles Ace-low (A-2-3-4-5)
- [ ] checkStraight handles Ace-high (10-J-Q-K-A)
- [ ] checkThreeOfAKind detects 3 same-value cards
- [ ] checkTwoPair detects 2 pairs of different values
- [ ] checkPair detects 2 same-value cards
- [ ] Prioritizes highest hand when multiple possible
- [ ] Throws error on empty array
- [ ] Throws error on >5 cards

**HandUpgradeManager Class:**
- [ ] Constructor initializes upgrades for all 9 hand types
- [ ] All upgrades start at 0
- [ ] applyPlanetUpgrade validates HandType
- [ ] applyPlanetUpgrade validates non-negative bonuses
- [ ] applyPlanetUpgrade accumulates bonuses correctly
- [ ] applyPlanetUpgrade throws error on invalid inputs
- [ ] getUpgradedValues returns HandUpgrade (never null)
- [ ] getUpgradedValues throws error on invalid HandType
- [ ] reset clears all upgrades back to 0

### Poker Hand Detection Accuracy:

**Test cases to verify:**
- [ ] High Card: [A♠, K♦, 9♣, 5♥, 2♠] → HIGH_CARD
- [ ] Pair: [K♠, K♦, 9♣, 5♥, 2♠] → PAIR
- [ ] Two Pair: [K♠, K♦, 9♣, 9♥, 2♠] → TWO_PAIR
- [ ] Three of a Kind: [K♠, K♦, K♣, 5♥, 2♠] → THREE_OF_A_KIND
- [ ] Straight: [5♠, 4♦, 3♣, 2♥, A♠] → STRAIGHT (Ace-low)
- [ ] Straight: [A♠, K♦, Q♣, J♥, 10♠] → STRAIGHT (Ace-high)
- [ ] Flush: [A♠, K♠, 9♠, 5♠, 2♠] → FLUSH
- [ ] Full House: [K♠, K♦, K♣, 9♥, 9♠] → FULL_HOUSE
- [ ] Four of a Kind: [K♠, K♦, K♣, K♥, 2♠] → FOUR_OF_A_KIND
- [ ] Straight Flush: [5♠, 4♠, 3♠, 2♠, A♠] → STRAIGHT_FLUSH

### Edge Cases Handling:

- [ ] 1 card always returns HIGH_CARD
- [ ] 2 cards can only be PAIR or HIGH_CARD
- [ ] Cards in random order still detected correctly
- [ ] Multiple planets accumulate (Pluto twice = +20 chips, +2 mult)
- [ ] Empty card array throws descriptive error
- [ ] >5 cards throws descriptive error
- [ ] Invalid HandType in manager throws descriptive error

### Exception Management:

- [ ] Clear error messages
- [ ] Errors include context (card count, hand type, etc.)
- [ ] No silent failures

**Score:** __/10

**Unmet requirements:**
[List any requirements not properly implemented, especially poker hand detection errors]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Naming Analysis:

**Descriptive names:**
- [ ] Class names clear (HandEvaluator, HandUpgrade, HandResult)
- [ ] Method names descriptive (evaluateHand, checkStraightFlush)
- [ ] Variable names meaningful (not temp, x, arr)
- [ ] HandType enum values clear (STRAIGHT_FLUSH, FOUR_OF_A_KIND)

**Consistency:**
- [ ] All check methods follow same pattern (checkXxx)
- [ ] All method names use camelCase
- [ ] Enum values use SCREAMING_SNAKE_CASE
- [ ] Boolean methods named appropriately (is/has/can pattern)

### Documentation Analysis:

**TSDoc comments:**
- [ ] All public classes have class-level documentation
- [ ] All public methods have method-level documentation
- [ ] Complex algorithms documented (poker hand detection)
- [ ] Parameters documented
- [ ] Return values documented
- [ ] Exceptions documented

**Algorithm documentation:**
- [ ] Straight detection logic explained (especially Ace handling)
- [ ] Full House detection logic clear
- [ ] Two Pair detection logic clear
- [ ] Priority evaluation logic documented

**Code comments:**
- [ ] Ace-low/Ace-high straight logic commented
- [ ] Value counting algorithms explained
- [ ] Edge case handling documented
- [ ] No obvious/redundant comments

**Self-documenting code:**
- [ ] Method names explain poker hand checks
- [ ] Helper methods with descriptive names
- [ ] Clear variable names for intermediate results

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### SOLID Principles:

**Single Responsibility:**
- [ ] HandEvaluator: Only evaluates poker hands
- [ ] HandUpgradeManager: Only manages upgrades
- [ ] HandUpgrade: Only stores upgrade data
- [ ] HandResult: Only encapsulates evaluation result
- [ ] HandType: Only defines hand types

**Open/Closed:**
- [ ] Can add new hand types via enum extension
- [ ] Check methods are private (protected from modification)
- [ ] HandUpgrade extensible for new bonus types

**Liskov Substitution:** N/A (no inheritance)

**Interface Segregation:** N/A (no interfaces)

**Dependency Inversion:**
- [ ] HandEvaluator depends on HandType abstraction
- [ ] Uses Card interface, not implementation details

### DRY Principle:

- [ ] No duplicate hand detection logic
- [ ] Value counting logic not repeated
- [ ] Validation code not duplicated
- [ ] Helper methods extract common operations

### KISS Principle:

- [ ] Poker hand algorithms straightforward
- [ ] No over-complicated logic
- [ ] Clear separation of concerns
- [ ] Each method does one thing

### Input Validation:

- [ ] Card array length validated
- [ ] HandType validity checked
- [ ] Bonus values validated (non-negative)
- [ ] Null/undefined checks where needed

### Algorithm Efficiency:

- [ ] Card sorting done once, not per check
- [ ] Early returns in check methods
- [ ] No unnecessary nested loops
- [ ] Map lookup in O(1) for upgrades

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

[Provide 2-3 lines about the general state of the Poker Hand System. Example: "The poker hand evaluation system correctly implements all 9 hand types with proper priority ordering. The HandUpgradeManager effectively tracks planet bonuses. Minor improvements needed in Ace-handling documentation and edge case validation."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Incorrect Straight Detection for Ace-Low"]
- **Location:** Lines [X-Y] in hand-evaluator.ts
- **Impact:** Ace-low straights (A-2-3-4-5) not detected, breaking game mechanic
- **Proposed solution:** Implement special case for Ace as value 1 in straight checking

### Issue 2: [Title]
- **Location:** Lines [X-Y] in [filename]
- **Impact:** [Description]
- **Proposed solution:** [How to fix]

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Magic Numbers in Hand Detection"]
- **Location:** Lines [X-Y] in hand-evaluator.ts
- **Suggestion:** Extract hard-coded values (4, 3, 2) to named constants

### Issue 2: [Title]
- **Location:** Line [X] in [filename]
- **Suggestion:** [What to change]

---

## Positive Aspects:

- [e.g., "Clear separation between hand detection and upgrade management"]
- [e.g., "Efficient use of Map for O(1) upgrade lookups"]
- [e.g., "Comprehensive hand detection with all 9 poker hands"]
- [e.g., "Proper error handling with descriptive messages"]

---

## Recommended Refactorings:

### Refactoring 1: Extract Value Counting Logic

**BEFORE:**
```typescript
// Repeated in multiple check methods
const valueCounts = new Map<CardValue, number>();
for (const card of cards) {
  valueCounts.set(card.value, (valueCounts.get(card.value) || 0) + 1);
}
```

**AFTER (proposal):**
```typescript
private countCardValues(cards: Card[]): Map<CardValue, number> {
  const valueCounts = new Map<CardValue, number>();
  for (const card of cards) {
    valueCounts.set(card.value, (valueCounts.get(card.value) || 0) + 1);
  }
  return valueCounts;
}

// Usage in check methods
const valueCounts = this.countCardValues(cards);
```

**Rationale:** Reduces code duplication and improves maintainability

---

### Refactoring 2: [Title]

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
  - All poker hands detected correctly
  - Upgrade system works as specified
  - No critical issues
  - Minor improvements optional

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core hand detection works
  - Minor edge cases need attention
  - Documentation improvements needed
  - Technical debt tracked

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical poker hand detection errors
  - Straight detection broken
  - Upgrade accumulation incorrect
  - Must fix before ScoreCalculator integration
