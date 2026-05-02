# CODE REVIEW REQUEST #5: `src/utils/error-handler.ts`

## REVIEW CONTEXT

**Project:** Music Web Player (PLAYER)

**Component reviewed:** `src/utils/error-handler.ts`

**Component objective:** Convert native JavaScript/HTML5 Audio errors into structured PlaybackError objects with user-friendly messages. Includes `handlePlaybackError()` to transform errors, `getErrorMessage()` to map error types to messages, and `logError()` for debugging. Critical for providing clear error feedback to users when audio playback fails.

---

## REQUIREMENTS SPECIFICATION

### Relevant Requirements:

**NFR9:** Proper error handling without application blocking
- When an audio file is unavailable or there's a loading error, a clear message is displayed and the application continues functioning
- Errors must not crash the application

**NFR12:** Clear user feedback about playback issues
- Understandable notifications or error messages are displayed when there are playback failures
- Users must know what went wrong in non-technical terms

**NFR13:** Prevention of blocks from missing or corrupt files
- The application detects invalid audio files and handles the error without completely interrupting the experience

**Error Messages (from Requirements Section 13):**

| Error Type | User Message | Technical Cause |
|------------|--------------|-----------------|
| LOAD_ERROR | "Unable to load song. The file may have been moved or deleted." | 404, network timeout, server error, file not found |
| DECODE_ERROR | "This audio file appears to be corrupted or incomplete." | Decode error, invalid format, incomplete file |
| NETWORK_ERROR | "Network error. Please check your internet connection." | Connection lost, timeout, CORS issue |
| UNSUPPORTED_FORMAT | "This audio format is not supported. Please use MP3, WAV, OGG, or M4A." | Browser doesn't support format |

**MediaError Codes (HTML5 Audio API):**
- `MEDIA_ERR_ABORTED` (1): User aborted load → LOAD_ERROR
- `MEDIA_ERR_NETWORK` (2): Network error → NETWORK_ERROR
- `MEDIA_ERR_DECODE` (3): Decode error → DECODE_ERROR
- `MEDIA_ERR_SRC_NOT_SUPPORTED` (4): Format not supported → UNSUPPORTED_FORMAT

---

## CLASS DIAGRAM

```typescript
┌─────────────────────────────────────────┐
│         <<utility>>                     │
│        ErrorHandler                     │
├─────────────────────────────────────────┤
│ + handlePlaybackError(error: Error,    │
│     songId: string): PlaybackError      │
│ + getErrorMessage(errorType:           │
│     ErrorType): string                  │
│ + logError(error: Error,                │
│     context?: string): void             │
└─────────────────────────────────────────┘
           │
           │ uses
           ▼
┌─────────────────────────┐
│   <<interface>>         │
│    PlaybackError        │
├─────────────────────────┤
│ + type: ErrorType       │
│ + message: string       │
│ + songId: string        │
└─────────────────────────┘

Used by:
- useAudioPlayer hook (converts audio errors)
- Player component (may log errors)
```

---

## CODE TO REVIEW

(Referenced code)

---

## EVALUATION CRITERIA

### 1. DESIGN ADHERENCE (Weight: 30%)

**Checklist:**

**Function Signatures:**
- [ ] `handlePlaybackError(error: Error, songId: string): PlaybackError` matches exactly
- [ ] `getErrorMessage(errorType: ErrorType): string` matches exactly
- [ ] `logError(error: Error, context?: string): void` matches exactly (context is optional)
- [ ] All three functions are exported
- [ ] Functions are standalone (no class wrapper)

**Import Dependencies:**
- [ ] Imports `ErrorType` from `@types/playback-error`
- [ ] Imports `PlaybackError` from `@types/playback-error`
- [ ] No other dependencies needed

**Implementation Approach:**
- [ ] Pure functions (except logError which has side effect)
- [ ] Defensive programming (never throws exceptions)
- [ ] Returns safe defaults on errors

**Score:** __/10

**Observations:**
- Are all three functions present with correct signatures?
- Are imports correct?
- Is error handling defensive?

---

