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
  imports: [CommonModule, RouterModule, FormsModule],
  template: templateHtml,
  styles: [styles],
})
export class OrderOfPlayViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly orderOfPlayRepository = inject(OrderOfPlayRepositoryImpl);
  private readonly authStateService = inject(AuthStateService);
  private readonly location = inject(Location);

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
      }
    });
  }

  /**
   * Loads order of play for tournament and date.
   */
  private async loadOrderOfPlay(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const orderOfPlay = await this.orderOfPlayRepository.getOrderOfPlayByDate(
        this.tournamentId(),
        this.selectedDate(),
      );
      this.orderOfPlay.set(orderOfPlay);
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
}
