-- BECA Assessment Platform - Final Setup
-- Handles missing user_role column and creates all tables

-- ============================================================
-- 0. Fix profiles table (add user_role if missing)
-- ============================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'user';

-- ============================================================
-- 1. assessment_modules
-- ============================================================
DROP TABLE IF EXISTS assessment_modules CASCADE;

CREATE TABLE assessment_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_modules_assessment ON assessment_modules(assessment_id);
ALTER TABLE assessment_modules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. assessment_questions
-- ============================================================
DROP TABLE IF EXISTS assessment_questions CASCADE;

CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES assessment_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  points INTEGER DEFAULT 10,
  options JSONB,
  allowed_file_types TEXT[],
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_questions_module ON assessment_questions(module_id);
CREATE INDEX idx_questions_type ON assessment_questions(question_type);
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. assessment_results
-- ============================================================
DROP TABLE IF EXISTS assessment_results CASCADE;

CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  submitted_at TIMESTAMP,
  total_score NUMERIC(5,2),
  percentage NUMERIC(5,2),
  passed BOOLEAN,
  graded_at TIMESTAMP,
  graded_by UUID,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_results_assessment ON assessment_results(assessment_id);
CREATE INDEX idx_results_user ON assessment_results(user_id);
CREATE INDEX idx_results_submitted ON assessment_results(submitted_at);
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. attempt_answers
-- ============================================================
DROP TABLE IF EXISTS attempt_answers CASCADE;

CREATE TABLE attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES assessment_results(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id),
  answer_text TEXT,
  answer_file_path VARCHAR(500),
  points_earned NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_answers_result ON attempt_answers(result_id);
CREATE INDEX idx_answers_question ON attempt_answers(question_id);
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. assessment_assignments
-- ============================================================
DROP TABLE IF EXISTS assessment_assignments CASCADE;

CREATE TABLE assessment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  include_datasets BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'assigned',
  assigned_at TIMESTAMP DEFAULT now(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_assignments_assessment ON assessment_assignments(assessment_id);
CREATE INDEX idx_assignments_trainee ON assessment_assignments(trainee_id);
CREATE INDEX idx_assignments_status ON assessment_assignments(status);
ALTER TABLE assessment_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. assessment_question_files
-- ============================================================
DROP TABLE IF EXISTS assessment_question_files CASCADE;

CREATE TABLE assessment_question_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_files_question ON assessment_question_files(question_id);
ALTER TABLE assessment_question_files ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. Fix assessments table
-- ============================================================
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

-- ============================================================
-- 8. RLS POLICIES - Assessment Results
-- ============================================================
DROP POLICY IF EXISTS "Users can view own results" ON assessment_results;
DROP POLICY IF EXISTS "Admins can insert results" ON assessment_results;
DROP POLICY IF EXISTS "Admins can update results" ON assessment_results;

CREATE POLICY "Users can view own results" ON assessment_results
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'superadmin', 'trainer')
    )
  );

CREATE POLICY "Admins can insert results" ON assessment_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'superadmin', 'trainer')
    )
  );

CREATE POLICY "Admins can update results" ON assessment_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'superadmin', 'trainer')
    )
  );

-- ============================================================
-- 9. RLS POLICIES - Attempt Answers
-- ============================================================
DROP POLICY IF EXISTS "Users can view own answers" ON attempt_answers;
DROP POLICY IF EXISTS "Users can insert own answers" ON attempt_answers;

CREATE POLICY "Users can view own answers" ON attempt_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessment_results ar 
      WHERE ar.id = attempt_answers.result_id 
      AND (
        ar.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND user_role IN ('admin', 'superadmin', 'trainer')
        )
      )
    )
  );

CREATE POLICY "Users can insert own answers" ON attempt_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessment_results ar 
      WHERE ar.id = attempt_answers.result_id 
      AND ar.user_id = auth.uid()
    )
  );

-- ============================================================
-- 10. RLS POLICIES - Assessments
-- ============================================================
DROP POLICY IF EXISTS "Assessments are viewable by authenticated users" ON assessments;
DROP POLICY IF EXISTS "Admins can manage assessments" ON assessments;

CREATE POLICY "Assessments are viewable by authenticated users" ON assessments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage assessments" ON assessments
  FOR ALL USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'superadmin', 'trainer')
    )
  );

-- ============================================================
-- 11. RLS POLICIES - Assignments
-- ============================================================
DROP POLICY IF EXISTS "Trainees can view assigned assessments" ON assessment_assignments;
DROP POLICY IF EXISTS "Admins can create assignments" ON assessment_assignments;

CREATE POLICY "Trainees can view assigned assessments" ON assessment_assignments
  FOR SELECT USING (
    auth.uid() = trainee_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'superadmin', 'trainer')
    )
  );

CREATE POLICY "Admins can create assignments" ON assessment_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'superadmin', 'trainer')
    )
  );

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'Setup complete!' as status;

SELECT 'Assessment tables:' as result;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'assessment%'
ORDER BY table_name;

SELECT 'Profiles table columns:' as result;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
