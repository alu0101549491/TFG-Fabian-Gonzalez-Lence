/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 2, 2026
 * @file src/components/PlaylistItem.tsx
 * @desc Component for rendering individual playlist items with support for IndexedDB cover images.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 */

import React from 'react';
import { useResourceLoader } from '@hooks/useResourceLoader';
import styles from '../styles/Playlist.module.css';

interface PlaylistItemProps {
  cover: string;
  title: string;
  artist: string;
  isActive: boolean;
  isDeleteConfirm: boolean;
  onDefaultCover: string;
  onClick: () => void;
  onDelete: (event: React.MouseEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Playlist item component with support for IndexedDB resources
 */
export const PlaylistItem: React.FC<PlaylistItemProps> = ({
  cover,
  title,
  artist,
  isActive,
  isDeleteConfirm,
  onDefaultCover,
  onClick,
  onDelete,
  onKeyDown
}) => {
  const { url: resolvedCover } = useResourceLoader(cover);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    event.currentTarget.src = onDefaultCover;
    event.currentTarget.alt = 'Default album cover';
  };

  return (
    <li
      className={`${styles.playlist__item} ${
        isActive ? styles['playlist__item--active'] : ''
      }`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-current={isActive ? 'true' : undefined}
      aria-label={`${title} by ${artist}${isActive ? ' (currently playing)' : ''}`}
    >
      {/* Thumbnail */}
      <img
        src={resolvedCover || onDefaultCover}
        alt={`${title} cover`}
        className={styles['playlist__item-thumbnail']}
        onError={handleImageError}
        loading="lazy"
      />

      {/* Song info */}
      <div className={styles['playlist__item-info']}>
        <p className={styles['playlist__item-title']} title={title}>
          {title}
        </p>
        <p className={styles['playlist__item-artist']} title={artist}>
          {artist}
        </p>
      </div>

      {/* Currently playing indicator */}
      {isActive && (
        <span className={styles['playlist__item-indicator']} aria-hidden="true">
          ♫
        </span>
      )}

      {/* Delete button */}
      <button
        type="button"
        className={`${styles['playlist__item-delete']} ${
          isDeleteConfirm ? styles['playlist__item-delete--confirm'] : ''
        }`}
        onClick={onDelete}
        aria-label={
          isDeleteConfirm
            ? `Confirm delete ${title}`
            : `Remove ${title} from playlist`
        }
        title={isDeleteConfirm ? 'Click again to confirm' : 'Remove song'}
      >
        {isDeleteConfirm ? '✓' : '×'}
      </button>
    </li>
  );
};
