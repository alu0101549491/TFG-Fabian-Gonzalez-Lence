/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 12, 2026
 * @file presentation/pages/my-invitations/my-invitations.component.ts
 * @desc Component for viewing and managing partner invitations
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {PartnerInvitationService, type PartnerInvitationDto, PartnerInvitationStatus} from '@infrastructure/services/partner-invitation.service';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './my-invitations.component.html?raw';
import styles from './my-invitations.component.css?inline';

/**
 * Component for managing partner invitations.
 * 
 * Features:
 * - Display all invitations (sent and received)
 * - Accept/decline pending invitations (invitee)
 * - Cancel sent invitations (inviter, before acceptance)
 * - View invitation status and history
 */
@Component({
  selector: 'app-my-invitations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [styles],
})
export class MyInvitationsComponent implements OnInit {
  private readonly partnerInvitationService = inject(PartnerInvitationService);
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);

  /**
   * All invitations for the current user.
   */
  public readonly allInvitations = signal<PartnerInvitationDto[]>([]);

  /**
   * Loading state.
   */
  public readonly isLoading = signal<boolean>(true);

  /**
   * Current user ID.
   */
  public readonly currentUserId = computed(() => this.authStateService.getCurrentUser()?.id ?? '');

  /**
   * Invitations received by current user (pending action).
   */
  public readonly receivedPendingInvitations = computed(() => {
    const userId = this.currentUserId();
    return this.allInvitations().filter(
      inv => inv.inviteeId === userId && inv.status === PartnerInvitationStatus.PENDING
    );
  });

  /**
   * Invitations sent by current user.
   */
  public readonly sentInvitations = computed(() => {
    const userId = this.currentUserId();
    return this.allInvitations().filter(inv => inv.inviterId === userId);
  });

  /**
   * Past invitations (accepted/declined/cancelled).
   */
  public readonly pastInvitations = computed(() => {
    return this.allInvitations().filter(
      inv => [
        PartnerInvitationStatus.ACCEPTED,
        PartnerInvitationStatus.DECLINED,
        PartnerInvitationStatus.CANCELLED,
      ].includes(inv.status)
    );
  });

  /**
   * Expose enum for template.
   */
  public readonly PartnerInvitationStatus = PartnerInvitationStatus;

  /**
   * Initializes the component.
   */
  public async ngOnInit(): Promise<void> {
    await this.loadInvitations();
  }

  /**
   * Loads all invitations for the current user.
   */
  public async loadInvitations(): Promise<void> {
    this.isLoading.set(true);
    try {
      const invitations = await this.partnerInvitationService.getMyInvitations();
      this.allInvitations.set(invitations);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      alert('Failed to load invitations. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Accepts a partner invitation.
   * 
   * @param invitationId - Invitation ID to accept
   */
  public async acceptInvitation(invitationId: string): Promise<void> {
    if (!confirm('Accept this partner invitation? Both you and your partner will be registered (pending admin approval).')) {
      return;
    }

    try {
      await this.partnerInvitationService.acceptInvitation(invitationId);
      alert('✅ Invitation accepted! You and your partner are now registered (pending admin approval).');
      await this.loadInvitations();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept invitation';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Declines a partner invitation.
   * 
   * @param invitationId - Invitation ID to decline
   */
  public async declineInvitation(invitationId: string): Promise<void> {
    if (!confirm('Decline this partner invitation?')) {
      return;
    }

    try {
      await this.partnerInvitationService.declineInvitation(invitationId);
      alert('❌ Invitation declined.');
      await this.loadInvitations();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to decline invitation';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Cancels a sent invitation.
   * 
   * @param invitationId - Invitation ID to cancel
   */
  public async cancelInvitation(invitationId: string): Promise<void> {
    if (!confirm('Cancel this invitation?')) {
      return;
    }

    try {
      await this.partnerInvitationService.cancelInvitation(invitationId);
      alert('🚫 Invitation cancelled.');
      await this.loadInvitations();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel invitation';
      alert(`Error: ${message}`);
    }
  }

  /**
   * Formats date for display.
   * 
   * @param dateString - ISO date string
   * @returns Formatted date
   */
  public formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Gets display name for a user.
   * 
   * @param invitation - Invitation with user data
   * @param role - 'inviter' or 'invitee'
   * @returns User display name
   */
  public getUserName(invitation: PartnerInvitationDto, role: 'inviter' | 'invitee'): string {
    const user = role === 'inviter' ? invitation.inviter : invitation.invitee;
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  }

  /**
   * Gets status badge color class.
   * 
   * @param status - Invitation status
   * @returns CSS class for badge
   */
  public getStatusClass(status: PartnerInvitationStatus): string {
    switch (status) {
      case PartnerInvitationStatus.PENDING:
        return 'status-pending';
      case PartnerInvitationStatus.ACCEPTED:
        return 'status-accepted';
      case PartnerInvitationStatus.DECLINED:
        return 'status-declined';
      case PartnerInvitationStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  /**
   * Navigates back to the home page.
   */
  public goBack(): void {
    void this.router.navigate(['/']);
  }
}
