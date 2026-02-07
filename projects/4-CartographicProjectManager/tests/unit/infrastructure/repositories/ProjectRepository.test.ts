import {
  ProjectRepository,
} from '../../../../src/infrastructure/repositories/ProjectRepository';

describe('ProjectRepository', () => {
  let repository: ProjectRepository;

  beforeEach(() => {
    repository = new ProjectRepository();
  });

  describe('findById', () => {
    it('should be defined', () => {
      expect(repository.findById).toBeDefined();
    });
  });

  describe('save', () => {
    it('should be defined', () => {
      expect(repository.save).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(repository.findAll).toBeDefined();
    });
  });
});
