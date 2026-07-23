# BECA Assessment Platform - Email Sending Setup Guide

This guide walks you through setting up email sending functionality for the BECA Assessment Platform using SendGrid and Netlify Functions.

## Overview

The email sending system uses:
- **SendGrid** - Email delivery service (free tier: 100 emails/day)
- **Netlify Functions** - Serverless backend for sending emails
- **Supabase** - Database for logging email delivery
- **BECA-Skill Assessment Platform** - Sender domain (bimacademy@djbh-global.com)

## Quick Setup (5 minutes)

### Step 1: Create SendGrid Account

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account
3. Verify your email
4. Accept the terms and complete setup
5. You'll get a free tier account with 100 emails/day

### Step 2: Create SendGrid API Key

1. Log in to SendGrid dashboard
2. Go to **Settings > API Keys**
3. Click **Create API Key**
4. Choose **Full Access** (for development) or **Restricted Access** (for production)
5. Name it: `BECA-Assessment-Production`
6. Copy the API key (you won't be able to see it again!)

### Step 3: Add Environment Variables to Netlify

1. Go to your Netlify project dashboard
2. Click **Site settings > Build & deploy > Environment**
3. Click **Edit variables**
4. Add these environment variables:

```
SENDGRID_API_KEY=<paste_your_api_key_here>
SENDGRID_FROM_EMAIL=bimacademy@djbh-global.com
SUPABASE_URL=https://fgzqgqwlyeubudnbxsmx.supabase.co
SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

**Where to find these values:**

- `SENDGRID_API_KEY`: From Step 2 above
- `SENDGRID_FROM_EMAIL`: Your company email (bimacademy@djbh-global.com)
- `SUPABASE_URL`: From your Supabase project settings
- `SUPABASE_ANON_KEY`: From your Supabase project > Settings > API

### Step 4: Deploy to Netlify

1. Commit your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add email sending functionality"
   git push origin main
   ```

2. Netlify will automatically detect the Netlify Functions and deploy them
3. Check the Netlify build logs to confirm deployment

### Step 5: Verify Sender Email (SendGrid)

1. In SendGrid dashboard, go to **Settings > Sender Authentication**
2. Click **Verify a Single Sender**
3. Use your sender email: `bimacademy@djbh-global.com`
4. Complete the verification process (check email)
5. This allows SendGrid to send emails from your domain

## Database Setup

### Create Email Logs Table

To track email delivery and logging:

1. Go to Supabase dashboard
2. Open **SQL Editor**
3. Create a new query
4. Copy and paste the SQL from `SQL_MIGRATIONS/email_logs_table.sql`
5. Click **Run**

The table will be created with:
- Columns for email details, status, and delivery tracking
- Indexes for fast queries
- RLS policies for security
- Views for analytics

## Testing

### Test 1: Send Test Email via Netlify Function

Use this curl command to test your setup:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "assessment_invitation",
    "to_email": "test@example.com",
    "to_name": "John Doe",
    "assessment_name": "AutoCAD Basics",
    "duration": 60,
    "pass_score": 70,
    "assessment_link": "https://your-site.netlify.app/?token=abc123",
    "token": "abc123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "..."
}
```

### Test 2: Send Assessment Invitation via UI

1. Log in to the BECA platform
2. Go to **Send Assessment to Trainees**
3. Select an assessment
4. Select some trainees
5. Check **Send email notification**
6. Click **Send to Selected Trainees**
7. Watch the console for debug logs
8. Check your test email account

### Test 3: Check Email Logs in Database

```sql
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

## Features

### Email Types

#### 1. Assessment Invitation Email
Sent when assigning an assessment to a trainee.

**When triggered:**
- User selects trainees and sends assessment
- Individual trainee gets assigned an assessment

**Contains:**
- Assessment name, duration, pass score
- Clickable link to start assessment
- Access token for authentication
- Professional HTML template

