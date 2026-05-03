# FEATURE ENHANCEMENT REQUEST: REPEAT, SHUFFLE, AND VOLUME CONTROL

## GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current Status:** Core functionality is implemented. This enhancement adds advanced playback features.

---

## PROJECT FILE STRUCTURE REFERENCE

```
2-MusicWebPlayer/
├── src/
│   ├── types/
│   │   ├── song.ts                    ← EXISTING
│   │   ├── playback-error.ts          ← EXISTING
│   │   ├── validation.ts              ← EXISTING
│   │   └── playback-modes.ts          ← TO BE CREATED
│   ├── components/
│   │   ├── Player.tsx                 ← TO BE MODIFIED
│   │   ├── TrackInfo.tsx              ← EXISTING (no changes)
│   │   ├── Controls.tsx               ← TO BE MODIFIED (add repeat/shuffle)
│   │   ├── ProgressBar.tsx            ← EXISTING (no changes)
│   │   ├── Playlist.tsx               ← EXISTING (no changes)
│   │   ├── AddSongForm.tsx            ← EXISTING (no changes)
│   │   └── VolumeControl.tsx          ← TO BE CREATED
│   ├── hooks/
│   │   ├── useAudioPlayer.ts          ← TO BE MODIFIED (add volume)
│   │   ├── usePlaylist.ts             ← TO BE MODIFIED (add shuffle/repeat)
│   │   └── useLocalStorage.ts         ← EXISTING (no changes)
│   ├── utils/                         ← EXISTING (no changes)
│   ├── data/                          ← EXISTING (no changes)
│   └── styles/
│       └── main.css                   ← EXISTING
├── index.html
└── ... (config files)
```

---

## EXISTING ARCHITECTURE SUMMARY

### **Current Components:**
- **Player:** Container component that orchestrates all functionality
- **Controls:** Displays Previous, Play/Pause, Next buttons
- **TrackInfo:** Displays cover, title, artist
- **ProgressBar:** Shows playback progress with seek functionality
- **Playlist:** Displays song list with add/remove functionality

### **Current Hooks:**
- **useAudioPlayer:** Manages HTML5 Audio API (play, pause, seek, currentTime, duration)
- **usePlaylist:** Manages playlist array and currentIndex (add, remove, next, previous)
- **useLocalStorage:** Persists data to browser localStorage

### **Current Playback Flow:**
1. User clicks Play → Audio starts
2. User clicks Next → `usePlaylist.next()` advances index → Player loads new song
3. Song ends → Auto-play next song (circular, wraps to start)
4. User clicks song in playlist → Sets currentIndex → Plays that song

## EXISTING CODE STRUCTURE THAT NEEDS TO BE MODIFIED

