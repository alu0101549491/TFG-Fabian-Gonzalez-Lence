# TESTING PROMPT #7: `src/data/playlist-data-provider.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** PlaylistDataProvider

**File path:** `src/data/playlist-data-provider.ts`

**Test file path:** `tests/data/playlist-data-provider.test.ts`

**Testing framework:** Jest, TS-Jest

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Data/PlaylistDataProvider
 * @category Data
 * @description
 * This module provides the initial playlist data for the Music Web Player application.
 * It serves as the data source for the default playlist that loads when the application
 * starts for the first time, ensuring users have content to interact with immediately.
 */

import { Song } from '@types/song';
import { AudioValidator } from '@utils/audio-validator';

/**
 * Provides initial playlist data for the application.
 * This static class contains methods to load the default playlist and supports
 * loading playlists from external JSON sources.
 */
export class PlaylistDataProvider {
  /**
   * Loads and returns the initial playlist data for the application.
   * Attempts to load from JSON first, then falls back to the default hardcoded playlist.
   *
   * @returns Array of Song objects for the initial playlist
   * @static
   */
  public static async loadInitialPlaylist(): Promise<Song[]> {
    try {
      // First try to load from JSON
      const jsonSongs = await this.fetchFromJSON();

      // If we got valid songs from JSON, use them
      if (jsonSongs.length > 0) {
        return jsonSongs;
      }
    } catch (error) {
      // If JSON loading fails, log the error and continue with default
      console.warn('Failed to load playlist from JSON:', error);
    }

    // Fall back to default playlist
    return this.getDefaultPlaylist();
  }

  /**
   * Returns a hardcoded default playlist with example songs.
   * This provides a fallback playlist with diverse music examples that
   * use audio files from the public directory.
   *
   * @returns Array of Song objects with complete data
   * @static
   */
  public static getDefaultPlaylist(): Song[] {
    // Default playlist with 7 diverse songs
    return [
      {
        id: "1",
        title: "Midnight Serenade",
        artist: "Luna Eclipse",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-1.mp3"
      },
      {
        id: "2",
        title: "Electric Dawn",
        artist: "Neon Horizon",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-2.mp3"
      },
      {
        id: "3",
        title: "Jazz in Paris",
        artist: "Sophie Martin Quartet",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-3.mp3"
      },
      {
        id: "4",
        title: "Summer Breeze",
        artist: "The Coastal Collective",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-4.mp3"
      },
      {
        id: "5",
        title: "Symphony No. 5 (Excerpt)",
        artist: "Classical Orchestra",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-5.mp3"
      },
      {
        id: "6",
        title: "Rock Anthem",
        artist: "The Wild Ones",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-6.mp3"
      },
      {
        id: "7",
        title: "Chill Vibes",
        artist: "Lo-Fi Dreamer",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-7.mp3"
      }
    ];
  }

