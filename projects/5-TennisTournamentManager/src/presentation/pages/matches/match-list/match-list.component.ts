/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file presentation/pages/matches/match-list/match-list.component.ts
 * @desc Paginated list of matches with real-time status updates (NFR5).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule, ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {MatchService, BracketService, UserService} from '@application/services';
import {type MatchDto, type PhaseDto, type UserDto} from '@application/dto';
import {MatchStatus} from '@domain/enumerations/match-status';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './match-list.component.html?raw';
import styles from './match-list.component.css?inline';

/**
 * Enhanced match with participant names and phase information.
 */
interface EnhancedMatch extends MatchDto {
  participant1Name: string | null;
  participant2Name: string | null;
  phaseName: string;
  phaseOrder: number;
}

/**
 * MatchListComponent displays a filterable list of matches grouped by phase.
 */
@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EnumFormatPipe],
  template: templateHtml,
  styles: [styles],
})
export class MatchListComponent implements OnInit {
  /** Services */
  private readonly matchService = inject(MatchService);
  private readonly bracketService = inject(BracketService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** List of enhanced matches */
  public matches = signal<EnhancedMatch[]>([]);

  /** Matches grouped by phase */
  public groupedMatches = computed(() => {
    const matches = this.matches();
    const groups = new Map<string, EnhancedMatch[]>();
    
    for (const match of matches) {
      const key = `${match.phaseOrder}-${match.phaseName}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(match);
    }

    // Convert to sorted array
    return Array.from(groups.entries())
      .sort((a, b) => {
        const orderA = parseInt(a[0].split('-')[0]);
        const orderB = parseInt(b[0].split('-')[0]);
        return orderA - orderB;
      })
      .map(([key, matches]) => ({
        phaseName: key.split('-').slice(1).join('-'),
        matches: matches.sort((a, b) => a.id.localeCompare(b.id))
      }));
  });

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Bracket ID filter */
  public bracketId: string | null = null;

  /** Status filter */
  public selectedStatus: MatchStatus | null = null;

  /** Expanded phases (for accordion) */
  public expandedPhases = signal<Set<string>>(new Set());

  /** Available match statuses */
  public readonly statuses = Object.values(MatchStatus);

  /**
   * Initializes component and loads matches.
   */
  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.bracketId = params.get('bracketId');
      void this.loadMatches();
    });
  }

  /**
   * Toggles phase expansion in accordion.
   *
   * @param phaseName - Name of the phase to toggle
   */
  public togglePhase(phaseName: string): void {
    const expanded = this.expandedPhases();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(phaseName)) {
      newExpanded.delete(phaseName);
    } else {
      newExpanded.add(phaseName);
    }
    
    this.expandedPhases.set(newExpanded);
  }

  /**
   * Checks if a phase is expanded.
   *
   * @param phaseName - Name of the phase
   * @returns True if expanded
   */
  public isPhaseExpanded(phaseName: string): boolean {
    return this.expandedPhases().has(phaseName);
  }

  /**
   * Loads matches based on current filters and enriches with participant names.
   */
  public async loadMatches(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Fetch matches based on bracket filter
      let matches: MatchDto[];
      if (this.bracketId) {
        matches = await this.matchService.getMatchesByBracket(this.bracketId);
      } else {
        matches = await this.matchService.getAllMatches();
      }

      // Apply status filter
      if (this.selectedStatus) {
        matches = matches.filter(m => m.status === this.selectedStatus);
      }

      // Fetch phases for all brackets
      const bracketIds = [...new Set(matches.map(m => m.bracketId))];
      const phasesMap = new Map<string, PhaseDto>();
      
      for (const bracketId of bracketIds) {
        const phases = await this.bracketService.getPhases(bracketId);
        for (const phase of phases) {
          phasesMap.set(phase.id, phase);
        }
      }

      // Enrich matches with participant names and phase info
      // Participant data is now included in the MatchDto from backend relations
      const enriched: EnhancedMatch[] = matches.map(match => {
        const phase = phasesMap.get(match.phaseId);

        // Use participant objects from backend if available
        const participant1Name = match.participant1 
          ? `${match.participant1.firstName} ${match.participant1.lastName}`
          : 'TBD';
        
        const participant2Name = match.participant2 
          ? `${match.participant2.firstName} ${match.participant2.lastName}`
          : 'TBD';

        return {
          ...match,
          participant1Name,
          participant2Name,
          phaseName: phase?.name || 'Unknown Phase',
          phaseOrder: phase?.order || 0
        };
      });

      this.matches.set(enriched);
      
      // Expand first phase by default
      if (this.groupedMatches().length > 0) {
        const firstPhase = this.groupedMatches()[0].phaseName;
        this.expandedPhases.set(new Set([firstPhase]));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load matches';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navigates to match detail page.
   *
   * @param matchId - ID of the match
   */
  public viewMatch(matchId: string): void {
    void this.router.navigate(['/matches', matchId]);
  }

  /**
   * Applies status filter.
   */
  public applyFilter(): void {
    void this.loadMatches();
  }

  /**
   * Formats date for display.
   *
   * @param date - Date to format
   * @returns Formatted date string
   */
  public formatDate(date: Date | null): string {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Navigates back to the home page.
   */
  public goBack(): void {
    void this.router.navigate(['/']);
  }
}