```typescript
/**
 * @module Components/Player
 * @category Components
 * @description
 * This is the main container component that orchestrates all player functionality.
 * It manages the audio element, coordinates between hooks and child components,
 * and handles all user interactions.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Song } from '@types/song';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { usePlaylist } from '@hooks/usePlaylist';
import { PlaylistDataProvider } from '@data/playlist-data-provider';
import { TrackInfo } from './TrackInfo';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { Playlist } from './Playlist';
import styles from '@styles/Player.module.css';

/**
 * Main container component that orchestrates all player functionality.
 * Manages state and coordinates between audio playback and UI components.
 * @returns React component
 * @category Components
 */
export const Player: React.FC = () => {
  // Reference to the HTML audio element
  const audioRef = useRef<HTMLAudioElement>(null);

  // State for initial playlist loading
  const [initialPlaylist, setInitialPlaylist] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize hooks
  const audioPlayer = useAudioPlayer(audioRef);
  const playlistManager = usePlaylist(initialPlaylist);

  // State for error notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debug function to reset playlist (development only)
  const handleResetPlaylist = () => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('music-player-playlist');
      window.location.reload();
    }
  };

  // Load initial playlist on mount
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();
        setInitialPlaylist(playlist);
      } catch (error) {
        console.error('Failed to load initial playlist:', error);
        setErrorMessage('Failed to load playlist. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylist();
  }, []);

  /**
   * Gets the current song based on the playlist index.
   * @returns The current Song object or null if no song is selected
   */
  const getCurrentSong = (): Song | null => {
    return playlistManager.getSongAt(playlistManager.currentIndex);
  };
  const currentSong = getCurrentSong();

  /**
   * Toggles between play and pause.
   */
  const handlePlayPause = async (): Promise<void> => {
    if (audioPlayer.isPlaying) {
      audioPlayer.pause();
    } else {
      try {
        await audioPlayer.play();
      } catch (error) {
        console.error('Play failed:', error);
        setErrorMessage('Unable to play audio. Please try again.');
      }
    }
  };

  /**
   * Advances to the next song in the playlist.
   * @param autoPlayNext - Whether to auto-play the next song (default: true when called from button, false when song ends)
   */
  const handleNext = (autoPlayNext: boolean = true): void => {
    // Check if we're at the last song
    const isLastSong = playlistManager.currentIndex >= playlistManager.playlist.length - 1;
    
    // If it's the last song and we shouldn't auto-play (song ended naturally), just stop
    if (isLastSong && !autoPlayNext) {
      // Don't advance, just stop playing
      return;
    }

    const newIndex = playlistManager.next();
    const nextSong = playlistManager.getSongAt(newIndex);

    if (nextSong) {
      audioPlayer.setSource(nextSong.url, nextSong.id);

      // Auto-play if currently playing OR if we're coming from song end (autoPlayNext = false means natural end)
      if (audioPlayer.isPlaying || !autoPlayNext) {
        audioPlayer.play().catch(error => {
          console.error('Auto-play failed:', error);
          setErrorMessage('Unable to play next song. Please try again.');
        });
      }
    }
  };

  /**
   * Goes back to the previous song in the playlist.
   */
  const handlePrevious = (): void => {
    const newIndex = playlistManager.previous();
    const prevSong = playlistManager.getSongAt(newIndex);

    if (prevSong) {
      audioPlayer.setSource(prevSong.url, prevSong.id);

      // Auto-play if currently playing
      if (audioPlayer.isPlaying) {
        audioPlayer.play().catch(error => {
          console.error('Auto-play failed:', error);
          setErrorMessage('Unable to play previous song. Please try again.');
        });
      }
    }
  };

  /**
   * Seeks to a specific position in the current song.
   * @param time - Time in seconds to seek to
   */
  const handleSeek = (time: number): void => {
    audioPlayer.seek(time);
  };

  /**
   * Handles user selecting a song from the playlist.
   * @param index - Index of the selected song
   */
  const handleSongSelect = (index: number): void => {
    playlistManager.setCurrentIndex(index);
    const selectedSong = playlistManager.getSongAt(index);

    if (selectedSong) {
      audioPlayer.setSource(selectedSong.url, selectedSong.id);
      audioPlayer.play().catch(error => {
        console.error('Play failed:', error);
        setErrorMessage('Unable to play selected song. Please try again.');
      });
    }
  };

  /**
   * Handles adding a new song to the playlist.
   * @param song - The new song to add
   */
  const handleAddSong = (song: Song): void => {
    playlistManager.addSong(song);
  };

  /**
   * Handles removing a song from the playlist.
   * @param id - ID of the song to remove
   */
  const handleRemoveSong = (id: string): void => {
    playlistManager.removeSong(id);
  };

  // Load initial song when playlist becomes available
  useEffect(() => {
    const initialSong = playlistManager.getSongAt(0);
    if (initialSong && audioRef.current && !audioRef.current.src) {
      // Only set source if audio element doesn't have a source yet
      audioPlayer.setSource(initialSong.url, initialSong.id);
    }
  }, [playlistManager.playlist.length]); // Trigger when playlist is loaded

  // Auto-clear error messages after a delay
  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage(null);
      }, 5000); // Clear after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  // Display audio player errors
  useEffect(() => {
    if (audioPlayer.error) {
      setErrorMessage(audioPlayer.error);
    }
  }, [audioPlayer.error]);

  // Auto-play next song when current song ends
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = (): void => {
      // Pass false to indicate this is natural song ending, not user clicking next
      handleNext(false);
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [playlistManager.currentIndex, playlistManager.playlist.length]);

  return (
    <div className={styles.player}>
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Loading state */}
      {isLoading && (
        <div className={styles.player__content}>
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading playlist...</p>
        </div>
      )}

      {/* Main content - only show when loaded */}
      {!isLoading && (
        <>
          {/* Error notification */}
          {errorMessage && (
            <div className={styles.player__error} role="alert">
              <p>{errorMessage}</p>
              <button
                onClick={() => setErrorMessage(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Debug: Reset Playlist Button (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleResetPlaylist}
              style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                padding: '8px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                zIndex: 9999
              }}
            >
              🔄 Reset Playlist Cache
            </button>
          )}

          {/* Main player content */}
          <div className={styles.player__content}>
        <div className={styles.player__layout}>
          {/* Left column: Controls */}
          <div className={styles['player__controls-section']}>
            {/* Track information */}
            <TrackInfo
              title={currentSong?.title || 'No Song Selected'}
              artist={currentSong?.artist || 'Unknown Artist'}
              cover={currentSong?.cover || '/covers/default-cover.jpg'}
            />

            {/* Progress bar */}
            <ProgressBar
              currentTime={audioPlayer.currentTime}
              duration={audioPlayer.duration}
              onSeek={handleSeek}
            />

            {/* Playback controls */}
            <Controls
              isPlaying={audioPlayer.isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
              disableNext={playlistManager.currentIndex >= playlistManager.playlist.length - 1}
              disablePrevious={playlistManager.currentIndex <= 0}
            />
          </div>

          {/* Right column: Playlist */}
          <div className={styles['player__playlist-section']}>
            <Playlist
              songs={playlistManager.playlist}
              currentSongIndex={playlistManager.currentIndex}
              onSongSelect={handleSongSelect}
              onAddSong={handleAddSong}
              onRemoveSong={handleRemoveSong}
            />
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

```

