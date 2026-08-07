-- ============================================================================
-- Migration: Add Sequential Question Number
-- Purpose: Add auto-incrementing question_number for user-friendly IDs
-- ============================================================================

-- First, create a sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS assessment_questions_question_number_seq;

-- Add question_number column with the sequence
ALTER TABLE assessment_questions
ADD COLUMN question_number INTEGER UNIQUE NOT NULL DEFAULT nextval('assessment_questions_question_number_seq');

-- Update the sequence to start after existing data
SELECT setval('assessment_questions_question_number_seq', (SELECT MAX(question_number) FROM assessment_questions), false);

-- Verify the changes
-- SELECT id, question_number, question_text FROM assessment_questions ORDER BY question_number LIMIT 10;
