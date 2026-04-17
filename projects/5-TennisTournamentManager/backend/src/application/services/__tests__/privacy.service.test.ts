/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 17, 2026
 * @file backend/src/application/services/__tests__/privacy.service.test.ts
 * @desc Unit tests for PrivacyService critical permission and visibility workflows.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

jest.mock('../../../infrastructure/database/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

import {PrivacyService} from '../privacy.service';
import {AppDataSource} from '../../../infrastructure/database/data-source';
import {PrivacyLevel} from '../../../domain/enumerations/privacy-level';
import {UserRole} from '../../../domain/enumerations/user-role';
import {Registration} from '../../../domain/entities/registration.entity';
import {Tournament} from '../../../domain/entities/tournament.entity';
import {User} from '../../../domain/entities/user.entity';

const createUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  username: 'player1',
  email: 'player1@example.com',
  passwordHash: 'hashed-password',
  firstName: 'Player',
  lastName: 'One',
  role: UserRole.PLAYER,
  isActive: true,
  phone: '600000000',
  avatarUrl: 'https://example.com/avatar.png',
  idDocument: '12345678A',
  ranking: 1250,
  gdprConsent: true,
  isGuest: false,
  privacySettings: {
    email: PrivacyLevel.ALL_REGISTERED,
    phone: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
    telegram: PrivacyLevel.ADMINS_ONLY,
    whatsapp: PrivacyLevel.ADMINS_ONLY,
    avatar: PrivacyLevel.PUBLIC,
    ranking: PrivacyLevel.ALL_REGISTERED,
    history: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
    statistics: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
    idDocument: PrivacyLevel.ADMINS_ONLY,
    allowContact: true,
  },
  telegram: 'player1telegram',
  whatsapp: '600000001',
  telegramChatId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  lastLogin: null,
  organizedTournaments: [],
  registrations: [],
  notifications: [],
  ...overrides,
}) as User;

describe('PrivacyService', () => {
  let service: PrivacyService;
  let registrationRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let tournamentRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(() => {
    registrationRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    tournamentRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Registration) {
        return registrationRepository;
      }
      if (entity === Tournament) {
        return tournamentRepository;
      }
      throw new Error(`Unexpected repository request for ${String(entity)}`);
    });

    service = new PrivacyService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns full owner data except the password hash', async () => {
    const owner = createUser();

    const filtered = await service.filterUserData(owner, createUser({id: owner.id}));

    expect(filtered).toMatchObject({
      id: owner.id,
      email: owner.email,
      phone: owner.phone,
      idDocument: owner.idDocument,
    });
    expect(filtered).not.toHaveProperty('passwordHash');
  });

  it('grants system administrators full access without exposing the password hash', async () => {
    const owner = createUser();
    const admin = createUser({id: 'admin-1', role: UserRole.SYSTEM_ADMIN});

    const filtered = await service.filterUserData(owner, admin);

    expect(filtered.email).toBe(owner.email);
    expect(filtered.idDocument).toBe(owner.idDocument);
    expect(filtered).not.toHaveProperty('passwordHash');
  });

  it('grants tournament administrators access when they manage the requested tournament', async () => {
    const owner = createUser();
    const admin = createUser({id: 'admin-2', role: UserRole.TOURNAMENT_ADMIN});
    tournamentRepository.findOne.mockResolvedValue({id: 'tournament-1', organizerId: admin.id});

    const filtered = await service.filterUserData(owner, admin, 'tournament-1');

    expect(tournamentRepository.findOne).toHaveBeenCalledWith({
      where: {id: 'tournament-1', organizerId: admin.id},
    });
    expect(filtered.phone).toBe(owner.phone);
    expect(filtered.idDocument).toBe(owner.idDocument);
  });

  it('shows same-tournament participants tournament-scoped fields but still hides admin-only data', async () => {
    const owner = createUser();
    const viewer = createUser({id: 'player-2', username: 'player2'});
    registrationRepository.find
      .mockResolvedValueOnce([{tournamentId: 'tournament-2'}])
      .mockResolvedValueOnce([{tournamentId: 'tournament-2'}]);

    const filtered = await service.filterUserData(owner, viewer, 'tournament-2');

    expect(filtered.phone).toBe(owner.phone);
    expect(filtered.email).toBe(owner.email);
    expect(filtered.idDocument).toBeUndefined();
  });

  it('hides tournament-participant fields from unrelated authenticated users', async () => {
    const owner = createUser();
    const viewer = createUser({id: 'player-3', username: 'outsider'});
    registrationRepository.find
      .mockResolvedValueOnce([{tournamentId: 'tournament-a'}])
      .mockResolvedValueOnce([{tournamentId: 'tournament-b'}]);

    const filtered = await service.filterUserData(owner, viewer);

    expect(filtered.email).toBe(owner.email);
    expect(filtered.ranking).toBe(owner.ranking);
    expect(filtered.phone).toBeUndefined();
    expect(filtered.idDocument).toBeUndefined();
  });

  it('limits unauthenticated viewers to explicitly public fields', async () => {
    const owner = createUser();

    const filtered = await service.filterUserData(owner, null);

    expect(filtered.avatarUrl).toBe(owner.avatarUrl);
    expect(filtered.email).toBeUndefined();
    expect(filtered.ranking).toBeUndefined();
    expect(filtered.phone).toBeUndefined();
  });

  it('grants tournament-admin access when the owner is registered in one of their tournaments', async () => {
    const owner = createUser({id: 'owner-2'});
    const admin = createUser({id: 'admin-3', role: UserRole.TOURNAMENT_ADMIN});
    tournamentRepository.find.mockResolvedValue([{id: 'managed-1'}]);
    registrationRepository.findOne.mockResolvedValue({participantId: owner.id, tournamentId: 'managed-1'});

    const filtered = await service.filterUserData(owner, admin);

    expect(tournamentRepository.find).toHaveBeenCalledWith({
      where: {organizerId: admin.id},
      select: ['id'],
    });
    expect(filtered.phone).toBe(owner.phone);
    expect(filtered.idDocument).toBe(owner.idDocument);
  });

  it('returns a defensive copy of default settings', () => {
    const defaults = PrivacyService.getDefaultSettings();
    defaults.email = 'MUTATED';

    expect(PrivacyService.getDefaultSettings()).toMatchObject({
      email: PrivacyLevel.ADMINS_ONLY,
      avatar: PrivacyLevel.ALL_REGISTERED,
      allowContact: true,
    });
  });
});