```typescript
/**
 * @module Components/Controls
 * @category Components
 * @description
 * This component renders the playback control buttons for the music player.
 * It provides Previous, Play/Pause, and Next buttons with proper accessibility,
 * visual feedback, and responsive design.
 */

import React from 'react';
import styles from '@styles/Controls.module.css';

/**
 * Props for the Controls component.
 * @category Components
 */
export interface ControlsProps {
  /**
   * Whether audio is currently playing
   * Determines if Play or Pause icon is shown
   */
  isPlaying: boolean;

  /**
   * Callback function when Play/Pause button is clicked
   */
  onPlayPause: () => void;

  /**
   * Callback function when Next button is clicked
   */
  onNext: () => void;

  /**
   * Callback function when Previous button is clicked
   */
  onPrevious: () => void;

  /**
   * Whether the Next button should be disabled
   * @default false
   */
  disableNext?: boolean;

  /**
   * Whether the Previous button should be disabled
   * @default false
   */
  disablePrevious?: boolean;
}

/**
 * Component that renders playback control buttons.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Controls: React.FC<ControlsProps> = (props) => {
  // Default values for optional props
  const {
    disableNext = false,
    disablePrevious = false,
  } = props;

  // Unicode symbols for icons (could be replaced with React Icons)
  const PlayIcon = '▶';    // U+25B6
  const PauseIcon = '❚❚';  // U+275A x2
  const PreviousIcon = '◄'; // U+25C4
  const NextIcon = '►';     // U+25BA

  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--previous']}`}
        onClick={props.onPrevious}
        disabled={disablePrevious}
        aria-label="Previous song"
      >
        {PreviousIcon}
      </button>

      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--play-pause']}`}
        onClick={props.onPlayPause}
        aria-label={props.isPlaying ? "Pause" : "Play"}
      >
        {props.isPlaying ? PauseIcon : PlayIcon}
      </button>

      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--next']}`}
        onClick={props.onNext}
        disabled={disableNext}
        aria-label="Next song"
      >
        {NextIcon}
      </button>
    </div>
  );
};
```

```typescript
/**
 * @module Hooks/useAudioPlayer
 * @category Hooks
 * @description
 * This module provides a custom React hook for managing HTML5 audio playback.
 * It encapsulates all audio playback logic, event handling, and state management
 * for the music player application.
 */

import { useState, useEffect, RefObject } from 'react';
import { PlaybackError } from '@types/playback-error';
import { ErrorHandler } from '@utils/error-handler';

/**
 * Interface for the useAudioPlayer hook return value.
 * @category Hooks
 */
export interface AudioPlayerHook {
  /** Whether audio is currently playing */
  isPlaying: boolean;

  /** Current playback time in seconds */
  currentTime: number;

  /** Total duration of the audio in seconds */
  duration: number;

  /** Current playback error, if any */
  error: string | null;

  /** Function to start playback */
  play: () => Promise<void>;

  /** Function to pause playback */
  pause: () => void;

  /** Function to seek to a specific time */
  seek: (time: number) => void;

  /** Function to set the audio source */
  setSource: (url: string, songId?: string) => void;
}

/**
 * Custom hook for managing HTML5 Audio element state and controls.
 * @param audioRef Reference to the audio HTML element
 * @returns Hook interface with playback state and controls
 * @category Hooks
 */
export function useAudioPlayer(
  audioRef: RefObject<HTMLAudioElement>
): AudioPlayerHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentSongId, setCurrentSongId] = useState<string | undefined>(undefined);

  /**
   * Starts or resumes audio playback.
   * @returns Promise that resolves when playback starts
   */
  const play = async (): Promise<void> => {
    if (!audioRef.current) {
      setError('Audio element not available');
      return Promise.reject(new Error('Audio element not available'));
    }

    try {
      // Attempt to play the audio
      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      console.error('Play failed:', err);
      setIsPlaying(false);
      setError('Unable to play audio. Please try again.');
      return Promise.reject(err);
    }
  };

  /**
   * Pauses audio playback.
   */
  const pause = (): void => {
    if (!audioRef.current) return;

    try {
      audioRef.current.pause();
      setIsPlaying(false);
    } catch (err) {
      console.error('Pause failed:', err);
      setError('Unable to pause audio.');
    }
  };

  /**
   * Jumps to specific position in audio.
   * @param time Time in seconds to seek to
   */
  const seek = (time: number): void => {
    if (!audioRef.current) return;

    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
    audioRef.current.currentTime = clampedTime;
  };

  /**
   * Loads a new audio file.
   * @param url URL or path to audio file
   * @param songId Optional ID of the song for error handling
   */
  const setSource = (url: string, songId?: string): void => {
    if (!audioRef.current) return;

    // Reset state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
    setCurrentSongId(songId);

    // Set new source
    audioRef.current.src = url;
    audioRef.current.load(); // Explicitly load the new source
  };

  /**
   * Updates currentTime state as audio plays.
   */
  const handleTimeUpdate = (): void => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  /**
   * Sets duration when audio metadata loads.
   */
  const handleLoadedMetadata = (): void => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  /**
   * Handles when song finishes playing.
   */
  const handleEnded = (): void => {
    setIsPlaying(false);
  };

  /**
   * Handles audio playback errors.
   */
  const handleError = (): void => {
    if (!audioRef.current?.error) return;

    const mediaError = audioRef.current.error;
    const playbackError = ErrorHandler.handlePlaybackError(
      new Error(mediaError.message),
      currentSongId || 'unknown'
    );

    setError(playbackError.message);
    setIsPlaying(false);
  };

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioRef]);

  return {
    isPlaying,
    currentTime,
    duration,
    error,
    play,
    pause,
    seek,
    setSource,
  };
}

