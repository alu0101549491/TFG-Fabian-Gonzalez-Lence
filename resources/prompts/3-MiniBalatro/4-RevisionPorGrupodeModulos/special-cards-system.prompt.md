# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Special Cards System

**Components under review:**

### Jokers Subsystem:
- `JokerPriority` (enum) - `src/models/special-cards/jokers/joker-priority.enum.ts`
- `Joker` (abstract class) - `src/models/special-cards/jokers/joker.ts`
- `ChipJoker` (class) - `src/models/special-cards/jokers/chip-joker.ts`
- `MultJoker` (class) - `src/models/special-cards/jokers/mult-joker.ts`
- `MultiplierJoker` (class) - `src/models/special-cards/jokers/multiplier-joker.ts`
- `EconomicJoker` (class) - `src/models/special-cards/jokers/economic-joker.ts` **(NEW)**
- `PermanentUpgradeJoker` (class) - `src/models/special-cards/jokers/permanent-upgrade-joker.ts` **(NEW)**

### Planets Subsystem:
- `Planet` (class) - `src/models/special-cards/planets/planet.ts`

### Tarots Subsystem:
- `TarotEffect` (enum) - `src/models/special-cards/tarots/tarot-effect.enum.ts`
- `Tarot` (abstract class) - `src/models/special-cards/tarots/tarot.ts`
- `InstantTarot` (class) - `src/models/special-cards/tarots/instant-tarot.ts`
- `TargetedTarot` (class) - `src/models/special-cards/tarots/targeted-tarot.ts`

**Component objective:** 
Implement the special cards system that enhances gameplay through persistent bonuses (Jokers), permanent hand upgrades (Planets), and single-use tactical effects (Tarots). The system must enforce strict scoring calculation order for jokers (chips → mult → multipliers) and support both instant and targeted effects for tarots.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR12:** Management of three simultaneous hand types (main hand, jokers, consumables)
- Acceptance: Jokers inventory supports max 5 cards
- Acceptance: Consumables inventory supports max 2 cards
- Acceptance: Planets applied immediately without inventory

**FR13:** Application of planet card effects
- Acceptance: Permanent upgrades applied to HandUpgradeManager
- Acceptance: Bonuses persist for entire game

**FR14:** Application of tarot card effects
- Acceptance: Single-use consumables work correctly
- Acceptance: Targeted tarots modify specific cards
- Acceptance: Instant tarots affect game state

**FR15:** Application of joker effects
- Acceptance: Jokers apply bonuses during score calculation
- Acceptance: Priority order respected (CHIPS → MULT → MULTIPLIER)
- Acceptance: Conditional jokers check conditions before applying

**FR16:** Detection and application of synergies
- Acceptance: Multiple jokers can trigger on same card
- Acceptance: All applicable effects stack correctly

**Section 8.3: Score Calculation Order (Detailed)**

**Step 3: Persistent joker effects**
- **Priority 1:** Jokers that increase total chips (e.g., Blue Joker, Odd Todd)
- **Priority 2:** Jokers that increase total mult (e.g., Joker, Half Joker, Mystic Summit)
- **Priority 3:** Jokers that multiply total mult (e.g., Triboulet, Joker Stencil)

**Section 8.6: Complete Joker Catalog (15 jokers minimum)**

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

**Section 8.5: Tarot Cards and Tactical Effects (10 tarots)**

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

## Key Acceptance Criteria:

**JokerPriority Enum:**
- Must define CHIPS, MULT, MULTIPLIER in correct order
- Must provide numeric priority values for sorting

**Joker Abstract Class:**
- Must define common interface (id, name, description, priority)
- Must have abstract applyEffect method
- Must have canActivate method for condition checking
- Must have getPriority method

**ChipJoker, MultJoker, MultiplierJoker:**
- Must extend Joker base class
- Must implement applyEffect correctly
- Must support optional condition functions
- Must apply correct priority automatically

**EconomicJoker (NEW):**
- Must extend Joker base class
- Must provide economic effects (money rewards)
- Must not affect scoring directly
- Example: Golden Joker (+$2 per level)

**PermanentUpgradeJoker (NEW):**
- Must extend Joker base class
- Must permanently modify cards during play
- Must persist upgrades across hands
- Example: Hiker (+5 chips per played card)

**Planet Class:**
- Must store target hand type and bonuses
- Must apply upgrades to HandUpgradeManager
- Must validate non-negative bonuses
- Must be single-use (applied immediately on purchase)

