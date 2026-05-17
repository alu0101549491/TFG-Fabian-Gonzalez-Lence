# TESTING CONTEXT
Project: Mini Balatro
Components under test: Constants (application-wide constant values)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/utils/constants.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/utils/constants.ts
 * @desc Game constants and configuration values. All magic numbers and strings are centralized here for easy balancing.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Game configuration constants.
 * Contains core gameplay parameters like money, joker limits, hand sizes, and round progression.
 */
export const GAME_CONFIG = {
  INITIAL_MONEY: 5,
  MAX_JOKERS: 5,
  MAX_CONSUMABLES: 2,
  HAND_SIZE: 8,
  MAX_CARDS_TO_PLAY: 5,  // Maximum cards that can be played in one hand
  MAX_HANDS_PER_BLIND: 3,
  MAX_DISCARDS_PER_BLIND: 3,
  VICTORY_ROUNDS: 8,
  LEVELS_PER_ROUND: 3,  // Number of blinds (small, big, boss) per round
};

/**
 * Shop configuration constants.
 */
export const SHOP_CONFIG = {
  JOKER_COST: 5,
  PLANET_COST: 3,
  TAROT_COST: 3,
  REROLL_COST: 3,
  ITEMS_PER_SHOP: 4,
  // Distribution weights (sum should be 1.0)
  JOKER_WEIGHT: 0.4,
  PLANET_WEIGHT: 0.3,
  TAROT_WEIGHT: 0.3,
};

/**
 * Tarot card effect constants.
 */
export const TAROT_CONFIG = {
  HERMIT_MAX_MONEY_BONUS: 20,  // Maximum money The Hermit can give
};

/**
 * Blind reward constants.
 */
export const BLIND_REWARDS = {
  SMALL_BLIND: 2,
  BIG_BLIND: 5,
  BOSS_BLIND: 10,
};

/**
 * Color palette constants.
 * 
 * IMPORTANT: These colors are the single source of truth for the application.
 * They are automatically applied to CSS custom properties via apply-theme.ts.
 * 
 * To change colors across the entire application:
 * 1. Modify the values in this COLORS object
 * 2. Refresh the page - changes will be applied automatically
 * 
 * No need to edit CSS files directly!
 */
export const COLORS = {
  // Theme Colors - Main backgrounds and UI elements
  BG_PRIMARY: '#1a1a2e',      // Main app background (dark navy)
  BG_PANEL: '#16213e',        // Panel/card container background (darker navy)
  BORDER: '#0f3460',          // Border color for panels and cards (blue-navy)
  ACCENT: '#e94560',          // Primary accent color (red-pink)

  // Text Colors - For readable text on dark backgrounds
  TEXT_PRIMARY: '#f1f1f1',    // Primary text color (light gray)
  TEXT_SECONDARY: '#a8a8a8',  // Secondary/muted text color (medium gray)
  TEXT_TERTIARY: '#4f4f4f', // Tertiary/more muted text color (dark gray)

  // Suit Colors - For card suits (diamonds, hearts, spades, clubs)
  SUIT_DIAMONDS: '#e89230',   // Orange for diamonds ♦
  SUIT_HEARTS: '#d62d46',     // Red for hearts ♥
  SUIT_SPADES: '#061413',     // Black for spades ♠
  SUIT_CLUBS: '#3cc264',      // Green for clubs ♣

  // Indicator Colors - For chips, mult, money displays
  CHIPS: '#f9ca24',           // Yellow/gold for chip count
  MULT: '#6c5ce7',            // Purple for multiplier
  MONEY: '#00d2d3',           // Cyan for money/currency
  SUCCESS: '#2ecc71',         // Green for success states
  WARNING: '#95a5a6',         // Gray for warning states
  ERROR: '#e74c3c',           // Red for error states

  // Victory Modal Colors - Green theme for blind completion
  VICTORY_BG_START: '#1a472a',    // Dark green gradient start
  VICTORY_BG_END: '#2d5a3d',      // Dark green gradient end
  VICTORY_BORDER: '#4ade80',      // Bright green border/glow
  VICTORY_TEXT: '#86efac',        // Light green text
  VICTORY_TITLE: '#4ade80',       // Bright green title
  VICTORY_BTN_START: '#22c55e',   // Green button gradient start
  VICTORY_BTN_END: '#16a34a',     // Green button gradient end
  VICTORY_BTN_HOVER_START: '#16a34a',  // Green button hover start
  VICTORY_BTN_HOVER_END: '#15803d',    // Green button hover end

  // Defeat Modal Colors - Red theme for blind failure
  DEFEAT_BG_START: '#4a1a1a',     // Dark red gradient start
  DEFEAT_BG_END: '#5a2d2d',       // Dark red gradient end
  DEFEAT_BORDER: '#ef4444',       // Bright red border/glow
  DEFEAT_TEXT: '#fca5a5',         // Light red text
  DEFEAT_TITLE: '#ef4444',        // Bright red title
  DEFEAT_BTN_START: '#dc2626',    // Red button gradient start
  DEFEAT_BTN_END: '#b91c1c',      // Red button gradient end
  DEFEAT_BTN_HOVER_START: '#b91c1c',   // Red button hover start
  DEFEAT_BTN_HOVER_END: '#991b1b',     // Red button hover end
};

/**
 * Suit symbols constants.
 */
export const SUIT_SYMBOLS = {
  DIAMONDS: '♦',
  HEARTS: '♥',
  SPADES: '♠',
  CLUBS: '♣',
};

/**
 * Card value display constants.
 */
export const CARD_VALUE_DISPLAY = {
  ACE: 'A',
  KING: 'K',
  QUEEN: 'Q',
  JACK: 'J',
  TEN: '10',
  NINE: '9',
  EIGHT: '8',
  SEVEN: '7',
  SIX: '6',
  FIVE: '5',
  FOUR: '4',
  THREE: '3',
  TWO: '2',
};

