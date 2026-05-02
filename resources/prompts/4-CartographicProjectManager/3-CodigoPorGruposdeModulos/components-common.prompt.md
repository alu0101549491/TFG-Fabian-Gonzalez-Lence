# GLOBAL CONTEXT

**Project:** Cartographic Project Manager (CPM)

**Description:** A web and mobile application for comprehensive management of cartographic projects that facilitates collaboration between an administrator (professional cartographer) and multiple clients simultaneously. The system enables detailed tracking of project status, bidirectional task assignment between administrator and clients with 5 possible states, internal messaging per project with file attachments, calendar view for delivery date management, and technical file sharing through Dropbox integration.

**Architecture:** Layered Architecture with Clean Architecture principles
- Domain Layer → Application Layer → Infrastructure Layer → **Presentation Layer** (current)

**Current module:** Presentation Layer - Common/Shared Components

## File Structure Reference
```
4-CartographicProjectManager/
├── src/
│   ├── application/                        # ✅ Already implemented
│   ├── domain/                             # ✅ Already implemented
│   ├── infrastructure/                     # ✅ Already implemented
│   ├── shared/                             # ✅ Already implemented
│   └── presentation/
│       ├── assets/
│       │   └── styles/                     # ✅ Already implemented
│       ├── components/
│       │   ├── common/
│       │   │   ├── index.ts                # 🎯 TO IMPLEMENT
│       │   │   ├── AppButton.vue           # 🎯 TO IMPLEMENT
│       │   │   ├── AppInput.vue            # 🎯 TO IMPLEMENT
│       │   │   ├── AppSelect.vue           # 🎯 TO IMPLEMENT
│       │   │   ├── AppTextarea.vue         # 🎯 TO IMPLEMENT
│       │   │   ├── AppModal.vue            # 🎯 TO IMPLEMENT
│       │   │   ├── AppCard.vue             # 🎯 TO IMPLEMENT
│       │   │   ├── AppBadge.vue            # 🎯 TO IMPLEMENT
│       │   │   ├── AppSpinner.vue          # 🎯 TO IMPLEMENT
│       │   │   ├── AppEmptyState.vue       # 🎯 TO IMPLEMENT
│       │   │   └── AppConfirmDialog.vue    # 🎯 TO IMPLEMENT
│       │   ├── layout/
│       │   │   └── ...
│       │   ├── project/
│       │   │   └── ...
│       │   ├── task/
│       │   │   └── ...
│       │   └── message/
│       │       └── ...
│       ├── composables/                    # ✅ Already implemented
│       ├── router/                         # ✅ Already implemented
│       ├── stores/                         # ✅ Already implemented
│       ├── views/
│       │   └── ...
│       ├── App.vue
│       └── main.ts
```

---

# INPUT ARTIFACTS

## 1. CSS Variables (Already Implemented)

The components will use these CSS variables from `variables.css`:

```css
/* Colors */
--color-primary-500, --color-primary-600, --color-primary-700
--color-success-500, --color-success-600
--color-warning-500, --color-warning-600
--color-error-500, --color-error-600
--color-gray-50 through --color-gray-900

/* Typography */
--font-size-xs, --font-size-sm, --font-size-base, --font-size-lg
--font-weight-normal, --font-weight-medium, --font-weight-semibold

/* Spacing */
--spacing-1 through --spacing-16

/* Borders */
--radius-sm, --radius-md, --radius-lg, --radius-full
--border-width-1, --border-width-2

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg

/* Transitions */
--transition-fast, --transition-normal, --duration-normal

/* Z-index */
--z-modal, --z-modal-backdrop, --z-tooltip
```

## 2. Design Requirements (Section 14)

### Button Specifications
- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm (32px), md (40px), lg (48px)
- States: default, hover, active, disabled, loading
- Support for icons (left/right)
- Full-width option

### Input Specifications
- Types: text, email, password, number, search
- States: default, focus, error, disabled
- Support for labels, placeholders, helper text
- Error message display
- Icon support (prefix/suffix)

### Select Specifications
- Single select with dropdown
- Placeholder support
- Error state
- Disabled state
- Custom option rendering

### Textarea Specifications
- Auto-resize option
- Character counter
- Min/max rows
- Error state