**TarotEffect Enum:**
- Must define all effect types (ADD_CHIPS, ADD_MULT, CHANGE_SUIT, etc.)
- Must cover all 10 tarot cards

**Tarot Abstract Class:**
- Must define common interface (name, description)
- Must have abstract use method
- Must have requiresTarget method

**InstantTarot:**
- Must extend Tarot
- Must apply effect to GameState
- Must not require target card
- Example: The Hermit (double money)

**TargetedTarot:**
- Must extend Tarot
- Must require target Card
- Must apply effect to target
- Examples: The Empress, The Emperor, Strength, suit changes

## Edge Cases to Handle:

**Jokers:**
- Joker with condition that's never met (doesn't apply)
- Multiple jokers of same priority (order matters within priority)
- Multiplier joker with mult = 0 (results in 0 score)
- Synergy: multiple jokers triggering on same card
- Economic joker during defeat (no reward)
- Permanent upgrade joker with no cards played

**Planets:**
- Same planet applied multiple times (accumulates)
- Planet for hand type never played (still valid)

**Tarots:**
- Targeted tarot without valid target (error)
- Instant tarot on null game state (error)
- The Hermit with $0 money (doubles to $0)
- Strength on King (wraps to Ace)
- The Hanged Man on last card (deck becomes empty - valid)
- Death duplicating upgraded card (preserves bonuses)

---

# CLASS DIAGRAM

```
class Joker {
    <<abstract>>
    -id: string
    -name: string
    -description: string
    -priority: JokerPriority
    
    +constructor(id: string, name: string, description: string, priority: JokerPriority)
    +applyEffect(context: ScoreContext): void [ABSTRACT]
    +canActivate(context: ScoreContext): boolean
    +getPriority(): JokerPriority
}

class JokerPriority {
    <<enumeration>>
    CHIPS
    MULT
    MULTIPLIER
}

class ChipJoker extends Joker {
    -chipValue: number
    -condition: Function
    
    +applyEffect(context: ScoreContext): void
}

class MultJoker extends Joker {
    -multValue: number
    -condition: Function
    
    +applyEffect(context: ScoreContext): void
}

class MultiplierJoker extends Joker {
    -multiplierValue: number
    -condition: Function
    
    +applyEffect(context: ScoreContext): void
}

class EconomicJoker extends Joker {
    -moneyValue: number
    -trigger: Function
    
    +applyEffect(context: ScoreContext): void
    +applyEconomicEffect(gameState: GameState): void
}

class PermanentUpgradeJoker extends Joker {
    -upgradeFunction: Function
    
    +applyEffect(context: ScoreContext): void
    +applyPermanentUpgrade(card: Card): void
}

class Planet {
    -name: string
    -targetHandType: HandType
    -chipsBonus: number
    -multBonus: number
    
    +apply(upgradeManager: HandUpgradeManager): void
}

class Tarot {
    <<abstract>>
    -name: string
    -description: string
    
    +use(target?: Card | GameState): void [ABSTRACT]
    +requiresTarget(): boolean [ABSTRACT]
}

class InstantTarot extends Tarot {
    -effect: Function
    
    +use(gameState: GameState): void
    +requiresTarget(): boolean
}

class TargetedTarot extends Tarot {
    -effectType: TarotEffect
    -effectValue?: any
    
    +use(target: Card): void
    +requiresTarget(): boolean
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

ChipJoker --|> Joker
MultJoker --|> Joker
MultiplierJoker --|> Joker
EconomicJoker --|> Joker
PermanentUpgradeJoker --|> Joker
Joker --> JokerPriority
InstantTarot --|> Tarot
TargetedTarot --|> Tarot
TargetedTarot --> TarotEffect
Planet --> HandType
Planet --> HandUpgradeManager
```

---

# CODE TO REVIEW

- `joker-priority.enum.ts` - JokerPriority enum (CHIPS, MULT, MULTIPLIER)
- `joker.ts` - Abstract Joker base class
- `chip-joker.ts` - ChipJoker class
- `mult-joker.ts` - MultJoker class
- `multiplier-joker.ts` - MultiplierJoker class
- `economic-joker.ts` - **EconomicJoker class (NEW)**
- `permanent-upgrade-joker.ts` - **PermanentUpgradeJoker class (NEW)**
- `planet.ts` - Planet class
- `tarot-effect.enum.ts` - TarotEffect enum
- `tarot.ts` - Abstract Tarot base class
- `instant-tarot.ts` - InstantTarot class
- `targeted-tarot.ts` - TargetedTarot class

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation respect the class diagram structure?
- [ ] Joker abstract class properly defined with abstract methods
- [ ] All joker subclasses extend Joker correctly
- [ ] Tarot abstract class properly defined with abstract methods
- [ ] Both tarot subclasses extend Tarot correctly
- [ ] JokerPriority enum has exactly 3 values
- [ ] TarotEffect enum has all 6+ effect types
- [ ] Properties have correct visibility (private/protected/public)
- [ ] Abstract methods implemented in all subclasses
- [ ] No concrete implementation in abstract classes