/**
 * Base card values (chips).
 */
export const BASE_CARD_VALUES = {
  ACE: 11,
  KING: 10,
  QUEEN: 10,
  JACK: 10,
  TEN: 10,
  NINE: 9,
  EIGHT: 8,
  SEVEN: 7,
  SIX: 6,
  FIVE: 5,
  FOUR: 4,
  THREE: 3,
  TWO: 2,
};

/**
 * Base hand values (chips and mult).
 */
export const BASE_HAND_VALUES = {
  HIGH_CARD: { chips: 5, mult: 1 },
  PAIR: { chips: 10, mult: 2 },
  TWO_PAIR: { chips: 20, mult: 2 },
  THREE_OF_A_KIND: { chips: 30, mult: 3 },
  STRAIGHT: { chips: 30, mult: 4 },
  FLUSH: { chips: 35, mult: 4 },
  FULL_HOUSE: { chips: 40, mult: 4 },
  FOUR_OF_A_KIND: { chips: 60, mult: 7 },
  STRAIGHT_FLUSH: { chips: 100, mult: 8 },
};

/**
 * Planet upgrades constants.
 */
export const PLANET_UPGRADES = {
  PLUTO: { handType: 'HIGH_CARD', chips: 10, mult: 1 },
  MERCURY: { handType: 'PAIR', chips: 15, mult: 1 },
  URANUS: { handType: 'TWO_PAIR', chips: 20, mult: 1 },
  VENUS: { handType: 'THREE_OF_A_KIND', chips: 20, mult: 2 },
  SATURN: { handType: 'STRAIGHT', chips: 30, mult: 3 },
  JUPITER: { handType: 'FLUSH', chips: 15, mult: 2 },
  EARTH: { handType: 'FULL_HOUSE', chips: 25, mult: 2 },
  MARS: { handType: 'FOUR_OF_A_KIND', chips: 30, mult: 3 },
  NEPTUNE: { handType: 'STRAIGHT_FLUSH', chips: 40, mult: 4 },
};

/**
 * Difficulty progression constants.
 * Base values match Balatro's difficulty curve.
 * Formula: BASE_GOAL × (GROWTH_RATE)^(round-1)
 * Small blind uses base value directly.
 * Big blind = base × 1.5
 * Boss blind = base × 2.0
 */
export const DIFFICULTY_CONFIG = {
  // Base difficulty settings for formula-based calculation
  BASE_GOAL: 300,
  GROWTH_RATE: 1.5,
  // Balatro base values for each round (small blind values)
  ROUND_BASE_VALUES: [
    300,    // Round 1
    800,    // Round 2
    2000,   // Round 3
    5000,   // Round 4
    11000,  // Round 5
    20000,  // Round 6
    35000,  // Round 7
    50000,  // Round 8
  ],
  SMALL_BLIND_MULTIPLIER: 1.0,
  BIG_BLIND_MULTIPLIER: 1.5,
  BOSS_BLIND_MULTIPLIER: 2.0,
};

/**
 * Animation timing constants.
 */
export const ANIMATION_TIMING = {
  CARD_DEAL_DELAY: 50, // ms between cards
  CARD_TRANSITION: 200, // ms for card animations
  SCORE_INCREMENT: 400, // ms for score counting
  SHOP_TRANSITION: 300, // ms for shop opening
};

/**
 * Storage keys.
 */
export const STORAGE_KEYS = {
  GAME_SAVE: 'miniBalatro_save',
  SETTINGS: 'miniBalatro_settings',
  STATISTICS: 'miniBalatro_stats',
};

/**
 * UI configuration constants.
 */
export const UI_CONFIG = {
  MIN_SCREEN_WIDTH: 1024,
  MIN_SCREEN_HEIGHT: 768,
  CARD_WIDTH: 100,
  CARD_HEIGHT: 140,
  CARD_BORDER_RADIUS: 8,
};

// Re-export helper functions from helpers.ts for backward compatibility
export {
  calculateBlindGoal,
  getSuitColor,
  getSuitSymbol,
  formatMoney,
  formatScore
} from './helpers';
```

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

## Constants Module Requirements:

### Purpose:
- Application-wide constant values
- UI-related constants (not game logic)
- String literals, animations, styling values
- Distinct from GameConfig (which is game balance/logic)

### Constant Categories:

#### 1. Application Metadata:
```typescript
APP_NAME: string = "Mini Balatro";
APP_VERSION: string = "1.0.0";
APP_DESCRIPTION: string = "A web-based poker roguelike inspired by Balatro";
```

#### 2. UI Animation Durations (milliseconds):
```typescript
CARD_FLIP_DURATION: number = 300;
CARD_DEAL_DURATION: number = 500;
CARD_PLAY_DURATION: number = 600;
SCORE_COUNT_DURATION: number = 1000;
SHOP_TRANSITION_DURATION: number = 400;
LEVEL_TRANSITION_DURATION: number = 800;
```

#### 3. UI Delays (milliseconds):
```typescript
CARD_DEAL_DELAY_PER_CARD: number = 100;
SCORE_DISPLAY_DELAY: number = 500;
VICTORY_CELEBRATION_DELAY: number = 2000;
DEFEAT_DISPLAY_DELAY: number = 1500;
```

#### 4. Card Display Constants:
```typescript
CARD_WIDTH: number = 80;  // pixels
CARD_HEIGHT: number = 120; // pixels
CARD_ASPECT_RATIO: number = 1.5; // height/width
CARD_BORDER_RADIUS: number = 8; // pixels
SELECTED_CARD_OFFSET_Y: number = -20; // pixels (moves up when selected)
```

#### 5. Color Palette (Hex Strings):
```typescript
COLOR_PRIMARY: string = "#1a1a2e";
COLOR_SECONDARY: string = "#16213e";
COLOR_ACCENT: string = "#e94560";
COLOR_SUCCESS: string = "#4ecca3";
COLOR_WARNING: string = "#f4a261";
COLOR_DANGER: string = "#e63946";
COLOR_TEXT_LIGHT: string = "#eee";
COLOR_TEXT_DARK: string = "#333";

