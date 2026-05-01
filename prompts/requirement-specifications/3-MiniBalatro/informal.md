## General Description

Card game inspired by the Balatro video game where the player must overcome scoring levels by playing poker hands with the French 52-card deck, complemented by special cards (planets, tarot, and jokers). The system includes level progression, shop purchase economy, and boss encounters every three levels. The goal is to maintain a controlled and understandable gameplay experience, optimized for AI generation.

## Main Game Mechanics

- Deal of 8-card hand at the start of each level
- Selection of up to 5 cards to play a poker hand
- Ability to discard cards up to 3 times per level
- Automatic replacement of discarded cards with new ones from the deck
- Limit of 3 playable hands per level
- Scoring system based on chips and multiplier (mult)
- Final score calculation using formula: chips × mult
- Level progression with increasing scoring goals
- Victory upon reaching the level's point goal
- Defeat when exhausting the 3 hands without reaching the goal

## Hand Types and Management

The player manages three types of hands simultaneously:

- **Main hand**: 8 cards from the base deck, renewable by discarding
- **Joker hand**: up to 5 persistent jokers that are not discarded
- **Consumable hand**: up to 2 tarot cards usable during the level

## Poker Hand Scoring System

Each type of poker hand has base chip and multiplier values:

- High Card: 5 chips × 1 mult
- Pair: 10 chips × 2 mult
- Two Pair: 20 chips × 2 mult
- Three of a Kind: 30 chips × 3 mult
- Straight: 30 chips × 4 mult
- Flush: 35 chips × 4 mult
- Full House: 40 chips × 4 mult
- Four of a Kind: 60 chips × 7 mult
- Straight Flush: 100 chips × 8 mult

## Scoring Calculation Order

When a hand is played, the system calculates the score following this strict order:

1. Start from the base chips and mult value of the played poker hand
2. Evaluate played cards one by one, adding:
    - Individual chip value of each card
    - Card synergies with active jokers
3. After evaluating all individual cards, apply persistent jokers in priority order:
    - Jokers that increase total chips
    - Jokers that increase total mult
    - Jokers that multiply total mult
    - Other joker effects
4. Calculate final score by multiplying total chips × total mult

## Planet Cards and Hand Upgrades

Planet cards permanently increase the level of a specific poker hand type:

- Pluto (High Card): +10 chips and +1 mult
- Mercury (Pair): +15 chips and +1 mult
- Uranus (Two Pair): +20 chips and +1 mult
- Venus (Three of a Kind): +20 chips and +2 mult
- Saturn (Straight): +30 chips and +3 mult
- Jupiter (Flush): +15 chips and +2 mult
- Earth (Full House): +25 chips and +2 mult
- Mars (Four of a Kind): +30 chips and +3 mult
- Neptune (Straight Flush): +40 chips and +4 mult

Planet effects are applied immediately upon purchasing the card and are permanent for the entire game.

## Tarot Cards and Their Effects

Tarot cards provide tactical effects and deck improvements:

- **The Hermit**: doubles the player's current money
- **The Empress**: choose a card to grant +4 mult when played
- **The Emperor**: choose a card to grant +20 chips when played
- **Strength**: choose a card to increment its value in sequence (A→2→3→4→5→6→7→8→9→10→J→Q→K→A)
- **The Hanged Man**: choose a card from the deck to destroy it permanently
- **Death**: choose a card to add a duplicate copy to the deck
- **The Star**: choose a card to change its suit to Diamonds
- **The Moon**: choose a card to change its suit to Clubs
- **The Sun**: choose a card to change its suit to Hearts
- **The World**: choose a card to change its suit to Spades

Tarot effects are applied when using the card from the consumable inventory.

## Joker Cards and Their Effects

Jokers provide persistent bonuses throughout the entire game:

- **Joker**: grants +4 mult
- **Greedy Joker**: +3 mult per Diamond card played
- **Lusty Joker**: +3 mult per Heart card played
- **Wrathful Joker**: +3 mult per Spade card played
- **Gluttonous Joker**: +3 mult per Club card played
- **Half Joker**: +20 mult if the played hand contains 3 cards or fewer
- **Joker Stencil**: ×1 mult per empty slot in the joker hand
- **Mystic Summit**: +15 mult if no discards remain available
- **Fibonacci**: each A, 2, 3, 5, or 8 played grants +8 mult
- **Even Steven**: +4 mult per even value card played (10, 8, 6, 4, 2)
- **Odd Todd**: +31 chips per odd value card played (A, 9, 7, 5, 3)
- **Blue Joker**: +2 chips per card remaining in the deck (maximum +104 with 52 cards)
- **Hiker**: each played card permanently gains +5 chips cumulatively
- **Golden Joker**: grants +2$ at the end of each level cleared
- **Triboulet**: each K or Q played multiplies total mult by ×2

## Economy System

