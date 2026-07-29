# Complete Fix Guide - MCQ & Ordered List Questions

## Problem
MCQ and Ordered List questions are not showing options/items as separate fields.

## Solution Steps

### Step 1: Deploy Latest Code
```bash
cd "C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment"
bash upload-to-git.sh
```

Choose `y` when asked to commit and push.

**Wait 2 minutes for Netlify deployment**

### Step 2: Hard Refresh Browser
- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

Or right-click refresh button → "Empty cache and hard refresh"

### Step 3: Open Developer Console
- Press `F12`
- Go to **Console** tab
- Clear any old logs with `console.clear()`

### Step 4: Delete ALL Old Questions
Copy and paste this in the console:

```javascript
// DELETE ALL OLD QUESTIONS
const result = await getSupabaseClient()
  .from('assessment_questions')
  .delete()
  .neq('id', null);

console.log('✅ Deleted all questions');
```

Then press Enter and wait for completion.

### Step 5: Go to Question Bank
1. Refresh the page
2. Navigate to **Question Bank**
3. Should be empty now

### Step 6: Re-Import Excel File
1. Click **"Import Excel"** button
2. Select your Excel file with 94 questions
3. Click **"Process & Import"**

### Step 7: Watch the Console
You should see logs like:

```
✅ Processed: 94 valid questions
Importing 1/94...
✅ MCQ (Q1008649): 5 options - F1 | F2 | F3 | F4 | F5
✅ MCQ (Q1008650): 10 options - ...
✅ Ordered List: 4 items
📋 T/F (Q...): correct = true
🔄 Normalizing Q... (mcq)
✅ Parsed options: ["F1", "F2", "F3", "F4", "F5"]
✅ Converting 5 string options to objects
```

### Step 8: Edit a Question
Click on any MCQ question to edit it.

You should now see:
- **Option 1** (with F1) - marked correct if applicable
- **Option 2** (with F2)
- **Option 3** (with F3)
- etc. (all separate input boxes)

### Step 9: Check Ordered List Questions
Click on an Ordered List question.

You should see:
- **1.** Item text
- **2.** Item text
- **3.** Item text
- etc. (all separate fields with numbers)

### Step 10: Check True/False Questions
Click on a True/False question.

You should see:
- **True** radio button
- **False** radio button
- One of them marked as correct

---

## If Still Not Working

**In the console, run this to test:**

```javascript
// Test 1: Check raw database data
const q = await getSupabaseClient()
  .from('assessment_questions')
  .select('*')
  .eq('question_type', 'mcq')
  .limit(1)
  .single();

console.log('Raw DB options:', q.data.options);
console.log('Raw DB type:', typeof q.data.options);

// Test 2: Check after normalization
const normalized = normalizeQuestionData(q.data);
console.log('Normalized options:', normalized.options);
console.log('Normalized length:', normalized.options?.length);
```

**Screenshot the console output and share it.**

---

## Summary

The issue is that old questions in the database have the wrong format. 

**New Code** → Parses options correctly ✅
**Old Data** → Still in wrong format ❌

**Solution:** Delete everything and re-import with fixed code.
