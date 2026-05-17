# Respuesta

### Respuesta {toggle="true"}
Here's the complete implementation for the GameState class, following the requirements and design principles:
---
### Design Decisions and Justifications:
1. **State Management**
- Implemented a comprehensive state management system that tracks all game aspects (deck, hand, jokers, consumables, blind, money, etc.).
- This centralizes game logic and ensures consistency across all game operations.
2. **Inventory Limits**
- Enforced the 5-joker and 2-tarot inventory limits as specified in the requirements.
- Added methods to replace existing items when limits are reached.
3. **Game Flow Enforcement**
- Implemented strict rules for hand playing and discarding, including validation of remaining hands/discards.
- Added checks for level completion and game over conditions.
4. **Economy System**
- Implemented money tracking with methods for adding and spending money.
- Added support for level rewards and special bonuses (Golden Joker).
5. **Boss Blind Handling**
- Added special handling for boss blinds, including modifier application.
- Implemented the progression pattern (Small → Big → Boss) through the BlindGenerator.
6. **Error Handling**
- Added comprehensive input validation and error handling for all operations.
- Throws descriptive errors for invalid operations (e.g., playing with no hands remaining).
7. **Immutability**
- Used defensive copying for getter methods to prevent external modification of internal state.
- Made properties private to enforce controlled access.
8. **Logging**
- Added console logging for all major operations to aid in debugging and understanding game flow.
9. **Extensibility**
- Designed the system to be easily extended for new game mechanics or special cards.
- Used interfaces and abstract classes where appropriate to allow for future expansion.
10. **Separation of Concerns**
- Delegated specialized operations to their respective classes (e.g., score calculation to ScoreCalculator).
- Kept the GameState class focused on coordination and state management.
### Possible Future Improvements:
1. **Persistence**
- Add methods to serialize/deserialize the game state for save/load functionality.
2. **Undo/Redo Support**
- Implement a command pattern to support undoing actions like discards or joker additions.
3. **Advanced Boss Effects**
- Add more sophisticated handling for boss effects, especially The Mouth's hand type restriction.
4. **Deck Management**
- Implement automatic reshuffling of the discard pile when the deck runs low.
5. **Performance Optimization**
- For games with many levels, consider optimizing state management and calculations.
6. **Event System**
- Add an event system to notify UI components of state changes.
7. **Statistical Tracking**
- Add tracking of game statistics (e.g., hands played, jokers used) for analytics.
8. **Custom Game Modes**
- Add support for custom game rules or starting conditions.
This implementation provides a complete game state management system that integrates all the previously implemented subsystems (core models, poker hands, special cards, scoring, and blinds) into a cohesive whole. It enforces all game rules and provides the necessary methods for the controller layer to drive the game flow.
## 3.7. Controllers {toggle="true"}
Se añadió un getter para la clase `GameState` para obtener su `UpgradeManager`, dado que `GameController` necesitaba tener acceso al mismo.