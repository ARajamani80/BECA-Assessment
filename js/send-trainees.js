// BECA Assessment Platform - Send to Trainees Module

let availableTakers = [];
let selectedSendTakers = [];

/**
 * Render send to trainees page
 */
async function renderSendTrainees() {
  document.getElementById('pageTitle').textContent = 'Send Assessment to Trainees';

  try {
    const assessments = await getAssessments();
    availableTakers = await getAssessmentTakers();

    let html = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div class="card-title" style="margin: 0;"><i class="fas fa-paper-plane"></i> Send Assessment to Trainees</div>
          <button class="btn btn-secondary btn-sm" id="refreshSendTraineesBtn" onclick="refreshSendTraineesPage()" title="Refresh assessments and takers list">
            <i class="fas fa-redo"></i> Refresh
          </button>
        </div>

        <form id="sendAssessmentForm" onsubmit="handleSendToTrainees(event)">
          <!-- Step 1: Assessment Selection -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 16px;">Step 1: Select Assessment</h3>
            <select id="assessmentSelect" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
              <option value="">-- Select Assessment --</option>
    `;

    if (Array.isArray(assessments)) {
      assessments.forEach(a => {
        html += `<option value="${a.id}">${a.title || a.name}</option>`;
      });
    }

    html += `
            </select>
          </div>

          <!-- Step 2: Taker Selection -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 16px;">
              Step 2: Select Trainees
              <span id="selectedCount" style="font-size: 13px; color: #64748b; font-weight: normal; margin-left: 10px;"></span>
            </h3>

            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
              <input type="text" id="takerSearchSend" placeholder="Search by name or email..."
                     onkeyup="filterTakersForSend()" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <button type="button" class="btn btn-secondary" onclick="selectAllTakers()">Select All</button>
              <button type="button" class="btn btn-secondary" onclick="deselectAllTakers()">Deselect All</button>
            </div>

            <div id="takersListSend" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;">
              <!-- Takers will be rendered here -->
            </div>
          </div>

          <!-- Step 3: Email Configuration -->
          <div style="margin-bottom: 30px; background: #f0f7ff; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px; font-size: 16px;">Step 3: Email Notification</h3>

            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
              <input type="checkbox" id="sendEmail" checked>
              <span><strong>Send email notification to trainees</strong></span>
            </label>

            <div id="emailOptions" style="display: block;">
              <div class="form-group">
                <label>Email Subject</label>
                <input type="text" id="emailSubject" value="Assessment Assigned: Take the Assessment" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>

              <div class="form-group">
                <label>Message Body</label>
                <textarea id="emailMessage" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; resize: vertical; min-height: 80px;" placeholder="Dear trainee,

You have been assigned an assessment. Please complete it by following the link below.

Best regards,
BECA-Skill Team"></textarea>
              </div>

              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="includeDatasets">
                <span>Include dataset download links in email</span>
              </label>
            </div>
          </div>

          <!-- Summary -->
          <div style="background: #f8fafc; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0;"><strong>Summary:</strong></p>
            <p id="sendSummary" style="margin: 0; color: #64748b; font-size: 14px;">Select assessment and trainees to see summary</p>
          </div>

          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">
              <i class="fas fa-check"></i> Send to Selected Trainees
            </button>
            <button type="reset" class="btn btn-secondary" style="flex: 1;">
              <i class="fas fa-redo"></i> Reset
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('page').innerHTML = html;

    // Initialize taker list
    renderTakersForSend();

    // Set up email option toggle
    document.getElementById('sendEmail').addEventListener('change', function() {
      document.getElementById('emailOptions').style.display = this.checked ? 'block' : 'none';
    });

  } catch (error) {
    showMessage('Error loading data: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error: ' + error.message + '</p></div>';
  }
}

/**
 * Render takers list for sending
 */
function renderTakersForSend() {
  const container = document.getElementById('takersListSend');
  if (!container) return;

  if (!availableTakers || availableTakers.length === 0) {
    container.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No trainees available. Add them in Assessment Takers first.</p>';
    return;
  }

  let html = '';
  availableTakers.forEach(taker => {
    const isSelected = selectedSendTakers.includes(taker.id);
    html += `
      <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #e2e8f0; cursor: pointer;">
        <input type="checkbox" class="taker-select-send" value="${taker.id}" ${isSelected ? 'checked' : ''}
               onchange="updateSendSelection()">
        <div style="flex: 1;">
          <div style="font-weight: 500;">${taker.full_name || taker.email}</div>
          <div style="font-size: 12px; color: #64748b;">${taker.email}</div>
        </div>
        <span style="font-size: 11px; color: #94a3b8;">${taker.department || 'N/A'}</span>
      </label>
    `;
  });

  container.innerHTML = html;
}

/**
 * Filter takers for sending
 */
function filterTakersForSend() {
  const searchTerm = document.getElementById('takerSearchSend').value.toLowerCase();
  const filtered = availableTakers.filter(t =>
    (t.email && t.email.toLowerCase().includes(searchTerm)) ||
    (t.full_name && t.full_name.toLowerCase().includes(searchTerm))
  );

  const container = document.getElementById('takersListSend');
  if (!container) return;

  let html = '';
  filtered.forEach(taker => {
    const isSelected = selectedSendTakers.includes(taker.id);
    html += `
      <label style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #e2e8f0; cursor: pointer;">
        <input type="checkbox" class="taker-select-send" value="${taker.id}" ${isSelected ? 'checked' : ''}
               onchange="updateSendSelection()">
        <div style="flex: 1;">
          <div style="font-weight: 500;">${taker.full_name || taker.email}</div>
          <div style="font-size: 12px; color: #64748b;">${taker.email}</div>
        </div>
        <span style="font-size: 11px; color: #94a3b8;">${taker.department || 'N/A'}</span>
      </label>
    `;
  });

  container.innerHTML = html || '<p style="padding: 20px; text-align: center; color: #999;">No trainees match your search</p>';
}

/**
 * Update send selection
 */
function updateSendSelection() {
  selectedSendTakers = Array.from(document.querySelectorAll('.taker-select-send:checked')).map(cb => cb.value);
  document.getElementById('selectedCount').textContent = `(${selectedSendTakers.length} selected)`;
  updateSendSummary();
}

/**
 * Select all takers
 */
function selectAllTakers() {
  document.querySelectorAll('.taker-select-send').forEach(cb => cb.checked = true);
  updateSendSelection();
}

/**
 * Deselect all takers
 */
function deselectAllTakers() {
  document.querySelectorAll('.taker-select-send').forEach(cb => cb.checked = false);
  updateSendSelection();
}

/**
 * Update send summary
 */
function updateSendSummary() {
  const assessmentSelect = document.getElementById('assessmentSelect');
  const assessmentName = assessmentSelect.options[assessmentSelect.selectedIndex]?.text || 'No assessment selected';
  const takerCount = selectedSendTakers.length;
  const sendEmail = document.getElementById('sendEmail').checked;

  let summary = `Will send <strong>${assessmentName}</strong> to <strong>${takerCount}</strong> trainee(s)`;
  if (sendEmail) {
    summary += ` with email notification`;
  }
  summary += '.';

  document.getElementById('sendSummary').innerHTML = summary;
}

/**
 * Send email to taker via Netlify function
 */
async function sendEmailToTaker(takerEmail, takerName, assessmentId, assessmentName, token) {
  try {
    // Get assessment details for email
    const assessment = await getAssessment(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Build assessment link with token
    const baseUrl = window.location.origin;
    const assessmentLink = `${baseUrl}/?token=${token}`;

    // Prepare email payload
    const emailPayload = {
      type: 'assessment_invitation',
      to_email: takerEmail,
      to_name: takerName || takerEmail,
      assessment_name: assessmentName,
      duration: assessment.duration || 60,
      pass_score: assessment.pass_score || 70,
      assessment_link: assessmentLink,
      token: token,
      assessment_id: assessmentId,
      organization_name: 'BECA-Skill Assessment Platform'
    };

    console.log('Sending email via Netlify function:', emailPayload);

    // Call Netlify function
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Email send failed (${response.status})`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Handle send to trainees
 */
async function handleSendToTrainees(e) {
  e.preventDefault();

  try {
    const assessmentId = document.getElementById('assessmentSelect').value;
    const sendEmail = document.getElementById('sendEmail').checked;
    const assessmentSelect = document.getElementById('assessmentSelect');
    const assessmentName = assessmentSelect.options[assessmentSelect.selectedIndex]?.text || 'Assessment';

    if (!assessmentId || selectedSendTakers.length === 0) {
      showMessage('Please select assessment and trainees', 'error');
      return;
    }

    // Show progress
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    let successCount = 0;
    let emailSuccessCount = 0;
    let emailFailureCount = 0;
    const errors = [];

    for (const takerId of selectedSendTakers) {
      try {
        // Find taker details
        const taker = availableTakers.find(t => t.id === takerId);
        if (!taker) {
          errors.push(`Taker ${takerId} not found`);
          continue;
        }

        const token = generateToken(32);

        // Create assessment taker assignment
        await createAssessmentTaker({
          assessment_id: assessmentId,
          trainee_id: takerId,
          assigned_by: currentUser?.id || 'system',
          token: token,
          status: 'assigned',
          answers: {}
        });
        successCount++;

        // Send email if enabled
        if (sendEmail) {
          try {
            await sendEmailToTaker(
              taker.email,
              taker.full_name || taker.email,
              assessmentId,
              assessmentName,
              token
            );
            emailSuccessCount++;
            console.log('Email sent to:', taker.email);
          } catch (emailErr) {
            emailFailureCount++;
            errors.push(`Email failed for ${taker.email}: ${emailErr.message}`);
            console.error('Email send failed:', emailErr);
          }
        }
      } catch (err) {
        console.error('Error sending to taker:', err);
        errors.push(`Error assigning to ${takerId}: ${err.message}`);
      }
    }

    // Build success message
    let message = `Assessment sent to ${successCount} out of ${selectedSendTakers.length} trainee(s)`;
    if (sendEmail) {
      message += `. Emails: ${emailSuccessCount} sent`;
      if (emailFailureCount > 0) {
        message += `, ${emailFailureCount} failed`;
      }
    }
    message += '.';

    if (errors.length > 0) {
      console.error('Errors during send:', errors);
    }

    showMessage(message, emailFailureCount > 0 ? 'warning' : 'success');
    setTimeout(() => renderSendTrainees(), 1500);
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  } finally {
    // Restore button
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Send to Selected Trainees';
    }
  }
}

/**
 * Refresh send trainees page
 */
async function refreshSendTraineesPage() {
  const btn = document.getElementById('refreshSendTraineesBtn');
  if (!btn) return;

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

  try {
    await renderSendTrainees();
    showMessage('Data refreshed successfully', 'success');
  } catch (error) {
    showMessage('Error refreshing data: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}
