-- BECA Assessment Platform - Database Fix Script
-- Run this if you get "column status does not exist" error

-- ============================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================

-- Add status column to assessments if it doesn't exist
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

-- Add missing columns to assessment_results if needed
ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS percentage NUMERIC(5,2);

ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS passed BOOLEAN;

ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP;

ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS graded_by UUID;

-- ============================================================
-- IF ASSESSMENTS TABLE DOESN'T EXIST AT ALL, RECREATE
-- ============================================================

-- Drop and recreate assessments (USE WITH CAUTION - deletes data!)
-- Only uncomment if assessments table is completely missing

/*
DROP TABLE IF EXISTS assessments CASCADE;

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 60,
  passing_score INTEGER DEFAULT 60,
  created_by UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_assessments_created_by ON assessments(created_by);
CREATE INDEX idx_assessments_status ON assessments(status);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assessments are viewable by authenticated users" ON assessments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage assessments" ON assessments
  FOR ALL USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer'))
  );
*/

-- ============================================================
-- VERIFY TABLES
-- ============================================================

-- Check assessments table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assessments'
ORDER BY ordinal_position;

-- Check assessment_results table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assessment_results'
ORDER BY ordinal_position;

