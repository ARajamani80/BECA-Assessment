# Email Sending Implementation Checklist

This checklist guides you through implementing and verifying the email sending functionality for BECA Assessment Platform.

## Pre-Implementation (5 minutes)

- [ ] Review the `EMAIL_SETUP.md` guide
- [ ] Ensure you have admin access to SendGrid, Netlify, and Supabase
- [ ] Have a test email account ready (personal email or test service like Mailinator)
- [ ] Read this entire checklist

## Step 1: SendGrid Account Setup (10 minutes)

### Create Account
- [ ] Go to https://sendgrid.com
- [ ] Click "Sign Up"
- [ ] Complete registration form
  - [ ] Email address
  - [ ] Password
  - [ ] Company (DJBH Global)
  - [ ] Plan (select "Free")
- [ ] Verify email (check inbox for verification link)
- [ ] Complete account setup
  - [ ] Sender information
  - [ ] Use case selection (Assessment platform)

### Create API Key
- [ ] Log in to SendGrid dashboard
- [ ] Navigate to **Settings > API Keys**
- [ ] Click **Create API Key**
  - [ ] Name: `BECA-Assessment-Production`
  - [ ] Permission level: **Full Access** (for now)
- [ ] Copy the API key to a text file temporarily
  - [ ] Important: You won't be able to view it again!
- [ ] Note where the key is stored

### Verify Sender Email
- [ ] Go to **Settings > Sender Authentication**
- [ ] Click **Verify a Single Sender** (or **Create a Sender**)
- [ ] Enter sender details:
  - [ ] Email: `bimacademy@djbh-global.com`
  - [ ] Sender name: `BECA Assessment Platform`
  - [ ] Organization: `DJBH Global`
- [ ] Complete verification:
  - [ ] Check email for verification link
  - [ ] Click verification link
  - [ ] Confirmation shows in SendGrid dashboard

## Step 2: Netlify Environment Variables (5 minutes)

### Add Environment Variables
- [ ] Log in to Netlify dashboard
- [ ] Go to your BECA Assessment site
- [ ] Click **Site settings** (top navigation)
- [ ] Click **Build & deploy** in left sidebar
- [ ] Click **Environment** section
- [ ] Click **Edit variables** button

### Configure Variables
- [ ] Add each variable and its value:

```
SENDGRID_API_KEY = <your_api_key_from_sendgrid>
```

- [ ] Copy from SendGrid (Step 1 above)
- [ ] Paste into Netlify value field

```
SENDGRID_FROM_EMAIL = bimacademy@djbh-global.com
```

- [ ] Use the verified sender email

```
SUPABASE_URL = https://fgzqgqwlyeubudnbxsmx.supabase.co
```

- [ ] From your Supabase project settings

```
SUPABASE_ANON_KEY = <your_supabase_anon_key>
```

- [ ] From Supabase Settings > API > Project API Keys > anon public

- [ ] Click **Save** button
- [ ] Verify all variables are showing in the list

### Trigger Redeploy
- [ ] Go to **Deploys** section
- [ ] Click **Trigger deploy > Deploy site**
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] Verify build succeeded

## Step 3: Database Setup - Email Logs Table (10 minutes)

### Create Table in Supabase

- [ ] Log in to Supabase dashboard
- [ ] Select your BECA Assessment project
- [ ] Click **SQL Editor** (left sidebar)
- [ ] Click **New query**
- [ ] Copy entire SQL from `SQL_MIGRATIONS/email_logs_table.sql`
- [ ] Paste into query editor
- [ ] Click **Run** button
- [ ] Verify success (no errors shown)

### Verify Table Creation

- [ ] Click **Table Editor** in left sidebar
- [ ] Look for `email_logs` table in list
- [ ] Click on `email_logs` table
- [ ] Verify columns are showing:
  - [ ] id (BIGINT)
  - [ ] to_email (TEXT)
  - [ ] to_name (TEXT)
  - [ ] subject (TEXT)
  - [ ] assessment_id (UUID)
  - [ ] taker_id (UUID)
  - [ ] status (TEXT)
  - [ ] message_id (TEXT)
  - [ ] error_message (TEXT)
  - [ ] sent_at (TIMESTAMP)
  - [ ] created_at (TIMESTAMP)
  - [ ] updated_at (TIMESTAMP)