### Modal Specifications
- Sizes: sm (400px), md (500px), lg (600px), xl (800px), full
- Header with title and close button
- Footer with action buttons
- Backdrop click to close (configurable)
- Escape key to close
- Focus trap
- Body scroll lock

### Card Specifications
- Header, body, footer sections
- Clickable variant
- Hover effect
- Loading state

### Badge Specifications
- Variants: default, success, warning, error, info
- Sizes: sm, md
- Dot indicator option
- Removable option

### Spinner Specifications
- Sizes: sm, md, lg
- Color variants
- Inline and overlay modes

### Empty State Specifications
- Icon slot
- Title and description
- Action button

### Confirm Dialog Specifications
- Title and message
- Confirm/Cancel buttons
- Danger mode for destructive actions
- Loading state during action

## 3. Accessibility Requirements (NFR17)

- WCAG 2.1 AA compliance
- Keyboard navigation
- Focus management
- ARIA attributes
- Screen reader support
- Color contrast compliance

---

# SPECIFIC TASK

Implement all Common/Shared Components for the Presentation Layer. These are reusable UI components used throughout the application.

## Files to implement:

### 1. **AppButton.vue**

**Props:**

```typescript
interface AppButtonProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width */
  block?: boolean;
  /** Icon only (circular) */
  iconOnly?: boolean;
  /** Left icon name */
  iconLeft?: string;
  /** Right icon name */
  iconRight?: string;
}
```

**Emits:**
```typescript
interface AppButtonEmits {
  (e: 'click', event: MouseEvent): void;
}
```

**Slots:**
- `default`: Button content
- `icon-left`: Custom left icon
- `icon-right`: Custom right icon

**Template Structure:**

```vue
<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <AppSpinner v-if="loading" size="sm" class="btn-spinner" />
    
    <!-- Left icon -->
    <span v-else-if="$slots['icon-left'] || iconLeft" class="btn-icon-left">
      <slot name="icon-left">
        <component :is="iconComponent(iconLeft)" />
      </slot>
    </span>
    
    <!-- Content -->
    <span v-if="!iconOnly" class="btn-content">
      <slot />
    </span>
    
    <!-- Right icon -->
    <span v-if="$slots['icon-right'] || iconRight" class="btn-icon-right">
      <slot name="icon-right">
        <component :is="iconComponent(iconRight)" />
      </slot>
    </span>
  </button>
</template>
```

**Styles (scoped):**

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-colors);
  white-space: nowrap;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.btn-sm { height: 32px; padding: 0 var(--spacing-3); font-size: var(--font-size-sm); }
.btn-md { height: 40px; padding: 0 var(--spacing-4); font-size: var(--font-size-sm); }
.btn-lg { height: 48px; padding: 0 var(--spacing-6); font-size: var(--font-size-base); }

/* Variants */
.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
}

.btn-secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
}

.btn-outline {
  border-color: var(--color-gray-300);
  background-color: transparent;
  color: var(--color-gray-700);
}

.btn-ghost {
  background-color: transparent;
  color: var(--color-gray-700);
}

.btn-danger {
  background-color: var(--color-error-600);
  color: white;
}

/* Block */
.btn-block { width: 100%; }

