/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file src/infrastructure/services/partner-invitation.service.ts
 * @desc Frontend service for partner invitation API calls
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Injectable, signal, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';

/**
 * Status of a partner invitation.
 */
export enum PartnerInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED'
}

/**
 * DTO for partner invitation data.
 */
export interface PartnerInvitationDto {
  id: string;
  tournamentId: string;
  categoryId: string;
  inviterId: string;
  inviteeId: string;
  status: PartnerInvitationStatus;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  inviterRegistrationId: string | null;
  inviteeRegistrationId: string | null;
  tournament?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  inviter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  invitee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * DTO for creating a new partner invitation.
 */
export interface CreatePartnerInvitationDto {
  inviteeId: string;
  tournamentId: string;
  categoryId: string;
  message?: string;
}

/**
 * DTO representing a doubles team (pair of players registered together).
 */
export interface DoublesTeamDto {
  id: string;
  tournamentId: string;
  categoryId: string;
  player1Id: string;
  player2Id: string;
  registration1Id: string | null;
  registration2Id: string | null;
  seedNumber: number | null;
}

/**
 * Service for managing partner invitations via API.
 * 
 * Provides methods to:
 * - Send partner invitations
 * - Accept/decline/cancel invitations
 * - Fetch user's invitations (sent and received)
 * - Get pending invitations count
 */
@Injectable({
  providedIn: 'root',
})
export class PartnerInvitationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/partner-invitations`;

  /**
   * Signal for pending invitations count (for badge display).
   */
  public pendingInvitationsCount = signal<number>(0);

  /**
   * Signal for all user's invitations.
   */
  public myInvitations = signal<PartnerInvitationDto[]>([]);

  /**
   * Sends a partner invitation to another player.
   * 
   * @param data - Invitation data (inviteeId, tournamentId, categoryId, message)
   * @returns Promise with created invitation
   */
  public async sendInvitation(data: CreatePartnerInvitationDto): Promise<{message: string; invitation: PartnerInvitationDto}> {
    const response = await firstValueFrom(
      this.http.post<{message: string; invitation: PartnerInvitationDto}>(`${this.apiUrl}/send`, data)
    );
    
    // Refresh pending count after sending
    await this.loadPendingCount();
    
    return response;
  }

  /**
   * Accepts a partner invitation.
   * Creates registrations for both players (PENDING admin approval).
   * 
   * @param invitationId - Invitation ID to accept
   * @returns Promise with updated invitation
   */
  public async acceptInvitation(invitationId: string): Promise<{message: string; invitation: PartnerInvitationDto}> {
    const response = await firstValueFrom(
      this.http.post<{message: string; invitation: PartnerInvitationDto}>(`${this.apiUrl}/${invitationId}/accept`, {})
    );
    
    // Refresh pending count after accepting
    await this.loadPendingCount();
    await this.loadMyInvitations();
    
    return response;
  }

  /**
   * Declines a partner invitation (invitee only).
   * 
   * @param invitationId - Invitation ID to decline
   * @returns Promise with updated invitation
   */
  public async declineInvitation(invitationId: string): Promise<{message: string; invitation: PartnerInvitationDto}> {
    const response = await firstValueFrom(
      this.http.post<{message: string; invitation: PartnerInvitationDto}>(`${this.apiUrl}/${invitationId}/decline`, {})
    );
    
    // Refresh pending count after declining
    await this.loadPendingCount();
    await this.loadMyInvitations();
    
    return response;
  }

  /**
   * Cancels a partner invitation (inviter only, before acceptance).
   * 
   * @param invitationId - Invitation ID to cancel
   * @returns Promise with updated invitation
   */
  public async cancelInvitation(invitationId: string): Promise<{message: string; invitation: PartnerInvitationDto}> {
    const response = await firstValueFrom(
      this.http.post<{message: string; invitation: PartnerInvitationDto}>(`${this.apiUrl}/${invitationId}/cancel`, {})
    );
    
    // Refresh invitations after cancelling
    await this.loadMyInvitations();
    
    return response;
  }

  /**
   * Gets all invitations for the current user (sent and received).
   * 
   * @returns Promise with array of invitations
   */
  public async getMyInvitations(): Promise<PartnerInvitationDto[]> {
    const response = await firstValueFrom(
      this.http.get<{invitations: PartnerInvitationDto[]; count: number}>(`${this.apiUrl}/my-invitations`)
    );
    
    this.myInvitations.set(response.invitations);
    
    return response.invitations;
  }

  /**
   * Gets pending invitations for the current user (where they are invitee).
   * 
   * @returns Promise with array of pending invitations
   */
  public async getPendingInvitations(): Promise<PartnerInvitationDto[]> {
    const response = await firstValueFrom(
      this.http.get<{invitations: PartnerInvitationDto[]; count: number}>(`${this.apiUrl}/pending`)
    );
    
    this.pendingInvitationsCount.set(response.count);
    
    return response.invitations;
  }

  /**
   * Gets a single invitation by ID.
   * 
   * @param invitationId - Invitation ID
   * @returns Promise with invitation details
   */
  public async getInvitationById(invitationId: string): Promise<PartnerInvitationDto> {
    const response = await firstValueFrom(
      this.http.get<{invitation: PartnerInvitationDto}>(`${this.apiUrl}/${invitationId}`)
    );
    
    return response.invitation;
  }

  /**
   * Loads and updates the myInvitations signal.
   */
  public async loadMyInvitations(): Promise<void> {
    await this.getMyInvitations();
  }

  /**
   * Loads and updates the pendingInvitationsCount signal.
   */
  public async loadPendingCount(): Promise<void> {
    await this.getPendingInvitations();
  }

  /**
   * Fetches all doubles team records for a given tournament.
   * Uses the DoublesTeam entity as authoritative source for pair grouping.
   *
   * @param tournamentId - Tournament ID
   * @returns Array of doubles team records
   */
  public async getDoublesTeamsByTournament(tournamentId: string): Promise<DoublesTeamDto[]> {
    return firstValueFrom(
      this.http.get<DoublesTeamDto[]>(`${environment.apiUrl}/doubles-teams?tournamentId=${tournamentId}`)
    );
  }

  /**
   * Initializes the service by loading pending count.
   */
  public async initialize(): Promise<void> {
    try {
      await this.loadPendingCount();
    } catch (error) {
      console.error('Failed to initialize PartnerInvitationService:', error);
    }
  }
}
