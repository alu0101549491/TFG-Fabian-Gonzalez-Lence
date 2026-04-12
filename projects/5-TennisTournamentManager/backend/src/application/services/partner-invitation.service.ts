/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file application/services/partner-invitation.service.ts
 * @desc Business logic for partner invitation system in doubles tournaments
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AppDataSource} from '../../infrastructure/database/data-source';
import {PartnerInvitation, PartnerInvitationStatus} from '../../domain/entities/partner-invitation.entity';
import {Registration} from '../../domain/entities/registration.entity';
import {RegistrationStatus} from '../../domain/enumerations/registration-status';
import {Tournament} from '../../domain/entities/tournament.entity';
import {TournamentType} from '../../domain/enumerations/tournament-type';
import {User} from '../../domain/entities/user.entity';
import {UserRole} from '../../domain/enumerations/user-role';
import {Category} from '../../domain/entities/category.entity';
import {NotificationService} from './notification.service';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppError} from '../../presentation/middleware/error.middleware';
import {generateId} from '../../shared/utils/id-generator';

/**
 * Service for managing partner invitations in doubles tournaments.
 * 
 * Handles the complete workflow:
 * 1. Send invitation (Player A invites Player B)
 * 2. Accept invitation (Player B confirms, creates registrations for both)
 * 3. Decline invitation (Player B rejects)
 * 4. Cancel invitation (Player A withdraws before acceptance)
 * 
 * Business Rules:
 * - Only one active doubles registration per player per tournament
 * - Inviter cannot invite themselves
 * - Both players must be eligible (active, PLAYER role, not already registered)
 * - Tournament must be DOUBLES type
 * - After acceptance, both registrations are PENDING admin approval
 * - If one partner withdraws, both are withdrawn (handled in RegistrationService)
 */
export class PartnerInvitationService {
  private invitationRepository = AppDataSource.getRepository(PartnerInvitation);
  private registrationRepository = AppDataSource.getRepository(Registration);
  private tournamentRepository = AppDataSource.getRepository(Tournament);
  private userRepository = AppDataSource.getRepository(User);
  private categoryRepository = AppDataSource.getRepository(Category);
  private notificationService = new NotificationService();

  /**
   * Sends a partner invitation for doubles tournament registration.
   * 
   * @param inviterId - User ID of the player sending the invitation
   * @param inviteeId - User ID of the player being invited
   * @param tournamentId - Tournament ID
   * @param categoryId - Category ID within the tournament
   * @param message - Optional message from inviter to invitee
   * @returns Created PartnerInvitation entity
   * @throws {AppError} If validation fails
   */
  public async sendInvitation(
    inviterId: string,
    inviteeId: string,
    tournamentId: string,
    categoryId: string,
    message?: string
  ): Promise<PartnerInvitation> {
    // Validate: Inviter cannot invite themselves
    if (inviterId === inviteeId) {
      throw new AppError('You cannot invite yourself as a partner', ErrorCode.INVALID_INPUT);
    }

    // Load tournament with category
    const tournament = await this.tournamentRepository.findOne({
      where: {id: tournamentId},
      relations: ['categories'],
    });

    if (!tournament) {
      throw new AppError('Tournament not found', ErrorCode.NOT_FOUND);
    }

    // Validate: Tournament must be DOUBLES type
    if (tournament.tournamentType !== TournamentType.DOUBLES) {
      throw new AppError('Partner invitations are only allowed for doubles tournaments', ErrorCode.INVALID_INPUT);
    }

    // Validate category exists in tournament
    const category = await this.categoryRepository.findOne({
      where: {id: categoryId, tournamentId},
    });

    if (!category) {
      throw new AppError('Category not found in this tournament', ErrorCode.NOT_FOUND);
    }

    // Load and validate inviter
    const inviter = await this.userRepository.findOne({where: {id: inviterId}});
    if (!inviter || !inviter.isActive || inviter.role !== UserRole.PLAYER) {
      throw new AppError('Inviter is not an eligible player', ErrorCode.INVALID_INPUT);
    }

    // Load and validate invitee
    const invitee = await this.userRepository.findOne({where: {id: inviteeId}});
    if (!invitee || !invitee.isActive || invitee.role !== UserRole.PLAYER) {
      throw new AppError('Invitee is not an eligible player', ErrorCode.INVALID_INPUT);
    }

    // Check if inviter already has active invitation or registration
    const inviterActiveInvitation = await this.invitationRepository.findOne({
      where: [
        {tournamentId, inviterId, status: PartnerInvitationStatus.PENDING},
        {tournamentId, inviteeId: inviterId, status: PartnerInvitationStatus.PENDING},
      ],
    });

    if (inviterActiveInvitation) {
      throw new AppError('You already have a pending invitation for this tournament', ErrorCode.INVALID_INPUT);
    }

    const inviterRegistration = await this.registrationRepository.findOne({
      where: {
        tournamentId,
        participantId: inviterId,
        status: RegistrationStatus.PENDING,
      },
    });

    if (inviterRegistration) {
      throw new AppError('You are already registered for this tournament', ErrorCode.INVALID_INPUT);
    }

    // Check if invitee already has active invitation or registration
    const inviteeActiveInvitation = await this.invitationRepository.findOne({
      where: [
        {tournamentId, inviterId: inviteeId, status: PartnerInvitationStatus.PENDING},
        {tournamentId, inviteeId, status: PartnerInvitationStatus.PENDING},
      ],
    });

    if (inviteeActiveInvitation) {
      throw new AppError('This player already has a pending invitation for this tournament', ErrorCode.INVALID_INPUT);
    }

    const inviteeRegistration = await this.registrationRepository.findOne({
      where: {
        tournamentId,
        participantId: inviteeId,
        status: RegistrationStatus.PENDING,
      },
    });

    if (inviteeRegistration) {
      throw new AppError('This player is already registered for this tournament', ErrorCode.INVALID_INPUT);
    }

    // Create invitation
    const invitation = this.invitationRepository.create({
      id: generateId('inv'),
      tournamentId,
      categoryId,
      inviterId,
      inviteeId,
      status: PartnerInvitationStatus.PENDING,
      message: message || null,
      createdAt: new Date(),
    });

    await this.invitationRepository.save(invitation);

    // Send notification to invitee
    await this.notificationService.notifyPartnerInvitation(
      inviteeId,
      inviterId,
      tournament.name,
      category.name,
      invitation.id
    );

    console.log(`✉️ Partner invitation sent: ${inviterId} → ${inviteeId} for tournament ${tournamentId}`);

    return invitation;
  }

