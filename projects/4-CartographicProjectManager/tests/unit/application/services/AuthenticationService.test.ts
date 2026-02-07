import {
  AuthenticationService,
} from '../../../../src/application/services/implementations/AuthenticationService';
import {IUserRepository} from '../../../../src/domain/repositories/IUserRepository';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByUsername: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findByRole: jest.fn(),
    };
    service = new AuthenticationService(mockUserRepository);
  });

  describe('login', () => {
    it('should be defined', () => {
      expect(service.login).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should be defined', () => {
      expect(service.logout).toBeDefined();
    });
  });

  describe('validateSession', () => {
    it('should be defined', () => {
      expect(service.validateSession).toBeDefined();
    });
  });
});
