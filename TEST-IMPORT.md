# Debugging: All Questions Failed to Import

## Quick Diagnostics

Open browser console (F12 → Console tab) and run this:

```javascript
// Test 1: Check if getSupabaseClient works
const client = await getSupabaseClient();
console.log('Supabase client:', client ? '✅ Working' : '❌ Failed');

// Test 2: Check if assessment exists
const assessmentId = 'YOUR_ASSESSMENT_ID'; // Replace with the ID you selected
const { data: assess } = await client
  .from('assessments')
  .select('*')
  .eq('id', assessmentId)
  .single();
console.log('Assessment:', assess ? '✅ Found' : '❌ Not found');

// Test 3: Try inserting ONE test question
const testQuestion = {
  assessment_id: assessmentId,
  question_text: 'Test Question',
  question_type: 'mcq',
  correct_answer: 'A',
  list_options: JSON.stringify(['A', 'B', 'C']),
  difficulty: 'Easy'
};

const { data: result, error } = await client
  .from('assessment_questions')
  .insert([testQuestion])
  .select();

console.log('Insert result:', result);
console.log('Insert error:', error);
```

## What to look for in Console

When you click "Process & Import", you should see:

```
🔘 Import button clicked
🔘 startImport() called
✅ Assessment selected: abc123xyz...
🚀 Starting import of yourfile.xlsx to assessment: abc123xyz...
📊 Found 94 rows
Parsing Excel...
✅ Processed: 94 valid questions
Importing 1/94...
Importing 2/94...
[etc]
✅ IMPORT COMPLETE: X/94 questions imported
```

## Common Failure Reasons

### 1. Missing assessment_id in questions
**Error in console:** `Could not find the 'assessment_id'...`
**Fix:** Make sure you selected an assessment from the dropdown

### 2. Wrong column names being sent
**Error:** `Could not find the 'all_options'...` or similar
**Fix:** This should be fixed now, but check if list_options is being sent

### 3. Assessment doesn't exist
**Error:** Foreign key constraint error
**Check:** Make sure the assessment ID actually exists

### 4. Excel file format issue
**Error:** `No valid questions found`
**Check:** Does your Excel file have the right columns?

## Minimum Excel Columns Required

| Column | Example |
|--------|---------|
| Question Text | "What is 2+2?" |
| Question Type | "mcq" or "Multiple Choice" |
| Correct Answer | "4" |

Optional but helpful:
- Difficulty: "Easy", "Medium", "Hard"
- Category: "Math", "Science", etc.

## Check These First

1. **Do you have assessments created?**
   ```javascript
   const { data } = await getSupabaseClient().from('assessments').select('*');
   console.log('Assessments:', data);
   ```

2. **Can you manually create a question?**
   - Go to Question Bank → Add Question
   - Try creating one question manually
   - If that works, the database is fine

3. **Is your Excel file valid?**
   - Open it in Excel
   - Check that all columns have headers
   - Check that there's actual data in the rows
   - Try with just 3 questions first

## Step-by-Step Import Test

1. Create 1 assessment
2. Try importing with just 3 test questions
3. Check console for exact error
4. If 3 work, try with 10
5. If 10 work, try with all 94

This will help narrow down if it's a file issue or a database issue.

## Report Back With

When asking for help, please provide:
1. Screenshot of the error in console
2. How many assessments you have
3. How many rows in your Excel file
4. What the first few rows of your Excel file look like
