# BECA Assessment App - Deployment Checklist

## Pre-Deployment Verification

### 1. Database Setup
- [ ] Run `DATABASE_SETUP.sql` in Supabase SQL Editor
  - Creates `assessment_takers` table
  - Creates indexes for performance
  - Sets up triggers for `updated_at` timestamp
  - Enables Row Level Security (RLS)
  - Creates helper functions

### 2. Code Verification
- [ ] Verify `index.html` contains all new functions:
  - `generateToken()` - line ~970
  - `getUrlParameter()` - line ~988
  - `validateTakerToken()` - line ~1541
  - `renderAssessmentTaker()` - line ~1556
  - `renderTakerInterface()` - line ~1619
  - `submitTakerAssessment()` - line ~1918
  - `showCompletionMessage()` - line ~1949
  - `showTakerError()` - line ~1973

### 3. Configuration Check
- [ ] Verify Supabase URL in index.html (line ~874)
- [ ] Verify Supabase API Key in index.html (line ~875)
- [ ] Confirm Supabase project has all required tables:
  - `assessments`
  - `assessment_modules`
  - `assessment_questions`
  - `assessment_takers` (new)
  - `profiles`

### 4. Styling Verification
- [ ] Confirm new CSS classes present:
  - `.taker-layout`
  - `.taker-header`
  - `.taker-content`
  - `.question-card`
  - `.taker-timer`
  - `.completion-card`
- [ ] Test responsive design on mobile (768px breakpoint)
- [ ] Verify timer color transitions (warning/critical states)

### 5. Functional Testing

#### Admin Functions
- [ ] Login works with Supabase auth
- [ ] Create assessment works
- [ ] Add modules and questions works
- [ ] Publish assessment works
- [ ] Send to trainees generates unique tokens
- [ ] Each token is unique (verify in database)
- [ ] Results page shows assessment submissions

#### Taker Functions
- [ ] Token-based URLs work: `?take=TOKEN`
- [ ] Invalid token shows error message
- [ ] Valid token loads assessment without login
- [ ] Assessment title and description display correctly
- [ ] All question types render properly:
  - MCQ with radio buttons
  - Essay with textarea
  - True/False with radio buttons
  - File Upload with file picker
- [ ] Timer displays and counts down
- [ ] Timer changes color at warnings (5 min and 1 min)
- [ ] Timer auto-submits at 0:00
- [ ] Answers are collected correctly
- [ ] Submit button works and saves answers
- [ ] Completion message appears after submit
- [ ] Database shows status transitions: assigned → started → submitted

### 6. Performance Testing
- [ ] Load assessment with 50+ questions
- [ ] Timer accuracy (should be within 1 second)
- [ ] Answer submission response time < 3 seconds
- [ ] Page load time for taker interface < 2 seconds

### 7. Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 8. Security Checklist
- [ ] Tokens are 32 characters long
- [ ] Tokens are unique per assignment
- [ ] Tokens are validated server-side (in database)
- [ ] RLS policies are enabled on `assessment_takers`
- [ ] Non-authenticated users cannot access admin functions
- [ ] Trainees cannot see other trainees' answers
- [ ] Assessment data is not exposed to non-authenticated users

### 9. API Integration
- [ ] Token validation works via `/assessment_takers?token=eq.TOKEN`
- [ ] Assessment loading works via `/assessments?id=eq.ID`
- [ ] Modules load via `/assessment_modules?assessment_id=eq.ID`
- [ ] Questions load via `/assessment_questions?module_id=eq.ID`
- [ ] Answer submission works via `PATCH /assessment_takers?id=eq.ID`

### 10. Email & Communication
- [ ] Email template includes taker URL with token
- [ ] Token in email matches database token
- [ ] Email link is properly formatted
- [ ] Token doesn't expire (or expiration is configured)
- [ ] Resend functionality works if needed

## Pre-Production Checklist

### 1. Documentation
- [ ] IMPLEMENTATION_GUIDE.md reviewed by team
- [ ] USAGE_EXAMPLES.md covers main scenarios
- [ ] DATABASE_SETUP.sql verified to work
- [ ] DEPLOYMENT_CHECKLIST.md (this file) followed

### 2. Monitoring Setup
- [ ] Error logging configured in Supabase
- [ ] Assessment submission events tracked
- [ ] Token generation logged
- [ ] Failed token validations logged

### 3. Backup & Recovery
- [ ] Database backup configured
- [ ] Backup schedule defined (daily/weekly)
- [ ] Restore procedure documented
- [ ] Test restore from backup

### 4. Performance Optimization
- [ ] Indexes created on `assessment_takers` table
- [ ] Query performance tested with many records
- [ ] Database query plans optimized
- [ ] Pagination implemented if needed

### 5. Load Testing
- [ ] Simulate 100 concurrent takers
- [ ] Simulate 1000 concurrent taker submissions
- [ ] Monitor database performance under load
- [ ] Verify no timeouts or errors

## Deployment Steps

### Step 1: Database Deployment
```bash
# In Supabase SQL Editor, run:
# Copy contents of DATABASE_SETUP.sql and execute
```

