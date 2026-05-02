# TESTING PROMPT #8: `src/hooks/useLocalStorage.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** useLocalStorage Hook

**File path:** `src/hooks/useLocalStorage.ts`

**Test file path:** `tests/hooks/useLocalStorage.test.ts`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Hooks/useLocalStorage
 * @category Hooks
 * @description
 * This module provides a custom React hook for managing state synchronized with localStorage.
 * It supports cross-tab synchronization, error handling, and follows the same API pattern as useState.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing state synchronized with localStorage.
 * @template T The type of value to store (must be JSON-serializable)
 * @param key The localStorage key under which to store the value
 * @param initialValue The default value to use if nothing is in localStorage
 * @returns A tuple with the stored value and a setter function (similar to useState)
 * @example
 * // Simple usage
 * const [name, setName] = useLocalStorage<string>('userName', 'Guest');
 * setName('John'); // Saves 'John' to localStorage under 'userName'
 *
 * // Array usage (playlist)
 * const [songs, setSongs] = useLocalStorage<Song[]>('playlist', []);
 * setSongs([...songs, newSong]); // Adds song and persists
 *
 * // Object usage
 * const [settings, setSettings] = useLocalStorage<Settings>('appSettings', defaultSettings);
 *
 * // Updater function
 * setSongs(prevSongs => [...prevSongs, newSong]);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    return readValue<T>(key, initialValue);
  });

  // Set up storage event listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        // Only update if the change came from another tab/window
        try {
          const newValue = event.newValue
            ? JSON.parse(event.newValue)
            : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  /**
   * Updates the stored value in both state and localStorage.
   * Uses useCallback for stability.
   * @param value New value or updater function
   */
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Handle updater function pattern
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Update state
        setStoredValue(valueToStore);

        // Update localStorage
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } catch (error) {
          // Handle quota exceeded or other localStorage errors
          console.warn(`Error saving to localStorage for key "${key}":`, error);

          // Optionally notify user about storage issues
          if (process.env.NODE_ENV === 'development') {
            console.warn('localStorage may be full or disabled. Data will not persist.');
          }
        }
      } catch (error) {
        console.warn(`Error in setValue for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Reads and parses value from localStorage.
 * @template T The type of value to read
 * @param key The localStorage key
 * @param initialValue The default value if nothing is in localStorage
 * @returns Parsed value from localStorage, or initialValue if not found or error occurs
 */
function readValue<T>(key: string, initialValue: T): T {
  // Validate key
  if (!key || typeof key !== 'string') {
    return initialValue;
  }

  // Guard for non-browser environments
  if (typeof window === 'undefined' || !window.localStorage) {
    return initialValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    // Handle JSON parse errors or other issues
    console.warn(`Error reading localStorage key "${key}":`, error);

    // If there's an error, we might want to clear the bad data
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.warn(`Error removing corrupted data for key "${key}":`, removeError);
    }

    return initialValue;
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

// Mock fetch API for Node.js test environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({}),
  })
);
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

### From Code Review #8:

**Component Objective:**
React hook for synchronizing state with localStorage. Provides persistent storage with cross-tab synchronization. Generic hook that works with any JSON-serializable data type. Matches useState API with added persistence. Handles errors gracefully (quota exceeded, disabled storage, JSON errors).

**Requirements:**
- **FR17:** Persistent storage via localStorage
- **NFR4:** Use of React hooks
- **NFR8:** Immediate response to user interactions
- **NFR9:** Proper error handling

**Hook Signature:**
```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void]
```

**Functionality:**

1. **Initial Load:**
   - Reads from localStorage on mount
   - Parses JSON value if exists
   - Falls back to initialValue if key doesn't exist or error
   - Handles JSON parse errors gracefully

2. **State Management:**
   - Uses useState internally
   - Returns current value and setter function
   - Setter matches useState API (value or updater function)

3. **Persistence:**
   - setValue writes to both state and localStorage
   - JSON.stringify used for storage
   - Handles quota exceeded errors
   - Handles disabled localStorage

4. **Cross-Tab Sync:**
   - Listens to 'storage' event
   - Updates state when other tabs modify same key
   - Event listener properly cleaned up
   - Only syncs changes to matching key

5. **Error Handling:**
   - localStorage unavailable → falls back to memory-only
   - JSON parse error → uses initialValue
   - Quota exceeded → logs warning, continues with state
   - Never throws errors (defensive programming)

6. **useEffect Dependencies:**
   - Effect runs when key changes
   - Cleanup removes event listener
   - No stale closures

**Critical Requirements:**
- Generic type parameter `<T>`
- Matches useState API signature
- Event listener cleanup (prevents memory leaks)
- localStorage operations in try-catch
- Supports updater function: `setValue(prev => prev + 1)`
- Cross-tab synchronization via 'storage' event
- Never throws exceptions

**Usage Context:**
- Used by usePlaylist to persist playlist data
- Used by useAudioPlayer to persist volume/mute
- Can be used for any persistent state
- Should work like useState with added persistence

---

## USE CASE DIAGRAM

```
useLocalStorage Hook
├── Initial Load
│   ├── Read from localStorage
│   ├── Parse JSON
│   └── Fall back to initialValue if error
│
├── State Management
│   ├── Internal useState
│   └── Return [value, setValue]
│
├── Persistence
│   ├── setValue updates state
│   └── setValue writes to localStorage
│
└── Cross-Tab Sync
    ├── Listen to 'storage' event
    ├── Update state on external changes
    └── Cleanup event listener
```

---

## TASK

Generate a complete unit test suite for the **useLocalStorage hook** that covers:

### 1. BASIC FUNCTIONALITY
Test basic usage:
- Hook returns array with [value, setValue]
- Initial value is set correctly
- setValue updates the value
- Hook works with different data types (string, number, object, array)

### 2. INITIAL LOAD FROM LOCALSTORAGE
Test initial load behavior:
- Reads from localStorage on mount
- Uses stored value if exists
- Uses initialValue if key doesn't exist
- Parses JSON correctly
- Handles JSON parse errors gracefully

### 3. PERSISTENCE TO LOCALSTORAGE
Test writing to localStorage:
- setValue writes to localStorage
- Value is JSON stringified
- localStorage contains correct data after setValue
- Multiple setValue calls update localStorage

### 4. UPDATER FUNCTION SUPPORT
Test updater function (like useState):
- Supports updater function: `setValue(prev => prev + 1)`
- Updater receives current value
- Updater return value becomes new value
- Works with objects: `setValue(prev => ({ ...prev, key: value }))`

### 5. CROSS-TAB SYNCHRONIZATION
Test 'storage' event handling:
- Event listener added on mount
- State updates when storage event fires
- Only updates for matching key
- Ignores events for different keys
- Parses new value from event

### 6. EVENT LISTENER CLEANUP
Test useEffect cleanup:
- Event listener removed on unmount
- No memory leaks
- Cleanup called when key changes
- Can mount/unmount multiple times

### 7. ERROR HANDLING - LOCALSTORAGE UNAVAILABLE
Test when localStorage is disabled/unavailable:
- Hook still works (memory-only mode)
- setValue updates state even if localStorage fails
- No exceptions thrown
- Graceful degradation

### 8. ERROR HANDLING - QUOTA EXCEEDED
Test when localStorage quota exceeded:
- setValue updates state
- Error logged or handled gracefully
- No exceptions thrown
- Application continues working

### 9. ERROR HANDLING - JSON PARSE
Test JSON parsing errors:
- Corrupted data in localStorage → uses initialValue
- Invalid JSON → uses initialValue
- No exceptions thrown

### 10. EFFECT DEPENDENCIES
Test useEffect dependencies:
- Effect runs on mount
- Effect runs when key changes
- Cleanup runs before re-running effect
- No stale closures

### 11. TYPE SAFETY
Test generic type parameter:
- Works with string type
- Works with number type
- Works with object type
- Works with array type
- Works with complex nested types

### 12. EDGE CASES
Test edge cases:
- Empty string as key
- null initialValue
- undefined initialValue
- Very large data (approaching quota)
- Special characters in key
- Rapid setValue calls

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock = {};

    global.Storage.prototype.getItem = jest.fn((key: string) => {
      return localStorageMock[key] || null;
    });

    global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    global.Storage.prototype.removeItem = jest.fn((key: string) => {
      delete localStorageMock[key];
    });

    global.Storage.prototype.clear = jest.fn(() => {
      localStorageMock = {};
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return array with value and setter', () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useLocalStorage('key', 'initialValue'));

      // ASSERT
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      expect(typeof result.current[1]).toBe('function');
    });

    it('should initialize with provided initial value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
    });

    it('should update value when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
    });

    it('should work with string type', () => {
      const { result } = renderHook(() => useLocalStorage<string>('key', 'test'));

      expect(result.current[0]).toBe('test');

      act(() => {
        result.current[1]('new value');
      });

      expect(result.current[0]).toBe('new value');
    });

    it('should work with number type', () => {
      const { result } = renderHook(() => useLocalStorage<number>('key', 42));

      expect(result.current[0]).toBe(42);

      act(() => {
        result.current[1](100);
      });

      expect(result.current[0]).toBe(100);
    });

    it('should work with object type', () => {
      const initialObj = { name: 'John', age: 30 };
      const { result } = renderHook(() => useLocalStorage('key', initialObj));

      expect(result.current[0]).toEqual(initialObj);

      act(() => {
        result.current[1]({ name: 'Jane', age: 25 });
      });

      expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
    });

    it('should work with array type', () => {
      const initialArray = [1, 2, 3];
      const { result } = renderHook(() => useLocalStorage('key', initialArray));

      expect(result.current[0]).toEqual(initialArray);

      act(() => {
        result.current[1]([4, 5, 6]);
      });

      expect(result.current[0]).toEqual([4, 5, 6]);
    });
  });

  describe('Initial Load from localStorage', () => {
    it('should read from localStorage on mount', () => {
      // Pre-populate localStorage
      localStorageMock['stored-key'] = JSON.stringify('stored-value');

      const { result } = renderHook(() => useLocalStorage('stored-key', 'default'));

      expect(result.current[0]).toBe('stored-value');
      expect(global.Storage.prototype.getItem).toHaveBeenCalledWith('stored-key');
    });

    it('should use initialValue if key does not exist in localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('new-key', 'default-value'));

      expect(result.current[0]).toBe('default-value');
    });

    it('should parse JSON correctly', () => {
      const complexObject = { name: 'Test', items: [1, 2, 3], nested: { key: 'value' } };
      localStorageMock['complex-key'] = JSON.stringify(complexObject);

      const { result } = renderHook(() => useLocalStorage('complex-key', {}));

      expect(result.current[0]).toEqual(complexObject);
    });

    it('should handle JSON parse errors gracefully', () => {
      // Store invalid JSON
      localStorageMock['corrupt-key'] = 'invalid-json{';

      const { result } = renderHook(() => useLocalStorage('corrupt-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
    });

    it('should use initialValue when localStorage has null', () => {
      localStorageMock['null-key'] = 'null';

      const { result } = renderHook(() => useLocalStorage('null-key', 'default'));

      // Should handle JSON.parse('null') correctly
      expect(result.current[0]).toBeDefined();
    });
  });

  describe('Persistence to localStorage', () => {
    it('should write to localStorage when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('persist-key', 'initial'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
        'persist-key',
        JSON.stringify('new-value')
      );
      expect(localStorageMock['persist-key']).toBe(JSON.stringify('new-value'));
    });

    it('should JSON stringify complex objects', () => {
      const { result } = renderHook(() => useLocalStorage('obj-key', { a: 1 }));

      act(() => {
        result.current[1]({ b: 2, c: 3 });
      });

      expect(localStorageMock['obj-key']).toBe(JSON.stringify({ b: 2, c: 3 }));
    });

    it('should update localStorage on multiple setValue calls', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));

      act(() => {
        result.current[1](1);
      });
      expect(localStorageMock['counter']).toBe('1');

      act(() => {
        result.current[1](2);
      });
      expect(localStorageMock['counter']).toBe('2');

      act(() => {
        result.current[1](3);
      });
      expect(localStorageMock['counter']).toBe('3');
    });
  });

  describe('Updater Function Support', () => {
    it('should support updater function like useState', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));

      act(() => {
        result.current[1](prev => prev + 1);
      });

      expect(result.current[0]).toBe(1);
    });

    it('should pass current value to updater function', () => {
      const { result } = renderHook(() => useLocalStorage('value', 10));

      act(() => {
        result.current[1](prev => {
          expect(prev).toBe(10);
          return prev * 2;
        });
      });

      expect(result.current[0]).toBe(20);
    });

    it('should work with object updater function', () => {
      const { result } = renderHook(() => 
        useLocalStorage('user', { name: 'John', age: 30 })
      );

      act(() => {
        result.current[1](prev => ({ ...prev, age: 31 }));
      });

      expect(result.current[0]).toEqual({ name: 'John', age: 31 });
    });

    it('should work with array updater function', () => {
      const { result } = renderHook(() => useLocalStorage('items', [1, 2, 3]));

      act(() => {
        result.current[1](prev => [...prev, 4]);
      });

      expect(result.current[0]).toEqual([1, 2, 3, 4]);
    });

    it('should persist updater function result to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('count', 5));

      act(() => {
        result.current[1](prev => prev + 10);
      });

      expect(localStorageMock['count']).toBe('15');
    });
  });

  describe('Cross-Tab Synchronization', () => {
    it('should add storage event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useLocalStorage('sync-key', 'value'));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should update state when storage event fires for matching key', () => {
      const { result } = renderHook(() => useLocalStorage('sync-key', 'initial'));

      // Simulate storage event from another tab
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'sync-key',
          newValue: JSON.stringify('updated-from-other-tab'),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe('updated-from-other-tab');
    });

    it('should ignore storage events for different keys', () => {
      const { result } = renderHook(() => useLocalStorage('key-a', 'value-a'));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'key-b',
          newValue: JSON.stringify('value-b'),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      });

      // Should not update
      expect(result.current[0]).toBe('value-a');
    });

    it('should parse new value from storage event', () => {
      const { result } = renderHook(() => useLocalStorage('data', { count: 0 }));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'data',
          newValue: JSON.stringify({ count: 5 }),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toEqual({ count: 5 });
    });

    it('should handle null newValue in storage event', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'value'));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'key',
          newValue: null,
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      });

      // Should handle gracefully (may reset to initial or stay current)
      expect(result.current[0]).toBeDefined();
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useLocalStorage('key', 'value'));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should not leak memory on multiple mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useLocalStorage('key', 'value'));
        unmount();
      }

      // Should complete without errors (no memory leaks)
      expect(true).toBe(true);
    });

    it('should cleanup when key changes', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { rerender } = renderHook(
        ({ key }) => useLocalStorage(key, 'value'),
        { initialProps: { key: 'key-1' } }
      );

      rerender({ key: 'key-2' });

      // Should have cleaned up old listener
      expect(removeEventListenerSpy).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Error Handling - localStorage Unavailable', () => {
    it('should work in memory-only mode when localStorage is unavailable', () => {
      // Mock localStorage methods to throw
      global.Storage.prototype.getItem = jest.fn(() => {
        throw new Error('localStorage disabled');
      });
      global.Storage.prototype.setItem = jest.fn(() => {
        throw new Error('localStorage disabled');
      });

      const { result } = renderHook(() => useLocalStorage('key', 'default'));

      // Should use initialValue
      expect(result.current[0]).toBe('default');

      // Should still update state
      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
    });

    it('should not throw exceptions when localStorage is disabled', () => {
      global.Storage.prototype.setItem = jest.fn(() => {
        throw new Error('localStorage disabled');
      });

      expect(() => {
        const { result } = renderHook(() => useLocalStorage('key', 'value'));
        
        act(() => {
          result.current[1]('new');
        });
      }).not.toThrow();
    });
  });

  describe('Error Handling - Quota Exceeded', () => {
    it('should handle quota exceeded error gracefully', () => {
      global.Storage.prototype.setItem = jest.fn(() => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const { result } = renderHook(() => useLocalStorage('key', 'value'));

      // Should still update state even if localStorage fails
      act(() => {
        result.current[1]('large-data');
      });

      expect(result.current[0]).toBe('large-data');
    });

    it('should not throw when quota exceeded', () => {
      global.Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        const { result } = renderHook(() => useLocalStorage('key', 'value'));
        act(() => {
          result.current[1]('data');
        });
      }).not.toThrow();
    });
  });

  describe('Error Handling - JSON Parse', () => {
    it('should use initialValue when JSON parse fails', () => {
      localStorageMock['corrupt'] = 'not-valid-json{{{';

      const { result } = renderHook(() => useLocalStorage('corrupt', 'fallback'));

      expect(result.current[0]).toBe('fallback');
    });

    it('should not throw on corrupted localStorage data', () => {
      localStorageMock['bad-data'] = 'corrupt{data]';

      expect(() => {
        renderHook(() => useLocalStorage('bad-data', 'default'));
      }).not.toThrow();
    });
  });

  describe('Effect Dependencies', () => {
    it('should re-run effect when key changes', () => {
      localStorageMock['key-1'] = JSON.stringify('value-1');
      localStorageMock['key-2'] = JSON.stringify('value-2');

      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage(key, 'default'),
        { initialProps: { key: 'key-1' } }
      );

      expect(result.current[0]).toBe('value-1');

      // Change key
      rerender({ key: 'key-2' });

      expect(result.current[0]).toBe('value-2');
    });

    it('should not have stale closures', () => {
      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage(key, 'default'),
        { initialProps: { key: 'key-1' } }
      );

      act(() => {
        result.current[1]('new-value');
      });

      // Change key
      rerender({ key: 'key-2' });

      // Should not affect old key's value
      expect(localStorageMock['key-1']).toBe(JSON.stringify('new-value'));
    });
  });

  describe('Type Safety', () => {
    it('should work with string type', () => {
      const { result } = renderHook(() => useLocalStorage<string>('key', 'test'));
      const value: string = result.current[0];
      expect(typeof value).toBe('string');
    });

    it('should work with number type', () => {
      const { result } = renderHook(() => useLocalStorage<number>('key', 42));
      const value: number = result.current[0];
      expect(typeof value).toBe('number');
    });

    it('should work with complex object type', () => {
      interface User {
        id: number;
        name: string;
        preferences: { theme: string };
      }

      const initialUser: User = {
        id: 1,
        name: 'John',
        preferences: { theme: 'dark' }
      };

      const { result } = renderHook(() => useLocalStorage<User>('user', initialUser));
      const user: User = result.current[0];

      expect(user.id).toBe(1);
      expect(user.preferences.theme).toBe('dark');
    });

    it('should work with array type', () => {
      const { result } = renderHook(() => useLocalStorage<number[]>('nums', [1, 2, 3]));
      const nums: number[] = result.current[0];
      
      expect(Array.isArray(nums)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as key', () => {
      const { result } = renderHook(() => useLocalStorage('', 'value'));

      act(() => {
        result.current[1]('new');
      });

      expect(result.current[0]).toBe('new');
    });

    it('should handle null as initialValue', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>('key', null));

      expect(result.current[0]).toBeNull();
    });

    it('should handle undefined as initialValue', () => {
      const { result } = renderHook(() => 
        useLocalStorage<string | undefined>('key', undefined)
      );

      expect(result.current[0]).toBeUndefined();
    });

    it('should handle special characters in key', () => {
      const specialKey = 'key-with-special!@#$%chars';
      const { result } = renderHook(() => useLocalStorage(specialKey, 'value'));

      act(() => {
        result.current[1]('new');
      });

      expect(localStorageMock[specialKey]).toBe(JSON.stringify('new'));
    });

    it('should handle rapid setValue calls', () => {
      const { result } = renderHook(() => useLocalStorage('rapid', 0));

      act(() => {
        for (let i = 1; i <= 100; i++) {
          result.current[1](i);
        }
      });

      expect(result.current[0]).toBe(100);
    });

    it('should handle very large data', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(100)
      }));

      const { result } = renderHook(() => useLocalStorage('large', largeArray));

      expect(result.current[0]).toEqual(largeArray);
    });
  });
});
```

---

## TEST REQUIREMENTS

### React Testing Library:
- [ ] Use `renderHook` from @testing-library/react
- [ ] Use `act` for state updates
- [ ] Use `waitFor` for async operations (if needed)
- [ ] Mock localStorage before each test

### Hook Testing:
- [ ] Test initial render
- [ ] Test state updates
- [ ] Test effect dependencies
- [ ] Test cleanup
- [ ] Test re-renders

### localStorage Mocking:
- [ ] Mock getItem, setItem, removeItem, clear
- [ ] Track calls to verify behavior
- [ ] Reset between tests

### Event Testing:
- [ ] Create StorageEvent
- [ ] Dispatch to window
- [ ] Verify state updates

### Error Handling:
- [ ] Mock errors for all localStorage operations
- [ ] Verify no exceptions thrown
- [ ] Verify graceful fallbacks

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/hooks/useLocalStorage.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Test Category | Test Cases | Description |
|--------------|------------|-------------|
| Basic Functionality | 7 | Return signature, initial value, updates, types |
| Initial Load | 5 | Read from storage, parse JSON, error handling |
| Persistence | 3 | Write to storage, stringify, multiple updates |
| Updater Function | 5 | Function support, current value, objects, arrays |
| Cross-Tab Sync | 5 | Event listener, state updates, key matching |
| Event Cleanup | 3 | Remove listener, no leaks, key changes |
| Error - Unavailable | 2 | Memory-only mode, no exceptions |
| Error - Quota | 2 | Handle gracefully, no exceptions |
| Error - JSON Parse | 2 | Use initialValue, no exceptions |
| Effect Dependencies | 2 | Key changes, no stale closures |
| Type Safety | 4 | String, number, object, array types |
| Edge Cases | 6 | Empty key, null/undefined, special chars, rapid calls |
| **TOTAL** | **46** | **Comprehensive hook testing** |

### 3. Expected Coverage Analysis
- **Line coverage:** 100% (all hook logic tested)
- **Branch coverage:** 100% (all error paths, conditionals)
- **Function coverage:** 100% (all internal functions tested)
- **Edge cases:** Comprehensive (errors, types, events)

### 4. Execution Instructions
```bash
# Run useLocalStorage hook tests
npm test tests/hooks/useLocalStorage.test.ts

# Run with coverage
npm test -- --coverage tests/hooks/useLocalStorage.test.ts

# Run in watch mode
npm test -- --watch tests/hooks/useLocalStorage.test.ts

# Run with verbose output
npm test -- --verbose tests/hooks/useLocalStorage.test.ts
```

---

## SPECIAL CASES TO CONSIDER

### 1. localStorage Mocking
Must mock all localStorage methods:
```typescript
beforeEach(() => {
  let store = {};
  
  global.Storage.prototype.getItem = jest.fn((key) => store[key] || null);
  global.Storage.prototype.setItem = jest.fn((key, value) => {
    store[key] = value;
  });
  global.Storage.prototype.removeItem = jest.fn((key) => {
    delete store[key];
  });
  global.Storage.prototype.clear = jest.fn(() => {
    store = {};
  });
});
```

### 2. React Testing Library Usage
```typescript
import { renderHook, act } from '@testing-library/react';

// Render hook
const { result } = renderHook(() => useLocalStorage('key', 'value'));

// Access current value
const [value, setValue] = result.current;

// Update state (must wrap in act)
act(() => {
  setValue('new value');
});
```

### 3. StorageEvent Testing
```typescript
act(() => {
  const event = new StorageEvent('storage', {
    key: 'my-key',
    newValue: JSON.stringify('new-value'),
    storageArea: localStorage
  });
  window.dispatchEvent(event);
});
```

### 4. Event Listener Cleanup
Critical to test cleanup to prevent memory leaks:
```typescript
it('should cleanup event listener', () => {
  const spy = jest.spyOn(window, 'removeEventListener');
  const { unmount } = renderHook(() => useLocalStorage('key', 'val'));
  
  unmount();
  
  expect(spy).toHaveBeenCalledWith('storage', expect.any(Function));
});
```

### 5. Error Simulation
```typescript
// Simulate quota exceeded
global.Storage.prototype.setItem = jest.fn(() => {
  throw new Error('QuotaExceededError');
});

// Simulate localStorage disabled
global.Storage.prototype.getItem = jest.fn(() => {
  throw new Error('localStorage is not available');
});
```

---

## ADDITIONAL NOTES

- Use React Testing Library's `renderHook` for all tests
- Mock localStorage completely (don't use real localStorage)
- Test cross-tab sync with StorageEvent
- Verify event listener cleanup (critical for memory)
- Test all error paths (localStorage unavailable, quota, JSON parse)
- Test updater function support (like useState)
- Test with various data types (string, number, object, array)
- Verify localStorage operations wrapped in try-catch
- Test effect dependencies (key changes)
- No actual async operations (all synchronous)
