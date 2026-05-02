# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Domain Layer - Core Models (Foundation)

**Project File Structure:**
```
3-MiniBalatro/
├── src/
│   ├── models/
│   │   ├── index.ts
│   │   ├── core/
│   │   │   ├── index.ts
│   │   │   ├── card.ts                 ← IMPLEMENT
│   │   │   ├── card-value.enum.ts      ← IMPLEMENT
│   │   │   ├── suit.enum.ts            ← IMPLEMENT
│   │   │   └── deck.ts                 ← IMPLEMENT
│   │   ├── poker/
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
- **French Deck:** Standard 52-card deck (13 values × 4 suits)
- **Discard:** Action of replacing cards from the main hand with new ones from the deck

### Section 4: Functional Requirements
- **FR1:** Deal initial hand of 8 cards at the start of each level
- **FR2:** Selection of up to 5 cards to play a poker hand
- **FR4:** Discard cards up to 3 times per level
- **FR5:** Automatic replacement of discarded cards

### Section 8.2: Individual Card Values
Each card in the French deck has a base chip value when played:
- **A (Ace):** 11 chips
- **K (King):** 10 chips
- **Q (Queen):** 10 chips
- **J (Jack):** 10 chips
- **10 to 2:** corresponding numerical value in chips

### Section 8.5: Tarot Cards and Tactical Effects
Tarot cards can modify individual cards:
- **The Empress:** Choose a card to grant +4 mult when played (permanent)
- **The Emperor:** Choose a card to grant +20 chips when played (permanent)
- **Strength:** Choose a card to increment its value in sequence (A→2, 2→3, …, K→A)
- **The Star/Moon/Sun/World:** Change card suit to Diamonds/Clubs/Hearts/Spades
- **The Hanged Man:** Destroy a card permanently from deck
- **Death:** Add a duplicate copy of a card to deck

### Section 15.2: cardValues.json (Configuration)
```json
{
  "A": 11,
  "K": 10,
  "Q": 10,
  "J": 10,
  "10": 10,
  "9": 9,
  "8": 8,
  "7": 7,
  "6": 6,
  "5": 5,
  "4": 4,
  "3": 3,
  "2": 2
}
```

---

## 2. Class Diagram

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
    ACE
    KING
    QUEEN
    JACK
    TEN
    NINE
    EIGHT
    SEVEN
    SIX
    FIVE
    FOUR
    THREE
    TWO
}

class Suit {
    <<enumeration>>
    DIAMONDS
    HEARTS
    SPADES
    CLUBS
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

## 3. Use Case Diagram

**Relevant use cases:**

**Player interactions:**
- **Select Cards from Hand:** Player selects up to 5 cards to play
- **Discard Cards:** Player discards selected cards to get new ones
- **Use Tarot Card:** Player applies tarot effects to specific cards

**System operations:**
- **Deal Cards:** System deals 8 cards from deck to player hand
- **Shuffle Deck:** System randomizes card order
- **Manage Card Deck:** System maintains deck state (cards remaining, discard pile)
- **Replace Discarded Cards:** System draws new cards when player discards

**Relationships:**
- DealCards includes ShuffleDeck
- DiscardCards includes ReplaceDiscardedCards
- ReplaceDiscardedCards includes ManageDeck
- UseTarotCard includes ApplyTarotEffect (modifies Card properties)

---

# SPECIFIC TASK

Implement the **Core Models** module consisting of 4 classes/enums:

1. **CardValue** (enum) - `src/models/core/card-value.enum.ts`
2. **Suit** (enum) - `src/models/core/suit.enum.ts`
3. **Card** (class) - `src/models/core/card.ts`
4. **Deck** (class) - `src/models/core/deck.ts`

---

## MODULE 1: CardValue (Enum)

### Responsibilities:
- Define all 13 card values in a French deck
- Provide type-safe card value constants
- Support value comparison and sequencing (for Straight detection and Strength tarot)

### Values to define:
- ACE, KING, QUEEN, JACK, TEN, NINE, EIGHT, SEVEN, SIX, FIVE, FOUR, THREE, TWO

### Additional functionality needed:
- Method to get base chip value for each card value
- Method to get next value in sequence (for Strength tarot: A→2, 2→3, ..., K→A)
- Method to get display string (e.g., "A", "K", "10")

---

## MODULE 2: Suit (Enum)

### Responsibilities:
- Define all 4 suits in a French deck
- Provide type-safe suit constants
- Support suit identification for poker hand detection (Flush)

### Values to define:
- DIAMONDS, HEARTS, SPADES, CLUBS

### Additional functionality needed:
- Method to get suit symbol (♦, ♥, ♠, ♣)
- Method to get suit color for UI (#ff6b6b for Diamonds, #ee5a6f for Hearts, #4ecdc4 for Spades, #95e1d3 for Clubs)

---

## MODULE 3: Card (Class)

### Responsibilities:
- Represent a single playing card with value and suit
- Store permanent bonuses applied by tarot cards (The Empress, The Emperor)
- Calculate total chips contributed when card is played
- Support suit changes (The Star, Moon, Sun, World tarot cards)
- Support value upgrades (Strength tarot card)
- Provide unique identification for each card instance
- Enable card cloning (for Death tarot duplication)

### Properties:
- `value: CardValue` - The card's rank (A, K, Q, etc.)
- `suit: Suit` - The card's suit (Diamonds, Hearts, Spades, Clubs)
- `chipBonus: number` - Permanent chip bonus from The Emperor tarot (default: 0)
- `multBonus: number` - Permanent mult bonus from The Empress tarot (default: 0)
- `id: string` - Unique identifier (UUID format recommended)

### Methods to implement:

#### 1. **constructor**(value: CardValue, suit: Suit)
- **Description:** Creates a new card with specified value and suit, generates unique ID
- **Preconditions:** Valid CardValue and Suit enums provided
- **Postconditions:** Card object created with ID, no bonuses initially
- **Exceptions to handle:** None (enums guarantee validity)

#### 2. **getBaseChips**(): number
- **Description:** Returns total chips this card contributes (base value + permanent bonus)
- **Preconditions:** Card exists
- **Postconditions:** Returns number >= base chip value
- **Exceptions to handle:** None

#### 3. **addPermanentBonus**(chips: number, mult: number): void
- **Description:** Adds permanent bonuses to card (used by The Empress/Emperor tarot)
- **Preconditions:** chips >= 0, mult >= 0
- **Postconditions:** chipBonus and multBonus increased by specified amounts
- **Exceptions to handle:** Throw error if negative values provided

#### 4. **changeSuit**(newSuit: Suit): void
- **Description:** Changes the card's suit (used by The Star/Moon/Sun/World tarot)
- **Preconditions:** Valid Suit enum provided
- **Postconditions:** Card's suit property updated to newSuit
- **Exceptions to handle:** None (enum guarantees validity)

#### 5. **upgradeValue**(): void
- **Description:** Increments card value in sequence: A→2, 2→3, ..., K→A (used by Strength tarot)
- **Preconditions:** Card exists
- **Postconditions:** Card value incremented to next in sequence (wraps K→A)
- **Exceptions to handle:** None

#### 6. **clone**(): Card
- **Description:** Creates deep copy of card with new unique ID (used by Death tarot)
- **Preconditions:** Card exists
- **Postconditions:** New Card object with same value, suit, and bonuses but different ID
- **Exceptions to handle:** None

---

## MODULE 4: Deck (Class)

### Responsibilities:
- Manage a collection of 52 standard French playing cards
- Support shuffling for randomization
- Deal cards to player hand (8 cards per level start)
- Handle card drawing (replacement after discards)
- Track remaining cards in deck
- Manage discard pile
- Support adding cards (Death tarot duplication)
- Support removing cards (The Hanged Man tarot destruction)
- Reset to full 52-card deck for new games

### Properties:
- `cards: Card[]` - Array of cards currently in deck (draw pile)
- `discardPile: Card[]` - Array of cards that have been played/discarded

### Methods to implement:

#### 1. **constructor**()
- **Description:** Creates a new deck with 52 standard cards (13 values × 4 suits), shuffled
- **Preconditions:** None
- **Postconditions:** Deck contains 52 unique Card objects, shuffled order, empty discard pile
- **Exceptions to handle:** None

#### 2. **shuffle**(): void
- **Description:** Randomizes the order of cards in the deck using Fisher-Yates algorithm
- **Preconditions:** Deck exists
- **Postconditions:** Cards array order randomized
- **Exceptions to handle:** None

#### 3. **drawCards**(count: number): Card[]
- **Description:** Removes and returns specified number of cards from top of deck
- **Preconditions:** count > 0, count <= cards.length
- **Postconditions:** Specified cards removed from deck, returned as array
- **Exceptions to handle:** 
  - Throw error if count > remaining cards
  - Throw error if count <= 0

#### 4. **addCard**(card: Card): void
- **Description:** Adds a card to the bottom of the deck (used by Death tarot for duplication)
- **Preconditions:** card is valid Card object
- **Postconditions:** Card added to end of cards array
- **Exceptions to handle:** 
  - Throw error if card is null/undefined

#### 5. **removeCard**(cardId: string): void
- **Description:** Permanently removes a card from deck by ID (used by The Hanged Man tarot)
- **Preconditions:** cardId exists in deck
- **Postconditions:** Card with matching ID removed from cards array
- **Exceptions to handle:** 
  - Throw error if cardId not found in deck

#### 6. **getRemaining**(): number
- **Description:** Returns count of cards remaining in deck
- **Preconditions:** Deck exists
- **Postconditions:** Returns cards.length
- **Exceptions to handle:** None

#### 7. **reset**(): void
- **Description:** Resets deck to full 52 standard cards, shuffled, clears discard pile
- **Preconditions:** Deck exists
- **Postconditions:** Deck contains 52 new cards, shuffled, discardPile empty
- **Exceptions to handle:** None

#### 8. **initializeStandardDeck**() [PRIVATE]: void
- **Description:** Helper method to create 52 standard cards (13 values × 4 suits)
- **Preconditions:** Called internally by constructor/reset
- **Postconditions:** cards array populated with 52 unique Card objects
- **Exceptions to handle:** None

---

## Dependencies:

### Classes it must use:
- **Card** uses **CardValue** enum
- **Card** uses **Suit** enum
- **Deck** uses **Card** class
- All modules may use utility functions from `src/utils/constants.ts` (if needed)

### Interfaces it implements:
- None (these are concrete classes/enums)

### External services it consumes:
- None (pure domain models)

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
  - Open/Closed: Classes open for extension (e.g., adding new tarot effects)
  - Liskov Substitution: N/A (no inheritance in this module)
  - Interface Segregation: N/A (no interfaces)
  - Dependency Inversion: Depend on abstractions (enums) not concrete implementations
- **Input parameter validation:**
  - Validate all method parameters before use
  - Throw descriptive errors for invalid inputs
  - Use TypeScript's strict type checking
- **Robust exception handling:**
  - Throw errors with descriptive messages
  - Use custom error types if appropriate (e.g., `DeckEmptyError`)
  - Document what exceptions each method can throw
- **Logging at critical points:**
  - Log deck initialization and shuffling (use console.log for now)
  - Log card modifications (suit changes, value upgrades, bonuses)
  - Log card additions/removals from deck
- **Comments for complex logic:**
  - Comment the Fisher-Yates shuffle implementation
  - Comment value sequencing logic (K→A wraparound)
  - Avoid obvious comments ("// increment counter")

## Security:
- **Input sanitization and validation:**
  - Validate array bounds before accessing
  - Validate numeric inputs (no negative counts)
  - Validate card IDs exist before removal
- **Immutability considerations:**
  - Use `readonly` for properties that shouldn't change after construction (where appropriate)
  - Return copies of arrays when exposing internal state (if needed)

---

# DELIVERABLES

## 1. Complete source code of all 4 modules with:

### File: `src/models/core/card-value.enum.ts`
```typescript
/**
 * Enum representing the 13 values in a French deck.
 * Values ordered from highest (ACE) to lowest (TWO) for poker hand comparison.
 */
