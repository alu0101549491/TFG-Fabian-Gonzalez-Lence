import {Joker} from './joker';
import {JokerPriority} from './joker-priority.enum';
import {ScoreContext} from '../../scoring/score-context';

/**
 * Joker that multiplies the current score.
 * Executes last in the scoring order.
 */
export class MultiplierJoker extends Joker {
  private multiplierValue: number;
  private condition: (context: ScoreContext) => boolean;

  /**
   * Creates a new MultiplierJoker instance.
   * @param {string} id - Unique identifier
   * @param {string} name - Display name
   * @param {string} description - Effect description
   * @param {number} multiplierValue - Multiplier to apply
   * @param {Function} condition - Activation condition
   */
  constructor(
      id: string,
      name: string,
      description: string,
      multiplierValue: number,
      condition: (context: ScoreContext) => boolean
  ) {
    super(id, name, description, JokerPriority.MULTIPLIER);
    this.multiplierValue = multiplierValue;
    this.condition = condition;
  }

  /**
   * Applies score multiplication to the context.
   * @param {ScoreContext} context - Current scoring context
   */
  public applyEffect(context: ScoreContext): void {
    // TODO: Implement score multiplication
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