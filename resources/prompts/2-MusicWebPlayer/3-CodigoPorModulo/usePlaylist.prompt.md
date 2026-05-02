Perfect! Let's move to **Module #9: `src/hooks/usePlaylist.ts`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Hooks Layer - Playlist Management Hook

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
│   │   ├── usePlaylist.ts             ← CURRENT MODULE
│   │   └── useLocalStorage.ts         ← COMPLETED
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

# CODE STRUCTURE REMINDER

```typescript
import {useState} from 'react';
import {Song} from '@types/song';
import {useLocalStorage} from './useLocalStorage';

/**
 * Interface for the usePlaylist hook return value.
 * @category Hooks
 */
export interface PlaylistHook {
  /** Current playlist of songs */
  playlist: Song[];
  
  /** Index of the currently selected song */
  currentIndex: number;
  
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
}

/**
 * Custom hook for managing playlist state and operations.
 * @param initialData Initial playlist data
 * @returns Hook interface with playlist state and operations
 * @category Hooks
 */
export function usePlaylist(initialData: Song[]): PlaylistHook {
  const storage = useLocalStorage<Song[]>('music-player-playlist', initialData);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addSong = (song: Song): void => {
    // TODO: Implementation
  };

  const removeSong = (id: string): void => {
    // TODO: Implementation
  };

  const getSongAt = (index: number): Song | null => {
    // TODO: Implementation
    return null;
  };

  const next = (): number => {
    // TODO: Implementation
    return 0;
  };

  const previous = (): number => {
    // TODO: Implementation
    return 0;
  };

  const saveToStorage = (): void => {
    // TODO: Implementation
  };

  const loadFromStorage = (): Song[] => {
    // TODO: Implementation
    return [];
  };

  return {
    playlist: storage.storedValue,
    currentIndex,
    addSong,
    removeSong,
    getSongAt,
    next,
    previous,
    setCurrentIndex,
  };
}
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR4:** Advance to next song in playlist - when clicking Next, the current song stops, the progress bar resets, and playback of the next song in the list begins
- **FR5:** Go back to previous song in playlist - when clicking Previous, the current song stops, the progress bar resets, and playback of the previous song in the list begins
- **FR14:** Display complete list of songs in playlist - the interface shows all available songs in the playlist with their titles and artists
- **FR15:** Add songs to local playlist - the user can add new songs by providing title, artist, cover URL, and audio URL
- **FR16:** Remove songs from playlist - the user can delete existing songs from the playlist through a specific button or action
- **FR17:** Persistent playlist storage - the playlist is saved in localStorage or JSON file to persist between browser sessions
- **FR18:** Real-time playlist update - when adding or removing songs, the list displayed in the interface updates immediately without reloading
- **FR19:** Initial dataset with minimum 5 example songs

**Relevant Non-Functional Requirements:**
- **NFR4:** Use of React hooks and reusable functions - custom hooks are implemented for common logic (useAudioPlayer, usePlaylist) and reused throughout the application
- **NFR5:** Static typing with TypeScript in all components
- **NFR8:** Immediate response to user interactions - user actions respond in less than 100ms
- **NFR9:** Proper error handling without application blocking

## 2. Class Diagram (Relevant Section)

```typescript
class usePlaylist {
    <<hook>>
    -playlist: Song[]
    -currentIndex: number
    -storage: LocalStorageHook
    
    +usePlaylist(initialData: Song[]): PlaylistHook
    +addSong(song: Song): void
    +removeSong(id: string): void
    +getSongAt(index: number): Song | null
    +next(): number
    +previous(): number
    +setCurrentIndex(index: number): void
    -saveToStorage(): void
    -loadFromStorage(): Song[]
}

class PlaylistHook {
    <<interface>>
    +playlist: Song[]
    +currentIndex: number
    +addSong: Function
    +removeSong: Function
    +getSongAt: Function
    +next: Function
    +previous: Function
    +setCurrentIndex: Function
}

