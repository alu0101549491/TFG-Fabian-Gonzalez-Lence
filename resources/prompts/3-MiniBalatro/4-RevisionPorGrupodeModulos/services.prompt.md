# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Services Layer - Shop, Persistence, and Configuration

**Components under review:**

### Shop Subsystem:
- `ShopItemType` (enum) - `src/services/shop/shop-item-type.enum.ts`
- `ShopItem` (class) - `src/services/shop/shop-item.ts`
- `ShopItemGenerator` (class) - `src/services/shop/shop-item-generator.ts`
- `Shop` (class) - `src/services/shop/shop.ts`

### Persistence Subsystem:
- `GamePersistence` (class) - `src/services/persistence/game-persistence.ts`

### Configuration Subsystem:
- `GameConfig` (static class) - `src/services/config/game-config.ts`
- `BalancingConfig` (class) - `src/services/config/balancing-config.ts`

**Component objective:** 
Implement cross-cutting services that support the game but are not core domain logic. The Shop manages purchasable items and transactions; GamePersistence handles save/load to browser storage; GameConfig and BalancingConfig centralize all game constants and balancing values for easy tuning.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR19:** Shop between levels with 4 random cards
- Acceptance: Shop generates 4 items randomly
- Acceptance: Mix of jokers, planets, and tarots

**FR20:** Card purchase in shop (jokers $5, planets $3, tarot $3)
- Acceptance: Correct prices enforced
- Acceptance: Purchase validation works

**FR21:** Shop reroll (with configurable cost)
- Acceptance: Reroll regenerates all 4 items
- Acceptance: Reroll cost deducted

**FR28:** Game persistence (save state to localStorage/JSON)
- Acceptance: Complete game state can be serialized
- Acceptance: Save to browser localStorage

**FR29:** Continuation of saved games
- Acceptance: Load from localStorage
- Acceptance: State fully restored

**NFR9:** Configurable values for balancing
- Acceptance: All magic numbers in config files
- Acceptance: Easy to modify without code changes

**Section 9: Detailed Economy System**

**Shop Costs:**
| Item | Cost |
|------|------|
| Joker Card | $5 |
| Planet Card | $3 |
| Tarot Card | $3 |
| Shop Reroll | $3 (configurable) |

**Shop operation:**
- 4 random cards available
- Can purchase if affordable
- Can reroll entire shop for cost
- Exit shop to continue game

**Section 11.2: Level Development**

**Successful level end:**
- Grant money reward
- Open shop with 4 random cards
- Player can buy, reroll, or exit
- Upon exit: advance to next level

## Key Acceptance Criteria:

### ShopItemType Enum:
- [ ] JOKER, PLANET, TAROT defined
- [ ] Helper to get display name
- [ ] Helper to get default cost

### ShopItem Class:
- [ ] id (UUID) for unique identification
- [ ] type (ShopItemType)
- [ ] item (Joker | Planet | Tarot union type)
- [ ] cost (number)
- [ ] Validates non-null item
- [ ] Validates cost > 0
- [ ] Provides getters for all properties

### ShopItemGenerator Class:
- [ ] generateRandomJoker() returns Joker instance
- [ ] generateRandomPlanet() returns Planet instance
- [ ] generateRandomTarot() returns Tarot instance
- [ ] generateShopItems(count) returns array of ShopItems
- [ ] Distribution: ~40% Jokers, 30% Planets, 30% Tarots (configurable)
- [ ] All 15 jokers available for generation
- [ ] All 9 planets available for generation
- [ ] All 10 tarots available for generation
- [ ] Correct costs applied ($5, $3, $3)

### Shop Class:
- [ ] availableItems (ShopItem array, max 4)
- [ ] rerollCost (default $3)
- [ ] generateItems(count) creates shop inventory
- [ ] purchaseItem(itemId, playerMoney) validates and returns item
- [ ] reroll(playerMoney) regenerates items if affordable
- [ ] getAvailableItems() returns item array copy
- [ ] getRerollCost() returns reroll cost
- [ ] getItemCount() returns current item count

