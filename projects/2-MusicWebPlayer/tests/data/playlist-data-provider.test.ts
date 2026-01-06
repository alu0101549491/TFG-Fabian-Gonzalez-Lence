// tests/data/playlist-data-provider.test.ts
import { describe, it, expect } from '@jest/globals';
import { PlaylistDataProvider } from '@/data/playlist-data-provider';
import { Song } from '@/types/song';
import { AudioValidator } from '@/utils/audio-validator';

describe('PlaylistDataProvider', () => {
  describe('loadInitialPlaylist', () => {
    describe('Basic Structure', () => {
      it('should return an array', async () => {
        // ACT
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        // ASSERT
        expect(Array.isArray(playlist)).toBe(true);
      });

      it('should return at least 5 songs', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist.length).toBeGreaterThanOrEqual(5);
      });

      it('should return reasonable number of songs (≤20)', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist.length).toBeLessThanOrEqual(20);
      });

      it('should return Song objects with all required fields', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song).toHaveProperty('id');
          expect(song).toHaveProperty('title');
          expect(song).toHaveProperty('artist');
          expect(song).toHaveProperty('cover');
          expect(song).toHaveProperty('url');
        });
      });

      it('should return Song[] type', async () => {
        const playlist: Song[] = await PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist).toBeDefined();
      });
    });

    describe('Song IDs', () => {
      it('should have non-empty ID for each song', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.id).toBeTruthy();
          expect(typeof song.id).toBe('string');
          expect(song.id.length).toBeGreaterThan(0);
        });
      });

      it('should have unique IDs for all songs', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        const ids = playlist.map(song => song.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(playlist.length);
      });

      it('should not have duplicate IDs', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        const ids = playlist.map(song => song.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

        expect(duplicates).toHaveLength(0);
      });
    });

    describe('Song Titles', () => {
      it('should have non-empty title for each song', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.title).toBeTruthy();
          expect(typeof song.title).toBe('string');
          expect(song.title.length).toBeGreaterThan(0);
        });
      });

      it('should have creative titles (not generic like "Song 1")', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          // Should NOT match patterns like "Song 1", "Song 2", "Test Song 1"
          expect(song.title).not.toMatch(/^Song \\d+$/i);
          expect(song.title).not.toMatch(/^Test Song \\d+$/i);
          expect(song.title).not.toMatch(/^Track \\d+$/i);
        });
      });

      it('should have realistic, creative titles', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        // Check that titles have some creativity (multiple words, capitalization, etc.)
        playlist.forEach(song => {
          expect(song.title.length).toBeGreaterThan(3); // Not just "ABC"
        });
      });

      it('should not have duplicate titles', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        const titles = playlist.map(song => song.title);
        const uniqueTitles = new Set(titles);

        expect(uniqueTitles.size).toBe(playlist.length);
      });
    });

    describe('Song Artists', () => {
      it('should have non-empty artist for each song', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.artist).toBeTruthy();
          expect(typeof song.artist).toBe('string');
          expect(song.artist.length).toBeGreaterThan(0);
        });
      });

      it('should have creative artist names (not generic like "Artist 1")', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.artist).not.toMatch(/^Artist \\d+$/i);
          expect(song.artist).not.toMatch(/^Test Artist \\d+$/i);
          expect(song.artist).not.toMatch(/^Unknown Artist$/i);
        });
      });

      it('should have multiple different artists (genre diversity)', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        const artists = playlist.map(song => song.artist);
        const uniqueArtists = new Set(artists);

        // Should have at least 3 different artists for diversity
        expect(uniqueArtists.size).toBeGreaterThanOrEqual(3);
      });
    });

    describe('Cover URLs', () => {
      it('should have non-empty cover URL for each song', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.cover).toBeTruthy();
          expect(typeof song.cover).toBe('string');
          expect(song.cover.length).toBeGreaterThan(0);
        });
      });

      it('should have valid URL format for covers', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          // Should be valid URL format (http://, https://, or relative path)
          expect(
            song.cover.startsWith('http://') ||
            song.cover.startsWith('https://') ||
            song.cover.startsWith('/') ||
            song.cover.startsWith('./')
          ).toBe(true);
        });
      });

      it('should reference cover image paths', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        // Most covers should reference a /covers/ directory or similar
        const coversInDirectory = playlist.filter(song =>
          song.cover.includes('/covers/') || song.cover.includes('cover')
        );

        expect(coversInDirectory.length).toBeGreaterThan(0);
      });
    });

    describe('Audio URLs', () => {
      it('should have non-empty audio URL for each song', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.url).toBeTruthy();
          expect(typeof song.url).toBe('string');
          expect(song.url.length).toBeGreaterThan(0);
        });
      });

      it('should have valid URL format for audio files', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(
            song.url.startsWith('http://') ||
            song.url.startsWith('https://') ||
            song.url.startsWith('/') ||
            song.url.startsWith('./')
          ).toBe(true);
        });
      });

      it('should reference /songs/ directory in audio URLs', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        // Most URLs should reference a /songs/ directory
        const songsInDirectory = playlist.filter(song =>
          song.url.includes('/songs/') || song.url.includes('/audio/')
        );

        expect(songsInDirectory.length).toBeGreaterThan(0);
      });

      it('should have audio file extensions', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          const hasAudioExtension =
            song.url.toLowerCase().includes('.mp3') ||
            song.url.toLowerCase().includes('.wav') ||
            song.url.toLowerCase().includes('.ogg') ||
            song.url.toLowerCase().includes('.m4a');

          expect(hasAudioExtension).toBe(true);
        });
      });
    });

    describe('Data Quality', () => {
      it('should have professional, realistic song data', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          // Titles should be more than just one word
          const titleWordCount = song.title.split(/\\s+/).length;
          expect(titleWordCount).toBeGreaterThan(0);

          // No "test" or "sample" in titles
          expect(song.title.toLowerCase()).not.toContain('test');
          expect(song.title.toLowerCase()).not.toContain('sample');
        });
      });

      it('should imply genre diversity through titles and artists', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        // Check that not all songs have same artist
        const artists = playlist.map(song => song.artist);
        const uniqueArtists = new Set(artists);

        expect(uniqueArtists.size).toBeGreaterThanOrEqual(3);
      });

      it('should have creative and varied song titles', async () => {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        // Check title diversity - not all starting with same word
        const firstWords = playlist.map(song => song.title.split(' ')[0]);
        const uniqueFirstWords = new Set(firstWords);

        expect(uniqueFirstWords.size).toBeGreaterThan(1);
      });
    });

    describe('Deterministic Behavior', () => {
      it('should return same data on multiple calls', async () => {
        const playlist1 = await PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = await PlaylistDataProvider.loadInitialPlaylist();
        const playlist3 = await PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist1).toEqual(playlist2);
        expect(playlist2).toEqual(playlist3);
      });

      it('should return same number of songs every time', async () => {
        const playlist1 = await PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = await PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist1.length).toBe(playlist2.length);
      });

      it('should return songs in same order every time', async () => {
        const playlist1 = await PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = await PlaylistDataProvider.loadInitialPlaylist();

        playlist1.forEach((song, index) => {
          expect(song.id).toBe(playlist2[index].id);
          expect(song.title).toBe(playlist2[index].title);
        });
      });

      it('should be a pure function (no side effects)', async () => {
        const consoleSpy = jest.spyOn(console, 'log');

        await PlaylistDataProvider.loadInitialPlaylist();

        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('getDefaultPlaylist', () => {
    it('should return Song array', () => {
      const playlist = PlaylistDataProvider.getDefaultPlaylist();

      expect(Array.isArray(playlist)).toBe(true);
      expect(playlist.length).toBeGreaterThanOrEqual(5);
    });

    it('should return same data as loadInitialPlaylist', async () => {
      const initialPlaylist = await PlaylistDataProvider.loadInitialPlaylist();
      const defaultPlaylist = PlaylistDataProvider.getDefaultPlaylist();

      expect(defaultPlaylist).toEqual(initialPlaylist);
    });

    it('should return valid Song objects', () => {
      const playlist = PlaylistDataProvider.getDefaultPlaylist();

      playlist.forEach(song => {
        expect(song).toHaveProperty('id');
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('artist');
        expect(song).toHaveProperty('cover');
        expect(song).toHaveProperty('url');
      });
    });
  });

  describe('fetchFromJSON (stub)', () => {
    it('should exist as a function', () => {
      expect(PlaylistDataProvider.fetchFromJSON).toBeDefined();
      expect(typeof PlaylistDataProvider.fetchFromJSON).toBe('function');
    });

    it('should return a Promise', async () => {
      const result = PlaylistDataProvider.fetchFromJSON();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve with Song array', async () => {
      const playlist = await PlaylistDataProvider.fetchFromJSON();

      // If implemented as stub returning data
      expect(Array.isArray(playlist)).toBe(true);
    });

    it('should not break when called', () => {
      // Should not throw synchronously
      expect(() => PlaylistDataProvider.fetchFromJSON()).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should return songs that pass AudioValidator validation', async () => {
      const playlist = await PlaylistDataProvider.loadInitialPlaylist();

      playlist.forEach(song => {
        const validationResult = AudioValidator.validateSong(song);

        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);
      });
    });

    it('should provide data compatible with usePlaylist hook', async () => {
      const playlist = await PlaylistDataProvider.loadInitialPlaylist();

      // Should be a non-empty array
      expect(playlist.length).toBeGreaterThan(0);

      // Should have all required Song properties
      playlist.forEach(song => {
        expect(song.id).toBeDefined();
        expect(song.title).toBeDefined();
        expect(song.artist).toBeDefined();
        expect(song.cover).toBeDefined();
        expect(song.url).toBeDefined();
      });
    });

    it('should provide data that can be rendered in Playlist component', async () => {
      const playlist = await PlaylistDataProvider.loadInitialPlaylist();

      // All display fields should be non-empty
      playlist.forEach(song => {
        expect(song.title.length).toBeGreaterThan(0);
        expect(song.artist.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple consecutive calls', async () => {
      for (let i = 0; i < 10; i++) {
        const playlist = await PlaylistDataProvider.loadInitialPlaylist();
        expect(playlist.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('should return new array reference (immutability)', async () => {
      const playlist1 = await PlaylistDataProvider.loadInitialPlaylist();
      const playlist2 = await PlaylistDataProvider.loadInitialPlaylist();

      // Should be equal but not same reference
      expect(playlist1).toEqual(playlist2);
      expect(playlist1).not.toBe(playlist2);
    });

    it('should not cause memory leaks with repeated calls', async () => {
      const initialMemory = process.memoryUsage?.heapUsed || 0;

      for (let i = 0; i < 1000; i++) {
        await PlaylistDataProvider.loadInitialPlaylist();
      }

      const finalMemory = process.memoryUsage?.heapUsed || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 10MB for 1000 calls)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Type Safety', () => {
    it('should return Song[] type', async () => {
      const playlist: Song[] = await PlaylistDataProvider.loadInitialPlaylist();

      expect(Array.isArray(playlist)).toBe(true);
    });

    it('should have proper TypeScript types for all songs', async () => {
      const playlist = await PlaylistDataProvider.loadInitialPlaylist();

      playlist.forEach((song: Song) => {
        const id: string = song.id;
        const title: string = song.title;
        const artist: string = song.artist;
        const cover: string = song.cover;
        const url: string = song.url;

        expect(typeof id).toBe('string');
        expect(typeof title).toBe('string');
        expect(typeof artist).toBe('string');
        expect(typeof cover).toBe('string');
        expect(typeof url).toBe('string');
      });
    });
  });
});
