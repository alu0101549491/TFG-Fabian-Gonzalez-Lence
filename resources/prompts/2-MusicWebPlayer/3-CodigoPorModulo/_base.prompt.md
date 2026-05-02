Now I'm going to send you the general code base structure and a couple of prompts to fill each code file to accomplish having the application fully functional:

## 3. MAIN TYPE DEFINITIONS

### src/types/song.ts
```typescript
/**
 * Represents a song in the music player.
 * @category Types
 */
export interface Song {
  /** Unique identifier for the song */
  id: string;
  
  /** Title of the song */
  title: string;
  
  /** Artist name */
  artist: string;
  
  /** URL to the cover art image */
  cover: string;
  
  /** URL to the audio file */
  url: string;
}
```

### src/types/playback-error.ts
```typescript
/**
 * Enumeration of possible playback error types.
 * @enum {string}
 * @category Types
 */
export enum ErrorType {
  /** Error loading the audio file */
  LOAD_ERROR = 'LOAD_ERROR',
  
  /** Error decoding the audio data */
  DECODE_ERROR = 'DECODE_ERROR',
  
  /** Network error while fetching audio */
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  /** Audio format not supported by the browser */
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
}

/**
 * Represents a playback error with contextual information.
 * @category Types
 */
export interface PlaybackError {
  /** Type of error that occurred */
  type: ErrorType;
  
  /** Human-readable error message */
  message: string;
  
  /** ID of the song that caused the error */
  songId: string;
}
```

### src/types/validation.ts
```typescript
/**
 * Result of a validation operation.
 * @category Types
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  
  /** List of validation error messages */
  errors: string[];
}
```

## 4. CUSTOM HOOKS

### src/hooks/useLocalStorage.ts
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

### src/hooks/useAudioPlayer.ts
```typescript
import {useState, useEffect, RefObject} from 'react';
import {PlaybackError} from '@types/playback-error';

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
  setSource: (url: string) => void;
}

/**
 * Custom hook for managing HTML5 Audio element state and controls.
 * @param audioRef Reference to the audio HTML element
 * @returns Hook interface with playback state and controls
 * @category Hooks
 */
export function useAudioPlayer(
    audioRef: RefObject<HTMLAudioElement>,
): AudioPlayerHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const play = async (): Promise<void> => {
    // TODO: Implementation
  };

  const pause = (): void => {
    // TODO: Implementation
  };

  const seek = (time: number): void => {
    // TODO: Implementation
  };

  const setSource = (url: string): void => {
    // TODO: Implementation
  };

  const handleTimeUpdate = (): void => {
    // TODO: Implementation
  };

  const handleLoadedMetadata = (): void => {
    // TODO: Implementation
  };

  const handleEnded = (): void => {
    // TODO: Implementation
  };

  const handleError = (err: Error): void => {
    // TODO: Implementation
  };

  useEffect(() => {
    // TODO: Set up audio element event listeners
    return () => {
      // TODO: Cleanup
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

### src/hooks/usePlaylist.ts
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

## 5. UTILITY SERVICES

### src/utils/time-formatter.ts
```typescript
/**
 * Utility class for formatting time values.
 * @category Utilities
 */
export class TimeFormatter {
  /**
   * Formats seconds into MM:SS string format.
   * @param seconds The number of seconds to format
   * @returns Formatted time string (e.g., "03:45")
   */
  public static formatTime(seconds: number): string {
    // TODO: Implementation
    return '00:00';
  }

  /**
   * Parses a formatted time string back to seconds.
   * @param formatted The formatted time string (e.g., "03:45")
   * @returns Number of seconds
   */
  public static parseTime(formatted: string): number {
    // TODO: Implementation
    return 0;
  }

  /**
   * Pads a number with leading zero if needed.
   * @param num The number to pad
   * @returns Padded string
   * @private
   */
  private static padZero(num: number): string {
    // TODO: Implementation
    return '00';
  }
}
```

### src/utils/error-handler.ts
```typescript
import {PlaybackError, ErrorType} from '@types/playback-error';

/**
 * Utility class for handling and formatting errors.
 * @category Utilities
 */
export class ErrorHandler {
  /**
   * Converts a generic error into a PlaybackError.
   * @param error The error to handle
   * @returns Formatted playback error
   */
  public static handlePlaybackError(error: Error): PlaybackError {
    // TODO: Implementation
    return {
      type: ErrorType.LOAD_ERROR,
      message: '',
      songId: '',
    };
  }

  /**
   * Gets a user-friendly error message for an error type.
   * @param errorType The type of error
   * @returns Human-readable error message
   */
  public static getErrorMessage(errorType: ErrorType): string {
    // TODO: Implementation
    return '';
  }

