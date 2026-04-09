/**
 * Check and fix tournament registration status
 */

import 'reflect-metadata';
import {AppDataSource} from './src/infrastructure/database/data-source';
import {Tournament} from './src/domain/entities/tournament.entity';
import {Category} from './src/domain/entities/category.entity';
import {TournamentStatus} from './src/domain/enumerations/tournament-status';

async function checkAndFixTournamentStatus() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const categoryRepository = AppDataSource.getRepository(Category);
    const tournamentRepository = AppDataSource.getRepository(Tournament);

    // Find the category
    const categoryId = 'cat_5fcb7fbd';
    const category = await categoryRepository.findOne({
      where: {id: categoryId},
      relations: ['tournament'],
    });

    if (!category) {
      console.error('❌ Category not found:', categoryId);
      process.exit(1);
    }

    console.log('📋 Category:', category.name);
    console.log('🏆 Tournament ID:', category.tournamentId);

    // Find the tournament
    const tournament = await tournamentRepository.findOne({
      where: {id: category.tournamentId},
    });

    if (!tournament) {
      console.error('❌ Tournament not found:', category.tournamentId);
      process.exit(1);
    }

    console.log('🏆 Tournament:', tournament.name);
    console.log('📊 Current Status:', tournament.status);
    console.log('📅 Registration Close Date:', tournament.registrationCloseDate);

    // Check if status needs to be updated
    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      console.log('\n⚠️  Tournament is not open for registration!');
      console.log('🔧 Updating status to REGISTRATION_OPEN...');
      
      tournament.status = TournamentStatus.REGISTRATION_OPEN;
      await tournamentRepository.save(tournament);
      
      console.log('✅ Tournament status updated to REGISTRATION_OPEN');
    } else {
      console.log('\n✅ Tournament is already open for registration');
    }

    // Check registration deadline
    if (tournament.registrationCloseDate) {
      const now = new Date();
      const deadline = new Date(tournament.registrationCloseDate);
      
      if (now > deadline) {
        console.log('\n⚠️  Registration deadline has passed!');
        console.log('Deadline:', deadline);
        console.log('Current time:', now);
        console.log('\n🔧 Extending deadline by 30 days...');
        
        const newDeadline = new Date();
        newDeadline.setDate(newDeadline.getDate() + 30);
        tournament.registrationCloseDate = newDeadline;
        await tournamentRepository.save(tournament);
        
        console.log('✅ New deadline:', newDeadline);
      } else {
        console.log('\n✅ Registration deadline is still valid');
        console.log('Deadline:', deadline);
      }
    }

    await AppDataSource.destroy();
    console.log('\n✅ Done! Try registering again.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndFixTournamentStatus();
