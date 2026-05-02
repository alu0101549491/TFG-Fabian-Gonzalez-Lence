Now I'm going to send you the general code base structure and a couple of prompts to fill each code file to accomplish having the application fully functional:

## 3. MAIN CLASS SKELETONS
### src/models/guess-result.ts
```typescript
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
```
### src/models/word-dictionary.ts
```typescript
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
```
### src/models/game-model.ts
```typescript
import {GuessResult} from './guess-result';
import {WordDictionary} from './word-dictionary';
/**
 * Core game logic for the Hangman game.
 * Manages game state, processes guesses, and determines victory/defeat conditions.
 * @category Model
 */
export class GameModel {
  /** The secret word to be guessed */
  private secretWord: string;
  
  /** Set of letters that have been guessed */
  private guessedLetters: Set<string>;
  
  /** Number of incorrect guess attempts made */
  private failedAttempts: number;
  
  /** Maximum number of allowed failed attempts */
  private readonly maxAttempts: number;
  
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
    this.maxAttempts = 6;
  }
  /**
   * Initializes a new game with a random word.
   */
  public initializeGame(): void {
    // TODO: Implementation
  }
  /**
   * Processes a letter guess and updates game state.
   * @param letter - The letter being guessed
   * @returns The result of the guess attempt
   */
  public guessLetter(letter: string): GuessResult {
    // TODO: Implementation
    return GuessResult.INCORRECT;
  }
  /**
   * Checks if a specific letter has already been guessed.
   * @param letter - The letter to check
   * @returns True if the letter has been guessed, false otherwise
   */
  public isLetterGuessed(letter: string): boolean {
    // TODO: Implementation
    return false;
  }
  /**
   * Generates the current state of the word with revealed letters.
   * @returns Array where each element is either the letter (if guessed) or empty string
   */
  public getRevealedWord(): string[] {
    // TODO: Implementation
    return [];
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
    // TODO: Implementation
    return false;
  }
  /**
   * Checks if the player has won the game.
   * @returns True if all letters have been correctly guessed
   */
  public isVictory(): boolean {
    // TODO: Implementation
    return false;
  }
  /**
   * Checks if the player has lost the game.
   * @returns True if maximum failed attempts reached
   */
  public isDefeat(): boolean {
    // TODO: Implementation
    return false;
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
    // TODO: Implementation
  }
  /**
   * Checks if the player has successfully guessed all letters.
   * @returns True if victory condition is met
   * @private
   */
  private checkVictoryCondition(): boolean {
    // TODO: Implementation
    return false;
  }
}
```
### src/views/word-display.ts
```typescript
/**
 * Manages the visual display of the word being guessed.
 * Creates and updates letter boxes showing the current progress.
 * @category View
 */
export class WordDisplay {
  /** Container element for the word display */
  private container: HTMLElement;
  
  /** Array of letter box elements */
  private letterBoxes: HTMLElement[];
  /**
   * Creates a new WordDisplay instance.
   * @param containerId - The ID of the container HTML element
   */
  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with id "${containerId}" not found`);
    }
    this.container = element;
    this.letterBoxes = [];
  }
  /**
   * Renders the initial word display with empty boxes.
   * @param wordLength - The number of letters in the word
   */
  public render(wordLength: number): void {
    // TODO: Implementation
  }
  /**
   * Updates a specific letter box with a revealed letter.
   * @param index - The position of the letter (0-based)
   * @param letter - The letter to display
   */
  public updateBox(index: number, letter: string): void {
    // TODO: Implementation
  }
  /**
   * Resets the display by clearing all letter boxes.
   */
  public reset(): void {
    // TODO: Implementation
  }
  /**
   * Creates a single letter box element.
   * @returns The created letter box element
   * @private
   */
  private createLetterBox(): HTMLElement {
    // TODO: Implementation
    return document.createElement('div');
  }
}
```
### src/views/alphabet-display.ts
```typescript
/**
 * Manages the visual display of the alphabet buttons.
 * Handles button creation, state management, and click events.
 * @category View
 */
export class AlphabetDisplay {
  /** Container element for the alphabet buttons */
  private container: HTMLElement;
  
