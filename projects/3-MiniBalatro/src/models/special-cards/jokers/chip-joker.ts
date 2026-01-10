import {Joker} from './joker';
import {JokerPriority} from './joker-priority.enum';
import {ScoreContext} from '../../scoring/score-context';

/**
 * Joker that adds chip bonuses to the score.
 * Executes first in the scoring order.
 */
export class ChipJoker extends Joker {
  private chipValue: number;
  private condition: (context: ScoreContext) => boolean;

  /**
   * Creates a new ChipJoker instance.
   * @param {string} id - Unique identifier
   * @param {string} name - Display name
   * @param {string} description - Effect description
   * @param {number} chipValue - Chips to add
   * @param {Function} condition - Activation condition
   */
  constructor(
      id: string,
      name: string,
      description: string,
      chipValue: number,
      condition: (context: ScoreContext) => boolean
  ) {
    super(id, name, description, JokerPriority.CHIPS);
    this.chipValue = chipValue;
    this.condition = condition;
  }

  /**
   * Applies chip bonus to the context.
   * @param {ScoreContext} context - Current scoring context
   */
  public applyEffect(context: ScoreContext): void {
    // TODO: Implement chip addition
  }

  /**
   * Checks if this joker's condition is met.
   * @param {ScoreContext} context - Current scoring context
   * @return {boolean} True if condition is met
   */
  public canActivate(context: ScoreContext): boolean {
    return this.condition(context);
  }
}