  /**
   * Logs an error to the console with formatting.
   * @param error The error to log
   */
  public static logError(error: Error): void {
    // TODO: Implementation
  }
}
```

### src/utils/audio-validator.ts
```typescript
import {Song} from '@types/song';
import {ValidationResult} from '@types/validation';

/**
 * Utility class for validating audio and song data.
 * @category Utilities
 */
export class AudioValidator {
  /**
   * Validates if a URL points to a valid audio file.
   * @param url The URL to validate
   * @returns True if valid audio URL
   */
  public static isValidAudioUrl(url: string): boolean {
    // TODO: Implementation
    return false;
  }

  /**
   * Validates if a URL points to a valid image file.
   * @param url The URL to validate
   * @returns True if valid image URL
   */
  public static isValidImageUrl(url: string): boolean {
    // TODO: Implementation
    return false;
  }

  /**
   * Checks if the audio format is supported by the browser.
   * @param url The audio file URL
   * @returns True if format is supported
   */
  public static isSupportedFormat(url: string): boolean {
    // TODO: Implementation
    return false;
  }

  /**
   * Validates a complete song object.
   * @param song The song to validate
   * @returns Validation result with errors if any
   */
  public static validateSong(song: Song): ValidationResult {
    // TODO: Implementation
    return {
      isValid: false,
      errors: [],
    };
  }
}
```

## 6. DATA PROVIDER

### src/data/playlist-data-provider.ts
```typescript
import {Song} from '@types/song';

/**
 * Provides initial playlist data for the application.
 * @category Data
 */
export class PlaylistDataProvider {
  private static initialPlaylist: Song[] = [];

  /**
   * Loads the initial playlist data.
   * @returns Array of songs for initial playlist
   */
  public static loadInitialPlaylist(): Song[] {
    // TODO: Implementation
    return this.getDefaultPlaylist();
  }

  /**
   * Returns a default playlist with sample songs.
   * @returns Array of default songs
   */
  public static getDefaultPlaylist(): Song[] {
    // TODO: Implementation
    return [
      {
        id: '1',
        title: 'Sample Song 1',
        artist: 'Sample Artist 1',
        cover: '/covers/default-cover.jpg',
        url: '/songs/sample-song-1.mp3',
      },
      {
        id: '2',
        title: 'Sample Song 2',
        artist: 'Sample Artist 2',
        cover: '/covers/default-cover.jpg',
        url: '/songs/sample-song-2.mp3',
      },
      {
        id: '3',
        title: 'Sample Song 3',
        artist: 'Sample Artist 3',
        cover: '/covers/default-cover.jpg',
        url: '/songs/sample-song-3.mp3',
      },
    ];
  }

  /**
   * Fetches playlist from a JSON file.
   * @returns Promise resolving to array of songs
   * @private
   */
  private static async fetchFromJSON(): Promise<Song[]> {
    // TODO: Implementation
    return [];
  }
}
```

## 7. REACT COMPONENTS

### src/components/TrackInfo.tsx
```typescript
import React from 'react';

/**
 * Props for the TrackInfo component.
 * @category Components
 */
export interface TrackInfoProps {
  /** Song title to display */
  title: string;
  
  /** Artist name to display */
  artist: string;
  
  /** URL to the cover art image */
  cover: string;
}

/**
 * Component that displays current track information including cover art,
 * title, and artist.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const TrackInfo: React.FC<TrackInfoProps> = (props) => {
  // TODO: Implementation
  return (
    <div className="track-info">
      {/* TODO: Render track information */}
    </div>
  );
};
```

### src/components/Controls.tsx
```typescript
import React from 'react';

/**
 * Props for the Controls component.
 * @category Components
 */
export interface ControlsProps {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  
  /** Callback for play/pause button */
  onPlayPause: () => void;
  
  /** Callback for next button */
  onNext: () => void;
  
  /** Callback for previous button */
  onPrevious: () => void;
  
  /** Whether next button should be disabled */
  disableNext: boolean;
  
  /** Whether previous button should be disabled */
  disablePrevious: boolean;
}

/**
 * Component that renders playback control buttons.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Controls: React.FC<ControlsProps> = (props) => {
  const handlePlayPauseClick = (): void => {
    // TODO: Implementation
  };

  const handleNextClick = (): void => {
    // TODO: Implementation
  };

  const handlePreviousClick = (): void => {
    // TODO: Implementation
  };

  // TODO: Implementation
  return (
    <div className="controls">
      {/* TODO: Render control buttons */}
    </div>
  );
};
```

### src/components/ProgressBar.tsx
```typescript
import React from 'react';
import {TimeFormatter} from '@utils/time-formatter';

/**
 * Props for the ProgressBar component.
 * @category Components
 */
export interface ProgressBarProps {
  /** Current playback time in seconds */
  currentTime: number;
  
  /** Total duration in seconds */
  duration: number;
  
