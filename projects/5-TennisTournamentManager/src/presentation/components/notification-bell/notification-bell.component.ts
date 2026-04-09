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
  template: `
<div class="notification-bell">
  <!-- Bell Icon Button -->
  <button 
    class="bell-button" 
    type="button"
    (click)="toggleDropdown()"
    [class.active]="isDropdownOpen()"
  >
    <span class="bell-icon">🔔</span>
    @if (unreadCount() > 0) {
      <span class="unread-badge">{{ unreadCount() }}</span>
    }
  </button>

  <!-- Dropdown Menu -->
  @if (isDropdownOpen()) {
    <div class="notification-dropdown">
      <!-- Header -->
      <div class="dropdown-header">
        <h3 class="dropdown-title">Notifications</h3>
        @if (unreadCount() > 0) {
          <span class="unread-count-text">{{ unreadCount() }} unread</span>
        }
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        @if (isLoading()) {
          <div class="loading-state">
            <p>Loading notifications...</p>
          </div>
        }

        @if (!isLoading() && recentNotifications().length > 0) {
          @for (notification of recentNotifications(); track notification.id) {
            <div 
              class="notification-item"
              [class.unread]="!notification.isRead"
              (click)="handleNotificationClick(notification)"
            >
              <div class="notification-content">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <p class="notification-message">{{ notification.message }}</p>
                <span class="notification-time">{{ formatTimeAgo(notification.createdAt) }}</span>
              </div>
              @if (!notification.isRead) {
                <span class="unread-dot"></span>
              }
            </div>
          }
        }

        @if (!isLoading() && recentNotifications().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🔕</span>
            <p>No notifications yet</p>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="dropdown-footer">
        <a 
          routerLink="/notifications" 
          class="view-all-link"
          (click)="closeDropdown()"
        >
          View all notifications →
        </a>
      </div>
    </div>
  }
</div>

<!-- Overlay to close dropdown when clicking outside -->
@if (isDropdownOpen()) {
  <div 
    class="dropdown-overlay" 
    (click)="closeDropdown()"
  ></div>
}
  `,
  styles: [`
.notification-bell {
  position: relative;
  display: inline-block;
}

.bell-button {
  position: relative;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-white);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bell-button:hover,
.bell-button.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.bell-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, var(--color-error) 0%, var(--color-warning) 100%);
  color: var(--color-white);
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-index-dropdown);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-gray-50);
}

.dropdown-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-900);
}

.unread-count-text {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  font-weight: 500;
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.notification-item {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
}

.notification-item:hover {
  background-color: var(--color-gray-50);
}

.notification-item.unread {
  background-color: var(--color-primary-alpha);
}

.notification-item.unread:hover {
  background-color: rgba(37, 99, 235, 0.12);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-gray-900);
  line-height: 1.3;
}

.notification-item.unread .notification-title {
  color: var(--color-primary);
}

.notification-message {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 0.875rem;
  color: var(--color-gray-600);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 0.8125rem;
  color: var(--color-gray-500);
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 6px;
}

.empty-state {
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-gray-500);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--spacing-sm);
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
}

.loading-state {
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-gray-500);
}

.loading-state p {
  margin: 0;
  font-size: 0.9375rem;
}

.dropdown-footer {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  background-color: var(--color-gray-50);
  text-align: center;
}

.view-all-link {
  display: inline-block;
  padding: var(--spacing-xs) 0;
  color: var(--color-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.view-all-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: calc(var(--z-index-dropdown) - 1);
}

@media (max-width: 480px) {
  .notification-dropdown {
    width: calc(100vw - 32px);
    right: -140px;
  }
}
  `],
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
