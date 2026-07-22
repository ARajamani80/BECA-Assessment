# BECA Assessment Platform - Quick Start Guide

## Overview
This guide will help you set up and deploy the enhanced BECA Assessment Platform quickly.

---

## Prerequisites

Before starting, ensure you have:
- ✅ Supabase account (https://supabase.com)
- ✅ Git installed
- ✅ Node.js 16+ (for backend, if needed)
- ✅ Browser (Chrome, Firefox, Safari, or Edge)
- ✅ Text editor (VS Code recommended)

---

## Step 1: Set Up Supabase Database

### 1.1 Create Tables
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire content from `DATABASE_SETUP.sql`
4. Paste into the SQL Editor
5. Click "Run" button
6. Wait for completion (should see "Success" message)

### 1.2 Create Storage Bucket
1. Go to Storage section in Supabase dashboard
2. Click "Create new bucket"
3. Name it: `assessment-files`
4. Uncheck "Public bucket" (to require authentication)
5. Click "Create bucket"

### 1.3 Verify Setup
- Check SQL Editor: Run `SELECT COUNT(*) FROM assessments;`
- Should return 0 (empty table)
- Check Storage: Should see `assessment-files` bucket in list

---

## Step 2: Configure Supabase Credentials

### 2.1 Get Your Credentials
1. In Supabase dashboard, go to Settings > API
2. Copy your **Project URL** (looks like: `https://your-project.supabase.co`)
3. Copy your **Anon Public Key** (starts with `eyJhbGc...`)

### 2.2 Update index.html
1. Open `index.html` in text editor
2. Find these lines (around line 494-495):
   ```javascript
   const SUPABASE_URL = 'https://fgzqgqwlyeubudnbxsmx.supabase.co';
   const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```
3. Replace with your credentials:
   ```javascript
   const SUPABASE_URL = 'YOUR_PROJECT_URL';
   const SUPABASE_KEY = 'YOUR_ANON_KEY';
   ```
4. Save file

---

## Step 3: Set Up Authentication Users

### 3.1 Create Test Users
1. Go to Supabase Auth section
2. Click "Create user" or "Add user"
3. Create at least these users:

**User 1 (Trainer/Admin)**
- Email: `trainer@example.com`
- Password: `Test123!`
- Role: trainer (add in profiles table)

**User 2 (Trainee)**
- Email: `trainee@example.com`
- Password: `Test123!`
- Role: user (add in profiles table)

### 3.2 Add User Profiles
1. Go to SQL Editor
2. Run this query:
   ```sql
   INSERT INTO profiles (id, email, full_name, user_role)
   SELECT id, email, SPLIT_PART(email, '@', 1), 'trainer'
   FROM auth.users
   WHERE email = 'trainer@example.com'
   ON CONFLICT DO NOTHING;

   INSERT INTO profiles (id, email, full_name, user_role)
   SELECT id, email, SPLIT_PART(email, '@', 1), 'user'
   FROM auth.users
   WHERE email = 'trainee@example.com'
   ON CONFLICT DO NOTHING;
   ```
3. Execute the query

---

## Step 4: Deploy the Application

### Option A: Local Development (Recommended for Testing)

1. **Open index.html locally**
   ```bash
   # Navigate to project folder
   cd path/to/BECA-Assessment
   
   # Open in browser (Python 3.x)
   python -m http.server 8000
   
   # Or with Node.js
   npx http-server
   ```
   Then visit: `http://localhost:8000`

2. **Test login**
   - Email: `trainer@example.com`
   - Password: `Test123!`
   - Should see Dashboard

### Option B: Deploy to Netlify (Production)

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Add enhanced assessment platform"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://netlify.com
   - Click "Add new site"
   - Select "Import an existing project"
   - Choose your GitHub repository
   - Click "Deploy site"

3. **Set environment variables** (if needed)
   - In Netlify: Settings > Build & Deploy > Environment
   - Add: `SUPABASE_URL`, `SUPABASE_KEY`

4. **Custom domain** (optional)
   - Go to Site settings > Domain management
   - Add custom domain

---

## Step 5: Create Your First Assessment

### 5.1 Login
1. Open the application
2. Login with trainer account
3. You should see Dashboard

### 5.2 Create Assessment
1. Click "Create New" in sidebar
2. Fill in details:
   - Title: "JavaScript Basics"
   - Description: "Learn JavaScript fundamentals"
   - Duration: 60 minutes
   - Passing Score: 70%
3. Click "Create Assessment"

### 5.3 Add Modules
1. Click "Add Module"
2. Enter:
   - Name: "Variables"
   - Description: "JavaScript variables"
3. Click "Save Module"
4. Repeat for more modules

### 5.4 Add Questions
1. Click "Add Question" in module
2. Select type: "Multiple Choice (MCQ)"
3. Enter question text
4. Add 4 options, mark correct one
5. Set points: 10
6. Click "Save Question"
7. Repeat for more questions

### 5.5 Publish Assessment
1. Click "Publish Assessment"
2. Click "Send to Trainees"
3. Select assessment
4. Select trainees to send to
5. Click "Send to Selected Trainees"

---

## Step 6: Test as Trainee

### 6.1 Login as Trainee
1. Logout from current account
2. Login with trainee account:
   - Email: `trainee@example.com`
   - Password: `Test123!`

### 6.2 View Assessments
1. Should see "Dashboard"
2. Should see assigned assessments
3. Try "Assessments" in sidebar to view list

---

## Step 7: Manage Users

### 7.1 Access User Management
1. Login with trainer/admin
2. Click "Users" in sidebar
3. See all users and their roles

### 7.2 Change User Roles
1. Click "Edit" on any user
2. Select new role from list
3. Confirm change

---

## Common Troubleshooting

### "Cannot fetch assessments" Error

**Problem**: API returns error or empty data

**Solutions**:
1. Verify database tables created successfully
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. Check Supabase credentials in `index.html`

3. Verify RLS policies aren't blocking access:
   ```sql
   SELECT * FROM assessments LIMIT 1;
   ```

4. Check browser console (F12) for detailed errors

### "Login Failed" Error

**Problem**: Cannot login with credentials

**Solutions**:
1. Verify user exists in Supabase Auth
2. Check password is correct
3. Ensure profile record exists
4. Check for any RLS blocking

### "Modal not closing" Bug

**Problem**: Modal stays open after action

**Solutions**:
1. Hard refresh page (Ctrl+Shift+R)
2. Check browser console for JavaScript errors
3. Try in different browser
4. Clear browser cache

### "Files not uploading" Issue

**Problem**: File upload fails

**Solutions**:
1. Check storage bucket exists
2. Verify bucket is not public
3. Check file size (< 50MB)
4. Verify file type is allowed
5. Check bucket name is `assessment-files`

---

## Performance Tips

### 1. Database Optimization
- Create indexes on frequently queried columns (already done)
- Use views for complex queries
- Archive old assessments regularly

### 2. File Management
- Limit file size to 50MB
- Clean up unused files from storage
- Use subdirectories in bucket for organization

### 3. Caching
- Add browser caching headers
- Cache assessment data on first load
- Implement service worker for offline

### 4. Query Optimization
- Limit assessment list to 20 per page
- Use pagination for results
- Filter by status (published, draft, etc.)

---

## Security Checklist

- ✅ Change test passwords before production
- ✅ Enable RLS on all tables
- ✅ Use HTTPS only (Netlify auto-enables)
- ✅ Set storage bucket to private
- ✅ Review user roles regularly
- ✅ Enable Supabase audit logging
- ✅ Set up CORS properly
- ✅ Sanitize file uploads
- ✅ Rate limit API calls
- ✅ Regular database backups

---

## Monitoring & Maintenance

### Weekly Tasks
- Check failed logins in Supabase Auth
- Review storage usage
- Monitor API performance

### Monthly Tasks
- Audit user access logs
- Clean up archived assessments
- Update assessment content as needed
- Review and fix bugs

### Quarterly Tasks
- Security audit
- Performance optimization
- Backup database
- Update dependencies

---

## Scaling for Production

### When to Scale
- Users: > 100 active users
- Assessments: > 50 live assessments
- Submissions: > 10,000 per day

### Scaling Options
1. **Database**: Enable Supabase replication
2. **Storage**: Increase bucket size or split buckets
3. **API**: Use Netlify Edge Functions
4. **Frontend**: Add CDN (Cloudflare)
5. **Caching**: Implement Redis cache

---

## Advanced Features (Future)

### Ready to Implement
1. ✅ Timer-based assessments
2. ✅ File uploads for questions
3. ✅ Assessment templates
4. ✅ Bulk import/export

### Planned
- [ ] AI-based grading
- [ ] Proctoring integration
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Video submission questions
- [ ] Peer review

---

## Getting Help

### Resources
- Supabase Docs: https://supabase.com/docs
- Forum: https://github.com/supabase/supabase/discussions
- Discord: https://discord.com/invite/bnncdQnDTz

### Support
- Check FEATURES.md for detailed information
- Review DATABASE_SETUP.sql for schema
- Check browser console for errors
- Run test queries in SQL Editor

---

## Next Steps

1. ✅ Complete all 7 setup steps above
2. ✅ Test with sample data
3. ✅ Create your assessments
4. ✅ Add trainees
5. ✅ Send assessments
6. ✅ Monitor results
7. ✅ Iterate and improve

---

## Feedback & Improvements

This platform is continuously being improved. To request features:

1. Document the feature
2. Explain the use case
3. Suggest implementation approach
4. Submit as GitHub issue or contact team

---

## Version Information

- **Current Version**: 1.0
- **Last Updated**: 2024
- **Status**: Production Ready
- **Support Level**: Active Development

---

Good luck with your BECA Assessment Platform! 🚀
