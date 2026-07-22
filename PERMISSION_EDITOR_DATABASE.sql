-- ============================================================
-- TABLE: role_permissions
-- ============================================================
-- Manages granular permissions for each role in the system
-- This allows superadmins to customize role permissions without code changes
-- ============================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  permission_description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(role_name, permission_name)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_role_permissions_role ON role_permissions(role_name);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_name);
CREATE INDEX idx_role_permissions_enabled ON role_permissions(role_name, is_enabled);

-- ============================================================
-- TABLE: permission_audit_log
-- ============================================================
-- Tracks all permission changes for audit trail
-- ============================================================

CREATE TABLE IF NOT EXISTS permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL,
  role_name VARCHAR(50) NOT NULL,
  permission_name VARCHAR(100),
  changed_by UUID NOT NULL,
  changed_by_email VARCHAR(255),
  previous_value JSONB,
  new_value JSONB,
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT now()
);

-- ============================================================
-- INDEXES FOR AUDIT LOG
-- ============================================================
CREATE INDEX idx_audit_log_role ON permission_audit_log(role_name);
CREATE INDEX idx_audit_log_changed_by ON permission_audit_log(changed_by);
CREATE INDEX idx_audit_log_changed_at ON permission_audit_log(changed_at);
CREATE INDEX idx_audit_log_action ON permission_audit_log(action_type);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - SUPERADMIN ONLY ACCESS
-- ============================================================

-- Role Permissions: Superadmin can view and modify
CREATE POLICY "Superadmins can manage role permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'superadmin')
  );

-- Audit Log: Superadmin can view audit log
CREATE POLICY "Superadmins can view permission audit log" ON permission_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'superadmin')
  );

-- Audit Log: System can insert audit records
CREATE POLICY "System can log permission changes" ON permission_audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- INSERT DEFAULT PERMISSIONS
-- ============================================================
-- This sets up the default permission matrix for all roles

INSERT INTO role_permissions (role_name, permission_name, is_enabled, permission_description) VALUES
-- SUPERADMIN PERMISSIONS (all enabled)
('superadmin', 'create_assessment', true, 'Create new assessments'),
('superadmin', 'edit_assessment', true, 'Edit existing assessments'),
('superadmin', 'delete_assessment', true, 'Delete assessments'),
('superadmin', 'publish_assessment', true, 'Publish assessments for use'),
('superadmin', 'view_results', true, 'View assessment results'),
('superadmin', 'manage_users', true, 'Manage user accounts'),
('superadmin', 'send_to_trainees', true, 'Send assessments to trainees'),
('superadmin', 'view_analytics', true, 'View analytics and reports'),
('superadmin', 'manage_roles', true, 'Manage roles and permissions'),
('superadmin', 'access_admin_dashboard', true, 'Access admin dashboard'),

-- ADMIN PERMISSIONS
('admin', 'create_assessment', true, 'Create new assessments'),
('admin', 'edit_assessment', true, 'Edit existing assessments'),
('admin', 'delete_assessment', false, 'Delete assessments'),
('admin', 'publish_assessment', true, 'Publish assessments for use'),
('admin', 'view_results', true, 'View assessment results'),
('admin', 'manage_users', true, 'Manage user accounts'),
('admin', 'send_to_trainees', true, 'Send assessments to trainees'),
('admin', 'view_analytics', true, 'View analytics and reports'),
('admin', 'manage_roles', false, 'Manage roles and permissions'),
('admin', 'access_admin_dashboard', true, 'Access admin dashboard'),

-- TRAINER PERMISSIONS
('trainer', 'create_assessment', true, 'Create new assessments'),
('trainer', 'edit_assessment', false, 'Edit existing assessments'),
('trainer', 'delete_assessment', false, 'Delete assessments'),
('trainer', 'publish_assessment', false, 'Publish assessments for use'),
('trainer', 'view_results', true, 'View assessment results'),
('trainer', 'manage_users', false, 'Manage user accounts'),
('trainer', 'send_to_trainees', true, 'Send assessments to trainees'),
('trainer', 'view_analytics', true, 'View analytics and reports'),
('trainer', 'manage_roles', false, 'Manage roles and permissions'),
('trainer', 'access_admin_dashboard', false, 'Access admin dashboard'),

-- VIEWER PERMISSIONS
('viewer', 'create_assessment', false, 'Create new assessments'),
('viewer', 'edit_assessment', false, 'Edit existing assessments'),
('viewer', 'delete_assessment', false, 'Delete assessments'),
('viewer', 'publish_assessment', false, 'Publish assessments for use'),
('viewer', 'view_results', true, 'View assessment results'),
('viewer', 'manage_users', false, 'Manage user accounts'),
('viewer', 'send_to_trainees', false, 'Send assessments to trainees'),
('viewer', 'view_analytics', true, 'View analytics and reports'),
('viewer', 'manage_roles', false, 'Manage roles and permissions'),
('viewer', 'access_admin_dashboard', false, 'Access admin dashboard'),

-- USER PERMISSIONS (minimal)
('user', 'create_assessment', false, 'Create new assessments'),
('user', 'edit_assessment', false, 'Edit existing assessments'),
('user', 'delete_assessment', false, 'Delete assessments'),
('user', 'publish_assessment', false, 'Publish assessments for use'),
('user', 'view_results', false, 'View assessment results'),
('user', 'manage_users', false, 'Manage user accounts'),
('user', 'send_to_trainees', false, 'Send assessments to trainees'),
('user', 'view_analytics', false, 'View analytics and reports'),
('user', 'manage_roles', false, 'Manage roles and permissions'),
('user', 'access_admin_dashboard', false, 'Access admin dashboard')
ON CONFLICT (role_name, permission_name) DO NOTHING;

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Execute this SQL in Supabase SQL Editor
-- 2. Ensure 'profiles' table exists with 'user_role' column
-- 3. RLS policies ensure only superadmins can view/modify permissions
-- 4. Audit log tracks all permission changes for compliance
-- 5. Default permissions can be reset using the reset function
