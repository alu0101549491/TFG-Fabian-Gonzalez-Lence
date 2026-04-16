/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since April 15, 2026
 * @file 20260415000004_create_rls_policies.sql
 * @desc Row Level Security policies for CARTO project
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is administrator
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'ADMINISTRATOR'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user has access to project (client, creator, or special user)
CREATE OR REPLACE FUNCTION has_project_access(project_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_uuid
    AND (
      p.client_id = auth.uid() OR
      p.creator_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM project_special_users psu
        WHERE psu.project_id = p.id
        AND psu.user_id = auth.uid()
      )
    )
  ) OR is_admin();
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- USERS TABLE RLS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "users_select_admin"
  ON users FOR SELECT
  USING (is_admin());

-- Admins can insert users
CREATE POLICY "users_insert_admin"
  ON users FOR INSERT
  WITH CHECK (is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- Admins can update any user
CREATE POLICY "users_update_admin"
  ON users FOR UPDATE
  USING (is_admin());

-- Admins can delete users
CREATE POLICY "users_delete_admin"
  ON users FOR DELETE
  USING (is_admin());

-- ============================================
-- PROJECTS TABLE RLS
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can view projects they have access to
CREATE POLICY "projects_select"
  ON projects FOR SELECT
  USING (has_project_access(id));

-- Admins and creators can insert projects
CREATE POLICY "projects_insert"
  ON projects FOR INSERT
  WITH CHECK (is_admin() OR creator_id = auth.uid());

-- Admins and project creators can update projects
CREATE POLICY "projects_update"
  ON projects FOR UPDATE
  USING (is_admin() OR creator_id = auth.uid());

-- Only admins can delete projects
CREATE POLICY "projects_delete"
  ON projects FOR DELETE
  USING (is_admin());

-- ============================================
-- PROJECT SPECIAL USERS TABLE RLS
-- ============================================

ALTER TABLE project_special_users ENABLE ROW LEVEL SECURITY;

-- Users can view special user assignments for projects they have access to
CREATE POLICY "psu_select"
  ON project_special_users FOR SELECT
  USING (has_project_access(project_id));

-- Admins and project creators can add special users
CREATE POLICY "psu_insert"
  ON project_special_users FOR INSERT
  WITH CHECK (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND creator_id = auth.uid()
    )
  );

-- Admins and project creators can remove special users
CREATE POLICY "psu_delete"
  ON project_special_users FOR DELETE
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND creator_id = auth.uid()
    )
  );

-- ============================================
-- TASKS TABLE RLS
-- ============================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can view tasks in projects they have access to
CREATE POLICY "tasks_select"
  ON tasks FOR SELECT
  USING (has_project_access(project_id));

-- Users can create tasks in projects they have access to
CREATE POLICY "tasks_insert"
  ON tasks FOR INSERT
  WITH CHECK (has_project_access(project_id) AND creator_id = auth.uid());

-- Task creators, assignees, and admins can update tasks
CREATE POLICY "tasks_update"
  ON tasks FOR UPDATE
  USING (
    is_admin() OR
    creator_id = auth.uid() OR
    assignee_id = auth.uid()
  );

-- Only admins and task creators can delete tasks
CREATE POLICY "tasks_delete"
  ON tasks FOR DELETE
  USING (is_admin() OR creator_id = auth.uid());

-- ============================================
-- FILES TABLE RLS
-- ============================================

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users can view files in projects they have access to
CREATE POLICY "files_select"
  ON files FOR SELECT
  USING (has_project_access(project_id));

-- Users can upload files to projects they have access to
CREATE POLICY "files_insert"
  ON files FOR INSERT
  WITH CHECK (has_project_access(project_id) AND uploaded_by = auth.uid());

-- Only admins and file uploaders can delete files
CREATE POLICY "files_delete"
  ON files FOR DELETE
  USING (is_admin() OR uploaded_by = auth.uid());

-- ============================================
-- TASK FILES TABLE RLS
-- ============================================

ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;

-- Users can view task files if they have access to the task's project
CREATE POLICY "task_files_select"
  ON task_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND has_project_access(tasks.project_id)
    )
  );

-- Users can add files to tasks in projects they have access to
CREATE POLICY "task_files_insert"
  ON task_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND has_project_access(tasks.project_id)
    )
  );

-- Users can remove files from tasks they created or are assigned to
CREATE POLICY "task_files_delete"
  ON task_files FOR DELETE
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND (tasks.creator_id = auth.uid() OR tasks.assignee_id = auth.uid())
    )
  );

-- ============================================
-- TASK HISTORY TABLE RLS
-- ============================================

ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- Users can view task history if they have access to the task's project
CREATE POLICY "task_history_select"
  ON task_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND has_project_access(tasks.project_id)
    )
  );

-- Task history is automatically created (no INSERT policy needed for users)
CREATE POLICY "task_history_insert_system"
  ON task_history FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- MESSAGES TABLE RLS
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in projects they have access to
CREATE POLICY "messages_select"
  ON messages FOR SELECT
  USING (has_project_access(project_id));

-- Users can send messages to projects they have access to
CREATE POLICY "messages_insert"
  ON messages FOR INSERT
  WITH CHECK (has_project_access(project_id) AND sender_id = auth.uid());

-- Users can update their own messages (for read receipts)
CREATE POLICY "messages_update"
  ON messages FOR UPDATE
  USING (has_project_access(project_id));

-- Only admins and message senders can delete messages
CREATE POLICY "messages_delete"
  ON messages FOR DELETE
  USING (is_admin() OR sender_id = auth.uid());

-- ============================================
-- NOTIFICATIONS TABLE RLS
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "notifications_select"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- System can create notifications (no user INSERT policy)
CREATE POLICY "notifications_insert_system"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- Users can update their own notifications (marking as read)
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- PERMISSIONS TABLE RLS
-- ============================================

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own permissions
CREATE POLICY "permissions_select_own"
  ON permissions FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all permissions
CREATE POLICY "permissions_select_admin"
  ON permissions FOR SELECT
  USING (is_admin());

-- Only admins can manage permissions
CREATE POLICY "permissions_insert_admin"
  ON permissions FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "permissions_update_admin"
  ON permissions FOR UPDATE
  USING (is_admin());

CREATE POLICY "permissions_delete_admin"
  ON permissions FOR DELETE
  USING (is_admin());

-- ============================================
-- AUDIT LOGS TABLE RLS
-- ============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_select_admin"
  ON audit_logs FOR SELECT
  USING (is_admin());

-- System can create audit logs (no user INSERT policy)
CREATE POLICY "audit_logs_insert_system"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- Audit logs are immutable (no UPDATE or DELETE);
