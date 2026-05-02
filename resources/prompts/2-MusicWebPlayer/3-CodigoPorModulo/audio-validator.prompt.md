Perfect! Let's move to **Module #6: `src/utils/audio-validator.ts`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Utilities Layer - Audio Validation Functions

---

# PROJECT FILE STRUCTURE REMINDER

```
2-MusicWebPlayer/
├── src/
│   ├── types/
│   │   ├── song.ts                    ← COMPLETED
│   │   ├── playback-error.ts          ← COMPLETED
│   │   └── validation.ts              ← COMPLETED
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
│   ├── utils/
│   │   ├── time-formatter.ts          ← COMPLETED
│   │   ├── error-handler.ts           ← COMPLETED
│   │   └── audio-validator.ts         ← CURRENT MODULE
│   ├── data/
│   │   └── playlist-data-provider.ts
│   └── styles/
│       └── main.css
├── index.html
├── package.json
├── tsconfig.json
└── ... (config files)
```

---

# INPUT ARTIFACTS

## 1. Requirements Specification

**Relevant Functional Requirements:**
- **FR15:** Add songs to local playlist - user can add new songs by providing title, artist, cover URL, and audio URL
- **FR16:** Remove songs from playlist
- **FR18:** Real-time playlist update - when adding or removing songs, the list displayed updates immediately

**Relevant Non-Functional Requirements:**
- **NFR5:** Static typing with TypeScript in all components - all functions have explicit TypeScript types
- **NFR9:** Proper error handling without application blocking
- **NFR11:** Standardized song data structure - each song must contain: `title` (string), `artist` (string), `cover` (string URL), `url` (string URL)
- **NFR13:** Prevention of blocks from missing or corrupt files - the application detects invalid audio files and handles the error without completely interrupting the experience

**Validation Requirements (from Section 13.1):**

| Validation Check | Rule | Error Message |
|------------------|------|---------------|
| Audio URL format | Must be valid HTTP/HTTPS URL or relative path | "Audio URL must be a valid URL" |
| Audio file format | Must end with .mp3, .wav, .ogg, or .m4a | "Audio format must be MP3, WAV, OGG, or M4A" |
| Cover URL format | Must be valid HTTP/HTTPS URL or relative path | "Cover URL must be a valid URL" |
| Cover image format | Should end with .jpg, .jpeg, .png, .gif, .webp | "Cover image should be JPG, PNG, GIF, or WebP" |
| Required fields | Title, artist, cover, and url must not be empty | "[Field] is required" |

**Supported Audio Formats:**
- MP3 (.mp3) - Primary format, universally supported
- WAV (.wav) - Uncompressed audio
- OGG Vorbis (.ogg) - Open format
- M4A (.m4a) - AAC in MP4 container
- Note: Browser support varies, MP3 is most reliable

**Supported Image Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg) - Optional

## 2. Class Diagram (Relevant Section)

```typescript
class AudioValidator {
    <<utility>>
    +isValidAudioUrl(url: string): boolean
    +isValidImageUrl(url: string): boolean
    +isSupportedFormat(url: string): boolean
    +validateSong(song: Song): ValidationResult
}

class Song {
    <<interface>>
    +id: string
    +title: string
    +artist: string
    +cover: string
    +url: string
}

class ValidationResult {
    <<interface>>
    +isValid: boolean
    +errors: string[]
}
```

**Relationships:**
- Used by: `AddSongForm` component (validates form input before submission)
- Used by: `usePlaylist` hook (validates before adding song to playlist)
- Uses: `Song` interface (from types/song.ts)
- Uses: `ValidationResult` interface (from types/validation.ts)

## 3. Use Case Diagram (Relevant Use Cases)

- **Add Song to Playlist:** User submits form → System validates song data → Accept or reject with errors
- **Validate Song Data:** System checks all fields and formats before adding
- **Display Validation Errors:** System shows specific errors for each invalid field

---

# SPECIFIC TASK

Implement the utility module: **`src/utils/audio-validator.ts`**

## Responsibilities:

1. **Validate audio file URLs** for correct format and protocol
2. **Validate image URLs** for cover art
3. **Check audio file format support** (file extension validation)
4. **Validate complete Song objects** with all required fields
5. **Return detailed validation results** with specific error messages for each issue

