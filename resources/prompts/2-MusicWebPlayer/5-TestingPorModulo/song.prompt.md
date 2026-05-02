# TESTING PROMPT #1: `src/types/song.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** Song Type Definition

**File path:** `src/types/song.ts`

**Test file path:** `tests/types/song.test.ts`

**Testing framework:** Jest, TS-Jest

**Target coverage:** 100% (type definitions should be fully validated)

---

## CODE TO TEST
```typescript
/**
 * @module Types/Song
 * @category Types
 * @description
 * This module defines the core data structure for songs in the Music Web Player application.
 * The Song interface represents the fundamental data model used throughout the application
 * for playlist management, playback, and UI rendering.
 */

/**
 * Represents a music track with metadata and file references.
 *
 * @interface Song
 * @property {string} id - Unique identifier for the song
 * @property {string} title - Display name of the song
 * @property {string} artist - Name of the artist or band
 * @property {string} cover - URL to the album/cover art image
 * @property {string} url - URL to the audio file (MP3, WAV, OGG, M4A)
 *
 * @example
 * const song: Song = {
 *   id: "1",
 *   title: "Bohemian Rhapsody",
 *   artist: "Queen",
 *   cover: "/covers/queen.jpg",
 *   url: "/songs/bohemian-rhapsody.mp3"
 * };
 */
export interface Song {
  /**
   * Unique identifier for the song.
   * @property {string} id
   * @example "550e8400-e29b-41d4-a716-446655440000" or "1"
   * @remarks
   * Used for React keys, playlist management, and deletion operations.
   * Must be unique across all songs in the playlist.
   */
  readonly id: string;

  /**
   * The name/title of the song.
   * @property {string} title
   * @example "Bohemian Rhapsody"
   * @remarks
   * Displayed in UI components (TrackInfo, Playlist).
   * Should be a non-empty string with max length of 200 characters.
   */
  readonly title: string;

  /**
   * The artist or band name who performed the song.
   * @property {string} artist
   * @example "Queen"
   * @remarks
   * Displayed in UI alongside the song title.
   * Should be a non-empty string with max length of 100 characters.
   */
  readonly artist: string;

  /**
   * URL to the album/song cover art image.
   * @property {string} cover
   * @example "https://example.com/covers/song-cover.jpg" or "/covers/default-cover.jpg"
   * @remarks
   * Displayed as album artwork in TrackInfo component.
   * Must be a valid URL (HTTP/HTTPS) or relative path pointing to an image file.
   * The application should handle broken/missing images with a placeholder.
   */
  readonly cover: string;

  /**
   * URL to the audio file.
   * @property {string} url
   * @example "https://example.com/audio/song.mp3" or "/songs/sample-song-1.mp3"
   * @remarks
   * Used as the source for HTML5 Audio element playback.
   * Must be a valid URL (HTTP/HTTPS or relative path) pointing to a supported audio format.
   * Must be accessible and not blocked by CORS.
   */
  readonly url: string;
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

### From Code Review #1:

**Component Objective:**
Core type definition for Song entities. Defines the structure of a song object with five required properties: id, title, artist, cover (image URL), and url (audio file URL). Used throughout the application as the fundamental data structure.

**Requirements:**
- **FR14-FR16:** Playlist management - Songs must have complete metadata
- **FR19:** Initial dataset - Each song must have all 5 properties
- **NFR5:** Static typing - Interface provides compile-time type safety
- **NFR11:** Standardized song data structure

**Interface Structure:**
```typescript
interface Song {
  id: string;        // Unique identifier
  title: string;     // Song title
  artist: string;    // Artist name
  cover: string;     // URL to cover image
  url: string;       // URL to audio file
}
```

**Validation Rules:**
- All 5 properties are **required** (not optional)
- All properties are of type `string`
- Properties should have `readonly` modifiers (recommended)
- Interface must be exported

**Usage Context:**
- Used by all components that display or manipulate songs
- Used by PlaylistDataProvider to define initial songs
- Used by AudioValidator to validate song objects
- Used by usePlaylist hook to manage song array
- Used by Player component to track current song

---

## USE CASE DIAGRAM

```
Song Type Definition
├── Provides structure for playlist songs
├── Used by components to display song info
├── Used by validators to check song validity
├── Used by data providers to create songs
└── Ensures type safety throughout app
```

---

## TASK

Generate a complete unit test suite for the **Song type definition** that validates:

### 1. TYPE STRUCTURE TESTS
- Verify interface exists and is properly exported
- Verify all 5 required properties exist
- Verify all properties are of type string
- Verify no optional properties exist
- Verify readonly modifiers (if present)

### 2. TYPE VALIDATION TESTS
Test that TypeScript correctly:
- **Accepts valid Song objects** with all 5 properties
- **Rejects objects missing any property** (compile-time check)
- **Rejects objects with wrong property types** (compile-time check)
- **Rejects objects with extra properties** (if strict)
- **Accepts objects with all properties as strings**

### 3. PROPERTY TESTS
For each property (id, title, artist, cover, url):
- Can be assigned string values
- Cannot be assigned non-string values (number, boolean, object, etc.)
- Cannot be undefined or null (required property)
- Can contain empty strings (validation happens elsewhere)
- Can contain special characters, Unicode, etc.

### 4. INTEGRATION TESTS
- Song objects work correctly with TypeScript's type system
- Song arrays (`Song[]`) work correctly
- Song objects can be used with JSON.stringify/parse
- Song objects work with object spread operator
- Song objects work with Object.assign

### 5. EDGE CASES
- Very long strings in each property (1000+ characters)
- Empty strings in all properties
- Special characters in strings (quotes, backslashes, Unicode)
- URLs with query parameters in cover/url
- IDs with various formats (UUID, timestamp, custom)

---

## STRUCTURE OF TESTS

Since this is a TypeScript **interface** (not runtime code), tests will focus on:
1. **Type checking** - Ensuring TypeScript compiler accepts/rejects correctly
2. **Runtime validation** - Testing that Song objects behave correctly
3. **Usage patterns** - Testing common operations with Song objects

```typescript
import { describe, it, expect } from '@jest/globals';
import { Song } from '@/types/song';

