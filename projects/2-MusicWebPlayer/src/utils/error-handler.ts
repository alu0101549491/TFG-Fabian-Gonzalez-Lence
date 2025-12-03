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
