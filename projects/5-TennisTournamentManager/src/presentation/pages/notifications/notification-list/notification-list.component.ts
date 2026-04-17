/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file src/presentation/pages/notifications/notification-list/notification-list.component.ts
 * @desc User notification inbox with real-time delivery (NFR5).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Router} from '@angular/router';
import {Location} from '@angular/common';
import {NotificationService} from '@application/services';
import {type NotificationDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';
import templateHtml from './notification-list.component.html?raw';
import './notification-list.component.css';

/**
 * NotificationListComponent displays user notifications with modern UI.
 */
@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
})
export class NotificationListComponent implements OnInit {
  /** Services */
  private readonly notificationService = inject(NotificationService);
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /** Notifications list */
  public notifications = signal<NotificationDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /**
   * Gets the list of unread notifications.
   *
   * @returns Array of unread notifications
   */
  public get unreadNotifications(): NotificationDto[] {
    return this.notifications().filter(n => !n.isRead);
  }

  /**
   * Gets the list of read notifications.
   *
   * @returns Array of read notifications
   */
  public get readNotifications(): NotificationDto[] {
    return this.notifications().filter(n => n.isRead);
  }

  /**
   * Gets the count of unread notifications.
   *
   * @returns Number of unread notifications
   */
  public get unreadCount(): number {
    return this.unreadNotifications.length;
  }

  /**
   * Checks if there are any unread notifications.
   *
   * @returns True if there are unread notifications
   */
  public get hasUnread(): boolean {
    return this.unreadNotifications.length > 0;
  }

  /**
   * Initializes component and loads notifications.
   */
  public ngOnInit(): void {
    void this.loadNotifications();
  }

  /**
   * Loads notifications for current user.
   */
  public async loadNotifications(): Promise<void> {
    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const notifications = await this.notificationService.getByRecipient(user.id);
      this.notifications.set(notifications);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load notifications';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Marks a notification as read.
   *
   * @param notificationId - ID of the notification
   * @param event - Click event (optional, to stop propagation)
   */
  public async markAsRead(notificationId: string, event?: Event): Promise<void> {
    // Stop event propagation to prevent triggering navigation
    if (event) {
      event.stopPropagation();
    }

    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    try {
      await this.notificationService.markAsRead(notificationId, user.id);
      await this.loadNotifications();
    } catch (error) {
      // If notification doesn't exist (404), remove it from local state
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found')) {
        console.warn(`Notification ${notificationId} not found, removing from local state`);
        // Remove the notification from the local state
        const updatedNotifications = this.notifications().filter(n => n.id !== notificationId);
        this.notifications.set(updatedNotifications);
      } else {
        console.error('Failed to mark notification as read:', error);
      }
    }
  }

  /**
   * Navigates to the origin of the notification based on its type and metadata.
   *
   * @param notification - Notification to navigate from
   */
  public async navigateToOrigin(notification: NotificationDto): Promise<void> {
    // Mark as read when navigating (non-blocking)
    const user = this.authStateService.getCurrentUser();
    if (user && !notification.isRead) {
      // Don't await - mark as read in background
      this.notificationService.markAsRead(notification.id, user.id).catch(error => {
        // Silently log errors - don't block navigation
        console.warn(`Failed to mark notification ${notification.id} as read:`, error);
      });
    }

    // Determine navigation route based on notification type and metadata
    const metadata = notification.metadata as Record<string, string> | null;
    
    // For partner invitation notifications, navigate to My Invitations page
    if (metadata?.invitationId && notification.title.includes('Partner Invitation')) {
      console.log('Navigating to My Invitations for partner invitation notification');
      await this.router.navigate(['/my-invitations']);
      return;
    }
    
    // For dispute notifications, navigate admins to disputed matches page
    if (notification.title === '⚠️ Match Result Disputed') {
      console.log('Navigating to disputed matches for admin notification');
      await this.router.navigate(['/admin/disputed-matches']);
      return;
    }
    
    // For player notifications about results/schedules, navigate to My Matches
    if (notification.type === 'RESULT_ENTERED' || notification.type === 'MATCH_SCHEDULED') {
      console.log('Navigating to My Matches for player notification');
      await this.router.navigate(['/my-matches']);
      return;
    }
    
    // Handle missing metadata - fallback based on notification type
    if (!metadata || !metadata.tournamentId) {
      console.warn('No metadata or tournamentId found for notification', { type: notification.type, metadata });
      
      // Type-specific fallback navigation
      if (notification.type === 'RESULT_ENTERED' || notification.type === 'MATCH_SCHEDULED') {
        await this.router.navigate(['/my-matches']);
      } else {
        this.errorMessage.set('This notification is missing tournament information. Please check the Tournaments page.');
        setTimeout(() => this.errorMessage.set(null), 5000);
        await this.router.navigate(['/tournaments']);
      }
      return;
    }
    
    switch (notification.type) {
      case 'MATCH_SCHEDULED':
      case 'RESULT_ENTERED':
        // Navigate to My Matches page for player notifications
        await this.router.navigate(['/my-matches']);
        break;
      
      case 'REGISTRATION_CONFIRMED':
      case 'ORDER_OF_PLAY_PUBLISHED':
        // Navigate to tournament details
        console.log('Navigating to tournament:', metadata.tournamentId);
        await this.router.navigate(['/tournaments', metadata.tournamentId]);
        break;
      
      case 'ANNOUNCEMENT':
        // Navigate to announcements page
        if (metadata?.announcementId) {
          await this.router.navigate(['/announcements'], {
            queryParams: {
              id: metadata.announcementId,
              tournamentId: metadata.tournamentId,
            },
          });
        } else if (metadata?.tournamentId) {
          await this.router.navigate(['/announcements'], {
            queryParams: {tournamentId: metadata.tournamentId},
          });
        } else {
          await this.router.navigate(['/announcements']);
        }
        break;
      
      default:
        // For unknown types, navigate to tournament
        await this.router.navigate(['/tournaments', metadata.tournamentId]);
        break;
    }
  }

