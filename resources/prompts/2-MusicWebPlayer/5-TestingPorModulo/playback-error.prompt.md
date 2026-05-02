# TESTING PROMPT #2: `src/types/playback-error.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** PlaybackError Type Definitions (ErrorType enum + PlaybackError interface)

**File path:** `src/types/playback-error.ts`

**Test file path:** `tests/types/playback-error.test.ts`

**Testing framework:** Jest, TS-Jest

**Target coverage:** 100% (type definitions should be fully validated)

---

## CODE TO TEST
```typescript
/**
 * @module Types/PlaybackError
 * @category Types
 * @description
 * This module defines the error types and structure for audio playback errors in the Music Web Player.
 * It provides a standardized way to represent and handle errors that occur during audio loading and playback.
 */

/**
 * Enumeration of possible playback error types.
 * These error types categorize the different failures that can occur during audio playback.
 *
 * @enum {string}
 * @category Types
 */
export enum ErrorType {
  /**
   * Audio file failed to load (404, network timeout, server error).
   * @example Scenario: File doesn't exist, wrong URL, server unreachable
   * @example User message: "Unable to load song. Please check the file."
   * @example HTTP status codes: 404, 500, 503
   */
  LOAD_ERROR = 'LOAD_ERROR',

  /**
   * Audio file is corrupt or cannot be decoded by browser.
   * @example Scenario: File is corrupted, incomplete download, unsupported codec
   * @example User message: "This audio file appears to be corrupted."
   * @example Technical cause: Browser's Audio API decode failure
   */
  DECODE_ERROR = 'DECODE_ERROR',

  /**
   * Network connection issues during loading or playback.
   * @example Scenario: Internet disconnected, CORS issues, timeout
   * @example User message: "Network error. Please check your connection."
   * @example Technical cause: Network unavailable, fetch failed
   */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /**
   * Audio format not supported by the browser.
   * @example Scenario: Trying to play .flac, .aac, or other unsupported formats
   * @example User message: "This audio format is not supported. Please use MP3, WAV, or OGG."
   * @example Supported formats: MP3, WAV, OGG, M4A (browser-dependent)
   */
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
}

/**
 * Structured error information for audio playback failures.
 *
 * @interface PlaybackError
 * @property {ErrorType} type - Category of error that occurred
 * @property {string} message - User-friendly error message for display
 * @property {string} songId - ID of the song that failed to play
 *
 * @example
 * const error: PlaybackError = {
 *   type: ErrorType.LOAD_ERROR,
 *   message: "Unable to load song. The file may have been moved or deleted.",
 *   songId: "song-123"
 * };
 */
export interface PlaybackError {
  readonly type: ErrorType;
  readonly message: string;
  readonly songId: string;
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

### From Code Review #2:

**Component Objective:**
Defines error types and structure for audio playback errors. Contains ErrorType enum with four error categories and PlaybackError interface that combines error type, message, and song ID. Used throughout the application for consistent error handling and user feedback.

**Requirements:**
- **NFR9:** Proper error handling without application blocking
- **NFR12:** Clear user feedback about playback issues
- **NFR13:** Prevention of blocks from missing or corrupt files

**ErrorType Enum Structure:**
```typescript
enum ErrorType {
  LOAD_ERROR = 'LOAD_ERROR',           // File not found, 404, network timeout
  DECODE_ERROR = 'DECODE_ERROR',       // Corrupt file, invalid format
  NETWORK_ERROR = 'NETWORK_ERROR',     // Connection issues, CORS
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT'  // Browser doesn't support format
}
```

**PlaybackError Interface Structure:**
```typescript
interface PlaybackError {
  type: ErrorType;        // One of the four error types (NOT string)
  message: string;        // User-friendly error message
  songId: string;         // ID of song that failed
}
```

**Validation Rules:**
- ErrorType must be a **string enum** (values are strings)
- All 4 error types must be UPPER_SNAKE_CASE
- PlaybackError.type must use **ErrorType enum** (not plain string)
- All PlaybackError properties are **required**
- ErrorType and PlaybackError must both be exported

**Error Type Mappings (from Requirements):**

| ErrorType | User Message | Technical Cause |
|-----------|--------------|-----------------|
| LOAD_ERROR | "Unable to load song. The file may have been moved or deleted." | 404, network timeout, file not found |
| DECODE_ERROR | "This audio file appears to be corrupted or incomplete." | Decode error, invalid format |
| NETWORK_ERROR | "Network error. Please check your internet connection." | Connection lost, timeout, CORS |
| UNSUPPORTED_FORMAT | "This audio format is not supported. Please use MP3, WAV, OGG, or M4A." | Browser doesn't support format |

**Usage Context:**
- Used by ErrorHandler utility to create error objects
- Used by useAudioPlayer hook to handle audio errors
- Used by Player component to display error messages
- Type property ensures type-safe error checking

---

## USE CASE DIAGRAM

```
PlaybackError Type Definitions
├── ErrorType Enum
│   ├── LOAD_ERROR
│   ├── DECODE_ERROR
│   ├── NETWORK_ERROR
│   └── UNSUPPORTED_FORMAT
│
└── PlaybackError Interface
    ├── Uses ErrorType for type property
    ├── Provides user-friendly message
    └── Tracks which song failed