### GamePersistence Class:
- [ ] storageKey (default "miniBalatro_save")
- [ ] saveGame(gameState) serializes to localStorage
- [ ] loadGame() deserializes from localStorage
- [ ] hasSavedGame() checks if save exists
- [ ] clearSavedGame() removes save data
- [ ] Handles localStorage unavailable gracefully
- [ ] Handles JSON parse errors gracefully
- [ ] Logs errors without throwing

### GameConfig Static Class:
- [ ] All game constants defined (INITIAL_MONEY, MAX_JOKERS, etc.)
- [ ] getCardValue(cardValue) returns base chip value
- [ ] getHandBaseValues(handType) returns chips/mult
- [ ] getBlindGoal(round, blindType) calculates goal
- [ ] All constants documented
- [ ] Constants match specification values

### BalancingConfig Class:
- [ ] Loads all config data (hands, cards, jokers, planets, tarots)
- [ ] Stores in Maps for efficient lookup
- [ ] getHandValue(handType) returns chips/mult
- [ ] getCardValue(cardValue) returns chips
- [ ] getJokerDefinition(id) returns joker data
- [ ] getPlanetDefinition(id) returns planet data
- [ ] getTarotDefinition(id) returns tarot data
- [ ] getAllJokerIds() returns list of IDs
- [ ] getAllPlanetIds() returns list of IDs
- [ ] getAllTarotIds() returns list of IDs

## Edge Cases to Handle:

**Shop:**
- Purchasing item not in shop (throw error)
- Purchasing with insufficient money (return null)
- Rerolling with insufficient money (return false)
- Shop with 0 items after purchases (valid)
- Generating 0 items (throw error)
- Generating more than 10 items (valid but unusual)

**ShopItemGenerator:**
- Random distribution varies (acceptable)
- All special cards have proper constructors
- Duplicate items in one shop (acceptable)

**GamePersistence:**
- localStorage unavailable (private browsing) - log error, don't throw
- Corrupted JSON in storage - return null on load
- Save data from different game version - handle gracefully
- Large game state exceeding localStorage limits - log error
- Concurrent saves (rapid succession) - last write wins

**GameConfig:**
- Invalid CardValue enum (throw error)
- Invalid HandType enum (throw error)
- Invalid blind type string (throw error)

**BalancingConfig:**
- Missing definition IDs (throw error)
- Invalid data format (throw error)
- Empty configuration (throw error)

---

# CLASS DIAGRAM

```
class ShopItemType {
    <<enumeration>>
    JOKER
    PLANET
    TAROT
}

class ShopItem {
    -id: string
    -type: ShopItemType
    -item: Joker | Planet | Tarot
    -cost: number
    
    +constructor(type: ShopItemType, item: Joker | Planet | Tarot, cost: number)
    +getId(): string
    +getType(): ShopItemType
    +getItem(): Joker | Planet | Tarot
    +getCost(): number
}

class ShopItemGenerator {
    +generateRandomJoker(): Joker
    +generateRandomPlanet(): Planet
    +generateRandomTarot(): Tarot
    +generateShopItems(count: number): ShopItem[]
}

class Shop {
    -availableItems: ShopItem[]
    -rerollCost: number
    
    +constructor(rerollCost?: number)
    +generateItems(count?: number): void
    +purchaseItem(itemId: string, playerMoney: number): ShopItem | null
    +reroll(playerMoney: number): boolean
    +getAvailableItems(): ShopItem[]
    +getRerollCost(): number
    +getItemCount(): number
}

class GamePersistence {
    -storageKey: string
    
    +constructor(storageKey?: string)
    +saveGame(gameState: GameState): void
    +loadGame(): GameState | null
    +hasSavedGame(): boolean
    +clearSavedGame(): void
    -serializeGameState(gameState: GameState): string
    -deserializeGameState(data: string): GameState
}

class GameConfig {
    <<static>>
    +readonly INITIAL_MONEY: number
    +readonly MAX_JOKERS: number
    +readonly MAX_CONSUMABLES: number
    +readonly HAND_SIZE: number
    +readonly MAX_HANDS_PER_BLIND: number
    +readonly MAX_DISCARDS_PER_BLIND: number
    +readonly JOKER_COST: number
    +readonly PLANET_COST: number
    +readonly TAROT_COST: number
    +readonly SHOP_REROLL_COST: number
    +readonly SMALL_BLIND_REWARD: number
    +readonly BIG_BLIND_REWARD: number
    +readonly BOSS_BLIND_REWARD: number
    +readonly VICTORY_ROUNDS: number
    
    +getCardValue(value: CardValue): number
    +getHandBaseValues(handType: HandType): {chips: number, mult: number}
    +getBlindGoal(roundNumber: number, blindType: string): number
}

class BalancingConfig {
    -handValues: Map<HandType, {chips, mult}>
    -cardValues: Map<CardValue, number>
    -jokerDefinitions: any[]
    -planetDefinitions: any[]
    -tarotDefinitions: any[]
    
    +constructor()
    +loadFromJSON(): void
    +getHandValue(handType: HandType): {chips, mult}
    +getCardValue(cardValue: CardValue): number
    +getJokerDefinition(id: string): any
    +getPlanetDefinition(id: string): any
    +getTarotDefinition(id: string): any
    +getAllJokerIds(): string[]
    +getAllPlanetIds(): string[]
    +getAllTarotIds(): string[]
}

Shop --> ShopItem : contains
Shop --> ShopItemGenerator : uses
ShopItem --> ShopItemType : has
ShopItem --> Joker : may contain
ShopItem --> Planet : may contain
ShopItem --> Tarot : may contain
ShopItemGenerator --> Joker : creates
ShopItemGenerator --> Planet : creates
ShopItemGenerator --> Tarot : creates
GamePersistence --> GameState : saves/loads
GameConfig --> CardValue : provides values
GameConfig --> HandType : provides values
BalancingConfig --> HandType : maps
BalancingConfig --> CardValue : maps
```

