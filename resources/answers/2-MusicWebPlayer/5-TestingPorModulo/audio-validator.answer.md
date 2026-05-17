# Respuesta

### Respuesta {toggle="true"}
```typescript
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
      it('should reject valid URL with unsupported format', () => {
        expect(AudioValidator.isValidAudioUrl('https://example.com/song.flac')).toBe(false);
        expect(AudioValidator.isValidAudioUrl('https://example.com/song.aac')).toBe(false);
        expect(AudioValidator.isValidAudioUrl('https://example.com/song.wma')).toBe(false);
      });
      it('should reject URL with no extension', () => {
        expect(AudioValidator.isValidAudioUrl('https://example.com/song')).toBe(false);
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
```

---

# Respuesta (FIX 1)

### Respuesta (FIX 1) {toggle="true"}
<details>
<summary>**Prompt:**</summary>
```typescript
> music-web-player@1.0.0 test
> jest tests/utils/audio-validator.test.ts

 FAIL  tests/utils/audio-validator.test.ts
  AudioValidator Utility
    validateSong
      Valid Songs
        ✓ should return valid result for complete valid song (3 ms)
        ✓ should validate song with HTTP URLs
        ✓ should validate song with relative URLs
        ✓ should validate song with query parameters (1 ms)
        ✓ should validate songs with all supported audio formats (1 ms)
      Title Validation
        ✓ should reject song with empty title
        ✓ should reject song with whitespace-only title (1 ms)
        ✓ should accept title with leading/trailing whitespace (after trim)
        ✓ should accept title with special characters
        ✓ should accept very long title
      Artist Validation
        ✓ should reject song with empty artist
        ✓ should reject song with whitespace-only artist (1 ms)
        ✓ should accept artist with leading/trailing whitespace (after trim)
      Cover URL Validation
        ✓ should accept valid HTTPS cover URL
        ✓ should accept valid relative cover URL
        ✓ should reject invalid cover URL
        ✓ should reject empty cover URL
      Audio URL Validation
        ✓ should accept valid audio URL with supported format
        ✓ should reject invalid audio URL
        ✓ should reject valid URL with unsupported format (1 ms)
        ✓ should accept audio URL with query parameters
      Error Accumulation
        ✓ should accumulate multiple errors (not fail-fast) (1 ms)
        ✓ should accumulate all possible errors (1 ms)
        ✓ should return errors in consistent order
    isValidAudioUrl
      Valid Audio URLs
        ✓ should accept HTTP URL with .mp3 (1 ms)
        ✓ should accept HTTPS URL with .wav
        ✓ should accept relative path with .ogg
        ✓ should accept URL with .m4a extension (1 ms)
        ✓ should accept URL with query parameters
        ✓ should accept URL with fragment
        ✓ should accept URL with query and fragment
        ✓ should accept case-insensitive extensions (1 ms)
      Invalid Audio URLs
        ✓ should reject invalid URL format
        ✓ should reject empty string
        ✕ should reject valid URL with unsupported format (1 ms)
        ✕ should reject URL with no extension (1 ms)
        ✓ should reject URL with wrong protocol
    isValidImageUrl
      Valid Image URLs
        ✓ should accept HTTP URL
        ✓ should accept HTTPS URL (1 ms)
        ✓ should accept relative path
        ✓ should accept URL with query parameters
        ✓ should accept URL with any extension (no format checking) (1 ms)
      Invalid Image URLs
        ✓ should reject invalid URL format
        ✓ should reject empty string
        ✓ should reject malformed URL
    isSupportedFormat
      Supported Formats
        ✓ should return true for .mp3 extension (1 ms)
        ✓ should return true for .wav extension
        ✓ should return true for .ogg extension
        ✓ should return true for .m4a extension
        ✓ should be case-insensitive (1 ms)
        ✓ should handle URLs with query parameters
        ✓ should handle URLs with fragment
      Unsupported Formats
        ✓ should return false for .flac extension
        ✓ should return false for .aac extension
        ✓ should return false for .wma extension
        ✓ should return false for .mp4 extension (video)
        ✓ should return false for no extension
        ✓ should return false for invalid URL
    Edge Cases
      URL with Multiple Dots
        ✓ should handle filename with multiple dots (1 ms)
      URL with Encoded Characters
        ✓ should handle URL-encoded characters (1 ms)
      Very Long URLs
        ✓ should handle very long URLs (1 ms)
      Whitespace Handling
        ✓ should trim whitespace from title and artist
        ✓ should reject whitespace-only fields after trim
    Integration Tests
      ✓ should use isValidImageUrl internally in validateSong
      ✓ should use isValidAudioUrl internally in validateSong
      ✓ should use isSupportedFormat internally via isValidAudioUrl
    Purity Tests
      ✓ should return same result for same input (deterministic) (1 ms)
      ✓ should not mutate input object
      ✓ should have no side effects (1 ms)
    Type Safety
      ✓ should return ValidationResult type from validateSong
      ✓ should accept Song type for validateSong (1 ms)

  ● AudioValidator Utility › isValidAudioUrl › Invalid Audio URLs › should reject valid URL with unsupported format

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: true

      378 |       });
      379 |       it('should reject valid URL with unsupported format', () => {
    > 380 |         expect(AudioValidator.isValidAudioUrl('https://example.com/song.flac')).toBe(false);
          |                                                                                 ^
      381 |         expect(AudioValidator.isValidAudioUrl('https://example.com/song.aac')).toBe(false);
      382 |         expect(AudioValidator.isValidAudioUrl('https://example.com/song.wma')).toBe(false);
      383 |       });

      at Object.<anonymous> (tests/utils/audio-validator.test.ts:380:81)

  ● AudioValidator Utility › isValidAudioUrl › Invalid Audio URLs › should reject URL with no extension

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: true

      383 |       });
      384 |       it('should reject URL with no extension', () => {
    > 385 |         expect(AudioValidator.isValidAudioUrl('https://example.com/song')).toBe(false);
          |                                                                            ^
      386 |       });
      387 |       it('should reject URL with wrong protocol', () => {
      388 |         expect(AudioValidator.isValidAudioUrl('ftp://example.com/song.mp3')).toBe(false);

      at Object.<anonymous> (tests/utils/audio-validator.test.ts:385:76)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 69 passed, 71 total
Snapshots:   0 total
Time:        0.782 s
Ran all test suites matching /tests\/utils\/audio-validator.test.ts/i.
```
</details>
<details>
<summary>**Respuesta:**</summary>
Looking at the failing tests, I can see the issue. The `isValidAudioUrl` function in the original code only validates the URL format itself (whether it's a valid HTTP/HTTPS URL or a relative path). It does NOT validate the audio format. The format validation is done separately by the `isSupportedFormat` function, which is called from `validateSong` but not from `isValidAudioUrl`.
Looking at the original code:
```typescript
public static isValidAudioUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmedUrl = url.trim();
  if (!trimmedUrl || trimmedUrl.length > MAX_URL_LENGTH) return false;
  // Check for HTTP/HTTPS URLs
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      new URL(trimmedUrl);
      return true;
    } catch {
      return false;
    }
  }
  // Check for relative paths
  return trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./');
}

```
This function only checks if the URL is properly formatted (valid HTTP/HTTPS or relative path). It does NOT check the audio format. The format check is handled by `isSupportedFormat`.
So the tests for `isValidAudioUrl` should expect that URLs with unsupported formats are still considered "valid" URLs (because they are properly formatted), even though they have unsupported formats. The format check is a separate validation step.
Let me fix the tests:
```typescript
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
          cover: '<https://example.com/cover.jpg>',
          url: '<https://example.com/song.mp3>'
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
          cover: '<http://example.com/cover.jpg>',
          url: '<http://example.com/song.mp3>'
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
          cover: '<https://example.com/cover.jpg?w=300&h=300>',
          url: '<https://example.com/song.mp3?token=abc123>'
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
          title: 'Song "Title" with \\'quotes\\' & symbols!',
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
          cover: '<https://example.com/cover.jpg>',
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
          url: '<https://example.com/song.mp3>'
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
          url: '<https://example.com/song.flac>'
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
        expect(AudioValidator.isValidAudioUrl('<http://example.com/song.mp3>')).toBe(true);
      });
      it('should accept HTTPS URL with .wav', () => {
        expect(AudioValidator.isValidAudioUrl('<https://example.com/song.wav>')).toBe(true);
      });
      it('should accept relative path with .ogg', () => {
        expect(AudioValidator.isValidAudioUrl('/songs/track.ogg')).toBe(true);
      });
      it('should accept URL with .m4a extension', () => {
        expect(AudioValidator.isValidAudioUrl('<https://example.com/audio.m4a>')).toBe(true);
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
      // Note: isValidAudioUrl only validates URL format, not audio format
      // So URLs with unsupported formats are still "valid URLs"
      it('should accept valid URL with unsupported format (URL is valid, format is not)', () => {
        expect(AudioValidator.isValidAudioUrl('<https://example.com/song.flac>')).toBe(true);
        expect(AudioValidator.isValidAudioUrl('<https://example.com/song.aac>')).toBe(true);
        expect(AudioValidator.isValidAudioUrl('<https://example.com/song.wma>')).toBe(true);
      });
      it('should accept URL with no extension (URL is valid, format is not checked)', () => {
        expect(AudioValidator.isValidAudioUrl('<https://example.com/song>')).toBe(true);
      });
      it('should reject URL with wrong protocol', () => {
        expect(AudioValidator.isValidAudioUrl('<ftp://example.com/song.mp3>')).toBe(false);
      });
    });
  });

  describe('isValidImageUrl', () => {
    describe('Valid Image URLs', () => {
      it('should accept HTTP URL', () => {
        expect(AudioValidator.isValidImageUrl('<http://example.com/image.jpg>')).toBe(true);
      });
      it('should accept HTTPS URL', () => {
        expect(AudioValidator.isValidImageUrl('<https://example.com/image.png>')).toBe(true);
      });
      it('should accept relative path', () => {
        expect(AudioValidator.isValidImageUrl('/covers/album.jpg')).toBe(true);
        expect(AudioValidator.isValidImageUrl('./covers/album.png')).toBe(true);
      });
      it('should accept URL with query parameters', () => {
        expect(AudioValidator.isValidImageUrl('<https://example.com/image.jpg?w=300&h=300>')).toBe(true);
      });
      it('should accept URL with any extension (no format checking)', () => {
        expect(AudioValidator.isValidImageUrl('<https://example.com/image.webp>')).toBe(true);
        expect(AudioValidator.isValidImageUrl('<https://example.com/file.pdf>')).toBe(true);
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
        url: '<https://example.com/song.flac>'
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

```
</details>