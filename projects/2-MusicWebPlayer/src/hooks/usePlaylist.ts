/**
 * @module Hooks/usePlaylist
 * @category Hooks
 * @description
 * This module provides a custom React hook for managing playlist state and operations.
 * It handles playlist persistence, navigation, and song management with localStorage integration.
 */

import { useState, useEffect } from 'react';
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

  // Update playlist when initialData changes (only if playlist is empty)
  useEffect(() => {
    if (initialData.length > 0 && playlist.length === 0) {
      setPlaylist(initialData);
    }
  }, [initialData, setPlaylist]);

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
  const setCurrentIndexSafe = (index: number): void => {
    // Clamp index to valid range
    const clampedIndex = Math.max(0, Math.min(index, Math.max(0, playlist.length - 1)));
    setCurrentIndex(clampedIndex);
  };

  // Reset currentIndex if playlist becomes empty
  useEffect(() => {
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
    setCurrentIndex: setCurrentIndexSafe,
  };
}
