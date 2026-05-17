# Respuesta

### Respuesta {toggle="true"}
Here are the complete implementations for the Core Models module, following the Google TypeScript Style Guide, SOLID principles, and all specified requirements:
---
### Design Decisions and Justifications:
1. **UUID for Card IDs**
- Used the `uuid` library to generate unique identifiers for each card.
- Ensures uniqueness even when cards are cloned (for Death tarot).
- Prevents ID collisions in complex game states.
2. **Fisher-Yates Shuffle**
- Chosen for its simplicity and efficiency (O(n) time complexity).
- Standard algorithm for shuffling arrays, well-documented and tested.
3. **Enum Exhaustiveness**
- All switch statements on enums include a default case that should theoretically never be reached.
- Provides a safety net and makes it clear when new enum values are added but not handled.
4. **Error Handling**
- Created a custom `DeckError` class for deck-related errors.
- Validates all method parameters and throws descriptive errors.
- Follows the principle of failing fast with clear error messages.
5. **Immutability**
- Card properties that shouldn't change after construction are marked as `readonly`.
- Arrays are not exposed directly; methods return copies or perform operations internally.
6. **Logging**
- Added console logs for critical operations (card creation, modifications, deck operations).
- Helps with debugging and understanding game flow.
7. **Separation of Concerns**
- Card value and suit logic is separated into their own enum files with helper functions.
- Deck management is handled by the Deck class, while Card handles individual card operations.
8. **Type Safety**
- Used TypeScript enums for card values and suits to ensure type safety.
- All methods have explicit return types and parameter types.
### Possible Future Improvements:
1. **Performance Optimization**
- For very large decks or frequent operations, consider optimizing the shuffle algorithm or using a more efficient data structure.
2. **Additional Tarot Effects**
- The current implementation supports the specified tarot effects, but could be extended for additional effects with minimal changes.
3. **Serialization**
- Add methods to serialize/deserialize deck and card states for save/load functionality.
4. **Undo/Redo Support**
- Could implement a command pattern to support undoing card modifications or deck operations.
5. **Custom Decks**
- Extend the Deck class to support custom decks (e.g., with jokers or special cards).
6. **Card Comparison**
- Add comparison methods to Card for sorting or poker hand evaluation.
This implementation fully satisfies all requirements and constraints, providing a solid foundation for the Mini Balatro game's core mechanics.
## 3.2. Poker Hand System {toggle="true"}