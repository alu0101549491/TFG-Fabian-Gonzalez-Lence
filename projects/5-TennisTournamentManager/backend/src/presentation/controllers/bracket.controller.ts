/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/controllers/bracket.controller.ts
 * @desc Bracket controller handling draw generation and bracket operations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Response, NextFunction} from 'express';
import {Not, In} from 'typeorm';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Bracket} from '../../domain/entities/bracket.entity';
import {Match} from '../../domain/entities/match.entity';
import {Phase} from '../../domain/entities/phase.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {Score} from '../../domain/entities/score.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {MatchGeneratorService} from '../../application/services/match-generator.service';
import {SeedingService} from '../../application/services/seeding.service';
import {RegistrationStatus} from '../../domain/enumerations/registration-status';
import {AcceptanceType} from '../../domain/enumerations/acceptance-type';

/**
 * Bracket controller.
 */
export class BracketController {
  private readonly matchGenerator: MatchGeneratorService;

  /**
   * Creates a new bracket controller instance.
   */
  public constructor() {
    this.matchGenerator = new MatchGeneratorService();
  }

  /**
   * POST /api/brackets
   * Generates a bracket for a category with matches and phases.
   * Replaces any existing unpublished bracket for the same category.
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bracketRepository = AppDataSource.getRepository(Bracket);
      const matchRepository = AppDataSource.getRepository(Match);
      const phaseRepository = AppDataSource.getRepository(Phase);
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      const {categoryId} = req.body;
      
      console.log(`📋 Creating bracket for category ${categoryId}...`);
      
      // Check for existing brackets in this category
      const existingBrackets = await bracketRepository.find({
        where: {categoryId},
      });
      
      console.log(`📊 Found ${existingBrackets.length} existing bracket(s) for category ${categoryId}`);
      
      // Check if any published brackets exist
      const publishedBracket = existingBrackets.find(b => b.isPublished);
      if (publishedBracket) {
        console.log(`❌ Cannot create bracket: Published bracket ${publishedBracket.id} already exists`);
        throw new AppError(
          'A published bracket already exists for this category. Cannot create a new bracket.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_OPERATION
        );
      }
      
      // Delete unpublished brackets and their related data
      for (const oldBracket of existingBrackets) {
        if (!oldBracket.isPublished) {
          console.log(`🗑️ Deleting unpublished bracket ${oldBracket.id}...`);
          
          try {
            // Delete matches first (foreign key constraint)
            const matchDeleteResult = await matchRepository.delete({bracketId: oldBracket.id});
            console.log(`  Deleted ${matchDeleteResult.affected || 0} matches`);
            
            // Delete phases
            const phaseDeleteResult = await phaseRepository.delete({bracketId: oldBracket.id});
            console.log(`  Deleted ${phaseDeleteResult.affected || 0} phases`);
            
            // Delete bracket
            const bracketDeleteResult = await bracketRepository.delete(oldBracket.id);
            console.log(`  Deleted ${bracketDeleteResult.affected || 0} bracket(s)`);
            
            console.log(`✅ Deleted unpublished bracket ${oldBracket.id} and its data`);
          } catch (deleteError) {
            console.error(`❌ Error deleting bracket ${oldBracket.id}:`, deleteError);
            throw new AppError(
              `Failed to delete existing bracket: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`,
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              ERROR_CODES.DATABASE_ERROR
            );
          }
        }
      }
      
      // Create new bracket entity
      const bracket = bracketRepository.create({
        ...req.body,
        id: generateId('brk'),
      });
      
      console.log(`💾 Saving new bracket...`);
      const savedBracket = await bracketRepository.save(bracket);
      console.log(`✅ Bracket ${savedBracket.id} saved successfully`);
      
      // Get accepted participants for the category (excluding ALTERNATE and WITHDRAWN)
      // ALTERNATE players are on the waiting list and should not be in the bracket draw
      // WITHDRAWN players have withdrawn from the tournament
      const registrations = await registrationRepository.find({
        where: {
          categoryId: savedBracket.categoryId,
          status: RegistrationStatus.ACCEPTED,
          acceptanceType: Not(In([AcceptanceType.ALTERNATE, AcceptanceType.WITHDRAWN])),
        },
        relations: ['participant'], // Include participant data for ranking information
      });
      
      console.log(`📊 Found ${registrations.length} ACCEPTED registrations for category ${savedBracket.categoryId} (excluding ALTERNATE/WITHDRAWN)`);
      
      // Generate matches and phases based on bracket type
      if (registrations.length >= 2) {
        // Calculate bracket size (next power of 2)
        const participantCount = registrations.length;
        const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));
        
        // Apply seeding: sort by ranking and assign seed numbers
        const {participantIds, seededParticipants} = SeedingService.seedBracket(
          registrations,
          bracketSize,
        );
        
        console.log(`🎾 Generating seeded bracket: ${registrations.length} participants, bracket size ${bracketSize}`);
        console.log(`🏆 Seeding:`, seededParticipants.map(p => `Seed #${p.seedNumber} (Ranking: ${p.ranking ?? 'N/A'})`));
        
        // Save seed numbers to registration entities
        for (const seededParticipant of seededParticipants) {
          await registrationRepository.update(
            seededParticipant.registration.id,
            {seedNumber: seededParticipant.seedNumber},
          );
        }
        console.log(`✅ Seed numbers saved to ${seededParticipants.length} registrations`);
        
        // Generate matches with seeded participant order
        const {matches, phases} = this.matchGenerator.generateMatches(
          savedBracket.id,
          savedBracket.tournamentId,
          savedBracket.bracketType,
          participantIds,
          savedBracket.totalRounds,
        );
        
        console.log(`💾 Saving ${phases.length} phases...`);
        // Save phases first (matches reference them)
        await phaseRepository.save(phases);
        
        console.log(`💾 Saving ${matches.length} matches...`);
        // Save generated matches
        await matchRepository.save(matches);
        
        console.log(`✅ Generated ${matches.length} matches across ${phases.length} phases for bracket ${savedBracket.id}`);
      } else {
        console.log(`⚠️ Not enough participants (${registrations.length}) to generate matches. Need at least 2 ACCEPTED registrations.`);
      }
      
      res.status(HTTP_STATUS.CREATED).json(savedBracket);
    } catch (error) {
      console.error('❌ Error creating bracket:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      next(error);
    }
  }
  
  /**
   * POST /api/brackets/:id/regenerate
   * Regenerates bracket matches/phases with updated registration seeds.
   * Deletes all existing matches, scores, and phases, then creates new ones.
   */
  public async regenerate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      
      console.log(`🔄 Regenerating bracket ${id}...`);
      
