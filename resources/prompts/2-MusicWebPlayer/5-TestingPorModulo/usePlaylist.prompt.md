# TESTING PROMPT #9: `src/hooks/usePlaylist.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** usePlaylist Hook

**File path:** `src/hooks/usePlaylist.ts`

**Test file path:** `tests/hooks/usePlaylist.test.ts`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Hooks/usePlaylist
 * @category Hooks
 * @description
 * This module provides a custom React hook for managing playlist state and operations.
 * It handles playlist persistence, navigation, and song management with localStorage integration.
 */

import { useState, useEffect, useCallback } from 'react';
import { Song } from '@types/song';
import { useLocalStorage } from './useLocalStorage';
import { RepeatMode } from '@types/playback-modes';

/**
 * Interface for the usePlaylist hook return value.
 * @category Hooks
 */
export interface PlaylistHook {
  /** Current playlist of songs */
  playlist: Song[];

  /** Index of the currently selected song */
  currentIndex: number;

  /** Current repeat mode */
  repeatMode: RepeatMode;

  /** Whether shuffle is enabled */
  isShuffled: boolean;

  /** Function to add a song to the playlist */
  addSong: (song: Song) => void;

  /** Function to remove a song by ID */
  removeSong: (id: string) => void;

  /** Function to get song at specific index */
  getSongAt: (index: number) => Song | null;

  /** Function to move to next song */
  next: () => number;

  /** Function to move to previous song */
  previous: () => number;

  /** Function to set current song index */
  setCurrentIndex: (index: number) => void;

  /** Function to set repeat mode */
  setRepeatMode: (mode: RepeatMode) => void;

  /** Function to toggle shuffle */
  toggleShuffle: () => void;

  /** Function to check if there's a next song */
  hasNext: () => boolean;

  /** Function to check if there's a previous song */
  hasPrevious: () => boolean;

  /** Function to get the actual current song index considering shuffle mode */
  getCurrentSongIndex: () => number;

  /** Function to get the current song considering shuffle mode */
  getCurrentSong: () => Song | null;
}

/**
 * Custom hook for managing playlist state and operations.
 * @param initialData Initial playlist data
 * @returns Hook interface with playlist state and operations
 * @category Hooks
 */
