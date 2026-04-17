/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 10, 2026
 * @file backend/src/scripts/populate-phase-tournament-ids.ts
 * @desc Migration script to populate tournamentId field in existing phases.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {AppDataSource} from '../infrastructure/database/data-source';
import {Phase} from '../domain/entities/phase.entity';
import {Bracket} from '../domain/entities/bracket.entity';

/**
 * Populate tournamentId for existing Phase records.
 *
 * This script reads each phase's bracket relationship and copies
 * the tournament ID to the phase's tournamentId field.
 */
async function populatePhaseTournamentIds(): Promise<void> {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();

    const phaseRepository = AppDataSource.getRepository(Phase);
    const bracketRepository = AppDataSource.getRepository(Bracket);

    console.log('📊 Fetching all phases without tournamentId...');
    const phasesWithoutTournamentId = await phaseRepository.find({
      where: {tournamentId: null as any},
    });

    console.log(`Found ${phasesWithoutTournamentId.length} phases to update.`);

    let updatedCount = 0;

    for (const phase of phasesWithoutTournamentId) {
      // Fetch the bracket to get its tournamentId
      const bracket = await bracketRepository.findOne({
        where: {id: phase.bracketId},
      });

      if (bracket) {
        phase.tournamentId = bracket.tournamentId;
        await phaseRepository.save(phase);
        updatedCount++;
        console.log(`✓ Updated phase ${phase.id} with tournamentId: ${bracket.tournamentId}`);
      } else {
        console.warn(`⚠️  Phase ${phase.id} references non-existent bracket ${phase.bracketId}`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} phases.`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
populatePhaseTournamentIds();
