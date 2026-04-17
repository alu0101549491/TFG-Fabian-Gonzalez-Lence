/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 17, 2026
 * @file tests/application/services/seeding.service.test.ts
 * @desc Unit tests for the SeedingService.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {SeedingService} from '@application/services/seeding.service';
import {Registration} from '@domain/entities/registration';
import {RegistrationRepositoryImpl} from '@infrastructure/repositories/registration.repository';
import {AcceptanceType} from '@domain/enumerations/acceptance-type';

describe('SeedingService', () => {
  let service: SeedingService;
  let mockRepository: Partial<RegistrationRepositoryImpl>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    // @ts-expect-error - Mocking for testing
    service = new SeedingService();
    // Inject mocked repository
    // @ts-expect-error - Mocking for testing
    service['registrationRepository'] = mockRepository;
  });

  describe('assignSeedNumbers', () => {
    it('should assign seed numbers to top participants', async () => {
      const registrations: Registration[] = [
        new Registration({
          id: 'reg1',
          participantId: 'p1',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 5, // Current ranking
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg2',
          participantId: 'p2',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 2,
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg3',
          participantId: 'p3',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 1,
          createdAt: new Date(),
        }),
      ];

      mockRepository.update = jest.fn().mockImplementation((reg: Registration) => Promise.resolve(reg));

      const result = await service.assignSeedNumbers(registrations, 2);

      expect(result).toHaveLength(3);
      expect(result[0].seedNumber).toBe(1); // Best ranking gets seed 1
      expect(result[1].seedNumber).toBe(2); // Second best gets seed 2
      expect(result[2].seedNumber).toBeNull(); // Third is unseeded
    });

    it('should throw error if numberOfSeeds is less than 1', async () => {
      await expect(service.assignSeedNumbers([], 0)).rejects.toThrow(
        'Number of seeds must be at least 1'
      );
    });

    it('should throw error if not enough participants', async () => {
      const registrations: Registration[] = [
        new Registration({
          id: 'reg1',
          participantId: 'p1',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 1,
          createdAt: new Date(),
        }),
      ];

      await expect(service.assignSeedNumbers(registrations, 5)).rejects.toThrow(
        'Cannot seed 5 participants from 1 registrations'
      );
    });
  });

  describe('calculateSingleEliminationPositions', () => {
    it('should place seeds in strategic positions for 8-player bracket', () => {
      const registrations: Registration[] = [
        new Registration({
          id: 'reg1',
          participantId: 'p1',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 1,
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg2',
          participantId: 'p2',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 2,
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg3',
          participantId: 'p3',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 3,
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg4',
          participantId: 'p4',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 4,
          createdAt: new Date(),
        }),
      ];

      const result = service.calculateSingleEliminationPositions(registrations, 8);

      expect(result).toHaveLength(4);
      
      // Seed 1 at position 1
      expect(result[0].seedNumber).toBe(1);
      expect(result[0].drawPosition).toBe(1);
      
      // Seed 2 at position 8 (opposite half)
      expect(result[1].seedNumber).toBe(2);
      expect(result[1].drawPosition).toBe(8);
      
      // Seeds 3-4 should be in opposite quarters
      const seed3 = result.find((r: {seedNumber: number}) => r.seedNumber === 3);
      const seed4 = result.find((r: {seedNumber: number}) => r.seedNumber === 4);
      expect(seed3).toBeDefined();
      expect(seed4).toBeDefined();
    });

    it('should throw error for non-power-of-2 bracket size', () => {
      const registrations: Registration[] = [
        new Registration({
          id: 'reg1',
          participantId: 'p1',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 1,
          createdAt: new Date(),
        }),
      ];

      expect(() => service.calculateSingleEliminationPositions(registrations, 7)).toThrow(
        'Bracket size must be power of 2, got 7'
      );
    });

    it('should handle bracket with 16 players', () => {
      const registrations: Registration[] = Array.from({length: 8}, (_, i) => 
        new Registration({
          id: `reg${i + 1}`,
          participantId: `p${i + 1}`,
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: i + 1,
          createdAt: new Date(),
        })
      );

      const result = service.calculateSingleEliminationPositions(registrations, 16);

      expect(result).toHaveLength(8);
      expect(result[0].drawPosition).toBe(1); // Seed 1
      expect(result[1].drawPosition).toBe(16); // Seed 2
    });
  });

  describe('calculateRoundRobinGroups', () => {
    it('should distribute seeds across groups using serpentine pattern', () => {
      const registrations: Registration[] = Array.from({length: 8}, (_, i) => 
        new Registration({
          id: `reg${i + 1}`,
          participantId: `p${i + 1}`,
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: i + 1,
          createdAt: new Date(),
        })
      );

      const result = service.calculateRoundRobinGroups(registrations, 4);

      expect(result).toHaveLength(8);
      
      // Seeds 1-4 should go to groups 1-4
      expect(result[0].groupNumber).toBe(1); // Seed 1
      expect(result[1].groupNumber).toBe(2); // Seed 2
      expect(result[2].groupNumber).toBe(3); // Seed 3
      expect(result[3].groupNumber).toBe(4); // Seed 4
      
      // Seeds 5-8 should reverse (serpentine)
      expect(result[4].groupNumber).toBe(4); // Seed 5
      expect(result[5].groupNumber).toBe(3); // Seed 6
      expect(result[6].groupNumber).toBe(2); // Seed 7
      expect(result[7].groupNumber).toBe(1); // Seed 8
    });

    it('should throw error if numberOfGroups is less than 1', () => {
      expect(() => service.calculateRoundRobinGroups([], 0)).toThrow(
        'Number of groups must be at least 1'
      );
    });

    it('should handle 2 groups distribution', () => {
      const registrations: Registration[] = Array.from({length: 4}, (_, i) => 
        new Registration({
          id: `reg${i + 1}`,
          participantId: `p${i + 1}`,
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: i + 1,
          createdAt: new Date(),
        })
      );

      const result = service.calculateRoundRobinGroups(registrations, 2);

      expect(result).toHaveLength(4);
      // Seed 1 → Group 1, Seed 2 → Group 2, Seed 3 → Group 2, Seed 4 → Group 1
      expect(result[0].groupNumber).toBe(1);
      expect(result[1].groupNumber).toBe(2);
      expect(result[2].groupNumber).toBe(2);
      expect(result[3].groupNumber).toBe(1);
    });
  });

  describe('overrideSeed', () => {
    it('should update seed number for a registration', async () => {
      const registration = new Registration({
        id: 'reg1',
        participantId: 'p1',
        tournamentId: 't1',
        categoryId: 'c1',
        acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
        seed: 5,
        createdAt: new Date(),
      });

      mockRepository.findById = jest.fn().mockResolvedValue(registration);
      mockRepository.update = jest.fn().mockImplementation((reg: Registration) => Promise.resolve(reg));

      const result = await service.overrideSeed('reg1', 2);

      expect(result.seedNumber).toBe(2);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should allow unseeding a participant', async () => {
      const registration = new Registration({
        id: 'reg1',
        participantId: 'p1',
        tournamentId: 't1',
        categoryId: 'c1',
        acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
        seedNumber: 3,
        createdAt: new Date(),
      });

      mockRepository.findById = jest.fn().mockResolvedValue(registration);
      mockRepository.update = jest.fn().mockImplementation((reg: Registration) => Promise.resolve(reg));

      const result = await service.overrideSeed('reg1', null);

      expect(result.seedNumber).toBeNull();
    });

    it('should throw error if registration not found', async () => {
      mockRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(service.overrideSeed('invalid', 1)).rejects.toThrow(
        'Registration not found: invalid'
      );
    });
  });

  describe('validateSeeding', () => {
    it('should validate correct seeding', () => {
      const registrations: Registration[] = [
        new Registration({
          id: 'reg1',
          participantId: 'p1',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 1,
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg2',
          participantId: 'p2',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 2,
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg3',
          participantId: 'p3',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: null,
          createdAt: new Date(),
        }),
      ];

      const result = service.validateSeeding(registrations);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate seed numbers', () => {
      const registrations: Registration[] = [
        new Registration({
          id: 'reg1',
          participantId: 'p1',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 1,
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg2',
          participantId: 'p2',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 1, // Duplicate!
          createdAt: new Date(),
        }),
      ];

      const result = service.validateSeeding(registrations);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate seed numbers detected');
    });

    it('should detect seeds not starting at 1', () => {
      const registrations: Registration[] = [
        new Registration({
          id: 'reg1',
          participantId: 'p1',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 2, // Should start at 1!
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg2',
          participantId: 'p2',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 3,
          createdAt: new Date(),
        }),
      ];

      const result = service.validateSeeding(registrations);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Seed numbers should start at 1');
    });

    it('should detect gaps in seed numbering', () => {
      const registrations: Registration[] = [
        new Registration({
          id: 'reg1',
          participantId: 'p1',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 1,
          createdAt: new Date(),
        }),
        new Registration({
          id: 'reg2',
          participantId: 'p2',
          tournamentId: 't1',
          categoryId: 'c1',
          acceptanceType: AcceptanceType.DIRECT_ACCEPTANCE,
          seed: 3, // Gap: missing seed 2!
          createdAt: new Date(),
        }),
      ];

      const result = service.validateSeeding(registrations);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Gap in seed numbering between 1 and 3');
    });
  });
});

