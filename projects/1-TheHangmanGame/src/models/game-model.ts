/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/src/models/game-model.ts
 * @desc Core game logic for the Hangman game; manages state and processes guesses.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

import {GuessResult} from './guess-result';
import {WordDictionary} from './word-dictionary';

/**
 * Core game logic for the Hangman game.
 * Manages game state, processes guesses, and determines victory/defeat conditions.
 *
 * @category Model
 */
export class GameModel {
  /** The secret word to be guessed */
  private secretWord: string;

  /** Set of letters that have been guessed */
  private readonly guessedLetters: Set<string>;

  /** Number of incorrect guess attempts made */
  private failedAttempts: number;

  /** Maximum number of allowed failed attempts */
  private readonly maxAttempts: number = 6;

  /** Dictionary providing random words */
  private wordDictionary: WordDictionary;

  /**
   * Creates a new GameModel instance.
   * @param wordDictionary - The dictionary to use for selecting secret words
   */
  constructor(wordDictionary: WordDictionary) {
    this.wordDictionary = wordDictionary;
    this.secretWord = '';
    this.guessedLetters = new Set();
    this.failedAttempts = 0;
  }

  /**
   * Initializes a new game with a random word.
   */
  public initializeGame(): void {
    this.secretWord = this.wordDictionary.getRandomWord();
    this.guessedLetters.clear();
    this.failedAttempts = 0;
  }

/**
   * Processes a letter guess and updates game state.
   * @param letter - The letter being guessed
   * @returns The result of the guess attempt
   */
  public guessLetter(letter: string): GuessResult {
    // Validate input: single alphabetic character
    if (!letter || typeof letter !== 'string' || !/^[a-zA-Z]$/.test(letter)) {
      throw new Error('Invalid letter. Must be a single alphabetic character.');
    }

    // Normalize to uppercase
    letter = letter.toUpperCase();

    // Ensure game initialized
    if (!this.secretWord) {
      throw new Error('Game not initialized. Call initializeGame() first.');
    }

    // Prevent processing when game already ended
    if (this.isGameOver()) {
      throw new Error('Game is over. Call resetGame() to start a new game.');
    }

    // Check if letter has already been guessed
    if (this.isLetterGuessed(letter)) {
      return GuessResult.ALREADY_GUESSED;
    }

    // Add letter to guessed set
    this.guessedLetters.add(letter);

    // Check if letter exists in secret word
    if (this.secretWord.includes(letter)) {
      return GuessResult.CORRECT;
    } else {
      this.failedAttempts++;
      return GuessResult.INCORRECT;
    }
  }

  /**
   * Checks if a specific letter has already been guessed.
   * @param letter - The letter to check
   * @returns True if the letter has been guessed, false otherwise
   */
  public isLetterGuessed(letter: string): boolean {
    return this.guessedLetters.has(letter.toUpperCase());
  }

  /**
   * Generates the current state of the word with revealed letters.
   * @returns Array where each element is either the letter (if guessed) or empty string
   */
  public getRevealedWord(): string[] {
    const revealed: string[] = [];

    for (const char of this.secretWord) {
      if (this.guessedLetters.has(char)) {
        revealed.push(char);
      } else {
        revealed.push('');
      }
    }

    return revealed;
  }

  /**
   * Gets the current number of failed attempts.
   * @returns The number of incorrect guesses
   */
  public getFailedAttempts(): number {
    return this.failedAttempts;
  }

  /**
   * Gets the maximum allowed number of failed attempts.
   * @returns The maximum attempts allowed
   */
  public getMaxAttempts(): number {
    return this.maxAttempts;
  }

  /**
   * Checks if the game has ended (either victory or defeat).
   * @returns True if the game is over, false otherwise
   */
  public isGameOver(): boolean {
    return this.isVictory() || this.isDefeat();
  }

  /**
   * Checks if the player has won the game.
   * @returns True if all letters have been correctly guessed
   */
  public isVictory(): boolean {
    return this.checkVictoryCondition();
  }

  /**
   * Checks if the player has lost the game.
   * @returns True if maximum failed attempts reached
   */
  public isDefeat(): boolean {
    return this.failedAttempts >= this.maxAttempts;
  }

  /**
   * Reveals the secret word (used when game ends).
   * @returns The complete secret word
   */
  public getSecretWord(): string {
    return this.secretWord;
  }

  /**
   * Resets the game state for a new game.
   */
  public resetGame(): void {
    this.initializeGame();
  }

  /**
   * Checks if the player has successfully guessed all letters.
   * @returns True if victory condition is met
   * @private
   */
  private checkVictoryCondition(): boolean {
    // Check unique letters only
    const uniqueLetters = new Set(this.secretWord);
    for (const char of uniqueLetters) {
      if (!this.guessedLetters.has(char)) {
        return false;
      }
    }
    return true;
  }
}