      const bracketRepository = AppDataSource.getRepository(Bracket);
      const matchRepository = AppDataSource.getRepository(Match);
      const phaseRepository = AppDataSource.getRepository(Phase);
      const registrationRepository = AppDataSource.getRepository(Registration);
      const scoreRepository = AppDataSource.getRepository(Score);
      
      // Fetch bracket
      const bracket = await bracketRepository.findOne({where: {id}});
      if (!bracket) {
        throw new AppError('Bracket not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
      }
      
      // Validate: cannot regenerate published bracket
      if (bracket.isPublished) {
        throw new AppError(
          'Cannot regenerate a published bracket. Unpublish it first to make changes.',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_OPERATION
        );
      }
      
      // Check if there are completed matches (for logging/warning)
      const existingMatches = await matchRepository.find({where: {bracketId: id}});
      const matchIds = existingMatches.map(m => m.id);
      let scoreCount = 0;
      
      if (matchIds.length > 0) {
        scoreCount = await scoreRepository
          .createQueryBuilder('score')
          .where('score.matchId IN (:...matchIds)', {matchIds})
          .getCount();
      }
      
      if (scoreCount > 0) {
        console.warn(`⚠️ Regenerating bracket ${id} with ${scoreCount} completed match(es). All scores will be deleted.`);
      }
      
      // Delete existing scores, matches, and phases (always regenerate from scratch)
      console.log(`🗑️ Deleting existing scores, matches, and phases...`);
      
      // Step 1: Delete scores first (foreign key references matches)
      // Note: existingMatches and matchIds already fetched above for validation
      if (matchIds.length > 0) {
        const scoreDeleteResult = await scoreRepository
          .createQueryBuilder()
          .delete()
          .where('matchId IN (:...matchIds)', {matchIds})
          .execute();
        console.log(`  Deleted ${scoreDeleteResult.affected || 0} scores`);
      }
      
      // Step 2: Delete matches
      const matchDeleteResult = await matchRepository.delete({bracketId: id});
      console.log(`  Deleted ${matchDeleteResult.affected || 0} matches`);
      
      // Step 3: Delete phases
      const phaseDeleteResult = await phaseRepository.delete({bracketId: id});
      console.log(`  Deleted ${phaseDeleteResult.affected || 0} phases`);
      
      // Fetch UPDATED accepted registrations (with new seed numbers!)
      const registrations = await registrationRepository.find({
        where: {
          categoryId: bracket.categoryId,
          status: RegistrationStatus.ACCEPTED,
          acceptanceType: Not(In([AcceptanceType.ALTERNATE, AcceptanceType.WITHDRAWN])),
        },
        relations: ['participant'],
      });
      
      console.log(`📊 Found ${registrations.length} ACCEPTED registrations for category ${bracket.categoryId}`);
      
      if (registrations.length < 2) {
        throw new AppError(
          'At least 2 accepted participants are required to regenerate bracket',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_OPERATION
        );
      }
      
      // Calculate bracket size
      const participantCount = registrations.length;
      const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));
      
      // Apply UPDATED seeding (uses current seedNumber from registrations)
      const {participantIds, seededParticipants} = SeedingService.seedBracket(
        registrations,
        bracketSize,
      );
      
      console.log(`🎾 Regenerating bracket with updated seeds:`);
      console.log(`🏆 Seeding:`, seededParticipants.map(p => 
        `Seed #${p.seedNumber} - ${p.registration.participant?.firstName} ${p.registration.participant?.lastName}`
      ));
      
      // Generate new matches with updated seeding
      const {matches, phases} = this.matchGenerator.generateMatches(
        bracket.id,
        bracket.tournamentId,
        bracket.bracketType,
        participantIds,
        bracket.totalRounds,
      );
      
      console.log(`💾 Saving ${phases.length} phases and ${matches.length} matches...`);
      await phaseRepository.save(phases);
      await matchRepository.save(matches);
      
      console.log(`✅ Bracket ${id} regenerated successfully with ${matches.length} matches`);
      
      res.status(HTTP_STATUS.OK).json(bracket);
    } catch (error) {
      console.error('❌ Error regenerating bracket:', error);
      next(error);
    }
  }

  /**
   * GET /api/brackets/:id
   * Retrieves bracket details.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const bracketRepository = AppDataSource.getRepository(Bracket);
      
      const bracket = await bracketRepository.findOne({
        where: {id},
        relations: ['phases', 'matches'],
      });
      
      if (!bracket) {
        throw new AppError('Bracket not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      res.status(HTTP_STATUS.OK).json(bracket);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/brackets
   * Lists brackets for a tournament.
   */
  public async getByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.query;
      const bracketRepository = AppDataSource.getRepository(Bracket);
      
      if (!tournamentId) {
        throw new AppError('tournamentId query parameter is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const brackets = await bracketRepository.find({
        where: {tournamentId: tournamentId as string},
      });
      
      res.status(HTTP_STATUS.OK).json(brackets);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * PUT /api/brackets/:id
   * Updates bracket data (e.g., publishing, regenerating).
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const bracketRepository = AppDataSource.getRepository(Bracket);
      
      const bracket = await bracketRepository.findOne({where: {id}});
      
      if (!bracket) {
        throw new AppError('Bracket not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Update bracket fields
      Object.assign(bracket, req.body);
      
      const updatedBracket = await bracketRepository.save(bracket);
      
      res.status(HTTP_STATUS.OK).json(updatedBracket);
    } catch (error) {
      next(error);
    }
  }
}