## Step 4: Verify Frontend Code Updates (5 minutes)

### Check Send Trainees Module

- [ ] Open `js/send-trainees.js`
- [ ] Verify function exists: `sendEmailToTaker()`
  - [ ] Builds assessment link with token
  - [ ] Calls Netlify function
  - [ ] Handles errors gracefully
- [ ] Verify `handleSendToTrainees()` updated
  - [ ] Calls `sendEmailToTaker()` when email enabled
  - [ ] Shows success/failure message
  - [ ] Counts sent emails
- [ ] Look for line with comment: `// Send email if enabled`
- [ ] Verify function calls: `await sendEmailToTaker(...)`

### Check Assessment Takers Module

- [ ] Open `js/assessment-takers.js`
- [ ] Verify function exists: `sendWelcomeEmailToTaker()`
  - [ ] Sends to Netlify function
  - [ ] Handles welcome email type
- [ ] Verify `handleSaveTaker()` updated
  - [ ] Calls welcome email after creating taker
  - [ ] Doesn't block on email failure
- [ ] Verify `handleSendToTaker()` updated
  - [ ] Calls `sendEmailToTaker()` for individual sends
- [ ] Check for function: `sendEmailToTaker()` at top of file

### Check Netlify Function

- [ ] File exists: `netlify/functions/send-email.js`
- [ ] Verify file size is ~400 lines or more
- [ ] Open file and check for:
  - [ ] `generateAssessmentInvitationHTML()` function
  - [ ] `generateWelcomeEmailHTML()` function
  - [ ] `sendAssessmentInvitation()` function
  - [ ] `sendWelcomeEmail()` function
  - [ ] `exports.handler` function (Netlify entry point)
  - [ ] SendGrid initialization: `sgMail.setApiKey()`
  - [ ] Email logging to Supabase

## Step 5: Test Email Function (15 minutes)

### Test 1: Direct Function Call via Terminal

- [ ] Open terminal/command prompt
- [ ] Run curl command to test:

```bash
curl -X POST https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "assessment_invitation",
    "to_email": "YOUR_TEST_EMAIL@example.com",
    "to_name": "Test User",
    "assessment_name": "Test Assessment",
    "duration": 60,
    "pass_score": 70,
    "assessment_link": "https://your-site.netlify.app/?token=test123",
    "token": "test123"
  }'
```

- [ ] Replace `YOUR-NETLIFY-SITE` with your actual Netlify domain
- [ ] Replace `YOUR_TEST_EMAIL@example.com` with your test email
- [ ] Verify response shows `"success": true`
- [ ] Check test email inbox within 2 minutes
- [ ] Verify email received with correct content

### Test 2: Via Supabase Email Logs

- [ ] Go to Supabase dashboard
- [ ] Click **Table Editor**
- [ ] Click **email_logs** table
- [ ] Verify new row shows with:
  - [ ] `to_email`: Your test email
  - [ ] `status`: "sent"
  - [ ] `message_id`: Not null
  - [ ] `sent_at`: Current timestamp

### Test 3: Via Netlify Function Logs

- [ ] Go to Netlify dashboard
- [ ] Click **Functions**
- [ ] Click **send-email** function
- [ ] View **Recent invocations**
- [ ] Click the most recent invocation
- [ ] Verify logs show:
  - [ ] "Email sent successfully"
  - [ ] Message ID in response
  - [ ] No error messages

## Step 6: Test Via Application UI (20 minutes)

### Test Adding New Taker (Welcome Email)

- [ ] Open BECA Assessment Platform in browser
- [ ] Log in as admin
- [ ] Go to **Assessment Takers** page
- [ ] Click **Add Taker** button
- [ ] Fill form:
  - [ ] Email: `test-taker-1@example.com`
  - [ ] Full Name: `Test Trainee 1`
  - [ ] Department: `Test Department`
