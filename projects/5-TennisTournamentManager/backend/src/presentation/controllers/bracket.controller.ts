/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/bracket.controller.ts
 * @desc Bracket controller handling draw generation and bracket operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Bracket} from '../../domain/entities/bracket.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

/**
 * Bracket controller.
 */
export class BracketController {
  /**
   * POST /api/brackets
   * Generates a bracket for a category.
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bracketRepository = AppDataSource.getRepository(Bracket);
      
      const bracket = bracketRepository.create({
        ...req.body,
        id: generateId('brk'),
      });
      
      await bracketRepository.save(bracket);
      
      res.status(HTTP_STATUS.CREATED).json(bracket);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/brackets/:id
   * Retrieves bracket details.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const bracketRepository = AppDataSource.getRepository(Bracket);
      
      const bracket = await bracketRepository.findOne({
        where: {id},
        relations: ['phases', 'matches'],
      });
      
      if (!bracket) {
        throw new AppError('Bracket not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      res.status(HTTP_STATUS.OK).json(bracket);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/brackets
   * Lists brackets for a tournament.
   */
  public async getByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.query;
      const bracketRepository = AppDataSource.getRepository(Bracket);
      
      if (!tournamentId) {
        throw new AppError('tournamentId query parameter is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const brackets = await bracketRepository.find({
        where: {tournamentId: tournamentId as string},
      });
      
      res.status(HTTP_STATUS.OK).json(brackets);
    } catch (error) {
      next(error);
    }
  }
}
