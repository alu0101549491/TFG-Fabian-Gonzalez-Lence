# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Domain Layer - Game State Management

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
│   │   │   ├── score-calculator.ts
│   │   │   ├── score-context.ts
│   │   │   ├── score-result.ts
│   │   │   └── score-breakdown.ts
│   │   ├── blinds/
│   │   │   ├── blind.ts
│   │   │   ├── small-blind.ts
│   │   │   ├── big-blind.ts
│   │   │   ├── boss-blind.ts
│   │   │   ├── boss-type.enum.ts
│   │   │   ├── blind-modifier.ts
│   │   │   └── blind-generator.ts
│   │   └── game/
│   │       ├── index.ts
│   │       └── game-state.ts            ← IMPLEMENT
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

### Section 4: Functional Requirements
- **FR1:** Deal initial hand of 8 cards at the start of each level
- **FR2:** Selection of up to 5 cards to play a poker hand
- **FR4:** Discard cards up to 3 times per level
- **FR5:** Automatic replacement of discarded cards
- **FR6:** Limit of 3 playable hands per level
- **FR10:** Victory upon reaching level point goal
- **FR11:** Defeat upon exhausting 3 hands without reaching goal
- **FR12:** Management of three simultaneous hand types (main hand, jokers, consumables)
- **FR17:** Economy system with initial money of $5
- **FR28:** Game persistence (save state to localStorage/JSON)
- **FR29:** Continuation of saved games

### Section 9: Detailed Economy System

**Initial money and income sources:**
- Initial money: $5 when starting a new game
- Level rewards:
  - Small Blind passed: +$2
  - Big Blind passed: +$5
  - Boss Blind passed: +$10
- Special effects:
  - Golden Joker active: +$2 additional per passed level
  - The Hermit (tarot): doubles current money instantly

**Inventory management:**
- Jokers: Maximum 5 simultaneous. If buying a sixth, must replace an existing one.
- Consumables (Tarot): Maximum 2 simultaneous. If buying a third, must replace an existing one.
- Planets: Applied immediately without occupying inventory space.

### Section 11: Complete Game Flow

**Game Start:**
1. User selects "New Game" from main menu
2. System initializes:
   - Money = $5
   - Deck = 52 standard shuffled cards
   - Jokers = empty
   - Consumables = empty
   - Level = Small Blind #1
   - Goal = round 1 base score
3. Initial 8-card hand is dealt
4. Complete game interface is displayed

**Level Development:**
1. Player turn:
   - Selects up to 5 cards from main hand
   - Chooses action: Play Hand or Discard
2. Goal verification:
   - If accumulated points ≥ goal: Level passed → Shop
   - If remaining hands = 0 and points < goal: Defeat
   - If remaining hands > 0: Continue

**Successful level end:**
- Grant money reward according to blind type
- Activate post-level effects (e.g., Golden Joker +$2)
- Open shop with 4 random cards
- Upon shop exit: advance to next level

### Section 12: Completion Conditions

**Victory:**
- Upon passing a determined number of complete rounds (e.g., 8 rounds = 24 levels)

**Defeat:**
- Upon not reaching goal with available hands at any level

---

## 2. Class Diagram

```
class GameState {
    -deck: Deck
    -currentHand: Card[]
    -jokers: Joker[]
    -consumables: Tarot[]
    -currentBlind: Blind
    -money: number
    -score: number
    -handsRemaining: number
    -discardsRemaining: number
    -roundNumber: number
    -upgradeManager: HandUpgradeManager
    
    +constructor()
    +dealHand(): void
    +playHand(selectedCards: Card[]): ScoreResult
    +discardCards(selectedCards: Card[]): void
    +addJoker(joker: Joker): void
    +removeJoker(jokerId: string): void
    +addConsumable(tarot: Tarot): void
    +useConsumable(tarotId: string, target?: Card): void
    +addMoney(amount: number): void
    +spendMoney(amount: number): boolean
    +advanceToNextBlind(): void
    +isLevelComplete(): boolean
    +isGameOver(): boolean
    +reset(): void
}

GameState --> Deck : owns
GameState --> Card : manages
GameState --> Joker : contains
GameState --> Tarot : contains
GameState --> Blind : has current
GameState --> HandUpgradeManager : owns
```

