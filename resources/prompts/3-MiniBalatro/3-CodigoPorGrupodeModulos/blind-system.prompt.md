# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Domain Layer - Blind System

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
│   │   │   ├── planets/
│   │   │   └── tarots/
│   │   ├── scoring/
│   │   │   ├── score-calculator.ts
│   │   │   ├── score-context.ts
│   │   │   ├── score-result.ts
│   │   │   └── score-breakdown.ts
│   │   ├── blinds/
│   │   │   ├── index.ts
│   │   │   ├── blind.ts                 ← IMPLEMENT
│   │   │   ├── small-blind.ts           ← IMPLEMENT
│   │   │   ├── big-blind.ts             ← IMPLEMENT
│   │   │   ├── boss-blind.ts            ← IMPLEMENT
│   │   │   ├── boss-type.enum.ts        ← IMPLEMENT
│   │   │   ├── blind-modifier.ts        ← IMPLEMENT
│   │   │   └── blind-generator.ts       ← IMPLEMENT
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
- **Blind:** Level or round of the game (Small, Big, or Boss)
- **Boss Blind:** Special level every three levels with unique restrictions

### Section 4: Functional Requirements
- **FR9:** Level progression with increasing goals (Small Blind 1×, Big Blind 1.5×, Boss Blind 2×)
- **FR10:** Victory upon reaching level point goal
- **FR11:** Defeat upon exhausting 3 hands without reaching goal
- **FR18:** Rewards for passing levels (Small +$2, Big +$5, Boss +$10)
- **FR22:** Boss Blinds every third level
- **FR23-FR27:** Individual Boss Blind effects

### Section 8.7: Boss Blinds and Restrictions

| Boss | Effect During Level |
|------|---------------------|
| The Wall | Scoring goal increases to 4× round base |
| The Water | Level starts with 0 available discards |
| The Mouth | Only one specific type of poker hand is allowed |
| The Needle | Only 1 hand can be played (goal reduced to 1× base) |
| The Flint | Base chips and mult of all hands are halved |

**Selection:** Upon reaching a Boss Blind (every third level), one of these 5 bosses is randomly selected and its effects are applied only during that level.

### Section 11.3: Boss Blind (Every Third Level)

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

### Section 17: Difficulty Progression

**Round N base formula:**
```
baseScore = 300 × (1.5)^(N-1)
```

**Goals by blind type:**
- Small Blind: baseScore × 1
- Big Blind: baseScore × 1.5
- Boss Blind: baseScore × 2 (except boss modifiers)

**Progression Example:**

| Round | Small Blind | Big Blind | Boss Blind |
|-------|-------------|-----------|------------|
| 1 | 300 | 450 | 600 |
| 2 | 450 | 675 | 900 |
| 3 | 675 | 1,013 | 1,350 |
| 4 | 1,013 | 1,519 | 2,025 |
| 5 | 1,519 | 2,279 | 3,038 |

### Section 15.4: blindTargets.json (Configuration)

```json
{
  "round1": {
    "small": 300,
    "big": 450,
    "boss": 600
  },
  "round2": {
    "small": 450,
    "big": 675,
    "boss": 900
  }
  // ... more rounds with progression
}
```

---

## 2. Class Diagram

```
class Blind {
    <<abstract>>
    -level: number
    -scoreGoal: number
    -moneyReward: number
    
    +constructor(level: number)
    +getScoreGoal(): number
    +getReward(): number
    +getModifier(): BlindModifier | null
}

class SmallBlind {
    +constructor(level: number)
    +getScoreGoal(): number
}

class BigBlind {
    +constructor(level: number)
    +getScoreGoal(): number
}

class BossBlind {
    -bossType: BossType
    
    +constructor(level: number, bossType: BossType)
    +getModifier(): BlindModifier
    +getBossType(): BossType
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
    +maxHands: number
    +maxDiscards: number
    +allowedHandTypes: HandType[]
    +chipsDivisor: number
    +multDivisor: number
}

class BlindGenerator {
    +generateBlind(roundNumber: number): Blind
    -selectRandomBoss(): BossType
    -calculateBaseGoal(round: number): number
}

SmallBlind --|> Blind : extends
BigBlind --|> Blind : extends
BossBlind --|> Blind : extends
BossBlind --> BossType : has
BossBlind --> BlindModifier : provides
BlindGenerator --> Blind : creates
BlindGenerator --> BossType : selects
```

