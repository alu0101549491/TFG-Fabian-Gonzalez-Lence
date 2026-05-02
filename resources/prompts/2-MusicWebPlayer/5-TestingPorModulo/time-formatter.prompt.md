# TESTING PROMPT #5.1: `src/utils/time-formatter.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** TimeFormatter Utility Class

**File path:** `src/utils/time-formatter.ts`

**Test file path:** `tests/utils/time-formatter.test.ts`

**Testing framework:** Jest, TS-Jest

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Utilities/TimeFormatter
 * @category Utilities
 * @description
 * This module provides utility functions for formatting and parsing time values
 * in the Music Web Player application. It handles conversion between seconds
 * and MM:SS formatted strings for display in the UI.
 */

// Maximum displayable time in seconds (99:59)
const MAX_DISPLAYABLE_SECONDS = 5999;

/**
 * Utility class for formatting and parsing time values.
 * All methods are static and pure functions with no side effects.
 */
export class TimeFormatter {
  /**
   * Converts a time value in seconds to MM:SS format.
   * @param seconds - Time value in seconds (can be decimal)
   * @returns Formatted time string in MM:SS format
   * @example
   * TimeFormatter.formatTime(0)     // "00:00"
   * TimeFormatter.formatTime(45)    // "00:45"
   * TimeFormatter.formatTime(90)    // "01:30"
   * TimeFormatter.formatTime(165)   // "02:45"
   * TimeFormatter.formatTime(3599)  // "59:59"
   * TimeFormatter.formatTime(3600)  // "60:00" (1 hour)
   * TimeFormatter.formatTime(-10)   // "00:00" (negative treated as 0)
   * TimeFormatter.formatTime(NaN)   // "00:00"
   * TimeFormatter.formatTime(Infinity) // "99:59" (max displayable)
   */
  public static formatTime(seconds: number): string {
    // Handle edge cases
    if (isNaN(seconds) || seconds < 0) {
      return "00:00";
    }

    if (!isFinite(seconds)) {
      // Infinity => show maximum displayable time
      return `${this.padZero(Math.floor(MAX_DISPLAYABLE_SECONDS / 60))}:${this.padZero(MAX_DISPLAYABLE_SECONDS % 60)}`;
    }

    // Convert to integer and handle negative values
    const totalSeconds = Math.max(0, Math.floor(seconds));

    // Cap at maximum displayable value
    const displaySeconds = Math.min(totalSeconds, MAX_DISPLAYABLE_SECONDS);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(displaySeconds / 60);
    const remainingSeconds = displaySeconds % 60;

    // Format with zero-padding
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  }

  /**
   * Converts a MM:SS formatted string back to seconds.
   * @param formatted - Time string in MM:SS format
   * @returns Time value in seconds, or 0 for invalid input
   * @example
   * TimeFormatter.parseTime("00:00")  // 0
   * TimeFormatter.parseTime("00:45")  // 45
   * TimeFormatter.parseTime("01:30")  // 90
   * TimeFormatter.parseTime("02:45")  // 165
   * TimeFormatter.parseTime("abc")    // 0 (invalid format)
   * TimeFormatter.parseTime("")       // 0 (empty string)
   */
  public static parseTime(formatted: string): number {
    if (!formatted || typeof formatted !== 'string') {
      return 0;
    }

    const parts = formatted.split(':');
    if (parts.length !== 2) {
      return 0;
    }

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    // Validate that both parts are valid numbers
    if (isNaN(minutes) || isNaN(seconds)) {
      return 0;
    }

    return (minutes * 60) + seconds;
  }

  /**
   * Adds leading zero to single-digit numbers.
   * @param num - Numeric value to pad (0-99)
   * @returns Zero-padded string
   * @private
   */
  private static padZero(num: number): string {
    // Handle edge cases (negative, decimal, etc.)
    const integerNum = Math.abs(Math.floor(num));
    return integerNum < 10 ? `0${integerNum}` : `${integerNum}`;
  }
}
```

---

## JEST CONFIGURATION
```json
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg|mp3|wav)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

---

