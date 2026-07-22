-- ============================================================================
-- BECA Assessment Platform - Database Setup Script
-- ============================================================================
-- Run this script in Supabase SQL Editor to create all required tables
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ASSESSMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 60 COMMENT 'Duration in minutes',
  passing_score INTEGER DEFAULT 60 COMMENT 'Passing score as percentage',
  status TEXT DEFAULT 'draft' COMMENT 'draft, published, archived',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_assessments_created_by ON assessments(created_by);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);

-- ============================================================================
-- 2. ASSESSMENT MODULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sequence INTEGER DEFAULT 0 COMMENT 'Order within assessment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_assessment_modules_assessment_id ON assessment_modules(assessment_id);
CREATE INDEX idx_assessment_modules_sequence ON assessment_modules(assessment_id, sequence);

-- ============================================================================
-- 3. ASSESSMENT QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES assessment_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL COMMENT 'mcq, essay, truefalse, fileupload',
  points INTEGER DEFAULT 10,
  options JSONB COMMENT 'For MCQ: [{"text": "Option 1", "correct": true}, ...]',
  allowed_file_types TEXT[] COMMENT 'For fileupload: ["pdf", "dwg", "rvt", "jpg", "png", "doc"]',
  sequence INTEGER DEFAULT 0 COMMENT 'Order within module',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_assessment_questions_module_id ON assessment_questions(module_id);
CREATE INDEX idx_assessment_questions_type ON assessment_questions(question_type);

-- ============================================================================
-- 4. ASSESSMENT RESULTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score NUMERIC COMMENT 'Total score as percentage',
  passed BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_assessment_results_assessment ON assessment_results(assessment_id);
CREATE INDEX idx_assessment_results_user ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_submitted ON assessment_results(submitted_at DESC);
CREATE UNIQUE INDEX idx_assessment_results_unique ON assessment_results(assessment_id, user_id);

-- ============================================================================
-- 5. ASSESSMENT ASSIGNMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'assigned' COMMENT 'assigned, in_progress, submitted, overdue',
  include_datasets BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  score NUMERIC COMMENT 'Submitted score',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_assessment_assignments_assessment ON assessment_assignments(assessment_id);
CREATE INDEX idx_assessment_assignments_trainee ON assessment_assignments(trainee_id);
CREATE INDEX idx_assessment_assignments_status ON assessment_assignments(status);
CREATE INDEX idx_assessment_assignments_due_date ON assessment_assignments(due_date);
CREATE UNIQUE INDEX idx_assessment_assignments_unique ON assessment_assignments(assessment_id, trainee_id);

-- ============================================================================
-- 6. QUESTION FILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_question_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL COMMENT 'URL to file in Supabase Storage',
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL COMMENT 'pdf, dwg, rvt, jpg, png, doc, etc.',
  file_size INTEGER COMMENT 'File size in bytes',
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_question_files_question ON assessment_question_files(question_id);
CREATE INDEX idx_question_files_uploaded_by ON assessment_question_files(uploaded_by);

-- ============================================================================
-- 7. ASSESSMENT SUBMISSIONS (ANSWERS) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  answer_text TEXT COMMENT 'For MCQ, Essay, TrueFalse answers',
  file_url TEXT COMMENT 'For file upload answers',
  file_name TEXT,
  points_earned NUMERIC,
  is_correct BOOLEAN,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_submissions_assessment_user ON assessment_submissions(assessment_id, user_id);
CREATE INDEX idx_submissions_question ON assessment_submissions(question_id);

-- ============================================================================
-- 8. PROFILES TABLE (Update existing if needed)
-- ============================================================================
-- Make sure this table exists and has required fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  user_role TEXT DEFAULT 'user' COMMENT 'user, trainer, admin, superadmin',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_role ON profiles(user_role);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_question_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Assessments: Users can view published assessments and their own
CREATE POLICY "Users can view published assessments"
  ON assessments FOR SELECT
  USING (status = 'published' OR auth.uid() = created_by);

CREATE POLICY "Users can update own assessments"
  ON assessments FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own assessments"
  ON assessments FOR DELETE
  USING (auth.uid() = created_by);

