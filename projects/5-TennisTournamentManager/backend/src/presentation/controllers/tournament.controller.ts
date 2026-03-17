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

/**
 * Tournament controller.
 */
export class TournamentController {
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
}
