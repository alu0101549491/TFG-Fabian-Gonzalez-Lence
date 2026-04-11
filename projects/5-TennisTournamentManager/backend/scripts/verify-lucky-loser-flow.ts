/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabian Gonzalez Lence <alu0101549491@ull.edu.es>
 * @since April 11, 2026
 * @file backend/scripts/verify-lucky-loser-flow.ts
 * @desc Executes and validates Lucky Loser promotion flow in a tournament.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {AppDataSource} from './src/infrastructure/database/data-source';
import {Bracket} from './src/domain/entities/bracket.entity';
import {Phase} from './src/domain/entities/phase.entity';
import {Registration} from './src/domain/entities/registration.entity';
import {User} from './src/domain/entities/user.entity';
import {AcceptanceType} from './src/domain/enumerations/acceptance-type';
import {RegistrationStatus} from './src/domain/enumerations/registration-status';
import {generateId} from './src/shared/utils/id-generator';

const API_URL = 'http://localhost:3000/api';

const TOURNAMENT_ADMIN_CREDENTIALS = {
  email: 'tournament@tennistournament.com',
  password: 'tourney123',
};

async function apiRequest(endpoint: string, method = 'GET', body?: unknown, token?: string): Promise<any> {
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

async function main(): Promise<void> {
  const tournamentId = process.argv[2];
  if (!tournamentId) {
    throw new Error('Usage: npx tsx scripts/verify-lucky-loser-flow.ts <tournamentId>');
  }

  await AppDataSource.initialize();

  const bracketRepository = AppDataSource.getRepository(Bracket);
  const phaseRepository = AppDataSource.getRepository(Phase);
  const registrationRepository = AppDataSource.getRepository(Registration);
  const userRepository = AppDataSource.getRepository(User);

  const bracket = await bracketRepository.findOne({where: {tournamentId}});
  if (!bracket) {
    throw new Error(`No bracket found for tournament ${tournamentId}`);
  }

  const categoryId = bracket.categoryId;

  const phases = await phaseRepository.find({
    where: {bracketId: bracket.id},
    order: {sequenceOrder: 'ASC'},
  });
  const phase = phases.find((p) => p.order === 1);
  if (!phase) {
    throw new Error('No first-round phase found');
  }

  const regs = await registrationRepository.find({where: {tournamentId, categoryId}});

  const withdrawCandidate = regs.find(
    (r) => r.status === RegistrationStatus.ACCEPTED &&
      (r.acceptanceType === AcceptanceType.DIRECT_ACCEPTANCE ||
       r.acceptanceType === AcceptanceType.QUALIFIER ||
       r.acceptanceType === AcceptanceType.LUCKY_LOSER)
  );

  if (!withdrawCandidate) {
    throw new Error('No accepted participant available to withdraw');
  }

  let alternate = regs
    .filter((r) => r.status === RegistrationStatus.ACCEPTED && r.acceptanceType === AcceptanceType.ALTERNATE)
    .sort((a, b) => a.registrationDate.getTime() - b.registrationDate.getTime())[0];

  if (!alternate) {
    const registeredIds = new Set(regs.map((r) => r.participantId));
    const users = await userRepository.find();
    const availableUser = users.find((u) => !registeredIds.has(u.id));
    if (!availableUser) {
      throw new Error('No unregistered users available to create an alternate');
    }

    alternate = registrationRepository.create({
      id: generateId('reg'),
      tournamentId,
      categoryId,
      participantId: availableUser.id,
      status: RegistrationStatus.ACCEPTED,
      acceptanceType: AcceptanceType.ALTERNATE,
      seedNumber: null,
      registrationDate: new Date(),
    });
    await registrationRepository.save(alternate);
  }

  const login = await apiRequest('/auth/login', 'POST', TOURNAMENT_ADMIN_CREDENTIALS);
  const token = login.token as string;

  const response = await apiRequest('/phases/promote-lucky-loser', 'POST', {
    withdrawnParticipantId: withdrawCandidate.participantId,
    phaseId: phase.id,
    tournamentId,
    categoryId,
  }, token);

  const updatedWithdrawn = await registrationRepository.findOne({where: {id: withdrawCandidate.id}});
  const promoted = await registrationRepository.findOne({where: {participantId: response.promotedParticipantId, tournamentId, categoryId}});

  const statusOk = updatedWithdrawn?.status === RegistrationStatus.WITHDRAWN;
  const typeOk = updatedWithdrawn?.acceptanceType === AcceptanceType.WITHDRAWN;
  const promotedOk = promoted?.acceptanceType === AcceptanceType.LUCKY_LOSER;

  console.log('=== Lucky Loser Verification ===');
  console.log(`Tournament: ${tournamentId}`);
  console.log(`Withdrawn participant: ${withdrawCandidate.participantId}`);
  console.log(`Promoted participant: ${response.promotedParticipantId}`);
  console.log(`Withdrawn status set: ${statusOk}`);
  console.log(`Withdrawn acceptanceType set: ${typeOk}`);
  console.log(`Promotion acceptanceType set: ${promotedOk}`);
  console.log(`Integrity status: ${statusOk && typeOk && promotedOk ? 'PASS' : 'FAIL'}`);

  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
