// tests/utils/error-handler.test.ts
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ErrorHandler } from '@/utils/error-handler';
import { ErrorType, PlaybackError } from '@/types/playback-error';

describe('ErrorHandler Utility', () => {
  // Mock console.error for testing
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('handlePlaybackError', () => {
    describe('MediaError Handling', () => {
      it('should convert MediaError code 1 to LOAD_ERROR', () => {
        // ARRANGE
        const mediaError = {
          code: 1, // MEDIA_ERR_ABORTED
          message: 'Aborted'
        } as any;
        const songId = 'song-123';

        // ACT
        const result = ErrorHandler.handlePlaybackError(mediaError, songId);

        // ASSERT
        expect(result.type).toBe(ErrorType.LOAD_ERROR);
        expect(result.message).toBe('Unable to load song. The file may have been moved or deleted.');
        expect(result.songId).toBe(songId);
      });

      it('should convert MediaError code 2 to NETWORK_ERROR', () => {
        const mediaError = {
          code: 2, // MEDIA_ERR_NETWORK
          message: 'Network error'
        } as any;

        const result = ErrorHandler.handlePlaybackError(mediaError, 'test-id');

        expect(result.type).toBe(ErrorType.NETWORK_ERROR);
        expect(result.message).toBe('Network error. Please check your internet connection.');
      });

      it('should convert MediaError code 3 to DECODE_ERROR', () => {
        const mediaError = {
          code: 3, // MEDIA_ERR_DECODE
          message: 'Decode error'
        } as any;

        const result = ErrorHandler.handlePlaybackError(mediaError, 'test-id');

        expect(result.type).toBe(ErrorType.DECODE_ERROR);
        expect(result.message).toBe('This audio file appears to be corrupted or incomplete.');
      });

      it('should convert MediaError code 4 to UNSUPPORTED_FORMAT', () => {
        const mediaError = {
          code: 4, // MEDIA_ERR_SRC_NOT_SUPPORTED
          message: 'Source not supported'
        } as any;

        const result = ErrorHandler.handlePlaybackError(mediaError, 'test-id');

        expect(result.type).toBe(ErrorType.UNSUPPORTED_FORMAT);
        expect(result.message).toBe('This audio format is not supported. Please use MP3, WAV, OGG, or M4A.');
      });

      it('should handle MediaError with invalid code gracefully', () => {
        const mediaError = {
          code: 999, // Invalid code
          message: 'Unknown error'
        } as any;

        const result = ErrorHandler.handlePlaybackError(mediaError, 'test-id');

        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.message).toBeDefined();
      });
    });

    describe('Generic Error Handling', () => {
      it('should detect "network" keyword and return NETWORK_ERROR', () => {
        const error = new Error('Network connection failed');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.NETWORK_ERROR);
        expect(result.message).toContain('Network error');
      });

      it('should detect "fetch" keyword and return NETWORK_ERROR', () => {
        const error = new Error('Failed to fetch resource');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.NETWORK_ERROR);
      });

      it('should detect "connection" keyword and return NETWORK_ERROR', () => {
        const error = new Error('Connection timeout occurred');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.NETWORK_ERROR);
      });

      it('should detect "decode" keyword and return DECODE_ERROR', () => {
        const error = new Error('Failed to decode audio data');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.DECODE_ERROR);
        expect(result.message).toContain('corrupted');
      });

      it('should detect "corrupt" keyword and return DECODE_ERROR', () => {
        const error = new Error('File is corrupt');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.DECODE_ERROR);
      });

      it('should detect "format" keyword and return UNSUPPORTED_FORMAT', () => {
        const error = new Error('Invalid format detected');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.UNSUPPORTED_FORMAT);
      });

      it('should detect "unsupported" keyword and return UNSUPPORTED_FORMAT', () => {
        const error = new Error('This format is not supported');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.UNSUPPORTED_FORMAT);
      });

      it('should detect "mime" keyword and return UNSUPPORTED_FORMAT', () => {
        const error = new Error('Invalid MIME type');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.UNSUPPORTED_FORMAT);
      });

      it('should detect "404" keyword and return LOAD_ERROR', () => {
        const error = new Error('404 not found');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.LOAD_ERROR);
      });

      it('should detect "not found" keyword and return LOAD_ERROR', () => {
        const error = new Error('Resource not found');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.LOAD_ERROR);
      });

      it('should detect "load" keyword and return LOAD_ERROR', () => {
        const error = new Error('Failed to load');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.LOAD_ERROR);
      });

      it('should default to LOAD_ERROR for generic error messages', () => {
        const error = new Error('Something went wrong');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result.type).toBe(ErrorType.LOAD_ERROR);
      });
    });

    describe('Edge Cases', () => {
      it('should handle null error gracefully', () => {
        const result = ErrorHandler.handlePlaybackError(null as any, 'song-1');

        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.message).toBeDefined();
        expect(result.songId).toBe('song-1');
      });

      it('should handle undefined error gracefully', () => {
        const result = ErrorHandler.handlePlaybackError(undefined as any, 'song-1');

        expect(result).toBeDefined();
        expect(result.songId).toBe('song-1');
      });

      it('should handle Error with empty message', () => {
        const error = new Error('');

        const result = ErrorHandler.handlePlaybackError(error, 'song-1');

        expect(result).toBeDefined();
        expect(result.message).toBeTruthy();
      });

      it('should handle non-error objects', () => {
        const notAnError = { random: 'object' };

        const result = ErrorHandler.handlePlaybackError(notAnError as any, 'song-1');

        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
      });

      it('should handle string error', () => {
        const result = ErrorHandler.handlePlaybackError('string error' as any, 'song-1');

        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
      });

      it('should preserve songId in all cases', () => {
        const testCases = [
          null,
          undefined,
          new Error('test'),
          { code: 1 } as any
        ];

        testCases.forEach(error => {
          const result = ErrorHandler.handlePlaybackError(error as any, 'preserved-id');
          expect(result.songId).toBe('preserved-id');
        });
      });

      it('should never throw exceptions', () => {
        const badInputs = [
          null,
          undefined,
          {},
          [],
          123,
          'string',
          true,
          Symbol('test')
        ];

        badInputs.forEach(input => {
          expect(() => ErrorHandler.handlePlaybackError(input as any, 'test')).not.toThrow();
        });
      });
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct message for LOAD_ERROR', () => {
      const message = ErrorHandler.getErrorMessage(ErrorType.LOAD_ERROR);

      expect(message).toBe('Unable to load song. The file may have been moved or deleted.');
    });

    it('should return correct message for NETWORK_ERROR', () => {
      const message = ErrorHandler.getErrorMessage(ErrorType.NETWORK_ERROR);

      expect(message).toBe('Network error. Please check your internet connection.');
    });

    it('should return correct message for DECODE_ERROR', () => {
      const message = ErrorHandler.getErrorMessage(ErrorType.DECODE_ERROR);

      expect(message).toBe('This audio file appears to be corrupted or incomplete.');
    });

    it('should return correct message for UNSUPPORTED_FORMAT', () => {
      const message = ErrorHandler.getErrorMessage(ErrorType.UNSUPPORTED_FORMAT);

      expect(message).toBe('This audio format is not supported. Please use MP3, WAV, OGG, or M4A.');
    });

    it('should return default message for unknown error type', () => {
      // Use a fake error type to test fallback
      const fakeErrorType = 'FAKE_ERROR' as ErrorType;
      const message = ErrorHandler.getErrorMessage(fakeErrorType);

      expect(message).toBe('An error occurred while playing this song.');
    });
  });

  describe('logError', () => {
    describe('Development Logging', () => {
      beforeEach(() => {
        // Mock development environment
        process.env.NODE_ENV = 'development';
      });

      it('should log error to console in development', () => {
        const error: Error = new Error('Test error');

        ErrorHandler.logError(error, 'test context');

        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      it('should log error with context', () => {
        const error: Error = new Error('Test error');

        ErrorHandler.logError(error, 'Song ID: song-123');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Song ID: song-123'),
          error
        );
      });

      it('should log error message', () => {
        const error: Error = new Error('Specific error message');

        ErrorHandler.logError(error, 'test context');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Specific error message'),
          error
        );
      });

      it('should log error name', () => {
        const error: Error = new Error('Test error');
        error.name = 'CustomError';

        ErrorHandler.logError(error, 'test context');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('CustomError'),
          error
        );
      });
    });

    describe('Production Behavior', () => {
      beforeEach(() => {
        // Mock production environment
        process.env.NODE_ENV = 'production';
      });

      it('should NOT log to console in production', () => {
        const error: Error = new Error('Test error');

        ErrorHandler.logError(error, 'test context');

        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should still execute without errors in production', () => {
        const error: Error = new Error('Network error');

        expect(() => ErrorHandler.logError(error, 'test context')).not.toThrow();
      });
    });
  });

  describe('createPlaybackError', () => {
    it('should create a valid PlaybackError with all properties', () => {
      const error = ErrorHandler.createPlaybackError(ErrorType.NETWORK_ERROR, 'song-123');

      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.message).toBe('Network error. Please check your internet connection.');
      expect(error.songId).toBe('song-123');
    });

    it('should have undefined originalError when not provided', () => {
      const error = ErrorHandler.createPlaybackError(ErrorType.LOAD_ERROR, 'song-789');

      expect(error.originalError).toBeUndefined();
    });

    it('should use correct message for each error type', () => {
      const typesAndMessages = [
        [ErrorType.LOAD_ERROR, 'Unable to load song. The file may have been moved or deleted.'],
        [ErrorType.DECODE_ERROR, 'This audio file appears to be corrupted or incomplete.'],
        [ErrorType.NETWORK_ERROR, 'Network error. Please check your internet connection.'],
        [ErrorType.UNSUPPORTED_FORMAT, 'This audio format is not supported. Please use MP3, WAV, OGG, or M4A.']
      ];

      typesAndMessages.forEach(([type, expectedMessage]) => {
        const error = ErrorHandler.createPlaybackError(type as ErrorType, 'test');
        expect(error.message).toBe(expectedMessage);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should support complete error handling workflow', () => {
      // ARRANGE
      const mediaError = { code: 2, message: '' } as any;
      const songId = 'workflow-test';

      // ACT
      const playbackError = ErrorHandler.handlePlaybackError(mediaError, songId);
      ErrorHandler.logError(new Error(playbackError.message), `Song ID: ${songId}`);

      // ASSERT
      expect(playbackError.type).toBe(ErrorType.NETWORK_ERROR);
      expect(playbackError.songId).toBe(songId);
      // Logging behavior depends on NODE_ENV
    });

    it('should create valid PlaybackError structure', () => {
      const error = new Error('Test error');

      const result = ErrorHandler.handlePlaybackError(error, 'test-id');

      // Verify structure matches PlaybackError interface
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('songId');
      expect(typeof result.type).toBe('string');
      expect(typeof result.message).toBe('string');
      expect(typeof result.songId).toBe('string');
    });
  });

  describe('Defensive Programming', () => {
    it('should never throw exceptions from handlePlaybackError', () => {
      const testInputs = [
        [null, 'id'],
        [undefined, 'id'],
        [{}, 'id'],
        ['string', 'id'],
        [123, 'id'],
        [new Error(), ''],
        [{ code: 'invalid' } as any, 'id']
      ];

      testInputs.forEach(([error, songId]) => {
        expect(() => ErrorHandler.handlePlaybackError(error as any, songId as string))
          .not.toThrow();
      });
    });

    it('should never throw exceptions from getErrorMessage', () => {
      const testInputs = [ErrorType.LOAD_ERROR, ErrorType.NETWORK_ERROR, ErrorType.DECODE_ERROR, ErrorType.UNSUPPORTED_FORMAT];

      testInputs.forEach(input => {
        expect(() => ErrorHandler.getErrorMessage(input)).not.toThrow();
      });
    });

    it('should safely access MediaError properties', () => {
      const fakeMediaError = { notCode: 1 } as any;

      expect(() => ErrorHandler.handlePlaybackError(fakeMediaError, 'test'))
        .not.toThrow();
    });

    it('should handle errors with undefined message property', () => {
      const error = { name: 'Error' } as any;

      const result = ErrorHandler.handlePlaybackError(error, 'test');

      expect(result).toBeDefined();
      expect(result.message).toBeTruthy();
    });
  });

  describe('Type Safety', () => {
    it('should return PlaybackError type from handlePlaybackError', () => {
      const error = new Error('test');
      const result: PlaybackError = ErrorHandler.handlePlaybackError(error, 'id');

      expect(result.type).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.songId).toBeDefined();
    });

    it('should accept MediaError | Error | unknown as input', () => {
      const mediaError: any = { code: 1, message: '' };
      const genericError: Error = new Error('test');
      const unknownError: unknown = 'string error';

      expect(() => ErrorHandler.handlePlaybackError(mediaError, 'id')).not.toThrow();
      expect(() => ErrorHandler.handlePlaybackError(genericError, 'id')).not.toThrow();
      expect(() => ErrorHandler.handlePlaybackError(unknownError, 'id')).not.toThrow();
    });
  });
});
