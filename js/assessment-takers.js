// BECA Assessment Platform - Assessment Takers Management Module

let allAssessmentTakers = [];
let selectedTakersForSending = [];

/**
 * Render assessment takers management page
 */
async function renderAssessmentTakers() {
  document.getElementById('pageTitle').textContent = 'Assessment Takers';

  try {
    allAssessmentTakers = await getAssessmentTakers();

    let html = `
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fas fa-users"></i> Assessment Takers</span>
          <button class="btn btn-primary btn-sm" onclick="openAddTakerModal()">
            <i class="fas fa-plus"></i> Add Taker
          </button>
        </div>
    `;

    if (!allAssessmentTakers || allAssessmentTakers.length === 0) {
      html += '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">No assessment takers yet. Add one to get started.</p>';
    } else {
      html += `
        <table class="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Assessments</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="takersTableBody"></tbody>
        </table>
      `;

      const tbody = document.createElement('tbody');
      tbody.id = 'takersTableBody';

      allAssessmentTakers.forEach(taker => {
        const row = `
          <tr>
            <td><strong>${taker.email || '-'}</strong></td>
            <td>${taker.full_name || '-'}</td>
            <td>
              <span class="badge ${taker.completed ? 'badge-success' : 'badge-warning'}">
                ${taker.completed ? 'Completed' : 'Pending'}
              </span>
            </td>
            <td>${taker.assigned_assessments || 0}</td>
            <td>${taker.completed_assessments || 0}</td>
            <td>
              <button class="btn btn-sm btn-info" onclick="viewTakerDetails('${taker.id}')">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteTakerConfirm('${taker.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      document.getElementById('page').innerHTML = html.replace('</table>', '') +
        '<table class="table"><thead><tr><th>Email</th><th>Name</th><th>Status</th><th>Assessments</th><th>Submitted</th><th>Actions</th></tr></thead>' +
        tbody.innerHTML +
        '</tbody></table></div>';
    }

    html += '</div>';
    document.getElementById('page').innerHTML = html;

  } catch (error) {
    console.error('Error loading assessment takers:', error);
    showMessage('Error loading assessment takers: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error loading takers</p></div>';
  }
}

/**
 * Open modal to add new taker
 */
async function openAddTakerModal() {
  document.getElementById('takerModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Add Assessment Taker</h2>
      <button onclick="closeModal('takerModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <form id="takerForm" onsubmit="handleSaveTaker(event)">
      <div class="form-group">
        <label>Email Address *</label>
        <input type="email" id="takerEmail" required placeholder="user@example.com" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
      </div>

      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="takerName" placeholder="Full name (optional)" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
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

  showModal('takerModal');
}

/**
 * Handle saving new taker
 */
async function handleSaveTaker(event) {
  event.preventDefault();

  try {
    const email = document.getElementById('takerEmail').value;
    const fullName = document.getElementById('takerName').value;

    if (!email) {
      showMessage('Email is required', 'error');
      return;
    }

    // Check if taker already exists
    const existing = allAssessmentTakers.find(t => t.email === email);
    if (existing) {
      showMessage('This email is already registered', 'error');
      return;
    }

    const takerData = {
      email: email,
      full_name: fullName || null,
      token: generateToken(16),
      created_at: new Date().toISOString()
    };

    await createAssessmentTaker(takerData);
    showMessage('Taker added successfully!', 'success');
    closeModal('takerModal');
    await renderAssessmentTakers();
  } catch (error) {
    console.error('Error saving taker:', error);
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
