-- Drop old snake_case enums and recreate with PascalCase
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS project_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS file_type CASCADE;
DROP TYPE IF EXISTS access_right CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;
DROP TYPE IF EXISTS audit_resource_type CASCADE;

-- Recreate with PascalCase (matching Prisma schema)
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRATOR', 'CLIENT', 'SPECIAL_USER');
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'IN_PROGRESS', 'PENDING_REVIEW', 'FINALIZED');
CREATE TYPE "ProjectType" AS ENUM ('TOPOGRAPHY', 'CADASTRE', 'GIS', 'HYDROLOGY', 'INDUSTRIAL', 'CIVIL_ENGINEERING', 'ENVIRONMENTAL_DOCUMENT', 'STUDY_OF_ALTERNATIVES', 'GEOLOGICAL_STUDY', 'HYDROGEOLOGICAL_STUDY', 'RISK_STUDY', 'CONSTRUCTION_MANAGEMENT', 'MISCELLANEOUS');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PARTIAL', 'PERFORMED', 'COMPLETED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "NotificationType" AS ENUM ('NEW_MESSAGE', 'NEW_TASK', 'TASK_STATUS_CHANGE', 'FILE_RECEIVED', 'PROJECT_ASSIGNED', 'PROJECT_FINALIZED');
CREATE TYPE "FileType" AS ENUM ('PDF', 'KML', 'SHP', 'IMAGE', 'DOCUMENT', 'SPREADSHEET', 'CAD', 'COMPRESSED');
CREATE TYPE "AccessRight" AS ENUM ('VIEW', 'DOWNLOAD', 'EDIT', 'DELETE', 'UPLOAD', 'SEND_MESSAGE');  
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'FINALIZE', 'PERMISSION_GRANT', 'PERMISSION_REVOKE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ROLE_CHANGE');
CREATE TYPE "AuditResourceType" AS ENUM ('PROJECT', 'TASK', 'USER', 'MESSAGE', 'FILE', 'PERMISSION', 'AUTHENTICATION');

-- Update table columns to use new enum types
ALTER TABLE users ALTER COLUMN role TYPE "UserRole" USING role::text::"UserRole";
ALTER TABLE projects ALTER COLUMN type TYPE "ProjectType" USING type::text::"ProjectType";
ALTER TABLE projects ALTER COLUMN status TYPE "ProjectStatus" USING status::text::"ProjectStatus";
ALTER TABLE tasks ALTER COLUMN status TYPE "TaskStatus" USING status::text::"TaskStatus";
ALTER TABLE tasks ALTER COLUMN priority TYPE "TaskPriority" USING priority::text::"TaskPriority";
ALTER TABLE notifications ALTER COLUMN type TYPE "NotificationType" USING type::text::"NotificationType";
ALTER TABLE files ALTER COLUMN type TYPE "FileType" USING type::text::"FileType";
ALTER TABLE task_history ALTER COLUMN previous_status TYPE "TaskStatus" USING previous_status::text::"TaskStatus";
ALTER TABLE task_history ALTER COLUMN new_status TYPE "TaskStatus" USING new_status::text::"TaskStatus";
ALTER TABLE audit_logs ALTER COLUMN action TYPE "AuditAction" USING action::text::"AuditAction";
ALTER TABLE audit_logs ALTER COLUMN resource_type TYPE "AuditResourceType" USING resource_type::text::"AuditResourceType";
