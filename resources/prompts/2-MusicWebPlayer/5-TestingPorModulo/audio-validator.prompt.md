# TESTING PROMPT #6: `src/utils/audio-validator.ts`

## TESTING CONTEXT
**Project:** Music Web Player (PLAYER)

**Component under test:** AudioValidator Utility

**File path:** `src/utils/audio-validator.ts`

**Test file path:** `tests/utils/audio-validator.test.ts`

**Testing framework:** Jest, TS-Jest

**Target coverage:** 100% lines, 100% branches, 100% functions

---

## CODE TO TEST
```typescript
/**
 * @module Utilities/AudioValidator
 * @category Utilities
 * @description
 * This module provides validation functions for audio and song data in the Music Web Player.
 * It validates URLs, file formats, and complete song objects to ensure data integrity
 * before adding songs to the playlist.
 */

import { Song } from '@types/song';
import { ValidationResult } from '@types/validation';

// Constants for supported formats and validation
const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a'];
const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const MAX_URL_LENGTH = 2048;

// Error message templates
const ERROR_MESSAGES = {
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_URL: (type: string) => `${type} URL must be a valid URL`,
  UNSUPPORTED_AUDIO_FORMAT: 'Audio format must be MP3, WAV, OGG, or M4A',
  INVALID_IMAGE_FORMAT: 'Cover image should be JPG, PNG, GIF, WebP, or SVG',
};

/**
 * Utility class for validating audio and song data.
 * All methods are static and pure functions with no side effects.
 */
export class AudioValidator {
  /**
   * Validates that a URL is properly formatted for an audio file.
   * @param url - The audio file URL to validate
   * @returns true if URL format is valid, false otherwise
   * @example
   * AudioValidator.isValidAudioUrl("https://example.com/song.mp3") // true
   * AudioValidator.isValidAudioUrl("not-a-url") // false
   */
  public static isValidAudioUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    const trimmedUrl = url.trim();
    if (!trimmedUrl || trimmedUrl.length > MAX_URL_LENGTH) return false;

    // Check for HTTP/HTTPS URLs
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      try {
        new URL(trimmedUrl);
        return true;
      } catch {
        return false;
      }
    }

    // Check for relative paths
    return trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./');
  }

  /**
   * Validates that a URL is properly formatted for an image file.
   * @param url - The image URL to validate
   * @returns true if URL format is valid, false otherwise
   * @example
   * AudioValidator.isValidImageUrl("https://example.com/cover.jpg") // true
   * AudioValidator.isValidImageUrl("invalid") // false
   */
  public static isValidImageUrl(url: string): boolean {
    return this.isValidAudioUrl(url); // Same validation rules as audio URLs
  }

  /**
   * Checks if an audio file has a supported format based on file extension.
   * @param url - The audio file URL to check
   * @returns true if format is supported, false otherwise
   * @example
   * AudioValidator.isSupportedFormat("https://example.com/song.mp3") // true
   * AudioValidator.isSupportedFormat("https://example.com/song.flac") // false
   */
  public static isSupportedFormat(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    // Extract the file extension (case insensitive)
    const extensionMatch = url.split('?')[0].match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    if (!extensionMatch) return false;

    const extension = extensionMatch[1].toLowerCase();
    return SUPPORTED_AUDIO_FORMATS.includes(extension);
  }

  /**
   * Validates if an image URL has a supported format based on file extension.
   * @param url - The image URL to check
   * @returns true if format is supported, false otherwise
   * @example
   * AudioValidator.isValidImageFormat("https://example.com/cover.jpg") // true
   * AudioValidator.isValidImageFormat("https://example.com/cover.bmp") // false
   */
  public static isValidImageFormat(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    const extensionMatch = url.split('?')[0].match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    if (!extensionMatch) return false;

    const extension = extensionMatch[1].toLowerCase();
    return SUPPORTED_IMAGE_FORMATS.includes(extension);
  }

  /**
   * Performs comprehensive validation on a Song object.
   * @param song - The song object to validate
   * @returns ValidationResult with isValid boolean and errors array
   * @example
   * // Valid song
   * AudioValidator.validateSong({
   *   id: "1",
   *   title: "Great Song",
   *   artist: "Artist Name",
   *   cover: "https://example.com/cover.jpg",
   *   url: "https://example.com/song.mp3"
   * })
   * // Returns: { isValid: true, errors: [] }
   */
  public static validateSong(song: Song): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!song) {
      return {
        isValid: false,
        errors: [
          ERROR_MESSAGES.REQUIRED_FIELD('Title'),
          ERROR_MESSAGES.REQUIRED_FIELD('Artist'),
          ERROR_MESSAGES.INVALID_URL('Cover'),
          ERROR_MESSAGES.INVALID_URL('Audio'),
        ],
      };
    }

    // Validate title
    if (!song.title || typeof song.title !== 'string' || !song.title.trim()) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD('Title'));
    }

    // Validate artist
    if (!song.artist || typeof song.artist !== 'string' || !song.artist.trim()) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD('Artist'));
    }

    // Validate cover URL
    if (!song.cover || typeof song.cover !== 'string' || !song.cover.trim()) {
      errors.push(ERROR_MESSAGES.INVALID_URL('Cover'));
    } else if (!this.isValidImageUrl(song.cover)) {
      errors.push(ERROR_MESSAGES.INVALID_URL('Cover'));
    } else if (!this.isValidImageFormat(song.cover)) {
      errors.push(ERROR_MESSAGES.INVALID_IMAGE_FORMAT);
    }

    // Validate audio URL
    if (!song.url || typeof song.url !== 'string' || !song.url.trim()) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD('Audio URL'));
    } else if (!this.isValidAudioUrl(song.url)) {
      errors.push(ERROR_MESSAGES.INVALID_URL('Audio'));
    } else if (!this.isSupportedFormat(song.url)) {
      errors.push(ERROR_MESSAGES.UNSUPPORTED_AUDIO_FORMAT);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
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

### From Code Review #6:

**Component Objective:**
Validate song data before adding to playlist. Provides pure validation functions to check song objects, URL formats, image URLs, and supported audio formats. Accumulates ALL validation errors (not fail-fast) to provide comprehensive feedback. Returns ValidationResult with isValid flag and errors array.

**Requirements:**
- **FR15:** Add songs to local playlist with validation
- **FR18:** Real-time playlist update after validation
- **NFR5:** Static typing with TypeScript
- **NFR7:** Pure functions without side effects

**Functions to Test:**

1. **validateSong(song: Song): ValidationResult**
   - Main validation function - validates entire Song object
   - Accumulates ALL errors before returning (not fail-fast)
   - Checks: title required, artist required, valid cover URL, valid audio URL, supported audio format
   - Returns: `{ isValid: true, errors: [] }` or `{ isValid: false, errors: ["...", "..."] }`
   - Pure function, no side effects

2. **isValidAudioUrl(url: string): boolean**
   - Validates audio URL format
   - Uses URL constructor (safe, no ReDoS)
   - Accepts: HTTP/HTTPS URLs or relative paths
   - Checks: supported audio format (.mp3, .wav, .ogg, .m4a)
   - Handles: query parameters, fragments, case-insensitive extensions
   - Returns: true if valid, false otherwise

3. **isValidImageUrl(url: string): boolean**
   - Validates image URL format
   - Uses URL constructor (safe, no ReDoS)
   - Accepts: HTTP/HTTPS URLs or relative paths
   - No format checking (any extension accepted)
   - Returns: true if valid, false otherwise

4. **isSupportedFormat(url: string): boolean**
   - Checks if audio format is supported
   - Supported: .mp3, .wav, .ogg, .m4a
   - Case-insensitive checking
   - Handles: query parameters, fragments
   - Returns: true if supported, false otherwise

**Validation Rules:**

| Field | Validation | Error Message |
|-------|-----------|---------------|
| title | Required, not empty after trim | "Title is required" |
| artist | Required, not empty after trim | "Artist is required" |
| cover | Valid URL format | "Cover URL must be a valid URL" |
| url | Valid URL format | "Audio URL must be a valid URL" |
| url | Supported format (.mp3, .wav, .ogg, .m4a) | "Audio format must be MP3, WAV, OGG, or M4A" |

**Supported Audio Formats:**
- .mp3
- .wav
- .ogg
- .m4a

**URL Validation:**
- HTTP/HTTPS URLs: `https://example.com/song.mp3`
- Relative paths: `/songs/song.mp3` or `./songs/song.mp3`
- With query params: `https://example.com/song.mp3?token=abc`
- With fragments: `https://example.com/song.mp3#start`

