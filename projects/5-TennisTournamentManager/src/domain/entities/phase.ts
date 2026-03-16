/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/phase.ts
 * @desc Entity representing a phase/round within a bracket (e.g., Round of 16, Quarterfinals, Semifinals, Final).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Properties for creating a Phase entity.
 */
export interface PhaseProps {
  /** Unique identifier for the phase. */
  id: string;
  /** ID of the bracket this phase belongs to. */
  bracketId: string;
  /** Name of the phase (e.g., "Quarterfinals", "Group A - Round 1"). */
  name: string;
  /** Ordering index (1 = first phase, ascending). */
  order: number;
  /** Number of matches in this phase. */
  matchCount?: number;
  /** Whether all matches in this phase are completed. */
  isCompleted?: boolean;
}

/**
 * Represents a phase (round) within a tournament bracket.
 *
 * In knockout brackets, phases are sequential rounds (R16, QF, SF, F).
 * In round-robin brackets, phases represent matchday rounds.
 */
export class Phase {
  public readonly id: string;
  public readonly bracketId: string;
  public readonly name: string;
  public readonly order: number;
  public readonly matchCount: number;
  public readonly isCompleted: boolean;

  constructor(props: PhaseProps) {
    this.id = props.id;
    this.bracketId = props.bracketId;
    this.name = props.name;
    this.order = props.order;
    this.matchCount = props.matchCount ?? 0;
    this.isCompleted = props.isCompleted ?? false;
  }

  /**
   * Checks whether all matches in this phase have been completed.
   *
   * @returns True if the phase is fully completed
   */
  public isPhaseCompleted(): boolean {
    throw new Error('Not implemented');
  }
}