export enum CardValue {
  // Enum values with associated chip values
}

// Helper functions for CardValue operations
```

### File: `src/models/core/suit.enum.ts`
```typescript
/**
 * Enum representing the 4 suits in a French deck.
 */
export enum Suit {
  // Enum values
}

// Helper functions for Suit operations
```

### File: `src/models/core/card.ts`
```typescript
/**
 * Represents a single playing card in the game.
 * Cards can have permanent bonuses applied via tarot cards.
 */
export class Card {
  // Properties and methods
}
```

### File: `src/models/core/deck.ts`
```typescript
/**
 * Represents a deck of 52 French playing cards.
 * Manages drawing, shuffling, and card manipulation.
 */
export class Deck {
  // Properties and methods
}
```

### File: `src/models/core/index.ts`
```typescript
/**
 * Core models barrel export.
 */
export * from './card-value.enum';
export * from './suit.enum';
export * from './card';
export * from './deck';
```

### File: `src/models/index.ts`
```typescript
/**
 * Models barrel export.
 */
export * from './core';
// Other model exports will be added later
```

## 2. Inline documentation:
- TSDoc comments on all public classes, methods, and enums
- Justification for implementation decisions (e.g., why Fisher-Yates for shuffling)
- TODOs for future optimizations (if any)

## 3. New dependencies:
- **uuid** (v9.x): For generating unique card IDs
  - Justification: Industry-standard library for UUID generation, ensures uniqueness across cloned cards
  - Installation: `npm install uuid` and `npm install --save-dev @types/uuid`

## 4. Edge cases considered:
- Drawing more cards than remaining in deck (error thrown)
- Removing non-existent card ID (error thrown)
- Upgrading King value (wraps to Ace)
- Cloning cards preserves bonuses but generates new ID
- Adding negative bonuses (error thrown)
- Drawing zero or negative card count (error thrown)
- Shuffling empty deck (no-op, no error)
- Getting base chips from card with large accumulated bonuses

---

# OUTPUT FORMAT

Provide separate code blocks for each file:

```typescript
// ============================================
// FILE: src/models/core/card-value.enum.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/core/suit.enum.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/core/card.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/core/deck.ts
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
