/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 1, 2026
 * @file presentation/pages/admin/disputed-matches/disputed-matches.component.ts
 * @desc Admin component for reviewing and resolving disputed match results (FR27).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {UserRole} from '@domain/enumerations/user-role';
import {environment} from '../../../../environments/environment';
import templateHtml from './disputed-matches.component.html?raw';
import styles from './disputed-matches.component.css?inline';

/**
 * Disputed match result interface.
 */
interface DisputedResult {
  id: string;
  matchId: string;
  submittedBy: string;
  winnerId: string;
  setScores: string[];
  confirmationStatus: string;
  disputeReason: string;
  disputedAt: Date;
  playerComments?: string;
  match?: {
    id: string;
    matchNumber: number;
    round: number;
    participant1: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
    participant2: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
}

/**
 * DisputedMatchesComponent displays and allows resolution of disputed match results.
 */
@Component({
  selector: 'app-disputed-matches',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [styles],
})
export class DisputedMatchesComponent implements OnInit {
  /** Services */
  private readonly http = inject(HttpClient);
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /** Disputed results list */
  public disputedResults = signal<DisputedResult[]>([]);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Show resolution modal */
  public showModal = signal(false);

  /** Show annul modal */
  public showAnnulModal = signal(false);

  /** Selected result for resolution */
  public selectedResult = signal<DisputedResult | null>(null);

  /** Resolution form */
  public resolutionForm = signal({
    winnerId: '',
    sets: [] as Array<{ participant1Score: number; participant2Score: number }>,
    resolutionNotes: '',
  });

  /** Annul reason */
  public annulReason = signal('');

  /**
   * Initializes component and verifies admin access.
   */
  public async ngOnInit(): Promise<void> {
    const user = this.authStateService.getCurrentUser();
    if (!user || (user.role !== UserRole.SYSTEM_ADMIN && user.role !== UserRole.TOURNAMENT_ADMIN)) {
      void this.router.navigate(['/']);
      return;
    }

    await this.loadDisputedResults();
  }

