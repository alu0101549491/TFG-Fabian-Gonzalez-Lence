// ============================================
// FILE: src/models/scoring/score-breakdown.ts
// ============================================

/**
 * Records individual contribution to score calculation.
 * Enables detailed tracing and UI display of score sources.
 */
export class ScoreBreakdown {
  /**
   * Creates a breakdown entry for score tracing.
   * @param source - Name of the source
   * @param chipsAdded - Chips contributed by this source
   * @param multAdded - Mult contributed by this source
   * @param description - Human-readable description of effect
   * @throws Error if source or description is empty
   */
  constructor(
    public readonly source: string,
    public readonly chipsAdded: number,
    public readonly multAdded: number,
    public readonly description: string
  ) {
    if (!source || !description) {
      throw new Error('Source and description must not be empty');
    }
    if (chipsAdded < 0 || multAdded < 0) {
      throw new Error('Added values cannot be negative');
    }
  }
}
