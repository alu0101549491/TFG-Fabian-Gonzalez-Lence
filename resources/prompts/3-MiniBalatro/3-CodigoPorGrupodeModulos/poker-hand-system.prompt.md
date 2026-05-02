# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Domain Layer - Poker Hand System

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
│   │   │   ├── index.ts
│   │   │   ├── hand-evaluator.ts         ← IMPLEMENT
│   │   │   ├── hand-result.ts            ← IMPLEMENT
│   │   │   ├── hand-type.enum.ts         ← IMPLEMENT
│   │   │   ├── hand-upgrade-manager.ts   ← IMPLEMENT
│   │   │   └── hand-upgrade.ts           ← IMPLEMENT
│   │   ├── special-cards/
│   │   ├── scoring/
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
- **Planet Card:** Card that permanently improves a specific type of poker hand

### Section 4: Functional Requirements
- **FR3:** Automatic recognition of poker hand type
- **FR13:** Application of planet card effects (permanent hand upgrades)

### Section 8.1: Poker Hands System

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

**Recognition hierarchy:** The system detects the best possible hand with selected cards, prioritizing from highest to lowest: Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > Pair > High Card.

### Section 8.4: Planet Cards and Permanent Upgrades

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

**Operation:** When buying a planet card in the shop, the increment to that hand type's base values is immediately and permanently applied for the rest of the game.

### Section 15.1: handValues.json (Configuration)

```json
{
  "highCard": { "chips": 5, "mult": 1 },
  "pair": { "chips": 10, "mult": 2 },
  "twoPair": { "chips": 20, "mult": 2 },
  "threeOfAKind": { "chips": 30, "mult": 3 },
  "straight": { "chips": 30, "mult": 4 },
  "flush": { "chips": 35, "mult": 4 },
  "fullHouse": { "chips": 40, "mult": 4 },
  "fourOfAKind": { "chips": 60, "mult": 7 },
  "straightFlush": { "chips": 100, "mult": 8 }
}
```

---

## 2. Class Diagram

```
class HandEvaluator {
    -handRankings: HandType[]
    
    +evaluateHand(cards: Card[]): HandResult
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
}

HandEvaluator --> HandResult : returns
HandEvaluator --> HandType : evaluates
HandResult --> HandType : has
HandResult --> Card : references
HandUpgradeManager --> HandUpgrade : manages
HandUpgradeManager --> HandType : keys by
```

---

## 3. Use Case Diagram

**Relevant use cases:**

**System operations:**
- **Detect Poker Hand Type:** System identifies the best poker hand from selected cards
- **Apply Base Score:** System retrieves base chips and mult for the detected hand type
- **Apply Planet Effect:** System permanently increases base values for a hand type

**Player interactions:**
- **Play Hand:** Player plays selected cards, triggering hand evaluation
- **Purchase Planet Card:** Player buys planet card, triggering permanent upgrade

**Relationships:**
- PlayHand includes DetectPokerHand
- DetectPokerHand includes ApplyBaseScore
- PurchasePlanetCard includes ApplyPlanetEffect
- ApplyPlanetEffect modifies HandUpgradeManager state

---

# SPECIFIC TASK

Implement the **Poker Hand System** module consisting of 5 classes/enums:

1. **HandType** (enum) - `src/models/poker/hand-type.enum.ts`
2. **HandUpgrade** (class) - `src/models/poker/hand-upgrade.ts`
3. **HandResult** (class) - `src/models/poker/hand-result.ts`
4. **HandEvaluator** (class) - `src/models/poker/hand-evaluator.ts`
5. **HandUpgradeManager** (class) - `src/models/poker/hand-upgrade-manager.ts`

---

## MODULE 1: HandType (Enum)

### Responsibilities:
- Define all 9 poker hand types recognized in the game
- Provide type-safe hand type constants
- Support hand type comparison for hierarchy (Straight Flush > Four of a Kind > ...)

