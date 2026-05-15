# Respuesta

```markdown
Here's the complete implementation for `src/views/message-display.ts`, following all your specifications and best practices:

```typescript
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
```

---

## Design Decisions and Justifications

### 1. **Error Handling in Constructor**
- **Decision:** Throw an error if the container element is not found.
- **Justification:** This is a critical failure that should be caught early, as the component cannot function without its container.

### 2. **Message Clearing**
- **Decision:** Clear the container before showing any new message.
- **Justification:** Ensures a clean state and prevents message overlap or confusion.

### 3. **Uppercase Conversion**
- **Decision:** Convert the word to uppercase in victory/defeat messages.
- **Justification:** Ensures consistency with the game's uppercase requirement for all words.

### 4. **Restart Button Management**
- **Decision:** Created the restart button in the constructor and reused it.
- **Justification:** More efficient than creating a new button each time, and ensures consistent styling.

### 5. **Defensive Checks**
- **Decision:** Added defensive checks in `showRestartButton()` and `hideRestartButton()`.
- **Justification:** Prevents errors if methods are called multiple times or out of order.

### 6. **Simple DOM Structure**
- **Decision:** Used basic DOM elements (div, button) with appropriate classes.
- **Justification:** Keeps the code simple, maintainable, and easy to style with CSS.

---

## Possible Future Improvements

### 1. **Customizable Messages**
- **Improvement:** Allow customization of victory/defeat message formats.
- **Benefit:** Makes the component more flexible for different game themes or languages.

### 2. **Animation Support**
- **Improvement:** Add animations for message transitions (e.g., fade-in/out).
- **Benefit:** Enhances user experience with visual feedback.

### 3. **Accessibility Enhancements**
- **Improvement:** Add ARIA attributes for better screen reader support.
- **Benefit:** Makes the game more accessible to visually impaired players.

### 4. **Localization Support**
- **Improvement:** Support localized messages for different languages.
- **Benefit:** Makes the game more inclusive for non-English speakers.

### 5. **Message History**
- **Improvement:** Keep a history of messages for replay or debugging.
- **Benefit:** Useful for development and could enable features like game replays.

---

## Testing Considerations

Here's how you could test this component with Jest:

```typescript
describe('MessageDisplay', () => {
  let container: HTMLElement;
  let messageDisplay: MessageDisplay;

  beforeEach(() => {
    // Set up a fresh DOM before each test
    document.body.innerHTML = '<div id="message-container"></div>';
    container = document.getElementById('message-container')!;
    messageDisplay = new MessageDisplay('message-container');
  });

  test('constructor throws error if container not found', () => {
    document.body.innerHTML = '';
    expect(() => new MessageDisplay('nonexistent')).toThrow();
  });

  test('constructor succeeds with valid container', () => {
    expect(messageDisplay).toBeInstanceOf(MessageDisplay);
  });

  test('showVictory displays correct message', () => {
    messageDisplay.showVictory('elephant');
    expect(container.textContent).toContain('You Won! The word was: ELEPHANT');
    expect(container.querySelector('.victory-message')).toBeTruthy();
  });

  test('showDefeat displays correct message', () => {
    messageDisplay.showDefeat('giraffe');
    expect(container.textContent).toContain('You Lost. The word was: GIRAFFE');
    expect(container.querySelector('.defeat-message')).toBeTruthy();
  });

  test('showAttempts displays correct format', () => {
    messageDisplay.showAttempts(3, 6);
    expect(container.textContent).toBe('Attempts: 3/6');
    expect(container.querySelector('.attempt-counter')).toBeTruthy();
  });

  test('clear removes all content', () => {
    messageDisplay.showVictory('test');
    messageDisplay.clear();
    expect(container.innerHTML).toBe('');
  });

  test('showRestartButton adds button to DOM', () => {
    messageDisplay.showRestartButton();
    expect(container.querySelector('.restart-button')).toBeTruthy();
    expect(container.querySelector('button')?.textContent).toBe('Restart Game');
  });

  test('hideRestartButton removes button from DOM', () => {
    messageDisplay.showRestartButton();
    messageDisplay.hideRestartButton();
    expect(container.querySelector('.restart-button')).toBeFalsy();
  });

  test('attachRestartHandler calls handler when clicked', () => {
    const mockHandler = jest.fn();
    messageDisplay.attachRestartHandler(mockHandler);
    messageDisplay.showRestartButton();

    const button = container.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(mockHandler).toHaveBeenCalled();
  });

  test('showRestartButton is idempotent', () => {
    messageDisplay.showRestartButton();
    messageDisplay.showRestartButton();
    expect(container.querySelectorAll('.restart-button').length).toBe(1);
  });

  test('hideRestartButton is safe when button not in DOM', () => {
    expect(() => messageDisplay.hideRestartButton()).not.toThrow();
  });
});
```

---

## Integration Points

This class is used by:
- **`GameView`**: Coordinates the `MessageDisplay` and calls its methods to update the UI based on game state changes.

The implementation is:
- **Simple**: Focuses only on message display and restart button management
- **Robust**: Includes proper error handling and defensive checks
- **Efficient**: Uses direct DOM manipulation and maintains element references
- **Testable**: Designed with clear inputs and outputs for easy testing
- **Accessible**: Uses semantic HTML and proper button elements
- **Maintainable**: Well-documented and follows clean code principles

The component is ready for integration with the rest of the application and meets all the specified requirements. It provides clear feedback to the player about game status and offers the ability to restart the game.
```