**Critical Requirements:**
- validateSong accumulates ALL errors (not fail-fast)
- Exact error messages from requirements table
- URL constructor for validation (no ReDoS vulnerabilities)
- Case-insensitive format checking
- Handles query parameters and fragments
- Trims whitespace before checking required fields
- All functions are pure (no side effects)

**Usage Context:**
- Used by AddSongForm before submitting new song
- Used to ensure playlist contains only valid songs
- Prevents invalid data from entering the system
- Provides clear feedback for user corrections

---

## USE CASE DIAGRAM

```
AudioValidator Utility
├── validateSong(song)
│   ├── Checks title (required, not empty)
│   ├── Checks artist (required, not empty)
│   ├── Calls isValidImageUrl(cover)
│   ├── Calls isValidAudioUrl(url)
│   ├── Accumulates all errors
│   └── Returns ValidationResult
│
├── isValidAudioUrl(url)
│   ├── Validates URL format
│   └── Checks isSupportedFormat(url)
│
├── isValidImageUrl(url)
│   └── Validates URL format only
│
└── isSupportedFormat(url)
    └── Checks extension (.mp3, .wav, .ogg, .m4a)
```

---

## TASK

Generate a complete unit test suite for the **AudioValidator utility** that covers:

### 1. VALIDATESONG - VALID SONGS
Test successful validation:
- Complete valid song with all fields
- Song with HTTP URLs
- Song with relative URLs
- Song with query parameters in URLs
- Song with fragments in URLs
- Songs with all supported formats (.mp3, .wav, .ogg, .m4a)
- Verify `{ isValid: true, errors: [] }` returned