```

---

## TASK

Generate a complete unit test suite for the **PlaybackError type definitions** that validates:

### 1. ERRORTYPE ENUM TESTS
- Verify enum exists and is properly exported
- Verify all 4 error types are present
- Verify enum values are strings (not numbers)
- Verify values are UPPER_SNAKE_CASE
- Verify no additional error types exist
- Verify enum can be used in type annotations

### 2. ERRORTYPE VALUE TESTS
For each error type:
- **LOAD_ERROR** equals 'LOAD_ERROR' (string)
- **DECODE_ERROR** equals 'DECODE_ERROR'
- **NETWORK_ERROR** equals 'NETWORK_ERROR'
- **UNSUPPORTED_FORMAT** equals 'UNSUPPORTED_FORMAT'
- Values are the same as keys (string enum pattern)

### 3. PLAYBACKERROR INTERFACE TESTS
- Verify interface exists and is properly exported
- Verify all 3 required properties exist
- Verify type property uses ErrorType enum (not string)
- Verify message property is string
- Verify songId property is string
- Verify no optional properties exist

### 4. TYPE VALIDATION TESTS
Test that TypeScript correctly:
- **Accepts valid PlaybackError objects** with ErrorType enum
- **Rejects PlaybackError with string type** instead of ErrorType
- **Rejects objects missing any property**
- **Rejects objects with wrong property types**
- **Accepts objects with all three properties**

### 5. ENUM USAGE TESTS
- Can use ErrorType in switch statements
- Can compare ErrorType values with ===
- Can use ErrorType values as object keys
- Can iterate over ErrorType values
- Can use ErrorType in type guards

### 6. INTEGRATION TESTS
- PlaybackError objects work with ErrorType enum
- Can create PlaybackError for each error type
- ErrorType values serialize correctly to JSON
- PlaybackError objects serialize correctly to JSON
- Can use ErrorType in conditional logic

### 7. EDGE CASES
- PlaybackError with empty strings (message, songId)
- PlaybackError with very long messages
- PlaybackError with special characters in message
- ErrorType values used as strings
- Type-safe error checking patterns

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect } from '@jest/globals';
import { ErrorType, PlaybackError } from '@/types/playback-error';

describe('PlaybackError Type Definitions', () => {
  describe('ErrorType Enum', () => {
    it('should export ErrorType enum', () => {
      expect(ErrorType).toBeDefined();
      expect(typeof ErrorType).toBe('object');
    });

    it('should have all 4 error types', () => {
      expect(ErrorType.LOAD_ERROR).toBeDefined();
      expect(ErrorType.DECODE_ERROR).toBeDefined();
      expect(ErrorType.NETWORK_ERROR).toBeDefined();
      expect(ErrorType.UNSUPPORTED_FORMAT).toBeDefined();
    });

    it('should have string values for all error types', () => {
      expect(typeof ErrorType.LOAD_ERROR).toBe('string');
      expect(typeof ErrorType.DECODE_ERROR).toBe('string');
      expect(typeof ErrorType.NETWORK_ERROR).toBe('string');
      expect(typeof ErrorType.UNSUPPORTED_FORMAT).toBe('string');
    });

    it('should have correct string values matching keys', () => {
      expect(ErrorType.LOAD_ERROR).toBe('LOAD_ERROR');
      expect(ErrorType.DECODE_ERROR).toBe('DECODE_ERROR');
      expect(ErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorType.UNSUPPORTED_FORMAT).toBe('UNSUPPORTED_FORMAT');
    });

    it('should be UPPER_SNAKE_CASE format', () => {
      const values = Object.values(ErrorType);
      values.forEach(value => {
        expect(value).toMatch(/^[A-Z_]+$/);
      });
    });

    it('should have exactly 4 error types', () => {
      const errorTypes = Object.keys(ErrorType);
      expect(errorTypes).toHaveLength(4);
    });
  });

  describe('ErrorType Enum Usage', () => {
    it('should work in switch statements', () => {
      const getErrorDescription = (type: ErrorType): string => {
        switch (type) {
          case ErrorType.LOAD_ERROR:
            return 'Load failed';
          case ErrorType.DECODE_ERROR:
            return 'Decode failed';
          case ErrorType.NETWORK_ERROR:
            return 'Network failed';
          case ErrorType.UNSUPPORTED_FORMAT:
            return 'Format not supported';
        }
      };

      expect(getErrorDescription(ErrorType.LOAD_ERROR)).toBe('Load failed');
      expect(getErrorDescription(ErrorType.NETWORK_ERROR)).toBe('Network failed');
    });

    it('should support equality comparisons', () => {
      const type: ErrorType = ErrorType.LOAD_ERROR;
      
      expect(type === ErrorType.LOAD_ERROR).toBe(true);
      expect(type === ErrorType.DECODE_ERROR).toBe(false);
      expect(type !== ErrorType.NETWORK_ERROR).toBe(true);
    });

    it('should work as object keys', () => {
      const errorCounts: Record<ErrorType, number> = {
        [ErrorType.LOAD_ERROR]: 0,
        [ErrorType.DECODE_ERROR]: 0,
        [ErrorType.NETWORK_ERROR]: 0,
        [ErrorType.UNSUPPORTED_FORMAT]: 0
      };

      errorCounts[ErrorType.LOAD_ERROR]++;
      errorCounts[ErrorType.NETWORK_ERROR] += 2;

      expect(errorCounts[ErrorType.LOAD_ERROR]).toBe(1);
      expect(errorCounts[ErrorType.NETWORK_ERROR]).toBe(2);
    });

    it('should support iteration', () => {
      const types = Object.values(ErrorType);
      
      expect(types).toContain('LOAD_ERROR');
      expect(types).toContain('DECODE_ERROR');
      expect(types).toContain('NETWORK_ERROR');
      expect(types).toContain('UNSUPPORTED_FORMAT');
    });

    it('should work in type guards', () => {
      const isLoadError = (type: ErrorType): boolean => {
        return type === ErrorType.LOAD_ERROR;
      };

      expect(isLoadError(ErrorType.LOAD_ERROR)).toBe(true);
      expect(isLoadError(ErrorType.DECODE_ERROR)).toBe(false);
    });
  });

  describe('PlaybackError Interface', () => {
    it('should accept valid PlaybackError objects', () => {
      const error: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: 'Unable to load song',
        songId: 'song-123'
      };

      expect(error).toBeDefined();
      expect(error.type).toBe(ErrorType.LOAD_ERROR);
      expect(error.message).toBe('Unable to load song');
      expect(error.songId).toBe('song-123');
    });

    it('should have all required properties', () => {
      const error: PlaybackError = {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error',
        songId: 'test-id'
      };

      expect(error).toHaveProperty('type');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('songId');
    });

    it('should use ErrorType enum for type property', () => {
      const error: PlaybackError = {
        type: ErrorType.DECODE_ERROR,
        message: 'Decode failed',
        songId: '1'
      };

      expect(Object.values(ErrorType)).toContain(error.type);
      expect(typeof error.type).toBe('string');
    });

    it('should accept all four error types', () => {
      const errors: PlaybackError[] = [
        { type: ErrorType.LOAD_ERROR, message: 'Load failed', songId: '1' },
        { type: ErrorType.DECODE_ERROR, message: 'Decode failed', songId: '2' },
        { type: ErrorType.NETWORK_ERROR, message: 'Network failed', songId: '3' },
        { type: ErrorType.UNSUPPORTED_FORMAT, message: 'Format unsupported', songId: '4' }
      ];

      errors.forEach((error, index) => {
        expect(error).toBeDefined();
        expect(error.songId).toBe((index + 1).toString());
      });
    });
  });

  describe('PlaybackError Operations', () => {
    it('should work with JSON serialization', () => {
      const error: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: 'Unable to load',
        songId: '123'
      };

      const json = JSON.stringify(error);
      const parsed: PlaybackError = JSON.parse(json);

      expect(parsed.type).toBe('LOAD_ERROR');
      expect(parsed.message).toBe('Unable to load');
      expect(parsed.songId).toBe('123');
    });

    it('should work with object spread', () => {
      const baseError: PlaybackError = {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network failed',
        songId: '1'
      };

      const updatedError: PlaybackError = {
        ...baseError,
        message: 'Network error - retry failed'
      };

      expect(updatedError.message).toBe('Network error - retry failed');
      expect(updatedError.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should support array operations', () => {
      const errors: PlaybackError[] = [
        { type: ErrorType.LOAD_ERROR, message: 'Load 1', songId: '1' },
        { type: ErrorType.NETWORK_ERROR, message: 'Network 1', songId: '2' },
        { type: ErrorType.LOAD_ERROR, message: 'Load 2', songId: '3' }
      ];

      const loadErrors = errors.filter(e => e.type === ErrorType.LOAD_ERROR);
      const songIds = errors.map(e => e.songId);

      expect(loadErrors).toHaveLength(2);
      expect(songIds).toEqual(['1', '2', '3']);
    });
  });

  describe('Edge Cases', () => {
    it('should accept empty strings for message and songId', () => {
      const error: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: '',
        songId: ''
      };

      expect(error.message).toBe('');
      expect(error.songId).toBe('');
    });

    it('should accept very long messages', () => {
      const longMessage = 'Error '.repeat(100);
      const error: PlaybackError = {
        type: ErrorType.DECODE_ERROR,
        message: longMessage,
        songId: 'test'
      };

      expect(error.message.length).toBeGreaterThan(500);
    });

    it('should accept special characters in message', () => {
      const error: PlaybackError = {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error: "Connection timeout" (500ms)',
        songId: 'song-with-special-chars-@#$'
      };

      expect(error.message).toContain('"Connection timeout"');
      expect(error.songId).toContain('@#$');
    });

    it('should accept Unicode in message', () => {
      const error: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: '読み込みエラー: ファイルが見つかりません',
        songId: '日本語-id'
      };

      expect(error.message).toContain('読み込み');
    });

    it('should work with conditional error handling', () => {
      const handleError = (error: PlaybackError): string => {
        if (error.type === ErrorType.LOAD_ERROR) {
          return 'Retry loading';
        } else if (error.type === ErrorType.NETWORK_ERROR) {
          return 'Check connection';
        } else if (error.type === ErrorType.DECODE_ERROR) {
          return 'File corrupted';
        } else {
          return 'Format not supported';
        }
      };

      const loadError: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: 'Load failed',
        songId: '1'
      };

      expect(handleError(loadError)).toBe('Retry loading');
    });

    it('should support error type checking utility', () => {
      const isRecoverableError = (error: PlaybackError): boolean => {
        return error.type === ErrorType.LOAD_ERROR || 
               error.type === ErrorType.NETWORK_ERROR;
      };

      const loadError: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: 'Failed',
        songId: '1'
      };

      const formatError: PlaybackError = {
        type: ErrorType.UNSUPPORTED_FORMAT,
        message: 'Not supported',
        songId: '2'
      };

      expect(isRecoverableError(loadError)).toBe(true);
      expect(isRecoverableError(formatError)).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety with ErrorType', () => {
      const createError = (type: ErrorType, songId: string): PlaybackError => {
        return {
          type,
          message: `Error of type ${type}`,
          songId
        };
      };

      const error = createError(ErrorType.LOAD_ERROR, '123');
      expect(error.type).toBe(ErrorType.LOAD_ERROR);
    });

    it('should work with partial error objects during construction', () => {
      const baseError = {
        message: 'An error occurred',
        songId: '123'
      };

      const completeError: PlaybackError = {
        ...baseError,
        type: ErrorType.NETWORK_ERROR
      };

      expect(completeError).toEqual({
        type: ErrorType.NETWORK_ERROR,
        message: 'An error occurred',
        songId: '123'
      });
    });
  });
});
```

