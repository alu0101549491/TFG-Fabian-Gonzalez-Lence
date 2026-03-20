/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 19, 2026
 * @file presentation/pages/admin/user-management/user-management.component.ts
 * @desc User management page for system administrators (CRUD operations on users).
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/5-TennisTournamentManager}
 */

import {Component, OnInit, signal, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {
  type UserSummaryDto,
  type CreateUserDto,
  type UpdateUserByAdminDto,
  type UserStatsDto,
} from '@application/dto';
import {UserManagementService} from '@application/services/user-management.service';
import {AuthStateService} from '@presentation/services/auth-state.service';
import {UserRole} from '@domain/enumerations/user-role';

/**
 * UserManagementComponent provides interface for system administrators
 * to create, edit, and delete user accounts.
 */
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="user-management-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-top">
            <button class="back-button" (click)="navigateBack()" aria-label="Back to profile">
              <span>← Back to Profile</span>
            </button>
            <button
              class="create-user-btn"
              (click)="openCreateModal()"
              aria-label="Create new user">
              <span>➕</span>
              <span>New User</span>
            </button>
          </div>
          <h1 class="hero-title">User Management</h1>
          <p class="hero-subtitle">Manage system users and their roles</p>
        </div>
      </section>

      <!-- Content Wrapper -->
      <div class="content-wrapper">
        <!-- Search and Filters -->
        <div class="filters-section">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="search"
              [value]="searchQuery()"
              (input)="onSearchChange($any($event.target).value)"
              placeholder="Search by username, email, or name..."
              class="search-input"
              aria-label="Search users" />
          </div>

          <div class="filters-group">
            <select
              [value]="roleFilter()"
              (change)="onRoleFilterChange($any($event.target).value)"
              class="filter-select"
              aria-label="Filter by role">
              <option value="">All Roles</option>
              <option [value]="UserRole.SYSTEM_ADMIN">System Admin</option>
              <option [value]="UserRole.TOURNAMENT_ADMIN">Tournament Admin</option>
              <option [value]="UserRole.REFEREE">Referee</option>
              <option [value]="UserRole.PLAYER">Player</option>
              <option [value]="UserRole.SPECTATOR">Spectator</option>
            </select>

            <label class="checkbox-label">
              <input
                type="checkbox"
                [checked]="activeOnlyFilter()"
                (change)="onActiveFilterChange($any($event.target).checked)"
                aria-label="Show only active users" />
              <span>Active only</span>
          </label>

          @if (hasActiveFilters()) {
            <button
              class="btn btn-ghost btn-sm"
              (click)="clearFilters()"
              aria-label="Clear all filters">
              Clear Filters
            </button>
          }
        </div>
      </div>

      <!-- Statistics Bar -->
      @if (stats()) {
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-label">Total Users</span>
            <span class="stat-value">{{ stats()!.totalUsers }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Active</span>
            <span class="stat-value stat-active">{{ stats()!.activeUsers }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">System Admins</span>
            <span class="stat-value stat-admin">{{ stats()!.systemAdmins }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Tournament Admins</span>
            <span class="stat-value stat-tournament">{{ stats()!.tournamentAdmins }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Referees</span>
            <span class="stat-value stat-referee">{{ stats()!.referees }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Players</span>
            <span class="stat-value stat-player">{{stats()!.players }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Spectators</span>
            <span class="stat-value stat-spectator">{{ stats()!.spectators }}</span>
          </div>
        </div>
      }

      <!-- Error Banner -->
      @if (errorMessage()) {
        <div class="alert alert-error" role="alert">
          <span class="alert-icon">⚠️</span>
          <span>{{ errorMessage() }}</span>
          <button class="alert-close" (click)="clearError()" aria-label="Dismiss error">×</button>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading users...</p>
        </div>
      }

      <!-- Users Table -->
      @if (!isLoading() && filteredUsers().length > 0) {
        <div class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th class="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user.id) {
                <tr>
                  <td class="user-username">{{ user.username }}</td>
                  <td class="user-email">{{ user.email }}</td>
                  <td class="user-name">{{ user.firstName }} {{ user.lastName }}</td>
                  <td>
                    <span [class]="'role-badge role-' + getRoleColor(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>
                    <span [class]="'status-badge ' + (user.isActive ? 'status-active' : 'status-inactive')">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="user-lastlogin">
                    @if (user.lastLogin) {
                      {{ formatDate(user.lastLogin) }}
                    } @else {
                      <span class="text-muted">Never</span>
                    }
                  </td>
                  <td class="user-actions">
                    <button
                      class="btn-icon"
                      (click)="openEditModal(user)"
                      [attr.aria-label]="'Edit ' + user.username"
                      title="Edit user">
                      ✏️
                    </button>
                    <button
                      class="btn-icon btn-danger"
                      (click)="confirmDelete(user)"
                      [attr.aria-label]="'Delete ' + user.username"
                      [disabled]="user.id === currentUserId()"
                      title="Delete user">
                      🗑️
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Empty State -->
      @if (!isLoading() && filteredUsers().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">👥</span>
          <h3>No users found</h3>
          <p>{{ searchQuery() || roleFilter() || activeOnlyFilter() ? 'Try adjusting your filters' : 'Create your first user to get started' }}</p>
       </div>
      }

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h2 class="modal-title">{{ isEditMode() ? 'Edit User' : 'Create New User' }}</h2>
              <button class="modal-close" (click)="closeModal()" aria-label="Close modal">×</button>
            </header>

            <form [formGroup]="userForm" (ngSubmit)="handleSubmit()" class="modal-body">
              @if (formError()) {
                <div class="alert alert-error mb-md">
                  <span class="alert-icon">⚠️</span>
                  <span>{{ formError() }}</span>
                </div>
              }

              <div class="form-grid">
                <div class="form-group">
                  <label for="username" class="form-label">Username *</label>
                  <input
                    type="text"
                    id="username"
                    formControlName="username"
                    class="form-control"
                    [class.form-control-error]="isFieldInvalid('username')"
                    placeholder="Enter username" />
                  @if (isFieldInvalid('username')) {
                    <span class="form-error">{{ getFieldError('username') }}</span>
                  }
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">Email *</label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="form-control"
                    [class.form-control-error]="isFieldInvalid('email')"
                    placeholder="Enter email" />
                  @if (isFieldInvalid('email')) {
                    <span class="form-error">{{ getFieldError('email') }}</span>
                  }
                </div>

                <div class="form-group">
                  <label for="firstName" class="form-label">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    formControlName="firstName"
                    class="form-control"
                    [class.form-control-error]="isFieldInvalid('firstName')"
                    placeholder="Enter first name" />
                  @if (isFieldInvalid('firstName')) {
                    <span class="form-error">{{ getFieldError('firstName') }}</span>
                  }
                </div>

                <div class="form-group">
                  <label for="lastName" class="form-label">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    formControlName="lastName"
                    class="form-control"
                    [class.form-control-error]="isFieldInvalid('lastName')"
                    placeholder="Enter last name" />
                  @if (isFieldInvalid('lastName')) {
                    <span class="form-error">{{ getFieldError('lastName') }}</span>
                  }
                </div>

                <div class="form-group">
                  <label for="role" class="form-label">Role *</label>
                  <select
                    id="role"
                    formControlName="role"
                    class="form-control"
                    [class.form-control-error]="isFieldInvalid('role')">
                    <option value="">Select role...</option>
                    <option [value]="UserRole.SYSTEM_ADMIN">System Admin</option>
                    <option [value]="UserRole.TOURNAMENT_ADMIN">Tournament Admin</option>
                    <option [value]="UserRole.REFEREE">Referee</option>
                    <option [value]="UserRole.PLAYER">Player</option>
                    <option [value]="UserRole.SPECTATOR">Spectator</option>
                  </select>
                  @if (isFieldInvalid('role')) {
                    <span class="form-error">{{ getFieldError('role') }}</span>
                  }
                </div>

                <div class="form-group">
                  <label for="phone" class="form-label">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    formControlName="phone"
                    class="form-control"
                    placeholder="Enter phone (optional)" />
                </div>

                @if (!isEditMode()) {
                  <div class="form-group form-group-full">
                    <label for="password" class="form-label">Password *</label>
                    <input
                      type="password"
                      id="password"
                      formControlName="password"
                      class="form-control"
                      [class.form-control-error]="isFieldInvalid('password')"
                      placeholder="Enter password" />
                    @if (isFieldInvalid('password')) {
                      <span class="form-error">{{ getFieldError('password') }}</span>
                    }
                  </div>
                }

                @if (isEditMode()) {
                  <div class="form-group form-group-full">
                    <label class="checkbox-label">
                      <input 
                        type="checkbox" 
                        [checked]="changePassword()"
                        (change)="togglePasswordChange()" />
                      <span>Change Password</span>
                    </label>
                  </div>
                  
                  @if (changePassword()) {
                    <div class="form-group form-group-full">
                      <label for="currentPassword" class="form-label">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        formControlName="currentPassword"
                        class="form-control"
                        [class.form-control-error]="isFieldInvalid('currentPassword')"
                        placeholder="Enter current password (optional for admins)" />
                      <small class="form-hint">Leave empty if you're a system administrator</small>
                      @if (isFieldInvalid('currentPassword')) {
                        <span class="form-error">{{ getFieldError('currentPassword') }}</span>
                      }
                    </div>

                    <div class="form-group form-group-full">
                      <label for="newPassword" class="form-label">New Password *</label>
                      <input
                        type="password"
                        id="newPassword"
                        formControlName="newPassword"
                        class="form-control"
                        [class.form-control-error]="isFieldInvalid('newPassword')"
                        placeholder="Enter new password" />
                      @if (isFieldInvalid('newPassword')) {
                        <span class="form-error">{{ getFieldError('newPassword') }}</span>
                      }
                    </div>

                    <div class="form-group form-group-full">
                      <label for="confirmNewPassword" class="form-label">Confirm New Password *</label>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        formControlName="confirmNewPassword"
                        class="form-control"
                        [class.form-control-error]="isFieldInvalid('confirmNewPassword')"
                        placeholder="Confirm new password" />
                      @if (isFieldInvalid('confirmNewPassword')) {
                        <span class="form-error">{{ getFieldError('confirmNewPassword') }}</span>
                      }
                    </div>
                  }
                  
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" formControlName="isActive" />
                      <span>Account Active</span>
                    </label>
                  </div>
                }
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="closeModal()"
                  [disabled]="isSubmitting()">
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="isSubmitting() || userForm.invalid">
                  @if (isSubmitting()) {
                    <span class="spinner"></span>
                    <span>{{ isEditMode() ? 'Updating...' : 'Creating...' }}</span>
                  } @else {
                    <span>{{ isEditMode() ? 'Update User' : 'Create User' }}</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteConfirm()) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content modal-content-sm" (click)="$event.stopPropagation()">
            <header class="modal-header">
              <h2 class="modal-title">Confirm Deletion</h2>
              <button class="modal-close" (click)="cancelDelete()" aria-label="Close modal">×</button>
            </header>

            <div class="modal-body">
              <p class="warning-text">
                Are you sure you want to delete user
                <strong>{{ userToDelete()?.username }}</strong>?
              </p>
              <p class="warning-text">This action cannot be undone.</p>

              <div class="modal-footer">
                <button
                  class="btn btn-secondary"
                  (click)="cancelDelete()"
                  [disabled]="isDeleting()">
                  Cancel
                </button>
                <button
                  class="btn btn-danger"
                  (click)="handleDelete()"
                  [disabled]="isDeleting()">
                  @if (isDeleting()) {
                    <span class="spinner"></span>
                    <span>Deleting...</span>
                  } @else {
                    <span>Delete User</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      </div>
    </div>
  `,
  styles: [`
    /* Container */
    .user-management-container {
      min-height: 100vh;
      background: var(--color-gray-50);
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-secondary) 100%);
      color: var(--color-white);
      padding: 3rem 0 4rem;
      overflow: hidden;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.05)"/><circle cx="900" cy="400" r="120" fill="rgba(255,255,255,0.03)"/><circle cx="600" cy="300" r="100" fill="rgba(255,255,255,0.04)"/></svg>');
      background-size: cover;
      pointer-events: none;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
    }

    .hero-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    .back-button {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      color: var(--color-white);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      font-size: var(--font-size-base);
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateX(-4px);
    }

    .create-user-btn {
      background: var(--color-white);
      color: var(--color-primary);
      border: none;
      padding: var(--spacing-md) var(--spacing-xl);
      border-radius: var(--border-radius-md);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-base);
    }

    .create-user-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .hero-title {
      font-size: 3rem;
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-white);
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), 
                   0 4px 8px rgba(0, 0, 0, 0.3),
                   0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .hero-subtitle {
      font-size: var(--font-size-lg);
      color: var(--color-white);
      margin: 0;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), 
                   0 3px 6px rgba(0, 0, 0, 0.3);
      opacity: 0.95;
    }

    /* Content Area */
    .content-wrapper {
      max-width: 1280px;
      margin: 0 auto;
      padding: var(--spacing-xl) var(--spacing-lg);
    }

    /* Filters */
    .filters-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      border: var(--border-width-thin) solid var(--color-gray-200);
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: var(--spacing-md);
      font-size: 1.25rem;
      opacity: 0.6;
    }

    .search-input {
      width: 100%;
      padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) 3rem;
      border: 2px solid var(--color-gray-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-base);
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
    }

    .filters-group {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      align-items: center;
    }

    .filter-select {
      padding: var(--spacing-sm) var(--spacing-md);
      border: 2px solid var(--color-gray-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      transition: border-color 0.2s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    /* Stats Bar */
    .stats-bar {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--spacing-lg);
      flex-wrap: wrap;
      border: var(--border-width-thin) solid var(--color-gray-200);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .stat-label {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      text-transform: uppercase;
      font-weight: var(--font-weight-semibold);
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: var(--font-weight-bold);
      color: var(--color-gray-900);
    }

    .stat-active { color: var(--color-success); }
    .stat-admin { color: var(--color-error); }
    .stat-tournament { color: var(--color-primary); }
    .stat-referee { color: #d97706; }
    .stat-player { color: var(--color-secondary); }
    .stat-spectator { color: var(--color-gray-600); }

    .stat-divider {
      width: 1px;
      background: var(--color-gray-300);
    }

    /* Table */
    .table-container {
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      border: var(--border-width-thin) solid var(--color-gray-200);
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table thead {
      background: var(--color-gray-100);
      border-bottom: 2px solid var(--color-gray-300);
    }

    .users-table th {
      padding: var(--spacing-md);
      text-align: left;
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-700);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
    }

    .users-table td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-gray-200);
    }

    .users-table tbody tr:hover {
      background: var(--color-gray-50);
    }

    .user-username {
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-900);
    }

    .user-email {
      color: var(--color-gray-600);
      font-size: var(--font-size-sm);
    }

    .user-name {
      color: var(--color-gray-700);
    }

    .user-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .actions-column {
      width: 120px;
    }

    /* Role and Status Badges */
    .role-badge {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
    }

    .role-admin { background: var(--color-error-light); color: var(--color-error-dark); }
    .role-tournament { background: var(--color-success-light); color: var(--color-success-dark); }
    .role-referee { background: #fef3e7; color: #d97706; }
    .role-player { background: #e0f2fe; color: var(--color-secondary); }
    .role-spectator { background: var(--color-gray-100); color: var(--color-gray-600); }

    .status-badge {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }

    .status-active {
      background: var(--color-success-light);
      color: var(--color-success-dark);
    }

    .status-inactive {
      background: var(--color-gray-200);
      color: var(--color-gray-600);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl) var(--spacing-lg);
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: var(--border-width-thin) solid var(--color-gray-200);
    }

    .empty-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: var(--spacing-lg);
      opacity: 0.4;
    }

    .empty-state h3 {
      color: var(--color-gray-900);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .empty-state p {
      color: var(--color-gray-600);
      margin: 0;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: var(--spacing-2xl);
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: var(--border-width-thin) solid var(--color-gray-200);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--color-gray-300);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto var(--spacing-md);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Alert Styles */
    .alert {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
      font-size: var(--font-size-base);
    }

    .alert-error {
      background: var(--color-error-light);
      border: var(--border-width-thin) solid var(--color-error);
      color: var(--color-error-dark);
    }

    .alert-icon {
      font-size: 1.25rem;
    }

    .alert-close {
      margin-left: auto;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: inherit;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-sm);
      transition: background 0.2s ease;
    }

    .alert-close:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .mb-md {
      margin-bottom: var(--spacing-md);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-index-modal);
      padding: var(--spacing-lg);
    }

    .modal-content {
      background: var(--color-white);
      border-radius: var(--border-radius-lg);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }

    .modal-content-sm {
      max-width: 400px;
    }

    .modal-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--color-gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: var(--font-weight-bold);
      color: var(--color-gray-900);
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: var(--color-gray-500);
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-sm);
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background: var(--color-gray-100);
      color: var(--color-gray-900);
    }

    .modal-body {
      padding: var(--spacing-lg);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      padding-top: var(--spacing-lg);
      margin-top: var(--spacing-lg);
      border-top: 1px solid var(--color-gray-200);
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    /* Form Hint */
    .form-hint {
      display: block;
      margin-top: var(--spacing-xs);
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      font-style: italic;
    }

    /* Warning Text */
    .warning-text {
      color: var(--color-gray-700);
      margin: var(--spacing-sm) 0;
    }

    .warning-text strong {
      color: var(--color-error);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .list-header {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-bar {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .stat-divider {
        display: none;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .users-table {
        font-size: var(--font-size-sm);
      }

      .users-table th,
      .users-table td {
        padding: var(--spacing-sm);
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  /** Form builder */
  private readonly fb = inject(FormBuilder);

  /** User management service */
  private readonly userManagementService = inject(UserManagementService);

  /** Auth state service */
  private readonly authStateService = inject(AuthStateService);

  /** Router for navigation */
  private readonly router = inject(Router);

  /** UserRole enum for template */
  protected readonly UserRole = UserRole;

  /** All users */
  public users = signal<UserSummaryDto[]>([]);

  /** User statistics */
  public stats = signal<UserStatsDto | null>(null);

  /** Loading state */
  public isLoading = signal(false);

  /** Error message */
  public errorMessage = signal<string | null>(null);

  /** Search query */
  public searchQuery = signal('');

  /** Role filter */
  public roleFilter = signal('');

  /** Active only filter */
  public activeOnlyFilter = signal(false);

  /** Show modal */
  public showModal = signal(false);

  /** Show delete confirm */
  public showDeleteConfirm = signal(false);

  /** Edit mode */
  public isEditMode = signal(false);

  /** Submitting state */
  public isSubmitting = signal(false);

  /** Deleting state */
  public isDeleting = signal(false);

  /** Form error */
  public formError = signal<string | null>(null);

  /** User to delete */
  public userToDelete = signal<UserSummaryDto | null>(null);

  /** Current user ID */
  public currentUserId = computed(() => this.authStateService.getCurrentUser()?.id || '');

  /** User form */
  public userForm: FormGroup;

  /** Filtered users based on search and filters */
  public filteredUsers = computed(() => {
    let filtered = this.users();

    // Apply role filter
    if (this.roleFilter()) {
      filtered = filtered.filter(u => u.role === this.roleFilter());
    }

    // Apply active filter
    if (this.activeOnlyFilter()) {
      filtered = filtered.filter(u => u.isActive);
    }

    // Apply search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  /** Check if filters are active */
  public hasActiveFilters = computed(() =>
    !!this.searchQuery() || !!this.roleFilter() || this.activeOnlyFilter()
  );

  /** Signal to track if changing password in edit mode */
  public changePassword = signal(false);

  /**
   * Creates an instance of UserManagementComponent.
   */
  public constructor() {
    this.userForm = this.fb.group({
      id: [''], // Hidden field to store user ID in edit mode
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      role: ['', [Validators.required]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmNewPassword: [''],
      isActive: [true],
    });
  }

  /**
   * Component initialization.
   * Loads users and statistics.
   */
  public async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  /**
   * Loads users and statistics.
   * 
   * @param throwOnError - If true, re-throws errors instead of setting errorMessage
   */
  private async loadData(throwOnError = false): Promise<void> {
    this.isLoading.set(true);
    if (!throwOnError) {
      this.errorMessage.set(null);
    }

    try {
      const [users, stats] = await Promise.all([
        this.userManagementService.getAllUsers(),
        this.userManagementService.getUserStats(),
      ]);

      this.users.set(users);
      this.stats.set(stats);
    } catch (error) {
      if (throwOnError) {
        throw error; // Re-throw for caller to handle
      }
      const message = error instanceof Error ? error.message : 'Failed to load users';
      this.errorMessage.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Opens create modal.
   */
  public openCreateModal(): void {
    this.isEditMode.set(false);
    this.userForm.reset({isActive: true});
    this.userForm.get('password')?.enable();
    this.formError.set(null);
    this.showModal.set(true);
  }

  /**
   * Opens edit modal.
   */
  public openEditModal(user: UserSummaryDto): void {
    this.isEditMode.set(true);
    this.changePassword.set(false);
    this.userForm.patchValue({
      id: user.id, // Store the user ID
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
      isActive: user.isActive,
      password: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    this.userForm.get('password')?.disable();
    this.userForm.get('currentPassword')?.disable();
    this.userForm.get('newPassword')?.disable();
    this.userForm.get('confirmNewPassword')?.disable();
    this.formError.set(null);
    this.showModal.set(true);
  }

  /**
   * Closes modal.
   */
  public closeModal(): void {
    this.showModal.set(false);
    this.changePassword.set(false);
    this.userForm.reset();
    this.formError.set(null);
  }

  /**
   * Toggles password change fields in edit mode.
   */
  public togglePasswordChange(): void {
    const shouldChange = !this.changePassword();
    this.changePassword.set(shouldChange);
    
    if (shouldChange) {
      // Enable password fields
      this.userForm.get('currentPassword')?.enable();
      this.userForm.get('newPassword')?.enable();
      this.userForm.get('confirmNewPassword')?.enable();
      
      // Make them required
      this.userForm.get('newPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('confirmNewPassword')?.setValidators([Validators.required]);
    } else {
      // Disable and clear password fields
      this.userForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      this.userForm.get('currentPassword')?.disable();
      this.userForm.get('newPassword')?.disable();
      this.userForm.get('confirmNewPassword')?.disable();
      this.userForm.get('newPassword')?.clearValidators();
      this.userForm.get('confirmNewPassword')?.clearValidators();
    }
    
    this.userForm.get('newPassword')?.updateValueAndValidity();
    this.userForm.get('confirmNewPassword')?.updateValueAndValidity();
  }

  /**
   * Handles form submission.
   */
  public async handleSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    // Additional validation - ensure required fields are not empty strings
    const formValues = this.userForm.value;
    if (!this.isEditMode()) {
      if (!formValues.username?.trim() || !formValues.email?.trim() || 
          !formValues.firstName?.trim() || !formValues.lastName?.trim() || 
          !formValues.password?.trim() || !formValues.role?.trim()) {
        this.formError.set('Please fill in all required fields');
        this.userForm.markAllAsTouched();
        return;
      }
    }

    this.isSubmitting.set(true);
    this.formError.set(null);

    try {
      if (this.isEditMode()) {
        const userId = this.userForm.value.id;
        
        // Validate password change if enabled
        if (this.changePassword()) {
          const newPassword = this.userForm.value.newPassword?.trim();
          const confirmPassword = this.userForm.value.confirmNewPassword?.trim();
          
          if (!newPassword || !confirmPassword) {
            this.formError.set('Please fill in all password fields');
            return;
          }
          
          if (newPassword !== confirmPassword) {
            this.formError.set('New passwords do not match');
            return;
          }
        }
        
        const updateData: UpdateUserByAdminDto = {
          username: this.userForm.value.username.trim(),
          email: this.userForm.value.email.trim(),
          firstName: this.userForm.value.firstName.trim(),
          lastName: this.userForm.value.lastName.trim(),
          role: this.userForm.value.role,
          phone: this.userForm.value.phone?.trim() || null,
          isActive: this.userForm.value.isActive,
        };
        
        // Add password if changing
        if (this.changePassword()) {
          updateData.newPassword = this.userForm.value.newPassword.trim();
          updateData.currentPassword = this.userForm.value.currentPassword?.trim();
        }
        
        await this.userManagementService.updateUser(userId, updateData);
      } else {
        const createData: CreateUserDto = {
          username: this.userForm.value.username.trim(),
          email: this.userForm.value.email.trim(),
          firstName: this.userForm.value.firstName.trim(),
          lastName: this.userForm.value.lastName.trim(),
          password: this.userForm.value.password.trim(),
          role: this.userForm.value.role,
          phone: this.userForm.value.phone?.trim() || undefined,
        };
        await this.userManagementService.createUser(createData);
      }

      // Reload data to refresh the list (bypass cache to get fresh data)
      await this.loadData(true, true);
      
      // Only close modal after successful refresh
      this.closeModal();
    } catch (error: any) {
      // Extract error message from HTTP error response
      let message = 'Operation failed';
      if (error?.error?.message) {
        message = error.error.message;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error?.error === 'string') {
        message = error.error;
      }
      this.formError.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Confirms user deletion.
   */
  public confirmDelete(user: UserSummaryDto): void {
    this.userToDelete.set(user);
    this.showDeleteConfirm.set(true);
  }

  /**
   * Cancels deletion.
   */
  public cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.userToDelete.set(null);
  }

  /**
   * Handles user deletion.
   */
  public async handleDelete(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    try {
      // Delete user
      await this.userManagementService.deleteUser(user.id);
      
      // Reload data to refresh the list (bypass cache to get fresh data)
      await this.loadData(true, true);
      
      // Only close modal and reset state after successful refresh
      this.showDeleteConfirm.set(false);
      this.userToDelete.set(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      this.errorMessage.set(message);
      
      // Keep modal open so user can see error and try again
    } finally {
      this.isDeleting.set(false);
    }
  }

  /**
   * Handles search query change.
   */
  public onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  /**
   * Handles role filter change.
   */
  public onRoleFilterChange(value: string): void {
    this.roleFilter.set(value);
  }

  /**
   * Handles active filter change.
   */
  public onActiveFilterChange(checked: boolean): void {
    this.activeOnlyFilter.set(checked);
  }

  /**
   * Applies filters (triggers computed recalculation).
   */
  public applyFilters(): void {
    // Filters are applied via computed property
  }

  /**
   * Clears all filters.
   */
  public clearFilters(): void {
    this.searchQuery.set('');
    this.roleFilter.set('');
    this.activeOnlyFilter.set(false);
  }

  /**
   * Clears error message.
   */
  public clearError(): void {
    this.errorMessage.set(null);
  }

  /**
   * Navigate back to profile page.
   */
  public navigateBack(): void {
    void this.router.navigate(['/profile']);
  }

  /**
   * Gets role display label.
   */
  public getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.SYSTEM_ADMIN]: 'System Admin',
      [UserRole.TOURNAMENT_ADMIN]: 'Tournament Admin',
      [UserRole.REFEREE]: 'Referee',
      [UserRole.PLAYER]: 'Player',
      [UserRole.SPECTATOR]: 'Spectator',
    };
    return labels[role] || role;
  }

  /**
   * Gets role color class.
   */
  public getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.SYSTEM_ADMIN]: 'admin',
      [UserRole.TOURNAMENT_ADMIN]: 'tournament',
      [UserRole.REFEREE]: 'referee',
      [UserRole.PLAYER]: 'player',
      [UserRole.SPECTATOR]: 'spectator',
    };
    return colors[role] || 'spectator';
  }

  /**
   * Formats date to readable string.
   */
  public formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Checks if form field is invalid and touched.
   */
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Gets field error message.
   */
  public getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['minlength'])
      return `Minimum ${field.errors['minlength'].requiredLength} characters required`;

    return 'Invalid field';
  }
}
