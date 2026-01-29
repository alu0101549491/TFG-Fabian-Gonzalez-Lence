/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 29, 2026
 * @file src/models/special-cards/jokers/economic-joker.ts
 * @desc Joker that provides monetary benefits outside scoring.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/3-MiniBalatro}
 * @see {@link https://typescripttutorial.net}
 */

import { Joker } from './joker';
import { ScoreContext } from '../../scoring/score-context';
import { JokerPriority } from './joker-priority.enum';

/**
 * Economic jokers provide monetary benefits (like +$X at end of blind)
 * rather than affecting hand scoring.
 * 
 * These jokers do NOT modify chips, mult, or multipliers during scoring.
 * Their effects are applied outside the scoring system (e.g., in GameController).
 * 
 * Examples:
 * - Golden Joker: +$2 at end of each passed level
 * - Greedy Joker: +$X per remaining hand
 */
export class EconomicJoker extends Joker {
  /**
   * Creates an economic joker that doesn't affect scoring.
   * @param id - Unique identifier
   * @param name - Display name
   * @param description - Effect description (typically includes "+$")
   * @param value - Monetary value (how much $ it provides)
   */
  constructor(
    id: string,
    name: string,
    description: string,
    public readonly value: number
  ) {
    // Economic jokers have no priority since they don't affect scoring
    // Use CHIPS as placeholder (but applyEffect is a no-op)
    super(id, name, description, JokerPriority.CHIPS);
  }

  /**
   * Economic jokers do NOT affect hand scoring.
   * This method intentionally does nothing.
   * @param _context - Unused score context
   */
  public applyEffect(_context: ScoreContext): void {
    // No-op: Economic effects are applied outside the scoring system
    // (e.g., in GameController when blind is completed)
  }

  /**
   * Economic jokers never activate during scoring.
   * @returns Always false
   */
  public canActivate(_context: ScoreContext): boolean {
    return false;
  }

  /**
   * Gets the monetary value this joker provides.
   * @returns Dollar amount
   */
  public getValue(): number {
    return this.value;
  }
}
