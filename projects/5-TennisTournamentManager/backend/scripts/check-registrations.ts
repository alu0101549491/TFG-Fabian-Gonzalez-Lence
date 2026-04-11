import { AppDataSource } from './src/infrastructure/database/data-source.js';
import { Registration } from './src/domain/entities/registration.entity.js';
import { User } from './src/domain/entities/user.entity.js';

async function checkRegistrations() {
  await AppDataSource.initialize();
  
  const registrations = await AppDataSource.getRepository(Registration)
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.user', 'u')
    .where('r.tournamentId = :tournamentId', { tournamentId: 'trn_3b7247a7' })
    .orderBy('r.acceptanceType', 'ASC')
    .addOrderBy('r.seedNumber', 'ASC')
    .getMany();

  console.log('\n=== Main Draw Tournament Registrations (trn_3b7247a7) ===\n');
  registrations.forEach(r => {
    console.log(`${r.user?.username || r.userId} | ${r.acceptanceType} | Seed: ${r.seedNumber || 'N/A'} | Status: ${r.status}`);
  });
  console.log(`\nTotal: ${registrations.length} registrations`);
  
  await AppDataSource.destroy();
}

checkRegistrations().catch(console.error);
