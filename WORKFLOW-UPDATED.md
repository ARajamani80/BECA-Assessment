# Workflow Updated: Standalone Questions & Modules

## New Workflow

### ✅ Step 1: Create Standalone Questions
**Question Bank** - Import or create questions independently
- No assessment required
- No module required
- Questions are standalone in the Question Bank
- Can have: text, type, options, keywords, difficulty, category, tags

### ✅ Step 2: Create Standalone Modules  
**Module Bank** - Create modules and add questions to them
- No assessment required yet
- Just organize questions into modules
- Can reuse modules across different assessments

### ✅ Step 3: Link Modules to Assessment
**Assessment** - Create assessment and add modules
- Select which modules to include
- Assessment is the final container
- Trainees take the assessment

### ✅ Step 4: Send to Trainees
**Send Trainees** - Create taker links
- Send assessment to trainees
- They access via unique token
- Can take assessment, download files, etc.

---

## What Changed in Code

### 1. Removed Assessment Selection from Import
**Before:** Import modal asked "Select which assessment"
**Now:** Just upload Excel → Questions go to Question Bank

### 2. Made assessment_id Nullable
**Migration 005** - Allows questions to exist without an assessment
```sql
ALTER TABLE assessment_questions ALTER COLUMN assessment_id DROP NOT NULL;
```

### 3. Questions are Standalone
**Import Process:**
- Read Excel file
- Validate questions
- Insert WITHOUT assessment_id
- Questions appear in Question Bank

---

## Steps to Deploy

### 1. Run Migration in Supabase
Go to Supabase Dashboard → SQL Editor:

```sql
-- Make assessment_id nullable so questions are standalone
ALTER TABLE assessment_questions
ALTER COLUMN assessment_id DROP NOT NULL;
```

### 2. Push Code Changes to GitHub
```bash
cd "C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment"
bash upload-to-git.sh
```

Choose `y` when asked to commit and push.

### 3. Wait for Netlify Deploy
- GitHub push triggers Netlify auto-deploy
- Wait 1-2 minutes
- Hard refresh browser (Ctrl+Shift+R)

---

## Test the New Workflow

### 1. Import Questions (No Assessment Needed!)
- Go to Question Bank
- Click "Import Excel"
- **NO assessment dropdown anymore**
- Just select file and click "Process & Import"
- Questions appear in Question Bank

### 2. Create Module
- Go to Module Bank
- Click "Create Module"
- Add questions to the module
- Save

### 3. Create Assessment
- Go to Assessments
- Click "Create Assessment"
- Add modules to it
- Save

### 4. Send to Trainees
- Go to "Send Trainees"
- Select assessment
- Send to email addresses

---

## Changes Made to Files

| File | Change |
|------|--------|
| `js/excel-import.js` | Removed assessment selection, simplified workflow |
| `js/api.js` | Added JSON parsing for options/items |
| `js/questions.js` | Added dataset file upload |
| `migrations/005_make_assessment_id_nullable.sql` | New migration |

---

## Benefits of New Workflow

✅ Questions are reusable across multiple assessments
✅ Modules can be shared and updated independently
✅ Import doesn't require creating assessment first
✅ Question Bank is the source of truth
✅ More flexible assessment building

---

## Next Steps

1. **Run migration** in Supabase (copy/paste SQL above)
2. **Push code** with `bash upload-to-git.sh`
3. **Hard refresh** browser
4. **Test import** with your 94 questions
5. **Report results** - let me know if it works!
