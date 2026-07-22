# BECA Assessment App - Two-Tier Implementation Guide

## Overview

The enhanced BECA Assessment app now supports two distinct user flows:
1. **Admin/Trainer Interface** - Full app with login, assessment creation, and analytics
2. **Assessment Taker Interface** - Simple, token-based interface for trainees

## Architecture

### URL-Based Routing

The app automatically detects the URL parameter `?take=TOKEN` at startup:

- **With `?take=TOKEN`** → Assessment Taker Mode (no login required)
- **Without parameter** → Admin Mode (requires Supabase login)

### User Flows

#### Flow 1: Admin/Trainer
```
Login → Dashboard → Create Assessment → Publish → Send to Trainees (generates token) → View Results
```

#### Flow 2: Assessment Taker
```
Click Email Link (with token) → No login needed → Take Assessment → Submit → Confirmation
```

## Key Features

### For Admins/Trainers

1. **Assessment Creation**
   - Create assessments with title, description, duration, passing score
   - Add modules and questions
   - Support multiple question types: MCQ, Essay, True/False, File Upload

2. **Sending to Trainees**
   - Select published assessment
   - Select trainees from user list
   - System generates unique 32-character tokens
   - Creates entries in `assessment_takers` table

3. **Results & Analytics**
   - View submission status (assigned → started → submitted)
   - Track answers and completion times
   - View pass/fail rates and analytics

### For Assessment Takers

1. **Token-Based Access**
   - No login required
   - Direct link: `https://yourapp.com/index.html?take=TOKEN`
   - Token validates against database

2. **Assessment Experience**
   - Clean, minimal UI (no sidebar, no admin features)
   - Shows assessment name and description
   - Question counter (e.g., "Question 1 of 10")
   - Support for multiple question types
   - Optional countdown timer (if duration set)

3. **Answer Types Supported**
   - Multiple Choice (MCQ)
   - Essay/Text
   - True/False
   - File Upload

4. **Status Tracking**
   - **Assigned**: Initial status when sent
   - **Started**: When taker opens the assessment
   - **Submitted**: After taker completes and submits

## Database Schema

### Required Table: `assessment_takers`

```sql
CREATE TABLE assessment_takers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  trainee_id UUID NOT NULL REFERENCES profiles(id),
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  token VARCHAR(32) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'assigned', -- assigned, started, submitted
  answers JSONB DEFAULT '{}',
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_assessment_takers_token ON assessment_takers(token);
CREATE INDEX idx_assessment_takers_status ON assessment_takers(status);
```

### Updated Table: `assessment_modules` & `assessment_questions`

Ensure these tables exist with proper foreign keys:

```sql
CREATE TABLE assessment_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES assessment_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50), -- mcq, essay, truefalse, fileupload
  points INT DEFAULT 10,
  options JSONB, -- For MCQ: [{text, correct}]
  allowed_file_types JSONB, -- For file upload
  created_at TIMESTAMP DEFAULT now()
);
```

## Implementation Details

### 1. Token Generation

```javascript
function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
```

**When sending to trainees**, a unique 32-character token is generated for each trainee:

```javascript
const token = generateToken(32);
await apiCall('POST', 'assessment_takers', {
  assessment_id: assessmentId,
  trainee_id: traineeId,
  assigned_by: currentUser.id,
  token: token,
  status: 'assigned',
  answers: {}
});
```

### 2. URL Parameter Detection

```javascript
function getUrlParameter(param) {
  const url = new URL(window.location.href);
  return url.searchParams.get(param);
}

// At startup (line ~2345)
takerToken = getUrlParameter('take');

if (takerToken) {
  // Assessment Taker Mode
  await renderAssessmentTaker();
} else {
  // Admin Mode - requires login
}
```

### 3. Token Validation

```javascript
async function validateTakerToken(token) {
  try {
    const result = await apiCall('GET', `assessment_takers?token=eq.${token}`);
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
}
```

### 4. Assessment Taker Interface

**Key Components:**
- Header with assessment title and timer
- Question cards showing progress (Question 1 of N)
- Question-specific input fields (radio, textarea, file upload)
- Submit button
- No sidebar, header, or admin navigation

**Timer Functionality:**
```javascript
function startTakerTimer() {
  timerInterval = setInterval(() => {
    remainingSeconds--;
    // Update display and colors
    if (remainingSeconds <= 60) {
      // Critical - show red
    } else if (remainingSeconds <= 300) {
      // Warning - show yellow
    }
    // Auto-submit at 0
  }, 1000);
}
```

### 5. Answer Submission

