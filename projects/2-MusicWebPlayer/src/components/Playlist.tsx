/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/components/Playlist.tsx
 * @desc Component that displays the playlist of songs and allows users to select, delete, and add new songs.
 *       It integrates with the AddSongForm component.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types/song';
import { AddSongForm } from './AddSongForm';
import styles from '@styles/Playlist.module.css';

/**
 * Props for the Playlist component.
 * @category Components
 */
export interface PlaylistProps {
  /**
   * Array of songs in the playlist
   */
  songs: Song[];

  /**
   * Index of the currently playing song
   */
  currentSongIndex: number;

  /**
   * Callback when a song is selected
   * @param index - Index of the selected song
   */
  onSongSelect: (index: number) => void;

  /**
   * Callback when a new song is added
   * @param song - The new song to add
   */
  onAddSong: (song: Song) => void;

  /**
   * Callback when a song is removed
   * @param id - ID of the song to remove
   */
  onRemoveSong: (id: string) => void;
}

/**
 * Component that displays the playlist and allows song management.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Playlist: React.FC<PlaylistProps> = (props) => {
  // State for delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  // Ensure songs is always an array
  const songs = Array.isArray(props.songs) ? props.songs : [];

  /**
   * Handles clicking on a song to play it.
   * @param index - Index of the clicked song
   */
  const handleSongClick = (index: number): void => {
    props.onSongSelect(index);
  };

  /**
   * Handles clicking the delete button.
   * @param event - Click event
   * @param id - Song ID to delete
   */
  const handleDeleteClick = (event: React.MouseEvent, id: string): void => {
    event.stopPropagation(); // Prevent song selection

    if (deleteConfirmId === id) {
      // Second click confirms deletion
      props.onRemoveSong(id);
      setDeleteConfirmId(null);
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
    } else {
      // First click asks for confirmation
      setDeleteConfirmId(id);

      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
      deleteTimerRef.current = window.setTimeout(() => {
        setDeleteConfirmId((current) => (current === id ? null : current));
        deleteTimerRef.current = null;
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  /**
   * Handles keyboard interaction for song selection.
   * @param event - Keyboard event
   * @param index - Song index
   */
  const handleKeyDown = (event: React.KeyboardEvent, index: number): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSongClick(index);
    }
  };

  const DEFAULT_COVER = '/covers/default-cover.jpg';

  /**
   * Handles image loading errors by setting a fallback image.
   * @param event - Image error event
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    event.currentTarget.src = DEFAULT_COVER;
    event.currentTarget.alt = 'Default album cover';
  };

  /**
   * Handles adding a new song from the form.
   * @param song - The new song to add
   */
  const handleAddSong = (song: Song): void => {
    props.onAddSong(song);
  };

  return (
    <div className={styles.playlist}>
      <h3 className={styles.playlist__header}>
        Playlist ({songs.length} {songs.length === 1 ? 'song' : 'songs'})
      </h3>

      {/* Empty state */}
      {songs.length === 0 ? (
        <div className={styles.playlist__empty}>
          <p>No songs in playlist.</p>
          <p>Add your first song below!</p>
        </div>
      ) : (
        /* Song list */
        <ol className={styles.playlist__items}>
          {songs.map((song, index) => {
            const isActive = index === props.currentSongIndex;
            return (
              <li
                key={song.id}
                className={`${styles.playlist__item} ${isActive ? styles['playlist__item--active'] : ''}`}
                onClick={() => handleSongClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${song.title} by ${song.artist}${isActive ? ' (currently playing)' : ''}`}
              >
                {/* Thumbnail */}
                <img
                  src={song.cover}
                  alt={`${song.title} cover`}
                  className={styles['playlist__item-thumbnail']}
                  onError={handleImageError}
                />

                {/* Song info */}
                <div className={styles['playlist__item-info']}>
                  <p className={styles['playlist__item-title']} title={song.title}>
                    {song.title}
                  </p>
                  <p className={styles['playlist__item-artist']} title={song.artist}>
                    {song.artist}
                  </p>
                </div>

                {/* Currently playing indicator */}
                {index === props.currentSongIndex && (
                  <span className={styles['playlist__item-indicator']} aria-hidden="true">
                    ♫
                  </span>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  className={`${styles['playlist__item-delete']} ${
                    deleteConfirmId === song.id ? styles['playlist__item-delete--confirm'] : ''
                  }`}
                  onClick={(e) => handleDeleteClick(e, song.id)}
                  aria-label={
                    deleteConfirmId === song.id
                      ? `Confirm delete ${song.title}`
                      : `Remove ${song.title} from playlist`
                  }
                  title={
                    deleteConfirmId === song.id
                      ? 'Click again to confirm'
                      : 'Remove song'
                  }
                >
                  {deleteConfirmId === song.id ? '✓' : '×'}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {/* Add song form */}
      <AddSongForm onAddSong={handleAddSong} />
    </div>
  );
};
