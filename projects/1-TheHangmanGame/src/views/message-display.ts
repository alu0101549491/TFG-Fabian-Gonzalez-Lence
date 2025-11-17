/**
 * Manages the display of game messages and the restart button.
 * Shows victory/defeat messages, attempt counter, and restart button.
 *
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
   * @throws {Error} If the container element is not found
   */
  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with id "${containerId}" not found`);
    }
    this.container = element;

    // Create restart button
    this.restartButton = document.createElement('button');
    this.restartButton.type = 'button';
    this.restartButton.classList.add('restart-button');
    this.restartButton.textContent = 'Restart Game';
  }

  /**
   * Displays a victory message with the revealed word.
   * @param word - The secret word that was guessed
   */
  public showVictory(word: string): void {
    this.clear();
    const message = document.createElement('div');
    message.classList.add('victory-message');
    message.textContent = `You Won! The word was: ${word.toUpperCase()}`;
    this.container.appendChild(message);
  }

  /**
   * Displays a defeat message with the secret word.
   * @param word - The secret word that was not guessed
   */
  public showDefeat(word: string): void {
    this.clear();
    const message = document.createElement('div');
    message.classList.add('defeat-message');
    message.textContent = `You Lost. The word was: ${word.toUpperCase()}`;
    this.container.appendChild(message);
  }

  /**
   * Displays the current attempt counter.
   * @param current - Current number of failed attempts
   * @param max - Maximum allowed failed attempts
   */
  public showAttempts(current: number, max: number): void {
    this.clear();
    const message = document.createElement('div');
    message.classList.add('attempt-counter');
    message.textContent = `Attempts: ${current}/${max}`;
    this.container.appendChild(message);
  }

  /**
   * Clears all messages from the display.
   */
  public clear(): void {
    this.container.innerHTML = '';
  }

  /**
   * Attaches a click handler to the restart button.
   * @param handler - The function to call when restart is clicked
   */
  public attachRestartHandler(handler: () => void): void {
    this.restartButton.addEventListener('click', handler);
  }

  /**
   * Makes the restart button visible.
   */
  public showRestartButton(): void {
    // Remove if already present (defensive)
    if (this.restartButton.parentNode === this.container) {
      return;
    }
    this.container.appendChild(this.restartButton);
  }

  /**
   * Hides the restart button.
   */
  public hideRestartButton(): void {
    if (this.restartButton.parentNode === this.container) {
      this.container.removeChild(this.restartButton);
    }
  }
}
