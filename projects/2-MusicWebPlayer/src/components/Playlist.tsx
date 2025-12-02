import React from 'react';
import {Song} from '@types/song';
import {AddSongForm} from './AddSongForm';

/**
 * Props for the Playlist component.
 * @category Components
 */
export interface PlaylistProps {
  /** Array of songs in the playlist */
  songs: Song[];
  
  /** Index of the currently playing song */
  currentSongIndex: number;
  
  /** Callback when a song is selected */
  onSongSelect: (index: number) => void;
  
  /** Callback when a new song is added */
  onAddSong: (song: Song) => void;
  
  /** Callback when a song is removed */
  onRemoveSong: (id: string) => void;
}

/**
 * Component that displays the playlist and allows song management.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const Playlist: React.FC<PlaylistProps> = (props) => {
  const handleSongClick = (index: number): void => {
    // TODO: Implementation
  };

  const handleDeleteClick = (id: string): void => {
    // TODO: Implementation
  };

  const handleAddSong = (song: Song): void => {
    // TODO: Implementation
  };

  // TODO: Implementation
  return (
    <div className="playlist">
      {/* TODO: Render playlist items and add song form */}
    </div>
  );
};