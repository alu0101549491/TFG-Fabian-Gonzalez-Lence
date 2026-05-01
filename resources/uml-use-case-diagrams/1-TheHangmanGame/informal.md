# Initial

I've created a UML use case diagram for the Hangman game application. The diagram includes:

**Main Actors:**

- **Player**: The human user who plays the game
- **System**: The automated system components

**Primary Use Cases:**

1. **Start New Game** - Initializes a new game session
2. **Select Letter** - Player chooses a letter from the alphabet
3. **View Game State** - Player observes the current state of the game
4. **Restart Game** - Player starts over with a new word

**Included Use Cases (dependencies):**

- **Initialize Word Display** - Shows empty boxes for the word
- **Select Random Word** - Picks a word from the animal dictionary
- **Reveal Correct Letters** - Shows all occurrences of correct guesses
- **Register Failed Attempt** - Records incorrect guesses
- **Update Hangman Drawing** - Adds parts to the hangman figure
- **Check Game Completion** - Determines if the game has ended

**Extended Use Cases (conditional):**

- **View Victory Message** - Shown when player wins
- **View Defeat Message** - Shown when player loses

The diagram shows the relationships using:

- Solid arrows for direct associations
- Dashed arrows with "include" for mandatory dependencies
- Dashed arrows with "extend" for conditional behaviors

This captures all the main functional requirements from your specification!

```mermaid
graph TB
    subgraph "Hangman Game System"
        UC1[Start New Game]
        UC2[Select Letter]
        UC3[View Game State]
        UC4[Restart Game]
        UC5[View Victory Message]
        UC6[View Defeat Message]
        UC7[Initialize Word Display]
        UC8[Update Hangman Drawing]
        UC9[Reveal Correct Letters]
        UC10[Register Failed Attempt]
        UC11[Check Game Completion]
        UC12[Select Random Word]
    end
    
    Player((Player))
    System((System))
    
    Player --> UC1
    Player --> UC2
    Player --> UC3
    Player --> UC4
    
    UC1 -.->|include| UC12
    UC1 -.->|include| UC7
    
    UC2 -.->|include| UC11
    UC2 --> UC9
    UC2 --> UC10
    
    UC9 -.->|include| UC11
    
    UC10 -.->|include| UC8
    UC10 -.->|include| UC11
    
    UC11 -.->|extend| UC5
    UC11 -.->|extend| UC6
    
    UC4 -.->|include| UC1
    
    System --> UC12
    System --> UC8
    System --> UC11
    
    UC5 --> Player
    UC6 --> Player
```