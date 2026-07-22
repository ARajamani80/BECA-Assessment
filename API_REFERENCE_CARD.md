# Question & Module Bank System - API Reference Card

Quick reference for all available functions.

## Question Bank Functions

### Create & Manage

```javascript
// Add question
await addQuestion({
  title: string,
  description?: string,
  question_text: string,
  question_type: 'MCQ'|'PL'|'TRUEFALSE'|'FREETEXT'|'ORDERED_LIST',
  options?: { options: string[] },
  correct_answer: string,
  points?: number,
  image_url?: string,
  has_dataset?: boolean,
  difficulty_level?: 'easy'|'medium'|'hard',
  category?: string,
  tags?: string[]
})
// Returns: { success, data, message }

// Edit question
await editQuestion(questionId: string, updatedData: object)
// Returns: { success, data, message }

// Delete question
await deleteQuestion(questionId: string)
// Returns: { success, message }

// Get single question
await getQuestion(questionId: string)
// Returns: { success, data }

// Search questions
await searchQuestions({
  search?: string,
  type?: string,
  category?: string,
  difficulty?: string,
  tags?: string[],
  page?: number,
  limit?: number
})
// Returns: { success, data: [], total: number }
```

### Images

```javascript
// Upload image
await uploadQuestionImage(questionId: string, file: File)
// Returns: { success, imageUrl, message }

// Remove image
await removeQuestionImage(questionId: string)
// Returns: { success, message }
```

### Import/Export

```javascript
// Import from Excel
await importQuestionsFromExcel(file: File)
// Returns: { success, successCount, errorCount, errors[], message }

// Export to Excel
await exportQuestionsToExcel(questionIds?: string[])
// Returns: { success, message, count }
```

### Utilities

```javascript
// Get categories
await getQuestionCategories()
// Returns: { success, data: string[] }

// Get all tags
await getAllTags()
// Returns: { success, data: string[] }

// Get statistics
await getQuestionStatistics()
// Returns: { success, data: { totalQuestions, byType, totalPoints } }
```

---

## Module Bank Functions

### Create & Manage

```javascript
// Add module
await addModule({
  name: string,
  description?: string,
  question_ids: string[],
  question_order?: string[]
})
// Returns: { success, data, message }

// Edit module
await editModule(moduleId: string, updatedData: object)
// Returns: { success, data, message }

// Delete module
await deleteModule(moduleId: string)
// Returns: { success, message }

// Get all modules
await getAllModules({
  search?: string,
  page?: number,
  limit?: number
})
// Returns: { success, data: [], total: number }

// Get module with questions
await getModuleWithQuestions(moduleId: string)
// Returns: { success, data: { ...module, questions: [] } }
```

### Question Management

```javascript
// Add questions to module
await addQuestionsToModule(moduleId: string, questionIds: string[])
// Returns: { success, data, message }

// Remove question from module
await removeQuestionFromModule(moduleId: string, questionId: string)
// Returns: { success, data, message }

// Reorder questions
await reorderQuestionsInModule(moduleId: string, orderedIds: string[])
// Returns: { success, data, message }
```

---

## Dataset Functions

### Upload & Manage

```javascript
// Upload dataset file
await uploadDatasetFile(questionId: string, file: File)
// Returns: { success, data, message }

// Delete dataset
await deleteDatasetFile(datasetId: string, filePath: string)
// Returns: { success, message }

// Get datasets for question
await getQuestionDatasets(questionId: string)
// Returns: { success, data: [] }

// Get download link
await getDatasetDownloadLink(filePath: string)
// Returns: { success, url: string }
```

---

## Assessment Integration Functions

### Module Assignment

```javascript
// Select modules for assessment
await selectModulesForAssessment(assessmentId: string, moduleIds: string[])
// Returns: { success, data, message }

// Remove module from assessment
await removeModuleFromAssessment(assessmentId: string, moduleId: string)
// Returns: { success, message }

// Get assessment modules
await getAssessmentModules(assessmentId: string)
// Returns: { success, data: [] }
```

### Question Loading

```javascript
// Load questions from modules
await loadQuestionsForAssessment(assessmentId: string)
// Returns: { success, data: [] }

// Preview assessment questions
await previewAssessmentQuestions(assessmentId: string)
// Returns: { success, data: [] }
```