### 2. VALIDATESONG - TITLE VALIDATION
Test title field:
- Missing title (empty string) → "Title is required"
- Whitespace-only title ("   ") → "Title is required" (after trim)
- Valid title (normal string)
- Title with special characters
- Very long title (1000+ chars)

### 3. VALIDATESONG - ARTIST VALIDATION
Test artist field:
- Missing artist (empty string) → "Artist is required"
- Whitespace-only artist ("   ") → "Artist is required" (after trim)
- Valid artist (normal string)
- Artist with special characters
- Very long artist name

### 4. VALIDATESONG - COVER URL VALIDATION
Test cover URL field:
- Valid HTTP URL
- Valid HTTPS URL
- Valid relative path
- Invalid URL (no protocol, malformed) → "Cover URL must be a valid URL"
- Empty string → "Cover URL must be a valid URL"

### 5. VALIDATESONG - AUDIO URL VALIDATION
Test audio URL field:
- Valid HTTP URL with .mp3
- Valid HTTPS URL with .wav
- Valid relative path with .ogg
- Valid URL with query params
- Valid URL with fragment
- Invalid URL → "Audio URL must be a valid URL"
- Valid URL but unsupported format → "Audio format must be MP3, WAV, OGG, or M4A"

### 6. VALIDATESONG - ERROR ACCUMULATION
Test that ALL errors are collected:
- Song with 2 errors (missing title + artist) → 2 errors in array
- Song with 3 errors (missing title, artist, invalid URL) → 3 errors
- Song with ALL 5 possible errors → 5 errors in array
- Verify errors array order
- Verify isValid is false when errors exist

