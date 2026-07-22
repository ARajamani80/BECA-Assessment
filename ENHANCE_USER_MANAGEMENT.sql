-- Enhanced User Management - Add fields for password management and user status

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Create audit log table for user actions
CREATE TABLE IF NOT EXISTS user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_user ON user_audit_log(target_user_id);
CREATE INDEX idx_audit_admin ON user_audit_log(admin_id);
CREATE INDEX idx_audit_action ON user_audit_log(action);

-- Update Ashok to superadmin (verify it worked)
UPDATE profiles 
SET user_role = 'superadmin', is_active = true
WHERE email = 'ashok@djbh-global.com';

-- Verify
SELECT 'User Management fields added!' as status;
SELECT id, email, user_role, is_active, full_name FROM profiles WHERE email = 'ashok@djbh-global.com';
