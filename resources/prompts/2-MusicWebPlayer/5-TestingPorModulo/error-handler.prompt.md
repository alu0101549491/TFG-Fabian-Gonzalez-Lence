# TESTING PROMPT #5: `src/utils/error-handler.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** ErrorHandler Utility

**File path:** `src/utils/error-handler.ts`

**Test file path:** `tests/utils/error-handler.test.ts`

**Testing framework:** Jest, TS-Jest

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Utilities/ErrorHandler
 * @category Utilities
 * @description
 * This module provides utility functions for handling and formatting playback errors
 * in the Music Web Player application. It converts native errors into domain-specific
 * PlaybackError objects and provides user-friendly error messages.
 */

import { ErrorType, PlaybackError } from '@types/playback-error';

// MediaError code constants for readability
const MEDIA_ERR_ABORTED = 1;
const MEDIA_ERR_NETWORK = 2;
const MEDIA_ERR_DECODE = 3;
const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

// Error message constants
const ERROR_MESSAGES = {
  [ErrorType.LOAD_ERROR]: "Unable to load song. The file may have been moved or deleted.",
  [ErrorType.DECODE_ERROR]: "This audio file appears to be corrupted or incomplete.",
  [ErrorType.NETWORK_ERROR]: "Network error. Please check your internet connection.",
  [ErrorType.UNSUPPORTED_FORMAT]: "This audio format is not supported. Please use MP3, WAV, OGG, or M4A.",
  DEFAULT: "An error occurred while playing this song.",
};

/**
 * Utility class for handling and formatting playback errors.
 * All methods are static and designed to be safe to call with any input.
 */
export class ErrorHandler {
  /**
   * Converts a native JavaScript Error or MediaError into a structured PlaybackError.
   * @param error - The native error object from audio element
   * @param songId - The ID of the song that caused the error
   * @returns Structured PlaybackError object
   * @example
   * // Network error
   * ErrorHandler.handlePlaybackError(new Error("Failed to fetch"), "123");
   * // Returns: { type: ErrorType.NETWORK_ERROR, message: "Network error...", songId: "123" }
   */
  public static handlePlaybackError(error: Error, songId: string = "unknown"): PlaybackError {
    // Handle null/undefined error
    if (!error) {
      return {
        type: ErrorType.LOAD_ERROR,
        message: ERROR_MESSAGES.DEFAULT,
        songId,
        originalError: error,
      };
    }

    // Log the error for debugging
    this.logError(error, `Song ID: ${songId}`);

    // Check if this is a MediaError (has code property)
    const mediaError = error as MediaError;
    if (typeof mediaError.code === 'number') {
      return this.handleMediaError(mediaError, songId);
    }

    // Handle generic Error by parsing message
    return this.handleGenericError(error, songId);
  }

  /**
   * Returns a user-friendly error message for a given error type.
   * @param errorType - The type of error that occurred
   * @returns User-friendly error message
   * @example
   * ErrorHandler.getErrorMessage(ErrorType.LOAD_ERROR);
   * // Returns: "Unable to load song. The file may have been moved or deleted."
   */
  public static getErrorMessage(errorType: ErrorType): string {
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.DEFAULT;
  }

