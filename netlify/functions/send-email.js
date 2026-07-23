// BECA Assessment Platform - Email Sending Function
// Netlify Serverless Function for sending emails via SendGrid
// Deploy: Push to GitHub, Netlify auto-deploys
// Environment Variables Required: SENDGRID_API_KEY

const sgMail = require('@sendgrid/mail');

/**
 * Configure SendGrid
 */
function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error('SENDGRID_API_KEY environment variable not set');
    throw new Error('SendGrid API key not configured');
  }
  sgMail.setApiKey(apiKey);
}

/**
 * Generate assessment invitation email HTML
 */
function generateAssessmentInvitationHTML(data) {
  const {
    takerName,
    assessmentName,
    duration,
    passScore,
    assessmentLink,
    token,
    organizationName = 'BECA-Skill Assessment Platform'
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .assessment-details {
      background-color: #f8fafc;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
    }
    .detail-value {
      color: #1e293b;
      font-weight: 600;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 12px 32px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .token-section {
      background-color: #fffbeb;
      border: 1px solid #fcd34d;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 14px;
    }
    .token-label {
      color: #92400e;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .token-value {
      background-color: white;
      padding: 10px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      word-break: break-all;
      color: #1e293b;
      font-weight: 600;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .unsubscribe {
      margin-top: 15px;
      font-size: 11px;
    }
    .divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Assessment Invitation</h1>
    </div>

    <div class="content">
      <div class="greeting">
        <p>Hi <strong>${takerName}</strong>,</p>
      </div>

      <p>You have been invited to complete the following assessment:</p>

      <div class="assessment-details">
        <div class="detail-row">
          <span class="detail-label">Assessment:</span>
          <span class="detail-value">${assessmentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pass Score:</span>
          <span class="detail-value">${passScore}%</span>
        </div>
      </div>

      <p>Click the button below to start your assessment:</p>

      <div style="text-align: center;">
        <a href="${assessmentLink}" class="cta-button">Start Assessment</a>
      </div>

      <p>Or copy and paste this link in your browser:</p>
      <p style="background-color: #f8fafc; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #64748b;">
        ${assessmentLink}
      </p>

      <div class="token-section">
        <div class="token-label">Your Access Token (keep this safe):</div>
        <div class="token-value">${token}</div>
      </div>

      <hr class="divider">

      <p style="color: #64748b; font-size: 14px;">
        <strong>Tips for success:</strong>
        <ul>
          <li>Make sure you have a stable internet connection</li>
          <li>Find a quiet place without distractions</li>
          <li>Review any provided materials before starting</li>
          <li>Read all questions carefully before answering</li>
          <li>You can save your progress and return later</li>
        </ul>
      </p>

      <p style="color: #64748b;">
        If you have any questions or technical issues, please contact your assessment administrator.
      </p>

      <p style="color: #64748b;">
        Best regards,<br>
        <strong>${organizationName}</strong><br>
        DJBH Global
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0;">
        <strong>${organizationName}</strong><br>
        DJBH Global Training & Development
      </p>
      <div class="unsubscribe">
        <p style="margin: 8px 0;">
          <a href="https://unsubscribe.example.com?email={email}">Unsubscribe from assessment emails</a>
        </p>
        <p style="margin: 0;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate welcome email HTML
 */
function generateWelcomeEmailHTML(data) {
  const {
    takerName,
    registrationLink,
    organizationName = 'BECA-Skill Assessment Platform'
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 12px 32px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ${organizationName}</h1>
    </div>

    <div class="content">
      <p>Welcome <strong>${takerName}</strong>!</p>

      <p>Thank you for registering with us. You are now ready to take skill assessments on our platform.</p>

      <p>Your registration has been completed successfully. You can now access your dashboard and view available assessments.</p>

      <div style="text-align: center;">
        <a href="${registrationLink}" class="cta-button">View Your Dashboard</a>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        <strong>What's next:</strong>
        <ul>
          <li>Complete your profile information</li>
          <li>Review available assessments</li>
          <li>Start taking assessments when you receive invitations</li>
        </ul>
      </p>

      <p style="color: #64748b;">
        If you have any questions, please reach out to our support team.
      </p>

      <p style="color: #64748b;">
        Best regards,<br>
        <strong>${organizationName}</strong>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0;">
        <strong>${organizationName}</strong><br>
        DJBH Global
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Log email send attempt to database
 */
async function logEmailSend(supabaseUrl, supabaseKey, logData) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('email_logs')
      .insert([logData]);

    if (error) {
      console.error('Error logging email:', error);
      // Don't throw - logging failure shouldn't stop email sending
    }
  } catch (error) {
    console.error('Error in logEmailSend:', error.message);
  }
}

/**
 * Send assessment invitation email
 */
async function sendAssessmentInvitation(payload) {
  try {
    const {
      to_email,
      to_name,
      assessment_name,
      duration,
      pass_score,
      assessment_link,
      token,
      assessment_id,
      taker_id,
      from_email = process.env.SENDGRID_FROM_EMAIL || 'bimacademy@djbh-global.com',
      organization_name = 'BECA-Skill Assessment Platform'
    } = payload;

    // Validate required fields
    if (!to_email || !assessment_name || !assessment_link || !token) {
      throw new Error('Missing required fields: to_email, assessment_name, assessment_link, token');
    }

    // Initialize SendGrid
    initSendGrid();

    // Generate email content
    const htmlContent = generateAssessmentInvitationHTML({
      takerName: to_name || to_email,
      assessmentName: assessment_name,
      duration: duration || 60,
      passScore: pass_score || 70,
      assessmentLink: assessment_link,
      token: token,
      organizationName: organization_name
    });

    // Prepare email message
    const msg = {
      to: to_email,
      from: from_email,
      subject: `Assessment Invitation - ${assessment_name}`,
      html: htmlContent,
      trackingSettings: {
        clickTracking: {
          enable: true
        },
        openTracking: {
          enable: true
        }
      }
    };

    // Send email
    console.log('📤 Attempting to send email with:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      apiKeyExists: !!process.env.SENDGRID_API_KEY
    });

    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully:', {
      to: to_email,
      messageId: response[0]?.headers?.['x-message-id'],
      status: response[0]?.statusCode
    });

    // Log email send
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      await logEmailSend(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        to_email: to_email,
        to_name: to_name || null,
        subject: msg.subject,
        assessment_id: assessment_id || null,
        taker_id: taker_id || null,
        status: 'sent',
        message_id: response.headers['x-message-id'] || null,
        sent_at: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: response.headers['x-message-id'],
      to: to_email
    };
  } catch (error) {
    console.error('Error sending assessment invitation:', error.message);

    // Log failure
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      await logEmailSend(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        to_email: payload.to_email,
        to_name: payload.to_name || null,
        subject: `Assessment Invitation - ${payload.assessment_name}`,
        assessment_id: payload.assessment_id || null,
        taker_id: payload.taker_id || null,
        status: 'failed',
        error_message: error.message,
        sent_at: new Date().toISOString()
      });
    }

    throw error;
  }
}

