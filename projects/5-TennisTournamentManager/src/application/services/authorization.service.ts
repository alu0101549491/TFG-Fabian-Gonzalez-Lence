/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file src/application/services/authorization.service.ts
 * @desc Authorization service implementation for role-based access control
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Injectable, inject} from '@angular/core';
import {IAuthorizationService} from '../interfaces/authorization-service.interface';
import {UserRole} from '@domain/enumerations/user-role';
import {UserRepositoryImpl} from '@infrastructure/repositories/user.repository';
import {TournamentRepositoryImpl} from '@infrastructure/repositories/tournament.repository';
import {BracketRepositoryImpl} from '@infrastructure/repositories/bracket.repository';

/**
 * Authorization service implementation.
 * Handles role-based access control, permissions, and session validation.
 */
@Injectable({providedIn: 'root'})
export class AuthorizationService implements IAuthorizationService {
  private readonly userRepository = inject(UserRepositoryImpl);
  private readonly tournamentRepository = inject(TournamentRepositoryImpl);
  private readonly bracketRepository = inject(BracketRepositoryImpl);

  /**
   * Checks whether a user has a specific role.
   *
   * @param userId - ID of the user to check
   * @param role - Role to verify
   * @returns True if the user has the role, false otherwise
   */
  public async hasRole(userId: string, role: UserRole): Promise<boolean> {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      return false;
    }
    
    if (!role) {
      return false;
    }
    
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return false;
    }
    
    // Check role
    return user.role === role;
  }

  /**
   * Checks whether a user can perform an action on a resource.
   *
   * @param userId - ID of the user attempting the action
   * @param action - Action to perform (e.g., 'create', 'update', 'delete')
   * @param resourceId - ID of the resource being accessed
   * @returns True if the action is allowed, false otherwise
   */
  public async canPerformAction(userId: string, action: string, resourceId: string): Promise<boolean> {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      return false;
    }
    
    if (!action || action.trim().length === 0) {
      return false;
    }
    
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return false;
    }
    
    // System administrators can do everything
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }
    
    // Tournament administrators can manage any tournament
    if (user.role === UserRole.TOURNAMENT_ADMIN) {
      return true;
    }
    
    // Tournament organizers can manage their own tournaments
    if (this.tournamentRepository) {
      const tournament = await this.tournamentRepository.findById(resourceId);
      if (tournament && tournament.organizerId === userId) {
        return true;
      }
    }
    
    // Registered participants can view public resources
    if (action === 'read' || action === 'view') {
      return true;
    }
    
    return false;
  }

  /**
   * Checks whether a user has access to a tournament.
   *
   * @param userId - ID of the user
   * @param tournamentId - ID of the tournament
   * @returns True if the user can access the tournament, false otherwise
   */
  public async canAccessTournament(userId: string, tournamentId: string): Promise<boolean> {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      return false;
    }
    
    if (!tournamentId || tournamentId.trim().length === 0) {
      return false;
    }
    
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return false;
    }
    
    // All active users can access public tournaments
    return true;
  }

  /**
   * Validates that the user's session is still valid (30 min timeout per NFR12).
   *
   * @param userId - ID of the user
   * @returns True if the session is valid, false otherwise
   */
  public async validateSession(userId: string): Promise<boolean> {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      return false;
    }
    
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return false;
    }
    
    // In real implementation, check session timeout (30 minutes as per NFR12)
    // This would involve checking last activity timestamp from session store
    // For now, just verify user exists and is active
    return true;
  }

  /**
   * Checks whether a user can modify a bracket.
   *
   * @param userId - ID of the user
   * @param bracketId - ID of the bracket
   * @returns True if the user can modify the bracket, false otherwise
   */
  public async canModifyBracket(userId: string, bracketId: string): Promise<boolean> {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      return false;
    }
    
    if (!bracketId || bracketId.trim().length === 0) {
      return false;
    }
    
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return false;
    }
    
    // System administrators can modify all brackets
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }
    
    // Tournament administrators can modify any brackets
    if (user.role === UserRole.TOURNAMENT_ADMIN) {
      return true;
    }
    
    // Tournament organizers can modify brackets in their tournaments
    if (this.bracketRepository && this.tournamentRepository) {
      const bracket = await this.bracketRepository.findById(bracketId);
      if (bracket) {
        const tournament = await this.tournamentRepository.findById(bracket.tournamentId);
        if (tournament && tournament.organizerId === userId) {
          return true;
        }
      }
    }
    
    return false;
  }
}
