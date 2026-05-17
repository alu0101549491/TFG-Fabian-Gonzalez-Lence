# Respuesta

## 1.2. Respuesta {toggle="true"}
```markdown
I'll generate the complete folder and file structure for the Music Web Player project following React + TypeScript best practices, Component-Based Architecture with Custom Hooks, and the Google Style Guide.

## 1. FOLDER STRUCTURE

```
2-MusicWebPlayer/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   ├── favicon.ico
│   └── songs/
│       ├── sample-song-1.mp3
│       ├── sample-song-2.mp3
│       └── sample-song-3.mp3
├── src/
│   ├── main.tsx
│   ├── App.tsx
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
│   │   └── useLocalStorage.ts
│   ├── types/
│   │   ├── song.ts
│   │   ├── playback-error.ts
│   │   └── validation.ts
│   ├── utils/
│   │   ├── time-formatter.ts
│   │   ├── error-handler.ts
│   │   └── audio-validator.ts
│   ├── data/
│   │   └── playlist-data-provider.ts
│   ├── styles/
│   │   └── main.css
│   └── vite-env.d.ts
├── tests/
│   ├── components/
│   │   ├── Player.test.tsx
│   │   ├── TrackInfo.test.tsx
│   │   ├── Controls.test.tsx
│   │   ├── ProgressBar.test.tsx
│   │   ├── Playlist.test.tsx
│   │   └── AddSongForm.test.tsx
│   ├── hooks/
│   │   ├── useAudioPlayer.test.ts
│   │   ├── usePlaylist.test.ts
│   │   └── useLocalStorage.test.ts
│   ├── utils/
│   │   ├── time-formatter.test.ts
│   │   ├── error-handler.test.ts
│   │   └── audio-validator.test.ts
│   └── __mocks__/
│       ├── styleMock.js
│       └── fileMock.js
├── docs/
│   └── ARCHITECTURE.md
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── jest.config.js
├── jest.setup.js
├── eslint.config.mjs
├── typedoc.json
├── index.html
└── README.md
```

## 2. CONFIGURATION FILES

### package.json
```json
{
  "name": "music-web-player",
  "version": "1.0.0",
  "description": "Interactive music player web application built with React, TypeScript and Vite",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "docs": "typedoc",
    "type-check": "tsc --noEmit"
  },
  "keywords": [
    "music-player",
    "react",
    "typescript",
    "vite",
    "spa"
  ],
  "author": "Fabián González Lence",
  "license": "MIT",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.15.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.9.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "eslint": "^9.15.0",
    "eslint-config-google": "^0.14.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "globals": "^15.12.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "typedoc": "^0.26.10",
    "typescript": "^5.6.3",
    "typescript-eslint": "^8.14.0",
    "vite": "^5.4.11"
  }
}
```

### tsconfig.json
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
      "@data/*": ["src/data/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### vite.config.ts
```typescript
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@data': resolve(__dirname, './src/data'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### jest.config.js
```javascript
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

### jest.setup.js
```javascript
// Setup file for Jest with React Testing Library
import '@testing-library/jest-dom';

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
```

### eslint.config.mjs
```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      files: ['**/*.{ts,tsx}'],
      plugins: {
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
      },
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.es2021,
          ...globals.node,
        },
        parserOptions: {
          project: './tsconfig.json',
          tsconfigRootDir: import.meta.dirname,
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        // Google Style Guide rules
        'indent': ['error', 2],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'max-len': ['error', {code: 100, ignoreUrls: true}],
        'no-trailing-spaces': 'error',
        'comma-dangle': ['error', 'always-multiline'],
        'object-curly-spacing': ['error', 'never'],
        'array-bracket-spacing': ['error', 'never'],
        'space-before-function-paren': ['error', {
          'anonymous': 'never',
          'named': 'never',
          'asyncArrow': 'always',
        }],
        
        // TypeScript rules
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', {
          'argsIgnorePattern': '^_',
        }],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            'selector': 'default',
            'format': ['camelCase'],
          },
          {
            'selector': 'variable',
            'format': ['camelCase', 'UPPER_CASE', 'PascalCase'],
          },
          {
            'selector': 'typeLike',
            'format': ['PascalCase'],
          },
          {
            'selector': 'enumMember',
            'format': ['UPPER_CASE'],
          },
        ],
        
        // React rules
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    {
      ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'docs/**'],
    },
);
```

### typedoc.json
```json
{
  "entryPoints": ["./src"],
  "entryPointStrategy": "expand",
  "out": "./docs/api",
  "exclude": ["**/*.test.ts?(x)", "**/__tests__/**", "**/__mocks__/**"],
  "excludePrivate": false,
  "excludeProtected": false,
  "excludeExternals": true,
  "excludeInternal": false,
  "name": "Music Web Player - API Documentation",
  "includeVersion": true,
  "readme": "./README.md",
  "plugin": [],
  "theme": "default",
  "categorizeByGroup": true,
  "categoryOrder": ["Components", "Hooks", "Types", "Utilities", "*"],
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  }
}
```

### .gitignore
```
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
build/
*.tsbuildinfo

