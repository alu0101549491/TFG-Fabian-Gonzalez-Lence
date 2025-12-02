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