  /**
   * Accepts a partner invitation and creates registrations for both players.
   * 
   * @param invitationId - Invitation ID
   * @param inviteeId - User ID of the player accepting (must match invitation invitee)
   * @returns Updated PartnerInvitation with registration IDs
   * @throws {AppError} If validation fails
   */
  public async acceptInvitation(invitationId: string, inviteeId: string): Promise<PartnerInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: {id: invitationId},
      relations: ['tournament', 'category', 'inviter', 'invitee'],
    });

    if (!invitation) {
      throw new AppError('Invitation not found', ErrorCode.NOT_FOUND);
    }

    // Validate: Only invitee can accept
    if (invitation.inviteeId !== inviteeId) {
      throw new AppError('You are not authorized to accept this invitation', ErrorCode.UNAUTHORIZED);
    }

    // Validate: Invitation must be PENDING
    if (invitation.status !== PartnerInvitationStatus.PENDING) {
      throw new AppError('This invitation is no longer active', ErrorCode.INVALID_INPUT);
    }

    // Double-check neither player has registered since invitation was sent
    const existingRegistrations = await this.registrationRepository.find({
      where: [
        {tournamentId: invitation.tournamentId, participantId: invitation.inviterId},
        {tournamentId: invitation.tournamentId, participantId: invitation.inviteeId},
      ],
    });

    if (existingRegistrations.length > 0) {
      throw new AppError('One or both players are already registered', ErrorCode.INVALID_INPUT);
    }

    // Create registrations for both players (PENDING admin approval)
    const inviterRegistration = this.registrationRepository.create({
      id: generateId('reg'),
      tournamentId: invitation.tournamentId,
      categoryId: invitation.categoryId,
      participantId: invitation.inviterId,
      partnerId: invitation.inviteeId,
      status: RegistrationStatus.PENDING,
      createdAt: new Date(),
    });

    const inviteeRegistration = this.registrationRepository.create({
      id: generateId('reg'),
      tournamentId: invitation.tournamentId,
      categoryId: invitation.categoryId,
      participantId: invitation.inviteeId,
      partnerId: invitation.inviterId,
      status: RegistrationStatus.PENDING,
      createdAt: new Date(),
    });

    await this.registrationRepository.save([inviterRegistration, inviteeRegistration]);

    // Update invitation
    invitation.status = PartnerInvitationStatus.ACCEPTED;
    invitation.respondedAt = new Date();
    invitation.inviterRegistrationId = inviterRegistration.id;
    invitation.inviteeRegistrationId = inviteeRegistration.id;

    await this.invitationRepository.save(invitation);

    // Notify inviter that partner accepted
    await this.notificationService.notifyPartnerInvitationAccepted(
      invitation.inviterId,
      invitation.inviteeId,
      invitation.tournament!.name,
      invitation.category!.name
    );

    // Notif admins that new pair is waiting for approval
    await this.notificationService.notifyAdminPendingRegistration(
      invitation.tournamentId,
      inviterRegistration.id
    );

    console.log(`✅ Partner invitation accepted: ${invitationId} → Registrations created`);

    return invitation;
  }

  /**
   * Declines a partner invitation.
   * 
   * @param invitationId - Invitation ID
   * @param inviteeId - User ID of the player declining (must match invitation invitee)
   * @returns Updated PartnerInvitation
   * @throws {AppError} If validation fails
   */
  public async declineInvitation(invitationId: string, inviteeId: string): Promise<PartnerInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: {id: invitationId},
      relations: ['tournament', 'category'],
    });

    if (!invitation) {
      throw new AppError('Invitation not found', ErrorCode.NOT_FOUND);
    }

    // Validate: Only invitee can decline
    if (invitation.inviteeId !== inviteeId) {
      throw new AppError('You are not authorized to decline this invitation', ErrorCode.UNAUTHORIZED);
    }

    // Validate: Invitation must be PENDING
    if (invitation.status !== PartnerInvitationStatus.PENDING) {
      throw new AppError('This invitation is no longer active', ErrorCode.INVALID_INPUT);
    }

    // Update invitation
    invitation.status = PartnerInvitationStatus.DECLINED;
    invitation.respondedAt = new Date();

    await this.invitationRepository.save(invitation);

    // Notify inviter that partner declined
    await this.notificationService.notifyPartnerInvitationDeclined(
      invitation.inviterId,
      invitation.inviteeId,
      invitation.tournament!.name,
      invitation.category!.name
    );

    console.log(`❌ Partner invitation declined: ${invitationId}`);

    return invitation;
  }

  /**
   * Cancels a partner invitation (inviter withdraws before acceptance).
   * 
   * @param invitationId - Invitation ID
   * @param inviterId - User ID of the player cancelling (must match invitation inviter)
   * @returns Updated PartnerInvitation
   * @throws {AppError} If validation fails
   */
  public async cancelInvitation(invitationId: string, inviterId: string): Promise<PartnerInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: {id: invitationId},
    });

    if (!invitation) {
      throw new AppError('Invitation not found', ErrorCode.NOT_FOUND);
    }

    // Validate: Only inviter can cancel
    if (invitation.inviterId !== inviterId) {
      throw new AppError('You are not authorized to cancel this invitation', ErrorCode.UNAUTHORIZED);
    }

    // Validate: Invitation must be PENDING
    if (invitation.status !== PartnerInvitationStatus.PENDING) {
      throw new AppError('This invitation is no longer active', ErrorCode.INVALID_INPUT);
    }

    // Update invitation
    invitation.status = PartnerInvitationStatus.CANCELLED;
    invitation.respondedAt = new Date();

    await this.invitationRepository.save(invitation);

    console.log(`🚫 Partner invitation cancelled: ${invitationId}`);

    return invitation;
  }

  /**
   * Gets all invitations for a user (both sent and received).
   * 
   * @param userId - User ID
   * @returns Array of invitations with related entities
   */
  public async getMyInvitations(userId: string): Promise<PartnerInvitation[]> {
    const invitations = await this.invitationRepository.find({
      where: [
        {inviterId: userId},
        {inviteeId: userId},
      ],
      relations: ['tournament', 'category', 'inviter', 'invitee'],
      order: {createdAt: 'DESC'},
    });

    return invitations;
  }

  /**
   * Gets pending invitations for a user (where they are the invitee).
   * 
   * @param userId - User ID
   * @returns Array of pending invitations
   */
  public async getPendingInvitations(userId: string): Promise<PartnerInvitation[]> {
    const invitations = await this.invitationRepository.find({
      where: {
        inviteeId: userId,
        status: PartnerInvitationStatus.PENDING,
      },
      relations: ['tournament', 'category', 'inviter'],
      order: {createdAt: 'DESC'},
    });

    return invitations;
  }

  /**
   * Gets a single invitation by ID.
   * 
   * @param invitationId - Invitation ID
   * @returns PartnerInvitation or null
   */
  public async getById(invitationId: string): Promise<PartnerInvitation | null> {
    const invitation = await this.invitationRepository.findOne({
      where: {id: invitationId},
      relations: ['tournament', 'category', 'inviter', 'invitee', 'inviterRegistration', 'inviteeRegistration'],
    });

    return invitation;
  }
}
