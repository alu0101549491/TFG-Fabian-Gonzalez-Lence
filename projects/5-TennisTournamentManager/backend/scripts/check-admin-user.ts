/**
 * Quick script to check admin user in database
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {User} from './src/domain/entities/user.entity';

async function checkAdminUser() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Find admin user
    const adminUser = await userRepository.findOne({
      where: {email: 'admin@tennistournament.com'}
    });
    
    if (!adminUser) {
      console.log('❌ Admin user (admin@tennistournament.com) not found in database!');
      console.log('\nRun: npm run db:seed');
      process.exit(1);
    }
    
    console.log('📋 Admin User Details:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Active: ${adminUser.isActive}`);
    
    if (adminUser.role === 'SYSTEM_ADMIN') {
      console.log('\n✅ User has SYSTEM_ADMIN role in database');
    } else {
      console.log(`\n❌ User has wrong role: ${adminUser.role} (should be SYSTEM_ADMIN)`);
    }
    
    await AppDataSource.destroy();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdminUser();