**Specific checks for this module:**
- [ ] Each joker type has correct priority set automatically
- [ ] ChipJoker always has CHIPS priority
- [ ] MultJoker always has MULT priority
- [ ] MultiplierJoker always has MULTIPLIER priority
- [ ] EconomicJoker has appropriate priority (or none for scoring)
- [ ] PermanentUpgradeJoker applies upgrades correctly
- [ ] Planet class is standalone (not extending Joker/Tarot)
- [ ] InstantTarot requiresTarget returns false
- [ ] TargetedTarot requiresTarget returns true
- [ ] Inheritance hierarchy is correct (no diamond problem)

**Polymorphism usage:**
- [ ] applyEffect is polymorphic across joker types
- [ ] use method is polymorphic across tarot types
- [ ] canActivate can be overridden in subclasses

**Score:** __/10

**Observations:**
[Document any deviations from the class diagram, especially with new joker types]

---

## 2. CODE QUALITY (Weight: 25%)

### Complexity Analysis:

**Check each method for cyclomatic complexity (target: ≤10):**

**Joker Classes:**
- [ ] Joker.constructor
- [ ] Joker.canActivate
- [ ] Joker.getPriority
- [ ] ChipJoker.applyEffect
- [ ] MultJoker.applyEffect
- [ ] MultiplierJoker.applyEffect
- [ ] EconomicJoker.applyEffect
- [ ] EconomicJoker.applyEconomicEffect
- [ ] PermanentUpgradeJoker.applyEffect
- [ ] PermanentUpgradeJoker.applyPermanentUpgrade

**Planet Class:**
- [ ] Planet.constructor
- [ ] Planet.apply

**Tarot Classes:**
- [ ] Tarot.constructor
- [ ] InstantTarot.use
- [ ] InstantTarot.requiresTarget
- [ ] TargetedTarot.use
- [ ] TargetedTarot.requiresTarget

**Methods exceeding complexity threshold:**
[List any methods with complexity >10, especially condition checking logic]

### Coupling Analysis:

**Fan-out (dependencies):**
- Joker depends on: JokerPriority, ScoreContext
- ChipJoker/MultJoker/MultiplierJoker depend on: Joker, ScoreContext
- EconomicJoker depends on: Joker, GameState
- PermanentUpgradeJoker depends on: Joker, Card
- Planet depends on: HandType, HandUpgradeManager
- Tarot depends on: None (base)
- InstantTarot depends on: Tarot, GameState
- TargetedTarot depends on: Tarot, TarotEffect, Card, Suit
- **Expected fan-out:** Moderate

**Fan-in (dependents):**
- Joker used by: ScoreCalculator, GameState, Shop
- Planet used by: Shop, ShopItemGenerator
- Tarot used by: Shop, GameState, TarotZone
- **Expected fan-in:** Moderate-High

**Coupling issues:**
[Document any unexpected dependencies or tight coupling]

### Cohesion Analysis:

**Joker subsystem cohesion:**
- [ ] All joker classes relate to scoring bonuses
- [ ] No UI logic in joker classes
- [ ] No game flow logic in joker classes
- [ ] Single responsibility per joker type

**Planet class cohesion:**
- [ ] Only handles permanent hand upgrades
- [ ] No scoring logic
- [ ] No game flow logic

**Tarot subsystem cohesion:**
- [ ] All tarot classes relate to single-use effects
- [ ] No persistent bonus logic
- [ ] Clear separation between instant and targeted

