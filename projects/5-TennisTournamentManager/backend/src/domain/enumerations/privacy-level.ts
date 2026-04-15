/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 5, 2026
 * @file backend/src/domain/enumerations/privacy-level.ts
 * @desc Privacy level enumeration for user data visibility control (FR58-FR60)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Privacy levels for controlling user data visibility.
 * 
 * Defines hierarchical access control:
 * - PUBLIC: Anyone can view (including unregistered users)
 * - ALL_REGISTERED: All authenticated users can view
 * - TOURNAMENT_PARTICIPANTS: Users in same tournament can view
 * - ADMINS_ONLY: Only system/tournament admins can view
 */
export enum PrivacyLevel {
  /**
   * Anyone can view, including public (unauthenticated) users.
   * Lowest privacy level - highest visibility.
   */
  PUBLIC = 'PUBLIC',

  /**
   * All registered (authenticated) users can view.
   * Requires login but no specific relationship.
   */
  ALL_REGISTERED = 'ALL_REGISTERED',

  /**
   * Users participating in the same tournament can view.
   * Context-aware privacy based on tournament relationships.
   */
  TOURNAMENT_PARTICIPANTS = 'TOURNAMENT_PARTICIPANTS',

  /**
   * Only system administrators and tournament administrators can view.
   * Highest privacy level - lowest visibility.
   */
  ADMINS_ONLY = 'ADMINS_ONLY',
}