- [ ] Click **Add Taker**
- [ ] Verify success message shows
- [ ] Check test email for welcome email
  - [ ] Subject: "Welcome to BECA-Skill Assessment Platform"
  - [ ] Contains dashboard link
- [ ] Verify email_logs table shows new entry:
  - [ ] `status`: "sent"
  - [ ] `email_type`: "welcome"

### Test Sending Assessment (Invitation Email)

- [ ] Go to **Send Assessment to Trainees** page
- [ ] Select an assessment from dropdown
- [ ] Check the trainee you just created
- [ ] Enable **Send email notification**
- [ ] Click **Send to Selected Trainees**
- [ ] Verify success message shows
  - [ ] "Assessment sent to X out of X trainee(s)"
  - [ ] "Emails: X sent"
- [ ] Check test email for assessment invitation
  - [ ] Subject: "Assessment Invitation - [Assessment Name]"
  - [ ] Shows assessment details
  - [ ] Contains clickable assessment link
  - [ ] Shows access token
- [ ] Verify email_logs table shows new entry:
  - [ ] `status`: "sent"
  - [ ] `assessment_id`: Correct ID
  - [ ] `taker_id`: Correct ID
  - [ ] `message_id`: Not null

### Test Individual Taker Send

- [ ] Go to **Assessment Takers** page
- [ ] Find the test trainee
- [ ] Click **Send** button on trainee card
- [ ] Fill modal:
  - [ ] Select an assessment
  - [ ] Check "Send Email Notification"
- [ ] Click **Send Assessment**
- [ ] Verify success message
- [ ] Check test email for invitation
- [ ] Verify email_logs entry created

## Step 7: Test Error Handling (10 minutes)

### Test Invalid Email

- [ ] Use curl to send to invalid email:

```bash
curl -X POST https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "assessment_invitation",
    "to_email": "invalid-email",
    "to_name": "Test",
    "assessment_name": "Test",
    "duration": 60,
    "pass_score": 70,
    "assessment_link": "https://test.com",
    "token": "test"
  }'
```

- [ ] Verify response shows error
- [ ] Check email_logs for failed status entry

### Test Missing Required Fields

- [ ] Send curl request without `token` field
- [ ] Verify error response: "Missing required fields"
- [ ] Try without `assessment_link`
- [ ] Verify error response

### Test Invalid Email Type

- [ ] Send with `"type": "invalid_type"`
- [ ] Verify error response: "Unknown email type"

## Step 8: Verify Production Configuration (5 minutes)

### Security Checks
- [ ] Confirm API key is in environment variables (not in code)
- [ ] Verify `send-email.js` doesn't log sensitive data
- [ ] Check that email addresses are validated
- [ ] Confirm CORS headers allow only necessary origins
- [ ] Verify RLS policies on email_logs table

### Performance Checks
- [ ] Test sending to 10 trainees at once
  - [ ] Should complete in under 30 seconds
  - [ ] All emails should show "sent" status
- [ ] Check email_logs for any "failed" entries
- [ ] Review Netlify function execution times

## Step 9: Documentation and Cleanup (5 minutes)

### Update Project Docs
- [ ] Add email setup to main README.md
- [ ] Document the email system features
- [ ] Add troubleshooting section
- [ ] Include cost information

### Prepare for Production
- [ ] Remove test email entries from database (optional)
- [ ] Review SendGrid API key permissions
  - [ ] Consider restricting to "Mail Send" only
- [ ] Set up SendGrid webhook for bounce/complaint handling
- [ ] Configure SendGrid usage alerts

### Create Backup
- [ ] Export email_logs table structure
- [ ] Document all configuration steps
- [ ] Save API keys securely
- [ ] Create runbook for future setup

## Troubleshooting Guide

### Email Not Appearing

