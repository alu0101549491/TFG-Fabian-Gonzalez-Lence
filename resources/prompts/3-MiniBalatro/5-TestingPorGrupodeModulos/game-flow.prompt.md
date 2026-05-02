# TESTING CONTEXT
Project: Mini Balatro
Components under test: Complete game flow integration (end-to-end game scenarios)
Testing framework: Jest 29.x, ts-jest
Target coverage: Integration coverage across all systems

# CODE TO TEST

This is an **integration test suite** that tests the interaction between ALL major components:
- GameController
- GameState
- Shop
- Blinds System
- Score Calculation
- Jokers, Planets, Tarots
- Persistence

# JEST CONFIGURATION
```json
/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@views/(.*)$': '<rootDir>/src/views/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/main.tsx',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
```

# TYPESCRIPT CONFIGURATION
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@models/*": ["src/models/*"],
      "@controllers/*": ["src/controllers/*"],
      "@services/*": ["src/services/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    },

    /* Additional options */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

# REQUIREMENTS SPECIFICATION

## Integration Test Scenarios:

### Purpose:
- Test complete game flows from start to finish
- Verify all systems work together correctly
- Simulate realistic player scenarios
- Catch integration bugs that unit tests miss
- Validate game balance and progression

### Test Categories:

#### 1. Complete Level Flow:
- Start new game
- Deal hand
- Select cards
- Play hand
- Score calculation correct
- Level completion check
- Shop opens
- Purchase items
- Exit shop
- Next level starts

#### 2. Victory Path:
- Complete all 24 levels
- Progress through 8 rounds
- Face all 3 blind types per round
- Accumulate enough money for purchases
- Victory condition triggered
- Game ends successfully

#### 3. Defeat Path:
- Exhaust all hands without meeting goal
- Game over condition triggered
- Defeat callback called
- Game becomes inactive

#### 4. Joker Integration:
- Purchase joker in shop
- Joker persists across levels
- Joker correctly affects score
- Multiple jokers stack correctly
- Economic joker awards money
- Permanent upgrade joker modifies cards

#### 5. Planet Integration:
- Purchase planet in shop
- Upgrade applied to hand type
- Subsequent hands use upgraded values
- Multiple planet purchases accumulate
- All 9 planet types work correctly

#### 6. Tarot Integration:
- Purchase tarot in shop
- Use targeted tarot on card
- Card modification persists
- Use instant tarot (The Hermit)
- Money doubled correctly
- Consumable removed after use

#### 7. Boss Blind Integration:
- Reach boss blind (level 3, 6, 9, etc.)
- Boss modifier applied
- The Water: 0 discards
- The Needle: 1 hand
- The Wall: 4× goal
- Boss mechanics work correctly

#### 8. Save/Load Integration:
- Play several levels
- Save game
- Load game
- State restored correctly
- Continue playing from saved point
- Victory/defeat still work

#### 9. Shop Mechanics:
- Reroll shop
- Items change
- Purchase with exact money
- Purchase with insufficient funds fails
- Shop inventory limits enforced

#### 10. Score Progression:
- Level 1 goal: 300
- Level 2 goal: 450
- Level 3 goal: 600 (boss)
- Goals increase exponentially
- Jokers help meet increasing goals
- Planet upgrades necessary for late game

### Realistic Player Scenarios:

**Scenario 1: Beginner Victory Path**
- Focus on simple hands (Pairs, Three of a Kind)
- Purchase mult jokers early
- Use planets to upgrade common hands
- Conservative play (use all hands)
- Win by level 24

**Scenario 2: Advanced Strategy**
- Build joker synergies
- Target specific hand types with planets
- Risky play (fewer hands, higher scores)
- Tarot cards for card enhancement
- Efficient shop spending

**Scenario 3: Boss Challenge**
- Prepare for boss blinds
- The Water: no discard strategy
- The Needle: single perfect hand
- The Wall: massive score requirement
- Overcome boss mechanics

**Scenario 4: Economic Strategy**
- Golden Joker for passive income
- Maximize money per level
- Reroll shop frequently
- Build optimal joker collection
- Planet every hand type