---

## 3. Use Case Diagram

**Relevant use cases:**

**Player interactions:**
- **Complete Level:** Player reaches score goal and passes blind
- **Fail Level:** Player exhausts hands without reaching goal

**System operations:**
- **Select Level Type:** System determines Small/Big/Boss based on progression
- **Apply Boss Effects:** System applies boss modifiers for duration of level
- **Progress to Next Level:** System advances to next blind after completion
- **Check Level Completion:** System verifies if goal reached or hands exhausted

**Relationships:**
- ProgressToNextLevel includes SelectLevelType
- SelectLevelType includes ApplyBossEffects (if boss blind)
- PlayHand includes CheckLevelCompletion
- CheckLevelCompletion extends CompleteLevel (if goal reached)
- CheckLevelCompletion extends FailLevel (if hands exhausted)

---

# SPECIFIC TASK

Implement the **Blind System** module consisting of 7 classes/enums:

1. **BossType** (enum) - `src/models/blinds/boss-type.enum.ts`
2. **BlindModifier** (class) - `src/models/blinds/blind-modifier.ts`
3. **Blind** (abstract class) - `src/models/blinds/blind.ts`
4. **SmallBlind** (class) - `src/models/blinds/small-blind.ts`
5. **BigBlind** (class) - `src/models/blinds/big-blind.ts`
6. **BossBlind** (class) - `src/models/blinds/boss-blind.ts`
7. **BlindGenerator** (class) - `src/models/blinds/blind-generator.ts`

---

## MODULE 1: BossType (Enum)

### Responsibilities:
- Define all 5 boss blind types
- Provide type-safe boss constants
- Support boss selection and identification

### Values to define:
- THE_WALL
- THE_WATER
- THE_MOUTH
- THE_NEEDLE
- THE_FLINT

### Additional functionality needed:
- Method to get boss display name ("The Wall", "The Water", etc.)
- Method to get boss effect description for UI

---

## MODULE 2: BlindModifier (Class)

### Responsibilities:
- Encapsulate rule modifications applied by boss blinds
- Support multiple types of game rule changes
- Enable restoration to normal rules after boss

### Properties:
- `goalMultiplier: number` - Multiplier for score goal (default: 1.0)
- `maxHands: number | null` - Override for max hands available (null = no override)
- `maxDiscards: number | null` - Override for max discards available (null = no override)
- `allowedHandTypes: HandType[] | null` - Restricted hand types (null = all allowed)
- `chipsDivisor: number` - Divisor for base chips (default: 1.0)
- `multDivisor: number` - Divisor for base mult (default: 1.0)

### Methods to implement:

#### 1. **constructor**(goalMultiplier?: number, maxHands?: number | null, maxDiscards?: number | null, allowedHandTypes?: HandType[] | null, chipsDivisor?: number, multDivisor?: number)
- **Description:** Creates a blind modifier with specified overrides (all optional with defaults)
- **Preconditions:** Numeric values >= 0 or 1 as appropriate
- **Postconditions:** BlindModifier object created with specified or default values
- **Exceptions to handle:** Throw error if multipliers/divisors < 0

#### 2. **createForBoss**(bossType: BossType): BlindModifier [STATIC]
- **Description:** Factory method to create appropriate modifier for each boss type
- **Preconditions:** Valid BossType enum
- **Postconditions:** Returns BlindModifier configured for that boss
- **Exceptions to handle:** Throw error if invalid BossType
- **Boss configurations:**
  - THE_WALL: goalMultiplier = 4
  - THE_WATER: maxDiscards = 0
  - THE_MOUTH: allowedHandTypes = [randomly selected HandType]
  - THE_NEEDLE: maxHands = 1, goalMultiplier = 0.5
  - THE_FLINT: chipsDivisor = 2, multDivisor = 2

---

## MODULE 3: Blind (Abstract Class)