## JEST SETUP
```typescript
// Setup file for Jest with React Testing Library
require('@testing-library/jest-dom');

// Mock HTMLMediaElement (Audio API)
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.addEventListener = jest.fn();
window.HTMLMediaElement.prototype.removeEventListener = jest.fn();

Object.defineProperty(window.HTMLMediaElement.prototype, 'currentTime', {
  get: jest.fn(() => 0),
  set: jest.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
  get: jest.fn(() => 0),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

---

## TYPESCRIPT CONFIGURATION
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
    "forceConsistentCasingInFileNames": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@data/*": ["src/data/*"],
      "@styles/*": ["src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## REQUIREMENTS SPECIFICATION

### From Code Review #4 + Actual Implementation:

**Component Objective:**
Static utility class for converting between seconds (number) and MM:SS format (string). Provides formatTime to convert seconds to display format, parseTime to convert MM:SS back to seconds, and padZero private helper for zero-padding. All methods are static and pure functions.

**Requirements:**
- **FR10-FR11:** Display elapsed time and total duration in MM:SS format
- **NFR5:** Static typing with TypeScript
- **NFR7:** Pure functions without side effects
- **NFR10:** Reusable utility functions

**Implementation Details:**

**Constants:**
- `MAX_DISPLAYABLE_SECONDS = 5999` (equivalent to 99:59)

**Methods:**

1. **formatTime(seconds: number): string**
   - Handles NaN → returns "00:00"
   - Handles negative numbers → returns "00:00"
   - Handles Infinity → returns "99:59" (MAX_DISPLAYABLE_SECONDS)
   - Floors decimal values (65.9 → 65)
   - Caps at MAX_DISPLAYABLE_SECONDS (5999)
   - Returns MM:SS format with zero-padding
   - Hours displayed as extra minutes (3600s → "60:00")

2. **parseTime(formatted: string): number**
   - Handles empty string → returns 0
   - Handles non-string input → returns 0
   - Validates format (must have exactly one colon)
   - Validates both parts are valid numbers
   - Returns total seconds (minutes * 60 + seconds)
   - Invalid input → returns 0

3. **padZero(num: number): string** (private)
   - Handles negative → uses Math.abs
   - Handles decimal → uses Math.floor
   - Single digit (0-9) → adds leading zero
   - Double digit+ (10+) → no padding
   - Returns string representation

**Edge Case Behavior (from implementation):**
- `formatTime(NaN)` → `"00:00"`
- `formatTime(-10)` → `"00:00"`
- `formatTime(Infinity)` → `"99:59"`
- `formatTime(-Infinity)` → `"00:00"`
- `formatTime(6000)` → `"99:59"` (capped at MAX)
- `formatTime(65.9)` → `"01:05"` (floors to 65)
- `parseTime(null)` → `0` (falsy check)
- `parseTime("")` → `0`
- `parseTime("1:2:3")` → `0` (too many colons)
- `parseTime("abc")` → `0` (invalid format)
- `padZero(-5)` → `"05"` (absolute value)
- `padZero(5.7)` → `"05"` (floored)

---

## USE CASE DIAGRAM

```
TimeFormatter Utility Class
├── formatTime(seconds: number)
│   ├── Validates input (NaN, negative, Infinity)
│   ├── Floors decimal values
│   ├── Caps at MAX_DISPLAYABLE_SECONDS (5999)
│   ├── Calculates minutes and seconds
│   ├── Uses padZero for formatting
│   └── Returns "MM:SS" string
│
├── parseTime(formatted: string)
│   ├── Validates input type and emptiness
│   ├── Splits by colon
│   ├── Validates part count (must be 2)
│   ├── Parses integers with parseInt
│   ├── Validates both are numbers
│   └── Returns total seconds
│
└── padZero(num: number) [private]
    ├── Takes absolute value
    ├── Floors to integer
    ├── Adds leading zero if < 10
    └── Returns string
