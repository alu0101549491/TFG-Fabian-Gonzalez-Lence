/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/phase.controller.ts
 * @desc Phase controller handling bracket phases.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Phase} from '../../domain/entities/phase.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

export class PhaseController {
  public async getByBracket(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {bracketId} = req.query;
      
      if (!bracketId) {
        throw new AppError('bracketId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const phaseRepository = AppDataSource.getRepository(Phase);
      const phases = await phaseRepository.find({
        where: {bracketId: bracketId as string},
        order: {order: 'ASC'},
      });
      
      res.status(HTTP_STATUS.OK).json(phases);
    } catch (error) {
      next(error);
    }
  }
}
