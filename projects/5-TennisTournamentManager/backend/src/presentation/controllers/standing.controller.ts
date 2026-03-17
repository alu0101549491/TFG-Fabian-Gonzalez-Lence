/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/standing.controller.ts
 * @desc Standing controller for tournament standings.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Standing} from '../../domain/entities/standing.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

export class StandingController {
  public async getByCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {categoryId} = req.query;
      
      if (!categoryId) {
        throw new AppError('categoryId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const standingRepository = AppDataSource.getRepository(Standing);
      const standings = await standingRepository.find({
        where: {categoryId: categoryId as string},
        order: {rank: 'ASC'},
      });
      
      res.status(HTTP_STATUS.OK).json(standings);
    } catch (error) {
      next(error);
    }
  }
}
