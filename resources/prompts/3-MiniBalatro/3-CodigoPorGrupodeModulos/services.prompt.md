# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Services Layer - Shop, Persistence, and Configuration

**Project File Structure:**
```
3-MiniBalatro/
├── src/
│   ├── models/
│   │   ├── core/
│   │   ├── poker/
│   │   ├── special-cards/
│   │   ├── scoring/
│   │   ├── blinds/
│   │   └── game/
│   ├── controllers/
│   │   └── game-controller.ts
│   ├── services/
│   │   ├── index.ts
│   │   ├── shop/
│   │   │   ├── index.ts
│   │   │   ├── shop.ts                      ← IMPLEMENT
│   │   │   ├── shop-item.ts                 ← IMPLEMENT
│   │   │   ├── shop-item-type.enum.ts       ← IMPLEMENT
│   │   │   └── shop-item-generator.ts       ← IMPLEMENT
│   │   ├── persistence/
│   │   │   ├── index.ts
│   │   │   └── game-persistence.ts          ← IMPLEMENT
│   │   └── config/
│   │       ├── index.ts
│   │       ├── game-config.ts               ← IMPLEMENT
│   │       └── balancing-config.ts          ← IMPLEMENT
│   ├── views/
│   ├── utils/
│   └── types/
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant sections:**

### Section 4: Functional Requirements
- **FR19:** Shop between levels with 4 random cards
- **FR20:** Card purchase in shop (jokers $5, planets $3, tarot $3)
- **FR21:** Shop reroll (with configurable cost)
- **FR28:** Game persistence (save state to localStorage or JSON)
- **FR29:** Continuation of saved games

### Section 5: Non-Functional Requirements
- **NFR9:** Configurable values for balancing (chips, mult, costs, goals in separate files)
- **NFR10:** Persistence through localStorage or JSON
- **NFR12:** Basic responsive design

### Section 9: Detailed Economy System

**Shop Costs:**
| Item | Cost |
|------|------|
| Joker Card | $5 |
| Planet Card | $3 |
| Tarot Card | $3 |
| Shop Reroll | Variable (suggested: $2-5) |

**Inventory Management:**
- Jokers: Maximum 5 simultaneous
- Consumables (Tarot): Maximum 2 simultaneous
- Planets: Applied immediately without occupying inventory

### Section 11.2: Level Development

**Successful level end:**
- Grant money reward according to blind type
- Activate post-level effects
- Open shop with 4 random cards
- Player can buy, reroll, or exit
- Upon exit: advance to next level

### Section 15: Value Configuration (JSON)

**handValues.json:**
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

**cardValues.json:**
```json
{
  "A": 11, "K": 10, "Q": 10, "J": 10, "10": 10,
  "9": 9, "8": 8, "7": 7, "6": 6, "5": 5,
  "4": 4, "3": 3, "2": 2
}
```

**jokerEffects.json:**
```json
{
  "joker": {
    "name": "Joker",
    "effect": "mult",
    "value": 4,
    "condition": "always"
  },
  "greedyJoker": {
    "name": "Greedy Joker",
    "effect": "mult",
    "value": 3,
    "condition": "perDiamond"
  }
  // ... rest of jokers
}
```

**blindTargets.json:**
```json
{
  "round1": { "small": 300, "big": 450, "boss": 600 },
  "round2": { "small": 450, "big": 675, "boss": 900 }
  // ... more rounds
}
```

---

## 2. Class Diagram

```
class Shop {
    -availableItems: ShopItem[]
    -rerollCost: number
    
    +constructor()
    +generateItems(round: number): void
    +purchaseItem(itemId: string, money: number): ShopItem | null
    +reroll(money: number): boolean
    +getAvailableItems(): ShopItem[]
}

class ShopItem {
    +id: string
    +type: ShopItemType
    +item: Joker | Planet | Tarot
    +cost: number
}

class ShopItemType {
    <<enumeration>>
    JOKER
    PLANET
    TAROT
}

class ShopItemGenerator {
    +generateRandomJoker(): Joker
    +generateRandomPlanet(): Planet
    +generateRandomTarot(): Tarot
    +generateShopItems(count: number): ShopItem[]
}

class GamePersistence {
    -storageKey: string
    
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
    +getCardValue(value: CardValue): number
    +getHandBaseValues(handType: HandType): HandUpgrade
}

