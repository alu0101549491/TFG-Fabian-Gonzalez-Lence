/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/data/playlist-data-provider.ts
 * @desc Provides the initial playlist data for the Music Web Player application. It serves as the data source
 *       for the default playlist that loads when the application starts for the first time, ensuring users
 *       have content to interact with immediately.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

import { Song } from '../types/song';
import { AudioValidator } from '../utils/audio-validator';
import { getBaseUrl } from '../utils/env';

/**
 * Provides initial playlist data for the application.
 * This static class contains methods to load the default playlist and supports
 * loading playlists from external JSON sources.
 */
export class PlaylistDataProvider {
  /**
   * Loads and returns the initial playlist data for the application.
   * Attempts to load from JSON first, then falls back to an empty playlist if loading fails.
   *
   * @returns Array of Song objects for the initial playlist
   * @static
   */
  public static async loadInitialPlaylist(): Promise<Song[]> {
    try {
      // Try to load from JSON
      const jsonSongs = await this.fetchFromJSON();
      // Return the loaded songs (may be empty if JSON file is empty or has no valid songs)
      return jsonSongs;
    } catch (error) {
      // If JSON loading throws an error, log and return empty array
      console.warn('Error loading playlist JSON:', error);
      return [];
    }
  }

  /**
   * Asynchronously loads playlist data from a JSON file.
   * Loads from /public/playlist.json and validates the data structure.
   *
   * @returns Promise resolving to array of Song objects
   * @static
   */
  public static async fetchFromJSON(): Promise<Song[]> {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}playlist.json`);

      if (!response.ok) {
        console.warn(`Failed to load playlist JSON: HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();

      // Validate the JSON structure
      if (!data || !data.songs || !Array.isArray(data.songs)) {
        console.warn('Invalid playlist JSON structure');
        return [];
      }

      // Validate each song and filter out invalid ones
      const validSongs: Song[] = [];

      for (const song of data.songs) {
        try {
          // Adjust paths from JSON to include BASE_URL
          const adjustedCover = song.cover?.startsWith('/') 
            ? `${baseUrl}${song.cover.slice(1)}` 
            : song.cover;
          
          const adjustedUrl = song.url?.startsWith('/') 
            ? `${baseUrl}${song.url.slice(1)}` 
            : song.url;

          const tempSong: Song = {
            id: song.id || Math.random().toString(36).substr(2, 9),
            title: song.title || '',
            artist: song.artist || '',
            cover: adjustedCover || `${baseUrl}covers/default-cover.jpg`,
            url: adjustedUrl || ''
          };

          // Validate the song using AudioValidator
          const validation = AudioValidator.validateSong(tempSong);

          if (validation.isValid) {
            validSongs.push(tempSong);
          } else {
            console.warn('Invalid song in playlist JSON:', song, validation.errors);
          }
        } catch (error) {
          console.warn('Error processing song from JSON:', song, error);
        }
      }

      return validSongs;
    } catch (error) {
      console.warn('Error loading playlist JSON:', error);
      return [];
    }
  }
}