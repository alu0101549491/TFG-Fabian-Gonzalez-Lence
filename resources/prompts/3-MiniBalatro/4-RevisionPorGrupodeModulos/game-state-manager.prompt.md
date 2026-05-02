# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Game State Management

**Components under review:**
- `GameState` (class) - `src/models/game/game-state.ts`

**Component objective:** 
Implement the central game state manager that coordinates all game subsystems. This is the most critical and complex class in the domain layer, responsible for maintaining complete game state, enforcing game rules, managing player actions (deal, play, discard), coordinating deck/hand/inventory management, and orchestrating level progression. Acts as the single source of truth for the entire game.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR1:** Deal initial hand of 8 cards at the start of each level
- Acceptance: Exactly 8 cards dealt from deck
- Acceptance: Cards visible to player

**FR2:** Selection of up to 5 cards to play a poker hand
- Acceptance: Player can select 1-5 cards
- Acceptance: Cannot select more than 5

**FR4:** Discard cards up to 3 times per level
- Acceptance: Discards decremented correctly
- Acceptance: Cannot discard when discards = 0

**FR5:** Automatic replacement of discarded cards
- Acceptance: Discarded cards replaced immediately
- Acceptance: Hand remains at 8 cards after discard

**FR6:** Limit of 3 playable hands per level
- Acceptance: Hands decremented after each play
- Acceptance: Cannot play when hands = 0

**FR10:** Victory upon reaching level point goal
- Acceptance: Level completes when score >= goal
- Acceptance: Shop opens after completion

**FR11:** Defeat upon exhausting 3 hands without reaching goal
- Acceptance: Game over when hands = 0 and score < goal

**FR12:** Management of three simultaneous hand types (main hand, jokers, consumables)
- Acceptance: Max 5 jokers enforced
- Acceptance: Max 2 consumables enforced
- Acceptance: Planets applied immediately

**FR17:** Economy system with initial money of $5
- Acceptance: Game starts with $5
- Acceptance: Money tracked accurately

**FR28:** Game persistence (save state to localStorage/JSON)
- Acceptance: Complete state can be serialized
- Acceptance: State structure supports persistence

**FR29:** Continuation of saved games
- Acceptance: State can be restored from save

**Section 9: Detailed Economy System**

**Initial money and income:**
- Start with $5
- Small Blind: +$2
- Big Blind: +$5
- Boss Blind: +$10
- Golden Joker: +$2 additional per level

**Inventory limits:**
- Jokers: Max 5 (must replace if adding 6th)
- Consumables (Tarot): Max 2 (must replace if adding 3rd)
- Planets: Applied immediately, no inventory

**Section 11: Complete Game Flow**

**Game initialization:**
1. Money = $5
2. Deck = 52 standard shuffled cards
3. Jokers = empty
4. Consumables = empty
5. Level = 1 (Small Blind)
6. Round = 1
7. Hands = 3, Discards = 3
8. Deal initial 8-card hand

**Level development:**
1. Player selects cards (0-5)
2. Player chooses: Play Hand OR Discard
3. Play Hand:
   - Score calculated
   - Accumulated score updated
   - Hands remaining decremented
   - Check level completion or game over
4. Discard:
   - Cards discarded and replaced
   - Discards remaining decremented
5. Repeat until level complete or game over

**Level completion:**
1. Add money reward
2. Apply Golden Joker bonus if present
3. Advance to next blind
4. Reset hands = 3, discards = 3 (or modified by boss)
5. Deal new 8-card hand
6. Open shop

## Key Acceptance Criteria:

**GameState Class - Properties:**
- [ ] deck: Deck
- [ ] currentHand: Card[]
- [ ] selectedCards: Card[]
- [ ] jokers: Joker[]
- [ ] consumables: Tarot[]
- [ ] currentBlind: Blind
- [ ] money: number
- [ ] accumulatedScore: number
- [ ] handsRemaining: number
- [ ] discardsRemaining: number
- [ ] levelNumber: number
- [ ] roundNumber: number
- [ ] upgradeManager: HandUpgradeManager
- [ ] blindGenerator: BlindGenerator
- [ ] scoreCalculator: ScoreCalculator