  /**
   * Logs error details to console for debugging (development mode only).
   * @param error - The error object to log
   * @param context - Additional context about where/when error occurred
   */
  public static logError(error: Error, context?: string): void {
    // Only log in development mode
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const contextStr = context ? `[${context}] ` : '';
      const errorName = error.name || 'Error';
      const errorMessage = error.message || 'Unknown error';

      console.error(
        `${timestamp} ${contextStr}${errorName}: ${errorMessage}`,
        error
      );
    } catch (e) {
      // If logging fails, silently continue
      console.error('Failed to log error:', e);
    }
  }

  /**
   * Handles MediaError objects with code property.
   * @param error - MediaError object
   * @param songId - Song ID
   * @returns PlaybackError object
   * @private
   */
  private static handleMediaError(error: MediaError, songId: string): PlaybackError {
    let errorType: ErrorType;

    switch (error.code) {
      case MEDIA_ERR_ABORTED:
        errorType = ErrorType.LOAD_ERROR;
        break;
      case MEDIA_ERR_NETWORK:
        errorType = ErrorType.NETWORK_ERROR;
        break;
      case MEDIA_ERR_DECODE:
        errorType = ErrorType.DECODE_ERROR;
        break;
      case MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorType = ErrorType.UNSUPPORTED_FORMAT;
        break;
      default:
        errorType = ErrorType.LOAD_ERROR;
    }

    return {
      type: errorType,
      message: this.getErrorMessage(errorType),
      songId,
      originalError: error,
    };
  }

  /**
   * Handles generic Error objects by parsing message for keywords.
   * @param error - Generic Error object
   * @param songId - Song ID
   * @returns PlaybackError object
   * @private
   */
  private static handleGenericError(error: Error, songId: string): PlaybackError {
    const message = error.message?.toLowerCase() || '';
    let errorType: ErrorType;

    // Detect error type based on message keywords
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      errorType = ErrorType.NETWORK_ERROR;
    } else if (message.includes('404') || message.includes('not found') || message.includes('load')) {
      errorType = ErrorType.LOAD_ERROR;
    } else if (message.includes('decode') || message.includes('corrupt')) {
      errorType = ErrorType.DECODE_ERROR;
    } else if (message.includes('format') || message.includes('unsupported') || message.includes('mime')) {
      errorType = ErrorType.UNSUPPORTED_FORMAT;
    } else {
      errorType = ErrorType.LOAD_ERROR; // Default fallback
    }

    return {
      type: errorType,
      message: this.getErrorMessage(errorType),
      songId,
      originalError: error,
    };
  }

  /**
   * Creates a PlaybackError object with the given type, songId, and optional originalError.
   * @param type - The type of error
   * @param songId - The ID of the song
   * @param originalError - The original error object (optional)
   * @returns PlaybackError object
   * @example
   * const error = ErrorHandler.createPlaybackError(ErrorType.DECODE_ERROR, "123", new Error("Decode failed"));
   * // error: { type: ErrorType.DECODE_ERROR, message: "This audio file appears to be corrupted or incomplete.", songId: "123", originalError: Error("Decode failed") }
   */
  public static createPlaybackError(type: ErrorType, songId: string, originalError?: Error): PlaybackError {
    return { type, message: ERROR_MESSAGES[type] || ERROR_MESSAGES.DEFAULT, songId, originalError };
  }
}

// Type declaration for MediaError (not all browsers have this in TypeScript)
interface MediaError extends Error {
  code: number;
}

function isMediaError(err: unknown): err is MediaError {
  return !!err && typeof (err as any) === 'object' && 'code' in (err as any) && typeof (err as any).code === 'number';
}