---

# CODE TO REVIEW

- `shop-item-type.enum.ts` - ShopItemType enum
- `shop-item.ts` - ShopItem class
- `shop-item-generator.ts` - ShopItemGenerator class
- `shop.ts` - Shop class
- `game-persistence.ts` - GamePersistence class
- `game-config.ts` - GameConfig static class
- `balancing-config.ts` - BalancingConfig class

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation respect the class diagram structure?
- [ ] All properties defined with correct types
- [ ] All methods from diagram implemented
- [ ] Private methods actually private
- [ ] Static methods marked as static
- [ ] Enums properly defined

**Specific checks for this module:**

**Shop Subsystem:**
- [ ] ShopItemType enum has 3 values
- [ ] ShopItem has id, type, item, cost properties
- [ ] Shop has availableItems array and rerollCost
- [ ] ShopItemGenerator has only static/instance methods (no state)

**Persistence:**
- [ ] GamePersistence has storageKey property
- [ ] Serialization/deserialization methods are private

**Configuration:**
- [ ] GameConfig has all static readonly properties
- [ ] BalancingConfig has Map properties for data storage
- [ ] GameConfig methods are static
- [ ] BalancingConfig methods are instance methods

**Service layer principles:**
- [ ] Services are stateless where appropriate (ShopItemGenerator, GameConfig)
- [ ] Services don't depend on UI layer
- [ ] Services don't depend on controllers
- [ ] Services provide utility functions to domain layer

**Score:** __/10

**Observations:**
[Document any deviations from the class diagram]

---

## 2. CODE QUALITY (Weight: 25%)

### Complexity Analysis:

**Check each method for cyclomatic complexity (target: ≤10):**

**Shop Subsystem:**
- [ ] ShopItemGenerator.generateRandomJoker (watch for 15 joker types)
- [ ] ShopItemGenerator.generateRandomPlanet (9 planet types)
- [ ] ShopItemGenerator.generateRandomTarot (10 tarot types)
- [ ] ShopItemGenerator.generateShopItems (distribution logic)
- [ ] Shop.purchaseItem
- [ ] Shop.reroll
- [ ] Shop.generateItems

**Persistence:**
- [ ] GamePersistence.saveGame
- [ ] GamePersistence.loadGame
- [ ] GamePersistence.serializeGameState (watch for complex state)
- [ ] GamePersistence.deserializeGameState (watch for reconstruction logic)

**Configuration:**
- [ ] GameConfig.getCardValue (13 cases)
- [ ] GameConfig.getHandBaseValues (9 cases)
- [ ] GameConfig.getBlindGoal
- [ ] BalancingConfig.loadFromJSON (may be complex)

**Methods exceeding complexity threshold:**
[List any methods with complexity >10, especially generation and serialization methods]

