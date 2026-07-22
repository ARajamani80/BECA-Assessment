# BECA Assessment Platform - Enhanced Features Guide

## Overview
This document describes all the new and improved features in the enhanced BECA Assessment Platform.

---

## 1. User Profile at Bottom of Sidebar

### What's New
- **User Avatar**: Displays the first initial of the logged-in user in a styled circular badge
- **User Name**: Shows the full name or email of the user
- **Role Badge**: Displays the user's role (trainer, admin, user, etc.) with color coding
- **Location**: Fixed at the bottom of the sidebar for easy access

### Implementation Details
```html
<div class="sidebar-user">
  <div class="user-avatar" id="userAvatarSidebar">U</div>
  <div class="user-info">
    <div class="user-name" id="userNameSidebar">User</div>
    <div class="user-role-badge" id="userRoleSidebar">user</div>
  </div>
</div>
```

### Features
- Updates automatically after login
- Shows user's role with appropriate color badge
- Responsive design on mobile devices

---

## 2. Fixed Assessment Display

### What Was Fixed
- **Robust Error Handling**: Added try-catch blocks to all API calls
- **Array Validation**: Checks if returned data is actually an array before processing
- **Fallback Content**: Shows helpful messages when no data is available
- **Debug Information**: Console logs errors for troubleshooting

### Key Improvements
```javascript
// Old (Error-prone):
const assessments = await apiCall('GET', 'assessments');
assessments.forEach(a => { ... });

// New (Robust):
const assessments = await apiCall('GET', 'assessments');
if (!Array.isArray(assessments) || assessments.length === 0) {
  html += '<p>No assessments yet...</p>';
} else {
  assessments.forEach(a => { ... });
}
```

### Assessment Display Features
- Shows assessment title, description, duration, and passing score
- Color-coded status badges
- Action buttons: Edit, View, Delete
- Pagination ready (can be added later)

---

## 3. Assessment Builder with Modules & Questions

### Creating an Assessment
1. Click "Create New" in the sidebar
2. Fill in assessment details:
   - **Title** (required)
   - **Description** (optional)
   - **Duration** (in minutes)
   - **Passing Score** (percentage)
3. Click "Create Assessment"

### Adding Modules
Once assessment is created, you can add modules:

1. Click "Add Module" button
2. Fill in module details:
   - **Name** (required)
   - **Description** (optional)
3. Save module

### Adding Questions to Modules
For each module, you can add questions:

1. Click "Add Question" in the module
2. Choose question type:
   - **MCQ** (Multiple Choice Question)
   - **Essay** (Free text response)
   - **True/False** (Binary choice)
   - **File Upload** (Submission of files)
3. Fill in question text and points
4. For MCQ: Add options and mark correct answer
5. For File Upload: Select allowed file types (PDF, DWG, RVT, JPG, PNG, DOC)

### Managing Questions
- Edit questions by clicking them (edit feature can be extended)
- Delete questions with the trash icon
- Reorder questions by module

### Publishing Assessment
Once all modules and questions are added:
1. Click "Publish Assessment" button
2. Assessment becomes available for trainees to take

---

## 4. Dataset File Upload (Planned Enhancement)

### Current Implementation
The application has UI prepared for file uploads:

```html
<div class="file-upload">
  <!-- Drag and drop area -->
  <!-- File upload functionality -->
</div>
```

### Planned Features
To enable file uploads, you'll need to:

1. **Create Supabase Storage Bucket**
   - Go to Supabase dashboard
   - Create bucket named "assessment-files"
   - Set appropriate permissions

2. **Link Files to Questions**
   - Upload files through question settings
   - Store file references in assessment_question_files table
   - Make files available in assessment taking view

3. **File Types Supported**
   - PDF documents
   - DWG files (CAD)
   - RVT files (Revit)
   - Images (JPG, PNG)
   - Documents (DOC, DOCX)