### 2. CODE QUALITY (Weight: 25%)

**Metrics Analysis:**

**Complexity:**
- [ ] **handlePlaybackError:** Moderate (5-8 cyclomatic complexity)
  - Type detection logic (MediaError vs generic Error)
  - Error code mapping
  - Message keyword matching
  - Reasonable branching
- [ ] **getErrorMessage:** Low (4-5 cyclomatic complexity)
  - Switch statement or object lookup
  - One branch per error type
  - Default case
- [ ] **logError:** Low (2-3 cyclomatic complexity)
  - Environment check
  - Console availability check
  - Simple logging

**Performance:**
- [ ] Fast execution (<1ms)
- [ ] No expensive operations
- [ ] Minimal string operations

**Coupling:**
- [ ] Depends on PlaybackError types only
- [ ] No other module dependencies
- [ ] Self-contained error handling

**Cohesion:**
- [ ] High cohesion (all functions related to error handling)
- [ ] Single responsibility (error conversion and messaging)
- [ ] Helper functions support main function

**Code Smells:**
- [ ] Check for: Long Method (handlePlaybackError should be <50 lines)
- [ ] Check for: Code Duplication (error messages should not repeat)
- [ ] Check for: Magic Numbers (MediaError codes 1-4 are acceptable)
- [ ] Check for: Magic Strings (error keywords should be constants if reused)
- [ ] Check for: Nested Conditionals (should be manageable, <4 levels)
- [ ] Check for: Switch Statement smell (acceptable for error type mapping)

**Score:** __/10

**Detected code smells:** [List any issues found]

---

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)

**Acceptance Criteria:**

**handlePlaybackError Function:**
- [ ] **AC1:** Accepts Error and songId, returns PlaybackError
- [ ] **AC2:** Detects MediaError and maps codes to ErrorType:
  - Code 1 (MEDIA_ERR_ABORTED) → LOAD_ERROR
  - Code 2 (MEDIA_ERR_NETWORK) → NETWORK_ERROR
  - Code 3 (MEDIA_ERR_DECODE) → DECODE_ERROR
  - Code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED) → UNSUPPORTED_FORMAT
- [ ] **AC3:** Detects generic Error and parses message for keywords:
  - "network", "fetch", "connection" → NETWORK_ERROR
  - "404", "not found", "load" → LOAD_ERROR
  - "decode", "corrupt" → DECODE_ERROR
  - "format", "unsupported", "mime" → UNSUPPORTED_FORMAT
- [ ] **AC4:** Defaults to LOAD_ERROR for unknown errors
- [ ] **AC5:** Calls getErrorMessage() to get user-friendly text
- [ ] **AC6:** Calls logError() for debugging
- [ ] **AC7:** Returns valid PlaybackError object always
- [ ] **AC8:** Never throws exceptions

**getErrorMessage Function:**
- [ ] **AC9:** Returns exact messages from requirements table:
  - LOAD_ERROR: "Unable to load song. The file may have been moved or deleted."
  - DECODE_ERROR: "This audio file appears to be corrupted or incomplete."
  - NETWORK_ERROR: "Network error. Please check your internet connection."
  - UNSUPPORTED_FORMAT: "This audio format is not supported. Please use MP3, WAV, OGG, or M4A."
- [ ] **AC10:** Handles invalid ErrorType gracefully (default message)
- [ ] **AC11:** Never returns null or undefined
- [ ] **AC12:** Never throws exceptions

**logError Function:**
- [ ] **AC13:** Logs error to console in development mode only
- [ ] **AC14:** Checks `process.env.NODE_ENV !== 'production'`
- [ ] **AC15:** Includes error message, name, stack trace
- [ ] **AC16:** Includes optional context if provided
- [ ] **AC17:** Uses console.error() for output
- [ ] **AC18:** Never throws exceptions (even if console unavailable)
- [ ] **AC19:** Silently fails in production or if console unavailable

**Edge Cases Matrix:**