### Values to define (in priority order, highest to lowest):
- STRAIGHT_FLUSH, FOUR_OF_A_KIND, FULL_HOUSE, FLUSH, STRAIGHT, THREE_OF_A_KIND, TWO_PAIR, PAIR, HIGH_CARD

### Additional functionality needed:
- Method to get display name (e.g., "Straight Flush", "Four of a Kind")
- Method to get base chips and mult values (from configuration)

---

## MODULE 2: HandUpgrade (Class)

### Responsibilities:
- Store additional chips and mult bonuses for a hand type
- Represent permanent upgrades from planet cards
- Enable cumulative upgrades (multiple planets of same type)

### Properties:
- `additionalChips: number` - Bonus chips added to hand's base chips
- `additionalMult: number` - Bonus mult added to hand's base mult

### Methods to implement:

#### 1. **constructor**(additionalChips: number = 0, additionalMult: number = 0)
- **Description:** Creates a hand upgrade with specified bonuses
- **Preconditions:** additionalChips >= 0, additionalMult >= 0
- **Postconditions:** HandUpgrade object with specified bonuses
- **Exceptions to handle:** Throw error if negative values provided

#### 2. **addUpgrade**(chips: number, mult: number): void
- **Description:** Adds more bonuses to existing upgrade (for multiple planets)
- **Preconditions:** chips >= 0, mult >= 0
- **Postconditions:** additionalChips and additionalMult increased
- **Exceptions to handle:** Throw error if negative values provided

---

## MODULE 3: HandResult (Class)

### Responsibilities:
- Encapsulate the result of evaluating a poker hand
- Store detected hand type and base scoring values
- Provide reference to cards that formed the hand

### Properties:
- `handType: HandType` - The detected poker hand type
- `cards: Card[]` - The cards that were evaluated
- `baseChips: number` - Base chips for this hand type (including upgrades)
- `baseMult: number` - Base mult for this hand type (including upgrades)

### Methods to implement:

#### 1. **constructor**(handType: HandType, cards: Card[], baseChips: number, baseMult: number)
- **Description:** Creates a hand result with evaluated hand data
- **Preconditions:** Valid HandType, non-empty cards array, positive base values
- **Postconditions:** HandResult object created with all properties set
- **Exceptions to handle:** Throw error if cards array is empty or base values are negative

---

## MODULE 4: HandEvaluator (Class)

### Responsibilities:
- Evaluate a set of cards to determine the best poker hand
- Apply recognition hierarchy (check highest hands first)
- Support 1-5 card hands (as per game rules)
- Provide base chips and mult values (considering upgrades)

### Properties:
- `handRankings: HandType[]` - Ordered array of hand types for priority checking

### Methods to implement:

#### 1. **constructor**()
- **Description:** Initializes hand evaluator with proper hand ranking order
- **Preconditions:** None
- **Postconditions:** handRankings array populated in priority order
- **Exceptions to handle:** None

#### 2. **evaluateHand**(cards: Card[], upgradeManager: HandUpgradeManager): HandResult
- **Description:** Evaluates cards and returns best possible hand with upgraded base values
- **Preconditions:** cards.length between 1 and 5, upgradeManager not null
- **Postconditions:** Returns HandResult with best hand detected and upgraded base values
- **Exceptions to handle:** 
  - Throw error if cards array empty or > 5 cards
  - Throw error if upgradeManager is null

#### 3. **getHandType**(cards: Card[]): HandType
- **Description:** Determines hand type without returning full result (used for preview)
- **Preconditions:** cards.length between 1 and 5
- **Postconditions:** Returns best HandType detected
- **Exceptions to handle:** Throw error if cards array empty or > 5

#### 4. **checkStraightFlush**(cards: Card[]) [PRIVATE]: boolean
- **Description:** Checks if cards form a straight flush
- **Preconditions:** cards.length >= 5
- **Postconditions:** Returns true if all cards same suit and sequential values
- **Exceptions to handle:** None (returns false if not enough cards)

#### 5. **checkFourOfAKind**(cards: Card[]) [PRIVATE]: boolean
- **Description:** Checks if cards contain four of the same value
- **Preconditions:** cards.length >= 4
- **Postconditions:** Returns true if 4 cards have same value
- **Exceptions to handle:** None (returns false if not enough cards)