**Cohesion issues:**
[Document any methods that don't belong to their class]

### Code Smells Detection:

**Long Method (>50 lines):**
- [ ] Check condition functions in jokers
- [ ] Check TargetedTarot.use implementation
- [ ] Check PermanentUpgradeJoker logic

**Large Class (>200 lines or >10 methods):**
- [ ] Joker base class size
- [ ] Check if any joker subclass is too large

**Feature Envy:**
- [ ] Jokers accessing too much ScoreContext internal data?
- [ ] Tarots accessing too much Card internal data?

**Code Duplication:**
- [ ] Similar condition checking across jokers
- [ ] Repeated validation in constructors
- [ ] Duplicate error messages

**Magic Numbers:**
- [ ] Hard-coded bonus values (+4, +20, +31, etc.) should be class properties
- [ ] Priority values should use enum, not numbers
- [ ] Effect values documented

**Switch Statements on Type:**
- [ ] TargetedTarot using switch on TarotEffect (acceptable pattern)
- [ ] No type checking with instanceof in score calculation

**Primitive Obsession:**
- [ ] Using proper enums (JokerPriority, TarotEffect)
- [ ] Not using strings for types

**Score:** __/10

**Detected code smells:**
[List specific code smells with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**JokerPriority Enum:**
- [ ] CHIPS, MULT, MULTIPLIER defined
- [ ] Can be used for sorting jokers
- [ ] Numeric values or ordering is correct

**Joker Abstract Class:**
- [ ] id, name, description, priority properties
- [ ] abstract applyEffect method
- [ ] canActivate method with default implementation
- [ ] getPriority method returns priority
- [ ] Constructor validates inputs

**ChipJoker:**
- [ ] Extends Joker correctly
- [ ] Has chipValue property
- [ ] Has optional condition function
- [ ] applyEffect adds chips to context
- [ ] Priority automatically set to CHIPS
- [ ] Condition checked before applying

**MultJoker:**
- [ ] Extends Joker correctly
- [ ] Has multValue property
- [ ] Has optional condition function
- [ ] applyEffect adds mult to context
- [ ] Priority automatically set to MULT
- [ ] Condition checked before applying

**MultiplierJoker:**
- [ ] Extends Joker correctly
- [ ] Has multiplierValue property
- [ ] Has optional condition function
- [ ] applyEffect multiplies context mult
- [ ] Priority automatically set to MULTIPLIER
- [ ] Condition checked before applying

**EconomicJoker (NEW):**
- [ ] Extends Joker correctly
- [ ] Has moneyValue property
- [ ] Has trigger condition
- [ ] Does NOT modify ScoreContext directly
- [ ] Has applyEconomicEffect method for GameState
- [ ] Example: Golden Joker grants money on level completion

**PermanentUpgradeJoker (NEW):**
- [ ] Extends Joker correctly
- [ ] Has upgrade function
- [ ] Modifies Card properties permanently
- [ ] Effects persist across hands
- [ ] Example: Hiker adds permanent chip bonus to played cards

**Planet:**
- [ ] Constructor accepts name, handType, chips, mult
- [ ] Validates non-negative bonuses
- [ ] apply method updates HandUpgradeManager
- [ ] Throws error on null manager
- [ ] Can be applied multiple times (accumulates)

**TarotEffect Enum:**
- [ ] ADD_CHIPS defined
- [ ] ADD_MULT defined
- [ ] CHANGE_SUIT defined
- [ ] UPGRADE_VALUE defined
- [ ] DUPLICATE defined
- [ ] DESTROY defined

**Tarot Abstract Class:**
- [ ] name and description properties
- [ ] abstract use method
- [ ] abstract requiresTarget method
- [ ] Constructor validates inputs

**InstantTarot:**
- [ ] Extends Tarot correctly
- [ ] Has effect function property
- [ ] use method applies effect to GameState
- [ ] requiresTarget returns false
- [ ] Throws error on null GameState
- [ ] Example: The Hermit doubles money

**TargetedTarot:**
- [ ] Extends Tarot correctly
- [ ] Has effectType property
- [ ] Has optional effectValue property
- [ ] use method applies effect to target Card
- [ ] requiresTarget returns true
- [ ] Throws error on null target
- [ ] Handles all TarotEffect types
- [ ] Examples: The Empress, The Emperor, Strength, suit changes

### Joker Examples Verification:

**Test that specific jokers can be implemented:**
- [ ] Joker (+4 mult) - MultJoker with no condition
- [ ] Greedy Joker (+3 mult per Diamond) - MultJoker with suit condition
- [ ] Half Joker (+20 mult if ≤3 cards) - MultJoker with card count condition
- [ ] Odd Todd (+31 chips per odd card) - ChipJoker with per-card condition
- [ ] Blue Joker (+2 chips per deck card) - ChipJoker with deck size condition
- [ ] Triboulet (×2 mult per K/Q) - MultiplierJoker with value condition
- [ ] Golden Joker (+$2 per level) - EconomicJoker
- [ ] Hiker (+5 chips per played card) - PermanentUpgradeJoker

### Tarot Examples Verification:

**Test that specific tarots can be implemented:**
- [ ] The Hermit (double money) - InstantTarot
- [ ] The Empress (+4 mult to card) - TargetedTarot with ADD_MULT
- [ ] The Emperor (+20 chips to card) - TargetedTarot with ADD_CHIPS
- [ ] Strength (upgrade card value) - TargetedTarot with UPGRADE_VALUE
- [ ] The Star (change to Diamonds) - TargetedTarot with CHANGE_SUIT
- [ ] The Hanged Man (destroy card) - TargetedTarot with DESTROY
- [ ] Death (duplicate card) - TargetedTarot with DUPLICATE

### Edge Cases Handling:

- [ ] Joker condition always false (doesn't apply, no error)
- [ ] Multiple jokers same priority (order preserved)
- [ ] Multiplier with 0 mult (results in 0, valid)
- [ ] Economic joker during game loss (no effect applied)
- [ ] Permanent upgrade joker with 0 cards played (no upgrades)
- [ ] Planet applied to never-played hand type (valid)
- [ ] Targeted tarot without target (throws error)
- [ ] Instant tarot on null state (throws error)
- [ ] The Hermit with $0 (doubles to $0, valid)
- [ ] Strength on King (wraps to Ace via Card.upgradeValue)
- [ ] Death duplicating upgraded card (preserves bonuses)

### Exception Management:

- [ ] Clear error messages for invalid operations
- [ ] Errors include context (joker name, effect type, etc.)
- [ ] No silent failures in apply/use methods

**Score:** __/10

**Unmet requirements:**
[List any requirements not properly implemented, especially new joker types]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Naming Analysis:

**Descriptive names:**
- [ ] Class names clear (ChipJoker, MultiplierJoker, InstantTarot)
- [ ] Method names descriptive (applyEffect, requiresTarget)
- [ ] Variable names meaningful (chipValue, effectType, not x, tmp)
- [ ] Enum values clear (CHIPS, MULT, ADD_CHIPS, CHANGE_SUIT)

**Consistency:**
- [ ] All joker classes follow naming pattern (TypeJoker)
- [ ] All tarot classes follow naming pattern (TypeTarot)
- [ ] Method names consistent across subclasses
- [ ] Property names consistent (value, condition, effect)

### Documentation Analysis:

**TSDoc comments:**
- [ ] All public classes documented
- [ ] All public methods documented
- [ ] Abstract methods documented with implementation notes
- [ ] Parameters documented
- [ ] Return values documented
- [ ] Exceptions documented

**Joker-specific documentation:**
- [ ] Priority system explained
- [ ] Condition function signature documented
- [ ] Examples of specific jokers provided
- [ ] Synergy behavior documented

**Tarot-specific documentation:**
- [ ] Effect types explained
- [ ] Target requirements documented
- [ ] Examples of specific tarots provided

**Code comments:**
- [ ] Complex condition logic explained
- [ ] Priority ordering rationale documented
- [ ] Effect application order noted
- [ ] No obvious/redundant comments

**Self-documenting code:**
- [ ] Joker type names explain their effect
- [ ] Method names explain operations
- [ ] Condition functions have descriptive names

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### SOLID Principles:

**Single Responsibility:**
- [ ] Joker: Only handles scoring bonuses
- [ ] Planet: Only handles hand upgrades
- [ ] Tarot: Only handles single-use effects
- [ ] Each joker type has one clear purpose
- [ ] EconomicJoker separate from scoring jokers
- [ ] PermanentUpgradeJoker separate from temporary effects

**Open/Closed:**
- [ ] Can add new joker types by extending Joker
- [ ] Can add new tarot effects via TarotEffect enum
- [ ] Abstract classes prevent modification of base behavior
- [ ] Easy to add new specific jokers (e.g., "Smiley Face")

**Liskov Substitution:**
- [ ] All joker subclasses can substitute Joker
- [ ] All tarot subclasses can substitute Tarot
- [ ] No unexpected behavior in subclasses

**Interface Segregation:**
- [ ] Joker interface not too large
- [ ] Tarot interface minimal
- [ ] Subclasses don't have unused methods

**Dependency Inversion:**
- [ ] Depends on ScoreContext abstraction
- [ ] Depends on JokerPriority enum, not hard-coded values
- [ ] Depends on TarotEffect enum, not strings

### DRY Principle:

- [ ] No duplicate condition checking logic
- [ ] Validation logic not repeated
- [ ] Error messages not duplicated
- [ ] Effect application pattern reused via inheritance

### KISS Principle:

- [ ] Joker effect application straightforward
- [ ] Tarot use logic clear and simple
- [ ] Priority system easy to understand
- [ ] No over-engineered condition system

### Input Validation:

- [ ] Constructor parameters validated
- [ ] Effect values validated (non-negative where appropriate)
- [ ] Target validated before use in tarots
- [ ] Enum values checked

### Extensibility:

- [ ] Easy to add new joker types
- [ ] Easy to add new tarot effects
- [ ] Easy to add new planets
- [ ] Condition functions allow flexible behavior

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

[Provide 2-3 lines about the general state of the Special Cards System. Example: "The special cards system provides a flexible architecture for jokers, planets, and tarots. The priority-based joker system correctly enforces scoring order. The new EconomicJoker and PermanentUpgradeJoker types extend functionality well. Minor improvements needed in condition function documentation."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Joker Priority Not Enforced"]
- **Location:** Lines [X-Y] in joker.ts
- **Impact:** Jokers may apply in wrong order, breaking score calculation
- **Proposed solution:** Ensure getPriority returns correct JokerPriority enum value

### Issue 2: [Title - e.g., "TargetedTarot Missing Effect Type"]
- **Location:** Lines [X-Y] in targeted-tarot.ts
- **Impact:** Cannot implement all tarot cards (e.g., The Empress missing)
- **Proposed solution:** Add missing TarotEffect cases in switch statement

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Hard-Coded Bonus Values"]
- **Location:** Lines [X-Y] in chip-joker.ts
- **Suggestion:** Extract magic numbers to named constants or class properties

### Issue 2: [Title - e.g., "Insufficient TSDoc for Abstract Methods"]
- **Location:** Line [X] in joker.ts
- **Suggestion:** Add @abstract tag and implementation guidelines in TSDoc

---

## Positive Aspects:

- [e.g., "Clean separation of joker types via inheritance"]
- [e.g., "Priority system elegantly enforces scoring order"]
- [e.g., "Abstract classes prevent code duplication"]
- [e.g., "New joker types (Economic, PermanentUpgrade) well integrated"]
- [e.g., "Condition functions provide flexibility without complexity"]
- [e.g., "Tarot effect system handles all required card modifications"]

---

## Recommended Refactorings:

### Refactoring 1: Extract Condition Validator

**BEFORE:**
```typescript
// In ChipJoker, MultJoker, MultiplierJoker - repeated pattern
if (this.condition && !this.condition(context)) {
  return;
}
```

**AFTER (proposal):**
```typescript
// In Joker base class
protected checkCondition(context: ScoreContext): boolean {
  return !this.condition || this.condition(context);
}

// In subclasses
if (!this.checkCondition(context)) {
  return;
}
```

**Rationale:** Reduces duplication and centralizes condition checking logic

---

### Refactoring 2: Tarot Effect Strategy Pattern

**BEFORE:**
```typescript
// Large switch statement in TargetedTarot.use
switch (this.effectType) {
  case TarotEffect.ADD_CHIPS: /* ... */ break;
  case TarotEffect.ADD_MULT: /* ... */ break;
  // ... many cases
}
```

**AFTER (proposal):**
```typescript
// Create effect strategy map
private effectStrategies = new Map<TarotEffect, (target: Card) => void>([
  [TarotEffect.ADD_CHIPS, (card) => card.addPermanentBonus(this.effectValue, 0)],
  [TarotEffect.ADD_MULT, (card) => card.addPermanentBonus(0, this.effectValue)],
  // ...
]);

use(target: Card): void {
  const strategy = this.effectStrategies.get(this.effectType);
  if (strategy) {
    strategy(target);
  }
}
```

**Rationale:** More maintainable and easier to extend with new effect types

---

### Refactoring 3: [Title]

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
  - All joker types implemented correctly
  - Priority system works as specified
  - Planet and tarot systems functional
  - New joker types (Economic, PermanentUpgrade) well designed
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality works
  - Minor documentation improvements needed
  - Refactorings recommended but not required
  - Technical debt tracked

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Priority system broken
  - Critical joker/tarot types missing
  - Effect application incorrect
  - Must fix before ScoreCalculator integration
