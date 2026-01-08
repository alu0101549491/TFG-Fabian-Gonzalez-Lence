// tests/types/validation.test.ts
import { describe, it, expect } from '@jest/globals';
import { ValidationResult } from '@/types/validation';

describe('ValidationResult Type Definition', () => {
  describe('Type Structure', () => {
    it('should accept valid ValidationResult with isValid true and empty errors', () => {
      // ARRANGE
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      // ASSERT
      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
    });

    it('should have isValid as boolean type', () => {
      const validResult: ValidationResult = {
        isValid: true,
        errors: []
      };

      const invalidResult: ValidationResult = {
        isValid: false,
        errors: ['Error']
      };

      expect(typeof validResult.isValid).toBe('boolean');
      expect(typeof invalidResult.isValid).toBe('boolean');
    });

    it('should have errors as string array type', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2']
      };

      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.every(e => typeof e === 'string')).toBe(true);
    });
  });

  describe('Valid Results', () => {
    it('should represent successful validation with isValid true', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      expect(result.isValid).toBe(true);
      expect(result.isValid).toStrictEqual(true); // Exactly true
    });

    it('should have empty errors array when valid', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      expect(result.errors).toEqual([]);
      expect(result.errors).toHaveLength(0);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should support checking validity for flow control', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      if (result.isValid) {
        expect(result.errors).toHaveLength(0);
      } else {
        expect(true).toBe(false); // Should not reach this branch
      }
    });
  });

  describe('Invalid Results', () => {
    it('should represent failed validation with isValid false', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required']
      };

      expect(result.isValid).toBe(false);
      expect(result.isValid).toStrictEqual(false); // Exactly false
    });

    it('should contain single error message when one validation fails', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required']
      };

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Title is required');
    });

    it('should contain multiple error messages when multiple validations fail', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'Title is required',
          'Artist is required',
          'Audio URL must be a valid URL'
        ]
      };

      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toBe('Title is required');
      expect(result.errors[1]).toBe('Artist is required');
      expect(result.errors[2]).toBe('Audio URL must be a valid URL');
    });

    it('should accumulate all validation errors', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'Title is required',
          'Artist is required',
          'Cover URL must be a valid URL',
          'Audio URL must be a valid URL',
          'Audio format must be MP3, WAV, OGG, or M4A'
        ]
      };

      expect(result.errors).toHaveLength(5);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Audio format must be MP3, WAV, OGG, or M4A');
    });
  });

  describe('Errors Array Operations', () => {
    it('should support array iteration', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2', 'Error 3']
      };

      const errorCount = result.errors.length;
      let iterationCount = 0;

      result.errors.forEach(() => {
        iterationCount++;
      });

      expect(iterationCount).toBe(errorCount);
    });

    it('should support array map operation', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required', 'Artist is required']
      };

      const prefixedErrors = result.errors.map(e => `Error: ${e}`);

      expect(prefixedErrors).toEqual([
        'Error: Title is required',
        'Error: Artist is required'
      ]);
    });

    it('should support array filter operation', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'Title is required',
          'Audio URL must be a valid URL',
          'Artist is required'
        ]
      };

      const requiredErrors = result.errors.filter(e => e.includes('required'));

      expect(requiredErrors).toHaveLength(2);
    });

    it('should preserve error order', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['First', 'Second', 'Third']
      };

      expect(result.errors[0]).toBe('First');
      expect(result.errors[1]).toBe('Second');
      expect(result.errors[2]).toBe('Third');
    });

    it('should support checking if errors exist', () => {
      const validResult: ValidationResult = {
        isValid: true,
        errors: []
      };

      const invalidResult: ValidationResult = {
        isValid: false,
        errors: ['Error']
      };

      expect(validResult.errors.length > 0).toBe(false);
      expect(invalidResult.errors.length > 0).toBe(true);
    });
  });

  describe('Object Operations', () => {
    it('should work with JSON serialization', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required', 'Artist is required']
      };

      const json = JSON.stringify(result);
      const parsed: ValidationResult = JSON.parse(json);

      expect(parsed).toEqual(result);
      expect(parsed.isValid).toBe(false);
      expect(parsed.errors).toHaveLength(2);
    });

    it('should work with object spread operator', () => {
      const baseResult: ValidationResult = {
        isValid: false,
        errors: ['Error 1']
      };

      const updatedResult: ValidationResult = {
        ...baseResult,
        errors: [...baseResult.errors, 'Error 2']
      };

      expect(updatedResult.errors).toHaveLength(2);
      expect(baseResult.errors).toHaveLength(1); // Original unchanged
    });

    it('should work with Object.assign', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      const copy = Object.assign({}, result);

      expect(copy).toEqual(result);
      expect(copy).not.toBe(result); // Different reference
    });

    it('should support immutable error array updates', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Error 1']
      };

      // Add error immutably
      const updated: ValidationResult = {
        ...result,
        errors: [...result.errors, 'Error 2']
      };

      expect(result.errors).toHaveLength(1);
      expect(updated.errors).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should accept empty errors array', () => {
      const result: ValidationResult = {
        isValid: true,
        errors: []
      };

      expect(result.errors).toEqual([]);
      expect(result.errors).not.toBeNull();
      expect(result.errors).not.toBeUndefined();
    });

    it('should accept very long error messages', () => {
      const longError = 'Error: ' + 'x'.repeat(500);
      const result: ValidationResult = {
        isValid: false,
        errors: [longError]
      };

      expect(result.errors[0].length).toBeGreaterThan(500);
    });

    it('should accept many error messages', () => {
      const manyErrors = Array.from({ length: 20 }, (_, i) => `Error ${i + 1}`);
      const result: ValidationResult = {
        isValid: false,
        errors: manyErrors
      };

      expect(result.errors).toHaveLength(20);
      expect(result.errors[0]).toBe('Error 1');
      expect(result.errors[19]).toBe('Error 20');
    });

    it('should accept special characters in error messages', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'Error with "quotes"',
          "Error with 'apostrophes'",
          'Error with symbols: @#$%^&*()'
        ]
      };

      expect(result.errors[0]).toContain('"quotes"');
      expect(result.errors[2]).toContain('@#$%');
    });

    it('should accept Unicode in error messages', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          'エラー: タイトルが必要です',
          'Ошибка: требуется исполнитель',
          'Error con émojis 🚫❌'
        ]
      };

      expect(result.errors[0]).toContain('タイトル');
      expect(result.errors[1]).toContain('Ошибка');
      expect(result.errors[2]).toContain('🚫');
    });

    it('should handle result with isValid false and empty errors (edge case)', () => {
      // This is technically invalid pattern but type system allows it
      const edgeCase: ValidationResult = {
        isValid: false,
        errors: []
      };

      expect(edgeCase.isValid).toBe(false);
      expect(edgeCase.errors).toHaveLength(0);
      // Note: Business logic should prevent this, but type allows it
    });
  });

  describe('Usage Patterns', () => {
    it('should support conditional rendering pattern', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: ['Title is required', 'Artist is required']
      };

      const renderErrors = (validation: ValidationResult): string[] => {
        return validation.isValid ? [] : validation.errors;
      };

      expect(renderErrors(result)).toHaveLength(2);
    });

    it('should support error checking pattern', () => {
      const checkValidation = (result: ValidationResult): boolean => {
        if (!result.isValid) {
          // console.log('Validation failed with errors:', result.errors);
          return false;
        }
        return true;
      };

      const validResult: ValidationResult = { isValid: true, errors: [] };
      const invalidResult: ValidationResult = {
        isValid: false,
        errors: ['Error']
      };

      expect(checkValidation(validResult)).toBe(true);
      expect(checkValidation(invalidResult)).toBe(false);
    });

    it('should support accumulation pattern', () => {
      const errors: string[] = [];
      
      // Simulate validator accumulating errors
      if (true) errors.push('Title is required');
      if (true) errors.push('Artist is required');

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors: errors
      };

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it('should support early exit pattern', () => {
      const processValidation = (result: ValidationResult): string => {
        if (!result.isValid) {
          return `Failed: ${result.errors.join(', ')}`;
        }
        return 'Success';
      };

      const invalid: ValidationResult = {
        isValid: false,
        errors: ['Error 1', 'Error 2']
      };

      expect(processValidation(invalid)).toBe('Failed: Error 1, Error 2');
    });

    it('should work with form validation pattern', () => {
      const validateForm = (title: string, artist: string): ValidationResult => {
        const errors: string[] = [];

        if (!title) errors.push('Title is required');
        if (!artist) errors.push('Artist is required');

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      const result1 = validateForm('', '');
      const result2 = validateForm('Song', 'Artist');

      expect(result1.isValid).toBe(false);
      expect(result1.errors).toHaveLength(2);
      expect(result2.isValid).toBe(true);
      expect(result2.errors).toHaveLength(0);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety in functions', () => {
      const createValidResult = (): ValidationResult => {
        return { isValid: true, errors: [] };
      };

      const createInvalidResult = (errors: string[]): ValidationResult => {
        return { isValid: false, errors };
      };

      expect(createValidResult().isValid).toBe(true);
      expect(createInvalidResult(['Error']).isValid).toBe(false);
    });

    it('should support type guards', () => {
      const isValidResult = (result: ValidationResult): boolean => {
        return result.isValid && result.errors.length === 0;
      };

      const valid: ValidationResult = { isValid: true, errors: [] };
      const invalid: ValidationResult = { isValid: false, errors: ['Error'] };

      expect(isValidResult(valid)).toBe(true);
      expect(isValidResult(invalid)).toBe(false);
    });

    it('should work with union types', () => {
      type Result = ValidationResult | null;

      const result: Result = { isValid: false, errors: ['Error'] };
      const nullResult: Result = null;

      expect(result).not.toBeNull();
      expect(nullResult).toBeNull();
    });
  });
});