/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/components/Controls.tsx
 * @desc Component that renders playback control buttons including play/pause, next, previous, repeat, and shuffle.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

import React from 'react';
import { RepeatMode } from '../types/playback-modes';
import styles from '@styles/Controls.module.css';

/**
 * Props for the Controls component.
 * @category Components
 */
export interface ControlsProps {
  /**
   * Whether audio is currently playing
   * Determines if Play or Pause icon is shown
   */
  isPlaying: boolean;

  /**
   * Callback function when Play/Pause button is clicked
   */
  onPlayPause: () => void;

  /**
   * Callback function when Next button is clicked
   */
  onNext: () => void;

  /**
   * Callback function when Previous button is clicked
   */
  onPrevious: () => void;

  /**
   * Whether the Next button should be disabled
   * @default false
   */
  disableNext?: boolean;

  /**
   * Whether the Previous button should be disabled
   * @default false
   */
  disablePrevious?: boolean;

  /**
   * Current repeat mode
   */
  repeatMode: RepeatMode;

  /**
   * Whether shuffle is enabled
   */
  isShuffled: boolean;

  /**
   * Callback function when repeat mode is toggled
   */
  onRepeatToggle: () => void;

  /**
   * Callback function when shuffle is toggled
   */
  onShuffleToggle: () => void;
}

/**
 * Component that renders playback control buttons.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Controls: React.FC<ControlsProps> = (props) => {
  // Default values for optional props
  const {
    disableNext = false,
    disablePrevious = false,
  } = props;

  // Unicode symbols for icons
  const PlayIcon = '▶';    // U+25B6
  const PauseIcon = '❚❚';  // U+275A x2
  const PreviousIcon = '◄'; // U+25C4
  const NextIcon = '►';     // U+25BA
  const ShuffleIcon = '🔀';  // U+1F500
  const RepeatIcon = '🔁';  // U+1F501
  const RepeatOneIcon = '🔂'; // U+1F502

  return (
    <div className={styles.controls}>
      {/* Previous button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--previous']}`}
        onClick={props.onPrevious}
        disabled={disablePrevious}
        aria-label="Previous song"
      >
        {PreviousIcon}
      </button>

      {/* Play/Pause button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--play-pause']}`}
        onClick={props.onPlayPause}
        aria-label={props.isPlaying ? "Pause" : "Play"}
      >
        {props.isPlaying ? PauseIcon : PlayIcon}
      </button>

      {/* Next button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--next']}`}
        onClick={props.onNext}
        disabled={disableNext}
        aria-label="Next song"
      >
        {NextIcon}
      </button>

      {/* Shuffle button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--shuffle']} ${
          props.isShuffled ? styles['controls__button--active'] : ''
        }`}
        onClick={props.onShuffleToggle}
        aria-label={props.isShuffled ? "Disable shuffle" : "Enable shuffle"}
        aria-pressed={props.isShuffled}
        title="Shuffle"
      >
        {ShuffleIcon}
      </button>

      {/* Repeat button */}
      <button
        type="button"
        className={`${styles.controls__button} ${styles['controls__button--repeat']} ${
          props.repeatMode !== RepeatMode.OFF ? styles['controls__button--active'] : ''
        }`}
        onClick={props.onRepeatToggle}
        aria-label={`Repeat: ${props.repeatMode}`}
        aria-pressed={props.repeatMode !== RepeatMode.OFF}
        title={`Repeat: ${props.repeatMode}`}
      >
        {props.repeatMode === RepeatMode.ONE ? RepeatOneIcon : RepeatIcon}
      </button>
    </div>
  );
};
