# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Blind System

**Components under review:**
- `BossType` (enum) - `src/models/blinds/boss-type.enum.ts`
- `BlindModifier` (class) - `src/models/blinds/blind-modifier.ts`
- `Blind` (abstract class) - `src/models/blinds/blind.ts`
- `SmallBlind` (class) - `src/models/blinds/small-blind.ts`
- `BigBlind` (class) - `src/models/blinds/big-blind.ts`
- `BossBlind` (class) - `src/models/blinds/boss-blind.ts`
- `BlindGenerator` (class) - `src/models/blinds/blind-generator.ts`

**Component objective:** 
Implement the level progression system with three blind types per round (Small → Big → Boss). The system must calculate progressive difficulty scaling, manage boss blind special effects, and generate appropriate blinds based on game progression. Boss blinds introduce unique rule modifications every third level.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**FR9:** Level progression with increasing goals (Small Blind 1×, Big Blind 1.5×, Boss Blind 2×)
- Acceptance: Goals scale correctly with round progression
- Acceptance: Small < Big < Boss difficulty

**FR10:** Victory upon reaching level point goal
- Acceptance: Score comparison works correctly

**FR11:** Defeat upon exhausting 3 hands without reaching goal
- Acceptance: Failure condition properly enforced

**FR18:** Rewards for passing levels (Small +$2, Big +$5, Boss +$10)
- Acceptance: Correct money amounts granted

**FR22:** Boss Blinds every third level
- Acceptance: Level 3, 6, 9, 12, ... are boss blinds
- Acceptance: Boss selected randomly

**FR23-FR27:** Individual Boss Blind effects
- Acceptance: Each boss has unique rule modifications
- Acceptance: Effects only apply during that blind

**Section 8.7: Boss Blinds and Restrictions**

| Boss | Effect During Level |
|------|---------------------|
| The Wall | Scoring goal increases to 4× round base |
| The Water | Level starts with 0 available discards |
| The Mouth | Only one specific type of poker hand is allowed |
| The Needle | Only 1 hand can be played (goal reduced to 1× base) |
| The Flint | Base chips and mult of all hands are halved |

**Selection:** Upon reaching a Boss Blind (every third level), one of these 5 bosses is randomly selected with equal probability and its effects are applied only during that level.

**Section 11.3: Boss Blind (Every Third Level)**

1. System randomly selects 1 of 5 bosses
2. Introduction screen shown with boss name and effect
3. Boss modifications applied:
   - **The Wall:** Goal × 4
   - **The Water:** Discards = 0
   - **The Mouth:** Randomly selects allowed hand type
   - **The Needle:** Hands = 1, Goal × 0.5
   - **The Flint:** Divides base chips and mult of all hands by 2
4. Level develops with modified rules
5. Upon passing: +$10 reward and shop

**Section 17: Difficulty Progression**

**Round N base formula:**
```
baseScore = 300 × (1.5)^(N-1)
```

**Goals by blind type:**
- Small Blind: baseScore × 1.0
- Big Blind: baseScore × 1.5
- Boss Blind: baseScore × 2.0 (before boss modifiers)

**Progression Example:**

| Round | Small Blind | Big Blind | Boss Blind |
|-------|-------------|-----------|------------|
| 1 | 300 | 450 | 600 |
| 2 | 450 | 675 | 900 |
| 3 | 675 | 1,013 | 1,350 |
| 4 | 1,013 | 1,519 | 2,025 |
| 5 | 1,519 | 2,279 | 3,038 |

## Key Acceptance Criteria:

**BossType Enum:**
- Must define exactly 5 boss types
- Must provide display name method ("The Wall", "The Water", etc.)
- Must provide effect description method for UI

**BlindModifier Class:**
- Must encapsulate all possible rule modifications
- Must have optional properties for each modification type
- Must provide static factory method createForBoss(bossType)
- Must validate modifier values (no negative multipliers)
- Must support default values (1.0 multipliers, null overrides)

**Blind Abstract Class:**
- Must have level, scoreGoal, moneyReward properties
- Must have abstract getModifier() method
- Must validate constructor inputs (positive values)
- Must provide getScoreGoal(), getReward(), getLevel() methods
- Must be extensible for three blind types