class Song {
    <<interface>>
    +id: string
    +title: string
    +artist: string
    +cover: string
    +url: string
}
```

**Relationships:**
- Used by: `Player` component (manages playlist state)
- Uses: `useLocalStorage` hook (persists playlist data)
- Uses: `Song` interface (from types/song.ts)
- Uses: `PlaylistDataProvider` (loads initial data)

## 3. Use Case Diagram (Relevant Use Cases)

- **Skip to Next Song:** User clicks next → System advances currentIndex → Returns new index
- **Return to Previous Song:** User clicks previous → System decrements currentIndex → Returns new index
- **Add Song to Playlist:** User submits song → System validates → Adds to playlist → Saves to localStorage
- **Remove Song from Playlist:** User clicks delete → System removes song → Updates playlist → Saves to localStorage
- **View Playlist:** User sees complete song list with current song highlighted
- **Select Song:** User clicks song → System sets currentIndex → Song starts playing

---

# SPECIFIC TASK

Implement the custom React hook: **`src/hooks/usePlaylist.ts`**

## Responsibilities:

1. **Manage playlist state** (array of songs)
2. **Track current song index** for playback navigation
3. **Persist playlist** to localStorage automatically
4. **Provide CRUD operations** for playlist management (add, remove, get)
5. **Handle navigation** (next, previous, direct selection)
6. **Load initial data** from localStorage or default playlist
7. **Ensure data consistency** and handle edge cases

## Hook Signature and Return Type:

### **usePlaylist(initialData: Song[]): PlaylistHook**

A custom React hook that manages playlist state with persistence.

- **Description:** Manages the song playlist with localStorage persistence, current song tracking, and navigation methods
- **Parameters:**
  - `initialData` (Song[]): Default playlist to use if localStorage is empty (from PlaylistDataProvider)
- **Returns:** 
  - `PlaylistHook`: Object containing playlist state and methods
    ```typescript
    {
      playlist: Song[],
      currentIndex: number,
      addSong: (song: Song) => void,
      removeSong: (id: string) => void,
      getSongAt: (index: number) => Song | null,
      next: () => number,
      previous: () => number,
      setCurrentIndex: (index: number) => void
    }
    ```
- **Examples:**
  ```typescript
  const playlistManager = usePlaylist(PlaylistDataProvider.loadInitialPlaylist());
  
  // Access current song
  const currentSong = playlistManager.getSongAt(playlistManager.currentIndex);
  
  // Add new song
  playlistManager.addSong(newSong);
  
  // Navigate
  const nextIndex = playlistManager.next();
  
  // Remove song
  playlistManager.removeSong("song-id-123");
  ```

---

## Methods/Functions to Implement:

### 1. **addSong(song: Song): void**

Adds a new song to the playlist.

- **Description:** Adds a song to the end of the playlist and persists to localStorage
- **Parameters:**
  - `song` (Song): Complete song object with all required fields
- **Returns:** void
- **Side effects:**
  - Updates playlist state
  - Automatically saves to localStorage (via useLocalStorage)
  - Triggers re-render
- **Preconditions:**
  - song should have all required fields
  - song.id should be unique (consider validation)
- **Postconditions:**
  - Song added to end of playlist array
  - Playlist persisted to localStorage
  - UI updates immediately
- **Edge cases:**
  - Duplicate song ID → Add anyway or reject? (Decision needed)
  - Empty/invalid song → Should validate before adding
  - Very large playlist → Consider max size limit
- **Implementation considerations:**
  ```typescript
  const addSong = (song: Song) => {
    setPlaylist(prevPlaylist => [...prevPlaylist, song]);
  };
  ```

### 2. **removeSong(id: string): void**

Removes a song from the playlist by ID.

- **Description:** Removes song matching the given ID from the playlist and adjusts currentIndex if necessary
- **Parameters:**
  - `id` (string): Unique identifier of song to remove
- **Returns:** void
- **Side effects:**
  - Updates playlist state
  - Adjusts currentIndex if needed
  - Automatically saves to localStorage
- **Preconditions:**
  - id should be valid string
- **Postconditions:**
  - Song with matching ID removed from playlist
  - If removed song was before current, currentIndex decremented
  - If removed song was current, currentIndex stays same (moves to next song)
  - If removed song was last and current, currentIndex set to 0 or last valid index
  - Playlist persisted to localStorage
- **Edge cases:**
  - Song ID not found → No-op or log warning
  - Removing currently playing song → Adjust index appropriately
  - Removing last song → Handle empty playlist
  - Playlist becomes empty → currentIndex set to 0
- **Implementation considerations:**
  ```typescript
  const removeSong = (id: string) => {
    setPlaylist(prevPlaylist => {
      const indexToRemove = prevPlaylist.findIndex(song => song.id === id);
      if (indexToRemove === -1) return prevPlaylist;
      
      // Adjust currentIndex if necessary
      if (indexToRemove < currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (indexToRemove === currentIndex && currentIndex >= prevPlaylist.length - 1) {
        setCurrentIndex(Math.max(0, prevPlaylist.length - 2));
      }
      
      return prevPlaylist.filter(song => song.id !== id);
    });
  };
  ```

### 3. **getSongAt(index: number): Song | null**

Retrieves song at specific index.

- **Description:** Returns the song at the given index, or null if index is out of bounds
- **Parameters:**
  - `index` (number): Zero-based index of song to retrieve
- **Returns:** 
  - `Song | null`: Song object at index, or null if invalid index
- **Examples:**
  - `getSongAt(0)` → First song
  - `getSongAt(currentIndex)` → Currently playing song
  - `getSongAt(-1)` → null
  - `getSongAt(9999)` → null
- **Preconditions:** None (handles all inputs)
- **Postconditions:** 
  - Returns valid Song or null
  - Never throws exception
- **Edge cases:**
  - Negative index → return null
  - Index >= playlist.length → return null
  - Empty playlist → return null
- **Implementation considerations:**
  ```typescript
  const getSongAt = (index: number): Song | null => {
    if (index < 0 || index >= playlist.length) return null;
    return playlist[index];
  };
  ```

### 4. **next(): number**

Advances to next song in playlist.

- **Description:** Increments currentIndex to next song, wraps to 0 at end of playlist
- **Returns:** 
  - `number`: New currentIndex value
- **Side effects:**
  - Updates currentIndex state
  - Triggers re-render
- **Preconditions:** None
- **Postconditions:** 
  - currentIndex incremented by 1
  - If at end of playlist, wraps to 0 (circular)
  - Returns new index value
- **Edge cases:**
  - Empty playlist → return 0
  - Last song → wrap to 0 (repeat playlist)
  - Single song → stay at 0
- **Implementation considerations:**
  ```typescript
  const next = (): number => {
    const newIndex = (currentIndex + 1) % Math.max(playlist.length, 1);
    setCurrentIndex(newIndex);
    return newIndex;
  };
  ```

### 5. **previous(): number**

Goes back to previous song in playlist.

- **Description:** Decrements currentIndex to previous song, wraps to end at beginning of playlist
- **Returns:** 
  - `number`: New currentIndex value
- **Side effects:**
  - Updates currentIndex state
  - Triggers re-render
- **Preconditions:** None
- **Postconditions:** 
  - currentIndex decremented by 1
  - If at beginning of playlist, wraps to last song (circular)
  - Returns new index value
- **Edge cases:**
  - Empty playlist → return 0
  - First song → wrap to last song
  - Single song → stay at 0
- **Implementation considerations:**
  ```typescript
  const previous = (): number => {
    const newIndex = currentIndex === 0 
      ? Math.max(playlist.length - 1, 0) 
      : currentIndex - 1;
    setCurrentIndex(newIndex);
    return newIndex;
  };
  ```

### 6. **setCurrentIndex(index: number): void**

Directly sets the current song index.

- **Description:** Sets currentIndex to specific value (used when user clicks on song in playlist)
- **Parameters:**
  - `index` (number): New index to set
- **Returns:** void
- **Side effects:**
  - Updates currentIndex state
  - Triggers re-render
- **Preconditions:**
  - Should validate index is within bounds
- **Postconditions:** 
  - currentIndex updated to new value
  - If index out of bounds, clamp to valid range
- **Edge cases:**
  - Negative index → set to 0
  - Index >= playlist.length → set to last valid index
  - Empty playlist → set to 0
- **Implementation considerations:**
  ```typescript
  const setCurrentIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, playlist.length - 1));
    setCurrentIndex(clampedIndex);
  };
  ```

---

## Internal Implementation Details:

### **State Management:**
```typescript
// Use useLocalStorage for persistent playlist
const [playlist, setPlaylist] = useLocalStorage<Song[]>(
  'music-player-playlist',
  initialData
);

