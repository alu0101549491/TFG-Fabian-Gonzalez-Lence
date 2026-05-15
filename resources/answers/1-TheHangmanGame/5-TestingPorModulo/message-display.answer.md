# Respuesta

```markdown
// tests/views/message-display.test.ts
import {MessageDisplay} from '@views/message-display';

describe('MessageDisplay', () => {
  let container: HTMLElement;
  let messageDisplay: MessageDisplay;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="message-container"></div>';
    container = document.getElementById('message-container')!;
    
    // Create MessageDisplay instance
    messageDisplay = new MessageDisplay('message-container');
  });

  afterEach(() => {
    // Cleanup DOM
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with valid container ID', () => {
      // ARRANGE: DOM setup in beforeEach
      
      // ACT
      const display = new MessageDisplay('message-container');
      
      // ASSERT
      expect(display).toBeDefined();
      expect(display).toBeInstanceOf(MessageDisplay);
    });

    it('should throw error when container not found', () => {
      // ARRANGE: No container with ID 'invalid-id'
      
      // ACT & ASSERT
      expect(() => new MessageDisplay('invalid-id')).toThrow();
      expect(() => new MessageDisplay('invalid-id')).toThrow('not found');
    });

    it('should store reference to container element', () => {
      // ARRANGE & ACT
      const display = new MessageDisplay('message-container');
      
      // ASSERT
      // We can't directly access private container, but we can verify it's working
      // by showing a message and checking that it affects the correct container element
      display.showAttempts(3, 6);
      expect(container.textContent).toContain('3');
    });

    it('should create restart button during construction', () => {
      // ARRANGE & ACT: messageDisplay already created in beforeEach
      
      // ASSERT: Restart button should exist (though not in DOM yet)
      // Verify through behavior: showRestartButton should work
      expect(() => messageDisplay.showRestartButton()).not.toThrow();
      
      // Check that the button exists and has correct properties when shown
      messageDisplay.showRestartButton();
      const button = container.querySelector('.restart-button') as HTMLButtonElement;
      expect(button).toBeDefined();
      expect(button).toBeInstanceOf(HTMLButtonElement);
      expect(button.type).toBe('button');
      expect(button.textContent).toBe('Restart Game');
    });

    it('should create restart button with correct properties', () => {
      // ARRANGE & ACT: messageDisplay already created
      
      // ASSERT: Show button and verify properties
      messageDisplay.showRestartButton();
      const button = container.querySelector('.restart-button') as HTMLButtonElement;
      
      expect(button).toBeDefined();
      expect(button.type).toBe('button');
      expect(button.classList.contains('restart-button')).toBe(true);
      expect(button.textContent).toBe('Restart Game');
    });
  });

  describe('showVictory', () => {
    it('should display victory message with word', () => {
      // ARRANGE
      const word = 'ELEPHANT';
      
      // ACT
      messageDisplay.showVictory(word);
      
      // ASSERT
      const message = container.querySelector('.victory-message');
      expect(message).toBeDefined();
      expect(message?.textContent).toContain(word);
    });

    it('should display victory message with correct CSS class', () => {
      // ARRANGE & ACT
      messageDisplay.showVictory('CAT');
      
      // ASSERT
      const message = container.querySelector('.victory-message');
      expect(message).toBeDefined();
      expect(message?.classList.contains('victory-message')).toBe(true);
    });

    it('should convert word to uppercase', () => {
      // ARRANGE & ACT
      messageDisplay.showVictory('elephant');
      
      // ASSERT
      const message = container.querySelector('.victory-message');
      expect(message?.textContent).toContain('ELEPHANT');
      expect(message?.textContent).not.toContain('elephant');
    });

    it('should clear previous content before showing message', () => {
      // ARRANGE: Show attempts first
      messageDisplay.showAttempts(3, 6);
      expect(container.textContent).toContain('3');
      
      // ACT
      messageDisplay.showVictory('CAT');
      
      // ASSERT: Should only have victory message
      expect(container.querySelector('.attempt-counter')).toBeNull();
      expect(container.querySelector('.victory-message')).toBeDefined();
    });

    it('should work with short word', () => {
      // ARRANGE & ACT
      messageDisplay.showVictory('A');
      
      // ASSERT
      const message = container.querySelector('.victory-message');
      expect(message?.textContent).toContain('A');
    });

    it('should work with long word', () => {
      // ARRANGE & ACT
      messageDisplay.showVictory('ANTIDISESTABLISHMENTARIANISM');
      
      // ASSERT
      const message = container.querySelector('.victory-message');
      expect(message?.textContent).toContain('ANTIDISESTABLISHMENTARIANISM');
    });

    it('should handle word with mixed case', () => {
      // ARRANGE & ACT
      messageDisplay.showVictory('ElePhAnT');
      
      // ASSERT
      const message = container.querySelector('.victory-message');
      expect(message?.textContent).toContain('ELEPHANT');
    });

    it('should replace previous victory message', () => {
      // ARRANGE: Show first victory message
      messageDisplay.showVictory('CAT');
      
      // ACT: Show different victory message
      messageDisplay.showVictory('DOG');
      
      // ASSERT: Should only have the new message
      const message = container.querySelector('.victory-message');
      expect(message?.textContent).toContain('DOG');
      expect(message?.textContent).not.toContain('CAT');
    });

    it('should prevent XSS by using textContent', () => {
      // ARRANGE
      const maliciousWord = '<script>alert("xss")</script>';
      
      // ACT
      messageDisplay.showVictory(maliciousWord);
      
      // ASSERT
      const message = container.querySelector('.victory-message');
      
      // Should display as text, not execute
      expect(message?.textContent).toContain('script');
      expect(message?.innerHTML).not.toContain('<script');
    });

    it('should display victory message with proper format', () => {
      // ARRANGE & ACT
      messageDisplay.showVictory('ELEPHANT');
      
      // ASSERT
      const message = container.querySelector('.victory-message');
      expect(message?.textContent).toContain('You Won!');
      expect(message?.textContent).toContain('ELEPHANT');
    });
  });

  describe('showDefeat', () => {
    it('should display defeat message with word', () => {
      // ARRANGE
      const word = 'RHINOCEROS';
      
      // ACT
      messageDisplay.showDefeat(word);
      
      // ASSERT
      const message = container.querySelector('.defeat-message');
      expect(message).toBeDefined();
      expect(message?.textContent).toContain(word);
    });

    it('should display defeat message with correct CSS class', () => {
      // ARRANGE & ACT
      messageDisplay.showDefeat('DOG');
      
      // ASSERT
      const message = container.querySelector('.defeat-message');
      expect(message).toBeDefined();
      expect(message?.classList.contains('defeat-message')).toBe(true);
    });

    it('should convert word to uppercase', () => {
      // ARRANGE & ACT
      messageDisplay.showDefeat('cat');
      
      // ASSERT
      const message = container.querySelector('.defeat-message');
      expect(message?.textContent).toContain('CAT');
    });

    it('should clear previous content before showing message', () => {
      // ARRANGE: Show attempts first
      messageDisplay.showAttempts(3, 6);
      expect(container.textContent).toContain('3');
      
      // ACT
      messageDisplay.showDefeat('CAT');
      
      // ASSERT: Should only have defeat message
      expect(container.querySelector('.attempt-counter')).toBeNull();
      expect(container.querySelector('.defeat-message')).toBeDefined();
    });

    it('should work with short word', () => {
      // ARRANGE & ACT
      messageDisplay.showDefeat('A');
      
      // ASSERT
      const message = container.querySelector('.defeat-message');
      expect(message?.textContent).toContain('A');
    });

    it('should work with long word', () => {
      // ARRANGE & ACT
      messageDisplay.showDefeat('ANTIDISESTABLISHMENTARIANISM');
      
      // ASSERT
      const message = container.querySelector('.defeat-message');
      expect(message?.textContent).toContain('ANTIDISESTABLISHMENTARIANISM');
    });

    it('should handle word with mixed case', () => {
      // ARRANGE & ACT
      messageDisplay.showDefeat('DoG');
      
      // ASSERT
      const message = container.querySelector('.defeat-message');
      expect(message?.textContent).toContain('DOG');
    });

    it('should replace previous defeat message', () => {
      // ARRANGE: Show first defeat message
      messageDisplay.showDefeat('CAT');
      
      // ACT: Show different defeat message
      messageDisplay.showDefeat('DOG');
      
      // ASSERT: Should only have the new message
      const message = container.querySelector('.defeat-message');
      expect(message?.textContent).toContain('DOG');
      expect(message?.textContent).not.toContain('CAT');
    });

    it('should prevent XSS by using textContent', () => {
      // ARRANGE
      const maliciousWord = '<img src="x" onerror="alert(1)">';
      
      // ACT
      messageDisplay.showDefeat(maliciousWord);
      
      // ASSERT
      const message = container.querySelector('.defeat-message');
      
      // Should display as text, not execute
      expect(message?.textContent).toContain('img');
      expect(message?.innerHTML).not.toContain('<img');
    });

    it('should display defeat message with proper format', () => {
      // ARRANGE & ACT
      messageDisplay.showDefeat('ELEPHANT');
      
      // ASSERT
      const message = container.querySelector('.defeat-message');
      expect(message?.textContent).toContain('You Lost.');
      expect(message?.textContent).toContain('ELEPHANT');
    });
  });

  describe('showAttempts', () => {
    it('should display attempt counter with correct format', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(3, 6);
      
      // ASSERT
      const counter = container.querySelector('.attempt-counter');
      expect(counter).toBeDefined();
      expect(counter?.textContent).toContain('3');
      expect(counter?.textContent).toContain('6');
    });

    it('should display initial attempt counter (0/6)', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(0, 6);
      
      // ASSERT
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toMatch(/0.*6/);
    });

    it('should display defeat threshold (6/6)', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(6, 6);
      
      // ASSERT
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toMatch(/6.*6/);
    });

    it('should update when called multiple times', () => {
      // ARRANGE: Show initial
      messageDisplay.showAttempts(0, 6);
      
      // ACT: Update
      messageDisplay.showAttempts(3, 6);
      
      // ASSERT: Should show updated value
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toContain('3');
    });

    it('should clear previous content before showing attempts', () => {
      // ARRANGE: Show victory first
      messageDisplay.showVictory('CAT');
      expect(container.querySelector('.victory-message')).toBeDefined();
      
      // ACT
      messageDisplay.showAttempts(3, 6);
      
      // ASSERT: Should only have attempts counter
      expect(container.querySelector('.victory-message')).toBeNull();
      expect(container.querySelector('.attempt-counter')).toBeDefined();
    });

    it('should display mid-game attempts (3/6)', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(3, 6);
      
      // ASSERT
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toContain('3');
      expect(counter?.textContent).toContain('6');
    });

    it('should display near-defeat attempts (5/6)', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(5, 6);
      
      // ASSERT
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toContain('5');
      expect(counter?.textContent).toContain('6');
    });

    it('should work with different max attempts', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(2, 10);
      
      // ASSERT
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toContain('2');
      expect(counter?.textContent).toContain('10');
    });

    it('should replace previous attempts counter', () => {
      // ARRANGE: Show first counter
      messageDisplay.showAttempts(1, 6);
      
      // ACT: Show different counter
      messageDisplay.showAttempts(4, 6);
      
      // ASSERT: Should only have the new counter
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toContain('4');
      expect(counter?.textContent).not.toContain('1');
    });

    it('should display attempts counter with correct CSS class', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(3, 6);
      
      // ASSERT
      const counter = container.querySelector('.attempt-counter');
      expect(counter).toBeDefined();
      expect(counter?.classList.contains('attempt-counter')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all content from container', () => {
      // ARRANGE: Add some content
      messageDisplay.showAttempts(3, 6);
      expect(container.innerHTML).not.toBe('');
      
      // ACT
      messageDisplay.clear();
      
      // ASSERT
      expect(container.innerHTML).toBe('');
    });

    it('should be safe to call on empty container', () => {
      // ARRANGE: Container already empty
      
      // ACT & ASSERT: Should not throw
      expect(() => messageDisplay.clear()).not.toThrow();
      expect(container.innerHTML).toBe('');
    });

    it('should remove restart button if present', () => {
      // ARRANGE: Show restart button
      messageDisplay.showRestartButton();
      expect(container.querySelector('.restart-button')).toBeDefined();
      
      // ACT
      messageDisplay.clear();
      
      // ASSERT
      expect(container.querySelector('.restart-button')).toBeNull();
    });

    it('should remove victory message', () => {
      // ARRANGE
      messageDisplay.showVictory('CAT');
      expect(container.querySelector('.victory-message')).toBeDefined();
      
      // ACT
      messageDisplay.clear();
      
      // ASSERT
      expect(container.querySelector('.victory-message')).toBeNull();
    });

    it('should remove defeat message', () => {
      // ARRANGE
      messageDisplay.showDefeat('DOG');
      expect(container.querySelector('.defeat-message')).toBeDefined();
      
      // ACT
      messageDisplay.clear();
      
      // ASSERT
      expect(container.querySelector('.defeat-message')).toBeNull();
    });

    it('should remove attempt counter', () => {
      // ARRANGE
      messageDisplay.showAttempts(3, 6);
      expect(container.querySelector('.attempt-counter')).toBeDefined();
      
      // ACT
      messageDisplay.clear();
      
      // ASSERT
      expect(container.querySelector('.attempt-counter')).toBeNull();
    });

    it('should be safe to call multiple times', () => {
      // ARRANGE & ACT: Clear multiple times
      expect(() => {
        messageDisplay.clear();
        messageDisplay.clear();
        messageDisplay.clear();
      }).not.toThrow();
      
      // ASSERT: Should still be empty
      expect(container.innerHTML).toBe('');
    });
  });

  describe('attachRestartHandler', () => {
    beforeEach(() => {
      // Show restart button for testing
      messageDisplay.showRestartButton();
    });

    it('should call handler when restart button clicked', () => {
      // ARRANGE
      const mockHandler = jest.fn();
      messageDisplay.attachRestartHandler(mockHandler);
      
      // ACT: Click restart button
      const button = container.querySelector('.restart-button') as HTMLButtonElement;
      button.click();
      
      // ASSERT
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should support multiple handlers', () => {
      // ARRANGE
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      messageDisplay.attachRestartHandler(handler1);
      messageDisplay.attachRestartHandler(handler2);
      
      // ACT
      const button = container.querySelector('.restart-button') as HTMLButtonElement;
      button.click();
      
      // ASSERT
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should work after multiple handler attachments', () => {
      // ARRANGE
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      
      messageDisplay.attachRestartHandler(handler1);
      messageDisplay.attachRestartHandler(handler2);
      messageDisplay.attachRestartHandler(handler3);
      
      // ACT
      const button = container.querySelector('.restart-button') as HTMLButtonElement;
      button.click();
      
      // ASSERT: All handlers should be called
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });
  });

  describe('showRestartButton', () => {
    it('should add restart button to container', () => {
      // ARRANGE: Button not in DOM initially
      expect(container.querySelector('.restart-button')).toBeNull();
      
      // ACT
      messageDisplay.showRestartButton();
      
      // ASSERT
      const button = container.querySelector('.restart-button');
      expect(button).toBeDefined();
      expect(button).toBeInstanceOf(HTMLButtonElement);
    });

    it('should not duplicate button when called multiple times', () => {
      // ARRANGE & ACT: Call twice
      messageDisplay.showRestartButton();
      messageDisplay.showRestartButton();
      
      // ASSERT: Should only have one button
      const buttons = container.querySelectorAll('.restart-button');
      expect(buttons.length).toBe(1);
    });

    it('should create button with correct properties', () => {
      // ARRANGE & ACT
      messageDisplay.showRestartButton();
      
      // ASSERT
      const button = container.querySelector('.restart-button') as HTMLButtonElement;
      expect(button.type).toBe('button');
      expect(button.classList.contains('restart-button')).toBe(true);
      expect(button.textContent).toBe('Restart Game');
    });

    it('should be idempotent when button already shown', () => {
      // ARRANGE: Show button first
      messageDisplay.showRestartButton();
      const initialButton = container.querySelector('.restart-button');
      
      // ACT: Show again
      messageDisplay.showRestartButton();
      const finalButton = container.querySelector('.restart-button');
      
      // ASSERT: Should be the same button instance
      expect(initialButton).toBe(finalButton);
    });

    it('should not add button if already in container', () => {
      // ARRANGE: Show button
      messageDisplay.showRestartButton();
      const initialButtons = container.querySelectorAll('.restart-button').length;
      
      // ACT: Try to show again
      messageDisplay.showRestartButton();
      const finalButtons = container.querySelectorAll('.restart-button').length;
      
      // ASSERT: Count should not change
      expect(finalButtons).toBe(initialButtons);
    });
  });

  describe('hideRestartButton', () => {
    it('should remove restart button from container', () => {
      // ARRANGE: Show button first
      messageDisplay.showRestartButton();
      expect(container.querySelector('.restart-button')).toBeDefined();
      
      // ACT
      messageDisplay.hideRestartButton();
      
      // ASSERT
      expect(container.querySelector('.restart-button')).toBeNull();
    });

    it('should be safe when button not in DOM', () => {
      // ARRANGE: Button not shown
      
      // ACT & ASSERT: Should not throw
      expect(() => messageDisplay.hideRestartButton()).not.toThrow();
    });

    it('should be idempotent (safe to call multiple times)', () => {
      // ARRANGE: Show then hide
      messageDisplay.showRestartButton();
      messageDisplay.hideRestartButton();
      
      // ACT: Hide again
      expect(() => messageDisplay.hideRestartButton()).not.toThrow();
      
      // ASSERT
      expect(container.querySelector('.restart-button')).toBeNull();
    });

    it('should not throw if button is not a child of container', () => {
      // ARRANGE: Create a button but don't add it to container
      // This scenario is harder to test since the button is created internally
      // but we can test when it's already removed
      
      messageDisplay.showRestartButton();
      messageDisplay.hideRestartButton(); // Remove it
      
      // ACT & ASSERT: Should not throw when already removed
      expect(() => messageDisplay.hideRestartButton()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle showVictory with empty string (if validation not present)', () => {
      // ARRANGE & ACT
      messageDisplay.showVictory('');
      
      // ASSERT: Should still create message with empty word
      const message = container.querySelector('.victory-message');
      expect(message).toBeDefined();
      expect(message?.textContent).toContain('');
    });

    it('should handle showDefeat with empty string (if validation not present)', () => {
      // ARRANGE & ACT
      messageDisplay.showDefeat('');
      
      // ASSERT: Should still create message with empty word
      const message = container.querySelector('.defeat-message');
      expect(message).toBeDefined();
      expect(message?.textContent).toContain('');
    });

    it('should handle showAttempts with negative values (if validation not present)', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(-1, 6);
      
      // ASSERT: Should display as is (no validation in current code)
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toContain('-1');
    });

    it('should handle showAttempts with values exceeding max (if validation not present)', () => {
      // ARRANGE & ACT
      messageDisplay.showAttempts(10, 6);
      
      // ASSERT: Should display as is (no validation in current code)
      const counter = container.querySelector('.attempt-counter');
      expect(counter?.textContent).toContain('10');
      expect(counter?.textContent).toContain('6');
    });

    it('should handle clear on container with existing content', () => {
      // ARRANGE: Add existing content to container
      const existingDiv = document.createElement('div');
      existingDiv.id = 'existing';
      container.appendChild(existingDiv);
      expect(container.children.length).toBe(1);
      
      // ACT
      messageDisplay.clear();
      
      // ASSERT: Should clear everything
      expect(container.innerHTML).toBe('');
    });

    it('should handle message display after clear', () => {
      // ARRANGE: Show message and clear
      messageDisplay.showVictory('CAT');
      messageDisplay.clear();
      
      // ACT: Show another message
      messageDisplay.showDefeat('DOG');
      
      // ASSERT: Should work normally after clear
      expect(container.querySelector('.defeat-message')).toBeDefined();
      expect(container.querySelector('.victory-message')).toBeNull();
    });

    it('should handle restart button operations after clear', () => {
      // ARRANGE: Show button, clear, then show again
      messageDisplay.showRestartButton();
      messageDisplay.clear();
      
      // ACT
      messageDisplay.showRestartButton();
      
      // ASSERT: Should work normally
      expect(container.querySelector('.restart-button')).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should work with standard container ID "message-container"', () => {
      // ARRANGE: DOM already has container with correct ID
      
      // ACT
      const display = new MessageDisplay('message-container');
      display.showAttempts(3, 6);
      
      // ASSERT
      expect(container.textContent).toContain('3');
    });

    it('should support typical game flow: showAttempts → showVictory → showRestartButton', () => {
      // ARRANGE: Fresh display
      
      // ACT: Game progress
      messageDisplay.showAttempts(0, 6);
      messageDisplay.showAttempts(3, 6);
      messageDisplay.showVictory('ELEPHANT');
      messageDisplay.showRestartButton();
      
      // ASSERT: All elements should be in correct state
      expect(container.querySelector('.victory-message')).toBeDefined();
      expect(container.querySelector('.restart-button')).toBeDefined();
      expect(container.querySelector('.attempt-counter')).toBeNull();
    });

    it('should support defeat flow: showAttempts × N → showDefeat → showRestartButton', () => {
      // ARRANGE: Fresh display
      
      // ACT: Game progress leading to defeat
      messageDisplay.showAttempts(0, 6);
      messageDisplay.showAttempts(4, 6);
      messageDisplay.showAttempts(6, 6);
      messageDisplay.showDefeat('RHINOCEROS');
      messageDisplay.showRestartButton();
      
      // ASSERT: Should show defeat message and restart button
      expect(container.querySelector('.defeat-message')).toBeDefined();
      expect(container.querySelector('.restart-button')).toBeDefined();
      expect(container.querySelector('.attempt-counter')).toBeNull();
    });

    it('should support restart flow: showRestartButton → clear → showAttempts', () => {
      // ARRANGE: Game ended
      messageDisplay.showDefeat('CAT');
      messageDisplay.showRestartButton();
      
      // ACT: Restart
      messageDisplay.clear();
      messageDisplay.hideRestartButton();
      messageDisplay.showAttempts(0, 6);
      
      // ASSERT: Should be back to initial state
      expect(container.querySelector('.defeat-message')).toBeNull();
      expect(container.querySelector('.restart-button')).toBeNull();
      expect(container.querySelector('.attempt-counter')).toBeDefined();
    });

    it('should work with multiple MessageDisplay instances (different containers)', () => {
      // ARRANGE: Create another container
      const container2 = document.createElement('div');
      container2.id = 'message-container-2';
      document.body.appendChild(container2);
      
      // ACT: Create two displays
      const display1 = new MessageDisplay('message-container');
      const display2 = new MessageDisplay('message-container-2');
      
      display1.showVictory('CAT');
      display2.showDefeat('DOG');
      
      // ASSERT: Each display manages its own container
      expect(container.textContent).toContain('CAT');
      expect(container2.textContent).toContain('DOG');
    });

    it('should work with GameController restart handler', () => {
      // ARRANGE
      const mockController = {
        handleRestart: jest.fn(),
      };
      
      messageDisplay.showRestartButton();
      messageDisplay.attachRestartHandler(mockController.handleRestart);
      
      // ACT: Click restart button
      const button = container.querySelector('.restart-button') as HTMLButtonElement;
      button.click();
      
      // ASSERT: Controller method should be called
      expect(mockController.handleRestart).toHaveBeenCalledTimes(1);
    });

    it('should handle container with existing content', () => {
      // ARRANGE: Container has existing content
      const existingDiv = document.createElement('div');
      existingDiv.id = 'existing';
      container.appendChild(existingDiv);
      expect(container.children.length).toBe(1);
      
      // ACT: Show message (should clear existing content)
      messageDisplay.showAttempts(3, 6);
      
      // ASSERT: Existing content should be cleared
      expect(container.children.length).toBe(1); // Only the attempt counter div
      expect(container.querySelector('.attempt-counter')).toBeDefined();
      expect(container.querySelector('#existing')).toBeNull();
    });
  });
});
```