  /**
   * Marks all notifications as read.
   */
  public async markAllAsRead(): Promise<void> {
    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    try {
      await this.notificationService.markAllAsRead(user.id);
      await this.loadNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Reload notifications anyway to sync with backend state
      await this.loadNotifications();
    }
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Deletes a notification.
   *
   * @param notificationId - ID of the notification
   * @param event - Click event (optional, to stop propagation)
   */
  public async deleteNotification(notificationId: string, event?: Event): Promise<void> {
    // Stop event propagation to prevent triggering navigation
    if (event) {
      event.stopPropagation();
    }

    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    try {
      await this.notificationService.deleteNotification(notificationId, user.id);
      await this.loadNotifications();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found')) {
        console.warn(`Notification ${notificationId} not found, removing from local state`);
        // Remove the notification from the local state
        const updatedNotifications = this.notifications().filter(n => n.id !== notificationId);
        this.notifications.set(updatedNotifications);
      } else {
        console.error('Failed to delete notification:', error);
      }
    }
  }

  /**
   * Deletes all read notifications.
   */
  public async deleteAllRead(): Promise<void> {
    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    try {
      await this.notificationService.deleteAllRead(user.id);
      await this.loadNotifications();
    } catch (error) {
      console.error('Failed to delete all read notifications:', error);
      // Reload notifications anyway to sync with backend state
      await this.loadNotifications();
    }
  }

  /**
   * Navigates back to previous page.
   */
  public goBack(): void {
    this.location.back();
  }

  /**
   * Gets notification type icon.
   *
   * @param type - Notification type
   * @returns Icon emoji
   */
  public getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'MATCH_UPDATE': '🎾',
      'TOURNAMENT_UPDATE': '🏆',
      'MATCH_SCHEDULED': '📅',
      'MATCH_RESULT': '📊',
      'REGISTRATION': '✅',
      'ANNOUNCEMENT': '📢',
      'SYSTEM': '⚙️',
    };
    return icons[type] ?? '🔔';
  }

  /**
   * Formats notification type for display.
   *
   * @param type - Notification type
   * @returns Formatted type string
   */
  public formatNotificationType(type: string): string {
    return type.replace(/_/g, ' ');
  }

  /**
   * Gets tournament name from notification metadata.
   *
   * @param notification - Notification object
   * @returns Tournament name or null
   */
  public getTournamentName(notification: NotificationDto): string | null {
    if (!notification.metadata) return null;
    
    // First check if tournament name is in metadata
    if (notification.metadata['tournamentName']) {
      return notification.metadata['tournamentName'] as string;
    }
    
    // If only ID is available, show formatted ID
    if (notification.metadata['tournamentId']) {
      const id = notification.metadata['tournamentId'] as string;
      // Format tournament ID to be more readable (e.g., "trn_test789" -> "Tournament #test789")
      return id.replace(/^trn_/, 'Tournament #');
    }
    
    return null;
  }
}
