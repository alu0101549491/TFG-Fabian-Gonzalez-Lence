/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabian Gonzalez Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/repair-consolation-matches.ts
 * @desc Rebuilds consolation brackets for a tournament with proper phaseId ownership.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {MoreThanOrEqual} from 'typeorm';
import {AppDataSource} from './src/infrastructure/database/data-source';
import {Bracket} from './src/domain/entities/bracket.entity';
import {Phase} from './src/domain/entities/phase.entity';
import {Match} from './src/domain/entities/match.entity';
import {MatchStatus} from './src/domain/enumerations/match-status';
import {generateId} from './src/shared/utils/id-generator';

/**
 * Rebuild consolation matches for all consolation phases in a tournament.
 *
 * @param tournamentId - Tournament identifier
 */
async function rebuildConsolationMatches(tournamentId: string): Promise<void> {
  await AppDataSource.initialize();

  const bracketRepository = AppDataSource.getRepository(Bracket);
  const phaseRepository = AppDataSource.getRepository(Phase);
  const matchRepository = AppDataSource.getRepository(Match);

  const bracket = await bracketRepository.findOne({where: {tournamentId}});
  if (!bracket) {
    console.error(`No bracket found for tournament ${tournamentId}`);
    await AppDataSource.destroy();
    process.exit(1);
  }

  const phases = await phaseRepository.find({
    where: {bracketId: bracket.id},
    order: {sequenceOrder: 'ASC'},
  });

  const consolationPhases = phases.filter((p) => p.order >= 100);
  if (consolationPhases.length === 0) {
    console.log('No consolation phases found.');
    await AppDataSource.destroy();
    return;
  }

  // Remove old consolation matches (legacy mixed state and previously generated data).
  const existingConsolationMatches = await matchRepository.find({
    where: {bracketId: bracket.id, round: MoreThanOrEqual(100)},
  });

  if (existingConsolationMatches.length > 0) {
    await matchRepository.remove(existingConsolationMatches);
  }

  console.log(`Removed ${existingConsolationMatches.length} existing consolation matches.`);

  for (const consolationPhase of consolationPhases) {
    const sourcePhase = await phaseRepository.findOne({where: {nextPhaseId: consolationPhase.id}});

    if (!sourcePhase) {
      consolationPhase.matchCount = 0;
      await phaseRepository.save(consolationPhase);
      console.log(`Skipped ${consolationPhase.name}: no source phase link.`);
      continue;
    }

    const sourceMatches = await matchRepository.find({
      where: {
        bracketId: bracket.id,
        round: sourcePhase.order,
      },
      order: {matchNumber: 'ASC'},
    });

    const completed = sourceMatches.filter((m) => m.status === MatchStatus.COMPLETED && !!m.winnerId);
    if (completed.length === 0) {
      consolationPhase.matchCount = 0;
      await phaseRepository.save(consolationPhase);
      console.log(`Skipped ${consolationPhase.name}: source phase has no completed matches.`);
      continue;
    }

    const losers: string[] = [];
    for (const match of completed) {
      const loser = match.participant1Id === match.winnerId ? match.participant2Id : match.participant1Id;
      if (loser) {
        losers.push(loser);
      }
    }

    if (losers.length < 2) {
      consolationPhase.matchCount = 0;
      await phaseRepository.save(consolationPhase);
      console.log(`Skipped ${consolationPhase.name}: not enough losers (${losers.length}).`);
      continue;
    }

    const rounds = Math.ceil(Math.log2(losers.length));
    const created: Match[] = [];
    let matchNumber = 1;

    // First round with players.
    const firstRoundCount = Math.pow(2, rounds - 1);
    for (let i = 0; i < firstRoundCount; i++) {
      const participant1 = losers[i * 2] || null;
      const participant2 = losers[i * 2 + 1] || null;

      const match = matchRepository.create({
        bracketId: bracket.id,
        phaseId: consolationPhase.id,
        round: consolationPhase.order,
        matchNumber,
        participant1Id: participant1,
        participant2Id: participant2,
        winnerId: null,
        status: participant1 && participant2 ? MatchStatus.SCHEDULED : MatchStatus.BYE,
        score: null,
        scheduledTime: null,
        startTime: null,
        endTime: null,
      });
      match.id = generateId('mtc');
      await matchRepository.save(match);
      created.push(match);
      matchNumber++;
    }

    // Remaining rounds placeholders.
    for (let r = 2; r <= rounds; r++) {
      const roundCount = Math.pow(2, rounds - r);
      for (let i = 0; i < roundCount; i++) {
        const match = matchRepository.create({
          bracketId: bracket.id,
          phaseId: consolationPhase.id,
          round: consolationPhase.order + r - 1,
          matchNumber,
          participant1Id: null,
          participant2Id: null,
          winnerId: null,
          status: MatchStatus.NOT_SCHEDULED,
          score: null,
          scheduledTime: null,
          startTime: null,
          endTime: null,
        });
        match.id = generateId('mtc');
        await matchRepository.save(match);
        created.push(match);
        matchNumber++;
      }
    }

    consolationPhase.matchCount = created.length;
    await phaseRepository.save(consolationPhase);

    console.log(`Rebuilt ${consolationPhase.name}: ${created.length} matches from ${losers.length} losers.`);
  }

  console.log('Consolation rebuild completed.');
  await AppDataSource.destroy();
}

const tournamentId = process.argv[2];

if (!tournamentId) {
  console.error('Usage: npx tsx repair-consolation-matches.ts <tournamentId>');
  process.exit(1);
}

rebuildConsolationMatches(tournamentId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Repair failed:', error);
    process.exit(1);
  });