### Database Schema Needed
```sql
CREATE TABLE assessment_question_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES assessment_questions(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Send to Trainees Feature

### Accessing the Feature
1. Click "Send to Trainees" in the sidebar
2. Modal opens with trainee assignment interface

### How to Use
1. **Select Assessment**
   - Dropdown shows all available assessments
   - Details shown: Duration, Passing Score, Module count

2. **Select Trainees**
   - Checkbox list of all users
   - Shows name and role badge
   - Filter by role (trainer, admin, user)

3. **Include Datasets**
   - Optional: Include uploaded files for download
   - Trainees can access datasets while taking assessment

4. **Send**
   - Click "Send to Selected Trainees"
   - Creates assignment records in database

### Tracking Assignments
Assignments are stored in `assessment_assignments` table:
- Assessment ID
- Trainee ID
- Assignment date
- Status (assigned, in_progress, submitted)
- Dataset access flag

### Database Schema
```sql
CREATE TABLE assessment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id),
  trainee_id UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  status TEXT DEFAULT 'assigned',
  include_datasets BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  score NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Timer-Based Assessment (Planned)

### Timer Features to Implement
1. **Display Countdown**
   - Format: MM:SS
   - Large, easy-to-read font
   - Updates every second

2. **Timer States**
   - Normal (Blue): > 5 minutes remaining
   - Warning (Orange): 5 minutes to 1 minute remaining
   - Critical (Red): < 1 minute remaining

3. **Warnings**
   - Toast notification at 5 minutes remaining
   - Toast notification at 1 minute remaining
   - Browser tab title updates with countdown

4. **Auto-Submit**
   - When timer reaches 00:00
   - Automatically submits assessment
   - Saves current answers
   - Shows completion message

### Implementation Code Example
```javascript
class AssessmentTimer {
  constructor(durationMinutes) {
    this.totalSeconds = durationMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.interval = null;
  }

  start() {
    this.interval = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();
      this.checkWarnings();
      
      if (this.remainingSeconds <= 0) {
        this.autoSubmit();
      }
    }, 1000);
  }

  updateDisplay() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
    
    // Update color based on remaining time
    const timerEl = document.getElementById('timer');
    if (this.remainingSeconds < 60) {
      timerEl.classList.add('critical');
    } else if (this.remainingSeconds < 300) {
      timerEl.classList.add('warning');
    }
  }

  checkWarnings() {
    if (this.remainingSeconds === 300) {
      showNotification('5 minutes remaining!');
    } else if (this.remainingSeconds === 60) {
      showNotification('1 minute remaining!');
    }
  }

  autoSubmit() {
    clearInterval(this.interval);
    submitAssessment();
  }
}
```

### UI for Timer
```html
<div class="timer" id="timer">60:00</div>
```

---

## 7. Database Tables Required

### New Tables Needed
The application requires these tables in Supabase:

```sql
-- Assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 60,
  passing_score INTEGER DEFAULT 60,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Modules
CREATE TABLE assessment_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sequence INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Questions
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES assessment_modules(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- mcq, essay, truefalse, fileupload
  points INTEGER DEFAULT 10,
  options JSONB, -- For MCQ options
  allowed_file_types TEXT[], -- For file upload
  sequence INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Results
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id),
  user_id UUID REFERENCES auth.users(id),
  total_score NUMERIC,
  passed BOOLEAN,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Assignments
CREATE TABLE assessment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id),
  trainee_id UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'assigned',
  include_datasets BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- Question Files
CREATE TABLE assessment_question_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES assessment_questions(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. Modal System

### Available Modals

#### Module Modal
- **Add Module**: Create new module with name and description
- **Edit Module**: Update existing module details
- **Triggered by**: "Add Module" button in assessment editor

#### Question Modal
- **Add Question**: Create new question with full configuration
- **Triggered by**: "Add Question" button in module
- **Dynamic Fields**: Changes based on question type selected

#### Trainees Modal
- **Send Assessment**: Assign assessment to trainees
- **Features**: 
  - Assessment selector with details
  - Trainee checkbox list
  - Dataset inclusion toggle

---

## 9. UI/UX Improvements

### Color System
- **Primary Blue** (#2563eb): Main actions, active states
- **Success Green** (#10b981): Positive actions, pass state
- **Warning Orange** (#f59e0b): Caution, timer warnings
- **Danger Red** (#ef4444): Deletions, fail state
- **Secondary Purple** (#7c3aed): Secondary actions

### Responsive Design
- **Desktop**: Full sidebar (260px), multi-column layouts
- **Tablet**: Adjusted layouts, stacked cards
- **Mobile**: Collapsible sidebar, single column

### Accessibility
- Semantic HTML structure
- ARIA labels on buttons
- Keyboard navigation support
- High contrast text
- Clear visual feedback

---

## 10. Navigation Structure

### Main Navigation
```
Dashboard
├── Overview
├── Recent Submissions
└── Quick Stats

