// src/types/playback-modes.ts
/**
 * @module Types/PlaybackModes
 * @description
 * Type definitions for playback modes (repeat, shuffle) and volume control.
 */

/**
 * Repeat mode options for playlist playback
 */
export enum RepeatMode {
  /** No repeat - stop at end of playlist */
  OFF = 'off',

  /** Repeat entire playlist - loop back to start */
  ALL = 'all',

  /** Repeat current song - loop single track */
  ONE = 'one'
}

/**
 * Playback configuration state
 */
export interface PlaybackModes {
  /** Current repeat mode */
  repeat: RepeatMode;

  /** Whether shuffle is enabled */
  shuffle: boolean;

  /** Current volume level (0-100) */
  volume: number;

  /** Whether audio is muted */
  isMuted: boolean;
}