  /**
   * Loads all disputed match results.
   */
  private async loadDisputedResults(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const token = this.authStateService.getToken();
      const response = await this.http
        .get<DisputedResult[]>(`${environment.apiUrl}/admin/matches/disputed`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .toPromise();

      this.disputedResults.set(response || []);
    } catch (error) {
      console.error('Error loading disputed results:', error);
      this.errorMessage.set('Failed to load disputed results');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Opens resolution modal for a disputed result.
   *
   * @param result - The disputed result to resolve
   */
  public openResolutionModal(result: DisputedResult): void {
    this.selectedResult.set(result);
    // Parse setScores (e.g., ["6-4", "7-5"]) into set objects
    const sets = result.setScores.map(score => {
      const [p1, p2] = score.split('-').map(s => parseInt(s.trim(), 10));
      return { participant1Score: p1 || 0, participant2Score: p2 || 0 };
    });
    // Ensure at least one set
    if (sets.length === 0) {
      sets.push({ participant1Score: 0, participant2Score: 0 });
    }
    this.resolutionForm.set({
      winnerId: result.winnerId,
      sets: sets,
      resolutionNotes: '',
    });
    this.showModal.set(true);
  }

  /**
   * Closes the resolution modal.
   */
  public closeModal(): void {
    this.showModal.set(false);
    this.selectedResult.set(null);
    this.annulReason.set('');
  }

  /**
   * Opens the annul modal.
   *
   * @param result - The disputed result to annul
   */
  public openAnnulModal(result: DisputedResult): void {
    this.selectedResult.set(result);
    this.annulReason.set('');
    this.showAnnulModal.set(true);
  }

  /**
   * Closes the annul modal.
   */
  public closeAnnulModal(): void {
    this.showAnnulModal.set(false);
    this.selectedResult.set(null);
    this.annulReason.set('');
  }

  /**
   * Adds a new set to the resolution form.
   */
  public addSet(): void {
    const currentSets = this.resolutionForm().sets;
    if (currentSets.length < 5) {
      this.resolutionForm.set({
        ...this.resolutionForm(),
        sets: [...currentSets, { participant1Score: 0, participant2Score: 0 }],
      });
    }
  }

  /**
   * Removes a set from the resolution form.
   *
   * @param index - The index of the set to remove
   */
  public removeSet(index: number): void {
    const currentSets = this.resolutionForm().sets;
    if (currentSets.length > 1) {
      const newSets = currentSets.filter((_, i) => i !== index);
      this.resolutionForm.set({
        ...this.resolutionForm(),
        sets: newSets,
      });
    }
  }

  /**
   * Updates participant 1 score for a specific set.
   *
   * @param index - The index of the set to update
   * @param value - The new score value
   */
  public updateParticipant1Score(index: number, value: number): void {
    const currentSets = [...this.resolutionForm().sets];
    currentSets[index] = { ...currentSets[index], participant1Score: value };
    this.resolutionForm.set({
      ...this.resolutionForm(),
      sets: currentSets,
    });
  }

  /**
   * Updates participant 2 score for a specific set.
   *
   * @param index - The index of the set to update
   * @param value - The new score value
   */
  public updateParticipant2Score(index: number, value: number): void {
    const currentSets = [...this.resolutionForm().sets];
    currentSets[index] = { ...currentSets[index], participant2Score: value };
    this.resolutionForm.set({
      ...this.resolutionForm(),
      sets: currentSets,
    });
  }

  /**
   * Resolves a disputed result (confirms or modifies).
   */
  public async resolveDispute(): Promise<void> {
    const result = this.selectedResult();
    const form = this.resolutionForm();

    if (!result || !form.winnerId || form.sets.length === 0) {
      alert('Please provide winner and scores');
      return;
    }

    // Convert sets to setScores format (e.g., ["6-4", "7-5"])
    const setScores = form.sets.map(set => `${set.participant1Score}-${set.participant2Score}`);

    this.isLoading.set(true);

    try {
      const token = this.authStateService.getToken();
      await this.http
        .put(
          `${environment.apiUrl}/admin/matches/${result.matchId}/result/resolve`,
          {
            winnerId: form.winnerId,
            setScores: setScores,
            resolutionNotes: form.resolutionNotes,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .toPromise();

      alert('Dispute resolved successfully');
      this.closeModal();
      await this.loadDisputedResults();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Failed to resolve dispute');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Annuls a disputed result.
   */
  public async annulResult(): Promise<void> {
    const result = this.selectedResult();
    const reason = this.annulReason();

    if (!result || !reason.trim()) {
      alert('Please provide a reason for annulling the result');
      return;
    }

    if (!confirm('Are you sure you want to annul this result? The match will be reset.')) {
      return;
    }

    this.isLoading.set(true);

    try {
      const token = this.authStateService.getToken();
      await this.http
        .delete(
          `${environment.apiUrl}/admin/matches/${result.matchId}/result/annul`,
          {
            headers: { Authorization: `Bearer ${token}` },
            body: { annulReason: reason },
          }
        )
        .toPromise();

      alert('Result annulled successfully');
      this.closeModal();
      await this.loadDisputedResults();
    } catch (error) {
      console.error('Error annulling result:', error);
      alert('Failed to annul result');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Gets full name from participant.
   *
   * @param participant - The participant
   * @returns Full name
   */
  public getFullName(participant: { firstName: string; lastName: string } | null): string {
    if (!participant) return 'Unknown';
    return `${participant.firstName} ${participant.lastName}`.trim();
  }

  /**
   * Formats date.
   *
   * @param date - The date
   * @returns Formatted date string
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  /**
   * Updates the winner ID in the resolution form.
   *
   * @param winnerId - Winner ID
   */
  public updateWinnerId(winnerId: string): void {
    this.resolutionForm.set({
      ...this.resolutionForm(),
      winnerId: winnerId,
    });
  }

  /**
   * Updates the resolution notes in the resolution form.
   *
   * @param notes - Resolution notes
   */
  public updateResolutionNotes(notes: string): void {
    this.resolutionForm.set({
      ...this.resolutionForm(),
      resolutionNotes: notes,
    });
  }

  /**
   * Updates the annul reason.
   *
   * @param reason - Annul reason
   */
  public updateAnnulReason(reason: string): void {
    this.annulReason.set(reason);
  }

  /**
   * Gets initials from participant.
   *
   * @param participant - The participant
   * @returns Initials string
   */
  public getInitials(participant: any): string {
    if (!participant) return '?';
    const first = participant.firstName?.charAt(0)?.toUpperCase() || '';
    const last = participant.lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  }

  /**
   * Navigates back to the previous page.
   */
  public goBack(): void {
    this.location.back();
  }
}
