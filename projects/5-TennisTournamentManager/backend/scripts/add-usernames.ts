/**
 * Script to add usernames to existing users without wiping database
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {User} from './src/domain/entities/user.entity';

async function addUsernames(): Promise<void> {
  console.log('🔧 Adding usernames to existing users...\n');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✓ Database connected\n');

    const userRepository = AppDataSource.getRepository(User);

    // Define username mappings based on email
    const usernameMap: Record<string, string> = {
      'admin@tennistournament.com': 'admin',
      'tournament@tennistournament.com': 'tournament_admin',
      'player@example.com': 'carlos_rodriguez',
      'maria@example.com': 'maria_garcia',
    };

    // Get all users without usernames
    const users = await userRepository.find();
    
    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
      if (!user.username) {
        // Check if we have a predefined username for this email
        if (usernameMap[user.email]) {
          user.username = usernameMap[user.email];
          await userRepository.save(user);
          console.log(`✅ Updated ${user.email} -> username: ${user.username}`);
        } else {
          // Generate username from email (remove domain and special chars)
          const generatedUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
          user.username = generatedUsername;
          await userRepository.save(user);
          console.log(`✅ Updated ${user.email} -> username: ${user.username}`);
        }
      } else {
        console.log(`⏭️  Skipped ${user.email} (already has username: ${user.username})`);
      }
    }

    console.log('\n✅ All users updated successfully!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addUsernames();
