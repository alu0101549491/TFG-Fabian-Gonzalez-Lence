/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/category.controller.ts
 * @desc Category controller handling tournament categories.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Category} from '../../domain/entities/category.entity';
import {Tournament} from '../../domain/entities/tournament.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {Bracket} from '../../domain/entities/bracket.entity';
import {Match} from '../../domain/entities/match.entity';
import {Phase} from '../../domain/entities/phase.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {generateId} from '../../shared/utils/id-generator';

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
      
      console.log('📋 Fetching categories for tournament:', tournamentId);
      
      if (!tournamentId) {
        throw new AppError('tournamentId required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const categoryRepository = AppDataSource.getRepository(Category);
      const categories = await categoryRepository.find({where: {tournamentId: tournamentId as string}});
      
      console.log(`✅ Found ${categories.length} categories for tournament ${tournamentId}:`, categories.map(c => ({id: c.id, name: c.name})));
      
      res.status(HTTP_STATUS.OK).json(categories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      next(error);
    }
  }

  /**
   * POST /api/categories
   * Creates a new category for a tournament.
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId, name, gender, ageGroup, maxParticipants} = req.body;

      console.log('📋 Creating category:', {tournamentId, name, gender, ageGroup, maxParticipants});

      if (!tournamentId || !name || !gender || !ageGroup || !maxParticipants) {
        throw new AppError('Missing required fields', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      // Verify tournament exists
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      const tournament = await tournamentRepository.findOne({where: {id: tournamentId}});
      
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Validate maxParticipants doesn't exceed tournament limit
      if (Number(maxParticipants) > tournament.maxParticipants) {
        throw new AppError(
          `Category max participants (${maxParticipants}) cannot exceed tournament limit (${tournament.maxParticipants})`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      const categoryRepository = AppDataSource.getRepository(Category);
      const category = categoryRepository.create({
        id: generateId('cat'),
        tournamentId,
        name,
        gender,
        ageGroup,
        maxParticipants: Number(maxParticipants),
      });

      console.log('💾 Saving category:', category);
      await categoryRepository.save(category);
      console.log('✅ Category saved successfully:', category.id);
      
      res.status(HTTP_STATUS.CREATED).json(category);
    } catch (error) {
      console.error('❌ Error creating category:', error);
      next(error);
    }
  }

  /**
   * DELETE /api/categories/:id
   * Deletes a category and all related data (registrations, brackets, matches, phases).
   * 
   * Cascade deletion order:
   * 1. Matches (reference brackets)
   * 2. Phases (reference brackets)
   * 3. Brackets (reference category)
   * 4. Registrations (reference category)
   * 5. Category
   */
  public async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      
      console.log(`🗑️ Deleting category ${id} and all related data...`);
      
      const categoryRepository = AppDataSource.getRepository(Category);
      const registrationRepository = AppDataSource.getRepository(Registration);
      const bracketRepository = AppDataSource.getRepository(Bracket);
      const matchRepository = AppDataSource.getRepository(Match);
      const phaseRepository = AppDataSource.getRepository(Phase);
      
      const category = await categoryRepository.findOne({where: {id}});
      
      if (!category) {
        throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Delete related data in correct order to respect foreign key constraints
      
      // 1. Get all brackets for this category
      const brackets = await bracketRepository.find({where: {categoryId: id}});
      
      for (const bracket of brackets) {
        // 1a. Delete matches first (they reference brackets)
        await matchRepository.delete({bracketId: bracket.id});
        
        // 1b. Delete phases (they reference brackets)
        await phaseRepository.delete({bracketId: bracket.id});
      }
      console.log(`✅ Deleted matches and phases for ${brackets.length} bracket(s)`);
      
      // 2. Delete brackets (they reference category)
      await bracketRepository.delete({categoryId: id});
      console.log(`✅ Deleted ${brackets.length} bracket(s) for category ${id}`);
      
      // 3. Delete registrations (they reference category)
      const deleteResult = await registrationRepository.delete({categoryId: id});
      console.log(`✅ Deleted ${deleteResult.affected || 0} registration(s) for category ${id}`);
      
      // 4. Finally, delete the category
      await categoryRepository.remove(category);
      console.log(`✅ Category ${id} deleted successfully`);
      
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      next(error);
    }
  }
}