```

```typescript
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

```

---

# NEW FEATURES TO IMPLEMENT

## FEATURE 1: REPEAT MODE

### **Requirements:**

**Three-State Button:**
1. **Repeat Off (default):** Playlist plays once through, then stops at the end
2. **Repeat All:** When playlist ends, wrap to first song and continue playing
3. **Repeat One:** Current song loops infinitely

**User Interaction:**
- Single button with cycling states: Off → All → One → Off
- Each click advances to next state
- Visual indicator shows current state:
  - Off: `🔁` icon with no highlight or strikethrough
  - All: `🔁` icon with blue/primary color
  - One: `🔂` icon (or `🔁¹`) with blue/primary color

**Behavior:**
- **Repeat Off:**
  - Play through playlist in order
  - When last song ends, stop playback (don't auto-next)
  - Next button disabled at last song
  - Previous button disabled at first song
  
- **Repeat All (current default behavior):**
  - Play through playlist in order
  - When last song ends, wrap to first song and continue
  - Next/Previous buttons always enabled (circular navigation)
  
- **Repeat One:**
  - Current song loops when it ends
  - Next/Previous buttons still work (change song and continue looping that song)
  - Seeking works normally within the looping song

**Persistence:**
- Repeat mode saved to localStorage
- Persists between browser sessions
- Default: Repeat All (to match current behavior)

---

## FEATURE 2: SHUFFLE MODE

### **Requirements:**

**Toggle Button:**
- **Shuffle Off (default):** Playlist plays in original order
- **Shuffle On:** Playlist plays in randomized order

**User Interaction:**
- Single button toggles between On/Off
- Visual indicator shows current state:
  - Off: `🔀` icon with no highlight or strikethrough
  - On: `🔀` icon with blue/primary color

**Behavior:**
- **Shuffle Off:**
  - Playlist plays in original order (0, 1, 2, 3, ...)
  - Next/Previous buttons follow sequential order
  
- **Shuffle On:**
  - Generate randomized play order (shuffle algorithm)
  - Maintain "shuffle queue" separate from original playlist
  - Next button plays next song in shuffle queue
  - Previous button plays previous song in shuffle queue
  - No song repeats until entire playlist has been played (proper shuffle)
  - When shuffle queue exhausted, reshuffle and continue (if Repeat All) or stop (if Repeat Off)

**Shuffle Algorithm:**
- Use Fisher-Yates shuffle or similar
- Generate array of indices representing play order
- Example: Original [0,1,2,3,4] → Shuffled [2,4,0,3,1]
- Track position in shuffle queue separately

**Interaction with Current Song:**
- If shuffle enabled mid-playback:
  - Current song stays playing
  - Generate shuffle queue with remaining songs
  - Current song becomes first in new shuffle queue
  
- If shuffle disabled mid-playback:
  - Current song stays playing
  - Resume sequential order from current song's original position

**Interaction with Repeat:**
- **Shuffle On + Repeat Off:** Play shuffle queue once, then stop
- **Shuffle On + Repeat All:** Reshuffle when queue exhausted, continue
- **Shuffle On + Repeat One:** Loop current song (shuffle queue paused)

**Persistence:**
- Shuffle mode saved to localStorage
- Shuffle queue NOT persisted (regenerate on app load if shuffle enabled)
- Default: Shuffle Off

---

## FEATURE 3: VOLUME CONTROL

### **Requirements:**

**Volume Slider Component:**
- Horizontal slider (0-100%)
- Visual indicator of current volume level
- Mute/unmute button integrated or separate
- Displays volume percentage (optional)

**User Interaction:**
- **Slider:** Drag to adjust volume (0% = muted, 100% = full volume)
- **Click on track:** Jump to that volume level
- **Mute button:** Instantly mute/unmute (preserves last volume level)
- **Keyboard:** 
  - Up/Down arrows: Adjust by 5%
  - M key: Toggle mute
  - 0-9 keys: Jump to 0%, 10%, 20%, ..., 90%

**Visual Feedback:**
- Slider fill shows current volume level (like progress bar)
- Icon changes based on volume:
  - 0%: `🔇` or `🔈` with X (muted)
  - 1-33%: `🔈` (low)
  - 34-66%: `🔉` (medium)
  - 67-100%: `🔊` (high)

**Behavior:**
- Adjust HTML5 Audio element's `volume` property (0.0 to 1.0)
- Real-time adjustment (no lag)
- Smooth transitions (optional: fade in/out)

**Mute Functionality:**
- Mute button sets volume to 0 but remembers previous level
- Unmute restores previous volume level
- Visual indicator when muted

**Persistence:**
- Volume level saved to localStorage
- Mute state saved to localStorage
- Default: 70% volume, unmuted

**Placement:**
- Below Controls component or integrated within Controls
- Horizontal slider with icon on left
- Compact but easily accessible

---

# TECHNICAL IMPLEMENTATION REQUIREMENTS

## 1. NEW TYPE DEFINITIONS

### **Create `src/types/playback-modes.ts`:**

```typescript
/**
 * Repeat mode options for playlist playback
 */
