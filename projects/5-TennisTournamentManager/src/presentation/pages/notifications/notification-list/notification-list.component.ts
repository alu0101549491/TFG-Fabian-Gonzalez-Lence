/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/notifications/notification-list/notification-list.component.ts
 * @desc User notification inbox with real-time delivery (NFR5).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {NotificationService} from '@application/services';
import {type NotificationDto} from '@application/dto';
import {AuthStateService} from '@presentation/services/auth-state.service';

/**
 * NotificationListComponent displays user notifications.
 */
@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-list.component.html',
  styles: [],
})
export class NotificationListComponent implements OnInit {
  /** Notifications list */
  public notifications = signal<NotificationDto[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /**
   * Creates an instance of NotificationListComponent.
   *
   * @param notificationService - Notification service for data operations
   * @param authStateService - Auth state service for current user
   */
  public constructor(
    private readonly notificationService: NotificationService,
    private readonly authStateService: AuthStateService,
  ) {}

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
      const notifications = await this.notificationService.getNotificationsByRecipient(user.id);
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
   */
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.notificationService.markAsRead(notificationId);
      await this.loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
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
}
