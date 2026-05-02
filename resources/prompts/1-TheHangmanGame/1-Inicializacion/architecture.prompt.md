# PROJECT CONTEXT

**Project:** The Hangman Game

**Description:** A responsive Single Page Application (SPA) that implements the classic Hangman game where players guess animal names letter by letter before completing a hangman drawing (maximum 6 failed attempts). Features include interactive alphabet, visual word progress, Canvas-based hangman rendering, and complete game state management.

**Selected architecture:** MVC (Model-View-Controller)

**Technology stack:** TypeScript, HTML, CSS, Vite, TypeDoc, ESLint, Jest, ts-jest, Bulma, Canvas API

---

# AVAILABLE DESIGN ARTIFACTS

## Main class diagram
```mermaid
classDiagram
    %% MODEL LAYER
    class GameModel {
        -secretWord: string
        -guessedLetters: Set~string~
        -failedAttempts: number
        -maxAttempts: number
        -wordDictionary: WordDictionary
        +constructor(wordDictionary: WordDictionary)
        +initializeGame(): void
        +guessLetter(letter: string): GuessResult
        +isLetterGuessed(letter: string): boolean
        +getRevealedWord(): string[]
        +getFailedAttempts(): number
        +getMaxAttempts(): number
        +isGameOver(): boolean
        +isVictory(): boolean
        +isDefeat(): boolean
        +getSecretWord(): string
        +resetGame(): void
        -checkVictoryCondition(): boolean
    }
    
    class WordDictionary {
        -words: string[]
        +constructor()
        +getRandomWord(): string
        +getWordCount(): number
        -initializeAnimalWords(): void
    }
    
    class GuessResult {
        <<enumeration>>
        CORRECT
        INCORRECT
        ALREADY_GUESSED
    }
    
    %% VIEW LAYER
    class GameView {
        -wordDisplay: WordDisplay
        -alphabetDisplay: AlphabetDisplay
        -hangmanRenderer: HangmanRenderer
        -messageDisplay: MessageDisplay
        +constructor()
        +initialize(): void
        +updateWordBoxes(letters: string[]): void
        +disableLetter(letter: string): void
        +updateAttemptCounter(current: number, max: number): void
        +renderHangman(attempts: number): void
        +showVictoryMessage(word: string): void
        +showDefeatMessage(word: string): void
        +showRestartButton(): void
        +hideRestartButton(): void
        +reset(): void
    }
    
    class WordDisplay {
        -container: HTMLElement
        -letterBoxes: HTMLElement[]
        +constructor(containerId: string)
        +render(wordLength: number): void
        +updateBox(index: number, letter: string): void
        +reset(): void
        -createLetterBox(): HTMLElement
    }
    
    class AlphabetDisplay {
        -container: HTMLElement
        -letterButtons: Map~string, HTMLButtonElement~
        +constructor(containerId: string)
        +render(): void
        +disableLetter(letter: string): void
        +enableAllLetters(): void
        +attachClickHandler(handler: Function): void
        -createLetterButton(letter: string): HTMLButtonElement
    }
    
    class HangmanRenderer {
        -canvas: HTMLCanvasElement
        -context: CanvasRenderingContext2D
        +constructor(canvasId: string)
        +render(attempts: number): void
        +clear(): void
        -drawGallows(): void
        -drawHead(): void
        -drawBody(): void
        -drawLeftArm(): void
        -drawRightArm(): void
        -drawLeftLeg(): void
        -drawRightLeg(): void
    }
    
    class MessageDisplay {
        -container: HTMLElement
        -restartButton: HTMLButtonElement
        +constructor(containerId: string)
        +showVictory(word: string): void
        +showDefeat(word: string): void
        +showAttempts(current: number, max: number): void
        +clear(): void
        +attachRestartHandler(handler: Function): void
        +showRestartButton(): void
        +hideRestartButton(): void
    }
    
    %% CONTROLLER LAYER
    class GameController {
        -model: GameModel
        -view: GameView
        +constructor(model: GameModel, view: GameView)
        +initialize(): void
        +handleLetterClick(letter: string): void
        +handleRestartClick(): void
        -updateViewAfterGuess(result: GuessResult, letter: string): void
        -checkAndHandleGameEnd(): void
        -syncViewWithModel(): void
    }
    
    GameModel --> WordDictionary : uses
    GameModel --> GuessResult : returns
    GameView *-- WordDisplay : contains
    GameView *-- AlphabetDisplay : contains
    GameView *-- HangmanRenderer : contains
    GameView *-- MessageDisplay : contains
    GameController --> GameModel : coordinates
    GameController --> GameView : coordinates
```

