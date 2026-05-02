Perfect! Let's move to **Module #8: `src/hooks/useLocalStorage.ts`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Hooks Layer - Local Storage Management Hook

---

# PROJECT FILE STRUCTURE REMINDER

```
2-MusicWebPlayer/
├── src/
│   ├── types/
│   │   ├── song.ts                    ← COMPLETED
│   │   ├── playback-error.ts          ← COMPLETED
│   │   └── validation.ts              ← COMPLETED
│   ├── components/
│   │   ├── Player.tsx
│   │   ├── TrackInfo.tsx
│   │   ├── Controls.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Playlist.tsx
│   │   └── AddSongForm.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.ts
│   │   ├── usePlaylist.ts
│   │   └── useLocalStorage.ts         ← CURRENT MODULE
│   ├── utils/
│   │   ├── time-formatter.ts          ← COMPLETED
│   │   ├── error-handler.ts           ← COMPLETED
│   │   └── audio-validator.ts         ← COMPLETED
│   ├── data/
│   │   └── playlist-data-provider.ts  ← COMPLETED
│   └── styles/
│       └── main.css
├── index.html
├── package.json
├── tsconfig.json
└── ... (config files)
```

---

# CODE STRUCTURE REMINDER

```typescript
import {useState, useEffect} from 'react';

/**
 * Interface for the useLocalStorage hook return value.
 * @template T The type of value stored
 * @category Hooks
 */
export interface LocalStorageHook<T> {
  /** The current stored value */
  storedValue: T;
  
  /** Function to update the stored value */
  setValue: (value: T) => void;
}

/**
 * Custom hook for managing state synchronized with localStorage.
 * @template T The type of value to store
 * @param key The localStorage key
 * @param initialValue The initial value if no stored value exists
 * @returns Hook interface with stored value and setter
 * @category Hooks
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): LocalStorageHook<T> {
  // TODO: Implementation
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  const setValue = (value: T): void => {
    // TODO: Implementation
  };

  const readValue = (): T => {
    // TODO: Implementation
    return initialValue;
  };

  const handleStorageChange = (event: StorageEvent): void => {
    // TODO: Implementation
  };

  useEffect(() => {
    // TODO: Set up storage event listener
    return () => {
      // TODO: Cleanup
    };
  }, [key]);

  return {storedValue, setValue};
}
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR17:** Persistent playlist storage - the playlist is saved in localStorage or JSON file to persist between browser sessions
- **FR18:** Real-time playlist update - when adding or removing songs, the list displayed in the interface updates immediately without reloading

**Relevant Non-Functional Requirements:**
- **NFR4:** Use of React hooks and reusable functions - custom hooks are implemented for common logic and reused throughout the application
- **NFR5:** Static typing with TypeScript in all components - all hooks have explicit TypeScript types
- **NFR8:** Immediate response to user interactions - user actions respond in less than 100ms
- **NFR9:** Proper error handling without application blocking - handle localStorage errors gracefully (quota exceeded, disabled storage)

**Error Handling Requirements (from Section 13.1):**

| Error Type | Handling |
|------------|----------|
| localStorage full | Display warning, offer to clear old data or limit playlist size |
| localStorage disabled | Fallback to in-memory storage, warn user data won't persist |
| Invalid stored data | Clear corrupted data, fallback to default playlist |

## 2. Class Diagram (Relevant Section)

```typescript
class useLocalStorage {
    <<hook>>
    -key: string
    -storedValue: T
    
    +useLocalStorage<T>(key: string, initialValue: T): LocalStorageHook<T>
    +setValue(value: T): void
    -readValue(): T
    -handleStorageChange(event: StorageEvent): void
}

