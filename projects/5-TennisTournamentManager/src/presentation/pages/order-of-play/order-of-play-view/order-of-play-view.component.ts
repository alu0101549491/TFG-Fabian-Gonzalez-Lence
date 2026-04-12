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
  time: string | null;
  participants: string[];
  isUserMatch?: boolean;
  hasScheduledTime: boolean;
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

  /** Selected date (null = show all dates) */
  public selectedDate = signal<Date | null>(null);

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

  /**
   * Updates a schedule option field.
   *
   * @param field - Field name to update
   * @param event - Input event
   */
  public updateScheduleOption(field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.type === 'number' ? parseInt(target.value, 10) : target.value;
    
    this.scheduleOptions.update(opts => ({
      ...opts,
      [field]: value,
    }));
  }

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

  /** Admin: Flag to track if error is due to missing courts */
  public missingCourts = signal<boolean>(false);

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

  /** Check if any matches are scheduled (for enabling regenerate button) */
  public hasScheduledMatches = computed(() => {
    const allMatches = this.matches();
    return allMatches.some((m: MatchSchedule) => m.hasScheduledTime);
  });

  /** Court management UI state */
  public showAddCourtModal = signal<boolean>(false);
  public newCourtName = signal<string>('');
  public newCourtOpeningTime = signal<string>('');
  public newCourtClosingTime = signal<string>('');
  public editingCourtId = signal<string | null>(null);
  public editingCourtName = signal<string>('');

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

  /** Filtered matches by selected date and court */
  public filteredMatches = computed(() => {
    const allMatches = this.matches();
    const selectedDate = this.selectedDate();
    const court = this.selectedCourt();

    let filtered = allMatches;

    // Filter by date if a date is selected
    if (selectedDate) {
      const targetDate = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter((m: MatchSchedule) => {
        if (!m.time) return false; // Exclude unscheduled matches when filtering by date
        const matchDate = new Date(m.time).toISOString().split('T')[0];
        return matchDate === targetDate;
      });
    }

    // Filter by court if a court is selected
    if (court) {
      filtered = filtered.filter((m: MatchSchedule) => m.courtId === court);
    }

    return filtered;
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
      courtMatches.sort((a, b) => {
        // Null times (unscheduled) go to the end
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
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
          time: m.scheduledTime || null,
          participants: m.participants,
          isUserMatch: userId ? m.participantIds.some((id: any) => id === userId) : false,
          hasScheduledTime: !!m.scheduledTime,
        })),
        ...data.awaitingSchedule.map(m => ({
          matchId: m.matchId,
          courtId: 'unassigned',
          courtName: 'Awaiting Court Assignment',
          time: null,
          participants: m.participants,
          isUserMatch: userId ? m.participantIds.some((id: any) => id === userId) : false,
          hasScheduledTime: false,
        }))
      ];

      // Set the order of play with formatted matches
      this.orderOfPlay.set({
        matches: allMatches,
        isPublished: (data as any).isPublished ?? false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load order of play';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Changes the selected date to filter matches.
   *
   * @param event - Date change event
   */
  public onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      this.selectedDate.set(new Date(target.value));
    }
  }

  /**
   * Clears the date filter to show all matches.
   */
  public clearDateFilter(): void {
    this.selectedDate.set(null);
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
   * @param timeStr - ISO time string or null
   * @returns Formatted time string
   */
  public formatTime(timeStr: string | null): string {
    if (!timeStr) return 'Time pending';
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * Formats date for display.
   *
   * @param timeStr - ISO time string or null
   * @returns Formatted date (e.g., "April 4, 2026")
   */
  public formatDate(timeStr: string | null): string {
    if (!timeStr) return '';
    
    const date = new Date(timeStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Extracts initials from a full name.
   *
   * @param name - Full name (e.g., "Andy Murray")
   * @returns Initials (e.g., "AM")
   */
  public getInitials(name: string): string {
    if (!name || name === 'TBD') return 'TB';
    
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
      
      // FR5: Validate start time against court operating hours
      const courtsWithHours = this.courts().filter(c => c.openingTime && c.closingTime);
      if (courtsWithHours.length > 0) {
        // Find earliest opening time among all courts
        const earliestOpening = courtsWithHours.reduce((earliest, court) => {
          if (!earliest) return court.openingTime;
          return court.openingTime < earliest ? court.openingTime : earliest;
        }, undefined as string | undefined);

        // Find latest closing time among all courts
        const latestClosing = courtsWithHours.reduce((latest, court) => {
          if (!latest) return court.closingTime;
          return court.closingTime > latest ? court.closingTime : latest;
        }, undefined as string | undefined);

        // Compare start time with earliest opening
        if (earliestOpening && opts.startTime < earliestOpening) {
          this.errorMessage.set(
            `⏰ Start time (${opts.startTime}) is before courts open. ` +
            `Earliest court opening: ${earliestOpening}. Please adjust the start time.`
          );
          this.isGenerating.set(false);
          return;
        }

        // Also check if start time is at or after latest closing
        if (latestClosing && opts.startTime >= latestClosing) {
          this.errorMessage.set(
            `⏰ Start time (${opts.startTime}) is at or after courts close. ` +
            `Latest court closing: ${latestClosing}. Please adjust the start time.`
          );
          this.isGenerating.set(false);
          return;
        }
      }
      
      const payload = {
        tournamentId: this.tournamentId(),
        ...opts,
      };
      
      const response = await this.http.post<{
        message: string;
        scheduledCount: number;
        conflicts?: string[];
      }>('/order-of-play/generate', payload);

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
      await this.loadOrderOfPlay();
    } catch (error: any) {
      console.error('Generate schedule error:', error);
      let message = 'Failed to generate schedule';
      if (error.response?.data?.message) {
        message = error.response.data.message;
        // Check if error is about missing courts
        if (message.includes('No available') && message.includes('courts found')) {
          this.missingCourts.set(true);
        }
      } else if (error.message) {
        message = error.message;
      }
      this.errorMessage.set(message);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Initializes default courts for the tournament (Admin only).
   */
  public async initializeCourts(): Promise<void> {
    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.missingCourts.set(false);

    try {
      const response = await this.http.post<{
        message: string;
        courts: any[];
      }>(`/courts/initialize/${this.tournamentId()}`, {
        courtCount: 2, // Create 2 courts by default
      });

      this.successMessage.set(
        `✅ ${response.courts.length} court(s) created! You can now generate the schedule.`
      );

      // Reload courts
      await this.loadCourts();
    } catch (error: any) {
      console.error('Initialize courts error:', error);
      let message = 'Failed to initialize courts';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      this.errorMessage.set(message);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Regenerates the entire schedule with new parameters, clearing existing schedules (Admin only).
   */
  public async regenerateSchedule(): Promise<void> {
    // Confirm before regenerating
    const confirmed = confirm(
      '⚠️ This will clear all existing schedules and regenerate them with the new parameters. Continue?'
    );
    
    if (!confirmed) return;

    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const opts = this.scheduleOptions();
      
      // FR5: Validate start time against court operating hours
      const courtsWithHours = this.courts().filter(c => c.openingTime && c.closingTime);
      if (courtsWithHours.length > 0) {
        // Find earliest opening time among all courts
        const earliestOpening = courtsWithHours.reduce((earliest, court) => {
          if (!earliest) return court.openingTime;
          return court.openingTime < earliest ? court.openingTime : earliest;
        }, undefined as string | undefined);

        // Find latest closing time among all courts
        const latestClosing = courtsWithHours.reduce((latest, court) => {
          if (!latest) return court.closingTime;
          return court.closingTime > latest ? court.closingTime : latest;
        }, undefined as string | undefined);

        // Compare start time with earliest opening
        if (earliestOpening && opts.startTime < earliestOpening) {
          this.errorMessage.set(
            `⏰ Start time (${opts.startTime}) is before courts open. ` +
            `Earliest court opening: ${earliestOpening}. Please adjust the start time.`
          );
          this.isGenerating.set(false);
          return;
        }

        // Also check if start time is at or after latest closing
        if (latestClosing && opts.startTime >= latestClosing) {
          this.errorMessage.set(
            `⏰ Start time (${opts.startTime}) is at or after courts close. ` +
            `Latest court closing: ${latestClosing}. Please adjust the start time.`
          );
          this.isGenerating.set(false);
          return;
        }
      }
      
      const response = await this.http.post<{
        message: string;
        scheduledCount: number;
        conflicts?: string[];
      }>('/order-of-play/regenerate', {
        tournamentId: this.tournamentId(),
        ...opts,
      });

      this.successMessage.set(
        `🔄 Schedule regenerated! ${response.scheduledCount} matches rescheduled.`
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
      const message = error instanceof Error ? error.message : 'Failed to regenerate schedule';
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
    // Use match time if available, otherwise use scheduling options start date/time
    let date: Date;
    if (match.time) {
      date = new Date(match.time);
    } else {
      // Default to start date/time from scheduling options
      const opts = this.scheduleOptions();
      date = new Date(opts.startDate);
      const [hours, minutes] = opts.startTime.split(':');
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }
    
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
   * Validates both overlaps and minimum break time between matches.
   */
  public checkConflicts(): void {
    const form = this.rescheduleForm();
    const currentMatch = this.selectedMatch();
    
    if (!form.courtId || !form.scheduledTime || !currentMatch) {
      this.conflictWarning.set(null);
      return;
    }

    const newTime = new Date(form.scheduledTime);
    const matchDuration = this.scheduleOptions().matchDuration || 90; // Use settings or default
    const breakTime = this.scheduleOptions().breakTime || 15; // Use settings or default
    const newEndTime = new Date(newTime.getTime() + matchDuration * 60000);

    // Get all matches on the selected court
    const allMatches = this.matches();
    const courtMatches = allMatches.filter(
      (m: any) => 
        m.courtName === form.courtId && 
        m.matchId !== currentMatch.matchId // Exclude current match
    );

    // Check for overlaps and break time violations
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
          `⚠️ Time overlap: ${participants} is scheduled at ${existingTimeStr} on ${form.courtId}`
        );
        return;
      }

      // Check for break time violation if new match is after existing match
      if (newTime >= existingEndTime) {
        const timeSinceExistingEnd = (newTime.getTime() - existingEndTime.getTime()) / 1000 / 60;
        if (timeSinceExistingEnd < breakTime) {
          const existingTimeStr = existingTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
          this.conflictWarning.set(
            `⚠️ Insufficient break time: Only ${Math.floor(timeSinceExistingEnd)} minutes after match at ${existingTimeStr}. Need ${breakTime} minutes break.`
          );
          return;
        }
      }

      // Check for break time violation if new match is before existing match
      if (newEndTime <= existingTime) {
        const timeUntilExistingStart = (existingTime.getTime() - newEndTime.getTime()) / 1000 / 60;
        if (timeUntilExistingStart < breakTime) {
          const existingTimeStr = existingTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
          this.conflictWarning.set(
            `⚠️ Insufficient break time: Only ${Math.floor(timeUntilExistingStart)} minutes before match at ${existingTimeStr}. Need ${breakTime} minutes break.`
          );
          return;
        }
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

      // Backend expects the match ID in the URL path and break time for validation
      await this.http.put(`/order-of-play/${match.matchId}/reschedule`, {
        courtId: form.courtId,
        scheduledTime: form.scheduledTime,
        breakTime: this.scheduleOptions().breakTime || 15, // Pass break time for backend validation
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
      const response = await this.http.post<{
        message: string;
        notifiedCount: number;
      }>(`/order-of-play/tournament/${this.tournamentId()}/publish`, {
        date: this.selectedDate().toISOString().split('T')[0],
      });

      this.successMessage.set(
        `Published! ${response.notifiedCount} participants notified.`
      );

      await this.loadOrderOfPlay();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish order of play';
      this.errorMessage.set(message);
    } finally {
      this.isPublishing.set(false);
    }
  }

  /**
   * Opens the add court modal (Admin only).
   */
  public openAddCourtModal(): void {
    this.showAddCourtModal.set(true);
    this.newCourtName.set('');
    this.errorMessage.set(null);
  }

  /**
   * Closes the add court modal (Admin only).
   */
  public closeAddCourtModal(): void {
    this.showAddCourtModal.set(false);
    this.newCourtName.set('');
    this.newCourtOpeningTime.set('');
    this.newCourtClosingTime.set('');
  }

  /**
   * Creates a new court for the tournament (Admin only).
   */
  public async createCourt(): Promise<void> {
    const name = this.newCourtName().trim();
    const openingTime = this.newCourtOpeningTime().trim() || undefined;
    const closingTime = this.newCourtClosingTime().trim() || undefined;
    
    if (!name) {
      this.errorMessage.set('Court name is required');
      return;
    }

    // Validate time format if provided
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (openingTime && !timeRegex.test(openingTime)) {
      this.errorMessage.set('Opening time must be in HH:MM format (e.g., 08:00)');
      return;
    }
    if (closingTime && !timeRegex.test(closingTime)) {
      this.errorMessage.set('Closing time must be in HH:MM format (e.g., 22:00)');
      return;
    }

    // Validate closing time is after opening time
    if (openingTime && closingTime) {
      const [openHour, openMin] = openingTime.split(':').map(Number);
      const [closeHour, closeMin] = closingTime.split(':').map(Number);
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;
      
      if (closeMinutes <= openMinutes) {
        this.errorMessage.set('Closing time must be after opening time');
        return;
      }
    }

    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.http.post('/courts', {
        tournamentId: this.tournamentId(),
        name,
        openingTime,
        closingTime,
      });

      this.successMessage.set(`✅ Court "${name}" created successfully!`);
      this.closeAddCourtModal();
      
      // Reload courts
      await this.loadCourts();
    } catch (error: any) {
      console.error('Create court error:', error);
      let message = 'Failed to create court';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      this.errorMessage.set(message);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Starts editing a court's name (Admin only).
   *
   * @param courtId - ID of the court to edit
   * @param currentName - Current name of the court
   */
  public startEditCourt(courtId: string, currentName: string): void {
    this.editingCourtId.set(courtId);
    this.editingCourtName.set(currentName);
    this.errorMessage.set(null);
  }

  /**
   * Cancels editing a court (Admin only).
   */
  public cancelEditCourt(): void {
    this.editingCourtId.set(null);
    this.editingCourtName.set('');
  }

  /**
   * Updates a court's name (Admin only).
   *
   * @param courtId - ID of the court to update
   */
  public async updateCourt(courtId: string): Promise<void> {
    const name = this.editingCourtName().trim();
    
    if (!name) {
      this.errorMessage.set('Court name is required');
      return;
    }

    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.http.put(`/courts/${courtId}`, {name});

      this.successMessage.set(`✅ Court updated successfully!`);
      this.cancelEditCourt();
      
      // Reload courts
      await this.loadCourts();
    } catch (error: any) {
      console.error('Update court error:', error);
      let message = 'Failed to update court';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      this.errorMessage.set(message);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Deletes a court (Admin only).
   *
   * @param courtId - ID of the court to delete
   * @param courtName - Name of the court (for confirmation)
   */
  public async deleteCourt(courtId: string, courtName: string): Promise<void> {
    const confirmed = confirm(
      `⚠️ Are you sure you want to delete "${courtName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.http.delete(`/courts/${courtId}`);

      this.successMessage.set(`✅ Court "${courtName}" deleted successfully!`);
      
      // Reload courts
      await this.loadCourts();
    } catch (error: any) {
      console.error('Delete court error:', error);
      let message = 'Failed to delete court';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      this.errorMessage.set(message);
    } finally {
      this.isGenerating.set(false);
    }
  }
}