export enum RepeatMode {
  /** No repeat - stop at end of playlist */
  OFF = 'off',
  
  /** Repeat entire playlist - loop back to start */
  ALL = 'all',
  
  /** Repeat current song - loop single track */
  ONE = 'one'
}

/**
 * Playback configuration state
 */
export interface PlaybackModes {
  /** Current repeat mode */
  repeat: RepeatMode;
  
  /** Whether shuffle is enabled */
  shuffle: boolean;
  
  /** Current volume level (0-100) */
  volume: number;
  
  /** Whether audio is muted */
  isMuted: boolean;
}
```

---

## 2. HOOK MODIFICATIONS

### **Modify `src/hooks/usePlaylist.ts`:**

**Add to PlaylistHook interface:**
```typescript
interface PlaylistHook {
  // ... existing properties
  playlist: Song[];
  currentIndex: number;
  
  // NEW: Playback modes
  repeatMode: RepeatMode;
  isShuffled: boolean;
  
  // ... existing methods
  addSong: (song: Song) => void;
  removeSong: (id: string) => void;
  getSongAt: (index: number) => Song | null;
  next: () => number;
  previous: () => number;
  setCurrentIndex: (index: number) => void;
  
  // NEW: Mode control methods
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  
  // NEW: Shuffle-aware navigation
  hasNext: () => boolean;  // Returns false if at end with Repeat Off
  hasPrevious: () => boolean;  // Returns false if at start with Repeat Off
}
```

**New State:**
```typescript
const [repeatMode, setRepeatMode] = useLocalStorage<RepeatMode>(
  'music-player-repeat-mode',
  RepeatMode.ALL  // Default to current behavior
);

const [isShuffled, setIsShuffled] = useLocalStorage<boolean>(
  'music-player-shuffle',
  false
);

const [shuffleQueue, setShuffleQueue] = useState<number[]>([]);
const [shuffleIndex, setShuffleIndex] = useState<number>(0);
```

**Modified `next()` logic:**
```typescript
const next = (): number => {
  if (repeatMode === RepeatMode.ONE) {
    // Stay on current song (handled in Player's ended event)
    return currentIndex;
  }
  
  if (isShuffled) {
    // Advance in shuffle queue
    const nextShuffleIndex = shuffleIndex + 1;
    
    if (nextShuffleIndex >= shuffleQueue.length) {
      // End of shuffle queue
      if (repeatMode === RepeatMode.ALL) {
        // Reshuffle and continue
        regenerateShuffleQueue();
        setShuffleIndex(0);
        return shuffleQueue[0];
      } else {
        // Repeat Off - stop
        return currentIndex;  // Stay on last song
      }
    }
    
    setShuffleIndex(nextShuffleIndex);
    return shuffleQueue[nextShuffleIndex];
  }
  
  // Normal sequential mode
  if (currentIndex >= playlist.length - 1) {
    if (repeatMode === RepeatMode.ALL) {
      setCurrentIndex(0);
      return 0;
    } else {
      // Repeat Off - stop
      return currentIndex;  // Stay on last song
    }
  }
  
  const newIndex = currentIndex + 1;
  setCurrentIndex(newIndex);
  return newIndex;
};
```

**Shuffle Methods:**
```typescript
const generateShuffleQueue = (): void => {
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
};

const toggleShuffle = (): void => {
  if (isShuffled) {
    // Turning shuffle off
    setIsShuffled(false);
    setShuffleQueue([]);
    setShuffleIndex(0);
  } else {
    // Turning shuffle on
    setIsShuffled(true);
    generateShuffleQueue();
  }
};
```

---

### **Modify `src/hooks/useAudioPlayer.ts`:**

**Add to AudioPlayerHook interface:**
```typescript
interface AudioPlayerHook {
  // ... existing properties
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  
  // NEW: Volume control
  volume: number;
  isMuted: boolean;
  
