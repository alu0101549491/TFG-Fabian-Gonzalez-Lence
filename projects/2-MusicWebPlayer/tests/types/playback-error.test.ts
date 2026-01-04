// tests/types/playback-error.test.ts
import { describe, it, expect } from '@jest/globals';
import { ErrorType, PlaybackError } from '@/types/playback-error';

describe('PlaybackError Type Definitions', () => {
  describe('ErrorType Enum', () => {
    it('should export ErrorType enum', () => {
      expect(ErrorType).toBeDefined();
      expect(typeof ErrorType).toBe('object');
    });

    it('should have all 4 error types', () => {
      expect(ErrorType.LOAD_ERROR).toBeDefined();
      expect(ErrorType.DECODE_ERROR).toBeDefined();
      expect(ErrorType.NETWORK_ERROR).toBeDefined();
      expect(ErrorType.UNSUPPORTED_FORMAT).toBeDefined();
    });

    it('should have string values for all error types', () => {
      expect(typeof ErrorType.LOAD_ERROR).toBe('string');
      expect(typeof ErrorType.DECODE_ERROR).toBe('string');
      expect(typeof ErrorType.NETWORK_ERROR).toBe('string');
      expect(typeof ErrorType.UNSUPPORTED_FORMAT).toBe('string');
    });

    it('should have correct string values matching keys', () => {
      expect(ErrorType.LOAD_ERROR).toBe('LOAD_ERROR');
      expect(ErrorType.DECODE_ERROR).toBe('DECODE_ERROR');
      expect(ErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorType.UNSUPPORTED_FORMAT).toBe('UNSUPPORTED_FORMAT');
    });

    it('should be UPPER_SNAKE_CASE format', () => {
      const values = Object.values(ErrorType);
      values.forEach(value => {
        expect(value).toMatch(/^[A-Z_]+$/);
      });
    });

    it('should have exactly 4 error types', () => {
      const errorTypes = Object.keys(ErrorType);
      expect(errorTypes).toHaveLength(4);
    });
  });

  describe('ErrorType Enum Usage', () => {
    it('should work in switch statements', () => {
      const getErrorDescription = (type: ErrorType): string => {
        switch (type) {
          case ErrorType.LOAD_ERROR:
            return 'Load failed';
          case ErrorType.DECODE_ERROR:
            return 'Decode failed';
          case ErrorType.NETWORK_ERROR:
            return 'Network failed';
          case ErrorType.UNSUPPORTED_FORMAT:
            return 'Format not supported';
          default:
            return 'Unknown error';
        }
      };

      expect(getErrorDescription(ErrorType.LOAD_ERROR)).toBe('Load failed');
      expect(getErrorDescription(ErrorType.NETWORK_ERROR)).toBe('Network failed');
      expect(getErrorDescription(ErrorType.DECODE_ERROR)).toBe('Decode failed');
      expect(getErrorDescription(ErrorType.UNSUPPORTED_FORMAT)).toBe('Format not supported');
    });

    it('should support equality comparisons', () => {
      const type: ErrorType = ErrorType.LOAD_ERROR;
      
      expect(type === ErrorType.LOAD_ERROR).toBe(true);
      expect(type === ErrorType.DECODE_ERROR).toBe(false);
      expect(type !== ErrorType.NETWORK_ERROR).toBe(true);
    });

    it('should work as object keys', () => {
      const errorCounts: Record<ErrorType, number> = {
        [ErrorType.LOAD_ERROR]: 0,
        [ErrorType.DECODE_ERROR]: 0,
        [ErrorType.NETWORK_ERROR]: 0,
        [ErrorType.UNSUPPORTED_FORMAT]: 0
      };

      errorCounts[ErrorType.LOAD_ERROR]++;
      errorCounts[ErrorType.NETWORK_ERROR] += 2;

      expect(errorCounts[ErrorType.LOAD_ERROR]).toBe(1);
      expect(errorCounts[ErrorType.NETWORK_ERROR]).toBe(2);
    });

    it('should support iteration', () => {
      const types = Object.values(ErrorType);
      
      expect(types).toContain('LOAD_ERROR');
      expect(types).toContain('DECODE_ERROR');
      expect(types).toContain('NETWORK_ERROR');
      expect(types).toContain('UNSUPPORTED_FORMAT');
    });

    it('should work in type guards', () => {
      const isLoadError = (type: ErrorType): boolean => {
        return type === ErrorType.LOAD_ERROR;
      };

      expect(isLoadError(ErrorType.LOAD_ERROR)).toBe(true);
      expect(isLoadError(ErrorType.DECODE_ERROR)).toBe(false);
    });
  });

  describe('PlaybackError Interface', () => {
    it('should accept valid PlaybackError objects', () => {
      const error: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: 'Unable to load song',
        songId: 'song-123'
      };

      expect(error).toBeDefined();
      expect(error.type).toBe(ErrorType.LOAD_ERROR);
      expect(error.message).toBe('Unable to load song');
      expect(error.songId).toBe('song-123');
    });

    it('should have all required properties', () => {
      const error: PlaybackError = {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error',
        songId: 'test-id'
      };

      expect(error).toHaveProperty('type');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('songId');
    });

    it('should use ErrorType enum for type property', () => {
      const error: PlaybackError = {
        type: ErrorType.DECODE_ERROR,
        message: 'Decode failed',
        songId: '1'
      };

      expect(Object.values(ErrorType)).toContain(error.type);
      expect(typeof error.type).toBe('string');
    });

    it('should accept all four error types', () => {
      const errors: PlaybackError[] = [
        { type: ErrorType.LOAD_ERROR, message: 'Load failed', songId: '1' },
        { type: ErrorType.DECODE_ERROR, message: 'Decode failed', songId: '2' },
        { type: ErrorType.NETWORK_ERROR, message: 'Network failed', songId: '3' },
        { type: ErrorType.UNSUPPORTED_FORMAT, message: 'Format unsupported', songId: '4' }
      ];

      errors.forEach((error, index) => {
        expect(error).toBeDefined();
        expect(error.songId).toBe((index + 1).toString());
      });
    });
  });

  describe('PlaybackError Operations', () => {
    it('should work with JSON serialization', () => {
      const error: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: 'Unable to load',
        songId: '123'
      };

      const json = JSON.stringify(error);
      const parsed: PlaybackError = JSON.parse(json);

      expect(parsed.type).toBe('LOAD_ERROR');
      expect(parsed.message).toBe('Unable to load');
      expect(parsed.songId).toBe('123');
    });

    it('should work with object spread', () => {
      const baseError: PlaybackError = {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network failed',
        songId: '1'
      };

      const updatedError: PlaybackError = {
        ...baseError,
        message: 'Network error - retry failed'
      };

      expect(updatedError.message).toBe('Network error - retry failed');
      expect(updatedError.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should support array operations', () => {
      const errors: PlaybackError[] = [
        { type: ErrorType.LOAD_ERROR, message: 'Load 1', songId: '1' },
        { type: ErrorType.NETWORK_ERROR, message: 'Network 1', songId: '2' },
        { type: ErrorType.LOAD_ERROR, message: 'Load 2', songId: '3' }
      ];

      const loadErrors = errors.filter(e => e.type === ErrorType.LOAD_ERROR);
      const songIds = errors.map(e => e.songId);

      expect(loadErrors).toHaveLength(2);
      expect(songIds).toEqual(['1', '2', '3']);
    });
  });

  describe('Edge Cases', () => {
    it('should accept empty strings for message and songId', () => {
      const error: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: '',
        songId: ''
      };

      expect(error.message).toBe('');
      expect(error.songId).toBe('');
    });

    it('should accept very long messages', () => {
      const longMessage = 'Error '.repeat(100);
      const error: PlaybackError = {
        type: ErrorType.DECODE_ERROR,
        message: longMessage,
        songId: 'test'
      };

      expect(error.message.length).toBeGreaterThan(500);
    });

    it('should accept special characters in message', () => {
      const error: PlaybackError = {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error: "Connection timeout" (500ms)',
        songId: 'song-with-special-chars-@#$'
      };

      expect(error.message).toContain('"Connection timeout"');
      expect(error.songId).toContain('@#$');
    });

    it('should accept Unicode in message', () => {
      const error: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: '読み込みエラー: ファイルが見つかりません',
        songId: '日本語-id'
      };

      expect(error.message).toContain('読み込み');
    });

    it('should work with conditional error handling', () => {
      const handleError = (error: PlaybackError): string => {
        if (error.type === ErrorType.LOAD_ERROR) {
          return 'Retry loading';
        } else if (error.type === ErrorType.NETWORK_ERROR) {
          return 'Check connection';
        } else if (error.type === ErrorType.DECODE_ERROR) {
          return 'File corrupted';
        } else {
          return 'Format not supported';
        }
      };

      const loadError: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: 'Load failed',
        songId: '1'
      };

      expect(handleError(loadError)).toBe('Retry loading');
    });

    it('should support error type checking utility', () => {
      const isRecoverableError = (error: PlaybackError): boolean => {
        return error.type === ErrorType.LOAD_ERROR || 
               error.type === ErrorType.NETWORK_ERROR;
      };

      const loadError: PlaybackError = {
        type: ErrorType.LOAD_ERROR,
        message: 'Failed',
        songId: '1'
      };

      const formatError: PlaybackError = {
        type: ErrorType.UNSUPPORTED_FORMAT,
        message: 'Not supported',
        songId: '2'
      };

      expect(isRecoverableError(loadError)).toBe(true);
      expect(isRecoverableError(formatError)).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety with ErrorType', () => {
      const createError = (type: ErrorType, songId: string): PlaybackError => {
        return {
          type,
          message: `Error of type ${type}`,
          songId
        };
      };

      const error = createError(ErrorType.LOAD_ERROR, '123');
      expect(error.type).toBe(ErrorType.LOAD_ERROR);
    });

    it('should work with partial error objects during construction', () => {
      const baseError = {
        message: 'An error occurred',
        songId: '123'
      };

      const completeError: PlaybackError = {
        ...baseError,
        type: ErrorType.NETWORK_ERROR
      };

      expect(completeError).toEqual({
        type: ErrorType.NETWORK_ERROR,
        message: 'An error occurred',
        songId: '123'
      });
    });
  });
});