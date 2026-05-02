Perfect! Let's move to **Module #5: `src/utils/error-handler.ts`**

---

# GLOBAL CONTEXT

**Project:** Music Web Player (PLAYER)

**Architecture:** Component-Based Architecture with Custom Hooks (React Pattern)

**Current module:** Utilities Layer - Error Handling Functions

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
│   │   ├── error-handler.ts           ← CURRENT MODULE
│   │   └── audio-validator.ts
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
- **FR1:** Play selected song from beginning or current position
- **FR2:** Pause playback maintaining current position
- **FR3:** Resume playback from paused position

**Relevant Non-Functional Requirements:**
- **NFR5:** Static typing with TypeScript in all components - all functions have explicit TypeScript types
- **NFR9:** Proper error handling without application blocking - when an audio file is unavailable or there's a loading error, a clear message is displayed and the application continues functioning
- **NFR12:** Clear user feedback about playback issues - understandable notifications or error messages are displayed when there are playback failures
- **NFR13:** Prevention of blocks from missing or corrupt files - the application detects invalid audio files and handles the error without completely interrupting the experience

**Error Handling Requirements (from Section 13):**

### Error Types and Messages:

| Error Type | User Message | Technical Cause |
|------------|--------------|-----------------|
| Audio file unavailable (404) | "Unable to load song. The file may have been moved or deleted." | Network error, file not found, server error |
| Corrupt audio file | "This audio file appears to be corrupted or incomplete." | Decode error, invalid format, incomplete file |
| Network error | "Network error. Please check your internet connection." | Connection lost, timeout, CORS issue |
| Unsupported format | "This audio format is not supported. Please use MP3, WAV, OGG, or M4A." | Browser doesn't support format |

## 2. Class Diagram (Relevant Section)

```typescript
class ErrorHandler {
    <<utility>>
    +handlePlaybackError(error: Error): PlaybackError
    +getErrorMessage(errorType: ErrorType): string
    +logError(error: Error): void
}

class ErrorType {
    <<enumeration>>
    LOAD_ERROR
    DECODE_ERROR
    NETWORK_ERROR
    UNSUPPORTED_FORMAT
}

class PlaybackError {
    <<interface>>
    +type: ErrorType
    +message: string
    +songId: string
}
```

**Relationships:**
- Used by: `useAudioPlayer` hook (calls handlePlaybackError when audio errors occur)
- Used by: `Player` component (displays error messages)
- Uses: `ErrorType` enum, `PlaybackError` interface (from types/playback-error.ts)

## 3. Use Case Diagram (Relevant Use Cases)

- **Handle Playback Error:** System catches audio error → Converts to PlaybackError → Returns to caller
- **Display Error Message:** System gets error type → Retrieves user-friendly message → Shows in UI
- **Log Error:** System logs technical error details for debugging (console in dev mode)

---

# SPECIFIC TASK

Implement the utility module: **`src/utils/error-handler.ts`**

## Responsibilities:

1. **Convert native JavaScript/HTML5 Audio errors** to domain-specific PlaybackError objects
2. **Map error types** from browser error codes to ErrorType enum values
3. **Provide user-friendly error messages** for each error type
4. **Log errors** for debugging purposes (console in development mode)
5. **Ensure error handling doesn't throw exceptions** (defensive programming)

## Methods to implement:

### 1. **handlePlaybackError(error: Error, songId: string): PlaybackError**

Converts a native JavaScript Error or MediaError into a structured PlaybackError.

- **Description:** Takes a raw error from the HTML5 Audio API and converts it to a typed PlaybackError object with appropriate error type and user-friendly message
- **Parameters:**
  - `error` (Error): The native JavaScript Error object from audio element (could be MediaError)
  - `songId` (string): The ID of the song that caused the error
- **Returns:** 
  - `PlaybackError`: Structured error object with type, message, and songId
- **Examples:**
  - Network error → `{ type: ErrorType.NETWORK_ERROR, message: "Network error...", songId: "123" }`
  - Decode error → `{ type: ErrorType.DECODE_ERROR, message: "This audio file...", songId: "123" }`
  - 404 error → `{ type: ErrorType.LOAD_ERROR, message: "Unable to load song...", songId: "123" }`
- **Preconditions:** 
  - Error object must be valid (check for null/undefined)
  - songId should be provided (use "unknown" if missing)
  - Error might be MediaError with code property or generic Error
- **Postconditions:** 
  - Always returns a valid PlaybackError object
  - Error is logged for debugging
  - Never throws exceptions