## Methods to implement:

### 1. **isValidAudioUrl(url: string): boolean**

Validates that a URL is properly formatted for an audio file.

- **Description:** Checks if a URL is valid (HTTP/HTTPS or relative path) and could potentially point to an audio resource
- **Parameters:**
  - `url` (string): The audio file URL to validate
- **Returns:** 
  - `boolean`: `true` if URL format is valid, `false` otherwise
- **Examples:**
  - `isValidAudioUrl("https://example.com/song.mp3")` → `true`
  - `isValidAudioUrl("http://example.com/audio/track.wav")` → `true`
  - `isValidAudioUrl("/songs/local-file.mp3")` → `true`
  - `isValidAudioUrl("./audio/song.ogg")` → `true`
  - `isValidAudioUrl("not-a-url")` → `false`
  - `isValidAudioUrl("")` → `false`
  - `isValidAudioUrl("ftp://example.com/song.mp3")` → `false` (only HTTP/HTTPS)
- **Preconditions:** 
  - url parameter should be a string (handle null/undefined)
  - Should trim whitespace before validation
- **Postconditions:** 
  - Returns boolean (never throws)
  - Does not perform network requests (only format validation)
- **Validation rules:**
  - Must not be empty or only whitespace
  - Must start with `http://`, `https://`, `/`, or `./`
  - Should be a reasonable length (< 2048 characters)
  - Optional: Check for valid URL structure using URL constructor or regex

**Implementation considerations:**
- Use try-catch with `new URL(url, 'https://example.com')` for absolute URLs
- For relative paths, check if starts with `/` or `./`
- Trim whitespace before validation
- Return false for empty strings
- Don't check file existence (no network calls)

### 2. **isValidImageUrl(url: string): boolean**

Validates that a URL is properly formatted for an image file.

- **Description:** Checks if a URL is valid (HTTP/HTTPS or relative path) and could potentially point to an image resource
- **Parameters:**
  - `url` (string): The image URL to validate
- **Returns:** 
  - `boolean`: `true` if URL format is valid, `false` otherwise
- **Examples:**
  - `isValidImageUrl("https://example.com/cover.jpg")` → `true`
  - `isValidImageUrl("http://example.com/images/art.png")` → `true`
  - `isValidImageUrl("/covers/album.webp")` → `true`
  - `isValidImageUrl("./images/default.png")` → `true`
  - `isValidImageUrl("invalid")` → `false`
  - `isValidImageUrl("")` → `false`
- **Preconditions:** 
  - url parameter should be a string
  - Should trim whitespace before validation
- **Postconditions:** 
  - Returns boolean (never throws)
  - Does not perform network requests
- **Validation rules:**
  - Same as isValidAudioUrl (HTTP/HTTPS or relative path)
  - Must not be empty or only whitespace
  - Reasonable length check

