import {TaskPriority} from '@domain/enums/TaskPriority';
import {TaskStatus} from '@domain/enums/TaskStatus';

/**
 * Task creation/update data DTO
 */
export interface TaskData {
  projectId: string;
  creatorId: string;
  assigneeId: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate: Date;
}
