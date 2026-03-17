/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/match.controller.ts
 * @desc Match controller handling match operations and scoring.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Match} from '../../domain/entities/match.entity';
import {Score} from '../../domain/entities/score.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

/**
 * Match controller.
 */
export class MatchController {
  /**
   * GET /api/matches
   * Lists matches for a bracket.
   */
  public async getByBracket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {bracketId} = req.query;
      const matchRepository = AppDataSource.getRepository(Match);
      
      if (!bracketId) {
        throw new AppError('bracketId query parameter is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const matches = await matchRepository.find({
        where: {bracketId: bracketId as string},
        relations: ['scores', 'court'],
      });
      
      res.status(HTTP_STATUS.OK).json(matches);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/matches/:id
   * Retrieves match details.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const matchRepository = AppDataSource.getRepository(Match);
      
      const match = await matchRepository.findOne({
        where: {id},
        relations: ['scores', 'court'],
      });
      
      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      res.status(HTTP_STATUS.OK).json(match);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/matches/:id
   * Updates match details (status, scores, etc.).
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const matchRepository = AppDataSource.getRepository(Match);
      
      const match = await matchRepository.findOne({where: {id}});
      
      if (!match) {
        throw new AppError('Match not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      Object.assign(match, req.body);
      await matchRepository.save(match);
      
      res.status(HTTP_STATUS.OK).json(match);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /api/matches/:id/score
   * Submits score for a match.
   */
  public async submitScore(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const scoreRepository = AppDataSource.getRepository(Score);
      
      const score = scoreRepository.create({
        ...req.body,
        id: generateId('scr'),
        matchId: id,
      });
      
      await scoreRepository.save(score);
      
      res.status(HTTP_STATUS.CREATED).json(score);
    } catch (error) {
      next(error);
    }
  }
}
