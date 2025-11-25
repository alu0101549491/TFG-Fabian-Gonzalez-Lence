import {WordDisplay} from './word-display';
import {AlphabetDisplay} from './alphabet-display';
import {HangmanRenderer} from './hangman-renderer';
import {MessageDisplay} from './message-display';

/**
 * Main view coordinator that composes all display components.
 * Implements the Composite Pattern to manage multiple view elements,
 * providing a unified interface to the GameController.
 *
 * @category View
 */
export class GameView {
  /** Word display component */
  private wordDisplay: WordDisplay;

  /** Alphabet display component */
  private alphabetDisplay: AlphabetDisplay;

  /** Hangman renderer component */
  private hangmanRenderer: HangmanRenderer;

  /** Message display component */
  private messageDisplay: MessageDisplay;

  /** Flag to track if the word has been rendered */
  private wordRendered: boolean = false;

  /** Current length of the secret word */
  private currentWordLength: number = 0;

  /**
   * Creates a new GameView instance and initializes all display components.
   */
  constructor() {
    // Initialize all child components
    this.wordDisplay = new WordDisplay('word-container');
    this.alphabetDisplay = new AlphabetDisplay('alphabet-container');
    this.hangmanRenderer = new HangmanRenderer('hangman-canvas');
    this.messageDisplay = new MessageDisplay('message-container');
  }

  /**
   * Initializes all view components.
   */
  public initialize(): void {
    // Render alphabet buttons
    this.alphabetDisplay.render();

    // Show initial hangman state (gallows only)
    this.hangmanRenderer.render(0);

    // Show initial attempt counter
    this.messageDisplay.showAttempts(0, 6);

    // Hide restart button initially
    this.messageDisplay.hideRestartButton();

    // Reset word rendered state
    this.wordRendered = false;
    this.currentWordLength = 0;
  }

  /**
   * Updates the word display with current letter states.
   * @param letters - Array where each element is either the letter (if guessed) or empty string
   */
  public updateWordBoxes(letters: string[]): void {
    // Render word boxes only when needed (first call or when word length changes)
    if (!this.wordRendered || this.currentWordLength !== letters.length) {
      this.wordDisplay.render(letters.length);
      this.wordRendered = true;
      this.currentWordLength = letters.length;
    }

    // Update each box with its letter (if revealed)
    letters.forEach((letter, index) => {
      if (letter) {
        this.wordDisplay.updateBox(index, letter);
      }
    });
  }

  /**
   * Attach alphabet letter click handler via GameView (facade).
   * @param handler - receives clicked letter as uppercase string
   */
  public attachAlphabetClickHandler(handler: (letter: string) => void): void {
    this.alphabetDisplay.attachClickHandler(handler);
  }

  /**
   * Attach restart button handler via GameView (facade).
   * @param handler - function to call when restart clicked
   */
  public attachRestartHandler(handler: () => void): void {
    this.messageDisplay.attachRestartHandler(handler);
  }

  /**
   * Disables a letter button in the alphabet display.
   * @param letter - The letter to disable
   */
  public disableLetter(letter: string): void {
    this.alphabetDisplay.disableLetter(letter);
  }

  /**
   * Updates the attempt counter display.
   * @param current - Current number of failed attempts
   * @param max - Maximum allowed failed attempts
   */
  public updateAttemptCounter(current: number, max: number): void {
    this.messageDisplay.showAttempts(current, max);
  }

  /**
   * Renders the hangman drawing for the given attempt count.
   * @param attempts - Number of failed attempts
   */
  public renderHangman(attempts: number): void {
    this.hangmanRenderer.render(attempts);
  }

  /**
   * Displays a victory message with the secret word.
   * @param word - The word that was guessed
   */
  public showVictoryMessage(word: string): void {
    this.messageDisplay.showVictory(word);
  }

  /**
   * Displays a defeat message with the secret word.
   * @param word - The word that was not guessed
   */
  public showDefeatMessage(word: string): void {
    this.messageDisplay.showDefeat(word);
  }

  /**
   * Shows the restart button.
   */
  public showRestartButton(): void {
    this.messageDisplay.showRestartButton();
  }

  /**
   * Hides the restart button.
   */
  public hideRestartButton(): void {
    this.messageDisplay.hideRestartButton();
  }

  /**
   * Resets all view components to initial state.
   */
  public reset(): void {
    // Reset word display
    this.wordDisplay.reset();
    this.wordRendered = false;
    this.currentWordLength = 0;

    // Enable all alphabet letters
    this.alphabetDisplay.enableAllLetters();

    // Clear and render initial hangman
    this.hangmanRenderer.clear();
    this.hangmanRenderer.render(0);

    // Show initial attempt counter
    this.messageDisplay.showAttempts(0, 6);

    // Hide restart button
    this.messageDisplay.hideRestartButton();
  }
}
