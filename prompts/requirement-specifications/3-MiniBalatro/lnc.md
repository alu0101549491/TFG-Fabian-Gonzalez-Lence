## **Core Gameplay**

### **Game Initialization**

- **[REQ-001]** **[Ubiquitous]** The system shall initialize a new game with a standard 52-card French deck, 5$ starting money, and no special cards.
- **[REQ-002]** **[Ubiquitous]** The system shall shuffle the deck and deal 8 cards to the player at the start of each level.

### **Hand Management**

- **[REQ-003]** **[Ubiquitous]** The system shall allow the player to select up to 5 cards from their 8-card hand to play a poker hand.
- **[REQ-004]** **[State-driven]** While the player has discards remaining, the system shall allow the player to discard cards up to 3 times per level.
- **[REQ-005]** **[Event-driven]** When the player discards cards, the system shall replace them with new cards from the deck.
- **[REQ-006]** **[Ubiquitous]** The system shall limit the player to 3 playable hands per level.

### **Scoring System**

- **[REQ-007]** **[Ubiquitous]** The system shall calculate the base score for each poker hand type as follows:
    - High Card: 5 chips × 1 mult
    - Pair: 10 chips × 2 mult
    - Two Pair: 20 chips × 2 mult
    - Three of a Kind: 30 chips × 3 mult
    - Straight: 30 chips × 4 mult
    - Flush: 35 chips × 4 mult
    - Full House: 40 chips × 4 mult
    - Four of a Kind: 60 chips × 7 mult
    - Straight Flush: 100 chips × 8 mult
- **[REQ-008]** **[Ubiquitous]** The system shall calculate the final score using the formula: `chips × mult`.
- **[REQ-009]** **[Ubiquitous]** The system shall display the current score and the level's target score to the player.

### **Level Progression**

- **[REQ-010]** **[Ubiquitous]** The system shall require the player to reach a target score to complete a level.
- **[REQ-011]** **[Ubiquitous]** The system shall increase the target score progressively for each new level.
- **[REQ-012]** **[Event-driven]** When the player reaches the target score within 3 hands, the system shall declare victory.
- **[REQ-013]** **[Event-driven]** When the player fails to reach the target score after 3 hands, the system shall declare defeat.

---

## **Special Cards**

### **Planet Cards**

- **[REQ-014]** **[Event-driven]** When a planet card is purchased, the system shall permanently increase the base chips and mult for a specific poker hand type:
    - Pluto (High Card): +10 chips, +1 mult
    - Mercury (Pair): +15 chips, +1 mult
    - Uranus (Two Pair): +20 chips, +1 mult
    - Venus (Three of a Kind): +20 chips, +2 mult
    - Saturn (Straight): +30 chips, +3 mult
    - Jupiter (Flush): +15 chips, +2 mult
    - Earth (Full House): +25 chips, +2 mult
    - Mars (Four of a Kind): +30 chips, +3 mult
    - Neptune (Straight Flush): +40 chips, +4 mult

### **Tarot Cards**

- **[REQ-015]** **[Event-driven]** When a tarot card is used, the system shall apply the following effects:
    - The Hermit: Doubles the player's current money.
    - The Empress: Adds +4 mult to a chosen card.
    - The Emperor: Adds +20 chips to a chosen card.
    - Strength: Increments a chosen card's rank (A→2→3→...→K→A).
    - The Hanged Man: Permanently removes a chosen card from the deck.
    - Death: Adds a duplicate of a chosen card to the deck.
    - The Star: Changes a chosen card's suit to Diamonds.
    - The Moon: Changes a chosen card's suit to Clubs.
    - The Sun: Changes a chosen card's suit to Hearts.
    - The World: Changes a chosen card's suit to Spades.

### **Joker Cards**

- **[REQ-016]** **[State-driven]** While a joker card is active, the system shall apply the following persistent effects:
    - Joker: +4 mult
    - Greedy Joker: +3 mult per Diamond card played
    - Lusty Joker: +3 mult per Heart card played
    - Wrathful Joker: +3 mult per Spade card played
    - Gluttonous Joker: +3 mult per Club card played
    - Half Joker: +20 mult if the played hand contains 3 or fewer cards
    - Joker Stencil: ×1 mult per empty joker slot
    - Mystic Summit: +15 mult if no discards remain
    - Fibonacci: +8 mult per A, 2, 3, 5, or 8 card played
    - Even Steven: +4 mult per even-value card played (10, 8, 6, 4, 2)
    - Odd Todd: +31 chips per odd-value card played (A, 9, 7, 5, 3)
    - Blue Joker: +2 chips per remaining card in the deck (max +104)
    - Hiker: +5 chips per card played (cumulative)
    - Golden Joker: +2$ at the end of each completed level
    - Triboulet: ×2 mult per K or Q card played

