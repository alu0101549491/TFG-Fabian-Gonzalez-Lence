/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file infrastructure/database/seed.ts
 * @desc Database seeding script for initial data (admin user, sample tournaments).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import bcrypt from 'bcrypt';
import {AppDataSource} from './data-source';
import {User} from '../../domain/entities/user.entity';
import {UserRole} from '../../domain/enumerations/user-role';
import {generateId} from '../../shared/utils/id-generator';

/**
 * Seeds the database with initial data.
 */
async function seedDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Seeding database...');
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Create admin user if not exists
    const adminEmail = 'admin@tennistournament.com';
    const existingAdmin = await userRepository.findOne({where: {email: adminEmail}});
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      const admin = userRepository.create({
        id: generateId('usr'),
        email: adminEmail,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.SYSTEM_ADMIN,
        isActive: true,
        gdprConsent: true,
        phone: null,
        lastLogin: null,
      });
      
      await userRepository.save(admin);
      console.log('✓ Admin user created:', adminEmail);
    } else {
      console.log('✓ Admin user already exists');
    }
    
    console.log('✓ Database seeded successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
