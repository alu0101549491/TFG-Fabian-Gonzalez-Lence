## **Core Gameplay**

### **Game Initialization**

- **[REQ-001]** **[Ubiquitous]** The system shall initialize the game by selecting a random word from the animal dictionary.
- **[REQ-002]** **[Ubiquitous]** The system shall display the word to guess as empty boxes, one for each letter.
- **[REQ-003]** **[Ubiquitous]** The system shall display the full alphabet as selectable letters.

### **Letter Selection**

- **[REQ-004]** **[Event-driven]** When the player clicks on a letter, the system shall check if the letter is in the word.
- **[REQ-005]** **[Event-driven]** When the selected letter is correct, the system shall reveal all occurrences of that letter in the word.
- **[REQ-006]** **[Event-driven]** When the selected letter is incorrect, the system shall register a failed attempt and update the hangman drawing.

### **Game End Conditions**

- **[REQ-007]** **[Event-driven]** When the player guesses all letters in the word, the system shall declare victory.
- **[REQ-008]** **[Event-driven]** When the player reaches 6 failed attempts, the system shall declare defeat.
- **[REQ-009]** **[Event-driven]** When the game ends, the system shall display a victory or defeat message.
- **[REQ-010]** **[Event-driven]** When the game ends, the system shall show a restart button.

### **Game Restart**

- **[REQ-011]** **[Event-driven]** When the player clicks the restart button, the system shall reset the game with a new random word.

---

## **Dictionary and Word Management**

### **Dictionary Characteristics**

- **[REQ-012]** **[Ubiquitous]** The system shall use a dictionary of animal names with at least 10 words.
- **[REQ-013]** **[Ubiquitous]** The system shall select a random word from the dictionary at the start of each game.

---

## **User Interface**

### **Graphical Representation**

- **[REQ-014]** **[Ubiquitous]** The system shall display empty boxes for each letter of the word to guess.
- **[REQ-015]** **[Ubiquitous]** The system shall display the full alphabet as clickable letters.
- **[REQ-016]** **[Ubiquitous]** The system shall display the hangman drawing, updating it after each failed attempt.
- **[REQ-017]** **[Ubiquitous]** The system shall use 6 hangman states (images or Canvas API: `Hangman-1.png` to `Hangman-6.png`).

### **Responsive Design**

- **[REQ-018]** **[Ubiquitous]** The system shall be responsive and functional in modern browsers (Chrome, Firefox, Edge).
- **[REQ-019]** **[Ubiquitous]** The system shall use the Bulma framework for styling (gray background, legible typography, contrasting colors).

### **User Feedback**

- **[REQ-020]** **[Event-driven]** When a letter is selected, the system shall update the UI immediately (less than 200ms).
- **[REQ-021]** **[Event-driven]** When the game ends, the system shall display a message indicating victory or defeat.

---

## **Technical Architecture**

### **MVC Structure**

- **[REQ-022]** **[Ubiquitous]** The system shall follow the MVC pattern with clear separation of responsibilities.
- **[REQ-023]** **[Ubiquitous]** The system shall implement the following classes:
    - **GameModel**: Stores the secret word, guessed letters, failed attempts, and dictionary.
    - **GameView**: Manages the UI, draws the word boxes, available letters, and hangman.
    - **GameController**: Handles letter selection logic and communication between Model and View.

### **Code Structure**

- **[REQ-024]** **[Ubiquitous]** Each class shall be in a separate file within `src/home-work`.
- **[REQ-025]** **[Ubiquitous]** Classes shall be exported as ES6 modules.
- **[REQ-026]** **[Ubiquitous]** The system shall use object-oriented programming with encapsulation best practices.

---

## **Testing and Code Quality**

### **Unit Testing**

- **[REQ-027]** **[Ubiquitous]** The system shall include unit tests with Jest covering:
    - Correct and incorrect letter selection.
    - Failed attempts tracking.
    - Victory and defeat conditions.
    - Game restart and random word selection.
- **[REQ-028]** **[Ubiquitous]** The system shall achieve at least 80% test coverage for critical functions.

### **Static Analysis**

- **[REQ-029]** **[Ubiquitous]** The system shall use ESLint with Google's TypeScript style guide.
- **[REQ-030]** **[Ubiquitous]** The system shall have no relevant ESLint errors or warnings.

### **Continuous Integration**

- **[REQ-031]** **[Ubiquitous]** The system shall use GitHub Actions for static analysis and automatic deployment.

---

## **Documentation**

### **Code Documentation**

- **[REQ-032]** **[Ubiquitous]** All classes and methods shall be documented with JSDoc.
- **[REQ-033]** **[Ubiquitous]** The system shall generate technical documentation with TypeDoc.

### **Project Documentation**

- **[REQ-034]** **[Ubiquitous]** The system shall include a `README.md` with:
    - Build and execution instructions.
    - Link to a live demo.
    - Project structure description.
- **[REQ-035]** **[Ubiquitous]** The system shall provide a UML class diagram on GitHub Pages.

---

## **Optional Features**

- **[REQ-036]** **[Optional]** The system may include simple animations when revealing correct or incorrect letters.
- **[REQ-037]** **[Optional]** The system may include sound effects for correct or incorrect guesses.
- **[REQ-038]** **[Optional]** The system may include different difficulty levels (varying the number of allowed attempts).
- **[REQ-039]** **[Optional]** The system may integrate with larger dictionaries or multiple categories in the future.

---

## **File Structure**

- **[REQ-040]** **[Ubiquitous]** The system shall follow this file structure:
    
    ```bash
    src/home-work/
    ├── model/
    │   └── GameModel.ts
    ├── view/
    │   └── GameView.ts
    ├── controller/
    │   └── GameController.ts
    ├── index.ts
    ├── assets/
    │   └── Hangman-1.png ... Hangman-6.png
    └── tests/
    └── GameModel.test.ts
    ```