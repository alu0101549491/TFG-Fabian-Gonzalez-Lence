/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file presentation/components/notification-bell/notification-bell.component.ts
 * @desc Notification bell icon with unread count badge and dropdown preview.
 * @see {@link https://github.com/alu0101549491@ull.edu.es>
 * @since April 8, 2026
 * @file presentation/components/notification-bell/notification-bell.component.ts
 * @desc Notification bell icon with unread count badge and dropdown preview.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, OnDestroy, signal, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {NotificationService} from '@application/services/notification.service';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {type NotificationDto} from '@application/dto';
import {NotificationType} from '@domain/enumerations/notification-type';
import {WebSocketService} from '@infrastructure/websocket';
import {ServerEvent} from '@shared/constants';

/**
 * Notification bell component with real-time updates.
 * Shows unread count badge and dropdown with recent notifications.
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css'],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  /** Services */
  private readonly notificationService = inject(NotificationService);
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly wsService = inject(WebSocketService);

  /** All notifications */
  public notifications = signal<NotificationDto[]>([]);

  /** Dropdown open state */
  public isDropdownOpen = signal(false);

  /** Loading state */
  public isLoading = signal(false);

  /** Recent notifications (last 5) */
  public recentNotifications = computed(() => this.notifications().slice(0, 5));

  /** Unread notification count */
  public unreadCount = computed(() => 
    this.notifications().filter(n => !n.isRead).length
  );

  /**
   * Initializes component and loads notifications.
   */
  public ngOnInit(): void {
    void this.loadNotifications();
    this.setupWebSocketListener();
  }

  /**
   * Sets up WebSocket listener for real-time notification updates.
   */
  private setupWebSocketListener(): void {
    // Connect to WebSocket if not already connected
    this.wsService.connect();

    // Listen for new notifications
    this.wsService.on<NotificationDto>(ServerEvent.NOTIFICATION_NEW, (notification) => {
      console.log('[NotificationBell] Received new notification:', notification);
      
      // Add notification to the beginning of the list
      this.notifications.update(current => [notification, ...current]);
    });

    // Optional: Listen for unread count updates
    this.wsService.on<number>(ServerEvent.NOTIFICATION_COUNT, (count) => {
      console.log('[NotificationBell] Unread count updated:', count);
    });
  }

  /**
   * Cleanup on component destruction.
   */
  public ngOnDestroy(): void {
    // WebSocket service is singleton and will be cleaned up by Angular
    // Individual event listeners are tied to the component lifecycle
  }

  /**
   * Loads notifications for current user.
   */
  public async loadNotifications(): Promise<void> {
    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    this.isLoading.set(true);
    try {
      const notifications = await this.notificationService.getByRecipient(user.id);
      this.notifications.set(notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Toggles dropdown visibility.
   */
  public toggleDropdown(): void {
    this.isDropdownOpen.update(open => !open);
  }

  /**
   * Closes dropdown.
   */
  public closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  /**
   * Marks a notification as read.
   *
   * @param notificationId - ID of the notification
   */
  public async markAsRead(notificationId: string): Promise<void> {
    const user = this.authStateService.getCurrentUser();
    if (!user) return;

    try {
      await this.notificationService.markAsRead(notificationId, user.id);
      await this.loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Handles notification click - marks as read and navigates to related content.
   *
   * @param notification - The notification that was clicked
   */
  public async handleNotificationClick(notification: NotificationDto): Promise<void> {
    // Mark as read if unread
    if (!notification.isRead) {
      await this.markAsRead(notification.id);
    }

    // Close dropdown
    this.closeDropdown();

    // Navigate based on notification type and referenceId
    if (!notification.referenceId) {
      // No reference ID, navigate to notifications page
      await this.router.navigate(['/notifications']);
      return;
    }

    switch (notification.type) {
      case NotificationType.MATCH_SCHEDULED:
      case NotificationType.RESULT_ENTERED:
        // Navigate to match details
        await this.router.navigate(['/matches', notification.referenceId]);
        break;

      case NotificationType.REGISTRATION_CONFIRMED:
      case NotificationType.ORDER_OF_PLAY_PUBLISHED:
        // Navigate to tournament details
        await this.router.navigate(['/tournaments', notification.referenceId]);
        break;

      case NotificationType.ANNOUNCEMENT:
        // Navigate to announcement details or announcements list
        await this.router.navigate(['/announcements'], {
          queryParams: {id: notification.referenceId},
        });
        break;

      default:
        // Fallback to notifications page
        await this.router.navigate(['/notifications']);
    }
  }

  /**
   * Formats time ago string.
   *
   * @param date - Date to format
   * @returns Relative time string
   */
  public formatTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  }
}
