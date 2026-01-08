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

import { Song } from '@types/song';
import { AudioValidator } from '@utils/audio-validator';

/**
 * Provides initial playlist data for the application.
 * This static class contains methods to load the default playlist and supports
 * loading playlists from external JSON sources.
 */
export class PlaylistDataProvider {
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
        id: "1",
        title: "Midnight Serenade",
        artist: "Luna Eclipse",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-1.mp3"
      },
      {
        id: "2",
        title: "Electric Dawn",
        artist: "Neon Horizon",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-2.mp3"
      },
      {
        id: "3",
        title: "Jazz in Paris",
        artist: "Sophie Martin Quartet",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-3.mp3"
      },
      {
        id: "4",
        title: "Summer Breeze",
        artist: "The Coastal Collective",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-4.mp3"
      },
      {
        id: "5",
        title: "Symphony No. 5 (Excerpt)",
        artist: "Classical Orchestra",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-5.mp3"
      },
      {
        id: "6",
        title: "Rock Anthem",
        artist: "The Wild Ones",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-6.mp3"
      },
      {
        id: "7",
        title: "Chill Vibes",
        artist: "Lo-Fi Dreamer",
        cover: "/covers/default-cover.jpg",
        url: "/songs/sample-song-7.mp3"
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
      const response = await fetch('/playlist.json');

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
            cover: song.cover || '/covers/default-cover.jpg',
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