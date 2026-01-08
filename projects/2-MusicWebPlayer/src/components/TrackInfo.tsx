/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/components/TrackInfo.tsx
 * @desc Component that displays the current track information including cover art, title, and artist.
 *       It's a pure presentational component with no internal state.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

import React from 'react';
import styles from '@styles/TrackInfo.module.css';

/**
 * Props for the TrackInfo component.
 * @category Components
 */
export interface TrackInfoProps {
  /**
   * Song title to display
   * @example "Bohemian Rhapsody"
   */
  title: string;

  /**
   * Artist name to display
   * @example "Queen"
   */
  artist: string;

  /**
   * URL to the cover art image
   * Should be square (1:1 aspect ratio)
   * @example "/covers/queen-bohemian.jpg"
   */
  cover: string;
}

const DEFAULT_COVER = `${import.meta.env.BASE_URL}covers/default-cover.jpg`;

/**
 * Component that displays current track information including cover art,
 * title, and artist.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const TrackInfo: React.FC<TrackInfoProps> = React.memo(
  ({ title, artist, cover }) => {
    /**
     * Handles image loading errors by setting a fallback image.
     * @param e The image error event
     */
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = DEFAULT_COVER;
      e.currentTarget.alt = 'Default album cover';
    };

    // Handle empty or missing props with fallback values
    const displayTitle = title || 'Unknown Title';
    const displayArtist = artist || 'Unknown Artist';
    const displayCover = cover || DEFAULT_COVER;

    return (
      <div className={styles['track-info']}>
        <img
          src={displayCover}
          alt={`${displayTitle} by ${displayArtist} album cover`}
          className={styles['track-info__cover']}
          onError={handleImageError}
          loading="lazy"
        />
        <div className={styles['track-info__details']}>
          <h2
            className={styles['track-info__title']}
            title={displayTitle} // Tooltip shows full text on hover
          >
            {displayTitle}
          </h2>
          <p
            className={styles['track-info__artist']}
            title={displayArtist} // Tooltip shows full text on hover
          >
            {displayArtist}
          </p>
        </div>
      </div>
    );
  },
);