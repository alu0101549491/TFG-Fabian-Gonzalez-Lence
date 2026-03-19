/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 19, 2026
 * @file infrastructure/database/add-categories.ts
 * @desc Script to add sample categories to tournaments for testing
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AppDataSource} from './data-source';
import {Tournament} from '../../domain/entities/tournament.entity';
import {Category} from '../../domain/entities/category.entity';
import {generateId} from '../../shared/utils/id-generator';

/**
 * Adds sample categories to all tournaments that don't have any.
 */
async function addCategoriesToTournaments(): Promise<void> {
  try {
    console.log('🎾 Initializing database connection...');
    await AppDataSource.initialize();

    const tournamentRepository = AppDataSource.getRepository(Tournament);
    const categoryRepository = AppDataSource.getRepository(Category);

    // Get all tournaments
    const tournaments = await tournamentRepository.find();
    console.log(`📋 Found ${tournaments.length} tournament(s)`);

    if (tournaments.length === 0) {
      console.log('⚠️  No tournaments found. Create a tournament first.');
      return;
    }

    for (const tournament of tournaments) {
      // Check if tournament already has categories
      const existingCategories = await categoryRepository.find({
        where: {tournamentId: tournament.id},
      });

      if (existingCategories.length > 0) {
        console.log(`⏩ Tournament "${tournament.name}" already has ${existingCategories.length} categories. Skipping.`);
        continue;
      }

      console.log(`\n➕ Adding categories to "${tournament.name}"...`);

      // Define sample categories
      const categoryData = [
        {
          name: "Men's Singles",
          gender: 'M',
          ageGroup: 'OPEN',
          maxParticipants: 32,
        },
        {
          name: "Women's Singles",
          gender: 'F',
          ageGroup: 'OPEN',
          maxParticipants: 32,
        },
        {
          name: "Men's Doubles",
          gender: 'M',
          ageGroup: 'OPEN',
          maxParticipants: 16,
        },
        {
          name: 'Mixed Doubles',
          gender: 'MIXED',
          ageGroup: 'OPEN',
          maxParticipants: 16,
        },
      ];

      // Create categories for this tournament
      for (const data of categoryData) {
        const category = categoryRepository.create({
          id: generateId('cat'),
          tournamentId: tournament.id,
          name: data.name,
          gender: data.gender,
          ageGroup: data.ageGroup,
          maxParticipants: data.maxParticipants,
        });

        await categoryRepository.save(category);
        console.log(`   ✅ Created: ${data.name}`);
      }

      console.log(`✨ Successfully added ${categoryData.length} categories to "${tournament.name}"`);
    }

    console.log('\n🎉 All done! Categories have been added to tournaments.');
  } catch (error) {
    console.error('❌ Error adding categories:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Run the script
addCategoriesToTournaments()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });
