/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 30, 2026
 * @file src/presentation/components/visual-bracket/visual-bracket.component.ts
 * @desc Visual bracket display component for single elimination and round robin brackets.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Component, Input, signal, computed, inject, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {type MatchDto, type BracketDto, type RegistrationDto} from '@application/dto';
import {BracketType} from '@domain/enumerations/bracket-type';
import {MatchStatus} from '@domain/enumerations/match-status';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {RegistrationService} from '@application/services';
import templateHtml from './visual-bracket.component.html?raw';
import styles from './visual-bracket.component.css?raw';

/**
 * Match organized by round for visual display.
 */
interface RoundMatches {
  round: number;
  roundName: string;
  matches: MatchDto[];
}

/**
 * VisualBracketComponent displays tournament brackets visually.
 */
@Component({
  selector: 'app-visual-bracket',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: templateHtml,
  styles: [styles],
})
export class VisualBracketComponent {
  private readonly router = inject(Router);
  private readonly registrationService = inject(RegistrationService);

  /** Bracket configuration */
  @Input() public set bracket(value: BracketDto) {
    this._bracket.set(value);
  }
  
  public get bracket(): BracketDto {
    return this._bracket()!;
  }
  
  private readonly _bracket = signal<BracketDto | null>(null);

  /** Matches in the bracket */
  @Input() public set matches(value: MatchDto[]) {
    this._matches.set(value);
  }

  private readonly _matches = signal<MatchDto[]>([]);
  
  /** Registration data for acceptance type badges */
  private readonly _registrations = signal<Map<string, RegistrationDto>>(new Map());

  /** Bracket type enum for template */
  public readonly BracketType = BracketType;

  /** Match status enum for template */
  public readonly MatchStatus = MatchStatus;

  constructor() {
    // Load registrations when bracket changes
    effect(() => {
      const bracket = this._bracket();
      if (bracket?.categoryId) {
        void this.loadRegistrations(bracket.categoryId);
      }
    });
  }

  /**
   * Loads registration data for acceptance type badges.
   */
  private async loadRegistrations(categoryId: string): Promise<void> {
    try {
      const registrations = await this.registrationService.getRegistrationsByCategory(categoryId);
      const registrationMap = new Map<string, RegistrationDto>();
      
      for (const reg of registrations) {
        registrationMap.set(reg.participantId, reg);
        // For doubles, also map the partner
        if (reg.partnerId) {
          registrationMap.set(reg.partnerId, reg);
        }
      }
      
      this._registrations.set(registrationMap);
    } catch (error) {
      console.error('Failed to load registrations for acceptance badges:', error);
    }
  }

  /**
   * Matches organized by rounds.
   */
  public readonly matchesByRound = computed(() => {
    const matches = this._matches();
    if (!matches.length) return [];

    // Group matches by round
    const roundMap = new Map<number, MatchDto[]>();
    for (const match of matches) {
      if (!roundMap.has(match.round)) {
        roundMap.set(match.round, []);
      }
      roundMap.get(match.round)!.push(match);
    }

    // Convert to sorted array
    const rounds: RoundMatches[] = [];
    const sortedRounds = Array.from(roundMap.keys()).sort((a, b) => a - b);

    for (let i = 0; i < sortedRounds.length; i++) {
      const round = sortedRounds[i];
      // Use 1-based rank (position in sorted order) rather than raw round number
      // so that consolation rounds (101, 102, 103...) receive the same friendly
      // names (Quarter-Finals, Semi-Finals, Final) as equivalent main-draw rounds.
      const roundRank = i + 1;
      const roundMatches = roundMap.get(round)!;
      // Sort matches within round by match number
      roundMatches.sort((a, b) => a.matchNumber - b.matchNumber);

      rounds.push({
        round,
        roundName: this.getRoundName(roundRank, sortedRounds.length),
        matches: roundMatches,
      });
    }

    return rounds;
  });

