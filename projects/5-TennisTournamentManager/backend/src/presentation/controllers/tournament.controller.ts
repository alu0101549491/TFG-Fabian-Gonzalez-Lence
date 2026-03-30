/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/tournament.controller.ts
 * @desc Tournament controller handling CRUD operations for tournaments.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Tournament} from '../../domain/entities/tournament.entity';
import {User} from '../../domain/entities/user.entity';
import {Category} from '../../domain/entities/category.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {Court} from '../../domain/entities/court.entity';
import {Bracket} from '../../domain/entities/bracket.entity';
import {Match} from '../../domain/entities/match.entity';
import {Phase} from '../../domain/entities/phase.entity';
import {TournamentStatus} from '../../domain/enumerations/tournament-status';
import {UserRole} from '../../domain/enumerations/user-role';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {ImageOptimizationService} from '../../application/services/image-optimization.service';

/**
 * Tournament controller.
 */
export class TournamentController {
  private readonly imageService: ImageOptimizationService;

  /**
   * Creates an instance of TournamentController.
   */
  public constructor() {
    this.imageService = new ImageOptimizationService();
  }
  /**
   * POST /api/tournaments
   * Creates a new tournament.
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      
      const tournament = tournamentRepository.create({
        ...req.body,
        id: generateId('trn'),
        organizerId: req.user!.id,
      });
      
      await tournamentRepository.save(tournament);
      
      res.status(HTTP_STATUS.CREATED).json(tournament);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/tournaments/:id
   * Retrieves tournament by ID.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      
      const tournament = await tournamentRepository.findOne({
        where: {id},
        relations: ['categories', 'courts'],
      });
      
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      res.status(HTTP_STATUS.OK).json(tournament);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/tournaments
   * Lists all tournaments with optional filters.
   */
  public async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {status, surface, location} = req.query;
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      
      const queryBuilder = tournamentRepository.createQueryBuilder('tournament');
      
      if (status) {
        queryBuilder.andWhere('tournament.status = :status', {status});
      }
      if (surface) {
        queryBuilder.andWhere('tournament.surface = :surface', {surface});
      }
      if (location) {
        queryBuilder.andWhere('tournament.location ILIKE :location', {location: `%${location}%`});
      }
      
      const tournaments = await queryBuilder.getMany();
      
