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
        <div class="card-title" style="margin-bottom: 20px;">
          <i class="fas fa-paper-plane"></i> Send Assessment to Trainees
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
 * Handle send to trainees
 */
async function handleSendToTrainees(e) {
  e.preventDefault();

  try {
    const assessmentId = document.getElementById('assessmentSelect').value;
    const sendEmail = document.getElementById('sendEmail').checked;
    const emailSubject = document.getElementById('emailSubject').value;
    const emailMessage = document.getElementById('emailMessage').value;

    if (!assessmentId || selectedSendTakers.length === 0) {
      showMessage('Please select assessment and trainees', 'error');
      return;
    }

    let successCount = 0;
    for (const takerId of selectedSendTakers) {
      try {
        const token = generateToken(32);
        await createAssessmentTaker({
          assessment_id: assessmentId,
          trainee_id: takerId,
          assigned_by: currentUser?.id || 'system',
          token: token,
          status: 'assigned',
          answers: {}
        });
        successCount++;

        // TODO: Send email if enabled
        if (sendEmail) {
          // Email sending logic would go here
          console.log('Email would be sent to taker:', takerId, { subject: emailSubject, message: emailMessage });
        }
      } catch (err) {
        console.error('Error sending to taker:', err);
      }
    }

    showMessage(`Assessment sent to ${successCount} out of ${selectedSendTakers.length} trainee(s)!`, 'success');
    setTimeout(() => renderSendTrainees(), 1000);
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}
