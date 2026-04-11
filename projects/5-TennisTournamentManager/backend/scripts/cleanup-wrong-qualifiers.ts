import { AppDataSource } from './src/infrastructure/database/data-source.js';
import { Registration } from './src/domain/entities/registration.entity.js';
import { AcceptanceType } from './src/domain/enumerations/acceptance-type.js';

async function cleanup() {
  await AppDataSource.initialize();
  
  const registrationRepository = AppDataSource.getRepository(Registration);
  
  // Delete all qualifier registrations from main draw
  const result = await registrationRepository.delete({
    tournamentId: 'trn_3b7247a7',
    categoryId: 'cat_2a6a3f82',
    acceptanceType: AcceptanceType.QUALIFIER,
  });
  
  console.log(`✅ Deleted ${result.affected} qualifier registrations`);
  
  await AppDataSource.destroy();
}

cleanup().catch(console.error);
