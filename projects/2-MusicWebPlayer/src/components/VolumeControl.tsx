// src/components/VolumeControl.tsx
/**
 * @module Components/VolumeControl
 * @category Components
 * @description
 * This component provides a volume control slider with mute functionality.
 */

import React from 'react';
import styles from '@styles/VolumeControl.module.css';

/**
 * Props for the VolumeControl component.
 * @category Components
 */
interface VolumeControlProps {
  /**
   * Current volume level (0-100)
   */
  volume: number;

  /**
   * Whether audio is muted
   */
  isMuted: boolean;

  /**
   * Callback when volume changes
   * @param volume - New volume level (0-100)
   */
  onVolumeChange: (volume: number) => void;

  /**
   * Callback when mute button clicked
   */
  onToggleMute: () => void;
}

/**
 * Component that provides volume control functionality.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const VolumeControl: React.FC<VolumeControlProps> = (props) => {
  /**
   * Gets the appropriate volume icon based on current volume and mute state.
   * @returns Volume icon string
   */
  const getVolumeIcon = (): string => {
    if (props.isMuted || props.volume === 0) return '🔇';
    if (props.volume <= 33) return '🔈';
    if (props.volume <= 66) return '🔉';
    return '🔊';
  };

  /**
   * Handles keyboard events for volume control.
   * @param event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    const volumeChange = 5; // Percentage to change per key press

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        props.onVolumeChange(Math.min(100, props.volume + volumeChange));
        break;
      case 'ArrowDown':
        event.preventDefault();
        props.onVolumeChange(Math.max(0, props.volume - volumeChange));
        break;
      case 'Home':
        event.preventDefault();
        props.onVolumeChange(0);
        break;
      case 'End':
        event.preventDefault();
        props.onVolumeChange(100);
        break;
    }
  };

  return (
    <div className={styles['volume-control']}>
      <button
        className={styles['volume-control__mute-button']}
        onClick={props.onToggleMute}
        aria-label={props.isMuted ? "Unmute" : "Mute"}
        aria-pressed={props.isMuted}
      >
        {getVolumeIcon()}
      </button>

      <input
        type="range"
        min="0"
        max="100"
        value={props.isMuted ? 0 : props.volume}
        onChange={(e) => props.onVolumeChange(Number(e.target.value))}
        className={styles['volume-control__slider']}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={props.isMuted ? 0 : props.volume}
        role="slider"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      />

      <span className={styles['volume-control__percentage']}>
        {props.isMuted ? 0 : props.volume}%
      </span>
    </div>
  );
};