-- Assessment Modules: Can view if assessment is accessible
CREATE POLICY "Can view modules of accessible assessments"
  ON assessment_modules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = assessment_modules.assessment_id
    AND (assessments.status = 'published' OR auth.uid() = assessments.created_by)
  ));

-- Assessment Questions: Similar to modules
CREATE POLICY "Can view questions of accessible assessments"
  ON assessment_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM assessment_modules
    JOIN assessments ON assessments.id = assessment_modules.assessment_id
    WHERE assessment_modules.id = assessment_questions.module_id
    AND (assessments.status = 'published' OR auth.uid() = assessments.created_by)
  ));

-- Assessment Results: Users can view their own
CREATE POLICY "Users can view own results"
  ON assessment_results FOR SELECT
  USING (auth.uid() = user_id);

-- Assessment Assignments: Users can view their own
CREATE POLICY "Users can view own assignments"
  ON assessment_assignments FOR SELECT
  USING (auth.uid() = trainee_id);

-- ============================================================================
-- 10. SUPABASE STORAGE BUCKET
-- ============================================================================
-- Note: Storage buckets must be created via Supabase UI Dashboard
-- Create a bucket named "assessment-files" with the following settings:
-- - Public: No (set RLS policy to check ownership)
-- - Allowed file types: .pdf, .dwg, .rvt, .jpg, .jpeg, .png, .doc, .docx, .xlsx, .txt

-- ============================================================================
-- 11. VIEWS (Optional - for easier queries)
-- ============================================================================

-- View: Assessment Summary with counts
CREATE OR REPLACE VIEW assessment_summary AS
SELECT
  a.id,
  a.title,
  a.description,
  a.duration,
  a.passing_score,
  a.status,
  a.created_by,
  COUNT(DISTINCT am.id) as module_count,
  COUNT(DISTINCT aq.id) as question_count,
  COUNT(DISTINCT ar.id) as submission_count,
  AVG(CASE WHEN ar.passed THEN 100.0 ELSE 0.0 END) as pass_rate,
  a.created_at,
  a.updated_at
FROM assessments a
LEFT JOIN assessment_modules am ON am.assessment_id = a.id
LEFT JOIN assessment_questions aq ON aq.module_id = am.id
LEFT JOIN assessment_results ar ON ar.assessment_id = a.id
GROUP BY a.id;

-- View: User Assessment Status
CREATE OR REPLACE VIEW user_assessment_status AS
SELECT
  aa.assessment_id,
  aa.trainee_id,
  a.title,
  aa.status as assignment_status,
  ar.total_score,
  ar.passed,
  aa.assigned_at,
  ar.submitted_at,
  aa.due_date
FROM assessment_assignments aa
JOIN assessments a ON a.id = aa.assessment_id
LEFT JOIN assessment_results ar ON ar.assessment_id = aa.assessment_id AND ar.user_id = aa.trainee_id;

-- ============================================================================
-- 12. SAMPLE DATA (For Testing)
-- ============================================================================

-- Uncomment to insert sample data for testing:

/*
-- Sample Assessment
INSERT INTO assessments (title, description, duration, passing_score, status)
VALUES (
  'JavaScript Fundamentals',
  'Test your knowledge of JavaScript basics',
  60,
  70,
  'published'
) RETURNING id;

-- Save the returned ID and use it in the next query

-- Sample Module (Replace {assessment_id} with actual ID)
INSERT INTO assessment_modules (assessment_id, name, description, sequence)
VALUES (
  '{assessment_id}',
  'Variables and Data Types',
  'Learn about JS variables and primitive types',
  1
) RETURNING id;

-- Save the returned ID for the next query

-- Sample Question (Replace {module_id} with actual ID)
INSERT INTO assessment_questions (module_id, question_text, question_type, points, options)
VALUES (
  '{module_id}',
  'Which of the following is NOT a primitive type in JavaScript?',
  'mcq',
  10,
  '[
    {"text": "String", "correct": false},
    {"text": "Number", "correct": false},
    {"text": "Object", "correct": true},
    {"text": "Boolean", "correct": false}
  ]'::jsonb
);
*/

-- ============================================================================
-- DONE
-- ============================================================================
-- All tables created successfully!
-- You can now use the BECA Assessment Platform
