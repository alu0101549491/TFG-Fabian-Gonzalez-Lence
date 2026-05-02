# CODE REVIEW REQUEST #6: `src/utils/audio-validator.ts`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/utils/audio-validator.ts`

**Component objective:** Validate song data before adding to playlist. Includes `validateSong()` to check all fields, `isValidAudioUrl()` and `isValidImageUrl()` to validate URL formats, and `isSupportedFormat()` to verify audio file extensions. Ensures data integrity and provides clear error messages for form validation in AddSongForm component.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**FR15:** Add songs to local playlist
- User can add new songs by providing title, artist, cover URL, and audio URL
- **Validation required before adding**

**NFR11:** Standardized song data structure
- Each song must contain: title, artist, cover URL, audio URL
- All fields are required (not optional)

**Validation Rules (from Requirements Section 13.1):**

| Field | Validation Rule | Error Message |
|-------|----------------|---------------|
| Title | Required, not empty after trim | "Title is required" |
| Artist | Required, not empty after trim | "Artist is required" |
| Cover URL | Valid URL format (HTTP/HTTPS or relative path) | "Cover URL must be a valid URL" |
| Audio URL | Valid URL format (HTTP/HTTPS or relative path) | "Audio URL must be a valid URL" |
| Audio Format | Extension must be .mp3, .wav, .ogg, or .m4a | "Audio format must be MP3, WAV, OGG, or M4A" |

**Supported Audio Formats:**
- MP3 (.mp3) - Primary format, universally supported
- WAV (.wav) - Uncompressed audio
- OGG Vorbis (.ogg) - Open format
- M4A (.m4a) - AAC in MP4 container

**URL Validation:**
- Absolute URLs: Must start with `http://` or `https://`
- Relative paths: Must start with `/` or `./`
- Max length: 2048 characters (reasonable limit)
- Should handle query parameters (e.g., `song.mp3?token=abc`)

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│         <<utility>>                     │
│       AudioValidator                    │
├─────────────────────────────────────────┤
│ + isValidAudioUrl(url: string):        │
│     boolean                             │
│ + isValidImageUrl(url: string):        │
│     boolean                             │
│ + isSupportedFormat(url: string):      │
│     boolean                             │
│ + validateSong(song: Song):            │
│     ValidationResult                    │
└─────────────────────────────────────────┘
           │
           │ uses
           ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   <<interface>>         │    │   <<interface>>         │
│        Song             │    │   ValidationResult      │
├─────────────────────────┤    ├─────────────────────────┤
│ + id: string            │    │ + isValid: boolean      │
│ + title: string         │    │ + errors: string[]      │
│ + artist: string        │    └─────────────────────────┘
│ + cover: string         │
│ + url: string           │
└─────────────────────────┘

