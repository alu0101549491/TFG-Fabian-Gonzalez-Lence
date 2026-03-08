<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/components/file/FileList.vue
  @desc File list with grid/list views, search, sort, and section filtering
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="file-list">
    <!-- Header: Search, View Toggle, Upload Button -->
    <div class="file-list-header">
      <!-- Search -->
      <div class="file-list-search">
        <span class="file-list-search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="search"
          class="file-list-search-input"
          placeholder="Search files..."
        />
        <button
          v-if="searchQuery"
          type="button"
          class="file-list-search-clear"
          aria-label="Clear search"
          @click="searchQuery = ''"
        >
          ✕
        </button>
      </div>

      <!-- Actions -->
      <div class="file-list-actions">
        <!-- Sort -->
        <select v-model="sortBy" class="file-list-sort" aria-label="Sort files">
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="size-desc">Largest First</option>
          <option value="size-asc">Smallest First</option>
        </select>

        <!-- View mode toggle -->
        <div class="file-list-view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            :class="['file-list-view-btn', {active: viewModeInternal === 'grid'}]"
            title="Grid view"
            aria-label="Grid view"
            @click="viewModeInternal = 'grid'"
          >
            <span>📊</span>
          </button>
          <button
            type="button"
            :class="['file-list-view-btn', {active: viewModeInternal === 'list'}]"
            title="List view"
            aria-label="List view"
            @click="viewModeInternal = 'list'"
          >
            <span>📋</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Section tabs -->
    <div v-if="sections && sections.length > 0" class="file-list-sections">
      <button
        :class="['file-list-section-tab', {active: !activeSectionInternal}]"
        @click="setActiveSection('')"
      >
        All Files
        <span class="file-list-section-count">{{ files.length }}</span>
      </button>
      <button
        v-for="section in sections"
        :key="section"
        :class="['file-list-section-tab', {active: activeSectionInternal === section}]"
        @click="setActiveSection(section)"
      >
        {{ section }}
        <span class="file-list-section-count">{{ getFileCountBySection(section) }}</span>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="file-list-loading">
      <div v-for="n in 6" :key="n" class="file-card-skeleton">
        <div class="skeleton-icon" />
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-line-long" />
          <div class="skeleton-line skeleton-line-short" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredFiles.length === 0" class="file-list-empty">
      <span class="file-list-empty-icon">📂</span>
      <h3 class="file-list-empty-title">
        {{ searchQuery ? 'No files match your search' : emptyMessage }}
      </h3>
      <p v-if="!searchQuery && canUpload" class="file-list-empty-description">
        Upload files to get started.
      </p>
      <button
        v-if="searchQuery"
        type="button"
        class="file-list-empty-action"
        @click="searchQuery = ''"
      >
        Clear search
      </button>
    </div>

    <!-- Grid view -->
    <div v-else-if="viewModeInternal === 'grid'" class="file-list-grid">
      <div
        v-for="file in filteredFiles"
        :key="file.id"
        class="file-card"
        role="button"
        tabindex="0"
        @click="emit('file-click', file)"
        @keydown.enter="emit('file-click', file)"
        @keydown.space.prevent="emit('file-click', file)"
      >
        <!-- File icon/preview -->
        <div class="file-card-preview">
          <span
            class="file-card-icon"
            :class="`file-card-icon-${file.type.toLowerCase()}`"
          >
            {{ getFileIcon(file.type) }}
          </span>
        </div>

        <!-- File info -->
        <div class="file-card-info">
          <span class="file-card-name" :title="file.name">{{ file.name }}</span>
          <span class="file-card-meta">
            {{ formatFileSize(file.sizeInBytes) }} • {{ formatRelativeDate(file.uploadedAt) }}
          </span>
        </div>

        <!-- Actions -->
        <div class="file-card-actions" @click.stop>
          <button
            type="button"
            class="file-card-action"
            title="Download"
            aria-label="Download file"
            @click="emit('file-download', file)"
          >
            ⬇️
          </button>
          <button
            v-if="canPreview(file)"
            type="button"
            class="file-card-action"
            title="Preview"
            aria-label="Preview file"
            @click="emit('file-preview', file)"
          >
            👁️
          </button>
          <button
            v-if="canDeleteFile(file)"
            type="button"
            class="file-card-action file-card-action-danger"
            title="Delete"
            aria-label="Delete file"
            @click="emit('file-delete', file)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- List view -->
    <div v-else class="file-list-table">
      <table>
        <thead>
          <tr>
            <th class="file-list-th-name">Name</th>
            <th class="file-list-th-section">Section</th>
            <th class="file-list-th-size">Size</th>
            <th class="file-list-th-date">Uploaded</th>
            <th class="file-list-th-uploader">By</th>
            <th class="file-list-th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in filteredFiles"
            :key="file.id"
            class="file-list-row"
            tabindex="0"
            @click="emit('file-click', file)"
            @keydown.enter="emit('file-click', file)"
            @keydown.space.prevent="emit('file-click', file)"
          >
            <td class="file-list-td-name">
              <span
                class="file-list-icon"
                :class="`file-list-icon-${file.type.toLowerCase()}`"
              >
                {{ getFileIcon(file.type) }}
              </span>
              <span class="file-list-name" :title="file.name">{{ file.name }}</span>
            </td>
            <td class="file-list-td-section">
              <span class="file-list-section-badge">{{ file.section ?? '' }}</span>
            </td>
            <td class="file-list-td-size">{{ formatFileSize(file.sizeInBytes) }}</td>
            <td class="file-list-td-date">{{ formatRelativeDate(file.uploadedAt) }}</td>
            <td class="file-list-td-uploader">{{ file.uploaderName }}</td>
            <td class="file-list-td-actions" @click.stop>
              <button
                type="button"
                class="file-list-action"
                title="Download"
                aria-label="Download file"
                @click="emit('file-download', file)"
              >
                ⬇️
              </button>
              <button
                v-if="canPreview(file)"
                type="button"
                class="file-list-action"
                title="Preview"
                aria-label="Preview file"
                @click="emit('file-preview', file)"
              >
                👁️
              </button>
              <button
                v-if="canDeleteFile(file)"
                type="button"
                class="file-list-action file-list-action-danger"
                title="Delete"
                aria-label="Delete file"
                @click="emit('file-delete', file)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- File count footer -->
    <div v-if="!loading && filteredFiles.length > 0" class="file-list-footer">
      <span>{{ filteredFiles.length }} file{{ filteredFiles.length !== 1 ? 's' : '' }}</span>
      <span>•</span>
      <span>{{ formatFileSize(totalSize) }} total</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import type {FileDto, FileSummaryDto} from '@/application/dto';
