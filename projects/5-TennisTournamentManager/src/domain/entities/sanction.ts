/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/sanction.ts
 * @desc Entity representing a sanction or penalty applied to a participant during a tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {SanctionType} from '../enumerations/sanction-type';

/**
 * Properties for creating a Sanction entity.
 */
export interface SanctionProps {
  /** Unique identifier for the sanction. */
  id: string;
  /** ID of the sanctioned participant. */
  participantId: string;
  /** ID of the tournament where the sanction was issued. */
  tournamentId: string;
  /** ID of the match related to the sanction (null if tournament-level). */
  matchId?: string | null;
  /** Type of sanction. */
  type: SanctionType;
  /** Description/reason for the sanction. */
  reason: string;
  /** Monetary fine amount (if applicable). */
  fineAmount?: number | null;
  /** Currency for the fine (ISO 4217). */
  fineCurrency?: string | null;
  /** ID of the administrator who issued the sanction. */
  issuedBy: string;
  /** Timestamp when the sanction was issued. */
  issuedAt?: Date;
  /** Whether the sanction has been appealed. */
  isAppealed?: boolean;
}

/**
 * Represents a sanction or penalty applied to a participant.
 *
 * Sanctions range from verbal warnings to suspensions and are part
 * of the incident management system. All sanctions are recorded for
 * audit purposes (NFR15).
 */
export class Sanction {
  public readonly id: string;
  public readonly participantId: string;
  public readonly tournamentId: string;
  public readonly matchId: string | null;
  public readonly type: SanctionType;
  public readonly reason: string;
  public readonly fineAmount: number | null;
  public readonly fineCurrency: string | null;
  public readonly issuedBy: string;
  public readonly issuedAt: Date;
  public readonly isAppealed: boolean;

  constructor(props: SanctionProps) {
    this.id = props.id;
    this.participantId = props.participantId;
    this.tournamentId = props.tournamentId;
    this.matchId = props.matchId ?? null;
    this.type = props.type;
    this.reason = props.reason;
    this.fineAmount = props.fineAmount ?? null;
    this.fineCurrency = props.fineCurrency ?? null;
    this.issuedBy = props.issuedBy;
    this.issuedAt = props.issuedAt ?? new Date();
    this.isAppealed = props.isAppealed ?? false;
  }

  /**
   * Checks whether this sanction involves a monetary fine.
   *
   * @returns True if the sanction includes a fine amount
   */
  public hasFine(): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether this sanction results in match disqualification.
   *
   * @returns True if the sanction type is DISQUALIFICATION
   */
  public isDisqualification(): boolean {
    throw new Error('Not implemented');
  }
}
