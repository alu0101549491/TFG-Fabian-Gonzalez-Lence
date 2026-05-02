# REVIEW CONTEXT

**Project:** Mini Balatro

**Component reviewed:** Utilities, Types, and Entry Points - Foundation and Bootstrap

**Components under review:**

### Utilities:
- `constants.ts` - `src/utils/constants.ts`
- `apply-theme.ts` - `src/utils/apply-theme.ts` **(NEW)**

### Types:
- `global.d.ts` - `src/types/global.d.ts`

### Entry Points:
- `index.ts` (library) - `src/index.ts`
- `main.tsx` (React) - `src/main.tsx`
- `index.html` - `index.html`

**Component objective:** 
Provide foundational utilities, type definitions, and application entry points. Constants centralize all magic numbers and configuration values. Theme utility applies color schemes dynamically. Type definitions ensure type safety across the application. Entry points bootstrap the library and React application properly.

---

# REQUIREMENTS SPECIFICATION

## Relevant Functional Requirements:

**NFR9:** Configurable values for balancing
- Acceptance: All magic numbers centralized
- Acceptance: Easy to modify without code changes
- Acceptance: Type-safe access to constants

**NFR10:** Type safety throughout application
- Acceptance: TypeScript strict mode enabled
- Acceptance: No implicit any types
- Acceptance: Proper type definitions for all modules

**NFR11:** Clean public API for library usage
- Acceptance: index.ts exports all public interfaces
- Acceptance: Private implementation details hidden
- Acceptance: Version information accessible

**NFR12:** Proper application bootstrap
- Acceptance: React app initializes correctly
- Acceptance: Error boundaries in place
- Acceptance: Development mode logging

**Section 12: User Interface - Color Palette**

All color values must be centralized in constants for consistent theming:

```typescript
COLORS = {
  theme: {
    BG_PRIMARY: '#1a1a2e',
    BG_PANEL: '#16213e',
    BORDER: '#0f3460',
    ACCENT: '#e94560',
    TEXT_PRIMARY: '#f1f1f1',
    TEXT_SECONDARY: '#a8a8a8'
  },
  suits: {
    DIAMONDS: '#ff6b6b',
    HEARTS: '#ee5a6f',
    SPADES: '#4ecdc4',
    CLUBS: '#95e1d3'
  },
  indicators: {
    CHIPS: '#f9ca24',
    MULT: '#6c5ce7',
    MONEY: '#00d2d3'
  }
}
```

## Key Acceptance Criteria:

### constants.ts:

**GAME_CONFIG object:**
- [ ] INITIAL_MONEY: 5
- [ ] MAX_JOKERS: 5
- [ ] MAX_CONSUMABLES: 2
- [ ] HAND_SIZE: 8
- [ ] MAX_HANDS_PER_BLIND: 3
- [ ] MAX_DISCARDS_PER_BLIND: 3
- [ ] VICTORY_ROUNDS: 8

**SHOP_CONFIG object:**
- [ ] JOKER_COST: 5
- [ ] PLANET_COST: 3
- [ ] TAROT_COST: 3
- [ ] REROLL_COST: 3
- [ ] ITEMS_PER_SHOP: 4

**BLIND_REWARDS object:**
- [ ] SMALL_BLIND: 2
- [ ] BIG_BLIND: 5
- [ ] BOSS_BLIND: 10

**COLORS object:**
- [ ] theme: { BG_PRIMARY, BG_PANEL, BORDER, ACCENT, TEXT_PRIMARY, TEXT_SECONDARY }
- [ ] suits: { DIAMONDS, HEARTS, SPADES, CLUBS }
- [ ] indicators: { CHIPS, MULT, MONEY }

**SUIT_SYMBOLS object:**
- [ ] DIAMONDS: '♦'
- [ ] HEARTS: '♥'
- [ ] SPADES: '♠'
- [ ] CLUBS: '♣'

**CARD_VALUE_DISPLAY object:**
- [ ] Maps CardValue enum to display strings (ACE: 'A', KING: 'K', etc.)

**BASE_CARD_VALUES object:**
- [ ] Maps CardValue enum to chip values (ACE: 11, KING/QUEEN/JACK: 10, etc.)

**BASE_HAND_VALUES object:**
- [ ] Maps HandType enum to { chips, mult } objects
- [ ] All 9 hand types with correct base values

**PLANET_UPGRADES array:**
- [ ] 9 planet configurations with handType, chips, mult bonuses

