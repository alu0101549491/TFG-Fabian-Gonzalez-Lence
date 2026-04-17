/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file backend/src/presentation/controllers/partner-invitation.controller.ts
 * @desc HTTP controller for partner invitation endpoints
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Response, NextFunction} from 'express';
import {AuthRequest} from '../middleware/auth.middleware';
import {PartnerInvitationService} from '../../application/services/partner-invitation.service';
import {AppError} from '../middleware/error.middleware';
import {HTTP_STATUS, ERROR_CODES} from '../../shared/constants';
import {AppDataSource} from '../../infrastructure/database/data-source';
import {DoublesTeam} from '../../domain/entities/doubles-team.entity';

/**
 * Controller for partner invitation API endpoints.
 * 
 * Endpoints:
 * - POST /api/partner-invitations/send - Send invitation
 * - POST /api/partner-invitations/:id/accept - Accept invitation
 * - POST /api/partner-invitations/:id/decline - Decline invitation
 * - POST /api/partner-invitations/:id/cancel - Cancel invitation
 * - GET /api/partner-invitations/my-invitations - Get all user's invitations
 * - GET /api/partner-invitations/pending - Get pending invitations for user
 * - GET /api/partner-invitations/:id - Get single invitation details
 */
export class PartnerInvitationController {
  private partnerInvitationService = new PartnerInvitationService();

  /**
   * Sends a partner invitation for doubles tournament.
   * POST /api/partner-invitations/send
   * 
   * @param req.body.inviteeId - User ID to invite
   * @param req.body.tournamentId - Tournament ID
   * @param req.body.categoryId - Category ID
   * @param req.body.message - Optional message
   * @param req.user.userId - Inviter user ID (from JWT)
   * @returns {201} Invitation created
   * @returns {400} Validation error
   */
  public async sendInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inviterId = req.user?.id;
      const {inviteeId, tournamentId, categoryId, message} = req.body;

      if (!inviterId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      if (!inviteeId || !tournamentId || !categoryId) {
        throw new AppError('inviteeId, tournamentId, and categoryId are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const invitation = await this.partnerInvitationService.sendInvitation(
        inviterId,
        inviteeId,
        tournamentId,
        categoryId,
        message
      );

      res.status(201).json({
        message: 'Partner invitation sent successfully',
        invitation,
      });
    } catch (error) {
      console.error('Error sending partner invitation:', error);
      next(error);
    }
  }

  /**
   * Accepts a partner invitation and creates registrations for both players.
   * POST /api/partner-invitations/:id/accept
   * 
   * @param req.params.id - Invitation ID
   * @param req.user.id - Invitee user ID (from JWT)
   * @returns {200} Invitation accepted, registrations created
   * @returns {400} Validation error
   * @returns {401} Unauthorized
   * @returns {404} Invitation not found
   */
  public async acceptInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inviteeId = req.user?.id;
      const {id} = req.params;

      if (!inviteeId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      if (!id) {
        throw new AppError('Invitation ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const invitation = await this.partnerInvitationService.acceptInvitation(id, inviteeId);

      res.status(200).json({
        message: 'Partner invitation accepted. Registrations created and pending admin approval.',
        invitation,
      });
    } catch (error) {
      console.error('Error accepting partner invitation:', error);
      next(error);
    }
  }

  /**
   * Declines a partner invitation.
   * POST /api/partner-invitations/:id/decline
   * 
   * @param req.params.id - Invitation ID
   * @param req.user.id - Invitee user ID (from JWT)
   * @returns {200} Invitation declined
   * @returns {400} Validation error
   * @returns {401} Unauthorized
   * @returns {404} Invitation not found
   */
  public async declineInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inviteeId = req.user?.id;
      const {id} = req.params;

      if (!inviteeId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      if (!id) {
        throw new AppError('Invitation ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const invitation = await this.partnerInvitationService.declineInvitation(id, inviteeId);

      res.status(200).json({
        message: 'Partner invitation declined',
        invitation,
      });
    } catch (error) {
      console.error('Error declining partner invitation:', error);
      next(error);
    }
  }

  /**
   * Cancels a partner invitation (inviter withdraws).
   * POST /api/partner-invitations/:id/cancel
   * 
   * @param req.params.id - Invitation ID
   * @param req.user.id - Inviter user ID (from JWT)
   * @returns {200} Invitation cancelled
   * @returns {400} Validation error
   * @returns {401} Unauthorized
   * @returns {404} Invitation not found
   */
  public async cancelInvitation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inviterId = req.user?.id;
      const {id} = req.params;

      if (!inviterId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      if (!id) {
        throw new AppError('Invitation ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const invitation = await this.partnerInvitationService.cancelInvitation(id, inviterId);

      res.status(200).json({
        message: 'Partner invitation cancelled',
        invitation,
      });
    } catch (error) {
      console.error('Error cancelling partner invitation:', error);
      next(error);
    }
  }

  /**
   * Gets all invitations for the authenticated user (sent and received).
   * GET /api/partner-invitations/my-invitations
   * 
   * @param req.user.id - User ID (from JWT)
   * @returns {200} Array of invitations
   * @returns {401} Unauthorized
   */
  public async getMyInvitations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const invitations = await this.partnerInvitationService.getMyInvitations(userId);

      res.status(200).json({
        invitations,
        count: invitations.length,
      });
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      next(error);
    }
  }

  /**
   * Gets pending invitations for the authenticated user (where they are invitee).
   * GET /api/partner-invitations/pending
   * 
   * @param req.user.id - User ID (from JWT)
   * @returns {200} Array of pending invitations
   * @returns {401} Unauthorized
   */
  public async getPendingInvitations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
      }

      const invitations = await this.partnerInvitationService.getPendingInvitations(userId);

      res.status(200).json({
        invitations,
        count: invitations.length,
      });
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      next(error);
    }
  }

  /**
   * Gets a single invitation by ID with full details.
   * GET /api/partner-invitations/:id
   * 
   * @param req.params.id - Invitation ID
   * @returns {200} Invitation details
   * @returns {404} Invitation not found
   */
  /**
   * Gets a single invitation by ID with full details.
   * GET /api/partner-invitations/:id
   * 
   * @param req.params.id - Invitation ID
   * @returns {200} Invitation details
   * @returns {404} Invitation not found
   */
  public async getInvitationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {id} = req.params;

      if (!id) {
        throw new AppError('Invitation ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const invitation = await this.partnerInvitationService.getById(id);

      if (!invitation) {
        throw new AppError('Invitation not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
      }

      res.status(200).json({invitation});
    } catch (error) {
      console.error('Error fetching invitation:', error);
      next(error);
    }
  }

  /**
   * Gets all doubles teams for a tournament.
   * GET /api/doubles-teams?tournamentId=xxx
   *
   * @param req.query.tournamentId - Tournament ID
   * @returns {200} Array of doubles team records
   */
  public async getDoublesTeamsByTournament(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {tournamentId} = req.query;

      if (!tournamentId || typeof tournamentId !== 'string') {
        throw new AppError('tournamentId query parameter is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT);
      }

      const doublesTeamRepository = AppDataSource.getRepository(DoublesTeam);
      const teams = await doublesTeamRepository.find({
        where: {tournamentId},
        select: ['id', 'tournamentId', 'categoryId', 'player1Id', 'player2Id', 'registration1Id', 'registration2Id', 'seedNumber'],
      });

      res.status(HTTP_STATUS.OK).json(teams);
    } catch (error) {
      console.error('Error fetching doubles teams:', error);
      next(error);
    }
  }
}
