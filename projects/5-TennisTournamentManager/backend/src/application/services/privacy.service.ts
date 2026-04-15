/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 5, 2026
 * @file backend/src/application/services/privacy.service.ts
 * @desc Backend privacy service for enforcing user data visibility rules (FR60)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {User} from '../../domain/entities/user.entity';
import {PrivacyLevel} from '../../domain/enumerations/privacy-level';
import {UserRole} from '../../domain/enumerations/user-role';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Registration} from '../../domain/entities/registration.entity';
import {Tournament} from '../../domain/entities/tournament.entity';
import {In} from 'typeorm';

/**
 * Default privacy settings applied when user has no custom settings.
 * 
 * Security Note: Sensitive personal information (email, phone, ID documents) 
 * defaults to ADMINS_ONLY for data protection compliance.
 */
const DEFAULT_PRIVACY_SETTINGS = {
  email: PrivacyLevel.ADMINS_ONLY,
  phone: PrivacyLevel.ADMINS_ONLY,
  telegram: PrivacyLevel.ADMINS_ONLY,
  whatsapp: PrivacyLevel.ADMINS_ONLY,
  avatar: PrivacyLevel.ALL_REGISTERED,
  ranking: PrivacyLevel.ALL_REGISTERED,
  history: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
  statistics: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
  idDocument: PrivacyLevel.ADMINS_ONLY,  // SECURITY: ID documents must always be admin-only
  allowContact: true,
};

/**
 * Privacy service for enforcing user data visibility based on privacy settings.
 * 
 * Implements FR60 - Player profile privacy enforcement.
 * Filters user data based on viewer's role, relationship, and profile owner's settings.
 */
export class PrivacyService {
  /**
   * Filters user data based on privacy settings and viewer context.
   * 
   * @param owner - Profile owner (user being viewed)
   * @param viewer - User viewing the profile (null if public/unauthenticated)
   * @param tournamentId - Optional tournament context
   * @returns Filtered user object with only accessible fields
   */
  public async filterUserData(
    owner: User,
    viewer: User | null,
    tournamentId?: string
  ): Promise<Partial<User>> {
    // Always include public fields
    const filtered: Partial<User> = {
      id: owner.id,
      username: owner.username,
      firstName: owner.firstName,
      lastName: owner.lastName,
      role: owner.role,
    };

    // Get privacy settings (use defaults if not set)
    const settings = owner.privacySettings || DEFAULT_PRIVACY_SETTINGS;

    // Rule 1: Owner always sees own data
    if (viewer && viewer.id === owner.id) {
      return this.removePasswordHash(owner);
    }

    // Rule 2: Admins always have full access
    // - SYSTEM_ADMIN: Full access to all users globally
    // - TOURNAMENT_ADMIN: Full access to users in their tournaments (if tournament context provided)
    if (viewer && await this.isAdminWithAccess(viewer, owner, tournamentId)) {
      return this.removePasswordHash(owner);
    }

    // Rule 3: Apply privacy levels for each field
    const fieldsToCheck: Array<{field: keyof User; privacyKey: keyof typeof DEFAULT_PRIVACY_SETTINGS}> = [
      {field: 'email', privacyKey: 'email'},
      {field: 'phone', privacyKey: 'phone'},
      {field: 'telegram', privacyKey: 'telegram'},
      {field: 'whatsapp', privacyKey: 'whatsapp'},
      {field: 'avatarUrl', privacyKey: 'avatar'},
      {field: 'ranking', privacyKey: 'ranking'},
      {field: 'idDocument', privacyKey: 'idDocument'},  // SECURITY: Always use dedicated idDocument privacy setting
    ];

    for (const {field, privacyKey} of fieldsToCheck) {
      // Skip allowContact as it's boolean, not PrivacyLevel
      if (privacyKey === 'allowContact') continue;
      
      const privacyLevel = settings[privacyKey] as PrivacyLevel;
      const canView = await this.canViewField(privacyLevel, viewer, owner, tournamentId);
      
      if (canView && owner[field] !== undefined) {
        (filtered as any)[field] = owner[field];
      }
    }

    // Handle allowContact (boolean field, not privacy level)
    if (settings.allowContact === true) {
      filtered.isActive = owner.isActive; // Show if contactable
    }

    return filtered;
  }