Assessment
├── Assessments (List view)
├── Create New (Form + Builder)
├── Send to Trainees (Assignment)
└── Results (View results)

Management
├── Users (Manage users & roles)
├── Students (Student list)
└── Reports (Analytics)

Account
└── Logout
```

---

## 11. API Integration Notes

### Current Endpoints Used
- `GET /assessments` - List all assessments
- `POST /assessments` - Create new assessment
- `PATCH /assessments` - Update assessment
- `DELETE /assessments` - Delete assessment

### New Endpoints to Implement
- `POST /assessment_modules` - Create module
- `PATCH /assessment_modules` - Update module
- `DELETE /assessment_modules` - Delete module
- `POST /assessment_questions` - Create question
- `PATCH /assessment_questions` - Update question
- `DELETE /assessment_questions` - Delete question
- `POST /assessment_assignments` - Assign to trainee
- `GET /assessment_assignments` - List assignments
- `POST /assessments/{id}/submit` - Submit assessment
- `GET /assessments/{id}/start` - Start taking assessment

---

## 12. Next Steps for Implementation

### Phase 1: Database Setup
1. Create all required tables in Supabase
2. Set up Row Level Security (RLS) policies
3. Create storage bucket for files

### Phase 2: Backend API Routes
1. Implement assessment endpoints
2. Implement module endpoints
3. Implement question endpoints
4. Implement assignment endpoints

### Phase 3: Assessment Taking View
1. Create assessment player interface
2. Implement timer system
3. Add answer submission
4. Show results and scoring

### Phase 4: File Upload Feature
1. Implement file upload to Supabase Storage
2. Link files to questions
3. Show file downloads in assessment view
4. Add file preview capabilities

### Phase 5: Trainee Dashboard
1. Show assigned assessments
2. Show download links for datasets
3. Track assessment progress
4. Show results and feedback

---

## 13. Error Handling

### Error Messages
All errors are displayed to the user via message bar:
- Success messages (green)
- Error messages (red)
- Auto-disappear after 5 seconds

### Console Logging
Development errors are logged to console for debugging:
```javascript
console.error('API Error:', result);
```

### Validation
- Required fields marked with *
- Input validation in forms
- API response validation

---

## 14. Security Considerations

### Authentication
- Uses Supabase Auth
- Token stored in localStorage
- Validated on every API call

### Authorization
- Role-based access control
- Trainer/Admin only features
- User scope validation

### Data Protection
- HTTPS only (Supabase)
- RLS policies on tables
- Input sanitization

---

## Support & Troubleshooting

### Common Issues

**Assessments Not Loading**
- Check browser console for errors
- Verify Supabase connection
- Check authentication token validity

**Modals Not Closing**
- Verify close button event listeners
- Check for JavaScript errors in console

**Form Submission Fails**
- Check all required fields filled
- Verify API endpoint exists
- Check authentication token

### Debug Mode
Enable console logging by checking browser Developer Tools (F12)

---

## File Structure
```
BECA-Assessment/
├── index.html (Main application - this file)
├── FEATURES.md (This documentation)
├── backend/
│   ├── backend_server.js
│   ├── backend_assessmentRoutes.js
│   ├── backend_authRoutes.js
│   └── ...
└── netlify/
    └── functions/
        └── config.js
```

---

## Version History

### v1.0 - Initial Release
- User profile in sidebar
- Fixed assessment display
- Assessment builder with modules & questions
- Send to trainees functionality
- Results viewing
- User management

### Upcoming (v1.1)
- Timer-based assessments
- File upload feature
- Assessment taking interface
- Auto-submit on timeout
- File download for trainees

---

## Contact & Support
For issues or feature requests, contact the development team.