- **Error detection logic:**
  - Check `error.name` or `error.message` for error type identification
  - For MediaError, check `error.code`:
    - `MEDIA_ERR_ABORTED` (1) → LOAD_ERROR
    - `MEDIA_ERR_NETWORK` (2) → NETWORK_ERROR
    - `MEDIA_ERR_DECODE` (3) → DECODE_ERROR
    - `MEDIA_ERR_SRC_NOT_SUPPORTED` (4) → UNSUPPORTED_FORMAT
  - For generic Error, parse message for keywords:
    - "network", "fetch", "connection" → NETWORK_ERROR
    - "404", "not found", "load" → LOAD_ERROR
    - "decode", "corrupt" → DECODE_ERROR
    - "format", "unsupported", "mime" → UNSUPPORTED_FORMAT
  - Default fallback → LOAD_ERROR

**Implementation considerations:**
- Cast error to `MediaError` if it has a `code` property
- Use type guards to safely access MediaError properties
- Call `getErrorMessage()` to get user-friendly message
- Call `logError()` to log for debugging
- Always return valid PlaybackError (defensive)

### 2. **getErrorMessage(errorType: ErrorType): string**

Returns a user-friendly error message for a given error type.

- **Description:** Maps an ErrorType enum value to a clear, actionable error message for display to users
- **Parameters:**
  - `errorType` (ErrorType): The type of error that occurred
- **Returns:** 
  - `string`: User-friendly error message
- **Examples:**
  - `getErrorMessage(ErrorType.LOAD_ERROR)` → `"Unable to load song. The file may have been moved or deleted."`
  - `getErrorMessage(ErrorType.DECODE_ERROR)` → `"This audio file appears to be corrupted or incomplete."`
  - `getErrorMessage(ErrorType.NETWORK_ERROR)` → `"Network error. Please check your internet connection."`
  - `getErrorMessage(ErrorType.UNSUPPORTED_FORMAT)` → `"This audio format is not supported. Please use MP3, WAV, OGG, or M4A."`
- **Preconditions:** 
  - errorType is a valid ErrorType enum value
  - Should handle undefined/invalid input gracefully
- **Postconditions:** 
  - Always returns a string (never null/undefined)
  - Message is clear, non-technical, and actionable
  - Never throws exceptions
- **Message guidelines:**
  - Clear and specific (not generic "Error occurred")
  - Non-technical language (avoid jargon)
  - Actionable (suggest what user can do)
  - Concise (one or two sentences max)
  - Empathetic tone (not blaming user)

**Implementation considerations:**
- Use switch statement or object lookup for error type → message mapping
- Provide default message for unknown error types
- Messages should match requirements specification table
- Consider returning const strings for consistency

### 3. **logError(error: Error, context?: string): void**

Logs error details to console for debugging (development mode only).

- **Description:** Outputs error information to browser console with optional context for debugging purposes
- **Parameters:**
  - `error` (Error): The error object to log
  - `context` (string, optional): Additional context about where/when error occurred (e.g., "Audio playback", "Song ID: 123")
- **Returns:** 
  - `void`: No return value
- **Examples:**
  - `logError(error)` → Console: `[Error] Error message...`
  - `logError(error, "Audio playback")` → Console: `[Audio playback] Error message...`
- **Preconditions:** 
  - Error object should be valid
  - Should check if console is available
  - Should respect production vs development mode
- **Postconditions:** 
  - Error logged to console (development only)
  - No exceptions thrown even if logging fails
  - Application continues normally
- **Logging details to include:**
  - Error message
  - Error name/type
  - Stack trace (if available)
  - Context string (if provided)
  - Timestamp
  - MediaError code (if applicable)

