import {Task} from '../../../../src/domain/entities/Task';
import {TaskStatus} from '../../../../src/domain/enums/TaskStatus';
import {TaskPriority} from '../../../../src/domain/enums/TaskPriority';

describe('Task Entity', () => {
  let task: Task;

  beforeEach(() => {
    task = new Task(
      'task-1',
      'proj-1',
      'user-1',
      'user-2',
      'Test task description',
      TaskPriority.MEDIUM,
      new Date('2025-06-30'),
    );
  });

  describe('constructor', () => {
    it('should create a task with valid properties', () => {
      expect(task.getId()).toBe('task-1');
      expect(task.getProjectId()).toBe('proj-1');
      expect(task.getDescription()).toBe('Test task description');
      expect(task.getPriority()).toBe(TaskPriority.MEDIUM);
    });

    it('should set initial status to PENDING', () => {
      expect(task.getStatus()).toBe(TaskStatus.PENDING);
    });
  });

  describe('setDescription', () => {
    it('should update task description', () => {
      task.setDescription('Updated description');
      expect(task.getDescription()).toBe('Updated description');
    });
  });
});