/**
 * Send welcome email to new taker
 */
async function sendWelcomeEmail(payload) {
  try {
    const {
      to_email,
      to_name,
      registration_link,
      taker_id,
      from_email = process.env.SENDGRID_FROM_EMAIL || 'bimacademy@djbh-global.com',
      organization_name = 'BECA-Skill Assessment Platform'
    } = payload;

    // Validate required fields
    if (!to_email || !registration_link) {
      throw new Error('Missing required fields: to_email, registration_link');
    }

    // Initialize SendGrid
    initSendGrid();

    // Generate email content
    const htmlContent = generateWelcomeEmailHTML({
      takerName: to_name || to_email,
      registrationLink: registration_link,
      organizationName: organization_name
    });

    // Prepare email message
    const msg = {
      to: to_email,
      from: from_email,
      subject: `Welcome to ${organization_name}`,
      html: htmlContent,
      trackingSettings: {
        clickTracking: {
          enable: true
        },
        openTracking: {
          enable: true
        }
      }
    };

    // Send email
    const [response] = await sgMail.send(msg);
    console.log('Welcome email sent successfully:', {
      to: to_email,
      messageId: response.headers['x-message-id']
    });

    // Log email send
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      await logEmailSend(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        to_email: to_email,
        to_name: to_name || null,
        subject: msg.subject,
        taker_id: taker_id || null,
        status: 'sent',
        message_id: response.headers['x-message-id'] || null,
        sent_at: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: 'Welcome email sent successfully',
      messageId: response.headers['x-message-id'],
      to: to_email
    };
  } catch (error) {
    console.error('Error sending welcome email:', error.message);

    // Log failure
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      await logEmailSend(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        to_email: payload.to_email,
        to_name: payload.to_name || null,
        subject: `Welcome to ${payload.organization_name || 'BECA'}`,
        taker_id: payload.taker_id || null,
        status: 'failed',
        error_message: error.message,
        sent_at: new Date().toISOString()
      });
    }

    throw error;
  }
}

/**
 * Netlify Handler - Main entry point
 */
exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'OK' })
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { type } = payload;

    if (!type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing email type (type field required)' })
      };
    }

    let result;

    if (type === 'assessment_invitation') {
      result = await sendAssessmentInvitation(payload);
    } else if (type === 'welcome') {
      result = await sendWelcomeEmail(payload);
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Unknown email type: ${type}` })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('❌ Error in email handler:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.body || error.response,
      fullError: JSON.stringify(error, null, 2)
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email',
        message: error.message || 'Unknown error',
        code: error.code,
        status: error.status,
        details: error.response?.body || 'No details available'
      })
    };
  }
};
