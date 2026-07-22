-- ============================================================
-- BECA Assessment - Question & Module Bank System
-- Database Schema for Global, Reusable Questions and Modules
-- Execute this SQL in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLE: question_bank
-- Global, reusable questions (not tied to specific assessments)
-- ============================================================
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- PL, MCQ, TRUEFALSE, FREETEXT, ORDERED_LIST
  options JSONB, -- For MCQ/PL options: {options: ["Option1", "Option2"], correctIndex: 0}
  correct_answer TEXT, -- For TRUEFALSE: true/false, For other types: answer text
  points INTEGER DEFAULT 10,
  image_url VARCHAR(500), -- Supabase storage path
  has_dataset BOOLEAN DEFAULT false,
  difficulty_level VARCHAR(50) DEFAULT 'medium', -- easy, medium, hard
  category VARCHAR(100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_question_bank_created_by ON question_bank(created_by);
CREATE INDEX idx_question_bank_type ON question_bank(question_type);
CREATE INDEX idx_question_bank_category ON question_bank(category);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty_level);
CREATE INDEX idx_question_bank_tags ON question_bank USING GIN(tags);

-- ============================================================
-- TABLE: module_bank
-- Global, reusable modules containing questions
-- ============================================================
CREATE TABLE IF NOT EXISTS module_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  question_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Array of question_bank IDs
  question_order UUID[] DEFAULT ARRAY[]::UUID[], -- Ordered list of question IDs
  total_points INTEGER GENERATED ALWAYS AS (
    COALESCE(
      (SELECT SUM(points) FROM question_bank WHERE id = ANY(question_ids)),
      0
    )
  ) STORED,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_module_bank_created_by ON module_bank(created_by);
CREATE INDEX idx_module_bank_question_ids ON module_bank USING GIN(question_ids);

-- ============================================================
-- TABLE: assessment_question_datasets
-- Link datasets (files) to questions in question_bank
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_question_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- Supabase storage path: "assessment-files/..."
  file_size INTEGER,
  file_type VARCHAR(50), -- pdf, dwg, rvt, img, doc, docx, etc
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_datasets_question ON assessment_question_datasets(question_id);
CREATE INDEX idx_datasets_uploaded_by ON assessment_question_datasets(uploaded_by);

-- ============================================================
-- TABLE: question_imports
-- Track Excel imports for audit and error handling
-- ============================================================
CREATE TABLE IF NOT EXISTS question_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID NOT NULL REFERENCES auth.users(id),
  file_name VARCHAR(255) NOT NULL,
  row_count INTEGER,
  successful_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  errors JSONB, -- Array of error objects: [{row: 2, message: "..."}]
  imported_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_imports_imported_by ON question_imports(imported_by);
CREATE INDEX idx_imports_status ON question_imports(status);

-- ============================================================
-- TABLE: assessment_module_assignments
-- Link modules from module_bank to assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_module_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES module_bank(id) ON DELETE CASCADE,
  module_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_assessment_modules_assessment ON assessment_module_assignments(assessment_id);
CREATE INDEX idx_assessment_modules_module ON assessment_module_assignments(module_id);
CREATE UNIQUE INDEX idx_assessment_module_unique ON assessment_module_assignments(assessment_id, module_id);

-- ============================================================
-- TABLE: user_question_filters
-- Store user's saved filter preferences for question bank
-- ============================================================
CREATE TABLE IF NOT EXISTS user_question_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filter_name VARCHAR(255),
  filter_type VARCHAR(50), -- Array of types
  filter_category VARCHAR(100),
  filter_difficulty VARCHAR(50),
  filter_tags TEXT[],
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_filters_user ON user_question_filters(user_id);

-- ============================================================
-- Enable Row Level Security
-- ============================================================
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_question_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_filters ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - question_bank
-- ============================================================
-- Users can view questions created by them
CREATE POLICY "Users can view own questions" ON question_bank
  FOR SELECT USING (auth.uid() = created_by);

-- Admins/Trainers can view all questions
CREATE POLICY "Admins can view all questions" ON question_bank
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );

-- Users can create questions
CREATE POLICY "Authenticated users can create questions" ON question_bank
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can edit their own questions
CREATE POLICY "Users can edit own questions" ON question_bank
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own questions
CREATE POLICY "Users can delete own questions" ON question_bank
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================================
-- RLS POLICIES - module_bank
-- ============================================================
-- Users can view modules they created
CREATE POLICY "Users can view own modules" ON module_bank
  FOR SELECT USING (auth.uid() = created_by);

-- Admins/Trainers can view all modules
CREATE POLICY "Admins can view all modules" ON module_bank
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );

-- Users can create modules
CREATE POLICY "Authenticated users can create modules" ON module_bank
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can edit their own modules
CREATE POLICY "Users can edit own modules" ON module_bank
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own modules
CREATE POLICY "Users can delete own modules" ON module_bank
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================================
-- RLS POLICIES - assessment_question_datasets
-- ============================================================
-- Users can view datasets for their questions
CREATE POLICY "Users can view own question datasets" ON assessment_question_datasets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM question_bank
      WHERE id = assessment_question_datasets.question_id
      AND created_by = auth.uid()
    )
  );

-- Admins can view all datasets
CREATE POLICY "Admins can view all datasets" ON assessment_question_datasets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );

-- Users can upload datasets for their questions
CREATE POLICY "Users can upload datasets for own questions" ON assessment_question_datasets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM question_bank
      WHERE id = assessment_question_datasets.question_id
      AND created_by = auth.uid()
    )
  );

-- Users can delete datasets for their questions
CREATE POLICY "Users can delete own datasets" ON assessment_question_datasets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM question_bank
      WHERE id = assessment_question_datasets.question_id
      AND created_by = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES - question_imports & user_question_filters
-- ============================================================
CREATE POLICY "Users can view own imports" ON question_imports
  FOR SELECT USING (auth.uid() = imported_by);

CREATE POLICY "Admins can view all imports" ON question_imports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can manage own filters" ON user_question_filters
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET CONFIGURATION
-- ============================================================
-- Note: Create these buckets in Supabase Storage dashboard:
-- 1. question-images (public) - for question images
-- 2. assessment-files (private) - for datasets (PDFs, DWGs, images, docs)
--
-- CORS Configuration for public bucket:
-- {
--   "allowedHeaders": ["*"],
--   "allowedMethods": ["GET"],
--   "allowedOrigins": ["*"],
--   "exposedHeaders": [],
--   "maxAgeSeconds": 3600
-- }
