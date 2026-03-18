/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/entities/match-result.ts
 * @desc Entity representing a match result submission with confirmation workflow (FR24-FR27).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {ConfirmationStatus} from '../enumerations/confirmation-status';

/**
 * Properties for creating a MatchResult entity.
 */
export interface MatchResultProps {
  /** Unique identifier for this result submission. */
  id: string;
  /** ID of the match this result belongs to. */
  matchId: string;
  /** ID of the user who submitted this result. */
  submittedBy: string;
  /** ID of the match winner. */
  winnerId: string;
  /** Set scores in order (e.g., ["6-4", "4-6", "7-5"]). */
  setScores: string[];
  /** Total games won by player 1. */
  player1Games: number;
  /** Total games won by player 2. */
  player2Games: number;
  /** Current confirmation status. */
  confirmationStatus?: ConfirmationStatus;
  /** ID of the user who confirmed/disputed (if applicable). */
  confirmedBy?: string | null;
  /** Timestamp when result was confirmed. */
  confirmedAt?: Date | null;
  /** Optional comments from the player who submitted. */
  playerComments?: string | null;
  /** Notes from administrator (for disputes or validations). */
  adminNotes?: string | null;
  /** Dispute reason if result was disputed. */
  disputeReason?: string | null;
  /** Timestamp when result was disputed. */
  disputedAt?: Date | null;
  /** Whether this result was submitted by an administrator. */
  isAdminEntry?: boolean;
  /** Creation timestamp. */
  createdAt?: Date;
  /** Last update timestamp. */
  updatedAt?: Date;
}

/**
 * Represents a match result submission with confirmation workflow.
 *
 * Workflow States (FR25-FR26):
 * 1. Participant submits result → PENDING_CONFIRMATION
 * 2. Opponent confirms → CONFIRMED (result is final)
 * 3. Opponent disputes → DISPUTED (admin must review)
 * 4. Admin validates/modifies → CONFIRMED
 * 5. Admin annuls → ANNULLED
 *
 * Admin submissions (FR27):
 * - Administrator entries skip confirmation and go directly to CONFIRMED
 */
export class MatchResult {
  public readonly id: string;
  public readonly matchId: string;
  public readonly submittedBy: string;
  public readonly winnerId: string;
  public readonly setScores: string[];
  public readonly player1Games: number;
  public readonly player2Games: number;
  public readonly confirmationStatus: ConfirmationStatus;
  public readonly confirmedBy: string | null;
  public readonly confirmedAt: Date | null;
  public readonly playerComments: string | null;
  public readonly adminNotes: string | null;
  public readonly disputeReason: string | null;
  public readonly disputedAt: Date | null;
  public readonly isAdminEntry: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: MatchResultProps) {
    this.id = props.id;
    this.matchId = props.matchId;
    this.submittedBy = props.submittedBy;
    this.winnerId = props.winnerId;
    this.setScores = props.setScores;
    this.player1Games = props.player1Games;
    this.player2Games = props.player2Games;
    this.confirmationStatus = props.confirmationStatus ?? ConfirmationStatus.PENDING_CONFIRMATION;
    this.confirmedBy = props.confirmedBy ?? null;
    this.confirmedAt = props.confirmedAt ?? null;
    this.playerComments = props.playerComments ?? null;
    this.adminNotes = props.adminNotes ?? null;
    this.disputeReason = props.disputeReason ?? null;
    this.disputedAt = props.disputedAt ?? null;
    this.isAdminEntry = props.isAdminEntry ?? false;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Confirms this result.
   * Can only be called on results in PENDING_CONFIRMATION or DISPUTED state.
   *
   * @param userId - ID of the user confirming the result
   */
  public confirm(userId: string): void {
    if (
      this.confirmationStatus !== ConfirmationStatus.PENDING_CONFIRMATION &&
      this.confirmationStatus !== ConfirmationStatus.DISPUTED &&
      this.confirmationStatus !== ConfirmationStatus.UNDER_REVIEW
    ) {
      throw new Error(
        `Cannot confirm result in status ${this.confirmationStatus}. ` +
        'Must be PENDING_CONFIRMATION, DISPUTED, or UNDER_REVIEW.'
      );
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required to confirm result.');
    }

    // Note: Actual status update should be done via repository in application layer
    // This method validates the business rule only
  }

  /**
   * Disputes this result.
   * Can only be called on results in PENDING_CONFIRMATION state.
   *
   * @param userId - ID of the user disputing the result
   * @param reason - Reason for the dispute
   */
  public dispute(userId: string, reason: string): void {
    if (this.confirmationStatus !== ConfirmationStatus.PENDING_CONFIRMATION) {
      throw new Error(
        `Cannot dispute result in status ${this.confirmationStatus}. ` +
        'Must be PENDING_CONFIRMATION.'
      );
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required to dispute result.');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Dispute reason is required.');
    }

    // Note: Actual status update should be done via repository in application layer
    // This method validates the business rule only
  }

  /**
   * Validates this result (administrator action).
   * Administrators can confirm any result regardless of current state.
   *
   * @param adminId - ID of the administrator validating the result
   * @param _notes - Optional admin notes (stored but not used in validation logic)
   */
  public validateAsAdmin(adminId: string, _notes?: string): void {
    if (!adminId || adminId.trim().length === 0) {
      throw new Error('Administrator ID is required.');
    }

    // Administrators can validate from any state
    // Note: Actual status update should be done via repository in application layer
    // This method validates the business rule only
  }

  /**
   * Annuls this result (administrator action).
   * Used when match is cancelled or result is invalid.
   *
   * @param adminId - ID of the administrator annulling the result
   * @param reason - Reason for annulment
   */
  public annul(adminId: string, reason: string): void {
    if (!adminId || adminId.trim().length === 0) {
      throw new Error('Administrator ID is required.');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Annulment reason is required.');
    }

    if (this.confirmationStatus === ConfirmationStatus.ANNULLED) {
      throw new Error('Result is already annulled.');
    }

    // Note: Actual status update should be done via repository in application layer
    // This method validates the business rule only
  }

  /**
   * Checks if this result can be confirmed by a specific user.
   *
   * @param userId - ID of the user attempting to confirm
   * @param match - The match entity to check player IDs
   * @returns True if the user can confirm this result
   */
  public canBeConfirmedBy(userId: string, match: {player1Id: string; player2Id: string}): boolean {
    // Must be in pending or disputed state
    if (
      this.confirmationStatus !== ConfirmationStatus.PENDING_CONFIRMATION &&
      this.confirmationStatus !== ConfirmationStatus.DISPUTED &&
      this.confirmationStatus !== ConfirmationStatus.UNDER_REVIEW
    ) {
      return false;
    }

    // User must be the opponent (not the submitter)
    if (userId === this.submittedBy) {
      return false;
    }

    // User must be one of the match players
    return userId === match.player1Id || userId === match.player2Id;
  }

  /**
   * Checks if this result can be disputed by a specific user.
   *
   * @param userId - ID of the user attempting to dispute
   * @param match - The match entity to check player IDs
   * @returns True if the user can dispute this result
   */
  public canBeDisputedBy(userId: string, match: {player1Id: string; player2Id: string}): boolean {
    // Must be in pending confirmation state
    if (this.confirmationStatus !== ConfirmationStatus.PENDING_CONFIRMATION) {
      return false;
    }

    // User must be the opponent (not the submitter)
    if (userId === this.submittedBy) {
      return false;
    }

    // User must be one of the match players
    return userId === match.player1Id || userId === match.player2Id;
  }
}
