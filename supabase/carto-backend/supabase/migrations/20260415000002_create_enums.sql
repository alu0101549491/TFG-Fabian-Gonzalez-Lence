/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 15, 2026
 * @file 20260415000002_create_enums.sql
 * @desc Create all enum types for CARTO project database schema
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

-- User Role Enum
CREATE TYPE "UserRole" AS ENUM (
  'ADMINISTRATOR',
  'CLIENT',
  'SPECIAL_USER'
);

-- Project Status Enum
CREATE TYPE "ProjectStatus" AS ENUM (
  'ACTIVE',
  'IN_PROGRESS',
  'PENDING_REVIEW',
  'FINALIZED'
);

-- Project Type Enum
CREATE TYPE "ProjectType" AS ENUM (
  'TOPOGRAPHY',
  'CADASTRE',
  'GIS',
  'HYDROLOGY',
  'INDUSTRIAL',
  'CIVIL_ENGINEERING',
  'ENVIRONMENTAL_DOCUMENT',
  'STUDY_OF_ALTERNATIVES',
  'GEOLOGICAL_STUDY',
  'HYDROGEOLOGICAL_STUDY',
  'RISK_STUDY',
  'CONSTRUCTION_MANAGEMENT',
  'MISCELLANEOUS'
);

-- Task Status Enum
CREATE TYPE "TaskStatus" AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'PARTIAL',
  'PERFORMED',
  'COMPLETED'
);

-- Task Priority Enum
CREATE TYPE "TaskPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

-- Notification Type Enum
CREATE TYPE "NotificationType" AS ENUM (
  'NEW_MESSAGE',
  'NEW_TASK',
  'TASK_STATUS_CHANGE',
  'FILE_RECEIVED',
  'PROJECT_ASSIGNED',
  'PROJECT_FINALIZED'
);

-- File Type Enum
CREATE TYPE "FileType" AS ENUM (
  'PDF',
  'KML',
  'SHP',
  'IMAGE',
  'DOCUMENT',
  'SPREADSHEET',
  'CAD',
  'COMPRESSED'
);

-- Access Right Enum
CREATE TYPE "AccessRight" AS ENUM (
  'VIEW',
  'DOWNLOAD',
  'EDIT',
  'DELETE',
  'UPLOAD',
  'SEND_MESSAGE'
);

-- Audit Action Enum
CREATE TYPE "AuditAction" AS ENUM (
  'CREATE',
  'UPDATE',
  'DELETE',
  'FINALIZE',
  'PERMISSION_GRANT',
  'PERMISSION_REVOKE',
  'LOGIN',
  'LOGOUT',
  'PASSWORD_CHANGE',
  'ROLE_CHANGE'
);

-- Audit Resource Type Enum
CREATE TYPE "AuditResourceType" AS ENUM (
  'PROJECT',
  'TASK',
  'USER',
  'MESSAGE',
  'FILE',
  'PERMISSION',
  'AUTHENTICATION'
);
