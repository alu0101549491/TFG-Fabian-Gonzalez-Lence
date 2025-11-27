/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since 2025-11-25
 * @file TFG-Fabian-Gonzalez-Lence/projects/1-TheHangmanGame/src/views/alphabet-display.ts
 * @desc Manages the visual display of the alphabet buttons (A-Z) and their interactions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/1-TheHangmanGame}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Manages the visual display of the alphabet buttons in the Hangman game.
 * Creates interactive buttons for each letter A-Z, handles their state (enabled/disabled),
 * and attaches click event handlers for user interaction.
 *
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
   * @throws {Error} If the container element is not found
   */
  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with id "${containerId}" not found`);
    }
    this.container = element;
    this.letterButtons = new Map<string, HTMLButtonElement>();
  }

  /**
   * Renders the complete alphabet of clickable buttons (A-Z).
   */
  public render(): void {
    // Clear previous content
    this.container.innerHTML = '';
    this.letterButtons.clear();

    // Define the alphabet
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Create a button for each letter
    for (const letter of alphabet) {
      const button = this.createLetterButton(letter);
      this.container.appendChild(button);
      this.letterButtons.set(letter, button);
    }
  }

  /**
   * Disables a specific letter button after it has been guessed.
   * @param letter - The letter to disable (case-insensitive)
   */
  public disableLetter(letter: string): void {
    const normalizedLetter = letter.toUpperCase();
    const button = this.letterButtons.get(normalizedLetter);
    if (button) {
      button.disabled = true;
    }
  }

  /**
   * Enables all letter buttons (used when resetting the game).
   */
  public enableAllLetters(): void {
    this.letterButtons.forEach(button => {
      button.disabled = false;
    });
  }

  /**
   * Attaches a click handler to all letter buttons.
   * @param handler - The function to call when a letter is clicked,
   *  receives the clicked letter as parameter
   */
  public attachClickHandler(handler: (letter: string) => void): void {
    this.letterButtons.forEach((button, letter) => {
      button.addEventListener('click', () => handler(letter));
    });
  }

  /**
   * Creates a single letter button element.
   * @param letter - The letter for this button
   * @returns A button element configured for the letter
   * @private
   */
  private createLetterButton(letter: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('letter-button');
    button.textContent = letter;
    button.setAttribute('aria-label', `Letter ${letter}`);
    return button;
  }
}