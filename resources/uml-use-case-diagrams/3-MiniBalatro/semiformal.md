# Initial

I've created a comprehensive UML use case diagram for the Balatro-inspired card game. Here's what the diagram represents:

**Actors:**

- **Player**: The human user who plays poker hands, manages cards, purchases items, and makes strategic decisions
- **System**: The automated system handling game logic, calculations, level progression, and persistence

**Use Case Groups:**

1. **Card Management** (FR1-FR6, FR30):
    - Deal, Select, Play, Discard cards
    - Preview Score before playing
    - Hand size management (8 cards max, 5 selectable)
2. **Hand Recognition & Scoring** (FR3, FR7-FR8, FR16):
    - Recognize poker hand types
    - Calculate scores with strict order: base → card values → joker effects
    - Apply synergies when multiple jokers trigger
3. **Level Progression** (FR9-FR11, FR18):
    - Check victory/defeat conditions
    - Progress through Small/Big/Boss Blinds
    - Grant monetary rewards
4. **Shop System** (FR19-FR21):
    - Display 4 random cards
    - Purchase jokers ($5), planets ($3), tarot ($3)
    - Reroll shop inventory
5. **Special Cards** (FR13-FR15):
    - Planet cards (permanent hand upgrades)
    - Tarot cards (consumable effects)
    - Joker cards (persistent bonuses)
6. **Boss Mechanics** (FR22-FR27):
    - Five boss types with unique restrictions
    - Applied every third level
7. **Game Management** (FR17, FR28-FR29):
    - Save/Load game state
    - Economy management ($5 starting money)
    - New game initialization

**Key Relationships:**

- Solid arrows (→) show direct player interactions
- Dashed arrows (-.→) show system-triggered or conditional flows
- "includes" shows mandatory dependencies between use cases

The diagram captures all 35 functional requirements, emphasizing the complex scoring system with strict calculation order, the three-tiered level structure, and the strategic depth of managing three card types simultaneously.

```mermaid
graph TB
    subgraph "Balatro-Inspired Card Game System"
        subgraph "Card Management"
            UC1[Deal Initial Hand]
            UC2[Select Cards]
            UC3[Play Poker Hand]
            UC4[Discard Cards]
            UC5[Replace Discarded Cards]
            UC30[Preview Score]
        end
        
        subgraph "Hand Recognition & Scoring"
            UC6[Recognize Poker Hand Type]
            UC7[Calculate Base Score]
            UC8[Apply Card Values]
            UC9[Apply Joker Effects]
            UC10[Calculate Final Score]
            UC16[Apply Synergies]
        end
        
        subgraph "Level Progression"
            UC11[Check Victory Condition]
            UC12[Check Defeat Condition]
            UC13[Progress to Next Level]
            UC18[Grant Level Rewards]
            UC22[Activate Boss Blind]
        end
        
        subgraph "Shop System"
            UC14[Open Shop]
            UC15[Display Shop Cards]
            UC19[Purchase Card]
            UC20[Purchase Joker]
            UC21[Reroll Shop]
        end
        
        subgraph "Special Cards"
            UC23[Apply Planet Upgrade]
            UC24[Use Tarot Card]
            UC25[Activate Joker Bonus]
        end
        
        subgraph "Boss Mechanics"
            UC26[Apply The Wall Effect]
            UC27[Apply The Water Effect]
            UC28[Apply The Mouth Effect]
            UC29[Apply The Needle Effect]
            UC31[Apply The Flint Effect]
        end
        
        subgraph "Game Management"
            UC32[Save Game State]
            UC33[Load Saved Game]
            UC34[Start New Game]
            UC35[Manage Economy]
        end
    end
    
    Player((Player))
    System((System))
    
    %% Player Actions
    Player -->|starts| UC34
    Player -->|loads| UC33
    Player -->|selects 1-5 cards| UC2
    Player -->|plays selected| UC3
    Player -->|discards selected| UC4
    Player -->|enters| UC14
    Player -->|buys| UC19
    Player -->|rerolls| UC21
    Player -->|uses| UC24
    Player -->|views| UC30
    
    %% System Actions
    System -.->|initiates| UC1
    System -.->|evaluates| UC6
    System -.->|calculates| UC10
    System -.->|checks| UC11
    System -.->|checks| UC12
    System -.->|manages| UC32
    System -.->|controls| UC35
    System -.->|triggers every 3rd level| UC22
    
    %% Card Management Flow
    UC1 -.->|deals 8 cards| UC2
    UC2 -->|maximum 5| UC30
    UC3 -->|includes| UC6
    UC4 -->|includes| UC5
    UC5 -.->|refills hand| UC2
    
    %% Scoring Flow
    UC6 -->|includes| UC7
    UC7 -->|includes| UC8
    UC8 -->|includes| UC9
    UC9 -->|includes| UC16
    UC9 -->|includes| UC10
    UC10 -.->|updates total| UC11
    
    %% Joker Application
    UC9 -.->|activates| UC25
    UC25 -.->|may trigger| UC16
    
    %% Level Progression
    UC11 -.->|on success| UC18
    UC11 -.->|on success| UC13
    UC12 -.->|on failure| UC34
    UC18 -->|includes| UC35
    UC13 -.->|opens| UC14
    UC13 -.->|every 3rd| UC22
    
    %% Shop Flow
    UC14 -->|includes| UC15
    UC15 -.->|displays 4 cards| UC19
    UC19 -.->|if joker| UC20
    UC19 -.->|if planet| UC23
    UC19 -->|includes| UC35
    UC21 -->|includes| UC15
    UC21 -->|includes| UC35
    
    %% Special Cards
    UC20 -.->|adds to inventory| UC25
    UC23 -.->|permanently upgrades| UC7
    UC24 -.->|modifies deck or| UC35
    
    %% Boss Blinds
    UC22 -.->|random selection| UC26
    UC22 -.->|random selection| UC27
    UC22 -.->|random selection| UC28
    UC22 -.->|random selection| UC29
    UC22 -.->|random selection| UC31
    UC26 -.->|modifies goal| UC11
    UC27 -.->|disables| UC4
    UC28 -.->|restricts| UC6
    UC29 -.->|limits| UC3
    UC31 -.->|modifies| UC7
    
    %% Persistence
    UC32 -.->|auto-saves| UC33
    UC34 -->|includes| UC1
    UC34 -->|includes| UC35
    
    style Player fill:#4A90E2
    style System fill:#E24A4A
    style UC3 fill:#90EE90
    style UC10 fill:#FFD700
    style UC19 fill:#FFD700
    style UC22 fill:#FF6B6B
    style UC32 fill:#DDA0DD
```