/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file tests/application/services/ranking.service.test.ts
 * @desc Unit tests for the RankingService.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

jest.mock('@infrastructure/repositories/global-ranking.repository', () => ({
  GlobalRankingRepositoryImpl: class {},
}));

jest.mock('@infrastructure/repositories/registration.repository', () => ({
  RegistrationRepositoryImpl: class {},
}));

jest.mock('@infrastructure/repositories/standing.repository', () => ({
  StandingRepositoryImpl: class {},
}));

jest.mock('@infrastructure/http/axios-client', () => ({
  AxiosClient: class {},
}));

import {RankingService} from '@application/services/ranking.service';
import {RankingSystem} from '@domain/enumerations/ranking-system';
import {inject} from '@angular/core';

describe('RankingService', () => {
  let service: RankingService;
  let httpClient: {
    get: jest.Mock;
  };

  beforeEach(() => {
    httpClient = {
      get: jest.fn(),
    };

    (inject as jest.Mock)
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce(httpClient);

    service = new RankingService();
  });

  afterEach(() => {
    (inject as jest.Mock).mockReset();
  });

  it('returns backend ELO rankings ordered by rank', async () => {
    httpClient.get.mockResolvedValue([
      {
        id: 'ranking-2',
        playerId: 'player-2',
        playerName: 'Bob Backhand',
        rank: 2,
        points: 1480,
        tournamentsPlayed: 4,
        wins: 6,
        losses: 2,
      },
      {
        id: 'ranking-1',
        playerId: 'player-1',
        playerName: 'Alice Ace',
        rank: 1,
        points: 1525,
        tournamentsPlayed: 5,
        wins: 5,
        losses: 1,
      },
    ]);

    const rankings = await service.getRankingsBySystem(RankingSystem.ELO);

    expect(rankings.map((ranking) => ranking.participantName)).toEqual(['Alice Ace', 'Bob Backhand']);
    expect(rankings[0]).toMatchObject({
      position: 1,
      totalPoints: 1525,
      rankingSystem: RankingSystem.ELO,
      eloRating: 1525,
    });
  });

  it('derives a points-based table instead of reusing the ELO order', async () => {
    httpClient.get.mockResolvedValue([
      {
        id: 'ranking-1',
        playerId: 'player-1',
        playerName: 'Alice Ace',
        rank: 1,
        points: 1600,
        tournamentsPlayed: 4,
        wins: 1,
        losses: 0,
      },
      {
        id: 'ranking-2',
        playerId: 'player-2',
        playerName: 'Bob Backhand',
        rank: 2,
        points: 1450,
        tournamentsPlayed: 6,
        wins: 4,
        losses: 2,
      },
    ]);

    const rankings = await service.getRankingsBySystem(RankingSystem.POINTS_BASED);

    expect(rankings.map((ranking) => ranking.participantName)).toEqual(['Bob Backhand', 'Alice Ace']);
    expect(rankings[0]).toMatchObject({
      rankingSystem: RankingSystem.POINTS_BASED,
      totalPoints: 18,
      eloRating: null,
      position: 1,
    });
    expect(rankings[0].positionChange).toBe(1);
  });

  it('derives a ratio-based table from win percentage', async () => {
    httpClient.get.mockResolvedValue([
      {
        id: 'ranking-1',
        playerId: 'player-1',
        playerName: 'Alice Ace',
        rank: 1,
        points: 1550,
        tournamentsPlayed: 5,
        wins: 4,
        losses: 1,
      },
      {
        id: 'ranking-2',
        playerId: 'player-2',
        playerName: 'Cara Crosscourt',
        rank: 2,
        points: 1480,
        tournamentsPlayed: 3,
        wins: 2,
        losses: 0,
      },
    ]);

    const rankings = await service.getRankingsBySystem(RankingSystem.RATIO_BASED);

    expect(rankings.map((ranking) => ranking.participantName)).toEqual(['Cara Crosscourt', 'Alice Ace']);
    expect(rankings[0]).toMatchObject({
      rankingSystem: RankingSystem.RATIO_BASED,
      totalPoints: 100,
      eloRating: null,
      position: 1,
    });
    expect(rankings[0].positionChange).toBe(1);
  });
});
