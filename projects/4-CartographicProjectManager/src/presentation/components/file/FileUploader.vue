<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 16, 2026
  @file src/presentation/components/file/FileUploader.vue
  @desc Drag-and-drop file uploader with queue management and progress tracking
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div class="file-uploader">
    <!-- Section selector -->
    <div class="file-uploader-section">
      <label for="upload-section" class="file-uploader-label"> Upload to Section </label>
      <select id="upload-section" v-model="selectedSection" class="file-uploader-select">
        <option v-for="section in sections" :key="section" :value="section">
          {{ section }}
        </option>
      </select>
    </div>

    <!-- Drop zone -->
    <div
      :class="[
        'file-uploader-dropzone',
        {
          'file-uploader-dropzone-active': isDragging,
          'file-uploader-dropzone-disabled': uploading,
        },
      ]"
      role="button"
      :tabindex="uploading ? -1 : 0"
      :aria-disabled="uploading"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      @keydown.enter="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        multiple
        class="file-uploader-input"
        :accept="acceptString"
        :disabled="uploading"
        @change="handleFileSelect"
      />

      <div class="file-uploader-dropzone-content">
        <span class="file-uploader-icon">☁️📤</span>
        <p class="file-uploader-title">
          <span v-if="isDragging">Drop files here</span>
          <span v-else>Drag & drop files here</span>
        </p>
        <p class="file-uploader-subtitle">
          or <button type="button" class="file-uploader-browse">browse</button> to select files
        </p>
        <p class="file-uploader-hint">
          Max {{ formatFileSize(maxFileSize) }} per file • {{ maxFiles }} files max
        </p>
      </div>
    </div>

    <!-- Selected files queue -->
    <div v-if="fileQueue.length > 0" class="file-uploader-queue">
      <div class="file-uploader-queue-header">
        <h4 class="file-uploader-queue-title">
          {{ fileQueue.length }} file{{ fileQueue.length !== 1 ? 's' : '' }} selected
        </h4>
        <button
          type="button"
          class="file-uploader-clear"
          :disabled="uploading"
          @click="clearQueue"
        >
          Clear all
        </button>
      </div>

      <div class="file-uploader-queue-list">
        <div
          v-for="(item, index) in fileQueue"
          :key="item.id"
          :class="['file-uploader-item', `file-uploader-item-${item.status}`]"
        >
          <!-- Preview/Icon -->
          <div class="file-uploader-item-preview">
            <img
              v-if="item.preview"
              :src="item.preview"
              :alt="item.file.name"
              class="file-uploader-item-thumbnail"
            />
            <span v-else class="file-uploader-item-icon">
              {{ getFileIcon(item.file) }}
            </span>
          </div>

          <!-- Info -->
          <div class="file-uploader-item-info">
            <span class="file-uploader-item-name">{{ item.file.name }}</span>
            <span class="file-uploader-item-meta">
              {{ formatFileSize(item.file.size) }}
              <span v-if="item.error" class="file-uploader-item-error-text">
                • {{ item.error }}
              </span>
            </span>

            <!-- Progress bar -->
            <div v-if="item.status === 'uploading'" class="file-uploader-item-progress">
              <div
                class="file-uploader-item-progress-bar"
                :style="{width: `${item.progress}%`}"
              />
            </div>
          </div>

          <!-- Status/Actions -->
          <div class="file-uploader-item-actions">
            <!-- Uploading -->
            <span v-if="item.status === 'uploading'" class="file-uploader-item-percent">
              {{ item.progress }}%
            </span>

            <!-- Completed -->
            <span v-else-if="item.status === 'completed'" class="file-uploader-item-success">
              ✅
            </span>

            <!-- Error -->
            <template v-else-if="item.status === 'error'">
              <button
                type="button"
                class="file-uploader-item-retry"
                title="Retry upload"
                aria-label="Retry upload"
                @click="retryUpload(item.id)"
              >
                🔄
              </button>
            </template>

            <!-- Pending - remove button -->
            <button
              v-if="item.status === 'pending' || item.status === 'error'"
              type="button"
              class="file-uploader-item-remove"
              title="Remove"
              aria-label="Remove file"
              @click="removeFromQueue(index)"
            >
              ❌
            </button>

            <!-- Cancel during upload -->
            <button
              v-if="item.status === 'uploading'"
              type="button"
              class="file-uploader-item-cancel"
              title="Cancel upload"
              aria-label="Cancel upload"
              @click="cancelUpload(item.id)"
            >
              ❌
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload button -->
    <div v-if="pendingFiles.length > 0" class="file-uploader-actions">
      <button
        type="button"
        class="file-uploader-submit"
        :disabled="uploading || pendingFiles.length === 0"
        @click="startUpload"
      >
        <span v-if="!uploading">📤</span>
        <span v-else class="file-uploader-loading">⏳</span>
        <span>
          {{
            uploading
              ? 'Uploading...'
              : `Upload ${pendingFiles.length} file${pendingFiles.length !== 1 ? 's' : ''}`
          }}
        </span>
      </button>
    </div>

    <!-- Validation info -->
    <div class="file-uploader-info">
      <h5 class="file-uploader-info-title">Supported file types:</h5>
      <div class="file-uploader-info-types">
        <span class="file-uploader-info-type"> 📄 Documents (.pdf, .doc, .docx, .ppt, .pptx) </span>
        <span class="file-uploader-info-type"> 🗺️ Cartography (.shp, .kml, .kmz, .geojson) </span>
        <span class="file-uploader-info-type"> 🖼️ Images (.jpg, .jpeg, .png, .gif, .tif, .tiff, .webp) </span>
        <span class="file-uploader-info-type"> 📊 Spreadsheets (.xls, .xlsx, .csv) </span>
        <span class="file-uploader-info-type"> 📐 CAD (.dwg, .dxf) </span>
        <span class="file-uploader-info-type"> 📦 Compressed (.zip, .rar, .7z) </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onUnmounted} from 'vue';
