-- MINIMAL FIX: Just handle the broken table

-- Drop the broken attempt_answers table
DROP TABLE IF EXISTS attempt_answers CASCADE;

-- Recreate it with correct schema
CREATE TABLE attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES assessment_results(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id),
  answer_text TEXT,
  answer_file_path VARCHAR(500),
  points_earned NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_answers_result ON attempt_answers(result_id);
CREATE INDEX idx_answers_question ON attempt_answers(question_id);

ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for attempt_answers
DROP POLICY IF EXISTS "Users can view own answers" ON attempt_answers;
DROP POLICY IF EXISTS "Users can insert own answers" ON attempt_answers;

CREATE POLICY "Users can view own answers" ON attempt_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessment_results ar 
      WHERE ar.id = attempt_answers.result_id 
      AND (ar.user_id = auth.uid() OR
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('admin', 'superadmin', 'trainer')))
    )
  );

CREATE POLICY "Users can insert own answers" ON attempt_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessment_results ar 
      WHERE ar.id = attempt_answers.result_id 
      AND ar.user_id = auth.uid()
    )
  );

-- Verify
SELECT 'attempt_answers table recreated successfully!' as status;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'attempt_answers' 
ORDER BY ordinal_position;
