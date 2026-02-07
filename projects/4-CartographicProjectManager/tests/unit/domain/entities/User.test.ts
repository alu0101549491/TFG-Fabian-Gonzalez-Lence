import {User} from '../../../../src/domain/entities/User';
import {UserRole} from '../../../../src/domain/enums/UserRole';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User(
      'user-1',
      'testuser',
      'test@example.com',
      'hashedpassword',
      UserRole.CLIENT,
    );
  });

  describe('constructor', () => {
    it('should create a user with valid properties', () => {
      expect(user.getId()).toBe('user-1');
      expect(user.getUsername()).toBe('testuser');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getRole()).toBe(UserRole.CLIENT);
    });

    it('should set creation date', () => {
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should set last login date', () => {
      expect(user.getLastLogin()).toBeInstanceOf(Date);
    });
  });

  describe('setLastLogin', () => {
    it('should update last login date', () => {
      const newDate = new Date('2025-01-01');
      user.setLastLogin(newDate);
      expect(user.getLastLogin()).toEqual(newDate);
    });
  });

  describe('getRole', () => {
    it('should return ADMINISTRATOR role', () => {
      const admin = new User(
        'admin-1',
        'admin',
        'admin@example.com',
        'hash',
        UserRole.ADMINISTRATOR,
      );
      expect(admin.getRole()).toBe(UserRole.ADMINISTRATOR);
    });

    it('should return SPECIAL_USER role', () => {
      const specialUser = new User(
        'special-1',
        'special',
        'special@example.com',
        'hash',
        UserRole.SPECIAL_USER,
      );
      expect(specialUser.getRole()).toBe(UserRole.SPECIAL_USER);
    });
  });
});