**Verification:**
```sql
-- Verify table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'assessment_takers'
);

-- Should return: true
```

### Step 2: Code Deployment
```bash
# Deploy updated index.html to your hosting (Netlify, GitHub Pages, etc.)
git add index.html
git commit -m "feat: add assessment taker interface with token-based access"
git push origin main
```

### Step 3: Configuration Verification
```javascript
// In browser console, verify:
console.log(getUrlParameter('take')); // Should return token if in URL

// Test token generation:
console.log(generateToken(32)); // Should return 32-char random string
```

### Step 4: End-to-End Test
1. Admin creates assessment
2. Admin publishes assessment
3. Admin sends to 1 test trainee
4. Copy generated token from database
5. Test URL: `https://yourapp.com/index.html?take=TOKEN`
6. Take assessment and submit
7. Verify submission appears in results
8. Check database for submitted status and answers

### Step 5: User Communication
- [ ] Notify admins of new "Send to Trainees" feature
- [ ] Provide trainees with sample email link
- [ ] Distribute USAGE_EXAMPLES.md to trainers
- [ ] Set up support channel for issues

## Post-Deployment Monitoring

### Daily Checks
- [ ] Monitor failed token validations
- [ ] Check submission error rate
- [ ] Review database size/growth
- [ ] Check for console errors in logs

### Weekly Checks
- [ ] Analyze assessment completion rates
- [ ] Review timer accuracy reports
- [ ] Check email delivery success rate
- [ ] Verify all trainees can access assessments

### Monthly Checks
- [ ] Performance analysis and optimization
- [ ] Security audit of token usage
- [ ] User feedback review
- [ ] Update documentation based on issues

## Rollback Plan

If critical issues found after deployment:

```bash
# Option 1: Revert code (if deployment failed)
git revert HEAD
git push origin main

# Option 2: Disable taker mode (quick fix)
# Comment out line ~2347 in index.html:
// takerToken = getUrlParameter('take');
```

### Database Rollback
```sql
-- If assessment_takers table has issues, remove it:
DROP TABLE IF EXISTS assessment_takers;
-- Then re-run DATABASE_SETUP.sql after fixes
```

## Issue Resolution

### Issue: Tokens Not Generating
**Cause:** `generateToken()` function not defined
**Fix:** Verify function exists in index.html (line ~970)
**Test:** `console.log(generateToken(32))`

### Issue: Token Validation Fails
**Cause:** Token not in database or typo
**Fix:** Check `assessment_takers` table for token entry
**Test:** Run SQL: `SELECT * FROM assessment_takers WHERE token = 'YOUR_TOKEN'`

### Issue: Answers Not Saving
**Cause:** RLS policy blocking INSERT/UPDATE
**Fix:** Check RLS policies in Supabase (Settings → Security)
**Test:** Run SQL: `INSERT INTO assessment_takers (...) VALUES (...)`

### Issue: Timer Not Showing
**Cause:** Duration not set in assessment
**Fix:** Edit assessment and set duration > 0 minutes
**Test:** Check assessment record in database

### Issue: Questions Not Loading
**Cause:** Module or question data missing
**Fix:** Verify modules and questions exist in database
**Test:** Check `assessment_modules` and `assessment_questions` tables

## Success Metrics

### Adoption Metrics
- [ ] Number of assessments created: _____
- [ ] Number of trainees assigned: _____
- [ ] Number of assessments completed: _____
- [ ] Completion rate (%): _____

### Performance Metrics
- [ ] Average page load time: ____ ms (target: < 2000 ms)
- [ ] Average submission time: ____ ms (target: < 3000 ms)
- [ ] Token validation time: ____ ms (target: < 500 ms)
- [ ] Timer accuracy drift: ____ ms (target: < 1000 ms)

### Quality Metrics
- [ ] Error rate (%): ____ (target: < 1%)
- [ ] User satisfaction score: ____ / 10 (target: > 8)
- [ ] Support tickets: ____ (target: < 5/week)

## Sign-Off

- [ ] Developer: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] Project Manager: _________________ Date: _______
- [ ] DevOps/Admin: _________________ Date: _______

## Notes & Additional Information

```
[Space for deployment notes, issues encountered, resolutions, etc.]

```

## Appendix: Quick Commands

### View Recent Submissions
```sql
SELECT 
  id,
  (SELECT title FROM assessments WHERE id = assessment_id) as assessment,
  status,
  submitted_at,
  answers
FROM assessment_takers
ORDER BY created_at DESC
LIMIT 10;
```

### Check Token Uniqueness
```sql
SELECT token, COUNT(*) as count
FROM assessment_takers
GROUP BY token
HAVING COUNT(*) > 1;
-- Should return no rows (all tokens unique)
```

### View Submissions by Status
```sql
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN submitted_at IS NOT NULL THEN 1 END) as submitted_count
FROM assessment_takers
GROUP BY status;
```

### Clear Test Data (if needed)
```sql
-- WARNING: This deletes data!
DELETE FROM assessment_takers 
WHERE created_at > NOW() - INTERVAL '24 hours'
AND status != 'submitted';
```
