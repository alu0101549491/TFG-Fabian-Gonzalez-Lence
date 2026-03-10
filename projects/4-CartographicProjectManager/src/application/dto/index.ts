/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 8, 2026
 * @file src/application/dto/index.ts
 * @desc Barrel exports for all Application DTOs.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

// Authentication DTOs
export type {
  UserDto,
  LoginCredentialsDto,
  RegisterCredentialsDto,
  AuthResultDto,
  RefreshTokenDto,
  SessionDto,
} from './auth-result.dto';
export {AuthErrorCode} from './auth-result.dto';
export {
  createSuccessAuthResult,
  createFailedAuthResult,
} from '../auth/auth-result.helpers';

// Validation DTOs
export type {
  ValidationErrorDto,
  ValidationResultDto,
  FieldConstraints,
  ValidationSchema,
} from './validation-result.dto';
export {ValidationErrorCode} from './validation-result.dto';
export {
  validResult,
  invalidResult,
  createError,
  mergeValidationResults,
} from '../validation/validation-result.helpers';

// File DTOs
export type {
  UploadFileDto,
  FileUploadResultDto,
  FileDto,
  FileSummaryDto,
  BatchUploadDto,
  BatchUploadResultDto,
  DownloadFileDto,
  FileDownloadResultDto,
  FileFilterDto,
} from './file-data.dto';
export {ProjectSection, FileErrorCode} from './file-data.dto';

// Project DTOs
export type {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectSpecialUsersDto,
  ProjectSummaryDto,
  CalendarProjectDto,
  ProjectFilterDto,
  ProjectListResponseDto,
} from './project-data.dto';

// Project Details DTOs
export type {
  ProjectDto,
  TaskSummaryDto,
  MessageSummaryDto,
  ParticipantDto,
  ProjectSectionDto,
  TaskStatsDto,
  ProjectPermissionsDto,
  ProjectDetailsDto,
} from './project-details.dto';

// Task DTOs
export type {
  CreateTaskDto,
  UpdateTaskDto,
  ChangeTaskStatusDto,
  ConfirmTaskDto,
  TaskDto,
  TaskHistoryEntryDto,
  TaskFilterDto,
  TaskListResponseDto,
  CalendarTaskDto,
} from './task-data.dto';

// Message DTOs
export type {
  CreateMessageDto,
  MessageDto,
  MarkMessagesReadDto,
  MessageFilterDto,
  MessageListResponseDto,
  UnreadCountsDto,
  MessageType,
} from './message-data.dto';

// Notification DTOs
export type {
  NotificationDto,
  NotificationFilterDto,
  NotificationListResponseDto,
  NotificationPreferencesDto,
} from './notification-data.dto';

// User Management DTOs
export type {
  UserDataDto,
  UserSummaryDto,
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  UserListResponseDto,
  CreateUserResultDto,
  UpdateUserResultDto,
  DeleteUserResultDto,
} from './user-data.dto';

// Export DTOs
export type {
  ExportFiltersDto,
  ExportPresetDto,
} from './export-filters.dto';
export {ExportFormat, ExportDataType, EXPORT_PRESETS} from './export-filters.dto';

export type {
  ExportResultDto,
  ExportProgressDto,
  ExportInfoDto,
} from './export-result.dto';
export {ExportStatus, ExportErrorCode} from './export-result.dto';

// Backup DTOs
export type {
  BackupRecordCounts,
  BackupResultDto,
  BackupInfoDto,
  BackupListResponseDto,
  RestoreBackupDto,
  RestoreResultDto,
  BackupScheduleDto,
  BackupFrequency,
  StorageUsageDto,
} from './backup-result.dto';
export {BackupStatus, BackupType, BackupErrorCode} from './backup-result.dto';

// Calendar DTOs
export type {
  CalendarItemDto,
  CalendarDayDto,
  CalendarItemType,
} from './calendar-data.dto';

