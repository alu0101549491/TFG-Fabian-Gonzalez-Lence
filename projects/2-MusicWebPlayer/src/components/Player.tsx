/**
 * @module Components/Player
 * @category Components
 * @description
 * This is the main container component that orchestrates all player functionality.
 * It manages the audio element, coordinates between hooks and child components,
 * and handles all user interactions.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Song } from '@types/song';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { usePlaylist } from '@hooks/usePlaylist';
import { PlaylistDataProvider } from '@data/playlist-data-provider';
import { TrackInfo } from './TrackInfo';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { Playlist } from './Playlist';
import styles from '@styles/Player.module.css';

/**
 * Main container component that orchestrates all player functionality.
 * Manages state and coordinates between audio playback and UI components.
 * @returns React component
 * @category Components
 */
export const Player: React.FC = () => {
  // Reference to the HTML audio element
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize hooks
  const audioPlayer = useAudioPlayer(audioRef);
  const playlistManager = usePlaylist(PlaylistDataProvider.loadInitialPlaylist());

  // State for error notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Gets the current song based on the playlist index.
   * @returns The current Song object or null if no song is selected
   */
  const getCurrentSong = (): Song | null => {
    return playlistManager.getSongAt(playlistManager.currentIndex);
  };
  const currentSong = getCurrentSong();

  /**
   * Toggles between play and pause.
   */
  const handlePlayPause = async (): Promise<void> => {
    if (audioPlayer.isPlaying) {
      audioPlayer.pause();
    } else {
      try {
        await audioPlayer.play();
      } catch (error) {
        console.error('Play failed:', error);
        setErrorMessage('Unable to play audio. Please try again.');
      }
    }
  };

  /**
   * Advances to the next song in the playlist.
   */
  const handleNext = (): void => {
    const newIndex = playlistManager.next();
    const nextSong = playlistManager.getSongAt(newIndex);

    if (nextSong) {
      audioPlayer.setSource(nextSong.url, nextSong.id);

      // Auto-play if currently playing
      if (audioPlayer.isPlaying) {
        audioPlayer.play().catch(error => {
          console.error('Auto-play failed:', error);
          setErrorMessage('Unable to play next song. Please try again.');
        });
      }
    }
  };

  /**
   * Goes back to the previous song in the playlist.
   */
  const handlePrevious = (): void => {
    const newIndex = playlistManager.previous();
    const prevSong = playlistManager.getSongAt(newIndex);

    if (prevSong) {
      audioPlayer.setSource(prevSong.url, prevSong.id);

      // Auto-play if currently playing
      if (audioPlayer.isPlaying) {
        audioPlayer.play().catch(error => {
          console.error('Auto-play failed:', error);
          setErrorMessage('Unable to play previous song. Please try again.');
        });
      }
    }
  };

  /**
   * Seeks to a specific position in the current song.
   * @param time - Time in seconds to seek to
   */
  const handleSeek = (time: number): void => {
    audioPlayer.seek(time);
  };

  /**
   * Handles user selecting a song from the playlist.
   * @param index - Index of the selected song
   */
  const handleSongSelect = (index: number): void => {
    playlistManager.setCurrentIndex(index);
    const selectedSong = playlistManager.getSongAt(index);

    if (selectedSong) {
      audioPlayer.setSource(selectedSong.url, selectedSong.id);
      audioPlayer.play().catch(error => {
        console.error('Play failed:', error);
        setErrorMessage('Unable to play selected song. Please try again.');
      });
    }
  };

  /**
   * Handles adding a new song to the playlist.
   * @param song - The new song to add
   */
  const handleAddSong = (song: Song): void => {
    playlistManager.addSong(song);
  };

  /**
   * Handles removing a song from the playlist.
   * @param id - ID of the song to remove
   */
  const handleRemoveSong = (id: string): void => {
    playlistManager.removeSong(id);
  };

  // Load initial song when component mounts
  useEffect(() => {
    const initialSong = playlistManager.getSongAt(0);
    if (initialSong && audioRef.current) {
      audioPlayer.setSource(initialSong.url, initialSong.id);
    }
  }, []);

  // Auto-clear error messages after a delay
  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage(null);
      }, 5000); // Clear after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  // Display audio player errors
  useEffect(() => {
    if (audioPlayer.error) {
      setErrorMessage(audioPlayer.error);
    }
  }, [audioPlayer.error]);

  // Auto-play next song when current song ends
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = (): void => {
      handleNext();
    };

    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, [playlistManager.currentIndex, playlistManager.playlist.length]);

  return (
    <div className={styles.player}>
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Error notification */}
      {errorMessage && (
        <div className={styles.player__error} role="alert">
          <p>{errorMessage}</p>
          <button
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Main player content */}
      <div className={styles.player__content}>
        <div className={styles.player__layout}>
          {/* Left column: Controls */}
          <div className={styles['player__controls-section']}>
            {/* Track information */}
            <TrackInfo
              title={currentSong?.title || 'No Song Selected'}
              artist={currentSong?.artist || 'Unknown Artist'}
              cover={currentSong?.cover || '/covers/default-cover.jpg'}
            />

            {/* Progress bar */}
            <ProgressBar
              currentTime={audioPlayer.currentTime}
              duration={audioPlayer.duration}
              onSeek={handleSeek}
            />

            {/* Playback controls */}
            <Controls
              isPlaying={audioPlayer.isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
              disableNext={playlistManager.currentIndex >= playlistManager.playlist.length - 1}
              disablePrevious={playlistManager.currentIndex <= 0}
            />
          </div>

          {/* Right column: Playlist */}
          <div className={styles['player__playlist-section']}>
            <Playlist
              songs={playlistManager.playlist}
              currentSongIndex={playlistManager.currentIndex}
              onSongSelect={handleSongSelect}
              onAddSong={handleAddSong}
              onRemoveSong={handleRemoveSong}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
