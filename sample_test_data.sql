-- ============================================================================
-- Sample Test Data for Assessment Taker Interface
-- ============================================================================
-- Insert sample assessments, questions, and takers for testing
-- Run this after the main database schema has been created

-- Note: Replace assessment_id and module_id UUIDs with actual values from your database

-- Insert Sample Assessments (if not already exists)
INSERT INTO assessments (name, description, instructions, duration_minutes, status)
VALUES (
  'AutoCAD Fundamentals Assessment',
  'Test your knowledge of AutoCAD basics',
  'Please answer all questions to the best of your ability. You have 30 minutes to complete this assessment. Read each question carefully before answering.',
  30,
  'published'
) ON CONFLICT DO NOTHING;

-- Insert Sample Modules
INSERT INTO assessment_modules (assessment_id, name, description, "order")
VALUES (
  (SELECT id FROM assessments WHERE name = 'AutoCAD Fundamentals Assessment'),
  'Basic Commands',
  'Module covering AutoCAD basic commands',
  1
) ON CONFLICT DO NOTHING;

-- Get the module ID for later use
-- You may need to manually update these UUIDs based on your actual database records

-- Sample MCQ Question
INSERT INTO assessment_questions (
  module_id,
  title,
  question_text,
  question_type,
  points,
  category,
  difficulty,
  options,
  correct_answer,
  explanation
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'AutoCAD File Dialog Command',
  'Which command opens the file dialog in AutoCAD?',
  'mcq',
  5,
  'AutoCAD',
  'Medium',
  '[
    {"text": "OPEN", "correct": true},
    {"text": "NEW", "correct": false},
    {"text": "SAVE", "correct": false},
    {"text": "EXIT", "correct": false}
  ]'::jsonb,
  'OPEN',
  'The OPEN command is the standard AutoCAD command for opening files.'
);

-- Sample True/False Question
INSERT INTO assessment_questions (
  module_id,
  title,
  question_text,
  question_type,
  points,
  category,
  difficulty,
  correct_answer,
  explanation
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'Revit Parametric Design',
  'Revit is a parametric modeling tool.',
  'true_false',
  3,
  'Revit',
  'Easy',
  'true',
  'Revit is built on parametric and associative design principles.'
);

-- Sample Pick List Question
INSERT INTO assessment_questions (
  module_id,
  title,
  question_text,
  question_type,
  points,
  category,
  difficulty,
  list_options,
  correct_answer,
  explanation
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'Structural Element Identification',
  'Which element type is primarily used for structural support?',
  'pick_list',
  4,
  'Revit',
  'Medium',
  '["Wall", "Column", "Door", "Window", "Beam"]'::jsonb,
  'Column',
  'Columns are primary structural elements designed to support vertical loads.'
);

-- Sample Short Answer Question
INSERT INTO assessment_questions (
  module_id,
  title,
  question_text,
  question_type,
  points,
  category,
  difficulty,
  expected_answer,
  keywords,
  explanation
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'AutoCAD Zoom Shortcut',
  'What is the keyboard shortcut for the ZOOM command in AutoCAD?',
  'shortanswer',
  2,
  'AutoCAD',
  'Easy',
  'Z',
  '["Z", "zoom"]'::jsonb,
  'The keyboard shortcut Z activates the ZOOM command in AutoCAD.'
);

-- Sample Ordered List Question
INSERT INTO assessment_questions (
  module_id,
  title,
  question_text,
  question_type,
  points,
  category,
  difficulty,
  list_items,
  correct_order,
  explanation
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'CAD Workflow Steps',
  'Order these steps in the correct sequence for creating a technical drawing:',
  'ordered_list',
  6,
  'AutoCAD',
  'Medium',
  '["Draw geometry", "Apply constraints", "Add dimensions", "Export to PDF"]'::jsonb,
  '[0, 1, 2, 3]',
  'Follow the standard workflow: geometry first, then constraints, dimensions, and export.'
);

-- Sample Essay Question
INSERT INTO assessment_questions (
  module_id,
  title,
  question_text,
  question_type,
  points,
  category,
  difficulty,
  min_words,
  max_words,
  explanation
)
VALUES (
  (SELECT id FROM assessment_modules WHERE name = 'Basic Commands' LIMIT 1),
  'CAD Design Analysis',
  'Analyze the design process in CAD and explain the importance of proper workflows and standards.',
  'essay',
  15,
  'General',
  'Hard',
  100,
  500,
  'A comprehensive answer should address design methodology, workflow importance, and industry standards.'
);

-- Insert Sample Assessment Takers (for testing with tokens)
INSERT INTO assessment_takers (
  assessment_id,
  email,
  full_name,
  department,
  token,
  status
)
VALUES (
  (SELECT id FROM assessments WHERE name = 'AutoCAD Fundamentals Assessment' LIMIT 1),
  'trainee1@example.com',
  'John Smith',
  'Engineering',
  'TEST_TOKEN_001_' || substr(md5(random()::text), 1, 20),
  'pending'
),
(
  (SELECT id FROM assessments WHERE name = 'AutoCAD Fundamentals Assessment' LIMIT 1),
  'trainee2@example.com',
  'Jane Doe',
  'Design',
  'TEST_TOKEN_002_' || substr(md5(random()::text), 1, 20),
  'pending'
),
(
  (SELECT id FROM assessments WHERE name = 'AutoCAD Fundamentals Assessment' LIMIT 1),
  'trainee3@example.com',
  'Bob Johnson',
  'Construction',
  'TEST_TOKEN_003_' || substr(md5(random()::text), 1, 20),
  'pending'
);

-- Insert Sample Submissions (in_progress status for testing)
INSERT INTO assessment_submissions (
  assessment_id,
  taker_id,
  token,
  answers,
  status,
  time_taken_seconds
)
SELECT
  a.id,
  at.id,
  at.token,
  '{
    "q_mcq": {"selected": "A"},
    "q_tf": {"selected": "true"},
    "q_pl": {"selected": "Column"}
  }'::jsonb,
  'in_progress',
  300
FROM assessments a
JOIN assessment_takers at ON a.id = at.assessment_id
WHERE a.name = 'AutoCAD Fundamentals Assessment'
AND at.email = 'trainee1@example.com'
LIMIT 1;

-- Display the test tokens for manual testing
SELECT 
  id,
  full_name,
  email,
  token,
  status,
  'Click to test: https://localhost:3000/?token=' || token AS test_url
FROM assessment_takers
WHERE email LIKE 'trainee%@example.com'
ORDER BY created_at DESC;

-- Verify data was inserted
SELECT 
  'Assessments' as entity,
  COUNT(*) as count
FROM assessments
UNION ALL
SELECT 'Modules', COUNT(*) FROM assessment_modules
UNION ALL
SELECT 'Questions', COUNT(*) FROM assessment_questions
UNION ALL
SELECT 'Takers', COUNT(*) FROM assessment_takers
UNION ALL
SELECT 'Submissions', COUNT(*) FROM assessment_submissions;

