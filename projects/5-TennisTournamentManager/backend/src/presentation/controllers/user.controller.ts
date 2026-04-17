/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/user.controller.ts
 * @desc User controller handling user profile operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {User} from '../../domain/entities/user.entity';
import {Match} from '../../domain/entities/match.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {Tournament} from '../../domain/entities/tournament.entity';
import {UserRole} from '../../domain/enumerations/user-role';
import {MatchStatus} from '../../domain/enumerations/match-status';
import {TournamentStatus} from '../../domain/enumerations/tournament-status';
import {PrivacyLevel} from '../../domain/enumerations/privacy-level';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {ImageOptimizationService} from '../../application/services/image-optimization.service';
import {PrivacyService} from '../../application/services/privacy.service';
import {generateId} from '../../shared/utils/id-generator';
import {In} from 'typeorm';

/**
 * User controller.
 */
export class UserController {
  private readonly imageService: ImageOptimizationService;
  private readonly privacyService: PrivacyService;

  /**
   * Creates an instance of UserController.
   */
  public constructor() {
    this.imageService = new ImageOptimizationService();
    this.privacyService = new PrivacyService();
  }
  /**
   * GET /api/users/:id
   * Retrieves user by ID with privacy filtering applied (FR60).
   * 
   * Privacy enforcement:
   * - Filters response based on viewer's role and relationship
   * - Owner always sees all own fields
   * - Admins always see all fields
   * - Other users see fields based on privacy settings
   * 
   * Query params:
   * - tournamentId: Tournament context for privacy checks (optional)
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {tournamentId} = req.query;
      const userRepository = AppDataSource.getRepository(User);
      
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Get viewer from JWT token (null if not authenticated)
      const viewer = req.user ? await userRepository.findOne({where: {id: req.user.id}}) : null;
      
      // Apply privacy filtering
      const filteredUser = await this.privacyService.filterUserData(
        user,
        viewer || null,
        tournamentId as string | undefined
      );
      
      // Calculate statistics if viewer has permission
      const canViewStats = await this.canViewStatistics(user, viewer, tournamentId as string | undefined);
      if (canViewStats) {
        const statistics = await this.calculateUserStatistics(user.id);
        (filteredUser as any).statistics = statistics;
      }
      
      // Fetch match history if viewer has permission
      const canViewHistory = await this.canViewHistory(user, viewer, tournamentId as string | undefined);
      if (canViewHistory) {
        const matchHistory = await this.getMatchHistory(user.id);
        (filteredUser as any).matchHistory = matchHistory;
      }
      
      res.status(HTTP_STATUS.OK).json(filteredUser);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Fetches match history for a user.
   * Returns recent matches ordered by date (newest first).
   * 
   * @param userId - User ID to fetch match history for
   * @returns Array of match history items
   */
  private async getMatchHistory(userId: string): Promise<any[]> {
    const matchRepository = AppDataSource.getRepository(Match);
    
    // Find all matches where user participated (limit to last 20)
    const matches = await matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.bracket', 'bracket')
      .leftJoinAndSelect('bracket.tournament', 'tournament')
      .leftJoinAndSelect('match.participant1', 'participant1')
      .leftJoinAndSelect('match.participant2', 'participant2')
      .where('(match.participant1Id = :userId OR match.participant2Id = :userId)', {userId})
      .andWhere('match.status = :status', {status: MatchStatus.COMPLETED})
      .orderBy('match.endTime', 'DESC')
      .take(20)
      .getMany();
    
    // Transform to match history DTOs
    return matches.map(match => {
      const isParticipant1 = match.participant1Id === userId;
      const opponent = isParticipant1 ? match.participant2 : match.participant1;
      const result = match.winnerId === userId ? 'win' : 'loss';
      
      return {
        id: match.id,
        tournamentName: match.bracket?.tournament?.name || 'Unknown Tournament',
        tournamentId: match.bracket?.tournament?.id || '',
        opponentName: opponent ? `${opponent.firstName} ${opponent.lastName}` : 'Unknown Opponent',
        opponentId: opponent?.id || '',
        result,
        score: match.score,
        date: match.endTime || match.createdAt,
        round: match.round
      };
    });
  }
  
