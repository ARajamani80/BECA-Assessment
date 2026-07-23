// BECA Assessment Platform - Assessment Takers Management Module

let allAssessmentTakers = [];
let selectedTakersForSending = [];
let takersSearchTerm = '';
let takersStatusFilter = '';

/**
 * Render assessment takers management page with card UI
 */
async function renderAssessmentTakers() {
  document.getElementById('pageTitle').textContent = 'Assessment Takers';

  try {
    allAssessmentTakers = await getAssessmentTakers();

    let html = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div class="card-title" style="margin: 0;"><i class="fas fa-users"></i> Assessment Takers</div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="openAddTakerModal()">
              <i class="fas fa-plus"></i> Add Taker
            </button>
            <button class="btn btn-secondary btn-sm" onclick="openBulkUploadModal()">
              <i class="fas fa-file-csv"></i> Import CSV
            </button>
            <button class="btn btn-info btn-sm" id="exportTakersBtn" onclick="exportTakersToExcel(allAssessmentTakers)" title="Export all takers to Excel">
              <i class="fas fa-download"></i> Export
            </button>
            <button class="btn btn-secondary btn-sm" id="refreshTakersBtn" onclick="refreshTakersList()" title="Refresh takers list">
              <i class="fas fa-redo"></i> Refresh
            </button>
          </div>
        </div>

        <!-- Search and Filter -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
          <input type="text" id="takerSearch" placeholder="Search by name or email..."
                 onkeyup="filterTakers()" style="flex: 1; min-width: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <select id="takerStatusFilter" onchange="filterTakers()" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="started">Started</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div id="takersContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
          <!-- Taker cards will be rendered here -->
        </div>
      </div>
    `;

    document.getElementById('page').innerHTML = html;

    // Render taker cards
    renderTakerCards();

  } catch (error) {
    console.error('Error loading assessment takers:', error);
    showMessage('Error loading assessment takers: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error loading takers</p></div>';
  }
}

/**
 * Render taker cards
 */
function renderTakerCards() {
  const container = document.getElementById('takersContainer');
  if (!container) return;

  if (!allAssessmentTakers || allAssessmentTakers.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No assessment takers yet. Add one to get started.</div>';
    return;
  }

  let cards = '';
  allAssessmentTakers.forEach(taker => {
    const statusClass = taker.status === 'completed' ? 'badge-success' :
                       taker.status === 'started' ? 'badge-warning' : 'badge-secondary';
    const statusLabel = taker.status ? taker.status.charAt(0).toUpperCase() + taker.status.slice(1) : 'Pending';

    const createdDate = taker.created_at ? formatDate(taker.created_at) : 'N/A';
    const lastActivity = taker.updated_at ? formatDate(taker.updated_at) : 'Never';

    cards += `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div>
            <div style="font-weight: 600; color: #1e293b; font-size: 15px;">${taker.full_name || taker.email}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${taker.email}</div>
          </div>
          <span class="badge ${statusClass}">${statusLabel}</span>
        </div>

        <div style="background: #f8fafc; padding: 12px; border-radius: 4px; margin-bottom: 12px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Department:</span>
            <span style="font-weight: 500;">${taker.department || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Joined:</span>
            <span style="font-weight: 500;">${createdDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Last Activity:</span>
            <span style="font-weight: 500;">${lastActivity}</span>
          </div>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="viewTakerDetails('${taker.id}')" title="View Results">
            <i class="fas fa-chart-line"></i> View Results
          </button>
          <button class="btn btn-secondary btn-sm" onclick="sendToTaker('${taker.id}')" title="Send Assessment">
            <i class="fas fa-paper-plane"></i> Send
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteTakerConfirm('${taker.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = cards;
}

/**
 * Filter takers by search and status
 */
function filterTakers() {
  const searchTerm = document.getElementById('takerSearch').value.toLowerCase();
  const statusFilter = document.getElementById('takerStatusFilter').value;

  const filtered = allAssessmentTakers.filter(taker => {
    const matchesSearch = !searchTerm ||
      (taker.email && taker.email.toLowerCase().includes(searchTerm)) ||
      (taker.full_name && taker.full_name.toLowerCase().includes(searchTerm));

    const matchesStatus = !statusFilter || taker.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Update the display with filtered results
  const container = document.getElementById('takersContainer');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No takers match your search.</div>';
    return;
  }

  let cards = '';
  filtered.forEach(taker => {
    const statusClass = taker.status === 'completed' ? 'badge-success' :
                       taker.status === 'started' ? 'badge-warning' : 'badge-secondary';
    const statusLabel = taker.status ? taker.status.charAt(0).toUpperCase() + taker.status.slice(1) : 'Pending';

    const createdDate = taker.created_at ? formatDate(taker.created_at) : 'N/A';
    const lastActivity = taker.updated_at ? formatDate(taker.updated_at) : 'Never';

    cards += `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div>
            <div style="font-weight: 600; color: #1e293b; font-size: 15px;">${taker.full_name || taker.email}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${taker.email}</div>
          </div>
          <span class="badge ${statusClass}">${statusLabel}</span>
        </div>

        <div style="background: #f8fafc; padding: 12px; border-radius: 4px; margin-bottom: 12px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Department:</span>
            <span style="font-weight: 500;">${taker.department || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Joined:</span>
            <span style="font-weight: 500;">${createdDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Last Activity:</span>
            <span style="font-weight: 500;">${lastActivity}</span>
          </div>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="viewTakerDetails('${taker.id}')" title="View Results">
            <i class="fas fa-chart-line"></i> View Results
          </button>
          <button class="btn btn-secondary btn-sm" onclick="sendToTaker('${taker.id}')" title="Send Assessment">
            <i class="fas fa-paper-plane"></i> Send
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteTakerConfirm('${taker.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = cards;
}

/**
 * Open modal to add new taker
 */
async function openAddTakerModal() {
  try {
    console.log('👤 openAddTakerModal() called');

    document.getElementById('takerModalContent').innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">Add Assessment Taker</h2>
        <button onclick="closeModal('takerModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <form id="takerForm" onsubmit="handleSaveTaker(event)">
        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Email Address</label>
          <input type="email" id="takerEmail" required placeholder="user@example.com" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </div>

        <div class="form-group">
          <label>Full Name (Optional)</label>
          <input type="text" id="takerName" placeholder="Full name (optional)" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </div>

        <div class="form-group">
          <label>Department (Optional)</label>
          <input type="text" id="takerDepartment" placeholder="Department (optional)" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" class="btn btn-success" style="flex: 1;">
            <i class="fas fa-save"></i> Add Taker
          </button>
          <button type="button" class="btn btn-secondary" onclick="closeModal('takerModal')" style="flex: 1;">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    `;

    const result = showModal('takerModal');
    if (result) {
      console.log('✅ Add Taker modal opened successfully');
    }
    return result;
  } catch (error) {
    console.error('🔴 Error opening Add Taker Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Handle saving new taker
 */
async function handleSaveTaker(event) {
  event.preventDefault();

  try {
    console.log('💾 Saving assessment taker...');

    const email = document.getElementById('takerEmail').value;
    const fullName = document.getElementById('takerName').value;
    const department = document.getElementById('takerDepartment').value;

    if (!email) {
      showMessage('Email is required', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    // Check if taker already exists
    const existing = allAssessmentTakers.find(t => t.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      showMessage('This email is already registered', 'error');
      console.log('⚠️ Duplicate email:', email);
      return;
    }

    const takerData = {
      email: email,
      full_name: fullName || null,
      department: department || null,
      token: generateToken(32),
      created_at: new Date().toISOString()
    };

    console.log('📝 Taker data prepared:', takerData);

    await createAssessmentTaker(takerData);
    showMessage('Taker added successfully!', 'success');
    closeModal('takerModal');
    await renderAssessmentTakers();
    console.log('✅ Taker saved and view refreshed');
  } catch (error) {
    console.error('🔴 Error saving taker:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * View taker details
 */
function viewTakerDetails(takerId) {
  const taker = allAssessmentTakers.find(t => t.id === takerId);
  if (!taker) return;

  document.getElementById('viewTakerModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">${taker.full_name || taker.email}</h2>
      <button onclick="closeModal('viewTakerModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <p><strong>Email:</strong> ${taker.email}</p>
      <p><strong>Name:</strong> ${taker.full_name || '-'}</p>
      <p><strong>Status:</strong> ${taker.completed ? 'Completed' : 'Pending'}</p>
      <p><strong>Token:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 3px;">${taker.token || '-'}</code></p>
      <p><strong>Created:</strong> ${formatDateTime(taker.created_at)}</p>
    </div>

    <div style="padding-top: 20px; border-top: 1px solid #ddd; text-align: right;">
      <button class="btn btn-secondary" onclick="closeModal('viewTakerModal')">Close</button>
    </div>
  `;

  showModal('viewTakerModal');
}

/**
 * Delete taker with confirmation
 */
function deleteTakerConfirm(takerId) {
  const taker = allAssessmentTakers.find(t => t.id === takerId);
  if (!taker) return;

  if (confirm(`Delete taker "${taker.email}"?`)) {
    deleteTakerAction(takerId);
  }
}

/**
 * Delete taker action
 */
async function deleteTakerAction(takerId) {
  try {
    const client = await getSupabaseClient();
    await client.from('assessment_takers').delete().eq('id', takerId);
    showMessage('Taker deleted successfully!', 'success');
    await renderAssessmentTakers();
  } catch (error) {
    console.error('Error deleting taker:', error);
    showMessage('Error deleting taker: ' + error.message, 'error');
  }
}

/**
 * Select taker for assessment (used in send-trainees page)
 */
function selectTakerForAssessment(takerId) {
  const index = selectedTakersForSending.indexOf(takerId);
  if (index > -1) {
    selectedTakersForSending.splice(index, 1);
  } else {
    selectedTakersForSending.push(takerId);
  }
  updateTakerSelectionUI();
}

/**
 * Update taker selection UI
 */
function updateTakerSelectionUI() {
  const checkboxes = document.querySelectorAll('.taker-checkbox');
  checkboxes.forEach(cb => {
    const takerId = cb.value;
    cb.checked = selectedTakersForSending.includes(takerId);
  });

  const counter = document.getElementById('selectedTakersCount');
  if (counter) {
    counter.textContent = selectedTakersForSending.length + ' selected';
  }
}

/**
 * Get selected takers
 */
function getSelectedTakers() {
  return allAssessmentTakers.filter(t => selectedTakersForSending.includes(t.id));
}

/**
 * Open bulk upload modal
 */
async function openBulkUploadModal() {
  document.getElementById('takerModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Import Takers from CSV</h2>
      <button onclick="closeModal('takerModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <div style="background: #f0f4ff; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0;"><strong>CSV Format:</strong></p>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
        <li>Column 1: Email (required)</li>
        <li>Column 2: Full Name (optional)</li>
        <li>Column 3: Department (optional)</li>
      </ul>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">Example: user@example.com,John Doe,Sales</p>
    </div>

    <form id="bulkUploadForm" onsubmit="handleBulkUpload(event)">
      <div class="form-group">
        <label>Select CSV File *</label>
        <input type="file" id="csvFile" accept=".csv" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; box-sizing: border-box;">
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-success" style="flex: 1;">
          <i class="fas fa-upload"></i> Import
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeModal('takerModal')" style="flex: 1;">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </form>
  `;

  showModal('takerModal');
}

/**
 * Handle bulk upload from CSV
 */
async function handleBulkUpload(event) {
  event.preventDefault();

  try {
    const file = document.getElementById('csvFile').files[0];
    if (!file) {
      showMessage('Please select a file', 'error');
      return;
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    let imported = 0;
    let errors = [];

    for (const line of lines) {
      const [email, fullName, department] = line.split(',').map(s => s.trim());

      if (!email || !email.includes('@')) {
        errors.push(`Invalid email: ${email}`);
        continue;
      }

      // Check if exists
      const existing = allAssessmentTakers.find(t => t.email === email);
      if (existing) {
        errors.push(`Already exists: ${email}`);
        continue;
      }

      try {
        const takerData = {
          email: email,
          full_name: fullName || null,
          department: department || null,
          token: generateToken(32),
          created_at: new Date().toISOString()
        };

        await createAssessmentTaker(takerData);
        imported++;
      } catch (e) {
        errors.push(`Error creating: ${email} - ${e.message}`);
      }
    }

    closeModal('takerModal');
    showMessage(`Imported ${imported} taker(s)${errors.length > 0 ? '. Errors: ' + errors.length : ''}`, 'success');
    await renderAssessmentTakers();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Send assessment to taker
 */
async function sendToTaker(takerId) {
  const taker = allAssessmentTakers.find(t => t.id === takerId);
  if (!taker) return;

  try {
    const assessments = await getAssessments();

    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">Send Assessment to ${taker.full_name || taker.email}</h2>
        <button onclick="closeModal('sendTakerModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <form id="sendTakerForm" onsubmit="handleSendToTaker(event, '${takerId}')">
        <div class="form-group">
          <label>Assessment *</label>
          <select id="assessmentSelect" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="">Select Assessment</option>
    `;

    if (Array.isArray(assessments)) {
      assessments.forEach(a => {
        html += `<option value="${a.id}">${a.title || a.name}</option>`;
      });
    }

    html += `
          </select>
        </div>

        <div class="form-group">
          <label>Send Email Notification</label>
          <label style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
            <input type="checkbox" id="sendEmail" checked>
            Send email with assessment link
          </label>
        </div>

        <div class="form-group" id="emailMessageGroup" style="display: none;">
          <label>Message (Optional)</label>
          <textarea id="emailMessage" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; resize: vertical; min-height: 80px;" placeholder="Add a custom message..."></textarea>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" class="btn btn-success" style="flex: 1;">
            <i class="fas fa-paper-plane"></i> Send Assessment
          </button>
          <button type="button" class="btn btn-secondary" onclick="closeModal('sendTakerModal')" style="flex: 1;">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    `;

    document.getElementById('sendTakerModalContent').innerHTML = html;

    // Toggle email message visibility
    document.getElementById('sendEmail').addEventListener('change', function() {
      document.getElementById('emailMessageGroup').style.display = this.checked ? 'block' : 'none';
    });

    showModal('sendTakerModal');
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Handle sending assessment to taker
 */
async function handleSendToTaker(event, takerId) {
  event.preventDefault();

  try {
    const assessmentId = document.getElementById('assessmentSelect').value;
    const sendEmail = document.getElementById('sendEmail').checked;
    const message = document.getElementById('emailMessage').value;
    const taker = allAssessmentTakers.find(t => t.id === takerId);

    if (!assessmentId) {
      showMessage('Please select an assessment', 'error');
      return;
    }

    // Log assignment (in future, this would create an assessment_submission record)
    const token = generateToken(32);
    console.log('📨 Sending assessment to taker:', {
      assessment_id: assessmentId,
      taker_id: takerId,
      taker_email: taker.email,
      token: token,
      assigned_by: currentUser?.id || 'system'
    });

    // TODO: Send email if enabled
    if (sendEmail) {
      // Email sending would go here
      console.log('📧 Email would be sent to:', taker.email);
      console.log('📧 Message:', message);
    }

    closeModal('sendTakerModal');
    showMessage(`Assessment sent to ${taker.email}!`, 'success');
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Generate random token
 */
function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Refresh takers list
 */
async function refreshTakersList() {
  const btn = document.getElementById('refreshTakersBtn');
  if (!btn) return;

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

  try {
    await renderAssessmentTakers();
    showMessage('Data refreshed successfully', 'success');
  } catch (error) {
    showMessage('Error refreshing data: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}
