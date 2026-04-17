/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file backend/src/application/services/__tests__/match-generator.service.test.ts
 * @desc Unit tests for MatchGeneratorService critical bracket generation workflows.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {MatchGeneratorService} from '../match-generator.service';
import {BracketType} from '../../../domain/enumerations/bracket-type';
import {MatchStatus} from '../../../domain/enumerations/match-status';

describe('MatchGeneratorService', () => {
  let service: MatchGeneratorService;

  beforeEach(() => {
    service = new MatchGeneratorService();
  });

  it('generates single-elimination rounds with bye winners and placeholder later rounds', () => {
    const result = service.generateMatches(
      'bracket-1',
      'tournament-1',
      BracketType.SINGLE_ELIMINATION,
      ['seed-1', 'seed-2', 'seed-3'],
      2,
    );

    expect(result.phases.map((phase) => phase.name)).toEqual(['Semifinals', 'Final']);
    expect(result.matches).toHaveLength(3);

    expect(result.matches[0]).toMatchObject({
      round: 1,
      participant1Id: 'seed-1',
      participant2Id: null,
      winnerId: 'seed-1',
      status: MatchStatus.BYE,
    });
    expect(result.matches[1]).toMatchObject({
      round: 1,
      participant1Id: 'seed-2',
      participant2Id: 'seed-3',
      winnerId: null,
      status: MatchStatus.NOT_SCHEDULED,
    });
    expect(result.matches[2]).toMatchObject({
      round: 2,
      participant1Id: null,
      participant2Id: null,
      status: MatchStatus.NOT_SCHEDULED,
    });
  });

  it('generates round-robin pairings and skips BYE placeholders for odd player counts', () => {
    const result = service.generateMatches(
      'bracket-2',
      'tournament-2',
      BracketType.ROUND_ROBIN,
      ['player-1', 'player-2', 'player-3'],
      3,
    );

    expect(result.phases).toHaveLength(3);
    expect(result.phases.every((phase) => phase.name.startsWith('Round'))).toBe(true);
    expect(result.matches).toHaveLength(3);
    expect(result.matches.every((match) => match.participant1Id !== 'BYE' && match.participant2Id !== 'BYE')).toBe(true);

    const pairings = result.matches.map((match) => [match.participant1Id, match.participant2Id]);
    expect(pairings).toEqual(
      expect.arrayContaining([
        ['player-1', 'player-2'],
        ['player-1', 'player-3'],
        ['player-2', 'player-3'],
      ]),
    );
  });

  it('generates match-play pairings from consecutive participants and leaves odd participant unpaired', () => {
    const result = service.generateMatches(
      'bracket-3',
      'tournament-3',
      BracketType.MATCH_PLAY,
      ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'],
      1,
    );

    expect(result.phases).toHaveLength(1);
    expect(result.phases[0]).toMatchObject({
      name: 'Open Play',
      matchCount: 2,
    });
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0]).toMatchObject({
      participant1Id: 'player-1',
      participant2Id: 'player-2',
      status: MatchStatus.NOT_SCHEDULED,
    });
    expect(result.matches[1]).toMatchObject({
      participant1Id: 'player-3',
      participant2Id: 'player-4',
      status: MatchStatus.NOT_SCHEDULED,
    });
    expect(result.matches.flatMap((match) => [match.participant1Id, match.participant2Id])).not.toContain('player-5');
  });

  it('rejects unsupported bracket types', () => {
    expect(() => service.generateMatches(
      'bracket-4',
      'tournament-4',
      'SWISS' as BracketType,
      ['player-1', 'player-2'],
      1,
    )).toThrow('Unsupported bracket type: SWISS');
  });

  it('covers all human-readable phase names for deeper single-elimination brackets', () => {
    expect((service as any).getSingleEliminationPhaseNames(7)).toEqual([
      'Round 1',
      'Round of 64',
      'Round of 32',
      'Round of 16',
      'Quarterfinals',
      'Semifinals',
      'Final',
    ]);
  });

  it('generates even round-robin schedules without BYE placeholders', () => {
    const result = service.generateMatches(
      'bracket-5',
      'tournament-5',
      BracketType.ROUND_ROBIN,
      ['player-1', 'player-2', 'player-3', 'player-4'],
      3,
    );

    expect(result.matches).toHaveLength(6);
    expect(result.matches.every((match) => match.participant1Id !== 'BYE' && match.participant2Id !== 'BYE')).toBe(true);
  });
});