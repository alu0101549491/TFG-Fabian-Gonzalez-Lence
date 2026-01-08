/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/hooks/usePlaylist.ts
 * @desc Custom React hook for managing playlist state and operations. It handles playlist persistence,
 *       navigation, and song management with localStorage integration.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

import { useState, useEffect, useCallback } from 'react';
import { Song } from '../types/song';
import { useLocalStorage } from './useLocalStorage';
import { RepeatMode } from '../types/playback-modes';

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
    RepeatMode.OFF  // Default to repeat off
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
