import React from 'react';

/**
 * Props for the TrackInfo component.
 * @category Components
 */
export interface TrackInfoProps {
  /** Song title to display */
  title: string;
  
  /** Artist name to display */
  artist: string;
  
  /** URL to the cover art image */
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
  // TODO: Implementation
  return (
    <div className="track-info">
      {/* TODO: Render track information */}
    </div>
  );
};