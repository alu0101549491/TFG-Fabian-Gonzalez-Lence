/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/registration.controller.ts
 * @desc Registration controller handling tournament registrations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Registration} from '../../domain/entities/registration.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

/**
 * Registration controller.
 */
export class RegistrationController {
  /**
   * POST /api/registrations
   * Creates a tournament registration.
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      const registration = registrationRepository.create({
        ...req.body,
        id: generateId('reg'),
        participantId: req.body.participantId || req.user!.id,
      });
      
      await registrationRepository.save(registration);
      
      res.status(HTTP_STATUS.CREATED).json(registration);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/registrations
   * Lists registrations by tournament, participant, or category.
   */
  public async getByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId, participantId, categoryId} = req.query;
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      // Build query conditions based on provided parameters
      const where: any = {};
      if (tournamentId) where.tournamentId = tournamentId as string;
      if (participantId) where.participantId = participantId as string;
      if (categoryId) where.categoryId = categoryId as string;
      
      // At least one filter must be provided
      if (Object.keys(where).length === 0) {
        throw new AppError(
          'At least one query parameter required: tournamentId, participantId, or categoryId',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }
      
      const registrations = await registrationRepository.find({
        where,
        relations: ['participant', 'category'],
      });
      
      res.status(HTTP_STATUS.OK).json(registrations);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/registrations/:id
   * Gets a single registration by ID.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      const registration = await registrationRepository.findOne({
        where: {id},
        relations: ['participant', 'category'],
      });
      
      if (!registration) {
        throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      res.status(HTTP_STATUS.OK).json(registration);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/registrations/:id/status
   * Updates registration status.
   */
  public async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {status} = req.body;
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      const registration = await registrationRepository.findOne({where: {id}});
      
      if (!registration) {
        throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      registration.status = status;
      await registrationRepository.save(registration);
      
      res.status(HTTP_STATUS.OK).json(registration);
    } catch (error) {
      next(error);
    }
  }
}
