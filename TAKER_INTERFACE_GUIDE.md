# Assessment Taker Interface - Complete Guide

## Overview

The Assessment Taker Interface is the core feature of the BECA Assessment Platform that allows trainees to access and complete assessments via unique tokens without requiring login credentials. This document provides comprehensive information about the system for both administrators and trainees.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Accessing Assessments](#accessing-assessments)
3. [Supported Question Types](#supported-question-types)
4. [Features](#features)
5. [Database Setup](#database-setup)
6. [API Functions](#api-functions)
7. [Integration Guide](#integration-guide)
8. [Troubleshooting](#troubleshooting)

## System Architecture

### Component Files

#### Frontend JavaScript Modules

- **js/taker.js** (500+ lines)
  - Core assessment taker logic
  - Assessment loading and state management
  - Question rendering for all 7 types
  - Answer saving and auto-save functionality
  - Submission workflow

- **js/timer.js** (150+ lines)
  - Countdown timer with visual warnings
  - 5-minute warning (yellow)
  - 1-minute warning (red)
  - Auto-submit on time expiration
  - Time remaining calculations

- **js/local-storage.js** (100+ lines)
  - Local answer caching for offline support
  - Automatic cache cleanup
  - Recovery of unsaved answers
  - Storage quota management

#### Styling

- **css/taker.css** (500+ lines)
  - Responsive design for desktop and mobile
  - Question navigator sidebar
  - Timer warnings and notifications
  - All question type styling
  - Modal dialogs and overlays
  - Accessible color scheme with WCAG compliance

#### Database

- **migrations/001_create_assessment_submissions.sql**
  - `assessment_submissions` table
  - Indexes for performance
  - Helper views and functions

### Data Flow

```
Access URL (/?token=ABC123)
    ↓
Check Token Validity
    ↓
Load Assessment Details & Questions
    ↓
Restore Cached Answers (if any)
    ↓
Render Assessment Interface
    ↓
Start Timer
    ↓
User Answers Questions
    ↓
Auto-save Answers (every 30 seconds)
    ↓
Submit Assessment
    ↓
Save to Database
    ↓
Show Success Message
```

## Accessing Assessments

### URL Format

```
https://beca-assessment.netlify.app/?token=UNIQUE_TOKEN_HERE
```

### Token Generation

Tokens are generated when creating assessment takers:
- 32-character alphanumeric strings
- Unique per assessment-taker combination
- Can optionally expire after a set period
- Provide single-use access without login

### Example Access Flow

1. **Administrator** assigns an assessment to trainees
2. **System** generates unique token for each trainee
3. **Token** is sent via email to trainee
4. **Trainee** clicks link or enters URL with token
5. **Assessment** loads automatically
6. **Trainee** completes and submits assessment

## Supported Question Types

### 1. MCQ (Multiple Choice Question)

- **Display**: Radio buttons for 4-5 options labeled A-E
- **Answer Format**: `{selected: "A"}`
- **Features**:
  - One correct answer only
  - Optional shuffling of options
  - Points value per question
  - Optional image/diagram

**Example Question**:
```
Which command opens the file dialog in AutoCAD?
A) OPEN ✓
B) NEW
C) SAVE
D) EXIT
E) CLOSE
```

### 2. T/F (True/False)

- **Display**: Two large buttons (True/False)
- **Answer Format**: `{selected: "true"}` or `{selected: "false"}`
- **Features**:
  - Boolean answer
  - Optional explanation
  - Visual feedback on selection

**Example Question**:
```
Revit is a parametric modeling tool.
[True] [False]
```

### 3. PL (Pick List / Dropdown)

- **Display**: HTML dropdown/select element
- **Answer Format**: `{selected: "option_text"}`
- **Features**:
  - Predefined list of options
  - Single selection only
  - Alphabetically sorted or custom order

**Example Question**:
```
Which element type is primarily used for structural support?
[Dropdown: Column ▼]
```

### 4. FT (Free Text / File Upload)

- **Display**: Drag-and-drop file upload area
- **Answer Format**: `{file: {name: "file.dwg", size: 1024000, type: "...", uploadedAt: "..."}}`
- **Features**:
  - Drag-and-drop interface
  - File type validation (DWG, PDF, etc.)
  - File size limits (configurable per question)
  - File preview after upload

**Supported File Types**:
- AutoCAD: .DWG, .DWT
- Revit: .RVT, .RFA, .RTE, .RFT
- Inventor: .IAM, .IPT, .IPJ
- Fusion 360: .F3D, .F3Z
- General: .PDF, .CSV, .XLSX, .JSON, .JPG, .PNG

### 5. OL (Ordered List / Drag-and-Drop)

- **Display**: Draggable items that can be reordered
- **Answer Format**: `{order: [2, 0, 3, 1]}`
- **Features**:
  - Visual ranking of items
  - Drag-and-drop interface
  - Shows correct order after submission
  - Up to 5 items per question

**Example Question**:
```
Order these steps in the correct sequence:
1) Draw geometry
2) Apply constraints
3) Add dimensions
4) Export to PDF
```

### 6. SA (Short Answer)

- **Display**: Single-line or multi-line text input
- **Answer Format**: `{text: "answer text here"}`
- **Features**:
  - Keyword matching for auto-grading
  - Case-sensitive option
  - Expected answer for reference
  - Multiple acceptable keywords

**Example Question**:
```
What is the keyboard shortcut for the ZOOM command in AutoCAD?
[Answer: Z]
```

### 7. EA (Essay)

- **Display**: Large textarea with word counter
- **Answer Format**: `{text: "full essay text..."}`
- **Features**:
  - Minimum and maximum word limits
  - Real-time word count
  - Rubric-based scoring
  - Rich formatting support

**Example Question**:
```
Develop and explain a BIM implementation strategy for a large-scale 
construction project including team roles, workflow, and deliverables.

Word count: 245 / 500 (Minimum: 150 words)
[Large text area for essay response]
```

## Features

### 1. Timer Management

- **Visual countdown**: Shows hours:minutes:seconds format
- **5-minute warning**: Yellow background and notification
- **1-minute warning**: Red background and pulsing animation
- **Auto-submit**: Assessment automatically submits when time expires
- **Pause capability**: Timer pauses if window loses focus (optional)

### 2. Question Navigator

- **Visual indicators**:
  - Blue circle: Unanswered question
  - Green checkmark: Answered question
  - Highlighted: Current question
- **Quick navigation**: Click any question button to jump to it
- **Progress tracking**: Shows answered/total count
- **Responsive grid**: Adapts to screen size

### 3. Auto-Save

- **Frequency**: Every 30 seconds
- **Local backup**: Answers cached in browser localStorage
- **Visual feedback**: Brief "Saving..." indicator
- **Recovery**: Automatically restores answers on reconnect
- **Offline support**: Works without internet connection

### 4. Responsive Design

- **Desktop**: Full navigation sidebar with all features
- **Tablet**: Horizontal question navigator bar
- **Mobile**: Stacked layout with drawer navigation
- **Print-friendly**: Clean printing without header/sidebar

### 5. Accessibility

- **Keyboard navigation**: Arrow keys for previous/next
- **ARIA labels**: Screen reader friendly
- **Color contrast**: WCAG AA compliant
- **Focus indicators**: Clear focus states
- **Form labels**: Properly associated with inputs

### 6. Answer Validation

- **Required fields**: Prevents submission of incomplete assessments
- **Type checking**: Validates answer format per question type
- **File validation**: Checks size and type for uploads
- **Word count**: Verifies essay length requirements

## Database Setup

### Creating the Submissions Table

Execute the SQL migration in Supabase SQL Editor:

```sql
-- Run the migration file: migrations/001_create_assessment_submissions.sql

CREATE TABLE assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  taker_id UUID NOT NULL REFERENCES assessment_takers(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  answers JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_taken_seconds INTEGER,
  score DECIMAL(10, 2),
  pass_fail VARCHAR(10),
  status VARCHAR(20) DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_submissions_token ON assessment_submissions(token);
CREATE INDEX idx_submissions_assessment ON assessment_submissions(assessment_id);
```

### Answer Storage Format

Answers are stored as JSONB with question ID as key:

```json
{
  "q-001": {"selected": "A"},
  "q-002": {"selected": "true"},
  "q-003": {"selected": "Column"},
  "q-004": {"file": {"name": "design.dwg", "size": 2048000}},
  "q-005": {"order": [1, 0, 3, 2]},
  "q-006": {"text": "Z"},
  "q-007": {"text": "Full essay response here..."}
}
```

## API Functions

### JavaScript API (Global Functions)

#### Taker Interface Initialization
```javascript
// Initialize and check for token mode
await initializeAssessmentTaker()
```

#### Assessment Loading
```javascript
// Load assessment by token
await loadAssessmentForTaker()

// Get assessment taker by token
const taker = await getAssessmentTakerByToken(token)

// Get assessment details
const assessment = await getAssessment(assessmentId)

// Get questions for assessment module
const questions = await getAssessmentQuestions(moduleId)
```

#### Answer Management
```javascript
// Save answer to state and localStorage
saveAnswer(questionId, answerObject)

// Load cached answers from localStorage
loadAnswersFromLocalStorage()

// Save answers to localStorage
saveAnswersToLocalStorage()

// Clear answers from localStorage
clearAnswersFromLocalStorage()
```

#### Timer Functions
```javascript
// Start countdown timer
startAssessmentTimer(durationMinutes)

// Get remaining seconds
const remaining = getRemainingSeconds()

// Check if time running out (< 5 mins)
const isRunningOut = isTimeRunningOut()

// Check if time critical (< 1 min)
const isCritical = isTimeCritical()
```

#### Submission Functions
```javascript
// Submit assessment to database
const result = await submitAssessmentToDatabase(submissionData)

// Get submission by ID
const submission = await getSubmission(submissionId)

// Get submission by token
const submission = await getSubmissionByToken(token)

// Save draft submission (auto-save)
const draft = await saveDraftSubmission(draftData)
```

### Supabase Tables

#### assessment_submissions
- `id`: UUID (Primary Key)
- `assessment_id`: UUID (Foreign Key)
- `taker_id`: UUID (Foreign Key)
- `token`: VARCHAR (Unique)
- `answers`: JSONB
- `submitted_at`: TIMESTAMP
- `time_taken_seconds`: INTEGER
- `score`: DECIMAL
- `pass_fail`: VARCHAR
- `status`: VARCHAR (in_progress, submitted, graded)

## Integration Guide

### 1. Sending Assessment Links to Trainees

#### Via Email

```javascript
// In send-trainees.js or email service
const assessmentLink = `https://beca-assessment.netlify.app/?token=${token}`;
const emailBody = `
  Please complete the assessment by clicking the link below:
  ${assessmentLink}
  
  Time Limit: ${assessment.duration_minutes} minutes
  Total Questions: ${questions.length}
`;
```

#### Via SMS (Optional)
```javascript
const shortLink = await shortenUrl(assessmentLink);
const message = `Complete your BECA assessment: ${shortLink}`;
```

### 2. Tracking Submission Status

```javascript
// Get all submissions for an assessment
const submissions = await getAssessmentSubmissions(assessmentId);

// Filter by status
const completed = submissions.filter(s => s.status === 'submitted');
const inProgress = submissions.filter(s => s.status === 'in_progress');
const graded = submissions.filter(s => s.status === 'graded');
```

### 3. Displaying Results

```javascript
// After submission (in results page)
const submission = await getSubmission(submissionId);
console.log(`
  Score: ${submission.score}
  Pass/Fail: ${submission.pass_fail}
  Time Taken: ${submission.time_taken_seconds / 60} minutes
  Status: ${submission.status}
`);
```

### 4. Exporting Results

```javascript
// Export submissions to Excel
const submissions = await getAssessmentSubmissions(assessmentId);
exportSubmissionsToExcel(submissions);
```

## Troubleshooting

### Common Issues

#### 1. "Invalid or expired access token"
- **Cause**: Token doesn't exist or has expired
- **Solution**: 
  - Verify token is correct
  - Check token hasn't expired
  - Request new token from administrator

#### 2. Assessment doesn't load
- **Cause**: Network error or database connection failure
- **Solution**:
  - Check internet connection
  - Refresh page
  - Try again in a few minutes
  - Contact support if issue persists

#### 3. Answers not saving
- **Cause**: Auto-save failed or offline
- **Solution**:
  - Check internet connection
  - Verify localStorage is enabled
  - Look for "Saving..." indicator
  - Answers are cached locally even if offline

#### 4. Timer counting down too fast/slow
- **Cause**: Browser clock out of sync
- **Solution**:
  - Check system time is correct
  - Clear browser cache
  - Close other browser tabs/apps
  - Restart browser

#### 5. File upload failing
- **Cause**: File too large or unsupported format
- **Solution**:
  - Check file size (max varies by question)
  - Verify file format is supported
  - Try compressing file
  - Contact administrator if need extension

### Browser Requirements

- **Minimum**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Recommended**: Latest version of any modern browser
- **Storage**: 5MB localStorage space (for offline support)
- **JavaScript**: Must be enabled
- **Cookies**: Can be disabled (not required)

### System Performance

- **Optimal**: 1Mbps+ internet connection
- **Minimum**: 250kbps (for submission upload)
- **Storage**: 100MB free disk space
- **Memory**: 512MB RAM minimum
- **CPU**: Dual-core processor

## Advanced Features

### Custom Validation

To add custom answer validation:

```javascript
function validateAnswers() {
  const errors = [];
  
  assessmentState.questions.forEach((question, idx) => {
    const answer = assessmentState.answers[question.id];
    
    // Custom validation logic
    if (question.question_type === 'essay') {
      const wordCount = answer.text.split(/\s+/).length;
      if (wordCount < question.min_words) {
        errors.push(`Q${idx + 1}: Minimum ${question.min_words} words required`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors };
}
```

### Offline Support

Answers are automatically cached locally:

```javascript
// Check for unsaved answers
const unsaved = checkForUnsavedAnswers();
if (unsaved) {
  console.log(`${unsaved.answersCount} answers pending upload`);
}

// Storage info
const info = getStorageInfo();
console.log(`Using ${info.totalSizeKB}KB storage`);
```

### Auto-Submit Configuration

Modify timer behavior:

```javascript
function handleTimeExpired() {
  // Custom timeout handler
  alert('Time is up! Submitting assessment...');
  submitAssessment();
}
```

## Support & Documentation

- **Issue Tracker**: GitHub Issues
- **Documentation**: BECA-Assessment wiki
- **Email Support**: support@djbhglobal.com
- **Response Time**: 24 hours (business days)

## Version History

- **v1.0** (2026-07-23)
  - Initial release
  - All 7 question types
  - Timer with warnings
  - Auto-save functionality
  - Offline support
  - Mobile responsive