---

## 3. Use Case Diagram

**Relevant use cases:**

**Player interactions:**
- **Select Cards from Hand:** Player selects up to 5 cards
- **Play Hand:** Player plays selected cards
- **Discard Cards:** Player discards selected cards
- **Use Tarot Card:** Player consumes tarot from inventory
- **Add Joker:** Player purchases joker from shop
- **Remove Joker:** Player removes joker from active set

**System operations:**
- **Deal Cards:** System deals 8 cards at level start
- **Manage Card Deck:** System maintains deck state
- **Replace Discarded Cards:** System draws new cards
- **Calculate Score:** System computes hand score
- **Check Level Completion:** System verifies win/loss condition
- **Advance to Next Level:** System progresses to next blind
- **Update UI:** System reflects state changes

**Relationships:**
- DealCards includes ShuffleDeck
- PlayHand includes CalculateScore
- PlayHand includes CheckLevelCompletion
- DiscardCards includes ReplaceDiscardedCards
- AddJoker includes ManageJokers (inventory limits)
- AddConsumable includes ManageConsumables (inventory limits)

---

# SPECIFIC TASK

Implement the **Game State Management** module consisting of 1 comprehensive class:

1. **GameState** (class) - `src/models/game/game-state.ts`

---

## MODULE 1: GameState (Class)

### Responsibilities:
- Maintain complete game state (deck, hands, inventory, progress)
- Orchestrate game flow (deal, play, discard, advance)
- Enforce game rules (hand limits, discard limits, inventory limits)
- Manage economy (money tracking, spending, earning)
- Track level progression and scoring
- Coordinate with all game subsystems
- Support game reset for new games
- Provide state for persistence system

### Properties:
- `deck: Deck` - The 52-card deck with draw and discard piles
- `currentHand: Card[]` - Player's current hand (8 cards max)
- `selectedCards: Card[]` - Cards currently selected by player
- `jokers: Joker[]` - Active jokers (max 5)
- `consumables: Tarot[]` - Active tarot cards (max 2)
- `currentBlind: Blind` - Current level/blind being played
- `money: number` - Player's current money
- `accumulatedScore: number` - Total score accumulated in current blind
- `handsRemaining: number` - Hands left to play (starts at 3 per blind)
- `discardsRemaining: number` - Discards left to use (starts at 3 per blind)
- `levelNumber: number` - Current level (1, 2, 3, ...)
- `roundNumber: number` - Current round (1, 2, 3, ...)
- `upgradeManager: HandUpgradeManager` - Manages planet card upgrades
- `blindGenerator: BlindGenerator` - Generates blinds for progression
- `scoreCalculator: ScoreCalculator` - Calculates hand scores

### Methods to implement:

#### 1. **constructor**()
- **Description:** Initializes a new game with starting conditions
- **Preconditions:** None
- **Postconditions:** Game ready to start with $5, empty inventories, level 1
- **Exceptions to handle:** None
- **Initial values:**
  - money = $5
  - deck = new Deck() (52 cards, shuffled)
  - currentHand = []
  - selectedCards = []
  - jokers = []
  - consumables = []
  - levelNumber = 1
  - roundNumber = 1
  - currentBlind = blindGenerator.generateBlind(1)
  - handsRemaining = 3
  - discardsRemaining = 3
  - accumulatedScore = 0
  - upgradeManager = new HandUpgradeManager()
  - scoreCalculator = new ScoreCalculator(handEvaluator, upgradeManager)

#### 2. **dealHand**(): void
- **Description:** Deals 8 cards from deck to current hand (called at level start)
- **Preconditions:** deck has at least 8 cards
- **Postconditions:** currentHand contains 8 cards, selectedCards cleared
- **Exceptions to handle:** Throw error if deck has < 8 cards remaining
- **Note:** If deck has < 8 cards, may need to reshuffle discard pile