**Scenario 5: Failure Cases**
- Bad RNG (poor card draws)
- Wrong joker purchases
- Inefficient hand selection
- Running out of money
- Defeat on difficult boss

### Edge Cases:
- Rapid level completion
- Perfect play (complete each level in 1 hand)
- Minimum viable strategy
- Maximum difficulty progression
- State transitions during boss blinds
- Save during shop
- Load during active hand

# TASK

Generate a complete integration test suite that covers:

## 1. Basic Game Flow Tests

### Complete Level Cycle:
- [ ] Start game → deal → play → shop → next level
- [ ] State transitions correct
- [ ] Money awarded correctly
- [ ] Callbacks triggered appropriately

### First 3 Levels:
- [ ] Level 1: Small Blind, 300 goal
- [ ] Level 2: Big Blind, 450 goal
- [ ] Level 3: Boss Blind, 600+ goal
- [ ] Pattern repeats for levels 4-6

## 2. Victory Path Tests

### Complete 24 Levels:
- [ ] Can complete all 24 levels (simplified)
- [ ] Victory triggered after level 24
- [ ] onVictory callback called
- [ ] Game becomes inactive

### Progressive Difficulty:
- [ ] Goals increase exponentially
- [ ] Later levels require strategy
- [ ] Money accumulation sufficient

## 3. Defeat Path Tests

### Exhaust Hands:
- [ ] Play all 3 hands
- [ ] Score insufficient
- [ ] Defeat triggered
- [ ] onDefeat callback called

### Early Game Defeat:
- [ ] Can lose on level 1
- [ ] Can lose on level 3 (boss)

## 4. Joker Integration Tests

### Purchase and Persistence:
- [ ] Buy joker in shop
- [ ] Joker in inventory
- [ ] Joker affects next hand
- [ ] Joker persists across levels

### Multiple Jokers:
- [ ] Buy 3 jokers
- [ ] All affect score
- [ ] Effects stack correctly

### Joker Types:
- [ ] MultJoker (+4 mult)
- [ ] ChipJoker (Odd Todd)
- [ ] MultiplierJoker (Triboulet)
- [ ] Golden Joker (economic)
- [ ] Hiker (permanent upgrade)

### Economic Joker:
- [ ] Purchase Golden Joker
- [ ] Complete level
- [ ] Gain +$2 bonus
- [ ] Money accumulates

## 5. Planet Integration Tests

### Purchase and Apply:
- [ ] Buy Pluto (High Card upgrade)
- [ ] Play single card hand
- [ ] Score reflects upgrade
- [ ] Upgrade persists

### Multiple Planets:
- [ ] Buy Pluto twice
- [ ] Upgrades accumulate
- [ ] High Card gets +20 chips, +2 mult total

### All Planet Types:
- [ ] Each planet upgrades correct hand type
- [ ] All 9 hand types can be upgraded

## 6. Tarot Integration Tests

### Targeted Tarot:
- [ ] Buy The Empress
- [ ] Use on card in hand
- [ ] Card gains +4 mult
- [ ] Modified card used in hand
- [ ] Bonus affects score

### Instant Tarot:
- [ ] Buy The Hermit
- [ ] Use tarot
- [ ] Money doubled
- [ ] Consumable removed

### Death Tarot:
- [ ] Buy Death
- [ ] Use on card
- [ ] Duplicate created
- [ ] Deck has extra card

## 7. Boss Blind Integration Tests

### The Water:
- [ ] Reach level 3
- [ ] If The Water, 0 discards
- [ ] Attempt discard throws error
- [ ] Can still play hands

### The Needle:
- [ ] Reach level 3
- [ ] If The Needle, 1 hand remaining
- [ ] Goal reduced (×0.5)
- [ ] Must win in single hand

### The Wall:
- [ ] Reach level 3
- [ ] If The Wall, goal ×4
- [ ] Much higher score required
- [ ] Can still be beaten

## 8. Save/Load Integration Tests

### Save Mid-Game:
- [ ] Play to level 5
- [ ] Save game
- [ ] Load game
- [ ] Resume at level 5
- [ ] All state intact

