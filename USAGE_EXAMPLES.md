# BECA Assessment App - Usage Examples

## Quick Start Examples

### Example 1: Admin Creating and Sending Assessment

#### Step 1: Login to Admin Dashboard
```
URL: https://yourapp.com/index.html
Email: trainer@example.com
Password: ****
```

#### Step 2: Create Assessment
```
Navigation: Create New → Assessment Details
- Title: "Building Design Fundamentals"
- Description: "Test your knowledge of basic building design principles"
- Duration: 45 minutes
- Passing Score: 70%
Click: "Create Assessment"
```

#### Step 3: Add Modules & Questions
```
Navigation: Edit Assessment → Add Module
- Module Name: "Design Principles"
- Click: "Add Question"
  - Question: "What is the golden ratio?"
  - Type: MCQ
  - Options:
    - "1.618" (correct)
    - "3.14"
    - "2.71"
    - "1.41"

Repeat for more questions...

Click: "Publish Assessment"
```

#### Step 4: Send to Trainees
```
Navigation: Send to Trainees
- Select Assessment: "Building Design Fundamentals"
- Select Trainees: Check boxes for John, Sarah, Mike
- Include Datasets: Yes (if applicable)
Click: "Send to Selected Trainees"

System generates tokens:
- john@example.com → "XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5"
- sarah@example.com → "I6jK7lM8nO9pQ0rS1tU2vW3xY4z5A6b7"
- mike@example.com → "C8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8"

Emails sent with links:
- https://app.com/index.html?take=XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5
- https://app.com/index.html?take=I6jK7lM8nO9pQ0rS1tU2vW3xY4z5A6b7
- https://app.com/index.html?take=C8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8
```

#### Step 5: Monitor Results
```
Navigation: Results
- Status: assigned → started → submitted
- View answers collected
- Track submission timestamps
```

---

### Example 2: Trainee Taking Assessment

#### Step 1: Receive Email
```
Subject: "You've been assigned: Building Design Fundamentals"
Body: "Click here to take the assessment:"

Link: https://app.com/index.html?take=XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5
```

#### Step 2: Click Link (No Login Needed)
```
- Browser loads assessment automatically
- No login page shown
- No credentials required
```

#### Step 3: View Assessment Interface
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  Building Design Fundamentals          45:00 ⏱️     │
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ QUESTION 1 OF 5                                │ │
│ │ What is the golden ratio?                      │ │
│ │                                                  │ │
│ │ ◉ 1.618 (selected)                             │ │
│ │ ○ 3.14                                         │ │
│ │ ○ 2.71                                         │ │
│ │ ○ 1.41                                         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ QUESTION 2 OF 5                                │ │
│ │ Explain sustainable design principles          │ │
│ │                                                  │ │
│ │ ┌───────────────────────────────────────────┐  │ │
│ │ │ [Text area for essay response]            │  │ │
│ │ └───────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│                          [Submit Assessment] ✓      │
│                                                       │
└─────────────────────────────────────────────────────┘
```

#### Step 4: Answer Questions
```
- Question 1 (MCQ): Select "1.618"
- Question 2 (Essay): Type explanation
- Question 3 (True/False): Select "True"
- Question 4 (File Upload): Upload diagram.pdf
- Question 5 (MCQ): Select answer

Timer shown in header: 45:00 → ... → 01:32 (yellow) → 00:45 (red, pulsing)
```

#### Step 5: Review & Submit
```
Before Submit:
- Can scroll back and review answers
- Can change answers before submitting
- Timer counts down

