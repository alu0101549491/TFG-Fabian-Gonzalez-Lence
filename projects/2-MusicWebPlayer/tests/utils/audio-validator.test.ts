// tests/utils/audio-validator.test.ts
import { describe, it, expect } from '@jest/globals';
import { AudioValidator } from '@/utils/audio-validator';
import { Song } from '@/types/song';
import { ValidationResult } from '@/types/validation';

describe('AudioValidator Utility', () => {
  describe('validateSong', () => {
    describe('Valid Songs', () => {
      it('should return valid result for complete valid song', () => {
        // ARRANGE
        const validSong: Song = {
          id: 'song-1',
          title: 'Test Song',
          artist: 'Test Artist',
          cover: 'https://example.com/cover.jpg',
          url: 'https://example.com/song.mp3'
        };
        // ACT
        const result: ValidationResult = AudioValidator.validateSong(validSong);
        // ASSERT
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate song with HTTP URLs', () => {
        const song: Song = {
          id: '1',
          title: 'Song',
          artist: 'Artist',
          cover: 'http://example.com/cover.jpg',
          url: 'http://example.com/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });

      it('should validate song with relative URLs', () => {
        const song: Song = {
          id: '1',
          title: 'Song',
          artist: 'Artist',
          cover: '/covers/cover.jpg',
          url: '/songs/song.wav'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });

      it('should validate song with query parameters', () => {
        const song: Song = {
          id: '1',
          title: 'Song',
          artist: 'Artist',
          cover: 'https://example.com/cover.jpg?w=300&h=300',
          url: 'https://example.com/song.mp3?token=abc123'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });

      it('should validate songs with all supported audio formats', () => {
        const formats = ['mp3', 'wav', 'ogg', 'm4a'];
        formats.forEach(format => {
          const song: Song = {
            id: '1',
            title: 'Song',
            artist: 'Artist',
            cover: '/cover.jpg',
            url: `/song.${format}`
          };
          const result = AudioValidator.validateSong(song);
          expect(result.isValid).toBe(true);
        });
      });
    });

    describe('Title Validation', () => {
      it('should reject song with empty title', () => {
        const song: Song = {
          id: '1',
          title: '',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should reject song with whitespace-only title', () => {
        const song: Song = {
          id: '1',
          title: '   ',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
      });

      it('should accept title with leading/trailing whitespace (after trim)', () => {
        const song: Song = {
          id: '1',
          title: '  Valid Title  ',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });

      it('should accept title with special characters', () => {
        const song: Song = {
          id: '1',
          title: 'Song "Title" with \'quotes\' & symbols!',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });

      it('should accept very long title', () => {
        const song: Song = {
          id: '1',
          title: 'a'.repeat(1000),
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Artist Validation', () => {
      it('should reject song with empty artist', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: '',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Artist is required');
      });

      it('should reject song with whitespace-only artist', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: '   ',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Artist is required');
      });

      it('should accept artist with leading/trailing whitespace (after trim)', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: '  Valid Artist  ',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Cover URL Validation', () => {
      it('should accept valid HTTPS cover URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: 'https://example.com/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });

      it('should accept valid relative cover URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/covers/album.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid cover URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: 'not-a-valid-url',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Cover URL must be a valid URL');
      });

      it('should reject empty cover URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Cover URL must be a valid URL');
      });
    });

    describe('Audio URL Validation', () => {
      it('should accept valid audio URL with supported format', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: 'https://example.com/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid audio URL', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: 'not-a-valid-url'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Audio URL must be a valid URL');
      });

      it('should reject valid URL with unsupported format', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: 'https://example.com/song.flac'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Audio format must be MP3, WAV, OGG, or M4A');
      });

      it('should accept audio URL with query parameters', () => {
        const song: Song = {
          id: '1',
          title: 'Title',
          artist: 'Artist',
          cover: '/cover.jpg',
          url: '/song.mp3?token=abc&expires=999'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Error Accumulation', () => {
      it('should accumulate multiple errors (not fail-fast)', () => {
        const song: Song = {
          id: '1',
          title: '',
          artist: '',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors).toContain('Title is required');
        expect(result.errors).toContain('Artist is required');
      });

      it('should accumulate all possible errors', () => {
        const song: Song = {
          id: '1',
          title: '',
          artist: '',
          cover: 'invalid-url',
          url: 'invalid-url'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(4);
        expect(result.errors).toContain('Title is required');
        expect(result.errors).toContain('Artist is required');
        expect(result.errors).toContain('Cover URL must be a valid URL');
        expect(result.errors).toContain('Audio URL must be a valid URL');
      });

      it('should return errors in consistent order', () => {
        const song1: Song = {
          id: '1',
          title: '',
          artist: '',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const song2: Song = {
          id: '2',
          title: '',
          artist: '',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result1 = AudioValidator.validateSong(song1);
        const result2 = AudioValidator.validateSong(song2);
        expect(result1.errors).toEqual(result2.errors);
      });
    });
  });

  describe('isValidAudioUrl', () => {
    describe('Valid Audio URLs', () => {
      it('should accept HTTP URL with .mp3', () => {
        expect(AudioValidator.isValidAudioUrl('http://example.com/song.mp3')).toBe(true);
      });
      it('should accept HTTPS URL with .wav', () => {
        expect(AudioValidator.isValidAudioUrl('https://example.com/song.wav')).toBe(true);
      });
      it('should accept relative path with .ogg', () => {
        expect(AudioValidator.isValidAudioUrl('/songs/track.ogg')).toBe(true);
      });
      it('should accept URL with .m4a extension', () => {
        expect(AudioValidator.isValidAudioUrl('https://example.com/audio.m4a')).toBe(true);
      });
      it('should accept URL with query parameters', () => {
        expect(AudioValidator.isValidAudioUrl('/song.mp3?token=abc123')).toBe(true);
      });
      it('should accept URL with fragment', () => {
        expect(AudioValidator.isValidAudioUrl('/song.mp3#start')).toBe(true);
      });
      it('should accept URL with query and fragment', () => {
        expect(AudioValidator.isValidAudioUrl('/song.mp3?token=abc#start')).toBe(true);
      });
      it('should accept case-insensitive extensions', () => {
        expect(AudioValidator.isValidAudioUrl('/song.MP3')).toBe(true);
        expect(AudioValidator.isValidAudioUrl('/song.Wav')).toBe(true);
        expect(AudioValidator.isValidAudioUrl('/song.OGG')).toBe(true);
      });
    });

    describe('Invalid Audio URLs', () => {
      it('should reject invalid URL format', () => {
        expect(AudioValidator.isValidAudioUrl('not-a-url')).toBe(false);
      });
      it('should reject empty string', () => {
        expect(AudioValidator.isValidAudioUrl('')).toBe(false);
      });
      it('should reject URL with wrong protocol', () => {
        expect(AudioValidator.isValidAudioUrl('ftp://example.com/song.mp3')).toBe(false);
      });
    });
  });

  describe('isValidImageUrl', () => {
    describe('Valid Image URLs', () => {
      it('should accept HTTP URL', () => {
        expect(AudioValidator.isValidImageUrl('http://example.com/image.jpg')).toBe(true);
      });
      it('should accept HTTPS URL', () => {
        expect(AudioValidator.isValidImageUrl('https://example.com/image.png')).toBe(true);
      });
      it('should accept relative path', () => {
        expect(AudioValidator.isValidImageUrl('/covers/album.jpg')).toBe(true);
        expect(AudioValidator.isValidImageUrl('./covers/album.png')).toBe(true);
      });
      it('should accept URL with query parameters', () => {
        expect(AudioValidator.isValidImageUrl('https://example.com/image.jpg?w=300&h=300')).toBe(true);
      });
      it('should accept URL with any extension (no format checking)', () => {
        expect(AudioValidator.isValidImageUrl('https://example.com/image.webp')).toBe(true);
        expect(AudioValidator.isValidImageUrl('https://example.com/file.pdf')).toBe(true);
      });
    });

    describe('Invalid Image URLs', () => {
      it('should reject invalid URL format', () => {
        expect(AudioValidator.isValidImageUrl('not-a-url')).toBe(false);
      });
      it('should reject empty string', () => {
        expect(AudioValidator.isValidImageUrl('')).toBe(false);
      });
      it('should reject malformed URL', () => {
        expect(AudioValidator.isValidImageUrl('ht!tp://invalid')).toBe(false);
      });
    });
  });

  describe('isSupportedFormat', () => {
    describe('Supported Formats', () => {
      it('should return true for .mp3 extension', () => {
        expect(AudioValidator.isSupportedFormat('/song.mp3')).toBe(true);
      });
      it('should return true for .wav extension', () => {
        expect(AudioValidator.isSupportedFormat('/song.wav')).toBe(true);
      });
      it('should return true for .ogg extension', () => {
        expect(AudioValidator.isSupportedFormat('/song.ogg')).toBe(true);
      });
      it('should return true for .m4a extension', () => {
        expect(AudioValidator.isSupportedFormat('/song.m4a')).toBe(true);
      });
      it('should be case-insensitive', () => {
        expect(AudioValidator.isSupportedFormat('/song.MP3')).toBe(true);
        expect(AudioValidator.isSupportedFormat('/song.Wav')).toBe(true);
        expect(AudioValidator.isSupportedFormat('/song.OGG')).toBe(true);
        expect(AudioValidator.isSupportedFormat('/song.M4A')).toBe(true);
      });
      it('should handle URLs with query parameters', () => {
        expect(AudioValidator.isSupportedFormat('/song.mp3?token=abc123')).toBe(true);
      });
      it('should handle URLs with fragment', () => {
        expect(AudioValidator.isSupportedFormat('/song.mp3#start')).toBe(true);
      });
    });

    describe('Unsupported Formats', () => {
      it('should return false for .flac extension', () => {
        expect(AudioValidator.isSupportedFormat('/song.flac')).toBe(false);
      });
      it('should return false for .aac extension', () => {
        expect(AudioValidator.isSupportedFormat('/song.aac')).toBe(false);
      });
      it('should return false for .wma extension', () => {
        expect(AudioValidator.isSupportedFormat('/song.wma')).toBe(false);
      });
      it('should return false for .mp4 extension (video)', () => {
        expect(AudioValidator.isSupportedFormat('/video.mp4')).toBe(false);
      });
      it('should return false for no extension', () => {
        expect(AudioValidator.isSupportedFormat('/song')).toBe(false);
      });
      it('should return false for invalid URL', () => {
        expect(AudioValidator.isSupportedFormat('invalid')).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    describe('URL with Multiple Dots', () => {
      it('should handle filename with multiple dots', () => {
        expect(AudioValidator.isSupportedFormat('/path/song.backup.mp3')).toBe(true);
      });
    });
    describe('URL with Encoded Characters', () => {
      it('should handle URL-encoded characters', () => {
        expect(AudioValidator.isValidAudioUrl('/song%20name.mp3')).toBe(true);
      });
    });
    describe('Very Long URLs', () => {
      it('should handle very long URLs', () => {
        const longPath = 'a'.repeat(1000);
        const url = `https://example.com/${longPath}/song.mp3`;
        expect(AudioValidator.isValidAudioUrl(url)).toBe(true);
      });
    });
    describe('Whitespace Handling', () => {
      it('should trim whitespace from title and artist', () => {
        const song: Song = {
          id: '1',
          title: '  Valid Title  ',
          artist: '  Valid Artist  ',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(true);
      });
      it('should reject whitespace-only fields after trim', () => {
        const song: Song = {
          id: '1',
          title: '   ',
          artist: '   ',
          cover: '/cover.jpg',
          url: '/song.mp3'
        };
        const result = AudioValidator.validateSong(song);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Title is required');
        expect(result.errors).toContain('Artist is required');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should use isValidImageUrl internally in validateSong', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: 'invalid-url',
        url: '/song.mp3'
      };
      const result = AudioValidator.validateSong(song);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cover URL must be a valid URL');
    });
    it('should use isValidAudioUrl internally in validateSong', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: 'invalid-url'
      };
      const result = AudioValidator.validateSong(song);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Audio URL must be a valid URL');
    });
    it('should use isSupportedFormat internally via isValidAudioUrl', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: 'https://example.com/song.flac'
      };
      const result = AudioValidator.validateSong(song);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Audio format must be MP3, WAV, OGG, or M4A');
    });
  });

  describe('Purity Tests', () => {
    it('should return same result for same input (deterministic)', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      const result1 = AudioValidator.validateSong(song);
      const result2 = AudioValidator.validateSong(song);
      const result3 = AudioValidator.validateSong(song);
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
    it('should not mutate input object', () => {
      const song: Song = {
        id: '1',
        title: 'Original Title',
        artist: 'Original Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      const originalSong = { ...song };
      AudioValidator.validateSong(song);
      expect(song).toEqual(originalSong);
      expect(song.title).toBe('Original Title');
    });
    it('should have no side effects', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      AudioValidator.validateSong({
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      });
      AudioValidator.isValidAudioUrl('/song.mp3');
      AudioValidator.isValidImageUrl('/cover.jpg');
      AudioValidator.isSupportedFormat('/song.mp3');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Type Safety', () => {
    it('should return ValidationResult type from validateSong', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      const result: ValidationResult = AudioValidator.validateSong(song);
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
    it('should accept Song type for validateSong', () => {
      const song: Song = {
        id: '1',
        title: 'Title',
        artist: 'Artist',
        cover: '/cover.jpg',
        url: '/song.mp3'
      };
      expect(() => AudioValidator.validateSong(song)).not.toThrow();
    });
  });
});