### Save with Inventory:
- [ ] Have 2 jokers, 1 tarot
- [ ] Save and load
- [ ] Inventory restored

### Save in Shop:
- [ ] Open shop
- [ ] Save game
- [ ] Load game
- [ ] Shop state restored

## 9. Shop Mechanics Integration Tests

### Reroll:
- [ ] Open shop
- [ ] Note items
- [ ] Reroll
- [ ] Different items
- [ ] Money deducted

### Purchase Limits:
- [ ] Buy 5 jokers
- [ ] 6th purchase fails or requires replacement
- [ ] Buy 2 tarots
- [ ] 3rd purchase fails or requires replacement

### Insufficient Funds:
- [ ] Have $3
- [ ] Try buy $5 joker
- [ ] Purchase fails
- [ ] Money unchanged

## 10. Score Progression Tests

### Level Difficulty:
- [ ] Level 1 goal: 300 (achievable with basic hands)
- [ ] Level 10 goal: ~38,000 (requires jokers/planets)
- [ ] Level 24 goal: very high (requires strong build)

### Joker Necessity:
- [ ] Level 10+ difficult without jokers
- [ ] Multiple jokers make it manageable
- [ ] Planet upgrades essential late game

## 11. Realistic Scenario Tests

### Beginner Strategy:
- [ ] Play conservatively
- [ ] Buy mult jokers early
- [ ] Upgrade common hands
- [ ] Reach victory

### Advanced Strategy:
- [ ] Build joker synergies
- [ ] Triboulet + King/Queen focus
- [ ] Planet straight or flush
- [ ] Efficient victories

### Economic Strategy:
- [ ] Golden Joker early
- [ ] Reroll frequently
- [ ] Optimize purchases
- [ ] Rich endgame

## 12. Edge Cases

### Perfect Play:
- [ ] Complete each level in 1 hand
- [ ] Maximum efficiency

### Rapid Progression:
- [ ] Quick level completions
- [ ] State transitions stable

### Complex Inventory:
- [ ] 5 jokers, 2 tarots
- [ ] All affecting score correctly

## 13. Multi-System Integration

### Joker + Planet + Tarot:
- [ ] Have mult joker
- [ ] Upgrade hand with planet
- [ ] Enhance cards with tarot
- [ ] All bonuses stack correctly
- [ ] Massive scores achievable

### Full Game Cycle:
- [ ] Start → 24 levels → victory
- [ ] Save/load mid-game
- [ ] Use all special card types
- [ ] Overcome all boss types
- [ ] Complete game successfully

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GameController } from '@/controllers';
import { GameState } from '@/models/game';
import { MultJoker, ChipJoker, EconomicJoker } from '@/models/special-cards/jokers';
import { Planet } from '@/models/special-cards/planets';
import { TargetedTarot, InstantTarot, TarotEffect } from '@/models/special-cards/tarots';
import { HandType } from '@/models/poker';
import { BossType } from '@/models/blinds';

