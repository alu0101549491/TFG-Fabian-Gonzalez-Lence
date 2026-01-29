/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/tarots/tarot-effect.enum.ts
 * @desc TarotEffect enumeration for all tarot card effect types.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enum defining all tarot card effect types.
 */
export enum TarotEffect {
  ADD_CHIPS = 'ADD_CHIPS',         // The Emperor
  ADD_MULT = 'ADD_MULT',           // The Empress
  CHANGE_SUIT = 'CHANGE_SUIT',     // The Star, Moon, Sun, World
  UPGRADE_VALUE = 'UPGRADE_VALUE', // Strength
  DUPLICATE = 'DUPLICATE',         // Death
  DESTROY = 'DESTROY'              // The Hanged Man
}