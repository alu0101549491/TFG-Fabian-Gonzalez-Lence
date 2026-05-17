# Respuesta

### Respuesta {toggle="true"}
```typescript
// tests/data/playlist-data-provider.test.ts
import { describe, it, expect } from '@jest/globals';
import { PlaylistDataProvider } from '@/data/playlist-data-provider';
import { Song } from '@/types/song';
import { AudioValidator } from '@/utils/audio-validator';

describe('PlaylistDataProvider', () => {
  describe('loadInitialPlaylist', () => {
    describe('Basic Structure', () => {
      it('should return an array', () => {
        // ACT
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // ASSERT
        expect(Array.isArray(playlist)).toBe(true);
      });

      it('should return at least 5 songs', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist.length).toBeGreaterThanOrEqual(5);
      });

      it('should return reasonable number of songs (≤20)', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist.length).toBeLessThanOrEqual(20);
      });

      it('should return Song objects with all required fields', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song).toHaveProperty('id');
          expect(song).toHaveProperty('title');
          expect(song).toHaveProperty('artist');
          expect(song).toHaveProperty('cover');
          expect(song).toHaveProperty('url');
        });
      });

      it('should return Song[] type', () => {
        const playlist: Song[] = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist).toBeDefined();
      });
    });

    describe('Song IDs', () => {
      it('should have non-empty ID for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.id).toBeTruthy();
          expect(typeof song.id).toBe('string');
          expect(song.id.length).toBeGreaterThan(0);
        });
      });

      it('should have unique IDs for all songs', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        const ids = playlist.map(song => song.id);
        const uniqueIds = new Set(ids);

        expect(uniqueIds.size).toBe(playlist.length);
      });

      it('should not have duplicate IDs', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        const ids = playlist.map(song => song.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

        expect(duplicates).toHaveLength(0);
      });
    });

    describe('Song Titles', () => {
      it('should have non-empty title for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.title).toBeTruthy();
          expect(typeof song.title).toBe('string');
          expect(song.title.length).toBeGreaterThan(0);
        });
      });

      it('should have creative titles (not generic like "Song 1")', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          // Should NOT match patterns like "Song 1", "Song 2", "Test Song 1"
          expect(song.title).not.toMatch(/^Song \d+$/i);
          expect(song.title).not.toMatch(/^Test Song \d+$/i);
          expect(song.title).not.toMatch(/^Track \d+$/i);
        });
      });

      it('should have realistic, creative titles', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Check that titles have some creativity (multiple words, capitalization, etc.)
        playlist.forEach(song => {
          expect(song.title.length).toBeGreaterThan(3); // Not just "ABC"
        });
      });

      it('should not have duplicate titles', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        const titles = playlist.map(song => song.title);
        const uniqueTitles = new Set(titles);

        expect(uniqueTitles.size).toBe(playlist.length);
      });
    });

    describe('Song Artists', () => {
      it('should have non-empty artist for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.artist).toBeTruthy();
          expect(typeof song.artist).toBe('string');
          expect(song.artist.length).toBeGreaterThan(0);
        });
      });

      it('should have creative artist names (not generic like "Artist 1")', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.artist).not.toMatch(/^Artist \d+$/i);
          expect(song.artist).not.toMatch(/^Test Artist \d+$/i);
          expect(song.artist).not.toMatch(/^Unknown Artist$/i);
        });
      });

      it('should have multiple different artists (genre diversity)', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        const artists = playlist.map(song => song.artist);
        const uniqueArtists = new Set(artists);

        // Should have at least 3 different artists for diversity
        expect(uniqueArtists.size).toBeGreaterThanOrEqual(3);
      });
    });

    describe('Cover URLs', () => {
      it('should have non-empty cover URL for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.cover).toBeTruthy();
          expect(typeof song.cover).toBe('string');
          expect(song.cover.length).toBeGreaterThan(0);
        });
      });

      it('should have valid URL format for covers', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

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

      it('should reference cover image paths', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Most covers should reference a /covers/ directory or similar
        const coversInDirectory = playlist.filter(song => 
          song.cover.includes('/covers/') || song.cover.includes('cover')
        );

        expect(coversInDirectory.length).toBeGreaterThan(0);
      });
    });

    describe('Audio URLs', () => {
      it('should have non-empty audio URL for each song', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(song.url).toBeTruthy();
          expect(typeof song.url).toBe('string');
          expect(song.url.length).toBeGreaterThan(0);
        });
      });

      it('should have valid URL format for audio files', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          expect(
            song.url.startsWith('http://') ||
            song.url.startsWith('https://') ||
            song.url.startsWith('/') ||
            song.url.startsWith('./')
          ).toBe(true);
        });
      });

      it('should reference /songs/ directory in audio URLs', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Most URLs should reference a /songs/ directory
        const songsInDirectory = playlist.filter(song => 
          song.url.includes('/songs/') || song.url.includes('/audio/')
        );

        expect(songsInDirectory.length).toBeGreaterThan(0);
      });

      it('should have audio file extensions', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

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
      it('should have professional, realistic song data', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        playlist.forEach(song => {
          // Titles should be more than just one word
          const titleWordCount = song.title.split(/\s+/).length;
          expect(titleWordCount).toBeGreaterThan(0);

          // No "test" or "sample" in titles
          expect(song.title.toLowerCase()).not.toContain('test');
          expect(song.title.toLowerCase()).not.toContain('sample');
        });
      });

      it('should imply genre diversity through titles and artists', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Check that not all songs have same artist
        const artists = playlist.map(song => song.artist);
        const uniqueArtists = new Set(artists);

        expect(uniqueArtists.size).toBeGreaterThanOrEqual(3);
      });

      it('should have creative and varied song titles', () => {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();

        // Check title diversity - not all starting with same word
        const firstWords = playlist.map(song => song.title.split(' ')[0]);
        const uniqueFirstWords = new Set(firstWords);

        expect(uniqueFirstWords.size).toBeGreaterThan(1);
      });
    });

    describe('Deterministic Behavior', () => {
      it('should return same data on multiple calls', () => {
        const playlist1 = PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = PlaylistDataProvider.loadInitialPlaylist();
        const playlist3 = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist1).toEqual(playlist2);
        expect(playlist2).toEqual(playlist3);
      });

      it('should return same number of songs every time', () => {
        const playlist1 = PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = PlaylistDataProvider.loadInitialPlaylist();

        expect(playlist1.length).toBe(playlist2.length);
      });

      it('should return songs in same order every time', () => {
        const playlist1 = PlaylistDataProvider.loadInitialPlaylist();
        const playlist2 = PlaylistDataProvider.loadInitialPlaylist();

        playlist1.forEach((song, index) => {
          expect(song.id).toBe(playlist2[index].id);
          expect(song.title).toBe(playlist2[index].title);
        });
      });

      it('should be a pure function (no side effects)', () => {
        const consoleSpy = jest.spyOn(console, 'log');

        PlaylistDataProvider.loadInitialPlaylist();

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

    it('should return same data as loadInitialPlaylist', () => {
      const initialPlaylist = PlaylistDataProvider.loadInitialPlaylist();
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
    it('should return songs that pass AudioValidator validation', () => {
      const playlist = PlaylistDataProvider.loadInitialPlaylist();

      playlist.forEach(song => {
        const validationResult = AudioValidator.validateSong(song);
        
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);
      });
    });

    it('should provide data compatible with usePlaylist hook', () => {
      const playlist = PlaylistDataProvider.loadInitialPlaylist();

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

    it('should provide data that can be rendered in Playlist component', () => {
      const playlist = PlaylistDataProvider.loadInitialPlaylist();

      // All display fields should be non-empty
      playlist.forEach(song => {
        expect(song.title.length).toBeGreaterThan(0);
        expect(song.artist.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple consecutive calls', () => {
      for (let i = 0; i < 10; i++) {
        const playlist = PlaylistDataProvider.loadInitialPlaylist();
        expect(playlist.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('should return new array reference (immutability)', () => {
      const playlist1 = PlaylistDataProvider.loadInitialPlaylist();
      const playlist2 = PlaylistDataProvider.loadInitialPlaylist();

      // Should be equal but not same reference
      expect(playlist1).toEqual(playlist2);
      expect(playlist1).not.toBe(playlist2);
    });

    it('should not cause memory leaks with repeated calls', () => {
      const initialMemory = process.memoryUsage?.heapUsed || 0;

      for (let i = 0; i < 1000; i++) {
        PlaylistDataProvider.loadInitialPlaylist();
      }

      const finalMemory = process.memoryUsage?.heapUsed || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 10MB for 1000 calls)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Type Safety', () => {
    it('should return Song[] type', () => {
      const playlist: Song[] = PlaylistDataProvider.loadInitialPlaylist();

      expect(Array.isArray(playlist)).toBe(true);
    });

    it('should have proper TypeScript types for all songs', () => {
      const playlist = PlaylistDataProvider.loadInitialPlaylist();

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
```