**Check in order:**
1. [ ] Check spam/junk folder
2. [ ] Wait 5 minutes (can be delayed)
3. [ ] Verify email address is spelled correctly
4. [ ] Check email_logs table for status
5. [ ] Check Netlify function logs for errors
6. [ ] Verify SendGrid account email is verified
7. [ ] Try with a different recipient email
8. [ ] Contact SendGrid support

### Function Error "401 Unauthorized"

**Solutions:**
1. [ ] Verify SENDGRID_API_KEY is set in Netlify
2. [ ] Confirm API key is correct and valid
3. [ ] Check if API key was accidentally edited
4. [ ] Generate new API key and update Netlify
5. [ ] Redeploy the site

### Function Error "403 Forbidden"

**Solutions:**
1. [ ] Verify sender email is authenticated in SendGrid
2. [ ] Go to SendGrid > Settings > Sender Authentication
3. [ ] Confirm `bimacademy@djbh-global.com` shows as verified
4. [ ] If not, click link in verification email
5. [ ] Wait 15 minutes and retry

### Emails Going to Spam

**Solutions:**
1. [ ] Verify sender domain authentication (SPF/DKIM)
   - [ ] Go to SendGrid > Settings > Sender Authentication
   - [ ] Add SPF/DKIM records to DNS
2. [ ] Review email template for spam trigger words
3. [ ] Improve email reputation:
   - [ ] Ensure low bounce rate
   - [ ] Reduce unsubscribe rate
   - [ ] Get good user engagement

### Database Errors

**Solutions:**
1. [ ] Verify email_logs table exists
   - [ ] Supabase > Table Editor > Look for email_logs
2. [ ] Check RLS policies allow access
   - [ ] Supabase > Table Editor > email_logs > Policies
3. [ ] Verify Supabase credentials in .env
4. [ ] Try inserting test row manually
5. [ ] Contact Supabase support

## Success Criteria

- [ ] Test email received in inbox (not spam)
- [ ] Email contains correct assessment details
- [ ] Link in email is clickable
- [ ] Email_logs table shows "sent" status
- [ ] Netlify function logs show success
- [ ] All UI tests pass
- [ ] Error handling works correctly
- [ ] Welcome emails send on taker creation
- [ ] Assessment invitation emails send correctly
- [ ] Individual taker sends work

## Post-Implementation

### Monitor (First Week)
- [ ] Check email delivery rate daily
- [ ] Monitor Netlify function performance
- [ ] Review SendGrid analytics
- [ ] Watch for error patterns in email_logs

### Optimize (First Month)
- [ ] Analyze email open/click rates
- [ ] Improve email templates based on feedback
- [ ] Optimize function performance if needed
- [ ] Set up SendGrid webhooks for tracking

### Maintain (Ongoing)
- [ ] Monitor SendGrid account usage
- [ ] Keep API keys secure
- [ ] Update email templates seasonally
- [ ] Review and archive old email logs
- [ ] Test monthly sending

## Sign-Off

- [ ] All checklist items completed
- [ ] User acceptance testing passed
- [ ] Documentation updated
- [ ] Production deployment completed
- [ ] Monitoring configured
- [ ] Team training completed

**Completed by:** ___________________

**Date:** ___________________

**Notes:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## Quick Reference

### Key Files
- Netlify Function: `netlify/functions/send-email.js`
- Database SQL: `SQL_MIGRATIONS/email_logs_table.sql`
- Frontend Module: `js/send-trainees.js`
- Frontend Module: `js/assessment-takers.js`
- Setup Guide: `EMAIL_SETUP.md`

### Environment Variables (Netlify)
- `SENDGRID_API_KEY` - SendGrid API key
- `SENDGRID_FROM_EMAIL` - Sender email
- `SUPABASE_URL` - Supabase URL
- `SUPABASE_ANON_KEY` - Supabase key

### Test Commands
```bash
# Test email function
curl -X POST https://SITE.netlify.app/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{"type":"assessment_invitation","to_email":"test@email.com",...}'

# Check logs
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

### Common Email Types
- `assessment_invitation` - Sent when assigning assessment
- `welcome` - Sent to new trainees on registration