**SmallBlind Class:**
- Must extend Blind correctly
- Must calculate goal = base × 1.0
- Must provide $2 reward
- Must return null for getModifier()

**BigBlind Class:**
- Must extend Blind correctly
- Must calculate goal = base × 1.5
- Must provide $5 reward
- Must return null for getModifier()

**BossBlind Class:**
- Must extend Blind correctly
- Must calculate goal = base × 2.0 (before boss modifier)
- Must provide $10 reward
- Must store bossType property
- Must return BlindModifier from getModifier()
- Must apply boss-specific goal modifier (Wall ×4, Needle ×0.5)
- Must provide getBossType() method

**BlindGenerator Class:**
- Must generate correct blind type based on level number
- Must follow pattern: Small → Big → Boss, repeat
- Must calculate correct round number from level
- Must randomly select boss type for boss blinds
- Must calculate progressive difficulty correctly
- Must use static methods for reusability

## Edge Cases to Handle:

**Difficulty calculation:**
- Level 1 (round 1, Small Blind): 300 points
- Level 100+ (high rounds): handle large exponents
- Floating point precision in goal calculation
- Rounding to integers (Math.floor or Math.round)

**Blind generation:**
- Level 1 generates Small Blind (round 1)
- Level 2 generates Big Blind (round 1)
- Level 3 generates Boss Blind (round 1)
- Level 4 generates Small Blind (round 2) with higher goal
- Level 0 or negative (throw error)

**Boss modifiers:**
- The Wall multiplies goal (4× base becomes 8× after 2× boss multiplier)
- The Needle reduces goal (0.5× instead of 2×)
- The Water sets discards = 0 (override, not null)
- The Mouth must randomly select valid HandType
- The Flint divides score components (divisor = 2)

**BlindModifier creation:**
- All properties optional with proper defaults
- Multiple modifiers can be active (e.g., goal + hands)
- Null vs 0 distinction (null = no override, 0 = set to zero)

---

# CLASS DIAGRAM

```
class Blind {
    <<abstract>>
    #level: number
    #scoreGoal: number
    #moneyReward: number
    
    +constructor(level: number, scoreGoal: number, moneyReward: number)
    +getScoreGoal(): number
    +getReward(): number
    +getModifier(): BlindModifier | null [ABSTRACT]
    +getLevel(): number
}

class SmallBlind extends Blind {
    +constructor(level: number, roundNumber: number)
    +getModifier(): BlindModifier | null
    -calculateBaseGoal(roundNumber: number): number [STATIC]
}

class BigBlind extends Blind {
    +constructor(level: number, roundNumber: number)
    +getModifier(): BlindModifier | null
    -calculateBaseGoal(roundNumber: number): number [STATIC]
}

class BossBlind extends Blind {
    -bossType: BossType
    
    +constructor(level: number, roundNumber: number, bossType: BossType)
    +getModifier(): BlindModifier
    +getBossType(): BossType
    +getScoreGoal(): number [OVERRIDE]
    -calculateBaseGoal(roundNumber: number): number [STATIC]
}

class BossType {
    <<enumeration>>
    THE_WALL
    THE_WATER
    THE_MOUTH
    THE_NEEDLE
    THE_FLINT
}

class BlindModifier {
    +goalMultiplier: number
    +maxHands: number | null
    +maxDiscards: number | null
    +allowedHandTypes: HandType[] | null
    +chipsDivisor: number
    +multDivisor: number
    
    +constructor(goalMultiplier?: number, maxHands?: number | null, maxDiscards?: number | null, allowedHandTypes?: HandType[] | null, chipsDivisor?: number, multDivisor?: number)
    +createForBoss(bossType: BossType): BlindModifier [STATIC]
}

class BlindGenerator {
    +generateBlind(level: number): Blind
    -selectRandomBoss(): BossType [STATIC]
    -calculateRoundNumber(level: number): number [STATIC]
    -getBlindTypeForLevel(level: number): string [STATIC]
}

SmallBlind --|> Blind
BigBlind --|> Blind
BossBlind --|> Blind
BossBlind --> BossType
BossBlind --> BlindModifier
BlindGenerator --> Blind
BlindGenerator --> BossType
BlindModifier --> HandType
```

