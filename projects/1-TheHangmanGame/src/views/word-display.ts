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