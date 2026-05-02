# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Domain Layer - Special Cards System

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
│   │   │   ├── index.ts
│   │   │   ├── jokers/
│   │   │   │   ├── index.ts
│   │   │   │   ├── joker.ts                    ← IMPLEMENT
│   │   │   │   ├── joker-priority.enum.ts      ← IMPLEMENT
│   │   │   │   ├── chip-joker.ts               ← IMPLEMENT
│   │   │   │   ├── mult-joker.ts               ← IMPLEMENT
│   │   │   │   └── multiplier-joker.ts         ← IMPLEMENT
│   │   │   ├── planets/
│   │   │   │   ├── index.ts
│   │   │   │   └── planet.ts                   ← IMPLEMENT
│   │   │   └── tarots/
│   │   │       ├── index.ts
│   │   │       ├── tarot.ts                    ← IMPLEMENT
│   │   │       ├── tarot-effect.enum.ts        ← IMPLEMENT
│   │   │       ├── instant-tarot.ts            ← IMPLEMENT
│   │   │       └── targeted-tarot.ts           ← IMPLEMENT
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
- **Joker:** Special card that provides persistent bonuses throughout the entire game
- **Planet Card:** Card that permanently improves a specific type of poker hand
- **Tarot Card:** Single-use consumable card that modifies deck cards or provides tactical benefits
- **Synergy:** Simultaneous activation of multiple joker effects by the same played card

### Section 4: Functional Requirements
- **FR12:** Management of three simultaneous hand types (main hand, joker hand, consumable hand)
- **FR13:** Application of planet card effects (permanent hand upgrades)
- **FR14:** Application of tarot card effects (single-use modifications)
- **FR15:** Application of joker effects during score calculation
- **FR16:** Detection and application of synergies (multiple jokers triggering on same card)

### Section 8.3: Score Calculation Order (Detailed)

**Step 3: Persistent joker effects**
- **Priority 1:** Jokers that increase total chips (e.g., Blue Joker, Odd Todd)
- **Priority 2:** Jokers that increase total mult (e.g., Joker, Half Joker, Mystic Summit)
- **Priority 3:** Jokers that multiply total mult (e.g., Triboulet, Joker Stencil)

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

### Section 8.5: Tarot Cards and Tactical Effects

| Tarot Card | Effect |
|------------|--------|
| The Hermit | Doubles player's current money |
| The Empress | Choose a card to grant +4 mult when played (permanent) |
| The Emperor | Choose a card to grant +20 chips when played (permanent) |
| Strength | Choose a card to increment its value in sequence (A→2, 2→3, …, K→A) |
| The Hanged Man | Choose a card from the deck to destroy permanently |
| Death | Choose a card to add a duplicate copy to the deck |
| The Star | Choose a card to change its suit to Diamonds |
| The Moon | Choose a card to change its suit to Clubs |
| The Sun | Choose a card to change its suit to Hearts |
| The World | Choose a card to change its suit to Spades |

### Section 8.6: Complete Joker Catalog

| Joker | Effect | Type |
|-------|--------|------|
| Joker | +4 mult | Fixed mult |
| Greedy Joker | +3 mult per Diamond card played | Conditional mult |
| Lusty Joker | +3 mult per Heart card played | Conditional mult |
| Wrathful Joker | +3 mult per Spade card played | Conditional mult |
| Gluttonous Joker | +3 mult per Club card played | Conditional mult |
| Half Joker | +20 mult if hand contains 3 cards or less | Conditional mult |
| Joker Stencil | ×1 mult per empty slot in joker hand | Multiplier |
| Mystic Summit | +15 mult if no discards available | Conditional mult |
| Fibonacci | +8 mult per A, 2, 3, 5, or 8 played | Mult per card |
| Even Steven | +4 mult per even value card (2,4,6,8,10) played | Mult per card |
| Odd Todd | +31 chips per odd value card (A,3,5,7,9) played | Chips per card |
| Blue Joker | +2 chips per remaining card in deck (max +104) | Conditional chips |
| Hiker | Each played card permanently gains +5 chips (cumulative) | Permanent upgrade |
| Golden Joker | +$2 at the end of each passed level | Economic |
| Triboulet | Each K or Q played multiplies total mult by ×2 | Multiplier |