```

---

## TASK

Generate a complete unit test suite for the **TimeFormatter utility class** that covers:

### 1. FORMATTIME - NORMAL CASES
- Zero seconds: `formatTime(0)` → `"00:00"`
- Single digit seconds: `formatTime(5)` → `"00:05"`
- Double digit seconds: `formatTime(45)` → `"00:45"`
- Exactly one minute: `formatTime(60)` → `"01:00"`
- Minutes and seconds: `formatTime(65)` → `"01:05"`
- Multiple minutes: `formatTime(125)` → `"02:05"`
- Common durations: 180s, 240s, 300s
- Hours as minutes: `formatTime(3600)` → `"60:00"`
- Maximum display: `formatTime(5999)` → `"99:59"`

### 2. FORMATTIME - EDGE CASES
- NaN input: `formatTime(NaN)` → `"00:00"`
- Negative numbers: `formatTime(-10)` → `"00:00"`
- Positive Infinity: `formatTime(Infinity)` → `"99:59"`
- Negative Infinity: `formatTime(-Infinity)` → `"00:00"`
- Decimal values: `formatTime(65.9)` → `"01:05"` (floored)
- Over maximum: `formatTime(6000)` → `"99:59"` (capped)
- Very large numbers: `formatTime(100000)` → `"99:59"`

### 3. PARSETIME - NORMAL CASES
- Zero time: `parseTime("00:00")` → `0`
- Seconds only: `parseTime("00:30")` → `30`
- One minute: `parseTime("01:00")` → `60`
- Minutes and seconds: `parseTime("01:30")` → `90`
- Multiple minutes: `parseTime("02:05")` → `125`
- Large values: `parseTime("99:59")` → `5999`
- Single digit minutes: `parseTime("1:30")` → `90`
- Leading zeros: `parseTime("01:05")` → `65`

### 4. PARSETIME - EDGE CASES
- Empty string: `parseTime("")` → `0`
- null input: `parseTime(null as any)` → `0`
- undefined input: `parseTime(undefined as any)` → `0`
- Non-string input: `parseTime(123 as any)` → `0`
- No colon: `parseTime("130")` → `0`
- Too many colons: `parseTime("1:30:00")` → `0`
- Invalid characters: `parseTime("ab:cd")` → `0`
- Partial invalid: `parseTime("1a:30")` → `0`
- Whitespace: `parseTime(" 01:30 ")` → Test behavior (likely 0)

### 5. PADZERO - NORMAL CASES (via formatTime)
- Zero: produces "00"
- Single digit: 5 produces "05"
- Double digit: 59 produces "59"
- Verify via formatTime output format

### 6. PADZERO - EDGE CASES (via formatTime or direct if accessible)
- Negative: padZero(-5) should produce "05" (absolute)
- Decimal: padZero(5.7) should produce "05" (floored)
- Large number: padZero(100) should produce "100" (no padding)

### 7. INTEGRATION TESTS
- Round-trip: `parseTime(formatTime(65))` → `65`
- Round-trip: `formatTime(parseTime("01:05"))` → `"01:05"`
- Multiple round-trips maintain values
- Verify formatTime uses padZero correctly (all outputs are MM:SS)

### 8. CLASS STRUCTURE TESTS
- TimeFormatter is a class
- All methods are static
- No instance creation needed
- Methods accessible via `TimeFormatter.methodName()`

### 9. PURITY TESTS
- Same input always produces same output
- No side effects (no console logs)
- No state changes
- Deterministic behavior

### 10. BOUNDARY VALUE TESTS
- Exactly at maximum: `formatTime(5999)` → `"99:59"`
- Just over maximum: `formatTime(6000)` → `"99:59"`
- At zero boundary: `formatTime(0)` → `"00:00"`
- Just below zero: `formatTime(-1)` → `"00:00"`

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { TimeFormatter } from '@/utils/time-formatter';

describe('TimeFormatter Utility Class', () => {
  describe('Class Structure', () => {
    it('should be a class with static methods', () => {
      expect(TimeFormatter).toBeDefined();
      expect(typeof TimeFormatter.formatTime).toBe('function');
      expect(typeof TimeFormatter.parseTime).toBe('function');
    });

    it('should not require instantiation', () => {
      // Methods should be callable without new TimeFormatter()
      expect(() => TimeFormatter.formatTime(0)).not.toThrow();
      expect(() => TimeFormatter.parseTime("00:00")).not.toThrow();
    });
  });

  describe('formatTime', () => {
    describe('Normal Cases', () => {
      it('should format zero seconds as "00:00"', () => {
        expect(TimeFormatter.formatTime(0)).toBe('00:00');
      });

      it('should format single digit seconds with leading zero', () => {
        expect(TimeFormatter.formatTime(5)).toBe('00:05');
        expect(TimeFormatter.formatTime(9)).toBe('00:09');
      });

      it('should format double digit seconds', () => {
        expect(TimeFormatter.formatTime(45)).toBe('00:45');
        expect(TimeFormatter.formatTime(59)).toBe('00:59');
      });

      it('should format exactly one minute as "01:00"', () => {
        expect(TimeFormatter.formatTime(60)).toBe('01:00');
      });

      it('should format minutes and seconds correctly', () => {
        expect(TimeFormatter.formatTime(65)).toBe('01:05');
        expect(TimeFormatter.formatTime(90)).toBe('01:30');
        expect(TimeFormatter.formatTime(125)).toBe('02:05');
      });

      it('should format multiple minutes correctly', () => {
        expect(TimeFormatter.formatTime(120)).toBe('02:00');
        expect(TimeFormatter.formatTime(180)).toBe('03:00');
        expect(TimeFormatter.formatTime(240)).toBe('04:00');
        expect(TimeFormatter.formatTime(300)).toBe('05:00');
      });

      it('should format common song durations', () => {
        expect(TimeFormatter.formatTime(195)).toBe('03:15');
        expect(TimeFormatter.formatTime(243)).toBe('04:03');
        expect(TimeFormatter.formatTime(301)).toBe('05:01');
      });

      it('should handle values over 59 minutes (hours as minutes)', () => {
        expect(TimeFormatter.formatTime(3600)).toBe('60:00'); // 1 hour
        expect(TimeFormatter.formatTime(3661)).toBe('61:01'); // 1h 1m 1s
      });

      it('should format maximum displayable time correctly', () => {
        expect(TimeFormatter.formatTime(5999)).toBe('99:59');
      });
    });

    describe('Edge Cases', () => {
      it('should handle NaN by returning "00:00"', () => {
        expect(TimeFormatter.formatTime(NaN)).toBe('00:00');
      });

      it('should handle negative numbers by returning "00:00"', () => {
        expect(TimeFormatter.formatTime(-1)).toBe('00:00');
        expect(TimeFormatter.formatTime(-10)).toBe('00:00');
        expect(TimeFormatter.formatTime(-100)).toBe('00:00');
      });

      it('should handle Infinity by returning maximum displayable time "99:59"', () => {
        expect(TimeFormatter.formatTime(Infinity)).toBe('99:59');
      });

      it('should handle negative Infinity by returning "00:00"', () => {
        expect(TimeFormatter.formatTime(-Infinity)).toBe('00:00');
      });

      it('should floor decimal seconds', () => {
        expect(TimeFormatter.formatTime(65.1)).toBe('01:05');
        expect(TimeFormatter.formatTime(65.5)).toBe('01:05');
        expect(TimeFormatter.formatTime(65.9)).toBe('01:05');
      });

      it('should cap values at maximum displayable seconds (5999)', () => {
        expect(TimeFormatter.formatTime(6000)).toBe('99:59');
        expect(TimeFormatter.formatTime(10000)).toBe('99:59');
        expect(TimeFormatter.formatTime(100000)).toBe('99:59');
      });
    });

    describe('Boundary Values', () => {
      it('should handle exactly at maximum (5999)', () => {
        expect(TimeFormatter.formatTime(5999)).toBe('99:59');
      });

      it('should handle just over maximum (6000)', () => {
        expect(TimeFormatter.formatTime(6000)).toBe('99:59');
      });

      it('should handle exactly at zero', () => {
        expect(TimeFormatter.formatTime(0)).toBe('00:00');
      });

      it('should handle just below zero', () => {
        expect(TimeFormatter.formatTime(-0.1)).toBe('00:00');
      });
    });

    describe('Format Validation', () => {
      it('should always return MM:SS format (5 characters with colon)', () => {
        const testCases = [0, 5, 65, 125, 3600, 5999];
        
        testCases.forEach(seconds => {
          const result = TimeFormatter.formatTime(seconds);
          expect(result).toMatch(/^\d{2}:\d{2}$/);
          expect(result).toHaveLength(5);
        });
      });

      it('should always have exactly one colon', () => {
        expect(TimeFormatter.formatTime(65).split(':')).toHaveLength(2);
      });

      it('should have zero-padded components', () => {
        const result = TimeFormatter.formatTime(5);
        const [minutes, seconds] = result.split(':');
        expect(minutes).toHaveLength(2);
        expect(seconds).toHaveLength(2);
      });
    });
  });

  describe('parseTime', () => {
    describe('Normal Cases', () => {
      it('should parse "00:00" as 0 seconds', () => {
        expect(TimeFormatter.parseTime('00:00')).toBe(0);
      });

      it('should parse seconds correctly', () => {
        expect(TimeFormatter.parseTime('00:30')).toBe(30);
        expect(TimeFormatter.parseTime('00:45')).toBe(45);
        expect(TimeFormatter.parseTime('00:59')).toBe(59);
      });

      it('should parse minutes and seconds correctly', () => {
        expect(TimeFormatter.parseTime('01:00')).toBe(60);
        expect(TimeFormatter.parseTime('01:30')).toBe(90);
        expect(TimeFormatter.parseTime('02:05')).toBe(125);
      });

      it('should parse single digit minutes', () => {
        expect(TimeFormatter.parseTime('1:00')).toBe(60);
        expect(TimeFormatter.parseTime('1:30')).toBe(90);
        expect(TimeFormatter.parseTime('5:45')).toBe(345);
      });

      it('should parse large minute values', () => {
        expect(TimeFormatter.parseTime('60:00')).toBe(3600);
        expect(TimeFormatter.parseTime('99:59')).toBe(5999);
      });

      it('should handle leading zeros', () => {
        expect(TimeFormatter.parseTime('01:05')).toBe(65);
        expect(TimeFormatter.parseTime('05:00')).toBe(300);
        expect(TimeFormatter.parseTime('00:09')).toBe(9);
      });
    });

    describe('Edge Cases', () => {
      it('should return 0 for empty string', () => {
        expect(TimeFormatter.parseTime('')).toBe(0);
      });

      it('should return 0 for null input', () => {
        expect(TimeFormatter.parseTime(null as any)).toBe(0);
      });

      it('should return 0 for undefined input', () => {
        expect(TimeFormatter.parseTime(undefined as any)).toBe(0);
      });

      it('should return 0 for non-string input', () => {
        expect(TimeFormatter.parseTime(123 as any)).toBe(0);
        expect(TimeFormatter.parseTime({} as any)).toBe(0);
        expect(TimeFormatter.parseTime([] as any)).toBe(0);
      });

      it('should return 0 for string without colon', () => {
        expect(TimeFormatter.parseTime('130')).toBe(0);
        expect(TimeFormatter.parseTime('abc')).toBe(0);
      });

      it('should return 0 for string with too many colons', () => {
        expect(TimeFormatter.parseTime('1:30:00')).toBe(0);
        expect(TimeFormatter.parseTime('1:2:3:4')).toBe(0);
      });

      it('should return 0 for invalid number characters', () => {
        expect(TimeFormatter.parseTime('ab:cd')).toBe(0);
        expect(TimeFormatter.parseTime('1a:30')).toBe(0);
        expect(TimeFormatter.parseTime('01:3b')).toBe(0);
      });

      it('should handle whitespace in string', () => {
        // Implementation splits by ':', so whitespace will cause parseInt to fail
        expect(TimeFormatter.parseTime(' 01:30')).toBe(0);
        expect(TimeFormatter.parseTime('01:30 ')).toBe(0);
        expect(TimeFormatter.parseTime(' 01:30 ')).toBe(0);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should be inverse operations: formatTime and parseTime', () => {
      const testCases = [0, 30, 60, 90, 125, 180, 300, 3661];

      testCases.forEach(seconds => {
        const formatted = TimeFormatter.formatTime(seconds);
        const parsed = TimeFormatter.parseTime(formatted);
        expect(parsed).toBe(seconds);
      });
    });

    it('should maintain values in round-trip conversion', () => {
      const timeStrings = ['00:00', '00:30', '01:30', '02:05', '10:45', '99:59'];

      timeStrings.forEach(timeString => {
        const parsed = TimeFormatter.parseTime(timeString);
        const formatted = TimeFormatter.formatTime(parsed);
        expect(formatted).toBe(timeString);
      });
    });

    it('should handle round-trip for maximum displayable time', () => {
      const maxTime = '99:59';
      const parsed = TimeFormatter.parseTime(maxTime);
      expect(parsed).toBe(5999);
      
      const formatted = TimeFormatter.formatTime(parsed);
      expect(formatted).toBe(maxTime);
    });

    it('should handle round-trip for capped values', () => {
      // Values over max get capped to 5999
      const formatted = TimeFormatter.formatTime(6000);
      expect(formatted).toBe('99:59');
      
      const parsed = TimeFormatter.parseTime(formatted);
      expect(parsed).toBe(5999); // Not 6000!
    });
  });

  describe('Purity Tests', () => {
    it('should return same output for same input (deterministic)', () => {
      const input = 125;
      const result1 = TimeFormatter.formatTime(input);
      const result2 = TimeFormatter.formatTime(input);
      const result3 = TimeFormatter.formatTime(input);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should not have side effects', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      TimeFormatter.formatTime(60);
      TimeFormatter.parseTime('01:00');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should be pure functions (no external state dependency)', () => {
      // Call functions multiple times in different orders
      const results1 = [
        TimeFormatter.formatTime(60),
        TimeFormatter.parseTime('01:00')
      ];
      
      const results2 = [
        TimeFormatter.parseTime('01:00'),
        TimeFormatter.formatTime(60)
      ];

      expect(results1[0]).toBe(results2[1]);
      expect(results1[1]).toBe(results2[0]);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid consecutive formatTime calls efficiently', () => {
      const start = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        TimeFormatter.formatTime(i);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should handle rapid consecutive parseTime calls efficiently', () => {
      const start = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        const minutes = Math.floor(i / 60);
        const seconds = i % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        TimeFormatter.parseTime(timeString);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200); // More lenient due to string building
    });
  });

  describe('Type Safety', () => {
    it('should accept number type for formatTime', () => {
      const seconds: number = 65;
      const result: string = TimeFormatter.formatTime(seconds);
      expect(typeof result).toBe('string');
    });

    it('should accept string type for parseTime', () => {
      const timeString: string = '01:05';
      const result: number = TimeFormatter.parseTime(timeString);
      expect(typeof result).toBe('number');
    });

    it('should maintain type safety with edge case inputs', () => {
      // TypeScript should allow these at compile time
      const nanResult: string = TimeFormatter.formatTime(NaN);
      const infinityResult: string = TimeFormatter.formatTime(Infinity);
      
      expect(typeof nanResult).toBe('string');
      expect(typeof infinityResult).toBe('string');
    });
  });

  describe('padZero (indirectly via formatTime)', () => {
    it('should pad single digit seconds', () => {
      // padZero is private, test via formatTime
      const result = TimeFormatter.formatTime(5);
      expect(result).toBe('00:05'); // Seconds padded
    });

    it('should pad single digit minutes', () => {
      const result = TimeFormatter.formatTime(300); // 5 minutes
      expect(result).toBe('05:00'); // Minutes padded
    });

    it('should not pad double digit values', () => {
      const result = TimeFormatter.formatTime(665); // 11:05
      expect(result).toBe('11:05'); // No padding on 11
    });

    it('should handle large values without padding', () => {
      const result = TimeFormatter.formatTime(5999);
      expect(result).toBe('99:59'); // 99 not padded to 099
    });
  });
});
```

