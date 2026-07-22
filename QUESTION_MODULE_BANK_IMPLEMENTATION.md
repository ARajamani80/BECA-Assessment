# Question & Module Bank System - Implementation Guide

## Overview

This guide explains how to integrate the Question & Module Bank System into the BECA Assessment Platform.

## File Structure

```
BECA-Assessment/
├── QUESTION_MODULE_BANK_SCHEMA.sql      # Database schema
├── question_module_bank.js               # Core functions (20+ functions)
├── question_module_bank_ui.js            # UI handlers
├── pages_question_module_bank.html       # HTML components
├── index.html                            # Main app (needs integration)
└── QUESTION_MODULE_BANK_USER_GUIDE.md   # User documentation
```

## Step-by-Step Integration

### Step 1: Database Schema

Execute the SQL schema in Supabase:

```bash
1. Go to Supabase Dashboard
2. Select your project
3. Go to SQL Editor
4. Create new query
5. Paste contents of QUESTION_MODULE_BANK_SCHEMA.sql
6. Run query
7. Verify tables created successfully
```

**Tables Created:**
- `question_bank` - Global reusable questions
- `module_bank` - Groupings of questions
- `assessment_question_datasets` - Linked files to questions
- `question_imports` - Import audit trail
- `assessment_module_assignments` - Links assessments to modules
- `user_question_filters` - Saved user filters

**Storage Buckets to Create:**
1. `question-images` (public) - For question images
2. `assessment-files` (private) - For dataset files

### Step 2: Script Integration

Add these scripts to your `index.html` in the `<head>` section:

```html
<!-- Question & Module Bank System -->
<script src="question_module_bank.js"></script>
<script src="question_module_bank_ui.js"></script>
```

**Order matters!** Load `question_module_bank.js` before `question_module_bank_ui.js`.

### Step 3: HTML Components

Copy the modal and page HTML from `pages_question_module_bank.html` into your main `index.html`:

**Location in index.html:**
- Add all modal definitions at the end of `<body>` before `</body>`
- Add page divs in the main content area (or handle dynamically)

**Example placement:**
```html
<body>
  <!-- Existing app content -->
  
  <!-- Add modals at end of body -->
  <div id="questionModal" class="modal">...</div>
  <div id="moduleModal" class="modal">...</div>
  <div id="importExcelModal" class="modal">...</div>
</body>
```

### Step 4: Navigation Integration

Add navigation items to your sidebar. Update the `showPage()` function to handle new pages:

```javascript
function showPage(page) {
  currentPage = page;
  const app = document.getElementById('app');
  
  if (page === 'login') {
    // ... existing login code
  } else if (page === 'dashboard') {
    // ... existing dashboard code
  } else if (page === 'questionBank') {
    showQuestionBankPage();
  } else if (page === 'moduleBank') {
    showModuleBankPage();
  }
}
```

### Step 5: Sidebar Navigation Items

Add to your sidebar navigation:

```html
<div class="nav-section">
  <div class="nav-section-title">Content Management</div>
  
  <div class="nav-item" data-page="questionBank" onclick="showQuestionBankPage()">
    <span class="nav-icon"><i class="fas fa-circle-question"></i></span>
    <span>Question Bank</span>
  </div>
  
  <div class="nav-item" data-page="moduleBank" onclick="showModuleBankPage()">
    <span class="nav-icon"><i class="fas fa-cube"></i></span>
    <span>Module Bank</span>
  </div>
</div>
```

### Step 6: Create Assessment Flow Updates

Modify your existing assessment creation to leverage modules:

**Current Flow:**
```
Create Assessment → Add Questions → Publish
```

**New Flow:**
```
Create Assessment → Select Modules → Review Questions → Publish
```

**Implementation:**
```javascript
// New step in assessment wizard
async function addModulesToAssessment(assessmentId, moduleIds) {
  const result = await selectModulesForAssessment(assessmentId, moduleIds);
  
  // Questions auto-load from modules
  const questions = await loadQuestionsForAssessment(assessmentId);
  
  // Display to user
  previewAssessmentQuestions(assessmentId);
}
```

## Function Reference

### Question Bank Functions

#### Create/Edit/Delete

```javascript
// Add new question
addQuestion({
  title: "Question Title",
  question_text: "What is...?",
  question_type: "MCQ", // or PL, TRUEFALSE, FREETEXT, ORDERED_LIST
  options: { options: ["A", "B", "C"] },
  correct_answer: "A",
  points: 10,
  difficulty_level: "medium",
  category: "Leadership",
  tags: ["scenario", "advanced"]
});

// Edit question
editQuestion(questionId, updatedData);

// Delete question
deleteQuestion(questionId);
```

