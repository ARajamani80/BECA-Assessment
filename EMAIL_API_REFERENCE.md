# Email API Reference

Complete documentation for the BECA Assessment Platform email sending API.

## Overview

The email system is implemented as a Netlify Serverless Function that handles all email operations. It uses SendGrid for reliable email delivery and Supabase for logging and tracking.

**Endpoint:** `/.netlify/functions/send-email`
**Method:** POST
**Content-Type:** application/json

## Request Format

### Basic Structure

```json
{
  "type": "assessment_invitation|welcome",
  "to_email": "recipient@example.com",
  "to_name": "Recipient Name",
  ...type-specific fields...
}
```

### Common Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Email type: `assessment_invitation` or `welcome` |
| `to_email` | string | Yes | Recipient email address |
| `to_name` | string | No | Recipient name (defaults to email) |
| `from_email` | string | No | Sender email (defaults to env var) |
| `organization_name` | string | No | Organization name in email |

## Email Types

### 1. Assessment Invitation

Sent when assigning an assessment to a trainee.

**Type:** `assessment_invitation`

**Required Fields:**
```json
{
  "type": "assessment_invitation",
  "to_email": "john@example.com",
  "to_name": "John Doe",
  "assessment_name": "AutoCAD Basics",
  "assessment_link": "https://app.example.com/?token=abc123",
  "token": "abc123",
  "duration": 60,
  "pass_score": 70
}
```

**Optional Fields:**
```json
{
  "assessment_id": "550e8400-e29b-41d4-a716-446655440000",
  "taker_id": "550e8400-e29b-41d4-a716-446655440001",
  "organization_name": "BECA-Skill Assessment Platform",
  "from_email": "bimacademy@djbh-global.com"
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `assessment_name` | string | Name of the assessment |
| `assessment_link` | string | URL for starting the assessment |
| `token` | string | Unique access token for the trainee |
| `duration` | integer | Assessment duration in minutes |
| `pass_score` | integer | Pass score percentage (0-100) |
| `assessment_id` | UUID | Assessment ID for logging |
| `taker_id` | UUID | Trainee ID for logging |

**Example Request:**
```javascript
const response = await fetch('/.netlify/functions/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'assessment_invitation',
    to_email: 'john@example.com',
    to_name: 'John Doe',
    assessment_name: 'AutoCAD Advanced',
    assessment_link: 'https://myapp.com/?token=xyz789',
    token: 'xyz789',
    duration: 120,
    pass_score: 75,
    assessment_id: '550e8400-e29b-41d4-a716-446655440000'
  })
});
```

**Email Content:**
- Subject: `Assessment Invitation - {assessment_name}`
- Contains: Assessment details, duration, pass score
- Includes: Clickable assessment link with token
- Shows: Access token for reference

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "abc123def456",
  "to": "john@example.com"
}
```

**Status Codes:**
- `200 OK` - Email sent successfully
- `400 Bad Request` - Missing required fields
- `500 Server Error` - SendGrid API error

---

### 2. Welcome Email

Sent when a new trainee is added to the system.

**Type:** `welcome`

**Required Fields:**
```json
{
  "type": "welcome",
  "to_email": "jane@example.com",
  "to_name": "Jane Smith",
  "registration_link": "https://app.example.com/#dashboard"
}
```