  // ... existing methods
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setSource: (url: string) => void;
  
  // NEW: Volume methods
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}
```

**New State:**
```typescript
const [volume, setVolumeState] = useLocalStorage<number>(
  'music-player-volume',
  70  // Default 70%
);

const [isMuted, setIsMuted] = useLocalStorage<boolean>(
  'music-player-muted',
  false
);

const [volumeBeforeMute, setVolumeBeforeMute] = useState<number>(70);
```

**Volume Methods:**
```typescript
const setVolume = (newVolume: number): void => {
  const clampedVolume = Math.max(0, Math.min(100, newVolume));
  setVolumeState(clampedVolume);
  
  if (audioRef.current) {
    audioRef.current.volume = clampedVolume / 100;  // Convert to 0-1 range
  }
  
  // Unmute if setting volume > 0
  if (clampedVolume > 0 && isMuted) {
    setIsMuted(false);
  }
};

const toggleMute = (): void => {
  if (isMuted) {
    // Unmute - restore previous volume
    setIsMuted(false);
    setVolume(volumeBeforeMute);
  } else {
    // Mute - save current volume and set to 0
    setVolumeBeforeMute(volume);
    setIsMuted(true);
    
    if (audioRef.current) {
      audioRef.current.volume = 0;
    }
  }
};
```

**Effect to sync volume on load:**
```typescript
useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = isMuted ? 0 : (volume / 100);
  }
}, [audioRef, volume, isMuted]);
```

---

## 3. NEW COMPONENT

### **Create `src/components/VolumeControl.tsx`:**

**Component Requirements:**
- Horizontal slider (input range)
- Volume icon that changes based on level
- Mute button
- Displays as compact horizontal bar
- Keyboard accessible
- ARIA attributes for screen readers

**Props Interface:**
```typescript
interface VolumeControlProps {
  /** Current volume level (0-100) */
  volume: number;
  
  /** Whether audio is muted */
  isMuted: boolean;
  
  /** Callback when volume changes */
  onVolumeChange: (volume: number) => void;
  
  /** Callback when mute button clicked */
  onToggleMute: () => void;
}
```

**JSX Structure:**
```jsx
<div className="volume-control">
  <button 
    className="volume-control__mute-button"
    onClick={props.onToggleMute}
    aria-label={props.isMuted ? "Unmute" : "Mute"}
  >
    {getVolumeIcon()}
  </button>
  
  <input
    type="range"
    min="0"
    max="100"
    value={props.isMuted ? 0 : props.volume}
    onChange={(e) => props.onVolumeChange(Number(e.target.value))}
    className="volume-control__slider"
    aria-label="Volume"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={props.volume}
  />
  
  <span className="volume-control__percentage">
    {props.isMuted ? 0 : props.volume}%
  </span>
</div>
```

**Icon Logic:**
```typescript
const getVolumeIcon = (): string => {
  if (props.isMuted || props.volume === 0) return '🔇';
  if (props.volume <= 33) return '🔈';
  if (props.volume <= 66) return '🔉';
  return '🔊';
};
```

---

## 4. COMPONENT MODIFICATIONS

### **Modify `src/components/Controls.tsx`:**

**Update ControlsProps:**
```typescript
interface ControlsProps {
  // ... existing props
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  disableNext?: boolean;
  disablePrevious?: boolean;
  
  // NEW: Mode props
  repeatMode: RepeatMode;
  isShuffled: boolean;
  onRepeatToggle: () => void;
  onShuffleToggle: () => void;
}
```

**Add Buttons:**
```jsx
<div className="controls">
  {/* Existing Previous button */}
  <button ...>◄</button>
  
  {/* Existing Play/Pause button */}
  <button ...>{isPlaying ? '❚❚' : '▶'}</button>
  
  {/* Existing Next button */}
  <button ...>►</button>
  
  {/* NEW: Shuffle button */}
  <button
    type="button"
    className={`controls__button controls__button--shuffle ${
      props.isShuffled ? 'controls__button--active' : ''
    }`}
    onClick={props.onShuffleToggle}
    aria-label={props.isShuffled ? "Disable shuffle" : "Enable shuffle"}
    title="Shuffle"
  >
    🔀
  </button>
  
  {/* NEW: Repeat button */}
  <button
    type="button"
    className={`controls__button controls__button--repeat ${
      props.repeatMode !== RepeatMode.OFF ? 'controls__button--active' : ''
    }`}
    onClick={props.onRepeatToggle}
    aria-label={`Repeat: ${props.repeatMode}`}
    title={`Repeat: ${props.repeatMode}`}
  >
    {props.repeatMode === RepeatMode.ONE ? '🔂' : '🔁'}
  </button>
