/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file tests/application/services/match.service.test.ts
 * @desc Unit tests for the MatchService result-recording authorization flow.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

jest.mock('@infrastructure/repositories/match.repository', () => ({
  MatchRepositoryImpl: class {},
}));

jest.mock('@infrastructure/repositories/score.repository', () => ({
  ScoreRepositoryImpl: class {},
}));

jest.mock('@infrastructure/repositories/user.repository', () => ({
  UserRepositoryImpl: class {},
}));

jest.mock('@application/services/standing.service', () => ({
  StandingService: class {},
}));

jest.mock('@application/services/notification.service', () => ({
  NotificationService: class {},
}));

import {inject} from '@angular/core';
import {MatchService} from '@application/services/match.service';
import {Match} from '@domain/entities/match';
import {MatchStatus} from '@domain/enumerations/match-status';
import {UserRole} from '@domain/enumerations/user-role';

describe('MatchService', () => {
  let service: MatchService;
  let matchRepository: {
    findById: jest.Mock;
    update: jest.Mock;
  };
  let scoreRepository: {
    saveMatchScores: jest.Mock;
  };
  let standingService: {
    updateStandings: jest.Mock;
  };
  let userRepository: {
    findById: jest.Mock;
  };

  beforeEach(() => {
    matchRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    scoreRepository = {
      saveMatchScores: jest.fn(),
    };
    standingService = {
      updateStandings: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
    };

    (inject as jest.Mock)
      .mockReturnValueOnce(matchRepository)
      .mockReturnValueOnce(scoreRepository)
      .mockReturnValueOnce(standingService)
      .mockReturnValueOnce({})
      .mockReturnValueOnce(userRepository);

    service = new MatchService();
  });

  afterEach(() => {
    (inject as jest.Mock).mockReset();
  });

  it('allows tournament administrators to record scores', async () => {
    const match = new Match({
      id: 'match-1',
      bracketId: 'bracket-1',
      phaseId: 'phase-1',
      player1Id: 'player-1',
      player2Id: 'player-2',
      status: MatchStatus.SCHEDULED,
    });

    matchRepository.findById.mockResolvedValue(match);
    matchRepository.update.mockImplementation(async (updatedMatch: Match) => updatedMatch);
    scoreRepository.saveMatchScores.mockResolvedValue(undefined);
    standingService.updateStandings.mockResolvedValue(undefined);
    userRepository.findById.mockResolvedValue({
      id: 'admin-1',
      role: UserRole.TOURNAMENT_ADMIN,
    });

    const result = await service.recordResult({
      matchId: 'match-1',
      winnerId: 'player-1',
      sets: [
        {
          setNumber: 1,
          player1Games: 6,
          player2Games: 4,
          tiebreakParticipant1: null,
          tiebreakParticipant2: null,
        },
      ],
    }, 'admin-1');

    expect(scoreRepository.saveMatchScores).toHaveBeenCalledWith('match-1', 'player-1', expect.any(Array));
    expect(result.status).toBe(MatchStatus.COMPLETED);
  });

  it('allows match participants to record their own match scores', async () => {
    const match = new Match({
      id: 'match-2',
      bracketId: 'bracket-1',
      phaseId: 'phase-1',
      player1Id: 'player-1',
      player2Id: 'player-2',
      status: MatchStatus.IN_PROGRESS,
    });

    matchRepository.findById.mockResolvedValue(match);
    matchRepository.update.mockImplementation(async (updatedMatch: Match) => updatedMatch);
    scoreRepository.saveMatchScores.mockResolvedValue(undefined);
    standingService.updateStandings.mockResolvedValue(undefined);
    userRepository.findById.mockResolvedValue({
      id: 'player-1',
      role: UserRole.PLAYER,
    });

    await service.recordResult({
      matchId: 'match-2',
      winnerId: 'player-1',
      sets: [
        {
          setNumber: 1,
          player1Games: 6,
          player2Games: 2,
          tiebreakParticipant1: null,
          tiebreakParticipant2: null,
        },
      ],
    }, 'player-1');

    expect(scoreRepository.saveMatchScores).toHaveBeenCalledTimes(1);
  });

  it('rejects unrelated users who try to record another match result', async () => {
    const match = new Match({
      id: 'match-3',
      bracketId: 'bracket-1',
      phaseId: 'phase-1',
      player1Id: 'player-1',
      player2Id: 'player-2',
      status: MatchStatus.SCHEDULED,
    });

    matchRepository.findById.mockResolvedValue(match);
    userRepository.findById.mockResolvedValue({
      id: 'spectator-1',
      role: UserRole.PLAYER,
    });

    await expect(service.recordResult({
      matchId: 'match-3',
      winnerId: 'player-1',
      sets: [
        {
          setNumber: 1,
          player1Games: 6,
          player2Games: 3,
          tiebreakParticipant1: null,
          tiebreakParticipant2: null,
        },
      ],
    }, 'spectator-1')).rejects.toThrow('Only match participants or tournament administrators can record results');

    expect(scoreRepository.saveMatchScores).not.toHaveBeenCalled();
    expect(matchRepository.update).not.toHaveBeenCalled();
  });
});