#### 6. **checkFullHouse**(cards: Card[]) [PRIVATE]: boolean
- **Description:** Checks if cards form full house (3 of a kind + pair)
- **Preconditions:** cards.length >= 5
- **Postconditions:** Returns true if contains three of one value and two of another
- **Exceptions to handle:** None (returns false if not enough cards)

#### 7. **checkFlush**(cards: Card[]) [PRIVATE]: boolean
- **Description:** Checks if all cards have same suit
- **Preconditions:** cards.length >= 5
- **Postconditions:** Returns true if all cards same suit
- **Exceptions to handle:** None (returns false if not enough cards)

#### 8. **checkStraight**(cards: Card[]) [PRIVATE]: boolean
- **Description:** Checks if cards have sequential values (including Ace low/high)
- **Preconditions:** cards.length >= 5
- **Postconditions:** Returns true if values are sequential
- **Exceptions to handle:** None (returns false if not enough cards)
- **Note:** Handle Ace as both high (K-A) and low (A-2-3-4-5)

#### 9. **checkThreeOfAKind**(cards: Card[]) [PRIVATE]: boolean
- **Description:** Checks if cards contain three of the same value
- **Preconditions:** cards.length >= 3
- **Postconditions:** Returns true if 3 cards have same value
- **Exceptions to handle:** None (returns false if not enough cards)

#### 10. **checkTwoPair**(cards: Card[]) [PRIVATE]: boolean
- **Description:** Checks if cards contain two different pairs
- **Preconditions:** cards.length >= 4
- **Postconditions:** Returns true if two different values each appear twice
- **Exceptions to handle:** None (returns false if not enough cards)

#### 11. **checkPair**(cards: Card[]) [PRIVATE]: boolean
- **Description:** Checks if cards contain at least one pair
- **Preconditions:** cards.length >= 2
- **Postconditions:** Returns true if 2 cards have same value
- **Exceptions to handle:** None (returns false if not enough cards)

---

## MODULE 5: HandUpgradeManager (Class)

### Responsibilities:
- Track permanent upgrades for all hand types
- Apply planet card bonuses cumulatively
- Provide upgraded base values for score calculation
- Support game reset (for new games)

### Properties:
- `upgrades: Map<HandType, HandUpgrade>` - Map of hand types to their upgrade bonuses

### Methods to implement:

#### 1. **constructor**()
- **Description:** Initializes upgrade manager with zero upgrades for all hand types
- **Preconditions:** None
- **Postconditions:** Map initialized with all HandTypes, each with zero upgrades
- **Exceptions to handle:** None

#### 2. **applyPlanetUpgrade**(handType: HandType, chips: number, mult: number): void
- **Description:** Applies permanent upgrade from planet card to specified hand type
- **Preconditions:** Valid HandType, chips >= 0, mult >= 0
- **Postconditions:** Upgrade for handType increased by specified amounts
- **Exceptions to handle:** 
  - Throw error if handType invalid
  - Throw error if negative values provided

#### 3. **getUpgradedValues**(handType: HandType): HandUpgrade
- **Description:** Returns current upgrade bonuses for a hand type
- **Preconditions:** Valid HandType
- **Postconditions:** Returns HandUpgrade with current bonuses (not null)
- **Exceptions to handle:** Throw error if handType invalid

#### 4. **reset**(): void
- **Description:** Resets all upgrades to zero (for new game)
- **Preconditions:** None
- **Postconditions:** All HandType upgrades set to zero
- **Exceptions to handle:** None

---

## Dependencies:

### Classes it must use:
- **HandEvaluator** uses **Card** from `src/models/core/card.ts`
- **HandEvaluator** uses **CardValue** from `src/models/core/card-value.enum.ts`
- **HandEvaluator** uses **Suit** from `src/models/core/suit.enum.ts`
- **HandResult** uses **HandType** enum
- **HandResult** uses **Card** class
- **HandUpgradeManager** uses **HandType** enum
- **HandUpgradeManager** uses **HandUpgrade** class

