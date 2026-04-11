/**
 * Progressive Round Completion Script
 * 
 * Automatically generates match results for the next incomplete round in a tournament.
 * Can be run multiple times to simulate tournament progression:
 * - 1st run: Completes Round of 16
 * - 2nd run: Completes Quarterfinals
 * - 3rd run: Completes Semifinals
 * - 4th run: Completes Final
 * 
 * Usage: npx tsx complete-next-round.ts <tournamentId>
 * Example: npx tsx complete-next-round.ts trn_3b7247a7
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Match} from './src/domain/entities/match.entity';
import {Bracket} from './src/domain/entities/bracket.entity';
import {Phase} from './src/domain/entities/phase.entity';
import {MatchStatus} from './src/domain/enumerations/match-status';

/**
 * Generate realistic tennis scores.
 */
function generateTennisScore(): {set1P1: number; set1P2: number; set2P1: number; set2P2: number; set3P1?: number; set3P2?: number} {
  const scorePatterns = [
    {set1P1: 6, set1P2: 4, set2P1: 6, set2P2: 3}, // 2-0
    {set1P1: 6, set1P2: 2, set2P1: 6, set2P2: 4}, // 2-0
    {set1P1: 7, set1P2: 5, set2P1: 6, set2P2: 4}, // 2-0
    {set1P1: 6, set1P2: 4, set2P1: 6, set2P2: 2}, // 2-0
    {set1P1: 6, set1P2: 3, set2P1: 7, set2P2: 6}, // 2-0
    {set1P1: 6, set1P2: 4, set2P1: 4, set2P2: 6, set3P1: 6, set3P2: 3}, // 2-1
    {set1P1: 7, set1P2: 5, set2P1: 3, set2P2: 6, set3P1: 6, set3P2: 4}, // 2-1
    {set1P1: 4, set1P2: 6, set2P1: 6, set2P2: 3, set3P1: 7, set3P2: 5}, // 2-1
  ];

  return scorePatterns[Math.floor(Math.random() * scorePatterns.length)];
}

/**
 * Complete all matches in a specific round.
 */
async function completeRound(matches: Match[]): Promise<void> {
  const matchRepository = AppDataSource.getRepository(Match);

  for (const match of matches) {
    // Skip if already completed or is a BYE
    if (match.status === MatchStatus.COMPLETED || match.status === MatchStatus.BYE) {
      continue;
    }

    // Skip if no participants (shouldn't happen)
    if (!match.participant1Id || !match.participant2Id) {
      console.log(`   ⚠️  Skipping match ${match.matchNumber} - missing participants`);
      continue;
    }

    // Randomly determine winner (60% chance for participant1, 40% for participant2)
    const player1Wins = Math.random() < 0.6;
    const winnerId = player1Wins ? match.participant1Id : match.participant2Id;
    const scores = generateTennisScore();

    // Update match
    match.winnerId = winnerId;
    match.status = MatchStatus.COMPLETED;
    match.score = player1Wins 
      ? `${scores.set1P1}-${scores.set1P2}, ${scores.set2P1}-${scores.set2P2}${scores.set3P1 ? `, ${scores.set3P1}-${scores.set3P2}` : ''}`
      : `${scores.set1P2}-${scores.set1P1}, ${scores.set2P2}-${scores.set2P1}${scores.set3P2 ? `, ${scores.set3P2}-${scores.set3P1}` : ''}`;

    await matchRepository.save(match);

    const participant1Name = `Participant ${match.participant1Id.slice(-4)}`;
    const participant2Name = `Participant ${match.participant2Id.slice(-4)}`;
    const winnerName = player1Wins ? participant1Name : participant2Name;

    console.log(`   ✅ Match ${match.matchNumber}: ${winnerName} wins (${match.score})`);
  }
}

/**
 * Advance winners from completed round to next round.
 */
async function advanceWinnersToNextRound(currentRoundMatches: Match[], nextRoundMatches: Match[]): Promise<void> {
  const matchRepository = AppDataSource.getRepository(Match);

  // Sort both rounds by match number to ensure proper pairing
  const sortedCurrent = [...currentRoundMatches].sort((a, b) => a.matchNumber - b.matchNumber);
  const sortedNext = [...nextRoundMatches].sort((a, b) => a.matchNumber - b.matchNumber);

  // In single elimination, every 2 matches from current round feed into 1 match in next round
  for (let i = 0; i < sortedNext.length; i++) {
    const nextMatch = sortedNext[i];
    const match1 = sortedCurrent[i * 2];
    const match2 = sortedCurrent[i * 2 + 1];

    if (!match1 || !match2) continue;

    // Get winners from the two matches
    const winner1 = match1.winnerId;
    const winner2 = match2.winnerId;

    if (winner1 && winner2) {
      nextMatch.participant1Id = winner1;
      nextMatch.participant2Id = winner2;
      await matchRepository.save(nextMatch);
      console.log(`   ➡️  Advanced winners to Match ${nextMatch.matchNumber} in next round`);
    }
  }
}

/**
 * Main execution function.
 */
async function completeNextRound(tournamentId: string): Promise<void> {
  await AppDataSource.initialize();

  const bracketRepository = AppDataSource.getRepository(Bracket);
  const phaseRepository = AppDataSource.getRepository(Phase);
  const matchRepository = AppDataSource.getRepository(Match);

  console.log(`\n🎾 Progressive Round Completion for Tournament: ${tournamentId}\n`);

  // Find bracket for this tournament
  const brackets = await bracketRepository.find({
    where: {tournamentId},
  });

  if (brackets.length === 0) {
    console.log('❌ No brackets found for this tournament');
    await AppDataSource.destroy();
    return;
  }

  const bracket = brackets[0]; // Use first bracket
  console.log(`📊 Using bracket: ${bracket.name} (${bracket.bracketType})`);

  // Get all phases for this bracket, sorted by sequence
  const phases = await phaseRepository.find({
    where: {bracketId: bracket.id},
    order: {sequenceOrder: 'ASC'},
  });

  console.log(`📋 Found ${phases.length} phases in bracket`);

  // Get all matches for this bracket
  const allMatches = await matchRepository.find({
    where: {bracketId: bracket.id},
    order: {round: 'ASC', matchNumber: 'ASC'},
  });

  // Group matches by round
  const matchesByRound = new Map<number, Match[]>();
  for (const match of allMatches) {
    if (!matchesByRound.has(match.round)) {
      matchesByRound.set(match.round, []);
    }
    matchesByRound.get(match.round)!.push(match);
  }

  // Find the first round with incomplete matches
  let targetRound: number | null = null;
  let targetMatches: Match[] = [];

  for (const [round, matches] of Array.from(matchesByRound.entries()).sort((a, b) => a[0] - b[0])) {
    const incompleteMatches = matches.filter(m => 
      m.status !== MatchStatus.COMPLETED && 
      m.status !== MatchStatus.BYE &&
      m.participant1Id && 
      m.participant2Id
    );

    if (incompleteMatches.length > 0) {
      targetRound = round;
      targetMatches = matches;
      break;
    }
  }

  if (targetRound === null) {
    console.log('\n✨ All rounds are already completed!');
    console.log('Tournament is finished. 🏆\n');
    await AppDataSource.destroy();
    return;
  }

  // Find phase info for this round
  const phase = phases.find(p => p.order === targetRound);
  const phaseName = phase ? phase.name : `Round ${targetRound}`;

  console.log(`\n🎯 Target Round: ${phaseName} (Round ${targetRound})`);
  console.log(`   📍 Total matches: ${targetMatches.length}`);
  
  const incompleteCount = targetMatches.filter(m => 
    m.status !== MatchStatus.COMPLETED && 
    m.status !== MatchStatus.BYE
  ).length;
  console.log(`   ⏳ Incomplete matches: ${incompleteCount}\n`);

  // Complete all matches in this round
  console.log('🔄 Completing matches...\n');
  await completeRound(targetMatches);

  // Advance winners to next round (if exists)
  const nextRound = targetRound + 1;
  if (matchesByRound.has(nextRound)) {
    console.log(`\n⏭️  Advancing winners to Round ${nextRound}...\n`);
    const nextRoundMatches = matchesByRound.get(nextRound)!;
    await advanceWinnersToNextRound(targetMatches, nextRoundMatches);
  }

  // Summary
  console.log(`\n✅ Completed ${phaseName}!`);
  
  const nextIncompleteRound = Array.from(matchesByRound.entries())
    .sort((a, b) => a[0] - b[0])
    .find(([round, matches]) => {
      const incomplete = matches.filter(m => 
        m.status !== MatchStatus.COMPLETED && 
        m.status !== MatchStatus.BYE &&
        m.participant1Id && 
        m.participant2Id
      );
      return incomplete.length > 0;
    });

  if (nextIncompleteRound) {
    const [nextRound, nextMatches] = nextIncompleteRound;
    const nextPhase = phases.find(p => p.order === nextRound);
    const nextPhaseName = nextPhase ? nextPhase.name : `Round ${nextRound}`;
    console.log(`\n📌 Next incomplete round: ${nextPhaseName}`);
    console.log(`   Run this script again to complete it!\n`);
  } else {
    console.log('\n🏆 Tournament is now complete!\n');
  }

  await AppDataSource.destroy();
}

// Command-line execution
const tournamentId = process.argv[2];

if (!tournamentId) {
  console.error('\n❌ Error: Tournament ID is required');
  console.log('\nUsage: npx tsx complete-next-round.ts <tournamentId>');
  console.log('Example: npx tsx complete-next-round.ts trn_3b7247a7\n');
  process.exit(1);
}

completeNextRound(tournamentId)
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
