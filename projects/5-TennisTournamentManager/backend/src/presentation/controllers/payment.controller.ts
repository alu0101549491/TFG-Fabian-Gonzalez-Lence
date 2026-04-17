/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/payment.controller.ts
 * @desc Payment controller for registration payments.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Payment} from '../../domain/entities/payment.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS} from '../../shared/constants';

export class PaymentController {
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payment = paymentRepository.create({
        ...req.body,
        id: generateId('pmt'),
        userId: req.user!.id,
      });
      
      await paymentRepository.save(payment);
      res.status(HTTP_STATUS.CREATED).json(payment);
    } catch (error) {
      next(error);
    }
  }
  
  public async getByUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const paymentRepository = AppDataSource.getRepository(Payment);
      const payments = await paymentRepository.find({where: {userId}, order: {createdAt: 'DESC'}});
      
      res.status(HTTP_STATUS.OK).json(payments);
    } catch (error) {
      next(error);
    }
  }
}
