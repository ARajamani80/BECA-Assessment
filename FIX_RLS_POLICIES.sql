-- Fix RLS Policies - Allow admins and superadmins to manage all data

-- ============================================================
-- 1. Fix assessment_modules RLS
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to view modules" ON assessment_modules;
DROP POLICY IF EXISTS "Allow creators to edit modules" ON assessment_modules;

CREATE POLICY "Admins can view all modules" ON assessment_modules
  FOR SELECT USING (
    auth.role() = 'authenticated' OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );

CREATE POLICY "Admins can manage modules" ON assessment_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );

-- ============================================================
-- 2. Fix assessment_questions RLS
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to view questions" ON assessment_questions;
DROP POLICY IF EXISTS "Allow creators to edit questions" ON assessment_questions;

CREATE POLICY "Admins can view all questions" ON assessment_questions
  FOR SELECT USING (
    auth.role() = 'authenticated' OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );

CREATE POLICY "Admins can manage questions" ON assessment_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );

-- ============================================================
-- 3. Fix profiles RLS (for user management)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can edit profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Admins can edit all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin'))
  );

-- ============================================================
-- 4. Fix assessments RLS
-- ============================================================
DROP POLICY IF EXISTS "Assessments are viewable by authenticated users" ON assessments;
DROP POLICY IF EXISTS "Admins can manage assessments" ON assessments;

CREATE POLICY "Authenticated users can view assessments" ON assessments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all assessments" ON assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'RLS Policies fixed!' as status;
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'assessment%';
