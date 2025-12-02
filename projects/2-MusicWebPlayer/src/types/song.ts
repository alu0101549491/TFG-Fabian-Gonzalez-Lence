/**
 * Represents a song in the music player.
 * @category Types
 */
export interface Song {
  /** Unique identifier for the song */
  id: string;
  
  /** Title of the song */
  title: string;
  
  /** Artist name */
  artist: string;
  
  /** URL to the cover art image */
  cover: string;
  
  /** URL to the audio file */
  url: string;
}