---

# CODE TO REVIEW

- `boss-type.enum.ts` - BossType enum (5 boss types)
- `blind-modifier.ts` - BlindModifier class
- `blind.ts` - Abstract Blind base class
- `small-blind.ts` - SmallBlind class
- `big-blind.ts` - BigBlind class
- `boss-blind.ts` - BossBlind class
- `blind-generator.ts` - BlindGenerator class

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation respect the class diagram structure?
- [ ] Blind abstract class properly defined with abstract methods
- [ ] All three blind subclasses extend Blind correctly
- [ ] BossType enum has exactly 5 values
- [ ] BlindModifier has all required properties
- [ ] Properties have correct visibility (protected/private/public)
- [ ] Abstract methods implemented in all subclasses
- [ ] Static methods marked as static

**Specific checks for this module:**
- [ ] SmallBlind, BigBlind, BossBlind inherit from Blind
- [ ] Each blind type calculates goal correctly (1.0×, 1.5×, 2.0×)
- [ ] Each blind type has correct reward ($2, $5, $10)
- [ ] BossBlind stores bossType property
- [ ] BossBlind overrides getScoreGoal() to apply boss modifier
- [ ] SmallBlind and BigBlind return null from getModifier()
- [ ] BossBlind returns BlindModifier from getModifier()
- [ ] BlindGenerator is stateless utility class
- [ ] calculateBaseGoal is private static in each blind class

**Inheritance hierarchy:**
- [ ] Blind is abstract with no concrete instances
- [ ] Three concrete subclasses properly extend Blind
- [ ] No diamond problem or multiple inheritance
- [ ] Protected properties accessible in subclasses
- [ ] Constructor chaining correct (super() calls)

**Score:** __/10

**Observations:**
[Document any deviations from the class diagram]

---

## 2. CODE QUALITY (Weight: 25%)

### Complexity Analysis:

**Check each method for cyclomatic complexity (target: ≤10):**

**Blind (abstract):**
- [ ] constructor
- [ ] getScoreGoal
- [ ] getReward
- [ ] getLevel

**SmallBlind:**
- [ ] constructor
- [ ] getModifier
- [ ] calculateBaseGoal (static)

**BigBlind:**
- [ ] constructor
- [ ] getModifier
- [ ] calculateBaseGoal (static)

**BossBlind:**
- [ ] constructor
- [ ] getModifier
- [ ] getBossType
- [ ] getScoreGoal (override)
- [ ] calculateBaseGoal (static)

**BlindModifier:**
- [ ] constructor
- [ ] createForBoss (static - may be complex with 5 boss types)

**BlindGenerator:**
- [ ] generateBlind (watch for level-to-blind-type logic)
- [ ] selectRandomBoss (static)
- [ ] calculateRoundNumber (static)
- [ ] getBlindTypeForLevel (static)

**Methods exceeding complexity threshold:**
[List any methods with complexity >10, especially BlindModifier.createForBoss]

### Coupling Analysis:

**Fan-out (dependencies):**
- Blind depends on: None (base class)
- SmallBlind depends on: Blind
- BigBlind depends on: Blind
- BossBlind depends on: Blind, BossType, BlindModifier
- BlindModifier depends on: BossType, HandType
- BlindGenerator depends on: Blind, SmallBlind, BigBlind, BossBlind, BossType
- **Expected fan-out:** Low-Moderate

**Fan-in (dependents):**
- Blind used by: GameState, GameController
- BossType used by: BossBlind, BlindModifier, BlindGenerator
- BlindModifier used by: BossBlind, ScoreCalculator, GameState
- BlindGenerator used by: GameState, GameController
- **Expected fan-in:** Moderate

**Coupling issues:**
[Document any unexpected dependencies or tight coupling]

### Cohesion Analysis:

**Blind hierarchy cohesion:**
- [ ] All methods relate to blind/level information
- [ ] No game logic beyond blind definition
- [ ] No scoring logic
- [ ] Single responsibility per class

**BlindModifier cohesion:**
- [ ] All properties relate to rule modifications
- [ ] Factory method for boss creation appropriate
- [ ] No blind generation logic

