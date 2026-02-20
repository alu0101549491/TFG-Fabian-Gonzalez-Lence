<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)
  
  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/views/SettingsView.vue
  @desc Settings page with role-specific configurations
-->

<template>
  <div class="settings-view">
    <div class="settings-container">
      <!-- Header -->
      <header class="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your account and preferences</p>
        </div>
        <div class="user-role-badge" :class="`role-${getRoleBadgeClass()}`">
          {{ getRoleLabel() }}
        </div>
      </header>

      <!-- Success/Error messages -->
      <div v-if="successMessage" class="message-banner success-banner" role="alert">
        <span>✓ {{ successMessage }}</span>
        <button @click="successMessage = null" class="message-close">×</button>
      </div>

      <div v-if="errorMessage" class="message-banner error-banner" role="alert">
        <span>⚠ {{ errorMessage }}</span>
        <button @click="errorMessage = null" class="message-close">×</button>
      </div>
      
      <div class="settings-sections">
        <!-- Account Section -->
        <section class="settings-section">
          <div class="section-header-simple">
            <h2>🔐 Account Information</h2>
            <p>Manage your personal details and login credentials</p>
          </div>
          
          <form @submit.prevent="handleAccountUpdate" class="settings-form">
            <div class="form-row">
              <div class="form-group">
                <label for="username">Username</label>
                <input
                  id="username"
                  v-model="accountForm.username"
                  type="text"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  v-model="accountForm.email"
                  type="email"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input
                  id="phone"
                  v-model="accountForm.phone"
                  type="tel"
                  class="form-input"
                  placeholder="+34 600 000 000"
                />
              </div>

              <div class="form-group">
                <label for="current-password">Current Password</label>
                <input
                  id="current-password"
                  v-model="accountForm.currentPassword"
                  type="password"
                  class="form-input"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="new-password">New Password</label>
                <input
                  id="new-password"
                  v-model="accountForm.newPassword"
                  type="password"
                  class="form-input"
                  placeholder="Minimum 8 characters"
                  minlength="8"
                />
              </div>

              <div class="form-group">
                <label for="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  v-model="accountForm.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="button-primary"
                :disabled="isUpdating"
              >
                {{ isUpdating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </section>

        <!-- Notification Preferences -->
        <section class="settings-section">
          <div class="section-header-simple">
            <h2>🔔 Notification Preferences</h2>
            <p>Choose how you want to receive notifications</p>
          </div>

          <form @submit.prevent="handleNotificationUpdate" class="settings-form">
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="notificationForm.whatsappEnabled"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">WhatsApp Notifications</span>
                  <span class="checkbox-description">Receive notifications via WhatsApp</span>
                </div>
              </label>

              <label class="checkbox-label">
                <input
                  v-model="notificationForm.emailNotifications"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Email Notifications</span>
                  <span class="checkbox-description">Receive email alerts for important updates</span>
                </div>
              </label>

              <!-- Client-specific notifications -->
              <label v-if="isClient" class="checkbox-label">
                <input
                  v-model="notificationForm.projectUpdates"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Project Updates</span>
                  <span class="checkbox-description">Notify when project status changes</span>
                </div>
              </label>

              <label v-if="isClient" class="checkbox-label">
                <input
                  v-model="notificationForm.deliveryReminders"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Delivery Date Reminders</span>
                  <span class="checkbox-description">Remind me 3 days before delivery dates</span>
                </div>
              </label>

              <!-- Special User notifications -->
              <label v-if="isSpecialUser" class="checkbox-label">
                <input
                  v-model="notificationForm.taskAssignments"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Task Assignments</span>
                  <span class="checkbox-description">Notify when assigned to new tasks</span>
                </div>
              </label>

              <!-- Admin notifications -->
              <label v-if="isAdmin" class="checkbox-label">
                <input
                  v-model="notificationForm.systemAlerts"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">System Alerts</span>
                  <span class="checkbox-description">Critical system notifications and errors</span>
                </div>
              </label>

              <label v-if="isAdmin" class="checkbox-label">
                <input
                  v-model="notificationForm.newUserRegistrations"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">New User Registrations</span>
                  <span class="checkbox-description">Alert when new users register</span>
                </div>
              </label>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="button-primary"
                :disabled="isUpdating"
              >
                {{ isUpdating ? 'Saving...' : 'Save Preferences' }}
              </button>
            </div>
          </form>
        </section>

        <!-- Client-specific settings -->
        <section v-if="isClient" class="settings-section client-section">
          <div class="section-header-simple">
            <h2>📋 Client Preferences</h2>
            <p>Configure your project and collaboration settings</p>
          </div>

          <form @submit.prevent="handleClientSettingsUpdate" class="settings-form">
            <div class="form-group">
              <label for="default-view">Default Project View</label>
              <select
                id="default-view"
                v-model="clientForm.defaultProjectView"
                class="form-input"
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
                <option value="calendar">Calendar View</option>
              </select>
            </div>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="clientForm.autoDownloadReports"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Auto-download Reports</span>
                  <span class="checkbox-description">Automatically download project reports when available</span>
                </div>
              </label>

              <label class="checkbox-label">
                <input
                  v-model="clientForm.showCompletedProjects"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Show Completed Projects</span>
                  <span class="checkbox-description">Display finalized projects in project list</span>
                </div>
              </label>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="button-primary"
                :disabled="isUpdating"
              >
                {{ isUpdating ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
          </form>
        </section>

        <!-- Special User settings -->
        <section v-if="isSpecialUser" class="settings-section special-section">
          <div class="section-header-simple">
            <h2>⚙️ Collaboration Preferences</h2>
            <p>Configure your task and project collaboration settings</p>
          </div>

          <form @submit.prevent="handleSpecialUserSettingsUpdate" class="settings-form">
            <div class="form-group">
              <label for="task-view">Default Task View</label>
              <select
                id="task-view"
                v-model="specialUserForm.defaultTaskView"
                class="form-input"
              >
                <option value="kanban">Kanban Board</option>
                <option value="list">Task List</option>
                <option value="calendar">Calendar</option>
              </select>
            </div>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="specialUserForm.showOnlyMyTasks"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Show Only My Tasks</span>
                  <span class="checkbox-description">Filter to show only tasks assigned to me by default</span>
                </div>
              </label>

              <label class="checkbox-label">
                <input
                  v-model="specialUserForm.enableQuickComments"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Enable Quick Comments</span>
                  <span class="checkbox-description">Show quick comment shortcuts in task view</span>
                </div>
              </label>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="button-primary"
                :disabled="isUpdating"
              >
                {{ isUpdating ? 'Saving...' : 'Save Preferences' }}
              </button>
            </div>
          </form>
        </section>

        <!-- Administration section (only for administrators) -->
        <section v-if="isAdmin" class="settings-section admin-section">
          <div class="section-header">
            <div>
              <h2>⚡ Administration</h2>
              <p>Manage users and system settings</p>
            </div>
            <span class="admin-badge">Admin Only</span>
          </div>
          
          <div class="admin-options">
            <button @click="goToUserManagement" class="admin-option-button">
              <div class="option-icon">👥</div>
              <div class="option-content">
                <h3>User Management</h3>
                <p>Create, edit, and manage system users</p>
              </div>
              <div class="option-arrow">→</div>
            </button>
            
            <button @click="goToBackup" class="admin-option-button">
              <div class="option-icon">💾</div>
              <div class="option-content">
                <h3>Backup & Export</h3>
                <p>Database backup and data export</p>
              </div>
              <div class="option-arrow">→</div>
            </button>
          </div>

          <!-- Admin-specific settings -->
          <form @submit.prevent="handleAdminSettingsUpdate" class="settings-form" style="margin-top: 1.5rem;">
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="adminForm.autoBackupEnabled"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Automatic Daily Backups</span>
                  <span class="checkbox-description">Create automatic database backup every day at 2 AM</span>
                </div>
              </label>

              <label class="checkbox-label">
                <input
                  v-model="adminForm.debugModeEnabled"
                  type="checkbox"
                />
                <div class="checkbox-content">
                  <span class="checkbox-title">Debug Mode</span>
                  <span class="checkbox-description">Enable detailed logging for troubleshooting</span>
                </div>
              </label>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="button-primary"
                :disabled="isUpdating"
              >
                {{ isUpdating ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
          </form>
        </section>

        <!-- Danger Zone (not available for administrators) -->
        <section v-if="!isAdmin" class="settings-section danger-section">
          <div class="section-header-simple">
            <h2>⚠️ Danger Zone</h2>
            <p>Irreversible and destructive actions</p>
          </div>

          <div class="danger-actions">
            <div class="danger-action-item">
              <div>
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data</p>
              </div>
              <button
                @click="showDeleteConfirm = true"
                class="button-danger-outline"
              >
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="modal-overlay"
        @click.self="showDeleteConfirm = false"
        role="dialog"
        aria-modal="true"
      >
        <div class="modal-container modal-small">
          <div class="modal-header">
            <h2>⚠️ Confirm Account Deletion</h2>
            <button
              @click="showDeleteConfirm = false"
              class="modal-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div class="modal-body">
            <p><strong>This action cannot be undone.</strong></p>
            <p>All your data, including:</p>
            <ul>
              <li>Account information</li>
              <li>Project history</li>
              <li>Messages and notifications</li>
              <li>File uploads</li>
            </ul>
            <p>will be permanently deleted.</p>

            <div class="form-group" style="margin-top: 1.5rem;">
              <label for="confirm-delete">Type "<strong>DELETE</strong>" to confirm:</label>
              <input
                id="confirm-delete"
                v-model="deleteConfirmText"
                type="text"
                class="form-input"
                placeholder="DELETE"
              />
            </div>

            <div class="modal-footer">
              <button
                @click="showDeleteConfirm = false"
                class="button-secondary"
              >
                Cancel
              </button>
              <button
                @click="handleAccountDelete"
                class="button-danger"
                :disabled="deleteConfirmText !== 'DELETE' || isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete My Account' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useAuth} from '../composables/use-auth';
import {UserRole} from '../../domain/enumerations/user-role';

const router = useRouter();
const {user, isAdmin, isClient, isSpecialUser, logout} = useAuth();

// State
const isUpdating = ref(false);
const isDeleting = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const showDeleteConfirm = ref(false);
const deleteConfirmText = ref('');

// Account form
const accountForm = ref({
  username: user.value?.username || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// Notification form
const notificationForm = ref({
  whatsappEnabled: user.value?.whatsappEnabled || false,
  emailNotifications: true,
  projectUpdates: true,
  deliveryReminders: true,
  taskAssignments: true,
  systemAlerts: true,
  newUserRegistrations: false,
});

// Client-specific form
const clientForm = ref({
  defaultProjectView: 'grid' as 'grid' | 'list' | 'calendar',
  autoDownloadReports: false,
  showCompletedProjects: true,
});

// Special User form
const specialUserForm = ref({
  defaultTaskView: 'list' as 'kanban' | 'list' | 'calendar',
  showOnlyMyTasks: false,
  enableQuickComments: true,
});

// Admin form
const adminForm = ref({
  autoBackupEnabled: false,
  debugModeEnabled: false,
});

// Computed
const getRoleLabel = computed(() => {
  return () => {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMINISTRATOR]: 'Administrator',
      [UserRole.CLIENT]: 'Client',
      [UserRole.SPECIAL_USER]: 'Special User',
    };
    return user.value?.role ? labels[user.value.role] : 'User';
  };
});

const getRoleBadgeClass = computed(() => {
  return () => {
    const classes: Record<UserRole, string> = {
      [UserRole.ADMINISTRATOR]: 'admin',
      [UserRole.CLIENT]: 'client',
      [UserRole.SPECIAL_USER]: 'special',
    };
    return user.value?.role ? classes[user.value.role] : 'default';
  };
});

// Methods
function showSuccess(message: string): void {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = null;
  }, 5000);
}

function showError(message: string): void {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = null;
  }, 5000);
}

async function handleAccountUpdate(): Promise<void> {
  if (accountForm.value.newPassword && accountForm.value.newPassword !== accountForm.value.confirmPassword) {
    showError('New passwords do not match');
    return;
  }

  isUpdating.value = true;
  try {
    // TODO: Call API to update account
    // await userRepository.updateUser(user.value.id, {...});
    
    showSuccess('Account information updated successfully');
    accountForm.value.currentPassword = '';
    accountForm.value.newPassword = '';
    accountForm.value.confirmPassword = '';
  } catch (error: any) {
    showError(error.message || 'Failed to update account');
  } finally {
    isUpdating.value = false;
  }
}

async function handleNotificationUpdate(): Promise<void> {
  isUpdating.value = true;
  try {
    // TODO: Call API to update notification preferences
    showSuccess('Notification preferences saved');
  } catch (error: any) {
    showError(error.message || 'Failed to save preferences');
  } finally {
    isUpdating.value = false;
  }
}

async function handleClientSettingsUpdate(): Promise<void> {
  isUpdating.value = true;
  try {
    // TODO: Save client-specific settings
    showSuccess('Client preferences saved');
  } catch (error: any) {
    showError(error.message || 'Failed to save settings');
  } finally {
    isUpdating.value = false;
  }
}

async function handleSpecialUserSettingsUpdate(): Promise<void> {
  isUpdating.value = true;
  try {
    // TODO: Save special user settings
    showSuccess('Collaboration preferences saved');
  } catch (error: any) {
    showError(error.message || 'Failed to save preferences');
  } finally {
    isUpdating.value = false;
  }
}

async function handleAdminSettingsUpdate(): Promise<void> {
  isUpdating.value = true;
  try {
    // TODO: Save admin settings
    showSuccess('Admin settings saved');
  } catch (error: any) {
    showError(error.message || 'Failed to save settings');
  } finally {
    isUpdating.value = false;
  }
}

async function handleAccountDelete(): Promise<void> {
  if (deleteConfirmText.value !== 'DELETE') {
    return;
  }

  isDeleting.value = true;
  try {
    // TODO: Call API to delete account
    // await userRepository.deleteUser(user.value.id);
    
    showSuccess('Account deleted. Logging out...');
    setTimeout(async () => {
      await logout();
      router.push({name: 'login'});
    }, 2000);
  } catch (error: any) {
    showError(error.message || 'Failed to delete account');
    isDeleting.value = false;
  }
}

function goToUserManagement(): void {
  router.push({name: 'users'});
}

function goToBackup(): void {
  router.push({name: 'backup'});
}

// Lifecycle
onMounted(() => {
  document.title = 'Settings - Cartographic Project Manager';
  
  // Initialize forms with user data
  if (user.value) {
    accountForm.value.username = user.value.username;
    accountForm.value.email = user.value.email;
    accountForm.value.phone = user.value.phone || '';
    notificationForm.value.whatsappEnabled = user.value.whatsappEnabled;
  }
});
</script>

<style scoped>
.settings-view {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.settings-header h1 {
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  font-size: 2rem;
}

.settings-header p {
  margin: 0;
  color: #666;
}

.user-role-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.user-role-badge.role-admin {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.user-role-badge.role-client {
  background: #e6f2ff;
  color: #0066cc;
  border: 1px solid #b3d9ff;
}

.user-role-badge.role-special {
  background: #e6ffe6;
  color: #28a745;
  border: 1px solid #b3ffb3;
}

/* Message Banners */
.message-banner {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-banner {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.error-banner {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.message-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0 0.5rem;
  transition: opacity 0.2s;
}

.message-close:hover {
  opacity: 1;
}

/* Sections */
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header-simple h2 {
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  font-size: 1.3rem;
  font-weight: 600;
}

.section-header-simple p {
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 0.95rem;
}

/* Forms */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.form-input::placeholder {
  color: #999;
}

/* Checkbox Groups */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.checkbox-label:hover {
  border-color: #0066cc;
  background: white;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 0.25rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.checkbox-title {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.checkbox-description {
  color: #666;
  font-size: 0.85rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

/* Buttons */
.button-primary,
.button-secondary,
.button-danger,
.button-danger-outline {
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

.button-danger {
  background: #dc3545;
  color: white;
}

.button-danger:hover:not(:disabled) {
  background: #c82333;
}

.button-danger-outline {
  background: transparent;
  color: #dc3545;
  border: 2px solid #dc3545;
}

.button-danger-outline:hover {
  background: #dc3545;
  color: white;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Client Section */
.client-section {
  border-left: 4px solid #0066cc;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
}

/* Special User Section */
.special-section {
  border-left: 4px solid #28a745;
  background: linear-gradient(135deg, #f0fff0 0%, #e6ffe6 100%);
}

/* Admin Section */
.admin-section {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
  border: 2px solid #ffcccc;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
  font-size: 1.3rem;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.admin-badge {
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.admin-option-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.admin-option-button:hover {
  border-color: #dc3545;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.15);
  transform: translateY(-2px);
}

.option-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-content h3 {
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
  font-size: 1.1rem;
  font-weight: 600;
}

.option-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.option-arrow {
  font-size: 1.5rem;
  color: #dc3545;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.admin-option-button:hover .option-arrow {
  transform: translateX(4px);
}

/* Danger Zone */
.danger-section {
  border: 2px solid #dc3545;
  background: #fff5f5;
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.danger-action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 1px solid #fcc;
  border-radius: 8px;
  gap: 2rem;
}

.danger-action-item h3 {
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
  font-size: 1rem;
  font-weight: 600;
}

.danger-action-item p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
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
  max-width: 450px;
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
  font-size: 1.3rem;
  color: #1a1a1a;
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
  transition: color 0.2s;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: #666;
}

.modal-body ul li {
  margin: 0.25rem 0;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-view {
    padding: 1rem;
  }

  .settings-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .settings-section {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
  }

  .admin-option-button {
    padding: 1rem;
  }

  .option-icon {
    font-size: 1.75rem;
  }

  .danger-action-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