#### 3. **selectCard**(cardId: string): void
- **Description:** Toggles card selection status (select/deselect)
- **Preconditions:** cardId exists in currentHand
- **Postconditions:** 
  - If not selected and selectedCards.length < 5: card added to selectedCards
  - If already selected: card removed from selectedCards
- **Exceptions to handle:** Throw error if cardId not in currentHand

#### 4. **clearSelection**(): void
- **Description:** Clears all selected cards
- **Preconditions:** None
- **Postconditions:** selectedCards = []
- **Exceptions to handle:** None

#### 5. **playHand**(): ScoreResult
- **Description:** Plays selected cards, calculates score, checks level completion
- **Preconditions:** 
  - selectedCards.length >= 1 and <= 5
  - handsRemaining > 0
- **Postconditions:** 
  - Score calculated and added to accumulatedScore
  - handsRemaining decremented
  - selectedCards cleared
  - Cards remain in hand (not discarded)
- **Exceptions to handle:** 
  - Throw error if no cards selected
  - Throw error if > 5 cards selected
  - Throw error if handsRemaining = 0
- **Returns:** ScoreResult with details of calculation

#### 6. **discardCards**(): void
- **Description:** Discards selected cards and draws replacements
- **Preconditions:** 
  - selectedCards.length >= 1
  - discardsRemaining > 0
- **Postconditions:** 
  - Selected cards moved to deck's discard pile
  - Same number of cards drawn from deck to currentHand
  - discardsRemaining decremented
  - selectedCards cleared
- **Exceptions to handle:** 
  - Throw error if no cards selected
  - Throw error if discardsRemaining = 0
  - Throw error if deck cannot provide enough replacement cards

#### 7. **addJoker**(joker: Joker): boolean
- **Description:** Adds joker to active set (max 5)
- **Preconditions:** joker is valid Joker object
- **Postconditions:** 
  - If jokers.length < 5: joker added, returns true
  - If jokers.length = 5: returns false (must replace)
- **Exceptions to handle:** Throw error if joker null

#### 8. **replaceJoker**(oldJokerId: string, newJoker: Joker): void
- **Description:** Replaces an existing joker with a new one
- **Preconditions:** oldJokerId exists in jokers array, newJoker valid
- **Postconditions:** Joker with oldJokerId replaced by newJoker
- **Exceptions to handle:** Throw error if oldJokerId not found

#### 9. **removeJoker**(jokerId: string): void
- **Description:** Removes joker from active set
- **Preconditions:** jokerId exists in jokers array
- **Postconditions:** Joker removed from array
- **Exceptions to handle:** Throw error if jokerId not found

#### 10. **addConsumable**(tarot: Tarot): boolean
- **Description:** Adds tarot to consumables inventory (max 2)
- **Preconditions:** tarot is valid Tarot object
- **Postconditions:** 
  - If consumables.length < 2: tarot added, returns true
  - If consumables.length = 2: returns false (must replace)
- **Exceptions to handle:** Throw error if tarot null

#### 11. **replaceConsumable**(oldTarotId: string, newTarot: Tarot): void
- **Description:** Replaces an existing tarot with a new one
- **Preconditions:** oldTarotId exists, newTarot valid
- **Postconditions:** Tarot replaced
- **Exceptions to handle:** Throw error if oldTarotId not found

#### 12. **useConsumable**(tarotId: string, target?: Card): void
- **Description:** Uses a tarot card and removes it from inventory
- **Preconditions:** 
  - tarotId exists in consumables
  - target provided if tarot requires target
- **Postconditions:** 
  - Tarot effect applied (to game state or target card)
  - Tarot removed from consumables
- **Exceptions to handle:** 
  - Throw error if tarotId not found
  - Throw error if target required but not provided
  - Throw error if target not valid Card

#### 13. **addMoney**(amount: number): void
- **Description:** Adds money to player's balance
- **Preconditions:** amount >= 0
- **Postconditions:** money increased by amount
- **Exceptions to handle:** Throw error if amount negative

