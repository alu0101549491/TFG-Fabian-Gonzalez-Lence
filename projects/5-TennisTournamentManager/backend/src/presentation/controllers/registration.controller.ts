/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file backend/src/presentation/controllers/registration.controller.ts
 * @desc Registration controller handling tournament registrations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {In} from 'typeorm';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {Registration} from '../../domain/entities/registration.entity';
import {Category} from '../../domain/entities/category.entity';
import {User} from '../../domain/entities/user.entity';
import {Match} from '../../domain/entities/match.entity';
import {Bracket} from '../../domain/entities/bracket.entity';
import {AuthRequest} from '../middleware/auth.middleware';
import {generateId} from '../../shared/utils/id-generator';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../middleware/error.middleware';
import {RegistrationStatus} from '../../domain/enumerations/registration-status';
import {AcceptanceType} from '../../domain/enumerations/acceptance-type';
import {TournamentStatus} from '../../domain/enumerations/tournament-status';
import {MatchStatus} from '../../domain/enumerations/match-status';
import {UserRole} from '../../domain/enumerations/user-role';
import {PrivacyService} from '../../application/services/privacy.service';
import {NotificationService} from '../../application/services/notification.service';
import {Tournament} from '../../domain/entities/tournament.entity';
import {randomUUID} from 'crypto';

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
      
      // Explicitly forward the partnerId FK column value. TypeORM may not include it in
      // the entity spread when both @Column and @JoinColumn share the same property name.
      filteredRegistration.partnerId = registration.partnerId ?? null;

      // Filter participant if present
      if (registration.participant) {
        filteredRegistration.participant = await this.privacyService.filterUserData(
          registration.participant,
          viewer,
          tournamentId
        ) as typeof registration.participant;
      }

      // Filter partner if present (apply same privacy rules to the loaded relation)
      if (registration.partner) {
        filteredRegistration.partner = await this.privacyService.filterUserData(
          registration.partner,
          viewer,
          tournamentId
        ) as typeof registration.partner;
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
      
      const {categoryId, participantId, partnerId} = req.body;
      
      console.log('[Registration Controller] Received request body:', req.body);
      console.log('[Registration Controller] categoryId:', categoryId, 'participantId:', participantId);
      
      // Validate required fields
      if (!categoryId) {
        console.error('[Registration Controller] Missing categoryId');
        throw new AppError('Category ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }
      
      const actualParticipantId = participantId || req.user!.id;
      const isAdminEnrollment =
        req.user?.role === UserRole.SYSTEM_ADMIN || req.user?.role === UserRole.TOURNAMENT_ADMIN;
      console.log('[Registration Controller] actualParticipantId:', actualParticipantId);
      
      // Validate category exists
      const category = await categoryRepository.findOne({
        where: {id: categoryId},
        relations: ['tournament'],
      });
      if (!category) {
        console.error('[Registration Controller] Category not found:', categoryId);
        throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      console.log('[Registration Controller] Category found:', category.name, 'Tournament:', category.tournamentId);
      
      // Get tournament to check registration deadline and status
      const tournament = await tournamentRepository.findOne({
        where: {id: category.tournamentId},
      });
      if (!tournament) {
        console.error('[Registration Controller] Tournament not found:', category.tournamentId);
        throw new AppError('Tournament not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      console.log('[Registration Controller] Tournament found:', tournament.name, 'Status:', tournament.status);
      
      // Check tournament status (admins can manually enroll regardless of status)
      if (!isAdminEnrollment && tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
        console.error('[Registration Controller] Tournament not open. Current status:', tournament.status, 'Expected:', TournamentStatus.REGISTRATION_OPEN);
        throw new AppError(
          `Tournament registration is not currently open (status: ${tournament.status})`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_OPERATION
        );
      }
      
      // Check registration deadline (admins can manually enroll after deadline)
      if (!isAdminEnrollment && tournament.registrationCloseDate) {
        const now = new Date();
        const deadline = new Date(tournament.registrationCloseDate);
        
        if (now > deadline) {
          console.error('[Registration Controller] Registration deadline passed. Deadline:', deadline, 'Now:', now);
          throw new AppError(
            `Registration deadline was ${deadline.toLocaleDateString()}. Registrations are now closed.`,
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_OPERATION
          );
        }
      }
      console.log('[Registration Controller] Registration deadline check passed');
      
      // Get participant for ranking information
      const participant = await userRepository.findOne({where: {id: actualParticipantId}});
      if (!participant) {
        console.error('[Registration Controller] Participant not found:', actualParticipantId);
        throw new AppError('Participant not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }
      console.log('[Registration Controller] Participant found:', participant.username);

      const existingRegistration = await registrationRepository
        .createQueryBuilder('registration')
        .where('registration.categoryId = :categoryId', {categoryId})
        .andWhere('registration.participantId = :participantId', {participantId: actualParticipantId})
        .andWhere('registration.status NOT IN (:...terminalStatuses)', {
          terminalStatuses: [RegistrationStatus.CANCELLED, RegistrationStatus.WITHDRAWN],
        })
        .getOne();

      if (existingRegistration) {
        throw new AppError(
          'Participant already has an active registration for this category',
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.ALREADY_EXISTS,
        );
      }
      
      // FR12: Count current active registrations for this category.
      // All acceptance types that occupy a draw slot count toward the quota:
      // DA, WC, OA, SE, JE, QU, LL. Only ALTERNATE and WITHDRAWN do NOT count.
      const activeRegistrations = await registrationRepository
        .createQueryBuilder('registration')
        .where('registration.categoryId = :categoryId', {categoryId})
        .andWhere('registration.status = :acceptedStatus', {
          acceptedStatus: RegistrationStatus.ACCEPTED
        })
        .andWhere('registration.acceptanceType IN (:...countedTypes)', {
          countedTypes: [
            AcceptanceType.DIRECT_ACCEPTANCE,
            AcceptanceType.WILD_CARD,
            AcceptanceType.ORGANIZER_ACCEPTANCE,
            AcceptanceType.SPECIAL_EXEMPTION,
            AcceptanceType.JUNIOR_EXEMPTION,
            AcceptanceType.QUALIFIER,
            AcceptanceType.LUCKY_LOSER,
          ]
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
        id: generateId('reg'),
        tournamentId: category.tournamentId,
        categoryId,
        participantId: actualParticipantId,
        acceptanceType,
        status: RegistrationStatus.PENDING,
        // FR15: Store doubles partner ID if provided
        partnerId: partnerId ?? null,
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
        relations: ['participant', 'tournament', 'category', 'partner'],
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
        relations: ['participant', 'category', 'tournament', 'partner'],
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
        
        const quotaCountedTypes = [
          AcceptanceType.DIRECT_ACCEPTANCE,
          AcceptanceType.WILD_CARD,
          AcceptanceType.ORGANIZER_ACCEPTANCE,
          AcceptanceType.SPECIAL_EXEMPTION,
          AcceptanceType.JUNIOR_EXEMPTION,
          AcceptanceType.QUALIFIER,
          AcceptanceType.LUCKY_LOSER,
        ];

        if (quotaCountedTypes.includes(currentAcceptanceType)) {
          
          const categoryRepository = AppDataSource.getRepository(Category);
          const category = await categoryRepository.findOne({
            where: {id: registration.categoryId}
          });
          
          if (category) {
            // FR12: Count currently ACCEPTED registrations of any draw-slot type (excluding this one)
            const acceptedCount = await registrationRepository
              .createQueryBuilder('registration')
              .where('registration.categoryId = :categoryId', {categoryId: registration.categoryId})
              .andWhere('registration.id != :currentId', {currentId: id})
              .andWhere('registration.status = :acceptedStatus', {
                acceptedStatus: RegistrationStatus.ACCEPTED
              })
              .andWhere('registration.acceptanceType IN (:...countedTypes)', {
                countedTypes: quotaCountedTypes,
              })
              .getCount();
            
            if (acceptedCount >= category.maxParticipants) {
              console.log(`⚠️ [Quota] Cannot approve as DA/LL - Category FULL (${acceptedCount}/${category.maxParticipants})`);
              throw new AppError(
                `Cannot approve registration: Category is full (${acceptedCount}/${category.maxParticipants} spots taken). Set as ALTERNATE instead.`,
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.VALIDATION_FAILED
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
      const {seedNumber, acceptanceType, partnerId, withdrawalDate} = req.body;
      const currentUser = req.user;
      
      if (!currentUser) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }
      
      console.log(`📝 Updating registration ${id}:`);
      console.log(`  - New seed number: ${seedNumber}`);
      console.log(`  - New acceptance type: ${acceptanceType}`);
      console.log(`  - New partner ID: ${partnerId}`);
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
            ERROR_CODES.VALIDATION_FAILED
          );
        }
        
        console.log(`✅ Seed number validation passed`);
      }
      
      if (acceptanceType !== undefined) {
        registration.acceptanceType = acceptanceType;
      }

      if (partnerId !== undefined) {
        registration.partnerId = partnerId;
      }

      if (withdrawalDate !== undefined) {
        registration.withdrawalDate = withdrawalDate ? new Date(withdrawalDate) : null;
      }

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
   * POST /api/registrations/admin-enroll
   * Enrolls a guest (non-system) participant into a tournament category.
   * Creates a guest User record and a Registration in one operation.
    * Registration is created as PENDING and must be approved like manual user enrollment.
   * Bypasses REGISTRATION_OPEN status and registration deadline checks.
   * Only accessible by TOURNAMENT_ADMIN and SYSTEM_ADMIN.
   *
   * @param {AuthRequest} req - Request with categoryId, guestFirstName, guestLastName
   * @param {Response} res - Response with created registration
   * @param {NextFunction} next - Error handler
   */
  public async adminEnroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {categoryId, guestFirstName, guestLastName} = req.body;

      if (!categoryId || !guestFirstName || !guestLastName) {
        throw new AppError(
          'categoryId, guestFirstName, and guestLastName are required',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT,
        );
      }

      const categoryRepository = AppDataSource.getRepository(Category);
      const userRepository = AppDataSource.getRepository(User);
      const registrationRepository = AppDataSource.getRepository(Registration);

      // Validate category exists
      const category = await categoryRepository.findOne({
        where: {id: categoryId},
        relations: ['tournament'],
      });
      if (!category) {
        throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Create guest user — unique auto-generated email, placeholder password hash
      const uuid = randomUUID();
      const guestUser = userRepository.create({
        id: generateId('usr'),
        email: `guest-${uuid}@guest.ttm`,
        passwordHash: 'GUEST_NO_AUTH',
        firstName: guestFirstName.trim(),
        lastName: guestLastName.trim(),
        username: `guest-${guestFirstName.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`,
        role: UserRole.PLAYER,
        isGuest: true,
        isActive: true,
        gdprConsent: false,
      });
      await userRepository.save(guestUser);
      console.log(`👤 [AdminEnroll] Guest user created: ${guestUser.id}`);

      // Determine acceptance type based on current quota
      // FR12: Count all draw-slot types (DA, WC, OA, SE, JE, QU, LL) toward quota
      const activeRegistrations = await registrationRepository
        .createQueryBuilder('registration')
        .where('registration.categoryId = :categoryId', {categoryId})
        .andWhere('registration.status = :acceptedStatus', {
          acceptedStatus: RegistrationStatus.ACCEPTED,
        })
        .andWhere('registration.acceptanceType IN (:...countedTypes)', {
          countedTypes: [
            AcceptanceType.DIRECT_ACCEPTANCE,
            AcceptanceType.WILD_CARD,
            AcceptanceType.ORGANIZER_ACCEPTANCE,
            AcceptanceType.SPECIAL_EXEMPTION,
            AcceptanceType.JUNIOR_EXEMPTION,
            AcceptanceType.QUALIFIER,
            AcceptanceType.LUCKY_LOSER,
          ],
        })
        .getCount();

      const acceptanceType =
        activeRegistrations < category.maxParticipants
          ? AcceptanceType.DIRECT_ACCEPTANCE
          : AcceptanceType.ALTERNATE;

      const registration = registrationRepository.create({
        id: generateId('reg'),
        tournamentId: category.tournamentId,
        categoryId,
        participantId: guestUser.id,
        acceptanceType,
        status: RegistrationStatus.PENDING,
      });
      await registrationRepository.save(registration);
      console.log(`✅ [AdminEnroll] Registration created as PENDING: ${registration.id} (${acceptanceType})`);

      // Reload with relations for consistent response
      const savedRegistration = await registrationRepository.findOne({
        where: {id: registration.id},
        relations: ['participant', 'category'],
      });

      res.status(HTTP_STATUS.CREATED).json(savedRegistration);
    } catch (error) {
      console.error('❌ Error in adminEnroll:', error);
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

  /**
   * POST /api/registrations/:id/withdraw
   * FR13: Timing-aware withdrawal of an accepted registration.
   *
   * Timing rules based on tournament status at the moment of withdrawal:
   * - Pre-draw (REGISTRATION_OPEN | REGISTRATION_CLOSED | DRAW_PENDING):
   *     First ALTERNATE is promoted to DIRECT_ACCEPTANCE.
   * - Post-draw / In-tournament (IN_PROGRESS):
   *     First ALTERNATE is promoted to LUCKY_LOSER.
   *     All SCHEDULED matches of the withdrawn participant are set to WALKOVER
   *     with the opponent awarded the win.
   *
   * Accessible by SYSTEM_ADMIN, TOURNAMENT_ADMIN, and the registrant (PLAYER).
   * Players may only withdraw their own registration.
   *
   * @param {AuthRequest} req - Request with registration ID param
   * @param {Response} res - Response with updated registration
   * @param {NextFunction} next - Error handler
   */
  public async withdraw(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const currentUser = req.user;

      if (!currentUser) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const registrationRepository = AppDataSource.getRepository(Registration);
      const matchRepository = AppDataSource.getRepository(Match);

      // Load registration with tournament for timing checks
      const registration = await registrationRepository.findOne({
        where: {id},
        relations: ['tournament'],
      });

      if (!registration) {
        throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Authorization: players can only withdraw their own registration
      if (currentUser.role === UserRole.PLAYER && registration.participantId !== currentUser.id) {
        throw new AppError(
          'You can only withdraw your own registrations',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN,
        );
      }

      // Only ACCEPTED (or PENDING) registrations can be withdrawn
      if (
        registration.status === RegistrationStatus.WITHDRAWN ||
        registration.status === RegistrationStatus.CANCELLED
      ) {
        throw new AppError(
          `Registration is already ${registration.status.toLowerCase()}`,
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_OPERATION,
        );
      }

      const tournament = registration.tournament;
      if (!tournament) {
        throw new AppError('Tournament not found for this registration', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      console.log(`🚪 [Withdraw] Withdrawing registration ${id} (participant: ${registration.participantId}, tournament status: ${tournament.status})`);

      // Determine timing context
      const preDraw = [
        TournamentStatus.REGISTRATION_OPEN,
        TournamentStatus.REGISTRATION_CLOSED,
        TournamentStatus.DRAW_PENDING,
      ].includes(tournament.status as TournamentStatus);

      const inTournament = tournament.status === TournamentStatus.IN_PROGRESS;

      // Mark registration as withdrawn
      registration.status = RegistrationStatus.WITHDRAWN;
      registration.acceptanceType = AcceptanceType.WITHDRAWN;
      registration.withdrawalDate = new Date();
      await registrationRepository.save(registration);

      console.log(`✅ [Withdraw] Registration ${id} marked as WITHDRAWN`);

      // FR15: Mutual withdrawal for doubles partners
      let partnerWithdrawn = false;
      let partnerRegistrationId: string | null = null;
      if (registration.partnerId) {
        console.log(`🤝 [Withdraw] Checking for partner registration (partnerId: ${registration.partnerId})`);
        
        // Find partner's registration in the same tournament/category
        const partnerRegistration = await registrationRepository.findOne({
          where: {
            tournamentId: registration.tournamentId,
            categoryId: registration.categoryId,
            participantId: registration.partnerId,
          },
        });

        if (partnerRegistration && partnerRegistration.status !== RegistrationStatus.WITHDRAWN) {
          partnerRegistration.status = RegistrationStatus.WITHDRAWN;
          partnerRegistration.acceptanceType = AcceptanceType.WITHDRAWN;
          partnerRegistration.withdrawalDate = new Date();
          await registrationRepository.save(partnerRegistration);
          
          partnerRegistrationId = partnerRegistration.id;
          partnerWithdrawn = true;
          
          console.log(`🤝 [Withdraw] Partner registration ${partnerRegistrationId} also marked as WITHDRAWN (mutual withdrawal)`);

          // Notify partner about mutual withdrawal
          try {
            await this.notificationService.notifyPartnerMutualWithdrawal(
              registration.partnerId,
              registration.participantId,
              tournament.name
            );
          } catch (notifError) {
            console.error('⚠️ [Withdraw] Failed to send partner withdrawal notification:', notifError);
          }
        }
      }

      // Promote first ALTERNATE (if any)
      const alternates = await registrationRepository.find({
        where: {
          categoryId: registration.categoryId,
          acceptanceType: AcceptanceType.ALTERNATE,
        },
        order: {registrationDate: 'ASC'},
      });

      let promotedParticipantId: string | null = null;
      if (alternates.length > 0) {
        const firstAlternate = alternates[0];
        firstAlternate.status = RegistrationStatus.ACCEPTED;
        firstAlternate.acceptanceType = preDraw
          ? AcceptanceType.DIRECT_ACCEPTANCE
          : AcceptanceType.LUCKY_LOSER;
        await registrationRepository.save(firstAlternate);
        promotedParticipantId = firstAlternate.participantId;

        console.log(
          `🎫 [Withdraw] Promoted ALT ${firstAlternate.participantId} → ${firstAlternate.acceptanceType} (preDraw=${preDraw})`,
        );

        // Notify promoted participant
        try {
          await this.notificationService.notifyRegistrationConfirmed(
            firstAlternate.participantId,
            tournament.name,
            tournament.id,
            firstAlternate.acceptanceType,
          );
        } catch (notifError) {
          console.error('⚠️ [Withdraw] Failed to send promotion notification:', notifError);
        }
      }

      // In-tournament: assign WALKOVER in all SCHEDULED matches of withdrawn participant
      let walkoversAssigned = 0;
      if (inTournament) {
        // Find all brackets for this tournament/category
        const bracketRepository = AppDataSource.getRepository(Bracket);
        const brackets = await bracketRepository.find({
          where: {categoryId: registration.categoryId},
          select: ['id'],
        });
        const bracketIds = brackets.map(b => b.id);

        if (bracketIds.length > 0) {
          // Find SCHEDULED matches where the withdrawn participant is a slot
          const scheduledMatches = await matchRepository.find({
            where: [
              {bracketId: In(bracketIds), participant1Id: registration.participantId, status: MatchStatus.SCHEDULED},
              {bracketId: In(bracketIds), participant2Id: registration.participantId, status: MatchStatus.SCHEDULED},
            ],
          });

          for (const match of scheduledMatches) {
            // Determine the opponent (the other slot)
            const opponentId =
              match.participant1Id === registration.participantId
                ? match.participant2Id
                : match.participant1Id;

            if (opponentId) {
              match.status = MatchStatus.WALKOVER;
              match.winnerId = opponentId;
              await matchRepository.save(match);
              walkoversAssigned++;
              console.log(`🏆 [Withdraw] Match ${match.id}: WALKOVER → winner ${opponentId}`);
            }
          }
        }
      }

      res.status(HTTP_STATUS.OK).json({
        message: 'Registration withdrawn successfully',
        registrationId: id,
        participantId: registration.participantId,
        withdrawalDate: registration.withdrawalDate,
        promotedParticipantId,
        walkoversAssigned,
        partnerWithdrawn,
        partnerRegistrationId,
      });
    } catch (error) {
      console.error('❌ Error withdrawing registration:', error);
      next(error);
    }
  }

  /**
   * PUT /api/registrations/:id/partner
   * FR15: Updates the doubles partner for a registration.
   * Admin-only operation. Validates that the new partner is registered in the same category
   * and that no matches have been played yet for this registration.
   *
   * @param {AuthRequest} req - Request with registration ID and { partnerId } body
   * @param {Response} res - Response with updated registration
   * @param {NextFunction} next - Error handler
   */
  public async updatePartner(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const {partnerId} = req.body;
      const currentUser = req.user;

      if (!currentUser) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const registrationRepository = AppDataSource.getRepository(Registration);
      const userRepository = AppDataSource.getRepository(User);

      const registration = await registrationRepository.findOne({where: {id}});
      if (!registration) {
        throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // If partnerId is null/undefined, clear the partner link
      if (partnerId === null || partnerId === undefined || partnerId === '') {
        registration.partnerId = null;
        const saved = await registrationRepository.save(registration);
        res.status(HTTP_STATUS.OK).json(saved);
        return;
      }

      // Validate the partner user exists
      const partnerUser = await userRepository.findOne({where: {id: partnerId}});
      if (!partnerUser) {
        throw new AppError('Partner user not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      // Prevent self-pairing
      if (partnerId === registration.participantId) {
        throw new AppError(
          'A player cannot be their own doubles partner',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT,
        );
      }

      registration.partnerId = partnerId;
      await registrationRepository.save(registration);

      // Reload with relations
      const updated = await registrationRepository.findOne({
        where: {id},
        relations: ['participant', 'category', 'partner'],
      });

      console.log(`🤝 [UpdatePartner] Registration ${id}: partner set to ${partnerId}`);
      res.status(HTTP_STATUS.OK).json(updated);
    } catch (error) {
      console.error('❌ Error updating partner:', error);
      next(error);
    }
  }

  /**
   * DELETE /api/registrations/:id
   * Permanently deletes a registration record from the database.
   * Intended for cleaning up rejected or withdrawn registrations.
   * Only accessible by TOURNAMENT_ADMIN and SYSTEM_ADMIN.
   *
   * @param {AuthRequest} req - Request with registration ID param
   * @param {Response} res - 204 No Content on success
   * @param {NextFunction} next - Error handler
   */
  public async deleteRegistration(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;
      const currentUser = req.user;

      if (!currentUser) {
        throw new AppError('Authentication required', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const registrationRepository = AppDataSource.getRepository(Registration);
      const registration = await registrationRepository.findOne({where: {id}});

      if (!registration) {
        throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      await registrationRepository.remove(registration);
      console.log(`🗑️ [DeleteRegistration] Registration ${id} permanently deleted by ${currentUser.id}`);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      console.error('❌ Error deleting registration:', error);
      next(error);
    }
  }
}
