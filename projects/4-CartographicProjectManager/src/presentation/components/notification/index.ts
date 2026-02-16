/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 16, 2026
 * @file src/presentation/components/notification/index.ts
 * @desc Barrel export for notification components
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

export {default as NotificationItem} from './NotificationItem.vue';
export {default as NotificationList} from './NotificationList.vue';

export type {NotificationItemProps, NotificationItemEmits} from './NotificationItem.vue';
export type {
  NotificationListProps,
  NotificationListEmits,
  NotificationFilter,
} from './NotificationList.vue';