**DIFFICULTY_CONFIG object:**
- [ ] BASE_GOAL: 300
- [ ] GROWTH_RATE: 1.5
- [ ] BLIND_MULTIPLIERS: { small: 1.0, big: 1.5, boss: 2.0 }

**ANIMATION_TIMING object:**
- [ ] CARD_FLIP_DURATION: 300
- [ ] SCORE_UPDATE_DELAY: 500
- [ ] MODAL_FADE_DURATION: 200
- [ ] TOOLTIP_DELAY: 500

**STORAGE_KEYS object:**
- [ ] GAME_SAVE: 'miniBalatro_save'
- [ ] SETTINGS: 'miniBalatro_settings'
- [ ] STATISTICS: 'miniBalatro_stats'

**UI_CONFIG object:**
- [ ] MIN_SCREEN_WIDTH: 1024
- [ ] MIN_SCREEN_HEIGHT: 768
- [ ] CARD_WIDTH: 100
- [ ] CARD_HEIGHT: 140
- [ ] CARD_SPACING: 10

**Helper Functions:**
- [ ] calculateBlindGoal(roundNumber: number, blindType: string): number
- [ ] getSuitColor(suit: Suit): string
- [ ] getSuitSymbol(suit: Suit): string
- [ ] formatMoney(amount: number): string
- [ ] formatScore(score: number): string

### apply-theme.ts **(NEW)**:

**applyTheme function:**
- [ ] Accepts optional theme object (defaults to COLORS from constants)
- [ ] Applies CSS variables to document root (:root)
- [ ] Sets --color-bg-primary, --color-bg-panel, etc.
- [ ] Sets --color-diamonds, --color-hearts, etc.
- [ ] Sets --color-chips, --color-mult, --color-money
- [ ] Validates theme object structure
- [ ] Returns void or success indicator
- [ ] Logs theme application for debugging

**Usage:**
```typescript
import { applyTheme } from './utils/apply-theme';
import { COLORS } from './utils/constants';

// Apply default theme
applyTheme();

// Apply custom theme
applyTheme({
  theme: { ...COLORS.theme, ACCENT: '#ff0000' },
  suits: COLORS.suits,
  indicators: COLORS.indicators
});
```

### global.d.ts:

**AppScreen type:**
- [ ] Type union: 'menu' | 'game' | 'shop'

**BlindType type:**
- [ ] Type union: 'small' | 'big' | 'boss'

**SuitColor type:**
- [ ] Type for suit color hex values

**Callback Types:**
- [ ] StateChangeCallback: (state: GameState) => void
- [ ] ShopCallback: (shop: Shop) => void
- [ ] GameEndCallback: () => void

**Configuration Interfaces:**
- [ ] HandValueConfig: { chips: number; mult: number }
- [ ] PlanetUpgradeConfig: { name: string; handType: HandType; chips: number; mult: number }

**Shop Interfaces:**
- [ ] ShopItemData: { id: string; type: ShopItemType; name: string; description: string; cost: number }

**Scoring Interfaces:**
- [ ] ScoreBreakdownEntry: { source: string; chipsAdded: number; multAdded: number; description: string }

**Persistence Interfaces:**
- [ ] GameStatistics: { gamesPlayed: number; gamesWon: number; highestScore: number; etc. }
- [ ] PersistedGameData: Complete serialized game state structure

**Component Prop Interfaces:**
- [ ] BaseComponentProps: { className?: string; style?: React.CSSProperties }

**GameErrorType enum:**
- [ ] INVALID_ACTION
- [ ] INSUFFICIENT_FUNDS
- [ ] INVENTORY_FULL
- [ ] NO_SAVED_GAME
- [ ] PERSISTENCE_ERROR

**GameError interface:**
- [ ] type: GameErrorType
- [ ] message: string
- [ ] context?: any

**Window interface extension:**
- [ ] Extends Window with optional gameController property
- [ ] Extends Window with optional debugMode property

**Module Declarations:**
- [ ] Declare module '*.css' for CSS imports
- [ ] Declare module '*.png' for image imports
- [ ] Declare module '*.jpg' for image imports
- [ ] Declare module '*.svg' for SVG imports

**Utility Types:**
- [ ] DeepPartial<T> for partial nested objects
- [ ] ReadonlyArray<T> type alias
- [ ] NonNullable<T> re-export

### index.ts (Library Entry):

