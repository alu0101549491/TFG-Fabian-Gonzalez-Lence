/**
 * Update existing notifications to include tournament metadata
 * This allows old notifications to display tournament badges
 */

import 'reflect-metadata';
import {AppDataSource} from './src/infrastructure/database/data-source';
import {Notification} from './src/domain/entities/notification.entity';

async function updateNotifications() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const notificationRepository = AppDataSource.getRepository(Notification);

    // Find all notifications without metadata or with empty metadata
    const notifications = await notificationRepository.find();
    console.log(`📋 Found ${notifications.length} total notifications\n`);

    let updatedCount = 0;
    for (const notification of notifications) {
      // If metadata is null or empty, add tournament info
      if (!notification.metadata || Object.keys(notification.metadata).length === 0) {
        notification.metadata = {
          tournamentId: 'trn_test789',
          tournamentName: 'Spring Championship',
        };
        await notificationRepository.save(notification);
        updatedCount++;
        console.log(`✅ Updated: ${notification.id} - "${notification.title}"`);
      }
    }

    console.log(`\n✨ Updated ${updatedCount} notifications with tournament metadata`);

    // Display updated notifications
    const recent = await notificationRepository.find({
      order: {createdAt: 'DESC'},
      take: 5,
    });

    console.log('\n📋 Recent Notifications:');
    for (const notif of recent) {
      console.log(`  - ${notif.title}`);
      console.log(`    Metadata: ${JSON.stringify(notif.metadata)}\n`);
    }

    await AppDataSource.destroy();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error updating notifications:', error);
    process.exit(1);
  }
}

updateNotifications();
