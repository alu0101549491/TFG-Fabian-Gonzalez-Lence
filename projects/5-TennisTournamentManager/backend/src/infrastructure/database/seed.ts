/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file infrastructure/database/seed.ts
 * @desc Database seeding script for development with sample users for each role.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import {AppDataSource} from './data-source';
import {User} from '../../domain/entities/user.entity';
import {UserRole} from '../../domain/enumerations/user-role';
import {generateId} from '../../shared/utils/id-generator';

/**
 * Gets required environment variable or throws error.
 * 
 * @param name - Environment variable name
 * @returns Environment variable value
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (typeof value === 'string' && value.length > 0) return value;

  throw new Error(
    `[seed] Missing required environment variable: ${name}. ` +
      'Set it in your shell/CI environment before running seed.'
  );
}

/**
 * Seeds the database with initial data for development.
 * Creates sample users for each role with credentials from environment variables.
 */
async function seedDatabase(): Promise<void> {
  try {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error(
        'Refusing to run destructive dev seed unless NODE_ENV=development.'
      );
    }

    if (process.env.SEED_CONFIRM !== 'I_UNDERSTAND') {
      throw new Error(
        'Refusing to run destructive dev seed without explicit confirmation. Set SEED_CONFIRM=I_UNDERSTAND to proceed.'
      );
    }

    await AppDataSource.initialize();
    console.log('🌱 Starting database seed...');
    
    // Clear all tables using raw SQL with CASCADE (development only!)
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Disable foreign key checks temporarily and truncate all tables
      await queryRunner.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
      console.log('✓ Cleared existing data');
    } finally {
      await queryRunner.release();
    }
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Hash passwords from environment variables
    const adminPassword = await bcrypt.hash(requireEnv('PW_E2E_ADMIN_PASSWORD'), 10);
    const tournamentAdminPassword = await bcrypt.hash(requireEnv('PW_E2E_TOURNAMENT_ADMIN_PASSWORD'), 10);
    const playerPassword = await bcrypt.hash(requireEnv('PW_E2E_PLAYER_PASSWORD'), 10);
    
    // Create System Administrator
    const systemAdmin = userRepository.create({
      id: generateId('usr'),
      username: 'admin',
      email: 'admin@tennistournament.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.SYSTEM_ADMIN,
      isActive: true,
      gdprConsent: true,
      phone: '+34600000001',
      lastLogin: null,
    });
    await userRepository.save(systemAdmin);
    console.log('✓ Created System Administrator:', systemAdmin.email);
    
    // Create Tournament Administrator
    const tournamentAdmin = userRepository.create({
      id: generateId('usr'),
      username: 'tournament_admin',
      email: 'tournament@tennistournament.com',
      passwordHash: tournamentAdminPassword,
      firstName: 'Tournament',
      lastName: 'Organizer',
      role: UserRole.TOURNAMENT_ADMIN,
      isActive: true,
      gdprConsent: true,
      phone: '+34600000002',
      lastLogin: null,
    });
    await userRepository.save(tournamentAdmin);
    console.log('✓ Created Tournament Administrator:', tournamentAdmin.email);
    
    // Create Registered Participant (Player)
    const player1 = userRepository.create({
      id: generateId('usr'),
      username: 'carlos_rodriguez',
      email: 'player@example.com',
      passwordHash: playerPassword,
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      role: UserRole.PLAYER,
      isActive: true,
      gdprConsent: true,
      phone: '+34600000003',
      lastLogin: null,
    });
    await userRepository.save(player1);
    console.log('✓ Created Registered Participant:', player1.email);
    
    // Create second player
    const player2 = userRepository.create({
      id: generateId('usr'),
      username: 'maria_garcia',
      email: 'maria@example.com',
      passwordHash: playerPassword,
      firstName: 'Maria',
      lastName: 'Garcia',
      role: UserRole.PLAYER,
      isActive: true,
      gdprConsent: true,
      phone: '+34600000004',
      lastLogin: null,
    });
    await userRepository.save(player2);
    console.log('✓ Created second Registered Participant:', player2.email);
    
    console.log('✓ Database seeded successfully');
    console.log('\n📋 Sample Users Created:');
    console.log('   System Admin:         admin@tennistournament.com');
    console.log('   Tournament Admin:     tournament@tennistournament.com');
    console.log('   Player 1:             player@example.com');
    console.log('   Player 2:             maria@example.com');
    console.log('\n🔑 Passwords are set via environment variables');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
