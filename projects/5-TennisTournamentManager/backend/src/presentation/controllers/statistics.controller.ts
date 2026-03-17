/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/statistics.controller.ts
 * @desc Statistics controller for player statistics.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Statistics} from '../../domain/entities/statistics.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

export class StatisticsController {
  public async getByPlayer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {playerId, tournamentId} = req.query;
      
      if (!playerId) {
        throw new AppError('playerId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const statsRepository = AppDataSource.getRepository(Statistics);
      const where: any = {playerId: playerId as string};
      
      if (tournamentId) {
        where.tournamentId = tournamentId;
      }
      
      const statistics = await statsRepository.find({where});
      
      res.status(HTTP_STATUS.OK).json(statistics);
    } catch (error) {
      next(error);
    }
  }
}