// Use useState for currentIndex (doesn't need persistence)
const [currentIndex, setCurrentIndex] = useState<number>(0);
```

### **Initialization Logic:**
- On first mount, useLocalStorage loads playlist from localStorage
- If localStorage empty, uses initialData (from PlaylistDataProvider)
- currentIndex always starts at 0

### **Effect Hooks:**
- Optional: useEffect to validate playlist on load
- Optional: useEffect to reset currentIndex if playlist becomes empty
- No other effects needed (useLocalStorage handles persistence)

---

## Dependencies:

- **React imports:**
  ```typescript
  import {useState} from 'react';
  ```
- **Hook imports:**
  ```typescript
  import {useLocalStorage} from './useLocalStorage';
  ```
- **Type imports:**
  ```typescript
  import {Song} from '@types/song';
  ```
- **Data imports:**
  ```typescript
  // Not imported in hook - passed as parameter
  // import {PlaylistDataProvider} from '@data/playlist-data-provider';
  ```

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 8 per function
- **Maximum method length:** 30 lines per function
- **React version:** React 18+ (uses modern hooks)
- **Pure hook:** No external side effects except localStorage (handled by useLocalStorage)

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Hook only manages playlist state and navigation
  - **Open/Closed:** Easy to extend with shuffle, repeat modes
- **Input parameter validation:**
  - Validate initialData is array
  - Validate song IDs exist before removing
  - Clamp indices to valid range
- **Robust exception handling:**
  - Never throw from hook methods
  - Handle edge cases gracefully (empty playlist, invalid indices)
  - Return safe defaults
- **Logging at critical points:**
  - Log when songs added/removed (development only)
  - Log index adjustment logic for debugging
- **Comments for complex logic:**
  - Explain currentIndex adjustment in removeSong
  - Document wrap-around behavior in next/previous
  - Clarify edge case handling

## React Hook Rules:

- **Rules of Hooks:**
  - Must be called at top level
  - Only call from React components or custom hooks
- **State updates:**
  - Use functional updates when depending on previous state
  - Avoid stale closures
- **Performance:**
  - Consider using useCallback for methods if passed as props
  - Minimize re-renders (already optimized with useState)

## Documentation:

- **JSDoc on hook function:**
  - `@param` for initialData
  - `@returns` with PlaylistHook structure
  - `@example` showing complete usage
- **JSDoc on returned methods:**
  - Document each method in returned object
  - Include examples and edge cases
- **Inline comments:**
  - Explain currentIndex management
  - Document navigation wrap-around logic
  - Note persistence behavior

## Security:

- **Data validation:** Ensure songs have required fields before adding
- **No injection risks:** IDs are strings, used safely for filtering

---

# DELIVERABLES

## 1. Complete source code of `src/hooks/usePlaylist.ts` with:

- Organized imports
- TypeScript interface for PlaylistHook return type
- Hook function implementation
- State management (playlist via useLocalStorage, currentIndex via useState)
- All CRUD and navigation methods implemented
- Complete JSDoc documentation on hook and methods
- Inline comments for complex logic

## 2. Inline documentation:

- Explanation of currentIndex adjustment logic
- Notes on wrap-around behavior (circular playlist)
- Documentation of edge cases (empty playlist, single song)
- localStorage persistence behavior via useLocalStorage
- currentIndex management strategy

## 3. Type definitions:

```typescript
/**
 * Return type of usePlaylist hook
 */