---

## TEST REQUIREMENTS

### Coverage Requirements:
- [ ] **Line coverage:** 100% (all lines executed)
- [ ] **Branch coverage:** 100% (all if/else paths)
- [ ] **Function coverage:** 100% (formatTime, parseTime, padZero via formatTime)
- [ ] **Edge case coverage:** All documented edge cases tested

### Assertions:
- [ ] Use `toBe()` for exact equality (strings, numbers)
- [ ] Use `toMatch()` for regex format validation
- [ ] Test both positive and negative cases
- [ ] Verify edge cases don't throw

### Specific Checks:
- [ ] formatTime handles: NaN, negative, Infinity, decimals, over-max
- [ ] parseTime handles: empty, null, undefined, invalid format
- [ ] Round-trip conversions work correctly
- [ ] Format is always MM:SS (5 chars with colon)
- [ ] padZero behavior verified via formatTime outputs

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/utils/time-formatter.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Method | Normal Cases | Edge Cases | Integration | Purity | Performance | Total Tests |
|--------|--------------|------------|-------------|--------|-------------|-------------|
| formatTime | 9 | 6 | 2 | 1 | 1 | 19 |
| parseTime | 6 | 7 | 2 | 1 | 1 | 17 |
| padZero (indirect) | 4 | - | - | - | - | 4 |
| Class Structure | 2 | - | - | - | - | 2 |
| Round-trip | - | - | 2 | - | - | 2 |
| Type Safety | 3 | - | - | - | - | 3 |
| **TOTAL** | **24** | **13** | **6** | **2** | **2** | **47** |