**BlindGenerator cohesion:**
- [ ] All methods relate to blind generation
- [ ] No game state management
- [ ] Pure utility functions

**Cohesion issues:**
[Document any methods that don't belong to their class]

### Code Smells Detection:

**Long Method (>50 lines):**
- [ ] Check BlindModifier.createForBoss (5 boss cases)
- [ ] Check BlindGenerator.generateBlind

**Large Class (>200 lines or >10 methods):**
- [ ] No class should be excessively large

**Feature Envy:**
- [ ] BossBlind accessing too much BlindModifier data?

**Code Duplication:**
- [ ] calculateBaseGoal repeated in 3 blind classes (acceptable, could be extracted)
- [ ] Constructor validation repeated
- [ ] Goal calculation formula repeated

**Magic Numbers:**
- [ ] Base goal (300) should be constant
- [ ] Growth rate (1.5) should be constant
- [ ] Multipliers (1.0, 1.5, 2.0, 4.0, 0.5) should be documented
- [ ] Rewards ($2, $5, $10) should be constants
- [ ] Boss-specific values (0 discards, divisor 2, etc.) documented

**Switch Statements on Type:**
- [ ] BlindModifier.createForBoss uses switch on BossType (acceptable pattern)
- [ ] No type checking with instanceof in generation

**Primitive Obsession:**
- [ ] Using proper enum (BossType)
- [ ] Using proper classes (Blind hierarchy)
- [ ] Not using strings for types

**Score:** __/10

**Detected code smells:**
[List specific code smells with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**BossType Enum:**
- [ ] THE_WALL defined
- [ ] THE_WATER defined
- [ ] THE_MOUTH defined
- [ ] THE_NEEDLE defined
- [ ] THE_FLINT defined
- [ ] Helper to get display name ("The Wall", etc.)
- [ ] Helper to get effect description

**BlindModifier Class:**
- [ ] goalMultiplier property (default 1.0)
- [ ] maxHands property (number | null)
- [ ] maxDiscards property (number | null)
- [ ] allowedHandTypes property (HandType[] | null)
- [ ] chipsDivisor property (default 1.0)
- [ ] multDivisor property (default 1.0)
- [ ] Constructor with all optional parameters
- [ ] Constructor validates non-negative multipliers/divisors
- [ ] createForBoss static factory method
- [ ] createForBoss handles all 5 boss types
- [ ] createForBoss validates BossType
- [ ] THE_WALL: goalMultiplier = 4
- [ ] THE_WATER: maxDiscards = 0
- [ ] THE_MOUTH: allowedHandTypes = [random HandType]
- [ ] THE_NEEDLE: maxHands = 1, goalMultiplier = 0.5
- [ ] THE_FLINT: chipsDivisor = 2, multDivisor = 2

**Blind Abstract Class:**
- [ ] level property (protected or private)
- [ ] scoreGoal property (protected or private)
- [ ] moneyReward property (protected or private)
- [ ] Constructor validates level > 0
- [ ] Constructor validates scoreGoal > 0
- [ ] Constructor validates moneyReward >= 0
- [ ] getScoreGoal returns scoreGoal
- [ ] getReward returns moneyReward
- [ ] getLevel returns level
- [ ] abstract getModifier method defined

**SmallBlind Class:**
- [ ] Extends Blind correctly
- [ ] Constructor accepts level and roundNumber
- [ ] Calculates goal = baseGoal × 1.0
- [ ] Sets reward = $2
- [ ] getModifier returns null
- [ ] calculateBaseGoal implements 300 × (1.5)^(round-1)
- [ ] calculateBaseGoal is private static

**BigBlind Class:**
- [ ] Extends Blind correctly
- [ ] Constructor accepts level and roundNumber
- [ ] Calculates goal = baseGoal × 1.5
- [ ] Sets reward = $5
- [ ] getModifier returns null
- [ ] calculateBaseGoal implements 300 × (1.5)^(round-1)
- [ ] calculateBaseGoal is private static

**BossBlind Class:**
- [ ] Extends Blind correctly
- [ ] Constructor accepts level, roundNumber, bossType
- [ ] Calculates base goal = baseGoal × 2.0
- [ ] Sets reward = $10
- [ ] Stores bossType property
- [ ] getModifier returns BlindModifier via createForBoss
- [ ] getBossType returns bossType
- [ ] getScoreGoal overridden to apply boss goal modifier
- [ ] THE_WALL boss: goal × 4 (total 8× base)
- [ ] THE_NEEDLE boss: goal × 0.5 (total 1× base)
- [ ] Other bosses: goal unchanged (2× base)
- [ ] calculateBaseGoal implements 300 × (1.5)^(round-1)
- [ ] calculateBaseGoal is private static

**BlindGenerator Class:**
- [ ] generateBlind accepts level number
- [ ] generateBlind validates level > 0
- [ ] Level % 3 == 1: returns SmallBlind (levels 1, 4, 7, ...)
- [ ] Level % 3 == 2: returns BigBlind (levels 2, 5, 8, ...)
- [ ] Level % 3 == 0: returns BossBlind (levels 3, 6, 9, ...)
- [ ] Boss blind gets random boss type
- [ ] selectRandomBoss selects one of 5 types equally
- [ ] calculateRoundNumber formula: Math.floor((level - 1) / 3) + 1
- [ ] getBlindTypeForLevel returns "Small", "Big", or "Boss"
- [ ] All helper methods are static

### Difficulty Progression Verification:

**Test calculations:**
- [ ] Round 1, Small: 300 × (1.5)^0 × 1.0 = 300
- [ ] Round 1, Big: 300 × (1.5)^0 × 1.5 = 450
- [ ] Round 1, Boss: 300 × (1.5)^0 × 2.0 = 600
- [ ] Round 2, Small: 300 × (1.5)^1 × 1.0 = 450
- [ ] Round 2, Big: 300 × (1.5)^1 × 1.5 = 675
- [ ] Round 2, Boss: 300 × (1.5)^1 × 2.0 = 900
- [ ] Round 3, Small: 300 × (1.5)^2 × 1.0 = 675
- [ ] Round 5, Boss (The Wall): 300 × (1.5)^4 × 2.0 × 4 = ~12,152

**Boss modifier calculations:**
- [ ] The Wall: base goal × 2 × 4 = 8× base
- [ ] The Needle: base goal × 2 × 0.5 = 1× base
- [ ] Others: base goal × 2 = 2× base

### Edge Cases Handling:

- [ ] Level 1 generates Small Blind (round 1, goal 300)
- [ ] Level 3 generates Boss Blind (round 1, goal 600 + boss modifier)
- [ ] Level 4 generates Small Blind (round 2, goal 450)
- [ ] Level 100 calculates correctly (no overflow)
- [ ] Level 0 or negative throws error
- [ ] Boss selection random (test distribution)
- [ ] The Mouth selects valid HandType randomly
- [ ] The Water sets discards to 0 (not null)
- [ ] The Flint divisors applied correctly
- [ ] Floating point precision handled (Math.floor/round)

### Exception Management:

- [ ] Clear error messages for invalid inputs
- [ ] Errors include context (level number, boss type)
- [ ] Invalid BossType in createForBoss throws error
- [ ] No silent failures

**Score:** __/10

**Unmet requirements:**
[List any requirements not properly implemented, especially progression formula or boss effects]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Naming Analysis:

**Descriptive names:**
- [ ] Class names clear (SmallBlind, BossBlind, BlindModifier)
- [ ] Method names descriptive (generateBlind, selectRandomBoss)
- [ ] Variable names meaningful (goalMultiplier, roundNumber, not x, tmp)
- [ ] Enum values clear (THE_WALL, THE_WATER, THE_FLINT)

**Consistency:**
- [ ] All blind classes follow naming pattern
- [ ] All static helpers use consistent naming
- [ ] Boss names capitalized consistently
- [ ] Method naming conventions followed (get, calculate)

### Documentation Analysis:

**TSDoc comments:**
- [ ] All public classes documented
- [ ] All public methods documented
- [ ] Abstract methods documented with implementation notes
- [ ] Parameters documented
- [ ] Return values documented
- [ ] Exceptions documented

**Progression formula documentation:**
- [ ] Base formula explained (300 × 1.5^n)
- [ ] Blind multipliers documented (1.0, 1.5, 2.0)
- [ ] Boss modifiers explained
- [ ] Round-to-level conversion documented

**Boss effect documentation:**
- [ ] Each boss effect clearly described
- [ ] Modifier properties explained
- [ ] Interaction with game rules documented

**Code comments:**
- [ ] Progression formula derivation explained
- [ ] Boss selection randomness noted
- [ ] Goal calculation steps commented
- [ ] No obvious/redundant comments

**Self-documenting code:**
- [ ] Method names explain purpose
- [ ] Boss type names self-explanatory
- [ ] Variable names clear

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### SOLID Principles:

**Single Responsibility:**
- [ ] Blind: Only represents a level/blind
- [ ] SmallBlind: Only small blind specifics
- [ ] BigBlind: Only big blind specifics
- [ ] BossBlind: Only boss blind specifics
- [ ] BlindModifier: Only rule modifications
- [ ] BlindGenerator: Only blind generation
- [ ] BossType: Only boss type definition

**Open/Closed:**
- [ ] Easy to add new blind types via inheritance
- [ ] Easy to add new bosses via enum
- [ ] Abstract class prevents modification of base behavior
- [ ] Factory method (createForBoss) supports extension

**Liskov Substitution:**
- [ ] All blind subclasses can substitute Blind
- [ ] No unexpected behavior in subclasses
- [ ] Polymorphism works correctly

**Interface Segregation:**
- [ ] Blind interface not too large
- [ ] Subclasses don't have unused methods

**Dependency Inversion:**
- [ ] Depends on BossType enum (abstraction)
- [ ] Generator returns Blind interface, not concrete types

### DRY Principle:

- [ ] calculateBaseGoal duplicated 3 times (could be extracted to utility)
- [ ] Validation logic similar across constructors
- [ ] No duplicate boss effect definitions

### KISS Principle:

- [ ] Progression formula straightforward
- [ ] Blind generation logic clear
- [ ] Boss modifier creation simple
- [ ] No over-engineered patterns

### Input Validation:

- [ ] Level validated > 0
- [ ] Round number validated > 0
- [ ] BossType validity checked
- [ ] Goal and reward validated non-negative

### Magic Numbers Extraction:

- [ ] Base goal (300) defined as constant
- [ ] Growth rate (1.5) defined as constant
- [ ] Multipliers documented
- [ ] Rewards documented

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

[Provide 2-3 lines about the general state of the Blind System. Example: "The blind system correctly implements level progression with three blind types and difficulty scaling. Boss blind effects are properly encapsulated in BlindModifier. Minor improvements needed in extracting duplicate progression formula and adding more comprehensive documentation for boss interactions."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Progression Formula Incorrect"]
- **Location:** Lines [X-Y] in small-blind.ts
- **Impact:** Goals don't match specification, game difficulty broken
- **Proposed solution:** Fix formula to 300 × (1.5)^(round-1)

### Issue 2: [Title - e.g., "Boss Modifier Not Applied"]
- **Location:** Lines [X-Y] in boss-blind.ts
- **Impact:** Boss effects don't work (e.g., The Wall doesn't multiply goal)
- **Proposed solution:** Override getScoreGoal() to apply modifier.goalMultiplier

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Duplicate Progression Formula"]
- **Location:** small-blind.ts, big-blind.ts, boss-blind.ts
- **Suggestion:** Extract calculateBaseGoal to shared utility or parent class

### Issue 2: [Title - e.g., "Magic Numbers Not Extracted"]
- **Location:** Throughout blind classes
- **Suggestion:** Define BASE_GOAL = 300, GROWTH_RATE = 1.5 as constants

---

## Positive Aspects:

- [e.g., "Clean inheritance hierarchy with proper abstraction"]
- [e.g., "BlindModifier elegantly encapsulates all rule modifications"]
- [e.g., "Factory pattern in createForBoss supports all 5 bosses"]
- [e.g., "BlindGenerator correctly implements level-to-blind-type pattern"]
- [e.g., "Boss selection properly randomized"]
- [e.g., "Progression formula correctly implemented"]

---

## Recommended Refactorings:
