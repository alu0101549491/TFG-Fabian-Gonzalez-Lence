/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/test-consolation-workflow.ts
 * @desc Complete consolation draw workflow test script.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

/**
 * Test Consolation Draw Complete Workflow
 * 
 * This script demonstrates the full consolation draw feature:
 * 1. Complete Round of 16 matches (generates 8 losers)
 * 2. Identify the 8 losers
 * 3. Create registrations for them in consolation phase
 * 4. Generate consolation bracket (8-player single elimination)
 * 
 * Prerequisites:
 * - Tournament with 16-player bracket created
 * - Consolation phase created and linked to Round of 16
 * - Run complete-next-round.ts first to complete Round of 16
 * 
 * Usage:
 * npx tsx test-consolation-workflow.ts <tournamentId> <consolationPhaseId> <categoryId>
 * 
 * Example:
 * npx tsx test-consolation-workflow.ts trn_3b7247a7 phs_xxxxx cat_2a6a3f82
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Match} from './src/domain/entities/match.entity';
import {Phase} from './src/domain/entities/phase.entity';
import {Registration} from './src/domain/entities/registration.entity';
import {MatchStatus} from './src/domain/enumerations/match-status';
import {AcceptanceType} from './src/domain/enumerations/acceptance-type';
import {RegistrationStatus} from './src/domain/enumerations/registration-status';
import {generateId} from './src/shared/utils/id-generator';

/**
 * Main workflow function.
 */