---

## 2. Class Diagram

```
class Joker {
    <<abstract>>
    -id: string
    -name: string
    -description: string
    -priority: JokerPriority
    
    +constructor(id: string, name: string)
    +applyEffect(context: ScoreContext): void
    +canActivate(context: ScoreContext): boolean
    +getPriority(): JokerPriority
}

class JokerPriority {
    <<enumeration>>
    CHIPS
    MULT
    MULTIPLIER
}

class ChipJoker {
    -chipValue: number
    -condition: Function
    
    +applyEffect(context: ScoreContext): void
}

class MultJoker {
    -multValue: number
    -condition: Function
    
    +applyEffect(context: ScoreContext): void
}

class MultiplierJoker {
    -multiplierValue: number
    -condition: Function
    
    +applyEffect(context: ScoreContext): void
}

class Planet {
    -targetHandType: HandType
    -chipsBonus: number
    -multBonus: number
    
    +constructor(handType: HandType, chips: number, mult: number)
    +apply(upgradeManager: HandUpgradeManager): void
}

class Tarot {
    <<abstract>>
    -name: string
    -description: string
    
    +constructor(name: string)
    +use(target: Card | GameState): void
    +requiresTarget(): boolean
}

class InstantTarot {
    +use(gameState: GameState): void
}

class TargetedTarot {
    -effectType: TarotEffect
    
    +use(target: Card): void
}

class TarotEffect {
    <<enumeration>>
    ADD_CHIPS
    ADD_MULT
    CHANGE_SUIT
    UPGRADE_VALUE
    DUPLICATE
    DESTROY
}

ChipJoker --|> Joker : extends
MultJoker --|> Joker : extends
MultiplierJoker --|> Joker : extends
Joker --> JokerPriority : has
InstantTarot --|> Tarot : extends
TargetedTarot --|> Tarot : extends
TargetedTarot --> TarotEffect : applies
Planet --> HandType : targets
Planet --> HandUpgradeManager : modifies
```

---

## 3. Use Case Diagram

**Relevant use cases:**

**Player interactions:**
- **Purchase Planet Card:** Player buys planet card from shop
- **Use Tarot Card:** Player consumes tarot card to apply effect
- **Activate Joker:** Player plays hand, jokers automatically activate
- **Manage Active Jokers:** Player adds/removes jokers from joker zone (max 5)

**System operations:**
- **Apply Planet Effect:** System permanently upgrades hand type base values
- **Apply Tarot Effect:** System modifies card or game state based on tarot type
- **Apply Joker Effect:** System applies joker bonuses during score calculation
- **Process Card Synergies:** System detects and applies multiple joker effects on same card

**Relationships:**
- PurchasePlanetCard includes ApplyPlanetEffect
- UseTarotCard includes ApplyTarotEffect
- PlayHand includes ActivateJoker (for all active jokers)
- ActivateJoker includes ProcessSynergies (when multiple jokers trigger)

---

# SPECIFIC TASK

Implement the **Special Cards System** module consisting of 10 classes/enums:

## JOKER SUBSYSTEM (5 modules)

1. **JokerPriority** (enum) - `src/models/special-cards/jokers/joker-priority.enum.ts`
2. **Joker** (abstract class) - `src/models/special-cards/jokers/joker.ts`
3. **ChipJoker** (class) - `src/models/special-cards/jokers/chip-joker.ts`
4. **MultJoker** (class) - `src/models/special-cards/jokers/mult-joker.ts`
5. **MultiplierJoker** (class) - `src/models/special-cards/jokers/multiplier-joker.ts`

## PLANET SUBSYSTEM (1 module)

6. **Planet** (class) - `src/models/special-cards/planets/planet.ts`

## TAROT SUBSYSTEM (4 modules)

