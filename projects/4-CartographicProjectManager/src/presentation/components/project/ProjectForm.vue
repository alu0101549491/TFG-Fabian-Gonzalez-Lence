<!--
  University of La Laguna
  School of Engineering and Technology
  Degree in Computer Engineering
  Final Degree Project (TFG)

  @author Fabián González Lence <alu0101549491@ull.edu.es>
  @since February 13, 2026
  @file src/presentation/components/project/ProjectForm.vue
  @desc Form component for creating and editing projects with validation
  @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
-->

<template>
  <form class="project-form" novalidate @submit.prevent="handleSubmit">
    <h2 class="project-form-title">{{ isEditMode ? 'Edit Project' : 'Create New Project' }}</h2>

    <!-- Project Code & Year row -->
    <div class="project-form-row">
      <!-- Code -->
      <div class="project-form-field">
        <label for="project-code" class="project-form-label">
          Project Code
          <span class="project-form-required">*</span>
        </label>
        <div class="project-form-input-group">
          <input
            id="project-code"
            v-model="form.code"
            type="text"
            class="project-form-input"
            :class="{'project-form-input-error': errors.code}"
            placeholder="CART-2026-001"
            :disabled="isEditMode"
            :readonly="isEditMode"
            required
            @blur="validateField('code')"
          />
          <button
            v-if="!isEditMode"
            type="button"
            class="project-form-generate-btn"
            title="Generate project code"
            @click="generateCode"
          >
            🔄
          </button>
        </div>
        <p v-if="errors.code" class="project-form-error">{{ errors.code }}</p>
        <p v-else class="project-form-hint">Format: CART-YYYY-NNN</p>
      </div>

      <!-- Year -->
      <div class="project-form-field">
        <label for="project-year" class="project-form-label">
          Year
          <span class="project-form-required">*</span>
        </label>
        <input
          id="project-year"
          v-model.number="form.year"
          type="number"
          class="project-form-input"
          :class="{'project-form-input-error': errors.year}"
          :min="2020"
          :max="2100"
          :disabled="isEditMode"
          :readonly="isEditMode"
          required
          @blur="validateField('year')"
        />
        <p v-if="errors.year" class="project-form-error">{{ errors.year }}</p>
      </div>
    </div>

    <!-- Name -->
    <div class="project-form-field">
      <label for="project-name" class="project-form-label">
        Project Name
        <span class="project-form-required">*</span>
      </label>
      <input
        id="project-name"
        v-model="form.name"
        type="text"
        class="project-form-input"
        :class="{'project-form-input-error': errors.name}"
        placeholder="Enter project name"
        maxlength="200"
        required
        @blur="validateField('name')"
      />
      <p v-if="errors.name" class="project-form-error">{{ errors.name }}</p>
      <p v-else class="project-form-hint">{{ form.name.length }}/200 characters</p>
    </div>

    <!-- Client (create mode only) -->
    <div v-if="!isEditMode" class="project-form-field">
      <label for="project-client" class="project-form-label">
        Client
        <span class="project-form-required">*</span>
      </label>
      <select
        id="project-client"
        v-model="form.clientId"
        class="project-form-select"
        :class="{'project-form-input-error': errors.clientId}"
        required
        @blur="validateField('clientId')"
        @change="validateField('clientId')"
      >
        <option value="" disabled>Select a client</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.name }}
        </option>
      </select>
      <p v-if="errors.clientId" class="project-form-error">{{ errors.clientId }}</p>
    </div>

    <!-- Type -->
    <div class="project-form-field">
      <label for="project-type" class="project-form-label">
        Project Type
        <span class="project-form-required">*</span>
      </label>
      <select
        id="project-type"
        v-model="form.type"
        class="project-form-select"
        :class="{'project-form-input-error': errors.type}"
        required
        @blur="validateField('type')"
        @change="validateField('type')"
      >
        <option value="" disabled>Select project type</option>
        <option v-for="option in typeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <p v-if="errors.type" class="project-form-error">{{ errors.type }}</p>
    </div>

    <!-- Dates row -->
    <div class="project-form-row">
      <!-- Contract Date -->
      <div class="project-form-field">
        <label for="project-contract-date" class="project-form-label">
          Contract Date
          <span class="project-form-required">*</span>
        </label>
        <input
          id="project-contract-date"
          v-model="form.contractDate"
          type="date"
          class="project-form-input"
          :class="{'project-form-input-error': errors.contractDate}"
          required
          @blur="validateField('contractDate')"
          @change="validateField('contractDate')"
        />
        <p v-if="errors.contractDate" class="project-form-error">{{ errors.contractDate }}</p>
      </div>

      <!-- Delivery Date -->
      <div class="project-form-field">
        <label for="project-delivery-date" class="project-form-label">
          Delivery Date
          <span class="project-form-required">*</span>
        </label>
        <input
          id="project-delivery-date"
          v-model="form.deliveryDate"
          type="date"
          class="project-form-input"
          :class="{'project-form-input-error': errors.deliveryDate}"
          :min="form.contractDate || undefined"
          required
          @blur="validateField('deliveryDate')"
          @change="validateField('deliveryDate')"
        />
        <p v-if="errors.deliveryDate" class="project-form-error">{{ errors.deliveryDate }}</p>
      </div>
    </div>

    <!-- Coordinates section (optional) -->
    <fieldset class="project-form-fieldset">
      <legend class="project-form-legend">
        Geographic Coordinates
        <span class="project-form-optional">(Optional)</span>
      </legend>

      <div class="project-form-row">
        <!-- Longitude (X) -->
        <div class="project-form-field">
          <label for="project-coord-x" class="project-form-label">Longitude (X)</label>
          <input
            id="project-coord-x"
            v-model.number="form.coordinateX"
            type="number"
            class="project-form-input"
            :class="{'project-form-input-error': errors.coordinateX}"
            placeholder="-180 to 180"
            :min="-180"
            :max="180"
            step="0.000001"
            @blur="validateField('coordinateX')"
          />
          <p v-if="errors.coordinateX" class="project-form-error">{{ errors.coordinateX }}</p>
        </div>

        <!-- Latitude (Y) -->
        <div class="project-form-field">
          <label for="project-coord-y" class="project-form-label">Latitude (Y)</label>
          <input
            id="project-coord-y"
            v-model.number="form.coordinateY"
            type="number"
            class="project-form-input"
            :class="{'project-form-input-error': errors.coordinateY}"
            placeholder="-90 to 90"
            :min="-90"
            :max="90"
            step="0.000001"
            @blur="validateField('coordinateY')"
          />
          <p v-if="errors.coordinateY" class="project-form-error">{{ errors.coordinateY }}</p>
        </div>
      </div>
    </fieldset>

    <!-- Form actions -->
    <div class="project-form-actions">
      <button
        type="button"
        class="project-form-btn project-form-btn-secondary"
        :disabled="loading"
        @click="emit('cancel')"
      >
        Cancel
      </button>

      <button
        type="submit"
        class="project-form-btn project-form-btn-primary"
        :disabled="loading || !isFormValid"
      >
        <span v-if="loading" class="project-form-spinner">⏳</span>
        <span>{{ isEditMode ? 'Update Project' : 'Create Project' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import {reactive, computed, watch, onMounted} from 'vue';
import type {ProjectDto, ProjectSummaryDto, CreateProjectDto, UpdateProjectDto} from '@/application/dto';
import {ProjectType} from '@/domain/enumerations';

/**
 * ProjectForm component props
 */
export interface ProjectFormProps {
  /** Project to edit (undefined for create mode) */
  project?: ProjectDto | ProjectSummaryDto;
  /** Form submission loading state */
  loading?: boolean;
  /** Available clients for selection (required for create mode) */
  clients?: Array<{id: string; name: string}>;
  /** Initial client ID (for pre-selection in create mode) */
  initialClientId?: string;
}

/**
 * ProjectForm component emits
 */
export interface ProjectFormEmits {
  (e: 'submit', data: CreateProjectDto | UpdateProjectDto): void;
  (e: 'cancel'): void;
}

const props = withDefaults(defineProps<ProjectFormProps>(), {
  loading: false,
  clients: () => [],
  initialClientId: '',
});

const emit = defineEmits<ProjectFormEmits>();

// Form state
const form = reactive({
  code: '',
  name: '',
  year: new Date().getFullYear(),
  clientId: '',
  type: '' as ProjectType | '',
  contractDate: '',
  deliveryDate: '',
  coordinateX: null as number | null,
  coordinateY: null as number | null,
});

const errors = reactive<Record<string, string>>({});
const touched = reactive<Record<string, boolean>>({});

// Computed
const isEditMode = computed(() => !!props.project);

const typeOptions = computed(() => [
  {value: ProjectType.RESIDENTIAL, label: 'Residential'},
  {value: ProjectType.COMMERCIAL, label: 'Commercial'},
  {value: ProjectType.INDUSTRIAL, label: 'Industrial'},
  {value: ProjectType.PUBLIC, label: 'Public'},
]);

const isFormValid = computed(() => {
  // Check required fields are filled
  const hasRequiredFields = Boolean(
    form.code &&
      form.name &&
      form.year &&
      (isEditMode.value || form.clientId) &&
      form.type &&
      form.contractDate &&
      form.deliveryDate,
  );

  // Check no validation errors
  const hasNoErrors = Object.keys(errors).every((key) => !errors[key]);

  return hasRequiredFields && hasNoErrors;
});

/**
 * Initialize form for edit mode
 */
onMounted(() => {
  if (props.project) {
    form.code = props.project.code;
    form.name = props.project.name;
    form.year = 'year' in props.project ? props.project.year : new Date().getFullYear();
    form.clientId = props.project.clientId;
    form.type = props.project.type;
    form.contractDate = 'contractDate' in props.project ? formatDateForInput(props.project.contractDate) : '';
    form.deliveryDate = formatDateForInput(props.project.deliveryDate);
    form.coordinateX = 'coordinateX' in props.project ? props.project.coordinateX : null;
    form.coordinateY = 'coordinateY' in props.project ? props.project.coordinateY : null;
  } else if (props.initialClientId) {
    form.clientId = props.initialClientId;
  }
});

/**
 * Validate individual field
 */
function validateField(field: string): void {
  touched[field] = true;
  errors[field] = '';

  switch (field) {
    case 'code':
      if (!form.code) {
        errors.code = 'Project code is required';
      } else if (!/^CART-\d{4}-\d{3}$/.test(form.code)) {
        errors.code = 'Invalid format. Use CART-YYYY-NNN (e.g., CART-2026-001)';
      }
      break;

    case 'name':
      if (!form.name) {
        errors.name = 'Project name is required';
      } else if (form.name.length > 200) {
        errors.name = 'Name must be 200 characters or less';
      }
      break;

    case 'year':
      if (!form.year) {
        errors.year = 'Year is required';
      } else if (form.year < 2020 || form.year > 2100) {
        errors.year = 'Year must be between 2020 and 2100';
      }
      break;

    case 'clientId':
      if (!isEditMode.value && !form.clientId) {
        errors.clientId = 'Please select a client';
      }
      break;

    case 'type':
      if (!form.type) {
        errors.type = 'Please select a project type';
      }
      break;

    case 'contractDate':
      if (!form.contractDate) {
        errors.contractDate = 'Contract date is required';
      }
      break;

    case 'deliveryDate':
      if (!form.deliveryDate) {
        errors.deliveryDate = 'Delivery date is required';
      } else if (
        form.contractDate &&
        parseDateOnlyInput(form.deliveryDate) < parseDateOnlyInput(form.contractDate)
      ) {
        errors.deliveryDate = 'Delivery date must be after contract date';
      }
      break;

    case 'coordinateX':
      if (form.coordinateX !== null && form.coordinateX !== undefined) {
        if (form.coordinateX < -180 || form.coordinateX > 180) {
          errors.coordinateX = 'Longitude must be between -180 and 180';
        }
      }
      break;

    case 'coordinateY':
      if (form.coordinateY !== null && form.coordinateY !== undefined) {
        if (form.coordinateY < -90 || form.coordinateY > 90) {
          errors.coordinateY = 'Latitude must be between -90 and 90';
        }
      }
      break;
  }
}

/**
 * Validate all fields
 */
function validateAllFields(): boolean {
  const fields = [
    'code',
    'name',
    'year',
    'clientId',
    'type',
    'contractDate',
    'deliveryDate',
    'coordinateX',
    'coordinateY',
  ];
  fields.forEach(validateField);
  return Object.values(errors).every((error) => !error);
}

/**
 * Generate project code
 */
function generateCode(): void {
  const year = form.year || new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 999) + 1;
  form.code = `CART-${year}-${sequence.toString().padStart(3, '0')}`;
  validateField('code');
}

/**
 * Auto-update year from code
 */
watch(
  () => form.code,
  (code) => {
    const match = code.match(/^CART-(\d{4})-\d{3}$/);
    if (match && !isEditMode.value) {
      form.year = parseInt(match[1], 10);
    }
  },
);

/**
 * Format date for input[type="date"]
 */
function formatDateForInput(date: Date | string): string {
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

  let d: Date;
  if (typeof date === 'string' && dateOnlyRegex.test(date)) {
    d = parseDateOnlyInput(date);
  } else {
    d = new Date(date);
  }

  if (!Number.isFinite(d.getTime())) {
    return '';
  }

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function parseDateOnlyInput(value: string): Date {
  const [year, month, day] = value.split('-').map((part) => parseInt(part, 10));
  return new Date(year, month - 1, day);
}

/**
 * Submit handler
 */
function handleSubmit(): void {
  if (!validateAllFields()) {
    return;
  }

  if (isEditMode.value) {
    const updateData: UpdateProjectDto = {
      id: props.project!.id,
      name: form.name,
      type: form.type as ProjectType,
      contractDate: parseDateOnlyInput(form.contractDate),
      deliveryDate: parseDateOnlyInput(form.deliveryDate),
      coordinateX: form.coordinateX ?? null,
      coordinateY: form.coordinateY ?? null,
    };
    emit('submit', updateData);
  } else {
    const createData: CreateProjectDto = {
      code: form.code,
      name: form.name,
      year: form.year,
      clientId: form.clientId,
      type: form.type as ProjectType,
      contractDate: parseDateOnlyInput(form.contractDate),
      deliveryDate: parseDateOnlyInput(form.deliveryDate),
      coordinateX: form.coordinateX ?? null,
      coordinateY: form.coordinateY ?? null,
      dropboxFolderId: '',
    };
    emit('submit', createData);
  }
}
</script>

<style scoped>
.project-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  width: 100%;
  max-width: 600px;
}

.project-form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
  display: none; /* Hidden as title is in modal header */
}

