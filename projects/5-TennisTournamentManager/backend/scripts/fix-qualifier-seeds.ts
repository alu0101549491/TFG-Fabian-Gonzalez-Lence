import { AppDataSource } from './src/infrastructure/database/data-source.js';
import { Registration } from './src/domain/entities/registration.entity.js';
import { AcceptanceType } from './src/domain/enumerations/acceptance-type.js';
import { RegistrationStatus } from './src/domain/enumerations/registration-status.js';

async function fixQualifierSeeds() {
  await AppDataSource.initialize();
  
  const registrationRepository = AppDataSource.getRepository(Registration);
  
  // Get all registrations for main draw tournament
  const mainDrawTournamentId = 'trn_3b7247a7';
  const categoryId = 'cat_2a6a3f82';
  
  // Get direct acceptances to find highest seed
  const directAcceptances = await registrationRepository.find({
    where: {
      tournamentId: mainDrawTournamentId,
      categoryId,
      acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
    },
  });
  
  const highestSeed = Math.max(...directAcceptances.filter(r => r.seedNumber !== null).map(r => r.seedNumber!));
  console.log(`Highest direct acceptance seed: ${highestSeed}`);
  
  // Get qualifiers without seed numbers
  const qualifiers = await registrationRepository.find({
    where: {
      tournamentId: mainDrawTournamentId,
      categoryId,
      acceptanceType: AcceptanceType.QUALIFIER,
    },
    relations: ['participant'],
    order: {
      registrationDate: 'ASC',
    },
  });
  
  console.log(`\nFound ${qualifiers.length} qualifiers to update:`);
  
  let nextSeed = highestSeed + 1;
  for (const qualifier of qualifiers) {
    const oldSeed = qualifier.seedNumber;
    qualifier.seedNumber = nextSeed++;
    await registrationRepository.save(qualifier);
    console.log(`✅ ${qualifier.participant?.username || qualifier.participantId}: Seed ${oldSeed} → ${qualifier.seedNumber}`);
  }
  
  console.log('\n✅ All qualifier seed numbers updated');
  
  await AppDataSource.destroy();
}

fixQualifierSeeds().catch(console.error);
