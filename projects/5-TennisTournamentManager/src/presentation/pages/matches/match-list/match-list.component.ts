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
import {MatchService, BracketService, UserService, TournamentService, CategoryService} from '@application/services';
import {type MatchDto, type PhaseDto, type UserDto, type BracketDto, type TournamentDto, type CategoryDto} from '@application/dto';
import {MatchStatus} from '@domain/enumerations/match-status';
import {EnumFormatPipe} from '@shared/pipes';
import templateHtml from './match-list.component.html?raw';
import styles from './match-list.component.css?inline';

/**
 * Enhanced match with participant names, phase, tournament, and category information.
 */
interface EnhancedMatch extends MatchDto {
  participant1Name: string | null;
  participant2Name: string | null;
  phaseName: string;
  phaseOrder: number;
  tournamentName: string;
  categoryName: string;
  tournamentId: string;
  categoryId: string;
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
  private readonly tournamentService = inject(TournamentService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** List of enhanced matches */
  public matches = signal<EnhancedMatch[]>([]);

  /** Matches grouped by tournament, category, and phase */
  public groupedMatches = computed(() => {
    const matches = this.matches();
    const groups = new Map<string, {
      tournamentName: string;
      categoryName: string;
      phaseName: string;
      phaseOrder: number;
      matches: EnhancedMatch[];
    }>();
    
    for (const match of matches) {
      const key = `${match.tournamentName}|${match.categoryName}|${match.phaseOrder}-${match.phaseName}`;
      if (!groups.has(key)) {
        groups.set(key, {
          tournamentName: match.tournamentName,
          categoryName: match.categoryName,
          phaseName: match.phaseName,
          phaseOrder: match.phaseOrder,
          matches: []
        });
      }
      groups.get(key)!.matches.push(match);
    }

    // Convert to sorted array
    return Array.from(groups.values())
      .sort((a, b) => {
        // Sort by tournament, then category, then phase order
        if (a.tournamentName !== b.tournamentName) {
          return a.tournamentName.localeCompare(b.tournamentName);
        }
        if (a.categoryName !== b.categoryName) {
          return a.categoryName.localeCompare(b.categoryName);
        }
        return a.phaseOrder - b.phaseOrder;
      })
      .map(group => ({
        ...group,
        matches: group.matches.sort((a, b) => a.id.localeCompare(b.id))
      }));
  });

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Tournament ID filter */
  public tournamentId: string | null = null;

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
      this.tournamentId = params.get('tournamentId');
      this.bracketId = params.get('bracketId');
      void this.loadMatches();
    });
  }

  /**
   * Toggles phase expansion in accordion.
   *
   * @param groupKey - Unique key for the group (tournament|category|phase)
   */
  public togglePhase(groupKey: string): void {
    const expanded = this.expandedPhases();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    
    this.expandedPhases.set(newExpanded);
  }

  /**
   * Checks if a phase group is expanded.
   *
   * @param groupKey - Unique key for the group
   * @returns True if expanded
   */
  public isPhaseExpanded(groupKey: string): boolean {
    return this.expandedPhases().has(groupKey);
  }

  /**
   * Generates unique group key for accordion.
   *
   * @param group - Match group
   * @returns Unique key
   */
  public getGroupKey(group: {tournamentName: string; categoryName: string; phaseName: string}): string {
    return `${group.tournamentName}|${group.categoryName}|${group.phaseName}`;
  }

  /**
   * Loads matches based on current filters and enriches with all context.
   */
  public async loadMatches(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Fetch matches and brackets based on filters
      let matches: MatchDto[];
      let brackets: BracketDto[];

      if (this.bracketId) {
        // Filter by specific bracket
        matches = await this.matchService.getMatchesByBracket(this.bracketId);
        const bracket = await this.bracketService.getBracketById(this.bracketId);
        brackets = [bracket];
      } else if (this.tournamentId) {
        // Filter by tournament (all brackets in tournament)
        brackets = await this.bracketService.getBracketsByTournament(this.tournamentId);
        const allMatches: MatchDto[] = [];
        for (const bracket of brackets) {
          const bracketMatches = await this.matchService.getMatchesByBracket(bracket.id);
          allMatches.push(...bracketMatches);
        }
        matches = allMatches;
      } else {
        // No filter - get all matches (we'll need to fetch brackets from matches)
        matches = await this.matchService.getAllMatches();
        const bracketIds = [...new Set(matches.map(m => m.bracketId))];
        brackets = await Promise.all(
          bracketIds.map(id => this.bracketService.getBracketById(id))
        );
      }

      // Apply status filter
      if (this.selectedStatus) {
        matches = matches.filter(m => m.status === this.selectedStatus);
      }

      // Create maps for brackets, phases, tournaments, and categories
      const bracketsMap = new Map<string, BracketDto>();
      const phasesMap = new Map<string, PhaseDto>();
      const tournamentsMap = new Map<string, TournamentDto>();
      const categoriesMap = new Map<string, CategoryDto>();

      // Populate brackets map
      for (const bracket of brackets) {
        bracketsMap.set(bracket.id, bracket);
      }

      // Fetch phases for all brackets
      for (const bracket of brackets) {
        const phases = await this.bracketService.getPhases(bracket.id);
        for (const phase of phases) {
          phasesMap.set(phase.id, phase);
        }
      }

      // Fetch tournaments and categories
      const tournamentIds = [...new Set(brackets.map(b => b.tournamentId))];
      const categoryIds = [...new Set(brackets.map(b => b.categoryId))];

      for (const tournamentId of tournamentIds) {
        try {
          const tournament = await this.tournamentService.getTournamentById(tournamentId);
          tournamentsMap.set(tournamentId, tournament);
        } catch (error) {
          console.warn(`Failed to fetch tournament ${tournamentId}:`, error);
        }
      }

      for (const categoryId of categoryIds) {
        try {
          const category = await this.categoryService.getCategoryById(categoryId);
          categoriesMap.set(categoryId, category);
        } catch (error) {
          console.warn(`Failed to fetch category ${categoryId}:`, error);
        }
      }

      // Enrich matches with all context
      const enriched: EnhancedMatch[] = matches.map(match => {
        const bracket = bracketsMap.get(match.bracketId);
        const phase = phasesMap.get(match.phaseId);
        const tournament = bracket ? tournamentsMap.get(bracket.tournamentId) : null;
        const category = bracket ? categoriesMap.get(bracket.categoryId) : null;

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
          phaseOrder: phase?.order || 0,
          tournamentName: tournament?.name || 'Unknown Tournament',
          categoryName: category?.name || 'Unknown Category',
          tournamentId: bracket?.tournamentId || '',
          categoryId: bracket?.categoryId || '',
        };
      });

      this.matches.set(enriched);
      
      // Expand first group by default
      if (this.groupedMatches().length > 0) {
        const firstGroup = this.groupedMatches()[0];
        const firstKey = this.getGroupKey(firstGroup);
        this.expandedPhases.set(new Set([firstKey]));
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
