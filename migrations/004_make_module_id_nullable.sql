-- ============================================================================
-- Migration: Make module_id nullable
-- Purpose: Allow questions to be created without a module
-- Questions can be added to modules later
-- ============================================================================

-- Make module_id nullable so questions don't require a module at creation
ALTER TABLE assessment_questions
ALTER COLUMN module_id DROP NOT NULL;

-- Verify the change
-- SELECT column_name, is_nullable, data_type FROM information_schema.columns
-- WHERE table_name = 'assessment_questions' AND column_name = 'module_id';