#### 14. **spendMoney**(amount: number): boolean
- **Description:** Attempts to spend money if sufficient balance
- **Preconditions:** amount > 0
- **Postconditions:** 
  - If money >= amount: money decreased, returns true
  - If money < amount: no change, returns false
- **Exceptions to handle:** Throw error if amount <= 0

#### 15. **getMoney**(): number
- **Description:** Returns current money balance
- **Preconditions:** None
- **Postconditions:** Returns non-negative number
- **Exceptions to handle:** None

#### 16. **isLevelComplete**(): boolean
- **Description:** Checks if current blind's goal has been reached
- **Preconditions:** None
- **Postconditions:** Returns true if accumulatedScore >= currentBlind.getScoreGoal()
- **Exceptions to handle:** None

#### 17. **isGameOver**(): boolean
- **Description:** Checks if game is lost (hands exhausted without reaching goal)
- **Preconditions:** None
- **Postconditions:** Returns true if handsRemaining = 0 AND accumulatedScore < goal
- **Exceptions to handle:** None

#### 18. **advanceToNextBlind**(): void
- **Description:** Progresses to next level after completing current blind
- **Preconditions:** isLevelComplete() returns true
- **Postconditions:** 
  - Money reward added (from currentBlind.getReward())
  - levelNumber incremented
  - roundNumber updated (every 3 levels)
  - currentBlind = next blind from generator
  - handsRemaining reset to 3 (or modified by boss)
  - discardsRemaining reset to 3 (or modified by boss)
  - accumulatedScore reset to 0
  - currentHand cleared
  - Golden Joker effect applied if present
- **Exceptions to handle:** Throw error if level not complete

#### 19. **applyBlindModifiers**(): void [PRIVATE]
- **Description:** Applies boss blind modifiers to game state
- **Preconditions:** currentBlind is set
- **Postconditions:** 
  - If boss blind: hands/discards overridden by modifier
  - If The Water: discardsRemaining = 0
  - If The Needle: handsRemaining = 1
- **Exceptions to handle:** None

#### 20. **getCurrentHand**(): Card[]
- **Description:** Returns copy of current hand cards
- **Preconditions:** None
- **Postconditions:** Returns array of Card objects (copy, not reference)
- **Exceptions to handle:** None

#### 21. **getSelectedCards**(): Card[]
- **Description:** Returns copy of selected cards
- **Preconditions:** None
- **Postconditions:** Returns array of Card objects
- **Exceptions to handle:** None

#### 22. **getJokers**(): Joker[]
- **Description:** Returns copy of active jokers
- **Preconditions:** None
- **Postconditions:** Returns array of Joker objects
- **Exceptions to handle:** None

#### 23. **getConsumables**(): Tarot[]
- **Description:** Returns copy of active consumables
- **Preconditions:** None
- **Postconditions:** Returns array of Tarot objects
- **Exceptions to handle:** None

#### 24. **getCurrentBlind**(): Blind
- **Description:** Returns current blind
- **Preconditions:** None
- **Postconditions:** Returns Blind object
- **Exceptions to handle:** None

#### 25. **getHandsRemaining**(): number
- **Description:** Returns remaining playable hands
- **Preconditions:** None
- **Postconditions:** Returns integer 0-3
- **Exceptions to handle:** None

#### 26. **getDiscardsRemaining**(): number
- **Description:** Returns remaining discards
- **Preconditions:** None
- **Postconditions:** Returns integer 0-3
- **Exceptions to handle:** None

#### 27. **getAccumulatedScore**(): number
- **Description:** Returns total score accumulated in current blind
- **Preconditions:** None
- **Postconditions:** Returns non-negative number
- **Exceptions to handle:** None

#### 28. **getLevelNumber**(): number
- **Description:** Returns current level number
- **Preconditions:** None
- **Postconditions:** Returns positive integer
- **Exceptions to handle:** None

