# Quick Start: Integrating Question & Module Bank System

This is a quick reference for integrating the Question & Module Bank System into your existing BECA Assessment app.

## 5-Minute Integration Checklist

- [ ] Execute SQL schema in Supabase
- [ ] Create storage buckets
- [ ] Add script tags to index.html
- [ ] Copy HTML components
- [ ] Update sidebar navigation
- [ ] Update showPage() function
- [ ] Test in browser

## Step 1: Database Setup (2 minutes)

### 1.1 Execute SQL Schema

1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Create new query
4. Copy and paste: `QUESTION_MODULE_BANK_SCHEMA.sql`
5. Click Run
6. Verify tables created (8 tables total)

### 1.2 Create Storage Buckets

In Supabase Storage tab:

**Bucket 1: `question-images`**
- Public bucket
- For question images

**Bucket 2: `assessment-files`**
- Private bucket
- For dataset files

## Step 2: Add Scripts (2 minutes)

### 2.1 Update index.html `<head>`

Add these lines after your existing scripts (around line 1000+):

```html
<!-- Question & Module Bank System -->
<script src="question_module_bank.js"></script>
<script src="question_module_bank_ui.js"></script>
```

**Important**: Load in this order!

## Step 3: Add HTML Components (2 minutes)

### 3.1 Copy Modal HTML

From `pages_question_module_bank.html`, copy ALL content and add to your `index.html` right before `</body>`.

The file includes:
- Page divs (question bank, module bank)
- All modals (question, module, import)
- All necessary styles

## Step 4: Update Navigation (2 minutes)

### 4.1 Add Sidebar Items

Find your sidebar navigation code and add this section (in `index.html` sidebar):

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

### 4.2 Update showPage() Function

In your main `app.js` or wherever `showPage()` is defined, update it:

```javascript
function showPage(page) {
  currentPage = page;
  const app = document.getElementById('app');
  
  // ... existing code ...
  
  else if (page === 'questionBank') {
    app.innerHTML = document.getElementById('questionBankPage')?.innerHTML || '';
    showQuestionBankPage();
  } 
  else if (page === 'moduleBank') {
    app.innerHTML = document.getElementById('moduleBankPage')?.innerHTML || '';
    showModuleBankPage();
  }
}
```

## Step 5: Test Integration

### 5.1 Verify Scripts Load

Open browser DevTools (F12) and check Console:
- No errors about missing functions
- No 404s for script files

### 5.2 Test Question Bank Page

1. Log in
2. Click "Question Bank" in sidebar
3. Should see:
   - Statistics cards
   - Search/filter panel
   - Empty questions table
   - Add Question button

### 5.3 Add Test Question

1. Click "Add Question"
2. Fill in form:
   - Title: "Test Question"
   - Type: MCQ
   - Question: "What is 2+2?"
   - Options: "2, 3, 4, 5"
   - Correct Answer: "4"
3. Click Save
4. Should appear in table

### 5.4 Create Test Module

1. Click "Module Bank" in sidebar
2. Click "Add Module"
3. Fill in form:
   - Name: "Test Module"
   - Select your test question
4. Click Save
5. Should appear in modules list

## Common Issues & Fixes

### Issue: "showQuestionBankPage is not defined"
**Fix**: Check that `question_module_bank_ui.js` is loaded in correct order

### Issue: "Supabase not initialized"
**Fix**: Ensure `supabase-client.js` loads before bank scripts

### Issue: Modals don't appear
**Fix**: Ensure HTML from `pages_question_module_bank.html` is copied completely

### Issue: Can't upload files
**Fix**: Check storage buckets created in Supabase dashboard

### Issue: Images not showing
**Fix**: Verify `question-images` bucket is public

## Files to Copy

| File | Destination | Action |
|------|-------------|--------|
| `QUESTION_MODULE_BANK_SCHEMA.sql` | Supabase | Execute in SQL Editor |
| `question_module_bank.js` | Project root | Link in `<script>` |
| `question_module_bank_ui.js` | Project root | Link in `<script>` |
| `pages_question_module_bank.html` | index.html | Copy content before `</body>` |

## After Integration

### Update Assessment Creation (Optional)

If you want new assessments to use modules instead of direct questions:

```javascript
async function createAssessmentFromModules(assessmentDetails, moduleIds) {
  // Create assessment
  const assessment = await createAssessment(assessmentDetails);
  
  // Assign modules
  await selectModulesForAssessment(assessment.id, moduleIds);
  
  // Questions auto-load
  const questions = await loadQuestionsForAssessment(assessment.id);
  
  return assessment;
}
```

### User Guide

Share with team:
- `QUESTION_MODULE_BANK_USER_GUIDE.md` - For trainers/admins

### Admin Resources

For IT/developers:
- `QUESTION_MODULE_BANK_IMPLEMENTATION.md` - Detailed integration
- This file - Quick reference

## What's New in the App

### For Administrators

✓ Create reusable question banks  
✓ Organize questions into modules  
✓ Import questions from Excel  
✓ Upload supporting datasets  
✓ Manage images for questions  

### For Assessment Designers

✓ Build assessments from modules  
✓ Reuse content across assessments  
✓ Maintain consistency  
✓ Speed up assessment creation  

### For Trainees

✓ Same assessment experience  
✓ Access to datasets during test  
✓ Better question variety  

## Next Steps

1. **Test thoroughly** with your team
2. **Import existing questions** if applicable
3. **Create question templates** for your organization
4. **Train users** on new features
5. **Monitor usage** and gather feedback

## Performance Notes

- Pagination: 20 items per page (configurable)
- Search: Indexed for speed
- File uploads: Stored securely in Supabase
- Caching: Implemented where beneficial

## Support

If you run into issues:

1. Check browser console (F12) for errors
2. Verify Supabase connection
3. Check storage bucket names
4. Review RLS policies in Supabase
5. Check that all files are properly linked

## Example Excel Import File

Create a file named `questions.csv`:

```
Title,Type,Description,Points,Category,Difficulty,Question Text,Correct Answer,Options,Tags
"Leadership Basics","MCQ","Introduction",10,"Leadership","easy","What is a leader?","Someone who guides others","Someone who guides others,Someone who follows orders,Someone who works alone","leadership,basics"
"Project Timeline","ORDERED_LIST","Sequence",15,"Project Management","medium","Arrange in correct order","Plan,Execute,Monitor,Close","Plan,Execute,Monitor,Close,Report","pm,sequence"
```

## Frequently Asked

**Q: Will existing assessments still work?**  
A: Yes! New system is backward compatible.

**Q: Can I use both old and new systems?**  
A: Yes! You can gradually migrate.

**Q: How many questions can I store?**  
A: Unlimited (storage-dependent, typically thousands).

**Q: Can trainees see the Question Bank?**  
A: No. It's admin/trainer only.

**Q: Can I back up questions?**  
A: Yes. Export to Excel anytime.

---

## Success Indicators

After integration, you should be able to:

✓ Add questions via UI  
✓ Search and filter questions  
✓ Create modules  
✓ Preview modules  
✓ Upload images  
✓ Upload datasets  
✓ Import from Excel  
✓ Export to Excel  

If all work, integration is successful!

---

**Need detailed info?** See `QUESTION_MODULE_BANK_IMPLEMENTATION.md`  
**Need user help?** See `QUESTION_MODULE_BANK_USER_GUIDE.md`

**Happy assessing!**