  /**
   * Gets display name for participant.
   *
   * @param match - Match data
   * @param participantNumber - 1 or 2
   * @returns Participant display name
   */
  public getParticipantName(match: MatchDto, participantNumber: 1 | 2): string {
    const participantId = participantNumber === 1 ? match.participant1Id : match.participant2Id;
    
    console.log(`🐛 DEBUG getParticipantName:`, {
      matchId: match.id,
      matchNumber: match.matchNumber,
      participantNumber,
      participantId,
      participantIdType: typeof participantId,
      participantIdValue: participantId,
      matchStatus: match.status,
      isBYEMatch: match.status === 'BYE',
      isNull: participantId === null,
      isUndefined: participantId === undefined
    });
    
    // Check for BYE match: status is BYE and this slot is empty (null participant)
    if (match.status === 'BYE' && !participantId) {
      return 'BYE';
    }
    
    // Doubles match: show "FirstName LastName / FirstName LastName" with full names
    const team = participantNumber === 1 ? match.participant1Team : match.participant2Team;
    if (team) {
      return `${team.player1.firstName} ${team.player1.lastName} / ${team.player2.firstName} ${team.player2.lastName}`;
    }

    const participant = participantNumber === 1 ? match.participant1 : match.participant2;
    
    // Check for TBD (to be determined - participant not yet known)
    if (!participant || !participantId) {
      return 'TBD';
    }
    
    // Singles: use full name
    return `${participant.firstName} ${participant.lastName}`;
  }

  /**
   * Gets seed number for participant (or team in doubles).
   *
   * @param match - Match data
   * @param participantNumber - 1 or 2
   * @returns Seed number or null
   */
  public getParticipantSeed(match: MatchDto, participantNumber: 1 | 2): number | null {
    const team = participantNumber === 1 ? match.participant1Team : match.participant2Team;
    if (team) return team.seedNumber ?? null;

    const registrations = this._registrations();
    const participant = participantNumber === 1 ? match.participant1 : match.participant2;
    if (!participant) return null;

    const registration = registrations.get(participant.id);
    return registration?.seedNumber ?? participant.seed ?? null;
  }

  /**
   * Gets acceptance type for participant.
   *
   * @param match - Match data
   * @param participantNumber - 1 or 2
   * @returns Acceptance type or null
   */
  public getParticipantAcceptanceType(match: MatchDto, participantNumber: 1 | 2): AcceptanceType | null {
    const registrations = this._registrations();
    
    // For doubles, check team registration (use participant1 as primary)
    const team = participantNumber === 1 ? match.participant1Team : match.participant2Team;
    if (team) {
      const reg = registrations.get(team.player1.id);
      return reg?.acceptanceType ?? null;
    }
    
    // For singles, check participant registration
    const participant = participantNumber === 1 ? match.participant1 : match.participant2;
    if (!participant) return null;
    
    const reg = registrations.get(participant.id);
    return reg?.acceptanceType ?? null;
  }

  /**
   * Gets acceptance type badge text for display.
   * Shows all acceptance types as badges for transparency.
   *
   * @param acceptanceType - Acceptance type enum value
   * @returns Badge text or null
   */
  public getAcceptanceTypeBadge(acceptanceType: AcceptanceType | null | undefined): string | null {
    if (!acceptanceType) return null;
    
    // Map acceptance types to badge abbreviations
    const badges: Record<AcceptanceType, string> = {
      [AcceptanceType.WILD_CARD]: 'WC',
      [AcceptanceType.SPECIAL_EXEMPTION]: 'SE',
      [AcceptanceType.JUNIOR_EXEMPTION]: 'JE',
      [AcceptanceType.QUALIFIER]: 'Q',
      [AcceptanceType.LUCKY_LOSER]: 'LL',
      [AcceptanceType.ALTERNATE]: 'ALT',
      [AcceptanceType.WITHDRAWN]: 'WD',
      [AcceptanceType.DIRECT_ACCEPTANCE]: 'DA',
      [AcceptanceType.ORGANIZER_ACCEPTANCE]: 'OA',
      [AcceptanceType.SEEDED]: 'S',
    };
    
    return badges[acceptanceType] ?? null;
  }

