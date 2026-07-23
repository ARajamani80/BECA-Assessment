-- BECA Assessment Platform - Email Logs Table Migration
-- Created: 2026-07-23
-- Purpose: Track all email send attempts, delivery status, and errors

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id BIGSERIAL PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  assessment_id UUID,
  taker_id UUID,
  status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'opened', 'clicked')),
  message_id VARCHAR(255),
  error_message TEXT,
  email_type VARCHAR(50),
  sent_at TIMESTAMP DEFAULT now(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_assessment_id ON email_logs(assessment_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_taker_id ON email_logs(taker_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_message_id ON email_logs(message_id);

-- Create view for email statistics
CREATE OR REPLACE VIEW email_stats AS
SELECT
  DATE(sent_at) AS send_date,
  status,
  COUNT(*) AS count,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) AS opened_count,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) AS clicked_count
FROM email_logs
GROUP BY DATE(sent_at), status;

-- Create view for recent email activity
CREATE OR REPLACE VIEW recent_email_activity AS
SELECT
  id,
  to_email,
  to_name,
  subject,
  status,
  email_type,
  sent_at,
  opened_at,
  clicked_at,
  error_message,
  CASE
    WHEN status = 'sent' AND opened_at IS NOT NULL THEN 'opened'
    WHEN status = 'sent' AND clicked_at IS NOT NULL THEN 'clicked'
    WHEN status = 'sent' THEN 'delivered'
    ELSE status
  END AS effective_status
FROM email_logs
ORDER BY sent_at DESC;

-- Add RLS (Row Level Security) policy to email_logs for admin access only
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view email logs"
  ON email_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert email logs"
  ON email_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to update email logs"
  ON email_logs
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Comment on table
COMMENT ON TABLE email_logs IS 'Log of all email send attempts, delivery status, and tracking events';
COMMENT ON COLUMN email_logs.status IS 'Email status: sent, failed, bounced, opened, clicked';
COMMENT ON COLUMN email_logs.message_id IS 'SendGrid message ID for tracking';
COMMENT ON COLUMN email_logs.error_message IS 'Error message if email send failed';
COMMENT ON COLUMN email_logs.email_type IS 'Type of email: assessment_invitation, welcome, reminder, etc.';
COMMENT ON COLUMN email_logs.opened_at IS 'Timestamp when email was opened (if tracking enabled)';
COMMENT ON COLUMN email_logs.clicked_at IS 'Timestamp when link was clicked (if tracking enabled)';
