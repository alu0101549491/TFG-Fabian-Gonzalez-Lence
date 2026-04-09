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
import {TournamentStatus} from '../../domain/enumerations/tournament-status';
import {PrivacyService} from '../../application/services/privacy.service';
import {NotificationService} from '../../application/services/notification.service';
import {Tournament} from '../../domain/entities/tournament.entity';

/**
 * Registration controller.
 */
export class RegistrationController {
  private readonly privacyService: PrivacyService;
  private readonly notificationService: NotificationService;

  constructor() {
    this.privacyService = new PrivacyService();
    this.notificationService = new NotificationService();
  }
  
  /**
   * Applies privacy filtering to participant data in registrations.
   * Filters participant field based on viewer permissions and tournament context.
   * 
   * @param registrations - Array of registrations with unfiltered participant data
   * @param viewer - Viewing user (null if unauthenticated)
   * @param tournamentId - Tournament context for privacy checks (optional)
   * @returns Registrations with privacy-filtered participant data
   */
  private async applyPrivacyToRegistrations(
    registrations: Registration[],
    viewer: User | null,
    tournamentId?: string
  ): Promise<any[]> {
    return Promise.all(registrations.map(async (registration) => {
      const filteredRegistration = {...registration};
      
      // Filter participant if present
      if (registration.participant) {
        filteredRegistration.participant = await this.privacyService.filterUserData(
          registration.participant,
          viewer,
          tournamentId
        );
      }
      
      return filteredRegistration;
    }));
  }
  
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
      const tournamentRepository = AppDataSource.getRepository(Tournament);
      
      const {categoryId, participantId} = req.body;
      const actualParticipantId = participantId || req.user!.id;
      
