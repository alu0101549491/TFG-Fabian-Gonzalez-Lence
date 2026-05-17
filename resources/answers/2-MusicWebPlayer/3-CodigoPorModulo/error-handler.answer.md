# Respuesta

### Respuesta {toggle="true"}
```markdown
Here's the complete implementation for `src/utils/error-handler.ts` according to your requirements:

```typescript
/**
 * @module Utilities/ErrorHandler
 * @category Utilities
 * @description
 * This module provides utility functions for handling and formatting playback errors
 * in the Music Web Player application. It converts native errors into domain-specific
 * PlaybackError objects and provides user-friendly error messages.
 */

import { ErrorType, PlaybackError } from '@types/playback-error';

// MediaError code constants for readability
const MEDIA_ERR_ABORTED = 1;
const MEDIA_ERR_NETWORK = 2;
const MEDIA_ERR_DECODE = 3;
const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

// Error message constants
const ERROR_MESSAGES = {
  [ErrorType.LOAD_ERROR]: "Unable to load song. The file may have been moved or deleted.",
  [ErrorType.DECODE_ERROR]: "This audio file appears to be corrupted or incomplete.",
  [ErrorType.NETWORK_ERROR]: "Network error. Please check your internet connection.",
  [ErrorType.UNSUPPORTED_FORMAT]: "This audio format is not supported. Please use MP3, WAV, OGG, or M4A.",
  DEFAULT: "An error occurred while playing this song.",
};

/**
 * Utility class for handling and formatting playback errors.
 * All methods are static and designed to be safe to call with any input.
 */
export class ErrorHandler {
  /**
   * Converts a native JavaScript Error or MediaError into a structured PlaybackError.
   * @param error - The native error object from audio element
   * @param songId - The ID of the song that caused the error
   * @returns Structured PlaybackError object
   * @example
   * // Network error
   * ErrorHandler.handlePlaybackError(new Error("Failed to fetch"), "123");
   * // Returns: { type: ErrorType.NETWORK_ERROR, message: "Network error...", songId: "123" }
   */
  public static handlePlaybackError(error: Error, songId: string = "unknown"): PlaybackError {
    // Handle null/undefined error
    if (!error) {
      return {
        type: ErrorType.LOAD_ERROR,
        message: ERROR_MESSAGES.DEFAULT,
        songId,
        originalError: error,
      };
    }

    // Log the error for debugging
    this.logError(error, `Song ID: ${songId}`);

    // Check if this is a MediaError (has code property)
    const mediaError = error as MediaError;
    if (typeof mediaError.code === 'number') {
      return this.handleMediaError(mediaError, songId);
    }

    // Handle generic Error by parsing message
    return this.handleGenericError(error, songId);
  }

  /**
   * Returns a user-friendly error message for a given error type.
   * @param errorType - The type of error that occurred
   * @returns User-friendly error message
   * @example
   * ErrorHandler.getErrorMessage(ErrorType.LOAD_ERROR);
   * // Returns: "Unable to load song. The file may have been moved or deleted."
   */
  public static getErrorMessage(errorType: ErrorType): string {
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.DEFAULT;
  }

  /**
   * Logs error details to console for debugging (development mode only).
   * @param error - The error object to log
   * @param context - Additional context about where/when error occurred
   */
  public static logError(error: Error, context?: string): void {
    // Only log in development mode
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const contextStr = context ? `[${context}] ` : '';
      const errorName = error.name || 'Error';
      const errorMessage = error.message || 'Unknown error';

      console.error(
        `${timestamp} ${contextStr}${errorName}: ${errorMessage}`,
        error
      );
    } catch (e) {
      // If logging fails, silently continue
      console.error('Failed to log error:', e);
    }
  }

  /**
   * Handles MediaError objects with code property.
   * @param error - MediaError object
   * @param songId - Song ID
   * @returns PlaybackError object
   * @private
   */
  private static handleMediaError(error: MediaError, songId: string): PlaybackError {
    let errorType: ErrorType;

    switch (error.code) {
      case MEDIA_ERR_ABORTED:
        errorType = ErrorType.LOAD_ERROR;
        break;
      case MEDIA_ERR_NETWORK:
        errorType = ErrorType.NETWORK_ERROR;
        break;
      case MEDIA_ERR_DECODE:
        errorType = ErrorType.DECODE_ERROR;
        break;
      case MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorType = ErrorType.UNSUPPORTED_FORMAT;
        break;
      default:
        errorType = ErrorType.LOAD_ERROR;
    }

    return {
      type: errorType,
      message: this.getErrorMessage(errorType),
      songId,
      originalError: error,
    };
  }

  /**
   * Handles generic Error objects by parsing message for keywords.
   * @param error - Generic Error object
   * @param songId - Song ID
   * @returns PlaybackError object
   * @private
   */
  private static handleGenericError(error: Error, songId: string): PlaybackError {
    const message = error.message?.toLowerCase() || '';
    let errorType: ErrorType;

    // Detect error type based on message keywords
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      errorType = ErrorType.NETWORK_ERROR;
    } else if (message.includes('404') || message.includes('not found') || message.includes('load')) {
      errorType = ErrorType.LOAD_ERROR;
    } else if (message.includes('decode') || message.includes('corrupt')) {
      errorType = ErrorType.DECODE_ERROR;
    } else if (message.includes('format') || message.includes('unsupported') || message.includes('mime')) {
      errorType = ErrorType.UNSUPPORTED_FORMAT;
    } else {
      errorType = ErrorType.LOAD_ERROR; // Default fallback
    }

    return {
      type: errorType,
      message: this.getErrorMessage(errorType),
      songId,
      originalError: error,
    };
  }
}

