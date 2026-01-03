/**
 * @module Hooks/useAudioPlayer
 * @category Hooks
 * @description
 * This module provides a custom React hook for managing HTML5 audio playback.
 * It encapsulates all audio playback logic, event handling, and state management
 * for the music player application.
 */

import { useState, useEffect, useCallback, RefObject } from 'react';
import { PlaybackError } from '@types/playback-error';
import { ErrorHandler } from '@utils/error-handler';
import { useLocalStorage } from './useLocalStorage';

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

  /** Current volume level (0-100) */
  volume: number;

  /** Whether audio is muted */
  isMuted: boolean;

  /** Function to start playback */
  play: () => Promise<void>;

  /** Function to pause playback */
  pause: () => void;

  /** Function to seek to a specific time */
  seek: (time: number) => void;

  /** Function to set the audio source */
  setSource: (url: string, songId?: string) => void;

  /** Function to set the volume level */
  setVolume: (volume: number) => void;

  /** Function to toggle mute state */
  toggleMute: () => void;
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

  // Volume control state
  const [volume, setVolumeState] = useLocalStorage<number>(
    'music-player-volume',
    70 // Default 70%
  );
  const [isMuted, setIsMuted] = useLocalStorage<boolean>(
    'music-player-muted',
    false
  );
  const [volumeBeforeMute, setVolumeBeforeMute] = useState<number>(70);

  /**
   * Starts or resumes audio playback.
   * @returns Promise that resolves when playback starts
   */
  const play = useCallback(async (): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) {
      setError('Audio element not available');
      return Promise.reject(new Error('Audio element not available'));
    }

    try {
      // Clear any previous error
      setError(null);

      // Attempt to play the audio
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Play failed:', err);
      setIsPlaying(false);
      setError('Unable to play audio. Please try again.');
      return Promise.reject(err);
    }
  }, [audioRef]);

  /**
   * Pauses audio playback.
   */
  const pause = useCallback((): void => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      setIsPlaying(false);
    } catch (err) {
      console.error('Pause failed:', err);
      setError('Unable to pause audio.');
    }
  }, [audioRef]);

  /**
   * Jumps to specific position in audio.
   * @param time Time in seconds to seek to
   */
  const seek = useCallback((time: number): void => {
    const audio = audioRef.current;
    if (!audio) return;

    if (typeof time !== 'number' || !Number.isFinite(time) || isNaN(time)) {
      console.error('Invalid seek time:', time);
      return;
    }

    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(time, audio.duration || 0));
    try {
      audio.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    } catch (err) {
      console.error('Seek failed:', err);
    }
  }, [audioRef]);

  /**
   * Loads a new audio file.
   * @param url URL or path to audio file
   * @param songId Optional ID of the song for error handling
   */
  const setSource = useCallback((url: string, songId?: string): void => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Reset state
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setError(null);
      setCurrentSongId(songId);

      // Set new source
      audio.src = url;
      audio.load(); // Explicitly load the new source
    } catch (err) {
      console.error('Error setting audio source:', err);
      setError('Failed to load audio file.');
    }
  }, [audioRef]);

  /**
   * Sets the volume level.
   * @param newVolume Volume level (0-100)
   */
  const setVolume = useCallback((newVolume: number): void => {
    if (typeof newVolume !== 'number' || !Number.isFinite(newVolume) || isNaN(newVolume)) {
      console.error('Invalid volume value:', newVolume);
      return;
    }

    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clampedVolume);

    const audio = audioRef.current;
    if (audio) {
      audio.volume = clampedVolume / 100; // Convert to 0-1 range
    }

    // Unmute if setting volume > 0
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [audioRef, isMuted, setVolumeState, setIsMuted]);

  /**
   * Toggles mute state.
   */
  const toggleMute = useCallback((): void => {
    const audio = audioRef.current;

    if (isMuted) {
      // Unmute - restore previous volume
      // Restore volume first so audio element volume is correct immediately
      setVolume(volumeBeforeMute);
      setIsMuted(false);
    } else {
      // Mute - save current volume and set to 0
      setVolumeBeforeMute(volume);
      setIsMuted(true);

      if (audio) {
        audio.volume = 0;
      }
    }
  }, [isMuted, volume, volumeBeforeMute, setIsMuted, setVolume, audioRef]);

  /**
   * Updates currentTime state as audio plays.
   */
  const handleTimeUpdate = useCallback((): void => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  }, [audioRef]);

  /**
   * Sets duration when audio metadata loads.
   */
  const handleLoadedMetadata = useCallback((): void => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  }, [audioRef]);

  /**
   * Handles when song finishes playing.
   */
  const handleEnded = useCallback((): void => {
    setIsPlaying(false);
  }, []);

  /**
   * Handles audio playback errors.
   */
  const handleError = useCallback((): void => {
    const mediaError = audioRef.current?.error;
    if (!mediaError) return;

    // Pass the raw MediaError to ErrorHandler for better mapping
    const playbackError = ErrorHandler.handlePlaybackError(
      mediaError as unknown as Error,
      currentSongId || 'unknown'
    );

    setError(playbackError.message);
    setIsPlaying(false);
  }, [audioRef, currentSongId]);

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
  }, [audioRef, handleTimeUpdate, handleLoadedMetadata, handleEnded, handleError]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : (volume / 100);
    }
  }, [audioRef, volume, isMuted]);

  return {
    isPlaying,
    currentTime,
    duration,
    error,
    volume,
    isMuted,
    play,
    pause,
    seek,
    setSource,
    setVolume,
    toggleMute
  };
}