  /**
   * Asynchronously loads playlist data from a JSON file.
   * Loads from /public/playlist.json and validates the data structure.
   *
   * @returns Promise resolving to array of Song objects
   * @static
   */
  public static async fetchFromJSON(): Promise<Song[]> {
    try {
      const response = await fetch('/playlist.json');

      if (!response.ok) {
        console.warn(`Failed to load playlist JSON: HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();

      // Validate the JSON structure
      if (!data || !data.songs || !Array.isArray(data.songs)) {
        console.warn('Invalid playlist JSON structure');
        return [];
      }

      // Validate each song and filter out invalid ones
      const validSongs: Song[] = [];

      for (const song of data.songs) {
        try {
          // Create a temporary song object with the data
          const tempSong: Song = {
            id: song.id || Math.random().toString(36).substr(2, 9),
            title: song.title || '',
            artist: song.artist || '',
            cover: song.cover || '/covers/default-cover.jpg',
            url: song.url || ''
          };

          // Validate the song using AudioValidator
          const validation = AudioValidator.validateSong(tempSong);

          if (validation.isValid) {
            validSongs.push(tempSong);
          } else {
            console.warn('Invalid song in playlist JSON:', song, validation.errors);
          }
        } catch (error) {
          console.warn('Error processing song from JSON:', song, error);
        }
      }

      return validSongs;
    } catch (error) {
      console.warn('Error loading playlist JSON:', error);
      return [];
    }
  }
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

### From Code Review #7:

**Component Objective:**
Provides initial playlist data for the application. Returns a hardcoded array of Song objects with creative, realistic song names (NOT generic like "Song 1"). Minimum 5 songs required, 5-10 recommended for good UX. Can be implemented as static class or exported functions. Includes stub for future JSON fetching.

**Requirements:**
- **FR19:** Initial dataset with minimum 5 songs
- **FR14:** Display complete list of songs
- **NFR3:** Modular code structure
- **NFR5:** Static typing with TypeScript

**Functions to Test:**

1. **loadInitialPlaylist(): Song[]**
   - Returns array of Song objects
   - Minimum 5 songs (5-10 recommended)
   - Creative, realistic song names (NOT "Song 1", "Artist 1")
   - All Song fields complete (id, title, artist, cover, url)
   - Deterministic (same data every call)
   - Pure function (no side effects)

2. **getDefaultPlaylist(): Song[]** (alias or wrapper)
   - May be same as loadInitialPlaylist
   - Returns default song list
   - Pure function

3. **fetchFromJSON(): Promise<Song[]>** (stub for future)
   - Currently returns Promise with hardcoded data
   - OR throws "Not implemented" error
   - Documented as future enhancement stub
   - Should be tested but not fully implemented

**Song Data Requirements:**

| Requirement | Details |
|-------------|---------|
| Minimum songs | 5 (5-10 recommended) |
| Song titles | Creative, realistic (e.g., "Midnight Dreams", "Electric Pulse") |
| Artists | Creative, diverse (e.g., "Luna Eclipse", "The Neon Knights") |
| IDs | Unique for each song |
| Cover URLs | Valid URL format (can be placeholder paths) |
| Audio URLs | Valid URL format, reference /songs/ directory |
| Genre diversity | Mix of styles (rock, pop, electronic, jazz, etc.) |

**Example Good Data:**
```typescript
[
  {
    id: 'song-001',
    title: 'Midnight Dreams',
    artist: 'Luna Eclipse',
    cover: '/covers/midnight-dreams.jpg',
    url: '/songs/midnight-dreams.mp3'
  },
  {
    id: 'song-002',
    title: 'Electric Pulse',
    artist: 'The Neon Knights',
    cover: '/covers/electric-pulse.jpg',
    url: '/songs/electric-pulse.wav'
  }
  // ... at least 3 more
]
```

**Example Bad Data (AVOID):**
```typescript
[
  { id: '1', title: 'Song 1', artist: 'Artist 1', ... }, // Too generic!
  { id: '2', title: 'Song 2', artist: 'Artist 2', ... }  // Too generic!
]
```

**Critical Requirements:**
- Static class OR exported functions (not both)
- Returns Song[] type
- All songs have unique IDs
- All songs have complete fields
- Deterministic (same data every time)
- No side effects
- Creative song/artist names
- Valid URLs (format, not necessarily real files)

**Usage Context:**
- Called once at app initialization
- Used by usePlaylist hook to set initial state
- Used by Player component to populate playlist on mount
- Data should be realistic for testing/demo purposes

---

## USE CASE DIAGRAM

```
PlaylistDataProvider
├── loadInitialPlaylist()
│   ├── Returns hardcoded Song array
│   ├── Minimum 5 creative songs
│   └── Used at app initialization
│
├── getDefaultPlaylist()
│   └── May be alias of loadInitialPlaylist
│
└── fetchFromJSON() [STUB]
    ├── Future: Load from JSON file
    ├── Current: Stub implementation
    └── Not fully functional yet
```

---

## TASK

Generate a complete unit test suite for the **PlaylistDataProvider** that covers:

### 1. LOADINITIALPLAYLIST - BASIC STRUCTURE
Test return value structure:
- Returns array
- Array has minimum 5 songs
- Array has maximum reasonable songs (≤20)
- Each element is Song object
- All Song objects have 5 required fields
- Returns Song[] type

### 2. LOADINITIALPLAYLIST - SONG IDS
Test song IDs:
- All songs have id field
- All IDs are strings
- All IDs are non-empty
- All IDs are unique (no duplicates)
- IDs follow consistent format (optional)

### 3. LOADINITIALPLAYLIST - SONG TITLES
Test song titles:
- All songs have title field
- All titles are strings
- All titles are non-empty
- Titles are creative (NOT "Song 1", "Song 2", etc.)
- No duplicate titles (each song unique)
- Titles are realistic

### 4. LOADINITIALPLAYLIST - SONG ARTISTS
Test song artists:
- All songs have artist field
- All artists are strings
- All artists are non-empty
- Artists are creative (NOT "Artist 1", "Artist 2", etc.)
- Multiple artists represented (genre diversity)

### 5. LOADINITIALPLAYLIST - COVER URLS
Test cover URLs:
- All songs have cover field
- All covers are strings
- All covers are non-empty
- Cover URLs are valid format
- Covers reference image paths (e.g., /covers/)

### 6. LOADINITIALPLAYLIST - AUDIO URLS
Test audio URLs:
- All songs have url field
- All URLs are strings
- All URLs are non-empty
- Audio URLs are valid format
- URLs reference /songs/ directory
- URLs have audio extensions (.mp3, .wav, .ogg, .m4a)

### 7. LOADINITIALPLAYLIST - DATA QUALITY
Test data quality:
- Song titles are creative and realistic
- Artist names are creative and realistic
- No generic names like "Song 1", "Test Song"
- Genre diversity (different music styles implied)
- Professional-looking data (suitable for demo)

### 8. LOADINITIALPLAYLIST - DETERMINISTIC BEHAVIOR
Test function purity:
- Same data returned on every call
- Multiple calls return equal arrays
- No randomness in data
- No side effects

### 9. GETDEFAULTPLAYLIST - FUNCTIONALITY
Test getDefaultPlaylist (if separate):
- Returns Song array
- Returns same data as loadInitialPlaylist (or different if intended)
- Minimum 5 songs
- All songs valid

### 10. FETCHFROMJSON - STUB BEHAVIOR
Test stub implementation:
- Function exists and is exported
- Returns Promise<Song[]> (or throws "Not implemented")
- JSDoc indicates future enhancement
- Doesn't break when called
- Test can verify stub behavior

### 11. INTEGRATION TESTS
Test integration scenarios:
- Data works with AudioValidator (all songs pass validation)
- Data works with usePlaylist hook initialization
- Songs have valid format for playlist rendering

### 12. EDGE CASES
Test edge cases:
- Function can be called multiple times
- No memory leaks (pure function)
- Data is immutable (returns new array, not reference)
- Large dataset handling (if 10+ songs)

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect } from '@jest/globals';
import { PlaylistDataProvider } from '@/data/playlist-data-provider';
// OR: import { loadInitialPlaylist, getDefaultPlaylist, fetchFromJSON } from '@/data/playlist-data-provider';
import { Song } from '@/types/song';
import { validateSong } from '@/utils/audio-validator';

describe('PlaylistDataProvider', () => {
  describe('loadInitialPlaylist', () => {
    describe('Basic Structure', () => {
      it('should return an array', () => {
        // ACT
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // ASSERT
        expect(Array.isArray(playlist)).toBe(true);
      });

      it('should return at least 5 songs', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist.length).toBeGreaterThanOrEqual(5);
      });

      it('should return reasonable number of songs (≤20)', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist.length).toBeLessThanOrEqual(20);
      });

      it('should return Song objects with all required fields', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song).toHaveProperty('id');
          expect(song).toHaveProperty('title');
          expect(song).toHaveProperty('artist');
          expect(song).toHaveProperty('cover');
          expect(song).toHaveProperty('url');
        });
      });

      it('should return Song[] type', () => {
        const playlist: Song[] = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist).toBeDefined();
      });
    });

    describe('Song IDs', () => {
      it('should have non-empty ID for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.id).toBeTruthy();
          expect(typeof song.id).toBe('string');
          expect(song.id.length).toBeGreaterThan(0);
        });
      });

      it('should have unique IDs for all songs', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        const ids = playlist.map(song => song.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(playlist.length);
      });

      it('should not have duplicate IDs', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        const ids = playlist.map(song => song.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

        expect(duplicates).toHaveLength(0);
      });
    });

    describe('Song Titles', () => {
      it('should have non-empty title for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.title).toBeTruthy();
          expect(typeof song.title).toBe('string');
          expect(song.title.length).toBeGreaterThan(0);
        });
      });

      it('should have creative titles (not generic like "Song 1")', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          // Should NOT match patterns like "Song 1", "Song 2", "Test Song 1"
          expect(song.title).not.toMatch(/^Song \d+$/i);
          expect(song.title).not.toMatch(/^Test Song \d+$/i);
          expect(song.title).not.toMatch(/^Track \d+$/i);
        });
      });

      it('should have realistic, creative titles', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Check that titles have some creativity (multiple words, capitalization, etc.)
        playlist.forEach(song => {
          expect(song.title.length).toBeGreaterThan(3); // Not just "ABC"
        });
      });

      it('should not have duplicate titles', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        const titles = playlist.map(song => song.title);
        const uniqueTitles = new Set(titles);

        expect(uniqueTitles.size).toBe(playlist.length);
      });
    });

    describe('Song Artists', () => {
      it('should have non-empty artist for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.artist).toBeTruthy();
          expect(typeof song.artist).toBe('string');
          expect(song.artist.length).toBeGreaterThan(0);
        });
      });

      it('should have creative artist names (not generic like "Artist 1")', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.artist).not.toMatch(/^Artist \d+$/i);
          expect(song.artist).not.toMatch(/^Test Artist \d+$/i);
          expect(song.artist).not.toMatch(/^Unknown Artist$/i);
        });
      });

      it('should have multiple different artists (genre diversity)', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        const artists = playlist.map(song => song.artist);
        const uniqueArtists = new Set(artists);

        // Should have at least 3 different artists for diversity
        expect(uniqueArtists.size).toBeGreaterThanOrEqual(3);
      });
    });

    describe('Cover URLs', () => {
      it('should have non-empty cover URL for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.cover).toBeTruthy();
          expect(typeof song.cover).toBe('string');
          expect(song.cover.length).toBeGreaterThan(0);
        });
      });

      it('should have valid URL format for covers', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          // Should be valid URL format (http://, https://, or relative path)
          expect(
            song.cover.startsWith('http://') ||
            song.cover.startsWith('https://') ||
            song.cover.startsWith('/') ||
            song.cover.startsWith('./')
          ).toBe(true);
        });
      });

      it('should reference cover image paths', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Most covers should reference a /covers/ directory or similar
        const coversInDirectory = playlist.filter(song => 
          song.cover.includes('/covers/') || song.cover.includes('cover')
        );

        expect(coversInDirectory.length).toBeGreaterThan(0);
      });
    });

    describe('Audio URLs', () => {
      it('should have non-empty audio URL for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.url).toBeTruthy();
          expect(typeof song.url).toBe('string');
          expect(song.url.length).toBeGreaterThan(0);
        });
      });

      it('should have valid URL format for audio files', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(
            song.url.startsWith('http://') ||
            song.url.startsWith('https://') ||
            song.url.startsWith('/') ||
            song.url.startsWith('./')
          ).toBe(true);
        });
      });

      it('should reference /songs/ directory in audio URLs', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Most URLs should reference a /songs/ directory
        const songsInDirectory = playlist.filter(song => 
          song.url.includes('/songs/') || song.url.includes('/audio/')
        );

        expect(songsInDirectory.length).toBeGreaterThan(0);
      });

      it('should have audio file extensions', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          const hasAudioExtension = 
            song.url.toLowerCase().includes('.mp3') ||
            song.url.toLowerCase().includes('.wav') ||
            song.url.toLowerCase().includes('.ogg') ||
            song.url.toLowerCase().includes('.m4a');

          expect(hasAudioExtension).toBe(true);
        });
      });
    });

    describe('Data Quality', () => {
      it('should have professional, realistic song data', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          // Titles should be more than just one word
          const titleWordCount = song.title.split(/\s+/).length;
          expect(titleWordCount).toBeGreaterThan(0);

          // No "test" or "sample" in titles
          expect(song.title.toLowerCase()).not.toContain('test');
          expect(song.title.toLowerCase()).not.toContain('sample');
        });
      });

      it('should imply genre diversity through titles and artists', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Check that not all songs have same artist
        const artists = playlist.map(song => song.artist);
        const uniqueArtists = new Set(artists);

        expect(uniqueArtists.size).toBeGreaterThanOrEqual(3);
      });

      it('should have creative and varied song titles', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Check title diversity - not all starting with same word
        const firstWords = playlist.map(song => song.title.split(' ')[0]);
        const uniqueFirstWords = new Set(firstWords);

        expect(uniqueFirstWords.size).toBeGreaterThan(1);
      });
    });

    describe('Deterministic Behavior', () => {
      it('should return same data on multiple calls', () => {
        const playlist1 = PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = PlaylistDataProvider.loadInitialPlaylist();
        const playlist3 = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist1).toEqual(playlist2);
        expect(playlist2).toEqual(playlist3);
      });

      it('should return same number of songs every time', () => {
        const playlist1 = PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist1.length).toBe(playlist2.length);
      });

      it('should return songs in same order every time', () => {
        const playlist1 = PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = PlaylistDataProvider.loadInitialPlaylist();

        playlist1.forEach((song, index) => {
          expect(song.id).toBe(playlist2[index].id);
          expect(song.title).toBe(playlist2[index].title);
        });
      });

      it('should be a pure function (no side effects)', () => {
        const consoleSpy = jest.spyOn(console, 'log');

        PlaylistDataProvider.loadInitialPlaylist();

        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('getDefaultPlaylist', () => {
    it('should return Song array', () => {
      const playlist = PlaylistDataProvider.getDefaultPlaylist();

      expect(Array.isArray(playlist)).toBe(true);
      expect(playlist.length).toBeGreaterThanOrEqual(5);
    });

    it('should return same data as loadInitialPlaylist', () => {
      const initialPlaylist = PlaylistDataProvider.loadInitialPlaylist();
      const defaultPlaylist = PlaylistDataProvider.getDefaultPlaylist();

      expect(defaultPlaylist).toEqual(initialPlaylist);
    });

    it('should return valid Song objects', () => {
      const playlist = PlaylistDataProvider.getDefaultPlaylist();

      playlist.forEach(song => {
        expect(song).toHaveProperty('id');
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('artist');
        expect(song).toHaveProperty('cover');
        expect(song).toHaveProperty('url');
      });
    });
  });

  describe('fetchFromJSON (stub)', () => {
    it('should exist as a function', () => {
      expect(PlaylistDataProvider.fetchFromJSON).toBeDefined();
      expect(typeof PlaylistDataProvider.fetchFromJSON).toBe('function');
    });

    it('should return a Promise', () => {
      const result = PlaylistDataProvider.fetchFromJSON();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve with Song array or reject with not implemented', async () => {
      try {
        const playlist = await PlaylistDataProvider.fetchFromJSON();
        
        // If implemented as stub returning data
        expect(Array.isArray(playlist)).toBe(true);
      } catch (error) {
        // If implemented as stub throwing "Not implemented"
        expect(error).toBeDefined();
      }
    });

    it('should not break when called', async () => {
      // Should not throw synchronously
      expect(() => PlaylistDataProvider.fetchFromJSON()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should return songs that pass AudioValidator validation', () => {
      const playlist = PlaylistDataProvider.loadInitialPlaylist();

      playlist.forEach(song => {
        const validationResult = validateSong(song);
        
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);
      });
    });

    it('should provide data compatible with usePlaylist hook', () => {
      const playlist = PlaylistDataProvider.loadInitialPlaylist();

      // Should be a non-empty array
      expect(playlist.length).toBeGreaterThan(0);
      
      // Should have all required Song properties
      playlist.forEach(song => {
        expect(song.id).toBeDefined();
        expect(song.title).toBeDefined();
        expect(song.artist).toBeDefined();
        expect(song.cover).toBeDefined();
        expect(song.url).toBeDefined();
      });
    });

    it('should provide data that can be rendered in Playlist component', () => {
      const playlist = PlaylistDataProvider.loadInitialPlaylist();

      // All display fields should be non-empty
      playlist.forEach(song => {
        expect(song.title.length).toBeGreaterThan(0);
        expect(song.artist.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple consecutive calls', () => {
      for (let i = 0; i < 10; i++) {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();
        expect(playlist.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('should return new array reference (immutability)', () => {
      const playlist1 = PlaylistDataProvider.loadInitialPlaylist();
      const playlist2 = PlaylistDataProvider.loadInitialPlaylist();

      // Should be equal but not same reference
      expect(playlist1).toEqual(playlist2);
      expect(playlist1).not.toBe(playlist2);
    });

    it('should not cause memory leaks with repeated calls', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        PlaylistDataProvider.loadInitialPlaylist();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 10MB for 1000 calls)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Type Safety', () => {
    it('should return Song[] type', () => {
      const playlist: Song[] = PlaylistDataProvider.loadInitialPlaylist();

      expect(Array.isArray(playlist)).toBe(true);
    });

    it('should have proper TypeScript types for all songs', () => {
      const playlist = PlaylistDataProvider.loadInitialPlaylist();

      playlist.forEach((song: Song) => {
        const id: string = song.id;
        const title: string = song.title;
        const artist: string = song.artist;
        const cover: string = song.cover;
        const url: string = song.url;

        expect(typeof id).toBe('string');
        expect(typeof title).toBe('string');
        expect(typeof artist).toBe('string');
        expect(typeof cover).toBe('string');
        expect(typeof url).toBe('string');
      });
    });
  });
});
```

---

## TEST REQUIREMENTS

### Data Structure:
- [ ] Returns array of minimum 5 songs
- [ ] All songs have 5 required fields
- [ ] All IDs are unique
- [ ] All fields are non-empty strings

### Data Quality:
- [ ] Creative song titles (NOT "Song 1")
- [ ] Creative artist names (NOT "Artist 1")
- [ ] Valid URL formats
- [ ] Genre diversity (multiple artists)
- [ ] Professional, realistic data

### Deterministic:
- [ ] Same data every call
- [ ] Same order every call
- [ ] No randomness
- [ ] Pure function (no side effects)

### Integration:
- [ ] All songs pass AudioValidator
- [ ] Data works with usePlaylist
- [ ] Data can be rendered

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/data/playlist-data-provider.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Test Category | Test Cases | Description |
|--------------|------------|-------------|
| Basic Structure | 5 | Array return, minimum 5 songs, Song objects |
| Song IDs | 3 | Non-empty, unique, no duplicates |
| Song Titles | 4 | Non-empty, creative, unique, realistic |
| Song Artists | 3 | Non-empty, creative, diverse |
| Cover URLs | 3 | Non-empty, valid format, proper paths |
| Audio URLs | 4 | Non-empty, valid format, /songs/ directory, extensions |
| Data Quality | 3 | Professional, genre diversity, creative variety |
| Deterministic Behavior | 4 | Same data, same order, pure function |
| getDefaultPlaylist | 3 | Returns array, same as loadInitialPlaylist |
| fetchFromJSON (stub) | 4 | Exists, returns Promise, doesn't break |
| Integration Tests | 3 | AudioValidator, usePlaylist, Playlist component |
| Edge Cases | 3 | Multiple calls, immutability, no memory leaks |
| Type Safety | 2 | Song[] type, proper TypeScript types |
| **TOTAL** | **44** | **Comprehensive data provider testing** |

### 3. Expected Coverage Analysis
- **Line coverage:** 100% (all functions tested)
- **Branch coverage:** 100% (stub may have conditional)
- **Function coverage:** 100% (all 3 functions tested)
- **Data quality:** Verified (creative names, valid URLs, diversity)

### 4. Execution Instructions
```bash
# Run playlist data provider tests
npm test tests/data/playlist-data-provider.test.ts

# Run with coverage
npm test -- --coverage tests/data/playlist-data-provider.test.ts

# Run in watch mode
npm test -- --watch tests/data/playlist-data-provider.test.ts

# Run with verbose output
npm test -- --verbose tests/data/playlist-data-provider.test.ts
```

---

## SPECIAL CASES TO CONSIDER

### 1. Creative vs Generic Names
**GOOD:**
- "Midnight Dreams" by "Luna Eclipse"
- "Electric Pulse" by "The Neon Knights"
- "Whispers in the Wind" by "Sarah Chen"

**BAD (DON'T USE):**
- "Song 1" by "Artist 1"
- "Test Song" by "Test Artist"
- "Track 01" by "Unknown"

### 2. Genre Diversity
Include songs suggesting different genres:
- Rock: "Thunder Road", "Revolution"
- Pop: "Dance Tonight", "Summer Vibes"
- Electronic: "Digital Dreams", "Neon Lights"
- Jazz: "Blue Moon", "Midnight Jazz"
- Classical/Orchestral: "Symphony No. 5", "Moonlight Sonata"

### 3. URL Formats
All should be valid format:
```typescript
cover: '/covers/midnight-dreams.jpg'  // ✓ Good
cover: 'https://cdn.example.com/covers/song.jpg'  // ✓ Good
url: '/songs/midnight-dreams.mp3'  // ✓ Good
url: 'https://audio.example.com/tracks/song.wav'  // ✓ Good
```

### 4. Stub Implementation
fetchFromJSON can be implemented as:
```typescript
// Option 1: Return hardcoded data
async fetchFromJSON(): Promise<Song[]> {
  return Promise.resolve(this.loadInitialPlaylist());
}

// Option 2: Throw not implemented
async fetchFromJSON(): Promise<Song[]> {
  throw new Error('Not implemented - future enhancement');
}
```

### 5. Static Class vs Functions
Can be implemented as:
```typescript
// Option 1: Static class
export class PlaylistDataProvider {
  static loadInitialPlaylist(): Song[] { ... }
  static getDefaultPlaylist(): Song[] { ... }
}

// Option 2: Exported functions
export function loadInitialPlaylist(): Song[] { ... }
export function getDefaultPlaylist(): Song[] { ... }
```

---

## ADDITIONAL NOTES

- Tests should verify data quality (creative names, not generic)
- All songs must pass AudioValidator validation
- Function should be deterministic (same data every time)
- No side effects (pure function)
- Test immutability (returns new array reference)
- Verify minimum 5 songs, recommend 5-10
- Check for genre diversity (multiple artists)
- Verify all URLs are valid format
- Test integration with AudioValidator
- No mocking needed (pure data provider)
