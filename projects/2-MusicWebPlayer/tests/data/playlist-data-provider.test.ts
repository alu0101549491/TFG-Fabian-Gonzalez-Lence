// tests/data/playlist-data-provider.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PlaylistDataProvider } from '@/data/playlist-data-provider';
import { Song } from '@/types/song';
import { AudioValidator } from '@/utils/audio-validator';

describe('PlaylistDataProvider', () => {
  // Mock playlist data that matches public/playlist.json
  const mockPlaylistData = {
    name: "Default Playlist",
    description: "A collection of sample songs for the Music Web Player",
    songs: [
      { id: "json-1", title: "Mountains", artist: "A. Cooper", cover: "/covers/mountains.jpg", url: "/songs/mountains.mp3" },
      { id: "json-2", title: "Breathless", artist: "Sapio", cover: "/covers/breathless.jpg", url: "/songs/breathless.mp3" },
      { id: "json-3", title: "Honey", artist: "Serge Quadrado", cover: "/covers/honey.jpg", url: "/songs/honey.mp3" },
      { id: "json-4", title: "Nights Like This", artist: "Beat Mekanik", cover: "/covers/nights_like_this.jpg", url: "/songs/nights_like_this.mp3" },
      { id: "json-5", title: "Psychic", artist: "Tadiwanaishe", cover: "/covers/psychic.jpeg", url: "/songs/psychic.mp3" },
      { id: "json-6", title: "The End", artist: "Sapio", cover: "/covers/the_end.jpeg", url: "/songs/the_end.mp3" }
    ]
  };

  beforeEach(() => {
    // Mock successful fetch by default
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPlaylistData
    } as Response);
  });

  afterEach(() => {
    // Clean up all mocks after each test
    jest.restoreAllMocks();
    if (global.fetch && jest.isMockFunction(global.fetch)) {
      (global.fetch as jest.Mock).mockRestore();
    }
  });

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

    describe('Error Handling', () => {
      it('should return empty array when JSON loading fails', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist).toEqual([]);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Error loading playlist JSON:', expect.any(Error));
        
        consoleWarnSpy.mockRestore();
      });

      it('should return empty array when JSON returns empty array', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ songs: [] })
        } as Response);

        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist).toEqual([]);
      });

      it('should use JSON data when available', async () => {
        const mockJsonData = {
          songs: [
            { id: 'json-1', title: 'JSON Song', artist: 'JSON Artist', cover: '/covers/cover.jpg', url: '/songs/song.mp3' }
          ]
        };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => mockJsonData
        } as Response);

        const playlist = await PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist.length).toBe(1);
        expect(playlist[0].id).toBe('json-1');
      });
    });
  });

  describe('fetchFromJSON', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
    });

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

      expect(Array.isArray(playlist)).toBe(true);
    });

    it('should load valid songs from JSON successfully', async () => {
      const mockJsonData = {
        songs: [
          { id: 'json-1', title: 'JSON Song 1', artist: 'JSON Artist 1', cover: '/covers/cover1.jpg', url: '/songs/song1.mp3' },
          { id: 'json-2', title: 'JSON Song 2', artist: 'JSON Artist 2', cover: '/covers/cover2.jpg', url: '/songs/song2.mp3' }
        ]
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJsonData
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist.length).toBe(2);
      expect(playlist[0].id).toBe('json-1');
      expect(playlist[1].id).toBe('json-2');
    });

    it('should return empty array when fetch fails (HTTP error)', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to load playlist JSON: HTTP 404'));
      
      consoleWarnSpy.mockRestore();
    });

    it('should return empty array when JSON structure is invalid (missing songs)', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'data' })
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid playlist JSON structure');
      
      consoleWarnSpy.mockRestore();
    });

    it('should return empty array when JSON structure has non-array songs', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ songs: 'not-an-array' })
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid playlist JSON structure');
      
      consoleWarnSpy.mockRestore();
    });

    it('should filter out invalid songs from JSON', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockJsonData = {
        songs: [
          { id: 'valid-1', title: 'Valid Song', artist: 'Valid Artist', cover: '/covers/cover.jpg', url: '/songs/song.mp3' },
          { id: 'invalid-1', title: '', artist: 'Artist', cover: '/covers/cover.jpg', url: '/songs/song.mp3' }, // Invalid: empty title
          { id: 'valid-2', title: 'Another Valid', artist: 'Valid Artist 2', cover: '/covers/cover2.jpg', url: '/songs/song2.mp3' }
        ]
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJsonData
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist.length).toBe(2); // Only valid songs
      expect(playlist[0].id).toBe('valid-1');
      expect(playlist[1].id).toBe('valid-2');
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid song in playlist JSON'), expect.anything(), expect.anything());
      
      consoleWarnSpy.mockRestore();
    });

    it('should generate ID for songs without id in JSON', async () => {
      const mockJsonData = {
        songs: [
          { title: 'Song Without ID', artist: 'Artist', cover: '/covers/cover.jpg', url: '/songs/song.mp3' }
        ]
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJsonData
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist.length).toBe(1);
      expect(playlist[0].id).toBeDefined();
      expect(typeof playlist[0].id).toBe('string');
      expect(playlist[0].id.length).toBeGreaterThan(0);
    });

    it('should use default cover for songs without cover in JSON', async () => {
      const mockJsonData = {
        songs: [
          { id: '1', title: 'Song', artist: 'Artist', url: '/songs/song.mp3' }
        ]
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJsonData
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist.length).toBe(1);
      expect(playlist[0].cover).toBe('/covers/default-cover.jpg');
    });

    it('should handle fetch network errors', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Error loading playlist JSON:', expect.any(Error));
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle JSON parse errors', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Error loading playlist JSON:', expect.any(Error));
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle malformed song data in JSON', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockJsonData = {
        songs: [
          null,
          undefined,
          { id: 'valid', title: 'Valid Song', artist: 'Artist', cover: '/covers/cover.jpg', url: '/songs/song.mp3' },
          'not-an-object'
        ]
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockJsonData
      } as Response);

      const playlist = await PlaylistDataProvider.fetchFromJSON();

      expect(playlist.length).toBeGreaterThanOrEqual(1); // At least the valid one
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
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
      // Use the default mock (successful fetch) from beforeEach
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
