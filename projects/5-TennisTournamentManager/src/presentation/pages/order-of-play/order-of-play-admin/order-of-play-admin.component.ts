/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 2, 2026
 * @file presentation/pages/order-of-play/order-of-play-admin/order-of-play-admin.component.ts
 * @desc Admin panel for generating and managing order of play schedules.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AxiosClient} from '@infrastructure/http/axios-client';
import templateHtml from './order-of-play-admin.component.html?raw';

interface ScheduleOptions {
  startDate: string;
  startTime: string;
  matchDuration: number;
  breakTime: number;
  simultaneousMatches: boolean;
}

interface ScheduledMatch {
  matchId: string;
  courtId: string;
  courtName: string;
  scheduledTime: string;
  participant1?: string;
  participant2?: string;
}

/**
 * OrderOfPlayAdminComponent provides admin tools for schedule management.
 */
@Component({
  selector: 'app-order-of-play-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: templateHtml,
  styles: [],
})
export class OrderOfPlayAdminComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(AxiosClient);

  /** Tournament ID */
  public tournamentId = signal<string>('');

  /** Schedule generation options */
  public options = signal<ScheduleOptions>({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    matchDuration: 90,
    breakTime: 15,
    simultaneousMatches: true,
  });

  /** Current schedule */
  public schedule = signal<ScheduledMatch[]>([]);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Success message */
  public successMessage = signal<string | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Generating state */
  public isGenerating = signal(false);

  /** Publishing state */
  public isPublishing = signal(false);

  /** Selected match for rescheduling */
  public selectedMatch = signal<ScheduledMatch | null>(null);

  /** Reschedule form data */
  public rescheduleForm = signal({
    courtId: '',
    scheduledTime: '',
  });

  /**
   * Initializes the component.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tournamentId = params.get('id');
      if (tournamentId) {
        this.tournamentId.set(tournamentId);
        void this.loadCurrentSchedule();
      }
    });
  }

  /**
   * Loads the current schedule for the tournament.
   */
  private async loadCurrentSchedule(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await this.http.get<any[]>(
        `/order-of-play/tournament/${this.tournamentId()}`
      );

      // Flatten all matches from all dates
      const allMatches: ScheduledMatch[] = [];
      for (const oop of response) {
        if (oop.matches && Array.isArray(oop.matches)) {
          allMatches.push(...oop.matches);
        }
      }

      this.schedule.set(allMatches);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load schedule';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Generates automatic schedule for unscheduled matches.
   */
  public async generateSchedule(): Promise<void> {
    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const opts = this.options();
      const response = await this.http.post<{
        message: string;
        scheduledCount: number;
        conflicts?: string[];
      }>('/order-of-play/generate', {
        tournamentId: this.tournamentId(),
        ...opts,
      });

      this.successMessage.set(
        `${response.scheduledCount} matches scheduled successfully!`
      );

      if (response.conflicts && response.conflicts.length > 0) {
        console.warn('Schedule conflicts:', response.conflicts);
        this.errorMessage.set(
          `⚠️ ${response.conflicts.length} conflicts detected. Check console for details.`
        );
      }

      // Reload schedule
      await this.loadCurrentSchedule();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate schedule';
      this.errorMessage.set(message);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Opens reschedule modal for a match.
   *
   * @param match - Match to reschedule
   */
  public openRescheduleModal(match: ScheduledMatch): void {
    this.selectedMatch.set(match);
    
    // Format datetime for datetime-local input using UTC components
    const date = new Date(match.scheduledTime);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    this.rescheduleForm.set({
      courtId: match.courtId,
      scheduledTime: formattedTime,
    });
  }

  /**
   * Closes the reschedule modal.
   */
  public closeRescheduleModal(): void {
    this.selectedMatch.set(null);
  }

  /**
   * Saves the rescheduled match.
   */
  public async saveReschedule(): Promise<void> {
    const match = this.selectedMatch();
    if (!match) return;

    this.errorMessage.set(null);

    try {
      const form = this.rescheduleForm();
      await this.http.put(`/order-of-play/${match.matchId}/reschedule`, form);

      this.successMessage.set('Match rescheduled successfully!');
      this.closeRescheduleModal();
      
      // Reload schedule
      await this.loadCurrentSchedule();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reschedule match';
      this.errorMessage.set(message);
    }
  }

  /**
   * Publishes the order of play, notifying participants.
   *
   * @param orderOfPlayId - Order of play ID to publish
   */
  public async publishSchedule(orderOfPlayId: string): Promise<void> {
    if (!confirm('Publish this schedule and notify all participants?')) {
      return;
    }

    this.isPublishing.set(true);
    this.errorMessage.set(null);

    try {
      const response = await this.http.post<{
        message: string;
        notifiedParticipants: number;
      }>(`/order-of-play/${orderOfPlayId}/publish`, {});

      this.successMessage.set(
        `✅ Schedule published! ${response.notifiedParticipants} participants notified.`
      );

      // Reload schedule
      await this.loadCurrentSchedule();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish schedule';
      this.errorMessage.set(message);
    } finally {
      this.isPublishing.set(false);
    }
  }

  /**
   * Formats date/time for display.
   *
   * @param dateTime - ISO date string
   * @returns Formatted string
   */
  public formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  }
}
