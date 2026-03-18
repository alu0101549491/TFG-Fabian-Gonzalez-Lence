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
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      
      const tournament = await tournamentRepository.findOne({where: {id}});
      
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
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
   * Deletes a tournament.
   */
  public async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      
      const tournament = await tournamentRepository.findOne({where: {id}});
      
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      await tournamentRepository.remove(tournament);
      
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
      if (tournament.organizerId !== req.user?.id && req.user?.role !== 'ADMIN') {
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
      if (tournament.organizerId !== req.user?.id && req.user?.role !== 'ADMIN') {
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
