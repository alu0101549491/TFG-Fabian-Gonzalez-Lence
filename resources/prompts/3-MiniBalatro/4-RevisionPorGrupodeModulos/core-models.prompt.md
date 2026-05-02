# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Core Models (Foundation Layer)

**Components under review:**
- `CardValue` (enum) - `src/models/core/card-value.enum.ts`
- `Suit` (enum) - `src/models/core/suit.enum.ts`
- `Card` (class) - `src/models/core/card.ts`
- `Deck` (class) - `src/models/core/deck.ts`

**Component objective:** 
Provide the foundational data structures for the game, including the French 52-card deck representation, individual card management with permanent bonuses, suit and value enumerations, and deck operations (shuffle, draw, discard). These are pure domain models with no external dependencies.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR1:** Deal initial hand of 8 cards at the start of each level
- Acceptance: Deck can deal 8 cards reliably

**FR2:** Selection of up to 5 cards to play a poker hand
- Acceptance: Cards maintain unique identification for selection

**FR4:** Discard cards up to 3 times per level
- Acceptance: Deck supports card removal and replacement

**FR5:** Automatic replacement of discarded cards
- Acceptance: Deck can draw replacement cards

**Section 8.2: Individual Card Values**
Each card in the French deck has a base chip value:
- A (Ace): 11 chips
- K, Q, J: 10 chips each
- 10-2: Corresponding numerical value in chips

**Section 8.5: Tarot Cards Effects on Cards**
Cards must support:
- The Empress: +4 mult permanent bonus
- The Emperor: +20 chips permanent bonus
- Strength: Value increment in sequence (A→2, 2→3, ..., K→A)
- The Star/Moon/Sun/World: Suit changes
- The Hanged Man: Card destruction from deck
- Death: Card duplication in deck

## Key Acceptance Criteria:

**Card Class:**
- Must generate unique ID for each card instance
- Must store and apply permanent bonuses (chips and mult)
- Must support suit changes
- Must support value upgrades with wraparound (K→A)
- Must support cloning with new unique ID

**Deck Class:**
- Must initialize with exactly 52 unique cards (13 values × 4 suits)
- Must support shuffling (Fisher-Yates algorithm recommended)
- Must handle drawing 1-8 cards without errors
- Must prevent drawing more cards than available
- Must support adding cards (for Death tarot)
- Must support removing specific cards by ID (for Hanged Man tarot)
- Must maintain discard pile
- Must support deck reset for new games

**CardValue Enum:**
- Must define all 13 card values
- Must provide base chip value lookup
- Must support value sequencing for Strength tarot
- Must provide display string (A, K, Q, J, 10, ...)

