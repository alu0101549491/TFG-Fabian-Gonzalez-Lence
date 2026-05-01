## 1. **Introduction**

The objective of this project is to develop a **SPA web application** (Single Page Application) that implements the Hangman game, using **TypeScript**, **MVC** architecture, event-driven programming, and graphics through the **Canvas API**. The application will allow a user to guess words from an animal dictionary before completing a hangman drawing (maximum 6 failed attempts).

Best practices of **OOP** will be integrated, unit testing with **Jest**, documentation with **JSDoc/TypeDoc**, styling with **Bulma**, and automated development workflow through **GitHub Actions**.

---

## 2. **Scope**

The application will allow:

- Guessing randomly selected words from an animal dictionary.
- Displaying the word as empty boxes, revealing correct letters according to the player's attempts.
- Counting up to 6 failed attempts and graphically representing the hangman's progress.
- Ending the game with either player victory (complete word guessed) or computer victory (6 failed attempts completed).
- Restarting the game with a new random word.
- Displaying graphical interface with interactive alphabet, letter boxes, gallows and hangman.
- Functioning as a responsive SPA, with documentation and UML accessible from GitHub Pages.

Does not include:

- Word dictionaries other than animal names.
- Multiplayer mode or network features.
- Statistics or score persistence between sessions.
- Multiple difficulty levels in the base version.

---

## 3. **Definitions and Abbreviations**

- **SPA:** Single Page Application, a single-page web application.
- **MVC:** Model-View-Controller, architectural pattern for separation of concerns.
- **OOP:** Object-Oriented Programming.
- **Canvas:** HTML5 graphics API for drawing elements dynamically.
- **ESLint:** Static code analysis tool to identify issues.
- **Jest:** Testing framework for JavaScript/TypeScript.
- **TypeDoc:** Documentation generator from JSDoc comments in TypeScript.

---

## 4. **Functional Requirements (FR)**

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| FR1 | Initialize the game displaying the word to guess in empty boxes. | When loading the application, the word is displayed as empty boxes (underscores) and the complete alphabet available for selection. |
| FR2 | Letter selection by the user through click. | When clicking on a letter of the alphabet, it is marked as selected (no longer clickable) and the system processes whether it is correct or incorrect. |
| FR3 | Reveal all occurrences of correct letters. | If the selected letter is in the word, all its occurrences are revealed simultaneously in the corresponding boxes. |
| FR4 | Register failed attempts and increment counter. | Each incorrect letter selected increments the failed attempts counter (maximum 6) and does not reveal any letter. |
| FR5 | Update graphical representation of the hangman. | Each failed attempt adds a new part to the hangman drawing (6 progressive states: base, post, beam, rope, head, body/limbs). |
| FR6 | Game termination by player victory. | If the player guesses all letters of the word before reaching 6 failed attempts, a victory message is displayed and the restart option is enabled. |
| FR7 | Game termination by computer victory. | If 6 failed attempts are completed without guessing the word, a defeat message is displayed with the correct word and the restart option is enabled. |
| FR8 | Management of animal word dictionary. | The system maintains a dictionary of at least 10 animal names and randomly selects one when starting or restarting the game. |
| FR9 | Game restart. | Upon finishing a game (victory or defeat), the user can restart the game through a button, which selects a new random word and resets all states (attempts, selected letters, drawing). |
| FR10 | Disable already selected letters. | Once the user selects a letter, it must be visually marked and cannot be selected again in the same game. |

---

## 5. **Non-Functional Requirements (NFR)**

| Code | Requirement | Acceptance Criteria |
| --- | --- | --- |
| NFR1 | The application must be a responsive SPA and function correctly in modern browsers. | Verified visually and functionally in Chrome, Firefox and Edge, both on desktop and mobile devices. |
| NFR2 | Modular and object-oriented code following MVC architecture. | Code is organized into Model, View and Controller, each class in its own TypeScript file within `src/home-work/`, exported as ES6 modules. |
| NFR3 | Implementation of three separate main classes. | The classes `GameModel` (data and business logic), `GameView` (user interface and rendering), and `GameController` (coordination between Model and View) exist. |
| NFR4 | Use of Bulma for interface styling. | HTML elements use Bulma classes with a consistent design: gray background, legible typography similar to ULL pages, and contrasting colors. |
| NFR5 | Unit tests with Jest with minimum 80% coverage. | Tests are implemented for critical functions: correct/incorrect letter selection, attempt control, victory/defeat conditions, and restart. Coverage reaches at least 80%. |
| NFR6 | Complete documentation with JSDoc/TypeDoc. | All public classes, methods and functions are documented with JSDoc. Documentation generated with TypeDoc is accessible from GitHub Pages. |
| NFR7 | Code analysis with ESLint and Google style guide. | Code passes ESLint analysis configured with Google style guide for TypeScript without relevant errors or warnings. |
| NFR8 | Immediate response time when selecting letters. | Interface updates in less than 200ms after each letter selection, showing changes in boxes, hangman drawing or game state. |
| NFR9 | Continuous integration with GitHub Actions. | GitHub Actions is configured to execute ESLint analysis, generate documentation with TypeDoc, and automatically deploy to GitHub Pages. |
| NFR10 | Project documentation in README.md. | The README.md file includes clear compilation and execution instructions ("Building and Running the code") and link to live demo ("Live Demo"). |
| NFR11 | UML class diagram publicly available. | A UML diagram of the main classes (Model, View, Controller) is included, accessible from GitHub Pages. |