### 3. Expected Coverage Analysis
- **Line coverage:** 100% (all lines in all three methods)
- **Branch coverage:** 100% (all conditionals: NaN check, negative check, Infinity check, string validation, colon count, number validation)
- **Function coverage:** 100% (all 3 methods: formatTime, parseTime, padZero)
- **Edge cases:** Comprehensive (NaN, Infinity, negative, invalid strings, null, undefined)

### 4. Execution Instructions
```bash
# Run time formatter tests
npm test tests/utils/time-formatter.test.ts

# Run with coverage report
npm test -- --coverage tests/utils/time-formatter.test.ts

# Run in watch mode during development
npm test -- --watch tests/utils/time-formatter.test.ts

# Run with verbose output showing all test names
npm test -- --verbose tests/utils/time-formatter.test.ts

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html tests/utils/time-formatter.test.ts
```

---

## SPECIAL CASES TO CONSIDER

### 1. Maximum Displayable Seconds (5999)
The implementation caps at 5999 seconds (99:59):
```typescript
formatTime(5999)  → "99:59" ✓
formatTime(6000)  → "99:59" (capped) ✓
formatTime(10000) → "99:59" (capped) ✓
formatTime(Infinity) → "99:59" ✓
```

### 2. Negative Number Handling
Negative numbers return "00:00":
```typescript
formatTime(-1)   → "00:00" ✓
formatTime(-100) → "00:00" ✓
formatTime(-Infinity) → "00:00" ✓
```

