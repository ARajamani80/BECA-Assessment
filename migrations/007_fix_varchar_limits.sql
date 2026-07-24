-- ============================================================================
-- Migration: Fix VARCHAR column limits
-- Purpose: Increase limits for columns that can have long values
-- ============================================================================

-- Increase category limit (can have long category names)
ALTER TABLE assessment_questions
ALTER COLUMN category TYPE VARCHAR(255);

-- Increase skill_level limit
ALTER TABLE assessment_questions
ALTER COLUMN skill_level TYPE VARCHAR(100);

-- Ensure question_name has enough space
ALTER TABLE assessment_questions
ALTER COLUMN question_name TYPE VARCHAR(500);

-- Ensure author has enough space
ALTER TABLE assessment_questions
ALTER COLUMN author TYPE VARCHAR(255);

-- Convert tags to TEXT for unlimited length (can have many comma-separated tags)
ALTER TABLE assessment_questions
ALTER COLUMN tags TYPE TEXT;

-- Convert training_tags to TEXT
ALTER TABLE assessment_questions
ALTER COLUMN training_tags TYPE TEXT;

-- Verify the changes
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'assessment_questions'
-- AND column_name IN ('category', 'skill_level', 'question_name', 'author', 'tags', 'training_tags')
-- ORDER BY column_name;