      res.status(HTTP_STATUS.OK).json(tournaments);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/tournaments/:id
   * Updates tournament details.
   * If status is included, validates status transitions.
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      
      const tournament = await tournamentRepository.findOne({where: {id}});
      
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // If status is being updated, validate the transition
      if (req.body.status && req.body.status !== tournament.status) {
        const validTransitions: Record<TournamentStatus, TournamentStatus[]> = {
          [TournamentStatus.DRAFT]: [TournamentStatus.REGISTRATION_OPEN, TournamentStatus.CANCELLED],
          [TournamentStatus.REGISTRATION_OPEN]: [TournamentStatus.REGISTRATION_CLOSED, TournamentStatus.CANCELLED],
          [TournamentStatus.REGISTRATION_CLOSED]: [TournamentStatus.DRAW_PENDING, TournamentStatus.CANCELLED],
          [TournamentStatus.DRAW_PENDING]: [TournamentStatus.IN_PROGRESS, TournamentStatus.CANCELLED],
          [TournamentStatus.IN_PROGRESS]: [TournamentStatus.FINALIZED, TournamentStatus.CANCELLED],
          [TournamentStatus.FINALIZED]: [],
          [TournamentStatus.CANCELLED]: [],
        };

        const allowedTransitions = validTransitions[tournament.status];
        if (!allowedTransitions.includes(req.body.status)) {
          throw new AppError(
            `Cannot transition from ${tournament.status} to ${req.body.status}. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_INPUT,
          );
        }
      }
      
      Object.assign(tournament, req.body);
      await tournamentRepository.save(tournament);
      
      res.status(HTTP_STATUS.OK).json(tournament);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * DELETE /api/tournaments/:id
   * Deletes a tournament and all its related data (brackets, matches, phases, categories, registrations, courts).
   * 
   * Cascade deletion order:
   * 1. Registrations (reference tournament and category)
   * 2. Matches (reference brackets)
   * 3. Phases (reference brackets)
   * 4. Brackets (reference categories)
   * 5. Categories (reference tournament)
   * 6. Courts (reference tournament)
   * 7. Tournament
   * 
   * Authorization:
   * - System admins can delete any tournament (including finalized)
   * - Tournament admins can delete any non-finalized tournament
   * - Tournament organizers can delete their own non-finalized tournaments
   */
  public async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }
      
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const userRepository = AppDataSource.getRepository(User);
      const categoryRepository = AppDataSource.getRepository(Category);
      const registrationRepository = AppDataSource.getRepository(Registration);
      const courtRepository = AppDataSource.getRepository(Court);
      const bracketRepository = AppDataSource.getRepository(Bracket);
      const matchRepository = AppDataSource.getRepository(Match);
      const phaseRepository = AppDataSource.getRepository(Phase);
      
      const tournament = await tournamentRepository.findOne({where: {id}});
      
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      const user = await userRepository.findOne({where: {id: userId}});
      
      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Authorization check
      const isSystemAdmin = user.role === UserRole.SYSTEM_ADMIN;
      const isTournamentAdmin = user.role === UserRole.TOURNAMENT_ADMIN;
      const isOrganizer = tournament.organizerId === userId;
      
      if (!isSystemAdmin && !isTournamentAdmin && !isOrganizer) {
        throw new AppError(
          'User is not authorized to delete this tournament',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN
        );
      }
      
      // System admins can delete any tournament (including finalized)
      // Tournament admins and organizers cannot delete finalized tournaments
      if (tournament.status === TournamentStatus.FINALIZED && !isSystemAdmin) {
        throw new AppError(
          'Cannot delete finalized tournaments. Historical records must be preserved.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }
      
      console.log(`🗑️ Deleting tournament ${id} and all related data...`);
      
      // Delete related data in the correct order to respect foreign key constraints
      // 1. Delete registrations first (they reference both tournament and category)
      await registrationRepository.delete({tournamentId: id});
      console.log(`✅ Deleted registrations for tournament ${id}`);
      
      // 2. Get all categories for this tournament to delete their brackets
      const categories = await categoryRepository.find({where: {tournamentId: id}});
      
      for (const category of categories) {
        // 2a. Get all brackets for this category
        const brackets = await bracketRepository.find({where: {categoryId: category.id}});
        
        for (const bracket of brackets) {
          // 2a-i. Delete matches first (they reference brackets)
          await matchRepository.delete({bracketId: bracket.id});
          
          // 2a-ii. Delete phases (they reference brackets)
          await phaseRepository.delete({bracketId: bracket.id});
        }
        
        // 2b. Delete brackets (they reference categories)
        await bracketRepository.delete({categoryId: category.id});
      }
      console.log(`✅ Deleted brackets, phases, and matches for tournament ${id}`);
      
      // 3. Delete categories (they reference tournament)
      await categoryRepository.delete({tournamentId: id});
      console.log(`✅ Deleted categories for tournament ${id}`);
      
      // 4. Delete courts (they reference tournament)
      await courtRepository.delete({tournamentId: id});
      console.log(`✅ Deleted courts for tournament ${id}`);
      
      // 5. Finally, delete the tournament
      await tournamentRepository.remove(tournament);
      console.log(`✅ Tournament ${id} deleted successfully`);
      
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tournaments/:id/logo
   * Uploads and optimizes tournament logo image.
   * 
   * Expects multipart/form-data with 'image' field.
   * - Validates image format and size
   * - Optimizes with compression and WebP conversion
   * - Generates logo (max 800x800, maintains aspect ratio)
   * - Stores in filesystem and updates tournament.logoUrl
   */
  public async uploadLogo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const tournamentRepository = AppDataSource.getRepository(Tournament);

      // Verify tournament exists
      const tournament = await tournamentRepository.findOne({where: {id}});
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify authorization (only organizer or admin can upload logo)
      if (tournament.organizerId !== req.user?.id && req.user?.role !== UserRole.SYSTEM_ADMIN) {
        throw new AppError(
          'Unauthorized to upload logo for this tournament',
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

      // Delete old logo if exists
      if (tournament.logoUrl) {
        const oldPath = tournament.logoUrl.replace('/uploads/', '');
        await this.imageService.deleteImage(oldPath);
      }

      // Optimize image (compress, resize to max 800x800 maintaining aspect ratio)
      const optimized = await this.imageService.optimizeImage(req.file.buffer, {
        width: 800,
        height: 800,
        fit: 'inside', // Maintain aspect ratio, don't crop
      });

      // Save to filesystem
      const filename = `${id}-${Date.now()}.webp`;
      const relativePath = `logos/${filename}`;
      await this.imageService.saveImage(optimized.buffer, relativePath);

      // Update tournament entity
      tournament.logoUrl = this.imageService.getImageUrl(relativePath);
      await tournamentRepository.save(tournament);

      res.status(HTTP_STATUS.OK).json({
        message: 'Logo uploaded successfully',
        tournament,
        image: {
          url: tournament.logoUrl,
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
   * PUT /api/tournaments/:id/status
   * Updates the status of a tournament.
   * 
   * Validates status transitions according to tournament lifecycle:
   * - DRAFT → REGISTRATION_OPEN | CANCELLED
   * - REGISTRATION_OPEN → REGISTRATION_CLOSED | CANCELLED
   * - REGISTRATION_CLOSED → DRAW_PENDING | CANCELLED
   * - DRAW_PENDING → IN_PROGRESS | CANCELLED
   * - IN_PROGRESS → FINALIZED | CANCELLED
   * - FINALIZED → (no transitions allowed)
   * - CANCELLED → (no transitions allowed)
   * 
   * @requires Body: { status: TournamentStatus }
   * @requires Auth: TOURNAMENT_ADMIN or SYSTEM_ADMIN or tournament organizer
   */
  public async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {status} = req.body;
      const tournamentRepository = AppDataSource.getRepository(Tournament);

      // Validate status parameter
      if (!status) {
        throw new AppError('Status is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      if (!Object.values(TournamentStatus).includes(status)) {
        throw new AppError(
          `Invalid status. Must be one of: ${Object.values(TournamentStatus).join(', ')}`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT,
        );
      }

      // Find tournament
      const tournament = await tournamentRepository.findOne({where: {id}});
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify authorization
      const isAdmin = req.user?.role === UserRole.SYSTEM_ADMIN || req.user?.role === UserRole.TOURNAMENT_ADMIN;
      const isOrganizer = tournament.organizerId === req.user?.id;

      if (!isAdmin && !isOrganizer) {
        throw new AppError(
          'Unauthorized to update tournament status',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      // Validate status transition
      const validTransitions: Record<TournamentStatus, TournamentStatus[]> = {
        [TournamentStatus.DRAFT]: [TournamentStatus.REGISTRATION_OPEN, TournamentStatus.CANCELLED],
        [TournamentStatus.REGISTRATION_OPEN]: [TournamentStatus.REGISTRATION_CLOSED, TournamentStatus.CANCELLED],
        [TournamentStatus.REGISTRATION_CLOSED]: [TournamentStatus.DRAW_PENDING, TournamentStatus.CANCELLED],
        [TournamentStatus.DRAW_PENDING]: [TournamentStatus.IN_PROGRESS, TournamentStatus.CANCELLED],
        [TournamentStatus.IN_PROGRESS]: [TournamentStatus.FINALIZED, TournamentStatus.CANCELLED],
        [TournamentStatus.FINALIZED]: [],
        [TournamentStatus.CANCELLED]: [],
      };

      const allowedTransitions = validTransitions[tournament.status];
      if (!allowedTransitions.includes(status)) {
        throw new AppError(
          `Cannot transition from ${tournament.status} to ${status}. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT,
        );
      }

      // Update status
      tournament.status = status;
      tournament.updatedAt = new Date();
      await tournamentRepository.save(tournament);

      res.status(HTTP_STATUS.OK).json(tournament);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tournaments/:id/logo
   * Deletes tournament logo image.
   */
  public async deleteLogo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const tournamentRepository = AppDataSource.getRepository(Tournament);

      const tournament = await tournamentRepository.findOne({where: {id}});
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Verify authorization
      if (tournament.organizerId !== req.user?.id && req.user?.role !== UserRole.SYSTEM_ADMIN) {
        throw new AppError(
          'Unauthorized to delete logo for this tournament',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      if (!tournament.logoUrl) {
        throw new AppError('Tournament has no logo to delete', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Delete from filesystem
      const relativePath = tournament.logoUrl.replace('/uploads/', '');
      await this.imageService.deleteImage(relativePath);

      // Update tournament entity
      tournament.logoUrl = null;
      await tournamentRepository.save(tournament);

      res.status(HTTP_STATUS.OK).json({
        message: 'Logo deleted successfully',
        tournament,
      });
    } catch (error) {
      next(error);
    }
  }
}