/* Icon only */
.btn-icon-only {
  padding: 0;
  width: 32px; /* Same as height for sm */
}
.btn-icon-only.btn-md { width: 40px; }
.btn-icon-only.btn-lg { width: 48px; }
```

---

### 2. **AppInput.vue**

**Props:**

```typescript
interface AppInputProps {
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
```

**Emits:**
```typescript
interface AppInputEmits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'input', event: Event): void;
  (e: 'change', event: Event): void;
}
```

**Slots:**
- `prefix`: Content before input
- `suffix`: Content after input

**Template Structure:**

```vue
<template>
  <div :class="['input-wrapper', { 'input-error': !!error, 'input-disabled': disabled }]">
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
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @change="$emit('change', $event)"
      />
      
      <!-- Password toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="input-toggle-password"
        @click="togglePasswordVisibility"
      >
        <component :is="showPassword ? 'EyeOffIcon' : 'EyeIcon'" />
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
```

---

### 3. **AppSelect.vue**

**Props:**

```typescript
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface AppSelectProps {
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
```

**Emits:**
```typescript
interface AppSelectEmits {
  (e: 'update:modelValue', value: string | number | null): void;
  (e: 'change', value: string | number | null): void;
}
```

**Template Structure:**

```vue
<template>
  <div :class="['select-wrapper', { 'select-error': !!error, 'select-disabled': disabled }]">
    <!-- Label -->
    <label v-if="label" :for="selectId" class="select-label">
      {{ label }}
      <span v-if="required" class="select-required">*</span>
    </label>
    
    <!-- Select container -->
    <div :class="['select-container', `select-${size}`]">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        class="select-field"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled selected>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- Chevron icon -->
      <span class="select-icon">
        <ChevronDownIcon />
      </span>
      
      <!-- Clear button -->
      <button
        v-if="clearable && modelValue"
        type="button"
        class="select-clear"
        @click.stop="handleClear"
      >
        <XIcon />
      </button>
    </div>
    
    <!-- Helper text or error -->
    <p v-if="error" class="select-error-text">{{ error }}</p>
    <p v-else-if="helperText" class="select-helper-text">{{ helperText }}</p>
  </div>
</template>
```

---

### 4. **AppTextarea.vue**

**Props:**

```typescript
interface AppTextareaProps {
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
```

**Emits:**
```typescript
interface AppTextareaEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'blur', event: FocusEvent): void;
}
```

**Template Structure:**

```vue
<template>
  <div :class="['textarea-wrapper', { 'textarea-error': !!error }]">
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
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
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
// Auto-resize logic
function adjustHeight() {
  if (!autoResize || !textareaRef.value) return;
  
  const textarea = textareaRef.value;
  textarea.style.height = 'auto';
  
  const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
  const minHeight = minRows ? minRows * lineHeight : undefined;
  const maxHeight = maxRows ? maxRows * lineHeight : undefined;
  
  let newHeight = textarea.scrollHeight;
  
  if (minHeight && newHeight < minHeight) newHeight = minHeight;
  if (maxHeight && newHeight > maxHeight) newHeight = maxHeight;
  
  textarea.style.height = `${newHeight}px`;
}
</script>
```

---

### 5. **AppModal.vue**

**Props:**

```typescript
interface AppModalProps {
  /** v-model for visibility */
  modelValue: boolean;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Show close button */
  showClose?: boolean;
  /** Persistent modal (no close) */
  persistent?: boolean;
  /** Custom z-index */
  zIndex?: number;
}
```

**Emits:**
```typescript
interface AppModalEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
  (e: 'open'): void;
}
```

**Slots:**
- `default`: Modal body content
- `header`: Custom header (replaces title)
- `footer`: Modal footer with actions

**Template Structure:**

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        :style="{ zIndex }"
        @click.self="handleBackdropClick"
      >
        <div
          ref="modalRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :class="['modal', `modal-${size}`]"
          @keydown.esc="handleEscape"
        >
          <!-- Header -->
          <div v-if="$slots.header || title || showClose" class="modal-header">
            <slot name="header">
              <h2 v-if="title" :id="titleId" class="modal-title">
                {{ title }}
              </h2>
            </slot>
            
            <button
              v-if="showClose && !persistent"
              type="button"
              class="modal-close"
              aria-label="Close modal"
              @click="close"
            >
              <XIcon />
            </button>
          </div>
          
          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>
          
          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted, ref, nextTick } from 'vue';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';

const modalRef = ref<HTMLElement | null>(null);

// Focus trap
const { activate, deactivate } = useFocusTrap(modalRef, {
  immediate: false,
  allowOutsideClick: true,
});

// Body scroll lock
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    nextTick(() => {
      activate();
      emit('open');
    });
  } else {
    document.body.style.overflow = '';
    deactivate();
  }
});

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = '';
  deactivate();
});

function close() {
  if (!props.persistent) {
    emit('update:modelValue', false);
    emit('close');
  }
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    close();
  }
}

function handleEscape() {
  if (props.closeOnEscape) {
    close();
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: var(--spacing-4);
}

.modal {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-height: calc(100vh - var(--spacing-8));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Sizes */
.modal-sm { width: 100%; max-width: 400px; }
.modal-md { width: 100%; max-width: 500px; }
.modal-lg { width: 100%; max-width: 600px; }
.modal-xl { width: 100%; max-width: 800px; }
.modal-full { width: 100%; max-width: calc(100vw - var(--spacing-8)); }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.modal-body {
  padding: var(--spacing-6);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border-primary);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-normal) ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform var(--duration-normal) ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(-20px);
}
</style>
```

