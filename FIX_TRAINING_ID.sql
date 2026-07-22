-- Fix: Make training_id column nullable (allow NULL values)

-- Drop the NOT NULL constraint on training_id
ALTER TABLE assessments 
ALTER COLUMN training_id DROP NOT NULL;

-- Set default to NULL
ALTER TABLE assessments 
ALTER COLUMN training_id SET DEFAULT NULL;

-- Verify the fix
SELECT 'Assessments table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'assessments'
ORDER BY ordinal_position;