### Responsibilities:
- Define common interface for all blind types
- Calculate score goals based on round number
- Provide money rewards for completion
- Support optional modifiers (for boss blinds)

### Properties:
- `level: number` - The level/blind number (1, 2, 3, ...)
- `scoreGoal: number` - Points needed to pass this blind
- `moneyReward: number` - Money earned for passing

### Methods to implement:

#### 1. **constructor**(level: number, scoreGoal: number, moneyReward: number)
- **Description:** Creates a blind with specified properties
- **Preconditions:** level > 0, scoreGoal > 0, moneyReward >= 0
- **Postconditions:** Blind object initialized
- **Exceptions to handle:** 
  - Throw error if level <= 0
  - Throw error if scoreGoal <= 0
  - Throw error if moneyReward < 0

#### 2. **getScoreGoal**(): number
- **Description:** Returns the score required to pass this blind
- **Preconditions:** None
- **Postconditions:** Returns positive number
- **Exceptions to handle:** None

#### 3. **getReward**(): number
- **Description:** Returns money earned for passing this blind
- **Preconditions:** None
- **Postconditions:** Returns non-negative number
- **Exceptions to handle:** None

#### 4. **getModifier**(): BlindModifier | null [ABSTRACT]
- **Description:** Returns modifier if this blind has special rules (must be implemented by subclasses)
- **Preconditions:** None
- **Postconditions:** Returns BlindModifier for boss blinds, null for normal blinds
- **Exceptions to handle:** Subclass responsibility

#### 5. **getLevel**(): number
- **Description:** Returns the level number of this blind
- **Preconditions:** None
- **Postconditions:** Returns positive integer
- **Exceptions to handle:** None

---

## MODULE 4: SmallBlind (Class extends Blind)

### Responsibilities:
- Represent the first blind in each round (easiest)
- Calculate goal as 1× round base
- Provide $2 reward

### Methods to implement:

#### 1. **constructor**(level: number, roundNumber: number)
- **Description:** Creates a small blind for the specified round
- **Preconditions:** level > 0, roundNumber > 0
- **Postconditions:** SmallBlind created with goal = calculateBaseGoal(roundNumber) × 1, reward = $2
- **Exceptions to handle:** Throw error if level or roundNumber <= 0

#### 2. **getModifier**(): BlindModifier | null [OVERRIDE]
- **Description:** Returns null (small blinds have no modifiers)
- **Preconditions:** None
- **Postconditions:** Returns null
- **Exceptions to handle:** None

#### 3. **calculateBaseGoal**(roundNumber: number): number [STATIC PRIVATE]
- **Description:** Calculates base score goal for a round: 300 × (1.5)^(roundNumber-1)
- **Preconditions:** roundNumber > 0
- **Postconditions:** Returns positive number
- **Exceptions to handle:** None

---

## MODULE 5: BigBlind (Class extends Blind)

### Responsibilities:
- Represent the second blind in each round (medium difficulty)
- Calculate goal as 1.5× round base
- Provide $5 reward

### Methods to implement:

#### 1. **constructor**(level: number, roundNumber: number)
- **Description:** Creates a big blind for the specified round
- **Preconditions:** level > 0, roundNumber > 0
- **Postconditions:** BigBlind created with goal = calculateBaseGoal(roundNumber) × 1.5, reward = $5
- **Exceptions to handle:** Throw error if level or roundNumber <= 0

#### 2. **getModifier**(): BlindModifier | null [OVERRIDE]
- **Description:** Returns null (big blinds have no modifiers)
- **Preconditions:** None
- **Postconditions:** Returns null
- **Exceptions to handle:** None

#### 3. **calculateBaseGoal**(roundNumber: number): number [STATIC PRIVATE]
- **Description:** Calculates base score goal for a round: 300 × (1.5)^(roundNumber-1)
- **Preconditions:** roundNumber > 0
- **Postconditions:** Returns positive number
- **Exceptions to handle:** None

---

## MODULE 6: BossBlind (Class extends Blind)

