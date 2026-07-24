-- ============================================================================
-- Migration: Make assessment_id nullable
-- Purpose: Allow questions to be created standalone (not tied to an assessment)
-- Questions can be added to assessments later
-- ============================================================================

-- Make assessment_id nullable so questions are standalone
ALTER TABLE assessment_questions
ALTER COLUMN assessment_id DROP NOT NULL;

-- Verify the change
-- SELECT column_name, is_nullable, data_type FROM information_schema.columns
-- WHERE table_name = 'assessment_questions' AND column_name = 'assessment_id';
