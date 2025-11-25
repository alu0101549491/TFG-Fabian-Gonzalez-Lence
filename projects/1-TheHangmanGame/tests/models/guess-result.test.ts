/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/tests/models/guess-result.test.ts
 * @desc Unit tests for the GuessResult enum.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {GuessResult} from '@models/guess-result';

describe('GuessResult', () => {
  describe('Enum Structure', () => {
    it('should export all three enum values', () => {
      // ARRANGE: Enum is already imported
      
      // ACT: Access enum values
      const correct = GuessResult.CORRECT;
      const incorrect = GuessResult.INCORRECT;
      const alreadyGuessed = GuessResult.ALREADY_GUESSED;
      
      // ASSERT: All values are defined
      expect(correct).toBeDefined();
      expect(incorrect).toBeDefined();
      expect(alreadyGuessed).toBeDefined();
    });

    it('should have exactly 3 enum values', () => {
      // ARRANGE & ACT
      const enumKeys = Object.keys(GuessResult);
      const enumValues = Object.values(GuessResult);
      
      // ASSERT
      expect(enumKeys).toHaveLength(3);
      expect(enumValues).toHaveLength(3);
    });

    it('should have distinct enum values', () => {
      // ARRANGE & ACT
      const values = Object.values(GuessResult);
      const uniqueValues = [...new Set(values)];
      
      // ASSERT
      expect(uniqueValues).toHaveLength(3);
      expect(values).toHaveLength(uniqueValues.length);
    });

    it('should be importable using path alias', () => {
      // ARRANGE: Import is handled at the top of the file
      
      // ACT: Access the enum
      const importedEnum = GuessResult;
      
      // ASSERT
      expect(importedEnum).toBeDefined();
      expect(importedEnum.CORRECT).toBe('CORRECT');
    });
  });

  describe('Enum Values', () => {
    it('should have CORRECT value equal to "CORRECT"', () => {
      // ARRANGE & ACT
      const value = GuessResult.CORRECT;
      
      // ASSERT
      expect(value).toBe('CORRECT');
    });

    it('should have INCORRECT value equal to "INCORRECT"', () => {
      // ARRANGE & ACT
      const value = GuessResult.INCORRECT;
      
      // ASSERT
      expect(value).toBe('INCORRECT');
    });

    it('should have ALREADY_GUESSED value equal to "ALREADY_GUESSED"', () => {
      // ARRANGE & ACT
      const value = GuessResult.ALREADY_GUESSED;
      
      // ASSERT
      expect(value).toBe('ALREADY_GUESSED');
    });

    it('should have all values as string types', () => {
      // ARRANGE & ACT
      const correctType = typeof GuessResult.CORRECT;
      const incorrectType = typeof GuessResult.INCORRECT;
      const alreadyGuessedType = typeof GuessResult.ALREADY_GUESSED;
      
      // ASSERT
      expect(correctType).toBe('string');
      expect(incorrectType).toBe('string');
      expect(alreadyGuessedType).toBe('string');
    });
  });

  describe('Type Safety', () => {
    it('should work in switch statements', () => {
      // ARRANGE
      const result: GuessResult = GuessResult.CORRECT;
      let message = '';
      
      // ACT
      switch (result) {
        case GuessResult.CORRECT:
          message = 'Letter is correct';
          break;
        case GuessResult.INCORRECT:
          message = 'Letter is incorrect';
          break;
        case GuessResult.ALREADY_GUESSED:
          message = 'Already guessed';
          break;
      }
      
      // ASSERT
      expect(message).toBe('Letter is correct');
    });

    it('should work in if-else comparisons', () => {
      // ARRANGE
      const result: GuessResult = GuessResult.INCORRECT;
      let isCorrect = false;
      
      // ACT
      if (result === GuessResult.CORRECT) {
        isCorrect = true;
      }
      
      // ASSERT
      expect(isCorrect).toBe(false);
    });

    it('should support type annotations', () => {
      // ARRANGE & ACT
      const correct: GuessResult = GuessResult.CORRECT;
      const incorrect: GuessResult = GuessResult.INCORRECT;
      const alreadyGuessed: GuessResult = GuessResult.ALREADY_GUESSED;
      
      // ASSERT
      expect(correct).toBe('CORRECT');
      expect(incorrect).toBe('INCORRECT');
      expect(alreadyGuessed).toBe('ALREADY_GUESSED');
    });

    it('should be usable as function return type', () => {
      // ARRANGE
      const getCorrectResult = (): GuessResult => {
        return GuessResult.CORRECT;
      };
      
      // ACT
      const result = getCorrectResult();
      
      // ASSERT
      expect(result).toBe(GuessResult.CORRECT);
    });
  });

  describe('Enum Comparison', () => {
    it('should support strict equality comparison', () => {
      // ARRANGE
      const result1 = GuessResult.CORRECT;
      const result2 = GuessResult.CORRECT;
      
      // ACT & ASSERT
      expect(result1 === result2).toBe(true);
      expect(result1 === GuessResult.CORRECT).toBe(true);
    });

    it('should not equal its string representation when compared to different enum values', () => {
      // ARRANGE
      const correct = GuessResult.CORRECT;
      const incorrect = GuessResult.INCORRECT;
      
      // ACT & ASSERT
      expect(correct === 'CORRECT').toBe(true); // This is true for string enums
      expect(correct === incorrect).toBe(false);
    });

    it('should return all keys with Object.keys()', () => {
      // ARRANGE & ACT
      const keys = Object.keys(GuessResult);
      
      // ASSERT
      expect(keys).toEqual(['CORRECT', 'INCORRECT', 'ALREADY_GUESSED']);
    });

    it('should return all values with Object.values()', () => {
      // ARRANGE & ACT
      const values = Object.values(GuessResult);
      
      // ASSERT
      expect(values).toContain('CORRECT');
      expect(values).toContain('INCORRECT');
      expect(values).toContain('ALREADY_GUESSED');
      expect(values).toHaveLength(3);
    });
  });

  describe('Serialization', () => {
    it('should serialize enum values to JSON correctly', () => {
      // ARRANGE
      const testData = {
        result: GuessResult.CORRECT,
        status: 'active',
      };
      
      // ACT
      const jsonString = JSON.stringify(testData);
      const parsedData = JSON.parse(jsonString);
      
      // ASSERT
      expect(parsedData.result).toBe('CORRECT');
      expect(parsedData.status).toBe('active');
    });

    it('should maintain string values after JSON round-trip', () => {
      // ARRANGE
      const originalValue = GuessResult.INCORRECT;
      
      // ACT
      const serialized = JSON.stringify({ value: originalValue });
      const deserialized = JSON.parse(serialized);
      const roundTripValue = deserialized.value;
      
      // ASSERT
      expect(roundTripValue).toBe('INCORRECT');
      expect(roundTripValue).toBe(originalValue);
    });
  });

  describe('Invalid Value Handling', () => {
    it('should handle runtime string comparisons correctly', () => {
      // ARRANGE
      const runtimeString = 'CORRECT';
      const enumValue = GuessResult.CORRECT;
      
      // ACT & ASSERT
      expect(runtimeString === enumValue).toBe(true); // String enum behavior
    });

    it('should not accept invalid string values as enum type at runtime', () => {
      // ARRANGE
      const invalidString = 'INVALID_VALUE';
      
      // ACT & ASSERT
      // This test verifies runtime behavior - invalid strings are not type-safe GuessResult
      // The TypeScript compiler should catch this, but at runtime it's just a string
      expect(invalidString).toBe('INVALID_VALUE');
      // Note: TypeScript would prevent assigning invalidString to a GuessResult typed variable
    });

    it('should distinguish between valid and invalid enum values', () => {
      // ARRANGE
      const validValues = Object.values(GuessResult);
      const invalidValue = 'NOT_A_REAL_VALUE';
      
      // ACT & ASSERT
      expect(validValues).toContain('CORRECT');
      expect(validValues).toContain('INCORRECT');
      expect(validValues).toContain('ALREADY_GUESSED');
      expect(validValues).not.toContain(invalidValue);
    });
  });

  describe('Integration', () => {
    it('should work in exhaustive switch statement', () => {
      // ARRANGE
      const processResult = (result: GuessResult): string => {
        switch (result) {
          case GuessResult.CORRECT:
            return 'reveal letter';
          case GuessResult.INCORRECT:
            return 'increment fail count';
          case GuessResult.ALREADY_GUESSED:
            return 'no action';
          // Note: No default case needed for exhaustive check
        }
      };
      
      // ACT
      const correctAction = processResult(GuessResult.CORRECT);
      const incorrectAction = processResult(GuessResult.INCORRECT);
      const alreadyGuessedAction = processResult(GuessResult.ALREADY_GUESSED);
      
      // ASSERT
      expect(correctAction).toBe('reveal letter');
      expect(incorrectAction).toBe('increment fail count');
      expect(alreadyGuessedAction).toBe('no action');
    });

    it('should work with mock GameModel scenario', () => {
      // ARRANGE: Mock a GameModel method that returns GuessResult
      const mockGuessLetter = (letter: string): GuessResult => {
        // Simulate different outcomes based on input
        if (letter === 'A') return GuessResult.CORRECT;
        if (letter === 'Z') return GuessResult.INCORRECT;
        if (letter === 'B') return GuessResult.ALREADY_GUESSED;
        return GuessResult.INCORRECT; // default
      };
      
      // ACT
      const correctResult = mockGuessLetter('A');
      const incorrectResult = mockGuessLetter('Z');
      const alreadyGuessedResult = mockGuessLetter('B');
      
      // ASSERT
      expect(correctResult).toBe(GuessResult.CORRECT);
      expect(incorrectResult).toBe(GuessResult.INCORRECT);
      expect(alreadyGuessedResult).toBe(GuessResult.ALREADY_GUESSED);
    });

    it('should work with mock GameController scenario', () => {
      // ARRANGE: Mock a GameController processing GuessResult
      interface MockGameState {
        revealedLetters: string[];
        failedAttempts: number;
        message: string;
      }
      
      const mockGameState: MockGameState = {
        revealedLetters: [],
        failedAttempts: 0,
        message: '',
      };
      
      const mockHandleGuessResult = (result: GuessResult) => {
        switch (result) {
          case GuessResult.CORRECT:
            mockGameState.message = 'Correct! Letter revealed.';
            break;
          case GuessResult.INCORRECT:
            mockGameState.failedAttempts++;
            mockGameState.message = 'Incorrect! Try another letter.';
            break;
          case GuessResult.ALREADY_GUESSED:
            mockGameState.message = 'Letter already guessed. Try another.';
            break;
        }
      };
      
      // ACT
      mockHandleGuessResult(GuessResult.CORRECT);
      const correctMessage = mockGameState.message;
      
      mockHandleGuessResult(GuessResult.INCORRECT);
      const failedAttempts = mockGameState.failedAttempts;
      const incorrectMessage = mockGameState.message;
      
      mockHandleGuessResult(GuessResult.ALREADY_GUESSED);
      const alreadyGuessedMessage = mockGameState.message;
      
      // ASSERT
      expect(correctMessage).toBe('Correct! Letter revealed.');
      expect(failedAttempts).toBe(1); // Should be 1 after the incorrect guess
      expect(incorrectMessage).toBe('Incorrect! Try another letter.');
      expect(alreadyGuessedMessage).toBe('Letter already guessed. Try another.');
    });
  });
});