  /**
   * Checks if viewer can see user match history based on privacy settings.
   * 
   * @param owner - User whose history is being viewed
   * @param viewer - User viewing the history (null if not authenticated)
   * @param tournamentId - Tournament context (optional)
   * @returns True if viewer can see match history
   */
  private async canViewHistory(
    owner: User,
    viewer: User | null,
    tournamentId?: string
  ): Promise<boolean> {
    // Owner can always see own history
    if (viewer && viewer.id === owner.id) {
      return true;
    }
    
    // Get privacy settings
    const settings = owner.privacySettings || {};
    const historyPrivacy = settings.history || PrivacyLevel.TOURNAMENT_PARTICIPANTS;
    
    // Check privacy level
    switch (historyPrivacy) {
      case PrivacyLevel.PUBLIC:
        return true;
      
      case PrivacyLevel.ALL_REGISTERED:
        return viewer !== null;
      
      case PrivacyLevel.TOURNAMENT_PARTICIPANTS:
        return await this.privacyService['shareTournament'](viewer, owner, tournamentId);
      
      case PrivacyLevel.ADMINS_ONLY:
        return viewer !== null && (
          viewer.role === UserRole.SYSTEM_ADMIN || 
          viewer.role === UserRole.TOURNAMENT_ADMIN
        );
      
      default:
        return false;
    }
  }
  
  /**
   * Calculates user statistics from their match history.
   * 
   * @param userId - User ID to calculate statistics for
   * @returns Statistics object with wins, losses, tournaments, etc.
   */
  private async calculateUserStatistics(userId: string): Promise<any> {
    const matchRepository = AppDataSource.getRepository(Match);
    const registrationRepository = AppDataSource.getRepository(Registration);
    const tournamentRepository = AppDataSource.getRepository(Tournament);
    
    // Find all completed matches where user participated
    const completedMatches = await matchRepository.find({
      where: [
        {participant1Id: userId, status: MatchStatus.COMPLETED},
        {participant2Id: userId, status: MatchStatus.COMPLETED}
      ]
    });
    
    // Calculate wins and losses
    const wins = completedMatches.filter(match => match.winnerId === userId).length;
    const losses = completedMatches.length - wins;
    const winRate = completedMatches.length > 0 ? (wins / completedMatches.length) * 100 : 0;
    
    // Find user's registrations
    const registrations = await registrationRepository.find({
      where: {participantId: userId},
      relations: ['tournament']
    });
    
    // Count active and completed tournaments
    const tournamentIds = registrations.map(r => r.tournamentId);
    const tournaments = tournamentIds.length > 0 
      ? await tournamentRepository.find({where: {id: In(tournamentIds)}})
      : [];
    
    const activeTournaments = tournaments.filter(t => 
      t.status === TournamentStatus.DRAFT || 
      t.status === TournamentStatus.REGISTRATION_OPEN ||
      t.status === TournamentStatus.IN_PROGRESS
    ).length;
    
    const completedTournaments = tournaments.filter(t => 
      t.status === TournamentStatus.FINALIZED
    ).length;
    
    return {
      totalMatches: completedMatches.length,
      wins,
      losses,
      winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
      activeTournaments,
      completedTournaments
    };
  }
  
