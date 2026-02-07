/**
 * @module domain/entities/user
 * @description Entity representing a system user (Administrator, Client, or Special User).
 * Core domain entity that participates in authentication, authorization, and
 * project collaboration.
 * @category Domain
 */

import {UserRole} from '../enumerations/user-role';
import {type Permission} from './permission';
import {type Project} from './project';

/**
 * Represents a user in the Cartographic Project Manager system.
 * Users are identified by a unique ID and can have one of three roles.
 */
export class User {
  private readonly id: string;
  private readonly username: string;
  private readonly email: string;
  private readonly passwordHash: string;
  private readonly role: UserRole;
  private readonly createdAt: Date;
  private lastLogin: Date;

  constructor(
    id: string,
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole,
    createdAt: Date,
    lastLogin: Date,
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = createdAt;
    this.lastLogin = lastLogin;
  }

  /**
   * Authenticates a user by verifying the provided password against
   * the stored password hash.
   * @param password - The plaintext password to verify.
   * @returns True if the password matches the stored hash.
   */
  authenticate(password: string): boolean {
    // TODO: Implement password verification logic
    throw new Error('Method not implemented.');
  }

  /**
   * Checks if the user has a specific permission.
   * @param permission - The permission to check.
   * @returns True if the user has the specified permission.
   */
  hasPermission(permission: Permission): boolean {
    // TODO: Implement permission check logic
    throw new Error('Method not implemented.');
  }

  /**
   * Retrieves the list of projects assigned to this user.
   * @returns Array of projects the user has access to.
   */
  getAssignedProjects(): Project[] {
    // TODO: Implement project retrieval logic
    throw new Error('Method not implemented.');
  }

  getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getEmail(): string {
    return this.email;
  }

  getRole(): UserRole {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getLastLogin(): Date {
    return this.lastLogin;
  }
}
