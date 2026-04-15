/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/domain/enumerations/privacy-level.ts
 * @desc Enumeration for data visibility privacy levels (FR58-FR60, NFR11-NFR14)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

/**
 * Privacy levels for user data visibility.
 * 
 * Defines four levels of access control for personal information:
 * 
 * - **ADMINS_ONLY**: Only system and tournament administrators can view
 * - **TOURNAMENT_PARTICIPANTS**: Users in the same tournament can view
 * - **ALL_REGISTERED**: All registered users (authenticated) can view
 * - **PUBLIC**: Anyone (including unregistered users) can view
 * 
 * Used for contact data (email, phone, telegram, whatsapp), avatar,
 * personal information (age, ranking, history), and statistics.
 * 
 * @example
 * ```typescript
 * const privacySettings: PrivacySettings = {
 *   email: PrivacyLevel.ADMINS_ONLY,
 *   phone: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
 *   avatar: PrivacyLevel.PUBLIC,
 *   ranking: PrivacyLevel.ALL_REGISTERED,
 * };
 * ```
 */
export enum PrivacyLevel {
  /**
   * Only administrators (SYSTEM_ADMIN, TOURNAMENT_ADMIN) can view.
   * Highest privacy level - most restrictive.
   */
  ADMINS_ONLY = 'ADMINS_ONLY',

  /**
   * Users participating in the same tournament can view.
   * Contextual access - useful for coordinating schedules.
   */
  TOURNAMENT_PARTICIPANTS = 'TOURNAMENT_PARTICIPANTS',

  /**
   * All registered (authenticated) users can view.
   * Requires login but no tournament relationship needed.
   */
  ALL_REGISTERED = 'ALL_REGISTERED',

  /**
   * Anyone can view, including unregistered users.
   * Lowest privacy level - most permissive.
   */
  PUBLIC = 'PUBLIC',
}
