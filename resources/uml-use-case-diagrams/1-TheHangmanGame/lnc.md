# Initial

I've created a comprehensive UML use case diagram for the Hangman game application. Here's what the diagram includes:

## **Key Elements:**

### **Actors:**

- **Player** - The end user playing the game
- **System/Browser** - Represents the automated system processes

### **Main Use Cases:**

1. **Core Gameplay** (Yellow):
    - Initialize Game
    - Select Letter
    - View Word Progress
    - View Available Letters
    - View Hangman Drawing
2. **Game End Scenarios** (Red):
    - Win Game
    - Lose Game
    - View Game Result
    - Restart Game
3. **System Functions** (Purple):
    - Select Random Word
    - Manage Animal Dictionary
    - Check Letter in Word
    - Reveal Correct Letter
    - Register Failed Attempt
    - Update Hangman Drawing
    - Update User Interface
    - Display End Game Message

### **Relationships:**

- **Solid arrows (→)**: Actor-to-use-case associations
- **Dashed arrows (-.->)**: «include» relationships (mandatory sub-functionality)
- **Dotted arrows (.->)**: «extend» relationships (conditional extensions)

The diagram maps all the requirements from REQ-001 through REQ-040, showing the complete interaction flow between the player and the system throughout the game lifecycle.

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
    
    %% Styling
    classDef playerStyle fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    classDef systemStyle fill:#50C878,stroke:#2E7D4E,stroke-width:3px,color:#fff
    classDef coreUseCase fill:#FFD700,stroke:#DAA520,stroke-width:2px
    classDef gameEndUseCase fill:#FF6B6B,stroke:#C92A2A,stroke-width:2px
    classDef systemUseCase fill:#B19CD9,stroke:#7B68A8,stroke-width:2px
    
    class Player playerStyle
    class System systemStyle
    class InitGame,SelectLetter,ViewWord,ViewAlphabet,ViewHangman coreUseCase
    class WinGame,LoseGame,ViewGameResult,RestartGame gameEndUseCase
    class SelectRandomWord,ManageDictionary,CheckLetter,RevealLetter,RegisterFailedAttempt,UpdateHangman,UpdateUI,DisplayMessage systemUseCase
```