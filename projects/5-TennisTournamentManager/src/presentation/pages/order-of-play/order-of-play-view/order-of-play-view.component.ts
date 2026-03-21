/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/order-of-play/order-of-play-view/order-of-play-view.component.ts
 * @desc Calendar/timeline view of scheduled matches per court (NFR5).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {OrderOfPlayService} from '@application/services';
import {type OrderOfPlayDto} from '@application/dto';
import templateHtml from './order-of-play-view.component.html?raw';

/**
 * OrderOfPlayViewComponent displays the schedule of matches for a specific day.
 */
@Component({
  selector: 'app-order-of-play-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: templateHtml,
  styles: [],
})
export class OrderOfPlayViewComponent implements OnInit {
  /** Services */
  private readonly route = inject(ActivatedRoute);
  private readonly orderOfPlayService = inject(OrderOfPlayService);

  /** Order of play data */
  public orderOfPlay = signal<OrderOfPlayDto | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Selected date */
  public selectedDate: Date = new Date();

  /**
   * Initializes component and loads order of play.
   */
  public ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const tournamentId = params.get('id');
      if (tournamentId) {
        void this.loadOrderOfPlay(tournamentId);
      }
    });
  }

  /**
   * Loads order of play for tournament and date.
   *
   * @param tournamentId - ID of the tournament
   */
  private async loadOrderOfPlay(tournamentId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const orderOfPlay = await this.orderOfPlayService.getOrderOfPlayByDate(
        tournamentId,
        this.selectedDate,
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
   * @param date - New date
   */
  public changeDate(date: Date): void {
    this.selectedDate = date;
    const tournamentId = this.route.snapshot.paramMap.get('id');
    if (tournamentId) {
      void this.loadOrderOfPlay(tournamentId);
    }
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
}