- Player starts each game with 5$
- Rewards for clearing levels:
    - Small Blind: +2$
    - Big Blind: +5$
    - Boss Blind: +10$
- Shop costs:
    - Joker cards: 5$
    - Planet cards: 3$
    - Tarot cards: 3$
    - Shop reroll: variable cost according to implementation

## Shop Between Levels

- Appears automatically after clearing each level
- Shows 4 random cards (may include planets, tarot, or jokers)
- Allows purchasing cards if the player has enough money
- Includes reroll button to regenerate the 4 available cards
- Shows player's current balance clearly visible
- Player can exit the shop without buying to continue to the next level

## Level Types (Blinds)

Each round contains three sequential levels:

- **Small Blind**: scoring goal 1× round base
- **Big Blind**: scoring goal 1.5× round base
- **Boss Blind**: scoring goal 2× round base (with exceptions depending on boss)

## Boss Blinds and Their Special Effects

Boss blinds appear every third level with unique restrictions:

- **The Wall**: increases scoring goal to 4× round base
- **The Water**: level starts with 0 available discards
- **The Mouth**: only one specific poker hand type is allowed during the level
- **The Needle**: only one single hand can be played (goal reduced to 1× base)
- **The Flint**: base chips and mult of all played hands are halved

Bosses are randomly selected and their effects apply only during that specific level.

## Application Features

- Compatible with modern browsers (Chrome, Firefox, Edge)
- Clear and modular interface with differentiated zones
- Immediate response to player actions (less than 1 second latency)
- Data persistence through JSON or localStorage
- Ability to continue saved games
- Documented code organized in modules (deck, logic, UI, economy, shop, bosses)
- Unit tests for hand calculation, joker activation, and boss effects
- Simple animations or 2D pixel art style
- Clear visual feedback for card effects and bonuses

## User Interface

The UI must contain the following clearly differentiated areas:

- **Main play area**:
    - Current hand display (8 cards)
    - Selected cards indicator with visual limit of 5
    - "Play Hand" and "Discard" buttons
    - Remaining hands counter (max. 3)
    - Remaining discards counter (max. 3)
    - Accumulated points indicator in current level
    - Point goal to reach
    - Current level type (Small/Big/Boss Blind)
    - Chips and mult preview if cards are selected
- **Active jokers area**:
    - Permanent display of up to 5 jokers
    - Indication of activation order from left to right
- **Consumables area**:
    - Space for up to 2 tarot cards
    - Buttons to use tarot cards
- **Shop between levels**:
    - 4 random cards available for purchase
    - Visible price on each card
    - Reroll button with its cost
    - Player's current balance highlighted
    - Button to exit shop and continue
- **Additional screens**:
    - Main menu (New Game / Continue / Help / Exit)
    - Victory screen with game summary
    - Defeat screen with retry option
    - Help panel explaining poker hands, special cards, and mechanics

## Complete Game Flow

1. **Game start**:
    - Player begins with 5$ and no special cards
    - The 52-card deck is shuffled
    - First hand of 8 cards is dealt
2. **Level development**:
    - Player selects up to 5 cards from their hand
    - Can choose "Play Hand" or "Discard"
    - If playing hand, score is calculated according to poker type and effects
    - If discarding, receives new cards from the deck
    - Process repeats until using 3 hands or reaching goal
3. **Successful level completion**:
    - Money reward is granted according to blind type
    - Post-level joker effects are activated (like Golden Joker)
    - Shop appears with 4 random cards
    - Player can purchase cards or reroll
    - Upon exiting shop, advances to next level
4. **Boss Blind (every third level)**:
    - One of the 5 boss types is randomly selected
    - Special restrictions of chosen boss are applied
    - Level develops with modified rules
5. **Game end**:
    - **Victory**: upon clearing all programmed levels
    - **Defeat**: upon not reaching goal with 3 available hands
    - Shows corresponding screen with option to restart or return to menu

## Synergies and Activation Order

Synergies occur when a played card meets requirements of multiple jokers simultaneously. For example:

- If playing a K of Spades with Triboulet and Wrathful Joker active:
    1. Base chips of the K are added
    2. +3 mult is added for Wrathful Joker (Spade card)
    3. Total mult is multiplied by ×2 for Triboulet (K card)

The system must detect all applicable synergies and execute them in the correct established priority order.

## Restrictions and Exclusions

Not included in this version:

- Spectral cards or spectral effects
- Purchase vouchers or discounts
- Card packs (booster packs)
- Multiplayer mode or online connection
- Complex effects beyond specified planets, tarot, and jokers
- More than 5 boss blind types

## Additional Technical Considerations

- Progressive difficulty is achieved by increasing the base point goal for each completed round
- Visual design should prioritize readability over graphical complexity
- Animations should be simple and not interfere with game flow
- All chip, mult, and cost values should be configurable to facilitate balancing
- Implementation must strictly respect the described effect activation order