import {FileType} from '@/domain/enumerations';
import {formatFileSize} from '@/shared/utils';

export type FileListItemDto =
  | FileDto
  | (FileSummaryDto & {
      section?: string | null;
    });

/**
 * FileList component props
 */
export interface FileListProps {
  /** Files to display */
  files: FileListItemDto[];
  /** Project sections */
  sections?: string[];
  /** Active section filter */
  activeSection?: string;
  /** View mode */
  viewMode?: 'grid' | 'list';
  /** Loading state */
  loading?: boolean;
  /** Can user delete files (admin override) */
  canDelete?: boolean;
  /** Can user upload files */
  canUpload?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Current user ID for permission checks */
  currentUserId?: string;
  /** Is current user an admin */
  isAdmin?: boolean;
}

/**
 * FileList component emits
 */
export interface FileListEmits {
  (e: 'file-click', file: FileListItemDto): void;
  (e: 'file-download', file: FileListItemDto): void;
  (e: 'file-preview', file: FileListItemDto): void;
  (e: 'file-delete', file: FileListItemDto): void;
  (e: 'section-change', section: string): void;
}

const props = withDefaults(defineProps<FileListProps>(), {
  sections: () => [],
  viewMode: 'grid',
  loading: false,
  canDelete: false,
  canUpload: true,
  emptyMessage: 'No files uploaded yet',
  currentUserId: '',
  isAdmin: false,
});

