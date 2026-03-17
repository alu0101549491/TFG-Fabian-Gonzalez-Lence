/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/order-of-play.controller.ts
 * @desc Order of Play controller for match scheduling.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {OrderOfPlay} from '../../domain/entities/order-of-play.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

export class OrderOfPlayController {
  public async getByDate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId, date} = req.query;
      
      if (!tournamentId || !date) {
        throw new AppError('tournamentId and date required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const oopRepository = AppDataSource.getRepository(OrderOfPlay);
      const orderOfPlay = await oopRepository.findOne({
        where: {tournamentId: tournamentId as string, date: new Date(date as string)},
      });
      
      res.status(HTTP_STATUS.OK).json(orderOfPlay || {});
    } catch (error) {
      next(error);
    }
  }
}
