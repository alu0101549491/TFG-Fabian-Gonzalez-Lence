/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabian Gonzalez Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/scripts/verify-consolation-separation.ts
 * @desc Verifies consolation matches are separated by phaseId and reports integrity.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Bracket} from './src/domain/entities/bracket.entity';
import {Phase} from './src/domain/entities/phase.entity';
import {Match} from './src/domain/entities/match.entity';

async function verifyConsolationSeparation(tournamentId: string): Promise<void> {
  await AppDataSource.initialize();

  const bracketRepository = AppDataSource.getRepository(Bracket);
  const phaseRepository = AppDataSource.getRepository(Phase);
  const matchRepository = AppDataSource.getRepository(Match);

  const bracket = await bracketRepository.findOne({where: {tournamentId}});
  if (!bracket) {
    console.log(`No bracket found for ${tournamentId}`);
    await AppDataSource.destroy();
    process.exit(1);
  }

  const phases = await phaseRepository.find({
    where: {bracketId: bracket.id},
    order: {sequenceOrder: 'ASC'},
  });

  const consolationPhases = phases.filter((p) => p.order >= 100);
  const matches = await matchRepository.find({
    where: {bracketId: bracket.id},
    order: {round: 'ASC', matchNumber: 'ASC'},
  });

  const consolationMatches = matches.filter((m) => m.round >= 100);
  const orphanConsolation = consolationMatches.filter((m) => !m.phaseId);

  console.log('=== Consolation Separation Verification ===');
  console.log(`Tournament: ${tournamentId}`);
  console.log(`Consolation phases: ${consolationPhases.length}`);
  console.log(`Consolation matches total: ${consolationMatches.length}`);
  console.log(`Consolation matches with null phaseId: ${orphanConsolation.length}`);

  for (const phase of consolationPhases) {
    const ownedMatches = consolationMatches.filter((m) => m.phaseId === phase.id);
    const byRound = new Map<number, number>();
    for (const match of ownedMatches) {
      byRound.set(match.round, (byRound.get(match.round) || 0) + 1);
    }

    const roundsText = Array.from(byRound.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([round, count]) => `R${round}: ${count}`)
      .join(', ');

    console.log(`- ${phase.name} (${phase.id})`);
    console.log(`  phase.matchCount=${phase.matchCount}, ownedMatches=${ownedMatches.length}`);
    console.log(`  roundDistribution=${roundsText || 'none'}`);
  }

  const distinctPhaseIds = new Set(consolationMatches.map((m) => m.phaseId || 'null'));
  console.log(`Distinct phaseId values in consolation matches: ${distinctPhaseIds.size}`);

  const passed = orphanConsolation.length === 0;
  console.log(`Integrity status: ${passed ? 'PASS' : 'FAIL'}`);

  await AppDataSource.destroy();
}

const tournamentId = process.argv[2];
if (!tournamentId) {
  console.error('Usage: npx tsx scripts/verify-consolation-separation.ts <tournamentId>');
  process.exit(1);
}

verifyConsolationSeparation(tournamentId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
