# BECA Assessment Platform - Complete Workflow Guide

## 1️⃣ ACCESS THE PLATFORM

**Admin Dashboard:**
- URL: `https://becaskill-assessment.netlify.app/`
- Login with your credentials
- You'll see the sidebar with all modules

**Assessment Taker (via Token):**
- Get a token from database or from admin interface
- Visit: `https://becaskill-assessment.netlify.app/?token=YOUR_TOKEN_HERE`
- Takes assessment without login

---

## 2️⃣ CREATE AN ASSESSMENT

**Step-by-step:**

1. **Click Sidebar** → "Assessments"
2. **Click Button** → "+ Create Assessment"
3. **Fill Form:**
   - **Title** - e.g., "AutoCAD Basics"
   - **Description** - Assessment details
   - **Duration** - Time in minutes (e.g., 30)
   - **Passing Score** - Pass percentage (e.g., 60%)
4. **Click** → "Save Assessment"
5. ✅ Assessment created (status: Draft)

---

## 3️⃣ ADD MODULES TO ASSESSMENT

**Step-by-step:**

1. **Click Sidebar** → "Module Bank"
2. **Click Button** → "+ Create Module"
3. **Fill Form:**
   - **Module Name** - e.g., "Basic Commands"
   - **Description** - Module details
   - **Assessment** - Select your assessment from dropdown
4. **Click** → "Save Module"
5. ✅ Module added to assessment

---

## 4️⃣ ADD QUESTIONS TO MODULE

**Step-by-step:**

1. **Click Sidebar** → "Question Bank"
2. **Click Button** → "+ Add Question"
3. **Fill Form:**
   
   **IMPORTANT:** When you change "Question Type", the form updates to show relevant fields

   **Question Type Options:**
   
   - **MCQ** (Multiple Choice)
     - Select type → MCQ appears
     - Add options (A, B, C, D, E)
     - Mark one as correct
   
   - **T/F** (True/False)
     - Select type → Radio buttons appear
     - Select True or False as correct
   
   - **PL** (Pick List/Dropdown)
     - Select type → List options field appears
     - Add options (one per line)
     - Select correct option
   
   - **OL** (Ordered List/Ranking)
     - Select type → Ranking items field appears
     - Add items to rank
     - Set correct order
   
   - **SA** (Short Answer)
     - Select type → Answer field appears
     - Enter expected answer
     - Add keywords for partial matching
   
   - **EA** (Essay)
     - Select type → Word limits appear
     - Set min/max words
   
   - **FT** (File Upload)
     - Select type → File types field appears
     - Set allowed file types (.dwg, .rvt, etc.)

4. **Set Points** - Points for this question
5. **Select Module** - Which module this belongs to
6. **Click** → "Save Question"
7. ✅ Question added to module

---

## 5️⃣ SEND ASSESSMENT TO TRAINEES

**Step-by-step:**

1. **Click Sidebar** → "Send to Trainees"
2. **Select Assessment** - From dropdown
3. **Add Trainees** - Email addresses
4. **Click** → "Generate Tokens & Send Emails"
5. ✅ Trainees receive email with unique link
6. They click link and take assessment

---

## 6️⃣ TRAINEE TAKES ASSESSMENT

**What happens:**
- Trainee clicks email link or visits URL with token
- Assessment interface loads (no login needed)
- Questions display based on type
- Timer counts down
- Auto-saves every 30 seconds
- Submit when complete

**Scoring:**
- Each question has points
- System auto-calculates total
- Pass/Fail determined by passing_score %

---

## 7️⃣ GRADE SUBMISSIONS

**Step-by-step:**

1. **Click Sidebar** → "Grade Submissions"
2. **Select Assessment** - From dropdown
3. **View Submissions** - List shows:
   - Trainee name
   - Email
   - Status (Submitted, Graded, In Progress)
   - Score (if graded)
4. **Click** → "Grade" button
5. **Grade Modal Opens** showing:
   - Taker info
   - All answers submitted
   - Score field (0-100)
   - Pass/Fail selector
   - Feedback/notes
6. **Enter Score** - Assign points
7. **Select Pass/Fail** - Based on score vs passing_score
8. **Add Notes** - Optional feedback
9. **Click** → "Save Grade"
10. ✅ Grade saved, status changes to "Graded"

---

## 🔧 TROUBLESHOOTING

### Question type fields not showing?
- Make sure to click in the "Question Type" dropdown
- Wait for form to update (smooth transition)
- Check browser console (F12) for errors

### Token not working?
- Verify token exists in database:
  ```sql
  SELECT token, assessment_id FROM assessment_takers LIMIT 1;
  ```
- Assessment must have non-null assessment_id
- Clear browser cache and retry

### Submissions showing "Access Error"?
- Check RLS policies in Supabase:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'assessment_submissions';
  ```
- Should have SELECT, INSERT, UPDATE policies

### Auto-scoring not working?
- Each question needs "Points" set
- System sums all points automatically
- Passing score determined by percentage vs total

---

## 📊 AUTO-SCORING DETAILS

**How it works:**
1. Each question has **Points** value
2. Trainee answers question
3. Answer stored in database
4. When grading:
   - Instructor reviews answer
   - Sets score (0-100)
   - Passes/Fails based on percentage
5. Example:
   - 10 questions × 10 points each = 100 total
   - Passing score = 60%
   - If trainee gets 7 questions right = 70 points → PASS ✅

---

## 📝 BEST PRACTICES

1. **Create assessments first** - Before creating modules
2. **Group questions by module** - Organize by topic
3. **Set realistic points** - Each question should have fair weight
4. **Use passing score wisely** - Default 60% for most cases
5. **Add detailed descriptions** - Help trainees understand
6. **Test with sample taker** - Before sending to real trainees

---

## 🚀 QUICK START (5 MINUTES)

```
1. Login → Dashboard
2. Assessments → Create new (5 min duration, 60% passing)
3. Module Bank → Add module (name it, select assessment)
4. Question Bank → Add 5 questions (assign to module)
5. Send to Trainees → Select assessment, add test email
6. Test with token link
7. Grade Submissions → Grade the test submission
```

---

Done! You now have a complete assessment workflow! 🎉
