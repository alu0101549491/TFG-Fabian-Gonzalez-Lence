/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 30, 2026
 * @file presentation/components/visual-bracket/visual-bracket.component.ts
 * @desc Visual bracket display component for single elimination and round robin brackets.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, Input, signal, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {type MatchDto, type BracketDto} from '@application/dto';
import {BracketType} from '@domain/enumerations/bracket-type';
import {MatchStatus} from '@domain/enumerations/match-status';
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
  imports: [CommonModule],
  template: templateHtml,
  styles: [styles],
})
export class VisualBracketComponent {
  private readonly router = inject(Router);

  /** Bracket configuration */
  @Input() public bracket!: BracketDto;

  /** Matches in the bracket */
  @Input() public set matches(value: MatchDto[]) {
    this._matches.set(value);
  }

  private readonly _matches = signal<MatchDto[]>([]);

  /** Bracket type enum for template */
  public readonly BracketType = BracketType;

  /** Match status enum for template */
  public readonly MatchStatus = MatchStatus;

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

    for (const round of sortedRounds) {
      const roundMatches = roundMap.get(round)!;
      // Sort matches within round by match number
      roundMatches.sort((a, b) => a.matchNumber - b.matchNumber);

      rounds.push({
        round,
        roundName: this.getRoundName(round, sortedRounds.length),
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
    // Doubles match: show "F. LastName1 / F. LastName2" with abbreviated first names
    const team = participantNumber === 1 ? match.participant1Team : match.participant2Team;
    if (team) {
      const player1Initial = team.player1.firstName?.charAt(0) || '';
      const player2Initial = team.player2.firstName?.charAt(0) || '';
      return `${player1Initial}. ${team.player1.lastName} / ${player2Initial}. ${team.player2.lastName}`;
    }

    const participant = participantNumber === 1 ? match.participant1 : match.participant2;
    if (!participant) {
      return 'BYE';
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
    const participant = participantNumber === 1 ? match.participant1 : match.participant2;
    return participant?.seed ?? null;
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
