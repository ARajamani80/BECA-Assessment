# BECA Assessment App - Quick Reference

## URL Patterns

| URL | Mode | Auth Required | Purpose |
|-----|------|---------------|---------|
| `https://app.com/index.html` | Admin | Yes | Dashboard & admin functions |
| `https://app.com/index.html?take=TOKEN` | Taker | No | Take assessment with token |

## Key Global Variables

```javascript
// Authentication & Mode
let currentUser = null;           // Current logged-in user
let assessmentTakerMode = false;  // True if in taker mode
let takerToken = null;            // Token from URL (?take=)

// Assessment Taker Data
let takerAssignmentId = null;     // Database ID of assignment
let takerAssessmentData = null;   // Assessment details
let takerAnswers = {};            // Collected answers {questionId: answer}
let remainingSeconds = 0;         // Timer countdown
let timerInterval = null;         // Timer interval ID
```

## Key Functions

### Utility Functions
| Function | Purpose | Returns | Example |
|----------|---------|---------|---------|
| `generateToken(32)` | Generate random token | String (32 chars) | `"XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5"` |
| `getUrlParameter('take')` | Get URL parameter | String or null | `"XjK9mN2pQr..."` |
| `formatTime(seconds)` | Format seconds as MM:SS | String | `"45:30"` |

### Core Taker Functions
| Function | Purpose | When Called |
|----------|---------|------------|
| `renderAssessmentTaker()` | Main taker initialization | App startup if token found |
| `validateTakerToken(token)` | Check token validity | Inside renderAssessmentTaker |
| `renderTakerInterface(assessment, questions)` | Render question UI | After validation |
| `startTakerTimer()` | Start countdown timer | If duration set |
| `submitTakerAssessment(e)` | Collect and save answers | Form submit |
| `showCompletionMessage()` | Show success screen | After submission |
| `showTakerError(message)` | Show error screen | If validation fails |

### Admin Functions
| Function | Purpose | Triggered |
|----------|---------|-----------|
| `handleSendToTrainees(e)` | Send assessment to trainees | "Send" button in modal |
| `renderAssessments()` | List assessments | Navigation click |
| `renderDashboard()` | Show analytics | Login/navigation |

## Database Tables

### assessment_takers
```sql
CREATE TABLE assessment_takers (
  id UUID PRIMARY KEY,
  assessment_id UUID,          -- Foreign key to assessments
  trainee_id UUID,             -- Foreign key to profiles
  assigned_by UUID,            -- Foreign key to profiles
  token VARCHAR(32) UNIQUE,    -- 32-char unique token
  status VARCHAR(20),          -- 'assigned', 'started', 'submitted'
  answers JSONB,               -- {questionId: answer, ...}
  submitted_at TIMESTAMP,      -- When submitted
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Answer Format
```javascript
// answers column is JSONB storing:
{
  "question-uuid-1": "0",                    // MCQ: option index
  "question-uuid-2": "sustainable design...", // Essay: text
  "question-uuid-3": "true",                 // True/False
  "question-uuid-4": "document.pdf"         // File upload: filename
}
```

## Startup Flow

```
App Loads
  ↓