**Example:**
```javascript
sendEmailToTaker(
  'john@example.com',
  'John Doe',
  'assessment-id-123',
  'AutoCAD Basics',
  'token-abc123'
);
```

#### 2. Welcome Email
Sent when a new trainee is added to the system.

**When triggered:**
- New assessment taker is created
- User provides email during registration

**Contains:**
- Welcome message
- Link to assessment dashboard
- Next steps guidance

**Example:**
```javascript
sendWelcomeEmailToTaker(
  'john@example.com',
  'John Doe'
);
```

### Email Tracking

The system automatically tracks:
- **Sent**: Email successfully sent via SendGrid
- **Failed**: Send failed with error
- **Bounced**: Email delivery failed (invalid address, etc.)
- **Opened**: Email opened by recipient (if tracking enabled)
- **Clicked**: Link clicked in email (if tracking enabled)

Access tracking data via:
```sql
SELECT * FROM email_logs WHERE status IN ('opened', 'clicked');
```

### Error Handling

The system includes robust error handling:
- Invalid email validation
- SendGrid API error handling
- Retry logic for failed sends
- Logging of all errors to database
- Graceful degradation (email failure doesn't block operations)

## Configuration

### Email Templates

Templates are generated dynamically in `netlify/functions/send-email.js`:

**Assessment Invitation Template:**
- Modern, professional design
- Responsive for mobile/desktop
- Branded with gradient colors
- Clear call-to-action button
- Token display section
- Unsubscribe link

**Welcome Email Template:**
- Warm greeting
- Setup guidance
- Dashboard link
- Next steps

### Customize Email Templates

Edit `netlify/functions/send-email.js`:

1. Find `generateAssessmentInvitationHTML()` or `generateWelcomeEmailHTML()`
2. Modify the HTML template
3. Update colors, fonts, and layout as needed
4. Commit and push to GitHub
5. Netlify will auto-redeploy

Example customization:
```javascript
// Change brand colors
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);

// Change organization name
organizationName: 'Your Company Name'

// Add custom images
<img src="https://your-cdn.com/logo.png" alt="Logo">
```

### Rate Limiting

Current implementation includes basic rate limiting:
- Processes requests sequentially
- Respects SendGrid rate limits (100/second on Pro)
- Logs all send attempts
- No built-in request throttling (implement if needed)

To add rate limiting, modify the handler:
```javascript
// Add queue for batch processing
const emailQueue = [];

async function sendEmailBatch() {
  // Process emails with delay
  for (const email of emailQueue) {
    await delay(100); // 100ms between sends
    await sendEmail(email);
  }
}
```

## Security Considerations

### API Key Protection
- Never commit API keys to git
- Use environment variables (already configured)
- Store keys securely in Netlify
- Rotate keys periodically
- Use restricted keys in production

### Email Validation
- Validates email format before sending
- Prevents injection attacks
- Sanitizes template variables
- No raw SQL in email data

### GDPR Compliance
- Unsubscribe links included in all emails
- Email logs stored for audit trail
- Users can request data deletion
- Compliant email templates

### Rate Limiting (To Implement)
- Prevent abuse by limiting emails per user
- Implement cooldown periods
- Monitor usage patterns
- Set alerts for suspicious activity

## Troubleshooting

### Issue: "SendGrid API key not configured"
**Solution:** Check that `SENDGRID_API_KEY` is set in Netlify environment variables

### Issue: "Email send failed (401)"
**Solution:** API key is invalid or expired. Generate a new one and update Netlify env vars

### Issue: "Email send failed (403 - Forbidden)"
**Solution:** Sender email not verified in SendGrid. Complete verification in SendGrid dashboard

### Issue: "Email send failed (429 - Too Many Requests)"
**Solution:** Hit SendGrid rate limit. Wait and retry, or upgrade SendGrid plan

### Issue: Emails not appearing in inbox
**Solutions:**
1. Check spam/junk folder
2. Verify sender email is authenticated
3. Check email logs table for delivery status
4. Verify recipient email is correct
5. Test with `test@mailinator.com` (public test email)

### Issue: No email logs in database
**Solutions:**
1. Check that email_logs table exists: `SELECT * FROM email_logs;`
2. Verify Supabase environment variables are correct
3. Check RLS policies allow inserts
4. Review Netlify function logs

### Checking Netlify Function Logs

1. Go to Netlify site dashboard
2. Click **Functions**
3. Click **send-email**
4. View recent invocations and logs
5. Click an invocation to see details

### Checking SendGrid Logs

1. Go to SendGrid dashboard
2. Click **Mail Send > Overview** or **Activity**
3. Search by recipient email
4. View delivery status and events
5. Click email for detailed information

## Cost Estimation

### Free Tier
- SendGrid Free: 100 emails/day, 5 campaigns/month
- Netlify Free: 125,000 function invocations/month
- Supabase Free: 200MB database
- **Cost: $0/month**

### Growth (100-1000 emails/day)
- SendGrid Pro: $29.95/month (unlimited emails)
- Netlify Pro: $19/month + invocations
- Supabase Pro: $25/month
- **Estimated Cost: $50-100/month**

## Maintenance

### Regular Tasks

**Weekly:**
- Check email delivery rate in database
- Monitor for bounce/failure patterns
- Review error logs

**Monthly:**
- Review SendGrid analytics
- Check database storage usage
- Verify email template rendering
- Test end-to-end process

**Quarterly:**
- Rotate SendGrid API keys
- Update email templates
- Review and update GDPR compliance
- Audit email performance metrics

## Advanced Configuration

### Webhooks for Delivery Events

SendGrid can send webhooks to track opens, clicks, bounces:

1. In SendGrid dashboard, go to **Settings > Mail Send Settings**
2. Enable **Event Notification**
3. Set webhook URL: `https://your-site.netlify.app/.netlify/functions/webhook-handler`
4. Subscribe to events (open, click, bounce, etc.)

Create `netlify/functions/webhook-handler.js` to process events.

### Batch Email Sending

For sending to many trainees at once:

```javascript
async function sendEmailBatch(takers, assessmentId) {
  const batchSize = 10;
  for (let i = 0; i < takers.length; i += batchSize) {
    const batch = takers.slice(i, i + batchSize);
    await Promise.all(batch.map(t => sendEmailToTaker(...)));
    await delay(1000); // 1 second between batches
  }
}
```

### Custom Domain Authentication (SPF/DKIM)

For production, authenticate your domain:

1. Add SPF record to your DNS:
   ```
   v=spf1 sendgrid.net ~all
   ```

2. Add DKIM records (SendGrid provides these)

3. Update DMARC policy

4. Verify in SendGrid dashboard

This improves email deliverability significantly.

## Support and Resources

- **SendGrid Documentation:** https://docs.sendgrid.com
- **Netlify Functions Guide:** https://docs.netlify.com/functions/overview
- **Supabase Docs:** https://supabase.com/docs
- **Email Best Practices:** https://sendgrid.com/resource/email-best-practices

## Files Created/Modified

### New Files
- `netlify/functions/send-email.js` - Email sending function
- `SQL_MIGRATIONS/email_logs_table.sql` - Database schema
- `EMAIL_SETUP.md` - This setup guide

### Modified Files
- `js/send-trainees.js` - Updated to call email function
- `js/assessment-takers.js` - Updated for welcome emails
- `netlify.toml` - (May need @sendgrid/mail dependency)

### Next Steps
1. Create SendGrid account and API key
2. Add environment variables to Netlify
3. Run SQL migration in Supabase
4. Test email sending
5. Update email templates as needed
6. Deploy to production
7. Monitor email delivery

## Changelog

### v1.0 (2026-07-23)
- Initial email sending functionality
- Assessment invitation template
- Welcome email template
- Email logging system
- Netlify function implementation
- SendGrid integration
- Documentation and setup guide
