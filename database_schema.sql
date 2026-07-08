-- ============================================================================
-- KnowledgeSmart-like Assessment Platform - Database Schema
-- ============================================================================

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'trainer', 'trainee')),
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEPARTMENTS TABLE
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SKILLS TABLE (Taxonomy)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QUESTIONS TABLE
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id),
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('mcq', 'essay', 'matching', 'fillin', 'practical', 'trueFalse')),
  difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_by UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MCQ OPTIONS TABLE
CREATE TABLE mcq_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_key VARCHAR(10) NOT NULL, -- A, B, C, D, etc.
  is_correct BOOLEAN DEFAULT false,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ESSAY RUBRIC TABLE (for essay/practical questions)
CREATE TABLE rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  criteria_name VARCHAR(255) NOT NULL,
  max_points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ASSESSMENTS/TESTS TABLE
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  skill_id UUID NOT NULL REFERENCES skills(id),
  created_by UUID NOT NULL REFERENCES users(id),
  total_points INTEGER NOT NULL DEFAULT 100,
  passing_score INTEGER NOT NULL DEFAULT 60,
  time_limit_minutes INTEGER,
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_options BOOLEAN DEFAULT false,
  show_results_immediately BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ASSESSMENT QUESTIONS TABLE (Junction table)
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  points_allocated INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, question_id)
);

-- MARKING CRITERIA TABLE
CREATE TABLE marking_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  criteria_name VARCHAR(255) NOT NULL, -- e.g., "Correct Answer", "Code Quality", "Clarity"
  expected_answer TEXT,
  auto_mark BOOLEAN DEFAULT false,
  max_points INTEGER NOT NULL,
  marking_type VARCHAR(50) CHECK (marking_type IN ('exact_match', 'partial_match', 'rubric', 'manual')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TEST SUBMISSIONS TABLE
CREATE TABLE test_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  total_score DECIMAL(5, 2),
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'marked', 'published')),
  time_spent_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, assessment_id, started_at)
);

-- STUDENT RESPONSES TABLE
CREATE TABLE student_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES test_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  assessment_question_id UUID NOT NULL REFERENCES assessment_questions(id),
  response_text TEXT,
  selected_option_id UUID REFERENCES mcq_options(id),
  is_marked BOOLEAN DEFAULT false,
  points_awarded DECIMAL(5, 2),
  manual_marks DECIMAL(5, 2),
  feedback TEXT,
  marked_by UUID REFERENCES users(id),
  marked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER SKILL PROFICIENCY TABLE (Analytics)
CREATE TABLE user_skill_proficiency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  skill_id UUID NOT NULL REFERENCES skills(id),
  proficiency_score DECIMAL(5, 2),
  proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  last_assessed_at TIMESTAMP,
  total_attempts INTEGER DEFAULT 0,
  highest_score DECIMAL(5, 2),
  average_score DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_id)
);

-- GROUP ANALYTICS TABLE (Department/Team level)
CREATE TABLE group_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id),
  skill_id UUID NOT NULL REFERENCES skills(id),
  average_proficiency DECIMAL(5, 2),
  proficiency_level VARCHAR(50),
  total_trainees INTEGER,
  total_assessments INTEGER,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(department_id, skill_id)
);

-- AUDIT REPORTS TABLE
CREATE TABLE audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_by UUID NOT NULL REFERENCES users(id),
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) CHECK (report_type IN ('department', 'individual', 'skill_gap', 'compliance')),
  department_id UUID REFERENCES departments(id),
  skill_id UUID REFERENCES skills(id),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  report_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QUESTION TAGS TABLE
CREATE TABLE question_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SUBSCRIPTIONS/LICENSING TABLE
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name VARCHAR(255) NOT NULL,
  plan_type VARCHAR(50) CHECK (plan_type IN ('free', 'basic', 'professional', 'enterprise')),
  max_users INTEGER,
  max_assessments INTEGER,
  max_questions INTEGER,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_questions_skill ON questions(skill_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_assessments_skill ON assessments(skill_id);
CREATE INDEX idx_assessments_creator ON assessments(created_by);
CREATE INDEX idx_assessment_questions_assessment ON assessment_questions(assessment_id);
CREATE INDEX idx_assessment_questions_question ON assessment_questions(question_id);
CREATE INDEX idx_test_submissions_user ON test_submissions(user_id);
CREATE INDEX idx_test_submissions_assessment ON test_submissions(assessment_id);
CREATE INDEX idx_test_submissions_status ON test_submissions(status);
CREATE INDEX idx_student_responses_submission ON student_responses(submission_id);
CREATE INDEX idx_student_responses_question ON student_responses(question_id);
CREATE INDEX idx_student_responses_marked ON student_responses(is_marked);
CREATE INDEX idx_user_skill_proficiency ON user_skill_proficiency(user_id, skill_id);
CREATE INDEX idx_group_analytics ON group_analytics(department_id, skill_id);
CREATE INDEX idx_audit_reports_generated ON audit_reports(generated_at);
CREATE INDEX idx_question_tags_question ON question_tags(question_id);
CREATE INDEX idx_question_tags_tag ON question_tags(tag_name);

-- ============================================================================
-- Sample Data for Testing
-- ============================================================================

-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('Engineering', 'Engineering and Technical Skills'),
('Sales', 'Sales and Customer Relations'),
('HR', 'Human Resources Department'),
('Finance', 'Finance and Accounting');

-- Insert sample skills
INSERT INTO skills (name, description, category, proficiency_level) VALUES
('JavaScript', 'JavaScript programming language', 'Programming', 'beginner'),
('Python', 'Python programming language', 'Programming', 'intermediate'),
('Project Management', 'Leading projects and teams', 'Management', 'advanced'),
('Communication', 'Effective communication skills', 'Soft Skills', 'beginner'),
('SQL Database', 'Database design and queries', 'Database', 'intermediate');

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role, department_id) VALUES
('admin@knowledgesmart.com', '$2a$12$...', 'Admin', 'User', 'admin', NULL),
('trainer@knowledgesmart.com', '$2a$12$...', 'Trainer', 'One', 'trainer', (SELECT id FROM departments LIMIT 1)),
('trainee@knowledgesmart.com', '$2a$12$...', 'Trainee', 'One', 'trainee', (SELECT id FROM departments LIMIT 1));