### 7. ISVALIDAUDIOURL - VALID URLS
Test valid audio URLs:
- HTTP URL with .mp3
- HTTPS URL with .wav
- Relative path with .ogg
- URL with .m4a extension
- URL with query parameters: `/song.mp3?token=abc`
- URL with fragment: `/song.mp3#start`
- URL with both: `/song.mp3?token=abc#start`

### 8. ISVALIDAUDIOURL - INVALID URLS
Test invalid audio URLs:
- Invalid URL format (malformed)
- Empty string
- Valid URL but unsupported format (.flac, .aac, .wma)
- Valid URL with no extension
- URL with wrong protocol (ftp://)

### 9. ISVALIDIMAGEURL - VALID URLS
Test valid image URLs:
- HTTP URL
- HTTPS URL
- Relative path: `/covers/image.jpg`
- Relative path: `./covers/image.png`
- URL with query parameters
- URL with any extension (no format checking)

### 10. ISVALIDIMAGEURL - INVALID URLS
Test invalid image URLs:
- Invalid URL format
- Empty string
- Malformed URL
- URL with spaces (invalid)

### 11. ISSUPPORTEDFORMAT - SUPPORTED FORMATS
Test supported audio formats:
- .mp3 extension → true
- .wav extension → true
- .ogg extension → true
- .m4a extension → true
- Case variations: .MP3, .Wav, .OGG, .M4A → all true
- With query params: `/song.mp3?token=123` → true
- With fragment: `/song.mp3#start` → true

### 12. ISSUPPORTEDFORMAT - UNSUPPORTED FORMATS
Test unsupported audio formats:
- .flac → false
- .aac → false
- .wma → false
- .mp4 → false (video)
- No extension → false
- Invalid URL → false

### 13. EDGE CASES - URL VALIDATION
Test URL edge cases:
- URL with multiple dots: `/path/to/song.backup.mp3` → valid
- URL with uppercase extension: `/song.MP3` → valid (case-insensitive)
- URL with encoded characters: `/song%20name.mp3` → valid
- URL with international characters: `/音楽.mp3` → valid or handled
- Very long URL (2000+ chars)
- URL with special characters in path

### 14. EDGE CASES - WHITESPACE HANDLING
Test whitespace trimming:
- Title: "  Valid Title  " → valid (trimmed)
- Title: "   " → invalid (empty after trim)
- Artist: "  Valid Artist  " → valid (trimmed)
- URL: " https://example.com/song.mp3 " → should be handled

### 15. INTEGRATION TESTS
Test function interactions:
- validateSong calls isValidImageUrl internally
- validateSong calls isValidAudioUrl internally
- isValidAudioUrl calls isSupportedFormat internally
- Verify complete validation flow

### 16. PURITY TESTS
Test pure function behavior:
- Same input always produces same output
- No side effects (no console logs)
- No mutations of input object
- Functions are deterministic

---

## STRUCTURE OF TESTS

```typescript
import { describe, it, expect } from '@jest/globals';
import { 
  validateSong, 
  isValidAudioUrl, 
  isValidImageUrl, 
  isSupportedFormat 
} from '@/utils/audio-validator';
import { Song } from '@/types/song';
import { ValidationResult } from '@/types/validation';

describe('AudioValidator Utility', () => {
  describe('validateSong', () => {
    describe('Valid Songs', () => {
      it('should return valid result for complete valid song', () => {
        // ARRANGE
        const validSong: Song = {
          id: 'song-1',
          title: 'Test Song',
          artist: 'Test Artist',
          cover: 'https://example.com/cover.jpg',
          url: 'https://example.com/song.mp3'
        };

        // ACT
        const result: ValidationResult = validateSong(validSong);

        // ASSERT
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate song with HTTP URLs', () => {
        const song: Song = {
          id: '1',
          title: 'Song',
          artist: 'Artist',
          cover: 'http://example.com/cover.jpg',
          url: 'http://example.com/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should validate song with relative URLs', () => {
        const song: Song = {
          id: '1',
          title: 'Song',
          artist: 'Artist',
          cover: '/covers/cover.jpg',
          url: '/songs/song.wav'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should validate song with query parameters', () => {
        const song: Song = {
          id: '1',
          title: 'Song',
          artist: 'Artist',
          cover: 'https://example.com/cover.jpg?w=300&h=300',
          url: 'https://example.com/song.mp3?token=abc123'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should validate songs with all supported audio formats', () => {
        const formats = ['mp3', 'wav', 'ogg', 'm4a'];

        formats.forEach(format => {
          const song: Song = {
            id: '1',
            title: 'Song',
            artist: 'Artist',
            cover: '/cover.jpg',
            url: `/song.${format}`
          };

          const result = validateSong(song);

          expect(result.isValid).toBe(true);
        });
      });
    });

    describe('Title Validation', () => {
      it('should reject song with empty title', () => {
        const song: Song = {
          id: '1',
          title: '',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should reject song with whitespace-only title', () => {
        const song: Song = {
          id: '1',
          title: '   ',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should accept title with leading/trailing whitespace (after trim)', () => {
        const song: Song = {
          id: '1',
          title: '  Valid Title  ',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should accept title with special characters', () => {
        const song: Song = {
          id: '1',
          title: 'Song "Title" with \'quotes\' & symbols!',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should accept very long title', () => {
        const song: Song = {
          id: '1',
          title: 'a'.repeat(1000),
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });
    });

    describe('Artist Validation', () => {
      it('should reject song with empty artist', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: '',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Artist is required');
      });

      it('should reject song with whitespace-only artist', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: '   ',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Artist is required');
      });

      it('should accept artist with leading/trailing whitespace (after trim)', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: '  Valid Artist  ',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });
    });

    describe('Cover URL Validation', () => {
      it('should accept valid HTTPS cover URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: 'https://example.com/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should accept valid relative cover URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/covers/album.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should reject invalid cover URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: 'not-a-valid-url',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Cover URL must be a valid URL');
      });

      it('should reject empty cover URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Cover URL must be a valid URL');
      });
    });

    describe('Audio URL Validation', () => {
      it('should accept valid audio URL with supported format', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: 'https://example.com/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should reject invalid audio URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: 'not-a-valid-url'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Audio URL must be a valid URL');
      });

      it('should reject valid URL with unsupported format', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: 'https://example.com/song.flac'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Audio format must be MP3, WAV, OGG, or M4A');
      });

      it('should accept audio URL with query parameters', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3?token=abc&expires=999'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });
    });

    describe('Error Accumulation', () => {
      it('should accumulate multiple errors (not fail-fast)', () => {
        const song: Song = {
          id: '1',
          title: '',
          artist: '',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContain('Title is required');
        expect(result.errors).toContain('Artist is required');
      });

      it('should accumulate all possible errors', () => {
        const song: Song = {
          id: '1',
          title: '',
          artist: '',
          cover: 'invalid-url',
          url: 'invalid-url'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(4);
        expect(result.errors).toContain('Title is required');
        expect(result.errors).toContain('Artist is required');
        expect(result.errors).toContain('Cover URL must be a valid URL');
        expect(result.errors).toContain('Audio URL must be a valid URL');
      });

      it('should return errors in consistent order', () => {
        const song1: Song = {
          id: '1',
          title: '',
          artist: '',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const song2: Song = {
          id: '2',
          title: '',
          artist: '',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result1 = validateSong(song1);
        const result2 = validateSong(song2);

        expect(result1.errors).toEqual(result2.errors);
      });
    });
  });

  describe('isValidAudioUrl', () => {
    describe('Valid Audio URLs', () => {
      it('should accept HTTP URL with .mp3', () => {
        expect(isValidAudioUrl('http://example.com/song.mp3')).toBe(true);
      });

      it('should accept HTTPS URL with .wav', () => {
        expect(isValidAudioUrl('https://example.com/song.wav')).toBe(true);
      });

      it('should accept relative path with .ogg', () => {
        expect(isValidAudioUrl('/songs/track.ogg')).toBe(true);
      });

      it('should accept URL with .m4a extension', () => {
        expect(isValidAudioUrl('https://example.com/audio.m4a')).toBe(true);
      });

      it('should accept URL with query parameters', () => {
        expect(isValidAudioUrl('/song.mp3?token=abc123')).toBe(true);
      });

      it('should accept URL with fragment', () => {
        expect(isValidAudioUrl('/song.mp3#start')).toBe(true);
      });

      it('should accept URL with query and fragment', () => {
        expect(isValidAudioUrl('/song.mp3?token=abc#start')).toBe(true);
      });

      it('should accept case-insensitive extensions', () => {
        expect(isValidAudioUrl('/song.MP3')).toBe(true);
        expect(isValidAudioUrl('/song.Wav')).toBe(true);
        expect(isValidAudioUrl('/song.OGG')).toBe(true);
      });
    });

    describe('Invalid Audio URLs', () => {
      it('should reject invalid URL format', () => {
        expect(isValidAudioUrl('not-a-url')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidAudioUrl('')).toBe(false);
      });

      it('should reject valid URL with unsupported format', () => {
        expect(isValidAudioUrl('https://example.com/song.flac')).toBe(false);
        expect(isValidAudioUrl('https://example.com/song.aac')).toBe(false);
        expect(isValidAudioUrl('https://example.com/song.wma')).toBe(false);
      });

      it('should reject URL with no extension', () => {
        expect(isValidAudioUrl('https://example.com/song')).toBe(false);
      });

      it('should reject URL with wrong protocol', () => {
        expect(isValidAudioUrl('ftp://example.com/song.mp3')).toBe(false);
      });
    });
  });

  describe('isValidImageUrl', () => {
    describe('Valid Image URLs', () => {
      it('should accept HTTP URL', () => {
        expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true);
      });

      it('should accept HTTPS URL', () => {
        expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
      });

      it('should accept relative path', () => {
        expect(isValidImageUrl('/covers/album.jpg')).toBe(true);
        expect(isValidImageUrl('./covers/album.png')).toBe(true);
      });

      it('should accept URL with query parameters', () => {
        expect(isValidImageUrl('https://example.com/image.jpg?w=300&h=300')).toBe(true);
      });

      it('should accept URL with any extension (no format checking)', () => {
        expect(isValidImageUrl('https://example.com/image.webp')).toBe(true);
        expect(isValidImageUrl('https://example.com/file.pdf')).toBe(true);
      });
    });

    describe('Invalid Image URLs', () => {
      it('should reject invalid URL format', () => {
        expect(isValidImageUrl('not-a-url')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidImageUrl('')).toBe(false);
      });

      it('should reject malformed URL', () => {
        expect(isValidImageUrl('ht!tp://invalid')).toBe(false);
      });
    });
  });

  describe('isSupportedFormat', () => {
    describe('Supported Formats', () => {
      it('should return true for .mp3 extension', () => {
        expect(isSupportedFormat('/song.mp3')).toBe(true);
      });

      it('should return true for .wav extension', () => {
        expect(isSupportedFormat('/song.wav')).toBe(true);
      });

      it('should return true for .ogg extension', () => {
        expect(isSupportedFormat('/song.ogg')).toBe(true);
      });

      it('should return true for .m4a extension', () => {
        expect(isSupportedFormat('/song.m4a')).toBe(true);
      });

      it('should be case-insensitive', () => {
        expect(isSupportedFormat('/song.MP3')).toBe(true);
        expect(isSupportedFormat('/song.Wav')).toBe(true);
        expect(isSupportedFormat('/song.OGG')).toBe(true);
        expect(isSupportedFormat('/song.M4A')).toBe(true);
      });

      it('should handle URLs with query parameters', () => {
        expect(isSupportedFormat('/song.mp3?token=abc123')).toBe(true);
      });

      it('should handle URLs with fragment', () => {
        expect(isSupportedFormat('/song.mp3#start')).toBe(true);
      });
    });

    describe('Unsupported Formats', () => {
      it('should return false for .flac extension', () => {
        expect(isSupportedFormat('/song.flac')).toBe(false);
      });

      it('should return false for .aac extension', () => {
        expect(isSupportedFormat('/song.aac')).toBe(false);
      });

      it('should return false for .wma extension', () => {
        expect(isSupportedFormat('/song.wma')).toBe(false);
      });

      it('should return false for .mp4 extension (video)', () => {
        expect(isSupportedFormat('/video.mp4')).toBe(false);
      });

      it('should return false for no extension', () => {
        expect(isSupportedFormat('/song')).toBe(false);
      });

      it('should return false for invalid URL', () => {
        expect(isSupportedFormat('invalid')).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    describe('URL with Multiple Dots', () => {
      it('should handle filename with multiple dots', () => {
        expect(isSupportedFormat('/path/song.backup.mp3')).toBe(true);
      });
    });

    describe('URL with Encoded Characters', () => {
      it('should handle URL-encoded characters', () => {
        expect(isValidAudioUrl('/song%20name.mp3')).toBe(true);
      });
    });

    describe('Very Long URLs', () => {
      it('should handle very long URLs', () => {
        const longPath = 'a'.repeat(1000);
        const url = `https://example.com/${longPath}/song.mp3`;
        
        expect(isValidAudioUrl(url)).toBe(true);
      });
    });

    describe('Whitespace Handling', () => {
      it('should trim whitespace from title and artist', () => {
        const song: Song = {
          id: '1',
          title: '  Valid Title  ',
          artist: '  Valid Artist  ',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(true);
      });

      it('should reject whitespace-only fields after trim', () => {
        const song: Song = {
          id: '1',
          title: '   ',
          artist: '   ',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };

        const result = validateSong(song);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
        expect(result.errors).toContain('Artist is required');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should use isValidImageUrl internally in validateSong', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: 'invalid-url',
        url: '/song.mp3'
      };

      const result = validateSong(song);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cover URL must be a valid URL');
    });

    it('should use isValidAudioUrl internally in validateSong', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: 'invalid-url'
      };

      const result = validateSong(song);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Audio URL must be a valid URL');
    });

    it('should use isSupportedFormat internally via isValidAudioUrl', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: 'https://example.com/song.flac'
      };

      const result = validateSong(song);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Audio format must be MP3, WAV, OGG, or M4A');
    });
  });

  describe('Purity Tests', () => {
    it('should return same result for same input (deterministic)', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };

      const result1 = validateSong(song);
      const result2 = validateSong(song);
      const result3 = validateSong(song);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should not mutate input object', () => {
      const song: Song = {
        id: '1',
        title: 'Original Title',
        artist: 'Original Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };

      const originalSong = { ...song };

      validateSong(song);

      expect(song).toEqual(originalSong);
      expect(song.title).toBe('Original Title');
    });

    it('should have no side effects', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      validateSong({
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      });

      isValidAudioUrl('/song.mp3');
      isValidImageUrl('/cover.jpg');
      isSupportedFormat('/song.mp3');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Type Safety', () => {
    it('should return ValidationResult type from validateSong', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };

      const result: ValidationResult = validateSong(song);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should accept Song type for validateSong', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };

      expect(() => validateSong(song)).not.toThrow();
    });
  });
});
```

---

## TEST REQUIREMENTS

### Validation Coverage:
- [ ] All 5 validation rules tested (title, artist, cover URL, audio URL, format)
- [ ] Error accumulation verified (all errors collected)
- [ ] Exact error messages from requirements table
- [ ] Whitespace trimming for title and artist

### URL Validation:
- [ ] HTTP/HTTPS URLs accepted
- [ ] Relative paths accepted
- [ ] Query parameters handled
- [ ] Fragments handled
- [ ] Invalid URLs rejected

### Format Validation:
- [ ] All 4 supported formats (.mp3, .wav, .ogg, .m4a) accepted
- [ ] Unsupported formats rejected
- [ ] Case-insensitive checking
- [ ] Query parameters don't affect format detection

### Edge Cases:
- [ ] Empty strings handled
- [ ] Whitespace-only strings handled
- [ ] Very long strings handled
- [ ] Special characters handled
- [ ] URL-encoded characters handled

### Purity:
- [ ] Same input → same output (deterministic)
- [ ] No mutations of input
- [ ] No side effects (no console logs)

---

## DELIVERABLES

### 1. Complete Test Suite
```typescript
// tests/utils/audio-validator.test.ts
[Generated test code following the structure above]
```

### 2. Coverage Matrix

| Function | Normal Cases | Edge Cases | Integration | Purity | Total Tests |
|----------|--------------|------------|-------------|--------|-------------|
| validateSong | 6 | 9 | 3 | 2 | 20 |
| isValidAudioUrl | 8 | 5 | - | - | 13 |
| isValidImageUrl | 5 | 3 | - | - | 8 |
| isSupportedFormat | 7 | 6 | - | - | 13 |
| Edge Cases | - | 4 | - | - | 4 |
| Type Safety | 2 | - | - | - | 2 |
| **TOTAL** | **28** | **27** | **3** | **2** | **60** |

### 3. Expected Coverage Analysis
- **Line coverage:** 100% (all functions fully tested)
- **Branch coverage:** 100% (all validation rules, all error paths)
- **Function coverage:** 100% (all 4 functions tested)
- **Edge cases:** Comprehensive (empty, whitespace, special chars, long URLs)

### 4. Execution Instructions
```bash
# Run audio validator tests
npm test tests/utils/audio-validator.test.ts