export function usePlaylist(initialData: Song[]): PlaylistHook {
  // Use localStorage for persistent playlist storage
  const [playlist, setPlaylist] = useLocalStorage<Song[]>(
    'music-player-playlist',
    initialData
  );

  // Track current song index (persisted)
  const [currentIndex, setCurrentIndex] = useLocalStorage<number>(
    'music-player-current-index',
    0
  );

  // Playback modes
  const [repeatMode, setRepeatModeState] = useLocalStorage<RepeatMode>(
    'music-player-repeat-mode',
    RepeatMode.ALL  // Default to current behavior
  );

  const [isShuffled, setIsShuffled] = useLocalStorage<boolean>(
    'music-player-shuffle',
    false
  );

  // Shuffle queue state
  const [shuffleQueue, setShuffleQueue] = useState<number[]>([]);
  const [shuffleIndex, setShuffleIndex] = useState<number>(0);

  /**
   * Generates a shuffled queue of song indices.
   */
  const generateShuffleQueue = useCallback((): number[] => {
    // Fisher-Yates shuffle
    const indices = Array.from({ length: playlist.length }, (_, i) => i);

    // Keep current song first in shuffle
    const currentSongIndex = indices.indexOf(currentIndex);
    if (currentSongIndex > 0) {
      [indices[0], indices[currentSongIndex]] = [indices[currentSongIndex], indices[0]];
    }

    // Shuffle remaining songs
    for (let i = indices.length - 1; i > 1; i--) {
      const j = Math.floor(Math.random() * (i - 1)) + 1;
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    setShuffleQueue(indices);
    setShuffleIndex(0);
    return indices;
  }, [playlist.length, currentIndex]);


  /**
   * Adds a new song to the playlist.
   * @param song Complete song object with all required fields
   */
  const addSong = useCallback((song: Song): void => {
    setPlaylist(prevPlaylist => {
      // Check for duplicate ID (optional - could allow duplicates)
      if (prevPlaylist.some(existingSong => existingSong.id === song.id)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Song with ID ${song.id} already exists in playlist`);
        }
        return prevPlaylist;
      }
      // Add the new song to the end of the playlist
      return [...prevPlaylist, song];
    });
  }, [setPlaylist]);

  /**
   * Removes a song from the playlist by ID.
   * @param id Unique identifier of song to remove
   */
  const removeSong = useCallback((id: string): void => {
    const indexToRemove = playlist.findIndex(song => song.id === id);
    if (indexToRemove === -1) return;

    const newPlaylist = playlist.filter(song => song.id !== id);
    // Update playlist
    setPlaylist(newPlaylist);

    // Adjust currentIndex if necessary (after setting playlist)
    if (indexToRemove < currentIndex) {
      // Song before current was removed - decrement currentIndex
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else if (indexToRemove === currentIndex) {
      // Current song was removed - set to 0 or last song
      if (newPlaylist.length === 0) {
        setCurrentIndex(0);
      } else {
        const newIndex = Math.min(currentIndex, newPlaylist.length - 1);
        setCurrentIndex(newIndex);
      }
    }

    // If shuffle is enabled, regenerate the queue
    if (isShuffled) {
      generateShuffleQueue();
    }
  }, [playlist, currentIndex, isShuffled, setPlaylist, setCurrentIndex, generateShuffleQueue]);

  /**
   * Retrieves song at specific index.
   * @param index Zero-based index of song to retrieve
   * @returns Song object at index, or null if invalid index
   */
  const getSongAt = (index: number): Song | null => {
    if (playlist.length === 0) {
      return null;
    }

    // Direct index access - the index passed is already the actual playlist index
    if (index < 0 || index >= playlist.length) {
      return null;
    }
    return playlist[index];
  };

  /**
   * Advances to next song in playlist.
   * @returns New currentIndex value
   */
  const next = useCallback((): number => {
    if (repeatMode === RepeatMode.ONE) {
      // Stay on current song (handled in Player's ended event)
      return getCurrentSongIndex();
    }

    if (isShuffled) {
      // Advance in shuffle queue
      const nextShuffleIndex = shuffleIndex + 1;

      if (nextShuffleIndex >= shuffleQueue.length) {
        // End of shuffle queue
        if (repeatMode === RepeatMode.ALL) {
          // Wrap to the start of the existing shuffle queue (cycle)
          if (shuffleQueue.length > 0) {
            setShuffleIndex(0);
            setCurrentIndex(shuffleQueue[0]);
            return shuffleQueue[0];
          }
          return getCurrentSongIndex();
        } else {
          // Repeat Off - stay on last song
          return getCurrentSongIndex();
        }
      }

      setShuffleIndex(nextShuffleIndex);
      // Update persisted currentIndex to match shuffle selection
      const selected = shuffleQueue[nextShuffleIndex];
      setCurrentIndex(selected);
      return selected;
    }

    // Normal sequential mode
    if (currentIndex >= playlist.length - 1) {
      if (repeatMode === RepeatMode.ALL) {
        setCurrentIndex(0);
        return 0;
      } else {
        // Repeat Off - stay on last song
        return currentIndex;
      }
    }

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return newIndex;
  }, [repeatMode, isShuffled, shuffleIndex, shuffleQueue, currentIndex, playlist.length, generateShuffleQueue, setCurrentIndex]);

  /**
   * Goes back to previous song in playlist.
   * @returns New currentIndex value
   */
  const previous = useCallback((): number => {
    if (isShuffled) {
      // Go back in shuffle queue
      const prevShuffleIndex = shuffleIndex - 1;

      if (prevShuffleIndex < 0) {
        // Beginning of shuffle queue
        if (repeatMode === RepeatMode.ALL) {
          // Wrap to end
          const last = shuffleQueue.length - 1;
          if (last >= 0) {
            setShuffleIndex(last);
            setCurrentIndex(shuffleQueue[last]);
            return shuffleQueue[last];
          }
          return getCurrentSongIndex();
        } else {
          // Repeat Off - stay on first song
          return getCurrentSongIndex();
        }
      }

      setShuffleIndex(prevShuffleIndex);
      const selected = shuffleQueue[prevShuffleIndex];
      setCurrentIndex(selected);
      return selected;
    }

    // Normal sequential mode
    if (currentIndex <= 0) {
      if (repeatMode === RepeatMode.ALL) {
        setCurrentIndex(playlist.length - 1);
        return playlist.length - 1;
      } else {
        // Repeat Off - stay on first song
        return currentIndex;
      }
    }

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return newIndex;
  }, [isShuffled, shuffleIndex, shuffleQueue, repeatMode, currentIndex, playlist.length, setCurrentIndex]);

  /**
   * Sets the repeat mode.
   * @param mode The repeat mode to set
   */
  const setRepeatMode = useCallback((mode: RepeatMode): void => {
    setRepeatModeState(mode);
  }, [setRepeatModeState]);

  /**
   * Toggles shuffle mode.
   */
  const toggleShuffle = useCallback((): void => {
    if (isShuffled) {
      // Turning shuffle off
      setIsShuffled(false);
      setShuffleQueue([]);
      setShuffleIndex(0);

      // Set currentIndex to the actual song index
      if (shuffleQueue.length > 0 && shuffleIndex >= 0 && shuffleIndex < shuffleQueue.length) {
        setCurrentIndex(shuffleQueue[shuffleIndex]);
      }
    } else {
      // Turning shuffle on
      setIsShuffled(true);
      generateShuffleQueue();
    }
  }, [isShuffled, shuffleQueue, shuffleIndex, generateShuffleQueue, setIsShuffled, setShuffleQueue, setShuffleIndex, setCurrentIndex]);

  /**
   * Checks if there's a next song available.
   * @returns true if there's a next song, false otherwise
   */
  const hasNext = useCallback((): boolean => {
    if (repeatMode === RepeatMode.ALL) return true; // Always has next in circular mode

    if (isShuffled) {
      return shuffleIndex < shuffleQueue.length - 1;
    }

    return currentIndex < playlist.length - 1;
  }, [repeatMode, isShuffled, shuffleIndex, shuffleQueue.length, currentIndex, playlist.length]);

  /**
   * Checks if there's a previous song available.
   * @returns true if there's a previous song, false otherwise
   */
  const hasPrevious = useCallback((): boolean => {
    if (repeatMode === RepeatMode.ALL) return true; // Always has previous in circular mode

    if (isShuffled) {
      return shuffleIndex > 0;
    }

    return currentIndex > 0;
  }, [repeatMode, isShuffled, shuffleIndex, currentIndex]);

  /**
   * Directly sets the current song index.
   * @param index New index to set
   */
  const setCurrentIndexSafe = useCallback((index: number): void => {
    // If shuffle is enabled, we need to find the position in the shuffle queue
    if (isShuffled && shuffleQueue.length > 0) {
      // Find the position of the requested index in the shuffle queue
      const positionInQueue = shuffleQueue.indexOf(index);
      if (positionInQueue >= 0) {
        setShuffleIndex(positionInQueue);
      } else {
        // If the requested index isn't in the queue, reset to first song
        setShuffleIndex(0);
      }
    } else {
      // Normal mode - clamp to valid range
      const clampedIndex = Math.max(0, Math.min(index, Math.max(0, playlist.length - 1)));
      setCurrentIndex(clampedIndex);
    }
  }, [isShuffled, shuffleQueue, playlist.length, setCurrentIndex]);
  
  /**
   * Gets the actual current song index considering shuffle mode.
   * @returns Current song index
   */
  const getCurrentSongIndex = (): number => {
    if (isShuffled && shuffleQueue.length > 0 && shuffleIndex >= 0 && shuffleIndex < shuffleQueue.length) {
      return shuffleQueue[shuffleIndex];
    }
    return currentIndex;
  };

  /**
   * Gets the current song considering shuffle mode.
   * @returns Current song or null
   */
  const getCurrentSong = (): Song | null => {
    const index = getCurrentSongIndex();
    return getSongAt(index);
  };

  // Reset currentIndex if playlist becomes empty
  useEffect(() => {
    if (playlist.length === 0) {
      setCurrentIndex(0);
    }
  }, [playlist.length]);

  // Update playlist when initialData changes (only if playlist is empty)
  useEffect(() => {
    if (initialData.length > 0 && playlist.length === 0) {
      setPlaylist(initialData);
    }
  }, [initialData, playlist.length, setPlaylist]);

  // Regenerate shuffle queue when playlist changes
  useEffect(() => {
    if (isShuffled && playlist.length > 0) {
      generateShuffleQueue();
    }
  }, [playlist.length, isShuffled]);

  return {
    playlist,
    currentIndex,
    repeatMode,
    isShuffled,
    addSong,
    removeSong,
    getSongAt,
    next,
    previous,
    setCurrentIndex: setCurrentIndexSafe,
    setRepeatMode,
    toggleShuffle,
    hasNext,
    hasPrevious,
    getCurrentSongIndex,
    getCurrentSong
  };
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
  silent: true,
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

### From Code Review #9:

**Component Objective:**
Manages playlist state with repeat/shuffle modes. Provides navigation (next/previous), song management (add/remove), and mode controls (repeat/shuffle). Persists playlist, currentIndex, repeatMode, and isShuffled to localStorage via useLocalStorage. Maintains shuffle queue in memory (not persisted). Returns PlaylistHook interface with 14 methods/properties.

**Requirements:**
- **FR14-FR16:** Playlist management (display, add, remove)
- **FR3-FR4:** Next/Previous navigation
- **NEW:** Repeat modes (OFF, ALL, ONE)
- **NEW:** Shuffle mode with proper navigation
- **FR17:** Persistent storage

**Hook Signature:**
```typescript
function usePlaylist(initialPlaylist: Song[]): PlaylistHook
```

**PlaylistHook Interface:**
```typescript
interface PlaylistHook {
  // State
  playlist: Song[];
  currentIndex: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  
  // Navigation
  next(): number;
  previous(): number;
  hasNext(): boolean;
  hasPrevious(): boolean;
  
  // Song Management
  addSong(song: Song): void;
  removeSong(id: string): void;
  getSongAt(index: number): Song | undefined;
  setCurrentIndex(index: number): void;
  
  // Mode Controls
  setRepeatMode(mode: RepeatMode): void;
  toggleShuffle(): void;
}
```

**Repeat Modes (from RepeatMode enum):**
```typescript
enum RepeatMode {
  OFF = 'OFF',      // Stop at boundaries, no wrap
  ALL = 'ALL',      // Circular wrap around playlist
  ONE = 'ONE'       // Stay on current song, repeat indefinitely
}
```

**Critical Behaviors:**

1. **Repeat OFF:**
   - next() at last song → stays at last (doesn't wrap)
   - previous() at first song → stays at first (doesn't wrap)
   - hasNext() returns false at last song
   - hasPrevious() returns false at first song

2. **Repeat ALL:**
   - next() at last song → wraps to index 0
   - previous() at first song → wraps to last index
   - hasNext() always returns true (if playlist not empty)
   - hasPrevious() always returns true (if playlist not empty)

3. **Repeat ONE:**
   - next() stays on current song
   - previous() stays on current song
   - hasNext() returns false (can't advance)
   - hasPrevious() returns false (can't go back)

4. **Shuffle Mode:**
   - When enabled, generates shuffle queue with Fisher-Yates
   - Current song stays first in shuffle queue
   - next() follows shuffle queue order (not sequential)
   - previous() goes back in shuffle queue
   - When queue exhausted:
     - Repeat ALL → regenerate queue (reshuffle)
     - Repeat OFF → stop at last shuffled song
   - When disabled, returns to sequential navigation

5. **removeSong:**
   - Removes song from playlist
   - Adjusts currentIndex if needed:
     - If removed song before current → decrement currentIndex
     - If removed song is current → stay at same index (play next song)
     - If removed song after current → no change to currentIndex

6. **Persistence:**
   - playlist persisted via useLocalStorage
   - currentIndex persisted via useLocalStorage
   - repeatMode persisted via useLocalStorage
   - isShuffled persisted via useLocalStorage
   - Shuffle queue NOT persisted (regenerated when needed)

**Usage Context:**
- Used by Player component to manage playlist
- Provides all playlist operations
- Integrates with useAudioPlayer for playback
- Called frequently during navigation

---

## USE CASE DIAGRAM

```
usePlaylist Hook
├── State Management
│   ├── playlist (persisted)
│   ├── currentIndex (persisted)
│   ├── repeatMode (persisted)
│   ├── isShuffled (persisted)
│   └── shuffleQueue (memory only)
│
├── Navigation
│   ├── next() - Respect repeat/shuffle
│   ├── previous() - Respect repeat/shuffle
│   ├── hasNext() - Check boundaries
│   └── hasPrevious() - Check boundaries
│
├── Song Management
│   ├── addSong() - Add to playlist
│   ├── removeSong() - Remove + adjust index
│   ├── getSongAt() - Get by index
│   └── setCurrentIndex() - Set position
│
└── Mode Controls
    ├── setRepeatMode() - OFF/ALL/ONE
    └── toggleShuffle() - ON/OFF + regenerate queue
```

---

## TASK

Generate a complete unit test suite for the **usePlaylist hook** that covers:

### 1. INITIALIZATION
Test hook initialization:
- Hook returns PlaylistHook interface with all 14 members
- playlist initialized with initialPlaylist
- currentIndex starts at 0
- repeatMode starts at OFF (default)
- isShuffled starts at false (default)
- All methods are functions

### 2. NAVIGATION - REPEAT OFF
Test next/previous with Repeat OFF:
- next() increments currentIndex
- next() at last song stays at last (no wrap)
- previous() decrements currentIndex
- previous() at first song stays at first (no wrap)
- hasNext() returns false at last song
- hasPrevious() returns false at first song
- Returns new currentIndex from next/previous

### 3. NAVIGATION - REPEAT ALL
Test next/previous with Repeat ALL:
- next() at last song wraps to index 0
- previous() at first song wraps to last index
- hasNext() always returns true (circular)
- hasPrevious() always returns true (circular)
- Multiple wraps work correctly

### 4. NAVIGATION - REPEAT ONE
Test next/previous with Repeat ONE:
- next() stays on current song
- previous() stays on current song
- hasNext() returns false
- hasPrevious() returns false
- currentIndex doesn't change

### 5. SHUFFLE MODE - BASIC
Test shuffle functionality:
- toggleShuffle() enables shuffle (isShuffled = true)
- toggleShuffle() again disables shuffle (isShuffled = false)
- Shuffle generates shuffle queue
- Current song stays first in shuffle queue
- next() follows shuffle queue (not sequential)

### 6. SHUFFLE MODE - NAVIGATION
Test shuffle navigation:
- next() in shuffle follows queue order
- Can navigate through entire shuffle queue
- Queue exhaustion with Repeat ALL → regenerates queue
- Queue exhaustion with Repeat OFF → stops at end
- previous() goes back in shuffle queue

### 7. SHUFFLE MODE - FISHER-YATES
Test shuffle algorithm:
- Shuffle queue contains all songs
- Shuffle queue length equals playlist length
- No duplicate songs in shuffle queue
- Current song is first in queue
- All other songs shuffled

### 8. SONG MANAGEMENT - ADD
Test addSong:
- addSong() adds song to playlist
- Song appears at end of playlist
- Playlist length increases by 1
- Adding multiple songs works
- Can add duplicate songs (same ID)

### 9. SONG MANAGEMENT - REMOVE
Test removeSong:
- removeSong() removes song by ID
- Playlist length decreases by 1
- Removing non-existent ID does nothing
- Removing current song adjusts index correctly
- Removing song before current decrements index
- Removing song after current doesn't change index

### 10. SONG MANAGEMENT - REMOVE EDGE CASES
Test removeSong edge cases:
- Remove current song when at index 0
- Remove current song when at last index
- Remove last song in playlist
- Remove all songs except one
- Remove song from shuffled playlist

### 11. GETSONGAT
Test getSongAt:
- Returns correct song at valid index
- Returns undefined for index out of bounds
- Returns undefined for negative index
- Works with index 0
- Works with last index

### 12. SETCURRENTINDEX
Test setCurrentIndex:
- Sets currentIndex to specified value
- Accepts valid indices
- Handles out-of-bounds indices (clamp or ignore)
- Works with index 0
- Works with last index

### 13. SETREPEATMODE
Test setRepeatMode:
- Changes repeatMode to OFF
- Changes repeatMode to ALL
- Changes repeatMode to ONE
- RepeatMode persists across re-renders

### 14. PERSISTENCE
Test localStorage persistence:
- playlist persisted via useLocalStorage
- currentIndex persisted via useLocalStorage
- repeatMode persisted via useLocalStorage
- isShuffled persisted via useLocalStorage
- Shuffle queue NOT persisted (memory only)
- Data restored on remount

### 15. INTEGRATION
Test integration scenarios:
- Shuffle + Repeat ALL works correctly
- Shuffle + Repeat OFF works correctly
- Remove song while shuffled
- Add song while shuffled
- Change repeat mode while shuffled
- Navigate then change modes

### 16. EDGE CASES
Test edge cases:
- Empty playlist
- Single song playlist
- Very large playlist (1000+ songs)
- Rapid next() calls
- Rapid removeSong() calls
- Toggle shuffle multiple times

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Song } from '@/types/song';
import { RepeatMode } from '@/types/playback-modes';

describe('usePlaylist Hook', () => {
  // Mock songs for testing
  const mockSongs: Song[] = [
    { id: '1', title: 'Song 1', artist: 'Artist 1', cover: '/1.jpg', url: '/1.mp3' },
    { id: '2', title: 'Song 2', artist: 'Artist 2', cover: '/2.jpg', url: '/2.mp3' },
    { id: '3', title: 'Song 3', artist: 'Artist 3', cover: '/3.jpg', url: '/3.mp3' },
    { id: '4', title: 'Song 4', artist: 'Artist 4', cover: '/4.jpg', url: '/4.mp3' },
    { id: '5', title: 'Song 5', artist: 'Artist 5', cover: '/5.jpg', url: '/5.mp3' }
  ];

  beforeEach(() => {
    // Mock localStorage
    let store: { [key: string]: string } = {};
    
    global.Storage.prototype.getItem = jest.fn((key: string) => store[key] || null);
    global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      store[key] = value;
    });
    global.Storage.prototype.removeItem = jest.fn((key: string) => {
      delete store[key];
    });
    global.Storage.prototype.clear = jest.fn(() => {
      store = {};
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should return PlaylistHook interface with all members', () => {
      // ACT
      const { result } = renderHook(() => usePlaylist(mockSongs));

      // ASSERT
      expect(result.current).toHaveProperty('playlist');
      expect(result.current).toHaveProperty('currentIndex');
      expect(result.current).toHaveProperty('repeatMode');
      expect(result.current).toHaveProperty('isShuffled');
      expect(result.current).toHaveProperty('next');
      expect(result.current).toHaveProperty('previous');
      expect(result.current).toHaveProperty('hasNext');
      expect(result.current).toHaveProperty('hasPrevious');
      expect(result.current).toHaveProperty('addSong');
      expect(result.current).toHaveProperty('removeSong');
      expect(result.current).toHaveProperty('getSongAt');
      expect(result.current).toHaveProperty('setCurrentIndex');
      expect(result.current).toHaveProperty('setRepeatMode');
      expect(result.current).toHaveProperty('toggleShuffle');
    });

    it('should initialize with provided playlist', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      expect(result.current.playlist).toEqual(mockSongs);
      expect(result.current.playlist).toHaveLength(5);
    });

    it('should initialize currentIndex at 0', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      expect(result.current.currentIndex).toBe(0);
    });

    it('should initialize repeatMode to OFF', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      expect(result.current.repeatMode).toBe(RepeatMode.OFF);
    });

    it('should initialize isShuffled to false', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      expect(result.current.isShuffled).toBe(false);
    });

    it('should have all methods as functions', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      expect(typeof result.current.next).toBe('function');
      expect(typeof result.current.previous).toBe('function');
      expect(typeof result.current.hasNext).toBe('function');
      expect(typeof result.current.hasPrevious).toBe('function');
      expect(typeof result.current.addSong).toBe('function');
      expect(typeof result.current.removeSong).toBe('function');
      expect(typeof result.current.getSongAt).toBe('function');
      expect(typeof result.current.setCurrentIndex).toBe('function');
      expect(typeof result.current.setRepeatMode).toBe('function');
      expect(typeof result.current.toggleShuffle).toBe('function');
    });
  });

  describe('Navigation - Repeat OFF', () => {
    it('should increment currentIndex when next() is called', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.next();
      });

      expect(result.current.currentIndex).toBe(1);

      act(() => {
        result.current.next();
      });

      expect(result.current.currentIndex).toBe(2);
    });

    it('should stay at last song when next() called at end (Repeat OFF)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      // Navigate to last song
      act(() => {
        result.current.setCurrentIndex(4); // Last index
      });

      expect(result.current.currentIndex).toBe(4);

      // Try to go next
      act(() => {
        result.current.next();
      });

      // Should stay at last
      expect(result.current.currentIndex).toBe(4);
    });

    it('should decrement currentIndex when previous() is called', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      // Start at index 2
      act(() => {
        result.current.setCurrentIndex(2);
      });

      act(() => {
        result.current.previous();
      });

      expect(result.current.currentIndex).toBe(1);

      act(() => {
        result.current.previous();
      });

      expect(result.current.currentIndex).toBe(0);
    });

    it('should stay at first song when previous() called at start (Repeat OFF)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      expect(result.current.currentIndex).toBe(0);

      act(() => {
        result.current.previous();
      });

      // Should stay at first
      expect(result.current.currentIndex).toBe(0);
    });

    it('should return false from hasNext() at last song (Repeat OFF)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(4); // Last song
      });

      expect(result.current.hasNext()).toBe(false);
    });

    it('should return false from hasPrevious() at first song (Repeat OFF)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.hasPrevious()).toBe(false);
    });

    it('should return new currentIndex from next()', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      let newIndex: number;

      act(() => {
        newIndex = result.current.next();
      });

      expect(newIndex!).toBe(1);
      expect(result.current.currentIndex).toBe(1);
    });

    it('should return new currentIndex from previous()', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(2);
      });

      let newIndex: number;

      act(() => {
        newIndex = result.current.previous();
      });

      expect(newIndex!).toBe(1);
      expect(result.current.currentIndex).toBe(1);
    });
  });

  describe('Navigation - Repeat ALL', () => {
    it('should wrap to first song when next() at end (Repeat ALL)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.setCurrentIndex(4); // Last song
      });

      act(() => {
        result.current.next();
      });

      // Should wrap to first
      expect(result.current.currentIndex).toBe(0);
    });

    it('should wrap to last song when previous() at start (Repeat ALL)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
      });

      expect(result.current.currentIndex).toBe(0);

      act(() => {
        result.current.previous();
      });

      // Should wrap to last
      expect(result.current.currentIndex).toBe(4);
    });

    it('should return true from hasNext() always (Repeat ALL)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.setCurrentIndex(4); // Last song
      });

      expect(result.current.hasNext()).toBe(true);
    });

    it('should return true from hasPrevious() always (Repeat ALL)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.hasPrevious()).toBe(true);
    });

    it('should handle multiple wraps correctly', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.setCurrentIndex(4);
      });

      // Wrap forward
      act(() => {
        result.current.next(); // Wrap to 0
        result.current.next(); // Go to 1
        result.current.next(); // Go to 2
      });

      expect(result.current.currentIndex).toBe(2);
    });
  });

  describe('Navigation - Repeat ONE', () => {
    it('should stay on current song when next() called (Repeat ONE)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
        result.current.setCurrentIndex(2);
      });

      act(() => {
        result.current.next();
      });

      // Should stay at same index
      expect(result.current.currentIndex).toBe(2);
    });

    it('should stay on current song when previous() called (Repeat ONE)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
        result.current.setCurrentIndex(2);
      });

      act(() => {
        result.current.previous();
      });

      // Should stay at same index
      expect(result.current.currentIndex).toBe(2);
    });

    it('should return false from hasNext() (Repeat ONE)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
      });

      expect(result.current.hasNext()).toBe(false);
    });

    it('should return false from hasPrevious() (Repeat ONE)', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
      });

      expect(result.current.hasPrevious()).toBe(false);
    });
  });

  describe('Shuffle Mode - Basic', () => {
    it('should enable shuffle when toggleShuffle() called', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      expect(result.current.isShuffled).toBe(false);

      act(() => {
        result.current.toggleShuffle();
      });

      expect(result.current.isShuffled).toBe(true);
    });

    it('should disable shuffle when toggleShuffle() called again', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle(); // Enable
      });

      expect(result.current.isShuffled).toBe(true);

      act(() => {
        result.current.toggleShuffle(); // Disable
      });

      expect(result.current.isShuffled).toBe(false);
    });

    it('should keep current song first in shuffle queue', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      // Set current song to index 2
      act(() => {
        result.current.setCurrentIndex(2);
        result.current.toggleShuffle();
      });

      // Current song should still be at index 2
      expect(result.current.currentIndex).toBe(2);
      
      // First next() should be a shuffled song (not sequential)
      const currentSong = result.current.getSongAt(result.current.currentIndex);
      
      act(() => {
        result.current.next();
      });

      const nextSong = result.current.getSongAt(result.current.currentIndex);
      
      // Next song should exist (not undefined)
      expect(nextSong).toBeDefined();
    });
  });

  describe('Shuffle Mode - Navigation', () => {
    it('should navigate through shuffle queue in shuffled order', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle();
      });

      const visitedIndices: number[] = [result.current.currentIndex];

      // Navigate through entire queue
      act(() => {
        for (let i = 0; i < mockSongs.length - 1; i++) {
          result.current.next();
          visitedIndices.push(result.current.currentIndex);
        }
      });

      // Should have visited all songs
      expect(visitedIndices).toHaveLength(mockSongs.length);
      
      // All indices should be unique (visited each song once)
      const uniqueIndices = new Set(visitedIndices);
      expect(uniqueIndices.size).toBe(mockSongs.length);
    });

    it('should regenerate shuffle queue when exhausted with Repeat ALL', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.toggleShuffle();
      });

      // Navigate through entire queue
      act(() => {
        for (let i = 0; i < mockSongs.length; i++) {
          result.current.next();
        }
      });

      // Should have regenerated queue and continue
      expect(result.current.currentIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.currentIndex).toBeLessThan(mockSongs.length);
    });

    it('should stop at end when shuffle queue exhausted with Repeat OFF', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
        result.current.toggleShuffle();
      });

      const startIndex = result.current.currentIndex;

      // Navigate to end of shuffle queue
      act(() => {
        for (let i = 0; i < mockSongs.length; i++) {
          result.current.next();
        }
      });

      const finalIndex = result.current.currentIndex;

      // Should have stopped, not wrapped
      expect(result.current.hasNext()).toBe(false);
    });

    it('should support previous() in shuffle mode', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle();
        result.current.next();
        result.current.next();
      });

      const forwardIndex = result.current.currentIndex;

      act(() => {
        result.current.previous();
      });

      // Should go back in shuffle queue
      expect(result.current.currentIndex).not.toBe(forwardIndex);
    });
  });

  describe('Shuffle Mode - Fisher-Yates Algorithm', () => {
    it('should shuffle all songs in queue', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle();
      });

      // Navigate through all songs and collect them
      const shuffledSongIds = new Set<string>();
      shuffledSongIds.add(result.current.getSongAt(result.current.currentIndex)!.id);

      act(() => {
        for (let i = 0; i < mockSongs.length - 1; i++) {
          result.current.next();
          const song = result.current.getSongAt(result.current.currentIndex);
          if (song) shuffledSongIds.add(song.id);
        }
      });

      // Should have all songs
      expect(shuffledSongIds.size).toBe(mockSongs.length);
    });

    it('should not have duplicate songs in shuffle queue', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle();
      });

      const visitedIds: string[] = [];
      visitedIds.push(result.current.getSongAt(result.current.currentIndex)!.id);

      act(() => {
        for (let i = 0; i < mockSongs.length - 1; i++) {
          result.current.next();
          visitedIds.push(result.current.getSongAt(result.current.currentIndex)!.id);
        }
      });

      // No duplicates
      const uniqueIds = new Set(visitedIds);
      expect(uniqueIds.size).toBe(visitedIds.length);
    });
  });

  describe('Song Management - Add', () => {
    it('should add song to playlist', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const newSong: Song = {
        id: '6',
        title: 'New Song',
        artist: 'New Artist',
        cover: '/6.jpg',
        url: '/6.mp3'
      };

      act(() => {
        result.current.addSong(newSong);
      });

      expect(result.current.playlist).toHaveLength(6);
      expect(result.current.playlist[5]).toEqual(newSong);
    });

    it('should add song at end of playlist', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const song1: Song = { id: '6', title: 'Song 6', artist: 'Artist 6', cover: '/6.jpg', url: '/6.mp3' };
      const song2: Song = { id: '7', title: 'Song 7', artist: 'Artist 7', cover: '/7.jpg', url: '/7.mp3' };

      act(() => {
        result.current.addSong(song1);
        result.current.addSong(song2);
      });

      expect(result.current.playlist[5]).toEqual(song1);
      expect(result.current.playlist[6]).toEqual(song2);
    });

    it('should increase playlist length by 1', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const initialLength = result.current.playlist.length;

      act(() => {
        result.current.addSong({
          id: 'new',
          title: 'New',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        });
      });

      expect(result.current.playlist.length).toBe(initialLength + 1);
    });
  });

  describe('Song Management - Remove', () => {
    it('should remove song by ID', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.removeSong('2');
      });

      expect(result.current.playlist).toHaveLength(4);
      expect(result.current.playlist.find(s => s.id === '2')).toBeUndefined();
    });

    it('should do nothing when removing non-existent ID', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const initialLength = result.current.playlist.length;

      act(() => {
        result.current.removeSong('non-existent');
      });

      expect(result.current.playlist.length).toBe(initialLength);
    });

    it('should decrement currentIndex when removing song before current', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(3);
      });

      expect(result.current.currentIndex).toBe(3);

      act(() => {
        result.current.removeSong('2'); // Remove song at index 1 (before current)
      });

      // Index should be decremented
      expect(result.current.currentIndex).toBe(2);
    });

    it('should not change currentIndex when removing song after current', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(1);
      });

      act(() => {
        result.current.removeSong('4'); // Remove song at index 3 (after current)
      });

      // Index should stay the same
      expect(result.current.currentIndex).toBe(1);
    });

    it('should handle removing current song correctly', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(2);
      });

      const currentSongId = result.current.getSongAt(2)!.id;

      act(() => {
        result.current.removeSong(currentSongId);
      });

      // Index should stay at 2 (now points to next song)
      expect(result.current.currentIndex).toBe(2);
      
      // Song at index 2 should be different
      const newSong = result.current.getSongAt(2);
      expect(newSong?.id).not.toBe(currentSongId);
    });
  });

  describe('Song Management - Remove Edge Cases', () => {
    it('should handle removing song at index 0', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.removeSong('1'); // First song
      });

      expect(result.current.playlist).toHaveLength(4);
      expect(result.current.playlist[0].id).toBe('2');
    });

    it('should handle removing last song', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.removeSong('5'); // Last song
      });

      expect(result.current.playlist).toHaveLength(4);
    });

    it('should handle removing current song when at last index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(4); // Last index
        result.current.removeSong('5'); // Remove current (last)
      });

      // Should adjust index to new last
      expect(result.current.currentIndex).toBeLessThan(result.current.playlist.length);
    });
  });

  describe('getSongAt', () => {
    it('should return correct song at valid index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const song = result.current.getSongAt(2);

      expect(song).toEqual(mockSongs[2]);
    });

    it('should return undefined for index out of bounds', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const song = result.current.getSongAt(10);

      expect(song).toBeUndefined();
    });

    it('should return undefined for negative index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const song = result.current.getSongAt(-1);

      expect(song).toBeUndefined();
    });

    it('should work with index 0', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const song = result.current.getSongAt(0);

      expect(song).toEqual(mockSongs[0]);
    });

    it('should work with last index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      const song = result.current.getSongAt(4);

      expect(song).toEqual(mockSongs[4]);
    });
  });

  describe('setCurrentIndex', () => {
    it('should set currentIndex to specified value', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(3);
      });

      expect(result.current.currentIndex).toBe(3);
    });

    it('should accept index 0', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(2);
        result.current.setCurrentIndex(0);
      });

      expect(result.current.currentIndex).toBe(0);
    });

    it('should accept last index', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(4);
      });

      expect(result.current.currentIndex).toBe(4);
    });

    it('should handle out-of-bounds indices gracefully', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(100);
      });

      // Should either clamp or ignore
      expect(result.current.currentIndex).toBeLessThan(mockSongs.length);
    });
  });

  describe('setRepeatMode', () => {
    it('should change repeatMode to OFF', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.setRepeatMode(RepeatMode.OFF);
      });

      expect(result.current.repeatMode).toBe(RepeatMode.OFF);
    });

    it('should change repeatMode to ALL', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
      });

      expect(result.current.repeatMode).toBe(RepeatMode.ALL);
    });

    it('should change repeatMode to ONE', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ONE);
      });

      expect(result.current.repeatMode).toBe(RepeatMode.ONE);
    });
  });

  describe('Persistence', () => {
    it('should persist playlist to localStorage', () => {
      renderHook(() => usePlaylist(mockSongs));

      expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
        expect.stringContaining('playlist'),
        expect.any(String)
      );
    });

    it('should persist currentIndex to localStorage', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setCurrentIndex(2);
      });

      expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
        expect.stringContaining('currentIndex'),
        expect.stringContaining('2')
      );
    });

    it('should persist repeatMode to localStorage', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
      });

      expect(global.Storage.prototype.setItem).toHaveBeenCalled();
    });

    it('should persist isShuffled to localStorage', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle();
      });

      expect(global.Storage.prototype.setItem).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should work with shuffle and Repeat ALL', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        result.current.toggleShuffle();
      });

      // Navigate through queue twice
      act(() => {
        for (let i = 0; i < mockSongs.length * 2; i++) {
          result.current.next();
        }
      });

      // Should have wrapped and continued
      expect(result.current.currentIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle remove song while shuffled', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle();
        result.current.removeSong('3');
      });

      expect(result.current.playlist).toHaveLength(4);
      expect(result.current.isShuffled).toBe(true);
    });

    it('should handle add song while shuffled', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle();
        result.current.addSong({
          id: '6',
          title: 'New Song',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        });
      });

      expect(result.current.playlist).toHaveLength(6);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty playlist', () => {
      const { result } = renderHook(() => usePlaylist([]));

      expect(result.current.playlist).toHaveLength(0);
      expect(result.current.hasNext()).toBe(false);
      expect(result.current.hasPrevious()).toBe(false);
    });

    it('should handle single song playlist', () => {
      const { result } = renderHook(() => usePlaylist([mockSongs[0]]));

      act(() => {
        result.current.setRepeatMode(RepeatMode.OFF);
      });

      expect(result.current.hasNext()).toBe(false);
      expect(result.current.hasPrevious()).toBe(false);
    });

    it('should handle rapid next() calls', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.setRepeatMode(RepeatMode.ALL);
        for (let i = 0; i < 100; i++) {
          result.current.next();
        }
      });

      expect(result.current.currentIndex).toBeGreaterThanOrEqual(0);
      expect(result.current.currentIndex).toBeLessThan(mockSongs.length);
    });

    it('should handle toggling shuffle multiple times', () => {
      const { result } = renderHook(() => usePlaylist(mockSongs));

      act(() => {
        result.current.toggleShuffle(); // On
        result.current.toggleShuffle(); // Off
        result.current.toggleShuffle(); // On
        result.current.toggleShuffle(); // Off
      });

      expect(result.current.isShuffled).toBe(false);
    });
  });
});
```

---

## TEST REQUIREMENTS

### React Testing Library:
- [ ] Use `renderHook` for all tests
- [ ] Use `act` for all state updates
- [ ] Mock localStorage
- [ ] Test all 14 interface members

### Repeat Mode Testing:
- [ ] Test all 3 modes (OFF, ALL, ONE)
- [ ] Verify boundary behavior for each
- [ ] Test hasNext/hasPrevious for each

### Shuffle Testing:
- [ ] Verify Fisher-Yates algorithm
- [ ] Test queue navigation
- [ ] Test queue exhaustion
- [ ] Test current song stays first

### Song Management:
- [ ] Test add (end of playlist)
- [ ] Test remove (adjust index)
- [ ] Test remove edge cases
- [ ] Test getSongAt bounds

### Integration:
- [ ] Shuffle + Repeat modes
- [ ] Add/remove while shuffled
- [ ] Mode changes during playback

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/hooks/usePlaylist.test.ts
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Initialization | 6 |
| Navigation - Repeat OFF | 8 |
| Navigation - Repeat ALL | 5 |
| Navigation - Repeat ONE | 4 |
| Shuffle - Basic | 3 |
| Shuffle - Navigation | 5 |
| Shuffle - Algorithm | 2 |
| Song Add | 3 |
| Song Remove | 5 |
| Remove Edge Cases | 3 |
| getSongAt | 5 |
| setCurrentIndex | 4 |
| setRepeatMode | 3 |
| Persistence | 4 |
| Integration | 3 |
| Edge Cases | 4 |
| **TOTAL** | **67** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/hooks/usePlaylist.test.ts
npm test -- --coverage tests/hooks/usePlaylist.test.ts
```