### Responsibilities:
- Represent the third blind in each round (boss encounter)
- Calculate goal as 2× round base (before boss modifier)
- Provide $10 reward
- Apply boss-specific modifier
- Store boss type for UI display

### Properties (in addition to Blind base):
- `bossType: BossType` - Which boss this blind represents

### Methods to implement:

#### 1. **constructor**(level: number, roundNumber: number, bossType: BossType)
- **Description:** Creates a boss blind with specified boss type
- **Preconditions:** level > 0, roundNumber > 0, valid BossType
- **Postconditions:** BossBlind created with goal = calculateBaseGoal(roundNumber) × 2, reward = $10
- **Exceptions to handle:** 
  - Throw error if level or roundNumber <= 0
  - Throw error if invalid BossType

#### 2. **getModifier**(): BlindModifier [OVERRIDE]
- **Description:** Returns boss-specific modifier using BlindModifier.createForBoss()
- **Preconditions:** bossType is valid
- **Postconditions:** Returns BlindModifier configured for this boss
- **Exceptions to handle:** None

#### 3. **getBossType**(): BossType
- **Description:** Returns the type of boss for this blind
- **Preconditions:** None
- **Postconditions:** Returns BossType enum value
- **Exceptions to handle:** None

#### 4. **getScoreGoal**(): number [OVERRIDE]
- **Description:** Returns score goal modified by boss (if boss affects goal)
- **Preconditions:** None
- **Postconditions:** Returns modified goal (e.g., ×4 for The Wall, ×0.5 for The Needle)
- **Exceptions to handle:** None
- **Note:** Apply boss modifier's goalMultiplier to base goal

#### 5. **calculateBaseGoal**(roundNumber: number): number [STATIC PRIVATE]
- **Description:** Calculates base score goal for a round: 300 × (1.5)^(roundNumber-1)
- **Preconditions:** roundNumber > 0
- **Postconditions:** Returns positive number
- **Exceptions to handle:** None

---

## MODULE 7: BlindGenerator (Class)

### Responsibilities:
- Generate appropriate blind for current level
- Determine blind type based on progression pattern (Small → Big → Boss)
- Randomly select boss type for boss blinds
- Calculate correct round number from level

### Methods to implement:

#### 1. **generateBlind**(level: number): Blind
- **Description:** Generates the appropriate blind for the given level number
- **Preconditions:** level > 0
- **Postconditions:** Returns SmallBlind, BigBlind, or BossBlind based on level
- **Exceptions to handle:** Throw error if level <= 0
- **Algorithm:**
  - Calculate position in round: position = (level - 1) % 3
  - Calculate round number: roundNumber = Math.floor((level - 1) / 3) + 1
  - If position == 0: return new SmallBlind(level, roundNumber)
  - If position == 1: return new BigBlind(level, roundNumber)
  - If position == 2: return new BossBlind(level, roundNumber, selectRandomBoss())

#### 2. **selectRandomBoss**(): BossType [PRIVATE]
- **Description:** Randomly selects one of the 5 boss types
- **Preconditions:** None
- **Postconditions:** Returns one of the 5 BossType values with equal probability
- **Exceptions to handle:** None

#### 3. **calculateRoundNumber**(level: number): number [STATIC]
- **Description:** Calculates which round a level belongs to
- **Preconditions:** level > 0
- **Postconditions:** Returns positive integer (round 1, 2, 3, ...)
- **Exceptions to handle:** None
- **Formula:** Math.floor((level - 1) / 3) + 1

#### 4. **getBlindTypeForLevel**(level: number): string [STATIC]
- **Description:** Returns blind type name for a level ("Small", "Big", "Boss")
- **Preconditions:** level > 0
- **Postconditions:** Returns "Small", "Big", or "Boss"
- **Exceptions to handle:** None

---

## Dependencies:

### Classes it must use:
- **BossBlind** uses **BossType** enum
- **BossBlind** uses **BlindModifier** class
- **BlindModifier** uses **HandType** from `src/models/poker/hand-type.enum.ts` (for The Mouth boss)
- **BlindGenerator** uses **Blind**, **SmallBlind**, **BigBlind**, **BossBlind** classes
- **BlindGenerator** uses **BossType** enum

