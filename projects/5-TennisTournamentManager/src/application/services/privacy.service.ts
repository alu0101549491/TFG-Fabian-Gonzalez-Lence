/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file src/application/services/privacy.service.ts
 * @desc Service for privacy management and visibility control (FR58-FR60, NFR11-NFR14)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, inject} from '@angular/core';
import {User} from '@domain/entities/user';
import {UserRole} from '@domain/enumerations/user-role';
import {PrivacyLevel} from '@domain/enumerations/privacy-level';
import {PrivacySettings} from '@domain/value-objects/privacy-settings';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';

/**
 * Context information for privacy checks.
 * Provides relationship data between users.
 */
export interface PrivacyContext {
  /** User requesting access (viewer). */
  viewer: User | null;
  /** User being viewed (profile owner). */
  owner: User;
  /** Whether viewer and owner share a tournament. */
  shareTournament?: boolean;
  /** Tournament ID for context. */
  tournamentId?: string;
}

/**
 * Result of a privacy check operation.
 */
export interface PrivacyCheckResult {
  /** Whether access is allowed. */
  allowed: boolean;
  /** Reason for denial (if denied). */
  reason?: string;
  /** Privacy level evaluated. */
  level: PrivacyLevel;
}

/**
 * Service for managing user privacy settings and data visibility.
 * 
 * Implements business rules for data access control based on:
 * - User roles (admin, tournament admin, player, public)
 * - Privacy levels (admins only, tournament participants, all registered, public)
 * - Contextual relationships (same tournament, etc.)
 * 
 * **Privacy Hierarchy:**
 * 1. Administrators always have full access
 * 2. Profile owner always has full access to own data
 * 3. Privacy level determines access for others
 * 4. Context (same tournament) may grant additional access
 * 
 * @example
 * ```typescript
 * const privacyService = inject(PrivacyService);
 * 
 * // Check if viewer can see owner's email
 * const canSeeEmail = await privacyService.canViewField(
 *   'email',
 *   viewer,
 *   owner,
 *   tournamentId
 * );
 * 
 * // Filter user DTO to remove inaccessible fields
 * const filteredDto = await privacyService.filterUserDto(
 *   userDto,
 *   viewer,
 *   tournamentId
 * );
 * ```
 */
@Injectable({providedIn: 'root'})
export class PrivacyService {
  private readonly registrationRepository = inject(RegistrationRepositoryImpl);

  /**
   * Checks if a viewer can access a specific field of a user profile.
   *
   * @param fieldName - Name of the field to check (email, phone, etc.)
   * @param context - Privacy check context
   * @returns Privacy check result with allowed flag
   */
  public async canViewField(
    fieldName: keyof PrivacySettings,
    context: PrivacyContext
  ): Promise<PrivacyCheckResult> {
    const {viewer, owner} = context;
    const privacyLevel = owner.privacySettings[fieldName];

    // Special handling for allowContact field (boolean, not privacy level)
    if (fieldName === 'allowContact') {
      return {
        allowed: owner.privacySettings.allowContact,
        level: PrivacyLevel.PUBLIC,
      };
    }

    // Ensure privacy level is valid
    if (!Object.values(PrivacyLevel).includes(privacyLevel as PrivacyLevel)) {
      throw new Error(`Invalid privacy level for field ${fieldName}: ${privacyLevel}`);
    }

    // **Rule 1: Owner always sees own data**
    if (viewer && viewer.id === owner.id) {
      return {
        allowed: true,
        level: privacyLevel as PrivacyLevel,
      };
    }

    // **Rule 2: Administrators always have full access**
    if (viewer && this.isAdmin(viewer)) {
      return {
        allowed: true,
        level: privacyLevel as PrivacyLevel,
      };
    }

    // **Rule 3: Check privacy level**
    const allowed = await this.checkPrivacyLevel(
      privacyLevel as PrivacyLevel,
      context
    );

    if (allowed) {
      return {
        allowed: true,
        level: privacyLevel as PrivacyLevel,
      };
    }

    // Access denied
    return {
      allowed: false,
      reason: `Field '${fieldName}' requires ${privacyLevel} access`,
      level: privacyLevel as PrivacyLevel,
    };
  }

