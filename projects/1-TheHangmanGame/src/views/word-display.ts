/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/src/views/word-display.ts
 * @desc Manages the visual display of the word being guessed and updates letter boxes.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Manages the visual display of the word being guessed in the Hangman game.
 * Creates and updates letter boxes showing the current progress.
 *
 * @category View
 */
export class WordDisplay {
  /** Container element for the word display */
  private container: HTMLElement;

  /** Array of letter box elements */
  private letterBoxes: HTMLElement[];

  /** CSS class applied to each letter box */
  private readonly LETTER_BOX_CLASS = 'letter-box';

  /**
   * Creates a new WordDisplay instance.
   * @param containerId - The ID of the container HTML element
   * @throws {Error} If the container element is not found
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
    // Clear previous content
    this.container.innerHTML = '';
    this.letterBoxes = [];
    // Batch DOM inserts to minimize reflows
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < wordLength; i++) {
      const box = this.createLetterBox();
      fragment.appendChild(box);
      this.letterBoxes.push(box);
    }
    this.container.appendChild(fragment);
  }

  /**
   * Updates a specific letter box with a revealed letter.
   * @param index - The position of the letter (0-based)
   * @param letter - The letter to display
   * @throws {Error} If the index is out of bounds
   */
  public updateBox(index: number, letter: string): void {
    if (index < 0 || index >= this.letterBoxes.length) {
      throw new Error(`Index ${index} is out of bounds`);
    }
    this.letterBoxes[index].textContent = letter.toUpperCase();
  }

  /**
   * Resets the display by clearing all letter boxes.
   */
  public reset(): void {
    this.container.innerHTML = '';
    this.letterBoxes = [];
  }

  /**
   * Creates a single letter box element.
   * @returns The created letter box element
   * @private
   */
  private createLetterBox(): HTMLElement {
    const box = document.createElement('div');
    box.classList.add(this.LETTER_BOX_CLASS);
    return box;
  }
}