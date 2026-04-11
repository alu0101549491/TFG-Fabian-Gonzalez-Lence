/**
 * Cleanup script: Remove admin accounts from tournament and replace with regular players
 * 
 * Removes: tournament_admin and admin accounts
 * Replaces with: Other available players as alternates
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Registration} from './src/domain/entities/registration.entity';
import {User} from './src/domain/entities/user.entity';
import {generateId} from './src/shared/utils/id-generator';
import {RegistrationStatus} from './src/domain/enumerations/registration-status';
import {AcceptanceType} from './src/domain/enumerations/acceptance-type';
import {UserRole} from './src/domain/enumerations/user-role';

async function cleanupAdminRegistrations(): Promise<void> {
  await AppDataSource.initialize();

  const registrationRepository = AppDataSource.getRepository(Registration);
  const userRepository = AppDataSource.getRepository(User);

  const tournamentId = 'trn_3b7247a7';
  const categoryId = 'cat_2a6a3f82';

  console.log('🔍 Finding admin account registrations...');
  
  // Find all registrations
  const allRegs = await registrationRepository.find({
    where: {tournamentId},
  });

  // Find admin users
  const adminUsers = await userRepository.find({
    where: [
      {role: UserRole.TOURNAMENT_ADMIN},
      {role: UserRole.SYSTEM_ADMIN},
    ],
  });

  const adminUserIds = adminUsers.map(u => u.id);
  console.log(`   Found ${adminUsers.length} admin users:`, adminUsers.map(u => u.username || u.email));

  // Find and delete admin registrations
  const adminRegs = allRegs.filter(r => adminUserIds.includes(r.participantId));
  
  console.log(`\n🗑️  Removing ${adminRegs.length} admin registrations...`);
  for (const reg of adminRegs) {
    const user = adminUsers.find(u => u.id === reg.participantId);
    console.log(`   ✕ Deleting registration for ${user?.username || user?.email} (${reg.id})`);
    await registrationRepository.remove(reg);
  }

  // Find available non-admin players
  const registeredUserIds = allRegs.filter(r => !adminUserIds.includes(r.participantId)).map(r => r.participantId);
  const allUsers = await userRepository.find();
  
  const availablePlayers = allUsers.filter(u => 
    !registeredUserIds.includes(u.id) && 
    !adminUserIds.includes(u.id) &&
    u.role === UserRole.PLAYER
  );

  console.log(`\n📋 Creating ${Math.min(3, availablePlayers.length)} alternate registrations from available players...`);
  
  const alternateCount = Math.min(3, availablePlayers.length);
  
  for (let i = 0; i < alternateCount; i++) {
    const user = availablePlayers[i];
    const altReg = registrationRepository.create({
      id: generateId('reg'),
      tournamentId,
      categoryId,
      participantId: user.id,
      status: RegistrationStatus.ACCEPTED,
      acceptanceType: AcceptanceType.ALTERNATE,
      seedNumber: null,
      registrationDate: new Date(Date.now() + i * 1000), // Stagger by 1 second
    });
    await registrationRepository.save(altReg);
    console.log(`   ⏳ Created ALTERNATE for ${user.username || user.firstName + ' ' + user.lastName} (${altReg.id})`);
  }

  // Final summary
  console.log('\n✨ Cleanup Complete! Summary:');
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

  await AppDataSource.destroy();
}

cleanupAdminRegistrations()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
