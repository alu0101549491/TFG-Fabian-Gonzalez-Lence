<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppConfirmDialog.vue
  @desc Confirmation dialog for destructive actions
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <AppModal
    :model-value="modelValue"
    :size="size"
    :closable="!loading"
    :close-on-overlay="!loading"
    :close-on-escape="!loading"
    @update:model-value="$emit('update:modelValue', $event as boolean)"
  >
    <template #title>{{ title }}</template>

    <div class="confirm-dialog-content">
      <!-- Icon -->
      <div :class="['confirm-dialog-icon', `confirm-dialog-icon-${variant}`]">
        <span v-if="variant === 'danger'">⚠️</span>
        <span v-else>❓</span>
      </div>

      <!-- Message -->
      <p class="confirm-dialog-message">{{ message }}</p>
    </div>

    <template #footer>
      <AppButton variant="ghost" :disabled="loading" @click="handleCancel">
        {{ cancelText }}
      </AppButton>
      <AppButton
        :variant="variant === 'danger' ? 'danger' : 'primary'"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from './AppModal.vue';
import AppButton from './AppButton.vue';

/**
 * Confirm dialog component props
 */
export interface AppConfirmDialogProps {
  /** v-model for visibility */
  modelValue: boolean;
  /** Dialog title */
  title?: string;
  /** Dialog message */
  message?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Dialog variant */
  variant?: 'normal' | 'danger';
  /** Loading state */
  loading?: boolean;
  /** Dialog size */
  size?: 'sm' | 'md';
}

/**
 * Confirm dialog component emits
 */
export interface AppConfirmDialogEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

withDefaults(defineProps<AppConfirmDialogProps>(), {
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'normal',
  loading: false,
  size: 'sm',
});

const emit = defineEmits<AppConfirmDialogEmits>();

/**
 * Handle confirm action
 */
function handleConfirm(): void {
  emit('confirm');
}

/**
 * Handle cancel action
 */
function handleCancel(): void {
  emit('update:modelValue', false);
  emit('cancel');
}
</script>

<style scoped>
.confirm-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  text-align: center;
  padding: var(--spacing-4) 0;
}

.confirm-dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  font-size: 32px;
}

.confirm-dialog-icon-normal {
  background-color: var(--color-primary-100);
}

.confirm-dialog-icon-danger {
  background-color: var(--color-error-100);
}

.confirm-dialog-message {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.5;
}
</style>