#### Search/Filter

```javascript
// Search with filters
searchQuestions({
  search: "leadership",      // Full-text search
  type: "MCQ",               // Question type
  category: "Leadership",    // Category
  difficulty: "hard",        // easy/medium/hard
  tags: ["scenario"],        // Tag filter
  page: 0,                   // Pagination (0-based)
  limit: 50                  // Results per page
});
```

#### Import/Export

```javascript
// Import from Excel file
importQuestionsFromExcel(file);

// Export to Excel
exportQuestionsToExcel(questionIds); // Leave empty for all
```

#### Image Management

```javascript
// Upload image for question
uploadQuestionImage(questionId, file);

// Remove image
removeQuestionImage(questionId);
```

### Module Bank Functions

#### Create/Edit/Delete

```javascript
// Add module
addModule({
  name: "Module Name",
  description: "Module description",
  question_ids: [id1, id2, id3],
  question_order: [id1, id2, id3]  // Order matters
});

// Edit module
editModule(moduleId, updatedData);

// Delete module
deleteModule(moduleId);
```

#### Question Management

```javascript
// Add questions to module
addQuestionsToModule(moduleId, [questionId1, questionId2]);

// Remove question from module
removeQuestionFromModule(moduleId, questionId);

// Reorder questions
reorderQuestionsInModule(moduleId, [id1, id3, id2]); // New order

// Get module with all questions
getModuleWithQuestions(moduleId);
```

### Assessment Integration Functions

```javascript
// Select modules for assessment
selectModulesForAssessment(assessmentId, [moduleId1, moduleId2]);

// Auto-load all questions from selected modules
loadQuestionsForAssessment(assessmentId);

// Get preview of all assessment questions
previewAssessmentQuestions(assessmentId);

// Get modules assigned to assessment
getAssessmentModules(assessmentId);

// Remove module from assessment
removeModuleFromAssessment(assessmentId, moduleId);
```

### Dataset Functions

```javascript
// Upload dataset file for question
uploadDatasetFile(questionId, file);

// Delete dataset
deleteDatasetFile(datasetId, filePath);

// Get datasets for question
getQuestionDatasets(questionId);

// Get download link
getDatasetDownloadLink(filePath);
```

## UI Components

### Pages

Two new pages are provided in HTML:

#### 1. Question Bank Page (`#questionBankPage`)
- Statistics cards
- Search and filter panel
- Questions table with actions
- Pagination

#### 2. Module Bank Page (`#moduleBankPage`)
- Statistics cards
- Search panel
- Module list with actions
- Pagination

### Modals

#### 1. Question Modal (`#questionModal`)
- Add/edit question form
- Dynamic fields based on question type
- Image upload with preview
- All metadata fields

#### 2. Module Modal (`#moduleModal`)
- Module details form
- Question selector with search
- Selected questions preview
- Drag-drop reordering
- Module statistics

#### 3. Import Excel Modal (`#importExcelModal`)
- File upload (drag-drop supported)
- Format specification table
- Import results display
- Error report

## Data Flow Diagrams

### Question Creation Flow

```
User → Add Question Modal
        ↓
     Form Validation
        ↓
     uploadQuestionImage() [if image selected]
        ↓
     addQuestion() → Supabase
        ↓
     Reload Question Bank Table
```

### Assessment from Modules Flow

```
User → Select Modules Modal
        ↓
selectModulesForAssessment()
        ↓
loadQuestionsForAssessment()
        ↓
Questions auto-load in module order
        ↓
Preview all questions
        ↓
Publish assessment
```

## API Integration

### Supabase Client

All functions use the global `window.supabaseClient` object:

```javascript
const sb = window.supabaseClient?.getSupabase?.();
const user = await sb.auth.getUser();
```

### Error Handling Pattern

All functions return consistent response objects:

```javascript
{
  success: true/false,
  data: {...},           // If success
  error: "Error message" // If failed
}
```

### RLS Policies

Database includes Row Level Security (RLS) policies:

**User Access:**
- Users see own questions/modules
- Admins see all

**Trainee Access:**
- Only see assigned assessments
- Cannot access Question/Module Banks

## Performance Optimization

### Database Indexes

Created indexes on frequently queried columns:

```sql
idx_question_bank_created_by
idx_question_bank_type
idx_question_bank_category
idx_question_bank_difficulty
idx_module_bank_created_by
idx_datasets_question
```

### Frontend Optimization

1. **Pagination**: Load 20 items per page
2. **Search Debouncing**: Delay search queries 300ms
3. **Lazy Loading**: Load images on demand
4. **Caching**: Cache filter options (categories, tags)

### Storage Optimization