---

## TEST REQUIREMENTS

### Enum-Specific Testing:
- [ ] Verify enum is a string enum (values are strings, not numbers)
- [ ] All 4 error types are present and correctly named
- [ ] Enum values match keys (string enum pattern)
- [ ] Enum works in switch statements
- [ ] Enum supports equality comparisons

### Interface Testing:
- [ ] PlaybackError has all 3 required properties
- [ ] type property uses ErrorType enum (not plain string)
- [ ] All properties are required (not optional)
- [ ] Type safety is maintained throughout

### Integration Testing:
- [ ] ErrorType and PlaybackError work together correctly
- [ ] Can create PlaybackError for each ErrorType
- [ ] JSON serialization/deserialization works
- [ ] Array operations work with PlaybackError objects

### Edge Case Coverage:
- [ ] Empty strings in message and songId
- [ ] Very long messages (1000+ chars)
- [ ] Special characters and Unicode
- [ ] Error type checking patterns
- [ ] Conditional error handling

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/types/playback-error.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Test Category | Test Cases | Description |
|--------------|------------|-------------|
| ErrorType Enum Structure | 6 | Validates enum exists, has 4 types, string values |
| ErrorType Enum Usage | 5 | Tests switch, equality, object keys, iteration |
| PlaybackError Interface | 4 | Validates interface structure and properties |
| PlaybackError Operations | 3 | Tests JSON, spread, array operations |
| Edge Cases | 6 | Tests empty strings, long messages, Unicode |
| Type Safety | 2 | Tests type safety and construction patterns |
| **TOTAL** | **26** | **Comprehensive type validation** |

