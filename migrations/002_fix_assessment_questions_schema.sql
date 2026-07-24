-- ============================================================================
-- Migration: Fix assessment_questions schema for all question types
-- ============================================================================
-- Adds columns needed for all 7 question types

-- Add missing columns to assessment_questions table
ALTER TABLE assessment_questions
ADD COLUMN IF NOT EXISTS list_options JSONB,
ADD COLUMN IF NOT EXISTS list_items JSONB,
ADD COLUMN IF NOT EXISTS correct_answer VARCHAR(500),
ADD COLUMN IF NOT EXISTS correct_order JSONB,
ADD COLUMN IF NOT EXISTS expected_answer TEXT,
ADD COLUMN IF NOT EXISTS keywords JSONB,
ADD COLUMN IF NOT EXISTS min_words INTEGER,
ADD COLUMN IF NOT EXISTS max_words INTEGER,
ADD COLUMN IF NOT EXISTS max_file_size_mb INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50),
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Sample data migration for the test questions
-- Update Pick List question with options
UPDATE assessment_questions
SET list_options = '["Wall", "Column", "Door", "Window", "Beam"]'::jsonb
WHERE question_text = 'Which element type is primarily used for structural support?';

-- Update Ordered List question with items
UPDATE assessment_questions
SET list_items = '["Draw geometry", "Apply constraints", "Add dimensions", "Export to PDF"]'::jsonb,
    correct_order = '[0, 1, 2, 3]'::jsonb
WHERE question_text = 'Order these steps in the correct sequence for creating a technical drawing:';

-- Update Short Answer question
UPDATE assessment_questions
SET expected_answer = 'Z',
    keywords = '["Z", "zoom"]'::jsonb,
    explanation = 'The keyboard shortcut Z activates the ZOOM command in AutoCAD.'
WHERE question_text = 'What is the keyboard shortcut for the ZOOM command in AutoCAD?';

-- Update Essay question with word limits
UPDATE assessment_questions
SET min_words = 100,
    max_words = 500,
    explanation = 'A comprehensive answer should address design methodology, workflow importance, and industry standards.'
WHERE question_text = 'Analyze the design process in CAD and explain the importance of proper workflows and standards.';

-- Create index for faster question lookups
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON assessment_questions(created_at DESC);
