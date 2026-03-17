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
  /** ID of the tournament this phase belongs to. */
  tournamentId: string;
  /** Name of the phase (e.g., "Quarterfinals", "Group A - Round 1"). */
  name: string;
  /** Ordering index (1 = first phase, ascending). */
  sequenceOrder: number;
  /** Number of matches in this phase. */
  matchCount?: number;
  /** ID of the next phase in sequence (null if final phase). */
  nextPhaseId?: string | null;
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
  public readonly tournamentId: string;
  public readonly name: string;
  public readonly sequenceOrder: number;
  public readonly matchCount: number;
  public readonly nextPhaseId: string | null;
  public readonly isCompleted: boolean;

  constructor(props: PhaseProps) {
    this.id = props.id;
    this.tournamentId = props.tournamentId;
    this.name = props.name;
    this.sequenceOrder = props.sequenceOrder;
    this.matchCount = props.matchCount ?? 0;
    this.nextPhaseId = props.nextPhaseId ?? null;
    this.isCompleted = props.isCompleted ?? false;
  }

  /**
   * Links this phase to the next phase in the sequence.
   *
   * @param phaseId - The ID of the next phase
   */
  public linkToNextPhase(phaseId: string): void {
    throw new Error('Not implemented');
  }
}
