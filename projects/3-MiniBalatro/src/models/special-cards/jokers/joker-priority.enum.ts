// ============================================
// FILE: src/models/special-cards/jokers/joker-priority.enum.ts
// ============================================

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