### Coupling Analysis:

**Fan-out (dependencies):**
- Shop depends on: ShopItem, ShopItemGenerator, ShopItemType
- ShopItemGenerator depends on: Joker subclasses, Planet, Tarot subclasses, BalancingConfig
- GamePersistence depends on: GameState (and all its dependencies transitively)
- GameConfig depends on: CardValue, HandType
- BalancingConfig depends on: CardValue, HandType
- **Expected fan-out:** Moderate-High for generators and persistence

**Fan-in (dependents):**
- Shop used by: GameController
- ShopItemGenerator used by: Shop
- GamePersistence used by: GameController
- GameConfig used by: All layers
- BalancingConfig used by: ShopItemGenerator, potentially other services
- **Expected fan-in:** Moderate-High

**Coupling concerns:**
- [ ] Services don't depend on UI components
- [ ] Services don't depend on controllers
- [ ] Persistence doesn't depend on storage implementation details (uses localStorage interface)

### Cohesion Analysis:

**Shop subsystem cohesion:**
- [ ] All shop classes relate to shop functionality
- [ ] No game state management in shop
- [ ] No persistence logic in shop

**Persistence cohesion:**
- [ ] GamePersistence only handles save/load
- [ ] No game logic
- [ ] No UI logic

**Configuration cohesion:**
- [ ] Config classes only provide constants and data
- [ ] No game logic
- [ ] No state management