### Interfaces it implements:
- None (concrete classes/enums)

### External services it consumes:
- May reference `src/utils/constants.ts` for base hand values configuration

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
  - Use camelCase for variables and methods
  - Use PascalCase for classes and enums
  - Use SCREAMING_SNAKE_CASE for enum values
  - 2-space indentation
  - Single quotes for strings
  - Semicolons required
- **Maximum cyclomatic complexity:** 10 per method
- **Maximum method length:** 50 lines

## Mandatory best practices:
- **SOLID principles:**
  - Single Responsibility: Each class has one clear purpose
  - Open/Closed: HandEvaluator extensible for new hand types
  - Liskov Substitution: N/A
  - Interface Segregation: N/A
  - Dependency Inversion: Depend on abstractions
- **Input parameter validation:**
  - Validate card array length (1-5 cards)
  - Validate non-null parameters
  - Validate non-negative bonus values
- **Robust exception handling:**
  - Throw errors with descriptive messages
  - Document exceptions in TSDoc
- **Logging at critical points:**
  - Log hand evaluation results
  - Log planet upgrades applied
- **Comments for complex logic:**
  - Comment poker hand detection algorithms
  - Comment Ace-low/Ace-high straight logic
  - Comment upgrade accumulation

## Security:
- **Input sanitization and validation:**
  - Validate array lengths
  - Validate enum values exist
  - Prevent negative bonus values

---

# DELIVERABLES

## 1. Complete source code of all 5 modules with:

### File: `src/models/poker/hand-type.enum.ts`
```typescript
/**
 * Enum representing all poker hand types in priority order.
 * Higher priority hands are checked first during evaluation.
 */
export enum HandType {
  // Enum values
}

// Helper functions
```

### File: `src/models/poker/hand-upgrade.ts`
```typescript
/**
 * Represents permanent bonuses applied to a poker hand type.
 * Used for tracking planet card upgrades.
 */
export class HandUpgrade {
  // Properties and methods
}
```

### File: `src/models/poker/hand-result.ts`
```typescript
/**
 * Encapsulates the result of evaluating a poker hand.
 * Contains hand type, cards, and base scoring values.
 */
export class HandResult {
  // Properties and methods
}
```

### File: `src/models/poker/hand-evaluator.ts`
```typescript
/**
 * Evaluates sets of cards to determine poker hand types.
 * Applies recognition hierarchy and supports 1-5 card hands.
 */
export class HandEvaluator {
  // Properties and methods
}
```

### File: `src/models/poker/hand-upgrade-manager.ts`
```typescript
/**
 * Manages permanent upgrades for all poker hand types.
 * Tracks cumulative bonuses from planet cards.
 */
export class HandUpgradeManager {
  // Properties and methods
}
```

### File: `src/models/poker/index.ts`
```typescript
/**
 * Poker system barrel export.
 */
export * from './hand-type.enum';
export * from './hand-upgrade';
export * from './hand-result';
export * from './hand-evaluator';
export * from './hand-upgrade-manager';
```

## 2. Inline documentation:
- TSDoc comments on all public classes, methods, and enums
- Algorithm explanations for poker hand detection
- Edge case handling documentation

## 3. New dependencies:
- None (uses only core Card/CardValue/Suit classes)

## 4. Edge cases considered:
- Evaluating 1 card (always High Card)
- Evaluating 5 cards (all hands possible)
- Ace-low straight (A-2-3-4-5)
- Ace-high straight (10-J-Q-K-A)
- Multiple planets of same type (cumulative bonuses)
- Empty card array (error thrown)
- > 5 cards (error thrown)

---

# OUTPUT FORMAT

Provide separate code blocks for each file:

```typescript
// ============================================
// FILE: src/models/poker/hand-type.enum.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/poker/hand-upgrade.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/poker/hand-result.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/poker/hand-evaluator.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/poker/hand-upgrade-manager.ts
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
