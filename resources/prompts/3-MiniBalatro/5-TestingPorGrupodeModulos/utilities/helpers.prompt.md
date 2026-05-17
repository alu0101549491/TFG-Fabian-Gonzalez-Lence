# TESTING CONTEXT
Project: Mini Balatro
Components under test: Helper functions (utility functions for common operations)
Testing framework: Jest 29.x, ts-jest
Target coverage: 95% lines, 100% public methods

# CODE TO TEST

## File 1: src/utils/helpers.ts
```typescript
/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/utils/helpers.ts
 * @desc Utility helper functions for calculations, formatting, and suit operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { COLORS, SUIT_SYMBOLS, DIFFICULTY_CONFIG } from './constants';

/**
 * Calculates the score goal for a blind using Balatro's difficulty curve.
 * Uses predefined base values for each round with multipliers for blind types.
 * @param roundNumber - Current round number (1-8)
 * @param blindType - Type of blind ('small', 'big', or 'boss')
 * @returns Calculated score goal
 */
export function calculateBlindGoal(
  roundNumber: number,
  blindType: 'small' | 'big' | 'boss'
): number {
  // Get base value for the round (rounds beyond 8 use round 8's value)
  const baseIndex = Math.min(roundNumber - 1, DIFFICULTY_CONFIG.ROUND_BASE_VALUES.length - 1);
  const base = DIFFICULTY_CONFIG.ROUND_BASE_VALUES[baseIndex];

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
    default:
      throw new Error(`Invalid blind type: ${blindType}`);
  }

  return Math.floor(base * multiplier);
}

/**
 * Returns the CSS color for a suit.
 * @param suit - Suit name
 * @returns CSS color string
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

/**
 * Returns the Unicode symbol for a suit.
 * @param suit - Suit name
 * @returns Unicode symbol
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

/**
 * Formats money amount with dollar sign.
 * @param amount - Money amount
 * @returns Formatted string
 */
export function formatMoney(amount: number): string {
  return `$${amount}`;
}

/**
 * Formats score with thousands separator.
 * @param score - Score value
 * @returns Formatted string
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}
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

## Helper Functions Requirements:

### Purpose:
- Reusable utility functions for common operations
- Pure functions (no side effects)
- Type-safe implementations
- Well-tested and reliable

### Function Categories:

#### 1. Number Formatting:

**formatNumber(value: number): string**
- Formats numbers with thousand separators
- Examples: 1000 → "1,000", 1234567 → "1,234,567"
- Handles negative numbers: -1000 → "-1,000"
- Handles decimals: 1234.56 → "1,234.56"

**formatMoney(amount: number): string**
- Formats money with $ symbol
- Examples: 5 → "$5", 1000 → "$1,000"
- No decimal places for whole numbers
- Handles $0: 0 → "$0"

**formatScore(score: number): string**
- Formats score with commas
- Examples: 300 → "300", 1500 → "1,500"
- Large scores: 1000000 → "1,000,000"

**abbreviateNumber(value: number): string**
- Abbreviates large numbers
- Examples: 
  - 999 → "999"
  - 1000 → "1K"
  - 1500 → "1.5K"
  - 1000000 → "1M"
  - 1500000 → "1.5M"
  - 1000000000 → "1B"
- One decimal place for abbreviated values

#### 2. String Utilities:

**capitalize(str: string): string**
- Capitalizes first letter of string
- Examples: "hello" → "Hello", "WORLD" → "World"
- Handles empty string: "" → ""
- Handles single character: "a" → "A"

**pluralize(count: number, singular: string, plural?: string): string**
- Returns singular or plural form based on count
- Examples:
  - (1, "card") → "card"
  - (2, "card") → "cards"
  - (0, "card") → "cards"
  - (1, "child", "children") → "child"
  - (2, "child", "children") → "children"
- Auto-adds 's' if plural not provided

**truncate(str: string, maxLength: number, suffix = "..."): string**
- Truncates string to max length with suffix
- Examples:
  - ("Hello World", 5) → "Hello..."
  - ("Hi", 10) → "Hi"
  - ("Testing", 4, "..") → "Test.."
- Suffix included in max length

#### 3. Array Utilities:

**shuffle<T>(array: T[]): T[]**
- Shuffles array using Fisher-Yates algorithm
- Returns new array (does not mutate original)
- Examples:
  - [1, 2, 3] → [2, 3, 1] (random)
  - Empty array → []
  - Single element → [element]

**unique<T>(array: T[]): T[]**
- Returns array with duplicates removed
- Examples:
  - [1, 2, 2, 3] → [1, 2, 3]
  - ["a", "b", "a"] → ["a", "b"]
  - [] → []
- Preserves first occurrence order

**groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]>**
- Groups array elements by key function
- Examples:
  - ([{type: 'a', val: 1}, {type: 'b', val: 2}, {type: 'a', val: 3}], item => item.type)
    → {a: [{type: 'a', val: 1}, {type: 'a', val: 3}], b: [{type: 'b', val: 2}]}

**chunk<T>(array: T[], size: number): T[][]**
- Splits array into chunks of specified size
- Examples:
  - ([1, 2, 3, 4, 5], 2) → [[1, 2], [3, 4], [5]]
  - ([1, 2], 3) → [[1, 2]]
  - ([], 2) → []
- Throws error if size ≤ 0

#### 4. Object Utilities:

**deepClone<T>(obj: T): T**
- Creates deep copy of object
- Handles nested objects and arrays
- Does not preserve functions or prototypes
- Examples:
  - {a: 1, b: {c: 2}} → new object with same structure
  - [1, [2, 3]] → new array with same structure

**pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>**
- Creates object with only specified keys
- Examples:
  - ({a: 1, b: 2, c: 3}, ['a', 'c']) → {a: 1, c: 3}

**omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>**
- Creates object without specified keys
- Examples:
  - ({a: 1, b: 2, c: 3}, ['b']) → {a: 1, c: 3}

#### 5. Validation Utilities:

**isValidEmail(email: string): boolean**
- Validates email format
- Basic validation (contains @ and .)
- Examples:
  - "test@example.com" → true
  - "invalid" → false
  - "test@" → false

**isInRange(value: number, min: number, max: number, inclusive = true): boolean**
- Checks if value is within range
- Examples:
  - (5, 1, 10) → true
  - (0, 1, 10) → false
  - (1, 1, 10, true) → true (inclusive)
  - (1, 1, 10, false) → false (exclusive)

**isEmpty(value: any): boolean**
- Checks if value is empty
- Examples:
  - "" → true
  - [] → true
  - {} → true
  - null → true
  - undefined → true
  - 0 → false
  - "text" → false

#### 6. Time Utilities:

**sleep(ms: number): Promise<void>**
- Returns promise that resolves after delay
- Used for animations, testing
- Examples:
  - await sleep(1000) → waits 1 second

**formatDuration(ms: number): string**
- Formats milliseconds as readable duration
- Examples:
  - 1000 → "1s"
  - 60000 → "1m"
  - 3661000 → "1h 1m 1s"
  - 500 → "500ms"

#### 7. Random Utilities:

**randomInt(min: number, max: number): number**
- Returns random integer in range [min, max] inclusive
- Examples:
  - (1, 6) → 1, 2, 3, 4, 5, or 6
  - (0, 0) → 0

**randomElement<T>(array: T[]): T**
- Returns random element from array
- Throws error on empty array
- Examples:
  - ([1, 2, 3]) → 1, 2, or 3

**randomBoolean(probability = 0.5): boolean**
- Returns random boolean
- Examples:
  - (0.5) → true or false (50% each)
  - (0.8) → true 80% of time
  - (0) → always false
  - (1) → always true

#### 8. DOM/Browser Utilities (if applicable):

**copyToClipboard(text: string): Promise<boolean>**
- Copies text to clipboard
- Returns true on success, false on failure
- Gracefully handles unsupported browsers

**downloadFile(content: string, filename: string, mimeType = 'text/plain'): void**
- Triggers browser download of file
- Creates blob and temporary link

#### 9. Debounce/Throttle:

**debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T**
- Creates debounced version of function
- Delays execution until after delay ms since last call
- Returns function with same signature

**throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T**
- Creates throttled version of function
- Limits execution to once per limit ms
- Returns function with same signature

### Edge Cases:
- Empty arrays/strings
- Null/undefined values
- Negative numbers
- Zero values
- Very large numbers
- Special characters in strings
- Nested objects/arrays
- Invalid inputs (throw errors or return safe defaults)

# TASK

Generate a complete unit test suite for Helper functions that covers:

## 1. Number Formatting Tests

### formatNumber():
- [ ] Formats 1000 as "1,000"
- [ ] Formats 1234567 as "1,234,567"
- [ ] Formats negative: -1000 as "-1,000"
- [ ] Formats decimals: 1234.56 as "1,234.56"
- [ ] Formats 0 as "0"
- [ ] Formats 999 as "999" (no comma)

### formatMoney():
- [ ] Formats 5 as "$5"
- [ ] Formats 1000 as "$1,000"
- [ ] Formats 0 as "$0"
- [ ] Formats negative: -10 as "-$10"
- [ ] No decimal places for whole numbers

### formatScore():
- [ ] Formats 300 as "300"
- [ ] Formats 1500 as "1,500"
- [ ] Formats 1000000 as "1,000,000"
- [ ] Formats 0 as "0"

### abbreviateNumber():
- [ ] 999 → "999"
- [ ] 1000 → "1K"
- [ ] 1500 → "1.5K"
- [ ] 1000000 → "1M"
- [ ] 1500000 → "1.5M"
- [ ] 1000000000 → "1B"
- [ ] 0 → "0"

## 2. String Utilities Tests

### capitalize():
- [ ] "hello" → "Hello"
- [ ] "WORLD" → "World"
- [ ] "" → ""
- [ ] "a" → "A"
- [ ] "hello world" → "Hello world"

### pluralize():
- [ ] (1, "card") → "card"
- [ ] (2, "card") → "cards"
- [ ] (0, "card") → "cards"
- [ ] (1, "child", "children") → "child"
- [ ] (2, "child", "children") → "children"
- [ ] (5, "box", "boxes") → "boxes"

### truncate():
- [ ] ("Hello World", 5) → "Hello..."
- [ ] ("Hi", 10) → "Hi"
- [ ] ("Testing", 4, "..") → "Test.."
- [ ] ("", 5) → ""
- [ ] ("Long text", 0) → "..."

## 3. Array Utilities Tests

### shuffle():
- [ ] Returns array of same length
- [ ] Does not mutate original array
- [ ] Empty array → []
- [ ] Single element → [element]
- [ ] Actually randomizes (statistical test)

### unique():
- [ ] [1, 2, 2, 3] → [1, 2, 3]
- [ ] ["a", "b", "a"] → ["a", "b"]
- [ ] [] → []
- [ ] [1] → [1]
- [ ] Preserves order of first occurrence

### groupBy():
- [ ] Groups objects by key function
- [ ] Handles empty array
- [ ] Multiple groups
- [ ] Single group

### chunk():
- [ ] ([1, 2, 3, 4, 5], 2) → [[1, 2], [3, 4], [5]]
- [ ] ([1, 2], 3) → [[1, 2]]
- [ ] ([], 2) → []
- [ ] Throws error on size ≤ 0
- [ ] ([1, 2, 3], 1) → [[1], [2], [3]]

## 4. Object Utilities Tests

### deepClone():
- [ ] Clones simple object
- [ ] Clones nested objects
- [ ] Clones arrays
- [ ] Clones nested arrays
- [ ] Creates independent copy (modifications don't affect original)

### pick():
- [ ] ({a: 1, b: 2, c: 3}, ['a', 'c']) → {a: 1, c: 3}
- [ ] ({a: 1}, ['b']) → {}
- [ ] ({}, []) → {}

### omit():
- [ ] ({a: 1, b: 2, c: 3}, ['b']) → {a: 1, c: 3}
- [ ] ({a: 1}, ['b']) → {a: 1}
- [ ] ({a: 1, b: 2}, ['a', 'b']) → {}

## 5. Validation Utilities Tests

### isValidEmail():
- [ ] "test@example.com" → true
- [ ] "user.name@domain.co.uk" → true
- [ ] "invalid" → false
- [ ] "test@" → false
- [ ] "@example.com" → false
- [ ] "" → false

### isInRange():
- [ ] (5, 1, 10) → true
- [ ] (0, 1, 10) → false
- [ ] (11, 1, 10) → false
- [ ] (1, 1, 10, true) → true (inclusive)
- [ ] (1, 1, 10, false) → false (exclusive)
- [ ] (10, 1, 10, true) → true
- [ ] (10, 1, 10, false) → false

### isEmpty():
- [ ] "" → true
- [ ] [] → true
- [ ] {} → true
- [ ] null → true
- [ ] undefined → true
- [ ] 0 → false
- [ ] "text" → false
- [ ] [1] → false
- [ ] {a: 1} → false

## 6. Time Utilities Tests

### sleep():
- [ ] Resolves after specified delay
- [ ] Returns Promise<void>
- [ ] Can be awaited
- [ ] Works with 0ms

### formatDuration():
- [ ] 1000 → "1s"
- [ ] 60000 → "1m"
- [ ] 3600000 → "1h"
- [ ] 3661000 → "1h 1m 1s"
- [ ] 500 → "500ms"
- [ ] 0 → "0ms"

## 7. Random Utilities Tests

### randomInt():
- [ ] Returns integer in range [min, max]
- [ ] (0, 0) → 0
- [ ] (1, 1) → 1
- [ ] Result >= min
- [ ] Result <= max
- [ ] Statistical distribution (100 samples)

### randomElement():
- [ ] Returns element from array
- [ ] Throws error on empty array
- [ ] Single element array returns that element

### randomBoolean():
- [ ] (0.5) returns boolean
- [ ] (0) always returns false
- [ ] (1) always returns true
- [ ] (0.8) returns true ~80% of time (statistical)

## 8. DOM/Browser Utilities Tests (if implemented)

### copyToClipboard():
- [ ] Returns Promise<boolean>
- [ ] Mock clipboard API
- [ ] Success case returns true
- [ ] Failure case returns false

### downloadFile():
- [ ] Creates download link
- [ ] Triggers click
- [ ] Removes link after download

## 9. Debounce/Throttle Tests

### debounce():
- [ ] Delays function execution
- [ ] Only executes once after calls stop
- [ ] Cancels previous pending calls
- [ ] Works with different delays

### throttle():
- [ ] Limits execution frequency
- [ ] Executes immediately on first call
- [ ] Ignores calls within limit
- [ ] Executes again after limit expires

## 10. Edge Cases

- [ ] formatNumber with very large numbers
- [ ] abbreviateNumber with negative numbers
- [ ] capitalize with unicode characters
- [ ] shuffle with very large arrays
- [ ] deepClone with circular references (if handled)
- [ ] isInRange with min > max
- [ ] randomInt with min > max
- [ ] chunk with size larger than array
- [ ] truncate with maxLength < suffix.length

# STRUCTURE OF TESTS

Use AAA pattern with TypeScript:

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import {
  formatNumber,
  formatMoney,
  formatScore,
  abbreviateNumber,
  capitalize,
  pluralize,
  truncate,
  shuffle,
  unique,
  groupBy,
  chunk,
  deepClone,
  pick,
  omit,
  isValidEmail,
  isInRange,
  isEmpty,
  sleep,
  formatDuration,
  randomInt,
  randomElement,
  randomBoolean,
  debounce,
  throttle
} from '@/utils/helpers';

describe('Helper Functions', () => {
  describe('Number Formatting', () => {
    describe('formatNumber', () => {
      it('should format 1000 as "1,000"', () => {
        // ACT
        const result = formatNumber(1000);
        
        // ASSERT
        expect(result).toBe('1,000');
      });

      it('should format 1234567 as "1,234,567"', () => {
        // ACT
        const result = formatNumber(1234567);
        
        // ASSERT
        expect(result).toBe('1,234,567');
      });

      it('should format negative numbers', () => {
        // ACT
        const result = formatNumber(-1000);
        
        // ASSERT
        expect(result).toBe('-1,000');
      });

      it('should format decimals', () => {
        // ACT
        const result = formatNumber(1234.56);
        
        // ASSERT
        expect(result).toBe('1,234.56');
      });

      it('should format 0 as "0"', () => {
        // ACT
        const result = formatNumber(0);
        
        // ASSERT
        expect(result).toBe('0');
      });

      it('should format 999 without comma', () => {
        // ACT
        const result = formatNumber(999);
        
        // ASSERT
        expect(result).toBe('999');
      });
    });

    describe('formatMoney', () => {
      it('should format 5 as "$5"', () => {
        // ACT
        const result = formatMoney(5);
        
        // ASSERT
        expect(result).toBe('$5');
      });

      it('should format 1000 as "$1,000"', () => {
        // ACT
        const result = formatMoney(1000);
        
        // ASSERT
        expect(result).toBe('$1,000');
      });

      it('should format 0 as "$0"', () => {
        // ACT
        const result = formatMoney(0);
        
        // ASSERT
        expect(result).toBe('$0');
      });

      it('should format negative numbers', () => {
        // ACT
        const result = formatMoney(-10);
        
        // ASSERT
        expect(result).toBe('-$10');
      });
    });

    describe('formatScore', () => {
      it('should format 300 as "300"', () => {
        // ACT
        const result = formatScore(300);
        
        // ASSERT
        expect(result).toBe('300');
      });

      it('should format 1500 as "1,500"', () => {
        // ACT
        const result = formatScore(1500);
        
        // ASSERT
        expect(result).toBe('1,500');
      });

      it('should format 1000000 as "1,000,000"', () => {
        // ACT
        const result = formatScore(1000000);
        
        // ASSERT
        expect(result).toBe('1,000,000');
      });
    });

    describe('abbreviateNumber', () => {
      it('should not abbreviate numbers < 1000', () => {
        // ACT
        const result = abbreviateNumber(999);
        
        // ASSERT
        expect(result).toBe('999');
      });

      it('should abbreviate 1000 as "1K"', () => {
        // ACT
        const result = abbreviateNumber(1000);
        
        // ASSERT
        expect(result).toBe('1K');
      });

      it('should abbreviate 1500 as "1.5K"', () => {
        // ACT
        const result = abbreviateNumber(1500);
        
        // ASSERT
        expect(result).toBe('1.5K');
      });

      it('should abbreviate 1000000 as "1M"', () => {
        // ACT
        const result = abbreviateNumber(1000000);
        
        // ASSERT
        expect(result).toBe('1M');
      });

      it('should abbreviate 1500000 as "1.5M"', () => {
        // ACT
        const result = abbreviateNumber(1500000);
        
        // ASSERT
        expect(result).toBe('1.5M');
      });

      it('should abbreviate 1000000000 as "1B"', () => {
        // ACT
        const result = abbreviateNumber(1000000000);
        
        // ASSERT
        expect(result).toBe('1B');
      });

      it('should format 0 as "0"', () => {
        // ACT
        const result = abbreviateNumber(0);
        
        // ASSERT
        expect(result).toBe('0');
      });
    });
  });

  describe('String Utilities', () => {
    describe('capitalize', () => {
      it('should capitalize "hello" to "Hello"', () => {
        // ACT
        const result = capitalize('hello');
        
        // ASSERT
        expect(result).toBe('Hello');
      });

      it('should convert "WORLD" to "World"', () => {
        // ACT
        const result = capitalize('WORLD');
        
        // ASSERT
        expect(result).toBe('World');
      });

      it('should handle empty string', () => {
        // ACT
        const result = capitalize('');
        
        // ASSERT
        expect(result).toBe('');
      });

      it('should capitalize single character', () => {
        // ACT
        const result = capitalize('a');
        
        // ASSERT
        expect(result).toBe('A');
      });

      it('should only capitalize first letter', () => {
        // ACT
        const result = capitalize('hello world');
        
        // ASSERT
        expect(result).toBe('Hello world');
      });
    });

    describe('pluralize', () => {
      it('should return singular for count = 1', () => {
        // ACT
        const result = pluralize(1, 'card');
        
        // ASSERT
        expect(result).toBe('card');
      });

      it('should return plural for count = 2', () => {
        // ACT
        const result = pluralize(2, 'card');
        
        // ASSERT
        expect(result).toBe('cards');
      });

      it('should return plural for count = 0', () => {
        // ACT
        const result = pluralize(0, 'card');
        
        // ASSERT
        expect(result).toBe('cards');
      });

      it('should use custom plural form', () => {
        // ACT
        const result1 = pluralize(1, 'child', 'children');
        const result2 = pluralize(2, 'child', 'children');
        
        // ASSERT
        expect(result1).toBe('child');
        expect(result2).toBe('children');
      });
    });

    describe('truncate', () => {
      it('should truncate long string', () => {
        // ACT
        const result = truncate('Hello World', 5);
        
        // ASSERT
        expect(result).toBe('Hello...');
      });

      it('should not truncate short string', () => {
        // ACT
        const result = truncate('Hi', 10);
        
        // ASSERT
        expect(result).toBe('Hi');
      });

      it('should use custom suffix', () => {
        // ACT
        const result = truncate('Testing', 4, '..');
        
        // ASSERT
        expect(result).toBe('Test..');
      });

      it('should handle empty string', () => {
        // ACT
        const result = truncate('', 5);
        
        // ASSERT
        expect(result).toBe('');
      });
    });
  });

  describe('Array Utilities', () => {
    describe('shuffle', () => {
      it('should return array of same length', () => {
        // ARRANGE
        const arr = [1, 2, 3, 4, 5];
        
        // ACT
        const result = shuffle(arr);
        
        // ASSERT
        expect(result).toHaveLength(arr.length);
      });

      it('should not mutate original array', () => {
        // ARRANGE
        const arr = [1, 2, 3];
        const original = [...arr];
        
        // ACT
        shuffle(arr);
        
        // ASSERT
        expect(arr).toEqual(original);
      });

      it('should handle empty array', () => {
        // ACT
        const result = shuffle([]);
        
        // ASSERT
        expect(result).toEqual([]);
      });

      it('should handle single element', () => {
        // ACT
        const result = shuffle([1]);
        
        // ASSERT
        expect(result).toEqual([1]);
      });

      it('should actually randomize (statistical test)', () => {
        // ARRANGE
        const arr = [1, 2, 3, 4, 5];
        let different = false;
        
        // ACT - Try multiple times
        for (let i = 0; i < 10; i++) {
          const result = shuffle(arr);
          if (JSON.stringify(result) !== JSON.stringify(arr)) {
            different = true;
            break;
          }
        }
        
        // ASSERT
        expect(different).toBe(true);
      });
    });

    describe('unique', () => {
      it('should remove duplicate numbers', () => {
        // ACT
        const result = unique([1, 2, 2, 3]);
        
        // ASSERT
        expect(result).toEqual([1, 2, 3]);
      });

      it('should remove duplicate strings', () => {
        // ACT
        const result = unique(['a', 'b', 'a']);
        
        // ASSERT
        expect(result).toEqual(['a', 'b']);
      });

      it('should handle empty array', () => {
        // ACT
        const result = unique([]);
        
        // ASSERT
        expect(result).toEqual([]);
      });

      it('should handle array with no duplicates', () => {
        // ACT
        const result = unique([1, 2, 3]);
        
        // ASSERT
        expect(result).toEqual([1, 2, 3]);
      });

      it('should preserve order of first occurrence', () => {
        // ACT
        const result = unique([3, 1, 2, 1, 3]);
        
        // ASSERT
        expect(result).toEqual([3, 1, 2]);
      });
    });

    describe('groupBy', () => {
      it('should group objects by key function', () => {
        // ARRANGE
        const items = [
          { type: 'a', val: 1 },
          { type: 'b', val: 2 },
          { type: 'a', val: 3 }
        ];
        
        // ACT
        const result = groupBy(items, item => item.type);
        
        // ASSERT
        expect(result).toEqual({
          a: [{ type: 'a', val: 1 }, { type: 'a', val: 3 }],
          b: [{ type: 'b', val: 2 }]
        });
      });

      it('should handle empty array', () => {
        // ACT
        const result = groupBy([], item => item);
        
        // ASSERT
        expect(result).toEqual({});
      });
    });

    describe('chunk', () => {
      it('should split array into chunks', () => {
        // ACT
        const result = chunk([1, 2, 3, 4, 5], 2);
        
        // ASSERT
        expect(result).toEqual([[1, 2], [3, 4], [5]]);
      });

      it('should handle chunk size larger than array', () => {
        // ACT
        const result = chunk([1, 2], 3);
        
        // ASSERT
        expect(result).toEqual([[1, 2]]);
      });

      it('should handle empty array', () => {
        // ACT
        const result = chunk([], 2);
        
        // ASSERT
        expect(result).toEqual([]);
      });

      it('should throw error on size ≤ 0', () => {
        // ACT & ASSERT
        expect(() => chunk([1, 2], 0)).toThrow();
        expect(() => chunk([1, 2], -1)).toThrow();
      });

      it('should handle size = 1', () => {
        // ACT
        const result = chunk([1, 2, 3], 1);
        
        // ASSERT
        expect(result).toEqual([[1], [2], [3]]);
      });
    });
  });

  describe('Object Utilities', () => {
    describe('deepClone', () => {
      it('should clone simple object', () => {
        // ARRANGE
        const obj = { a: 1, b: 2 };
        
        // ACT
        const result = deepClone(obj);
        
        // ASSERT
        expect(result).toEqual(obj);
        expect(result).not.toBe(obj);
      });

      it('should clone nested objects', () => {
        // ARRANGE
        const obj = { a: 1, b: { c: 2 } };
        
        // ACT
        const result = deepClone(obj);
        
        // ASSERT
        expect(result).toEqual(obj);
        expect(result.b).not.toBe(obj.b);
      });

      it('should clone arrays', () => {
        // ARRANGE
        const arr = [1, 2, 3];
        
        // ACT
        const result = deepClone(arr);
        
        // ASSERT
        expect(result).toEqual(arr);
        expect(result).not.toBe(arr);
      });

      it('should create independent copy', () => {
        // ARRANGE
        const obj = { a: 1, b: { c: 2 } };
        
        // ACT
        const result = deepClone(obj);
        result.b.c = 999;
        
        // ASSERT
        expect(obj.b.c).toBe(2); // Original unchanged
      });
    });

    describe('pick', () => {
      it('should pick specified keys', () => {
        // ARRANGE
        const obj = { a: 1, b: 2, c: 3 };
        
        // ACT
        const result = pick(obj, ['a', 'c']);
        
        // ASSERT
        expect(result).toEqual({ a: 1, c: 3 });
      });

      it('should return empty object for non-existent keys', () => {
        // ARRANGE
        const obj = { a: 1 };
        
        // ACT
        const result = pick(obj, ['b'] as any);
        
        // ASSERT
        expect(result).toEqual({});
      });
    });

    describe('omit', () => {
      it('should omit specified keys', () => {
        // ARRANGE
        const obj = { a: 1, b: 2, c: 3 };
        
        // ACT
        const result = omit(obj, ['b']);
        
        // ASSERT
        expect(result).toEqual({ a: 1, c: 3 });
      });

      it('should return original if omitting non-existent keys', () => {
        // ARRANGE
        const obj = { a: 1 };
        
        // ACT
        const result = omit(obj, ['b'] as any);
        
        // ASSERT
        expect(result).toEqual({ a: 1 });
      });
    });
  });

  describe('Validation Utilities', () => {
    describe('isValidEmail', () => {
      it('should validate correct email', () => {
        // ACT
        const result = isValidEmail('test@example.com');
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should invalidate incorrect email', () => {
        // ACT
        const result = isValidEmail('invalid');
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should invalidate email without domain', () => {
        // ACT
        const result = isValidEmail('test@');
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should invalidate email without @', () => {
        // ACT
        const result = isValidEmail('testexample.com');
        
        // ASSERT
        expect(result).toBe(false);
      });
    });

    describe('isInRange', () => {
      it('should return true for value in range', () => {
        // ACT
        const result = isInRange(5, 1, 10);
        
        // ASSERT
        expect(result).toBe(true);
      });

      it('should return false for value below range', () => {
        // ACT
        const result = isInRange(0, 1, 10);
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should return false for value above range', () => {
        // ACT
        const result = isInRange(11, 1, 10);
        
        // ASSERT
        expect(result).toBe(false);
      });

      it('should handle inclusive boundaries (default)', () => {
        // ACT
        const resultMin = isInRange(1, 1, 10);
        const resultMax = isInRange(10, 1, 10);
        
        // ASSERT
        expect(resultMin).toBe(true);
        expect(resultMax).toBe(true);
      });

      it('should handle exclusive boundaries', () => {
        // ACT
        const resultMin = isInRange(1, 1, 10, false);
        const resultMax = isInRange(10, 1, 10, false);
        
        // ASSERT
        expect(resultMin).toBe(false);
        expect(resultMax).toBe(false);
      });
    });

    describe('isEmpty', () => {
      it('should return true for empty string', () => {
        expect(isEmpty('')).toBe(true);
      });

      it('should return true for empty array', () => {
        expect(isEmpty([])).toBe(true);
      });

      it('should return true for empty object', () => {
        expect(isEmpty({})).toBe(true);
      });

      it('should return true for null', () => {
        expect(isEmpty(null)).toBe(true);
      });

      it('should return true for undefined', () => {
        expect(isEmpty(undefined)).toBe(true);
      });

      it('should return false for 0', () => {
        expect(isEmpty(0)).toBe(false);
      });

      it('should return false for non-empty string', () => {
        expect(isEmpty('text')).toBe(false);
      });

      it('should return false for non-empty array', () => {
        expect(isEmpty([1])).toBe(false);
      });
    });
  });

  describe('Time Utilities', () => {
    describe('sleep', () => {
      it('should resolve after specified delay', async () => {
        // ARRANGE
        const start = Date.now();
        
        // ACT
        await sleep(100);
        const elapsed = Date.now() - start;
        
        // ASSERT
        expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some variance
      });

      it('should return Promise<void>', async () => {
        // ACT
        const result = sleep(10);
        
        // ASSERT
        expect(result).toBeInstanceOf(Promise);
        await result;
      });
    });

    describe('formatDuration', () => {
      it('should format 1000ms as "1s"', () => {
        expect(formatDuration(1000)).toBe('1s');
      });

      it('should format 60000ms as "1m"', () => {
        expect(formatDuration(60000)).toBe('1m');
      });

      it('should format 3600000ms as "1h"', () => {
        expect(formatDuration(3600000)).toBe('1h');
      });

      it('should format complex duration', () => {
        expect(formatDuration(3661000)).toContain('1h');
        expect(formatDuration(3661000)).toContain('1m');
        expect(formatDuration(3661000)).toContain('1s');
      });

      it('should format small durations in ms', () => {
        expect(formatDuration(500)).toBe('500ms');
      });

      it('should format 0ms', () => {
        expect(formatDuration(0)).toBe('0ms');
      });
    });
  });

  describe('Random Utilities', () => {
    describe('randomInt', () => {
      it('should return integer in range', () => {
        // ACT
        const result = randomInt(1, 6);
        
        // ASSERT
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
        expect(Number.isInteger(result)).toBe(true);
      });

      it('should handle min = max', () => {
        // ACT
        const result = randomInt(5, 5);
        
        // ASSERT
        expect(result).toBe(5);
      });

      it('should have reasonable distribution (statistical)', () => {
        // ARRANGE
        const results = new Set<number>();
        
        // ACT - Generate 100 random numbers
        for (let i = 0; i < 100; i++) {
          results.add(randomInt(1, 10));
        }
        
        // ASSERT - Should see multiple different values
        expect(results.size).toBeGreaterThan(5);
      });
    });

    describe('randomElement', () => {
      it('should return element from array', () => {
        // ARRANGE
        const arr = [1, 2, 3];
        
        // ACT
        const result = randomElement(arr);
        
        // ASSERT
        expect(arr).toContain(result);
      });

      it('should throw on empty array', () => {
        // ACT & ASSERT
        expect(() => randomElement([])).toThrow();
      });

      it('should return single element for single-element array', () => {
        // ACT
        const result = randomElement([42]);
        
        // ASSERT
        expect(result).toBe(42);
      });
    });

    describe('randomBoolean', () => {
      it('should return boolean', () => {
        // ACT
        const result = randomBoolean();
        
        // ASSERT
        expect(typeof result).toBe('boolean');
      });

      it('should always return false for probability 0', () => {
        // ACT
        const results = Array.from({ length: 10 }, () => randomBoolean(0));
        
        // ASSERT
        expect(results.every(r => r === false)).toBe(true);
      });

      it('should always return true for probability 1', () => {
        // ACT
        const results = Array.from({ length: 10 }, () => randomBoolean(1));
        
        // ASSERT
        expect(results.every(r => r === true)).toBe(true);
      });

      it('should have reasonable distribution for 0.5 (statistical)', () => {
        // ARRANGE
        let trueCount = 0;
        const iterations = 100;
        
        // ACT
        for (let i = 0; i < iterations; i++) {
          if (randomBoolean(0.5)) trueCount++;
        }
        
        // ASSERT - Should be roughly 50% (allow 30-70% range)
        expect(trueCount).toBeGreaterThan(30);
        expect(trueCount).toBeLessThan(70);
      });
    });
  });

  describe('Debounce/Throttle', () => {
    describe('debounce', () => {
      it('should delay function execution', async () => {
        // ARRANGE
        const fn = jest.fn();
        const debounced = debounce(fn, 100);
        
        // ACT
        debounced();
        expect(fn).not.toHaveBeenCalled();
        
        await sleep(150);
        
        // ASSERT
        expect(fn).toHaveBeenCalledTimes(1);
      });

      it('should cancel previous pending calls', async () => {
        // ARRANGE
        const fn = jest.fn();
        const debounced = debounce(fn, 100);
        
        // ACT
        debounced();
        debounced();
        debounced();
        
        await sleep(150);
        
        // ASSERT
        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    describe('throttle', () => {
      it('should limit execution frequency', async () => {
        // ARRANGE
        const fn = jest.fn();
        const throttled = throttle(fn, 100);
        
        // ACT
        throttled();
        throttled();
        throttled();
        
        // ASSERT
        expect(fn).toHaveBeenCalledTimes(1);
        
        await sleep(150);
        throttled();
        expect(fn).toHaveBeenCalledTimes(2);
      });
    });
  });
});
```

