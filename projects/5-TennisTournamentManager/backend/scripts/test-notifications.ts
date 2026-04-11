/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 9, 2026
 * @file test-notifications.ts
 * @desc Test script to send sample notifications through all channels.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import 'reflect-metadata';
import {AppDataSource} from './src/infrastructure/database/data-source';
import {NotificationService} from './src/application/services/notification.service';
import {NotificationType} from './src/domain/enumerations/notification-type';
import {User} from './src/domain/entities/user.entity';

/**
 * Test notification system by sending sample notifications.
 */
async function testNotifications(): Promise<void> {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const notificationService = new NotificationService();
    const userRepository = AppDataSource.getRepository(User);

    // Get a test user (you can replace with a specific username or ID)
    const users = await userRepository.find({
      take: 5,
      order: {createdAt: 'ASC'},
    });

    if (users.length === 0) {
      console.error('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log('📋 Available test users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - ID: ${user.id}`);
      console.log(`     Telegram: ${user.telegramChatId || 'Not configured'}`);
    });

    // Use the first user or specify a user ID
    const testUser = users[0];
    console.log(`\n🎯 Sending test notifications to: ${testUser.username}\n`);

    // Test 1: Match Update Notification
    console.log('📤 Test 1: Match Update Notification');
    const matchNotification = await notificationService.createNotification(
      testUser.id,
      NotificationType.MATCH_UPDATE,
      '🎾 Match Update',
      'Your match against test_opponent has been scheduled for tomorrow at 10:00 AM.',
      {matchId: 'match_test123', tournamentId: 'trn_test456', tournamentName: 'Spring Championship'},
    );

    if (matchNotification) {
      console.log(`✅ Match notification created: ${matchNotification.id}`);
      console.log(`   Channels: ${matchNotification.channels.join(', ')}\n`);
    } else {
      console.log('⚠️  Match notification blocked by user preferences\n');
    }

    // Wait a bit between notifications
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Tournament Update Notification
    console.log('📤 Test 2: Tournament Update Notification');
    const tournamentNotification = await notificationService.createNotification(
      testUser.id,
      NotificationType.TOURNAMENT_UPDATE,
      '🏆 Tournament Update',
      'The Spring Championship has been updated. Check the new schedule.',
      {tournamentId: 'trn_test789', tournamentName: 'Spring Championship'},
    );

    if (tournamentNotification) {
      console.log(`✅ Tournament notification created: ${tournamentNotification.id}`);
      console.log(`   Channels: ${tournamentNotification.channels.join(', ')}\n`);
    } else {
      console.log('⚠️  Tournament notification blocked by user preferences\n');
    }

    // Wait a bit between notifications
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Match Scheduled Notification
    console.log('📤 Test 3: Match Scheduled Notification');
    const scheduleNotification = await notificationService.createNotification(
      testUser.id,
      NotificationType.MATCH_SCHEDULED,
      '📅 Match Scheduled',
      'Your semifinal match has been scheduled for Friday, April 12 at 14:00.',
      {matchId: 'match_test456', tournamentId: 'trn_test789', tournamentName: 'Summer Open'},
    );

    if (scheduleNotification) {
      console.log(`✅ Schedule notification created: ${scheduleNotification.id}`);
      console.log(`   Channels: ${scheduleNotification.channels.join(', ')}\n`);
    } else {
      console.log('⚠️  Schedule notification blocked by user preferences\n');
    }

    // Wait a bit between notifications
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Announcement Notification
    console.log('📤 Test 4: Announcement Notification');
    const announcementNotification = await notificationService.createNotification(
      testUser.id,
      NotificationType.ANNOUNCEMENT,
      '📢 Important Announcement',
      'The tournament venue has changed. Please check the updated location in your tournament details.',
      {tournamentId: 'trn_test789', tournamentName: 'Winter Classic'},
    );

    if (announcementNotification) {
      console.log(`✅ Announcement notification created: ${announcementNotification.id}`);
      console.log(`   Channels: ${announcementNotification.channels.join(', ')}\n`);
    } else {
      console.log('⚠️  Announcement notification blocked by user preferences\n');
    }

    console.log('\n✅ Test notifications completed!');
    console.log('\n📱 How to verify:');
    console.log('  1. IN-APP: Log in as the test user and check /notifications page');
    console.log('  2. EMAIL: Check the email inbox for the test user');
    console.log('  3. TELEGRAM: If configured, check the Telegram bot chat');
    console.log('  4. WEB PUSH: If subscribed, check browser notifications');
    console.log('\n💡 Note: Channels depend on user notification preferences.');
    console.log('   To enable/disable channels, use the Privacy Settings page.\n');

  } catch (error) {
    console.error('❌ Error during notification testing:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testNotifications();