**Optional Fields:**
```json
{
  "taker_id": "550e8400-e29b-41d4-a716-446655440001",
  "organization_name": "BECA-Skill Assessment Platform",
  "from_email": "bimacademy@djbh-global.com"
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `registration_link` | string | URL to dashboard/registration page |
| `taker_id` | UUID | Trainee ID for logging |

**Example Request:**
```javascript
const response = await fetch('/.netlify/functions/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'welcome',
    to_email: 'jane@example.com',
    to_name: 'Jane Smith',
    registration_link: 'https://myapp.com/#dashboard',
    taker_id: '550e8400-e29b-41d4-a716-446655440001'
  })
});
```

**Email Content:**
- Subject: `Welcome to {organization_name}`
- Contains: Welcome message and setup guidance
- Includes: Dashboard link
- Shows: Next steps

**Response:**
```json
{
  "success": true,
  "message": "Welcome email sent successfully",
  "messageId": "def456ghi789",
  "to": "jane@example.com"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "type": "Error type name"
}
```

### Common Errors

#### Missing Required Field
```json
{
  "error": "Missing required fields: to_email, assessment_name, assessment_link, token",
  "message": "Missing required fields: to_email, assessment_name, assessment_link, token"
}
```
**Status:** 400

#### Invalid Email Type
```json
{
  "error": "Unknown email type: invalid_type",
  "message": "Unknown email type: invalid_type"
}
```
**Status:** 400

#### SendGrid API Error (Invalid Key)
```json
{
  "error": "Failed to send email",
  "message": "Invalid API key provided. Check API key and account status.",
  "type": "AuthenticationError"
}
```
**Status:** 500

#### SendGrid API Error (Blocked Email)
```json
{
  "error": "Failed to send email",
  "message": "The from email does not contain a valid address",
  "type": "BadRequestError"
}
```
**Status:** 500

### Error Handling in Frontend

```javascript
try {
  const response = await fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Email error:', errorData.error);
    showMessage(`Email failed: ${errorData.error}`, 'error');
    return;
  }

  const result = await response.json();
  console.log('Email sent:', result.messageId);
  showMessage('Email sent successfully!', 'success');
} catch (error) {
  console.error('Network error:', error);
  showMessage('Network error: Could not send email', 'error');
}
```

---

## Implementation Examples

### Send Assessment Invitation from Frontend

```javascript
async function sendAssessmentEmail(taker, assessment, token) {
  const baseUrl = window.location.origin;
  const assessmentLink = `${baseUrl}/?token=${token}`;

  const emailPayload = {
    type: 'assessment_invitation',
    to_email: taker.email,
    to_name: taker.full_name || taker.email,
    assessment_name: assessment.title,
    duration: assessment.duration || 60,
    pass_score: assessment.pass_score || 70,
    assessment_link: assessmentLink,
    token: token,
    assessment_id: assessment.id,
    taker_id: taker.id
  };

  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      throw new Error(`Email error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Send Bulk Emails with Rate Limiting

```javascript
async function sendBulkEmails(recipients, assessment) {
  const results = {
    sent: 0,
    failed: 0,
    errors: []
  };

  for (const recipient of recipients) {
    try {
      // Generate unique token for each recipient
      const token = generateToken(32);

      // Send email
      const result = await sendAssessmentEmail(
        recipient,
        assessment,
        token
      );

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: result.error
        });
      }

      // Rate limiting: 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: recipient.email,
        error: error.message
      });
    }
  }

  return results;
}
```

### Handle Welcome Email with Error Recovery

```javascript
async function sendWelcomeEmailSafe(taker) {
  const baseUrl = window.location.origin;
  const registrationLink = `${baseUrl}/#dashboard`;

  const emailPayload = {
    type: 'welcome',
    to_email: taker.email,
    to_name: taker.full_name,
    registration_link: registrationLink,
    taker_id: taker.id
  };

  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Welcome email sent:', result.messageId);
      // Log successful send to database
      logEmailEvent('welcome', taker.id, 'sent');
      return true;
    } else {
      const error = await response.json();
      console.warn('Welcome email failed:', error);
      // Log failed send to database
      logEmailEvent('welcome', taker.id, 'failed', error.error);
      // Don't throw - allow taker creation to continue
      return false;
    }
  } catch (error) {
    console.error('Welcome email network error:', error);
    // Log the error
    logEmailEvent('welcome', taker.id, 'failed', error.message);
    // Return false but don't throw
    return false;
  }
}
```

---

## Database Schema - Email Logs

### Table Structure

```sql
CREATE TABLE email_logs (
  id BIGSERIAL PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  assessment_id UUID,
  taker_id UUID,
  status VARCHAR(50) NOT NULL,
  message_id VARCHAR(255),
  error_message TEXT,
  email_type VARCHAR(50),
  sent_at TIMESTAMP DEFAULT now(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Status Values

| Status | Meaning | Trigger |
|--------|---------|---------|
| `sent` | Email successfully sent via SendGrid | Email sent without errors |
| `failed` | Email send failed | SendGrid API error |
| `bounced` | Email bounced (invalid address) | SendGrid webhook |
| `opened` | Email opened by recipient | SendGrid webhook |
| `clicked` | Link clicked in email | SendGrid webhook |

### Querying Email Logs

**Get recent sent emails:**
```sql
SELECT * FROM email_logs
WHERE status = 'sent'
ORDER BY sent_at DESC
LIMIT 20;
```

**Get failed emails:**
```sql
SELECT to_email, subject, error_message
FROM email_logs
WHERE status = 'failed'
ORDER BY sent_at DESC;
```

**Get email statistics by date:**
```sql
SELECT
  DATE(sent_at) as date,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened
FROM email_logs
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

**Get emails for specific assessment:**
```sql
SELECT * FROM email_logs
WHERE assessment_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY sent_at DESC;
```

---

## Email Templates

### Assessment Invitation Template

**Subject:** `Assessment Invitation - {assessment_name}`

**HTML Features:**
- Responsive design (mobile & desktop)
- Gradient header with branding
- Assessment details in styled box
- Prominent call-to-action button
- Token display section
- Unsubscribe link
- Professional footer

**Template Variables:**
- `takerName` - Recipient name
- `assessmentName` - Assessment title
- `duration` - Duration in minutes
- `passScore` - Pass score percentage
- `assessmentLink` - URL to start assessment
- `token` - Access token
- `organizationName` - Company/organization name

### Welcome Email Template

**Subject:** `Welcome to {organization_name}`

**HTML Features:**
- Friendly greeting
- Responsive layout
- Dashboard link
- Setup guidance
- Next steps
- Professional branding

**Template Variables:**
- `takerName` - Recipient name
- `registrationLink` - Dashboard URL
- `organizationName` - Company/organization name

---

## Environment Variables

### Required Variables

```
SENDGRID_API_KEY=sg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=bimacademy@djbh-global.com
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional Variables

```
NODE_ENV=production
```

---

## Security Considerations

### API Key Protection
- Never commit API keys to git
- Always use environment variables
- Rotate keys periodically
- Use restricted permissions in production

### Email Validation
- Validates email format before sending
- Prevents injection attacks
- Sanitizes all template variables
- No raw user input in templates

### CORS Security
- Function accepts requests from any origin (wildcards in headers)
- Consider restricting to your domain in production:
  ```javascript
  headers['Access-Control-Allow-Origin'] = 'https://yourdomain.com';
  ```

### Rate Limiting (To Implement)
- Add per-user/per-IP rate limits
- Implement queue system for bulk sends
- Monitor SendGrid usage

---

## Performance Metrics

### Expected Response Times
- Single email: 500ms - 2 seconds
- Bulk send (10 emails): 5 - 15 seconds
- Bulk send (100 emails): 50 - 150 seconds

### SendGrid Limits
- Free tier: 100 emails/day, 5 campaigns/month
- Pro tier: Unlimited emails/month
- Rate limit: 100 requests/second

---

## Testing

### Manual Testing

```bash
# Test assessment invitation
curl -X POST https://yoursite.netlify.app/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "assessment_invitation",
    "to_email": "test@example.com",
    "to_name": "Test User",
    "assessment_name": "Test Assessment",
    "duration": 60,
    "pass_score": 70,
    "assessment_link": "https://test.com/?token=abc123",
    "token": "abc123"
  }'

# Test welcome email
curl -X POST https://yoursite.netlify.app/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to_email": "newuser@example.com",
    "to_name": "New User",
    "registration_link": "https://test.com/#dashboard"
  }'
```

### Test with Mailinator

Use [mailinator.com](https://mailinator.com) for testing:
1. Generate test email: `test-abc123@mailinator.com`
2. Send email to that address
3. Visit mailinator.com and enter the email
4. Check inbox for email

---

## Troubleshooting

### Issue: 401 Unauthorized
**Cause:** Invalid or missing API key
**Solution:** Verify SENDGRID_API_KEY in Netlify environment variables

### Issue: 403 Forbidden
**Cause:** Sender email not verified
**Solution:** Verify sender email in SendGrid dashboard

### Issue: Email not received
**Cause:** Multiple possibilities
**Solutions:**
1. Check email_logs table for status
2. Check Netlify function logs
3. Check spam folder
4. Try different recipient email
5. Verify SendGrid account status

### Issue: Function timeout
**Cause:** Sending too many emails at once
**Solution:** Add delays between emails or use batch processing

---

## API Rate Limits

| Operation | Limit | Notes |
|-----------|-------|-------|
| Requests per second | 10 | Per Netlify function instance |
| Emails per minute | 60 | SafeSender default |
| Emails per day | 100 | SendGrid free tier |
| Database inserts | Unlimited | Per RLS policy |

---

## Support and Resources

- **SendGrid Docs:** https://docs.sendgrid.com/
- **Netlify Functions:** https://docs.netlify.com/functions/overview
- **Supabase Docs:** https://supabase.com/docs/
- **Email Best Practices:** https://sendgrid.com/resource/email-best-practices

---

## Version History

### v1.0 (2026-07-23)
- Initial release
- Assessment invitation emails
- Welcome emails
- Email logging system
- SendGrid integration
- Database schema
- Complete documentation

## Future Enhancements

- [ ] Webhook handling for delivery events (bounces, opens, clicks)
- [ ] Email template customization UI
- [ ] Batch send optimization
- [ ] Email scheduling/delay
- [ ] Multi-language support
- [ ] A/B testing templates
- [ ] Unsubscribe management
- [ ] SMTP provider options
