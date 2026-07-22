# BECA Assessment Platform - CORRECT WORKFLOW

## ❌ What Was Wrong

Current implementation: Assessment → Create Questions inside it

## ✅ What Should Be

Three-tier system with independent banks:

```
┌─────────────────┐
│ QUESTION BANK   │  (Independent, reusable)
│ - Create Q's    │
│ - Import Excel  │
│ - Edit/Delete   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  MODULE BANK    │  (Groups of questions)
│ - Create Module │
│ - Assign Q's    │
│ - Reorder Q's   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  ASSESSMENT     │  (Uses modules/questions from banks)
│ - Create Test   │
│ - Select Module │
│ - Questions     │
│   auto-load     │
└─────────────────┘
```

---

## 🔧 What Needs to be Added/Fixed

### 1. **Question Bank Page** ✅ READY
- Add button: "Add Question", "Import Excel"
- Table: Title | Type | Points | Category | Created | Actions
- Modal: Add/Edit question form
- Features: Create, Edit, Delete, Search, Filter

**File**: `js/questions-correct.js` (already created)

### 2. **Module Bank Page** (NEEDS WORK)
- Add button: "Create Module"
- Modal: Module name + Question selector (multi-select)
- Drag-drop to reorder questions
- Features: Create, Edit, Delete, Preview

**What to add to `js/modules.js`**:
```javascript
// Create module (INDEPENDENT, not within assessment)
async function renderModules() {
  // Load all modules from database
  // Show module list with questions assigned
}

async function openCreateModuleModal() {
  // Show modal to create new module
  // Load available questions from Question Bank
  // Allow multi-select to assign questions
}

async function saveModule(event) {
  const moduleName = document.getElementById('moduleName').value;
  const selectedQuestions = getSelectedQuestions(); // Multi-select checkboxes
  
  // Save to database with question_ids array
  await apiCall('POST', 'modules', {
    name: moduleName,
    description: desc,
    question_ids: selectedQuestions,
    created_by: currentUser.id
  });
}
```

### 3. **Assessment Creation** (NEEDS WORK)
When creating assessment, change flow:

**OLD (Wrong)**:
```
Create Assessment → Create Modules inline → Create Questions inline
```

**NEW (Correct)**:
```
Step 1: Enter Assessment Details
Step 2: Select Modules from Module Bank
Step 3: Questions auto-load from selected modules
Step 4: Publish
```

**What to change in `js/assessments.js`**:
```javascript
async function renderCreateAssessment() {
  // Step 1: Basic details (title, description, duration, pass score)
  
  // Step 2: Module selector
  // Load all modules from database
  // Show multi-select checkboxes for modules
  
  // Step 3: Preview questions
  // Auto-load questions from selected modules
  
  // Step 4: Save assessment
}
```

### 4. **Permission Editor** ✅ EXISTS BUT NEEDS WIRING
The modal exists in index-new.html but needs:
- Button in Users page to open it
- `openPermissionEditor()` function in `js/permissions.js`
- Add this button to Users page:
```html
<button onclick="openPermissionEditor()" class="btn btn-secondary">
  <i class="fas fa-lock"></i> Permission Editor
</button>
```

### 5. **Excel Import** (FRAMEWORK READY)
Modal exists, needs implementation:
```javascript
async function handleExcelImport(event) {
  event.preventDefault();
  
  const file = document.getElementById('excelFile').files[0];
  
  // Parse Excel file using SheetJS or similar
  // Format: Title | Type | Points | Category | Difficulty | Question Text
  
  // For each row:
  // - Create question in database
  // - Add to Question Bank
  
  // Show import summary
}
```

---

## 📋 Implementation Checklist

### Database Tables (Already Created)
- ✅ questions (title, question_type, points, category, etc)
- ✅ modules (name, question_ids array)
- ✅ role_permissions
- ✅ assessment_takers

### Pages (Update Needed)
- 🟡 Question Bank - Page ready, needs to load from DB
- 🟡 Module Bank - Page ready, needs questions selector
- 🟡 Assessment Creation - Needs module selection flow
- ✅ User Management - Has permission editor button

### Functions (Add/Update)
- ✅ `renderQuestions()` - Load questions list
- ✅ `saveQuestion()` - Add/edit question
- ✅ `deleteQuestion()` - Remove question
- 🟡 `handleExcelImport()` - Parse Excel
- 🟡 `renderModules()` - Load modules list
- 🟡 `saveModule()` - Create module with questions
- 🟡 `updateAssessmentCreation()` - Module selection

---

## 🚀 Quick Implementation (Step by Step)

### Step 1: Update Module Bank (Fix Workflow)
Edit `js/modules.js`:
- Change to load questions from Question Bank
- Add multi-select question picker
- Save module with question array

### Step 2: Update Assessment Creation
Edit `js/assessments.js`:
- Remove inline question creation
- Add module selection dropdown
- Auto-load questions from selected modules

### Step 3: Wire Permission Editor
Edit `js/users.js`:
- Add "Permission Editor" button above user table
- Click handler: `openPermissionEditor()`

### Step 4: Excel Import
Edit `js/questions-correct.js`:
- Implement Excel parsing
- Create questions in loop

---

## 📍 Current Status

| Component | Status | File |
|-----------|--------|------|
| Question Bank UI | ✅ Ready | index-new.html |
| Question Functions | ✅ Ready | js/questions-correct.js |
| Module Bank UI | 🟡 Partial | index-new.html |
| Module Functions | ✅ Framework | js/modules.js |
| Assessment Builder | 🟡 Needs Update | js/assessments.js |
| Permission Editor | ✅ Ready | js/permissions.js |
| Excel Import UI | ✅ Ready | index-new.html |
| Excel Import Logic | ⏳ TODO | js/questions-correct.js |

---

## ✨ Result After Implementation

Users will follow this workflow:

1. **Create Questions** → Question Bank (reusable)
2. **Group into Modules** → Module Bank (reusable)
3. **Create Assessment** → Select modules → Questions auto-load
4. **Send to Trainees** → Link + datasets
5. **Trainees take test** → Answer questions with timer

**No more creating questions inside assessments!**

---

## Need Help?

The modals, buttons, and basic structure are ready. Main work is:
- Fixing Module Bank to work with Question Bank
- Updating Assessment Creation to use modules
- Implementing Excel import logic