class LocalStorageHook<T> {
    <<interface>>
    +storedValue: T
    +setValue: Function
}
```

**Relationships:**
- Used by: `usePlaylist` hook (persists playlist data)
- May be used by: Future hooks that need persistent storage (theme, volume, preferences)
- Generic hook: Works with any data type `<T>`

## 3. Use Case Diagram (Relevant Use Cases)

- **Persist Playlist Data:** System saves playlist to localStorage after modifications
- **Load Persisted Data:** System retrieves saved playlist on app start
- **Handle Storage Errors:** System gracefully handles localStorage failures
- **Synchronize Across Tabs:** System updates when localStorage changes in another tab

---

# SPECIFIC TASK

Implement the custom React hook: **`src/hooks/useLocalStorage.ts`**

## Responsibilities:

1. **Provide persistent storage** using browser localStorage API
2. **Synchronize state** between localStorage and React state
3. **Handle storage events** to sync across browser tabs/windows
4. **Manage errors gracefully** (quota exceeded, disabled storage, JSON parse errors)
5. **Type-safe generic hook** that works with any serializable data type
6. **Provide easy-to-use interface** similar to useState

## Hook Signature and Return Type:

### **useLocalStorage\<T\>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void]**

A generic React hook that syncs state with localStorage.

- **Description:** Custom hook that behaves like useState but persists the value in localStorage and synchronizes across browser tabs
- **Type Parameters:**
  - `T`: The type of value to store (must be JSON-serializable)
- **Parameters:**
  - `key` (string): The localStorage key under which to store the value
  - `initialValue` (T): The default value to use if nothing is in localStorage
- **Returns:** 
  - Tuple: `[storedValue, setValue]`
    - `storedValue` (T): Current value from localStorage or initial value
    - `setValue` (function): Function to update the value (like setState)
      - Accepts direct value: `setValue(newValue)`
      - Accepts updater function: `setValue(prevValue => newValue)`
- **Examples:**
  ```typescript
  // Simple usage
  const [name, setName] = useLocalStorage<string>('userName', 'Guest');
  setName('John'); // Saves 'John' to localStorage under 'userName'
  
  // Array usage (playlist)
  const [songs, setSongs] = useLocalStorage<Song[]>('playlist', []);
  setSongs([...songs, newSong]); // Adds song and persists
  
  // Object usage
  const [settings, setSettings] = useLocalStorage<Settings>('appSettings', defaultSettings);
  
  // Updater function
  setSongs(prevSongs => [...prevSongs, newSong]);
  ```

---

## Internal Methods/Logic to Implement:

### 1. **readValue(): T** (internal function)

Reads and parses value from localStorage.

- **Description:** Attempts to read the value from localStorage, parse JSON, and return typed value
- **Returns:** 
  - `T`: Parsed value from localStorage, or initialValue if not found or error occurs
- **Error handling:**
  - Key doesn't exist → return initialValue
  - JSON parse error → return initialValue, optionally clear bad data
  - localStorage disabled → return initialValue
  - Other errors → return initialValue
- **Implementation considerations:**
  - Wrap in try-catch
  - Use `localStorage.getItem(key)`
  - Parse with `JSON.parse()`
  - Handle null return from getItem
  - Log errors in development mode

### 2. **setValue(value: T | ((val: T) => T)): void** (returned function)

Updates the stored value in both state and localStorage.

- **Description:** Updates React state and persists the new value to localStorage
- **Parameters:**
  - `value`: New value directly, or updater function that receives current value
- **Side effects:**
  - Updates React state (via useState)
  - Writes to localStorage
  - Triggers re-render
  - Dispatches storage event (for cross-tab sync)
- **Error handling:**
  - Quota exceeded → log error, possibly notify user, keep state updated
  - localStorage disabled → only update state, warn user
  - JSON stringify error → log error, don't update localStorage
- **Implementation considerations:**
  - Check if value is function (updater pattern)
  - If function, call with current value to get new value
  - Update state with setState
  - Stringify and save to localStorage
  - Wrap localStorage operations in try-catch

### 3. **handleStorageChange(event: StorageEvent): void** (internal event handler)

Handles storage events from other tabs/windows.

- **Description:** Listens for changes to localStorage from other browser tabs and syncs state
- **Parameters:**
  - `event` (StorageEvent): Browser storage event
- **Behavior:**
  - Only respond to changes for this hook's key
  - Parse new value and update state
  - Keeps multiple tabs in sync
- **Implementation considerations:**
  - Check `event.key === key`
  - Parse `event.newValue`
  - Update state if value changed
  - Handle null newValue (key deleted)

---

## React Hook Implementation Requirements:

### **State Management:**
- Use `useState` to hold current value
- Initialize with value from localStorage (call readValue)

### **Side Effects:**
- Use `useEffect` to set up storage event listener
- Listen for 'storage' events on window
- Clean up listener on unmount
- Dependencies: [key] (re-run if key changes)

### **Lifecycle:**
1. **Mount:** Read value from localStorage, initialize state
2. **Update:** When setValue called, update state and localStorage
3. **Storage Event:** When other tab changes value, update state
4. **Unmount:** Remove event listener

### **Error Boundaries:**
- Never throw errors from the hook
- Return initialValue on any error
- Log errors for debugging
- Optionally notify user of storage issues

---

## TypeScript Type Definitions:

```typescript
/**
 * Return type of useLocalStorage hook
 */
type UseLocalStorageReturn<T> = [
  T,                                    // storedValue
  (value: T | ((val: T) => T)) => void  // setValue
];

/**
 * Alternative interface-based return type (from class diagram)
 */
