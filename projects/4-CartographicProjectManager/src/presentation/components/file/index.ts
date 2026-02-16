/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 16, 2026
 * @file src/presentation/components/file/index.ts
 * @desc Barrel export for file components
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

export {default as FileList} from './FileList.vue';
export {default as FileUploader} from './FileUploader.vue';

export type {FileListProps, FileListEmits} from './FileList.vue';
export type {FileUploaderProps, FileUploaderEmits} from './FileUploader.vue';
