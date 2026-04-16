/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file domain/enumerations/confirmation-status.ts
 * @desc Enumeration for match result confirmation states (FR25-FR26).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Match result confirmation status enumeration.
 * 
 * Workflow:
 * - Participant enters result → PENDING_CONFIRMATION
 * - Opponent confirms → CONFIRMED
 * - Opponent disputes → DISPUTED (requires admin action)
 * - Admin enters/validates result → CONFIRMED (immediate)
 * - Admin annuls match → ANNULLED
 */
export enum ConfirmationStatus {
  /** Result has not been entered yet */
  NOT_ENTERED = 'NOT_ENTERED',
  
  /** Result entered by participant, awaiting opponent confirmation */
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  
  /** Result confirmed by opponent or validated by administrator */
  CONFIRMED = 'CONFIRMED',
  
  /** Result disputed by opponent, requires administrator review */
  DISPUTED = 'DISPUTED',
  
  /** Match result annulled by administrator (match cancelled) */
  ANNULLED = 'ANNULLED',
  
  /** Administrator is reviewing a disputed result */
  UNDER_REVIEW = 'UNDER_REVIEW'
}