  /**
   * Checks if viewer can see user statistics based on privacy settings.
   * 
   * @param owner - User whose statistics are being viewed
   * @param viewer - User viewing the statistics (null if not authenticated)
   * @param tournamentId - Tournament context (optional)
   * @returns True if viewer can see statistics
   */
  private async canViewStatistics(
    owner: User,
    viewer: User | null,
    tournamentId?: string
  ): Promise<boolean> {
    // Owner can always see own statistics
    if (viewer && viewer.id === owner.id) {
      return true;
    }
    
    // Get privacy settings
    const settings = owner.privacySettings || {};
    const statsPrivacy = settings.statistics || PrivacyLevel.TOURNAMENT_PARTICIPANTS;
    
    // Check privacy level
    switch (statsPrivacy) {
      case PrivacyLevel.PUBLIC:
        return true;
      
      case PrivacyLevel.ALL_REGISTERED:
        return viewer !== null;
      
      case PrivacyLevel.TOURNAMENT_PARTICIPANTS:
        return await this.privacyService['shareTournament'](viewer, owner, tournamentId);
      
      case PrivacyLevel.ADMINS_ONLY:
        return viewer !== null && (
          viewer.role === UserRole.SYSTEM_ADMIN || 
          viewer.role === UserRole.TOURNAMENT_ADMIN
        );
      
      default:
        return false;
    }
  }
  
  /**
   * PUT /api/users/:id
   * Updates user profile.
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);
      
      // Verify user owns this profile or is admin
      if (req.user?.id !== id && req.user?.role !== UserRole.SYSTEM_ADMIN) {
        throw new AppError('Cannot update other users profiles', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }
      
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      const {username, firstName, lastName, phone, telegram, whatsapp, idDocument, ranking} = req.body;
      
      // Validate username is not empty if provided (username is required field)
      if (username !== undefined) {
        if (!username || username.trim() === '') {
          throw new AppError('Username cannot be empty', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
        }
      }
      
      // Validate firstName and lastName are not empty if provided (required fields)
      if (firstName !== undefined && (!firstName || firstName.trim() === '')) {
        throw new AppError('First name cannot be empty', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }
      if (lastName !== undefined && (!lastName || lastName.trim() === '')) {
        throw new AppError('Last name cannot be empty', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }
      
      // Check username uniqueness if changing
      if (username && username !== user.username) {
        const existingUsername = await userRepository.findOne({where: {username}});
        if (existingUsername) {
          throw new AppError('Username already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.ALREADY_EXISTS);
        }
        user.username = username;
      }
      
      // Check ID/NIE uniqueness if changing (FR9 - unique identification)
      if (idDocument !== undefined && idDocument !== null && idDocument.trim() !== '') {
        const trimmedDoc = idDocument.trim();
        if (trimmedDoc !== user.idDocument) {
          const existingIdDoc = await userRepository.findOne({where: {idDocument: trimmedDoc}});
          if (existingIdDoc && existingIdDoc.id !== user.id) {
            throw new AppError('This ID/NIE document is already registered to another user', HTTP_STATUS.CONFLICT, ERROR_CODES.ALREADY_EXISTS);
          }
          user.idDocument = trimmedDoc;
        }
      } else if (idDocument === null || idDocument === '') {
        user.idDocument = null;
      }
      
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (telegram !== undefined) user.telegram = telegram;
      if (whatsapp !== undefined) user.whatsapp = whatsapp;
      if (ranking !== undefined) user.ranking = ranking;
      
      await userRepository.save(user);
      
      const {passwordHash, ...userWithoutPassword} = user;
      
      res.status(HTTP_STATUS.OK).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/users/eligible-participants
   * Lists users eligible for tournament registration (tournament admin and system admin).
   * Returns only PLAYER role users with active status.
   */
  /**
   * GET /api/users/eligible-participants
   * Retrieves eligible players for tournament registration with privacy filtering.
   * 
   * Privacy enforcement:
   * - Each user in the list is filtered based on viewer's relationship
   * - Only active PLAYER role users are returned
   * - Supports optional search query
   * 
   * Query params:
   * - searchQuery: Optional search filter
   * - tournamentId: Tournament context for privacy checks (optional)
   */
  public async getEligibleParticipants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {searchQuery, tournamentId} = req.query;
      const userRepository = AppDataSource.getRepository(User);
      
      const queryBuilder = userRepository.createQueryBuilder('user');
      
      // Only return PLAYER role users who are active
      queryBuilder.where('user.role = :role', {role: UserRole.PLAYER});
      queryBuilder.andWhere('user.isActive = :isActive', {isActive: true});
      
