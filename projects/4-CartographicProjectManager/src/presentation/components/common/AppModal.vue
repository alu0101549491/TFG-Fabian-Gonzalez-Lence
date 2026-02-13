<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppModal.vue
  @desc Modal dialog component with focus trap and accessibility features
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <Teleport to="body">
    <Transition name="modal" @after-enter="onAfterEnter" @after-leave="onAfterLeave">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div
          ref="modalRef"
          :class="['modal', `modal-${size}`]"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          @click.stop
        >
          <!-- Header -->
          <div class="modal-header">
            <h2 :id="titleId" class="modal-title">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              v-if="closable"
              type="button"
              class="modal-close"
              @click="handleClose"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {ref, watch, computed, nextTick, onUnmounted} from 'vue';

/**
 * Modal component props
 */
export interface AppModalProps {
  /** v-model for visibility */
  modelValue: boolean;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Closable via X button */
  closable?: boolean;
  /** Close on overlay click */
  closeOnOverlay?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
}

/**
 * Modal component emits
 */
export interface AppModalEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
  (e: 'open'): void;
}

const props = withDefaults(defineProps<AppModalProps>(), {
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  closeOnEscape: true,
});

const emit = defineEmits<AppModalEmits>();

const modalRef = ref<HTMLElement | null>(null);
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`);

// Store previously focused element
let previousActiveElement: HTMLElement | null = null;

/**
 * Handle overlay click
 */
function handleOverlayClick(): void {
  if (props.closeOnOverlay) {
    handleClose();
  }
}

/**
 * Handle close action
 */
function handleClose(): void {
  emit('update:modelValue', false);
  emit('close');
}

/**
 * Handle escape key
 */
function handleEscape(event: KeyboardEvent): void {
  if (props.closeOnEscape && event.key === 'Escape' && props.modelValue) {
    handleClose();
  }
}

/**
 * Lock body scroll
 */
function lockBodyScroll(): void {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

/**
 * Unlock body scroll
 */
function unlockBodyScroll(): void {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

/**
 * Simple focus trap implementation
 */
function handleFocusTrap(event: KeyboardEvent): void {
  if (!modalRef.value || event.key !== 'Tab') return;

  const focusableElements = modalRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement?.focus();
  }
}

/**
 * After modal enter transition
 */
function onAfterEnter(): void {
  // Store previously focused element
  previousActiveElement = document.activeElement as HTMLElement;

  // Focus first focusable element
  nextTick(() => {
    const firstFocusable = modalRef.value?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();
  });

  emit('open');
}

/**
 * After modal leave transition
 */
function onAfterLeave(): void {
  // Restore focus to previously focused element
  previousActiveElement?.focus();
  previousActiveElement = null;
}

// Watch modelValue to manage body scroll and event listeners
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      lockBodyScroll();
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleFocusTrap);
    } else {
      unlockBodyScroll();
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleFocusTrap);
    }
  },
  {immediate: true},
);

// Cleanup on component unmount
onUnmounted(() => {
  if (props.modelValue) {
    unlockBodyScroll();
    document.removeEventListener('keydown', handleEscape);
    document.removeEventListener('keydown', handleFocusTrap);
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - var(--spacing-8));
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
}

/* Sizes */
.modal-sm {
  max-width: 400px;
}

.modal-md {
  max-width: 600px;
}

.modal-lg {
  max-width: 800px;
}

.modal-xl {
  max-width: 1200px;
}

.modal-full {
  max-width: calc(100vw - var(--spacing-8));
  max-height: calc(100vh - var(--spacing-8));
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 20px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--color-gray-100);
  color: var(--color-text-primary);
}

.modal-close:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* Content */
.modal-content {
  flex: 1;
  padding: var(--spacing-6);
  overflow-y: auto;
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-gray-50);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform var(--transition-normal);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
}
</style>