function mapMediaErrorCode(code: number): ErrorType {
  switch (code) {
    case MEDIA_ERR_ABORTED: return ErrorType.LOAD_ERROR;
    case MEDIA_ERR_NETWORK: return ErrorType.NETWORK_ERROR;
    case MEDIA_ERR_DECODE: return ErrorType.DECODE_ERROR;
    case MEDIA_ERR_SRC_NOT_SUPPORTED: return ErrorType.UNSUPPORTED_FORMAT;
    default: return ErrorType.LOAD_ERROR;
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

### From Code Review #5:

**Component Objective:**
Utility functions for converting native browser errors (MediaError, generic Error) into structured PlaybackError objects with user-friendly messages. Provides consistent error handling throughout the application with development-only logging. Pure functions except for logError which has logging side effect.

**Requirements:**
- **NFR9:** Proper error handling without application blocking
- **NFR12:** Clear user feedback about playback issues
- **NFR13:** Prevention of blocks from missing or corrupt files

**Functions to Test:**

1. **handlePlaybackError(error: MediaError | Error | unknown, songId: string): PlaybackError**
   - Converts native errors to PlaybackError objects
   - Handles MediaError with code mapping (1→LOAD, 2→NETWORK, 3→DECODE, 4→UNSUPPORTED)
   - Handles generic Error objects
   - Handles unknown error types
   - Returns PlaybackError with appropriate type and message
   - Never throws exceptions (defensive programming)

2. **getErrorMessage(error: MediaError | Error | unknown): string**
   - Returns user-friendly error message
   - Maps MediaError codes to specific messages
   - Extracts message from Error objects
   - Detects keywords in error messages for categorization
   - Returns generic fallback message for unknown errors
   - Never throws exceptions

3. **logError(error: PlaybackError): void**
   - Logs errors to console in development only
   - Checks NODE_ENV or similar flag
   - Does not log in production (process.env.NODE_ENV !== 'development')
   - Logs structured error information
   - Returns void (side effect function)

**MediaError Code Mapping:**
```typescript
MediaError.MEDIA_ERR_ABORTED = 1      → LOAD_ERROR
MediaError.MEDIA_ERR_NETWORK = 2      → NETWORK_ERROR
MediaError.MEDIA_ERR_DECODE = 3       → DECODE_ERROR
MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED = 4 → UNSUPPORTED_FORMAT
```

**Expected Error Messages (exact from requirements):**

| ErrorType | Message |
|-----------|---------|
| LOAD_ERROR | "Unable to load song. The file may have been moved or deleted." |
| NETWORK_ERROR | "Network error. Please check your internet connection." |
| DECODE_ERROR | "This audio file appears to be corrupted or incomplete." |
| UNSUPPORTED_FORMAT | "This audio format is not supported. Please use MP3, WAV, OGG, or M4A." |
| Unknown/Generic | "An error occurred while playing this song." |

**Keyword Detection (for generic errors):**
- "network" or "timeout" → NETWORK_ERROR
- "decode" or "corrupt" → DECODE_ERROR
- "format" or "support" → UNSUPPORTED_FORMAT
- "404" or "not found" → LOAD_ERROR
- Default → LOAD_ERROR

**Critical Requirements:**
- All functions must handle null/undefined gracefully
- Never throw exceptions (defensive programming)
- MediaError type guards for safe access
- Exact error messages matching requirements table
- Development-only logging (NODE_ENV check)

**Usage Context:**
- Used by useAudioPlayer hook when audio errors occur
- Used by Player component to display errors to user
- Integrates with ErrorType enum and PlaybackError interface
- Called frequently during error conditions

---

## USE CASE DIAGRAM

```
ErrorHandler Utility
├── handlePlaybackError(error, songId)
│   ├── Receives MediaError → Maps code to ErrorType
│   ├── Receives Error → Detects keywords in message
│   ├── Receives unknown → Returns generic LOAD_ERROR
│   └── Returns PlaybackError object
│
├── getErrorMessage(error)
│   ├── MediaError code → Specific message
│   ├── Error message keywords → Specific message
│   └── Unknown → Generic fallback
│
└── logError(error)
    ├── Development: console.error with details
    └── Production: No logging
```

---

## TASK

Generate a complete unit test suite for the **ErrorHandler utility** that covers:

### 1. HANDLEPLAYBACKERROR - MEDIAERROR HANDLING
Test all 4 MediaError codes:
- Code 1 (MEDIA_ERR_ABORTED) → LOAD_ERROR
- Code 2 (MEDIA_ERR_NETWORK) → NETWORK_ERROR
- Code 3 (MEDIA_ERR_DECODE) → DECODE_ERROR
- Code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED) → UNSUPPORTED_FORMAT
- Verify correct PlaybackError structure
- Verify correct error messages
- Verify songId is preserved

### 2. HANDLEPLAYBACKERROR - GENERIC ERROR HANDLING
Test Error objects with keyword detection:
- "network error" → NETWORK_ERROR
- "timeout" → NETWORK_ERROR
- "decode failed" → DECODE_ERROR
- "corrupt file" → DECODE_ERROR
- "unsupported format" → UNSUPPORTED_FORMAT
- "404 not found" → LOAD_ERROR
- Generic message → LOAD_ERROR (default)

### 3. HANDLEPLAYBACKERROR - EDGE CASES
- null error → Return generic PlaybackError
- undefined error → Return generic PlaybackError
- Error with no message → Return generic PlaybackError
- Empty string error message → Return generic PlaybackError
- Non-error objects → Handle gracefully
- MediaError with invalid code → Handle gracefully

### 4. GETERRORMESSAGE - MEDIAERROR MESSAGES
Test correct message for each MediaError code:
- Code 1 → "Unable to load song..."
- Code 2 → "Network error..."
- Code 3 → "This audio file appears to be corrupted..."
- Code 4 → "This audio format is not supported..."
- Verify exact message matching (from requirements)

### 5. GETERRORMESSAGE - KEYWORD DETECTION
Test keyword detection in error messages:
- Message with "network" → Network error message
- Message with "timeout" → Network error message
- Message with "decode" → Decode error message
- Message with "corrupt" → Decode error message
- Message with "format" → Unsupported format message
- Message with "support" → Unsupported format message
- Message with "404" → Load error message
- Message with "not found" → Load error message

### 6. GETERRORMESSAGE - EDGE CASES
- null/undefined → Generic fallback message
- Empty string → Generic fallback message
- Error with no message property → Generic fallback
- Case-insensitive keyword matching
- Multiple keywords present → First match wins
- Non-Error objects → Generic fallback

### 7. LOGERROR - DEVELOPMENT LOGGING
Test logging behavior in development:
- console.error called with error details
- Error type logged
- Error message logged
- Song ID logged
- Structured output format

### 8. LOGERROR - PRODUCTION BEHAVIOR
Test that logging is disabled in production:
- console.error NOT called when NODE_ENV = 'production'
- No logging side effects in production
- Function still returns (doesn't crash)

### 9. INTEGRATION TESTS
- handlePlaybackError uses getErrorMessage internally
- handlePlaybackError + logError workflow
- Complete error handling flow from MediaError to logged PlaybackError
- Verify PlaybackError structure matches type definitions

### 10. DEFENSIVE PROGRAMMING TESTS
- No function throws exceptions
- All functions handle null/undefined
- Type guards work correctly
- Safe property access (MediaError.code)
- Graceful fallbacks for unexpected inputs

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { handlePlaybackError, getErrorMessage, logError } from '@/utils/error-handler';
import { ErrorType, PlaybackError } from '@/types/playback-error';

describe('ErrorHandler Utility', () => {
  // Mock console.error for testing
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('handlePlaybackError', () => {
    describe('MediaError Handling', () => {
      it('should convert MediaError code 1 to LOAD_ERROR', () => {
        // ARRANGE
        const mediaError = {
          code: 1, // MEDIA_ERR_ABORTED
          message: 'Aborted'
        } as MediaError;
        const songId = 'song-123';

        // ACT
        const result = handlePlaybackError(mediaError, songId);

        // ASSERT
        expect(result.type).toBe(ErrorType.LOAD_ERROR);
        expect(result.message).toBe('Unable to load song. The file may have been moved or deleted.');
        expect(result.songId).toBe(songId);
      });

      it('should convert MediaError code 2 to NETWORK_ERROR', () => {
        const mediaError = {
          code: 2, // MEDIA_ERR_NETWORK
          message: 'Network error'
        } as MediaError;

        const result = handlePlaybackError(mediaError, 'test-id');

        expect(result.type).toBe(ErrorType.NETWORK_ERROR);
        expect(result.message).toBe('Network error. Please check your internet connection.');
      });

      it('should convert MediaError code 3 to DECODE_ERROR', () => {
        const mediaError = {
          code: 3, // MEDIA_ERR_DECODE
          message: 'Decode error'
        } as MediaError;

        const result = handlePlaybackError(mediaError, 'test-id');

        expect(result.type).toBe(ErrorType.DECODE_ERROR);
        expect(result.message).toBe('This audio file appears to be corrupted or incomplete.');
      });

      it('should convert MediaError code 4 to UNSUPPORTED_FORMAT', () => {
        const mediaError = {
          code: 4, // MEDIA_ERR_SRC_NOT_SUPPORTED
          message: 'Source not supported'
        } as MediaError;

        const result = handlePlaybackError(mediaError, 'test-id');

        expect(result.type).toBe(ErrorType.UNSUPPORTED_FORMAT);
        expect(result.message).toBe('This audio format is not supported. Please use MP3, WAV, OGG, or M4A.');
      });

      it('should handle MediaError with invalid code gracefully', () => {
        const mediaError = {
          code: 999, // Invalid code
          message: 'Unknown error'
        } as MediaError;

        const result = handlePlaybackError(mediaError, 'test-id');

        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.message).toBeDefined();
      });
    });

    describe('Generic Error Handling', () => {
      it('should detect "network" keyword and return NETWORK_ERROR', () => {
        const error = new Error('Network connection failed');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.NETWORK_ERROR);
        expect(result.message).toContain('Network error');
      });

      it('should detect "timeout" keyword and return NETWORK_ERROR', () => {
        const error = new Error('Request timeout occurred');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.NETWORK_ERROR);
      });

      it('should detect "decode" keyword and return DECODE_ERROR', () => {
        const error = new Error('Failed to decode audio data');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.DECODE_ERROR);
        expect(result.message).toContain('corrupted');
      });

      it('should detect "corrupt" keyword and return DECODE_ERROR', () => {
        const error = new Error('File is corrupt');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.DECODE_ERROR);
      });

      it('should detect "format" keyword and return UNSUPPORTED_FORMAT', () => {
        const error = new Error('Invalid format detected');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.UNSUPPORTED_FORMAT);
      });

      it('should detect "support" keyword and return UNSUPPORTED_FORMAT', () => {
        const error = new Error('This codec is not supported');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.UNSUPPORTED_FORMAT);
      });

      it('should detect "404" keyword and return LOAD_ERROR', () => {
        const error = new Error('404 not found');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.LOAD_ERROR);
      });

      it('should detect "not found" keyword and return LOAD_ERROR', () => {
        const error = new Error('Resource not found');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.LOAD_ERROR);
      });

      it('should default to LOAD_ERROR for generic error messages', () => {
        const error = new Error('Something went wrong');

        const result = handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.LOAD_ERROR);
      });
    });

    describe('Edge Cases', () => {
      it('should handle null error gracefully', () => {
        const result = handlePlaybackError(null, 'song-1');

        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.message).toBeDefined();
        expect(result.songId).toBe('song-1');
      });

      it('should handle undefined error gracefully', () => {
        const result = handlePlaybackError(undefined, 'song-1');

        expect(result).toBeDefined();
        expect(result.songId).toBe('song-1');
      });

      it('should handle Error with empty message', () => {
        const error = new Error('');

        const result = handlePlaybackError(error, 'song-1');

        expect(result).toBeDefined();
        expect(result.message).toBeTruthy();
      });

      it('should handle non-error objects', () => {
        const notAnError = { random: 'object' };

        const result = handlePlaybackError(notAnError, 'song-1');

        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
      });

      it('should handle string error', () => {
        const result = handlePlaybackError('string error', 'song-1');

        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
      });

      it('should preserve songId in all cases', () => {
        const testCases = [
          null,
          undefined,
          new Error('test'),
          { code: 1 } as MediaError
        ];

        testCases.forEach(error => {
          const result = handlePlaybackError(error, 'preserved-id');
          expect(result.songId).toBe('preserved-id');
        });
      });

      it('should never throw exceptions', () => {
        const badInputs = [
          null,
          undefined,
          {},
          [],
          123,
          'string',
          true,
          Symbol('test')
        ];

        badInputs.forEach(input => {
          expect(() => handlePlaybackError(input as any, 'test')).not.toThrow();
        });
      });
    });
  });

  describe('getErrorMessage', () => {
    describe('MediaError Messages', () => {
      it('should return correct message for MediaError code 1', () => {
        const error = { code: 1, message: '' } as MediaError;

        const message = getErrorMessage(error);

        expect(message).toBe('Unable to load song. The file may have been moved or deleted.');
      });

      it('should return correct message for MediaError code 2', () => {
        const error = { code: 2, message: '' } as MediaError;

        const message = getErrorMessage(error);

        expect(message).toBe('Network error. Please check your internet connection.');
      });

      it('should return correct message for MediaError code 3', () => {
        const error = { code: 3, message: '' } as MediaError;

        const message = getErrorMessage(error);

        expect(message).toBe('This audio file appears to be corrupted or incomplete.');
      });

      it('should return correct message for MediaError code 4', () => {
        const error = { code: 4, message: '' } as MediaError;

        const message = getErrorMessage(error);

        expect(message).toBe('This audio format is not supported. Please use MP3, WAV, OGG, or M4A.');
      });
    });

    describe('Keyword Detection', () => {
      it('should detect "network" keyword (case-insensitive)', () => {
        const error1 = new Error('Network failure');
        const error2 = new Error('NETWORK ERROR');
        const error3 = new Error('network problem');

        expect(getErrorMessage(error1)).toContain('Network error');
        expect(getErrorMessage(error2)).toContain('Network error');
        expect(getErrorMessage(error3)).toContain('Network error');
      });

      it('should detect "timeout" keyword', () => {
        const error = new Error('Connection timeout');

        const message = getErrorMessage(error);

        expect(message).toContain('Network error');
      });

      it('should detect "decode" keyword', () => {
        const error = new Error('Decode failed');

        const message = getErrorMessage(error);

        expect(message).toContain('corrupted');
      });

      it('should detect "corrupt" keyword', () => {
        const error = new Error('File corrupt');

        const message = getErrorMessage(error);

        expect(message).toContain('corrupted');
      });

      it('should detect "format" keyword', () => {
        const error = new Error('Invalid format');

        const message = getErrorMessage(error);

        expect(message).toContain('not supported');
      });

      it('should detect "support" keyword', () => {
        const error = new Error('Not supported');

        const message = getErrorMessage(error);

        expect(message).toContain('not supported');
      });

      it('should detect "404" keyword', () => {
        const error = new Error('HTTP 404 error');

        const message = getErrorMessage(error);

        expect(message).toContain('Unable to load');
      });

      it('should detect "not found" keyword', () => {
        const error = new Error('Resource not found');

        const message = getErrorMessage(error);

        expect(message).toContain('Unable to load');
      });
    });

    describe('Edge Cases', () => {
      it('should return generic fallback for null', () => {
        const message = getErrorMessage(null);

        expect(message).toBe('An error occurred while playing this song.');
      });

      it('should return generic fallback for undefined', () => {
        const message = getErrorMessage(undefined);

        expect(message).toBe('An error occurred while playing this song.');
      });

      it('should return generic fallback for empty string error', () => {
        const error = new Error('');

        const message = getErrorMessage(error);

        expect(message).toBe('An error occurred while playing this song.');
      });

      it('should return generic fallback for error with no message property', () => {
        const error = {} as Error;

        const message = getErrorMessage(error);

        expect(message).toBe('An error occurred while playing this song.');
      });

      it('should handle multiple keywords (first match wins)', () => {
        const error = new Error('Network decode error');

        const message = getErrorMessage(error);

        // Should match "network" first
        expect(message).toContain('Network error');
      });

      it('should never throw exceptions', () => {
        const badInputs = [null, undefined, {}, [], 123, 'string'];

        badInputs.forEach(input => {
          expect(() => getErrorMessage(input as any)).not.toThrow();
        });
      });
    });
  });

  describe('logError', () => {
    describe('Development Logging', () => {
      beforeEach(() => {
        // Mock development environment
        process.env.NODE_ENV = 'development';
      });

      it('should log error to console in development', () => {
        const error: PlaybackError = {
          type: ErrorType.LOAD_ERROR,
          message: 'Test error',
          songId: 'song-123'
        };

        logError(error);

        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      it('should log error type', () => {
        const error: PlaybackError = {
          type: ErrorType.NETWORK_ERROR,
          message: 'Network failed',
          songId: 'song-1'
        };

        logError(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('NETWORK_ERROR')
        );
      });

      it('should log error message', () => {
        const error: PlaybackError = {
          type: ErrorType.DECODE_ERROR,
          message: 'Decode failed',
          songId: 'song-1'
        };

        logError(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Decode failed')
        );
      });

      it('should log song ID', () => {
        const error: PlaybackError = {
          type: ErrorType.LOAD_ERROR,
          message: 'Load failed',
          songId: 'specific-song-id'
        };

        logError(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('specific-song-id')
        );
      });
    });

    describe('Production Behavior', () => {
      beforeEach(() => {
        // Mock production environment
        process.env.NODE_ENV = 'production';
      });

      it('should NOT log to console in production', () => {
        const error: PlaybackError = {
          type: ErrorType.LOAD_ERROR,
          message: 'Test error',
          songId: 'song-123'
        };

        logError(error);

        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should still execute without errors in production', () => {
        const error: PlaybackError = {
          type: ErrorType.NETWORK_ERROR,
          message: 'Network error',
          songId: 'song-1'
        };

        expect(() => logError(error)).not.toThrow();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should use getErrorMessage internally in handlePlaybackError', () => {
      const error = new Error('Network timeout');

      const result = handlePlaybackError(error, 'song-1');

      // Message should match what getErrorMessage returns
      const expectedMessage = getErrorMessage(error);
      expect(result.message).toBe(expectedMessage);
    });

    it('should support complete error handling workflow', () => {
      // ARRANGE
      const mediaError = { code: 2, message: '' } as MediaError;
      const songId = 'workflow-test';

      // ACT
      const playbackError = handlePlaybackError(mediaError, songId);
      logError(playbackError);

      // ASSERT
      expect(playbackError.type).toBe(ErrorType.NETWORK_ERROR);
      expect(playbackError.songId).toBe(songId);
      // Logging behavior depends on NODE_ENV
    });

    it('should create valid PlaybackError structure', () => {
      const error = new Error('Test error');

      const result = handlePlaybackError(error, 'test-id');

      // Verify structure matches PlaybackError interface
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('songId');
      expect(typeof result.type).toBe('string');
      expect(typeof result.message).toBe('string');
      expect(typeof result.songId).toBe('string');
    });
  });

  describe('Defensive Programming', () => {
    it('should never throw exceptions from handlePlaybackError', () => {
      const testInputs = [
        [null, 'id'],
        [undefined, 'id'],
        [{}, 'id'],
        ['string', 'id'],
        [123, 'id'],
        [new Error(), ''],
        [{ code: 'invalid' } as any, 'id']
      ];

      testInputs.forEach(([error, songId]) => {
        expect(() => handlePlaybackError(error as any, songId as string))
          .not.toThrow();
      });
    });

    it('should never throw exceptions from getErrorMessage', () => {
      const testInputs = [null, undefined, {}, [], 123, '', true];

      testInputs.forEach(input => {
        expect(() => getErrorMessage(input as any)).not.toThrow();
      });
    });

    it('should safely access MediaError properties', () => {
      const fakeMediaError = { notCode: 1 } as any;

      expect(() => handlePlaybackError(fakeMediaError, 'test'))
        .not.toThrow();
    });

    it('should handle errors with undefined message property', () => {
      const error = { name: 'Error' } as Error;

      const result = handlePlaybackError(error, 'test');

      expect(result).toBeDefined();
      expect(result.message).toBeTruthy();
    });
  });

  describe('Type Safety', () => {
    it('should return PlaybackError type from handlePlaybackError', () => {
      const error = new Error('test');
      const result: PlaybackError = handlePlaybackError(error, 'id');

      expect(result.type).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.songId).toBeDefined();
    });

    it('should accept MediaError | Error | unknown as input', () => {
      const mediaError: MediaError = { code: 1, message: '' } as MediaError;
      const genericError: Error = new Error('test');
      const unknownError: unknown = 'string error';

      expect(() => handlePlaybackError(mediaError, 'id')).not.toThrow();
      expect(() => handlePlaybackError(genericError, 'id')).not.toThrow();
      expect(() => handlePlaybackError(unknownError, 'id')).not.toThrow();
    });
  });
});
```

---

## TEST REQUIREMENTS

### MediaError Testing:
- [ ] All 4 MediaError codes tested (1, 2, 3, 4)
- [ ] Correct ErrorType mapping for each code
- [ ] Exact error messages from requirements table
- [ ] Type guard for MediaError access

### Keyword Detection Testing:
- [ ] All keywords tested (network, timeout, decode, corrupt, format, support, 404, not found)
- [ ] Case-insensitive matching
- [ ] First match wins when multiple keywords
- [ ] Default to LOAD_ERROR when no keywords

### Edge Case Testing:
- [ ] null and undefined handled
- [ ] Empty messages handled
- [ ] Non-error objects handled
- [ ] No exceptions thrown ever

### Logging Testing:
- [ ] Development: console.error called
- [ ] Production: console.error NOT called
- [ ] Proper NODE_ENV checking
- [ ] Structured log format

### Defensive Programming:
- [ ] No function throws exceptions
- [ ] Safe property access (error.code, error.message)
- [ ] Type guards used correctly
- [ ] All edge cases have fallbacks

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/utils/error-handler.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Function | Normal Cases | Edge Cases | Integration | Total Tests |
|----------|--------------|------------|-------------|-------------|
| handlePlaybackError | 13 | 9 | 2 | 24 |
| getErrorMessage | 12 | 6 | 1 | 19 |
| logError | 4 | 2 | 1 | 7 |
| Defensive Programming | - | 4 | - | 4 |
| Type Safety | 2 | - | - | 2 |
| **TOTAL** | **31** | **21** | **4** | **56** |

### 3. Expected Coverage Analysis
- **Line coverage:** 100% (all functions fully tested)
- **Branch coverage:** 100% (all MediaError codes, all keywords, all edge cases)
- **Function coverage:** 100% (all 3 functions tested)
- **Edge cases:** Comprehensive (null, undefined, invalid types, empty messages)

### 4. Execution Instructions
```bash
# Run error handler tests
npm test tests/utils/error-handler.test.ts

# Run with coverage
npm test -- --coverage tests/utils/error-handler.test.ts

# Run in watch mode
npm test -- --watch tests/utils/error-handler.test.ts

# Run with verbose output
npm test -- --verbose tests/utils/error-handler.test.ts
```

---

## SPECIAL CASES TO CONSIDER

### 1. MediaError Type Guard
Must safely check if error is MediaError:
```typescript
if (error && typeof error === 'object' && 'code' in error) {
  // Safe to access error.code
}
```

### 2. Exact Error Messages
Messages must match requirements table exactly:
- "Unable to load song. The file may have been moved or deleted."
- "Network error. Please check your internet connection."
- "This audio file appears to be corrupted or incomplete."
- "This audio format is not supported. Please use MP3, WAV, OGG, or M4A."
- "An error occurred while playing this song." (fallback)

### 3. NODE_ENV Checking
logError must check environment:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.error(...);
}
```

### 4. Keyword Detection Order
When multiple keywords match, first match wins:
- "network decode error" → NETWORK_ERROR (not DECODE_ERROR)
- Test keyword priority order

### 5. Defensive Programming
Never throw exceptions:
- Always return valid PlaybackError
- Always return valid string message
- Handle all possible input types

---

## ADDITIONAL NOTES

- Mock console.error to test logging without polluting test output
- Test both development and production NODE_ENV
- Verify exact error messages (copy from requirements)
- Test MediaError code mapping thoroughly (1→LOAD, 2→NETWORK, 3→DECODE, 4→UNSUPPORTED)
- Test keyword detection case-insensitivity
- Ensure no exceptions thrown under any circumstances
- Test integration with PlaybackError type
- Verify songId is always preserved
- Mock NODE_ENV using `process.env.NODE_ENV`
