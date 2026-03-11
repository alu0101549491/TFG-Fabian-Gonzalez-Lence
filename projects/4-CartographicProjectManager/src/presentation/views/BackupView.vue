<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since 2025-01-08
  @file src/presentation/views/BackupView.vue
  @desc Admin-only backup management view with manual backup creation,
        automatic schedule configuration, history, and export options.
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
  @see {@link https://vuejs.org/guide/components/registration.html}
-->

<template>
  <div class="backup-view">
    <!-- Access Control -->
    <div v-if="!isAdmin" class="access-denied">
      <div class="denied-icon">🔒</div>
      <h2>Access Denied</h2>
      <p>This page is only accessible to administrators.</p>
      <router-link to="/" class="button-primary">
        Go to Dashboard
      </router-link>
    </div>

    <template v-else>
      <LoadingSpinner v-if="isLoading" />

      <template v-else>
        <!-- Backup Header -->
        <header class="backup-header">
          <div class="header-content">
            <h1>Backup Management</h1>
            <p class="backup-subtitle">
              Manage system backups, exports, and data synchronization
            </p>
          </div>
          <button
            @click="handleCreateBackup"
            class="button-primary"
            :disabled="isCreatingBackup"
          >
            {{ isCreatingBackup ? 'Creating...' : '+ Create Backup' }}
          </button>
        </header>

        <!-- Backup Statistics -->
        <section class="stats-section" aria-label="Backup statistics">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-value">{{ backupHistory.length }}</div>
              <div class="stat-label">Total Backups</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">{{ lastBackupDate }}</div>
              <div class="stat-label">Last Backup</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💾</div>
            <div class="stat-content">
              <div class="stat-value">{{ totalBackupSize }}</div>
              <div class="stat-label">Total Size</div>
            </div>
          </div>
        </section>

        <!-- Main Content Grid -->
        <div class="backup-grid">
          <!-- Backup Schedule Configuration -->
          <section class="backup-section schedule-section">
            <h2>Automatic Backup Schedule</h2>
            <form @submit.prevent="handleSaveSchedule" class="schedule-form">
              <div class="form-group">
                <label for="frequency">Frequency</label>
                <select
                  id="frequency"
                  v-model="scheduleConfig.frequency"
                  class="form-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div class="form-group">
                <label for="backup-time">Backup Time</label>
                <input
                  id="backup-time"
                  v-model="scheduleConfig.time"
                  type="time"
                  class="form-input"
                  :disabled="scheduleConfig.frequency === 'disabled'"
                />
              </div>

              <div class="form-group">
                <label for="retention">Retention Period (days)</label>
                <input
                  id="retention"
                  v-model.number="scheduleConfig.retentionDays"
                  type="number"
                  min="1"
                  max="365"
                  class="form-input"
                />
                <p class="form-help">
                  Backups older than this will be automatically deleted
                </p>
              </div>

              <button
                type="submit"
                class="button-primary"
                :disabled="isSavingSchedule"
              >
                {{ isSavingSchedule ? 'Saving...' : 'Save Schedule' }}
              </button>
            </form>
          </section>

          <!-- Export Options -->
          <section class="backup-section export-section">
            <h2>Data Export</h2>
            <p class="section-description">
              Export project data in various formats
            </p>

            <div class="export-options">
              <button
                @click="handleExport('excel')"
                class="export-button"
                :disabled="isExporting"
              >
                <span class="export-icon">📗</span>
                <span class="export-label">Export as Excel</span>
                <span class="export-description">XLSX spreadsheet</span>
              </button>

              <button
                @click="handleExport('csv')"
                class="export-button"
                :disabled="isExporting"
              >
                <span class="export-icon">📊</span>
                <span class="export-label">Export as CSV</span>
                <span class="export-description">Spreadsheet format</span>
              </button>

              <button
                @click="handleExport('pdf')"
                class="export-button"
                :disabled="isExporting"
              >
                <span class="export-icon">📋</span>
                <span class="export-label">Export as PDF</span>
                <span class="export-description">Project reports</span>
              </button>
            </div>
          </section>
        </div>

        <!-- Backup History -->
        <section class="backup-section history-section">
          <div class="section-header">
            <h2>Backup History</h2>
            <div class="section-actions">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search backups..."
                class="search-input"
                aria-label="Search backups"
              />
            </div>
          </div>

          <div v-if="filteredBackups.length > 0" class="backup-table-wrapper">
            <table class="backup-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="backup in filteredBackups" :key="backup.filename">
                  <td>{{ formatBackupDate(backup.createdAt) }}</td>
                  <td>
                    <span :class="['backup-type', `type-${backup.type}`]">
                      {{ formatBackupType(backup.type) }}
                    </span>
                  </td>
                  <td>{{ formatFileSize(backup.size) }}</td>
                  <td>
                    <span :class="['backup-status', `status-${backup.status}`]">
                      {{ formatBackupStatus(backup.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button
                        @click="handleDownloadBackup(backup)"
                        class="action-button"
                        title="Download"
                        :disabled="backup.status !== 'completed'"
                      >
                        ⬇
                      </button>
                      <button
                        @click="handleRestoreBackup(backup)"
                        class="action-button"
                        title="Restore"
                        :disabled="backup.status !== 'completed'"
                      >
                        ↺
                      </button>
                      <button
                        @click="handleDeleteBackup(backup)"
                        class="action-button action-delete"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state">
            <p>{{ searchQuery ? 'No backups match your search.' : 'No backup history available.' }}</p>
          </div>
        </section>

        <!-- Restore Confirmation Modal -->
        <Teleport to="body">
          <div
            v-if="showRestoreModal"
            class="modal-overlay"
            @click.self="showRestoreModal = false"
          >
            <div class="modal-content modal-small" role="dialog" aria-labelledby="restore-title">
              <div class="modal-header">
                <h2 id="restore-title">Confirm Restore</h2>
                <button
                  @click="showRestoreModal = false"
                  class="button-icon"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <div class="modal-body">
                <p class="text-warning">
                  ⚠️ Warning: This will replace all current data with the backup data.
                </p>
                <p>
                  Are you sure you want to restore from:
                  <strong>{{ backupToRestore?.createdAt ? formatBackupDate(backupToRestore.createdAt) : '' }}</strong>?
                </p>
              </div>
              <div class="modal-footer">
                <button
                  @click="showRestoreModal = false"
                  class="button-ghost"
                >
                  Cancel
                </button>
                <button
                  @click="handleRestoreConfirm"
                  class="button-danger"
                  :disabled="isRestoring"
                >
                  {{ isRestoring ? 'Restoring...' : 'Restore Backup' }}
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, inject} from 'vue';
import {useAuth} from '../composables/use-auth';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import {httpClient} from '../../infrastructure/http';
import {TOAST_KEY} from '@/presentation/keys/toast.key';

// Types
interface BackupRecord {
  filename: string;
  createdAt: Date;
  type: 'manual' | 'automatic';
  size: number;
  status: 'pending' | 'completed' | 'failed';
}

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'disabled';
  time: string;
  retentionDays: number;
}

interface BackupApiDto {
  filename: string;
  created: string;
  size: number;
  type: 'manual' | 'automatic';
  age?: string;
}

interface ScheduleApiDto {
  frequency: ScheduleConfig['frequency'];
  time: string;
  retentionDays: number;
}

interface ToastPayload {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

// Composables
const {isAdmin} = useAuth();

const toast = inject(TOAST_KEY, undefined);

function notify(payload: ToastPayload): void {
  if (toast) {
    toast(payload);
    return;
  }

  // Fallback (should be rare)
  if (payload.type === 'error') {
    console.error(payload.title ?? 'Error', payload.message);
  }
}

// Local State
const isLoading = ref(false);
const isCreatingBackup = ref(false);
const isSavingSchedule = ref(false);
const isExporting = ref(false);
const isRestoring = ref(false);
const searchQuery = ref('');
const showRestoreModal = ref(false);
const backupToRestore = ref<BackupRecord | null>(null);

const scheduleConfig = ref<ScheduleConfig>({
  frequency: 'weekly',
  time: '02:00',
  retentionDays: 30,
});

const backupHistory = ref<BackupRecord[]>([]);

// Computed Properties
const lastBackupDate = computed(() => {
  if (backupHistory.value.length === 0) return 'Never';
  const latest = backupHistory.value[0];
  return formatBackupDate(latest.createdAt);
});

const totalBackupSize = computed(() => {
  const totalBytes = backupHistory.value.reduce((sum, b) => sum + b.size, 0);
  return formatFileSize(totalBytes);
});

const filteredBackups = computed(() => {
  if (!searchQuery.value) return backupHistory.value;

  const query = searchQuery.value.toLowerCase();
  return backupHistory.value.filter((backup) =>
    formatBackupDate(backup.createdAt).toLowerCase().includes(query) ||
    backup.type.toLowerCase().includes(query) ||
    backup.status.toLowerCase().includes(query)
  );
});

function mapBackupDto(dto: BackupApiDto): BackupRecord {
  return {
    filename: dto.filename,
    createdAt: new Date(dto.created),
    type: dto.type,
    size: dto.size,
    status: 'completed',
  };
}

async function refreshBackupHistory(): Promise<void> {
  const response = await httpClient.get<BackupApiDto[]>('/backup/list');
  backupHistory.value = response.data.map(mapBackupDto);
}

async function loadScheduleConfig(): Promise<void> {
  const response = await httpClient.get<ScheduleApiDto>('/backup/schedule');
  scheduleConfig.value = {
    frequency: response.data.frequency,
    time: response.data.time,
    retentionDays: response.data.retentionDays,
  };
}

// Methods
/**
 * Format backup date for display
 *
 * @param {Date} date - Backup creation date
 * @returns {string} Formatted date string
 */
function formatBackupDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format backup type for display
 *
 * @param {string} type - Backup type
 * @returns {string} Formatted type
 */
function formatBackupType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format backup status for display
 *
 * @param {string} status - Backup status
 * @returns {string} Formatted status
 */
function formatBackupStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Format file size for display
 *
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Handle manual backup creation
 */
async function handleCreateBackup(): Promise<void> {
  isCreatingBackup.value = true;
  try {
    await httpClient.post<BackupApiDto>('/backup/create');
    await refreshBackupHistory();
    notify({type: 'success', title: 'Backup', message: 'Backup created successfully.'});
  } catch (error) {
    console.error('Failed to create backup:', error);
    notify({type: 'error', title: 'Backup', message: 'Failed to create backup.'});
  } finally {
    isCreatingBackup.value = false;
  }
}

/**
 * Handle schedule configuration save
 */
async function handleSaveSchedule(): Promise<void> {
  isSavingSchedule.value = true;
  try {
    await httpClient.put<ScheduleApiDto>('/backup/schedule', scheduleConfig.value);
    await loadScheduleConfig();
    notify({
      type: 'success',
      title: 'Schedule',
      message: 'Schedule configuration saved successfully.',
    });
  } catch (error) {
    console.error('Failed to save schedule:', error);
    notify({type: 'error', title: 'Schedule', message: 'Failed to save schedule.'});
  } finally {
    isSavingSchedule.value = false;
  }
}

/**
 * Handle data export
 *
 * @param {string} format - Export format (json, csv, pdf)
 */
async function handleExport(format: string): Promise<void> {
  isExporting.value = true;
  try {
    // Map frontend format to backend format and file extension
    const formatMap: Record<string, {backend: string; ext: string}> = {
      'excel': { backend: 'excel', ext: 'xlsx' },
      'csv': { backend: 'csv', ext: 'csv' },
      'pdf': { backend: 'pdf', ext: 'pdf' },
    };
    
    const formatInfo = formatMap[format] || { backend: 'csv', ext: 'csv' };
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `projects_export_${timestamp}.${formatInfo.ext}`;
    
    // Call backend export API
    const blob = await httpClient.downloadFile(
      `/export/projects?format=${formatInfo.backend}`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(downloadUrl);

    notify({
      type: 'success',
      title: 'Export',
      message: `Data exported as ${format.toUpperCase()} successfully.`,
    });
  } catch (error) {
    console.error(`Failed to export as ${format}:`, error);
    notify({
      type: 'error',
      title: 'Export',
      message: `Failed to export as ${format}. Please ensure you are logged in as an administrator.`,
    });
  } finally {
    isExporting.value = false;
  }
}

/**
 * Handle backup download
 *
 * @param {BackupRecord} backup - Backup to download
 */
async function handleDownloadBackup(backup: BackupRecord): Promise<void> {
  try {
    const encoded = encodeURIComponent(backup.filename);
    const blob = await httpClient.downloadFile(`/backup/${encoded}/download`, {
      responseType: 'blob',
    });

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = backup.filename;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Failed to download backup:', error);
    notify({type: 'error', title: 'Backup', message: 'Failed to download backup.'});
  }
}

/**
 * Start backup restore flow
 *
 * @param {BackupRecord} backup - Backup to restore
 */
function handleRestoreBackup(backup: BackupRecord): void {
  backupToRestore.value = backup;
  showRestoreModal.value = true;
}

/**
 * Confirm and execute backup restore
 */
async function handleRestoreConfirm(): Promise<void> {
  if (!backupToRestore.value) return;

  isRestoring.value = true;
  try {
    await httpClient.post<void>('/backup/restore', {
      filename: backupToRestore.value.filename,
    });
    showRestoreModal.value = false;
    notify({
      type: 'success',
      title: 'Restore',
      message: 'Backup restored successfully. Reloading...',
    });
    window.location.reload();
  } catch (error) {
    console.error('Failed to restore backup:', error);
    notify({type: 'error', title: 'Restore', message: 'Failed to restore backup.'});
  } finally {
    isRestoring.value = false;
  }
}

/**
 * Handle backup deletion
 *
 * @param {BackupRecord} backup - Backup to delete
 */
async function handleDeleteBackup(backup: BackupRecord): Promise<void> {
  if (!confirm(`Delete backup from ${formatBackupDate(backup.createdAt)}?`)) {
    return;
  }

  try {
    const encoded = encodeURIComponent(backup.filename);
    await httpClient.delete<void>(`/backup/${encoded}`);
    await refreshBackupHistory();
    notify({type: 'success', title: 'Backup', message: 'Backup deleted successfully.'});
  } catch (error) {
    console.error('Failed to delete backup:', error);
    notify({type: 'error', title: 'Backup', message: 'Failed to delete backup.'});
  }
}

// Lifecycle
onMounted(async () => {
  if (!isAdmin.value) return;

  isLoading.value = true;
  try {
    await Promise.all([
      refreshBackupHistory(),
      loadScheduleConfig(),
    ]);
  } catch (error) {
    console.error('Failed to load backup data:', error);
    notify({type: 'error', title: 'Backup', message: 'Failed to load backup data.'});
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.backup-view {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-6);
}

/* Access Denied */
.access-denied {
  text-align: center;
  padding: var(--spacing-16);
}

.denied-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

.access-denied h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
}

.access-denied p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

/* Header */
.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
  gap: var(--spacing-4);
}

.header-content h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
}

.backup-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

/* Statistics */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

.status-connected {
  color: var(--color-success);
}

.status-disconnected {
  color: var(--color-text-muted);
}

/* Grid Layout */
.backup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

/* Section Cards */
.backup-section {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.backup-section h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-4);
}

.section-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-5);
  line-height: 1.6;
}