---

### 6. **AppCard.vue**

**Props:**

```typescript
interface AppCardProps {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Clickable card */
  clickable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** No padding */
  noPadding?: boolean;
  /** Hover effect */
  hoverable?: boolean;
  /** Border variant */
  variant?: 'default' | 'bordered' | 'elevated';
}
```

**Emits:**
```typescript
interface AppCardEmits {
  (e: 'click', event: MouseEvent): void;
}
```

**Slots:**
- `default`: Card body content
- `header`: Custom header
- `header-actions`: Actions in header (right side)
- `footer`: Card footer

**Template Structure:**

```vue
<template>
  <div
    :class="cardClasses"
    :tabindex="clickable ? 0 : undefined"
    :role="clickable ? 'button' : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <!-- Loading overlay -->
    <div v-if="loading" class="card-loading">
      <AppSpinner size="md" />
    </div>
    
    <!-- Header -->
    <div v-if="$slots.header || title || $slots['header-actions']" class="card-header">
      <slot name="header">
        <div class="card-header-content">
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
      
      <div v-if="$slots['header-actions']" class="card-header-actions">
        <slot name="header-actions" />
      </div>
    </div>
    
    <!-- Body -->
    <div :class="['card-body', { 'card-body-no-padding': noPadding }]">
      <slot />
    </div>
    
    <!-- Footer -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

---

### 7. **AppBadge.vue**

**Props:**

```typescript
interface AppBadgeProps {
  /** Badge variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Badge size */
  size?: 'sm' | 'md';
  /** Show as dot only */
  dot?: boolean;
  /** Removable badge */
  removable?: boolean;
  /** Pill shape (fully rounded) */
  pill?: boolean;
  /** Outline style */
  outline?: boolean;
}
```

**Emits:**
```typescript
interface AppBadgeEmits {
  (e: 'remove'): void;
}
```

**Slots:**
- `default`: Badge content
- `icon`: Icon before content

**Template Structure:**

```vue
<template>
  <span :class="badgeClasses">
    <!-- Dot indicator -->
    <span v-if="dot" class="badge-dot" />
    
    <!-- Icon -->
    <span v-if="$slots.icon && !dot" class="badge-icon">
      <slot name="icon" />
    </span>
    
    <!-- Content -->
    <span v-if="!dot" class="badge-content">
      <slot />
    </span>
    
    <!-- Remove button -->
    <button
      v-if="removable && !dot"
      type="button"
      class="badge-remove"
      aria-label="Remove"
      @click.stop="$emit('remove')"
    >
      <XIcon class="badge-remove-icon" />
    </button>
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  white-space: nowrap;
}

.badge-pill {
  border-radius: var(--radius-full);
}

/* Sizes */
.badge-sm {
  padding: 2px var(--spacing-2);
  font-size: var(--font-size-xs);
}

.badge-md {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-sm);
}

/* Variants - Filled */
.badge-default { background-color: var(--color-gray-100); color: var(--color-gray-700); }
.badge-primary { background-color: var(--color-primary-100); color: var(--color-primary-700); }
.badge-success { background-color: var(--color-success-100); color: var(--color-success-700); }
.badge-warning { background-color: var(--color-warning-100); color: var(--color-warning-700); }
.badge-error { background-color: var(--color-error-100); color: var(--color-error-700); }
.badge-info { background-color: var(--color-info-100); color: var(--color-info-700); }

/* Variants - Outline */
.badge-outline.badge-default { background: transparent; border: 1px solid var(--color-gray-300); }
.badge-outline.badge-primary { background: transparent; border: 1px solid var(--color-primary-500); }
/* ... etc */

/* Dot */
.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: currentColor;
}

