/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/sanction.controller.ts
 * @desc Sanction controller for participant sanctions.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Sanction} from '../../domain/entities/sanction.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

export class SanctionController {
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sanctionRepository = AppDataSource.getRepository(Sanction);
      const sanction = sanctionRepository.create({
        ...req.body,
        id: generateId('snc'),
        issuedBy: req.user!.id,
      });
      
      await sanctionRepository.save(sanction);
      res.status(HTTP_STATUS.CREATED).json(sanction);
    } catch (error) {
      next(error);
    }
  }
  
  public async getByMatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {matchId} = req.query;
      
      if (!matchId) {
        throw new AppError('matchId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const sanctionRepository = AppDataSource.getRepository(Sanction);
      const sanctions = await sanctionRepository.find({where: {matchId: matchId as string}});
      
      res.status(HTTP_STATUS.OK).json(sanctions);
    } catch (error) {
      next(error);
    }
  }
}