Used by:
- AddSongForm component (validates form input)
- usePlaylist hook (validates before adding)
```

---

## CODE TO REVIEW

(Referenced code)

---

## EVALUATION CRITERIA

### 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**

**Function Signatures:**
- [ ] `isValidAudioUrl(url: string): boolean` matches exactly
- [ ] `isValidImageUrl(url: string): boolean` matches exactly
- [ ] `isSupportedFormat(url: string): boolean` matches exactly
- [ ] `validateSong(song: Song): ValidationResult` matches exactly
- [ ] All four functions are exported
- [ ] Functions are standalone (no class wrapper)

**Import Dependencies:**
- [ ] Imports `Song` from `@types/song`
- [ ] Imports `ValidationResult` from `@types/validation`
- [ ] No other dependencies needed

**Implementation Approach:**
- [ ] Pure functions (no side effects, no state)
- [ ] Synchronous validation (no async operations)
- [ ] Never throws exceptions (returns false or ValidationResult with errors)
- [ ] Defensive programming throughout

**Score:** __/10

**Observations:**
- Are all four functions present with correct signatures?
- Are imports correct?
- Are functions pure and synchronous?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **isValidAudioUrl:** Low (3-5 cyclomatic complexity)
  - Empty check
  - URL format validation
  - Protocol/path check
- [ ] **isValidImageUrl:** Low (3-5 cyclomatic complexity)
  - Similar to isValidAudioUrl
  - Could share common logic
- [ ] **isSupportedFormat:** Low (3-4 cyclomatic complexity)
  - Extension extraction
  - Format array check
  - Case-insensitive comparison
- [ ] **validateSong:** Moderate (8-10 cyclomatic complexity)
  - Multiple field checks
  - Accumulates multiple errors
  - Calls helper functions

**Performance:**
- [ ] Fast execution (<5ms for typical validation)
- [ ] No expensive regex patterns (ReDoS risk)
- [ ] URL validation uses URL constructor (efficient)

**Coupling:**
- [ ] Depends on Song and ValidationResult types only
- [ ] No other module dependencies
- [ ] Self-contained validation logic

**Cohesion:**
- [ ] High cohesion (all functions related to validation)
- [ ] Single responsibility (data validation only)
- [ ] Helper functions support main validation

**Code Smells:**
- [ ] Check for: Long Method (validateSong may be ~30-40 lines, acceptable)
- [ ] Check for: Code Duplication (isValidAudioUrl and isValidImageUrl should share logic)
- [ ] Check for: Magic Strings (supported formats should be constant array)
- [ ] Check for: Nested Conditionals (should be manageable)
- [ ] Check for: Feature Envy (should not access too many Song properties separately)

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**isValidAudioUrl Function:**
- [ ] **AC1:** Returns true for `"https://example.com/song.mp3"`
- [ ] **AC2:** Returns true for `"http://example.com/audio/track.wav"`
- [ ] **AC3:** Returns true for `"/songs/local-file.mp3"`
- [ ] **AC4:** Returns true for `"./audio/song.ogg"`
- [ ] **AC5:** Returns false for `"not-a-url"`
- [ ] **AC6:** Returns false for empty string `""`
- [ ] **AC7:** Returns false for `"ftp://example.com/song.mp3"` (only HTTP/HTTPS)
- [ ] **AC8:** Handles whitespace (trims before validation)
- [ ] **AC9:** Max length check (< 2048 characters)

**isValidImageUrl Function:**
- [ ] **AC10:** Returns true for `"https://example.com/cover.jpg"`
- [ ] **AC11:** Returns true for `"/covers/album.png"`
- [ ] **AC12:** Returns false for invalid formats (same as audio URL)
- [ ] **AC13:** Similar validation logic to isValidAudioUrl

**isSupportedFormat Function:**
- [ ] **AC14:** Returns true for URLs ending in `.mp3`
- [ ] **AC15:** Returns true for URLs ending in `.wav`
- [ ] **AC16:** Returns true for URLs ending in `.ogg`
- [ ] **AC17:** Returns true for URLs ending in `.m4a`
- [ ] **AC18:** Case-insensitive (`.MP3` and `.mp3` both valid)
- [ ] **AC19:** Handles query parameters (`song.mp3?token=abc` is valid)
- [ ] **AC20:** Returns false for `.flac`, `.aac`, etc.
- [ ] **AC21:** Returns false for no extension or empty string

**validateSong Function:**
- [ ] **AC22:** Returns `{ isValid: true, errors: [] }` for valid song
- [ ] **AC23:** Validates title is not empty (after trim)
- [ ] **AC24:** Validates artist is not empty (after trim)
- [ ] **AC25:** Validates cover URL format (calls isValidImageUrl)
- [ ] **AC26:** Validates audio URL format (calls isValidAudioUrl)
- [ ] **AC27:** Validates audio format (calls isSupportedFormat)
- [ ] **AC28:** Accumulates ALL errors (returns multiple)
- [ ] **AC29:** Error messages match requirements exactly
- [ ] **AC30:** Handles null/undefined song gracefully
- [ ] **AC31:** isValid is false when errors.length > 0
- [ ] **AC32:** isValid is true only when errors.length === 0

**Edge Cases Matrix:**

| Scenario | Expected Result | Handled? |
|----------|----------------|----------|
| Valid complete song | `{ isValid: true, errors: [] }` | [ ] |
| Empty title | Error: "Title is required" | [ ] |
| Whitespace-only title | Error: "Title is required" | [ ] |
| Empty artist | Error: "Artist is required" | [ ] |
| Invalid cover URL | Error: "Cover URL must be a valid URL" | [ ] |
| Invalid audio URL | Error: "Audio URL must be a valid URL" | [ ] |
| Unsupported format (.flac) | Error: "Audio format must be MP3, WAV, OGG, or M4A" | [ ] |
| Multiple errors | All errors in array | [ ] |
| null/undefined song | Safe ValidationResult | [ ] |
| URL with query params | Correctly validates | [ ] |
| Very long URL (>2048) | Returns false | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Module-level JSDoc:**
- [ ] File-level comment explaining validation utilities
- [ ] `@module` tag

**isValidAudioUrl JSDoc:**
- [ ] Description of validation logic
- [ ] `@param url` with description
- [ ] `@returns` boolean explanation
- [ ] `@example` showing valid and invalid URLs

**isValidImageUrl JSDoc:**
- [ ] Description of validation logic
- [ ] `@param url` with description
- [ ] `@returns` boolean explanation
- [ ] `@example` showing valid and invalid URLs

**isSupportedFormat JSDoc:**
- [ ] Description of format checking
- [ ] List of supported formats in description
- [ ] `@param url` with description
- [ ] `@returns` boolean explanation
- [ ] `@example` showing various extensions

**validateSong JSDoc:**
- [ ] Description of comprehensive validation
- [ ] Explanation of validation rules
- [ ] `@param song` with description
- [ ] `@returns` ValidationResult explanation
- [ ] `@example` showing valid song
- [ ] `@example` showing invalid song with errors

**Code Clarity:**
- [ ] Variable names are descriptive (errors, trimmedTitle, etc.)
- [ ] Constants for supported formats clearly defined
- [ ] Validation logic is sequential and clear
- [ ] Comments explain complex regex (if used)

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Each function validates one aspect ✓
- [ ] **DRY:** Common URL validation extracted (not duplicated)
- [ ] **Open/Closed:** Easy to add new validation rules

**Validation Best Practices:**
- [ ] Accumulates all errors (not fail-fast in validateSong)
- [ ] Clear, specific error messages
- [ ] Defensive programming (null checks)
- [ ] Never throws exceptions
- [ ] Sanitizes input (trims whitespace)
- [ ] Returns safe defaults

**TypeScript Best Practices:**
- [ ] Explicit return types on all functions
- [ ] Explicit parameter types
- [ ] No `any` types
- [ ] Type-safe array operations
- [ ] Proper type imports

**URL Validation Approach:**
- [ ] Uses URL constructor (standard, safe approach)
- [ ] Handles try-catch for invalid URLs
- [ ] Checks protocol (http/https) or relative path
- [ ] No complex regex (avoids ReDoS vulnerability)

**Code Style:**
- [ ] Follows Google TypeScript Style Guide
- [ ] Consistent formatting
- [ ] Named exports
- [ ] Constants in UPPER_SNAKE_CASE (optional)

**Score:** __/10

**Issues found:**

---

## DELIVERABLES

### Review Report:

**Total Score:** __/10 (weighted average)

**Calculation:**
```
Total = (Design × 0.30) + (Quality × 0.25) + (Requirements × 0.25) + (Maintainability × 0.10) + (Best Practices × 0.10)
```

---

### Executive Summary:

[Provide 2-3 lines about the general state of the code. Examples:]
- "Comprehensive validation implementation with all required functions. URL validation uses safe URL constructor approach. Error messages match requirements exactly. Handles edge cases properly."
- "Core validation logic correct but code duplication between isValidAudioUrl and isValidImageUrl. Missing supported format constant. Validation works but could be cleaner."
- "Critical: validateSong doesn't accumulate errors, returns after first failure. Error messages don't match requirements. URL validation uses unsafe regex with ReDoS vulnerability."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. validateSong fails fast instead of accumulating errors - Lines 45-60
   - Current: Returns after finding first error
   - Expected: Collect all errors and return them together
   - Impact: User only sees one error at a time, poor UX
   - Proposed solution: Collect errors in array:
     const errors: string[] = [];
     if (!title) errors.push("Title is required");
     if (!artist) errors.push("Artist is required");
     // ... check all fields
     return { isValid: errors.length === 0, errors };

2. Wrong error message for audio format - Line 58
   - Current: "Invalid audio format"
   - Expected: "Audio format must be MP3, WAV, OGG, or M4A"
   - Impact: Doesn't match requirements, inconsistent messaging
   - Proposed solution: Use exact message from requirements table

3. isValidAudioUrl uses unsafe regex - Line 12
   - Current: /^https?:\/\/.+/.test(url)
   - Impact: ReDoS vulnerability with certain inputs
   - Proposed solution: Use URL constructor with try-catch:
     try { new URL(url); return true; } catch { return false; }

4. No null/undefined check in validateSong - Line 40
   - Impact: Throws TypeError if song is null
   - Proposed solution: Add guard:
     if (!song) return { isValid: false, errors: ["Invalid song data"] };
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. Code duplication between isValidAudioUrl and isValidImageUrl - Lines 10-25
   - Suggestion: Extract common URL validation logic:
     function isValidUrl(url: string): boolean {
       if (!url || !url.trim()) return false;
       // validation logic
     }
   - Benefit: DRY principle, easier to maintain

2. Supported formats not defined as constant - Line 35
   - Current: Inline array ['mp3', 'wav', 'ogg', 'm4a']
   - Suggestion: Extract to constant:
     const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a'] as const;
   - Benefit: Reusable, self-documenting, single source of truth

3. No max URL length check - isValidAudioUrl/isValidImageUrl
   - Suggestion: Add length check:
     if (url.length > 2048) return false;
   - Benefit: Prevents extremely long URLs

4. isSupportedFormat doesn't handle missing extension - Line 32
   - Current: May throw if no extension found
   - Suggestion: Add check:
     if (!extension || extension === url) return false;
   - Benefit: Safer, more defensive

5. Missing JSDoc examples for edge cases - All functions
   - Suggestion: Add examples showing:
     - Query parameters in URL
     - Relative paths
     - Case variations
   - Benefit: Clearer documentation
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ All four required validation functions implemented
- ✅ Uses URL constructor for safe URL validation
- ✅ Case-insensitive format checking
- ✅ Handles query parameters in URLs correctly
- ✅ Accumulates all validation errors (good UX)
- ✅ Error messages match requirements exactly
- ✅ Proper input sanitization (trim whitespace)
- ✅ Comprehensive edge case handling
- ✅ Clean separation of validation concerns
- ✅ No external dependencies

---

### Recommended Refactorings:

**REFACTORING 1: Extract common URL validation logic**

```typescript
// BEFORE (duplicated logic)
export function isValidAudioUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  
  try {
    new URL(url, 'https://example.com');
    return true;
  } catch {
    return url.startsWith('/') || url.startsWith('./');
  }
}