interface LocalStorageHook<T> {
  storedValue: T;
  setValue: (value: T | ((val: T) => T)) => void;
}
```

**Note:** The tuple return type `[T, setter]` is more idiomatic for React hooks (matches useState), while the interface matches the class diagram. Use tuple for better developer experience.

---

## Dependencies:

- **React imports:**
  ```typescript
  import {useState, useEffect} from 'react';
  ```
- **Type imports:** None (generic type parameter)
- **Browser APIs:** localStorage, window (storage events)

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 8 per function
- **Maximum method length:** 40 lines per function
- **React version:** React 18+ (uses modern hooks)
- **Pure hook:** No side effects except localStorage operations

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Hook only manages localStorage sync
  - **Dependency Inversion:** Generic over concrete types
- **Input parameter validation:**
  - Validate key is non-empty string
  - Handle invalid initialValue gracefully
- **Robust exception handling:**
  - Wrap all localStorage operations in try-catch
  - Never throw from hook
  - Return safe defaults on errors
  - Log errors in development
- **Logging at critical points:**
  - Log localStorage errors (quota, disabled, parse errors)
  - Only log in development mode
- **Comments for complex logic:**
  - Explain storage event handling
  - Document error scenarios
  - Clarify updater function pattern

## React Hook Rules:

- **Rules of Hooks:**
  - Must be called at top level (not in conditions/loops)
  - Only call from React components or custom hooks
- **Dependencies:**
  - useEffect dependencies must be complete and correct
  - Avoid stale closures
- **Performance:**
  - Minimize re-renders
  - Event listener should not cause unnecessary updates
  - Consider using useCallback for setValue if needed

## Documentation:

- **JSDoc on hook function:**
  - `@template T` for generic parameter
  - `@param` for each parameter
  - `@returns` with tuple structure
  - `@example` showing various use cases
- **Inline comments:**
  - Explain storage event handling
  - Document error recovery strategies
  - Note cross-tab synchronization behavior

## Security:

- **Data sanitization:** Don't store sensitive data (passwords, tokens) in localStorage
- **XSS protection:** localStorage is vulnerable to XSS, only store trusted data
- **Size limits:** localStorage typically limited to 5-10MB, handle quota errors

---

# DELIVERABLES

## 1. Complete source code of `src/hooks/useLocalStorage.ts` with:

- Organized imports:
  ```typescript
  import {useState, useEffect} from 'react';
  ```
- Generic hook function definition
- Internal helper functions (readValue)
- State management with useState
- Effect setup for storage events
- setValue function with updater pattern support
- Complete JSDoc documentation
- Inline comments for complex logic

## 2. Inline documentation:

- Explanation of storage event synchronization
- Notes on error handling strategy
- Documentation of updater function pattern
- Cross-tab sync behavior explanation
- localStorage limitations and quota handling

## 3. Type safety features:

- Generic type parameter `<T>`
- Proper return type (tuple)
- Type-safe setValue function
- No `any` types

## 4. Edge cases considered:

- **localStorage disabled:** Fallback to memory-only state
- **Quota exceeded:** Log error, state still updates
- **JSON parse error:** Return initialValue, optionally clear bad data
- **Key doesn't exist:** Return initialValue
- **Storage event from same tab:** Ignore (optional optimization)
- **Null/undefined values:** Handle serialization correctly
- **Non-serializable values:** Document that only JSON-serializable types work
- **Multiple hooks with same key:** All sync correctly
- **Rapid updates:** Debounce if needed (optional enhancement)
- **Component unmount:** Clean up event listener properly

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Tuple vs interface return type - which and why]
- [Decision 2: How to handle localStorage quota exceeded]
- [Decision 3: How to handle JSON parse errors (clear data vs keep old)]
- [Decision 4: Whether to debounce localStorage writes]
- [Decision 5: How to handle storage events from same tab]
- [Decision 6: Logging strategy for errors]
- [Decision 7: Whether to use useCallback for setValue]

**Error handling strategy:**
- [Document approach to localStorage errors]
- [Explain fallback behavior when storage unavailable]
- [Describe user notification strategy for errors]

**Performance considerations:**
- [Discuss re-render optimization]
- [Explain event listener efficiency]
- [Note JSON serialization cost]

**Possible future improvements:**
- [Improvement 1: Debounce localStorage writes for performance]
- [Improvement 2: Support for session storage in addition to local storage]
- [Improvement 3: Compression for large data]
- [Improvement 4: Encryption support for sensitive data]
- [Improvement 5: Automatic garbage collection of old keys]
- [Improvement 6: Schema versioning and migration support]
- [Improvement 7: Size tracking and quota monitoring]
- [Improvement 8: Batch updates to reduce write operations]
- [Improvement 9: IndexedDB fallback for larger data]
- [Improvement 10: TTL (time-to-live) support for cached data]

---

**REMINDER:** This is a **React custom hook** - it must follow React hooks rules, handle errors gracefully, and provide a clean API similar to useState. Focus on reliability, cross-tab synchronization, and type safety. The hook should be generic and reusable across the application.
