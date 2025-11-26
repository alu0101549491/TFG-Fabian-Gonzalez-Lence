/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/tests/models/game-model.test.ts
 * @desc Unit tests for the GameModel.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {GameModel} from '@models/game-model';
import {WordDictionary} from '@models/word-dictionary';
import {GuessResult} from '@models/guess-result';

describe('GameModel', () => {
  let gameModel: GameModel;
  let mockWordDictionary: jest.Mocked<WordDictionary>;

  beforeEach(() => {
    // Create mock WordDictionary
    mockWordDictionary = {
      getRandomWord: jest.fn().mockReturnValue('ELEPHANT'),
      getWordCount: jest.fn().mockReturnValue(10),
    } as any;

    // Create GameModel with mock dictionary
    gameModel = new GameModel(mockWordDictionary);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided WordDictionary', () => {
      // ARRANGE & ACT
      const model = new GameModel(mockWordDictionary);
      
      // ASSERT
      expect(model).toBeDefined();
      expect(model).toBeInstanceOf(GameModel);
    });

    it('should set maxAttempts to 6', () => {
      // ARRANGE & ACT
      const model = new GameModel(mockWordDictionary);
      
      // ASSERT
      expect(model.getMaxAttempts()).toBe(6);
    });

    it('should initialize failedAttempts to 0', () => {
      // ARRANGE & ACT
      const model = new GameModel(mockWordDictionary);
      
      // ASSERT
      expect(model.getFailedAttempts()).toBe(0);
    });

    it('should initialize with empty guessedLetters Set', () => {
      // ARRANGE & ACT
      gameModel.initializeGame(); // Need to initialize to have a valid state
      
      // ASSERT
      // We can test this by checking if no letters are considered guessed initially
      const letters = ['A', 'B', 'C', 'D', 'E'];
      for (const letter of letters) {
        expect(gameModel.isLetterGuessed(letter)).toBe(false);
      }
    });
  });

  describe('initializeGame', () => {
    it('should call wordDictionary.getRandomWord', () => {
      // ARRANGE: gameModel already created in beforeEach
      
      // ACT
      gameModel.initializeGame();
      
      // ASSERT
      expect(mockWordDictionary.getRandomWord).toHaveBeenCalledTimes(1);
    });

    it('should set secretWord from dictionary', () => {
      // ARRANGE
      mockWordDictionary.getRandomWord.mockReturnValue('CAT');
      
      // ACT
      gameModel.initializeGame();
      
      // ASSERT
      expect(gameModel.getSecretWord()).toBe('CAT');
    });

    it('should reset failedAttempts to 0', () => {
      // ARRANGE
      gameModel.initializeGame();
      gameModel.guessLetter('Z'); // Make a wrong guess
      expect(gameModel.getFailedAttempts()).toBe(1);
      
      // ACT
      gameModel.initializeGame();
      
      // ASSERT
      expect(gameModel.getFailedAttempts()).toBe(0);
    });

    it('should clear guessedLetters Set', () => {
      // ARRANGE
      gameModel.initializeGame();
      gameModel.guessLetter('E'); // Guess a letter
      expect(gameModel.isLetterGuessed('E')).toBe(true);
      
      // ACT
      gameModel.initializeGame();
      
      // ASSERT
      expect(gameModel.isLetterGuessed('E')).toBe(false);
    });

    it('should set secretWord to a non-empty string', () => {
      // ARRANGE & ACT
      gameModel.initializeGame();
      const secretWord = gameModel.getSecretWord();
      
      // ASSERT
      expect(secretWord).toBeDefined();
      expect(typeof secretWord).toBe('string');
      expect(secretWord.length).toBeGreaterThan(0);
    });
  });

  describe('guessLetter', () => {
    beforeEach(() => {
      gameModel.initializeGame();
    });

    it('should return CORRECT when letter is in word', () => {
      // ARRANGE: word is 'ELEPHANT'
      
      // ACT
      const result = gameModel.guessLetter('E');
      
      // ASSERT
      expect(result).toBe(GuessResult.CORRECT);
    });

    it('should return INCORRECT when letter is not in word', () => {
      // ARRANGE: word is 'ELEPHANT'
      
      // ACT
      const result = gameModel.guessLetter('Z');
      
      // ASSERT
      expect(result).toBe(GuessResult.INCORRECT);
    });

    it('should increment failedAttempts on incorrect guess', () => {
      // ARRANGE: word is 'ELEPHANT'
      expect(gameModel.getFailedAttempts()).toBe(0);
      
      // ACT
      gameModel.guessLetter('Z');
      
      // ASSERT
      expect(gameModel.getFailedAttempts()).toBe(1);
    });

    it('should NOT increment failedAttempts on correct guess', () => {
      // ARRANGE: word is 'ELEPHANT'
      expect(gameModel.getFailedAttempts()).toBe(0);
      
      // ACT
      gameModel.guessLetter('E');
      
      // ASSERT
      expect(gameModel.getFailedAttempts()).toBe(0);
    });

    it('should return ALREADY_GUESSED for duplicate correct letter', () => {
      // ARRANGE
      gameModel.guessLetter('E');
      
      // ACT
      const result = gameModel.guessLetter('E');
      
      // ASSERT
      expect(result).toBe(GuessResult.ALREADY_GUESSED);
    });

    it('should return ALREADY_GUESSED for duplicate incorrect letter', () => {
      // ARRANGE
      gameModel.guessLetter('Z');
      
      // ACT
      const result = gameModel.guessLetter('Z');
      
      // ASSERT
      expect(result).toBe(GuessResult.ALREADY_GUESSED);
    });

    it('should normalize lowercase input to uppercase', () => {
      // ARRANGE & ACT
      const result = gameModel.guessLetter('e');
      
      // ASSERT
      expect(result).toBe(GuessResult.CORRECT);
    });

    it('should work for multiple occurrences of same letter', () => {
      // ARRANGE: word is 'ELEPHANT' (2 E's)
      gameModel.guessLetter('e'); // lowercase to test normalization
      
      // ACT & ASSERT
      const revealed = gameModel.getRevealedWord();
      expect(revealed[0]).toBe('E');
      expect(revealed[2]).toBe('E');
    });

    it('should throw error when game is not initialized', () => {
      // ARRANGE: Don't initialize the game
      const uninitGameModel = new GameModel(mockWordDictionary);
      
      // ACT & ASSERT
      expect(() => {
        uninitGameModel.guessLetter('A');
      }).toThrow('Game not initialized. Call initializeGame() first.');
    });

    it('should throw error when game is over', () => {
      // ARRANGE: Make 6 incorrect guesses to reach defeat
      gameModel.initializeGame();
      ['Z', 'Q', 'X', 'W', 'V', 'U'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      expect(gameModel.isGameOver()).toBe(true);
      
      // ACT & ASSERT
      expect(() => {
        gameModel.guessLetter('A');
      }).toThrow('Game is over. Call resetGame() to start a new game.');
    });

    it('should handle single character validation', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => {
        gameModel.guessLetter('AB');
      }).toThrow('Invalid letter. Must be a single alphabetic character.');
    });

    it('should handle non-alphabetic input validation', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => {
        gameModel.guessLetter('1');
      }).toThrow('Invalid letter. Must be a single alphabetic character.');
    });

    it('should handle empty string validation', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => {
        gameModel.guessLetter('');
      }).toThrow('Invalid letter. Must be a single alphabetic character.');
    });

    it('should handle special character validation', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => {
        gameModel.guessLetter('!');
      }).toThrow('Invalid letter. Must be a single alphabetic character.');
    });
  });

  describe('isLetterGuessed', () => {
    beforeEach(() => {
      gameModel.initializeGame();
    });

    it('should return true for guessed letter', () => {
      // ARRANGE
      gameModel.guessLetter('E');
      
      // ACT & ASSERT
      expect(gameModel.isLetterGuessed('E')).toBe(true);
      expect(gameModel.isLetterGuessed('e')).toBe(true); // case insensitive
    });

    it('should return false for unguessed letter', () => {
      // ARRANGE & ACT & ASSERT
      expect(gameModel.isLetterGuessed('Z')).toBe(false);
    });

    it('should work case-insensitively', () => {
      // ARRANGE
      gameModel.guessLetter('e'); // lowercase input
      
      // ACT & ASSERT
      expect(gameModel.isLetterGuessed('E')).toBe(true); // uppercase check
      expect(gameModel.isLetterGuessed('e')).toBe(true); // lowercase check
    });
  });

  describe('getRevealedWord', () => {
    beforeEach(() => {
      gameModel.initializeGame();
    });

    it('should return array with empty strings for unguessed letters', () => {
      // ARRANGE: No guesses yet, word is 'ELEPHANT'
      
      // ACT
      const revealed = gameModel.getRevealedWord();
      
      // ASSERT
      expect(revealed).toHaveLength(8); // 'ELEPHANT' has 8 letters
      expect(revealed.every(letter => letter === '')).toBe(true);
    });

    it('should reveal all occurrences of guessed letter', () => {
      // ARRANGE: word is 'ELEPHANT' (2 E's)
      gameModel.guessLetter('E');
      
      // ACT
      const revealed = gameModel.getRevealedWord();
      
      // ASSERT
      expect(revealed[0]).toBe('E'); // First E
      expect(revealed[2]).toBe('E'); // Second E
      expect(revealed[1]).toBe('');  // L is not guessed yet
    });

    it('should return array length matching secretWord length', () => {
      // ARRANGE
      mockWordDictionary.getRandomWord.mockReturnValue('CAT');
      gameModel.initializeGame();
      
      // ACT
      const revealed = gameModel.getRevealedWord();
      
      // ASSERT
      expect(revealed).toHaveLength(3); // 'CAT' has 3 letters
    });

    it('should return all letters when all guessed (victory state)', () => {
      // ARRANGE: word is 'CAT', guess all unique letters
      mockWordDictionary.getRandomWord.mockReturnValue('CAT');
      gameModel.initializeGame();
      ['C', 'A', 'T'].forEach(letter => gameModel.guessLetter(letter));
      
      // ACT
      const revealed = gameModel.getRevealedWord();
      
      // ASSERT
      expect(revealed).toEqual(['C', 'A', 'T']);
    });

    it('should handle multiple correct guesses', () => {
      // ARRANGE: word is 'ELEPHANT'
      gameModel.guessLetter('E');
      gameModel.guessLetter('L');
      
      // ACT
      const revealed = gameModel.getRevealedWord();
      
      // ASSERT
      expect(revealed[0]).toBe('E'); // First E
      expect(revealed[1]).toBe('L'); // L
      expect(revealed[2]).toBe('E'); // Second E
      expect(revealed[3]).toBe('');  // P not guessed yet
    });
  });

  describe('getFailedAttempts', () => {
    beforeEach(() => {
      gameModel.initializeGame();
    });

    it('should return current failed attempts count', () => {
      // ARRANGE & ACT
      gameModel.guessLetter('Z'); // 1 wrong
      const attempts1 = gameModel.getFailedAttempts();
      
      gameModel.guessLetter('X'); // 2 wrong
      const attempts2 = gameModel.getFailedAttempts();
      
      // ASSERT
      expect(attempts1).toBe(1);
      expect(attempts2).toBe(2);
    });

    it('should not change on correct guesses', () => {
      // ARRANGE
      gameModel.guessLetter('Z'); // 1 wrong
      expect(gameModel.getFailedAttempts()).toBe(1);
      
      // ACT
      gameModel.guessLetter('E'); // correct guess
      
      // ASSERT
      expect(gameModel.getFailedAttempts()).toBe(1);
    });
  });

  describe('getMaxAttempts', () => {
    it('should return 6', () => {
      // ARRANGE & ACT & ASSERT
      expect(gameModel.getMaxAttempts()).toBe(6);
    });
  });

  describe('isGameOver', () => {
    beforeEach(() => {
      gameModel.initializeGame();
    });

    it('should return true when victory is achieved', () => {
      // ARRANGE: word is 'CAT', guess all unique letters
      mockWordDictionary.getRandomWord.mockReturnValue('CAT');
      gameModel.initializeGame();
      ['C', 'A', 'T'].forEach(letter => gameModel.guessLetter(letter));
      
      // ACT & ASSERT
      expect(gameModel.isGameOver()).toBe(true);
    });

    it('should return true when defeat is reached', () => {
      // ARRANGE: Make 6 incorrect guesses
      ['Z', 'Q', 'X', 'W', 'V', 'U'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // ACT & ASSERT
      expect(gameModel.isGameOver()).toBe(true);
    });

    it('should return false when game is ongoing', () => {
      // ARRANGE: Make 1 incorrect guess
      gameModel.guessLetter('Z');
      
      // ACT & ASSERT
      expect(gameModel.isGameOver()).toBe(false);
    });
  });

  describe('isVictory', () => {
    beforeEach(() => {
      gameModel.initializeGame();
    });

    it('should return true when all unique letters guessed', () => {
      // ARRANGE: word is 'ELEPHANT', unique letters: E, L, P, H, A, N, T
      ['E', 'L', 'P', 'H', 'A', 'N', 'T'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // ACT & ASSERT
      expect(gameModel.isVictory()).toBe(true);
    });

    it('should return false when some letters missing', () => {
      // ARRANGE: word is 'ELEPHANT', only guess 'E'
      gameModel.guessLetter('E');
      
      // ACT & ASSERT
      expect(gameModel.isVictory()).toBe(false);
    });

    it('should handle words with duplicate letters correctly', () => {
      // ARRANGE: word is 'ELEPHANT' (has 2 E's), only need to guess 'E' once for victory
      ['E', 'L', 'P', 'H', 'A', 'N', 'T'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // ACT & ASSERT
      expect(gameModel.isVictory()).toBe(true);
    });

    it('should work for single letter word', () => {
      // ARRANGE
      mockWordDictionary.getRandomWord.mockReturnValue('A');
      gameModel.initializeGame();
      gameModel.guessLetter('A');
      
      // ACT & ASSERT
      expect(gameModel.isVictory()).toBe(true);
    });
  });

  describe('isDefeat', () => {
    beforeEach(() => {
      gameModel.initializeGame();
    });

    it('should return true when failedAttempts reaches 6', () => {
      // ARRANGE: Make 6 incorrect guesses
      ['Z', 'Q', 'X', 'W', 'V', 'U'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // ACT & ASSERT
      expect(gameModel.isDefeat()).toBe(true);
    });

    it('should return false when failedAttempts less than 6', () => {
      // ARRANGE: Make 3 incorrect guesses
      ['Z', 'Q', 'X'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // ACT & ASSERT
      expect(gameModel.isDefeat()).toBe(false);
    });

    it('should return false when at 5 failed attempts', () => {
      // ARRANGE: Make 5 incorrect guesses
      ['Z', 'Q', 'X', 'W', 'V'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // ACT & ASSERT
      expect(gameModel.isDefeat()).toBe(false);
    });
  });

  describe('getSecretWord', () => {
    it('should return the complete secret word', () => {
      // ARRANGE
      mockWordDictionary.getRandomWord.mockReturnValue('CAT');
      gameModel.initializeGame();
      
      // ACT & ASSERT
      expect(gameModel.getSecretWord()).toBe('CAT');
    });
  });

  describe('resetGame', () => {
    it('should call initializeGame', () => {
      // ARRANGE: Make some changes to game state
      gameModel.initializeGame();
      gameModel.guessLetter('E');
      gameModel.guessLetter('Z');
      expect(gameModel.getFailedAttempts()).toBe(1);
      expect(gameModel.isLetterGuessed('E')).toBe(true);
      
      // ACT
      gameModel.resetGame();
      
      // ASSERT
      expect(gameModel.getFailedAttempts()).toBe(0);
      expect(gameModel.isLetterGuessed('E')).toBe(false);
    });

    it('should select a new word', () => {
      // ARRANGE
      mockWordDictionary.getRandomWord.mockReturnValueOnce('CAT').mockReturnValueOnce('DOG');
      gameModel.initializeGame();
      const firstWord = gameModel.getSecretWord();
      
      // ACT
      gameModel.resetGame();
      const secondWord = gameModel.getSecretWord();
      
      // ASSERT
      expect(firstWord).toBe('CAT');
      expect(secondWord).toBe('DOG');
    });

    it('should reset all state', () => {
      // ARRANGE: Make changes to all state
      gameModel.initializeGame();
      gameModel.guessLetter('E');
      gameModel.guessLetter('Z');
      gameModel.guessLetter('X');
      
      // Verify pre-reset state
      expect(gameModel.getFailedAttempts()).toBe(2);
      expect(gameModel.isLetterGuessed('E')).toBe(true);
      expect(gameModel.isGameOver()).toBe(false);
      
      // ACT
      gameModel.resetGame();
      
      // ASSERT: All state should be reset
      expect(gameModel.getFailedAttempts()).toBe(0);
      expect(gameModel.isLetterGuessed('E')).toBe(false);
      expect(gameModel.isGameOver()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      gameModel.initializeGame();
    });

    it('should handle word with all duplicate letters', () => {
      // ARRANGE: word with all same letters
      mockWordDictionary.getRandomWord.mockReturnValue('AAA');
      gameModel.initializeGame();
      
      // ACT: guess the only unique letter
      gameModel.guessLetter('A');
      
      // ASSERT: should be victory after one guess
      expect(gameModel.isVictory()).toBe(true);
    });

    it('should handle game where all letters are wrong before defeat', () => {
      // ARRANGE: Make 5 wrong guesses
      ['Z', 'Q', 'X', 'W', 'V'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      expect(gameModel.getFailedAttempts()).toBe(5);
      expect(gameModel.isDefeat()).toBe(false);
      
      // ACT: 6th wrong guess
      gameModel.guessLetter('U');
      
      // ASSERT: should be defeat
      expect(gameModel.getFailedAttempts()).toBe(6);
      expect(gameModel.isDefeat()).toBe(true);
    });

    it('should handle victory just before defeat threshold', () => {
      // ARRANGE: Make 5 wrong guesses
      ['Z', 'Q', 'X', 'W', 'V'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      expect(gameModel.getFailedAttempts()).toBe(5);
      
      // ACT: Guess all correct letters to win
      ['E', 'L', 'P', 'H', 'A', 'N', 'T'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // ASSERT: Should win despite being close to defeat
      expect(gameModel.getFailedAttempts()).toBe(5); // No more failures
      expect(gameModel.isVictory()).toBe(true);
      expect(gameModel.isGameOver()).toBe(true);
    });

    it('should handle case where same letter is guessed multiple times', () => {
      // ARRANGE
      gameModel.guessLetter('E');
      expect(gameModel.isLetterGuessed('E')).toBe(true);
      
      // ACT: Guess same letter multiple times
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(gameModel.guessLetter('E'));
      }
      
      // ASSERT: All should return ALREADY_GUESSED, no state change
      expect(results.every(r => r === GuessResult.ALREADY_GUESSED)).toBe(true);
      expect(gameModel.getFailedAttempts()).toBe(0); // No additional failures
    });
  });

  describe('Integration', () => {
    it('should work with mock GameController scenario', () => {
      // ARRANGE: Simulate a controller processing game model results
      const mockController = {
        handleGuessResult: (result: GuessResult) => {
          switch (result) {
            case GuessResult.CORRECT:
              return 'Reveal letter';
            case GuessResult.INCORRECT:
              return 'Increment fail count';
            case GuessResult.ALREADY_GUESSED:
              return 'Show message';
            default:
              return 'Unknown result';
          }
        }
      };
      
      // ACT: Initialize and make a correct guess
      gameModel.initializeGame();
      const result = gameModel.guessLetter('E');
      const controllerResponse = mockController.handleGuessResult(result);
      
      // ASSERT
      expect(result).toBe(GuessResult.CORRECT);
      expect(controllerResponse).toBe('Reveal letter');
    });

    it('should work with different WordDictionary instances', () => {
      // ARRANGE: Create different dictionary mock
      const anotherMockDict = {
        getRandomWord: jest.fn().mockReturnValue('TIGER'),
        getWordCount: jest.fn().mockReturnValue(15),
      } as any;
      
      const anotherGameModel = new GameModel(anotherMockDict);
      
      // ACT
      anotherGameModel.initializeGame();
      
      // ASSERT
      expect(anotherGameModel.getSecretWord()).toBe('TIGER');
      expect(anotherMockDict.getRandomWord).toHaveBeenCalledTimes(1);
    });

    it('should handle complete game flow: init → play → victory → reset → new game', () => {
      // ARRANGE: Initialize first game
      gameModel.initializeGame();
      const firstWord = gameModel.getSecretWord();
      
      // ACT: Play and win first game
      ['E', 'L', 'P', 'H', 'A', 'N', 'T'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // Verify victory
      expect(gameModel.isVictory()).toBe(true);
      expect(gameModel.isGameOver()).toBe(true);
      
      // Reset for new game
      mockWordDictionary.getRandomWord.mockReturnValue('CAT');
      gameModel.resetGame();
      
      // Play new game
      const secondWord = gameModel.getSecretWord();
      expect(secondWord).toBe('CAT');
      
      // Make a guess in new game
      const result = gameModel.guessLetter('C');
      
      // ASSERT: New game state
      expect(result).toBe(GuessResult.CORRECT);
      expect(gameModel.isGameOver()).toBe(false);
      expect(gameModel.getFailedAttempts()).toBe(0);
      expect(gameModel.isLetterGuessed('C')).toBe(true);
    });

    it('should handle complete game flow: init → play → defeat → reset → new game', () => {
      // ARRANGE: Initialize first game
      gameModel.initializeGame();
      const firstWord = gameModel.getSecretWord();
      
      // ACT: Play and lose first game
      ['Z', 'Q', 'X', 'W', 'V', 'U'].forEach(letter => {
        gameModel.guessLetter(letter);
      });
      
      // Verify defeat
      expect(gameModel.isDefeat()).toBe(true);
      expect(gameModel.isGameOver()).toBe(true);
      
      // Reset for new game
      mockWordDictionary.getRandomWord.mockReturnValue('DOG');
      gameModel.resetGame();
      
      // Play new game
      const secondWord = gameModel.getSecretWord();
      expect(secondWord).toBe('DOG');
      
      // Make a guess in new game
      const result = gameModel.guessLetter('D');
      
      // ASSERT: New game state
      expect(result).toBe(GuessResult.CORRECT);
      expect(gameModel.isGameOver()).toBe(false);
      expect(gameModel.getFailedAttempts()).toBe(0);
      expect(gameModel.isLetterGuessed('D')).toBe(true);
    });
  });
});
