/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 2, 2026
 * @file presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.ts
 * @desc Calendar/timeline view of scheduled matches per court (NFR5).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject, computed} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {OrderOfPlayRepositoryImpl} from '@infrastructure/repositories/order-of-play.repository';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {AxiosClient} from '@infrastructure/http/axios-client';
import {UserRole} from '@domain/enumerations/user-role';
import {EnumFormatPipe} from '@shared/pipes/enum-format.pipe';
import templateHtml from './order-of-play-view.component.html?raw';
import styles from './order-of-play-view.component.css?inline';

interface MatchSchedule {
  matchId: string;
  courtId: string;
  courtName: string;
  time: string;
  participants: string[];
  isUserMatch?: boolean;
}

/**
 * OrderOfPlayViewComponent displays the schedule of matches for a specific day.
 */
@Component({
  selector: 'app-order-of-play-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class OrderOfPlayViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly orderOfPlayRepository = inject(OrderOfPlayRepositoryImpl);
  private readonly authStateService = inject(AuthStateService);
  private readonly location = inject(Location);
  private readonly http = inject(AxiosClient);

  /** Tournament ID */
  public tournamentId = signal<string>('');

  /** Order of play data */
  public orderOfPlay = signal<any>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Selected date */
  public selectedDate = signal<Date>(new Date());

  /** Selected court filter (null = all courts) */
  public selectedCourt = signal<string | null>(null);

  /** Current user ID */
  private currentUserId = computed(() => {
    const user = this.authStateService.getCurrentUser();
    return user?.id || null;
  });

  /** Check if current user is admin (Tournament Admin or System Admin) */
  public isAdmin = computed(() => {
    const user = this.authStateService.getCurrentUser();
    if (!user) return false;
    return user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.TOURNAMENT_ADMIN;
  });

  /** Admin: Schedule generation options */
  public scheduleOptions = signal({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    matchDuration: 90,
    breakTime: 15,
    simultaneousMatches: true,
  });

  /** Admin: Generation state */
  public isGenerating = signal(false);

  /** Admin: Publishing state */
  public isPublishing = signal(false);

  /** Admin: Success message */
  public successMessage = signal<string | null>(null);

  /** Admin: Selected match for rescheduling */
  public selectedMatch = signal<any | null>(null);

  /** Admin: Reschedule form */
  public rescheduleForm = signal({
    courtId: '',
    scheduledTime: '',
  });

  /** Admin: Conflict warning message */
  public conflictWarning = signal<string | null>(null);

  /** Courts data for the tournament */
  public courts = signal<any[]>([]);

  /** Court statistics grouped by surface */
  public courtStats = computed(() => {
    const allCourts = this.courts();
    const stats = new Map<string, {count: number; courts: any[]}>();
    
    for (const court of allCourts) {
      const surface = court.surface;
      const existing = stats.get(surface) || {count: 0, courts: []};
      existing.count++;
      existing.courts.push(court);
      stats.set(surface, existing);
    }
    
    return stats;
  });

  /** Matches extracted from order of play */
  public matches = computed(() => {
    const oop = this.orderOfPlay();
    if (!oop || !oop.matches) {
      return [];
    }

    const userId = this.currentUserId();
    return oop.matches.map((m: any) => ({
      ...m,
      isUserMatch: userId ? m.participants.some((p: string) => p.includes(userId)) : false,
    }));
  });

  /** Filtered matches by selected court */
  public filteredMatches = computed(() => {
    const allMatches = this.matches();
    const court = this.selectedCourt();

    if (!court) {
      return allMatches;
    }

    return allMatches.filter((m: MatchSchedule) => m.courtId === court);
  });

  /** Matches grouped by court */
  public matchesByCourt = computed(() => {
    const allMatches = this.filteredMatches();
    const grouped = new Map<string, MatchSchedule[]>();

    for (const match of allMatches) {
      const existing = grouped.get(match.courtName) || [];
      existing.push(match);
      grouped.set(match.courtName, existing);
    }

    // Sort matches within each court by time
    for (const [court, courtMatches] of grouped) {
      courtMatches.sort((a, b) => a.time.localeCompare(b.time));
      grouped.set(court, courtMatches);
    }

    return grouped;
  });

  /** Available courts */
  public availableCourts = computed(() => {
    const allMatches = this.matches();
    const courts = new Set<string>();

    for (const match of allMatches) {
      courts.add(match.courtId);
    }

    return Array.from(courts);
  });

  /**
   * Initializes component and loads order of play.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tournamentId = params.get('id');
      if (tournamentId) {
        this.tournamentId.set(tournamentId);
        void this.loadOrderOfPlay();
        void this.loadCourts();
      }
    });
  }

  /**
   * Loads courts for the tournament.
   */
  private async loadCourts(): Promise<void> {
    try {
      const courts = await this.http.get<any[]>(
        `/courts?tournamentId=${this.tournamentId()}`
      );
      this.courts.set(courts);
    } catch (error) {
      console.error('Failed to load courts:', error);
    }
  }

  /**
   * Loads order of play for tournament and date.
   */
  private async loadOrderOfPlay(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Fetch all scheduled matches for the tournament
      const data = await this.orderOfPlayRepository.getScheduledMatchesForTournament(
        this.tournamentId()
      );

      // Format matches for display
      const userId = this.currentUserId();
      const allMatches = [
        ...data.scheduledMatches.map(m => ({
          matchId: m.matchId,
          courtId: m.courtId || 'unassigned',
          courtName: m.courtName || 'Awaiting Court Assignment',
          time: m.scheduledTime || new Date().toISOString(),
          participants: m.participants,
          isUserMatch: userId ? m.participantIds.some((id: any) => id === userId) : false,
          hasScheduledTime: !!m.scheduledTime,
        })),
        ...data.awaitingSchedule.map(m => ({
          matchId: m.matchId,
          courtId: 'unassigned',
          courtName: 'Awaiting Court Assignment',
          time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Far future for sorting
          participants: m.participants,
          isUserMatch: userId ? m.participantIds.some((id: any) => id === userId) : false,
          hasScheduledTime: false,
        }))
      ];

      // Set the order of play with formatted matches
      this.orderOfPlay.set({
        matches: allMatches,
        isPublished: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load order of play';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Changes the selected date and reloads.
   *
   * @param event - Date change event
   */
  public onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      this.selectedDate.set(new Date(target.value));
      void this.loadOrderOfPlay();
    }
  }

  /**
   * Changes the selected court filter.
   *
   * @param courtId - Court ID to filter by (null for all)
   */
  public filterByCourt(courtId: string | null): void {
    this.selectedCourt.set(courtId);
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Formats time for display.
   *
   * @param timeStr - ISO time string
   * @returns Formatted time string
   */
  public formatTime(timeStr: string): string {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * Gets court name by ID.
   *
   * @param courtId - Court ID
   * @returns Court name
   */
  public getCourtName(courtId: string): string {
    const allMatches = this.matches();
    const match = allMatches.find((m: MatchSchedule) => m.courtId === courtId);
    return match?.courtName || courtId;
  }

  /**
   * Navigates back to the previous page.
   */
  public goBack(): void {
    this.location.back();
  }

  // ===========================
  // ADMIN METHODS
  // ===========================

  /**
   * Generates automatic schedule for unscheduled matches (Admin only).
   */
  public async generateSchedule(): Promise<void> {
    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const opts = this.scheduleOptions();
      const response = await this.http.post<{
        message: string;
        scheduledCount: number;
        conflicts?: string[];
      }>('/order-of-play/generate', {
        tournamentId: this.tournamentId(),
        ...opts,
      });

      this.successMessage.set(
        `✅ ${response.scheduledCount} matches scheduled successfully!`
      );

      if (response.conflicts && response.conflicts.length > 0) {
        console.warn('Schedule conflicts:', response.conflicts);
        this.errorMessage.set(
          `⚠️ ${response.conflicts.length} conflicts detected. Check console for details.`
        );
      }

      // Reload schedule
      await this.loadOrderOfPlay();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate schedule';
      this.errorMessage.set(message);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Opens reschedule modal for a match (Admin only).
   *
   * @param match - Match to reschedule
   */
  public openRescheduleModal(match: MatchSchedule): void {
    this.selectedMatch.set(match);
    
    // Format datetime for datetime-local input (YYYY-MM-DDThh:mm) without timezone conversion
    const date = new Date(match.time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Use court name directly as courtId (e.g., "Court 2")
    const courtId = match.courtName && match.courtName !== 'Awaiting Court Assignment' 
      ? match.courtName 
      : '';
    
    this.rescheduleForm.set({
      courtId,
      scheduledTime: formattedTime,
    });
  }

  /**
   * Closes the reschedule modal.
   */
  public closeRescheduleModal(): void {
    this.selectedMatch.set(null);
    this.conflictWarning.set(null);
  }

  /**
   * Checks for time slot conflicts when rescheduling.
   */
  public checkConflicts(): void {
    const form = this.rescheduleForm();
    const currentMatch = this.selectedMatch();
    
    if (!form.courtId || !form.scheduledTime || !currentMatch) {
      this.conflictWarning.set(null);
      return;
    }

    const newTime = new Date(form.scheduledTime);
    const matchDuration = 90; // minutes
    const newEndTime = new Date(newTime.getTime() + matchDuration * 60000);

    // Get all matches on the selected court
    const allMatches = this.matches();
    const courtMatches = allMatches.filter(
      (m: any) => 
        m.courtName === form.courtId && 
        m.matchId !== currentMatch.matchId // Exclude current match
    );

    // Check for overlaps
    for (const match of courtMatches) {
      const existingTime = new Date(match.time);
      const existingEndTime = new Date(existingTime.getTime() + matchDuration * 60000);

      // Check if time ranges overlap
      const overlaps = 
        (newTime >= existingTime && newTime < existingEndTime) || // New starts during existing
        (newEndTime > existingTime && newEndTime <= existingEndTime) || // New ends during existing
        (newTime <= existingTime && newEndTime >= existingEndTime); // New encompasses existing

      if (overlaps) {
        const existingTimeStr = existingTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const participants = match.participants.join(' vs ');
        this.conflictWarning.set(
          `⚠️ Time conflict: ${participants} is scheduled at ${existingTimeStr} on ${form.courtId}`
        );
        return;
      }
    }

    this.conflictWarning.set(null);
  }

  /**
   * Saves rescheduled match (Admin only).
   */
  public async saveReschedule(): Promise<void> {
    const match = this.selectedMatch();
    if (!match) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const form = this.rescheduleForm();
      
      // Validate form inputs
      if (!form.courtId || !form.scheduledTime) {
        this.errorMessage.set('Please fill in both court and time');
        return;
      }

      // Backend expects the match ID in the URL path
      await this.http.put(`/order-of-play/${match.matchId}/reschedule`, {
        courtId: form.courtId,
        scheduledTime: form.scheduledTime,
      });

      this.successMessage.set('Match rescheduled successfully!');
      this.closeRescheduleModal();
      await this.loadOrderOfPlay();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reschedule match';
      this.errorMessage.set(message);
    }
  }

  /**
   * Publishes the order of play for the selected date (Admin only).
   */
  public async publishOrderOfPlay(): Promise<void> {
    this.isPublishing.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      // Get the orderOfPlayId for the current date
      // For now, we'll publish all scheduled matches for this tournament
      const response = await this.http.post<{
        message: string;
        notifiedCount: number;
      }>(`/order-of-play/tournament/${this.tournamentId()}/publish`, {
        date: this.selectedDate().toISOString().split('T')[0],
      });

      this.successMessage.set(
        `✅ Published! ${response.notifiedCount} participants notified.`
      );

      await this.loadOrderOfPlay();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish order of play';
      this.errorMessage.set(message);
    } finally {
      this.isPublishing.set(false);
    }
  }
}