      // Optional search filter
      if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
        queryBuilder.andWhere(
          '(LOWER(user.username) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
          {search: `%${searchQuery.trim()}%`}
        );
      }
      
      queryBuilder.orderBy('user.lastName', 'ASC');
      queryBuilder.addOrderBy('user.firstName', 'ASC');
      
      const users = await queryBuilder.getMany();
      
      // Get viewer from JWT token (null if not authenticated)
      const viewer = req.user ? await userRepository.findOne({where: {id: req.user.id}}) : null;
      
      // Apply privacy filtering to each user in the list
      const filteredUsers = await Promise.all(
        users.map(user => 
          this.privacyService.filterUserData(
            user,
            viewer || null,
            tournamentId as string | undefined
          )
        )
      );
      
      res.status(HTTP_STATUS.OK).json(filteredUsers);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/users
   * Lists all users with privacy filtering applied (admin only).
   * 
   * Privacy enforcement:
   * - Each user in the list is filtered based on viewer's relationship
   * - This endpoint is typically admin-only, so admins see all fields
   * - Non-admin access (if allowed) applies privacy filtering
   * 
   * Query params:
   * - role: Filter by role (optional)
   * - isActive: Filter by active status (optional)
   * - searchQuery: Search filter (optional)
   */
  public async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {role, isActive, searchQuery} = req.query;
      const userRepository = AppDataSource.getRepository(User);
      
      const queryBuilder = userRepository.createQueryBuilder('user');
      
      if (role) {
        queryBuilder.andWhere('user.role = :role', {role});
      }
      if (isActive !== undefined) {
        queryBuilder.andWhere('user.isActive = :isActive', {isActive: isActive === 'true'});
      }
      if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
        queryBuilder.andWhere(
          '(LOWER(user.username) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
          {search: `%${searchQuery.trim()}%`}
        );
      }
      
      queryBuilder.orderBy('user.createdAt', 'DESC');
      
      const users = await queryBuilder.getMany();
      
      // Get viewer from JWT token
      const viewer = req.user ? await userRepository.findOne({where: {id: req.user.id}}) : null;
      
      // Apply privacy filtering to each user in the list
      const filteredUsers = await Promise.all(
        users.map(user => 
          this.privacyService.filterUserData(user, viewer || null)
        )
      );
      
      res.status(HTTP_STATUS.OK).json(filteredUsers);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users
   * Creates a new user (admin only).
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {username, email, firstName, lastName, password, role, phone} = req.body;
      
      // Validate required fields
      if (!username || !email || !firstName || !lastName || !password || !role) {
        throw new AppError(
          'Missing required fields: username, email, firstName, lastName, password, role',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      const userRepository = AppDataSource.getRepository(User);
      
      // Check if username exists
      const existingUsername = await userRepository.findOne({where: {username}});
      if (existingUsername) {
        throw new AppError('Username already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.ALREADY_EXISTS);
      }
      
      // Check if email exists
      const existingEmail = await userRepository.findOne({where: {email}});
      if (existingEmail) {
        throw new AppError('Email already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.ALREADY_EXISTS);
      }
      
      // Create new user  
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash(password, 10);
      
      const user = userRepository.create({
        id: generateId('usr'),
        username,
        email,
        firstName,
        lastName,
        passwordHash,
        role,
        phone: phone || null,
        isActive: true,
        gdprConsent: true,
      });
      
      await userRepository.save(user);
      
      const {passwordHash: _, ...userWithoutPassword} = user;
      
      res.status(HTTP_STATUS.CREATED).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id/admin
   * Updates any user field (admin only - more permissive than standard update).
   */
  public async updateByAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {username, email, firstName, lastName, role, isActive, phone, idDocument, ranking, currentPassword, newPassword} = req.body;
      
      const userRepository = AppDataSource.getRepository(User);
      
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Prevent admin from deactivating themselves
      if (req.user?.id === id && isActive === false) {
        throw new AppError('Cannot deactivate your own account', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }
      
      // Handle password change if newPassword is provided
      if (newPassword) {
        // If the requesting user is not a SYSTEM_ADMIN, require current password
        const isSystemAdmin = req.user?.role === UserRole.SYSTEM_ADMIN;
        
        if (!isSystemAdmin && !currentPassword) {
          throw new AppError('Current password is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
        }
        
        // Verify current password if provided
        if (currentPassword && !isSystemAdmin) {
          const bcrypt = await import('bcrypt');
          const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
          if (!isValidPassword) {
            throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
          }
        }
        
        // Hash and update new password
        const bcrypt = await import('bcrypt');
        user.passwordHash = await bcrypt.hash(newPassword, 10);
      }
      
      // Check username uniqueness if changing
      if (username && username !== user.username) {
        const existingUsername = await userRepository.findOne({where: {username}});
        if (existingUsername) {
          throw new AppError('Username already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.ALREADY_EXISTS);
        }
        user.username = username;
      }
      
      // Check email uniqueness if changing
      if (email && email !== user.email) {
        const existingEmail = await userRepository.findOne({where: {email}});
        if (existingEmail) {
          throw new AppError('Email already exists', HTTP_STATUS.CONFLICT, ERROR_CODES.ALREADY_EXISTS);
        }
        user.email = email;
      }
      
      // Check ID/NIE uniqueness if changing (FR9 - unique identification)
      if (idDocument !== undefined && idDocument !== null && idDocument.trim() !== '') {
        const trimmedDoc = idDocument.trim();
        if (trimmedDoc !== user.idDocument) {
          const existingIdDoc = await userRepository.findOne({where: {idDocument: trimmedDoc}});
          if (existingIdDoc && existingIdDoc.id !== user.id) {
            throw new AppError('This ID/NIE document is already registered to another user', HTTP_STATUS.CONFLICT, ERROR_CODES.ALREADY_EXISTS);
          }
          user.idDocument = trimmedDoc;
        }
      } else if (idDocument === null || idDocument === '') {
        user.idDocument = null;
      }
      
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (phone !== undefined) user.phone = phone;
      if (ranking !== undefined) user.ranking = ranking;
      
      await userRepository.save(user);
      
      const {passwordHash, ...userWithoutPassword} = user;
      
      res.status(HTTP_STATUS.OK).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Deletes a user (admin only).
   */
  public async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);
      
      // Prevent admin from deleting themselves
      if (req.user?.id === id) {
        throw new AppError('Cannot delete your own account', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }
      
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Delete avatar if exists
      if (user.avatarUrl) {
        try {
          const relativePath = user.avatarUrl.replace('/uploads/', '');
          await this.imageService.deleteImage(relativePath);
        } catch (error) {
          // Log but don't fail deletion if avatar deletion fails
          console.error('Failed to delete avatar:', error);
        }
      }
      
      await userRepository.remove(user);
      
      res.status(HTTP_STATUS.OK).json({message: 'User deleted successfully'});
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/stats
   * Gets user statistics (admin only).
   */
  public async getStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      
      const totalUsers = await userRepository.count();
      const activeUsers = await userRepository.count({where: {isActive: true}});
      const systemAdmins = await userRepository.count({where: {role: UserRole.SYSTEM_ADMIN}});
      const tournamentAdmins = await userRepository.count({where: {role: UserRole.TOURNAMENT_ADMIN}});
      const players = await userRepository.count({where: {role: UserRole.PLAYER}});
      
      res.status(HTTP_STATUS.OK).json({
        totalUsers,
        activeUsers,
        systemAdmins,
        tournamentAdmins,
        players,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/:id/avatar
   * Uploads and optimizes user avatar image.
   * 
   * Expects multipart/form-data with 'image' field.
   * - Validates image format and size
   * - Optimizes with compression and WebP conversion
   * - Generates responsive sizes (thumbnail, medium)
   * - Stores in filesystem and updates user.avatarUrl
   */
  public async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);

      // Verify user exists
      const user = await userRepository.findOne({where: {id}});
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify authorization (users can only upload their own avatar, admins can upload for anyone)
      if (req.user?.id !== id && req.user?.role !== UserRole.SYSTEM_ADMIN) {
        throw new AppError(
          'Unauthorized to upload avatar for this user',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      // Check if file was uploaded
      if (!req.file) {
        throw new AppError('No image file provided', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }

      // Validate image
      const isValid = await this.imageService.validateImage(req.file.buffer);
      if (!isValid) {
        throw new AppError('Invalid image file', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }

      // Delete old avatar if exists
      if (user.avatarUrl) {
        const oldPath = user.avatarUrl.replace('/uploads/', '');
        await this.imageService.deleteImage(oldPath);
      }

      // Optimize image (compress, resize to 400x400, convert to WebP)
      const optimized = await this.imageService.optimizeImage(req.file.buffer, {
        width: 400,
        height: 400,
        fit: 'cover',
      });

      // Save to filesystem
      const filename = `${id}-${Date.now()}.webp`;
      const relativePath = `avatars/${filename}`;
      await this.imageService.saveImage(optimized.buffer, relativePath);

      // Update user entity
      user.avatarUrl = this.imageService.getImageUrl(relativePath);
      await userRepository.save(user);

      const {passwordHash, ...userWithoutPassword} = user;

      res.status(HTTP_STATUS.OK).json({
        message: 'Avatar uploaded successfully',
        user: userWithoutPassword,
        image: {
          url: user.avatarUrl,
          size: optimized.size,
          width: optimized.width,
          height: optimized.height,
          format: optimized.format,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id/avatar
   * Deletes user avatar image.
   */
  public async deleteAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({where: {id}});
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify authorization
      if (req.user?.id !== id && req.user?.role !== UserRole.SYSTEM_ADMIN) {
        throw new AppError(
          'Unauthorized to delete avatar for this user',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      if (!user.avatarUrl) {
        throw new AppError('User has no avatar to delete', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Delete from filesystem
      const relativePath = user.avatarUrl.replace('/uploads/', '');
      await this.imageService.deleteImage(relativePath);

      // Update user entity
      user.avatarUrl = null;
      await userRepository.save(user);

      const {passwordHash, ...userWithoutPassword} = user;

      res.status(HTTP_STATUS.OK).json({
        message: 'Avatar deleted successfully',
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id/public
   * Retrieves public user information (name, avatar) without authentication.
   * Used for displaying participant names in public views (standings, brackets, matches).
   */
  /**
   * GET /api/users/:id/public
   * Retrieves public user information with privacy filtering.
   * 
   * Privacy enforcement:
   * - This endpoint is now redundant with getById + privacy filtering
   * - Kept for backwards compatibility
   * - Filters user data based on viewer's relationship
   * 
   * Note: Consider using GET /api/users/:id directly with privacy filtering
   */
  public async getPublicInfo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userRepository = AppDataSource.getRepository(User);
      
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Get viewer from JWT token (null if not authenticated)
      const viewer = req.user ? await userRepository.findOne({where: {id: req.user.id}}) : null;
      
      // Apply privacy filtering (will return only publicly accessible fields)
      const filteredUser = await this.privacyService.filterUserData(user, viewer || null);
      
      res.status(HTTP_STATUS.OK).json(filteredUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id/privacy
   * Updates user's privacy settings (FR58).
   * User can only update their own privacy settings, unless they are a system admin.
   */
  public async updatePrivacy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {privacySettings} = req.body;
      
      // Verify user owns this profile or is admin
      if (req.user?.id !== id && req.user?.role !== UserRole.SYSTEM_ADMIN) {
        throw new AppError('Cannot update other users privacy settings', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }
      
      if (!privacySettings) {
        throw new AppError('Privacy settings are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED);
      }
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Validate and update privacy settings
      // The User entity's privacySettings field is a JSON column
      user.privacySettings = privacySettings;
      
      await userRepository.save(user);
      
      const {passwordHash, ...userWithoutPassword} = user;
      
      res.status(HTTP_STATUS.OK).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id/export
   * Exports all user data in JSON format for GDPR compliance (NFR14).
   * 
   * Exports:
   * - Profile information
   * - Tournament registrations
   * - Match history
   * - Notifications
   * - Privacy settings
   * - Notification preferences
   * - Audit logs (actions performed by user)
   * 
   * @remarks
   * User can only export their own data, unless they are a system admin.
   * Returns JSON file for download.
   */
  public async exportUserData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      
      // Verify user owns this data or is admin
      if (req.user?.id !== id && req.user?.role !== UserRole.SYSTEM_ADMIN) {
        throw new AppError('Cannot export other users data', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }
      
      const userRepository = AppDataSource.getRepository(User);
      const matchRepository = AppDataSource.getRepository(Match);
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      const user = await userRepository.findOne({where: {id}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Collect all user data
      const {passwordHash, ...userProfile} = user;
      
      // Get registrations
      const registrations = await registrationRepository.find({
        where: {participantId: id},
        relations: ['tournament', 'category'],
      });
      
      // Get matches
      const matches = await matchRepository.find({
        where: [
          {participant1Id: id},
          {participant2Id: id},
        ],
        relations: ['scores'],
      });
      
      // Get notifications (if Notification entity exists)
      let notifications: any[] = [];
      try {
        const Notification = AppDataSource.getRepository('Notification');
        notifications = await Notification.find({
          where: {userId: id},
          order: {createdAt: 'DESC'},
        });
      } catch {
        // Notification entity might not exist
      }
      
      // Get notification preferences (if exists)
      let notificationPreferences = null;
      try {
        const NotificationPreferences = AppDataSource.getRepository('NotificationPreferences');
        notificationPreferences = await NotificationPreferences.findOne({
          where: {userId: id},
        });
      } catch {
        // NotificationPreferences entity might not exist
      }
      
      // Get audit logs (if AuditLog entity exists)
      let auditLogs: any[] = [];
      try {
        const AuditLog = AppDataSource.getRepository('AuditLog');
        auditLogs = await AuditLog.find({
          where: {userId: id},
          order: {timestamp: 'DESC'},
          take: 1000, // Limit to last 1000 actions
        });
      } catch {
        // AuditLog entity might not exist
      }
      
      // Compile export data
      const exportData = {
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
        user: userProfile,
        registrations: registrations.map(reg => ({
          id: reg.id,
          tournamentId: reg.tournamentId,
          tournamentName: reg.tournament?.name,
          categoryId: reg.categoryId,
          categoryName: reg.category?.name,
          status: reg.status,
          acceptanceType: reg.acceptanceType,
          seedNumber: reg.seedNumber,
          registrationDate: reg.registrationDate,
        })),
        matches: matches.map(match => ({
          id: match.id,
          bracketId: match.bracketId,
          opponent1Id: match.participant1Id,
          opponent2Id: match.participant2Id,
          winnerId: match.winnerId,
          status: match.status,
          score: match.score,
          scores: match.scores,
          scheduledTime: match.scheduledTime,
          completedAt: match.endTime,
        })),
        notifications: notifications.map((notif: any) => ({
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          isRead: notif.isRead,
          createdAt: notif.createdAt,
        })),
        notificationPreferences,
        privacySettings: user.privacySettings,
        auditLogs: auditLogs.map((log: any) => ({
          action: log.action,
          resourceType: log.resourceType,
          resourceId: log.resourceId,
          timestamp: log.timestamp,
          metadata: log.metadata,
        })),
        statistics: {
          totalRegistrations: registrations.length,
          totalMatches: matches.length,
          totalNotifications: notifications.length,
          totalAuditActions: auditLogs.length,
        },
      };
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-data-${id}-${Date.now()}.json"`);
      
      res.status(HTTP_STATUS.OK).json(exportData);
    } catch (error) {
      next(error);
    }
  }
}