---

## 6. **Optional Considerations**

- **Visual animations:** Smooth transitions when revealing correct letters or showing errors.
- **Sound effects:** Auditory feedback when guessing or missing letters.
- **Difficulty levels:** Easy mode (8 attempts), normal (6 attempts), hard (4 attempts).
- **Expanded dictionaries:** Future integration with additional categories (fruits, countries, objects, etc.).
- **Scoring system:** Persistent won/lost games counter in localStorage.
- **Dark mode:** Visual alternative for the interface.
- **Optional hints:** Help system that reveals a random letter in exchange for penalty.

---

## 7. **Actor Summary**

- **User/Player:** Interacts with the application by selecting letters from the alphabet to guess the hidden word. Can restart the game after finishing a match.
- **System:** Manages game logic (random word selection, letter validation, attempt control), updates graphical interface (boxes, alphabet, hangman drawing), and determines victory or defeat conditions.

---

## 8. **Detailed Technical Architecture**

### 8.1 MVC Class Structure

**GameModel (src/home-work/model/GameModel.ts)**

- Stores the selected secret word
- Maintains the set of letters guessed by the player
- Counts failed attempts (maximum 6)
- Manages the animal dictionary (minimum 10 words)
- Provides methods to verify letters, obtain game state, and restart

**GameView (src/home-work/view/GameView.ts)**

- Renders empty boxes of the word
- Displays the complete alphabet as interactive buttons
- Draws the gallows and the 6 phases of the hangman (Canvas API or images `Hangman-1.png` to `Hangman-6.png`)
- Visually updates the state after each interaction
- Displays victory, defeat messages and restart button

**GameController (src/home-work/controller/GameController.ts)**

- Coordinates interaction between Model and View
- Handles click events on alphabet letters
- Processes validation logic by calling the Model
- Updates the View according to state changes
- Manages game restart flow

### 8.2 Project File Structure

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
│   ├── Hangman-1.png
│   ├── Hangman-2.png
│   ├── Hangman-3.png
│   ├── Hangman-4.png
│   ├── Hangman-5.png
│   └── Hangman-6.png
└── tests/
    ├── GameModel.test.ts
    ├── GameView.test.ts
    └── GameController.test.ts

```

---

## 9. **Graphical Interface Features**

### 9.1 Main Visual Elements

- **Word area:** Boxes (div or spans) showing underscores for unguessed letters and revealed letters for correct guesses.
- **Interactive alphabet:** 26-29 letters (depending on language) presented as buttons. Selected letters are disabled and change style.
- **Hangman representation:** Section with image or canvas showing 6 progressive states of the drawing.
- **Attempt counter:** Visual indicator of failed attempts (e.g., "Attempts: 3/6").
- **Status messages:** Alerts or modals showing victory ("You Won!"), defeat ("You Lost. The word was: ANIMAL") and restart button.

### 9.2 Styling with Bulma

- Use of Bulma components: `button`, `box`, `notification`, `container`
- Color palette: light gray background, buttons with Bulma primary colors
- Legible typography (Bulma default)
- Responsive layout with Bulma column system
- Clear visual states: disabled buttons, correct letters in green, incorrect in red (optional)

---

## 10. **Testing Specifications**

### 10.1 Required Unit Tests (Jest)

**GameModel.test.ts:**

- Correct initialization of the model with random word from dictionary
- Verification of correct letter reveals all its occurrences
- Verification of incorrect letter increments attempt counter
- Correct detection of victory condition (all letters guessed)
- Correct detection of defeat condition (6 failed attempts)
- Correct game restart with new word

**GameView.test.ts (optional but recommended):**

- Correct rendering of initial boxes
- Correct update of boxes when revealing letters
- Visual disabling of selected letters

**GameController.test.ts:**

- Correct processing of correct letter selection
- Correct processing of incorrect letter selection
- Complete player victory flow
- Complete player defeat flow

### 10.2 Minimum Coverage

- Line coverage: ≥80%
- Critical function coverage: 100% (letter validation, attempt control, termination conditions)

---

## 11. **Continuous Integration Flow (GitHub Actions)**

### 11.1 CI/CD Pipeline

1. **Linting:** Execute ESLint on each push/PR to verify code style
2. **Testing:** Execute test suite with Jest and verify minimum coverage
3. **Build:** Compile TypeScript to JavaScript
4. **Documentation:** Generate documentation with TypeDoc
5. **Deployment:** Publish application and documentation to GitHub Pages automatically

### 11.2 ESLint Configuration

- Style guide: Google TypeScript Style Guide
- No relevant errors or warnings allowed in production code

---

## 12. **Deliverables**

1. **Complete source code** in GitHub repository with MVC structure
2. **Functional application** deployed on GitHub Pages (live demo)
3. **Technical documentation** generated with TypeDoc accessible from GitHub Pages
4. **UML class diagram** showing Model, View, Controller and their relationships
5. **README.md** with:
    - Project description
    - Installation and execution instructions
    - Link to live demo
    - Link to technical documentation
    - Explained project structure
6. **Test suite** with minimum 80% coverage
7. **GitHub Actions configuration** for functional CI/CD

---

**Final Notes:** This document establishes the foundation for developing a professional web application of the Hangman game, following industry standards regarding architecture, code quality, testing and documentation. The specification is detailed enough to guide the complete project development and serve as a basis for generating UML diagrams and use cases.