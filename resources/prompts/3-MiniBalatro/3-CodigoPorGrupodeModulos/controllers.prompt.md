# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Controller Layer - Game Flow Orchestration

**Project File Structure:**
```
3-MiniBalatro/
├── src/
│   ├── models/
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
│   │   │   ├── planets/
│   │   │   └── tarots/
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
│   │       └── game-state.ts
│   ├── controllers/
│   │   ├── index.ts
│   │   └── game-controller.ts          ← IMPLEMENT
│   ├── services/
│   │   ├── shop/
│   │   │   ├── shop.ts
│   │   │   ├── shop-item.ts
│   │   │   ├── shop-item-type.enum.ts
│   │   │   └── shop-item-generator.ts
│   │   ├── persistence/
│   │   │   └── game-persistence.ts
│   │   └── config/
│   │       ├── game-config.ts
│   │       └── balancing-config.ts
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
- **FR6:** Limit of 3 playable hands per level
- **FR10:** Victory upon reaching level point goal
- **FR11:** Defeat upon exhausting 3 hands without reaching goal
- **FR19:** Shop between levels with 4 random cards
- **FR20:** Card purchase in shop
- **FR21:** Shop reroll
- **FR28:** Game persistence
- **FR29:** Continuation of saved games

### Section 11: Complete Game Flow

**Game Start:**
1. User selects "New Game" from main menu
2. System initializes game state
3. Initial 8-card hand is dealt
4. Complete game interface is displayed

**Level Development:**
1. Player turn: Select cards, choose action (Play Hand / Discard)
2. Goal verification: Check if level complete or game over
3. If level passed: Open shop
4. Shop interaction: Purchase cards, reroll, or exit
5. Upon shop exit: Advance to next level

**Boss Blind (Every Third Level):**
1. System randomly selects boss
2. Boss introduction screen shown
3. Boss modifications applied
4. Level plays with modified rules
5. Upon passing: +$10 reward and shop

**Completion Conditions:**
- **Victory:** Passing determined number of rounds
- **Defeat:** Not reaching goal with available hands

### Section 11.2: Level Development (Detailed)

1. **Player turn:**
   - Selects up to 5 cards from main hand
   - Chooses an action:
     - **Play Hand:** System calculates complete score, updates counters, shows result
     - **Discard:** Replaces selected cards, consumes discard
2. **Goal verification:**
   - If accumulated points ≥ goal: Level passed → Go to step 3
   - If remaining hands = 0 and points < goal: Defeat → Game end
   - If remaining hands > 0: Repeat from step 1
3. **Successful level end:**
   - Grant money reward according to blind type
   - Activate post-level effects (e.g., Golden Joker +$2)
   - Open shop with 4 random cards
   - Player can buy, reroll, or exit
   - Upon exit: advance to next level

---

## 2. Class Diagram

```
class GameController {
    -gameState: GameState
    -scoreCalculator: ScoreCalculator
    -blindGenerator: BlindGenerator
    -shop: Shop
    
    +constructor()
    +startNewGame(): void
    +selectCard(cardId: string): void
    +playSelectedHand(): ScoreResult
    +discardSelected(): void
    +completeBlind(): void
    +openShop(): void
    +purchaseShopItem(itemId: string): boolean
    +useConsumable(tarotId: string, targetCardId?: string): void
    -checkVictoryCondition(): boolean
    -checkDefeatCondition(): boolean
}

