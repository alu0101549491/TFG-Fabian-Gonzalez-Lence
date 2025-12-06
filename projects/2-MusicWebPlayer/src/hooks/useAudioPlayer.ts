/**
 * @module Hooks/useAudioPlayer
 * @category Hooks
 * @description
 * This module provides a custom React hook for managing HTML5 audio playback.
 * It encapsulates all audio playback logic, event handling, and state management
 * for the music player application.
 */

import { useState, useEffect, RefObject } from 'react';
import { PlaybackError } from '@types/playback-error';
import { ErrorHandler } from '@utils/error-handler';

/**
 * Interface for the useAudioPlayer hook return value.
 * @category Hooks
 */
export interface AudioPlayerHook {
  /** Whether audio is currently playing */
  isPlaying: boolean;

  /** Current playback time in seconds */
  currentTime: number;

  /** Total duration of the audio in seconds */
  duration: number;

  /** Current playback error, if any */
  error: string | null;

  /** Function to start playback */
  play: () => Promise<void>;

  /** Function to pause playback */
  pause: () => void;

  /** Function to seek to a specific time */
  seek: (time: number) => void;

  /** Function to set the audio source */
  setSource: (url: string, songId?: string) => void;
}

/**
 * Custom hook for managing HTML5 Audio element state and controls.
 * @param audioRef Reference to the audio HTML element
 * @returns Hook interface with playback state and controls
 * @category Hooks
 */
export function useAudioPlayer(
  audioRef: RefObject<HTMLAudioElement>
): AudioPlayerHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentSongId, setCurrentSongId] = useState<string | undefined>(undefined);

  /**
   * Starts or resumes audio playback.
   * @returns Promise that resolves when playback starts
   */
  const play = async (): Promise<void> => {
    if (!audioRef.current) {
      setError('Audio element not available');
      return Promise.reject(new Error('Audio element not available'));
    }

    try {
      // Attempt to play the audio
      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      console.error('Play failed:', err);
      setIsPlaying(false);
      setError('Unable to play audio. Please try again.');
      return Promise.reject(err);
    }
  };

  /**
   * Pauses audio playback.
   */
  const pause = (): void => {
    if (!audioRef.current) return;

    try {
      audioRef.current.pause();
      setIsPlaying(false);
    } catch (err) {
      console.error('Pause failed:', err);
      setError('Unable to pause audio.');
    }
  };

  /**
   * Jumps to specific position in audio.
   * @param time Time in seconds to seek to
   */
  const seek = (time: number): void => {
    if (!audioRef.current) return;

    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
    audioRef.current.currentTime = clampedTime;
  };

  /**
   * Loads a new audio file.
   * @param url URL or path to audio file
   * @param songId Optional ID of the song for error handling
   */
  const setSource = (url: string, songId?: string): void => {
    if (!audioRef.current) return;

    // Reset state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
    setCurrentSongId(songId);

    // Set new source
    audioRef.current.src = url;
    audioRef.current.load(); // Explicitly load the new source
  };

  /**
   * Updates currentTime state as audio plays.
   */
  const handleTimeUpdate = (): void => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  /**
   * Sets duration when audio metadata loads.
   */
  const handleLoadedMetadata = (): void => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  /**
   * Handles when song finishes playing.
   */
  const handleEnded = (): void => {
    setIsPlaying(false);
  };

  /**
   * Handles audio playback errors.
   */
  const handleError = (): void => {
    if (!audioRef.current?.error) return;

    const mediaError = audioRef.current.error;
    const playbackError = ErrorHandler.handlePlaybackError(
      new Error(mediaError.message),
      currentSongId || 'unknown'
    );

    setError(playbackError.message);
    setIsPlaying(false);
  };

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioRef]);

  return {
    isPlaying,
    currentTime,
    duration,
    error,
    play,
    pause,
    seek,
    setSource,
  };
}
