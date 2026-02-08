/**
 * @module domain/entities/user
 * @description Entity representing a system user (Administrator, Client, or Special User).
 * Core domain entity that participates in authentication, authorization, and
 * project collaboration.
 * @category Domain
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
  /** Hashed password (bcrypt) - never exposed in API */
  passwordHash: string;
  /** User's role in the system */
  role: UserRole;
  /** Phone number for WhatsApp notifications */
  phone?: string | null;
  /** Whether WhatsApp notifications are enabled */
  whatsappEnabled?: boolean;
  /** Account creation timestamp */
  createdAt?: Date;
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
  readonly id: string;
  private usernameValue: string;
  private emailValue: string;
  private readonly passwordHash: string;
  private roleValue: UserRole;
  private phoneValue: string | null;
  private whatsappEnabledValue: boolean;
  readonly createdAt: Date;
  private lastLoginValue: Date | null;

  /**
   * Creates a new User entity.
   *
   * @param props - User properties
   * @throws {Error} If required fields are missing or invalid
   */
  constructor(props: UserProps) {
    this.validateProps(props);

    this.id = props.id;
    this.usernameValue = props.username;
    this.emailValue = props.email;
    this.passwordHash = props.passwordHash;
    this.roleValue = props.role;
    this.phoneValue = props.phone ?? null;
    this.whatsappEnabledValue = props.whatsappEnabled ?? false;
    this.createdAt = props.createdAt ?? new Date();
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

  get username(): string {
    return this.usernameValue;
  }

  set username(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Username cannot be empty');
    }
    this.usernameValue = value;
  }

  get email(): string {
    return this.emailValue;
  }

  set email(value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Email cannot be empty');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    this.emailValue = value;
  }

  get role(): UserRole {
    return this.roleValue;
  }

  set role(value: UserRole) {
    this.roleValue = value;
  }

  get phone(): string | null {
    return this.phoneValue;
  }

  set phone(value: string | null) {
    this.phoneValue = value;
  }

  get whatsappEnabled(): boolean {
    return this.whatsappEnabledValue;
  }

  set whatsappEnabled(value: boolean) {
    this.whatsappEnabledValue = value;
  }

  get lastLogin(): Date | null {
    return this.lastLoginValue;
  }

  set lastLogin(value: Date | null) {
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
  authenticate(password: string): boolean {
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
  isAdmin(): boolean {
    return this.roleValue === UserRole.ADMINISTRATOR;
  }

  /**
   * Checks if the user has Client role.
   *
   * @returns True if user is a client
   */
  isClient(): boolean {
    return this.roleValue === UserRole.CLIENT;
  }

  /**
   * Checks if the user has Special User role.
   *
   * @returns True if user is a special user
   */
  isSpecialUser(): boolean {
    return this.roleValue === UserRole.SPECIAL_USER;
  }

  /**
   * Updates the last login timestamp to the current time.
   */
  updateLastLogin(): void {
    this.lastLoginValue = new Date();
  }

  /**
   * Enables WhatsApp notifications with the provided phone number.
   *
   * @param phone - Phone number for WhatsApp notifications
   * @throws {Error} If phone number is empty
   */
  enableWhatsApp(phone: string): void {
    if (!phone || phone.trim() === '') {
      throw new Error('Phone number is required to enable WhatsApp notifications');
    }
    this.phoneValue = phone;
    this.whatsappEnabledValue = true;
  }

  /**
   * Disables WhatsApp notifications.
   */
  disableWhatsApp(): void {
    this.whatsappEnabledValue = false;
  }

  /**
   * Serializes the user entity to a plain object.
   * Excludes sensitive data like password hash.
   *
   * @returns Plain object representation suitable for API responses
   */
  toJSON(): object {
    return {
      id: this.id,
      username: this.usernameValue,
      email: this.emailValue,
      role: this.roleValue,
      phone: this.phoneValue,
      whatsappEnabled: this.whatsappEnabledValue,
      createdAt: this.createdAt.toISOString(),
      lastLogin: this.lastLoginValue ? this.lastLoginValue.toISOString() : null,
    };
  }
}