**Cohesion issues:**
[Document any methods that don't belong to their class]

### Code Smells Detection:

**Long Method (>50 lines):**
- [ ] Check ShopItemGenerator.generateRandomJoker (15 joker instances)
- [ ] Check GamePersistence.serializeGameState
- [ ] Check GamePersistence.deserializeGameState
- [ ] Check BalancingConfig.loadFromJSON

**Large Class (>200 lines):**
- [ ] ShopItemGenerator size (creating 34 special card types)
- [ ] GameConfig size (many constants)
- [ ] BalancingConfig size

**Feature Envy:**
- [ ] ShopItemGenerator accessing too much joker/planet/tarot internals?

**Code Duplication:**
- [ ] Similar patterns in generateRandomX methods
- [ ] Repeated try-catch in persistence
- [ ] Repeated Map lookups in BalancingConfig

**Magic Numbers:**
- [ ] Shop item costs ($5, $3, $3) should come from GameConfig
- [ ] Reroll cost ($3) should come from GameConfig
- [ ] Distribution percentages (40%, 30%, 30%) should be constants

**Switch Statements on Type:**
- [ ] GameConfig getCardValue/getHandBaseValues using switch (acceptable)
- [ ] ShopItemGenerator using random selection (acceptable)

**Data Clumps:**
- [ ] chips and mult always together (acceptable, using objects)

**Score:** __/10

**Detected code smells:**
[List specific code smells with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**ShopItemType Enum:**
- [ ] JOKER defined
- [ ] PLANET defined
- [ ] TAROT defined
- [ ] Helper to get display name ("Joker", "Planet Card", "Tarot Card")
- [ ] Helper to get default cost (5, 3, 3)

**ShopItem Class:**
- [ ] Constructor validates type not null
- [ ] Constructor validates item not null
- [ ] Constructor validates cost > 0
- [ ] Generates unique UUID for id
- [ ] getId() returns id
- [ ] getType() returns type
- [ ] getItem() returns item (Joker | Planet | Tarot)
- [ ] getCost() returns cost
- [ ] Throws error if validation fails

**ShopItemGenerator Class:**

**generateRandomJoker():**
- [ ] Returns one of 15 joker types randomly
- [ ] All jokers available: Joker, Greedy Joker, Lusty Joker, Wrathful Joker, Gluttonous Joker, Half Joker, Joker Stencil, Mystic Summit, Fibonacci, Even Steven, Odd Todd, Blue Joker, Hiker, Golden Joker, Triboulet
- [ ] Returns properly constructed Joker instance
- [ ] Uses BalancingConfig if available

**generateRandomPlanet():**
- [ ] Returns one of 9 planet types randomly
- [ ] All planets available: Pluto, Mercury, Uranus, Venus, Saturn, Jupiter, Earth, Mars, Neptune
- [ ] Returns properly constructed Planet instance
- [ ] Correct hand type and bonuses

**generateRandomTarot():**
- [ ] Returns one of 10 tarot types randomly
- [ ] All tarots available: The Hermit, The Empress, The Emperor, Strength, The Hanged Man, Death, The Star, The Moon, The Sun, The World
- [ ] Returns properly constructed Tarot instance (InstantTarot or TargetedTarot)

**generateShopItems(count):**
- [ ] Validates count > 0
- [ ] Generates specified number of items
- [ ] Distribution: ~40% Jokers, ~30% Planets, ~30% Tarots
- [ ] Each item has correct cost (Joker $5, Planet $3, Tarot $3)
- [ ] Each item has unique ID
- [ ] Returns array of ShopItems
- [ ] Throws error if count <= 0

**Shop Class:**

**constructor(rerollCost):**
- [ ] Accepts optional rerollCost (default $3)
- [ ] Validates rerollCost > 0
- [ ] Initializes empty availableItems array

**generateItems(count):**
- [ ] Default count = 4
- [ ] Validates count > 0
- [ ] Uses ShopItemGenerator to create items
- [ ] Replaces availableItems with new array
- [ ] Logs operation

**purchaseItem(itemId, playerMoney):**
- [ ] Finds item by itemId in availableItems
- [ ] Checks if playerMoney >= item.cost
- [ ] If affordable: removes item from availableItems, returns item
- [ ] If not affordable: returns null
- [ ] Throws error if itemId not found
- [ ] Logs operation

**reroll(playerMoney):**
- [ ] Checks if playerMoney >= rerollCost
- [ ] If affordable: generates new items (count = 4), returns true
- [ ] If not affordable: returns false
- [ ] Does not modify money (controller responsibility)
- [ ] Logs operation

**getAvailableItems():**
- [ ] Returns copy of availableItems array (not reference)

**getRerollCost():**
- [ ] Returns rerollCost value

**getItemCount():**
- [ ] Returns availableItems.length

**GamePersistence Class:**

**constructor(storageKey):**
- [ ] Accepts optional storageKey (default "miniBalatro_save")
- [ ] Validates storageKey non-empty
- [ ] Stores storageKey

**saveGame(gameState):**
- [ ] Validates gameState not null
- [ ] Calls serializeGameState
- [ ] Stores in localStorage with storageKey
- [ ] Logs success
- [ ] Catches and logs errors (doesn't throw)
- [ ] Handles localStorage unavailable

**loadGame():**
- [ ] Checks if localStorage has storageKey
- [ ] Retrieves JSON string from localStorage
- [ ] Calls deserializeGameState
- [ ] Returns GameState or null
- [ ] Returns null if no save exists
- [ ] Returns null if JSON parsing fails
- [ ] Logs errors but doesn't throw
- [ ] Handles localStorage unavailable

**hasSavedGame():**
- [ ] Checks localStorage for storageKey
- [ ] Returns boolean
- [ ] Returns false if localStorage unavailable

**clearSavedGame():**
- [ ] Removes storageKey from localStorage
- [ ] Logs operation
- [ ] Doesn't throw on error

**serializeGameState(gameState) [PRIVATE]:**
- [ ] Converts GameState to JSON string
- [ ] Handles all property types correctly
- [ ] Includes: level, round, money, score, hands, discards, deck state, jokers, consumables, upgrades
- [ ] Handles circular references if any
- [ ] Throws error if serialization fails

**deserializeGameState(data) [PRIVATE]:**
- [ ] Parses JSON string to object
- [ ] Reconstructs GameState with all properties
- [ ] Reconstructs Deck with cards
- [ ] Reconstructs Joker instances
- [ ] Reconstructs Tarot instances
- [ ] Reconstructs HandUpgradeManager
- [ ] Throws error if data incomplete or invalid

**GameConfig Static Class:**

**Constants:**
- [ ] INITIAL_MONEY = 5
- [ ] MAX_JOKERS = 5
- [ ] MAX_CONSUMABLES = 2
- [ ] HAND_SIZE = 8
- [ ] MAX_HANDS_PER_BLIND = 3
- [ ] MAX_DISCARDS_PER_BLIND = 3
- [ ] JOKER_COST = 5
- [ ] PLANET_COST = 3
- [ ] TAROT_COST = 3
- [ ] SHOP_REROLL_COST = 3
- [ ] SMALL_BLIND_REWARD = 2
- [ ] BIG_BLIND_REWARD = 5
- [ ] BOSS_BLIND_REWARD = 10
- [ ] VICTORY_ROUNDS = 8

**getCardValue(value):**
- [ ] A = 11
- [ ] K, Q, J = 10
- [ ] 10 = 10
- [ ] 9-2 = face value
- [ ] Throws error if invalid CardValue

**getHandBaseValues(handType):**
- [ ] HIGH_CARD: 5 chips, 1 mult
- [ ] PAIR: 10 chips, 2 mult
- [ ] TWO_PAIR: 20 chips, 2 mult
- [ ] THREE_OF_A_KIND: 30 chips, 3 mult
- [ ] STRAIGHT: 30 chips, 4 mult
- [ ] FLUSH: 35 chips, 4 mult
- [ ] FULL_HOUSE: 40 chips, 4 mult
- [ ] FOUR_OF_A_KIND: 60 chips, 7 mult
- [ ] STRAIGHT_FLUSH: 100 chips, 8 mult
- [ ] Throws error if invalid HandType

**getBlindGoal(roundNumber, blindType):**
- [ ] Base = 300 × (1.5)^(roundNumber-1)
- [ ] 'small': base × 1.0
- [ ] 'big': base × 1.5
- [ ] 'boss': base × 2.0
- [ ] Validates roundNumber > 0
- [ ] Throws error if invalid blindType

**BalancingConfig Class:**

**constructor():**
- [ ] Initializes empty Maps
- [ ] Calls loadFromJSON()

**loadFromJSON():**
- [ ] Populates handValues Map with all 9 hand types
- [ ] Populates cardValues Map with all 13 card values
- [ ] Populates jokerDefinitions array with 15 joker specs
- [ ] Populates planetDefinitions array with 9 planet specs
- [ ] Populates tarotDefinitions array with 10 tarot specs
- [ ] Logs errors if data missing
- [ ] Handles missing data gracefully

**getHandValue(handType):**
- [ ] Returns {chips, mult} for handType
- [ ] Throws error if handType not found

**getCardValue(cardValue):**
- [ ] Returns chip value for cardValue
- [ ] Throws error if cardValue not found

**getJokerDefinition(id):**
- [ ] Returns joker definition object
- [ ] Throws error if id not found

**getPlanetDefinition(id):**
- [ ] Returns planet definition object
- [ ] Throws error if id not found

**getTarotDefinition(id):**
- [ ] Returns tarot definition object
- [ ] Throws error if id not found

**getAllJokerIds():**
- [ ] Returns array of all 15 joker IDs

**getAllPlanetIds():**
- [ ] Returns array of all 9 planet IDs

**getAllTarotIds():**
- [ ] Returns array of all 10 tarot IDs

### Edge Cases Handling:

**Shop:**
- [ ] Purchasing non-existent item (throw error)
- [ ] Purchasing with exact money (succeeds)
- [ ] Rerolling with exact money (succeeds)
- [ ] Shop with 0 items after all purchased (valid)

**ShopItemGenerator:**
- [ ] All special cards instantiate correctly
- [ ] Random distribution varies (acceptable)
- [ ] Duplicate cards in shop (acceptable)

**GamePersistence:**
- [ ] localStorage unavailable (log error, return null)
- [ ] Corrupted JSON (return null)
- [ ] Missing properties in save data (throw error in deserialize)
- [ ] Very large game state (may fail, log error)

**GameConfig:**
- [ ] Invalid enum values (throw error)
- [ ] Round 1 calculates correctly (300)
- [ ] Round 10 calculates correctly (large number)

**BalancingConfig:**
- [ ] Missing definition (throw error)
- [ ] Empty data (throw error)

### Exception Management:

- [ ] Clear error messages
- [ ] Errors include context
- [ ] Persistence errors don't crash game
- [ ] Config errors throw (fail fast)

**Score:** __/10

**Unmet requirements:**
[List any requirements not properly implemented]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Naming Analysis:

**Descriptive names:**
- [ ] Class names clear (Shop, GamePersistence, GameConfig)
- [ ] Method names descriptive (generateShopItems, serializeGameState)
- [ ] Variable names meaningful (availableItems, storageKey)
- [ ] Enum values clear (JOKER, PLANET, TAROT)

**Consistency:**
- [ ] All generator methods follow pattern (generateRandomX)
- [ ] All config getters follow pattern (getX)
- [ ] All persistence methods follow pattern (save/load/clear)
- [ ] Consistent parameter naming

### Documentation Analysis:

**TSDoc comments:**
- [ ] All public classes documented
- [ ] All public methods documented
- [ ] Service responsibilities explained
- [ ] Parameters documented
- [ ] Return values documented
- [ ] Exceptions documented

**Service-specific documentation:**
- [ ] Shop lifecycle explained
- [ ] Persistence strategy documented
- [ ] Config usage examples provided
- [ ] Balancing data structure explained

**Code comments:**
- [ ] Complex generation logic explained
- [ ] Serialization strategy documented
- [ ] Distribution algorithm explained
- [ ] No obvious/redundant comments

**Self-documenting code:**
- [ ] Method names explain purpose
- [ ] Clear service boundaries
- [ ] Logical organization

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### SOLID Principles:

**Single Responsibility:**
- [ ] Shop: Only manages shop inventory and transactions
- [ ] ShopItemGenerator: Only generates special cards
- [ ] GamePersistence: Only handles save/load
- [ ] GameConfig: Only provides constants
- [ ] BalancingConfig: Only provides data lookup

**Open/Closed:**
- [ ] Easy to add new shop item types via enum
- [ ] Easy to add new special cards
- [ ] Config can be extended without modifying code

**Liskov Substitution:** N/A (minimal inheritance)

**Interface Segregation:**
- [ ] Services provide focused interfaces
- [ ] No forcing clients to depend on unused methods

**Dependency Inversion:**
- [ ] Services depend on domain abstractions
- [ ] Persistence uses localStorage interface (could swap)

### DRY Principle:

- [ ] No duplicate special card creation logic
- [ ] Config lookups not duplicated
- [ ] Error handling patterns reused

### KISS Principle:

- [ ] Shop logic straightforward
- [ ] Persistence strategy simple
- [ ] Config lookups direct
- [ ] No over-engineering

### Input Validation:

- [ ] All inputs validated
- [ ] Null checks before operations
- [ ] Numeric values validated
- [ ] Enum values checked

### Error Handling:

- [ ] Persistence errors caught and logged
- [ ] Config errors thrown (fail fast)
- [ ] localStorage unavailable handled
- [ ] JSON errors caught

### Storage Safety:

- [ ] localStorage access wrapped in try-catch
- [ ] No sensitive data in localStorage
- [ ] Storage limits considered

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

[Provide 2-3 lines about the general state of Services. Example: "The services layer provides clean cross-cutting functionality for shop, persistence, and configuration. Shop generation works correctly with proper item distribution. GamePersistence handles save/load gracefully with good error handling. Config classes centralize all game constants effectively."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "ShopItemGenerator Creates Invalid Jokers"]
- **Location:** Lines [X-Y] in shop-item-generator.ts
- **Impact:** Generated jokers don't instantiate correctly, shop broken
- **Proposed solution:** Fix joker constructor calls with proper parameters

### Issue 2: [Title - e.g., "GamePersistence Doesn't Reconstruct Objects"]
- **Location:** Lines [X-Y] in game-persistence.ts
- **Impact:** Loaded game has plain objects instead of class instances
- **Proposed solution:** Reconstruct Deck, Joker, Tarot objects in deserialize

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Hard-coded Shop Costs"]
- **Location:** shop-item-generator.ts
- **Suggestion:** Use GameConfig.JOKER_COST, PLANET_COST, TAROT_COST instead of literals

### Issue 2: [Title - e.g., "Distribution Percentages Magic Numbers"]
- **Location:** shop-item-generator.ts
- **Suggestion:** Extract to constants: JOKER_WEIGHT = 0.4, PLANET_WEIGHT = 0.3, TAROT_WEIGHT = 0.3

---

## Positive Aspects:

- [e.g., "Clean service boundaries with focused responsibilities"]
- [e.g., "ShopItemGenerator produces diverse shop inventories"]
- [e.g., "GamePersistence handles localStorage errors gracefully"]
- [e.g., "GameConfig centralizes all magic numbers effectively"]
- [e.g., "Shop transaction logic is simple and correct"]
- [e.g., "BalancingConfig provides efficient data lookup via Maps"]

---

## Recommended Refactorings:

### Refactoring 1: Extract Special Card Factories

**BEFORE:**
```typescript
// In ShopItemGenerator - large switch/if statements
generateRandomJoker(): Joker {
  const jokerType = Math.floor(Math.random() * 15);
  switch (jokerType) {
    case 0: return new MultJoker('joker', 'Joker', '+4 mult', 4);
    case 1: return new MultJoker('greedy-joker', 'Greedy Joker', '+3 mult per Diamond', 3, /* condition */);
    // ... 13 more cases
  }
}
```

**AFTER (proposal):**
```typescript
// Create factory class or use BalancingConfig definitions
private jokerFactories = [
  () => new MultJoker('joker', 'Joker', '+4 mult', 4),
  () => new MultJoker('greedy-joker', 'Greedy Joker', '+3 mult per Diamond', 3, /* condition */),
  // ... more factories
];

generateRandomJoker(): Joker {
  const index = Math.floor(Math.random() * this.jokerFactories.length);
  return this.jokerFactories[index]();
}
```

**Rationale:** More maintainable and easier to add new jokers

---

### Refactoring 2: Extract Distribution Logic

**BEFORE:**
```typescript
// In generateShopItems
generateShopItems(count: number): ShopItem[] {
  const items: ShopItem[] = [];
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    if (rand < 0.4) {
      // Generate joker
    } else if (rand < 0.7) {
      // Generate planet
    } else {
      // Generate tarot
    }
  }
  return items;
}
```

**AFTER (proposal):**
```typescript
private static readonly JOKER_WEIGHT = 0.4;
private static readonly PLANET_WEIGHT = 0.3;
private static readonly TAROT_WEIGHT = 0.3;

private selectItemType(): ShopItemType {
  const rand = Math.random();
  if (rand < this.JOKER_WEIGHT) {
    return ShopItemType.JOKER;
  } else if (rand < this.JOKER_WEIGHT + this.PLANET_WEIGHT) {
    return ShopItemType.PLANET;
  } else {
    return ShopItemType.TAROT;
  }
}

generateShopItems(count: number): ShopItem[] {
  const items: ShopItem[] = [];
  for (let i = 0; i < count; i++) {
    const type = this.selectItemType();
    // Generate based on type
  }
  return items;
}
```

**Rationale:** Clearer intent and easier to adjust distribution

---

### Refactoring 3: Extract Persistence Error Handling

**BEFORE:**
```typescript
// Repeated try-catch pattern
saveGame(gameState: GameState): void {
  try {
    const data = this.serializeGameState(gameState);
    localStorage.setItem(this.storageKey, data);
    console.log('Game saved');
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

loadGame(): GameState | null {
  try {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return null;
    return this.deserializeGameState(data);
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}
```

**AFTER (proposal):**
```typescript
private safeLocalStorageAccess<T>(
  operation: () => T,
  errorMessage: string,
  defaultValue: T
): T {
  try {
    return operation();
  } catch (error) {
    console.error(errorMessage, error);
    return defaultValue;
  }
}

saveGame(gameState: GameState): void {
  this.safeLocalStorageAccess(
    () => {
      const data = this.serializeGameState(gameState);
      localStorage.setItem(this.storageKey, data);
      console.log('Game saved');
    },
    'Failed to save game',
    undefined
  );
}

loadGame(): GameState | null {
  return this.safeLocalStorageAccess(
    () => {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      return this.deserializeGameState(data);
    },
    'Failed to load game',
    null
  );
}
```

**Rationale:** DRY principle, consistent error handling

---

## Decision:

Select one:

- [ ] ✅ **APPROVED** - Ready for integration
  - All services functional
  - Shop generation works correctly
  - Persistence handles save/load properly
  - Config provides all necessary values
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality works
  - Minor refactorings recommended
  - Magic numbers should be extracted
  - Technical debt tracked

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Shop item generation broken
  - Persistence doesn't reconstruct objects
  - Config missing required values
  - Must fix before controller integration