  /** Callback when user seeks to a new position */
  onSeek: (time: number) => void;
}

/**
 * Component that displays and controls playback progress.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const handleProgressClick = (event: React.MouseEvent): void => {
    // TODO: Implementation
  };

  const calculateClickPosition = (event: React.MouseEvent): number => {
    // TODO: Implementation
    return 0;
  };

  // TODO: Implementation
  return (
    <div className="progress-bar">
      {/* TODO: Render progress bar with time displays */}
    </div>
  );
};
```

### src/components/AddSongForm.tsx
```typescript
import React, {useState} from 'react';
import {Song} from '@types/song';
import {AudioValidator} from '@utils/audio-validator';

/**
 * Props for the AddSongForm component.
 * @category Components
 */
export interface AddSongFormProps {
  /** Callback when a new song is added */
  onAddSong: (song: Song) => void;
}

/**
 * State for the AddSongForm component.
 * @category Components
 */
export interface AddSongFormState {
  title: string;
  artist: string;
  cover: string;
  url: string;
}

/**
 * Component that provides a form to add new songs to the playlist.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const AddSongForm: React.FC<AddSongFormProps> = (props) => {
  const [formState, setFormState] = useState<AddSongFormState>({
    title: '',
    artist: '',
    cover: '',
    url: '',
  });

  const handleSubmit = (event: React.FormEvent): void => {
    // TODO: Implementation
  };

  const handleInputChange = (field: string, value: string): void => {
    // TODO: Implementation
  };

  const validateForm = (): boolean => {
    // TODO: Implementation
    return false;
  };

  const resetForm = (): void => {
    // TODO: Implementation
  };

  // TODO: Implementation
  return (
    <form className="add-song-form" onSubmit={handleSubmit}>
      {/* TODO: Render form fields */}
    </form>
  );
};
```

### src/components/Playlist.tsx
```typescript
import React from 'react';
import {Song} from '@types/song';
import {AddSongForm} from './AddSongForm';

/**
 * Props for the Playlist component.
 * @category Components
 */
export interface PlaylistProps {
  /** Array of songs in the playlist */
  songs: Song[];
  
  /** Index of the currently playing song */
  currentSongIndex: number;
  
  /** Callback when a song is selected */
  onSongSelect: (index: number) => void;
  
  /** Callback when a new song is added */
  onAddSong: (song: Song) => void;
  
  /** Callback when a song is removed */
  onRemoveSong: (id: string) => void;
}

/**
 * Component that displays the playlist and allows song management.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Playlist: React.FC<PlaylistProps> = (props) => {
  const handleSongClick = (index: number): void => {
    // TODO: Implementation
  };

  const handleDeleteClick = (id: string): void => {
    // TODO: Implementation
  };

  const handleAddSong = (song: Song): void => {
    // TODO: Implementation
  };

  // TODO: Implementation
  return (
    <div className="playlist">
      {/* TODO: Render playlist items and add song form */}
    </div>
  );
};
```

### src/components/Player.tsx
```typescript
import React, {useRef} from 'react';
import {Song} from '@types/song';
import {useAudioPlayer} from '@hooks/useAudioPlayer';
import {usePlaylist} from '@hooks/usePlaylist';
import {TrackInfo} from './TrackInfo';
import {Controls} from './Controls';
import {ProgressBar} from './ProgressBar';
import {Playlist} from './Playlist';

/**
 * Main container component that orchestrates all player functionality.
 * Manages state and coordinates between audio playback and UI components.
 * @returns React component
 * @category Components
 */
export const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioPlayer = useAudioPlayer(audioRef);
  const playlistManager = usePlaylist([]);

  const handlePlayPause = (): void => {
    // TODO: Implementation
  };

  const handleNext = (): void => {
    // TODO: Implementation
  };

  const handlePrevious = (): void => {
    // TODO: Implementation
  };

  const handleSeek = (time: number): void => {
    // TODO: Implementation
  };

  const handleSongSelect = (index: number): void => {
    // TODO: Implementation
  };

  const getCurrentSong = (): Song | null => {
    // TODO: Implementation
    return null;
  };

  // TODO: Implementation
  return (
    <div className="player">
      <audio ref={audioRef} />
      {/* TODO: Render all child components */}
    </div>
  );
};
```

### src/App.tsx
```typescript
import React from 'react';
import {Player} from '@components/Player';
import './styles/main.css';

/**
 * Root application component.
 * @returns React component
 * @category Components
 */
const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Music Web Player</h1>
      </header>
      <main className="app-main">
        <Player />
      </main>
    </div>
  );
};

export default App;
```

### src/main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Application entry point.
 * Renders the root React component into the DOM.
 */
const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
);
```

Wait for me to send you for each module/class a "specification requirement" for all of the methods and functions you'll need to code.