const emit = defineEmits<FileListEmits>();

// State
const searchQuery = ref('');
const sortBy = ref('date-desc');
const viewModeInternal = ref(props.viewMode);
const activeSectionInternal = ref(props.activeSection || '');

// Watch for prop changes
watch(
  () => props.viewMode,
  (val) => {
    viewModeInternal.value = val;
  },
);
watch(
  () => props.activeSection,
  (val) => {
    activeSectionInternal.value = val || '';
  },
);

// Filtered and sorted files
const filteredFiles = computed(() => {
  let result = [...props.files];

  // Filter by section
  if (activeSectionInternal.value) {
    result = result.filter((f) => f.section === activeSectionInternal.value);
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(query) || f.uploaderName.toLowerCase().includes(query),
    );
  }

  // Sort
  const [sortField, sortOrder] = sortBy.value.split('-');
  const isAsc = sortOrder === 'asc';

  if (sortField === 'date') {
    const filesWithSortKeys = result.map((file) => ({
      file,
      uploadedAtMs: new Date(file.uploadedAt).getTime(),
    }));

    filesWithSortKeys.sort((a, b) => (isAsc ? 1 : -1) * (a.uploadedAtMs - b.uploadedAtMs));
    result = filesWithSortKeys.map((item) => item.file);
  } else {
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.sizeInBytes - b.sizeInBytes;
          break;
      }

      return isAsc ? comparison : -comparison;
    });
  }

  return result;
});

// Total size
const totalSize = computed(() => filteredFiles.value.reduce((sum, f) => sum + f.sizeInBytes, 0));

/**
 * Get file count by section
 */
function getFileCountBySection(section: string): number {
  return props.files.filter((f) => f.section === section).length;
}

/**
 * Set active section
 */
function setActiveSection(section: string): void {
  activeSectionInternal.value = section;
  emit('section-change', section);
}

/**
 * Check if file is image
 */
function canPreview(file: FileListItemDto): boolean {
  return file.type === FileType.IMAGE || file.type === FileType.PDF;
}

/**
 * Check if current user can delete a specific file
 * User can delete if they are admin OR if they uploaded the file
 */
function canDeleteFile(file: FileListItemDto): boolean {
  // Admin can delete any file (or if canDelete prop is true for backwards compatibility)
  if (props.canDelete || props.isAdmin) {
    return true;
  }
  
  // User can delete their own files
  if (props.currentUserId && file.uploadedBy === props.currentUserId) {
    return true;
  }
  
  return false;
}

/**
 * Get file icon emoji
 */
function getFileIcon(fileType: FileType): string {
  const icons: Record<FileType, string> = {
    [FileType.PDF]: '📄',
    [FileType.KML]: '🗺️',
    [FileType.SHP]: '🗺️',
    [FileType.DOCUMENT]: '📄',
    [FileType.IMAGE]: '🖼',
    [FileType.SPREADSHEET]: '📊',
    [FileType.CAD]: '📐',
    [FileType.COMPRESSED]: '📦',
  };
  return icons[fileType] || '📎';
}

/**
 * Format date relative to now
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
</script>

<style scoped>
.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* Header */
.file-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

/* Search */
.file-list-search {
  position: relative;
  flex: 1 1 auto;
  min-width: 200px;
  max-width: 400px;
}

.file-list-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
  opacity: 0.6;
  color: var(--color-text-secondary);
}

.file-list-search-input {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 32px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.file-list-search-input::placeholder {
  color: var(--color-text-tertiary);
  opacity: 0.7;
}

.file-list-search-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.file-list-search-clear {
  position: absolute;
  right: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.file-list-search-clear:hover {
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
}

/* Actions */
.file-list-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.file-list-sort {
  height: 36px;
  padding: 0 var(--spacing-8) 0 var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  cursor: pointer;
}

.file-list-view-toggle {
  display: flex;
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);
  padding: 2px;
}

.file-list-view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: var(--color-gray-500);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-list-view-btn:hover {
  color: var(--color-gray-700);
}

.file-list-view-btn.active {
  color: var(--color-primary-600);
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
}

/* Section tabs */
.file-list-sections {
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-1);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.file-list-section-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.file-list-section-tab:hover {
  color: var(--color-text-primary);
}

.file-list-section-tab.active {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
}

.file-list-section-count {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-500);
  background-color: var(--color-gray-200);
  padding: 0 6px;
  border-radius: var(--radius-full);
}