export function isValidImageUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  
  try {
    new URL(url, 'https://example.com');
    return true;
  } catch {
    return url.startsWith('/') || url.startsWith('./');
  }
}

// AFTER (DRY - shared logic)
/**
 * Validates if a string is a properly formatted URL.
 * Accepts absolute URLs (http/https) or relative paths.
 */
function isValidUrl(url: string): boolean {
  // Handle empty or whitespace-only input
  if (!url || !url.trim()) {
    return false;
  }
  
  const trimmedUrl = url.trim();
  
  // Check length (reasonable limit)
  if (trimmedUrl.length > 2048) {
    return false;
  }
  
  // Check if relative path
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./')) {
    return true;
  }
  
  // Validate absolute URL with http/https protocol
  try {
    const parsedUrl = new URL(trimmedUrl);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidAudioUrl(url: string): boolean {
  return isValidUrl(url);
}

export function isValidImageUrl(url: string): boolean {
  return isValidUrl(url);
}
```

**Reason:** Eliminates duplication, centralizes URL validation logic, easier to maintain and test.

---

**REFACTORING 2: Extract supported formats constant**

```typescript
// BEFORE (inline array)
export function isSupportedFormat(url: string): boolean {
  const extension = url.toLowerCase().split('.').pop()?.split('?')[0];
  return ['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '');
}

// AFTER (constant)
/**
 * Audio formats supported by the player.
 * These formats have broad browser support.
 */
const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a'] as const;

/**
 * Checks if an audio URL has a supported file format.
 * 
 * Validates based on file extension. Supported formats:
 * - MP3 (.mp3) - Universal support
 * - WAV (.wav) - Uncompressed audio
 * - OGG (.ogg) - Open format
 * - M4A (.m4a) - AAC in MP4 container
 * 
 * @param url - Audio file URL to check
 * @returns True if format is supported, false otherwise
 * 
 * @example
 * isSupportedFormat("song.mp3");        // true
 * isSupportedFormat("song.MP3");        // true (case insensitive)
 * isSupportedFormat("song.mp3?token=x"); // true (ignores query params)
 * isSupportedFormat("song.flac");       // false
 */
export function isSupportedFormat(url: string): boolean {
  if (!url || !url.trim()) {
    return false;
  }
  
  // Extract extension, handling query parameters
  const urlWithoutQuery = url.split('?')[0];
  const parts = urlWithoutQuery.toLowerCase().split('.');
  
  if (parts.length < 2) {
    return false; // No extension found
  }
  
  const extension = parts[parts.length - 1];
  return SUPPORTED_AUDIO_FORMATS.includes(extension as any);
}
```

**Reason:** Self-documenting code, reusable constant, single source of truth, better error handling.

---

**REFACTORING 3: Improve validateSong with better error accumulation**

```typescript
// BEFORE (basic implementation)
export function validateSong(song: Song): ValidationResult {
  const errors: string[] = [];
  
  if (!song.title.trim()) {
    errors.push("Title is required");
  }
  
  if (!song.artist.trim()) {
    errors.push("Artist is required");
  }
  
  // ... more checks
  
  return { isValid: errors.length === 0, errors };
}

// AFTER (comprehensive, defensive)
/**
 * Validates a complete Song object.
 * 
 * Performs comprehensive validation of all required fields:
 * - Title and artist must not be empty
 * - Cover and audio URLs must be valid
 * - Audio format must be supported
 * 
 * Returns all validation errors at once for better UX.
 * 
 * @param song - Song object to validate
 * @returns ValidationResult with isValid flag and error messages
 * 
 * @example
 * // Valid song
 * const result = validateSong({
 *   id: "1",
 *   title: "Song Title",
 *   artist: "Artist Name",
 *   cover: "https://example.com/cover.jpg",
 *   url: "https://example.com/song.mp3"
 * });
 * // Returns: { isValid: true, errors: [] }
 * 
 * @example
 * // Invalid song with multiple errors
 * const result = validateSong({
 *   id: "2",
 *   title: "",
 *   artist: "Artist",
 *   cover: "invalid-url",
 *   url: "https://example.com/song.flac"
 * });
 * // Returns: {
 * //   isValid: false,
 * //   errors: [
 * //     "Title is required",
 * //     "Cover URL must be a valid URL",
 * //     "Audio format must be MP3, WAV, OGG, or M4A"
 * //   ]
 * // }
 */
export function validateSong(song: Song): ValidationResult {
  // Defensive: handle null/undefined song
  if (!song) {
    return {
      isValid: false,
      errors: ['Invalid song data']
    };
  }
  
  const errors: string[] = [];
  
  // Validate title (required, non-empty after trim)
  const title = song.title?.trim() || '';
  if (!title) {
    errors.push('Title is required');
  }
  
  // Validate artist (required, non-empty after trim)
  const artist = song.artist?.trim() || '';
  if (!artist) {
    errors.push('Artist is required');
  }
  
  // Validate cover URL (required, valid format)
  const cover = song.cover?.trim() || '';
  if (!cover) {
    errors.push('Cover URL is required');
  } else if (!isValidImageUrl(cover)) {
    errors.push('Cover URL must be a valid URL');
  }
  
  // Validate audio URL (required, valid format, supported format)
  const audioUrl = song.url?.trim() || '';
  if (!audioUrl) {
    errors.push('Audio URL is required');
  } else {
    if (!isValidAudioUrl(audioUrl)) {
      errors.push('Audio URL must be a valid URL');
    } else if (!isSupportedFormat(audioUrl)) {
      errors.push('Audio format must be MP3, WAV, OGG, or M4A');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

**Reason:** Comprehensive validation, defensive programming, accumulates all errors, exact error messages from requirements.

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All validation functions work correctly
  - Error messages match requirements exactly
  - Comprehensive edge case handling
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: code duplication, missing constants
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: doesn't accumulate errors, wrong error messages
  - Unsafe validation (ReDoS risk)
  - Must fix before AddSongForm can use this

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This utility is critical for data integrity
- Used by AddSongForm to validate user input before submission
- May be used by usePlaylist hook as additional safety check
- Error messages are displayed directly to users (UX critical)

**Dependencies:**
- Depends on: Song and ValidationResult types
- Used by: AddSongForm component, usePlaylist hook

**What to Look For:**
- **Error accumulation:** validateSong must collect ALL errors, not just first one
- **Exact error messages:** Must match requirements table word-for-word
- **URL validation safety:** No ReDoS vulnerabilities from complex regex
- **Defensive programming:** Handles null/undefined/empty inputs gracefully
- **Supported formats:** All four formats (mp3, wav, ogg, m4a) checked

**Common Mistakes to Watch For:**
- Failing fast (returning after first error found)
- Wrong error message text (not matching requirements)
- Using unsafe regex for URL validation (ReDoS vulnerability)
- Not handling query parameters in URLs
- Case-sensitive format checking (should be case-insensitive)
- Missing null/undefined checks (throws TypeError)
- Code duplication between URL validation functions
- Not trimming whitespace before validation

**Testing Checklist:**
```typescript
// Test URL validation
console.assert(isValidAudioUrl("https://example.com/song.mp3"), "HTTPS URL");
console.assert(isValidAudioUrl("/songs/local.mp3"), "Relative path");
console.assert(!isValidAudioUrl(""), "Empty string");
console.assert(!isValidAudioUrl("not-a-url"), "Invalid URL");

// Test format validation
console.assert(isSupportedFormat("song.mp3"), "MP3 format");
console.assert(isSupportedFormat("song.MP3"), "Case insensitive");
console.assert(isSupportedFormat("song.mp3?token=abc"), "With query params");
console.assert(!isSupportedFormat("song.flac"), "Unsupported format");

// Test song validation - valid
const validSong: Song = {
  id: "1",
  title: "Test Song",
  artist: "Test Artist",
  cover: "https://example.com/cover.jpg",
  url: "https://example.com/song.mp3"
};
const result1 = validateSong(validSong);
console.assert(result1.isValid === true, "Valid song");
console.assert(result1.errors.length === 0, "No errors");

// Test song validation - multiple errors
const invalidSong: Song = {
  id: "2",
  title: "",
  artist: "Artist",
  cover: "invalid",
  url: "https://example.com/song.flac"
};
const result2 = validateSong(invalidSong);
console.assert(result2.isValid === false, "Invalid song");
console.assert(result2.errors.length >= 3, "Multiple errors collected");
console.assert(
  result2.errors.includes("Title is required"),
  "Title error message"
);
```

**Security Considerations:**
- URL validation should not be vulnerable to ReDoS
- No code injection risks (pure validation)
- No XSS risks (doesn't render content)
- Validate length to prevent memory issues
