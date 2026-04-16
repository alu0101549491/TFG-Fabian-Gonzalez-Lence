/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 15, 2026
 * @file infrastructure/database/seed-production.ts
 * @desc Safe production database seeding — only seeds if no users exist.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import 'dotenv/config';
import bcrypt from 'bcrypt';
import {AppDataSource} from './data-source';
import {User} from '../../domain/entities/user.entity';
import {UserRole} from '../../domain/enumerations/user-role';
import {generateId} from '../../shared/utils/id-generator';

/**
 * Seeds the production database with the initial admin user.
 * Skips seeding if any users already exist to prevent data loss on restart.
 */
async function seedProduction(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Checking production database seed...');

    const userRepository = AppDataSource.getRepository(User);

    // Only seed if database is empty
    const userCount = await userRepository.count();
    if (userCount > 0) {
      console.log(`⚠️  Database already has ${userCount} user(s). Skipping seed.`);
      await AppDataSource.destroy();
      return;
    }

    console.log('✓ Database is empty, creating admin user...');

    const seedAdminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@tennistournament.com';
    const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!seedAdminPassword || seedAdminPassword.trim().length === 0) {
      throw new Error(
        'Missing required env var: SEED_ADMIN_PASSWORD. ' +
        'Refusing to seed with a default admin credential.'
      );
    }

    const adminPasswordHash = await bcrypt.hash(seedAdminPassword, 10);

    const admin = userRepository.create({
      id: generateId('usr'),
      username: 'admin',
      email: seedAdminEmail,
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.SYSTEM_ADMIN,
      isActive: true,
      gdprConsent: true,
      phone: null,
      lastLogin: null,
    });

    await userRepository.save(admin);

    console.log('✓ Created admin user:', admin.email);
    console.log('🎉 Production seed completed successfully!');
    console.log('');
    console.log('📝 Admin login details:');
    console.log(`   Email:    ${admin.email}`);
    console.log('   Password: (set via SEED_ADMIN_PASSWORD env var)');
    console.log(`   Role:     ${admin.role}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('✗ Production seed failed:', error);
    process.exit(1);
  }
}

seedProduction();
