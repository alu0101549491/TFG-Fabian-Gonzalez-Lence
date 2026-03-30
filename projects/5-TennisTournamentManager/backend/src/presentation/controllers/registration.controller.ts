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
import {Category} from '../../domain/entities/category.entity';
import {User} from '../../domain/entities/user.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {RegistrationStatus} from '../../domain/enumerations/registration-status';
import {AcceptanceType} from '../../domain/enumerations/acceptance-type';

/**
 * Registration controller.
 */
export class RegistrationController {
  /**
   * POST /api/registrations
   * Creates a tournament registration with quota management (FR12).
   * Automatically assigns DIRECT_ACCEPTANCE or ALTERNATE based on capacity.
   */
  public async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrationRepository = AppDataSource.getRepository(Registration);
      const categoryRepository = AppDataSource.getRepository(Category);
      const userRepository = AppDataSource.getRepository(User);
      
      const {categoryId, participantId} = req.body;
      const actualParticipantId = participantId || req.user!.id;
      
      // Validate category exists
      const category = await categoryRepository.findOne({where: {id: categoryId}});
      if (!category) {
        throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Get participant for ranking information
      const participant = await userRepository.findOne({where: {id: actualParticipantId}});
      if (!participant) {
        throw new AppError('Participant not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // FR12: Count current active registrations for this category
      // Only ACCEPTED registrations with DA or LL count toward the quota
      const activeRegistrations = await registrationRepository
        .createQueryBuilder('registration')
        .where('registration.categoryId = :categoryId', {categoryId})
        .andWhere('registration.status = :acceptedStatus', {
          acceptedStatus: RegistrationStatus.ACCEPTED
        })
        .andWhere('registration.acceptanceType IN (:...countedTypes)', {
          countedTypes: [AcceptanceType.DIRECT_ACCEPTANCE, AcceptanceType.LUCKY_LOSER]
        })
        .getCount();
      
      // FR12: Determine acceptance type based on quota
      let acceptanceType: AcceptanceType;
      const spotsAvailable = category.maxParticipants - activeRegistrations;
      
      if (spotsAvailable > 0) {
        // Direct acceptance - spots available
        acceptanceType = AcceptanceType.DIRECT_ACCEPTANCE;
        console.log(`✅ [Quota] Spots available: ${spotsAvailable}/${category.maxParticipants} - Assigning DA`);
      } else {
        // Category is full - assign to waiting list
        acceptanceType = AcceptanceType.ALTERNATE;
        
        // Count current alternates for position in waiting list
        const alternateCount = await registrationRepository
          .createQueryBuilder('registration')
          .where('registration.categoryId = :categoryId', {categoryId})
          .andWhere('registration.acceptanceType = :alternate', {alternate: AcceptanceType.ALTERNATE})
          .andWhere('registration.status NOT IN (:...excludedStatuses)', {
            excludedStatuses: [RegistrationStatus.CANCELLED, RegistrationStatus.WITHDRAWN]
          })
          .getCount();
        
        console.log(`⚠️ [Quota] Category FULL (${category.maxParticipants}/${category.maxParticipants}) - Assigning ALT #${alternateCount + 1}`);
      }
      
      const registration = registrationRepository.create({
        ...req.body,
        id: generateId('reg'),
        participantId: actualParticipantId,
        acceptanceType,
        status: RegistrationStatus.PENDING,
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
        relations: ['participant', 'tournament', 'category'],
      });
      
      // 🔧 Backward compatibility: Fix legacy registrations without acceptanceType
      // Existing registrations created before acceptanceType was added may have NULL/undefined
      // For ACCEPTED registrations without acceptanceType, default to DIRECT_ACCEPTANCE
      let fixedCount = 0;
      for (const reg of registrations) {
        if (reg.status === RegistrationStatus.ACCEPTED && !reg.acceptanceType) {
          reg.acceptanceType = AcceptanceType.DIRECT_ACCEPTANCE;
          await registrationRepository.save(reg);
          fixedCount++;
          console.log(`🔧 Auto-fixed legacy registration ${reg.id}: set acceptanceType to DIRECT_ACCEPTANCE`);
        }
      }
      if (fixedCount > 0) {
        console.log(`✅ Fixed ${fixedCount} legacy registration(s) with missing acceptanceType`);
      }
      
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
      
      // 🔧 Backward compatibility: Fix legacy registration without acceptanceType
      if (registration.status === RegistrationStatus.ACCEPTED && !registration.acceptanceType) {
        registration.acceptanceType = AcceptanceType.DIRECT_ACCEPTANCE;
        await registrationRepository.save(registration);
        console.log(`🔧 Auto-fixed legacy registration ${registration.id}: set acceptanceType to DIRECT_ACCEPTANCE`);
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
  /**
   * PATCH /api/registrations/:id/status
   * Updates registration status and optionally acceptance type.
   * FR12: Enforces quota when approving with DA/LL acceptance type.
   */
  public async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {status, acceptanceType} = req.body;
      
      console.log(`📝 Updating registration ${id}:`);
      console.log(`  - New status: ${status}`);
      if (acceptanceType) console.log(`  - New acceptance type: ${acceptanceType}`);
      
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      const registration = await registrationRepository.findOne({where: {id}});
      
      if (!registration) {
        console.log(`❌ Registration ${id} not found`);
        throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      console.log(`📊 Current state:`);
      console.log(`  - Status: ${registration.status} → ${status}`);
      console.log(`  - Acceptance Type: ${registration.acceptanceType}${acceptanceType ? ` → ${acceptanceType}` : ''}`);
      console.log(`👤 Participant: ${registration.participantId}, Category: ${registration.categoryId}`);
      
      // Update acceptance type if provided (admin manually setting as ALTERNATE)
      if (acceptanceType) {
        registration.acceptanceType = acceptanceType;
        console.log(`🎫 Acceptance type changed to: ${acceptanceType}`);
      }
      
      // FR12: Quota enforcement when approving registrations with DA or LL
      if (status === RegistrationStatus.ACCEPTED) {
        // Only check quota if accepting as DIRECT_ACCEPTANCE or LUCKY_LOSER
        // ALTERNATE acceptances don't count toward quota
        const currentAcceptanceType = registration.acceptanceType;
        
        if (currentAcceptanceType === AcceptanceType.DIRECT_ACCEPTANCE || 
            currentAcceptanceType === AcceptanceType.LUCKY_LOSER) {
          
          const categoryRepository = AppDataSource.getRepository(Category);
          const category = await categoryRepository.findOne({
            where: {id: registration.categoryId}
          });
          
          if (category) {
            // Count currently ACCEPTED registrations with DA or LL (excluding this one)
            const acceptedCount = await registrationRepository
              .createQueryBuilder('registration')
              .where('registration.categoryId = :categoryId', {categoryId: registration.categoryId})
              .andWhere('registration.id != :currentId', {currentId: id})
              .andWhere('registration.status = :acceptedStatus', {
                acceptedStatus: RegistrationStatus.ACCEPTED
              })
              .andWhere('registration.acceptanceType IN (:...countedTypes)', {
                countedTypes: [AcceptanceType.DIRECT_ACCEPTANCE, AcceptanceType.LUCKY_LOSER]
              })
              .getCount();
            
            if (acceptedCount >= category.maxParticipants) {
              console.log(`⚠️ [Quota] Cannot approve as DA/LL - Category FULL (${acceptedCount}/${category.maxParticipants})`);
              throw new AppError(
                `Cannot approve registration: Category is full (${acceptedCount}/${category.maxParticipants} spots taken). Set as ALTERNATE instead.`,
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.VALIDATION_ERROR
              );
            }
            
            console.log(`✅ [Quota] Approval OK - ${acceptedCount + 1}/${category.maxParticipants} spots will be filled`);
          }
        } else if (currentAcceptanceType === AcceptanceType.ALTERNATE) {
          // Approving an ALTERNATE keeps them on waiting list with ACCEPTED status
          console.log(`⏳ [Quota] Approving ALTERNATE - remains on waiting list (doesn't count toward quota)`);
        }
      }
      
      registration.status = status;
      const saved = await registrationRepository.save(registration);
      
      console.log(`✅ Registration ${id} updated successfully`);
      console.log(`  - Final status: ${saved.status}`);
      console.log(`  - Final acceptance type: ${saved.acceptanceType}`);
      
      res.status(HTTP_STATUS.OK).json(saved);
    } catch (error) {
      console.error('❌ Error updating registration status:', error);
      next(error);
    }
  }

  /**
   * POST /api/registrations/migrate-acceptance-types
   * Migration endpoint to fix existing registrations without acceptanceType.
   * Sets all null/undefined acceptanceType to DIRECT_ACCEPTANCE.
   */
  public async migrateAcceptanceTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      // Find all registrations with null/undefined acceptanceType
      const registrations = await registrationRepository.find();
      
      let updatedCount = 0;
      
      for (const registration of registrations) {
        if (!registration.acceptanceType) {
          registration.acceptanceType = AcceptanceType.DIRECT_ACCEPTANCE;
          await registrationRepository.save(registration);
          updatedCount++;
          console.log(`✅ Updated registration ${registration.id} - set acceptanceType to DIRECT_ACCEPTANCE`);
        }
      }
      
      console.log(`✅ Migration complete: Updated ${updatedCount} registrations`);
      
      res.status(HTTP_STATUS.OK).json({
        message: `Successfully updated ${updatedCount} registrations`,
        updatedCount,
      });
    } catch (error) {
      console.error('❌ Error migrating acceptance types:', error);
      next(error);
    }
  }
}
