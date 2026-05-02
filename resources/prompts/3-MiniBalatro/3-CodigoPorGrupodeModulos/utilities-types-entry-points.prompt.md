# GLOBAL CONTEXT

**Project:** Mini Balatro

**Architecture:** Layered Architecture with MVC Pattern
- **Model Layer:** Domain entities and business logic
- **View Layer:** React components for UI
- **Controller Layer:** Game flow orchestration
- **Services Layer:** Cross-cutting concerns (shop, persistence, config)

**Current module:** Supporting Infrastructure - Utilities, Type Definitions, and Application Entry Points

**Project File Structure:**
```
3-MiniBalatro/
├── src/
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── views/
│   ├── utils/
│   │   ├── index.ts
│   │   └── constants.ts                ← IMPLEMENT
│   ├── types/
│   │   ├── index.ts
│   │   └── global.d.ts                 ← IMPLEMENT
│   ├── index.ts                        ← IMPLEMENT
│   └── main.tsx                        ← IMPLEMENT
└── public/
    └── index.html                      ← IMPLEMENT
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant sections:**

### Section 5: Non-Functional Requirements
- **NFR1:** Compatible with modern browsers (Chrome, Firefox, Edge)
- **NFR3:** Immediate response to user actions (<1 second)
- **NFR4:** Modular and organized code
- **NFR9:** Configurable values for balancing

### Section 8: Detailed Game Mechanics

**Constants needed:**
- Initial money: $5
- Max jokers: 5
- Max consumables: 2
- Hand size: 8
- Max hands per blind: 3
- Max discards per blind: 3
- Card costs (Joker: $5, Planet: $3, Tarot: $3)
- Suit symbols and colors
- Card value mappings

### Section 18: Suggested Visual Design

**Color palette constants:**
- Theme colors
- Suit colors
- Indicator colors

---

## 2. Class Diagram

**Note:** Utilities and types support all other layers but don't appear in the domain model.

---

## 3. Use Case Diagram

**System operations supported by utilities:**
- Configuration loading
- Constant value access
- Type checking and validation

---

# SPECIFIC TASK

Implement the **Utilities, Types, and Entry Points** module consisting of 5 files:

## UTILITIES (1 module)

1. **constants** (utility file) - `src/utils/constants.ts`

## TYPE DEFINITIONS (1 module)

2. **global.d.ts** (TypeScript declarations) - `src/types/global.d.ts`

## ENTRY POINTS (3 modules)

3. **index.ts** (library entry) - `src/index.ts`
4. **main.tsx** (React app entry) - `src/main.tsx`
5. **index.html** (HTML entry) - `public/index.html`

---

## MODULE 1: constants.ts (Utility File)

### Responsibilities:
- Export all game constants
- Provide centralized constant definitions
- Support easy configuration changes
- Document all magic numbers and strings

### Constants to define:

#### Game Configuration Constants
```typescript
export const GAME_CONFIG = {
  INITIAL_MONEY: 5,
  MAX_JOKERS: 5,
  MAX_CONSUMABLES: 2,
  HAND_SIZE: 8,
  MAX_HANDS_PER_BLIND: 3,
  MAX_DISCARDS_PER_BLIND: 3,
  VICTORY_ROUNDS: 8,
};
```

#### Shop Configuration Constants
```typescript
export const SHOP_CONFIG = {
  JOKER_COST: 5,
  PLANET_COST: 3,
  TAROT_COST: 3,
  REROLL_COST: 3,
  ITEMS_PER_SHOP: 4,
};
```

#### Blind Reward Constants
```typescript
export const BLIND_REWARDS = {
  SMALL_BLIND: 2,
  BIG_BLIND: 5,
  BOSS_BLIND: 10,
};
```

#### Color Palette Constants
```typescript
export const COLORS = {
  // Theme Colors
  BG_PRIMARY: '#1a1a2e',
  BG_PANEL: '#16213e',
  BORDER: '#0f3460',
  ACCENT: '#e94560',
  TEXT_PRIMARY: '#f1f1f1',
  TEXT_SECONDARY: '#a8a8a8',
  
  // Suit Colors
  SUIT_DIAMONDS: '#ff6b6b',
  SUIT_HEARTS: '#ee5a6f',
  SUIT_SPADES: '#4ecdc4',
  SUIT_CLUBS: '#95e1d3',
  
  // Indicator Colors
  CHIPS: '#f9ca24',
  MULT: '#6c5ce7',
  MONEY: '#00d2d3',
  SUCCESS: '#2ecc71',
  WARNING: '#95a5a6',
  ERROR: '#e74c3c',
};
```

#### Suit Symbols Constants
```typescript
export const SUIT_SYMBOLS = {
  DIAMONDS: '♦',
  HEARTS: '♥',
  SPADES: '♠',
  CLUBS: '♣',
};
```

#### Card Value Display Constants
```typescript
export const CARD_VALUE_DISPLAY: Record<string, string> = {
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
```

#### Base Card Values (Chips)
```typescript
export const BASE_CARD_VALUES: Record<string, number> = {
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
```

#### Base Hand Values (Chips and Mult)
```typescript
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
```

#### Planet Upgrades Constants
```typescript
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
```

#### Difficulty Progression Constants
```typescript
export const DIFFICULTY_CONFIG = {
  BASE_GOAL: 300,
  GROWTH_RATE: 1.5,
  SMALL_BLIND_MULTIPLIER: 1.0,
  BIG_BLIND_MULTIPLIER: 1.5,
  BOSS_BLIND_MULTIPLIER: 2.0,
};
```

#### Animation Timing Constants
```typescript
export const ANIMATION_TIMING = {
  CARD_DEAL_DELAY: 50, // ms between cards
  CARD_TRANSITION: 200, // ms for card animations
  SCORE_INCREMENT: 400, // ms for score counting
  SHOP_TRANSITION: 300, // ms for shop opening
};
```

#### Storage Keys
```typescript
export const STORAGE_KEYS = {
  GAME_SAVE: 'miniBalatro_save',
  SETTINGS: 'miniBalatro_settings',
  STATISTICS: 'miniBalatro_stats',
};
```

#### UI Constants
```typescript
export const UI_CONFIG = {
  MIN_SCREEN_WIDTH: 1024,
  MIN_SCREEN_HEIGHT: 768,
  CARD_WIDTH: 100,
  CARD_HEIGHT: 140,
  CARD_BORDER_RADIUS: 8,
};
```

### Helper Functions:

#### 1. **calculateBlindGoal**(roundNumber: number, blindType: 'small' | 'big' | 'boss'): number
```typescript
/**
 * Calculates the score goal for a blind.
 * Formula: base × (growthRate)^(round-1) × blindMultiplier
 */
export function calculateBlindGoal(
  roundNumber: number,
  blindType: 'small' | 'big' | 'boss'
): number {
  const base = DIFFICULTY_CONFIG.BASE_GOAL;
  const growth = Math.pow(DIFFICULTY_CONFIG.GROWTH_RATE, roundNumber - 1);
  
  let multiplier: number;
  switch (blindType) {
    case 'small':
      multiplier = DIFFICULTY_CONFIG.SMALL_BLIND_MULTIPLIER;
      break;
    case 'big':
      multiplier = DIFFICULTY_CONFIG.BIG_BLIND_MULTIPLIER;
      break;
    case 'boss':
      multiplier = DIFFICULTY_CONFIG.BOSS_BLIND_MULTIPLIER;
      break;
  }
  
  return Math.floor(base * growth * multiplier);
}
```

#### 2. **getSuitColor**(suit: string): string
```typescript
/**
 * Returns the CSS color for a suit.
 */
export function getSuitColor(suit: string): string {
  switch (suit.toUpperCase()) {
    case 'DIAMONDS':
      return COLORS.SUIT_DIAMONDS;
    case 'HEARTS':
      return COLORS.SUIT_HEARTS;
    case 'SPADES':
      return COLORS.SUIT_SPADES;
    case 'CLUBS':
      return COLORS.SUIT_CLUBS;
    default:
      return COLORS.TEXT_PRIMARY;
  }
}
```

#### 3. **getSuitSymbol**(suit: string): string
```typescript
/**
 * Returns the Unicode symbol for a suit.
 */
export function getSuitSymbol(suit: string): string {
  switch (suit.toUpperCase()) {
    case 'DIAMONDS':
      return SUIT_SYMBOLS.DIAMONDS;
    case 'HEARTS':
      return SUIT_SYMBOLS.HEARTS;
    case 'SPADES':
      return SUIT_SYMBOLS.SPADES;
    case 'CLUBS':
      return SUIT_SYMBOLS.CLUBS;
    default:
      return '?';
  }
}
```

#### 4. **formatMoney**(amount: number): string
```typescript
/**
 * Formats money amount with dollar sign.
 */
export function formatMoney(amount: number): string {
  return `$${amount}`;
}
```

#### 5. **formatScore**(score: number): string
```typescript
/**
 * Formats score with thousands separator.
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}
```

---

## MODULE 2: global.d.ts (TypeScript Declarations)

### Responsibilities:
- Define global TypeScript types
- Extend existing type definitions
- Provide ambient declarations
- Support type safety across the application

### Type Definitions:

```typescript
/**
 * Global type definitions for Mini Balatro.
 */

/**
 * Represents the current screen/view state.
 */
export type AppScreen = 'menu' | 'game' | 'shop' | 'victory' | 'defeat';

/**
 * Represents a blind type identifier.
 */
export type BlindType = 'small' | 'big' | 'boss';

/**
 * Represents suit color as hex string.
 */
export type SuitColor = string;

/**
 * Callback function type for game state changes.
 */
export type StateChangeCallback = (gameState: any) => void;

/**
 * Callback function type for shop events.
 */
export type ShopCallback = (shop?: any) => void;

/**
 * Callback function type for game end events.
 */
export type GameEndCallback = () => void;

/**
 * Configuration object for hand values.
 */
export interface HandValueConfig {
  chips: number;
  mult: number;
}

/**
 * Configuration object for planet upgrades.
 */
export interface PlanetUpgradeConfig {
  handType: string;
  chips: number;
  mult: number;
}

/**
 * Shop item data structure.
 */
export interface ShopItemData {
  id: string;
  type: 'joker' | 'planet' | 'tarot';
  name: string;
  description: string;
  cost: number;
}

/**
 * Score calculation breakdown entry.
 */
export interface ScoreBreakdownEntry {
  source: string;
  chipsAdded: number;
  multAdded: number;
  description: string;
}

/**
 * Game statistics data.
 */
export interface GameStatistics {
  levelsCompleted: number;
  totalScore: number;
  moneyRemaining: number;
  roundsCompleted: number;
  handsPlayed: number;
  jokersUsed: string[];
  planetsCollected: string[];
}

/**
 * Persisted game state data.
 */
export interface PersistedGameData {
  levelNumber: number;
  roundNumber: number;
  money: number;
  accumulatedScore: number;
  handsRemaining: number;
  discardsRemaining: number;
  deckState: any;
  jokers: any[];
  consumables: any[];
  upgrades: any;
  timestamp: number;
}

/**
 * UI component props base interface.
 */
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Error types for game operations.
 */
export enum GameErrorType {
  INVALID_ACTION = 'INVALID_ACTION',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVENTORY_FULL = 'INVENTORY_FULL',
  NO_SAVED_GAME = 'NO_SAVED_GAME',
  PERSISTENCE_ERROR = 'PERSISTENCE_ERROR',
}

/**
 * Game error with type and message.
 */
export interface GameError {
  type: GameErrorType;
  message: string;
}

/**
 * Extends Window interface for custom properties.
 */
declare global {
  interface Window {
    gameController?: any;
    debugMode?: boolean;
  }
}

/**
 * Module declarations for CSS imports.
 */
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

/**
 * Module declarations for image imports.
 */
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

/**
 * Utility type for making all properties optional recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type for readonly array.
 */
export type ReadonlyArray<T> = readonly T[];

/**
 * Utility type for non-nullable.
 */
export type NonNullable<T> = T extends null | undefined ? never : T;
```

---

## MODULE 3: index.ts (Library Entry Point)

### Responsibilities:
- Export all public APIs from models
- Provide barrel exports for library usage
- Support tree-shaking
- Document exported interfaces

### Content:

```typescript
/**
 * Mini Balatro - Library Entry Point
 * 
 * This file exports all public APIs for use as a library.
 * Import from this file when using Mini Balatro as a module.
 * 
 * @example
 * import { GameController, GameState } from 'mini-balatro';
 */

// Core Models
export * from './models/core';
export * from './models/poker';
export * from './models/special-cards';
export * from './models/scoring';
export * from './models/blinds';
export * from './models/game';

// Controllers
export * from './controllers';

// Services
export * from './services';

// Utilities
export * from './utils';

// Types
export * from './types';

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * Library metadata
 */
export const LIBRARY_INFO = {
  name: 'Mini Balatro',
  version: VERSION,
  description: 'A web-based card game inspired by Balatro with poker mechanics and roguelike elements',
  author: 'Your Name',
  license: 'MIT',
};
```

---

## MODULE 4: main.tsx (React App Entry Point)

### Responsibilities:
- Initialize React application
- Mount root component to DOM
- Import global styles
- Set up development environment

### Content:

```typescript
/**
 * Mini Balatro - React Application Entry Point
 * 
 * This file initializes the React application and mounts it to the DOM.
 * It also imports global styles and sets up the development environment.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './views/App';

// Import global styles
import '../public/assets/styles/global.css';
import '../public/assets/styles/animations.css';

/**
 * Initialize the application
 */
const initializeApp = () => {
  // Get root element
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found. Make sure index.html has a div with id="root"');
  }

  // Create React root
  const root = ReactDOM.createRoot(rootElement);

  // Render application
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Development mode logging
  if (import.meta.env.DEV) {
    console.log('🎮 Mini Balatro - Development Mode');
    console.log('Version:', '1.0.0');
    console.log('Environment:', import.meta.env.MODE);
  }
};

// Initialize when DOM is ready
initializeApp();
```

---

## MODULE 5: index.html (HTML Entry Point)

### Responsibilities:
- Provide HTML structure
- Define viewport and meta tags
- Load application scripts
- Support responsive design

### Content:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Mini Balatro - A web-based card game inspired by Balatro combining poker mechanics with roguelike elements" />
    <meta name="theme-color" content="#1a1a2e" />
    
    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Mini Balatro" />
    <meta property="og:description" content="A strategic card game combining poker hands with roguelike progression" />
    <meta property="og:image" content="/assets/images/og-image.png" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg" />
    <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" />
    
    <!-- Preconnect to Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet" />
    
    <title>Mini Balatro</title>
  </head>
  <body>
    <!-- Root element for React application -->
    <div id="root"></div>
    
    <!-- Fallback message for browsers with JavaScript disabled -->
    <noscript>
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: 'Inter', sans-serif;
        background-color: #1a1a2e;
        color: #f1f1f1;
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1>JavaScript Required</h1>
          <p>Mini Balatro requires JavaScript to run. Please enable JavaScript in your browser settings.</p>
        </div>
      </div>
    </noscript>
    
    <!-- Main application script (loaded by Vite) -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Dependencies:

### External libraries:
- **React** (v18.x)
- **ReactDOM** (v18.x)
- **TypeScript** (v5.x)
- **Vite** (build tool)

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x
- **Code style:** Google TypeScript Style Guide
  - Use camelCase for variables and functions
  - Use PascalCase for types and interfaces
  - Use SCREAMING_SNAKE_CASE for constants
  - 2-space indentation
  - Single quotes for strings
  - Semicolons required

## Mandatory best practices:
- **Constants:**
  - Group related constants in objects
  - Use readonly where appropriate
  - Document all magic numbers
  - Export only what's needed
- **Types:**
  - Provide JSDoc comments for all types
  - Use type aliases for complex types
  - Prefer interfaces over types for objects
  - Use enums for closed sets of values
- **Entry points:**
  - Keep entry points minimal
  - Handle initialization errors gracefully
  - Provide development mode logging
  - Support tree-shaking

---

# DELIVERABLES

## 1. Complete source code of all 5 modules:

### File: `src/utils/constants.ts`
```typescript
/**
 * Game constants and configuration values.
 * All magic numbers and strings are centralized here for easy balancing.
 */

[Complete implementation with all constants and helper functions]
```

### File: `src/utils/index.ts`
```typescript
/**
 * Utils barrel export.
 */
export * from './constants';
```

### File: `src/types/global.d.ts`
```typescript
/**
 * Global TypeScript type definitions for Mini Balatro.
 */

[Complete type definitions]
```

### File: `src/types/index.ts`
```typescript
/**
 * Types barrel export.
 */
export * from './global';
```

### File: `src/index.ts`
```typescript
/**
 * Library entry point - exports all public APIs.
 */

[Complete barrel exports]
```

### File: `src/main.tsx`
```typescript
/**
 * React application entry point.
 */

[Complete React initialization]
```

### File: `public/index.html`
```html
<!-- HTML entry point -->

[Complete HTML structure]
```

## 2. Inline documentation:
- JSDoc comments on all constants
- Type documentation for interfaces
- Usage examples where appropriate
- Configuration notes

## 3. New dependencies:
- All dependencies already specified in previous modules

## 4. Additional notes:

**constants.ts:**
- Centralized source of truth for all game values
- Easy to modify for balancing
- Helper functions for common calculations

**global.d.ts:**
- Comprehensive type definitions
- Support for module declarations
- Extensible type system

**Entry points:**
- Clean separation of concerns
- Development mode support
- Error handling

---

# OUTPUT FORMAT

Provide separate code blocks for each file:

```typescript
// ============================================
// FILE: src/utils/constants.ts
// ============================================

[Complete implementation]
```

```typescript
// ============================================
// FILE: src/types/global.d.ts
// ============================================

[Complete implementation]
```

```typescript
// ============================================
// FILE: src/index.ts
// ============================================

[Complete implementation]
```

```typescript
// ============================================
// FILE: src/main.tsx
// ============================================

[Complete implementation]
```

```html
<!-- ============================================
     FILE: public/index.html
     ============================================ -->

[Complete implementation]
```

---

**Design decisions made:**
- [Decision 1 and its justification]
- [Decision 2 and its justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