GameController --> GameState : manages
GameController --> ScoreCalculator : uses
GameController --> BlindGenerator : uses
GameController --> Shop : manages
GameController --> ScoreResult : receives
```

---

## 3. Use Case Diagram

**Relevant use cases:**

**Player interactions (orchestrated by controller):**
- **Start New Game:** Initialize game and deal first hand
- **Select Cards:** Toggle card selection
- **Play Hand:** Execute hand play and calculate score
- **Discard Cards:** Replace selected cards
- **Enter Shop:** Open shop after completing level
- **Purchase Card:** Buy joker/planet/tarot from shop
- **Reroll Shop:** Regenerate shop items
- **Exit Shop:** Close shop and advance to next level
- **Use Tarot Card:** Consume tarot with optional target
- **Continue Game:** Load saved game state

**Controller responsibilities:**
- Coordinate GameState and Shop
- Validate player actions
- Check win/loss conditions after each action
- Trigger shop opening after level completion
- Handle game persistence
- Orchestrate UI updates through events/callbacks

**Relationships:**
- StartNewGame includes InitializeGame
- PlayHand includes CalculateScore
- PlayHand includes CheckLevelCompletion
- CompleteBlind includes OpenShop
- ExitShop includes AdvanceToNextLevel
- PurchaseCard includes SpendMoney

---

# SPECIFIC TASK

Implement the **Game Controller** module consisting of 1 comprehensive class:

1. **GameController** (class) - `src/controllers/game-controller.ts`

---

## MODULE 1: GameController (Class)

### Responsibilities:
- Orchestrate game flow from start to completion
- Coordinate interactions between GameState, Shop, and Services
- Validate player actions before applying to state
- Check win/loss conditions after each significant action
- Manage shop lifecycle (open, purchase, reroll, close)
- Trigger game persistence at appropriate times
- Provide clean API for UI layer to interact with game
- Handle error conditions gracefully
- Emit events for UI updates (optional, but recommended)

### Properties:
- `gameState: GameState` - The complete game state
- `shop: Shop | null` - Current shop instance (null when not in shop)
- `gamePersistence: GamePersistence` - Handles save/load
- `isInShop: boolean` - Whether player is currently in shop
- `isGameActive: boolean` - Whether game is in progress
- `onStateChange?: (state: GameState) => void` - Optional callback for UI updates
- `onShopOpen?: (shop: Shop) => void` - Optional callback when shop opens
- `onShopClose?: () => void` - Optional callback when shop closes
- `onVictory?: () => void` - Optional callback on game victory
- `onDefeat?: () => void` - Optional callback on game defeat

### Methods to implement:

#### 1. **constructor**(onStateChange?: Function, onShopOpen?: Function, onShopClose?: Function, onVictory?: Function, onDefeat?: Function)
- **Description:** Creates game controller with optional UI callbacks
- **Preconditions:** None
- **Postconditions:** Controller initialized but no game started
- **Exceptions to handle:** None
- **Initial values:**
  - gameState = null (not initialized until startNewGame)
  - shop = null
  - isInShop = false
  - isGameActive = false
  - gamePersistence = new GamePersistence()

#### 2. **startNewGame**(): void
- **Description:** Initializes a new game and deals first hand
- **Preconditions:** None (can be called anytime)
- **Postconditions:** 
  - New GameState created
  - First blind generated
  - Initial hand dealt (8 cards)
  - isGameActive = true
  - UI callback triggered
- **Exceptions to handle:** None
- **Algorithm:**
  1. Create new GameState()
  2. Call gameState.dealHand()
  3. Set isGameActive = true
  4. Trigger onStateChange callback
  5. Auto-save game state

#### 3. **continueGame**(): boolean
- **Description:** Loads saved game and resumes
- **Preconditions:** Saved game exists in persistence
- **Postconditions:** 
  - If save exists: GameState loaded, returns true
  - If no save: Returns false
- **Exceptions to handle:** Handle load errors gracefully
- **Returns:** true if successfully loaded, false otherwise

#### 4. **selectCard**(cardId: string): void
- **Description:** Toggles selection of a card in player's hand
- **Preconditions:** 
  - Game is active
  - Not in shop
  - cardId exists in current hand
- **Postconditions:** 
  - Card selection toggled in gameState
  - UI callback triggered
- **Exceptions to handle:** 
  - Throw error if game not active
  - Throw error if in shop
  - Throw error if cardId invalid

#### 5. **clearSelection**(): void
- **Description:** Clears all selected cards
- **Preconditions:** Game is active
- **Postconditions:** All cards deselected, UI updated
- **Exceptions to handle:** Throw error if game not active

#### 6. **playSelectedHand**(): ScoreResult
- **Description:** Plays selected cards, calculates score, checks level completion
- **Preconditions:** 
  - Game is active
  - Not in shop
  - At least 1 card selected
  - Hands remaining > 0
- **Postconditions:** 
  - Score calculated and added to accumulated score
  - Hands remaining decremented
  - If level complete: Shop opened
  - If game over: Defeat triggered
  - UI callback triggered
  - Game auto-saved
- **Exceptions to handle:** 
  - Throw error if no cards selected
  - Throw error if no hands remaining
  - Throw error if game not active
- **Algorithm:**
  1. Validate preconditions
  2. Call gameState.playHand()
  3. Check if level complete: if yes, call completeBlind()
  4. Check if game over: if yes, call triggerDefeat()
  5. Trigger onStateChange callback
  6. Auto-save game state
  7. Return ScoreResult

#### 7. **discardSelected**(): void
- **Description:** Discards selected cards and draws replacements
- **Preconditions:** 
  - Game is active
  - Not in shop
  - At least 1 card selected
  - Discards remaining > 0
- **Postconditions:** 
  - Selected cards discarded
  - New cards drawn
  - Discards remaining decremented
  - UI callback triggered
  - Game auto-saved
- **Exceptions to handle:** 
  - Throw error if no cards selected
  - Throw error if no discards remaining
  - Throw error if game not active
- **Algorithm:**
  1. Validate preconditions
  2. Call gameState.discardCards()
  3. Trigger onStateChange callback
  4. Auto-save game state

#### 8. **completeBlind**(): void [PRIVATE]
- **Description:** Handles successful blind completion
- **Preconditions:** Level score goal reached
- **Postconditions:** 
  - Money reward added
  - Shop opened
  - isInShop = true
- **Exceptions to handle:** None
- **Algorithm:**
  1. Add money reward from currentBlind.getReward()
  2. Apply Golden Joker bonus if present
  3. Call openShop()
  4. Trigger onStateChange callback

#### 9. **openShop**(): void
- **Description:** Opens shop with 4 random items
- **Preconditions:** Game is active, not already in shop
- **Postconditions:** 
  - Shop created with 4 items
  - isInShop = true
  - onShopOpen callback triggered
- **Exceptions to handle:** Throw error if already in shop
- **Algorithm:**
  1. Create new Shop instance
  2. Generate 4 random items (mix of jokers, planets, tarot)
  3. Set isInShop = true
  4. Trigger onShopOpen callback

#### 10. **purchaseShopItem**(itemId: string): boolean
- **Description:** Attempts to purchase an item from shop
- **Preconditions:** 
  - In shop
  - itemId exists in shop
  - Player has sufficient money
- **Postconditions:** 
  - If successful:
    - Money spent
    - Item added to appropriate inventory (joker/tarot)
    - If planet: upgrade applied immediately
    - Item removed from shop
    - Returns true
  - If insufficient money: Returns false
- **Exceptions to handle:** 
  - Throw error if not in shop
  - Throw error if itemId invalid
- **Algorithm:**
  1. Validate in shop
  2. Get item from shop
  3. Check if player can afford
  4. If jokers/consumables full: require replacement (return false with message)
  5. Call gameState.spendMoney()
  6. Apply item effect (add to inventory or apply planet)
  7. Remove item from shop
  8. Trigger onStateChange callback
  9. Auto-save game state
  10. Return true

#### 11. **rerollShop**(): boolean
- **Description:** Regenerates shop items for a cost
- **Preconditions:** 
  - In shop
  - Player has sufficient money for reroll cost
- **Postconditions:** 
  - If successful:
    - Reroll cost paid
    - New 4 items generated
    - Returns true
  - If insufficient money: Returns false
- **Exceptions to handle:** Throw error if not in shop
- **Algorithm:**
  1. Validate in shop
  2. Get reroll cost from shop
  3. Attempt to spend money
  4. If successful: regenerate shop items
  5. Trigger onStateChange and onShopOpen callbacks
  6. Auto-save game state
  7. Return result

#### 12. **exitShop**(): void
- **Description:** Closes shop and advances to next blind
- **Preconditions:** In shop
- **Postconditions:** 
  - Shop closed (shop = null)
  - isInShop = false
  - Advanced to next blind
  - New hand dealt
  - onShopClose callback triggered
- **Exceptions to handle:** Throw error if not in shop
- **Algorithm:**
  1. Validate in shop
  2. Set shop = null, isInShop = false
  3. Call gameState.advanceToNextBlind()
  4. Call gameState.dealHand()
  5. Check if boss blind: show boss intro if needed
  6. Trigger onShopClose and onStateChange callbacks
  7. Auto-save game state

#### 13. **useConsumable**(tarotId: string, targetCardId?: string): void
- **Description:** Uses a tarot card from inventory
- **Preconditions:** 
  - Game is active
  - Not in shop
  - tarotId exists in consumables
  - targetCardId provided if tarot requires target
- **Postconditions:** 
  - Tarot effect applied
  - Tarot removed from inventory
  - UI callback triggered
  - Game auto-saved
- **Exceptions to handle:** 
  - Throw error if game not active
  - Throw error if in shop
  - Throw error if tarotId invalid
  - Throw error if target required but not provided
- **Algorithm:**
  1. Validate preconditions
  2. Get tarot from gameState
  3. If requires target: get target card from hand/deck
  4. Call gameState.useConsumable()
  5. Trigger onStateChange callback
  6. Auto-save game state

#### 14. **addJoker**(joker: Joker): boolean
- **Description:** Adds joker to active set (controller wrapper)
- **Preconditions:** In shop, purchasing joker
- **Postconditions:** 
  - If space available: joker added, returns true
  - If full: returns false (UI should prompt for replacement)
- **Exceptions to handle:** None
- **Returns:** true if added, false if inventory full

#### 15. **replaceJoker**(oldJokerId: string, newJoker: Joker): void
- **Description:** Replaces existing joker with new one
- **Preconditions:** oldJokerId exists, in shop
- **Postconditions:** Joker replaced, UI updated
- **Exceptions to handle:** Throw error if oldJokerId not found

#### 16. **addConsumable**(tarot: Tarot): boolean
- **Description:** Adds tarot to consumables (controller wrapper)
- **Preconditions:** In shop, purchasing tarot
- **Postconditions:** 
  - If space available: tarot added, returns true
  - If full: returns false (UI should prompt for replacement)
- **Exceptions to handle:** None
- **Returns:** true if added, false if inventory full

#### 17. **replaceConsumable**(oldTarotId: string, newTarot: Tarot): void
- **Description:** Replaces existing tarot with new one
- **Preconditions:** oldTarotId exists, in shop
- **Postconditions:** Tarot replaced, UI updated
- **Exceptions to handle:** Throw error if oldTarotId not found

#### 18. **checkVictoryCondition**(): boolean [PRIVATE]
- **Description:** Checks if player has won the game
- **Preconditions:** None
- **Postconditions:** Returns true if victory condition met
- **Exceptions to handle:** None
- **Victory condition:** Passed 8 complete rounds (24 levels)

#### 19. **checkDefeatCondition**(): boolean [PRIVATE]
- **Description:** Checks if player has lost the game
- **Preconditions:** None
- **Postconditions:** Returns true if defeat condition met
- **Exceptions to handle:** None
- **Defeat condition:** gameState.isGameOver() returns true

#### 20. **triggerVictory**(): void [PRIVATE]
- **Description:** Handles game victory
- **Preconditions:** Victory condition met
- **Postconditions:** 
  - isGameActive = false
  - Game saved as completed
  - onVictory callback triggered
- **Exceptions to handle:** None

#### 21. **triggerDefeat**(): void [PRIVATE]
- **Description:** Handles game defeat
- **Preconditions:** Defeat condition met
- **Postconditions:** 
  - isGameActive = false
  - Game saved as lost
  - onDefeat callback triggered
- **Exceptions to handle:** None

#### 22. **getGameState**(): GameState
- **Description:** Returns current game state (for UI access)
- **Preconditions:** Game initialized
- **Postconditions:** Returns GameState object
- **Exceptions to handle:** Throw error if game not initialized

#### 23. **getShop**(): Shop | null
- **Description:** Returns current shop instance
- **Preconditions:** None
- **Postconditions:** Returns Shop if in shop, null otherwise
- **Exceptions to handle:** None

#### 24. **isActive**(): boolean
- **Description:** Returns whether game is currently active
- **Preconditions:** None
- **Postconditions:** Returns boolean
- **Exceptions to handle:** None

#### 25. **isInShopMode**(): boolean
- **Description:** Returns whether player is in shop
- **Preconditions:** None
- **Postconditions:** Returns boolean
- **Exceptions to handle:** None

#### 26. **saveGame**(): void
- **Description:** Manually triggers game save
- **Preconditions:** Game is active
- **Postconditions:** Game state persisted to storage
- **Exceptions to handle:** Handle persistence errors gracefully

#### 27. **resetGame**(): void
- **Description:** Resets controller and clears saved game
- **Preconditions:** None
- **Postconditions:** 
  - gameState reset
  - shop closed
  - isGameActive = false
  - Saved game cleared
- **Exceptions to handle:** None

---

## Dependencies:

### Classes it must use:
- **GameState** from `src/models/game/game-state.ts`
- **Shop** from `src/services/shop/shop.ts`
- **ShopItem** from `src/services/shop/shop-item.ts`
- **GamePersistence** from `src/services/persistence/game-persistence.ts`
- **Joker** from `src/models/special-cards/jokers/joker.ts`
- **Tarot** from `src/models/special-cards/tarots/tarot.ts`
- **Planet** from `src/models/special-cards/planets/planet.ts`
- **ScoreResult** from `src/models/scoring/score-result.ts`
- **Card** from `src/models/core/card.ts`

### Interfaces it implements:
- None (concrete class)

### External services it consumes:
- **GamePersistence** for save/load operations
- **Shop** for shop management

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
  - Single Responsibility: Controller orchestrates, doesn't implement logic
  - Open/Closed: Extensible via callbacks/events
  - Liskov Substitution: N/A
  - Interface Segregation: N/A
  - Dependency Inversion: Depends on abstractions (GameState, Shop)
- **Input parameter validation:**
  - Validate all inputs before delegating to models
  - Check game state (active, in shop) before operations
  - Validate IDs exist before operations
- **Robust exception handling:**
  - Catch and handle all errors gracefully
  - Provide meaningful error messages
  - Don't let exceptions crash the application
- **Logging at critical points:**
  - Log all major game events (start, victory, defeat)
  - Log all player actions (play, discard, purchase)
  - Log state transitions (level advance, shop open/close)
- **Comments for complex logic:**
  - Document game flow orchestration
  - Explain callback triggering
  - Document win/loss condition checks

## Security:
- **Input sanitization and validation:**
  - Validate all card/item IDs
  - Prevent invalid state transitions
  - Validate money amounts before spending

---

# DELIVERABLES

## 1. Complete source code of the module:

### File: `src/controllers/game-controller.ts`
```typescript
/**
 * Main game flow controller.
 * Orchestrates interactions between GameState, Shop, and Services.
 * Provides clean API for UI layer and handles game progression.
 */
export class GameController {
  // Properties and methods
}
```

## 2. Inline documentation:
- TSDoc comments on all public methods
- Game flow orchestration explanations
- Callback/event documentation
- State transition notes

## 3. New dependencies:
- None (integrates existing models and services)

## 4. Edge cases considered:
- Starting new game while game already active (resets properly)
- Attempting actions while in shop (blocked)
- Attempting shop actions while not in shop (blocked)
- Purchasing with insufficient money (returns false)
- Adding joker/tarot when inventory full (requires replacement)
- Playing hand with 0 hands remaining (blocked)
- Discarding with 0 discards remaining (blocked)
- Exiting shop automatically advances to next level
- Boss blind introduction before level starts
- Victory condition checked after each blind completion
- Defeat condition checked after each hand played
- Auto-save after every significant action
- Load game failure handled gracefully
- Persistence errors don't crash game

---

# OUTPUT FORMAT

Provide code block for the file:

```typescript
// ============================================
// FILE: src/controllers/game-controller.ts
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
