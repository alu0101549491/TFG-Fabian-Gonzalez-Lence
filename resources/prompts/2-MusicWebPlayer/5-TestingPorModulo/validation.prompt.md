# TESTING PROMPT #3: `src/types/validation.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** ValidationResult Type Definition

**File path:** `src/types/validation.ts`

**Test file path:** `tests/types/validation.test.ts`

**Testing framework:** Jest, TS-Jest

**Target coverage:** 100% (type definitions should be fully validated)

---

## CODE TO TEST
```typescript
/**
 * @module Types/Validation
 * @category Types
 * @description
 * This module defines the validation result structure used throughout the Music Web Player application.
 * The ValidationResult interface provides a standardized way to represent the outcome of validation operations,
 * supporting both successful and failed validation scenarios with clear, actionable feedback.
 */

/**
 * Result of a validation operation.
 *
 * Provides a standardized structure for communicating validation outcomes.
 *
 * @interface ValidationResult
 * @property {boolean} isValid - True if validation passed, false if any errors.
 * @property {string[]} errors - Array of user-friendly error messages (empty when valid).
 *
 * @example
 * // Successful validation
 * const ok: ValidationResult = { isValid: true, errors: [] };
 *
 * // Failed validation
 * const fail: ValidationResult = { isValid: false, errors: ["Title is required"] };
 */
export interface ValidationResult {
  /**
   * Indicates whether the validation passed (true) or failed (false).
   * @property {boolean} isValid
   * @example true // All validation checks passed
   * @example false // One or more validation checks failed
   */
  readonly isValid: boolean;

  /**
   * Array of human-readable error messages describing validation failures.
   * @property {string[]} errors
   * @example [] // Valid case (empty array)
   * @example ["Title is required"] // Single error
   * @example ["Title is required", "Audio URL must be a valid HTTP/HTTPS URL"] // Multiple errors
   * @remarks
   * - Must be an empty array when `isValid` is `true`
   * - Must contain one or more messages when `isValid` is `false`
   * - Each message should be user-friendly, specific, and actionable
   */
  readonly errors: string[];
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

### From Code Review #3:

**Component Objective:**
Defines the structure for validation results returned by the AudioValidator utility. Contains isValid boolean flag and errors array. Used to communicate validation outcomes with clear error messages that can be displayed to users. Supports accumulating multiple validation errors rather than failing fast.

**Requirements:**
- **FR15:** Add songs to local playlist with validation
- **FR18:** Real-time playlist update after validation
- **NFR5:** Static typing for validation results
- **NFR12:** Clear user feedback about validation failures

**ValidationResult Interface Structure:**
```typescript
interface ValidationResult {
  isValid: boolean;     // True if validation passed, false otherwise
  errors: string[];     // Array of error messages (empty if valid)
}
```

**Validation Rules:**
- Both properties are **required** (not optional)
- `isValid` is boolean (true/false)
- `errors` is array of strings (can be empty)
- When `isValid` is true, `errors` should be empty array
- When `isValid` is false, `errors` should have at least one message
- Properties should have `readonly` modifiers (recommended)
- Interface must be exported

**Expected Error Messages (from AudioValidator):**
- "Title is required"
- "Artist is required"
- "Cover URL must be a valid URL"
- "Audio URL must be a valid URL"
- "Audio format must be MP3, WAV, OGG, or M4A"

**Usage Context:**
- Returned by AudioValidator.validateSong()
- Used by AddSongForm to display validation errors
- Used to determine if song can be added to playlist
- Supports accumulating multiple errors (not fail-fast)

**Usage Patterns:**
```typescript
// Valid result
{ isValid: true, errors: [] }

// Invalid result with single error
{ isValid: false, errors: ["Title is required"] }

// Invalid result with multiple errors
{ 
  isValid: false, 
  errors: [
    "Title is required",
    "Artist is required",
    "Audio URL must be a valid URL"
  ]
}
```

---

## USE CASE DIAGRAM

```
ValidationResult Type Definition
├── Used by AudioValidator
│   ├── validateSong() returns ValidationResult
│   └── Accumulates all errors before returning
│
└── Used by AddSongForm
    ├── Checks isValid before adding song
    └── Displays errors array to user