## Main use case diagram
```mermaid
graph TB
    Player((Player))
    System((System/Browser))
    
    %% Core Gameplay Use Cases
    InitGame[Initialize Game]
    SelectLetter[Select Letter]
    ViewWord[View Word Progress]
    ViewAlphabet[View Available Letters]
    ViewHangman[View Hangman Drawing]
    
    %% Game End Use Cases
    WinGame[Win Game]
    LoseGame[Lose Game]
    ViewGameResult[View Game Result]
    RestartGame[Restart Game]
    
    %% Word Management
    SelectRandomWord[Select Random Word]
    ManageDictionary[Manage Animal Dictionary]
    
    %% Letter Processing
    CheckLetter[Check Letter in Word]
    RevealLetter[Reveal Correct Letter]
    RegisterFailedAttempt[Register Failed Attempt]
    UpdateHangman[Update Hangman Drawing]
    
    %% UI Updates
    UpdateUI[Update User Interface]
    DisplayMessage[Display End Game Message]
    
    %% Player interactions
    Player -->|starts| InitGame
    Player -->|clicks| SelectLetter
    Player -->|views| ViewWord
    Player -->|views| ViewAlphabet
    Player -->|views| ViewHangman
    Player -->|clicks| RestartGame
    Player -->|views| ViewGameResult
    
    %% System interactions
    System -->|triggers| SelectRandomWord
    System -->|maintains| ManageDictionary
    System -->|performs| CheckLetter
    System -->|executes| UpdateUI
    
    %% Include relationships
    InitGame -.->|includes| SelectRandomWord
    InitGame -.->|includes| ViewWord
    InitGame -.->|includes| ViewAlphabet
    InitGame -.->|includes| ViewHangman
    
    SelectLetter -.->|includes| CheckLetter
    
    CheckLetter -.->|includes| RevealLetter
    CheckLetter -.->|includes| RegisterFailedAttempt
    
    RegisterFailedAttempt -.->|includes| UpdateHangman
    
    RevealLetter -.->|includes| UpdateUI
    UpdateHangman -.->|includes| UpdateUI
    
    %% Extend relationships
    SelectLetter ..->|extends| WinGame
    SelectLetter ..->|extends| LoseGame
    
    WinGame -.->|includes| ViewGameResult
    LoseGame -.->|includes| ViewGameResult
    
    ViewGameResult -.->|includes| DisplayMessage
    
    RestartGame -.->|includes| InitGame
    
    SelectRandomWord -.->|includes| ManageDictionary
```

## Design patterns to apply
- **MVC Pattern:** Separation of concerns between Model (business logic), View (UI), Controller (coordination)
- **Observer Pattern:** Controller observes user events (letter clicks, restart) and updates Model/View accordingly
- **Composite Pattern:** GameView composes multiple display components (WordDisplay, AlphabetDisplay, HangmanRenderer, MessageDisplay)
- **Singleton Pattern (implied):** WordDictionary maintains single source of animal words

## Relevant non-functional requirements
- **Maintainability:** Modular code with clear separation of concerns (MVC)
- **Testability:** ≥80% code coverage with Jest unit tests
- **Performance:** UI updates < 200ms after letter selection
- **Responsiveness:** Works on desktop and mobile browsers
- **Code Quality:** ESLint with Google TypeScript Style Guide compliance
- **Documentation:** Complete JSDoc/TypeDoc documentation
- **CI/CD:** GitHub Actions for linting, testing, build, and deployment

---

# TASK

Generate the complete folder and file structure of the project starting from a current directory named 1-TheHangmanGame and following these specifications:

## Required structure:
- Clear separation of MVC layers according to the class diagram
- TypeScript naming conventions following the Google Style Guide
- Initial configuration for Vite, Jest, TypeDoc, ESLint
- Base documentation files (README.md, ARCHITECTURE.md)

## Expected deliverables:
1. Complete directory tree (src, docs, tests, config, public)
2. Configuration files (package.json, jest.config.js, jest.setup.js, tsconfig.json, typedoc.json, vite.config.ts, eslint.config.mjs)
3. Main classes/modules as empty skeletons with methods declared
4. README.md with setup instructions
5. Jest and ts-jest properly configured
6. Vite configured for TypeScript SPA
7. ESLint configured with Google Style Guide

---

# CONSTRAINTS

- DO NOT implement logic yet, only structure
- Use consistent nomenclature from class diagram and Google Style Guide
- Include appropriate .gitignore
- Prepare structure for testing from the start
- Configure Vite for TypeScript + Canvas API
- Include Bulma CSS framework integration
- The `1-TheHangmanGame` is a subdirectory from a repository that stores multiple independent projects, so be careful with the GitHub interactions.

---

# OUTPUT FORMAT

Provide:
1. Textual listing of the folder structure
2. Content of each configuration file
3. Skeletons of main classes with JSDoc comments
4. Brief justification of architectural decisions
5. Bash commands to initialize the project
6. Bash commands to install dependencies
7. Bash commands to configure the project
