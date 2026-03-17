/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/ranking.controller.ts
 * @desc Ranking controller for global player rankings.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {GlobalRanking} from '../../domain/entities/global-ranking.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS} from '../../shared/constants';

export class RankingController {
  public async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rankingRepository = AppDataSource.getRepository(GlobalRanking);
      const rankings = await rankingRepository.find({order: {rank: 'ASC'}, take: 100});
      
      res.status(HTTP_STATUS.OK).json(rankings);
    } catch (error) {
      next(error);
    }
  }
}
