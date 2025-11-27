/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @since 2025-11-25
 * @file Enumeration representing the result of a letter guess attempt in the Hangman game.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enumeration representing the result of a letter guess attempt in the Hangman game.
 * This enum is used to communicate the outcome of a player's letter guess between
 * the Model and Controller layers.
 *
 * @category Model
 */
export enum GuessResult {
  /**
   * The guessed letter is correct and present in the secret word.
   * All occurrences of this letter will be revealed in the word display.
   *
   * @example
   * // If the word is "ELEPHANT" and the player guesses "E"
   * return GuessResult.CORRECT;
   */
  CORRECT = 'CORRECT',

  /**
   * The guessed letter is incorrect and not present in the secret word.
   * This will increment the failed attempts counter and progress the hangman drawing.
   *
   * @example
   * // If the word is "ELEPHANT" and the player guesses "Z"
   * return GuessResult.INCORRECT;
   */
  INCORRECT = 'INCORRECT',

  /**
   * The letter has already been guessed previously (whether correct or incorrect).
   * No state change occurs, but feedback is provided to the user.
   *
   * @example
   * // If "E" was already guessed and the player clicks "E" again
   * return GuessResult.ALREADY_GUESSED;
   */
  ALREADY_GUESSED = 'ALREADY_GUESSED',
}
