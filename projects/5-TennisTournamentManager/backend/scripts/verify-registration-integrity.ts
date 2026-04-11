/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabian Gonzalez Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/scripts/verify-registration-integrity.ts
 * @desc Validates registration status/acceptanceType integrity for a tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Registration} from './src/domain/entities/registration.entity';
import {RegistrationStatus} from './src/domain/enumerations/registration-status';
import {AcceptanceType} from './src/domain/enumerations/acceptance-type';

async function verifyRegistrationIntegrity(tournamentId: string): Promise<void> {
  await AppDataSource.initialize();

  const registrationRepository = AppDataSource.getRepository(Registration);
  const regs = await registrationRepository.find({where: {tournamentId}});

  const statusCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();

  for (const reg of regs) {
    statusCounts.set(reg.status, (statusCounts.get(reg.status) || 0) + 1);
    typeCounts.set(reg.acceptanceType, (typeCounts.get(reg.acceptanceType) || 0) + 1);
  }

  const inconsistentWithdrawn = regs.filter(
    (r) => r.acceptanceType === AcceptanceType.WITHDRAWN && r.status !== RegistrationStatus.WITHDRAWN
  );

  const activeButWithdrawnStatus = regs.filter(
    (r) => r.status === RegistrationStatus.WITHDRAWN &&
      (r.acceptanceType === AcceptanceType.DIRECT_ACCEPTANCE ||
        r.acceptanceType === AcceptanceType.QUALIFIER ||
        r.acceptanceType === AcceptanceType.LUCKY_LOSER)
  );

  console.log('=== Registration Integrity Verification ===');
  console.log(`Tournament: ${tournamentId}`);
  console.log(`Total registrations: ${regs.length}`);

  console.log('Status counts:');
  for (const [status, count] of statusCounts.entries()) {
    console.log(`- ${status}: ${count}`);
  }

  console.log('AcceptanceType counts:');
  for (const [type, count] of typeCounts.entries()) {
    console.log(`- ${type}: ${count}`);
  }

  console.log(`Inconsistent (acceptanceType=WITHDRAWN, status!=WITHDRAWN): ${inconsistentWithdrawn.length}`);
  console.log(`Inconsistent (status=WITHDRAWN but active acceptanceType): ${activeButWithdrawnStatus.length}`);

  const pass = inconsistentWithdrawn.length === 0 && activeButWithdrawnStatus.length === 0;
  console.log(`Integrity status: ${pass ? 'PASS' : 'FAIL'}`);

  await AppDataSource.destroy();
}

const tournamentId = process.argv[2];
if (!tournamentId) {
  console.error('Usage: npx tsx scripts/verify-registration-integrity.ts <tournamentId>');
  process.exit(1);
}

verifyRegistrationIntegrity(tournamentId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
