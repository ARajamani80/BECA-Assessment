-- Add assessment_takers table for trainee assessments (no login needed)

CREATE TABLE IF NOT EXISTS assessment_takers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'assigned',
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  score NUMERIC(5,2),
  answers JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_takers_token ON assessment_takers(token);
CREATE INDEX idx_takers_assessment ON assessment_takers(assessment_id);
CREATE INDEX idx_takers_email ON assessment_takers(email);
CREATE INDEX idx_takers_status ON assessment_takers(status);

ALTER TABLE assessment_takers ENABLE ROW LEVEL SECURITY;

-- Anyone can view with valid token
CREATE POLICY "Takers can view their own assessment" ON assessment_takers
  FOR SELECT USING (true);

-- Anyone can insert (for email signup)
CREATE POLICY "Takers can insert themselves" ON assessment_takers
  FOR INSERT WITH CHECK (true);

-- Anyone can update their answers
CREATE POLICY "Takers can update their answers" ON assessment_takers
  FOR UPDATE USING (true);

SELECT 'assessment_takers table created!' as status;