**Exports structure:**
- [ ] Export all public classes from models (Card, Deck, Joker, etc.)
- [ ] Export all enums (CardValue, Suit, HandType, BossType, etc.)
- [ ] Export GameController
- [ ] Export services (Shop, GamePersistence, GameConfig)
- [ ] Export types from global.d.ts
- [ ] Export constants
- [ ] Do NOT export private implementation details
- [ ] Do NOT export React components (separate from library)

**Version information:**
- [ ] VERSION constant: '1.0.0'
- [ ] LIBRARY_INFO object: { name, version, description, author, license }

**Documentation:**
- [ ] JSDoc comment explaining library purpose
- [ ] Usage examples in comments
- [ ] Link to documentation (if available)

### main.tsx (React Entry):

**Imports:**
- [ ] Import React and ReactDOM
- [ ] Import App component
- [ ] Import global styles (App.css or index.css)
- [ ] Import applyTheme utility

**initializeApp function:**
- [ ] Gets root element from DOM
- [ ] Validates root element exists
- [ ] Creates React root using createRoot (React 18)
- [ ] Renders App component wrapped in StrictMode
- [ ] Applies theme on initialization
- [ ] Returns root instance or void

**Error handling:**
- [ ] Catches missing root element error
- [ ] Logs initialization errors
- [ ] Displays user-friendly error message

**Development mode:**
- [ ] Logs initialization success in dev mode
- [ ] Shows version information
- [ ] Enables React DevTools hints

**Bootstrap:**
- [ ] Calls initializeApp() at module execution
- [ ] Handles HMR (Hot Module Replacement) if using Vite

### index.html:

**Document structure:**
- [ ] DOCTYPE html5
- [ ] Lang attribute set (lang="en")
- [ ] Charset UTF-8
- [ ] Viewport meta for responsive design

**Meta tags:**
- [ ] Description meta tag
- [ ] Theme color meta tag
- [ ] Open Graph tags for social sharing (optional)

**Favicon:**
- [ ] Favicon link (favicon.ico)
- [ ] Apple touch icon (optional)
- [ ] Manifest link (optional)

**Fonts:**
- [ ] Google Fonts preconnect
- [ ] Font stylesheet links (Inter, Playfair Display)
- [ ] Font-display: swap for performance

**Body:**
- [ ] Root div with id="root"
- [ ] Noscript tag with fallback message
- [ ] Script tag for main.tsx (loaded by Vite)

**Development:**
- [ ] Works with Vite dev server
- [ ] Hot module replacement enabled
- [ ] No hardcoded production paths

## Edge Cases to Handle:

**constants.ts:**
- Accessing non-existent keys (TypeScript catches at compile time)
- Invalid enum values passed to helpers (throw errors)
- Division by zero in calculations (validate inputs)

**apply-theme.ts:**
- Theme object missing properties (use defaults)
- Invalid color values (validate hex format)
- Document not available (SSR scenario, check if document exists)
- Theme already applied (idempotent, can reapply)

**global.d.ts:**
- Conflicting type definitions (ensure no duplicates)
- Module declarations not recognized (check tsconfig.json)

**index.ts:**
- Circular dependencies (carefully manage exports)
- Name collisions (use namespaces if needed)

**main.tsx:**
- Root element not found (show error message)
- React not loaded (check imports)
- Initialization errors (catch and log)