**Suit Enum:**
- Must define all 4 suits
- Must provide suit symbols (♦, ♥, ♠, ♣)
- Must provide suit colors for UI (#ff6b6b for Diamonds, etc.)

## Edge Cases to Handle:

- Drawing cards when deck has fewer than requested (should throw error or reshuffle)
- Removing non-existent card ID (should throw descriptive error)
- Upgrading King value (should wrap to Ace)
- Cloning card preserves bonuses but generates new ID
- Adding negative bonuses (should throw error)
- Shuffling empty or nearly-empty deck (should work without error)

---

# CLASS DIAGRAM

```
class Card {
    -value: CardValue
    -suit: Suit
    -chipBonus: number
    -multBonus: number
    -id: string
    
    +constructor(value: CardValue, suit: Suit)
    +getBaseChips(): number
    +addPermanentBonus(chips: number, mult: number): void
    +changeSuit(newSuit: Suit): void
    +upgradeValue(): void
    +clone(): Card
}

class CardValue {
    <<enumeration>>
    ACE, KING, QUEEN, JACK, TEN, NINE, EIGHT, SEVEN, SIX, FIVE, FOUR, THREE, TWO
}

class Suit {
    <<enumeration>>
    DIAMONDS, HEARTS, SPADES, CLUBS
}

class Deck {
    -cards: Card[]
    -discardPile: Card[]
    
    +constructor()
    +shuffle(): void
    +drawCards(count: number): Card[]
    +addCard(card: Card): void
    +removeCard(cardId: string): void
    +getRemaining(): number
    +reset(): void
    -initializeStandardDeck(): void
}

Card --> CardValue : has
Card --> Suit : has
Deck --> Card : contains
```

---

# CODE TO REVIEW

- `card-value.enum.ts` - Enum with 13 card values (ACE to TWO)
- `suit.enum.ts` - Enum with 4 suits (DIAMONDS, HEARTS, SPADES, CLUBS)
- `card.ts` - Card class with bonuses and modifications
- `deck.ts` - Deck class managing 52 cards

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation respect the class diagram structure?
- [ ] Are all properties defined as specified (private/public)?
- [ ] Are all methods from the diagram implemented?
- [ ] Are the relationships correct (Card has CardValue and Suit)?
- [ ] Does Deck properly contain Card objects?
- [ ] Is dependency direction correct (no circular dependencies)?
- [ ] Are enums properly defined with all required values?

**Specific checks for this module:**
- [ ] CardValue enum has exactly 13 values
- [ ] Suit enum has exactly 4 values
- [ ] Card class has id, value, suit, chipBonus, multBonus properties
- [ ] Deck class has cards and discardPile arrays
- [ ] initializeStandardDeck is private as specified
- [ ] All public methods from diagram are present

**Score:** __/10

**Observations:**
[Document any deviations from the class diagram]

---

## 2. CODE QUALITY (Weight: 25%)

### Complexity Analysis:

**Check each method for cyclomatic complexity (target: ≤10):**
- [ ] Card.constructor
- [ ] Card.getBaseChips
- [ ] Card.addPermanentBonus
- [ ] Card.changeSuit
- [ ] Card.upgradeValue
- [ ] Card.clone
- [ ] Deck.constructor
- [ ] Deck.shuffle
- [ ] Deck.drawCards
- [ ] Deck.addCard
- [ ] Deck.removeCard
- [ ] Deck.getRemaining
- [ ] Deck.reset
- [ ] Deck.initializeStandardDeck

**Methods exceeding complexity threshold:**
[List any methods with complexity >10]

### Coupling Analysis:

**Fan-out (dependencies):**
- Card depends on: CardValue, Suit, uuid library
- Deck depends on: Card
- Expected fan-out: Low ✓

**Fan-in (dependents):**
- CardValue used by: Card, HandEvaluator (later), ScoreCalculator (later)
- Suit used by: Card, HandEvaluator (later)
- Card used by: Deck, GameState (later), all game components
- Deck used by: GameState (later)
- Expected fan-in: Moderate-High ✓

**Coupling issues:**
[Document any unexpected dependencies or tight coupling]

### Cohesion Analysis:

**Card class cohesion:**
- [ ] All methods relate to card data and behavior
- [ ] No methods handling external concerns (scoring, UI, etc.)
- [ ] Single responsibility: Represent a playing card

**Deck class cohesion:**
- [ ] All methods relate to deck management
- [ ] No methods handling game logic beyond deck operations
- [ ] Single responsibility: Manage collection of cards

**Cohesion issues:**
[Document any methods that don't belong to their class]

### Code Smells Detection:

**Long Method (>50 lines):**
- [ ] Check Deck.shuffle implementation
- [ ] Check Deck.initializeStandardDeck implementation
- [ ] Check Card.upgradeValue implementation

**Large Class (>200 lines or >10 methods):**
- [ ] Card class size
- [ ] Deck class size

**Feature Envy (method uses more data from another class):**
- [ ] Any Card methods accessing primarily external data?
- [ ] Any Deck methods better suited to Card class?

**Code Duplication:**
- [ ] Check for repeated validation logic
- [ ] Check for repeated error messages
- [ ] Check for repeated array operations

**Magic Numbers:**
- [ ] Card base values (11 for Ace, 10 for K/Q/J) should be in constants
- [ ] Deck size (52) should be documented
- [ ] Value sequence logic should be clear

**Score:** __/10

**Detected code smells:**
[List specific code smells with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**CardValue Enum:**
- [ ] All 13 values defined (ACE through TWO)
- [ ] Helper function to get base chip value
- [ ] Helper function to get next value in sequence (with K→A wrap)
- [ ] Helper function to get display string

**Suit Enum:**
- [ ] All 4 suits defined
- [ ] Helper function to get suit symbol
- [ ] Helper function to get suit color

**Card Class:**
- [ ] Constructor accepts value and suit
- [ ] Generates unique ID (UUID format)
- [ ] Initializes bonuses to 0
- [ ] getBaseChips returns value + chipBonus
- [ ] addPermanentBonus validates non-negative inputs
- [ ] addPermanentBonus throws error on negative values
- [ ] changeSuit updates suit property
- [ ] upgradeValue implements correct sequence with wrap
- [ ] clone creates new card with same properties but new ID

**Deck Class:**
- [ ] Constructor creates 52 cards
- [ ] Constructor shuffles deck
- [ ] Constructor initializes empty discard pile
- [ ] shuffle uses Fisher-Yates or equivalent
- [ ] drawCards returns correct number of cards
- [ ] drawCards removes cards from deck
- [ ] drawCards throws error if insufficient cards
- [ ] addCard adds to deck
- [ ] removeCard finds and removes by ID
- [ ] removeCard throws error if ID not found
- [ ] getRemaining returns cards.length
- [ ] reset creates new 52-card deck and shuffles
- [ ] initializeStandardDeck creates all 52 unique combinations

### Edge Cases Handling:

- [ ] Drawing 0 cards (should throw error or return empty array)
- [ ] Drawing more cards than available (throws descriptive error)
- [ ] Removing non-existent card ID (throws descriptive error)
- [ ] Upgrading King wraps to Ace correctly
- [ ] Cloning preserves chipBonus and multBonus
- [ ] Cloning generates new unique ID
- [ ] Adding negative bonuses throws error
- [ ] Shuffling empty deck doesn't crash

### Exception Management:

- [ ] Clear error messages for invalid operations
- [ ] Errors thrown with descriptive context
- [ ] No silent failures

**Score:** __/10

**Unmet requirements:**
[List any requirements not properly implemented]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Naming Analysis:

**Descriptive names:**
- [ ] Class names clear (Card, Deck, CardValue, Suit)
- [ ] Method names descriptive (getBaseChips, addPermanentBonus, upgradeValue)
- [ ] Variable names meaningful (chipBonus, discardPile, not x, tmp)
- [ ] Enum values clear (ACE, KING, DIAMONDS, HEARTS)

**Consistency:**
- [ ] camelCase for methods and variables
- [ ] PascalCase for classes and enums
- [ ] SCREAMING_SNAKE_CASE for enum values
- [ ] Consistent verb usage (get, add, remove, not retrieve, append, delete)

### Documentation Analysis:

**TSDoc comments:**
- [ ] All public classes have class-level comments
- [ ] All public methods have method-level comments
- [ ] Parameters documented with @param
- [ ] Return values documented with @returns
- [ ] Exceptions documented with @throws

**Code comments:**
- [ ] Complex algorithms explained (Fisher-Yates shuffle)
- [ ] Edge cases documented (K→A wrap)
- [ ] No obvious/redundant comments ("increment counter")
- [ ] Comments explain "why" not "what"

**Self-documenting code:**
- [ ] Method names explain purpose
- [ ] Variable names explain content
- [ ] Logic flow is clear without comments

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### SOLID Principles:

**Single Responsibility:**
- [ ] Card: Only manages card data and behavior ✓
- [ ] Deck: Only manages card collection ✓
- [ ] CardValue: Only defines card values ✓
- [ ] Suit: Only defines suits ✓

**Open/Closed:**
- [ ] Can add new card behaviors via bonuses without modifying Card class
- [ ] Enum structure allows extension if needed

**Liskov Substitution:** N/A (no inheritance)

**Interface Segregation:** N/A (no interfaces)

**Dependency Inversion:**
- [ ] Card depends on abstractions (enums) not concrete implementations ✓

### DRY Principle:

- [ ] No duplicate card initialization logic
- [ ] No duplicate validation code
- [ ] Shared logic extracted to helper methods

### KISS Principle:

- [ ] Shuffle algorithm is straightforward
- [ ] Card operations are simple and direct
- [ ] No over-engineering or unnecessary complexity

### Input Validation:

- [ ] Constructor parameters validated
- [ ] Method parameters validated before use
- [ ] Bounds checked (array access, counts)
- [ ] Null/undefined checks where needed

### Resource Management:

- [ ] Arrays properly managed
- [ ] No memory leaks (circular references)
- [ ] Proper cleanup in reset method

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

[Provide 2-3 lines about the general state of the Core Models implementation. Example: "The Core Models implementation provides a solid foundation for the game. The Card and Deck classes correctly implement the required functionality with proper encapsulation. Minor improvements needed in error handling and documentation."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title]
- **Location:** Lines [X-Y] in [filename]
- **Impact:** [Describe how this prevents the module from working correctly]
- **Proposed solution:** [Specific steps to fix]

### Issue 2: [Title]
- **Location:** Lines [X-Y] in [filename]
- **Impact:** [Description]
- **Proposed solution:** [How to fix]

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title]
- **Location:** Line [X] in [filename]
- **Suggestion:** [What to change and why]

### Issue 2: [Title]
- **Location:** Line [X] in [filename]
- **Suggestion:** [What to change]

---

## Positive Aspects:

- [Highlight good design decisions]
- [Highlight good code quality]
- [Highlight correct implementation of complex logic]
- [Highlight good documentation]

---

## Recommended Refactorings:

### Refactoring 1: [Title]

**BEFORE:**
```typescript
// [problematic code snippet]
```

**AFTER (proposal):**
```typescript
// [improved code snippet]
// [explanation of improvement]
```

**Rationale:** [Why this refactoring improves the code]

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
  - All requirements met
  - No critical issues
  - Code quality acceptable
  - Minor issues are optional improvements

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality works
  - Minor issues should be addressed in next iteration
  - Technical debt documented

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues must be resolved
  - Significant requirements unmet
  - Code quality below acceptable threshold