.badge.badge-dot-only {
  padding: 0;
  background: transparent;
}
</style>
```

---

### 8. **AppSpinner.vue**

**Props:**

```typescript
interface AppSpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg';
  /** Spinner color */
  color?: 'primary' | 'white' | 'gray' | 'current';
  /** Screen reader label */
  label?: string;
}
```

**Template Structure:**

```vue
<template>
  <div :class="spinnerClasses" role="status" :aria-label="label">
    <svg
      class="spinner-svg"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="spinner-track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
      />
      <circle
        class="spinner-arc"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Sizes */
.spinner-sm .spinner-svg { width: 16px; height: 16px; }
.spinner-md .spinner-svg { width: 24px; height: 24px; }
.spinner-lg .spinner-svg { width: 32px; height: 32px; }

/* Colors */
.spinner-primary { color: var(--color-primary-600); }
.spinner-white { color: white; }
.spinner-gray { color: var(--color-gray-400); }
.spinner-current { color: currentColor; }

.spinner-track {
  opacity: 0.25;
}

.spinner-arc {
  stroke-dasharray: 60;
  stroke-dashoffset: 45;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

---

### 9. **AppEmptyState.vue**

**Props:**

```typescript
interface AppEmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Icon name */
  icon?: string;
  /** Action button text */
  actionText?: string;
  /** Compact variant */
  compact?: boolean;
}
```

**Emits:**
```typescript
interface AppEmptyStateEmits {
  (e: 'action'): void;
}
```

**Slots:**
- `icon`: Custom icon
- `default`: Additional content below description
- `action`: Custom action

**Template Structure:**

```vue
<template>
  <div :class="['empty-state', { 'empty-state-compact': compact }]">
    <!-- Icon -->
    <div class="empty-state-icon">
      <slot name="icon">
        <component
          :is="getIconComponent(icon)"
          v-if="icon"
          class="empty-state-icon-svg"
        />
        <InboxIcon v-else class="empty-state-icon-svg" />
      </slot>
    </div>
    
    <!-- Title -->
    <h3 class="empty-state-title">{{ title }}</h3>
    
    <!-- Description -->
    <p v-if="description" class="empty-state-description">
      {{ description }}
    </p>
    
    <!-- Additional content -->
    <div v-if="$slots.default" class="empty-state-content">
      <slot />
    </div>
    
    <!-- Action -->
    <div v-if="$slots.action || actionText" class="empty-state-action">
      <slot name="action">
        <AppButton variant="primary" @click="$emit('action')">
          {{ actionText }}
        </AppButton>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
}

.empty-state-compact {
  padding: var(--spacing-6) var(--spacing-4);
}

.empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background-color: var(--color-gray-100);
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-4);
}

.empty-state-compact .empty-state-icon {
  width: 48px;
  height: 48px;
}

.empty-state-icon-svg {
  width: 32px;
  height: 32px;
}

.empty-state-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}

.empty-state-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-4);
  max-width: 400px;
}

.empty-state-action {
  margin-top: var(--spacing-4);
}
</style>
```

---

### 10. **AppConfirmDialog.vue**

**Props:**

```typescript
interface AppConfirmDialogProps {
  /** v-model for visibility */
  modelValue: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Danger/destructive mode */
  danger?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon name */
  icon?: string;
}
```

**Emits:**
```typescript
interface AppConfirmDialogEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}
```

**Template Structure:**

```vue
<template>
  <AppModal
    :model-value="modelValue"
    size="sm"
    :close-on-backdrop="!loading"
    :close-on-escape="!loading"
    :show-close="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="confirm-dialog">
      <!-- Icon -->
      <div :class="['confirm-icon', { 'confirm-icon-danger': danger }]">
        <slot name="icon">
          <AlertTriangleIcon v-if="danger" />
          <HelpCircleIcon v-else />
        </slot>
      </div>
      
      <!-- Title -->
      <h3 class="confirm-title">{{ title }}</h3>
      
      <!-- Message -->
      <p class="confirm-message">{{ message }}</p>
    </div>
    
    <template #footer>
      <AppButton
        variant="secondary"
        :disabled="loading"
        @click="handleCancel"
      >
        {{ cancelText }}
      </AppButton>
      
      <AppButton
        :variant="danger ? 'danger' : 'primary'"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<AppConfirmDialogProps>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  danger: false,
  loading: false,
});

const emit = defineEmits<AppConfirmDialogEmits>();

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>

<style scoped>
.confirm-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-100);
  color: var(--color-primary-600);
  margin-bottom: var(--spacing-4);
}

.confirm-icon-danger {
  background-color: var(--color-error-100);
  color: var(--color-error-600);
}

.confirm-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}

.confirm-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
```

---

### 11. **index.ts** (Barrel Export)

**Content:**

```typescript
// Form Components
export { default as AppButton } from './AppButton.vue';
export { default as AppInput } from './AppInput.vue';
export { default as AppSelect } from './AppSelect.vue';
export { default as AppTextarea } from './AppTextarea.vue';

// Feedback Components
export { default as AppModal } from './AppModal.vue';
export { default as AppSpinner } from './AppSpinner.vue';
export { default as AppConfirmDialog } from './AppConfirmDialog.vue';

// Display Components
export { default as AppCard } from './AppCard.vue';
export { default as AppBadge } from './AppBadge.vue';
export { default as AppEmptyState } from './AppEmptyState.vue';

// Re-export prop types for external use
export type { AppButtonProps } from './AppButton.vue';
export type { AppInputProps } from './AppInput.vue';
export type { AppSelectProps, SelectOption } from './AppSelect.vue';
export type { AppTextareaProps } from './AppTextarea.vue';
export type { AppModalProps } from './AppModal.vue';
export type { AppCardProps } from './AppCard.vue';
export type { AppBadgeProps } from './AppBadge.vue';
export type { AppSpinnerProps } from './AppSpinner.vue';
export type { AppEmptyStateProps } from './AppEmptyState.vue';
export type { AppConfirmDialogProps } from './AppConfirmDialog.vue';
```

---

# CONSTRAINTS AND STANDARDS

## Code:
- **Language:** TypeScript 5.x with Vue 3
- **Code style:** Google TypeScript Style Guide
- **Framework:** Vue 3 Composition API with `<script setup>`
- **Styling:** Scoped CSS using CSS variables

## Mandatory best practices:
- **Accessibility:** ARIA attributes, keyboard navigation, focus management
- **Type Safety:** Full props/emits interfaces with defineProps/defineEmits
- **Reactivity:** Use computed for derived values
- **Slots:** Support customization via slots
- **Events:** Proper event emission for v-model and actions
- **Responsive:** Mobile-first, responsive design

## Component Design Principles:
- Single responsibility per component
- Composable and reusable
- Consistent API across similar components
- Default prop values for common cases
- CSS variables for theming

## Naming Conventions:
- Component files: `App{Name}.vue`
- Props interface: `App{Name}Props`
- Emits interface: `App{Name}Emits`
- CSS classes: BEM-like (`component-element-modifier`)

---

# DELIVERABLES

1. **Complete source code** for all 11 files (10 components + 1 index)

2. **For each component:**
   - Full `<script setup>` with TypeScript
   - Props interface with defaults
   - Emits interface
   - Scoped CSS styles
   - Accessibility attributes
   - JSDoc comments

3. **Features per component:**
   - AppButton: variants, sizes, loading, icons
   - AppInput: types, validation, icons
   - AppSelect: options, placeholder, clearable
   - AppTextarea: auto-resize, counter
   - AppModal: sizes, focus trap, transitions
   - AppCard: header/footer, loading, clickable
   - AppBadge: variants, dot, removable
   - AppSpinner: sizes, colors
   - AppEmptyState: icon, action
   - AppConfirmDialog: danger mode, loading

4. **Edge cases to handle:**
   - Empty/null values
   - Disabled states
   - Loading states
   - Keyboard navigation
   - Focus management

---

# OUTPUT FORMAT

For each file, provide the complete implementation:

```vue
<!-- src/presentation/components/common/AppButton.vue -->
[Complete code here]
```

```vue
<!-- src/presentation/components/common/AppInput.vue -->
[Complete code here]
```

... (continue for all 11 files)

**Design decisions made:**
- [Decision 1 and justification]
- [Decision 2 and justification]

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
