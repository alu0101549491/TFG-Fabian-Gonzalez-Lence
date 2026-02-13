/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/components/common/index.ts
 * @desc Barrel export for common/shared components
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

// Component exports
export {default as AppButton} from './AppButton.vue';
export {default as AppInput} from './AppInput.vue';
export {default as AppSelect} from './AppSelect.vue';
export {default as AppTextarea} from './AppTextarea.vue';
export {default as AppModal} from './AppModal.vue';
export {default as AppCard} from './AppCard.vue';
export {default as AppBadge} from './AppBadge.vue';
export {default as AppSpinner} from './AppSpinner.vue';
export {default as AppEmptyState} from './AppEmptyState.vue';
export {default as AppConfirmDialog} from './AppConfirmDialog.vue';

// Type exports - Button
export type {AppButtonProps, AppButtonEmits} from './AppButton.vue';

// Type exports - Input
export type {AppInputProps, AppInputEmits} from './AppInput.vue';

// Type exports - Select
export type {AppSelectProps, AppSelectEmits, SelectOption} from './AppSelect.vue';

// Type exports - Textarea
export type {AppTextareaProps, AppTextareaEmits} from './AppTextarea.vue';

// Type exports - Modal
export type {AppModalProps, AppModalEmits} from './AppModal.vue';

// Type exports - Card
export type {AppCardProps, AppCardEmits} from './AppCard.vue';

// Type exports - Badge
export type {AppBadgeProps, AppBadgeEmits} from './AppBadge.vue';

// Type exports - Spinner
export type {AppSpinnerProps, AppSpinnerEmits} from './AppSpinner.vue';

// Type exports - Empty State
export type {AppEmptyStateProps, AppEmptyStateEmits} from './AppEmptyState.vue';

// Type exports - Confirm Dialog
export type {AppConfirmDialogProps, AppConfirmDialogEmits} from './AppConfirmDialog.vue';
