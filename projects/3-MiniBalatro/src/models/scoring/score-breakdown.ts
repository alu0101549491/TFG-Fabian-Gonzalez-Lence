/**
 * Represents a single step in the score calculation breakdown.
 * Used for displaying how the final score was calculated.
 */
export class ScoreBreakdown {
  public source: string;
  public chipsAdded: number;
  public multAdded: number;
  public description: string;

  /**
   * Creates a new ScoreBreakdown instance.
   * @param {string} source - Source of the bonus (card, joker, etc.)
   * @param {number} chipsAdded - Chips added in this step
   * @param {number} multAdded - Mult added in this step
   * @param {string} description - Human-readable description
   */
  constructor(
      source: string,
      chipsAdded: number,
      multAdded: number,
      description: string
  ) {
    this.source = source;
    this.chipsAdded = chipsAdded;
    this.multAdded = multAdded;
    this.description = description;
  }
}