#### 29. **getRoundNumber**(): number
- **Description:** Returns current round number
- **Preconditions:** None
- **Postconditions:** Returns positive integer
- **Exceptions to handle:** None

#### 30. **reset**(): void
- **Description:** Resets game to initial state for new game
- **Preconditions:** None
- **Postconditions:** All properties reset to constructor values
- **Exceptions to handle:** None
- **Note:** Call constructor initialization logic

---

## Dependencies:

### Classes it must use:
- **Deck** from `src/models/core/deck.ts`
- **Card** from `src/models/core/card.ts`
- **Joker** from `src/models/special-cards/jokers/joker.ts`
- **Tarot** from `src/models/special-cards/tarots/tarot.ts`
- **Blind** from `src/models/blinds/blind.ts`
- **BlindGenerator** from `src/models/blinds/blind-generator.ts`
- **HandUpgradeManager** from `src/models/poker/hand-upgrade-manager.ts`
- **ScoreCalculator** from `src/models/scoring/score-calculator.ts`
- **ScoreResult** from `src/models/scoring/score-result.ts`
- **HandEvaluator** from `src/models/poker/hand-evaluator.ts`

### Interfaces it implements:
- None (concrete class)

### External services it consumes:
- None (pure domain logic, persistence handled by separate service)

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
  - Use camelCase for variables and methods
  - Use PascalCase for classes
  - 2-space indentation
  - Single quotes for strings
  - Semicolons required
- **Maximum cyclomatic complexity:** 10 per method
- **Maximum method length:** 50 lines

## Mandatory best practices:
- **SOLID principles:**
  - Single Responsibility: GameState coordinates but delegates to specialized classes
  - Open/Closed: Extensible for new game mechanics
  - Liskov Substitution: N/A
  - Interface Segregation: N/A
  - Dependency Inversion: Depends on abstractions (Joker, Tarot, Blind)
- **Input parameter validation:**
  - Validate all numeric inputs (positive amounts, valid counts)
  - Validate object parameters are not null
  - Validate array indices and lengths
- **Robust exception handling:**
  - Throw descriptive errors for invalid operations
  - Document all exceptions in TSDoc
- **Logging at critical points:**
  - Log level progression and blind changes
  - Log money transactions
  - Log joker/tarot additions/removals
  - Log game state changes (play hand, discard, etc.)
- **Comments for complex logic:**
  - Comment state transition logic
  - Explain boss modifier application
  - Document inventory limit enforcement

## Security:
- **Input sanitization and validation:**
  - Validate money amounts are non-negative
  - Validate card IDs exist before operations
  - Prevent negative hands/discards
  - Validate inventory limits enforced

---

# DELIVERABLES

## 1. Complete source code of the module:

### File: `src/models/game/game-state.ts`
```typescript
/**
 * Central game state manager.
 * Coordinates all game subsystems and maintains complete game state.
 * Enforces game rules and manages progression.
 */
export class GameState {
  // Properties and methods
}
```

### File: `src/models/game/index.ts`
```typescript
/**
 * Game state barrel export.
 */
export * from './game-state';
```

## 2. Inline documentation:
- TSDoc comments on all public methods
- State transition explanations
- Rule enforcement documentation
- Inventory management notes

## 3. New dependencies:
- None (integrates all existing game subsystems)

## 4. Edge cases considered:
- Deck runs out of cards (need to reshuffle discard pile)
- Attempting to play hand with no cards selected
- Attempting to discard with 0 discards remaining
- Attempting to add 6th joker (must replace)
- Attempting to add 3rd tarot (must replace)
- Spending more money than available (returns false)
- Boss blind with 0 discards (The Water)
- Boss blind with 1 hand (The Needle)
- Level completion with exact score match
- Game over with 0 hands remaining
- Golden Joker bonus accumulation
- The Hermit doubling money (including $0 case)
- Playing hand after game over (should throw error)

---

# OUTPUT FORMAT

Provide code block for the file:

```typescript
// ============================================
// FILE: src/models/game/game-state.ts
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
