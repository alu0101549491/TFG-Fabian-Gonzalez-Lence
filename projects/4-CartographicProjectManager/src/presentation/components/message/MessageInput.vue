<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/message/MessageInput.vue
  @desc Message input with auto-resize, file attachments, and keyboard shortcuts
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div
    :class="['message-input', {'message-input-disabled': disabled}]"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- Drop zone overlay -->
    <Transition name="fade">
      <div v-if="isDragging" class="message-input-drop-zone">
        <span class="message-input-drop-icon">📤</span>
        <span>Drop files here</span>
      </div>
    </Transition>

    <!-- File previews -->
    <div v-if="selectedFiles.length > 0" class="message-input-files">
      <div v-for="(file, index) in selectedFiles" :key="index" class="message-input-file">
        <span class="message-input-file-icon">{{ getFileIconEmoji(file) }}</span>
        <div class="message-input-file-info">
          <span class="message-input-file-name">{{ file.name }}</span>
          <span class="message-input-file-size">{{ formatFileSize(file.size) }}</span>
        </div>
        <button type="button" class="message-input-file-remove" aria-label="Remove file" @click="removeFile(index)">
          <span>✕</span>
        </button>
      </div>
    </div>

    <!-- Input area -->
    <div class="message-input-area">
      <!-- File attachment button -->
      <button
        v-if="allowFiles"
        type="button"
        class="message-input-attach-btn"
        :disabled="disabled || selectedFiles.length >= maxFiles"
        :title="selectedFiles.length >= maxFiles ? `Maximum ${maxFiles} files` : 'Attach files'"
        @click="triggerFileInput"
      >
        <span>📎</span>
      </button>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        class="message-input-file-input"
        accept="*/*"
        @change="handleFileSelect"
      />

      <!-- Text input -->
      <div class="message-input-text-wrapper">
        <textarea
          ref="textareaRef"
          v-model="messageText"
          class="message-input-textarea"
          :placeholder="placeholder"
          :disabled="disabled"
          :maxlength="maxLength"
          rows="1"
          @input="handleInput"
          @keydown="handleKeyDown"
          @focus="handleFocus"
          @blur="handleBlur"
        />

        <!-- Character count -->
        <span
          v-if="showCharCount"
          :class="['message-input-char-count', {'message-input-char-count-warning': isNearLimit}]"
        >
          {{ messageText.length }}/{{ maxLength }}
        </span>
      </div>

      <!-- Send button -->
      <button
        type="button"
        class="message-input-send-btn"
        :disabled="!canSend || disabled"
        :title="canSend ? 'Send message' : 'Type a message to send'"
        @click="handleSend"
      >
        <span v-if="sending" class="message-input-spinner">⏳</span>
        <span v-else>➤</span>
      </button>
    </div>

    <!-- Keyboard hint -->
    <p class="message-input-hint">
      Press <kbd>Enter</kbd> to send, <kbd>Shift</kbd>+<kbd>Enter</kbd> for new line
    </p>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, nextTick, onMounted, onUnmounted} from 'vue';
import {formatFileSize} from '@/shared/utils';

/**
 * MessageInput component props
 */
export interface MessageInputProps {
  /** Sending state */
  sending?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum message length */
  maxLength?: number;
  /** Maximum files allowed */
  maxFiles?: number;
  /** Show file attachment button */
  allowFiles?: boolean;
}

/**
 * MessageInput component emits
 */
export interface MessageInputEmits {
  (e: 'send', payload: {content: string; files: File[]}): void;
  (e: 'typing'): void;
  (e: 'stop-typing'): void;
}

const props = withDefaults(defineProps<MessageInputProps>(), {
  sending: false,
  disabled: false,
  placeholder: 'Type a message...',
  maxLength: 2000,
  maxFiles: 5,
  allowFiles: true,
});

const emit = defineEmits<MessageInputEmits>();

// Refs
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// State
const messageText = ref('');
const selectedFiles = ref<File[]>([]);
const isDragging = ref(false);
const isTyping = ref(false);
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed
const canSend = computed(() => {
  return messageText.value.trim().length > 0 || selectedFiles.value.length > 0;
});

const showCharCount = computed(() => {
  return messageText.value.length > props.maxLength * 0.7;
});

const isNearLimit = computed(() => {
  return messageText.value.length > props.maxLength * 0.9;
});

/**
 * Auto-resize textarea
 */
function adjustTextareaHeight(): void {
  if (!textareaRef.value) return;

  textareaRef.value.style.height = 'auto';
  const newHeight = Math.min(textareaRef.value.scrollHeight, 150);
  textareaRef.value.style.height = `${newHeight}px`;
}

watch(messageText, () => {
  nextTick(adjustTextareaHeight);
});

onMounted(() => {
  adjustTextareaHeight();
});

/**
 * Handle input with typing indicator
 */
function handleInput(): void {
  adjustTextareaHeight();

  if (!isTyping.value) {
    isTyping.value = true;
    emit('typing');
  }

  // Reset typing timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    isTyping.value = false;
    emit('stop-typing');
  }, 1500);
}

/**
 * Handle focus
 */
function handleFocus(): void {
  // Focus handling if needed
}

/**
 * Handle blur
 */
