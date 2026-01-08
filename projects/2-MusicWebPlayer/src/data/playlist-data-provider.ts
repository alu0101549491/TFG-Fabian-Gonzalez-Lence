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
import { AudioValidator } from '@utils/audio-validator';

/**
 * Provides initial playlist data for the application.
 * This static class contains methods to load the default playlist and supports
 * loading playlists from external JSON sources.
 */
export class PlaylistDataProvider {
  // Base URL for public assets
  private static BASE_URL: string = import.meta.env.BASE_URL || '/TFG-Fabian-Gonzalez-Lence/2-MusicWebPlayer/';

  /**
   * Loads and returns the initial playlist data for the application.
   * Attempts to load from JSON first, then falls back to the default hardcoded playlist.
   *
   * @returns Array of Song objects for the initial playlist
   * @static
   */
  public static async loadInitialPlaylist(): Promise<Song[]> {
    try {
      // First try to load from JSON
      const jsonSongs = await this.fetchFromJSON();

      // If we got valid songs from JSON, use them
      if (jsonSongs.length > 0) {
        return jsonSongs;
      }
    } catch (error) {
      // If JSON loading fails, log the error and continue with default
      console.warn('Failed to load playlist from JSON:', error);
    }

    // Fall back to default playlist
    return this.getDefaultPlaylist();
  }

  /**
   * Returns a hardcoded default playlist with example songs.
   * This provides a fallback playlist with diverse music examples that
   * use audio files from the public directory.
   *
   * @returns Array of Song objects with complete data
   * @static
   */
  public static getDefaultPlaylist(): Song[] {
    // Default playlist with 7 diverse songs
    return [
      {
        "id": "json-1",
        "title": "Mountains",
        "artist": "A. Cooper",
        "cover": `${this.BASE_URL}covers/mountains.jpg`,
        "url": `${this.BASE_URL}songs/mountains.mp3`
      },
      {
        "id": "json-2",
        "title": "Breathless",
        "artist": "Sapio",
        "cover": `${this.BASE_URL}covers/breathless.jpg`,
        "url": `${this.BASE_URL}songs/breathless.mp3`
      },
      {
        "id": "json-3",
        "title": "Honey",
        "artist": "Serge Quadrado",
        "cover": `${this.BASE_URL}covers/honey.jpg`,
        "url": `${this.BASE_URL}songs/honey.mp3`
      },
      {
        "id": "json-4",
        "title": "Nights Like This",
        "artist": "Beat Mekanik",
        "cover": `${this.BASE_URL}covers/nights_like_this.jpg`,
        "url": `${this.BASE_URL}songs/nights_like_this.mp3`
      },
      {
        "id": "json-5",
        "title": "Psychic",
        "artist": "Tadiwanaishe",
        "cover": `${this.BASE_URL}covers/psychic.jpeg`,
        "url": `${this.BASE_URL}songs/psychic.mp3`
      },
      {
        "id": "json-6",
        "title": "The End",
        "artist": "Sapio",
        "cover": `${this.BASE_URL}covers/the_end.jpeg`,
        "url": `${this.BASE_URL}songs/the_end.mp3`
      }
    ];
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
      const response = await fetch(`${this.BASE_URL}playlist.json`);

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
          // Create a temporary song object with the data
          const tempSong: Song = {
            id: song.id || Math.random().toString(36).substr(2, 9),
            title: song.title || '',
            artist: song.artist || '',
            cover: song.cover || `${this.BASE_URL}covers/default-cover.jpg`,
            url: song.url || ''
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