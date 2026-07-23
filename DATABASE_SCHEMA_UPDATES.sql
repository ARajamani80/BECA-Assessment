-- ============================================================================
-- BECA Assessment Platform - Database Schema Updates
-- Run these queries in Supabase SQL Editor to add new features
-- ============================================================================

-- ============================================================================
-- 1. ADD DATASET_URL COLUMN TO ASSESSMENT_QUESTIONS
-- ============================================================================

-- For storing links to uploaded datasets
ALTER TABLE assessment_questions
ADD COLUMN IF NOT EXISTS dataset_url VARCHAR;

COMMENT ON COLUMN assessment_questions.dataset_url IS 'Public URL to dataset file in Supabase storage';

-- ============================================================================
-- 2. UPDATE ASSESSMENT_TAKERS TABLE
-- ============================================================================

-- Add department column for better organization
ALTER TABLE assessment_takers
ADD COLUMN IF NOT EXISTS department VARCHAR DEFAULT NULL;

-- Ensure status column has correct constraint (ignore if already exists)
DO $$
BEGIN
  ALTER TABLE assessment_takers
  ADD CONSTRAINT check_status CHECK (status IN ('assigned', 'started', 'submitted', 'pending', 'completed'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

COMMENT ON COLUMN assessment_takers.department IS 'Department or organization unit of the taker';

-- ============================================================================
-- 3. CREATE ROLE_PERMISSIONS TABLE (Visual Permission Matrix)
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_name VARCHAR NOT NULL,
  permission_name VARCHAR NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_name, permission_name)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_name);

COMMENT ON TABLE role_permissions IS 'Role-based permission matrix for feature access control';
COMMENT ON COLUMN role_permissions.role_name IS 'Role name: superadmin, admin, trainer, viewer, user';
COMMENT ON COLUMN role_permissions.permission_name IS 'Permission name: View Assessments, Create Assessment, etc.';
COMMENT ON COLUMN role_permissions.is_enabled IS 'Whether this role has this permission';

-- ============================================================================
-- 4. CREATE UPDATE TRIGGER FOR ROLE_PERMISSIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_role_permissions_updated_at ON role_permissions;
CREATE TRIGGER trigger_role_permissions_updated_at
BEFORE UPDATE ON role_permissions
FOR EACH ROW
EXECUTE FUNCTION update_role_permissions_updated_at();

-- ============================================================================
-- 5. INITIALIZE DEFAULT PERMISSIONS
-- ============================================================================

-- Superadmin - Full access
INSERT INTO role_permissions (role_name, permission_name, is_enabled) VALUES
('superadmin', 'View Assessments', true),
('superadmin', 'Create Assessment', true),
('superadmin', 'Edit Assessment', true),
('superadmin', 'Delete Assessment', true),
('superadmin', 'Take Assessment', true),
('superadmin', 'View Questions', true),
('superadmin', 'Create Questions', true),
('superadmin', 'Edit Questions', true),
('superadmin', 'Delete Questions', true),
('superadmin', 'View Results', true),
('superadmin', 'Manage Users', true),
('superadmin', 'Manage Permissions', true),
('superadmin', 'View Reports', true),
('superadmin', 'Send Assessments', true)
ON CONFLICT DO NOTHING;

-- Admin - Most features except permission management
INSERT INTO role_permissions (role_name, permission_name, is_enabled) VALUES
('admin', 'View Assessments', true),
('admin', 'Create Assessment', true),
('admin', 'Edit Assessment', true),
('admin', 'Delete Assessment', true),
('admin', 'Take Assessment', true),
('admin', 'View Questions', true),
('admin', 'Create Questions', true),
('admin', 'Edit Questions', true),
('admin', 'Delete Questions', true),
('admin', 'View Results', true),
('admin', 'Manage Users', true),
('admin', 'Manage Permissions', false),
('admin', 'View Reports', true),
('admin', 'Send Assessments', true)
ON CONFLICT DO NOTHING;