---

# Respuesta (FIX 1)

**Prompt:**
```markdown
> the-hangman-game@1.0.0 test
> jest tests/views/message-display.test.ts

 FAIL  tests/views/message-display.test.ts
  MessageDisplay
    constructor
      ✓ should initialize with valid container ID (6 ms)
      ✓ should throw error when container not found (8 ms)
      ✓ should store reference to container element (2 ms)
      ✓ should create restart button during construction (5 ms)
      ✓ should create restart button with correct properties (1 ms)
    showVictory
      ✓ should display victory message with word (1 ms)
      ✓ should display victory message with correct CSS class (1 ms)
      ✓ should convert word to uppercase (1 ms)
      ✓ should clear previous content before showing message (1 ms)
      ✓ should work with short word (1 ms)
      ✓ should work with long word (1 ms)
      ✓ should handle word with mixed case (1 ms)
      ✓ should replace previous victory message (1 ms)
      ✕ should prevent XSS by using textContent (1 ms)
      ✓ should display victory message with proper format (1 ms)
    showDefeat
      ✓ should display defeat message with word (1 ms)
      ✓ should display defeat message with correct CSS class (1 ms)
      ✓ should convert word to uppercase
      ✓ should clear previous content before showing message (1 ms)
      ✓ should work with short word (1 ms)
      ✓ should work with long word
      ✓ should handle word with mixed case
      ✓ should replace previous defeat message (1 ms)
      ✕ should prevent XSS by using textContent (1 ms)
      ✓ should display defeat message with proper format (1 ms)
    showAttempts
      ✓ should display attempt counter with correct format
      ✓ should display initial attempt counter (0/6)
      ✓ should display defeat threshold (6/6)
      ✓ should update when called multiple times (1 ms)
      ✓ should clear previous content before showing attempts (1 ms)
      ✓ should display mid-game attempts (3/6) (2 ms)
      ✓ should display near-defeat attempts (5/6) (1 ms)
      ✓ should work with different max attempts
      ✓ should replace previous attempts counter (1 ms)
      ✓ should display attempts counter with correct CSS class (1 ms)
    clear
      ✓ should clear all content from container (1 ms)
      ✓ should be safe to call on empty container
      ✓ should remove restart button if present (1 ms)
      ✓ should remove victory message
      ✓ should remove defeat message (1 ms)
      ✓ should remove attempt counter (1 ms)
      ✓ should be safe to call multiple times
    attachRestartHandler
      ✓ should call handler when restart button clicked (1 ms)
      ✓ should support multiple handlers (1 ms)
      ✓ should work after multiple handler attachments (1 ms)
    showRestartButton
      ✓ should add restart button to container (1 ms)
      ✓ should not duplicate button when called multiple times
      ✓ should create button with correct properties (1 ms)
      ✓ should be idempotent when button already shown
      ✓ should not add button if already in container
    hideRestartButton
      ✓ should remove restart button from container (1 ms)
      ✓ should be safe when button not in DOM
      ✓ should be idempotent (safe to call multiple times)
      ✓ should not throw if button is not a child of container
    Edge Cases
      ✓ should handle showVictory with empty string (if validation not present)
      ✓ should handle showDefeat with empty string (if validation not present) (1 ms)
      ✓ should handle showAttempts with negative values (if validation not present)
      ✓ should handle showAttempts with values exceeding max (if validation not present) (1 ms)
      ✓ should handle clear on container with existing content (1 ms)
      ✓ should handle message display after clear (1 ms)
      ✓ should handle restart button operations after clear
    Integration
      ✓ should work with standard container ID "message-container" (1 ms)
      ✓ should support typical game flow: showAttempts → showVictory → showRestartButton
      ✓ should support defeat flow: showAttempts × N → showDefeat → showRestartButton (1 ms)
      ✓ should support restart flow: showRestartButton → clear → showAttempts (1 ms)
      ✓ should work with multiple MessageDisplay instances (different containers) (1 ms)
      ✓ should work with GameController restart handler
      ✓ should handle container with existing content

  ● MessageDisplay › showVictory › should prevent XSS by using textContent

    expect(received).toContain(expected) // indexOf

    Expected substring: "script"
    Received string:    "You Won! The word was: <SCRIPT>ALERT(\"XSS\")</SCRIPT>"

      193 |       
      194 |       // Should display as text, not execute
    > 195 |       expect(message?.textContent).toContain('script');
          |                                    ^
      196 |       expect(message?.innerHTML).not.toContain('<script');
      197 |     });
      198 |

      at Object.<anonymous> (tests/views/message-display.test.ts:195:36)

  ● MessageDisplay › showDefeat › should prevent XSS by using textContent

    expect(received).toContain(expected) // indexOf

    Expected substring: "img"
    Received string:    "You Lost. The word was: <IMG SRC=\"X\" ONERROR=\"ALERT(1)\">"

      305 |       
      306 |       // Should display as text, not execute
    > 307 |       expect(message?.textContent).toContain('img');
          |                                    ^
      308 |       expect(message?.innerHTML).not.toContain('<img');
      309 |     });
      310 |

      at Object.<anonymous> (tests/views/message-display.test.ts:307:36)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 66 passed, 68 total
Snapshots:   0 total
Time:        0.454 s, estimated 1 s
Ran all test suites matching /tests\/views\/message-display.test.ts/i.
```
**Respuesta:**
The two failing tests are checking for XSS prevention by verifying that malicious script tags are displayed as literal text. The tests expect the text content to contain the original malicious tag names (like 'script' or 'img'), but the actual implementation is converting them to uppercase (e.g., `<SCRIPT>` instead of `<script>`).
The tests are failing because they expect the lowercase version of the tag names in the text content, but the `MessageDisplay` class uses `.toUpperCase()` on the word, which also converts the malicious HTML tags to uppercase.
Here are the specific assertions that need to be updated in the test file:
1. In the `showVictory` test: `expect(message?.textContent).toContain('script');` should check for `'SCRIPT'` instead.
2. In the `showDefeat` test: `expect(message?.textContent).toContain('img');` should check for `'IMG'` instead.
Here are the corrected test cases:
```typescript
// tests/views/message-display.test.ts
// ... (previous content unchanged)

  describe('showVictory', () => {
    // ... (previous tests unchanged)

    it('should prevent XSS by using textContent', () => {
      // ARRANGE
      const maliciousWord = '<script>alert("xss")</script>';

      // ACT
      messageDisplay.showVictory(maliciousWord);

      // ASSERT
      const message = container.querySelector('.victory-message');

      // Should display as text, not execute
      // Note: The implementation converts to uppercase, so we check for 'SCRIPT'
      expect(message?.textContent).toContain('SCRIPT');
      expect(message?.innerHTML).not.toContain('<script');
    });

    // ... (remaining tests unchanged)
  });

  describe('showDefeat', () => {
    // ... (previous tests unchanged)

    it('should prevent XSS by using textContent', () => {
      // ARRANGE
      const maliciousWord = '<img src="x" onerror="alert(1)">';

      // ACT
      messageDisplay.showDefeat(maliciousWord);

      // ASSERT
      const message = container.querySelector('.defeat-message');

      // Should display as text, not execute
      // Note: The implementation converts to uppercase, so we check for 'IMG'
      expect(message?.textContent).toContain('IMG');
      expect(message?.innerHTML).not.toContain('<img');
    });

    // ... (remaining tests unchanged)
  });

  // ... (rest of the file unchanged)

```
These changes reflect the actual behavior of the `MessageDisplay` class, which normalizes the input word to uppercase before displaying it. The security aspect (using `textContent` instead of `innerHTML`) is still correctly tested, as the malicious tags are not executed, they are just displayed as text.