interface PlaylistHook {
  playlist: Song[];
  currentIndex: number;
  addSong: (song: Song) => void;
  removeSong: (id: string) => void;
  getSongAt: (index: number) => Song | null;
  next: () => number;
  previous: () => number;
  setCurrentIndex: (index: number) => void;
}
```

## 4. Edge cases considered:

- **Empty playlist:**
  - All methods handle gracefully
  - currentIndex clamped to 0
  - getSongAt returns null
  - next/previous return 0
- **Single song:**
  - next/previous stay at index 0
  - Can still remove (playlist becomes empty)
- **Remove currently playing song:**
  - Index adjusted appropriately
  - Playback continues with next song (caller responsibility)
- **Remove song before current:**
  - currentIndex decremented to maintain same song
- **Invalid indices:**
  - Clamped to valid range
  - Never throw exceptions
- **Duplicate IDs:**
  - Currently allows (consider validation in future)
- **Very large playlists:**
  - Performance should be acceptable (array operations are O(n))
  - localStorage size limits may apply

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: Circular navigation (wrap-around) vs stop at boundaries]
- [Decision 2: currentIndex persistence - should it be saved to localStorage?]
- [Decision 3: How to handle removing currently playing song]
- [Decision 4: Allow duplicate song IDs or enforce uniqueness]
- [Decision 5: Maximum playlist size limit or unlimited]
- [Decision 6: Whether to use useCallback for methods]

**Playlist management strategy:**
- [Explain approach to playlist state management]
- [Document currentIndex tracking strategy]
- [Describe persistence approach via useLocalStorage]

**Navigation behavior:**
- [Document wrap-around vs stop-at-end decision]
- [Explain index adjustment when removing songs]

**Possible future improvements:**
- [Improvement 1: Shuffle mode (randomize playback order)]
- [Improvement 2: Repeat modes (none, one, all)]
- [Improvement 3: Playlist reordering (drag and drop)]
- [Improvement 4: Multiple playlists support]
- [Improvement 5: Playlist import/export (JSON files)]
- [Improvement 6: Duplicate detection and prevention]
- [Improvement 7: Playlist search and filtering]
- [Improvement 8: Undo/redo for playlist operations]
- [Improvement 9: Playlist history/recents tracking]
- [Improvement 10: Smart playlist generation based on genres/artists]

---

**REMINDER:** This is a **React custom hook** that manages complex state with persistence. Focus on reliability, clear API, proper edge case handling, and seamless integration with useLocalStorage. The hook should provide all necessary playlist operations while maintaining data consistency.