---

## UI Handler Functions

### Page Navigation

```javascript
showQuestionBankPage()        // Show Question Bank page
showModuleBankPage()          // Show Module Bank page
```

### Question Bank UI

```javascript
loadQuestionsPage()                       // Load and render questions
showAddQuestionModal()                    // Open add question form
editQuestion(questionId)                  // Open edit question form
deleteQuestionConfirm(questionId)         // Delete with confirmation
exportQuestions()                         // Export all questions
showImportExcelModal()                    // Open import dialog
applyQuestionFilters()                    // Apply search/filter
resetQuestionFilters()                    // Reset all filters
updateQuestionStats()                     // Update stat cards
```

### Module Bank UI

```javascript
loadModulesPage()                         // Load and render modules
showAddModuleModal()                      // Open add module form
editModule(moduleId)                      // Open edit module form
deleteModuleConfirm(moduleId)             // Delete with confirmation
previewModule(moduleId)                   // Show module preview
applyModuleFilters()                      // Apply search/filter
resetModuleFilters()                      // Reset all filters
updateModuleStats()                       // Update stat cards
```

### Modal Functions

```javascript
openModal(modalId)                        // Open any modal
closeModal(modalId)                       // Close any modal
closeQuestionModal()                      // Close question modal
closeModuleModal()                        // Close module modal
closeImportExcelModal()                   // Close import modal
```

### Pagination

```javascript
previousQuestionsPage()                   // Previous questions page
nextQuestionsPage()                       // Next questions page
previousModulesPage()                     // Previous modules page
nextModulesPage()                         // Next modules page
```

---

## Data Structures

### Question Object

```javascript
{
  id: string,                      // UUID
  title: string,
  description: string,
  question_text: string,
  question_type: string,           // MCQ, PL, TRUEFALSE, FREETEXT, ORDERED_LIST
  options: object,                 // { options: [...] }
  correct_answer: string,
  points: number,
  image_url: string | null,
  has_dataset: boolean,
  difficulty_level: string,        // easy, medium, hard
  category: string,
  tags: string[],
  created_by: string,              // User UUID
  created_at: timestamp,
  updated_at: timestamp
}
```

### Module Object

```javascript
{
  id: string,                      // UUID
  name: string,
  description: string,
  question_ids: string[],          // UUIDs of questions
  question_order: string[],        // Ordered question IDs
  total_points: number,            // Computed
  created_by: string,              // User UUID
  created_at: timestamp,
  updated_at: timestamp,
  questions?: Array                // Populated by getModuleWithQuestions()
}
```

### Dataset Object

```javascript
{
  id: string,                      // UUID
  question_id: string,
  file_name: string,
  file_path: string,               // Path in Supabase storage
  file_size: number,               // Bytes
  file_type: string,               // ext (pdf, jpg, etc)
  uploaded_by: string,             // User UUID
  uploaded_at: timestamp
}
```

### Response Object

```javascript
// Standard response format for all functions
{
  success: boolean,
  data?: any,                      // Returned data if successful
  error?: string,                  // Error message if failed
  message?: string,                // Human-readable message
  total?: number                   // For paginated responses
}
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| SUPABASE_NOT_INIT | Supabase not initialized | Load supabase-client.js first |
| AUTH_REQUIRED | User not authenticated | User must be logged in |
| INVALID_TYPE | Invalid question type | Use: MCQ, PL, TRUEFALSE, FREETEXT, ORDERED_LIST |
| MISSING_FIELD | Required field missing | Check all required fields |
| FILE_TOO_LARGE | File exceeds size limit | Compress file or reduce size |
| INVALID_FILE_TYPE | File type not supported | Use supported formats only |
| RLS_VIOLATION | Access denied by RLS policy | User doesn't have permission |
| DB_ERROR | Database error | Check Supabase dashboard |

---

## Common Usage Patterns

### Add Question with Image

```javascript
// Create question
const qResult = await addQuestion({
  title: "My Question",
  question_text: "What is...?",
  question_type: "MCQ",
  options: { options: ["A", "B", "C"] },
  correct_answer: "A",
  points: 10
});