**Implementation considerations:**
- Check `process.env.NODE_ENV !== 'production'` before logging
- Use `console.error()` for error output
- Format output for readability
- Include stack trace in development
- Handle case where console is unavailable (shouldn't happen in modern browsers)
- Never throw exceptions from logging function

---

## Dependencies:

- **Type imports:** 
  - `ErrorType` from `@types/playback-error`
  - `PlaybackError` from `@types/playback-error`
- **Classes it must use:** None
- **Interfaces it implements:** None
- **External services it consumes:** Browser console API

---

# CONSTRAINTS AND STANDARDS

## Code:

- **Language:** TypeScript 5+
- **Code style:** Google TypeScript Style Guide
- **Maximum cyclomatic complexity:** 8 per function
- **Maximum method length:** 50 lines per function
- **Pure functions:** handlePlaybackError and getErrorMessage should be pure (deterministic)
- **Side effects:** Only logError has side effects (console output)

## Mandatory best practices:

- **Application of SOLID principles:**
  - **Single Responsibility:** Each function has one clear purpose
  - **Dependency Inversion:** Depends on ErrorType abstraction, not concrete implementations
- **Input parameter validation:**
  - Check for null/undefined errors
  - Validate errorType is valid enum value
  - Provide safe defaults for missing parameters
- **Robust exception handling:**
  - Never throw exceptions from error handling functions
  - Use defensive programming (check types, provide defaults)
  - All functions should be safe to call with any input
- **Logging at critical points:**
  - Log all handled errors with context
  - Include relevant details for debugging
  - Respect environment (dev vs production)
- **Comments for complex logic:**
  - Explain MediaError code mapping
  - Document error detection logic
  - Clarify message selection rationale

## Documentation:

- **JSDoc on all exported functions:**
  - `@param` for each parameter with type and description
  - `@returns` with type and description
  - `@example` showing common usage scenarios
  - `@throws` should indicate "Never throws" for safety
- **Inline comments:**
  - Explain MediaError code values
  - Document error type detection logic
  - Note browser compatibility considerations

## Security:

- **Input sanitization:** Validate error objects before accessing properties
- **No sensitive data:** Don't log sensitive information (user data, tokens)
- **Safe string operations:** No injection risks in message generation

---

# DELIVERABLES

## 1. Complete source code of `src/utils/error-handler.ts` with:

- Organized imports:
  ```typescript
  import {ErrorType, PlaybackError} from '@types/playback-error';
  ```
- Constants at the beginning:
  - Error message constants (or inline in getErrorMessage)
  - MediaError code constants for readability
- Fully implemented functions:
  - `handlePlaybackError(error: Error, songId: string): PlaybackError`
  - `getErrorMessage(errorType: ErrorType): string`
  - `logError(error: Error, context?: string): void`
- Complete JSDoc documentation on all exported functions
- Inline comments for complex logic

## 2. Inline documentation:

- Justification of error type detection logic
  - Why certain keywords map to certain error types
  - Rationale for fallback to LOAD_ERROR
- Explanation of MediaError code handling
- Notes on browser compatibility (MediaError support)
- TODOs if enhanced error handling is planned

## 3. New dependencies:

- **Type imports:**
  - `ErrorType`, `PlaybackError` from `src/types/playback-error.ts`
- **No external libraries needed**

## 4. Edge cases considered:

- **handlePlaybackError:**
  - null/undefined error → Create generic PlaybackError
  - MediaError with code → Map code to ErrorType
  - Generic Error → Parse message for keywords
  - Unknown error type → Default to LOAD_ERROR
  - Missing songId → Use "unknown"
  - Error without message → Use generic message
- **getErrorMessage:**
  - Invalid ErrorType value → Return generic message
  - undefined/null errorType → Return safe default
- **logError:**
  - Console unavailable → Silently fail
  - Production mode → Skip logging
  - Error while logging → Don't throw exception
  - Circular references in error object → Handle safely

---

# OUTPUT FORMAT

```typescript
// Complete TypeScript code here
```

**Design decisions made:**
- [Decision 1: How to detect error types from generic Error objects]
- [Decision 2: Default error type for unknown errors (LOAD_ERROR vs generic)]
- [Decision 3: Whether to include stack traces in PlaybackError]
- [Decision 4: Logging strategy (dev only vs always log with levels)]
- [Decision 5: Error message tone (technical vs user-friendly)]
- [Decision 6: MediaError type detection approach]

**Error type detection strategy:**
- [Explain the logic for determining ErrorType from various error sources]
- [Document keyword matching for generic Errors]
- [Justify fallback behavior]

**Possible future improvements:**
- [Improvement 1: Error analytics/tracking integration]
- [Improvement 2: Error recovery strategies (retry logic)]
- [Improvement 3: Localization support for error messages]
- [Improvement 4: Error aggregation (multiple errors for same song)]
- [Improvement 5: User action suggestions in error messages]
- [Improvement 6: Structured logging with error IDs for support]
- [Improvement 7: Integration with error monitoring services (Sentry, etc.)]

---

**REMINDER:** These are **error handling utilities** - they must never throw exceptions themselves. Focus on defensive programming, safe defaults, and clear user communication. Every function should gracefully handle any input and always return valid output.
