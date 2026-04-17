/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file tests/domain/entities/tournament.test.ts
 * @desc Unit tests for the Tournament entity.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Tournament} from '@domain/entities/tournament';
import {TournamentStatus} from '@domain/enumerations/tournament-status';
import {Surface} from '@domain/enumerations/surface';
import {FacilityType} from '@domain/enumerations/facility-type';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';
import {RankingSystem} from '@domain/enumerations/ranking-system';

describe('Tournament', () => {
  const baseProps = {
    id: 'tournament-1',
    name: 'Spring Open',
    startDate: new Date('2026-05-10T09:00:00.000Z'),
    endDate: new Date('2026-05-12T18:00:00.000Z'),
    location: 'La Laguna',
    surface: Surface.CLAY,
    maxParticipants: 32,
    organizerId: 'admin-1',
  };

  it('applies documented defaults in the constructor', () => {
    const tournament = new Tournament(baseProps);

    expect(tournament.description).toBe('');
    expect(tournament.facilityType).toBe(FacilityType.OUTDOOR);
    expect(tournament.status).toBe(TournamentStatus.DRAFT);
    expect(tournament.registrationFee).toBe(0);
    expect(tournament.currency).toBe('EUR');
    expect(tournament.acceptanceType).toBe(AcceptanceType.DIRECT_ACCEPTANCE);
    expect(tournament.rankingSystem).toBe(RankingSystem.POINTS_BASED);
    expect(tournament.categories).toEqual([]);
    expect(tournament.courts).toEqual([]);
    expect(tournament.config).toEqual({});
  });

  it('reports open registration only inside the configured window', () => {
    const now = new Date();
    const tournament = new Tournament({
      ...baseProps,
      status: TournamentStatus.REGISTRATION_OPEN,
      registrationOpenDate: new Date(now.getTime() - 60_000),
      registrationCloseDate: new Date(now.getTime() + 60_000),
    });

    expect(tournament.isRegistrationOpen()).toBe(true);
    expect(tournament.canAcceptRegistrations()).toBe(true);
  });

  it('rejects invalid status transitions and finalize calls', () => {
    const draftTournament = new Tournament(baseProps);

    expect(draftTournament.canTransitionTo(TournamentStatus.IN_PROGRESS)).toBe(false);
    expect(() => draftTournament.finalize()).toThrow(
      'Cannot finalize tournament in status DRAFT. Must be IN_PROGRESS.'
    );
  });

  it('allows finalization only from in-progress tournaments', () => {
    const inProgressTournament = new Tournament({
      ...baseProps,
      status: TournamentStatus.IN_PROGRESS,
    });

    expect(inProgressTournament.canTransitionTo(TournamentStatus.FINALIZED)).toBe(true);
    expect(() => inProgressTournament.finalize()).not.toThrow();
  });
});