import {FILE, PROJECT_SECTIONS, isProjectSectionId, type ProjectSectionId} from '@/shared/constants';
import {formatFileSize, generateId} from '@/shared/utils';

/**
 * Upload progress info from parent component
 */
export interface FileUploadProgressDto {
  fileId: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

/**
 * Queue item interface
 */
interface QueueItem {
  id: string;
  file: File;
  preview: string | null;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error: string | null;
}

/**
 * FileUploader component props
 */
export interface FileUploaderProps {
  /** Project ID for upload */
  projectId: string;
  /** Available sections */
  sections: ProjectSectionId[];
  /** Default selected section */
  defaultSection?: ProjectSectionId;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Accepted file extensions */
  acceptedExtensions?: string[];
  /** Uploading state */
  uploading?: boolean;
  /** Upload progress for each file */
  uploadProgress?: FileUploadProgressDto[];
}

/**
 * FileUploader component emits
 */
export interface FileUploaderEmits {
  (e: 'upload', files: {id: string; file: File; section: ProjectSectionId}[]): void;
  (e: 'cancel', fileId: string): void;
  (e: 'retry', fileId: string): void;
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<FileUploaderProps>(), {
  defaultSection: PROJECT_SECTIONS.REPORT_AND_ANNEXES,
  maxFileSize: FILE.MAX_SIZE_BYTES,
  maxFiles: 10,
  acceptedExtensions: () => Object.values(FILE.SUPPORTED_EXTENSIONS).flat(),
  uploading: false,
  uploadProgress: () => [],
});

const emit = defineEmits<FileUploaderEmits>();

// Refs
const fileInputRef = ref<HTMLInputElement | null>(null);

// State
const selectedSection = ref<ProjectSectionId>(props.defaultSection);
const isDragging = ref(false);
const fileQueue = ref<QueueItem[]>([]);

watch(
  [() => props.sections, () => props.defaultSection],
  ([sections, defaultSection]) => {
    const desired =
      (isProjectSectionId(defaultSection) ? defaultSection : null) ??
      sections[0] ??
      PROJECT_SECTIONS.REPORT_AND_ANNEXES;

    if (!sections.includes(selectedSection.value)) {
      selectedSection.value = desired;
    }
  },
  {immediate: true},
);

// Watch upload progress from parent
watch(
  () => props.uploadProgress,
  (progress) => {
    progress.forEach((p) => {
      const item = fileQueue.value.find((i) => i.id === p.fileId);
      if (item) {
        item.status = p.status;
        item.progress = p.progress;
        item.error = p.error || null;
      }
    });
  },
  {deep: true},
);

// Accepted file string for input
const acceptString = computed(() => props.acceptedExtensions.join(','));

// Pending files (not yet uploaded)
const pendingFiles = computed(() => fileQueue.value.filter((i) => i.status === 'pending'));

/**
 * Validate file
 */
function validateFile(file: File): string | null {
  // Check size
  if (file.size > props.maxFileSize) {
    return `File exceeds ${formatFileSize(props.maxFileSize)} limit`;
  }

  // Check extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!props.acceptedExtensions.includes(ext)) {
    return 'File type not supported';
  }

