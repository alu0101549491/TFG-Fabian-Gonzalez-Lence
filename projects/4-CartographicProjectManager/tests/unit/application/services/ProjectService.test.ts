import {
  ProjectService,
} from '../../../../src/application/services/implementations/ProjectService';
import {
  IProjectRepository,
} from '../../../../src/domain/repositories/IProjectRepository';

describe('ProjectService', () => {
  let service: ProjectService;
  let mockProjectRepository: jest.Mocked<IProjectRepository>;

  beforeEach(() => {
    mockProjectRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findByClientId: jest.fn(),
      findBySpecialUserId: jest.fn(),
      findAll: jest.fn(),
    };
    service = new ProjectService(mockProjectRepository);
  });

  describe('createProject', () => {
    it('should be defined', () => {
      expect(service.createProject).toBeDefined();
    });
  });

  describe('getProjectsByUser', () => {
    it('should be defined', () => {
      expect(service.getProjectsByUser).toBeDefined();
    });
  });

  describe('finalizeProject', () => {
    it('should be defined', () => {
      expect(service.finalizeProject).toBeDefined();
    });
  });
});
