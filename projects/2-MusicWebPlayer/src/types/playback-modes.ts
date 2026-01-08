/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/types/playback-modes.ts
 * @desc Type definitions for playback modes (repeat, shuffle) and volume control.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
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