Click: "Submit Assessment"
- System saves all answers as JSON
- Status updated: assigned → started → submitted
- Submitted timestamp recorded
```

#### Step 6: Confirmation Screen
```
┌──────────────────────────────────────────────────┐
│                                                    │
│  Assessment Submission                           │
│                                                    │
│                      ✓                            │
│                                                    │
│         Assessment Submitted                     │
│                                                    │
│  Your assessment has been successfully           │
│  submitted. Thank you for completing the        │
│  assessment. Your results will be reviewed      │
│  shortly.                                        │
│                                                    │
│  Submitted at: 07/22/2026 2:45:30 PM           │
│                                                    │
└──────────────────────────────────────────────────┘
```

---

## Database Record Examples

### After Admin Sends Assessment

#### assessment_takers Table

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "assessment_id": "12345678-90ab-cdef-1234-567890abcdef",
  "trainee_id": "john-uuid-1234-5678",
  "assigned_by": "trainer-uuid-9999",
  "token": "XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5",
  "status": "assigned",
  "answers": {},
  "submitted_at": null,
  "created_at": "2026-07-22T10:00:00Z",
  "updated_at": "2026-07-22T10:00:00Z"
}
```

### When Trainee Opens Assessment

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "assessment_id": "12345678-90ab-cdef-1234-567890abcdef",
  "trainee_id": "john-uuid-1234-5678",
  "assigned_by": "trainer-uuid-9999",
  "token": "XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5",
  "status": "started",  // Changed from "assigned"
  "answers": {},
  "submitted_at": null,
  "created_at": "2026-07-22T10:00:00Z",
  "updated_at": "2026-07-22T10:02:00Z"  // Updated
}
```

### When Trainee Submits Assessment

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "assessment_id": "12345678-90ab-cdef-1234-567890abcdef",
  "trainee_id": "john-uuid-1234-5678",
  "assigned_by": "trainer-uuid-9999",
  "token": "XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5",
  "status": "submitted",  // Changed from "started"
  "answers": {
    "q1-uuid": "0",  // MCQ option index
    "q2-uuid": "Sustainable design integrates environmental, economic, and social factors...",  // Essay text
    "q3-uuid": "true",  // True/False answer
    "q4-uuid": "diagram.pdf",  // File name
    "q5-uuid": "2"  // MCQ option index
  },
  "submitted_at": "2026-07-22T10:45:30Z",  // Set on submission
  "created_at": "2026-07-22T10:00:00Z",
  "updated_at": "2026-07-22T10:45:30Z"
}
```

---

## API Call Sequence

### Admin Sending Assessment

```javascript
// 1. Get assessments
GET /rest/v1/assessments
→ Returns all published assessments

// 2. Get users/trainees
GET /rest/v1/profiles
→ Returns all user profiles

// 3. Send to each trainee (in loop)
POST /rest/v1/assessment_takers
Body: {
  assessment_id: "uuid",
  trainee_id: "uuid",
  assigned_by: "current-user-id",
  token: "generated-32-char-token",
  status: "assigned",
  answers: {}
}
→ Creates record for each trainee
```

### Trainee Taking Assessment

```javascript
// 1. Validate token
GET /rest/v1/assessment_takers?token=eq.TOKEN
→ Returns assignment record if valid

// 2. Update status to started
PATCH /rest/v1/assessment_takers?id=eq.ID
Body: { status: "started" }

// 3. Load assessment
GET /rest/v1/assessments?id=eq.ASSESSMENT_ID
→ Returns assessment details (title, duration, etc)

// 4. Load modules
GET /rest/v1/assessment_modules?assessment_id=eq.ASSESSMENT_ID
→ Returns all modules for assessment

// 5. Load questions (per module)
GET /rest/v1/assessment_questions?module_id=eq.MODULE_ID
→ Returns questions for each module

// 6. Submit answers
PATCH /rest/v1/assessment_takers?id=eq.ID
Body: {
  status: "submitted",
  answers: { /* collected answers */ },
  submitted_at: "ISO-timestamp"
}
→ Saves all answers to database
```

---

## URL Examples

### Admin Dashboard
```
https://app.example.com/index.html
- No query parameter
- Shows login if not authenticated
- Shows full admin interface after login
```

### Assessment Taker Links (Examples)

