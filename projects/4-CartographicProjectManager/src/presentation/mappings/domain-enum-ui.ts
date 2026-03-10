/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file src/presentation/mappings/domain-enum-ui.ts
 * @desc UI-focused display names, colors, icons, and templates for Domain enums.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import type {
  AccessRight,
  FileType,
  NotificationType,
  ProjectStatus,
  ProjectType,
  TaskPriority,
  TaskStatus,
  UserRole,
} from '../../domain/enumerations';

export const UserRoleDisplayName: Record<UserRole, string> = {
  ADMINISTRATOR: 'Administrator',
  CLIENT: 'Client',
  SPECIAL_USER: 'Special User',
};

export const ProjectStatusDisplayName: Record<ProjectStatus, string> = {
  ACTIVE: 'Active',
  IN_PROGRESS: 'In Progress',
  PENDING_REVIEW: 'Pending Review',
  FINALIZED: 'Finalized',
};

export const ProjectStatusColor: Record<ProjectStatus, string> = {
  ACTIVE: 'blue',
  IN_PROGRESS: 'blue',
  PENDING_REVIEW: 'yellow',
  FINALIZED: 'gray',
};

export const ProjectTypeDisplayName: Record<ProjectType, string> = {
  TOPOGRAPHY: 'Topography',
  CADASTRE: 'Cadastre',
  GIS: 'GIS',
  HYDROLOGY: 'Hydrology',
  CIVIL_ENGINEERING: 'Civil Engineering',
  ENVIRONMENTAL_DOCUMENT: 'Environmental Document',
  STUDY_OF_ALTERNATIVES: 'Study of Alternatives',
  GEOLOGICAL_STUDY: 'Geological Study',
  HYDROGEOLOGICAL_STUDY: 'Hydrogeological Study',
  RISK_STUDY: 'Risk Study',
  CONSTRUCTION_MANAGEMENT: 'Construction Management',
  MISCELLANEOUS: 'Miscellaneous',
};

export const TaskStatusDisplayName: Record<TaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  PARTIAL: 'Partial',
  PERFORMED: 'Done (Pending Confirmation)',
  COMPLETED: 'Completed',
};

export const TaskStatusColor: Record<TaskStatus, string> = {
  PENDING: 'gray',
  IN_PROGRESS: 'blue',
  PARTIAL: 'orange',
  PERFORMED: 'purple',
  COMPLETED: 'green',
};

export const TaskPriorityDisplayName: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const TaskPriorityColor: Record<TaskPriority, string> = {
  LOW: 'green',
  MEDIUM: 'yellow',
  HIGH: 'red',
};

export const NotificationTypeDisplayName: Record<NotificationType, string> = {
  NEW_MESSAGE: 'New Message',
  NEW_TASK: 'New Task',
  TASK_STATUS_CHANGE: 'Task Status Changed',
  FILE_RECEIVED: 'File Received',
  PROJECT_ASSIGNED: 'Project Assigned',
  PROJECT_FINALIZED: 'Project Finalized',
  BACKUP_COMPLETED: 'Backup Completed',
  BACKUP_RESTORED: 'Backup Restored',
};

export const NotificationTypeMessageTemplate: Record<NotificationType, string> = {
  NEW_MESSAGE: 'New message in {projectName}',
  NEW_TASK: 'New task: {taskDescription}',
  TASK_STATUS_CHANGE: "Task '{taskDescription}' changed to {status}",
  FILE_RECEIVED: 'New file: {fileName}',
  PROJECT_ASSIGNED: "You've been assigned to project {projectCode}",
  PROJECT_FINALIZED: 'Project {projectCode} has been finalized',
  BACKUP_COMPLETED: 'System backup completed',
  BACKUP_RESTORED: 'System restored from backup',
};

export const NotificationTypeIcon: Record<NotificationType, string> = {
  NEW_MESSAGE: 'message',
  NEW_TASK: 'task',
  TASK_STATUS_CHANGE: 'update',
  FILE_RECEIVED: 'file',
  PROJECT_ASSIGNED: 'project',
  PROJECT_FINALIZED: 'check',
  BACKUP_COMPLETED: 'backup',
  BACKUP_RESTORED: 'restore',
};

export const FileTypeDisplayName: Record<FileType, string> = {
  PDF: 'PDF Document',
  KML: 'KML Geographic Data',
  SHP: 'Shapefile',
  IMAGE: 'Image',
  DOCUMENT: 'Document',
  SPREADSHEET: 'Spreadsheet',
  CAD: 'CAD Drawing',
  COMPRESSED: 'Compressed Archive',
};

export const FileTypeIcon: Record<FileType, string> = {
  PDF: 'pdf',
  KML: 'map',
  SHP: 'map-marked',
  IMAGE: 'image',
  DOCUMENT: 'file-text',
  SPREADSHEET: 'table',
  CAD: 'drafting-compass',
  COMPRESSED: 'file-archive',
};

export const AccessRightDisplayName: Record<AccessRight, string> = {
  VIEW: 'View',
  DOWNLOAD: 'Download',
  EDIT: 'Edit',
  DELETE: 'Delete',
  UPLOAD: 'Upload',
  SEND_MESSAGE: 'Send Message',
};

export const AccessRightDescription: Record<AccessRight, string> = {
  VIEW: 'Can view project data and files',
  DOWNLOAD: 'Can download project files',
  EDIT: 'Can edit project data and tasks',
  DELETE: 'Can delete project elements',
  UPLOAD: 'Can upload files to the project',
  SEND_MESSAGE: 'Can send messages in the project',
};