describe('Game Flow Integration Tests', () => {
  let controller: GameController;
  let onStateChange: jest.Mock;
  let onShopOpen: jest.Mock;
  let onShopClose: jest.Mock;
  let onVictory: jest.Mock;
  let onDefeat: jest.Mock;

  beforeEach(() => {
    onStateChange = jest.fn();
    onShopOpen = jest.fn();
    onShopClose = jest.fn();
    onVictory = jest.fn();
    onDefeat = jest.fn();

    controller = new GameController({
      onStateChange,
      onShopOpen,
      onShopClose,
      onVictory,
      onDefeat
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Game Flow', () => {
    it('should complete full level cycle', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Play hands until level complete
      gameState['accumulatedScore'] = 300; // Force completion
      const hand = gameState.getCurrentHand();
      controller.selectCard(hand[0].id);
      controller.playSelectedHand();
      
      // ASSERT - Shop should open
      expect(controller.isInShop()).toBe(true);
      expect(onShopOpen).toHaveBeenCalled();
      
      // ACT - Exit shop
      controller.exitShop();
      
      // ASSERT - Next level started
      expect(controller.isInShop()).toBe(false);
      expect(gameState.getLevelNumber()).toBe(2);
      expect(gameState.getCurrentHand()).toHaveLength(8);
    });

    it('should progress through first 3 levels correctly', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT & ASSERT - Level 1 (Small Blind)
      expect(gameState.getLevelNumber()).toBe(1);
      expect(gameState.getCurrentBlind().getName()).toBe('Small Blind');
      expect(gameState.getCurrentBlind().getScoreGoal()).toBe(300);
      
      // Complete level 1
      gameState['accumulatedScore'] = 300;
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      controller.exitShop();
      
      // ACT & ASSERT - Level 2 (Big Blind)
      expect(gameState.getLevelNumber()).toBe(2);
      expect(gameState.getCurrentBlind().getName()).toBe('Big Blind');
      expect(gameState.getCurrentBlind().getScoreGoal()).toBe(450);
      
      // Complete level 2
      gameState['accumulatedScore'] = 450;
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      controller.exitShop();
      
      // ACT & ASSERT - Level 3 (Boss Blind)
      expect(gameState.getLevelNumber()).toBe(3);
      expect(gameState.getCurrentBlind().getName()).toContain('The'); // Boss name
      expect(gameState.getCurrentBlind().getScoreGoal()).toBeGreaterThanOrEqual(600);
    });

    it('should award money correctly', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      const initialMoney = gameState.getMoney();
      
      // ACT - Complete level 1
      gameState['accumulatedScore'] = 300;
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      
      // ASSERT - Small blind reward = $2
      expect(gameState.getMoney()).toBe(initialMoney + 2);
    });
  });

  describe('Victory Path', () => {
    it('should trigger victory after completing level 24', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Force to level 24 and complete it
      gameState['levelNumber'] = 24;
      gameState['accumulatedScore'] = gameState.getCurrentBlind().getScoreGoal();
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      
      // Exit shop (triggers victory check)
      controller.exitShop();
      
      // ASSERT
      expect(onVictory).toHaveBeenCalled();
      expect(controller.isGameActive()).toBe(false);
    });

    it('should complete simplified 24-level progression', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Simulate completing 24 levels
      for (let level = 1; level <= 24; level++) {
        gameState['accumulatedScore'] = gameState.getCurrentBlind().getScoreGoal();
        controller.selectCard(gameState.getCurrentHand()[0].id);
        controller.playSelectedHand();
        
        if (level < 24) {
          controller.exitShop();
        } else {
          // Level 24 completion
          controller.exitShop();
        }
      }
      
      // ASSERT
      expect(onVictory).toHaveBeenCalled();
    });
  });

  describe('Defeat Path', () => {
    it('should trigger defeat when hands exhausted', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Play 3 hands with minimal score
      for (let i = 0; i < 3; i++) {
        const hand = gameState.getCurrentHand();
        controller.selectCard(hand[0].id);
        controller.playSelectedHand();
        
        if (i < 2) {
          gameState.dealHand();
        }
      }
      
      // ASSERT - If score < 300, should be defeated
      if (gameState.getAccumulatedScore() < 300) {
        expect(onDefeat).toHaveBeenCalled();
        expect(controller.isGameActive()).toBe(false);
      }
    });

    it('should allow defeat on level 1', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Force defeat scenario
      gameState['handsRemaining'] = 0;
      gameState['accumulatedScore'] = 100; // Less than 300
      
      // Manually trigger defeat check
      if (gameState.isGameOver()) {
        controller['triggerDefeat']();
      }
      
      // ASSERT
      expect(gameState.isGameOver()).toBe(true);
    });
  });

  describe('Joker Integration', () => {
    it('should persist joker across levels', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Add joker
      const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
      gameState.addJoker(joker);
      
      // Complete level
      gameState['accumulatedScore'] = 300;
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      controller.exitShop();
      
      // ASSERT - Joker still present
      expect(gameState.getJokers()).toHaveLength(1);
      expect(gameState.getJokers()[0]).toBe(joker);
    });

    it('should apply joker bonus to score', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Add mult joker (+4 mult)
      const joker = new MultJoker('joker', 'Joker', '+4 mult', 4);
      gameState.addJoker(joker);
      
      // ACT - Play hand
      const hand = gameState.getCurrentHand();
      controller.selectCard(hand[0].id);
      const result = controller.playSelectedHand();
      
      // ASSERT - Score should be higher with joker
      // Without joker: single card = (5 chips + card) × 1 mult
      // With joker: single card = (5 chips + card) × (1 + 4) mult
      expect(result.totalScore).toBeGreaterThan(15);
    });

    it('should stack multiple jokers correctly', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Add 3 mult jokers
      gameState.addJoker(new MultJoker('j1', 'J1', '+4', 4));
      gameState.addJoker(new MultJoker('j2', 'J2', '+4', 4));
      gameState.addJoker(new MultJoker('j3', 'J3', '+4', 4));
      
      // ACT - Play hand
      controller.selectCard(gameState.getCurrentHand()[0].id);
      const result = controller.playSelectedHand();
      
      // ASSERT - All jokers should contribute
      // Base mult = 1, with 3 jokers = 1 + 4 + 4 + 4 = 13
      expect(result.mult).toBeGreaterThanOrEqual(13);
    });

    it('should award Golden Joker bonus on level completion', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Add Golden Joker
      const goldenJoker = new EconomicJoker('golden', 'Golden', 'Economic', () => 2);
      gameState.addJoker(goldenJoker);
      
      const moneyBefore = gameState.getMoney();
      
      // ACT - Complete level
      gameState['accumulatedScore'] = 300;
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      
      // ASSERT - Should get blind reward ($2) + Golden Joker bonus ($2)
      expect(gameState.getMoney()).toBe(moneyBefore + 2 + 2);
    });
  });

  describe('Planet Integration', () => {
    it('should apply planet upgrade to hand type', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Apply Pluto (High Card upgrade: +10 chips, +1 mult)
      const pluto = new Planet('pluto', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
      gameState.applyPlanetCard(pluto);
      
      // ACT - Play single card (High Card)
      controller.selectCard(gameState.getCurrentHand()[0].id);
      const result = controller.playSelectedHand();
      
      // ASSERT - Score should reflect upgrade
      // Base High Card: 5 chips, 1 mult
      // After Pluto: 15 chips, 2 mult
      // With a King (10 chips): (15 + 10) × 2 = 50
      expect(result.totalScore).toBeGreaterThan(20);
    });

    it('should accumulate multiple planet purchases', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Apply Pluto twice
      const pluto1 = new Planet('p1', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
      const pluto2 = new Planet('p2', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
      gameState.applyPlanetCard(pluto1);
      gameState.applyPlanetCard(pluto2);
      
      // ACT - Play single card
      controller.selectCard(gameState.getCurrentHand()[0].id);
      const result = controller.playSelectedHand();
      
      // ASSERT - Both upgrades applied
      // Base: 5 chips, 1 mult
      // After 2 Pluto: 25 chips, 3 mult
      expect(result.chips).toBeGreaterThanOrEqual(25);
      expect(result.mult).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Tarot Integration', () => {
    it('should modify card with targeted tarot', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      const empress = new TargetedTarot(
        'empress',
        'Empress',
        'Add mult',
        TarotEffect.ADD_MULT,
        (card) => card.addPermanentBonus(0, 4)
      );
      gameState.addConsumable(empress);
      
      const hand = gameState.getCurrentHand();
      const targetCard = hand[0];
      
      // ACT - Use tarot on card
      controller.useConsumable(0, targetCard.id);
      
      // ASSERT - Card modified
      expect(targetCard.multBonus).toBe(4);
      expect(gameState.getConsumables()).toHaveLength(0); // Consumed
    });

    it('should double money with The Hermit', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      const hermit = new InstantTarot(
        'hermit',
        'Hermit',
        'Double money',
        TarotEffect.ADD_CHIPS,
        (state: any) => {
          state.money = state.money * 2;
        }
      );
      gameState.addConsumable(hermit);
      
      const moneyBefore = gameState.getMoney();
      
      // ACT - Use The Hermit
      controller.useConsumable(0);
      
      // ASSERT
      expect(gameState.getMoney()).toBe(moneyBefore * 2);
      expect(gameState.getConsumables()).toHaveLength(0);
    });
  });

  describe('Boss Blind Integration', () => {
    it('should apply The Water modifier (0 discards)', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Force to level 3 with The Water boss
      gameState['levelNumber'] = 3;
      const waterBlind = gameState['blindGenerator'].generateBlindForLevel(3);
      
      if (waterBlind.getName() === 'The Water') {
        gameState['currentBlind'] = waterBlind;
        gameState['applyBlindModifiers']();
        
        // ACT & ASSERT - Should have 0 discards
        expect(gameState.getDiscardsRemaining()).toBe(0);
        
        // Attempt discard should fail
        controller.selectCard(gameState.getCurrentHand()[0].id);
        expect(() => controller.discardSelected()).toThrow();
      }
    });

    it('should apply The Needle modifier (1 hand)', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      gameState['levelNumber'] = 3;
      const needleBlind = gameState['blindGenerator'].generateBlindForLevel(3);
      
      if (needleBlind.getName() === 'The Needle') {
        gameState['currentBlind'] = needleBlind;
        gameState['applyBlindModifiers']();
        
        // ACT & ASSERT
        expect(gameState.getHandsRemaining()).toBe(1);
        
        // Goal should be reduced (×0.5)
        const goal = gameState.getCurrentBlind().getScoreGoal();
        const normalBossGoal = 300 * 2; // Level 1 boss base
        expect(goal).toBeLessThan(normalBossGoal);
      }
    });

    it('should apply The Wall modifier (4× goal)', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      gameState['levelNumber'] = 3;
      const wallBlind = gameState['blindGenerator'].generateBlindForLevel(3);
      
      if (wallBlind.getName() === 'The Wall') {
        // ACT & ASSERT
        const goal = wallBlind.getScoreGoal();
        const normalBossGoal = 300 * 2; // 600
        const wallGoal = 300 * 2 * 4; // 2400
        
        expect(goal).toBe(wallGoal);
      }
    });
  });

  describe('Save/Load Integration', () => {
    it('should save and restore game state', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Play to level 2
      gameState['accumulatedScore'] = 300;
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      controller.exitShop();
      
      const levelBefore = gameState.getLevelNumber();
      const moneyBefore = gameState.getMoney();
      
      // ACT - Save is auto-saved, create new controller and load
      const newController = new GameController();
      const loaded = newController.continueGame();
      
      // ASSERT
      expect(loaded).toBe(true);
      const loadedState = newController.getGameState()!;
      expect(loadedState.getLevelNumber()).toBe(levelBefore);
      expect(loadedState.getMoney()).toBe(moneyBefore);
    });

    it('should restore inventory after load', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Add items
      const joker = new MultJoker('j', 'J', '+4', 4);
      gameState.addJoker(joker);
      
      // Save happens automatically
      
      // ACT - Load
      const newController = new GameController();
      newController.continueGame();
      const loadedState = newController.getGameState()!;
      
      // ASSERT
      expect(loadedState.getJokers()).toHaveLength(1);
    });
  });

  describe('Shop Mechanics Integration', () => {
    it('should reroll shop items', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Complete level to open shop
      gameState['accumulatedScore'] = 300;
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      
      const shop = controller.getShop()!;
      const itemsBefore = shop.getAvailableItems().map(i => i.getId());
      
      // ACT - Reroll
      gameState.addMoney(10); // Ensure enough money
      controller.rerollShop();
      
      // ASSERT
      const itemsAfter = shop.getAvailableItems().map(i => i.getId());
      expect(itemsAfter).not.toEqual(itemsBefore);
    });

    it('should fail purchase with insufficient funds', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      gameState['accumulatedScore'] = 300;
      controller.selectCard(gameState.getCurrentHand()[0].id);
      controller.playSelectedHand();
      
      const shop = controller.getShop()!;
      const items = shop.getAvailableItems();
      
      // Spend all money
      gameState.spendMoney(gameState.getMoney());
      
      // ACT
      const result = controller.purchaseShopItem(items[0].getId());
      
      // ASSERT
      expect(result).toBe(false);
      expect(gameState.getMoney()).toBe(0);
    });
  });

  describe('Score Progression', () => {
    it('should have achievable level 1 goal', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Play pair (common hand)
      const hand = gameState.getCurrentHand();
      const pair = hand.filter(c => c.value === hand[0].value).slice(0, 2);
      
      if (pair.length === 2) {
        controller.selectCard(pair[0].id);
        controller.selectCard(pair[1].id);
        const result = controller.playSelectedHand();
        
        // ASSERT - Pair should give reasonable score toward 300 goal
        expect(result.totalScore).toBeGreaterThan(20);
      }
    });

    it('should require jokers for late game', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Force to level 10
      gameState['levelNumber'] = 10;
      gameState['currentBlind'] = gameState['blindGenerator'].generateBlindForLevel(10);
      
      // ACT - Get goal
      const goal = gameState.getCurrentBlind().getScoreGoal();
      
      // ASSERT - Goal should be very high (~38,000)
      expect(goal).toBeGreaterThan(30000);
      
      // Without jokers, single hand unlikely to achieve this
    });
  });

  describe('Multi-System Integration', () => {
    it('should combine joker + planet + tarot bonuses', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // Add mult joker
      const joker = new MultJoker('j', 'J', '+4', 4);
      gameState.addJoker(joker);
      
      // Apply planet upgrade
      const pluto = new Planet('p', 'Pluto', 'Upgrade', HandType.HIGH_CARD, 10, 1);
      gameState.applyPlanetCard(pluto);
      
      // Enhance card with tarot
      const empress = new TargetedTarot(
        'empress',
        'Empress',
        'Add mult',
        TarotEffect.ADD_MULT,
        (card) => card.addPermanentBonus(0, 4)
      );
      const hand = gameState.getCurrentHand();
      empress.use(hand[0]);
      
      // ACT - Play single card
      controller.selectCard(hand[0].id);
      const result = controller.playSelectedHand();
      
      // ASSERT - All bonuses should stack
      // Base High Card after planet: 15 chips, 2 mult
      // Card with tarot: +4 mult on card
      // Joker: +4 mult
      // Total mult: 2 + 4 + 4 = 10
      expect(result.mult).toBeGreaterThanOrEqual(10);
      expect(result.totalScore).toBeGreaterThan(100);
    });

    it('should complete full game with all systems', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Simplified 5-level progression with purchases
      for (let level = 1; level <= 5; level++) {
        // Play hand to complete level
        gameState['accumulatedScore'] = gameState.getCurrentBlind().getScoreGoal();
        controller.selectCard(gameState.getCurrentHand()[0].id);
        controller.playSelectedHand();
        
        // In shop, potentially buy items
        if (level < 5) {
          controller.exitShop();
        }
      }
      
      // ASSERT - Should be at level 6
      expect(gameState.getLevelNumber()).toBe(6);
      
      // Should have accumulated money
      expect(gameState.getMoney()).toBeGreaterThan(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid level completions', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Complete 3 levels rapidly
      for (let i = 0; i < 3; i++) {
        gameState['accumulatedScore'] = gameState.getCurrentBlind().getScoreGoal();
        controller.selectCard(gameState.getCurrentHand()[0].id);
        controller.playSelectedHand();
        controller.exitShop();
      }
      
      // ASSERT - Should be stable at level 4
      expect(gameState.getLevelNumber()).toBe(4);
      expect(controller.isGameActive()).toBe(true);
    });

    it('should handle complex inventory', () => {
      // ARRANGE
      controller.startNewGame();
      const gameState = controller.getGameState()!;
      
      // ACT - Add 5 jokers and 2 tarots
      for (let i = 0; i < 5; i++) {
        gameState.addJoker(new MultJoker(`j${i}`, `J${i}`, '+4', 4));
      }
      
      const empress = new TargetedTarot('e', 'E', 'Desc', TarotEffect.ADD_MULT, () => {});
      const emperor = new TargetedTarot('em', 'Em', 'Desc', TarotEffect.ADD_CHIPS, () => {});
      gameState.addConsumable(empress);
      gameState.addConsumable(emperor);
      
      // ASSERT
      expect(gameState.getJokers()).toHaveLength(5);
      expect(gameState.getConsumables()).toHaveLength(2);
      
      // Play hand with all bonuses
      controller.selectCard(gameState.getCurrentHand()[0].id);
      const result = controller.playSelectedHand();
      
      // All 5 jokers should contribute
      expect(result.mult).toBeGreaterThanOrEqual(21); // 1 base + 5×4
    });
  });
});
```

# DELIVERABLES

## 1. Complete Integration Test Suite
- Full integration tests for complete game flows
- All major systems tested together
- Victory and defeat paths verified
- Joker, Planet, Tarot integration
- Boss blinds tested
- Save/load verified
- Realistic scenarios covered

## 2. Coverage Matrix

| Component | Test Scenario | Integration Points | Tests |
|-----------|---------------|-------------------|-------|
| Basic Flow | Level completion | Controller + GameState + Blinds | 3 |
| Victory | 24-level completion | All systems | 2 |
| Defeat | Hand exhaustion | GameState + Controller | 2 |
| Jokers | Purchase & effect | Shop + GameState + Scoring | 5 |
| Planets | Upgrade & effect | Shop + GameState + Scoring | 2 |
| Tarots | Modify & effect | Shop + GameState + Cards | 2 |
| Boss Blinds | Modifiers | Blinds + GameState | 3 |
| Save/Load | Persistence | Persistence + GameState | 2 |
| Shop | Mechanics | Shop + GameState | 2 |
| Score Progression | Balance | All systems | 2 |
| Multi-System | Combined bonuses | All special cards + Scoring | 2 |
| Edge Cases | Complex scenarios | All systems | 2 |
| **TOTAL** | | | **29** |

## 3. Expected Coverage
- Integration coverage: **Major game flows** covered
- System interaction: **All critical paths** tested
- Realistic scenarios: **5+ player strategies** verified
- Edge cases: **Complex states** handled

## 4. Execution Instructions
```bash
# Run integration tests
npm test -- tests/integration/game-flow.test.ts

