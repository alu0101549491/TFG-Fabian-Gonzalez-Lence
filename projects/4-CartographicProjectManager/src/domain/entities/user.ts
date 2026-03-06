/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 11, 2026
 * @file domain/entities/user.ts
 * @desc Entity representing a system user (Administrator, Client, or Special User). Core domain entity that participates in authentication, authorization, and project collaboration.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import {UserRole} from '../enumerations/user-role';

/**
 * Properties for creating a User entity.
 */
export interface UserProps {
  /** Unique identifier for the user */
  id: string;
  /** Display name of the user */
  username: string;
  /** User's email address (used for login) */
  email: string;
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** Hashed password (bcrypt) - never exposed in API */
  passwordHash: string;
  /** User's role in the system */
  role: UserRole;
  /** Whether account is active */
  isActive?: boolean;
  /** Phone number for contact */
  phone?: string | null;
  /** Account creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Last successful login timestamp */
  lastLogin?: Date | null;
}

/**
 * Represents a user in the Cartographic Project Manager system.
 *
 * Users are characterized by their role:
 * - ADMINISTRATOR: Full system control, project creation, user management
 * - CLIENT: Access to assigned projects, can create tasks for admin
 * - SPECIAL_USER: Configurable permissions per project
 *
 * This entity encapsulates user identity, authentication data, and
 * role-based access control.
 *
 * @example
 * ```typescript
 * const admin = new User({
 *   id: 'user_001',
 *   username: 'John Admin',
 *   email: 'john@example.com',
 *   passwordHash: '$2b$10$...',
 *   role: UserRole.ADMINISTRATOR
 * });
 *
 * if (admin.isAdmin()) {
 *   // Full access granted
 * }
 * ```
 */
export class User {
  public readonly id: string;
  private usernameValue: string;
  private firstNameValue: string;
  private lastNameValue: string;
  private emailValue: string;
  private readonly passwordHash: string;
  private roleValue: UserRole;
  private isActiveValue: boolean;
  private phoneValue: string | null;
  public readonly createdAt: Date;
  private updatedAtValue: Date;
  private lastLoginValue: Date | null;

  /**
   * Creates a new User entity.
   *
   * @param props - User properties
   * @throws {Error} If required fields are missing or invalid
   */
  public constructor(props: UserProps) {
    this.validateProps(props);

    this.id = props.id;
    this.usernameValue = props.username;
    this.firstNameValue = props.firstName ?? '';
    this.lastNameValue = props.lastName ?? '';
    this.emailValue = props.email;
    this.passwordHash = props.passwordHash;
    this.roleValue = props.role;
    this.isActiveValue = props.isActive ?? true;
    this.phoneValue = props.phone ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAtValue = props.updatedAt ?? new Date();
    this.lastLoginValue = props.lastLogin ?? null;
  }

  /**
   * Validates user properties.
   *
   * @param props - Properties to validate
   * @throws {Error} If validation fails
   */
  private validateProps(props: UserProps): void {
    if (!props.id || props.id.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!props.username || props.username.trim() === '') {
      throw new Error('Username is required');
    }

    if (!props.email || props.email.trim() === '') {
      throw new Error('Email is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.email)) {
      throw new Error('Invalid email format');
    }

    if (!props.passwordHash || props.passwordHash.trim() === '') {
      throw new Error('Password hash is required');
    }

    if (!props.role) {
      throw new Error('User role is required');
    }
  }

  // Getters and Setters for mutable properties

  public get username(): string {
    return this.usernameValue;
  }

  public set username(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Username cannot be empty');
    }
    this.usernameValue = value;
  }

  public get firstName(): string {
    return this.firstNameValue;
  }

  public set firstName(value: string) {
    this.firstNameValue = value;
  }

  public get lastName(): string {
    return this.lastNameValue;
  }

  public set lastName(value: string) {
    this.lastNameValue = value;
  }

  public get email(): string {
    return this.emailValue;
  }

  public set email(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Email cannot be empty');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    this.emailValue = value;
  }

  public get role(): UserRole {
    return this.roleValue;
  }

  public set role(value: UserRole) {
    this.roleValue = value;
  }

  public get phone(): string | null {
    return this.phoneValue;
  }

  public set phone(value: string | null) {
    this.phoneValue = value;
  }

  public get isActive(): boolean {
    return this.isActiveValue;
  }

  public set isActive(value: boolean) {
    this.isActiveValue = value;
  }

  public get updatedAt(): Date {
    return this.updatedAtValue;
  }

  public set updatedAt(value: Date) {
    this.updatedAtValue = value;
  }

  public get lastLogin(): Date | null {
    return this.lastLoginValue;
  }

  public set lastLogin(value: Date | null) {
    this.lastLoginValue = value;
  }

  // Business Logic Methods

  /**
   * Authenticates a user by verifying the provided password.
   *
   * Note: This is a domain interface method. Actual password hashing
   * and verification should be delegated to an authentication service
   * in the application layer using bcrypt or similar.
   *
   * @param password - The plaintext password to verify
   * @returns True if the password matches (to be implemented in service layer)
   */
  public authenticate(password: string): boolean {
    void password;
    void this.passwordHash;
    // Domain entities should not contain cryptographic logic
    // This method signature exists for domain modeling
    // Actual implementation will be in the authentication service
    throw new Error(
      'Password authentication must be implemented in the application service layer'
    );
  }

  /**
   * Checks if the user has Administrator role.
   *
   * @returns True if user is an administrator
   */
  public isAdmin(): boolean {
    return this.roleValue === UserRole.ADMINISTRATOR;
  }

  /**
   * Checks if the user has Client role.
   *
   * @returns True if user is a client
   */
  public isClient(): boolean {
    return this.roleValue === UserRole.CLIENT;
  }

  /**
   * Checks if the user has Special User role.
   *
   * @returns True if user is a special user
   */
  public isSpecialUser(): boolean {
    return this.roleValue === UserRole.SPECIAL_USER;
  }

  /**
   * Updates the last login timestamp to the current time.
   */
  public updateLastLogin(): void {
    this.lastLoginValue = new Date();
  }

  /**
   * Serializes the user entity to a plain object.
   * Excludes sensitive data like password hash.
   *
   * @returns Plain object representation suitable for API responses
   */
  public toJSON(): object {
    return {
      id: this.id,
      username: this.usernameValue,
      firstName: this.firstNameValue,
      lastName: this.lastNameValue,
      email: this.emailValue,
      role: this.roleValue,
      isActive: this.isActiveValue,
      phone: this.phoneValue,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAtValue.toISOString(),
      lastLogin: this.lastLoginValue ? this.lastLoginValue.toISOString() : null,
    };
  }
}