  /** Map of letters to their corresponding button elements */
  private letterButtons: Map<string, HTMLButtonElement>;
  /**
   * Creates a new AlphabetDisplay instance.
   * @param containerId - The ID of the container HTML element
   */
  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with id "${containerId}" not found`);
    }
    this.container = element;
    this.letterButtons = new Map();
  }
  /**
   * Renders the complete alphabet of clickable buttons.
   */
  public render(): void {
    // TODO: Implementation
  }
  /**
   * Disables a specific letter button after it has been guessed.
   * @param letter - The letter to disable
   */
  public disableLetter(letter: string): void {
    // TODO: Implementation
  }
  /**
   * Enables all letter buttons (used when resetting the game).
   */
  public enableAllLetters(): void {
    // TODO: Implementation
  }
  /**
   * Attaches a click handler to all letter buttons.
   * @param handler - The function to call when a letter is clicked
   */
  public attachClickHandler(handler: (letter: string) => void): void {
    // TODO: Implementation
  }
  /**
   * Creates a button element for a specific letter.
   * @param letter - The letter for the button
   * @returns The created button element
   * @private
   */
  private createLetterButton(letter: string): HTMLButtonElement {
    // TODO: Implementation
    return document.createElement('button');
  }
}
```
### src/views/hangman-renderer.ts
```typescript
/**
 * Renders the hangman drawing on a canvas element.
 * Progressively draws body parts based on failed attempt count.
 * @category View
 */
export class HangmanRenderer {
  /** Canvas element for drawing */
  private canvas: HTMLCanvasElement;
  
  /** 2D rendering context */
  private context: CanvasRenderingContext2D;
  /**
   * Creates a new HangmanRenderer instance.
   * @param canvasId - The ID of the canvas HTML element
   */
  constructor(canvasId: string) {
    const element = document.getElementById(canvasId);
    if (!element || !(element instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    this.canvas = element;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.context = ctx;
  }
  /**
   * Renders the hangman drawing based on number of failed attempts.
   * @param attempts - The number of failed attempts (0-6)
   */
  public render(attempts: number): void {
    // TODO: Implementation
  }
  /**
   * Clears the entire canvas.
   */
  public clear(): void {
    // TODO: Implementation
  }
  /**
   * Draws the gallows structure.
   * @private
   */
  private drawGallows(): void {
    // TODO: Implementation
  }
  /**
   * Draws the head (1st failed attempt).
   * @private
   */
  private drawHead(): void {
    // TODO: Implementation
  }
  /**
   * Draws the body (2nd failed attempt).
   * @private
   */
  private drawBody(): void {
    // TODO: Implementation
  }
  /**
   * Draws the left arm (3rd failed attempt).
   * @private
   */
  private drawLeftArm(): void {
    // TODO: Implementation
  }
  /**
   * Draws the right arm (4th failed attempt).
   * @private
   */
  private drawRightArm(): void {
    // TODO: Implementation
  }
  /**
   * Draws the left leg (5th failed attempt).
   * @private
   */
  private drawLeftLeg(): void {
    // TODO: Implementation
  }
  /**
   * Draws the right leg (6th failed attempt).
   * @private
   */
  private drawRightLeg(): void {
    // TODO: Implementation
  }
}
```
### src/views/message-display.ts
```typescript
/**
 * Manages the display of game messages and the restart button.
 * Shows victory/defeat messages and attempt counter.
 * @category View
 */
export class MessageDisplay {
  /** Container element for messages */
  private container: HTMLElement;
  
  /** Restart button element */
  private restartButton: HTMLButtonElement;
  /**
   * Creates a new MessageDisplay instance.
   * @param containerId - The ID of the container HTML element
   */
  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with id "${containerId}" not found`);
    }
    this.container = element;
    this.restartButton = document.createElement('button');
  }
  /**
   * Displays a victory message with the revealed word.
   * @param word - The secret word that was guessed
   */
  public showVictory(word: string): void {
    // TODO: Implementation
  }
  /**
   * Displays a defeat message with the secret word.
   * @param word - The secret word that was not guessed
   */
  public showDefeat(word: string): void {
    // TODO: Implementation
  }
  /**
   * Displays the current attempt counter.
   * @param current - Current number of failed attempts
   * @param max - Maximum allowed failed attempts
   */
  public showAttempts(current: number, max: number): void {
    // TODO: Implementation
  }
  /**
   * Clears all messages from the display.
   */
  public clear(): void {
    // TODO: Implementation
  }
  /**
   * Attaches a click handler to the restart button.
   * @param handler - The function to call when restart is clicked
   */
  public attachRestartHandler(handler: () => void): void {
    // TODO: Implementation
  }
  /**
   * Makes the restart button visible.
   */
  public showRestartButton(): void {
    // TODO: Implementation
  }
  /**
   * Hides the restart button.
   */
  public hideRestartButton(): void {
    // TODO: Implementation
  }
}
```
### src/views/game-view.ts
```typescript
import {WordDisplay} from './word-display';
import {AlphabetDisplay} from './alphabet-display';
import {HangmanRenderer} from './hangman-renderer';
import {MessageDisplay} from './message-display';
/**
 * Main view coordinator that composes all display components.
 * Implements the Composite pattern to manage multiple view elements.
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
  /**
   * Creates a new GameView instance and initializes all display components.
   */
  constructor() {
    this.wordDisplay = new WordDisplay('word-container');
    this.alphabetDisplay = new AlphabetDisplay('alphabet-container');
    this.hangmanRenderer = new HangmanRenderer('hangman-canvas');
    this.messageDisplay = new MessageDisplay('message-container');
  }
  /**
   * Initializes all view components.
   */
  public initialize(): void {
    // TODO: Implementation
  }
  /**
   * Updates the word display with current letter states.
   * @param letters - Array of letters to display (empty string for unrevealed)
   */
  public updateWordBoxes(letters: string[]): void {
    // TODO: Implementation
  }
  /**
   * Disables a letter button in the alphabet display.
   * @param letter - The letter to disable
   */
  public disableLetter(letter: string): void {
    // TODO: Implementation
  }
  /**
   * Updates the attempt counter display.
   * @param current - Current number of failed attempts
   * @param max - Maximum allowed failed attempts
   */
  public updateAttemptCounter(current: number, max: number): void {
    // TODO: Implementation
  }
  /**
   * Renders the hangman drawing for the given attempt count.
   * @param attempts - Number of failed attempts
   */
  public renderHangman(attempts: number): void {
    // TODO: Implementation
  }
  /**
   * Displays a victory message with the secret word.
   * @param word - The word that was guessed
   */
  public showVictoryMessage(word: string): void {
    // TODO: Implementation
  }
  /**
   * Displays a defeat message with the secret word.
   * @param word - The word that was not guessed
   */
  public showDefeatMessage(word: string): void {
    // TODO: Implementation
  }
  /**
   * Shows the restart button.
   */
  public showRestartButton(): void {
    // TODO: Implementation
  }
  /**
   * Hides the restart button.
   */
  public hideRestartButton(): void {
    // TODO: Implementation
  }
  /**
   * Resets all view components to initial state.
   */
  public reset(): void {
    // TODO: Implementation
  }
}
```
### src/controllers/game-controller.ts
```typescript
import {GameModel} from '@models/game-model';
import {GameView} from '@views/game-view';
import {GuessResult} from '@models/guess-result';
/**
 * Main controller coordinating the game logic (Model) and user interface (View).
 * Implements the Observer pattern to handle user interactions.
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
    // TODO: Implementation
  }
  /**
   * Handles a letter click event from the alphabet display.
   * @param letter - The letter that was clicked
   */
  public handleLetterClick(letter: string): void {
    // TODO: Implementation
  }
  /**
   * Handles the restart button click event.
   */
  public handleRestartClick(): void {
    // TODO: Implementation
  }
  /**
   * Updates the view based on the result of a guess.
   * @param result - The result of the guess attempt
   * @param letter - The letter that was guessed
   * @private
   */
  private updateViewAfterGuess(result: GuessResult, letter: string): void {
    // TODO: Implementation
  }
  /**
   * Checks if the game has ended and handles the appropriate end state.
   * @private
   */
  private checkAndHandleGameEnd(): void {
    // TODO: Implementation
  }
  /**
   * Synchronizes the view with the current model state.
   * @private
   */
  private syncViewWithModel(): void {
    // TODO: Implementation
  }
}
```
### src/main.ts
```typescript
import {GameModel} from '@models/game-model';
import {GameView} from '@views/game-view';
import {GameController} from '@controllers/game-controller';
import {WordDictionary} from '@models/word-dictionary';
import './styles/main.css';
import 'bulma/css/bulma.min.css';
/**
 * Application entry point.
 * Initializes the MVC components and starts the game.
 */
function main(): void {
  // Initialize Model
  const dictionary = new WordDictionary();
  const gameModel = new GameModel(dictionary);
  // Initialize View
  const gameView = new GameView();
  // Initialize Controller
  const gameController = new GameController(gameModel, gameView);
  gameController.initialize();
}
// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
```

Wait for me to send you for each module/class a "specification requirement" for all of the methods and functions you'll need to code.