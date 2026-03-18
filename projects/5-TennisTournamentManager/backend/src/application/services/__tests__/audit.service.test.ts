/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 18, 2026
 * @file application/services/__tests__/audit.service.test.ts
 * @desc Unit tests for AuditService (NFR22 - 70% coverage requirement)
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 * @see {@link https://typescripttutorial.net}
 */

import {Repository} from 'typeorm';
import {Request} from 'express';
import {AuditService, CreateAuditLogData, AuditLogFilters} from '../audit.service';
import {AuditLog} from '../../../domain/entities/audit-log.entity';
import {AuditAction} from '../../../domain/enumerations/audit-action';
import {AuditResourceType} from '../../../domain/enumerations/audit-resource-type';

/**
 * Mock TypeORM Repository for AuditLog
 */
const createMockRepository = (): jest.Mocked<Repository<AuditLog>> => {
  const mockQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(0),
  };

  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  } as unknown as jest.Mocked<Repository<AuditLog>>;
};

/**
 * Mock Express Request object
 */
const createMockRequest = (overrides?: Partial<Request>): Partial<Request> => ({
  headers: {
    'user-agent': 'Mozilla/5.0 Test Browser',
    'x-forwarded-for': '192.168.1.100',
  },
  ip: '127.0.0.1',
  socket: {
    remoteAddress: '127.0.0.1',
  } as any,
  ...overrides,
});