function handleBlur(): void {
  if (isTyping.value) {
    isTyping.value = false;
    emit('stop-typing');
  }

  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }

  // Enter to send (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
  // Shift+Enter adds new line (default behavior)
}

/**
 * Send message
 */
function handleSend(): void {
  if (!canSend.value || props.disabled || props.sending) return;

  emit('send', {
    content: messageText.value.trim(),
    files: [...selectedFiles.value],
  });

  // Clear input
  messageText.value = '';
  selectedFiles.value = [];

  nextTick(() => {
    adjustTextareaHeight();
    textareaRef.value?.focus();
  });

  // Stop typing indicator
  if (isTyping.value) {
    isTyping.value = false;
    emit('stop-typing');
  }
}

/**
 * Trigger file input
 */
function triggerFileInput(): void {
  fileInputRef.value?.click();
}

/**
 * Handle file select
 */
function handleFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  addFiles(Array.from(input.files));

  // Reset input
  input.value = '';
}

/**
 * Add files
 */
function addFiles(files: File[]): void {
  const remainingSlots = props.maxFiles - selectedFiles.value.length;
  const filesToAdd = files.slice(0, remainingSlots);

  // Filter valid files (size limit: 50MB)
  const validFiles = filesToAdd.filter((file) => {
    if (file.size > 50 * 1024 * 1024) {
      console.warn(`File ${file.name} exceeds maximum size (50MB)`);
      return false;
    }
    return true;
  });

  selectedFiles.value = [...selectedFiles.value, ...validFiles];
}

/**
 * Remove file
 */
function removeFile(index: number): void {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
}

/**
 * Handle drag over
 */
function handleDragOver(event: DragEvent): void {
  if (!props.allowFiles || props.disabled) return;
  event.preventDefault();
  isDragging.value = true;
}

/**
 * Handle drag leave
 */
function handleDragLeave(event: DragEvent): void {
  void event;
  isDragging.value = false;
}

/**
 * Handle drop
 */
function handleDrop(event: DragEvent): void {
  isDragging.value = false;

  if (!props.allowFiles || props.disabled) return;
  if (!event.dataTransfer?.files) return;

  addFiles(Array.from(event.dataTransfer.files));
}

/**
 * Get file icon emoji based on extension
 */
function getFileIconEmoji(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const spreadsheetExts = ['xls', 'xlsx', 'csv'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (imageExts.includes(ext)) return '🖼️';
  if (docExts.includes(ext)) return '📄';
  if (spreadsheetExts.includes(ext)) return '📊';
  if (archiveExts.includes(ext)) return '📦';

  return '📎';
}

// Cleanup
onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
});

// Expose focus method
defineExpose({
  focus: () => textareaRef.value?.focus(),
});
</script>

<style scoped>
.message-input {
  position: relative;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.message-input-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Drop zone */
.message-input-drop-zone {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  background-color: var(--color-primary-50);
  border: 2px dashed var(--color-primary-400);
  border-radius: var(--radius-lg);
  color: var(--color-primary-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.message-input-drop-icon {
  font-size: 32px;
}

/* File previews */
.message-input-files {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-gray-50);
}

.message-input-file {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  max-width: 200px;
}

.message-input-file-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.message-input-file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.message-input-file-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-input-file-size {
  font-size: 10px;
  color: var(--color-text-tertiary);
}

.message-input-file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-gray-400);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.message-input-file-remove:hover {
  color: var(--color-error-600);
  background-color: var(--color-error-100);
}

/* Input area */
.message-input-area {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
}

.message-input-attach-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--color-gray-500);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  flex-shrink: 0;
  font-size: 20px;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.message-input-attach-btn:hover:not(:disabled) {
  color: var(--color-primary-600);
  background-color: var(--color-gray-100);
}

.message-input-attach-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-input-file-input {
  display: none;
}

/* Text wrapper */
.message-input-text-wrapper {
  flex: 1;
  position: relative;
  min-width: 0;
}

.message-input-textarea {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--color-text-primary);
  background-color: var(--color-gray-100);
  border: none;
  border-radius: var(--radius-md);
  resize: none;
  min-height: 36px;
  max-height: 150px;
  line-height: 1.5;
  transition: background-color var(--transition-fast);
}

.message-input-textarea:focus {
  outline: none;
  background-color: var(--color-gray-50);
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.message-input-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.message-input-char-count {
  position: absolute;
  right: var(--spacing-2);
  bottom: var(--spacing-2);
  font-size: 10px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.message-input-char-count-warning {
  color: var(--color-warning-600);
}

/* Send button */
.message-input-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: white;
  background-color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  flex-shrink: 0;
  font-size: 18px;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.message-input-send-btn:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.message-input-send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.message-input-send-btn:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
}

.message-input-spinner {
  font-size: 16px;
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

/* Hint */
.message-input-hint {
  font-size: 10px;
  color: var(--color-text-tertiary);
  text-align: center;
  padding: var(--spacing-1) var(--spacing-3) var(--spacing-2);
  margin: 0;
}

.message-input-hint kbd {
  font-family: inherit;
  font-size: 10px;
  padding: 1px 4px;
  background-color: var(--color-gray-100);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-primary);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .message-input-hint {
    display: none;
  }
}
</style>