# Run with coverage
npm test -- --coverage tests/integration/game-flow.test.ts

# Run in watch mode
npm test -- --watch tests/integration/game-flow.test.ts

# Run specific scenarios
npm test -- -t "Victory Path" tests/integration/game-flow.test.ts
npm test -- -t "Joker Integration" tests/integration/game-flow.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Integration focus:** Test system interactions, not individual units
- **Realistic scenarios:** Simulate actual player gameplay
- **State management:** Verify state transitions are clean
- **Async operations:** Save/load are synchronous but may change
- **Randomness:** Boss types random, handle all possibilities
- **Performance:** Some tests may be slow (24 levels), set timeout
- **Mock minimization:** Use real implementations where possible
- **Callback verification:** Ensure all callbacks triggered correctly

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to force complete a level
function forceCompleteLevel(controller: GameController): void {
  const gameState = controller.getGameState()!;
  gameState['accumulatedScore'] = gameState.getCurrentBlind().getScoreGoal();
  controller.selectCard(gameState.getCurrentHand()[0].id);
  controller.playSelectedHand();
}

// Helper to add full joker collection
function addFullJokerSet(gameState: GameState): void {
  gameState.addJoker(new MultJoker('j1', 'Joker 1', '+4', 4));
  gameState.addJoker(new MultJoker('j2', 'Joker 2', '+4', 4));
  gameState.addJoker(new MultJoker('j3', 'Joker 3', '+4', 4));
  gameState.addJoker(new MultJoker('j4', 'Joker 4', '+4', 4));
  gameState.addJoker(new MultJoker('j5', 'Joker 5', '+4', 4));
}

// Helper to simulate N levels
function simulateLevels(controller: GameController, count: number): void {
  for (let i = 0; i < count; i++) {
    forceCompleteLevel(controller);
    if (controller.isInShop()) {
      controller.exitShop();
    }
  }
}

// Helper to find specific card in hand
function findCardInHand(hand: Card[], value: CardValue): Card | undefined {
  return hand.find(c => c.value === value);
}
```
