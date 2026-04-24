/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 24, 2026
 * @file backend/scripts/debug-qualifying-bracket.ts
 * @desc Debug and manually regenerate qualifying bracket
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import 'reflect-metadata';
import {AppDataSource} from '../src/infrastructure/database/data-source';
import {Bracket} from '../src/domain/entities/bracket.entity';
import {Match} from '../src/domain/entities/match.entity';
import {Phase} from '../src/domain/entities/phase.entity';
import {Score} from '../src/domain/entities/score.entity';
import {Registration} from '../src/domain/entities/registration.entity';
import {In, Not} from 'typeorm';
import {RegistrationStatus} from '../src/domain/enumerations/registration-status';
import {AcceptanceType} from '../src/domain/enumerations/acceptance-type';
import {MatchGeneratorService} from '../src/application/services/match-generator.service';
import {SeedingService} from '../src/application/services/seeding.service';

const BRACKET_ID = 'brk_bf22bdea'; // Updated bracket ID

async function debugAndRegenerateQualifyingBracket() {
  console.log('🔧 Initializing database connection...');
  await AppDataSource.initialize();
  console.log('✅ Database connected\n');

  const bracketRepo = AppDataSource.getRepository(Bracket);
  const matchRepo = AppDataSource.getRepository(Match);
  const phaseRepo = AppDataSource.getRepository(Phase);
  const scoreRepo = AppDataSource.getRepository(Score);
  const registrationRepo = AppDataSource.getRepository(Registration);

  try {
    // 1. Load bracket
    const bracket = await bracketRepo.findOne({where: {id: BRACKET_ID}});
    if (!bracket) {
      console.error('❌ Bracket not found!');
      process.exit(1);
    }

    console.log('📋 Current Bracket Status:');
    console.log(`  ID: ${bracket.id}`);
    console.log(`  Category: ${bracket.categoryId}`);
    console.log(`  Total Rounds: ${bracket.totalRounds}`);
    console.log(`  Bracket Type: ${bracket.bracketType}`);
    console.log(`  Is Published: ${bracket.isPublished}\n`);

    // 2. Check registrations
    const registrations = await registrationRepo.find({
      where: {
        categoryId: bracket.categoryId,
        status: RegistrationStatus.ACCEPTED,
        acceptanceType: Not(In([AcceptanceType.ALTERNATE, AcceptanceType.WITHDRAWN])),
      },
      relations: ['participant'],
    });

    console.log(`👥 Found ${registrations.length} ACCEPTED registrations`);
    console.log(`  Seeds assigned: ${registrations.filter(r => r.seedNumber != null).length}\n`);

    // 3. Check existing matches
    const existingMatches = await matchRepo.find({where: {bracketId: BRACKET_ID}});
    const existingPhases = await phaseRepo.find({where: {bracketId: BRACKET_ID}});

    console.log(`🎯 Existing Structure:`);
    console.log(`  Matches: ${existingMatches.length}`);
    console.log(`  Phases: ${existingPhases.length}`);
    if (existingPhases.length > 0) {
      console.log(`  Phase names: ${existingPhases.map(p => p.name).join(', ')}\n`);
    }

    // 4. Calculate what SHOULD be generated
    const participantCount = registrations.length;
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));
    let correctTotalRounds = Math.log2(bracketSize);
    
    // Apply qualifying reduction
    correctTotalRounds = Math.max(1, correctTotalRounds - 2);
    
    console.log(`📊 Expected Structure (with ${participantCount} players):`);
    console.log(`  Bracket Size: ${bracketSize}`);
    console.log(`  Total Rounds: ${correctTotalRounds}`);
    console.log(`  Qualifiers Produced: ${Math.pow(2, correctTotalRounds)}`);
    console.log(`  Expected Matches: ${bracketSize - 1}\n`);

    // 5. Offer to regenerate
    console.log('🔄 Regenerating bracket...\n');

    // Delete existing data
    if (existingMatches.length > 0) {
      const matchIds = existingMatches.map(m => m.id);
      await scoreRepo.delete({matchId: In(matchIds)});
      console.log(`  ✓ Deleted ${matchIds.length} match scores`);
    }
    await matchRepo.delete({bracketId: BRACKET_ID});
    console.log(`  ✓ Deleted ${existingMatches.length} matches`);
    await phaseRepo.delete({bracketId: BRACKET_ID});
    console.log(`  ✓ Deleted ${existingPhases.length} phases\n`);

    // Update bracket
    bracket.totalRounds = correctTotalRounds;
    await bracketRepo.save(bracket);
    console.log(`  ✓ Updated bracket totalRounds to ${correctTotalRounds}\n`);

    // Generate new structure
    const {participantIds, seededParticipants} = SeedingService.seedBracket(
      registrations,
      bracketSize,
    );

    console.log('🎾 Seeding:');
    seededParticipants.slice(0, 8).forEach(p => {
      console.log(`  Seed #${p.seedNumber}: ${p.registration.participant?.firstName} ${p.registration.participant?.lastName} (Rank ${p.registration.participant?.ranking})`);
    });
    if (seededParticipants.length > 8) {
      console.log(`  ... and ${seededParticipants.length - 8} more\n`);
    }

    const matchGenerator = new MatchGeneratorService();
    const {matches, phases} = await matchGenerator.generateMatches(
      bracket.id,
      bracket.tournamentId,
      bracket.bracketType,
      participantIds,
      correctTotalRounds,
      'QUALIFYING' // Important: set phase type!
    );

    // Save phases
    await phaseRepo.save(phases);
    console.log(`\n✅ Created ${phases.length} phases:`);
    phases.forEach(p => {
      console.log(`   - ${p.name} (${p.matchCount} matches)`);
    });

    // Save matches
    await matchRepo.save(matches);
    console.log(`✅ Created ${matches.length} matches\n`);

    console.log('🎉 Qualifying bracket regenerated successfully!');
    console.log(`   Structure: ${participantCount} players → ${Math.pow(2, correctTotalRounds)} qualifiers`);
    console.log(`   Phases: ${phases.map(p => p.name).join(' → ')}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

debugAndRegenerateQualifyingBracket()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
