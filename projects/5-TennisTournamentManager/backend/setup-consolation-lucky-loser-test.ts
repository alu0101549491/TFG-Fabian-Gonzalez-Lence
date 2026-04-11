/**
 * Setup script for testing Consolation Draw and Lucky Loser features
 * 
 * This script:
 * 1. Fills the main draw to 16/16 capacity
 * 2. Creates ALTERNATE registrations (waiting list)
 * 3. Sets up Round of 16 matches
 * 
 * Tournament: trn_3b7247a7 (Main Draw)
 * Bracket: brk_e601697d (Single Elimination, 16 players)
 * Category: cat_2a6a3f82 (Open Singles - Main Draw)
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Registration} from './src/domain/entities/registration.entity';
import {User} from './src/domain/entities/user.entity';
import {generateId} from './src/shared/utils/id-generator';
import {RegistrationStatus} from './src/domain/enumerations/registration-status';
import {AcceptanceType} from './src/domain/enumerations/acceptance-type';

async function setupConsolationLuckyLoserTest(): Promise<void> {
  await AppDataSource.initialize();

  const registrationRepository = AppDataSource.getRepository(Registration);
  const userRepository = AppDataSource.getRepository(User);

  const tournamentId = 'trn_3b7247a7';
  const categoryId = 'cat_2a6a3f82';

  console.log('🔍 Current registration status...');
  const currentRegs = await registrationRepository.find({
    where: {tournamentId},
  });
  
  const accepted = currentRegs.filter(r => r.status === RegistrationStatus.ACCEPTED);
  console.log(`   ✅ Accepted: ${accepted.length}/16`);
  console.log(`   ⏳ Pending: ${currentRegs.filter(r => r.status === RegistrationStatus.PENDING).length}`);

  // Step 1: Approve pending registrations
  console.log('\n📝 Step 1: Approving pending registrations...');
  const pending = currentRegs.filter(r => r.status === RegistrationStatus.PENDING);
  
  for (const reg of pending) {
    reg.status = RegistrationStatus.ACCEPTED;
    reg.acceptanceType = AcceptanceType.DIRECT_ACCEPTANCE;
    // Assign seed numbers
    const currentAccepted = await registrationRepository.count({
      where: {
        tournamentId,
        categoryId,
        status: RegistrationStatus.ACCEPTED,
        acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
      },
    });
    reg.seedNumber = currentAccepted + 1;
    await registrationRepository.save(reg);
    console.log(`   ✅ Approved registration ${reg.id} with seed #${reg.seedNumber}`);
  }

  // Step 2: Check if we need more players to fill to 16
  const nowAccepted = await registrationRepository.count({
    where: {
      tournamentId,
      categoryId,
      status: RegistrationStatus.ACCEPTED,
    },
  });

  console.log(`\n📊 Current capacity: ${nowAccepted}/16`);

  if (nowAccepted < 16) {
    console.log(`\n👥 Step 2: Creating ${16 - nowAccepted} more players to fill bracket...`);
    
    // Find available users not yet registered
    const allUsers = await userRepository.find();
    const registeredUserIds = currentRegs.map(r => r.participantId);
    const availableUsers = allUsers.filter(u => !registeredUserIds.includes(u.id));

    const needed = 16 - nowAccepted;
    const usersToAdd = availableUsers.slice(0, needed);

    if (usersToAdd.length < needed) {
      console.log(`   ⚠️  Warning: Only ${usersToAdd.length} available users found, need ${needed}`);
    }

    for (let i = 0; i < usersToAdd.length; i++) {
      const user = usersToAdd[i];
      const newReg = registrationRepository.create({
        id: generateId('reg'),
        tournamentId,
        categoryId,
        participantId: user.id,
        status: RegistrationStatus.ACCEPTED,
        acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
        seedNumber: nowAccepted + i + 1,
        registrationDate: new Date(),
      });
      await registrationRepository.save(newReg);
      console.log(`   ✅ Created registration for ${user.username || user.email} with seed #${newReg.seedNumber}`);
    }
  }

  // Step 3: Create ALTERNATE registrations (waiting list)
  console.log('\n📋 Step 3: Creating ALTERNATE registrations for Lucky Loser testing...');
  
  const finalAccepted = await registrationRepository.find({
    where: {
      tournamentId,
      categoryId,
      status: RegistrationStatus.ACCEPTED,
    },
  });

  const allUsers = await userRepository.find();
  const registeredUserIds = finalAccepted.map(r => r.participantId);
  const availableForAlternates = allUsers.filter(u => !registeredUserIds.includes(u.id));

  // Create 3 alternates for testing
  const alternateCount = Math.min(3, availableForAlternates.length);
  
  for (let i = 0; i < alternateCount; i++) {
    const user = availableForAlternates[i];
    const altReg = registrationRepository.create({
      id: generateId('reg'),
      tournamentId,
      categoryId,
      participantId: user.id,
      status: RegistrationStatus.ACCEPTED,
      acceptanceType: AcceptanceType.ALTERNATE,
      seedNumber: null, // Alternates don't have seeds
      registrationDate: new Date(Date.now() + i * 1000), // Stagger by 1 second for ordering
    });
    await registrationRepository.save(altReg);
    console.log(`   ⏳ Created ALTERNATE registration for ${user.username || user.email} (${altReg.id})`);
  }

  // Final summary
  console.log('\n✨ Setup Complete! Summary:');
  const finalRegs = await registrationRepository.find({
    where: {tournamentId},
  });
  
  const summary = {
    directAcceptance: finalRegs.filter(r => r.acceptanceType === AcceptanceType.DIRECT_ACCEPTANCE).length,
    qualifiers: finalRegs.filter(r => r.acceptanceType === AcceptanceType.QUALIFIER).length,
    alternates: finalRegs.filter(r => r.acceptanceType === AcceptanceType.ALTERNATE).length,
    total: finalRegs.length,
  };

  console.log(`   🎾 Direct Acceptance: ${summary.directAcceptance}`);
  console.log(`   🏆 Qualifiers: ${summary.qualifiers}`);
  console.log(`   ⏳ Alternates: ${summary.alternates}`);
  console.log(`   📊 Total Registrations: ${summary.total}`);

  console.log('\n📝 Next Steps:');
  console.log('   1. Test Lucky Loser:');
  console.log('      - Go to Phase Management → Lucky Loser tab');
  console.log('      - Withdraw one of the seed #1-12 players');
  console.log('      - Verify oldest ALTERNATE gets promoted to LUCKY_LOSER');
  console.log('');
  console.log('   2. Test Consolation Draw:');
  console.log('      - Go to Phase Management → Consolation Draw tab');
  console.log('      - Select "Round of 16" as Main Phase');
  console.log('      - Create consolation bracket for first-round losers');

  await AppDataSource.destroy();
}

setupConsolationLuckyLoserTest()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