if (qResult.success) {
  // Upload image
  const imgResult = await uploadQuestionImage(qResult.data.id, imageFile);
}
```

### Create Module with Questions

```javascript
const moduleResult = await addModule({
  name: "My Module",
  description: "Description",
  question_ids: ["id1", "id2", "id3"],
  question_order: ["id1", "id2", "id3"]
});
```

### Create Assessment from Modules

```javascript
// Select modules for assessment
const modResult = await selectModulesForAssessment(assessmentId, [modId1, modId2]);

// Load all questions from modules
const qResult = await loadQuestionsForAssessment(assessmentId);

// Preview all questions
await previewAssessmentQuestions(assessmentId);
```

### Search Questions

```javascript
const result = await searchQuestions({
  search: "leadership",
  type: "MCQ",
  difficulty: "medium",
  page: 0,
  limit: 20
});

if (result.success) {
  result.data.forEach(question => {
    console.log(question.title);
  });
}
```

### Bulk Import Questions

```javascript
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const result = await importQuestionsFromExcel(file);

console.log(`Imported: ${result.successCount}`);
console.log(`Errors: ${result.errorCount}`);
result.errors.forEach(err => {
  console.log(`Row ${err.row}: ${err.message}`);
});
```

---

## Event Handlers

### Question Bank Page Events

```javascript
// When page loads
loadQuestionsPage()

// When filters applied
applyQuestionFilters()

// When search changes
applyQuestionFilters()  // (debounced in UI)

// When pagination clicked
previousQuestionsPage() / nextQuestionsPage()

// When action clicked
showAddQuestionModal()
editQuestion(id)
deleteQuestionConfirm(id)
exportQuestions()
showImportExcelModal()
```

### Module Bank Page Events

```javascript
// When page loads
loadModulesPage()

// When filters applied
applyModuleFilters()

// When pagination clicked
previousModulesPage() / nextModulesPage()

// When action clicked
showAddModuleModal()
editModule(id)
deleteModuleConfirm(id)
previewModule(id)
```

---

## Configuration

### Adjustable Constants

```javascript
// In question_module_bank_ui.js

const questionsPerPage = 20;      // Questions per page
const modulesPerPage = 20;        // Modules per page

// In question_module_bank.js
// Supabase functions auto-detect from window.supabaseClient

// In index.html
// Storage bucket names (customizable via Supabase setup)
const questionImageBucket = 'question-images';
const datasetBucket = 'assessment-files';
```

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | Full | Latest version recommended |
| Firefox | Full | Latest version recommended |
| Safari | Full | 12+ required |
| Edge | Full | Latest version recommended |
| IE 11 | Limited | Drag-drop may not work |

---

## Performance Tips

1. **Pagination**: Always use page/limit for large result sets
2. **Search**: Use specific filters to reduce result set
3. **Images**: Compress before uploading
4. **Bulk Operations**: Split large imports into batches
5. **Caching**: Browser caches filter options automatically

---

## Security Notes

- All functions check user authentication
- RLS policies enforce access control
- File uploads validated for type and size
- No direct SQL execution
- Supabase handles all encryption

---

## Troubleshooting

### "Function not defined"
```javascript
// Check script loading order
// 1. supabase-client.js
// 2. question_module_bank.js
// 3. question_module_bank_ui.js
```

### "Supabase not initialized"
```javascript
// Call init before using functions
window.supabaseClient?.init?.();
```

### "RLS violation"
```javascript
// Check user role and database RLS policies
// Verify user_id matches
```

### "File upload fails"
```javascript
// Check storage buckets exist
// Verify CORS configuration
// Check file size limits
```

---

## Version Information

- **API Version**: 1.0
- **Last Updated**: 2024
- **Compatibility**: BECA Assessment Platform
- **Supabase Version**: 2.0+

---

## Quick Reference Links

- **User Guide**: QUESTION_MODULE_BANK_USER_GUIDE.md
- **Implementation**: QUESTION_MODULE_BANK_IMPLEMENTATION.md
- **Quick Start**: QUICK_START_INTEGRATION.md
- **Summary**: SYSTEM_DELIVERABLES_SUMMARY.md

---

**Keep this card handy for quick API lookups!**