7. **TarotEffect** (enum) - `src/models/special-cards/tarots/tarot-effect.enum.ts`
8. **Tarot** (abstract class) - `src/models/special-cards/tarots/tarot.ts`
9. **InstantTarot** (class) - `src/models/special-cards/tarots/instant-tarot.ts`
10. **TargetedTarot** (class) - `src/models/special-cards/tarots/targeted-tarot.ts`

---

## MODULE 1: JokerPriority (Enum)

### Responsibilities:
- Define the three priority levels for joker effect application
- Enforce strict scoring calculation order
- Support priority-based sorting of jokers

### Values to define (in application order):
- CHIPS (Priority 1: Applied first)
- MULT (Priority 2: Applied second)
- MULTIPLIER (Priority 3: Applied last, multiplies total mult)

### Additional functionality needed:
- Method to get numeric priority value (1, 2, 3) for sorting

---

## MODULE 2: Joker (Abstract Class)

### Responsibilities:
- Define common interface for all joker types
- Store joker identification and metadata
- Enforce priority-based effect application
- Support conditional activation based on game context

### Properties:
- `id: string` - Unique identifier for the joker
- `name: string` - Display name (e.g., "Greedy Joker", "Triboulet")
- `description: string` - Effect description for UI
- `priority: JokerPriority` - When this joker's effect applies

### Methods to implement:

#### 1. **constructor**(id: string, name: string, description: string, priority: JokerPriority)
- **Description:** Creates a joker with specified properties
- **Preconditions:** All parameters non-empty/valid
- **Postconditions:** Joker object initialized
- **Exceptions to handle:** Throw error if name/description empty

#### 2. **applyEffect**(context: ScoreContext): void [ABSTRACT]
- **Description:** Applies the joker's effect to the score context (must be implemented by subclasses)
- **Preconditions:** context is valid ScoreContext
- **Postconditions:** context modified according to joker's effect
- **Exceptions to handle:** Subclass responsibility

#### 3. **canActivate**(context: ScoreContext): boolean
- **Description:** Checks if joker's conditions are met for activation
- **Preconditions:** context is valid ScoreContext
- **Postconditions:** Returns true if joker should activate
- **Exceptions to handle:** None (returns false on error)

#### 4. **getPriority**(): JokerPriority
- **Description:** Returns the joker's priority level
- **Preconditions:** None
- **Postconditions:** Returns JokerPriority value
- **Exceptions to handle:** None

---

## MODULE 3: ChipJoker (Class extends Joker)

### Responsibilities:
- Add chips to total score during calculation
- Support both fixed and conditional chip bonuses
- Handle per-card chip additions (e.g., Odd Todd: +31 chips per odd card)

### Properties (in addition to Joker base):
- `chipValue: number` - Chips added per activation
- `condition: (context: ScoreContext) => boolean` - Optional condition function

### Methods to implement:

#### 1. **constructor**(id: string, name: string, description: string, chipValue: number, condition?: Function)
- **Description:** Creates a chip-adding joker with optional condition
- **Preconditions:** chipValue > 0
- **Postconditions:** ChipJoker created with CHIPS priority
- **Exceptions to handle:** Throw error if chipValue <= 0

#### 2. **applyEffect**(context: ScoreContext): void [OVERRIDE]
- **Description:** Adds chips to context.chips based on condition
- **Preconditions:** canActivate() returns true
- **Postconditions:** context.chips increased by chipValue
- **Exceptions to handle:** None

---

## MODULE 4: MultJoker (Class extends Joker)

### Responsibilities:
- Add mult to total score during calculation
- Support both fixed and conditional mult bonuses
- Handle per-card mult additions (e.g., Greedy Joker: +3 mult per Diamond)

### Properties (in addition to Joker base):
- `multValue: number` - Mult added per activation
- `condition: (context: ScoreContext) => boolean` - Optional condition function

### Methods to implement:

#### 1. **constructor**(id: string, name: string, description: string, multValue: number, condition?: Function)
- **Description:** Creates a mult-adding joker with optional condition
- **Preconditions:** multValue > 0
- **Postconditions:** MultJoker created with MULT priority
- **Exceptions to handle:** Throw error if multValue <= 0

#### 2. **applyEffect**(context: ScoreContext): void [OVERRIDE]
- **Description:** Adds mult to context.mult based on condition
- **Preconditions:** canActivate() returns true
- **Postconditions:** context.mult increased by multValue
- **Exceptions to handle:** None

---

## MODULE 5: MultiplierJoker (Class extends Joker)

### Responsibilities:
- Multiply total mult during calculation (applied after all additions)
- Support both fixed and conditional multipliers
- Handle powerful mult multipliers (e.g., Triboulet: ×2 per K/Q)

### Properties (in addition to Joker base):
- `multiplierValue: number` - Factor to multiply mult by
- `condition: (context: ScoreContext) => boolean` - Optional condition function

### Methods to implement:

#### 1. **constructor**(id: string, name: string, description: string, multiplierValue: number, condition?: Function)
- **Description:** Creates a mult-multiplying joker with optional condition
- **Preconditions:** multiplierValue >= 1
- **Postconditions:** MultiplierJoker created with MULTIPLIER priority
- **Exceptions to handle:** Throw error if multiplierValue < 1

#### 2. **applyEffect**(context: ScoreContext): void [OVERRIDE]
- **Description:** Multiplies context.mult by multiplierValue based on condition
- **Preconditions:** canActivate() returns true
- **Postconditions:** context.mult multiplied by multiplierValue
- **Exceptions to handle:** None

---

## MODULE 6: Planet (Class)

### Responsibilities:
- Represent a planet card that permanently upgrades a hand type
- Store target hand type and bonus amounts
- Apply upgrade to HandUpgradeManager when purchased

### Properties:
- `name: string` - Planet name (e.g., "Pluto", "Neptune")
- `targetHandType: HandType` - Which hand type this upgrades
- `chipsBonus: number` - Additional chips to add
- `multBonus: number` - Additional mult to add

### Methods to implement:

#### 1. **constructor**(name: string, targetHandType: HandType, chipsBonus: number, multBonus: number)
- **Description:** Creates a planet card with specified upgrades
- **Preconditions:** chipsBonus >= 0, multBonus >= 0
- **Postconditions:** Planet object created
- **Exceptions to handle:** Throw error if negative bonuses

#### 2. **apply**(upgradeManager: HandUpgradeManager): void
- **Description:** Applies this planet's bonuses to the upgrade manager
- **Preconditions:** upgradeManager not null
- **Postconditions:** upgradeManager updated with bonuses for targetHandType
- **Exceptions to handle:** Throw error if upgradeManager null

---

## MODULE 7: TarotEffect (Enum)

### Responsibilities:
- Define all tarot effect types
- Support effect identification for targeted tarots

### Values to define:
- ADD_CHIPS (The Emperor)
- ADD_MULT (The Empress)
- CHANGE_SUIT (The Star, Moon, Sun, World)
- UPGRADE_VALUE (Strength)
- DUPLICATE (Death)
- DESTROY (The Hanged Man)

---

## MODULE 8: Tarot (Abstract Class)

### Responsibilities:
- Define common interface for all tarot cards
- Support both instant and targeted tarot effects
- Enforce single-use consumption

### Properties:
- `name: string` - Tarot card name (e.g., "The Hermit", "The Empress")
- `description: string` - Effect description for UI

### Methods to implement:

#### 1. **constructor**(name: string, description: string)
- **Description:** Creates a tarot card with specified properties
- **Preconditions:** name and description non-empty
- **Postconditions:** Tarot object created
- **Exceptions to handle:** Throw error if name/description empty

#### 2. **use**(target?: Card | GameState): void [ABSTRACT]
- **Description:** Uses the tarot card (must be implemented by subclasses)
- **Preconditions:** Appropriate target provided if required
- **Postconditions:** Tarot effect applied, card consumed
- **Exceptions to handle:** Subclass responsibility