# Run with coverage
npm test -- --coverage tests/utils/audio-validator.test.ts

# Run in watch mode
npm test -- --watch tests/utils/audio-validator.test.ts

# Run with verbose output
npm test -- --verbose tests/utils/audio-validator.test.ts
```

---

## SPECIAL CASES TO CONSIDER

### 1. Error Accumulation (NOT Fail-Fast)
validateSong must collect ALL errors:
```typescript
// Wrong: Fail-fast (stop at first error)
if (!title) return { isValid: false, errors: ['Title required'] };

// Correct: Accumulate all errors
const errors: string[] = [];
if (!title) errors.push('Title required');
if (!artist) errors.push('Artist required');
// ... collect all errors ...
return { isValid: errors.length === 0, errors };
```

### 2. Exact Error Messages
Must match requirements table exactly:
- "Title is required" (not "Title cannot be empty")
- "Artist is required" (not "Artist field is required")
- "Cover URL must be a valid URL"
- "Audio URL must be a valid URL"
- "Audio format must be MP3, WAV, OGG, or M4A"

### 3. URL Constructor for Safety
Use URL constructor (no regex ReDoS):
```typescript
try {
  new URL(url, 'http://localhost'); // Base for relative URLs
  return true;
} catch {
  return false;
}
```

### 4. Case-Insensitive Format Checking
```typescript
url.toLowerCase().endsWith('.mp3')
// Handles .mp3, .MP3, .Mp3, etc.
```

### 5. Query Parameters and Fragments
```typescript
'/song.mp3?token=abc#start' // Should detect .mp3 format
// Extract extension before query/fragment
```

---

## ADDITIONAL NOTES

- All functions must be pure (no side effects, no mutations)
- URL constructor is safer than regex (no ReDoS vulnerabilities)
- Trim whitespace before checking required fields
- Case-insensitive format checking
- Error messages must be exact (copy from requirements)
- Test all 4 supported formats (.mp3, .wav, .ogg, .m4a)
- Test error accumulation thoroughly (multiple errors at once)
- Verify ValidationResult structure matches type definition
- No mocking needed (pure functions)
- Tests should be deterministic
