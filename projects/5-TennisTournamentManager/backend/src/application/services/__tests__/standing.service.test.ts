/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file backend/src/application/services/__tests__/standing.service.test.ts
 * @desc Unit tests for StandingService standings recalculation workflows.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

jest.mock('../../../infrastructure/database/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

import {AppDataSource} from '../../../infrastructure/database/data-source';
import {StandingService} from '../standing.service';
import {Match} from '../../../domain/entities/match.entity';
import {Standing} from '../../../domain/entities/standing.entity';
import {Bracket} from '../../../domain/entities/bracket.entity';
import {Registration} from '../../../domain/entities/registration.entity';
import {DoublesTeam} from '../../../domain/entities/doubles-team.entity';
import {MatchStatus} from '../../../domain/enumerations/match-status';
import {BracketType} from '../../../domain/enumerations/bracket-type';

describe('StandingService', () => {
  let service: StandingService;
  let matchRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
  };
  let standingRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let bracketRepository: {
    findOne: jest.Mock;
  };
  let registrationRepository: {
    find: jest.Mock;
  };
  let doublesTeamRepository: {
    find: jest.Mock;
  };

  beforeEach(() => {
    matchRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    standingRepository = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => data),
    };
    bracketRepository = {
      findOne: jest.fn(),
    };
    registrationRepository = {
      find: jest.fn(),
    };
    doublesTeamRepository = {
      find: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock)
      .mockReturnValueOnce(matchRepository)
      .mockReturnValueOnce(standingRepository)
      .mockReturnValueOnce(bracketRepository)
      .mockReturnValueOnce(registrationRepository)
      .mockReturnValueOnce(doublesTeamRepository);

    service = new StandingService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('recalculates singles standings from completed matches and ranks by points', async () => {
    const bracket = {
      id: 'bracket-singles',
      tournamentId: 'tournament-1',
      categoryId: 'category-1',
      bracketType: BracketType.ROUND_ROBIN,
    } as Bracket;

    bracketRepository.findOne.mockResolvedValue(bracket);
    matchRepository.find.mockResolvedValue([
      {
        id: 'match-1',
        bracketId: bracket.id,
        participant1Id: 'player-1',
        participant2Id: 'player-2',
        winnerId: 'player-1',
        status: MatchStatus.COMPLETED,
        scores: [
          {player1Games: 6, player2Games: 4},
          {player1Games: 6, player2Games: 3},
        ],
      },
      {
        id: 'match-2',
        bracketId: bracket.id,
        participant1Id: 'player-1',
        participant2Id: 'player-3',
        winnerId: 'player-1',
        status: MatchStatus.COMPLETED,
        scores: [
          {player1Games: 6, player2Games: 1},
          {player1Games: 6, player2Games: 2},
        ],
      },
      {
        id: 'match-3',
        bracketId: bracket.id,
        participant1Id: 'player-2',
        participant2Id: 'player-3',
        winnerId: 'player-2',
        status: MatchStatus.COMPLETED,
        scores: [
          {player1Games: 6, player2Games: 4},
          {player1Games: 6, player2Games: 4},
        ],
      },
    ] as Match[]);
    registrationRepository.find.mockResolvedValue([
      {participantId: 'player-1', seedNumber: 1},
      {participantId: 'player-2', seedNumber: 2},
      {participantId: 'player-3', seedNumber: 3},
    ] as Registration[]);
    standingRepository.findOne.mockResolvedValue(null);

    await service.recalculateForBracket(bracket.id);

    expect(standingRepository.create).toHaveBeenCalledTimes(3);
    expect(standingRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      participantId: 'player-1',
      wins: 2,
      losses: 0,
      points: 6,
      rank: 1,
    }));
    expect(standingRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      participantId: 'player-2',
      wins: 1,
      losses: 1,
      points: 3,
      rank: 2,
    }));
  });

  it('updates existing doubles standings when team matches are completed', async () => {
    const bracket = {
      id: 'bracket-doubles',
      tournamentId: 'tournament-2',
      categoryId: 'category-2',
      bracketType: BracketType.ROUND_ROBIN,
    } as Bracket;
    const existingStanding = {
      teamId: 'team-1',
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      points: 0,
      rank: 0,
    } as Standing;

    bracketRepository.findOne.mockResolvedValue(bracket);
    matchRepository.find.mockResolvedValue([
      {
        id: 'match-d-1',
        bracketId: bracket.id,
        participant1TeamId: 'team-1',
        participant2TeamId: 'team-2',
        winnerTeamId: 'team-1',
        status: MatchStatus.COMPLETED,
        scores: [
          {player1Games: 6, player2Games: 3},
          {player1Games: 6, player2Games: 4},
        ],
      },
    ] as Match[]);
    doublesTeamRepository.find.mockResolvedValue([
      {id: 'team-1', seedNumber: 1},
      {id: 'team-2', seedNumber: 2},
    ] as DoublesTeam[]);
    standingRepository.findOne
      .mockResolvedValueOnce(existingStanding)
      .mockResolvedValueOnce(null);

    await service.recalculateForBracket(bracket.id);

    expect(existingStanding).toMatchObject({
      matchesPlayed: 1,
      wins: 1,
      losses: 0,
      points: 3,
      rank: 1,
    });
    expect(standingRepository.save).toHaveBeenCalledWith(existingStanding);
    expect(standingRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      teamId: 'team-2',
      participantId: null,
      losses: 1,
      rank: 2,
    }));
  });

  it('updates existing singles standings when a participant already has a row', async () => {
    const bracket = {
      id: 'bracket-update',
      tournamentId: 'tournament-3',
      categoryId: 'category-3',
      bracketType: BracketType.ROUND_ROBIN,
    } as Bracket;
    const existingStanding = {
      participantId: 'player-a',
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      points: 0,
      rank: 0,
    } as Standing;

    bracketRepository.findOne.mockResolvedValue(bracket);
    matchRepository.find.mockResolvedValue([
      {
        id: 'match-update',
        bracketId: bracket.id,
        participant1Id: 'player-a',
        participant2Id: 'player-b',
        winnerId: 'player-a',
        status: MatchStatus.COMPLETED,
        scores: [{player1Games: 6, player2Games: 0}],
      },
    ] as Match[]);
    registrationRepository.find.mockResolvedValue([
      {participantId: 'player-a', seedNumber: 1},
      {participantId: 'player-b', seedNumber: 2},
    ] as Registration[]);
    standingRepository.findOne
      .mockResolvedValueOnce(existingStanding)
      .mockResolvedValueOnce(null);

    await service.recalculateForBracket(bracket.id);

    expect(existingStanding).toMatchObject({
      matchesPlayed: 1,
      wins: 1,
      losses: 0,
      points: 3,
      rank: 1,
    });
    expect(standingRepository.save).toHaveBeenCalledWith(existingStanding);
  });

  it('warns and exits when the bracket does not exist', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    bracketRepository.findOne.mockResolvedValue(null);

    await service.recalculateForBracket('missing-bracket');

    expect(warnSpy).toHaveBeenCalledWith('[StandingService] Bracket missing-bracket not found');
    expect(matchRepository.find).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('looks up the bracket from a match and delegates tournament recalculation', async () => {
    const recalculateSpy = jest.spyOn(service, 'recalculateForBracket').mockResolvedValue(undefined);
    matchRepository.findOne.mockResolvedValue({id: 'match-bracket', bracketId: 'delegated-bracket'});

    await service.recalculateForMatch('match-bracket');

    expect(recalculateSpy).toHaveBeenCalledWith('delegated-bracket');
  });

  it('stops recalculation for missing match brackets', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    matchRepository.findOne.mockResolvedValue(null);

    await service.recalculateForMatch('missing-match');

    expect(warnSpy).toHaveBeenCalledWith('[StandingService] Match missing-match not found or has no bracket');
    expect(bracketRepository.findOne).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});