# DELIVERABLES

## 1. Complete Test Suite
- Full test implementation for all helper functions
- Number formatting tested
- String utilities tested
- Array utilities tested
- Object utilities tested
- Validation utilities tested
- Time utilities tested
- Random utilities tested (with statistical tests)
- Debounce/throttle tested
- Edge cases covered

## 2. Coverage Matrix

| Component | Method/Feature | Normal Cases | Edge Cases | Exceptions | Total |
|-----------|---------------|--------------|------------|------------|-------|
| formatNumber | Formatting | 5 | 1 | 0 | 6 |
| formatMoney | Formatting | 4 | 0 | 0 | 4 |
| formatScore | Formatting | 3 | 0 | 0 | 3 |
| abbreviateNumber | Abbreviation | 7 | 0 | 0 | 7 |
| capitalize | Capitalization | 5 | 0 | 0 | 5 |
| pluralize | Pluralization | 4 | 0 | 0 | 4 |
| truncate | Truncation | 4 | 0 | 0 | 4 |
| shuffle | Shuffling | 5 | 0 | 0 | 5 |
| unique | Deduplication | 5 | 0 | 0 | 5 |
| groupBy | Grouping | 2 | 0 | 0 | 2 |
| chunk | Chunking | 4 | 0 | 1 | 5 |
| deepClone | Cloning | 4 | 0 | 0 | 4 |
| pick | Selection | 2 | 0 | 0 | 2 |
| omit | Exclusion | 2 | 0 | 0 | 2 |
| isValidEmail | Validation | 4 | 0 | 0 | 4 |
| isInRange | Range check | 5 | 0 | 0 | 5 |
| isEmpty | Empty check | 8 | 0 | 0 | 8 |
| sleep | Async delay | 2 | 0 | 0 | 2 |
| formatDuration | Duration format | 6 | 0 | 0 | 6 |
| randomInt | Random gen | 3 | 0 | 0 | 3 |
| randomElement | Random select | 2 | 0 | 1 | 3 |
| randomBoolean | Random bool | 4 | 0 | 0 | 4 |
| debounce | Timing control | 2 | 0 | 0 | 2 |
| throttle | Timing control | 1 | 0 | 0 | 1 |
| **TOTAL** | | | | | **96** |

