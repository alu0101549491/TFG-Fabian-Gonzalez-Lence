# Initial

I've created a UML use case diagram for the Hangman game application. Here's what the diagram represents:

**Actors:**

- **Player**: The human user who interacts with the game by selecting letters and restarting games
- **System**: The automated system that manages game logic and state

**Main Use Cases:**

1. **Initialize Game** - Sets up a new game with a random word
2. **Select Letter** - Player clicks on an alphabet letter
3. **Reveal Correct Letters** - Shows all occurrences of a correct letter
4. **Register Failed Attempt** - Increments the counter for wrong guesses
5. **Update Hangman Drawing** - Adds a new part to the hangman (6 progressive states)
6. **Check Victory Condition** - Determines if player has won
7. **Check Defeat Condition** - Determines if player has lost (6 failed attempts)
8. **Display Victory/Defeat Messages** - Shows game outcome
9. **Restart Game** - Resets the game with a new word
10. **Disable Selected Letter** - Prevents re-selection of used letters
11. **Select Random Word** - Chooses a word from the animal dictionary

**Relationships:**

- Solid arrows (→) show actor-to-use-case associations
- Dashed arrows with "includes" show mandatory dependencies
- Dashed arrows with conditions show conditional flows

The diagram captures all functional requirements (FR1-FR10) from your specification, showing the complete game flow from initialization through letter selection to game completion and restart.

```mermaid
graph TB
    subgraph "Hangman Game System"
        UC1[Initialize Game]
        UC2[Select Letter]
        UC3[Reveal Correct Letters]
        UC4[Register Failed Attempt]
        UC5[Update Hangman Drawing]
        UC6[Check Victory Condition]
        UC7[Check Defeat Condition]
        UC8[Display Victory Message]
        UC9[Display Defeat Message]
        UC10[Restart Game]
        UC11[Disable Selected Letter]
        UC12[Select Random Word]
    end
    
    Player((Player))
    System((System))
    
    Player -->|clicks alphabet| UC2
    Player -->|clicks restart button| UC10
    
    System -.->|initiates| UC1
    System -.->|manages| UC12
    
    UC1 -->|includes| UC12
    UC1 -.->|displays| UC11
    
    UC2 -->|includes| UC11
    UC2 -.->|if correct| UC3
    UC2 -.->|if incorrect| UC4
    
    UC4 -->|includes| UC5
    
    UC3 -.->|triggers| UC6
    UC5 -.->|triggers| UC7
    
    UC6 -.->|on success| UC8
    UC7 -.->|on 6 attempts| UC9
    
    UC8 -.->|enables| UC10
    UC9 -.->|enables| UC10
    
    UC10 -->|includes| UC1
    
    style Player fill:#4A90E2
    style System fill:#E24A4A
    style UC1 fill:#90EE90
    style UC2 fill:#FFD700
    style UC10 fill:#90EE90
```