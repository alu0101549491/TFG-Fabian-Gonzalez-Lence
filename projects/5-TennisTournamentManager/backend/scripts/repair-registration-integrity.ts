/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabian Gonzalez Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/scripts/repair-registration-integrity.ts
 * @desc Repairs registration status/acceptanceType inconsistencies for withdrawn participants.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Registration} from './src/domain/entities/registration.entity';
import {RegistrationStatus} from './src/domain/enumerations/registration-status';
import {AcceptanceType} from './src/domain/enumerations/acceptance-type';

async function repairRegistrationIntegrity(tournamentId: string): Promise<void> {
  await AppDataSource.initialize();

  const registrationRepository = AppDataSource.getRepository(Registration);
  const regs = await registrationRepository.find({where: {tournamentId}});

  let repaired = 0;

  for (const reg of regs) {
    if (reg.acceptanceType === AcceptanceType.WITHDRAWN && reg.status !== RegistrationStatus.WITHDRAWN) {
      reg.status = RegistrationStatus.WITHDRAWN;
      await registrationRepository.save(reg);
      repaired++;
      console.log(`Repaired registration ${reg.id}: status -> WITHDRAWN`);
    }

    if (reg.status === RegistrationStatus.WITHDRAWN && reg.acceptanceType !== AcceptanceType.WITHDRAWN) {
      reg.acceptanceType = AcceptanceType.WITHDRAWN;
      await registrationRepository.save(reg);
      repaired++;
      console.log(`Repaired registration ${reg.id}: acceptanceType -> WITHDRAWN`);
    }
  }

  console.log(`Total repaired records: ${repaired}`);

  await AppDataSource.destroy();
}

const tournamentId = process.argv[2];
if (!tournamentId) {
  console.error('Usage: npx tsx scripts/repair-registration-integrity.ts <tournamentId>');
  process.exit(1);
}

repairRegistrationIntegrity(tournamentId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Repair failed:', error);
    process.exit(1);
  });
