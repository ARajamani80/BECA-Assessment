-- ============================================================================
-- Assessment Submissions Table
-- ============================================================================
-- Stores assessment submission data with answers and scoring information
-- Created: 2026-07-23

CREATE TABLE IF NOT EXISTS assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  taker_id UUID NOT NULL REFERENCES assessment_takers(id) ON DELETE CASCADE,
  
  -- Access Control
  token VARCHAR(255) NOT NULL UNIQUE,
  
  -- Answers and Submission
  answers JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_taken_seconds INTEGER,
  
  -- Scoring
  score DECIMAL(10, 2),
  pass_fail VARCHAR(10), -- 'pass' or 'fail'
  graded_at TIMESTAMP WITH TIME ZONE,
  grader_id UUID REFERENCES profiles(id),
  grading_notes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, submitted, graded
  
  -- Metadata
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_token ON assessment_submissions(token);
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_taker ON assessment_submissions(taker_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON assessment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON assessment_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON assessment_submissions(created_at DESC);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_assessment_taker ON assessment_submissions(assessment_id, taker_id);

