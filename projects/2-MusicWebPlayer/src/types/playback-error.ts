/**
 * @module Types/PlaybackError
 * @category Types
 * @description
 * This module defines the error types and structure for audio playback errors in the Music Web Player.
 * It provides a standardized way to represent and handle errors that occur during audio loading and playback.
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
 * Represents a playback error with contextual information.
 * This interface standardizes error reporting for audio playback failures,
 * providing both machine-readable error types and user-friendly messages.
 *
 * @category Types
 */
export interface PlaybackError {
  /**
   * The category of error that occurred.
   * @property {ErrorType} type
   * @example ErrorType.LOAD_ERROR
   */
  type: ErrorType;

  /**
   * Human-readable error message to display to the user.
   * @property {string} message
   * @example "Unable to load song. The file may have been moved or deleted."
   * @remarks Should be user-friendly, concise, and actionable.
   */
  message: string;

  /**
   * Unique identifier of the song that caused the error.
   * @property {string} songId
   * @example "550e8400-e29b-41d4-a716-446655440000"
   * @remarks Allows tracking which song failed, enables retry or skip functionality.
   */
  songId: string;

  /**
   * When the error occurred (timestamp in milliseconds since epoch).
   * @property {number} [timestamp]
   * @example Date.now()
   * @optional
   */
  timestamp?: number;

  /**
   * Original JavaScript Error object for debugging purposes.
   * @property {Error} [originalError]
   * @optional
   */
  originalError?: Error;
}
