# BECA Assessment Platform - Quick Setup Guide

Your app is ready! Follow these steps to get it live.

## ✅ What's Included

- ✨ Modern UI with sidebar showing user profile at bottom
- 📝 Assessment builder (create assessments with modules & questions)
- ❓ 4 question types: MCQ, Essay, True/False, File Upload
- 👥 Send assessments to trainees
- 📊 View results and analytics
- ⏱️ Timer framework for timed assessments

## 🚀 Quick Start (5 Steps)

### Step 1: Set Up Database (Supabase) - 2 minutes

1. Go to: https://app.supabase.com
2. Open your project: `BECA-Assessment` or `fgzqgqwlyeubudnbxsmx`
3. Click **SQL Editor** (left menu)
4. Click **New Query**
5. Copy all code from `DATABASE_SCHEMA.sql`
6. Paste into editor
7. Click **Run** ▶️
8. Wait for success ✓

**Check it worked:**
- Go to **Database** → **Tables**
- Should see: assessments, assessment_modules, assessment_questions, etc.

---

### Step 2: Create Storage Bucket - 1 minute

1. In Supabase, go to **Storage** (left menu)
2. Click **+ New bucket**
3. Name it: `assessment-files`
4. Keep it **Private** (RLS will control access)
5. Click **Create bucket**

---

### Step 3: Test Locally - 2 minutes

1. Open `index.html` in your browser (or use a local server):
   ```bash
   # Option A: Python (built-in)
   cd "C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment"
   python -m http.server 8000
   
   # Then visit: http://localhost:8000
   ```

2. **Login** with a test account:
   - Email: `ashok@djbh-global.com`
   - Password: (your Supabase password)

3. You should see:
   - Dashboard with stats
   - Sidebar with **your name and role** at bottom ✓
   - Menu: Assessments, Create New, Send to Trainees, Results

4. **Test creating an assessment:**
   - Click **Create New**
   - Fill in: Title, Description, Duration (90 min), Pass Score (60%)
   - Click **Create Assessment**
   - Click **Edit** on the new assessment
   - Add a Module
   - Add Questions (try different types)
   - Click **Publish Assessment**

5. **Check results:**
   - Go to **Results** page
   - Should show submission tracking

---

### Step 4: Deploy to Netlify - 5 minutes

1. **Push to GitHub:**
   ```bash
   cd "C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment"
   git add .
   git commit -m "Add BECA Assessment Platform with all features"
   git push origin main
   ```

2. **Deploy on Netlify:**
   - Go to: https://app.netlify.com
   - Click **Add new site** → **Import an existing project**
   - Choose **GitHub**
   - Select: `BECA-Assessment` repo
   - Build settings:
     - Build command: *(leave empty)*
     - Publish directory: `.` (current folder)
   - Click **Deploy site**

3. **Wait 1-2 minutes** for deployment ✓

4. You'll get a URL like: `https://beca-assessment-xyz.netlify.app`

---

### Step 5: Set Environment Variables (Optional but Recommended)

If Supabase credentials aren't loading:

1. In Netlify, go to your site
2. Click **Site settings** → **Build & deploy** → **Environment**
3. Click **Edit variables**
4. Add:
   ```
   Key: SUPABASE_URL
   Value: https://fgzqgqwlyeubudnbxsmx.supabase.co
   
   Key: SUPABASE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnenFncXdseWV1YnVkbmJ4c214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTc5NTIsImV4cCI6MjA5NDk5Mzk1Mn0.J6lWx23ukNGihKgLtdCeoq4WOR75eSFyGYrb6_YS9q0
   ```
5. Click **Save**
6. Go to **Deploys** → **Trigger deploy** → **Deploy site**

---

## 🎯 Key Features to Test

| Feature | How to Test |
|---------|-----------|
| **User Profile** | Login and look at sidebar bottom - should show your name + role badge |
| **Create Assessment** | Create New → Fill form → Click Create |
| **Add Modules** | Edit Assessment → Add Module → Name it |
| **Add Questions** | Click "Add Question" on module → Select type → Fill details |
| **Question Types** | Try MCQ (with options), Essay, True/False, File Upload |
| **Send to Trainees** | Send to Trainees → Select assessment → Select trainees → Send |
| **View Results** | Results page shows all submissions |
| **Dashboard** | Shows stats: total assessments, submissions, pass rate, unique students |

---

## 🔗 Your Credentials

**Supabase Project:**
- URL: `https://fgzqgqwlyeubudnbxsmx.supabase.co`
- Key: *(embedded in index.html)*

**Database:**
- Tables: assessments, assessment_modules, assessment_questions, assessment_results, assessment_assignments
- Storage: assessment-files bucket

**Test Account:**
- Email: `ashok@djbh-global.com`
- Password: *(your password)*

---

## ⚠️ Common Issues & Fixes

### "Blank page" or "Cannot read property supabase"
- Supabase library not loaded
- Solution: Check browser console (F12 → Console)
- Verify URL and key in index.html lines 874-875

### "Login fails"
- Wrong credentials
- User doesn't exist in Supabase Auth
- Solution: Create account in Supabase Auth or use existing test account

### "Assessments not loading"
- Database tables don't exist
- Solution: Run DATABASE_SCHEMA.sql in Supabase SQL Editor

### "Can't see user profile at bottom"
- User data not fetched
- Solution: Check browser console for errors
- Verify profiles table has data

### "Send to Trainees not working"
- Table doesn't exist or RLS policy blocking
- Solution: Run DATABASE_SCHEMA.sql again to ensure all tables created

---

## 📋 Checklist

- [ ] Run DATABASE_SCHEMA.sql in Supabase
- [ ] Create assessment-files storage bucket
- [ ] Test login locally
- [ ] Create test assessment
- [ ] Add modules and questions
- [ ] Verify user profile shows at sidebar bottom
- [ ] Send assessment to test trainee
- [ ] Push to GitHub
- [ ] Deploy to Netlify
- [ ] Test live URL works
- [ ] Share with team!

---

## 🎓 Next Steps (After Setup)

1. **Add more test data:**
   - Create 2-3 assessments
   - Add 50-100 test questions
   - Assign to 5-10 trainees

2. **Enable file uploads:**
   - Add Revit/DWG files to questions
   - Test download links for trainees

3. **Set up timer:**
   - Uncomment timer code in assessment taking view
   - Set countdown to show warnings

4. **Add email notifications:**
   - Integrate SendGrid or Mailgun
   - Send assignment notifications to trainees

5. **Analytics dashboard:**
   - Add charts to Reports page
   - Track performance trends

---

## 📞 Help

- **Supabase Docs:** https://supabase.io/docs
- **Netlify Docs:** https://docs.netlify.com
- **Check browser console:** F12 → Console tab for errors

---

**You're all set! Start with Step 1 and work through to Step 5.** 🚀
