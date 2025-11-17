import {GameModel} from '@models/game-model';
import {GameView} from '@views/game-view';
import {GuessResult} from '@models/guess-result';

/**
 * Main controller coordinating the game logic (Model) and user interface (View).
 * Implements the Observer pattern to handle user interactions and the MVC pattern
 * to maintain separation between business logic and presentation.
 *
 * @category Controller
 */
export class GameController {
  /** Game logic model */
  private model: GameModel;

  /** Game user interface */
  private view: GameView;

  /**
   * Creates a new GameController instance.
   * @param model - The game model containing business logic
   * @param view - The game view managing UI components
   */
  constructor(model: GameModel, view: GameView) {
    this.model = model;
    this.view = view;
  }

  /**
   * Initializes the game by setting up the model, view, and event handlers.
   */
  public initialize(): void {
    // Initialize model with random word
    this.model.initializeGame();

    // Initialize view components
    this.view.initialize();

    // Attach event handlers
    this.view.alphabetDisplay.attachClickHandler((letter) => this.handleLetterClick(letter));
    this.view.messageDisplay.attachRestartHandler(() => this.handleRestartClick());

    // Sync view with initial model state
    this.syncViewWithModel();
  }

  /**
   * Handles a letter click event from the alphabet display.
   * @param letter - The letter that was clicked
   */
  public handleLetterClick(letter: string): void {
    // Process the guess through the model
    const result = this.model.guessLetter(letter);

    // Update view based on guess result
    this.updateViewAfterGuess(result, letter);

    // Check if game has ended
    this.checkAndHandleGameEnd();
  }

  /**
   * Handles the restart button click event.
   */
  public handleRestartClick(): void {
    // Reset model state
    this.model.resetGame();

    // Reset view components
    this.view.reset();

    // Sync view with new model state
    this.syncViewWithModel();
  }

  /**
   * Updates the view based on the result of a guess.
   * @param result - The result of the guess attempt
   * @param letter - The letter that was guessed
   * @private
   */
  private updateViewAfterGuess(result: GuessResult, letter: string): void {
    // Disable the guessed letter in the alphabet display
    this.view.disableLetter(letter);

    // Update view based on guess result
    switch (result) {
      case GuessResult.CORRECT:
      case GuessResult.INCORRECT:
        // Sync view with updated model state
        this.syncViewWithModel();
        break;
      case GuessResult.ALREADY_GUESSED:
        // No action needed - letter already disabled
        break;
    }
  }

  /**
   * Checks if the game has ended and handles the appropriate end state.
   * @private
   */
  private checkAndHandleGameEnd(): void {
    if (this.model.isVictory()) {
      // Show victory message and restart button
      this.view.showVictoryMessage(this.model.getSecretWord());
      this.view.showRestartButton();
    } else if (this.model.isDefeat()) {
      // Show defeat message and restart button
      this.view.showDefeatMessage(this.model.getSecretWord());
      this.view.showRestartButton();
    }
    // If neither, game continues - no action needed
  }

  /**
   * Synchronizes the view with the current model state.
   * @private
   */
  private syncViewWithModel(): void {
    // Update word boxes with revealed letters
    const revealedWord = this.model.getRevealedWord();
    this.view.updateWordBoxes(revealedWord);

    // Update attempt counter
    const currentAttempts = this.model.getFailedAttempts();
    const maxAttempts = this.model.getMaxAttempts();
    this.view.updateAttemptCounter(currentAttempts, maxAttempts);

    // Update hangman drawing
    this.view.renderHangman(currentAttempts);
  }
}