**GameState Class - Core Methods:**
- [ ] constructor() - Initializes new game
- [ ] dealHand() - Deals 8 cards to hand
- [ ] selectCard(cardId) - Toggles card selection
- [ ] clearSelection() - Clears all selected cards
- [ ] playHand() - Plays selected cards, calculates score
- [ ] discardCards() - Discards selected cards, draws replacements
- [ ] addJoker(joker) - Adds joker if space available
- [ ] replaceJoker(oldId, newJoker) - Replaces existing joker
- [ ] removeJoker(jokerId) - Removes joker from inventory
- [ ] addConsumable(tarot) - Adds tarot if space available
- [ ] replaceConsumable(oldId, newTarot) - Replaces existing tarot
- [ ] useConsumable(tarotId, target?) - Uses tarot card
- [ ] addMoney(amount) - Adds money to balance
- [ ] spendMoney(amount) - Spends money if sufficient
- [ ] getMoney() - Returns current money
- [ ] isLevelComplete() - Checks if goal reached
- [ ] isGameOver() - Checks if game lost
- [ ] advanceToNextBlind() - Progresses to next level
- [ ] applyBlindModifiers() - Applies boss effects
- [ ] reset() - Resets for new game

**GameState Class - Getter Methods:**
- [ ] getCurrentHand() - Returns hand cards (copy)
- [ ] getSelectedCards() - Returns selected cards (copy)
- [ ] getJokers() - Returns jokers (copy)
- [ ] getConsumables() - Returns consumables (copy)
- [ ] getCurrentBlind() - Returns current blind
- [ ] getHandsRemaining() - Returns hands left
- [ ] getDiscardsRemaining() - Returns discards left
- [ ] getAccumulatedScore() - Returns current score
- [ ] getLevelNumber() - Returns current level
- [ ] getRoundNumber() - Returns current round

## Edge Cases to Handle:

**Initialization:**
- Deck properly shuffled
- All inventories empty
- Correct starting values

**Card selection:**
- Selecting 6th card when 5 already selected (blocked)
- Deselecting already selected card
- Selecting non-existent card ID (error)

**Playing hand:**
- Playing with 0 cards selected (error)
- Playing with 0 hands remaining (error)
- Playing when level already complete (allowed, but unnecessary)
- Score calculation triggers level completion
- Score calculation triggers game over

**Discarding:**
- Discarding with 0 cards selected (error)
- Discarding with 0 discards remaining (error)
- Deck has fewer than discarded cards (reshuffle or error)

**Joker management:**
- Adding 6th joker when 5 present (returns false)
- Removing non-existent joker (error)
- Replacing non-existent joker (error)

**Consumable management:**
- Adding 3rd tarot when 2 present (returns false)
- Using non-existent tarot (error)
- Using targeted tarot without target (error)
- Instant tarot effect on game state

**Money management:**
- Spending more than available (returns false)
- Negative money amounts (error)
- Money overflow (unlikely but handle)

**Level progression:**
- Advancing when level not complete (error)
- Boss blind applies modifiers correctly
- Hands/discards reset correctly
- Score reset to 0
- Golden Joker bonus applied

**Boss modifiers:**
- The Water: discards = 0 at start
- The Needle: hands = 1 at start
- The Mouth: hand type restriction (not enforced in state, but tracked)

---

# CLASS DIAGRAM