---

## **Economy and Shop**

### **Currency and Rewards**

- **[REQ-017]** **[Event-driven]** When the player completes a level, the system shall reward the player with money:
    - Small Blind: +2$
    - Big Blind: +5$
    - Boss Blind: +10$
- **[REQ-018]** **[Ubiquitous]** The system shall initialize the player with 5$ at the start of a new game.

### **Shop**

- **[REQ-019]** **[Event-driven]** After each level, the system shall display a shop offering 4 random special cards (jokers, planets, tarot).
- **[REQ-020]** **[Event-driven]** When the player has sufficient money, the system shall allow the player to purchase special cards:
    - Joker cards: 5$
    - Planet cards: 3$
    - Tarot cards: 3$
- **[REQ-021]** **[Event-driven]** When the player selects "Reroll", the system shall refresh the shop's offerings for a variable cost.
- **[REQ-022]** **[Ubiquitous]** The system shall allow the player to exit the shop without purchasing.

---

## **Level Types and Boss Blinds**

### **Level Types**

- **[REQ-023]** **[Ubiquitous]** The system shall include three sequential level types per round:
    - Small Blind: Target score = 1× base
    - Big Blind: Target score = 1.5× base
    - Boss Blind: Target score = 2× base (with special boss effects)

### **Boss Blinds**

- **[REQ-024]** **[Event-driven]** When a Boss Blind starts, the system shall randomly select and apply one of the following boss effects:
    - The Wall: Target score = 4× base
    - The Water: No discards allowed
    - The Mouth: Only one poker hand type allowed
    - The Needle: Only one hand can be played (target score = 1× base)
    - The Flint: Base chips and mult are halved for all hands

---

## **User Interface**

### **Game Screen**

- **[REQ-025]** **[Ubiquitous]** The system shall display the following areas on the game screen:
    - Current hand (8 cards)
    - Selected cards (up to 5)
    - "Play Hand" and "Discard" buttons
    - Remaining hands counter (max 3)
    - Remaining discards counter (max 3)
    - Current score and target score
    - Current level type (Small/Big/Boss Blind)
    - Preview of chips and mult for selected cards

### **Joker and Consumable Zones**

- **[REQ-026]** **[State-driven]** While jokers are active, the system shall display up to 5 active jokers and their effects.
- **[REQ-027]** **[State-driven]** While tarot cards are available, the system shall display up to 2 tarot cards and allow their use during the level.

### **Shop Screen**

- **[REQ-028]** **[Ubiquitous]** The system shall display 4 random cards for purchase, their prices, and the player's current balance.
- **[REQ-029]** **[Ubiquitous]** The system shall include a "Reroll" button to refresh the shop's offerings.

### **Additional Screens**

- **[REQ-030]** **[Ubiquitous]** The system shall include a main menu with options: New Game, Continue, Help, Exit.
- **[REQ-031]** **[Event-driven]** When the player wins, the system shall display a victory screen with a game summary.
- **[REQ-032]** **[Event-driven]** When the player loses, the system shall display a defeat screen with an option to retry or return to the menu.
- **[REQ-033]** **[Ubiquitous]** The system shall include a help panel explaining poker hands, special cards, and mechanics.

---

## **Game Flow**

- **[REQ-034]** **[Ubiquitous]** The system shall start a new game by initializing the deck, money, and dealing the first hand.
- **[REQ-035]** **[Ubiquitous]** The system shall allow the player to select cards, play hands, or discard cards until the level is completed or failed.
- **[REQ-036]** **[Event-driven]** When the player completes a level, the system shall reward the player and open the shop.
- **[REQ-037]** **[Event-driven]** When a Boss Blind starts, the system shall apply boss effects.
- **[REQ-038]** **[Event-driven]** When the player completes or fails all levels, the system shall end the game with a victory or defeat screen.

---

## **Synergies and Activation Order**

- **[REQ-039]** **[Compound]** When a card is played, the system shall detect and apply all applicable synergies in the following order:
    1. Base chips and mult for the poker hand.
    2. Individual card effects and synergies with active jokers.
    3. Joker effects in left-to-right order.
    4. Final score calculation: `chips × mult`.

---

## **Technical Considerations**

- **[REQ-040]** **[Ubiquitous]** The system shall be compatible with modern browsers (Chrome, Firefox, Edge).
- **[REQ-041]** **[Ubiquitous]** The system shall persist game data using JSON or localStorage.
- **[REQ-042]** **[Ubiquitous]** The system shall ensure all animations and UI elements respond within 1 second.
- **[REQ-043]** **[Ubiquitous]** The system shall include unit tests for hand calculations, joker effects, and boss mechanics.
- **[REQ-044]** **[Ubiquitous]** The system shall allow configuration of chip, mult, and cost values for balancing.