/* Schedule Form */
.schedule-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-input,
.form-select {
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.form-help {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

/* Export Options */
.export-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.export-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-all);
  text-align: left;
}

.export-button:hover:not(:disabled) {
  background: var(--color-bg-hover);
  box-shadow: var(--shadow-sm);
}

.export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-2);
}

.export-label {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-1);
}

.export-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Dropbox Section */
.dropbox-info,
.dropbox-connect {
  margin-top: var(--spacing-4);
}

.dropbox-actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);
}

/* History Section */
.history-section {
  grid-column: 1 / -1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
}

.section-actions {
  display: flex;
  gap: var(--spacing-3);
}

.search-input {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  min-width: 250px;
}

/* Backup Table */
.backup-table-wrapper {
  overflow-x: auto;
}

.backup-table {
  width: 100%;
  border-collapse: collapse;
}

.backup-table th,
.backup-table td {
  padding: var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.backup-table th {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.backup-type,
.backup-status {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.type-manual {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.type-automatic {
  background: var(--color-gray-200);
  color: var(--color-gray-700);
}

.status-completed {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.status-pending {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.status-failed {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.table-actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-button {
  padding: var(--spacing-2);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-all);
  font-size: var(--font-size-base);
}

.action-button:hover:not(:disabled) {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-delete:hover:not(:disabled) {
  background: var(--color-error-light);
  color: var(--color-error);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--color-text-muted);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.modal-content {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
}

.modal-small {
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.modal-body {
  padding: var(--spacing-6);
}

.modal-body p {
  margin-bottom: var(--spacing-4);
  line-height: 1.6;
}

.text-warning {
  color: var(--color-warning);
  font-weight: var(--font-weight-medium);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  border-top: 1px solid var(--color-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .backup-view {
    padding: var(--spacing-4);
  }

  .backup-header {
    flex-direction: column;
    align-items: stretch;
  }

  .backup-grid {
    grid-template-columns: 1fr;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }

  .search-input {
    width: 100%;
    min-width: 0;
  }

  .backup-table {
    font-size: var(--font-size-sm);
  }

  .dropbox-actions {
    flex-direction: column;
  }
}

/* Button Styles */
.button-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  background-color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  text-decoration: none;
}

.button-primary:hover {
  background-color: var(--color-primary-700);
}

.button-primary:active {
  background-color: var(--color-primary-800);
}

.button-primary:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
}

.button-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
}

.button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.button-icon:hover {
  color: var(--color-text-primary);
  background-color: var(--color-gray-100);
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .header-content h1 {
    font-size: var(--font-size-2xl);
  }
}
</style>