# Testing
coverage/
.nyc_output/
*.lcov

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Documentation
docs/api/

# Temporary files
.tmp/
temp/
*.tmp
```

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

### src/vite-env.d.ts
```typescript
/// <reference types="vite/client" />
```

## 8. STYLES

### src/styles/main.css
```css
/* Global Styles */
:root {
  --primary-color: #1db954;
  --secondary-color: #191414;
  --background-color: #121212;
  --surface-color: #282828;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-color: #404040;
  --hover-color: #1ed760;
  --error-color: #f15e6c;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  min-height: 100vh;
}

/* App Layout */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: var(--secondary-color);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.app-header h1 {
  font-size: 2rem;
  font-weight: 700;
}

.app-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* Player Container */
.player {
  background-color: var(--surface-color);
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

/* Track Info */
.track-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.track-info img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.track-info-text {
  flex: 1;
}

.track-info-text h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.track-info-text p {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Controls */
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.controls button {
  background-color: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.controls button:hover:not(:disabled) {
  color: var(--hover-color);
  transform: scale(1.1);
}

.controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.controls .play-pause {
  background-color: var(--primary-color);
  color: var(--secondary-color);
  width: 56px;
  height: 56px;
  font-size: 1.5rem;
}

.controls .play-pause:hover {
  background-color: var(--hover-color);
}

/* Progress Bar */
.progress-bar {
  margin: 2rem 0;
}

.progress-bar-container {
  position: relative;
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  cursor: pointer;
  margin: 1rem 0;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 3px;
  transition: width 0.1s;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Playlist */
.playlist {
  margin-top: 2rem;
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
}

.playlist h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.playlist-items {
  max-height: 300px;
  overflow-y: auto;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.playlist-item:hover {
  background-color: var(--border-color);
}

.playlist-item.active {
  background-color: var(--border-color);
}

.playlist-item img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  margin-right: 1rem;
}

.playlist-item-info {
  flex: 1;
}

.playlist-item-info p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.playlist-item button {
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
}

.playlist-item button:hover {
  color: var(--error-color);
}

/* Add Song Form */
.add-song-form {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--secondary-color);
  border-radius: 8px;
}

.add-song-form h4 {
  margin-bottom: 1rem;
}

.add-song-form input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.add-song-form button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: var(--secondary-color);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-song-form button:hover {
  background-color: var(--hover-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .app-header h1 {
    font-size: 1.5rem;
  }

  .app-main {
    padding: 1rem;
  }

  .player {
    padding: 1.5rem;
  }

  .track-info {
    flex-direction: column;
    text-align: center;
  }

  .track-info img {
    width: 200px;
    height: 200px;
  }
}
```

## 9. HTML ENTRY POINT

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Interactive music player with playlist management">
  <meta name="author" content="Fabián González Lence">
  <title>Music Web Player</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

## 10. TEST MOCKS

### tests/__mocks__/styleMock.js
```javascript
module.exports = {};
```

### tests/__mocks__/fileMock.js
```javascript
module.exports = 'test-file-stub';
```

## 11. DOCUMENTATION FILES

### README.md
```markdown
# Music Web Player

An interactive music player web application built with React, TypeScript, and Vite. Features intuitive song playback, local playlist management, and displays complete information for each track.

## 🎵 Features

- Play/pause, next, and previous controls
- Progress bar with seek functionality
- Playlist management (add/remove songs)
- Track information display (title, artist, cover art)
- localStorage persistence for playlists
- Responsive design (desktop and mobile)
- Audio format validation
- Error handling for playback issues

## 🏗️ Architecture

This project follows **Component-Based Architecture with Custom Hooks**:

- **Components**: Presentation and container components following React best practices
- **Custom Hooks**: Reusable stateful logic encapsulation (useAudioPlayer, usePlaylist, useLocalStorage)
- **Utilities**: Helper functions for formatting, validation, and error handling
- **Types**: TypeScript interfaces and enums for type safety

### Design Patterns

- **Component-Based Pattern**: Separation between presentational and container components
- **Custom Hooks Pattern**: Encapsulation of reusable stateful logic
- **Composite Pattern**: Player component composes multiple child components
- **Observer Pattern**: React's state management for UI updates
- **Facade Pattern**: Hooks simplify browser API interactions

## 🛠️ Technology Stack

- **React 18**: UI library with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **ESLint**: Code linting (Google Style Guide)
- **TypeDoc**: API documentation generation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## 🚀 Setup Instructions

### 1. Navigate to project directory

```bash
cd 2-MusicWebPlayer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### 5. Preview production build

```bash
npm run preview
```

## 🧪 Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Generate coverage report

```bash
npm run test:coverage
```

Coverage reports will be available in the `coverage/` directory.

## 📝 Code Quality

### Run linter

```bash
npm run lint
```

### Fix linting issues automatically

```bash
npm run lint:fix
```

### Type checking

```bash
npm run type-check
```

## 📚 Documentation

Generate API documentation:

```bash
npm run docs
```

Documentation will be available in `docs/api/index.html`

## 📁 Project Structure

```
2-MusicWebPlayer/
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── data/             # Data providers
│   ├── styles/           # CSS styles
│   ├── App.tsx           # Root component
│   └── main.tsx          # Application entry point
├── tests/                # Unit tests
├── docs/                 # Documentation
├── public/               # Static assets
└── index.html            # HTML entry point
```

## 🎯 Non-Functional Requirements

- **Code Coverage**: ≥80%
- **UI Performance**: < 100ms response time
- **Code Quality**: ESLint compliance with Google TypeScript Style Guide
- **Documentation**: Complete JSDoc/TypeDoc coverage
- **Responsiveness**: Works on desktop and mobile (min 320px viewport)
- **Accessibility**: Keyboard-accessible controls

## 👥 Author

- **Fabián González Lence**
- Universidad de La Laguna - Computer Engineering Degree
- Academic Year: 2025-2026

## 📄 License

MIT

## 🔗 Related Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Detailed architectural decisions
- [API Documentation](./docs/api/index.html) - Generated TypeDoc documentation
```

### docs/ARCHITECTURE.md
```markdown
# Architecture Documentation

## Overview

The Music Web Player is built using **Component-Based Architecture with Custom Hooks**, providing clear separation of concerns, reusability, and maintainability.

## Architectural Decisions

### 1. Component-Based Architecture

**Rationale**: React's component model provides:
- Clear separation between presentation and logic
- Reusable UI components
- Easy testing and maintenance
- Declarative UI updates

**Component Types**:
- **Container Components**: Manage state and logic (Player)
- **Presentational Components**: Display UI based on props (TrackInfo, Controls, ProgressBar, Playlist)

### 2. Custom Hooks Pattern

**Rationale**: Custom hooks encapsulate reusable stateful logic:
- `useAudioPlayer`: HTML5 Audio API integration
- `usePlaylist`: Playlist state management
- `useLocalStorage`: Persistent storage with React state sync

**Benefits**:
- Logic reuse across components
- Easier testing of business logic
- Clear separation of concerns
- Simplified component code

### 3. TypeScript for Type Safety

**Rationale**: TypeScript provides:
- Compile-time type checking
- Better IDE support and autocomplete
- Self-documenting code through types
- Easier refactoring and maintenance
- Reduced runtime errors

### 4. Vite as Build Tool

**Rationale**: Vite offers:
- Lightning-fast HMR (Hot Module Replacement)
- Native ES modules support
- Optimized production builds
- Simple configuration
- Fast development server startup

### 5. React 18 Features

**Rationale**: React 18 provides:
- Concurrent rendering
- Automatic batching of state updates
- Improved performance
- Modern hooks API
- Strict mode for development

### 6. localStorage for Persistence

**Rationale**: localStorage offers:
- Simple API for data persistence
- No backend required
- Instant data access
- Suitable for playlist data
- Cross-session persistence

## Component Interaction Flow

```
User Interaction → Component Event Handler
                  ↓
               Custom Hook
                  ↓
            State Update
                  ↓
       React Re-render
                  ↓
          UI Update
```

## State Management

State is distributed across custom hooks:

### useAudioPlayer Hook
- `isPlaying`: Playback status
- `currentTime`: Current position
- `duration`: Total audio length
- `error`: Playback errors

### usePlaylist Hook
- `playlist`: Array of songs
- `currentIndex`: Selected song index
- Operations: add, remove, navigate

### useLocalStorage Hook
- Syncs React state with localStorage
- Handles serialization/deserialization
- Provides cross-tab synchronization

## Testing Strategy

### Unit Tests
- **Hooks**: Test logic in isolation with renderHook
- **Components**: Test rendering and user interactions
- **Utilities**: Test pure functions

### Coverage Goals
- Minimum 80% code coverage
- All public methods tested
- Edge cases covered
- Error scenarios handled

### Test Structure
```
tests/
├── components/
├── hooks/
└── utils/
```

## Performance Considerations

1. **Efficient Re-renders**: Proper use of React.memo and useMemo
2. **Audio Optimization**: Preload metadata, handle buffering
3. **List Virtualization**: For large playlists (future enhancement)
4. **Lazy Loading**: Code splitting for optimal bundle size

## Security Considerations

1. **Input Validation**: Validate all user inputs (URLs, form data)
2. **XSS Prevention**: Proper escaping of user content
3. **CORS**: Handle cross-origin audio files appropriately
4. **Content Security Policy**: Restrict resource loading

## Scalability

### Current Scope
- Single-user application
- Client-side playlist storage
- Local audio files or URLs

### Future Extensions
- Backend API for playlist sync
- User authentication
- Cloud storage integration
- Social features (sharing, collaboration)
- Advanced features (equalizer, visualizations)
- Podcast support

## Browser Compatibility

**Target Browsers**:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Required Features**:
- HTML5 Audio API
- localStorage API
- ES2020+ JavaScript features

## Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deployment
Static files in `dist/` can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## Documentation Standards

### Code Documentation
- JSDoc comments for all public APIs
- TypeDoc for generating HTML documentation
- Inline comments for complex logic
- Type annotations for clarity

### API Documentation
```bash
npm run docs
```

## Continuous Integration

GitHub Actions workflow includes:
1. Linting (ESLint)
2. Type checking (TypeScript)
3. Unit tests (Jest)
4. Coverage reporting
5. Build verification
6. Documentation generation

## Non-Functional Requirements Compliance

| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| Maintainability | Component-based architecture, modular code | Code review, ESLint |
| Testability | ≥80% coverage | Jest reports |
| Performance | UI updates < 100ms | Performance tests |
| Responsiveness | CSS flexbox, media queries | Manual testing |
| Code Quality | Google Style Guide | ESLint |
| Documentation | JSDoc/TypeDoc | Generated docs |
| Accessibility | Semantic HTML, keyboard support | Manual testing |

## References

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [HTML5 Audio API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [React Testing Library](https://testing-library.com/react)
```

### .github/workflows/ci.yml
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: '2-MusicWebPlayer/package-lock.json'
      
      - name: Install dependencies
        working-directory: 2-MusicWebPlayer
        run: npm ci
      
      - name: Run linter
        working-directory: 2-MusicWebPlayer
        run: npm run lint
      
      - name: Run type check
        working-directory: 2-MusicWebPlayer
        run: npm run type-check
      
      - name: Run tests
        working-directory: 2-MusicWebPlayer
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          file: 2-MusicWebPlayer/coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
      
      - name: Build project
        working-directory: 2-MusicWebPlayer
        run: npm run build
      
      - name: Generate documentation
        working-directory: 2-MusicWebPlayer
        run: npm run docs
```

## 12. INITIALIZATION COMMANDS

```bash
# Navigate to project directory
cd 2-MusicWebPlayer

# Initialize npm project (package.json already provided above)
npm init -y

# Install production dependencies
npm install react react-dom

# Install development dependencies
npm install --save-dev \
  @eslint/js \
  @testing-library/jest-dom \
  @testing-library/react \
  @testing-library/user-event \
  @types/jest \
  @types/node \
  @types/react \
  @types/react-dom \
  @vitejs/plugin-react \
  eslint \
  eslint-config-google \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  globals \
  jest \
  jest-environment-jsdom \
  ts-jest \
  ts-node \
  typedoc \
  typescript \
  typescript-eslint \
  vite

# Create necessary directories
mkdir -p src/components src/hooks src/types src/utils src/data src/styles
mkdir -p tests/components tests/hooks tests/utils tests/__mocks__
mkdir -p docs
mkdir -p public/songs
mkdir -p .github/workflows

# Create mock files for Jest
echo "module.exports = {};" > tests/__mocks__/styleMock.js
echo "module.exports = 'test-file-stub';" > tests/__mocks__/fileMock.js

# Verify installation
npm run type-check
npm run lint
npm test

# Start development server
npm run dev
```

## 13. ARCHITECTURAL JUSTIFICATION

### Why Component-Based Architecture with Custom Hooks?

1. **Separation of Concerns**: Components handle UI, hooks handle logic
2. **Reusability**: Hooks can be reused across multiple components
3. **Testability**: Logic and UI can be tested independently
4. **Maintainability**: Clear structure makes code easy to understand and modify
5. **Scalability**: Easy to add new features without affecting existing code

### Why React?

1. **Industry Standard**: Widely adopted with strong ecosystem
2. **Component Model**: Natural fit for UI development
3. **Hooks API**: Modern approach to state and side effects
4. **Performance**: Efficient rendering with Virtual DOM
5. **Developer Experience**: Excellent tooling and documentation

### Why TypeScript?

1. **Type Safety**: Catch errors at compile-time
2. **Better Refactoring**: IDE support for safe refactoring
3. **Self-Documenting**: Types serve as inline documentation
4. **Team Collaboration**: Easier to understand code written by others
5. **Industry Trend**: Increasingly adopted in modern web development

### Why Vite?

1. **Speed**: Instant server start and fast HMR
2. **Modern**: Native ES modules support
3. **Simple**: Minimal configuration required
4. **Optimized**: Excellent production builds with Rollup
5. **React Support**: First-class React integration

### Why Custom Hooks?

1. **Logic Encapsulation**: Business logic separate from UI
2. **Reusability**: Same logic in multiple components
3. **Testing**: Test logic without rendering components
4. **Composition**: Combine multiple hooks for complex features
5. **React Ecosystem**: Standard pattern in modern React

### Testing Strategy

1. **Jest**: Industry-standard testing framework
2. **React Testing Library**: Focus on user behavior
3. **ts-jest**: Seamless TypeScript integration
4. **jsdom**: Browser environment simulation
5. **High Coverage**: 80% minimum ensures quality

This structure provides a solid foundation for developing the Music Web Player while adhering to React and TypeScript best practices, Component-Based Architecture with Custom Hooks, and the Google Style Guide for code quality.
```