## 3. Expected Coverage
- Estimated line coverage: **95%**
- Estimated branch coverage: **90%**
- Functions covered: **All exported functions** (100%)
- Uncovered scenarios:
  - Some edge cases in randomization (statistical variance)
  - Browser-specific APIs (clipboard, download)

## 4. Execution Instructions
```bash
# Run tests
npm test -- tests/unit/utils/helpers.test.ts

# Run with coverage
npm test -- --coverage tests/unit/utils/helpers.test.ts

# Run in watch mode
npm test -- --watch tests/unit/utils/helpers.test.ts

# Run specific sections
npm test -- -t "Number Formatting" tests/unit/utils/helpers.test.ts
npm test -- -t "Random Utilities" tests/unit/utils/helpers.test.ts
```

# SPECIAL CASES TO CONSIDER
- **Pure functions:** All helpers should be pure (no side effects)
- **Statistical tests:** Random functions need multiple iterations
- **Async functions:** sleep, debounce, throttle need async/await
- **Type safety:** TypeScript generics preserved
- **Immutability:** Functions that return arrays/objects create new instances
- **Edge case handling:** Empty arrays, null values, negative numbers
- **Performance:** Shuffle uses Fisher-Yates (O(n))
- **Precision:** Floating point arithmetic in abbreviateNumber

# ADDITIONAL TEST DATA HELPERS

```typescript
// Helper to test randomness statistically
function testRandomDistribution(
  fn: () => number,
  expectedMin: number,
  expectedMax: number,
  iterations = 100
): void {
  const results: number[] = [];
  for (let i = 0; i < iterations; i++) {
    results.push(fn());
  }
  
  const min = Math.min(...results);
  const max = Math.max(...results);
  
  expect(min).toBeGreaterThanOrEqual(expectedMin);
  expect(max).toBeLessThanOrEqual(expectedMax);
}

// Helper to measure execution time
async function measureExecutionTime(fn: () => Promise<void>): Promise<number> {
  const start = Date.now();
  await fn();
  return Date.now() - start;
}
```