### 3. Decimal Flooring
Decimals are floored (not rounded):
```typescript
formatTime(65.1) → "01:05" (not "01:06") ✓
formatTime(65.9) → "01:05" (not "01:06") ✓
```

### 4. parseTime Validation
Returns 0 for any invalid input:
```typescript
parseTime("")      → 0 ✓
parseTime(null)    → 0 ✓
parseTime("abc")   → 0 ✓
parseTime("1:2:3") → 0 ✓
```

### 5. padZero via Absolute Value
padZero takes absolute value:
```typescript
// Although formatTime catches negatives first,
// padZero itself handles negatives via Math.abs
```

### 6. Round-Trip with Capping
Values over max lose precision:
```typescript
formatTime(6000) → "99:59"
parseTime("99:59") → 5999 (not 6000!)
```

---

## ADDITIONAL NOTES

- **Static class pattern:** All methods are static, no instantiation needed
- **Private method testing:** padZero is private, test indirectly via formatTime
- **No mocking needed:** Pure utility functions, no external dependencies
- **Performance critical:** Called frequently (60fps during playback)
- **Type safety:** Test with TypeScript types (number → string, string → number)
- **Deterministic:** Same input always produces same output
- **No side effects:** No console logs, no state changes
- **MAX_DISPLAYABLE_SECONDS constant:** 5999 is the cap (99:59)
