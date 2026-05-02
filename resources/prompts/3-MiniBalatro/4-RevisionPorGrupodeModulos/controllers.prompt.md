# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Controllers Layer - Game Flow Orchestration

**Components under review:**
- `GameController` (class) - `src/controllers/game-controller.ts`

**Component objective:** 
Implement the main game flow orchestrator that bridges the domain layer (GameState, models) with the view layer (React components) and services (Shop, Persistence). The controller validates player actions, checks win/loss conditions, manages shop lifecycle, triggers game persistence, and provides callbacks for UI updates. This is the primary interface between the UI and the game logic.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR1-FR11:** All game actions (deal, play, discard, etc.)
- Acceptance: Controller validates actions before delegating to GameState
- Acceptance: Error handling prevents invalid state transitions

**FR19:** Shop between levels with 4 random cards
- Acceptance: Controller opens shop after level completion
- Acceptance: Shop lifecycle managed correctly

**FR20:** Card purchase in shop
- Acceptance: Controller validates affordability
- Acceptance: Inventory limits enforced

**FR21:** Shop reroll
- Acceptance: Controller handles reroll cost
- Acceptance: New items generated

**FR28-FR29:** Game persistence
- Acceptance: Auto-save after significant actions
- Acceptance: Can load saved games

**Section 11: Complete Game Flow**

**Game Start:**
1. User selects "New Game"
2. Controller initializes GameState
3. Controller deals initial hand
4. UI updated via callbacks

**Level Development:**
1. Player action → Controller validates → GameState updated
2. Controller checks level completion after each action
3. If complete: Controller opens shop
4. If game over: Controller triggers defeat callback

**Shop Interaction:**
1. Controller opens shop with 4 items
2. Player purchases → Controller validates → Updates GameState
3. Player rerolls → Controller validates cost → Regenerates items
4. Player exits → Controller advances to next level

**Victory/Defeat:**
1. Controller detects condition
2. Controller triggers appropriate callback
3. UI shows victory/defeat screen

## Key Acceptance Criteria:

**GameController Class - Properties:**
- [ ] gameState: GameState | null
- [ ] shop: Shop | null
- [ ] gamePersistence: GamePersistence
- [ ] isInShop: boolean
- [ ] isGameActive: boolean
- [ ] onStateChange?: callback
- [ ] onShopOpen?: callback
- [ ] onShopClose?: callback
- [ ] onVictory?: callback
- [ ] onDefeat?: callback

**GameController Class - Core Methods:**
- [ ] constructor(callbacks) - Initialize with optional UI callbacks
- [ ] startNewGame() - Create new GameState and deal hand
- [ ] continueGame() - Load saved game from persistence
- [ ] selectCard(cardId) - Validate and select card
- [ ] clearSelection() - Clear selected cards
- [ ] playSelectedHand() - Play hand, check completion, auto-save
- [ ] discardSelected() - Discard cards, auto-save
- [ ] completeBlind() - Handle level completion, open shop
- [ ] openShop() - Create shop with 4 items
- [ ] purchaseShopItem(itemId) - Validate and purchase item
- [ ] rerollShop() - Regenerate shop items for cost
- [ ] exitShop() - Close shop, advance to next level
- [ ] useConsumable(tarotId, targetCardId?) - Use tarot card
- [ ] addJoker(joker) - Add joker (wrapper for GameState)
- [ ] replaceJoker(oldId, newJoker) - Replace joker
- [ ] addConsumable(tarot) - Add tarot (wrapper for GameState)
- [ ] replaceConsumable(oldId, newTarot) - Replace tarot
- [ ] checkVictoryCondition() - Check if game won
- [ ] checkDefeatCondition() - Check if game lost
- [ ] triggerVictory() - Handle game victory
- [ ] triggerDefeat() - Handle game defeat
- [ ] getGameState() - Return current state
- [ ] getShop() - Return current shop
- [ ] isActive() - Return if game active
- [ ] isInShopMode() - Return if in shop
- [ ] saveGame() - Manually trigger save
- [ ] resetGame() - Reset controller and clear save