| Scenario | Expected Behavior | Handled? |
|----------|------------------|----------|
| MediaError with code 1 | LOAD_ERROR | [ ] |
| MediaError with code 2 | NETWORK_ERROR | [ ] |
| MediaError with code 3 | DECODE_ERROR | [ ] |
| MediaError with code 4 | UNSUPPORTED_FORMAT | [ ] |
| Error with "404" in message | LOAD_ERROR | [ ] |
| Error with "network" in message | NETWORK_ERROR | [ ] |
| Generic Error with no keywords | LOAD_ERROR (default) | [ ] |
| Null error object | Safe PlaybackError returned | [ ] |
| Undefined songId | Uses "unknown" | [ ] |
| Invalid ErrorType in getErrorMessage | Default message | [ ] |
| Production mode + logError | No logging | [ ] |

**Score:** __/10

**Unmet requirements:** [List any missing or incorrect requirements]

---

### 4. MAINTAINABILITY (Weight: 10%)

**Documentation Quality:**

**Module-level JSDoc:**
- [ ] File-level comment explaining error handling strategy
- [ ] `@module` tag

**handlePlaybackError JSDoc:**
- [ ] Description of function purpose
- [ ] Explanation of error conversion logic
- [ ] `@param error` with description (Error or MediaError)
- [ ] `@param songId` with description
- [ ] `@returns` PlaybackError structure
- [ ] `@example` showing:
  - MediaError conversion
  - Generic Error conversion
  - Fallback behavior

**getErrorMessage JSDoc:**
- [ ] Description of function purpose
- [ ] `@param errorType` with description
- [ ] `@returns` user-friendly message string
- [ ] `@example` for each error type

**logError JSDoc:**
- [ ] Description of logging behavior
- [ ] Note about development-only logging
- [ ] `@param error` with description
- [ ] `@param context` (optional) with description
- [ ] `@returns` void
- [ ] `@example` showing usage

**Code Clarity:**
- [ ] Variable names are descriptive (mediaError, errorType, userMessage)
- [ ] Comments explain MediaError code values
- [ ] Comments explain keyword detection logic
- [ ] Error message constants or object clearly organized

**Score:** __/10

**Issues found:**

---

### 5. BEST PRACTICES (Weight: 10%)

**SOLID Principles:**
- [ ] **Single Responsibility:** Each function has one clear purpose ✓
- [ ] **DRY:** Error messages defined once, no duplication
- [ ] **Open/Closed:** Easy to add new error types

**Defensive Programming:**
- [ ] Never throws exceptions from error handling functions
- [ ] Validates inputs (null/undefined checks)
- [ ] Provides safe defaults
- [ ] Type guards for MediaError detection
- [ ] Try-catch around logging (if needed)

**TypeScript Best Practices:**
- [ ] Explicit return types on all functions
- [ ] Explicit parameter types
- [ ] Type guards/assertions for MediaError
- [ ] No `any` types
- [ ] Proper type imports

**Error Handling Best Practices:**
- [ ] Clear separation: detection → classification → messaging
- [ ] User-friendly messages (non-technical)
- [ ] Technical details in logs only
- [ ] Consistent error structure
- [ ] Never exposes sensitive information