  return null;
}

/**
 * Create preview for images
 */
function createPreview(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Get file icon emoji
 */
function getFileIcon(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'svg', 'webp'];
  const docExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
  const spreadsheetExts = ['xls', 'xlsx', 'csv', 'ods'];
  const cadExts = ['dwg', 'dxf', 'dgn'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
  const mapExts = ['shp', 'kml', 'kmz', 'geojson'];

  if (imageExts.includes(ext)) return '🖼️';
  if (docExts.includes(ext)) return '📄';
  if (spreadsheetExts.includes(ext)) return '📊';
  if (cadExts.includes(ext)) return '📐';
  if (archiveExts.includes(ext)) return '📦';
  if (mapExts.includes(ext)) return '🗺️';

  return '📎';
}

/**
 * Add files to queue
 */
async function addFiles(files: File[]): Promise<void> {
  // Check max files limit
  const remainingSlots = props.maxFiles - fileQueue.value.length;
  const filesToAdd = files.slice(0, remainingSlots);

  for (const file of filesToAdd) {
    const error = validateFile(file);
    const preview = await createPreview(file);

    fileQueue.value.push({
      id: generateId(),
      file,
      preview,
      status: error ? 'error' : 'pending',
      progress: 0,
      error,
    });
  }
}

/**
 * Drag and drop handlers
 */
function handleDragOver(): void {
  if (props.uploading) return;
  isDragging.value = true;
}

function handleDragLeave(): void {
  isDragging.value = false;
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false;
  if (props.uploading) return;

  const files = Array.from(event.dataTransfer?.files || []);
  addFiles(files);
}

/**
 * File input handler
 */
function triggerFileInput(): void {
  if (props.uploading) return;
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  addFiles(Array.from(input.files));

  // Reset input
  input.value = '';
}

/**
 * Queue management
 */
function revokePreviewUrl(preview: string | null): void {
  if (!preview) return;

  // Previews are currently created via FileReader.readAsDataURL().
  // Only object URLs created via URL.createObjectURL() should be revoked.
  if (preview.startsWith('blob:')) {
    URL.revokeObjectURL(preview);
  }
}

function removeFromQueue(index: number): void {
  const item = fileQueue.value[index];
  revokePreviewUrl(item.preview);
  fileQueue.value.splice(index, 1);
}

function clearQueue(): void {
  fileQueue.value.forEach((item) => {
    revokePreviewUrl(item.preview);
  });
  fileQueue.value = [];
  emit('clear');
}

function cancelUpload(fileId: string): void {
  emit('cancel', fileId);
}

function retryUpload(fileId: string): void {
  const item = fileQueue.value.find((i) => i.id === fileId);
  if (item) {
    item.status = 'pending';
    item.progress = 0;
    item.error = null;
  }
  emit('retry', fileId);
}

/**
 * Start upload
 */
function startUpload(): void {
  const filesToUpload = pendingFiles.value.map((item) => ({
    id: item.id,
    file: item.file,
    section: selectedSection.value,
  }));

  // Update status to uploading
  pendingFiles.value.forEach((item) => {
    item.status = 'uploading';
  });

  emit('upload', filesToUpload);
}

// Cleanup
onUnmounted(() => {
  fileQueue.value.forEach((item) => {
    revokePreviewUrl(item.preview);
  });
});
</script>

<style scoped>
.file-uploader {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* Section selector */
.file-uploader-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.file-uploader-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.file-uploader-select {
  height: var(--height-input);
  padding: 0 var(--spacing-8) 0 var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  cursor: pointer;
}

.file-uploader-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

/* Drop zone */
.file-uploader-dropzone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--spacing-8);
  border: 2px dashed var(--color-border-primary);
  border-radius: var(--radius-lg);
  background-color: var(--color-gray-50);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-uploader-dropzone:hover {
  border-color: var(--color-primary-400);
  background-color: var(--color-primary-50);
}

.file-uploader-dropzone-active {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-100);
}

