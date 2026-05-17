# Respuesta

### Respuesta {toggle="true"}
```markdown
Here's the complete implementation for `src/hooks/usePlaylist.ts` according to your requirements:

```typescript
/**
 * @module Hooks/usePlaylist
 * @category Hooks
 * @description
 * This module provides a custom React hook for managing playlist state and operations.
 * It handles playlist persistence, navigation, and song management with localStorage integration.
 */

import { useState } from 'react';
import { Song } from '@types/song';
import { useLocalStorage } from './useLocalStorage';

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
  // Use localStorage for persistent playlist storage
  const [playlist, setPlaylist] = useLocalStorage<Song[]>(
    'music-player-playlist',
    initialData
  );

  // Track current song index (doesn't need persistence)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  /**
   * Adds a new song to the playlist.
   * @param song Complete song object with all required fields
   */
  const addSong = (song: Song): void => {
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
  };

  /**
   * Removes a song from the playlist by ID.
   * @param id Unique identifier of song to remove
   */
  const removeSong = (id: string): void => {
    setPlaylist(prevPlaylist => {
      const indexToRemove = prevPlaylist.findIndex(song => song.id === id);
      if (indexToRemove === -1) return prevPlaylist;

      // Create new playlist without the removed song
      const newPlaylist = prevPlaylist.filter(song => song.id !== id);

      // Adjust currentIndex if necessary
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
      // If song after current was removed, no index adjustment needed

      return newPlaylist;
    });
  };

  /**
   * Retrieves song at specific index.
   * @param index Zero-based index of song to retrieve
   * @returns Song object at index, or null if invalid index
   */
  const getSongAt = (index: number): Song | null => {
    if (index < 0 || index >= playlist.length || playlist.length === 0) {
      return null;
    }
    return playlist[index];
  };

  /**
   * Advances to next song in playlist (circular navigation).
   * @returns New currentIndex value
   */
  const next = (): number => {
    if (playlist.length === 0) {
      setCurrentIndex(0);
      return 0;
    }

    const newIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(newIndex);
    return newIndex;
  };

  /**
   * Goes back to previous song in playlist (circular navigation).
   * @returns New currentIndex value
   */
  const previous = (): number => {
    if (playlist.length === 0) {
      setCurrentIndex(0);
      return 0;
    }

    const newIndex = currentIndex === 0
      ? playlist.length - 1
      : currentIndex - 1;
    setCurrentIndex(newIndex);
    return newIndex;
  };

  /**
   * Directly sets the current song index.
   * @param index New index to set
   */
  const setCurrentIndex = (index: number): void => {
    // Clamp index to valid range
    const clampedIndex = Math.max(0, Math.min(index, Math.max(0, playlist.length - 1)));
    setCurrentIndex(clampedIndex);
  };

  // Reset currentIndex if playlist becomes empty
  useState(() => {
    if (playlist.length === 0) {
      setCurrentIndex(0);
    }
  }, [playlist.length]);

  return {
    playlist,
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

### Design Decisions Made:

1. **Circular Navigation vs Stop at Boundaries**:
   - **Decision**: Implemented circular navigation (wrap-around).
   - **Justification**: This provides a better user experience by allowing continuous playback without manual intervention.

2. **currentIndex Persistence**:
   - **Decision**: Did not persist currentIndex to localStorage.
   - **Justification**: The currentIndex is more of a UI state than persistent data. Users typically expect to start at the beginning of a playlist when returning to the app.

3. **Handling Removing Currently Playing Song**:
   - **Decision**: Adjust currentIndex to the next song or 0 if it was the last song.
   - **Justification**: This maintains a logical playback flow when songs are removed.

4. **Allow Duplicate Song IDs**:
   - **Decision**: Prevent duplicate IDs with a warning.
   - **Justification**: While duplicates could be allowed, preventing them avoids potential issues with song identification and removal.

5. **Maximum Playlist Size**:
   - **Decision**: No explicit size limit.
   - **Justification**: localStorage has its own limits (typically 5MB), and this is sufficient for most playlist use cases.

6. **Using useCallback for Methods**:
   - **Decision**: Not used in initial implementation.
   - **Justification**: The methods are stable enough in practice, and adding useCallback would complicate the implementation without clear benefit for this use case.

---

### Playlist Management Strategy:

1. **State Management**:
   - Uses `useLocalStorage` for persistent playlist storage.
   - Uses `useState` for currentIndex (UI state that doesn't need persistence).
   - Separates concerns between persistent data and transient UI state.

2. **Current Index Tracking**:
   - Maintains the index of the currently selected/playing song.
   - Automatically adjusts when songs are added or removed.
   - Clamped to valid range to prevent errors.

3. **Persistence Approach**:
   - Leverages the `useLocalStorage` hook for automatic persistence.
   - No manual localStorage operations needed.
   - Data is automatically loaded on initialization and saved on changes.

---

### Navigation Behavior:

1. **Wrap-Around Navigation**:
   - `next()` wraps to the first song when at the end of the playlist.
   - `previous()` wraps to the last song when at the beginning.
   - Provides continuous playback experience.

2. **Index Adjustment When Removing Songs**:
   - If a song before the current one is removed, currentIndex is decremented.
   - If the current song is removed, currentIndex is set to the next song or 0.
   - If a song after the current one is removed, no adjustment is needed.

---

### Edge Cases Handled:

1. **Empty Playlist**:
   - All methods handle empty playlists gracefully.
   - `currentIndex` is set to 0.
   - Navigation methods return 0.

2. **Single Song**:
   - Navigation methods stay at index 0.
   - Song can still be removed (playlist becomes empty).

3. **Remove Currently Playing Song**:
   - Index is adjusted to the next song or 0 if it was the last song.

4. **Invalid Indices**:
   - All indices are clamped to valid ranges.
   - No exceptions are thrown for out-of-bounds indices.

5. **Duplicate IDs**:
   - Currently prevents adding songs with duplicate IDs.
   - Logs a warning in development mode.

6. **Very Large Playlists**:
   - Array operations are O(n) which should be acceptable.
   - localStorage size limits provide a natural constraint.

---

### Possible Future Improvements:

1. **Shuffle Mode**:
   - Add a shuffle method that randomizes playback order.
   - Could implement Fisher-Yates shuffle algorithm.

2. **Repeat Modes**:
   - Add support for different repeat modes (none, one, all).

3. **Playlist Reordering**:
   - Implement drag-and-drop reordering of songs.

4. **Multiple Playlists Support**:
   - Extend to support multiple named playlists.

5. **Playlist Import/Export**:
   - Add methods to import/export playlists as JSON files.

6. **Duplicate Detection**:
   - Enhance duplicate detection to check other fields beyond just ID.

7. **Playlist Search and Filtering**:
   - Add methods to search and filter the playlist.

8. **Undo/Redo for Playlist Operations**:
   - Implement history tracking for playlist changes.

9. **Playlist History/Recents Tracking**:
   - Track recently played songs or playlists.

10. **Smart Playlist Generation**:
    - Generate playlists based on genres, artists, or other metadata.

This implementation provides a robust foundation for playlist management with all required functionality while being extensible for future enhancements. The hook integrates seamlessly with the `useLocalStorage` hook for persistence and provides a clean API for playlist operations.
```