      // Validate category exists
      const category = await categoryRepository.findOne({
        where: {id: categoryId},
        relations: ['tournament'],
      });
      if (!category) {
        throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Get tournament to check registration deadline and status
      const tournament = await tournamentRepository.findOne({
        where: {id: category.tournamentId},
      });
      if (!tournament) {
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Check tournament status
      if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
        throw new AppError(
          'Tournament registration is not currently open',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_OPERATION
        );
      }
      
      // Check registration deadline
      if (tournament.registrationCloseDate) {
        const now = new Date();
        const deadline = new Date(tournament.registrationCloseDate);
        
        if (now > deadline) {
          throw new AppError(
            `Registration deadline was ${deadline.toLocaleDateString()}. Registrations are now closed.`,
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_OPERATION
          );
        }
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
      
      // Get viewer from JWT token (null if not authenticated)
      const userRepository = AppDataSource.getRepository(User);
      const viewer = req.user ? await userRepository.findOne({where: {id: req.user.id}}) : null;
      
      // Apply privacy filtering to participant data
      const privacyFilteredRegistrations = await this.applyPrivacyToRegistrations(
        registrations,
        viewer,
        tournamentId as string | undefined
      );
      
      res.status(HTTP_STATUS.OK).json(privacyFilteredRegistrations);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /api/registrations/:id
   * Gets a single registration by ID with privacy filtering applied.
   * Privacy enforcement: Filters participant data based on viewer permissions.
   */
  public async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const registrationRepository = AppDataSource.getRepository(Registration);
      const userRepository = AppDataSource.getRepository(User);
      
      const registration = await registrationRepository.findOne({
        where: {id},
        relations: ['participant', 'category', 'tournament'],
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
      
      // Get viewer from JWT token (null if not authenticated)
      const viewer = req.user ? await userRepository.findOne({where: {id: req.user.id}}) : null;
      
      // Apply privacy filtering to participant data
      const privacyFilteredRegistrations = await this.applyPrivacyToRegistrations(
        [registration],
        viewer,
        registration.tournamentId
      );
      
      res.status(HTTP_STATUS.OK).json(privacyFilteredRegistrations[0]);
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
   * Security: Players can only withdraw their own registrations.
   */
  public async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {status, acceptanceType} = req.body;
      const currentUser = req.user;
      
      if (!currentUser) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }
      
      console.log(`📝 Updating registration ${id}:`);
      console.log(`  - New status: ${status}`);
      console.log(`  - User: ${currentUser.id} (${currentUser.role})`);
      if (acceptanceType) console.log(`  - New acceptance type: ${acceptanceType}`);
      
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      const registration = await registrationRepository.findOne({where: {id}});
      
      if (!registration) {
        console.log(`❌ Registration ${id} not found`);
        throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Authorization: Players can only withdraw their own registrations
      if (currentUser.role === 'PLAYER') {
        // Check if player owns this registration
        if (registration.participantId !== currentUser.id) {
          console.log(`❌ Player ${currentUser.id} attempting to modify registration owned by ${registration.participantId}`);
          throw new AppError(
            'You can only withdraw your own registrations',
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.FORBIDDEN
          );
        }
        
        // Players can only set status to WITHDRAWN
        if (status !== RegistrationStatus.WITHDRAWN) {
          console.log(`❌ Player attempting to set status to ${status} (only WITHDRAWN allowed)`);
          throw new AppError(
            'Players can only withdraw from tournaments',
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.FORBIDDEN
          );
        }
        
        // Players cannot change acceptance type
        if (acceptanceType) {
          console.log(`❌ Player attempting to change acceptance type (not allowed)`);
          throw new AppError(
            'Players cannot change acceptance type',
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.FORBIDDEN
          );
        }
        
        console.log(`✅ Authorization passed: Player withdrawing own registration`);
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
      
      // Send notification when registration is accepted
      if (status === RegistrationStatus.ACCEPTED) {
        try {
          // Load tournament name for notification
          const tournamentRepository = AppDataSource.getRepository(Tournament);
          const tournament = await tournamentRepository.findOne({
            where: {id: saved.tournamentId},
            select: ['name', 'id'],
          });
          
          if (tournament) {
            await this.notificationService.notifyRegistrationConfirmed(
              saved.participantId,
              tournament.name,
              tournament.id,
              saved.acceptanceType || 'DIRECT_ACCEPTANCE',
            );
            console.log(`📧 Sent registration confirmation notification to participant ${saved.participantId}`);
          }
        } catch (notifError) {
          // Don't fail the request if notification fails
          console.error('⚠️ Failed to send registration confirmation notification:', notifError);
        }
      }
      
      res.status(HTTP_STATUS.OK).json(saved);
    } catch (error) {
      console.error('❌ Error updating registration status:', error);
      next(error);
    }
  }

  /**
   * PUT /api/registrations/:id
   * Updates registration (e.g., seed number).
   * Security: Only admins can update registrations.
   * Validates seed number uniqueness within category.
   * 
   * @param {AuthRequest} req - Request with registration ID and update data
   * @param {Response} res - Response with updated registration
   * @param {NextFunction} next - Error handler
   */
  public async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {seedNumber} = req.body;
      const currentUser = req.user;
      
      if (!currentUser) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }
      
      console.log(`📝 Updating registration ${id}:`);
      console.log(`  - New seed number: ${seedNumber}`);
      console.log(`  - User: ${currentUser.id} (${currentUser.role})`);
      
      const registrationRepository = AppDataSource.getRepository(Registration);
      
      const registration = await registrationRepository.findOne({where: {id}});
      
      if (!registration) {
        console.log(`❌ Registration ${id} not found`);
        throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      
      // Validate seed number if provided
      if (seedNumber !== undefined && seedNumber !== null) {
        // Must be a positive integer
        if (!Number.isInteger(seedNumber) || seedNumber < 1) {
          throw new AppError(
            'Seed number must be a positive integer',
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_INPUT
          );
        }
        
        // Check for duplicate seed number in the same category
        const duplicateSeed = await registrationRepository
          .createQueryBuilder('registration')
          .where('registration.categoryId = :categoryId', {categoryId: registration.categoryId})
          .andWhere('registration.id != :currentId', {currentId: id})
          .andWhere('registration.seedNumber = :seedNumber', {seedNumber})
          .getOne();
        
        if (duplicateSeed) {
          console.log(`❌ Seed number ${seedNumber} already assigned to registration ${duplicateSeed.id}`);
          throw new AppError(
            `Seed number ${seedNumber} is already assigned to another player in this category`,
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR
          );
        }
        
        console.log(`✅ Seed number validation passed`);
      }
      
      // Update seed number
      registration.seedNumber = seedNumber;
      const saved = await registrationRepository.save(registration);
      
      // Reload with relations for consistent response format
      const updatedRegistration = await registrationRepository.findOne({
        where: {id},
        relations: ['participant', 'category'],
      });
      
      console.log(`✅ Registration ${id} updated successfully`);
      console.log(`  - New seed number: ${saved.seedNumber}`);
      
      res.status(HTTP_STATUS.OK).json(updatedRegistration);
    } catch (error) {
      console.error('❌ Error updating registration:', error);
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
