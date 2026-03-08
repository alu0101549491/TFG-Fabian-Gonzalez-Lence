<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppSelect.vue
  @desc Reusable select dropdown component with options
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div
    :class="[
      'select-wrapper',
      {
        'select-error': !!error,
        'select-disabled': disabled,
      },
    ]"
  >
    <!-- Label -->
    <label v-if="label" :for="selectId" class="select-label">
      {{ label }}
      <span v-if="required" class="select-required">*</span>
    </label>

    <!-- Select container -->
    <div :class="['select-container', `select-${size}`]">
      <select
        :id="selectId"
        :value="selectedValue"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        class="select-field"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled :selected="isEmpty">
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="String(option.value)"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Chevron icon -->
      <span class="select-icon">▼</span>

      <!-- Clear button -->
      <button
        v-if="clearable && !isEmpty"
        type="button"
        class="select-clear"
        aria-label="Clear selection"
        @click.stop="handleClear"
      >
        ✕
      </button>
    </div>

    <!-- Helper text or error -->
    <p v-if="error" class="select-error-text">{{ error }}</p>
    <p v-else-if="helperText" class="select-helper-text">{{ helperText }}</p>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';

/**
 * Select option interface
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Select component props
 */
export interface AppSelectProps {
  /** v-model value */
  modelValue?: string | number | null;
  /** Options array */
  options: SelectOption[];
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
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Allow clearing selection */
  clearable?: boolean;
}

/**
 * Select component emits
 */
export interface AppSelectEmits {
  (e: 'update:modelValue', value: string | number | null): void;
  (e: 'change', value: string | number | null): void;
}

const props = withDefaults(defineProps<AppSelectProps>(), {
  size: 'md',
  disabled: false,
  required: false,
  clearable: false,
});

const emit = defineEmits<AppSelectEmits>();

const isEmpty = computed(() => props.modelValue == null || props.modelValue === '');
const selectedValue = computed(() => (isEmpty.value ? '' : String(props.modelValue)));

/**
 * Generate unique select ID
 */
const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`);

/**
 * Handle change event
 */
function handleChange(event: Event): void {
  const target = event.target as HTMLSelectElement;

  if (target.value === '') {
    emit('update:modelValue', null);
    emit('change', null);
    return;
  }

  const matchedOption = props.options.find((option) => String(option.value) === target.value);
  const value = matchedOption ? matchedOption.value : target.value;

  emit('update:modelValue', value);
  emit('change', value);
}

/**
 * Handle clear action
 */
function handleClear(): void {
  emit('update:modelValue', null);
  emit('change', null);
}
</script>

<style scoped>
.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.select-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.select-required {
  color: var(--color-error-500);
  margin-left: var(--spacing-1);
}

.select-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.select-container:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.select-error .select-container {
  border-color: var(--color-error-500);
}

.select-error .select-container:focus-within {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

.select-disabled .select-container {
  background-color: var(--color-gray-50);
  cursor: not-allowed;
}

/* Sizes */
.select-sm {
  height: 32px;
  padding: 0 var(--spacing-3);
}

.select-md {
  height: 40px;
  padding: 0 var(--spacing-3);
}

.select-lg {
  height: 48px;
  padding: 0 var(--spacing-4);
}

.select-field {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  cursor: pointer;
  appearance: none;
  padding-right: var(--spacing-6);
}

.select-field:disabled {
  cursor: not-allowed;
}

.select-icon {
  position: absolute;
  right: var(--spacing-3);
  pointer-events: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.select-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--spacing-1);
  color: var(--color-text-secondary);
  margin-right: var(--spacing-5);
  transition: color var(--transition-fast);
}

.select-clear:hover {
  color: var(--color-text-primary);
}

.select-helper-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
}

.select-error-text {
  font-size: var(--font-size-xs);
  color: var(--color-error-600);
  margin: 0;
}
</style>