**Logging Best Practices:**
- [ ] Development-only (respects NODE_ENV)
- [ ] Uses console.error (not console.log)
- [ ] Includes context when available
- [ ] Includes stack trace
- [ ] Safe (doesn't throw if console unavailable)

**Code Style:**
- [ ] Follows Google TypeScript Style Guide
- [ ] Consistent formatting
- [ ] Named exports

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
- "Robust error handling implementation with proper MediaError detection and user-friendly messaging. All error types correctly mapped. Defensive programming throughout with comprehensive edge case handling."
- "Core logic correct but MediaError type checking is unsafe. Missing null checks could cause crashes. Error messages match requirements."
- "Critical: Uses wrong error messages that don't match requirements. MediaError code mapping is incorrect (code 1 mapped to NETWORK_ERROR instead of LOAD_ERROR)."

---

### Critical Issues (Blockers):

[List ONLY if score < 7/10 or requirements not met]

**Example:**
```
1. Incorrect MediaError code mapping - Lines 15-20
   - Current: Code 1 (MEDIA_ERR_ABORTED) → NETWORK_ERROR
   - Expected: Code 1 → LOAD_ERROR
   - Impact: Wrong error messages shown to users, confusing UX
   - Proposed solution: Fix mapping according to HTML5 spec:
     if (mediaError.code === 1) return ErrorType.LOAD_ERROR;

2. Missing null checks in handlePlaybackError - Line 5
   - Current: Directly accesses error properties without checking
   - Impact: Throws TypeError if error is null/undefined, crashes app
   - Proposed solution: Add guard at start:
     if (!error) return { type: ErrorType.LOAD_ERROR, message: getErrorMessage(ErrorType.LOAD_ERROR), songId: songId || 'unknown' };

3. Wrong error message for DECODE_ERROR - Line 45
   - Current: "File is corrupt"
   - Expected: "This audio file appears to be corrupted or incomplete."
   - Impact: Doesn't match requirements, inconsistent user messaging
   - Proposed solution: Use exact message from requirements table
```

---

### Minor Issues (Suggested improvements):

**Example:**
```
1. MediaError type checking is unsafe - Line 12
   - Current: if ((error as any).code)
   - Suggestion: Use proper type guard:
     function isMediaError(error: Error): error is MediaError {
       return 'code' in error && typeof (error as any).code === 'number';
     }
   - Benefit: Type-safe MediaError detection

2. Error messages hardcoded in switch - Lines 40-55
   - Suggestion: Extract to constant object:
     const ERROR_MESSAGES = {
       [ErrorType.LOAD_ERROR]: "Unable to load...",
       // ...
     };
   - Benefit: Easier to maintain, centralized messages

3. logError doesn't check console availability - Line 65
   - Suggestion: Add check:
     if (typeof console !== 'undefined' && console.error) {
       console.error(...);
     }
   - Benefit: Safer in edge case environments

4. Missing JSDoc examples - All functions
   - Suggestion: Add @example tags showing real usage scenarios
   - Benefit: Clear documentation for future developers

5. process.env.NODE_ENV check could use import.meta.env - Line 62
   - Current: process.env.NODE_ENV (Node.js convention)
   - Suggestion: import.meta.env.DEV (Vite convention)
   - Benefit: More consistent with Vite build tool
```

---

### Positive Aspects:

[Highlight 2-3 strengths. Examples:]
- ✅ All three required functions implemented
- ✅ Comprehensive MediaError code detection
- ✅ User-friendly error messages match requirements exactly
- ✅ Defensive programming throughout (no thrown exceptions)
- ✅ Development-only logging respects environment
- ✅ Fallback to LOAD_ERROR for unknown errors
- ✅ Calls logError for debugging support
- ✅ Clean separation of concerns (detection, mapping, messaging)
- ✅ Proper TypeScript typing

---

### Recommended Refactorings:

**REFACTORING 1: Add MediaError type guard**

```typescript
// BEFORE (unsafe type casting)
export function handlePlaybackError(error: Error, songId: string): PlaybackError {
  if ((error as any).code) {
    const mediaError = error as any;
    // ...
  }
}

// AFTER (type-safe guard)
interface MediaError extends Error {
  code: number;
  MEDIA_ERR_ABORTED: 1;
  MEDIA_ERR_NETWORK: 2;
  MEDIA_ERR_DECODE: 3;
  MEDIA_ERR_SRC_NOT_SUPPORTED: 4;
}

function isMediaError(error: Error): error is MediaError {
  return 'code' in error && typeof (error as any).code === 'number';
}

export function handlePlaybackError(error: Error, songId: string): PlaybackError {
  // Defensive: Handle null/undefined
  if (!error) {
    return {
      type: ErrorType.LOAD_ERROR,
      message: getErrorMessage(ErrorType.LOAD_ERROR),
      songId: songId || 'unknown'
    };
  }
  
  // Check if MediaError using type guard
  if (isMediaError(error)) {
    const errorType = mapMediaErrorCode(error.code);
    // ...
  }
  
  // Generic error handling
  // ...
}
```

**Reason:** Type-safe MediaError detection, prevents unsafe type casting, handles null/undefined errors.

---

**REFACTORING 2: Extract MediaError code mapping**

```typescript
// BEFORE (inline mapping)
export function handlePlaybackError(error: Error, songId: string): PlaybackError {
  if (isMediaError(error)) {
    let errorType: ErrorType;
    if (error.code === 1) errorType = ErrorType.LOAD_ERROR;
    else if (error.code === 2) errorType = ErrorType.NETWORK_ERROR;
    else if (error.code === 3) errorType = ErrorType.DECODE_ERROR;
    else if (error.code === 4) errorType = ErrorType.UNSUPPORTED_FORMAT;
    else errorType = ErrorType.LOAD_ERROR;
    // ...
  }
}

// AFTER (extracted function)
/**
 * Maps HTML5 MediaError code to ErrorType.
 */
function mapMediaErrorCode(code: number): ErrorType {
  switch (code) {
    case 1: // MEDIA_ERR_ABORTED
      return ErrorType.LOAD_ERROR;
    case 2: // MEDIA_ERR_NETWORK
      return ErrorType.NETWORK_ERROR;
    case 3: // MEDIA_ERR_DECODE
      return ErrorType.DECODE_ERROR;
    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
      return ErrorType.UNSUPPORTED_FORMAT;
    default:
      return ErrorType.LOAD_ERROR; // Fallback
  }
}

export function handlePlaybackError(error: Error, songId: string): PlaybackError {
  if (!error) {
    return createPlaybackError(ErrorType.LOAD_ERROR, songId);
  }
  
  if (isMediaError(error)) {
    const errorType = mapMediaErrorCode(error.code);
    logError(error, `MediaError code ${error.code} for song ${songId}`);
    return createPlaybackError(errorType, songId);
  }
  
  // Generic error: parse message for keywords
  const errorType = detectErrorTypeFromMessage(error.message);
  logError(error, `Generic error for song ${songId}`);
  return createPlaybackError(errorType, songId);
}

/**
 * Helper to create PlaybackError object.
 */
function createPlaybackError(type: ErrorType, songId: string): PlaybackError {
  return {
    type,
    message: getErrorMessage(type),
    songId: songId || 'unknown'
  };
}
```

**Reason:** Cleaner separation of concerns, easier to test, more maintainable, self-documenting.

---

**REFACTORING 3: Extract error messages to constant**

```typescript
// BEFORE (hardcoded in function)
export function getErrorMessage(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.LOAD_ERROR:
      return "Unable to load song. The file may have been moved or deleted.";
    case ErrorType.DECODE_ERROR:
      return "This audio file appears to be corrupted or incomplete.";
    case ErrorType.NETWORK_ERROR:
      return "Network error. Please check your internet connection.";
    case ErrorType.UNSUPPORTED_FORMAT:
      return "This audio format is not supported. Please use MP3, WAV, OGG, or M4A.";
    default:
      return "An error occurred while playing the song.";
  }
}

// AFTER (centralized constants)
/**
 * User-friendly error messages for each error type.
 * Messages are non-technical and provide actionable guidance.
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.LOAD_ERROR]: 
    "Unable to load song. The file may have been moved or deleted.",
  [ErrorType.DECODE_ERROR]: 
    "This audio file appears to be corrupted or incomplete.",
  [ErrorType.NETWORK_ERROR]: 
    "Network error. Please check your internet connection.",
  [ErrorType.UNSUPPORTED_FORMAT]: 
    "This audio format is not supported. Please use MP3, WAV, OGG, or M4A."
};

const DEFAULT_ERROR_MESSAGE = "An error occurred while playing the song.";

export function getErrorMessage(errorType: ErrorType): string {
  return ERROR_MESSAGES[errorType] || DEFAULT_ERROR_MESSAGE;
}
```

**Reason:** Centralized messages, easier to update/localize, cleaner function, type-safe with Record type.

---

**REFACTORING 4: Improve logError with better formatting**

```typescript
// BEFORE (basic logging)
export function logError(error: Error, context?: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(context || 'Error:', error);
  }
}

// AFTER (comprehensive logging)
export function logError(error: Error, context?: string): void {
  // Only log in development
  if (import.meta.env.PROD) {
    return;
  }
  
  // Check console availability (edge case)
  if (typeof console === 'undefined' || !console.error) {
    return;
  }
  
  // Format log message
  const prefix = context ? `[${context}]` : '[Playback Error]';
  
  console.error(prefix, {
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    // Include MediaError code if applicable
    ...(isMediaError(error) && { mediaErrorCode: error.code })
  });
}
```

**Reason:** Better log formatting, includes more context, safer with console check, uses Vite's import.meta.env.

---

### Decision:

**Select ONE:**

- [ ] ✅ **APPROVED** - Ready for integration
  - All criteria met (score ≥ 8.5/10)
  - All error types correctly mapped
  - Error messages match requirements exactly
  - Defensive programming throughout
  - No critical issues

- [ ] ⚠️ **APPROVED WITH RESERVATIONS** - Functional but needs minor improvements
  - Core functionality correct (score 7.0-8.4/10)
  - Minor issues: unsafe type casting, could improve logging
  - Can proceed but improvements should be addressed

- [ ] ❌ **REJECTED** - Requires corrections before continuing
  - Critical issues: incorrect error mapping, missing null checks
  - Wrong error messages
  - Must fix before useAudioPlayer can use this

---

## ADDITIONAL NOTES FOR REVIEWER

**Context for Review:**
- This is critical for error handling throughout the app
- useAudioPlayer hook depends on this to convert browser errors
- Error messages are displayed directly to users (UX critical)
- Must never throw exceptions (defensive programming essential)

**Dependencies:**
- Depends on: PlaybackError and ErrorType types
- Used by: useAudioPlayer hook, potentially Player component

**What to Look For:**
- **Correct MediaError code mapping** (1→LOAD, 2→NETWORK, 3→DECODE, 4→UNSUPPORTED)
- **Exact error messages** from requirements table
- **Defensive programming** (no thrown exceptions, null checks)
- **Type safety** (proper MediaError detection)
- **Development-only logging** (respects environment)

**Common Mistakes to Watch For:**
- Wrong MediaError code mapping (most common error)
- Error messages don't match requirements exactly
- Missing null/undefined checks (throws TypeError)
- Unsafe type casting without guards
- logError runs in production (performance/security issue)
- Throws exceptions from error handling functions (defeats purpose)
- Uses wrong default error type

**Testing Checklist:**
```typescript
// Test MediaError code mapping
const mediaError = new Error() as any;
mediaError.code = 1;
const result = handlePlaybackError(mediaError, 'test-song');
console.assert(result.type === ErrorType.LOAD_ERROR, "MediaError code 1");

// Test generic error detection
const networkError = new Error('Network fetch failed');
const result2 = handlePlaybackError(networkError, 'test-song');
console.assert(result2.type === ErrorType.NETWORK_ERROR, "Network keyword detection");

// Test null safety
const result3 = handlePlaybackError(null as any, 'test-song');
console.assert(result3.type === ErrorType.LOAD_ERROR, "Null error handling");

// Test all error messages
console.assert(
  getErrorMessage(ErrorType.LOAD_ERROR) === 
  "Unable to load song. The file may have been moved or deleted.",
  "LOAD_ERROR message"
);
// ... test all four messages

// Test logError doesn't throw
logError(new Error('test'), 'test context'); // Should not throw
```

**MediaError Code Reference:**
```typescript
// HTML5 MediaError codes for reference
interface MediaError {
  code: 1 | 2 | 3 | 4;
  MEDIA_ERR_ABORTED: 1;      // → LOAD_ERROR
  MEDIA_ERR_NETWORK: 2;       // → NETWORK_ERROR
  MEDIA_ERR_DECODE: 3;        // → DECODE_ERROR
  MEDIA_ERR_SRC_NOT_SUPPORTED: 4;  // → UNSUPPORTED_FORMAT
}
```