[Line 2345] setTimeout(() => {
  ↓
getUrlParameter('take') → get token
  ↓
IF token exists:
  → Call renderAssessmentTaker() → Taker Mode
ELSE:
  → Check localStorage token
  → IF admin token exists:
    → renderAssessmentTaker()... NO! That's wrong
  → Show login page → Admin Mode
```

**Actual Flow:**
```javascript
// Line 2345 (simplified)
takerToken = getUrlParameter('take');

if (takerToken) {
  // TAKER MODE - no login
  await renderAssessmentTaker();
} else {
  // ADMIN MODE - requires login
  if (localStorage.getItem('token')) {
    // Continue with app
  } else {
    showLoginPage();
  }
}
```

## API Calls

### Getting Assessment Data (Taker)
```javascript
// Validate token
GET /assessment_takers?token=eq.TOKEN
← { id, assessment_id, status, answers, ... }

// Get assessment details
GET /assessments?id=eq.ASSESSMENT_ID
← { id, title, description, duration, passing_score }

// Get modules
GET /assessment_modules?assessment_id=eq.ASSESSMENT_ID
← [{ id, name, description }, ...]

// Get questions
GET /assessment_questions?module_id=eq.MODULE_ID
← [{ id, question_text, question_type, options }, ...]
```

### Submitting Answers (Taker)
```javascript
// Update assignment with answers
PATCH /assessment_takers?id=eq.ID
{
  status: "submitted",
  answers: { /* collected */ },
  submitted_at: "2026-07-22T10:45:30Z"
}
← 200 OK
```

### Sending Assessment (Admin)
```javascript
// For each trainee:
POST /assessment_takers
{
  assessment_id: "uuid",
  trainee_id: "uuid",
  assigned_by: "uuid",
  token: generateToken(32),
  status: "assigned",
  answers: {}
}
← { id, ... }
```

## State Transitions

### Assessment Taker Status
```
┌─────────┐
│Assigned │  ← Initial when sent
└────┬────┘
     │ (User opens assessment)
     ↓
┌─────────┐
│ Started │  ← Updated when page loads
└────┬────┘
     │ (User clicks Submit)
     ↓
┌────────────┐
│ Submitted  │  ← Final, cannot change
└────────────┘
```

## CSS Classes for Customization

### Taker Interface
- `.taker-layout` - Main container
- `.taker-header` - Header with title/timer
- `.taker-content` - Main content area
- `.taker-card` - Card container
- `.taker-timer` - Timer display (`.warning`, `.critical`)
- `.question-card` - Individual question
- `.question-number` - Question counter
- `.question-text` - Question text
- `.option-input` - MCQ/TF option
- `.taker-textarea` - Essay textarea
- `.taker-submit-btn` - Submit button
- `.completion-card` - Completion screen

### Color Variables
```css
--primary: #2563eb       /* Blue - normal */
--warning: #f59e0b      /* Yellow - < 5 min */
--danger: #ef4444       /* Red - < 1 min */
--success: #10b981      /* Green - completion */
```

## Timer Behavior

```javascript
// Initialization (if duration set)
remainingSeconds = duration * 60;
startTakerTimer();

// Every second
remainingSeconds--;

// Display updates
if (remainingSeconds <= 60) {
  // Critical - red, pulsing
  timerEl.classList.add('critical');
} else if (remainingSeconds <= 300) {
  // Warning - yellow
  timerEl.classList.add('warning');
}

// Auto-submit
if (remainingSeconds <= 0) {
  clearInterval(timerInterval);
  // Auto-submit form
  form.dispatchEvent(new Event('submit'));
}
```

## Error Handling

### Token Validation Error
```javascript
if (!assignment) {
  showTakerError('Invalid or expired assessment token');
  return;
}
```

### Assessment Not Found
```javascript
if (!assessmentData) {
  showTakerError('Assessment not found');
  return;
}
```

### Submission Failed
```javascript
} catch (error) {
  showTakerError('Failed to submit assessment: ' + error.message);
}
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Token validation fails | Token not in DB | Check `assessment_takers` table |
| Questions not showing | Missing modules/questions | Verify `assessment_modules` and `assessment_questions` |
| Timer not appearing | Duration = 0 | Set duration > 0 in assessment |
| Answers not saving | RLS policy blocking | Check Supabase RLS policies |
| Page redirects to login | No token + not authenticated | Check URL for `?take=TOKEN` |
| "Invalid or expired token" | Token doesn't exist in DB | Regenerate and resend link |

## Testing Commands (Browser Console)

```javascript
// Test token generation
generateToken(32)

// Test URL parameter reading
getUrlParameter('take')

// Test timer formatting
formatTime(300)  // "05:00"

// Manually trigger submission
document.getElementById('takerForm').dispatchEvent(new Event('submit'))

// Check current answers
console.log(takerAnswers)

// Check remaining time
console.log(formatTime(remainingSeconds))

// View assignment data
console.log(takerAssessmentData)
```

## Database Queries (Supabase SQL)

```sql
-- Find assignment by token
SELECT * FROM assessment_takers WHERE token = 'YOUR_TOKEN';

-- View all submissions for an assessment
SELECT 
  at.id, 
  (SELECT email FROM profiles WHERE id = at.trainee_id) as email,
  at.status,
  at.submitted_at,
  at.answers
FROM assessment_takers at
WHERE at.assessment_id = 'ASSESSMENT_UUID'
ORDER BY at.created_at DESC;

-- Count status distribution
SELECT status, COUNT(*) FROM assessment_takers GROUP BY status;

-- Find unsubmitted assessments
SELECT * FROM assessment_takers 
WHERE status != 'submitted' 
AND created_at < NOW() - INTERVAL '7 days';
```

## Performance Tips

1. **Lazy load questions** - Load modules one at a time
2. **Debounce auto-save** - Don't save every keystroke
3. **Cache assessment data** - Store in memory, not re-fetch
4. **Optimize images** - In file upload questions
5. **Minimize timer updates** - Update display only if changed

## Security Notes

- Tokens are validated server-side (in database lookup)
- Trainees cannot see other answers (no access to DB)
- Admin panel is auth-protected (requires Supabase login)
- RLS policies prevent direct table access
- No sensitive data in local storage (only admin token)

## File Structure

```
BECA-Assessment/
├── index.html                          # Main app (1,000+ KB)
├── IMPLEMENTATION_GUIDE.md             # Detailed guide
├── USAGE_EXAMPLES.md                   # Real-world examples
├── DEPLOYMENT_CHECKLIST.md             # Pre/post deployment
├── DATABASE_SETUP.sql                  # Database schema
└── QUICK_REFERENCE.md                  # This file
```

---

**Last Updated:** 2026-07-22
**Version:** 2.0 (Two-Tier with Token-Based Access)
