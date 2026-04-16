-- Rename camelCase columns to snake_case to match Prisma @map() annotations.
-- Each rename is guarded with IF EXISTS so this migration is idempotent and
-- safe to apply on databases that were set up via prisma db push (which already
-- uses snake_case) or via the previous migrations (which used camelCase).

-- ============================================================
-- users
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'passwordHash') THEN
    ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'createdAt') THEN
    ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'lastLogin') THEN
    ALTER TABLE "users" RENAME COLUMN "lastLogin" TO "last_login";
  END IF;
END $$;

-- ============================================================
-- projects
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'clientId') THEN
    ALTER TABLE "projects" RENAME COLUMN "clientId" TO "client_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'creatorId') THEN
    ALTER TABLE "projects" RENAME COLUMN "creatorId" TO "creator_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'coordinateX') THEN
    ALTER TABLE "projects" RENAME COLUMN "coordinateX" TO "coordinate_x";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'coordinateY') THEN
    ALTER TABLE "projects" RENAME COLUMN "coordinateY" TO "coordinate_y";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'contractDate') THEN
    ALTER TABLE "projects" RENAME COLUMN "contractDate" TO "contract_date";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'deliveryDate') THEN
    ALTER TABLE "projects" RENAME COLUMN "deliveryDate" TO "delivery_date";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'dropboxFolderId') THEN
    ALTER TABLE "projects" RENAME COLUMN "dropboxFolderId" TO "dropbox_folder_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'createdAt') THEN
    ALTER TABLE "projects" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'updatedAt') THEN
    ALTER TABLE "projects" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'finalizedAt') THEN
    ALTER TABLE "projects" RENAME COLUMN "finalizedAt" TO "finalized_at";
  END IF;
END $$;

-- ============================================================
-- project_special_users
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'project_special_users' AND column_name = 'projectId') THEN
    ALTER TABLE "project_special_users" RENAME COLUMN "projectId" TO "project_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'project_special_users' AND column_name = 'userId') THEN
    ALTER TABLE "project_special_users" RENAME COLUMN "userId" TO "user_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'project_special_users' AND column_name = 'addedAt') THEN
    ALTER TABLE "project_special_users" RENAME COLUMN "addedAt" TO "added_at";
  END IF;
END $$;

-- ============================================================
-- tasks
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'projectId') THEN
    ALTER TABLE "tasks" RENAME COLUMN "projectId" TO "project_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'creatorId') THEN
    ALTER TABLE "tasks" RENAME COLUMN "creatorId" TO "creator_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'assigneeId') THEN
    ALTER TABLE "tasks" RENAME COLUMN "assigneeId" TO "assignee_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'dueDate') THEN
    ALTER TABLE "tasks" RENAME COLUMN "dueDate" TO "due_date";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'createdAt') THEN
    ALTER TABLE "tasks" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'updatedAt') THEN
    ALTER TABLE "tasks" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'completedAt') THEN
    ALTER TABLE "tasks" RENAME COLUMN "completedAt" TO "completed_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'confirmedAt') THEN
    ALTER TABLE "tasks" RENAME COLUMN "confirmedAt" TO "confirmed_at";
  END IF;
END $$;

-- ============================================================
-- task_files
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_files' AND column_name = 'taskId') THEN
    ALTER TABLE "task_files" RENAME COLUMN "taskId" TO "task_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_files' AND column_name = 'fileId') THEN
    ALTER TABLE "task_files" RENAME COLUMN "fileId" TO "file_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_files' AND column_name = 'addedAt') THEN
    ALTER TABLE "task_files" RENAME COLUMN "addedAt" TO "added_at";
  END IF;
END $$;

-- ============================================================
-- task_history
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_history' AND column_name = 'taskId') THEN
    ALTER TABLE "task_history" RENAME COLUMN "taskId" TO "task_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_history' AND column_name = 'changedBy') THEN
    ALTER TABLE "task_history" RENAME COLUMN "changedBy" TO "changed_by";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_history' AND column_name = 'previousStatus') THEN
    ALTER TABLE "task_history" RENAME COLUMN "previousStatus" TO "previous_status";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_history' AND column_name = 'newStatus') THEN
    ALTER TABLE "task_history" RENAME COLUMN "newStatus" TO "new_status";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'task_history' AND column_name = 'changedAt') THEN
    ALTER TABLE "task_history" RENAME COLUMN "changedAt" TO "changed_at";
  END IF;
END $$;

-- ============================================================
-- messages
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'projectId') THEN
    ALTER TABLE "messages" RENAME COLUMN "projectId" TO "project_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'senderId') THEN
    ALTER TABLE "messages" RENAME COLUMN "senderId" TO "sender_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'sentAt') THEN
    ALTER TABLE "messages" RENAME COLUMN "sentAt" TO "sent_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'readByUserIds') THEN
    ALTER TABLE "messages" RENAME COLUMN "readByUserIds" TO "read_by_user_ids";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'fileIds') THEN
    ALTER TABLE "messages" RENAME COLUMN "fileIds" TO "file_ids";
  END IF;
END $$;

-- ============================================================
-- notifications
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'userId') THEN
    ALTER TABLE "notifications" RENAME COLUMN "userId" TO "user_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'projectId') THEN
    ALTER TABLE "notifications" RENAME COLUMN "projectId" TO "project_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'isRead') THEN
    ALTER TABLE "notifications" RENAME COLUMN "isRead" TO "is_read";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'createdAt') THEN
    ALTER TABLE "notifications" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'readAt') THEN
    ALTER TABLE "notifications" RENAME COLUMN "readAt" TO "read_at";
  END IF;
END $$;

-- ============================================================
-- files
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'files' AND column_name = 'projectId') THEN
    ALTER TABLE "files" RENAME COLUMN "projectId" TO "project_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'files' AND column_name = 'uploadedBy') THEN
    ALTER TABLE "files" RENAME COLUMN "uploadedBy" TO "uploaded_by";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'files' AND column_name = 'originalName') THEN
    ALTER TABLE "files" RENAME COLUMN "originalName" TO "original_name";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'files' AND column_name = 'mimeType') THEN
    ALTER TABLE "files" RENAME COLUMN "mimeType" TO "mime_type";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'files' AND column_name = 'dropboxPath') THEN
    ALTER TABLE "files" RENAME COLUMN "dropboxPath" TO "dropbox_path";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'files' AND column_name = 'uploadedAt') THEN
    ALTER TABLE "files" RENAME COLUMN "uploadedAt" TO "uploaded_at";
  END IF;
END $$;

-- ============================================================
-- permissions
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'userId') THEN
    ALTER TABLE "permissions" RENAME COLUMN "userId" TO "user_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'projectId') THEN
    ALTER TABLE "permissions" RENAME COLUMN "projectId" TO "project_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'grantedAt') THEN
    ALTER TABLE "permissions" RENAME COLUMN "grantedAt" TO "granted_at";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'permissions' AND column_name = 'grantedBy') THEN
    ALTER TABLE "permissions" RENAME COLUMN "grantedBy" TO "granted_by";
  END IF;
END $$;

-- ============================================================
-- audit_logs
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'userId') THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "userId" TO "user_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'resourceType') THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "resourceType" TO "resource_type";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'resourceId') THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "resourceId" TO "resource_id";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'resourceName') THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "resourceName" TO "resource_name";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'oldValue') THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "oldValue" TO "old_value";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'newValue') THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "newValue" TO "new_value";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'ipAddress') THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "ipAddress" TO "ip_address";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'userAgent') THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "userAgent" TO "user_agent";
  END IF;
END $$;
