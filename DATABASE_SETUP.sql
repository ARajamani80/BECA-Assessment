-- BECA Assessment App - Database Setup Script
-- Execute this in Supabase SQL Editor to create required tables

-- ============================================================================
-- TABLE: assessment_takers
-- Purpose: Track trainee assessments with token-based access
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_takers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  token VARCHAR(32) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'submitted')),
  answers JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assessment_takers_token
  ON assessment_takers(token);

CREATE INDEX IF NOT EXISTS idx_assessment_takers_assignment ON assessment_takers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_takers_trainee ON assessment_takers(trainee_id);
CREATE INDEX IF NOT EXISTS idx_assessment_takers_status ON assessment_takers(status);

COMMENT ON TABLE assessment_takers IS 'Tracks assessment assignments with token-based access';
COMMENT ON COLUMN assessment_takers.token IS 'Unique 32-char token for URL-based access without login';
COMMENT ON COLUMN assessment_takers.status IS 'Status: assigned -> started -> submitted';
COMMENT ON COLUMN assessment_takers.answers IS 'JSON object storing answers by question_id';

-- ============================================================================
-- UPDATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_assessment_takers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assessment_takers_updated_at ON assessment_takers;
CREATE TRIGGER trigger_assessment_takers_updated_at
BEFORE UPDATE ON assessment_takers
FOR EACH ROW
EXECUTE FUNCTION update_assessment_takers_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE assessment_takers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessment_takers_read_all" ON assessment_takers
  FOR SELECT USING (true);

CREATE POLICY "assessment_takers_insert_auth" ON assessment_takers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "assessment_takers_update_auth" ON assessment_takers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_assessment_summary(assessment_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  duration INT,
  passing_score INT,
  module_count BIGINT,
  question_count BIGINT,
  submission_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.description,
    a.duration,
    a.passing_score,
    (SELECT COUNT(*) FROM assessment_modules WHERE assessment_modules.assessment_id = a.id),
    (SELECT COUNT(*) FROM assessment_questions aq
     JOIN assessment_modules am ON aq.module_id = am.id
     WHERE am.assessment_id = a.id),
    (SELECT COUNT(*) FROM assessment_takers WHERE assessment_takers.assessment_id = a.id)
  FROM assessments a
  WHERE a.id = assessment_id;
END;
$$ LANGUAGE plpgsql;