```

---

## TASK

Generate a complete unit test suite for the **ValidationResult type definition** that validates:

### 1. TYPE STRUCTURE TESTS
- Verify interface exists and is properly exported
- Verify both required properties exist
- Verify isValid is boolean type
- Verify errors is string array type
- Verify no optional properties exist
- Verify readonly modifiers (if present)

### 2. VALID RESULT TESTS
Test successful validation results:
- `isValid: true` with empty errors array
- isValid is exactly true (not truthy)
- errors is empty array (length 0)
- errors is array type (not null/undefined)

### 3. INVALID RESULT TESTS
Test failed validation results:
- `isValid: false` with single error message
- `isValid: false` with multiple error messages
- isValid is exactly false (not falsy)
- errors array contains string messages
- Multiple errors accumulated in array

### 4. ERRORS ARRAY TESTS
- Empty array when valid
- Single error string in array
- Multiple error strings in array
- Error messages are complete strings
- Array preserves error order
- Array supports standard array methods

### 5. TYPE VALIDATION TESTS
Test that TypeScript correctly:
- Accepts ValidationResult with boolean + string array
- Rejects ValidationResult with wrong types
- Accepts empty errors array
- Accepts errors array with multiple strings
- Maintains type safety for both properties

### 6. OBJECT OPERATIONS TESTS
- JSON serialization/deserialization
- Object spread operator
- Object.assign
- Array operations on errors property
- Immutability patterns

### 7. EDGE CASES
- Empty errors array vs null/undefined
- Very long error messages
- Many errors (10+ messages)
- Special characters in error messages
- Unicode in error messages
- Checking isValid for flow control

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect } from '@jest/globals';
import { ValidationResult } from '@/types/validation';

describe('ValidationResult Type Definition', () => {
  describe('Type Structure', () => {
    it('should accept valid ValidationResult with isValid true and empty errors', () => {
      // ARRANGE
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      // ASSERT
      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
    });

    it('should have isValid as boolean type', () => {
      const validResult: ValidationResult = {
        isValid: true,
        errors: []
      };

      const invalidResult: ValidationResult = {
        isValid: false,
        errors: ['Error']
      };

      expect(typeof validResult.isValid).toBe('boolean');
      expect(typeof invalidResult.isValid).toBe('boolean');
    });

    it('should have errors as string array type', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2']
      };

      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.every(e => typeof e === 'string')).toBe(true);
    });
  });

  describe('Valid Results', () => {
    it('should represent successful validation with isValid true', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      expect(result.isValid).toBe(true);
      expect(result.isValid).toStrictEqual(true); // Exactly true
    });

    it('should have empty errors array when valid', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      expect(result.errors).toEqual([]);
      expect(result.errors).toHaveLength(0);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should support checking validity for flow control', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      if (result.isValid) {
        expect(result.errors).toHaveLength(0);
      } else {
        fail('Should not reach this branch');
      }
    });
  });

  describe('Invalid Results', () => {
    it('should represent failed validation with isValid false', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required']
      };

      expect(result.isValid).toBe(false);
      expect(result.isValid).toStrictEqual(false); // Exactly false
    });

    it('should contain single error message when one validation fails', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required']
      };

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Title is required');
    });

    it('should contain multiple error messages when multiple validations fail', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'Title is required',
          'Artist is required',
          'Audio URL must be a valid URL'
        ]
      };

      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toBe('Title is required');
      expect(result.errors[1]).toBe('Artist is required');
      expect(result.errors[2]).toBe('Audio URL must be a valid URL');
    });

    it('should accumulate all validation errors', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'Title is required',
          'Artist is required',
          'Cover URL must be a valid URL',
          'Audio URL must be a valid URL',
          'Audio format must be MP3, WAV, OGG, or M4A'
        ]
      };

      expect(result.errors).toHaveLength(5);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Audio format must be MP3, WAV, OGG, or M4A');
    });
  });

  describe('Errors Array Operations', () => {
    it('should support array iteration', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2', 'Error 3']
      };

      const errorCount = result.errors.length;
      let iterationCount = 0;

      result.errors.forEach(() => {
        iterationCount++;
      });

      expect(iterationCount).toBe(errorCount);
    });

    it('should support array map operation', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required', 'Artist is required']
      };

      const prefixedErrors = result.errors.map(e => `Error: ${e}`);

      expect(prefixedErrors).toEqual([
        'Error: Title is required',
        'Error: Artist is required'
      ]);
    });

    it('should support array filter operation', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'Title is required',
          'Audio URL must be a valid URL',
          'Artist is required'
        ]
      };

      const requiredErrors = result.errors.filter(e => e.includes('required'));

      expect(requiredErrors).toHaveLength(2);
    });

    it('should preserve error order', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['First', 'Second', 'Third']
      };

      expect(result.errors[0]).toBe('First');
      expect(result.errors[1]).toBe('Second');
      expect(result.errors[2]).toBe('Third');
    });

    it('should support checking if errors exist', () => {
      const validResult: ValidationResult = {
        isValid: true,
        errors: []
      };

      const invalidResult: ValidationResult = {
        isValid: false,
        errors: ['Error']
      };

      expect(validResult.errors.length > 0).toBe(false);
      expect(invalidResult.errors.length > 0).toBe(true);
    });
  });

  describe('Object Operations', () => {
    it('should work with JSON serialization', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required', 'Artist is required']
      };

      const json = JSON.stringify(result);
      const parsed: ValidationResult = JSON.parse(json);

      expect(parsed).toEqual(result);
      expect(parsed.isValid).toBe(false);
      expect(parsed.errors).toHaveLength(2);
    });

    it('should work with object spread operator', () => {
      const baseResult: ValidationResult = {
        isValid: false,
        errors: ['Error 1']
      };

      const updatedResult: ValidationResult = {
        ...baseResult,
        errors: [...baseResult.errors, 'Error 2']
      };

      expect(updatedResult.errors).toHaveLength(2);
      expect(baseResult.errors).toHaveLength(1); // Original unchanged
    });

    it('should work with Object.assign', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      const copy = Object.assign({}, result);

      expect(copy).toEqual(result);
      expect(copy).not.toBe(result); // Different reference
    });

    it('should support immutable error array updates', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1']
      };

      // Add error immutably
      const updated: ValidationResult = {
        ...result,
        errors: [...result.errors, 'Error 2']
      };

      expect(result.errors).toHaveLength(1);
      expect(updated.errors).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should accept empty errors array', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      expect(result.errors).toEqual([]);
      expect(result.errors).not.toBeNull();
      expect(result.errors).not.toBeUndefined();
    });

    it('should accept very long error messages', () => {
      const longError = 'Error: ' + 'x'.repeat(500);
      const result: ValidationResult = {
        isValid: false,
        errors: [longError]
      };

      expect(result.errors[0].length).toBeGreaterThan(500);
    });

    it('should accept many error messages', () => {
      const manyErrors = Array.from({ length: 20 }, (_, i) => `Error ${i + 1}`);
      const result: ValidationResult = {
        isValid: false,
        errors: manyErrors
      };

      expect(result.errors).toHaveLength(20);
      expect(result.errors[0]).toBe('Error 1');
      expect(result.errors[19]).toBe('Error 20');
    });

    it('should accept special characters in error messages', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'Error with "quotes"',
          "Error with 'apostrophes'",
          'Error with symbols: @#$%^&*()'
        ]
      };

      expect(result.errors[0]).toContain('"quotes"');
      expect(result.errors[2]).toContain('@#$%');
    });

    it('should accept Unicode in error messages', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'エラー: タイトルが必要です',
          'Ошибка: требуется исполнитель',
          'Error con émojis 🚫❌'
        ]
      };

      expect(result.errors[0]).toContain('タイトル');
      expect(result.errors[1]).toContain('Ошибка');
      expect(result.errors[2]).toContain('🚫');
    });

    it('should handle result with isValid false and empty errors (edge case)', () => {
      // This is technically invalid pattern but type system allows it
      const edgeCase: ValidationResult = {
        isValid: false,
        errors: []
      };

      expect(edgeCase.isValid).toBe(false);
      expect(edgeCase.errors).toHaveLength(0);
      // Note: Business logic should prevent this, but type allows it
    });
  });

  describe('Usage Patterns', () => {
    it('should support conditional rendering pattern', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required', 'Artist is required']
      };

      const renderErrors = (validation: ValidationResult): string[] => {
        return validation.isValid ? [] : validation.errors;
      };

      expect(renderErrors(result)).toHaveLength(2);
    });

    it('should support error checking pattern', () => {
      const checkValidation = (result: ValidationResult): boolean => {
        if (!result.isValid) {
          console.log('Validation failed with errors:', result.errors);
          return false;
        }
        return true;
      };

      const validResult: ValidationResult = { isValid: true, errors: [] };
      const invalidResult: ValidationResult = {
        isValid: false,
        errors: ['Error']
      };

      expect(checkValidation(validResult)).toBe(true);
      expect(checkValidation(invalidResult)).toBe(false);
    });

    it('should support accumulation pattern', () => {
      const errors: string[] = [];
      
      // Simulate validator accumulating errors
      if (true) errors.push('Title is required');
      if (true) errors.push('Artist is required');

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors: errors
      };

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it('should support early exit pattern', () => {
      const processValidation = (result: ValidationResult): string => {
        if (!result.isValid) {
          return `Failed: ${result.errors.join(', ')}`;
        }
        return 'Success';
      };

      const invalid: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2']
      };

      expect(processValidation(invalid)).toBe('Failed: Error 1, Error 2');
    });

    it('should work with form validation pattern', () => {
      const validateForm = (title: string, artist: string): ValidationResult => {
        const errors: string[] = [];

        if (!title) errors.push('Title is required');
        if (!artist) errors.push('Artist is required');

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      const result1 = validateForm('', '');
      const result2 = validateForm('Song', 'Artist');

      expect(result1.isValid).toBe(false);
      expect(result1.errors).toHaveLength(2);
      expect(result2.isValid).toBe(true);
      expect(result2.errors).toHaveLength(0);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety in functions', () => {
      const createValidResult = (): ValidationResult => {
        return { isValid: true, errors: [] };
      };

      const createInvalidResult = (errors: string[]): ValidationResult => {
        return { isValid: false, errors };
      };

      expect(createValidResult().isValid).toBe(true);
      expect(createInvalidResult(['Error']).isValid).toBe(false);
    });

    it('should support type guards', () => {
      const isValidResult = (result: ValidationResult): boolean => {
        return result.isValid && result.errors.length === 0;
      };

      const valid: ValidationResult = { isValid: true, errors: [] };
      const invalid: ValidationResult = { isValid: false, errors: ['Error'] };

      expect(isValidResult(valid)).toBe(true);
      expect(isValidResult(invalid)).toBe(false);
    });

    it('should work with union types', () => {
      type Result = ValidationResult | null;

      const result: Result = { isValid: false, errors: ['Error'] };
      const nullResult: Result = null;

      expect(result).not.toBeNull();
      expect(nullResult).toBeNull();
    });
  });
});
```

