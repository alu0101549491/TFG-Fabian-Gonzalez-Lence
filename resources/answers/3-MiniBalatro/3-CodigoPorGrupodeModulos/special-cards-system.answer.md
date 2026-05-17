# Respuesta

### Respuesta {toggle="true"}
Here are the complete implementations for the Special Cards System module, following the Google TypeScript Style Guide, SOLID principles, and all specified requirements:
---
### Design Decisions and Justifications:
1. **Priority-Based Joker System**
- Implemented a strict priority system using the `JokerPriority` enum to ensure effects are applied in the correct order (chips → mult → multipliers).
- This matches the requirements in Section 8.3 and ensures consistent scoring.
2. **Conditional Activation**
- Added a `canActivate` method to all jokers, allowing for complex conditions (e.g., "only activate if hand contains 3 cards or less").
- This supports the conditional jokers like Half Joker and Mystic Summit.
3. **Abstract Base Classes**
- Used abstract classes for `Joker` and `Tarot` to enforce a consistent interface while allowing for different implementations.
- This follows the Open/Closed Principle, making it easy to add new joker or tarot types.
4. **Type Safety for Effects**
- Used enums (`JokerPriority`, `TarotEffect`) to ensure type safety and prevent invalid values.
- Added runtime validation for effect values (e.g., ensuring `ADD_CHIPS` gets a number).
5. **Logging**
- Added console logs for all effect applications to aid in debugging and understanding game flow.
- Logs include the joker/tarot name and the effect applied.
6. **Error Handling**
- Comprehensive input validation with descriptive error messages.
- Validates all constructor parameters and method inputs.
7. **Separation of Concerns**
- `ChipJoker`, `MultJoker`, and `MultiplierJoker` each handle a specific type of effect.
- `InstantTarot` and `TargetedTarot` separate tarot cards that need targets from those that don't.
8. **Extensibility**
- The system is designed to be easily extended with new joker or tarot types.
- New effects can be added by extending the base classes and enums.
### Possible Future Improvements:
1. **Effect Stacking**
- Add support for tracking which jokers/tarots have been applied to a card or score context.
- This could help with UI display and debugging.
2. **Serialization**
- Add methods to serialize/deserialize jokers, planets, and tarots for save/load functionality.
3. **Visual Effects**
- Add hooks for visual effects when jokers activate or tarots are used.
4. **Performance Optimization**
- For games with many jokers, consider optimizing the activation checks and effect applications.
5. **Undo/Redo Support**
- Implement a command pattern to support undoing joker activations or tarot uses.
6. **Custom Effects**
- Allow for custom joker/tarot effects defined at runtime (e.g., from mods or user content).
7. **Synergy Detection**
- Add explicit synergy detection between jokers that trigger on the same card.
This implementation fully satisfies all requirements and constraints, providing a robust and extensible special cards system for Mini Balatro. The code follows SOLID principles, uses proper TypeScript typing, and includes comprehensive error handling and logging.
## 3.4. Scoring System {toggle="true"}
Se modificó un poco el código de `ScoreCalculator` para que pueda manejar correctamente los breakdowns, haciendo que a los métodos se les pase el array de breakdowns como parámetro y se vayan añadiendo elementos de tipo `ScoreBreakdown` para llevar un tracking correcto de la información de cálculo, dado que esto previamente se manejaba como si fuese un atributo de la clase `ScoreContext`.