-- Fix assessments table - add all missing columns

-- Add missing columns to assessments
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60;

ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 60;

ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();

ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Verify columns
SELECT 'Assessments table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assessments'
ORDER BY ordinal_position;
