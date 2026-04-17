/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/announcement.controller.ts
 * @desc Announcement controller for tournament announcements (FR47-FR49).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS} from '../../shared/constants';
import {AnnouncementService} from '../../application/services/announcement.service';

/**
 * Controller for announcement endpoints.
 */
export class AnnouncementController {
  private readonly announcementService: AnnouncementService;

  constructor() {
    this.announcementService = new AnnouncementService();
  }

  /**
   * Creates a new announcement.
   * POST /api/announcements
   *
   * @param req - Express request with user authentication
   * @param res - Express response
   * @param next - Express next function
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const announcement = await this.announcementService.create(req.body, req.user!.id);
      res.status(HTTP_STATUS.CREATED).json(announcement);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves announcements with optional filters.
   * GET /api/announcements
   *
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId, tags, search, type, isPinned} = req.query;

      const filters = {
        tournamentId: tournamentId as string | undefined,
        tags: tags ? (tags as string).split(',') : undefined,
        search: search as string | undefined,
        type: type as any,
        isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
      };

      const announcements = await this.announcementService.findAll(
        filters,
        req.user?.id,
      );

      res.status(HTTP_STATUS.OK).json(announcements);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a single announcement by ID.
   * GET /api/announcements/:id
   *
   * @param req - Express request
   * @param res - Express response
   * @param next - Express next function
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const announcement = await this.announcementService.findById(id, req.user?.id);
      
      if (!announcement) {
        res.status(HTTP_STATUS.NOT_FOUND).json({message: 'Announcement not found'});
        return;
      }

      res.status(HTTP_STATUS.OK).json(announcement);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing announcement.
   * PUT /api/announcements/:id
   *
   * @param req - Express request with user authentication
   * @param res - Express response
   * @param next - Express next function
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const updated = await this.announcementService.update(id, req.body, req.user!.id);
      res.status(HTTP_STATUS.OK).json(updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes an announcement.
   * DELETE /api/announcements/:id
   *
   * @param req - Express request with user authentication
   * @param res - Express response
   * @param next - Express next function
   */
  public async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      await this.announcementService.delete(id, req.user!.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publishes an announcement.
   * POST /api/announcements/:id/publish
   *
   * @param req - Express request with user authentication
   * @param res - Express response
   * @param next - Express next function
   */
  public async publish(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const published = await this.announcementService.publish(id, req.user!.id);
      res.status(HTTP_STATUS.OK).json(published);
    } catch (error) {
      next(error);
    }
  }
}