async function testConsolationWorkflow(
  tournamentId: string,
  consolationPhaseId: string,
  categoryId: string
): Promise<void> {
  await AppDataSource.initialize();

  const phaseRepository = AppDataSource.getRepository(Phase);
  const matchRepository = AppDataSource.getRepository(Match);
  const registrationRepository = AppDataSource.getRepository(Registration);

  console.log('\n🎾 Consolation Draw Workflow Test\n');
  console.log(`Tournament ID: ${tournamentId}`);
  console.log(`Consolation Phase ID: ${consolationPhaseId}`);
  console.log(`Category ID: ${categoryId}\n`);

  // Step 1: Find consolation phase and linked main phase
  console.log('📋 Step 1: Finding phases...\n');

  const consolationPhase = await phaseRepository.findOne({
    where: {id: consolationPhaseId},
  });

  if (!consolationPhase) {
    console.log('❌ Consolation phase not found');
    await AppDataSource.destroy();
    return;
  }

  console.log(`✅ Consolation Phase: ${consolationPhase.name}`);

  // Find main phase that links to this consolation
  const mainPhase = await phaseRepository.findOne({
    where: {nextPhaseId: consolationPhaseId},
  });

  if (!mainPhase) {
    console.log('❌ No main phase linked to this consolation phase');
    await AppDataSource.destroy();
    return;
  }

  console.log(`✅ Main Phase: ${mainPhase.name} (Round ${mainPhase.order})\n`);

  // Step 2: Get completed matches from main phase
  console.log('📋 Step 2: Finding completed matches from main phase...\n');

  const mainPhaseMatches = await matchRepository.find({
    where: {
      bracketId: mainPhase.bracketId,
      round: mainPhase.order,
    },
    order: {matchNumber: 'ASC'},
  });

  const completedMatches = mainPhaseMatches.filter(
    (m) => m.status === MatchStatus.COMPLETED && m.winnerId
  );

  console.log(`Total matches in Round ${mainPhase.order}: ${mainPhaseMatches.length}`);
  console.log(`Completed matches: ${completedMatches.length}\n`);

  if (completedMatches.length === 0) {
    console.log('❌ No completed matches found. Run complete-next-round.ts first.\n');
    await AppDataSource.destroy();
    return;
  }

  // Step 3: Extract losers
  console.log('📋 Step 3: Identifying losers...\n');

  const losers: Array<{participantId: string; matchNumber: number}> = [];

  for (const match of completedMatches) {
    const loser =
      match.participant1Id === match.winnerId
        ? match.participant2Id
        : match.participant1Id;

    if (loser) {
      losers.push({
        participantId: loser,
        matchNumber: match.matchNumber,
      });
      console.log(`   Match ${match.matchNumber}: ${loser.slice(-4)} (loser)`);
    }
  }

  console.log(`\nTotal losers identified: ${losers.length}\n`);

  // Step 4: Create/Update registrations for losers
  console.log('📋 Step 4: Creating consolation registrations...\n');

  for (const {participantId} of losers) {
    // Check if registration already exists
    const existing = await registrationRepository.findOne({
      where: {
        participantId,
        tournamentId,
        categoryId,
      },
    });

    if (existing) {
      // Update existing registration
      existing.acceptanceType = AcceptanceType.DIRECT_ACCEPTANCE;
      existing.status = RegistrationStatus.ACCEPTED;
      await registrationRepository.save(existing);
      console.log(`   ✅ Updated registration for ${participantId.slice(-4)}`);
    } else {
      // Create new registration (shouldn't happen, but handle it)
      const newReg = registrationRepository.create({
        id: generateId('reg'),
        tournamentId,
        categoryId,
        participantId,
        seedNumber: null,
        acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
        status: RegistrationStatus.ACCEPTED,
        registrationDate: new Date(),
      });
      await registrationRepository.save(newReg);
      console.log(`   ✅ Created new registration for ${participantId.slice(-4)}`);
    }
  }

  console.log(`\n✅ ${losers.length} registrations created/updated\n`);

  // Step 5: Generate consolation bracket matches
  console.log('📋 Step 5: Generating consolation bracket matches...\n');

  const bracketSize = losers.length;
  const rounds = Math.ceil(Math.log2(bracketSize));

  console.log(`Bracket size: ${bracketSize} players`);
  console.log(`Total rounds: ${rounds}\n`);

  // Create first round matches
  const firstRoundMatchCount = Math.pow(2, rounds - 1);
  let matchNumber = 1;
  const createdMatches: Match[] = [];

  for (let i = 0; i < firstRoundMatchCount; i++) {
    const participant1 = losers[i * 2]?.participantId || null;
    const participant2 = losers[i * 2 + 1]?.participantId || null;

    const match = matchRepository.create({
      bracketId: consolationPhase.bracketId,
      round: consolationPhase.order,
      matchNumber,
      participant1Id: participant1,
      participant2Id: participant2,
      winnerId: null,
      status: participant1 && participant2 ? MatchStatus.SCHEDULED : MatchStatus.BYE,
      score: null,
      scheduledTime: null,
      endTime: null,
    });

    match.id = generateId('mtc');
    await matchRepository.save(match);
    createdMatches.push(match);

    console.log(
      `   Match ${matchNumber}: ${participant1?.slice(-4) || 'BYE'} vs ${participant2?.slice(-4) || 'BYE'}`
    );
    matchNumber++;
  }

  // Create subsequent round placeholders
  for (let r = 2; r <= rounds; r++) {
    const roundMatchCount = Math.pow(2, rounds - r);
    for (let i = 0; i < roundMatchCount; i++) {
      const match = matchRepository.create({
        bracketId: consolationPhase.bracketId,
        round: consolationPhase.order + r - 1,
        matchNumber,
        participant1Id: null,
        participant2Id: null,
        winnerId: null,
        status: MatchStatus.NOT_SCHEDULED,
        score: null,
        scheduledTime: null,
        endTime: null,
      });

      match.id = generateId('mtc');
      await matchRepository.save(match);
      createdMatches.push(match);
      matchNumber++;
    }
  }

  console.log(`\n✅ ${createdMatches.length} matches created\n`);

  // Step 6: Update consolation phase match count
  consolationPhase.matchCount = createdMatches.length;
  await phaseRepository.save(consolationPhase);

  console.log(`✅ Consolation phase updated with matchCount: ${createdMatches.length}\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏆 CONSOLATION DRAW WORKFLOW COMPLETED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📊 Summary:`);
  console.log(`   Losers from main phase: ${losers.length}`);
  console.log(`   Consolation matches created: ${createdMatches.length}`);
  console.log(`   Bracket structure: ${bracketSize}-player single elimination`);
  console.log('\n✅ Refresh your bracket view to see the consolation draw!\n');

  await AppDataSource.destroy();
}

// Command-line execution
const tournamentId = process.argv[2];
const consolationPhaseId = process.argv[3];
const categoryId = process.argv[4];

if (!tournamentId || !consolationPhaseId || !categoryId) {
  console.error('\n❌ Error: Missing required arguments');
  console.log('\nUsage:');
  console.log('  npx tsx test-consolation-workflow.ts <tournamentId> <consolationPhaseId> <categoryId>');
  console.log('\nExample:');
  console.log('  npx tsx test-consolation-workflow.ts trn_3b7247a7 phs_xxxxx cat_2a6a3f82');
  console.log('\nPrerequisites:');
  console.log('  1. Run complete-next-round.ts first to complete Round of 16');
  console.log('  2. Create consolation phase via Phase Management UI');
  console.log('  3. Note the consolation phase ID from the response\n');
  process.exit(1);
}

testConsolationWorkflow(tournamentId, consolationPhaseId, categoryId)
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
