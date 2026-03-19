/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/category.controller.ts
 * @desc Category controller handling tournament categories.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Category} from '../../domain/entities/category.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';

/**
 * Category controller.
 */
export class CategoryController {
  /**
   * GET /api/categories/:id
   * Retrieves a single category by ID.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const categoryRepository = AppDataSource.getRepository(Category);
      
      const category = await categoryRepository.findOne({where: {id}});
      
      if (!category) {
        throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      res.status(HTTP_STATUS.OK).json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/categories
   * Retrieves categories by tournament ID.
   */
  public async getByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.query;
      
      if (!tournamentId) {
        throw new AppError('tournamentId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const categoryRepository = AppDataSource.getRepository(Category);
      const categories = await categoryRepository.find({where: {tournamentId: tournamentId as string}});
      
      res.status(HTTP_STATUS.OK).json(categories);
    } catch (error) {
      next(error);
    }
  }
}
