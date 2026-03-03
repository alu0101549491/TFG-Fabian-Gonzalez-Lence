/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 3, 2026
 * @file prisma/seed-production.ts
 * @desc Safe production database seeding - only seeds if database is empty
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Main seed function - only seeds if database is empty
 */
async function main(): Promise<void> {
  console.log('🌱 Starting production database seed...');

  // Check if database already has users
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('⚠️  Database already has users. Skipping seed to prevent data loss.');
    console.log(`   Found ${userCount} users in database.`);
    return;
  }

  console.log('✓ Database is empty, proceeding with seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('REDACTED', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'Admin User',
      email: 'admin@cartographic.com',
      passwordHash: adminPassword,
      role: 'ADMINISTRATOR',
      phone: '+34600000001',
    },
  });

  console.log('✓ Created admin user:', admin.email);
  console.log('');
  console.log('🎉 Production seed completed successfully!');
  console.log('');
  console.log('📝 Default credentials:');
  console.log('   Email: admin@cartographic.com');
  console.log('   Password: REDACTED');
  console.log('');
  console.log('⚠️  IMPORTANT: Change the admin password after first login!');
}

main()
  .catch((e: Error) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
