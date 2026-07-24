-- ============================================================================
-- Migration: Add question_image_url column
-- Purpose: Store image URLs for questions
-- ============================================================================

-- Add image URL column to assessment_questions
ALTER TABLE assessment_questions
ADD COLUMN IF NOT EXISTS question_image_url VARCHAR(500) DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_questions_has_image ON assessment_questions(question_image_url);

-- Verify the change
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'assessment_questions' AND column_name = 'question_image_url';
