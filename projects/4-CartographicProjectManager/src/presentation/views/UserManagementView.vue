<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering  
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since 2026-02-20
  @file src/presentation/views/UserManagementView.vue
  @desc User management view for administrators to create, edit, and delete users
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="user-management-view">
    <!-- Header -->
    <header class="list-header">
      <div class="header-content">
        <h1>User Management</h1>
        <p class="list-subtitle">Manage system users and their roles</p>
      </div>
      <button
        v-if="canManageUsers"
        @click="openCreateModal"
        class="button-primary"
        aria-label="Create new user"
      >
        + New User
      </button>
    </header>

    <!-- Search and filters -->
    <section class="filters-section" aria-label="User filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search by username or email..."
          class="search-input"
          aria-label="Search users"
        />
      </div>

      <div class="filters-group">
        <select
          v-model="roleFilter"
          class="filter-select"
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option :value="UserRole.ADMINISTRATOR">Administrators</option>
          <option :value="UserRole.CLIENT">Clients</option>
          <option :value="UserRole.SPECIAL_USER">Special Users</option>
        </select>

        <label class="checkbox-label">
          <input
            v-model="activeOnlyFilter"
            type="checkbox"
            aria-label="Show only active users"
          />
          <span>Active only (last 30 days)</span>
        </label>

        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="button-ghost button-sm"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-bar" aria-label="User statistics">
      <div class="stat-item">
        <span class="stat-label">Total Users</span>
        <span class="stat-value">{{ userCount }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">Admins</span>
        <span class="stat-value stat-admin">{{ administratorCount }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">Clients</span>
        <span class="stat-value stat-client">{{ clientCount }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-label">Special Users</span>
        <span class="stat-value stat-special">{{ specialUserCount }}</span>
      </div>
    </section>

    <!-- Error display -->
    <div v-if="error" class="error-banner" role="alert">
      <span>{{ error }}</span>
      <button @click="clearError" class="error-close" aria-label="Dismiss error">×</button>
    </div>

    <!-- Users table -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <div v-else-if="filteredUsers.length > 0" class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="user-username">{{ user.username }}</td>
            <td class="user-email">{{ user.email }}</td>
            <td>
              <span :class="['role-badge', `role-${getUserRoleColor(user.role)}`]">
                {{ getUserRoleLabel(user.role) }}
              </span>
            </td>
            <td class="user-phone">{{ user.phone || '—' }}</td>
            <td class="user-lastlogin">
              {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
            </td>
            <td class="user-actions">
              <button
                @click="openEditModal(user)"
                class="button-icon"
                :aria-label="`Edit ${user.username}`"
                title="Edit user"
              >
                ✏️
              </button>
              <button
                @click="confirmDelete(user)"
                class="button-icon button-danger"
                :aria-label="`Delete ${user.username}`"
                title="Delete user"
                :disabled="user.id === currentUserId"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">👥</div>
      <h2>{{ emptyStateTitle }}</h2>
      <p>{{ emptyStateMessage }}</p>
      <button
        v-if="hasActiveFilters"
        @click="clearAllFilters"
        class="button-secondary"
      >
        Clear Filters
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="closeModal"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <div class="modal-container">
          <div class="modal-header">
            <h2 id="modal-title">{{ isEditMode ? 'Edit User' : 'Create New User' }}</h2>
            <button
              @click="closeModal"
              class="modal-close"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-group">
              <label for="username">Username *</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="form-input"
                placeholder="Enter username"
              />
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="form-input"
                placeholder="user@example.com"
              />
            </div>

            <div class="form-group">
              <label for="password">Password {{ isEditMode ? '(leave blank to keep current)' : '*' }}</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                :required="!isEditMode"
                minlength="8"
                class="form-input"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div class="form-group">
              <label for="role">Role *</label>
              <select
                id="role"
                v-model="form.role"
                required
                class="form-input"
              >
                <option :value="UserRole.CLIENT">Client</option>
                <option :value="UserRole.SPECIAL_USER">Special User</option>
                <option :value="UserRole.ADMINISTRATOR">Administrator</option>
              </select>
            </div>

            <div class="form-group">
              <label for="phone">Phone</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="form-input"
                placeholder="+34 600 000 000"
              />
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="form.whatsappEnabled"
                  type="checkbox"
                />
                <span>Enable WhatsApp notifications</span>
              </label>
            </div>

            <div v-if="formError" class="form-error" role="alert">
              {{ formError }}
            </div>

            <div class="modal-footer">
              <button
                type="button"
                @click="closeModal"
                class="button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="button-primary"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="modal-overlay"
        @click.self="cancelDelete"
        role="dialog"
        aria-labelledby="delete-title"
        aria-modal="true"
      >
        <div class="modal-container modal-small">
          <div class="modal-header">
            <h2 id="delete-title">Confirm Deletion</h2>
            <button
              @click="cancelDelete"
              class="modal-close"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <div class="modal-body">
            <p>
              Are you sure you want to delete user
              <strong>{{ userToDelete?.username }}</strong>?
            </p>
            <p class="warning-text">This action cannot be undone.</p>

            <div class="modal-footer">
              <button
                @click="cancelDelete"
                class="button-secondary"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                class="button-danger"
                :disabled="isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete User' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue';
import {useUsers} from '../composables/use-users';
import {useAuth} from '../composables/use-auth';
import {UserRole} from '../../domain/enumerations/user-role';
import type {UserSummaryDto, CreateUserDto, UpdateUserDto} from '../../application/dto';

// Composables
const {
  filteredUsers,
  userCount,
  administratorCount,
  clientCount,
  specialUserCount,
  isLoading,
  error,
  canManageUsers,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setFilters,
  clearFilters,
  clearError,
  getUserRoleLabel,
  getUserRoleColor,
} = useUsers();

const {userId: currentUserId} = useAuth();

// Filter state
const searchQuery = ref('');
const roleFilter = ref<UserRole | ''>('');
const activeOnlyFilter = ref(false);

// Modal state
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const isEditMode = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const formError = ref<string | null>(null);
const userToDelete = ref<UserSummaryDto | null>(null);

// Form data
interface UserForm {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  whatsappEnabled: boolean;
}

const form = ref<UserForm & {id?: string}>({
  username: '',
  email: '',
  password: '',
  role: UserRole.CLIENT,
  phone: '',
  whatsappEnabled: false,
});

// Computed
const hasActiveFilters = computed(() =>
  searchQuery.value !== '' || roleFilter.value !== '' || activeOnlyFilter.value,
);

const emptyStateTitle = computed(() =>
  hasActiveFilters.value ? 'No users found' : 'No users yet',
);

const emptyStateMessage = computed(() =>
  hasActiveFilters.value
    ? 'Try adjusting your filters to see more results.'
    : 'Create your first user to get started.',
);

// Watch filters and update store
watch(
  [searchQuery, roleFilter, activeOnlyFilter],
  () => {
    setFilters({
      search: searchQuery.value || undefined,
      role: roleFilter.value || undefined,
      activeOnly: activeOnlyFilter.value || undefined,
    });
  },
);

// Methods
function clearAllFilters(): void {
  searchQuery.value = '';
  roleFilter.value = '';
  activeOnlyFilter.value = false;
  clearFilters();
}

function openCreateModal(): void {
  isEditMode.value = false;
  form.value = {
    username: '',
    email: '',
    password: '',
    role: UserRole.CLIENT,
    phone: '',
    whatsappEnabled: false,
  };
  formError.value = null;
  showModal.value = true;
}

function openEditModal(user: UserSummaryDto): void {
  isEditMode.value = true;
  form.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
    phone: user.phone || '',
    whatsappEnabled: false, // Can't retrieve this from summary
  };
  formError.value = null;
  showModal.value = true;
}

function closeModal(): void {
  showModal.value = false;
  formError.value = null;
}

async function handleSubmit(): Promise<void> {
  formError.value = null;
  isSubmitting.value = true;

  try {
    if (isEditMode.value && form.value.id) {
      // Update user
      const updateData: UpdateUserDto = {
        username: form.value.username,
        email: form.value.email,
        role: form.value.role,
        phone: form.value.phone || null,
        whatsappEnabled: form.value.whatsappEnabled,
        // Only include password if it was changed
        ...(form.value.password && {password: form.value.password}),
      };

      const result = await updateUser(form.value.id, updateData);

      if (result.success) {
        closeModal();
      } else {
        formError.value = result.error || 'Failed to update user';
      }
    } else {
      // Create user
      const createData: CreateUserDto = {
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
        phone: form.value.phone || null,
        whatsappEnabled: form.value.whatsappEnabled,
      };

      const result = await createUser(createData);

      if (result.success) {
        closeModal();
      } else {
        formError.value = result.error || 'Failed to create user';
      }
    }
  } catch (err: any) {
    formError.value = err.message || 'An unexpected error occurred';
  } finally {
    isSubmitting.value = false;
  }
}

function confirmDelete(user: UserSummaryDto): void {
  userToDelete.value = user;
  showDeleteConfirm.value = true;
}

function cancelDelete(): void {
  showDeleteConfirm.value = false;
  userToDelete.value = null;
}

async function handleDelete(): Promise<void> {
  if (!userToDelete.value) return;

  isDeleting.value = true;
  const result = await deleteUser(userToDelete.value.id);
  isDeleting.value = false;

  if (result.success) {
    showDeleteConfirm.value = false;
    userToDelete.value = null;
  } else {
    formError.value = result.error || 'Failed to delete user';
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Lifecycle
onMounted(async () => {
  await fetchUsers();
});
</script>

<style scoped>
.user-management-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.list-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

/* Filters */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.filters-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

/* Stats */
.stats-bar {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-admin {
  color: #dc3545;
}

.stat-client {
  color: #0066cc;
}

.stat-special {
  color: #28a745;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: #ddd;
}

/* Error banner */
.error-banner {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #c33;
  padding: 0 0.5rem;
}

/* Table */
.users-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.95rem;
}

.users-table tbody tr:hover {
  background: #f8f9fa;
}

.user-username {
  font-weight: 600;
  color: #1a1a1a;
}

.user-email {
  color: #666;
}

.user-phone,
.user-lastlogin {
  color: #888;
  font-size: 0.9rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-red {
  background: #fee;
  color: #c33;
}

.role-blue {
  background: #e6f2ff;
  color: #0066cc;
}

.role-green {
  background: #e6ffe6;
  color: #28a745;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.button-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.button-icon:hover {
  background: #e9ecef;
}

.button-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-danger:hover:not(:disabled) {
  background: #fee;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0066cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

/* Buttons */
.button-primary,
.button-secondary,
.button-ghost,
.button-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.button-primary {
  background: #0066cc;
  color: white;
}

.button-primary:hover:not(:disabled) {
  background: #0052a3;
}

.button-secondary {
  background: #e9ecef;
  color: #495057;
}

.button-secondary:hover {
  background: #dee2e6;
}

.button-ghost {
  background: transparent;
  color: #0066cc;
  border: 1px solid #0066cc;
}

.button-ghost:hover {
  background: #e6f2ff;
}

.button-danger {
  background: #dc3545;
  color: white;
}

.button-danger:hover:not(:disabled) {
  background: #c82333;
}

.button-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-error {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.warning-text {
  color: #856404;
  background: #fff3cd;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ffeeba;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .user-management-view {
    padding: 1rem;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-group {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-bar {
    flex-wrap: wrap;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    min-width: 700px;
  }
}
</style>
