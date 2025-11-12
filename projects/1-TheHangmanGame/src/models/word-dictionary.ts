/**
 * Manages the dictionary of animal names for the Hangman game.
 * Provides functionality to retrieve random words from the collection.
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
   * @returns A randomly selected animal name
   */
  public getRandomWord(): string {
    // TODO: Implementation
    return '';
  }

  /**
   * Returns the total number of words in the dictionary.
   * @returns The count of available words
   */
  public getWordCount(): number {
    // TODO: Implementation
    return 0;
  }

  /**
   * Initializes the internal collection with animal names.
   * @private
   */
  private initializeAnimalWords(): void {
    // TODO: Implementation
  }
}