/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file tests/application/services/statistics.service.test.ts
 * @desc Unit tests for the StatisticsService.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {inject} from '@angular/core';
import {StatisticsService} from '@application/services/statistics.service';
import {MatchStatus} from '@domain/enumerations/match-status';
import {BracketRepositoryImpl} from '@infrastructure/repositories/bracket.repository';
import {CategoryRepositoryImpl} from '@infrastructure/repositories/category.repository';
import {MatchRepositoryImpl} from '@infrastructure/repositories/match.repository';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';
import {StatisticsRepositoryImpl} from '@infrastructure/repositories/statistics.repository';
import {TournamentRepositoryImpl} from '@infrastructure/repositories/tournament.repository';
import {UserService} from '../../mocks/user.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let mockStatisticsRepository: Record<string, jest.Mock>;
  let mockMatchRepository: Record<string, jest.Mock>;
  let mockRegistrationRepository: Record<string, jest.Mock>;
  let mockTournamentRepository: Record<string, jest.Mock>;
  let mockBracketRepository: Record<string, jest.Mock>;
  let mockCategoryRepository: Record<string, jest.Mock>;
  let mockUserService: Record<string, jest.Mock>;

  beforeEach(() => {
    mockStatisticsRepository = {};
    mockMatchRepository = {
      findByParticipantId: jest.fn(),
      findAll: jest.fn(),
      findByBracket: jest.fn(),
    };
    mockRegistrationRepository = {
      findByTournament: jest.fn(),
    };
    mockTournamentRepository = {
      findById: jest.fn(),
    };
    mockBracketRepository = {
      findById: jest.fn(),
      findByTournament: jest.fn(),
    };
    mockCategoryRepository = {
      findByTournamentId: jest.fn(),
    };
    mockUserService = {
      getPublicUserInfo: jest.fn(),
      getUserById: jest.fn(),
    };

    (inject as jest.Mock).mockImplementation((token: unknown) => {
      switch (token) {
      case StatisticsRepositoryImpl:
        return mockStatisticsRepository;
      case MatchRepositoryImpl:
        return mockMatchRepository;
      case RegistrationRepositoryImpl:
        return mockRegistrationRepository;
      case TournamentRepositoryImpl:
        return mockTournamentRepository;
      case BracketRepositoryImpl:
        return mockBracketRepository;
      case CategoryRepositoryImpl:
        return mockCategoryRepository;
      case UserService:
        return mockUserService;
      default:
        return undefined;
      }
    });

    service = new StatisticsService();
  });

  it('builds doubles team matchup history with correct team names and results', async () => {
    const olderMatchDate = new Date('2026-04-10T10:00:00.000Z');
    const newerMatchDate = new Date('2026-04-12T10:00:00.000Z');

    mockMatchRepository.findByParticipantId.mockResolvedValue([
      {
        id: 'match-1',
        player1Id: null,
        player2Id: null,
        winnerId: null,
        participant1TeamId: 'team-alpha',
        participant2TeamId: 'team-beta',
        winnerTeamId: 'team-alpha',
        participant1Team: {
          player1: {id: 'player-1', firstName: 'Alice', lastName: 'Ace'},
          player2: {id: 'player-2', firstName: 'Bea', lastName: 'Backhand'},
        },
        participant2Team: {
          player1: {id: 'player-3', firstName: 'Cara', lastName: 'Cross'},
          player2: {id: 'player-4', firstName: 'Dana', lastName: 'Drop'},
        },
        status: MatchStatus.COMPLETED,
        completedAt: olderMatchDate,
        updatedAt: olderMatchDate,
        score: '6-4, 6-3',
      },
      {
        id: 'match-2',
        player1Id: null,
        player2Id: null,
        winnerId: null,
        participant1TeamId: 'team-beta',
        participant2TeamId: 'team-alpha',
        winnerTeamId: 'team-beta',
        participant1Team: {
          player1: {id: 'player-3', firstName: 'Cara', lastName: 'Cross'},
          player2: {id: 'player-4', firstName: 'Dana', lastName: 'Drop'},
        },
        participant2Team: {
          player1: {id: 'player-1', firstName: 'Alice', lastName: 'Ace'},
          player2: {id: 'player-2', firstName: 'Bea', lastName: 'Backhand'},
        },
        status: MatchStatus.COMPLETED,
        completedAt: newerMatchDate,
        updatedAt: newerMatchDate,
        score: '4-6, 7-5, 10-8',
      },
    ]);

    const statistics = await service.getParticipantStatistics('player-1');

    expect(statistics.doublesTeamMatchups).toEqual([
      {
        opponentTeamId: 'team-beta',
        opponentTeamName: 'Cara Cross / Dana Drop',
        totalMatches: 2,
        wins: 1,
        losses: 1,
        winPercentage: 50,
        lastMatch: newerMatchDate,
      },
    ]);
  });

  it('returns doubles team head-to-head history with sorted matches and resolved tournament names', async () => {
    const newerDate = new Date('2026-04-13T09:00:00.000Z');
    const olderDate = new Date('2026-04-11T09:00:00.000Z');

    mockMatchRepository.findAll.mockResolvedValue([
      {
        id: 'match-newer',
        bracketId: 'bracket-2',
        participant1TeamId: 'team-alpha',
        participant2TeamId: 'team-beta',
        winnerTeamId: 'team-alpha',
        participant1Team: {
          player1: {id: 'player-1', firstName: 'Alice', lastName: 'Ace'},
          player2: {id: 'player-2', firstName: 'Bea', lastName: 'Backhand'},
        },
        participant2Team: {
          player1: {id: 'player-3', firstName: 'Cara', lastName: 'Cross'},
          player2: {id: 'player-4', firstName: 'Dana', lastName: 'Drop'},
        },
        status: MatchStatus.COMPLETED,
        score: '6-2, 6-4',
        createdAt: newerDate,
        updatedAt: newerDate,
        completedAt: newerDate,
      },
      {
        id: 'match-older',
        bracketId: 'bracket-1',
        participant1TeamId: 'team-beta',
        participant2TeamId: 'team-alpha',
        winnerTeamId: 'team-beta',
        participant1Team: {
          player1: {id: 'player-3', firstName: 'Cara', lastName: 'Cross'},
          player2: {id: 'player-4', firstName: 'Dana', lastName: 'Drop'},
        },
        participant2Team: {
          player1: {id: 'player-1', firstName: 'Alice', lastName: 'Ace'},
          player2: {id: 'player-2', firstName: 'Bea', lastName: 'Backhand'},
        },
        status: MatchStatus.COMPLETED,
        score: '7-6, 3-6, 10-7',
        createdAt: olderDate,
        updatedAt: olderDate,
        completedAt: olderDate,
      },
      {
        id: 'singles-ignored',
        bracketId: 'bracket-3',
        player1Id: 'player-1',
        player2Id: 'player-3',
        winnerId: 'player-1',
        status: MatchStatus.COMPLETED,
        score: '6-0, 6-0',
        createdAt: olderDate,
        updatedAt: olderDate,
        completedAt: olderDate,
      },
    ]);

    mockBracketRepository.findById.mockImplementation(async (bracketId: string) => ({
      'bracket-1': {id: 'bracket-1', tournamentId: 'tournament-1'},
      'bracket-2': {id: 'bracket-2', tournamentId: 'tournament-2'},
    }[bracketId] ?? null));

    mockTournamentRepository.findById.mockImplementation(async (tournamentId: string) => ({
      'tournament-1': {id: 'tournament-1', name: 'Spring Doubles Classic', surface: 'CLAY'},
      'tournament-2': {id: 'tournament-2', name: 'Autumn Doubles Masters', surface: 'HARD'},
    }[tournamentId] ?? null));

    const teamHeadToHead = await service.getTeamHeadToHead('player-1', 'team-beta') as {
      participantTeamId: string;
      participantTeamName: string;
      opponentTeamId: string;
      opponentTeamName: string;
      totalMatches: number;
      participantTeamWins: number;
      opponentTeamWins: number;
      participantTeamSetsWon: number;
      opponentTeamSetsWon: number;
      lastMatch?: Date;
      matchHistory: Array<{
        matchId: string;
        tournamentName: string;
        surface?: string;
        score: string;
        winnerTeamId: string;
        date: Date;
      }>;
    };

    expect(teamHeadToHead.participantTeamId).toBe('team-alpha');
    expect(teamHeadToHead.participantTeamName).toBe('Alice Ace / Bea Backhand');
    expect(teamHeadToHead.opponentTeamId).toBe('team-beta');
    expect(teamHeadToHead.opponentTeamName).toBe('Cara Cross / Dana Drop');
    expect(teamHeadToHead.totalMatches).toBe(2);
    expect(teamHeadToHead.participantTeamWins).toBe(1);
    expect(teamHeadToHead.opponentTeamWins).toBe(1);
    expect(teamHeadToHead.participantTeamSetsWon).toBe(3);
    expect(teamHeadToHead.opponentTeamSetsWon).toBe(2);
    expect(teamHeadToHead.lastMatch).toEqual(newerDate);
    expect(teamHeadToHead.matchHistory).toEqual([
      {
        matchId: 'match-newer',
        tournamentName: 'Autumn Doubles Masters',
        surface: 'HARD',
        score: '6-2, 6-4',
        winnerTeamId: 'team-alpha',
        date: newerDate,
      },
      {
        matchId: 'match-older',
        tournamentName: 'Spring Doubles Classic',
        surface: 'CLAY',
        score: '7-6, 3-6, 10-7',
        winnerTeamId: 'team-beta',
        date: olderDate,
      },
    ]);
  });
});
