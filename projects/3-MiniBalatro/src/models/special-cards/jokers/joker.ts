import {JokerPriority} from './joker-priority.enum';
import {ScoreContext} from '../../scoring/score-context';

/**
 * Abstract base class for all joker cards.
 * Jokers apply special effects during score calculation.
 */
export abstract class Joker {
  protected id: string;
  protected name: string;
  protected description: string;
  protected priority: JokerPriority;

  /**
   * Creates a new Joker instance.
   * @param {string} id - Unique identifier
   * @param {string} name - Display name
   * @param {string} description - Effect description
   * @param {JokerPriority} priority - Execution priority
   */
  constructor(
      id: string,
      name: string,
      description: string,
      priority: JokerPriority
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.priority = priority;
  }

  /**
   * Applies the joker's effect to the score context.
   * @param {ScoreContext} context - Current scoring context
   */
  public abstract applyEffect(context: ScoreContext): void;

  /**
   * Checks if the joker can activate in the current context.
   * @param {ScoreContext} context - Current scoring context
   * @return {boolean} True if joker can activate
   */
  public abstract canActivate(context: ScoreContext): boolean;

  /**
   * Gets the execution priority of this joker.
   * @return {JokerPriority} Joker's priority
   */
  public getPriority(): JokerPriority {
    return this.priority;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }
}