---

## TEST REQUIREMENTS

### Type Structure Testing:
- [ ] Interface has both required properties (isValid, errors)
- [ ] isValid is boolean type
- [ ] errors is string array type
- [ ] No optional properties exist
- [ ] Type is properly exported

### Valid Results Testing:
- [ ] isValid true with empty errors array
- [ ] Empty array is truly empty (length 0)
- [ ] Can check validity for flow control

### Invalid Results Testing:
- [ ] isValid false with error messages
- [ ] Single error in array
- [ ] Multiple errors accumulated
- [ ] Error messages are strings

### Errors Array Testing:
- [ ] Supports array iteration (forEach, map, filter)
- [ ] Preserves error order
- [ ] Can check if errors exist (length > 0)
- [ ] Standard array operations work

### Object Operations Testing:
- [ ] JSON serialization/deserialization
- [ ] Object spread operator
- [ ] Immutable updates
- [ ] Object.assign

### Edge Cases Testing:
- [ ] Empty errors array (not null/undefined)
- [ ] Very long error messages (500+ chars)
- [ ] Many errors (20+ messages)
- [ ] Special characters in messages
- [ ] Unicode in messages

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/types/validation.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Test Category | Test Cases | Description |
|--------------|------------|-------------|
| Type Structure | 3 | Validates interface structure and property types |
| Valid Results | 3 | Tests successful validation results |
| Invalid Results | 4 | Tests failed validation with errors |
| Errors Array Operations | 5 | Tests array iteration, map, filter, order |
| Object Operations | 4 | Tests JSON, spread, assign, immutability |
| Edge Cases | 6 | Tests empty, long, many, special chars, Unicode |
| Usage Patterns | 5 | Tests common validation patterns |
| Type Safety | 3 | Tests type safety and type guards |
| **TOTAL** | **33** | **Comprehensive validation result testing** |

