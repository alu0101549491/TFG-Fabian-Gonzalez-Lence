/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/interfaces/authorization-service.interface.ts
 * @desc Authorization service interface for role-based access control and permissions
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {UserRole} from '@domain/enumerations/user-role';

/**
 * Authorization service interface.
 * Handles role-based access control, permissions, and session validation.
 */
export interface IAuthorizationService {
  /**
   * Checks whether a user has a specific role.
   *
   * @param userId - ID of the user to check
   * @param role - Role to verify
   * @returns True if the user has the role, false otherwise
   */
  hasRole(userId: string, role: UserRole): Promise<boolean>;

  /**
   * Checks whether a user can perform an action on a resource.
   *
   * @param userId - ID of the user attempting the action
   * @param action - Action to perform (e.g., 'create', 'update', 'delete')
   * @param resourceId - ID of the resource being accessed
   * @returns True if the action is allowed, false otherwise
   */
  canPerformAction(userId: string, action: string, resourceId: string): Promise<boolean>;

  /**
   * Checks whether a user has access to a tournament.
   *
   * @param userId - ID of the user
   * @param tournamentId - ID of the tournament
   * @returns True if the user can access the tournament, false otherwise
   */
  canAccessTournament(userId: string, tournamentId: string): Promise<boolean>;

  /**
   * Validates that the user's session is still valid (30 min timeout per NFR12).
   *
   * @param userId - ID of the user
   * @returns True if the session is valid, false otherwise
   */
  validateSession(userId: string): Promise<boolean>;

  /**
   * Checks whether a user can modify a specific bracket.
   *
   * @param userId - ID of the user
   * @param bracketId - ID of the bracket
   * @returns True if the user can modify the bracket, false otherwise
   */
  canModifyBracket(userId: string, bracketId: string): Promise<boolean>;
}
