/**
 * Enumeration of possible playback error types.
 * @enum {string}
 * @category Types
 */
export enum ErrorType {
  /** Error loading the audio file */
  LOAD_ERROR = 'LOAD_ERROR',
  
  /** Error decoding the audio data */
  DECODE_ERROR = 'DECODE_ERROR',
  
  /** Network error while fetching audio */
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  /** Audio format not supported by the browser */
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
}

/**
 * Represents a playback error with contextual information.
 * @category Types
 */
export interface PlaybackError {
  /** Type of error that occurred */
  type: ErrorType;
  
  /** Human-readable error message */
  message: string;
  
  /** ID of the song that caused the error */
  songId: string;
}