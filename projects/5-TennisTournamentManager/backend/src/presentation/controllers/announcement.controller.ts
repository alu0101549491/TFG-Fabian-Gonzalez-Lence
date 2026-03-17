/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/announcement.controller.ts
 * @desc Announcement controller for tournament announcements.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Announcement} from '../../domain/entities/announcement.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

export class AnnouncementController {
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcementRepository = AppDataSource.getRepository(Announcement);
      const announcement = announcementRepository.create({
        ...req.body,
        id: generateId('ann'),
        authorId: req.user!.id,
      });
      
      await announcementRepository.save(announcement);
      res.status(HTTP_STATUS.CREATED).json(announcement);
    } catch (error) {
      next(error);
    }
  }
  
  public async getByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.query;
      
      if (!tournamentId) {
        throw new AppError('tournamentId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const announcementRepository = AppDataSource.getRepository(Announcement);
      const announcements = await announcementRepository.find({
        where: {tournamentId: tournamentId as string, isPublished: true},
        order: {createdAt: 'DESC'},
      });
      
      res.status(HTTP_STATUS.OK).json(announcements);
    } catch (error) {
      next(error);
    }
  }
}