// Suit colors
COLOR_DIAMONDS: string = "#e63946"; // Red
COLOR_HEARTS: string = "#e63946";   // Red
COLOR_SPADES: string = "#1a1a2e";   // Black
COLOR_CLUBS: string = "#1a1a2e";    // Black
```

#### 6. Z-Index Layers:
```typescript
Z_INDEX_BACKGROUND: number = 0;
Z_INDEX_GAME_BOARD: number = 10;
Z_INDEX_CARDS: number = 20;
Z_INDEX_SELECTED_CARDS: number = 30;
Z_INDEX_UI_OVERLAY: number = 40;
Z_INDEX_MODAL: number = 50;
Z_INDEX_TOAST: number = 60;
```

#### 7. Breakpoints (responsive design):
```typescript
BREAKPOINT_MOBILE: number = 768;  // pixels
BREAKPOINT_TABLET: number = 1024; // pixels
BREAKPOINT_DESKTOP: number = 1440; // pixels
```

#### 8. Local Storage Keys:
```typescript
STORAGE_KEY_GAME_SAVE: string = "mini-balatro-save";
STORAGE_KEY_SETTINGS: string = "mini-balatro-settings";
STORAGE_KEY_HIGH_SCORES: string = "mini-balatro-high-scores";
```

#### 9. URL/Routes (if SPA):
```typescript
ROUTE_HOME: string = "/";
ROUTE_GAME: string = "/game";
ROUTE_SETTINGS: string = "/settings";
ROUTE_ABOUT: string = "/about";
```

#### 10. Error Messages:
```typescript
ERROR_SAVE_FAILED: string = "Failed to save game. Please try again.";
ERROR_LOAD_FAILED: string = "Failed to load game. Starting new game.";
ERROR_INVALID_ACTION: string = "Invalid action. Please try again.";
ERROR_NETWORK: string = "Network error. Please check your connection.";
```

#### 11. Success Messages:
```typescript
SUCCESS_GAME_SAVED: string = "Game saved successfully!";
SUCCESS_PURCHASE: string = "Purchase successful!";
SUCCESS_LEVEL_COMPLETE: string = "Level complete!";
```

#### 12. UI Labels:
```typescript
LABEL_PLAY_HAND: string = "Play Hand";
LABEL_DISCARD: string = "Discard";
LABEL_REROLL: string = "Reroll";
LABEL_EXIT_SHOP: string = "Continue";
LABEL_NEW_GAME: string = "New Game";
LABEL_CONTINUE: string = "Continue";
LABEL_SETTINGS: string = "Settings";
```

### Implementation Approach:

**Constant Object Export:**
```typescript
export const Constants = {
  // Application
  APP_NAME: "Mini Balatro",
  APP_VERSION: "1.0.0",
  
  // Animations
  CARD_FLIP_DURATION: 300,
  CARD_DEAL_DURATION: 500,
  
  // Colors
  COLOR_PRIMARY: "#1a1a2e",
  COLOR_ACCENT: "#e94560",
  
  // ... etc
} as const;
```

### Validation Requirements:
- All durations > 0
- All pixel values > 0
- All hex colors valid format (#RRGGBB)
- All storage keys non-empty strings
- All routes start with "/"
- Z-index values ascending order
- Breakpoints ascending order

### Edge Cases:
- Color validation (6-char hex)
- Route validation (starts with /)
- Numeric value ranges (positive)
- String non-empty validation
- Aspect ratio calculation (height/width)
- Z-index ordering (no overlaps at same priority)

# TASK

Generate a complete unit test suite for Constants that covers:

## 1. Application Metadata Tests

- [ ] APP_NAME = "Mini Balatro"
- [ ] APP_VERSION = "1.0.0"
- [ ] APP_DESCRIPTION is non-empty string
- [ ] All metadata values are strings

## 2. Animation Duration Tests

- [ ] CARD_FLIP_DURATION = 300
- [ ] CARD_DEAL_DURATION = 500
- [ ] CARD_PLAY_DURATION = 600
- [ ] SCORE_COUNT_DURATION = 1000
- [ ] SHOP_TRANSITION_DURATION = 400
- [ ] LEVEL_TRANSITION_DURATION = 800
- [ ] All durations are positive numbers
- [ ] All durations are reasonable (< 5000ms)

## 3. UI Delay Tests

- [ ] CARD_DEAL_DELAY_PER_CARD = 100
- [ ] SCORE_DISPLAY_DELAY = 500
- [ ] VICTORY_CELEBRATION_DELAY = 2000
- [ ] DEFEAT_DISPLAY_DELAY = 1500
- [ ] All delays are positive numbers

## 4. Card Display Tests

- [ ] CARD_WIDTH = 80
- [ ] CARD_HEIGHT = 120
- [ ] CARD_ASPECT_RATIO = 1.5
- [ ] CARD_BORDER_RADIUS = 8
- [ ] SELECTED_CARD_OFFSET_Y = -20
- [ ] CARD_ASPECT_RATIO matches HEIGHT/WIDTH
- [ ] All pixel values are numbers

## 5. Color Palette Tests

### Primary Colors:
- [ ] COLOR_PRIMARY is valid hex
- [ ] COLOR_SECONDARY is valid hex
- [ ] COLOR_ACCENT is valid hex
- [ ] COLOR_SUCCESS is valid hex
- [ ] COLOR_WARNING is valid hex
- [ ] COLOR_DANGER is valid hex
- [ ] COLOR_TEXT_LIGHT is valid hex
- [ ] COLOR_TEXT_DARK is valid hex

### Suit Colors:
- [ ] COLOR_DIAMONDS is valid hex
- [ ] COLOR_HEARTS is valid hex
- [ ] COLOR_SPADES is valid hex
- [ ] COLOR_CLUBS is valid hex
- [ ] Diamonds and Hearts are same (red)
- [ ] Spades and Clubs are same (black)

### Color Format Validation:
- [ ] All colors start with #
- [ ] All colors are 7 characters (#RRGGBB)
- [ ] All colors contain valid hex characters

## 6. Z-Index Layer Tests

- [ ] Z_INDEX_BACKGROUND = 0
- [ ] Z_INDEX_GAME_BOARD = 10
- [ ] Z_INDEX_CARDS = 20
- [ ] Z_INDEX_SELECTED_CARDS = 30
- [ ] Z_INDEX_UI_OVERLAY = 40
- [ ] Z_INDEX_MODAL = 50
- [ ] Z_INDEX_TOAST = 60
- [ ] Z-indices in ascending order
- [ ] No duplicate z-index values

## 7. Breakpoint Tests

- [ ] BREAKPOINT_MOBILE = 768
- [ ] BREAKPOINT_TABLET = 1024
- [ ] BREAKPOINT_DESKTOP = 1440
- [ ] Breakpoints in ascending order
- [ ] All breakpoints are positive

## 8. Storage Key Tests

- [ ] STORAGE_KEY_GAME_SAVE is non-empty
- [ ] STORAGE_KEY_SETTINGS is non-empty
- [ ] STORAGE_KEY_HIGH_SCORES is non-empty
- [ ] All keys are unique
- [ ] All keys are strings

## 9. Route Tests (if applicable)

- [ ] ROUTE_HOME = "/"
- [ ] ROUTE_GAME starts with "/"
- [ ] ROUTE_SETTINGS starts with "/"
- [ ] ROUTE_ABOUT starts with "/"
- [ ] All routes are strings

## 10. Error Message Tests

- [ ] ERROR_SAVE_FAILED is non-empty
- [ ] ERROR_LOAD_FAILED is non-empty
- [ ] ERROR_INVALID_ACTION is non-empty
- [ ] ERROR_NETWORK is non-empty
- [ ] All error messages are strings
- [ ] Messages are user-friendly (not technical)

## 11. Success Message Tests

- [ ] SUCCESS_GAME_SAVED is non-empty
- [ ] SUCCESS_PURCHASE is non-empty
- [ ] SUCCESS_LEVEL_COMPLETE is non-empty
- [ ] All success messages are strings

## 12. UI Label Tests

- [ ] LABEL_PLAY_HAND is non-empty
- [ ] LABEL_DISCARD is non-empty
- [ ] LABEL_REROLL is non-empty
- [ ] LABEL_EXIT_SHOP is non-empty
- [ ] LABEL_NEW_GAME is non-empty
- [ ] LABEL_CONTINUE is non-empty
- [ ] LABEL_SETTINGS is non-empty
- [ ] All labels are strings

## 13. Logical Consistency Tests

- [ ] CARD_HEIGHT / CARD_WIDTH = CARD_ASPECT_RATIO
- [ ] Red suit colors match (Diamonds, Hearts)
- [ ] Black suit colors match (Spades, Clubs)
- [ ] Z-indices properly layered (no conflicts)
- [ ] Breakpoints properly ordered (mobile < tablet < desktop)
- [ ] Animation durations reasonable (not too fast/slow)

## 14. Immutability Tests

- [ ] Constants cannot be modified
- [ ] Attempting to modify throws error or fails
- [ ] Values remain consistent across imports

## 15. Type Validation Tests

- [ ] All durations are numbers
- [ ] All delays are numbers
- [ ] All pixel values are numbers
- [ ] All colors are strings
- [ ] All z-indices are numbers
- [ ] All messages are strings

## 16. Format Validation Tests

### Hex Color Validation:
- [ ] Regex pattern matches valid hex colors
- [ ] Invalid colors would fail (e.g., "#GGGGGG")

### Route Validation:
- [ ] All routes start with "/"
- [ ] Routes don't have trailing slashes (unless root)

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect } from '@jest/globals';
import { Constants } from '@/utils/constants';

describe('Constants', () => {
  describe('Application Metadata', () => {
    it('should have APP_NAME = "Mini Balatro"', () => {
      // ASSERT
      expect(Constants.APP_NAME).toBe('Mini Balatro');
    });

    it('should have APP_VERSION = "1.0.0"', () => {
      // ASSERT
      expect(Constants.APP_VERSION).toBe('1.0.0');
    });

    it('should have non-empty APP_DESCRIPTION', () => {
      // ASSERT
      expect(Constants.APP_DESCRIPTION).toBeDefined();
      expect(Constants.APP_DESCRIPTION.length).toBeGreaterThan(0);
    });

    it('should have all metadata as strings', () => {
      // ASSERT
      expect(typeof Constants.APP_NAME).toBe('string');
      expect(typeof Constants.APP_VERSION).toBe('string');
      expect(typeof Constants.APP_DESCRIPTION).toBe('string');
    });
  });

  describe('Animation Durations', () => {
    it('should have CARD_FLIP_DURATION = 300', () => {
      // ASSERT
      expect(Constants.CARD_FLIP_DURATION).toBe(300);
    });

    it('should have CARD_DEAL_DURATION = 500', () => {
      // ASSERT
      expect(Constants.CARD_DEAL_DURATION).toBe(500);
    });

    it('should have CARD_PLAY_DURATION = 600', () => {
      // ASSERT
      expect(Constants.CARD_PLAY_DURATION).toBe(600);
    });

    it('should have SCORE_COUNT_DURATION = 1000', () => {
      // ASSERT
      expect(Constants.SCORE_COUNT_DURATION).toBe(1000);
    });

    it('should have SHOP_TRANSITION_DURATION = 400', () => {
      // ASSERT
      expect(Constants.SHOP_TRANSITION_DURATION).toBe(400);
    });

    it('should have LEVEL_TRANSITION_DURATION = 800', () => {
      // ASSERT
      expect(Constants.LEVEL_TRANSITION_DURATION).toBe(800);
    });

    it('should have all durations as positive numbers', () => {
      // ASSERT
      expect(Constants.CARD_FLIP_DURATION).toBeGreaterThan(0);
      expect(Constants.CARD_DEAL_DURATION).toBeGreaterThan(0);
      expect(Constants.CARD_PLAY_DURATION).toBeGreaterThan(0);
      expect(Constants.SCORE_COUNT_DURATION).toBeGreaterThan(0);
      expect(Constants.SHOP_TRANSITION_DURATION).toBeGreaterThan(0);
      expect(Constants.LEVEL_TRANSITION_DURATION).toBeGreaterThan(0);
    });

    it('should have reasonable durations (< 5000ms)', () => {
      // ASSERT
      expect(Constants.CARD_FLIP_DURATION).toBeLessThan(5000);
      expect(Constants.CARD_DEAL_DURATION).toBeLessThan(5000);
      expect(Constants.SCORE_COUNT_DURATION).toBeLessThan(5000);
    });
  });

  describe('UI Delays', () => {
    it('should have CARD_DEAL_DELAY_PER_CARD = 100', () => {
      // ASSERT
      expect(Constants.CARD_DEAL_DELAY_PER_CARD).toBe(100);
    });

    it('should have SCORE_DISPLAY_DELAY = 500', () => {
      // ASSERT
      expect(Constants.SCORE_DISPLAY_DELAY).toBe(500);
    });

    it('should have VICTORY_CELEBRATION_DELAY = 2000', () => {
      // ASSERT
      expect(Constants.VICTORY_CELEBRATION_DELAY).toBe(2000);
    });

    it('should have DEFEAT_DISPLAY_DELAY = 1500', () => {
      // ASSERT
      expect(Constants.DEFEAT_DISPLAY_DELAY).toBe(1500);
    });

    it('should have all delays as positive numbers', () => {
      // ASSERT
      expect(Constants.CARD_DEAL_DELAY_PER_CARD).toBeGreaterThan(0);
      expect(Constants.SCORE_DISPLAY_DELAY).toBeGreaterThan(0);
      expect(Constants.VICTORY_CELEBRATION_DELAY).toBeGreaterThan(0);
      expect(Constants.DEFEAT_DISPLAY_DELAY).toBeGreaterThan(0);
    });
  });

  describe('Card Display Constants', () => {
    it('should have CARD_WIDTH = 80', () => {
      // ASSERT
      expect(Constants.CARD_WIDTH).toBe(80);
    });

    it('should have CARD_HEIGHT = 120', () => {
      // ASSERT
      expect(Constants.CARD_HEIGHT).toBe(120);
    });

    it('should have CARD_ASPECT_RATIO = 1.5', () => {
      // ASSERT
      expect(Constants.CARD_ASPECT_RATIO).toBe(1.5);
    });

    it('should have CARD_BORDER_RADIUS = 8', () => {
      // ASSERT
      expect(Constants.CARD_BORDER_RADIUS).toBe(8);
    });

    it('should have SELECTED_CARD_OFFSET_Y = -20', () => {
      // ASSERT
      expect(Constants.SELECTED_CARD_OFFSET_Y).toBe(-20);
    });

    it('should have aspect ratio matching height/width', () => {
      // ACT
      const calculatedRatio = Constants.CARD_HEIGHT / Constants.CARD_WIDTH;
      
      // ASSERT
      expect(calculatedRatio).toBeCloseTo(Constants.CARD_ASPECT_RATIO, 2);
    });

    it('should have all pixel values as numbers', () => {
      // ASSERT
      expect(typeof Constants.CARD_WIDTH).toBe('number');
      expect(typeof Constants.CARD_HEIGHT).toBe('number');
      expect(typeof Constants.CARD_BORDER_RADIUS).toBe('number');
    });
  });

  describe('Color Palette', () => {
    describe('Primary Colors', () => {
      it('should have valid COLOR_PRIMARY hex', () => {
        // ASSERT
        expect(Constants.COLOR_PRIMARY).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_SECONDARY hex', () => {
        // ASSERT
        expect(Constants.COLOR_SECONDARY).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_ACCENT hex', () => {
        // ASSERT
        expect(Constants.COLOR_ACCENT).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_SUCCESS hex', () => {
        // ASSERT
        expect(Constants.COLOR_SUCCESS).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_WARNING hex', () => {
        // ASSERT
        expect(Constants.COLOR_WARNING).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_DANGER hex', () => {
        // ASSERT
        expect(Constants.COLOR_DANGER).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_TEXT_LIGHT hex', () => {
        // ASSERT
        expect(Constants.COLOR_TEXT_LIGHT).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_TEXT_DARK hex', () => {
        // ASSERT
        expect(Constants.COLOR_TEXT_DARK).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    describe('Suit Colors', () => {
      it('should have valid COLOR_DIAMONDS hex', () => {
        // ASSERT
        expect(Constants.COLOR_DIAMONDS).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_HEARTS hex', () => {
        // ASSERT
        expect(Constants.COLOR_HEARTS).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_SPADES hex', () => {
        // ASSERT
        expect(Constants.COLOR_SPADES).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have valid COLOR_CLUBS hex', () => {
        // ASSERT
        expect(Constants.COLOR_CLUBS).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });

      it('should have Diamonds and Hearts as same red color', () => {
        // ASSERT
        expect(Constants.COLOR_DIAMONDS).toBe(Constants.COLOR_HEARTS);
      });

      it('should have Spades and Clubs as same black color', () => {
        // ASSERT
        expect(Constants.COLOR_SPADES).toBe(Constants.COLOR_CLUBS);
      });
    });

    describe('Color Format Validation', () => {
      it('should have all colors start with #', () => {
        // ASSERT
        expect(Constants.COLOR_PRIMARY.startsWith('#')).toBe(true);
        expect(Constants.COLOR_ACCENT.startsWith('#')).toBe(true);
        expect(Constants.COLOR_DIAMONDS.startsWith('#')).toBe(true);
      });

      it('should have all colors as 7 characters', () => {
        // ASSERT
        expect(Constants.COLOR_PRIMARY.length).toBe(7);
        expect(Constants.COLOR_SECONDARY.length).toBe(7);
        expect(Constants.COLOR_ACCENT.length).toBe(7);
        expect(Constants.COLOR_SUCCESS.length).toBe(7);
      });
    });
  });

  describe('Z-Index Layers', () => {
    it('should have Z_INDEX_BACKGROUND = 0', () => {
      // ASSERT
      expect(Constants.Z_INDEX_BACKGROUND).toBe(0);
    });

    it('should have Z_INDEX_GAME_BOARD = 10', () => {
      // ASSERT
      expect(Constants.Z_INDEX_GAME_BOARD).toBe(10);
    });

    it('should have Z_INDEX_CARDS = 20', () => {
      // ASSERT
      expect(Constants.Z_INDEX_CARDS).toBe(20);
    });

    it('should have Z_INDEX_SELECTED_CARDS = 30', () => {
      // ASSERT
      expect(Constants.Z_INDEX_SELECTED_CARDS).toBe(30);
    });

    it('should have Z_INDEX_UI_OVERLAY = 40', () => {
      // ASSERT
      expect(Constants.Z_INDEX_UI_OVERLAY).toBe(40);
    });

    it('should have Z_INDEX_MODAL = 50', () => {
      // ASSERT
      expect(Constants.Z_INDEX_MODAL).toBe(50);
    });

    it('should have Z_INDEX_TOAST = 60', () => {
      // ASSERT
      expect(Constants.Z_INDEX_TOAST).toBe(60);
    });

    it('should have z-indices in ascending order', () => {
      // ASSERT
      expect(Constants.Z_INDEX_BACKGROUND).toBeLessThan(Constants.Z_INDEX_GAME_BOARD);
      expect(Constants.Z_INDEX_GAME_BOARD).toBeLessThan(Constants.Z_INDEX_CARDS);
      expect(Constants.Z_INDEX_CARDS).toBeLessThan(Constants.Z_INDEX_SELECTED_CARDS);
      expect(Constants.Z_INDEX_SELECTED_CARDS).toBeLessThan(Constants.Z_INDEX_UI_OVERLAY);
      expect(Constants.Z_INDEX_UI_OVERLAY).toBeLessThan(Constants.Z_INDEX_MODAL);
      expect(Constants.Z_INDEX_MODAL).toBeLessThan(Constants.Z_INDEX_TOAST);
    });

    it('should have no duplicate z-index values', () => {
      // ARRANGE
      const zIndices = [
        Constants.Z_INDEX_BACKGROUND,
        Constants.Z_INDEX_GAME_BOARD,
        Constants.Z_INDEX_CARDS,
        Constants.Z_INDEX_SELECTED_CARDS,
        Constants.Z_INDEX_UI_OVERLAY,
        Constants.Z_INDEX_MODAL,
        Constants.Z_INDEX_TOAST
      ];
      
      // ACT
      const uniqueZIndices = new Set(zIndices);
      
      // ASSERT
      expect(uniqueZIndices.size).toBe(zIndices.length);
    });
  });

  describe('Breakpoints', () => {
    it('should have BREAKPOINT_MOBILE = 768', () => {
      // ASSERT
      expect(Constants.BREAKPOINT_MOBILE).toBe(768);
    });

    it('should have BREAKPOINT_TABLET = 1024', () => {
      // ASSERT
      expect(Constants.BREAKPOINT_TABLET).toBe(1024);
    });

    it('should have BREAKPOINT_DESKTOP = 1440', () => {
      // ASSERT
      expect(Constants.BREAKPOINT_DESKTOP).toBe(1440);
    });

    it('should have breakpoints in ascending order', () => {
      // ASSERT
      expect(Constants.BREAKPOINT_MOBILE).toBeLessThan(Constants.BREAKPOINT_TABLET);
      expect(Constants.BREAKPOINT_TABLET).toBeLessThan(Constants.BREAKPOINT_DESKTOP);
    });

    it('should have all breakpoints as positive numbers', () => {
      // ASSERT
      expect(Constants.BREAKPOINT_MOBILE).toBeGreaterThan(0);
      expect(Constants.BREAKPOINT_TABLET).toBeGreaterThan(0);
      expect(Constants.BREAKPOINT_DESKTOP).toBeGreaterThan(0);
    });
  });

  describe('Storage Keys', () => {
    it('should have non-empty STORAGE_KEY_GAME_SAVE', () => {
      // ASSERT
      expect(Constants.STORAGE_KEY_GAME_SAVE).toBeDefined();
      expect(Constants.STORAGE_KEY_GAME_SAVE.length).toBeGreaterThan(0);
    });

    it('should have non-empty STORAGE_KEY_SETTINGS', () => {
      // ASSERT
      expect(Constants.STORAGE_KEY_SETTINGS).toBeDefined();
      expect(Constants.STORAGE_KEY_SETTINGS.length).toBeGreaterThan(0);
    });

    it('should have non-empty STORAGE_KEY_HIGH_SCORES', () => {
      // ASSERT
      expect(Constants.STORAGE_KEY_HIGH_SCORES).toBeDefined();
      expect(Constants.STORAGE_KEY_HIGH_SCORES.length).toBeGreaterThan(0);
    });

    it('should have all storage keys as unique strings', () => {
      // ARRANGE
      const keys = [
        Constants.STORAGE_KEY_GAME_SAVE,
        Constants.STORAGE_KEY_SETTINGS,
        Constants.STORAGE_KEY_HIGH_SCORES
      ];
      
      // ACT
      const uniqueKeys = new Set(keys);
      
      // ASSERT
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should have all storage keys as strings', () => {
      // ASSERT
      expect(typeof Constants.STORAGE_KEY_GAME_SAVE).toBe('string');
      expect(typeof Constants.STORAGE_KEY_SETTINGS).toBe('string');
      expect(typeof Constants.STORAGE_KEY_HIGH_SCORES).toBe('string');
    });
  });

  describe('Routes', () => {
    it('should have ROUTE_HOME = "/"', () => {
      // ASSERT
      expect(Constants.ROUTE_HOME).toBe('/');
    });

    it('should have all routes start with "/"', () => {
      // ASSERT
      expect(Constants.ROUTE_HOME.startsWith('/')).toBe(true);
      expect(Constants.ROUTE_GAME.startsWith('/')).toBe(true);
      expect(Constants.ROUTE_SETTINGS.startsWith('/')).toBe(true);
      expect(Constants.ROUTE_ABOUT.startsWith('/')).toBe(true);
    });

    it('should have all routes as strings', () => {
      // ASSERT
      expect(typeof Constants.ROUTE_HOME).toBe('string');
      expect(typeof Constants.ROUTE_GAME).toBe('string');
      expect(typeof Constants.ROUTE_SETTINGS).toBe('string');
      expect(typeof Constants.ROUTE_ABOUT).toBe('string');
    });
  });

  describe('Error Messages', () => {
    it('should have non-empty ERROR_SAVE_FAILED', () => {
      // ASSERT
      expect(Constants.ERROR_SAVE_FAILED).toBeDefined();
      expect(Constants.ERROR_SAVE_FAILED.length).toBeGreaterThan(0);
    });

    it('should have non-empty ERROR_LOAD_FAILED', () => {
      // ASSERT
      expect(Constants.ERROR_LOAD_FAILED).toBeDefined();
      expect(Constants.ERROR_LOAD_FAILED.length).toBeGreaterThan(0);
    });

    it('should have non-empty ERROR_INVALID_ACTION', () => {
      // ASSERT
      expect(Constants.ERROR_INVALID_ACTION).toBeDefined();
      expect(Constants.ERROR_INVALID_ACTION.length).toBeGreaterThan(0);
    });

    it('should have non-empty ERROR_NETWORK', () => {
      // ASSERT
      expect(Constants.ERROR_NETWORK).toBeDefined();
      expect(Constants.ERROR_NETWORK.length).toBeGreaterThan(0);
    });

    it('should have all error messages as strings', () => {
      // ASSERT
      expect(typeof Constants.ERROR_SAVE_FAILED).toBe('string');
      expect(typeof Constants.ERROR_LOAD_FAILED).toBe('string');
      expect(typeof Constants.ERROR_INVALID_ACTION).toBe('string');
      expect(typeof Constants.ERROR_NETWORK).toBe('string');
    });

    it('should have user-friendly error messages (not technical)', () => {
      // ASSERT - Should not contain technical terms like "null", "undefined", "exception"
      expect(Constants.ERROR_SAVE_FAILED.toLowerCase()).not.toContain('null');
      expect(Constants.ERROR_SAVE_FAILED.toLowerCase()).not.toContain('undefined');
      expect(Constants.ERROR_LOAD_FAILED.toLowerCase()).not.toContain('exception');
    });
  });

  describe('Success Messages', () => {
    it('should have non-empty SUCCESS_GAME_SAVED', () => {
      // ASSERT
      expect(Constants.SUCCESS_GAME_SAVED).toBeDefined();
      expect(Constants.SUCCESS_GAME_SAVED.length).toBeGreaterThan(0);
    });

    it('should have non-empty SUCCESS_PURCHASE', () => {
      // ASSERT
      expect(Constants.SUCCESS_PURCHASE).toBeDefined();
      expect(Constants.SUCCESS_PURCHASE.length).toBeGreaterThan(0);
    });

    it('should have non-empty SUCCESS_LEVEL_COMPLETE', () => {
      // ASSERT
      expect(Constants.SUCCESS_LEVEL_COMPLETE).toBeDefined();
      expect(Constants.SUCCESS_LEVEL_COMPLETE.length).toBeGreaterThan(0);
    });

    it('should have all success messages as strings', () => {
      // ASSERT
      expect(typeof Constants.SUCCESS_GAME_SAVED).toBe('string');
      expect(typeof Constants.SUCCESS_PURCHASE).toBe('string');
      expect(typeof Constants.SUCCESS_LEVEL_COMPLETE).toBe('string');
    });
  });

  describe('UI Labels', () => {
    it('should have non-empty LABEL_PLAY_HAND', () => {
      // ASSERT
      expect(Constants.LABEL_PLAY_HAND).toBeDefined();
      expect(Constants.LABEL_PLAY_HAND.length).toBeGreaterThan(0);
    });

    it('should have non-empty LABEL_DISCARD', () => {
      // ASSERT
      expect(Constants.LABEL_DISCARD).toBeDefined();
      expect(Constants.LABEL_DISCARD.length).toBeGreaterThan(0);
    });

    it('should have non-empty LABEL_REROLL', () => {
      // ASSERT
      expect(Constants.LABEL_REROLL).toBeDefined();
      expect(Constants.LABEL_REROLL.length).toBeGreaterThan(0);
    });

    it('should have non-empty LABEL_EXIT_SHOP', () => {
      // ASSERT
      expect(Constants.LABEL_EXIT_SHOP).toBeDefined();
      expect(Constants.LABEL_EXIT_SHOP.length).toBeGreaterThan(0);
    });

    it('should have non-empty LABEL_NEW_GAME', () => {
      // ASSERT
      expect(Constants.LABEL_NEW_GAME).toBeDefined();
      expect(Constants.LABEL_NEW_GAME.length).toBeGreaterThan(0);
    });

    it('should have non-empty LABEL_CONTINUE', () => {
      // ASSERT
      expect(Constants.LABEL_CONTINUE).toBeDefined();
      expect(Constants.LABEL_CONTINUE.length).toBeGreaterThan(0);
    });

    it('should have non-empty LABEL_SETTINGS', () => {
      // ASSERT
      expect(Constants.LABEL_SETTINGS).toBeDefined();
      expect(Constants.LABEL_SETTINGS.length).toBeGreaterThan(0);
    });

    it('should have all labels as strings', () => {
      // ASSERT
      expect(typeof Constants.LABEL_PLAY_HAND).toBe('string');
      expect(typeof Constants.LABEL_DISCARD).toBe('string');
      expect(typeof Constants.LABEL_REROLL).toBe('string');
      expect(typeof Constants.LABEL_EXIT_SHOP).toBe('string');
    });
  });

  describe('Immutability', () => {
    it('should not allow modification of constants', () => {
      // ARRANGE
      const originalValue = Constants.APP_NAME;
      
      // ACT - Attempt to modify
      try {
        (Constants as any).APP_NAME = 'Modified';
      } catch (e) {
        // Expected in strict mode
      }
      
      // ASSERT
      expect(Constants.APP_NAME).toBe(originalValue);
    });

    it('should maintain consistent values', () => {
      // ASSERT - Should be same as initial tests
      expect(Constants.CARD_FLIP_DURATION).toBe(300);
      expect(Constants.COLOR_PRIMARY).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(Constants.Z_INDEX_MODAL).toBe(50);
    });
  });

  describe('Module Export', () => {
    it('should be properly exported', () => {
      // ASSERT
      expect(Constants).toBeDefined();
      expect(typeof Constants).toBe('object');
    });

    it('should have all expected categories', () => {
      // ASSERT - Check presence of properties from each category
      expect(Constants).toHaveProperty('APP_NAME');
      expect(Constants).toHaveProperty('CARD_FLIP_DURATION');
      expect(Constants).toHaveProperty('COLOR_PRIMARY');
      expect(Constants).toHaveProperty('Z_INDEX_MODAL');
      expect(Constants).toHaveProperty('STORAGE_KEY_GAME_SAVE');
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for Constants
- All constant values verified
- Type validation tests
- Format validation tests
- Logical consistency tests
- Immutability verified

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| App Metadata | Values | 4 | 0 | 0 | 4 |
| Animations | Durations | 8 | 0 | 0 | 8 |
| UI Delays | Values | 5 | 0 | 0 | 5 |
| Card Display | Values | 7 | 0 | 0 | 7 |
| Primary Colors | Validation | 8 | 0 | 0 | 8 |
| Suit Colors | Validation | 6 | 0 | 0 | 6 |
| Color Format | Validation | 3 | 0 | 0 | 3 |
| Z-Index | Values & Order | 9 | 0 | 0 | 9 |
| Breakpoints | Values | 5 | 0 | 0 | 5 |
| Storage Keys | Values | 5 | 0 | 0 | 5 |
| Routes | Values | 3 | 0 | 0 | 3 |
| Error Messages | Values | 6 | 0 | 0 | 6 |
| Success Messages | Values | 4 | 0 | 0 | 4 |
| UI Labels | Values | 8 | 0 | 0 | 8 |
| Immutability | Modification | 2 | 0 | 0 | 2 |
| Export | Module | 2 | 0 | 0 | 2 |
| **TOTAL** | | | | | **94** |

## 3. Expected Coverage
- Estimated line coverage: **100%** (simple constant definitions)
- Estimated branch coverage: **100%**
- Methods covered: **N/A** (no methods, only constants)
- Uncovered scenarios: None expected

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/utils/constants.test.ts

# Run with coverage
npm test -- --coverage tests/unit/utils/constants.test.ts

# Run in watch mode
npm test -- --watch tests/unit/utils/constants.test.ts

# Run specific sections
npm test -- -t "Color Palette" tests/unit/utils/constants.test.ts
npm test -- -t "Animation" tests/unit/utils/constants.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Immutability:** Constants should be `as const` or `readonly`
- **Hex color format:** Must be exactly 7 characters (#RRGGBB)
- **Route format:** Must start with "/" for valid routes
- **Z-index ordering:** Critical for proper UI layering
- **Aspect ratio:** Must match calculated value (height/width)
- **Message clarity:** User-facing messages should be friendly
- **Type consistency:** All values of same category should be same type
- **Uniqueness:** Storage keys and z-indices should not duplicate

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to validate hex color format
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Helper to validate route format
function isValidRoute(route: string): boolean {
  return route.startsWith('/');
}

// Helper to check all colors in constants
function validateAllColors(constants: typeof Constants): void {
  const colorKeys = Object.keys(constants).filter(key => key.startsWith('COLOR_'));
  colorKeys.forEach(key => {
    const color = (constants as any)[key];
    expect(isValidHexColor(color)).toBe(true);
  });
}

// Helper to verify ascending order
function verifyAscendingOrder(values: number[]): boolean {
  for (let i = 1; i < values.length; i++) {
    if (values[i] <= values[i - 1]) {
      return false;
    }
  }
  return true;
}

// Helper to collect all z-indices
function getAllZIndices(constants: typeof Constants): number[] {
  return [
    constants.Z_INDEX_BACKGROUND,
    constants.Z_INDEX_GAME_BOARD,
    constants.Z_INDEX_CARDS,
    constants.Z_INDEX_SELECTED_CARDS,
    constants.Z_INDEX_UI_OVERLAY,
    constants.Z_INDEX_MODAL,
    constants.Z_INDEX_TOAST
  ];
}
```