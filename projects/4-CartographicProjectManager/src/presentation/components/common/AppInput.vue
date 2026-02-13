<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/common/AppInput.vue
  @desc Reusable input component with validation and icon support
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <div
    :class="[
      'input-wrapper',
      {
        'input-error': !!error,
        'input-disabled': disabled,
      },
    ]"
  >
    <!-- Label -->
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>

    <!-- Input container -->
    <div :class="['input-container', `input-${size}`]">
      <!-- Prefix -->
      <span v-if="$slots.prefix" class="input-prefix">
        <slot name="prefix" />
      </span>

      <!-- Input element -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="computedType"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :aria-invalid="!!error"
        :aria-describedby="ariaDescribedBy"
        class="input-field"
        @input="handleInput"
        @focus="$emit('focus', $event as FocusEvent)"
        @blur="$emit('blur', $event as FocusEvent)"
        @change="$emit('change', $event)"
      />

      <!-- Password toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="input-toggle-password"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="togglePasswordVisibility"
      >
        {{ showPassword ? '👁️' : '👁️‍🗨️' }}
      </button>

      <!-- Suffix -->
      <span v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix" />
      </span>
    </div>

    <!-- Helper text or error -->
    <p v-if="error" :id="`${inputId}-error`" class="input-error-text">
      {{ error }}
    </p>
    <p v-else-if="helperText" :id="`${inputId}-helper`" class="input-helper-text">
      {{ helperText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';

/**
 * Input component props
 */
export interface AppInputProps {
  /** v-model value */
  modelValue?: string | number;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  /** Input name */
  name?: string;
  /** Input id */
  id?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Readonly state */
  readonly?: boolean;
  /** Autofocus */
  autofocus?: boolean;
  /** Autocomplete attribute */
  autocomplete?: string;
  /** Max length */
  maxlength?: number;
  /** Min value (for number) */
  min?: number;
  /** Max value (for number) */
  max?: number;
  /** Step (for number) */
  step?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Input component emits
 */
export interface AppInputEmits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'input', event: Event): void;
  (e: 'change', event: Event): void;
}

const props = withDefaults(defineProps<AppInputProps>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  required: false,
  readonly: false,
  autofocus: false,
});

const emit = defineEmits<AppInputEmits>();

const inputRef = ref<HTMLInputElement | null>(null);
const showPassword = ref(false);

/**
 * Generate unique input ID
 */
const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`);

/**
 * Computed input type (handles password toggle)
 */
const computedType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text';
  }
  return props.type;
});

/**
 * Aria describedby attribute
 */
const ariaDescribedBy = computed(() => {
  if (props.error) return `${inputId.value}-error`;
  if (props.helperText) return `${inputId.value}-helper`;
  return undefined;
});

/**
 * Handle input event
 */
function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? Number(target.value) : target.value;
  emit('update:modelValue', value);
  emit('input', event);
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value;
}

/**
 * Focus the input programmatically
 */
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.input-required {
  color: var(--color-error-500);
  margin-left: var(--spacing-1);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input-container:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input-error .input-container {
  border-color: var(--color-error-500);
}

.input-error .input-container:focus-within {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

.input-disabled .input-container {
  background-color: var(--color-gray-50);
  cursor: not-allowed;
}

/* Sizes */
.input-sm {
  height: 32px;
  padding: 0 var(--spacing-3);
}

.input-md {
  height: 40px;
  padding: 0 var(--spacing-3);
}

.input-lg {
  height: 48px;
  padding: 0 var(--spacing-4);
}

.input-field {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  min-width: 0;
}

.input-field::placeholder {
  color: var(--color-text-tertiary);
}

.input-field:disabled {
  cursor: not-allowed;
}

.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.input-toggle-password {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--spacing-1);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.input-toggle-password:hover {
  color: var(--color-text-primary);
}

.input-helper-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
}

.input-error-text {
  font-size: var(--font-size-xs);
  color: var(--color-error-600);
  margin: 0;
}
</style>