**Implementation considerations:**
- Similar logic to isValidAudioUrl
- Could extract common URL validation logic to private helper
- Does not validate image format (that's checked separately)

### 3. **isSupportedFormat(url: string): boolean**

Checks if an audio file has a supported format based on file extension.

- **Description:** Validates that an audio URL ends with a supported file extension (.mp3, .wav, .ogg, .m4a)
- **Parameters:**
  - `url` (string): The audio file URL to check
- **Returns:** 
  - `boolean`: `true` if format is supported, `false` otherwise
- **Examples:**
  - `isSupportedFormat("https://example.com/song.mp3")` → `true`
  - `isSupportedFormat("/audio/track.MP3")` → `true` (case insensitive)
  - `isSupportedFormat("./songs/music.wav")` → `true`
  - `isSupportedFormat("https://example.com/audio.ogg")` → `true`
  - `isSupportedFormat("https://example.com/file.m4a")` → `true`
  - `isSupportedFormat("https://example.com/song.flac")` → `false`
  - `isSupportedFormat("https://example.com/audio")` → `false` (no extension)
  - `isSupportedFormat("")` → `false`
- **Preconditions:** 
  - url parameter should be a string
  - Should handle query parameters (e.g., "song.mp3?token=abc")
  - Case insensitive check
- **Postconditions:** 
  - Returns boolean (never throws)
  - Only checks extension, not actual file content
- **Supported formats:**
  - `.mp3` - MPEG Audio Layer 3
  - `.wav` - Waveform Audio File Format
  - `.ogg` - Ogg Vorbis
  - `.m4a` - MPEG-4 Audio

**Implementation considerations:**
- Convert URL to lowercase for case-insensitive check
- Extract file extension (last part after final `.`)
- Handle query parameters by splitting on `?` first
- Use regex or string methods to extract extension
- List of supported formats as constant array

### 4. **validateSong(song: Song): ValidationResult**

Performs comprehensive validation on a Song object.

- **Description:** Validates all required fields of a Song object and returns detailed validation result with specific error messages
- **Parameters:**
  - `song` (Song): The song object to validate
- **Returns:** 
  - `ValidationResult`: Object with `isValid` boolean and `errors` string array
- **Examples:**
  - Valid song:
    ```typescript
    validateSong({
      id: "1",
      title: "Great Song",
      artist: "Artist Name",
      cover: "https://example.com/cover.jpg",
      url: "https://example.com/song.mp3"
    })
    → { isValid: true, errors: [] }
    ```
  - Invalid song (missing title, bad URL):
    ```typescript
    validateSong({
      id: "2",
      title: "",
      artist: "Artist",
      cover: "not-a-url",
      url: "invalid"
    })
    → { 
      isValid: false, 
      errors: [
        "Title is required",
        "Cover URL must be a valid URL",
        "Audio URL must be a valid URL"
      ]
    }
    ```
  - Unsupported format:
    ```typescript
    validateSong({
      id: "3",
      title: "Song",
      artist: "Artist",
      cover: "https://example.com/cover.jpg",
      url: "https://example.com/song.flac"
    })
    → { 
      isValid: false, 
      errors: ["Audio format must be MP3, WAV, OGG, or M4A"]
    }
    ```
- **Preconditions:** 
  - song parameter should be an object (handle null/undefined)
  - All Song properties should exist (check with optional chaining)
- **Postconditions:** 
  - Always returns valid ValidationResult
  - Never throws exceptions
  - Errors array is empty when isValid is true
  - Errors array contains specific messages when isValid is false
- **Validation checks to perform:**
  1. **Title validation:**
     - Must exist and not be empty after trimming
     - Error: "Title is required"
  2. **Artist validation:**
     - Must exist and not be empty after trimming
     - Error: "Artist is required"
  3. **Cover URL validation:**
     - Must exist and not be empty
     - Must be valid URL format (use isValidImageUrl)
     - Error: "Cover URL is required" or "Cover URL must be a valid URL"
  4. **Audio URL validation:**
     - Must exist and not be empty
     - Must be valid URL format (use isValidAudioUrl)
     - Must have supported format (use isSupportedFormat)
     - Errors: "Audio URL is required", "Audio URL must be a valid URL", or "Audio format must be MP3, WAV, OGG, or M4A"
  5. **ID validation (optional):**
     - ID should exist but don't fail validation if missing (can be generated)

**Implementation considerations:**
- Create errors array to collect all validation errors
- Check each field sequentially
- Use helper functions (isValidAudioUrl, isValidImageUrl, isSupportedFormat)
- Trim strings before checking if empty
- Return result with isValid = (errors.length === 0)
- Handle null/undefined song gracefully

---

## Dependencies:

- **Type imports:** 
  - `Song` from `@types/song`
  - `ValidationResult` from `@types/validation`
- **Classes it must use:** None
- **Interfaces it implements:** None
- **External services it consumes:** None (no network calls)

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 8 per function
- **Maximum method length:** 50 lines per function (validateSong may be longer)
- **Pure functions:** All functions should be pure (no side effects, deterministic)
- **No network calls:** Validation is synchronous and local only

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Each function validates one aspect
  - **Open/Closed:** Functions are complete but can be extended
- **Input parameter validation:**
  - Check for null/undefined inputs
  - Trim whitespace from strings
  - Handle edge cases gracefully
- **Robust exception handling:**
  - Never throw exceptions
  - Use defensive programming
  - Return safe defaults (false, empty ValidationResult)
- **No logging needed:** Pure validation functions
- **Comments for complex logic:**
  - Explain regex patterns if used
  - Document supported formats
  - Clarify validation rules

## Documentation:

- **JSDoc on all exported functions:**
  - `@param` for each parameter with type and description
  - `@returns` with type and description
  - `@example` showing various validation scenarios
  - `@throws` should indicate "Never throws"
- **Inline comments:**
  - Explain validation rules
  - Document supported formats
  - Note browser compatibility considerations

## Security:

- **Input sanitization:** Validate and sanitize all string inputs
- **No code execution:** Don't use eval or Function constructor
- **Safe regex:** Ensure regex patterns can't cause ReDoS attacks
- **URL validation:** Use URL constructor safely with try-catch

---

# DELIVERABLES

## 1. Complete source code of `src/utils/audio-validator.ts` with:

- Organized imports:
  ```typescript
  import {Song} from '@types/song';
  import {ValidationResult} from '@types/validation';
  ```
- Constants at the beginning:
  - Supported audio formats array: `['mp3', 'wav', 'ogg', 'm4a']`
  - Supported image formats array (optional): `['jpg', 'jpeg', 'png', 'gif', 'webp']`
  - Max URL length constant (e.g., 2048)
  - Error message constants
- Fully implemented functions:
  - `isValidAudioUrl(url: string): boolean`
  - `isValidImageUrl(url: string): boolean`
  - `isSupportedFormat(url: string): boolean`
  - `validateSong(song: Song): ValidationResult`
- Complete JSDoc documentation on all exported functions
- Inline comments for validation logic

## 2. Inline documentation:

- Justification of validation rules
- Explanation of URL validation approach
- Notes on supported formats and browser compatibility
- Documentation of error message templates
- TODOs if additional validation needed

## 3. New dependencies:

- **Type imports:**
  - `Song` from `src/types/song.ts`
  - `ValidationResult` from `src/types/validation.ts`
- **No external libraries needed**

## 4. Edge cases considered:

- **isValidAudioUrl / isValidImageUrl:**
  - Empty string → false
  - Null/undefined → false
  - Whitespace only → false
  - Very long URLs → false (>2048 chars)
  - Invalid protocols (ftp, file) → false
  - Relative paths → true
  - Query parameters → handle correctly
  - URL-encoded characters → handle via URL constructor
- **isSupportedFormat:**
  - No file extension → false
  - Case variations (MP3, Mp3, mp3) → true (case insensitive)
  - Query parameters after extension → handle correctly
  - Multiple dots in filename → use last extension
  - Empty string → false
- **validateSong:**
  - Null/undefined song → all required errors
  - Missing properties → specific error for each
  - Empty strings after trim → required errors
  - Multiple validation failures → all errors in array
  - Valid song → empty errors array

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: URL validation approach (URL constructor vs regex)]
- [Decision 2: Handling of relative paths vs absolute URLs]
- [Decision 3: Case sensitivity for file extensions]
- [Decision 4: Validation order in validateSong (fail fast vs collect all)]
- [Decision 5: Error message wording and specificity]
- [Decision 6: Optional image format validation vs any valid URL]

**Validation strategy:**
- [Explain the validation approach: fail fast vs collect all errors]
- [Document URL validation technique]
- [Justify supported format list]

**Possible future improvements:**
- [Improvement 1: Async validation with actual network checks (HEAD request)]
- [Improvement 2: MIME type validation via network request]
- [Improvement 3: Image dimension validation]
- [Improvement 4: Audio duration validation]
- [Improvement 5: File size checks]
- [Improvement 6: More detailed URL validation (port, path structure)]
- [Improvement 7: Support for data URLs (base64 encoded)]
- [Improvement 8: Validation of URL accessibility (CORS check)]
- [Improvement 9: Localized error messages]

---

**REMINDER:** These are **pure validation functions** - no side effects, no network calls, no state mutations. Focus on thorough validation, clear error messages, and robust edge case handling. Every function should be safe to call with any input and always return predictable output.
