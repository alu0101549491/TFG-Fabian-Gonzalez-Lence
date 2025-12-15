/**
 * @module Types/Song
 * @category Types
 * @description
 * This module defines the core data structure for songs in the Music Web Player application.
 * The Song interface represents the fundamental data model used throughout the application
 * for playlist management, playback, and UI rendering.
 */

/**
 * Represents a music track with metadata and file references.
 *
 * @interface Song
 * @property {string} id - Unique identifier for the song
 * @property {string} title - Display name of the song
 * @property {string} artist - Name of the artist or band
 * @property {string} cover - URL to the album/cover art image
 * @property {string} url - URL to the audio file (MP3, WAV, OGG, M4A)
 *
 * @example
 * const song: Song = {
 *   id: "1",
 *   title: "Bohemian Rhapsody",
 *   artist: "Queen",
 *   cover: "/covers/queen.jpg",
 *   url: "/songs/bohemian-rhapsody.mp3"
 * };
 */
export interface Song {
  /**
   * Unique identifier for the song.
   * @property {string} id
   * @example "550e8400-e29b-41d4-a716-446655440000" or "1"
   * @remarks
   * Used for React keys, playlist management, and deletion operations.
   * Must be unique across all songs in the playlist.
   */
  readonly id: string;

  /**
   * The name/title of the song.
   * @property {string} title
   * @example "Bohemian Rhapsody"
   * @remarks
   * Displayed in UI components (TrackInfo, Playlist).
   * Should be a non-empty string with max length of 200 characters.
   */
  readonly title: string;

  /**
   * The artist or band name who performed the song.
   * @property {string} artist
   * @example "Queen"
   * @remarks
   * Displayed in UI alongside the song title.
   * Should be a non-empty string with max length of 100 characters.
   */
  readonly artist: string;

  /**
   * URL to the album/song cover art image.
   * @property {string} cover
   * @example "https://example.com/covers/song-cover.jpg" or "/covers/default-cover.jpg"
   * @remarks
   * Displayed as album artwork in TrackInfo component.
   * Must be a valid URL (HTTP/HTTPS) or relative path pointing to an image file.
   * The application should handle broken/missing images with a placeholder.
   */
  readonly cover: string;

  /**
   * URL to the audio file.
   * @property {string} url
   * @example "https://example.com/audio/song.mp3" or "/songs/sample-song-1.mp3"
   * @remarks
   * Used as the source for HTML5 Audio element playback.
   * Must be a valid URL (HTTP/HTTPS or relative path) pointing to a supported audio format.
   * Must be accessible and not blocked by CORS.
   */
  readonly url: string;
}
