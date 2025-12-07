/**
 * @module Components/Controls
 * @category Components
 * @description
 * This component renders the playback control buttons for the music player.
 * It provides Previous, Play/Pause, and Next buttons with proper accessibility,
 * visual feedback, and responsive design.
 */

import React from 'react';

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

  // Unicode symbols for icons (could be replaced with React Icons)
  const PlayIcon = '▶';    // U+25B6
  const PauseIcon = '❚❚';  // U+275A x2
  const PreviousIcon = '◄'; // U+25C4
  const NextIcon = '►';     // U+25BA

  return (
    <div className="controls">
      <button
        type="button"
        className="controls__button controls__button--previous"
        onClick={props.onPrevious}
        disabled={disablePrevious}
        aria-label="Previous song"
      >
        {PreviousIcon}
      </button>

      <button
        type="button"
        className="controls__button controls__button--play-pause"
        onClick={props.onPlayPause}
        aria-label={props.isPlaying ? "Pause" : "Play"}
      >
        {props.isPlaying ? PauseIcon : PlayIcon}
      </button>

      <button
        type="button"
        className="controls__button controls__button--next"
        onClick={props.onNext}
        disabled={disableNext}
        aria-label="Next song"
      >
        {NextIcon}
      </button>
    </div>
  );
};