**Victory Condition:**
- Passed 8 complete rounds (24 levels)
- Level 24 completed successfully

**Defeat Condition:**
- gameState.isGameOver() returns true
- 0 hands remaining with score < goal

## Edge Cases to Handle:

**Initialization:**
- Starting new game while game already active (resets properly)
- Loading non-existent save (returns false gracefully)
- Multiple callback registrations

**Action validation:**
- Actions attempted while game not active (error)
- Actions attempted while in shop (blocked)
- Shop actions attempted while not in shop (error)

**Shop management:**
- Purchasing with insufficient money (returns false)
- Adding joker/tarot when inventory full (requires replacement)
- Rerolling with insufficient money (returns false)
- Exiting shop automatically advances level

**Level progression:**
- Level completion triggers shop opening
- Boss blind shows introduction (optional, via callback)
- Victory checked after each blind completion
- Defeat checked after each hand played

**Persistence:**
- Auto-save after every significant action
- Save includes complete game state
- Load restores all state correctly
- Corrupted save handled gracefully

**Callbacks:**
- Callbacks can be null/undefined (no error)
- Multiple callback triggers handled
- Callbacks don't break game flow on error

---

# CLASS DIAGRAM

```
class GameController {
    -gameState: GameState | null
    -shop: Shop | null
    -gamePersistence: GamePersistence
    -isInShop: boolean
    -isGameActive: boolean
    -onStateChange?: (state: GameState) => void
    -onShopOpen?: (shop: Shop) => void
    -onShopClose?: () => void
    -onVictory?: () => void
    -onDefeat?: () => void
    
    +constructor(onStateChange?, onShopOpen?, onShopClose?, onVictory?, onDefeat?)
    +startNewGame(): void
    +continueGame(): boolean
    +selectCard(cardId: string): void
    +clearSelection(): void
    +playSelectedHand(): ScoreResult
    +discardSelected(): void
    -completeBlind(): void
    +openShop(): void
    +purchaseShopItem(itemId: string): boolean
    +rerollShop(): boolean
    +exitShop(): void
    +useConsumable(tarotId: string, targetCardId?: string): void
    +addJoker(joker: Joker): boolean
    +replaceJoker(oldJokerId: string, newJoker: Joker): void
    +addConsumable(tarot: Tarot): boolean
    +replaceConsumable(oldTarotId: string, newTarot: Tarot): void
    -checkVictoryCondition(): boolean
    -checkDefeatCondition(): boolean
    -triggerVictory(): void
    -triggerDefeat(): void
    +getGameState(): GameState
    +getShop(): Shop | null
    +isActive(): boolean
    +isInShopMode(): boolean
    +saveGame(): void
    +resetGame(): void
}

GameController --> GameState : manages
GameController --> Shop : manages
GameController --> GamePersistence : uses
GameController --> ScoreResult : receives
GameController --> Joker : handles
GameController --> Tarot : handles
```

---

# CODE TO REVIEW

- `game-controller.ts` - GameController class (main orchestrator)

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation respect the class diagram structure?
- [ ] All properties defined with correct types
- [ ] All methods from diagram implemented
- [ ] Private methods actually private (completeBlind, checkVictory, etc.)
- [ ] Callbacks properly typed as optional functions
- [ ] No circular dependencies

**Specific checks for this module:**
- [ ] gameState initialized to null (not created until startNewGame)
- [ ] shop initialized to null (created only when opened)
- [ ] isInShop and isGameActive boolean flags
- [ ] gamePersistence instantiated in constructor
- [ ] Callbacks stored as optional properties
- [ ] All action methods validate game state before delegating
- [ ] Shop methods validate isInShop flag
- [ ] Private helper methods for victory/defeat/completion

**Controller pattern compliance:**
- [ ] Controller doesn't implement game logic
- [ ] Controller delegates to GameState for domain operations
- [ ] Controller coordinates between services (Shop, Persistence)
- [ ] Controller triggers UI updates via callbacks
- [ ] Controller validates inputs before delegation

**Score:** __/10