.file-list-section-tab.active .file-list-section-count {
  color: var(--color-primary-700);
  background-color: var(--color-primary-100);
}

/* Loading state */
.file-list-loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-4);
}

.file-card-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-3);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.skeleton-line {
  height: 12px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line-long {
  width: 100%;
}
.skeleton-line-short {
  width: 60%;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Empty state */
.file-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
}

.file-list-empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-4);
}

.file-list-empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}

.file-list-empty-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-4);
}

.file-list-empty-action {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

/* Grid view */
.file-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-4);
}

.file-card {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-4);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.file-card:hover,
.file-card:focus {
  outline: none;
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-md);
}

.file-card-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  margin-bottom: var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.file-card-thumbnail {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.file-card-icon {
  font-size: 40px;
}

.file-card-icon-pdf {
  filter: hue-rotate(340deg);
}
.file-card-icon-kml,
.file-card-icon-shp {
  filter: hue-rotate(100deg);
}
.file-card-icon-document {
  filter: hue-rotate(340deg);
}
.file-card-icon-image {
  filter: hue-rotate(340deg);
}
.file-card-icon-spreadsheet {
  filter: hue-rotate(100deg);
}
.file-card-icon-cad {
  filter: hue-rotate(40deg);
}
.file-card-icon-compressed {
  filter: grayscale(100%);
}

.file-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.file-card-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-card-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.file-card-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-1);
  margin-top: var(--spacing-3);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border-primary);
}

.file-card-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-card-action:hover {
  background-color: var(--color-gray-100);
}

.file-card-action-danger:hover {
  background-color: var(--color-error-50);
}

/* List/Table view */
.file-list-table {
  overflow-x: auto;
}

.file-list-table table {
  width: 100%;
  border-collapse: collapse;
}

.file-list-table th {
  padding: var(--spacing-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-gray-50);
  border-bottom: 1px solid var(--color-border-primary);
}

.file-list-th-name {
  min-width: 200px;
}
.file-list-th-section {
  width: 150px;
}
.file-list-th-size {
  width: 100px;
}
.file-list-th-date {
  width: 120px;
}
.file-list-th-uploader {
  width: 150px;
}
.file-list-th-actions {
  width: 120px;
  text-align: center;
}

.file-list-row {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.file-list-row:hover,
.file-list-row:focus {
  outline: none;
  background-color: var(--color-gray-50);
}

.file-list-row td {
  padding: var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-primary);
}

.file-list-td-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.file-list-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.file-list-icon-pdf {
  filter: hue-rotate(340deg);
}
.file-list-icon-kml,
.file-list-icon-shp {
  filter: hue-rotate(100deg);
}
.file-list-icon-document {
  filter: hue-rotate(340deg);
}
.file-list-icon-image {
  filter: hue-rotate(340deg);
}
.file-list-icon-spreadsheet {
  filter: hue-rotate(100deg);
}
.file-list-icon-cad {
  filter: hue-rotate(40deg);
}
.file-list-icon-compressed {
  filter: grayscale(100%);
}

.file-list-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-list-section-badge {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  background-color: var(--color-gray-100);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
}

.file-list-td-actions {
  text-align: center;
}

.file-list-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 16px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-list-action:hover {
  background-color: var(--color-gray-100);
}

.file-list-action-danger:hover {
  background-color: var(--color-error-50);
}

/* Footer */
.file-list-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .file-list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .file-list-search {
    max-width: none;
  }

  .file-list-actions {
    justify-content: space-between;
  }

  .file-list-table {
    font-size: var(--font-size-xs);
  }

  .file-list-th-section,
  .file-list-th-uploader,
  .file-list-td-section,
  .file-list-td-uploader {
    display: none;
  }
}
</style>