  /**
   * Gets human-readable format text for match display.
   *
   * @param format - Match format enum value
   * @returns Format display text
   */
  public getMatchFormatDisplay(format: string | null | undefined): string {
    if (!format) return 'Best of 3';
    
    const formatLabels: Record<string, string> = {
      'BEST_OF_3_FINAL_SET_TIEBREAK': 'Best of 3 (Super TB)',
      'BEST_OF_3_ADVANTAGE': 'Best of 3',
      'BEST_OF_5_FINAL_SET_TIEBREAK': 'Best of 5 (Super TB)',
      'BEST_OF_5_ADVANTAGE': 'Best of 5',
      'PRO_SET': 'Pro Set',
      'SHORT_SETS': 'Short Sets',
      'FAST4': 'Fast4',
      'SUPER_TIEBREAK': 'Super Tiebreak',
    };
    
    return formatLabels[format] ?? format;
  }

  /**
   * Checks if participant (or team in doubles) is the winner.
   *
   * @param match - Match data
   * @param participantNumber - 1 or 2
   * @returns True if winner
   */
  public isWinner(match: MatchDto, participantNumber: 1 | 2): boolean {
    // Doubles match: check team winner
    if (match.participant1TeamId || match.participant2TeamId) {
      const teamId = participantNumber === 1 ? match.participant1TeamId : match.participant2TeamId;
      return Boolean(match.winnerTeamId && match.winnerTeamId === teamId);
    }
    
    // Singles match: check participant winner
    const participantId = participantNumber === 1 ? match.participant1Id : match.participant2Id;
    return Boolean(match.winnerId && participantId && match.winnerId === participantId);
  }

  /**
   * Gets participant ID for singles match.
   *
   * @param match - Match data
   * @param participantNumber - 1 or 2
   * @returns Participant ID or null for BYE
   */
  public getParticipantId(match: MatchDto, participantNumber: 1 | 2): string | null {
    const participant = participantNumber === 1 ? match.participant1 : match.participant2;
    return participant?.id ?? null;
  }

  /**
   * Checks if match is a doubles match.
   *
   * @param match - Match data
   * @returns True if doubles match
   */
  public isDoublesMatch(match: MatchDto): boolean {
    return Boolean(match.participant1TeamId || match.participant2TeamId);
  }

  /**
   * Gets team player IDs for doubles match.
   *
   * @param match - Match data
   * @param participantNumber - 1 or 2
   * @returns Object with player1Id and player2Id, or null if not a doubles match
   */
  public getTeamPlayerIds(match: MatchDto, participantNumber: 1 | 2): {player1Id: string; player2Id: string} | null {
    const team = participantNumber === 1 ? match.participant1Team : match.participant2Team;
    if (!team) return null;
    return {
      player1Id: team.player1.id,
      player2Id: team.player2.id,
    };
  }

  /**
   * Gets round name for display.
   *
   * @param round - Round number
   * @param totalRounds - Total number of rounds
   * @returns Round display name
   */
  private getRoundName(round: number, totalRounds: number): string {
    if (this.bracket?.bracketType === BracketType.ROUND_ROBIN) {
      return `Round ${round}`;
    }

    // Single elimination round names
    const roundsFromEnd = totalRounds - round + 1;
    
    switch (roundsFromEnd) {
      case 1:
        return 'Final';
      case 2:
        return 'Semi-Finals';
      case 3:
        return 'Quarter-Finals';
      case 4:
        return 'Round of 16';
      case 5:
        return 'Round of 32';
      default:
        return `Round ${round}`;
    }
  }

  /**
   * Navigates to match detail page.
   *
   * @param matchId - Match ID
   */
  public goToMatch(matchId: string): void {
    void this.router.navigate(['/matches', matchId]);
  }
}