### Interfaces it implements:
- None (abstract classes and concrete implementations)

### External services it consumes:
- May reference `src/utils/constants.ts` for base goal configuration (300 base, 1.5 multiplier)

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
  - Open/Closed: Easy to add new boss types via enum extension
  - Liskov Substitution: All Blind subclasses fully substitutable
  - Interface Segregation: N/A
  - Dependency Inversion: Depend on abstractions (abstract Blind)
- **Input parameter validation:**
  - Validate level and round numbers > 0
  - Validate goal and reward values non-negative
  - Validate enum values are valid
- **Robust exception handling:**
  - Throw errors with descriptive messages
  - Document exceptions in TSDoc
- **Logging at critical points:**
  - Log blind generation with type and level
  - Log boss selection and modifier creation
  - Log goal calculations
- **Comments for complex logic:**
  - Comment the progression formula (300 × 1.5^n)
  - Comment level-to-round conversion
  - Explain boss modifier configurations

## Security:
- **Input sanitization and validation:**
  - Validate numeric inputs are positive
  - Validate enum values exist
  - Prevent negative goals/rewards

---

# DELIVERABLES

## 1. Complete source code of all 7 modules with:

### File: `src/models/blinds/boss-type.enum.ts`
```typescript
/**
 * Enum defining all boss blind types.
 * Each boss has unique rule modifications.
 */
export enum BossType {
  // Enum values
}

// Helper functions
```

### File: `src/models/blinds/blind-modifier.ts`
```typescript
/**
 * Encapsulates rule modifications applied by boss blinds.
 * Contains overrides for goals, hands, discards, and base values.
 */
export class BlindModifier {
  // Properties and methods
}
```

### File: `src/models/blinds/blind.ts`
```typescript
/**
 * Abstract base class for all blind types.
 * Defines common interface for level progression.
 */
export abstract class Blind {
  // Properties and methods
}
```

### File: `src/models/blinds/small-blind.ts`
```typescript
/**
 * First blind in each round (easiest difficulty).
 * Goal = base × 1.0, Reward = $2.
 */
export class SmallBlind extends Blind {
  // Properties and methods
}
```

### File: `src/models/blinds/big-blind.ts`
```typescript
/**
 * Second blind in each round (medium difficulty).
 * Goal = base × 1.5, Reward = $5.
 */
export class BigBlind extends Blind {
  // Properties and methods
}
```

### File: `src/models/blinds/boss-blind.ts`
```typescript
/**
 * Third blind in each round (boss encounter).
 * Goal = base × 2.0 (modified by boss), Reward = $10.
 */
export class BossBlind extends Blind {
  // Properties and methods
}
```

### File: `src/models/blinds/blind-generator.ts`
```typescript
/**
 * Generates appropriate blinds based on level progression.
 * Handles Small → Big → Boss pattern and boss selection.
 */
export class BlindGenerator {
  // Properties and methods
}
```

## 2. Inline documentation:
- TSDoc comments on all public classes, methods, and enums
- Boss effect explanations in BossType enum
- Progression formula documentation
- Level-to-round conversion explanation

## 3. New dependencies:
- None (uses existing HandType from poker system)

## 4. Edge cases considered:
- Level 1 generates Small Blind (round 1)
- Level 3 generates Boss Blind (round 1)
- Level 4 generates Small Blind (round 2) with higher goal
- Boss Blind with The Wall (goal ×4)
- Boss Blind with The Needle (goal ×0.5, hands = 1)
- The Mouth with random hand type restriction
- Boss modifier with multiple rule changes (The Flint divides base values)
- Round number calculation for high levels (level 100+)
- Random boss selection ensures equal probability

---

# OUTPUT FORMAT

Provide separate code blocks for each file:

```typescript
// ============================================
// FILE: src/models/blinds/boss-type.enum.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/blinds/blind-modifier.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/blinds/blind.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/blinds/small-blind.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/blinds/big-blind.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/blinds/boss-blind.ts
// ============================================

[Complete implementation with TSDoc comments]
```

```typescript
// ============================================
// FILE: src/models/blinds/blind-generator.ts
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
