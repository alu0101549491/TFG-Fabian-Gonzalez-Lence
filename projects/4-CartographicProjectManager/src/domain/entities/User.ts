import {UserRole} from '../enums/UserRole';
import {Project} from './Project';
import {Permission} from './Permission';

/**
 * User entity representing a system user
 * Can be Administrator, Client, or Special User
 */
export class User {
  private id: string;
  private username: string;
  private email: string;
  private passwordHash: string;
  private role: UserRole;
  private createdAt: Date;
  private lastLogin: Date;

  constructor(
    id: string,
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole,
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = new Date();
    this.lastLogin = new Date();
  }

  /**
   * Authenticates user with provided password
   * @param password - Plain text password to verify
   * @returns True if authentication successful
   */
  public authenticate(password: string): boolean {
    // TODO: Implement authentication logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if user has specific permission
   * @param permission - Permission to check
   * @returns True if user has the permission
   */
  public hasPermission(permission: Permission): boolean {
    // TODO: Implement permission check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Gets all projects assigned to this user
   * @returns List of assigned projects
   */
  public getAssignedProjects(): Project[] {
    // TODO: Implement get assigned projects logic
    throw new Error('Method not implemented.');
  }

  // Getters and setters
  public getId(): string {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string {
    return this.email;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getLastLogin(): Date {
    return this.lastLogin;
  }

  public setLastLogin(date: Date): void {
    this.lastLogin = date;
  }
}