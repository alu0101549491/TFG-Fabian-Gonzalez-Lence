/**
 * Test helper utilities
 * Provides common test setup and utility functions
 */

import {User} from '../../src/domain/entities/User';
import {UserRole} from '../../src/domain/enums/UserRole';
import {Project} from '../../src/domain/entities/Project';
import {ProjectType} from '../../src/domain/enums/ProjectType';
import {
  GeoCoordinates,
} from '../../src/domain/value-objects/GeoCoordinates';
import {Task} from '../../src/domain/entities/Task';
import {TaskPriority} from '../../src/domain/enums/TaskPriority';

/**
 * Creates a test user with default values
 */
export function createTestUser(
    overrides: Partial<{
    id: string;
    username: string;
    email: string;
    role: UserRole;
  }> = {},
): User {
  return new User(
    overrides.id ?? 'test-user-1',
    overrides.username ?? 'testuser',
    overrides.email ?? 'test@example.com',
    'hashedpassword',
    overrides.role ?? UserRole.CLIENT,
  );
}

/**
 * Creates a test project with default values
 */
export function createTestProject(
    overrides: Partial<{
    id: string;
    code: string;
    name: string;
    clientId: string;
    type: ProjectType;
  }> = {},
): Project {
  return new Project(
    overrides.id ?? 'test-proj-1',
    overrides.code ?? 'PRJ-001',
    overrides.name ?? 'Test Project',
    overrides.clientId ?? 'client-1',
    overrides.type ?? ProjectType.RESIDENTIAL,
    new Date('2025-01-01'),
    new Date('2025-12-31'),
    new GeoCoordinates(28.4636, -16.2518),
  );
}

/**
 * Creates a test task with default values
 */
export function createTestTask(
    overrides: Partial<{
    id: string;
    projectId: string;
    creatorId: string;
    assigneeId: string;
    description: string;
    priority: TaskPriority;
  }> = {},
): Task {
  return new Task(
    overrides.id ?? 'test-task-1',
    overrides.projectId ?? 'proj-1',
    overrides.creatorId ?? 'user-1',
    overrides.assigneeId ?? 'user-2',
    overrides.description ?? 'Test task',
    overrides.priority ?? TaskPriority.MEDIUM,
    new Date('2025-06-30'),
  );
}