**Observations:**
[Document any deviations from the class diagram or architectural concerns]

---

## 2. CODE QUALITY (Weight: 25%)

### Complexity Analysis:

**Check each method for cyclomatic complexity (target: ≤10):**

**Critical methods (likely complex):**
- [ ] playSelectedHand (scoring, completion check, defeat check, save)
- [ ] purchaseShopItem (validation, type checking, inventory limits)
- [ ] exitShop (close shop, advance level, deal hand, victory check)
- [ ] completeBlind (rewards, shop opening, callbacks)

**Medium complexity methods:**
- [ ] startNewGame
- [ ] continueGame
- [ ] openShop
- [ ] rerollShop
- [ ] useConsumable

**Simple methods:**
- [ ] selectCard (delegation)
- [ ] clearSelection (delegation)
- [ ] discardSelected (delegation + save)
- [ ] getGameState
- [ ] isActive
- [ ] All wrapper methods (addJoker, etc.)

**Methods exceeding complexity threshold:**
[List any methods with complexity >10]

### Coupling Analysis:

**Fan-out (dependencies):**
- GameController depends on: GameState, Shop, GamePersistence, ShopItem, Joker, Tarot, Planet, Card, ScoreResult
- **Expected fan-out:** High (orchestrator role)

**Fan-in (dependents):**
- GameController used by: React App component, UI layer
- **Expected fan-in:** Low (single entry point for UI)

**Coupling concerns:**
- [ ] Controller doesn't depend on specific UI frameworks
- [ ] Controller doesn't depend on specific persistence mechanisms
- [ ] Callbacks provide loose coupling with UI
- [ ] No direct DOM manipulation

### Cohesion Analysis:

**GameController cohesion:**
- [ ] All methods relate to game flow orchestration
- [ ] No domain logic implementation (delegated to GameState)
- [ ] No scoring logic (delegated to GameState/ScoreCalculator)
- [ ] No UI rendering logic
- [ ] Single responsibility: Orchestrate game flow and coordinate subsystems

