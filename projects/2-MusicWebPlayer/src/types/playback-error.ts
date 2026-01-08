/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/types/playback-error.ts
 * @desc Defines the error types and structure for audio playback errors in the Music Web Player.
 *       It provides a standardized way to represent and handle errors that occur during audio loading
 *       and playback.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enumeration of possible playback error types.
 * These error types categorize the different failures that can occur during audio playback.
 *
 * @enum {string}
 * @category Types
 */
export enum ErrorType {
  /**
   * Audio file failed to load (404, network timeout, server error).
   * @example Scenario: File doesn't exist, wrong URL, server unreachable
   * @example User message: "Unable to load song. Please check the file."
   * @example HTTP status codes: 404, 500, 503
   */
  LOAD_ERROR = 'LOAD_ERROR',

  /**
   * Audio file is corrupt or cannot be decoded by browser.
   * @example Scenario: File is corrupted, incomplete download, unsupported codec
   * @example User message: "This audio file appears to be corrupted."
   * @example Technical cause: Browser's Audio API decode failure
   */
  DECODE_ERROR = 'DECODE_ERROR',

  /**
   * Network connection issues during loading or playback.
   * @example Scenario: Internet disconnected, CORS issues, timeout
   * @example User message: "Network error. Please check your connection."
   * @example Technical cause: Network unavailable, fetch failed
   */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /**
   * Audio format not supported by the browser.
   * @example Scenario: Trying to play .flac, .aac, or other unsupported formats
   * @example User message: "This audio format is not supported. Please use MP3, WAV, or OGG."
   * @example Supported formats: MP3, WAV, OGG, M4A (browser-dependent)
   */
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
}

/**
 * Structured error information for audio playback failures.
 *
 * @interface PlaybackError
 * @property {ErrorType} type - Category of error that occurred
 * @property {string} message - User-friendly error message for display
 * @property {string} songId - ID of the song that failed to play
 *
 * @example
 * const error: PlaybackError = {
 *   type: ErrorType.LOAD_ERROR,
 *   message: "Unable to load song. The file may have been moved or deleted.",
 *   songId: "song-123"
 * };
 */
export interface PlaybackError {
  readonly type: ErrorType;
  readonly message: string;
  readonly songId: string;
}
