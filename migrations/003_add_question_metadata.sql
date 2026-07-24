-- ============================================================================
-- Migration: Add Question Metadata Columns
-- Purpose: Support enhanced question import with rich metadata
-- Date: 2026-07-24
-- ============================================================================

-- Add new columns to assessment_questions table
ALTER TABLE assessment_questions
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS question_name VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS question_summary TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS coaching_notes TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS coaching_files TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS learning_resources TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS learning_files TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dataset_files TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS training_tags TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS author VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS skill_level VARCHAR(50) DEFAULT NULL;

-- Add index for faster filtering by category and difficulty
CREATE INDEX IF NOT EXISTS idx_questions_category ON assessment_questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON assessment_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON assessment_questions USING gin(to_tsvector('english', tags));

-- ============================================================================
-- VERIFICATION QUERIES (run these to confirm):
-- ============================================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'assessment_questions'
-- ORDER BY ordinal_position;

-- SELECT COUNT(*) FROM assessment_questions;
