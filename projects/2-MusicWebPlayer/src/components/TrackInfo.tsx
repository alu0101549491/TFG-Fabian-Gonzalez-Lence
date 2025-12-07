/**
 * @module Components/TrackInfo
 * @category Components
 * @description
 * This component displays the current track information including cover art,
 * title, and artist. It's a pure presentational component with no internal state.
 */

import React from 'react';

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

/**
 * Component that displays current track information including cover art,
 * title, and artist.
 * @param props Component props
 * @returns React component
 * @category Components
 */
export const TrackInfo: React.FC<TrackInfoProps> = (props) => {
  /**
   * Handles image loading errors by setting a fallback image.
   * @param e The image error event
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/covers/default-cover.jpg';
    e.currentTarget.alt = 'Default album cover';
  };

  // Handle empty or missing props with fallback values
  const displayTitle = props.title || 'Unknown Title';
  const displayArtist = props.artist || 'Unknown Artist';
  const displayCover = props.cover || '/covers/default-cover.jpg';

  return (
    <div className="track-info">
      <img
        src={displayCover}
        alt={`${displayTitle} by ${displayArtist} album cover`}
        className="track-info__cover"
        onError={handleImageError}
        loading="lazy"
      />
      <div className="track-info__details">
        <h2
          className="track-info__title"
          title={displayTitle} // Tooltip shows full text on hover
        >
          {displayTitle}
        </h2>
        <p
          className="track-info__artist"
          title={displayArtist} // Tooltip shows full text on hover
        >
          {displayArtist}
        </p>
      </div>
    </div>
  );
};