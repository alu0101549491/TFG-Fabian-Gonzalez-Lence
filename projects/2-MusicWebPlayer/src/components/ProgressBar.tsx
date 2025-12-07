/**
 * @module Components/ProgressBar
 * @category Components
 * @description
 * This component displays the playback progress bar with time indicators
 * and allows users to seek to specific positions in the audio.
 */

import React from 'react';
import { TimeFormatter } from '@utils/time-formatter';

/**
 * Props for the ProgressBar component.
 * @category Components
 */
export interface ProgressBarProps {
  /**
   * Current playback position in seconds
   * @example 45.5
   */
  currentTime: number;

  /**
   * Total duration of the song in seconds
   * @example 180
   */
  duration: number;

  /**
   * Callback function when user clicks progress bar to seek
   * @param time - Time in seconds to seek to
   */
  onSeek: (time: number) => void;
}

/**
 * Component that displays and controls playback progress.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  /**
   * Calculates the progress percentage for the fill bar.
   * @returns Percentage value between 0 and 100
   */
  const calculateProgressPercentage = (): number => {
    if (props.duration <= 0) return 0;
    const percentage = (props.currentTime / props.duration) * 100;
    return Math.max(0, Math.min(percentage, 100));
  };

  /**
   * Calculates the time position from click coordinates.
   * @param event Mouse click event
   * @returns Time in seconds to seek to
   */
  const calculateClickPosition = (event: React.MouseEvent<HTMLDivElement>): number => {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(clickX / rect.width, 1));
    return percentage * props.duration;
  };

  /**
   * Handles click on progress bar to seek to new position.
   * @param event Mouse click event
   */
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (props.duration <= 0) return;
    const time = calculateClickPosition(event);
    props.onSeek(time);
  };

  /**
   * Handles keyboard navigation for accessibility.
   * @param event Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const skipAmount = 5; // seconds

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        props.onSeek(Math.min(props.currentTime + skipAmount, props.duration));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        props.onSeek(Math.max(props.currentTime - skipAmount, 0));
        break;
      case 'Home':
        event.preventDefault();
        props.onSeek(0);
        break;
      case 'End':
        event.preventDefault();
        props.onSeek(props.duration);
        break;
    }
  };

  // Format time values for display
  const currentTimeFormatted = TimeFormatter.formatTime(props.currentTime);
  const durationFormatted = TimeFormatter.formatTime(props.duration);
  const progressPercentage = calculateProgressPercentage();

  return (
    <div className="progress-bar">
      <span className="progress-bar__time progress-bar__time--current">
        {currentTimeFormatted}
      </span>

      <div
        className="progress-bar__container"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={props.duration}
        aria-valuenow={props.currentTime}
        aria-label="Playback progress"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className="progress-bar__fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <span className="progress-bar__time progress-bar__time--total">
        {durationFormatted}
      </span>
    </div>
  );
};
