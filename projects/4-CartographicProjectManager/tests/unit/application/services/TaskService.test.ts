import {
  TaskService,
} from '../../../../src/application/services/implementations/TaskService';
import {
  ITaskRepository,
} from '../../../../src/domain/repositories/ITaskRepository';

describe('TaskService', () => {
  let service: TaskService;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByProjectId: jest.fn(),
      findByAssigneeId: jest.fn(),
    };
    service = new TaskService(mockTaskRepository);
  });

  describe('createTask', () => {
    it('should be defined', () => {
      expect(service.createTask).toBeDefined();
    });
  });

  describe('deleteTask', () => {
    it('should be defined', () => {
      expect(service.deleteTask).toBeDefined();
    });
  });

  describe('getTasksByProject', () => {
    it('should be defined', () => {
      expect(service.getTasksByProject).toBeDefined();
    });
  });
});