**index.html:**
- Missing script tag (app doesn't load)
- Wrong script path (404 error)
- Missing root div (React mount fails)

---

# FILE STRUCTURE

```
src/
├── utils/
│   ├── constants.ts          (All game constants)
│   ├── apply-theme.ts         (NEW - Theme utility)
│   └── index.ts               (Utils barrel export)
├── types/
│   ├── global.d.ts            (Global type definitions)
│   └── index.ts               (Types barrel export)
├── index.ts                   (Library entry point)
└── main.tsx                   (React entry point)

/ (root)
└── index.html                 (HTML entry point)
```

---

# CODE TO REVIEW

- `constants.ts` - Game constants and configuration
- `apply-theme.ts` - **Theme application utility (NEW)**
- `global.d.ts` - Global TypeScript type definitions
- `index.ts` - Library entry point (barrel exports)
- `main.tsx` - React application entry point
- `index.html` - HTML entry point

---

# EVALUATION CRITERIA

## 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**
- [ ] Does the implementation provide proper foundation for the application?
- [ ] Are constants properly organized and typed?
- [ ] Are type definitions comprehensive and correct?
- [ ] Are entry points structured correctly?
- [ ] Is the public API clean and well-defined?

**Specific checks for this module:**

**constants.ts:**
- [ ] All config objects properly structured
- [ ] All values match specification exactly
- [ ] Helper functions have correct signatures
- [ ] Exported as named exports
- [ ] TypeScript types inferred or explicit

**apply-theme.ts:**
- [ ] Function signature clear and typed
- [ ] Accepts optional theme parameter
- [ ] Sets CSS custom properties correctly
- [ ] Document existence checked (browser environment)

**global.d.ts:**
- [ ] All type aliases defined
- [ ] All interfaces defined
- [ ] Enum definitions included
- [ ] Module declarations present
- [ ] Window interface extended correctly
- [ ] No duplicate type definitions

**index.ts (library):**
- [ ] Exports all public APIs
- [ ] Does NOT export private implementations
- [ ] Barrel exports organized logically
- [ ] Version information included
- [ ] No circular dependencies

**main.tsx:**
- [ ] Uses React 18 createRoot API
- [ ] StrictMode wrapper present
- [ ] Error handling in place
- [ ] Theme applied on init
- [ ] Proper TypeScript types

**index.html:**
- [ ] Valid HTML5 structure
- [ ] Proper meta tags
- [ ] Root div present with correct id
- [ ] Script tag points to main.tsx
- [ ] Vite-compatible structure

**Score:** __/10

**Observations:**
[Document any structural or architectural concerns]

---

## 2. CODE QUALITY (Weight: 25%)

### Constants Organization:

**Grouping:**
- [ ] Related constants grouped into objects
- [ ] Clear namespace separation (GAME_CONFIG, SHOP_CONFIG, etc.)
- [ ] No scattered individual constants
- [ ] Logical ordering of groups

**Type Safety:**
- [ ] Constants have explicit types where ambiguous
- [ ] Enums used for finite sets
- [ ] Objects typed as const where appropriate
- [ ] No any types

**Documentation:**
- [ ] Each constant group documented
- [ ] Purpose of helper functions explained
- [ ] Units specified where applicable (ms, px, etc.)

### Theme Utility Quality:

**Implementation:**
- [ ] Properly handles missing document (SSR)
- [ ] Validates theme structure
- [ ] Uses CSS custom properties correctly
- [ ] Idempotent (can call multiple times)

**Error Handling:**
- [ ] Validates color format (optional but good)
- [ ] Logs errors appropriately
- [ ] Doesn't throw in production

### Type Definitions Quality:

**Completeness:**
- [ ] All application types defined
- [ ] No missing interfaces
- [ ] Utility types included

**Correctness:**
- [ ] Types match implementation
- [ ] No overly broad types (any, unknown without reason)
- [ ] Proper use of optional properties
- [ ] Generic types used appropriately

**Organization:**
- [ ] Logical grouping of related types
- [ ] Clear comments for complex types
- [ ] No duplicate definitions

### Entry Points Quality:

**Library Entry (index.ts):**
- [ ] Clean public API
- [ ] Organized exports
- [ ] No internal implementation details leaked
- [ ] Version management

**React Entry (main.tsx):**
- [ ] Modern React patterns
- [ ] Proper error boundaries
- [ ] Environment detection (dev/prod)
- [ ] HMR compatible

**HTML Entry (index.html):**
- [ ] Valid markup
- [ ] Proper resource loading
- [ ] Performance optimizations (preconnect, etc.)

### Code Smells Detection:

**Constants:**
- [ ] Magic numbers still present (should all be in constants)
- [ ] Duplicate values
- [ ] Inconsistent naming

**Types:**
- [ ] Overly complex types (simplify if possible)
- [ ] Missing documentation on complex types
- [ ] Circular type references

**Entry Points:**
- [ ] Hardcoded environment values
- [ ] Missing error handling
- [ ] Synchronous resource loading

**Score:** __/10

**Detected code smells:**
[List specific issues with line numbers]

---

## 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

### Functional Requirements Check:

**constants.ts Requirements:**

**GAME_CONFIG:**
- [ ] INITIAL_MONEY = 5
- [ ] MAX_JOKERS = 5
- [ ] MAX_CONSUMABLES = 2
- [ ] HAND_SIZE = 8
- [ ] MAX_HANDS_PER_BLIND = 3
- [ ] MAX_DISCARDS_PER_BLIND = 3
- [ ] VICTORY_ROUNDS = 8

**SHOP_CONFIG:**
- [ ] JOKER_COST = 5
- [ ] PLANET_COST = 3
- [ ] TAROT_COST = 3
- [ ] REROLL_COST = 3
- [ ] ITEMS_PER_SHOP = 4

**BLIND_REWARDS:**
- [ ] SMALL_BLIND = 2
- [ ] BIG_BLIND = 5
- [ ] BOSS_BLIND = 10

**COLORS:**
- [ ] theme.BG_PRIMARY = '#1a1a2e'
- [ ] theme.BG_PANEL = '#16213e'
- [ ] theme.BORDER = '#0f3460'
- [ ] theme.ACCENT = '#e94560'
- [ ] theme.TEXT_PRIMARY = '#f1f1f1'
- [ ] theme.TEXT_SECONDARY = '#a8a8a8'
- [ ] suits.DIAMONDS = '#ff6b6b'
- [ ] suits.HEARTS = '#ee5a6f'
- [ ] suits.SPADES = '#4ecdc4'
- [ ] suits.CLUBS = '#95e1d3'
- [ ] indicators.CHIPS = '#f9ca24'
- [ ] indicators.MULT = '#6c5ce7'
- [ ] indicators.MONEY = '#00d2d3'

**SUIT_SYMBOLS:**
- [ ] DIAMONDS = '♦'
- [ ] HEARTS = '♥'
- [ ] SPADES = '♠'
- [ ] CLUBS = '♣'

**CARD_VALUE_DISPLAY:**
- [ ] All 13 card values mapped to display strings
- [ ] ACE → 'A', KING → 'K', QUEEN → 'Q', JACK → 'J', TEN → '10', etc.

**BASE_CARD_VALUES:**
- [ ] ACE = 11
- [ ] KING = 10, QUEEN = 10, JACK = 10
- [ ] TEN = 10, NINE = 9, ..., TWO = 2

**BASE_HAND_VALUES:**
- [ ] HIGH_CARD: { chips: 5, mult: 1 }
- [ ] PAIR: { chips: 10, mult: 2 }
- [ ] TWO_PAIR: { chips: 20, mult: 2 }
- [ ] THREE_OF_A_KIND: { chips: 30, mult: 3 }
- [ ] STRAIGHT: { chips: 30, mult: 4 }
- [ ] FLUSH: { chips: 35, mult: 4 }
- [ ] FULL_HOUSE: { chips: 40, mult: 4 }
- [ ] FOUR_OF_A_KIND: { chips: 60, mult: 7 }
- [ ] STRAIGHT_FLUSH: { chips: 100, mult: 8 }

**PLANET_UPGRADES:**
- [ ] 9 planets with correct hand types and bonuses
- [ ] Pluto: High Card, +10 chips, +1 mult
- [ ] Mercury: Pair, +15 chips, +1 mult
- [ ] Uranus: Two Pair, +20 chips, +1 mult
- [ ] Venus: Three of a Kind, +20 chips, +2 mult
- [ ] Saturn: Straight, +30 chips, +3 mult
- [ ] Jupiter: Flush, +15 chips, +2 mult
- [ ] Earth: Full House, +25 chips, +2 mult
- [ ] Mars: Four of a Kind, +30 chips, +3 mult
- [ ] Neptune: Straight Flush, +40 chips, +4 mult

**DIFFICULTY_CONFIG:**
- [ ] BASE_GOAL = 300
- [ ] GROWTH_RATE = 1.5
- [ ] BLIND_MULTIPLIERS correct (1.0, 1.5, 2.0)

**ANIMATION_TIMING:**
- [ ] All timing values reasonable (200-500ms)

**STORAGE_KEYS:**
- [ ] Unique key names to avoid collisions

**UI_CONFIG:**
- [ ] MIN_SCREEN_WIDTH = 1024
- [ ] MIN_SCREEN_HEIGHT = 768
- [ ] Card dimensions specified

**Helper Functions:**
- [ ] calculateBlindGoal implements 300 × (1.5)^(n-1) formula
- [ ] getSuitColor returns correct color for each suit
- [ ] getSuitSymbol returns correct symbol
- [ ] formatMoney adds $ prefix and formats numbers
- [ ] formatScore adds commas for thousands

**apply-theme.ts Requirements:**
- [ ] Function exported and available
- [ ] Accepts optional theme parameter
- [ ] Defaults to COLORS from constants
- [ ] Sets all CSS custom properties
- [ ] Property names match constants (--color-bg-primary, etc.)
- [ ] Handles browser environment check
- [ ] Logs application for debugging

**global.d.ts Requirements:**
- [ ] All type aliases present (AppScreen, BlindType, etc.)
- [ ] All callback types defined
- [ ] All configuration interfaces defined
- [ ] Shop interfaces defined
- [ ] Scoring interfaces defined
- [ ] Persistence interfaces defined
- [ ] Component prop base interface defined
- [ ] GameErrorType enum defined
- [ ] GameError interface defined
- [ ] Window interface extended
- [ ] Module declarations for .css, .png, .jpg, .svg
- [ ] Utility types defined (DeepPartial, etc.)

**index.ts (library) Requirements:**
- [ ] Exports all public models (Card, Deck, Joker, Planet, Tarot, Blind, etc.)
- [ ] Exports all enums (CardValue, Suit, HandType, BossType, JokerPriority, etc.)
- [ ] Exports GameController
- [ ] Exports services (Shop, GamePersistence, GameConfig, BalancingConfig)
- [ ] Exports types from global.d.ts
- [ ] Exports constants
- [ ] VERSION constant defined ('1.0.0')
- [ ] LIBRARY_INFO object present
- [ ] JSDoc documentation present

**main.tsx Requirements:**
- [ ] Uses React 18 createRoot API (not deprecated render)
- [ ] Wraps App in StrictMode
- [ ] Gets root element by id='root'
- [ ] Validates root element exists
- [ ] Calls applyTheme() on initialization
- [ ] Handles errors during initialization
- [ ] Logs success in development mode
- [ ] Exports initializeApp function (optional)
- [ ] Calls initialization at module execution

**index.html Requirements:**
- [ ] DOCTYPE html
- [ ] lang="en" attribute
- [ ] charset UTF-8
- [ ] viewport meta tag for responsive
- [ ] description meta tag
- [ ] theme-color meta tag
- [ ] favicon link
- [ ] Google Fonts preconnect
- [ ] Font stylesheet links (Inter, Playfair Display)
- [ ] div#root in body
- [ ] noscript fallback message
- [ ] script tag for main.tsx with type="module"

### Edge Cases Handling:

**constants.ts:**
- [ ] Helper functions validate inputs
- [ ] Invalid enum values caught (TypeScript)
- [ ] calculateBlindGoal handles round 1 (returns 300)
- [ ] getSuitColor returns valid color for all suits

**apply-theme.ts:**
- [ ] Handles document undefined (SSR/Node environment)
- [ ] Handles missing theme properties (uses defaults)
- [ ] Handles invalid color values (optional validation)
- [ ] Idempotent (can call multiple times safely)

**global.d.ts:**
- [ ] No type conflicts
- [ ] Module declarations don't interfere with other declarations

**main.tsx:**
- [ ] Handles missing root element gracefully
- [ ] Catches and logs initialization errors
- [ ] Works with HMR (Vite dev server)

**index.html:**
- [ ] Script loads correctly in dev and production
- [ ] Fonts load with fallbacks
- [ ] Works without JavaScript (noscript message)

**Score:** __/10

**Unmet requirements:**
[List any missing constants, types, or entry point issues]

---

## 4. MAINTAINABILITY (Weight: 10%)

### Organization:

**constants.ts:**
- [ ] Logical grouping with clear names
- [ ] Related constants together
- [ ] Easy to find specific values
- [ ] Documentation explains purpose

**global.d.ts:**
- [ ] Types organized by domain
- [ ] Clear separation of concerns
- [ ] Documentation on complex types

**Entry points:**
- [ ] Clear initialization flow
- [ ] Easy to understand bootstrap process
- [ ] Error paths documented

### Documentation:

**TSDoc/JSDoc:**
- [ ] All public constants documented
- [ ] Helper functions documented
- [ ] Type definitions documented where complex
- [ ] Entry point functions documented

**Inline comments:**
- [ ] Complex calculations explained
- [ ] Magic values justified (if any remain)
- [ ] Edge cases noted

**README references:**
- [ ] Constants reference where to use them
- [ ] Types explain their purpose
- [ ] Entry points explain initialization

### Changeability:

**Balancing values:**
- [ ] Easy to change single value without breaking code
- [ ] Values in one place (no duplication)
- [ ] Type safety prevents errors when changing

**Theme:**
- [ ] Can swap entire theme by changing COLORS object
- [ ] CSS variables make runtime theming possible
- [ ] apply-theme utility makes it easy

**Types:**
- [ ] Adding new types doesn't break existing code
- [ ] Interfaces extensible where appropriate

**Score:** __/10

---

## 5. BEST PRACTICES (Weight: 10%)

### Constants Best Practices:

**Naming:**
- [ ] SCREAMING_SNAKE_CASE for constants
- [ ] camelCase for helper functions
- [ ] Descriptive names (no abbreviations)

**Organization:**
- [ ] Grouped by domain
- [ ] Exported as objects/namespaces
- [ ] No scattered individual exports

**Type Safety:**
- [ ] as const for literal types
- [ ] Explicit types where needed
- [ ] Readonly where appropriate

### Theme Best Practices:

**CSS Variables:**
- [ ] Semantic naming (--color-bg-primary not --color1)
- [ ] Consistent prefix (--color-)
- [ ] Applied to :root for global scope

**Runtime Safety:**
- [ ] Environment checks (document exists)
- [ ] Error handling
- [ ] Logging for debugging

### Type Best Practices:

**Type Definitions:**
- [ ] Prefer interfaces over types for objects
- [ ] Use type for unions/aliases
- [ ] Utility types for common patterns

**Module Declarations:**
- [ ] Declare all imported file types
- [ ] Keep declarations minimal

**Documentation:**
- [ ] Complex types explained
- [ ] Generic types documented
- [ ] Edge cases noted

### Entry Point Best Practices:

**Library Entry:**
- [ ] Single source of truth for exports
- [ ] Clear public API
- [ ] Version management

**React Entry:**
- [ ] Modern React patterns (createRoot)
- [ ] Proper error boundaries
- [ ] Development mode hints

**HTML Entry:**
- [ ] Semantic HTML
- [ ] Performance optimizations
- [ ] Accessibility basics

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

[Provide 2-3 lines about the general state of utilities, types, and entry points. Example: "Constants successfully centralize all game values with proper organization. Theme utility provides dynamic theming capability. Type definitions are comprehensive and ensure type safety. Entry points properly bootstrap both library and React application. Ready for final integration."]

---

## Critical Issues (Blockers):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "Missing Critical Constants"]
- **Location:** constants.ts
- **Impact:** Components reference undefined constants, build fails
- **Proposed solution:** Add missing BASE_HAND_VALUES entries for all hand types

### Issue 2: [Title - e.g., "React Entry Point Uses Deprecated API"]
- **Location:** main.tsx
- **Impact:** Uses ReactDOM.render instead of createRoot, not React 18 compatible
- **Proposed solution:** Update to use createRoot from react-dom/client

---

## Minor Issues (Suggested improvements):

**[If none, write "None identified"]**

### Issue 1: [Title - e.g., "apply-theme Doesn't Validate Colors"]
- **Location:** apply-theme.ts
- **Suggestion:** Add hex color validation to catch invalid values

### Issue 2: [Title - e.g., "Missing Module Declarations"]
- **Location:** global.d.ts
- **Suggestion:** Add declarations for .webp, .json file imports

### Issue 3: [Title - e.g., "Hard-coded Values in Entry Points"]
- **Location:** main.tsx, index.html
- **Suggestion:** Use constants for element IDs ('root'), app title

---

## Positive Aspects:

- [e.g., "Comprehensive constants coverage eliminates magic numbers"]
- [e.g., "Theme utility enables dynamic styling"]
- [e.g., "Type definitions provide excellent type safety"]
- [e.g., "Clean public API in library entry point"]
- [e.g., "Proper React 18 patterns in main.tsx"]
- [e.g., "Well-structured HTML with performance optimizations"]

---

## Recommended Refactorings:

### Refactoring 1: Extract Helper Functions to Separate File

**BEFORE:**
```typescript
// In constants.ts - mixed with constant definitions
export const calculateBlindGoal = (roundNumber: number, blindType: string): number => {
  // ... implementation
};

export const formatMoney = (amount: number): string => {
  // ... implementation
};
```

**AFTER (proposal):**
```typescript
// constants.ts - only constants
export const GAME_CONFIG = { /* ... */ };
export const COLORS = { /* ... */ };
// ... other constants

// helpers.ts - utility functions
export const calculateBlindGoal = (roundNumber: number, blindType: string): number => {
  const base = DIFFICULTY_CONFIG.BASE_GOAL * Math.pow(DIFFICULTY_CONFIG.GROWTH_RATE, roundNumber - 1);
  const multiplier = DIFFICULTY_CONFIG.BLIND_MULTIPLIERS[blindType];
  return Math.floor(base * multiplier);
};

export const formatMoney = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const formatScore = (score: number): string => {
  return score.toLocaleString();
};
```

**Rationale:** Separates data from behavior, makes constants file cleaner

---

### Refactoring 2: Enhance apply-theme with Validation

**BEFORE:**
```typescript
export const applyTheme = (theme = COLORS): void => {
  const root = document.documentElement;
  
  Object.entries(theme.theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key.toLowerCase().replace('_', '-')}`, value);
  });
  // ... more property setting
};
```

**AFTER (proposal):**
```typescript
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

