# TESTING PROMPT #16: `src/components/Player.tsx`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** Player Component

**File path:** `src/components/Player.tsx`

**Test file path:** `tests/components/Player.test.tsx`

**Testing framework:** Jest, TS-Jest, React Testing Library

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
// src/components/Player.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Song } from '@types/song';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { usePlaylist } from '@hooks/usePlaylist';
import { PlaylistDataProvider } from '@data/playlist-data-provider';
import { TrackInfo } from './TrackInfo';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { Playlist } from './Playlist';
import { VolumeControl } from './VolumeControl';
import { RepeatMode } from '@types/playback-modes';
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

  /**
   * Gets the current song based on the playlist index.
   * @returns The current Song object or null if no song is selected
   */
  const currentSong = playlistManager.getCurrentSong();

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
   */
  const handleNext = (): void => {
    const newIndex = playlistManager.next();
    const nextSong = playlistManager.getSongAt(newIndex);

    if (nextSong) {
      audioPlayer.setSource(nextSong.url, nextSong.id);

      // Auto-play if currently playing
      if (audioPlayer.isPlaying) {
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

  /**
   * Handles toggling the repeat mode.
   */
  const handleRepeatToggle = (): void => {
    const modes = [RepeatMode.OFF, RepeatMode.ALL, RepeatMode.ONE];
    const currentIndex = modes.indexOf(playlistManager.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    playlistManager.setRepeatMode(modes[nextIndex]);
  };

  /**
   * Handles toggling the shuffle mode.
   */
  const handleShuffleToggle = (): void => {
    playlistManager.toggleShuffle();
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

  // Load initial song when playlist becomes available
  useEffect(() => {
    // Use the playlist manager's current song (respects shuffle and saved index)
    const current = playlistManager.getCurrentSong();
    if (current && audioRef.current && !audioRef.current.src) {
      // Only set source if audio element doesn't have a source yet
      audioPlayer.setSource(current.url, current.id);
    }
  }, [playlistManager.playlist.length, playlistManager.currentIndex, playlistManager.isShuffled]);

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
      if (playlistManager.repeatMode === RepeatMode.ONE) {
        // Repeat current song
        audioRef.current!.currentTime = 0;
        audioPlayer.play().catch(error => {
          console.error('Auto-play failed:', error);
          setErrorMessage('Unable to replay song. Please try again.');
        });
      } else if (playlistManager.hasNext()) {
        // Play next song
        handleNext();
        audioPlayer.play().catch(error => {
          console.error('Auto-play failed:', error);
          setErrorMessage('Unable to play next song. Please try again.');
        });
      } else {
        // End of playlist with Repeat Off
        audioPlayer.pause();
      }
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [playlistManager.repeatMode, playlistManager.currentIndex, playlistManager.playlist.length]);

  // Debug function to reset playlist (development only)
  const handleResetPlaylist = () => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('music-player-playlist');
      localStorage.removeItem('music-player-repeat-mode');
      localStorage.removeItem('music-player-shuffle');
      window.location.reload();
    }
  };

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
                  disableNext={!playlistManager.hasNext()}
                  disablePrevious={!playlistManager.hasPrevious()}
                  repeatMode={playlistManager.repeatMode}
                  isShuffled={playlistManager.isShuffled}
                  onRepeatToggle={handleRepeatToggle}
                  onShuffleToggle={handleShuffleToggle}
                />

                {/* Volume control */}
                <VolumeControl
                  volume={audioPlayer.volume}
                  isMuted={audioPlayer.isMuted}
                  onVolumeChange={audioPlayer.setVolume}
                  onToggleMute={audioPlayer.toggleMute}
                />
              </div>

              {/* Right column: Playlist */}
              <div className={styles['player__playlist-section']}>
                <Playlist
                  songs={playlistManager.playlist}
                  currentSongIndex={playlistManager.getCurrentSongIndex()}
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

### From Code Review #16:

**Component Objective:**
Main orchestrator component that integrates all player features. Uses three custom hooks (usePlaylist, useAudioPlayer, useLocalStorage), renders all sub-components (TrackInfo, Controls, ProgressBar, Playlist, AddSongForm), manages audio element via ref, and coordinates state between hooks and components.

**Requirements:**
- **ALL FR:** Integrates all functional requirements
- **ALL NFR:** Implements all non-functional requirements
- **Integration:** Connects all components and hooks

**Component Structure:**
```typescript
function Player(): JSX.Element {
  // Hooks
  const audioRef = useRef<HTMLAudioElement>(null);
  const playlistHook = usePlaylist(initialPlaylist);
  const audioPlayerHook = useAudioPlayer(audioRef);
  
  // Render
  return (
    <div className="player">
      <audio ref={audioRef} src={currentSong?.url} />
      <TrackInfo {...currentTrackInfo} />
      <Controls {...controlsProps} />
      <ProgressBar {...progressProps} />
      <Playlist {...playlistProps} />
      <AddSongForm {...formProps} />
    </div>
  );
}
```

**Critical Requirements:**

1. **Audio Element:**
   - `<audio>` element with ref={audioRef}
   - src attribute bound to current song URL
   - ref passed to useAudioPlayer
   - preload="metadata" (optional)

2. **Hook Integration:**
   - usePlaylist: manages playlist state
   - useAudioPlayer: manages playback state
   - useLocalStorage: optional for additional persistence
   - Hooks properly connected

3. **Component Composition:**
   - Renders TrackInfo with current song
   - Renders Controls with playback controls
   - Renders ProgressBar with seek functionality
   - Renders Playlist with song list
   - Renders AddSongForm for adding songs

4. **State Coordination:**
   - Current song from playlist[currentIndex]
   - TrackInfo receives current song data
   - Controls receives playback state + callbacks
   - ProgressBar receives time + seek callback
   - Playlist receives songs + selection callback

5. **Playback Flow:**
   - Song selection updates currentIndex
   - currentIndex change updates audio src
   - Next/Previous navigate playlist
   - Play/Pause controls audio element
   - Seek updates audio currentTime

6. **Playlist Management:**
   - AddSongForm adds to playlist
   - Playlist remove button removes songs
   - Songs persist via useLocalStorage
   - Playlist updates in real-time

7. **Error Handling:**
   - Audio errors handled by useAudioPlayer
   - Error display (optional component)
   - Graceful degradation

8. **Initial Load:**
   - Loads initial playlist from PlaylistDataProvider
   - Restores state from localStorage
   - First song ready to play
   - No autoplay

9. **Audio Source Management:**
   - Audio src updates when currentIndex changes
   - Audio src updates when songs array changes
   - Prevents errors on song removal
   - Handles undefined current song

10. **Integration Points:**
    - TrackInfo: title, artist, cover from current song
    - Controls: isPlaying, onPlayPause, onNext, onPrevious, repeatMode, isShuffled, onRepeatToggle, onShuffleToggle, disableNext, disablePrevious
    - ProgressBar: currentTime, duration, onSeek
    - Playlist: songs, currentIndex, onSongSelect, onSongRemove
    - AddSongForm: onAddSong

**Usage Context:**
- Root component of application
- Orchestrates all functionality
- Single source of truth for state
- Manages all user interactions

---

## USE CASE DIAGRAM

```
Player Component
├── Audio Element
│   ├── ref={audioRef}
│   └── src={currentSong?.url}
│
├── Hooks
│   ├── usePlaylist(initialPlaylist)
│   └── useAudioPlayer(audioRef)
│
├── TrackInfo
│   └── Display current song
│
├── Controls
│   └── Playback controls
│
├── ProgressBar
│   └── Time and seeking
│
├── Playlist
│   └── Song list display
│
└── AddSongForm
    └── Add new songs
```

---

## TASK

Generate a complete unit test suite for the **Player component** that covers:

### 1. RENDERING - BASIC
Test basic rendering:
- Component renders without crashing
- Audio element exists
- All sub-components render
- No errors on mount

### 2. AUDIO ELEMENT
Test audio element:
- Audio element has ref
- Audio src bound to current song
- Audio src updates on song change
- Audio element properly configured

### 3. HOOK INTEGRATION
Test custom hooks:
- usePlaylist called with initial data
- useAudioPlayer called with audioRef
- Hooks return expected interface
- Hook state properly used

### 4. TRACKINFO INTEGRATION
Test TrackInfo rendering:
- TrackInfo receives current song data
- Title prop correct
- Artist prop correct
- Cover prop correct
- Updates when song changes

### 5. CONTROLS INTEGRATION
Test Controls rendering:
- Controls receives playback state
- isPlaying prop from useAudioPlayer
- All callback props provided
- Repeat and shuffle props provided
- Disabled states from usePlaylist

### 6. PROGRESSBAR INTEGRATION
Test ProgressBar rendering:
- ProgressBar receives time data
- currentTime from useAudioPlayer
- duration from useAudioPlayer
- onSeek callback provided
- Seeking updates audio

### 7. PLAYLIST INTEGRATION
Test Playlist rendering:
- Playlist receives songs array
- currentIndex prop correct
- onSongSelect callback works
- onSongRemove callback works
- Updates when playlist changes

### 8. ADDSONGFORM INTEGRATION
Test AddSongForm rendering:
- AddSongForm renders
- onAddSong callback provided
- Adding song updates playlist
- Form clears after add

### 9. PLAYBACK FLOW
Test integrated playback:
- Selecting song updates currentIndex
- Next button navigates forward
- Previous button navigates backward
- Play/pause toggles playback
- Current song info updates

### 10. SEEK FUNCTIONALITY
Test seeking integration:
- ProgressBar seek callback works
- Clicking ProgressBar seeks audio
- Keyboard seeking works
- Seek updates audio currentTime

### 11. PLAYLIST MANAGEMENT
Test playlist operations:
- Adding song appears in playlist
- Removing song updates playlist
- CurrentIndex adjusts on removal
- Playlist persists (via hooks)

### 12. ERROR HANDLING
Test error scenarios:
- Audio load errors handled
- Invalid song URLs handled
- Empty playlist handled
- Removing current song handled

### 13. STATE COORDINATION
Test state synchronization:
- Multiple components share state
- State updates propagate correctly
- No stale state issues
- Consistent state across components

### 14. INITIAL LOAD
Test component initialization:
- Loads initial playlist
- First song ready
- No autoplay
- State restored from localStorage

### 15. EDGE CASES
Test edge cases:
- Single song playlist
- Empty playlist
- Rapid song changes
- Song removal during playback
- Adding songs during playback

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Player from '@/components/Player';
import * as PlaylistDataProvider from '@/data/playlist-data-provider';

// Mock custom hooks if needed
jest.mock('@/hooks/usePlaylist');
jest.mock('@/hooks/useAudioPlayer');
jest.mock('@/hooks/useLocalStorage');

describe('Player Component', () => {
  // Mock data
  const mockSongs = [
    { id: '1', title: 'Song 1', artist: 'Artist 1', cover: '/1.jpg', url: '/1.mp3' },
    { id: '2', title: 'Song 2', artist: 'Artist 2', cover: '/2.jpg', url: '/2.mp3' },
    { id: '3', title: 'Song 3', artist: 'Artist 3', cover: '/3.jpg', url: '/3.mp3' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock PlaylistDataProvider
    jest.spyOn(PlaylistDataProvider, 'loadInitialPlaylist').mockReturnValue(mockSongs);
    
    // Mock localStorage
    global.Storage.prototype.getItem = jest.fn(() => null);
    global.Storage.prototype.setItem = jest.fn();
    
    // Mock audio element methods
    HTMLAudioElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLAudioElement.prototype.pause = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering - Basic', () => {
    it('should render without crashing', () => {
      // ARRANGE & ACT
      const { container } = render(<Player />);

      // ASSERT
      expect(container).toBeInTheDocument();
    });

    it('should render audio element', () => {
      const { container } = render(<Player />);

      const audio = container.querySelector('audio');

      expect(audio).toBeInTheDocument();
    });

    it('should render all sub-components', () => {
      render(<Player />);

      // Check that major sections exist
      // TrackInfo - song title/artist should be visible
      expect(screen.getByText(/Song 1/i)).toBeInTheDocument();
      
      // Controls - buttons should exist
      expect(screen.getByLabelText(/play|pause/i)).toBeInTheDocument();
      
      // ProgressBar - time display
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Playlist - list of songs
      expect(screen.getByRole('list')).toBeInTheDocument();
      
      // AddSongForm - form inputs
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('should not throw errors on mount', () => {
      expect(() => render(<Player />)).not.toThrow();
    });
  });

  describe('Audio Element', () => {
    it('should have audio element with ref', () => {
      const { container } = render(<Player />);

      const audio = container.querySelector('audio');

      expect(audio).toBeInTheDocument();
    });

    it('should bind audio src to current song', () => {
      const { container } = render(<Player />);

      const audio = container.querySelector('audio') as HTMLAudioElement;

      expect(audio.src).toContain('/1.mp3');
    });

    it('should update audio src when song changes', async () => {
      const user = userEvent.setup();
      const { container } = render(<Player />);

      const audio = container.querySelector('audio') as HTMLAudioElement;
      const initialSrc = audio.src;

      // Click next song in playlist
      const playlistItems = screen.getAllByRole('listitem');
      await user.click(playlistItems[1]);

      await waitFor(() => {
        expect(audio.src).not.toBe(initialSrc);
        expect(audio.src).toContain('/2.mp3');
      });
    });

    it('should configure audio element properly', () => {
      const { container } = render(<Player />);

      const audio = container.querySelector('audio') as HTMLAudioElement;

      expect(audio).toBeInTheDocument();
      // May have preload, controls attributes
      expect(audio.tagName).toBe('AUDIO');
    });
  });

  describe('Hook Integration', () => {
    it('should call usePlaylist with initial data', () => {
      render(<Player />);

      // Verify initial playlist is loaded
      expect(PlaylistDataProvider.loadInitialPlaylist).toHaveBeenCalled();
      
      // Verify songs are displayed
      expect(screen.getByText('Song 1')).toBeInTheDocument();
      expect(screen.getByText('Song 2')).toBeInTheDocument();
    });

    it('should integrate useAudioPlayer with audioRef', () => {
      const { container } = render(<Player />);

      const audio = container.querySelector('audio');

      // Audio element should exist for useAudioPlayer
      expect(audio).toBeInTheDocument();
    });

    it('should use hook state in components', () => {
      render(<Player />);

      // Playback controls should be functional (from useAudioPlayer)
      const playButton = screen.getByLabelText(/play/i);
      expect(playButton).toBeInTheDocument();
      
      // Playlist should show songs (from usePlaylist)
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('TrackInfo Integration', () => {
    it('should display current song title', () => {
      render(<Player />);

      expect(screen.getByText('Song 1')).toBeInTheDocument();
    });

    it('should display current song artist', () => {
      render(<Player />);

      expect(screen.getByText('Artist 1')).toBeInTheDocument();
    });

    it('should display current song cover', () => {
      render(<Player />);

      const coverImage = screen.getByAltText(/Song 1.*Artist 1/i);

      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute('src', expect.stringContaining('/1.jpg'));
    });

    it('should update when song changes', async () => {
      const user = userEvent.setup();
      render(<Player />);

      expect(screen.getByText('Song 1')).toBeInTheDocument();

      // Select second song
      const playlistItems = screen.getAllByRole('listitem');
      await user.click(playlistItems[1]);

      await waitFor(() => {
        expect(screen.getByText('Song 2')).toBeInTheDocument();
      });
    });
  });

  describe('Controls Integration', () => {
    it('should render play/pause button', () => {
      render(<Player />);

      const playButton = screen.getByLabelText(/play/i);

      expect(playButton).toBeInTheDocument();
    });

    it('should render next and previous buttons', () => {
      render(<Player />);

      expect(screen.getByLabelText(/next/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/previous/i)).toBeInTheDocument();
    });

    it('should render shuffle and repeat buttons', () => {
      render(<Player />);

      expect(screen.getByLabelText(/shuffle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/repeat/i)).toBeInTheDocument();
    });

    it('should toggle play/pause', async () => {
      const user = userEvent.setup();
      render(<Player />);

      const playButton = screen.getByLabelText(/play/i);

      await user.click(playButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
      });
    });

    it('should navigate with next button', async () => {
      const user = userEvent.setup();
      render(<Player />);

      expect(screen.getByText('Song 1')).toBeInTheDocument();

      const nextButton = screen.getByLabelText(/next/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Song 2')).toBeInTheDocument();
      });
    });

    it('should navigate with previous button', async () => {
      const user = userEvent.setup();
      render(<Player />);

      // First go to second song
      const nextButton = screen.getByLabelText(/next/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Song 2')).toBeInTheDocument();
      });

      // Then go back
      const prevButton = screen.getByLabelText(/previous/i);
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('Song 1')).toBeInTheDocument();
      });
    });
  });

  describe('ProgressBar Integration', () => {
    it('should render progress bar', () => {
      render(<Player />);

      const progressBar = screen.getByRole('progressbar');

      expect(progressBar).toBeInTheDocument();
    });

    it('should display current time', () => {
      render(<Player />);

      // Should show time display (00:00 initially)
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });

    it('should handle seek interaction', async () => {
      const user = userEvent.setup();
      render(<Player />);

      const progressBar = screen.getByRole('progressbar');

      // Mock getBoundingClientRect for click
      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      // Click to seek
      await user.click(progressBar);

      // Audio element should be updated (via useAudioPlayer)
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle keyboard seeking', async () => {
      const user = userEvent.setup();
      render(<Player />);

      const progressBar = screen.getByRole('progressbar');

      progressBar.focus();
      await user.keyboard('{ArrowRight}');

      // Should update time (via useAudioPlayer)
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Playlist Integration', () => {
    it('should display all songs', () => {
      render(<Player />);

      const listItems = screen.getAllByRole('listitem');

      expect(listItems).toHaveLength(mockSongs.length);
    });

    it('should highlight current song', () => {
      render(<Player />);

      const listItems = screen.getAllByRole('listitem');

      expect(listItems[0]).toHaveAttribute('aria-current', 'true');
    });

    it('should select song on click', async () => {
      const user = userEvent.setup();
      render(<Player />);

      expect(screen.getByText('Song 1')).toBeInTheDocument();

      const playlistItems = screen.getAllByRole('listitem');
      await user.click(playlistItems[2]);

      await waitFor(() => {
        expect(screen.getByText('Song 3')).toBeInTheDocument();
        expect(playlistItems[2]).toHaveAttribute('aria-current', 'true');
      });
    });

    it('should remove song on delete', async () => {
      const user = userEvent.setup();
      render(<Player />);

      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);
      const initialCount = deleteButtons.length;

      await user.click(deleteButtons[1]);

      await waitFor(() => {
        const remainingButtons = screen.getAllByLabelText(/delete|remove/i);
        expect(remainingButtons.length).toBe(initialCount - 1);
      });
    });
  });

  describe('AddSongForm Integration', () => {
    it('should render add song form', () => {
      render(<Player />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/artist/i)).toBeInTheDocument();
    });

    it('should add song to playlist', async () => {
      const user = userEvent.setup();
      render(<Player />);

      const initialItems = screen.getAllByRole('listitem');
      const initialCount = initialItems.length;

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'New Song');
      await user.type(screen.getByLabelText(/artist/i), 'New Artist');
      await user.type(screen.getByLabelText(/cover/i), '/new.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/new.mp3');

      // Submit
      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        const updatedItems = screen.getAllByRole('listitem');
        expect(updatedItems.length).toBe(initialCount + 1);
        expect(screen.getByText('New Song')).toBeInTheDocument();
      });
    });
  });

  describe('Playback Flow', () => {
    it('should coordinate song selection and playback', async () => {
      const user = userEvent.setup();
      const { container } = render(<Player />);

      const audio = container.querySelector('audio') as HTMLAudioElement;

      // Select second song
      const playlistItems = screen.getAllByRole('listitem');
      await user.click(playlistItems[1]);

      await waitFor(() => {
        expect(audio.src).toContain('/2.mp3');
        expect(screen.getByText('Song 2')).toBeInTheDocument();
      });
    });

    it('should handle play after navigation', async () => {
      const user = userEvent.setup();
      render(<Player />);

      // Navigate to next song
      await user.click(screen.getByLabelText(/next/i));

      await waitFor(() => {
        expect(screen.getByText('Song 2')).toBeInTheDocument();
      });

      // Play
      await user.click(screen.getByLabelText(/play/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
      });
    });

    it('should update all components on song change', async () => {
      const user = userEvent.setup();
      const { container } = render(<Player />);

      const audio = container.querySelector('audio') as HTMLAudioElement;

      await user.click(screen.getByLabelText(/next/i));

      await waitFor(() => {
        // TrackInfo updated
        expect(screen.getByText('Song 2')).toBeInTheDocument();
        
        // Audio src updated
        expect(audio.src).toContain('/2.mp3');
        
        // Playlist highlight updated
        const items = screen.getAllByRole('listitem');
        expect(items[1]).toHaveAttribute('aria-current', 'true');
      });
    });
  });

  describe('Seek Functionality', () => {
    it('should seek audio on ProgressBar interaction', async () => {
      const user = userEvent.setup();
      const { container } = render(<Player />);

      const progressBar = screen.getByRole('progressbar');
      const audio = container.querySelector('audio') as HTMLAudioElement;

      progressBar.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        width: 100,
        top: 0,
        right: 100,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }));

      audio.duration = 100;
      audio.currentTime = 0;

      await user.click(progressBar);

      // Audio should be updated via useAudioPlayer
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Playlist Management', () => {
    it('should update playlist when song added', async () => {
      const user = userEvent.setup();
      render(<Player />);

      const initialCount = screen.getAllByRole('listitem').length;

      await user.type(screen.getByLabelText(/title/i), 'Added Song');
      await user.type(screen.getByLabelText(/artist/i), 'Added Artist');
      await user.type(screen.getByLabelText(/cover/i), '/added.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/added.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getAllByRole('listitem').length).toBe(initialCount + 1);
      });
    });

    it('should update playlist when song removed', async () => {
      const user = userEvent.setup();
      render(<Player />);

      const initialCount = screen.getAllByRole('listitem').length;

      const deleteButton = screen.getAllByLabelText(/delete|remove/i)[2];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getAllByRole('listitem').length).toBe(initialCount - 1);
      });
    });

    it('should adjust currentIndex when removing song before current', async () => {
      const user = userEvent.setup();
      render(<Player />);

      // Go to third song
      await user.click(screen.getAllByRole('listitem')[2]);

      await waitFor(() => {
        expect(screen.getByText('Song 3')).toBeInTheDocument();
      });

      // Remove first song
      await user.click(screen.getAllByLabelText(/delete|remove/i)[0]);

      // Should still show Song 3
      await waitFor(() => {
        expect(screen.getByText('Song 3')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle audio load errors gracefully', () => {
      const { container } = render(<Player />);

      const audio = container.querySelector('audio') as HTMLAudioElement;

      // Trigger error
      const errorEvent = new Event('error');
      audio.dispatchEvent(errorEvent);

      // Should not crash
      expect(container).toBeInTheDocument();
    });

    it('should handle empty playlist', () => {
      jest.spyOn(PlaylistDataProvider, 'loadInitialPlaylist').mockReturnValue([]);

      render(<Player />);

      expect(screen.getByText(/no songs/i)).toBeInTheDocument();
    });

    it('should handle removing current song', async () => {
      const user = userEvent.setup();
      render(<Player />);

      const deleteButtons = screen.getAllByLabelText(/delete|remove/i);
      await user.click(deleteButtons[0]);

      // Should move to next song or handle gracefully
      await waitFor(() => {
        expect(screen.queryByText('Song 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('State Coordination', () => {
    it('should share playback state across components', async () => {
      const user = userEvent.setup();
      render(<Player />);

      // Play from Controls
      await user.click(screen.getByLabelText(/play/i));

      await waitFor(() => {
        // State should be reflected in Controls
        expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
      });
    });

    it('should share playlist state across components', async () => {
      const user = userEvent.setup();
      render(<Player />);

      // Select from Playlist
      await user.click(screen.getAllByRole('listitem')[1]);

      await waitFor(() => {
        // TrackInfo should update
        expect(screen.getByText('Song 2')).toBeInTheDocument();
        
        // Playlist highlight should update
        expect(screen.getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'true');
      });
    });

    it('should maintain consistent state across updates', async () => {
      const user = userEvent.setup();
      render(<Player />);

      // Multiple operations
      await user.click(screen.getByLabelText(/next/i));
      await user.click(screen.getByLabelText(/play/i));
      await user.click(screen.getByLabelText(/shuffle/i));

      // All components should reflect current state
      await waitFor(() => {
        expect(screen.getByText('Song 2')).toBeInTheDocument();
        expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/shuffle/i)).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Initial Load', () => {
    it('should load initial playlist on mount', () => {
      render(<Player />);

      expect(PlaylistDataProvider.loadInitialPlaylist).toHaveBeenCalled();
      expect(screen.getByText('Song 1')).toBeInTheDocument();
    });

    it('should have first song ready', () => {
      const { container } = render(<Player />);

      const audio = container.querySelector('audio') as HTMLAudioElement;

      expect(audio.src).toContain('/1.mp3');
      expect(screen.getByText('Song 1')).toBeInTheDocument();
    });

    it('should not autoplay', () => {
      const { container } = render(<Player />);

      const audio = container.querySelector('audio') as HTMLAudioElement;

      expect(audio.autoplay).toBeFalsy();
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single song playlist', () => {
      jest.spyOn(PlaylistDataProvider, 'loadInitialPlaylist').mockReturnValue([mockSongs[0]]);

      render(<Player />);

      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      
      // Previous/Next might be disabled
      const prevButton = screen.getByLabelText(/previous/i);
      expect(prevButton).toBeDisabled();
    });

    it('should handle rapid song changes', async () => {
      const user = userEvent.setup();
      render(<Player />);

      await user.click(screen.getByLabelText(/next/i));
      await user.click(screen.getByLabelText(/next/i));
      await user.click(screen.getByLabelText(/previous/i));

      await waitFor(() => {
        expect(screen.getByText('Song 2')).toBeInTheDocument();
      });
    });

    it('should handle removing songs during playback', async () => {
      const user = userEvent.setup();
      render(<Player />);

      // Start playing
      await user.click(screen.getByLabelText(/play/i));

      // Remove a song
      await user.click(screen.getAllByLabelText(/delete|remove/i)[1]);

      // Should continue working
      await waitFor(() => {
        expect(screen.getAllByRole('listitem').length).toBe(mockSongs.length - 1);
      });
    });

    it('should handle adding songs during playback', async () => {
      const user = userEvent.setup();
      render(<Player />);

      // Start playing
      await user.click(screen.getByLabelText(/play/i));

      // Add a song
      await user.type(screen.getByLabelText(/title/i), 'New');
      await user.type(screen.getByLabelText(/artist/i), 'Artist');
      await user.type(screen.getByLabelText(/cover/i), '/cover.jpg');
      await user.type(screen.getByLabelText(/url|audio/i), '/song.mp3');
      await user.click(screen.getByRole('button', { name: /add|submit/i }));

      await waitFor(() => {
        expect(screen.getAllByRole('listitem').length).toBe(mockSongs.length + 1);
        expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
      });
    });
  });
});
```

---

## TEST REQUIREMENTS

### Integration Testing:
- [ ] Test all 5 sub-components render
- [ ] Test hook integration
- [ ] Test state coordination
- [ ] Test component communication

### Audio Element:
- [ ] Mock HTMLAudioElement methods
- [ ] Test ref binding
- [ ] Test src updates
- [ ] Test playback control

### User Interactions:
- [ ] Use userEvent for all interactions
- [ ] Test complete user flows
- [ ] Test multiple component interactions
- [ ] Use waitFor for async updates

### Mocking:
- [ ] Mock PlaylistDataProvider
- [ ] Mock localStorage
- [ ] Mock audio element
- [ ] Mock custom hooks if needed

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/components/Player.test.tsx
[Generated test code]
```

### 2. Coverage Matrix

| Test Category | Test Cases |
|--------------|------------|
| Rendering - Basic | 4 |
| Audio Element | 4 |
| Hook Integration | 3 |
| TrackInfo Integration | 4 |
| Controls Integration | 6 |
| ProgressBar Integration | 4 |
| Playlist Integration | 4 |
| AddSongForm Integration | 2 |
| Playback Flow | 3 |
| Seek Functionality | 1 |
| Playlist Management | 3 |
| Error Handling | 3 |
| State Coordination | 3 |
| Initial Load | 3 |
| Edge Cases | 5 |
| **TOTAL** | **52** |

### 3. Expected Coverage
- **Line:** 100%
- **Branch:** 100%
- **Function:** 100%

### 4. Execution Instructions
```bash
npm test tests/components/Player.test.tsx
npm test -- --coverage tests/components/Player.test.tsx
```
