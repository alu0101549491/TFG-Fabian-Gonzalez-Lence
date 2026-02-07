import {
  UserRepository,
} from '../../../../src/infrastructure/repositories/UserRepository';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
  });

  describe('findById', () => {
    it('should be defined', () => {
      expect(repository.findById).toBeDefined();
    });
  });

  describe('findByUsername', () => {
    it('should be defined', () => {
      expect(repository.findByUsername).toBeDefined();
    });
  });

  describe('save', () => {
    it('should be defined', () => {
      expect(repository.save).toBeDefined();
    });
  });
});