const validateTheme = (theme: typeof COLORS): void => {
  const allColors = [
    ...Object.values(theme.theme),
    ...Object.values(theme.suits),
    ...Object.values(theme.indicators)
  ];
  
  allColors.forEach(color => {
    if (!isValidHexColor(color)) {
      console.warn(`Invalid color value: ${color}. Using default.`);
    }
  });
};

export const applyTheme = (theme = COLORS): void => {
  if (typeof document === 'undefined') {
    console.warn('applyTheme called in non-browser environment');
    return;
  }
  
  validateTheme(theme);
  
  const root = document.documentElement;
  
  // Apply theme colors
  Object.entries(theme.theme).forEach(([key, value]) => {
    const cssVar = `--color-${key.toLowerCase().replace(/_/g, '-')}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Apply suit colors
  Object.entries(theme.suits).forEach(([key, value]) => {
    const cssVar = `--color-${key.toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Apply indicator colors
  Object.entries(theme.indicators).forEach(([key, value]) => {
    const cssVar = `--color-${key.toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
  
  console.log('Theme applied successfully');
};
```

**Rationale:** Adds validation, better error handling, SSR safety

---

### Refactoring 3: Enhance Library Entry with Versioning

**BEFORE:**
```typescript
// index.ts
export * from './models';
export * from './controllers';
export * from './services';
export * from './utils';

export const VERSION = '1.0.0';
```

**AFTER (proposal):**
```typescript
// index.ts

// Version information
export const VERSION = '1.0.0';
export const LIBRARY_INFO = {
  name: 'Mini Balatro',
  version: VERSION,
  description: 'A TypeScript poker roguelike game library',
  author: 'Fabián González Lence',
  license: 'MIT',
  repository: 'https://github.com/username/mini-balatro'
} as const;

// Core Models
export type {
  Card,
  Deck,
  CardValue,
  Suit
} from './models/core';

export {
  CardValue,
  Suit,
  Card,
  Deck
} from './models/core';

// Poker System
export type {
  HandType,
  HandResult,
  HandEvaluator,
  HandUpgradeManager
} from './models/poker';

export {
  HandType,
  HandEvaluator,
  HandUpgradeManager
} from './models/poker';

// Special Cards
export type {
  Joker,
  ChipJoker,
  MultJoker,
  MultiplierJoker,
  Planet,
  Tarot
} from './models/special-cards';

export {
  JokerPriority
} from './models/special-cards';

// ... Continue with organized exports

// Utility to check version compatibility
export const isCompatibleVersion = (requiredVersion: string): boolean => {
  const [reqMajor] = requiredVersion.split('.').map(Number);
  const [currentMajor] = VERSION.split('.').map(Number);
  return currentMajor === reqMajor;
};

/**
 * Mini Balatro - Poker Roguelike Game Library
 * 
 * @example
 * ```typescript
 * import { GameController, GameConfig } from 'mini-balatro';
 * 
 * const controller = new GameController({
 *   onStateChange: (state) => console.log('State updated:', state)
 * });
 * 
 * controller.startNewGame();
 * ```
 * 
 * @see https://github.com/username/mini-balatro for full documentation
 */
```

**Rationale:** Better API documentation, version compatibility checking, clearer exports

---

## Decision:

Select one:

- [ ] ✅ **APPROVED** - Ready for integration
  - All constants properly defined
  - Types comprehensive and correct
  - Entry points functional
  - Theme utility works
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality works
  - Minor constants missing
  - Documentation improvements needed
  - Technical debt tracked

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical constants missing
  - Type definitions incomplete
  - Entry points broken
  - Must fix before final integration
