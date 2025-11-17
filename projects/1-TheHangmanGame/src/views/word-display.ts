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

    // Create letter boxes for each character in the word
    for (let i = 0; i < wordLength; i++) {
      const box = this.createLetterBox();
      this.container.appendChild(box);
      this.letterBoxes.push(box);
    }
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
    box.classList.add('letter-box');
    return box;
  }
}