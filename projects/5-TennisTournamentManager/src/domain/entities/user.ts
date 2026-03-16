/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 16, 2026
 * @file domain/entities/user.ts
 * @desc Entity representing a system user. Supports four actor types: System Administrator, Tournament Administrator, Registered Participant, and Public. Core domain entity for authentication, authorization, GDPR compliance, and audit logging.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {UserRole} from '../enumerations/user-role';

/**
 * Properties for creating a User entity.
 */
export interface UserProps {
  /** Unique identifier for the user. */
  id: string;
  /** Display name / username. */
  username: string;
  /** User's email address (used for login and notifications). */
  email: string;
  /** User's first name. */
  firstName: string;
  /** User's last name. */
  lastName: string;
  /** Hashed password (bcrypt per NFR12) — never exposed in API responses. */
  passwordHash: string;
  /** User's role in the system. */
  role: UserRole;
  /** Whether the account is active. */
  isActive?: boolean;
  /** Phone number for contact and notifications. */
  phone?: string | null;
  /** GDPR data-processing consent flag (NFR14). */
  gdprConsent?: boolean;
  /** Account creation timestamp. */
  createdAt?: Date;
  /** Last update timestamp. */
  updatedAt?: Date;
  /** Last successful login timestamp. */
  lastLogin?: Date | null;
}

/**
 * Represents a user in the Tennis Tournament Manager system.
 *
 * Users are characterized by their role:
 * - SYSTEM_ADMIN: Full platform control, user management, system configuration.
 * - TOURNAMENT_ADMIN: Tournament lifecycle management, draw generation, scheduling.
 * - PARTICIPANT: Registration, profile management, viewing own results.
 * - PUBLIC: Read-only access to published draws and results.
 *
 * This entity encapsulates user identity, authentication data, role-based
 * access control, and GDPR-related consent tracking.
 */
export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly isActive: boolean;
  public readonly phone: string | null;
  public readonly gdprConsent: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly lastLogin: Date | null;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.isActive = props.isActive ?? true;
    this.phone = props.phone ?? null;
    this.gdprConsent = props.gdprConsent ?? false;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.lastLogin = props.lastLogin ?? null;
  }

  /**
   * Returns the user's full display name.
   *
   * @returns The concatenation of first and last name
   */
  public getFullName(): string {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether the user has a specific role.
   *
   * @param role - The role to check against
   * @returns True if user has the specified role
   */
  public hasRole(role: UserRole): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Checks whether the user has administrative privileges (SysAdmin or TournamentAdmin).
   *
   * @returns True if the user is any type of administrator
   */
  public isAdmin(): boolean {
    throw new Error('Not implemented');
  }
}