**Cohesion issues:**
[Document any methods that don't belong in GameController]

### Code Smells Detection:

**Long Method (>50 lines):**
- [ ] Check playSelectedHand
- [ ] Check exitShop
- [ ] Check purchaseShopItem

**Feature Envy:**
- [ ] Controller accessing too much GameState internal state?
- [ ] Should use GameState methods, not direct property access

**Code Duplication:**
- [ ] Validation patterns repeated (isGameActive, isInShop)
- [ ] Callback trigger patterns
- [ ] Auto-save patterns

**Magic Numbers:**
- [ ] Victory condition (8 rounds = 24 levels) should be constant
- [ ] Shop item count (4) should be constant
- [ ] Reroll cost should come from config

**Null Checking:**
- [ ] Proper null checks before using gameState
- [ ] Proper null checks before using shop
- [ ] Proper null checks before triggering callbacks

**Error Handling:**
- [ ] Try-catch blocks where needed
- [ ] Errors logged with context
- [ ] User-friendly error messages

**Score:** __/10

**Detected code smells:**
[List specific code smells with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**Constructor:**
- [ ] Accepts 5 optional callback parameters
- [ ] Initializes gameState = null
- [ ] Initializes shop = null
- [ ] Initializes isInShop = false
- [ ] Initializes isGameActive = false
- [ ] Creates GamePersistence instance
- [ ] Stores callbacks if provided

**startNewGame():**
- [ ] Creates new GameState instance
- [ ] Calls gameState.dealHand()
- [ ] Sets isGameActive = true
- [ ] Triggers onStateChange callback
- [ ] Auto-saves game state
- [ ] Logs operation

**continueGame():**
- [ ] Attempts to load game from gamePersistence
- [ ] If successful: sets gameState, isGameActive = true, returns true
- [ ] If failed: returns false
- [ ] Triggers onStateChange if successful
- [ ] Logs operation
- [ ] Handles errors gracefully

**selectCard(cardId):**
- [ ] Validates game is active
- [ ] Validates not in shop
- [ ] Calls gameState.selectCard(cardId)
- [ ] Triggers onStateChange callback
- [ ] Throws error if game not active
- [ ] Throws error if in shop

**clearSelection():**
- [ ] Validates game is active
- [ ] Calls gameState.clearSelection()
- [ ] Triggers onStateChange callback

**playSelectedHand():**
- [ ] Validates game is active
- [ ] Validates not in shop
- [ ] Validates selectedCards.length > 0
- [ ] Validates handsRemaining > 0
- [ ] Calls gameState.playHand()
- [ ] Checks if level complete: calls completeBlind()
- [ ] Checks if game over: calls triggerDefeat()
- [ ] Triggers onStateChange callback
- [ ] Auto-saves game state
- [ ] Returns ScoreResult
- [ ] Throws errors for invalid states

**discardSelected():**
- [ ] Validates game is active
- [ ] Validates not in shop
- [ ] Validates selectedCards.length > 0
- [ ] Validates discardsRemaining > 0
- [ ] Calls gameState.discardCards()
- [ ] Triggers onStateChange callback
- [ ] Auto-saves game state
- [ ] Throws errors for invalid states

**completeBlind() [PRIVATE]:**
- [ ] Validates level is complete
- [ ] Adds money reward via gameState
- [ ] Applies Golden Joker bonus if present
- [ ] Calls openShop()
- [ ] Triggers onStateChange callback
- [ ] Logs operation

**openShop():**
- [ ] Validates game is active
- [ ] Validates not already in shop
- [ ] Creates new Shop instance
- [ ] Generates 4 random items (mix of jokers, planets, tarots)
- [ ] Sets isInShop = true
- [ ] Triggers onShopOpen callback with shop
- [ ] Throws error if already in shop
- [ ] Logs operation

**purchaseShopItem(itemId):**
- [ ] Validates in shop
- [ ] Gets item from shop by itemId
- [ ] Checks if player can afford item
- [ ] Handles different item types:
  - **Joker:** Checks inventory space, adds or requires replacement
  - **Planet:** Applies upgrade immediately via gameState.upgradeManager
  - **Tarot:** Checks inventory space, adds or requires replacement
- [ ] If successful: spends money, removes item from shop, returns true
- [ ] If insufficient money: returns false
- [ ] If inventory full: returns false (UI should prompt replacement)
- [ ] Triggers onStateChange callback
- [ ] Auto-saves game state
- [ ] Throws error if not in shop or invalid itemId

**rerollShop():**
- [ ] Validates in shop
- [ ] Gets reroll cost from shop
- [ ] Attempts gameState.spendMoney(rerollCost)
- [ ] If successful: regenerates shop items, returns true
- [ ] If insufficient money: returns false
- [ ] Triggers onStateChange and onShopOpen callbacks
- [ ] Auto-saves game state
- [ ] Throws error if not in shop

**exitShop():**
- [ ] Validates in shop
- [ ] Sets shop = null
- [ ] Sets isInShop = false
- [ ] Calls gameState.advanceToNextBlind()
- [ ] Calls gameState.dealHand()
- [ ] Checks if boss blind (optional boss intro via callback)
- [ ] Triggers onShopClose and onStateChange callbacks
- [ ] Auto-saves game state
- [ ] Throws error if not in shop

**useConsumable(tarotId, targetCardId?):**
- [ ] Validates game is active
- [ ] Validates not in shop
- [ ] Gets tarot from gameState
- [ ] If requires target: gets target card from hand by targetCardId
- [ ] Calls gameState.useConsumable(tarotId, target)
- [ ] Triggers onStateChange callback
- [ ] Auto-saves game state
- [ ] Throws errors for invalid states

**addJoker(joker):**
- [ ] Validates in shop
- [ ] Calls gameState.addJoker(joker)
- [ ] Returns true if added, false if inventory full
- [ ] Wrapper method for GameState

**replaceJoker(oldJokerId, newJoker):**
- [ ] Validates in shop
- [ ] Calls gameState.replaceJoker(oldJokerId, newJoker)
- [ ] Wrapper method for GameState

**addConsumable(tarot):**
- [ ] Validates in shop
- [ ] Calls gameState.addConsumable(tarot)
- [ ] Returns true if added, false if inventory full
- [ ] Wrapper method for GameState

**replaceConsumable(oldTarotId, newTarot):**
- [ ] Validates in shop
- [ ] Calls gameState.replaceConsumable(oldTarotId, newTarot)
- [ ] Wrapper method for GameState

**checkVictoryCondition() [PRIVATE]:**
- [ ] Calculates if player passed 8 rounds (24 levels)
- [ ] Returns levelNumber > 24
- [ ] Or checks if roundNumber > 8

**checkDefeatCondition() [PRIVATE]:**
- [ ] Calls gameState.isGameOver()
- [ ] Returns boolean

**triggerVictory() [PRIVATE]:**
- [ ] Sets isGameActive = false
- [ ] Saves game as completed
- [ ] Triggers onVictory callback
- [ ] Logs operation

**triggerDefeat() [PRIVATE]:**
- [ ] Sets isGameActive = false
- [ ] Saves game as lost (or doesn't save)
- [ ] Triggers onDefeat callback
- [ ] Logs operation

**getGameState():**
- [ ] Returns gameState
- [ ] Throws error if game not initialized

**getShop():**
- [ ] Returns shop (may be null)

**isActive():**
- [ ] Returns isGameActive boolean

**isInShopMode():**
- [ ] Returns isInShop boolean

**saveGame():**
- [ ] Validates game is active
- [ ] Calls gamePersistence.saveGame(gameState)
- [ ] Handles errors gracefully (logs but doesn't throw)

**resetGame():**
- [ ] Sets gameState = null
- [ ] Sets shop = null
- [ ] Sets isGameActive = false
- [ ] Sets isInShop = false
- [ ] Calls gamePersistence.clearSavedGame()
- [ ] Logs operation

### Integration Flow Verification:

**Complete game flow:**
1. startNewGame() → gameState created, hand dealt
2. selectCard() × 2 → 2 cards selected
3. playSelectedHand() → score calculated, level progress
4. Continue until level complete → completeBlind() → openShop()
5. purchaseShopItem() → buy joker
6. exitShop() → advance to next level, new hand dealt
7. Repeat through 24 levels → triggerVictory()

**Boss blind flow:**
1. Reach level 3 (boss blind)
2. exitShop() detects boss blind
3. Optional: callback for boss introduction screen
4. Boss modifiers applied by GameState
5. Play through boss level

**Defeat flow:**
1. playSelectedHand() with insufficient score
2. handsRemaining decrements
3. After 3rd hand: checkDefeatCondition() returns true
4. triggerDefeat() called
5. onDefeat callback triggered

### Edge Cases Handling:

- [ ] Starting new game while game active (resets properly)
- [ ] Loading non-existent save (returns false, no error)
- [ ] Actions while game not active (throws error)
- [ ] Actions while in shop (blocked appropriately)
- [ ] Shop actions while not in shop (throws error)
- [ ] Purchasing with insufficient money (returns false)
- [ ] Adding 6th joker (returns false)
- [ ] Rerolling with insufficient money (returns false)
- [ ] Exiting shop advances level automatically
- [ ] Victory checked after level completion
- [ ] Defeat checked after each hand
- [ ] Auto-save on every significant action
- [ ] Callbacks can be undefined (no error)
- [ ] Persistence errors don't crash game

### Exception Management:

- [ ] Clear error messages for all invalid operations
- [ ] Errors include context (game state, shop state)
- [ ] User-friendly messages for common errors
- [ ] Errors logged for debugging
- [ ] No silent failures

**Score:** __/10

**Unmet requirements:**
[List any requirements not properly implemented]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Naming Analysis:

**Descriptive names:**
- [ ] Class name clear (GameController)
- [ ] Method names descriptive (playSelectedHand, purchaseShopItem)
- [ ] Variable names meaningful (isInShop, isGameActive)
- [ ] Callback names clear (onStateChange, onVictory)

**Consistency:**
- [ ] All action methods follow verb pattern
- [ ] Private methods have descriptive names
- [ ] Wrapper methods clearly named (addJoker, replaceJoker)
- [ ] Boolean methods use is/has prefix

### Documentation Analysis:

**TSDoc comments:**
- [ ] Class-level documentation explaining orchestrator role
- [ ] All public methods documented
- [ ] Callback parameters documented
- [ ] Complex flows documented (shop lifecycle, level progression)
- [ ] Parameters documented
- [ ] Return values documented
- [ ] Exceptions documented

**Orchestration flow documentation:**
- [ ] Game flow explained (start → play → complete → shop → advance)
- [ ] Shop lifecycle documented (open → purchase/reroll → exit)
- [ ] Victory/defeat conditions explained
- [ ] Auto-save behavior documented

**Code comments:**
- [ ] Complex validation logic commented
- [ ] Callback triggering explained
- [ ] State transitions noted
- [ ] No obvious/redundant comments

**Self-documenting code:**
- [ ] Method names explain orchestration steps
- [ ] Clear separation of concerns
- [ ] Logical method ordering

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### SOLID Principles:

**Single Responsibility:**
- [ ] Controller: Only orchestrates, doesn't implement logic
- [ ] No domain logic in controller
- [ ] No UI rendering in controller
- [ ] No persistence implementation (delegates to GamePersistence)
- [ ] No shop item generation (delegates to Shop)

**Open/Closed:**
- [ ] Can add new callbacks without modifying existing code
- [ ] Can extend with new game modes via composition
- [ ] Callbacks provide extension points

**Liskov Substitution:** N/A (no inheritance)

**Interface Segregation:**
- [ ] Callbacks are optional (clients choose what to implement)
- [ ] No forcing clients to implement unused methods

**Dependency Inversion:**
- [ ] Depends on GameState abstraction
- [ ] Depends on Shop abstraction
- [ ] Depends on GamePersistence abstraction

### DRY Principle:

- [ ] No duplicate validation logic
- [ ] Auto-save pattern extracted to helper method
- [ ] Callback triggering pattern consistent
- [ ] Error handling patterns reused

### KISS Principle:

- [ ] Orchestration logic straightforward
- [ ] No over-complicated patterns
- [ ] Clear method responsibilities
- [ ] Appropriate delegation

### Input Validation:

- [ ] Game state validated before all operations
- [ ] Shop state validated for shop operations
- [ ] Card IDs validated
- [ ] Money amounts validated
- [ ] Null checks before using gameState/shop

### Error Handling:

- [ ] Try-catch around persistence operations
- [ ] Errors don't crash game
- [ ] Graceful degradation on save failures
- [ ] User-friendly error messages

### Callback Safety:

- [ ] Checks if callback exists before calling
- [ ] Callback errors don't break game flow
- [ ] Callbacks called at appropriate times

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

[Provide 2-3 lines about the general state of GameController. Example: "GameController successfully orchestrates game flow with proper delegation to GameState and services. Shop lifecycle and level progression work correctly. Victory/defeat detection functions properly. Minor improvements needed in extracting validation patterns and enhancing error messages."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Shop Not Opening After Level Complete"]
- **Location:** Lines [X-Y] in completeBlind method
- **Impact:** Players cannot access shop, breaking progression
- **Proposed solution:** Call openShop() after adding money reward

### Issue 2: [Title - e.g., "Level Not Advancing After Shop Exit"]
- **Location:** Lines [X-Y] in exitShop method
- **Impact:** Game stuck at same level
- **Proposed solution:** Call gameState.advanceToNextBlind() before dealHand()

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Validation Logic Duplicated"]
- **Location:** Multiple methods (playSelectedHand, discardSelected, etc.)
- **Suggestion:** Extract to private validation methods (validateGameActive, validateNotInShop)

### Issue 2: [Title - e.g., "Auto-save After Every Action"]
- **Location:** Throughout controller
- **Suggestion:** Extract to private autoSave() method with error handling

---

## Positive Aspects:

- [e.g., "Clean separation between orchestration and domain logic"]
- [e.g., "Proper delegation to GameState for all game operations"]
- [e.g., "Callback system provides loose coupling with UI"]
- [e.g., "Shop lifecycle correctly managed (open → interact → exit)"]
- [e.g., "Victory and defeat conditions properly detected"]
- [e.g., "Auto-save ensures progress preservation"]

---

## Recommended Refactorings:

### Refactoring 1: Extract Validation Helpers

**BEFORE:**
```typescript
// Repeated in multiple methods
playSelectedHand(): ScoreResult {
  if (!this.isGameActive) {
    throw new Error('Game is not active');
  }
  if (this.isInShop) {
    throw new Error('Cannot play hand while in shop');
  }
  // ... method logic
}

discardSelected(): void {
  if (!this.isGameActive) {
    throw new Error('Game is not active');
  }
  if (this.isInShop) {
    throw new Error('Cannot discard while in shop');
  }
  // ... method logic
}
```

**AFTER (proposal):**
```typescript
private validateGameActive(): void {
  if (!this.isGameActive || !this.gameState) {
    throw new Error('Game is not active. Please start a new game.');
  }
}

private validateNotInShop(): void {
  if (this.isInShop) {
    throw new Error('This action cannot be performed while in the shop.');
  }
}

private validateInShop(): void {
  if (!this.isInShop || !this.shop) {
    throw new Error('Shop is not open.');
  }
}

// Usage in methods
playSelectedHand(): ScoreResult {
  this.validateGameActive();
  this.validateNotInShop();
  // ... method logic
}

discardSelected(): void {
  this.validateGameActive();
  this.validateNotInShop();
  // ... method logic
}
```

**Rationale:** Reduces duplication and centralizes validation logic

---

### Refactoring 2: Extract Auto-save Helper

**BEFORE:**
```typescript
// Repeated after many actions
playSelectedHand(): ScoreResult {
  // ... game logic
  try {
    this.gamePersistence.saveGame(this.gameState);
  } catch (error) {
    console.error('Failed to save game:', error);
  }
  return result;
}

discardSelected(): void {
  // ... game logic
  try {
    this.gamePersistence.saveGame(this.gameState);
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}
```

**AFTER (proposal):**
```typescript
private autoSave(): void {
  if (!this.gameState) return;
  
  try {
    this.gamePersistence.saveGame(this.gameState);
    console.log('Game auto-saved');
  } catch (error) {
    console.error('Failed to auto-save game:', error);
    // Don't throw - saving failure shouldn't break game
  }
}

// Usage in methods
playSelectedHand(): ScoreResult {
  // ... game logic
  this.autoSave();
  return result;
}

discardSelected(): void {
  // ... game logic
  this.autoSave();
}
```

**Rationale:** Centralizes save logic and error handling

---

### Refactoring 3: Extract Callback Trigger Helper

**BEFORE:**
```typescript
// Repeated callback patterns
playSelectedHand(): ScoreResult {
  // ... game logic
  if (this.onStateChange) {
    this.onStateChange(this.gameState);
  }
  return result;
}
```

**AFTER (proposal):**
```typescript
private triggerStateChange(): void {
  if (this.onStateChange && this.gameState) {
    try {
      this.onStateChange(this.gameState);
    } catch (error) {
      console.error('State change callback error:', error);
      // Don't throw - callback errors shouldn't break game
    }
  }
}

// Usage
playSelectedHand(): ScoreResult {
  // ... game logic
  this.triggerStateChange();
  return result;
}
```

**Rationale:** Adds safety and consistency to callback invocations

---

## Decision:

Select one:

- [ ] ✅ **APPROVED** - Ready for integration
  - All orchestration working correctly
  - Proper delegation to GameState and services
  - Shop lifecycle managed properly
  - Victory/defeat detection correct
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality works
  - Validation refactoring recommended
  - Error messages could be more user-friendly
  - Technical debt tracked

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical orchestration bugs
  - Shop lifecycle broken
  - Level progression not working
  - Must fix before UI integration
