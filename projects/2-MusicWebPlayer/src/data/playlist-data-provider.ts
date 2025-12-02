import {Song} from '@types/song';

/**
 * Provides initial playlist data for the application.
 * @category Data
 */
export class PlaylistDataProvider {
  private static initialPlaylist: Song[] = [];

  /**
   * Loads the initial playlist data.
   * @returns Array of songs for initial playlist
   */
  public static loadInitialPlaylist(): Song[] {
    // TODO: Implementation
    return this.getDefaultPlaylist();
  }

  /**
   * Returns a default playlist with sample songs.
   * @returns Array of default songs
   */
  public static getDefaultPlaylist(): Song[] {
    // TODO: Implementation
    return [
      {
        id: '1',
        title: 'Sample Song 1',
        artist: 'Sample Artist 1',
        cover: '/covers/default-cover.jpg',
        url: '/songs/sample-song-1.mp3',
      },
      {
        id: '2',
        title: 'Sample Song 2',
        artist: 'Sample Artist 2',
        cover: '/covers/default-cover.jpg',
        url: '/songs/sample-song-2.mp3',
      },
      {
        id: '3',
        title: 'Sample Song 3',
        artist: 'Sample Artist 3',
        cover: '/covers/default-cover.jpg',
        url: '/songs/sample-song-3.mp3',
      },
    ];
  }

  /**
   * Fetches playlist from a JSON file.
   * @returns Promise resolving to array of songs
   * @private
   */
  private static async fetchFromJSON(): Promise<Song[]> {
    // TODO: Implementation
    return [];
  }
}