### 3. Expected Coverage Analysis
- **Line coverage:** N/A (type definitions, no runtime code)
- **Type coverage:** 100% (all enum values and properties validated)
- **Usage patterns:** 100% (common operations tested)
- **Edge cases:** Comprehensive (empty, long, special chars, Unicode)

### 4. Execution Instructions
```bash
# Run playback error type tests
npm test tests/types/playback-error.test.ts

# Run with coverage
npm test -- --coverage tests/types/playback-error.test.ts

# Run in watch mode
npm test -- --watch tests/types/playback-error.test.ts

# Run all type tests
npm test tests/types/
```

---

## SPECIAL CASES TO CONSIDER

### 1. String Enum vs Numeric Enum
- ErrorType must be a **string enum** (not numeric)
- Values should equal keys: `LOAD_ERROR = 'LOAD_ERROR'`
- This provides better debugging and serialization

### 2. Type Safety with Enum
- PlaybackError.type must use ErrorType enum
- NOT just `type: string` (loses type safety)
- Tests should verify enum usage

### 3. Error Handling Patterns
Test common error handling patterns:
- Switch statements by error type
- Filtering errors by type
- Recoverable vs non-recoverable errors
- Type guards for error checking

### 4. JSON Serialization
- Enum values serialize to strings
- PlaybackError objects serialize correctly
- Can deserialize and maintain type safety

### 5. Integration with ErrorHandler
While not testing ErrorHandler here, verify:
- ErrorType values work as expected
- PlaybackError structure is complete
- Types support error conversion patterns

---

## ADDITIONAL NOTES

- Focus on enum behavior and interface structure
- Test TypeScript type safety at compile time
- Verify runtime behavior with enum values
- Cover all four error types in tests
- Test common error handling patterns
- Ensure JSON serialization works (for logging/storage)
- No mocking needed (pure data structures)
- Tests should be fast and deterministic
