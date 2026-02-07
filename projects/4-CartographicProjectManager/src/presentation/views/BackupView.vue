<!--
  @module presentation/views/BackupView
  @description Backup management page (admin only).
  Allows creating manual backups, viewing history,
  and configuring automatic backup schedules.
  @category Presentation
-->
<template>
  <div class="backup-view">
    <div class="container">
      <div class="backup-header">
        <h1>Backup Management</h1>
        <button @click="handleCreateBackup" class="btn btn-primary">
          Create Backup Now
        </button>
      </div>

      <div class="backup-sections">
        <!-- Automatic Backup Configuration -->
        <div class="section-card">
          <h2>Automatic Backup Schedule</h2>
          <div class="schedule-config">
            <div class="config-row">
              <label class="config-label">Frequency</label>
              <select v-model="scheduleConfig.frequency" class="config-input">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div class="config-row">
              <label class="config-label">Time</label>
              <input v-model="scheduleConfig.time" type="time" class="config-input" />
            </div>
            <div class="config-row">
              <label class="config-label">Retention Days</label>
              <input 
                v-model.number="scheduleConfig.retentionDays" 
                type="number" 
                min="1"
                max="365"
                class="config-input" 
              />
            </div>
            <div class="config-row">
              <label class="config-label">Enabled</label>
              <input v-model="scheduleConfig.enabled" type="checkbox" />
            </div>
            <button @click="saveScheduleConfig" class="btn btn-primary btn-sm">
              Save Configuration
            </button>
          </div>
        </div>

        <!-- Backup Statistics -->
        <div class="section-card stats-card">
          <h2>Backup Statistics</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ backupHistory.length }}</span>
              <span class="stat-label">Total Backups</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ lastBackupDate }}</span>
              <span class="stat-label">Last Backup</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalBackupSize }}</span>
              <span class="stat-label">Total Size</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Backup History Table -->
      <div class="section-card">
        <div class="table-header">
          <h2>Backup History</h2>
          <div class="table-actions">
            <input 
              v-model="searchQuery"
              type="search" 
              placeholder="Search backups..." 
              class="search-input"
            />
          </div>
        </div>

        <div v-if="filteredBackups.length > 0" class="table-wrapper">
          <table class="backup-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Size</th>
                <th>Status</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="backup in filteredBackups" :key="backup.id">
                <td>{{ formatDateTime(backup.timestamp) }}</td>
                <td>
                  <span class="type-badge" :class="'type-' + backup.type">
                    {{ backup.type }}
                  </span>
                </td>
                <td>{{ formatSize(backup.size) }}</td>
                <td>
                  <span class="status-badge" :class="'status-' + backup.status.toLowerCase()">
                    {{ backup.status }}
                  </span>
                </td>
                <td>{{ backup.description || 'N/A' }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="handleRestore(backup.id)" 
                      class="btn btn-ghost btn-sm"
                      title="Restore"
                    >
                      Restore
                    </button>
                    <button 
                      @click="handleDownload(backup.id)" 
                      class="btn btn-ghost btn-sm"
                      title="Download"
                    >
                      Download
                    </button>
                    <button 
                      @click="handleDelete(backup.id)" 
                      class="btn btn-ghost btn-sm text-error"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <p>No backups found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const searchQuery = ref('');

const scheduleConfig = ref({
  frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
  time: '02:00',
  retentionDays: 30,
  enabled: true,
});

const backupHistory = ref([
  {
    id: '1',
    timestamp: new Date(Date.now() - 86400000),
    type: 'auto',
    size: 52428800,
    status: 'COMPLETED',
    description: 'Scheduled daily backup',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 172800000),
    type: 'manual',
    size: 48234500,
    status: 'COMPLETED',
    description: 'Manual backup before system update',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 259200000),
    type: 'auto',
    size: 51200000,
    status: 'COMPLETED',
    description: 'Scheduled daily backup',
  },
]);

const filteredBackups = computed(() => {
  if (!searchQuery.value) return backupHistory.value;
  
  const query = searchQuery.value.toLowerCase();
  return backupHistory.value.filter(backup => 
    backup.type.toLowerCase().includes(query) ||
    backup.status.toLowerCase().includes(query) ||
    backup.description?.toLowerCase().includes(query)
  );
});

const lastBackupDate = computed(() => {
  if (backupHistory.value.length === 0) return 'Never';
  const latest = backupHistory.value[0];
  return formatDateTime(latest.timestamp);
});

const totalBackupSize = computed(() => {
  const total = backupHistory.value.reduce((sum, backup) => sum + backup.size, 0);
  return formatSize(total);
});

function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function handleCreateBackup() {
  if (confirm('Create a new backup now?')) {
    alert('Creating backup... (This is a demo)');
  }
}

function saveScheduleConfig() {
  alert('Backup schedule configuration saved! (This is a demo)');
}

function handleRestore(backupId: string) {
  if (confirm('Are you sure you want to restore from this backup? Current data will be replaced.')) {
    alert(`Restoring backup ${backupId}... (This is a demo)`);
  }
}

function handleDownload(backupId: string) {
  alert(`Downloading backup ${backupId}... (This is a demo)`);
}

function handleDelete(backupId: string) {
  if (confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
    backupHistory.value = backupHistory.value.filter(b => b.id !== backupId);
  }
}

onMounted(() => {
  // Load backup configuration and history
});
</script>

<style scoped>
.backup-view {
  min-height: 100vh;
  background: var(--color-bg-secondary);
  padding: var(--spacing-8) 0;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.backup-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.backup-sections {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.section-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
}

.section-card h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-4);
}

.schedule-config {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.config-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.config-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  min-width: 120px;
}

.config-input {
  flex: 1;
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.stats-card {
  display: flex;
  flex-direction: column;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  flex: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.table-actions {
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

.table-wrapper {
  overflow-x: auto;
}

.backup-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.backup-table thead {
  background: var(--color-bg-secondary);
}

.backup-table th {
  text-align: left;
  padding: var(--spacing-3) var(--spacing-4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  border-bottom: 2px solid var(--color-border);
}

.backup-table tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: var(--transition-fast);
}

.backup-table tbody tr:hover {
  background: var(--color-bg-secondary);
}

.backup-table td {
  padding: var(--spacing-3) var(--spacing-4);
}

.type-badge,
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.type-badge.type-auto {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.type-badge.type-manual {
  background: var(--color-accent);
  color: var(--color-secondary);
}

.status-badge.status-completed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge.status-failed {
  background: #ffebee;
  color: var(--color-error);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-2);
}

.text-error {
  color: var(--color-error);
}

.text-error:hover {
  background: #ffebee;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-4);
}

.empty-state p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

@media (max-width: 1023px) {
  .backup-sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .backup-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
  
  .search-input {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