  /**
   * Checks if viewer can access a field at given privacy level.
   * 
   * @param level - Required privacy level
   * @param viewer - User viewing the data
   * @param owner - Profile owner
   * @param tournamentId - Tournament context
   * @returns True if access is granted
   */
  private async canViewField(
    level: PrivacyLevel,
    viewer: User | null,
    owner: User,
    tournamentId?: string
  ): Promise<boolean> {
    switch (level) {
      case PrivacyLevel.PUBLIC:
        return true;

      case PrivacyLevel.ALL_REGISTERED:
        return viewer !== null;

      case PrivacyLevel.TOURNAMENT_PARTICIPANTS:
        return await this.shareTournament(viewer, owner, tournamentId);

      case PrivacyLevel.ADMINS_ONLY:
        return viewer !== null && this.isAdmin(viewer);

      default:
        return false;
    }
  }

  /**
   * Checks if two users participate in the same tournament.
   * 
   * @param viewer - Viewing user
   * @param owner - Profile owner
   * @param tournamentId - Specific tournament ID (optional)
   * @returns True if users share a tournament
   */
  private async shareTournament(
    viewer: User | null,
    owner: User,
    tournamentId?: string
  ): Promise<boolean> {
    if (!viewer) {
      return false;
    }

    if (viewer.id === owner.id) {
      return true;
    }

    const registrationRepository = AppDataSource.getRepository(Registration);

    // If specific tournament provided, check that tournament only
    if (tournamentId) {
      const viewerRegs = await registrationRepository.find({
        where: {participantId: viewer.id, tournamentId},
      });
      const ownerRegs = await registrationRepository.find({
        where: {participantId: owner.id, tournamentId},
      });

      return viewerRegs.length > 0 && ownerRegs.length > 0;
    }

    // Otherwise, check if they share any tournament
    const viewerRegs = await registrationRepository.find({
      where: {participantId: viewer.id},
    });
    const ownerRegs = await registrationRepository.find({
      where: {participantId: owner.id},
    });

    const viewerTournaments = new Set(viewerRegs.map(r => r.tournamentId));
    const ownerTournaments = ownerRegs.map(r => r.tournamentId);

    return ownerTournaments.some(tid => viewerTournaments.has(tid));
  }

  /**
   * Checks if viewer is an admin with access to the owner's data.
   * 
   * @param viewer - User viewing the data
   * @param owner - User whose data is being viewed
   * @param tournamentId - Tournament context (optional)
   * @returns True if viewer is admin with appropriate access
   */
  private async isAdminWithAccess(viewer: User, owner: User, tournamentId?: string): Promise<boolean> {
    // System admins have global access
    if (viewer.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }
    
    // Tournament admins have access if:
    // 1. Tournament context is provided AND they manage that tournament
    // 2. OR owner is in any tournament they manage
    if (viewer.role === UserRole.TOURNAMENT_ADMIN) {
      // If tournament context provided, check if they manage it
      if (tournamentId) {
        const tournamentRepository = AppDataSource.getRepository(Tournament);
        const tournament = await tournamentRepository.findOne({
          where: {id: tournamentId, organizerId: viewer.id}
        });
        if (tournament) {
          return true; // Tournament admin manages this tournament
        }
      }
      
      // Otherwise, check if owner is in ANY tournament managed by this admin
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      // Get all tournaments managed by this admin
      const adminTournaments = await tournamentRepository.find({
        where: {organizerId: viewer.id},
        select: ['id']
      });
      
      if (adminTournaments.length === 0) {
        return false; // This tournament admin doesn't manage any tournaments
      }
      
      const tournamentIds = adminTournaments.map(t => t.id);
      
      // Check if owner is registered in any of these tournaments
      const ownerRegistration = await registrationRepository.findOne({
        where: {
          participantId: owner.id,
          tournamentId: In(tournamentIds)
        }
      });
      
      return !!ownerRegistration; // Has access if owner is in their tournament
    }
    
    return false;
  }

  /**
   * Checks if user is a system admin or tournament admin (role check only).
   * Note: Use isAdminWithAccess() for privacy filtering as it includes context verification.
   * 
   * @param user - User to check
   * @returns True if user is system admin or tournament admin
   */
  private isAdmin(user: User): boolean {
    return user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN;
  }

  /**
   * Removes password hash from user object.
   * 
   * @param user - User object
   * @returns User without passwordHash field
   */
  private removePasswordHash(user: User): Partial<User> {
    const {passwordHash, ...userWithoutPassword} = user;
    return userWithoutPassword;
  }

  /**
   * Gets default privacy settings.
   * 
   * @returns Default privacy configuration
   */
  public static getDefaultSettings(): Record<string, string | boolean> {
    return {...DEFAULT_PRIVACY_SETTINGS};
  }
}