class BalancingConfig {
    +handValues: Map<HandType, HandUpgrade>
    +cardValues: Map<CardValue, number>
    +jokerDefinitions: JokerDefinition[]
    +planetDefinitions: PlanetDefinition[]
    +tarotDefinitions: TarotDefinition[]
    +blindTargets: BlindTarget[]
    
    +loadFromJSON(): void
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
BalancingConfig --> HandUpgrade : contains
```

---

## 3. Use Case Diagram

**Relevant use cases:**

**Player interactions:**
- **Enter Shop:** Player accesses shop after completing blind
- **View Shop Items:** Player sees 4 available cards with prices
- **Purchase Card:** Player buys joker/planet/tarot if affordable
- **Reroll Shop:** Player regenerates shop items for a cost
- **Exit Shop:** Player closes shop to continue

**System operations:**
- **Generate Shop Items:** System creates 4 random purchasable cards
- **Validate Purchase:** System checks if player can afford item
- **Apply Purchase:** System adds item to inventory, deducts money
- **Persist Game Data:** System saves game state to storage
- **Load Game Data:** System retrieves saved game state
- **Update UI:** System notifies view layer of changes

**Relationships:**
- EnterShop includes GenerateShopItems
- PurchaseCard includes ValidatePurchase
- PurchaseCard includes ApplyPurchase
- RerollShop includes SpendMoney
- RerollShop includes GenerateShopItems
- CompleteLevel includes PersistGameData

---

# SPECIFIC TASK

Implement the **Services Layer** consisting of 7 classes/enums:

## SHOP SUBSYSTEM (4 modules)

1. **ShopItemType** (enum) - `src/services/shop/shop-item-type.enum.ts`
2. **ShopItem** (class) - `src/services/shop/shop-item.ts`
3. **ShopItemGenerator** (class) - `src/services/shop/shop-item-generator.ts`
4. **Shop** (class) - `src/services/shop/shop.ts`

## PERSISTENCE SUBSYSTEM (1 module)

5. **GamePersistence** (class) - `src/services/persistence/game-persistence.ts`

## CONFIGURATION SUBSYSTEM (2 modules)

6. **GameConfig** (class) - `src/services/config/game-config.ts`
7. **BalancingConfig** (class) - `src/services/config/balancing-config.ts`

---

## MODULE 1: ShopItemType (Enum)

### Responsibilities:
- Define the three types of purchasable items
- Provide type-safe item type constants
- Support item categorization and filtering

### Values to define:
- JOKER
- PLANET
- TAROT

### Additional functionality needed:
- Method to get display name ("Joker", "Planet Card", "Tarot Card")
- Method to get default cost for each type

---

## MODULE 2: ShopItem (Class)

### Responsibilities:
- Encapsulate a single purchasable item in the shop
- Store item type, content, and cost
- Provide unique identification for shop inventory

### Properties:
- `id: string` - Unique identifier (UUID)
- `type: ShopItemType` - Type of item (Joker/Planet/Tarot)
- `item: Joker | Planet | Tarot` - The actual special card object
- `cost: number` - Purchase price

### Methods to implement:

#### 1. **constructor**(type: ShopItemType, item: Joker | Planet | Tarot, cost: number)
- **Description:** Creates a shop item with specified properties
- **Preconditions:** Valid type, non-null item, cost > 0
- **Postconditions:** ShopItem created with unique ID
- **Exceptions to handle:** 
  - Throw error if item null
  - Throw error if cost <= 0

#### 2. **getId**(): string
- **Description:** Returns the item's unique ID
- **Preconditions:** None
- **Postconditions:** Returns string ID
- **Exceptions to handle:** None

#### 3. **getType**(): ShopItemType
- **Description:** Returns the item type
- **Preconditions:** None
- **Postconditions:** Returns ShopItemType enum
- **Exceptions to handle:** None

#### 4. **getItem**(): Joker | Planet | Tarot
- **Description:** Returns the special card object
- **Preconditions:** None
- **Postconditions:** Returns Joker, Planet, or Tarot
- **Exceptions to handle:** None

#### 5. **getCost**(): number
- **Description:** Returns the purchase cost
- **Preconditions:** None
- **Postconditions:** Returns positive number
- **Exceptions to handle:** None

---

## MODULE 3: ShopItemGenerator (Class)

### Responsibilities:
- Generate random jokers, planets, and tarot cards
- Create diverse shop inventories
- Support configurable item generation
- Balance shop item distribution

### Methods to implement:

#### 1. **generateRandomJoker**(): Joker
- **Description:** Creates a random joker from the 15 available types
- **Preconditions:** None
- **Postconditions:** Returns one of the 15 jokers randomly
- **Exceptions to handle:** None
- **Note:** Use BalancingConfig.jokerDefinitions for reference

#### 2. **generateRandomPlanet**(): Planet
- **Description:** Creates a random planet from the 9 available types
- **Preconditions:** None
- **Postconditions:** Returns one of the 9 planets randomly
- **Exceptions to handle:** None
- **Note:** Use BalancingConfig.planetDefinitions for reference

#### 3. **generateRandomTarot**(): Tarot
- **Description:** Creates a random tarot from the 10 available types
- **Preconditions:** None
- **Postconditions:** Returns one of the 10 tarots randomly
- **Exceptions to handle:** None
- **Note:** Use BalancingConfig.tarotDefinitions for reference

#### 4. **generateShopItems**(count: number): ShopItem[]
- **Description:** Generates specified number of random shop items with costs
- **Preconditions:** count > 0
- **Postconditions:** Returns array of ShopItems with diverse types
- **Exceptions to handle:** Throw error if count <= 0
- **Algorithm:**
  - For each item:
    - Randomly select type (weighted: 40% Joker, 30% Planet, 30% Tarot)
    - Generate item based on type
    - Create ShopItem with appropriate cost (Joker $5, Planet $3, Tarot $3)
    - Add to array
  - Return array

---

## MODULE 4: Shop (Class)

### Responsibilities:
- Manage shop inventory (4 items)
- Handle item purchases
- Support shop reroll functionality
- Validate purchase affordability
- Track reroll cost

### Properties:
- `availableItems: ShopItem[]` - Currently available items (max 4)
- `rerollCost: number` - Cost to regenerate shop items

### Methods to implement:

#### 1. **constructor**(rerollCost: number = 3)
- **Description:** Creates a shop with specified reroll cost
- **Preconditions:** rerollCost > 0
- **Postconditions:** Empty shop created with reroll cost set
- **Exceptions to handle:** Throw error if rerollCost <= 0

#### 2. **generateItems**(count: number = 4): void
- **Description:** Generates new shop inventory
- **Preconditions:** count > 0
- **Postconditions:** availableItems populated with count items
- **Exceptions to handle:** Throw error if count <= 0
- **Algorithm:**
  1. Use ShopItemGenerator to create items
  2. Replace availableItems with new array
  3. Log shop generation

#### 3. **purchaseItem**(itemId: string, playerMoney: number): ShopItem | null
- **Description:** Attempts to purchase item if affordable
- **Preconditions:** itemId exists, playerMoney >= 0
- **Postconditions:** 
  - If affordable: item removed from availableItems, returned
  - If not affordable: returns null
- **Exceptions to handle:** Throw error if itemId not found
- **Algorithm:**
  1. Find item by ID
  2. Check if playerMoney >= item.cost
  3. If yes: remove from availableItems, return item
  4. If no: return null

#### 4. **reroll**(playerMoney: number): boolean
- **Description:** Regenerates shop items if player can afford reroll cost
- **Preconditions:** playerMoney >= 0
- **Postconditions:** 
  - If affordable: new items generated, returns true
  - If not affordable: no change, returns false
- **Exceptions to handle:** None
- **Algorithm:**
  1. Check if playerMoney >= rerollCost
  2. If yes: generate new items, return true
  3. If no: return false

#### 5. **getAvailableItems**(): ShopItem[]
- **Description:** Returns copy of available items
- **Preconditions:** None
- **Postconditions:** Returns array of ShopItems (copy, not reference)
- **Exceptions to handle:** None

#### 6. **getRerollCost**(): number
- **Description:** Returns cost to reroll shop
- **Preconditions:** None
- **Postconditions:** Returns positive number
- **Exceptions to handle:** None

#### 7. **getItemCount**(): number
- **Description:** Returns number of items in shop
- **Preconditions:** None
- **Postconditions:** Returns integer 0-4
- **Exceptions to handle:** None

---

## MODULE 5: GamePersistence (Class)

### Responsibilities:
- Save game state to browser localStorage
- Load game state from storage
- Serialize/deserialize game state
- Handle storage errors gracefully
- Clear saved games

### Properties:
- `storageKey: string` - Key for localStorage (e.g., "miniBalatro_save")

### Methods to implement:

#### 1. **constructor**(storageKey: string = "miniBalatro_save")
- **Description:** Creates persistence manager with specified storage key
- **Preconditions:** storageKey non-empty
- **Postconditions:** Persistence manager initialized
- **Exceptions to handle:** Throw error if storageKey empty

#### 2. **saveGame**(gameState: GameState): void
- **Description:** Serializes and saves game state to localStorage
- **Preconditions:** gameState is valid GameState object
- **Postconditions:** Game state stored in localStorage
- **Exceptions to handle:** 
  - Log error if localStorage unavailable
  - Log error if serialization fails
  - Don't throw (graceful degradation)
- **Algorithm:**
  1. Serialize gameState to JSON
  2. Store in localStorage with storageKey
  3. Log success/failure

#### 3. **loadGame**(): GameState | null
- **Description:** Loads and deserializes game state from localStorage
- **Preconditions:** None
- **Postconditions:** 
  - If save exists: returns GameState
  - If no save or error: returns null
- **Exceptions to handle:** 
  - Return null if localStorage unavailable
  - Return null if deserialization fails
  - Log errors but don't throw
- **Algorithm:**
  1. Check if localStorage has storageKey
  2. If yes: retrieve JSON string
  3. Deserialize to GameState
  4. Return GameState or null

#### 4. **hasSavedGame**(): boolean
- **Description:** Checks if a saved game exists
- **Preconditions:** None
- **Postconditions:** Returns true if save exists, false otherwise
- **Exceptions to handle:** Return false if localStorage unavailable

#### 5. **clearSavedGame**(): void
- **Description:** Removes saved game from localStorage
- **Preconditions:** None
- **Postconditions:** Saved game deleted
- **Exceptions to handle:** Log error if localStorage unavailable

#### 6. **serializeGameState**(gameState: GameState) [PRIVATE]: string
- **Description:** Converts GameState to JSON string
- **Preconditions:** gameState valid
- **Postconditions:** Returns JSON string
- **Exceptions to handle:** Throw error if serialization fails
- **Note:** Handle circular references, serialize only necessary data

#### 7. **deserializeGameState**(data: string) [PRIVATE]: GameState
- **Description:** Converts JSON string to GameState
- **Preconditions:** data is valid JSON
- **Postconditions:** Returns reconstructed GameState
- **Exceptions to handle:** Throw error if JSON invalid or incomplete
- **Note:** Reconstruct all game objects (Deck, Cards, Jokers, etc.)

---

## MODULE 6: GameConfig (Static Class)

### Responsibilities:
- Provide global game configuration constants
- Centralize all configurable values
- Offer static methods for config access
- Enable easy balancing adjustments

### Static Properties (readonly):
- `INITIAL_MONEY: number = 5`
- `MAX_JOKERS: number = 5`
- `MAX_CONSUMABLES: number = 2`
- `HAND_SIZE: number = 8`
- `MAX_HANDS_PER_BLIND: number = 3`
- `MAX_DISCARDS_PER_BLIND: number = 3`
- `JOKER_COST: number = 5`
- `PLANET_COST: number = 3`
- `TAROT_COST: number = 3`
- `SHOP_REROLL_COST: number = 3`
- `SMALL_BLIND_REWARD: number = 2`
- `BIG_BLIND_REWARD: number = 5`
- `BOSS_BLIND_REWARD: number = 10`
- `VICTORY_ROUNDS: number = 8` (24 levels total)

### Static Methods to implement:

#### 1. **getCardValue**(value: CardValue): number
- **Description:** Returns base chip value for card value
- **Preconditions:** Valid CardValue enum
- **Postconditions:** Returns positive number
- **Exceptions to handle:** Throw error if invalid CardValue
- **Data:** A=11, K/Q/J=10, 10=10, 9=9, ..., 2=2

#### 2. **getHandBaseValues**(handType: HandType): { chips: number, mult: number }
- **Description:** Returns base chips and mult for hand type
- **Preconditions:** Valid HandType enum
- **Postconditions:** Returns object with chips and mult
- **Exceptions to handle:** Throw error if invalid HandType
- **Data:** High Card=5/1, Pair=10/2, ..., Straight Flush=100/8

#### 3. **getBlindGoal**(roundNumber: number, blindType: 'small' | 'big' | 'boss'): number
- **Description:** Calculates score goal for blind
- **Preconditions:** roundNumber > 0, valid blindType
- **Postconditions:** Returns positive number
- **Exceptions to handle:** Throw error if invalid inputs
- **Formula:** base = 300 × (1.5)^(roundNumber-1), then apply multiplier

---

## MODULE 7: BalancingConfig (Class)

### Responsibilities:
- Load configuration from JSON files
- Store all balancing data
- Provide access to joker/planet/tarot definitions
- Support runtime configuration changes

### Properties:
- `handValues: Map<HandType, { chips: number, mult: number }>` - Base hand values
- `cardValues: Map<CardValue, number>` - Individual card chip values
- `jokerDefinitions: any[]` - Complete joker data
- `planetDefinitions: any[]` - Complete planet data
- `tarotDefinitions: any[]` - Complete tarot data
- `blindTargets: any[]` - Scoring goals per round

### Methods to implement:

#### 1. **constructor**()
- **Description:** Initializes balancing config and loads data
- **Preconditions:** None
- **Postconditions:** All config data loaded from JSON
- **Exceptions to handle:** Log error if JSON loading fails
- **Note:** In real implementation, would load from actual JSON files; for now, can use hardcoded data

#### 2. **loadFromJSON**(): void
- **Description:** Loads all configuration from JSON files/objects
- **Preconditions:** None
- **Postconditions:** All Maps and arrays populated
- **Exceptions to handle:** Log errors if data missing or invalid
- **Algorithm:**
  1. Load handValues.json data
  2. Load cardValues.json data
  3. Load jokerEffects.json data
  4. Load planetEffects.json data
  5. Load tarotEffects.json data
  6. Load blindTargets.json data
  7. Populate Maps and arrays

#### 3. **getHandValue**(handType: HandType): { chips: number, mult: number }
- **Description:** Returns base values for hand type
- **Preconditions:** Valid HandType
- **Postconditions:** Returns chips/mult object
- **Exceptions to handle:** Throw error if handType not found

#### 4. **getCardValue**(cardValue: CardValue): number
- **Description:** Returns chip value for card value
- **Preconditions:** Valid CardValue
- **Postconditions:** Returns positive number
- **Exceptions to handle:** Throw error if cardValue not found

#### 5. **getJokerDefinition**(jokerId: string): any
- **Description:** Returns complete definition for joker
- **Preconditions:** jokerId exists
- **Postconditions:** Returns joker definition object
- **Exceptions to handle:** Throw error if jokerId not found

#### 6. **getPlanetDefinition**(planetId: string): any
- **Description:** Returns complete definition for planet
- **Preconditions:** planetId exists
- **Postconditions:** Returns planet definition object
- **Exceptions to handle:** Throw error if planetId not found

#### 7. **getTarotDefinition**(tarotId: string): any
- **Description:** Returns complete definition for tarot
- **Preconditions:** tarotId exists
- **Postconditions:** Returns tarot definition object
- **Exceptions to handle:** Throw error if tarotId not found

#### 8. **getAllJokerIds**(): string[]
- **Description:** Returns list of all joker IDs
- **Preconditions:** None
- **Postconditions:** Returns array of strings
- **Exceptions to handle:** None

#### 9. **getAllPlanetIds**(): string[]
- **Description:** Returns list of all planet IDs
- **Preconditions:** None
- **Postconditions:** Returns array of strings
- **Exceptions to handle:** None

#### 10. **getAllTarotIds**(): string[]
- **Description:** Returns list of all tarot IDs
- **Preconditions:** None
- **Postconditions:** Returns array of strings
- **Exceptions to handle:** None

---

## Dependencies:

### Classes it must use:
- **Shop** uses **ShopItem** and **ShopItemGenerator**
- **ShopItem** uses **Joker**, **Planet**, **Tarot** from special-cards
- **ShopItemGenerator** uses **Joker**, **Planet**, **Tarot** from special-cards
- **ShopItemGenerator** uses **BalancingConfig**
- **GamePersistence** uses **GameState** from game
- **GameConfig** uses **CardValue** and **HandType** enums
- **BalancingConfig** uses **CardValue** and **HandType** enums

### Interfaces it implements:
- None (concrete classes)

### External services it consumes:
- **localStorage** API (browser storage)
- JSON parsing/stringification

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
  - Single Responsibility: Each service has one clear purpose
  - Open/Closed: Easy to extend with new item types or storage methods
  - Liskov Substitution: N/A
  - Interface Segregation: N/A
  - Dependency Inversion: Depend on abstractions where applicable
- **Input parameter validation:**
  - Validate all numeric inputs (positive values)
  - Validate non-null objects
  - Validate IDs exist before operations
- **Robust exception handling:**
  - Handle localStorage errors gracefully (may not be available)
  - Handle JSON parsing errors
  - Log errors but don't crash application
- **Logging at critical points:**
  - Log shop generation and purchases
  - Log save/load operations
  - Log configuration loading
- **Comments for complex logic:**
  - Comment serialization/deserialization logic
  - Document shop item generation algorithm
  - Explain configuration loading process

## Security:
- **Input sanitization and validation:**
  - Validate shop item IDs before access
  - Validate money amounts before transactions
  - Sanitize JSON data before parsing
  - Validate deserialized game state integrity

---

# DELIVERABLES

## 1. Complete source code of all 7 modules with:

### File: `src/services/shop/shop-item-type.enum.ts`
```typescript
/**
 * Enum defining purchasable item types in shop.
 */
export enum ShopItemType {
  // Enum values
}

// Helper functions
```

### File: `src/services/shop/shop-item.ts`
```typescript
/**
 * Represents a single purchasable item in the shop.
 * Contains the special card and its cost.
 */
export class ShopItem {
  // Properties and methods
}
```

### File: `src/services/shop/shop-item-generator.ts`
```typescript
/**
 * Generates random jokers, planets, and tarot cards for shop.
 * Creates diverse shop inventories with appropriate distribution.
 */
export class ShopItemGenerator {
  // Properties and methods
}
```

### File: `src/services/shop/shop.ts`
```typescript
/**
 * Manages shop inventory and transactions.
 * Handles item generation, purchases, and rerolls.
 */
export class Shop {
  // Properties and methods
}
```

### File: `src/services/persistence/game-persistence.ts`
```typescript
/**
 * Handles game state persistence to browser localStorage.
 * Manages save, load, and clear operations with error handling.
 */
export class GamePersistence {
  // Properties and methods
}
```

### File: `src/services/config/game-config.ts`
```typescript
/**
 * Global game configuration constants.
 * Centralizes all configurable values for easy balancing.
 */
export class GameConfig {
  // Static properties and methods
}
```

### File: `src/services/config/balancing-config.ts`
```typescript
/**
 * Loads and manages balancing data from JSON configuration.
 * Provides access to all card, hand, and item definitions.
 */
export class BalancingConfig {
  // Properties and methods
}
```

## 2. Inline documentation:
- TSDoc comments on all public classes and methods
- Algorithm explanations for complex operations
- Storage strategy documentation
- Configuration loading notes

## 3. New dependencies:
- **uuid** (if not already added): For generating unique shop item IDs
- None otherwise (uses browser localStorage)

## 4. Edge cases considered:
- localStorage unavailable (private browsing mode)
- JSON parsing errors during load
- Corrupted save data
- Shop with 0 items after purchases
- Purchasing with exact money amount
- Rerolling with insufficient funds
- Deserializing game state with missing data
- Circular references in serialization
- Invalid CardValue/HandType in config access
- Missing definitions in BalancingConfig
- Shop item generation with weighted distribution
- Multiple purchases in single shop session

---

# OUTPUT FORMAT

Provide separate code blocks for each file:

```typescript
// ============================================
// FILE: src/services/shop/shop-item-type.enum.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/services/shop/shop-item.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/services/shop/shop-item-generator.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/services/shop/shop.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/services/persistence/game-persistence.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/services/config/game-config.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/services/config/balancing-config.ts
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
