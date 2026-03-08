<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppTextarea.vue
  @desc Reusable textarea component with auto-resize and character counter
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div :class="['textarea-wrapper', {'textarea-error': !!error}]">
    <!-- Label -->
    <label v-if="label" :for="textareaId" class="textarea-label">
      {{ label }}
      <span v-if="required" class="textarea-required">*</span>
    </label>

    <!-- Textarea -->
    <textarea
      :id="textareaId"
      ref="textareaRef"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="computedRows"
      :maxlength="maxlength"
      :style="textareaStyle"
      :aria-invalid="!!error"
      class="textarea-field"
      @input="handleInput"
      @focus="emit('focus', $event as FocusEvent)"
      @blur="emit('blur', $event as FocusEvent)"
    />

    <!-- Footer: error/helper and counter -->
    <div class="textarea-footer">
      <p v-if="error" class="textarea-error-text">{{ error }}</p>
      <p v-else-if="helperText" class="textarea-helper-text">{{ helperText }}</p>
      <span v-else></span>

      <span v-if="showCount && maxlength" class="textarea-counter">
        {{ characterCount }} / {{ maxlength }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, nextTick, onMounted} from 'vue';

/**
 * Textarea component props
 */
export interface AppTextareaProps {
  /** v-model value */
  modelValue?: string;
  /** Textarea name */
  name?: string;
  /** Textarea id */
  id?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Readonly state */
  readonly?: boolean;
  /** Number of rows */
  rows?: number;
  /** Minimum rows (for auto-resize) */
  minRows?: number;
  /** Maximum rows (for auto-resize) */
  maxRows?: number;
  /** Max length */
  maxlength?: number;
  /** Show character counter */
  showCount?: boolean;
  /** Auto resize */
  autoResize?: boolean;
  /** Resize option */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Textarea component emits
 */
export interface AppTextareaEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}

const props = withDefaults(defineProps<AppTextareaProps>(), {
  rows: 3,
  disabled: false,
  required: false,
  readonly: false,
  showCount: false,
  autoResize: false,
  resize: 'vertical',
});

const emit = defineEmits<AppTextareaEmits>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

/**
 * Generate unique textarea ID
 */
const textareaId = computed(() => props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`);

/**
 * Character count
 */
const characterCount = computed(() => props.modelValue?.length || 0);

/**
 * Computed rows value
 */
const computedRows = computed(() => {
  if (props.autoResize) return undefined;
  return props.rows;
});

/**
 * Textarea style
 */
const textareaStyle = computed(() => ({
  resize: props.autoResize ? 'none' : props.resize,
}));

/**
 * Handle input event
 */
function handleInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);

  if (props.autoResize) {
    nextTick(() => adjustHeight());
  }
}

/**
 * Adjust textarea height for auto-resize
 */
function adjustHeight(): void {
  if (!props.autoResize || !textareaRef.value) return;

  const textarea = textareaRef.value;
  textarea.style.height = 'auto';

  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
  const minHeight = props.minRows ? props.minRows * lineHeight : undefined;
  const maxHeight = props.maxRows ? props.maxRows * lineHeight : undefined;

  let newHeight = textarea.scrollHeight;

  if (minHeight && newHeight < minHeight) newHeight = minHeight;
  if (maxHeight && newHeight > maxHeight) newHeight = maxHeight;

  textarea.style.height = `${newHeight}px`;
}

// Watch for external value changes
watch(() => props.modelValue, () => {
  if (props.autoResize) {
    nextTick(() => adjustHeight());
  }
});

// Initial height adjustment
onMounted(() => {
  if (props.autoResize && props.modelValue) {
    nextTick(() => adjustHeight());
  }
});
</script>

<style scoped>
.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.textarea-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.textarea-required {
  color: var(--color-error-500);
  margin-left: var(--spacing-1);
}

.textarea-field {
  width: 100%;
  min-height: 80px;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-family: inherit;
  line-height: 1.5;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.textarea-field::placeholder {
  color: var(--color-text-tertiary);
}

.textarea-field:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.textarea-error .textarea-field {
  border-color: var(--color-error-500);
}

.textarea-error .textarea-field:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

.textarea-field:disabled {
  background-color: var(--color-gray-50);
  cursor: not-allowed;
}

.textarea-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}

.textarea-helper-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
}

.textarea-error-text {
  font-size: var(--font-size-xs);
  color: var(--color-error-600);
  margin: 0;
}

.textarea-counter {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
}
</style>