```
class GameState {
    -deck: Deck
    -currentHand: Card[]
    -selectedCards: Card[]
    -jokers: Joker[]
    -consumables: Tarot[]
    -currentBlind: Blind
    -money: number
    -accumulatedScore: number
    -handsRemaining: number
    -discardsRemaining: number
    -levelNumber: number
    -roundNumber: number
    -upgradeManager: HandUpgradeManager
    -blindGenerator: BlindGenerator
    -scoreCalculator: ScoreCalculator
    
    +constructor()
    +dealHand(): void
    +selectCard(cardId: string): void
    +clearSelection(): void
    +playHand(): ScoreResult
    +discardCards(): void
    +addJoker(joker: Joker): boolean
    +replaceJoker(oldJokerId: string, newJoker: Joker): void
    +removeJoker(jokerId: string): void
    +addConsumable(tarot: Tarot): boolean
    +replaceConsumable(oldTarotId: string, newTarot: Tarot): void
    +useConsumable(tarotId: string, target?: Card): void
    +addMoney(amount: number): void
    +spendMoney(amount: number): boolean
    +getMoney(): number
    +isLevelComplete(): boolean
    +isGameOver(): boolean
    +advanceToNextBlind(): void
    -applyBlindModifiers(): void
    +reset(): void
    +getCurrentHand(): Card[]
    +getSelectedCards(): Card[]
    +getJokers(): Joker[]
    +getConsumables(): Tarot[]
    +getCurrentBlind(): Blind
    +getHandsRemaining(): number
    +getDiscardsRemaining(): number
    +getAccumulatedScore(): number
    +getLevelNumber(): number
    +getRoundNumber(): number
}

GameState --> Deck : owns
GameState --> Card : manages
GameState --> Joker : contains
GameState --> Tarot : contains
GameState --> Blind : has current
GameState --> HandUpgradeManager : owns
GameState --> BlindGenerator : uses
GameState --> ScoreCalculator : uses
GameState --> ScoreResult : receives
```

---

# CODE TO REVIEW

- `game-state.ts` - GameState class (central state manager)

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation respect the class diagram structure?
- [ ] All properties defined with correct types
- [ ] All methods from diagram implemented
- [ ] Private method (applyBlindModifiers) actually private
- [ ] Dependencies properly injected or instantiated
- [ ] No circular dependencies

**Specific checks for this module:**
- [ ] deck is Deck instance
- [ ] currentHand and selectedCards are Card arrays
- [ ] jokers is Joker array (max 5)
- [ ] consumables is Tarot array (max 2)
- [ ] currentBlind is Blind instance
- [ ] Numeric properties correctly typed
- [ ] upgradeManager, blindGenerator, scoreCalculator instantiated
- [ ] Constructor initializes all properties
- [ ] Getter methods return copies (not references to internal arrays)

**State integrity:**
- [ ] State transitions are atomic
- [ ] Invariants maintained (hands always 0-3, discards 0-3, etc.)
- [ ] No invalid intermediate states
- [ ] All modifications go through proper methods

**Score:** __/10

**Observations:**
[Document any deviations from the class diagram or architectural concerns]

---

## 2. CODE QUALITY (Weight: 25%)

### Complexity Analysis:

**Check each method for cyclomatic complexity (target: ≤10):**

**Critical methods (likely complex):**
- [ ] constructor (initialization logic)
- [ ] playHand (scoring, completion check, game over check)
- [ ] advanceToNextBlind (progression logic, boss handling)
- [ ] useConsumable (targeted vs instant logic)
- [ ] applyBlindModifiers (boss-specific modifications)

**Medium complexity methods:**
- [ ] dealHand
- [ ] selectCard
- [ ] discardCards
- [ ] addJoker
- [ ] replaceJoker
- [ ] addConsumable
- [ ] replaceConsumable
- [ ] spendMoney

**Simple methods:**
- [ ] clearSelection
- [ ] removeJoker
- [ ] addMoney
- [ ] getMoney
- [ ] isLevelComplete
- [ ] isGameOver
- [ ] All getters

**Methods exceeding complexity threshold:**
[List any methods with complexity >10 - particularly watch playHand and advanceToNextBlind]

### Coupling Analysis:

**Fan-out (dependencies):**
- GameState depends on: Deck, Card, Joker, Tarot, Blind, BlindGenerator, HandUpgradeManager, ScoreCalculator, ScoreResult, HandEvaluator
- **Expected fan-out:** Very High (central coordinator)