---

# Respuesta (FIX 1)

### Respuesta (FIX 1) {toggle="true"}
<details>
<summary>**Prompt:**</summary>
```typescript
 FAIL  tests/data/playlist-data-provider.test.ts
  PlaylistDataProvider
    loadInitialPlaylist
      Basic Structure
        ✕ should return an array (64 ms)
        ✕ should return at least 5 songs (6 ms)
        ✕ should return reasonable number of songs (≤20) (6 ms)
        ✕ should return Song objects with all required fields (5 ms)
        ✓ should return Song[] type (6 ms)
      Song IDs
        ✕ should have non-empty ID for each song (5 ms)
        ✕ should have unique IDs for all songs (4 ms)
        ✕ should not have duplicate IDs (4 ms)
      Song Titles
        ✕ should have non-empty title for each song (5 ms)
        ✕ should have creative titles (not generic like "Song 1") (5 ms)
        ✕ should have realistic, creative titles (4 ms)
        ✕ should not have duplicate titles (9 ms)
      Song Artists
        ✕ should have non-empty artist for each song (3 ms)
        ✕ should have creative artist names (not generic like "Artist 1") (5 ms)
        ✕ should have multiple different artists (genre diversity) (4 ms)
      Cover URLs
        ✕ should have non-empty cover URL for each song (12 ms)
        ✕ should have valid URL format for covers (4 ms)
        ✕ should reference cover image paths (4 ms)
      Audio URLs
        ✕ should have non-empty audio URL for each song (4 ms)
        ✕ should have valid URL format for audio files (4 ms)
        ✕ should reference /songs/ directory in audio URLs (4 ms)
        ✕ should have audio file extensions (4 ms)
      Data Quality
        ✕ should have professional, realistic song data (4 ms)
        ✕ should imply genre diversity through titles and artists (3 ms)
        ✕ should have creative and varied song titles (3 ms)
      Deterministic Behavior
        ✓ should return same data on multiple calls (9 ms)
        ✓ should return same number of songs every time (6 ms)
        ✕ should return songs in same order every time (9 ms)
        ✓ should be a pure function (no side effects) (4 ms)
    getDefaultPlaylist
      ✓ should return Song array (1 ms)
      ✕ should return same data as loadInitialPlaylist (5 ms)
      ✓ should return valid Song objects (5 ms)
    fetchFromJSON (stub)
      ✓ should exist as a function (1 ms)
      ✓ should return a Promise (4 ms)
      ✓ should resolve with Song array (3 ms)
      ✓ should not break when called (4 ms)
    Integration Tests
      ✕ should return songs that pass AudioValidator validation (3 ms)
      ✕ should provide data compatible with usePlaylist hook (4 ms)
      ✕ should provide data that can be rendered in Playlist component (7 ms)
    Edge Cases
      ✕ should handle multiple consecutive calls (3 ms)
      ✓ should return new array reference (immutability) (6 ms)
      ✓ should not cause memory leaks with repeated calls (2604 ms)
    Type Safety
      ✕ should return Song[] type (4 ms)
      ✕ should have proper TypeScript types for all songs (4 ms)

  ● PlaylistDataProvider › loadInitialPlaylist › Basic Structure › should return an array

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      13 |
      14 |         // ASSERT
    > 15 |         expect(Array.isArray(playlist)).toBe(true);
         |                                         ^
      16 |       });
      17 |
      18 |       it('should return at least 5 songs', () => {

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:15:41)

  ● PlaylistDataProvider › loadInitialPlaylist › Basic Structure › should return at least 5 songs

    expect(received).toBeGreaterThanOrEqual(expected)

    Matcher error: received value must be a number or bigint

    Received has value: undefined

      19 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      20 |
    > 21 |         expect(playlist.length).toBeGreaterThanOrEqual(5);
         |                                 ^
      22 |       });
      23 |
      24 |       it('should return reasonable number of songs (≤20)', () => {

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:21:33)

  ● PlaylistDataProvider › loadInitialPlaylist › Basic Structure › should return reasonable number of songs (≤20)

    expect(received).toBeLessThanOrEqual(expected)

    Matcher error: received value must be a number or bigint

    Received has value: undefined

      25 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      26 |
    > 27 |         expect(playlist.length).toBeLessThanOrEqual(20);
         |                                 ^
      28 |       });
      29 |
      30 |       it('should return Song objects with all required fields', () => {

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:27:33)

  ● PlaylistDataProvider › loadInitialPlaylist › Basic Structure › should return Song objects with all required fields

    TypeError: playlist.forEach is not a function

      31 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      32 |
    > 33 |         playlist.forEach(song => {
         |                  ^
      34 |           expect(song).toHaveProperty('id');
      35 |           expect(song).toHaveProperty('title');
      36 |           expect(song).toHaveProperty('artist');

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:33:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Song IDs › should have non-empty ID for each song

    TypeError: playlist.forEach is not a function

      51 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      52 |
    > 53 |         playlist.forEach(song => {
         |                  ^
      54 |           expect(song.id).toBeTruthy();
      55 |           expect(typeof song.id).toBe('string');
      56 |           expect(song.id.length).toBeGreaterThan(0);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:53:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Song IDs › should have unique IDs for all songs

    TypeError: playlist.map is not a function

      61 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      62 |
    > 63 |         const ids = playlist.map(song => song.id);
         |                              ^
      64 |         const uniqueIds = new Set(ids);
      65 |
      66 |         expect(uniqueIds.size).toBe(playlist.length);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:63:30)

  ● PlaylistDataProvider › loadInitialPlaylist › Song IDs › should not have duplicate IDs

    TypeError: playlist.map is not a function

      70 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      71 |
    > 72 |         const ids = playlist.map(song => song.id);
         |                              ^
      73 |         const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      74 |
      75 |         expect(duplicates).toHaveLength(0);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:72:30)

  ● PlaylistDataProvider › loadInitialPlaylist › Song Titles › should have non-empty title for each song

    TypeError: playlist.forEach is not a function

      81 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      82 |
    > 83 |         playlist.forEach(song => {
         |                  ^
      84 |           expect(song.title).toBeTruthy();
      85 |           expect(typeof song.title).toBe('string');
      86 |           expect(song.title.length).toBeGreaterThan(0);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:83:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Song Titles › should have creative titles (not generic like "Song 1")

    TypeError: playlist.forEach is not a function

      91 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      92 |
    > 93 |         playlist.forEach(song => {
         |                  ^
      94 |           // Should NOT match patterns like "Song 1", "Song 2", "Test Song 1"
      95 |           expect(song.title).not.toMatch(/^Song \d+$/i);
      96 |           expect(song.title).not.toMatch(/^Test Song \d+$/i);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:93:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Song Titles › should have realistic, creative titles

    TypeError: playlist.forEach is not a function

      103 |
      104 |         // Check that titles have some creativity (multiple words, capitalization, etc.)
    > 105 |         playlist.forEach(song => {
          |                  ^
      106 |           expect(song.title.length).toBeGreaterThan(3); // Not just "ABC"
      107 |         });
      108 |       });

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:105:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Song Titles › should not have duplicate titles

    TypeError: playlist.map is not a function

      111 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      112 |
    > 113 |         const titles = playlist.map(song => song.title);
          |                                 ^
      114 |         const uniqueTitles = new Set(titles);
      115 |
      116 |         expect(uniqueTitles.size).toBe(playlist.length);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:113:33)

  ● PlaylistDataProvider › loadInitialPlaylist › Song Artists › should have non-empty artist for each song

    TypeError: playlist.forEach is not a function

      122 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      123 |
    > 124 |         playlist.forEach(song => {
          |                  ^
      125 |           expect(song.artist).toBeTruthy();
      126 |           expect(typeof song.artist).toBe('string');
      127 |           expect(song.artist.length).toBeGreaterThan(0);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:124:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Song Artists › should have creative artist names (not generic like "Artist 1")

    TypeError: playlist.forEach is not a function

      132 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      133 |
    > 134 |         playlist.forEach(song => {
          |                  ^
      135 |           expect(song.artist).not.toMatch(/^Artist \d+$/i);
      136 |           expect(song.artist).not.toMatch(/^Test Artist \d+$/i);
      137 |           expect(song.artist).not.toMatch(/^Unknown Artist$/i);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:134:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Song Artists › should have multiple different artists (genre diversity)

    TypeError: playlist.map is not a function

      142 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      143 |
    > 144 |         const artists = playlist.map(song => song.artist);
          |                                  ^
      145 |         const uniqueArtists = new Set(artists);
      146 |
      147 |         // Should have at least 3 different artists for diversity

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:144:34)

  ● PlaylistDataProvider › loadInitialPlaylist › Cover URLs › should have non-empty cover URL for each song

    TypeError: playlist.forEach is not a function

      154 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      155 |
    > 156 |         playlist.forEach(song => {
          |                  ^
      157 |           expect(song.cover).toBeTruthy();
      158 |           expect(typeof song.cover).toBe('string');
      159 |           expect(song.cover.length).toBeGreaterThan(0);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:156:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Cover URLs › should have valid URL format for covers

    TypeError: playlist.forEach is not a function

      164 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      165 |
    > 166 |         playlist.forEach(song => {
          |                  ^
      167 |           // Should be valid URL format (http://, https://, or relative path)
      168 |           expect(
      169 |             song.cover.startsWith('http://') ||

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:166:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Cover URLs › should reference cover image paths

    TypeError: playlist.filter is not a function

      179 |
      180 |         // Most covers should reference a /covers/ directory or similar
    > 181 |         const coversInDirectory = playlist.filter(song => 
          |                                            ^
      182 |           song.cover.includes('/covers/') || song.cover.includes('cover')
      183 |         );
      184 |

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:181:44)

  ● PlaylistDataProvider › loadInitialPlaylist › Audio URLs › should have non-empty audio URL for each song

    TypeError: playlist.forEach is not a function

      191 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      192 |
    > 193 |         playlist.forEach(song => {
          |                  ^
      194 |           expect(song.url).toBeTruthy();
      195 |           expect(typeof song.url).toBe('string');
      196 |           expect(song.url.length).toBeGreaterThan(0);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:193:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Audio URLs › should have valid URL format for audio files

    TypeError: playlist.forEach is not a function

      201 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      202 |
    > 203 |         playlist.forEach(song => {
          |                  ^
      204 |           expect(
      205 |             song.url.startsWith('http://') ||
      206 |             song.url.startsWith('https://') ||

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:203:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Audio URLs › should reference /songs/ directory in audio URLs

    TypeError: playlist.filter is not a function

      215 |
      216 |         // Most URLs should reference a /songs/ directory
    > 217 |         const songsInDirectory = playlist.filter(song => 
          |                                           ^
      218 |           song.url.includes('/songs/') || song.url.includes('/audio/')
      219 |         );
      220 |

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:217:43)

  ● PlaylistDataProvider › loadInitialPlaylist › Audio URLs › should have audio file extensions

    TypeError: playlist.forEach is not a function

      225 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      226 |
    > 227 |         playlist.forEach(song => {
          |                  ^
      228 |           const hasAudioExtension = 
      229 |             song.url.toLowerCase().includes('.mp3') ||
      230 |             song.url.toLowerCase().includes('.wav') ||

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:227:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Data Quality › should have professional, realistic song data

    TypeError: playlist.forEach is not a function

      241 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
      242 |
    > 243 |         playlist.forEach(song => {
          |                  ^
      244 |           // Titles should be more than just one word
      245 |           const titleWordCount = song.title.split(/\s+/).length;
      246 |           expect(titleWordCount).toBeGreaterThan(0);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:243:18)

  ● PlaylistDataProvider › loadInitialPlaylist › Data Quality › should imply genre diversity through titles and artists

    TypeError: playlist.map is not a function

      256 |
      257 |         // Check that not all songs have same artist
    > 258 |         const artists = playlist.map(song => song.artist);
          |                                  ^
      259 |         const uniqueArtists = new Set(artists);
      260 |
      261 |         expect(uniqueArtists.size).toBeGreaterThanOrEqual(3);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:258:34)

  ● PlaylistDataProvider › loadInitialPlaylist › Data Quality › should have creative and varied song titles

    TypeError: playlist.map is not a function

      266 |
      267 |         // Check title diversity - not all starting with same word
    > 268 |         const firstWords = playlist.map(song => song.title.split(' ')[0]);
          |                                     ^
      269 |         const uniqueFirstWords = new Set(firstWords);
      270 |
      271 |         expect(uniqueFirstWords.size).toBeGreaterThan(1);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:268:37)

  ● PlaylistDataProvider › loadInitialPlaylist › Deterministic Behavior › should return songs in same order every time

    TypeError: playlist1.forEach is not a function

      294 |         const playlist2 = PlaylistDataProvider.loadInitialPlaylist();
      295 |
    > 296 |         playlist1.forEach((song, index) => {
          |                   ^
      297 |           expect(song.id).toBe(playlist2[index].id);
      298 |           expect(song.title).toBe(playlist2[index].title);
      299 |         });

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:296:19)

  ● PlaylistDataProvider › getDefaultPlaylist › should return same data as loadInitialPlaylist

    expect(received).toEqual(expected) // deep equality

    Expected: {}
    Received: [{"artist": "Luna Eclipse", "cover": "/covers/default-cover.jpg", "id": "1", "title": "Midnight Serenade", "url": "/songs/sample-song-1.mp3"}, {"artist": "Neon Horizon", "cover": "/covers/default-cover.jpg", "id": "2", "title": "Electric Dawn", "url": "/songs/sample-song-2.mp3"}, {"artist": "Sophie Martin Quartet", "cover": "/covers/default-cover.jpg", "id": "3", "title": "Jazz in Paris", "url": "/songs/sample-song-3.mp3"}, {"artist": "The Coastal Collective", "cover": "/covers/default-cover.jpg", "id": "4", "title": "Summer Breeze", "url": "/songs/sample-song-4.mp3"}, {"artist": "Classical Orchestra", "cover": "/covers/default-cover.jpg", "id": "5", "title": "Symphony No. 5 (Excerpt)", "url": "/songs/sample-song-5.mp3"}, {"artist": "The Wild Ones", "cover": "/covers/default-cover.jpg", "id": "6", "title": "Rock Anthem", "url": "/songs/sample-song-6.mp3"}, {"artist": "Lo-Fi Dreamer", "cover": "/covers/default-cover.jpg", "id": "7", "title": "Chill Vibes", "url": "/songs/sample-song-7.mp3"}]

      323 |       const defaultPlaylist = PlaylistDataProvider.getDefaultPlaylist();
      324 |
    > 325 |       expect(defaultPlaylist).toEqual(initialPlaylist);
          |                               ^
      326 |     });
      327 |
      328 |     it('should return valid Song objects', () => {

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:325:31)

  ● PlaylistDataProvider › Integration Tests › should return songs that pass AudioValidator validation

    TypeError: playlist.forEach is not a function

      368 |       const playlist = PlaylistDataProvider.loadInitialPlaylist();
      369 |
    > 370 |       playlist.forEach(song => {
          |                ^
      371 |         const validationResult = AudioValidator.validateSong(song);
      372 |         
      373 |         expect(validationResult.isValid).toBe(true);

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:370:16)

  ● PlaylistDataProvider › Integration Tests › should provide data compatible with usePlaylist hook

    expect(received).toBeGreaterThan(expected)

    Matcher error: received value must be a number or bigint

    Received has value: undefined

      380 |
      381 |       // Should be a non-empty array
    > 382 |       expect(playlist.length).toBeGreaterThan(0);
          |                               ^
      383 |       
      384 |       // Should have all required Song properties
      385 |       playlist.forEach(song => {

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:382:31)

  ● PlaylistDataProvider › Integration Tests › should provide data that can be rendered in Playlist component

    TypeError: playlist.forEach is not a function

      396 |
      397 |       // All display fields should be non-empty
    > 398 |       playlist.forEach(song => {
          |                ^
      399 |         expect(song.title.length).toBeGreaterThan(0);
      400 |         expect(song.artist.length).toBeGreaterThan(0);
      401 |       });

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:398:16)

  ● PlaylistDataProvider › Edge Cases › should handle multiple consecutive calls

    expect(received).toBeGreaterThanOrEqual(expected)

    Matcher error: received value must be a number or bigint

    Received has value: undefined

      407 |       for (let i = 0; i < 10; i++) {
      408 |         const playlist = PlaylistDataProvider.loadInitialPlaylist();
    > 409 |         expect(playlist.length).toBeGreaterThanOrEqual(5);
          |                                 ^
      410 |       }
      411 |     });
      412 |

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:409:33)

  ● PlaylistDataProvider › Type Safety › should return Song[] type

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      439 |       const playlist: Song[] = PlaylistDataProvider.loadInitialPlaylist();
      440 |
    > 441 |       expect(Array.isArray(playlist)).toBe(true);
          |                                       ^
      442 |     });
      443 |
      444 |     it('should have proper TypeScript types for all songs', () => {

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:441:39)

  ● PlaylistDataProvider › Type Safety › should have proper TypeScript types for all songs

    TypeError: playlist.forEach is not a function

      445 |       const playlist = PlaylistDataProvider.loadInitialPlaylist();
      446 |
    > 447 |       playlist.forEach((song: Song) => {
          |                ^
      448 |         const id: string = song.id;
      449 |         const title: string = song.title;
      450 |         const artist: string = song.artist;

      at Object.<anonymous> (tests/data/playlist-data-provider.test.ts:447:16)

Test Suites: 1 failed, 1 total
Tests:       32 failed, 12 passed, 44 total
Snapshots:   0 total
Time:        4.315 s
Ran all test suites matching /tests\/data\/playlist-data-provider.test.ts/i.
```
</details>
<details>
<summary>**Respuesta:**</summary>
Looking at the failing tests, I can see that the `loadInitialPlaylist` method returns a Promise, not an array directly. This is because the function is async and returns a Promise\<Song\[\]\>. I need to update the tests to await the results.
Let me fix the tests:
```typescript
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

```
</details>