1. **Image Compression**: Compress images before upload
2. **File Size Limits**: Validate before upload
3. **Cleanup**: Regular maintenance to remove unused files

## Testing Checklist

### Unit Tests

- [ ] addQuestion() creates question correctly
- [ ] editQuestion() updates fields
- [ ] deleteQuestion() removes from database
- [ ] searchQuestions() filters correctly
- [ ] addModule() creates with questions
- [ ] editModule() reorders correctly
- [ ] Import Excel handles errors
- [ ] Export Excel generates valid file

### Integration Tests

- [ ] Question Bank UI loads
- [ ] Module Bank UI loads
- [ ] Add/Edit/Delete workflows
- [ ] Search and filter work
- [ ] Modal open/close
- [ ] Image upload and display
- [ ] Dataset management
- [ ] Assessment module selection

### User Acceptance Tests

- [ ] End-to-end question creation
- [ ] Module assembly
- [ ] Assessment creation from modules
- [ ] Excel import/export
- [ ] Image upload and display
- [ ] Dataset download by trainee
- [ ] Access control (role-based)

## Deployment Checklist

### Pre-Deployment

- [ ] All tables created in Supabase
- [ ] Storage buckets configured
- [ ] RLS policies enabled
- [ ] Scripts linked in HTML
- [ ] Navigation items added
- [ ] CSS styles included
- [ ] Error handling tested
- [ ] Database backups created

### Post-Deployment

- [ ] Test all functions in production
- [ ] Verify file uploads work
- [ ] Check RLS policies are enforced
- [ ] Monitor performance
- [ ] User acceptance testing
- [ ] Documentation updated
- [ ] Support team trained
- [ ] Rollback plan ready

## Troubleshooting

### Common Issues

#### "Supabase not initialized"
**Cause**: Scripts loaded before supabase-client.js  
**Solution**: Verify script loading order

#### "Permission denied" errors
**Cause**: RLS policies blocking access  
**Solution**: Check user role and RLS policies

#### "File upload fails"
**Cause**: Storage bucket not created  
**Solution**: Create buckets in Supabase dashboard

#### "Questions not appearing in module"
**Cause**: Question IDs not matching  
**Solution**: Verify question IDs in module_bank.question_ids array

### Debug Mode

Enable console logging:

```javascript
window.DEBUG_MODE = true;

// Then in functions:
if (window.DEBUG_MODE) console.log('Debug info...');
```

## Customization

### Adding New Question Types

1. Add to `question_type` enum
2. Update validation in `updateQuestionTypeUI()`
3. Add to question type dropdown
4. Update correct answer help text

### Custom Filters

Add new filter fields:

```javascript
// In searchQuestions()
if (filters.customField) {
  query = query.eq('custom_field', filters.customField);
}

// In UI
<select id="customFieldFilter">
  <option value="">All Options</option>
  <option value="value1">Option 1</option>
</select>
```

### Custom Styling

Override CSS variables:

```css
:root {
  --primary: #your-color;
  --success: #your-color;
  --danger: #your-color;
}
```

## Security Considerations

### Input Validation

All user input is validated:
- Question text length
- Points range (1-100)
- File size limits
- File type restrictions

### SQL Injection Protection

Using Supabase client prevents SQL injection:
- Parameterized queries
- Input sanitization
- No raw SQL from user input

### File Upload Security

- File type validation
- Size limits enforced
- Files stored in private bucket (for datasets)
- Download links generated securely

### Data Privacy

- RLS policies enforce access control
- Users can only see own content
- Audit logging available
- No data exposed via API

## Scaling Considerations

### Large Question Banks

For 10,000+ questions:
- Implement advanced caching
- Use search indices
- Consider pagination optimization
- Archive old versions

### Large Modules

For modules with 100+ questions:
- Lazy load questions
- Paginate selection UI
- Cache module composition
- Monitor performance

### Assessment Performance

For 1000+ concurrent takers:
- Optimize question loading
- Cache frequently accessed data
- Use read replicas if available
- Monitor Supabase performance

## Maintenance

### Regular Tasks

- **Weekly**: Monitor storage usage
- **Monthly**: Review error logs, clean old datasets
- **Quarterly**: Archive old question versions
- **Annually**: Backup all data, plan for growth

### Database Maintenance

```sql
-- Vacuum tables
VACUUM ANALYZE question_bank;
VACUUM ANALYZE module_bank;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial release |

## Support & Resources

- **Documentation**: See QUESTION_MODULE_BANK_USER_GUIDE.md
- **GitHub Issues**: Report bugs
- **Discussions**: Ask questions
- **PR**: Contribute improvements

## License

[Your License Here]

---

**Version**: 1.0  
**Last Updated**: 2024  
**Maintainer**: BECA Development Team