```javascript
async function submitTakerAssessment(e) {
  e.preventDefault();
  
  // Collect answers from form
  const formData = new FormData(document.getElementById('takerForm'));
  const answers = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('question_')) {
      const questionId = key.replace('question_', '');
      answers[questionId] = value;
    }
  }

  // Update status and store answers
  await apiCall('PATCH', 'assessment_takers', {
    status: 'submitted',
    answers: answers,
    submitted_at: new Date().toISOString()
  }, `?id=eq.${takerAssignmentId}`);

  // Show completion message
  showCompletionMessage();
}
```

## Usage

### For Admins

1. Log in with Supabase credentials
2. Navigate to "Send to Trainees" → select assessment → select trainees
3. System generates tokens and sends (or provides download for manual email)
4. Each trainee gets a unique URL: `https://yourapp.com/index.html?take=TOKEN`

### For Trainees

1. Click the email link with the token
2. Assessment loads automatically without login
3. Answer questions (system shows progress)
4. Click "Submit Assessment"
5. See confirmation message

## Styling

New CSS classes added:
- `.taker-layout` - Main container for taker interface
- `.taker-header` - Header with title and timer
- `.taker-content` - Main content area
- `.taker-card` - Card container
- `.question-card` - Individual question card
- `.taker-timer` - Timer display with warning/critical states
- `.option-input` - Answer option (radio/checkbox)
- `.taker-textarea` - Text input for essay questions
- `.taker-submit-btn` - Submit button
- `.completion-card` - Success message after submission

**Color States:**
- Normal: Blue (#2563eb)
- Warning (< 5 min): Yellow (#f59e0b)
- Critical (< 1 min): Red (#ef4444) with pulse animation

## Security Considerations

1. **Token Validation**: Tokens are validated against the database before allowing access
2. **One-Time Use**: Each token should be unique and database-tracked
3. **Status Tracking**: Prevents re-submission by checking status
4. **No Authentication Required**: Trainees don't need credentials, only the token
5. **CORS/API Keys**: Supabase API key is exposed (client-side); consider Row Level Security (RLS) policies

### Recommended Security Enhancements

Add Supabase Row Level Security (RLS) policies:

```sql
-- assessment_takers: Anyone can read if they have the token
CREATE POLICY "assessment_takers_read_by_token" ON assessment_takers
  FOR SELECT USING (
    token = current_setting('request.headers'::text->>'x-assessment-token', true)::text
    OR auth.role() = 'authenticated'
  );

-- Prevent updating others' assignments
CREATE POLICY "assessment_takers_update_own" ON assessment_takers
  FOR UPDATE USING (
    token = current_setting('request.headers'::text->>'x-assessment-token', true)::text
    OR auth.role() = 'authenticated'
  );
```

## Troubleshooting

**Issue: Token not recognized**
- Verify token exists in `assessment_takers` table
- Check token spelling (case-sensitive)
- Ensure assessment_id references valid assessment

**Issue: Questions not loading**
- Verify `assessment_modules` table has entries
- Verify `assessment_questions` table has entries
- Check console for API errors

**Issue: Timer not appearing**
- Ensure assessment has `duration` set (in minutes)
- Check browser console for JavaScript errors

**Issue: Answer submission fails**
- Verify `assessment_takers` table exists with all columns
- Check Supabase RLS policies allow PATCH operations
- Review network tab for API error details

## Future Enhancements

1. **Auto-save**: Save answers periodically instead of only on submit
2. **Offline Support**: Store answers in localStorage, sync when online
3. **Answer Review**: Show completed answers before final submission
4. **Partial Submission**: Save progress and allow resuming later
5. **Scoring**: Implement auto-grading for MCQ and True/False
6. **Notifications**: Email trainers when assessment is submitted
7. **Analytics**: Track question response times and patterns
8. **Mobile Optimization**: Improve mobile responsive design for taker interface

## Files Modified

- **index.html**: Main application file
  - Added CSS for taker interface (~150 lines)
  - Added JavaScript functions for taker mode (~600 lines)
  - Updated initialization logic for URL parameter detection
  - Updated `handleSendToTrainees()` to generate tokens

## API Endpoints Used

**For Takers (No Auth Required):**
- `GET /rest/v1/assessment_takers?token=eq.TOKEN`
- `GET /rest/v1/assessments?id=eq.ID`
- `GET /rest/v1/assessment_modules?assessment_id=eq.ID`
- `GET /rest/v1/assessment_questions?module_id=eq.ID`
- `PATCH /rest/v1/assessment_takers?id=eq.ID`

**For Admins (Auth Required):**
- All existing admin endpoints
- `POST /rest/v1/assessment_takers` (when sending to trainees)

## Support & Questions

For issues or questions:
1. Check console for JavaScript errors (F12)
2. Review network tab for API errors
3. Verify Supabase tables exist with correct schema
4. Check RLS policies aren't blocking operations
