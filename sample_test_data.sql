-- ============================================================================
-- Sample Test Data for Assessment Taker Interface
-- ============================================================================
-- This SQL creates sample assessments and test data
-- Adjust the UUID values and user IDs as needed for your database

-- First, get the current user ID (replace with your actual admin user ID)
-- Run this query first to get a user ID: SELECT id, email FROM profiles LIMIT 1;

-- Insert Sample Assessment
INSERT INTO assessments (title, description, duration, passing_score, status, created_by)
VALUES (
  'AutoCAD Fundamentals Assessment',
  'Test your knowledge of AutoCAD basics',
  30,
  60,
  'published',
  (SELECT id FROM profiles WHERE user_role IN ('admin', 'superadmin') LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Insert Sample Module
INSERT INTO assessment_modules (assessment_id, name, description, order_index)
VALUES (
  (SELECT id FROM assessments WHERE title = 'AutoCAD Fundamentals Assessment' LIMIT 1),
  'Basic Commands',
  'Module covering AutoCAD basic commands',
  1
)
ON CONFLICT DO NOTHING;

-- Insert Sample MCQ Question
INSERT INTO assessment_questions (
  module_id,
  question_text,
  question_type,
  points,
  options
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'Which command opens the file dialog in AutoCAD?',
  'mcq',
  5,
  '[
    {"text": "OPEN", "correct": true},
    {"text": "NEW", "correct": false},
    {"text": "SAVE", "correct": false},
    {"text": "EXIT", "correct": false}
  ]'::jsonb
);

-- Insert Sample True/False Question
INSERT INTO assessment_questions (
  module_id,
  question_text,
  question_type,
  points
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'Revit is a parametric modeling tool.',
  'true_false',
  3
);

-- Insert Sample Pick List Question
INSERT INTO assessment_questions (
  module_id,
  question_text,
  question_type,
  points,
  options
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'Which element type is primarily used for structural support?',
  'pick_list',
  4,
  '["Wall", "Column", "Door", "Window", "Beam"]'::jsonb
);

-- Insert Sample Short Answer Question
INSERT INTO assessment_questions (
  module_id,
  question_text,
  question_type,
  points
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'What is the keyboard shortcut for the ZOOM command in AutoCAD?',
  'shortanswer',
  2
);

-- Insert Sample Ordered List Question
INSERT INTO assessment_questions (
  module_id,
  question_text,
  question_type,
  points
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'Order these steps in the correct sequence for creating a technical drawing:',
  'ordered_list',
  6
);

-- Insert Sample Essay Question
INSERT INTO assessment_questions (
  module_id,
  question_text,
  question_type,
  points
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'Analyze the design process in CAD and explain the importance of proper workflows and standards.',
  'essay',
  15
);

-- Insert Sample Assessment Takers with Tokens
INSERT INTO assessment_takers (
  assessment_id,
  email,
  full_name,
  department,
  token,
  status
)
VALUES (
  (SELECT id FROM assessments WHERE title = 'AutoCAD Fundamentals Assessment' LIMIT 1),
  'trainee1@example.com',
  'John Smith',
  'Engineering',
  'TEST_TOKEN_001_' || substr(md5(random()::text), 1, 20),
  'pending'
),
(
  (SELECT id FROM assessments WHERE title = 'AutoCAD Fundamentals Assessment' LIMIT 1),
  'trainee2@example.com',
  'Jane Doe',
  'Design',
  'TEST_TOKEN_002_' || substr(md5(random()::text), 1, 20),
  'pending'
),
(
  (SELECT id FROM assessments WHERE title = 'AutoCAD Fundamentals Assessment' LIMIT 1),
  'trainee3@example.com',
  'Bob Johnson',
  'Construction',
  'TEST_TOKEN_003_' || substr(md5(random()::text), 1, 20),
  'pending'
)
ON CONFLICT DO NOTHING;

-- View the test tokens that were created
SELECT
  id,
  full_name,
  email,
  token,
  status
FROM assessment_takers
WHERE email LIKE 'trainee%@example.com'
ORDER BY created_at DESC;

-- Show summary of inserted data
SELECT
  'Assessments' as entity,
  COUNT(*) as count
FROM assessments
WHERE title = 'AutoCAD Fundamentals Assessment'
UNION ALL
SELECT 'Modules', COUNT(*) FROM assessment_modules WHERE assessment_id = (SELECT id FROM assessments WHERE title = 'AutoCAD Fundamentals Assessment' LIMIT 1)
UNION ALL
SELECT 'Questions', COUNT(*) FROM assessment_questions WHERE module_id IN (SELECT id FROM assessment_modules WHERE assessment_id = (SELECT id FROM assessments WHERE title = 'AutoCAD Fundamentals Assessment' LIMIT 1))
UNION ALL
SELECT 'Takers', COUNT(*) FROM assessment_takers WHERE assessment_id = (SELECT id FROM assessments WHERE title = 'AutoCAD Fundamentals Assessment' LIMIT 1);