  /**
   * Checks if a viewer can access a user profile at a given privacy level.
   *
   * @param level - Privacy level required
   * @param context - Privacy check context
   * @returns True if access is granted
   */
  private async checkPrivacyLevel(
    level: PrivacyLevel,
    context: PrivacyContext
  ): Promise<boolean> {
    const {viewer, owner} = context;

    switch (level) {
      case PrivacyLevel.PUBLIC:
        // Anyone can view public data
        return true;

      case PrivacyLevel.ALL_REGISTERED:
        // Requires authentication
        return viewer !== null;

      case PrivacyLevel.TOURNAMENT_PARTICIPANTS:
        // Requires same tournament participation
        return await this.shareTournament(viewer, owner, context.tournamentId);

      case PrivacyLevel.ADMINS_ONLY:
        // Requires admin role
        return viewer !== null && this.isAdmin(viewer);

      default:
        // Unknown privacy level - deny by default
        return false;
    }
  }

  /**
   * Checks if two users participate in the same tournament.
   *
   * @param viewer - Viewing user
   * @param owner - Profile owner
   * @param tournamentId - Tournament ID for context (optional)
   * @returns True if users share a tournament
   */
  private async shareTournament(
    viewer: User | null,
    owner: User,
    tournamentId?: string
  ): Promise<boolean> {
    // Viewer must be authenticated
    if (!viewer) {
      return false;
    }

    // Same user always shares tournaments with themselves
    if (viewer.id === owner.id) {
      return true;
    }

    // If specific tournament provided, check that tournament only
    if (tournamentId) {
      const viewerRegistrations = await this.registrationRepository.findByParticipantId(viewer.id);
      const ownerRegistrations = await this.registrationRepository.findByParticipantId(owner.id);

      const viewerInTournament = viewerRegistrations.some(r => r.tournamentId === tournamentId);
      const ownerInTournament = ownerRegistrations.some(r => r.tournamentId === tournamentId);

      return viewerInTournament && ownerInTournament;
    }

    // Otherwise, check if they share any tournament
    const viewerRegistrations = await this.registrationRepository.findByParticipantId(viewer.id);
    const ownerRegistrations = await this.registrationRepository.findByParticipantId(owner.id);

    const viewerTournaments = new Set(viewerRegistrations.map(r => r.tournamentId));
    const ownerTournaments = ownerRegistrations.map(r => r.tournamentId);

    // Check for tournament intersection
    return ownerTournaments.some(tournamentId => viewerTournaments.has(tournamentId));
  }

  /**
   * Checks if a user has administrator privileges.
   *
   * @param user - User to check
   * @returns True if user is SYSTEM_ADMIN or TOURNAMENT_ADMIN
   */
  private isAdmin(user: User): boolean {
    return user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN;
  }

  /**
   * Filters a user DTO to remove fields the viewer cannot access.
   *
   * @param userDto - Full user DTO
   * @param viewer - Viewing user
   * @param owner - Profile owner
   * @param tournamentId - Tournament context (optional)
   * @returns Filtered user DTO with only accessible fields
   */
  public async filterUserDto(
    userDto: Record<string, unknown>,
    viewer: User | null,
    owner: User,
    tournamentId?: string
  ): Promise<Record<string, unknown>> {
    const context: PrivacyContext = {
      viewer,
      owner,
      tournamentId,
    };

    const filtered: Record<string, unknown> = {
      id: userDto.id,
      username: userDto.username,
      // Public fields always included
      firstName: userDto.firstName,
      lastName: userDto.lastName,
    };

    // Check each privacy-controlled field
    const fieldsToCheck: Array<keyof PrivacySettings> = [
      'email',
      'phone',
      'telegram',
      'whatsapp',
      'avatar',
      'ranking',
      'history',
      'statistics',
    ];

    for (const field of fieldsToCheck) {
      const result = await this.canViewField(field, context);
      if (result.allowed && userDto[field] !== undefined) {
        filtered[field] = userDto[field];
      }
    }

    return filtered;
  }

  /**
   * Updates a user's privacy settings.
   *
   * @param userId - User ID to update
   * @param newSettings - New privacy settings
   * @returns Updated privacy settings
   * @throws Error if validation fails
   */
  public updatePrivacySettings(
    userId: string,
    newSettings: Partial<PrivacySettings>
  ): PrivacySettings {
    // Validate user ID
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    // Validate privacy levels
    const validLevels = Object.values(PrivacyLevel);
    for (const [key, value] of Object.entries(newSettings)) {
      // Skip allowContact field (boolean, not privacy level)
      if (key === 'allowContact') {
        continue;
      }

      if (value && !validLevels.includes(value as PrivacyLevel)) {
        throw new Error(`Invalid privacy level for ${key}: ${value}`);
      }
    }

    // Create new privacy settings (immutable)
    return new PrivacySettings(newSettings);
  }
}
