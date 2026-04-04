/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/court.controller.ts
 * @desc Court controller handling court management.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Court} from '../../domain/entities/court.entity';
import {Tournament} from '../../domain/entities/tournament.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {generateId} from '../../shared/utils/id-generator';

export class CourtController {
  /**
   * GET /api/courts?tournamentId=xxx
   * Retrieves all courts for a tournament.
   */
  public async getByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.query;
      
      if (!tournamentId) {
        throw new AppError('tournamentId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const courtRepository = AppDataSource.getRepository(Court);
      const courts = await courtRepository.find({
        where: {tournamentId: tournamentId as string},
        order: {name: 'ASC'},
      });
      
      res.status(HTTP_STATUS.OK).json(courts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/courts
   * Creates a single court for a tournament.
   * Admin only.
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId, name} = req.body;

      if (!tournamentId || !name) {
        throw new AppError('tournamentId and name are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const courtRepository = AppDataSource.getRepository(Court);

      // Verify tournament exists
      const tournament = await tournamentRepository.findOne({where: {id: tournamentId}});
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Check if court name already exists for this tournament
      const existingCourt = await courtRepository.findOne({
        where: {tournamentId, name},
      });
      
      if (existingCourt) {
        throw new AppError(
          'A court with this name already exists for this tournament',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Create court with tournament's surface
      const court = courtRepository.create({
        id: generateId('crt'),
        tournamentId,
        name,
        surface: tournament.surface,
        isAvailable: true,
      });

      await courtRepository.save(court);

      res.status(HTTP_STATUS.CREATED).json(court);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/courts/:id
   * Updates a court's name.
   * Admin only.
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {name} = req.body;

      if (!name) {
        throw new AppError('name is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const courtRepository = AppDataSource.getRepository(Court);

      const court = await courtRepository.findOne({where: {id}});
      if (!court) {
        throw new AppError('Court not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Check if new name conflicts with existing court
      if (name !== court.name) {
        const existingCourt = await courtRepository.findOne({
          where: {tournamentId: court.tournamentId, name},
        });
        
        if (existingCourt) {
          throw new AppError(
            'A court with this name already exists for this tournament',
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_INPUT
          );
        }
      }

      court.name = name;
      await courtRepository.save(court);

      res.status(HTTP_STATUS.OK).json(court);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/courts/:id
   * Deletes a court.
   * Admin only.
   */
  public async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;

      const courtRepository = AppDataSource.getRepository(Court);

      const court = await courtRepository.findOne({where: {id}});
      if (!court) {
        throw new AppError('Court not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      await courtRepository.delete({id});

      res.status(HTTP_STATUS.OK).json({
        message: 'Court deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
