/**
 * @module Components/Playlist
 * @category Components
 * @description
 * This component displays the playlist of songs and allows users to select, delete,
 * and add new songs. It integrates with the AddSongForm component.
 */

import React, { useState } from 'react';
import { Song } from '@types/song';
import { AddSongForm } from './AddSongForm';

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
    } else {
      // First click asks for confirmation
      setDeleteConfirmId(id);

      // Reset after 3 seconds
      setTimeout(() => {
        if (deleteConfirmId === id) {
          setDeleteConfirmId(null);
        }
      }, 3000);
    }
  };

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

  /**
   * Handles image loading errors by setting a fallback image.
   * @param event - Image error event
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    event.currentTarget.src = '/covers/default-cover.jpg';
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
    <div className="playlist">
      <h3 className="playlist__header">
        Playlist ({songs.length} {songs.length === 1 ? 'song' : 'songs'})
      </h3>

      {/* Empty state */}
      {songs.length === 0 ? (
        <div className="playlist__empty">
          <p>No songs in playlist.</p>
          <p>Add your first song below!</p>
        </div>
      ) : (
        /* Song list */
        <ul className="playlist__items" role="list">
          {songs.map((song, index) => (
            <li
              key={song.id}
              className={`playlist__item ${
                index === props.currentSongIndex ? 'playlist__item--active' : ''
              }`}
              onClick={() => handleSongClick(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-label={`${song.title} by ${song.artist}${
                index === props.currentSongIndex ? ' (currently playing)' : ''
              }`}
            >
              {/* Thumbnail */}
              <img
                src={song.cover}
                alt={`${song.title} cover`}
                className="playlist__item-thumbnail"
                onError={handleImageError}
              />

              {/* Song info */}
              <div className="playlist__item-info">
                <p className="playlist__item-title" title={song.title}>
                  {song.title}
                </p>
                <p className="playlist__item-artist" title={song.artist}>
                  {song.artist}
                </p>
              </div>

              {/* Currently playing indicator */}
              {index === props.currentSongIndex && (
                <span className="playlist__item-indicator" aria-hidden="true">
                  ♫
                </span>
              )}

              {/* Delete button */}
              <button
                type="button"
                className={`playlist__item-delete ${
                  deleteConfirmId === song.id ? 'playlist__item-delete--confirm' : ''
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
          ))}
        </ul>
      )}

      {/* Add song form */}
      <AddSongForm onAddSong={handleAddSong} />
    </div>
  );
};