describe('AuditService', () => {
  let auditService: AuditService;
  let mockRepository: jest.Mocked<Repository<AuditLog>>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    auditService = new AuditService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log() - Core Method', () => {
    it('should create and save a generic audit log', async () => {
      const logData: CreateAuditLogData = {
        userId: 'user-123',
        action: AuditAction.LOGIN,
        resourceType: AuditResourceType.AUTHENTICATION,
        resourceId: 'user-123',
        resourceName: 'test@example.com',
        details: 'Login successful',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      };

      const createdLog = {id: 'log-123', ...logData, timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      const result = await auditService.log(logData);

      expect(mockRepository.create).toHaveBeenCalledWith(logData);
      expect(mockRepository.save).toHaveBeenCalledWith(createdLog);
      expect(result).toEqual(createdLog);
    });

    it('should handle null/undefined fields', async () => {
      const logData: CreateAuditLogData = {
        action: AuditAction.CREATE,
        resourceType: AuditResourceType.TOURNAMENT,
        userId: null,
        resourceId: null,
        resourceName: null,
        oldValue: null,
        newValue: null,
        ipAddress: null,
        userAgent: null,
        details: null,
      };

      const createdLog = {id: 'log-456', ...logData, timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      const result = await auditService.log(logData);
      expect(result).toEqual(createdLog);
    });
  });

  describe('Authentication Logging', () => {
    it('logLogin() - should log successful login with IP extraction', async () => {
      const userId = 'user-123';
      const username = 'john@example.com';
      const req = createMockRequest() as Request;
      const createdLog = {id: 'log-login', timestamp: new Date()} as AuditLog;

      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logLogin(userId, username, req);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        action: AuditAction.LOGIN,
        resourceType: AuditResourceType.AUTHENTICATION,
        resourceName: username,
        details: `User "${username}" logged in`,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('logLogin() - should work without request object', async () => {
      const createdLog = {id: 'log-2', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logLogin('user-456', 'jane@example.com');

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: undefined,
          userAgent: undefined,
        })
      );
    });

    it('logLogout() - should log user logout', async () => {
      const createdLog = {id: 'log-3', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logLogout('user-789', 'admin@example.com', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.LOGOUT,
          resourceType: AuditResourceType.AUTHENTICATION,
          details: expect.stringContaining('logged out'),
        })
      );
    });

    it('logPasswordChange() - should log password change', async () => {
      const createdLog = {id: 'log-4', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logPasswordChange('user-999', 'secure@example.com', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.PASSWORD_CHANGE,
          details: expect.stringContaining('changed password'),
        })
      );
    });
  });

  describe('Match Result Logging (Critical Business Logic)', () => {
    it('logResultSubmission() - should log result with score', async () => {
      const createdLog = {id: 'log-5', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logResultSubmission(
        'player-123',
        'match-456',
        'QF1: Player A vs Player B',
        '6-4, 7-5',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.RESULT_SUBMIT,
          resourceType: AuditResourceType.MATCH_RESULT,
          resourceId: 'match-456',
          newValue: '6-4, 7-5',
        })
      );
    });

    it('logResultConfirmation() - should log opponent confirmation', async () => {
      const createdLog = {id: 'log-6', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logResultConfirmation('player-789', 'result-111', 'SF1: Match', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.RESULT_CONFIRM,
          details: expect.stringContaining('confirmed'),
        })
      );
    });

    it('logResultDispute() - should log dispute with reason', async () => {
      const createdLog = {id: 'log-7', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logResultDispute(
        'player-222',
        'result-333',
        'Final: Match',
        'Score incorrect',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.RESULT_DISPUTE,
          details: expect.stringContaining('disputed'),
        })
      );
    });

    it('logResultValidation() - should log admin validation', async () => {
      const createdLog = {id: 'log-8', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logResultValidation('admin-001', 'result-444', 'R1: Match', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.RESULT_VALIDATE,
          details: expect.stringContaining('Admin validated'),
        })
      );
    });

    it('logResultAnnulment() - should log annulment with reason', async () => {
      const createdLog = {id: 'log-9', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logResultAnnulment(
        'admin-002',
        'result-555',
        'QF2: Match',
        'Wrong court',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.RESULT_ANNUL,
          details: expect.stringContaining('annulled'),
        })
      );
    });
  });

  describe('Match Operations', () => {
    it('logScoreUpdate() - should log score changes', async () => {
      const createdLog = {id: 'log-10', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logScoreUpdate(
        'umpire-001',
        'match-789',
        'Court 1: Match',
        '4-4',
        '5-4',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.SCORE_UPDATE,
          oldValue: '4-4',
          newValue: '5-4',
        })
      );
    });

    it('logMatchStateChange() - should log state transitions', async () => {
      const createdLog = {id: 'log-11', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logMatchStateChange(
        'admin-003',
        'match-999',
        'SF2: Match',
        'SCHEDULED',
        'IN_PROGRESS',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.STATE_CHANGE,
          oldValue: 'SCHEDULED',
          newValue: 'IN_PROGRESS',
        })
      );
    });
  });

  describe('Tournament Logging', () => {
    it('logTournamentCreation() - should log creation', async () => {
      const createdLog = {id: 'log-12', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logTournamentCreation('organizer-001', 'tournament-123', 'Spring Championship 2026', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.CREATE,
          resourceType: AuditResourceType.TOURNAMENT,
        })
      );
    });

    it('logTournamentUpdate() - should log update with old/new values', async () => {
      const createdLog = {id: 'log-13', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logTournamentUpdate(
        'organizer-002',
        'tournament-456',
        'Summer Open',
        '{"deadline":"2026-05-01"}',
        '{"deadline":"2026-05-15"}',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.UPDATE,
          oldValue: '{"deadline":"2026-05-01"}',
          newValue: '{"deadline":"2026-05-15"}',
        })
      );
    });

    it('logTournamentDeletion() - should log deletion', async () => {
      const createdLog = {id: 'log-14', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logTournamentDeletion('admin-004', 'tournament-789', 'Cancelled Event', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.DELETE,
          details: expect.stringContaining('deleted'),
        })
      );
    });

    it('logTournamentStatusChange() - should log status change', async () => {
      const createdLog = {id: 'log-15', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logTournamentStatusChange(
        'organizer-003',
        'tournament-111',
        'Winter Cup',
        'REGISTRATION_OPEN',
        'IN_PROGRESS',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.STATUS_CHANGE,
          oldValue: 'REGISTRATION_OPEN',
          newValue: 'IN_PROGRESS',
        })
      );
    });

    it('logTournamentFinalization() - should log finalization', async () => {
      const createdLog = {id: 'log-16', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logTournamentFinalization('organizer-004', 'tournament-222', 'Autumn Challenge', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.FINALIZE,
          details: expect.stringContaining('finalized'),
        })
      );
    });
  });

  describe('Bracket, Registration, Permission Logging', () => {
    it('logBracketGeneration() - should log draw generation', async () => {
      const createdLog = {id: 'log-17', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logBracketGeneration(
        'organizer-005',
        'bracket-333',
        'Spring Championship',
        'SINGLE_ELIMINATION',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.BRACKET_GENERATE,
          resourceType: AuditResourceType.BRACKET,
        })
      );
    });

    it('logRegistrationApproval() - should log approval', async () => {
      const createdLog = {id: 'log-18', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logRegistrationApproval(
        'admin-005',
        'reg-444',
        'Novak Djokovic',
        'Spring Championship',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.REGISTRATION_APPROVE,
          details: expect.stringContaining('approved'),
        })
      );
    });

    it('logRegistrationRejection() - should log rejection with reason', async () => {
      const createdLog = {id: 'log-19', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logRegistrationRejection(
        'admin-006',
        'reg-555',
        'John Smith',
        'Summer Open',
        'Does not meet ranking requirements',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.REGISTRATION_REJECT,
          details: expect.stringContaining('rejected'),
        })
      );
    });

    it('logRoleChange() - should log permission changes', async () => {
      const createdLog = {id: 'log-20', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logRoleChange(
        'admin-007',
        'user-666',
        'promoted@example.com',
        'PLAYER',
        'ORGANIZER',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.ROLE_CHANGE,
          resourceType: AuditResourceType.PERMISSION,
          oldValue: 'PLAYER',
          newValue: 'ORGANIZER',
        })
      );
    });

    it('logUserCreation() - should log user creation', async () => {
      const createdLog = {id: 'log-21', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logUserCreation('admin-008', 'user-777', 'newuser@example.com', 'PLAYER', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.CREATE,
          resourceType: AuditResourceType.USER,
          newValue: 'PLAYER',
        })
      );
    });

    it('logUserDeletion() - should log user deletion', async () => {
      const createdLog = {id: 'log-22', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logUserDeletion('admin-009', 'user-888', 'deleted@example.com', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.DELETE,
          resourceType: AuditResourceType.USER,
        })
      );
    });
  });

  describe('GDPR and Announcement Logging', () => {
    it('logDataExport() - should log GDPR export', async () => {
      const createdLog = {id: 'log-23', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logDataExport('user-999', 'gdpr@example.com', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.DATA_EXPORT,
          resourceType: AuditResourceType.GDPR,
        })
      );
    });

    it('logDataDeletion() - should log GDPR deletion', async () => {
      const createdLog = {id: 'log-24', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logDataDeletion('user-1010', 'forgetme@example.com', createMockRequest() as Request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.DATA_DELETE,
          details: expect.stringContaining('GDPR'),
        })
      );
    });

    it('logAnnouncementPublication() - should log announcement', async () => {
      const createdLog = {id: 'log-25', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logAnnouncementPublication(
        'organizer-006',
        'announce-111',
        'Tournament Schedule Updated',
        createMockRequest() as Request
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.PUBLISH,
          resourceType: AuditResourceType.ANNOUNCEMENT,
        })
      );
    });
  });

  describe('Query Methods', () => {
    it('find() - should query audit logs with filters using query builder', async () => {
      const filters: AuditLogFilters = {
        userId: 'user-123',
        action: AuditAction.LOGIN,
        limit: 50,
        offset: 0,
      };

      const mockLogs = [
        {id: 'log-1', action: AuditAction.LOGIN, timestamp: new Date()},
        {id: 'log-2', action: AuditAction.LOGIN, timestamp: new Date()},
      ] as AuditLog[];

      const mockQueryBuilder: any = mockRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockLogs);

      const result = await auditService.find(filters);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(mockLogs);
      expect(result).toHaveLength(2);
    });

    it('find() - should handle empty filters', async () => {
const filters: AuditLogFilters = {};
      const mockQueryBuilder: any = mockRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await auditService.find(filters);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('count() - should count matching audit logs using query builder', async () => {
      const filters: AuditLogFilters = {
        action: AuditAction.RESULT_SUBMIT,
      };

      const mockQueryBuilder: any = mockRepository.createQueryBuilder();
      mockQueryBuilder.getCount.mockResolvedValue(42);

      const result = await auditService.count(filters);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toBe(42);
    });

    it('count() - should return 0 for no matches', async () => {
      const filters: AuditLogFilters = {userId: 'nonexistent-user'};
      const mockQueryBuilder: any = mockRepository.createQueryBuilder();
      mockQueryBuilder.getCount.mockResolvedValue(0);

      const result = await auditService.count(filters);

      expect(result).toBe(0);
    });

    it('findById() - should retrieve audit log by ID', async () => {
      const logId = 'log-specific-123';
      const mockLog = {
        id: logId,
        action: AuditAction.CREATE,
        timestamp: new Date(),
      } as AuditLog;

      mockRepository.findOne.mockResolvedValue(mockLog);

      const result = await auditService.findById(logId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {id: logId},
        relations: ['user'],
      });
      expect(result).toEqual(mockLog);
    });

    it('findById() - should return null for non-existent ID', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await auditService.findById('non-existent-log');

      expect(result).toBeNull();
    });

    it('deleteOlderThan() - should delete old audit logs', async () => {
      const cutoffDate = new Date('2025-01-01');
      
      const mockDeleteQueryBuilder: any = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({affected: 150}),
      };
      
      mockRepository.createQueryBuilder = jest.fn(() => mockDeleteQueryBuilder);

      const result = await auditService.deleteOlderThan(cutoffDate);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockDeleteQueryBuilder.delete).toHaveBeenCalled();
      expect(mockDeleteQueryBuilder.where).toHaveBeenCalled();
      expect(mockDeleteQueryBuilder.execute).toHaveBeenCalled();
      expect(result).toBe(150);
    });

    it('deleteOlderThan() - should return 0 when no logs deleted', async () => {
      const cutoffDate = new Date('2020-01-01');
      
      const mockDeleteQueryBuilder: any = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({affected: 0}),
      };
      
      mockRepository.createQueryBuilder = jest.fn(() => mockDeleteQueryBuilder);

      const result = await auditService.deleteOlderThan(cutoffDate);

      expect(result).toBe(0);
    });
  });

  describe('IP Address Extraction (getIpAddress helper)', () => {
    it('should extract IP from X-Forwarded-For header (single IP)', async () => {
      const req = createMockRequest({
        headers: {'x-forwarded-for': '203.0.113.45', 'user-agent': 'Test'},
      }) as Request;

      const createdLog = {id: 'log-ip', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      await auditService.logLogin('user-001', 'test@example.com', req);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '203.0.113.45',
        })
      );
    });

    it('should extract first IP from X-Forwarded-For (multiple IPs)', async () => {
      const req = createMockRequest({
        headers: {
          'x-forwarded-for': '198.51.100.25, 192.0.2.1, 10.0.0.1',
          'user-agent': 'Test',
        },
      }) as Request;

      mockRepository.create.mockReturnValue({id: 'log-ip2', timestamp: new Date()} as AuditLog);
      mockRepository.save.mockResolvedValue({id: 'log-ip2'} as AuditLog);

      await auditService.logLogin('user-002', 'test2@example.com', req);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '198.51.100.25', // First IP in chain
        })
      );
    });

    it('should fallback to req.ip when X-Forwarded-For not present', async () => {
      const req = createMockRequest({
        headers: {'user-agent': 'Test'},
        ip: '192.168.1.50',
      }) as Request;

      delete (req.headers as any)['x-forwarded-for'];

      mockRepository.create.mockReturnValue({id: 'log-ip3', timestamp: new Date()} as AuditLog);
      mockRepository.save.mockResolvedValue({id: 'log-ip3'} as AuditLog);

      await auditService.logLogin('user-003', 'test3@example.com', req);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.50',
        })
      );
    });

    it('should fallback to socket.remoteAddress when req.ip unavailable', async () => {
      const req = createMockRequest({
        headers: {'user-agent': 'Test'},
        ip: undefined,
        socket: {remoteAddress: '10.0.0.100'} as any,
      }) as Request;

      delete (req.headers as any)['x-forwarded-for'];

      mockRepository.create.mockReturnValue({id: 'log-ip4', timestamp: new Date()} as AuditLog);
      mockRepository.save.mockResolvedValue({id: 'log-ip4'} as AuditLog);

      await auditService.logLogin('user-004', 'test4@example.com', req);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '10.0.0.100',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle repository creation failure', async () => {
      const logData: CreateAuditLogData = {
        action: AuditAction.LOGIN,
        resourceType: AuditResourceType.AUTHENTICATION,
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(auditService.log(logData)).rejects.toThrow('Database connection failed');
    });

    it('should handle repository save failure', async () => {
      const logData: CreateAuditLogData = {
        action: AuditAction.LOGOUT,
        resourceType: AuditResourceType.AUTHENTICATION,
      };

      const createdLog = {id: 'log-fail', timestamp: new Date()} as AuditLog;
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockRejectedValue(new Error('Write failed'));

      await expect(auditService.log(logData)).rejects.toThrow('Write failed');
    });
  });
});
