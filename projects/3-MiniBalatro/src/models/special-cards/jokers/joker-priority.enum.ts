/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/joker-priority.enum.ts
 * @desc JokerPriority enumeration for effect application order.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Enum defining joker effect application priority.
 * Enforces strict scoring calculation order as per requirements.
 */
export enum JokerPriority {
  CHIPS = 1,      // Priority 1: Applied first (chip additions)
  MULT = 2,       // Priority 2: Applied second (mult additions)
  MULTIPLIER = 3  // Priority 3: Applied last (mult multipliers)
}

/**
 * Returns the numeric priority value for sorting.
 * @param priority - The JokerPriority value
 * @returns The numeric priority (1, 2, or 3)
 */
export function getPriorityValue(priority: JokerPriority): number {
  return priority;
}