#### 3. **requiresTarget**(): boolean [ABSTRACT]
- **Description:** Returns whether this tarot needs a target card
- **Preconditions:** None
- **Postconditions:** Returns true if targeted tarot, false if instant
- **Exceptions to handle:** None

---

## MODULE 9: InstantTarot (Class extends Tarot)

### Responsibilities:
- Represent tarot cards with instant effects (no target needed)
- Apply effects to GameState directly
- Support money-doubling (The Hermit)

### Properties (in addition to Tarot base):
- `effect: (gameState: GameState) => void` - Effect function to execute

### Methods to implement:

#### 1. **constructor**(name: string, description: string, effect: Function)
- **Description:** Creates an instant tarot with specified effect function
- **Preconditions:** effect function provided
- **Postconditions:** InstantTarot created
- **Exceptions to handle:** Throw error if effect null

#### 2. **use**(gameState: GameState): void [OVERRIDE]
- **Description:** Executes the instant effect on game state
- **Preconditions:** gameState not null
- **Postconditions:** Effect applied to gameState
- **Exceptions to handle:** Throw error if gameState null

#### 3. **requiresTarget**(): boolean [OVERRIDE]
- **Description:** Returns false (instant tarots don't need targets)
- **Preconditions:** None
- **Postconditions:** Returns false
- **Exceptions to handle:** None

---

## MODULE 10: TargetedTarot (Class extends Tarot)

### Responsibilities:
- Represent tarot cards that modify a specific card
- Apply effects to target Card object
- Support all targeted effects (Empress, Emperor, Strength, suit changes, etc.)

### Properties (in addition to Tarot base):
- `effectType: TarotEffect` - Type of effect this tarot applies
- `effectValue?: any` - Optional value for effect (e.g., +4 mult, suit to change to)

### Methods to implement:

#### 1. **constructor**(name: string, description: string, effectType: TarotEffect, effectValue?: any)
- **Description:** Creates a targeted tarot with specified effect
- **Preconditions:** Valid TarotEffect provided
- **Postconditions:** TargetedTarot created
- **Exceptions to handle:** None

#### 2. **use**(target: Card): void [OVERRIDE]
- **Description:** Applies effect to the target card
- **Preconditions:** target is valid Card object
- **Postconditions:** target Card modified according to effectType
- **Exceptions to handle:** 
  - Throw error if target null
  - Throw error if invalid effectValue for effectType

#### 3. **requiresTarget**(): boolean [OVERRIDE]
- **Description:** Returns true (targeted tarots need card selection)
- **Preconditions:** None
- **Postconditions:** Returns true
- **Exceptions to handle:** None

---

## Dependencies:

### Classes it must use:
- **Joker** subclasses use **ScoreContext** from `src/models/scoring/score-context.ts`
- **Planet** uses **HandType** from `src/models/poker/hand-type.enum.ts`
- **Planet** uses **HandUpgradeManager** from `src/models/poker/hand-upgrade-manager.ts`
- **Tarot** subclasses use **Card** from `src/models/core/card.ts`
- **InstantTarot** uses **GameState** from `src/models/game/game-state.ts`
- **TargetedTarot** uses **Suit** from `src/models/core/suit.enum.ts`

### Interfaces it implements:
- None (abstract classes and concrete implementations)

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
  - Open/Closed: Abstract classes enable extension without modification
  - Liskov Substitution: Subclasses fully substitutable for base classes
  - Interface Segregation: Abstract methods only define what's needed
  - Dependency Inversion: Depend on abstractions (abstract Joker/Tarot)
- **Input parameter validation:**
  - Validate non-null parameters
  - Validate positive values for bonuses
  - Validate effect functions exist
- **Robust exception handling:**
  - Throw errors with descriptive messages
  - Document exceptions in TSDoc
- **Logging at critical points:**
  - Log joker activations with condition results
  - Log planet upgrades applied
  - Log tarot effects executed
- **Comments for complex logic:**
  - Comment condition function implementations
  - Comment effect application algorithms
  - Explain priority-based ordering

## Security:
- **Input sanitization and validation:**
  - Validate function parameters exist before calling
  - Validate numeric values are positive
  - Validate enum values are valid

---

# DELIVERABLES

## 1. Complete source code of all 10 modules with:

### File: `src/models/special-cards/jokers/joker-priority.enum.ts`
```typescript
/**
 * Enum defining joker effect application priority.
 * Enforces strict scoring calculation order.
 */
export enum JokerPriority {
  // Enum values
}

// Helper functions
```

### File: `src/models/special-cards/jokers/joker.ts`
```typescript
/**
 * Abstract base class for all joker cards.
 * Jokers provide persistent bonuses during score calculation.
 */
export abstract class Joker {
  // Properties and methods
}
```

### File: `src/models/special-cards/jokers/chip-joker.ts`
```typescript
/**
 * Joker that adds chips to the score.
 * Applied with CHIPS priority (first).
 */
export class ChipJoker extends Joker {
  // Properties and methods
}
```

### File: `src/models/special-cards/jokers/mult-joker.ts`
```typescript
/**
 * Joker that adds mult to the score.
 * Applied with MULT priority (second).
 */
export class MultJoker extends Joker {
  // Properties and methods
}
```

### File: `src/models/special-cards/jokers/multiplier-joker.ts`
```typescript
/**
 * Joker that multiplies the total mult.
 * Applied with MULTIPLIER priority (last).
 */
export class MultiplierJoker extends Joker {
  // Properties and methods
}
```

### File: `src/models/special-cards/planets/planet.ts`
```typescript
/**
 * Represents a planet card that permanently upgrades a poker hand type.
 * Planet effects are cumulative and persist for the entire game.
 */
export class Planet {
  // Properties and methods
}
```

### File: `src/models/special-cards/tarots/tarot-effect.enum.ts`
```typescript
/**
 * Enum defining all tarot card effect types.
 */
export enum TarotEffect {
  // Enum values
}
```

### File: `src/models/special-cards/tarots/tarot.ts`
```typescript
/**
 * Abstract base class for all tarot cards.
 * Tarots are single-use consumable cards with various effects.
 */
export abstract class Tarot {
  // Properties and methods
}
```

### File: `src/models/special-cards/tarots/instant-tarot.ts`
```typescript
/**
 * Tarot card with instant effect that doesn't require a target.
 * Example: The Hermit (doubles money).
 */
export class InstantTarot extends Tarot {
  // Properties and methods
}
```

### File: `src/models/special-cards/tarots/targeted-tarot.ts`
```typescript
/**
 * Tarot card that requires selecting a target card.
 * Examples: The Empress, The Emperor, Strength, suit changes.
 */
export class TargetedTarot extends Tarot {
  // Properties and methods
}
```

## 2. Inline documentation:
- TSDoc comments on all public classes, methods, and enums
- Algorithm explanations for effect application
- Priority ordering justification
- Condition function documentation

## 3. New dependencies:
- None (uses existing Card, HandType, HandUpgradeManager, ScoreContext, GameState)

## 4. Edge cases considered:
- Joker with condition that's never met (canActivate returns false)
- Multiple jokers of same priority (order matters within priority)
- Multiplier joker with mult = 0 (results in 0 total mult)
- Planet applied multiple times (bonuses accumulate)
- Targeted tarot used without valid target (error thrown)
- Instant tarot used on null game state (error thrown)
- Joker effect with null context (error thrown)

---

# OUTPUT FORMAT

Provide separate code blocks for each file:

```typescript
// ============================================
// FILE: src/models/special-cards/jokers/joker-priority.enum.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/jokers/joker.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/jokers/chip-joker.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/jokers/mult-joker.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/jokers/multiplier-joker.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/planets/planet.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/tarots/tarot-effect.enum.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/tarots/tarot.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/tarots/instant-tarot.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/special-cards/tarots/targeted-tarot.ts
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