.file-uploader-dropzone-disabled {
  pointer-events: none;
  opacity: 0.6;
}

.file-uploader-input {
  display: none;
}

.file-uploader-dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.file-uploader-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-4);
}

.file-uploader-dropzone-active .file-uploader-icon {
  transform: scale(1.1);
}

.file-uploader-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1);
}

.file-uploader-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2);
}

.file-uploader-browse {
  color: var(--color-primary-600);
  background: none;
  border: none;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: underline;
}

.file-uploader-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

/* Queue */
.file-uploader-queue {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.file-uploader-queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-gray-50);
  border-bottom: 1px solid var(--color-border-primary);
}

.file-uploader-queue-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.file-uploader-clear {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.file-uploader-clear:hover {
  color: var(--color-error-600);
}

.file-uploader-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-uploader-queue-list {
  display: flex;
  flex-direction: column;
}

.file-uploader-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.file-uploader-item:last-child {
  border-bottom: none;
}

.file-uploader-item-error {
  background-color: var(--color-error-50);
}

.file-uploader-item-completed {
  background-color: var(--color-success-50);
}

.file-uploader-item-preview {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background-color: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.file-uploader-item-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-uploader-item-icon {
  font-size: 20px;
}

.file-uploader-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.file-uploader-item-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-uploader-item-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.file-uploader-item-error-text {
  color: var(--color-error-600);
}

.file-uploader-item-progress {
  height: 4px;
  background-color: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.file-uploader-item-progress-bar {
  height: 100%;
  background-color: var(--color-primary-500);
  transition: width var(--transition-fast);
}

.file-uploader-item-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.file-uploader-item-percent {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  min-width: 40px;
  text-align: right;
}

.file-uploader-item-success {
  font-size: 20px;
}

.file-uploader-item-remove,
.file-uploader-item-cancel,
.file-uploader-item-retry {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 14px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.file-uploader-item-remove:hover,
.file-uploader-item-cancel:hover {
  background-color: var(--color-error-100);
}

.file-uploader-item-retry:hover {
  background-color: var(--color-primary-100);
}

/* Actions */
.file-uploader-actions {
  display: flex;
  justify-content: flex-end;
}

.file-uploader-submit {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  height: var(--height-button);
  padding: 0 var(--spacing-5);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  background-color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.file-uploader-submit:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.file-uploader-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-uploader-submit span {
  font-size: 18px;
}

.file-uploader-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Info */
.file-uploader-info {
  padding: var(--spacing-4);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-lg);
}

.file-uploader-info-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2);
}

.file-uploader-info-types {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.file-uploader-info-type {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-sm);
}

/* Responsive */
@media (max-width: 640px) {
  .file-uploader-dropzone {
    min-height: 150px;
    padding: var(--spacing-6);
  }

  .file-uploader-icon {
    font-size: 36px;
  }

  .file-uploader-item {
    flex-wrap: wrap;
  }

  .file-uploader-item-info {
    width: calc(100% - 80px);
  }
}
</style>
