/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file src/presentation/keys/toast.key.ts
 * @desc Typed InjectionKey for the global toast notification provider.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {InjectionKey} from 'vue';

export type AddToast = (toast: {type: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string; duration?: number}) => void;

export const TOAST_KEY: InjectionKey<AddToast> = Symbol('toast');