.project-form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

@media (max-width: 640px) {
  .project-form-row {
    grid-template-columns: 1fr;
  }
}

.project-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.project-form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.project-form-required {
  color: var(--color-error-500);
  margin-left: 2px;
}

.project-form-optional {
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.project-form-input,
.project-form-select {
  height: 40px;
  padding: 0 var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.project-form-input:focus,
.project-form-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.project-form-input:disabled,
.project-form-input:read-only {
  background-color: var(--color-gray-100);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.project-form-input-error {
  border-color: var(--color-error-500);
}

.project-form-input-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

.project-form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-3) center;
  padding-right: 40px;
  cursor: pointer;
}

.project-form-input-group {
  display: flex;
  gap: var(--spacing-2);
}

.project-form-input-group .project-form-input {
  flex: 1;
}

.project-form-generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 18px;
  color: var(--color-gray-500);
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.project-form-generate-btn:hover {
  color: var(--color-primary-600);
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

.project-form-error {
  font-size: var(--font-size-xs);
  color: var(--color-error-600);
  margin: 0;
}

.project-form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

.project-form-fieldset {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  margin: 0;
}

.project-form-legend {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  padding: 0 var(--spacing-2);
}

.project-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-primary);
}

.project-form-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  height: 40px;
  padding: 0 var(--spacing-5);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.project-form-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.project-form-btn-primary {
  color: white;
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.project-form-btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.project-form-btn-secondary {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-primary);
}

.project-form-btn-secondary:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.project-form-spinner {
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
</style>