describe('Song Type Definition', () => {
  describe('Type Structure', () => {
    it('should accept valid Song object with all required properties', () => {
      // ARRANGE
      const validSong: Song = {
        id: '1',
        title: 'Test Song',
        artist: 'Test Artist',
        cover: '/covers/test.jpg',
        url: '/songs/test.mp3'
      };
      
      // ACT & ASSERT
      expect(validSong).toBeDefined();
      expect(validSong).toHaveProperty('id');
      expect(validSong).toHaveProperty('title');
      expect(validSong).toHaveProperty('artist');
      expect(validSong).toHaveProperty('cover');
      expect(validSong).toHaveProperty('url');
    });

    it('should have all properties as strings', () => {
      const song: Song = {
        id: 'test-id',
        title: 'Test Title',
        artist: 'Test Artist',
        cover: 'https://example.com/cover.jpg',
        url: 'https://example.com/song.mp3'
      };
      
      expect(typeof song.id).toBe('string');
      expect(typeof song.title).toBe('string');
      expect(typeof song.artist).toBe('string');
      expect(typeof song.cover).toBe('string');
      expect(typeof song.url).toBe('string');
    });
  });

  describe('Property Validation', () => {
    it('should accept empty strings in all properties', () => {
      const song: Song = {
        id: '',
        title: '',
        artist: '',
        cover: '',
        url: ''
      };
      
      expect(song).toBeDefined();
      expect(song.id).toBe('');
    });

    it('should accept special characters in string properties', () => {
      const song: Song = {
        id: 'id-with-special-chars-@#$%',
        title: 'Song with "quotes" and \'apostrophes\'',
        artist: 'Artist with émojis 🎵🎶',
        cover: 'https://example.com/cover.jpg?param=value&other=test',
        url: 'https://example.com/song.mp3#fragment'
      };
      
      expect(song.title).toContain('quotes');
      expect(song.artist).toContain('🎵');
    });

    it('should accept very long strings', () => {
      const longString = 'a'.repeat(1000);
      const song: Song = {
        id: longString,
        title: longString,
        artist: longString,
        cover: longString,
        url: longString
      };
      
      expect(song.title.length).toBe(1000);
    });
  });

  describe('Object Operations', () => {
    it('should work with JSON serialization', () => {
      const song: Song = {
        id: '1',
        title: 'Test Song',
        artist: 'Test Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const json = JSON.stringify(song);
      const parsed: Song = JSON.parse(json);
      
      expect(parsed).toEqual(song);
      expect(parsed.id).toBe('1');
    });

    it('should work with object spread operator', () => {
      const song: Song = {
        id: '1',
        title: 'Original',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const updated: Song = {
        ...song,
        title: 'Updated'
      };
      
      expect(updated.title).toBe('Updated');
      expect(updated.id).toBe('1');
    });

    it('should work with Object.assign', () => {
      const song: Song = {
        id: '1',
        title: 'Test',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const copy = Object.assign({}, song);
      
      expect(copy).toEqual(song);
      expect(copy).not.toBe(song); // Different reference
    });
  });

  describe('Array Operations', () => {
    it('should work in arrays', () => {
      const songs: Song[] = [
        {
          id: '1',
          title: 'Song 1',
          artist: 'Artist 1',
          cover: '/cover1.jpg',
          url: '/song1.mp3'
        },
        {
          id: '2',
          title: 'Song 2',
          artist: 'Artist 2',
          cover: '/cover2.jpg',
          url: '/song2.mp3'
        }
      ];
      
      expect(songs).toHaveLength(2);
      expect(songs[0].id).toBe('1');
      expect(songs[1].id).toBe('2');
    });

    it('should support array methods', () => {
      const songs: Song[] = [
        { id: '1', title: 'A', artist: 'X', cover: '/c1.jpg', url: '/s1.mp3' },
        { id: '2', title: 'B', artist: 'Y', cover: '/c2.jpg', url: '/s2.mp3' },
        { id: '3', title: 'C', artist: 'Z', cover: '/c3.jpg', url: '/s3.mp3' }
      ];
      
      const filtered = songs.filter(s => s.id !== '2');
      const mapped = songs.map(s => s.title);
      const found = songs.find(s => s.id === '2');
      
      expect(filtered).toHaveLength(2);
      expect(mapped).toEqual(['A', 'B', 'C']);
      expect(found?.title).toBe('B');
    });
  });

  describe('Edge Cases', () => {
    it('should handle Unicode characters', () => {
      const song: Song = {
        id: '1',
        title: '日本語のタイトル',
        artist: 'Артист',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      expect(song.title).toBe('日本語のタイトル');
      expect(song.artist).toBe('Артист');
    });

    it('should handle URLs with various formats', () => {
      const song: Song = {
        id: '1',
        title: 'Test',
        artist: 'Artist',
        cover: 'https://cdn.example.com/images/cover.jpg?w=300&h=300',
        url: 'https://audio.example.com/tracks/song.mp3?token=abc123&expires=999999'
      };
      
      expect(song.cover).toContain('?w=300');
      expect(song.url).toContain('token=abc123');
    });

    it('should handle relative URLs', () => {
      const song: Song = {
        id: '1',
        title: 'Test',
        artist: 'Artist',
        cover: '/covers/album-art.jpg',
        url: './songs/track-01.mp3'
      };
      
      expect(song.cover.startsWith('/')).toBe(true);
      expect(song.url.startsWith('./')).toBe(true);
    });

    it('should handle IDs with different formats', () => {
      const uuidSong: Song = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'UUID Song',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const timestampSong: Song = {
        id: Date.now().toString(),
        title: 'Timestamp Song',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const customSong: Song = {
        id: 'song-2024-001',
        title: 'Custom ID Song',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      expect(uuidSong.id).toMatch(/^[0-9a-f-]+$/);
      expect(timestampSong.id).toMatch(/^\d+$/);
      expect(customSong.id).toBe('song-2024-001');
    });
  });
});
```

---

## TEST REQUIREMENTS

### TypeScript-Specific:
- [ ] All test objects must satisfy the Song type
- [ ] TypeScript compiler must catch type violations at compile time
- [ ] Test that Song type is correctly exported
- [ ] Verify no implicit `any` types

### Runtime Validation:
- [ ] All 5 properties are present on Song objects
- [ ] All properties contain string values
- [ ] Song objects can be manipulated with standard JS operations
- [ ] Song objects serialize/deserialize correctly

### Edge Case Coverage:
- [ ] Empty strings in all properties
- [ ] Very long strings (1000+ chars)
- [ ] Special characters and Unicode
- [ ] URL formats (absolute, relative, with query params)
- [ ] Various ID formats (UUID, timestamp, custom)

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/types/song.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Test Category | Test Cases | Description |
|--------------|------------|-------------|
| Type Structure | 2 | Validates interface structure and property types |
| Property Validation | 3 | Tests string properties with various values |
| Object Operations | 3 | Tests JSON, spread, Object.assign |
| Array Operations | 2 | Tests Song arrays and array methods |
| Edge Cases | 4 | Tests Unicode, URLs, IDs |
| **TOTAL** | **14** | **Complete type validation** |

### 3. Expected Coverage Analysis
- **Line coverage:** N/A (type definition, no runtime code)
- **Type coverage:** 100% (all properties validated)
- **Usage patterns:** 100% (common operations tested)
- **Edge cases:** Comprehensive (special chars, long strings, Unicode, URLs)

### 4. Execution Instructions
```bash
# Run all type tests
npm test tests/types/song.test.ts

# Run with coverage
npm test -- --coverage tests/types/song.test.ts

# Run in watch mode
npm test -- --watch tests/types/song.test.ts
```

---

## SPECIAL CASES TO CONSIDER

### 1. Type-only Testing
Since Song is a TypeScript interface (no runtime code), tests focus on:
- Validating that objects conform to the type
- Testing common operations with Song objects
- Ensuring type safety is maintained

### 2. Compile-time vs Runtime
- **Compile-time:** TypeScript catches missing/wrong properties
- **Runtime:** Tests verify object behavior and operations

### 3. Real-world Usage Patterns
Test how Song objects are used in the actual application:
- Passed between components as props
- Stored in arrays (playlists)
- Serialized to localStorage
- Filtered, mapped, sorted

### 4. No Validation Logic
The Song type itself has **no validation logic** - that's handled by AudioValidator utility. Tests should not validate business rules (valid URLs, supported formats), only type structure.

---

## ADDITIONAL NOTES

- Tests must verify TypeScript type safety at compile time
- Focus on runtime behavior of Song objects
- No mocking needed (pure data structure)
- Tests should be fast and deterministic
- Cover all common usage patterns from the application
- Ensure Song objects work correctly with JavaScript operations