-- Trainer - Can create and send, but not delete
INSERT INTO role_permissions (role_name, permission_name, is_enabled) VALUES
('trainer', 'View Assessments', true),
('trainer', 'Create Assessment', true),
('trainer', 'Edit Assessment', false),
('trainer', 'Delete Assessment', false),
('trainer', 'Take Assessment', true),
('trainer', 'View Questions', true),
('trainer', 'Create Questions', true),
('trainer', 'Edit Questions', false),
('trainer', 'Delete Questions', false),
('trainer', 'View Results', true),
('trainer', 'Manage Users', false),
('trainer', 'Manage Permissions', false),
('trainer', 'View Reports', true),
('trainer', 'Send Assessments', true)
ON CONFLICT DO NOTHING;

-- Viewer - Read-only access
INSERT INTO role_permissions (role_name, permission_name, is_enabled) VALUES
('viewer', 'View Assessments', true),
('viewer', 'Create Assessment', false),
('viewer', 'Edit Assessment', false),
('viewer', 'Delete Assessment', false),
('viewer', 'Take Assessment', true),
('viewer', 'View Questions', true),
('viewer', 'Create Questions', false),
('viewer', 'Edit Questions', false),
('viewer', 'Delete Questions', false),
('viewer', 'View Results', true),
('viewer', 'Manage Users', false),
('viewer', 'Manage Permissions', false),
('viewer', 'View Reports', true),
('viewer', 'Send Assessments', false)
ON CONFLICT DO NOTHING;

-- User - Only take assessments
INSERT INTO role_permissions (role_name, permission_name, is_enabled) VALUES
('user', 'View Assessments', false),
('user', 'Create Assessment', false),
('user', 'Edit Assessment', false),
('user', 'Delete Assessment', false),
('user', 'Take Assessment', true),
('user', 'View Questions', false),
('user', 'Create Questions', false),
('user', 'Edit Questions', false),
('user', 'Delete Questions', false),
('user', 'View Results', true),
('user', 'Manage Users', false),
('user', 'Manage Permissions', false),
('user', 'View Reports', false),
('user', 'Send Assessments', false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. ROW LEVEL SECURITY FOR ROLE_PERMISSIONS
-- ============================================================================

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_read_all" ON role_permissions
  FOR SELECT USING (true);

CREATE POLICY "role_permissions_insert_admin" ON role_permissions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "role_permissions_update_admin" ON role_permissions
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- 7. CREATE AUDIT LOG TABLE FOR PERMISSION CHANGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS permission_audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action VARCHAR NOT NULL,
  role_name VARCHAR,
  permission_name VARCHAR,
  old_value BOOLEAN,
  new_value BOOLEAN,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_permission_audit_actor ON permission_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_changed_at ON permission_audit_log(changed_at);

COMMENT ON TABLE permission_audit_log IS 'Audit trail of permission changes';

-- ============================================================================
-- 8. VERIFY STORAGE BUCKET EXISTS
-- ============================================================================

-- Note: Supabase doesn't support bucket creation via SQL
-- You must create the bucket manually:
-- 1. Go to Supabase Dashboard
-- 2. Storage > Create a new bucket
-- 3. Name: "assessment-files"
-- 4. Public: Yes
-- 5. File size limit: 50MB (or as needed)

-- ============================================================================
-- SUMMARY OF CHANGES
-- ============================================================================

/*
TABLES MODIFIED:
- assessment_questions: Added dataset_url column
- assessment_takers: Added department column

TABLES CREATED:
- role_permissions: Visual permission matrix
- permission_audit_log: Audit trail for permissions

STORAGE:
- Bucket: assessment-files (must be created manually)
- Path structure: questions/{question_id}/{filename}

FUNCTIONS ADDED:
- update_role_permissions_updated_at: Auto-update timestamp

TRIGGERS ADDED:
- trigger_role_permissions_updated_at: Update role_permissions

ROWS INSERTED:
- Default permissions for 5 roles (70 rows total)
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'assessment_questions' AND column_name = 'dataset_url';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'assessment_takers' AND column_name = 'department';

-- Check role_permissions table
SELECT COUNT(*) as permission_count FROM role_permissions;
SELECT DISTINCT role_name FROM role_permissions ORDER BY role_name;

-- List all permissions
SELECT DISTINCT permission_name FROM role_permissions ORDER BY permission_name;

-- Show all superadmin permissions
SELECT permission_name, is_enabled
FROM role_permissions
WHERE role_name = 'superadmin'
ORDER BY permission_name;

-- ============================================================================
-- END OF SCHEMA UPDATES
-- ============================================================================
