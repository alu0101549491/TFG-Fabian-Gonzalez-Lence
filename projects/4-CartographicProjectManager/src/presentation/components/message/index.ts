/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 13, 2026
 * @file src/presentation/components/message/index.ts
 * @desc Barrel export for message components
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

export {default as MessageBubble} from './MessageBubble.vue';
export {default as MessageInput} from './MessageInput.vue';
export {default as MessageList} from './MessageList.vue';

export type {MessageBubbleProps, MessageBubbleEmits} from './MessageBubble.vue';
export type {MessageInputProps, MessageInputEmits} from './MessageInput.vue';
export type {MessageListProps, MessageListEmits} from './MessageList.vue';
