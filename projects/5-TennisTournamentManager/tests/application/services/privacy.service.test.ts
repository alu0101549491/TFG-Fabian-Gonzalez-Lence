/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 5, 2026
 * @file tests/application/services/privacy.service.test.ts
 * @desc Unit tests for PrivacyService - privacy enforcement and field filtering
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {PrivacyService} from '@application/services/privacy.service';
import {User} from '@domain/entities/user';
import {UserRole} from '@domain/enumerations/user-role';
import {PrivacyLevel} from '@domain/enumerations/privacy-level';
import {PrivacySettings} from '@domain/value-objects/privacy-settings';
import {Registration} from '@domain/entities/registration';

describe('PrivacyService', () => {
  let service: PrivacyService;
  let mockRegistrationRepository: {
    findByParticipantId: jest.Mock;
  };

  // Test users
  let publicUser: User | null;
  let registeredUser: User;
  let tournamentParticipant: User;
  let systemAdmin: User;
  let tournamentAdmin: User;
  let profileOwner: User;

  // Test data
  const tournamentId = 'tournament-123';

  beforeEach(() => {
    // Create mock registration repository
    mockRegistrationRepository = {
      findByParticipantId: jest.fn(),
    };

    // Manually instantiate service with mocked dependency
    service = new PrivacyService();
    // Inject mock repository by accessing private field
    (service as any).registrationRepository = mockRegistrationRepository;

    // Initialize test users
    publicUser = null;

    registeredUser = new User({
      id: 'user-registered',
      username: 'registered',
      email: 'registered@test.com',
      firstName: 'Registered',
      lastName: 'User',
      password: 'hashed',
      role: UserRole.PLAYER,
      active: true,
      privacySettings: PrivacySettings.createDefault(),
    });

    tournamentParticipant = new User({
      id: 'user-participant',
      username: 'participant',
      email: 'participant@test.com',
      firstName: 'Tournament',
      lastName: 'Participant',
      password: 'hashed',
      role: UserRole.PLAYER,
      active: true,
      privacySettings: PrivacySettings.createDefault(),
    });

    systemAdmin = new User({
      id: 'user-sysadmin',
      username: 'sysadmin',
      email: 'admin@test.com',
      firstName: 'System',
      lastName: 'Admin',
      password: 'hashed',
      role: UserRole.SYSTEM_ADMIN,
      active: true,
      privacySettings: PrivacySettings.createDefault(),
    });

    tournamentAdmin = new User({
      id: 'user-tadmin',
      username: 'tadmin',
      email: 'tadmin@test.com',
      firstName: 'Tournament',
      lastName: 'Admin',
      password: 'hashed',
      role: UserRole.TOURNAMENT_ADMIN,
      active: true,
      privacySettings: PrivacySettings.createDefault(),
    });

    profileOwner = new User({
      id: 'user-owner',
      username: 'owner',
      email: 'owner@test.com',
      firstName: 'Profile',
      lastName: 'Owner',
      password: 'hashed',
      role: UserRole.PLAYER,
      active: true,
      phone: '+34600000000',
      telegram: '@owner',
      whatsapp: '+34600000000',
      ranking: 100,
      privacySettings: new PrivacySettings({
        email: PrivacyLevel.ADMINS_ONLY,
        phone: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
        telegram: PrivacyLevel.ALL_REGISTERED,
        whatsapp: PrivacyLevel.PUBLIC,
        avatar: PrivacyLevel.PUBLIC,
        ranking: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
        history: PrivacyLevel.ALL_REGISTERED,
        statistics: PrivacyLevel.ALL_REGISTERED,
        allowContact: true,
      }),
    });
  });

  describe('Privacy Level: PUBLIC', () => {
    it('should allow public users to view PUBLIC fields', async () => {
      const result = await service.canViewField('whatsapp', {
        viewer: publicUser,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.PUBLIC);
    });

    it('should allow registered users to view PUBLIC fields', async () => {
      const result = await service.canViewField('avatar', {
        viewer: registeredUser,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.PUBLIC);
    });

    it('should allow admins to view PUBLIC fields', async () => {
      const result = await service.canViewField('avatar', {
        viewer: systemAdmin,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.PUBLIC);
    });
  });

  describe('Privacy Level: ALL_REGISTERED', () => {
    it('should deny public users access to ALL_REGISTERED fields', async () => {
      const result = await service.canViewField('telegram', {
        viewer: publicUser,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('ALL_REGISTERED');
      expect(result.level).toBe(PrivacyLevel.ALL_REGISTERED);
    });

    it('should allow registered users to view ALL_REGISTERED fields', async () => {
      const result = await service.canViewField('history', {
        viewer: registeredUser,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.ALL_REGISTERED);
    });

    it('should allow tournament participants to view ALL_REGISTERED fields', async () => {
      const result = await service.canViewField('statistics', {
        viewer: tournamentParticipant,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.ALL_REGISTERED);
    });

    it('should allow admins to view ALL_REGISTERED fields', async () => {
      const result = await service.canViewField('telegram', {
        viewer: tournamentAdmin,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.ALL_REGISTERED);
    });
  });

  describe('Privacy Level: TOURNAMENT_PARTICIPANTS', () => {
    beforeEach(() => {
      // Mock tournament participation
      const ownerRegistrations: Registration[] = [
        {
          id: 'reg-owner',
          tournamentId: tournamentId,
          participantId: profileOwner.id,
        } as Registration,
      ];

      const participantRegistrations: Registration[] = [
        {
          id: 'reg-participant',
          tournamentId: tournamentId,
          participantId: tournamentParticipant.id,
        } as Registration,
      ];

      mockRegistrationRepository.findByParticipantId.mockImplementation((userId: string) => {
        if (userId === profileOwner.id) {
          return Promise.resolve(ownerRegistrations);
        }
        if (userId === tournamentParticipant.id) {
          return Promise.resolve(participantRegistrations);
        }
        return Promise.resolve([]);
      });
    });

    it('should deny public users access to TOURNAMENT_PARTICIPANTS fields', async () => {
      const result = await service.canViewField('phone', {
        viewer: publicUser,
        owner: profileOwner,
        tournamentId,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('TOURNAMENT_PARTICIPANTS');
    });

    it('should deny non-participant registered users access to TOURNAMENT_PARTICIPANTS fields', async () => {
      const result = await service.canViewField('ranking', {
        viewer: registeredUser,
        owner: profileOwner,
        tournamentId,
      });

      expect(result.allowed).toBe(false);
      expect(mockRegistrationRepository.findByParticipantId).toHaveBeenCalled();
    });

    it('should allow same tournament participants to view TOURNAMENT_PARTICIPANTS fields', async () => {
      const result = await service.canViewField('phone', {
        viewer: tournamentParticipant,
        owner: profileOwner,
        tournamentId,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.TOURNAMENT_PARTICIPANTS);
      expect(mockRegistrationRepository.findByParticipantId).toHaveBeenCalledTimes(2);
    });

    it('should allow admins to view TOURNAMENT_PARTICIPANTS fields', async () => {
      const result = await service.canViewField('phone', {
        viewer: systemAdmin,
        owner: profileOwner,
        tournamentId,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.TOURNAMENT_PARTICIPANTS);
      // Admins bypass tournament check
      expect(mockRegistrationRepository.findByParticipantId).not.toHaveBeenCalled();
    });
  });

  describe('Privacy Level: ADMINS_ONLY', () => {
    it('should deny public users access to ADMINS_ONLY fields', async () => {
      const result = await service.canViewField('email', {
        viewer: publicUser,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('ADMINS_ONLY');
    });

    it('should deny registered users access to ADMINS_ONLY fields', async () => {
      const result = await service.canViewField('email', {
        viewer: registeredUser,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(false);
    });

    it('should deny tournament participants access to ADMINS_ONLY fields', async () => {
      const result = await service.canViewField('email', {
        viewer: tournamentParticipant,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(false);
    });

    it('should allow system admins to view ADMINS_ONLY fields', async () => {
      const result = await service.canViewField('email', {
        viewer: systemAdmin,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.ADMINS_ONLY);
    });

    it('should allow tournament admins to view ADMINS_ONLY fields', async () => {
      const result = await service.canViewField('email', {
        viewer: tournamentAdmin,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
      expect(result.level).toBe(PrivacyLevel.ADMINS_ONLY);
    });
  });

  describe('Profile Owner Access', () => {
    it('should always allow owner to view their own ADMINS_ONLY fields', async () => {
      const result = await service.canViewField('email', {
        viewer: profileOwner,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
    });

    it('should always allow owner to view their own TOURNAMENT_PARTICIPANTS fields', async () => {
      const result = await service.canViewField('phone', {
        viewer: profileOwner,
        owner: profileOwner,
      });

      expect(result.allowed).toBe(true);
    });

    it('should always allow owner to view all their own fields', async () => {
      const fields: Array<keyof PrivacySettings> = [
        'email', 'phone', 'telegram', 'whatsapp',
        'avatar', 'ranking', 'history', 'statistics'
      ];

      for (const field of fields) {
        const result = await service.canViewField(field, {
          viewer: profileOwner,
          owner: profileOwner,
        });

        expect(result.allowed).toBe(true); // Field: ${field}
      }
    });
  });

  describe('User DTO Filtering', () => {
    const fullUserDto = {
      id: 'user-owner',
      username: 'owner',
      firstName: 'Profile',
      lastName: 'Owner',
      email: 'owner@test.com',
      phone: '+34600000000',
      telegram: '@owner',
      whatsapp: '+34600000000',
      avatar: 'avatar.jpg',
      ranking: 100,
      history: ['match1', 'match2'],
      statistics: {wins: 10, losses: 5},
    };

    it('should filter all private fields for public users', async () => {
      const filtered = await service.filterUserDto(
        fullUserDto,
        publicUser,
        profileOwner
      );

      expect(filtered.id).toBe('user-owner');
      expect(filtered.username).toBe('owner');
      expect(filtered.firstName).toBe('Profile');
      expect(filtered.lastName).toBe('Owner');
      // PUBLIC fields included
      expect(filtered.whatsapp).toBe('+34600000000');
      expect(filtered.avatar).toBe('avatar.jpg');
      // ALL_REGISTERED fields excluded
      expect(filtered.telegram).toBeUndefined();
      expect(filtered.history).toBeUndefined();
      expect(filtered.statistics).toBeUndefined();
      // TOURNAMENT_PARTICIPANTS fields excluded
      expect(filtered.phone).toBeUndefined();
      expect(filtered.ranking).toBeUndefined();
      // ADMINS_ONLY fields excluded
      expect(filtered.email).toBeUndefined();
    });

    it('should include ALL_REGISTERED fields for registered users', async () => {
      const filtered = await service.filterUserDto(
        fullUserDto,
        registeredUser,
        profileOwner
      );

      expect(filtered.telegram).toBe('@owner');
      expect(filtered.history).toEqual(['match1', 'match2']);
      expect(filtered.statistics).toEqual({wins: 10, losses: 5});
      // But exclude TOURNAMENT_PARTICIPANTS and ADMINS_ONLY
      expect(filtered.phone).toBeUndefined();
      expect(filtered.ranking).toBeUndefined();
      expect(filtered.email).toBeUndefined();
    });

    it('should include TOURNAMENT_PARTICIPANTS fields for same tournament users', async () => {
      // Mock tournament participation
      mockRegistrationRepository.findByParticipantId.mockImplementation((userId: string) => {
        if (userId === profileOwner.id || userId === tournamentParticipant.id) {
          return Promise.resolve([{
            tournamentId: tournamentId,
            participantId: userId,
          } as Registration]);
        }
        return Promise.resolve([]);
      });

      const filtered = await service.filterUserDto(
        fullUserDto,
        tournamentParticipant,
        profileOwner,
        tournamentId
      );

      expect(filtered.phone).toBe('+34600000000');
      expect(filtered.ranking).toBe(100);
      expect(filtered.telegram).toBe('@owner');
      expect(filtered.history).toEqual(['match1', 'match2']);
      // But exclude ADMINS_ONLY
      expect(filtered.email).toBeUndefined();
    });

    it('should include all fields for system admin', async () => {
      const filtered = await service.filterUserDto(
        fullUserDto,
        systemAdmin,
        profileOwner
      );

      expect(filtered.email).toBe('owner@test.com');
      expect(filtered.phone).toBe('+34600000000');
      expect(filtered.telegram).toBe('@owner');
      expect(filtered.whatsapp).toBe('+34600000000');
      expect(filtered.avatar).toBe('avatar.jpg');
      expect(filtered.ranking).toBe(100);
      expect(filtered.history).toEqual(['match1', 'match2']);
      expect(filtered.statistics).toEqual({wins: 10, losses: 5});
    });

    it('should include all fields for profile owner', async () => {
      const filtered = await service.filterUserDto(
        fullUserDto,
        profileOwner,
        profileOwner
      );

      expect(filtered.email).toBe('owner@test.com');
      expect(filtered.phone).toBe('+34600000000');
      expect(filtered.telegram).toBe('@owner');
      expect(Object.keys(filtered).length).toBeGreaterThan(4); // More than just public fields
    });
  });

  describe('Privacy Settings Update', () => {
    it('should update privacy settings with valid values', () => {
      const newSettings = {
        email: PrivacyLevel.PUBLIC,
        phone: PrivacyLevel.ALL_REGISTERED,
      };

      const updated = service.updatePrivacySettings('user-123', newSettings);

      expect(updated.email).toBe(PrivacyLevel.PUBLIC);
      expect(updated.phone).toBe(PrivacyLevel.ALL_REGISTERED);
      // Other fields should have defaults
      expect(updated.telegram).toBe(PrivacyLevel.ADMINS_ONLY);
      expect(updated.avatar).toBe(PrivacyLevel.ALL_REGISTERED);
    });

    it('should throw error for empty user ID', () => {
      expect(() => {
        service.updatePrivacySettings('', {email: PrivacyLevel.PUBLIC});
      }).toThrowError('User ID is required');
    });

    it('should throw error for invalid privacy level', () => {
      expect(() => {
        service.updatePrivacySettings('user-123', {
          email: 'INVALID_LEVEL' as PrivacyLevel,
        });
      }).toThrowError(/Invalid privacy level/);
    });

    it('should allow setting allowContact boolean', () => {
      const updated = service.updatePrivacySettings('user-123', {
        allowContact: false,
      });

      expect(updated.allowContact).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined fields in DTO filtering', async () => {
      const partialDto = {
        id: 'user-owner',
        username: 'owner',
        firstName: 'Profile',
        lastName: 'Owner',
        // email, phone, etc. undefined
      };

      const filtered = await service.filterUserDto(
        partialDto,
        systemAdmin,
        profileOwner
      );

      expect(filtered.email).toBeUndefined();
      expect(filtered.id).toBe('user-owner');
    });

    it('should handle user with no tournament registrations', async () => {
      mockRegistrationRepository.findByParticipantId.mockReturnValue(Promise.resolve([]));

      const result = await service.canViewField('phone', {
        viewer: registeredUser,
        owner: profileOwner,
        tournamentId: 'nonexistent-tournament',
      });

      expect(result.allowed).toBe(false);
    });

    it('should handle checking tournament participation without tournament ID', async () => {
      // Mock users sharing a tournament
      mockRegistrationRepository.findByParticipantId.mockImplementation((userId: string) => {
        if (userId === profileOwner.id || userId === tournamentParticipant.id) {
          return Promise.resolve([{
            tournamentId: 'shared-tournament',
            participantId: userId,
          } as Registration]);
        }
        return Promise.resolve([]);
      });

      const result = await service.canViewField('phone', {
        viewer: tournamentParticipant,
        owner: profileOwner,
        // No tournamentId provided - should check all tournaments
      });

      expect(result.allowed).toBe(true);
    });
  });

  describe('Privacy Levels Hierarchy', () => {
    it('should respect privacy hierarchy: PUBLIC < ALL_REGISTERED < TOURNAMENT_PARTICIPANTS < ADMINS_ONLY', async () => {
      const testUser = new User({
        ...profileOwner,
        privacySettings: new PrivacySettings({
          email: PrivacyLevel.ADMINS_ONLY,
          phone: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
          telegram: PrivacyLevel.ALL_REGISTERED,
          whatsapp: PrivacyLevel.PUBLIC,
        }),
      });

      // Public user can only see PUBLIC
      let result = await service.canViewField('whatsapp', {viewer: publicUser, owner: testUser});
      expect(result.allowed).toBe(true);
      
      result = await service.canViewField('telegram', {viewer: publicUser, owner: testUser});
      expect(result.allowed).toBe(false);

      // Registered user can see PUBLIC + ALL_REGISTERED
      result = await service.canViewField('telegram', {viewer: registeredUser, owner: testUser});
      expect(result.allowed).toBe(true);
      
      result = await service.canViewField('phone', {viewer: registeredUser, owner: testUser});
      expect(result.allowed).toBe(false);

      // Admin can see everything
      result = await service.canViewField('email', {viewer: systemAdmin, owner: testUser});
      expect(result.allowed).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed privacy settings correctly', async () => {
      const mixedSettings = new PrivacySettings({
        email: PrivacyLevel.ADMINS_ONLY,
        phone: PrivacyLevel.ADMINS_ONLY,
        telegram: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
        whatsapp: PrivacyLevel.ALL_REGISTERED,
        avatar: PrivacyLevel.PUBLIC,
        ranking: PrivacyLevel.PUBLIC,
        history: PrivacyLevel.ALL_REGISTERED,
        statistics: PrivacyLevel.TOURNAMENT_PARTICIPANTS,
        allowContact: true,
      });

      const testOwner = new User({
        ...profileOwner,
        privacySettings: mixedSettings,
      });

      const dto = {
        id: testOwner.id,
        username: testOwner.username,
        firstName: testOwner.firstName,
        lastName: testOwner.lastName,
        email: 'test@test.com',
        phone: '+34600000000',
        telegram: '@test',
        whatsapp: '+34600000000',
        avatar: 'avatar.jpg',
        ranking: 50,
        history: ['match1'],
        statistics: {wins: 5},
      };

      // Public user sees only PUBLIC fields
      const publicFiltered = await service.filterUserDto(dto, publicUser, testOwner);
      expect(publicFiltered.avatar).toBe('avatar.jpg');
      expect(publicFiltered.ranking).toBe(50);
      expect(publicFiltered.whatsapp).toBeUndefined(); // ALL_REGISTERED
      expect(publicFiltered.email).toBeUndefined();

      // Registered user sees PUBLIC + ALL_REGISTERED
      const registeredFiltered = await service.filterUserDto(dto, registeredUser, testOwner);
      expect(registeredFiltered.whatsapp).toBe('+34600000000');
      expect(registeredFiltered.history).toEqual(['match1']);
      expect(registeredFiltered.telegram).toBeUndefined(); // TOURNAMENT_PARTICIPANTS
      expect(registeredFiltered.email).toBeUndefined(); // ADMINS_ONLY
    });
  });
});
