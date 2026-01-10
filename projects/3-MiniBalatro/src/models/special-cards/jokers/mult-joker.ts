import {Joker} from './joker';
import {JokerPriority} from './joker-priority.enum';
import {ScoreContext} from '../../scoring/score-context';

/**
 * Joker that adds multiplier bonuses to the score.
 * Executes second in the scoring order.
 */
export class MultJoker extends Joker {
  private multValue: number;
  private condition: (context: ScoreContext) => boolean;

  /**
   * Creates a new MultJoker instance.
   * @param {string} id - Unique identifier
   * @param {string} name - Display name
   * @param {string} description - Effect description
   * @param {number} multValue - Multiplier to add
   * @param {Function} condition - Activation condition
   */
  constructor(
      id: string,
      name: string,
      description: string,
      multValue: number,
      condition: (context: ScoreContext) => boolean
  ) {
    super(id, name, description, JokerPriority.MULT);
    this.multValue = multValue;
    this.condition = condition;
  }

  /**
   * Applies multiplier bonus to the context.
   * @param {ScoreContext} context - Current scoring context
   */
  public applyEffect(context: ScoreContext): void {
    // TODO: Implement mult addition
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