</div>
```

**Repeat Toggle Handler (in Parent/Player):**
```typescript
const handleRepeatToggle = (): void => {
  const modes = [RepeatMode.OFF, RepeatMode.ALL, RepeatMode.ONE];
  const currentIndex = modes.indexOf(playlistManager.repeatMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  playlistManager.setRepeatMode(modes[nextIndex]);
};
```

---

### **Modify `src/components/Player.tsx`:**

**Import New Component:**
```typescript
import { VolumeControl } from './VolumeControl';
import { RepeatMode } from '@types/playback-modes';
```

**Pass Props to Controls:**
```jsx
<Controls
  isPlaying={audioPlayer.isPlaying}
  onPlayPause={handlePlayPause}
  onNext={handleNext}
  onPrevious={handlePrevious}
  disableNext={!playlistManager.hasNext()}
  disablePrevious={!playlistManager.hasPrevious()}
  
  {/* NEW */}
  repeatMode={playlistManager.repeatMode}
  isShuffled={playlistManager.isShuffled}
  onRepeatToggle={handleRepeatToggle}
  onShuffleToggle={handleShuffleToggle}
/>
```

**Add VolumeControl:**
```jsx
<VolumeControl
  volume={audioPlayer.volume}
  isMuted={audioPlayer.isMuted}
  onVolumeChange={audioPlayer.setVolume}
  onToggleMute={audioPlayer.toggleMute}
/>
```

**Update Auto-Next Logic:**
```typescript
useEffect(() => {
  if (!audioRef.current) return;
  
  const handleEnded = (): void => {
    if (playlistManager.repeatMode === RepeatMode.ONE) {
      // Repeat current song
      audioRef.current!.currentTime = 0;
      audioPlayer.play();
    } else if (playlistManager.hasNext()) {
      // Play next song
      handleNext();
      audioPlayer.play();
    } else {
      // End of playlist with Repeat Off
      audioPlayer.pause();
    }
  };
  
  audioRef.current.addEventListener('ended', handleEnded);
  
  return () => {
    audioRef.current?.removeEventListener('ended', handleEnded);
  };
}, [playlistManager.repeatMode, playlistManager.currentIndex]);
```

---

## 5. STYLING REQUIREMENTS

### **Button Styles:**

```css
/* Active state for shuffle/repeat buttons */
.controls__button--active {
  color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}

.controls__button--shuffle,
.controls__button--repeat {
  font-size: 1.25rem;
}
```

### **Volume Control Styles:**

```css
.volume-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) 0;
}

.volume-control__mute-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: color var(--transition-fast);
}

.volume-control__mute-button:hover {
  color: var(--color-primary);
}

.volume-control__slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  outline: none;
}

