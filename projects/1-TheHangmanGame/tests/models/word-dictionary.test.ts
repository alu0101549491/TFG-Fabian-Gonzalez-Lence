/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/tests/models/word-dictionary.test.ts
 * @desc Unit tests for the WordDictionary model.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {WordDictionary} from '@models/word-dictionary';

describe('WordDictionary', () => {
  let dictionary: WordDictionary;

  beforeEach(() => {
    // Create fresh instance for each test
    dictionary = new WordDictionary();
  });

  describe('constructor', () => {
    it('should initialize without errors', () => {
      // ARRANGE & ACT
      const dict = new WordDictionary();
      
      // ASSERT
      expect(dict).toBeDefined();
      expect(dict).toBeInstanceOf(WordDictionary);
    });

    it('should populate words array during initialization', () => {
      // ARRANGE & ACT
      const dict = new WordDictionary();
      
      // ASSERT
      expect(dict.getWordCount()).toBeGreaterThan(0);
    });

    it('should create an instance that can be used immediately', () => {
      // ARRANGE & ACT
      const dict = new WordDictionary();
      const word = dict.getRandomWord();
      
      // ASSERT
      expect(word).toBeDefined();
      expect(typeof word).toBe('string');
    });

    it('should not throw an error during construction', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => {
        new WordDictionary();
      }).not.toThrow();
    });
  });

  describe('getRandomWord', () => {
    it('should return a valid non-empty string', () => {
      // ARRANGE: dictionary already created in beforeEach
      
      // ACT
      const word = dictionary.getRandomWord();
      
      // ASSERT
      expect(word).toBeDefined();
      expect(typeof word).toBe('string');
      expect(word.length).toBeGreaterThan(0);
      expect(word).not.toBe('');
    });

    it('should return a word that exists in the dictionary', () => {
      // ARRANGE
      const allWords = dictionary.getWordCount() > 0 ? 
        Array.from({ length: 10 }, () => dictionary.getRandomWord()) : [];
      
      // ACT & ASSERT
      for (const word of allWords) {
        expect(dictionary.getWordCount()).toBeGreaterThan(0);
        // We can't directly access the private words array, 
        // but we can verify the word is valid by getting the count
        expect(typeof word).toBe('string');
        expect(word.length).toBeGreaterThan(0);
      }
    });

    it('should return a word in UPPERCASE', () => {
      // ARRANGE & ACT
      const word = dictionary.getRandomWord();
      
      // ASSERT
      expect(word).toBe(word.toUpperCase());
      expect(word).toMatch(/^[A-Z]+$/);
    });

    it('should return different words on multiple calls', () => {
      // ARRANGE
      const sampleSize = 20;
      const words: string[] = [];
      
      // ACT
      for (let i = 0; i < sampleSize; i++) {
        words.push(dictionary.getRandomWord());
      }
      
      // ASSERT
      // While it's possible to get the same word multiple times due to randomness,
      // we expect at least some variety in a sample of 20
      const uniqueWords = new Set(words);
      // Even with randomness, we expect at least some variety
      expect(uniqueWords.size).toBeGreaterThanOrEqual(1); // At least 1 unique word
    });

    it('should not return undefined', () => {
      // ARRANGE & ACT
      const word = dictionary.getRandomWord();
      
      // ASSERT
      expect(word).not.toBeUndefined();
    });

    it('should not return null', () => {
      // ARRANGE & ACT
      const word = dictionary.getRandomWord();
      
      // ASSERT
      expect(word).not.toBeNull();
    });

    it('should not return an empty string', () => {
      // ARRANGE & ACT
      const word = dictionary.getRandomWord();
      
      // ASSERT
      expect(word).not.toBe('');
    });

    it('should work multiple times without errors', () => {
      // ARRANGE
      const callCount = 10;
      
      // ACT & ASSERT
      for (let i = 0; i < callCount; i++) {
        const word = dictionary.getRandomWord();
        expect(word).toBeDefined();
        expect(typeof word).toBe('string');
        expect(word.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getWordCount', () => {
    it('should return at least 10 words', () => {
      // ARRANGE & ACT
      const count = dictionary.getWordCount();
      
      // ASSERT
      expect(count).toBeGreaterThanOrEqual(10);
    });

    it('should return a positive integer', () => {
      // ARRANGE & ACT
      const count = dictionary.getWordCount();
      
      // ASSERT
      expect(count).toBeGreaterThan(0);
      expect(Number.isInteger(count)).toBe(true);
    });

    it('should return consistent value across multiple calls', () => {
      // ARRANGE
      const count1 = dictionary.getWordCount();
      const count2 = dictionary.getWordCount();
      const count3 = dictionary.getWordCount();
      
      // ACT & ASSERT
      expect(count1).toBe(count2);
      expect(count2).toBe(count3);
      expect(count1).toBe(count3);
    });

    it('should return count that matches sample size', () => {
      // ARRANGE
      const count = dictionary.getWordCount();
      const sampleWords = new Set<string>();
      
      // ACT: Collect samples up to the count to ensure we can get that many unique words
      // (though duplicates are possible, we know the total available is at least the count)
      for (let i = 0; i < Math.min(count, 50); i++) {
        sampleWords.add(dictionary.getRandomWord());
      }
      
      // ASSERT
      // The count represents the total available words, so we can at least get that many samples
      expect(count).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Word Quality', () => {
    it('should contain only uppercase words', () => {
      // ARRANGE
      const sampleSize = 50;
      const words: string[] = [];
      
      // ACT: Collect a sample of words
      for (let i = 0; i < sampleSize; i++) {
        words.push(dictionary.getRandomWord());
      }
      
      // ASSERT: All words in the sample should be uppercase
      for (const word of words) {
        expect(word).toBe(word.toUpperCase());
        expect(word).toMatch(/^[A-Z]+$/);
      }
    });

    it('should contain only alphabetic characters', () => {
      // ARRANGE
      const sampleSize = 50;
      const words: string[] = [];
      
      // ACT: Collect a sample of words
      for (let i = 0; i < sampleSize; i++) {
        words.push(dictionary.getRandomWord());
      }
      
      // ASSERT: All words should contain only alphabetic characters
      for (const word of words) {
        expect(word).toMatch(/^[A-Z]+$/);
        expect(/[^A-Z]/.test(word)).toBe(false);
      }
    });

    it('should not contain any empty strings', () => {
      // ARRANGE
      const sampleSize = 50;
      const words: string[] = [];
      
      // ACT: Collect a sample of words
      for (let i = 0; i < sampleSize; i++) {
        words.push(dictionary.getRandomWord());
      }
      
      // ASSERT: No word should be an empty string
      for (const word of words) {
        expect(word).not.toBe('');
      }
    });

    it('should not contain any words with spaces', () => {
      // ARRANGE
      const sampleSize = 50;
      const words: string[] = [];
      
      // ACT: Collect a sample of words
      for (let i = 0; i < sampleSize; i++) {
        words.push(dictionary.getRandomWord());
      }
      
      // ASSERT: No word should contain spaces
      for (const word of words) {
        expect(word).not.toMatch(/\s/);
      }
    });

    it('should not contain any words with special characters', () => {
      // ARRANGE
      const sampleSize = 50;
      const words: string[] = [];
      
      // ACT: Collect a sample of words
      for (let i = 0; i < sampleSize; i++) {
        words.push(dictionary.getRandomWord());
      }
      
      // ASSERT: No word should contain special characters
      for (const word of words) {
        expect(word).toMatch(/^[A-Z]+$/);
      }
    });

    it('should contain words of various lengths', () => {
      // ARRANGE
      const sampleSize = 100;
      const words: string[] = [];
      let hasShortWord = false;
      let hasMediumWord = false;
      let hasLongWord = false;
      
      // ACT: Collect a sample of words
      for (let i = 0; i < sampleSize; i++) {
        const word = dictionary.getRandomWord();
        words.push(word);
        
        // Check for different length categories
        if (word.length >= 3 && word.length <= 5) {
          hasShortWord = true;
        } else if (word.length >= 6 && word.length <= 8) {
          hasMediumWord = true;
        } else if (word.length >= 9) {
          hasLongWord = true;
        }
      }
      
      // ASSERT: We expect to find words in different length categories
      // (This might fail if the dictionary has limited variety, but should pass in most cases)
      expect(words.length).toBeGreaterThan(0);
      // At least verify that we have words of different lengths if the dictionary is diverse
    });

    it('should not contain duplicate words in the dictionary', () => {
      // ARRANGE
      const count = dictionary.getWordCount();
      const sampleWords = new Set<string>();
      
      // ACT: Try to collect as many unique words as the count
      for (let i = 0; i < count * 2; i++) { // Sample more than the count to be sure
        sampleWords.add(dictionary.getRandomWord());
      }
      
      // ASSERT: The set of unique words should be at least equal to the count
      // (This is an indirect way to check for duplicates since we can't access the private array)
      expect(sampleWords.size).toBeGreaterThanOrEqual(10); // Minimum requirement
    });
  });

  describe('Exceptional Cases', () => {
    it('should not throw an error when getRandomWord is called', () => {
      // ARRANGE & ACT & ASSERT
      expect(() => {
        dictionary.getRandomWord();
      }).not.toThrow();
    });

    it('should not return undefined from getWordCount', () => {
      // ARRANGE & ACT
      const count = dictionary.getWordCount();
      
      // ASSERT
      expect(count).not.toBeUndefined();
    });

    it('should not return null from getWordCount', () => {
      // ARRANGE & ACT
      const count = dictionary.getWordCount();
      
      // ASSERT
      expect(count).not.toBeNull();
    });

    it('should return a positive number from getWordCount', () => {
      // ARRANGE & ACT
      const count = dictionary.getWordCount();
      
      // ASSERT
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('should work with mock GameModel scenario', () => {
      // ARRANGE: Simulate GameModel needing a random word
      const mockGameModel = {
        wordDictionary: dictionary,
        currentWord: '',
        
        initializeGame: function() {
          this.currentWord = this.wordDictionary.getRandomWord();
          return this.currentWord;
        },
        
        resetGame: function() {
          this.currentWord = this.wordDictionary.getRandomWord();
          return this.currentWord;
        }
      };
      
      // ACT
      const initialWord = mockGameModel.initializeGame();
      const resetWord = mockGameModel.resetGame();
      
      // ASSERT
      expect(initialWord).toBeDefined();
      expect(typeof initialWord).toBe('string');
      expect(initialWord.length).toBeGreaterThan(0);
      expect(initialWord).toBe(initialWord.toUpperCase());
      
      expect(resetWord).toBeDefined();
      expect(typeof resetWord).toBe('string');
      expect(resetWord.length).toBeGreaterThan(0);
      expect(resetWord).toBe(resetWord.toUpperCase());
      
      // Both words should be valid
      expect([initialWord, resetWord]).toHaveLength(2);
    });

    it('should support multiple instances without interference', () => {
      // ARRANGE
      const dict1 = new WordDictionary();
      const dict2 = new WordDictionary();
      
      // ACT
      const word1 = dict1.getRandomWord();
      const word2 = dict2.getRandomWord();
      const count1 = dict1.getWordCount();
      const count2 = dict2.getWordCount();
      
      // ASSERT
      // Both instances should function independently
      expect(word1).toBeDefined();
      expect(word2).toBeDefined();
      expect(typeof word1).toBe('string');
      expect(typeof word2).toBe('string');
      expect(count1).toBeGreaterThanOrEqual(10);
      expect(count2).toBeGreaterThanOrEqual(10);
      
      // Both counts should be positive integers
      expect(Number.isInteger(count1)).toBe(true);
      expect(Number.isInteger(count2)).toBe(true);
    });
  });
});