**Fan-in (dependents):**
- GameState used by: GameController (primary), possibly services
- **Expected fan-in:** Low-Moderate (should be abstracted by controller)

**Coupling concerns:**
- [ ] GameState doesn't depend on UI components
- [ ] GameState doesn't depend on persistence layer
- [ ] GameState doesn't depend on shop system directly
- [ ] All dependencies are domain layer classes

**God Object risk:**
- [ ] GameState coordinates but doesn't implement all logic
- [ ] Responsibilities delegated to specialized classes (Deck, ScoreCalculator)
- [ ] Methods focused and cohesive
- [ ] Not exceeding reasonable size (~500-700 lines)

### Cohesion Analysis:

**GameState cohesion:**
- [ ] All methods relate to game state management
- [ ] No UI rendering logic
- [ ] No persistence logic (serialization separate)
- [ ] No shop logic (managed by Shop service)
- [ ] Single responsibility: Maintain and coordinate game state

**Cohesion issues:**
[Document any methods that don't belong in GameState]

### Code Smells Detection:

**Long Method (>50 lines):**
- [ ] Check constructor
- [ ] Check playHand
- [ ] Check advanceToNextBlind
- [ ] Check useConsumable

**Large Class (>700 lines):**
- [ ] Total class size (expected: 500-700 lines)
- [ ] If > 700 lines, identify candidates for extraction

**Feature Envy:**
- [ ] GameState modifying Deck internals too much?
- [ ] GameState accessing too much Card internal state?

**Code Duplication:**
- [ ] Inventory limit checks (jokers, consumables)
- [ ] Validation patterns repeated
- [ ] Array manipulation patterns

**Magic Numbers:**
- [ ] Max jokers (5) should be constant
- [ ] Max consumables (2) should be constant
- [ ] Hand size (8) should be constant
- [ ] Initial hands/discards (3) should be constant
- [ ] Initial money ($5) should be constant

**Primitive Obsession:**
- [ ] Using proper classes (Deck, not card array)
- [ ] Using proper enums where applicable

**Temporal Coupling:**
- [ ] dealHand must be called after advanceToNextBlind
- [ ] playHand requires cards selected first
- [ ] Document temporal requirements

**Score:** __/10

**Detected code smells:**
[List specific code smells with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**Constructor:**
- [ ] Initializes money = $5
- [ ] Creates new shuffled Deck
- [ ] Initializes currentHand = []
- [ ] Initializes selectedCards = []
- [ ] Initializes jokers = []
- [ ] Initializes consumables = []
- [ ] Initializes levelNumber = 1
- [ ] Initializes roundNumber = 1
- [ ] Generates first blind (level 1, Small Blind)
- [ ] Initializes handsRemaining = 3
- [ ] Initializes discardsRemaining = 3
- [ ] Initializes accumulatedScore = 0
- [ ] Creates HandUpgradeManager
- [ ] Creates HandEvaluator
- [ ] Creates ScoreCalculator
- [ ] Creates BlindGenerator

**dealHand():**
- [ ] Draws exactly 8 cards from deck
- [ ] Populates currentHand array
- [ ] Clears selectedCards
- [ ] Throws error if deck has < 8 cards
- [ ] Logs operation

**selectCard(cardId):**
- [ ] Finds card by ID in currentHand
- [ ] If not selected and < 5 selected: adds to selectedCards
- [ ] If already selected: removes from selectedCards
- [ ] Throws error if cardId not in currentHand
- [ ] Logs operation

**clearSelection():**
- [ ] Empties selectedCards array
- [ ] No errors possible

**playHand():**
- [ ] Validates selectedCards.length >= 1
- [ ] Validates handsRemaining > 0
- [ ] Calls scoreCalculator.calculateScore with selected cards, jokers, deck size, blind modifier
- [ ] Adds calculated score to accumulatedScore
- [ ] Decrements handsRemaining
- [ ] Clears selectedCards
- [ ] Cards remain in currentHand (not discarded)
- [ ] Returns ScoreResult
- [ ] Logs operation with score
- [ ] Throws error if no cards selected
- [ ] Throws error if handsRemaining = 0

**discardCards():**
- [ ] Validates selectedCards.length >= 1
- [ ] Validates discardsRemaining > 0
- [ ] Moves selected cards to deck's discard pile
- [ ] Removes selected cards from currentHand
- [ ] Draws same number of cards from deck
- [ ] Adds drawn cards to currentHand
- [ ] Decrements discardsRemaining
- [ ] Clears selectedCards
- [ ] Throws error if no cards selected
- [ ] Throws error if discardsRemaining = 0
- [ ] Throws error if deck can't provide replacements
- [ ] Logs operation

**addJoker(joker):**
- [ ] Validates joker not null
- [ ] If jokers.length < 5: adds joker, returns true
- [ ] If jokers.length = 5: returns false
- [ ] Logs operation

**replaceJoker(oldJokerId, newJoker):**
- [ ] Finds joker with oldJokerId
- [ ] Replaces with newJoker
- [ ] Maintains array order
- [ ] Throws error if oldJokerId not found
- [ ] Validates newJoker not null
- [ ] Logs operation

**removeJoker(jokerId):**
- [ ] Finds and removes joker with jokerId
- [ ] Throws error if jokerId not found
- [ ] Logs operation

**addConsumable(tarot):**
- [ ] Validates tarot not null
- [ ] If consumables.length < 2: adds tarot, returns true
- [ ] If consumables.length = 2: returns false
- [ ] Logs operation

**replaceConsumable(oldTarotId, newTarot):**
- [ ] Finds tarot with oldTarotId
- [ ] Replaces with newTarot
- [ ] Maintains array order
- [ ] Throws error if oldTarotId not found
- [ ] Validates newTarot not null
- [ ] Logs operation

**useConsumable(tarotId, target?):**
- [ ] Finds tarot with tarotId
- [ ] Checks if tarot.requiresTarget()
- [ ] If requires target: validates target provided
- [ ] If instant: calls tarot.use(this) with game state
- [ ] If targeted: calls tarot.use(target) with target card
- [ ] Removes tarot from consumables after use
- [ ] Throws error if tarotId not found
- [ ] Throws error if target required but not provided
- [ ] Throws error if target not valid Card
- [ ] Logs operation

**addMoney(amount):**
- [ ] Validates amount >= 0
- [ ] Increases money by amount
- [ ] Throws error if amount < 0
- [ ] Logs operation

**spendMoney(amount):**
- [ ] Validates amount > 0
- [ ] If money >= amount: decreases money, returns true
- [ ] If money < amount: no change, returns false
- [ ] Throws error if amount <= 0
- [ ] Logs operation

**getMoney():**
- [ ] Returns current money value
- [ ] No side effects

**isLevelComplete():**
- [ ] Returns accumulatedScore >= currentBlind.getScoreGoal()
- [ ] No side effects

**isGameOver():**
- [ ] Returns handsRemaining = 0 AND accumulatedScore < currentBlind.getScoreGoal()
- [ ] No side effects

**advanceToNextBlind():**
- [ ] Validates isLevelComplete() returns true
- [ ] Adds money reward: money += currentBlind.getReward()
- [ ] Checks for Golden Joker, adds +$2 if present
- [ ] Increments levelNumber
- [ ] Updates roundNumber = Math.floor((levelNumber - 1) / 3) + 1
- [ ] Generates next blind using blindGenerator
- [ ] Sets currentBlind to new blind
- [ ] Calls applyBlindModifiers()
- [ ] Resets accumulatedScore = 0
- [ ] Clears currentHand
- [ ] Throws error if level not complete
- [ ] Logs operation

**applyBlindModifiers() [PRIVATE]:**
- [ ] Gets modifier from currentBlind.getModifier()
- [ ] If modifier is null: sets hands = 3, discards = 3
- [ ] If modifier exists:
  - [ ] Sets handsRemaining = modifier.maxHands ?? 3
  - [ ] Sets discardsRemaining = modifier.maxDiscards ?? 3
- [ ] Handles The Water (discards = 0)
- [ ] Handles The Needle (hands = 1)
- [ ] Logs boss modifier application

**reset():**
- [ ] Calls constructor initialization logic
- [ ] Resets all properties to starting values
- [ ] Creates new deck
- [ ] Clears all inventories
- [ ] Resets level/round to 1
- [ ] Logs operation

**Getter methods:**
- [ ] getCurrentHand() returns copy of currentHand array
- [ ] getSelectedCards() returns copy of selectedCards array
- [ ] getJokers() returns copy of jokers array
- [ ] getConsumables() returns copy of consumables array
- [ ] getCurrentBlind() returns currentBlind reference
- [ ] getHandsRemaining() returns handsRemaining value
- [ ] getDiscardsRemaining() returns discardsRemaining value
- [ ] getAccumulatedScore() returns accumulatedScore value
- [ ] getLevelNumber() returns levelNumber value
- [ ] getRoundNumber() returns roundNumber value

### Integration Test Scenarios:

**Complete level flow:**
1. Start game (constructor)
2. Deal hand
3. Select 2 cards (pair)
4. Play hand
5. Verify score accumulated
6. Verify hands decremented
7. Continue until goal reached
8. Advance to next level
9. Verify money added
10. Verify level incremented

**Boss blind flow:**
1. Advance to level 3
2. Verify boss blind generated
3. Verify boss modifier applied (e.g., The Water → discards = 0)
4. Attempt discard (should fail if The Water)
5. Play through boss level

**Inventory management:**
1. Add 5 jokers (all succeed)
2. Attempt to add 6th (fails)
3. Replace a joker (succeeds)
4. Remove a joker (succeeds)
5. Add 2 tarots (all succeed)
6. Attempt to add 3rd (fails)
7. Use a tarot (removed from inventory)

**Game over scenario:**
1. Play hand (score insufficient)
2. Play hand (score still insufficient)
3. Play hand (last hand, score still insufficient)
4. Verify isGameOver() returns true

### Edge Cases Handling:

- [ ] Deck runs out of cards (reshuffle discard or error)
- [ ] Playing with 0 cards selected (error)
- [ ] Discarding with 0 discards (error)
- [ ] Adding 6th joker (returns false)
- [ ] Using non-existent tarot (error)
- [ ] Spending more money than available (returns false)
- [ ] Advancing when level not complete (error)
- [ ] Boss blind with The Water (discards = 0)
- [ ] Boss blind with The Needle (hands = 1)
- [ ] Golden Joker bonus on level completion
- [ ] The Hermit tarot doubling money (including $0)
- [ ] Level completion with exact score match
- [ ] Game over with 0 hands and score < goal

### Exception Management:

- [ ] Clear error messages for all invalid operations
- [ ] Errors include context (card IDs, amounts, state)
- [ ] No silent failures
- [ ] Validation before state mutations

**Score:** __/10

**Unmet requirements:**
[List any requirements not properly implemented]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Naming Analysis:

**Descriptive names:**
- [ ] Class name clear (GameState)
- [ ] Method names descriptive (playHand, discardCards, advanceToNextBlind)
- [ ] Variable names meaningful (handsRemaining, accumulatedScore)
- [ ] No abbreviations or unclear names

**Consistency:**
- [ ] add/remove pattern for inventory (addJoker, removeJoker)
- [ ] get prefix for getters
- [ ] is prefix for boolean methods (isLevelComplete, isGameOver)
- [ ] Consistent parameter naming (cardId, jokerId, tarotId)

### Documentation Analysis:

**TSDoc comments:**
- [ ] Class-level documentation explaining central role
- [ ] All public methods documented
- [ ] Complex operations explained (playHand, advanceToNextBlind)
- [ ] Parameters documented
- [ ] Return values documented
- [ ] Exceptions documented

**State management documentation:**
- [ ] State transitions explained
- [ ] Invariants documented (hands 0-3, etc.)
- [ ] Temporal coupling noted (dealHand after advanceToNextBlind)
- [ ] Boss modifier behavior explained

**Code comments:**
- [ ] Complex state transitions commented
- [ ] Boss-specific logic explained
- [ ] Inventory limit enforcement noted
- [ ] No obvious/redundant comments

**Self-documenting code:**
- [ ] Method names explain operations
- [ ] Clear separation of concerns
- [ ] Logical method grouping

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### SOLID Principles:

**Single Responsibility:**
- [ ] GameState coordinates but delegates implementation
- [ ] Doesn't implement scoring logic (delegates to ScoreCalculator)
- [ ] Doesn't implement hand evaluation (delegates to HandEvaluator)
- [ ] Doesn't implement blind generation (delegates to BlindGenerator)
- [ ] Doesn't implement deck operations (delegates to Deck)

**Open/Closed:**
- [ ] Can extend with new game mechanics via composition
- [ ] New joker/tarot types work without modification
- [ ] New blind types work without modification

**Liskov Substitution:** N/A (no inheritance)

**Interface Segregation:** N/A (concrete class)

**Dependency Inversion:**
- [ ] Depends on Joker interface, not concrete joker types
- [ ] Depends on Tarot interface, not concrete tarot types
- [ ] Depends on Blind abstraction, not concrete blind types

### DRY Principle:

- [ ] No duplicate inventory limit checks
- [ ] No duplicate validation logic
- [ ] Helper methods extract common operations

### KISS Principle:

- [ ] State management straightforward
- [ ] No over-complicated logic
- [ ] Clear method responsibilities
- [ ] Appropriate level of abstraction

### Input Validation:

- [ ] All public methods validate inputs
- [ ] Card IDs validated before operations
- [ ] Numeric values validated (non-negative, positive)
- [ ] Null checks where needed
- [ ] Array bounds checked

### Logging:

- [ ] All state changes logged
- [ ] Method entry/exit logged for critical operations
- [ ] Errors logged with context
- [ ] Debug info for state transitions

### State Encapsulation:

- [ ] Properties private
- [ ] Getters return copies (not references)
- [ ] State only modified through public methods
- [ ] No direct property access from outside

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

[Provide 2-3 lines about the general state of GameState. Example: "GameState successfully implements the central game coordinator with proper delegation to specialized subsystems. State management is clean with appropriate encapsulation. Boss modifier application works correctly. Minor improvements needed in extracting magic numbers and enhancing logging for state transitions."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Cards Not Replaced After Discard"]
- **Location:** Lines [X-Y] in discardCards method
- **Impact:** Hand doesn't maintain 8 cards, breaking game mechanic
- **Proposed solution:** After removing cards, call deck.drawCards(count) and add to currentHand

### Issue 2: [Title - e.g., "Boss Modifier Not Applied"]
- **Location:** Lines [X-Y] in advanceToNextBlind
- **Impact:** The Water and The Needle bosses don't modify hands/discards
- **Proposed solution:** Call applyBlindModifiers() after generating new blind

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Magic Numbers Throughout"]
- **Location:** Multiple locations (constructor, advanceToNextBlind)
- **Suggestion:** Extract to constants: MAX_JOKERS = 5, MAX_CONSUMABLES = 2, HAND_SIZE = 8, INITIAL_HANDS = 3, INITIAL_DISCARDS = 3, INITIAL_MONEY = 5

### Issue 2: [Title - e.g., "Getters Return References"]
- **Location:** getCurrentHand(), getJokers(), etc.
- **Suggestion:** Return copies using spread operator or Array.from() to prevent external mutations

---

## Positive Aspects:

- [e.g., "Clean delegation to specialized subsystems (Deck, ScoreCalculator)"]
- [e.g., "Proper encapsulation with private properties and public methods"]
- [e.g., "Comprehensive inventory management with proper limits"]
- [e.g., "Level progression correctly implements Small → Big → Boss pattern"]
- [e.g., "Boss modifiers properly applied through applyBlindModifiers"]
- [e.g., "State integrity maintained throughout operations"]

---

## Recommended Refactorings:

### Refactoring 1: Extract Constants to GameConfig

**BEFORE:**
```typescript
// Scattered throughout constructor and methods
this.money = 5;
this.handsRemaining = 3;
this.discardsRemaining = 3;
// ... in dealHand
this.currentHand = this.deck.drawCards(8);
// ... in addJoker
if (this.jokers.length < 5) { ... }
```

**AFTER (proposal):**
```typescript
import { GAME_CONFIG } from '../../utils/constants';

constructor() {
  this.money = GAME_CONFIG.INITIAL_MONEY;
  this.handsRemaining = GAME_CONFIG.MAX_HANDS_PER_BLIND;
  this.discardsRemaining = GAME_CONFIG.MAX_DISCARDS_PER_BLIND;
  // ...
}

dealHand(): void {
  this.currentHand = this.deck.drawCards(GAME_CONFIG.HAND_SIZE);
}

addJoker(joker: Joker): boolean {
  if (this.jokers.length < GAME_CONFIG.MAX_JOKERS) { ... }
}
```

**Rationale:** Centralizes configuration for easy balancing and maintenance

---

### Refactoring 2: Extract Inventory Management Helper Methods

**BEFORE:**
```typescript
// Similar logic repeated for jokers and consumables
addJoker(joker: Joker): boolean {
  if (!joker) throw new Error('Joker cannot be null');
  if (this.jokers.length < 5) {
    this.jokers.push(joker);
    console.log(`Added joker: ${joker.name}`);
    return true;
  }
  return false;
}

addConsumable(tarot: Tarot): boolean {
  if (!tarot) throw new Error('Tarot cannot be null');
  if (this.consumables.length < 2) {
    this.consumables.push(tarot);
    console.log(`Added tarot: ${tarot.name}`);
    return true;
  }
  return false;
}
```

**AFTER (proposal):**
```typescript
private addToInventory<T extends { name: string }>(
  inventory: T[],
  item: T,
  maxSize: number,
  itemType: string
): boolean {
  if (!item) throw new Error(`${itemType} cannot be null`);
  if (inventory.length < maxSize) {
    inventory.push(item);
    console.log(`Added ${itemType}: ${item.name}`);
    return true;
  }
  return false;
}

addJoker(joker: Joker): boolean {
  return this.addToInventory(this.jokers, joker, GAME_CONFIG.MAX_JOKERS, 'joker');
}

addConsumable(tarot: Tarot): boolean {
  return this.addToInventory(this.consumables, tarot, GAME_CONFIG.MAX_CONSUMABLES, 'tarot');
}
```

**Rationale:** Reduces duplication and makes inventory logic more maintainable

---

### Refactoring 3: Extract Golden Joker Check

**BEFORE:**
```typescript
// In advanceToNextBlind
money += currentBlind.getReward();
// Check for Golden Joker - inline logic
const goldenJoker = this.jokers.find(j => j.name === 'Golden Joker');
if (goldenJoker) {
  money += 2;
}
```

**AFTER (proposal):**
```typescript
private hasGoldenJoker(): boolean {
  return this.jokers.some(joker => joker.name === 'Golden Joker');
}

private applyLevelRewards(): void {
  this.money += this.currentBlind.getReward();
  
  if (this.hasGoldenJoker()) {
    this.money += 2;
    console.log('Golden Joker bonus: +$2');
  }
}

// In advanceToNextBlind
this.applyLevelRewards();
```

**Rationale:** Extracts economic joker logic and improves readability

---

## Decision:

Select one:

- [ ] ✅ **APPROVED** - Ready for integration
  - All core state management working correctly
  - Proper delegation to subsystems
  - Boss modifiers applied correctly
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality works
  - Minor refactorings recommended
  - Magic numbers should be extracted
  - Technical debt tracked

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical state management bugs
  - Boss modifiers not working
  - Inventory limits not enforced
  - Must fix before controller integration