```
Trainee 1:
https://app.example.com/index.html?take=XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5

Trainee 2:
https://app.example.com/index.html?take=I6jK7lM8nO9pQ0rS1tU2vW3xY4z5A6b7

Trainee 3:
https://app.example.com/index.html?take=C8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8
```

### Invalid/Expired Token
```
https://app.example.com/index.html?take=InvalidToken123
→ Shows error message: "Invalid or expired assessment token"
```

---

## Email Template Example

```
Subject: Building Design Fundamentals Assessment

Dear John,

You have been assigned the following assessment:

Assessment: Building Design Fundamentals
Duration: 45 minutes
Passing Score: 70%

To take the assessment, click the link below:

https://app.example.com/index.html?take=XjK9mN2pQrStUvWxYz0aB1cD2e3fG4h5

Important:
- No login required - click the link above to start
- You have 45 minutes to complete the assessment
- Your answers will be saved when you click "Submit"
- You cannot resume after submitting

If you have questions, contact your trainer.

Best regards,
BECA Assessment Platform
```

---

## Error Scenarios

### Scenario 1: Invalid Token
```
User clicks: https://app.com/index.html?take=WRONG123
Result: Error screen shown
Message: "Invalid or expired assessment token"
Button: "Return Home"
```

### Scenario 2: Assessment Not Found
```
Token valid, but assessment deleted
Result: Error screen shown
Message: "Assessment not found"
```

### Scenario 3: Time Expires
```
Timer reaches 00:00
Result: 
- Message toast: "Time is up! Submitting your assessment..."
- Wait 2 seconds
- Auto-submit with current answers
- Show completion screen
```

### Scenario 4: Network Error During Submit
```
Try to submit → API fails
Result: Error screen shown
Message: "Failed to submit assessment: [error details]"
User can refresh and try again
```

---

## Monitoring & Reporting

### View Assessment Status

**In Admin Dashboard → Results:**

```
Assessment: Building Design Fundamentals

| User    | Status    | Score | Submitted Date      |
|---------|-----------|-------|---------------------|
| John    | Submitted | -     | 07/22/2026 2:45 PM  |
| Sarah   | Started   | -     | 07/22/2026 2:30 PM  |
| Mike    | Assigned  | -     | -                   |
```

### Access Raw Data

**Query assessment_takers table directly:**

```sql
SELECT 
  t.id,
  p.full_name,
  p.email,
  t.status,
  t.submitted_at,
  t.answers,
  (SELECT COUNT(*) FROM assessment_questions 
   WHERE module_id IN (
     SELECT id FROM assessment_modules 
     WHERE assessment_id = t.assessment_id
   )) as total_questions
FROM assessment_takers t
JOIN profiles p ON t.trainee_id = p.id
WHERE t.assessment_id = 'assessment-uuid'
ORDER BY t.created_at DESC;
```

---

## Troubleshooting Guide

### Problem: Trainee Gets "Invalid Token" Error

**Causes:**
1. Token not created (admin didn't send properly)
2. Token was modified in email/link
3. Token manually typed incorrectly

**Solution:**
1. Verify token exists in database
2. Resend email with correct link
3. Copy/paste token, don't type manually

### Problem: Assessment Won't Load After Token Validation

**Causes:**
1. Assessment doesn't exist or was deleted
2. Assessment_id in assessment_takers doesn't match

**Solution:**
1. Check assessment still published
2. Verify assessment_id in database
3. Create new assessment if needed

### Problem: Answers Not Saving on Submit

**Causes:**
1. Network error during submission
2. Invalid assessment_takers id
3. Database permission/RLS issue

**Solution:**
1. Check network tab in DevTools
2. Verify id column in assessment_takers
3. Check Supabase RLS policies allow PATCH

### Problem: Timer Not Showing

**Causes:**
1. Duration not set in assessment
2. JavaScript error in timer code
3. Browser console errors

**Solution:**
1. Edit assessment, set duration > 0
2. Check browser console (F12)
3. Try different browser