### 3. Expected Coverage Analysis
- **Line coverage:** N/A (type definition, no runtime code)
- **Type coverage:** 100% (all properties validated)
- **Usage patterns:** 100% (all common patterns tested)
- **Edge cases:** Comprehensive (empty, long, many, special chars)

### 4. Execution Instructions
```bash
# Run validation type tests
npm test tests/types/validation.test.ts

# Run with coverage
npm test -- --coverage tests/types/validation.test.ts

# Run in watch mode
npm test -- --watch tests/types/validation.test.ts

# Run all type tests together
npm test tests/types/
```

---

## SPECIAL CASES TO CONSIDER

### 1. Valid vs Invalid Pattern
- **Valid:** `{ isValid: true, errors: [] }`
- **Invalid:** `{ isValid: false, errors: ["message"] }`
- Edge case: `{ isValid: false, errors: [] }` (type allows, logic shouldn't)

### 2. Error Accumulation
ValidationResult supports accumulating ALL errors:
- NOT fail-fast (stop at first error)
- Collect all validation failures
- Return complete list to user

### 3. Usage with AudioValidator
While not testing AudioValidator here, verify:
- ValidationResult structure matches validator return
- Error messages match expected format
- isValid/errors relationship is correct

### 4. Display Patterns
Test common UI patterns:
- Conditional rendering based on isValid
- Mapping errors to display elements
- Joining errors with separator
- Counting errors

### 5. Immutability
- ValidationResult objects should be treated as immutable
- Use spread operator for updates
- Don't mutate errors array directly
- Create new results instead of modifying

---

## ADDITIONAL NOTES

- Focus on ValidationResult structure and usage
- Test TypeScript type safety at compile time
- Verify runtime behavior with various error scenarios
- Cover all common usage patterns from AddSongForm
- Test array operations thoroughly (errors is array)
- Ensure JSON serialization works (for state persistence)
- No mocking needed (pure data structure)
- Tests should be fast and deterministic
- Edge case: isValid false with empty errors (type allows, logic prevents)
