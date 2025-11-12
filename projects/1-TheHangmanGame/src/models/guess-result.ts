/**
 * Enumeration representing the result of a letter guess attempt.
 * @enum {string}
 * @category Model
 */
export enum GuessResult {
  /** The guessed letter is correct and present in the secret word */
  CORRECT = 'CORRECT',
  
  /** The guessed letter is incorrect and not present in the secret word */
  INCORRECT = 'INCORRECT',
  
  /** The letter has already been guessed previously */
  ALREADY_GUESSED = 'ALREADY_GUESSED',
}