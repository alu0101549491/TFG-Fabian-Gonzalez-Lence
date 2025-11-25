/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/src/models/word-dictionary.ts
 * @desc Manages the dictionary of animal names for the Hangman game.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Manages the dictionary of animal names for the Hangman game.
 * Provides functionality to retrieve random words from the collection.
 * All words are stored in UPPERCASE for consistency.
 *
 * @category Model
 */
export class WordDictionary {
  /** Collection of animal names available for the game */
  private words: string[];

  /**
   * Creates a new WordDictionary instance and initializes the animal words.
   */
  constructor() {
    this.words = [];
    this.initializeAnimalWords();
  }

  /**
   * Retrieves a random word from the dictionary.
   * @returns A randomly selected animal name in UPPERCASE
   * @throws {Error} If the dictionary is empty (should never occur if constructor works correctly)
   */
  public getRandomWord(): string {
    if (this.words.length === 0) {
      throw new Error('Word dictionary is empty');
    }
    // Generate a random index between 0 and words.length - 1
    const randomIndex = Math.floor(Math.random() * this.words.length);
    return this.words[randomIndex];
  }

  /**
   * Returns the total number of words in the dictionary.
   * @returns The count of available words
   */
  public getWordCount(): number {
    return this.words.length;
  }

  /**
   * Initializes the internal collection with animal names.
   * @private
   */
  private initializeAnimalWords(): void {
    this.words = [
      'CAT', 'DOG', 'FOX', 'BEAR', 'LION',
      'ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'PENGUIN', 'TIGER',
      'RHINOCEROS', 'CROCODILE', 'CHIMPANZEE', 'ALLIGATOR', 'BUTTERFLY',
      'DEER', 'SEAL', 'FROG', 'DUCK', 'CHEETAH',
      'GORILLA', 'LEOPARD', 'RACCOON', 'KANGAROO', 'HIPPOPOTAMUS'
    ];
  }
}
