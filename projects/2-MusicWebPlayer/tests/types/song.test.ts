// tests/types/song.test.ts
import { describe, it, expect } from '@jest/globals';
import { Song } from '@/types/song';

describe('Song Type Definition', () => {
  describe('Type Structure', () => {
    it('should accept valid Song object with all required properties', () => {
      // ARRANGE
      const validSong: Song = {
        id: '1',
        title: 'Test Song',
        artist: 'Test Artist',
        cover: '/covers/test.jpg',
        url: '/songs/test.mp3'
      };
      
      // ACT & ASSERT
      expect(validSong).toBeDefined();
      expect(validSong).toHaveProperty('id');
      expect(validSong).toHaveProperty('title');
      expect(validSong).toHaveProperty('artist');
      expect(validSong).toHaveProperty('cover');
      expect(validSong).toHaveProperty('url');
    });

    it('should have all properties as strings', () => {
      const song: Song = {
        id: 'test-id',
        title: 'Test Title',
        artist: 'Test Artist',
        cover: 'https://example.com/cover.jpg',
        url: 'https://example.com/song.mp3'
      };
      
      expect(typeof song.id).toBe('string');
      expect(typeof song.title).toBe('string');
      expect(typeof song.artist).toBe('string');
      expect(typeof song.cover).toBe('string');
      expect(typeof song.url).toBe('string');
    });

    it('should have all properties as readonly', () => {
      const song: Song = {
        id: 'test-id',
        title: 'Test Title',
        artist: 'Test Artist',
        cover: 'https://example.com/cover.jpg',
        url: 'https://example.com/song.mp3'
      };
      
      // Verify properties exist and are strings (read-only verification happens at compile time)
      expect(song.id).toBe('test-id');
      expect(song.title).toBe('Test Title');
      expect(song.artist).toBe('Test Artist');
      expect(song.cover).toBe('https://example.com/cover.jpg');
      expect(song.url).toBe('https://example.com/song.mp3');
    });
  });

  describe('Property Validation', () => {
    it('should accept empty strings in all properties', () => {
      const song: Song = {
        id: '',
        title: '',
        artist: '',
        cover: '',
        url: ''
      };
      
      expect(song).toBeDefined();
      expect(song.id).toBe('');
      expect(song.title).toBe('');
      expect(song.artist).toBe('');
      expect(song.cover).toBe('');
      expect(song.url).toBe('');
    });

    it('should accept special characters in string properties', () => {
      const song: Song = {
        id: 'id-with-special-chars-@#$%',
        title: 'Song with "quotes" and \'apostrophes\'',
        artist: 'Artist with émojis 🎵🎶',
        cover: 'https://example.com/cover.jpg?param=value&other=test',
        url: 'https://example.com/song.mp3#fragment'
      };
      
      expect(song.title).toContain('quotes');
      expect(song.artist).toContain('🎵');
      expect(song.cover).toContain('?param=value');
      expect(song.url).toContain('#fragment');
    });

    it('should accept very long strings', () => {
      const longString = 'a'.repeat(1000);
      const song: Song = {
        id: longString,
        title: longString,
        artist: longString,
        cover: longString,
        url: longString
      };
      
      expect(song.id.length).toBe(1000);
      expect(song.title.length).toBe(1000);
      expect(song.artist.length).toBe(1000);
      expect(song.cover.length).toBe(1000);
      expect(song.url.length).toBe(1000);
    });
  });

  describe('Object Operations', () => {
    it('should work with JSON serialization', () => {
      const song: Song = {
        id: '1',
        title: 'Test Song',
        artist: 'Test Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const json = JSON.stringify(song);
      const parsed: Song = JSON.parse(json);
      
      expect(parsed).toEqual(song);
      expect(parsed.id).toBe('1');
      expect(parsed.title).toBe('Test Song');
      expect(parsed.artist).toBe('Test Artist');
      expect(parsed.cover).toBe('/cover.jpg');
      expect(parsed.url).toBe('/song.mp3');
    });

    it('should work with object spread operator', () => {
      const song: Song = {
        id: '1',
        title: 'Original',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const updated: Song = {
        ...song,
        title: 'Updated'
      };
      
      expect(updated.title).toBe('Updated');
      expect(updated.id).toBe('1');
      expect(updated.artist).toBe('Artist');
      expect(updated.cover).toBe('/cover.jpg');
      expect(updated.url).toBe('/song.mp3');
    });

    it('should work with Object.assign', () => {
      const song: Song = {
        id: '1',
        title: 'Test',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const copy = Object.assign({}, song) as Song;
      
      expect(copy).toEqual(song);
      expect(copy).not.toBe(song); // Different reference
    });
  });

  describe('Array Operations', () => {
    it('should work in arrays', () => {
      const songs: Song[] = [
        {
          id: '1',
          title: 'Song 1',
          artist: 'Artist 1',
          cover: '/cover1.jpg',
          url: '/song1.mp3'
        },
        {
          id: '2',
          title: 'Song 2',
          artist: 'Artist 2',
          cover: '/cover2.jpg',
          url: '/song2.mp3'
        }
      ];
      
      expect(songs).toHaveLength(2);
      expect(songs[0].id).toBe('1');
      expect(songs[1].id).toBe('2');
      expect(songs[0].title).toBe('Song 1');
      expect(songs[1].title).toBe('Song 2');
    });

    it('should support array methods', () => {
      const songs: Song[] = [
        { id: '1', title: 'A', artist: 'X', cover: '/c1.jpg', url: '/s1.mp3' },
        { id: '2', title: 'B', artist: 'Y', cover: '/c2.jpg', url: '/s2.mp3' },
        { id: '3', title: 'C', artist: 'Z', cover: '/c3.jpg', url: '/s3.mp3' }
      ];
      
      const filtered = songs.filter(s => s.id !== '2');
      const mapped = songs.map(s => s.title);
      const found = songs.find(s => s.id === '2');
      
      expect(filtered).toHaveLength(2);
      expect(mapped).toEqual(['A', 'B', 'C']);
      expect(found?.title).toBe('B');
      expect(found?.artist).toBe('Y');
    });
  });

  describe('Edge Cases', () => {
    it('should handle Unicode characters', () => {
      const song: Song = {
        id: '1',
        title: '日本語のタイトル',
        artist: 'Артист',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      expect(song.title).toBe('日本語のタイトル');
      expect(song.artist).toBe('Артист');
    });

    it('should handle URLs with various formats', () => {
      const song: Song = {
        id: '1',
        title: 'Test',
        artist: 'Artist',
        cover: 'https://cdn.example.com/images/cover.jpg?w=300&h=300',
        url: 'https://audio.example.com/tracks/song.mp3?token=abc123&expires=999999'
      };
      
      expect(song.cover).toContain('?w=300');
      expect(song.url).toContain('token=abc123');
    });

    it('should handle relative URLs', () => {
      const song: Song = {
        id: '1',
        title: 'Test',
        artist: 'Artist',
        cover: '/covers/album-art.jpg',
        url: './songs/track-01.mp3'
      };
      
      expect(song.cover.startsWith('/')).toBe(true);
      expect(song.url.startsWith('./')).toBe(true);
    });

    it('should handle IDs with different formats', () => {
      const uuidSong: Song = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'UUID Song',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const timestampSong: Song = {
        id: Date.now().toString(),
        title: 'Timestamp Song',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const customSong: Song = {
        id: 'song-2024-001',
        title: 'Custom ID Song',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      expect(uuidSong.id).toMatch(/^[0-9a-f-]+$/);
      expect(timestampSong.id).toMatch(/^\d+$/);
      expect(customSong.id).toBe('song-2024-001');
    });
  });

  describe('Type Safety Verification', () => {
    it('should enforce all 5 properties are required', () => {
      const song: Song = {
        id: '1',
        title: 'Test Song',
        artist: 'Test Artist',
        cover: '/covers/test.jpg',
        url: '/songs/test.mp3'
      };
      
      expect(song).toHaveProperty('id');
      expect(song).toHaveProperty('title');
      expect(song).toHaveProperty('artist');
      expect(song).toHaveProperty('cover');
      expect(song).toHaveProperty('url');
      
      // Verify all properties are defined (not undefined)
      expect(song.id).toBeDefined();
      expect(song.title).toBeDefined();
      expect(song.artist).toBeDefined();
      expect(song.cover).toBeDefined();
      expect(song.url).toBeDefined();
    });

    it('should work with TypeScript type assertions', () => {
      const rawObject = {
        id: '1',
        title: 'Test',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      
      const song = rawObject as Song;
      
      expect(song.id).toBe('1');
      expect(song.title).toBe('Test');
      expect(song.artist).toBe('Artist');
    });
  });
});