.volume-control__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.volume-control__slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-control__slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.volume-control__percentage {
  min-width: 40px;
  text-align: right;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
```

---

## 6. TESTING SCENARIOS

### **Manual Testing Checklist:**

**Repeat Mode:**
- [ ] Repeat Off: Playlist stops at last song
- [ ] Repeat All: Playlist wraps to first song
- [ ] Repeat One: Current song loops
- [ ] Button cycles through all three states
- [ ] Visual indicator shows current state
- [ ] Mode persists after browser refresh
- [ ] Next/Previous work correctly in each mode

**Shuffle Mode:**
- [ ] Shuffle Off: Sequential playback
- [ ] Shuffle On: Randomized playback
- [ ] No song repeats until all played
- [ ] Shuffle + Repeat Off: Stops after shuffle queue
- [ ] Shuffle + Repeat All: Reshuffles and continues
- [ ] Shuffle + Repeat One: Loops current song
- [ ] Toggle mid-playback: Current song stays, queue regenerates
- [ ] Mode persists after browser refresh

**Volume Control:**
- [ ] Slider adjusts volume smoothly
- [ ] Click on track jumps to that volume
- [ ] Icon changes based on volume level
- [ ] Mute button toggles mute state
- [ ] Unmute restores previous volume
- [ ] Volume persists after browser refresh
- [ ] Keyboard controls work (if implemented)

**Integration:**
- [ ] All features work together correctly
- [ ] No conflicts between shuffle/repeat modes
- [ ] Volume works during all playback modes
- [ ] UI updates reflect state changes immediately
- [ ] Performance is smooth (no lag)

---

## 7. EDGE CASES TO HANDLE

1. **Empty Playlist:**
   - Disable shuffle/repeat buttons
   - Volume still works

2. **Single Song Playlist:**
   - Shuffle has no effect (only one song)
   - Repeat One/All behave the same
   - Next/Previous stay on same song

3. **Shuffle Toggle During Playback:**
   - Current song continues
   - Queue regenerates from current position
   - No jarring transitions

4. **Volume at 0 vs Muted:**
   - Treat differently: 0% volume should unmute
   - Muted state preserves last volume

5. **Rapid Button Clicks:**
   - Debounce or handle gracefully
   - State updates correctly

6. **Adding/Removing Songs with Shuffle:**
   - Regenerate shuffle queue
   - Maintain current playback

7. **Browser Refresh:**
   - All modes persist via localStorage
   - Shuffle queue regenerates (not persisted)

---

## 8. ACCESSIBILITY REQUIREMENTS

**Keyboard Support:**
- Space: Play/Pause (existing)
- Arrow Left/Right: Previous/Next (existing)
- S key: Toggle Shuffle
- R key: Cycle Repeat mode
- M key: Toggle Mute
- Up/Down arrows (on volume): Adjust volume
- Numbers 0-9: Set volume to 0%, 10%, ..., 90%

**Screen Reader:**
- Announce repeat mode changes
- Announce shuffle toggle
- Announce volume changes
- Announce mute state

**ARIA Attributes:**
- aria-label on all buttons
- aria-pressed on toggle buttons (shuffle, mute)
- aria-valuemin/max/now on volume slider
- role="slider" on volume control

---

## 9. DELIVERABLES

### **Code Files:**

1. **`src/types/playback-modes.ts`** - New type definitions
2. **`src/hooks/usePlaylist.ts`** - Modified with shuffle/repeat logic
3. **`src/hooks/useAudioPlayer.ts`** - Modified with volume control
4. **`src/components/VolumeControl.tsx`** - New component
5. **`src/components/Controls.tsx`** - Modified with new buttons
6. **`src/components/Player.tsx`** - Modified with new integrations

### **Documentation:**

- Inline comments explaining shuffle algorithm
- JSDoc for new methods and properties
- README updates describing new features

### **Testing:**

- Manual testing checklist completed
- All edge cases verified
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## 10. IMPLEMENTATION ORDER

**Recommended sequence:**

1. **Phase 1: Type Definitions**
   - Create `playback-modes.ts`
   - Define enums and interfaces

2. **Phase 2: Volume Control (Simplest)**
   - Modify `useAudioPlayer` to add volume state and methods
   - Create `VolumeControl` component
   - Integrate into `Player`
   - Test thoroughly

3. **Phase 3: Repeat Mode**
   - Modify `usePlaylist` to add repeat state
   - Update next/previous logic for repeat modes
   - Add repeat button to `Controls`
   - Integrate into `Player`
   - Update auto-next logic in `Player`
   - Test all three modes

4. **Phase 4: Shuffle Mode**
   - Modify `usePlaylist` to add shuffle state and queue
   - Implement shuffle algorithm
   - Update next/previous logic for shuffle
   - Add shuffle button to `Controls`
   - Integrate into `Player`
   - Test shuffle with all repeat modes

5. **Phase 5: Integration & Polish**
   - Test all features together
   - Handle edge cases
   - Add keyboard shortcuts
   - Polish UI/UX
   - Update documentation

---

## 11. VISUAL LAYOUT REFERENCE

**Updated Controls Layout:**
```
┌────────────────────────────────────────┐
│  [◄]  [▶/❚❚]  [►]  [🔀]  [🔁/🔂]    │
│                                        │
│  ████████████░░░░░░  2:45 / 4:20      │
│                                        │
│  [🔊] ███████████░░░░░ 75%            │
└────────────────────────────────────────┘

Legend:
[◄] = Previous
[▶/❚❚] = Play/Pause (larger, primary colored)
[►] = Next
[🔀] = Shuffle (blue when active)
[🔁/🔂] = Repeat (changes icon, blue when active)
[🔊] = Volume icon (changes based on level)
```

---

# CONSTRAINTS AND STANDARDS

**Code Quality:**
- Follow existing Google TypeScript Style Guide
- Maintain consistency with existing codebase
- Add comprehensive JSDoc comments
- No `any` types
- Proper error handling

**Performance:**
- Shuffle algorithm must be O(n)
- No lag when toggling modes
- Smooth volume adjustments
- Minimal re-renders

**Accessibility:**
- Full keyboard support
- Screen reader compatible
- WCAG AA compliant
- Proper ARIA attributes

**Testing:**
- Test all combinations of shuffle/repeat
- Test all edge cases listed
- Cross-browser compatibility
- Mobile responsive

---

# SUCCESS CRITERIA

✅ **Feature Complete When:**
1. All three repeat modes work correctly
2. Shuffle randomizes playback without repeats
3. Volume control adjusts audio smoothly
4. All features persist after browser refresh
5. Keyboard shortcuts work
6. UI clearly indicates current states
7. No bugs or conflicts between features
8. Accessibility requirements met
9. Code is well-documented
10. Manual testing checklist passes

---

**IMPORTANT NOTES FOR AI CODER:**

1. **Preserve Existing Functionality:** Don't break current play/pause/next/previous behavior
2. **Follow Architecture:** Use existing hooks pattern, don't create new state management
3. **Consistent Styling:** Match existing button styles and component patterns
4. **Type Safety:** Maintain strict TypeScript typing throughout
5. **Backward Compatibility:** Default modes (Repeat All, Shuffle Off) match current behavior
6. **User Experience:** Mode changes should feel instant and smooth