// Type declaration for MediaError (not all browsers have this in TypeScript)
interface MediaError extends Error {
  code: number;
}
```

---

### Design Decisions Made:

1. **Error Type Detection from Generic Errors**:
   - **Decision**: Parse error message for keywords to determine error type.
   - **Justification**: This provides reasonable error classification when MediaError codes aren't available. The keyword matching covers common error scenarios.

2. **Default Error Type**:
   - **Decision**: Fall back to `LOAD_ERROR` for unknown errors.
   - **Justification**: Loading errors are the most common and provide a reasonable default when the specific error type can't be determined.

3. **Stack Traces in PlaybackError**:
   - **Decision**: Include original error in PlaybackError but don't expose stack traces to users.
   - **Justification**: Stack traces are useful for debugging but shouldn't be shown to end users. They're available in the originalError property.

4. **Logging Strategy**:
   - **Decision**: Only log in development mode, using console.error.
   - **Justification**: This prevents cluttering production logs while still providing debugging information during development.

5. **Error Message Tone**:
   - **Decision**: Use clear, non-technical, actionable messages.
   - **Justification**: This aligns with NFR12 (clear user feedback) and provides a better user experience.

6. **MediaError Type Detection**:
   - **Decision**: Use type assertion and check for code property.
   - **Justification**: This is the most reliable way to detect MediaError across browsers, as not all TypeScript environments include MediaError by default.

---

### Error Type Detection Strategy:

1. **MediaError Handling**:
   - Check for the presence of a numeric `code` property to identify MediaError.
   - Map MediaError codes to ErrorType enum values using a switch statement.
   - This handles the standard HTML5 audio error codes directly.

2. **Generic Error Handling**:
   - Parse the error message for keywords that indicate specific error types.
   - Use case-insensitive matching to catch variations in error messages.
   - Provide a fallback to LOAD_ERROR for unknown error messages.

3. **Defensive Programming**:
   - Check for null/undefined errors and provide safe defaults.
   - Handle missing songId by using "unknown".
   - Wrap console logging in try-catch to prevent errors from logging itself.

---

### Edge Cases Handled:

**handlePlaybackError:**
- Null/undefined error → Create generic PlaybackError with DEFAULT message
- MediaError with code → Map code to appropriate ErrorType
- Generic Error → Parse message for keywords to determine ErrorType
- Unknown error type → Default to LOAD_ERROR
- Missing songId → Use "unknown" as default
- Error without message → Use generic message

**getErrorMessage:**
- Invalid ErrorType value → Return DEFAULT message
- Undefined/null errorType → Return DEFAULT message

**logError:**
- Console unavailable → Silently fail (wrapped in try-catch)
- Production mode → Skip logging entirely
- Error while logging → Catch and handle silently
- Circular references → Handled by console.error implementation

---

### Possible Future Improvements:

1. **Error Analytics/Tracking**:
   - Integrate with error monitoring services (Sentry, etc.) to track errors in production.
   - Add error IDs for correlation across client and server logs.

2. **Error Recovery Strategies**:
   - Add retry logic for certain error types (e.g., NETWORK_ERROR).
   - Implement automatic fallback to next song after repeated errors.

3. **Localization Support**:
   - Replace hardcoded messages with localization keys.
   - Support multiple languages for error messages.

4. **Error Aggregation**:
   - Track multiple errors for the same song to detect persistent issues.
   - Implement rate limiting for error reporting.

5. **User Action Suggestions**:
   - Enhance error messages with specific recovery actions (e.g., "Try refreshing the page").
   - Add links to help documentation for common issues.

6. **Structured Logging**:
   - Add structured logging with error IDs for better support diagnostics.
   - Include more context in logs (user agent, browser version, etc.).

7. **Enhanced Error Classification**:
   - Add more sophisticated error detection using regular expressions.
   - Incorporate additional error properties beyond just the message.

8. **Error Severity Levels**:
   - Classify errors by severity to prioritize handling and reporting.
   - Implement different UI treatments for different severity levels.
```